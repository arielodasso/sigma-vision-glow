import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MobileCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
  autoScroll?: boolean;
  autoScrollSpeed?: number; // seconds for full loop
}

export const MobileCarousel = <T,>({
  items,
  renderItem,
  className = "",
  itemClassName = "",
  autoScroll = false,
  autoScrollSpeed = 40,
}: MobileCarouselProps<T>) => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoScroll || !trackRef.current) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const track = trackRef.current;
    let animationId: number;
    let lastTime: number | null = null;
    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;

    const pause = () => {
      paused = true;
      lastTime = null;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 4000);
    };

    const animate = (time: number) => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (!paused && maxScroll > 0) {
        if (lastTime === null) lastTime = time;
        const elapsed = (time - lastTime) / 1000;
        lastTime = time;
        const speed = maxScroll / autoScrollSpeed; // px per second
        const next = track.scrollLeft + elapsed * speed;
        track.scrollLeft = next >= maxScroll - 0.5 ? 0 : next;
      }
      animationId = requestAnimationFrame(animate);
    };

    track.addEventListener("pointerdown", pause);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("wheel", pause, { passive: true });

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("wheel", pause);
    };
  }, [autoScroll, autoScrollSpeed, items.length]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 lg:hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className={`flex-shrink-0 snap-center w-[85%] sm:w-[90%] lg:w-auto carousel-item ${itemClassName}`}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </div>
      <div className="hidden lg:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileCarousel;