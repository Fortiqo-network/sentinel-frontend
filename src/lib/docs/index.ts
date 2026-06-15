/**
 * Docs content loader.
 *
 * sentinel-docs is the markdown source of truth; this module reads it at build
 * time (every docs page is statically generated) so no markdown is duplicated
 * into the frontend and no runtime filesystem access is needed. The docs repo
 * location is configurable via SENTINEL_DOCS_PATH and defaults to the monorepo
 * sibling `../sentinel-docs`.
 */

import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import GithubSlugger from "github-slugger";

export interface NavGroup {
  group: string;
  pages?: string[];
  openapi?: string;
}

export interface DocsNav {
  name: string;
  basePath: string;
  theme?: { primary?: string };
  groups: NavGroup[];
  openapi?: string;
  anchors?: Array<{ label: string; href: string; icon?: string }>;
  footer?: { socials?: Record<string, string> };
}

export interface NavLink {
  title: string;
  href: string;
  file: string;
}

export interface NavSection {
  group: string;
  links: NavLink[];
}

export interface TocEntry {
  depth: 2 | 3;
  text: string;
  id: string;
}

export interface LoadedDoc {
  source: string;
  title: string;
  description: string;
  toc: TocEntry[];
}

const DOCS_ROOT = process.env.SENTINEL_DOCS_PATH
  ? path.resolve(process.env.SENTINEL_DOCS_PATH)
  : path.resolve(process.cwd(), "..", "sentinel-docs");

const EXTENSIONS = [".mdx", ".md"] as const;

/** Read and parse the navigation manifest. */
export function loadNav(): DocsNav {
  const raw = fs.readFileSync(path.join(DOCS_ROOT, "nav.json"), "utf8");
  return JSON.parse(raw) as DocsNav;
}

/** Map a docs file path (nav slug) to its public `/docs/...` href. */
export function fileToHref(file: string): string {
  if (file === "index") return "/docs";
  const rel = file.startsWith("docs/") ? file.slice("docs/".length) : file;
  return `/docs/${rel}`;
}

function resolveFile(candidate: string): string | null {
  for (const ext of EXTENSIONS) {
    const full = path.join(DOCS_ROOT, candidate + ext);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

/** Resolve a URL slug array to an on-disk markdown file, or null if missing. */
export function slugToFilePath(slug: string[]): string | null {
  if (slug.length === 0) return resolveFile("index");
  const joined = slug.join("/");
  return resolveFile(joined) ?? resolveFile(`docs/${joined}`);
}

function humanize(file: string): string {
  const last = file.split("/").pop() ?? file;
  return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fileTitle(file: string): string {
  const full = resolveFile(file);
  if (full) {
    const parsed = matter(fs.readFileSync(full, "utf8"));
    const title = parsed.data.title;
    if (typeof title === "string" && title.length > 0) return title;
  }
  return humanize(file);
}

/** Build the sidebar sections with resolved page titles and hrefs. */
export function loadNavSections(): NavSection[] {
  const nav = loadNav();
  return nav.groups
    .filter((g) => g.pages && g.pages.length > 0)
    .map((g) => ({
      group: g.group,
      links: (g.pages ?? []).map((file) => ({
        title: fileTitle(file),
        href: fileToHref(file),
        file,
      })),
    }));
}

/** Flat, ordered list of every doc link — for prev/next and search. */
export function flatNavLinks(): NavLink[] {
  return loadNavSections().flatMap((s) => s.links);
}

/** Static params for every doc page declared in nav.json. */
export function allDocParams(): Array<{ slug: string[] }> {
  const nav = loadNav();
  const params: Array<{ slug: string[] }> = [];
  for (const group of nav.groups) {
    for (const file of group.pages ?? []) {
      if (file === "index") {
        params.push({ slug: [] });
        continue;
      }
      const rel = file.startsWith("docs/") ? file.slice("docs/".length) : file;
      params.push({ slug: rel.split("/") });
    }
  }
  return params;
}

function extractToc(body: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const entries: TocEntry[] = [];
  let inFence = false;
  for (const line of body.split("\n")) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const hashes = match[1];
    const text = match[2];
    if (!hashes || !text) continue;
    entries.push({
      depth: hashes.length === 2 ? 2 : 3,
      text: text.replace(/[*`_]/g, ""),
      id: slugger.slug(text),
    });
  }
  return entries;
}

/** Load a single doc by slug: raw MDX source, frontmatter, and a TOC. */
export function loadDoc(slug: string[]): LoadedDoc | null {
  const file = slugToFilePath(slug);
  if (!file) return null;
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const title = typeof parsed.data.title === "string" ? parsed.data.title : humanize(slug.join("/") || "index");
  const description = typeof parsed.data.description === "string" ? parsed.data.description : "";
  return { source: parsed.content, title, description, toc: extractToc(parsed.content) };
}

/** Previous/next links for a given href, in nav order. */
export function pagerFor(href: string): { prev: NavLink | null; next: NavLink | null } {
  const links = flatNavLinks();
  const idx = links.findIndex((l) => l.href === href);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? (links[idx - 1] ?? null) : null,
    next: idx < links.length - 1 ? (links[idx + 1] ?? null) : null,
  };
}
