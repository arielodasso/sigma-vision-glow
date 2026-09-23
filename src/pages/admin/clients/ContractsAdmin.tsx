import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileSignature,
  Mail,
  Copy,
  Loader2,
  FileText,
  Eye,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import ContractModal from "./ContractModal";
import {
  Contract,
  ContractTemplate,
  ClientOption,
  ContractType,
  contractTypeLabels,
  contractTypeColors,
  contractStatusLabels,
  contractStatusColors,
  buildVars,
  fillTokens,
  toHtml,
} from "./contractsLib";

const ContractsAdmin = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>(searchParams.get("cliente") || "all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    setClientFilter(searchParams.get("cliente") || "all");
  }, [searchParams]);

  const fetchContracts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contracts")
      .select(`
        *,
        client:clients!contracts_client_id_fkey(name, company, email)
      `)
      .order("created_at", { ascending: false });
    if (data) setContracts(data as Contract[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
    supabase
      .from("clients")
      .select("id, name, company, email")
      .order("name")
      .then(({ data }) => {
        if (data) setClients(data as ClientOption[]);
      });
    supabase
      .from("contract_templates")
      .select("*")
      .order("name")
      .then(({ data }) => {
        if (data) setTemplates(data as ContractTemplate[]);
      });
  }, []);

  const prefill = useMemo(() => {
    const cliente = searchParams.get("cliente");
    const nombre = searchParams.get("nombre");
    const dev = searchParams.get("dev");
    const mant = searchParams.get("mant");
    const slug = searchParams.get("presupuesto");
    if (!cliente) return null;
    return {
      client_id: cliente,
      title: nombre ? `Contrato - ${nombre}${slug ? ` (presupuesto ${slug})` : ""}` : "Nuevo contrato",
      project: slug ? `presupuesto ${slug}` : "",
      amount: dev ? Number(dev) : mant ? Number(mant) : undefined,
      contract_type: (dev ? "desarrollo" : mant ? "mantenimiento" : null) as ContractType | undefined,
    };
  }, [searchParams]);

  const filtered = contracts.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.client?.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || c.contract_type === typeFilter;
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesClient = clientFilter === "all" || c.client_id === clientFilter;
    return matchesSearch && matchesType && matchesStatus && matchesClient;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este contrato?")) return;
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Contrato eliminado" });
      fetchContracts();
    }
  };

  const copyFilled = (c: Contract) => {
    const client = clients.find((x) => x.id === c.client_id);
    const text = fillTokens(c.body, buildVars(c, client));
    navigator.clipboard.writeText(text);
    toast({ title: "Texto copiado" });
  };

  const sendByEmail = async (c: Contract) => {
    const client = clients.find((x) => x.id === c.client_id);
    if (!client?.email) {
      toast({ title: "Sin email", description: "El cliente asociado no tiene email.", variant: "destructive" });
      return;
    }
    setSendingId(c.id);
    try {
      const filled = fillTokens(c.body, buildVars(c, client));
      const { error } = await supabase.functions.invoke("send-contact", {
        body: {
          name: "Sigma Tecnologías",
          email: client.email,
          company: client.name,
          message: filled,
          subject: `Contrato: ${c.title} · Sigma Tecnologías`,
          to: client.email,
          skipDefaultRecipients: true,
        },
      });
      if (error) throw error;
      toast({ title: "Contrato enviado", description: `Enviado a ${client.email}` });
      await supabase
        .from("contracts")
        .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", c.id);
      fetchContracts();
    } catch (error) {
      toast({ title: "Error al enviar", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    } finally {
      setSendingId(null);
    }
  };

  const openCreate = () => {
    setEditingContract(null);
    setModalOpen(true);
  };

  const openEdit = (c: Contract) => {
    setEditingContract(c);
    setModalOpen(true);
  };

  const formatMoney = (c: Contract) =>
    c.amount !== null ? `${c.currency} ${c.amount.toLocaleString("es-AR", { maximumFractionDigits: 2 })}` : "—";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Contratos · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">Contratos</h1>
            <p className="text-xs text-muted-foreground mt-1">Redactá contratos con plantillas y enviálos por email</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSearchParams({})}
              className="text-xs text-foreground/50 hover:text-foreground transition-colors underline"
            >
              Limpiar filtros
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              <Plus size={16} />
              Nuevo contrato
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
              <input
                type="text"
                placeholder="Buscar contratos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input rounded-xl px-10 py-2.5 text-xs text-foreground placeholder:text-foreground/25"
              />
            </div>
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setSearchParams(e.target.value === "all" ? {} : { cliente: e.target.value });
              }}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los tipos</option>
              <option value="desarrollo">Desarrollo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="general">General</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="sent">Enviado</option>
              <option value="signed">Firmado</option>
            </select>
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
              <FileSignature className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay contratos</p>
              <p className="text-sm mt-1">Creá el primero o usá una plantilla de desarrollo o mantenimiento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Contrato</th>
                    <th className="p-4 hidden md:table-cell">Cliente</th>
                    <th className="p-4 hidden lg:table-cell">Proyecto</th>
                    <th className="p-4 hidden lg:table-cell">Monto</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Enviado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className="text-foreground/40 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.title}</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium border whitespace-nowrap ${contractTypeColors[c.contract_type]}`}>
                              {contractTypeLabels[c.contract_type]}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <p className="text-sm text-foreground/70">{c.client?.name || "Sin cliente"}</p>
                        {c.client?.company && <p className="text-xs text-foreground/40">{c.client.company}</p>}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-foreground/50">
                        {c.project || <span className="text-foreground/30">—</span>}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-foreground/70">{formatMoney(c)}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap ${contractStatusColors[c.status]}`}>
                          {contractStatusLabels[c.status]}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-xs text-foreground/50">
                        {c.sent_at ? new Date(c.sent_at).toLocaleDateString("es-AR") : <span className="text-foreground/30">—</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewContract(c)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Ver"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => copyFilled(c)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Copiar texto con tokens"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => sendByEmail(c)}
                            disabled={sendingId === c.id}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-sigma-blue hover:bg-sigma-blue/10 transition-colors disabled:opacity-50"
                            title="Enviar por email"
                          >
                            {sendingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
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

        <AnimatePresence>
          {modalOpen && (
            <ContractModal
              contract={editingContract}
              prefill={prefill}
              onClose={() => {
                setModalOpen(false);
                setEditingContract(null);
              }}
              onSuccess={fetchContracts}
            />
          )}
        </AnimatePresence>

        {/* Preview */}
        <AnimatePresence>
          {previewContract && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setPreviewContract(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card border border-foreground/[0.08] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">{previewContract.title}</h2>
                    <p className="text-xs text-foreground/50 mt-0.5">{previewContract.client?.name || "Sin cliente"}</p>
                  </div>
                  <button
                    onClick={() => setPreviewContract(null)}
                    className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6">
                  {(() => {
                    const client = clients.find((x) => x.id === previewContract.client_id);
                    const filled = fillTokens(previewContract.body, buildVars(previewContract, client));
                    return (
                      <div
                        className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: toHtml(filled) }}
                      />
                    );
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContractsAdmin;