import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ContactSection from "@/components/ContactSection";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { ArrowUpRight, Code, Palette, Wrench, Users, Headphones } from "lucide-react";
import useSmoothScroll from "@/hooks/use-smooth-scroll";
import arielPhoto from "@/assets/ariel-odasso.jpg.asset.json";

const About = () => {
  const { t } = useTranslation();
  useSmoothScroll();

  const values = [
    {
      icon: Code,
      title: t.about.valuesTitles?.[0] || "Ejecución técnica",
      desc: t.about.valuesDescs?.[0] || "Más de 5 años desarrollando soluciones reales para empresas y agencias.",
    },
    {
      icon: Palette,
      title: t.about.valuesTitles?.[1] || "Diseño con propósito",
      desc: t.about.valuesDescs?.[1] || "Interfaces orientadas a negocio, usabilidad y conversión.",
    },
    {
      icon: Wrench,
      title: t.about.valuesTitles?.[2] || "Automatización",
      desc: t.about.valuesDescs?.[2] || "Procesos optimizados con n8n, Make y herramientas modernas.",
    },
    {
      icon: Users,
      title: t.about.valuesTitles?.[3] || "Comunicación directa",
      desc: t.about.valuesDescs?.[3] || "Trabajo codo a codo con el cliente, sin intermediarios.",
    },
    {
      icon: Headphones,
      title: t.about.valuesTitles?.[4] || "Soporte real",
      desc: t.about.valuesDescs?.[4] || "Acompañamiento antes, durante y después de la entrega.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-16 lg:pt-44 lg:pb-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6 max-w-4xl">
              {t.about.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t.about.description}
            </p>
          </motion.div>
        </div>
      </section>


      {/* Founder + Values grid */}
      <section className="section-padding">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Founder card — 2 cols */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start"
            >
              <div className="glass-card rounded-2xl p-8 lg:p-10">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-foreground/[0.06] mb-6">
                  <img src={arielPhoto.url} alt="Ariel Odasso" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-1">{t.about.founder}</h3>
                <p className="text-sm text-foreground/40 mb-5">{t.about.founderRole}</p>
                <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{t.about.bio}</p>

                <div className="border-t border-foreground/[0.06] pt-5 mb-6">
                  <p className="text-xs text-foreground/30 uppercase tracking-wide mb-3 font-medium">
                    {t.about.techLabel || "Tecnologías"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.about.technologies.split(", ").map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs text-foreground/50 bg-foreground/[0.04] border border-foreground/[0.06] rounded-full px-3 py-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <a
                  href={t.about.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors group"
                >
                  {t.about.portfolioLabel}
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>

            {/* Values — 3 cols */}
            <div className="lg:col-span-3 space-y-5">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className="flex gap-5 p-6 rounded-xl border border-foreground/[0.04] hover:border-foreground/[0.10] hover:bg-foreground/[0.02] transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-foreground/50" />
                    </div>
                    <div>
                      <h4 className="font-display text-base font-semibold text-foreground mb-1">{v.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                    </div>
                  </motion.div>
                );
              })}

              {/* Background items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl p-8 mt-8"
              >
                <h4 className="font-display text-lg font-semibold text-foreground mb-4">
                  {t.about.experienceLabel || "Experiencia"}
                </h4>
                <div className="space-y-3">
                  {t.about.background.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/30 mt-2 shrink-0" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default About;
