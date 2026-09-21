import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { DollarSign, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

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
  items: Array<{ description?: string; price?: number | string }> | null;
  observations: string | null;
  work_type: string | null;
  payment_method: string | null;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  client?: { name: string; company: string | null };
}

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/20 text-gray-400",
  sent: "bg-blue-500/20 text-blue-400",
  accepted: "bg-emerald-500/20 text-emerald-400",
  rejected: "bg-red-500/20 text-red-400",
};

const SHORT_NAMES: Record<string, string> = {
  "Landing Page / Sitio Web": "Sitio web",
  "Bot / Automatización IA": "Automatización IA",
  "Panel Admin / Dashboard": "Panel de administración",
  "MVP SaaS / Web App": "SaaS a medida",
  "Plataforma / App Compleja": "Plataforma a medida",
};

const budgetLabel = (b: Budget): string => {
  const first =
    Array.isArray(b.items) && b.items.length
      ? String(b.items[0]?.description || "").replace(/\s*\(\d+(\s*hs?)?\)/i, "").trim()
      : "";
  const parts = (b.scope || "")
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const candidates = [first, parts[0]].filter(Boolean);
  for (const c of candidates) {
    if (SHORT_NAMES[c]) return SHORT_NAMES[c];
    return c;
  }
  if (b.work_type) return b.work_type;
  return "Presupuesto";
};

const ClientBudgets = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBudgets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("budgets")
      .select(`
        *,
        client:clients!budgets_client_id_fkey(name, company)
      `)
      .order("created_at", { ascending: false });
    if (data) setBudgets(data as Budget[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const filtered = budgets.filter((b) =>
    b.client_name.toLowerCase().includes(search.toLowerCase()) ||
    b.slug.toLowerCase().includes(search.toLowerCase()) ||
    b.client?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Presupuesto eliminado" });
      fetchBudgets();
    }
  };

  const handleStatusChange = async (id: string, status: Budget["status"]) => {
    const { error } = await supabase
      .from("budgets")
      .update({ status, accepted_at: status === "accepted" ? new Date().toISOString() : null })
      .eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estado actualizado" });
      fetchBudgets();
    }
  };

  const openCreate = () => {
    navigate("/admin/presupuestos/nuevo");
  };

  const openEdit = (budget: Budget) => {
    navigate(`/admin/presupuestos/${budget.id}`);
  };

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Presupuestos · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">Presupuestos</h1>
            <p className="text-xs text-muted-foreground mt-1">Gestiona los presupuestos de clientes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo presupuesto
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
              placeholder="Buscar presupuestos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl px-10 py-2.5 text-xs text-foreground placeholder:text-foreground/25"
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
              <DollarSign className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay presupuestos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Presupuesto</th>
                    <th className="p-4 hidden md:table-cell">Cliente</th>
                    <th className="p-4">Desarrollo</th>
                    <th className="p-4 hidden lg:table-cell">Mantenimiento</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((budget) => (
                    <tr key={budget.id} className="hover:bg-foreground/[0.02] transition-colors">
<td className="p-4">
  <p className="text-sm font-medium text-foreground">{budgetLabel(budget)}</p>
</td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="text-xs">
                          <p className="text-foreground/70">{budget.client?.name || budget.client_name}</p>
                          {budget.client?.company && <p className="text-foreground/40">{budget.client.company}</p>}
                        </div>
                      </td>
                      <td className="p-4 text-sm font-medium text-foreground">{formatCurrency(budget.development_cost)}</td>
                      <td className="p-4 hidden lg:table-cell text-xs text-foreground/60">
                        {formatCurrency(budget.monthly_maintenance_cost)}
                      </td>
                      <td className="p-4">
                        <select
                          value={budget.status}
                          onChange={(e) => handleStatusChange(budget.id, e.target.value as Budget["status"])}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${statusColors[budget.status]}`}
                        >
                          <option value="draft">Borrador</option>
                          <option value="sent">Enviado</option>
                          <option value="accepted">Aceptado</option>
                          <option value="rejected">Rechazado</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(budget)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(budget.id)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>
    </div>
  );
};

export default ClientBudgets;