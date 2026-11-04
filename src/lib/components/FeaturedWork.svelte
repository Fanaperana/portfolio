<script lang="ts">
  import { ArrowRight, Lock } from "@lucide/svelte";
  import { CASE_STUDIES } from "$lib/data/case-studies";
  import { PROJECTS } from "$lib/data/projects";
  import { href } from "$lib/router.svelte";

  const items = CASE_STUDIES.map((cs) => ({
    cs,
    p: PROJECTS.find((p) => p.slug === cs.slug)!,
  })).filter((x) => x.p);

  const thumb = (t?: string) =>
    !t ? "" : /^https?:\/\//.test(t) ? t : import.meta.env.BASE_URL + t.replace(/^\/+/, "");
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
        class="group relative flex flex-col overflow-hidden rounded-xl border border-border/80 bg-card/60 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_40px_-12px_var(--color-accent-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div
          class="relative h-40 overflow-hidden border-b border-border/80 bg-gradient-to-br from-primary/15 via-transparent to-[var(--color-link)]/10"
        >
          {#if thumb(p.thumbnail)}
            <img
              src={thumb(p.thumbnail)}
              alt=""
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover object-top opacity-80 transition group-hover:scale-[1.02] group-hover:opacity-100"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent"></div>
          {:else}
            <div
              class="absolute inset-0 opacity-25"
              style="background-image: linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px); background-size: 22px 22px;"
            ></div>
            <!-- architecture strip as the visual -->
            <div class="absolute inset-x-5 bottom-5 flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              {#each cs.pipeline as stage, j (stage.label)}
                <span class="rounded border border-border bg-background/80 px-2 py-1 text-foreground/90">{stage.label}</span>
                {#if j < cs.pipeline.length - 1}<span class="text-primary/70">→</span>{/if}
              {/each}
            </div>
            <span class="absolute right-5 top-4 font-mono text-5xl text-foreground/20">{p.glyph ?? "▢"}</span>
          {/if}
          <span class="absolute left-5 top-4 font-mono text-[11px] text-muted-foreground">
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
