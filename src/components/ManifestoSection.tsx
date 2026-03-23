import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ManifestoSection = () => {
  const { t } = useTranslation();

  return (
    <section id="filosofia" className="section-padding border-t border-foreground/[0.04] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-foreground/[0.04] via-foreground/[0.02] to-transparent" />
        <div className="absolute top-[20%] right-0 w-[300px] h-px bg-gradient-to-l from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-[30%] left-0 w-[200px] h-px bg-gradient-to-r from-foreground/[0.05] to-transparent" />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-16 h-16 border border-foreground/[0.03] rounded-full"
        />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm text-foreground/40 font-medium tracking-wide uppercase mb-4 block">
              {t.manifesto.tagline}
            </span>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6">
              {t.manifesto.headline}
            </h2>
            <div className="line-accent mb-8" />
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t.manifesto.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5 lg:pt-12"
          >
            {t.manifesto.items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.08] hover:bg-foreground/[0.02] transition-all duration-300 relative"
              >
                {/* Side accent line */}
                <div className="absolute left-0 top-[25%] bottom-[25%] w-px bg-foreground/[0.08]" />
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0">
                  <Check size={16} className="text-foreground/50" />
                </div>
                <span className="text-foreground/90 font-medium">{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ManifestoSection;
