import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectItem {
  name: string;
  description: string;
}

interface ProjectMeta {
  url?: string;
  logo: string;
  theme: "light" | "dark" | "gray";
  isologo?: boolean;
}

interface ProjectCardsCarouselProps {
  items: ProjectItem[];
  meta: Record<string, ProjectMeta>;
  label: string;
  automation?: boolean;
}

const ProjectCard = ({
  project,
  projectMeta,
  automation,
}: {
  project: ProjectItem;
  projectMeta?: ProjectMeta;
  automation?: boolean;
}) => {
  const isLink = Boolean(projectMeta?.url);
  const logoCardClass = projectMeta?.theme === "dark"
    ? "bg-foreground/[0.04] border-foreground/[0.08] group-hover:border-foreground/[0.18] group-hover:bg-foreground/[0.06]"
    : projectMeta?.theme === "gray"
      ? "bg-muted border-border group-hover:border-foreground/20"
      : "bg-foreground border-foreground/80";
  const logoClass = automation
    ? projectMeta?.isologo
      ? "h-8 w-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
      : "h-[150%] w-[150%] object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
    : "max-h-14 max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300";

  const content = (
    <>
      <div className="absolute left-0 top-[20%] bottom-[20%] w-[2px] bg-foreground/[0.06] rounded-full" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-7">
        {projectMeta?.logo && (
          <div className={cn("h-24 w-full sm:w-40 shrink-0 rounded-2xl border transition-all duration-300 flex items-center justify-center px-4 overflow-hidden", logoCardClass)}>
            <img loading="lazy" decoding="async" src={projectMeta.logo} alt={project.name} className={logoClass} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2 gap-3">
            <h4 className="font-display text-base sm:text-lg font-semibold text-foreground">{project.name}</h4>
            {isLink && <ExternalLink size={14} className="text-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0" />}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{project.description}</p>
        </div>
      </div>
    </>
  );

  const sharedClass = "block glass-card rounded-2xl p-6 sm:p-7 group relative h-full";
  return isLink ? (
    <a href={projectMeta?.url} target="_blank" rel="noopener noreferrer" className={sharedClass}>{content}</a>
  ) : (
    <div className={sharedClass}>{content}</div>
  );
};

const ProjectCardsCarousel = ({ items, meta, label, automation = false }: ProjectCardsCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true, slidesToScroll: 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const syncCarousel = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    syncCarousel();
    emblaApi.on("select", syncCarousel);
    emblaApi.on("reInit", syncCarousel);
    return () => {
      emblaApi.off("select", syncCarousel);
      emblaApi.off("reInit", syncCarousel);
    };
  }, [emblaApi, syncCarousel]);

  return (
    <>
      <div className="lg:hidden">
        <div ref={emblaRef} className="overflow-hidden -mx-1 px-1 touch-pan-y">
          <div className="flex gap-4">
            {items.map((project) => (
              <div key={project.name} className="flex-[0_0_92%] min-w-0">
                <ProjectCard project={project} projectMeta={meta[project.name]} automation={automation} />
              </div>
            ))}
          </div>
        </div>
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-muted/60 text-muted-foreground border-border" onClick={() => emblaApi?.scrollPrev()} aria-label={`${label}: anterior`}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1.5" role="tablist" aria-label={label}>
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={selectedIndex === index}
                  aria-label={`Ir a ${index + 1}`}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn("h-2 rounded-full bg-muted-foreground transition-[width,opacity]", selectedIndex === index ? "w-5 opacity-90" : "w-2 opacity-30")}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full bg-muted/60 text-muted-foreground border-border" onClick={() => emblaApi?.scrollNext()} aria-label={`${label}: siguiente`}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="hidden lg:block space-y-6">
        {items.map((project, index) => (
          <motion.div key={project.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <ProjectCard project={project} projectMeta={meta[project.name]} automation={automation} />
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default ProjectCardsCarousel;