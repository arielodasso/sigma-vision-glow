import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";
import { Server, Cpu, ExternalLink, Globe } from "lucide-react";
import ClientsCarousel, { type ClientLogo } from "@/components/ClientsCarousel";
import faztredLogo from "@/assets/clients/faztred.png.asset.json";
import offmarketLogo from "@/assets/clients/offmarket.png.asset.json";
import justaLogo from "@/assets/clients/justa.png.asset.json";
import unidosLogo from "@/assets/clients/unidos-para-amar.png.asset.json";
import geonosisLogo from "@/assets/clients/geonosis.png.asset.json";
import cristianLogo from "@/assets/clients/cristian-schauvinhold.png.asset.json";
import estamosLogo from "@/assets/clients/estamos-unidos.png.asset.json";
import calistheniaLogo from "@/assets/clients/calisthenia-online.png.asset.json";
import perisLogo from "@/assets/clients/peris-electricidad.png.asset.json";
import mobihunterLogo from "@/assets/clients/mobihunter.png.asset.json";

const webClients: ClientLogo[] = [
  { name: "Faztred", url: "https://faztred.com.ar/", logo: faztredLogo.url, theme: "dark" },
  { name: "OffMarket", url: "https://www.offmarket.com.ar/", logo: offmarketLogo.url, theme: "dark" },
  { name: "Justa", url: "https://justaagencia.com/", logo: justaLogo.url, theme: "light" },
  { name: "Unidos Para Amar", url: "https://unidosparaamar.org/", logo: unidosLogo.url, theme: "light" },
  { name: "Geonosis", url: "https://geonosis.com.ar/", logo: geonosisLogo.url, theme: "light" },
  { name: "Cristian Schauvinhold", url: "https://cristianschauvinhold.com/", logo: cristianLogo.url, theme: "light" },
  { name: "Estamos Unidos", url: "https://somosestamosunidos.com/", logo: estamosLogo.url, theme: "dark" },
  { name: "Calisthenia Online", url: "https://calisthenia.online/", logo: calistheniaLogo.url, theme: "light" },
  { name: "Peris Electricidad", url: "https://www.periselectricidad.es/", logo: perisLogo.url, theme: "light" },
  { name: "Mobihunter", url: "http://mobihunter.io/", logo: mobihunterLogo.url, theme: "dark" },
];

const platformLinks: Record<string, string> = {
  "Iceberg": "https://icebergpol.com/",
  // "Viaja Seguro a Marruecos" — sitio inactivo, sin enlace
};

const ProjectsSection = () => {
  const { t } = useTranslation();
  const { categories } = t.projects;

  return (
    <section id="proyectos" className="section-padding relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[15%] w-px h-full bg-gradient-to-b from-transparent via-foreground/[0.03] to-transparent" />
        <div className="absolute top-[10%] right-0 w-[250px] h-px bg-gradient-to-l from-foreground/[0.04] to-transparent" />
        <div className="absolute bottom-[20%] left-0 w-[180px] h-px bg-gradient-to-r from-foreground/[0.04] to-transparent" />
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[8%] right-[12%] w-12 h-12 border border-foreground/[0.03] rounded-lg rotate-45"
        />
        <div className="absolute bottom-[10%] right-[20%] grid grid-cols-4 gap-3 opacity-[0.03]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient mb-4">
            {t.projects.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t.projects.subtitle}
          </p>
        </motion.div>

        <div className="space-y-32">
          {/* Category 1: Web Development */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start relative"
            >
              {/* Side accent */}
              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-foreground/[0.08] via-foreground/[0.04] to-transparent hidden lg:block" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Globe size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.web.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">{categories.web.description}</p>
              
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 self-center"
            >
              <ClientsCarousel clients={webClients} />
            </motion.div>
          </div>

          {/* Category 2: Platforms */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start relative"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-foreground/[0.08] via-foreground/[0.04] to-transparent hidden lg:block" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Server size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.platforms.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{categories.platforms.description}</p>
            </motion.div>

            <div className="lg:col-span-3 space-y-6">
              {categories.platforms.items.map((project, i) => {
                const url = platformLinks[project.name];
                const isLink = Boolean(url);
                const sharedClass =
                  "block glass-card rounded-2xl p-8 group relative";
                const content = (
                  <>
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-foreground/[0.00] group-hover:bg-foreground/[0.08] transition-all duration-500 rounded-full" />
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-display text-lg font-semibold text-foreground">{project.name}</h4>
                      {isLink && (
                        <ExternalLink size={14} className="text-foreground/15 group-hover:text-foreground/50 transition-colors" />
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                  </>
                );
                return isLink ? (
                  <motion.a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={sharedClass}
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={sharedClass}
                  >
                    {content}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Category 3: Automation */}
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 lg:sticky lg:top-32 lg:self-start relative"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-px bg-gradient-to-b from-foreground/[0.08] via-foreground/[0.04] to-transparent hidden lg:block" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                  <Cpu size={20} className="text-foreground/50" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">{categories.automation.title}</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">{categories.automation.description}</p>
            </motion.div>

            <div className="lg:col-span-3 space-y-6">
              {categories.automation.items.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card rounded-2xl p-8 relative"
                >
                  <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-foreground/[0.06] rounded-full" />
                  <h4 className="font-display text-lg font-semibold text-foreground mb-3">{project.name}</h4>
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
