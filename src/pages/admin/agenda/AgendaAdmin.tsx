import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Calendar, Loader2, Save, ExternalLink, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const AgendaAdmin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [appointmentsUrl, setAppointmentsUrl] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crm_settings")
      .select("key, value")
      .in("key", ["google_calendar_embed_url", "google_calendar_appointments_url"]);
    if (data) {
      data.forEach((s) => {
        if (s.key === "google_calendar_embed_url") setEmbedUrl(s.value || "");
        if (s.key === "google_calendar_appointments_url") setAppointmentsUrl(s.value || "");
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "google_calendar_embed_url", value: embedUrl, category: "agenda" },
        { key: "google_calendar_appointments_url", value: appointmentsUrl, category: "agenda" },
      ];
      for (const u of updates) {
        await supabase.from("crm_settings").upsert(u, { onConflict: "key" });
      }
      toast({ title: "Configuración guardada" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Agenda · Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gradient">Agenda</h1>
          <p className="text-sm text-muted-foreground mt-1">Configura el embed de Google Calendar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground/60 mb-2">
              URL de embed (vista de calendario)
            </label>
            <p className="text-xs text-foreground/40 mb-3">
              Obtén esta URL en Google Calendar → Configuración → Integrar calendario → Código de inserción
            </p>
            <input
              type="url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://calendar.google.com/calendar/embed?src=..."
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
            {embedUrl && isValidUrl(embedUrl) && (
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-sigma-blue hover:text-sigma-yellow transition-colors"
              >
                <ExternalLink size={12} />
                Ver en Google Calendar
              </a>
            )}
          </div>

          <div className="border-t border-foreground/[0.06] pt-6">
            <label className="block text-sm font-medium text-foreground/60 mb-2">
              URL de citas (booking)
            </label>
            <p className="text-xs text-foreground/40 mb-3">
              URL para que clientes agenden citas (Google Calendar → Citas → Compartir enlace)
            </p>
            <input
              type="url"
              value={appointmentsUrl}
              onChange={(e) => setAppointmentsUrl(e.target.value)}
              placeholder="https://calendar.google.com/calendar/appointments/..."
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
            {appointmentsUrl && isValidUrl(appointmentsUrl) && (
              <a
                href={appointmentsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-sigma-blue hover:text-sigma-yellow transition-colors"
              >
                <ExternalLink size={12} />
                Ver página de citas
              </a>
            )}
          </div>

          <div className="border-t border-foreground/[0.06] pt-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Vista previa del embed</h3>
            {embedUrl && isValidUrl(embedUrl) ? (
              <div className="aspect-video bg-foreground/[0.02] rounded-xl overflow-hidden border border-foreground/[0.04]">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  title="Google Calendar"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="aspect-video bg-foreground/[0.02] rounded-xl border border-foreground/[0.04] flex items-center justify-center">
                <p className="text-foreground/40">Ingresa una URL de embed válida para ver la vista previa</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-foreground/[0.06]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Guardar configuración
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 glass-card rounded-2xl p-6"
        >
          <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="text-sigma-blue" size={20} />
            Cómo obtener las URLs
          </h3>
          <div className="space-y-4 text-sm text-foreground/70">
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2">URL de embed (vista pública)</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Abre Google Calendar en el navegador</li>
                <li>Ve a Configuración (⚙️) → Configuración</li>
                <li>En el menú izquierdo, selecciona tu calendario</li>
                <li>Baja a "Integrar calendario" → Copia el "Código de inserción"</li>
                <li>Extrae solo la URL del src del iframe</li>
              </ol>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2">URL de citas (booking)</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>En Google Calendar, ve a "Citas" (lado izquierdo)</li>
                <li>Crea o edita un horario de citas</li>
                <li>En "Compartir", copia el enlace de reserva</li>
                <li>Pégalo aquí para usar en botones de "Agendar reunión"</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgendaAdmin;