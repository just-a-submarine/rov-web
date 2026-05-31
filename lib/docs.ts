import fs from "fs";
import path from "path";
import matter from "gray-matter";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocMeta {
  slug: string;
  title: string;
  description?: string;
  order: number;
  category?: string;
}

export interface DocContent extends DocMeta {
  content: string;
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

export function getAllDocsMeta(): DocMeta[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .sort();

  return files.map((filename, idx) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, filename), "utf-8");
    const { data } = matter(raw);
    return {
      slug: getSlugFromFilename(filename),
      title: data.title ?? filename,
      description: data.description,
      order: data.order ?? idx,
      category: data.category,
    };
  });
}

/** 取得指定文件在排序中的前一篇 / 後一篇，供頁尾導覽使用。 */
export function getAdjacentDocs(slug: string): {
  prev: DocMeta | null;
  next: DocMeta | null;
} {
  const all = getAllDocsMeta();
  const idx = all.findIndex((m) => m.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export function getDocContent(slug: string): DocContent | null {
  const candidates = [
    path.join(DOCS_DIR, `${slug}.mdx`),
    path.join(DOCS_DIR, `${slug}.md`),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    const allMeta = getAllDocsMeta();
    const idx = allMeta.findIndex((m) => m.slug === slug);
    return {
      slug,
      title: data.title ?? slug,
      description: data.description,
      order: data.order ?? idx,
      content,
    };
  }
  return null;
}
