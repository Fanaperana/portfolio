<script lang="ts">
  import { PROFILE } from "$lib/data/projects";
  import { Mail, FileDown } from "@lucide/svelte";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import LinkedinIcon from "./icons/LinkedinIcon.svelte";
</script>

<footer class="mt-20 border-t border-border/70 bg-background/40">
  <div
    class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-start lg:justify-between"
  >
    <div class="font-mono text-sm text-muted-foreground">
      <div>
        <span class="text-primary">$</span> echo "built with rust + svelte + vite"
      </div>
      <div class="mt-1 text-xs text-muted-foreground/70">
        Hand-rolled · no template · Rust → WASM mini-shell inside.
      </div>
      <div
        class="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-2 py-0.5 text-[11px] text-primary"
      >
        <span
          class="animate-twinkle inline-block h-1.5 w-1.5 rounded-full bg-primary"
        ></span>
        {PROFILE.status} · {PROFILE.location}
      </div>
    </div>

    <div
      class="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground/80"
    >
      <a
        class="inline-flex items-center gap-1.5 hover:text-primary"
        href={`mailto:${PROFILE.email}`}
      >
        <Mail class="size-3.5" />
        {PROFILE.email}
      </a>
      <a
        class="inline-flex items-center gap-1.5 hover:text-primary"
        href={PROFILE.linkedin}
        target="_blank"
        rel="noreferrer"
      >
        <LinkedinIcon class="size-3.5" />
        linkedin
      </a>
      <a
        class="inline-flex items-center gap-1.5 hover:text-primary"
        href={PROFILE.url}
        target="_blank"
        rel="noreferrer"
      >
        <GithubIcon class="size-3.5" />
        github
      </a>
      <a
        class="inline-flex items-center gap-1.5 hover:text-primary"
        href={PROFILE.resume}
        target="_blank"
        rel="noreferrer"
      >
        <FileDown class="size-3.5" />
        résumé.pdf
      </a>
    </div>
  </div>

  <div
    class="border-t border-border/50 px-5 py-4 text-center font-mono text-[11px] text-muted-foreground/60 sm:px-8"
  >
    © {new Date().getFullYear()}
    {PROFILE.login} · crafted for curious humans and recruiters alike.
  </div>
</footer>
