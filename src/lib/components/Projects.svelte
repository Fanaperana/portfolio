<script lang="ts">
  import { PROJECTS, type Project } from '$lib/data/projects'
  import { Button } from '$lib/components/ui/button'
  import ProjectCard from './ProjectCard.svelte'
  import { Sparkles, Search, X } from '@lucide/svelte'
  import { search, loadSearch } from '$lib/wasm/search'
  import { href } from '$lib/router.svelte'

  const languages = Array.from(new Set(PROJECTS.map((p) => p.language))).sort()
  let active = $state<string | null>(null)
  let scope = $state<'all' | 'public' | 'private'>('all')
  let topic = $state<'all' | 'ai'>('all')

  const AI_TAGS = new Set(['ai', 'llm', 'ml', 'agent', 'asr', 'whisper', 'computer-vision'])
  const isAi = (p: Project) => p.tags.some((t) => AI_TAGS.has(t.toLowerCase()))

  const publicCount = PROJECTS.filter((p) => p.visibility !== 'private').length
  const privateCount = PROJECTS.filter((p) => p.visibility === 'private').length
  const aiCount = PROJECTS.filter(isAi).length

  // Typo-tolerant search, run by fuzzly (my Rust crate) compiled to WASM.
  let query = $state('')
  let ranked = $state<string[] | null>(null) // slugs, best first; null = no query
  let stats = $state<{ ms: number; terms: number; count: number } | null>(null)
  let searchError = $state(false)

  $effect(() => {
    const q = query.trim()
    if (!q) {
      ranked = null
      stats = null
      return
    }
    let stale = false
    search(PROJECTS, q)
      .then((r) => {
        if (stale) return
        ranked = r.hits.map((h) => h.project.slug)
        stats = { ms: r.ms, terms: r.terms, count: r.hits.length }
      })
      .catch(() => {
        // WASM unavailable: fall back to a plain substring match.
        searchError = true
        const lq = q.toLowerCase()
        ranked = PROJECTS.filter((p) =>
          [p.title, p.description, p.tags.join(' '), p.language].join(' ').toLowerCase().includes(lq),
        ).map((p) => p.slug)
        stats = null
      })
    return () => (stale = true)
  })

  const base = $derived(
    PROJECTS.filter((p) => {
      if (scope === 'public' && p.visibility === 'private') return false
      if (scope === 'private' && p.visibility !== 'private') return false
      if (topic === 'ai' && !isAi(p)) return false
      if (active && p.language !== active) return false
      return true
    })
      .slice()
      .sort((a, b) => {
        // featured first, then by most-recent push
        if (!!a.highlight !== !!b.highlight) return a.highlight ? -1 : 1
        return b.pushed_at.localeCompare(a.pushed_at)
      })
  )

  const filtered = $derived(
    ranked === null
      ? base
      : ranked.map((slug) => base.find((p) => p.slug === slug)).filter((p): p is Project => !!p)
  )
</script>

<section id="projects" class="scroll-mt-20 py-16">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="font-mono text-2xl font-semibold text-foreground">
        <span class="text-muted-foreground/60"># </span>all projects
      </h2>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        Everything else I've built, public and private. Search (typos are fine), filter by topic or language, or open the terminal and run
        <code class="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-primary">sh "projects | lang rust | sort stars"</code>.
      </p>
    </div>
  </div>

  <div class="mt-6">
    <label class="relative block max-w-xl">
      <span class="sr-only">Search projects</span>
      <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        bind:value={query}
        onfocus={() => loadSearch(PROJECTS).catch(() => (searchError = true))}
        placeholder="search projects — try “pasword manger” or “pdf rust”"
        autocomplete="off"
        spellcheck="false"
        class="h-11 w-full rounded-lg border border-border/80 bg-card/60 pl-9 pr-9 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {#if query}
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
          onclick={() => (query = '')}><X class="size-4" /></button
        >
      {/if}
    </label>
    <p class="mt-2 h-4 font-mono text-[11px] text-muted-foreground" aria-live="polite">
      {#if stats}
        <span class="text-primary">fuzzly</span> · Rust → WASM · {stats.count} match{stats.count === 1 ? '' : 'es'} across {stats.terms} terms in
        <span class="text-foreground">{stats.ms < 0.1 ? '<0.1' : stats.ms.toFixed(2)} ms</span>
        · <a href={href('/projects/fuzzy-search-rs')} class="underline decoration-dotted hover:text-primary">how it works</a>
      {:else if searchError && query}
        basic search (WASM unavailable)
      {/if}
    </p>
  </div>

  <div class="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs">
    <!-- visibility scope -->
    <div class="flex items-center gap-1 rounded-full border border-border/80 bg-card/40 p-1">
      <Button
        variant={scope === 'all' ? 'default' : 'ghost'}
        size="sm"
        class="h-7 rounded-full px-3"
        onclick={() => (scope = 'all')}
      >
        all ({PROJECTS.length})
      </Button>
      <Button
        variant={scope === 'public' ? 'default' : 'ghost'}
        size="sm"
        class="h-7 rounded-full px-3"
        onclick={() => (scope = 'public')}
      >
        public ({publicCount})
      </Button>
      <Button
        variant={scope === 'private' ? 'default' : 'ghost'}
        size="sm"
        class="h-7 rounded-full px-3"
        onclick={() => (scope = 'private')}
      >
        private ({privateCount})
      </Button>
    </div>

    <!-- topic toggle -->
    <div class="flex items-center gap-1 rounded-full border border-border/80 bg-card/40 p-1">
      <Button
        variant={topic === 'all' ? 'default' : 'ghost'}
        size="sm"
        class="h-7 rounded-full px-3"
        onclick={() => (topic = 'all')}
      >
        all topics
      </Button>
      <Button
        variant={topic === 'ai' ? 'default' : 'ghost'}
        size="sm"
        class="h-7 gap-1 rounded-full px-3"
        onclick={() => (topic = 'ai')}
      >
        <Sparkles class="size-3" />
        AI ({aiCount})
      </Button>
    </div>

    <span class="mx-1 h-4 w-px bg-border/60"></span>

    <!-- language chips -->
    <Button
      variant={active === null ? 'default' : 'outline'}
      size="sm"
      class="rounded-full"
      onclick={() => (active = null)}
    >
      all langs
    </Button>
    {#each languages as lang}
      {@const count = PROJECTS.filter((p) => p.language === lang).length}
      <Button
        variant={active === lang ? 'default' : 'outline'}
        size="sm"
        class="rounded-full"
        onclick={() => (active = lang)}
      >
        {lang} ({count})
      </Button>
    {/each}
  </div>

  <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each filtered as project (project.slug)}
      <ProjectCard {project} />
    {/each}
  </div>

  {#if filtered.length === 0}
    <p class="mt-10 text-center font-mono text-sm text-muted-foreground">
      no projects match that filter.
    </p>
  {/if}
</section>
