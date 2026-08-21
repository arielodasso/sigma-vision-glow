import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import {
  TransitionSeries,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
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

const FaztredPlate: React.FC<{ size: number; delay?: number }> = ({ size, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <div
      style={{
        width: size,
        height: size * 0.42,
        borderRadius: size * 0.09,
        background: "#DCDDE0",
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
        style={{ maxWidth: "86%", maxHeight: "72%", objectFit: "contain" }}
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
        lineHeight: 1.34,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        color: C.dim,
        display: "flex",
        flexWrap: "wrap",
        gap: `${fontSize * 0.14}px ${fontSize * 0.3}px`,
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
        <FaztredPlate size={v ? 380 : 340} delay={16} />
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
  const fontSize = v ? (index === 2 ? 54 : 48) : index === 2 ? 58 : 50;

  const barW = interpolate(frame, [4, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        padding: v ? "0 92px" : "0 190px",
      }}
    >
      <div style={{ transform: `translateY(${interpolate(frame, [0, 200], [10, -14])}px)` }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            ...rise(frame, fps, 0, 24),
          }}
        >
          <div style={{ height: 2, width: 54 * barW, background: C.fg, opacity: 0.6 }} />
          <span
            style={{
              fontSize: v ? 22 : 21,
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
            marginTop: v ? 46 : 40,
            fontSize: v ? 150 : 140,
            lineHeight: 0.6,
            color: C.line2,
            fontWeight: 800,
            opacity: interpolate(frame, [2, 26], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          “
        </div>

        <div style={{ marginTop: v ? 34 : 30 }}>
          <WordQuote
            text={text}
            highlight={HIGHLIGHT[index]}
            fontSize={fontSize}
            delay={14}
            step={v ? 2.2 : 2.2}
          />
        </div>
      </div>

      <Sequence from={0}>
        <div
          style={{
            position: "absolute",
            bottom: v ? 130 : 96,
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
      </Sequence>
    </AbsoluteFill>
  );
};

const SceneClose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const v = height > width;
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const glow = 0.4 + Math.sin(frame * 0.07) * 0.22;

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        alignItems: "center",
        justifyContent: "center",
        padding: v ? "0 90px" : "0 140px",
        opacity: out,
      }}
    >
      <div style={{ transform: breathe(frame, 4, 0.022), display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: v ? 176 : 156,
            height: v ? 176 : 156,
            borderRadius: 36,
            background: "#ffffff",
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
          No prometemos, construimos.
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

const T = 20;
export const TESTIMONIAL_TOTAL = 100 + 250 + 260 + 190 + 160 - 4 * T;

export const Testimonial: React.FC = () => (
  <AbsoluteFill>
    <PersistentBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={100}>
        <SceneOpen />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={250}>
        <QuoteScene index={0} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={260}>
        <QuoteScene index={1} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={190}>
        <QuoteScene index={2} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={160}>
        <SceneClose />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Vignette />
  </AbsoluteFill>
);
