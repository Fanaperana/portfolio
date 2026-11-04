<script lang="ts">
  import { ArrowRight } from "@lucide/svelte";
  import { NOTES, formatDate } from "$lib/notes";
  import { href } from "$lib/router.svelte";

  let { limit, heading = true }: { limit?: number; heading?: boolean } = $props();
  const notes = $derived(limit ? NOTES.slice(0, limit) : NOTES);
</script>

{#if NOTES.length}
  <section id="notes" class="scroll-mt-20 py-16">
    {#if heading}
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 class="font-mono text-2xl font-semibold text-foreground">
            <span class="text-muted-foreground/60"># </span>notes
          </h2>
          <p class="mt-2 max-w-2xl text-muted-foreground">Deep dives into how things I've built actually work.</p>
        </div>
        {#if limit && NOTES.length > limit}
          <a href={href("/notes")} class="inline-flex items-center gap-1 font-mono text-sm text-primary hover:underline">
            all notes <ArrowRight class="size-4" />
          </a>
        {/if}
      </div>
    {/if}

    <ul class="mt-8 divide-y divide-border/60 rounded-xl border border-border/80 bg-card/40">
      {#each notes as n (n.slug)}
        <li>
          <a href={href(`/notes/${n.slug}`)} class="group block p-5 transition hover:bg-card/80 sm:p-6">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
              <time datetime={n.date}>{formatDate(n.date)}</time>
              <span>·</span>
              <span>{n.minutes} min read</span>
              {#each n.tags.slice(0, 3) as t (t)}
                <span class="text-primary/70">#{t}</span>
              {/each}
            </div>
            <h3 class="mt-2 font-mono text-base font-semibold text-foreground group-hover:text-primary sm:text-lg">{n.title}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{n.summary}</p>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}
