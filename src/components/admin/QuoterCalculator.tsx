import { useEffect, useMemo, useState } from "react";
import { Plus, X, Copy, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const inputClass =
  "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

const labelClass = "block text-xs font-medium text-foreground/50 mb-1.5";

export type Region = "ar" | "latam" | "us";

export const REGIONS: Record<Region, { label: string; factor: number }> = {
  ar: { label: "Argentina", factor: 1.0 },
  latam: { label: "LATAM", factor: 1.2 },
  us: { label: "USA / Europa", factor: 1.6 },
};

type Milestone = { id: string; name: string; dev: string; qa: string };

type Params = {
  devCost: string;
  qaCost: string;
  margin: string;
  risk: string;
  region: Region;
};

const DEFAULT_PARAMS: Params = {
  devCost: "25",
  qaCost: "15",
  margin: "40",
  risk: "10",
  region: "ar",
};

const STORAGE_KEY = "sigma_cotizador_params";

const PRESETS: { label: string; name: string; dev: number; qa: number }[] = [
  { label: "Sitio Web / Landing Dinámica", name: "Sitio Web / Landing Dinámica", dev: 15, qa: 3 },
  { label: "MVP SaaS / Web App", name: "MVP SaaS / Web App", dev: 40, qa: 10 },
  { label: "Sistema de Gestión / Dashboard B2B", name: "Sistema de Gestión / Dashboard B2B", dev: 60, qa: 15 },
  { label: "Software a Medida Complejo", name: "Software a Medida Complejo", dev: 100, qa: 20 },
  { label: "Bot / Automatización / IA", name: "Bot / Automatización / IA", dev: 20, qa: 5 },
];

const uid = () => Math.random().toString(36).slice(2, 9);
const roundTo50 = (n: number) => Math.round(n / 50) * 50;
export const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const estimateDelivery = (hours: number) => {
  if (!hours) return "";
  const weeks = Math.max(1, Math.ceil(hours / 25));
  return weeks === 1 ? "1 semana" : `${weeks} semanas`;
};

export type QuoterPrefill = {
  clientName?: string;
  items?: { description: string; price: string }[];
  workType?: string;
  scope?: string;
  deliveryTime?: string;
  total?: number;
};

type Props = {
  /** When provided, replaces the "convertir en presupuesto" navigation with an apply action. */
  onApply?: (prefill: QuoterPrefill) => void;
  applyLabel?: string;
  showClientField?: boolean;
};

const QuoterCalculator = ({ onApply, applyLabel, showClientField = true }: Props) => {
  const { toast } = useToast();

  const [params, setParams] = useState<Params>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...DEFAULT_PARAMS, ...JSON.parse(raw) };
    } catch { /* ignore */ }
    return DEFAULT_PARAMS;
  });

  const [clientName, setClientName] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: uid(), name: "", dev: "", qa: "" },
  ]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  }, [params]);

  const devCost = Number(params.devCost) || 0;
  const qaCost = Number(params.qaCost) || 0;
  const marginMult = 1 + (Number(params.margin) || 0) / 100;
  const riskMult = 1 + (Number(params.risk) || 0) / 100;
  const factor = REGIONS[params.region].factor;
  const effectiveDevRate = devCost * riskMult * marginMult * factor;

  const rows = useMemo(
    () =>
      milestones.map((m) => {
        const dev = Number(m.dev) || 0;
        const qa = Number(m.qa) || 0;
        const direct = dev * devCost + qa * qaCost;
        const withRisk = direct * riskMult;
        const price = roundTo50(withRisk * marginMult * factor);
        return { ...m, devH: dev, qaH: qa, direct, withRisk, price };
      }),
    [milestones, devCost, qaCost, riskMult, marginMult, factor]
  );

  const totals = useMemo(() => {
    const hours = rows.reduce((a, r) => a + r.devH + r.qaH, 0);
    const price = rows.reduce((a, r) => a + r.price, 0);
    const direct = rows.reduce((a, r) => a + r.direct, 0);
    return { hours, price, direct, profit: price - direct, rate: hours ? price / hours : 0 };
  }, [rows]);

  const updateMilestone = (id: string, key: keyof Milestone, value: string) =>
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

  const addMilestone = () =>
    setMilestones((prev) => [...prev, { id: uid(), name: "", dev: "", qa: "" }]);

  const removeMilestone = (id: string) =>
    setMilestones((prev) => (prev.length > 1 ? prev.filter((m) => m.id !== id) : prev));

  const applyPreset = (p: (typeof PRESETS)[number]) =>
    setMilestones((prev) => {
      const base = prev.filter((m) => m.name.trim() || m.dev || m.qa);
      return [...base, { id: uid(), name: p.name, dev: String(p.dev), qa: String(p.qa) }];
    });

  const buildSummary = () => {
    const lines: string[] = [];
    lines.push("Propuesta — Sigma Tecnologías");
    if (clientName.trim()) lines.push(`Cliente: ${clientName.trim()}`);
    lines.push("");
    rows
      .filter((r) => r.devH || r.qaH || r.name.trim())
      .forEach((r, i) => {
        lines.push(`${i + 1}. ${r.name.trim() || "Módulo sin nombre"}`);
        lines.push(`   Horas: ${r.devH + r.qaH} (Dev ${r.devH} / QA ${r.qaH})`);
        lines.push(`   Inversión: ${usd(r.price)} USD`);
      });
    lines.push("");
    lines.push(`Total horas estimadas: ${totals.hours}`);
    lines.push(`Plazo estimado: ${estimateDelivery(totals.hours) || "a definir"}`);
    lines.push(`Inversión total: ${usd(totals.price)} USD`);
    return lines.join("\n");
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummary());
      toast({ title: "Resumen copiado" });
    } catch {
      toast({ title: "No se pudo copiar", variant: "destructive" });
    }
  };

  const buildPrefill = (): QuoterPrefill => ({
    clientName: clientName.trim(),
    items: rows
      .filter((r) => r.price > 0 || r.name.trim())
      .map((r) => ({
        description: `${r.name.trim() || "Módulo"} (${r.devH + r.qaH}h)`,
        price: String(r.price),
      })),
    workType: "Desarrollo de software a medida",
    scope: rows.filter((r) => r.name.trim()).map((r) => r.name.trim()).join(" · "),
    deliveryTime: estimateDelivery(totals.hours),
    total: totals.price,
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Horas totales", value: `${totals.hours} hs` },
          { label: "Precio al cliente", value: usd(totals.price) },
          { label: "Costo directo", value: usd(totals.direct) },
          { label: "Ganancia neta", value: usd(totals.profit) },
          { label: "Tarifa efectiva", value: `${usd(totals.rate)}/hs` },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-foreground/[0.06] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-wider text-foreground/40">{kpi.label}</p>
            <p className="mt-1.5 font-display text-xl font-bold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Parámetros */}
      <section className="bg-card border border-foreground/[0.06] rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Parámetros</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className={labelClass}>Costo hora Dev (USD)</label>
            <input type="number" min="0" className={inputClass} value={params.devCost}
              onChange={(e) => setParams({ ...params, devCost: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Costo hora QA (USD)</label>
            <input type="number" min="0" className={inputClass} value={params.qaCost}
              onChange={(e) => setParams({ ...params, qaCost: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Margen agencia (%)</label>
            <input type="number" min="0" className={inputClass} value={params.margin}
              onChange={(e) => setParams({ ...params, margin: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Riesgo / scope creep (%)</label>
            <input type="number" min="0" className={inputClass} value={params.risk}
              onChange={(e) => setParams({ ...params, risk: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Región del cliente</label>
            <select className={inputClass} value={params.region}
              onChange={(e) => setParams({ ...params, region: e.target.value as Region })}>
              {(Object.keys(REGIONS) as Region[]).map((k) => (
                <option key={k} value={k}>
                  {REGIONS[k].label} (x{REGIONS[k].factor})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-foreground/40">
          Tarifa Dev final estimada:{" "}
          <span className="text-foreground/70 font-medium">{usd(effectiveDevRate)}/hs</span>
        </p>
      </section>

      {/* Presets */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Presets de carga rápida</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} type="button" onClick={() => applyPreset(p)}
              className="px-4 py-2 rounded-full text-xs font-medium bg-foreground/[0.05] border border-foreground/[0.08] text-foreground/70 hover:text-foreground hover:bg-foreground/[0.09] transition-colors">
              {p.label} · {p.dev}h/{p.qa}h
            </button>
          ))}
        </div>
      </section>

      {/* Hitos */}
      <section className="bg-card border border-foreground/[0.06] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Hitos / módulos</h2>
          <button type="button" onClick={addMilestone}
            className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground transition-colors">
            <Plus size={14} /> Agregar hito
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end border-b border-foreground/[0.05] pb-3 last:border-0 last:pb-0">
              <div className="lg:col-span-4">
                <label className={labelClass}>Módulo / hito</label>
                <input className={inputClass} value={r.name} placeholder="Ej. Autenticación"
                  onChange={(e) => updateMilestone(r.id, "name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:col-span-3">
                <div>
                  <label className={labelClass}>Horas Dev</label>
                  <input type="number" min="0" className={inputClass} value={r.dev}
                    onChange={(e) => updateMilestone(r.id, "dev", e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Horas QA</label>
                  <input type="number" min="0" className={inputClass} value={r.qa}
                    onChange={(e) => updateMilestone(r.id, "qa", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 lg:col-span-4">
                <div>
                  <p className={labelClass}>Costo directo</p>
                  <p className="text-sm text-foreground/60 py-2.5">{usd(r.direct)}</p>
                </div>
                <div>
                  <p className={labelClass}>Con riesgo</p>
                  <p className="text-sm text-foreground/60 py-2.5">{usd(r.withRisk)}</p>
                </div>
                <div>
                  <p className={labelClass}>Precio cliente</p>
                  <p className="text-sm font-semibold text-foreground py-2.5">{usd(r.price)}</p>
                </div>
              </div>
              <div className="lg:col-span-1 flex lg:justify-end">
                <button type="button" onClick={() => removeMilestone(r.id)}
                  className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/[0.05] transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Acciones */}
      <section className="bg-card border border-foreground/[0.06] rounded-2xl p-5 space-y-4">
        {showClientField && (
          <div className="max-w-sm">
            <label className={labelClass}>Cliente (opcional)</label>
            <input className={inputClass} value={clientName} placeholder="Nombre del cliente"
              onChange={(e) => setClientName(e.target.value)} />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copySummary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-foreground/[0.06] border border-foreground/[0.08] text-foreground hover:bg-foreground/[0.1] transition-colors">
            <Copy size={15} /> Copiar resumen para WhatsApp/Mail
          </button>
          <button type="button" onClick={() => onApply?.(buildPrefill())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors">
            <FileText size={15} /> {applyLabel || "Convertir en presupuesto formal"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default QuoterCalculator;
