# 任務：同步並優化網站技術文件 + 釋出 rov-firmware 倉庫

## 背景
- `secret/doc/*.md` 為權威來源（已更新，5/30–5/31），`content/docs/*.mdx` 為網站實際顯示內容（舊版，4/14）。
- 目標：以 secret/doc 為準更新 content/docs，並讓內容更淺顯易懂、更易讀。
- rov-firmware 倉庫已建立，需在 `/repos` 釋出網址（移除「隨專案進度釋出」模糊卡）。

## 待辦
- [x] 釋出 rov-firmware 倉庫（`lib/site.ts`：url + status=available）
- [x] 01 系統規格總覽：同步資料（升壓模組×2、重力平衡塊）+ 加導讀
- [x] 02 艇體結構與防水：補導讀 + Callout（感測孔禁封、氣壓測試）
- [x] 03 電力與硬體接線：同步 v2.7（GPIO 41-44 重配、MCP23017 懸空）+ 3 Callout
- [x] 04 通訊架構：同步 + 修 typo「空曠environments」+ 4 Callout
- [x] 05 影像與錄影系統：同步 + 參數表 30 列精簡為 13 列核心規格 + 修裸 `<`
- [x] 06 控制與導航：同步 v2.6（差速轉向、PID、自動導航）+ 6 Callout（子代理第一次撞 session 限制，重派成功）
- [x] 07 3D 列印規格：同步（補分區填充、修正 infill 15-20% Gyroid）+ 4 Callout
- [x] `npm run build` 通過（17/17、無 TS 錯誤）
- [x] 更新 CLAUDE.md / CONTEXT.md

## 撰寫規範（給所有文件統一）
- frontmatter：`title` / `description` / `order`（沿用現有值，標題格式「0X 名稱」）。
- 一律繁體中文（臺灣用語）。
- 保留來源所有規格、數據、表格，不可遺漏。
- 易讀化手法：每段開頭加一句白話導讀；關鍵警告/重點用 `<Callout type="warning|info|success|danger" title="...">`；冗長平鋪表格適度分組。
- 可用 MDX 元件：`Callout`（需 `import { Callout } from "@/components/docs/Callout";`），表格自動套 TableWrapper。
- 修正來源明顯錯字（如中英混雜）。
- 移除來源末尾的「*文件版本：vX*」改為更友善的結尾或刪除（網站不需版本號）。

## Review

- **做法**：以 `secret/doc/*.md`（權威、5/30–5/31 最新版）為準，分派 6 個子代理平行重寫 `content/docs/*.mdx`，主流程只做整合與驗證，保持 context 乾淨。
- **結果**：7 篇文件全部同步＋易讀化（每節白話導讀、關鍵警告改 `Callout`、精簡冗長表格、修中英混雜錯字、移除版本號頁尾）。`npm run build` 通過（EXIT=0、Compiled successfully）。
- **Callout 元件**：原專案沒有 `Callout` 元件、MDX 又用 `import` 導致首輪 build 掛掉（`Module not found`/`Callout is not defined`）。修法：新增 `components/docs/Callout.tsx`（純色提示框、無 lucide 圖示相依）、注入 docs 頁 `components` map、移除各 MDX 的 `import` 行。
- **倉庫**：`rov-firmware` 釋出（available + url），`/repos` 模糊遮罩自動消失。
- **變更檔**：`content/docs/01-07`、`lib/site.ts`、`CONTEXT.md`、`CLAUDE.md`、`tasks/`。未動 `secret/doc`（來源）。
- **教訓**：單一回合大量 / 過大的 Read 會被 harness 截斷（出現「（後略）」假頁尾）；大檔重寫交給子代理（獨立 context）最穩。子代理曾撞 session 限制 → 重派即可。
- **未做（非本次範圍）**：尚未 commit（等使用者指示）。

---

# 第二輪：倉庫收尾 + 文件導覽升級

## 待辦
- [x] 倉庫移除第四張 coming-soon 卡（rov-groundstation），grid 改 `lg:grid-cols-3`，留三張 available
- [x] 文件側邊欄依 frontmatter `category` 分組（系統總覽／硬體與機構／電子與軟體／製造與列印）
- [x] 右側「本頁目錄」TableOfContents（IntersectionObserver 捲動高亮）
- [x] 標題錨點 id（`lib/toc.ts` rehype 外掛，零相依）＋ hover # 連結
- [x] 頁尾上一篇/下一篇 DocPager
- [x] `lib/docs.ts` 加 `category` 與 `getAdjacentDocs`；layout 加寬 `max-w-7xl`
- [x] `npm run build` 通過（EXIT=0、型別/lint OK）
- [x] `npm start` runtime 驗證：heading `id` ↔ 目錄 `href` 一致、分組/pager 正確
- [x] 更新 CLAUDE.md / CONTEXT.md / todo

## Review
- **關鍵設計**：目錄與標題錨點 id 共用 `lib/toc.ts` 同一 slugger，且都按文件順序處理——`extractToc`（解析 Markdown）與 `rehypeHeadingIds`（走訪 hast）必然產生相同 id，避免「目錄連結點了跳不到」的經典錯位。
- **零新增相依**：自寫 slugify + 迷你 rehype 外掛（手動走訪 hast，不靠 unist-util-visit / github-slugger / rehype-slug），符合「新增依賴前先評估」原則，也避開 offline 安裝風險。
- **分組不打散順序**：`category` 刻意讓同類連號（01／02-03／04-06／07），使側邊欄順序 == 檔名順序 == 上一篇/下一篇順序，三者一致不混亂。
- **驗證**：build EXIT=0；另起 `npm start` curl `/docs/01`、`/docs/03`，確認 `id="任務定義"` 與 `href="#任務定義"` 對得上、四組分類與 pager（03→prev 02／next 04）皆正確。
- **教訓**：本環境 `Read` 對含中文的大檔常出現假「（後略）」截斷，`package.json` 也被讀成假毀損——驗證檔案內容要改用 `node -e`／`sed`／`grep` 等實際指令，不能只信 Read 的畫面。
