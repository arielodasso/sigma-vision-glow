import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { RefreshCw, TrendingUp, MousePointerClick, Eye, Gauge, AlertTriangle, ExternalLink } from "lucide-react";

interface Row { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }
interface SitemapInfo {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  errors?: string;
  warnings?: string;
  contents?: { submitted?: string; indexed?: string }[];
}
interface Metrics {
  status: string;
  siteUrl: string;
  range: { startDate: string; endDate: string };
  totals: Row | null;
  byDate: Row[];
  topQueries: Row[];
  topPages: Row[];
  sitemaps: SitemapInfo[];
  refreshedAt: string;
}

const nf = new Intl.NumberFormat("es-AR");

const SeoDashboard = () => {
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(28);

  const load = useCallback(async (range: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: fnError } = await supabase.functions.invoke("gsc-metrics", {
        body: { days: range },
      });
      if (fnError) {
        const details =
          fnError instanceof FunctionsHttpError ? await fnError.context.text() : fnError.message;
        throw new Error(details);
      }
      if (res?.error) throw new Error(res.error);
      setData(res as Metrics);
    } catch (err) {
      setError((err as Error).message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [load, days]);

  const totals = data?.totals;
  const maxImpressions = Math.max(1, ...(data?.byDate ?? []).map((d) => d.impressions));

  const kpi = [
    { label: "Clics", value: totals ? nf.format(totals.clicks) : "—", icon: MousePointerClick },
    { label: "Impresiones", value: totals ? nf.format(totals.impressions) : "—", icon: Eye },
    { label: "CTR", value: totals ? `${(totals.ctr * 100).toFixed(2)}%` : "—", icon: TrendingUp },
    { label: "Posición media", value: totals ? totals.position.toFixed(1) : "—", icon: Gauge },
  ];

  const card = "rounded-2xl border border-foreground/[0.08] bg-card p-5";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">SEO y rendimiento</h1>
          <p className="text-sm text-foreground/40 mt-1.5">
            Datos de Google Search Console{data ? ` · ${data.range.startDate} a ${data.range.endDate}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 28, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                days === d ? "bg-foreground text-background" : "text-foreground/50 hover:text-foreground border border-foreground/10"
              }`}
            >
              {d} días
            </button>
          ))}
          <button
            onClick={() => load(days)}
            className="p-2 rounded-full border border-foreground/10 text-foreground/50 hover:text-foreground"
            title="Actualizar"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 mb-6">
          <p className="flex items-center gap-2 text-sm text-destructive font-medium">
            <AlertTriangle size={15} /> No se pudieron cargar los datos
          </p>
          <p className="text-xs text-foreground/50 mt-2 break-words">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {kpi.map((k) => (
          <div key={k.label} className={card}>
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-foreground/40">
              <k.icon size={12} /> {k.label}
            </p>
            <p className="font-display text-2xl font-bold text-foreground mt-2">
              {loading ? "…" : k.value}
            </p>
          </div>
        ))}
      </div>

      {data && data.byDate.length > 0 && (
        <div className={`${card} mb-6`}>
          <p className="text-xs uppercase tracking-wide text-foreground/40 mb-4">Impresiones por día</p>
          <div className="flex items-end gap-[3px] h-32">
            {data.byDate.map((d) => (
              <div
                key={d.keys?.[0]}
                title={`${d.keys?.[0]}: ${nf.format(d.impressions)} impresiones · ${nf.format(d.clicks)} clics`}
                className="flex-1 bg-foreground/20 hover:bg-foreground/50 transition-colors rounded-sm"
                style={{ height: `${Math.max(2, (d.impressions / maxImpressions) * 100)}%` }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {([
          { title: "Consultas principales", rows: data?.topQueries ?? [] },
          { title: "Páginas principales", rows: data?.topPages ?? [] },
        ]).map((block) => (
          <div key={block.title} className={card}>
            <p className="text-xs uppercase tracking-wide text-foreground/40 mb-3">{block.title}</p>
            {block.rows.length === 0 ? (
              <p className="text-sm text-foreground/30">{loading ? "Cargando…" : "Sin datos en el período"}</p>
            ) : (
              <div className="space-y-1.5">
                {block.rows.slice(0, 10).map((r) => (
                  <div key={r.keys?.[0]} className="flex items-center gap-3 text-xs">
                    <span className="flex-1 truncate text-foreground/70">
                      {(r.keys?.[0] || "").replace("https://www.sigmatecnologiasarg.com", "")}
                    </span>
                    <span className="w-10 text-right text-foreground/50">{nf.format(r.clicks)}</span>
                    <span className="w-14 text-right text-foreground/30">{nf.format(r.impressions)}</span>
                    <span className="w-12 text-right text-foreground/30">{(r.ctr * 100).toFixed(1)}%</span>
                  </div>
                ))}
                <div className="flex items-center gap-3 text-[10px] text-foreground/25 pt-2 border-t border-foreground/[0.06]">
                  <span className="flex-1" />
                  <span className="w-10 text-right">clics</span>
                  <span className="w-14 text-right">impr.</span>
                  <span className="w-12 text-right">CTR</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={card}>
        <p className="text-xs uppercase tracking-wide text-foreground/40 mb-3">Sitemaps y errores de rastreo</p>
        {(data?.sitemaps ?? []).length === 0 ? (
          <p className="text-sm text-foreground/30">{loading ? "Cargando…" : "Sin sitemaps informados"}</p>
        ) : (
          <div className="space-y-3">
            {data!.sitemaps.map((s) => {
              const errors = Number(s.errors || 0);
              const warnings = Number(s.warnings || 0);
              const submitted = s.contents?.reduce((acc, c) => acc + Number(c.submitted || 0), 0) ?? 0;
              const indexed = s.contents?.reduce((acc, c) => acc + Number(c.indexed || 0), 0) ?? 0;
              return (
                <div key={s.path} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                  <a
                    href={s.path}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-foreground/70 hover:text-foreground"
                  >
                    {s.path.replace("https://www.sigmatecnologiasarg.com", "")}
                    <ExternalLink size={11} />
                  </a>
                  <span className="text-foreground/40">{submitted} URLs enviadas</span>
                  {indexed > 0 && <span className="text-foreground/40">{indexed} indexadas</span>}
                  <span className={errors > 0 ? "text-destructive" : "text-foreground/40"}>
                    {errors} errores
                  </span>
                  <span className="text-foreground/40">{warnings} advertencias</span>
                  {s.lastSubmitted && (
                    <span className="text-foreground/25">
                      envío: {new Date(s.lastSubmitted).toLocaleDateString("es-AR")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {data && (
        <p className="text-[11px] text-foreground/25 mt-4">
          Propiedad: {data.siteUrl} · actualizado {new Date(data.refreshedAt).toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
};

export default SeoDashboard;
