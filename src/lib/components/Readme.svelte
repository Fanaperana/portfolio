<!--
  Renders a project's README (fetched at build time, private repos included).
  Relative links and images are rewritten to point at GitHub.
-->
<script lang="ts">
  import { Marked } from "marked";
  import DOMPurify from "dompurify";
  import { PROFILE, type Project } from "$lib/data/projects";

  let { project }: { project: Project } = $props();

  const marked = new Marked({ gfm: true, breaks: false });

  function rewrite(html: string, slug: string): string {
    const doc = new DOMParser().parseFromString(html, "text/html");
    doc.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) return;
      if (!/^https?:\/\//.test(href) && !href.startsWith("mailto:")) {
        a.setAttribute(
          "href",
          `https://github.com/${PROFILE.login}/${slug}/blob/HEAD/${href.replace(/^\.?\//, "")}`,
        );
      }
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noreferrer");
    });
    doc.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      img.setAttribute("loading", "lazy");
      if (!src || /^https?:\/\//.test(src) || src.startsWith("data:")) return;
      img.setAttribute(
        "src",
        `https://raw.githubusercontent.com/${PROFILE.login}/${slug}/HEAD/${src.replace(/^\.?\//, "")}`,
      );
    });
    return doc.body.innerHTML;
  }

  // READMEs are a large payload, so they load in their own chunk.
  let content = $state("");
  let loading = $state(true);
  $effect(() => {
    const slug = project.slug;
    loading = true;
    import("$lib/data/github.readmes.generated").then(({ GH_READMES }) => {
      const raw = GH_READMES[slug];
      const html = raw ? (marked.parse(raw, { async: false }) as string) : "";
      content = html ? rewrite(DOMPurify.sanitize(html, { ADD_ATTR: ["target", "rel"] }), slug) : "";
      loading = false;
    });
  });
</script>

<div class="readme-body">
  {#if loading}
    <p class="font-mono text-sm text-muted-foreground"><span class="text-primary">$</span> cat README.md …</p>
  {:else if content}
    {@html content}
  {:else}
    <p class="font-mono text-sm text-muted-foreground">
      <span class="text-primary">$</span> cat README.md — no README published for this project yet.
    </p>
    <p class="mt-3 text-foreground">{project.description}</p>
  {/if}
</div>
