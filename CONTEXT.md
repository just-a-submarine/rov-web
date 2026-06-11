# CONTEXT — 開發交接

> 給下一個 AI Agent 的精簡交接。專案總覽看 `CLAUDE.md`，技術文件權威來源在 `secret/文件/*.md`，任務規劃/回顧在 `tasks/todo.md`。

## 專案一句話
Vercel 部署的純前端網站（Next.js 16 + Tailwind v4），用於電子學報告與技術文件收納。

## 最近更新（2026-06-11）：模擬器影像精緻化＋玩法升級（拆三檔）
- **背景**：使用者要求模擬器「影像更精緻、操作更好玩」；視覺須與全站一致（深藍＋青螢光＋Roboto Mono）、手機優先不改版面、桌機只做適配（鍵盤＋提示）。
- **架構**：渲染自 `sim-engine.js` 拆出 → 三檔（`app.js`/`style.css` 不動）：
  - `sim-engine.js`（233 行）：shim＋物理＋**鍵盤駕駛**（W/S 前後、A/D 與 ←/→ 轉向、↑/↓ 升降；L/P/R 對隱藏虛擬鈕發合成 PointerEvent → 走 app.js 原有 pulse/photoSeq）＋**一階慣性**（`ax`，τ≈0.22s，鬆手滑行）＋ `window.__SIM` 橋（`st/ctrl/ax/kb/onSite/step`，`step`＝測試鉤子）。燈改純手動（`led: st.ledManual`）讓大燈變玩法。**單一 rAF 主迴圈**依序呼叫 audio.tick → cam.draw。
  - `sim-cam.js`（937 行）：世界渲染＋玩法。河床假 3D 地平面（深度 >1.5m 浮現：沙底/卵石/水草/沉木，`bedProject` v=景深、前進 v 推進、轉向 bedPan 視差）；大燈光錐（深處 `m` 更暗、開燈補亮＋趨光）；caustics 預渲染 tile 兩層捲動＋太陽波光；5 種生物（溪哥群游/吳郭魚/大鯉魚/稀有烏龜 ~24-48s 一隻/貼底小蝦，尾鰭擺動、高速逼近四散）；**📷 拍照圖鑑**（`ctrl.ph` 變化＋取景框命中 → 5 種集滿金慶祝）；**♻ 河道垃圾**（6 件，潛底開到正上方自動撈，清完慶祝；切場域重生、圖鑑保留）；相機 roll/pitch/shake/破水曝光、REC 計時、vignette/噪點、HUD 計數（右上 `📖 n/5 ♻ n/6`）、**桌機限定按鍵提示**（`pointer:fine`，首按後淡化；未 focus 提示「點一下畫面啟用鍵盤」）；戳生物彩蛋沿用＋分物種台詞。`prefers-reduced-motion` 關 roll/shake/grain。
  - `sim-audio.js`（131 行）：WebAudio 合成（馬達隨油門、水下氣泡、快門/叮/splash/觸底/號角），首次手勢啟動；頂列 `#btn-snd` 🔊/🔇（reuse `.fs-btn`）、localStorage `sim-muted`。
  - `index.html`：＋🔊 鈕＋兩個 script（順序 engine → audio → cam → app）。
- **驗證**：`node --check` ×3；Node DOM-stub harness 14/14（慣性/滑行/到底/圖鑑/垃圾/切場域/長跑無例外）；Chrome 實測截圖（水面天空＋3m 河床大燈＋REC＋戳魚浮字＋🔊 切換），console 0 錯誤。
- **坑（重要）**：驗證時分頁 `visibilityState=hidden` → **rAF 整個凍結**（畫面/物理全停、截圖時 extension 會喚醒渲染一幀造成「有畫面但不動」假象）＝瀏覽器標準節流，**不是 bug**；靠 `__SIM.step` 手動推進驗證。時間倒流（測試鉤子）曾讓 `dt<0` → 漣漪半徑負數 throw，已把 cam/engine 的 dt 都 clamp `[0, max]`、REC 秒數 `Math.max(0,…)`。
- **待補（沿用）**：`MediaWall` Demo 影片＋實物/下水照。

## 最近更新（2026-06-09）：/final 去金黃色字 ＋ 漣漪顏色跟游標狀態走
- **背景**：自製游標 hover 可點擊處會變「琥珀金鎖定色」(`#FBBF24`)；`/final` 內原本也有多處金黃字/元素，游標一蓋上去兩個金色糊在一起、看不清。
- **改動（`/final` 金黃 → 改色，4 檔）**：
  - `CoreFeatures.tsx` 模擬器卡 accent `#FBBF24` → `#A78BFA`（紫，與另一張青色 AI 卡區隔、仍在品牌色內）。
  - `DebugStories.tsx`：GPS 故事 accent `#FBBF24` → `#34D399`（綠＝「軟體 100% 完整」語意，且與青/紫/粉三故事區隔）；天線/藍牙對比條的「壞掉/斷線」條 `#fbbf24` → `#F87171`（紅＝壞掉，`MiniCharts` 結論字也吃這色，更像「壞」）。
  - `OffTopicComputex.tsx` Sparkles icon `text-amber-400` → `text-accent-violet`。
- **漣漪改成跟游標狀態同色（`components/effects/CursorTrail.tsx`）**：原本每次點擊都畫「外青＋內琥珀」雙環。改成整組同色——`Ripple` 加 `gold` 旗標，點下時用與 `CustomCursor` 相同的 `INTERACTIVE` 選擇器判定 target 是否可點擊：可點擊（游標鎖定金）→ 金漣漪；一般處（青游標）→ 純青漣漪。滑鼠/觸控皆然。
- **驗證**：`tsc --noEmit` EXIT=0；`/final` 200；curl HTML 確認新色（#34D399/#A78BFA/#F87171）在、`fbbf24`/`text-amber` 0 殘留。游標本身的鎖定金（`CustomCursor` 的環/掃描環）刻意不動。

## 最近更新（2026-06-09）：/final 文案去 AI 腔（破折號/工整句式）
- **背景**：使用者反映報告文字「太像 AI 寫的」。無專屬「去 AI 腔」skill；以人工編輯處理。
- **盤點結論**：技術文件 `content/docs/*.mdx` 是「工程師手記」風（含程式碼、實測值 RSSI −127/AP stations=0、檔名），**不是** AI 罐頭、不動；`/final` 文案前幾輪已偏口語。殘留機械痕跡只有兩類。
- **改動（純 JSX 文字，6 處）**：
  - 拔掉中文破折號 `——`（AI 第一大破綻）共 5 處：`AIAgentSection`、`DebugStories`(天線 stuck / GPS fix)、`CoreFeatures`、`OffTopicComputex` → 改句號/冒號/括號，順手換口語動詞（沾到、它包辦、插上去就能跑、要到簽名、純粹想炫一下）。
  - `CoreFeatures` 起手式「不只是報告」→「報告歸報告，這個網站其實能動手玩」；`WaterproofSection` 工整收尾「雙重保險把每個可能進水的縫都堵起來」→「兩層疊上去，能進水的縫基本都堵死了」。
- **去模板化（接續，已做）**：英文大寫 mono eyebrow（Software/Waterproofing/Gallery/Off-topic/Core/Debug/Reality）＝AI 模板網站招牌。處理：
  - 獨立區塊（Core/AIAgent/MediaWall/OffTopic/Waterproof）的英文小標**全部拿掉**，只留 icon＋中文大標（更像真人報告）；`FinalSection.tsx` 的 `eyebrow` 改為可選（`eyebrow?`）。
  - 踩坑故事是有序列的→改成切題的中文關卡計數 `第 N 關`（呼應卡關/破關主題，`StorySlide` 由 map index 帶 `idx`）。故事卡內「卡關/破關」中文標籤也去掉 `font-mono uppercase`（中文上是寬距等寬的標籤感）。
  - **打破四故事工整感**：`metaphor` 改可選；只有真的是比喻的（藍牙=同房大聲講話、相機=訊號線沒穿衣服）留斜體金句；天線/GPS 那兩句不是比喻→併回正文，讓兩張卡版型「破格」。
- **驗證**：dev `✓ Compiled`、`tsc --noEmit` EXIT=0、`/final` 200；curl HTML 確認「第 1–4 關」在、英文小標 0 殘留。
- **未做（最大實質缺口）**：`MediaWall` 兩個「待補上傳」虛線框（Demo 影片＋實物/下水照）——比任何措辭都傷觀感，待使用者給媒體後補上。

## 最近更新（2026-06-09）：前端特效升級（游標鎖定色＋倉庫描邊光環）＋手機特效/轉向適配
- **自製游標 hover 改琥珀金「鎖定」（`components/effects/CustomCursor.tsx` + `globals.css`）**：原 hover 變紫不夠顯眼 → 改 `LOCK`＝`#FBBF24`（環/點/光暈、box-shadow 加大＝「亮起來」）；resting 仍青。
  新增**一次性掃描光環**：進入 hover 用 `key={spinKey}` 重掛一個 conic-gradient 遮罩環，跑 `@keyframes cursor-sweep`（轉一圈＋淡出，像載入轉圈）；同元素內移動不會重觸發（靠 `useEffect([state])` 只在變 hover 時 +1）。
- **倉庫卡 hover 描邊光環（`globals.css` `.repo-card` + `app/(with-nav)/repos/page.tsx`）**：原本只 `hover:border` 微亮 → 加 `.repo-card::before` conic-gradient（青→白→紫）＋ border-ring 遮罩（`mask-composite:exclude`），hover 時 `repo-border-spin` 1.6s 無限轉＝一道光繞邊框。用 `@property --repo-a`（`<angle>`）才能在 keyframe 補間角度；附 `@supports not` 與 `prefers-reduced-motion` 退化。只加在 available 卡的 `<a>`。
- **手機特效平權（`components/effects/CursorTrail.tsx`）**：滑動軌跡與點擊漣漪**本來就吃 touch 事件**（手機已有）；本輪把點擊/點按漣漪升級成**雙環聲納脈衝**（外青＋內琥珀），呼應游標鎖定色。自製「准心游標」需常駐指標→觸控無法跟手（誠實限制），但軌跡＋點按脈衝給同等視覺。
- **模擬器手機轉向（`public/sim/index.html`/`style.css`/`app.js` + `app/simulator/page.tsx`）**：網頁**無法強制旋轉硬體**。做法＝① 進全螢幕時 `screen.orientation.lock('landscape')`（Android Chrome 有效；iOS Safari 不支援→靜默忽略）② 新增 `#rotate-hint` 直向全屏提示「請將手機轉為橫向」（手機旋轉動畫），`@media (pointer:coarse) and (orientation:portrait)` 才顯示、橫向自動隱藏（桌機細指標不擋）。返回列「建議橫向」改手機也看得到。
- **驗證**：`npm run build` EXIT=0、17/17。⚠ **坑**：dev server（:3000）HMR 沒吃到 `globals.css` 改動→live 量到舊 CSS（`.repo-card::before` 規則不存在）。改用 `next start` 跑**新 production build**（:3100）CDP 實測：倉庫卡 `::before` `opacity:1`/`animation:repo-border-spin`/conic✓、截圖見青紫光繞邊框＋游標琥珀鎖定環；模擬器直向 `#rotate-hint` `display:flex`、橫向 `none`。臨時 server/截圖/腳本已清。
- **待補（沿用）**：Demo 操控影片（`MediaWall` 仍佔位）、下水/組裝照。

## 最近更新（2026-06-08）：大湖/碧湖地圖縮放修正 + 遊標放進水裡
- **縮放修正（`public/sim/app.js` `frameSite`）**：大湖/碧湖水域 bbox 太小 → `getBoundsZoom` 算到 z18（>原生圖磚 17），原本被當 minZoom → 鎖死在糊掉的升取樣、無法縮放，大湖遊標還被 maxBounds 夾出畫面。
  改：起始 zoom = `clamp(fitZ, MAP_MIN_ZOOM, MAP_MAX_NATIVE_ZOOM)`（清晰且留縮放空間），minZoom 維持 15（縮出圖磚露網格襯底可接受）。四場域實測 min/max=15/19、縮放正常。
- **遊標放進水裡（自動找水）**：原本遊標預設 = 各場域 bbox/設定中心，多落在岸上。用 CDP 把**同源**圖磚合成到 canvas、校準水色（實測 `rgb(213,232,235)` 淡青、非飽和藍）、對水體做**距離轉換**取「離岸最遠的水格」＝水域中央（質心法會被碧湖湖中島帶回陸地）。
  得四場域水點 → 寫進 `sim-engine.js` SITES（遊標預設）與 `app.js` SITES `center`（`frameSite` 改 `setView(s.center)` 置中於水）：外雙溪 `25.09914,121.51578`／大湖 `25.08153,121.60556`／碧湖 `25.08094,121.58299`／基隆河 `25.07543,121.57018`。
- **驗證**：CDP 量四場域「遊標所在像素」全為水色（waterFrac=1.0）、min/max=15/19 縮放可用、0 例外；移除 TEMP debug hook（`window.__map`）後再驗 `.rov-arrow`/`.rov-ping` 仍在、0 例外。截圖四張綠箭頭都在藍水上。
- 註：本輪只動 `public/sim/*`（非 TS build 範圍），`node --check` 通過；無改 React/TS，build 狀態同前一輪綠燈。

## 最近更新（2026-06-08）：模擬器深度物理/水面空間 + 航點四場域獨立 + 文件 AI 助手自動彈出 + 手機適配
- **文件 AI 助手自動彈出**：核心頁文件卡 `CoreFeatures.tsx` href→`/docs?assistant=1`；`app/(with-nav)/docs/page.tsx` 轉址時保留參數→`/docs/<first>?assistant=1`；
  `AIChatWidget.tsx` 掛載時讀 `window.location.search`，`?assistant=1` 就自動開啟並 `history.replaceState` 清掉參數（重整/換頁不會再自動開）。用 `window.location` 不用 `useSearchParams`（免靜態頁 Suspense 邊界）。`/docs` 因此轉為 dynamic（ƒ）。
- **模擬器深度物理（`public/sim/sim-engine.js`）**：原畫面垂直流動吃「搖桿輸入」→ 放手浮起畫面不動、到 0 還能無限往上。
  改為引擎記錄「夾擠後的實際垂直速度」`st.vspeed=(depth−prevDepth)/dt`，`drawWater` 的 `flowY=clamp(−vspeed×0.7,±1)`：放手被動上浮畫面跟著動、到水面（clamp 0）vspeed 歸零自然停；`DEPTH_MAX=3.0` 擋住無限往上。
- **水面以上空間（`drawWater` 大改）**：依深度算 normalized 水平線（深 0≈46% 天空、約 0.6m 後全沒入）。水面以上畫天空漸層＋柔光太陽＋雲（`makeClouds`）＋遠岸剪影含小樹＋橘紅浮標（半露＋倒影＋桅桿）；水下層用 `ctx.clip()` 裁在水平線下、近水面畫起伏亮帶；越沒入天空層越淡出。浮水印深 0 顯示「· 水面」。
- **航點四場域各自獨立（`public/sim/app.js`）**：`sitesWP[site]` 各存各的 waypoints；`goToSite` 移除舊標記→換 `waypoints` 參照→重畫新場域標記→`window.__simSetSite(site)` 把模擬潛艇瞬移到該水域中央（同時停自動導航）。每張地圖都有自己的遊標、切回來航點還原（不再只有外雙溪有遊標）。
- **遊標改方向箭頭＋漣漪（`app.js` `rovIcon` + `style.css`）**：SVG polygon 凹底箭頭（方向不會看錯）＋外圈 `.rov-ping` 持續漣漪。**坑**：原本每筆遙測都 `setIcon` 重建元素→CSS 動畫每 100ms 被重置（看似不動）；改為標記持久化，只在箭頭⇄圓點切換才 `setIcon`，其餘只改 `.rov-arrow` 的 `transform` 旋轉。
- **驗證**：`npm run build` EXIT=0、17/17（`/docs` 轉 dynamic 正常）。Node 引擎 harness 9/9（下潛/放手浮起/水面停/上限/瞬移/drawWater 跨深度無例外）。CDP headless：AI 自動開（參數清空、textarea 在）；模擬器水面截圖有天空＋浮標、下潛 1.3m 全水下、放手浮回；地圖箭頭＋漣漪在、外雙溪 2 航點→大湖 0→切回 2、**0 例外**。手機 390px：/final 無橫向溢出、核心卡直堆、AI 自動開＋FAB 收起；觸控 `pointer:coarse` → 自製游標停用（無 `cursor-custom`、reticle `display:none`）。
- **待補**：Demo 操控影片（`MediaWall` 仍佔位）、下水/組裝照。

## 最近更新（2026-06-08）：核心功能提前 + 封面炫技背景 + 自製游標 + 拿掉編號
- **頁面重排**：`app/(with-nav)/final/page.tsx` 新順序＝封面 → **核心功能** → 卡關故事 → 防水 → AI 代理開發 → 媒體牆 → 離題。把「最重要的核心」放最前面。
- **核心功能頁（新）**：`components/final/CoreFeatures.tsx` —— 兩張並排卡：①潛水艇模擬器（`/simulator`）②文件裡的 AI 助手（`/docs`，每篇文件右下角的 AI 問答／選字追問）。
  取代舊的 `SimulatorCTA.tsx`（**已刪**）；把模擬器試玩與文件 AI 助手合在一頁，一上來就帶到網站最重要的東西。
- **封面炫技背景（僅限封面）**：`components/final/FinalCoverFX.tsx` —— 漂移青/紫光暈＋旋轉 conic 聲納掃描＋3 圈擴散環＋18 顆上升氣泡＋底部聚焦暈。
  在封面 `<section>` 內 `absolute inset-0`（父層 `overflow-hidden` 裁切），**不影響下方內容**；`useReducedMotion` 時退化為靜態漸層。封面改用自訂 `<section>`（非 `SlideSection`）讓背景能全幅填滿。
- **自製品牌游標**：`components/effects/CustomCursor.tsx` + `globals.css` 的 `.cursor-custom` 規則 —— 取代系統箭頭，顯示「聲納准心」（外環＋旋轉虛線環＋中心點，hover 變紫放大、按下縮小）。
  只在 `(pointer: fine)` 啟用（觸控不介入）；文字輸入框自動還原系統 I-beam。掛在 **with-nav layout 與首頁**（首頁同時補上 `CursorTrail`）；`/simulator` 維持系統游標。
- **拿掉編號**：`DebugStories.tsx` 的 eyebrow 由 `Debug · 01` 改成只剩 `Debug`／`Reality`（標題本來就沒帶數字）。
- **驗證**：`npm run build` EXIT=0、TS 乾淨、17/17 prerender；CDP headless（emulate pointer:fine）實測 /final：`cursor-custom` 已掛、核心卡=2、封面氣泡=18、編號已無、**0 例外**。

## 最近更新（2026-06-08）：/final 版面統一 + 圖片放大 + QR 提示行為 + 首頁單屏
- **版面統一**：新增 `components/final/FinalSection.tsx`（左文字／右媒體兩欄；無媒體自動轉單欄置中；善用 16:9，手機上下堆疊）。
  `DebugStories.tsx` 改用 FinalSection（每故事仍各自 `SlideSection`），不再是堆疊的「五格」卡；`WaterproofSection.tsx` 也改兩欄。
  四個故事都有右側媒體：01 天線／02 藍牙＝`CompareBars`、03 GPS／05 相機＝實照。
- **MiniCharts**：`SignalBars` → 通用 `CompareBars({ rows })`（白話、不寫死數字）。02 藍牙也用它（藍牙→幾乎斷線／改用手機→連線穩定）。
- **圖片可放大（lightbox）**：`Figure.tsx` 整合點圖放大 —— 用 `createPortal(document.body)` 掛 overlay（避開 `SlideSection` 祖先 transform 讓 `fixed` 失效），Esc／點背景關閉、鎖 body scroll。
  新增 `aspectClass`（等比磚塊，AI 迷因 `aspect-[4/5]`、Computex `aspect-[3/4]` → 三張／兩張等大）與 `fit`。
- **QR 提示 `QRScanHint`**：文字在上、底下大號垂直箭頭「↓」停在 QR 正上方（`bottom-[122px]`，不蓋 QR）。
  加 `hideAfter?:number`：**首頁不給＝常駐不收**；**/final 給 `500`＝滑過第一屏才淡出**（不再一捲就消失）。
- **首頁單屏**：`app/page.tsx` 內容 `py-16 gap-10`→`py-10 gap-8`；`NavGrid` 卡 `p-7`→`p-5 sm:p-6`、icon 框 `w-16`→`w-14`、`gap-4`→`gap-3`。
  首頁總高 1008→880px（1080p/864 幾乎零捲動；EMPTY_TAIL=0）。
- **「無限滾動」實測釐清（CDP headless 量測）**：`/repos`、`/simulator` 各解析度 `scrollable=0`（根本不會捲）；`/docs` 會 redirect 到真實長文；
  只有首頁在矮螢幕會因內容（NavGrid）超出而捲動、且**無空白尾段**。已把首頁收斂成單屏。若使用者仍見大量空白捲動，最可能是瀏覽器縮放（Ctrl+0 復原）。
- **驗證**：`npm run build` EXIT=0、TS 乾淨、17/17 prerender；CDP 量測 /final = 8 張可放大圖、0 破圖、lightbox 開啟全屏、箭頭行為正確。

## 最近更新（2026-06-08）：/final 期末報告改版（拆頁＋補圖＋AI 代理／防水／QR 提示）
- **封面簡化**：`FinalIntro.tsx` 砍掉三大段拗口文案，改成期中風格（Logo＋主標「只是一台潛水艇」＋副標「Electronics II · 期末報告」），捲動提示「往下看故事」→「往下滑」。
- **故事改全頁式**：`DebugStories.tsx` 由 2 欄 grid 改成「一頁一個故事」（各自 `SlideSection`）。原 6 張**砍掉 04 影片快轉、06 電量忽高忽低**，剩 4 張：01 天線／02 藍牙／03 GPS／05 相機排線。
  - **01 天線重寫**（依使用者口述，原「0Ω 電阻」技術版本作廢）：潛艇端天線本來就焊好；地面站外接天線焊接時焊壞→其實不需要外接、換新 ESP32 改用板載天線就解決。
  - **MiniCharts**：刪 `BatteryChart`；`RssiChart`→`SignalBars`（前/後對比，白話「幾乎收不到→穩定連線」，**不寫死 dBm**）。
  - 03 GPS 附 `找不到衛星.jpg`＋保留模擬器 CTA；05 相機附 `鏡頭包鋁箔.jpg`。
- **新增三段**：`WaterproofSection.tsx`（矽利康＋自融膠帶，`矽利康.jpg`）、`AIAgentSection.tsx`（軟體全由 AI 代理開發，3 張迷因＋導向 `/repos` 的 CTA）、`OffTopicComputex.tsx`（離題湊時間：RTX 3070 Ti 公版卡黃仁勳簽名 2 圖，放最末）。
- **共用元件**：`components/final/Figure.tsx`（next/image glass 圖框）；`components/nav/QRScanHint.tsx`（指向右下角 QR 的動畫箭頭＋「掃 QR Code 進網站」，`scrollY>60` 收起；掛在**首頁與 /final**）。
- **首頁**：`NavGrid.tsx` 模擬器卡「潛水艇模擬器 · 試玩」→「潛水艇模擬器」；`app/page.tsx` 加 `<QRScanHint />`。
- **媒體**：`secret/期末報告/` 8 圖複製到 `public/images/final/`（中文檔名，沿用既有慣例）。`/final` 段落順序：封面→4 故事→防水→AI 代理→模擬器 CTA→媒體牆→Computex 離題→謝謝收看。
- **驗證**：`npm run build` EXIT=0、TS 乾淨、17/17 prerender（/final 靜態）；dev server `/`、`/final`、3 張範例圖 HTTP 200。⚠ Chrome 擴充未連線，瀏覽器目視未做。
- **待補**：Demo 操控影片（`MediaWall` 仍佔位）、下水/組裝照。

## 最近更新（2026-06-08 深夜）：模擬器「戳魚」彩蛋
- **`public/sim/sim-engine.js`**：水下 canvas 的魚現在可點。戳到魚 → 該魚朝反方向竄逃（boost 加速）+ 金光閃爍（flash），
  並爆出 14 顆微粒 + 1 圈漣漪 + 1 句白話浮字（`FISH_QUIPS` 池）。滑鼠滑過魚 → 游標變手指（提示可戳）。
  **連抓 5 隻**觸發里程碑：全魚金閃 + 30 微粒大爆 + 大漣漪 + 「🎉 連抓 N 隻！潛艇船長認證」。
- 全部畫在同一張 `#sim-cam` 上（新增 `CAM.parts/ripples/texts/catches`、`drawFx()`、`pokeFishAt()`、
  `onCamClick/onCamMove`），**不碰 app.js、零新增依賴**。命中測試用 normalized 座標 + `getBoundingClientRect`。
  空水域點擊無回饋（保留「找到才有」的彩蛋感）。`.touch-ctl` 中央 `pointer-events:none`，點擊能穿透到 canvas。
- **驗證**：`node --check` 過；輕量 DOM/canvas stub 跑真引擎 9 項斷言全綠（命中生成特效、游標提示、里程碑、100 幀+點擊無例外）。

## 最近更新（2026-06-08 晚）：文件重新同步 + 專案管理改預設
- **技術文件 7 篇全部由 `secret/文件/*.md`（最新權威來源，6/7 更新）重新產生 `content/docs/*.mdx`**：
  以小腳本帶入來源 body、補回 frontmatter `category`（系統總覽／硬體與機構×2／電子與軟體×3／製造與列印），
  描述也改用來源最新版（例：04→「ESP-NOW、Wi-Fi、WebSocket」、05→「OV5640、串流模式、RSSI 降級」）。
  01 已不再提通訊距離（來源移除），與期末「不提規格」一致。
- **來源改用 Markdown blockquote（`>`）做提示**：對應強化 `app/globals.css` 的 `.mdx-content blockquote`
  （青邊圓角、淡青底、提高可讀性、`strong` 上色），不再逐句轉 `<Callout>`。
- **MDX 雷點修正**：prose 裸 `<40ms`（05）、`ly<0`（06）以行內 `` `code` `` 包起，build 才過。
- **專案管理改回預設**：刪除 `secret/plan/`（自訂計畫檔）；改用 `CLAUDE.md`（總覽）＋ `CONTEXT.md`（交接）＋
  `tasks/todo.md`/`lessons.md`。CLAUDE.md 的「細節文件」表已換成 `secret/` 內部資料表，`secret/doc`→`secret/文件` 全數對齊。
- **模擬器水下動態**：搖桿前進/轉向→微粒由中心放射並拉拖尾、場景水平平移；深度升降→微粒/氣泡上下串動；
  光束（水面陽光參照）改成只在轉向時掃動。`public/sim/sim-engine.js`，jsdom 回歸 13/13。
- **驗證**：`npm run build` EXIT=0、17 頁全 prerender（含 7 篇 docs）。

## 最近更新（2026-06-08）：模擬器 + 期末報告
- **`/simulator` 潛水艇模擬器（高擬真、離線）**：沿用地面站真實手機儀表板（複製到 `public/sim/`，
  不含 `sw.js`、路徑改相對、移除 PWA/SW），加 `public/sim/sim-engine.js` 假潛艇引擎
  （`WebSocket` shim 攔控制 → 物理迴圈 → `window.__mockTelemetry`；攔 `/api/waypoints`；canvas 假水下影像）。
  頁面 `app/simulator/page.tsx` 走**頂層路由**（非 with-nav）、全視窗 iframe、纖細返回列。
- **`/final` 期末報告**：取代 Coming Soon，`components/final/*`。定位「真的做出來＋一路硬仗」，
  **完全不提規格**（使用者定案，連 200m 不提）。6 張白話「卡關→破關」故事卡（含 GPS 收不到衛星誠實面對 +
  模擬器演示連結）、內嵌 RSSI/電量手刻 SVG 小圖、模擬器 CTA、媒體牆（影片/照片待補佔位）。
- **導覽**：`NavGrid` 第 5 顆寬卡、`TopNav` 加「模擬器」。
- **驗證**：`npm run build` 通過；jsdom 整合測試 13/13×3 穩定；端點 200。⚠ 真實瀏覽器目視未做（Chrome 擴充未連線）→
  建議手測 `localhost:3000/simulator`。
- **待補**：Demo 影片、下水/組裝照、迷因彩蛋內容（使用者「看心情」）。
- **可選**：期中 `MissionScene.tsx` 仍標「200m 無線距離」，使用者認為不實際 → 待點頭再改。
- **踩坑**：模擬器若不移除 `sw.js`，SW scope `/` 會劫持整站快取；測試時 app.js 每 40ms controlTick
  會用中性 0 洗掉外部注入（真實使用走 controlTick 才正確）。

## 目前狀態（2026-05-31）
- 首頁 / 期中 / 期末 / 文件 / 倉庫 五區塊完成，`npm run build` 通過（17 頁、無 TS 錯誤）。
- AI 聊天 widget（OpenRouter 代理，`/api/chat`）、滑鼠軌跡特效、3D 模型（HullViewer）皆已上線。
- **技術文件（7 篇）已依 `secret/文件/*.md` 最新版同步重寫並易讀化**：每節加白話導讀、關鍵警告改用 `Callout` 提示框、精簡冗長表格、修中英混雜錯字、移除版本號頁尾。
- **倉庫頁定案三張卡**：`rov-web`、`3D-printing`、`rov-firmware`（皆 `available`）；移除 `rov-groundstation`（原 coming-soon 模糊卡），grid 改 `lg:grid-cols-3`。
- 本次新增 `components/docs/Callout.tsx`（純色提示框、無圖示相依），並接進 docs 頁的 MDX `components`。
- **文件導覽全面升級**：側邊欄依 frontmatter `category` 分四組；右側「本頁目錄」(`TableOfContents`，IntersectionObserver 捲動高亮)；標題錨點 id（`lib/toc.ts` 的 `rehypeHeadingIds`）；頁尾上一篇/下一篇（`DocPager`）。目錄與錨點 id 共用 `lib/toc.ts` 同一 slugger，已 runtime 驗證 `href="#…"` 與 `id="…"` 完全一致。

## 關鍵約定（容易踩坑）
1. **文件來源關係**：權威來源 `secret/文件/*.md`（gitignore）→ 網站 `content/docs/*.mdx`。改文件先改來源再同步（並補 frontmatter `category`）。
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

`npm run build` 通過（EXIT=0），並以 `npm start` runtime 驗證導覽功能。尚未 commit（等使用者指示）。
