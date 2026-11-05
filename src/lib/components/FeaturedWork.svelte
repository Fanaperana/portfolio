<script lang="ts">
  import { ArrowRight, Lock } from "@lucide/svelte";
  import { CASE_STUDIES } from "$lib/data/case-studies";
  import { PROJECTS } from "$lib/data/projects";
  import { href } from "$lib/router.svelte";
  import Diorama from "./Diorama.svelte";

  const items = CASE_STUDIES.map((cs) => ({
    cs,
    p: PROJECTS.find((p) => p.slug === cs.slug)!,
  })).filter((x) => x.p);

  let hot = $state<string | null>(null);
</script>

<section id="work" class="scroll-mt-20 py-16">
  <h2 class="font-mono text-2xl font-semibold text-foreground">
    <span class="text-muted-foreground/60"># </span>selected work
  </h2>
  <p class="mt-2 max-w-2xl text-muted-foreground">
    Four projects that show how I work: the problem, the architecture, the trade-offs, and where each one stands.
  </p>

  <div class="mt-8 grid gap-6 md:grid-cols-2">
    {#each items as { cs, p }, i (cs.slug)}
      <a
        href={href(`/projects/${cs.slug}`)}
        onpointerenter={() => (hot = cs.slug)}
        onpointerleave={() => (hot = null)}
        onfocus={() => (hot = cs.slug)}
        onblur={() => (hot = null)}
        class="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_40px_-12px_var(--color-accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div class="relative aspect-[16/9] overflow-hidden border-b border-border/80">
          <Diorama slug={cs.slug} active={hot === cs.slug} fallback={p.glyph ?? "▢"} class="absolute inset-0" />
          <span class="absolute left-3 top-3 border-2 border-[#0b0d17] bg-[#f4efe1] px-2 py-0.5 font-mono text-[11px] text-[#0b0d17] shadow-[2px_2px_0_#0b0d17]">
            {String(i + 1).padStart(2, "0")} · {cs.kicker}
          </span>
        </div>

        <div class="flex flex-1 flex-col p-5">
          <div class="flex items-center gap-2">
            <h3 class="font-mono text-lg font-semibold text-foreground">{p.title}</h3>
            {#if p.visibility === "private"}
              <Lock class="size-3.5 text-amber-300/80" aria-label="private repository" />
            {/if}
          </div>
          <p class="mt-1 text-foreground/90">{cs.headline}</p>
          <p class="mt-2 text-sm text-muted-foreground">{cs.summary}</p>

          <dl class="mt-4 grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
            {#each cs.metrics.slice(0, 3) as m (m.label)}
              <div>
                <dt class="sr-only">{m.label}</dt>
                <dd class="font-mono text-lg font-semibold text-primary">{m.value}</dd>
                <dd class="text-[11px] leading-tight text-muted-foreground">{m.label}</dd>
              </div>
            {/each}
          </dl>

          <div class="mt-auto flex items-center justify-between pt-5">
            <span class="truncate font-mono text-[11px] text-muted-foreground/80">{cs.stack.slice(0, 4).join(" · ")}</span>
            <span class="inline-flex flex-none items-center gap-1 font-mono text-xs text-primary">
              case study <ArrowRight class="size-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </a>
    {/each}
  </div>
</section>
