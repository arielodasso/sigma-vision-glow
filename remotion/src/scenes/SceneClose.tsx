import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C, fontFamily } from "../theme";
import { rise, breathe } from "../components/motion";

export const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;

  const logoS = spring({ frame, fps, config: { damping: 18, stiffness: 100, mass: 1 } });
  const ring = interpolate(frame, [10, 70], [0.6, 1.35], { extrapolateRight: "clamp" });
  const ringOp = interpolate(frame, [10, 70], [0.35, 0], { extrapolateRight: "clamp" });
  const ctaGlow = 0.45 + Math.sin(frame * 0.07) * 0.25;

  const logoSize = v ? 190 : 170;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: v ? "0 70px" : "0 120px",
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
        <Img
          src={staticFile("images/isologo.png")}
          alt="Sigma Tecnologías"
          style={{
            width: logoSize,
            height: logoSize,
            objectFit: "contain",
            opacity: interpolate(logoS, [0, 1], [0, 1]),
            transform: `scale(${interpolate(logoS, [0, 1], [0.82, 1])})`,
            filter: `blur(${interpolate(logoS, [0, 0.6, 1], [14, 2, 0])}px)`,
          }}
        />
      </div>

      <div
        style={{
          ...rise(frame, fps, 16),
          marginTop: 34,
          fontSize: v ? 68 : 78,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: C.fg,
          textAlign: "center",
        }}
      >
        Sigma Tecnologías
      </div>

      <div
        style={{
          ...rise(frame, fps, 26),
          marginTop: 14,
          fontSize: v ? 27 : 27,
          color: C.muted,
          letterSpacing: "0.06em",
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        No prometemos, construimos.
      </div>

      <div
        style={{
          ...rise(frame, fps, 44, 30),
          marginTop: v ? 58 : 54,
        }}
      >
        <div
          style={{
            padding: v ? "26px 46px" : "26px 54px",
            borderRadius: 999,
            background: C.fg,
            color: C.bg,
            fontSize: v ? 32 : 32,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            boxShadow: `0 0 ${40 + ctaGlow * 60}px rgba(244,245,246,${ctaGlow * 0.35})`,
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
          ...rise(frame, fps, 60),
          marginTop: 30,
          fontSize: v ? 26 : 25,
          color: C.muted,
          fontWeight: 600,
          letterSpacing: "0.04em",
        }}
      >
        sigmatecnologiasarg.com
      </div>
    </AbsoluteFill>
  );
};
