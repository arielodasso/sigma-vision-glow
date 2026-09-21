import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Image, Link2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { services } from "@/data/services";

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
}

interface Client {
  id: string;
  name: string;
  company: string | null;
}

interface CaseModalProps {
  caseData: RealCase | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CaseModal = ({ caseData, onClose, onSuccess }: CaseModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    logo_theme: "dark",
    url: "",
    client_id: "",
    services: [] as string[],
    published: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (caseData) {
      setFormData({
        name: caseData.name,
        description: caseData.description,
        logo_url: caseData.logo_url || "",
        logo_theme: caseData.logo_theme,
        url: caseData.url || "",
        client_id: caseData.client_id || "",
        services: caseData.services || [],
        published: caseData.published,
        sort_order: caseData.sort_order,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        logo_url: "",
        logo_theme: "dark",
        url: "",
        client_id: "",
        services: [],
        published: true,
        sort_order: 0,
      });
    }
  }, [caseData]);

  const fetchClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name, company")
      .order("name", { ascending: true });
    if (data) setClients(data as Client[]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      logo_url: formData.logo_url.trim() || null,
      logo_theme: formData.logo_theme,
      url: formData.url.trim() || null,
      client_id: formData.client_id || null,
      services: formData.services,
      published: formData.published,
      sort_order: formData.sort_order,
    };

    try {
      if (caseData) {
        const { error } = await supabase.from("real_cases").update(payload).eq("id", caseData.id);
        if (error) throw error;
        toast({ title: "Caso actualizado" });
      } else {
        const { error } = await supabase.from("real_cases").insert(payload);
        if (error) throw error;
        toast({ title: "Caso creado" });
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (slug: string) => {
    setFormData({
      ...formData,
      services: formData.services.includes(slug)
        ? formData.services.filter((s) => s !== slug)
        : [...formData.services, slug],
    });
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
              {caseData ? "Editar caso real" : "Nuevo caso real"}
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
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Ej: Capitán Deportes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Descripción *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Breve descripción del proyecto..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Logo (URL)</label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="https://... o /assets/clients/..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Tema del logo</label>
                <select
                  value={formData.logo_theme}
                  onChange={(e) => setFormData({ ...formData, logo_theme: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground bg-card"
                >
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                  <option value="gray">Gris</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">URL del proyecto</label>
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="https://ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Cliente vinculado (opcional)</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground bg-card"
              >
                <option value="">Sin cliente vinculado</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company && `(${c.company})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Servicios relacionados</label>
              <p className="text-xs text-foreground/40 mb-3">Selecciona en qué servicios aparecerá este caso</p>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggleService(s.slug)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.services.includes(s.slug)
                        ? "bg-sigma-yellow/20 text-sigma-yellow border border-sigma-yellow/30"
                        : "bg-foreground/[0.04] text-foreground/60 hover:bg-foreground/[0.08] border border-foreground/[0.06]"
                    }`}
                  >
                    {s.name}
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
                  caseData ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CaseModal;