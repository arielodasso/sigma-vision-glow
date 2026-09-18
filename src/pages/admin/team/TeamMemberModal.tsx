import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, User, Mail, Phone, MessageCircle, Building2, Shield, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

interface TeamMember {
  id: string;
  email: string;
  full_name: string | null;
  title: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  manager_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  user_roles?: { role: string }[];
  manager?: { full_name: string | null; email: string };
}

interface TeamMemberModalProps {
  member: TeamMember | null;
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

const TeamMemberModal = ({ member, onClose, onSuccess }: TeamMemberModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<TeamMember[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    title: "",
    phone: "",
    whatsapp: "",
    manager_id: "",
    active: true,
    roles: ["empleado"] as string[],
    password: "",
  });

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("active", true)
      .order("full_name")
      .then(({ data }) => {
        if (data) setManagers(data as TeamMember[]);
      });
  }, []);

  useEffect(() => {
    if (member) {
      const roles = member.user_roles?.map((r) => r.role) || ["empleado"];
      setFormData({
        email: member.email,
        full_name: member.full_name || "",
        title: member.title || "",
        phone: member.phone || "",
        whatsapp: member.whatsapp || "",
        manager_id: member.manager_id || "",
        active: member.active,
        roles,
        password: "",
      });
    } else {
      setFormData({
        email: "",
        full_name: "",
        title: "",
        phone: "",
        whatsapp: "",
        manager_id: "",
        active: true,
        roles: ["empleado"],
        password: "",
      });
    }
  }, [member]);

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (member) {
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name.trim() || null,
            title: formData.title.trim() || null,
            phone: formData.phone.trim() || null,
            whatsapp: formData.whatsapp.trim() || null,
            manager_id: formData.manager_id || null,
            active: formData.active,
            updated_at: new Date().toISOString(),
          })
          .eq("id", member.id);
        if (error) throw error;

        await supabase.from("user_roles").delete().eq("user_id", member.id);
        if (formData.roles.length > 0) {
          const roleInserts = formData.roles.map((r) => ({ user_id: member.id, role: r as AppRole }));
          const { error: roleError } = await supabase.from("user_roles").insert(roleInserts);
          if (roleError) throw roleError;
        }
        toast({ title: "Miembro actualizado" });
      } else {
        if (!formData.password) {
          toast({ title: "Error", description: "Contraseña requerida para nuevo miembro", variant: "destructive" });
          setLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email.trim(),
          password: formData.password,
          email_confirm: true,
          user_metadata: { full_name: formData.full_name.trim() },
        });
        if (authError) throw authError;

        const userId = authData.user.id;

        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          full_name: formData.full_name.trim(),
          title: formData.title.trim() || null,
          phone: formData.phone.trim() || null,
          whatsapp: formData.whatsapp.trim() || null,
          manager_id: formData.manager_id || null,
          active: formData.active,
        });
        if (profileError) throw profileError;

        if (formData.roles.length > 0) {
          const roleInserts = formData.roles.map((r) => ({ user_id: userId, role: r as AppRole }));
          const { error: roleError } = await supabase.from("user_roles").insert(roleInserts);
          if (roleError) throw roleError;
        }
        toast({ title: "Miembro creado" });
      }
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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {member ? "Editar miembro" : "Nuevo miembro"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {!member && (
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
            )}

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Nombre completo *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Nombre completo"
              />
            </div>

            {!member && (
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Contraseña *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Cargo</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="Desarrollador, Diseñador, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Manager</label>
                <select
                  value={formData.manager_id}
                  onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="">Sin manager</option>
                  {managers.filter((m) => m.id !== member?.id).map((m) => (
                    <option key={m.id} value={m.id}>{m.full_name || m.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">WhatsApp</label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Roles</label>
              <div className="flex flex-wrap gap-2">
                {roleOptions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => handleRoleToggle(r.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.roles.includes(r.value)
                        ? "bg-sigma-yellow/20 text-sigma-yellow ring-2 ring-sigma-yellow/50"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
              />
              <label htmlFor="active" className="text-sm font-medium text-foreground">
                Activo
              </label>
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
                    Guardando...
                  </>
                ) : (
                  member ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TeamMemberModal;