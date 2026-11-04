// Copy for the homepage sections that aren't driven by GitHub data.
// Edit freely — layout lives in the components.

export const POSITIONING = {
  pitch:
    "I design and build fast, dependable software — developer tools, desktop apps, web products and AI agents — mostly in Rust and TypeScript.",
  availability: "Available for full-time roles and freelance projects.",
};

export const SERVICES = [
  {
    icon: "cpu",
    title: "Rust & performance",
    body: "CLIs, parsers, libraries and WebAssembly modules. Rewriting slow hot paths so they stay fast as data grows.",
    tags: ["Rust", "WASM", "profiling"],
  },
  {
    icon: "monitor",
    title: "Desktop apps",
    body: "Cross-platform apps with Tauri: small installers, native speed, and a modern web UI on macOS, Windows and Linux.",
    tags: ["Tauri", "Rust", "Svelte / React"],
  },
  {
    icon: "globe",
    title: "Web apps & MVPs",
    body: "From idea to production: Svelte, React or Vue front-ends with Node or Laravel back-ends, deployed and monitored.",
    tags: ["TypeScript", "Svelte", "Laravel"],
  },
  {
    icon: "brain",
    title: "AI & agents",
    body: "LLM features that hold up in production: tool-using agents, speech-to-text pipelines, retrieval and evaluation harnesses.",
    tags: ["LLMs", "agents", "Whisper"],
  },
  {
    icon: "wrench",
    title: "Developer tooling",
    body: "Code intelligence, language tooling, editor integrations and internal tools that make teams faster.",
    tags: ["parsers", "LSP", "CLIs"],
  },
  {
    icon: "life-buoy",
    title: "Rescue & maintenance",
    body: "Taking over an existing codebase: fixing bugs, adding tests, upgrading dependencies and documenting what's there.",
    tags: ["audits", "tests", "docs"],
  },
] as const;

export const PROCESS = [
  { step: "01", title: "Call", body: "A short call to understand the problem, constraints and budget." },
  { step: "02", title: "Proposal", body: "A written scope with milestones, a timeline and a fixed or hourly quote." },
  { step: "03", title: "Build", body: "Working software early, with regular demos so there are no surprises." },
  { step: "04", title: "Handover", body: "Clean code, tests and docs, so your team can own it after I leave." },
] as const;

export const NEXT = {
  now: "Open to full-time roles and freelance projects.",
  later:
    "Longer term, I plan to start my own software company. If you're interested in hearing about it early, or in building something together, get in touch.",
};

export const CONTACT = {
  hireSubject: "Role opportunity",
  hireBody: "Hi Fanaperana,\n\nI'm reaching out about a role at ...\n",
  projectSubject: "Project inquiry",
  projectBody:
    "Hi Fanaperana,\n\nWhat we're building:\n\nTimeline:\n\nBudget range:\n",
};
