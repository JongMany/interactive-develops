import { easeOutQuad, easeOutSine } from "../utils/animateFn";
import * as THREE from "three";

// Links:https://tympanus.net/codrops/2019/10/08/creating-a-water-like-distortion-effect-with-three-js/
// Links: https://tympanus.net/codrops/2021/11/22/ripple-effect-on-a-texture-with-three-js/
type WaterTextureOptions = { debug: boolean };

export interface Point {
  x: number;
  y: number;
  age: 0;
  force: number;
  vx: number;
  vy: number;
}

export class WaterTexture {
  size: number;
  radius: number; // 가장 큰 물방울의 반지름
  points: Point[] = []; // 물방울의 배열
  maxAge: number = 64; // 물방울의 최대 지속 시간
  last: Point | null; // 최근에 추가된 물방울

  width: number;
  height: number;
  canvas: HTMLCanvasElement = document.createElement("canvas");
  texture: THREE.Texture = new THREE.Texture(this.canvas);
  ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");

  constructor(options: WaterTextureOptions = { debug: false }) {
    this.size = 64;
    this.radius = this.size * 0.1;
    this.points = [];
    this.width = this.height = this.size;
    this.maxAge = 64;
    this.last = null;

    if (options.debug) {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.radius = this.width * 0.1;
    }
    this.initTexture();

    if (options.debug) {
      if (
        [...document.body.children].find((child) => child.id === "WaterTexture")
      )
        // 이미 캔버스가 있다면 추가하지 않도록!
        return;
      document.body.appendChild(this.canvas);
    }
  }

  initTexture() {
    // canvas 초기화 및 ctx 설정
    this.canvas = document.createElement("canvas");
    this.canvas.id = "WaterTexture";
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.texture = new THREE.Texture(this.canvas);
    this.clear();
  }

  addPoint(point: Point) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const relativeX = point.x - last.x;
      const relativeY = point.y - last.y;
      // Distance
      const distanceSquared = relativeX ** 2 + relativeY ** 2;
      const distance = Math.sqrt(distanceSquared);
      // Unit Vector
      vx = relativeX / distance;
      vy = relativeY / distance;
      // Force
      force = Math.min(distanceSquared * 10000, 1);
    }
    const newPoint = { x: point.x, y: point.y, age: point.age, force, vx, vy };
    this.last = newPoint;
    this.points.push(newPoint);
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    // canvas를 초기화하고
    this.clear();
    const agePart = 1 / this.maxAge;

    this.points.forEach((point, index) => {
      // 나이가 들수록 물방울은 느려진다.
      const slowAsOlder = 1 - point.age / this.maxAge; // 괄호
      const force = point.force * slowAsOlder * agePart;
      point.x += point.vx * force;
      point.y += point.vy * force;
      // 물방울 나이를 증가시키고, 나이가 maxAge를 넘어가면 배열에서 제거
      point.age += 1;
      if (point.age > this.maxAge) {
        this.points.splice(index, 1);
      }
    });

    // 물방울을 그린다.
    this.points.forEach((point) => {
      this.drawPoint(point);
    });

    // 텍스처를 갱신하여 최신 상태로 유지합니다.
    this.texture.needsUpdate = true;
  }

  drawPoint(point: Point) {
    if (!this.ctx) return;
    // 정규화된 좌표(0~1)에서 Canvas 좌표로 변환
    const pos = {
      x: point.x * this.width,
      y: point.y * this.height,
    };

    const radius = this.radius;
    const ctx = this.ctx;

    // this.ctx.beginPath();
    // this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    // this.ctx.fill();

    // 물방울은 가운데는 강한 힘, 가장자리는 약한 힘을 가진다. => Radial Gradient (가장자리로 갈수록 투명도를 잃음.)

    // age가 maxAge에 가까울수록 투명도가 낮아짐
    // const intensity = 1 - point.age / this.maxAge;
    let intensity =
      point.age < this.maxAge * 0.3
        ? easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1)
        : easeOutQuad(
            1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
            0,
            1,
            1
          );
    intensity *= point.force;

    // Insert data to color channels
    // RGB Unit Vector
    const red = ((point.vx + 1) / 2) * 255;
    const green = ((point.vy + 1) / 2) * 255;
    const blue = 255 * intensity;
    const color = `${red},${green},${blue}`;

    const offset = this.width * 5;
    // 1. Shadow a high offset
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius * 1;
    ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,255,255,1)";

    // 2. Move the circle to the other direction of the offset
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

//방사형 그래디언트는 많은 부분이 겹칠 때 디더링과 같은 효과를 만들어냅니다. 그것은 스타일리시해 보이지만 우리가 원하는 것만큼 매끄럽지는 않습니다.

// 우리는 잔물결을 부드럽게 만들기 위해 원 자체를 사용하는 대신 원의 그림자를 사용할 것입니다. 그림자는 우리에게 멈춤과 같은 효과 없이 구배와 같은 결과를 제공합니다. 차이점은 그림자가 캔버스에 칠해지는 방식에 있습니다.

// 평평한 색의 원이 아니라 그림자만 보고 싶기 때문에 그림자에 높은 오프셋을 줄 것입니다. 그리고 원을 반대 방향으로 이동시킬 것입니다.

// 리플이 나이가 들어감에 따라 리플이 사라질 때까지 불투명도를 줄일 것입니 다:
