// Lazy wrapper around crates/fuzzly-wasm — typo-tolerant project search
// powered by fuzzly (github.com/Fanaperana/fuzzy-search-rs).

import type { Project } from '$lib/data/projects'

type Mod = typeof import('@fuzzly/fuzzly_wasm')
type Index = InstanceType<Mod['SearchIndex']>

let ready: Promise<{ index: Index; projects: Project[] }> | null = null

export function loadSearch(projects: Project[]) {
  if (!ready) {
    ready = (async () => {
      const mod = await import('@fuzzly/fuzzly_wasm')
      await mod.default()
      const docs = projects.map((p) =>
        [p.title, p.slug, p.language, p.tags.join(' '), p.description].join(' '),
      )
      return { index: new mod.SearchIndex(docs), projects }
    })()
  }
  return ready
}

export type SearchHit = { project: Project; score: number }

export async function search(
  projects: Project[],
  query: string,
  threshold = 0.72,
): Promise<{ hits: SearchHit[]; ms: number; terms: number }> {
  const { index, projects: ps } = await loadSearch(projects)
  const t0 = performance.now()
  const flat = index.search(query, threshold)
  const ms = performance.now() - t0
  const hits: SearchHit[] = []
  for (let i = 0; i < flat.length; i += 2) hits.push({ project: ps[flat[i]], score: flat[i + 1] / 1000 })
  return { hits, ms, terms: index.terms }
}
