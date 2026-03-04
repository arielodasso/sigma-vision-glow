import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl pt-24">
        <div className="inline-block glass rounded-full px-4 py-1.5 mb-8 text-xs font-medium text-muted-foreground tracking-wide">
          Inteligencia Artificial · Datos · Automatización
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gradient mb-6">
          Productos de IA y sistemas de automatización para empresas modernas
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Desarrollamos plataformas inteligentes que ayudan a empresas y agencias a analizar datos, descubrir tendencias y tomar mejores decisiones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#productos"
            className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Ver productos
            <ArrowRight size={16} />
          </a>
          <a
            href="#contacto"
            className="flex items-center gap-2 glass text-foreground font-medium px-8 py-3.5 rounded-lg hover:bg-secondary/50 transition-colors text-sm"
          >
            <MessageCircle size={16} />
            Contactar
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
