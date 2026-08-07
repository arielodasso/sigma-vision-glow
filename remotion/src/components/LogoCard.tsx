import { Img, staticFile } from "remotion";
import { C } from "../theme";

export const LogoCard: React.FC<{
  file: string;
  name: string;
  theme?: "light" | "dark";
  w?: number;
  h?: number;
  logoMax?: number;
  style?: React.CSSProperties;
}> = ({ file, name, theme = "light", w = 230, h = 118, logoMax = 62, style }) => (
  <div
    style={{
      width: w,
      height: h,
      flexShrink: 0,
      borderRadius: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 24px",
      background: theme === "light" ? "#FFFFFF" : "rgba(244,245,246,0.05)",
      border: `1px solid ${theme === "light" ? "rgba(255,255,255,0.9)" : C.line}`,
      ...style,
    }}
  >
    <Img
      src={staticFile(`images/${file}`)}
      alt={name}
      style={{ maxHeight: logoMax, maxWidth: "100%", objectFit: "contain" }}
    />
  </div>
);
