import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Settings, Loader2, Save, Shield, Database, Mail, Globe, Bell, Key, Users, Palette, Terminal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

interface Setting {
  key: string;
  value: string | null;
  category: string;
  updated_at: string;
}

const SETTINGS_CATEGORIES = [
  { key: "general", label: "General", icon: Settings },
  { key: "agenda", label: "Agenda", icon: Globe },
  { key: "contacto", label: "Contacto", icon: Mail },
  { key: "portal", label: "Portal Clientes", icon: Users },
  { key: "knowledge", label: "Portal Editorial", icon: Globe },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "notifications", label: "Notificaciones", icon: Bell },
  { key: "security", label: "Seguridad", icon: Shield },
  { key: "database", label: "Base de Datos", icon: Database },
  { key: "advanced", label: "Avanzado", icon: Terminal },
];

const SettingsAdmin = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, Setting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState("general");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("crm_settings").select("*");
    if (data) {
      const map: Record<string, Setting> = {};
      data.forEach((s) => { map[s.key] = s; });
      setSettings(map);
      const vals: Record<string, string> = {};
      data.forEach((s) => { vals[s.key] = s.value || ""; });
      setFormValues(vals);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(formValues)) {
        const existing = settings[key];
        await supabase.from("crm_settings").upsert({
          key,
          value,
          category: existing?.category || "general",
        }, { onConflict: "key" });
      }
      toast({ title: "Configuración guardada" });
      fetchSettings();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getCategorySettings = (category: string) => {
    return Object.values(settings).filter((s) => s.category === category);
  };

  const inputType = (key: string) => {
    if (key.includes("url")) return "url";
    if (key.includes("email")) return "email";
    if (key.includes("phone") || key.includes("whatsapp")) return "tel";
    if (key.includes("secret") || key.includes("password") || key.includes("key")) return "password";
    return "text";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-sigma-yellow" size={48} />
          <p className="text-muted-foreground mt-4">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Configuración · Admin</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gradient">Configuración</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestiona todas las configuraciones del CRM</p>
        </motion.div>

        <div className="flex gap-6">
          {/* Sidebar categories */}
          <aside className="w-56 flex-shrink-0">
            <div className="glass-card rounded-2xl p-4 h-fit sticky top-24">
              <nav className="space-y-1">
                {SETTINGS_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const hasSettings = getCategorySettings(cat.key).length > 0;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeCategory === cat.key
                          ? "bg-foreground/[0.06] text-foreground"
                          : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
                      }`}
                    >
                      <Icon size={16} className={activeCategory === cat.key ? "text-sigma-yellow" : "text-foreground/40"} />
                      <span className="truncate">{cat.label}</span>
                      {!hasSettings && <span className="ml-auto text-[10px] text-foreground/30">vacío</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Settings form */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeCategory}
              className="glass-card rounded-2xl p-6"
            >
              <div className="mb-6">
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {SETTINGS_CATEGORIES.find((c) => c.key === activeCategory)?.label}
                </h2>
              </div>

              {(() => {
                const catSettings = getCategorySettings(activeCategory);
                if (catSettings.length === 0) {
                  return (
                    <div className="text-center py-12 text-foreground/40">
                      <Settings className="mx-auto text-foreground/20 mb-4" size={48} />
                      <p className="text-lg">No hay configuraciones en esta categoría</p>
                      <p className="text-sm mt-1">Agrega entradas en la tabla crm_settings con category="{activeCategory}"</p>
                    </div>
                  );
                }

                return (
                  <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
                    {catSettings.map((s) => (
                      <div key={s.key} className="glass-input-wrapper rounded-xl p-4">
                        <label className="block text-sm font-medium text-foreground/60 mb-2">
                          {s.key}
                          {s.key.includes("secret") || s.key.includes("password") || s.key.includes("key") && (
                            <span className="ml-2 text-xs text-red-400">(sensible)</span>
                          )}
                        </label>
                        <input
                          type={inputType(s.key)}
                          value={formValues[s.key] || ""}
                          onChange={(e) => handleChange(s.key, e.target.value)}
                          placeholder={s.key}
                          className="w-full glass-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/25"
                        />
                        <p className="text-xs text-foreground/40 mt-1">Categoría: {s.category} · Actualizado: {new Date(s.updated_at).toLocaleDateString("es-AR")}</p>
                      </div>
                    ))}
                    <div className="flex justify-end pt-4 border-t border-foreground/[0.06]">
                      <button
                        type="submit"
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
                            Guardar cambios
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                );
              })()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAdmin;