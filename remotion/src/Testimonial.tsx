import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Series,
} from "remotion";
import { C, fontFamily } from "./theme";
import { PersistentBackground, Vignette } from "./components/Layers";
import { rise, breathe } from "./components/motion";

const QUOTES = [
  "En Faztred Soluciones quedamos muy conformes con el trabajo realizado por Sigma Tecnologías. Desde el primer momento entendieron bien lo que buscábamos y pudieron plasmarlo en una web mucho más profesional y orientada a generar consultas reales.",
  "Destaco principalmente la buena predisposición, la rapidez para implementar cambios y el acompañamiento durante todo el proceso. Además, se ocuparon de aspectos importantes como la estructura de las páginas, SEO, conversiones y vinculación con Google Ads, algo que para nosotros era fundamental.",
  "Sin dudas los recomendaría a cualquier empresa que necesite mejorar su presencia online y generar nuevas oportunidades comerciales.",
];

const HIGHLIGHT = [
  ["Sigma", "Tecnologías.", "profesional", "consultas", "reales."],
  ["predisposición,", "rapidez", "SEO,", "conversiones", "Google", "Ads,"],
  ["recomendaría", "presencia", "online", "oportunidades", "comerciales."],
];

/* ---------- shared bits ---------- */

/** Wraps a scene with its own fade in / fade out so scenes never overlap. */
const SceneShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity =
    interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [durationInFrames - 14, durationInFrames - 2], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const FaztredPlate: React.FC<{ size: number; delay?: number; animated?: boolean }> = ({
  size,
  delay = 0,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = animated
    ? spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } })
    : 1;
  return (
    <div
      style={{
        width: size,
        height: size * 0.4,
        borderRadius: size * 0.09,
        background: "#FFFFFF",
        border: "1px solid rgba(255,255,255,0.9)",
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
        src={staticFile("images/faztred.png")}
        alt="Faztred Industrial Solutions"
        style={{ maxWidth: "84%", maxHeight: "78%", objectFit: "contain" }}
      />
    </div>
  );
};

const Stars: React.FC<{ delay?: number; size?: number }> = ({ delay = 0, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", gap: size * 0.28 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const s = spring({
          frame: frame - delay - i * 4,
          fps,
          config: { damping: 12, stiffness: 180 },
        });
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              lineHeight: 1,
              color: C.fg,
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${interpolate(
                s,
                [0, 1],
                [-35, 0],
              )}deg)`,
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const WordQuote: React.FC<{
  text: string;
  highlight: string[];
  fontSize: number;
  delay?: number;
  step?: number;
}> = ({ text, highlight, fontSize, delay = 0, step = 2.4 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontSize,
        lineHeight: 1.38,
        fontWeight: 600,
        letterSpacing: "-0.015em",
        color: C.dim,
        display: "flex",
        flexWrap: "wrap",
        gap: `${fontSize * 0.16}px ${fontSize * 0.3}px`,
      }}
    >
      {words.map((w, i) => {
        const t = frame - delay - i * step;
        const o = interpolate(t, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isHi = highlight.includes(w.replace(/[«»"]/g, ""));
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(o, [0, 1], [0.06, 1]),
              color: isHi ? C.fg : C.muted,
              filter: `blur(${interpolate(o, [0, 1], [7, 0])}px)`,
              transform: `translateY(${interpolate(o, [0, 1], [10, 0])}px)`,
              display: "inline-block",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- scenes ---------- */

const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const line = interpolate(frame, [10, 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: v ? "0 90px" : "0 160px",
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
        <FaztredPlate size={v ? 400 : 360} delay={16} />
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
          fontSize: v ? 40 : 38,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: C.fg,
          textAlign: "center",
        }}
      >
        Un cliente. Un resultado real.
      </div>
      <div style={{ ...rise(frame, fps, 54), marginTop: 22 }}>
        <Stars delay={56} size={v ? 34 : 30} />
      </div>
    </AbsoluteFill>
  );
};

const QuoteScene: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const text = QUOTES[index];
  const fontSize = v ? (index === 2 ? 44 : 39) : index === 2 ? 46 : 40;

  const barW = interpolate(frame, [10, 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "0 92px" : "0 190px",
      }}
    >
      <div style={{ transform: `translateY(${interpolate(frame, [0, 200], [8, -12])}px)` }}>
        {/* Faztred logo present in every frame */}
        <div style={{ marginBottom: v ? 30 : 26 }}>
          <FaztredPlate size={v ? 300 : 260} delay={0} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            ...rise(frame, fps, 8, 20),
          }}
        >
          <div style={{ height: 2, width: 54 * barW, background: C.fg, opacity: 0.6 }} />
          <span
            style={{
              fontSize: v ? 21 : 20,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: C.dim,
              fontWeight: 600,
            }}
          >
            Faztred Industrial Solutions
          </span>
        </div>

        <div
          style={{
            marginTop: v ? 30 : 26,
            fontSize: v ? 96 : 92,
            lineHeight: 0.6,
            color: C.line2,
            fontWeight: 800,
            opacity: interpolate(frame, [10, 32], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          “
        </div>

        <div style={{ marginTop: v ? 30 : 26 }}>
          <WordQuote
            text={text}
            highlight={HIGHLIGHT[index]}
            fontSize={fontSize}
            delay={20}
            step={2.1}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: v ? 130 : 84,
          left: v ? 92 : 190,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: i === index ? 46 : 12,
              height: 4,
              borderRadius: 4,
              background: i === index ? C.fg : C.line2,
              opacity: i === index ? 0.85 : 1,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Shot: React.FC<{ file: string; delay: number; w: number; tilt: number }> = ({
  file,
  delay,
  w,
  tilt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 90 } });
  const drift = Math.sin((frame - delay) * 0.03) * 6;
  return (
    <div
      style={{
        width: w,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${C.line2}`,
        boxShadow: "0 30px 90px rgba(0,0,0,0.6)",
        opacity: interpolate(s, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(s, [0, 1], [60, drift])}px) scale(${interpolate(
          s,
          [0, 1],
          [0.92, 1],
        )}) rotate(${tilt}deg)`,
        filter: `blur(${interpolate(s, [0, 0.6, 1], [14, 2, 0])}px)`,
      }}
    >
      <Img src={staticFile(`images/${file}`)} alt="faztred.com.ar" style={{ width: "100%", display: "block" }} />
    </div>
  );
};

const SceneWeb: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: v ? "0 80px" : "0 130px",
        gap: v ? 40 : 34,
      }}
    >
      <div
        style={{
          ...rise(frame, fps, 0, 22),
          fontSize: v ? 44 : 46,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: C.fg,
          textAlign: "center",
        }}
      >
        El resultado: <span style={{ color: C.muted }}>faztred.com.ar</span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: v ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: v ? 36 : 44,
        }}
      >
        <Shot file="faztred-web-1.png" delay={8} w={v ? 880 : 780} tilt={v ? 0 : -1.2} />
        <Shot file="faztred-web-3.png" delay={22} w={v ? 760 : 640} tilt={v ? 0 : 1.4} />
      </div>

      <div
        style={{
          ...rise(frame, fps, 34),
          fontSize: v ? 26 : 25,
          color: C.muted,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textAlign: "center",
        }}
      >
        Sitio, SEO, conversiones y Google Ads
      </div>
    </AbsoluteFill>
  );
};

const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const v = height > width;
  const glow = 0.4 + Math.sin(frame * 0.07) * 0.22;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: v ? "0 90px" : "0 140px",
      }}
    >
      <div
        style={{
          transform: breathe(frame, 4, 0.022),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: v ? 176 : 156,
            height: v ? 176 : 156,
            borderRadius: 36,
            background: "#ffffff",
            boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...rise(frame, fps, 0, 26),
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
            ...rise(frame, fps, 10),
            marginTop: 30,
            fontSize: v ? 66 : 72,
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
            ...rise(frame, fps, 20),
            marginTop: 14,
            fontSize: v ? 27 : 26,
            color: C.muted,
            letterSpacing: "0.06em",
            fontWeight: 500,
          }}
        >
          Menos promesas. Más soluciones.
        </div>

        <div style={{ ...rise(frame, fps, 30), marginTop: v ? 48 : 42 }}>
          <div
            style={{
              padding: v ? "24px 44px" : "22px 48px",
              borderRadius: 999,
              background: C.fg,
              color: C.bg,
              fontSize: v ? 30 : 29,
              fontWeight: 700,
              boxShadow: `0 0 ${40 + glow * 60}px rgba(244,245,246,${glow * 0.28})`,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            Agendá una reunión
            <span style={{ transform: `translateX(${Math.sin(frame * 0.09) * 4}px)` }}>→</span>
          </div>
        </div>

        <div
          style={{
            ...rise(frame, fps, 44),
            marginTop: 26,
            fontSize: v ? 25 : 24,
            color: C.muted,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          sigmatecnologiasarg.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- root ---------- */

const D = [95, 215, 225, 175, 150, 165];
export const TESTIMONIAL_TOTAL = D.reduce((a, b) => a + b, 0);

export const Testimonial: React.FC = () => (
  <AbsoluteFill>
    <PersistentBackground />
    <Series>
      <Series.Sequence durationInFrames={D[0]}>
        <SceneShell>
          <SceneOpen />
        </SceneShell>
      </Series.Sequence>
      <Series.Sequence durationInFrames={D[1]}>
        <SceneShell>
          <QuoteScene index={0} />
        </SceneShell>
      </Series.Sequence>
      <Series.Sequence durationInFrames={D[2]}>
        <SceneShell>
          <QuoteScene index={1} />
        </SceneShell>
      </Series.Sequence>
      <Series.Sequence durationInFrames={D[3]}>
        <SceneShell>
          <QuoteScene index={2} />
        </SceneShell>
      </Series.Sequence>
      <Series.Sequence durationInFrames={D[4]}>
        <SceneShell>
          <SceneWeb />
        </SceneShell>
      </Series.Sequence>
      <Series.Sequence durationInFrames={D[5]}>
        <SceneShell>
          <SceneClose />
        </SceneShell>
      </Series.Sequence>
    </Series>
    <Vignette />
  </AbsoluteFill>
);
