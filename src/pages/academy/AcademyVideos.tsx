import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const channels = [
  {
    name: "Lovable",
    handle: "@lovable",
    url: "https://www.youtube.com/@lovable/videos",
    videos: [
      {
        title: "Build a Full-Stack App with Lovable in Minutes",
        duration: "12 min",
        description: "Paso a paso completo: desde la idea hasta una app full-stack desplegada. Prompting, diseño, backend y deploy.",
        youtubeId: "aircAruvnKk",
      },
      {
        title: "Lovable 101: From Idea to Production",
        duration: "20 min",
        description: "Tutorial oficial para crear tu primer proyecto con Lovable. Aprende cómo funciona la plataforma de punta a punta.",
        youtubeId: "9KHLTZaJcR8",
      },
      {
        title: "Building a SaaS with AI — No Code Required",
        duration: "25 min",
        description: "Cómo construir un SaaS completo con autenticación, pagos y dashboard usando solo prompts en Lovable.",
        youtubeId: "jGJFtALMAEU",
      },
    ],
  },
  {
    name: "n8n",
    handle: "@n8n-io",
    url: "https://www.youtube.com/@n8n-io/videos",
    videos: [
      {
        title: "Automate Everything with n8n — Getting Started",
        duration: "15 min",
        description: "Introducción a la automatización con n8n. Creá flujos de trabajo visuales que conectan tus apps y servicios.",
        youtubeId: "1MwSoB0gnM4",
      },
      {
        title: "Build AI Agents with n8n",
        duration: "22 min",
        description: "Cómo crear agentes de IA que automatizan tareas complejas usando n8n y modelos de lenguaje.",
        youtubeId: "HSCJRaFPMeo",
      },
    ],
  },
  {
    name: "Claude",
    handle: "@claude",
    url: "https://www.youtube.com/@claude/videos",
    videos: [
      {
        title: "Introducing Claude — AI Assistant by Anthropic",
        duration: "8 min",
        description: "Conocé Claude, el asistente de IA de Anthropic. Capacidades, casos de uso y cómo empezar a usarlo.",
        youtubeId: "jBfGEySQ1OU",
      },
      {
        title: "Claude for Work: Enterprise AI Use Cases",
        duration: "18 min",
        description: "Casos de uso empresariales con Claude. Análisis de documentos, generación de contenido y automatización.",
        youtubeId: "Yv2x5bOGs1w",
      },
    ],
  },
];

const AcademyVideos = () => {
  return (
    <div className="space-y-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground tracking-tight">
          Mirá y aprendé.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-lg text-lg">
          Tutoriales y walkthroughs de los canales oficiales de Lovable, n8n y Claude.
        </p>
      </motion.div>

      {channels.map((channel) => (
        <section key={channel.name} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">{channel.name}</h2>
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {channel.handle} <ExternalLink size={12} />
            </a>
          </div>

          <div className="space-y-10">
            {channel.videos.map((video, i) => (
              <motion.div
                key={video.youtubeId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="space-y-3"
              >
                <div className="rounded-xl overflow-hidden border border-border aspect-video">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{video.title}</h3>
                    <p className="mt-1 text-muted-foreground text-sm">{video.description}</p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase whitespace-nowrap mt-1">
                    {video.duration}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <hr className="border-border" />
        </section>
      ))}
    </div>
  );
};

export default AcademyVideos;
