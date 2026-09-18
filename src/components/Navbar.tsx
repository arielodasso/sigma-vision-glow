import { useState, useEffect, useRef } from "react";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BookingModal from "@/components/BookingModal";
import sigmaIsologo from "@/assets/brand/sigma-isologo-4.png.asset.json";
import { services } from "@/data/services";
import { analytics } from "@/lib/analytics";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [location]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

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

  const serviceMenu = (
    <div className="py-3 w-72">
      <Link
        to="/servicios"
        onClick={() => setServicesOpen(false)}
        className="flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-foreground hover:bg-foreground/[0.04] transition-colors"
      >
        {t.navbar.servicesAll}
        <ArrowRight size={14} className="text-foreground/40" />
      </Link>
      <div className="h-px bg-foreground/[0.06] my-2 mx-4" />
      {services.map((s) => (
        <Link
          key={s.slug}
          to={`/servicios/${s.slug}`}
          onClick={() => {
            setServicesOpen(false);
            analytics.servicio(s.slug);
          }}
          className="group flex items-start gap-3 px-4 py-2.5 rounded-lg hover:bg-foreground/[0.04] transition-colors"
        >
          <span className="text-xs text-foreground/35 group-hover:text-foreground/70 transition-colors pt-0.5">
            {s.name}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500 ${
          scrolled 
            ? "bg-card/90 backdrop-blur-xl border border-foreground/[0.06] shadow-lg shadow-black/20" 
            : "bg-card/60 backdrop-blur-md border border-foreground/[0.04]"
        }`}>
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-3 group">
            <img
              src={sigmaIsologo.url}
              alt="Isologo Sigma Tecnologías"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span className="font-display text-base font-bold text-foreground tracking-tight">
              Sigma<span className="font-bold text-foreground/50">Tecnologías</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            {/* Servicios con dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setServicesOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
                  servicesOpen || location.pathname.startsWith("/servicios")
                    ? "text-foreground"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {t.navbar.solutions}
                <ChevronDown size={14} className={`transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-3 bg-card/95 backdrop-blur-xl border border-foreground/[0.06] rounded-2xl shadow-xl shadow-black/30 overflow-hidden"
                  >
                    {serviceMenu}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="/#proyectos"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#proyectos"); }}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
            >
              {t.navbar.caseStudies}
            </a>
            <a
              href="/#productos"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#productos"); }}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
            >
              {t.navbar.products}
            </a>
            <Link
              to="/nosotros"
              className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
            >
              {t.navbar.about}
            </Link>
            <Link
              to="/blog"
              onClick={() => analytics.blog(undefined)}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
            >
              Blog
            </Link>
            <Link
              to="/contacto"
              onClick={() => analytics.contacto("navbar")}
              className="text-sm text-foreground/50 hover:text-foreground transition-colors duration-300 font-medium"
            >
              {t.navbar.contact}
            </Link>
          </div>

          <div className="hidden lg:flex items-center">
            <button
              type="button"
              onClick={() => { setBookingOpen(true); analytics.agendaReunion("navbar"); }}
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
            className="fixed top-[76px] left-4 right-4 bg-card/95 backdrop-blur-xl border border-foreground/[0.06] rounded-2xl p-6 space-y-1 lg:hidden shadow-xl shadow-black/30 max-h-[80vh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => setMobileServicesOpen((v) => !v)}
              className="w-full flex items-center justify-between text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              <span>{t.navbar.solutions}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {mobileServicesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 space-y-1">
                    <Link
                      to="/servicios"
                      className="block text-sm text-foreground/40 hover:text-foreground transition-colors py-2.5 px-4 rounded-lg font-medium"
                    >
                      {t.navbar.servicesAll}
                    </Link>
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        to={`/servicios/${s.slug}`}
                        onClick={() => analytics.servicio(s.slug)}
                        className="block text-sm text-foreground/40 hover:text-foreground transition-colors py-2.5 px-4 rounded-lg font-medium"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <a
              href="/#proyectos"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#proyectos"); }}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              {t.navbar.caseStudies}
            </a>
            <a
              href="/#productos"
              onClick={(e) => { e.preventDefault(); handleNavClick("/#productos"); }}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              {t.navbar.products}
            </a>
            <Link
              to="/nosotros"
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              {t.navbar.about}
            </Link>
            <Link
              to="/blog"
              onClick={() => analytics.blog(undefined)}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              Blog
            </Link>
            <Link
              to="/contacto"
              onClick={() => analytics.contacto("navbar-mobile")}
              className="block text-sm text-foreground/60 hover:text-foreground transition-colors py-3 px-4 rounded-lg font-medium"
            >
              {t.navbar.contact}
            </Link>
            <button
              type="button"
              onClick={() => { setOpen(false); setBookingOpen(true); analytics.agendaReunion("navbar-mobile"); }}
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