import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Server, Loader2, Save, Globe, Copy, Shield, ExternalLink, Key, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const KnowledgePortal = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");
  const [requireAuth, setRequireAuth] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(30);
  const [allowSearch, setAllowSearch] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crm_settings")
      .select("key, value")
      .in("key", ["knowledge_portal_url", "knowledge_portal_require_auth", "knowledge_portal_token_expiry", "knowledge_portal_allow_search"]);
    if (data) {
      data.forEach((s) => {
        if (s.key === "knowledge_portal_url") setPortalUrl(s.value || "");
        if (s.key === "knowledge_portal_require_auth") setRequireAuth(s.value === "true");
        if (s.key === "knowledge_portal_token_expiry") setTokenExpiry(parseInt(s.value || "30", 10));
        if (s.key === "knowledge_portal_allow_search") setAllowSearch(s.value === "true");
      });
    }
    setPreviewUrl(portalUrl || `${window.location.origin}/knowledge`);
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: "knowledge_portal_url", value: portalUrl, category: "knowledge" },
        { key: "knowledge_portal_require_auth", value: requireAuth.toString(), category: "knowledge" },
        { key: "knowledge_portal_token_expiry", value: tokenExpiry.toString(), category: "knowledge" },
        { key: "knowledge_portal_allow_search", value: allowSearch.toString(), category: "knowledge" },
      ];
      for (const u of updates) {
        await supabase.from("crm_settings").upsert(u, { onConflict: "key" });
      }
      setPreviewUrl(portalUrl || `${window.location.origin}/knowledge`);
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
        <title>Conocimiento · Portal Editorial · Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-gradient">Portal Editorial</h1>
          <p className="text-sm text-muted-foreground mt-1">Configura el portal público de documentación</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-foreground/60 mb-2">
              URL del portal público
            </label>
            <p className="text-xs text-foreground/40 mb-3">
              URL donde estará accesible el portal (ej: https://docs.tudominio.com)
            </p>
            <input
              type="url"
              value={portalUrl}
              onChange={(e) => { setPortalUrl(e.target.value); setPreviewUrl(e.target.value || `${window.location.origin}/knowledge`); }}
              placeholder="https://docs.tudominio.com"
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
                  Login obligatorio para ver contenido
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Permitir búsqueda</label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowSearch"
                  checked={allowSearch}
                  onChange={(e) => setAllowSearch(e.target.checked)}
                  className="w-4 h-4 rounded border-foreground/[0.2] text-sigma-yellow focus:ring-sigma-yellow"
                />
                <label htmlFor="allowSearch" className="text-sm font-medium text-foreground">
                  Buscador público en el portal
                </label>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground/60 mb-2">Expiración sesión (días)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={tokenExpiry}
                onChange={(e) => setTokenExpiry(parseInt(e.target.value) || 30)}
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
            Cómo funciona el portal editorial
          </h3>
          <div className="space-y-3 text-sm text-foreground/70">
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Server className="text-sigma-blue" size={16} />
                1. Documentos internos → Portal público
              </p>
              <p>Los documentos creados en "Conocimiento → Documentos" con categoría y publicados= true aparecen automáticamente en el portal.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Shield className="text-sigma-blue" size={16} />
                2. Control de acceso
              </p>
              <p>Si "Requiere autenticación" está activo, los usuarios deben iniciar sesión (Supabase Auth) para ver el contenido.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Key className="text-sigma-blue" size={16} />
                3. Sesiones
              </p>
              <p>La expiración de sesión controla cuánto tiempo dura el login sin actividad.</p>
            </div>
            <div className="p-4 bg-foreground/[0.02] rounded-xl">
              <p className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Globe className="text-sigma-blue" size={16} />
                4. SEO y búsqueda
              </p>
              <p>Con "Permitir búsqueda" activo, el portal incluye un buscador indexado. Las páginas tienen meta tags para SEO.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KnowledgePortal;