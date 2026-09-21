import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Loader2, Eye, EyeOff, Link2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import CaseModal from "./CaseModal";

interface RealCase {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  logo_theme: string;
  url: string | null;
  client_id: string | null;
  services: string[];
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  client?: { name: string; company: string | null } | null;
}

interface Client {
  id: string;
  name: string;
  company: string | null;
}

const ContentCases = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [cases, setCases] = useState<RealCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<RealCase | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("real_cases")
      .select(`
        *,
        client:clients (name, company)
      `)
      .order("sort_order", { ascending: true });
    if (data) setCases(data as RealCase[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filtered = cases.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.client?.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.services.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este caso?")) return;
    const { error } = await supabase.from("real_cases").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Caso eliminado" });
      fetchCases();
    }
  };

  const handlePublish = async (id: string, published: boolean) => {
    const { error } = await supabase.from("real_cases").update({ published }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: published ? "Publicado" : "Despublicado" });
      fetchCases();
    }
  };

  const openCreate = () => {
    setEditingCase(null);
    setModalOpen(true);
  };

  const openEdit = (caseItem: RealCase) => {
    setEditingCase(caseItem);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contenidos · Casos reales · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Casos reales</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona los casos de éxito que aparecen en la web</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo caso
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
              placeholder="Buscar casos..."
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
              <Link2 className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay casos reales</p>
              <p className="text-sm mt-1">Agrega el primero para mostrar en la web</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Caso</th>
                    <th className="p-4 hidden md:table-cell">Cliente</th>
                    <th className="p-4">Servicios</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Orden</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {item.logo_url && (
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden ${
                              item.logo_theme === "dark" ? "bg-foreground/[0.04] border border-foreground/[0.08]" :
                              item.logo_theme === "light" ? "bg-white border-white/80" :
                              "bg-neutral-400 border-neutral-300"
                            }`}>
                              <img
                                src={item.logo_url}
                                alt={item.name}
                                className="w-full h-full object-contain p-1 opacity-90"
                              />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-foreground/50 truncate max-w-xs">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {item.client ? (
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <Building2 size={12} className="text-foreground/30" />
                            <span>{item.client.name}{item.client.company && ` (${item.client.company})`}</span>
                          </div>
                        ) : (
                          <span className="text-foreground/30 text-sm">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {item.services.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-foreground/[0.04] text-foreground/70 border border-foreground/[0.06]"
                            >
                              {s}
                            </span>
                          ))}
                          {item.services.length === 0 && (
                            <span className="text-[10px] text-foreground/30">Sin servicios</span>
                          )}
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
                          {item.published ? <Eye size={12} /> : <EyeOff size={12} />}
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
            <CaseModal
              caseData={editingCase}
              onClose={() => { setModalOpen(false); setEditingCase(null); }}
              onSuccess={fetchCases}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentCases;