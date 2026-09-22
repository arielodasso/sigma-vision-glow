import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Building2, FileText, DollarSign, Calendar, Shield, LogIn, ArrowRight, Users, Briefcase, Lock, Key, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  portal_enabled: boolean;
}

interface Budget {
  id: string;
  slug: string;
  client_name: string;
  status: string;
  development_cost: number | null;
  monthly_maintenance_cost: number | null;
  created_at: string;
}

interface Document {
  id: string;
  name: string;
  description: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  url: string | null;
}

const ClientPortal = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [requireAuth, setRequireAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resumen" | "presupuestos" | "documentos">("resumen");

  useEffect(() => {
    checkAuth();
    if (token) {
      fetchClientByToken(token);
    } else {
      fetchClientSettings();
    }
  }, [token]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const fetchClientSettings = async () => {
    const { data } = await supabase
      .from("crm_settings")
      .select("key, value")
      .in("key", ["client_portal_require_auth", "client_portal_base_url"]);
    if (data) {
      data.forEach((s) => {
        if (s.key === "client_portal_require_auth") setRequireAuth(s.value === "true");
      });
    }
  };

  const fetchClientByToken = async (inviteToken: string) => {
    setLoading(true);
    try {
      const { data: invite, error: inviteError } = await supabase
        .from("client_invites")
        .select("*, client:clients(*)")
        .eq("token", inviteToken)
        .eq("status", "pending")
        .single();

      if (inviteError || !invite) {
        setError("Enlace de invitación inválido o expirado");
        setLoading(false);
        return;
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError("Esta invitación ha expirado");
        setLoading(false);
        return;
      }

      setClient(invite.client as Client);
      await fetchClientData(invite.client.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientData = async (clientId: string) => {
    const [{ data: budgetsData }, { data: docsData }] = await Promise.all([
      supabase
        .from("budgets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("documents")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
    ]);

    if (budgetsData) setBudgets(budgetsData as Budget[]);
    if (docsData) setDocuments(docsData as Document[]);
  };

  if (requireAuth && !user && !token) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">Portal de Clientes</h1>
          <p className="text-foreground/60 mb-6">Acceso restringido. Inicia sesión para continuar.</p>
          <a
            href={`/auth/login?redirectTo=${encodeURIComponent(window.location.pathname)}`}
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <LogIn size={16} />
            Iniciar sesión
          </a>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <Loader2 className="animate-spin text-sigma-yellow" size={32} />
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-24">
          <div className="glass-card rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <Shield className="mx-auto text-red-400 mb-4" size={48} />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Acceso denegado</h1>
          <p className="text-foreground/60">{error || "No se encontró información del cliente"}</p>
          <Link
            to="/contacto"
            className="mt-6 inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            Contactar soporte
            <ArrowRight size={16} />
          </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    draft: "bg-amber-500/20 text-amber-400",
    sent: "bg-blue-500/20 text-blue-400",
    accepted: "bg-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    draft: "Borrador",
    sent: "Enviado",
    accepted: "Aceptado",
    rejected: "Rechazado",
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Portal de Clientes · Sigma Tecnologías</title>
        <meta name="description" content="Portal de clientes de Sigma Tecnologías" />
      </Helmet>

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-36 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-sigma-yellow/20 flex items-center justify-center">
              <Building2 className="text-sigma-yellow" size={28} />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">{client.name}</h1>
              {client.company && <p className="text-foreground/60">{client.company}</p>}
              <p className="text-sm text-foreground/40 mt-1">{client.email}</p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-5 sticky top-24"
            >
              <nav className="space-y-1">
                {[
                  { id: "resumen", label: "Resumen", icon: Briefcase },
                  { id: "presupuestos", label: "Presupuestos", icon: DollarSign },
                  { id: "documentos", label: "Documentos", icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-foreground/[0.06] text-foreground"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
                    }`}
                  >
                    <tab.icon className="text-foreground/40" size={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          </aside>

          <div className="flex-1">
            {activeTab === "resumen" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-4">Estado general</h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                      <p className="text-sm text-foreground/50">Presupuestos totales</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{budgets.length}</p>
                    </div>
                    <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                      <p className="text-sm text-foreground/50">Aceptados</p>
                      <p className="text-2xl font-bold text-emerald-400 mt-1">
                        {budgets.filter((b) => b.status === "accepted").length}
                      </p>
                    </div>
                    <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                      <p className="text-sm text-foreground/50">Documentos</p>
                      <p className="text-2xl font-bold text-foreground mt-1">{documents.length}</p>
                    </div>
                  </div>
                </div>

                {budgets.length > 0 && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="font-display text-lg font-semibold text-foreground mb-4">Últimos presupuestos</h2>
                    <div className="space-y-3">
                      {budgets.slice(0, 3).map((budget) => (
                        <div key={budget.id} className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                          <div>
                            <p className="font-medium text-foreground">{budget.slug}</p>
                            <p className="text-sm text-foreground/50">
                              {statusLabels[budget.status] || budget.status} · {formatDate(budget.created_at)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[budget.status] || "bg-gray-500/20 text-gray-400"}`}>
                            {statusLabels[budget.status] || budget.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    {budgets.length > 3 && (
                      <button
                        onClick={() => setActiveTab("presupuestos")}
                        className="mt-4 text-sm text-sigma-blue hover:text-sigma-yellow font-medium"
                      >
                        Ver todos los presupuestos →
                      </button>
                    )}
                  </div>
                )}

                {documents.length > 0 && (
                  <div className="glass-card rounded-2xl p-6">
                    <h2 className="font-display text-lg font-semibold text-foreground mb-4">Documentos recientes</h2>
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
                          <div className="flex items-center gap-3">
                            <FileText className="text-foreground/40" size={20} />
                            <div>
                              <p className="font-medium text-foreground">{doc.name}</p>
                              <p className="text-sm text-foreground/50">{formatDate(doc.created_at)}</p>
                            </div>
                          </div>
                          {doc.url && (
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-sigma-blue hover:text-sigma-yellow">
                              Ver
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                    {documents.length > 3 && (
                      <button
                        onClick={() => setActiveTab("documentos")}
                        className="mt-4 text-sm text-sigma-blue hover:text-sigma-yellow font-medium"
                      >
                        Ver todos los documentos →
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "presupuestos" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-foreground/[0.06]">
                  <h2 className="font-display text-lg font-semibold text-foreground">Presupuestos</h2>
                </div>
                {budgets.length === 0 ? (
                  <div className="p-12 text-center text-foreground/50">
                    <Briefcase className="mx-auto text-foreground/20 mb-4" size={48} />
                    <p className="text-lg">No hay presupuestos</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                          <th className="p-4">Presupuesto</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4 hidden md:table-cell">Desarrollo</th>
                          <th className="p-4 hidden lg:table-cell">Mantenimiento</th>
                          <th className="p-4">Fecha</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/[0.04]">
                        {budgets.map((budget) => (
                          <tr key={budget.id} className="hover:bg-foreground/[0.02]">
                            <td className="p-4 font-medium text-foreground">{budget.slug}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[budget.status] || "bg-gray-500/20 text-gray-400"}`}>
                                {statusLabels[budget.status] || budget.status}
                              </span>
                            </td>
                            <td className="p-4 hidden md:table-cell text-foreground/70">{formatCurrency(budget.development_cost)}</td>
                            <td className="p-4 hidden lg:table-cell text-foreground/70">{formatCurrency(budget.monthly_maintenance_cost)}</td>
                            <td className="p-4 text-foreground/50">{formatDate(budget.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "documentos" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-foreground/[0.06]">
                  <h2 className="font-display text-lg font-semibold text-foreground">Documentos</h2>
                </div>
                {documents.length === 0 ? (
                  <div className="p-12 text-center text-foreground/50">
                    <FileText className="mx-auto text-foreground/20 mb-4" size={48} />
                    <p className="text-lg">No hay documentos</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                          <th className="p-4">Documento</th>
                          <th className="p-4 hidden md:table-cell">Tipo</th>
                          <th className="p-4 hidden lg:table-cell">Tamaño</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-foreground/[0.04]">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-foreground/[0.02]">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="text-foreground/40" size={20} />
                                <p className="font-medium text-foreground">{doc.name}</p>
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell text-foreground/50 text-sm">{doc.mime_type || "—"}</td>
                            <td className="p-4 hidden lg:table-cell text-foreground/50 text-sm">
                              {doc.size_bytes ? `${(doc.size_bytes / 1024).toFixed(1)} KB` : "—"}
                            </td>
                            <td className="p-4 text-foreground/50">{formatDate(doc.created_at)}</td>
                            <td className="p-4 text-right">
                              {doc.url && (
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-sigma-blue hover:text-sigma-yellow"
                                >
                                  <ExternalLink size={14} />
                                  Descargar
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-foreground/[0.06] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-foreground/40">
          <p>Sigma Tecnologías · Portal de Clientes</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientPortal;