import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Instagram, Mail, MessageCircle, X } from "lucide-react";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";

const FloatingContact = () => {
  const [open, setOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const itemClass = "flex items-center justify-start gap-3 w-full rounded-full bg-card/95 border-border/70 shadow-lg backdrop-blur-md text-foreground hover:bg-muted hover:text-foreground hover:border-foreground/25";

  return (
    <div className="fixed bottom-[4.5rem] right-5 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-14 right-0 flex min-w-[230px] flex-col items-stretch gap-2"
          >
            <Button className={itemClass} variant="outline" onClick={() => { setOpen(false); setBookingOpen(true); }}>
              <CalendarDays className="h-4 w-4" />
              Agendar reunión
            </Button>
            <Button asChild className={itemClass} variant="outline">
              <a href="mailto:contacto@sigmatecnologiasarg.com">
                <Mail className="h-4 w-4" />
                Escribinos por mail
              </a>
            </Button>
            <Button asChild className={itemClass} variant="outline">
              <a href="https://www.instagram.com/sigma.tecnologias/" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                @sigma.tecnologias
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Cerrar opciones de contacto" : "Abrir opciones de contacto"}
        aria-expanded={open}
        className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
};

export default FloatingContact;