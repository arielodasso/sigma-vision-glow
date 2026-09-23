import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import TestimonialModal from "./TestimonialModal";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  published: boolean;
  image_url: string | null;

  sort_order: number;
  created_at: string;
  updated_at: string;
}

const ContentTestimonials = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setTestimonials(data as Testimonial[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const filtered = testimonials.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.company?.toLowerCase().includes(search.toLowerCase()) ||
    t.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este testimonio?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Testimonio eliminado" });
      fetchTestimonials();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("testimonials").update({ published }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicado" : "Despublicado" });
      fetchTestimonials();
    }
  };

  const openCreate = () => {
    setEditingTestimonial(null);
    setModalOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · Testimonios · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Testimonios</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona los testimonios de clientes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo testimonio
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
              placeholder="Buscar testimonios..."
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
              <Star className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay testimonios</p>
              <p className="text-sm mt-1">Agrega el primero para mostrar en la web</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Cliente</th>
                    <th className="p-4 hidden md:table-cell">Cargo / Empresa</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Orden</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{item.name}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-sm text-foreground/70">
                          {item.role && <p>{item.role}</p>}
                          {item.company && <p className="text-foreground/50">{item.company}</p>}
                          {!item.role && !item.company && <span className="text-foreground/30">—</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={
                                item.rating && i < item.rating
                                  ? "fill-sigma-yellow text-sigma-yellow"
                                  : "text-foreground/15"
                              }
                            />
                          ))}
                        </div>
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
                          {item.published ? "Publicado" : "Borrador"}
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
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <TestimonialModal
              testimonial={editingTestimonial}
              onClose={() => { setModalOpen(false); setEditingTestimonial(null); }}
              onSuccess={fetchTestimonials}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentTestimonials;