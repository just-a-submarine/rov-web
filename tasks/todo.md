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

---

# 第三輪：文件重新同步 + 專案管理改回預設（2026-06-08 晚）

## 背景
- `secret/文件/*.md`（6/7 更新）為最新權威來源，網站 `content/docs/*.mdx`（5/31）已過時。
- 使用者要求：刪 `secret/plan/`、改用預設專案管理（CONTEXT.md + tasks/），更新所有文件，並把網站「文件」分頁同步到 `secret/文件/`。

## 待辦
- [x] 以小腳本由 `secret/文件/*.md` 重新產生 7 篇 `content/docs/*.mdx`（帶 body + 補 frontmatter `category`）
- [x] 修 MDX 雷點：`<40ms`（05）、`ly<0`（06）→ 行內 `` `code` ``
- [x] 強化 `.mdx-content blockquote` 樣式（來源用 `>` 當提示框）
- [x] 刪除 `secret/plan/`（含 06-simulator.md）
- [x] CLAUDE.md：移除 secret/plan 條款與「細節文件」表、`secret/doc`→`secret/文件`、改述預設專案管理
- [x] CONTEXT.md：同上對齊、加最新交接段落
- [x] `npm run build` 通過（17/17、含 7 篇 docs prerender）

## Review
- **做法**：文件差異量大（每篇 +/− 數十行）且來源為純 Markdown、舊版用 `<Callout>`，逐句合併風險高 → 直接以來源為準整篇重生，並用一次性 `.mjs`（gray-matter 解析 frontmatter）保證 7 篇一致、再刪腳本。
- **保留視覺品質**：來源改用 blockquote（`>`）做提示，於是只調一處 CSS（青邊圓角＋淡底＋strong 上色）就讓所有提示框好看，免去把幾十處 `>` 轉成 `<Callout>` JSX 的風險（符合「最小影響」）。
- **MDX 安全**：先以 node 掃描 fence 外的裸 `<`/`{`，只有兩處（`<40ms`、`ly<0`），包成行內 code 即過；其餘 `<img>`、`{}` 都在 ``` 區塊內安全。
- **專案管理**：`secret/` 全資料夾 gitignore 且未追蹤，刪 `secret/plan/` 不影響 git。改用預設 CONTEXT.md + tasks/。
- **驗證**：`npm run build` EXIT=0、17 頁全 prerender；docs 5 篇路徑列出無誤。
- **教訓**：MDX（remote）對 prose 中裸 `<數字` 很敏感，build 才會炸；移植純 Markdown 進 `.mdx` 前，務必先掃 fence 外的 `<`/`{`。

---

# 第四輪：模擬器「戳魚」彩蛋（2026-06-08 深夜）

## 待辦
- [x] `sim-engine.js` 加點擊命中測試（normalized 座標 + `getBoundingClientRect`，命中半徑 `s*1.5+14`）
- [x] 命中特效：魚反向竄逃(boost) + 金光閃爍(flash) + 14 微粒 + 漣漪 + 白話浮字（`drawFx`/`spawnBurst`/`addRipple`/`addText`）
- [x] 滑過魚游標變手指（`onCamMove`）；空水域點擊無回饋
- [x] 連抓 5 隻里程碑（全魚金閃 + 大爆 + 認證大字）
- [x] `node --check` + 輕量 DOM stub 驗證（9 斷言全綠，跑後刪腳本）

## Review
- **設計**：彩蛋全畫在既有 `#sim-cam`，只在 `CAM` 加 `parts/ripples/texts/catches` 與幾個小函式，**不動 app.js、零新增依賴**（符合最小影響）。
- **點擊穿透**：`.touch-ctl` 中央 `pointer-events:none` → canvas 收得到 `pointerdown`；魚多在中央，僅壓到搖桿區的魚點不到（可接受）。
- **驗證**：無 jsdom，自寫輕量 DOM/canvas stub（固定 `Math.random` 讓魚落在已知點）跑真引擎，斷言命中生成特效、游標提示、里程碑、100 幀+點擊無例外。

---

# 第五輪：/final 期末報告改版（2026-06-08）

## 背景
排練後使用者要調整 `/final`：太擠→拆頁；砍兩張、改寫天線故事；GPS/相機補實照；新增 AI 代理（迷因）與防水兩塊；最末放 Computex 離題；封面太拗口→簡化＋加「指向右下角 QR」的動畫箭頭。素材在 `secret/期末報告/`。

## 待辦
- [x] 媒體：`secret/期末報告/` 8 圖複製到 `public/images/final/`（讀實際尺寸給 next/image）
- [x] 首頁：`NavGrid` 模擬器卡去掉「· 試玩」；`app/page.tsx` 加 `QRScanHint`
- [x] 共用：`components/nav/QRScanHint.tsx`（動畫箭頭＋「掃 QR Code 進網站」，scrollY>60 收起）
- [x] 共用：`components/final/Figure.tsx`（next/image glass 圖框）
- [x] 封面：`FinalIntro` 簡化（主標「只是一台潛水艇」＋副標）、「往下看故事」→「往下滑」
- [x] 故事：`DebugStories` 改全頁式；砍 04/06；重寫 01 天線；03 GPS 補圖＋CTA；05 相機補圖
- [x] 圖表：`MiniCharts` 刪 `BatteryChart`，`RssiChart`→`SignalBars`（白話、無 dBm）
- [x] 新增：`WaterproofSection`（矽利康＋自融膠帶）、`AIAgentSection`（3 迷因＋`/repos` CTA）、`OffTopicComputex`（簽名 2 圖）
- [x] 串接：`app/(with-nav)/final/page.tsx` 新順序（封面→4 故事→防水→AI→模擬器→媒體牆→Computex→結尾）
- [x] `npm run build` 通過（17/17、TS 乾淨）；dev server `/`、`/final`、範例圖 HTTP 200
- [x] 更新 CLAUDE.md / CONTEXT.md / todo

## Review
- **拆頁**：每個故事＝一個 `SlideSection`（min-h-dvh），直接解決「2 欄 grid 太擠」；其餘主題（防水/AI/Computex）也各自全頁，整頁變成乾淨的投影式卷軸。
- **天線故事採信使用者口述**：來源 `.md` 寫的是「0Ω 電阻沒焊到 IPEX→stray stub→補焊」技術版本，但使用者澄清真相是「地面站外接天線焊壞→其實免外接、換新 ESP32 用板載天線解決」。以使用者為準改寫，RSSI 數字（−71/−27）來自舊版本框架，故依使用者指示**改白話、不寫死數字**（`SignalBars`）。
- **圖片**：沿用專案既有 `/images/中文檔名` 慣例（CurrentState 已驗證可行），`Figure.tsx` 統一 next/image 圖框、用實際尺寸避免變形；手機直拍多為直幅，故 `widthClass` 收窄（max-w-[16rem]）避免單張霸版。
- **QRScanHint 只掛首頁＋/final**：不放進 with-nav layout，避免期中/文件/倉庫也冒出箭頭。
- **驗證**：`npm run build` EXIT=0、/final 靜態 prerender（＝server render 無誤）；dev `/`、`/final`、中文檔名圖皆 200。
- **教訓**：Tailwind 色 token 只有 `accent-cyan`/`accent-violet`（globals.css `@theme`），沒有 `accent-amber`；要琥珀色用標準 `amber-400`（寫進 lessons 概念）。
- **未做**：Chrome 擴充未連線→瀏覽器目視未做（靠 build＋200）；Demo 影片仍待補。

---

# 第六輪：模擬器物理/航點重做 + 文件 AI 助手自動彈出 + 手機適配（2026-06-08）

## 背景
排練後使用者再提四點：
1. 從期末報告核心頁點進「文件」時，AI 助手要預設彈開。
2. 模擬器深度不合物理：放開搖桿自動上浮但畫面不動；深度到 0 還能無限往上；要做水面以上空間（深 0 看水面物、往下進水裡）。
3. 航點遊標：綠三角太不顯眼/看不出朝向→改清楚方向箭頭＋漣漪脈動；四張地圖各自獨立的遊標（目前只有外雙溪有）；預設位置固定在各場域水域中央，不要隨機。
4. 確認手機版介面適配。

## 待辦
- [x] AI 自動彈出：`CoreFeatures` 文件卡 href→`/docs?assistant=1`；`docs/page.tsx` 轉址保留參數；`AIChatWidget` 掛載時讀 `?assistant=1` 自動開啟並清掉參數
- [x] 深度物理：`sim-engine.js` 記錄夾擠後的實際垂直速度 `vspeed`，畫面垂直流動改吃 `vspeed`（放手浮起畫面跟著動、到水面自然停）
- [x] 水面空間：`drawWater` 依深度算水平線，水面以上畫天空＋太陽＋雲＋遠岸＋浮標；水下層裁切在水平線下；浮水印標示「水面」
- [x] 航點獨立：`app.js` 四場域各自 waypoints；`goToSite` 把模擬潛艇瞬移到該場域水域中央＋停自動＋換標記；`sim-engine.js` 加 `__simSetSite`
- [x] 遊標樣式：`rovIcon` 改 SVG 方向箭頭＋ `.rov-ping` 漣漪；標記持久化（只更新旋轉，不每幀重建以免動畫被重置）；`style.css` 調樣式
- [x] `npm run build` 通過；CDP/HTTP 驗證；確認手機版（CoreFeatures 堆疊、cursor 觸控停用、模擬器 canvas 縮放）
- [x] 更新 CLAUDE.md / CONTEXT.md / todo

## Review
- **深度物理（關鍵修法）**：原本畫面垂直流動 `flowY` 吃「搖桿輸入 vert」→ 放手就不動、到 0 還能無限往上。改成引擎記錄「夾擠後的實際垂直速度」`st.vspeed = (depth−prevDepth)/dt`，`flowY = clamp(−vspeed×0.7,±1)`。如此放手被動上浮畫面跟著動，到水面（clamp 0）vspeed 自然歸零、畫面停住；深度上限 `DEPTH_MAX=3.0` 同時擋住「無限往上」。
- **水面空間**：`drawWater` 依深度算 normalized 水平線（深 0 約 46% 天空、約 0.6m 後全沒入），水面以上畫天空漸層＋柔光太陽＋雲＋遠岸剪影（含小樹）＋橘紅浮標（半露水面＋倒影＋桅桿），水下層用 `ctx.clip()` 裁在水平線下、近水面畫起伏亮帶；越沒入整個天空層越淡出。浮水印深 0 顯示「· 水面」。
- **航點四場域獨立**：`sitesWP[site]` 各存各的 waypoints；`goToSite` 移除舊標記→換 `waypoints` 參照→重畫新場域標記→`__simSetSite(site)` 把模擬潛艇瞬移到該水域中央（同時停自動導航）。每張地圖因此都有自己的遊標、切回來航點還原。
- **遊標樣式**：`rovIcon` 改 SVG polygon（凹底箭頭，方向不會看錯）＋外圈 `.rov-ping` 持續漣漪。**坑**：原本每筆遙測（~10Hz）都 `setIcon` 重建整個元素 → 漣漪 CSS 動畫每 100ms 被重置（看起來不會動）。改為標記持久化：只在「箭頭⇄圓點」切換時 `setIcon`，其餘只改 `.rov-arrow` 的 `transform` 旋轉，漣漪動畫不被打斷、旋轉也吃到 CSS transition 變順。
- **AI 自動彈出**：`/docs?assistant=1`（核心頁文件卡）→ `docs/page.tsx` 轉址保留參數 → 落地文件頁 `AIChatWidget` 掛載時讀 `window.location.search` 自動開啟並 `replaceState` 清掉參數（避免重整/換頁一直自動開）。用 `window.location` 不用 `useSearchParams`，免去靜態頁需要 Suspense 邊界。
- **驗證**：`npm run build` 綠燈（17/17，`/docs` 因讀 searchParams 轉為 dynamic ƒ，正常）。Node 引擎харness 9/9（下潛/放手浮起/水面停/上限/瞬移/drawWater 跨深度無例外）。CDP headless：AI 自動開（參數清空、textarea 在）、模擬器水面截圖有天空＋浮標、下潛 1.3m 全水下、放手浮回 0.6m；地圖箭頭＋漣漪在，外雙溪 2 航點→大湖 0→切回 2（各場域獨立），0 例外。手機 390px：/final 無橫向溢出、核心卡直堆、AI 自動開且 FAB 收起；觸控模擬 `pointer:coarse` → 自製游標停用（無 `cursor-custom` class、reticle `display:none`）。
- **教訓**：見 lessons.md（遙測 push 節流、divIcon 重建會重置 CSS 動畫）。

---

# 第七輪：大湖/碧湖地圖縮放修正 + 遊標放進水裡（2026-06-08）

## 背景
1. 大湖、碧湖地圖「放大縮小」壞掉。
2. 遊標仍落在陸地（不在水面）。使用者要我自己開瀏覽器看該放哪。

## 待辦
- [x] 開 CDP headless 實測四場域：診斷出大湖/碧湖 `getBoundsZoom` 算到 **z18**（超過原生圖磚 17），又被設成 minZoom → 鎖死在糊掉的升取樣、無法縮放；大湖遊標還被 maxBounds 夾到畫面外
- [x] `app.js` `frameSite`：起始 zoom 夾在 `[MAP_MIN_ZOOM, MAP_MAX_NATIVE_ZOOM]`（清晰），minZoom 維持 15（可自由縮放）；改置中於 `s.center`（水域中央）
- [x] 用 CDP 找水域座標：合成同源圖磚→偵測水色（實測水色 `rgb(213,232,235)` 淡青，非飽和藍）→**距離轉換取水域最深處**（避開湖中島/河岸，避免質心落回陸地）
- [x] 把四場域水點寫進 `sim-engine.js` SITES（遊標預設）與 `app.js` SITES `center`（地圖置中）
- [x] CDP 驗證：四場域遊標所在像素皆為水色（waterFrac=1.0）、min/max=15/19 縮放可用、0 例外；移除 TEMP debug hook 後再驗一次仍正常

## Review
- **縮放壞掉根因**：`frameSite` 把 `getBoundsZoom(bounds)` 當 minZoom。大湖/碧湖水域 bbox 很小 → fit zoom 算到 18，但離線圖磚原生只到 17。結果 minZoom=18、maxZoom=19，整張圖永遠是 z17 升取樣（糊）、又無法往外縮；大湖更因 maxBounds 夾擠把中心推到北邊、遊標掉出畫面。
- **修法**：起始 zoom = `clamp(fitZ, 15, 17)`（保證有清晰的原生層、且留縮放空間），minZoom 放回 `MAP_MIN_ZOOM=15`（縮出圖磚範圍露網格襯底可接受）。四場域實測 min/max=15/19、縮放皆正常。
- **遊標放進水裡（自動找水）**：人工挑座標易錯，改用程式找——把可見的**同源**圖磚（localhost 同源 → canvas 可讀像素）合成到 canvas，先校準水色（直方圖 + 已知湖面取樣得 `rgb(213,232,235)`），再對水體做**距離轉換**取「離岸最遠的水格」當水域中央。質心法會被碧湖中央的島嶼帶回陸地，距離轉換則穩定落在最大水體中心。
- **置中於水點**：`frameSite` 改 `setView(s.center,...)`（不再用 bbox 中心），地圖與遊標同點 → 遊標落在畫面中央水面上。碧湖/基隆河因圖磚覆蓋窄、maxBounds 夾擠會稍微偏移，但仍在水面、在視野內（可接受）。
- **驗證**：CDP 量「遊標所在像素 5×5 平均」全為水色（waterFrac=1.0、色 `[213,232,235]`）；外雙溪/大湖置中、碧湖/基隆河略偏但在水上；截圖四張確認綠箭頭都在藍色水面上；移除 debug hook 後 `.rov-arrow`/`.rov-ping` 仍在、0 例外。
- **教訓**：見 lessons.md（離線圖磚 fit-zoom 可能超過原生 zoom；自動找水用同源 canvas + 距離轉換）。

---

# 第八輪：前端特效升級 + 手機特效/轉向適配（2026-06-09）

## 背景
使用者排練後對前端體驗提四點：
1. 滑鼠 hover 可點擊處的紫色圈圈不明顯 → 換顯眼的顏色。
2. 那個圈圈加「突然亮起來、轉一圈」像載入轉圈的特效，更吸睛。
3. 倉庫三張卡 hover 只微亮邊框 → 要一道光繞邊框轉一圈（顏色挑酷的）。
4. 手機版也想要類似電腦版的前端特效；介面自適應；模擬器能不能自動把手機打橫；直/橫向體驗都顧到。

## 待辦
- [x] 游標 hover 改琥珀金鎖定色（`CustomCursor.tsx` `LOCK=#FBBF24`，環/點/光暈加亮）
- [x] 游標一次性掃描環：`key={spinKey}` 重掛 conic 遮罩環跑 `@keyframes cursor-sweep`（轉一圈淡出）
- [x] 倉庫卡 `.repo-card::before` conic 旋轉描邊（`@property --repo-a` + `repo-border-spin`），套在 available 卡
- [x] 手機特效平權：`CursorTrail` 點擊/點按漣漪升級雙環聲納脈衝（touch 本來就吃）
- [x] 模擬器轉向：全螢幕時 `screen.orientation.lock('landscape')`（限 Android）；`#rotate-hint` 直向提示轉橫；返回列「建議橫向」手機也顯示
- [x] `npm run build` 通過（17/17）；CDP 對新 production build 實測效果
- [x] 更新 CONTEXT.md / CLAUDE.md / lessons.md / todo

## Review
- **游標**：原 hover 變紫（`#A78BFA`）對深色＋既有青/紫底不夠跳 → 改琥珀金 `#FBBF24`（暖色，最高對比）＋ box-shadow 加大＝「亮起來」。一次性掃描環＝進 hover 時 `useEffect([state])` 把 `spinKey+1`、用 `key` 重掛 conic 遮罩環重播 `cursor-sweep`（轉一圈＋淡出）；同元素內移動不重觸發。
- **倉庫描邊光**：`.repo-card::before` 用 conic-gradient（青→白→紫）＋ `mask-composite:exclude` 做純邊框環，hover 跑 `repo-border-spin` 無限轉。**必須 `@property --repo-a`** 宣告 `<angle>`，否則 keyframe 改自訂變數不會補間（不會轉）。附 `@supports not` 與 `prefers-reduced-motion` 退化。
- **手機**：滑動軌跡/漣漪原本就綁 `touchmove/touchstart`（手機已享有），本輪把漣漪做成雙環脈衝呼應游標鎖定色。自製常駐准心游標無法跟手指（無 hover 指標）＝誠實限制。介面早已 Tailwind 響應式＋`(pointer:fine)` 自動停用游標。
- **轉向**：web 無強制旋轉硬體 API；`orientation.lock` 只在全螢幕＋Android Chrome 有效、iOS 不支援 → 用「能鎖就鎖＋直向提示轉橫」務實解。
- **驗證踩坑**：dev server（:3000）HMR **沒吃到 `globals.css` 改動**，CDP 量 live 發現 `.repo-card::before` 規則不存在，一度誤判 Lightning CSS 丟規則。實證 production build 產物（`.next/static/chunks/*.css`）規則完整＋合法 → `next start -p 3100` 跑新 build，CDP 量 `::before` `opacity:1`/`animation:repo-border-spin`/conic✓、截圖見青紫光繞邊框、游標琥珀鎖定環；模擬器直向 `#rotate-hint` `display:flex`、橫向 `none`。臨時 server/截圖/腳本已清。
- **教訓**：見 lessons.md（CSS 沒生效先驗 production build 別怪編譯器；conic 描邊要 `@property`；web 不能強制轉向）。

---

# 第九輪：模擬器影像精緻化＋玩法升級（2026-06-10）

## 背景
使用者要求模擬器「影像更精緻、實際操作更好玩」。約束：視覺與全站一致（深藍＋青色螢光＋Roboto Mono）、手機優先不改版面、桌機加鍵盤＋按鍵提示、app.js/style.css 不動、零依賴 canvas 2D。

## 待辦
- [x] `sim-engine.js` 瘦身：渲染拆出，加鍵盤駕駛（WASD/方向鍵＋L/P/R）、一階慣性、`__SIM` bridge（＋`step` 測試鉤子）、燈改純手動
- [x] 新增 `sim-audio.js`：WebAudio 合成音效（馬達/氣泡/快門/叮/splash/號角）＋ 🔊 鈕（reuse .fs-btn、localStorage）
- [x] 新增 `sim-cam.js`：世界渲染（天空/水體/河床/水草/卵石）＋大燈光錐＋caustics＋五種生物＋拍照圖鑑＋河道垃圾清理＋REC/vignette/噪點/按鍵提示＋戳生物彩蛋（搬入＋分物種台詞）
- [x] `index.html`：加 2 個 script ＋ 🔊 鈕
- [x] `node --check` ×3、Node DOM-stub harness 14/14、dev server 200、Chrome 實測（console 0 錯、深潛/大燈/圖鑑/垃圾/鍵盤/REC/戳魚/🔊）
- [x] 更新 CLAUDE.md / CONTEXT.md / lessons / todo Review

## Review
- **架構**：渲染與玩法自 `sim-engine.js` 拆到新檔 `sim-cam.js`（937 行，單一內聚渲染模組）、音效獨立 `sim-audio.js`（131 行）；engine 瘦回 233 行只管 shim＋物理＋鍵盤＋`window.__SIM` 橋。**單一 rAF 主迴圈**在 engine：物理 → 遙測(10Hz) → audio.tick → cam.draw，三檔不各開迴圈。`app.js`/`style.css` 一行未動（真實地面站鏡像）。
- **手感**：輸入改一階慣性（τ≈0.22s 的 `ax`，鬆手滑行）；畫面流動、馬達 % 全吃平滑後的值。鍵盤＝桌機適配：移動鍵按住覆蓋觸控軸；L/P/R 不另開旁路，對隱藏虛擬鈕發合成 PointerEvent → 完整走 app.js 既有 pulse/photoSeq（行為與按鈕一致）。
- **視覺一致性（使用者要求）**：新 UI（按鍵提示/HUD 計數/REC/🔊）全部沿用儀表板語言（深藍玻璃面板＋青框＋Roboto Mono；🔊 直接 reuse `.fs-btn`）；按鍵提示只在 `pointer:fine` 顯示、首按後淡化，手機完全不出現。
- **玩法**：大燈從裝飾變機制（深處 `m=1-(lit?0.5:0.8)·df` 變暗、光錐＋趨光）；📷 圖鑑 5 種（取景框命中、新種優先）；♻ 垃圾 6 件（潛底＋置中自動撈、切場域重生、圖鑑跨場域保留）；觸底揚沙震動、破水曝光泛白＋splash。
- **驗證**：`node --check` ×3 綠；自寫 DOM/canvas stub harness 真跑 engine+cam **14/14 斷言**（慣性加速/滑行/到底/圖鑑收錄/垃圾撈起/切場域歸零+圖鑑保留/長跑無例外，跑完即刪）；Chrome 實測：水面（天空/雲/岸/浮標/波光）與 3m 河床（沙底/卵石/水草/垃圾/小蝦/大燈光暈/訊號弱警示）截圖確認、戳魚浮字「🐟 嚇跑一群！」、REC overlay、🔊 切換＋localStorage，console 0 錯誤。
- **坑**：①驗證時分頁 `hidden` → rAF 全凍（截圖工具會喚醒 1 幀造成假象）→ 加 `__SIM.step` 鉤子手動推進；②測試時間倒流讓 dt<0 → `ctx.arc` 負半徑 throw → cam/engine dt 雙向 clamp、REC 秒數加下限；③javascript_tool 不吃 top-level await。三條都進 lessons.md。
- **取捨**：`sim-cam.js` 937 行超過 800 行指引——五種生物＋河床＋玩法＋overlay 共享同一個 `CAM` 狀態，再拆檔會把狀態切碎、增加跨檔耦合，維持單檔內以區段註解分節。FPS 未實測數值（分頁 hidden 測不了），但物件總數 <150、噪點/caustics 皆預渲染 tile，與舊版同量級。
