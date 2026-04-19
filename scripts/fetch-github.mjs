#!/usr/bin/env node
// Build-time GitHub fetcher.
//
// Pulls:
//   · the user profile (bio, followers, public_repos)
//   · the last-year contribution calendar (via GraphQL)
//   · top languages aggregated across all repos (REST)
//   · README.md for every slug in src/lib/data/projects.ts (public AND private)
//
// Writes it all into src/lib/data/github.generated.ts so the build ships
// a self-contained static bundle — no runtime API calls, no rate limits.
//
// Authentication:
//   $GH_TOKEN           — PAT with `repo` scope (needed for private READMEs)
//                         In CI set it from secrets.GH_README_TOKEN.
//   $GITHUB_TOKEN       — fallback; works for public repos only.
//   local fallback       — `gh auth token` from the GitHub CLI, if installed.
//
// If no token is available this script exits successfully after writing
// an empty stub so the build never breaks.

import { execSync } from 'node:child_process'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'src/lib/data/github.generated.ts')

const USERNAME = 'Fanaperana'

function getToken() {
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
  try {
    const t = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
    if (t) return t
  } catch {}
  return null
}

function readProjects() {
  // naive parse of projects.ts — we just need each slug
  const src = readFileSync(resolve(ROOT, 'src/lib/data/projects.ts'), 'utf8')
  const slugs = Array.from(src.matchAll(/slug:\s*['"]([^'"]+)['"]/g)).map((m) => m[1])
  // dedupe, preserve order
  return Array.from(new Set(slugs))
}

async function gh(url, token, headers = {}) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'fanaperana-portfolio-build',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })
  return res
}

async function ghGraphQL(query, token) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'fanaperana-portfolio-build',
    },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`)
  return json.data
}

async function fetchProfile(token) {
  const r = await gh(`https://api.github.com/users/${USERNAME}`, token)
  if (!r.ok) throw new Error(`profile ${r.status}`)
  const j = await r.json()
  return {
    login: j.login,
    name: j.name,
    bio: j.bio,
    avatarUrl: j.avatar_url,
    followers: j.followers,
    following: j.following,
    publicRepos: j.public_repos,
    createdAt: j.created_at,
  }
}

async function fetchContributions(token) {
  const q = `
    query {
      user(login: "${USERNAME}") {
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          totalRepositoryContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `
  const data = await ghGraphQL(q, token)
  const c = data.user.contributionsCollection
  const days = c.contributionCalendar.weeks.flatMap((w) => w.contributionDays)
  return {
    totalContributions: c.contributionCalendar.totalContributions,
    totalCommits: c.totalCommitContributions,
    totalPRs: c.totalPullRequestContributions,
    totalIssues: c.totalIssueContributions,
    totalNewRepos: c.totalRepositoryContributions,
    days: days.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      color: d.color,
    })),
  }
}

async function fetchLanguages(token) {
  // Aggregate languages across all repos (public + private) the token can see.
  const byLang = new Map()
  let page = 1
  while (true) {
    const r = await gh(
      `https://api.github.com/user/repos?per_page=100&page=${page}&affiliation=owner&sort=pushed`,
      token,
    )
    if (!r.ok) {
      // Unauthenticated: fall back to public-only list
      const r2 = await gh(
        `https://api.github.com/users/${USERNAME}/repos?per_page=100&page=${page}`,
        token,
      )
      if (!r2.ok) break
      const arr = await r2.json()
      if (arr.length === 0) break
      for (const repo of arr) {
        if (!repo.language || repo.fork) continue
        byLang.set(repo.language, (byLang.get(repo.language) ?? 0) + 1)
      }
      if (arr.length < 100) break
    } else {
      const arr = await r.json()
      if (arr.length === 0) break
      for (const repo of arr) {
        if (!repo.language || repo.fork) continue
        byLang.set(repo.language, (byLang.get(repo.language) ?? 0) + 1)
      }
      if (arr.length < 100) break
    }
    page++
    if (page > 10) break
  }
  // Return top 8 by count
  return Array.from(byLang.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
}

async function fetchReadme(slug, token) {
  const r = await gh(`https://api.github.com/repos/${USERNAME}/${slug}/readme`, token, {
    Accept: 'application/vnd.github.raw',
  })
  if (r.status === 404 || r.status === 403) return null
  if (!r.ok) throw new Error(`readme ${slug}: ${r.status}`)
  return await r.text()
}

// Read the existing generated file so we can preserve READMEs we already
// fetched locally (e.g. private repos) when CI only has a public token.
function readExistingReadmes() {
  try {
    if (!existsSync(OUT)) return {}
    const src = readFileSync(OUT, 'utf8')
    const m = src.match(/export const GH_READMES[^=]*=\s*(\{[\s\S]*?\n\})\s*\n\nexport const GH_GENERATED_AT/)
    if (!m) return {}
    return JSON.parse(m[1])
  } catch (e) {
    console.warn(`[github] could not parse existing READMEs: ${e.message}`)
    return {}
  }
}

async function main() {
  const token = getToken()
  if (!token) {
    console.log('[github] no token found — keeping committed github.generated.ts as-is')
    return
  }
  console.log('[github] fetching build-time data...')

  const slugs = readProjects()
  const existing = readExistingReadmes()
  let profile = null
  let contribs = null
  let languages = []
  // Start from what's already committed — fresh fetches overwrite, failed
  // fetches fall back to the committed copy. This lets private-repo READMEs
  // ship via a local `pnpm fetch:github` + git commit without needing a
  // PAT in CI.
  const readmes = { ...existing }

  try {
    profile = await fetchProfile(token)
    console.log(`[github] profile: ${profile.login} · ${profile.followers} followers · ${profile.publicRepos} public repos`)
  } catch (e) {
    console.warn(`[github] profile failed: ${e.message}`)
  }

  try {
    contribs = await fetchContributions(token)
    console.log(`[github] ${contribs.totalContributions} contributions in last year · ${contribs.days.length} days`)
  } catch (e) {
    console.warn(`[github] contribs failed: ${e.message}`)
  }

  try {
    languages = await fetchLanguages(token)
    console.log(`[github] top langs: ${languages.map((l) => l.name).join(', ')}`)
  } catch (e) {
    console.warn(`[github] languages failed: ${e.message}`)
  }

  let ok = 0,
    miss = 0,
    kept = 0
  for (const slug of slugs) {
    try {
      const md = await fetchReadme(slug, token)
      if (md) {
        readmes[slug] = md
        ok++
      } else if (existing[slug]) {
        // Couldn't fetch (likely private + public-only token) — keep the
        // committed copy.
        kept++
      } else {
        miss++
      }
    } catch (e) {
      if (existing[slug]) kept++
      else miss++
      console.warn(`[github] readme ${slug}: ${e.message}`)
    }
  }
  console.log(`[github] readmes: ${ok} fresh · ${kept} kept from cache · ${miss} missing`)

  await write({ profile, contribs, languages, readmes })
}

async function writeStub() {
  await write({
    profile: null,
    contribs: null,
    languages: [],
    readmes: {},
  })
}

async function write(data) {
  await mkdir(dirname(OUT), { recursive: true })
  const body = `// AUTOGENERATED by scripts/fetch-github.mjs — do NOT edit by hand.
// Run \`pnpm fetch:github\` (or let the build do it) to refresh.

export type ContribDay = { date: string; count: number; color: string }

export type GhProfile = {
  login: string
  name: string | null
  bio: string | null
  avatarUrl: string
  followers: number
  following: number
  publicRepos: number
  createdAt: string
}

export type GhContribs = {
  totalContributions: number
  totalCommits: number
  totalPRs: number
  totalIssues: number
  totalNewRepos: number
  days: ContribDay[]
}

export type GhLanguage = { name: string; count: number }

export const GH_PROFILE: GhProfile | null = ${JSON.stringify(data.profile, null, 2)}

export const GH_CONTRIBS: GhContribs | null = ${JSON.stringify(data.contribs, null, 2)}

export const GH_LANGUAGES: GhLanguage[] = ${JSON.stringify(data.languages, null, 2)}

export const GH_READMES: Record<string, string> = ${JSON.stringify(data.readmes, null, 2)}

export const GH_GENERATED_AT = ${JSON.stringify(new Date().toISOString())}
`
  await writeFile(OUT, body, 'utf8')
  console.log(`[github] wrote ${OUT}`)
}

main().catch((e) => {
  console.error('[github] fatal:', e)
  // Don't fail the build — the committed github.generated.ts will be used.
  process.exit(0)
})
