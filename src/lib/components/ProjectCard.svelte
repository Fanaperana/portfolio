<script lang="ts">
  import type { Project } from "$lib/data/projects";
  import { timeAgo } from "$lib/time";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Star, ArrowUpRight, Lock, ExternalLink } from "@lucide/svelte";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import { href } from "$lib/router.svelte";
  import Diorama from "./Diorama.svelte";

  let { project }: { project: Project } = $props();


  let hot = $state(false);
</script>

<div
  onpointerenter={() => (hot = true)}
  onpointerleave={() => (hot = false)}
  onfocusin={() => (hot = true)}
  onfocusout={() => (hot = false)}
  class="group relative block cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_-8px_var(--color-accent-soft)] focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background"
>
  <Card.Root
    class="gap-0 overflow-hidden border-border/80 bg-card/60 py-0 transition group-hover:border-primary/60"
  >
    <!-- thumbnail -->
    <div class="relative aspect-[16/10] overflow-hidden border-b border-border/80">
      <Diorama slug={project.slug} active={hot} fallback={project.glyph ?? "▢"} class="absolute inset-0" />
      <Badge
        variant="outline"
        class="absolute top-2 left-2 bg-background/70 font-mono text-[10px] backdrop-blur"
      >
        {project.language}
      </Badge>
      {#if project.visibility === "private"}
        <Badge
          variant="outline"
          class="absolute top-2 left-1/2 -translate-x-1/2 gap-1 border-amber-500/40 bg-background/70 font-mono text-[10px] text-amber-300 backdrop-blur"
        >
          <Lock class="size-3" />
          private
        </Badge>
      {/if}
      {#if project.highlight}
        <Badge
          class="absolute top-2 right-2 bg-primary font-mono text-[10px] text-primary-foreground"
        >
          case study
        </Badge>
      {:else}
        <ArrowUpRight
          class="absolute top-2 right-2 size-4 text-primary opacity-0 transition group-hover:opacity-100"
        />
      {/if}
      {#if project.stars > 0}
        <Badge
          variant="outline"
          class="absolute right-2 bottom-2 gap-1 bg-background/70 font-mono text-[10px] backdrop-blur"
        >
          <Star class="size-3" />
          {project.stars}
        </Badge>
      {/if}
    </div>

    <div class="flex flex-1 flex-col gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3
          class="font-mono text-base font-semibold text-foreground group-hover:text-primary"
        >
          <a
            href={href(`/projects/${project.slug}`)}
            class="after:absolute after:inset-0 after:content-[''] focus:outline-none"
            >{project.title}</a
          >
        </h3>
        <span class="flex-none font-mono text-[10px] text-muted-foreground/70">
          {timeAgo(project.pushed_at)}
        </span>
      </div>
      <p class="flex-1 text-sm text-muted-foreground">{project.description}</p>
      <div class="flex flex-wrap gap-2">
        {#if project.visibility !== "private"}
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            class="relative z-10 group/link inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
          >
            <GithubIcon class="size-3" />
            <span>github</span>
          </a>
        {/if}
        {#if project.homepage}
          <a
            href={project.homepage}
            target="_blank"
            rel="noreferrer"
            class="relative z-10 group/link inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary transition hover:border-primary hover:bg-primary/20"
          >
            <ExternalLink class="size-3" />
            <span
              >visit {new URL(project.homepage).host.replace(
                /^www\./,
                ""
              )}</span
            >
          </a>
        {/if}
      </div>
      <div class="flex flex-wrap gap-1">
        {#each project.tags.slice(0, 5) as t}
          <Badge
            variant="outline"
            class="font-mono text-[10px] text-muted-foreground/80"
          >
            #{t}
          </Badge>
        {/each}
      </div>
    </div>
  </Card.Root>
</div>
