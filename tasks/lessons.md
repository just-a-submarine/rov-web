# Lessons（踩過的坑 / 使用者修正）

## 內容：以使用者口述為準，勝過 secret 來源文件
- `secret/期末報告/*.md` 的「天線」技術版本（0Ω 電阻 stray stub → 補焊、RSSI −71→−27）與使用者真實經歷不符。
- 使用者澄清：真相是「地面站外接天線焊接時焊壞→其實不需要外接、換新 ESP32 改用板載天線就解決」。
- **教訓**：來源 `.md` 是寫報告的參考，不是最終事實；牽涉個人經歷/數字時以使用者口述為準，敘事改變後**不要硬套舊數字**，改白話、誠實（符合「報告誠實面對限制」偏好）。

## 樣式：Tailwind 色 token 只有 accent-cyan / accent-violet
- `app/globals.css` 的 `@theme inline` 只定義 `--color-accent-cyan`、`--color-accent-violet`。
- 沒有 `accent-amber`/`accent-green` 等；寫了 `text-accent-amber` 不會報錯但**完全沒效果**（class 不存在）。
- **教訓**：非青/紫色用標準 Tailwind 色（如 `amber-400`、`emerald-400`）或直接 inline hex（專案故事卡 accent 多用 hex）。

## 圖片：沿用 `/images/中文檔名` 慣例，next/image 帶實際尺寸
- 專案既有 `/images/實物照片.jpg` 用 next/image，中文檔名可正常服務（dev/build 皆 200）。
- 手機直拍多為直幅，next/image `w-full` 會霸版；用 `Figure.tsx` 統一圖框並收窄 `widthClass`。
- 取尺寸：PowerShell `System.Drawing.Image` 讀 Width/Height 帶進 next/image，避免 CLS/變形。

## 版面 bug 先量測再下結論（Chrome 擴充壞掉時用 CDP headless）
- 使用者報「首頁/文件/倉庫/模擬器無限滾動」，直接讀程式碼找不到共同原因。
- 改用 headless Chrome + CDP（Node 22 內建 `WebSocket`，`spawn` chrome `--headless=new --remote-debugging-port`，`Emulation.setDeviceMetricsOverride` 設多種解析度，`Runtime.evaluate` 量 `documentElement.scrollHeight - innerHeight` 與「最後一個有內容元素的底邊」算空白尾段）。
- 結果：`/repos`、`/simulator` 各解析度 `scrollable=0`（**根本不會捲**）、`/docs` 是 redirect 到真實長文、首頁只是內容超出矮螢幕且無空白尾段。
- **教訓**：版面/捲動類回報先量測（scrollHeight、各元素 boundingRect 底邊、多解析度），用數據回覆「哪頁真有問題、哪頁沒有」，不要憑空猜或盲改。常見錯覺來源：瀏覽器縮放。

## fixed/overlay 在有 transform 的祖先底下會失效 → 用 portal
- framer-motion 動畫元素（如 `SlideSection` 的 motion.div）會留下 `transform`，使其後代 `position:fixed` 改以該祖先為定位基準 → 全屏 overlay/lightbox 會跑掉或被裁。
- **教訓**：全屏覆蓋層用 `createPortal(node, document.body)` 掛到 body（需 `mounted` guard 避免 SSR 取不到 `document`），徹底脫離 transform 祖先。

## 驗證：Chrome 擴充常未連線
- 本機 Claude-in-Chrome 擴充常未連線，無法瀏覽器目視。
- 替代：`npm run build`（/final 靜態 prerender＝server render 無誤）＋ dev server `Invoke-WebRequest` 對頁面與圖片做 HTTP 200 煙霧測試。
- 進階：CDP headless 可截圖（`Page.captureScreenshot`）＋ 合成輸入（`Input.dispatchMouseEvent` 拖搖桿）＋ 點 DOM（`Runtime.evaluate` `.click()`）做行為驗證；Chrome 路徑給 spawn 用**正斜線** `C:/Program Files/.../chrome.exe`（heredoc 內反斜線會被吃掉導致 ENOENT）。

## 模擬器：畫面運動感要吃「實際速度」，不是吃「輸入」
- 原 `drawWater` 的垂直流動 `flowY` 直接吃搖桿 `vert` → 放開搖桿（被動上浮）畫面不動、深度 clamp 到 0 後還能無限往上捲。
- 修法：引擎存「夾擠後的實際垂直速度」`st.vspeed=(depth−prevDepth)/dt`，畫面流動吃 `−vspeed`。到水面/底速度自然為 0 → 畫面停。
- **教訓**：模擬器的視覺位移要綁「狀態的實際變化量」而非「控制輸入」，邊界（clamp）才會連視覺一起正確停住。`vspeed` 是引擎內部用（`drawWater` 同 closure 直接讀 `st.vspeed`），**不必塞進遙測**。

## Leaflet divIcon：每幀 setIcon 會重置 CSS 動畫
- ROV 遊標原本每筆遙測（~10Hz）`marker.setIcon(...)` 重建整個 DOM → 外圈漣漪/脈動的 CSS animation 每 100ms 從頭開始，看起來「不會動」。
- 修法：標記持久化，只在「箭頭⇄圓點」型態切換時 `setIcon`；其餘只 `getElement().querySelector('.rov-arrow').style.transform = rotate(...)`，動畫不被打斷、旋轉還吃到 transition。
- **教訓**：高頻更新的 Leaflet 標記別每幀重建 icon；要動畫就保留元素、只改需要變的屬性。

## 用遙測驗證引擎要留意 push 節流（~10Hz）
- `sim-engine` 每 >100ms 才 `pushTelemetry` 一次；Node harness 每步 +100ms 時，單步常讀到「上一次」的值（看似沒更新）。
- **教訓**：拿遙測當斷言來源時，狀態改變後要多跑幾幀（≥600ms）再讀，或直接斷言「連兩幀不變」來證明已穩定。
- 衍生：要「驗證遊標位置」別用 `marker.setLatLng` 再截圖——引擎每 100ms 會用 `st.lat/lng` 覆蓋回去。要嘛改真正的狀態來源（SITES 座標重載），要嘛斷言當下幀。

## 離線圖磚：fit-zoom 可能超過原生 zoom → 縮放鎖死
- `frameSite` 原本把 `getBoundsZoom(bounds)` 當 minZoom。小水域（大湖/碧湖）bbox 很小 → fit zoom 算到 18，但圖磚原生只到 17（`MAP_MAX_NATIVE_ZOOM`）。
- 後果：minZoom=18、maxZoom=19 → 整張圖永遠 z17 升取樣（糊）、又無法往外縮；maxBounds 夾擠還會把中心推走、遊標掉出畫面。
- **教訓**：用離線/有限圖磚時，起始 zoom 要 `clamp(fitZ, MIN, MAX_NATIVE)`（保證有清晰原生層＋留縮放空間），minZoom 放回全域下限讓使用者能縮放（縮出範圍露網格襯底可接受）。

## 驗證 CSS 改動：dev server HMR 可能漏吃 globals.css → 用 production build 驗
- 改 `app/globals.css`（加 `.repo-card::before`、`@keyframes`）後，CDP 量 live :3000 發現規則**根本不存在**（`getComputedStyle(el,'::before')` 全是預設值、`document.styleSheets` 找不到 `.repo-card`）。
- 一度誤判「Lightning CSS（Tailwind v4 引擎）把規則丟掉」。實際是 **dev server（長駐 `next dev`）沒熱更新 `globals.css`**（Windows 檔案監看偶爾漏）；dev CSS chunk `app_globals_css_*.single.css` 還是舊的。
- 證明法：grep `.next/static/chunks/*.css`（**production build** 產物）有完整 `@property --repo-a`、`.repo-card:hover::before{...conic-gradient...}` → 規則本身合法。再 `next start -p 3100` 跑新 build，CDP 量到 `opacity:1`/`animation:repo-border-spin`/conic✓、截圖見效果。
- **教訓**：CSS 沒生效先別怪編譯器。先 `npm run build` 看 `.next` 產物有沒有那條規則；要 live 驗證就對「新 production build（`next start`）」量，別信可能 stale 的 dev server。CDP 驗 CSS：讀 `getComputedStyle(el,'::before')` 的 opacity/animationName/backgroundImage，或掃 `document.styleSheets[].cssRules` 找選擇器，比截圖更明確。

## conic 描邊「光繞一圈」要 `@property` 才能補間角度
- `.repo-card::before` 用 `conic-gradient(from var(--a), …)` ＋ border-ring 遮罩（`-webkit-mask`+`mask-composite:exclude`，padding 當邊框寬）做旋轉描邊光。
- 直接 `@keyframes { to { --a:360deg } }` 改 CSS 自訂變數，**沒宣告 `@property` 的話不會補間**（自訂變數預設不是動畫型別）→ 必須 `@property --a { syntax:"<angle>"; inherits:false; initial-value:0deg }`。
- 一次性掃描環（游標 hover）用 React `key={spinKey}`（進 hover 時 +1）重掛元素來重播 CSS 動畫；別每幀重觸發（同 Leaflet setIcon 重置動畫的坑）。
- **教訓**：要動畫 CSS 自訂變數先 `@property` 宣告型別；附 `@supports not(...)` 與 `prefers-reduced-motion` 退化。

## 網頁無法強制旋轉手機硬體 → lock（限 Android 全螢幕）＋直向提示
- 需求「模擬器自動把手機打橫」：**web 沒有強制旋轉裝置的 API**。`screen.orientation.lock('landscape')` 只在**全螢幕**且 **Android Chrome** 有效；**iOS Safari 完全不支援**。
- 做法：① 進全螢幕後 best-effort `lock('landscape')`（用 `.then`/`try` 包，失敗靜默）② 直向時蓋全屏提示「請轉橫向」，`@media (pointer:coarse) and (orientation:portrait)` 才顯示（桌機細指標不擋、橫向自動隱藏）。
- 觸控特效平權：滑鼠軌跡/漣漪用 `touchmove/touchstart` 就能跟手；但**自製常駐准心游標無法對應手指**（無 hover 指標）→ 誠實說明，改用軌跡＋點按脈衝給同等效果。
- **教訓**：碰到「自動轉向/強制全螢幕」先講清楚平台限制（尤其 iOS），用「能鎖就鎖＋轉向提示」當務實解，不要假裝做得到。

## 中文文案「去 AI 腔」：先盤點再手改，破折號 `——` 是第一破綻
- 沒有專屬 skill 能「一鍵去 AI」；最相關的 `internal-comms`/`doc-coauthoring` 是「從零寫某格式」的流程，不是改腔調。靠人工編輯判斷。
- **先盤點再下手**：grep `——`、「不只是/不僅/而且/打造/賦能/無縫/全方位…」等罐頭詞。本專案掃完發現技術文件（含程式碼、實測數字、檔名）其實很真實、不該動；別一律狂改。
- **中文 AI 三大機械痕跡**：① 破折號 `——` 當插入語（真人少用，改句號/冒號/括號）② 「不只是 X（而是 Y）」「不僅…而且…」工整起手式 ③ 每段長度均勻、收尾太完整工整。
- 改法：拔機械痕跡、換口語動詞（沾到/包辦/插上去就能跑/堵死了）、刻意讓句長參差；但**保留原本的口語味**，別改成另一種乾淨無菌的 AI 腔。
- **更深層的「AI 網站感」是結構不是用詞**：每區「英文大寫 eyebrow ＋中文 H2」雙標題、所有卡片同一模板、rule-of-three 並排——這些比措辭更像模板網站，但屬設計決定，要先問使用者再動。
  - 實際做法（已驗證有效）：① 獨立區塊的英文小標直接拿掉，只留 icon＋中文標題；有序列的（如踩坑故事）才改成切題的中文計數（`第 N 關`）。② 中文標籤別套 `font-mono uppercase tracking-widest`（中文會變寬距等寬，反而像 AI 標籤）。③ 打破「每張卡都長一樣」：把「每張都有一句斜體比喻」這種重複裝置改成可選，只留真的是比喻的，其餘併回正文，讓一兩張版型破格＝刻意的人味。
- **教訓**：「太像 AI」要分兩層處理——用詞（可直接改）vs 結構/版型（先確認）；且老實說沒有魔法 skill，符合「誠實面對限制」偏好。

## 分頁 hidden 時 rAF 整個凍結：先查 visibilityState 再 debug「畫面不動」
- 用 Claude-in-Chrome 驗證模擬器時，場景凍住、物理不前進、`hits()` 空——一路懷疑 draw 拋例外/迴圈死掉，最後發現只是使用者的 Chrome 視窗被蓋住：`document.visibilityState === 'hidden'` → **瀏覽器把 rAF 完全停掉**（標準節流，視窗回前景就恢復）。
- 更迷惑的是：**截圖工具會短暫喚醒分頁渲染 1-2 幀** → 截圖「有畫面但每張都一樣」的假凍結；遙測 HUD 也因此偶爾更新。
- **教訓**：瀏覽器驗證動畫/迴圈前先讀 `document.visibilityState`；hidden 時別 debug rAF。解法＝在 bridge 暴露 `step(dt)` 測試鉤子（`__SIM.step`），手動推進物理＋手動呼叫 `draw(t)`，完全不依賴 rAF/可見性。`setInterval` 在 hidden 分頁也會被節流到 ~1Hz（依賴 25Hz `controlTick` 的脈衝鍵在 hidden 下會漏，僅影響測試）。

## 時間可注入的迴圈：dt 必須雙向 clamp（負 dt 會炸 canvas）
- 測試鉤子手動餵時間，把 `CAM.lastT` 推到未來後下一次真實 rAF 的 `now` 反而比較小 → `dt = min(0.05, Δt)` 沒有下限 → **dt = -50s** → 漣漪半徑算成負數 → `ctx.arc` 直接 throw `IndexSizeError`、rAF 鏈死掉。
- **教訓**：凡是 `now - lastT` 算 dt 的迴圈一律 `clamp(dt, 0, MAX)`；倒數計時顯示（如 REC 秒數）也 `Math.max(0, …)`。canvas 的 `arc/ellipse` 對負半徑是 throw 不是忽略，一個負值就能殺死整條 rAF 鏈。

## claude-in-chrome javascript_tool：不支援 top-level await
- 文件寫 REPL 語意支援 top-level await，實測（含 `const` 宣告的多行腳本）會 `SyntaxError: await is only valid in async functions`。
- **教訓**：要等待就拆成多個 batch action（中間夾 `computer.wait`），或用同步迴圈；別在單一 javascript_exec 裡 `await new Promise(...)`。

## 自動找「水域中央」：同源 canvas + 距離轉換（別用質心）
- 需求：把模擬遊標放在各場域水面中央。人工挑座標易錯、易落在岸上。
- 做法：地圖圖磚與頁面**同源**（localhost）→ 可把可見 `img.leaflet-tile` 依 `getBoundingClientRect` 合成到 canvas、`getImageData` 讀像素；用 `map.containerPointToLatLng` 反推經緯。
- 水色要**先校準**（直方圖 + 已知湖面取樣）：本專案圖磚水色是淡青 `rgb(213,232,235)`（近白、R 明顯低於 G≈B），不是飽和藍——硬猜「B 大就是水」會整個失準。判別式：`R<G-8 && B>=G-6 && B>R+12 && B>170`。
- 取點用**距離轉換**（多源 BFS：陸地當 source，水格取離岸最遠者）＝水域最深處；**質心法會被湖中島（如碧湖）帶回陸地**。
- **教訓**：「放在某區域中央」這種需求，距離轉換（pole of inaccessibility）比質心穩；顏色判別一定要先實測校準，不要憑經驗值。
