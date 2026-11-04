<script lang="ts">
  import { Marked } from "marked";
  import DOMPurify from "dompurify";
  import { ArrowLeft, ArrowRight } from "@lucide/svelte";
  import { NOTES, formatDate } from "$lib/notes";
  import { PROJECTS, PROFILE } from "$lib/data/projects";
  import { href } from "$lib/router.svelte";
  import { setMeta } from "$lib/meta";
  import NotFound from "./NotFound.svelte";

  let { slug }: { slug: string } = $props();

  const marked = new Marked({ gfm: true });
  const note = $derived(NOTES.find((n) => n.slug === slug));
  const project = $derived(note?.project ? PROJECTS.find((p) => p.slug === note.project) : undefined);

  const html = $derived.by(() => {
    if (!note) return "";
    const clean = DOMPurify.sanitize(marked.parse(note.body, { async: false }) as string);
    const doc = new DOMParser().parseFromString(clean, "text/html");
    doc.querySelectorAll("a[href]").forEach((a) => {
      const h = a.getAttribute("href")!;
      if (h.startsWith("/")) a.setAttribute("href", href(h)); // in-site link
      else if (/^https?:/.test(h)) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noreferrer");
      }
    });
    return doc.body.innerHTML;
  });

  $effect(() => {
    if (note) setMeta({ title: `${note.title} · ${PROFILE.login}`, description: note.summary, path: `/notes/${note.slug}` });
  });
</script>

{#if !note}
  <NotFound />
{:else}
  <article class="mx-auto max-w-3xl py-10 sm:py-14">
    <a href={href("/#notes")} class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary">
      <ArrowLeft class="size-3.5" /> notes
    </a>
    <header class="mt-6">
      <div class="flex flex-wrap items-center gap-x-3 font-mono text-xs text-muted-foreground">
        <time datetime={note.date}>{formatDate(note.date)}</time>
        <span>·</span>
        <span>{note.minutes} min read</span>
        {#each note.tags as t (t)}<span class="text-primary/70">#{t}</span>{/each}
      </div>
      <h1 class="mt-3 font-mono text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">{note.title}</h1>
      <p class="mt-3 text-lg text-muted-foreground">{note.summary}</p>
    </header>

    <div class="readme-body mt-10">{@html html}</div>

    <footer class="mt-14 grid gap-4 sm:grid-cols-2">
      {#if project}
        <a href={href(`/projects/${project.slug}`)} class="rounded-xl border border-border/80 bg-card/50 p-5 transition hover:border-primary/60">
          <div class="font-mono text-xs text-muted-foreground">related project</div>
          <div class="mt-1 font-mono font-semibold text-foreground">{project.title} <ArrowRight class="inline size-4" /></div>
        </a>
      {/if}
      <a href={href("/#contact")} class="rounded-xl border border-primary/40 bg-primary/5 p-5 transition hover:bg-primary/10">
        <div class="font-mono text-xs text-primary">enjoyed this?</div>
        <div class="mt-1 font-mono font-semibold text-foreground">Work with me →</div>
      </a>
    </footer>
  </article>
{/if}
