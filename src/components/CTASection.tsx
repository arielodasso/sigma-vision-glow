import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="section-padding">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6">
            {t.cta.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.cta.description}
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center gap-2.5 bg-foreground text-background px-10 py-4 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            {t.cta.button}
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
