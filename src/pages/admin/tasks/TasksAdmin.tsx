import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  User,
  ClipboardCheck,
  GitBranch,
  ArrowUpRight,
  AlertCircle,
  Target,
  List,
  Kanban,
  BarChart2,
  ClipboardList,
  GripVertical,
  TrendingDown,
  Zap,
  Play,
  RotateCcw,
  X,
  Terminal,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import TaskModal from "./TaskModal";
import SprintModal from "./SprintModal";

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
  sprint?: { name: string; status: string };
}

interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planning" | "active" | "completed";
  created_at: string;
  updated_at: string;
}

const viewModes = [
  { value: "list" as const, label: "Lista", icon: List },
  { value: "board" as const, label: "Board", icon: Kanban },
  { value: "backlog" as const, label: "Backlog", icon: ClipboardList },
  { value: "charts" as const, label: "Gráficos", icon: BarChart2 },
];

const boardColumns: { status: Task["status"]; label: string; dot: string }[] = [
  { status: "backlog", label: "Backlog", dot: "bg-gray-400" },
  { status: "pending", label: "Por hacer", dot: "bg-amber-400" },
  { status: "in_progress", label: "En progreso", dot: "bg-blue-400" },
  { status: "in_review", label: "En revisión", dot: "bg-purple-400" },
  { status: "done", label: "Hecho", dot: "bg-emerald-400" },
  { status: "cancelled", label: "Cancelado", dot: "bg-red-400" },
];

const chartTooltipStyle = {
  backgroundColor: "#0f1117",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 12,
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit" as const,
};

const chartTick = { fill: "rgba(255,255,255,0.35)", fontSize: 11 };
const chartGrid = "rgba(255,255,255,0.06)";

/* ---------- JQL-like helpers ---------- */

const normalizeStr = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

const splitClauses = (jql: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of jql) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
};

const numCompare = (a: number, op: string, b: number): boolean => {
  switch (op) {
    case ">":
      return a > b;
    case ">=":
      return a >= b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case "!=":
      return a !== b;
    default:
      return a === b;
  }
};

const dateToTs = (value: string): number | null => {
  const v = normalizeStr(value);
  const now = new Date();
  if (v === "today" || v === "now") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (v === "yesterday") {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  if (v === "startofweek") {
    const d = new Date(now);
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.getTime();
};

const textMatches = (a: string, b: string): boolean => {
  const A = normalizeStr(a);
  const B = normalizeStr(b);
  if (!B) return !A;
  return A === B || A.includes(B);
};

const cmpText = (a: string, b: string, op: string): boolean => {
  const match = textMatches(a, b);
  return op === "!=" ? !match : match;
};

const matchSprint = (t: Task, value: string): boolean => {
  const v = normalizeStr(value);
  if (v === "none" || v === "empty" || v === "null" || v === "backlog") {
    return !t.sprint_id || t.sprint?.status === "planning";
  }
  if (v === "active" || v === "inprogress") return t.sprint?.status === "active";
  if (v === "completed" || v === "done") return t.sprint?.status === "completed";
  if (v === "planning" || v === "planned") return t.sprint?.status === "planning";
  return textMatches(t.sprint?.name || "", value) || t.sprint_id === value;
};

const matchUser = (t: Task, field: "assignee" | "reporter", value: string, uid?: string): boolean => {
  const rel = field === "assignee" ? t.assignee : t.reporter;
  const id = field === "assignee" ? t.assignee_id : t.reporter_id;
  const v = normalizeStr(value);
  if (v === "me") return !!uid && id === uid;
  const hay = rel ? `${rel.full_name || ""} ${rel.email}` : "";
  return textMatches(hay, value) || (!!v && id === v);
};

const fieldCompare = (t: Task, field: string, value: string, op: string, uid?: string): boolean => {
  const v = value.trim();
  switch (field) {
    case "status":
      return cmpText(t.status, v, op);
    case "priority":
      return cmpText(t.priority, v, op);
    case "type":
    case "issuetype":
    case "issue_type":
      return cmpText(t.issue_type, v, op);
    case "title":
    case "summary":
      return cmpText(t.title, v, op);
    case "key":
    case "id":
      return cmpText(t.key || "", v, op);
    case "points":
    case "storypoints":
    case "sp":
    case "estimate":
      return numCompare(t.story_points ?? 0, op, Number(v) || 0);
    case "assignee":
    case "assigneeid":
      return matchUser(t, "assignee", v, uid);
    case "reporter":
    case "reporterid":
      return matchUser(t, "reporter", v, uid);
    case "sprint":
      return matchSprint(t, v);
    case "epic":
      return cmpText(t.epic ? `${t.epic.title} ${t.epic.key || ""}` : "", v, op);
    case "created":
    case "createdat":
    case "updated":
    case "updatedat":
    case "due":
    case "duedate":
    case "completed":
    case "completedat": {
      const bTs = dateToTs(v);
      if (bTs === null) return false;
      const source = field === "due" || field === "duedate" ? t.due_date : field === "completed" || field === "completedat" ? t.completed_at : field === "updated" || field === "updatedat" ? t.updated_at : t.created_at;
      if (!source) return op === "!=";
      const aTs = new Date(source).getTime();
      return numCompare(aTs, op, bTs);
    }
    default:
      return false;
  }
};

const matchClause = (t: Task, clause: string, uid?: string): boolean => {
  const c = clause.trim();
  const low = c.toLowerCase();
  if (low === "nosprint") return !t.sprint_id || t.sprint?.status === "planning";
  if (low === "done") return t.status === "done";
  if (low === "pending") return t.status === "pending";
  if (low === "unresolved") return t.status !== "done" && t.status !== "cancelled";
  if (low === "cancelled") return t.status === "cancelled";

  const inMatch = c.match(/^([A-Za-z]+)\s*in\s*\(([^)]+)\)$/);
  if (inMatch) {
    const field = inMatch[1].toLowerCase();
    const values = inMatch[2].split(",");
    return values.some((val) => fieldCompare(t, field, val.trim(), "=", uid));
  }

  const m = c.match(/^([A-Za-z]+)\s*(!=|>=|<=|=|>|<|:)\s*(.+)$/);
  if (m) {
    const field = m[1].toLowerCase();
    const op = m[2];
    const value = m[3].trim().replace(/^["']|["']$/g, "");
    return fieldCompare(t, field, value, op, uid);
  }

  return false;
};

const applyJql = (tasks: Task[], jql: string, uid?: string): Task[] => {
  if (!jql.trim()) return tasks;
  const clauses = splitClauses(jql);
  return tasks.filter((t) => clauses.every((c) => matchClause(t, c, uid)));
};

const invalidClauses = (jql: string): string[] => {
  if (!jql.trim()) return [];
  return splitClauses(jql).filter((c) => {
    const low = c.toLowerCase();
    if (["nosprint", "done", "pending", "unresolved", "cancelled"].includes(low)) return false;
    if (/^[A-Za-z]+\s*in\s*\([^)]+\)$/.test(c)) return false;
    return !/^[A-Za-z]+\s*(=|!=|>=|<=|>|<|:)\s*.+$/.test(c);
  });
};

const isBacklogTask = (t: Task) => !t.sprint_id || t.sprint?.status === "planning";

/* ---------- Burndown / velocity ---------- */

const buildBurndown = (sprintTasks: Task[], sprint: Sprint | null | undefined) => {
  if (!sprint?.start_date) return null;
  const start = new Date(sprint.start_date);
  start.setHours(0, 0, 0, 0);
  const endRaw = sprint.end_date ? new Date(sprint.end_date) : new Date();
  endRaw.setHours(0, 0, 0, 0);
  if (endRaw.getTime() < start.getTime()) endRaw.setTime(start.getTime());

  const total = sprintTasks.reduce((s, t) => s + (t.story_points || 0), 0);

  const doneBy = (day: Date) =>
    sprintTasks
      .filter((t) => t.status === "done" && t.completed_at && new Date(t.completed_at).getTime() <= day.getTime())
      .reduce((s, t) => s + (t.story_points || 0), 0);

  const points: { day: string; actual: number }[] = [];
  const cursor = new Date(start);
  let guard = 0;
  while (cursor.getTime() <= endRaw.getTime() && guard < 1000) {
    points.push({
      day: cursor.toISOString().split("T")[0],
      actual: Math.max(total - doneBy(cursor), 0),
    });
    cursor.setDate(cursor.getDate() + 1);
    guard++;
  }

  const n = Math.max(points.length - 1, 1);
  const datapoints = points.map((p, i) => ({
    day: p.day,
    actual: p.actual,
    ideal: Math.round((total * (n - i)) / n * 10) / 10,
  }));

  const remaining = datapoints[datapoints.length - 1]?.actual ?? total;
  const done = sprintTasks.filter((t) => t.status === "done").reduce((s, t) => s + (t.story_points || 0), 0);
  return { datapoints, total, done, remaining };
};

/* ---------- Component ---------- */

const TasksAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [jql, setJql] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>("all");
  const [sprintFilter, setSprintFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board" | "backlog" | "charts">("list");
  const [boardSprintId, setBoardSprintId] = useState<string>("all");
  const [chartSprintId, setChartSprintId] = useState<string>("");
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(full_name, email),
        creator:profiles!tasks_created_by_fkey(full_name, email),
        reporter:profiles!tasks_reporter_id_fkey(full_name, email),
        epic:tasks!tasks_epic_id_fkey(title, key, color),
        parent:tasks!tasks_parent_id_fkey(title, key),
        sprint:sprints!tasks_sprint_id_fkey(name, status)
      `)
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  const fetchSprints = async () => {
    const { data } = await supabase
      .from("sprints")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setSprints(data as Sprint[]);
      const list = data as Sprint[];
      const active = list.find((s) => s.status === "active");
      const first = list[0];
      setBoardSprintId((prev) => prev !== "all" && prev ? prev : (active?.id || first?.id || "all"));
      setChartSprintId((prev) => prev || active?.id || first?.id || "");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchSprints();
  }, []);

  const baseFiltered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.key?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
      const matchesIssueType = issueTypeFilter === "all" || t.issue_type === issueTypeFilter;
      return matchesSearch && matchesStatus && matchesPriority && matchesIssueType;
    });
  }, [tasks, search, statusFilter, priorityFilter, issueTypeFilter]);

  const jqlFiltered = useMemo(() => applyJql(baseFiltered, jql, user?.id), [baseFiltered, jql, user?.id]);

  const listTasks = useMemo(() => {
    return jqlFiltered.filter((t) => {
      if (sprintFilter === "all") return true;
      if (sprintFilter === "no_sprint") return !t.sprint_id || t.sprint?.status === "planning";
      return t.sprint_id === sprintFilter;
    });
  }, [jqlFiltered, sprintFilter]);

  const backlogTasks = useMemo(() => jqlFiltered.filter(isBacklogTask), [jqlFiltered]);

  const boardTasks = useMemo(() => {
    return jqlFiltered.filter((t) => boardSprintId === "all" || t.sprint_id === boardSprintId);
  }, [jqlFiltered, boardSprintId]);

  const backlogGroups = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of backlogTasks) {
      const key = t.sprint_id || "none";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return Array.from(map.entries())
      .map(([key, list]) => {
        const s = sprints.find((x) => x.id === key);
        list.sort(
          (a, b) =>
            (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4) ||
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const sp = list.reduce((sum, t) => sum + (t.story_points || 0), 0);
        return {
          key,
          label: s ? s.name : "Sin asignar a sprint",
          status: s?.status,
          tasks: list,
          sp,
        };
      })
      .sort((a, b) => (a.key === "none" ? 1 : a.key === b.key ? 0 : -1));
  }, [backlogTasks, sprints]);

  const chartSprint = sprints.find((s) => s.id === chartSprintId) ?? null;
  const chartTasks = useMemo(
    () => (chartSprintId ? tasks.filter((t) => t.sprint_id === chartSprintId) : []),
    [tasks, chartSprintId]
  );
  const burndown = useMemo(() => buildBurndown(chartTasks, chartSprint), [chartTasks, chartSprint]);

  const velocityData = useMemo(
    () =>
      sprints.map((s) => {
        const st = tasks.filter((t) => t.sprint_id === s.id);
        const planned = st.filter((t) => t.status !== "cancelled").reduce((sum, t) => sum + (t.story_points || 0), 0);
        const delivered = st.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.story_points || 0), 0);
        const doneCount = st.filter((t) => t.status === "done").length;
        return {
          name: s.name.length > 14 ? `${s.name.slice(0, 14)}…` : s.name,
          planned,
          delivered,
          done: doneCount,
          status: s.status,
        };
      }),
    [tasks, sprints]
  );

  const statusLabels: Record<string, string> = {
    backlog: "Backlog",
    pending: "Pendiente",
    in_progress: "En progreso",
    in_review: "En revisión",
    done: "Completada",
    cancelled: "Cancelada",
  };

  const statusColors: Record<string, string> = {
    backlog: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    in_review: "bg-purple-500/20 text-purple-400 border-purple-500/30",
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

  const issueTypeLabels: Record<string, string> = {
    epic: "Épica",
    story: "Historia",
    task: "Tarea",
    bug: "Bug",
    subtask: "Subtarea",
  };

  const issueTypeIcons: Record<string, React.ElementType> = {
    epic: GitBranch,
    story: ArrowUpRight,
    task: GitBranch,
    bug: AlertCircle,
    subtask: GitBranch,
  };

  const issueTypeColors: Record<string, string> = {
    epic: "text-purple-400",
    story: "text-emerald-400",
    task: "text-blue-400",
    bug: "text-red-400",
    subtask: "text-gray-400",
  };

  const sprintStatusLabels: Record<string, string> = {
    planning: "Planificación",
    active: "Activo",
    completed: "Completado",
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

  const handleSprintMove = async (id: string, sprintId: string) => {
    const { error } = await supabase.from("tasks").update({ sprint_id: sprintId || null }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: sprintId ? "Movida a sprint" : "Devuelta al backlog" });
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

  const openCreateSprint = () => {
    setEditingSprint(null);
    setSprintModalOpen(true);
  };

  const openEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setSprintModalOpen(true);
  };

  const handleSprintStatusChange = async (id: string, status: Sprint["status"]) => {
    const { error } = await supabase.from("sprints").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Estado del sprint actualizado" });
      fetchSprints();
      fetchTasks();
    }
  };

  const jqlInvalid = invalidClauses(jql);

  const getIssueTypeIcon = (type: Task["issue_type"]) => {
    const Icon = issueTypeIcons[type] || GitBranch;
    return <Icon className={issueTypeColors[type]} size={10} />;
  };

  const renderSprintBadge = (status?: string, name?: string) => {
    if (!name) return null;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
          status === "active"
            ? "bg-emerald-500/20 text-emerald-400"
            : status === "completed"
            ? "bg-blue-500/20 text-blue-400"
            : "bg-amber-500/20 text-amber-400"
        }`}
      >
        {name}
        {status === "active" && "🟢"}
        {status === "completed" && "✅"}
      </span>
    );
  };

  const renderBoardCard = (task: Task) => (
    <div
      key={task.id}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => openEdit(task)}
      className="group bg-card border border-foreground/[0.08] rounded-xl p-3 cursor-pointer hover:border-foreground/20 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical size={12} className="text-foreground/20 cursor-grab shrink-0 group-hover:text-foreground/40 transition-colors" />
          {task.issue_type !== "task" && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-foreground/[0.05] whitespace-nowrap">
              {getIssueTypeIcon(task.issue_type)}
              {issueTypeLabels[task.issue_type]}
            </span>
          )}
        </div>
        {task.story_points !== null && (
          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-sigma-yellow/20 text-sigma-yellow">
            {task.story_points}
          </span>
        )}
      </div>
      <div className="mt-2">
        {task.key && <span className="font-mono text-[10px] text-foreground/40">{task.key}</span>}
        <p className="text-xs font-medium text-foreground leading-snug mt-0.5 line-clamp-2">{task.title}</p>
      </div>
      <div className="flex items-center justify-between mt-3">
        {task.assignee ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-sigma-blue/20 text-sigma-blue flex items-center justify-center text-[9px] font-bold shrink-0">
              {(task.assignee.full_name || task.assignee.email).slice(0, 1).toUpperCase()}
            </span>
            <span className="text-[10px] text-foreground/60 truncate">{task.assignee.full_name || task.assignee.email}</span>
          </div>
        ) : (
          <span className="text-[10px] text-foreground/30">Sin asignar</span>
        )}
        <span className={`w-2 h-2 rounded-full shrink-0 ${priorityColors[task.priority].split(" ")[0]}`} title={priorityLabels[task.priority]} />
      </div>
      {task.due_date && (
        <p className={`mt-2 text-[10px] flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== "done" ? "text-red-400" : "text-foreground/40"}`}>
          {new Date(task.due_date).toLocaleDateString("es-AR")}
          {new Date(task.due_date) < new Date() && task.status !== "done" && <AlertTriangle size={10} />}
        </p>
      )}
    </div>
  );

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
            <p className="text-xs text-muted-foreground mt-1">Gestión ágil del equipo · Sprints, backlog y métricas</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-card border border-foreground/[0.08] rounded-lg p-1">
              {viewModes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === mode.value
                      ? "bg-foreground text-background"
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                  }`}
                >
                  <mode.icon size={14} />
                  {mode.label}
                </button>
              ))}
            </div>
            <button
              onClick={openCreateSprint}
              className="flex items-center gap-2 bg-sigma-blue text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-sigma-blue/90 transition-colors"
            >
              <Target size={16} />
              Nuevo Sprint
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              <Plus size={16} />
              Nueva tarea
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-5 mb-6 space-y-3"
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
              <option value="backlog">Backlog</option>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="in_review">En revisión</option>
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
            <select
              value={issueTypeFilter}
              onChange={(e) => setIssueTypeFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los tipos</option>
              <option value="epic">Épica</option>
              <option value="story">Historia</option>
              <option value="task">Tarea</option>
              <option value="bug">Bug</option>
              <option value="subtask">Subtarea</option>
            </select>
            <select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              className="glass-input rounded-xl px-3 py-2.5 text-xs text-foreground bg-card border border-foreground/[0.08]"
            >
              <option value="all">Todos los sprints</option>
              <option value="no_sprint">Sin sprint (Backlog)</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.status === "active" && "🟢"} {s.status === "completed" && "✅"}
                </option>
              ))}
            </select>
          </div>

          {/* JQL */}
          <div>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={15} />
              <input
                type="text"
                value={jql}
                onChange={(e) => setJql(e.target.value)}
                placeholder='Filtro JQL: status=done, priority in (high, urgent), assignee:me, sprint=active, storyPoints>=3, noSprint, due<today'
                className={`w-full glass-input rounded-xl pl-10 pr-8 py-2.5 text-xs font-mono text-foreground placeholder:text-foreground/25 ${
                  jqlInvalid.length ? "border-red-500/40" : ""
                }`}
              />
              {jql && (
                <button
                  onClick={() => setJql("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {jqlInvalid.length > 0 && (
              <p className="text-[11px] text-red-400 mt-1.5">
                Clausulas sin reconocer: {jqlInvalid.join(", ")}
              </p>
            )}
            {jql && jqlInvalid.length === 0 && (
              <p className="text-[11px] text-emerald-400 mt-1.5">
                {jqlFiltered.length} resultado(s) luego del filtro JQL
              </p>
            )}
          </div>
        </motion.div>

        {/* LIST VIEW */}
        {viewMode === "list" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">Cargando...</div>
            ) : listTasks.length === 0 ? (
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
                      <th className="p-4 hidden md:table-cell">Tipo</th>
                      <th className="p-4 hidden lg:table-cell">Puntos</th>
                      <th className="p-4 hidden xl:table-cell">Épica</th>
                      <th className="p-4 hidden md:table-cell">Asignado a</th>
                      <th className="p-4 hidden lg:table-cell">Prioridad</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 hidden lg:table-cell">Sprint</th>
                      <th className="p-4 hidden lg:table-cell">Vencimiento</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/[0.04]">
                    {listTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-foreground/[0.02] transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-medium text-foreground flex items-center gap-2">
                              {task.key && <span className="font-mono text-xs text-foreground/50">{task.key}</span>}
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                            )}
                            {task.issue_type !== "task" && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-foreground/[0.05]">
                                {getIssueTypeIcon(task.issue_type)}
                                {issueTypeLabels[task.issue_type]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {task.issue_type && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap bg-foreground/[0.05]">
                              {getIssueTypeIcon(task.issue_type)}
                              {issueTypeLabels[task.issue_type]}
                            </span>
                          )}
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {task.story_points !== null ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap bg-sigma-yellow/20 text-sigma-yellow">
                              {task.story_points} SP
                            </span>
                          ) : (
                            <span className="text-xs text-foreground/30">—</span>
                          )}
                        </td>
                        <td className="p-4 hidden xl:table-cell">
                          {task.epic ? (
                            <span className="flex items-center gap-1 text-xs text-foreground/70">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.epic.color || "#8b5cf6" }} />
                              <span className="font-mono text-foreground/50">{task.epic.key}-</span>
                              {task.epic.title}
                            </span>
                          ) : (
                            <span className="text-xs text-foreground/30">—</span>
                          )}
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
                            <option value="backlog">Backlog</option>
                            <option value="pending">Pendiente</option>
                            <option value="in_progress">En progreso</option>
                            <option value="in_review">En revisión</option>
                            <option value="done">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          {task.sprint ? renderSprintBadge(task.sprint.status, task.sprint.name) : renderSprintBadge("", "Backlog")}
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
        )}

        {/* BOARD VIEW */}
        {viewMode === "board" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Kanban size={16} className="text-foreground/50" />
                <span className="text-foreground/60 text-xs font-medium">Board de:</span>
                <select
                  value={boardSprintId}
                  onChange={(e) => setBoardSprintId(e.target.value)}
                  className="glass-input rounded-lg px-3 py-1.5 text-xs bg-card border border-foreground/[0.08]"
                >
                  <option value="all">Todos los sprints</option>
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === "active" && "🟢"} {s.status === "completed" && "✅"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-foreground/50">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" />Backlog</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Por hacer</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" />En progreso</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Hecho</span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 items-start">
              {boardColumns.map((col) => {
                const items = boardTasks.filter((t) => t.status === col.status);
                const sp = items.reduce((s, t) => s + (t.story_points || 0), 0);
                const isOver = dragOver === col.status;
                return (
                  <div
                    key={col.status}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragOver !== col.status) setDragOver(col.status);
                    }}
                    onDragLeave={() => setDragOver((prev) => (prev === col.status ? null : prev))}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = e.dataTransfer.getData("text/plain");
                      if (id) handleStatusChange(id, col.status);
                      setDragOver(null);
                    }}
                    className={`w-72 shrink-0 rounded-2xl border p-3 transition-colors ${
                      isOver ? "border-sigma-blue/50 bg-sigma-blue/[0.04]" : "border-foreground/[0.06] bg-background/40"
                    }`}
                  >
                    <div className="flex items-center justify-between px-1 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                        <span className="text-xs font-semibold text-foreground/80">{col.label}</span>
                        <span className="text-[10px] text-foreground/40 bg-foreground/[0.05] px-1.5 py-0.5 rounded-full">{items.length}</span>
                      </div>
                      {sp > 0 && <span className="text-[10px] text-foreground/40">{sp} SP</span>}
                    </div>
                    <div className="space-y-2 min-h-[80px]">
                      {items.map((task) => renderBoardCard(task))}
                      {items.length === 0 && !isOver && (
                        <div className="text-center text-[10px] text-foreground/25 py-6 border border-dashed border-foreground/[0.08] rounded-xl">
                          Arrastra issues aquí
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* BACKLOG VIEW */}
        {viewMode === "backlog" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {loading ? (
              <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">Cargando...</div>
            ) : backlogGroups.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">
                <ClipboardList className="mx-auto text-foreground/20 mb-4" size={48} />
                <p className="text-lg">Backlog vacío</p>
                <p className="text-sm mt-1">Las tareas sin sprint o en sprints de planificación aparecen acá</p>
              </div>
            ) : (
              backlogGroups.map((group) => (
                <div key={group.key} className="glass-card rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                    <Target size={14} className="text-sigma-blue" />
                    <span className="text-sm font-semibold text-foreground">{group.label}</span>
                    {group.status && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        group.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      }`}>
                        {sprintStatusLabels[group.status]}
                      </span>
                    )}
                    <span className="ml-auto text-[11px] text-foreground/50 flex items-center gap-2">
                      {group.sp > 0 && <span className="font-semibold text-sigma-yellow">{group.sp} SP</span>}
                      <span>{group.tasks.length} issues</span>
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-foreground/[0.04]">
                        {group.tasks.map((task) => (
                          <tr key={task.id} className="hover:bg-foreground/[0.02] transition-colors">
                            <td className="p-4 w-10 pl-5">
                              <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: task.epic?.color || "#8b5cf6" }} />
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                                {task.key && <span className="font-mono text-xs text-foreground/50">{task.key}</span>}
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-foreground/[0.05]">
                                  {getIssueTypeIcon(task.issue_type)}
                                  {issueTypeLabels[task.issue_type]}
                                </span>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{task.description}</p>
                              )}
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              {task.story_points !== null ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap bg-sigma-yellow/20 text-sigma-yellow">
                                  {task.story_points} SP
                                </span>
                              ) : (
                                <span className="text-xs text-foreground/30">—</span>
                              )}
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${priorityColors[task.priority]}`}>
                                {priorityLabels[task.priority]}
                              </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                              {task.assignee ? (
                                <div className="flex items-center gap-2">
                                  <User className="text-foreground/30" size={14} />
                                  <span className="text-xs text-foreground/80">{task.assignee.full_name || task.assignee.email}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-foreground/30">Sin asignar</span>
                              )}
                            </td>
                            <td className="p-4">
                              <select
                                value={task.status}
                                onChange={(e) => handleStatusChange(task.id, e.target.value as Task["status"])}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${statusColors[task.status]}`}
                              >
                                <option value="backlog">Backlog</option>
                                <option value="pending">Pendiente</option>
                                <option value="in_progress">En progreso</option>
                                <option value="in_review">En revisión</option>
                                <option value="done">Completada</option>
                                <option value="cancelled">Cancelada</option>
                              </select>
                            </td>
                            <td className="p-4 hidden sm:table-cell">
                              <select
                                value={task.sprint_id || ""}
                                onChange={(e) => handleSprintMove(task.id, e.target.value)}
                                className="glass-input rounded-lg px-2.5 py-1.5 text-[11px] text-foreground bg-card border border-foreground/[0.08]"
                              >
                                <option value="">Sin sprint</option>
                                {sprints.filter((s) => s.status !== "completed").map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name} {s.status === "active" && "🟢"}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="p-4 text-right pr-5">
                              <div className="flex items-center justify-end gap-1.5">
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
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* CHARTS VIEW */}
        {viewMode === "charts" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="glass-card rounded-2xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm">
                <BarChart2 size={16} className="text-foreground/50" />
                <span className="text-foreground/60 text-xs font-medium">Sprint para burndown:</span>
                <select
                  value={chartSprintId}
                  onChange={(e) => setChartSprintId(e.target.value)}
                  className="glass-input rounded-lg px-3 py-1.5 text-xs bg-card border border-foreground/[0.08]"
                >
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.status === "active" && "🟢"} {s.status === "completed" && "✅"}
                    </option>
                  ))}
                </select>
              </div>
              {sprints.length === 0 && <span className="text-[11px] text-foreground/40">Creá un sprint para ver métricas</span>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Burndown */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingDown size={16} className="text-sigma-blue" />
                      Burndown del sprint
                    </h3>
                    <p className="text-[11px] text-foreground/50 mt-1">Puntos restantes vs línea ideal</p>
                  </div>
                  {burndown && (
                    <div className="flex items-center gap-3 text-[11px] text-foreground/60">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" />Restante</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-foreground/30" />Ideal</span>
                    </div>
                  )}
                </div>
                {!chartSprint ? (
                  <div className="h-64 flex items-center justify-center text-xs text-foreground/40">Sin sprint seleccionado</div>
                ) : !burndown ? (
                  <div className="h-64 flex flex-col items-center justify-center text-xs text-foreground/40">
                    <RotateCcw size={24} className="mb-2 text-foreground/20" />
                    <p>El sprint no tiene fecha de inicio.</p>
                    <p className="mt-1">Definí <span className="text-foreground/60">start_date</span> en el sprint para calcular el burndown.</p>
                  </div>
                ) : burndown.datapoints.length < 2 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-foreground/40">No hay suficientes días para graficar</div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={burndown.datapoints} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                          <XAxis dataKey="day" tick={chartTick} tickFormatter={(v: string) => v.slice(5)} tickLine={false} axisLine={false} />
                          <YAxis tick={chartTick} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={chartTooltipStyle}
                            formatter={(value: number | string, name: string) => [`${value} SP`, name === "actual" ? "Restante" : "Ideal"]}
                            labelFormatter={(label) => new Date(String(label)).toLocaleDateString("es-AR")}
                          />
                          <Line type="monotone" dataKey="ideal" stroke="rgba(255,255,255,0.35)" strokeWidth={2} strokeDasharray="6 4" dot={false} />
                          <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-foreground/[0.06]">
                      <div className="text-center">
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wider">Total</p>
                        <p className="text-lg font-bold text-foreground mt-0.5">{burndown.total} SP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wider">Completado</p>
                        <p className="text-lg font-bold text-emerald-400 mt-0.5">{burndown.done} SP</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-foreground/40 uppercase tracking-wider">Restante</p>
                        <p className="text-lg font-bold text-sigma-blue mt-0.5">{burndown.remaining} SP</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Velocity */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Zap size={16} className="text-sigma-yellow" />
                      Velocidad del equipo
                    </h3>
                    <p className="text-[11px] text-foreground/50 mt-1">SP planificados vs entregados por sprint</p>
                  </div>
                </div>
                {velocityData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-foreground/40">Sin sprints</div>
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={velocityData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                          <XAxis dataKey="name" tick={chartTick} tickLine={false} axisLine={false} />
                          <YAxis tick={chartTick} tickLine={false} axisLine={false} allowDecimals={false} />
                          <Tooltip
                            cursor={{ fill: "rgba(255,255,255,0.04)" }}
                            contentStyle={chartTooltipStyle}
                            formatter={(value: number | string, name: string) => [`${value} SP`, name === "planned" ? "Planificado" : "Entregado"]}
                          />
                          <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} iconType="circle" iconSize={8} />
                          <Bar dataKey="planned" fill="rgba(255,255,255,0.25)" radius={[5, 5, 0, 0]} maxBarSize={34} />
                          <Bar dataKey="delivered" fill="#34d399" radius={[5, 5, 0, 0]} maxBarSize={34} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-foreground/[0.06]">
                      {velocityData.map((v) => (
                        <span
                          key={v.name}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                            v.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : v.status === "completed"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {v.name}
                          <span className="font-mono text-foreground/50">{v.delivered}/{v.planned}</span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Sprint list admin */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                <Play size={14} className="text-sigma-blue" />
                <span className="text-sm font-semibold text-foreground">Sprints</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-foreground/[0.06] text-left text-[11px] font-semibold text-foreground/40 uppercase tracking-wider">
                      <th className="p-4">Sprint</th>
                      <th className="p-4 hidden md:table-cell">Objetivo</th>
                      <th className="p-4 hidden lg:table-cell">Rango</th>
                      <th className="p-4 hidden lg:table-cell">SP planificados</th>
                      <th className="p-4 hidden lg:table-cell">SP entregados</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/[0.04]">
                    {sprints.map((s) => {
                      const st = tasks.filter((t) => t.sprint_id === s.id);
                      const planned = st.filter((t) => t.status !== "cancelled").reduce((sum, t) => sum + (t.story_points || 0), 0);
                      const delivered = st.filter((t) => t.status === "done").reduce((sum, t) => sum + (t.story_points || 0), 0);
                      return (
                        <tr key={s.id} className="hover:bg-foreground/[0.02] transition-colors">
                          <td className="p-4">
                            <p className="text-sm font-medium text-foreground">{s.name}</p>
                            <p className="text-[10px] font-mono text-foreground/40 mt-0.5">{s.id.slice(0, 8)}</p>
                          </td>
                          <td className="p-4 hidden md:table-cell text-xs text-foreground/60 max-w-[220px]">
                            {s.goal || <span className="text-foreground/30">Sin objetivo</span>}
                          </td>
                          <td className="p-4 hidden lg:table-cell text-xs text-foreground/60">
                            {s.start_date ? new Date(s.start_date).toLocaleDateString("es-AR") : "—"}
                            {" → "}
                            {s.end_date ? new Date(s.end_date).toLocaleDateString("es-AR") : "—"}
                          </td>
                          <td className="p-4 hidden lg:table-cell text-xs text-foreground/70">{planned} SP</td>
                          <td className="p-4 hidden lg:table-cell text-xs text-emerald-400">{delivered} SP</td>
                          <td className="p-4">
                            <select
                              value={s.status}
                              onChange={(e) => handleSprintStatusChange(s.id, e.target.value as Sprint["status"])}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${
                                s.status === "active"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : s.status === "completed"
                                  ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              <option value="planning">Planificación</option>
                              <option value="active">Activo</option>
                              <option value="completed">Completado</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditSprint(s)}
                                className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05] transition-colors"
                                title="Editar sprint"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sprints.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-muted-foreground">
                          <ClipboardCheck className="mx-auto text-foreground/20 mb-4" size={40} />
                          <p className="text-sm">Aún no hay sprints. Creá el primero con "Nuevo Sprint".</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Modals */}
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
        <AnimatePresence>
          {sprintModalOpen && (
            <SprintModal
              sprint={editingSprint}
              onClose={() => {
                setSprintModalOpen(false);
                setEditingSprint(null);
              }}
              onSuccess={() => {
                fetchSprints();
                fetchTasks();
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TasksAdmin;