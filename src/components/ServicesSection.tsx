import { Code, Workflow, Cloud, Database } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const icons = [Code, Workflow, Cloud, Database];
const accentColors = ["sigma-yellow", "sigma-blue", "sigma-yellow", "sigma-blue"];

const ServicesSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={sectionRef} id="soluciones" className="section-padding bg-surface-elevated border-y border-foreground/[0.04] relative overflow-hidden">
      {/* Decorative elements with parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-[20%] w-px h-[300px] bg-gradient-to-b from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-0 left-[30%] w-px h-[200px] bg-gradient-to-t from-foreground/[0.04] to-transparent" />
        <div className="absolute top-[50%] left-0 w-[150px] h-px bg-gradient-to-r from-sigma-yellow/[0.08] to-transparent" />
        <div className="absolute top-[40%] right-0 w-[100px] h-px bg-gradient-to-l from-sigma-blue/[0.08] to-transparent" />
        
        {/* Accent glow */}
        <div className="absolute top-[20%] right-[5%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.02)_0%,transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[10%] w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.02)_0%,transparent_70%)]" />
        
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] right-[8%] w-24 h-24 border border-sigma-blue/[0.06] rounded-2xl rotate-12"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[5%] w-12 h-12 border border-sigma-yellow/[0.06] rounded-full"
        />
      </motion.div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-gradient mb-4">
            {t.services.title}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
            {t.services.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {t.services.items.map((s, i) => {
            const Icon = icons[i];
            const accent = accentColors[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 lg:p-10 group relative"
              >
                {/* Left accent line on hover with color */}
                <div className={`absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-foreground/[0.00] ${accent === "sigma-yellow" ? "group-hover:bg-sigma-yellow/30" : "group-hover:bg-sigma-blue/30"} transition-all duration-500 rounded-full`} />
                <div className={`w-12 h-12 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center mb-6 ${accent === "sigma-yellow" ? "group-hover:bg-sigma-yellow/[0.08] group-hover:border-sigma-yellow/[0.15]" : "group-hover:bg-sigma-blue/[0.08] group-hover:border-sigma-blue/[0.15]"} transition-colors`}>
                  <Icon size={24} className={`text-foreground/50 ${accent === "sigma-yellow" ? "group-hover:text-sigma-yellow" : "group-hover:text-sigma-blue"} transition-colors`} />
                </div>
                <h3 className="font-display text-lg sm:text-xl text-foreground font-semibold mb-3">{s.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">{s.description}</p>

                <p className="text-sm text-foreground/40 border-t border-foreground/[0.04] pt-4">{s.outcomes}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
