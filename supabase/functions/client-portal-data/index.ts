import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = new URL(req.url).searchParams.get("token") ?? "";
    if (!/^[A-Za-z0-9_-]{16,200}$/.test(token)) {
      return json({ error: "Enlace de portal inválido" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invite } = await supabase
      .from("client_invites")
      .select("id, client_id, expires_at, status")
      .eq("token", token)
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (!invite) return json({ error: "Enlace de portal inválido o expirado" }, 404);
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return json({ error: "Este enlace de portal ha expirado" }, 410);
    }

    const { data: client } = await supabase
      .from("clients")
      .select("id, name, company, email, portal_enabled")
      .eq("id", invite.client_id)
      .maybeSingle();

    if (!client) return json({ error: "No se encontró información del cliente" }, 404);

    const [{ data: budgets }, { data: documents }] = await Promise.all([
      supabase
        .from("budgets")
        .select("id, slug, client_name, status, development_cost, monthly_maintenance_cost, created_at")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("id, name, description, mime_type, size_bytes, created_at, url, path")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false }),
    ]);

    if (invite.status === "pending") {
      await supabase
        .from("client_invites")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invite.id);
    }

    return json({ client, budgets: budgets ?? [], documents: documents ?? [] });
  } catch (e) {
    console.error("[client-portal-data]", e);
    return json({ error: "Error interno" }, 500);
  }
});
