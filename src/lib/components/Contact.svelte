<script lang="ts">
  import { Mail, FileDown, Rocket, Briefcase } from "@lucide/svelte";
  import { PROFILE } from "$lib/data/projects";
  import { CONTACT, NEXT } from "$lib/data/site";
  import { Button } from "$lib/components/ui/button";
  import GithubIcon from "./icons/GithubIcon.svelte";
  import LinkedinIcon from "./icons/LinkedinIcon.svelte";

  const mailto = (subject: string, body: string) =>
    `mailto:${PROFILE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
</script>

<section id="contact" class="scroll-mt-20 py-16">
  <div class="relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-10">
    <div
      class="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
      aria-hidden="true"
    ></div>

    <h2 class="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
      <span class="text-muted-foreground/60">$ </span>let's build something
    </h2>
    <p class="mt-3 max-w-2xl text-muted-foreground">
      Hiring for a role or need help with a project? Email me with a few lines about it.
    </p>

    <div class="mt-6 flex flex-wrap gap-3 font-mono text-sm">
      <Button size="lg" href={mailto(CONTACT.projectSubject, CONTACT.projectBody)}>
        <Briefcase class="size-4" /> project inquiry
      </Button>
      <Button size="lg" variant="outline" href={mailto(CONTACT.hireSubject, CONTACT.hireBody)}>
        <Mail class="size-4" /> hiring? email me
      </Button>
      <Button size="lg" variant="outline" href="#/resume">
        <FileDown class="size-4" /> résumé
      </Button>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
      <a href={`mailto:${PROFILE.email}`} class="inline-flex items-center gap-1.5 hover:text-primary">
        <Mail class="size-3.5" />{PROFILE.email}
      </a>
      <a href={PROFILE.linkedin} target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 hover:text-primary">
        <LinkedinIcon class="size-3.5" />linkedin
      </a>
      <a href={PROFILE.url} target="_blank" rel="noreferrer" class="inline-flex items-center gap-1.5 hover:text-primary">
        <GithubIcon class="size-3.5" />github
      </a>
    </div>

    <div class="mt-8 grid gap-4 border-t border-border/60 pt-6 sm:grid-cols-2">
      <div>
        <div class="font-mono text-[11px] uppercase tracking-wider text-primary">now</div>
        <p class="mt-1 text-sm text-foreground/90">{NEXT.now}</p>
      </div>
      <div>
        <div class="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary">
          <Rocket class="size-3" /> next
        </div>
        <p class="mt-1 text-sm text-foreground/90">{NEXT.later}</p>
      </div>
    </div>
  </div>
</section>
