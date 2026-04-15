# 只是一台潛水艇 — 網站主計畫

## 動態更新條款

> **使用者的修改要求永遠優先於本文件。**
>
> 當使用者提出任何修改：
> 1. **先實現要求**（不得以文件為由延後）
> 2. **完成後更新本文件與 `doc/plan/*.md`**，保持文件與實際狀態同步
>
> 文件是「記錄現狀」，不是「限制修改」。

AI Agent 啟動後先讀本文件（輕量索引），需要某主題細節時再讀 `doc/plan/` 對應檔案。

---

## 專案目標

- Vercel 部署的純前端網站，AI Agent 可持續維護
- 電子學期中 5 分鐘視覺化報告（設計概念，實物期末展示）
- 長期收納：技術文件、期末報告、GitHub 倉庫索引

---

## 技術棧

| 層面 | 選擇 |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| 樣式 | Tailwind CSS v4（CSS 變數 token） |
| 動畫 | Framer Motion + tsparticles |
| 3D 模型 | @react-three/fiber + @react-three/drei |
| 文件 | MDX (next-mdx-remote) + gray-matter |
| QR Code | qrcode.react（讀 window.location.href） |
| 部署 | Vercel |

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

| 改動目的 | 檔案 |
|---|---|
| 站名 / GitHub org URL | `lib/site.ts` |
| Logo SVG | `components/brand/Logo.tsx` |
| 首頁 4 顆按鈕 | `components/home/NavGrid.tsx` |
| 導覽列 | `components/nav/TopNav.tsx` |
| 期中 ① 封面 | `app/(with-nav)/midterm/page.tsx` |
| 期中 ② 任務 | `components/midterm/MissionScene.tsx` |
| 期中 ③ 架構圖 | `components/midterm/ArchitectureMap.tsx` |
| 期中 ④ 艇體圖 | `components/midterm/HullDiagram.tsx` |
| 期中 ⑤ FreeCAD + 3D | `components/midterm/FreeCADShowcase.tsx` + `HullViewer.tsx` |
| 期中 ⑥ 感測器 | `components/midterm/SensorsSection.tsx` |
| 期中 ⑦ 現況 + 實物照 | `components/midterm/CurrentState.tsx` |
| 期中 ⑧ Roadmap | `components/midterm/Roadmap.tsx` |
| 技術文件內容 | `content/docs/*.mdx` |
| 倉庫清單 + URL | `lib/site.ts` → `repos` 陣列 |
| 顏色 / 字體 token | `app/globals.css` → `:root` 與 `@theme inline` |

---

## 視覺系統

深色主題（深海夜藍）。詳見 `doc/plan/01-visual-system.md`。

主色：Accent Cyan `#22D3EE`、Accent Violet `#A78BFA`

---

## GitHub 倉庫

GitHub Organization（預設名 `just-a-submarine`，改在 `lib/site.ts`）。
目前只有 `rov-web`；`rov-firmware`、`rov-groundstation` 之後陸續建立。

倉庫卡片在 `/repos` 頁面，`lib/site.ts` 的 `repos` 陣列管理。

---

## 已上傳素材

| 檔案 | 路徑 | 用途 |
|---|---|---|
| 3D列印01.jpg | `public/images/3D列印01.jpg` | FreeCADShowcase 列印過程照片（左） |
| 3D列印02.jpg | `public/images/3D列印02.jpg` | FreeCADShowcase 列印過程照片（右） |
| 實物照片.jpg | `public/images/實物照片.jpg` | CurrentState 外殼展示實物照片 |

## 素材待補

| 項目 | 說明 |
|---|---|
| ROV STL 模型 | 從 `secret/3D列印/` 匯出 STL 後複製到 `public/models/ROV_Hull.stl`（建好後 3D 互動即生效） |
| QR 正式網址 | 部署後自動從 `window.location.href` 讀取，不需改程式碼 |

---

## 細節文件（按需讀取）

| 主題 | 檔案 |
|---|---|
| 視覺 token / 字體 / 動畫選型 | `doc/plan/01-visual-system.md` |
| 期中 8 段分鏡完整腳本 | `doc/plan/02-midterm-storyboard.md` |
| FreeDomain + Vercel DNS 綁定步驟 | `doc/plan/03-freedomain-vercel.md` |
| GitHub org 建立與 repo 規劃 | `doc/plan/05-github-org-setup.md` |

> `doc/` 與 `3D列印/` 資料夾已 gitignore，不進版本控制。
> 3D 列印規格已整理並放入 `content/docs/06-3d-print-spec.mdx`。

---

## AI 編輯快速指南

| 改動目的 | 目標檔案 |
|---|---|
| 站名 / GitHub org URL | `lib/site.ts` |
| 個人 GitHub 連結 | `lib/site.ts` → `githubPersonalUrl` |
| 首頁 4 顆按鈕 | `components/home/NavGrid.tsx` |
| 導覽列連結 / 順序 | `components/nav/TopNav.tsx` |
| QR Code 元件 | `components/nav/QRCorner.tsx` |
| 期中封面文字 | `app/(with-nav)/midterm/page.tsx` |
| 期中任務數據 | `components/midterm/MissionScene.tsx` |
| 期中通訊架構圖 | `components/midterm/ArchitectureMap.tsx` |
| 期中 3D 模型 | `components/midterm/HullViewer.tsx` |
| 期中進度里程碑 | `components/midterm/CurrentState.tsx` |
| 技術文件內容 | `content/docs/*.mdx` |
| 倉庫清單 | `lib/site.ts` → `repos` 陣列 |
| 顏色 / 字體 token | `app/globals.css` → `:root` 與 `@theme inline` |
| Markdown 樣式 | `app/globals.css` → `.mdx-content` |

---

## 部署驗證清單

- [ ] `npm run build` 通過、無 TypeScript 錯誤
- [ ] 首頁粒子背景 + QR Code（右下角）正常
- [ ] 首頁 GitHub 按鈕連結到 rov-web repo
- [ ] `/midterm` 8 個 section 滾動正常
- [ ] 3D 模型（`HullViewer`）可拖曳旋轉、正確方向
- [ ] QR Code 各頁顯示對應頁面 URL
- [ ] `/docs` 預設跳第一篇，Markdown 表格正確渲染
- [ ] TopNav 導覽順序：期中 → 期末 → 文件 → 倉庫
- [ ] `doc/` 與 `3D列印/` 未被 git 追蹤

---

*最後更新：2026-04-14*
