import { useEffect, useState, FormEvent } from "react";
import { X, Calendar, Target, Loader2, CheckCircle, Play, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";

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

interface SprintModalProps {
  sprint: Sprint | null;
  onClose: () => void;
  onSuccess: () => void;
}

const statusOptions = [
  { value: "planning", label: "Planificación", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: RotateCcw },
  { value: "active", label: "Activo", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Play },
  { value: "completed", label: "Completado", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: CheckCircle },
];

const SprintModal = ({ sprint, onClose, onSuccess }: SprintModalProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "planning" as Sprint["status"],
  });

  useEffect(() => {
    if (sprint) {
      setFormData({
        name: sprint.name,
        goal: sprint.goal || "",
        start_date: sprint.start_date ? sprint.start_date.split("T")[0] : "",
        end_date: sprint.end_date ? sprint.end_date.split("T")[0] : "",
        status: sprint.status,
      });
    } else {
      setFormData({
        name: "",
        goal: "",
        start_date: "",
        end_date: "",
        status: "planning",
      });
    }
  }, [sprint]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      goal: formData.goal.trim() || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      status: formData.status,
    };

    try {
      if (sprint) {
        const { error } = await supabase.from("sprints").update(payload).eq("id", sprint.id);
        if (error) throw error;
        toast({ title: "Sprint actualizado" });
      } else {
        const { error } = await supabase.from("sprints").insert(payload);
        if (error) throw error;
        toast({ title: "Sprint creado" });
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

  const handleStatusChange = (status: Sprint["status"]) => {
    setFormData({ ...formData, status });
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
          className="bg-card border border-foreground/[0.08] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-5 border-b border-foreground/[0.06]">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {sprint ? "Editar Sprint" : "Nuevo Sprint"}
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
              <label className="block text-sm font-medium text-foreground/60 mb-2">Nombre *</label>
              <input
                type="text"
                required
                maxLength={100}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
                placeholder="Ej: Sprint 1 - Q1 2026"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Objetivo del Sprint</label>
              <textarea
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                rows={3}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 resize-none"
                placeholder="¿Qué queremos lograr en este sprint?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Fecha de inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm bg-card border border-foreground/[0.08]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/60 mb-2">Fecha de fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full glass-input rounded-xl px-10 py-3 text-sm bg-card border border-foreground/[0.08]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Estado</label>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(opt.value as "planning" | "active" | "completed")}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      formData.status === opt.value
                        ? opt.color + " ring-2 ring-offset-2 ring-offset-card"
                        : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.05]"
                    }`}
                  >
                    <opt.icon className="text-foreground" size={12} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {sprint && sprint.status === "active" && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
                <p className="flex items-center gap-2">
                  <Play size={14} />
                  Sprint activo: al cambiar a "Completado" se cerrará el sprint
                </p>
              </div>
            )}

            {sprint && (
              <div className="p-3 bg-foreground/[0.02] rounded-xl text-xs text-foreground/50">
                <p>Creado: {new Date(sprint.created_at).toLocaleDateString("es-AR")}</p>
                <p>Actualizado: {new Date(sprint.updated_at).toLocaleDateString("es-AR")}</p>
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
                  sprint ? "Actualizar" : "Crear"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SprintModal;