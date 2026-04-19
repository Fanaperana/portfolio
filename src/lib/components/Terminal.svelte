<script lang="ts">
  import { onMount, tick } from 'svelte'
  import {
    COMMANDS,
    completeCommandName,
    resolveCommand,
    type Ctx,
    type OutputLine,
  } from '$lib/terminal/commands'
  import { PROFILE } from '$lib/data/projects'
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'

  let input = $state('')
  let lines = $state<{ prompt?: string; out?: OutputLine }[]>([])
  let history = $state<string[]>([])
  let historyIdx = $state(-1)
  let scrollEl: HTMLDivElement | undefined
  let inputEl: HTMLInputElement | undefined

  function push(o: OutputLine | OutputLine[]) {
    const arr = Array.isArray(o) ? o : [o]
    for (const x of arr) lines.push({ out: x })
  }

  function clear() {
    lines = []
  }

  function setTheme(name: string) {
    const root = document.documentElement
    const themes: Record<string, { accent: string; soft: string; link: string }> = {
      matrix: { accent: '#5eead4', soft: '#2dd4bf33', link: '#a5f3fc' },
      amber: { accent: '#fbbf24', soft: '#f59e0b33', link: '#fde68a' },
      mono: { accent: '#e5e7eb', soft: '#9ca3af33', link: '#e5e7eb' },
    }
    const t = themes[name] ?? themes.matrix
    root.style.setProperty('--color-accent', t.accent)
    root.style.setProperty('--color-accent-soft', t.soft)
    root.style.setProperty('--color-link', t.link)
    root.style.setProperty('--primary', t.accent)
    root.style.setProperty('--ring', t.accent)
  }

  const ctx: Ctx = {
    push,
    clear,
    setTheme,
    getHistory: () => history,
  }

  async function submit() {
    const raw = input
    input = ''
    if (raw.trim() === '') {
      lines.push({ prompt: '' })
      await scrollToBottom()
      return
    }
    lines.push({ prompt: raw })
    history.push(raw)
    historyIdx = -1
    const { cmd, args } = resolveCommand(raw)
    if (!cmd) {
      const name = raw.trim().split(/\s+/)[0]
      push({ kind: 'text', value: `${name}: command not found — type \`help\``, tone: 'error' })
    } else {
      try {
        await cmd.run(args, raw, ctx)
      } catch (e) {
        push({ kind: 'text', value: `${cmd.name}: ${(e as Error).message}`, tone: 'error' })
      }
    }
    await scrollToBottom()
  }

  async function scrollToBottom() {
    await tick()
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    } else if (e.key === 'ArrowUp') {
      if (history.length === 0) return
      e.preventDefault()
      historyIdx = historyIdx < 0 ? history.length - 1 : Math.max(0, historyIdx - 1)
      input = history[historyIdx]
    } else if (e.key === 'ArrowDown') {
      if (history.length === 0) return
      e.preventDefault()
      if (historyIdx < 0) return
      historyIdx = historyIdx + 1
      if (historyIdx >= history.length) {
        historyIdx = -1
        input = ''
      } else {
        input = history[historyIdx]
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      const tokens = input.split(/\s+/)
      if (tokens.length <= 1) {
        const matches = completeCommandName(tokens[0] ?? '')
        if (matches.length === 1) input = matches[0] + ' '
        else if (matches.length > 1) push({ kind: 'text', value: matches.join('  '), tone: 'muted' })
      } else {
        const cmd = COMMANDS.find((c) => c.name === tokens[0])
        const prefix = tokens[tokens.length - 1]
        const matches = cmd?.complete?.(prefix) ?? []
        if (matches.length === 1) {
          tokens[tokens.length - 1] = matches[0]
          input = tokens.join(' ')
        } else if (matches.length > 1) {
          push({ kind: 'text', value: matches.join('  '), tone: 'muted' })
        }
      }
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      clear()
    }
  }

  onMount(() => {
    push([
      {
        kind: 'text',
        value: `${PROFILE.login}@portfolio  ·  type \`help\` or try \`sh "projects | lang rust | count"\``,
        tone: 'muted',
      },
    ])
    inputEl?.focus()

    function onGlobal(e: KeyboardEvent) {
      if (e.key === '?' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        inputEl?.focus()
        inputEl?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
    window.addEventListener('keydown', onGlobal)
    return () => window.removeEventListener('keydown', onGlobal)
  })

  function focusInput() {
    inputEl?.focus()
  }

  const samples = [
    'help',
    'ls',
    'sh "projects | lang rust | count"',
    'sh "projects | grep chess | names"',
    'open minichess',
    'theme amber',
  ]
</script>

<section id="terminal" class="scroll-mt-20 py-16">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 class="font-mono text-2xl font-semibold text-foreground">
        <span class="text-muted-foreground/60"># </span>terminal
      </h2>
      <p class="mt-2 max-w-2xl text-muted-foreground">
        A real parser in Rust, compiled to WASM, evaluates your pipelines in-browser.
        Type <code class="rounded bg-card px-1.5 py-0.5 font-mono text-xs text-primary">help</code>
        to see commands. Press <kbd class="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs">?</kbd>
        anywhere to focus.
      </p>
    </div>
  </div>

  <Card.Root
    class="mt-6 gap-0 overflow-hidden border-border/80 bg-card/80 py-0 shadow-2xl"
  >
    <div class="flex items-center gap-1.5 border-b border-border/80 px-4 py-2.5">
      <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f56]"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
      <span class="h-2.5 w-2.5 rounded-full bg-[#27c93f]"></span>
      <span class="ml-3 font-mono text-xs text-muted-foreground/70">
        {PROFILE.login}@portfolio — /bin/mini-shell
      </span>
    </div>

    <button
      type="button"
      tabindex="-1"
      class="block w-full cursor-text text-left outline-none focus:outline-none focus-visible:outline-none"
      onclick={focusInput}
      aria-label="Focus terminal input"
    >
      <div
        bind:this={scrollEl}
        class="h-[28rem] overflow-y-auto px-4 py-3 font-mono text-sm leading-relaxed"
      >
        {#each lines as line, i (i)}
          {#if line.prompt !== undefined}
            <div class="flex gap-2 break-words whitespace-pre-wrap text-foreground">
              <span class="flex-none text-primary">
                {PROFILE.login.toLowerCase()}@portfolio<span class="text-muted-foreground/60">:~$</span>
              </span>
              <span>{line.prompt}</span>
            </div>
          {:else if line.out}
            {@const o = line.out}
            {#if o.kind === 'text'}
              <div
                class="break-words whitespace-pre-wrap"
                class:text-primary={o.tone === 'accent'}
                class:text-destructive={o.tone === 'error'}
                class:text-amber-400={o.tone === 'warn'}
                class:text-muted-foreground={o.tone === 'muted'}
                class:text-foreground={!o.tone}
              >{o.value}</div>
            {:else if o.kind === 'banner'}
              <pre class="font-mono whitespace-pre text-primary">{o.value}</pre>
            {:else if o.kind === 'link'}
              <a
                class="text-[var(--color-link)] underline decoration-dotted hover:text-primary"
                href={o.href}
                target="_blank"
                rel="noreferrer"
              >{o.label} ↗</a>
            {:else if o.kind === 'projects'}
              <div class="my-1 grid gap-1 pl-1">
                {#each o.value as p (p.slug)}
                  <div class="flex items-start gap-3">
                    <span class="w-28 flex-none truncate text-primary">{p.slug}</span>
                    <span class="w-24 flex-none truncate text-muted-foreground/70">{p.language}</span>
                    <span class="w-10 flex-none text-right text-muted-foreground/70">★ {p.stars}</span>
                    <span class="truncate text-muted-foreground">{p.description}</span>
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        {/each}

        <!-- live input line -->
        <div class="mt-1 flex items-center gap-2 text-foreground">
          <span class="flex-none text-primary">
            {PROFILE.login.toLowerCase()}@portfolio<span class="text-muted-foreground/60">:~$</span>
          </span>
          <input
            bind:this={inputEl}
            bind:value={input}
            onkeydown={onKey}
            data-terminal-input
            class="flex-1 border-0 bg-transparent p-0 text-foreground caret-primary shadow-none outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            autocomplete="off"
            autocapitalize="off"
            autocorrect="off"
            spellcheck="false"
            aria-label="Terminal input"
          />
        </div>
      </div>
    </button>
  </Card.Root>

  <div class="mt-4 flex flex-wrap gap-2 font-mono text-xs">
    {#each samples as sample}
      <Button
        variant="outline"
        size="sm"
        class="rounded-full text-muted-foreground hover:text-primary"
        onclick={() => {
          input = sample
          submit()
        }}
      >
        {sample}
      </Button>
    {/each}
  </div>
</section>
