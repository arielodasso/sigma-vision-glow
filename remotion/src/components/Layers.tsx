import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../theme";

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
      {/* accent glows */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(30% 24% at ${18 + p * 12}% ${80 - p * 25}%, rgba(226,252,3,0.055) 0%, transparent 70%),
                       radial-gradient(34% 26% at ${82 - p * 14}% ${22 + p * 30}%, rgba(76,122,255,0.075) 0%, transparent 70%)`,
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
