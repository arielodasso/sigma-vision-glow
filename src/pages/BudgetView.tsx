import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

interface Budget {
  slug: string;
  client_name: string;
  scope: string | null;
  work_type: string | null;
  observations: string | null;
  delivery_time: string | null;
  payment_method: string | null;
  billing: string | null;
  development_cost: number | null;
  monthly_maintenance_cost: number | null;
  created_at: string;
}

const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);

const BudgetView = () => {
  const { slug } = useParams();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("budgets").select("*").eq("slug", slug!).maybeSingle();
      if (!data) setNotFound(true);
      else setBudget(data as any);
      setLoading(false);
    })();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Presupuesto · {budget.client_name} · Sigma</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 pb-6 border-b border-foreground/[0.08]">
          <div>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mb-2">Presupuesto</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">Sigma Tecnologías</h1>
          </div>
          <p className="text-xs text-foreground/40">{date}</p>
        </div>

        {/* Cliente */}
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

        {/* Costos */}
        <div className="mt-12 p-6 lg:p-8 rounded-2xl border border-foreground/[0.08] bg-card space-y-4">
          {budget.development_cost != null && (
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm text-foreground/60">Costo total de desarrollo</span>
              <span className="font-display text-2xl font-bold text-foreground">{fmtUSD(budget.development_cost)}</span>
            </div>
          )}
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
