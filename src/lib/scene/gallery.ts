// Renders every project diorama on the page through ONE hidden WebGL
// renderer (browsers cap live WebGL contexts at ~16, and there are ~50
// projects). Each frame, every visible diorama is rendered into the shared
// canvas and copied into its own 2D canvas. Scenes are built lazily the
// first time they scroll into view and only animate while visible.

import * as THREE from "three";
import { PixelPass, placeIso, SKY_DAY, SKY_NIGHT } from "./pixel";
import { buildVignette, type Vignette } from "./vignettes";

type Entry = {
  el: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  slug: string;
  pixel: number;
  visible: boolean;
  active: boolean;
  w: number;
  h: number;
  t: number;
  yaw: number;
  built?: {
    vig: Vignette;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    pass: PixelPass;
    hemi: THREE.HemisphereLight;
    sun: THREE.DirectionalLight;
    night: boolean | null;
  };
};

export type DioramaHandle = { setActive(on: boolean): void; destroy(): void };

let renderer: THREE.WebGLRenderer | null = null;
let failed = false;
const entries = new Map<Element, Entry>();
let io: IntersectionObserver;
let ro: ResizeObserver;
let raf = 0;
let last = 0;
let acc = 0;
let night = false;
const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const FPS = 20;

function init() {
  if (renderer || failed) return !!renderer;
  try {
    const glCanvas = document.createElement("canvas");
    renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: true });
  } catch {
    failed = true;
    return false;
  }
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setSize(256, 256, false);

  io = new IntersectionObserver(
    (list) => {
      for (const e of list) {
        const en = entries.get(e.target);
        if (!en) continue;
        en.visible = e.isIntersecting;
        if (en.visible) draw(en);
      }
      kick();
    },
    { rootMargin: "120px" },
  );
  ro = new ResizeObserver((list) => {
    for (const e of list) {
      const en = entries.get(e.target);
      if (en) size(en);
    }
  });
  document.addEventListener("visibilitychange", kick);
  return true;
}

function build(en: Entry) {
  const vig = buildVignette(en.slug);
  const scene = new THREE.Scene();
  scene.add(vig.root);
  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x3a2a40, 1.1);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(-5, 10, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(512, 512);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  sun.shadow.bias = -0.002;
  scene.add(hemi, sun);
  const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
  const pass = new PixelPass(camera.near, camera.far);
  en.built = { vig, scene, camera, pass, hemi, sun, night: null };
  en.t = reduce ? 2.5 : (hash(en.slug) % 1000) / 100;
  vig.update(en.t);
  frame(en);
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function size(en: Entry) {
  const r = en.el.getBoundingClientRect();
  en.w = Math.max(1, Math.round(r.width / en.pixel));
  en.h = Math.max(1, Math.round(r.height / en.pixel));
  en.canvas.width = en.w;
  en.canvas.height = en.h;
  if (en.built) frame(en);
  draw(en);
}

function frame(en: Entry) {
  const b = en.built!;
  const aspect = en.w / en.h;
  const viewH = Math.max(b.vig.view, b.vig.width / aspect);
  Object.assign(b.camera, { left: (-viewH * aspect) / 2, right: (viewH * aspect) / 2, top: viewH / 2, bottom: -viewH / 2 });
  b.camera.updateProjectionMatrix();
  b.pass.setSize(en.w, en.h);
}

function applyNight(en: Entry) {
  const b = en.built!;
  if (b.night === night) return;
  b.night = night;
  b.pass.setSky(...(night ? SKY_NIGHT : SKY_DAY));
  b.pass.stars = night;
  b.hemi.intensity = night ? 0.45 : 1.1;
  b.hemi.color.setHex(night ? 0x6d7fc4 : 0xbfd9ff);
  b.sun.intensity = night ? 0.7 : 2.4;
  b.sun.color.setHex(night ? 0x9fb4ff : 0xfff1d6);
  b.vig.lamps.forEach((l) => (l.intensity = night ? 5 : 0));
  b.vig.glows.forEach((m) => (m.emissiveIntensity = (m.userData.base ?? 0.5) * (night ? 2 : 1)));
}

/** Render one diorama into its own canvas. */
function draw(en: Entry) {
  if (!renderer || !en.visible || en.w < 2) return;
  if (!en.built) build(en);
  const b = en.built!;
  applyNight(en);
  const gl = renderer.domElement;
  if (gl.width < en.w || gl.height < en.h) renderer.setSize(Math.max(gl.width, en.w), Math.max(gl.height, en.h), false);
  renderer.setViewport(0, 0, en.w, en.h);
  placeIso(b.camera, b.vig.target, en.yaw);
  renderer.shadowMap.needsUpdate = true;
  b.pass.render(renderer, b.scene, b.camera);
  // WebGL's origin is bottom-left: our viewport is the bottom strip.
  en.ctx.drawImage(gl, 0, gl.height - en.h, en.w, en.h, 0, 0, en.w, en.h);
}

function loop(now: number) {
  raf = 0;
  const dt = Math.min(0.1, (now - last) / 1000 || 0);
  last = now;
  acc += dt;
  let any = false;
  if (acc >= 1 / FPS) {
    const step = acc;
    acc = 0;
    for (const en of entries.values()) {
      if (!en.visible) continue;
      any = true;
      if (!en.built) {
        draw(en);
        continue;
      }
      const goal = Math.PI / 4 + (en.active ? 0.32 : 0);
      en.yaw += (goal - en.yaw) * Math.min(1, step * 5);
      en.t += step * (en.active ? 1.6 : 1);
      en.built.vig.update(en.t);
      draw(en);
    }
  } else any = [...entries.values()].some((e) => e.visible);
  if (any) kick();
}

function kick() {
  if (reduce || raf || document.hidden) return;
  last = performance.now();
  raf = requestAnimationFrame(loop);
}

export function setNight(n: boolean) {
  if (night === n) return;
  night = n;
  for (const en of entries.values()) if (en.built) draw(en);
}

export function mount(el: HTMLElement, canvas: HTMLCanvasElement, slug: string, opts: { pixel?: number; night?: boolean } = {}): DioramaHandle | null {
  if (!init()) return null;
  if (opts.night !== undefined) night = opts.night;
  const en: Entry = {
    el, canvas, ctx: canvas.getContext("2d")!, slug, pixel: opts.pixel ?? 2,
    visible: false, active: false, w: 1, h: 1, t: 0, yaw: Math.PI / 4,
  };
  entries.set(el, en);
  io.observe(el);
  ro.observe(el);
  return {
    setActive(on) {
      en.active = on;
      if (on) kick();
    },
    destroy() {
      io.unobserve(el);
      ro.unobserve(el);
      entries.delete(el);
      const b = en.built;
      if (b) {
        b.pass.dispose();
        b.sun.shadow.map?.dispose();
        b.scene.traverse((o) => {
          const m = (o as THREE.Mesh).material as THREE.Material | undefined;
          if (m && "map" in m && (m as THREE.MeshBasicMaterial).map) {
            (m as THREE.MeshBasicMaterial).map!.dispose();
            m.dispose();
          }
        });
      }
    },
  };
}
