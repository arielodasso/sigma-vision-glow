import { BarChart3, Sparkles, ArrowRight } from "lucide-react";

const products = [
  {
    icon: BarChart3,
    name: "Sigma Analytics",
    tagline: "Análisis de rendimiento para fútbol",
    description:
      "Plataforma que permite a clubes, analistas y jugadores analizar estadísticas, comparar rendimiento y generar reportes con inteligencia artificial.",
    cta: "Conocer producto",
  },
  {
    icon: Sparkles,
    name: "Trend Intelligence Engine",
    tagline: "Motor de detección de tendencias con IA",
    description:
      "Diseñado para agencias de marketing que necesitan identificar tendencias emergentes y generar ideas de contenido estratégicas automáticamente.",
    cta: "Conocer producto",
  },
];

const ProductsSection = () => {
  return (
    <section id="productos" className="py-24 lg:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-4">
            Nuestros productos
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Plataformas propias impulsadas por inteligencia artificial y diseñadas para resolver necesidades específicas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {products.map((p) => (
            <div
              key={p.name}
              className="glass rounded-2xl p-8 flex flex-col justify-between hover:glow-accent transition-all duration-300 group"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <p.icon size={28} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-primary font-medium mb-4">{p.tagline}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {p.description}
                </p>
              </div>
              <button className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors self-start">
                {p.cta}
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
