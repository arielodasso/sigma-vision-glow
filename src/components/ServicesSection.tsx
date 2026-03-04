import { Brain, TrendingUp, Workflow, Database } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: Brain,
    title: "Plataformas de analítica con IA",
    description: "Soluciones que combinan machine learning y visualización de datos para generar insights accionables.",
  },
  {
    icon: TrendingUp,
    title: "Detección de tendencias",
    description: "Sistemas inteligentes que identifican patrones emergentes en tiempo real para adelantarse al mercado.",
  },
  {
    icon: Workflow,
    title: "Automatización de procesos",
    description: "Flujos de trabajo automatizados que eliminan tareas repetitivas y optimizan la operación.",
  },
  {
    icon: Database,
    title: "Plataformas SaaS basadas en datos",
    description: "Productos de software escalables diseñados para transformar datos en decisiones estratégicas.",
  },
];

const ServicesSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="servicios" className="py-28 lg:py-36" ref={ref}>
      <div className="container mx-auto px-6">
        <div className={`text-center mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-4xl sm:text-5xl font-bold text-gradient mb-5">
            Qué hacemos
          </h2>
          <p className="text-lg text-secondary-soft max-w-2xl mx-auto leading-relaxed">
            Construimos productos de software inteligentes que resuelven problemas reales con inteligencia artificial y datos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <div
              key={s.title}
              className={`glass-card rounded-2xl p-8 transition-all duration-700 group hover-scale ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: visible ? `${i * 100 + 200}ms` : '0ms' }}
            >
              <div className="w-14 h-14 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center mb-5 group-hover:bg-foreground/[0.10] transition-colors">
                <s.icon size={28} className="text-foreground/70" />
              </div>
              <h3 className="text-lg text-foreground font-semibold mb-3">{s.title}</h3>
              <p className="text-base text-secondary-soft leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
