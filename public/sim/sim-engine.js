'use strict';
// =============================================================================
//  潛水艇模擬器引擎（離線 / 純前端）
//  - 直接驅動「真實」手機儀表板（index.html + app.js + style.css，原樣沿用）。
//  - app.js 的網路層被本檔接管：
//      · WebSocket  → FakeWS：攔 app.js 上行控制 {t:'c',lx,ly,ry,b,auto,ts,ph}，
//                     物理迴圈算出遙測後呼叫 app.js 內建的 window.__mockTelemetry()。
//      · fetch '/api/waypoints' → 收下航點供自動導航演示。
//  - 影像渲染與玩法在 sim-cam.js（讀 window.__SIM 橋）、音效在 sim-audio.js；
//    本檔的 rAF 主迴圈每幀呼叫它們（單一迴圈，不各開各的）。
//  - 載入順序：sim-engine → sim-audio → sim-cam → app.js（本檔先裝好 shim）。
// =============================================================================

(function () {
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  // ---------- 假潛艇狀態 ----------
  // 四個目標水域的「水域中央」預設座標（與 app.js SITES.center 對齊）。
  // 切場域時把模擬潛艇瞬移到對應水域中央 → 每張地圖各自有自己的遊標。
  var SITES = {
    waishuangxi: { lat: 25.09914, lng: 121.51578 },   // 外雙溪河道
    dahu:        { lat: 25.08153, lng: 121.60556 },   // 大湖（大湖公園湖面）
    bihu:        { lat: 25.08094, lng: 121.58299 },   // 碧湖（碧湖公園湖面）
    keelung:     { lat: 25.07543, lng: 121.57018 },   // 基隆河河道
  };
  var DEPTH_MAX = 3.0;                                                    // 池測深度上限（公尺）
  var HOME = { lat: SITES.waishuangxi.lat, lng: SITES.waishuangxi.lng };  // RSSI 衰減基準＝目前場域中央
  var st = {
    depth: 0, vspeed: 0, heading: 90, lat: HOME.lat, lng: HOME.lng,
    bat: 96, power: 0, rssi: -42, streamMode: 0, ledManual: false, estop: false,
    ml: 0, mr: 0, mv: 0, magX: 0, magY: 0, photoSeq: 0,
  };
  var ctrl = { lx: 0, ly: 0, ry: 0, b: 0, auto: 0, ph: 0 };
  var prevB = 0, pendingPhotoAck = false;
  var simWaypoints = [], navIdx = 0xFF, navDist = 0;

  // 平滑後的有效輸入（含鍵盤覆蓋、一階慣性）：sim-cam 的畫面流動也吃這組 → 鬆手滑行。
  var ax = { fwd: 0, turn: 0, vert: 0 };

  // app.js 切換場域時呼叫：潛艇瞬移到該水域中央、浮回水面、清掉自動導航航線。
  window.__simSetSite = function (key) {
    var s = SITES[key];
    if (!s) return;
    st.lat = s.lat; st.lng = s.lng;
    st.depth = 0; st.vspeed = 0;
    HOME.lat = s.lat; HOME.lng = s.lng;
    simWaypoints = []; navIdx = 0xFF; navDist = 0; ctrl.auto = 0;
    var hooks = (window.__SIM && window.__SIM.onSite) || [];   // 通知影像層重生場景（垃圾/生物）
    for (var i = 0; i < hooks.length; i++) { try { hooks[i](key); } catch (_) {} }
  };

  // 硬鐵平移 + 軟鐵橢圓：磁場 = offset + r·(cos,sin(heading))。
  // → 儀表板 🧭 12 段校準轉一圈後能正確還原 offset/scale，校準才「玩得起來」。
  var MAG = { offX: 0.176, offY: -0.132, rX: 0.31, rY: 0.245 };

  // ---------- 1) WebSocket shim ----------
  function FakeWS() { var self = this; this.readyState = 1; setTimeout(function () { if (self.onopen) self.onopen({}); }, 0); }
  FakeWS.CONNECTING = 0; FakeWS.OPEN = 1; FakeWS.CLOSING = 2; FakeWS.CLOSED = 3;
  FakeWS.prototype.send = function (data) {
    var m; try { m = JSON.parse(data); } catch (_) { return; }
    if (m && m.t === 'c') {
      ctrl.lx = m.lx | 0; ctrl.ly = m.ly | 0; ctrl.ry = m.ry | 0;
      ctrl.b = m.b | 0; ctrl.auto = m.auto | 0; ctrl.ph = m.ph | 0;
    }
  };
  FakeWS.prototype.close = function () { this.readyState = 3; if (this.onclose) this.onclose({}); };
  FakeWS.prototype.addEventListener = function () {};
  window.WebSocket = FakeWS;

  function push(d) { if (typeof window.__mockTelemetry === 'function') window.__mockTelemetry(d); }

  // ---------- 2) fetch 攔截：航點上傳 ----------
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (input, init) {
    var url = (typeof input === 'string') ? input : (input && input.url) || '';
    if (url.indexOf('/api/waypoints') !== -1) {
      var n = 0;
      try {
        var body = JSON.parse((init && init.body) || '{}');
        var wps = body.waypoints || [];
        simWaypoints = wps.map(function (w) { return { lat: w.lat, lng: w.lng }; });
        navIdx = simWaypoints.length ? navIdx : 0xFF;
        n = wps.length;
      } catch (_) {}
      return Promise.resolve(new Response(JSON.stringify({ ok: true, count: n }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }));
    }
    return realFetch ? realFetch(input, init) : Promise.reject(new Error('fetch unavailable'));
  };

  // ---------- 3) 鍵盤駕駛（桌機適配；手機維持觸控） ----------
  // W/S 前後、A/D 與 ←/→ 轉向、↑/↓ 升降；L 燈、P 拍照、R 錄影。
  // 任一移動鍵按住時鍵盤覆蓋觸控軸；L/P/R 對隱藏虛擬鈕發合成 PointerEvent →
  // 完整走 app.js 既有 pulse/photoSeq 邏輯（不另開旁路、行為與按鈕一致）。
  var kb = { f: 0, b: 0, tl: 0, tr: 0, up: 0, down: 0, used: false };
  var KEYMAP = {
    KeyW: 'f', KeyS: 'b',
    KeyA: 'tl', ArrowLeft: 'tl', KeyD: 'tr', ArrowRight: 'tr',
    ArrowUp: 'up', ArrowDown: 'down',
  };
  var TAPKEY = { KeyL: 'tb-light', KeyP: 'tb-photo', KeyR: 'tb-rec' };

  function kbActive() { return !!(kb.f || kb.b || kb.tl || kb.tr || kb.up || kb.down); }

  function tapBtn(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var o = { bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse' };
    try {
      el.dispatchEvent(new PointerEvent('pointerdown', o));
      setTimeout(function () { el.dispatchEvent(new PointerEvent('pointerup', o)); }, 50);
    } catch (_) {}
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;   // 不劫持瀏覽器快捷鍵（如 Ctrl+R）
    var tap = TAPKEY[e.code];
    if (tap) {
      if (!e.repeat) tapBtn(tap);
      kb.used = true; e.preventDefault(); return;
    }
    var f = KEYMAP[e.code];
    if (!f) return;
    kb[f] = 1; kb.used = true;
    e.preventDefault();                                // 擋掉方向鍵捲動 iframe/頁面
  }
  function onKeyUp(e) { var f = KEYMAP[e.code]; if (f) { kb[f] = 0; e.preventDefault(); } }
  function kbClear() { kb.f = kb.b = kb.tl = kb.tr = kb.up = kb.down = 0; }   // 失焦防卡鍵
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', kbClear);

  // ---------- 幾何 ----------
  function haversine(a, b) {
    var R = 6371000, t = Math.PI / 180;
    var dLat = (b.lat - a.lat) * t, dLng = (b.lng - a.lng) * t;
    var s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function bearing(a, b) {
    var t = Math.PI / 180, p1 = a.lat * t, p2 = b.lat * t, dL = (b.lng - a.lng) * t;
    var y = Math.sin(dL) * Math.cos(p2);
    var x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dL);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function moveBy(distM, hdg) {
    var R = 6378137, rad = hdg * Math.PI / 180;
    st.lat += (distM * Math.cos(rad) / R) * 180 / Math.PI;
    st.lng += (distM * Math.sin(rad) / (R * Math.cos(st.lat * Math.PI / 180))) * 180 / Math.PI;
  }

  // ---------- 4) 物理（鏡像 GS 差速混控 + ROV 直推深度）----------
  function stepPhysics(dt) {
    // 目標輸入：鍵盤按住時覆蓋（桌機）；否則吃 app.js 上行的搖桿/手把值
    var tF, tT, tV;
    if (kbActive()) {
      tF = kb.f - kb.b; tT = kb.tr - kb.tl; tV = kb.up - kb.down;
    } else {
      tF = -ctrl.ly / 32767; tT = ctrl.lx / 32767; tV = -ctrl.ry / 32767;   // 上推為前進 / 上升
    }
    // 一階慣性（水的阻尼感）：推/放都漸變 → 鬆手滑行一小段才停
    var k = 1 - Math.exp(-dt / 0.22);
    ax.fwd += (tF - ax.fwd) * k;
    ax.turn += (tT - ax.turn) * k;
    ax.vert += (tV - ax.vert) * k;
    if (Math.abs(ax.fwd) < 0.004) ax.fwd = 0;
    if (Math.abs(ax.turn) < 0.004) ax.turn = 0;
    if (Math.abs(ax.vert) < 0.004) ax.vert = 0;

    var left = clamp(ax.fwd + ax.turn, -1, 1), right = clamp(ax.fwd - ax.turn, -1, 1);
    st.ml = Math.round(left * 1023); st.mr = Math.round(right * 1023);
    st.mv = Math.round(clamp(ax.vert, -1, 1) * 1023);

    var b = ctrl.b;                                       // 上升邊緣 → toggle（同 GS）
    if ((b & 8) && !(prevB & 8)) st.ledManual = !st.ledManual;     // bit3 = Y（燈）
    if ((b & 32) && !(prevB & 32)) st.streamMode = st.streamMode ? 0 : 1;  // bit5 = RB（錄影）
    prevB = b;
    if (ctrl.ph !== st.photoSeq) { st.photoSeq = ctrl.ph; pendingPhotoAck = true; }

    // 深度：向下推力加深，被動浮力恆向上（鬆手會慢慢浮回水面）。
    // vspeed＝夾擠後的「實際」垂直速度（公尺/秒，>0＝下潛）；到水面/底會真的歸零。
    var prevDepth = st.depth;
    var ddepth = (-ax.vert) * 0.9 - 0.30;
    st.depth = clamp(st.depth + ddepth * dt, 0, DEPTH_MAX);
    st.vspeed = dt > 0 ? (st.depth - prevDepth) / dt : 0;

    // 航向：左右差速 → 轉向
    st.heading = (st.heading + (left - right) * 70 * dt + 360) % 360;

    // 位置：自動導航沿航線巡航；否則依前進推力沿航向移動
    if (ctrl.auto && simWaypoints.length) {
      if (navIdx === 0xFF || navIdx >= simWaypoints.length) navIdx = 0;
      var wp = simWaypoints[navIdx];
      navDist = haversine(st, wp);
      var diff = ((bearing(st, wp) - st.heading + 540) % 360) - 180;
      st.heading = (st.heading + clamp(diff, -120 * dt, 120 * dt) + 360) % 360;
      moveBy(0.7 * dt, st.heading);
      if (navDist < 4) navIdx = (navIdx + 1) % simWaypoints.length;   // 連續巡航
    } else {
      navIdx = 0xFF; navDist = 0;
      moveBy(ax.fwd * 0.6 * dt, st.heading);
    }

    // 電源：耗能∝油門總量；電量緩降（演示「負載下仍穩定」的 OCV 補償精神）
    var effort = (Math.abs(left) + Math.abs(right) + Math.abs(ax.vert)) / 3;
    st.power = (0.4 + effort * 7.5) * 11.6;
    st.bat = clamp(st.bat - effort * dt * 0.05 - dt * 0.002, 0, 100);

    // RSSI：越深、離起點越遠越弱 → 觸發儀表板既有的「訊號弱 / 極弱」警示
    var v = -42 - st.depth * 9 - haversine(st, HOME) * 0.25 + Math.sin(performance.now() / 700) * 1.5;
    st.rssi = Math.round(clamp(v, -110, -25));

    // 合成磁場（供羅盤校準）
    var a = st.heading * Math.PI / 180;
    st.magX = MAG.offX + MAG.rX * Math.cos(a);
    st.magY = MAG.offY + MAG.rY * Math.sin(a);
  }

  function pushTelemetry() {
    push({
      depth: st.depth, bat: Math.round(st.bat), power: st.power, rssi: st.rssi, heading: st.heading,
      ml: st.ml, mr: st.mr, mv: st.mv, led: st.ledManual,   // 燈＝純手動 → 深處開燈才亮（玩法：大燈有用）
      streamMode: st.streamMode, estop: st.estop, lat: st.lat, lng: st.lng,
      magX: st.magX, magY: st.magY, navWpIdx: navIdx, navDistM: navDist, photoAck: pendingPhotoAck,
    });
    pendingPhotoAck = false;
  }

  // ---------- 5) 狀態橋：渲染層（sim-cam）/ 音效層（sim-audio）讀這組 ----------
  window.__SIM = {
    st: st, ctrl: ctrl, ax: ax, kb: kb,
    DEPTH_MAX: DEPTH_MAX,
    onSite: [],          // 切場域回呼（sim-cam 註冊：重生垃圾/生物）
    step: stepPhysics,   // 測試鉤子：分頁隱藏（rAF 凍結）時仍可手動推進物理驗證
  };

  // ---------- 主迴圈（單一 rAF：物理 → 遙測 → 音效 → 影像）----------
  var lastT = 0, lastTelem = 0;
  function loop(now) {
    var dt = lastT ? clamp((now - lastT) / 1000, 0, 0.1) : 0.05; lastT = now;
    stepPhysics(dt);
    if (now - lastTelem > 100) { pushTelemetry(); lastTelem = now; }   // ~10Hz 遙測
    if (window.__SIM_AUDIO) window.__SIM_AUDIO.tick(dt);
    if (window.__SIM_CAM) window.__SIM_CAM.draw(now);
    requestAnimationFrame(loop);
  }

  // ---------- 啟動（在 app.js boot 之後）----------
  function start() {
    requestAnimationFrame(loop);
    try {
      console.log('%c🛟 只是一台潛水艇 · 模擬器', 'color:#22d3ee;font-weight:bold;font-size:14px;');
      console.log('%c下水前的最後一句話：「應該不會漏水吧。」', 'color:#7c93b3;');
    } catch (_) {}
  }
  // app.js 於本檔之後同步執行 boot()；setTimeout(0) 確保迴圈在 app.js 初始化之後跑。
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
