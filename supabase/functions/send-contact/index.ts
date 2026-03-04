import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    const { name, email, company, message } = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Email:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;"><a href="mailto:${email}" style="color: #ffffff;">${email}</a></td>
            </tr>
            ${company ? `<tr>
              <td style="padding: 8px 0; color: rgba(255,255,255,0.6); font-size: 14px;">Empresa:</td>
              <td style="padding: 8px 0; color: #ffffff; font-size: 14px;">${company}</td>
            </tr>` : ""}
          </table>
          <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
            <p style="margin: 0 0 8px; font-size: 13px; color: rgba(255,255,255,0.6);">Mensaje:</p>
            <p style="margin: 0; font-size: 14px; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${message}</p>
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
        subject: `Nuevo contacto: ${name}${company ? ` - ${company}` : ""}`,
        html: htmlBody,
        reply_to: email,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", JSON.stringify(emailData));
      throw new Error(`Resend API error [${emailResponse.status}]: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error sending contact email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
