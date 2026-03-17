import { Code, Workflow, Cloud, Database } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const icons = [Code, Workflow, Cloud, Database];

const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section id="soluciones" className="section-padding bg-surface-elevated border-y border-foreground/[0.04]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-sm text-sigma-yellow font-medium tracking-wide uppercase mb-4 block">
            {t.services.tagline}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {t.services.items.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 lg:p-10 group"
              >
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center mb-6 group-hover:bg-foreground/[0.08] transition-colors">
                  <Icon size={24} className="text-foreground/60" />
                </div>
                <h3 className="font-display text-xl text-foreground font-semibold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{s.description}</p>
                <p className="text-sm text-foreground/50 border-t border-foreground/[0.04] pt-4">{s.outcomes}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
