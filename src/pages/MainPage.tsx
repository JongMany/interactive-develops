import { useRef } from "react";
import { TextureAnimateExecutor } from "../webgl/executor/TextureAnimationExecutor";
import { WaterTexture } from "../webgl/texture/WaterTexture";

export default function MainPage() {
  const animationExecutor = useRef(
    new TextureAnimateExecutor(
      new WaterTexture({ debug: false }),
      document.body
    )
  );

  return <div>메인</div>;
}
