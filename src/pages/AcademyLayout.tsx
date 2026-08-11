import { Outlet, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BookOpen, Play, Layout, Lightbulb, Rocket, GraduationCap, ExternalLink, ChevronLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import sigmaIsologo from "@/assets/brand/sigma-isologo-2.png.asset.json";

const academyMeta: Record<string, { path: string; title: string; description: string }> = {
  "/academy": {
    path: "/academy",
    title: "Sigma Academy | Recursos de IA y software",
    description: "Hub de recursos de Sigma Tecnologías: guías de inteligencia artificial, videos, plantillas y casos de uso para construir mejores productos digitales.",
  },
  "/academy/guias": {
    path: "/academy/guias",
    title: "Guías de IA | Sigma Academy",
    description: "Guías prácticas para aplicar inteligencia artificial en tu negocio: automatización, agentes y flujos de trabajo explicados paso a paso.",
  },
  "/academy/videos": {
    path: "/academy/videos",
    title: "Videos | Sigma Academy",
    description: "Videos y demos sobre desarrollo de software, automatización con IA y productos digitales, seleccionados por Sigma Tecnologías.",
  },
  "/academy/plantillas": {
    path: "/academy/plantillas",
    title: "Plantillas | Sigma Academy",
    description: "Plantillas y recursos listos para usar que aceleran la construcción de plataformas digitales y automatizaciones con inteligencia artificial.",
  },
  "/academy/casos-de-uso": {
    path: "/academy/casos-de-uso",
    title: "Casos de uso de IA | Sigma Academy",
    description: "Casos de uso reales de inteligencia artificial y automatización aplicados a empresas, agencias y productos digitales.",
  },
  "/academy/avanzado": {
    path: "/academy/avanzado",
    title: "Temas avanzados | Sigma Academy",
    description: "Temas avanzados de arquitectura, integración de IA y escalabilidad de software para equipos técnicos y product builders.",
  },
};


const sidebarSections = [
  {
    label: "APRENDER",
    items: [
      { title: "Inicio", href: "/academy", icon: GraduationCap },
      { title: "Guías de IA", href: "/academy/guias", icon: BookOpen },
      { title: "Videos", href: "/academy/videos", icon: Play },
    ],
  },
  {
    label: "CONSTRUIR",
    items: [
      { title: "Plantillas", href: "/academy/plantillas", icon: Layout },
      { title: "Casos de uso", href: "/academy/casos-de-uso", icon: Lightbulb },
    ],
  },
  {
    label: "REFERENCIA",
    items: [
      { title: "Temas avanzados", href: "/academy/avanzado", icon: Rocket },
      { title: "Blog", href: "/blog", icon: ExternalLink, external: true },
    ],
  },
];

const AcademyLayout = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/academy") return location.pathname === "/academy";
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      <Link to="/academy" className="flex items-center gap-3 px-4 pt-6 pb-8">
        <img src={sigmaIsologo.url} alt="Isologo Sigma Tecnologías" className="h-8 w-8 object-contain" />
        <span className="font-display text-sm font-bold text-foreground tracking-tight">
          Sigma <span className="font-medium text-foreground/50">Academy</span>
        </span>
      </Link>

      <nav className="flex-1 px-2 space-y-6">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-secondary text-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <item.icon size={16} />
                    <span>{item.title}</span>
                    {(item as any).external && <ExternalLink size={12} className="ml-auto opacity-40" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
          Volver al sitio
        </Link>
      </div>
    </>
  );

  const meta = academyMeta[location.pathname] ?? academyMeta["/academy"];

  return (
    <div className="min-h-screen bg-background flex">
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={`https://www.sigmatecnologiasarg.com${meta.path}`} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`https://www.sigmatecnologiasarg.com${meta.path}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border fixed top-0 left-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border h-14 flex items-center px-4">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-foreground p-2">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link to="/academy" className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background font-display font-bold text-xs">Σ</span>
          </div>
          <span className="font-display text-sm font-bold text-foreground">
            Sigma <span className="font-medium text-foreground/50">Academy</span>
          </span>
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-14 left-0 bottom-0 w-64 bg-card border-r border-border flex flex-col overflow-y-auto">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 lg:ml-60 min-h-screen pt-14 lg:pt-0"
      >
        <div className="max-w-4xl mx-auto px-6 py-12 lg:py-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AcademyLayout;
