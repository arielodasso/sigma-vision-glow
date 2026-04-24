import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoSrc: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  accentColor?: string;
}

const VideoModal = ({
  open,
  onClose,
  videoSrc,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  accentColor = "#4C7AFF",
}: VideoModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      videoRef.current?.pause();
    };
  }, [open, onClose]);

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4"
          onClick={(e) => e.target === overlayRef.current && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-4xl glass-card rounded-2xl overflow-hidden"
          >
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-background/60 backdrop-blur text-foreground/70 hover:text-foreground hover:bg-background/80 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="bg-black aspect-video w-full">
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-t border-foreground/[0.06]">
              <div className="min-w-0">
                <h3 className="font-display text-xl font-bold text-foreground">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: accentColor,
                  color: "#fff",
                }}
              >
                {ctaLabel}
                <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default VideoModal;
