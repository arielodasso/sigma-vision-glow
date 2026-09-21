import { motion } from "framer-motion";

interface MobileCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
}

export const MobileCarousel = <T,>({
  items,
  renderItem,
  className = "",
  itemClassName = "",
}: MobileCarouselProps<T>) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 lg:hidden"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          .carousel-track::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className={`flex-shrink-0 snap-center w-[85%] sm:w-[90%] lg:w-auto ${itemClassName}`}
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