import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

const SCHEDULE_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ2PpWB3iEynhEfWzNK523UydioImJl74qXNFHBkB-O68h2YSwZm9x34jFwbm7yl7ErrcAV6EX5U?gv=true";

const EMBED_URL = `${SCHEDULE_URL}&embedded=true`;

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
}

const BookingModal = ({ open, onClose }: BookingModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Google Calendar notifies the parent window once the appointment is booked.
  useEffect(() => {
    if (!open) return;
    const onMessage = (event: MessageEvent) => {
      if (!/(^|\.)google\.com$/.test(new URL(event.origin).hostname)) return;
      const raw = typeof event.data === "string" ? event.data : JSON.stringify(event.data ?? "");
      if (/book|confirm|success/i.test(raw)) {
        onClose();
        navigate("/confirmacion");
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, onClose, navigate]);

  if (typeof document === "undefined") return null;


  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-md p-4"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl h-[80vh] max-h-[720px] glass-card rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-foreground/40">
                  Agendá una reunión
                </p>
                <h3 className="font-display text-base font-semibold text-foreground mt-0.5">
                  Agendar reunión
                </h3>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="w-9 h-9 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <iframe
              src={EMBED_URL}
              title="Agendar reunión"
              className="flex-1 w-full bg-white"
              style={{ border: 0 }}
            />
            <div className="flex items-center justify-between gap-4 px-6 py-3 border-t border-foreground/[0.06]">
              <p className="text-[11px] text-foreground/40">
                ¿Ya completaste la reserva?
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/confirmacion");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border border-foreground/[0.1] text-foreground/80 hover:bg-foreground/[0.05] transition-colors"
              >
                <Check size={13} />
                Confirmar reunión
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default BookingModal;
