<script lang="ts">
  import { href } from "$lib/router.svelte";
  import { Button } from "$lib/components/ui/button";
  import { setMeta } from "$lib/meta";

  $effect(() => setMeta({ title: "404 · not found · Fanaperana" }));
</script>

<section class="py-24 font-mono">
  <p class="text-sm text-muted-foreground"><span class="text-primary">$</span> cd {location.pathname}</p>
  <p class="mt-1 text-sm text-red-400">cd: no such file or directory</p>
  <h1 class="mt-6 text-3xl font-semibold text-foreground">404 — nothing here.</h1>
  <div class="mt-6 flex gap-3">
    <Button href={href("/")}>cd ~</Button>
    <Button variant="outline" href={href("/#work")}>see my work</Button>
  </div>
</section>
