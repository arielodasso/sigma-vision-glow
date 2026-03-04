import { Brain, TrendingUp, Workflow, Database } from "lucide-react";

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
  return (
    <section id="servicios" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Qué hacemos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Construimos productos de software inteligentes que resuelven problemas reales con inteligencia artificial y datos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className="glass rounded-xl p-6 hover:glow-accent transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <s.icon size={24} className="text-primary" />
              </div>
              <h3 className="text-foreground font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
