import { Brain, Cog, Cloud, Target } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const icons = [Brain, Cog, Cloud, Target];

const MethodSection = () => {
  const { t } = useTranslation();

  return (
    <section id="metodo" className="py-28 lg:py-36">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            {t.method.title}
          </h2>
          {t.method.subtitle && (
            <p className="text-lg text-secondary-soft max-w-2xl mx-auto leading-relaxed">
              {t.method.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {t.method.items.map((title, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-7 flex items-center gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-foreground/70" />
                </div>
                <p className="text-base text-foreground/90 font-medium leading-relaxed">
                  {title}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
