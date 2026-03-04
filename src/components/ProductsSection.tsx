import { BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

const icons = [BarChart3, Sparkles];

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
            const Icon = icons[i];
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-10 flex flex-col justify-between transition-all duration-700 group hover-scale ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: visible ? `${i * 150 + 200}ms` : '0ms' }}
              >
                <div>
                  <div className="w-16 h-16 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center mb-7 group-hover:bg-foreground/[0.10] transition-colors">
                    <Icon size={32} className="text-foreground/70" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{p.name}</h3>
                  <span className="inline-block text-sm font-medium text-foreground/50 bg-foreground/[0.06] border border-foreground/[0.08] rounded-full px-4 py-1.5 mb-5">
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
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
