// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://www.sigmatecnologiasarg.com";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://qxkeungqbgaytxdfhccn.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4a2V1bmdxYmdheXR4ZGZoY2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NTY3MjcsImV4cCI6MjA4ODIzMjcyN30.-QCXUrmYkU_gSsDbMbIWrMb36nLkrxpBsyMK6xIaG9Y";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/servicios", changefreq: "weekly", priority: "0.9" },
  { path: "/nosotros", changefreq: "monthly", priority: "0.8" },
  { path: "/contacto", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "daily", priority: "0.9" },
  { path: "/academy", changefreq: "monthly", priority: "0.7" },
  { path: "/academy/guias", changefreq: "monthly", priority: "0.6" },
  { path: "/academy/videos", changefreq: "monthly", priority: "0.6" },
  { path: "/academy/plantillas", changefreq: "monthly", priority: "0.6" },
  { path: "/academy/casos-de-uso", changefreq: "monthly", priority: "0.6" },
  { path: "/academy/avanzado", changefreq: "monthly", priority: "0.6" },
];

async function fetchPosts(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,published_at&published=eq.true&order=published_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!res.ok) {
      console.warn(`sitemap: could not fetch posts [${res.status}]`);
      return [];
    }
    const posts = (await res.json()) as {
      slug: string;
      updated_at: string | null;
      published_at: string | null;
    }[];
    return posts.map((p) => {
      const source = p.updated_at || p.published_at;
      return {
        path: `/blog/${p.slug}`,
        lastmod: source ? String(source).split("T")[0] : undefined,
        changefreq: "monthly" as const,
        priority: "0.7",
      };
    });
  } catch (err) {
    console.warn("sitemap: post fetch failed", err);
    return [];
  }
}

async function fetchServices(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at&published=eq.true&related_service=not.is.null&order=updated_at.desc`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } },
    );
    if (!res.ok) return [];
    const posts = (await res.json()) as { slug: string; updated_at: string | null }[];
    const serviceSlugs = new Set(posts.map((p) => p.slug));
    return Array.from(serviceSlugs).map((s) => ({
      path: `/servicios/${s}`,
      changefreq: "monthly" as const,
      priority: "0.8",
    }));
  } catch {
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

const entries = [...staticEntries, ...(await fetchPosts()), ...(await fetchServices())];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
