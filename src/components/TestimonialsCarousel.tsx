"use client";

import { Star, Quote } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number | null;
  sort_order: number;
  image_url: string | null;
}

interface Props {
  testimonials: Testimonial[];
  speed?: number; // seconds for one full loop
}

const TestimonialsCarousel = ({ testimonials, speed = 50 }: Props) => {
  const [isMobile, setIsMobile] = useState(false);
  const shouldMarquee = testimonials.length > 3;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", slidesToScroll: 1 });
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  useEffect(() => {
    if (!emblaApi) return;
    const onInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onInit();
    emblaApi.on("init", onInit);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    return () => {
      emblaApi.off("init", onInit);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi]);

  // Mobile carousel (embla) for >3 items
  if (isMobile && shouldMarquee) {


    return (
      <div className="relative w-full py-4">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-6" style={{ minWidth: "100%" }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 px-3">
                <div className="glass-card rounded-2xl p-7 flex flex-col h-full">
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
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-foreground/[0.04] border border-foreground/[0.06] flex items-center justify-center">
                        <Quote size={14} className="text-foreground/30" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-foreground/40">
                        {testimonial.role && testimonial.company
                          ? `${testimonial.role} · ${testimonial.company}`
                          : testimonial.role || testimonial.company || ""}
                      </p>
                    </div>
                  </footer>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollPrev}
            disabled={selectedIndex === 0 && !emblaApi?.canScrollPrev()}
            aria-label="Testimonial anterior"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1" role="tablist" aria-label="Testimonios">
            {scrollSnaps.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Ir al testimonio ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === selectedIndex
                    ? "bg-sigma-yellow"
                    : "bg-foreground/20 hover:bg-foreground/40"
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm"
            onClick={scrollNext}
            disabled={selectedIndex === scrollSnaps.length - 1 && !emblaApi?.canScrollNext()}
            aria-label="Testimonial siguiente"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Desktop: ≤3 = grid, >3 = marquee
  if (shouldMarquee) {
    const loop = [...testimonials, ...testimonials];

    return (
      <div className="relative w-full overflow-hidden py-4">
        <div
          className="flex gap-6 w-max animate-clients-marquee hover:[animation-play-state:paused]"
          style={{
            animationDuration: `${speed}s`,
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          {loop.map((testimonial, i) => (
            <motion.div
              key={`${testimonial.id}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-7 flex flex-col shrink-0 w-[340px] sm:w-[360px] lg:w-[380px]"
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
  }

  // ≤3 items: responsive grid (1 col mobile, 2 col sm, 3 col lg)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full py-4">
      {testimonials.map((testimonial, i) => (
        <motion.div
          key={testimonial.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="glass-card rounded-2xl p-7 flex flex-col h-full"
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
  );
};

export default TestimonialsCarousel;