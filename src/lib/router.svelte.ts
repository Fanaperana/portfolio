// Tiny path router. The site is a static SPA on GitHub Pages; the build step
// (scripts/prerender.mjs) writes an index.html for every route below so each
// page has its own URL, title and meta for search engines and link previews.

export type Route =
  | { name: "home" }
  | { name: "project"; slug: string }
  | { name: "notes" }
  | { name: "note"; slug: string }
  | { name: "notfound" };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, ""); // "/portfolio" or ""

/** Build an in-site URL: href("/projects/semtree") -> "/portfolio/projects/semtree" */
export function href(path: string): string {
  return BASE + (path.startsWith("/") ? path : "/" + path);
}

function parse(pathname: string): Route {
  let p = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  p = p.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";
  if (p === "/") return { name: "home" };
  let m = p.match(/^\/projects\/([^/]+)$/);
  if (m) return { name: "project", slug: decodeURIComponent(m[1]) };
  if (p === "/notes") return { name: "notes" };
  m = p.match(/^\/notes\/([^/]+)$/);
  if (m) return { name: "note", slug: decodeURIComponent(m[1]) };
  return { name: "notfound" };
}

class Router {
  route = $state<Route>(parse(location.pathname));
}

export const router = new Router();

function scrollToHash(hash: string) {
  if (!hash) {
    window.scrollTo({ top: 0 });
    return;
  }
  // Wait a frame so the new page has rendered.
  requestAnimationFrame(() => {
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0 });
  });
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  const url = new URL(to, location.href);
  const samePage = url.pathname === location.pathname;
  if (opts.replace) history.replaceState(null, "", url);
  else history.pushState(null, "", url);
  router.route = parse(url.pathname);
  if (url.hash.startsWith("#/")) {
    // Hash-driven overlay (résumé): don't scroll, just notify listeners.
    if (!samePage) window.scrollTo({ top: 0 });
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    scrollToHash(url.hash);
  }
}

/** Call once at startup: intercepts in-site link clicks and back/forward. */
export function startRouter() {
  // Legacy share links: #/p/<slug> -> /projects/<slug>
  const legacy = location.hash.match(/^#\/p\/([^/?&]+)/);
  if (legacy) navigate(href(`/projects/${legacy[1]}`), { replace: true });

  // GitHub Pages 404 fallback stores the original path in ?p=
  const redirected = new URLSearchParams(location.search).get("p");
  if (redirected) navigate(href(redirected), { replace: true });

  window.addEventListener("popstate", () => {
    router.route = parse(location.pathname);
  });

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.("a");
    if (!a || a.target || a.hasAttribute("download")) return;
    const raw = a.getAttribute("href");
    if (!raw || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (BASE && !url.pathname.startsWith(BASE)) return;
    if (/\.(pdf|png|jpe?g|svg|xml|txt)$/i.test(url.pathname)) return;
    // Pure in-page hash link on the current page: let the browser handle it.
    if (url.pathname === location.pathname && url.hash && !url.hash.startsWith("#/")) return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });
}
