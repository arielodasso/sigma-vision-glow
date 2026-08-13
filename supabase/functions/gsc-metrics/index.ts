import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GATEWAY = "https://connector-gateway.lovable.dev/google_search_console";
const SITE_URL = "https://www.sigmatecnologiasarg.com/";

const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
const connectionApiKey = Deno.env.get("GOOGLE_SEARCH_CONSOLE_API_KEY");

const gatewayHeaders = {
  Authorization: `Bearer ${lovableApiKey}`,
  "X-Connection-Api-Key": `${connectionApiKey}`,
};

type SiteEntry = { siteUrl: string; permissionLevel?: string };

function coversTarget(siteUrl: string, target: URL) {
  if (siteUrl.startsWith("sc-domain:")) {
    const domain = siteUrl.slice("sc-domain:".length).toLowerCase();
    const host = target.hostname.toLowerCase();
    return host === domain || host.endsWith(`.${domain}`);
  }
  try {
    return target.href.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

async function gatewayFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${GATEWAY}${path}`, {
    ...init,
    headers: { ...gatewayHeaders, "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Gateway request failed [${res.status}] ${path}: ${body}`);
    throw new Error(`[${res.status}]: ${body}`);
  }
  return res.json();
}

async function resolveSiteUrl(selected?: string) {
  const { siteEntry = [] } = (await gatewayFetch("/webmasters/v3/sites")) as { siteEntry?: SiteEntry[] };
  const target = new URL(SITE_URL);
  const matches = siteEntry.filter(
    (e) => e.permissionLevel !== "siteUnverifiedUser" && coversTarget(e.siteUrl, target),
  );
  if (matches.length === 0) throw new Error("No hay una propiedad verificada de Search Console para este sitio");
  if (selected) {
    const found = matches.find((m) => m.siteUrl === selected);
    if (!found) throw new Error("La propiedad seleccionada no está verificada");
    return { status: "selected" as const, siteUrl: found.siteUrl, candidates: matches.map((m) => m.siteUrl) };
  }
  if (matches.length === 1) {
    return { status: "selected" as const, siteUrl: matches[0].siteUrl, candidates: [matches[0].siteUrl] };
  }
  return { status: "selection_required" as const, candidates: matches.map((m) => m.siteUrl) };
}

const dayString = (offsetDays: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().split("T")[0];
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!lovableApiKey || !connectionApiKey) {
      throw new Error("Faltan credenciales de Search Console");
    }

    // Require an authenticated admin
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Requiere rol de administrador" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const days = [7, 28, 90].includes(Number(body?.days)) ? Number(body.days) : 28;
    const selected = typeof body?.siteUrl === "string" ? body.siteUrl : undefined;

    const resolution = await resolveSiteUrl(selected);
    if (resolution.status === "selection_required") {
      return new Response(JSON.stringify(resolution), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = resolution.siteUrl;
    const encoded = encodeURIComponent(siteUrl);
    const range = { startDate: dayString(days + 2), endDate: dayString(2) };

    const query = (payload: Record<string, unknown>) =>
      gatewayFetch(`/webmasters/v3/sites/${encoded}/searchAnalytics/query`, {
        method: "POST",
        body: JSON.stringify({ ...range, ...payload }),
      });

    const [totals, byDate, byQuery, byPage, sitemaps] = await Promise.all([
      query({ dimensions: [] }),
      query({ dimensions: ["date"], rowLimit: 200 }),
      query({ dimensions: ["query"], rowLimit: 20 }),
      query({ dimensions: ["page"], rowLimit: 20 }),
      gatewayFetch(`/webmasters/v3/sites/${encoded}/sitemaps`).catch(() => ({ sitemap: [] })),
    ]);

    return new Response(
      JSON.stringify({
        status: "ok",
        siteUrl,
        candidates: resolution.candidates,
        range,
        days,
        totals: totals.rows?.[0] ?? null,
        byDate: byDate.rows ?? [],
        topQueries: byQuery.rows ?? [],
        topPages: byPage.rows ?? [],
        sitemaps: (sitemaps as { sitemap?: unknown[] }).sitemap ?? [],
        refreshedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = (err as Error).message;
    console.error("gsc-metrics failed:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
