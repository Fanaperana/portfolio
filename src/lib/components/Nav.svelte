<script lang="ts">
  import { PROFILE } from "$lib/data/projects";
  import { Button } from "$lib/components/ui/button";
  import { Terminal, FolderTree, User, FileDown } from "@lucide/svelte";
  import GithubIcon from "./icons/GithubIcon.svelte";

  const links = [
    { href: "#about", label: "about", icon: User },
    { href: "#terminal", label: "terminal", icon: Terminal },
    { href: "#projects", label: "projects", icon: FolderTree },
  ];
</script>

<header
  class="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur"
>
  <nav
    class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8"
  >
    <a href="#top" class="group flex items-center gap-2 font-mono text-sm">
      <span class="text-primary">~/</span>
      <span class="text-foreground">{PROFILE.login.toLowerCase()}</span>
      <span class="caret text-primary"></span>
      <span
        class="ml-2 hidden items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary sm:inline-flex"
        title={PROFILE.status}
      >
        <span
          class="animate-twinkle inline-block h-1.5 w-1.5 rounded-full bg-primary"
        ></span>
        {PROFILE.status}
      </span>
    </a>
    <ul class="flex items-center gap-1 font-mono text-sm">
      {#each links as l (l.href)}
        <li>
          <Button
            variant="ghost"
            size="sm"
            href={l.href}
            class="text-muted-foreground hover:text-foreground"
          >
            <l.icon class="size-3.5" />
            <span class="hidden sm:inline">{l.label}</span>
          </Button>
        </li>
      {/each}
      <li>
        <Button
          variant="ghost"
          size="sm"
          href={PROFILE.resume}
          target="_blank"
          rel="noreferrer"
          class="text-muted-foreground hover:text-foreground"
        >
          <FileDown class="size-3.5" />
          <span class="hidden sm:inline">résumé</span>
        </Button>
      </li>
      <li>
        <Button
          variant="outline"
          size="sm"
          href={PROFILE.url}
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon class="size-3.5" />
          <span class="hidden sm:inline">github</span>
        </Button>
      </li>
    </ul>
  </nav>
</header>
