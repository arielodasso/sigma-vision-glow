import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["superadmin", "admin"]);

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Solo backoffice puede invitar clientes" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { client_id, email, expires_in_days = 7 } = body;

    if (!client_id || !email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "client_id y email válido requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("id, name, portal_enabled")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      return new Response(JSON.stringify({ error: "Cliente no encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = generateToken();
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + expires_in_days);

    const { data: invite, error: inviteError } = await supabase
      .from("client_invites")
      .insert({
        client_id,
        email,
        token,
        expires_at: expires_at.toISOString(),
        created_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      return new Response(JSON.stringify({ error: inviteError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const portalUrl = `${Deno.env.get("SITE_URL") || "https://www.sigmatecnologiasarg.com"}/portal/${token}`;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Sigma Tecnologías <contacto@sigmatecnologiasarg.com>",
          to: [email],
          subject: `Acceso al portal de ${client.name} - Sigma Tecnologías`,
          html: `
            <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0B0D10; color: #fff; border-radius: 16px; overflow: hidden;">
              <div style="padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span style="font-weight: bold; font-size: 18px; color: #fff;">Sigma</span>
                <span style="font-weight: 400; font-size: 18px; color: rgba(255,255,255,0.7);">Tecnologías</span>
              </div>
              <div style="padding: 32px;">
                <h2 style="margin: 0 0 24px; font-size: 22px; color: #fff;">Acceso a tu portal</h2>
                <p style="color: #fff; line-height: 1.6;">Hola,</p>
                <p style="color: #fff; line-height: 1.6;">Te invitamos a acceder al portal de <strong>${client.name}</strong> para ver tus presupuestos, documentos y estado de proyecto.</p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${portalUrl}" style="background: #E2FC03; color: #000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Acceder al portal</a>
                </div>
                <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Este enlace expira el ${expires_at.toLocaleDateString("es-AR")}.</p>
                <hr style="border-color: rgba(255,255,255,0.1); margin: 24px 0;">
                <p style="color: rgba(255,255,255,0.5); font-size: 12px;">Si no solicitaste esto, ignora este email.</p>
              </div>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, invite, portal_url: portalUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[client-invite] Error:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});