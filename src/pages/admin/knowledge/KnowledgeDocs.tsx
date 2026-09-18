import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { FolderKanban, Plus, Search, Edit, Trash2, Loader2, Upload, Download, FileText, Eye, Link2, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import KnowledgeDocModal from "./KnowledgeDocModal";

interface KnowledgeDoc {
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

const KnowledgeDocs = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDoc | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("help_docs")
      .select("*")
      .order("category")
      .order("sort_order", { ascending: true });
    if (data) setDocs(data as KnowledgeDoc[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const filtered = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este documento?")) return;
    const { error } = await supabase.from("help_docs").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Documento eliminado" });
      fetchDocs();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("help_docs").update({ published }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicado" : "Despublicado" });
      fetchDocs();
    }
  };

  const openCreate = () => {
    setEditingDoc(null);
    setModalOpen(true);
  };

  const openEdit = (doc: KnowledgeDoc) => {
    setEditingDoc(doc);
    setModalOpen(true);
  };

  const categories = [...new Set(docs.map((d) => d.category))].sort();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Conocimiento · Documentos · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Documentos</h1>
            <p className="text-sm text-muted-foreground mt-1">Drive interno de documentación</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo documento
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
              placeholder="Buscar documentos..."
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
              <FolderKanban className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay documentos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Documento</th>
                    <th className="p-4 hidden md:table-cell">Categoría</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Orden</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{doc.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">{doc.slug}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-foreground/[0.05] text-foreground/70">
                          {doc.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handlePublish(doc.id, !doc.published)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            doc.published
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {doc.published ? "Publicado" : "Borrador"}
                        </button>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-foreground/50">
                        {doc.sort_order}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(doc)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
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
            <KnowledgeDocModal
              doc={editingDoc}
              categories={categories}
              onClose={() => { setModalOpen(false); setEditingDoc(null); }}
              onSuccess={fetchDocs}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default KnowledgeDocs;