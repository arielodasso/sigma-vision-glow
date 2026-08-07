import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, fontFamily } from "../theme";
import { heroPop, rise, breathe } from "../components/motion";

export const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;

  const bar = interpolate(frame, [4, 30], [0, 1], { extrapolateRight: "clamp" });
  const push = interpolate(frame, [0, 100], [0, -18]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "230px 90px 90px" : "0 150px",
      }}
    >
      <div style={{ transform: `translateY(${push}px)`, maxWidth: v ? "100%" : "72%" }}>
        <div
          style={{
            ...rise(frame, fps, 2),
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: v ? 34 : 28,
          }}
        >
          <div
            style={{
              width: interpolate(bar, [0, 1], [0, v ? 70 : 96]),
              height: 3,
              background: C.muted,
            }}
          />
          <span
            style={{
              color: C.muted,
              letterSpacing: "0.34em",
              fontSize: v ? 20 : 20,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Sigma Tecnologías
          </span>
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: v ? 100 : 134,
            whiteSpace: "nowrap",
            lineHeight: 0.98,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            color: C.fg,
          }}
        >
          <div style={heroPop(frame, fps, 6)}>Menos promesas.</div>
          <div
            style={{
              ...heroPop(frame, fps, 20),
              color: "transparent",
              backgroundImage: `linear-gradient(100deg, ${C.fg} 20%, ${C.muted} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
            }}
          >
            Más soluciones.
          </div>
        </h1>

        <p
          style={{
            ...rise(frame, fps, 44),
            marginTop: v ? 40 : 42,
            fontSize: v ? 32 : 32,
            lineHeight: 1.5,
            color: C.muted,
            maxWidth: v ? "100%" : 780,
            fontWeight: 500,
          }}
        >
          Software a medida, automatizaciones y productos propios con IA.
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          right: v ? 70 : 130,
          bottom: v ? 180 : 120,
          transform: breathe(frame, 6, 0.03),
          opacity: 0.9,
        }}
      >
        <div
          style={{
            width: v ? 130 : 170,
            height: v ? 130 : 170,
            borderRadius: "50%",
            border: `1px solid ${C.line2}`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
