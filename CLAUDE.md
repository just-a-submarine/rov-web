# 只是一台潛水艇 — 網站主計畫

## 動態更新條款

> **使用者的修改要求永遠優先於本文件。**
>
> 當使用者提出任何修改：
>
> 1. **先實現要求**（不得以文件為由延後）
> 2. **完成後更新本文件與根目錄 `CONTEXT.md`**，保持文件與實際狀態同步
>
> 文件是「記錄現狀」，不是「限制修改」。

**專案管理採預設方式**：總覽看本文件；開發交接背景看根目錄 `CONTEXT.md`；任務規劃與回顧寫 `tasks/todo.md`、教訓寫 `tasks/lessons.md`。技術文件權威來源在 `secret/文件/`（gitignore）。本專案不再使用自訂的 `secret/plan/` 計畫檔。

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
/final             期末報告（封面[炫技動畫背景] → 核心功能[模擬器＋文件 AI 助手] → 4 張卡關→破關全頁故事 → 防水 → AI 代理 → 媒體牆 → 離題 Computex）
/simulator         潛水艇模擬器（iframe 載入 public/sim 的真實儀表板，離線假潛艇）
/docs              技術文件（MDX + 側邊欄）
/docs/[slug]       各篇規格書
/repos             GitHub 倉庫索引
```

首頁：乾淨導覽頁，5 顆按鈕（含整排寬的「潛水艇模擬器」）+ 粒子背景 + 指向右下角 QR 的掃描提示（`QRScanHint`，往下滑收起）
子頁：共用 TopNav（上方橫條，含 Logo + QR Code）；`/simulator` 例外，走頂層路由、自帶纖細返回列（不套 with-nav 浮層，避免 QR 蓋住儀表板控制）

---

## 關鍵檔案速查（最常被改動）

| 改動目的              | 檔案                                                            |
| --------------------- | --------------------------------------------------------------- |
| 站名 / GitHub org URL | `lib/site.ts`                                                 |
| Logo SVG              | `components/brand/Logo.tsx`                                   |
| 首頁 5 顆按鈕         | `components/home/NavGrid.tsx`（`wide` 卡＝整排寬的模擬器）   |
| 導覽列                | `components/nav/TopNav.tsx`                                   |
| 期末報告（組裝頁）    | `app/(with-nav)/final/page.tsx` + `components/final/*`        |
| 期末 Debug 故事（全頁）| `components/final/DebugStories.tsx`（4 張，各自 `SlideSection`；訊號對比用 `MiniCharts` 的 `SignalBars`，無 dBm 數字）|
| 期末 防水/AI代理/離題 | `components/final/WaterproofSection.tsx`、`AIAgentSection.tsx`（3 迷因+`/repos` CTA）、`OffTopicComputex.tsx` |
| 期末 封面/核心/媒體   | `components/final/FinalIntro.tsx`（封面內容，主標「只是一台潛水艇」）＋`FinalCoverFX.tsx`（封面炫技背景）、`CoreFeatures.tsx`（模擬器＋文件 AI 助手兩卡）、`MediaWall.tsx` |
| 期末 共用圖框/QR提示  | `components/final/Figure.tsx`（next/image glass 圖框）、`components/nav/QRScanHint.tsx`（首頁＋/final）|
| 模擬器頁面（iframe）  | `app/simulator/page.tsx`（頂層路由，非 with-nav）            |
| 模擬器資產 + 引擎     | `public/sim/*`（`index.html`/`app.js`/`style.css` 沿用地面站；`sim-engine.js` 物理/鍵盤、`sim-cam.js` 世界渲染/玩法、`sim-audio.js` 合成音效）|
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
| 滑鼠軌跡 / 自製游標   | `components/effects/CursorTrail.tsx`（青色軌跡＋點擊雙環聲納脈衝；漣漪顏色跟游標狀態走——點到可點擊處＝金、一般處＝青，靠 `INTERACTIVE` 選擇器判定；touch 也吃）、`CustomCursor.tsx`（聲納准心，hover 變琥珀金鎖定＋一次性掃描環 `cursor-sweep`；搭配 `globals.css` 的 `.cursor-custom`）|
| 倉庫卡描邊光環        | `globals.css` 的 `.repo-card`（conic 旋轉描邊＋`@property --repo-a`）；class 套在 `repos/page.tsx` available 卡 |
| 模擬器手機轉向        | `public/sim/index.html` `#rotate-hint`（直向提示轉橫）＋ `app.js` 全螢幕時 `orientation.lock('landscape')`（限 Android）；web 無法強制旋轉 |

---

## 環境變數

| 變數名稱              | 說明                                          | 必填 |
| --------------------- | --------------------------------------------- | ---- |
| `OPENROUTER_API_KEY`  | OpenRouter API 金鑰，供 `/api/chat` 呼叫 AI  | ✅   |

**本地開發**：寫入 `.env.local`（已加入 `.gitignore`，不進版本控制）
**Vercel 部署**：Vercel Dashboard → Project → Settings → Environment Variables → 新增 `OPENROUTER_API_KEY`

---

## 視覺系統

深色主題（深海夜藍）。token 定義在 `app/globals.css`（`:root` + `@theme inline`）。

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
| 3D列印01.jpg | `public/images/3D列印01.jpg` | FreeCADShowcase 列印過程照片（左）（僅期中用） |
| 3D列印02.jpg | `public/images/3D列印02.jpg` | FreeCADShowcase 列印過程照片（右）（僅期中用） |
| 實物照片.jpg | `public/images/實物照片.jpg` | CurrentState 外殼實物照片（僅期中用；期末媒體牆刻意不重用，待補新照） |
| 期末實照/迷因 | `public/images/final/*`（8 檔）| `/final` 用：`找不到衛星`(GPS)、`鏡頭包鋁箔`(相機)、`矽利康`(防水)、3 張`迷因_*`(AI 代理)、2 張`離題_簽名*`(Computex)。來源 `secret/期末報告/` 複製而來 |
| 模擬器資產   | `public/sim/*`               | 由地面站 `data/www/` 複製（不含 sw.js），路徑已改相對、加 `sim-engine.js`/`sim-cam.js`/`sim-audio.js` |

## 素材待補

| 項目             | 說明                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| Demo 操控演示影片 | 放 `public/videos/`，期末 `MediaWall.tsx` 影片區（現為「待補」佔位）                          |
| 下水測試 / 組裝照 | 放 `public/images/`，期末 `MediaWall.tsx` 照片牆（現為「待補」佔位）                          |
| 迷因（AI 代理）   | 已上傳 3 張（`public/images/final/迷因_*`），用於 `AIAgentSection`；模擬器 `sim-engine.js` 另有 console 彩蛋 |
| ROV STL 模型     | 從 3D 列印原始檔匯出 STL 後複製到 `public/models/ROV_Hull.stl`（建好後 3D 互動即生效） |
| QR 正式網址      | 部署後自動從 `window.location.href` 讀取，不需改程式碼                                       |

---

## 內部文件與資料（gitignore）

`secret/` 整個資料夾已 gitignore，不進版本控制。目前內容：

| 路徑                | 用途                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| `secret/文件/*.md`  | 技術文件的**權威來源**（最新規格，7 篇）；網站顯示的 `content/docs/*.mdx` 由此同步 |
| `secret/期末報告/`  | 期末報告素材來源（`*.md` 靈感整理 + 實照/迷因原圖）；要顯示的圖已複製到 `public/images/final/` |

> **文件同步規則**：改技術文件時先改 `secret/文件/`，再同步到對應 `content/docs/*.mdx`（同步時補 frontmatter `category`、做易讀化）。本專案不再使用 `secret/plan/` 計畫檔。
> 文件可用 `<Callout type="info|warning|success|danger" title="…">` 提示框（元件在 `components/docs/Callout.tsx`，已注入 `app/(with-nav)/docs/[slug]/page.tsx` 的 MDX `components`）；來源若用 Markdown blockquote（`>`）亦會渲染成青邊提示框（`app/globals.css` 的 `.mdx-content blockquote`）。**MDX 內勿用 `import`**（remote MDX 無法解析路徑），直接用標籤即可。MDX 雷點：prose 中裸 `<數字`、裸 `{}` 會 build 失敗，改寫成「低於/小於」或放進程式碼／行內 `` `code` ``。
> **文件導覽系統**：側邊欄依 frontmatter `category` 分組（系統總覽／硬體與機構／電子與軟體／製造與列印）——**新增文件務必補 `category`**，否則歸入「其他」組。右側「本頁目錄」與標題錨點 id 都由 `lib/toc.ts` 產生：`extractToc`（給目錄）與 `rehypeHeadingIds`（給渲染後標題加 id）共用同一個 slugger，故 id 必然一致；改動其一就要兩邊一起確認。頁尾上一篇/下一篇由 `DocPager` 依檔名排序自動產生（與側邊欄組順序一致，因 `category` 不打散檔名順序）。

---

## AI 編輯快速指南

| 改動目的              | 目標檔案                                              |
| --------------------- | ----------------------------------------------------- |
| 站名 / GitHub org URL | `lib/site.ts`                                       |
| 個人 GitHub 連結      | `lib/site.ts` → `githubPersonalUrl`              |
| 首頁 5 顆按鈕         | `components/home/NavGrid.tsx`                       |
| 導覽列連結 / 順序     | `components/nav/TopNav.tsx`                         |
| 期末各段（全頁）      | `components/final/*`（`FinalIntro`+`FinalCoverFX`/`CoreFeatures`/`DebugStories`/`WaterproofSection`/`AIAgentSection`/`MediaWall`/`OffTopicComputex`/`Figure`） |
| 期末實照 / 迷因圖     | `public/images/final/*`（中文檔名，由 `secret/期末報告/` 複製）；`next/image` 經 `Figure.tsx` 顯示 |
| 模擬器物理 / 操控     | `public/sim/sim-engine.js`（一階慣性 `ax`、鍵盤 W/S·A/D·←→·↑↓＋L/P/R、`vspeed`、`DEPTH_MAX`、四場域 `__simSetSite`、`window.__SIM` 橋＋`step` 測試鉤子）；頁面 `app/simulator/page.tsx` |
| 模擬器影像 / 玩法     | `public/sim/sim-cam.js`（天空/河床/大燈光錐/caustics、5 種生物、📷 拍照圖鑑＋♻ 垃圾清理、REC/vignette/噪點、桌機按鍵提示、戳生物彩蛋）；音效 `public/sim/sim-audio.js`（WebAudio 合成＋`#btn-snd` 🔊 鈕） |
| 模擬器地圖 / 航點     | `public/sim/app.js`（四場域 `SITES.center`＝水域中央＋各自 `sitesWP`、`goToSite` 切場域瞬移遊標、`frameSite` zoom 夾 `[15,17]`＋置中水域、`rovIcon` SVG 方向箭頭）＋ `public/sim/style.css`（`.rov-arrow`/`.rov-ping`） |
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
| AI 聊天面板           | `components/docs/AIChat/AIChatWidget.tsx`（`?assistant=1` 進站自動彈開；`/docs` 轉址保留參數） |
| AI API 代理           | `app/api/chat/route.ts`（改模型在此）             |
| 滑鼠 / 觸控特效       | `components/effects/CursorTrail.tsx`（軌跡＋雙環脈衝；漣漪色＝點到可點擊處金、否則青，touch 也吃）、`CustomCursor.tsx`（hover 琥珀金鎖定＋掃描環）、`.repo-card` conic 描邊、模擬器 `#rotate-hint` 轉向提示 |

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
- [ ] TopNav 導覽順序：期中 → 期末 → 模擬器 → 文件 → 倉庫
- [ ] 首頁 5 顆卡（含整排寬的「潛水艇模擬器」），右下 QR 旁有「掃 QR Code 進網站」動畫箭頭
- [ ] `/final` 封面有炫技動畫背景（聲納掃描＋氣泡，僅封面、不外溢）、主標「只是一台潛水艇」、QR 箭頭滑過第一屏才收；第二頁「核心功能」兩卡（模擬器＋文件 AI 助手）；4 張故事各自一頁且 eyebrow 無編號；GPS／相機排線／防水有實照；AI 代理 3 迷因＋`/repos` 連結；末段 Computex 離題
- [ ] `/simulator` iframe 載入儀表板：虛擬搖桿→馬達%、深度桿→深度、放手被動上浮且滑行减速（慣性）、
      到水面（深 0）看得到天空/太陽/雲/遠岸/浮標且不再無限往上、💡/📷/⏺ 切換、RSSI 隨深度變弱、🧭 校準收 12 扇區
- [ ] `/simulator` 影像玩法：深度 >1.5m 河床浮現（沙底/卵石/水草/垃圾）、深處變暗開 💡 有光錐且魚趨光、
      📷 取景框有生物收進圖鑑（右上 `📖 n/5`）、潛底開到垃圾正上方自動撈（`♻ n/6`）、戳生物有浮字/竄逃、
      桌機顯示按鍵提示（W/S·A/D·↑↓·L/P/R）且手機不顯示、頂列 🔊 可靜音（localStorage 記憶）、錄影中左上有 REC 計時
- [ ] `/simulator` 航點頁：四場域（外雙溪/大湖/碧湖/基隆河）各自有方向箭頭遊標（含漣漪）且**落在水面上**、地圖可正常放大縮小（zoom 15–19）、切場域遊標瞬移、航點各自獨立、上傳→自動導航移動
- [ ] `secret/` 整個資料夾未被 git 追蹤
- [ ] `/docs/[slug]` 右下角 AI FAB 出現，點擊可開啟聊天面板；從核心頁文件卡（`/docs?assistant=1`）進站會自動彈開面板
- [ ] AI 聊天能正確回答文件相關問題（需 `OPENROUTER_API_KEY`）
- [ ] 滑鼠移動 / 手指拖動產生青色軌跡，點擊有漣漪動畫
- [ ] 桌機滑鼠顯示自製「聲納准心」游標（hover 變紫放大、按下縮小），文字框維持 I-beam；觸控裝置不受影響；`/simulator` 維持系統游標

---

*最後更新：2026-06-11（模擬器影像精緻化＋玩法升級：渲染拆 `sim-cam.js`、音效 `sim-audio.js`；河床世界/大燈光錐/caustics/5 種生物、📷 拍照圖鑑＋♻ 河道垃圾清理、桌機鍵盤駕駛＋按鍵提示（手機不顯示）、一階慣性手感、🔊 靜音鈕；視覺沿用全站深藍＋青螢光語言）*
