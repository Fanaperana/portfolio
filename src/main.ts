import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

// Static content written by scripts/prerender.mjs for crawlers; the app replaces it.
document.getElementById('prerender')?.remove()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
