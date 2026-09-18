import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Database, Loader2, User, Users, ChevronDown, ChevronRight, Plus, Edit, Trash2, Shield } from "lucide-react";
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
  children?: TeamMember[];
}

const TeamOrgChart = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

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
    if (data) {
      const all = data as unknown as TeamMember[];
      const map = new Map(all.map((m) => [m.id, { ...m, children: [] }]));
      const roots: TeamMember[] = [];
      all.forEach((m) => {
        const withChildren = map.get(m.id)!;
        if (m.manager_id && map.has(m.manager_id)) {
          map.get(m.manager_id)!.children!.push(withChildren);
        } else {
          roots.push(withChildren);
        }
      });
      setMembers(roots);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const getRoles = (member: TeamMember) => member.user_roles?.map((r) => r.role) || [];

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

  const renderNode = (member: TeamMember, depth = 0) => {
    const roles = getRoles(member);
    const isExpanded = expandedIds.has(member.id);
    const hasChildren = member.children && member.children.length > 0;

    return (
      <div key={member.id} className={`ml-${depth * 8}`}>
        <div className="flex items-center gap-3 p-3 glass-card rounded-xl">
          <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
            {member.avatar_url ? (
              <img src={member.avatar_url} alt={member.full_name || ""} className="w-full h-full object-cover" />
            ) : (
              <User className="text-foreground/40" size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-foreground truncate">{member.full_name || "Sin nombre"}</p>
              {roles.map((r) => (
                <span key={r} className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${roleColors[r] || "bg-gray-500/20 text-gray-400"}`}>
                  {roleLabels[r] || r}
                </span>
              ))}
            </div>
            <p className="text-xs text-foreground/50 truncate">{member.email}</p>
          </div>
          {hasChildren && (
            <button
              onClick={() => toggleExpand(member.id)}
              className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(member); }}
              className="p-1 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
              title="Editar"
            >
              <Edit size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }}
              className="p-1 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1 border-l-2 border-foreground/[0.06] pl-4"
            >
              {member.children!.map((child) => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Equipo · Organigrama · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-3xl font-bold text-gradient">Organigrama</h1>
            <p className="text-sm text-muted-foreground mt-1">Visualiza la estructura jerárquica del equipo</p>
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
          className="glass-card rounded-2xl p-6"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando...</div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Database className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay miembros</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((root) => renderNode(root))}
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

export default TeamOrgChart;