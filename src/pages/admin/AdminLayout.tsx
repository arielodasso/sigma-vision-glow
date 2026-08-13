import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Receipt, Mail, Calculator, LogOut, Menu, X, Image as ImageIcon, BarChart3 } from "lucide-react";
import BlogAdminLogin from "@/components/BlogAdminLogin";
import sigmaIsologo from "@/assets/brand/sigma-isologo-2.png.asset.json";

const AdminLayout = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/blog");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session) return <BlogAdminLogin />;

  const linkBase = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "bg-foreground/[0.06] text-foreground" : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"}`;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-foreground/[0.06] transform transition-transform lg:transform-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col p-5">
          <div className="flex items-center justify-between mb-8 px-2">
            <NavLink to="/admin/blog" className="flex items-center gap-2.5 min-w-0">
              <img src={sigmaIsologo.url} alt="Isologo Sigma Tecnologías" className="h-8 w-8 object-contain shrink-0" />
              <span className="font-display text-sm font-bold text-foreground tracking-tight truncate">
                Sigma<span className="font-medium text-foreground/50">Tecnologías</span>
              </span>
            </NavLink>
            <button onClick={() => setOpen(false)} className="lg:hidden text-foreground/50">
              <X size={18} />
            </button>
          </div>
          <p className="px-3 mb-3 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
            Administración
          </p>

          <nav className="flex-1 space-y-1">
            <NavLink to="/admin/blog" end className={linkClass}>
              <FileText size={16} />
              Blog
            </NavLink>
            <NavLink to="/admin/presupuestos" className={linkClass}>
              <Receipt size={16} />
              Presupuestos
            </NavLink>
            <NavLink to="/admin/cotizador" className={linkClass}>
              <Calculator size={16} />
              Cotizador
            </NavLink>
            <NavLink to="/admin/multimedia" className={linkClass}>
              <ImageIcon size={16} />
              Multimedia
            </NavLink>
            <NavLink to="/admin/seo" className={linkClass}>
              <BarChart3 size={16} />
              SEO
            </NavLink>
            <NavLink to="/admin/contactos" className={linkClass}>
              <Mail size={16} />
              Contactos
            </NavLink>
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-card border border-foreground/[0.08]"
      >
        <Menu size={18} />
      </button>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="px-6 lg:px-10 py-10 max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
