import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Image, Globe, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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

interface Service {
  slug: string;
  name: string;
}

interface BlogPostModalProps {
  post: BlogPost | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogPostModal = ({ post, onClose, onSuccess }: BlogPostModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "",
    published: false,
    seo_title: "",
    seo_description: "",
    related_service: "",
  });

  useEffect(() => {
    supabase
      .from("blog_posts")
      .select("slug, title")
      .eq("published", true)
      .then(({ data }) => {
        if (data) setServices(data.map((p) => ({ slug: p.slug, name: p.title })));
      });
  }, []);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || "",
        content: post.content,
        image_url: post.image_url || "",
        category: post.category || "",
        published: post.published,
        seo_title: post.seo_title || "",
        seo_description: post.seo_description || "",
        related_service: post.related_service || "",
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        image_url: "",
        category: "",
        published: false,
        seo_title: "",
        seo_description: "",
        related_service: "",
      });
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: value,
      slug: prev.slug === generateSlug(prev.title) ? generateSlug(value) : prev.slug,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      excerpt: formData.excerpt.trim() || null,
      content: formData.content.trim(),
      image_url: formData.image_url.trim() || null,
      category: formData.category.trim() || null,
      published: formData.published,
      published_at: formData.published ? new Date().toISOString() : null,
      seo_title: formData.seo_title.trim() || null,
      seo_description: formData.seo_description.trim() || null,
      related_service: formData.related_service || null,
    };

    try {
      if (post) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", post.id);
        if (error) throw error;
        toast({ title: "Artículo actualizado" });
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        toast({ title: "Artículo creado" });
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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {post ? "Editar artículo" : "Nuevo artículo"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Título *</label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="Título del artículo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Slug *</label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="slug-del-articulo"
                  />
                  <p className="text-xs text-foreground/30 mt-1">Se genera automáticamente desde el título</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Extracto</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    maxLength={300}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                    placeholder="Resumen breve para listados y SEO..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Contenido (HTML) *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={20}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none font-mono text-xs"
                    placeholder="<p>Contenido del artículo...</p>"
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Imagen destacada</label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                      placeholder="https://..."
                    />
                  </div>
                  {formData.image_url && (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="mt-2 w-full max-h-48 object-cover rounded-xl"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Categoría</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="desarrollo-web, automatizacion, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/60 mb-2">Servicio relacionado</label>
                  <select
                    value={formData.related_service}
                    onChange={(e) => setFormData({ ...formData, related_service: e.target.value })}
                    className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                  >
                    <option value="">Ninguno</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-foreground/[0.06] pt-4 space-y-4">
                  <h4 className="font-display text-sm font-semibold text-foreground">SEO</h4>
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-2">SEO Title</label>
                    <input
                      type="text"
                      value={formData.seo_title}
                      onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                      maxLength={60}
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                      placeholder="Título para Google (máx 60 chars)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/60 mb-2">SEO Description</label>
                    <textarea
                      value={formData.seo_description}
                      onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                      rows={2}
                      maxLength={160}
                      className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                      placeholder="Descripción para Google (máx 160 chars)"
                    />
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
                  post ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BlogPostModal;