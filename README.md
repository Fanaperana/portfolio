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
| `pnpm fetch:github`| Refresh `src/lib/data/github*.generated.ts`           |
| `pnpm prerender`   | Write a static HTML page per project/note + sitemap (runs after `vite build`) |
| `pnpm check`       | `svelte-check` + `tsc` on the Node-side config        |
| `pnpm test:rust`   | `cargo test -p mini-shell`                            |

### Build-time GitHub pipeline

`scripts/fetch-github.mjs` runs on every build and bakes live data into the bundle:

- the **contribution heatmap** (last 12 months, via GraphQL)
- the **language breakdown** (top 8)
- the **README.md** of every curated project — **including private repos**
  (written to `github.readmes.generated.ts`, loaded lazily on project pages)

It reads a token from `GH_TOKEN` / `GITHUB_TOKEN`, and falls back to
`gh auth token` when you run locally. The generated file
`src/lib/data/github.generated.ts` is **committed** so private READMEs you
fetched locally stay baked into the deployed site — no CI secrets needed.
CI uses the default `GITHUB_TOKEN` to refresh public stats; the fetch
script **merges**, preserving any README it can't re-fetch.

To refresh before pushing:

```sh
pnpm fetch:github     # pulls fresh stats + private READMEs via `gh auth`
git add src/lib/data/github*.generated.ts && git commit -m "data: refresh github snapshot"
```

### Keyboard

| Keys                                          | What it does                        |
|-----------------------------------------------|-------------------------------------|
| <kbd>⌘</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | open the command palette            |
| <kbd>/</kbd>                                  | open the palette (when not typing)  |
| <kbd>Esc</kbd>                                | close palette or résumé             |

### Pages, case studies and notes

Every project has its own page at `/projects/<slug>` (old `#/p/<slug>` links
redirect). `scripts/prerender.mjs` writes a static `index.html` for each one
after the Vite build, with its own title, description and readable content
for search engines and link previews, plus `sitemap.xml` and `404.html`.

- **Case studies** — `src/lib/data/case-studies.ts`. Projects listed there get
  the full write-up (problem, architecture, decisions, outcome) above their
  README and appear in *Selected work* on the home page.
- **Notes** — drop a Markdown file in `src/content/notes/<slug>.md` with a
  `title` / `date` / `summary` / `tags` / optional `project` frontmatter block.
  Add `draft: true` to hide it.
- **Services, process, contact copy** — `src/lib/data/site.ts`.

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
  lib/data/case-studies.ts # Long-form write-ups for the featured projects
  lib/data/site.ts       # Services, process and contact copy
  lib/router.svelte.ts   # Tiny path router (/projects/<slug>, /notes/<slug>)
  content/notes/*.md     # Notes / blog posts
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
