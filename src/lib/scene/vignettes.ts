// One tiny isometric diorama per project. Each builder gets a Kit (a
// floating plot of land plus a box of props) and returns an update(t)
// function that animates it. Everything is drawn through the same pixel
// pass as the hero island, so the whole site shares one art style.

import * as THREE from "three";
import { C, mat, box, bar, rand, screen, boxGeo } from "./pixel";

type Draw = (g: CanvasRenderingContext2D, t: number) => void;
type Opt = { y?: number; parent?: THREE.Object3D; ry?: number };

export type Vignette = {
  root: THREE.Group;
  update: (t: number) => void;
  lamps: THREE.PointLight[];
  glows: THREE.MeshLambertMaterial[];
  /** World units the view must show vertically / horizontally. */
  view: number;
  width: number;
  target: THREE.Vector3;
};

const P = {
  bg: "#0b0d17", panel: "#1b2033", line: "#2c3452", dim: "#4a5683", soft: "#7d8fc4",
  teal: "#5eead4", tealD: "#2a7a6b", rust: "#ce422b", orange: "#f08a4b", gold: "#ffd27a",
  cream: "#f4efe1", stone: "#b9b2a0", green: "#6f9e4f", greenD: "#2f5a33", ts: "#4a7fd4",
};

const geo = {
  cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
  hex: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
  ball: new THREE.IcosahedronGeometry(0.5, 1),
  cone: new THREE.ConeGeometry(0.5, 1, 8),
  ring: new THREE.TorusGeometry(0.5, 0.08, 6, 20),
  plane: new THREE.PlaneGeometry(1, 1),
};

// ── kit ──────────────────────────────────────────────────────────────────
class Kit {
  root = new THREE.Group();
  lamps: THREE.PointLight[] = [];
  glows: THREE.MeshLambertMaterial[] = [];
  private screens: { update: (t: number) => void; fps: number; last: number }[] = [];
  rnd: () => number;

  constructor(seed: number) {
    this.rnd = rand(seed);
  }

  m(c: number | THREE.Material) {
    return typeof c === "number" ? mat(c) : c;
  }

  /** A box with its bottom at `y`. */
  blk(w: number, h: number, d: number, x: number, z: number, c: number | THREE.Material, o: Opt = {}) {
    const b = box(w, h, d, x, (o.y ?? 0) + h / 2, z, this.m(c), o.parent ?? this.root);
    if (o.ry) b.rotation.y = o.ry;
    return b;
  }

  shape(g: THREE.BufferGeometry, sx: number, sy: number, sz: number, x: number, z: number, c: number | THREE.Material, o: Opt = {}) {
    const m = new THREE.Mesh(g, this.m(c));
    m.scale.set(sx, sy, sz);
    m.position.set(x, (o.y ?? 0) + sy / 2, z);
    if (o.ry) m.rotation.y = o.ry;
    m.castShadow = m.receiveShadow = true;
    (o.parent ?? this.root).add(m);
    return m;
  }
  cyl(r: number, h: number, x: number, z: number, c: number | THREE.Material, o: Opt = {}) {
    return this.shape(geo.cyl, r * 2, h, r * 2, x, z, c, o);
  }
  ball(r: number, x: number, y: number, z: number, c: number | THREE.Material, parent?: THREE.Object3D) {
    return this.shape(geo.ball, r * 2, r * 2, r * 2, x, z, c, { y: y - r, parent });
  }

  group(x = 0, y = 0, z = 0, parent?: THREE.Object3D) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    (parent ?? this.root).add(g);
    return g;
  }

  /** Emissive material that brightens at night. */
  glow(color: number, ei = 0.5) {
    const m = new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: ei });
    m.userData.base = ei;
    this.glows.push(m);
    return m;
  }

  /** The floating chunk of land every diorama stands on. */
  plot(w = 6, d = 6, top = C.grass, alt = C.grassDark, side = C.dirt) {
    const n = w * d;
    const tiles = new THREE.InstancedMesh(boxGeo, new THREE.MeshLambertMaterial(), n);
    tiles.receiveShadow = true;
    const mx = new THREE.Matrix4();
    const col = new THREE.Color();
    let i = 0;
    for (let x = 0; x < w; x++)
      for (let z = 0; z < d; z++) {
        const h = 0.4 + (this.rnd() < 0.1 ? 0.06 : 0);
        mx.compose(new THREE.Vector3(x - w / 2 + 0.5, h / 2 - 0.4, z - d / 2 + 0.5), new THREE.Quaternion(), new THREE.Vector3(1, h, 1));
        tiles.setMatrixAt(i, mx);
        tiles.setColorAt(i, col.setHex(this.rnd() < 0.2 ? alt : top));
        i++;
      }
    this.root.add(tiles);
    box(w, 0.6, d, 0, -0.7, 0, mat(side), this.root);
    const steps: [number, number][] = [[0.88, 0.9], [0.66, 0.9], [0.4, 0.9]];
    let y = -1;
    steps.forEach(([s, h], j) => {
      box(w * s, h, d * s, 0.15 * (j % 2 ? -1 : 1), y - h / 2, 0.1, mat(j % 2 ? C.rockDark : C.rock), this.root);
      y -= h;
    });
  }

  tree(x: number, z: number, s = 1) {
    this.blk(0.22 * s, 0.7 * s, 0.22 * s, x, z, C.trunk);
    this.blk(0.9 * s, 0.6 * s, 0.9 * s, x, z, C.leaf, { y: 0.6 * s });
    this.blk(0.6 * s, 0.45 * s, 0.6 * s, x, z, C.leafLight, { y: 1.15 * s });
  }
  bush(x: number, z: number) {
    this.blk(0.45, 0.3, 0.45, x, z, this.rnd() < 0.5 ? C.leaf : C.leafLight);
  }
  rock(x: number, z: number, s = 1) {
    this.blk(0.5 * s, 0.3 * s, 0.4 * s, x, z, C.stone, { ry: this.rnd() * 3 });
  }

  lamp(x: number, z: number, h = 1.6) {
    this.blk(0.08, h, 0.08, x, z, C.ink);
    const head = this.blk(0.22, 0.2, 0.22, x, z, this.glow(C.gold, 0.2), { y: h });
    const l = new THREE.PointLight(0xffd27a, 0, 4, 1.6);
    l.position.set(x, h + 0.1, z);
    this.root.add(l);
    this.lamps.push(l);
    return head;
  }

  /** Animated canvas texture, redrawn at `fps`. */
  scr(w: number, h: number, draw: Draw, fps = 8) {
    const s = screen(w, h, draw);
    this.screens.push({ update: s.update, fps, last: -1 });
    s.update(0);
    return new THREE.MeshBasicMaterial({ map: s.tex });
  }

  /** A flat panel showing a texture, facing +z (towards the viewer). */
  panel(w: number, h: number, x: number, y: number, z: number, m: THREE.Material, o: Opt = {}) {
    const p = new THREE.Mesh(geo.plane, m);
    p.scale.set(w, h, 1);
    p.position.set(x, y, z);
    if (o.ry) p.rotation.y = o.ry;
    (o.parent ?? this.root).add(p);
    return p;
  }

  /** Monitor on a stand. Faces +z unless rotated. */
  monitor(x: number, z: number, screenMat: THREE.Material, o: Opt & { w?: number; h?: number } = {}) {
    const w = o.w ?? 1.4, h = o.h ?? 0.9;
    const g = this.group(x, o.y ?? 0, z, o.parent);
    g.rotation.y = o.ry ?? 0;
    this.blk(0.5, 0.06, 0.3, 0, 0, C.ink, { parent: g });
    this.blk(0.1, 0.3, 0.1, 0, 0, C.ink, { parent: g });
    this.blk(w + 0.12, h + 0.12, 0.1, 0, 0, C.ink, { y: 0.3, parent: g });
    this.panel(w, h, 0, 0.3 + (h + 0.12) / 2, 0.052, screenMat, { parent: g });
    return g;
  }

  desk(x: number, z: number, w = 1.8, d = 0.9, c = C.trunk) {
    const top = 0.7;
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
      this.blk(0.08, top, 0.08, x + dx * (w / 2 - 0.08), z + dz * (d / 2 - 0.08), C.ink);
    this.blk(w, 0.08, d, x, z, c, { y: top });
    return top + 0.08;
  }

  bot(x: number, z: number, color = C.metal) {
    const g = this.group(x, 0, z);
    this.blk(0.4, 0.34, 0.32, 0, 0, color, { y: 0.12, parent: g });
    this.blk(0.3, 0.24, 0.26, 0, 0, color, { y: 0.48, parent: g });
    this.blk(0.2, 0.06, 0.02, 0, 0.13, this.glow(C.teal, 0.9), { y: 0.58, parent: g });
    this.blk(0.03, 0.18, 0.03, 0, 0, C.ink, { y: 0.72, parent: g });
    this.blk(0.07, 0.07, 0.07, 0, 0, C.rust, { y: 0.88, parent: g });
    this.blk(0.12, 0.12, 0.3, -0.13, 0, C.ink, { parent: g });
    this.blk(0.12, 0.12, 0.3, 0.13, 0, C.ink, { parent: g });
    return g;
  }

  sheet(x: number, y: number, z: number, parent?: THREE.Object3D, c = C.paper) {
    return box(0.5, 0.02, 0.66, x, y, z, mat(c), parent ?? this.root);
  }

  tick(t: number) {
    for (const s of this.screens) {
      const f = Math.floor(t * s.fps);
      if (f !== s.last) {
        s.last = f;
        s.update(t);
      }
    }
  }
}

// ── screen drawers ───────────────────────────────────────────────────────
const LINE_COLS = [P.teal, P.orange, P.soft, P.cream, P.gold, P.dim];

function codeLines(seed: number, n = 40) {
  const r = rand(seed);
  return Array.from({ length: n }, () => ({
    indent: Math.floor(r() * 3) * 2,
    parts: Array.from({ length: 1 + Math.floor(r() * 3) }, () => ({ w: 2 + Math.floor(r() * 7), c: LINE_COLS[Math.floor(r() * LINE_COLS.length)] })),
  }));
}

/** Scrolling, self-typing code. */
function drawCode(seed: number, bg = P.bg, speed = 2): Draw {
  const lines = codeLines(seed);
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const rows = Math.floor((H - 2) / 3);
    const typed = t * speed * 6;
    const lineIdx = Math.floor(typed / 12);
    const start = Math.max(0, lineIdx - rows + 1);
    for (let r = 0; r < rows; r++) {
      const li = start + r;
      if (li > lineIdx) break;
      const L = lines[li % lines.length];
      let x = 2 + L.indent;
      let budget = li === lineIdx ? typed % 12 : 99;
      for (const p of L.parts) {
        const w = Math.min(p.w, budget);
        if (w <= 0) break;
        g.fillStyle = p.c;
        g.fillRect(x, 2 + r * 3, w, 2);
        x += p.w + 1;
        budget -= p.w + 1;
      }
      if (li === lineIdx && Math.floor(t * 3) % 2) {
        g.fillStyle = P.cream;
        g.fillRect(x, 2 + r * 3, 1, 2);
      }
    }
  };
}

function drawTerm(seed: number): Draw {
  const r = rand(seed);
  const out = Array.from({ length: 30 }, () => ({ prompt: r() < 0.4, w: 4 + Math.floor(r() * 18), c: r() < 0.3 ? P.teal : P.stone }));
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.bg;
    g.fillRect(0, 0, W, H);
    const rows = Math.floor((H - 2) / 3);
    const n = Math.floor(t * 2.5);
    for (let i = 0; i < rows; i++) {
      const li = n - rows + 1 + i;
      if (li < 0) continue;
      const o = out[li % out.length];
      if (o.prompt) {
        g.fillStyle = P.orange;
        g.fillRect(2, 2 + i * 3, 2, 2);
      }
      g.fillStyle = o.c;
      g.fillRect(o.prompt ? 5 : 2, 2 + i * 3, Math.min(o.w, W - 6), 2);
    }
    if (Math.floor(t * 3) % 2) {
      g.fillStyle = P.teal;
      g.fillRect(2, H - 3, 2, 2);
    }
  };
}

function drawChart(): Draw {
  const r = rand(11);
  const vals: number[] = [];
  let v = 0.5;
  for (let i = 0; i < 200; i++) vals.push((v = Math.min(0.9, Math.max(0.1, v + (r() - 0.48) * 0.16))));
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.bg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = P.line;
    for (let y = 4; y < H; y += 6) g.fillRect(0, y, W, 1);
    const off = Math.floor(t * 4);
    for (let i = 0; i < W / 3; i++) {
      const a = vals[(off + i) % vals.length], b = vals[(off + i + 1) % vals.length];
      const up = b >= a;
      g.fillStyle = up ? P.teal : P.rust;
      const y0 = H - Math.max(a, b) * H, y1 = H - Math.min(a, b) * H;
      g.fillRect(1 + i * 3, y0, 2, Math.max(1, y1 - y0));
      g.fillRect(1 + i * 3 + 0.5, y0 - 2, 1, y1 - y0 + 4);
    }
  };
}

function drawDoc(seed: number, bg = P.cream, ink = P.dim, cols = 1): Draw {
  const r = rand(seed);
  const widths = Array.from({ length: 60 }, () => 0.5 + r() * 0.5);
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const colW = (W - 4 - (cols - 1) * 2) / cols;
    const shown = Math.floor(t * 6);
    let k = 0;
    for (let c = 0; c < cols; c++)
      for (let y = 3; y < H - 2; y += 3) {
        if (k > shown % 70) return;
        g.fillStyle = y === 3 && c === 0 ? P.rust : ink;
        g.fillRect(2 + c * (colW + 2), y, Math.floor(colW * widths[k++ % widths.length]), 1);
      }
  };
}

function drawKanban(seed: number, accent = P.teal): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.panel;
    g.fillRect(0, 0, W, H);
    const cw = Math.floor((W - 4) / 3);
    for (let c = 0; c < 3; c++) {
      g.fillStyle = P.line;
      g.fillRect(2 + c * cw, 2, cw - 2, H - 4);
      g.fillStyle = [P.orange, P.gold, accent][c];
      g.fillRect(2 + c * cw, 2, cw - 2, 2);
    }
    const r = rand(seed);
    const cards = Array.from({ length: 6 }, (_, i) => ({ col: i % 3, row: Math.floor(i / 3) + (r() < 0.5 ? 1 : 0) }));
    const phase = (t * 0.5) % 3;
    const moving = Math.floor(phase);
    cards.forEach((cd, i) => {
      let x = 3 + cd.col * cw;
      const y = 6 + cd.row * 6;
      if (i === moving) x += Math.min(1, (phase % 1) * 1.5) * cw * (cd.col < 2 ? 1 : -2);
      g.fillStyle = P.cream;
      g.fillRect(x, y, cw - 4, 4);
      g.fillStyle = [P.rust, P.ts, P.tealD][i % 3];
      g.fillRect(x, y, 1, 4);
    });
  };
}

function drawWave(): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.bg;
    g.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 2) {
      const a = Math.abs(Math.sin(x * 0.35 + t * 5) * Math.sin(x * 0.11 - t * 2)) * (H / 2 - 2);
      g.fillStyle = x < (t * 12) % W ? P.teal : P.dim;
      g.fillRect(x, H / 2 - a, 1, a * 2 + 1);
    }
  };
}

function drawGlyph(): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.bg;
    g.fillRect(0, 0, W, H);
    const code = Math.floor(t * 1.5) * 2654435761;
    const cx = W / 2, cy = H / 2;
    g.fillStyle = P.dim;
    for (let a = 0; a < 64; a++) g.fillRect(cx + Math.cos(a / 10.18) * 9, cy + Math.sin(a / 10.18) * 9, 1, 1);
    for (let i = 0; i < 16; i++) {
      if (!((code >>> i) & 1)) continue;
      const a = (i / 16) * Math.PI * 2;
      const rr = i % 2 ? 9 : 5;
      g.fillStyle = i % 3 ? P.teal : P.gold;
      g.fillRect(Math.round(cx + Math.cos(a) * rr) - 1, Math.round(cy + Math.sin(a) * rr) - 1, 2, 2);
    }
  };
}

function drawSplit(seed: number): Draw {
  const left = drawCode(seed, P.bg, 1.5);
  const right = drawDoc(seed + 1);
  return (g, t) => {
    const W = g.canvas.width;
    left(g, t);
    g.save();
    g.beginPath();
    g.rect(W / 2, 0, W / 2, g.canvas.height);
    g.clip();
    g.translate(W / 2, 0);
    right(g, t);
    g.restore();
    g.fillStyle = P.teal;
    g.fillRect(W / 2 - 1, 0, 1, g.canvas.height);
  };
}

function drawShop(): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.cream;
    g.fillRect(0, 0, W, H);
    g.fillStyle = P.rust;
    g.fillRect(0, 0, W, 3);
    const cols = [P.teal, P.orange, P.ts, P.gold, P.green, P.soft];
    for (let i = 0; i < 6; i++) {
      const x = 2 + (i % 3) * 10, y = 5 + Math.floor(i / 3) * 9;
      g.fillStyle = P.stone;
      g.fillRect(x, y, 8, 7);
      g.fillStyle = cols[(i + Math.floor(t)) % cols.length];
      g.fillRect(x + 2, y + 1, 4, 4);
    }
  };
}

function drawChat(): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = "#3fae4a";
    g.fillRect(0, 0, W, H);
    const n = Math.floor(t * 0.8);
    for (let i = 0; i < 3; i++) {
      const k = n - i;
      if (k < 0) continue;
      const right = k % 2 === 1;
      const w = 10 + ((k * 7) % 10);
      const y = H - 7 - i * 7;
      g.fillStyle = right ? P.ts : P.cream;
      g.fillRect(right ? W - w - 2 : 2, y, w, 5);
    }
  };
}

function drawVim(seed: number): Draw {
  const code = drawCode(seed, "#11141f", 1.2);
  return (g, t) => {
    code(g, t);
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.green;
    g.fillRect(0, H - 3, 8, 3);
    g.fillStyle = P.line;
    g.fillRect(8, H - 3, W - 8, 3);
    g.fillStyle = P.dim;
    for (let y = 2; y < H - 3; y += 3) g.fillRect(0, y, 1, 2);
  };
}

function drawGraph(seed: number): Draw {
  const r = rand(seed);
  const nodes = Array.from({ length: 9 }, () => [r(), r()] as const);
  const edges = Array.from({ length: 12 }, () => [Math.floor(r() * 9), Math.floor(r() * 9)] as const);
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.bg;
    g.fillRect(0, 0, W, H);
    const hot = Math.floor(t * 2) % 9;
    const px = (i: number) => [3 + nodes[i][0] * (W - 6), 3 + nodes[i][1] * (H - 6)];
    for (const [a, b] of edges) {
      const [x0, y0] = px(a), [x1, y1] = px(b);
      g.fillStyle = a === hot || b === hot ? P.gold : P.line;
      for (let s = 0; s <= 1; s += 0.08) g.fillRect(Math.round(x0 + (x1 - x0) * s), Math.round(y0 + (y1 - y0) * s), 1, 1);
    }
    nodes.forEach((_, i) => {
      const [x, y] = px(i);
      g.fillStyle = i === hot ? P.gold : P.teal;
      g.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
    });
  };
}

function drawCurve(): Draw {
  return (g, t) => {
    const W = g.canvas.width, H = g.canvas.height;
    g.fillStyle = P.panel;
    g.fillRect(0, 0, W, H);
    const ease = (u: number) => u * u * (3 - 2 * u);
    g.fillStyle = P.dim;
    for (let x = 2; x < W - 2; x++) g.fillRect(x, H - 3, 1, 1);
    for (let x = 0; x <= W - 6; x++) {
      const u = x / (W - 6);
      g.fillStyle = P.orange;
      g.fillRect(3 + x, Math.round(H - 3 - ease(u) * (H - 6)), 1, 1);
    }
    const u = (Math.sin(t * 1.5) + 1) / 2;
    g.fillStyle = P.teal;
    g.fillRect(2 + u * (W - 6), Math.round(H - 4 - ease(u) * (H - 6)), 3, 3);
  };
}

// ── shared builders reused by several projects ───────────────────────────
function workstation(k: Kit, seed: number, draw: Draw, x = 0, z = 0) {
  const top = k.desk(x, z, 1.9, 0.9);
  k.monitor(x, z - 0.15, k.scr(32, 20, draw), { y: top });
  k.blk(0.8, 0.04, 0.26, x - 0.1, z + 0.28, C.slate, { y: top });
  k.cyl(0.08, 0.16, x + 0.7, z + 0.25, C.cream, { y: top });
  void seed;
  return top;
}

function kanbanBoard(k: Kit, seed: number, accent: number, x = 0, z = -1) {
  k.blk(0.12, 1.6, 0.12, x - 1.3, z, C.ink);
  k.blk(0.12, 1.6, 0.12, x + 1.3, z, C.ink);
  k.blk(2.8, 1.5, 0.08, x, z, C.slate, { y: 0.5 });
  const cards: THREE.Mesh[] = [];
  const colsX = [-0.85, 0, 0.85];
  const r = rand(seed);
  for (let i = 0; i < 6; i++) {
    const c = k.blk(0.6, 0.28, 0.04, x + colsX[i % 3], z + 0.06, i % 3 === 2 ? accent : C.cream, { y: 1.55 - 0.38 * (Math.floor(i / 3) + 1) - r() * 0.05 });
    cards.push(c);
  }
  for (let i = 0; i < 3; i++) k.blk(0.7, 0.08, 0.05, x + colsX[i], z + 0.06, [C.orange, C.gold, accent][i], { y: 1.82 });
  return (t: number) => {
    const ph = (t * 0.4) % 3;
    const c = cards[Math.floor(ph)];
    const u = Math.min(1, (ph % 1) * 1.6);
    const from = colsX[Math.floor(ph) % 3];
    c.position.x = x + from + (u < 1 ? Math.sin(u * Math.PI) * 0.1 : 0) + (Math.floor(ph) < 2 ? u * 0.85 : -u * 1.7);
    c.position.z = z + 0.06 + Math.sin(u * Math.PI) * 0.25;
    cards.forEach((cc, i) => {
      if (cc !== c) cc.position.x = x + colsX[i % 3];
    });
  };
}

function minesweeper(k: Kit, hex: boolean, seed: number) {
  const r = rand(seed);
  const tiles: { m: THREE.Mesh; open: number; mine: boolean }[] = [];
  const N = 5;
  for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++) {
      const x = (i - (N - 1) / 2) * (hex ? 0.92 : 0.9) + (hex && j % 2 ? 0.46 : 0);
      const z = (j - (N - 1) / 2) * (hex ? 0.8 : 0.9);
      const m = hex
        ? k.shape(geo.hex, 0.9, 0.3, 0.9, x, z, C.slateLight, { ry: Math.PI / 6 })
        : k.blk(0.82, 0.3, 0.82, x, z, C.slateLight);
      tiles.push({ m, open: r() * 12, mine: r() < 0.12 });
    }
  const flag = k.group(tiles[7].m.position.x, 0.3, tiles[7].m.position.z);
  k.blk(0.04, 0.6, 0.04, 0, 0, C.ink, { parent: flag });
  k.blk(0.3, 0.2, 0.03, 0.15, 0, C.rust, { y: 0.38, parent: flag });
  const mineMat = k.glow(C.rust, 0.2);
  return (t: number) => {
    const cyc = t % 12;
    for (const tl of tiles) {
      const open = cyc > tl.open;
      tl.m.scale.y = open ? 0.12 : 0.3;
      tl.m.position.y = tl.m.scale.y / 2;
      tl.m.material = open ? (tl.mine ? mineMat : mat(C.stone)) : mat(C.slateLight);
    }
    mineMat.emissiveIntensity = 0.3 + Math.abs(Math.sin(t * 6)) * 0.8;
  };
}

function storefront(k: Kit, awning: number, wall: number, x = 0, z = -0.8) {
  k.blk(3.4, 2, 1.8, x, z, wall);
  k.blk(3.6, 0.12, 2, x, z, C.slate, { y: 2 });
  for (let i = 0; i < 6; i++) k.blk(0.6, 0.12, 0.7, x - 1.5 + i * 0.6, z + 1.1, i % 2 ? C.cream : awning, { y: 1.55 });
  k.blk(0.7, 1.2, 0.05, x - 0.9, z + 0.91, C.trunk);
  k.panel(1.4, 0.8, x + 0.6, 0.95, z + 0.92, new THREE.MeshLambertMaterial({ color: 0x7d8fc4, emissive: 0x2c3452 }));
}

function polish(k: Kit, x: number, z: number, c: number, parent?: THREE.Object3D) {
  k.cyl(0.13, 0.3, x, z, c, { parent });
  k.cyl(0.05, 0.18, x, z, C.ink, { y: 0.3, parent });
}

function bookOpen(k: Kit, x: number, z: number, y = 0, s = 1) {
  const g = k.group(x, y, z);
  k.blk(2 * s, 0.08, 1.3 * s, 0, 0, C.trunk, { parent: g });
  const left = k.blk(0.95 * s, 0.06, 1.2 * s, -0.5 * s, 0, C.paper, { y: 0.08, parent: g });
  left.rotation.z = 0.08;
  const right = k.blk(0.95 * s, 0.06, 1.2 * s, 0.5 * s, 0, C.paper, { y: 0.08, parent: g });
  right.rotation.z = -0.08;
  const pivot = k.group(0, 0.16, 0, g);
  const page = k.blk(0.92 * s, 0.02, 1.15 * s, 0.47 * s, 0, C.cream, { parent: pivot });
  void page;
  return (t: number) => {
    const u = (t * 0.5) % 2;
    pivot.rotation.z = u < 1 ? Math.min(1, u * 1.4) * Math.PI * 0.98 : 0;
    pivot.visible = u < 1;
  };
}

// ── the projects ─────────────────────────────────────────────────────────
type Builder = (k: Kit) => ((t: number) => void) | void;

const B: Record<string, Builder> = {
  // Syntax tree: nodes light up root → leaves as an edit reparses.
  semtree(k) {
    k.plot(6, 6);
    const nodes: THREE.Mesh[][] = [];
    const levels = [[0], [-1.2, 1.2], [-1.8, -0.6, 0.6, 1.8]];
    const ys = [2.6, 1.7, 0.8];
    const mOff = mat(C.slateLight);
    const mOn = k.glow(C.teal, 0.8);
    levels.forEach((xs, li) => {
      nodes.push(xs.map((x) => k.blk(0.42, 0.42, 0.42, x, 0, mOff, { y: ys[li] })));
    });
    k.blk(0.26, 2.6, 0.26, 0, 0, C.trunk);
    levels.slice(1).forEach((xs, li) =>
      xs.forEach((x, i) => {
        const p = levels[li][Math.floor(i / 2)];
        bar(new THREE.Vector3(p, ys[li] + 0.1, 0), new THREE.Vector3(x, ys[li + 1] + 0.3, 0), 0.08, mat(C.trunk), k.root);
      }),
    );
    for (const x of levels[2]) k.blk(0.06, 0.8, 0.06, x, 0, C.trunk);
    k.bush(-2.2, 1.8); k.bush(2.3, -2); k.rock(2, 2);
    const leaf = k.blk(0.3, 0.3, 0.3, 0, 0, C.orange, { y: 3.4 });
    return (t) => {
      const cyc = t % 4;
      const target = 1 + (Math.floor(t / 4) % 4);
      leaf.position.set(levels[2][target - 1] * Math.min(1, cyc), 3.6 - Math.min(1, cyc) * 2.4, 0.4);
      leaf.visible = cyc < 1.2;
      const path = [0, Math.floor((target - 1) / 2), target - 1];
      nodes.forEach((row, li) => row.forEach((n, i) => (n.material = cyc > 1 + li * 0.35 && cyc < 3 && path[li] === i ? mOn : mOff)));
    };
  },

  // Code graph tower + MCP plug, pulse climbing the nodes.
  "adaptive-codegraph"(k) {
    k.plot(6, 6, C.stone, C.sand);
    const pts: THREE.Vector3[] = [];
    const r = rand(5);
    for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3((r() - 0.5) * 2.6, 0.5 + i * 0.4, (r() - 0.5) * 2.6));
    const ms = pts.map(() => new THREE.MeshLambertMaterial({ color: C.teal, emissive: C.teal, emissiveIntensity: 0.1 }));
    pts.forEach((p, i) => {
      const n = new THREE.Mesh(boxGeo, ms[i]);
      n.scale.setScalar(0.38);
      n.position.copy(p);
      n.castShadow = true;
      k.root.add(n);
      if (i) bar(pts[i - 1], p, 0.06, mat(C.metal), k.root);
      if (i > 2 && i % 2) bar(pts[i - 3], p, 0.05, mat(C.slateLight), k.root);
    });
    k.blk(0.5, 0.5, 0.5, 2.1, 1.9, C.ink);
    k.blk(0.12, 0.2, 0.12, 2.0, 1.9, C.gold, { y: 0.5 });
    k.blk(0.12, 0.2, 0.12, 2.2, 1.9, C.gold, { y: 0.5 });
    bar(new THREE.Vector3(2.1, 0.3, 1.6), pts[0], 0.07, mat(C.ink), k.root);
    k.bot(-2, 1.8);
    return (t) => ms.forEach((m, i) => (m.emissiveIntensity = Math.max(0.1, 1.2 - Math.abs(((t * 3) % 10) - i) * 0.6)));
  },

  // Neo4j-ish database cylinder feeding a graph on a big screen.
  codegraph(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    for (let i = 0; i < 3; i++) k.cyl(0.7, 0.45, -1.5, -1, i % 2 ? C.teal : C.tealDark, { y: i * 0.5 });
    k.cyl(0.7, 0.05, -1.5, -1, C.cream, { y: 1.5 });
    k.monitor(0.9, -1.2, k.scr(32, 22, drawGraph(3)), { w: 2, h: 1.3 });
    const vec = k.group(-1.5, 2, -1);
    for (let i = 0; i < 5; i++) k.blk(0.16, 0.16, 0.16, Math.cos(i) * 0.6, i * 0.12, Math.sin(i) * 0.6, k.glow(C.gold, 0.6), { parent: vec });
    k.tree(2.2, 1.8, 0.9); k.bush(-2.3, 2);
    k.lamp(0, 2.2, 1.2);
    return (t) => (vec.rotation.y = t * 0.8);
  },

  // Film set: a camera on a dolly track films a screen that types code;
  // spotlight, clapperboard, director's chair and film cans.
  cinecode(k) {
    k.plot(6, 6, C.stone, C.sand);
    // stage floor
    k.blk(5, 0.06, 2.6, 0, -1.4, C.slate);
    const film = k.scr(40, 24, drawCode(9, P.bg, 3));
    k.blk(3.4, 2.1, 0.12, -0.3, -2.45, C.ink, { y: 0.55 });
    k.panel(3.2, 1.9, -0.3, 1.6, -2.38, film);
    k.blk(0.1, 0.55, 0.1, -1.8, -2.45, C.ink);
    k.blk(0.1, 0.55, 0.1, 1.2, -2.45, C.ink);
    // dolly track
    for (const z of [0.7, 1.2]) k.blk(4.6, 0.06, 0.08, 0, z, C.metal);
    for (let i = 0; i < 8; i++) k.blk(0.12, 0.04, 0.8, -2.1 + i * 0.6, 0.95, C.trunk);
    const dolly = k.group(0, 0.06, 0.95);
    k.blk(0.8, 0.18, 0.7, 0, 0, C.ink, { parent: dolly });
    k.blk(0.12, 0.9, 0.12, 0, 0, C.ink, { y: 0.18, parent: dolly });
    const head = k.group(0, 1.25, 0, dolly);
    k.blk(0.55, 0.45, 0.8, 0, 0, C.rust, { parent: head });
    k.blk(0.56, 0.08, 0.81, 0, 0, C.ink, { y: 0.15, parent: head });
    const lens = k.cyl(0.18, 0.4, 0, -0.55, C.ink, { y: -0.18, parent: head });
    lens.rotation.x = Math.PI / 2;
    lens.position.y = 0.22;
    const reels = [k.cyl(0.26, 0.08, 0, 0.0, C.slateLight, { y: 0.45, parent: head }), k.cyl(0.26, 0.08, 0, 0.42, C.slateLight, { y: 0.45, parent: head })];
    reels.forEach((r) => (r.rotation.x = Math.PI / 2));
    const rec = k.blk(0.08, 0.08, 0.04, 0.2, 0.41, k.glow(C.rust, 1.2), { y: 0.3, parent: head });
    head.rotation.y = 0;
    // spotlight on a stand, aimed at the screen
    k.blk(0.08, 1.8, 0.08, 2.3, -0.9, C.ink);
    const spot = k.group(2.3, 1.85, -0.9);
    k.cyl(0.2, 0.4, 0, 0, C.ink, { y: -0.2, parent: spot }).rotation.x = Math.PI / 2;
    k.blk(0.3, 0.3, 0.04, 0, -0.22, k.glow(C.gold, 1), { y: -0.15, parent: spot });
    spot.rotation.y = 0.9;
    const beam = new THREE.PointLight(0xffd27a, 3, 5, 1.4);
    beam.position.set(1.8, 1.8, -1.4);
    k.root.add(beam);
    // clapperboard
    const clap = k.group(-2.2, 0, 2.1);
    k.blk(0.7, 0.45, 0.06, 0, 0, C.ink, { parent: clap });
    k.blk(0.6, 0.06, 0.065, 0, 0, C.cream, { y: 0.2, parent: clap });
    const arm = k.group(-0.35, 0.47, 0, clap);
    k.blk(0.7, 0.1, 0.06, 0.35, 0, C.cream, { parent: arm });
    clap.rotation.y = 0.5;
    // director's chair
    const chair = k.group(1.9, 0, 2.1);
    for (const [x, z] of [[-0.25, -0.2], [0.25, -0.2], [-0.25, 0.2], [0.25, 0.2]]) k.blk(0.06, 0.55, 0.06, x, z, C.trunk, { parent: chair });
    k.blk(0.6, 0.05, 0.45, 0, 0, C.rust, { y: 0.5, parent: chair });
    k.blk(0.6, 0.35, 0.05, 0, -0.22, C.rust, { y: 0.6, parent: chair });
    chair.rotation.y = 2.4;
    // film cans
    for (let i = 0; i < 3; i++) k.cyl(0.25, 0.08, -2.3 + (i % 2) * 0.1, 0.2, i % 2 ? C.metal : C.slateLight, { y: i * 0.09 });
    return (t) => {
      reels.forEach((r, i) => (r.rotation.y = t * (i ? 3 : -3)));
      (rec.material as THREE.MeshLambertMaterial).emissiveIntensity = Math.floor(t * 2) % 2 ? 1.4 : 0.1;
      arm.rotation.z = t % 4 < 0.2 ? 0 : 0.5;
      dolly.position.x = Math.sin(t * 0.35) * 1.6;
      head.rotation.y = Math.sin(t * 0.35) * 0.3;
    };
  },

  "cinecode-docs"(k) {
    k.plot(6, 6, C.stone, C.sand);
    const top = k.desk(0, -0.2, 2.6, 1.6);
    const flip = bookOpen(k, 0, -0.2, top);
    for (let i = 0; i < 4; i++) k.blk(0.3, 0.9 + i * 0.1, 0.7, -2.2 + i * 0.32, -2, [C.rust, C.teal, C.gold, C.ts][i]);
    k.lamp(1.8, -1.6, 1.5);
    k.tree(2, 1.9, 0.8);
    return flip;
  },

  // Sentinel: a watchtower with a sweeping beam, guarding a coding bot.
  sentinel(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    for (const [x, z] of [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]]) k.blk(0.14, 2.4, 0.14, x - 1, z - 1, C.ink);
    k.blk(1.5, 0.15, 1.5, -1, -1, C.trunk, { y: 2.4 });
    k.blk(1.1, 0.7, 1.1, -1, -1, C.slateLight, { y: 2.55 });
    k.blk(1.3, 0.12, 1.3, -1, -1, C.rust, { y: 3.25 });
    const beam = k.group(-1, 2.95, -1);
    const eye = k.blk(0.3, 0.24, 0.3, 0, 0, k.glow(C.gold, 1.4), { parent: beam });
    eye.position.y = 0;
    const cone = new THREE.Mesh(geo.cone, new THREE.MeshBasicMaterial({ color: 0xffd27a, transparent: true, opacity: 0.35, depthWrite: false }));
    cone.scale.set(1.2, 3, 1.2);
    cone.rotation.z = Math.PI / 2;
    cone.position.x = 1.6;
    beam.add(cone);
    const top = workstation(k, 2, drawTerm(4), 1.3, 1.2);
    void top;
    const b = k.bot(0.5, 2.1);
    b.rotation.y = Math.PI;
    k.lamp(2.4, -2.2, 1.3);
    return (t) => {
      beam.rotation.y = t * 0.9;
      b.position.y = Math.abs(Math.sin(t * 6)) * 0.04;
    };
  },

  // Continual learning: a bot waters a sapling that keeps growing.
  continuum(k) {
    k.plot(6, 6);
    const tree = k.group(0.2, 0, -0.3);
    k.blk(0.25, 1.4, 0.25, 0, 0, C.trunk, { parent: tree });
    k.blk(1.3, 0.8, 1.3, 0, 0, C.leaf, { y: 1.2, parent: tree });
    k.blk(0.9, 0.6, 0.9, 0, 0, C.leafLight, { y: 1.9, parent: tree });
    const fruit = [0, 1, 2].map((i) => k.blk(0.16, 0.16, 0.16, Math.cos(i * 2) * 0.66, Math.sin(i * 2) * 0.66, k.glow(C.gold, 0.6), { y: 1.5, parent: tree }));
    const b = k.bot(-1.4, 0.9);
    b.rotation.y = 0.6;
    const can = k.blk(0.2, 0.2, 0.3, 0.2, -0.2, C.teal, { y: 0.4, parent: b });
    const drops = [0, 1, 2].map(() => k.blk(0.06, 0.1, 0.06, 0, 0, C.teal));
    k.rock(2.2, 2); k.bush(-2.3, -2.1); k.bush(2.2, -2.3);
    return (t) => {
      const g = 0.35 + ((t * 0.12) % 1) * 0.75;
      tree.scale.setScalar(g);
      fruit.forEach((f, i) => (f.visible = g > 0.7 + i * 0.1));
      can.rotation.x = Math.sin(t * 2) * 0.2 - 0.2;
      drops.forEach((d, i) => {
        const u = (t * 1.5 + i / 3) % 1;
        d.position.set(-0.9 + u * 0.4, 0.55 - u * 0.5, 0.5 - u * 0.3);
      });
    };
  },

  // AVIL: a verify loop — plan, build, verify, improve around a track.
  avil(k) {
    k.plot(6, 6, C.stone, C.sand);
    const stations = [[-1.5, -1.5, C.ts], [1.5, -1.5, C.orange], [1.5, 1.5, C.teal], [-1.5, 1.5, C.gold]] as const;
    stations.forEach(([x, z, c]) => {
      k.blk(0.8, 0.5, 0.8, x, z, C.slate);
      k.blk(0.5, 0.3, 0.5, x, z, c, { y: 0.5 });
    });
    for (let i = 0; i < 4; i++) {
      const [x0, z0] = stations[i], [x1, z1] = stations[(i + 1) % 4];
      bar(new THREE.Vector3(x0, 0.1, z0), new THREE.Vector3(x1, 0.1, z1), 0.16, mat(C.slateLight), k.root);
    }
    k.blk(1.6, 1.1, 0.08, 0, -2.4, C.greenDark, { y: 0.6 });
    const board = k.scr(28, 18, drawDoc(7, "#2f5a33", P.cream, 2));
    k.panel(1.5, 1, 0, 1.15, -2.35, board);
    const token = k.blk(0.3, 0.3, 0.3, 0, 0, k.glow(C.cream, 0.8), { y: 0.25 });
    const check = k.blk(0.2, 0.2, 0.2, 1.5, 1.5, k.glow(C.teal, 1), { y: 1.1 });
    return (t) => {
      const u = (t * 0.35) % 4;
      const i = Math.floor(u), f = u - i;
      const [x0, z0] = stations[i], [x1, z1] = stations[(i + 1) % 4];
      token.position.set(x0 + (x1 - x0) * f, 0.25 + Math.abs(Math.sin(f * Math.PI)) * 0.3, z0 + (z1 - z0) * f);
      token.rotation.y = t * 2;
      check.visible = i === 2;
      check.position.y = 1 + Math.sin(t * 4) * 0.08;
    };
  },

  // Infinite canvas of linked cards.
  "mosaicflow-svelte"(k) {
    k.plot(6, 6, C.cream, C.stone, C.trunk);
    const cards: THREE.Group[] = [];
    const spots = [[-1.6, -1.4], [0.4, -1.8], [1.8, -0.2], [-0.4, 0.4], [-1.9, 1.4], [1.1, 1.7]];
    const cols = [C.teal, C.orange, C.ts, C.gold, C.rust, C.leafLight];
    spots.forEach(([x, z], i) => {
      const g = k.group(x, 0.05, z);
      k.blk(1, 0.12, 0.7, 0, 0, C.paper, { parent: g });
      k.blk(1, 0.13, 0.16, 0, -0.27, cols[i], { parent: g });
      k.blk(0.6, 0.14, 0.06, -0.1, 0.05, C.stone, { parent: g });
      k.blk(0.4, 0.14, 0.06, -0.2, 0.2, C.stone, { parent: g });
      cards.push(g);
    });
    const wires: THREE.Mesh[] = [];
    const links = [[0, 3], [1, 3], [3, 2], [3, 4], [2, 5], [4, 5]];
    const wm = mat(C.slateLight);
    for (let i = 0; i < links.length; i++) {
      const w = new THREE.Mesh(boxGeo, wm);
      k.root.add(w);
      wires.push(w);
    }
    const a = new THREE.Vector3(), b = new THREE.Vector3();
    return (t) => {
      cards.forEach((c, i) => {
        c.position.y = 0.08 + Math.max(0, Math.sin(t * 1.2 + i * 1.7)) * 0.35;
      });
      links.forEach(([i, j], n) => {
        a.copy(cards[i].position).setY(cards[i].position.y + 0.08);
        b.copy(cards[j].position).setY(cards[j].position.y + 0.08);
        const w = wires[n];
        w.scale.set(0.05, 0.05, a.distanceTo(b));
        w.position.copy(a).add(b).multiplyScalar(0.5);
        w.lookAt(b);
      });
    };
  },

  // Vault with a spinning dial, a key floating above.
  pskey(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    k.blk(2.2, 2.2, 1.6, -0.2, -0.8, C.metal);
    k.blk(2.3, 0.15, 1.7, -0.2, -0.8, C.slateLight, { y: 2.2 });
    k.blk(1.6, 1.6, 0.08, -0.2, 0.02, C.slateLight, { y: 0.3 });
    const dial = k.group(-0.2, 1.1, 0.12);
    k.cyl(0.35, 0.1, 0, 0, C.ink, { parent: dial }).rotation.x = Math.PI / 2;
    k.blk(0.08, 0.3, 0.04, 0, 0.08, C.gold, { y: 0, parent: dial });
    for (const y of [0.6, 1.6]) k.blk(0.18, 0.25, 0.1, 0.65, 0.08, C.ink, { y });
    const key = k.group(1.7, 1.6, 1.2);
    k.shape(geo.ring, 0.55, 0.55, 0.55, 0, 0, k.glow(C.gold, 0.5), { parent: key, y: -0.27 });
    k.blk(0.7, 0.1, 0.1, 0.6, 0, C.gold, { parent: key });
    k.blk(0.08, 0.2, 0.1, 0.8, 0, C.gold, { y: -0.2, parent: key });
    k.blk(0.08, 0.15, 0.1, 0.95, 0, C.gold, { y: -0.15, parent: key });
    k.lamp(-2.3, 1.8, 1.4);
    return (t) => {
      dial.rotation.z = Math.sin(t * 1.3) * 2.4;
      key.position.y = 1.5 + Math.sin(t * 2) * 0.15;
      key.rotation.y = t * 0.7;
    };
  },

  // PDF reader: a lectern with a page-turning book.
  cahier(k) {
    k.plot(6, 6, C.trunk, C.dirt, C.rockDark);
    const top = k.desk(0, -0.2, 2.6, 1.6, C.slateLight);
    const flip = bookOpen(k, 0, -0.2, top);
    const lamp = k.group(1.1, top, -0.7);
    k.blk(0.06, 0.8, 0.06, 0, 0, C.ink, { parent: lamp });
    k.blk(0.35, 0.15, 0.25, -0.15, 0, k.glow(C.gold, 0.6), { y: 0.75, parent: lamp });
    for (let i = 0; i < 5; i++) k.sheet(-2 + i * 0.03, 0.03 + i * 0.03, 1.8, undefined, i % 2 ? C.paper : C.cream);
    k.bush(2.2, 2.1);
    return flip;
  },

  // Printer that pulls text columns out of a PDF.
  spdf(k) {
    k.plot(6, 6);
    k.blk(1.8, 1, 1.3, -0.8, -0.8, C.metal);
    k.blk(1.2, 0.06, 0.7, -0.8, -0.8, C.ink, { y: 1 });
    k.blk(0.2, 0.08, 0.06, -0.2, -0.13, k.glow(C.teal, 1), { y: 0.75 });
    const sheet = k.group(-0.8, 0.55, -0.1);
    k.sheet(0, 0, 0, sheet);
    for (let i = 0; i < 4; i++) box(0.18, 0.02, 0.03, -0.1, 0.02, -0.2 + i * 0.12, mat(C.slateLight), sheet);
    for (let i = 0; i < 4; i++) box(0.18, 0.02, 0.03, 0.12, 0.02, -0.2 + i * 0.12, mat(C.slateLight), sheet);
    const stacks = [k.group(1, 0, 1.2), k.group(1.8, 0, 0.6)];
    stacks.forEach((s, j) => {
      for (let i = 0; i < 6; i++) box(0.5, 0.06, 0.4, 0, 0.03 + i * 0.07, 0, mat(j ? C.teal : C.cream), s);
    });
    const fly = k.blk(0.18, 0.04, 0.4, 0, 0, C.teal, { y: 0.6 });
    k.tree(2.2, -2, 0.9);
    k.bot(-2.1, 1.6);
    return (t) => {
      const u = (t * 0.6) % 1;
      sheet.position.z = -0.1 + u * 0.7;
      sheet.position.y = 0.55 - u * 0.1;
      const f = (t * 0.6 + 0.5) % 1;
      fly.position.set(-0.6 + f * 2.2, 0.6 + Math.sin(f * Math.PI) * 0.6, 0.3 + f * 0.6);
    };
  },

  // Markdown editor: desk with raw / rendered split screen.
  rmd(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    const top = k.desk(0, -0.4, 2.4, 1);
    k.monitor(0, -0.6, k.scr(40, 22, drawSplit(21)), { y: top, w: 2, h: 1.1 });
    k.blk(1, 0.04, 0.3, 0, 0, C.slate, { y: top });
    k.tree(-2.2, 1.9, 0.9); k.bush(2.2, 2);
    k.lamp(2.3, -1.8, 1.3);
  },

  // Wayland compositor: windows floating over a zoomable grid.
  canvaswm(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const grid = mat(C.slateLight);
    for (let i = -2; i <= 2; i++) {
      box(5.6, 0.02, 0.04, 0, 0.01, i * 1.2, grid, k.root);
      box(0.04, 0.02, 5.6, i * 1.2, 0.01, 0, grid, k.root);
    }
    const wins: THREE.Group[] = [];
    const specs = [[-1.4, 0.9, -1.2, 1.6, 1, drawCode(31)], [0.9, 1.4, -0.8, 1.4, 0.9, drawTerm(32)], [-0.2, 0.6, 1, 1.2, 0.8, drawGraph(33)]] as const;
    specs.forEach(([x, y, z, w, h, d]) => {
      const g = k.group(x, y, z);
      k.blk(w + 0.08, h + 0.2, 0.06, 0, 0, C.ink, { parent: g });
      k.blk(w + 0.08, 0.14, 0.07, 0, 0, C.teal, { y: h + 0.06, parent: g });
      k.panel(w, h, 0, (h + 0.06) / 2, 0.035, k.scr(Math.round(w * 18), Math.round(h * 18), d), { parent: g });
      wins.push(g);
    });
    return (t) => wins.forEach((w, i) => {
      w.position.y = specs[i][1] + Math.sin(t * 0.9 + i * 2) * 0.12;
      w.position.x = specs[i][0] + Math.sin(t * 0.4 + i) * 0.15;
    });
  },

  // Magnifying glass scanning letter blocks.
  "fuzzy-search-rs"(k) {
    k.plot(6, 6, C.sand, C.stone);
    const blocks: THREE.Mesh[] = [];
    const cols = [C.cream, C.cream, C.cream, C.stone];
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 4; j++) blocks.push(k.blk(0.5, 0.4 + ((i * 7 + j * 3) % 4) * 0.1, 0.5, -1.6 + i * 0.8, -1.2 + j * 0.8, cols[(i + j) % 4]));
    const hit = k.glow(C.gold, 0.8);
    const glass = k.group(0, 1.4, 0);
    k.shape(geo.ring, 1, 1, 1, 0, 0, C.ink, { parent: glass, y: -0.5 }).rotation.x = Math.PI / 2;
    const lens = new THREE.Mesh(geo.cyl, new THREE.MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.35, depthWrite: false }));
    lens.scale.set(0.9, 0.02, 0.9);
    glass.add(lens);
    k.blk(0.12, 0.12, 0.9, 0, 0.7, C.trunk, { parent: glass, y: -0.06 });
    return (t) => {
      const gx = Math.sin(t * 0.7) * 1.4, gz = Math.sin(t * 1.1) * 1.0;
      glass.position.set(gx, 1.4, gz);
      blocks.forEach((b, i) => {
        const d = Math.hypot(b.position.x - gx, b.position.z - gz);
        b.material = d < 0.45 ? hit : mat(cols[(Math.floor(i / 4) + (i % 4)) % 4]);
      });
    };
  },

  // Keyboard-driven mouse: keys press, a cursor jumps on a grid.
  fkbr(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    k.blk(3.4, 0.2, 1.4, 0, 0.6, C.ink);
    const keys: THREE.Mesh[] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 8; c++) keys.push(k.blk(0.34, 0.16, 0.34, -1.4 + c * 0.4 + r * 0.1, 0.2 + r * 0.4, (r * 8 + c) % 7 === 0 ? C.teal : C.cream, { y: 0.2 }));
    const grid = k.group(0, 0, -1.8);
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 2; j++) box(0.7, 0.04, 0.5, -1.2 + i * 0.8, 0.02, -0.3 + j * 0.6, mat(C.slateLight), grid);
    const cur = k.group(0, 0.4, -1.8);
    const cm = k.glow(C.orange, 0.8);
    k.blk(0.12, 0.08, 0.4, 0, 0, cm, { parent: cur });
    k.blk(0.3, 0.08, 0.12, 0.1, -0.15, cm, { parent: cur });
    return (t) => {
      const n = Math.floor(t * 2);
      keys.forEach((kk, i) => (kk.position.y = 0.2 + 0.08 - (i === (n * 5) % 24 ? 0.06 : 0)));
      const r = rand(n)();
      cur.position.x += ((-1.2 + Math.floor(r * 4) * 0.8) - cur.position.x) * 0.2;
      cur.position.z += ((-2.1 + (n % 2) * 0.6) - cur.position.z) * 0.2;
    };
  },

  polymine(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    return minesweeper(k, true, 4);
  },

  // Rotating glyph sigils on plinths.
  hexglyph(k) {
    k.plot(6, 6, C.stone, C.sand);
    const rings: THREE.Group[] = [];
    [[-1.3, -0.8], [1.3, -0.8], [0, 1.2]].forEach(([x, z], i) => {
      k.cyl(0.4, 0.5, x, z, C.slate);
      const g = k.group(x, 1.4, z);
      k.shape(geo.ring, 1.2, 1.2, 1.2, 0, 0, i === 1 ? C.gold : C.teal, { parent: g, y: -0.6 });
      for (let d = 0; d < 6; d++) {
        const a = (d / 6) * Math.PI * 2 + i;
        if ((i * 13 + d * 7) % 3) k.blk(0.14, 0.14, 0.14, Math.cos(a) * 0.6, 0, k.glow(C.orange, 0.5), { y: Math.sin(a) * 0.6 - 0.07, parent: g });
      }
      rings.push(g);
    });
    k.monitor(0, -2.1, k.scr(22, 22, drawGlyph()), { w: 1, h: 1 });
    return (t) => rings.forEach((r, i) => (r.rotation.y = t * (0.6 + i * 0.2)));
  },

  // Futures: 3D candles marching across the plot + a ticker screen.
  quantrs(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const N = 8;
    const candles = Array.from({ length: N }, (_, i) => k.blk(0.32, 1, 0.32, -2.1 + i * 0.6, 0.6, C.teal));
    const wicks = Array.from({ length: N }, (_, i) => k.blk(0.06, 1, 0.06, -2.1 + i * 0.6, 0.6, C.ink));
    k.monitor(-0.8, -1.8, k.scr(32, 20, drawChart()), { w: 1.6, h: 1 });
    k.monitor(1.3, -1.8, k.scr(32, 20, drawChart()), { w: 1.4, h: 1, ry: -0.3 });
    const r = rand(17);
    const series: number[] = [];
    let v = 1.2;
    for (let i = 0; i < 64; i++) series.push((v = Math.max(0.4, Math.min(2.2, v + (r() - 0.5) * 0.6))));
    return (t) => {
      const off = Math.floor(t * 1.5);
      candles.forEach((c, i) => {
        const a = series[(off + i) % 64], b = series[(off + i + 1) % 64];
        const lo = Math.min(a, b), hi = Math.max(a, b);
        c.scale.y = Math.max(0.08, hi - lo);
        c.position.y = lo + c.scale.y / 2;
        c.material = mat(b >= a ? C.teal : C.rust);
        wicks[i].scale.y = hi - lo + 0.4;
        wicks[i].position.y = lo - 0.2 + wicks[i].scale.y / 2;
      });
    };
  },

  // Microphone + waveform turning into text.
  "whisper-asr-cli-rs"(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    k.cyl(0.35, 0.06, -1.4, 0.2, C.ink);
    k.blk(0.06, 1.3, 0.06, -1.4, 0.2, C.ink);
    k.shape(geo.ball, 0.4, 0.55, 0.4, -1.4, 0.2, C.metal, { y: 1.3 });
    const bars = Array.from({ length: 9 }, (_, i) => k.blk(0.16, 1, 0.16, -0.6 + i * 0.26, 0.2, C.teal, { y: 0.6 }));
    k.monitor(1.3, -1.6, k.scr(30, 18, drawTerm(8)), { w: 1.4, h: 0.85 });
    k.tree(-2.2, -2, 0.9);
    k.lamp(2.3, 1.9, 1.2);
    return (t) => bars.forEach((b, i) => {
      b.scale.y = 0.15 + Math.abs(Math.sin(t * 5 + i * 0.7) * Math.sin(t * 1.3 + i)) * 1.1;
      b.position.y = 0.6 + Math.sin(i - t * 2) * 0.05;
    });
  },

  // Chessboard with pieces gliding.
  minichess(k) {
    k.plot(6, 6, C.trunk, C.dirt, C.rockDark);
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) box(0.7, 0.06, 0.7, -1.75 + i * 0.7, 0.03, -1.75 + j * 0.7, mat((i + j) % 2 ? C.ink : C.cream), k.root);
    const pieces: THREE.Group[] = [];
    const piece = (x: number, z: number, white: boolean, tall: number) => {
      const g = k.group(x, 0.06, z);
      const c = white ? C.cream : C.slate;
      k.cyl(0.22, 0.12, 0, 0, c, { parent: g });
      k.cyl(0.12, 0.3 + tall, 0, 0, c, { y: 0.12, parent: g });
      k.ball(0.14, 0, 0.5 + tall, 0, c, g);
      pieces.push(g);
    };
    piece(-1.05, 1.05, true, 0.3); piece(0.35, 1.75, true, 0); piece(1.05, 0.35, true, 0.15);
    piece(-0.35, -1.05, false, 0.3); piece(1.05, -1.75, false, 0); piece(-1.75, -0.35, false, 0.15);
    const home = pieces.map((p) => p.position.clone());
    return (t) => {
      const n = Math.floor(t / 1.6) % pieces.length;
      const u = Math.min(1, (t % 1.6) / 0.8);
      pieces.forEach((p, i) => p.position.copy(home[i]));
      const p = pieces[n];
      const dz = n < 3 ? -0.7 : 0.7;
      p.position.z = home[n].z + dz * (n % 2 ? 1 - u : u);
      p.position.y = 0.06 + Math.sin(u * Math.PI) * 0.4;
    };
  },

  // Boot-to-Minecraft: blocky terrain, ore, a pickaxe swinging.
  mineos(k) {
    k.plot(6, 6);
    const r = rand(42);
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 6; j++) {
        const h = Math.floor(r() * 3);
        for (let y = 0; y < h; y++) k.blk(1, 0.5, 1, -2.5 + i, -2.5 + j, y === h - 1 ? C.grass : C.dirt, { y: y * 0.5 });
        if (i > 3 && j < 2 && h === 0) k.blk(0.4, 0.3, 0.4, -2.5 + i, -2.5 + j, k.glow(C.teal, 0.6));
      }
    k.tree(-2.5, 2.5, 1);
    const pick = k.group(1.5, 0.6, 1.5);
    k.blk(0.08, 0.08, 0.9, 0, 0, C.trunk, { parent: pick });
    k.blk(0.7, 0.1, 0.1, 0, 0, C.metal, { y: 0, parent: pick }).position.z = -0.45;
    return (t) => (pick.rotation.x = -0.6 + Math.abs(Math.sin(t * 3)) * 1.2);
  },

  // Bare-metal OS: a CPU die with pins, kernel layers stacking up.
  zigos(k) {
    k.plot(6, 6, C.deep, C.tealDark, C.rockDark);
    k.blk(2.6, 0.3, 2.6, 0, 0, C.ink);
    for (let i = 0; i < 6; i++)
      for (const s of [-1, 1]) {
        k.blk(0.12, 0.08, 0.5, -1 + i * 0.4, s * 1.5, C.gold);
        k.blk(0.5, 0.08, 0.12, s * 1.5, -1 + i * 0.4, C.gold);
      }
    const layers = [C.orange, C.gold, C.teal, C.cream].map((c, i) => k.blk(1.8 - i * 0.35, 0.22, 1.8 - i * 0.35, 0, 0, c, { y: 0.3 + i * 0.25 }));
    const spark = k.blk(0.14, 0.14, 0.14, 0, 0, k.glow(C.gold, 1.2), { y: 1.6 });
    return (t) => {
      const n = Math.floor(t * 1.2) % 6;
      layers.forEach((l, i) => (l.visible = i < n));
      spark.position.y = 1.3 + Math.sin(t * 4) * 0.2;
      spark.rotation.y = t * 3;
    };
  },

  // Locked-down kiosk stand.
  "tauri-kiosk"(k) {
    k.plot(6, 6, C.stone, C.sand);
    k.blk(1, 1.2, 0.6, 0, -0.4, C.slate);
    k.blk(1.3, 1.8, 0.2, 0, -0.5, C.ink, { y: 1.2 });
    k.panel(1.1, 1.5, 0, 2.1, -0.39, k.scr(18, 26, drawShop()));
    const lock = k.group(1.4, 0.4, 0.8);
    k.blk(0.6, 0.5, 0.25, 0, 0, C.gold, { parent: lock });
    const shackle = k.shape(geo.ring, 0.45, 0.6, 0.45, 0, 0, C.metal, { parent: lock, y: 0.3 });
    k.bot(-1.6, 1.2);
    k.lamp(-2.2, -2, 1.4);
    return (t) => {
      shackle.position.y = 0.6 + (Math.floor(t / 2) % 2 ? 0.12 : 0);
      lock.rotation.y = Math.sin(t) * 0.3;
    };
  },

  // Node editor + timeline with a moving playhead.
  monax(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const nodes = [[-1.6, -1.2], [0, -1.6], [1.5, -0.6], [-0.4, 0.2]];
    const ns = nodes.map(([x, z], i) => k.blk(0.9, 0.3, 0.6, x, z, [C.ts, C.orange, C.teal, C.gold][i]));
    [[0, 3], [1, 2], [3, 2]].forEach(([a, b]) => bar(ns[a].position.clone().setY(0.2), ns[b].position.clone().setY(0.2), 0.06, mat(C.cream), k.root));
    k.blk(4.4, 0.1, 0.5, 0, 1.8, C.ink);
    for (let i = 0; i < 6; i++) k.blk(0.12, 0.2, 0.12, -1.8 + i * 0.75, 1.8, C.gold, { y: 0.1, ry: Math.PI / 4 });
    const head = k.blk(0.06, 0.6, 0.6, 0, 1.8, k.glow(C.rust, 1));
    return (t) => {
      head.position.x = -2.1 + ((t * 0.8) % 4.2);
      ns.forEach((n, i) => (n.position.y = 0.15 + (Math.floor(t * 1.3) % 4 === i ? 0.15 : 0)));
    };
  },

  // Monaco code studio with a film strip.
  kodex(k) {
    k.plot(6, 6, C.stone, C.sand);
    workstation(k, 41, drawCode(41, P.panel, 2.5), 0, -0.5);
    const strip = k.group(0, 0.3, 1.4);
    const frames: THREE.Mesh[] = [];
    for (let i = 0; i < 7; i++) frames.push(k.blk(0.5, 0.06, 0.5, -1.8 + i * 0.6, 0, i % 2 ? C.ink : C.slate, { parent: strip }));
    k.lamp(2.3, -2.2, 1.3);
    return (t) => frames.forEach((f, i) => (f.position.x = ((-1.8 + i * 0.6 + t * 0.5 + 2.1) % 4.2) - 2.1));
  },

  // Tiny language: frames stacking like a call stack.
  framescript(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    const frames = Array.from({ length: 5 }, (_, i) => k.blk(1.6 - i * 0.15, 0.25, 1.2 - i * 0.1, -0.8, -0.6, [C.ts, C.teal, C.gold, C.orange, C.cream][i], { y: i * 0.3 }));
    k.monitor(1.4, -1.6, k.scr(26, 18, drawCode(51)), { w: 1.2, h: 0.8 });
    k.tree(2.1, 1.8, 0.9); k.bush(-2.2, 2);
    return (t) => {
      const n = Math.floor(t * 1.5) % 10;
      const depth = n < 5 ? n + 1 : 10 - n;
      frames.forEach((f, i) => (f.visible = i < depth));
    };
  },

  // Generative AI: a bot conjuring a floating crystal, prompts orbiting.
  genai(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    k.cyl(0.6, 0.4, 0, 0, C.stone);
    const crystal = k.shape(new THREE.OctahedronGeometry(0.5, 0), 0.8, 1.2, 0.8, 0, 0, k.glow(C.teal, 0.7), { y: 1 });
    const orbit = k.group(0, 1.6, 0);
    for (let i = 0; i < 4; i++) k.blk(0.3, 0.2, 0.05, Math.cos(i * 1.57) * 1.2, Math.sin(i * 1.57) * 1.2, C.cream, { parent: orbit, ry: -i * 1.57 });
    k.bot(-1.8, 1.4).rotation.y = 0.8;
    k.bot(1.6, 1.8, C.stone).rotation.y = -0.6;
    k.tree(-2.2, -2, 0.8);
    return (t) => {
      crystal.rotation.y = t;
      crystal.position.y = 1.6 + Math.sin(t * 2) * 0.12;
      orbit.rotation.y = -t * 0.6;
    };
  },

  // Local-first snippets: a sandbox with code blocks to dig up.
  sandcode(k) {
    k.plot(6, 6, C.grass, C.grassDark);
    k.blk(3.4, 0.25, 3.4, -0.2, -0.2, C.trunk);
    k.blk(3, 0.3, 3, -0.2, -0.2, C.sand, { y: 0.05 });
    const blocks = [[-1, -0.8, C.orange], [0.5, -1, C.ts], [-0.4, 0.6, C.teal], [0.8, 0.5, C.gold]] as const;
    const ms = blocks.map(([x, z, c]) => k.blk(0.5, 0.3, 0.4, x, z, c, { y: 0.2 }));
    const bucket = k.group(1.9, 0, 1.9);
    k.cyl(0.25, 0.4, 0, 0, C.rust, { parent: bucket });
    const shovel = k.group(-0.4, 0.8, 0.6);
    k.blk(0.06, 0.06, 0.8, 0, 0, C.trunk, { parent: shovel });
    k.blk(0.3, 0.04, 0.3, 0, 0, C.metal, { y: -0.02, parent: shovel }).position.z = 0.5;
    return (t) => {
      ms.forEach((m, i) => (m.position.y = 0.2 + Math.max(0, Math.sin(t * 0.9 + i * 1.6)) * 0.3));
      shovel.rotation.x = Math.sin(t * 3) * 0.4 + 0.5;
    };
  },

  // Capture: sticky notes popping onto a wall.
  kadoo(k) {
    k.plot(6, 6, C.stone, C.sand);
    k.blk(3.6, 2, 0.15, 0, -2, C.cream);
    const notes = Array.from({ length: 8 }, (_, i) => k.blk(0.6, 0.5, 0.04, -1.3 + (i % 4) * 0.85, -1.9, [C.gold, C.teal, C.orange, C.leafLight][i % 4], { y: 0.3 + Math.floor(i / 4) * 0.8 }));
    workstation(k, 61, drawTerm(61), 0.4, 0.8);
    return (t) => notes.forEach((n, i) => (n.scale.setScalar(Math.min(1, Math.max(0, ((t * 1.5) % 12) - i)))));
  },

  landmine(k) {
    k.plot(6, 6);
    return minesweeper(k, false, 9);
  },

  // Computer vision: a camera eye tracks a bot with a bounding box.
  recog(k) {
    k.plot(6, 6);
    const eye = k.group(-1.8, 1.4, -1.8);
    k.blk(0.08, 1.4, 0.08, 0, 0, C.ink, { y: -1.4, parent: eye });
    k.blk(0.6, 0.4, 0.4, 0, 0, C.slate, { parent: eye });
    k.cyl(0.14, 0.2, 0, 0.25, C.teal, { parent: eye }).rotation.x = Math.PI / 2;
    const b = k.bot(0, 0, C.orange);
    const frame = k.group(0, 0, 0);
    const fm = k.glow(C.teal, 1);
    for (const [x, z, w, d] of [[0, -0.35, 0.8, 0.05], [0, 0.35, 0.8, 0.05], [-0.4, 0, 0.05, 0.75], [0.4, 0, 0.05, 0.75]]) {
      k.blk(w, 0.05, d, x, z, fm, { y: 1.05, parent: frame });
      k.blk(w, 0.05, d, x, z, fm, { y: 0.02, parent: frame });
    }
    for (const [x, z] of [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]]) k.blk(0.05, 1, 0.05, x, z, fm, { parent: frame });
    k.tree(2.2, -2, 0.9); k.rock(-2, 2); k.bush(2.3, 2.2);
    return (t) => {
      b.position.set(Math.sin(t * 0.6) * 1.4, 0, Math.sin(t * 0.9) * 1.2);
      b.rotation.y = Math.atan2(Math.cos(t * 0.6) * 0.84, Math.cos(t * 0.9) * 1.08);
      frame.position.copy(b.position);
      fm.emissiveIntensity = Math.floor(t * 3) % 2 ? 1 : 0.4;
      eye.lookAt(b.position.x, 1.4, b.position.z);
    };
  },

  // 90+ tools on a pegboard.
  "ae-reach"(k) {
    k.plot(6, 6, C.trunk, C.dirt, C.rockDark);
    k.blk(4, 2.4, 0.12, 0, -2.2, C.sand);
    const tools: THREE.Mesh[] = [];
    const r = rand(77);
    for (let i = 0; i < 18; i++) {
      const x = -1.7 + (i % 6) * 0.68, y = 0.4 + Math.floor(i / 6) * 0.7;
      tools.push(k.blk(0.12 + r() * 0.3, 0.3 + r() * 0.3, 0.06, x, -2.1, [C.rust, C.metal, C.teal, C.gold, C.ts][i % 5], { y }));
    }
    k.blk(1.6, 0.8, 0.9, 0.6, 0.8, C.rust);
    k.blk(1.6, 0.15, 0.9, 0.6, 0.8, C.orange, { y: 0.8 });
    k.bot(-1.6, 1).rotation.y = -0.5;
    return (t) => tools.forEach((tl, i) => (tl.rotation.z = Math.floor(t * 2) % 18 === i ? Math.sin(t * 20) * 0.2 : 0));
  },

  // Easing curve: a ball rides a bezier made of blocks.
  "ae-curves-panel"(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const ease = (u: number) => u * u * (3 - 2 * u);
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      k.blk(0.26, 0.12, 0.3, -2 + u * 4, 0, i % 2 ? C.orange : C.gold, { y: ease(u) * 2.2 });
    }
    for (const [x, y] of [[-2, 0], [2, 2.2]]) k.blk(0.2, 0.2, 0.2, x, 0, C.cream, { y: y + 0.1 });
    bar(new THREE.Vector3(-2, 0.2, 0), new THREE.Vector3(-0.6, 0.2, 0), 0.04, mat(C.cream), k.root);
    bar(new THREE.Vector3(2, 2.4, 0), new THREE.Vector3(0.6, 2.4, 0), 0.04, mat(C.cream), k.root);
    const ball = k.ball(0.22, 0, 0.5, 0.35, k.glow(C.teal, 0.7));
    k.monitor(0.8, -2, k.scr(28, 18, drawCurve()), { w: 1.3, h: 0.85 });
    return (t) => {
      const u = (Math.sin(t * 1.2) + 1) / 2;
      ball.position.set(-2 + u * 4, ease(u) * 2.2 + 0.35, 0.35);
    };
  },

  kan(k) {
    k.plot(6, 6);
    const run = kanbanBoard(k, 1, C.teal, 0, -1.2);
    k.tree(-2.2, 1.8, 0.9); k.bush(2.2, 2);
    k.bot(1, 1.2).rotation.y = Math.PI;
    return run;
  },
  ekan(k) {
    k.plot(6, 6, C.stone, C.sand);
    const top = k.desk(0, -0.3, 2.6, 1.1);
    k.monitor(0, -0.5, k.scr(38, 22, drawKanban(2, P.ts)), { y: top, w: 2.1, h: 1.2 });
    k.lamp(-2.2, -2, 1.3); k.bush(2.2, 2);
  },
  rekan(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const cols = [-1.4, 0, 1.4];
    cols.forEach((x, i) => k.blk(1.1, 0.12, 3.6, x, 0, [C.orange, C.gold, C.teal][i]));
    const cards = Array.from({ length: 6 }, (_, i) => k.blk(0.8, 0.12, 0.5, cols[i % 3], -1.2 + Math.floor(i / 3) * 0.8, C.cream, { y: 0.12 }));
    return (t) => {
      const ph = (t * 0.4) % 3;
      const c = cards[Math.floor(ph)];
      const u = Math.min(1, (ph % 1) * 1.5);
      cards.forEach((cc, i) => {
        cc.position.x = cols[i % 3];
        cc.position.y = 0.18;
      });
      const from = cols[Math.floor(ph) % 3];
      const to = cols[(Math.floor(ph) + 1) % 3];
      c.position.x = from + (to - from) * u;
      c.position.y = 0.18 + Math.sin(u * Math.PI) * 0.6;
    };
  },

  // Laravel storefront with shoppers.
  simpless(k) {
    k.plot(6, 6, C.stone, C.sand);
    storefront(k, C.rust, C.cream);
    const cart = k.group(0, 0, 1.4);
    k.blk(0.6, 0.35, 0.4, 0, 0, C.metal, { y: 0.2, parent: cart });
    k.blk(0.2, 0.2, 0.2, -0.1, 0, C.orange, { y: 0.5, parent: cart });
    k.blk(0.2, 0.15, 0.2, 0.15, 0, C.teal, { y: 0.5, parent: cart });
    for (const [x, z] of [[-1.6, 1.8], [1.9, 1.6]]) for (let i = 0; i < 2; i++) k.blk(0.45, 0.4, 0.45, x + i * 0.1, z, C.sand, { y: i * 0.4 });
    return (t) => {
      cart.position.x = Math.sin(t * 0.7) * 1.4;
      cart.rotation.y = Math.cos(t * 0.7) > 0 ? 0 : Math.PI;
    };
  },

  // Secure clinic messaging: building with a cross and signal waves.
  laravel_vue_twilio(k) {
    k.plot(6, 6);
    k.blk(2.6, 2.2, 2, -0.6, -0.8, C.cream);
    k.blk(2.8, 0.15, 2.2, -0.6, -0.8, C.slate, { y: 2.2 });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) k.blk(0.4, 0.4, 0.05, -1.4 + i * 0.8, 0.22, C.metal, { y: 0.5 + j * 0.8 });
    const cross = k.glow(C.rust, 0.6);
    k.blk(0.6, 0.18, 0.1, -0.6, 0.24, cross, { y: 2.45 });
    k.blk(0.18, 0.6, 0.1, -0.6, 0.24, cross, { y: 2.24 });
    k.blk(0.1, 1.6, 0.1, 1.8, -1.4, C.ink, { y: 2.2 - 2.2 });
    const waves = [0, 1, 2].map(() => k.shape(geo.ring, 0.5, 0.5, 0.5, 1.8, -1.4, k.glow(C.teal, 0.8), { y: 1.45 }));
    waves.forEach((w) => (w.rotation.x = Math.PI / 2));
    k.tree(2, 1.8, 0.9);
    return (t) => waves.forEach((w, i) => {
      const u = (t * 0.8 + i / 3) % 1;
      w.scale.setScalar(0.3 + u * 1.6);
      w.visible = u < 0.9;
    });
  },

  rockdiva(k) {
    k.plot(6, 6, C.stone, C.sand);
    storefront(k, C.rust, C.ink);
    const bottles = [C.rust, C.orange, C.gold, C.teal, C.ts];
    bottles.forEach((c, i) => polish(k, -1.6 + i * 0.6, 1.5, c));
    const spark = k.blk(0.15, 0.15, 0.15, 0, 0, k.glow(C.gold, 1.2), { y: 2.6 });
    return (t) => {
      spark.position.set(Math.sin(t * 2) * 1.4, 2.4 + Math.sin(t * 5) * 0.1, -0.2);
      spark.rotation.y = t * 4;
    };
  },
  blingnails(k) {
    k.plot(6, 6, C.cream, C.stone, C.trunk);
    const top = k.desk(-0.2, -0.4, 2.4, 1.1, C.cream);
    const bottles = [C.rust, C.gold, C.teal, C.orange, C.ts, C.leafLight];
    const bs = bottles.map((c, i) => {
      const g = k.group(-1.1 + i * 0.36, top, -0.5);
      polish(k, 0, 0, c, g);
      return g;
    });
    k.monitor(1.7, -1.6, k.scr(20, 28, drawShop()), { w: 0.8, h: 1.1 });
    k.lamp(-2.2, 1.8, 1.3);
    return (t) => bs.forEach((b, i) => (b.position.y = top + (Math.floor(t * 2) % 6 === i ? 0.15 : 0)));
  },

  "make-the-docs"(k) {
    k.plot(6, 6, C.stone, C.sand);
    const top = k.desk(0, -0.4, 2.6, 1.1, C.rust);
    k.monitor(0, -0.6, k.scr(40, 22, drawSplit(71)), { y: top, w: 2.1, h: 1.15 });
    for (let i = 0; i < 4; i++) k.sheet(1.9, 0.03 + i * 0.03, 1.6);
    k.tree(-2.1, 1.8, 0.9);
  },
  "make-the-doc-vue"(k) {
    k.plot(6, 6);
    const top = k.desk(0, -0.4, 2.6, 1.1);
    k.monitor(0, -0.6, k.scr(40, 22, drawSplit(72)), { y: top, w: 2.1, h: 1.15 });
    k.shape(geo.cone, 0.6, 0.5, 0.6, -2, 1.8, C.leafLight, { ry: 0 }).rotation.x = Math.PI;
    k.bush(2.2, 1.8);
    k.lamp(2.2, -2, 1.3);
  },

  // Unit converter: a phone next to a tank whose level rises and falls.
  "fluid-converter"(k) {
    k.plot(6, 6, C.stone, C.sand);
    k.blk(1.1, 2, 0.2, -1, -0.8, C.ink);
    k.panel(0.95, 1.75, -1, 1.05, -0.69, k.scr(14, 26, drawCurve()));
    const tank = k.group(1.1, 0, -0.4);
    k.blk(1.2, 0.12, 1.2, 0, 0, C.slate, { parent: tank });
    const water = k.blk(1, 1, 1, 0, 0, C.ts, { y: 0.12, parent: tank });
    const glass = new THREE.Mesh(boxGeo, new THREE.MeshBasicMaterial({ color: 0xf4efe1, transparent: true, opacity: 0.18, depthWrite: false }));
    glass.scale.set(1.15, 1.9, 1.15);
    glass.position.y = 1.07;
    tank.add(glass);
    const drop = k.ball(0.14, 1.1, 2.6, -0.4, C.teal);
    return (t) => {
      const lvl = 0.4 + (Math.sin(t * 0.8) + 1) * 0.6;
      water.scale.y = lvl;
      water.position.y = 0.12 + lvl / 2;
      const u = (t * 0.9) % 1;
      drop.position.y = 2.6 - u * (2.6 - lvl);
    };
  },

  // Neovim: late-night desk, vim on screen, coffee steaming.
  "neovim-config"(k) {
    k.plot(6, 6, C.slateLight, C.slate, C.rockDark);
    const top = k.desk(0, -0.4, 2.4, 1.1, C.ink);
    k.monitor(-0.3, -0.6, k.scr(38, 22, drawVim(81)), { y: top, w: 1.9, h: 1.1 });
    k.blk(1, 0.05, 0.3, -0.3, 0, C.slate, { y: top });
    k.cyl(0.1, 0.18, 0.75, -0.1, C.rust, { y: top });
    const steam = [0, 1, 2].map((i) => k.blk(0.05, 0.05, 0.05, 0.75, -0.1, C.cream, { y: top + 0.3 + i * 0.15 }));
    k.lamp(-2.2, -2, 1.5);
    k.bush(2.2, 2);
    return (t) => steam.forEach((s, i) => {
      const u = (t * 0.6 + i / 3) % 1;
      s.position.y = top + 0.2 + u * 0.6;
      s.position.x = 0.75 + Math.sin(u * 6 + i) * 0.06;
      s.visible = u < 0.85;
    });
  },

  // Green screen with chat bubbles.
  "custom-greenscreen-chat"(k) {
    k.plot(6, 6, C.stone, C.sand);
    k.blk(3.6, 2.4, 0.1, 0, -2.2, C.ink);
    k.panel(3.4, 2.2, 0, 1.2, -2.14, k.scr(40, 26, drawChat()));
    const cam = k.group(1.4, 0, 1.4);
    k.blk(0.06, 1.1, 0.06, 0, 0, C.ink, { parent: cam });
    k.blk(0.4, 0.3, 0.5, 0, 0, C.ink, { y: 1.1, parent: cam });
    cam.rotation.y = -2.5;
    k.lamp(-2.2, 1.6, 1.6);
    k.blk(0.3, 0.3, 0.3, -2.2, 1.6, k.glow(C.cream, 0.4), { y: 1.5 });
  },
};

/** Fallback for projects without a dedicated scene: a workstation. */
function generic(k: Kit, seed: number) {
  k.plot(6, 6);
  workstation(k, seed, drawCode(seed), 0, -0.5);
  k.tree(-2.2, 1.9, 0.9);
  k.bot(1.6, 1.4);
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function hasVignette(slug: string) {
  return slug in B;
}

export function buildVignette(slug: string): Vignette {
  const k = new Kit(hash(slug));
  const b = B[slug];
  const run = b ? b(k) : generic(k, hash(slug));
  return {
    root: k.root,
    lamps: k.lamps,
    glows: k.glows,
    view: 7.6,
    width: 11,
    target: new THREE.Vector3(0, 0.7, 0),
    update(t) {
      run?.(t);
      k.tick(t);
    },
  };
}
