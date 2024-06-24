import { Point } from "../texture/WaterTexture";
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass } from "postprocessing";
import WaterEffect from "../effect/WaterEffect";

interface Texture {
  update(): void;
  addPoint(point: Point): void;
  texture: THREE.Texture;
}
export class TextureAnimateExecutor<T extends Texture> {
  private texture: T;
  private targetElement: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private disposed: boolean = false;
  private clock: THREE.Clock;
  private composer: EffectComposer;
  // private waterEffect: WaterEffect;

  constructor(texture: T, targetElement: HTMLElement) {
    this.texture = texture;
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.domElement.id = "webGLApp";

    this.targetElement = targetElement;

    if (
      [...this.targetElement.children].findIndex(
        (child) => child.id === "webGLApp"
      ) === -1
    ) {
      this.targetElement.appendChild(this.renderer.domElement);
    }

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.z = 50;
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x161624);
    // Composer
    this.composer = new EffectComposer(this.renderer);

    // Clock
    this.clock = new THREE.Clock();

    this.tick = this.tick.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);

    this.init();
  }

  init() {
    // 애니메이션 시작하기
    this.initComposer();
    this.addPlane();
    this.tick();
  }

  initComposer() {
    const renderPass = new RenderPass(this.scene, this.camera);
    // const waterEffect = new WaterEffect({ texture: this.texture.texture });
    const waterEffect = new WaterEffect(this.texture.texture);

    const waterPass = new EffectPass(this.camera, waterEffect);

    renderPass.renderToScreen = false;
    waterPass.renderToScreen = true;

    this.composer.addPass(renderPass);
    this.composer.addPass(waterPass);
  }

  addPlane() {
    const geometry = new THREE.PlaneGeometry(5, 5, 1, 1);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);

    this.targetElement?.addEventListener("mousemove", this.onMouseMove);
    this.scene.add(mesh);
  }
  render() {
    // this.renderer.render(this.scene, this.camera);
    // this.composer.render(this.clock.getDelta());
    this.composer.render();
  }

  onMouseMove(event: MouseEvent) {
    if (!this.targetElement) return;
    const point = {
      x: event.clientX / this.targetElement.clientWidth,
      y: event.clientY / this.targetElement.clientHeight,
      age: 0,
    } as Point;

    this.texture.addPoint(point);
  }

  tick() {
    this.render();
    this.texture.update();
    requestAnimationFrame(this.tick);
  }
}
