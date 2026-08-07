import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { PersistentBackground, Vignette, VerticalHeader } from "./components/Layers";
import { SceneHook } from "./scenes/SceneHook";
import { SceneServices } from "./scenes/SceneServices";
import { SceneCases } from "./scenes/SceneCases";
import { SceneProducts } from "./scenes/SceneProducts";
import { SceneClose } from "./scenes/SceneClose";

const T = 26;
const timing = springTiming({ config: { damping: 200 }, durationInFrames: T });

const D = { hook: 100, services: 190, cases: 220, products: 140, close: 210 };
// frame where the closing scene starts (transitions overlap by T each)
const CLOSE_START = D.hook + D.services + D.cases + D.products - 3 * T;

export const MainVideo: React.FC = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;

  return (
    <AbsoluteFill>
      <PersistentBackground />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={D.hook}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={D.services}>
          <SceneServices />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={D.cases}>
          <SceneCases />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={D.products}>
          <SceneProducts />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={D.close}>
          <SceneClose />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      {v ? (
        <Sequence from={0} durationInFrames={CLOSE_START} layout="none">
          <VerticalHeader />
        </Sequence>
      ) : null}
      <Vignette />
    </AbsoluteFill>
  );
};
