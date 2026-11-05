<script lang="ts">
  import { Marked } from "marked";
  import DOMPurify from "dompurify";
  import { ArrowLeft, ArrowRight, ExternalLink, Lock, Star, Calendar, ChevronRight } from "@lucide/svelte";
  import { PROJECTS, PROFILE } from "$lib/data/projects";
  import { CASE_STUDIES } from "$lib/data/case-studies";
  import { href } from "$lib/router.svelte";
  import { setMeta } from "$lib/meta";
  import { timeAgo } from "$lib/time";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import Readme from "./Readme.svelte";
  import NotFound from "./NotFound.svelte";
  import Diorama from "./Diorama.svelte";

  let { slug }: { slug: string } = $props();

  const marked = new Marked({ gfm: true });
  const md = (s: string) => DOMPurify.sanitize(marked.parse(s, { async: false }) as string);

  const project = $derived(PROJECTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase()));
  const cs = $derived(project ? CASE_STUDIES.find((c) => c.slug === project.slug) : undefined);
  const csIndex = $derived(cs ? CASE_STUDIES.indexOf(cs) : -1);
  const nextCs = $derived(csIndex >= 0 ? CASE_STUDIES[(csIndex + 1) % CASE_STUDIES.length] : undefined);
  const nextProject = $derived(nextCs ? PROJECTS.find((p) => p.slug === nextCs.slug) : undefined);

  $effect(() => {
    if (!project) return;
    setMeta({
      title: `${project.title} — ${cs?.headline ?? project.description} · ${PROFILE.login}`,
      description: cs?.summary ?? project.description,
      path: `/projects/${project.slug}`,
    });
  });
</script>

{#if !project}
  <NotFound />
{:else}
  <article class="py-10 sm:py-14">
    <nav class="flex items-center gap-1.5 font-mono text-xs text-muted-foreground" aria-label="Breadcrumb">
      <a href={href("/#work")} class="inline-flex items-center gap-1 hover:text-primary">
        <ArrowLeft class="size-3.5" /> work
      </a>
      <ChevronRight class="size-3 opacity-50" />
      <span class="text-foreground/80">{project.slug}</span>
    </nav>

    <header class="mt-6">
      {#if cs}
        <div class="font-mono text-xs text-primary">{cs.kicker}</div>
      {/if}
      <h1 class="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {project.title}
      </h1>
      <p class="mt-3 max-w-3xl text-lg text-foreground/90 sm:text-xl">{cs?.headline ?? project.description}</p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <Badge variant="outline" class="font-mono text-[11px]">{project.language}</Badge>
        {#if project.visibility === "private"}
          <Badge variant="outline" class="gap-1 border-amber-500/40 font-mono text-[11px] text-amber-300">
            <Lock class="size-3" /> private repo
          </Badge>
        {/if}
        {#if project.stars > 0}
          <span class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground"><Star class="size-3" />{project.stars}</span>
        {/if}
        <span class="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Calendar class="size-3" /> updated {timeAgo(project.pushed_at)}
        </span>
        <span class="flex-1"></span>
        {#if project.visibility !== "private"}
          <Button variant="outline" size="sm" href={project.url} target="_blank" rel="noreferrer" class="font-mono">
            <GithubIcon class="size-3.5" /> source
          </Button>
        {/if}
        {#if project.homepage}
          <Button size="sm" href={project.homepage} target="_blank" rel="noreferrer" class="font-mono">
            <ExternalLink class="size-3.5" /> live
          </Button>
        {/if}
      </div>
    </header>

    {#key project.slug}
      <figure class="mt-8">
        <Diorama slug={project.slug} active fallback={project.glyph ?? "▢"} class="aspect-[16/9] w-full border border-border/80 sm:aspect-[21/9]" />
        <figcaption class="mt-2 font-mono text-[11px] text-muted-foreground/70">
          {project.title}, as a diorama · three.js · 2px · bayer dither · 16 colours
        </figcaption>
      </figure>
    {/key}

    {#if cs}
      <!-- At a glance -->
      <div class="mt-10 grid gap-6 lg:grid-cols-[1fr_18rem]">
        <p class="text-base leading-relaxed text-muted-foreground sm:text-lg">{cs.summary}</p>
        <dl class="space-y-3 rounded-xl border border-border/80 bg-card/50 p-5 text-sm">
          <div>
            <dt class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">role</dt>
            <dd class="mt-0.5 text-foreground/90">{cs.role}</dd>
          </div>
          <div>
            <dt class="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">stack</dt>
            <dd class="mt-1 flex flex-wrap gap-1.5">
              {#each cs.stack as s (s)}
                <span class="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">{s}</span>
              {/each}
            </dd>
          </div>
        </dl>
      </div>

      <dl class="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border/80 bg-border/60 sm:grid-cols-4">
        {#each cs.metrics as m (m.label)}
          <div class="bg-card/80 p-5">
            <dd class="font-mono text-2xl font-semibold text-primary">{m.value}</dd>
            <dt class="mt-1 text-xs text-muted-foreground">{m.label}</dt>
          </div>
        {/each}
      </dl>

      <!-- Architecture -->
      <section class="mt-14" aria-labelledby="arch">
        <h2 id="arch" class="font-mono text-lg font-semibold text-foreground"><span class="text-muted-foreground/60">## </span>architecture</h2>
        <ol class="mt-5 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          {#each cs.pipeline as stage, i (stage.label)}
            <li class="flex flex-1 items-stretch gap-3 lg:flex-col">
              <div class="flex-1 rounded-lg border border-border/80 bg-card/60 p-4">
                <div class="font-mono text-[10px] text-primary">{String(i + 1).padStart(2, "0")}</div>
                <div class="mt-1 font-mono text-sm font-semibold text-foreground">{stage.label}</div>
                <p class="mt-1 text-xs leading-relaxed text-muted-foreground">{stage.detail}</p>
              </div>
            </li>
            {#if i < cs.pipeline.length - 1}
              <li aria-hidden="true" class="flex items-center justify-center text-primary/70">
                <ArrowRight class="size-4 rotate-90 lg:rotate-0" />
              </li>
            {/if}
          {/each}
        </ol>
      </section>

      <div class="mt-14 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="problem">
          <h2 id="problem" class="font-mono text-lg font-semibold text-foreground"><span class="text-muted-foreground/60">## </span>the problem</h2>
          <div class="prose-cs mt-3">{@html md(cs.problem)}</div>
        </section>
        <section aria-labelledby="approach">
          <h2 id="approach" class="font-mono text-lg font-semibold text-foreground"><span class="text-muted-foreground/60">## </span>the approach</h2>
          <div class="prose-cs mt-3">{@html md(cs.approach)}</div>
        </section>
      </div>

      <section class="mt-14" aria-labelledby="decisions">
        <h2 id="decisions" class="font-mono text-lg font-semibold text-foreground"><span class="text-muted-foreground/60">## </span>key decisions</h2>
        <div class="mt-5 grid gap-4 md:grid-cols-3">
          {#each cs.decisions as d, i (d.title)}
            <div class="rounded-xl border border-border/80 bg-card/50 p-5">
              <div class="font-mono text-[10px] text-primary">decision {i + 1}</div>
              <h3 class="mt-1 font-mono text-sm font-semibold text-foreground">{d.title}</h3>
              <div class="prose-cs mt-2 text-sm">{@html md(d.body)}</div>
            </div>
          {/each}
        </div>
      </section>

      {#if cs.snippet}
        <figure class="mt-14">
          <pre class="overflow-x-auto rounded-xl border border-border/80 bg-[var(--color-bg-soft)] p-5 font-mono text-[13px] leading-relaxed text-foreground/90"><code>{cs.snippet.code}</code></pre>
          <figcaption class="mt-2 font-mono text-xs text-muted-foreground">{cs.snippet.caption}</figcaption>
        </figure>
      {/if}

      <section class="mt-14" aria-labelledby="outcome">
        <h2 id="outcome" class="font-mono text-lg font-semibold text-foreground"><span class="text-muted-foreground/60">## </span>outcome</h2>
        <div class="prose-cs mt-3 max-w-3xl">{@html md(cs.outcome)}</div>
      </section>

      <details class="group mt-14 rounded-xl border border-border/80 bg-card/40">
        <summary class="flex cursor-pointer list-none items-center gap-2 px-5 py-4 font-mono text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight class="size-4 transition group-open:rotate-90" />
          <span class="text-primary">$</span> cat README.md
          <span class="text-xs text-muted-foreground/60">— full technical README</span>
        </summary>
        <div class="border-t border-border/80 px-5 py-6 sm:px-8">
          <Readme {project} />
        </div>
      </details>
    {:else}
      <div class="mt-10 rounded-xl border border-border/80 bg-card/40 px-5 py-6 sm:px-8 sm:py-8">
        <Readme {project} />
      </div>
    {/if}

    <!-- Footer CTA + next -->
    <div class="mt-16 grid gap-4 md:grid-cols-2">
      <a
        href={href("/#contact")}
        class="group rounded-xl border border-primary/40 bg-primary/5 p-6 transition hover:bg-primary/10"
      >
        <div class="font-mono text-xs text-primary">need something like this?</div>
        <div class="mt-1 font-mono text-lg font-semibold text-foreground">Let's talk about your project →</div>
      </a>
      {#if nextCs && nextProject && nextCs.slug !== project.slug}
        <a
          href={href(`/projects/${nextCs.slug}`)}
          class="group rounded-xl border border-border/80 bg-card/50 p-6 transition hover:border-primary/60"
        >
          <div class="font-mono text-xs text-muted-foreground">next case study</div>
          <div class="mt-1 font-mono text-lg font-semibold text-foreground">
            {nextProject.title}
            <ArrowRight class="inline size-4 transition group-hover:translate-x-0.5" />
          </div>
          <div class="mt-1 text-sm text-muted-foreground">{nextCs.headline}</div>
        </a>
      {:else}
        <a href={href("/#projects")} class="rounded-xl border border-border/80 bg-card/50 p-6 transition hover:border-primary/60">
          <div class="font-mono text-xs text-muted-foreground">keep browsing</div>
          <div class="mt-1 font-mono text-lg font-semibold text-foreground">All {PROJECTS.length} projects →</div>
        </a>
      {/if}
    </div>
  </article>
{/if}
