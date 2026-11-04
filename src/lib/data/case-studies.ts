// Case-study content for the four featured projects. Every fact, number and
// name below is taken from the project's README (see GH_READMES in
// github.generated.ts) or from PROJECTS in projects.ts. Do not add figures
// that aren't in those sources.

export type CaseStudy = {
  slug: string; // must match a PROJECTS slug
  kicker: string;
  headline: string; // <= 90 chars
  summary: string;
  role: string;
  stack: string[];
  metrics: { value: string; label: string }[];
  pipeline: { label: string; detail: string }[];
  problem: string; // markdown
  approach: string; // markdown
  decisions: { title: string; body: string }[];
  outcome: string; // markdown
  snippet?: { lang: string; code: string; caption: string };
};

export const CASE_STUDIES: CaseStudy[] = [
  // ── 1. cinecode ────────────────────────────────────────────────────────
  {
    slug: "cinecode",
    kicker: "Graphics & video engine · Rust",
    headline: "A deterministic Rust engine that renders scripted code explainers straight to MP4",
    summary:
      "CineCode turns a folder of scene scripts and source files into a finished programming-documentary video. Code is an animatable object down to the character, the camera is choreographed on a timeline, and algorithm simulations can be linked to the exact line that explains them. It ships as one Rust binary with no browser or Node.js in the pipeline.",
    role: "Author — engine architecture, DSL design, rendering, docs site",
    stack: ["Rust", "rhai", "syntect", "cosmic-text / swash", "wgpu + WGSL", "ffmpeg", "serde"],
    metrics: [
      { value: "7", label: "workspace crates, from scene graph to CLI" },
      { value: "~212", label: "languages it can syntax-highlight" },
      { value: "6", label: "built-in simulations (A*, boids, Life, …)" },
      { value: "3", label: "OSes built and tested in CI" },
    ],
    pipeline: [
      { label: ".ccs scripts", detail: "rhai DSL + codescene.toml manifest" },
      { label: "Scene Document", detail: "In-memory scene graph, serialisable to JSON" },
      { label: "Timeline", detail: "Sample tracks + camera per frame, pure and deterministic" },
      { label: "Rasterize", detail: "CPU reference renderer, optional wgpu backend" },
      { label: "ffmpeg", detail: "Raw RGBA piped over stdin → H.264 MP4" },
    ],
    problem: `Programming explainer videos are usually made by screen-recording an editor and fixing it in a video editor, which is slow to produce and impossible to revise cleanly. Existing code-to-video tools either target math (Manim) or render inside a headless browser (Remotion, Motion Canvas), which makes output heavier to produce and hard to reproduce bit-for-bit.

The goal was a tool where an episode is source-controlled text, and re-rendering it always produces the same pixels.`,
    approach: `The engine is essentially one pure function, \`(scene, frame) → RGBA pixels\`, run once per frame. Scene scripts don't draw anything; they build a data tree of scenes, nodes and keyframed tracks. Rendering happens later, frame by frame, and every glyph edge or transition reduces to source-over alpha blending into a flat byte buffer.

- **Code as a scene graph.** Code nodes break down into Line → Token → Character, so typewriter reveals, per-line spotlights, backspace/retype and word morphs all work on the same tracks.
- **Documentary camera.** \`focus_on\`, \`move_to\` and \`zoom_to\` remember the current framing so chained moves stay continuous; zoom is baked into glyph size so text stays crisp.
- **Simulations bound to code.** Terrain noise, A* pathfinding, particles, BFS/DFS, Game of Life and boids store only parameters and run at render time. One \`link\` call spotlights a code line, draws an arrow, and reveals the simulation on the same timeline.`,
    decisions: [
      {
        title: "CPU rasterizer as the reference, GPU behind the same trait",
        body: "The CPU backend always produces real pixels headlessly and, with a bundled JetBrains Mono font, gives pixel-identical output on every machine. The wgpu backend sits behind the same Renderer trait and is opt-in (--gpu) for bloom and user WGSL shaders. Determinism stays the default; GPU effects are an addition, not a dependency.",
      },
      {
        title: "An embedded rhai DSL instead of JSON or a JS framework",
        body: "Scripts read declaratively but still have real variables and loops, and they build the Scene Document directly in Rust with no JSON round-trip. The document remains serde-serialisable, which keeps the door open for a future GUI front-end or caching without coupling the engine to it.",
      },
      {
        title: "A pure-Rust pivot: no Node, no intermediate files",
        body: "Highlighting moved to syntect (TextMate grammars) using fancy-regex rather than the Oniguruma C library, so the engine builds on Linux, macOS and Windows with ffmpeg as the only runtime dependency. Frames are streamed as raw RGBA into a single ffmpeg process, so no PNG sequences ever hit disk.",
      },
    ],
    outcome: `CineCode works end to end: a project folder compiles, highlights, choreographs a camera, runs simulations, applies optional shader effects and renders an MP4. Prebuilt binaries are produced for macOS (arm64/x64), Linux and Windows, and there is a separate documentation site (Diátaxis structure, Fumadocs) where every embedded clip is unedited engine output. Audio sync, multi-scene transitions and a Tauri authoring app are on the roadmap. It shows end-to-end ownership of a non-trivial system: language design, a rendering pipeline, cross-platform packaging and documentation.`,
    snippet: {
      lang: "rhai",
      code: `// scenes/intro.ccs
let s = scene("Intro", sec(6));
let code = s.code(read("src/main.rs"), "rust", "base16-ocean.dark", 96, 150);
code.font_size(40).fade_in(0, ms(600)).typewriter(ms(200), sec(2.8));
s.camera().focus_on(code, 90, 24, 1.8, 4);   // push in on line 4

let terrain = s.terrain(700, 120, 480, 480);
terrain.seed(7).octaves(6).cells(120, 120).mode("heightmap");
s.link(code, 1, terrain, 70, 70);   // spotlight + arrow + reveal, in sync`,
      caption: "A scene script: typed-in code, a camera push-in, and a simulation linked to line 1.",
    },
  },

  // ── 2. spdf ────────────────────────────────────────────────────────────
  {
    slug: "spdf",
    kicker: "Document parsing · Rust",
    headline: "Layout-preserving PDF text extraction in Rust, benchmarked in the open",
    summary:
      "spdf extracts text from PDFs while keeping columns, tables and reading order intact, with optional OCR for scanned pages. It ships as a single binary and as crates on crates.io. On the published benchmark it matches LiteParse's accuracy closely while running several times faster.",
    role: "Author and maintainer — parser architecture, benchmarks, release pipeline",
    stack: ["Rust", "PDFium", "Tesseract", "clap", "proptest", "cargo-fuzz", "GitHub Actions"],
    metrics: [
      { value: "317 ms", label: "mean time per benchmark fixture (LiteParse: 2,236 ms)" },
      { value: "0.990", label: "token F1 vs LiteParse on a real tax bill" },
      { value: "0.679", label: "mean bounding-box IoU (LiteParse: 0.482)" },
      { value: "9", label: "crates published to crates.io by CI" },
    ],
    pipeline: [
      { label: "Input", detail: "PDF, image, or Office doc (converted via LibreOffice / ImageMagick)" },
      { label: "PDFium", detail: "Per-glyph text and geometry behind a PdfEngine trait" },
      { label: "OCR", detail: "Optional: local Tesseract or any HTTP OCR server" },
      { label: "Projection", detail: "Word rebuild, dedup, filtering, column-aware layout" },
      { label: "Output", detail: "Layout text or JSON with per-item bounding boxes" },
    ],
    problem: `Most PDF-to-text tools collapse whitespace and shuffle columns. That's fine for search indexing, but useless when *where* text sits on the page matters: invoices, tax bills, property records, scientific tables, legal forms.

Real-world PDFs make this worse: some draw text twice to fake bold (\`TaTax Infofo\`), emit one glyph at a time (\`1 8 3 6\`), or embed QR codes as hundreds of tiny numeric glyphs that wreck the table around them.`,
    approach: `spdf uses PDFium for glyph extraction and puts the real work in a spatial projection crate that rebuilds words, removes faux-bold shadows, drops QR/microprint noise, and lays text back out in reading order with its geometry intact. The workspace is split into focused crates (types, PDF engine, OCR engine, projection, conversion, output, orchestrator, CLI, C ABI).

The design target was LiteParse, the TypeScript project whose spatial projection approach inspired it. spdf emits a JSON schema byte-compatible with LiteParse's, and a parity harness checks it against reference outputs. A separate benchmark compares both engines against raw Tesseract ground truth on public-domain fixtures (IRS forms, NIST publications, RFCs, a scanned image), including bounding-box accuracy rather than just token overlap.`,
    decisions: [
      {
        title: "Publish the benchmark, including the losses",
        body: "The benchmark tables are generated by a script, raw per-fixture outputs are committed, and the losses stay in: LiteParse edges spdf on F1 for the IRS 1040 and W-9 fixtures. Spatial precision (IoU and centroid error) is measured too, because a spatial parser that gets the words right but puts them in the wrong place hasn't done its job.",
      },
      {
        title: "OCR behind a trait, with an HTTP backend",
        body: "Local Tesseract links C libraries through bindgen, which is painful on Windows. Instead of making OCR mandatory, it is feature-gated and an HTTP backend accepts any OCR server (PaddleOCR, EasyOCR). Prebuilt binaries stay self-contained, and every platform still has an OCR path.",
      },
      {
        title: "Hardening for untrusted input before 1.0",
        body: "The public API has a typed error enum, a builder with resource guards (timeout, max input bytes, max pages to reject page-tree bombs), property tests for panic-freedom and shuffle-stability, and a fuzz harness. Parsing hostile PDFs is a realistic use case, so these went in before the API was called stable.",
      },
    ],
    outcome: `spdf is at 0.2.0-alpha with all crates on crates.io, a fully automated tag-to-release workflow, and CI across Linux, macOS and Windows. Across the benchmark fixtures it averages 81.5% F1 in 317 ms against LiteParse's 77.4% in 2,236 ms, with about 25 ms cold start. Node and Python bindings and a local HTTP service are next. It shows production-minded Rust: measurable results, honest comparisons, and attention to packaging and security.`,
    snippet: {
      lang: "rust",
      code: `use spdf_core::SpdfParser;

let parser = SpdfParser::builder()
    .timeout_secs(30)           // defensive deadline
    .max_input_bytes(50 << 20)  // 50 MiB input cap
    .max_pages(500)             // reject page-tree bombs
    .build();

let result = parser.parse(std::path::Path::new("invoice.pdf"))?;`,
      caption: "The recommended configuration for parsing untrusted PDFs.",
    },
  },

  // ── 3. adaptive-codegraph ──────────────────────────────────────────────
  {
    slug: "adaptive-codegraph",
    kicker: "Developer tooling & AI context · Rust",
    headline: "A code graph and search index that gives AI assistants structure, not just text",
    summary:
      "adaptive-codegraph parses a codebase into a graph of symbols and call/import edges, indexes it for ranked and semantic search, and serves it to AI assistants over MCP. Supporting a new language takes a TOML file and two tree-sitter query files, with no Rust changes.",
    role: "Author — architecture, extraction engine, CLI and MCP server",
    stack: ["Rust", "tree-sitter", "petgraph", "Tantivy (BM25)", "fastembed", "BLAKE3", "MCP / JSON-RPC 2.0"],
    metrics: [
      { value: "3", label: "files to add a language, zero Rust code" },
      { value: "6", label: "built-in grammars (C, JS, TS, Rust, Python, Go)" },
      { value: "384-dim", label: "transformer embeddings for semantic search" },
      { value: "4", label: "crates: core, CLI, MCP server, daemon" },
    ],
    pipeline: [
      { label: "Parse", detail: "tree-sitter builds a concrete syntax tree per file" },
      { label: "Extract", detail: ".scm queries pull out symbols and edges" },
      { label: "Graph", detail: "petgraph nodes/edges with O(1) side indexes" },
      { label: "Index", detail: "Tantivy BM25 + optional vector embeddings" },
      { label: "Serve", detail: "CLI queries and MCP tools over stdio" },
    ],
    problem: `\`grep\` answers "where does this string appear", not "who calls this function" or "what does \`main\` depend on". AI coding assistants hit the same wall: text matches give them comments, string literals and imports alongside the one definition they needed.

The project it is modelled on, mie-codegraph, solved this with hand-written extractors per language (around 200 lines of Rust each) and hardcoded symbol kinds, so every new language meant new code and a recompile.`,
    approach: `Extraction is driven entirely by tree-sitter S-expression queries. Each language is a \`.toml\` definition plus a symbol query and an edge query; languages are auto-detected from marker files such as \`Cargo.toml\`, \`go.mod\` or \`package.json\`.

Symbols and edges go into a directed graph that supports callers, callees and BFS neighbourhood queries. Every symbol is also indexed in Tantivy with BM25 ranking across name, qualified name, signature and path, and optionally embedded so that a search for "authenticate user" can find \`verify_credentials\`. The index persists to \`.adaptive-codegraph/\`, and reindexing uses \`git diff\` to process only changed files. The same core powers a CLI and an MCP server that plugs into VS Code / Copilot.`,
    decisions: [
      {
        title: "Strings, not enums, for symbol and edge kinds",
        body: "Rust enums would give exhaustive matching, but every new language construct would mean editing the enum and recompiling. String kinds let a query file introduce new symbol or edge types on its own. It gives up some compile-time safety so that languages can be added purely as data.",
      },
      {
        title: "Stable symbol IDs from BLAKE3",
        body: "Each symbol's ID is a BLAKE3 hash of its language, kind, fully-qualified name and file path. IDs are deterministic and survive edits that don't rename or move the symbol, which is what makes git-aware incremental reindexing and stable references for AI tools possible.",
      },
      {
        title: "Tiered embeddings",
        body: "Semantic search uses fastembed's BGE-small-en-v1.5 model (384 dimensions) when built with it; without it, a deterministic 32-dimension BLAKE3 hash embedding keeps vector search working with no model download. A regex plugin system covers framework-specific edges, such as Django routes, that syntax queries can't see.",
      },
    ],
    outcome: `The core library, CLI and MCP server are complete, with six grammars built in; the file-watching daemon is still a skeleton. The repository is public on GitHub. The project sits where systems programming meets agentic AI: it gives an assistant the same structural view of a codebase an experienced engineer builds in their head, and it is designed so that supporting a new language takes data rather than a code change.`,
    snippet: {
      lang: "bash",
      code: `cd /path/to/your/project
adaptive-codegraph init            # set up .adaptive-codegraph/
adaptive-codegraph index

adaptive-codegraph search "parse_config"
adaptive-codegraph callers "handle_request"
adaptive-codegraph neighborhood "main" --depth 3`,
      caption: "Index once, then query structure: search, callers, and a dependency neighbourhood.",
    },
  },

  // ── 4. pskey ───────────────────────────────────────────────────────────
  {
    slug: "pskey",
    kicker: "Security · Desktop app · Tauri + Rust",
    headline: "A tiny password-manager widget with a threat model that holds up",
    summary:
      "PSKey is a 145 px, always-on-top password manager built with Tauri, React and libsodium. It keeps a 4-digit PIN practical by mixing a per-install device secret into every key derivation, and it defeats keystroke capture with a rolling challenge, so the PIN itself is never typed.",
    role: "Author — threat model, cryptographic design, Rust backend, UI",
    stack: ["Tauri 2", "Rust", "React 19", "TypeScript", "libsodium", "Argon2id", "XSalsa20-Poly1305"],
    metrics: [
      { value: "145 px", label: "wide transparent widget" },
      { value: "32 B", label: "device secret mixed into every Argon2id derivation" },
      { value: "30 s", label: "challenge rotation and sliding session TTL" },
      { value: "15 s", label: "until copied secrets are wiped from the clipboard" },
    ],
    pipeline: [
      { label: "Challenge", detail: "4-char Base36 code, rotates every 30 s and on failure" },
      { label: "Response", detail: "User types PIN + challenge, mod 36, per slot" },
      { label: "Decode", detail: "Rust recovers exactly one candidate PIN" },
      { label: "Argon2id", detail: "Key from PIN ‖ device secret, off the UI thread" },
      { label: "secretbox", detail: "MAC verifies; vault decrypts into zeroized memory" },
    ],
    problem: `A short PIN is convenient for something you open dozens of times a day, but a 10,000-value keyspace normally makes a stolen vault file trivial to brute-force. Typing the PIN also leaves it exposed to anything that records keystrokes.

The challenge was to keep the unlock flow fast and the window tiny while staying honest about what the design does and doesn't protect against.`,
    approach: `All cryptography runs in the Rust backend through libsodium: Argon2id for key derivation (Interactive, Moderate or Sensitive strength, selectable per vault) and XSalsa20-Poly1305 secretbox for the vault, nothing hand-rolled. The session token, clipboard writes and lockout state also live in Rust, so the web front-end never holds anything worth stealing.

- Entries can carry their own PIN and are sealed under a separate key, so unlocking the vault doesn't reveal them.
- The vault is written atomically with a \`.bak\` rotation, and older v01 vaults migrate to v02 on first unlock.
- The front-end runs under a strict CSP with no remote assets and minimal Tauri capabilities.`,
    decisions: [
      {
        title: "A device secret outside the vault file",
        body: "Every Argon2id input is the PIN concatenated with 32 random bytes stored in a separate file (mode 0600 on Unix). A leaked vault.bin from a backup or cloud sync can't be brute-forced on its own. The cost is operational: both files have to be backed up together, and an attacker who can read both has the full KDF input. The README says so plainly and names OS keychain storage as the next step.",
      },
      {
        title: "A rolling challenge instead of typing the PIN",
        body: "The user types (PIN digit + challenge value) mod 36 for each slot, so a recorded keystroke sequence can't be replayed. The backend reverses the maths and runs exactly one Argon2id derivation per attempt, with no candidate enumeration. Slots that can't decode to a digit are rejected as typos without using up a lockout attempt.",
      },
      {
        title: "Let the MAC be the check, and make lockout persistent",
        body: "There is no stored PIN hash to compare against: a wrong PIN simply fails secretbox authentication. Failed attempts feed an escalating lockout (1 minute up to a 24-hour cap) that is written to disk, so killing the process or rebooting doesn't reset it.",
      },
    ],
    outcome: `PSKey is in alpha and public under MIT, targeting macOS, Linux and Windows. The README is explicit about what it doesn't defend against (malware running as the user, simultaneous screen and keystroke capture), and the roadmap lists packaging, encrypted import/export and tests for the vault format. It shows security work done properly: a defined threat model, standard primitives used correctly, and UX choices that serve the security goals.`,
    snippet: {
      lang: "text",
      code: `response[i] = base36( (pin_digit[i] + value(challenge[i])) mod 36 )

challenge   7  Z  5  8
PIN         1  2  3  4
you type    8  1  8  C`,
      caption: "The rolling-challenge rule: the memorised PIN is never what gets typed.",
    },
  },
];
