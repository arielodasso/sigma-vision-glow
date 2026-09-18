import { useEffect, useState, FormEvent } from "react";
import { X, Loader2, User, Shield, Mail, Key, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

interface RoleAssignment {
  user_id: string;
  role: string;
  user?: { email: string; full_name: string | null };
}

interface RoleModalProps {
  assignment: RoleAssignment | null;
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

const RoleModal = ({ assignment, onClose, onSuccess }: RoleModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [formData, setFormData] = useState({
    user_id: "",
    role: "empleado",
  });

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("active", true)
      .order("full_name")
      .then(({ data }) => {
        if (data) setUsers(data as { id: string; email: string; full_name: string | null }[]);
      });
  }, []);

  useEffect(() => {
    if (assignment) {
      setFormData({
        user_id: assignment.user_id,
        role: assignment.role,
      });
    } else {
      setFormData({
        user_id: "",
        role: "empleado",
      });
    }
  }, [assignment]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (assignment) {
        await supabase.from("user_roles").delete().eq("user_id", assignment.user_id).eq("role", assignment.role as AppRole);
      }

      const { error } = await supabase.from("user_roles").insert({
        user_id: formData.user_id,
        role: formData.role as AppRole,
      });
      if (error) throw error;

      toast({ title: assignment ? "Rol actualizado" : "Rol asignado" });
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
              {assignment ? "Editar rol" : "Asignar rol"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Usuario *</label>
              <select
                required
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                <option value="">Seleccionar usuario</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                ))}
              </select>
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
                  assignment ? "Actualizar" : "Asignar"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RoleModal;