import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Star, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import MediaLibrary from "@/components/admin/MediaLibrary";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  image_url: string | null;
}

interface TestimonialModalProps {
  testimonial: Testimonial | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TestimonialModal = ({ testimonial, onClose, onSuccess }: TestimonialModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    rating: 5,
    published: false,
    sort_order: 0,
    image_url: "",
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        role: testimonial.role || "",
        company: testimonial.company || "",
        content: testimonial.content,
        rating: testimonial.rating || 5,
        published: testimonial.published,
        sort_order: testimonial.sort_order,
        image_url: testimonial.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        role: "",
        company: "",
        content: "",
        rating: 5,
        published: false,
        sort_order: 0,
        image_url: "",
      });
    }
  }, [testimonial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim() || null,
      company: formData.company.trim() || null,
      content: formData.content.trim(),
      rating: formData.rating,
      published: formData.published,
      sort_order: formData.sort_order,
      image_url: formData.image_url || null,
    };

    try {
      if (testimonial) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", testimonial.id);
        if (error) throw error;
        toast({ title: "Testimonio actualizado" });
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
        toast({ title: "Testimonio creado" });
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
              {testimonial ? "Editar testimonio" : "Nuevo testimonio"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Nombre *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Cargo</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="CEO, Director, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Empresa</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Contenido *</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={5}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Testimonio del cliente..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Rating</label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: i + 1 })}
                    className={`p-1 transition-colors ${
                      formData.rating >= i + 1
                        ? "text-sigma-yellow"
                        : "text-foreground/20 hover:text-sigma-yellow/50"
                    }`}
                  >
                    <Star size={24} className={formData.rating >= i + 1 ? "fill-current" : ""} />
                  </button>
                ))}
              </div>
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
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground/60 mb-2">Imagen</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="https://... o elegí de la biblioteca"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMedia(true)}
                    className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-foreground/10 text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
                  >
                    <ImageIcon size={14} />
                    Biblioteca
                  </button>
                </div>
                {formData.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-foreground/[0.08] max-w-xs">
                    <img src={formData.image_url} alt="Vista previa" loading="lazy" className="w-full aspect-square object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
              />
              <label htmlFor="published" className="text-sm font-medium text-foreground">
                Publicado
              </label>
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
                  testimonial ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>

        {showMedia && (
          <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto bg-card border border-foreground/[0.08] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">Biblioteca multimedia</h3>
                  <p className="text-xs text-foreground/40 mt-1">Elegí una imagen para el testimonio.</p>
                </div>
                <button onClick={() => setShowMedia(false)} className="text-foreground/40 hover:text-foreground">
                  <X size={18} />
                </button>
              </div>
              <MediaLibrary
                compact
                onSelect={(asset) => { setFormData({ ...formData, image_url: asset.url }); setShowMedia(false); }}
              />
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
    </AnimatePresence>
  );
};

export default TestimonialModal;