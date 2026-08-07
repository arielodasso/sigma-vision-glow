import { loadFont } from "@remotion/google-fonts/Montserrat";

export const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const C = {
  bg: "#08090A",
  bgSoft: "#101113",
  fg: "#F4F5F6",
  muted: "#8B8D93",
  dim: "#5C5E64",
  line: "rgba(244,245,246,0.10)",
  line2: "rgba(244,245,246,0.18)",
  // brand product colors — ONLY for Sigma Analytics / Sigma Trend Engine
  yellow: "#E2FC03",
  blue: "#4C7AFF",
};

export const TOTAL = 756;
