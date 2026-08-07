import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { fade } from "@remotion/transitions/fade";
import { PersistentBackground, Vignette } from "./components/Layers";
import { SceneHook } from "./scenes/SceneHook";
import { SceneServices } from "./scenes/SceneServices";
import { SceneCases } from "./scenes/SceneCases";
import { SceneProducts } from "./scenes/SceneProducts";
import { SceneClose } from "./scenes/SceneClose";

const timing = springTiming({ config: { damping: 200 }, durationInFrames: 26 });

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <PersistentBackground />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={100}>
        <SceneHook />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={190}>
        <SceneServices />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={190}>
        <SceneCases />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={140}>
        <SceneProducts />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={210}>
        <SceneClose />
      </TransitionSeries.Sequence>
    </TransitionSeries>
    <Vignette />
  </AbsoluteFill>
);
