import * as THREE from "three";
import { Point } from "./WaterTexture";
import { easeOutQuad, easeOutSine } from "../utils/animateFn";

export default class TouchTexture {
  size: number;
  radius: number; // 가장 큰 물방울의 반지름
  trail: Point[] = []; // 물방울의 배열
  maxAge: number = 64; // 물방울의 최대 지속 시간
  last: Point | null; // 최근에 추가된 물방울
  speed: number;

  width: number;
  height: number;
  canvas: HTMLCanvasElement = document.createElement("canvas");
  texture: THREE.Texture = new THREE.Texture(this.canvas);
  ctx: CanvasRenderingContext2D | null = this.canvas.getContext("2d");

  constructor(parent: HTMLElement) {
    this.size = 64;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.width = this.height = this.size;

    this.maxAge = 64;
    this.radius = 0.1 * this.size;
    // this.radius = 0.15 * 1000;

    this.speed = 1 / this.maxAge;
    // this.speed = 0.01;

    this.trail = [];
    this.last = null;

    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    this.texture = new THREE.Texture(this.canvas);
    this.canvas.id = "touchTexture";
    // this.canvas.style.width = this.canvas.style.height = `${
    //   this.canvas.width
    // }px`;
  }

  update(delta: number) {
    this.clear();
    const speed = this.speed;
    this.trail.forEach((point, i) => {
      const f = point.force * speed * (1 - point.age / this.maxAge);
      const x = point.x;
      const y = point.y;

      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      }
    });

    this.trail.forEach((point, i) => {
      this.drawPoint(point);
    });

    this.texture.needsUpdate = true;
  }
  clear() {
    if (!this.ctx) return;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  addTouch(point: Point) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      const d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;

      force = Math.min(dd * 10000, 1);
      // force = Math.sqrt(dd)* 50.;
      // force = 1;
    }
    const newPoint = {
      x: point.x,
      y: point.y,
      age: 0,
      force,
      vx,
      vy,
    } as Point;
    this.last = newPoint;
    this.trail.push(newPoint);
  }
  drawPoint(point: Point) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height,
    };

    let intensity = 1;

    if (point.age < this.maxAge * 0.3) {
      intensity = easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = easeOutQuad(
        1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7),
        0,
        1,
        1
      );
    }
    intensity *= point.force;

    const radius = this.radius;
    const color = `${((point.vx + 1) / 2) * 255}, ${
      ((point.vy + 1) / 2) * 255
    }, ${intensity * 255}`;

    const offset = this.size * 5;
    ctx.shadowOffsetX = offset; // (default 0)
    ctx.shadowOffsetY = offset; // (default 0)
    ctx.shadowBlur = radius * 1; // (default 0)
    ctx.shadowColor = `rgba(${color},${0.2 * intensity})`; // (default transparent black)

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
