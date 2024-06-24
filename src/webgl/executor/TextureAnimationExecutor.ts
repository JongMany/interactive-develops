import { Point } from "../texture/WaterTexture";

interface Texture {
  update(): void;
  addPoint(point: Point): void;
}
export class TextureAnimateExecutor<T extends Texture> {
  private texture: T;
  private targetElement: HTMLElement | null = null;

  constructor(texture: T, targetElement: HTMLElement) {
    this.texture = texture;
    this.tick = this.tick.bind(this);
    this.targetElement = targetElement;
    this.init();
  }

  init() {
    // 애니메이션 시작하기
    this.targetElement?.addEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.tick();
  }
  onMouseMove(event: MouseEvent) {
    if (!this.targetElement) return;
    const point = {
      x: event.clientX / this.targetElement.clientWidth,
      y: event.clientY / this.targetElement.clientHeight,
      age: 0,
    } as Point;
    console.log(
      this.targetElement,
      this.targetElement.clientHeight,
      event.clientY
    );
    this.texture.addPoint(point);
  }

  tick() {
    this.texture.update();
    requestAnimationFrame(this.tick);
  }
}
