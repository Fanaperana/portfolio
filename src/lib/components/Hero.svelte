<script lang="ts">
  import { PROFILE } from "$lib/data/projects";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { FolderTree, FileDown, Mail, Briefcase } from "@lucide/svelte";
  import { POSITIONING } from "$lib/data/site";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import LinkedinIcon from "./icons/LinkedinIcon.svelte";
  import AnimatedBackdrop from "./AnimatedBackdrop.svelte";
  import IsoScene from "./IsoScene.svelte";
</script>

<section id="top" class="relative overflow-hidden pt-16 pb-24 sm:pt-24">
  <AnimatedBackdrop />

  <div class="relative grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
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

    <IsoScene />
  </div>
</section>
