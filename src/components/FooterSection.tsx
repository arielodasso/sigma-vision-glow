import { useTranslation } from "@/i18n/useTranslation";
import { Link, useLocation } from "react-router-dom";

const FooterSection = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const links = [
    { label: t.footer.solutions, href: "/#soluciones" },
    { label: t.footer.products, href: "/#productos" },
    { label: t.footer.about, href: "/#filosofia" },
    { label: "Blog", href: "/blog", isRoute: true },
    { label: t.footer.contact, href: "/contacto" },
  ];

  const scrollToTop = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = (href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = href;
      }
    }
  };

  return (
    <footer className="border-t border-foreground/[0.04] py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          <div>
            <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background font-display font-bold text-lg">Σ</span>
              </div>
              <span className="font-display text-base font-bold text-foreground tracking-tight">
                {t.footer.brand}<span className="font-medium text-foreground/50">{t.footer.brandSuffix}</span>
              </span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {links.map((l) =>
              l.isRoute ? (
                <Link
                  key={l.href}
                  to={l.href}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
                  className="hover:text-foreground transition-colors cursor-pointer"
                >
                  {l.label}
                </a>
              )
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-foreground/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sigma Tecnologías
          </p>
          <p className="text-xs text-muted-foreground">
            {t.footer.designedBy}{" "}
            <a
              href={t.footer.designerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/60 hover:text-foreground transition-colors"
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
