import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";

const FooterSection = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className={`border-t border-foreground/[0.06] py-14 transition-all duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
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
    </footer>
  );
};

export default FooterSection;
