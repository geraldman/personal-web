import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { BlogCategory, BlogPost } from "@/types";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");
const META_REGEX = /^<!--\s*meta\s*([\s\S]*?)\s*-->/;
const H2_ANCHOR_REGEX = /<a id="([^"]+)"><\/a>\s*\r?\n##\s+(.+)/g;
const H2_REGEX = /<h2\s+id="([^"]+)">([^<]+)<\/h2>/g;

type BlogFrontmatter = Omit<BlogPost, "slug" | "toc">;

type TocItem = { id: string; label: string };

function parseFrontmatter(source: string, slug: string): BlogFrontmatter {
  const match = source.match(META_REGEX);

  if (!match) {
    throw new Error(`Missing meta block in ${slug}.md`);
  }

  const raw = match[1].trim();
  const meta = JSON.parse(raw) as BlogFrontmatter;

  if (!meta.title || !meta.excerpt || !meta.date || !meta.category || !meta.readTime) {
    throw new Error(`Invalid meta block in ${slug}.md`);
  }

  if (!isBlogCategory(meta.category)) {
    throw new Error(`Invalid blog category in ${slug}.md`);
  }

  return meta;
}

function extractToc(source: string): TocItem[] {
  const items: TocItem[] = [];

  const anchorMatches = Array.from(source.matchAll(H2_ANCHOR_REGEX));
  if (anchorMatches.length > 0) {
    for (const match of anchorMatches) {
      const [, id, label] = match;
      const cleanedLabel = label.replace(/^\d+\.\s*/, "");

      items.push({ id, label: cleanedLabel });
    }

    return items;
  }

  for (const match of source.matchAll(H2_REGEX)) {
    const [, id, label] = match;
    const cleanedLabel = label.replace(/^\d+\.\s*/, "");

    items.push({ id, label: cleanedLabel });
  }

  return items;
}

const loadPosts = cache(async (): Promise<BlogPost[]> => {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.endsWith(".md"));

  const posts = await Promise.all(
    files.map(async (fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const filePath = path.join(BLOG_DIR, fileName);
      const content = await fs.readFile(filePath, "utf8");
      const meta = parseFrontmatter(content, slug);
      const toc = extractToc(content);

      return {
        slug,
        ...meta,
        toc: toc.length > 0 ? toc : undefined,
      } satisfies BlogPost;
    }),
  );

  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export async function getBlogPosts(): Promise<BlogPost[]> {
  return loadPosts();
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const posts = await loadPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export function isBlogCategory(value: string): value is BlogCategory {
  return value === "security" || value === "ctf" || value === "template";
}
