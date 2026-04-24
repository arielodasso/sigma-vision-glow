import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// In-memory rate limiter (per instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

function sanitize(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Try sending via Resend with retries and fallback `from`
async function sendViaResend(payload: Record<string, unknown>, apiKey: string) {
  const FROM_PRIMARY = "Sigma Tecnologías <contacto@sigmatecnologiasarg.com>";
  const attempts: Array<{ attempt: number; status: number; error?: string; messageId?: string }> = [];

  // Strategy: 3 attempts with primary `from` (domain verified in Resend).
  for (let attempt = 1; attempt <= 3; attempt++) {
    const fromValue = FROM_PRIMARY;
    const body = { ...payload, from: fromValue };

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok) {
        attempts.push({ attempt, status: resp.status, messageId: (data as { id?: string }).id });
        return { ok: true, attempts, data };
      }

      const errMsg = typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${resp.status}`;
      attempts.push({ attempt, status: resp.status, error: errMsg });
      console.error(`[send-contact] Resend attempt ${attempt} failed (from=${fromValue}):`, errMsg);

      // Backoff between attempts
      if (attempt < 3) await sleep(300 * attempt);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown";
      attempts.push({ attempt, status: 0, error: msg });
      console.error(`[send-contact] Network error attempt ${attempt}:`, msg);
      if (attempt < 3) await sleep(300 * attempt);
    }
  }

  return { ok: false, attempts, data: null };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Supabase admin client (for logging — uses service role)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let submissionId: string | null = null;
  let isFormSubmission = false;

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[send-contact] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, email, company, message, subject, to, cc, attachments, skipDefaultRecipients } = body as Record<string, unknown>;

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid field types" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimName = name.trim();
    const trimEmail = email.trim();
    const trimCompany = typeof company === "string" ? company.trim() : "";
    const trimMessage = message.trim();
    const trimSubject = typeof subject === "string" ? subject.trim().slice(0, 200) : "";

    if (!trimName || trimName.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name is required and must be under 100 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!isValidEmail(trimEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!trimMessage || trimMessage.length > 4000) {
      return new Response(
        JSON.stringify({ error: "Message is required and must be under 4000 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (trimCompany.length > 100) {
      return new Response(
        JSON.stringify({ error: "Company must be under 100 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeName = sanitize(trimName);
    const safeEmail = sanitize(trimEmail);
    const safeCompany = sanitize(trimCompany);
    const safeMessage = sanitize(trimMessage);

    const DEFAULT_TO = ["arielodassotec@gmail.com", "info@sigmatecnologiasarg.com"];
    let toList: string[] = DEFAULT_TO;
    let ccList: string[] = [];

    if (typeof to === "string" && isValidEmail(to.trim())) {
      toList = [to.trim()];
    }
    if (Array.isArray(cc)) {
      ccList = (cc as unknown[])
        .filter((v): v is string => typeof v === "string" && isValidEmail(v.trim()))
        .map((v) => v.trim())
        .slice(0, 5);
    }
    if (toList[0] !== DEFAULT_TO[0] && ccList.length === 0) {
      ccList = [...DEFAULT_TO];
    }

    const isClientNotice = trimSubject.length > 0 && toList[0] !== DEFAULT_TO[0];
    isFormSubmission = !isClientNotice;

    // Persist contact form submissions to DB (only the public website form)
    if (isFormSubmission) {
      const { data: insertData, error: insertError } = await supabase
        .from("contact_submissions")
        .insert({
          name: trimName,
          email: trimEmail,
          company: trimCompany || null,
          message: trimMessage,
          status: "pending",
          user_agent: userAgent.slice(0, 500),
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("[send-contact] Failed to log submission:", insertError);
      } else {
        submissionId = insertData?.id ?? null;
      }
    }

    const headerTitle = isClientNotice ? "Sigma Tecnologías" : "Nuevo mensaje de contacto";

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0D10; color: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span style="font-weight: bold; font-size: 18px; color: #ffffff;">Sigma</span>
          <span style="font-weight: 400; font-size: 18px; color: rgba(255,255,255,0.7);">Tecnologías</span>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 24px; font-size: 22px; color: #ffffff;">${sanitize(headerTitle)}</h2>
          ${
            isClientNotice
              ? ""
              : `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
            <tr>
              <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px; width: 100px;">Nombre:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #ffffff;">${safeEmail}</a></td>
            </tr>
            ${safeCompany ? `<tr>
              <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Empresa:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${safeCompany}</td>
            </tr>` : ""}
          </table>`
          }
          <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      </div>
    `;

    const finalSubject = trimSubject ||
      `Nuevo contacto: ${trimName}${trimCompany ? ` - ${trimCompany}` : ""}`;

    const emailPayload: Record<string, unknown> = {
      to: toList,
      subject: finalSubject,
      html: htmlBody,
      reply_to: trimEmail,
    };
    if (ccList.length > 0) emailPayload.cc = ccList;

    const result = await sendViaResend(emailPayload, RESEND_API_KEY);

    // Update DB with outcome
    if (submissionId) {
      const lastAttempt = result.attempts[result.attempts.length - 1];
      await supabase
        .from("contact_submissions")
        .update({
          status: result.ok ? "sent" : "failed",
          attempts: result.attempts.length,
          error_message: result.ok ? null : (lastAttempt?.error ?? "Unknown error"),
          resend_message_ids: result.attempts
            .filter((a) => a.messageId)
            .map((a) => a.messageId),
        })
        .eq("id", submissionId);
    }

    if (!result.ok) {
      const lastAttempt = result.attempts[result.attempts.length - 1];
      console.error("[send-contact] All attempts failed. Last error:", lastAttempt?.error);
      return new Response(
        JSON.stringify({
          error: "Failed to send message",
          submissionId,
          attempts: result.attempts.length,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-contact] Sent successfully after ${result.attempts.length} attempt(s). To:`, toList);

    return new Response(
      JSON.stringify({ success: true, submissionId, attempts: result.attempts.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[send-contact] Unhandled error:", msg);

    if (submissionId) {
      await supabase
        .from("contact_submissions")
        .update({ status: "failed", error_message: msg })
        .eq("id", submissionId);
    }

    return new Response(
      JSON.stringify({ error: "Failed to send message", submissionId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
