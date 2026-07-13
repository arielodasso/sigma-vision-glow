import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Minimal typed shim for the beta `supabase.auth.oauth` namespace.
type OAuthResult = {
  data?: {
    client?: { name?: string; logo_uri?: string; client_uri?: string };
    scopes?: string[];
    redirect_url?: string;
    redirect_to?: string;
  } | null;
  error?: { message: string } | null;
};
type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};
const oauthApi = () =>
  (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;

const OAuthConsent = () => {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";

  const [session, setSession] = useState<any>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);

  const [details, setDetails] = useState<OAuthResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setSessionLoaded(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!sessionLoaded || !session) return;
      if (!authorizationId) {
        setError("Falta authorization_id en la URL.");
        return;
      }
      try {
        const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data ?? null);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message ?? "No se pudo cargar la autorización.");
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, sessionLoaded, session]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError("Credenciales incorrectas.");
    setLoginBusy(false);
  };

  const decide = async (approve: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = approve
        ? await oauthApi().approveAuthorization(authorizationId)
        : await oauthApi().denyAuthorization(authorizationId);
      if (error) {
        setBusy(false);
        setError(error.message);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setBusy(false);
        setError("El servidor de autorización no devolvió una URL de redirección.");
        return;
      }
      window.location.href = target;
    } catch (e: any) {
      setBusy(false);
      setError(e?.message ?? "No se pudo completar la autorización.");
    }
  };

  const inputClass =
    "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

  // Not signed in → inline sign-in.
  if (sessionLoaded && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mx-auto mb-4">
              <span className="text-background font-display font-bold text-lg">Σ</span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Iniciá sesión</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Necesitás autenticarte para autorizar el acceso.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">
                Contraseña
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loginBusy}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {loginBusy ? <Loader2 size={16} className="animate-spin" /> : null}
              {loginBusy ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!sessionLoaded || (!details && !error)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-xl font-bold text-foreground mb-2">
            No se pudo cargar la solicitud
          </h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const clientName = details?.client?.name ?? "una aplicación";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <span className="text-background font-display font-bold text-lg">Σ</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Autorizar {clientName}
          </h1>
          <p className="text-sm text-muted-foreground mt-3">
            {clientName} podrá acceder a las herramientas MCP de Sigma Tecnologías
            actuando como vos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => decide(false)}
            disabled={busy}
            className="flex-1 border border-foreground/[0.1] text-foreground py-3 rounded-full text-sm font-semibold hover:bg-foreground/[0.04] transition-colors disabled:opacity-50"
          >
            Denegar
          </button>
          <button
            onClick={() => decide(true)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? "Autorizando..." : "Autorizar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OAuthConsent;
