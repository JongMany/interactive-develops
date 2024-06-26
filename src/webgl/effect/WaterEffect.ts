// import * as THREE from "three";
// import { Effect } from "postprocessing";

// type Options = {
//   texture: THREE.Texture | null;
// };

// export class WaterEffect extends Effect {
//   constructor(options: Options = { texture: null }) {
//     super("WaterEffect", fragment, {
//       uniforms: new Map([["uTexture", new THREE.Uniform(options.texture)]]),
//     });
//   }
// }
// export default WaterEffect;

// const fragment = `

// uniform sampler2D uTexture;
// #define PI 3.14159265359

// void mainUv(inout vec2 uv) {
//         vec4 tex = texture2D(uTexture, uv);
//         float angle = -((tex.r) * (PI * 2.) - PI) ;
//         float vx = -(tex.r *2. - 1.);
//         float vy = -(tex.g *2. - 1.);
//         float intensity = tex.b;
//         uv.x += vx * 0.2 * intensity ;
//         uv.y += vy * 0.2  *intensity;
//         // uv.xy *= 1. - 0.5 * smoothstep( 0., 1., intensity) ;
//         // uv.x +=  0.2 * intensity;
//         // uv.y +=  0.2  *intensity;
//     }

// `;

import * as THREE from "three";
import { Effect } from "postprocessing";

const fragment = `
uniform sampler2D uTexture;
#ifndef PI
#define PI 3.14159265359
#endif

void mainUv(inout vec2 uv) {
        vec4 tex = texture2D(uTexture, uv);
		// Convert normalized values into regular unit vector
        float vx = -(tex.r *2. - 1.);
        float vy = -(tex.g *2. - 1.);
		// Normalized intensity works just fine for intensity
        float intensity = tex.b;
        float maxAmplitude = 0.2;
        uv.x += vx * intensity * maxAmplitude;
        uv.y += vy * intensity * maxAmplitude;
    }
`;

export class WaterEffect extends Effect {
  constructor(texture: THREE.Texture) {
    super("WaterEffect", fragment, {
      uniforms: new Map([["uTexture", new THREE.Uniform(texture)]]),
    });
  }
}
export default WaterEffect;
