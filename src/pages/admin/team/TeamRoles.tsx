import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Shield, Loader2, User, Users, Mail, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import RoleModal from "./RoleModal";

interface RoleAssignment {
  user_id: string;
  role: string;
  user?: { email: string; full_name: string | null };
}

const roleLabels: Record<string, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  moderator: "Moderador",
  empleado: "Empleado",
  user: "Usuario",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-purple-500/20 text-purple-400",
  admin: "bg-red-500/20 text-red-400",
  moderator: "bg-blue-500/20 text-blue-400",
  empleado: "bg-emerald-500/20 text-emerald-400",
  user: "bg-gray-500/20 text-gray-400",
};

const TeamRoles = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<RoleAssignment | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_roles")
      .select(`
        user_id,
        role,
        user:profiles!user_roles_user_id_fkey(email, full_name)
      `)
      .order("role");
    if (data) setAssignments(data as RoleAssignment[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((a) =>
    a.user?.email.toLowerCase().includes(search.toLowerCase()) ||
    a.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (userId: string, role: string) => {
    if (!confirm(`¿Quitar rol ${roleLabels[role] || role} a este usuario?`)) return;
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Rol removido" });
      fetchAssignments();
    }
  };

  const openCreate = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const openEdit = (assignment: RoleAssignment) => {
    setEditingAssignment(assignment);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Equipo · Roles · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Roles y Permisos</h1>
            <p className="text-sm text-muted-foreground mt-1">Asigna roles a los miembros del equipo</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Asignar rol
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
              placeholder="Buscar asignaciones..."
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
              <Shield className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay asignaciones de roles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filtered.map((a) => (
                    <tr key={`${a.user_id}-${a.role}`} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{a.user?.full_name || "Sin nombre"}</p>
                          <p className="text-sm text-foreground/50">{a.user?.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${roleColors[a.role] || "bg-gray-500/20 text-gray-400"}`}>
                          {roleLabels[a.role] || a.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(a.user_id, a.role)}
                          className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Quitar rol"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card rounded-2xl p-6"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="text-sigma-blue" size={20} />
            Jerarquía de roles
          </h3>
          <div className="space-y-3">
            {[
              { role: "superadmin", label: "Superadmin", desc: "Acceso total al sistema, gestión de roles, configuración, todo el CRM" },
              { role: "admin", label: "Admin", desc: "Gestión completa de contenidos, clientes, equipo, budgets. Sin configuración global" },
              { role: "moderator", label: "Moderador", desc: "Contenidos (blog, testimonios, FAQs, multimedia, SEO), colaboración en tareas y chat" },
              { role: "empleado", label: "Empleado", desc: "Tareas asignadas, chat, agenda, documentos, contactos. Sin gestión de usuarios" },
              { role: "user", label: "Usuario", desc: "Solo lectura básica: tareas propias, chat" },
            ].map((r) => (
              <div key={r.role} className={`flex items-center gap-3 p-4 rounded-xl ${roleColors[r.role] || "bg-gray-500/20"} border border-foreground/[0.06]`}>
                <span className="font-semibold text-sm">{r.label}</span>
                <span className="text-xs text-foreground/60">{r.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <RoleModal
              assignment={editingAssignment}
              onClose={() => { setModalOpen(false); setEditingAssignment(null); }}
              onSuccess={fetchAssignments}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamRoles;