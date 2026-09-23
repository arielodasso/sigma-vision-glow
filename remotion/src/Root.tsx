import { Composition } from "remotion";
import { CapitanIntro, CAPITAN_INTRO_TOTAL } from "./CapitanIntro";
import { MainVideo } from "./MainVideo";
import { Outro } from "./Outro";
import { Testimonial, TESTIMONIAL_TOTAL } from "./Testimonial";
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
      id="testimonial-vertical"
      component={Testimonial}
      durationInFrames={TESTIMONIAL_TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="testimonial"
      component={Testimonial}
      durationInFrames={TESTIMONIAL_TOTAL}
      fps={30}
      width={1920}
      height={1080}
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
      id="capitan-intro-vertical"
      component={CapitanIntro}
      durationInFrames={CAPITAN_INTRO_TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="capitan-intro"
      component={CapitanIntro}
      durationInFrames={CAPITAN_INTRO_TOTAL}
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

