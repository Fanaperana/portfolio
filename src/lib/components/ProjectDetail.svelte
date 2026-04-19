<!--
  Modal that shows a project's README (fetched at build time, including
  private repos). URL-addressable via `#/p/<slug>` so recruiters can share.
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { Marked } from "marked";
  import DOMPurify from "dompurify";
  import { X, ExternalLink, Lock, Star, Calendar } from "@lucide/svelte";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { PROJECTS, PROFILE, type Project } from "$lib/data/projects";
  import { GH_READMES } from "$lib/data/github.generated";
  import { timeAgo } from "$lib/time";

  let open = $state(false);
  let project = $state<Project | null>(null);
  let content = $state(""); // sanitized HTML
  let scrollEl = $state<HTMLDivElement | undefined>(undefined);

  const marked = new Marked({
    gfm: true,
    breaks: false,
  });

  function fromHash() {
    if (typeof location === "undefined") return null;
    const m = location.hash.match(/^#\/p\/([^/?&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }

  async function load(slug: string | null) {
    if (!slug) {
      open = false;
      project = null;
      content = "";
      document.body.style.overflow = "";
      return;
    }
    const p = PROJECTS.find((x) => x.slug.toLowerCase() === slug.toLowerCase());
    if (!p) {
      open = false;
      project = null;
      content = "";
      return;
    }
    project = p;
    open = true;
    document.body.style.overflow = "hidden";

    const raw = GH_READMES[p.slug];
    if (raw) {
      const html = await marked.parse(raw);
      content = DOMPurify.sanitize(html, {
        ADD_ATTR: ["target", "rel"],
      });
    } else {
      content = "";
    }
    await tick();
    if (scrollEl) scrollEl.scrollTop = 0;
    // Make all links open in a new tab
    await tick();
    scrollEl?.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) return;
      // Resolve relative paths against the repo default branch
      if (!/^https?:\/\//.test(href) && !href.startsWith("mailto:")) {
        const abs = `https://github.com/${PROFILE.login}/${p.slug}/blob/HEAD/${href.replace(/^\.?\//, "")}`;
        a.setAttribute("href", abs);
      }
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noreferrer");
    });
    // Rewrite relative <img src> to raw.githubusercontent.com so they render
    scrollEl?.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (!src || /^https?:\/\//.test(src) || src.startsWith("data:")) return;
      const clean = src.replace(/^\.?\//, "");
      img.setAttribute(
        "src",
        `https://raw.githubusercontent.com/${PROFILE.login}/${p.slug}/HEAD/${clean}`
      );
      img.setAttribute("loading", "lazy");
    });
  }

  function close() {
    history.replaceState(null, "", location.pathname + location.search);
    load(null);
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  onMount(() => {
    const apply = () => load(fromHash());
    apply();
    window.addEventListener("hashchange", apply);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", apply);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });
</script>

{#if open && project}
  <!-- Backdrop -->
  <button
    type="button"
    aria-label="Close"
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    onclick={close}
  ></button>

  <!-- Dialog -->
  <div
    role="dialog"
    aria-modal="true"
    aria-label={`${project.title} — README`}
    class="fixed inset-0 z-50 flex items-start justify-center overflow-hidden p-4 sm:p-8"
  >
    <div
      class="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_0_0_1px_var(--color-accent-soft)]"
    >
      <!-- Header -->
      <div
        class="flex flex-wrap items-center gap-3 border-b border-border/80 px-5 py-4"
      >
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 font-mono text-sm">
            <span class="text-muted-foreground/60">~/</span>
            <span class="truncate text-foreground"
              >{PROFILE.login.toLowerCase()}/{project.slug}</span
            >
            <span class="text-muted-foreground/60">/README.md</span>
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" class="font-mono text-[10px]"
              >{project.language}</Badge
            >
            {#if project.visibility === "private"}
              <Badge
                variant="outline"
                class="gap-1 border-amber-500/40 font-mono text-[10px] text-amber-300"
              >
                <Lock class="size-3" /> private
              </Badge>
            {/if}
            {#if project.highlight}
              <Badge
                class="bg-primary font-mono text-[10px] text-primary-foreground"
                >featured</Badge
              >
            {/if}
            {#if project.stars > 0}
              <span
                class="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground"
              >
                <Star class="size-3" />
                {project.stars}
              </span>
            {/if}
            <span
              class="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground"
            >
              <Calendar class="size-3" />
              {timeAgo(project.pushed_at)}
            </span>
            {#each project.tags.slice(0, 4) as t (t)}
              <Badge
                variant="outline"
                class="font-mono text-[10px] text-muted-foreground/80"
                >#{t}</Badge
              >
            {/each}
          </div>
        </div>
        <div class="flex items-center gap-2">
          {#if project.visibility !== "private"}
            <Button
              variant="outline"
              size="sm"
              href={project.url}
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon class="size-3.5" /> github
            </Button>
          {/if}
          {#if project.homepage}
            <Button
              size="sm"
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink class="size-3.5" /> visit
            </Button>
          {/if}
          <Button
            variant="ghost"
            size="icon"
            onclick={close}
            aria-label="Close"
          >
            <X class="size-4" />
          </Button>
        </div>
      </div>

      <!-- Body: rendered README, or fallback when we couldn't fetch it -->
      <div
        bind:this={scrollEl}
        class="readme-body flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
      >
        {#if content}
          {@html content}
        {:else}
          <div class="space-y-3">
            <p class="font-mono text-sm text-muted-foreground">
              <span class="text-primary">$</span> cat README.md
            </p>
            <p class="text-sm text-muted-foreground">
              README preview isn't available for this project yet
              {#if project.visibility === "private"}
                (private repo — set <code
                  class="rounded bg-background px-1.5 py-0.5 font-mono text-xs text-primary"
                  >GH_README_TOKEN</code
                > in CI to include it).
              {/if}
            </p>
            <h3 class="mt-4 font-mono text-base font-semibold text-foreground">
              {project.title}
            </h3>
            <p class="text-base text-foreground">{project.description}</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Typography for the rendered README — styled to match the terminal theme. */
  :global(.readme-body) {
    color: var(--color-fg);
    line-height: 1.65;
  }
  :global(.readme-body h1),
  :global(.readme-body h2),
  :global(.readme-body h3),
  :global(.readme-body h4) {
    font-family: var(--font-mono);
    color: var(--color-fg);
    font-weight: 600;
    margin-top: 1.75rem;
    margin-bottom: 0.75rem;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  :global(.readme-body h1) {
    font-size: 1.75rem;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.4rem;
  }
  :global(.readme-body h2) {
    font-size: 1.35rem;
    border-bottom: 1px solid
      color-mix(in oklab, var(--color-border) 50%, transparent);
    padding-bottom: 0.3rem;
  }
  :global(.readme-body h3) {
    font-size: 1.1rem;
  }
  :global(.readme-body p),
  :global(.readme-body ul),
  :global(.readme-body ol),
  :global(.readme-body blockquote),
  :global(.readme-body pre),
  :global(.readme-body table) {
    margin-bottom: 0.9rem;
  }
  :global(.readme-body a) {
    color: var(--color-link);
    text-decoration: underline;
    text-decoration-style: dotted;
    text-underline-offset: 3px;
  }
  :global(.readme-body a:hover) {
    color: var(--color-accent);
  }
  :global(.readme-body code) {
    font-family: var(--font-mono);
    font-size: 0.85em;
    padding: 0.125rem 0.4rem;
    border-radius: 0.35rem;
    background: var(--color-bg-soft);
    color: var(--color-accent);
    border: 1px solid color-mix(in oklab, var(--color-border) 70%, transparent);
  }
  :global(.readme-body pre) {
    font-family: var(--font-mono);
    background: var(--color-bg-soft);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem 1.15rem;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.55;
  }
  :global(.readme-body pre code) {
    background: transparent;
    border: 0;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }
  :global(.readme-body ul),
  :global(.readme-body ol) {
    padding-left: 1.5rem;
  }
  :global(.readme-body ul) {
    list-style: disc;
  }
  :global(.readme-body ol) {
    list-style: decimal;
  }
  :global(.readme-body li) {
    margin: 0.25rem 0;
  }
  :global(.readme-body blockquote) {
    border-left: 3px solid var(--color-accent);
    padding: 0.25rem 0.9rem;
    color: var(--color-fg-muted);
    background: color-mix(in oklab, var(--color-accent) 6%, transparent);
    border-radius: 0 0.35rem 0.35rem 0;
  }
  :global(.readme-body img) {
    max-width: 100%;
    border-radius: 0.5rem;
    border: 1px solid var(--color-border);
    margin: 0.5rem 0;
  }
  :global(.readme-body hr) {
    border: 0;
    border-top: 1px solid var(--color-border);
    margin: 1.5rem 0;
  }
  :global(.readme-body table) {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9em;
  }
  :global(.readme-body th),
  :global(.readme-body td) {
    border: 1px solid var(--color-border);
    padding: 0.45rem 0.7rem;
    text-align: left;
  }
  :global(.readme-body th) {
    background: var(--color-bg-soft);
    font-weight: 600;
  }
  :global(.readme-body :is(h1, h2, h3, h4):first-child) {
    margin-top: 0;
  }
</style>
