import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, DollarSign, Calendar, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

interface Budget {
  id: string;
  slug: string;
  client_id: string | null;
  client_name: string;
  client_email: string | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  development_cost: number | null;
  monthly_maintenance_cost: number | null;
  billing: string | null;
  delivery_time: string | null;
  scope: string | null;
  items: any;
  observations: string | null;
  work_type: string | null;
  payment_method: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; company: string | null };
}

interface ClientOption {
  id: string;
  name: string;
  company: string | null;
}

interface BudgetModalProps {
  budget: Budget | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BudgetModal = ({ budget, onClose, onSuccess }: BudgetModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [formData, setFormData] = useState({
    client_id: "",
    slug: "",
    client_name: "",
    client_email: "",
    status: "draft" as "draft" | "sent" | "accepted" | "rejected",
    development_cost: "",
    monthly_maintenance_cost: "",
    billing: "monthly",
    delivery_time: "",
    scope: "",
    items: [] as any[],
    observations: "",
    work_type: "fixed",
    payment_method: "transfer",
  });

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, name, company")
      .order("name")
      .then(({ data }) => {
        if (data) setClients(data as ClientOption[]);
      });
  }, []);

  useEffect(() => {
    if (budget) {
      setFormData({
        client_id: budget.client_id || "",
        slug: budget.slug,
        client_name: budget.client_name,
        client_email: budget.client_email || "",
        status: budget.status,
        development_cost: budget.development_cost?.toString() || "",
        monthly_maintenance_cost: budget.monthly_maintenance_cost?.toString() || "",
        billing: budget.billing || "monthly",
        delivery_time: budget.delivery_time || "",
        scope: budget.scope || "",
        items: budget.items || [],
        observations: budget.observations || "",
        work_type: budget.work_type || "fixed",
        payment_method: budget.payment_method || "transfer",
      });
    } else {
      setFormData({
        client_id: "",
        slug: `presupuesto-${Date.now()}`,
        client_name: "",
        client_email: "",
        status: "draft",
        development_cost: "",
        monthly_maintenance_cost: "",
        billing: "monthly",
        delivery_time: "",
        scope: "",
        items: [],
        observations: "",
        work_type: "fixed",
        payment_method: "transfer",
      });
    }
  }, [budget]);

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const client = clients.find((c) => c.id === e.target.value);
    setFormData((prev) => ({
      ...prev,
      client_id: e.target.value,
      client_name: client?.name || "",
      client_email: "",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      client_id: formData.client_id || null,
      slug: formData.slug.trim(),
      client_name: formData.client_name.trim(),
      client_email: formData.client_email.trim() || null,
      status: formData.status,
      development_cost: formData.development_cost ? parseFloat(formData.development_cost) : null,
      monthly_maintenance_cost: formData.monthly_maintenance_cost ? parseFloat(formData.monthly_maintenance_cost) : null,
      billing: formData.billing,
      delivery_time: formData.delivery_time.trim() || null,
      scope: formData.scope.trim() || null,
      items: formData.items,
      observations: formData.observations.trim() || null,
      work_type: formData.work_type,
      payment_method: formData.payment_method,
    };

    try {
      if (budget) {
        const { error } = await supabase.from("budgets").update(payload).eq("id", budget.id);
        if (error) throw error;
        toast({ title: "Presupuesto actualizado" });
      } else {
        const { error } = await supabase.from("budgets").insert(payload);
        if (error) throw error;
        toast({ title: "Presupuesto creado" });
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
              {budget ? "Editar presupuesto" : "Nuevo presupuesto"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Cliente</label>
              <select
                required
                value={formData.client_id}
                onChange={handleClientChange}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="presupuesto-proyecto-2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Tipo de trabajo</label>
                <select
                  value={formData.work_type}
                  onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="fixed">Precio fijo</option>
                  <option value="hourly">Por horas</option>
                  <option value="retainer">Retainer mensual</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Costo desarrollo (ARS)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.development_cost}
                    onChange={(e) => setFormData({ ...formData, development_cost: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="500000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Mantenimiento mensual (ARS)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.monthly_maintenance_cost}
                    onChange={(e) => setFormData({ ...formData, monthly_maintenance_cost: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="50000"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Facturación</label>
                <select
                  value={formData.billing}
                  onChange={(e) => setFormData({ ...formData, billing: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="monthly">Mensual</option>
                  <option value="one_time">Único pago</option>
                  <option value="milestones">Por hitos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Método de pago</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Efectivo</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Tiempo de entrega</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="text"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="4-6 semanas"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="draft">Borrador</option>
                  <option value="sent">Enviado</option>
                  <option value="accepted">Aceptado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Alcance</label>
              <textarea
                value={formData.scope}
                onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                rows={4}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Describe qué incluye el presupuesto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Observaciones</label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Notas adicionales..."
              />
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
                  budget ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BudgetModal;