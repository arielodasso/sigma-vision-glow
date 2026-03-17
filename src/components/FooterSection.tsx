import { useTranslation } from "@/i18n/useTranslation";
import { Link } from "react-router-dom";

const FooterSection = () => {
  const { t } = useTranslation();

  const links = [
    { label: t.footer.solutions, href: "/#soluciones" },
    { label: t.footer.projects, href: "/#proyectos" },
    { label: t.footer.products, href: "/#productos" },
    { label: t.footer.about, href: "/nosotros" },
    { label: t.footer.contact, href: "/#contacto" },
  ];

  return (
    <footer className="border-t border-foreground/[0.04] py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.08] border border-foreground/[0.06] flex items-center justify-center">
                <span className="text-foreground font-display font-bold text-lg">Σ</span>
              </div>
              <span className="font-display text-lg font-semibold text-foreground tracking-tight">
                {t.footer.brand}<span className="font-normal text-foreground/50">{t.footer.brandSuffix}</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            {links.map((l) => (
              l.href.startsWith("/") && !l.href.startsWith("/#") ? (
                <Link key={l.href} to={l.href} className="hover:text-foreground transition-colors">
                  {l.label}
                </Link>
              ) : (
                <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">
                  {l.label}
                </a>
              )
            ))}
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
