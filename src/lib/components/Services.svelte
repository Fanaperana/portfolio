<script lang="ts">
  import { Cpu, Monitor, Globe, Brain, Wrench, LifeBuoy, ArrowRight } from "@lucide/svelte";
  import { SERVICES, PROCESS } from "$lib/data/site";
  import { Button } from "$lib/components/ui/button";

  const icons = { cpu: Cpu, monitor: Monitor, globe: Globe, brain: Brain, wrench: Wrench, "life-buoy": LifeBuoy };
</script>

<section id="services" class="scroll-mt-20 py-16">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="font-mono text-2xl font-semibold text-foreground">
        <span class="text-muted-foreground/60"># </span>work with me
      </h2>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        Freelance and contract work, from a focused fix to a full product. If it involves code, I can probably help.
      </p>
    </div>
    <Button href="#contact" class="font-mono text-sm">
      start a project <ArrowRight class="size-4" />
    </Button>
  </div>

  <div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each SERVICES as s (s.title)}
      {@const Icon = icons[s.icon]}
      <div class="group rounded-xl border border-border/80 bg-card/50 p-5 transition hover:border-primary/50">
        <div class="inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary transition group-hover:bg-primary/20">
          <Icon class="size-5" />
        </div>
        <h3 class="mt-3 font-mono text-sm font-semibold text-foreground">{s.title}</h3>
        <p class="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
        <div class="mt-3 flex flex-wrap gap-1.5">
          {#each s.tags as t (t)}
            <span class="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/90">{t}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <ol class="mt-10 grid gap-px overflow-hidden rounded-xl border border-border/80 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
    {#each PROCESS as p (p.step)}
      <li class="bg-card/80 p-5">
        <span class="font-mono text-xs text-primary">{p.step}</span>
        <h3 class="mt-1 font-mono text-sm font-semibold text-foreground">{p.title}</h3>
        <p class="mt-1 text-sm text-muted-foreground">{p.body}</p>
      </li>
    {/each}
  </ol>
</section>
