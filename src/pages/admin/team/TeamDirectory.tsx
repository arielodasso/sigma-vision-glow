import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Edit, Trash2, Users, Shield, Mail, Loader2, User, Building2, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import TeamMemberModal from "./TeamMemberModal";

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

const TeamDirectory = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles(role),
        manager:profiles!profiles_manager_id_fkey(full_name, email)
      `)
      .order("full_name");
    if (data) setMembers(data as unknown as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getRoles = (member: TeamMember) => member.user_roles?.map((r) => r.role) || [];

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este miembro?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Miembro eliminado" });
      fetchMembers();
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("profiles").update({ active: !active }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: active ? "Desactivado" : "Activado" });
      fetchMembers();
    }
  };

  const openCreate = () => {
    setEditingMember(null);
    setModalOpen(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Equipo · Directorio · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Directorio del Equipo</h1>
            <p className="text-sm text-muted-foreground mt-1">Gestiona miembros y roles</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nuevo miembro
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
              placeholder="Buscar miembros..."
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
              <Users className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay miembros</p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/[0.04]">
              {filtered.map((member) => {
                const roles = getRoles(member);
                const isExpanded = expandedIds.has(member.id);
                return (
                  <div key={member.id} className="hover:bg-foreground/[0.02] transition-colors">
                    <button
                      onClick={() => toggleExpand(member.id)}
                      className="w-full px-6 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.full_name || ""} className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-foreground/40" size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground truncate">{member.full_name || "Sin nombre"}</p>
                            {roles.map((r) => (
                              <span key={r} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[r] || "bg-gray-500/20 text-gray-400"}`}>
                                {roleLabels[r] || r}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-foreground/50 truncate">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          member.active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {member.active ? "Activo" : "Inactivo"}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleActive(member.id, member.active); }}
                          className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                          title={member.active ? "Desactivar" : "Activar"}
                        >
                          {member.active ? <User className="text-emerald-400" size={14} /> : <User className="text-red-400" size={14} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(member); }}
                          className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
                          className="p-2 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(member.id); }}
                          className="p-2 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-foreground/[0.02] px-6 pb-4"
                        >
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            <div>
                              <p className="text-xs text-foreground/40">Cargo</p>
                              <p className="text-sm text-foreground">{member.title || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/40">Teléfono</p>
                              <p className="text-sm text-foreground">{member.phone || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/40">WhatsApp</p>
                              <p className="text-sm text-foreground">{member.whatsapp || "—"}</p>
                            </div>
                            <div>
                              <p className="text-xs text-foreground/40">Manager</p>
                              <p className="text-sm text-foreground">{member.manager?.full_name || member.manager?.email || "—"}</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-foreground/[0.04]">
                            <p className="text-xs text-foreground/40">Creado</p>
                            <p className="text-sm text-foreground">{new Date(member.created_at).toLocaleDateString("es-AR")}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {modalOpen && (
            <TeamMemberModal
              member={editingMember}
              onClose={() => { setModalOpen(false); setEditingMember(null); }}
              onSuccess={fetchMembers}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TeamDirectory;