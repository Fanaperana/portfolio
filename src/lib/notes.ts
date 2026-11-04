// Notes = Markdown files in src/content/notes/<slug>.md with a small
// frontmatter block:
//
// ---
// title: How PSKey's rolling PIN challenge works
// date: 2026-11-04
// summary: One or two sentences for cards and search results.
// tags: security, rust, tauri
// project: pskey            (optional — links the note to a project page)
// draft: true               (optional — hidden from the site)
// ---

export type Note = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  project?: string;
  body: string; // markdown
  minutes: number;
};

const files = import.meta.glob("/src/content/notes/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export function parseNote(path: string, raw: string): Note & { draft: boolean } {
  const slug = path.split("/").pop()!.replace(/\.md$/, "");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta: Record<string, string> = {};
  const body = m ? m[2] : raw;
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const words = body.split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    summary: meta.summary ?? "",
    tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    project: meta.project || undefined,
    draft: meta.draft === "true",
    body,
    minutes: Math.max(1, Math.round(words / 220)),
  };
}

export const NOTES: Note[] = Object.entries(files)
  .map(([p, raw]) => parseNote(p, raw))
  .filter((n) => !n.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
