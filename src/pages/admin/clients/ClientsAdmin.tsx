import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Building2, FileText, DollarSign, Mail, Loader2, Users, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import ClientModal from "./ClientModal";

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
  from_budget?: boolean;
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  pending_payment: "Pendiente pago",
  proposal: "En propuesta",
  lost: "Perdido",
};

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  pending_payment: "bg-amber-500/20 text-amber-400",
  proposal: "bg-blue-500/20 text-blue-400",
  lost: "bg-red-500/20 text-red-400",
};

const ClientsAdmin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    setLoading(true);
    const [{ data: clients }, { data: budgets }] = await Promise.all([
      supabase.from("clients").select("*").order("created_at", { ascending: false }),
      supabase
        .from("budgets")
        .select("slug, client_name, client_email, client_id, created_at, updated_at"),
    ]);
    type BudgetClient = {
      slug: string;
      client_name: string;
      client_email: string | null;
      client_id: string | null;
      created_at: string;
      updated_at: string;
    };
    const real = (clients as Client[]) || [];
    const seen = new Set(real.map((c) => `${c.name}|${c.email || ""}`.toLowerCase()));
    const fromBudgets: Client[] = ((budgets as unknown as BudgetClient[]) || [])
      .filter((b) => !b.client_id && b.client_name)
      .map((b) => ({
        id: `v-${b.slug}`,
        name: b.client_name,
        company: null,
        email: b.client_email || null,
        phone: null,
        whatsapp: null,
        notes: null,
        status: "proposal" as const,
        portal_enabled: false,
        created_by: null,
        created_at: b.created_at,
        updated_at: b.updated_at,
        from_budget: true,
      }))
      .filter((c) => {
        const key = `${c.name}|${c.email || ""}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    setClients(
      [...real, ...fromBudgets].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente eliminado" });
      fetchClients();
    }
  };

  const openCreate = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Clientes</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona clientes, presupuestos y documentos</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo cliente
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
              placeholder="Buscar clientes..."
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
              <Building2 className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay clientes</p>
              <p className="text-sm mt-1">Agrega el primero para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Cliente</th>
                    <th className="p-4 hidden md:table-cell">Empresa</th>
                    <th className="p-4 hidden lg:table-cell">Contacto</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Portal</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-foreground/[0.02] transition-colors">
<td className="p-4">
        <p className="font-medium text-foreground">{client.name}</p>
        {client.from_budget && (
          <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium bg-foreground/[0.05] text-foreground/50">
            Desde presupuesto
          </span>
        )}
      </td>
                      <td className="p-4 hidden md:table-cell">
                        {client.company ? (
                          <p className="text-sm text-foreground/70">{client.company}</p>
                        ) : (
                          <span className="text-sm text-foreground/30">—</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <div className="text-sm text-foreground/60 space-y-1">
                          {client.email && <p>{client.email}</p>}
                          {client.whatsapp && <p>WhatsApp: {client.whatsapp}</p>}
                          {client.phone && <p>Tel: {client.phone}</p>}
                          {!client.email && !client.whatsapp && !client.phone && <span className="text-foreground/30">—</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[client.status]}`}>
                          {statusLabels[client.status]}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          client.portal_enabled
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}>
                          {client.portal_enabled ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {client.from_budget ? (
                          <span className="text-[10px] text-foreground/30">Viene de un presupuesto</span>
                        ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(client)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        )}
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
            <ClientModal
              client={editingClient}
              onClose={() => { setModalOpen(false); setEditingClient(null); }}
              onSuccess={fetchClients}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientsAdmin;