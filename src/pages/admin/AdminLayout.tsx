import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Receipt, LogOut, Menu, X } from "lucide-react";
import BlogAdminLogin from "@/components/BlogAdminLogin";

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
            <span className="font-display text-lg font-bold text-foreground">Admin</span>
            <button onClick={() => setOpen(false)} className="lg:hidden text-foreground/50">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <NavLink to="/admin/blog" end className={linkClass}>
              <FileText size={16} />
              Blog
            </NavLink>
            <NavLink to="/admin/presupuestos" className={linkClass}>
              <Receipt size={16} />
              Presupuestos
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
