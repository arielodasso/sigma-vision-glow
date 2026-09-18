import { useEffect, useState, FormEvent } from "react";
import { X, Calendar, User, Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TaskModal = ({ task, onClose, onSuccess }: TaskModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee_id: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    due_date: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        assignee_id: task.assignee_id || "",
        priority: task.priority,
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignee_id: "",
        priority: "medium",
        due_date: "",
      });
    }
  }, [task]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("active", true)
      .order("full_name")
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[]);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      assignee_id: formData.assignee_id || null,
      priority: formData.priority,
      due_date: formData.due_date || null,
    };

    try {
      if (task) {
        const { error } = await supabase.from("tasks").update(payload).eq("id", task.id);
        if (error) throw error;
        toast({ title: "Tarea actualizada" });
      } else {
        const { error } = await supabase.from("tasks").insert(payload);
        if (error) throw error;
        toast({ title: "Tarea creada" });
      }
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Baja", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
    { value: "medium", label: "Media", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { value: "high", label: "Alta", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    { value: "urgent", label: "Urgente", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  ];

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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {task ? "Editar tarea" : "Nueva tarea"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Título *</label>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Título de la tarea"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Descripción detallada..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Asignar a</label>
              <select
                value={formData.assignee_id}
                onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
              >
                <option value="">Sin asignar</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Prioridad</label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: opt.value as "low" | "medium" | "high" | "urgent" })}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        formData.priority === opt.value
                          ? opt.color + " ring-2 ring-offset-2 ring-offset-card"
                          : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Fecha de vencimiento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm bg-card border border-foreground/[0.08]"
                  />
                </div>
              </div>
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
                  task ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TaskModal;