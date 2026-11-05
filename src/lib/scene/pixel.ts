// Shared pixel-art toolkit for every scene on the site: palette, little
// geometry helpers, and the post pass that turns a three.js render into
// crisp pixel art (depth/normal outlines, 4x4 Bayer dither, 16-colour
// palette snap).

import * as THREE from "three";

// ── palette (sRGB) ───────────────────────────────────────────────────────
// Cool shadows, the site's teal, Rust orange, cream highlights, two greens.
export const PALETTE = [
  "#0b0d17", "#1b2033", "#2c3452", "#4a5683", "#7d8fc4",
  "#16403f", "#2a7a6b", "#5eead4",
  "#6e2a1c", "#ce422b", "#f08a4b", "#ffd27a",
  "#b9b2a0", "#f4efe1",
  "#2f5a33", "#6f9e4f",
];

export const C = {
  grass: 0x6f9e4f, grassDark: 0x4f7a3c, dirt: 0x6e4a2c, rock: 0x4a5683, rockDark: 0x2c3452,
  slate: 0x2c3452, slateLight: 0x4a5683, metal: 0x7d8fc4, cream: 0xf4efe1, paper: 0xf4efe1,
  teal: 0x5eead4, tealDark: 0x2a7a6b, rust: 0xce422b, orange: 0xf08a4b, gold: 0xffd27a,
  ts: 0x4a7fd4, leaf: 0x2f5a33, leafLight: 0x6f9e4f, trunk: 0x6e2a1c, ink: 0x1b2033,
  sand: 0xd9c08a, stone: 0xb9b2a0, deep: 0x16403f,
};

export const SKY_DAY = ["#f4efe1", "#b9b2a0", "#7d8fc4", "#4a5683"] as const;
export const SKY_NIGHT = ["#2c3452", "#1b2033", "#0b0d17", "#0b0d17"] as const;

// ── tiny helpers ─────────────────────────────────────────────────────────
const mats = new Map<string, THREE.MeshLambertMaterial>();
export function mat(color: number, emissive = 0, ei = 1): THREE.MeshLambertMaterial {
  const key = `${color}:${emissive}:${ei}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({ color, emissive, emissiveIntensity: ei });
    mats.set(key, m);
  }
  return m;
}
export const boxGeo = new THREE.BoxGeometry(1, 1, 1);

export function box(
  w: number, h: number, d: number, x: number, y: number, z: number,
  material: THREE.Material, parent?: THREE.Object3D,
): THREE.Mesh {
  const m = new THREE.Mesh(boxGeo, material);
  m.scale.set(w, h, d);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent?.add(m);
  return m;
}

/** A thin bar between two points (for graph edges, antennae...). */
export function bar(a: THREE.Vector3, b: THREE.Vector3, t: number, material: THREE.Material, parent: THREE.Object3D) {
  const len = a.distanceTo(b);
  const m = new THREE.Mesh(boxGeo, material);
  m.scale.set(t, t, len);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.lookAt(b);
  m.castShadow = true;
  parent.add(m);
  return m;
}

export function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Little pixel screens drawn on a canvas. */
export function screen(w: number, h: number, draw: (g: CanvasRenderingContext2D, t: number) => void) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const g = cv.getContext("2d")!;
  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, update: (t: number) => { draw(g, t); tex.needsUpdate = true; } };
}

export function hexToRGB(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

/** True isometric camera placement (45° yaw, 35.264° pitch). */
export const ISO_PITCH = Math.atan(1 / Math.SQRT2);
export function placeIso(camera: THREE.Camera, target: THREE.Vector3, yaw = Math.PI / 4, r = 50) {
  camera.position.set(
    target.x + r * Math.cos(ISO_PITCH) * Math.sin(yaw),
    target.y + r * Math.sin(ISO_PITCH),
    target.z + r * Math.cos(ISO_PITCH) * Math.cos(yaw),
  );
  camera.lookAt(target);
}

// ── post-processing shader ──────────────────────────────────────────────
const POST_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const POST_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform vec2 texel;
uniform float near;
uniform float far;
uniform vec3 palette[16];
uniform vec3 sky0;
uniform vec3 sky1;
uniform vec3 sky2;
uniform vec3 sky3;
uniform float stars;
uniform float dither;
varying vec2 vUv;

float rawDepth(vec2 uv) { return texture2D(tDepth, uv).r; }
float depthAt(vec2 uv) { return near + rawDepth(uv) * (far - near); }
vec3 normalAt(vec2 uv) { return texture2D(tNormal, uv).rgb * 2.0 - 1.0; }

// Compact 4x4 Bayer matrix, values in [0,1).
float bayer2(vec2 a) { a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

vec3 toSRGB(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

vec3 quantize(vec3 c) {
  vec3 best = palette[0];
  float bd = 1e9;
  for (int i = 0; i < 16; i++) {
    vec3 d = c - palette[i];
    float dist = dot(d * d, vec3(0.299, 0.587, 0.114));
    if (dist < bd) { bd = dist; best = palette[i]; }
  }
  return best;
}

float neighborNormalEdge(vec2 o, float depth, vec3 normal) {
  float depthDiff = depthAt(vUv + o) - depth;
  vec3 nn = normalAt(vUv + o);
  float normalDiff = dot(normal - nn, vec3(1.0, 1.0, 1.0));
  float normalIndicator = clamp(smoothstep(-0.01, 0.01, normalDiff), 0.0, 1.0);
  float depthIndicator = clamp(sign(depthDiff * 0.25 + 0.0025), 0.0, 1.0);
  return (1.0 - dot(normal, nn)) * depthIndicator * normalIndicator;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float bay = bayer4(px) - 0.5;
  vec3 col;

  if (rawDepth(vUv) > 0.99999) {
    // Sky: ordered dither straight between 4 palette stops (no banding),
    // plus a few stars at night.
    float t = clamp(vUv.y, 0.0, 0.9999) * 3.0;
    float f = fract(t);
    int i = int(floor(t));
    bool up = f > bay + 0.5;
    if (i == 0) col = up ? sky1 : sky0;
    else if (i == 1) col = up ? sky2 : sky1;
    else col = up ? sky3 : sky2;
    if (stars > 0.5 && hash(floor(vUv / texel)) > 0.995 && vUv.y > 0.3) col = palette[hash(floor(vUv / texel) + 1.0) > 0.7 ? 11 : 13];
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  float depth = depthAt(vUv);
  vec3 normal = normalAt(vUv);
  vec2 ox = vec2(texel.x, 0.0);
  vec2 oy = vec2(0.0, texel.y);

  // Silhouette: a neighbour is noticeably further away.
  float de = 0.0;
  de += clamp(depthAt(vUv + ox) - depth, 0.0, 1.0);
  de += clamp(depthAt(vUv - ox) - depth, 0.0, 1.0);
  de += clamp(depthAt(vUv + oy) - depth, 0.0, 1.0);
  de += clamp(depthAt(vUv - oy) - depth, 0.0, 1.0);
  float depthEdge = step(0.45, de);

  // Crease: normals change across a convex edge -> light rim.
  float ne = 0.0;
  ne += neighborNormalEdge(ox, depth, normal);
  ne += neighborNormalEdge(-ox, depth, normal);
  ne += neighborNormalEdge(oy, depth, normal);
  ne += neighborNormalEdge(-oy, depth, normal);
  float normalEdge = step(0.1, ne);

  col = toSRGB(texture2D(tColor, vUv).rgb);
  if (depthEdge > 0.5) col *= 0.38;
  else if (normalEdge > 0.5) col = col * 1.3 + 0.04;

  col += bay * dither;
  gl_FragColor = vec4(quantize(col), 1.0);
}
`;

/**
 * Render targets + the pixel-art post pass for one view. Draws into whatever
 * the renderer's current viewport is when `target` is null.
 */
export class PixelPass {
  private rtColor: THREE.WebGLRenderTarget;
  private rtNormal: THREE.WebGLRenderTarget;
  private normalMat = new THREE.MeshNormalMaterial();
  private post: THREE.ShaderMaterial;
  private postScene = new THREE.Scene();
  private postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  w = 1;
  h = 1;

  constructor(near: number, far: number) {
    const makeRT = () =>
      new THREE.WebGLRenderTarget(1, 1, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, type: THREE.HalfFloatType });
    this.rtColor = makeRT();
    this.rtColor.depthTexture = new THREE.DepthTexture(1, 1);
    this.rtColor.depthTexture.type = THREE.FloatType;
    this.rtNormal = makeRT();
    this.post = new THREE.ShaderMaterial({
      vertexShader: POST_VERT,
      fragmentShader: POST_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        tColor: { value: this.rtColor.texture },
        tDepth: { value: this.rtColor.depthTexture },
        tNormal: { value: this.rtNormal.texture },
        texel: { value: new THREE.Vector2(1, 1) },
        near: { value: near },
        far: { value: far },
        palette: { value: PALETTE.map(() => new THREE.Color()) },
        sky0: { value: new THREE.Color() },
        sky1: { value: new THREE.Color() },
        sky2: { value: new THREE.Color() },
        sky3: { value: new THREE.Color() },
        stars: { value: 0 },
        dither: { value: 0.09 },
      },
    });
    // Palette colours must stay sRGB (THREE.Color stores linear when colour
    // management is on), so set them raw.
    (this.post.uniforms.palette.value as THREE.Color[]).forEach((c, i) => c.setRGB(...hexToRGB(PALETTE[i])));
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post);
    quad.frustumCulled = false;
    this.postScene.add(quad);
    this.setSky(...SKY_DAY);
  }

  setSky(...stops: readonly string[]) {
    stops.forEach((hex, i) => (this.post.uniforms[`sky${i}`].value as THREE.Color).setRGB(...hexToRGB(hex)));
  }

  set stars(on: boolean) {
    this.post.uniforms.stars.value = on ? 1 : 0;
  }

  setSize(w: number, h: number) {
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.rtColor.setSize(w, h);
    this.rtNormal.setSize(w, h);
    (this.post.uniforms.texel.value as THREE.Vector2).set(1 / w, 1 / h);
  }

  render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(this.rtColor);
    renderer.render(scene, camera);
    scene.overrideMaterial = this.normalMat;
    renderer.setRenderTarget(this.rtNormal);
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    renderer.setRenderTarget(prev);
    renderer.render(this.postScene, this.postCam);
  }

  dispose() {
    this.rtColor.depthTexture?.dispose();
    this.rtColor.dispose();
    this.rtNormal.dispose();
    this.post.dispose();
  }
}
