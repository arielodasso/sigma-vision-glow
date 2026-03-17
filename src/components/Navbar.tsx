import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const links = [
    { label: t.navbar.solutions, href: "/#soluciones" },
    { label: t.navbar.projects, href: "/#proyectos" },
    { label: t.navbar.products, href: "/#productos" },
    { label: t.navbar.about, href: "/nosotros" },
  ];

  const handleNavClick = (href: string) => {
    setOpen(false);
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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between transition-all duration-500 ${scrolled ? "glass-strong rounded-2xl px-6 py-3" : ""}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-foreground/[0.08] border border-foreground/[0.06] flex items-center justify-center group-hover:bg-foreground/[0.12] transition-colors">
              <span className="text-foreground font-display font-bold text-lg">Σ</span>
            </div>
            <span className="font-display text-lg font-semibold text-foreground tracking-tight">
              Sigma<span className="font-normal text-foreground/50">Tecnologías</span>
            </span>
          </Link>

          {/* Center links — desktop */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) => (
              l.href.startsWith("/#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {l.label}
                </Link>
              )
            ))}
          </div>

          {/* Right CTA — desktop */}
          <div className="hidden lg:flex items-center">
            <a
              href="/#contacto"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#contacto"); }}
              className="flex items-center gap-2 text-sm font-medium bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors"
            >
              {t.navbar.cta}
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[72px] left-4 right-4 glass-strong rounded-2xl p-6 space-y-1 lg:hidden"
          >
            {links.map((l) => (
              l.href.startsWith("/#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
                  className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg"
                >
                  {l.label}
                </Link>
              )
            ))}
            <a
              href="/#contacto"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#contacto"); }}
              className="block bg-foreground text-background text-sm font-medium px-5 py-3 rounded-full text-center mt-3"
            >
              {t.navbar.cta}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
