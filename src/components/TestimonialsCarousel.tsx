import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  sort_order: number;
}

interface Props {
  testimonials: Testimonial[];
  speed?: number; // seconds for one full loop
}

const TestimonialsCarousel = ({ testimonials, speed = 50 }: Props) => {
  // Only create marquee if more than 3 testimonials
  const shouldMarquee = testimonials.length > 3;
  const loop = shouldMarquee ? [...testimonials, ...testimonials] : testimonials;
  const displayTestimonials = shouldMarquee ? loop : testimonials;

  return (
    <div className="relative w-full overflow-hidden py-4">
      {/* Fade edges mask for marquee */}
      <div
        style={{
          animationDuration: `${speed}s`,
          maskImage: shouldMarquee
            ? "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
            : "none",
          WebkitMaskImage: shouldMarquee
            ? "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)"
            : "none",
        }}
        className={shouldMarquee
          ? "flex gap-6 w-max animate-clients-marquee hover:[animation-play-state:paused]"
          : "flex gap-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        }
      >
        {displayTestimonials.map((testimonial, i) => (
          <motion.div
            key={`${testimonial.id}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={shouldMarquee 
              ? "glass-card rounded-2xl p-7 flex flex-col shrink-0 w-[340px] sm:w-[360px] lg:w-[380px]"
              : "glass-card rounded-2xl p-7 flex flex-col"
            }
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, star) => (
                <Star
                  key={star}
                  size={16}
                  className={
                    testimonial.rating && star < testimonial.rating
                      ? "fill-foreground/60 text-foreground/60"
                      : "text-foreground/15"
                  }
                />
              ))}
            </div>
            <blockquote className="flex-1 text-foreground/80 text-sm leading-relaxed mb-6">
              "{testimonial.content}"
            </blockquote>
            <footer className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                <Quote size={14} className="text-foreground/30" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{testimonial.name}</p>
                <p className="text-xs text-foreground/40">
                  {testimonial.role && testimonial.company
                    ? `${testimonial.role} · ${testimonial.company}`
                    : testimonial.role || testimonial.company || ""}
                </p>
              </div>
            </footer>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;