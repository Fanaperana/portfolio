<!--
  Résumé popup — renders public/resume.pdf inline with pdf.js.
  URL-addressable via `#/resume` so it can be linked/shared, and offers a
  download button so recruiters can read it in-place or save it locally.
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import { X, Download, ExternalLink, FileText, Loader } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import { PROFILE } from "$lib/data/projects";

  // Resolve the PDF against the app base (works on GitHub Pages sub-paths).
  const RESUME_URL =
    import.meta.env.BASE_URL.replace(/\/?$/, "/") +
    (PROFILE.resume ?? "/resume.pdf").replace(/^\//, "");
  const DOWNLOAD_NAME = `${PROFILE.login}-resume.pdf`;

  let open = $state(false);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let pageCount = $state(0);
  let scrollEl = $state<HTMLDivElement | undefined>(undefined);
  let canvasHost = $state<HTMLDivElement | undefined>(undefined);

  let rendered = false; // guard so we render the document only once per open
  let renderToken = 0; // cancels stale async renders

  function isResumeHash() {
    return typeof location !== "undefined" && location.hash === "#/resume";
  }

  async function renderPdf() {
    if (!canvasHost) return;
    const token = ++renderToken;
    loading = true;
    error = null;
    pageCount = 0;
    canvasHost.replaceChildren();

    try {
      const pdfjs = await import("pdfjs-dist");
      // Wire up the worker (bundled by Vite as a URL asset).
      const workerUrl = (
        await import("pdfjs-dist/build/pdf.worker.mjs?url")
      ).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

      const doc = await pdfjs.getDocument({ url: RESUME_URL }).promise;
      if (token !== renderToken) return; // superseded
      pageCount = doc.numPages;

      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const hostWidth = canvasHost.clientWidth || 800;

      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        if (token !== renderToken) return;

        const unscaled = page.getViewport({ scale: 1 });
        // Fit the page to the container width (cap the CSS width for readability).
        const cssWidth = Math.min(hostWidth, 900);
        const scale = cssWidth / unscaled.width;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.className = "resume-page";
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        canvas.setAttribute("aria-label", `Résumé page ${n} of ${doc.numPages}`);

        canvasHost.appendChild(canvas);
        await page.render({
          canvas,
          viewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        }).promise;
        if (token !== renderToken) return;
      }
    } catch (e) {
      if (token !== renderToken) return;
      console.error("Failed to render résumé", e);
      error =
        "Couldn't render the résumé preview. You can still download it below.";
    } finally {
      if (token === renderToken) loading = false;
    }
  }

  async function sync() {
    const shouldOpen = isResumeHash();
    if (shouldOpen === open) return;
    open = shouldOpen;

    if (open) {
      document.body.style.overflow = "hidden";
      await tick();
      if (scrollEl) scrollEl.scrollTop = 0;
      if (!rendered) {
        rendered = true;
        await renderPdf();
      }
    } else {
      document.body.style.overflow = "";
      renderToken++; // cancel any in-flight render
      rendered = false;
    }
  }

  function close() {
    // Drop the hash without adding a history entry.
    history.replaceState(null, "", location.pathname + location.search);
    sync();
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    }
  }

  onMount(() => {
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });
</script>

{#if open}
  <!-- Backdrop -->
  <button
    type="button"
    aria-label="Close résumé"
    class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    onclick={close}
  ></button>

  <!-- Dialog -->
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Résumé preview"
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
            <FileText class="size-3.5 text-primary" />
            <span class="text-muted-foreground/60">~/</span>
            <span class="truncate text-foreground">
              {PROFILE.login.toLowerCase()}/résumé.pdf
            </span>
          </div>
          <div class="mt-1 font-mono text-[11px] text-muted-foreground">
            {#if loading}
              rendering…
            {:else if pageCount > 0}
              {pageCount} page{pageCount === 1 ? "" : "s"} · pdf.js
            {:else}
              preview
            {/if}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            href={RESUME_URL}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink class="size-3.5" />
            <span class="hidden sm:inline">open</span>
          </Button>
          <Button size="sm" href={RESUME_URL} download={DOWNLOAD_NAME}>
            <Download class="size-3.5" />
            <span class="hidden sm:inline">download</span>
          </Button>
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

      <!-- Body: rendered PDF -->
      <div
        bind:this={scrollEl}
        class="resume-body flex-1 overflow-y-auto bg-[#0b0c12] px-4 py-6 sm:px-8 sm:py-8"
      >
        {#if loading}
          <div
            class="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground"
          >
            <Loader class="size-6 animate-spin text-primary" />
            <p class="font-mono text-xs">decoding résumé.pdf…</p>
          </div>
        {/if}

        {#if error}
          <div
            class="mx-auto max-w-md rounded-lg border border-border/70 bg-card/60 p-6 text-center"
          >
            <p class="text-sm text-muted-foreground">{error}</p>
            <Button class="mt-4" href={RESUME_URL} download={DOWNLOAD_NAME}>
              <Download class="size-4" /> download résumé
            </Button>
          </div>
        {/if}

        <div
          bind:this={canvasHost}
          class="mx-auto flex flex-col items-center gap-5"
          class:hidden={loading || !!error}
        ></div>
      </div>

      <!-- Footer hint + secondary download -->
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-5 py-3"
      >
        <span class="font-mono text-[11px] text-muted-foreground/70">
          <span class="text-primary">esc</span> to close · read here or take a copy
        </span>
        <Button size="sm" variant="secondary" href={RESUME_URL} download={DOWNLOAD_NAME}>
          <Download class="size-3.5" /> download pdf
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(.resume-page) {
    display: block;
    border-radius: 6px;
    box-shadow: 0 10px 40px rgb(0 0 0 / 0.45);
    background: #fff;
    max-width: 100%;
  }
</style>
