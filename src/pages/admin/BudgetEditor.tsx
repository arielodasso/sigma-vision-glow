import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Copy, Plus, X, Calculator, ChevronDown } from "lucide-react";
import QuoterCalculator from "@/components/admin/QuoterCalculator";

const inputClass =
  "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

const randomSlug = () =>
  Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);

type Item = { description: string; price: string };
type Status = "draft" | "sent" | "accepted" | "rejected";

const STATUS_LABELS: Record<Status, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const BudgetEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "nuevo";
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const prefill = (location.state as any)?.prefill as
    | { clientName?: string; items?: Item[]; workType?: string; scope?: string; deliveryTime?: string }
    | undefined;


  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [scope, setScope] = useState("");
  const [workType, setWorkType] = useState("");
  const [observations, setObservations] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [billing, setBilling] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [monthlyCost, setMonthlyCost] = useState("");
  const [status, setStatus] = useState<Status>("draft");
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (isNew) {
      setSlug(randomSlug());
      if (prefill) {
        if (prefill.clientName) setClientName(prefill.clientName);
        if (prefill.workType) setWorkType(prefill.workType);
        if (prefill.scope) setScope(prefill.scope);
        if (prefill.items?.length) setItems(prefill.items);
        if (prefill.deliveryTime) setDeliveryTime(prefill.deliveryTime);
      }
      return;
    }
    (async () => {
      const { data } = await supabase.from("budgets").select("*").eq("id", id).maybeSingle();
      if (data) {
        setSlug(data.slug);
        setClientName(data.client_name);
        setClientEmail((data as any).client_email || "");
        setScope(data.scope || "");
        setWorkType(data.work_type || "");
        setObservations(data.observations || "");
        setDeliveryTime(data.delivery_time || "");
        setPaymentMethod(data.payment_method || "");
        setBilling(data.billing || "");
        setMonthlyCost(data.monthly_maintenance_cost?.toString() || "");
        setStatus((data.status as Status) || "draft");
        setAcceptedAt(data.accepted_at);
        const arr = Array.isArray(data.items) ? data.items : [];
        setItems(
          arr.map((i: any) => ({
            description: i?.description ?? "",
            price: i?.price != null ? String(i.price) : "",
          }))
        );
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const totalDev = items.reduce((acc, i) => acc + (Number(i.price) || 0), 0);

  const updateItem = (idx: number, key: keyof Item, value: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };
  const addItem = () => setItems((prev) => [...prev, { description: "", price: "" }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const cleanItems = items
      .filter((i) => i.description.trim() || i.price)
      .map((i) => ({ description: i.description.trim(), price: Number(i.price) || 0 }));

    const payload = {
      slug: slug.trim() || randomSlug(),
      client_name: clientName.trim(),
      client_email: clientEmail.trim() || null,
      scope: scope || null,
      work_type: workType || null,
      observations: observations || null,
      delivery_time: deliveryTime || null,
      payment_method: paymentMethod || null,
      billing: billing || null,
      items: cleanItems,
      development_cost: cleanItems.reduce((a, i) => a + i.price, 0),
      monthly_maintenance_cost: monthlyCost ? Number(monthlyCost) : null,
      status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { data, error } = await supabase.from("budgets").insert(payload as any).select("id, slug").single();
        if (error) throw error;
        toast({ title: "Presupuesto creado" });
        // Notify client by email if provided (fire-and-forget) — only to client, with PDF attached
        if (payload.client_email) {
          const publicUrl = `${window.location.origin}/presupuesto/${payload.slug}`;
          (async () => {
            try {
              // Fetch the generated PDF and convert to base64
              const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
              const pdfUrl = `https://${projectId}.supabase.co/functions/v1/generate-budget-pdf?slug=${encodeURIComponent(payload.slug)}`;
              const pdfResp = await fetch(pdfUrl);
              let attachments: Array<{ filename: string; content: string }> | undefined;
              if (pdfResp.ok) {
                const buf = await pdfResp.arrayBuffer();
                const bytes = new Uint8Array(buf);
                let binary = "";
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                const base64 = btoa(binary);
                attachments = [{ filename: `presupuesto-${payload.slug}.pdf`, content: base64 }];
              } else {
                console.warn("PDF fetch failed for client email attachment:", pdfResp.status);
              }

              await supabase.functions.invoke("send-contact", {
                body: {
                  name: "Sigma Tecnologías",
                  email: payload.client_email,
                  company: payload.client_name,
                  message:
                    `Hola ${payload.client_name},\n\n` +
                    `Te dejamos a disposición tu presupuesto. Podés revisarlo en:\n${publicUrl}\n\n` +
                    `Adjuntamos también el PDF para tu comodidad.\n\n` +
                    `Desde la vista podés aceptarlo o rechazarlo cuando quieras.\n\n` +
                    `Cualquier consulta, escribinos.\n\n— Sigma Tecnologías`,
                  subject: `Tu presupuesto de Sigma Tecnologías está listo`,
                  to: payload.client_email,
                  skipDefaultRecipients: true,
                  attachments,
                },
              });
            } catch (e) {
              console.warn("Client notify failed:", e);
            }
          })();
        }
        navigate(`/admin/presupuestos/${data.id}`);
      } else {
        const { error } = await supabase.from("budgets").update(payload as any).eq("id", id);
        if (error) throw error;
        toast({ title: "Presupuesto actualizado" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = `${window.location.origin}/presupuesto/${slug}`;

  if (loading) return <p className="text-sm text-muted-foreground">Cargando...</p>;

  const statusColor: Record<Status, string> = {
    draft: "bg-foreground/10 text-foreground/60",
    sent: "bg-blue-500/15 text-blue-400",
    accepted: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
  };

  return (
    <div>
      <button
        onClick={() => navigate("/admin/presupuestos")}
        className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground mb-6"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="font-display text-3xl font-bold text-foreground">
          {isNew ? "Nuevo presupuesto" : "Editar presupuesto"}
        </h1>
        {!isNew && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[status]}`}>
            {STATUS_LABELS[status]}
          </span>
        )}
      </div>

      {!isNew && (
        <div className="mb-8 flex items-center gap-3 text-xs text-foreground/40">
          <span className="truncate">{publicUrl}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(publicUrl); toast({ title: "Enlace copiado" }); }}
            className="text-foreground/50 hover:text-foreground"
          >
            <Copy size={12} />
          </button>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="text-foreground/50 hover:text-foreground">
            <ExternalLink size={12} />
          </a>
          {acceptedAt && (
            <span className="ml-auto text-emerald-400">
              Aceptado el {new Date(acceptedAt).toLocaleString("es-AR")}
            </span>
          )}
        </div>
      )}

      <div className="mb-8 border border-foreground/[0.08] rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setCalcOpen((v) => !v)}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-foreground/[0.03] transition-colors"
        >
          <Calculator size={16} className="text-foreground/60" />
          <span className="text-sm font-semibold text-foreground">Calculadora interna de horas</span>
          <ChevronDown
            size={16}
            className={`ml-auto text-foreground/40 transition-transform ${calcOpen ? "rotate-180" : ""}`}
          />
        </button>
        {calcOpen && (
          <div className="px-5 pb-5 pt-1 border-t border-foreground/[0.06]">
            <QuoterCalculator
              showClientField={false}
              applyLabel="Aplicar al presupuesto"
              onApply={(p) => {
                if (p.items?.length) setItems(p.items);
                if (p.scope) setScope(p.scope);
                if (p.workType && !workType) setWorkType(p.workType);
                if (p.deliveryTime) setDeliveryTime(p.deliveryTime);
                setCalcOpen(false);
                toast({ title: "Datos aplicados al presupuesto" });
              }}
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Estado">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={inputClass}
          >
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="accepted">Aceptado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </Field>

        <Field label="Cliente *">
          <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
        </Field>

        <Field label="Email del cliente (opcional)">
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className={inputClass}
            placeholder="cliente@ejemplo.com"
          />
          <p className="text-[11px] text-foreground/40 mt-2">
            Si lo completás, al crear el presupuesto le enviamos un email con el enlace al detalle (con descarga de PDF).
          </p>
        </Field>

        <Field label="Slug (URL)">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </Field>

        <Field label="El presupuesto contempla">
          <textarea value={scope} onChange={(e) => setScope(e.target.value)} rows={5} className={inputClass} placeholder="Listado de funcionalidades, entregables, alcance..." />
        </Field>

        <Field label="Tipo de trabajo y metodología">
          <textarea value={workType} onChange={(e) => setWorkType(e.target.value)} rows={3} className={inputClass} />
        </Field>

        <Field label="Observaciones">
          <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} className={inputClass} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Plazo de entrega">
            <input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className={inputClass} placeholder="Ej: 4 semanas" />
          </Field>
          <Field label="Forma de pago">
            <input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass} placeholder="Ej: 50% inicio, 50% entrega" />
          </Field>
        </div>

        <Field label="Facturación (si aplica)">
          <input value={billing} onChange={(e) => setBilling(e.target.value)} className={inputClass} placeholder="Razón social, datos fiscales..." />
        </Field>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-medium text-foreground/40 uppercase tracking-wide">
              Items del presupuesto
            </label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
            >
              <Plus size={12} /> Agregar item
            </button>
          </div>
          <div className="space-y-2">
            {items.length === 0 && (
              <p className="text-xs text-foreground/30 py-3">Sin items. Podés cargar un total directo abajo o sumar items aquí.</p>
            )}
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  placeholder="Concepto (ej: Diseño de landing page)"
                  className={`${inputClass} flex-1 min-w-0`}
                />
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateItem(idx, "price", e.target.value)}
                  placeholder="USD"
                  className={`${inputClass} !w-32 flex-shrink-0`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-3 text-foreground/30 hover:text-destructive flex-shrink-0"
                  aria-label="Eliminar item"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <p className="text-xs text-foreground/50 mt-3 text-right">
              Total desarrollo: <span className="text-foreground font-semibold">USD {totalDev.toLocaleString("en-US")}</span>
            </p>
          )}
        </div>

        <Field label="Mantenimiento mensual (USD, si aplica)">
          <input type="number" step="0.01" value={monthlyCost} onChange={(e) => setMonthlyCost(e.target.value)} className={inputClass} />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : isNew ? "Crear presupuesto" : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

export default BudgetEditor;
