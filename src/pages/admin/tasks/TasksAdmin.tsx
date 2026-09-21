import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, CheckCircle, Clock, AlertTriangle, User, Mail, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, AnimatePresence } from "framer-motion";
import TaskModal from "./TaskModal";

interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string | null;
  status: "pending" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string | null; email: string };
  creator?: { full_name: string | null; email: string };
}

const TasksAdmin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name, email),
        creator:profiles!tasks_created_by_fkey(full_name, email)
      `)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En progreso",
    done: "Completada",
    cancelled: "Cancelada",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    done: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const priorityLabels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    urgent: "Urgente",
  };

  const priorityColors: Record<string, string> = {
    low: "bg-gray-500/20 text-gray-400",
    medium: "bg-blue-500/20 text-blue-400",
    high: "bg-amber-500/20 text-amber-400",
    urgent: "bg-red-500/20 text-red-400",
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tarea eliminada" });
      fetchTasks();
    }
  };

  const handleStatusChange = async (id: string, status: Task["status"]) => {
    const updates: Partial<Task> = { status };
    if (status === "done") updates.completed_at = new Date().toISOString();
    if (status !== "done") updates.completed_at = null;
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estado actualizado" });
      fetchTasks();
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tareas · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">Tareas</h1>
            <p className="text-xs text-muted-foreground mt-1">Gestiona las tareas del equipo</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            <Plus size={16} />
            Nueva tarea
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
              <input
                type="text"
                placeholder="Buscar tareas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input rounded-xl px-10 py-2.5 text-xs text-foreground placeholder:text-foreground/25"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="done">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </motion.div>

        {/* Tasks Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <ClipboardCheck className="mx-auto text-foreground/20 mb-4" size={48} />
              <p className="text-lg">No hay tareas</p>
              <p className="text-sm mt-1">Crea tu primera tarea para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/[0.06] text-left text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">
                    <th className="p-4">Tarea</th>
                    <th className="p-4 hidden md:table-cell">Asignado a</th>
                    <th className="p-4 hidden lg:table-cell">Prioridad</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 hidden lg:table-cell">Vencimiento</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/[0.04]">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <User className="text-foreground/30" size={14} />
                            <span className="text-xs text-foreground/80">{task.assignee.full_name || task.assignee.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-foreground/30">Sin asignar</span>
                        )}
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${priorityColors[task.priority]}`}>
                          {priorityLabels[task.priority]}
                        </span>
                      </td>
                      <td className="p-4">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${statusColors[task.status]}`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En progreso</option>
                          <option value="done">Completada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        {task.due_date ? (
                          <span className={`text-xs ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-400" : "text-foreground/60"}`}>
                            {new Date(task.due_date).toLocaleDateString("es-AR")}
                            {new Date(task.due_date) < new Date() && task.status !== "done" && (
                              <AlertTriangle className="inline ml-1" size={10} />
                            )}
                          </span>
                        ) : (
                          <span className="text-xs text-foreground/30">Sin fecha</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(task)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 rounded-lg text-foreground/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Task Modal */}
        <AnimatePresence>
          {modalOpen && (
            <TaskModal
              task={editingTask}
              onClose={() => {
                setModalOpen(false);
                setEditingTask(null);
              }}
              onSuccess={fetchTasks}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasksAdmin;