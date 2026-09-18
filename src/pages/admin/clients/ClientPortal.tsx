import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Server, Loader2, Save, Shield, User, Globe, Copy, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const ClientPortal = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");
  const [requireAuth, setRequireAuth] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(7);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crm_settings")
      .select("key, value")
      .in("key", ["client_portal_base_url", "client_portal_require_auth", "client_portal_token_expiry"]);
    if (data) {
      data.forEach((s) => {
        if (s.key === "client_portal_base_url") setBaseUrl(s.value || "");
        if (s.key === "client_portal_require_auth") setRequireAuth(s.value === "true");
        if (s.key === "client_portal_token_expiry") setTokenExpiry(parseInt(s.value || "7", 10));
      });
    }
    setPreviewUrl(baseUrl || `${window.location.origin}/portal/`);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "client_portal_base_url", value: baseUrl, category: "portal" },
        { key: "client_portal_require_auth", value: requireAuth.toString(), category: "portal" },
        { key: "client_portal_token_expiry", value: tokenExpiry.toString(), category: "portal" },
      ];
      for (const u of updates) {
        await supabase.from("crm_settings").upsert(u, { onConflict: "key" });
      }
      setPreviewUrl(baseUrl || `${window.location.origin}/portal/`);
      toast({ title: "Configuración guardada" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(previewUrl);
    toast({ title: "URL copiada" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Clientes · Portal · Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gradient">Portal de Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">Configura el acceso al portal de clientes</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground/60 mb-2">
              URL base del portal
            </label>
            <p className="text-xs text-foreground/40 mb-3">
              La URL donde los clientes accederán (ej: https://tudominio.com/portal)
            </p>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => { setBaseUrl(e.target.value); setPreviewUrl(e.target.value || `${window.location.origin}/portal/`); }}
              placeholder="https://portal.tudominio.com"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Requiere autenticación</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireAuth"
                  checked={requireAuth}
                  onChange={(e) => setRequireAuth(e.target.checked)}
                  className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
                />
                <label htmlFor="requireAuth" className="text-sm font-medium text-foreground">
                  Token obligatorio para acceder
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Expiración token (días)</label>
              <input
                type="number"
                min="1"
                max="90"
                value={tokenExpiry}
                onChange={(e) => setTokenExpiry(parseInt(e.target.value) || 7)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25"
              />
            </div>
          </div>

          <div className="border-t border-foreground/[0.06] pt-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="text-sigma-blue" size={20} />
              Vista previa del portal
            </h3>
            <div className="p-4 bg-foreground/[0.02] rounded-xl border border-foreground/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground/50">URL pública:</span>
                <button
                  onClick={copyUrl}
                  className="text-sm text-sigma-blue hover:text-sigma-yellow transition-colors"
                >
                  Copiar
                </button>
              </div>
              <code className="text-sm text-foreground/70 break-all bg-card px-3 py-2 rounded block">
                {previewUrl}
              </code>
            </div>
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
            <Shield className="text-sigma-blue" size={20} />
            Cómo funciona el portal
          </h3>
          <div className="space-y-3 text-sm text-foreground/70">
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <User className="text-sigma-blue" size={16} />
                1. Crear invitación
              </p>
              <p>En "Clientes → Invitaciones", crea una invitación para el cliente. Se genera un token único y se envía por email.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Shield className="text-sigma-blue" size={16} />
                2. Cliente accede
              </p>
              <p>El cliente entra a <code className="bg-card px-1 rounded">{previewUrl}{"token"}</code>. Si "Requiere autenticación" está activo, debe usar el token.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Server className="text-sigma-blue" size={16} />
                3. Ve su información
              </p>
              <p>El cliente ve: sus datos, presupuestos (estado, montos), documentos compartidos. No ve info de otros clientes.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Server className="text-sigma-blue" size={16} />
                4. RPCs de acceso
              </p>
              <p>Funciones: <code className="bg-card px-1 rounded">client_portal_info</code>, <code className="bg-card px-1 rounded">client_portal_budgets</code>, <code className="bg-card px-1 rounded">client_portal_documents</code>, <code className="bg-card px-1 rounded">client_invite_accept</code>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ClientPortal;