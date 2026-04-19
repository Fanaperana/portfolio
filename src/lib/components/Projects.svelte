<script lang="ts">
  import { PROJECTS, type Project } from '$lib/data/projects'
  import { Button } from '$lib/components/ui/button'
  import ProjectCard from './ProjectCard.svelte'
  import { Sparkles } from '@lucide/svelte'

  const languages = Array.from(new Set(PROJECTS.map((p) => p.language))).sort()
  let active = $state<string | null>(null)
  let scope = $state<'all' | 'public' | 'private'>('all')
  let topic = $state<'all' | 'ai'>('all')

  const AI_TAGS = new Set(['ai', 'llm', 'ml', 'agent', 'asr', 'whisper', 'computer-vision'])
  const isAi = (p: Project) => p.tags.some((t) => AI_TAGS.has(t.toLowerCase()))

  const publicCount = PROJECTS.filter((p) => p.visibility !== 'private').length
  const privateCount = PROJECTS.filter((p) => p.visibility === 'private').length
  const aiCount = PROJECTS.filter(isAi).length

  const filtered = $derived(
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
</script>

<section id="projects" class="scroll-mt-20 py-16">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="font-mono text-2xl font-semibold text-foreground">
        <span class="text-muted-foreground/60"># </span>projects
      </h2>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        Curated from github.com/Fanaperana — public and private alike. Filter by topic or language, or open the terminal and run
        <code class="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-primary">sh "projects | lang rust | sort stars"</code>.
      </p>
    </div>
  </div>

  <div class="mt-6 flex flex-wrap items-center gap-2 font-mono text-xs">
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
