import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Download, Check, X } from "lucide-react";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID || "qxkeungqbgaytxdfhccn";

interface Item { description: string; price: number }
type Status = "draft" | "sent" | "accepted" | "rejected";

interface Budget {
  slug: string;
  client_name: string;
  scope: string | null;
  work_type: string | null;
  observations: string | null;
  delivery_time: string | null;
  payment_method: string | null;
  billing: string | null;
  items: Item[];
  development_cost: number | null;
  monthly_maintenance_cost: number | null;
  status: Status;
  accepted_at: string | null;
  created_at: string;
}

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const STATUS_LABELS: Record<Status, string> = {
  draft: "Borrador",
  sent: "Enviado",
  accepted: "Aceptado",
  rejected: "Rechazado",
};

const BudgetView = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [acting, setActing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase.from("budgets").select("*").eq("slug", slug!).maybeSingle();
    if (!data) setNotFound(true);
    else setBudget(data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, [slug]);

  const respond = async (newStatus: "accepted" | "rejected") => {
    if (!budget) return;
    if (!confirm(newStatus === "accepted" ? "¿Aceptar este presupuesto?" : "¿Rechazar este presupuesto?")) return;
    setActing(true);
    const { error } = await supabase.rpc("set_budget_status", {
      _slug: budget.slug,
      _status: newStatus,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus === "accepted" ? "Presupuesto aceptado" : "Presupuesto rechazado" });
      await load();
    }
    setActing(false);
  };

  const downloadPdf = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, jspdfMod] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: getComputedStyle(document.body).backgroundColor || "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jspdfMod.jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pageH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pageH;
      }
      pdf.save(`presupuesto-${budget?.slug || "sigma"}.pdf`);
    } catch (e: any) {
      toast({ title: "Error al generar PDF", description: e.message, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (notFound || !budget) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Presupuesto no encontrado.</p>
      </div>
    );
  }

  const date = new Date(budget.created_at).toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const items = Array.isArray(budget.items) ? budget.items : [];
  const itemsTotal = items.reduce((a, i) => a + (Number(i.price) || 0), 0);
  const devTotal = budget.development_cost ?? itemsTotal;

  const statusColor: Record<Status, string> = {
    draft: "bg-foreground/10 text-foreground/60",
    sent: "bg-blue-500/15 text-blue-400",
    accepted: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-red-500/15 text-red-400",
  };

  const canRespond = budget.status === "draft" || budget.status === "sent";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Presupuesto · {budget.client_name} · Sigma</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Action bar (excluded from PDF) */}
      <div className="max-w-3xl mx-auto px-6 pt-8 flex flex-wrap items-center justify-between gap-3">
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColor[budget.status]}`}>
          {STATUS_LABELS[budget.status]}
          {budget.accepted_at && ` · ${new Date(budget.accepted_at).toLocaleDateString("es-AR")}`}
        </span>
        <div className="flex items-center gap-2">
          {canRespond && (
            <>
              <button
                onClick={() => respond("rejected")}
                disabled={acting}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-full border border-foreground/[0.10] text-foreground/70 hover:text-foreground hover:border-foreground/20 disabled:opacity-50 transition-colors"
              >
                <X size={14} /> Rechazar
              </button>
              <button
                onClick={() => respond("accepted")}
                disabled={acting}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                <Check size={14} /> Aceptar
              </button>
            </>
          )}
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
          >
            <Download size={14} /> {downloading ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      <div ref={printRef} className="max-w-3xl mx-auto px-6 py-10 lg:py-16 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-foreground/[0.08]">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mb-2">Presupuesto</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Sigma Tecnologías</h1>
          </div>
          <p className="text-xs text-foreground/40">{date}</p>
        </div>

        <Section label="Cliente">
          <p className="text-lg text-foreground">{budget.client_name}</p>
        </Section>

        {budget.scope && (
          <Section label="El presupuesto contempla">
            <Multiline text={budget.scope} />
          </Section>
        )}

        {budget.work_type && (
          <Section label="Tipo de trabajo y metodología">
            <Multiline text={budget.work_type} />
          </Section>
        )}

        {budget.observations && (
          <Section label="Observaciones">
            <Multiline text={budget.observations} />
          </Section>
        )}

        <div className="grid sm:grid-cols-2 gap-8">
          {budget.delivery_time && (
            <Section label="Plazo de entrega">
              <p className="text-foreground">{budget.delivery_time}</p>
            </Section>
          )}
          {budget.payment_method && (
            <Section label="Forma de pago">
              <Multiline text={budget.payment_method} />
            </Section>
          )}
        </div>

        {budget.billing && (
          <Section label="Facturación">
            <Multiline text={budget.billing} />
          </Section>
        )}

        {/* Items */}
        {items.length > 0 && (
          <Section label="Detalle">
            <div className="rounded-xl border border-foreground/[0.08] overflow-hidden">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className={`flex items-baseline justify-between gap-4 px-5 py-3 ${
                    idx > 0 ? "border-t border-foreground/[0.06]" : ""
                  }`}
                >
                  <span className="text-foreground/80 text-sm">{it.description}</span>
                  <span className="text-foreground font-medium text-sm whitespace-nowrap">{fmtUSD(Number(it.price) || 0)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Costos */}
        <div className="mt-12 p-6 lg:p-8 rounded-2xl border border-foreground/[0.08] bg-card space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm text-foreground/60">Costo total de desarrollo</span>
            <span className="font-display text-2xl font-bold text-foreground">{fmtUSD(devTotal)}</span>
          </div>
          {budget.monthly_maintenance_cost != null && (
            <div className="flex items-baseline justify-between gap-4 pt-4 border-t border-foreground/[0.06]">
              <span className="text-sm text-foreground/60">Mantenimiento mensual</span>
              <span className="font-display text-xl font-semibold text-foreground">
                {fmtUSD(budget.monthly_maintenance_cost)}<span className="text-sm text-foreground/40">/mes</span>
              </span>
            </div>
          )}
          <p className="text-xs text-foreground/40 pt-4 border-t border-foreground/[0.06] italic">
            *Valor en USD. Conversión al tipo de cambio vendedor del día de pago.
          </p>
        </div>

        <p className="text-xs text-foreground/30 text-center mt-12">
          Sigma Tecnologías · sigmatecnologiasarg.com
        </p>
      </div>
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <p className="text-xs uppercase tracking-widest text-foreground/40 mb-3">{label}</p>
    {children}
  </div>
);

const Multiline = ({ text }: { text: string }) => (
  <div className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{text}</div>
);

export default BudgetView;
