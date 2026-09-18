import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BarChart3, Loader2, Globe, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  related_service: string | null;
  created_at: string;
  updated_at: string;
}

interface GSCData {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const ContentSeo = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [gscData, setGscData] = useState<Record<string, GSCData>>({});
  const [loading, setLoading] = useState(true);
  const [gscLoading, setGscLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (data) setPosts(data as BlogPost[]);
    setLoading(false);
  };

  const fetchGSC = async () => {
    setGscLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gsc-metrics`, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, GSCData> = {};
        data?.urls?.forEach((u: GSCData) => { map[u.url] = u; });
        setGscData(map);
      }
    } catch (e) {
      console.error("GSC fetch error:", e);
    }
    setGscLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    fetchGSC();
  }, []);

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const getGSC = (slug: string) => {
    const base = "https://www.sigmatecnologiasarg.com";
    return gscData[`${base}/blog/${slug}`] || gscData[`${base}/servicios/${slug}`] || null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · SEO · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">SEO Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Métricas de Google Search Console</p>
          </div>
          <button
            onClick={fetchGSC}
            disabled={gscLoading}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            <Loader2 size={16} className={gscLoading ? "animate-spin" : ""} />
            Actualizar GSC
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
            <input
              type="text"
              placeholder="Buscar artículos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <BarChart3 className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay artículos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Artículo</th>
                    <th className="p-4 hidden md:table-cell">Estado</th>
                    <th className="p-4 hidden lg:table-cell">SEO Title</th>
                    <th className="p-4 hidden lg:table-cell">SEO Desc</th>
                    <th className="p-4 hidden xl:table-cell">Clics</th>
                    <th className="p-4 hidden xl:table-cell">Impresiones</th>
                    <th className="p-4 hidden xl:table-cell">CTR</th>
                    <th className="p-4 hidden xl:table-cell">Posición</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((post) => {
                    const gsc = getGSC(post.slug);
                    return (
                      <tr key={post.id} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            /blog/{post.slug}
                          </p>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            post.published
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {post.published ? "Publicado" : "Borrador"}
                          </span>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <p className="text-sm text-foreground/70 max-w-xs truncate">
                            {post.seo_title || "—"}
                          </p>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <p className="text-sm text-foreground/50 max-w-xs truncate">
                            {post.seo_description || "—"}
                          </p>
                        </td>
                        <td className="p-4 hidden xl:table-cell text-sm text-foreground/70">
                          {gsc ? gsc.clicks.toLocaleString() : "—"}
                        </td>
                        <td className="p-4 hidden xl:table-cell text-sm text-foreground/70">
                          {gsc ? gsc.impressions.toLocaleString() : "—"}
                        </td>
                        <td className="p-4 hidden xl:table-cell text-sm text-foreground/70">
                          {gsc ? `${(gsc.ctr * 100).toFixed(2)}%` : "—"}
                        </td>
                        <td className="p-4 hidden xl:table-cell text-sm text-foreground/70">
                          {gsc ? gsc.position.toFixed(1) : "—"}
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://www.sigmatecnologiasarg.com/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                          >
                            <Globe size={12} />
                            Ver
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ContentSeo;