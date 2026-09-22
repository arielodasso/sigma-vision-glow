import { useEffect, useState, FormEvent } from "react";
import { X, Calendar, User, Flag, Loader2, GitBranch, ArrowUpRight, Search as SearchIcon, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuth } from "@/hooks/useAuth";

interface Task {
  id: string;
  key: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  created_by: string | null;
  reporter_id: string | null;
  status: "backlog" | "pending" | "in_progress" | "in_review" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  issue_type: "epic" | "story" | "task" | "bug" | "subtask";
  story_points: number | null;
  epic_id: string | null;
  parent_id: string | null;
  sprint_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: { full_name: string | null; email: string };
  creator?: { full_name: string | null; email: string };
  reporter?: { full_name: string | null; email: string };
  epic?: { title: string; key: string | null; color: string };
  parent?: { title: string; key: string | null };
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
}

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planning" | "active" | "completed";
}

interface Epic {
  id: string;
  title: string;
  key: string;
  color: string;
}

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "backlog", label: "Backlog", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  { value: "pending", label: "Por hacer", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "in_progress", label: "En progreso", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "in_review", label: "En revisión", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "done", label: "Hecho", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const priorityOptions = [
  { value: "low", label: "Baja", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  { value: "medium", label: "Media", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "high", label: "Alta", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "urgent", label: "Urgente", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const issueTypeOptions = [
  { value: "epic", label: "Épica", icon: GitBranch, color: "text-purple-400" },
  { value: "story", label: "Historia", icon: ArrowUpRight, color: "text-emerald-400" },
  { value: "task", label: "Tarea", icon: GitBranch, color: "text-blue-400" },
  { value: "bug", label: "Bug", icon: AlertCircle, color: "text-red-400" },
  { value: "subtask", label: "Subtarea", icon: GitBranch, color: "text-gray-400" },
];

const TaskModal = ({ task, onClose, onSuccess }: TaskModalProps) => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [parentTasks, setParentTasks] = useState<Task[]>([]);
  const [showEpicSearch, setShowEpicSearch] = useState(false);
  const [showParentSearch, setShowParentSearch] = useState(false);
  const [epicSearch, setEpicSearch] = useState("");
  const [parentSearch, setParentSearch] = useState("");
  const [filteredEpics, setFilteredEpics] = useState<Epic[]>([]);
  const [filteredParents, setFilteredParents] = useState<Task[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignee_id: "",
    reporter_id: "",
    status: "backlog" as Task["status"],
    priority: "medium" as Task["priority"],
    issue_type: "task" as Task["issue_type"],
    story_points: null as number | null,
    epic_id: "" as string,
    parent_id: "" as string,
    sprint_id: "" as string,
    due_date: "",
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        assignee_id: task.assignee_id || "",
        reporter_id: task.reporter_id || "",
        status: task.status,
        priority: task.priority,
        issue_type: task.issue_type,
        story_points: task.story_points,
        epic_id: task.epic_id || "",
        parent_id: task.parent_id || "",
        sprint_id: task.sprint_id || "",
        due_date: task.due_date ? task.due_date.split("T")[0] : "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignee_id: "",
        reporter_id: currentUser?.id || "",
        status: "backlog",
        priority: "medium",
        issue_type: "task",
        story_points: null,
        epic_id: "",
        parent_id: "",
        sprint_id: "",
        due_date: "",
      });
    }
  }, [task, currentUser]);

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

  useEffect(() => {
    supabase
      .from("sprints")
      .select("*")
      .order("start_date", { ascending: false })
      .then(({ data }) => {
        if (data) setSprints(data as Sprint[]);
      });
  }, []);

  useEffect(() => {
    supabase
      .from("tasks")
      .select("id, title, key, color")
      .eq("issue_type", "epic")
      .order("title")
      .then(({ data }) => {
        if (data) setEpics(data as Epic[]);
      });
  }, []);

  useEffect(() => {
    if (formData.issue_type !== "epic" && formData.issue_type !== "subtask") {
      supabase
        .from("tasks")
        .select("id, title, key")
        .neq("issue_type", "subtask")
        .neq("id", task?.id || "")
        .order("title")
        .then(({ data }) => {
          if (data) setParentTasks(data as Task[]);
        });
    } else {
      setParentTasks([]);
    }
  }, [formData.issue_type, task?.id]);

  useEffect(() => {
    if (epicSearch) {
      const filtered = epics.filter(e =>
        e.title.toLowerCase().includes(epicSearch.toLowerCase()) ||
        e.key.toLowerCase().includes(epicSearch.toLowerCase())
      );
      setFilteredEpics(filtered);
    } else {
      setFilteredEpics(epics);
    }
  }, [epicSearch, epics]);

  useEffect(() => {
    if (parentSearch) {
      const filtered = parentTasks.filter(p =>
        p.title.toLowerCase().includes(parentSearch.toLowerCase()) ||
        p.key.toLowerCase().includes(parentSearch.toLowerCase())
      );
      setFilteredParents(filtered);
    } else {
      setFilteredParents(parentTasks);
    }
  }, [parentSearch, parentTasks]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      assignee_id: formData.assignee_id || null,
      reporter_id: formData.reporter_id || null,
      status: formData.status,
      priority: formData.priority,
      issue_type: formData.issue_type,
      story_points: formData.story_points,
      epic_id: formData.epic_id || null,
      parent_id: formData.parent_id || null,
      sprint_id: formData.sprint_id || null,
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

  const SelectWithSearch = ({
    label,
    value,
    onChange,
    options,
    searchValue,
    onSearchChange,
    filteredOptions,
    renderOption,
    placeholder,
    required,
    icon: Icon,
    className = "",
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: any[];
    searchValue: string;
    onSearchChange: (v: string) => void;
    filteredOptions: any[];
    renderOption: (opt: any) => React.ReactNode;
    placeholder: string;
    required?: boolean;
    icon?: React.ElementType;
    className?: string;
  }) => (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground/60 mb-2">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />}
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => onChange(value)}
          className="w-full glass-input rounded-xl px-10 py-3 text-sm text-foreground placeholder:text-foreground/25"
          placeholder={placeholder}
          readOnly
        />
        <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
      </div>
      {searchValue && (
        <div className="absolute z-10 w-full mt-1 glass-card rounded-xl border border-foreground/[0.08] max-h-60 overflow-y-auto">
          {filteredOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-foreground/[0.04]"
            >
              {renderOption(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );

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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {task ? "Editar issue" : "Nuevo issue"}
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
                placeholder="Título del issue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="Descripción detallada, criterios de aceptación..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectWithSearch
                label="Tipo de issue *"
                value={formData.issue_type}
                onChange={(v) => setFormData({ ...formData, issue_type: v as Task["issue_type"] })}
                options={issueTypeOptions}
                searchValue={""}
                onSearchChange={() => {}}
                filteredOptions={issueTypeOptions}
                renderOption={(opt) => (
                  <span className="flex items-center gap-2">
                    <opt.icon className={`${opt.color}`} size={14} />
                    {opt.label}
                  </span>
                )}
                placeholder="Seleccionar tipo"
                required
              />

              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Prioridad *</label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: opt.value as Task["priority"] })}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Estado *</label>
                <div className="grid grid-cols-3 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: opt.value as Task["status"] })}
                      className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        formData.status === opt.value
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
                <label className="block text-sm font-medium text-foreground/60 mb-2">Story Points</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 5, 8, 13, 21].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setFormData({ ...formData, story_points: formData.story_points === pt ? null : pt })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        formData.story_points === pt
                          ? "bg-sigma-yellow text-background"
                          : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, story_points: null })}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium text-foreground/30 hover:text-foreground/50"
                    title="Sin estimar"
                  >
                    ?
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Asignado a</label>
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

              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Reportado por</label>
                <select
                  value={formData.reporter_id}
                  onChange={(e) => setFormData({ ...formData, reporter_id: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="">Sin reporter</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectWithSearch
                label="Épica"
                value={formData.epic_id}
                onChange={(v) => setFormData({ ...formData, epic_id: v })}
                options={epics}
                searchValue={epicSearch}
                onSearchChange={setEpicSearch}
                filteredOptions={filteredEpics}
                renderOption={(opt) => (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                    <span className="font-mono text-xs text-foreground/50 mr-1">{opt.key}-</span>
                    {opt.title}
                  </span>
                )}
                placeholder="Buscar épica..."
              />

              <SelectWithSearch
                label="Issue padre"
                value={formData.parent_id}
                onChange={(v) => setFormData({ ...formData, parent_id: v })}
                options={parentTasks}
                searchValue={parentSearch}
                onSearchChange={setParentSearch}
                filteredOptions={filteredParents}
                renderOption={(opt) => (
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-xs text-foreground/50 mr-1">{opt.key}-</span>
                    {opt.title}
                  </span>
                )}
                placeholder="Buscar issue padre..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Sprint</label>
                <select
                  value={formData.sprint_id}
                  onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-3 text-sm bg-card border border-foreground/[0.08]"
                >
                  <option value="">Sin sprint (Backlog)</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === "active" && "🟢"} {s.status === "completed" && "✅"}
                    </option>
                  ))}
                </select>
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

            {task && (
              <div className="p-3 bg-foreground/[0.02] rounded-xl text-xs text-foreground/50">
                <p>Key: <span className="font-mono font-medium text-foreground">{task.key}</span></p>
                <p>Creado: {new Date(task.created_at).toLocaleDateString("es-AR")} por {task.creator?.full_name || task.creator?.email}</p>
                {task.completed_at && <p>Completado: {new Date(task.completed_at).toLocaleDateString("es-AR")}</p>}
              </div>
            )}

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