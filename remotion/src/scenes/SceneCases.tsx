import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, fontFamily } from "../theme";
import { rise } from "../components/motion";

const cases = [
  {
    tag: "Plataforma de datos",
    name: "Iceberg",
    d: "Procesa archivos y lee Google Sheets para generar gráficos y visualizaciones estructuradas.",
    color: C.blue,
  },
  {
    tag: "Plataforma + panel",
    name: "Viaja Seguro a Marruecos",
    d: "Gestión de tours y contenido estructurado desde un panel de administración propio.",
    color: C.fg,
  },
  {
    tag: "Automatización con IA",
    name: "Sigma Trend Engine",
    d: "Detecta tendencias emergentes en redes y genera documentos estratégicos para agencias.",
    color: C.yellow,
  },
];

export const SceneCases: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const drift = interpolate(frame, [0, 190], [16, -30]);

  return (
    <AbsoluteFill
      style={{ fontFamily, justifyContent: "center", padding: v ? "0 80px" : "0 130px" }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        <div
          style={{
            ...rise(frame, fps, 0),
            color: C.muted,
            fontSize: 20,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Casos reales en producción
        </div>
        <h2
          style={{
            ...rise(frame, fps, 6),
            margin: 0,
            fontSize: v ? 70 : 88,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: C.fg,
            lineHeight: 1.03,
          }}
        >
          Sistemas que ya
          <br />
          están operando.
        </h2>

        <div style={{ marginTop: v ? 54 : 58, display: "grid", gap: v ? 26 : 22 }}>
          {cases.map((c, i) => (
            <div
              key={c.name}
              style={{
                ...rise(frame, fps, 22 + i * 14, 40),
                display: "flex",
                alignItems: v ? "flex-start" : "center",
                flexDirection: v ? "column" : "row",
                gap: v ? 12 : 34,
                padding: v ? "26px 28px" : "26px 34px",
                borderRadius: 20,
                border: `1px solid ${C.line}`,
                background: "linear-gradient(120deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
              }}
            >
              <div style={{ minWidth: v ? 0 : 430 }}>
                <div
                  style={{
                    color: c.color,
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  {c.tag}
                </div>
                <div
                  style={{
                    color: C.fg,
                    fontSize: v ? 40 : 42,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    marginTop: 6,
                  }}
                >
                  {c.name}
                </div>
              </div>
              <div
                style={{
                  color: C.muted,
                  fontSize: v ? 26 : 26,
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}
              >
                {c.d}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            ...rise(frame, fps, 70),
            marginTop: v ? 40 : 36,
            color: C.muted,
            fontSize: v ? 25 : 25,
            fontWeight: 500,
          }}
        >
          + sitios y plataformas para Justa, OffMarket, Geonosis, Faztred y más.
        </div>
      </div>
    </AbsoluteFill>
  );
};
