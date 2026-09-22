import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Building2, Mail, Phone, MessageCircle, FileText, DollarSign, Image as ImageIcon, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import MediaLibrary from "@/components/admin/MediaLibrary";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  notes: string | null;
  status: "active" | "pending_payment" | "proposal" | "lost";
  portal_enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
}

interface ClientModalProps {
  client: Client | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ClientModal = ({ client, onClose, onSuccess }: ClientModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    whatsapp: "",
    notes: "",
    status: "proposal" as "active" | "pending_payment" | "proposal" | "lost",
    portal_enabled: false,
    image_url: "",
  });
  const [showMedia, setShowMedia] = useState(false);

  const statusOptions = [
    { value: "proposal", label: "En propuesta" },
    { value: "active", label: "Activo" },
    { value: "pending_payment", label: "Pendiente pago" },
    { value: "lost", label: "Perdido" },
  ];

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        company: client.company || "",
        email: client.email || "",
        phone: client.phone || "",
        whatsapp: client.whatsapp || "",
        notes: client.notes || "",
        status: client.status,
        portal_enabled: client.portal_enabled,
        image_url: client.image_url || "",
      });
    } else {
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        whatsapp: "",
        notes: "",
        status: "proposal",
        portal_enabled: false,
        image_url: "",
      });
    }
  }, [client]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      company: formData.company.trim() || null,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      whatsapp: formData.whatsapp.trim() || null,
      notes: formData.notes.trim() || null,
      status: formData.status,
      portal_enabled: formData.portal_enabled,
      image_url: formData.image_url || null,
    };

    try {
      if (client) {
        const { error } = await supabase.from("clients").update(payload).eq("id", client.id);
        if (error) throw error;
        toast({ title: "Cliente actualizado" });
      } else {
        const { error } = await supabase.from("clients").insert(payload);
        if (error) throw error;
        toast({ title: "Cliente creado" });
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
              {client ? "Editar cliente" : "Nuevo cliente"}
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
                maxLength={200}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Nombre del cliente"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="cliente@empresa.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">WhatsApp</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Estado</label>
              <div className="grid grid-cols-4 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.value as any })}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      formData.status === opt.value
                        ? "bg-sigma-yellow/20 text-sigma-yellow ring-2 ring-sigma-yellow/50"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Notas internas..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="portal_enabled"
                checked={formData.portal_enabled}
                onChange={(e) => setFormData({ ...formData, portal_enabled: e.target.checked })}
                className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
              />
              <label htmlFor="portal_enabled" className="text-sm font-medium text-foreground">
                Habilitar portal del cliente
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Foto / Logo</label>
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
                  client ? "Actualizar" : "Crear"
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
                  <p className="text-xs text-foreground/40 mt-1">Elegí una imagen para el cliente.</p>
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

export default ClientModal;