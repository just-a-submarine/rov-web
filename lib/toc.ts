// 文件「本頁目錄」與標題錨點共用的核心邏輯。
// 關鍵：extractToc（給右側目錄）與 rehypeHeadingIds（給渲染後的 <h2>/<h3> 加 id）
// 共用同一個 slugify + 去重序列，且都按文件順序處理，因此產生的 id 必然一致。

export interface TocItem {
  depth: number; // 2 = h2, 3 = h3
  text: string;
  id: string;
}

/** 將標題文字轉為錨點 id（保留中英數字，其餘符號去除，空白轉連字號）。 */
function slugifyBase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 建立帶去重狀態的 slugger：重複的 id 會加上 -1、-2…後綴。 */
function createSlugger() {
  const seen = new Map<string, number>();
  return (text: string): string => {
    const base = slugifyBase(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

/** 取出 hast 節點的純文字內容。 */
function nodeText(node: { type?: string; value?: string; children?: unknown[] }): string {
  if (node.type === "text") return node.value ?? "";
  if (Array.isArray(node.children)) {
    return node.children
      .map((c) => nodeText(c as Parameters<typeof nodeText>[0]))
      .join("");
  }
  return "";
}

/**
 * 本地 rehype 外掛（零相依）：為渲染後的 h2~h4 補上 id。
 * 與 extractToc 用相同 slugger、相同走訪順序，保證 id 對得上。
 */
export function rehypeHeadingIds() {
  return (tree: unknown) => {
    const slug = createSlugger();
    const walk = (node: {
      type?: string;
      tagName?: string;
      properties?: Record<string, unknown>;
      children?: unknown[];
    }) => {
      if (
        node.type === "element" &&
        typeof node.tagName === "string" &&
        /^h[2-4]$/.test(node.tagName)
      ) {
        node.properties = node.properties ?? {};
        if (!node.properties.id) {
          node.properties.id = slug(nodeText(node));
        }
      }
      if (Array.isArray(node.children)) {
        node.children.forEach((c) =>
          walk(c as Parameters<typeof walk>[0])
        );
      }
    };
    walk(tree as Parameters<typeof walk>[0]);
  };
}

/**
 * 從 Markdown 原文抽出 h2/h3 標題清單供右側目錄使用。
 * 會跳過 ``` 圍籬程式碼區塊內的偽標題。
 */
export function extractToc(markdown: string): TocItem[] {
  const slug = createSlugger();
  const items: TocItem[] = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{2,3})\s+(.*\S)\s*$/.exec(line);
    if (!m) continue;

    const depth = m[1].length;
    const text = m[2].replace(/[`*_]/g, "").trim();
    items.push({ depth, text, id: slug(text) });
  }

  return items;
}
