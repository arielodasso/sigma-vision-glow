import { Brain, TrendingUp, Workflow, Database } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const icons = [Brain, TrendingUp, Workflow, Database];

const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section id="servicios" className="py-28 lg:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            {t.services.title}
          </h2>
          <p className="text-lg text-secondary-soft max-w-2xl mx-auto leading-relaxed">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.services.items.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-8 group"
              >
                <div className="w-14 h-14 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center mb-5 group-hover:bg-foreground/[0.10] transition-colors">
                  <Icon size={28} className="text-foreground/70" />
                </div>
                <h3 className="text-lg text-foreground font-semibold mb-3">{s.title}</h3>
                <p className="text-base text-secondary-soft leading-relaxed">{s.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
