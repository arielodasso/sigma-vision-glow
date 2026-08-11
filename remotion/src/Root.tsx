import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { Outro } from "./Outro";
import { TOTAL } from "./theme";

export const RemotionRoot = () => (
  <>
    <Composition
      id="main"
      component={MainVideo}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="vertical"
      component={MainVideo}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="outro"
      component={Outro}
      durationInFrames={195}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="outro-vertical"
      component={Outro}
      durationInFrames={195}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);

