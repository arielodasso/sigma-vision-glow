import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Play, Layout, Lightbulb, Rocket, Brain } from "lucide-react";
import { motion } from "framer-motion";

const personas = [
  { title: "Emprendedores", desc: "Validá ideas y lanzá MVPs rápido", href: "/academy/casos-de-uso#emprendedores" },
  { title: "Marketers", desc: "Campañas, funnels y landing pages", href: "/academy/casos-de-uso#marketers" },
  { title: "Desarrolladores", desc: "Herramientas internas y utilidades", href: "/academy/casos-de-uso#desarrolladores" },
  { title: "Diseñadores", desc: "Portfolios y sistemas de diseño", href: "/academy/casos-de-uso#disenadores" },
  { title: "Educadores", desc: "Plataformas de cursos y evaluaciones", href: "/academy/casos-de-uso#educadores" },
  { title: "Estudiantes", desc: "Proyectos, herramientas y side projects", href: "/academy/casos-de-uso#estudiantes" },
];

const featuredTemplates = [
  { title: "Dashboard IA", desc: "Panel de análisis con inteligencia artificial integrada", category: "SaaS" },
  { title: "Landing Startup", desc: "Página de lanzamiento optimizada para conversión", category: "Marketing" },
  { title: "Portfolio Creativo", desc: "Portafolio minimalista con animaciones premium", category: "Portfolio" },
  { title: "E-commerce Inteligente", desc: "Tienda online con recomendaciones IA", category: "E-commerce" },
];

const AcademyHome = () => {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-secondary/50 border border-border p-10 lg:p-16 text-center"
      >
        <h1 className="font-display text-4xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
          Dominá la tecnología.
          <br />
          <span className="text-muted-foreground">Empezá acá.</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl mx-auto text-lg">
          De la idea a la solución con IA. Guías, plantillas y recursos prácticos para construir con tecnología.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/academy/guias"
            className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-6 py-3 rounded-full hover:bg-foreground/90 transition-colors text-sm"
          >
            Empezar a aprender
          </Link>
          <Link
            to="/academy/guias"
            className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-6 py-3 rounded-full hover:bg-secondary transition-colors text-sm"
          >
            Guía de prompting <ArrowRight size={14} />
          </Link>
        </div>
      </motion.section>

      {/* Get Started */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-bold text-foreground">Empezá por acá</h2>

        <Link
          to="/academy/guias"
          className="block rounded-2xl border border-border bg-secondary/30 p-8 hover:bg-secondary/50 transition-colors group"
        >
          <p className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase mb-3">Guía</p>
          <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-foreground/90">
            Aprendé a usar IA correctamente
          </h3>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Cinco principios que separan los grandes resultados de los frustrantes. Lo más valioso que podés aprender antes de tu primer proyecto con IA.
          </p>
          <span className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-foreground/70 group-hover:text-foreground">
            Leer la guía <ArrowRight size={14} />
          </span>
        </Link>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/academy/videos"
            className="rounded-2xl border border-border bg-secondary/30 p-6 hover:bg-secondary/50 transition-colors group"
          >
            <Play size={24} className="text-muted-foreground mb-4" />
            <p className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase mb-2">Videos</p>
            <h3 className="font-display text-lg font-bold text-foreground">Mirá un tutorial</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Walkthroughs cortos y enfocados que muestran cómo funciona todo. Elegí uno y seguí a tu ritmo.
            </p>
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-foreground/70 group-hover:text-foreground">
              Ver videos <ArrowRight size={14} />
            </span>
          </Link>

          <Link
            to="/academy/plantillas"
            className="rounded-2xl border border-border bg-secondary/30 p-6 hover:bg-secondary/50 transition-colors group"
          >
            <Layout size={24} className="text-muted-foreground mb-4" />
            <p className="text-xs font-semibold tracking-widest text-muted-foreground/60 uppercase mb-2">Plantillas</p>
            <h3 className="font-display text-lg font-bold text-foreground">Elegí una plantilla</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Empezá desde una app funcional y hacela tuya. Cada plantilla es personalizable y lista para producción.
            </p>
            <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-foreground/70 group-hover:text-foreground">
              Ver plantillas <ArrowRight size={14} />
            </span>
          </Link>
        </div>
      </section>

      {/* What can you build */}
      <section className="space-y-8">
        <h2 className="font-display text-2xl font-bold text-foreground">¿Qué podés construir?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {personas.map((p) => (
            <Link
              key={p.title}
              to={p.href}
              className="rounded-xl border border-border bg-secondary/20 p-5 hover:bg-secondary/40 transition-colors group"
            >
              <h3 className="font-display font-bold text-foreground text-sm">{p.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              <span className="inline-block mt-3 text-xs text-foreground/60 group-hover:text-foreground">→</span>
            </Link>
          ))}
        </div>
        <Link to="/academy/casos-de-uso" className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground">
          Ver todos los perfiles <ArrowRight size={14} />
        </Link>
      </section>

      {/* Featured Templates */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-foreground">Plantillas destacadas</h2>
          <Link to="/academy/plantillas" className="text-sm text-muted-foreground hover:text-foreground">
            Ver todas →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {featuredTemplates.map((t) => (
            <div
              key={t.title}
              className="rounded-xl border border-border bg-secondary/20 p-6 hover:bg-secondary/40 transition-colors"
            >
              <div className="w-full h-32 rounded-lg bg-secondary/60 mb-4 flex items-center justify-center">
                <Brain size={32} className="text-muted-foreground/40" />
              </div>
              <span className="text-[10px] font-semibold tracking-widest text-muted-foreground/50 uppercase">{t.category}</span>
              <h3 className="font-display font-bold text-foreground mt-1">{t.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-border bg-secondary/30 p-10 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">¿Listo para producción?</h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Autenticación, pagos, dominios personalizados y todo lo que necesitás para lanzar un producto real.
        </p>
        <Link
          to="/academy/avanzado"
          className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          Explorar temas avanzados <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
};

export default AcademyHome;
