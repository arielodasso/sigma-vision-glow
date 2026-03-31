import { motion } from "framer-motion";
import { Brain, BarChart3, ShoppingCart, Palette, Globe, Megaphone, GraduationCap, FileText } from "lucide-react";
import { useState } from "react";

const categories = [
  "Todas",
  "SaaS & Herramientas",
  "Portfolio & CV",
  "Sitios web",
  "E-commerce",
  "Marketing",
  "Educación",
  "Blog & Editorial",
];

const templates = [
  {
    title: "Dashboard Analytics IA",
    subtitle: "Panel de métricas con insights generados por IA",
    description: "Dashboard completo con visualizaciones de datos, KPIs en tiempo real e insights automatizados por inteligencia artificial. Incluye filtros avanzados y exportación de reportes.",
    category: "SaaS & Herramientas",
    icon: BarChart3,
    featured: true,
  },
  {
    title: "CRM Inteligente",
    subtitle: "Gestión de clientes con scoring predictivo",
    category: "SaaS & Herramientas",
    icon: Brain,
  },
  {
    title: "Automatizador de Workflows",
    subtitle: "Constructor visual de flujos automatizados",
    category: "SaaS & Herramientas",
    icon: Brain,
  },
  {
    title: "Portfolio Creativo",
    subtitle: "Portafolio minimalista con animaciones premium",
    category: "Portfolio & CV",
    icon: Palette,
  },
  {
    title: "CV Interactivo",
    subtitle: "Currículum web con timeline y skills visuales",
    category: "Portfolio & CV",
    icon: FileText,
  },
  {
    title: "Landing Page Startup",
    subtitle: "Página de lanzamiento optimizada para conversión",
    category: "Sitios web",
    icon: Globe,
    featured: true,
    description: "Landing page con hero, propuesta de valor, prueba social, testimonios y formulario de registro. Diseño moderno y enfocado en conversión con A/B testing integrado.",
  },
  {
    title: "Sitio Corporativo",
    subtitle: "Web institucional multi-página profesional",
    category: "Sitios web",
    icon: Globe,
  },
  {
    title: "Tienda Online IA",
    subtitle: "E-commerce con recomendaciones inteligentes",
    category: "E-commerce",
    icon: ShoppingCart,
  },
  {
    title: "Marketplace de Servicios",
    subtitle: "Plataforma de conexión oferta-demanda",
    category: "E-commerce",
    icon: ShoppingCart,
  },
  {
    title: "Funnel de Ventas",
    subtitle: "Embudo de conversión multi-step optimizado",
    category: "Marketing",
    icon: Megaphone,
  },
  {
    title: "Email Campaign Builder",
    subtitle: "Constructor de campañas de email marketing",
    category: "Marketing",
    icon: Megaphone,
  },
  {
    title: "Plataforma de Cursos",
    subtitle: "LMS con progreso, quizzes y certificados",
    category: "Educación",
    icon: GraduationCap,
  },
  {
    title: "Blog Editorial",
    subtitle: "Publicación de contenido con diseño editorial",
    category: "Blog & Editorial",
    icon: FileText,
  },
  {
    title: "Newsletter Platform",
    subtitle: "Plataforma de newsletters con suscripciones",
    category: "Blog & Editorial",
    icon: FileText,
  },
];

const AcademyTemplates = () => {
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filtered = activeCategory === "Todas"
    ? templates
    : templates.filter((t) => t.category === activeCategory);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-secondary/50 border border-border p-10 lg:p-16 text-center"
      >
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
          Empezá desde algo
          <br />
          que funciona
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
          Cada plantilla es una app real y funcional. Personalizala, adaptala y lanzala.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </motion.section>

      {/* Templates grid */}
      <div className="space-y-6">
        {filtered.filter((t) => t.featured).map((t) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-secondary/30 p-6 lg:p-8 flex flex-col lg:flex-row gap-6 hover:bg-secondary/50 transition-colors"
          >
            <div className="lg:w-1/2 rounded-xl bg-secondary/60 h-48 lg:h-auto flex items-center justify-center">
              <t.icon size={48} className="text-muted-foreground/30" />
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center">
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">{t.category}</span>
              <h3 className="font-display text-xl font-bold text-foreground mt-1">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
              {t.description && (
                <p className="text-sm text-muted-foreground/80 mt-3">{t.description}</p>
              )}
              <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground/70">
                Ver plantilla →
              </span>
            </div>
          </motion.div>
        ))}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.filter((t) => !t.featured).map((t) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl border border-border bg-secondary/20 p-5 hover:bg-secondary/40 transition-colors"
            >
              <div className="w-full h-28 rounded-lg bg-secondary/50 mb-4 flex items-center justify-center">
                <t.icon size={28} className="text-muted-foreground/30" />
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">{t.category}</span>
              <h3 className="font-display font-bold text-foreground mt-1 text-sm">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademyTemplates;
