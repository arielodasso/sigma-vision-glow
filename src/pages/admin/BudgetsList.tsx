import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, ExternalLink, Trash2, Copy } from "lucide-react";

interface Budget {
  id: string;
  slug: string;
  client_name: string;
  development_cost: number | null;
  monthly_maintenance_cost: number | null;
  status: "draft" | "sent" | "accepted" | "rejected";
  accepted_at: string | null;
  created_at: string;
}

const STATUS: Record<Budget["status"], { label: string; cls: string }> = {
  draft: { label: "Borrador", cls: "bg-foreground/10 text-foreground/60" },
  sent: { label: "Enviado", cls: "bg-blue-500/15 text-blue-400" },
  accepted: { label: "Aceptado", cls: "bg-emerald-500/15 text-emerald-400" },
  rejected: { label: "Rechazado", cls: "bg-red-500/15 text-red-400" },
};

const BudgetsList = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetch = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("budgets")
      .select("id, slug, client_name, development_cost, monthly_maintenance_cost, status, accepted_at, created_at")
      .order("created_at", { ascending: false });
    setBudgets((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const remove = async (id: string) => {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    await supabase.from("budgets").delete().eq("id", id);
    toast({ title: "Presupuesto eliminado" });
    fetch();
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/presupuesto/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Enlace copiado" });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Presupuestos</h1>
          <p className="text-sm text-muted-foreground mt-1">Generá y compartí propuestas con tus clientes.</p>
        </div>
        <Link
          to="/admin/presupuestos/nuevo"
          className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
        >
          <Plus size={14} /> Nuevo presupuesto
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando presupuestos...</p>
      ) : budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">Todavía no creaste presupuestos. Empezá con "Nuevo presupuesto".</p>

      ) : (
        <div className="space-y-3">
          {budgets.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-foreground/[0.06] hover:border-foreground/[0.10] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground truncate">{b.client_name}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS[b.status].cls}`}>
                    {STATUS[b.status].label}
                  </span>
                </div>
                <p className="text-xs text-foreground/30 truncate">
                  /presupuesto/{b.slug} · USD {b.development_cost ?? 0}
                  {b.monthly_maintenance_cost ? ` + ${b.monthly_maintenance_cost}/mes` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => copyLink(b.slug)} className="p-2 text-foreground/30 hover:text-foreground" title="Copiar enlace">
                  <Copy size={14} />
                </button>
                <a href={`/presupuesto/${b.slug}`} target="_blank" rel="noreferrer" className="p-2 text-foreground/30 hover:text-foreground" title="Ver">
                  <ExternalLink size={14} />
                </a>
                <Link to={`/admin/presupuestos/${b.id}`} className="p-2 text-foreground/30 hover:text-foreground text-xs underline">
                  Editar
                </Link>
                <button onClick={() => remove(b.id)} className="p-2 text-foreground/30 hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetsList;
