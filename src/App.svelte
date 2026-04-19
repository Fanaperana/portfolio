<script lang="ts">
  import Nav from '$lib/components/Nav.svelte'
  import Hero from '$lib/components/Hero.svelte'
  import About from '$lib/components/About.svelte'
  import Terminal from '$lib/components/Terminal.svelte'
  import Projects from '$lib/components/Projects.svelte'
  import Footer from '$lib/components/Footer.svelte'
</script>

<div class="min-h-screen">
  <Nav />
  <main class="mx-auto w-full max-w-6xl px-5 sm:px-8">
    <Hero />
    <About />
    <Terminal />
    <Projects />
  </main>
  <Footer />
</div>
