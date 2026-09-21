import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Receipt,
  Calculator,
  LogOut,
  Menu,
  X,
  Image as ImageIcon,
  BarChart3,
  ClipboardCheck,
  Calendar,
  Users,
  MessageSquare,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Building2,
  Shield,
  BookOpen,
  Star,
  Server,
  Database as DatabaseIcon,
  Settings,
  ChevronDown,
  ChevronUp,
  Mail,
} from "lucide-react";
import BlogAdminLogin from "@/components/BlogAdminLogin";
import sigmaIsologo from "@/assets/brand/sigma-isologo-2.png.asset.json";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

type NavSection = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: NavItem[];
  permission?: string;
  roles?: AppRole[];
};

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  permission?: string;
  roles?: AppRole[];
};

const NAV_CONFIG: NavSection[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    href: "/admin",
    permission: "tasks.read",
  },
  {
    label: "Tareas",
    icon: <ClipboardCheck size={16} />,
    href: "/admin/tareas",
    permission: "tasks.read",
  },
  {
    label: "Contenidos",
    icon: <FileText size={16} />,
    children: [
      { label: "Blog", icon: <BookOpen size={14} />, href: "/admin/contenidos/blog", permission: "contents.manage" },
      { label: "Testimonios", icon: <Star size={14} />, href: "/admin/contenidos/testimonios", permission: "contents.manage" },
      { label: "FAQs", icon: <HelpCircle size={14} />, href: "/admin/contenidos/faqs", permission: "contents.manage" },
      { label: "Multimedia", icon: <ImageIcon size={14} />, href: "/admin/contenidos/multimedia", permission: "media.manage" },
      { label: "SEO", icon: <BarChart3 size={14} />, href: "/admin/contenidos/seo", permission: "seo.read" },
    ],
  },
  {
    label: "Agenda",
    icon: <Calendar size={16} />,
    href: "/admin/agenda",
    permission: "agenda.read",
  },
  {
    label: "Clientes",
    icon: <Building2 size={16} />,
    children: [
      { label: "Listado", icon: <Users size={14} />, href: "/admin/clientes", permission: "clients.read" },
      { label: "Presupuestos", icon: <Receipt size={14} />, href: "/admin/clientes/presupuestos", permission: "budgets.manage" },
      { label: "Documentos", icon: <FolderKanban size={14} />, href: "/admin/clientes/documentos", permission: "docs.read" },
      { label: "Invitaciones", icon: <Mail size={14} />, href: "/admin/clientes/invitaciones", permission: "clients.invite" },
      { label: "Portal", icon: <Server size={14} />, href: "/admin/clientes/portal", permission: "clients.invite" },
    ],
  },
  {
    label: "Equipo",
    icon: <Users size={16} />,
    children: [
      { label: "Directorio", icon: <Users size={14} />, href: "/admin/equipo", permission: "team.manage" },
      { label: "Roles", icon: <Shield size={14} />, href: "/admin/equipo/roles", permission: "team.manage" },
      { label: "Invitaciones", icon: <Mail size={14} />, href: "/admin/equipo/invitaciones", permission: "team.manage" },
      { label: "Organigrama", icon: <DatabaseIcon size={14} />, href: "/admin/equipo/organigrama", permission: "team.manage" },
    ],
    roles: ["superadmin", "admin"],
  },
  {
    label: "Chat Equipo",
    icon: <MessageSquare size={16} />,
    href: "/admin/chat",
    permission: "chat.read",
  },
  {
    label: "Conocimiento",
    icon: <BookOpen size={16} />,
    children: [
      { label: "Documentos", icon: <FolderKanban size={14} />, href: "/admin/conocimiento/documentos", permission: "docs.read" },
      { label: "Ayuda", icon: <HelpCircle size={14} />, href: "/admin/conocimiento/ayuda", permission: "help.manage" },
      { label: "Portal Editorial", icon: <Server size={14} />, href: "/admin/conocimiento/portal", permission: "help.manage" },
    ],
  },
  {
    label: "Configuración",
    icon: <Settings size={16} />,
    href: "/admin/configuracion",
    roles: ["superadmin", "admin"],
    permission: "settings.manage",
  },
];

const AdminLayout = () => {
  const [session, setSession] = useState<ReturnType<typeof supabase.auth.getSession> extends Promise<{ data: { session: infer S } }> ? S : null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuperAdmin, isBackoffice, isStaff, hasPermission, hasAnyRole, loading: permsLoading } = usePermissions();

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
    navigate("/");
  };

  const hasAccess = (item: NavItem | NavSection): boolean => {
    if (item.roles && !hasAnyRole(item.roles)) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    const children = (item as NavSection).children;
    if (children) {
      return children.some((child) => hasAccess(child));
    }
    return true;
  };

  if (loading || permsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session) return <BlogAdminLogin />;

  const linkBase = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors";
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `${linkBase} ${isActive ? "bg-foreground/[0.06] text-foreground" : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"}`;

  const toggleSection = (label: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-foreground/[0.06] transform transition-transform lg:transform-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-full flex flex-col p-4 lg:p-5">
          <div className="flex items-center justify-between mb-8 px-2">
            <NavLink to="/admin" className="flex items-center gap-2.5 min-w-0">
              <img src={sigmaIsologo.url} alt="Isologo Sigma Tecnologías" className="h-8 w-8 object-contain shrink-0" />
              <span className="font-display text-sm font-bold text-foreground tracking-tight truncate">
                Sigma<span className="font-bold text-foreground/50">Tecnologías</span>
              </span>
            </NavLink>
            <button onClick={() => setOpen(false)} className="lg:hidden text-foreground/50">
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            {NAV_CONFIG
              .filter((section) => hasAccess(section))
              .map((section) => {
                const isOpen = openSections.has(section.label);
                const hasChildren = section.children && section.children.length > 0;
                const activeChildren = section.children?.some((c) => c.href && window.location.pathname.startsWith(c.href));

                return (
                  <div key={section.label} className="group">
                    {hasChildren ? (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleSection(section.label)}
                          className={`w-full flex items-center justify-between ${linkBase} ${
                            activeChildren || (section.href && window.location.pathname === section.href)
                              ? "bg-foreground/[0.06] text-foreground"
                              : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
                          }`}
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            {section.icon}
                            <span className="truncate">{section.label}</span>
                          </span>
                          {isOpen ? <ChevronUp size={14} className="text-foreground/40" /> : <ChevronDown size={14} className="text-foreground/40" />}
                        </button>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-2"
                        >
                          {section.children?.map((child) => (
                            <NavLink
                              key={child.href}
                              to={child.href}
                              className={linkClass}
                              end
                            >
                              {child.icon}
                              {child.label}
                            </NavLink>
                          ))}
                        </motion.div>
                      </>
                    ) : (
                      <NavLink
                        to={section.href!}
                        className={linkClass}
                        end
                      >
                        {section.icon}
                        {section.label}
                      </NavLink>
                    )}
                  </div>
                );
              })}
          </nav>

          <div className="border-t border-foreground/[0.06] pt-4">
            <div className="flex items-center gap-3 px-3 py-2 text-sm text-foreground/50">
              <div className="w-8 h-8 rounded-full bg-foreground/[0.04] flex items-center justify-center">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{user?.user_metadata?.full_name || user?.email}</p>
                <p className="text-[11px] text-foreground/30 truncate">{isSuperAdmin ? "Superadmin" : isBackoffice ? "Admin" : "Empleado"}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03] transition-colors"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
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
        <div className="px-6 lg:px-10 py-10 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;