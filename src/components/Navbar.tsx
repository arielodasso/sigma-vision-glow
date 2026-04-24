import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BookingModal from "@/components/BookingModal";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
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
    { label: t.navbar.products, href: "/#productos" },
    { label: t.navbar.about, href: "/#filosofia" },
    { label: t.navbar.contact || "Contacto", href: "/contacto" },
    { label: "Blog", href: "/blog" },
    
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
    } else if (href.startsWith("/")) {
      window.location.href = href;
    }
  };

  const scrollToTop = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${
          scrolled 
            ? "bg-card/90 backdrop-blur-xl border border-foreground/[0.06] shadow-lg shadow-black/20" 
            : "bg-card/60 backdrop-blur-md border border-foreground/[0.04]"
        }`}>
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-foreground flex items-center justify-center group-hover:bg-foreground/90 transition-colors">
              <span className="text-background font-display font-bold text-lg">Σ</span>
            </div>
            <span className="font-display text-base font-bold text-foreground tracking-tight">
              Sigma<span className="font-medium text-foreground/50">Tecnologías</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {links.map((l) =>
              l.href.startsWith("/#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
                  className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>

          <div className="hidden lg:flex items-center">
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors"
            >
              {t.navbar.cta}
              <ArrowRight size={14} />
            </button>
          </div>

          <button
            className="lg:hidden text-foreground p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[76px] left-4 right-4 bg-card/95 backdrop-blur-xl border border-foreground/[0.06] rounded-2xl p-6 space-y-1 lg:hidden shadow-xl shadow-black/30"
          >
            {links.map((l) =>
              l.href.startsWith("/#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); handleNavClick(l.href); }}
                  className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
                >
                  {l.label}
                </Link>
              )
            )}
            <button
              type="button"
              onClick={() => { setOpen(false); setBookingOpen(true); }}
              className="block w-full bg-foreground text-background text-sm font-semibold px-5 py-3 rounded-full text-center mt-3"
            >
              {t.navbar.cta}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </nav>
  );
};

export default Navbar;
