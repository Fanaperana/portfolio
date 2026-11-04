<script lang="ts">
  import { PROFILE } from "$lib/data/projects";
  import { Button } from "$lib/components/ui/button";
  import { FolderTree, Briefcase, NotebookPen, FileDown, Mail } from "@lucide/svelte";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import { href } from "$lib/router.svelte";
  import { NOTES } from "$lib/notes";

  const links = [
    { href: href("/#work"), label: "work", icon: FolderTree },
    { href: href("/#services"), label: "services", icon: Briefcase },
    ...(NOTES.length ? [{ href: href("/notes"), label: "notes", icon: NotebookPen }] : []),
    { href: href("/#contact"), label: "contact", icon: Mail },
  ];
</script>

<header
  class="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur"
>
  <nav
    class="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 sm:px-8"
  >
    <a href={href("/")} class="group flex items-center gap-2 font-mono text-sm">
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
            <span class="hidden md:inline">{l.label}</span>
          </Button>
        </li>
      {/each}
      <li>
        <Button
          variant="ghost"
          size="sm"
          href="#/resume"
          class="text-muted-foreground hover:text-foreground"
        >
          <FileDown class="size-3.5" />
          <span class="hidden md:inline">résumé</span>
        </Button>
      </li>
      <li>
        <Button
          variant="outline"
          size="sm"
          href={PROFILE.url}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
        >
          <GithubIcon class="size-3.5" />
          <span class="hidden md:inline">github</span>
        </Button>
      </li>
    </ul>
  </nav>
</header>
