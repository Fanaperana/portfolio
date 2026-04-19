import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import path from 'node:path'

// Base path for GitHub Pages project site: https://<user>.github.io/portfolio/
const base = process.env.VITE_BASE ?? '/portfolio/'

export default defineConfig({
  base,
  plugins: [tailwindcss(), svelte(), wasm()],
  build: {
    target: 'es2022',
  },
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, 'src/lib'),
      '@mini-shell': path.resolve(__dirname, 'crates/mini-shell/pkg'),
    },
  },
  server: {
    fs: { allow: ['.'] },
  },
})
