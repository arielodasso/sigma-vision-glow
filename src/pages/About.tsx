import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";
import { ArrowRight, MessageCircle, Calendar, Mail } from "lucide-react";
import useSmoothScroll from "@/hooks/use-smooth-scroll";
import BookingModal from "@/components/BookingModal";
import { useState } from "react";
import { Link } from "react-router-dom";
import { analytics } from "@/lib/analytics";

const WHATSAPP_URL = "https://wa.me/5492494556374?text=Hola%2C%20vengo%20del%20sitio%20y%20quiero%20escribirles%20directamente.";
const EMAIL_URL = "mailto:contacto@sigmatecnologiasarg.com?subject=Consulta%20desde%20el%20sitio";

const Contacto = () => {
  useSmoothScroll();
  const [bookingOpen, setBookingOpen] = useState(false);

  const channels = [
    {
      icon: MessageCircle,
      title: "WhatsApp",
      description: "Respuesta rápida, sin vueltas.",
      href: WHATSAPP_URL,
      external: true,
      label: "+54 9 2494 55-6374",
    },
    {
      icon: Calendar,
      title: "Reunión",
      description: "Conversemos de tu proyecto sin compromiso.",
      href: null,
      external: false,
      label: "Agendar 30 minutos",
    },
    {
      icon: Mail,
      title: "Email",
      description: "Para propuestas y documentación.",
      href: EMAIL_URL,
      external: true,
      label: "contacto@sigmatecnologiasarg.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contacto | Sigma Tecnologías</title>
        <meta name="description" content="Contanos tu proyecto con una breve propuesta y agendá una reunión sin compromiso. Software a medida, automatización e inteligencia artificial. Respuesta directa de Ariel Odasso." />
        <link rel="canonical" href="https://www.sigmatecnologiasarg.com/contacto" />
        <meta property="og:title" content="Contacto | Sigma Tecnologías" />
        <meta property="og:description" content="¿Querés construir tecnología para tu empresa? Contanos tu proyecto y agendá una reunión sin compromiso." />
        <meta property="og:url" content="https://www.sigmatecnologiasarg.com/contacto" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-36 pb-16 lg:pt-44 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.02)_0%,transparent_65%)]" />
          <div className="absolute -bottom-60 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.02)_0%,transparent_65%)]" />
        </div>
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-medium uppercase tracking-widest text-foreground/40">Contacto</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6 max-w-4xl">
              ¿Querés construir tecnología para tu empresa?
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Contanos tu proyecto con una breve propuesta y agendá una reunión sin compromiso.
              Te respondemos con diagnósticos concretos, comunicación directa y sin intermediarios.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/servicios"
                className="flex items-center gap-2.5 bg-foreground text-background px-8 py-4 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
              >
                Ver servicios
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => { setBookingOpen(true); analytics.agendaReunion("contacto-hero"); }}
                className="flex items-center gap-2.5 text-foreground/80 border border-foreground/10 px-8 py-4 rounded-full text-sm font-medium hover:bg-foreground/[0.04] hover:border-foreground/20 transition-all"
              >
                <Calendar size={16} />
                Agendar reunión
              </button>
            </div>
          </motion.div>

          {/* Canales de contacto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="grid sm:grid-cols-3 gap-5 mt-16"
          >
            {channels.map((c, i) => {
              const Icon = c.icon;
              const inner = (
                <div className="h-full glass-card rounded-2xl p-7 flex flex-col group-hover:bg-foreground/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center mb-5">
                    <Icon size={18} className="text-foreground/50" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-foreground mb-1">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{c.description}</p>
                  <p className="text-sm font-medium text-foreground/70 mt-auto">{c.label}</p>
                </div>
              );
              return c.external ? (
                <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" onClick={c.title === "WhatsApp" ? () => analytics.contacto("whatsapp") : undefined} className="group h-full">
                  {inner}
                </a>
              ) : (
                <button key={i} type="button" onClick={() => { setBookingOpen(true); analytics.agendaReunion("contacto-channels"); }} className="group text-left h-full">
                  {inner}
                </button>
              );
            })}
          </motion.div>
        </div>
      </section>

      <ContactSection />
      <FooterSection />
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
};

export default Contacto;