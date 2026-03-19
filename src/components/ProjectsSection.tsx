import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { Globe, Server, Cpu, ArrowUpRight, ExternalLink } from "lucide-react";

const webProjectLinks: Record<string, string> = {
  "Justa": "https://justaagencia.com/",
  "Unidos Para Amar": "https://unidosparaamar.org/",
  "Geonosis": "https://geonosis.com.ar/",
  "Mind Praxis": "https://mindpraxis.net/",
  "Cristian Schauvinhold": "https://cristianschauvinhold.com/",
  "OffMarket": "https://www.offmarket.com.ar/",
  "Urbetex": "https://urbetex.com/",
  "Estamos Unidos": "https://somosestamosunidos.com/",
};

const platformLinks: Record<string, string> = {
  "Iceberg": "https://icebergpol.com/",
  "Viaja Seguro a Marruecos": "https://viajaseguroamarruecos.com/",
};

const ProjectsSection = () => {
  const { t } = useTranslation();
  const { categories } = t.projects;

  return (
    <section id="proyectos" className="section-padding">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-sm text-foreground/40 font-medium tracking-wide uppercase mb-4 block">
            {t.projects.tagline}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.projects.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t.projects.subtitle}
          </p>
        </motion.div>

        {/* Cintelli-style layout: sticky left + scrolling right */}
        <div className="space-y-32">
          {/* Category 1: Web Development */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Globe size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.web.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">{categories.web.description}</p>
              <p className="text-sm text-foreground/30 leading-relaxed italic">{categories.web.note}</p>
            </motion.div>

            <div className="lg:col-span-3 space-y-4">
              {categories.web.items.map((name, i) => {
                const url = webProjectLinks[name];
                return (
                  <motion.a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-center justify-between gap-4 p-5 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.12] hover:bg-foreground/[0.03] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-foreground/50 transition-colors" />
                      <span className="text-foreground/80 font-medium group-hover:text-foreground transition-colors">{name}</span>
                    </div>
                    <ExternalLink size={14} className="text-foreground/15 group-hover:text-foreground/50 transition-colors" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Category 2: Platforms */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Server size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.platforms.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{categories.platforms.description}</p>
            </motion.div>

            <div className="lg:col-span-3 space-y-6">
              {categories.platforms.items.map((project, i) => {
                const url = platformLinks[project.name];
                return (
                  <motion.a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="block glass-card rounded-2xl p-8 group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-lg font-semibold text-foreground">{project.name}</h4>
                      <ExternalLink size={14} className="text-foreground/15 group-hover:text-foreground/50 transition-colors" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Category 3: Automation */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Cpu size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.automation.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{categories.automation.description}</p>
            </motion.div>

            <div className="lg:col-span-3 space-y-6">
              {categories.automation.items.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-8"
                >
                  <h4 className="font-display text-lg font-semibold text-foreground mb-3">{project.name}</h4>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
