import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import BookingModal from "@/components/BookingModal";

const CTASection = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden">
      {/* Animated background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[50%] left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent" />
        <div className="absolute top-0 left-[50%] w-px h-full bg-gradient-to-b from-transparent via-foreground/[0.03] to-transparent" />
        
        {/* Color accent glows */}
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(226,252,3,0.03)_0%,transparent_70%)]" />
        <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(76,122,255,0.03)_0%,transparent_70%)]" />

        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-sigma-yellow/[0.04]"
        />
        <motion.div
          animate={{ scale: [1.05, 1, 1.05], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-sigma-blue/[0.04]"
        />
      </motion.div>

      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient leading-[1.1] mb-6">
            {t.cta.headline}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.cta.description}
          </p>
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="inline-flex items-center gap-2.5 bg-foreground text-background px-10 py-4 rounded-full text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            {t.cta.button}
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
};

export default CTASection;
