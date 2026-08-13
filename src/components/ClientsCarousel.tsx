import { ExternalLink } from "lucide-react";

export type ClientLogo = {
  name: string;
  url?: string;
  logo?: string; // imported asset URL
  theme?: "light" | "dark" | "gray"; // card background for contrast
};

interface Props {
  clients: ClientLogo[];
  speed?: number; // seconds for one full loop
}

const ClientsCarousel = ({ clients, speed = 40 }: Props) => {
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
          const cardClass =
            c.theme === "dark"
              ? "bg-foreground/[0.04] border-foreground/[0.08] hover:border-foreground/[0.18] hover:bg-foreground/[0.06]"
              : c.theme === "gray"
              ? "bg-neutral-400 border-neutral-300 hover:border-neutral-200"
              : "bg-white border-white/80 hover:border-white";
          const isDark = c.theme === "dark";
          const inner = (
            <div
              className={`h-24 w-44 sm:w-48 shrink-0 rounded-2xl border transition-all duration-300 flex items-center justify-center px-6 relative group ${cardClass}`}
            >
              {c.logo ? (
                <img
                          loading="lazy"
                          decoding="async"
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  className="max-h-12 max-w-full object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                />
              ) : (
                <span
                  className={`font-medium text-sm tracking-wide text-center transition-colors ${
                    isDark
                      ? "text-foreground/60 group-hover:text-foreground"
                      : "text-neutral-700 group-hover:text-neutral-900"
                  }`}
                >
                  {c.name}
                </span>
              )}
              {c.url && (
                <ExternalLink
                  size={12}
                  className={`absolute top-2 right-2 transition-colors ${
                    isDark
                      ? "text-foreground/20 group-hover:text-foreground/60"
                      : "text-neutral-400 group-hover:text-neutral-700"
                  }`}
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
