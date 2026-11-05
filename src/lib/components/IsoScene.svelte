<!--
  Hero showpiece: a live isometric pixel-art diorama of my work.
  three.js loads lazily in its own chunk; the scene pauses when off-screen,
  respects prefers-reduced-motion, and picks day/night from the visitor's clock.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { Sun, Moon } from "@lucide/svelte";
  import { navigate, href } from "$lib/router.svelte";
  import type { HoverInfo, SceneHandle } from "$lib/scene/island";

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let handle: SceneHandle | null = null;
  let hover = $state<HoverInfo | null>(null);
  let failed = $state(false);
  let loaded = $state(false);
  const hour = new Date().getHours();
  let night = $state(hour < 6 || hour >= 19);

  const LINKS: Record<string, string> = {
    terminal: "/#terminal",
    agents: "/projects/sentinel",
  };

  function go(id: string) {
    navigate(href(LINKS[id] ?? `/projects/${id}`));
  }

  function toggleNight() {
    night = !night;
    handle?.setNight(night);
  }

  onMount(() => {
    let destroyed = false;
    let io: IntersectionObserver | undefined;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onVis = () => handle?.setRunning(!document.hidden && visible);
    let visible = true;

    import("$lib/scene/island")
      .then(({ createIsland }) => {
        if (destroyed) return;
        try {
          handle = createIsland(container, canvas, {
            pixel: 2,
            night,
            animate: !reduce,
            onHover: (h) => (hover = h),
            onClick: (h) => go(h.id),
          });
          loaded = true;
        } catch {
          failed = true;
          return;
        }
        io = new IntersectionObserver(([e]) => {
          visible = e.isIntersecting;
          onVis();
        });
        io.observe(container);
        document.addEventListener("visibilitychange", onVis);
      })
      .catch(() => (failed = true));

    return () => {
      destroyed = true;
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      handle?.destroy();
    };
  });
</script>

<figure class="relative">
  <div
    bind:this={container}
    class="scene relative aspect-[5/4] w-full overflow-hidden border border-border/80 bg-[#7d8fc4]"
    class:night
  >
    <canvas
      bind:this={canvas}
      class="block h-full w-full transition-opacity duration-500"
      class:opacity-0={!loaded}
      style="image-rendering: pixelated;"
      aria-hidden="true"
    ></canvas>

    {#if failed}
      <div class="absolute inset-0 grid place-items-center p-6 text-center font-mono text-xs text-[#1b2033]">
        the workshop needs WebGL — try another browser to see it running.
      </div>
    {/if}

    {#if hover}
      <div
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap border-2 border-[#0b0d17] bg-[#f4efe1] px-2.5 py-1.5 font-mono text-[11px] leading-tight text-[#0b0d17] shadow-[3px_3px_0_#0b0d17]"
        style="left: {hover.x}px; top: {hover.y}px"
      >
        <div class="font-bold">{hover.label}</div>
        <div class="text-[#2c3452]">{hover.sub}</div>
        <div class="mt-0.5 text-[#ce422b]">click to open →</div>
      </div>
    {/if}

    <button
      type="button"
      onclick={toggleNight}
      class="absolute right-2 top-2 z-10 grid size-8 place-items-center border-2 border-[#0b0d17] bg-[#f4efe1] text-[#0b0d17] shadow-[2px_2px_0_#0b0d17] transition active:translate-x-px active:translate-y-px active:shadow-none"
      aria-label={night ? "Switch to day" : "Switch to night"}
      title={night ? "day" : "night"}
    >
      {#if night}<Sun class="size-4" />{:else}<Moon class="size-4" />{/if}
    </button>
  </div>

  <figcaption class="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
    <span><span class="text-primary">fig. 01</span> — the workshop. Code goes in, parsed, graphed, filmed and shipped. Hover a machine.</span>
    <span class="text-muted-foreground/60">three.js · 2px · bayer dither · 16 colours</span>
  <!-- Same links for keyboard and screen-reader users. -->
    <ul class="sr-only">
      <li><a href={href("/projects/semtree")}>semtree — incremental parser</a></li>
      <li><a href={href("/projects/adaptive-codegraph")}>adaptive-codegraph — code graph for AI assistants</a></li>
      <li><a href={href("/projects/cinecode")}>cinecode — renders code explainers to MP4</a></li>
      <li><a href={href("/projects/pskey")}>pskey — password vault</a></li>
      <li><a href={href("/projects/spdf")}>spdf — PDF extraction</a></li>
    </ul>
  </figcaption>

</figure>

<style>
  .scene.night {
    background: #0b0d17;
  }
</style>
