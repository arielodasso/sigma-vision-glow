import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, fontFamily } from "../theme";
import { rise, breathe } from "../components/motion";

const products = [
  {
    name: "Sigma Analytics",
    tagline: "Analítica de rendimiento para fútbol",
    color: C.yellow,
    ink: "#0A0A0A",
  },
  {
    name: "Sigma Trend Engine",
    tagline: "Motor de tendencias con IA",
    color: C.blue,
    ink: "#FFFFFF",
  },
];

export const SceneProducts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const drift = interpolate(frame, [0, 130], [10, -20]);

  return (
    <AbsoluteFill
      style={{ fontFamily, justifyContent: "center", padding: v ? "0 80px" : "0 140px" }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        <h2
          style={{
            ...rise(frame, fps, 0),
            margin: 0,
            fontSize: v ? 70 : 88,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: C.fg,
          }}
        >
          Tecnología propia.
        </h2>
        <p
          style={{
            ...rise(frame, fps, 8),
            color: C.muted,
            fontSize: v ? 28 : 28,
            marginTop: 14,
            fontWeight: 500,
          }}
        >
          No solo desarrollamos para otros.
        </p>

        <div
          style={{
            marginTop: v ? 56 : 60,
            display: "grid",
            gridTemplateColumns: v ? "1fr" : "1fr 1fr",
            gap: v ? 28 : 36,
          }}
        >
          {products.map((p, i) => (
            <div
              key={p.name}
              style={{
                ...rise(frame, fps, 18 + i * 12, 46),
                padding: v ? "34px 32px" : "40px 38px",
                borderRadius: 24,
                border: `1px solid ${C.line}`,
                background: "linear-gradient(150deg, rgba(255,255,255,0.05), rgba(255,255,255,0.012))",
              }}
            >
              <div
                style={{
                  transform: breathe(frame + i * 30, 4, 0.035),
                  width: 62,
                  height: 62,
                  borderRadius: 16,
                  background: p.color,
                  color: p.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 34,
                  fontWeight: 700,
                }}
              >
                Σ
              </div>
              <div
                style={{
                  color: C.fg,
                  fontSize: v ? 42 : 44,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginTop: 22,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  color: p.color,
                  fontSize: v ? 25 : 24,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {p.tagline}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
