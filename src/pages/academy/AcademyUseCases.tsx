import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const personas = [
  {
    id: "emprendedores",
    number: "01",
    subtitle: "Estoy lanzando algo nuevo",
    title: "Emprendedores",
    ideas: [
      { name: "Landing page de lanzamiento", desc: "Página lista con hero, propuesta de valor, prueba social y formulario de registro." },
      { name: "MVP de producto", desc: "Prototipo funcional para validar tu idea con usuarios reales antes de invertir." },
      { name: "Dashboard de métricas", desc: "Panel de control para monitorear KPIs de tu startup en tiempo real." },
      { name: "Herramienta de reportes para inversores", desc: "Generá informes mensuales con métricas clave y próximos pasos." },
    ],
  },
  {
    id: "marketers",
    number: "02",
    subtitle: "Quiero potenciar mis campañas",
    title: "Marketers",
    ideas: [
      { name: "Funnel de conversión", desc: "Embudo multi-step optimizado para captar leads y convertirlos en clientes." },
      { name: "Generador de contenido IA", desc: "Herramienta para crear copy, posts y artículos con inteligencia artificial." },
      { name: "Calculadora de ROI", desc: "Widget interactivo para que tus prospectos calculen el retorno de inversión." },
      { name: "Landing page A/B", desc: "Página con variantes de testing para optimizar conversiones." },
    ],
  },
  {
    id: "desarrolladores",
    number: "03",
    subtitle: "Necesito herramientas internas",
    title: "Desarrolladores",
    ideas: [
      { name: "Panel de administración", desc: "Dashboard interno para gestionar usuarios, datos y configuraciones." },
      { name: "Documentación interactiva", desc: "Portal de docs con búsqueda, ejemplos de código y playground." },
      { name: "Monitor de APIs", desc: "Herramienta para trackear health, latencia y errores de tus servicios." },
      { name: "Generador de boilerplate", desc: "Scaffolding automatizado para nuevos proyectos con tu stack preferido." },
    ],
  },
  {
    id: "disenadores",
    number: "04",
    subtitle: "Quiero mostrar mi trabajo",
    title: "Diseñadores",
    ideas: [
      { name: "Portfolio cinematográfico", desc: "Portafolio con transiciones premium, lazy loading y animaciones fluidas." },
      { name: "Design system showcase", desc: "Sitio para exhibir tu sistema de diseño con componentes interactivos." },
      { name: "Galería de proyectos", desc: "Grid filtrable con previews de alta resolución y caso de estudio detallado." },
    ],
  },
  {
    id: "educadores",
    number: "05",
    subtitle: "Quiero enseñar y capacitar",
    title: "Educadores",
    ideas: [
      { name: "Plataforma de cursos", desc: "LMS con módulos, lecciones en video, progreso del alumno y certificados." },
      { name: "Sistema de evaluaciones", desc: "Quizzes y exámenes con corrección automática y analíticas de rendimiento." },
      { name: "Foro de comunidad", desc: "Espacio de discusión para estudiantes con categorías y moderación." },
    ],
  },
  {
    id: "estudiantes",
    number: "06",
    subtitle: "Quiero aprender construyendo",
    title: "Estudiantes",
    ideas: [
      { name: "Portafolio personal", desc: "Tu primer sitio web profesional para mostrar proyectos académicos." },
      { name: "App de productividad", desc: "Gestor de tareas, notas o hábitos para uso personal y aprendizaje." },
      { name: "Clon de app popular", desc: "Reconstruí una app conocida para aprender arquitectura y patrones de diseño." },
    ],
  },
];

const AcademyUseCases = () => {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
          Todo lo que puedas
          <br />
          describir, lo podés
          <br />
          <span className="text-muted-foreground">construir.</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-lg text-lg">
          La IA convierte lenguaje natural en aplicaciones web completas. Esto es lo que la gente está creando — y lo que vos podrías construir.
        </p>
      </motion.div>

      {/* Idea generator */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">¿No sabés por dónde empezar?</h2>
        <div className="rounded-2xl border border-border bg-secondary/30 p-6 lg:p-8 space-y-4">
          <h3 className="font-display font-bold text-foreground">Obtené ideas personalizadas</h3>
          <p className="text-sm text-muted-foreground">
            Respondé dos preguntas rápidas y te sugerimos apps que podés construir ahora mismo.{" "}
            <strong className="text-foreground">Cuanto más detalle, mejor.</strong>
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-foreground/80 block mb-1.5">¿A qué te dedicás?</label>
              <input
                type="text"
                placeholder="Ej: Soy consultor de marketing digital para PyMEs"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm text-foreground/80 block mb-1.5">¿Qué problema querés resolver?</label>
              <input
                type="text"
                placeholder="Ej: Pierdo horas cada semana armando reportes manualmente"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors text-sm">
            Generar ideas <ArrowRight size={14} />
          </button>
        </div>
      </section>

      <hr className="border-border" />

      {/* Personas */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-foreground">Qué podés construir</h2>

        <div className="space-y-12">
          {personas.map((persona) => (
            <motion.div
              key={persona.id}
              id={persona.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="scroll-mt-20"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-xs font-bold text-muted-foreground/40">{persona.number}</span>
                <div>
                  <p className="text-xs text-muted-foreground/60">{persona.subtitle}</p>
                  <h3 className="font-display text-xl font-bold text-foreground">{persona.title}</h3>
                </div>
              </div>

              <div className="space-y-2">
                {persona.ideas.map((idea) => (
                  <div
                    key={idea.name}
                    className="rounded-xl border border-border bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{idea.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{idea.desc}</p>
                      </div>
                      <span className="text-muted-foreground/40 mt-0.5">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AcademyUseCases;
