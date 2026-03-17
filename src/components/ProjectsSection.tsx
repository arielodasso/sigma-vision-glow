import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { Globe, Server, Cpu, ArrowUpRight } from "lucide-react";

const ProjectsSection = () => {
  const { t } = useTranslation();
  const { categories } = t.projects;

  return (
    <section id="proyectos" className="section-padding">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-sm text-sigma-blue font-medium tracking-wide uppercase mb-4 block">
            {t.projects.tagline}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.projects.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t.projects.subtitle}
          </p>
        </motion.div>

        {/* Category 1: Web Development */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe size={20} className="text-sigma-blue" />
            <h3 className="font-display text-2xl font-semibold text-foreground">{categories.web.title}</h3>
          </div>
          <p className="text-muted-foreground mb-4 max-w-3xl">{categories.web.description}</p>
          <p className="text-sm text-foreground/40 mb-8 italic">{categories.web.note}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.web.items.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center justify-between gap-2 p-4 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.10] hover:bg-foreground/[0.02] transition-all group"
              >
                <span className="text-sm text-foreground/80 font-medium">{name}</span>
                <ArrowUpRight size={14} className="text-foreground/20 group-hover:text-sigma-blue transition-colors" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category 2: Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <Server size={20} className="text-sigma-blue" />
            <h3 className="font-display text-2xl font-semibold text-foreground">{categories.platforms.title}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{categories.platforms.description}</p>
          <div className="grid md:grid-cols-2 gap-6">
            {categories.platforms.items.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 group"
              >
                <h4 className="font-display text-lg font-semibold text-foreground mb-3">{project.name}</h4>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Category 3: Automation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Cpu size={20} className="text-sigma-yellow" />
            <h3 className="font-display text-2xl font-semibold text-foreground">{categories.automation.title}</h3>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">{categories.automation.description}</p>
          <div className="grid md:grid-cols-1 gap-6 max-w-3xl">
            {categories.automation.items.map((project, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 glow-blue group"
              >
                <h4 className="font-display text-lg font-semibold text-foreground mb-3">{project.name}</h4>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
