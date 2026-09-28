import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_ROLES = ["user", "empleado", "moderator", "admin", "superadmin"];
const BACKOFFICE_ROLES = ["superadmin", "admin"];

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function friendlyAuthError(message: string, email: string): { error: string; status: number } {
  const lower = message.toLowerCase();

  if (lower.includes("already") && (lower.includes("registered") || lower.includes("been registered") || lower.includes("exists"))) {
    return { error: `Ya existe un usuario con el email ${email}. Editalo desde el directorio o usá la invitación.`, status: 409 };
  }
  if (lower.includes("email address") && lower.includes("invalid")) {
    return { error: "El email no tiene un formato válido.", status: 400 };
  }
  if (lower.includes("password")) {
    return { error: "La contraseña no cumple los requisitos de seguridad.", status: 400 };
  }
  if (lower.includes("user not allowed") || lower.includes("not_admin")) {
    return { error: "Permisos insuficientes para crear usuarios.", status: 403 };
  }
  return { error: message, status: 400 };
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

    const { data: callerRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", BACKOFFICE_ROLES);

    if (rolesError) {
      console.error("[team-create-user] no se pudieron leer los roles:", rolesError.message);
      return json({ error: "No se pudo verificar el permiso del solicitante" }, 500);
    }

    if (!callerRoles || callerRoles.length === 0) {
      return json({ error: "Solo superadmin/admin pueden crear miembros del equipo" }, 403);
    }

    const isSuperAdmin = callerRoles.some((r) => r.role === "superadmin");

    const body = await req.json();

    const email = (clean(body.email) || "").toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = clean(body.full_name);
    const title = clean(body.title);
    const phone = clean(body.phone);
    const whatsapp = clean(body.whatsapp);
    const avatarUrl = clean(body.avatar_url);
    const managerId = clean(body.manager_id);
    const active = body.active === undefined ? true : Boolean(body.active);

    const requestedRoles: string[] = Array.isArray(body.roles)
      ? [...new Set<string>(body.roles.filter((r: unknown): r is string => typeof r === "string"))]
      : [];

    if (!isValidEmail(email)) {
      return json({ error: "Email inválido" }, 400);
    }
    if (password.length < 8) {
      return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
    }
    if (!fullName) {
      return json({ error: "El nombre completo es obligatorio" }, 400);
    }
    if (requestedRoles.length === 0) {
      return json({ error: "Seleccioná al menos un rol" }, 400);
    }
    const invalidRoles = requestedRoles.filter((r) => !VALID_ROLES.includes(r));
    if (invalidRoles.length > 0) {
      return json({ error: `Rol inválido: ${invalidRoles.join(", ")}` }, 400);
    }
    if (!isSuperAdmin && requestedRoles.includes("superadmin")) {
      return json({ error: "Solo un superadmin puede asignar el rol superadmin" }, 403);
    }
    if (managerId) {
      const { data: manager } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", managerId)
        .maybeSingle();
      if (!manager) {
        return json({ error: "El manager seleccionado no existe" }, 400);
      }
    }

    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !authData?.user) {
      console.error("[team-create-user] createUser:", createError?.message);
      const { error: message, status } = friendlyAuthError(createError?.message || "No se pudo crear el usuario", email);
      return json({ error: message }, status);
    }

    const userId = authData.user.id;

    // Los triggers AFTER INSERT ON auth.users ya crean el perfil y asignan 'empleado'.
    // Por eso se hace upsert y se reemplazan los roles en lugar de insertar a ciegas.
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        title,
        phone,
        whatsapp,
        manager_id: managerId,
        active,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });

    if (profileError) {
      console.error("[team-create-user] profile upsert:", profileError.message);
      return json({ error: `Usuario creado (${email}) pero falló el perfil: ${profileError.message}` }, 500);
    }

    const { error: deleteRolesError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (deleteRolesError) {
      console.error("[team-create-user] delete roles:", deleteRolesError.message);
    } else {
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert(requestedRoles.map((role) => ({ user_id: userId, role })));

      if (roleError) {
        console.error("[team-create-user] insert roles:", roleError.message);
        return json({ error: `Usuario creado (${email}) pero fallaron los roles: ${roleError.message}` }, 500);
      }
    }

    return json({ success: true, user: { id: userId, email }, roles: requestedRoles }, 200);
  } catch (error) {
    console.error("[team-create-user] Error:", error);
    return json({ error: "Error interno" }, 500);
  }
});
