export type Project = {
  slug: string
  title: string
  description: string
  language: string
  tags: string[]
  stars: number
  pushed_at: string
  url: string
  homepage?: string
  highlight?: boolean
  accent?: string // gradient color key
  glyph?: string // fallback glyph when no thumbnail exists
  thumbnail?: string // path under public/ or absolute URL
  visibility?: 'public' | 'private' // defaults to public
}

export const PROFILE = {
  login: 'Fanaperana',
  tagline: 'Systems tinkerer · Rust · TypeScript · agentic AI, tiny shells, and interesting OSes',
  url: 'https://github.com/Fanaperana',
  avatar: 'https://avatars.githubusercontent.com/u/31814043?v=4',
}

// Curated. Order here is the default render order; featured items still float
// to the top in Projects.svelte. Thumbnails live under /public/thumbnails so
// private-repo images ship with the deployed static site.
export const PROJECTS: Project[] = [
  // ── flagship AI agents ──
  {
    slug: 'sentinel',
    title: 'sentinel',
    description:
      'My biggest project — an agentic AI coding assistant in Rust that benchmarks against Claude Code, Hermes, and OpenClaw. Local-first planner + tools loop.',
    language: 'Rust',
    tags: ['rust', 'ai', 'agent', 'llm'],
    stars: 0,
    pushed_at: '2026-04-12T21:09:24Z',
    url: 'https://github.com/Fanaperana/sentinel',
    highlight: true,
    accent: 'rose',
    glyph: '◈',
    visibility: 'private',
  },
  {
    slug: 'continuum',
    title: 'continuum',
    description:
      'Self-learning AI agent with a research-grade implementation — same family as sentinel, focused on continual learning and self-improvement loops.',
    language: 'Python',
    tags: ['python', 'ai', 'agent', 'research'],
    stars: 0,
    pushed_at: '2026-04-07T15:41:05Z',
    url: 'https://github.com/Fanaperana/continuum',
    highlight: true,
    accent: 'violet',
    glyph: '∞',
    visibility: 'private',
  },
  {
    slug: 'avil',
    title: 'AVIL',
    description:
      'Adaptive Verified Iteration Loop — a self-improving SDLC for agentic AI systems. Research paper with formal model, algorithms, and simulated evaluation.',
    language: 'TeX',
    tags: ['ai', 'agent', 'llm', 'research', 'formal-methods', 'latex'],
    stars: 0,
    pushed_at: '2026-04-19T00:33:27Z',
    url: 'https://github.com/Fanaperana/AVIL',
    highlight: true,
    accent: 'indigo',
    glyph: '∴',
  },

  // ── flagship apps ──
  {
    slug: 'mosaicflow-svelte',
    title: 'MosaicFlow-Svelte',
    description:
      'My best app so far — a node-based infinite canvas for visual information mapping and research. Tauri 2, Svelte 5, TypeScript.',
    language: 'Svelte',
    tags: ['tauri', 'svelte', 'canvas', 'research'],
    stars: 3,
    pushed_at: '2026-04-03T23:42:24Z',
    url: 'https://github.com/Fanaperana/MosaicFlow-Svelte',
    highlight: true,
    accent: 'teal',
    glyph: '◧',
    thumbnail: 'thumbnails/mosaicflow-svelte.png',
  },
  {
    slug: 'cahier',
    title: 'cahier',
    description:
      'Modern themeable PDF reader built with React + Vite + Zustand. Turborepo monorepo, PDF.js, IndexedDB persistence — designed for focused reading.',
    language: 'TypeScript',
    tags: ['react', 'pdf', 'turborepo', 'indexeddb'],
    stars: 0,
    pushed_at: '2026-04-15T04:13:58Z',
    url: 'https://github.com/Fanaperana/cahier',
    highlight: true,
    accent: 'sky',
    glyph: '▤',
    visibility: 'private',
  },
  {
    slug: 'spdf',
    title: 'spdf',
    description:
      'Fast, spatial PDF parsing in Rust — column-aware text extraction, optional OCR, and format conversion. Competitive with LiteParse on real-world documents.',
    language: 'Rust',
    tags: ['rust', 'pdf', 'parser', 'ocr'],
    stars: 0,
    pushed_at: '2026-04-18T01:11:58Z',
    url: 'https://github.com/Fanaperana/spdf',
    highlight: true,
    accent: 'orange',
    glyph: '⎘',
  },
  {
    slug: 'rmd',
    title: 'rmd',
    description:
      'Plugin-first rich markdown editor built with CodeMirror 6 + Svelte. Renders rich while reading, raw while editing.',
    language: 'TypeScript',
    tags: ['svelte', 'codemirror', 'markdown', 'wysiwyg'],
    stars: 2,
    pushed_at: '2026-03-27T22:37:08Z',
    url: 'https://github.com/Fanaperana/rmd',
    highlight: true,
    accent: 'violet',
    glyph: '✎',
    thumbnail: 'thumbnails/rmd.png',
    visibility: 'private',
  },

  // ── systems / Rust ──
  {
    slug: 'canvaswm',
    title: 'canvaswm',
    description:
      'Infinite-canvas Wayland compositor — arrange windows freely on a zoomable 2D surface. Low-level Rust graphics.',
    language: 'Rust',
    tags: ['rust', 'wayland', 'compositor', 'linux'],
    stars: 1,
    pushed_at: '2026-04-03T23:42:23Z',
    url: 'https://github.com/Fanaperana/canvaswm',
    highlight: true,
    accent: 'emerald',
    glyph: '▦',
  },
  {
    slug: 'fuzzy-search-rs',
    title: 'fuzzy-search-rs',
    description:
      'Comprehensive, educational implementation of fuzzy-search algorithms (Levenshtein) in Rust — with pseudo-code suitable for porting to any language.',
    language: 'Rust',
    tags: ['rust', 'search', 'algorithm', 'educational'],
    stars: 4,
    pushed_at: '2026-04-18T23:59:13Z',
    url: 'https://github.com/Fanaperana/fuzzy-search-rs',
    accent: 'cyan',
    glyph: '⌕',
    thumbnail: 'thumbnails/fuzzy-search-rs.png',
  },
  {
    slug: 'fkbr',
    title: 'fkbr',
    description:
      'Cross-platform mouseless desktop app for keyboard-driven mouse control. Built with Tauri, React, and Rust.',
    language: 'TypeScript',
    tags: ['tauri', 'rust', 'react', 'productivity'],
    stars: 2,
    pushed_at: '2026-04-03T23:42:26Z',
    url: 'https://github.com/Fanaperana/fkbr',
    accent: 'amber',
    glyph: '⌨',
  },
  {
    slug: 'polymine',
    title: 'Polymine',
    description:
      'Hexagonal minesweeper with WebGL rendering and a Rust backend, packaged as a Tauri desktop app. Beautifully rendered, blazingly fast.',
    language: 'TypeScript',
    tags: ['tauri', 'rust', 'webgl', 'game'],
    stars: 1,
    pushed_at: '2026-02-04T13:39:53Z',
    url: 'https://github.com/Fanaperana/Polymine',
    accent: 'emerald',
    glyph: '⬡',
    thumbnail: 'thumbnails/polymine.png',
    visibility: 'private',
  },
  {
    slug: 'hexglyph',
    title: 'hexglyph',
    description:
      'HexGlyph-16 OrbitSigil — a procedural visual alphabet mapping every u16 to a unique geometric glyph. Base-65536 encoding. Rust + TypeScript.',
    language: 'TypeScript',
    tags: ['rust', 'typescript', 'encoding', 'generative'],
    stars: 0,
    pushed_at: '2026-03-05T03:09:34Z',
    url: 'https://github.com/Fanaperana/hexglyph',
    highlight: true,
    accent: 'fuchsia',
    glyph: '⬢',
    visibility: 'private',
  },
  {
    slug: 'quantrs',
    title: 'quantrs',
    description: 'Quantitative experiments in Rust — fast numerics and market tooling.',
    language: 'Rust',
    tags: ['rust', 'quant', 'finance'],
    stars: 0,
    pushed_at: '2026-02-07T23:31:20Z',
    url: 'https://github.com/Fanaperana/quantrs',
    accent: 'orange',
    glyph: '∑',
    visibility: 'private',
  },
  {
    slug: 'whisper-asr-cli-rs',
    title: 'whisper-asr-cli-rs',
    description:
      'Rust CLI wrapping Whisper for offline speech-to-text transcription from the terminal.',
    language: 'Rust',
    tags: ['rust', 'whisper', 'asr', 'cli'],
    stars: 0,
    pushed_at: '2026-01-25T23:52:57Z',
    url: 'https://github.com/Fanaperana/whisper-asr-cli-rs',
    accent: 'teal',
    glyph: '◎',
    visibility: 'private',
  },
  {
    slug: 'minichess',
    title: 'minichess',
    description:
      'Terminal-based chess engine interface in Rust, powered by Stockfish. Plays, analyzes, and renders the board in your TUI.',
    language: 'Rust',
    tags: ['rust', 'chess', 'tui', 'stockfish'],
    stars: 1,
    pushed_at: '2025-06-26T13:30:25Z',
    url: 'https://github.com/Fanaperana/minichess',
    highlight: true,
    accent: 'teal',
    glyph: '♞',
  },

  // ── operating systems ──
  {
    slug: 'mineos',
    title: 'mineos',
    description:
      'A Linux distribution that only runs Minecraft — boot-to-Minecraft in under 15 seconds. Shell-scripted OS build.',
    language: 'Shell',
    tags: ['linux', 'os', 'minecraft'],
    stars: 0,
    pushed_at: '2026-02-09T00:23:20Z',
    url: 'https://github.com/Fanaperana/mineos',
    highlight: true,
    accent: 'green',
    glyph: '⛏',
    visibility: 'private',
  },
  {
    slug: 'zigos',
    title: 'zigos',
    description:
      'Minimal x86_64 operating system written in Zig — learning kernel built from the metal up.',
    language: 'Zig',
    tags: ['zig', 'os', 'kernel'],
    stars: 0,
    pushed_at: '2026-01-26T04:59:58Z',
    url: 'https://github.com/Fanaperana/zigos',
    highlight: true,
    accent: 'amber',
    glyph: '◆',
    visibility: 'private',
  },
  {
    slug: 'tauri-kiosk',
    title: 'tauri-kiosk',
    description:
      'Shell scripts to set up a minimal locked kiosk desktop on bare Ubuntu, running a Tauri app. Production embedded setup.',
    language: 'Shell',
    tags: ['tauri', 'kiosk', 'linux', 'embedded'],
    stars: 2,
    pushed_at: '2023-10-02T22:31:01Z',
    url: 'https://github.com/Fanaperana/tauri-kiosk',
    accent: 'amber',
    glyph: '▣',
  },

  // ── creative / tooling ──
  {
    slug: 'monax',
    title: 'monax',
    description:
      'Keyframe-based code animation engine — build step-by-step code walkthroughs with a visual node editor.',
    language: 'TypeScript',
    tags: ['animation', 'node-editor', 'typescript'],
    stars: 0,
    pushed_at: '2026-02-22T18:14:13Z',
    url: 'https://github.com/Fanaperana/monax',
    accent: 'cyan',
    glyph: '◐',
    thumbnail: 'thumbnails/monax.png',
    visibility: 'private',
  },
  {
    slug: 'kodex',
    title: 'kodex',
    description:
      'Cinematic code animation studio — typewriter effects, smooth diffs, powered by Monaco Editor.',
    language: 'TypeScript',
    tags: ['monaco', 'animation', 'typescript'],
    stars: 0,
    pushed_at: '2026-02-19T06:10:46Z',
    url: 'https://github.com/Fanaperana/kodex',
    accent: 'teal',
    glyph: '▷',
    visibility: 'private',
  },
  {
    slug: 'framescript',
    title: 'framescript',
    description:
      'Tiny scripting-language experiment — expression-oriented, frame-based execution. TypeScript implementation.',
    language: 'TypeScript',
    tags: ['typescript', 'language', 'parser'],
    stars: 0,
    pushed_at: '2026-02-28T04:13:14Z',
    url: 'https://github.com/Fanaperana/framescript',
    accent: 'violet',
    glyph: '❪',
    visibility: 'private',
  },
  {
    slug: 'genai',
    title: 'genai',
    description:
      'Generative-AI toolkit sandbox in TypeScript — prompts, chains, and experiments for shipping AI features.',
    language: 'TypeScript',
    tags: ['ai', 'typescript', 'llm'],
    stars: 0,
    pushed_at: '2026-02-24T00:59:45Z',
    url: 'https://github.com/Fanaperana/genai',
    accent: 'fuchsia',
    glyph: '✧',
    thumbnail: 'thumbnails/genai.png',
    visibility: 'private',
  },
  {
    slug: 'sandcode',
    title: 'SandCode',
    description:
      'Local-first code snippet manager — like GitHub Gist, but offline. Built with Tauri and Vue.',
    language: 'TypeScript',
    tags: ['tauri', 'vue', 'snippets', 'offline'],
    stars: 5,
    pushed_at: '2026-01-03T16:58:39Z',
    url: 'https://github.com/Fanaperana/SandCode',
    accent: 'emerald',
    glyph: '⌧',
    thumbnail: 'thumbnails/sandcode.png',
  },
  {
    slug: 'kadoo',
    title: 'kadoo',
    description:
      'UI-primitives experiment for task / idea capture. TypeScript, keyboard-first.',
    language: 'TypeScript',
    tags: ['typescript', 'productivity'],
    stars: 0,
    pushed_at: '2026-02-01T02:53:11Z',
    url: 'https://github.com/Fanaperana/kadoo',
    accent: 'rose',
    glyph: '◩',
    visibility: 'private',
  },
  {
    slug: 'landmine',
    title: 'landmine',
    description:
      'Svelte minesweeper variant — weekend game-dev experiment with a polished UI.',
    language: 'Svelte',
    tags: ['svelte', 'game', 'minesweeper'],
    stars: 0,
    pushed_at: '2026-01-10T22:47:28Z',
    url: 'https://github.com/Fanaperana/landmine',
    accent: 'red',
    glyph: '◉',
    thumbnail: 'thumbnails/landmine.png',
    visibility: 'private',
  },
  {
    slug: 'recog',
    title: 'recog',
    description:
      'Object-recognition playground in Python — playing with OpenCV / ML models for computer vision.',
    language: 'Python',
    tags: ['python', 'opencv', 'computer-vision', 'ml'],
    stars: 1,
    pushed_at: '2023-10-10T08:42:36Z',
    url: 'https://github.com/Fanaperana/recog',
    accent: 'sky',
    glyph: '◉',
  },

  // ── After Effects CEP panels ──
  {
    slug: 'ae-reach',
    title: 'ae-reach',
    description:
      'The ultimate After Effects toolset — 90+ tools in a single CEP panel for motion designers.',
    language: 'JavaScript',
    tags: ['after-effects', 'cep', 'motion'],
    stars: 0,
    pushed_at: '2026-02-15T17:13:50Z',
    url: 'https://github.com/Fanaperana/ae-reach',
    accent: 'orange',
    glyph: '✦',
    visibility: 'private',
  },
  {
    slug: 'ae-curves-panel',
    title: 'ae-curves-panel',
    description:
      'After Effects CEP panel for advanced cubic-bezier easing curves — precise easing with a visual editor.',
    language: 'JavaScript',
    tags: ['after-effects', 'cep', 'easing'],
    stars: 0,
    pushed_at: '2026-02-15T05:50:02Z',
    url: 'https://github.com/Fanaperana/ae-curves-panel',
    accent: 'fuchsia',
    glyph: '∿',
    visibility: 'private',
  },

  // ── kanban lineage ──
  {
    slug: 'kan',
    title: 'kan',
    description:
      'Original kanban board in TypeScript — the starting point for the ekan/rekan iterations. Lightweight, drag-and-drop.',
    language: 'TypeScript',
    tags: ['typescript', 'kanban', 'productivity'],
    stars: 5,
    pushed_at: '2023-10-12T04:30:48Z',
    url: 'https://github.com/Fanaperana/kan',
    accent: 'fuchsia',
    glyph: '▦',
    thumbnail: 'thumbnails/kan.png',
  },
  {
    slug: 'ekan',
    title: 'ekan',
    description:
      'Electron kanban — second iteration of the kan family, packaging the board as a desktop app.',
    language: 'TypeScript',
    tags: ['electron', 'kanban', 'desktop'],
    stars: 0,
    pushed_at: '2024-11-09T22:51:52Z',
    url: 'https://github.com/Fanaperana/ekan',
    accent: 'violet',
    glyph: '▨',
  },
  {
    slug: 'rekan',
    title: 'rekan',
    description:
      'Modern kanban reboot in TypeScript — cleaner data model, keyboard-first. Latest iteration of the kan family.',
    language: 'TypeScript',
    tags: ['typescript', 'kanban', 'productivity'],
    stars: 1,
    pushed_at: '2025-04-20T19:21:37Z',
    url: 'https://github.com/Fanaperana/rekan',
    accent: 'fuchsia',
    glyph: '▧',
  },

  // ── applied web work ──
  {
    slug: 'simpless',
    title: 'simpless',
    description:
      'E-commerce platform built with Laravel — Shopify-style storefront & admin. One of my biggest applied projects.',
    language: 'PHP',
    tags: ['laravel', 'php', 'ecommerce'],
    stars: 0,
    pushed_at: '2024-03-22T09:26:32Z',
    url: 'https://github.com/Fanaperana/simpless',
    highlight: true,
    accent: 'red',
    glyph: '⌂',
    visibility: 'private',
  },
  {
    slug: 'laravel_vue_twilio',
    title: 'laravel_vue_twilio',
    description:
      'Healthcare-grade secure communication system for Parkview Mirro Center — Laravel + Vue + Twilio. Real-world production project.',
    language: 'PHP',
    tags: ['laravel', 'vue', 'twilio', 'healthcare'],
    stars: 0,
    pushed_at: '2022-05-01T12:15:38Z',
    url: 'https://github.com/Fanaperana/laravel_vue_twilio',
    highlight: true,
    accent: 'sky',
    glyph: '☎',
    visibility: 'private',
  },
  {
    slug: 'rockdiva',
    title: 'rockdiva',
    description:
      'Production website for Rockdiva Nails — shipped Laravel app powering rockdivanails.com.',
    language: 'PHP',
    tags: ['laravel', 'php', 'client-work'],
    stars: 0,
    pushed_at: '2021-11-26T16:51:58Z',
    url: 'https://github.com/Fanaperana/rockdiva',
    homepage: 'https://rockdivanails.com/',
    accent: 'rose',
    glyph: '♛',
    visibility: 'private',
  },
  {
    slug: 'blingnails',
    title: 'blingnails',
    description:
      'Private nail-salon management / showcase site — TypeScript front-end for a real small business.',
    language: 'TypeScript',
    tags: ['typescript', 'client-work'],
    stars: 0,
    pushed_at: '2023-11-05T03:21:44Z',
    url: 'https://github.com/Fanaperana/blingnails',
    accent: 'fuchsia',
    glyph: '✦',
    visibility: 'private',
  },

  // ── markdown editor lineage ──
  {
    slug: 'make-the-docs',
    title: 'Make-The-Docs',
    description:
      'Live markdown editor with customizable output rendering, built with Laravel. Split-pane, live preview, theming.',
    language: 'PHP',
    tags: ['laravel', 'markdown', 'editor'],
    stars: 1,
    pushed_at: '2022-06-28T01:32:47Z',
    url: 'https://github.com/Fanaperana/Make-The-Docs',
    accent: 'violet',
    glyph: '✎',
  },
  {
    slug: 'make-the-doc-vue',
    title: 'make-the-doc-vue',
    description:
      'Vue + Vite frontend for Make-The-Docs — live markdown editing with customizable rendering.',
    language: 'Vue',
    tags: ['vue', 'vite', 'markdown', 'editor'],
    stars: 0,
    pushed_at: '2022-06-07T05:59:48Z',
    url: 'https://github.com/Fanaperana/make-the-doc-vue',
    accent: 'emerald',
    glyph: '✐',
  },

  // ── mobile / misc ──
  {
    slug: 'fluid-converter',
    title: 'fluid-converter',
    description:
      'Custom mobile app — React Native + Expo for fluid unit conversion (oz to fl oz, water density by temperature, mixology-grade precision).',
    language: 'TypeScript',
    tags: ['react-native', 'expo', 'mobile'],
    stars: 1,
    pushed_at: '2023-03-19T03:18:29Z',
    url: 'https://github.com/Fanaperana/fluid-converter',
    accent: 'sky',
    glyph: '≈',
  },
  {
    slug: 'neovim-config',
    title: 'neovim-config',
    description:
      'Personal Neovim configuration — custom keymaps, plugins, an IDE-like setup. The editor that ships everything above.',
    language: 'Vim Script',
    tags: ['neovim', 'dotfiles', 'editor'],
    stars: 1,
    pushed_at: '2022-09-26T06:17:19Z',
    url: 'https://github.com/Fanaperana/neovim-config',
    accent: 'emerald',
    glyph: '⌨',
  },
  {
    slug: 'custom-greenscreen-chat',
    title: 'custom-greenscreen-chat',
    description:
      'Vue-based green-background text-bubble overlay for easy chroma-keying in video editing software.',
    language: 'Vue',
    tags: ['vue', 'streaming', 'overlay'],
    stars: 1,
    pushed_at: '2022-08-15T14:44:33Z',
    url: 'https://github.com/Fanaperana/custom-greenscreen-chat',
    accent: 'green',
    glyph: '◉',
  },
]
