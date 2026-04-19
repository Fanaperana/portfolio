<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Cog,
    Code2,
    Boxes,
    Brain,
    Terminal as TerminalIcon,
    Cpu,
    Sparkles,
    Languages,
    Layers,
  } from "@lucide/svelte";
  import { PROFILE, PROJECTS } from "$lib/data/projects";
  import GitHubStats from "./GitHubStats.svelte";

  const items = [
    {
      title: "Rust & systems",
      body: "TUIs, CLIs, tiny languages, numerics. The mini-shell powering the terminal below is hand-rolled Rust compiled to WASM.",
      Icon: Cog,
    },
    {
      title: "Agentic AI",
      body: "Planner + tools loops, local-first agents, continual learning. Research-grade writing (AVIL) with practical implementations (sentinel, continuum).",
      Icon: Brain,
    },
    {
      title: "Web craft",
      body: "Svelte 5, React, Vue. Prefer zero-JS-by-default pages, tiny bundles, keyboard-first UIs, and node-based infinite canvases.",
      Icon: Code2,
    },
    {
      title: "Desktop & embedded",
      body: "Tauri apps, Wayland compositors, kiosk builds on bare Ubuntu. I like getting close to the machine.",
      Icon: Boxes,
    },
  ];

  // Small hobby icons — one per line, mapped by keyword.
  function iconFor(s: string) {
    const t = s.toLowerCase();
    if (t.includes("os") || t.includes("kernel")) return Cpu;
    if (t.includes("parser") || t.includes("language")) return Languages;
    if (t.includes("canvas") || t.includes("node")) return Layers;
    if (t.includes("terminal")) return TerminalIcon;
    if (t.includes("motion") || t.includes("effects")) return Sparkles;
    return Sparkles;
  }

  const rustCount = PROJECTS.filter((p) => p.language === "Rust").length;
  const publicCount = PROJECTS.filter((p) => p.visibility !== "private").length;
</script>

<section id="about" class="scroll-mt-20 py-16">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="font-mono text-2xl font-semibold text-foreground">
        <span class="text-muted-foreground/60"># </span>about
      </h2>
      <p class="mt-3 max-w-3xl text-muted-foreground">
        I build small, sharp tools. This page is itself one — a Vite + Svelte
        front-end with a Rust core, packaged as a monorepo:
        <span class="font-mono text-primary">crates/mini-shell</span>
        ships the shell language;
        <span class="font-mono text-primary">src/</span>
        renders and drives it.
      </p>
    </div>
    <Badge
      variant="outline"
      class="font-mono text-[11px] text-muted-foreground"
    >
      {PROFILE.years}+ years · {PROJECTS.length} shipped · {rustCount} in Rust ·
      {publicCount} public
    </Badge>
  </div>

  <!-- Core focus cards -->
  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {#each items as it (it.title)}
      <Card.Root
        class="group border-border/80 bg-card/50 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-accent-soft)]"
      >
        <Card.Header>
          <div
            class="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary/20"
          >
            <it.Icon class="size-5" />
          </div>
          <Card.Title class="font-mono text-sm">{it.title}</Card.Title>
        </Card.Header>
        <Card.Content>
          <p class="text-sm text-muted-foreground">{it.body}</p>
        </Card.Content>
      </Card.Root>
    {/each}
  </div>

  <!-- Expertise + Hobbies row -->
  <div class="mt-10 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
    <!-- Expertise bars -->
    <Card.Root class="border-border/80 bg-card/50">
      <Card.Header>
        <Card.Title class="font-mono text-sm">
          <span class="text-muted-foreground/60">$ </span>cat expertise.toml
        </Card.Title>
      </Card.Header>
      <Card.Content>
        <div class="space-y-3 font-mono text-xs">
          {#each PROFILE.expertise as e (e.label)}
            <div class="grid grid-cols-[7rem_auto_1fr] items-center gap-3">
              <span class="text-foreground">{e.label}</span>
              <span class="text-muted-foreground/70" aria-hidden="true">
                {"█".repeat(e.level)}<span class="text-muted-foreground/20"
                  >{"░".repeat(5 - e.level)}</span
                >
              </span>
              <span class="truncate text-muted-foreground">{e.note}</span>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>

    <!-- Hobbies / enthusiasm -->
    <Card.Root class="relative overflow-hidden border-border/80 bg-card/50">
      <!-- A very subtle SVG sparkline behind the header -->
      <svg
        class="pointer-events-none absolute inset-x-0 top-0 h-16 w-full opacity-40"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stop-color="var(--color-accent)"
              stop-opacity="0.35"
            />
            <stop
              offset="100%"
              stop-color="var(--color-accent)"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>
        <path
          d="M0,60 C40,20 80,70 120,40 S200,10 240,50 S320,20 400,45 L400,80 L0,80 Z"
          fill="url(#spark)"
        />
        <path
          class="animate-dash"
          d="M0,60 C40,20 80,70 120,40 S200,10 240,50 S320,20 400,45"
          fill="none"
          stroke="var(--color-accent)"
          stroke-width="1"
          stroke-dasharray="3 6"
          opacity="0.8"
        />
      </svg>

      <Card.Header class="relative">
        <Card.Title class="font-mono text-sm">
          <span class="text-muted-foreground/60">$ </span>whoami --hobbies
        </Card.Title>
      </Card.Header>
      <Card.Content class="relative">
        <ul class="grid gap-2 text-sm text-muted-foreground">
          {#each PROFILE.hobbies as h (h)}
            {@const Ico = iconFor(h)}
            <li class="flex items-start gap-2">
              <Ico class="mt-0.5 size-4 flex-none text-primary/80" />
              <span>{h}</span>
            </li>
          {/each}
        </ul>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- GitHub heatmap + language breakdown (build-time fetched) -->
  <GitHubStats />
</section>
