<!--
  Cmd+K / Ctrl+K command palette.
  Provides a single, fuzzy-searchable launcher for:
    · section navigation
    · opening project case studies (hash routing)
    · external actions (email, linkedin, github, resume)
    · terminal commands (executed when focused in the terminal)
-->
<script lang="ts">
  import { onMount, tick } from "svelte";
  import {
    Search,
    User,
    Terminal as TerminalIcon,
    FolderTree,
    Mail,
    FileDown,
    ArrowUpRight,
    Command,
    CornerDownLeft,
    ExternalLink,
    Eye,
  } from "@lucide/svelte";
  import { PROFILE, PROJECTS } from "$lib/data/projects";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import LinkedinIcon from "./icons/LinkedinIcon.svelte";

  type Item = {
    id: string;
    group: "navigate" | "project" | "external" | "action";
    label: string;
    hint?: string;
    keywords?: string;
    Icon: any;
    run: () => void;
  };

  let open = $state(false);
  let query = $state("");
  let activeIndex = $state(0);
  let inputEl = $state<HTMLInputElement | undefined>(undefined);
  let listEl = $state<HTMLUListElement | undefined>(undefined);

  const navigate = (hash: string) => () => {
    close();
    if (location.hash === hash) {
      // Force re-scroll
      const el = document.querySelector(hash);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      location.hash = hash;
    }
  };
  const openExternal = (url: string) => () => {
    close();
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const openProject = (slug: string) => () => {
    close();
    location.hash = `#/p/${slug}`;
  };
  const copyEmail = () => {
    close();
    navigator.clipboard?.writeText(PROFILE.email).catch(() => {});
  };

  const baseItems: Item[] = [
    {
      id: "nav:about",
      group: "navigate",
      label: "Go to about",
      hint: "#about",
      Icon: User,
      run: navigate("#about"),
    },
    {
      id: "nav:terminal",
      group: "navigate",
      label: "Go to terminal",
      hint: "#terminal",
      keywords: "shell wasm rust",
      Icon: TerminalIcon,
      run: navigate("#terminal"),
    },
    {
      id: "nav:projects",
      group: "navigate",
      label: "Go to projects",
      hint: "#projects",
      Icon: FolderTree,
      run: navigate("#projects"),
    },
    {
      id: "act:email",
      group: "action",
      label: `Copy email — ${PROFILE.email}`,
      hint: "clipboard",
      keywords: "contact mail",
      Icon: Mail,
      run: copyEmail,
    },
    {
      id: "ext:email",
      group: "external",
      label: "Compose email",
      hint: `mailto:${PROFILE.email}`,
      Icon: Mail,
      run: () => {
        close();
        location.href = `mailto:${PROFILE.email}`;
      },
    },
    {
      id: "ext:linkedin",
      group: "external",
      label: "LinkedIn",
      hint: PROFILE.linkedin.replace(/^https?:\/\//, ""),
      Icon: LinkedinIcon,
      run: openExternal(PROFILE.linkedin),
    },
    {
      id: "ext:github",
      group: "external",
      label: "GitHub",
      hint: PROFILE.url.replace(/^https?:\/\//, ""),
      keywords: "repos",
      Icon: GithubIcon,
      run: openExternal(PROFILE.url),
    },
    {
      id: "ext:resume",
      group: "external",
      label: "Download résumé",
      hint: PROFILE.resume ?? "/resume.pdf",
      keywords: "cv pdf",
      Icon: FileDown,
      run: openExternal(PROFILE.resume ?? "/resume.pdf"),
    },
  ];

  const projectItems: Item[] = PROJECTS.map((p) => ({
    id: `p:${p.slug}`,
    group: "project" as const,
    label: p.title,
    hint: `${p.language} · view README`,
    keywords: `${p.slug} ${p.description} ${p.tags.join(" ")}`,
    Icon: Eye,
    run: openProject(p.slug),
  }));

  const allItems = [...baseItems, ...projectItems];

  // tiny scorer — matches every query char in order, prefers shorter matches
  function score(item: Item, q: string): number {
    if (!q) return 1;
    const hay = (
      item.label +
      " " +
      (item.hint ?? "") +
      " " +
      (item.keywords ?? "")
    ).toLowerCase();
    const needle = q.toLowerCase();
    let s = 0,
      i = 0,
      last = -1;
    for (const c of needle) {
      const found = hay.indexOf(c, last + 1);
      if (found === -1) return 0;
      // closer to previous hit = better
      s += 1 / (found - last);
      last = found;
    }
    // bonus for exact substring
    if (hay.includes(needle)) s += 2;
    // bonus if label starts with query
    if (item.label.toLowerCase().startsWith(needle)) s += 3;
    return s;
  }

  const filtered = $derived(
    allItems
      .map((i) => ({ i, s: score(i, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 40)
      .map((x) => x.i)
  );

  const grouped = $derived.by(() => {
    const out: Record<string, Item[]> = {};
    for (const it of filtered) {
      (out[it.group] ??= []).push(it);
    }
    return out;
  });

  const groupOrder: Item["group"][] = [
    "navigate",
    "project",
    "action",
    "external",
  ];
  const groupLabels: Record<Item["group"], string> = {
    navigate: "navigate",
    project: "projects · view README",
    action: "actions",
    external: "external links",
  };

  async function openPalette() {
    open = true;
    query = "";
    activeIndex = 0;
    await tick();
    inputEl?.focus();
  }

  function close() {
    open = false;
    query = "";
  }

  function runActive() {
    const it = filtered[activeIndex];
    if (it) it.run();
  }

  function onKeyGlobal(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open ? close() : openPalette();
      return;
    }
    // '/' opens palette when nothing else is focused on text input
    if (
      !open &&
      e.key === "/" &&
      !(e.target instanceof HTMLInputElement) &&
      !(e.target instanceof HTMLTextAreaElement) &&
      !(e.target as HTMLElement | null)?.isContentEditable
    ) {
      e.preventDefault();
      openPalette();
    }
  }

  function onKeyLocal(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(filtered.length - 1, activeIndex + 1);
      scrollActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(0, activeIndex - 1);
      scrollActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      runActive();
    }
  }

  function scrollActive() {
    requestAnimationFrame(() => {
      const el = listEl?.querySelector<HTMLElement>(
        `[data-idx="${activeIndex}"]`
      );
      el?.scrollIntoView({ block: "nearest" });
    });
  }

  // Reset activeIndex when query changes
  $effect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    query;
    activeIndex = 0;
  });

  onMount(() => {
    window.addEventListener("keydown", onKeyGlobal);
    return () => window.removeEventListener("keydown", onKeyGlobal);
  });

  // Flat index for active highlighting across groups
  function flatIndex(group: Item["group"], localIdx: number) {
    let total = 0;
    for (const g of groupOrder) {
      if (g === group) return total + localIdx;
      total += grouped[g]?.length ?? 0;
    }
    return -1;
  }
</script>

<!-- Floating trigger hint (bottom-right) -->
<button
  type="button"
  aria-label="Open command palette (Cmd+K)"
  class="fixed right-4 bottom-4 z-30 hidden items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground shadow-lg backdrop-blur transition hover:border-primary/60 hover:text-primary sm:inline-flex"
  onclick={openPalette}
>
  <Command class="size-3" />
  <span>K</span>
  <span class="text-muted-foreground/50">·</span>
  <Search class="size-3" />
</button>

{#if open}
  <button
    type="button"
    aria-label="Close command palette"
    class="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
    onclick={close}
  ></button>

  <div
    role="dialog"
    aria-modal="true"
    aria-label="Command palette"
    class="fixed inset-x-0 top-[12vh] z-50 mx-auto w-[min(640px,92vw)] overflow-hidden rounded-xl border border-border/80 bg-card shadow-[0_20px_80px_-20px_rgba(0,0,0,0.6)]"
  >
    <div class="flex items-center gap-3 border-b border-border/70 px-4 py-3">
      <Search class="size-4 flex-none text-muted-foreground" />
      <input
        bind:this={inputEl}
        bind:value={query}
        onkeydown={onKeyLocal}
        type="text"
        placeholder="Type a command or search…"
        class="min-w-0 flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
      />
      <kbd
        class="hidden items-center gap-1 rounded-md border border-border/60 bg-background/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex"
      >
        ESC
      </kbd>
    </div>

    <ul bind:this={listEl} class="max-h-[60vh] overflow-y-auto py-2">
      {#if filtered.length === 0}
        <li
          class="px-4 py-6 text-center font-mono text-sm text-muted-foreground"
        >
          no matches for <span class="text-foreground">"{query}"</span>
        </li>
      {:else}
        {#each groupOrder as g (g)}
          {#if grouped[g]?.length}
            <li
              class="px-3 pt-2 pb-1 font-mono text-[10px] tracking-wider text-muted-foreground/60 uppercase"
            >
              {groupLabels[g]}
            </li>
            {#each grouped[g] as item, li (item.id)}
              {@const idx = flatIndex(g, li)}
              <li>
                <button
                  type="button"
                  data-idx={idx}
                  class={`flex w-full items-center gap-3 px-4 py-2 text-left font-mono text-sm transition ${
                    idx === activeIndex
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
                  }`}
                  onmouseenter={() => (activeIndex = idx)}
                  onclick={item.run}
                >
                  <item.Icon class="size-4 flex-none text-primary/80" />
                  <span class="min-w-0 flex-1 truncate">{item.label}</span>
                  {#if item.hint}
                    <span
                      class="hidden truncate text-[11px] text-muted-foreground/60 sm:inline"
                    >
                      {item.hint}
                    </span>
                  {/if}
                  {#if idx === activeIndex}
                    <CornerDownLeft class="size-3 flex-none text-primary" />
                  {:else if item.group === "external"}
                    <ArrowUpRight
                      class="size-3 flex-none text-muted-foreground/50"
                    />
                  {:else if item.group === "project"}
                    <ExternalLink
                      class="size-3 flex-none text-muted-foreground/40"
                    />
                  {/if}
                </button>
              </li>
            {/each}
          {/if}
        {/each}
      {/if}
    </ul>

    <div
      class="flex items-center justify-between border-t border-border/70 bg-background/30 px-4 py-2 font-mono text-[10px] text-muted-foreground"
    >
      <div class="flex items-center gap-3">
        <span
          ><kbd class="rounded border border-border/60 bg-background/70 px-1"
            >↑</kbd
          >
          <kbd class="rounded border border-border/60 bg-background/70 px-1"
            >↓</kbd
          > navigate</span
        >
        <span
          ><kbd class="rounded border border-border/60 bg-background/70 px-1"
            >↵</kbd
          > select</span
        >
        <span
          ><kbd class="rounded border border-border/60 bg-background/70 px-1"
            >esc</kbd
          > close</span
        >
      </div>
      <span class="hidden sm:inline"
        >press <kbd
          class="rounded border border-border/60 bg-background/70 px-1">⌘K</kbd
        > anywhere</span
      >
    </div>
  </div>
{/if}
