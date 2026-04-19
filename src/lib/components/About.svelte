<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Cog, Code2, Boxes } from '@lucide/svelte'

  const items = [
    {
      title: 'Rust & systems',
      body: 'TUIs, CLIs, tiny languages. The mini-shell powering the terminal below is hand-rolled Rust compiled to WASM.',
      Icon: Cog,
    },
    {
      title: 'Web craft',
      body: 'Svelte, Vue, React Native. Prefer zero-JS-by-default pages, tiny bundles, and keyboard-first UIs.',
      Icon: Code2,
    },
    {
      title: 'Tooling & embedded',
      body: 'Tauri kiosks on Ubuntu, git patch orchestrators, Neovim configs — tools that keep the editor close to the machine.',
      Icon: Boxes,
    },
  ]
</script>

<section id="about" class="scroll-mt-20 py-16">
  <h2 class="font-mono text-2xl font-semibold text-foreground">
    <span class="text-muted-foreground/60"># </span>about
  </h2>
  <p class="mt-3 max-w-3xl text-muted-foreground">
    I build small, sharp tools. This page is itself one — a Vite + Svelte front-end with a Rust core,
    packaged as a monorepo: <span class="font-mono text-primary">crates/mini-shell</span>
    ships the shell language; <span class="font-mono text-primary">src/</span> renders and drives it.
  </p>
  <div class="mt-8 grid gap-4 sm:grid-cols-3">
    {#each items as it}
      <Card.Root
        class="group border-border/80 bg-card/50 transition hover:-translate-y-0.5 hover:border-primary/60"
      >
        <Card.Header>
          <div class="mb-2 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
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
</section>
