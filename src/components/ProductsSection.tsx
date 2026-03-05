import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

/** Sigma-style isologo component */
const SigmaIsologo = ({ variant }: { variant: "analytics" | "trend" }) => {
  const isAnalytics = variant === "analytics";
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: isAnalytics ? "#E2FC03" : "#001FB3",
        }}
      >
        <span
          className="font-bold text-2xl"
          style={{ color: isAnalytics ? "#0B0D10" : "#ffffff" }}
        >
          Σ
        </span>
      </div>
      {/* Name rendered separately below in the card */}
    </div>
  );
};

const ProductsSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants = ["analytics", "trend"] as const;

  /** Brand name rendering with colored accent */
  const renderBrandName = (name: string, variant: "analytics" | "trend") => {
    const isAnalytics = variant === "analytics";
    // Split "Sigma Analytics" or "Sigma Trend Engine" into parts
    const sigmaPrefix = "Sigma";
    const suffix = name.startsWith(sigmaPrefix) ? name.slice(sigmaPrefix.length).trim() : name;

    return (
      <h3 className="text-2xl font-bold text-foreground mb-2">
        {sigmaPrefix}
        <span style={{ color: isAnalytics ? "#E2FC03" : "#4D7BFF" }}>
          {suffix ? ` ${suffix}` : ""}
        </span>
      </h3>
    );
  };

  return (
    <section id="productos" className="py-28 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            {t.products.title}
          </h2>
          <p className="text-lg text-secondary-soft max-w-2xl mx-auto leading-relaxed">
            {t.products.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {t.products.items.map((p, i) => {
            const variant = variants[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={visible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 + 0.2, duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="glass-card rounded-2xl p-10 flex flex-col justify-between group"
              >
                <div>
                  <div className="mb-7">
                    <SigmaIsologo variant={variant} />
                  </div>
                  {renderBrandName(p.name, variant)}
                  <span
                    className="inline-block text-sm font-medium rounded-full px-4 py-1.5 mb-5"
                    style={{
                    color: variant === "analytics" ? "#E2FC03" : "#4D7BFF",
                      background: variant === "analytics" ? "rgba(226,252,3,0.08)" : "rgba(0,31,179,0.12)",
                      border: `1px solid ${variant === "analytics" ? "rgba(226,252,3,0.15)" : "rgba(0,31,179,0.25)"}`,
                    }}
                  >
                    {p.tagline}
                  </span>
                  <p className="text-base text-secondary-soft leading-relaxed mb-10">
                    {p.description}
                  </p>
                </div>
                <button className="btn-glass-outline flex items-center justify-center gap-2 text-base px-7 py-3 rounded-full self-start hover-scale">
                  {p.cta}
                  <ArrowRight size={18} />
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
