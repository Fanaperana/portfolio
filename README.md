<div align="center">

<img src="public/favicon.svg" width="72" alt="Fanaperana" />

# `~/fanaperana` &nbsp;·&nbsp; Portfolio

**Systems tinkerer · Rust · TypeScript · agentic AI, tiny shells, and interesting OSes.**

A handwritten, open-source portfolio site that doubles as a live demo: a real pipeline shell
written in **Rust**, compiled to **WebAssembly**, embedded in a **Svelte 5 + Vite** app, and
driven from an in-page terminal you can actually type into.

<sub>If you're a recruiter or hiring manager — this repo *is* the portfolio. Browse the site, or
read on.</sub>

<br />

[![Rust](https://img.shields.io/badge/Rust-stable-CE422B?style=for-the-badge&logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-wasm--pack-654FF0?style=for-the-badge&logo=webassembly&logoColor=white)](https://rustwasm.github.io/wasm-pack/)
[![Svelte 5](https://img.shields.io/badge/Svelte-5_runes-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-5eead4?style=for-the-badge)](#license)

[![GitHub followers](https://img.shields.io/github/followers/Fanaperana?label=follow&style=social)](https://github.com/Fanaperana)
[![GitHub stars](https://img.shields.io/github/stars/Fanaperana?style=social&label=stars)](https://github.com/Fanaperana)
[![Available for hire](https://img.shields.io/badge/status-available_for_hire-22c55e?style=flat-square)](mailto:fanaperanaprince@gmail.com)

</div>

---

## TL;DR

- **Who:** Fanaperana — software engineer focused on Rust, TypeScript, and agentic AI.
- **What I like:** low-level tools, tiny languages, unusual operating systems, beautiful terminals,
  node-based editors, and everything that blurs the line between desktop app and web.
- **What this repo is:** the source of the portfolio site itself. No template, no headless CMS — a
  Rust → WASM mini-shell driving a Svelte 5 frontend.
- **Hiring?** Scroll to [Looking for work](#looking-for-work--contact).

---

## What this site is

- A handwritten portfolio — no template, no headless CMS.
- An **in-browser terminal** where `help`, `ls`, `open <slug>`, `theme <name>` and a tiny pipeline
  language all work.
- The pipeline language is parsed and evaluated by a **Rust crate (`mini-shell`) compiled to WASM**.
  Example pipelines you can type on the live site:

  ```sh
  sh "projects | lang rust | count"
  sh "projects | grep chess | names"
  sh "projects | stars >= 3 | sort stars desc"
  ```

- Press <kbd>?</kbd> anywhere on the page to jump focus into the terminal.
- Three colour themes baked in: `matrix`, `amber`, `mono` — run `theme amber` inside the terminal.

## Stack

| Layer     | Tech                                                                              |
|-----------|-----------------------------------------------------------------------------------|
| Shell     | Rust → `wasm-bindgen` → `wasm-pack` &nbsp;·&nbsp; [`crates/mini-shell`](crates/mini-shell) |
| Frontend  | Svelte 5 (runes) + TypeScript + Vite 8                                            |
| Styling   | Tailwind CSS v4 + `shadcn-svelte` primitives + `bits-ui`                          |
| Icons     | `@lucide/svelte` + custom SVG                                                     |
| Content   | Statically typed project list in [`src/lib/data/projects.ts`](src/lib/data/projects.ts) |
| Hosting   | Static build — deployable anywhere (GitHub Pages / Cloudflare Pages / Netlify / Vercel) |

## What I build & why I love it

I ship at the boundaries — Rust doing heavy lifting, the web doing presentation, everything glued
with small, hand-rolled tools. My GitHub is basically a sketchbook of that boundary:

- **Agentic AI** — *sentinel*, *continuum*, *AVIL*. Planner/tool loops, continual learning, a
  research paper with a formal self-improving SDLC model.
- **Systems / Rust** — *spdf* (spatial PDF parser), *canvaswm* (infinite-canvas Wayland compositor),
  *fuzzy-search-rs*, *minichess*, *whisper-asr-cli-rs*, *quantrs*, *hexglyph*.
- **Desktop apps** — *MosaicFlow-Svelte* (Tauri 2 infinite-canvas research canvas), *cahier*
  (themeable React PDF reader), *rmd* (plugin-first CodeMirror editor), *SandCode* (offline
  snippet manager), *fkbr* (keyboard-driven mouse control), *Polymine* (hex minesweeper + WebGL).
- **Unusual OSes** — *mineos* (a Linux distro that only runs Minecraft, boot-to-game ≤ 15s),
  *zigos* (x86_64 kernel in Zig from the metal up), *tauri-kiosk* (locked Tauri-app kiosks on
  bare Ubuntu).
- **Creative & tooling** — *monax* & *kodex* (code-animation engines), *framescript* (a tiny
  frame-based language), *ae-reach* & *ae-curves-panel* (90+ After Effects CEP tools).
- **Kanban lineage** — *kan → ekan → rekan* — three iterations of the same idea as web, Electron,
  and a modern reboot.
- **Applied web** — *simpless* (a Laravel e-commerce / storefront platform).

Full curated list, including private projects with thumbnails, lives in
[`src/lib/data/projects.ts`](src/lib/data/projects.ts).

### Hobbies & enthusiasm (from my GitHub)

- **Building my own OS just because.** *mineos* and *zigos* exist for the joy of going low.
- **Infinite canvases & node editors.** *MosaicFlow-Svelte*, *canvaswm*, *monax* — I keep coming
  back to 2D surfaces as a UI primitive.
- **Tiny languages.** *framescript*, the WASM mini-shell in this repo, expression-oriented
  pipelines — if I can write a parser for it, I will.
- **Making terminals beautiful.** *minichess*, *whisper-asr-cli-rs*, this site's terminal.
- **Research & applied AI.** *AVIL* is a full LaTeX paper; *sentinel* is the practical version.

## Looking for work / contact

I'm currently **open to full-time, contract, and research roles** in systems programming,
Rust, applied AI / agentic systems, and developer-tool engineering. Remote-first, happy to
travel.

- 🌐 **Live portfolio** — [fanaperana.github.io](https://fanaperana.github.io) *(update to your real URL)*
- 📇 **GitHub** — <https://github.com/Fanaperana>
- ✉️  **Email** — [fanaperanaprince@gmail.com](mailto:fanaperanaprince@gmail.com)
- 💼 **LinkedIn** — [linkedin.com/in/prince-fanaperana](https://www.linkedin.com/in/prince-fanaperana)
- 📄 **Résumé** — drop a PDF at `public/resume.pdf` and it will appear in the hero.

> The site renders this information from `PROFILE` in
> [`src/lib/data/projects.ts`](src/lib/data/projects.ts) — swap the placeholder values there and
> everything (hero, footer, `whoami`, SEO metadata) updates at once.

## Run it locally

Requires Node 20+, pnpm, and the Rust toolchain (`rustup`) plus `wasm-pack`.

```sh
# 1. install JS deps
pnpm install

# 2. install the Rust → WASM toolchain (once)
cargo install wasm-pack

# 3. build the Rust shell to WASM (dev or release)
pnpm wasm:dev     # or: pnpm wasm

# 4. run the dev server
pnpm dev
```

| Script             | What it does                                          |
|--------------------|-------------------------------------------------------|
| `pnpm build`       | WASM + build-time GitHub fetch + production Vite bundle |
| `pnpm preview`     | Preview the production build                          |
| `pnpm fetch:github`| Refresh `src/lib/data/github.generated.ts`            |
| `pnpm check`       | `svelte-check` + `tsc` on the Node-side config        |
| `pnpm test:rust`   | `cargo test -p mini-shell`                            |

### Build-time GitHub pipeline

`scripts/fetch-github.mjs` runs on every build and bakes live data into the bundle:

- the **contribution heatmap** (last 12 months, via GraphQL)
- the **language breakdown** (top 8)
- the **README.md** of every curated project — **including private repos**

It reads a token from `GH_TOKEN` / `GITHUB_TOKEN`, or falls back to
`gh auth token` when you run locally. In CI the deploy workflow uses
`secrets.GH_README_TOKEN` (optional) — a classic PAT with `repo` scope —
so private READMEs ship with the static site. If no token is present the
script writes an empty stub so the build never breaks.

### Keyboard

| Keys                                          | What it does                        |
|-----------------------------------------------|-------------------------------------|
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | open the command palette            |
| <kbd>/</kbd>                                  | open the palette (when not typing)  |
| <kbd>Esc</kbd>                                | close palette or project modal      |

Project cards open a **case-study modal** (URL-addressable via `#/p/<slug>`)
that renders the repo's README with sanitized HTML (marked + DOMPurify).

## Repo layout

```
crates/mini-shell/       # Rust pipeline-language crate, compiled to WASM
public/                  # favicon, og-image, resume.pdf, thumbnails/
src/
  App.svelte             # Page composition
  app.css                # Tailwind v4 theme + keyframe animations
  lib/components/        # Hero, About, Terminal, Projects, Nav, Footer, ui/*, AnimatedBackdrop
  lib/terminal/          # Command definitions + dispatch for the in-page shell
  lib/data/projects.ts   # Source of truth: PROFILE + curated projects
  lib/wasm/shell.ts      # Thin wrapper around the wasm-pack output
```

## Suggested GitHub repo topics

When publishing, add these topics to the repo's *About* panel — helps SEO and discovery:

```
portfolio  svelte  svelte5  rust  webassembly  wasm  tauri  typescript
vite  tailwindcss  terminal  developer-portfolio  open-to-work
agentic-ai  systems-programming  resume  hacker-aesthetic
```

## License

Code in this repo is released under the [MIT License](#license). Project descriptions,
thumbnails, and the curated project list are personal content — please don't reuse them
as-is to represent yourself.

<div align="center">
<br />
<sub>Built with <span style="color:#CE422B">Rust</span> · <span style="color:#FF3E00">Svelte</span> · <span style="color:#646CFF">Vite</span>. Powered by caffeine and <code>cargo build --release</code>.</sub>
</div>
# Portfolio // Fanaperana

> Systems tinkerer · Rust · TypeScript · agentic AI, tiny shells, and interesting OSes.

This repo **is** my portfolio site. It doubles as a showcase and as a demo of the kind of thing
I like building: a real pipeline shell written in Rust, compiled to WebAssembly, embedded in a
Svelte 5 app, and driven from an in-page terminal you can actually type into.

GitHub: https://github.com/Fanaperana

---

## What this site is

- A handwritten portfolio — no template, no headless CMS.
- An **in-browser terminal** where `help`, `ls`, `open <slug>`, `theme <name>` and a tiny pipeline
  language all work.
- The pipeline language is parsed and evaluated by a **Rust crate (`mini-shell`) compiled to WASM**.
  Example pipelines you can type on the live site:

  ```sh
  sh "projects | lang rust | count"
  sh "projects | grep chess | names"
  sh "projects | stars >= 3 | sort stars desc"
  ```

- Press <kbd>?</kbd> anywhere on the page to jump focus into the terminal.

## Stack

| Layer     | Tech                                                     |
|-----------|----------------------------------------------------------|
| Shell     | Rust → `wasm-bindgen` → `wasm-pack` ([crates/mini-shell](crates/mini-shell)) |
| Frontend  | Svelte 5 (runes) + TypeScript + Vite 8                   |
| Styling   | Tailwind CSS v4 + `shadcn-svelte` primitives + `bits-ui` |
| Content   | Statically typed project list in [src/lib/data/projects.ts](src/lib/data/projects.ts) |

## Featured projects (showcased on the site)

The full curated list lives in [src/lib/data/projects.ts](src/lib/data/projects.ts). Highlights:

### Agentic AI
- **sentinel** — Agentic AI coding assistant in Rust, benchmarked against Claude Code / Hermes / OpenClaw. Local-first planner + tools loop.
- **continuum** — Self-learning AI agent with continual-learning and self-improvement loops.
- **AVIL** — *Adaptive Verified Iteration Loop*: a self-improving SDLC for agentic AI systems (research paper + formal model).
- **genai** — TypeScript sandbox for prompts, chains, and GenAI feature experiments.

### Apps
- **MosaicFlow-Svelte** — Node-based infinite canvas for visual information mapping. Tauri 2 + Svelte 5.
- **cahier** — Themeable PDF reader (React + Vite + Zustand, Turborepo, PDF.js, IndexedDB).
- **rmd** — Plugin-first rich markdown editor (CodeMirror 6 + Svelte). Rich while reading, raw while editing.
- **SandCode** — Local-first code snippet manager (Tauri + Vue).
- **fkbr** — Cross-platform keyboard-driven mouse control (Tauri + React + Rust).
- **Polymine** — Hexagonal minesweeper with WebGL rendering and a Rust backend (Tauri).

### Systems / Rust
- **spdf** — Fast, spatial PDF parsing in Rust — column-aware extraction, optional OCR.
- **canvaswm** — Infinite-canvas Wayland compositor in Rust.
- **fuzzy-search-rs** — Educational Rust implementation of fuzzy-search algorithms (Levenshtein et al.).
- **minichess** — Terminal chess engine interface in Rust, powered by Stockfish.
- **whisper-asr-cli-rs** — Offline Whisper speech-to-text CLI in Rust.
- **quantrs** — Quantitative experiments in Rust.
- **hexglyph** — Base-65536 procedural visual alphabet (Rust + TypeScript).

### Operating systems
- **mineos** — A Linux distribution that only runs Minecraft — boot-to-Minecraft in under 15 seconds.
- **zigos** — Minimal x86_64 kernel in Zig, from the metal up.
- **tauri-kiosk** — Scripts to turn bare Ubuntu into a locked Tauri-app kiosk.

### Creative / tooling
- **monax** — Keyframe-based code-animation engine with a visual node editor.
- **kodex** — Cinematic code-animation studio powered by Monaco.
- **framescript** — Tiny frame-based, expression-oriented scripting language in TypeScript.
- **ae-reach**, **ae-curves-panel** — After Effects CEP panels (90+ tools, cubic-bezier easing editor).

### Kanban lineage
- **kan → ekan → rekan** — Three iterations of the same kanban idea: web, Electron, modern reboot.

### Applied web work
- **simpless** — Laravel e-commerce / storefront platform.

*Some entries point at private repos; those are surfaced here as proof-of-work with descriptions and thumbnails but intentionally not linkable to source.*

## Run it locally

Requires Node 20+, pnpm, and the Rust toolchain (`rustup`) plus `wasm-pack`.

```sh
# 1. install JS deps
pnpm install

# 2. install the Rust → WASM toolchain (once)
cargo install wasm-pack

# 3. build the Rust shell to WASM (dev or release)
pnpm wasm:dev     # or: pnpm wasm

# 4. run the dev server
pnpm dev
```

Other scripts:

| Script             | What it does                                          |
|--------------------|-------------------------------------------------------|
| `pnpm build`       | Build the WASM crate + the production Vite bundle     |
| `pnpm preview`     | Preview the production build                          |
| `pnpm check`       | `svelte-check` + `tsc` on the Node-side config        |
| `pnpm test:rust`   | `cargo test -p mini-shell`                            |

## Repo layout

```
crates/mini-shell/       # Rust pipeline-language crate, compiled to WASM
public/thumbnails/       # Project thumbnails (so private repos still ship art)
src/
  App.svelte             # Page composition
  lib/components/        # Hero, About, Terminal, Projects, ProjectCard, Nav, Footer, ui/*
  lib/terminal/          # Command definitions + dispatch for the in-page shell
  lib/data/projects.ts   # Source of truth for the project list + profile
  lib/wasm/shell.ts      # Thin wrapper around the wasm-pack output
```

## License

Code in this repo is released under the MIT License. Project descriptions, thumbnails, and the
curated project list are personal content — please don't reuse them as-is to represent yourself.
# Svelte + TS + Vite

This template should help get you started developing with Svelte and TypeScript in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Svelte](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode).

## Need an official Svelte framework?

Check out [SvelteKit](https://github.com/sveltejs/kit#readme), which is also powered by Vite. Deploy anywhere with its serverless-first approach and adapt to various platforms, with out of the box support for TypeScript, SCSS, and Less, and easily-added support for mdsvex, GraphQL, PostCSS, Tailwind CSS, and more.

## Technical considerations

**Why use this over SvelteKit?**

- It brings its own routing solution which might not be preferable for some users.
- It is first and foremost a framework that just happens to use Vite under the hood, not a Vite app.

This template contains as little as possible to get started with Vite + TypeScript + Svelte, while taking into account the developer experience with regards to HMR and intellisense. It demonstrates capabilities on par with the other `create-vite` templates and is a good starting point for beginners dipping their toes into a Vite + Svelte project.

Should you later need the extended capabilities and extensibility provided by SvelteKit, the template has been structured similarly to SvelteKit so that it is easy to migrate.

**Why `global.d.ts` instead of `compilerOptions.types` inside `jsconfig.json` or `tsconfig.json`?**

Setting `compilerOptions.types` shuts out all other types not explicitly listed in the configuration. Using triple-slash references keeps the default TypeScript setting of accepting type information from the entire workspace, while also adding `svelte` and `vite/client` type information.

**Why include `.vscode/extensions.json`?**

Other templates indirectly recommend extensions via the README, but this file allows VS Code to prompt the user to install the recommended extension upon opening the project.

**Why enable `allowJs` in the TS template?**

While `allowJs: false` would indeed prevent the use of `.js` files in the project, it does not prevent the use of JavaScript syntax in `.svelte` files. In addition, it would force `checkJs: false`, bringing the worst of both worlds: not being able to guarantee the entire codebase is TypeScript, and also having worse typechecking for the existing JavaScript. In addition, there are valid use cases in which a mixed codebase may be relevant.

**Why is HMR not preserving my local component state?**

HMR state preservation comes with a number of gotchas! It has been disabled by default in both `svelte-hmr` and `@sveltejs/vite-plugin-svelte` due to its often surprising behavior. You can read the details [here](https://github.com/rixo/svelte-hmr#svelte-hmr).

If you have state that's important to retain within a component, consider creating an external store which would not be replaced by HMR.

```ts
// store.ts
// An extremely simple external store
import { writable } from 'svelte/store'
export default writable(0)
```
