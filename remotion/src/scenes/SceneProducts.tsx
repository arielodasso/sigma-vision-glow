import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { C, fontFamily } from "../theme";
import { rise, breathe } from "../components/motion";

const products = [
  {
    name: "Sigma Analytics",
    tagline: "Analítica de rendimiento para fútbol",
    color: C.yellow,
    logo: "sigma-analytics.png",
  },
  {
    name: "Sigma Trend Engine",
    tagline: "Motor de tendencias con IA",
    color: C.blue,
    logo: "sigma-trend-engine.png",
  },
];

export const SceneProducts: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const drift = interpolate(frame, [0, 130], [10, -20]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "230px 80px 90px" : "0 140px",
      }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        <h2
          style={{
            ...rise(frame, fps, 0),
            margin: 0,
            fontSize: v ? 66 : 88,
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
            fontSize: v ? 27 : 28,
            marginTop: 14,
            fontWeight: 500,
          }}
        >
          No solo desarrollamos para otros.
        </p>

        <div
          style={{
            marginTop: v ? 50 : 60,
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
              <Img
                src={staticFile(`images/${p.logo}`)}
                alt={p.name}
                style={{
                  transform: breathe(frame + i * 30, 4, 0.035),
                  width: 64,
                  height: 64,
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  color: C.fg,
                  fontSize: v ? 40 : 44,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  marginTop: 18,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  color: p.color,
                  fontSize: v ? 24 : 24,
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
