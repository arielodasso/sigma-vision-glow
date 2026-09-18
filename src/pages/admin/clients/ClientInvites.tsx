import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Mail, Loader2, Send, Copy, ExternalLink, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import InviteModal from "./InviteModal";

interface ClientInvite {
  id: string;
  client_id: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string | null;
  invited_at: string;
  accepted_at: string | null;
  created_by: string | null;
  client?: { name: string; company: string | null };
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  accepted: "Aceptada",
  revoked: "Revocada",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400",
  accepted: "bg-emerald-500/20 text-emerald-400",
  revoked: "bg-red-500/20 text-red-400",
};

const ClientInvites = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [invites, setInvites] = useState<ClientInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState<ClientInvite | null>(null);

  const fetchInvites = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("client_invites")
      .select(`
        *,
        client:clients!client_invites_client_id_fkey(name, company)
      `)
      .order("invited_at", { ascending: false });
    if (data) setInvites(data as ClientInvite[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const filtered = invites.filter((i) =>
    i.email.toLowerCase().includes(search.toLowerCase()) ||
    i.client?.name.toLowerCase().includes(search.toLowerCase()) ||
    i.token.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta invitación?")) return;
    const { error } = await supabase.from("client_invites").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitación eliminada" });
      fetchInvites();
    }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("client_invites").update({ status: "revoked" }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Invitación revocada" });
      fetchInvites();
    }
  };

  const handleResend = async (invite: ClientInvite) => {
    try {
      const portalUrl = `${window.location.origin}/portal/${invite.token}`;
      const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || "";
      if (RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Sigma Tecnologías <contacto@sigmatecnologiasarg.com>",
            to: [invite.email],
            subject: `Acceso al portal de ${invite.client?.name || "tu cuenta"} - Sigma Tecnologías`,
            html: `
              <div style="font-family: system-ui; max-width: 600px; margin: 0 auto; background: #0B0D10; color: #fff; border-radius: 16px; overflow: hidden;">
                <div style="padding: 32px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <span style="font-weight: bold; font-size: 18px; color: #fff;">Sigma</span>
                  <span style="font-weight: 400; font-size: 18px; color: rgba(255,255,255,0.7);">Tecnologías</span>
                </div>
                <div style="padding: 32px;">
                  <h2 style="margin: 0 0 24px; font-size: 22px; color: #fff;">Acceso a tu portal</h2>
                  <p style="color: #fff; line-height: 1.6;">Hola,</p>
                  <p style="color: #fff; line-height: 1.6;">Te reenviamos el acceso al portal de <strong>${invite.client?.name || "tu cuenta"}</strong>.</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${portalUrl}" style="background: #E2FC03; color: #000; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Acceder al portal</a>
                  </div>
                  <p style="color: rgba(255,255,255,0.6); font-size: 14px;">Este enlace expira el ${invite.expires_at ? new Date(invite.expires_at).toLocaleDateString("es-AR") : "próximamente"}.</p>
                </div>
              </div>
            `,
          }),
        });
      }
      toast({ title: "Invitación reenviada" });
    } catch (e) {
      toast({ title: "Error", description: "No se pudo reenviar", variant: "destructive" });
    }
  };

  const copyPortalUrl = (token: string) => {
    const url = `${window.location.origin}/portal/${token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "URL copiada al portapapeles" });
  };

  const openCreate = () => {
    setEditingInvite(null);
    setModalOpen(true);
  };

  const openEdit = (invite: ClientInvite) => {
    setEditingInvite(invite);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Invitaciones · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Invitaciones</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona accesos al portal de clientes</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nueva invitación
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
            <input
              type="text"
              placeholder="Buscar invitaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Mail className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay invitaciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Cliente</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden md:table-cell">Expira</th>
                    <th className="p-4 hidden lg:table-cell">Creada</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((invite) => (
                    <tr key={invite.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{invite.client?.name || "Sin cliente"}</p>
                        {invite.client?.company && <p className="text-sm text-foreground/50">{invite.client.company}</p>}
                      </td>
                      <td className="p-4">
                        <p className="text-foreground/70">{invite.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[invite.status]}`}>
                          {statusLabels[invite.status]}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-foreground/50">
                        {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString("es-AR") : "Sin expiración"}
                        {invite.expires_at && new Date(invite.expires_at) < new Date() && invite.status === "pending" && (
                          <span className="ml-2 text-red-400 text-xs">(Expirado)</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-foreground/50">
                        {new Date(invite.invited_at).toLocaleDateString("es-AR")}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyPortalUrl(invite.token)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Copiar URL del portal"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleResend(invite)}
                            className="p-2 rounded-lg text-foreground/50 hover:text-sigma-blue hover:bg-sigma-blue/10 transition-colors"
                            title="Reenviar por email"
                          >
                            <Send size={14} />
                          </button>
                          {invite.status === "pending" && (
                            <button
                              onClick={() => handleRevoke(invite.id)}
                              className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Revocar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <InviteModal
              invite={editingInvite}
              onClose={() => { setModalOpen(false); setEditingInvite(null); }}
              onSuccess={fetchInvites}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientInvites;