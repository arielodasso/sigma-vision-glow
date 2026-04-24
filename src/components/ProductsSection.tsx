import { ArrowRight, Play } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import VideoModal from "@/components/VideoModal";

const ProductsSection = () => {
  const { t } = useTranslation();
  const variants = ["analytics", "trend"] as const;
  const sectionRef = useRef<HTMLElement>(null);
  const [steOpen, setSteOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  const productLinks = [
    "https://sigmaanalyticsarg.com/",
    "https://wa.me/5492494556374?text=Hola%2C%20estoy%20interesado%20en%20saber%20m%C3%A1s%20sobre%20Sigma%20Trend%20Engine.",
  ];

  return (
    <section ref={sectionRef} id="productos" className="section-padding bg-surface-elevated border-y border-foreground/[0.04] relative overflow-hidden">
      {/* Parallax background elements */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-0 w-[200px] h-px bg-gradient-to-r from-sigma-yellow/[0.08] to-transparent" />
        <div className="absolute bottom-[30%] right-0 w-[200px] h-px bg-gradient-to-l from-sigma-blue/[0.08] to-transparent" />
        <div className="absolute top-0 left-[40%] w-px h-[250px] bg-gradient-to-b from-foreground/[0.04] to-transparent" />
        <div className="absolute -top-10 left-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.025)_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 right-[15%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.025)_0%,transparent_70%)]" />
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] right-[10%] w-16 h-16 border border-sigma-blue/[0.06] rounded-xl"
        />
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[15%] left-[8%] w-10 h-10 border border-sigma-yellow/[0.06] rounded-full"
        />
      </motion.div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <span className="text-sm text-foreground/40 font-medium tracking-wide uppercase mb-4 block">
            {t.products.tagline}
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.products.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t.products.subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {t.products.items.map((p, i) => {
            const variant = variants[i];
            const isAnalytics = variant === "analytics";
            const accentColor = isAnalytics ? "#E2FC03" : "#4C7AFF";
            const isologoBg = isAnalytics ? "#E2FC03" : "#001fb3";
            const isologoText = isAnalytics ? "#0B0D10" : "#fff";

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                className={`glass-card rounded-2xl p-10 flex flex-col justify-between ${isAnalytics ? "glow-yellow" : "glow-blue"}`}
              >
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: isologoBg }}
                    >
                      <span className="font-display font-bold text-xl" style={{ color: isologoText }}>
                        Σ
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {p.name.startsWith("Sigma") ? (
                      <>Sigma<span style={{ color: accentColor }}>{p.name.slice(5)}</span></>
                    ) : p.name}
                  </h3>

                  <span
                    className="inline-block text-xs font-medium rounded-full px-4 py-1.5 mb-6"
                    style={{
                      color: accentColor,
                      background: `${accentColor}10`,
                      border: `1px solid ${accentColor}20`,
                    }}
                  >
                    {p.tagline}
                  </span>

                  <p className="text-muted-foreground leading-relaxed mb-10">
                    {p.description}
                  </p>
                </div>

                {isAnalytics ? (
                  <a
                    href={productLinks[i]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors self-start group"
                  >
                    {p.cta}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSteOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors self-start group"
                  >
                    <Play size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    {p.cta}
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
