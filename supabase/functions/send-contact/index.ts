const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (per instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3; // max requests per window
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

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

// Sanitize string to prevent XSS in HTML emails
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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting by IP
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again in a minute." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
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

    const { name, email, company, message } = body as Record<string, unknown>;

    // Validate types
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

    // Validate required + lengths
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
    if (!trimMessage || trimMessage.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Message is required and must be under 2000 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (trimCompany.length > 100) {
      return new Response(
        JSON.stringify({ error: "Company must be under 100 chars" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize for HTML email
    const safeName = sanitize(trimName);
    const safeEmail = sanitize(trimEmail);
    const safeCompany = sanitize(trimCompany);
    const safeMessage = sanitize(trimMessage);

    const htmlBody = `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #0B0D10; color: #ffffff; border-radius: 16px; overflow: hidden;">
        <div style="padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <table cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 12px; text-align: center; vertical-align: middle;">
                <span style="font-weight: bold; font-size: 20px; color: #ffffff;">Σ</span>
              </td>
              <td style="padding-left: 12px;">
                <span style="font-weight: bold; font-size: 18px; color: #ffffff;">Sigma</span>
                <span style="font-weight: 400; font-size: 18px; color: rgba(255,255,255,0.7);">Tecnologías</span>
              </td>
            </tr>
          </table>
        </div>
        <div style="padding: 32px;">
          <h2 style="margin: 0 0 24px; font-size: 22px; color: #ffffff;">Nuevo mensaje de contacto</h2>
          <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
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
          </table>
          <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.6);">Mensaje:</p>
            <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Sigma Tecnologías <onboarding@resend.dev>",
        to: ["arielodassotec@gmail.com"],
        subject: `Nuevo contacto: ${safeName}${safeCompany ? ` - ${safeCompany}` : ""}`,
        html: htmlBody,
        reply_to: trimEmail,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", JSON.stringify(emailData));
      throw new Error(`Resend API error [${emailResponse.status}]`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending contact email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send message" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
