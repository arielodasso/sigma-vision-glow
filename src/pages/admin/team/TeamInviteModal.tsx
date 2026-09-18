import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, Mail, Shield, Users, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string | null;
  invited_at: string;
  accepted_at: string | null;
  invited_by: string | null;
  inviter?: { email: string; full_name: string | null };
}

interface TeamInviteModalProps {
  invite: TeamInvite | null;
  onClose: () => void;
  onSuccess: () => void;
}

const roleOptions = [
  { value: "empleado", label: "Empleado" },
  { value: "moderator", label: "Moderador" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
  { value: "user", label: "Usuario" },
];

const TeamInviteModal = ({ invite, onClose, onSuccess }: TeamInviteModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "empleado",
    expires_in_days: 7,
  });

  useEffect(() => {
    if (invite) {
      setFormData({
        email: invite.email,
        role: invite.role,
        expires_in_days: invite.expires_at ? Math.ceil((new Date(invite.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 7,
      });
    } else {
      setFormData({
        email: "",
        role: "empleado",
        expires_in_days: 7,
      });
    }
  }, [invite]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/team-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: formData.email,
          role: formData.role,
          expires_in_days: formData.expires_in_days,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear invitación");

      toast({ title: "Invitación creada" });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {invite ? "Editar invitación" : "Nueva invitación de equipo"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="nuevo@equipo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Rol *</label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Expiración (días)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.expires_in_days}
                onChange={(e) => setFormData({ ...formData, expires_in_days: parseInt(e.target.value) || 7 })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-foreground/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {invite ? "Actualizar" : "Crear y enviar"}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamInviteModal;