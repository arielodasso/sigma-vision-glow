import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Mail, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Submission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  attempts: number;
  created_at: string;
};

const statusConfig: Record<Submission["status"], { label: string; icon: typeof CheckCircle2; cls: string }> = {
  sent: { label: "Enviado", icon: CheckCircle2, cls: "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20" },
  failed: { label: "Fallido", icon: XCircle, cls: "text-red-400 bg-red-500/[0.08] border-red-500/20" },
  pending: { label: "Pendiente", icon: Clock, cls: "text-amber-400 bg-amber-500/[0.08] border-amber-500/20" },
};

const ContactSubmissions = () => {
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "sent" | "failed" | "pending">("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const stats = {
    total: items.length,
    sent: items.filter((i) => i.status === "sent").length,
    failed: items.filter((i) => i.status === "failed").length,
    pending: items.filter((i) => i.status === "pending").length,
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("es-AR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  return (
    <div>
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Mensajes de contacto</h1>
          <p className="text-sm text-foreground/50">Historial de envíos del formulario público</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-foreground/[0.04] hover:bg-foreground/[0.08] text-foreground/70 transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, key: "all" as const },
          { label: "Enviados", value: stats.sent, key: "sent" as const },
          { label: "Fallidos", value: stats.failed, key: "failed" as const },
          { label: "Pendientes", value: stats.pending, key: "pending" as const },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setFilter(s.key)}
            className={`text-left p-4 rounded-xl border transition-all ${
              filter === s.key
                ? "bg-foreground/[0.06] border-foreground/20"
                : "bg-card border-foreground/[0.06] hover:border-foreground/[0.12]"
            }`}
          >
            <div className="text-xs text-foreground/50 mb-1">{s.label}</div>
            <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-foreground/50">Cargando...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-foreground/[0.06] bg-card">
          <Mail size={28} className="text-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-foreground/50">No hay mensajes para mostrar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const cfg = statusConfig[s.status];
            const Icon = cfg.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className="w-full text-left p-4 rounded-xl bg-card border border-foreground/[0.06] hover:border-foreground/[0.14] transition-colors group"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-foreground text-sm">{s.name}</span>
                      <span className="text-xs text-foreground/40">·</span>
                      <span className="text-xs text-foreground/50">{s.email}</span>
                      {s.company && (
                        <>
                          <span className="text-xs text-foreground/40">·</span>
                          <span className="text-xs text-foreground/50">{s.company}</span>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 line-clamp-1">{s.message}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-foreground/40">{fmtDate(s.created_at)}</span>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border ${cfg.cls}`}>
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-foreground/[0.08] rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{selected.name}</h3>
                <a href={`mailto:${selected.email}`} className="text-sm text-foreground/60 hover:text-foreground">
                  {selected.email}
                </a>
                {selected.company && <p className="text-xs text-foreground/50 mt-0.5">{selected.company}</p>}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-foreground/40 hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 text-xs text-foreground/50">
              <span>{fmtDate(selected.created_at)}</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded-full ${statusConfig[selected.status].cls} border`}>
                {statusConfig[selected.status].label}
              </span>
              <span>·</span>
              <span>{selected.attempts} intento{selected.attempts !== 1 ? "s" : ""}</span>
            </div>
            <div className="p-4 rounded-xl bg-foreground/[0.03] border border-foreground/[0.06] mb-4">
              <p className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>
            {selected.error_message && (
              <div className="p-3 rounded-lg bg-red-500/[0.06] border border-red-500/20 mb-4">
                <p className="text-xs text-red-300 font-mono break-all">{selected.error_message}</p>
              </div>
            )}
            <a
              href={`mailto:${selected.email}?subject=Re: tu mensaje a Sigma Tecnologías`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              <Mail size={14} />
              Responder
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;
