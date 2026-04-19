import type { Project } from '$lib/data/projects'

// Lazy-loaded wasm module wrapper around crates/mini-shell.
// Only imported on first invocation to keep initial bundle lean.

type WasmModule = typeof import('@mini-shell/mini_shell')

let modPromise: Promise<WasmModule> | null = null

async function load(): Promise<WasmModule> {
  if (!modPromise) {
    modPromise = (async () => {
      const mod = await import('@mini-shell/mini_shell')
      await mod.default()
      return mod
    })()
  }
  return modPromise
}

export type ShellResult =
  | { kind: 'projects'; value: Project[] }
  | { kind: 'strings'; value: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'text'; value: string }
  | { kind: 'error'; value: string }

export async function evaluate(source: string, projects: Project[]): Promise<ShellResult> {
  const mod = await load()
  const raw = mod.evaluate(source, projects as unknown as object)
  return raw as ShellResult
}

export async function version(): Promise<string> {
  const mod = await load()
  return mod.version()
}
