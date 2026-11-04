// Keeps <title>, description, canonical and social tags in sync with the
// current route. The prerender script writes the same values into each page's
// static HTML, so crawlers that don't run JS still see them.

const SITE = "https://fanaperana.github.io/portfolio";

export const DEFAULT_META = {
  title: "Fanaperana — Software Engineer · Rust · TypeScript · Agentic AI",
  description:
    "Software engineer building developer tools, desktop apps, web products and AI agents in Rust and TypeScript. Available for full-time roles and freelance projects.",
};

function set(selector: string, attr: string, value: string) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

export function setMeta(m: { title?: string; description?: string; path?: string } = {}) {
  const title = m.title ?? DEFAULT_META.title;
  const description = m.description ?? DEFAULT_META.description;
  const url = SITE + (m.path && m.path !== "/" ? m.path : "/");
  document.title = title;
  set('meta[name="description"]', "content", description);
  set('link[rel="canonical"]', "href", url);
  set('meta[property="og:title"]', "content", title);
  set('meta[property="og:description"]', "content", description);
  set('meta[property="og:url"]', "content", url);
  set('meta[name="twitter:title"]', "content", title);
  set('meta[name="twitter:description"]', "content", description);
}
