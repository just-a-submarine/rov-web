# 只是一台潛水艇 — 網站主計畫

## 動態更新條款

> **使用者的修改要求永遠優先於本文件。**
>
> 當使用者提出任何修改：
>
> 1. **先實現要求**（不得以文件為由延後）
> 2. **完成後更新本文件與 `secret/plan/*.md`**，保持文件與實際狀態同步
>
> 文件是「記錄現狀」，不是「限制修改」。

AI Agent 啟動後先讀本文件（輕量索引），需要某主題細節時再讀 `secret/plan/` 對應檔案。

---

## 專案目標

- Vercel 部署的純前端網站，AI Agent 可持續維護
- 電子學期中 5 分鐘視覺化報告（設計概念，實物期末展示）
- 長期收納：技術文件、期末報告、GitHub 倉庫索引

---

## 技術棧

| 層面      | 選擇                                    |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router) + TypeScript    |
| 樣式      | Tailwind CSS v4（CSS 變數 token）       |
| 動畫      | Framer Motion + tsparticles             |
| 3D 模型   | @react-three/fiber + @react-three/drei  |
| 文件      | MDX (next-mdx-remote) + gray-matter     |
| QR Code   | qrcode.react（讀 window.location.href） |
| AI 聊天   | OpenRouter（google/gemini-3-flash-preview）+ react-markdown |
| 部署      | Vercel                                  |

---

## 資訊架構

```
/                  首頁（Landing）
/midterm           期中報告（8 個 section）
/final             期末報告（Coming Soon）
/docs              技術文件（MDX + 側邊欄）
/docs/[slug]       各篇規格書
/repos             GitHub 倉庫索引
```

首頁：乾淨導覽頁，4 顆大按鈕 + 粒子背景
子頁：共用 TopNav（上方橫條，含 Logo + QR Code）

---

## 關鍵檔案速查（最常被改動）

| 改動目的              | 檔案                                                            |
| --------------------- | --------------------------------------------------------------- |
| 站名 / GitHub org URL | `lib/site.ts`                                                 |
| Logo SVG              | `components/brand/Logo.tsx`                                   |
| 首頁 4 顆按鈕         | `components/home/NavGrid.tsx`                                 |
| 導覽列                | `components/nav/TopNav.tsx`                                   |
| 期中 ① 封面          | `app/(with-nav)/midterm/page.tsx`                             |
| 期中 ② 任務          | `components/midterm/MissionScene.tsx`                         |
| 期中 ③ 架構圖        | `components/midterm/ArchitectureMap.tsx`                      |
| 期中 ④ 艇體圖        | `components/midterm/HullDiagram.tsx`                          |
| 期中 ⑤ FreeCAD + 3D  | `components/midterm/FreeCADShowcase.tsx` + `HullViewer.tsx` |
| 期中 ⑥ 感測器        | `components/midterm/SensorsSection.tsx`                       |
| 期中 ⑦ 現況 + 實物照 | `components/midterm/CurrentState.tsx`                         |
| 期中 ⑧ Roadmap       | `components/midterm/Roadmap.tsx`                              |
| 技術文件內容          | `content/docs/*.mdx`                                          |
| 文件側邊欄分組        | `components/docs/Sidebar.tsx`（讀 frontmatter `category`）   |
| 本頁目錄 / 標題錨點   | `components/docs/TableOfContents.tsx` + `lib/toc.ts`         |
| 文件上一篇/下一篇     | `components/docs/DocPager.tsx`                                |
| 文件提示框            | `components/docs/Callout.tsx`                                 |
| 倉庫清單 + URL        | `lib/site.ts` → `repos` 陣列                               |
| 顏色 / 字體 token     | `app/globals.css` → `:root` 與 `@theme inline`           |
| AI 聊天面板           | `components/docs/AIChat/`（AIChatWidget、ChatPanel、useChat…） |
| AI API 代理路由       | `app/api/chat/route.ts`                                         |
| 滑鼠軌跡特效          | `components/effects/CursorTrail.tsx`                            |

---

## 環境變數

| 變數名稱              | 說明                                          | 必填 |
| --------------------- | --------------------------------------------- | ---- |
| `OPENROUTER_API_KEY`  | OpenRouter API 金鑰，供 `/api/chat` 呼叫 AI  | ✅   |

**本地開發**：寫入 `.env.local`（已加入 `.gitignore`，不進版本控制）
**Vercel 部署**：Vercel Dashboard → Project → Settings → Environment Variables → 新增 `OPENROUTER_API_KEY`

---

## 視覺系統

深色主題（深海夜藍）。詳見 `doc/plan/01-visual-system.md`。

主色：Accent Cyan `#22D3EE`、Accent Violet `#A78BFA`

---

## GitHub 倉庫

GitHub Organization（預設名 `just-a-submarine`，改在 `lib/site.ts`）。
目前已釋出 `rov-web`、`3D-printing`、`rov-firmware` 三個倉庫；`rov-groundstation` 韌體尚未建立，已不列入清單。

倉庫卡片在 `/repos` 頁面，`lib/site.ts` 的 `repos` 陣列管理（`status:"coming-soon"` 會顯示模糊「隨專案進度釋出」卡）。

---

## 已上傳素材

| 檔案         | 路徑                           | 用途                               |
| ------------ | ------------------------------ | ---------------------------------- |
| 3D列印01.jpg | `public/images/3D列印01.jpg` | FreeCADShowcase 列印過程照片（左） |
| 3D列印02.jpg | `public/images/3D列印02.jpg` | FreeCADShowcase 列印過程照片（右） |
| 實物照片.jpg | `public/images/實物照片.jpg` | CurrentState 外殼展示實物照片      |

## 素材待補

| 項目         | 說明                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------- |
| ROV STL 模型 | 從 `secret/3D列印/` 匯出 STL 後複製到 `public/models/ROV_Hull.stl`（建好後 3D 互動即生效） |
| QR 正式網址  | 部署後自動從 `window.location.href` 讀取，不需改程式碼                                       |

---

## 細節文件（按需讀取）

| 主題                             | 檔案                                  |
| -------------------------------- | ------------------------------------- |
| 視覺 token / 字體 / 動畫選型     | `secret/plan/01-visual-system.md`      |
| 期中 8 段分鏡完整腳本            | `secret/plan/02-midterm-storyboard.md` |
| FreeDomain + Vercel DNS 綁定步驟 | `secret/plan/03-freedomain-vercel.md`  |
| GitHub org 建立與 repo 規劃      | `secret/plan/05-github-org-setup.md`   |

> `secret/doc/` 與 `secret/3D列印/` 資料夾已 gitignore，不進版本控制。
> `secret/doc/*.md` 是技術文件的**權威來源**（最新規格）；網站顯示的是 `content/docs/*.mdx`（由來源同步並加 frontmatter 與易讀化）。改文件時：先改 `secret/doc`，再同步到對應 `content/docs`。
> 文件可用 `<Callout type="info|warning|success|danger" title="…">` 提示框（元件在 `components/docs/Callout.tsx`，已注入 `app/(with-nav)/docs/[slug]/page.tsx` 的 MDX `components`）；**MDX 內勿用 `import`**（remote MDX 無法解析路徑），直接用標籤即可。MDX 雷點：prose 中裸 `<數字`、裸 `{}` 會 build 失敗，改寫成「低於/小於」或放進程式碼區塊。
> 3D 列印規格已整理並放入 `content/docs/07-3d-print-spec.mdx`。
> **文件導覽系統**：側邊欄依 frontmatter `category` 分組（系統總覽／硬體與機構／電子與軟體／製造與列印）——**新增文件務必補 `category`**，否則歸入「其他」組。右側「本頁目錄」與標題錨點 id 都由 `lib/toc.ts` 產生：`extractToc`（給目錄）與 `rehypeHeadingIds`（給渲染後標題加 id）共用同一個 slugger，故 id 必然一致；改動其一就要兩邊一起確認。頁尾上一篇/下一篇由 `DocPager` 依檔名排序自動產生（與側邊欄組順序一致，因 `category` 不打散檔名順序）。

---

## AI 編輯快速指南

| 改動目的              | 目標檔案                                              |
| --------------------- | ----------------------------------------------------- |
| 站名 / GitHub org URL | `lib/site.ts`                                       |
| 個人 GitHub 連結      | `lib/site.ts` → `githubPersonalUrl`              |
| 首頁 4 顆按鈕         | `components/home/NavGrid.tsx`                       |
| 導覽列連結 / 順序     | `components/nav/TopNav.tsx`                         |
| QR Code 元件          | `components/nav/QRCorner.tsx`                       |
| 期中封面文字          | `app/(with-nav)/midterm/page.tsx`                   |
| 期中任務數據          | `components/midterm/MissionScene.tsx`               |
| 期中通訊架構圖        | `components/midterm/ArchitectureMap.tsx`            |
| 期中 3D 模型          | `components/midterm/HullViewer.tsx`                 |
| 期中進度里程碑        | `components/midterm/CurrentState.tsx`               |
| 技術文件內容          | `content/docs/*.mdx`                                |
| 文件分類分組          | frontmatter `category` + `components/docs/Sidebar.tsx` |
| 本頁目錄 / 錨點邏輯   | `lib/toc.ts`                                        |
| 上一篇/下一篇         | `components/docs/DocPager.tsx`                      |
| 倉庫清單              | `lib/site.ts` → `repos` 陣列                     |
| 顏色 / 字體 token     | `app/globals.css` → `:root` 與 `@theme inline` |
| Markdown 樣式         | `app/globals.css` → `.mdx-content`               |
| AI 聊天 Markdown 樣式 | `app/globals.css` → `.prose-chat`                |
| AI 聊天面板           | `components/docs/AIChat/AIChatWidget.tsx`         |
| AI API 代理           | `app/api/chat/route.ts`（改模型在此）             |
| 滑鼠 / 觸控特效       | `components/effects/CursorTrail.tsx`              |

---

## 部署驗證清單

- [ ] `npm run build` 通過、無 TypeScript 錯誤
- [ ] 首頁粒子背景 + QR Code（右下角）正常
- [ ] 首頁 GitHub 按鈕連結到 rov-web repo
- [ ] `/midterm` 8 個 section 滾動正常
- [ ] 3D 模型（`HullViewer`）可拖曳旋轉、正確方向
- [ ] QR Code 各頁顯示對應頁面 URL
- [ ] `/docs` 預設跳第一篇，Markdown 表格正確渲染
- [ ] `/docs` 側邊欄依分類分組（系統總覽／硬體與機構／電子與軟體／製造與列印）
- [ ] `/docs/[slug]` 右側「本頁目錄」隨捲動高亮、點擊跳對應段落；標題 hover 顯示 # 錨點
- [ ] `/docs/[slug]` 頁尾上一篇/下一篇連結正確
- [ ] TopNav 導覽順序：期中 → 期末 → 文件 → 倉庫
- [ ] `secret/doc/` 與 `secret/3D列印/` 未被 git 追蹤
- [ ] `/docs/[slug]` 右下角 AI FAB 出現，點擊可開啟聊天面板
- [ ] AI 聊天能正確回答文件相關問題（需 `OPENROUTER_API_KEY`）
- [ ] 滑鼠移動 / 手指拖動產生青色軌跡，點擊有漣漪動畫

---

*最後更新：2026-05-31*
