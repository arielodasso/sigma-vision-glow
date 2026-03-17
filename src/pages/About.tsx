import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ContactSection from "@/components/ContactSection";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-sm text-sigma-yellow font-medium tracking-wide uppercase mb-4 block">
              {t.about.tagline}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-8 max-w-4xl">
              {t.about.title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-12">
              {t.about.description}
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Founder */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="glass-card rounded-2xl p-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-foreground/[0.06] border border-foreground/[0.06] flex items-center justify-center mb-6">
                <span className="font-display text-2xl font-bold text-foreground">AO</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-1">{t.about.founder}</h3>
              <p className="text-sm text-sigma-yellow mb-6">{t.about.founderRole}</p>
              <div className="space-y-3">
                {t.about.background.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-sigma-yellow/60" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:pt-8"
            >
              <p className="font-display text-2xl sm:text-3xl font-semibold text-foreground/90 leading-relaxed">
                {t.about.philosophy}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default About;
