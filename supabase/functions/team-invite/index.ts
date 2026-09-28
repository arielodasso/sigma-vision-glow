import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SITE_URL = "https://www.sigmatecnologiasarg.com";
const VALID_ROLES = ["user", "empleado", "moderator", "admin", "superadmin"];

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function isAllowedRedirect(candidate: string, siteUrl: string): boolean {
  try {
    return new URL(candidate).hostname === new URL(siteUrl).hostname;
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
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
      return json({ error: "No autorizado: sesión inválida o expirada" }, 401);
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["superadmin", "admin"]);

    if (!roles || roles.length === 0) {
      return json({ error: "Solo superadmin/admin pueden invitar" }, 403);
    }

    const body = await req.json();
    const { email, role = "empleado", redirectTo } = body;

    if (!email || !isValidEmail(email)) {
      return json({ error: "Email inválido" }, 400);
    }

    if (!VALID_ROLES.includes(role)) {
      return json({ error: `Rol inválido: ${role}` }, 400);
    }

    if (role === "superadmin" && !roles.some((r) => r.role === "superadmin")) {
      return json({ error: "Solo un superadmin puede invitar con rol superadmin" }, 403);
    }

    const siteUrl = Deno.env.get("SITE_URL") || DEFAULT_SITE_URL;
    const target = redirectTo || `${siteUrl}/auth/callback`;

    if (!isAllowedRedirect(target, siteUrl)) {
      return json({ error: "redirectTo no pertenece a un dominio permitido" }, 400);
    }

    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: target,
      data: { invited_by: user.email, role },
    });

    if (inviteError) {
      const lower = inviteError.message.toLowerCase();
      if (lower.includes("already") && (lower.includes("registered") || lower.includes("exists"))) {
        return json({ error: `Ya existe un usuario con el email ${email}` }, 409);
      }
      return json({ error: inviteError.message }, 400);
    }

    // inviteUserByEmail sí inserta en auth.users, así que handle_new_employee ya
    // asignó el rol por defecto ('empleado') y UNIQUE (user_id, role) rechazaría
    // un insert duplicado. Se limpia el set y se escribe el pedido.
    const { error: deleteRolesError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", inviteData.user.id);

    if (deleteRolesError) {
      console.error("[team-invite] delete roles:", deleteRolesError.message);
    }

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: inviteData.user.id, role }, { onConflict: "user_id,role" });

    if (roleError) {
      console.error("[team-invite] insert role:", roleError.message);
      return json({ error: `Invitación enviada a ${email} pero falló la asignación de rol: ${roleError.message}` }, 500);
    }

    return json({ success: true, user: inviteData.user }, 200);
  } catch (error) {
    console.error("[team-invite] Error:", error);
    return json({ error: "Error interno" }, 500);
  }
});