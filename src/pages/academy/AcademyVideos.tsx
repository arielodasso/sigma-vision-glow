import { motion } from "framer-motion";

const videos = [
  {
    title: "Introducción a la Inteligencia Artificial para negocios",
    duration: "15 min",
    description: "Todo lo que necesitás saber para empezar a integrar IA en tu empresa. Conceptos clave, herramientas y casos de uso reales.",
    youtubeId: "aircAruvnKk",
  },
  {
    title: "Cómo crear un sitio web profesional con IA",
    duration: "20 min",
    description: "Paso a paso: desde la idea hasta un sitio publicado. Prompting, diseño visual, backend y despliegue.",
    youtubeId: "9KHLTZaJcR8",
  },
  {
    title: "Automatización inteligente: flujos de trabajo con IA",
    duration: "18 min",
    description: "Aprendé a automatizar tareas repetitivas usando herramientas de IA. Ahorrá horas cada semana en tu negocio.",
    youtubeId: "jGJFtALMAEU",
  },
  {
    title: "SEO potenciado con Inteligencia Artificial",
    duration: "12 min",
    description: "Estrategias de posicionamiento web usando herramientas de IA para investigación de keywords, contenido y análisis técnico.",
    youtubeId: "Yv2x5bOGs1w",
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
          Tutoriales y walkthroughs para sacarle el máximo provecho a la tecnología e IA.
        </p>
      </motion.div>

      <div className="space-y-16">
        {videos.map((video, i) => (
          <motion.section
            key={video.youtubeId}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="space-y-4"
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
                <h2 className="font-display text-xl font-bold text-foreground">{video.title}</h2>
                <p className="mt-2 text-muted-foreground text-sm">{video.description}</p>
              </div>
              <span className="text-xs font-medium text-muted-foreground/60 uppercase whitespace-nowrap mt-1">
                {video.duration}
              </span>
            </div>
            {i < videos.length - 1 && <hr className="border-border mt-8" />}
          </motion.section>
        ))}
      </div>
    </div>
  );
};

export default AcademyVideos;
