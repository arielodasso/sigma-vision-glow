import heroBg from "@/assets/hero-bg.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 grayscale"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* Radial gradient blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
      </div>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background" />
      {/* Subtle noise */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 container mx-auto px-6 text-center max-w-5xl pt-28">
        <div className="inline-block glass rounded-full px-5 py-2 mb-10 text-sm font-medium text-secondary-soft tracking-wide">
          Inteligencia Artificial · Datos · Automatización
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-gradient mb-8">
          Productos de IA y sistemas de automatización para empresas modernas
        </h1>

        <p className="text-lg sm:text-xl text-secondary-soft max-w-2xl mx-auto mb-12 leading-relaxed">
          Desarrollamos plataformas inteligentes que ayudan a empresas y agencias a analizar datos, descubrir tendencias y tomar mejores decisiones.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#productos"
            className="flex items-center gap-2.5 btn-primary-neutral px-10 py-4 rounded-full text-base font-semibold"
          >
            Ver productos
            <ArrowRight size={18} />
          </a>
          <a
            href="#contacto"
            className="flex items-center gap-2.5 btn-glass-outline px-10 py-4 rounded-full text-base"
          >
            <MessageCircle size={18} />
            Contactar
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
