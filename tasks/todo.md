# rov-web todo
最後更新：2026-11-19

## 現況（交接）
- Vercel 部署的純前端網站（Next.js 16 + Tailwind v4），電子學「只是一台潛水艇」報告與技術文件收納。
- 總覽、技術棧、資訊架構、關鍵檔案速查、部署驗證清單都在 `CLAUDE.md`，這裡不重複；踩雷細節在 `tasks/lessons.md`。
- 五區塊（首頁／期中／期末／文件／倉庫）＋ `/simulator` 皆完成；`npm run build` 通過（17 頁）。
- 倉庫頁定案三張卡：`rov-web`、`3D-printing`、`rov-firmware`（`rov-groundstation` 已移除）。
- 依賴安全（2026-10-22）：Next.js 升到 `16.4.2`、sharp `0.35.5`；`package.json` 維持**精確版本**（不用 `^`）。本站 `images.unoptimized: true`、無 Server Actions、無 `use cache`，實際風險低；之後 Next.js 有安全公告就至少升到該修補版。

### 已定案的使用者決策
- `/final` 定位「真的做出來＋一路硬仗」，**完全不提規格**（連 200m 都不提）；訊號對比用白話 `CompareBars`，不寫死 dBm。
- 天線故事以使用者口述為準：地面站外接天線焊壞 → 換新 ESP32 用板載天線解決（舊「0Ω 電阻」版本作廢）。
- `/final` 文案去 AI 腔：不用中文破折號 `——`、不放英文大寫 mono eyebrow；故事用「第 N 關」；`metaphor` 只留真的比喻。
- `/final` 不用金黃色字（會跟游標鎖定金 `#FBBF24` 撞色）；點擊漣漪顏色跟游標狀態走（可點擊處金、一般處青）。
- 模擬器：燈純手動、四場域航點各自獨立、遊標預設在各場域水域中央（座標寫在 `sim-engine.js` 與 `app.js` 的 SITES）。
- 文件 AI 助手：從核心頁卡片進 `/docs?assistant=1` 會自動彈開，掛載後 `replaceState` 清參數。

### 模擬器架構（`public/sim/`）
- `app.js`／`style.css`／`index.html` 是地面站真實儀表板鏡像（不含 `sw.js`，否則 SW scope `/` 會劫持整站快取），`app.js`／`style.css` 盡量不動。
- `sim-engine.js`：WebSocket shim＋物理（一階慣性 τ≈0.22s、`vspeed`、`DEPTH_MAX=3.0`）＋鍵盤駕駛＋`window.__SIM` 橋（`step` 測試鉤子）；**單一 rAF 主迴圈**依序呼叫 audio.tick → cam.draw。
- `sim-cam.js`（937 行，刻意不拆：五種生物／河床／玩法共用 `CAM` 狀態）：世界渲染、大燈光錐、圖鑑、河道垃圾、HUD、戳生物彩蛋。
- `sim-audio.js`：WebAudio 合成音效＋🔊 鈕（localStorage `sim-muted`）。
- script 順序：engine → audio → cam → app。

### 關鍵約定（容易踩坑）
1. 文件來源：權威在 `secret/文件/*.md`（gitignore）→ 同步到 `content/docs/*.mdx`，同步時補 frontmatter `category`；同類連號，不打散檔名順序（上一篇/下一篇依檔名排序）。
2. MDX 內不要寫 `import`（remote MDX 解析不了）；`Callout` 已注入 components map。prose 裸 `<數字`、裸 `{}` 會 build 失敗，改寫或包行內 code。
3. 目錄與標題錨點 id 共用 `lib/toc.ts` 同一 slugger，改一邊要同步另一邊。
4. Tailwind 色 token 只有 `accent-cyan`／`accent-violet`，琥珀色用標準 `amber-400`。
5. CSS 改了沒生效：dev server HMR 可能沒吃到 `globals.css`，先用 `next build && next start` 驗 production 產物，別先怪編譯器。conic 描邊轉動要 `@property` 宣告角度。
6. 驗證模擬器時分頁 hidden 會讓 rAF 凍結（瀏覽器節流，不是 bug），用 `__SIM.step` 手動推進；dt 已 clamp `[0,max]`。
7. 遙測每筆 `setIcon` 會重建元素、重置 CSS 動畫 → 標記持久化，只改 transform。
8. 離線圖磚原生只到 z17：`frameSite` 起始 zoom 夾在 `[15,17]`，minZoom 15。
9. 每次改完跑 `npm run build`。大檔 Read 可能被假截斷（出現「（後略）」），驗證內容改用 `node -e`／`grep`。

## 待補
- [ ] Demo 操控影片 → `public/videos/`，接進 `MediaWall.tsx`（目前虛線佔位，最傷觀感）。
- [ ] 下水測試／組裝照 → `public/images/`，接進 `MediaWall.tsx`。
- [ ] ROV STL 匯出到 `public/models/ROV_Hull.stl`（3D 互動才生效）。

## 已知問題／刻意不處理
- 期中 `MissionScene.tsx` 仍標「200m 無線距離」，使用者覺得不實際，**等使用者點頭再改**。
- 自製准心游標在觸控裝置停用（無常駐指標）；手機靠軌跡＋點按脈衝補足。
- 網頁無法強制旋轉手機：全螢幕時 `orientation.lock('landscape')` 只在 Android 有效，iOS 只顯示「請轉橫向」提示。
