import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, fontFamily } from "../theme";

export const PersistentBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;
  const drift = interpolate(p, [0, 1], [0, -60]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 80% at 20% ${18 + p * 20}%, #17181B 0%, ${C.bg} 60%)`,
        }}
      />
      {/* grid */}
      <AbsoluteFill
        style={{
          transform: `translateY(${drift}px)`,
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "140px 140px",
          opacity: 0.35,
          maskImage: "radial-gradient(80% 70% at 50% 45%, black 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 50% 45%, black 0%, transparent 100%)",
        }}
      />
      {/* neutral light drift */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(32% 26% at ${18 + p * 12}% ${80 - p * 25}%, rgba(244,245,246,0.05) 0%, transparent 70%),
                       radial-gradient(36% 28% at ${82 - p * 14}% ${22 + p * 30}%, rgba(244,245,246,0.045) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.45) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: "radial-gradient(120% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)",
    }}
  />
);

/** Horizontal lockup: isologo + wordmark. Used as a persistent header in vertical. */
export const Lockup: React.FC<{ size?: number }> = ({ size = 54 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, fontFamily }}>
    <Img
      src={staticFile("images/isologo.png")}
      alt="Sigma Tecnologías"
      style={{ width: size, height: size, objectFit: "contain" }}
    />
    <span
      style={{
        fontSize: size * 0.6,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: C.fg,
        whiteSpace: "nowrap",
      }}
    >
      Sigma <span style={{ color: C.muted, fontWeight: 600 }}>Tecnologías</span>
    </span>
  </div>
);

/** Fixed top bar for the vertical composition. */
export const VerticalHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 92,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity,
        }}
      >
        <Lockup size={58} />
      </div>
    </AbsoluteFill>
  );
};
