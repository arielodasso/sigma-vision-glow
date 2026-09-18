import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      .in("role", ["superadmin", "admin", "moderator", "empleado"]);

    const isStaff = roles && roles.length > 0;

    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const bucket = url.searchParams.get("bucket") || "documents";
    const expiresIn = parseInt(url.searchParams.get("expires_in") || "3600", 10);

    if (!path) {
      return new Response(JSON.stringify({ error: "path requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (bucket === "documents") {
      const { data: doc } = await supabase
        .from("documents")
        .select("client_id")
        .eq("path", path)
        .single();

      if (doc?.client_id) {
        const { data: invite } = await supabase
          .from("client_invites")
          .select("id")
          .eq("client_id", doc.client_id)
          .eq("email", user.email)
          .in("status", ["pending", "accepted"])
          .single();

        const isClient = !!invite;
        if (!isStaff && !isClient) {
          return new Response(JSON.stringify({ error: "Sin acceso a este documento" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (!isStaff) {
        return new Response(JSON.stringify({ error: "Sin acceso" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else if (bucket === "media" && !isStaff) {
      return new Response(JSON.stringify({ error: "Solo staff puede acceder a media" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ signed_url: data.signedUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[docs-signed-url] Error:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});