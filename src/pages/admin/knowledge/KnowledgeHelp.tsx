import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { HelpCircle, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import KnowledgeHelpModal from "./KnowledgeHelpModal";

interface HelpArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  published: boolean;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

const KnowledgeHelp = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("help_docs")
      .select("*")
      .eq("category", "ayuda")
      .order("sort_order", { ascending: true });
    if (data) setArticles(data as HelpArticle[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    const { error } = await supabase.from("help_docs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Artículo eliminado" });
      fetchArticles();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("help_docs").update({ published }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicado" : "Despublicado" });
      fetchArticles();
    }
  };

  const openCreate = () => {
    setEditingArticle(null);
    setModalOpen(true);
  };

  const openEdit = (article: HelpArticle) => {
    setEditingArticle(article);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Conocimiento · Ayuda · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Centro de Ayuda</h1>
            <p className="text-sm text-muted-foreground mt-1">Artículos de ayuda para el equipo</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo artículo
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
              <HelpCircle className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay artículos de ayuda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Artículo</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Orden</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((article) => (
                    <tr key={article.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{article.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{article.slug}</p>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handlePublish(article.id, !article.published)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            article.published
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {article.published ? "Publicado" : "Borrador"}
                        </button>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-foreground/50">
                        {article.sort_order}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(article)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <KnowledgeHelpModal
              article={editingArticle}
              onClose={() => { setModalOpen(false); setEditingArticle(null); }}
              onSuccess={fetchArticles}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KnowledgeHelp;