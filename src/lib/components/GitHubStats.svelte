<!--
  Build-time GitHub stats: contribution heatmap + aggregated language breakdown.
  Data comes from src/lib/data/github.generated.ts (refreshed at build time).
-->
<script lang="ts">
  import * as Card from '$lib/components/ui/card'
  import { Badge } from '$lib/components/ui/badge'
  import {
    GH_PROFILE,
    GH_CONTRIBS,
    GH_LANGUAGES,
  } from '$lib/data/github.generated'
  import { PROFILE } from '$lib/data/projects'

  // Group contrib days into weeks (7 rows × N cols) for the heatmap.
  type Day = { date: string; count: number; color: string }
  const weeks: Day[][] = (() => {
    if (!GH_CONTRIBS) return []
    const days = GH_CONTRIBS.days
    const out: Day[][] = []
    // GitHub's calendar always starts on a Sunday; pad the first week if needed.
    const firstDow = new Date(days[0].date + 'T00:00:00Z').getUTCDay()
    const padded: (Day | null)[] = Array(firstDow).fill(null).concat(days)
    for (let i = 0; i < padded.length; i += 7) {
      out.push(padded.slice(i, i + 7) as Day[])
    }
    return out
  })()

  const maxCount = (() => {
    if (!GH_CONTRIBS) return 0
    return GH_CONTRIBS.days.reduce((m, d) => Math.max(m, d.count), 0)
  })()

  function intensity(count: number): string {
    if (count === 0) return 'var(--color-border)'
    const pct = Math.min(1, count / Math.max(1, maxCount))
    if (pct < 0.15) return 'color-mix(in oklab, var(--color-accent) 25%, var(--color-border))'
    if (pct < 0.35) return 'color-mix(in oklab, var(--color-accent) 45%, var(--color-border))'
    if (pct < 0.6) return 'color-mix(in oklab, var(--color-accent) 70%, transparent)'
    return 'var(--color-accent)'
  }

  // Max language count, for relative bars.
  const langMax = GH_LANGUAGES.reduce((m, l) => Math.max(m, l.count), 0)

  // Profile line
  const profileLine = (() => {
    if (!GH_PROFILE) return null
    const years = (new Date().getFullYear() - new Date(GH_PROFILE.createdAt).getFullYear())
    return {
      followers: GH_PROFILE.followers,
      following: GH_PROFILE.following,
      repos: GH_PROFILE.publicRepos,
      years,
    }
  })()
</script>

{#if GH_CONTRIBS || GH_LANGUAGES.length > 0}
  <div class="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
    <!-- Contribution heatmap -->
    <Card.Root class="border-border/80 bg-card/50">
      <Card.Header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Card.Title class="font-mono text-sm">
            <span class="text-muted-foreground/60">$ </span>git log --all --author=&quot;{PROFILE.login}&quot;
          </Card.Title>
          {#if GH_CONTRIBS}
            <Badge variant="outline" class="font-mono text-[11px] text-muted-foreground">
              {GH_CONTRIBS.totalContributions.toLocaleString()} contributions · last 12 months
            </Badge>
          {/if}
        </div>
      </Card.Header>
      <Card.Content>
        {#if GH_CONTRIBS}
          <!-- Heatmap -->
          <div class="overflow-x-auto pb-1">
            <svg
              viewBox={`0 0 ${weeks.length * 12} 90`}
              class="h-[90px] w-full min-w-[640px]"
              aria-label="Contribution heatmap for the past year"
            >
              {#each weeks as week, wi (wi)}
                {#each week as day, di (di)}
                  {#if day}
                    <rect
                      x={wi * 12}
                      y={di * 12}
                      width="10"
                      height="10"
                      rx="2"
                      fill={intensity(day.count)}
                    >
                      <title>{day.date} · {day.count} contributions</title>
                    </rect>
                  {/if}
                {/each}
              {/each}
            </svg>
          </div>

          <!-- Legend + totals -->
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
            <div class="flex items-center gap-3">
              <span>{GH_CONTRIBS.totalCommits} commits</span>
              <span class="text-muted-foreground/40">·</span>
              <span>{GH_CONTRIBS.totalPRs} PRs</span>
              <span class="text-muted-foreground/40">·</span>
              <span>{GH_CONTRIBS.totalNewRepos} new repos</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-muted-foreground/70">less</span>
              {#each [0, 1, 3, 6, Math.max(8, maxCount)] as step (step)}
                <span
                  class="inline-block size-2.5 rounded-[2px]"
                  style={`background: ${intensity(step)}`}
                ></span>
              {/each}
              <span class="text-muted-foreground/70">more</span>
            </div>
          </div>
        {:else}
          <p class="font-mono text-xs text-muted-foreground">
            contribution data unavailable — set <code>GH_TOKEN</code> and rebuild.
          </p>
        {/if}
      </Card.Content>
    </Card.Root>

    <!-- Language breakdown -->
    <Card.Root class="border-border/80 bg-card/50">
      <Card.Header>
        <Card.Title class="font-mono text-sm">
          <span class="text-muted-foreground/60">$ </span>ls --langs
        </Card.Title>
      </Card.Header>
      <Card.Content>
        {#if GH_LANGUAGES.length > 0}
          <div class="space-y-2 font-mono text-xs">
            {#each GH_LANGUAGES as lang (lang.name)}
              <div class="grid grid-cols-[6rem_1fr_2rem] items-center gap-3">
                <span class="truncate text-foreground">{lang.name}</span>
                <div class="h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    class="h-full bg-gradient-to-r from-primary to-[var(--color-link)]"
                    style={`width: ${Math.round((lang.count / langMax) * 100)}%`}
                  ></div>
                </div>
                <span class="text-right text-muted-foreground/70">{lang.count}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="font-mono text-xs text-muted-foreground">
            language data unavailable.
          </p>
        {/if}

        {#if profileLine}
          <div class="mt-4 border-t border-border/60 pt-3 font-mono text-[11px] text-muted-foreground">
            <div class="flex flex-wrap items-center gap-3">
              <span>{profileLine.repos} public repos</span>
              <span class="text-muted-foreground/40">·</span>
              <span>{profileLine.followers} followers</span>
              <span class="text-muted-foreground/40">·</span>
              <span>{profileLine.years}y on github</span>
            </div>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
{/if}
