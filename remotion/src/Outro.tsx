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

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const v = height > width;

  const logoS = spring({ frame, fps, config: { damping: 18, stiffness: 100, mass: 1 } });
  const ring = interpolate(frame, [6, 70], [0.65, 1.4], { extrapolateRight: "clamp" });
  const ringOp = interpolate(frame, [6, 70], [0.35, 0], { extrapolateRight: "clamp" });
  const ctaGlow = 0.45 + Math.sin(frame * 0.07) * 0.25;
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });

  const logoSize = v ? 200 : 176;

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <AbsoluteFill
        style={{
          fontFamily,
          alignItems: "center",
          justifyContent: "center",
          padding: v ? "0 80px" : "0 120px",
          opacity: out,
        }}
      >
        <div style={{ position: "relative", transform: breathe(frame, 5, 0.025) }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1px solid ${C.fg}`,
              transform: `scale(${ring})`,
              opacity: ringOp,
            }}
          />
          <div
            style={{
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize * 0.22,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              opacity: interpolate(logoS, [0, 1], [0, 1]),
              transform: `scale(${interpolate(logoS, [0, 1], [0.82, 1])})`,
              filter: `blur(${interpolate(logoS, [0, 0.6, 1], [14, 2, 0])}px)`,
            }}
          >
            <Img
              src={staticFile("images/isologo-2026.png")}
              alt="Sigma Tecnologías"
              style={{
                width: logoSize * 0.78,
                height: logoSize * 0.78,
                objectFit: "contain",
              }}
            />
          </div>

        </div>

        <div
          style={{
            ...rise(frame, fps, 12),
            marginTop: 34,
            fontSize: v ? 72 : 82,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: C.fg,
            textAlign: "center",
          }}
        >
          Sigma <span style={{ color: C.muted, fontWeight: 800 }}>Tecnologías</span>
        </div>

        <div
          style={{
            ...rise(frame, fps, 22),
            marginTop: 14,
            fontSize: v ? 28 : 27,
            color: C.muted,
            letterSpacing: "0.06em",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          No prometemos, construimos.
        </div>

        <div style={{ ...rise(frame, fps, 36, 30), marginTop: v ? 56 : 50 }}>
          <div
            style={{
              padding: v ? "26px 46px" : "24px 52px",
              borderRadius: 999,
              background: C.fg,
              color: C.bg,
              fontSize: v ? 32 : 31,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              boxShadow: `0 0 ${40 + ctaGlow * 60}px rgba(244,245,246,${ctaGlow * 0.3})`,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            Agendá una reunión ahora
            <span style={{ transform: `translateX(${Math.sin(frame * 0.09) * 4}px)` }}>→</span>
          </div>
        </div>

        <div
          style={{
            ...rise(frame, fps, 50),
            marginTop: 28,
            fontSize: v ? 26 : 24,
            color: C.muted,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          sigmatecnologiasarg.com
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};
