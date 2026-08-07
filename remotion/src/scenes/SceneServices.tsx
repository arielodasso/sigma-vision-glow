import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Sequence } from "remotion";
import { C, fontFamily } from "../theme";
import { rise } from "../components/motion";

const items = [
  { n: "01", t: "Desarrollo web a medida", d: "Sitios y plataformas para comunicar y captar clientes." },
  { n: "02", t: "Automatización de procesos", d: "Menos tareas manuales, menos errores, más eficiencia." },
  { n: "03", t: "SaaS a medida", d: "Productos escalables diseñados desde cero." },
  { n: "04", t: "Software y plataformas", d: "Backend, paneles de administración y datos." },
];

export const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const drift = interpolate(frame, [0, 190], [12, -26]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "230px 80px 90px" : "0 130px",
      }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        <h2
          style={{
            ...rise(frame, fps, 0),
            margin: 0,
            fontSize: v ? 74 : 92,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: C.fg,
            lineHeight: 1.02,
          }}
        >
          Soluciones que
          <br />
          construimos.
        </h2>

        <div
          style={{
            marginTop: v ? 56 : 62,
            display: "grid",
            gridTemplateColumns: v ? "1fr" : "1fr 1fr",
            gap: v ? 26 : 34,
          }}
        >
          {items.map((it, i) => (
            <Sequence key={it.n} from={0} layout="none">
              <div
                style={{
                  ...rise(frame, fps, 14 + i * 9, 34),
                  borderTop: `1px solid ${C.line}`,
                  paddingTop: v ? 22 : 26,
                  display: "flex",
                  gap: v ? 22 : 26,
                }}
              >
                <span
                  style={{
                    color: C.dim,
                    fontSize: v ? 22 : 22,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    paddingTop: 6,
                  }}
                >
                  {it.n}
                </span>
                <div>
                  <div
                    style={{
                      color: C.fg,
                      fontSize: v ? 38 : 40,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {it.t}
                  </div>
                  <div
                    style={{
                      color: C.muted,
                      fontSize: v ? 27 : 26,
                      marginTop: 10,
                      lineHeight: 1.45,
                      fontWeight: 500,
                    }}
                  >
                    {it.d}
                  </div>
                </div>
              </div>
            </Sequence>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
