import { interpolate, spring } from "remotion";

export const rise = (frame: number, fps: number, delay = 0, distance = 42) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.9 },
  });
  return {
    opacity: interpolate(s, [0, 0.35, 1], [0, 0.7, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [distance, 0])}px)`,
    filter: `blur(${interpolate(s, [0, 0.6, 1], [10, 1.5, 0])}px)`,
  };
};

export const heroPop = (frame: number, fps: number, delay = 0) => {
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90, mass: 1.1 },
  });
  return {
    opacity: interpolate(s, [0, 0.3, 1], [0, 0.8, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [70, 0])}px) scale(${interpolate(
      s,
      [0, 1],
      [1.06, 1],
    )})`,
    filter: `blur(${interpolate(s, [0, 0.5, 1], [18, 2, 0])}px)`,
  };
};

// gentle life so nothing is ever fully static
export const breathe = (frame: number, amp = 3, speed = 0.02) =>
  `translateY(${Math.sin(frame * speed) * amp}px)`;
