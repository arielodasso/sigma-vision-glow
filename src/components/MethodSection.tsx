import { Brain, Cog, Cloud, Target } from "lucide-react";

const items = [
  { icon: Brain, title: "Inteligencia artificial aplicada al análisis de datos" },
  { icon: Cog, title: "Automatización de procesos" },
  { icon: Cloud, title: "Arquitectura SaaS escalable" },
  { icon: Target, title: "Plataformas orientadas a decisiones basadas en datos" },
];

const MethodSection = () => {
  return (
    <section id="metodo" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Cómo trabajamos
          </h2>
          <p className="text-secondary-soft max-w-xl mx-auto">
            Nuestro enfoque tecnológico combina las mejores prácticas de ingeniería con inteligencia artificial de vanguardia.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {items.map((item, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-6 flex items-start gap-4 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-foreground/[0.06] border border-foreground/[0.08] flex items-center justify-center shrink-0">
                <item.icon size={20} className="text-foreground/70" />
              </div>
              <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                {item.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MethodSection;
