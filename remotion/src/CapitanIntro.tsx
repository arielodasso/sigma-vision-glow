import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, fontFamily } from "./theme";
import { PersistentBackground, Vignette } from "./components/Layers";
import { rise, breathe } from "./components/motion";

const CapitanPlate: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        width: size,
        height: size * 0.4,
        borderRadius: size * 0.09,
        background: "#0b0c0e",
        border: `1px solid ${C.line2}`,
        boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `scale(${interpolate(s, [0, 1], [0.88, 1])})`,
        filter: `blur(${interpolate(s, [0, 0.6, 1], [12, 2, 0])}px)`,
      }}
    >
      <Img
        src={staticFile("images/capitan-wordmark.png")}
        alt="Capitán Deportes"
        style={{ maxWidth: "82%", maxHeight: "62%", objectFit: "contain" }}
      />
    </div>
  );
};

export const CAPITAN_INTRO_TOTAL = 175;

export const CapitanIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const v = height > width;
  const line = interpolate(frame, [10, 46], [0, 1], { extrapolateRight: "clamp" });
  const fade =
    interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [durationInFrames - 16, durationInFrames - 2], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <AbsoluteFill
        style={{
          fontFamily,
          alignItems: "center",
          justifyContent: "center",
          padding: v ? "0 90px" : "0 160px",
          opacity: fade,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: v ? "column" : "row",
            alignItems: "center",
            gap: v ? 46 : 70,
            transform: breathe(frame, 5, 0.02),
          }}
        >
          <div
            style={{
              width: v ? 200 : 180,
              height: v ? 200 : 180,
              borderRadius: 40,
              background: "#ffffff",
              boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...rise(frame, fps, 2, 30),
            }}
          >
            <Img
              src={staticFile("images/isologo-2026.png")}
              alt="Sigma Tecnologías"
              style={{ width: "76%", height: "76%", objectFit: "contain" }}
            />
          </div>
          <div
            style={{
              fontSize: v ? 64 : 58,
              fontWeight: 400,
              color: C.dim,
              opacity: interpolate(frame, [14, 34], [0, 1], { extrapolateRight: "clamp" }),
            }}
          >
            ×
          </div>
          <CapitanPlate size={v ? 400 : 360} delay={16} />
        </div>

        <div
          style={{
            marginTop: v ? 74 : 60,
            height: 1,
            width: (v ? 560 : 720) * line,
            background: C.line2,
          }}
        />

        <div
          style={{
            ...rise(frame, fps, 40),
            marginTop: v ? 44 : 38,
            fontSize: v ? 44 : 42,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: C.fg,
            textAlign: "center",
            maxWidth: v ? 760 : 980,
            lineHeight: 1.2,
          }}
        >
          Listos para potenciar a{" "}
          <span style={{ color: C.muted }}>Capitán Deportes.</span>
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};
