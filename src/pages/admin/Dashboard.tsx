import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  BarChart3,
  ClipboardCheck,
  Users,
  FileText,
  DollarSign,
  MessageSquare,
  Loader2,
  Calendar,
  Building2,
  Shield,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

interface Stats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalClients: number;
  activeClients: number;
  totalBudgets: number;
  pendingBudgets: number;
  totalContent: number;
  publishedContent: number;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [
        { count: totalTasks },
        { count: pendingTasks },
        { count: completedTasks },
        { count: totalClients },
        { count: activeClients },
        { count: totalBudgets },
        { count: pendingBudgets },
        { count: totalContent },
        { count: publishedContent },
        { data: tasksData },
        { data: clientsData },
      ] = await Promise.all([
        supabase.from("tasks").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).in("status", ["pending", "in_progress"]),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done"),
        supabase.from("clients").select("*", { count: "exact", head: true }),
        supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("budgets").select("*", { count: "exact", head: true }),
        supabase.from("budgets").select("*", { count: "exact", head: true }).in("status", ["draft", "sent"]),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("published", true),
        supabase.from("tasks").select("id, title, status, priority, due_date, assignee:profiles!tasks_assignee_id_fkey(full_name)").order("created_at", { ascending: false }).limit(5),
        supabase.from("clients").select("id, name, company, status").order("created_at", { ascending: false }).limit(5),
      ]);

      setStats({
        totalTasks: totalTasks || 0,
        pendingTasks: pendingTasks || 0,
        completedTasks: completedTasks || 0,
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalBudgets: totalBudgets || 0,
        pendingBudgets: pendingBudgets || 0,
        totalContent: totalContent || 0,
        publishedContent: publishedContent || 0,
      });
      setRecentTasks(tasksData || []);
      setRecentClients(clientsData || []);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    { label: "Tareas totales", value: stats?.totalTasks ?? "—", icon: ClipboardCheck, color: "text-sigma-blue", bg: "bg-sigma-blue/10" },
    { label: "Pendientes", value: stats?.pendingTasks ?? "—", icon: ClipboardCheck, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Completadas", value: stats?.completedTasks ?? "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Clientes", value: stats?.totalClients ?? "—", icon: Building2, color: "text-sigma-blue", bg: "bg-sigma-blue/10" },
    { label: "Activos", value: stats?.activeClients ?? "—", icon: Users, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Presupuestos", value: stats?.totalBudgets ?? "—", icon: DollarSign, color: "text-sigma-yellow", bg: "bg-sigma-yellow/10" },
    { label: "Pendientes", value: stats?.pendingBudgets ?? "—", icon: DollarSign, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Artículos", value: stats?.totalContent ?? "—", icon: FileText, color: "text-sigma-blue", bg: "bg-sigma-blue/10" },
    { label: "Publicados", value: stats?.publishedContent ?? "—", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    done: "bg-emerald-500/20 text-emerald-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En progreso",
    done: "Completada",
    cancelled: "Cancelada",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-400",
    medium: "bg-blue-500/20 text-blue-400",
    high: "bg-amber-500/20 text-amber-400",
    urgent: "bg-red-500/20 text-red-400",
  };

  const clientStatusColors: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    pending_payment: "bg-amber-500/20 text-amber-400",
    proposal: "bg-blue-500/20 text-blue-400",
    lost: "bg-red-500/20 text-red-400",
  };

  const clientStatusLabels: Record<string, string> = {
    active: "Activo",
    pending_payment: "Pendiente pago",
    proposal: "En propuesta",
    lost: "Perdido",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-sigma-yellow" size={48} />
      </div>
    );
  }

  // Render tasks list separately to avoid JSX parsing issues
  const renderTasksList = () => {
    if (recentTasks.length === 0) {
      return <div className="p-5 text-center text-foreground/40">No hay tareas</div>;
    }
    return recentTasks.map((task: any) => (
      <div key={task.id} className="p-5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[task.status] || "bg-gray-500/20 text-gray-400"}`}>
              {statusLabels[task.status] || task.status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[task.priority] || "bg-gray-500/20 text-gray-400"}`}>
              {task.priority}
            </span>
            {task.due_date && (
              <span className={`text-foreground/40 ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-400" : ""}`}>
                📅 {new Date(task.due_date).toLocaleDateString("es-AR")}
              </span>
            )}
            {task.assignee && (
              <span className="text-foreground/50">{task.assignee.full_name}</span>
            )}
          </div>
        </div>
      </div>
    ));
  };

  const renderClientsList = () => {
    if (recentClients.length === 0) {
      return <div className="p-5 text-center text-foreground/40">No hay clientes</div>;
    }
    return recentClients.map((client: any) => (
      <div key={client.id} className="p-5 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{client.name}</p>
          {client.company && <p className="text-sm text-foreground/50 truncate">{client.company}</p>}
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${clientStatusColors[client.status] || "bg-gray-500/20 text-gray-400"}`}>
              {clientStatusLabels[client.status] || client.status}
            </span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8"
        >
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon size={20} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-foreground/50 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-foreground/[0.06] flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <ClipboardCheck size={18} className="text-sigma-blue" />
                Tareas recientes
              </h2>
            </div>
            <div className="divide-y divide-foreground/[0.04]">
              {renderTasksList()}
            </div>
          </motion.div>

          {/* Recent Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-foreground/[0.06] flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Building2 size={18} className="text-sigma-blue" />
                Clientes recientes
              </h2>
            </div>
            <div className="divide-y divide-foreground/[0.04]">
              {renderClientsList()}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 glass-card rounded-2xl p-5"
        >
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-sigma-yellow" />
            Acciones rápidas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a href="/admin/tareas" className="glass-card rounded-xl p-4 hover:bg-foreground/[0.03] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-sigma-blue/10 flex items-center justify-center mb-3 group-hover:bg-sigma-blue/20 transition-colors">
                <ClipboardCheck size={20} className="text-sigma-blue" />
              </div>
              <p className="font-medium text-foreground">Nueva tarea</p>
              <p className="text-xs text-foreground/50 mt-1">Crear y asignar</p>
            </a>
            <a href="/admin/clientes" className="glass-card rounded-xl p-4 hover:bg-foreground/[0.03] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-3 group-hover:bg-emerald-400/20 transition-colors">
                <Building2 size={20} className="text-emerald-400" />
              </div>
              <p className="font-medium text-foreground">Nuevo cliente</p>
              <p className="text-xs text-foreground/50 mt-1">Registrar cliente</p>
            </a>
            <a href="/admin/contenidos/blog" className="glass-card rounded-xl p-4 hover:bg-foreground/[0.03] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-sigma-yellow/10 flex items-center justify-center mb-3 group-hover:bg-sigma-yellow/20 transition-colors">
                <FileText size={20} className="text-sigma-yellow" />
              </div>
              <p className="font-medium text-foreground">Nuevo artículo</p>
              <p className="text-xs text-foreground/50 mt-1">Escribir en el blog</p>
            </a>
            <a href="/admin/clientes/presupuestos" className="glass-card rounded-xl p-4 hover:bg-foreground/[0.03] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center mb-3 group-hover:bg-amber-400/20 transition-colors">
                <DollarSign size={20} className="text-amber-400" />
              </div>
              <p className="font-medium text-foreground">Nuevo presupuesto</p>
              <p className="text-xs text-foreground/50 mt-1">Crear propuesta</p>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;