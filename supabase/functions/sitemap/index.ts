import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SERVICES = [
  { slug: "desarrollo-web", name: "Desarrollo web" },
  { slug: "desarrollo-software", name: "Desarrollo de software" },
  { slug: "desarrollo-saas", name: "SaaS y plataformas" },
  { slug: "automatizacion", name: "Automatización" },
  { slug: "inteligencia-artificial", name: "Inteligencia artificial" },
  { slug: "integraciones", name: "Integraciones" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const baseUrl = "https://www.sigmatecnologiasarg.com";

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "weekly" },
    { loc: "/contacto", priority: "0.8", changefreq: "monthly" },
    { loc: "/nosotros", priority: "0.8", changefreq: "monthly" },
    { loc: "/servicios", priority: "0.9", changefreq: "weekly" },
    { loc: "/blog", priority: "0.9", changefreq: "daily" },
    { loc: "/academy", priority: "0.7", changefreq: "monthly" },
    { loc: "/academy/guias", priority: "0.6", changefreq: "monthly" },
    { loc: "/academy/videos", priority: "0.6", changefreq: "monthly" },
    { loc: "/academy/plantillas", priority: "0.6", changefreq: "monthly" },
    { loc: "/academy/casos-de-uso", priority: "0.6", changefreq: "monthly" },
    { loc: "/academy/avanzado", priority: "0.6", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  for (const service of SERVICES) {
    xml += `
  <url>
    <loc>${baseUrl}/servicios/${service.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  if (posts) {
    for (const post of posts) {
      const source = post.updated_at || post.published_at;
      const lastmod = source ? String(source).split("T")[0] : null;
      xml += `
  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});
