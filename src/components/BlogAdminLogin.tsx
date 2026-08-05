import { useState, FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const BlogAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: "Error de autenticación",
        description: "Credenciales incorrectas.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const inputClass = "w-full bg-card border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-foreground/20 transition-colors";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-5">
            <img src={sigmaIsologo.url} alt="Isologo Sigma Tecnologías" className="h-9 w-9 object-contain" />
            <span className="font-display text-base font-bold text-foreground tracking-tight">
              Sigma<span className="font-medium text-foreground/50">Tecnologías</span>
            </span>
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Panel de administración</h1>
          <p className="text-sm text-muted-foreground mt-1">Ingresá con tu cuenta para gestionar el sitio</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Email</label>
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
            <label className="block text-xs font-medium text-foreground/40 mb-2 uppercase tracking-wide">Contraseña</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogAdminLogin;
