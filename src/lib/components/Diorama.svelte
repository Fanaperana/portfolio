<!--
  A project's pixel-art diorama. All dioramas share one WebGL renderer
  (src/lib/scene/gallery.ts), which loads lazily with three.js and only
  animates the ones on screen.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { mood } from "$lib/scene/mood.svelte";
  import type { DioramaHandle } from "$lib/scene/gallery";

  let {
    slug,
    active = false,
    pixel = 2,
    fallback = "▢",
    class: cls = "",
  }: { slug: string; active?: boolean; pixel?: number; fallback?: string; class?: string } = $props();

  let el: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let handle = $state<DioramaHandle | null>(null);
  let gallery = $state<typeof import("$lib/scene/gallery") | null>(null);
  let failed = $state(false);

  onMount(() => {
    let dead = false;
    import("$lib/scene/gallery")
      .then((g) => {
        if (dead) return;
        gallery = g;
        handle = g.mount(el, canvas, slug, { pixel, night: mood.night });
        if (!handle) failed = true;
      })
      .catch(() => (failed = true));
    return () => {
      dead = true;
      handle?.destroy();
    };
  });

  $effect(() => handle?.setActive(active));
  $effect(() => gallery?.setNight(mood.night));
</script>

<div bind:this={el} class="relative overflow-hidden {mood.night ? 'bg-[#0b0d17]' : 'bg-[#7d8fc4]'} {cls}">
  <canvas bind:this={canvas} class="block h-full w-full" style="image-rendering: pixelated;" aria-hidden="true"></canvas>
  {#if failed}
    <div class="absolute inset-0 grid place-items-center font-mono text-6xl text-[#f4efe1]/70">{fallback}</div>
  {/if}
</div>
