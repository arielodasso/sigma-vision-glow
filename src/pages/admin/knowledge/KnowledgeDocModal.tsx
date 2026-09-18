import { useEffect, useState, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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

interface KnowledgeDocModalProps {
  doc: KnowledgeDoc | null;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const KnowledgeDocModal = ({ doc, categories, onClose, onSuccess }: KnowledgeDocModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "manual",
    content: "",
    published: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (doc) {
      setFormData({
        title: doc.title,
        slug: doc.slug,
        category: doc.category,
        content: doc.content,
        published: doc.published,
        sort_order: doc.sort_order,
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        category: "manual",
        content: "",
        published: false,
        sort_order: 0,
      });
    }
  }, [doc]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      category: formData.category.trim() || "manual",
      content: formData.content.trim(),
      published: formData.published,
      sort_order: formData.sort_order,
    };

    try {
      if (doc) {
        const { error } = await supabase.from("help_docs").update(payload).eq("id", doc.id);
        if (error) throw error;
        toast({ title: "Documento actualizado" });
      } else {
        const { error } = await supabase.from("help_docs").insert(payload);
        if (error) throw error;
        toast({ title: "Documento creado" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {doc ? "Editar documento" : "Nuevo documento"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Título *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Título del documento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="nombre-del-documento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="nueva">+ Nueva categoría...</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Contenido (Markdown/HTML) *</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={20}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none font-mono text-xs"
                placeholder="# Título\n\nContenido del documento..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
                  />
                  <span className="text-sm font-medium text-foreground">Publicado</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-foreground/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  doc ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KnowledgeDocModal;