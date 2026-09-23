import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, FileSignature, Send, Wallet, Eye, Pencil, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Contract,
  ContractTemplate,
  ClientOption,
  ContractType,
  ContractStatus,
  buildVars,
  fillTokens,
  toHtml,
} from "./contractsLib";

interface Prefill {
  client_id: string;
  title?: string;
  project?: string;
  amount?: number;
  contract_type?: ContractType;
}

interface ContractModalProps {
  contract: Contract | null;
  prefill?: Prefill | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ContractModal = ({ contract, prefill, onClose, onSuccess }: ContractModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    client_id: "",
    contract_type: "desarrollo" as ContractType,
    project: "",
    amount: "" as string,
    currency: "ARS",
    status: "draft" as ContractStatus,
    body: "",
  });

  const selectedClient = clients.find((c) => c.id === formData.client_id);
  const vars = buildVars(
    { client_id: formData.client_id, project: formData.project, amount: parseFloat(formData.amount) || 0, currency: formData.currency },
    selectedClient
  );
  const filled = fillTokens(formData.body, vars);

  useEffect(() => {
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

  useEffect(() => {
    if (contract) {
      setFormData({
        title: contract.title,
        client_id: contract.client_id || "",
        contract_type: contract.contract_type,
        project: contract.project || "",
        amount: contract.amount?.toString() || "",
        currency: contract.currency || "ARS",
        status: contract.status,
        body: contract.body,
      });
    } else if (prefill) {
      setFormData((prev) => ({
        ...prev,
        title: prefill.title || "",
        client_id: prefill.client_id,
        project: prefill.project || "",
        amount: prefill.amount?.toString() || "",
        contract_type: prefill.contract_type || prev.contract_type,
      }));
    } else {
      setFormData({
        title: "",
        client_id: "",
        contract_type: "desarrollo",
        project: "",
        amount: "",
        currency: "ARS",
        status: "draft",
        body: "",
      });
    }
  }, [contract, prefill]);

  const loadTemplate = (tpl?: ContractTemplate) => {
    if (!tpl) return;
    setFormData((prev) => ({
      ...prev,
      contract_type: tpl.contract_type,
      body: tpl.body,
    }));
    toast({ title: `Plantilla "${tpl.name}" cargada` });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const amount = formData.amount ? parseFloat(formData.amount) : null;
    const payload = {
      client_id: formData.client_id || null,
      title: formData.title.trim(),
      contract_type: formData.contract_type,
      project: formData.project.trim() || null,
      amount,
      currency: formData.currency,
      status: formData.status,
      sent_at: formData.status === "sent" || formData.status === "signed" ? new Date().toISOString() : null,
      body: formData.body,
      updated_at: new Date().toISOString(),
    };
    try {
      if (contract) {
        const { error } = await supabase.from("contracts").update(payload).eq("id", contract.id);
        if (error) throw error;
        toast({ title: "Contrato actualizado" });
      } else {
        const { error } = await supabase.from("contracts").insert(payload);
        if (error) throw error;
        toast({ title: "Contrato creado" });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sendByEmail = async () => {
    if (!selectedClient?.email) {
      toast({ title: "Sin email", description: "El cliente debe tener un email para enviarle el contrato.", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact", {
        body: {
          name: "Sigma Tecnologías",
          email: selectedClient.email,
          company: selectedClient.name,
          message: filled,
          subject: `Contrato: ${formData.title} · Sigma Tecnologías`,
          to: selectedClient.email,
          skipDefaultRecipients: true,
        },
      });
      if (error) throw error;
      toast({ title: "Contrato enviado", description: `Enviado a ${selectedClient.email}` });
      const { error: updateError } = await supabase
        .from("contracts")
        .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq("id", contract?.id || "");
      if (contract && updateError) {
        toast({ title: "Error", description: updateError.message, variant: "destructive" });
      }
      onSuccess();
    } catch (error) {
      toast({ title: "Error al enviar", description: error instanceof Error ? error.message : String(error), variant: "destructive" });
    } finally {
      setSending(false);
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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {contract ? "Editar contrato" : "Nuevo contrato"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Cliente *</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Título *</label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="Contrato de desarrollo - Sitio web"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Tipo</label>
                <select
                  value={formData.contract_type}
                  onChange={(e) => setFormData({ ...formData, contract_type: e.target.value as ContractType })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="desarrollo">Desarrollo</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Proyecto</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="Sitio web corporativo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Monto</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={15} />
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full glass-input rounded-xl pl-9 pr-3 py-3 text-sm text-foreground placeholder:text-foreground/25"
                    placeholder="500000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Moneda</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                className="w-full sm:w-56 glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                <option value="draft">Borrador</option>
                <option value="sent">Enviado</option>
                <option value="signed">Firmado</option>
              </select>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <label className="text-sm font-medium text-foreground/60">Plantillas</label>
                <div className="flex flex-wrap items-center gap-2">
                  {templates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => loadTemplate(tpl)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-foreground/[0.05] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.09] transition-colors"
                    >
                      <Hash size={12} className="text-sigma-blue" />
                      {tpl.name}
                    </button>
                  ))}
                  {templates.length === 0 && (
                    <span className="text-[11px] text-foreground/40">Sin plantillas configuradas</span>
                  )}
                </div>
              </div>

              <div className="border border-foreground/[0.08] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-foreground/[0.03] border-b border-foreground/[0.06]">
                  <span className="text-[11px] text-foreground/50 font-medium tracking-wide">
                    {preview ? "Vista previa (tokens reemplazados)" : "Texto del contrato"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreview((p) => !p)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                  >
                    {preview ? <Pencil size={12} /> : <Eye size={12} />}
                    {preview ? "Editar" : "Vista previa"}
                  </button>
                </div>
                {preview ? (
                  <div
                    className="p-5 text-sm text-foreground/80 whitespace-pre-wrap max-h-[40vh] overflow-y-auto leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: toHtml(filled) }}
                  />
                ) : (
                  <textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={16}
                    className="w-full px-4 py-3 text-sm font-mono text-foreground bg-transparent resize-y min-h-[240px] leading-relaxed"
                    placeholder="Texto del contrato. Usá tokens como {{cliente}}, {{empresa}}, {{proyecto}}, {{moneda}}, {{monto}}, {{fecha}}."
                  />
                )}
              </div>
              <p className="text-[11px] text-foreground/40 mt-2">
                Tokens disponibles: {"{{cliente}}, {{empresa}}, {{proyecto}}, {{moneda}}, {{monto}}, {{fecha}}"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-foreground/[0.06]">
              <div className="flex items-center gap-2">
                {selectedClient?.email && (
                  <button
                    type="button"
                    onClick={sendByEmail}
                    disabled={sending || !formData.title.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-sigma-blue text-white hover:bg-sigma-blue/90 transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    {sending ? "Enviando..." : "Enviar por email"}
                  </button>
                )}
                {!selectedClient?.email && (
                  <span className="text-[11px] text-amber-400/80">El cliente no tiene email registrado.</span>
                )}
              </div>
              <div className="flex items-center gap-3">
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
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <FileSignature size={15} />}
                  {contract ? "Guardar cambios" : "Crear contrato"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContractModal;