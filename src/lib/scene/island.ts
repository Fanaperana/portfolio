// "The workshop" — a live isometric diorama of what I build.
//
// Code blocks leave the terminal and ride a conveyor through my projects:
// semtree parses them, adaptive-codegraph links them, cinecode films them,
// and they come back as finished frames. Little agents shuttle documents
// from the spdf printer to the pskey vault. Bits spill off the island edge.
//
// Rendering: orthographic isometric camera -> low-res render targets
// (1 texel = `pixel` CSS px) -> one post pass that draws depth/normal
// outlines, applies 4x4 Bayer dithering and snaps every pixel to a fixed
// 16-colour palette. The canvas is low-res and upscaled with
// `image-rendering: pixelated`, so every "pixel" is crisp.

import * as THREE from "three";
import { PALETTE, C, SKY_DAY, SKY_NIGHT, PixelPass, mat, box, bar, rand, screen, boxGeo, placeIso } from "./pixel";

export { PALETTE };

export type Hotspot = { id: string; label: string; sub: string };
export type HoverInfo = Hotspot & { x: number; y: number };

export type SceneOptions = {
  pixel?: number;
  night?: boolean;
  animate?: boolean;
  onHover?: (h: HoverInfo | null) => void;
  onClick?: (h: Hotspot) => void;
};

export type SceneHandle = {
  setNight(night: boolean): void;
  setRunning(running: boolean): void;
  destroy(): void;
};

const HOTSPOTS: Record<string, Hotspot> = {
  terminal: { id: "terminal", label: "mini-shell", sub: "Rust → WASM shell · try it below" },
  semtree: { id: "semtree", label: "semtree", sub: "incremental parser · Rust" },
  codegraph: { id: "adaptive-codegraph", label: "adaptive-codegraph", sub: "code graph for AI assistants" },
  cinecode: { id: "cinecode", label: "cinecode", sub: "renders code explainers to MP4" },
  pskey: { id: "pskey", label: "pskey", sub: "password vault · Tauri + libsodium" },
  spdf: { id: "spdf", label: "spdf", sub: "layout-preserving PDF extraction" },
  agents: { id: "agents", label: "agents", sub: "tool-using AI that does the chores" },
};

// ── the scene ───────────────────────────────────────────────────────────
export function createIsland(container: HTMLElement, canvas: HTMLCanvasElement, opts: SceneOptions = {}): SceneHandle {
  const PIXEL = opts.pixel ?? 2;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // post pass writes sRGB itself

  const scene = new THREE.Scene();
  const world = new THREE.Group();
  scene.add(world);

  // camera: true isometric (45° yaw, 35.264° pitch)
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 120);
  const target = new THREE.Vector3(0.4, -1.4, 0);
  let yaw = Math.PI / 4;
  let yawTarget = yaw;
  const placeCamera = () => placeIso(camera, target, yaw);

  // lights
  const hemi = new THREE.HemisphereLight(0xbfd9ff, 0x3a2a40, 1.1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
  sun.position.set(-8, 16, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 });
  sun.shadow.bias = -0.002;
  scene.add(sun);
  const lampLights: THREE.PointLight[] = [];

  const pickables: THREE.Object3D[] = [];
  function tag(obj: THREE.Object3D, key: keyof typeof HOTSPOTS) {
    obj.userData.hotspot = HOTSPOTS[key];
    pickables.push(obj);
    return obj;
  }

  // ── island ──
  const W = 16, D = 12;
  const rnd = rand(7);
  const tiles = new THREE.InstancedMesh(boxGeo, new THREE.MeshLambertMaterial(), W * D);
  tiles.receiveShadow = true;
  {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let i = 0;
    for (let x = 0; x < W; x++)
      for (let z = 0; z < D; z++) {
        const h = 0.5 + (rnd() < 0.12 ? 0.08 : 0);
        m.compose(new THREE.Vector3(x - W / 2 + 0.5, h / 2 - 0.5, z - D / 2 + 0.5), new THREE.Quaternion(), new THREE.Vector3(1, h, 1));
        tiles.setMatrixAt(i, m);
        c.setHex(rnd() < 0.18 ? C.grassDark : C.grass);
        tiles.setColorAt(i, c);
        i++;
      }
  }
  world.add(tiles);
  box(W, 0.8, D, 0, -0.9, 0, mat(C.dirt), world);
  // floating rock underside, stepped
  const layers: [number, number, number, number, number][] = [
    [14.5, 1.2, 10.5, -1.9, 0], [12, 1.3, 8.4, -3.1, 0.3], [9, 1.3, 6, -4.4, -0.2], [5.6, 1.3, 3.8, -5.7, 0.4], [2.4, 1.2, 1.8, -6.9, 0.2],
  ];
  layers.forEach(([w, h, d, y, off], i) => box(w, h, d, off, y, off * 0.5, mat(i % 2 ? C.rockDark : C.rock), world));

  // ── conveyor loop ──
  const loop = [new THREE.Vector3(-4, 0, -2), new THREE.Vector3(4, 0, -2), new THREE.Vector3(4, 0, 2), new THREE.Vector3(-4, 0, 2)];
  const segLen = loop.map((p, i) => p.distanceTo(loop[(i + 1) % loop.length]));
  const L = segLen.reduce((a, b) => a + b, 0);
  function along(s: number, out = new THREE.Vector3()) {
    s = ((s % L) + L) % L;
    for (let i = 0; i < loop.length; i++) {
      if (s <= segLen[i]) return out.lerpVectors(loop[i], loop[(i + 1) % loop.length], s / segLen[i]);
      s -= segLen[i];
    }
    return out.copy(loop[0]);
  }
  // belt bed
  box(9, 0.22, 1, 0, 0.11, -2, mat(C.slate), world);
  box(9, 0.22, 1, 0, 0.11, 2, mat(C.slate), world);
  box(1, 0.22, 3, -4, 0.11, 0, mat(C.slate), world);
  box(1, 0.22, 3, 4, 0.11, 0, mat(C.slate), world);
  // moving slats
  const SLATS = 48;
  const slats = new THREE.InstancedMesh(boxGeo, mat(C.slateLight), SLATS);
  world.add(slats);

  // packets (code blocks)
  const stageMats = [mat(C.rust, C.rust, 0.25), mat(C.teal, C.tealDark, 0.4), mat(C.gold, C.orange, 0.3), mat(C.cream, C.gold, 0.25)];
  const tsMat = mat(C.ts, 0x1b2033, 0.2);
  const PACKETS = 11;
  const packets = Array.from({ length: PACKETS }, (_, i) => {
    const m = box(0.42, 0.42, 0.42, 0, 0, 0, stageMats[0], world);
    return { mesh: m, offset: (i / PACKETS) * L, ts: i % 3 === 1 };
  });
  // stage positions along the loop (distance s)
  const S_SEMTREE = 2.5, S_GRAPH = 9.5, S_CINE = 16;
  const pulses: Record<string, number> = { terminal: 0, semtree: 0, codegraph: 0, cinecode: 0 };

  // ── terminal (start of the pipeline) ──
  const terminal = new THREE.Group();
  terminal.position.set(-5.8, 0, -3.3);
  box(1.8, 2.6, 1.4, 0, 1.3, 0, mat(C.ink), terminal);
  box(1.9, 0.2, 1.5, 0, 2.7, 0, mat(C.slateLight), terminal);
  const termScreen = screen(24, 18, (g, t) => {
    g.fillStyle = "#0b0d17"; g.fillRect(0, 0, 24, 18);
    g.fillStyle = "#5eead4";
    const lines = Math.floor(t * 1.5) % 6;
    for (let i = 0; i < lines; i++) g.fillRect(2, 2 + i * 3, 3 + ((i * 7 + 5) % 15), 1);
    g.fillStyle = "#ce422b"; g.fillRect(2, 2 + lines * 3, 1, 1);
    if (Math.floor(t * 3) % 2) { g.fillStyle = "#f4efe1"; g.fillRect(4, 2 + lines * 3, 2, 1); }
  });
  const termFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.05), new THREE.MeshBasicMaterial({ map: termScreen.tex }));
  termFace.position.set(0, 1.65, 0.71);
  terminal.add(termFace);
  // chute onto the belt
  box(0.9, 0.5, 1.2, 1.3, 0.55, 1.0, mat(C.slateLight), terminal);
  box(0.25, 0.25, 0.25, -0.55, 0.55, 0.75, mat(C.teal, C.teal, 1), terminal);
  world.add(tag(terminal, "terminal"));

  // ── semtree: parser gate with a spinning ring ──
  const semtree = new THREE.Group();
  semtree.position.set(-1.5, 0, -2);
  box(0.4, 1.9, 0.4, 0, 0.95, -0.75, mat(C.metal), semtree);
  box(0.4, 1.9, 0.4, 0, 0.95, 0.75, mat(C.metal), semtree);
  box(0.6, 0.35, 2.0, 0, 2.05, 0, mat(C.slate), semtree);
  const semLight = box(0.3, 0.18, 0.3, 0, 2.3, 0, mat(C.teal, C.teal, 0.6), semtree);
  const ring = new THREE.Group();
  ring.position.set(0, 0.95, 0);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    box(0.16, 0.22, 0.22, 0, Math.sin(a) * 0.7, Math.cos(a) * 0.7, mat(i % 2 ? C.teal : C.tealDark, C.tealDark, 0.3), ring);
  }
  semtree.add(ring);
  world.add(tag(semtree, "semtree"));

  // ── adaptive-codegraph: a tower of linked nodes ──
  const graph = new THREE.Group();
  graph.position.set(5.9, 0, -1.2);
  box(1.4, 0.35, 1.4, 0, 0.17, 0, mat(C.slate), graph);
  const nodePos = [
    [0, 0.9, 0], [-0.5, 1.7, 0.35], [0.5, 1.9, -0.3], [0.05, 2.7, 0.1], [-0.45, 3.4, -0.25], [0.45, 3.5, 0.35], [0, 4.2, 0],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 2]];
  edges.forEach(([a, b]) => bar(nodePos[a], nodePos[b], 0.07, mat(C.metal), graph));
  const nodeMats = nodePos.map(() => new THREE.MeshLambertMaterial({ color: C.tealDark, emissive: C.teal, emissiveIntensity: 0.1 }));
  nodePos.forEach((p, i) => {
    const m = new THREE.Mesh(boxGeo, nodeMats[i]);
    m.scale.setScalar(i === 6 ? 0.42 : 0.32);
    m.position.copy(p);
    m.castShadow = true;
    graph.add(m);
  });
  world.add(tag(graph, "codegraph"));

  // ── cinecode: camera on a tripod filming the belt + the big screen ──
  const cine = new THREE.Group();
  cine.position.set(0.5, 0, 3.6);
  bar(new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(-0.45, 0, 0.35), 0.08, mat(C.ink), cine);
  bar(new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0.45, 0, 0.35), 0.08, mat(C.ink), cine);
  bar(new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, 0, -0.5), 0.08, mat(C.ink), cine);
  const camBody = new THREE.Group();
  camBody.position.set(0, 1.35, 0);
  box(0.8, 0.55, 0.5, 0, 0, 0, mat(C.slate), camBody);
  box(0.3, 0.3, 0.45, 0, 0, -0.45, mat(C.ink), camBody);
  box(0.42, 0.42, 0.12, -0.15, 0.42, 0, mat(C.slateLight), camBody);
  box(0.42, 0.42, 0.12, 0.25, 0.42, 0, mat(C.slateLight), camBody);
  const recLight = box(0.12, 0.12, 0.12, 0.3, 0.2, 0.26, mat(C.rust, C.rust, 1), camBody);
  camBody.rotation.y = 0.15;
  cine.add(camBody);
  world.add(tag(cine, "cinecode"));

  const bigScreen = new THREE.Group();
  bigScreen.position.set(-3.2, 0, -5.1);
  box(0.2, 1.4, 0.2, -1.6, 0.7, 0, mat(C.ink), bigScreen);
  box(0.2, 1.4, 0.2, 1.6, 0.7, 0, mat(C.ink), bigScreen);
  box(3.9, 2.5, 0.25, 0, 2.55, 0, mat(C.ink), bigScreen);
  const film = screen(64, 40, (g, t) => {
    g.fillStyle = "#1b2033"; g.fillRect(0, 0, 64, 40);
    // typewriter code lines, the way cinecode reveals them
    const colors = ["#ce422b", "#5eead4", "#ffd27a", "#7d8fc4", "#f4efe1"];
    const shown = (t * 9) % 70;
    let k = 0;
    for (let i = 0; i < 7; i++) {
      const indent = [0, 4, 4, 8, 8, 4, 0][i];
      const len = [18, 26, 14, 30, 20, 10, 6][i];
      for (let j = 0; j < len; j += 4) {
        if (k++ > shown) break;
        g.fillStyle = colors[(i + j) % colors.length];
        g.fillRect(4 + indent + j, 5 + i * 4, 3, 2);
      }
    }
    // spotlight bar on the "explained" line
    const line = Math.floor(t / 2) % 7;
    g.fillStyle = "rgba(94,234,212,0.18)"; g.fillRect(1, 4 + line * 4, 62, 4);
    // REC dot
    if (Math.floor(t * 2) % 2) { g.fillStyle = "#ce422b"; g.fillRect(58, 2, 3, 3); }
  });
  const filmFace = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.25), new THREE.MeshBasicMaterial({ map: film.tex }));
  filmFace.position.set(0, 2.55, 0.13);
  bigScreen.add(filmFace);
  world.add(tag(bigScreen, "cinecode"));

  // ── pskey vault ──
  const vault = new THREE.Group();
  vault.position.set(-5.6, 0, 3.6);
  box(1.6, 1.5, 1.4, 0, 0.75, 0, mat(C.metal), vault);
  box(1.3, 1.2, 0.08, 0, 0.75, 0.72, mat(C.slateLight), vault);
  const dial = new THREE.Group();
  dial.position.set(0, 0.8, 0.8);
  box(0.5, 0.5, 0.1, 0, 0, 0, mat(C.slate), dial);
  box(0.08, 0.22, 0.12, 0, 0.12, 0.02, mat(C.cream), dial);
  vault.add(dial);
  const lockLight = box(0.14, 0.14, 0.1, 0.5, 1.25, 0.74, mat(C.teal, C.teal, 1), vault);
  world.add(tag(vault, "pskey"));

  // ── spdf printer ──
  const printer = new THREE.Group();
  printer.position.set(5.6, 0, 3.4);
  box(1.6, 0.9, 1.2, 0, 0.45, 0, mat(C.cream), printer);
  box(1.4, 0.25, 0.9, 0, 1.0, -0.1, mat(C.slateLight), printer);
  box(1.2, 0.08, 0.5, 0, 0.55, 0.75, mat(C.slate), printer);
  const sheet = new THREE.Group();
  sheet.position.set(0, 0.62, 0.4);
  box(0.9, 0.04, 0.9, 0, 0, 0, mat(C.paper), sheet);
  for (let i = 0; i < 3; i++) box(0.6 - i * 0.15, 0.02, 0.07, -0.05, 0.03, -0.25 + i * 0.22, mat(C.ink), sheet);
  printer.add(sheet);
  world.add(tag(printer, "spdf"));

  // ── trees & lamps ──
  function tree(x: number, z: number, s = 1) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    box(0.3 * s, 0.9 * s, 0.3 * s, 0, 0.45 * s, 0, mat(C.trunk), g);
    box(1.2 * s, 0.8 * s, 1.2 * s, 0, 1.2 * s, 0, mat(C.leaf), g);
    box(0.8 * s, 0.6 * s, 0.8 * s, 0.1 * s, 1.85 * s, -0.05 * s, mat(C.leafLight), g);
    world.add(g);
  }
  tree(-7.1, -5.1, 1.1);
  tree(7.2, -5.0, 0.9);
  tree(-7.3, 0.4, 0.8);
  tree(2.6, -5.2, 0.8);

  const lampHeads: THREE.Mesh[] = [];
  for (const [x, z] of [[-4.9, -1.0], [4.9, 1.0], [-1.5, 3.0], [2.5, -3.0]]) {
    box(0.12, 1.4, 0.12, x, 0.7, z, mat(C.ink), world);
    const head = box(0.3, 0.25, 0.3, x, 1.5, z, mat(C.gold, C.gold, 0.2), world);
    lampHeads.push(head);
    const pl = new THREE.PointLight(0xffd27a, 0, 4.5, 1.6);
    pl.position.set(x, 1.4, z);
    world.add(pl);
    lampLights.push(pl);
  }

  // ── data waterfall off the front edge ──
  box(1.2, 0.3, 0.6, 1.6, 0.0, 5.75, mat(C.ink), world);
  const BITS = 26;
  const bits = new THREE.InstancedMesh(boxGeo, new THREE.MeshLambertMaterial({ emissive: C.tealDark, emissiveIntensity: 0.6 }), BITS);
  {
    const c = new THREE.Color();
    for (let i = 0; i < BITS; i++) bits.setColorAt(i, c.setHex(i % 4 === 0 ? C.cream : C.teal));
  }
  world.add(bits);
  const bitSeeds = Array.from({ length: BITS }, (_, i) => ({ x: 1.1 + rnd() * 1.0, phase: rnd() * 3, speed: 1.8 + rnd() * 1.4, k: i }));

  // ── clouds drifting below the island ──
  const cloudMats: THREE.MeshBasicMaterial[] = [];
  const clouds = [0, 1, 2].map((i) => {
    const g = new THREE.Group();
    const m = new THREE.MeshBasicMaterial({ color: C.cream });
    cloudMats.push(m);
    const puff = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const b = new THREE.Mesh(boxGeo, m);
      b.scale.set(w, h, d);
      b.position.set(x, y, z);
      g.add(b);
    };
    puff(2.6, 0.5, 1.4, 0, 0, 0);
    puff(1.4, 0.6, 1.1, 0.5, 0.45, 0.1);
    puff(1.0, 0.45, 0.9, -0.8, 0.3, -0.1);
    puff(0.8, 0.35, 0.7, 1.4, 0.2, 0.2);
    g.position.set(-14 + i * 10, -4.5 - i * 1.6, 7 - i * 6);
    world.add(g);
    return g;
  });

  // ── agents ──
  type Bot = { g: THREE.Group; from: THREE.Vector3; to: THREE.Vector3; t: number; dur: number; wait: number; carry: THREE.Mesh; target: string };
  const spots: Record<string, THREE.Vector3> = {
    printer: new THREE.Vector3(5.6, 0, 4.9),
    vault: new THREE.Vector3(-4.3, 0, 4.4),
    graph: new THREE.Vector3(6.6, 0, 0.6),
    terminal: new THREE.Vector3(-6.9, 0, -1.6),
    center: new THREE.Vector3(0.2, 0, 0.1),
    garden: new THREE.Vector3(-6.4, 0, 1.4),
    screen: new THREE.Vector3(-1.2, 0, -4.2),
  };
  const botRand = rand(42);
  const bots: Bot[] = [0, 1, 2].map((i) => {
    const g = new THREE.Group();
    box(0.46, 0.4, 0.4, 0, 0.32, 0, mat(i === 1 ? C.orange : C.cream), g);
    box(0.4, 0.32, 0.36, 0, 0.7, 0, mat(C.slateLight), g);
    box(0.24, 0.07, 0.06, 0, 0.72, 0.2, mat(C.teal, C.teal, 1), g);
    box(0.05, 0.25, 0.05, 0, 1.0, 0, mat(C.ink), g);
    box(0.1, 0.1, 0.1, 0, 1.15, 0, mat(C.rust, C.rust, 0.6), g);
    box(0.12, 0.12, 0.12, -0.17, 0.06, 0, mat(C.ink), g);
    box(0.12, 0.12, 0.12, 0.17, 0.06, 0, mat(C.ink), g);
    const carry = box(0.36, 0.05, 0.42, 0, 0.56, 0.32, mat(C.paper), g);
    carry.visible = false;
    world.add(tag(g, "agents"));
    const start = [spots.printer, spots.center, spots.garden][i].clone();
    g.position.copy(start);
    return { g, from: start.clone(), to: start.clone(), t: 1, dur: 1, wait: i * 1.2, carry, target: ["printer", "center", "garden"][i] };
  });
  function nextTarget(b: Bot) {
    let next: string;
    if (b.target === "printer") { next = "vault"; b.carry.visible = true; }
    else if (b.target === "vault") { b.carry.visible = false; next = botRand() < 0.6 ? "printer" : "center"; }
    else {
      const keys = ["printer", "graph", "terminal", "center", "garden", "screen"].filter((k) => k !== b.target);
      next = keys[Math.floor(botRand() * keys.length)];
    }
    b.from.copy(b.g.position);
    b.to.copy(spots[next]).add(new THREE.Vector3((botRand() - 0.5) * 0.6, 0, (botRand() - 0.5) * 0.6));
    b.target = next;
    b.t = 0;
    b.dur = b.from.distanceTo(b.to) / 1.25;
    b.wait = 0.6 + botRand() * 1.6;
  }

  // ── pixel post pass ──
  const pass = new PixelPass(camera.near, camera.far);

  // ── day / night ──
  function setNight(night: boolean) {
    if (night) {
      pass.setSky(...SKY_NIGHT);
      cloudMats.forEach((m) => m.color.setHex(C.rock));
      pass.stars = true;
      hemi.intensity = 0.45; hemi.color.setHex(0x6d7fc4);
      sun.intensity = 0.7; sun.color.setHex(0x9fb4ff);
      lampLights.forEach((l) => (l.intensity = 6));
      lampHeads.forEach((h) => ((h.material as THREE.MeshLambertMaterial) = mat(C.gold, C.gold, 1.4)));
    } else {
      pass.setSky(...SKY_DAY);
      cloudMats.forEach((m) => m.color.setHex(0xffffff));
      pass.stars = false;
      hemi.intensity = 1.1; hemi.color.setHex(0xbfd9ff);
      sun.intensity = 2.4; sun.color.setHex(0xfff1d6);
      lampLights.forEach((l) => (l.intensity = 0));
      lampHeads.forEach((h) => ((h.material as THREE.MeshLambertMaterial) = mat(C.gold, C.gold, 0.2)));
    }
    renderer.shadowMap.needsUpdate = true;
    if (!running) render();
  }

  // ── sizing ──
  let w = 1, h = 1;
  function resize() {
    const r = container.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width / PIXEL));
    h = Math.max(1, Math.round(r.height / PIXEL));
    renderer.setSize(w, h, false);
    pass.setSize(w, h);
    const aspect = w / h;
    // Frame the island top; the rock underside may crop at the bottom.
    const viewH = Math.max(15.5, 21.5 / aspect);
    camera.left = (-viewH * aspect) / 2;
    camera.right = (viewH * aspect) / 2;
    camera.top = viewH / 2;
    camera.bottom = -viewH / 2;
    camera.updateProjectionMatrix();
    render();
  }

  // ── simulation ──
  const tmp = new THREE.Vector3();
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  let time = 0;
  let hovered: THREE.Object3D | null = null;

  function stageOf(s: number) {
    if (s < S_SEMTREE) return 0;
    if (s < S_GRAPH) return 1;
    if (s < S_CINE) return 2;
    return 3;
  }

  function step(dt: number) {
    time += dt;
    const speed = 1.1;
    const t = time;

    // belt slats
    for (let i = 0; i < SLATS; i++) {
      along(i * (L / SLATS) + t * speed, tmp);
      const s = ((i * (L / SLATS) + t * speed) % L + L) % L;
      const horizontal = s < 8 || (s > 12 && s < 20);
      mtx.compose(tmp.setY(0.235), q, horizontal ? new THREE.Vector3(0.14, 0.03, 0.8) : new THREE.Vector3(0.8, 0.03, 0.14));
      slats.setMatrixAt(i, mtx);
    }
    slats.instanceMatrix.needsUpdate = true;

    // packets
    for (const p of packets) {
      const s = (((p.offset + t * speed) % L) + L) % L;
      along(s, p.mesh.position);
      const stage = stageOf(s);
      p.mesh.material = stage === 0 && p.ts ? tsMat : stageMats[stage];
      // squeeze through the semtree ring, shrink into tokens after it
      const nearSem = Math.max(0, 1 - Math.abs(s - S_SEMTREE) / 0.9);
      const size = (stage === 0 ? 0.42 : stage === 1 ? 0.34 : stage === 2 ? 0.38 : 0.46) * (1 - nearSem * 0.35);
      p.mesh.scale.setScalar(size);
      p.mesh.position.y = 0.22 + size / 2;
      p.mesh.rotation.y = stage === 3 ? 0 : s * 0.6;
      if (Math.abs(s - S_SEMTREE) < 0.08) pulses.semtree = 1;
      if (Math.abs(s - S_GRAPH) < 0.08) pulses.codegraph = 1;
      if (Math.abs(s - S_CINE) < 0.08) pulses.cinecode = 1;
      if (s < 0.08) pulses.terminal = 1;
    }
    for (const k in pulses) pulses[k] = Math.max(0, pulses[k] - dt * 2.2);

    ring.rotation.x = t * (1.5 + pulses.semtree * 6);
    (semLight.material as THREE.MeshLambertMaterial) = mat(C.teal, C.teal, 0.3 + pulses.semtree * 1.5);

    // graph: a wave climbs the tower whenever a packet arrives
    nodeMats.forEach((m, i) => {
      const wave = Math.max(0, 1 - Math.abs(((t * 2.2) % 9) - i) * 0.9);
      m.emissiveIntensity = 0.08 + wave * 0.9 + pulses.codegraph * 0.6;
    });

    recLight.visible = Math.floor(t * 2) % 2 === 0;
    camBody.rotation.y = 0.15 + Math.sin(t * 0.7) * 0.25;

    dial.rotation.z = Math.sin(t * 0.9) * 2.4 + t * 0.3;
    lockLight.visible = Math.floor(t * 1.3) % 3 !== 0;

    // printer: sheets slide out every 3 s
    const cycle = (t % 3) / 3;
    sheet.position.z = 0.4 + Math.min(1, cycle * 1.6) * 0.55;
    sheet.visible = cycle < 0.85;

    // waterfall bits
    for (const b of bitSeeds) {
      const life = ((t * 0.5 + b.phase) % 3) / 3;
      const y = -life * life * 12 * (b.speed / 2.4);
      mtx.compose(tmp.set(b.x, y - 0.1, 6.15 + life * 0.6), q, one.clone().multiplyScalar(0.18 + (b.k % 3) * 0.05));
      bits.setMatrixAt(b.k, mtx);
    }
    bits.instanceMatrix.needsUpdate = true;

    clouds.forEach((c, i) => {
      c.position.x += dt * (0.25 + i * 0.08);
      if (c.position.x > 16) c.position.x = -16;
    });

    for (const b of bots) {
      if (b.t >= 1) {
        b.wait -= dt;
        b.g.position.y = 0;
        if (b.wait <= 0) nextTarget(b);
        continue;
      }
      b.t = Math.min(1, b.t + dt / b.dur);
      b.g.position.lerpVectors(b.from, b.to, b.t);
      b.g.position.y = Math.abs(Math.sin(b.t * b.dur * 9)) * 0.08 + (b.from.distanceTo(b.to) > 0 ? 0 : 0);
      const dx = b.to.x - b.from.x, dz = b.to.z - b.from.z;
      b.g.rotation.y = Math.atan2(dx, dz);
    }

    // mouse parallax: ease the yaw
    yaw += (yawTarget - yaw) * Math.min(1, dt * 3);

    termScreen.update(t);
    if (Math.floor(t * 10) !== Math.floor((t - dt) * 10)) film.update(t);
  }

  function render() {
    placeCamera();
    renderer.shadowMap.needsUpdate = true;
    pass.render(renderer, scene, camera);
  }

  // ── interaction ──
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function hotspotOf(o: THREE.Object3D | null): THREE.Object3D | null {
    while (o) {
      if (o.userData.hotspot) return o;
      o = o.parent;
    }
    return null;
  }
  function pick(e: PointerEvent): THREE.Object3D | null {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(pickables, true)[0];
    return hit ? hotspotOf(hit.object) : null;
  }
  function onMove(e: PointerEvent) {
    const r = canvas.getBoundingClientRect();
    yawTarget = Math.PI / 4 + ((e.clientX - r.left) / r.width - 0.5) * 0.18;
    const o = pick(e);
    if (o !== hovered) {
      hovered = o;
      canvas.style.cursor = o ? "pointer" : "";
    }
    opts.onHover?.(o ? { ...(o.userData.hotspot as Hotspot), x: e.clientX - r.left, y: e.clientY - r.top } : null);
    if (!running) render();
  }
  function onLeave() {
    hovered = null;
    yawTarget = Math.PI / 4;
    canvas.style.cursor = "";
    opts.onHover?.(null);
  }
  function onClick(e: PointerEvent) {
    const o = pick(e);
    if (o) opts.onClick?.(o.userData.hotspot as Hotspot);
  }
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("click", onClick as (e: Event) => void);

  // ── loop ──
  let running = false;
  let raf = 0;
  let last = 0;
  const animate = opts.animate ?? true;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    step(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  function setRunning(r: boolean) {
    r = r && animate;
    if (r === running) return;
    running = r;
    if (r) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    } else cancelAnimationFrame(raf);
  }

  // first frame: advance the sim a bit so everything is mid-motion
  step(0);
  for (let i = 0; i < 40; i++) step(0.05);
  film.update(time);
  setNight(!!opts.night);
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();
  setRunning(true);

  return {
    setNight,
    setRunning,
    destroy() {
      setRunning(false);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick as (e: Event) => void);
      pass.dispose();
      renderer.dispose();
    },
  };
}
