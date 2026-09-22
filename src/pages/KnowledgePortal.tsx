import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, FileText, ExternalLink, Loader2, Lock, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import sigmaIsologo from "@/assets/brand/sigma-isologo-4.png.asset.json";

interface KnowledgeDoc {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  published: boolean;
  sort_order: number;
}

const KnowledgePortal = () => {
  const { t } = useTranslation();
  const { isBackoffice, loading: permsLoading } = usePermissions();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("help_docs")
      .select("*")
      .eq("published", true)
      .order("category")
      .order("sort_order", { ascending: true });
    if (data) setDocs(data as KnowledgeDoc[]);
    setLoading(false);
  };

  if (permsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-sigma-yellow" size={32} />
      </div>
    );
  }

  if (!isBackoffice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <Lock className="mx-auto text-foreground/40 mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Acceso restringido</h1>
          <p className="text-foreground/60 mb-6">El Portal Editorial es solo para personal de Sigma Tecnologías (admin/superadmin).</p>
          <div className="flex items-center justify-center gap-3 text-sm text-foreground/50">
            <UserCheck size={16} className="text-emerald-400" />
            <span>Requiere rol: admin o superadmin</span>
          </div>
        </div>
      </div>
    );
  }

  const categories = [...new Set(docs.map((d) => d.category))].sort();

  const filtered = docs.filter((d) => {
    const matchesSearch = !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.slug.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, KnowledgeDoc[]>);

  const renderContent = (content: string) => {
    return (
      <div className="prose prose-invert max-w-none text-foreground/80" dangerouslySetInnerHTML={{ __html: content }} />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Portal Editorial · Sigma Tecnologías</title>
        <meta name="description" content="Documentación técnica, guías y recursos de Sigma Tecnologías" />
      </Helmet>

      <header className="border-b border-foreground/[0.06] bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group" onClick={(e) => { e.preventDefault(); window.location.href = "/"; }}>
              <img
                src={sigmaIsologo.url}
                alt="Isologo Sigma Tecnologías"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="font-display text-xl font-bold text-foreground tracking-tight">
                Sigma<span className="font-bold text-foreground/50">Tecnologías</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-foreground/60 hover:text-foreground">Inicio</Link>
              <Link to="/servicios" className="text-sm text-foreground/60 hover:text-foreground">Servicios</Link>
              <Link to="/blog" className="text-sm text-foreground/60 hover:text-foreground">Blog</Link>
              <Link to="/nosotros" className="text-sm text-foreground/60 hover:text-foreground">Nosotros</Link>
              <Link to="/contacto" className="text-sm text-foreground/60 hover:text-foreground">Contacto</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient mb-4">Portal Editorial</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Documentación técnica, guías de implementación y recursos para equipos de desarrollo y producto.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-sigma-yellow" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="mx-auto text-foreground/20 mb-4" size={48} />
            <p className="text-lg text-foreground/60">No hay documentos disponibles</p>
            {search && <p className="text-sm text-foreground/40 mt-2">Intenta con otros términos de búsqueda</p>}
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-wrap gap-2"
              >
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === "all"
                      ? "bg-foreground text-background"
                      : "bg-foreground/[0.04] text-foreground/60 hover:bg-foreground/[0.08]"
                  }`}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-sigma-yellow/20 text-sigma-yellow border border-sigma-yellow/30"
                        : "bg-foreground/[0.04] text-foreground/60 hover:bg-foreground/[0.08]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-5 mb-8"
            >
              <div className="relative max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                <input
                  type="text"
                  placeholder="Buscar en la documentación..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                />
              </div>
            </motion.div>

            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {Object.entries(grouped).map(([category, items]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-sigma-yellow/20 flex items-center justify-center text-sigma-yellow text-sm font-bold">
                        {category.charAt(0).toUpperCase()}
                      </span>
                      {category}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((doc) => (
                        <Link
                          key={doc.id}
                          to={`/knowledge/${doc.slug}`}
                          className="glass-card rounded-xl p-5 hover:bg-foreground/[0.04] border border-foreground/[0.06] transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <FileText className="text-sigma-blue mt-0.5" size={20} />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-foreground group-hover:text-sigma-yellow transition-colors">
                                {doc.title}
                              </h3>
                              <p className="text-sm text-foreground/50 line-clamp-2 mt-1">
                                {doc.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-xs text-foreground/40">{category}</span>
                            <ExternalLink className="text-foreground/30 group-hover:text-sigma-yellow transition-colors" size={14} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </main>

      <footer className="border-t border-foreground/[0.06] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-foreground/40">
          <p>Sigma Tecnologías · Portal Editorial</p>
        </div>
      </footer>
    </div>
  );
};

export default KnowledgePortal;