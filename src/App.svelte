<script lang="ts">
  import { onMount } from "svelte";
  import Nav from "$lib/components/Nav.svelte";
  import Hero from "$lib/components/Hero.svelte";
  import FeaturedWork from "$lib/components/FeaturedWork.svelte";
  import Services from "$lib/components/Services.svelte";
  import About from "$lib/components/About.svelte";
  import Terminal from "$lib/components/Terminal.svelte";
  import Projects from "$lib/components/Projects.svelte";
  import NotesList from "$lib/components/NotesList.svelte";
  import Contact from "$lib/components/Contact.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import ProjectPage from "$lib/components/ProjectPage.svelte";
  import NotePage from "$lib/components/NotePage.svelte";
  import NotFound from "$lib/components/NotFound.svelte";
  import CommandPalette from "$lib/components/CommandPalette.svelte";
  import ResumeViewer from "$lib/components/ResumeViewer.svelte";
  import { router, startRouter } from "$lib/router.svelte";
  import { setMeta } from "$lib/meta";

  onMount(() => {
    startRouter();
    // Deep link to a home section on first load (e.g. /portfolio/#services).
    if (location.hash && !location.hash.startsWith("#/")) {
      requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
    }
  });

  $effect(() => {
    const r = router.route;
    if (r.name === "home") setMeta({ path: "/" });
    if (r.name === "notes") setMeta({ title: "Notes · Fanaperana", description: "Technical deep dives on Rust, WebAssembly, security and developer tooling.", path: "/notes" });
  });
</script>

<div class="min-h-screen">
  <Nav />
  <main class="mx-auto w-full max-w-6xl px-5 sm:px-8">
    {#if router.route.name === "home"}
      <Hero />
      <FeaturedWork />
      <Services />
      <About />
      <Terminal />
      <Projects />
      <NotesList limit={3} />
      <Contact />
    {:else if router.route.name === "project"}
      {#key router.route.slug}
        <ProjectPage slug={router.route.slug} />
      {/key}
    {:else if router.route.name === "notes"}
      <div class="pt-6"><NotesList /></div>
    {:else if router.route.name === "note"}
      {#key router.route.slug}
        <NotePage slug={router.route.slug} />
      {/key}
    {:else}
      <NotFound />
    {/if}
  </main>
  <Footer />
  <CommandPalette />
  <ResumeViewer />
</div>
