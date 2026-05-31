# CONTEXT — 開發交接

> 給下一個 AI Agent 的精簡交接。專案總覽看 `CLAUDE.md`，主題細節看 `secret/plan/*.md`。

## 專案一句話
Vercel 部署的純前端網站（Next.js 16 + Tailwind v4），用於電子學報告與技術文件收納。

## 目前狀態（2026-05-31）
- 首頁 / 期中 / 期末 / 文件 / 倉庫 五區塊完成，`npm run build` 通過（17 頁、無 TS 錯誤）。
- AI 聊天 widget（OpenRouter 代理，`/api/chat`）、滑鼠軌跡特效、3D 模型（HullViewer）皆已上線。
- **技術文件（7 篇）已依 `secret/doc/*.md` 最新版同步重寫並易讀化**：每節加白話導讀、關鍵警告改用 `Callout` 提示框、精簡冗長表格、修中英混雜錯字、移除版本號頁尾。
- **倉庫頁定案三張卡**：`rov-web`、`3D-printing`、`rov-firmware`（皆 `available`）；移除 `rov-groundstation`（原 coming-soon 模糊卡），grid 改 `lg:grid-cols-3`。
- 本次新增 `components/docs/Callout.tsx`（純色提示框、無圖示相依），並接進 docs 頁的 MDX `components`。
- **文件導覽全面升級**：側邊欄依 frontmatter `category` 分四組；右側「本頁目錄」(`TableOfContents`，IntersectionObserver 捲動高亮)；標題錨點 id（`lib/toc.ts` 的 `rehypeHeadingIds`）；頁尾上一篇/下一篇（`DocPager`）。目錄與錨點 id 共用 `lib/toc.ts` 同一 slugger，已 runtime 驗證 `href="#…"` 與 `id="…"` 完全一致。

## 關鍵約定（容易踩坑）
1. **文件來源關係**：權威來源 `secret/doc/*.md`（gitignore）→ 網站 `content/docs/*.mdx`。改文件先改來源再同步。
2. **MDX 提示框**：用 `<Callout type="info|warning|success|danger" title="…">…</Callout>`。元件已在 `app/(with-nav)/docs/[slug]/page.tsx` 的 `components` map 注入，**MDX 內不要寫 `import`**（remote MDX 解析不了路徑，會 `Module not found`）。
3. **MDX build 雷點**：prose（非程式碼）中裸 `<數字`、裸 `{}` 會被當 JSX/JS → build 失敗。改寫成「低於/小於」、用 `&lt;`，或包進 ``` 程式碼區塊。
4. **倉庫清單**：`lib/site.ts` 的 `repos` 陣列；`status:"coming-soon"` 顯示「隨專案進度釋出」模糊卡，改 `available`＋填 `url` 即釋出。新增卡片時記得同步 `/repos` 的 grid 欄數。
5. **文件導覽**：新增 `content/docs/*.mdx` 一定要在 frontmatter 補 `category`（否則歸「其他」組）。本頁目錄（右側）與標題錨點 id 都源自 `lib/toc.ts`：`extractToc` 與 `rehypeHeadingIds` 共用 slugger，改一邊要同步另一邊。上一篇/下一篇依檔名排序，故 `category` 不可打散檔名順序（同類要連號）。
5. **驗證**：每次改完跑 `npm run build`。本環境曾出現「指令輸出延遲批次回傳」與「大檔 Read 被截斷（出現假『（後略）』頁尾）」，大檔重寫建議交給子代理（獨立 context）。

## 本次變更檔
- 文件同步＋易讀化：`content/docs/01-07`（並各補 frontmatter `category`）、`components/docs/Callout.tsx`（新）。
- 文件導覽升級：`lib/toc.ts`（新）、`components/docs/TableOfContents.tsx`（新）、`components/docs/DocPager.tsx`（新）、`components/docs/Sidebar.tsx`（分組）、`lib/docs.ts`（`category` + `getAdjacentDocs`）、`app/(with-nav)/docs/[slug]/page.tsx`（錨點/目錄/pager）、`app/(with-nav)/docs/layout.tsx`（`max-w-7xl`）、`app/globals.css`（錨點/scroll-margin/smooth-scroll）。
- 倉庫：`lib/site.ts`（移除 rov-groundstation）、`app/(with-nav)/repos/page.tsx`（grid-cols-3）。
- 文件維護：`CLAUDE.md`、`CONTEXT.md`、`tasks/`。

未動 `secret/doc` 來源。`npm run build` 通過（EXIT=0），並以 `npm start` runtime 驗證導覽功能。尚未 commit（等使用者指示）。
