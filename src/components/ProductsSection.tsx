import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const ProductsSection = () => {
  const { t } = useTranslation();
  const variants = ["analytics", "trend"] as const;

  return (
    <section id="productos" className="section-padding bg-surface-elevated border-y border-foreground/[0.04]">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-sm text-sigma-yellow font-medium tracking-wide uppercase mb-4 block">
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

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`glass-card rounded-2xl p-10 flex flex-col justify-between ${isAnalytics ? "glow-yellow" : "glow-blue"}`}
              >
                <div>
                  {/* Logo mark */}
                  <div className="flex items-center gap-3 mb-8">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: accentColor }}
                    >
                      <span className="font-display font-bold text-xl" style={{ color: isAnalytics ? "#0B0D10" : "#fff" }}>
                        Σ
                      </span>
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    {p.name.startsWith("Sigma") ? (
                      <>Sigma<span style={{ color: accentColor }}>{p.name.slice(5)}</span></>
                    ) : p.name}
                  </h3>

                  {/* Tagline badge */}
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

                <button className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors self-start group">
                  {p.cta}
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
