import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import CTASection from "@/components/CTASection";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { services } from "@/data/services";
import { analytics } from "@/lib/analytics";
import useSmoothScroll from "@/hooks/use-smooth-scroll";

const ServicesIndex = () => {
  useSmoothScroll();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": services.map((s, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": s.title,
      "description": s.hero,
      "url": `https://www.sigmatecnologiasarg.com/servicios/${s.slug}`,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Servicios · Sigma Tecnologías</title>
        <meta
          name="description"
          content="Desarrollo web, desarrollo de software, SaaS a medida, automatización de procesos, inteligencia artificial e integraciones. Tecnología que funciona, sin promesas."
        />
        <link rel="canonical" href="https://www.sigmatecnologiasarg.com/servicios" />
        <meta property="og:title" content="Servicios · Sigma Tecnologías" />
        <meta property="og:description" content="Desarrollo web, software a medida, SaaS, automatización, IA e integraciones." />
        <meta property="og:url" content="https://www.sigmatecnologiasarg.com/servicios" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-36 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.02)_0%,transparent_65%)]" />
          <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.02)_0%,transparent_65%)]" />
        </div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-widest text-foreground/40">
                <Link to="/" className="hover:text-foreground/70 transition-colors">Inicio</Link>
                <span className="mx-2 text-foreground/20">/</span>
                <span className="text-foreground/70">Servicios</span>
              </span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6 max-w-3xl">
              Servicios
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Cada proyecto es distinto y cada solución también. Estos son los caminos que más trabajamos:
              desarrollo web, software a medida, SaaS, automatización, inteligencia artificial e integraciones.
            </p>
          </motion.div>
        </div>
      </section>

      {/* GRID DE SERVICIOS */}
      <section className="section-padding bg-surface-elevated border-y border-foreground/[0.04]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => {
              const accent = i % 2 === 0 ? "sigma-yellow" : "sigma-blue";
              return (
                <motion.div
                  key={s.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Link
                    to={`/servicios/${s.slug}`}
                    onClick={() => analytics.servicio(s.slug)}
                    className="group block h-full glass-card rounded-2xl p-8 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-xs font-medium uppercase tracking-widest text-foreground/40 ${accent === "sigma-yellow" ? "group-hover:text-sigma-yellow" : "group-hover:text-sigma-blue"} transition-colors`}>
                        {s.category}
                      </span>
                      <span className="font-display text-4xl font-bold text-foreground/[0.08] group-hover:text-foreground/[0.15] transition-colors">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h2 className="font-display text-xl font-bold text-foreground mb-3">{s.name}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-8">{s.tagline}</p>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/60 group-hover:text-foreground transition-colors">
                      Conocé más
                      <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                    <div className={`absolute left-0 top-[15%] bottom-[15%] w-[2px] rounded-full bg-foreground/[0.00] ${accent === "sigma-yellow" ? "group-hover:bg-sigma-yellow/40" : "group-hover:bg-sigma-blue/40"} transition-all duration-500`} />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
};

export default ServicesIndex;