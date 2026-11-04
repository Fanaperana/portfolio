<script lang="ts">
  import { PROFILE, PROJECTS } from "$lib/data/projects";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import { FolderTree, FileDown, Mail, Briefcase } from "@lucide/svelte";
  import { POSITIONING } from "$lib/data/site";
  import { CASE_STUDIES } from "$lib/data/case-studies";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import LinkedinIcon from "./icons/LinkedinIcon.svelte";
  import AnimatedBackdrop from "./AnimatedBackdrop.svelte";

  const stacks = [
    { label: "Rust", pct: 40 },
    { label: "TypeScript", pct: 30 },
    { label: "Svelte / Vue", pct: 15 },
    { label: "PHP / Laravel", pct: 10 },
    { label: "Other", pct: 5 },
  ];

  const rustCount = PROJECTS.filter((p) => p.language === "Rust").length;
  const tsCount = PROJECTS.filter((p) => p.language === "TypeScript").length;
  const caseStudyCount = CASE_STUDIES.length;
</script>

<section id="top" class="relative overflow-hidden pt-16 pb-24 sm:pt-24">
  <AnimatedBackdrop />

  <div class="relative grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
    <div class="min-w-0">
      <Badge
        variant="outline"
        class="mb-4 flex w-fit max-w-full flex-wrap items-center gap-2 whitespace-normal bg-card/60 py-1 font-mono text-[11px] leading-snug text-muted-foreground"
      >
        <span class="relative flex h-2 w-2">
          <span
            class="animate-twinkle absolute inline-flex h-full w-full rounded-full bg-primary"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-primary"
          ></span>
        </span>
        <span>online · {PROFILE.status}</span>
        <span class="hidden text-muted-foreground/60 sm:inline">·</span>
        <span class="hidden sm:inline">{PROFILE.location}</span>
      </Badge>

      <h1
        class="font-mono text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
      >
        <span class="text-muted-foreground/60">&gt;</span>
        <span class="shimmer-text">{PROFILE.login}</span><span
          class="caret ml-1 text-primary"
        ></span>
      </h1>

      <p class="mt-3 font-mono text-sm text-primary/80">
        {PROFILE.role} &nbsp;·&nbsp; {PROFILE.headline}
      </p>

      <p class="mt-5 max-w-2xl text-lg text-foreground/90">
        {POSITIONING.pitch}
      </p>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        {POSITIONING.availability}
      </p>

      <div class="mt-8 flex flex-wrap gap-3 font-mono text-sm">
        <Button href="#work" size="lg">
          <FolderTree class="size-4" />
          see my work
        </Button>
        <Button variant="outline" href="#/resume" size="lg">
          <FileDown class="size-4" />
          hire me · résumé
        </Button>
        <Button variant="outline" href="#services" size="lg">
          <Briefcase class="size-4" />
          start a project
        </Button>
      </div>

      <div
        class="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground"
      >
        <a
          href={`mailto:${PROFILE.email}`}
          class="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <Mail class="size-3.5" />
          {PROFILE.email}
        </a>
        <span class="text-muted-foreground/40">·</span>
        <a
          href={PROFILE.linkedin}
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <LinkedinIcon class="size-3.5" />
          linkedin
        </a>
        <span class="text-muted-foreground/40">·</span>
        <a
          href={PROFILE.url}
          target="_blank"
          rel="noreferrer"
          class="inline-flex items-center gap-1.5 hover:text-primary"
        >
          <GithubIcon class="size-3.5" />
          github
        </a>
      </div>
    </div>

    <!-- decorative console card -->
    <Card.Root
      class="relative overflow-hidden border-border/80 bg-card/80 py-0 shadow-2xl"
    >
      <!-- Data stream dots along the top border -->
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden"
      >
        <div
          class="animate-stream absolute top-0 h-px w-24"
          style="background: linear-gradient(90deg, transparent, var(--color-accent), transparent);"
        ></div>
        <div
          class="animate-stream absolute top-0 h-px w-16"
          style="background: linear-gradient(90deg, transparent, var(--color-link), transparent); animation-delay: -3s; animation-duration: 9s;"
        ></div>
      </div>
      <div
        class="flex items-center gap-1.5 border-b border-border/80 px-4 py-2.5"
      >
        <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
        <span class="ml-2 font-mono text-xs text-muted-foreground/70"
          >~/portfolio</span
        >
      </div>
      <div class="p-5 font-mono text-sm">
        <div class="space-y-1 text-muted-foreground">
          <div><span class="text-primary">$</span> cargo build --release</div>
          <div class="text-muted-foreground/60">
            Compiling mini-shell v0.1.0
          </div>
          <div class="text-muted-foreground/60">Finished `release` profile</div>
          <div>
            <span class="text-primary">$</span> wasm-pack build --target web
          </div>
          <div class="text-muted-foreground/60">
            Your wasm pkg is ready to publish.
          </div>
          <div>
            <span class="text-primary">$</span> portfolio
            <span class="text-foreground">start</span>
          </div>
          <div class="pt-2 text-foreground">
            → {PROJECTS.length} projects · {rustCount} rust · {tsCount} ts · {caseStudyCount}
            case studies
          </div>
        </div>
        <div class="mt-4 space-y-2">
          {#each stacks as s}
            <div class="flex items-center gap-3 text-xs">
              <span class="w-24 text-muted-foreground">{s.label}</span>
              <div
                class="h-1.5 flex-1 overflow-hidden rounded-full bg-background"
              >
                <div
                  class="h-full bg-gradient-to-r from-primary to-[var(--color-link)]"
                  style="width: {s.pct}%"
                ></div>
              </div>
              <span class="w-10 text-right text-muted-foreground/60"
                >{s.pct}%</span
              >
            </div>
          {/each}
        </div>
      </div>
    </Card.Root>
  </div>
</section>
