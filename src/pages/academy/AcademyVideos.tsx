import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const channels = [
  {
    name: "Lovable",
    handle: "@lovable",
    url: "https://www.youtube.com/@lovable/videos",
    videos: [
      {
        title: "Build Web Apps with AI — No Coding Required! Full Tutorial",
        duration: "1h 07min",
        description: "Tutorial oficial completo del canal de Lovable. Desde la idea hasta una app full-stack desplegada con Supabase, OpenAI y Stripe.",
        youtubeId: "c0zhLzcVJRI",
      },
      {
        title: "Lovable 2.0 Launch — What's New",
        duration: "5 min",
        description: "Presentación oficial de Lovable 2.0 con las nuevas funcionalidades y mejoras de la plataforma.",
        youtubeId: "9KHLTZaJcR8",
      },
    ],
  },
  {
    name: "n8n",
    handle: "@n8n-io",
    url: "https://www.youtube.com/@n8n-io/videos",
    videos: [
      {
        title: "n8n Quick Start: Build Your First Workflow [2025]",
        duration: "15 min",
        description: "Tutorial oficial de n8n para principiantes. Aprendé los conceptos fundamentales y construí tu primer workflow de automatización.",
        youtubeId: "4cQWJViybAQ",
      },
      {
        title: "n8n Quick Start: Build Your First AI Agent [2026]",
        duration: "21 min",
        description: "Cómo crear agentes de IA que automatizan tareas complejas usando n8n y modelos de lenguaje.",
        youtubeId: "GuaKeDS6UKU",
      },
    ],
  },
  {
    name: "Anthropic (Claude)",
    handle: "@anthropic-ai",
    url: "https://www.youtube.com/@anthropic-ai/videos",
    videos: [
      {
        title: "Introducing Claude Code",
        duration: "4 min",
        description: "Presentación oficial de Claude Code, la herramienta de coding agéntico de Anthropic que permite delegar tareas de ingeniería desde la terminal.",
        youtubeId: "AJpK3YTTKZ4",
      },
      {
        title: "Claude — Computer Use for Automating Operations",
        duration: "2 min",
        description: "Demostración de la capacidad de uso de computadora de Claude: mirar pantallas, mover cursores, cliquear y escribir texto como un humano.",
        youtubeId: "ODaHJzOyVCQ",
      },
      {
        title: "Claude Code Updates: Haiku 4.5, Claude Code on Web & More",
        duration: "5 min",
        description: "Últimas novedades para desarrolladores: Claude Code en la web, Claude Haiku 4.5 y mejoras en el flujo de trabajo.",
        youtubeId: "CBneTpXF1CQ",
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
          Tutoriales y walkthroughs de los canales oficiales de Lovable, n8n y Anthropic (Claude).
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
