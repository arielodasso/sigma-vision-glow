import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, CheckCircle2, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

interface ThankYouProps {
  variant: "booking" | "contact";
}

const copy = {
  booking: {
    title: "Reunión agendada",
    eyebrow: "Confirmación",
    headline: "Tu reunión está confirmada.",
    description:
      "Vas a recibir un correo con la invitación y el enlace de la videollamada. Si necesitás reprogramar, podés hacerlo desde ese mismo email.",
    icon: Calendar,
    metaTitle: "Reunión confirmada | Sigma Tecnologías",
    metaDescription:
      "Tu reunión con Sigma Tecnologías fue agendada. Revisá tu correo para ver la invitación y el enlace de la videollamada.",
  },
  contact: {
    title: "Mensaje enviado",
    eyebrow: "Gracias",
    headline: "Recibimos tu mensaje.",
    description:
      "Gracias por escribirnos. Vamos a revisar tu consulta y responderte a la brevedad, normalmente dentro de las próximas 24 horas hábiles.",
    icon: Mail,
    metaTitle: "Gracias por contactarnos | Sigma Tecnologías",
    metaDescription:
      "Recibimos tu mensaje en Sigma Tecnologías. Te respondemos a la brevedad, normalmente dentro de las próximas 24 horas hábiles.",
  },
} as const;

const ThankYou = ({ variant }: ThankYouProps) => {
  const c = copy[variant];
  const Icon = c.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDescription} />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 pt-36 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card rounded-2xl p-8 sm:p-12 max-w-xl w-full text-center"
        >
          <div className="w-14 h-14 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.04] flex items-center justify-center mx-auto mb-7">
            <Icon size={22} className="text-foreground/70" />
          </div>

          <p className="text-[11px] uppercase tracking-widest text-foreground/40 mb-3">
            {c.eyebrow}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gradient leading-[1.15] mb-4">
            {c.headline}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
            {c.description}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-foreground/45 mb-8">
            <CheckCircle2 size={14} />
            <span>{c.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2.5 bg-foreground text-background px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
            >
              Volver al inicio
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-medium border border-foreground/[0.1] text-foreground/80 hover:bg-foreground/[0.05] transition-colors"
            >
              Leer el blog
            </Link>
          </div>
        </motion.div>
      </main>

      <FooterSection />
    </div>
  );
};

export default ThankYou;
