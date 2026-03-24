import { useTranslation } from "@/i18n/useTranslation";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";

const wordRevealVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const wordChild = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const ManifestoSection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const accentX = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  const headlineWords = t.manifesto.headline.split(" ");

  return (
    <section
      ref={sectionRef}
      id="filosofia"
      className="section-padding border-t border-foreground/[0.04] relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-foreground/[0.04] via-foreground/[0.02] to-transparent" />
        <div className="absolute top-[20%] right-0 w-[300px] h-px bg-gradient-to-l from-foreground/[0.05] to-transparent" />
        <div className="absolute bottom-[30%] left-0 w-[200px] h-px bg-gradient-to-r from-foreground/[0.05] to-transparent" />

        {/* Parallax accent glow */}
        <motion.div
          style={{ y: bgY }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.04)_0%,transparent_70%)]"
        />
        <motion.div
          style={{ x: accentX }}
          className="absolute bottom-[10%] -left-20 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.03)_0%,transparent_70%)]"
        />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[10%] w-16 h-16 border border-sigma-yellow/10 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[20%] w-10 h-10 border border-sigma-blue/10 rounded-lg rotate-45"
        />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="text-sm text-foreground/40 font-medium tracking-wide uppercase mb-4 block"
            >
              {t.manifesto.tagline}
            </motion.span>

            {/* Word-by-word reveal like cintelli */}
            <motion.h2
              variants={wordRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 flex flex-wrap gap-x-[0.3em]"
            >
              {headlineWords.map((word, i) => (
                <motion.span key={i} variants={wordChild} className="text-gradient inline-block">
                  {word}
                </motion.span>
              ))}
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="line-accent mb-8 origin-left"
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              {t.manifesto.description}
            </motion.p>
          </div>

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
                className="flex items-center gap-4 p-5 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.08] hover:bg-foreground/[0.02] transition-all duration-300 relative group"
              >
                {/* Accent side line with color on hover */}
                <div className="absolute left-0 top-[25%] bottom-[25%] w-px bg-foreground/[0.08] group-hover:bg-sigma-yellow/30 transition-colors duration-300" />
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] flex items-center justify-center shrink-0 group-hover:bg-sigma-yellow/10 transition-colors duration-300">
                  <Check size={16} className="text-foreground/50 group-hover:text-sigma-yellow transition-colors duration-300" />
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
