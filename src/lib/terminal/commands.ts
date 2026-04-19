import type { Project } from '$lib/data/projects'
import { PROFILE, PROJECTS } from '$lib/data/projects'
import { evaluate, version as wasmVersion, type ShellResult } from '$lib/wasm/shell'

export type OutputLine =
  | { kind: 'text'; value: string; tone?: 'muted' | 'accent' | 'warn' | 'error' }
  | { kind: 'prompt'; value: string }
  | { kind: 'link'; href: string; label: string }
  | { kind: 'banner'; value: string }
  | { kind: 'projects'; value: Project[] }

export type Ctx = {
  push: (line: OutputLine | OutputLine[]) => void
  clear: () => void
  setTheme: (name: string) => void
  getHistory: () => string[]
}

export type Command = {
  name: string
  describe: string
  run: (args: string[], raw: string, ctx: Ctx) => void | Promise<void>
  complete?: (prefix: string) => string[]
}

const BANNER = String.raw`
   ___              __ __ _      
  / _/__ ____  ___ / //_/(_)___ _
 / _/ _ \`/ _ \/ _ \/ ,<  / / __ \`/
/_/ \_,_/_//_/\_,_/_/|_|/_/\_,_/ 
`

export const COMMANDS: Command[] = [
  {
    name: 'help',
    describe: 'list available commands',
    run: (_a, _r, ctx) => {
      ctx.push({ kind: 'text', value: 'commands:', tone: 'accent' })
      for (const c of COMMANDS) {
        ctx.push({ kind: 'text', value: `  ${c.name.padEnd(10)} ${c.describe}`, tone: 'muted' })
      }
      ctx.push({ kind: 'text', value: '' })
      ctx.push({
        kind: 'text',
        value: 'try: `ls`, `open minichess`, `sh "projects | lang rust | sort stars | names"`',
        tone: 'muted',
      })
    },
  },
  {
    name: 'about',
    describe: 'about me',
    run: (_a, _r, ctx) => {
      ctx.push({ kind: 'banner', value: BANNER })
      ctx.push({ kind: 'text', value: `user:    ${PROFILE.login}` })
      ctx.push({ kind: 'text', value: `tagline: ${PROFILE.tagline}`, tone: 'muted' })
      ctx.push({ kind: 'link', href: PROFILE.url, label: PROFILE.url })
    },
  },
  {
    name: 'ls',
    describe: 'list projects',
    run: (args, _r, ctx) => {
      const target = args[0] ?? 'projects'
      if (target !== 'projects') {
        ctx.push({ kind: 'text', value: `ls: no such entry: ${target}`, tone: 'error' })
        return
      }
      ctx.push({ kind: 'projects', value: PROJECTS })
    },
  },
  {
    name: 'open',
    describe: 'open <slug> in a new tab',
    run: (args, _r, ctx) => {
      const slug = args[0]
      if (!slug) {
        ctx.push({ kind: 'text', value: 'open: missing project slug', tone: 'error' })
        return
      }
      const p = PROJECTS.find((x) => x.slug.toLowerCase() === slug.toLowerCase())
      if (!p) {
        ctx.push({ kind: 'text', value: `open: unknown project \`${slug}\``, tone: 'error' })
        return
      }
      ctx.push({ kind: 'text', value: `→ opening ${p.title}`, tone: 'accent' })
      if (typeof window !== 'undefined') window.open(p.url, '_blank', 'noopener')
    },
    complete: (prefix) =>
      PROJECTS.map((p) => p.slug).filter((s) =>
        s.toLowerCase().startsWith(prefix.toLowerCase())
      ),
  },
  {
    name: 'cat',
    describe: 'cat <slug> — print project details',
    run: (args, _r, ctx) => {
      const slug = args[0]
      const p = PROJECTS.find((x) => x.slug.toLowerCase() === (slug ?? '').toLowerCase())
      if (!p) {
        ctx.push({ kind: 'text', value: `cat: no such project \`${slug ?? ''}\``, tone: 'error' })
        return
      }
      ctx.push({ kind: 'text', value: `── ${p.title} ──`, tone: 'accent' })
      ctx.push({ kind: 'text', value: p.description })
      ctx.push({ kind: 'text', value: `lang:  ${p.language}`, tone: 'muted' })
      ctx.push({ kind: 'text', value: `tags:  ${p.tags.map((t) => '#' + t).join(' ')}`, tone: 'muted' })
      ctx.push({ kind: 'text', value: `stars: ${p.stars}`, tone: 'muted' })
      ctx.push({ kind: 'link', href: p.url, label: p.url })
    },
    complete: (prefix) =>
      PROJECTS.map((p) => p.slug).filter((s) =>
        s.toLowerCase().startsWith(prefix.toLowerCase())
      ),
  },
  {
    name: 'whoami',
    describe: 'current user',
    run: (_a, _r, ctx) => ctx.push({ kind: 'text', value: PROFILE.login }),
  },
  {
    name: 'sh',
    describe: 'run a Rust/WASM pipeline, e.g. sh "projects | lang rust | count"',
    run: async (_args, raw, ctx) => {
      // strip the leading `sh` keyword, keep the rest including quotes
      const src = raw.replace(/^\s*sh\s+/, '').trim().replace(/^["'](.*)["']$/, '$1')
      if (!src) {
        ctx.push({ kind: 'text', value: 'sh: usage: sh "projects | <op> ..."', tone: 'error' })
        return
      }
      ctx.push({ kind: 'text', value: `[wasm] evaluating: ${src}`, tone: 'muted' })
      try {
        const res: ShellResult = await evaluate(src, PROJECTS)
        renderResult(res, ctx)
      } catch (e) {
        ctx.push({ kind: 'text', value: `sh: ${(e as Error).message}`, tone: 'error' })
      }
    },
  },
  {
    name: 'version',
    describe: 'print wasm + app version',
    run: async (_a, _r, ctx) => {
      try {
        const v = await wasmVersion()
        ctx.push({ kind: 'text', value: `mini-shell v${v} (rust → wasm)`, tone: 'accent' })
      } catch (e) {
        ctx.push({ kind: 'text', value: `version: ${(e as Error).message}`, tone: 'error' })
      }
    },
  },
  {
    name: 'theme',
    describe: 'theme <matrix|amber|mono> — switch accent',
    run: (args, _r, ctx) => {
      const name = args[0] ?? 'matrix'
      ctx.setTheme(name)
      ctx.push({ kind: 'text', value: `theme set to ${name}`, tone: 'accent' })
    },
    complete: (prefix) =>
      ['matrix', 'amber', 'mono'].filter((s) => s.startsWith(prefix.toLowerCase())),
  },
  {
    name: 'history',
    describe: 'show command history',
    run: (_a, _r, ctx) => {
      const h = ctx.getHistory()
      if (h.length === 0) ctx.push({ kind: 'text', value: '(empty)', tone: 'muted' })
      for (let i = 0; i < h.length; i++) {
        ctx.push({ kind: 'text', value: `${String(i + 1).padStart(3)}  ${h[i]}`, tone: 'muted' })
      }
    },
  },
  {
    name: 'clear',
    describe: 'clear the screen',
    run: (_a, _r, ctx) => ctx.clear(),
  },
]

function renderResult(res: ShellResult, ctx: Ctx) {
  switch (res.kind) {
    case 'number':
      ctx.push({ kind: 'text', value: String(res.value), tone: 'accent' })
      return
    case 'text':
      ctx.push({ kind: 'text', value: res.value })
      return
    case 'error':
      ctx.push({ kind: 'text', value: `error: ${res.value}`, tone: 'error' })
      return
    case 'strings':
      if (res.value.length === 0) ctx.push({ kind: 'text', value: '(empty)', tone: 'muted' })
      for (const s of res.value) ctx.push({ kind: 'text', value: `• ${s}` })
      return
    case 'projects':
      ctx.push({ kind: 'projects', value: res.value })
      return
  }
}

export function resolveCommand(line: string): { cmd?: Command; args: string[]; raw: string } {
  const raw = line.trim()
  const tokens = raw.split(/\s+/)
  const name = tokens[0] ?? ''
  const cmd = COMMANDS.find((c) => c.name === name)
  return { cmd, args: tokens.slice(1), raw }
}

export function completeCommandName(prefix: string): string[] {
  return COMMANDS.map((c) => c.name).filter((n) => n.startsWith(prefix))
}
