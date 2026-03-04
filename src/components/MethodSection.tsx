import { Brain, Cog, Cloud, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

const icons = [Brain, Cog, Cloud, Target];

const MethodSection = () => {
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
    <section id="metodo" className="py-28 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            {t.method.title}
          </h2>
          <p className="text-lg text-secondary-soft max-w-2xl mx-auto leading-relaxed">
            {t.method.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {t.method.items.map((title, i) => {
            const Icon = icons[i];
            return (
              <div
                key={i}
                className={`glass-card rounded-2xl p-7 flex items-center gap-5 transition-all duration-700 hover-scale ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: visible ? `${i * 100 + 200}ms` : '0ms' }}
              >
                <div className="w-12 h-12 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center shrink-0">
                  <Icon size={24} className="text-foreground/70" />
                </div>
                <p className="text-base text-foreground/90 font-medium leading-relaxed">
                  {title}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
