import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, HelpCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import FaqModal from "./FaqModal";

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const ContentFaqs = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("faqs")
      .select("*")
      .order("category")
      .order("sort_order", { ascending: true });
    if (data) setFaqs(data as FAQ[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const filtered = faqs.filter((f) =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const POSTS_PER_PAGE = 10;
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta FAQ?")) return;
    const { error } = await supabase.from("faqs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "FAQ eliminada" });
      fetchFaqs();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("faqs").update({ published }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicada" : "Despublicada" });
      fetchFaqs();
    }
  };

  const openCreate = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const categories = [...new Set(faqs.map((f) => f.category))].sort();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · FAQs · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">FAQs</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona las preguntas frecuentes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nueva FAQ
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
              placeholder="Buscar FAQs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
              <p className="text-lg">No hay FAQs</p>
              <p className="text-sm mt-1">Crea la primera pregunta frecuente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Pregunta</th>
                    <th className="p-4 hidden md:table-cell">Categoría</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Orden</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground line-clamp-1 max-w-md">{item.question}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-foreground/[0.05] text-foreground/70">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handlePublish(item.id, !item.published)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.published
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {item.published ? "Publicada" : "Borrador"}
                        </button>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-foreground/50">
                        {item.sort_order}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.04]">
                <span className="text-sm text-foreground/50">
                  Página {currentPage} de {totalPages} · {filtered.length} FAQs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <FaqModal
              faq={editingFaq}
              categories={categories}
              onClose={() => { setModalOpen(false); setEditingFaq(null); }}
              onSuccess={fetchFaqs}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentFaqs;