import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden pb-20 lg:pb-28">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large radial glow top-right */}
        <div className="absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.025)_0%,transparent_65%)]" />
        {/* Subtle glow bottom-left */}
        <div className="absolute -bottom-60 -left-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.015)_0%,transparent_65%)]" />

        {/* Decorative lines */}
        <div className="absolute top-[20%] right-[10%] w-px h-[200px] bg-gradient-to-b from-transparent via-foreground/[0.06] to-transparent" />
        <div className="absolute top-[35%] right-[8%] w-[120px] h-px bg-gradient-to-r from-foreground/[0.06] to-transparent" />
        <div className="absolute bottom-[25%] left-[5%] w-px h-[150px] bg-gradient-to-b from-transparent via-foreground/[0.05] to-transparent" />

        {/* Floating geometric shapes */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[15%] w-20 h-20 border border-foreground/[0.04] rounded-2xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[25%] w-14 h-14 border border-foreground/[0.03] rounded-full"
        />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[45%] left-[8%] w-3 h-3 rounded-full bg-foreground/[0.06]"
        />

        {/* Grid dots pattern */}
        <div className="absolute top-[10%] right-[5%] grid grid-cols-5 gap-4 opacity-[0.04]">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
          ))}
        </div>
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.012]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />

      <div className="relative z-10 container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="font-display text-5xl sm:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold leading-[1.05] tracking-tight mb-8">
            <span className="text-gradient">{t.hero.headline}</span>
            <br />
            <span className="text-foreground">{t.hero.headlineAccent}</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-12"
        >
          {t.hero.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <a
            href="#soluciones"
            className="flex items-center gap-2.5 bg-foreground text-background px-8 py-4 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            {t.hero.ctaPrimary}
            <ArrowRight size={16} />
          </a>
          <a
            href="#productos"
            className="flex items-center gap-2.5 text-foreground/80 border border-foreground/10 px-8 py-4 rounded-full text-sm font-medium hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all"
          >
            {t.hero.ctaSecondary}
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
