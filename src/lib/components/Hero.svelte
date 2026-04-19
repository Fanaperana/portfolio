<script lang="ts">
  import { PROFILE, PROJECTS } from '$lib/data/projects'
  import { Button } from '$lib/components/ui/button'
  import { Badge } from '$lib/components/ui/badge'
  import * as Card from '$lib/components/ui/card'
  import { Play, FolderTree } from '@lucide/svelte'
  import GithubIcon from './icons/GithubIcon.svelte'

  const stacks = [
    { label: 'Rust', pct: 40 },
    { label: 'TypeScript', pct: 30 },
    { label: 'Svelte / Vue', pct: 15 },
    { label: 'PHP / Laravel', pct: 10 },
    { label: 'Other', pct: 5 },
  ]

  const rustCount = PROJECTS.filter((p) => p.language === 'Rust').length
  const tsCount = PROJECTS.filter((p) => p.language === 'TypeScript').length
</script>

<section id="top" class="relative pt-16 pb-24 sm:pt-24">
  <div class="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
    <div>
      <Badge variant="outline" class="mb-4 gap-2 bg-card/60 font-mono text-[11px] text-muted-foreground">
        <span class="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-accent)]"></span>
        online · compiling portfolio
      </Badge>
      <h1 class="font-mono text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        <span class="text-muted-foreground/60">&gt;</span>
        {PROFILE.login}<span class="caret ml-1 text-primary"></span>
      </h1>
      <p class="mt-5 max-w-2xl text-lg text-muted-foreground">
        {PROFILE.tagline}. A portfolio powered by a
        <span class="font-mono text-primary">Rust → WASM</span>
        mini-shell — type real pipelines against the project list below.
      </p>
      <div class="mt-8 flex flex-wrap gap-3 font-mono text-sm">
        <Button href="#terminal" size="lg">
          <Play class="size-4" />
          launch terminal
        </Button>
        <Button variant="outline" href="#projects" size="lg">
          <FolderTree class="size-4" />
          ls projects/
        </Button>
        <Button variant="ghost" href={PROFILE.url} target="_blank" rel="noreferrer" size="lg">
          <GithubIcon class="size-4" />
          github
        </Button>
      </div>
    </div>

    <!-- decorative console card -->
    <Card.Root class="overflow-hidden border-border/80 bg-card/80 py-0 shadow-2xl">
      <div class="flex items-center gap-1.5 border-b border-border/80 px-4 py-2.5">
        <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
        <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
        <span class="ml-2 font-mono text-xs text-muted-foreground/70">~/portfolio</span>
      </div>
      <div class="p-5 font-mono text-sm">
        <div class="space-y-1 text-muted-foreground">
          <div><span class="text-primary">$</span> cargo build --release</div>
          <div class="text-muted-foreground/60">   Compiling mini-shell v0.1.0</div>
          <div class="text-muted-foreground/60">    Finished `release` profile</div>
          <div><span class="text-primary">$</span> wasm-pack build --target web</div>
          <div class="text-muted-foreground/60">    Your wasm pkg is ready to publish.</div>
          <div><span class="text-primary">$</span> portfolio <span class="text-foreground">start</span></div>
          <div class="pt-2 text-foreground">
            → {PROJECTS.length} projects · {rustCount} rust · {tsCount} typescript
          </div>
        </div>
        <div class="mt-4 space-y-2">
          {#each stacks as s}
            <div class="flex items-center gap-3 text-xs">
              <span class="w-24 text-muted-foreground">{s.label}</span>
              <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-background">
                <div
                  class="h-full bg-gradient-to-r from-primary to-[var(--color-link)]"
                  style="width: {s.pct}%"
                ></div>
              </div>
              <span class="w-10 text-right text-muted-foreground/60">{s.pct}%</span>
            </div>
          {/each}
        </div>
      </div>
    </Card.Root>
  </div>
</section>
