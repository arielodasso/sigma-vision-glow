import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const buildLovableLink = (prompt: string) =>
  `https://lovable.dev/?autosubmit=true#prompt=${encodeURIComponent(prompt)}`;

const personas = [
  {
    id: "emprendedores",
    number: "01",
    subtitle: "Estoy lanzando algo nuevo",
    title: "Emprendedores",
    ideas: [
      {
        name: "MVP landing page builder",
        desc: "Launch-ready page with hero, value props, social proof, and waitlist signup.",
        prompt: "Build a startup landing page with a bold hero section including a headline, subheadline, and email waitlist signup form. Below that, add a three-column value proposition section, a social proof bar with logos, a testimonial carousel, a pricing table with three tiers, and a final CTA. Make it modern and conversion-focused.",
      },
      {
        name: "MVP de producto SaaS",
        desc: "Prototipo funcional con dashboard, auth y onboarding para validar tu idea.",
        prompt: "Build a SaaS MVP with user authentication (sign up, login), onboarding flow, a main dashboard showing key metrics with charts, a settings page, and a clean modern design. Include a landing page with pricing section.",
      },
      {
        name: "Dashboard de métricas en tiempo real",
        desc: "Panel de control para monitorear KPIs de tu startup con gráficos interactivos.",
        prompt: "Build a real-time metrics dashboard for a startup. Include KPI cards showing MRR, active users, churn rate, and conversion rate. Add line charts for revenue over time, bar charts for user acquisition channels, and a table showing recent transactions. Make it dark themed and modern.",
      },
      {
        name: "Herramienta de reportes para inversores",
        desc: "Generá informes mensuales con métricas clave, hitos y próximos pasos.",
        prompt: "Build an investor report generator tool. Include sections for monthly highlights, key metrics (MRR, burn rate, runway), milestones achieved, upcoming goals, and team updates. Add a clean printable layout with charts and the ability to input data into forms.",
      },
    ],
  },
  {
    id: "marketers",
    number: "02",
    subtitle: "Quiero potenciar mis campañas",
    title: "Marketers",
    ideas: [
      {
        name: "Funnel de conversión multi-step",
        desc: "Embudo optimizado con formularios progresivos, social proof y thank-you page.",
        prompt: "Build a multi-step conversion funnel with a compelling hero, a 3-step progressive form collecting name, email, company size, and goals. Add trust badges, testimonials between steps, a progress indicator, and a thank-you page with a calendar booking link. Make it conversion-optimized.",
      },
      {
        name: "Generador de contenido con IA",
        desc: "Herramienta para crear posts de redes sociales, emails y artículos de blog.",
        prompt: "Build an AI content generator tool with tabs for social media posts, email campaigns, and blog articles. Include input fields for topic, tone, target audience, and length. Show generated content in a preview card with copy-to-clipboard functionality. Add a history sidebar showing past generations.",
      },
      {
        name: "Calculadora de ROI interactiva",
        desc: "Widget embebible que permite a prospectos calcular el retorno de inversión.",
        prompt: "Build an interactive ROI calculator widget. Include sliders for current spend, expected improvement percentage, and time period. Show calculated savings, ROI percentage, and break-even point with animated numbers. Add a comparison table and a CTA to book a demo. Make it embeddable and visually impressive.",
      },
      {
        name: "Landing page con A/B testing",
        desc: "Página con variantes de testing para optimizar conversiones en tiempo real.",
        prompt: "Build a landing page with built-in A/B testing capabilities. Create two hero variants (different headlines and CTAs), show a split-view preview mode, and include a dashboard showing conversion metrics for each variant with statistical significance indicators.",
      },
    ],
  },
  {
    id: "desarrolladores",
    number: "03",
    subtitle: "Necesito herramientas internas",
    title: "Desarrolladores",
    ideas: [
      {
        name: "Panel de administración completo",
        desc: "Dashboard interno con CRUD de usuarios, roles, logs y configuraciones.",
        prompt: "Build an admin dashboard with a sidebar navigation, user management table with CRUD operations, role-based access controls, activity log, and system settings page. Include search, filters, pagination, and bulk actions. Use a clean professional design with data tables.",
      },
      {
        name: "Portal de documentación interactiva",
        desc: "Docs con búsqueda, ejemplos de código con syntax highlighting y playground.",
        prompt: "Build an interactive documentation portal with a sidebar navigation, search functionality, markdown content rendering with syntax highlighting for code blocks, copy-to-clipboard for code examples, version selector, and a dark/light theme toggle. Make it look like modern API documentation.",
      },
      {
        name: "Monitor de APIs y servicios",
        desc: "Herramienta para trackear health, latencia, uptime y errores de tus endpoints.",
        prompt: "Build an API monitoring dashboard showing endpoint health status with green/yellow/red indicators, response time charts, uptime percentages, error rate tracking, and an incidents timeline. Include a status page view and notification settings.",
      },
      {
        name: "Generador de boilerplate",
        desc: "Scaffolding automatizado con selección de stack, estructura y configuración.",
        prompt: "Build a project boilerplate generator with step-by-step configuration: choose framework, select features (auth, database, payments, AI), pick UI library, and generate a project structure preview. Show a file tree of the generated project with downloadable config files.",
      },
    ],
  },
  {
    id: "disenadores",
    number: "04",
    subtitle: "Quiero mostrar mi trabajo",
    title: "Diseñadores",
    ideas: [
      {
        name: "Portfolio cinematográfico premium",
        desc: "Portafolio con transiciones de página, lazy loading de imágenes y animaciones fluidas.",
        prompt: "Build a cinematic portfolio website with smooth page transitions, a full-screen hero with a name and tagline, a filterable project grid with hover effects showing project details, individual project pages with large images and case study text, and a contact section. Use elegant typography and subtle animations.",
      },
      {
        name: "Design system showcase interactivo",
        desc: "Sitio para exhibir tu sistema de diseño con componentes interactivos en vivo.",
        prompt: "Build a design system showcase website with sections for typography, color palette with copy-to-clipboard hex values, spacing scale, component library with live interactive examples (buttons, inputs, cards, modals), and usage guidelines. Include dark and light mode previews.",
      },
      {
        name: "Galería de proyectos filtrable",
        desc: "Grid filtrable con previews de alta resolución y caso de estudio detallado.",
        prompt: "Build a project gallery with category filters, a masonry grid layout showing project thumbnails with hover overlays, and individual project pages with a hero image, project description, tools used, client testimonial, and a next/previous project navigation.",
      },
    ],
  },
  {
    id: "educadores",
    number: "05",
    subtitle: "Quiero enseñar y capacitar",
    title: "Educadores",
    ideas: [
      {
        name: "Plataforma de cursos online",
        desc: "LMS con módulos, lecciones en video, progreso y certificados de finalización.",
        prompt: "Build an online course platform with a course catalog, individual course pages with module/lesson structure, video player with progress tracking, quiz sections, a student dashboard showing enrolled courses and completion percentage, and a certificate generation page.",
      },
      {
        name: "Sistema de evaluaciones con IA",
        desc: "Quizzes y exámenes con corrección automática, analytics y feedback personalizado.",
        prompt: "Build an assessment system with multiple question types (multiple choice, true/false, short answer), a timer, automatic grading, score summary with correct/incorrect review, performance analytics charts, and the ability to create and manage question banks.",
      },
      {
        name: "Foro de comunidad educativa",
        desc: "Espacio de discusión para estudiantes con categorías, tags y sistema de votos.",
        prompt: "Build a community forum for students with category-based organization, thread creation with rich text, voting system, reply threading, user profiles with contribution stats, search functionality, and pinned announcements. Make it modern and engaging.",
      },
    ],
  },
  {
    id: "estudiantes",
    number: "06",
    subtitle: "Quiero aprender construyendo",
    title: "Estudiantes",
    ideas: [
      {
        name: "Portafolio personal web",
        desc: "Tu primer sitio web profesional para mostrar proyectos académicos y habilidades.",
        prompt: "Build a personal portfolio website for a student with a hero section with name and photo, an about section, a skills grid with icons, a projects showcase with screenshots and descriptions, an education timeline, and a contact form. Make it clean, modern, and mobile-responsive.",
      },
      {
        name: "App de productividad personal",
        desc: "Gestor de tareas con categorías, prioridades, notas y tracking de hábitos.",
        prompt: "Build a personal productivity app with a task manager (add, edit, delete, mark complete), categories and priority levels, a notes section with markdown support, a habit tracker with daily checkboxes and streak counting, and a weekly overview dashboard.",
      },
      {
        name: "Clon de Twitter/X simplificado",
        desc: "Reconstruí una red social básica para aprender arquitectura y patrones de diseño.",
        prompt: "Build a simplified social media feed app like Twitter. Include a post composer, a scrolling feed showing posts with user avatars, likes, and comments. Add a profile page, a trending sidebar, and user follow functionality. Focus on clean UI and smooth interactions.",
      },
    ],
  },
];

const AcademyUseCases = () => {
  const [occupation, setOccupation] = useState("");
  const [problem, setProblem] = useState("");
  const [aiIdeas, setAiIdeas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateIdeas = async () => {
    if (!occupation.trim() && !problem.trim()) return;
    setLoading(true);
    setAiIdeas([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-ideas", {
        body: { occupation, problem },
      });

      if (error) throw error;
      setAiIdeas(data.ideas || []);
    } catch {
      // Fallback: generate simple ideas client-side
      const fallbackIdeas = [
        `Dashboard personalizado para ${occupation || "tu negocio"} que resuelva: ${problem || "gestión diaria"}`,
        `Landing page optimizada para captar clientes interesados en ${occupation || "tus servicios"}`,
        `Herramienta de automatización para reducir el tiempo en: ${problem || "tareas repetitivas"}`,
      ];
      setAiIdeas(fallbackIdeas);
    } finally {
      setLoading(false);
    }
  };

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
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Ej: Soy consultor de marketing digital para PyMEs"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-sm text-foreground/80 block mb-1.5">¿Qué problema querés resolver?</label>
              <input
                type="text"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Ej: Pierdo horas cada semana armando reportes manualmente"
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            onClick={generateIdeas}
            disabled={loading || (!occupation.trim() && !problem.trim())}
            className="inline-flex items-center gap-2 bg-foreground text-background font-semibold px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Generando...
              </>
            ) : (
              <>
                Generar ideas <ArrowRight size={14} />
              </>
            )}
          </button>

          {aiIdeas.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ideas para vos:</p>
              {aiIdeas.map((idea, i) => (
                <a
                  key={i}
                  href={buildLovableLink(idea)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3 hover:bg-secondary/40 transition-colors group"
                >
                  <span className="text-sm text-foreground">{idea}</span>
                  <span className="text-muted-foreground/40 shrink-0 mt-0.5 transition-all group-hover:text-foreground group-hover:translate-x-1">→</span>
                </a>
              ))}
            </div>
          )}
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
                  <a
                    key={idea.name}
                    href={buildLovableLink(idea.prompt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors group"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{idea.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{idea.desc}</p>
                    </div>
                    <span className="text-muted-foreground/40 shrink-0 mt-0.5 transition-all duration-200 group-hover:text-foreground group-hover:translate-x-1">→</span>
                  </a>
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
