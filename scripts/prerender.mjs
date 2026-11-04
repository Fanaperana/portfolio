#!/usr/bin/env node
// Post-build: give every route its own static HTML file so GitHub Pages serves
// a real page (status 200) with the right <title>, description, canonical URL
// and readable content for crawlers and link previews. The SPA mounts on top
// and removes the #prerender block (see src/main.ts).
//
// Writes: dist/projects/<slug>/index.html, dist/notes/index.html,
//         dist/notes/<slug>/index.html, dist/404.html, dist/sitemap.xml

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Marked } from "marked";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://fanaperana.github.io/portfolio";

const { PROJECTS, PROFILE } = await import(join(root, "src/lib/data/projects.ts"));
const { CASE_STUDIES } = await import(join(root, "src/lib/data/case-studies.ts"));
const { DEFAULT_META } = await import(join(root, "src/lib/meta.ts"));

const marked = new Marked({ gfm: true });
const md = (s) => marked.parse(s, { async: false });
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const template = readFileSync(join(dist, "index.html"), "utf8");

function page({ path, title, description, body, type = "website" }) {
  const url = SITE + path;
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`)
    .replace(/(<meta name="twitter:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta name="twitter:description" content=")[^"]*/, `$1${esc(description)}`);
  if (body) {
    html = html.replace(
      '<div id="app"></div>',
      `<div id="app"></div>\n  <div id="prerender" style="max-width:48rem;margin:0 auto;padding:2rem 1.25rem;color:#d7dbe6;font-family:system-ui,sans-serif;line-height:1.6">${body}</div>`,
    );
  }
  return html;
}

function write(rel, html) {
  const file = join(dist, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const nav = `<p><a href="${SITE}/">← ${esc(PROFILE.name)} · portfolio</a></p>`;
const urls = [{ path: "/", priority: "1.0" }];

// ── projects ──
for (const p of PROJECTS) {
  const cs = CASE_STUDIES.find((c) => c.slug === p.slug);
  const title = `${p.title} — ${cs?.headline ?? p.description} · ${PROFILE.login}`;
  const description = cs?.summary ?? p.description;
  let body = `${nav}<h1>${esc(p.title)}</h1><p><strong>${esc(cs?.headline ?? p.description)}</strong></p>`;
  if (cs) {
    body += `<p>${esc(cs.summary)}</p>`;
    body += `<p>Role: ${esc(cs.role)}. Stack: ${cs.stack.map(esc).join(", ")}.</p>`;
    body += `<ul>${cs.metrics.map((m) => `<li>${esc(m.value)} ${esc(m.label)}</li>`).join("")}</ul>`;
    body += `<h2>The problem</h2>${md(cs.problem)}<h2>The approach</h2>${md(cs.approach)}`;
    body += `<h2>Key decisions</h2>${cs.decisions.map((d) => `<h3>${esc(d.title)}</h3>${md(d.body)}`).join("")}`;
    body += `<h2>Outcome</h2>${md(cs.outcome)}`;
  }
  body += `<p>Language: ${esc(p.language)} · Tags: ${p.tags.map(esc).join(", ")}</p>`;
  write(`projects/${p.slug}/index.html`, page({ path: `/projects/${p.slug}`, title, description, body, type: "article" }));
  urls.push({ path: `/projects/${p.slug}`, priority: cs ? "0.9" : "0.5" });
}

// ── notes ──
const notesDir = join(root, "src/content/notes");
const notes = [];
for (const f of readdirSync(notesDir).filter((f) => f.endsWith(".md"))) {
  const raw = readFileSync(join(notesDir, f), "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  if (meta.draft === "true") continue;
  notes.push({ slug: f.replace(/\.md$/, ""), title: meta.title ?? f, date: meta.date ?? "", summary: meta.summary ?? "", body: m ? m[2] : raw });
}
notes.sort((a, b) => b.date.localeCompare(a.date));
for (const n of notes) {
  // in-site links in notes are written as "/projects/x"
  const body = `${nav}<h1>${esc(n.title)}</h1><p><em>${esc(n.date)}</em></p>${md(n.body).replace(/href="\//g, `href="${SITE}/`)}`;
  write(`notes/${n.slug}/index.html`, page({ path: `/notes/${n.slug}`, title: `${n.title} · ${PROFILE.login}`, description: n.summary, body, type: "article" }));
  urls.push({ path: `/notes/${n.slug}`, priority: "0.7", lastmod: n.date });
}
if (notes.length) {
  const body = `${nav}<h1>Notes</h1><ul>${notes.map((n) => `<li><a href="${SITE}/notes/${n.slug}">${esc(n.title)}</a> — ${esc(n.summary)}</li>`).join("")}</ul>`;
  write("notes/index.html", page({ path: "/notes", title: `Notes · ${PROFILE.login}`, description: "Technical deep dives on Rust, WebAssembly, security and developer tooling.", body }));
  urls.push({ path: "/notes", priority: "0.6" });
}

// ── 404 (SPA fallback: the app renders its own not-found page) ──
write("404.html", page({ path: "/404", title: `404 · ${PROFILE.login}`, description: DEFAULT_META.description }));

// ── sitemap ──
const today = new Date().toISOString().slice(0, 10);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${SITE}${u.path === "/" ? "/" : u.path}</loc><lastmod>${u.lastmod || today}</lastmod><priority>${u.priority}</priority></url>`)
      .join("\n") +
    `\n</urlset>\n`,
);

console.log(`prerender: ${PROJECTS.length} projects, ${notes.length} notes, sitemap with ${urls.length} urls`);
