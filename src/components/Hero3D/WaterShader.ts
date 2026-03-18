import * as THREE from 'three';

const WaterShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color('#002d5f') },
    uColorB: { value: new THREE.Color('#5052c8') },
    uOpacity: { value: 0.85 },
  },

  vertexShader: /* glsl */ `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vElevation;

    // Simplex noise helpers
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(
        0.211324865405187,
        0.366025403784439,
        -0.577350269189626,
        0.024390243902439
      );
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x_) - 0.5;
      vec3 ox = floor(x_ + 0.5);
      vec3 a0 = x_ - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vUv = uv;
      vec3 pos = position;

      // Single wave layer (wave1 only)
      float wave1 = snoise(vec2(pos.x * 1.8 + uTime * 0.4, pos.y * 1.5 + uTime * 0.25)) * 0.25;

      // Max mouse ripple influence
      float dist = distance(vUv, uMouse);
      float mouseWave = sin(dist * 20.0 - uTime * 3.0) * 0.35 * smoothstep(0.8, 0.0, dist);

      pos.z += wave1 + mouseWave;
      vElevation = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uTime;
    uniform float uOpacity;
    varying float vElevation;
    varying vec2 vUv;

    void main() {
      // Mix colors based on wave height
      float mixStrength = smoothstep(-0.3, 0.4, vElevation);
      vec3 color = mix(uColorA, uColorB, mixStrength);

      // Foam effect on wave crests
      float foam = smoothstep(0.28, 0.35, vElevation);
      color = mix(color, vec3(0.85, 0.95, 1.0), foam * 0.4);

      // Subtle shimmer
      float shimmer = sin(vUv.x * 40.0 + uTime * 2.0) * sin(vUv.y * 30.0 + uTime * 1.5) * 0.03;
      color += shimmer;

      // Edge fade (soften top edge of water plane)
      float edgeFade = smoothstep(0.0, 0.15, vUv.y);
      float alpha = uOpacity * edgeFade;

      gl_FragColor = vec4(color, alpha);
    }
  `,
};

export default WaterShader;
