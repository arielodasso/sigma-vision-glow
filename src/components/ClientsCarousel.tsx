import { ExternalLink } from "lucide-react";

export type ClientLogo = {
  name: string;
  url?: string;
  logo?: string; // imported asset URL
};

interface Props {
  clients: ClientLogo[];
  speed?: number; // seconds for one full loop
}

const ClientsCarousel = ({ clients, speed = 35 }: Props) => {
  // Duplicate the list for a seamless infinite marquee
  const loop = [...clients, ...clients];

  return (
    <div
      className="relative w-full overflow-hidden py-4"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div
        className="flex gap-5 w-max animate-clients-marquee hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {loop.map((c, i) => {
          const inner = (
            <div className="h-24 w-44 sm:w-48 shrink-0 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.02] hover:border-foreground/[0.14] hover:bg-foreground/[0.04] transition-all duration-300 flex items-center justify-center px-6 relative group">
              {c.logo ? (
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="max-h-12 max-w-full object-contain opacity-60 group-hover:opacity-100 transition-opacity duration-300 [filter:grayscale(100%)] group-hover:[filter:grayscale(0%)]"
                />
              ) : (
                <span className="text-foreground/60 font-medium text-sm tracking-wide text-center group-hover:text-foreground transition-colors">
                  {c.name}
                </span>
              )}
              {c.url && (
                <ExternalLink
                  size={12}
                  className="absolute top-2 right-2 text-foreground/15 group-hover:text-foreground/50 transition-colors"
                />
              )}
            </div>
          );
          return c.url ? (
            <a
              key={`${c.name}-${i}`}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={c.name}
            >
              {inner}
            </a>
          ) : (
            <div key={`${c.name}-${i}`}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientsCarousel;
