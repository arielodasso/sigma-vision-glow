import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C, fontFamily } from "../theme";
import { rise } from "../components/motion";
import { LogoCard } from "../components/LogoCard";

const clients: { f: string; n: string; t: "light" | "dark" }[] = [
  { f: "faztred.png", n: "Faztred", t: "dark" },
  { f: "offmarket.png", n: "OffMarket", t: "dark" },
  { f: "justa.png", n: "Justa", t: "light" },
  { f: "unidos-para-amar.png", n: "Unidos Para Amar", t: "light" },
  { f: "geonosis.png", n: "Geonosis", t: "light" },
  { f: "cristian-schauvinhold.png", n: "Cristian Schauvinhold", t: "light" },
  { f: "estamos-unidos.png", n: "Estamos Unidos", t: "dark" },
  { f: "calisthenia-online.png", n: "Calisthenia Online", t: "light" },
  { f: "peris-electricidad.png", n: "Peris Electricidad", t: "light" },
  { f: "mobihunter.png", n: "Mobihunter", t: "dark" },
];

const platforms = [
  {
    f: "iceberg.svg",
    n: "Iceberg",
    d: "Procesa archivos y Google Sheets para generar visualizaciones estructuradas.",
  },
  {
    f: "viaja-seguro-marruecos.png",
    n: "Viaja Seguro a Marruecos",
    d: "Gestión de tours y contenido desde un panel de administración propio.",
  },
  {
    f: "sigma-trend-engine.png",
    n: "Sigma Trend Engine",
    d: "Detecta tendencias emergentes y genera documentos estratégicos con IA.",
  },
];

export const SceneCases: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;

  const cardW = v ? 210 : 230;
  const gap = v ? 20 : 24;
  const step = cardW + gap;
  const loopW = step * clients.length;
  const marquee = -((frame * (v ? 1.6 : 2.0)) % loopW);
  const row = [...clients, ...clients];

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "230px 70px 90px" : "0 130px",
      }}
    >
      <div>
        <h2
          style={{
            ...rise(frame, fps, 0),
            margin: 0,
            fontSize: v ? 64 : 84,
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
        <p
          style={{
            ...rise(frame, fps, 8),
            color: C.muted,
            fontSize: v ? 26 : 27,
            marginTop: 14,
            fontWeight: 500,
          }}
        >
          Casos reales en producción, no mockups.
        </p>

        {/* client logo marquee */}
        <div
          style={{
            ...rise(frame, fps, 18, 36),
            marginTop: v ? 44 : 46,
            overflow: "hidden",
            maskImage: "linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent 0%, black 7%, black 93%, transparent 100%)",
          }}
        >
          <div style={{ display: "flex", gap, transform: `translateX(${marquee}px)`, width: "max-content" }}>
            {row.map((c, i) => (
              <LogoCard
                key={`${c.f}-${i}`}
                file={c.f}
                name={c.n}
                theme={c.t}
                w={cardW}
                h={v ? 108 : 118}
                logoMax={v ? 56 : 62}
              />
            ))}
          </div>
        </div>

        {/* platform cards */}
        <div
          style={{
            marginTop: v ? 40 : 44,
            display: "grid",
            gridTemplateColumns: v ? "1fr" : "1fr 1fr 1fr",
            gap: v ? 18 : 26,
          }}
        >
          {platforms.map((p, i) => (
            <div
              key={p.n}
              style={{
                ...rise(frame, fps, 34 + i * 12, 40),
                display: "flex",
                flexDirection: v ? "row" : "column",
                alignItems: v ? "center" : "flex-start",
                gap: v ? 22 : 18,
                padding: v ? "20px 24px" : "26px 28px",
                borderRadius: 22,
                border: `1px solid ${C.line}`,
                background: "linear-gradient(140deg, rgba(255,255,255,0.045), rgba(255,255,255,0.012))",
              }}
            >
              <LogoCard
                file={p.f}
                name={p.n}
                theme="dark"
                w={v ? 150 : 172}
                h={v ? 74 : 82}
                logoMax={v ? 52 : 58}
                style={{ background: "rgba(244,245,246,0.06)" }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: C.fg,
                    fontSize: v ? 30 : 30,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {p.n}
                </div>
                <div
                  style={{
                    color: C.muted,
                    fontSize: v ? 22 : 22,
                    lineHeight: 1.4,
                    fontWeight: 500,
                    marginTop: 6,
                  }}
                >
                  {p.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
