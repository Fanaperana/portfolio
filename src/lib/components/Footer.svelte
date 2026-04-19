<script lang="ts">
  import { PROFILE } from '$lib/data/projects'
</script>

<footer class="mt-20 border-t border-border/70 bg-background/40">
  <div class="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 px-5 py-6 font-mono text-xs text-muted-foreground/70 sm:flex-row sm:items-center sm:px-8">
    <div>
      <span class="text-muted-foreground">$</span> echo "built with rust + svelte + vite"
    </div>
    <div class="flex items-center gap-4">
      <a class="hover:text-primary" href={PROFILE.url} target="_blank" rel="noreferrer">github</a>
      <span>·</span>
      <span>© {new Date().getFullYear()} {PROFILE.login}</span>
    </div>
  </div>
</footer>
