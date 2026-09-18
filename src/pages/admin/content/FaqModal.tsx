import { useEffect, useState, FormEvent } from "react";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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

interface FaqModalProps {
  faq: FAQ | null;
  categories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const FaqModal = ({ faq, categories, onClose, onSuccess }: FaqModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "general",
    question: "",
    answer: "",
    published: false,
    sort_order: 0,
  });

  useEffect(() => {
    if (faq) {
      setFormData({
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
        published: faq.published,
        sort_order: faq.sort_order,
      });
    } else {
      setFormData({
        category: "general",
        question: "",
        answer: "",
        published: false,
        sort_order: 0,
      });
    }
  }, [faq]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      category: formData.category.trim() || "general",
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      published: formData.published,
      sort_order: formData.sort_order,
    };

    try {
      if (faq) {
        const { error } = await supabase.from("faqs").update(payload).eq("id", faq.id);
        if (error) throw error;
        toast({ title: "FAQ actualizada" });
      } else {
        const { error } = await supabase.from("faqs").insert(payload);
        if (error) throw error;
        toast({ title: "FAQ creada" });
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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {faq ? "Editar FAQ" : "Nueva FAQ"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Pregunta *</label>
              <input
                type="text"
                required
                maxLength={300}
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="¿Cuál es la pregunta?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Respuesta *</label>
              <textarea
                required
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={6}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Respuesta completa..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Orden</label>
                <input
                  type="number"
                  min={0}
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
                  <span className="text-sm font-medium text-foreground">Publicada</span>
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
                  faq ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FaqModal;