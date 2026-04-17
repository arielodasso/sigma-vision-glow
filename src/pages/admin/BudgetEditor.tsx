import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";

const inputClass =
  "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

const randomSlug = () =>
  Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);

const BudgetEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "nuevo";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [slug, setSlug] = useState("");
  const [clientName, setClientName] = useState("");
  const [scope, setScope] = useState("");
  const [workType, setWorkType] = useState("");
  const [observations, setObservations] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [billing, setBilling] = useState("");
  const [devCost, setDevCost] = useState("");
  const [monthlyCost, setMonthlyCost] = useState("");

  useEffect(() => {
    if (isNew) {
      setSlug(randomSlug());
      return;
    }
    (async () => {
      const { data } = await supabase.from("budgets").select("*").eq("id", id).maybeSingle();
      if (data) {
        setSlug(data.slug);
        setClientName(data.client_name);
        setScope(data.scope || "");
        setWorkType(data.work_type || "");
        setObservations(data.observations || "");
        setDeliveryTime(data.delivery_time || "");
        setPaymentMethod(data.payment_method || "");
        setBilling(data.billing || "");
        setDevCost(data.development_cost?.toString() || "");
        setMonthlyCost(data.monthly_maintenance_cost?.toString() || "");
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      slug: slug.trim() || randomSlug(),
      client_name: clientName.trim(),
      scope: scope || null,
      work_type: workType || null,
      observations: observations || null,
      delivery_time: deliveryTime || null,
      payment_method: paymentMethod || null,
      billing: billing || null,
      development_cost: devCost ? Number(devCost) : null,
      monthly_maintenance_cost: monthlyCost ? Number(monthlyCost) : null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { data, error } = await supabase.from("budgets").insert(payload as any).select("id").single();
        if (error) throw error;
        toast({ title: "Presupuesto creado" });
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

  return (
    <div>
      <button
        onClick={() => navigate("/admin/presupuestos")}
        className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground mb-6"
      >
        <ArrowLeft size={14} /> Volver
      </button>

      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        {isNew ? "Nuevo presupuesto" : "Editar presupuesto"}
      </h1>

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
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Cliente *">
          <input required value={clientName} onChange={(e) => setClientName(e.target.value)} className={inputClass} />
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

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Costo total de desarrollo (USD)">
            <input type="number" step="0.01" value={devCost} onChange={(e) => setDevCost(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Mantenimiento mensual (USD, si aplica)">
            <input type="number" step="0.01" value={monthlyCost} onChange={(e) => setMonthlyCost(e.target.value)} className={inputClass} />
          </Field>
        </div>

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
