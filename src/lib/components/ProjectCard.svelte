<script lang="ts">
  import type { Project } from '$lib/data/projects'
  import { timeAgo } from '$lib/time'
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import { Star, ArrowUpRight, Lock, ExternalLink } from '@lucide/svelte'
  import GithubIcon from './icons/GithubIcon.svelte'

  let { project }: { project: Project } = $props()

  function openDetail(e: MouseEvent | KeyboardEvent) {
    e.preventDefault()
    // Set hash; ProjectDetail listens for hashchange.
    location.hash = `#/p/${project.slug}`
  }

  const gradients: Record<string, string> = {
    teal: 'from-teal-500/25 to-cyan-900/10',
    amber: 'from-amber-500/25 to-orange-900/10',
    cyan: 'from-cyan-500/25 to-sky-900/10',
    fuchsia: 'from-fuchsia-500/25 to-purple-900/10',
    orange: 'from-orange-500/25 to-rose-900/10',
    rose: 'from-rose-500/25 to-pink-900/10',
    red: 'from-red-500/25 to-rose-900/10',
    sky: 'from-sky-500/25 to-indigo-900/10',
    violet: 'from-violet-500/25 to-indigo-900/10',
    emerald: 'from-emerald-500/25 to-teal-900/10',
    green: 'from-green-500/25 to-emerald-900/10',
  }

  const gradient = $derived(gradients[project.accent ?? 'teal'] ?? gradients.teal)

  const thumbSrc = $derived.by(() => {
    const t = project.thumbnail
    if (!t) return ''
    if (/^https?:\/\//.test(t)) return t
    return import.meta.env.BASE_URL + t.replace(/^\/+/, '')
  })
</script>

<div
  role="button"
  tabindex="0"
  aria-label={`Open ${project.title} case study`}
  onclick={openDetail}
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') openDetail(e)
  }}
  class="group block cursor-pointer transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_-8px_var(--color-accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
>
  <Card.Root
    class="gap-0 overflow-hidden border-border/80 bg-card/60 py-0 transition group-hover:border-primary/60"
  >
    <!-- thumbnail -->
    <div
      class="relative h-36 overflow-hidden border-b border-border/80 bg-gradient-to-br {gradient}"
    >
      {#if thumbSrc}
        <img
          src={thumbSrc}
          alt="{project.title} screenshot"
          loading="lazy"
          decoding="async"
          class="absolute inset-0 h-full w-full object-cover object-top opacity-90 transition group-hover:scale-[1.02] group-hover:opacity-100"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-card/70 via-card/10 to-transparent"></div>
      {:else}
        <div
          class="absolute inset-0 opacity-30"
          style="background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px); background-size: 22px 22px;"
        ></div>
        <div class="relative flex h-full w-full items-center justify-center">
          <span class="font-mono text-7xl text-foreground opacity-70 drop-shadow-lg">
            {project.glyph ?? '▢'}
          </span>
        </div>
      {/if}
      <Badge
        variant="outline"
        class="absolute top-2 left-2 bg-background/70 font-mono text-[10px] backdrop-blur"
      >
        {project.language}
      </Badge>
      {#if project.visibility === 'private'}
        <Badge
          variant="outline"
          class="absolute top-2 left-1/2 -translate-x-1/2 gap-1 border-amber-500/40 bg-background/70 font-mono text-[10px] text-amber-300 backdrop-blur"
        >
          <Lock class="size-3" />
          private
        </Badge>
      {/if}
      {#if project.highlight}
        <Badge class="absolute top-2 right-2 bg-primary font-mono text-[10px] text-primary-foreground">
          featured
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
        <h3 class="font-mono text-base font-semibold text-foreground group-hover:text-primary">
          {project.title}
        </h3>
        <span class="flex-none font-mono text-[10px] text-muted-foreground/70">
          {timeAgo(project.pushed_at)}
        </span>
      </div>
      <p class="flex-1 text-sm text-muted-foreground">{project.description}</p>
      <div class="flex flex-wrap gap-2">
        {#if project.visibility !== 'private'}
          <button
            type="button"
            class="group/link inline-flex w-fit items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:border-primary/60 hover:text-primary"
            onclick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(project.url, '_blank', 'noopener,noreferrer')
            }}
          >
            <GithubIcon class="size-3" />
            <span>github</span>
          </button>
        {/if}
        {#if project.homepage}
          <button
            type="button"
            class="group/link inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary transition hover:border-primary hover:bg-primary/20"
            onclick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.open(project.homepage, '_blank', 'noopener,noreferrer')
            }}
          >
            <ExternalLink class="size-3" />
            <span>visit {new URL(project.homepage).host.replace(/^www\./, '')}</span>
          </button>
        {/if}
      </div>
      <div class="flex flex-wrap gap-1">
        {#each project.tags.slice(0, 5) as t}
          <Badge variant="outline" class="font-mono text-[10px] text-muted-foreground/80">
            #{t}
          </Badge>
        {/each}
      </div>
    </div>
  </Card.Root>
</div>
