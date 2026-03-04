import { useTranslation } from "@/i18n/useTranslation";
import { motion } from "framer-motion";

const FooterSection = () => {
  const { t } = useTranslation();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="border-t border-foreground/[0.06] py-14"
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <a href="#" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/10 border border-foreground/10 flex items-center justify-center">
              <span className="text-foreground font-bold text-xl">Σ</span>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">
                Sigma<span className="font-normal text-foreground/70">Tecnologías</span>
              </span>
              <p className="text-sm text-secondary-soft mt-0.5">
                {t.footer.tagline}
              </p>
            </div>
          </a>

          <div className="flex items-center gap-8 text-base text-secondary-soft">
            <a href="#productos" className="hover:text-foreground transition-colors">
              {t.footer.products}
            </a>
            <a href="#contacto" className="hover:text-foreground transition-colors">
              {t.footer.contact}
            </a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-foreground/[0.06] text-center">
          <p className="text-sm text-secondary-soft">
            {t.footer.designedBy}{" "}
            <a
              href={t.footer.designerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground hover:underline transition-colors"
            >
              {t.footer.designerName}
            </a>
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default FooterSection;
