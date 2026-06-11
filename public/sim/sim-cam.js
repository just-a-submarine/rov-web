'use strict';
// =============================================================================
//  模擬器影像層（sim-cam.js）— 自 sim-engine 拆出的世界渲染＋生態＋玩法
//  - 讀 window.__SIM（sim-engine 的狀態橋）；由 engine 的 rAF 主迴圈呼叫 draw(now)
//  - 世界：天空/水體/河床（沙底、卵石、水草、沉木）、ROV 大燈光錐、caustics 光網
//  - 生態：溪哥魚群/吳郭魚/大鯉魚/烏龜/小蝦（尾鰭擺動、受驚四散、深處趨光）
//  - 玩法：📷 拍照圖鑑（5 種）、♻ 河道垃圾清理（6 件）、戳魚彩蛋（沿用）
//  - overlay：vignette/噪點/REC/曝光泛白/HUD 計數/桌機按鍵提示/誠實浮水印
//  - 視覺語言沿用儀表板：深藍底、青色 #22d3ee 螢光、Roboto Mono、玻璃面板
// =============================================================================

(function () {
  // 1x1 透明 PNG：餵給 #stream 讓 app.js 的 load 事件觸發（隱藏佔位、點亮 CAM），且不再 error 重連。
  var TRANSPARENT =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC';

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function frac(x) { return ((x % 1) + 1) % 1; }

  var REDUCED = false, DESKTOP = false;
  try {
    REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    DESKTOP = window.matchMedia('(pointer: fine)').matches;
  } catch (_) {}

  var CAM = null;
  var BED_START = 1.5;     // 深度超過此值河床開始浮現（公尺）
  var TRASH_TOTAL = 6;

  // ---------- 圖鑑物種 ----------
  var SPECIES = {
    school:  { name: '溪哥魚群' },
    tilapia: { name: '吳郭魚' },
    carp:    { name: '大鯉魚' },
    turtle:  { name: '烏龜' },
    shrimp:  { name: '小蝦' },
  };
  var TRASH_NAME = { bottle: '寶特瓶', can: '鋁罐', tire: '輪胎', bag: '塑膠袋' };

  // ---------- 玩法狀態（圖鑑跨場域共用；垃圾隨場域重生） ----------
  var dex = {};            // species key -> true
  var trashGot = 0;
  var lastPh = null;       // ctrl.ph 上次值（null＝尚未初始化，第一筆不算拍照）
  function dexCount() { return Object.keys(dex).length; }

  // ---------- 彩蛋台詞（戳到生物） ----------
  var QUIPS = {
    school:  ['🐟 嚇跑一群！', '別追我們～', '咕嚕咕嚕…', '游走囉～'],
    tilapia: ['你戳到我了！', '這是我的地盤', '嚇我一跳！', '潛艇來的？'],
    carp:    ['鯉魚：本王不躲', '就摸一下喔', '水花好大'],
    turtle:  ['烏龜：急什麼…', '縮頭防禦！', '我可是稀有的'],
    shrimp:  ['蝦跳！', '別鬧～', '彈走！'],
  };
  function quipFor(key) {
    var arr = QUIPS[key] || QUIPS.tilapia;
    return arr[(Math.random() * arr.length) | 0];
  }

  // ---------- 環境粒子 ----------
  function makeBubbles() { var o = []; for (var i = 0; i < 26; i++) o.push({ x: Math.random(), y: Math.random(), r: rand(1, 4), sp: rand(0.04, 0.13), drift: rand(-0.02, 0.02) }); return o; }
  // 懸浮微粒（plankton）：給運動視差用。z＝景深（越大越近、移動越快、畫越粗）。
  function makeSpecks() { var o = []; for (var i = 0; i < 48; i++) o.push({ x: Math.random(), y: Math.random(), z: 0.3 + Math.random() * 0.7 }); return o; }
  // 水面以上的雲（z＝景深，越大越近、隨轉向移動越快）
  function makeClouds() { var o = []; for (var i = 0; i < 4; i++) o.push({ x: Math.random(), y: 0.18 + Math.random() * 0.5, s: rand(14, 26), z: 0.5 + Math.random() * 0.6 }); return o; }

  // ---------- 生物工廠 ----------
  function makeSchool() {
    var m = [];
    for (var i = 0; i < 10; i++) {
      m.push({ dx: rand(-0.075, 0.075), dy: rand(-0.05, 0.05), x: 0, y: 0, ph: rand(0, 6.28), s: rand(5, 8) });
    }
    var sc = { cx: rand(0.25, 0.75), cy: rand(0.3, 0.6), vx: rand(0.02, 0.035) * (Math.random() < 0.5 ? -1 : 1), members: m, boost: 0, flash: 0 };
    m.forEach(function (f) { f.x = sc.cx + f.dx; f.y = sc.cy + f.dy; });
    return sc;
  }
  function makeTilapia() {
    var o = [];
    for (var i = 0; i < 3; i++) o.push({ x: Math.random(), y: rand(0.25, 0.8), vx: rand(0.02, 0.05) * (Math.random() < 0.5 ? -1 : 1), s: rand(14, 19), ph: rand(0, 6), boost: 0, flash: 0 });
    return o;
  }
  function makeCarp() {
    return { x: Math.random(), y: rand(0.6, 0.85), vx: rand(0.008, 0.014) * (Math.random() < 0.5 ? -1 : 1), s: 30, ph: rand(0, 6), boost: 0, flash: 0 };
  }
  function makeShrimp() {
    var o = [];
    for (var i = 0; i < 2; i++) o.push({ u: Math.random(), v: rand(0.35, 0.8), ph: rand(0, 6), flash: 0, hop: 0 });
    return o;
  }

  // ---------- 河床工廠 ----------
  // 地面用「假 3D 地平面」：v=0 在河床地平線、v=1 在鏡頭正下方；前進時 v 增加（駛過）、
  // 轉向時整片隨 bedPan 水平視差。物件 wrap 後回到遠端 → 無限河床。
  function makeBed() {
    var stones = [], kelp = [], i;
    for (i = 0; i < 12; i++) stones.push({ u: Math.random(), v: Math.random(), s: rand(6, 16), tn: Math.random() });
    for (i = 0; i < 6; i++) kelp.push({ u: Math.random(), v: rand(0.15, 0.75), hgt: rand(34, 72), ph: rand(0, 6) });
    var kinds = ['bottle', 'bottle', 'can', 'can', 'tire', 'bag'], trash = [];
    for (i = 0; i < kinds.length; i++) {
      trash.push({ kind: kinds[i], u: frac(i / kinds.length + rand(0, 0.12)), v: rand(0.25, 0.85), got: false, ph: rand(0, 6) });
    }
    return { stones: stones, kelp: kelp, log: { u: Math.random(), v: 0.45 }, trash: trash };
  }

  // ---------- 預渲染：caustics 光網 / 噪點顆粒 ----------
  function makeCausticTile() {
    var T = 192, c = document.createElement('canvas');
    c.width = T; c.height = T;
    var x = c.getContext('2d');
    x.strokeStyle = '#fff';
    for (var i = 0; i < 30; i++) {
      var cx = Math.random() * T, cy = Math.random() * T, r = rand(7, 26);
      var a0 = Math.random() * Math.PI * 2, span = rand(1.1, 2.6);
      x.globalAlpha = rand(0.12, 0.3);
      x.lineWidth = rand(1, 2.4);
      for (var ox = -1; ox <= 1; ox++) for (var oy = -1; oy <= 1; oy++) {   // 3×3 鄰域 → 無縫平鋪
        x.beginPath(); x.arc(cx + ox * T, cy + oy * T, r, a0, a0 + span); x.stroke();
      }
    }
    return c;
  }
  function makeNoiseTile() {
    var T = 96, c = document.createElement('canvas');
    c.width = T; c.height = T;
    var x = c.getContext('2d');
    var id = x.createImageData(T, T), d = id.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    x.putImageData(id, 0, 0);
    return c;
  }

  // ---------- 特效（漣漪 / 爆出微粒 / 浮字）：全畫在 #sim-cam，座標 normalized ----------
  function spawnBurst(nx, ny, n, hue) {
    if (!CAM) return;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = rand(0.12, 0.5);
      CAM.parts.push({ x: nx, y: ny, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.1, r: rand(1.5, 4), life: 0, max: rand(0.6, 1.1), hue: hue });
    }
  }
  function addRipple(nx, ny, max) { if (CAM) CAM.ripples.push({ x: nx, y: ny, t: 0, max: max || 0.6 }); }
  function addText(nx, ny, msg, big) { if (CAM) CAM.texts.push({ x: nx, y: ny, msg: msg, t: 0, max: big ? 1.9 : 1.4, big: !!big }); }
  function flashFill(fl) { return 'rgba(255,' + Math.round(205 + 50 * fl) + ',120,' + (0.55 + 0.4 * fl) + ')'; }

  function drawFx(ctx, w, h, dt) {
    if (!CAM) return;
    for (var i = CAM.ripples.length - 1; i >= 0; i--) {
      var rp = CAM.ripples[i]; rp.t += dt; var k = rp.t / rp.max;
      if (k >= 1) { CAM.ripples.splice(i, 1); continue; }
      var rad = (10 + k * 70) * (rp.max > 1 ? 1.6 : 1);
      ctx.strokeStyle = 'rgba(150,235,255,' + (0.6 * (1 - k)) + ')'; ctx.lineWidth = 2 * (1 - k) + 0.5;
      ctx.beginPath(); ctx.arc(rp.x * w, rp.y * h, rad, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var j = CAM.parts.length - 1; j >= 0; j--) {
      var p = CAM.parts[j]; p.life += dt; var t = p.life / p.max;
      if (t >= 1) { CAM.parts.splice(j, 1); continue; }
      p.x += p.vx * dt; p.y += (p.vy + 0.05) * dt; p.vy += 0.25 * dt;
      ctx.fillStyle = (p.hue != null) ? ('hsla(' + p.hue + ',95%,65%,' + (1 - t) + ')') : 'rgba(190,240,255,' + (1 - t) + ')';
      ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r * (1 - 0.4 * t), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    for (var n = CAM.texts.length - 1; n >= 0; n--) {
      var tx = CAM.texts[n]; tx.t += dt; var u = tx.t / tx.max;
      if (u >= 1) { CAM.texts.splice(n, 1); continue; }
      var fade = u < 0.15 ? u / 0.15 : (1 - (u - 0.15) / 0.85);
      ctx.save();
      ctx.font = (tx.big ? 'bold 17px' : 'bold 13px') + ' "Roboto Mono", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var yy = (tx.y - u * 0.06) * h;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(2,18,30,' + (0.6 * fade) + ')'; ctx.strokeText(tx.msg, tx.x * w, yy);
      ctx.fillStyle = (tx.big ? 'rgba(255,224,130,' : 'rgba(225,248,255,') + fade + ')'; ctx.fillText(tx.msg, tx.x * w, yy);
      ctx.restore();
    }
  }

  // ---------- 彩蛋：戳生物 → 爆氣泡 + 漣漪 + 浮字 + 受驚反應 ----------
  // CAM.hits 由每幀繪製時重建：所有「當前畫面上」的生物命中區（normalized 座標）。
  function pokeAt(nx, ny) {
    if (!CAM) return false;
    var c = CAM.c, w = c.clientWidth || 1, h = c.clientHeight || 1;
    var hit = null, best = 1e9;
    CAM.hits.forEach(function (hh) {
      var dx = (hh.x - nx) * w, dy = (hh.y - ny) * h, d = Math.sqrt(dx * dx + dy * dy);
      if (d < hh.rad + 14 && d < best) { best = d; hit = hh; }
    });
    if (!hit) return false;                       // 空水域不給回饋，保留「找到才有」的彩蛋感
    var ref = hit.ref;
    ref.flash = 1;
    if (hit.key === 'school') {
      ref.boost = 1;
      ref.vx = (ref.cx >= nx ? 1 : -1) * Math.abs(ref.vx);
    } else if (hit.key === 'carp') {
      ref.boost = 0.15;                           // 大鯉魚懶得逃
    } else if (hit.key === 'shrimp') {
      ref.hop = 1;
    } else if (ref.vx !== undefined) {
      ref.boost = 1;
      ref.vx = (ref.x >= nx ? 1 : -1) * (Math.abs(ref.vx) + 0.03);
    }
    spawnBurst(hit.x, hit.y, 14); addRipple(hit.x, hit.y, 0.6);
    if (window.__SIM_AUDIO) window.__SIM_AUDIO.pop(700);
    CAM.catches++;
    if (CAM.catches % 5 === 0) {                  // 每 5 隻：金色慶祝
      addText(0.5, 0.42, '🎉 連抓 ' + CAM.catches + ' 隻！潛艇船長認證', true);
      spawnBurst(0.5, 0.5, 30, 48); addRipple(0.5, 0.5, 1.1);
    } else {
      addText(hit.x, hit.y - 0.04, quipFor(hit.key), false);
    }
    return true;
  }

  function camPos(e) { var r = CAM.c.getBoundingClientRect(); return { nx: (e.clientX - r.left) / (r.width || 1), ny: (e.clientY - r.top) / (r.height || 1) }; }
  function onCamClick(e) { if (CAM) { var p = camPos(e); pokeAt(p.nx, p.ny); } }
  function onCamMove(e) {
    if (!CAM) return;
    var p = camPos(e), c = CAM.c, w = c.clientWidth || 1, h = c.clientHeight || 1, over = false;
    for (var i = 0; i < CAM.hits.length; i++) {
      var hh = CAM.hits[i], dx = (hh.x - p.nx) * w, dy = (hh.y - p.ny) * h;
      if (Math.sqrt(dx * dx + dy * dy) < hh.rad + 14) { over = true; break; }
    }
    c.style.cursor = over ? 'pointer' : '';
  }

  // ---------- 📷 拍照圖鑑：偵測 ctrl.ph 變化（app.js 既有拍照序號），取景框內有生物就收錄 ----------
  function onPhoto() {
    if (window.__SIM_AUDIO) window.__SIM_AUDIO.click();
    var wl = CAM.wl;                              // 本幀水平線（normalized）；水面以上的不算
    var best = null, bestNew = null;
    CAM.hits.forEach(function (hh) {
      if (Math.abs(hh.x - 0.5) > 0.33 || Math.abs(hh.y - 0.5) > 0.34) return;   // 取景框中央區
      if (hh.y < wl + 0.02) return;
      if (!best) best = hh;
      if (!dex[hh.key] && !bestNew) bestNew = hh;
    });
    var hit = bestNew || best;
    if (!hit) { addText(0.5, 0.62, '📷 這張只有水…再靠近一點', false); return; }
    var name = SPECIES[hit.key].name;
    if (!dex[hit.key]) {
      dex[hit.key] = true;
      var n = dexCount();
      spawnBurst(hit.x, hit.y, 12);
      addText(0.5, 0.62, '📸 拍到 ' + name + '！圖鑑 ' + n + '/5', false);
      if (n >= 5) {
        addText(0.5, 0.44, '🏆 圖鑑完成！傳奇水下攝影師', true);
        spawnBurst(0.5, 0.5, 30, 48); addRipple(0.5, 0.5, 1.1);
        if (window.__SIM_AUDIO) window.__SIM_AUDIO.fanfare();
      } else if (window.__SIM_AUDIO) window.__SIM_AUDIO.ding();
    } else {
      addText(0.5, 0.62, '📸 ' + name + '（圖鑑已收錄）', false);
    }
  }

  // ---------- 水面以上：天空 / 雲 / 遠岸 / 浮標 ----------
  function puff(ctx, x, y, s) {
    ctx.beginPath();
    ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
    ctx.arc(x + s * 0.7, y + s * 0.1, s * 0.5, 0, Math.PI * 2);
    ctx.arc(x - s * 0.7, y + s * 0.12, s * 0.45, 0, Math.PI * 2);
    ctx.arc(x + s * 0.1, y - s * 0.25, s * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawShore(ctx, w, wlPx, pan) {
    var baseY = wlPx, off = ((pan * 0.3 * w) % (w * 0.5) + (w * 0.5)) % (w * 0.5);
    ctx.fillStyle = 'rgba(28,70,72,0.55)';
    ctx.beginPath(); ctx.moveTo(-40, baseY);
    for (var x = -40 - off; x <= w + 40; x += 40) {
      var hgt = 10 + 6 * Math.sin(x * 0.03) + 4 * Math.cos(x * 0.013);
      ctx.lineTo(x, baseY - hgt);
    }
    ctx.lineTo(w + 40, baseY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(20,58,56,0.6)';                         // 小樹
    for (var t = 0; t < 5; t++) {
      var tx = ((((t * 0.21 + 0.06 - pan * 0.3) % 1) + 1) % 1) * w, ty = baseY - 11;
      ctx.beginPath(); ctx.moveTo(tx, ty - 15); ctx.lineTo(tx - 6, ty); ctx.lineTo(tx + 6, ty); ctx.closePath(); ctx.fill();
    }
  }

  function drawBuoy(ctx, w, wlPx, pan, fade) {
    var bx = ((((0.42 - pan * 0.5) % 1) + 1) % 1) * w, by = wlPx;
    ctx.save(); ctx.globalAlpha = fade;
    ctx.fillStyle = 'rgba(255,120,70,0.18)';                      // 倒影
    ctx.beginPath(); ctx.ellipse(bx, by + 10, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(40,40,40,0.7)'; ctx.lineWidth = 2;    // 桅桿
    ctx.beginPath(); ctx.moveTo(bx, by - 9); ctx.lineTo(bx, by - 23); ctx.stroke();
    ctx.fillStyle = 'rgba(40,40,40,0.7)';
    ctx.beginPath(); ctx.arc(bx, by - 24, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8552f';                                    // 浮球（半圓露出水面）
    ctx.beginPath(); ctx.arc(bx, by - 1, 9, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f4f4f4'; ctx.fillRect(bx - 9, by - 6, 18, 3);
    ctx.restore();
  }

  // 水面以上整層：天空漸層＋太陽＋雲＋遠岸＋浮標。隨轉向水平位移；越沒入水中越淡出。
  function drawSky(ctx, w, h, wlPx, flowX, dt, df) {
    CAM.sky += flowX * dt * 0.5;
    var pan = CAM.sky, fade = clamp(1 - df * 1.4, 0, 1), hi = Math.max(1, wlPx);
    ctx.save(); ctx.globalAlpha = fade;
    var sky = ctx.createLinearGradient(0, 0, 0, hi);
    sky.addColorStop(0, 'rgb(112,190,225)'); sky.addColorStop(1, 'rgb(196,232,240)');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, hi);
    var sunX = (((0.78 + pan * 0.4) % 1 + 1) % 1) * w, sunY = wlPx * 0.32;
    var sun = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 46);
    sun.addColorStop(0, 'rgba(255,250,225,0.95)'); sun.addColorStop(0.5, 'rgba(255,238,180,0.5)'); sun.addColorStop(1, 'rgba(255,238,180,0)');
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sunX, sunY, 46, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    CAM.clouds.forEach(function (cl) {
      var cx = ((cl.x + pan * 0.25 * cl.z) % 1.2 + 1.2) % 1.2 - 0.1;
      puff(ctx, cx * w, cl.y * wlPx, cl.s * (0.6 + cl.z));
    });
    drawShore(ctx, w, wlPx, pan);
    ctx.restore();
    drawBuoy(ctx, w, wlPx, pan, fade);
  }

  // 水面交界亮帶（從水下往上看是一條起伏亮線）＋ 太陽波光
  function drawWaterline(ctx, w, wlPx, now, df) {
    var a = clamp(1 - df, 0, 1);
    ctx.save(); ctx.strokeStyle = 'rgba(210,245,255,' + (0.7 * a) + ')'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (var x = 0; x <= w; x += 8) {
      var y = wlPx + Math.sin(x * 0.05 + now / 300) * 1.6;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke(); ctx.restore();
  }

  function drawGlitter(ctx, w, wlPx, df) {
    var fade = clamp(1 - df * 1.4, 0, 1);
    if (fade <= 0.02) return;
    var sunX = (((0.78 + CAM.sky * 0.4) % 1 + 1) % 1) * w;
    for (var i = 0; i < 10; i++) {                 // 隨機閃爍＝波光粼粼
      var gx = sunX + (Math.random() - 0.5) * w * 0.26;
      var gy = wlPx + 2 + Math.random() * 10;
      ctx.fillStyle = 'rgba(255,250,225,' + ((0.08 + Math.random() * 0.22) * fade) + ')';
      ctx.fillRect(gx, gy, 3 + Math.random() * 8, 1.4);
    }
  }

  // 近水面 caustics 光網：預渲染 tile 兩層反向捲動（lighter），越深越淡
  function drawCaustics(ctx, w, h, top, now, df, m) {
    if (df > 0.85) return;
    var bandH = Math.min(h - top, h * 0.55);
    if (bandH <= 0) return;
    var T = 192, a = 0.1 * (1 - df) * (0.5 + 0.5 * m);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, top, w, bandH); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    var o1x = (now / 90) % T, o1y = (now / 260) % T;
    ctx.globalAlpha = a;
    for (var X = -T; X < w + T; X += T) for (var Y = top - T; Y < top + bandH + T; Y += T)
      ctx.drawImage(CAM.caustic, X + o1x, Y + o1y);
    var T2 = T * 1.7, o2x = (now / -140) % T2, o2y = (now / 340) % T2;
    ctx.globalAlpha = a * 0.7;
    for (var X2 = -T2; X2 < w + T2; X2 += T2) for (var Y2 = top - T2; Y2 < top + bandH + T2; Y2 += T2)
      ctx.drawImage(CAM.caustic, X2 + o2x, Y2 + o2y, T2, T2);
    ctx.restore();
  }

  // ---------- 生物：更新與繪製（尾鰭擺動、受驚 boost、深處趨光） ----------
  function hitPush(key, ref, nx, ny, rad) { CAM.hits.push({ key: key, ref: ref, x: nx, y: ny, rad: rad }); }

  function drawSmallFish(ctx, x, y, s, dir, ph, now, m, flash) {
    var a = 0.55 * m + 0.18;
    var wag = Math.sin(now / 85 + ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = flash > 0 ? flashFill(flash) : 'rgba(198,226,240,' + a + ')';
    ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-s * 0.8, 0);
    ctx.lineTo(-s * 1.45, -s * 0.4 + wag * s * 0.3);
    ctx.lineTo(-s * 1.45, s * 0.4 + wag * s * 0.3);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function updateSchool(sc, dt, flowX, flowY, fwd, now, attract, w, h) {
    sc.cx += sc.vx * dt * (1 + sc.boost * 5) + flowX * dt * 0.5;
    sc.cy += flowY * dt * 0.5;
    if (sc.cx > 1.15) { sc.cx = -0.15; sc.cy = rand(0.25, 0.7); }
    if (sc.cx < -0.15) { sc.cx = 1.15; sc.cy = rand(0.25, 0.7); }
    sc.cy = clamp(sc.cy, 0.08, 0.92);
    if (attract) { sc.cx += (0.5 - sc.cx) * dt * 0.25; sc.cy += (0.58 - sc.cy) * dt * 0.25; }
    sc.boost = Math.max(0, sc.boost - dt * 1.1);
    sc.flash = Math.max(0, sc.flash - dt * 2.2);
    var dir = sc.vx < 0 ? -1 : 1;
    sc.members.forEach(function (f) {
      var txp = sc.cx + f.dx + Math.sin(now / 460 + f.ph) * 0.014;
      var typ = sc.cy + f.dy + Math.cos(now / 520 + f.ph) * 0.01;
      f.x += (txp - f.x) * Math.min(1, dt * 6);
      f.y += (typ - f.y) * Math.min(1, dt * 6);
      hitPush('school', sc, f.x, f.y, f.s * 1.5 + 8);
    });
    return dir;
  }

  function drawTilapia(ctx, f, w, h, now, m) {
    var x = f.x * w, y = f.y * h, dir = f.vx < 0 ? -1 : 1, s = f.s;
    var a = 0.5 * m + 0.15;
    var wag = Math.sin(now / 110 + f.ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = f.flash > 0 ? flashFill(f.flash) : 'rgba(165,198,206,' + a + ')';
    ctx.beginPath();                                       // 尾鰭（擺動）
    ctx.moveTo(-s * 0.78, 0);
    ctx.lineTo(-s * 1.5, -s * 0.5 + wag * s * 0.22);
    ctx.lineTo(-s * 1.5, s * 0.5 + wag * s * 0.22);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();                                       // 背鰭
    ctx.moveTo(-s * 0.35, -s * 0.4); ctx.lineTo(s * 0.1, -s * 0.78); ctx.lineTo(s * 0.32, -s * 0.4);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.46, 0, 0, Math.PI * 2); ctx.fill();   // 紡錘身
    ctx.fillStyle = 'rgba(10,22,30,' + (a + 0.2) + ')';    // 眼點
    ctx.beginPath(); ctx.arc(s * 0.55, -s * 0.1, Math.max(1.2, s * 0.09), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawCarp(ctx, f, w, h, now, m) {
    var x = f.x * w, y = f.y * h, dir = f.vx < 0 ? -1 : 1, s = f.s;
    var a = 0.5 * m + 0.18;
    var wag = Math.sin(now / 220 + f.ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = f.flash > 0 ? flashFill(f.flash) : 'rgba(198,168,118,' + a + ')';
    ctx.beginPath();                                       // 大尾鰭（慢擺）
    ctx.moveTo(-s * 0.8, 0);
    ctx.lineTo(-s * 1.45, -s * 0.46 + wag * s * 0.2);
    ctx.lineTo(-s * 1.45, s * 0.46 + wag * s * 0.2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-s * 0.2, -s * 0.42); ctx.lineTo(s * 0.18, -s * 0.74); ctx.lineTo(s * 0.4, -s * 0.42); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(120,95,60,' + a + ')'; ctx.lineWidth = 1.2;   // 鬍鬚
    ctx.beginPath(); ctx.moveTo(s * 0.92, s * 0.12); ctx.lineTo(s * 1.12, s * 0.3); ctx.stroke();
    ctx.fillStyle = 'rgba(15,22,26,' + (a + 0.2) + ')';
    ctx.beginPath(); ctx.arc(s * 0.6, -s * 0.1, s * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawTurtle(ctx, tu, w, h, now, m) {
    var x = tu.x * w, y = tu.y * h, dir = tu.vx < 0 ? -1 : 1, s = tu.s;
    var a = 0.5 * m + 0.2;
    var paddle = Math.sin(now / 260 + tu.ph);
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    ctx.fillStyle = 'rgba(112,150,96,' + a * 0.9 + ')';    // 四鰭（划水）
    [[-0.45, -0.55], [-0.45, 0.55], [0.35, -0.5], [0.35, 0.5]].forEach(function (f, i) {
      var py = f[1] * s * 0.62 + paddle * (i % 2 === 0 ? 2.6 : -2.6);
      ctx.beginPath(); ctx.ellipse(f[0] * s, py, s * 0.34, s * 0.15, f[1] * 0.6, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = tu.flash > 0 ? flashFill(tu.flash) : 'rgba(96,138,84,' + a + ')';   // 殼
    ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.66, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(50,80,48,' + a * 0.8 + ')'; ctx.lineWidth = 1;              // 殼紋
    ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.4, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-s * 0.62, 0); ctx.lineTo(s * 0.62, 0); ctx.stroke();
    ctx.fillStyle = 'rgba(120,158,104,' + a + ')';                                       // 頭
    ctx.beginPath(); ctx.ellipse(s * 1.06, -s * 0.08, s * 0.3, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(20,30,24,' + (a + 0.2) + ')';
    ctx.beginPath(); ctx.arc(s * 1.16, -s * 0.13, 1.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function updateCreatures(ctx, w, h, dt, now, flowX, flowY, fwd, m, attract) {
    // 高速逼近 → 中央區生物受驚四散（每 0.9s 判一次）
    CAM.fleeT -= dt;
    var scare = Math.abs(fwd) > 0.7 && CAM.fleeT <= 0;
    if (scare) CAM.fleeT = 0.9;

    // 溪哥魚群
    var sc = CAM.school;
    if (scare && Math.abs(sc.cx - 0.5) < 0.3 && Math.abs(sc.cy - 0.5) < 0.3) {
      sc.boost = 1; sc.vx = (sc.cx >= 0.5 ? 1 : -1) * Math.abs(sc.vx);
    }
    var dir = updateSchool(sc, dt, flowX, flowY, fwd, now, attract, w, h);
    sc.members.forEach(function (f) {
      drawSmallFish(ctx, f.x * w, f.y * h, f.s, dir, f.ph, now, m, sc.flash);
    });

    // 吳郭魚
    CAM.tilapia.forEach(function (f) {
      f.x += f.vx * dt * (1 + f.boost * 6) + flowX * dt * 0.45 + (f.x - 0.5) * fwd * dt * 0.6;
      f.y += flowY * dt * 0.45 + Math.sin(now / 800 + f.ph) * 0.0003;
      if (f.x > 1.1) { f.x = -0.1; f.y = rand(0.2, 0.85); }
      if (f.x < -0.1) { f.x = 1.1; f.y = rand(0.2, 0.85); }
      if (f.y > 1.1) f.y = -0.1; if (f.y < -0.1) f.y = 1.1;
      if (attract) { f.x += (0.5 - f.x) * dt * 0.18; f.y += (0.55 - f.y) * dt * 0.18; }
      if (scare && Math.abs(f.x - 0.5) < 0.28 && Math.abs(f.y - 0.5) < 0.28) {
        f.boost = 1; f.vx = (f.x >= 0.5 ? 1 : -1) * Math.abs(f.vx);
      }
      f.boost = Math.max(0, f.boost - dt * 1.1);
      f.flash = Math.max(0, f.flash - dt * 2.2);
      drawTilapia(ctx, f, w, h, now, m);
      hitPush('tilapia', f, f.x, f.y, f.s * 1.5 + 10);
    });

    // 大鯉魚（深水層、慢）
    var cp = CAM.carp;
    cp.x += cp.vx * dt * (1 + cp.boost * 4) + flowX * dt * 0.4 + (cp.x - 0.5) * fwd * dt * 0.5;
    cp.y += flowY * dt * 0.4 + Math.sin(now / 1500 + cp.ph) * 0.0003;
    if (cp.x > 1.15) { cp.x = -0.15; cp.y = rand(0.6, 0.85); }
    if (cp.x < -0.15) { cp.x = 1.15; cp.y = rand(0.6, 0.85); }
    cp.y = clamp(cp.y, 0.45, 0.95);
    if (attract) { cp.x += (0.5 - cp.x) * dt * 0.1; cp.y += (0.62 - cp.y) * dt * 0.1; }
    cp.boost = Math.max(0, cp.boost - dt); cp.flash = Math.max(0, cp.flash - dt * 2.2);
    drawCarp(ctx, cp, w, h, now, m);
    hitPush('carp', cp, cp.x, cp.y, cp.s * 1.4 + 10);

    // 烏龜（稀有：偶爾游過近水面）
    if (!CAM.turtle) {
      CAM.turtleT -= dt;
      if (CAM.turtleT <= 0) {
        var tdir = Math.random() < 0.5 ? 1 : -1;
        CAM.turtle = { x: tdir > 0 ? -0.14 : 1.14, y: rand(0.14, 0.34), vx: 0.05 * tdir, s: 20, ph: rand(0, 6), boost: 0, flash: 0 };
      }
    } else {
      var tu = CAM.turtle;
      tu.x += tu.vx * dt * (1 + tu.boost * 4) + flowX * dt * 0.3;
      tu.y += flowY * dt * 0.3;
      tu.boost = Math.max(0, tu.boost - dt); tu.flash = Math.max(0, tu.flash - dt * 2.2);
      if (tu.x < -0.18 || tu.x > 1.18 || tu.y < -0.2 || tu.y > 1.2) {
        CAM.turtle = null; CAM.turtleT = rand(24, 48);
      } else {
        drawTurtle(ctx, tu, w, h, now, m);
        hitPush('turtle', tu, tu.x, tu.y, tu.s * 1.6 + 10);
      }
    }
  }

  // ---------- 河床：假 3D 地平面（沙底/卵石/水草/沉木/垃圾/小蝦） ----------
  function bedProject(u, v, topPx, w, h) {
    return {
      x: frac(u + CAM.bedPan * (0.3 + 0.7 * v)) * w,
      y: topPx + Math.pow(Math.max(v, 0), 1.5) * (h * 1.05 - topPx),
      sc: 0.35 + v * 0.95,
    };
  }
  function bedAdvance(it, adv, reseedU) {
    it.v += adv * (0.25 + it.v);
    if (it.v > 1.06) { it.v -= 1.12; if (reseedU) it.u = Math.random(); }
    else if (it.v < -0.06) { it.v += 1.12; if (reseedU) it.u = Math.random(); }
  }

  function drawTrashItem(ctx, t, p, now, m) {
    var sc = p.sc, am = 0.55 * m + 0.3;
    ctx.save(); ctx.translate(p.x, p.y);
    if (t.kind === 'bottle') {
      ctx.rotate(0.5 + t.ph * 0.3);
      ctx.fillStyle = 'rgba(175,215,230,' + 0.5 * am + ')';
      ctx.fillRect(-4 * sc, -9 * sc, 8 * sc, 16 * sc);
      ctx.fillStyle = 'rgba(34,211,238,' + am + ')';
      ctx.fillRect(-2.4 * sc, -12.4 * sc, 4.8 * sc, 3.4 * sc);
    } else if (t.kind === 'can') {
      ctx.rotate(-0.4 + t.ph * 0.2);
      ctx.fillStyle = 'rgba(190,200,210,' + am + ')';
      ctx.fillRect(-3.5 * sc, -6 * sc, 7 * sc, 12 * sc);
      ctx.fillStyle = 'rgba(230,80,90,' + am + ')';
      ctx.fillRect(-3.5 * sc, -2 * sc, 7 * sc, 4 * sc);
    } else if (t.kind === 'tire') {
      ctx.strokeStyle = 'rgba(48,54,60,' + (am + 0.1) + ')';
      ctx.lineWidth = 4.5 * sc;
      ctx.beginPath(); ctx.arc(0, 0, 8 * sc, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(90,100,108,' + am + ')'; ctx.lineWidth = 1.2 * sc;
      ctx.beginPath(); ctx.arc(0, 0, 5.2 * sc, 0, Math.PI * 2); ctx.stroke();
    } else {                                                  // bag：飄動的塑膠袋
      var wob = Math.sin(now / 600 + t.ph) * 3 * sc;
      ctx.translate(0, -6 * sc - Math.abs(wob) * 0.4);
      ctx.fillStyle = 'rgba(235,245,250,' + 0.32 * am + ')';
      ctx.beginPath();
      ctx.moveTo(-6 * sc, 4 * sc);
      ctx.bezierCurveTo(-8 * sc, -4 * sc + wob, -2 * sc, -9 * sc - wob, 1 * sc + wob, -7 * sc);
      ctx.bezierCurveTo(7 * sc, -4 * sc - wob, 7 * sc, 3 * sc, 3 * sc, 5 * sc);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    var gl = Math.sin(now / 500 + t.ph * 7);                  // 未撈起的偶爾閃一下（吸引目光）
    if (gl > 0.9) {
      ctx.fillStyle = 'rgba(255,255,255,' + ((gl - 0.9) * 6) + ')';
      ctx.fillRect(p.x - 4, p.y - 11 * sc - 1, 8, 1.4);
      ctx.fillRect(p.x - 0.7, p.y - 11 * sc - 4.4, 1.4, 8);
    }
  }

  function drawShrimpItem(ctx, sh, p, now, m) {
    var sc = p.sc, a = 0.5 * m + 0.2;
    var hopY = Math.abs(Math.sin(now / 380 + sh.ph)) * (5 + sh.hop * 14) * sc;
    var y = p.y - hopY - 2 * sc;
    sh.hop = Math.max(0, sh.hop - 0.016);
    sh.flash = Math.max(0, sh.flash - 0.03);
    ctx.save(); ctx.translate(p.x, y);
    ctx.fillStyle = sh.flash > 0 ? flashFill(sh.flash) : 'rgba(232,150,118,' + a + ')';
    ctx.beginPath(); ctx.arc(0, 0, 2.6 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2.2 * sc, 0.8 * sc, 2.1 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(4.2 * sc, 2 * sc, 1.6 * sc, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(232,150,118,' + a * 0.8 + ')'; ctx.lineWidth = 0.9 * sc;   // 觸鬚
    ctx.beginPath(); ctx.moveTo(-1.6 * sc, -1.6 * sc); ctx.lineTo(-5.5 * sc, -4.5 * sc); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.2 * sc, -1.9 * sc); ctx.lineTo(-3.4 * sc, -5.6 * sc); ctx.stroke();
    ctx.restore();
    hitPush('shrimp', sh, p.x / (CAM.c.clientWidth || 1), y / (CAM.c.clientHeight || 1), 10 * sc + 8);
  }

  function drawBed(ctx, w, h, dt, now, st, fwd, m, df) {
    var DM = window.__SIM.DEPTH_MAX;
    var bedT = clamp((st.depth - BED_START) / (DM - BED_START), 0, 1);
    if (bedT <= 0) return;
    var topPx = (1.16 - 0.62 * bedT) * h + CAM.pitch;
    if (topPx >= h * 1.02) return;

    // 沙底（頂緣起伏）
    var g = ctx.createLinearGradient(0, topPx, 0, h);
    g.addColorStop(0, 'rgba(' + Math.round(126 * m) + ',' + Math.round(116 * m) + ',' + Math.round(88 * m) + ',0.92)');
    g.addColorStop(1, 'rgba(' + Math.round(56 * m) + ',' + Math.round(52 * m) + ',' + Math.round(40 * m) + ',0.96)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-6, h + 6); ctx.lineTo(-6, topPx);
    for (var x = 0; x <= w + 24; x += 24) ctx.lineTo(x, topPx + Math.sin(x * 0.02 + now / 1300) * 3);
    ctx.lineTo(w + 6, h + 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(' + Math.round(150 * m) + ',' + Math.round(140 * m) + ',' + Math.round(108 * m) + ',0.25)';
    ctx.lineWidth = 1;
    for (var r2 = 1; r2 <= 2; r2++) {                          // 沙紋
      var ry = topPx + (h - topPx) * (r2 * 0.3);
      ctx.beginPath();
      for (var rx = 0; rx <= w; rx += 18) {
        var yy = ry + Math.sin(rx * 0.04 + now / 1600 + r2) * 2;
        if (rx === 0) ctx.moveTo(rx, yy); else ctx.lineTo(rx, yy);
      }
      ctx.stroke();
    }

    // 前進駛過 / 轉向視差（與魚的水平流向一致）
    CAM.bedPan += CAM.flowX * dt * 0.55;
    var adv = fwd * dt * 0.5;
    var bed = CAM.bed;

    // 卵石
    bed.stones.forEach(function (s0) {
      bedAdvance(s0, adv, true);
      var p = bedProject(s0.u, s0.v, topPx, w, h);
      if (p.y < topPx - 2) return;
      var s = s0.s * p.sc, gr = Math.round((86 + s0.tn * 38) * m);
      ctx.fillStyle = 'rgba(' + gr + ',' + Math.round(gr * 1.02) + ',' + Math.round(gr * 0.92) + ',0.9)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y, s, s * 0.6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(p.x, p.y + s * 0.32, s * 0.85, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
    });

    // 沉木
    bedAdvance(bed.log, adv, false);
    var lp = bedProject(bed.log.u, bed.log.v, topPx, w, h);
    if (lp.y >= topPx) {
      var ls = 34 * lp.sc;
      ctx.save(); ctx.translate(lp.x, lp.y); ctx.rotate(-0.12);
      ctx.fillStyle = 'rgba(' + Math.round(96 * m) + ',' + Math.round(72 * m) + ',' + Math.round(48 * m) + ',0.92)';
      ctx.beginPath(); ctx.ellipse(0, 0, ls, ls * 0.18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(' + Math.round(120 * m) + ',' + Math.round(92 * m) + ',' + Math.round(62 * m) + ',0.92)';
      ctx.beginPath(); ctx.ellipse(-ls, 0, ls * 0.1, ls * 0.16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // 水草（搖曳）
    bed.kelp.forEach(function (k) {
      bedAdvance(k, adv, true);
      var p = bedProject(k.u, k.v, topPx, w, h);
      if (p.y < topPx - 2) return;
      var hgt = k.hgt * p.sc;
      var sway = Math.sin(now / 950 + k.ph) * 9 * p.sc + CAM.flowX * 14 * p.sc;
      ctx.strokeStyle = 'rgba(46,110,72,' + (0.5 * m + 0.18) + ')';
      ctx.lineWidth = 2.6 * p.sc; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + sway * 0.35, p.y - hgt * 0.55, p.x + sway, p.y - hgt);
      ctx.stroke();
      ctx.lineWidth = 1.6 * p.sc;
      for (var li = 1; li <= 3; li++) {                         // 葉
        var t0 = li / 3.6, lx = p.x + sway * t0 * t0, ly = p.y - hgt * t0;
        var side = (li % 2 === 0 ? 1 : -1);
        ctx.beginPath(); ctx.moveTo(lx, ly);
        ctx.quadraticCurveTo(lx + side * 7 * p.sc, ly - 3 * p.sc, lx + side * 10 * p.sc, ly - 7 * p.sc);
        ctx.stroke();
      }
    });

    // 垃圾（玩法：潛到底、開到正下方自動撈起）
    bed.trash.forEach(function (t) {
      if (t.got) return;
      bedAdvance(t, adv, false);
      var p = bedProject(t.u, t.v, topPx, w, h);
      if (p.y < topPx - 2) return;
      drawTrashItem(ctx, t, p, now, m);
      var nx = p.x / w, ny = p.y / h;
      if (st.depth > DM - 0.6 && t.v > 0.45 && t.v < 0.99 && Math.abs(nx - 0.5) < 0.2) {
        t.got = true; trashGot++;
        spawnBurst(nx, ny, 16, 150); addRipple(nx, ny, 0.7);
        if (trashGot >= TRASH_TOTAL) {
          addText(0.5, 0.44, '🎉 河道清潔大使！垃圾全數清除', true);
          spawnBurst(0.5, 0.5, 30, 150); addRipple(0.5, 0.5, 1.1);
          if (window.__SIM_AUDIO) window.__SIM_AUDIO.fanfare();
        } else {
          addText(nx, ny - 0.05, '♻ 撈起' + TRASH_NAME[t.kind] + '　' + trashGot + '/' + TRASH_TOTAL, false);
          if (window.__SIM_AUDIO) window.__SIM_AUDIO.ding();
        }
      }
    });

    // 小蝦（貼底彈跳）
    CAM.shrimp.forEach(function (sh) {
      bedAdvance(sh, adv, false);
      sh.u = frac(sh.u + Math.sin(now / 2400 + sh.ph) * 0.0002);
      var p = bedProject(sh.u, sh.v, topPx, w, h);
      if (p.y < topPx - 2) return;
      drawShrimpItem(ctx, sh, p, now, m);
    });
  }

  // ---------- 鏡頭 overlay（不隨世界旋轉）：玻璃面板沿用儀表板視覺語言 ----------
  function rrect(ctx, x, y, w2, h2, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w2, y, x + w2, y + h2, r);
    ctx.arcTo(x + w2, y + h2, x, y + h2, r);
    ctx.arcTo(x, y + h2, x, y, r);
    ctx.arcTo(x, y, x + w2, y, r);
    ctx.closePath();
  }
  function panel(ctx, x, y, w2, h2, a) {
    rrect(ctx, x, y, w2, h2, 6);
    ctx.fillStyle = 'rgba(5,8,15,' + 0.62 * a + ')';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34,211,238,' + 0.3 * a + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  function drawVignette(ctx, w, h) {
    if (!CAM.vig || CAM.vigW !== w || CAM.vigH !== h) {
      var g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.5, w / 2, h / 2, Math.hypot(w, h) * 0.62);
      g.addColorStop(0, 'rgba(2,8,16,0)');
      g.addColorStop(1, 'rgba(2,8,16,0.46)');
      CAM.vig = g; CAM.vigW = w; CAM.vigH = h;
    }
    ctx.fillStyle = CAM.vig; ctx.fillRect(0, 0, w, h);
  }
  function drawGrain(ctx, w, h) {
    var T = 96, ox = (Math.random() * T) | 0, oy = (Math.random() * T) | 0;
    ctx.globalAlpha = 0.035;
    for (var X = -ox; X < w; X += T) for (var Y = -oy; Y < h; Y += T) ctx.drawImage(CAM.noise, X, Y);
    ctx.globalAlpha = 1;
  }
  // ROV 大燈光錐：深處越暗、開燈差異越大（💡 從裝飾變有用）
  function drawHeadlight(ctx, w, h, df) {
    var cy = h * 0.62, R = Math.max(w, h) * 0.62, ia = 0.1 + 0.3 * df;
    var g = ctx.createRadialGradient(w / 2, cy, 8, w / 2, cy, R);
    g.addColorStop(0, 'rgba(255,244,214,' + ia + ')');
    g.addColorStop(0.45, 'rgba(255,238,190,' + ia * 0.4 + ')');
    g.addColorStop(1, 'rgba(255,238,190,0)');
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  function drawRec(ctx, now) {
    var st = window.__SIM.st;
    if (st.streamMode !== 1) { CAM.recT0 = null; return; }
    if (CAM.recT0 == null) CAM.recT0 = now;
    var secs = Math.max(0, Math.floor((now - CAM.recT0) / 1000));
    var txt = 'REC ' + ('0' + Math.floor(secs / 60)).slice(-2) + ':' + ('0' + (secs % 60)).slice(-2);
    ctx.save();
    ctx.font = 'bold 11px "Roboto Mono", monospace';
    panel(ctx, 28, 10, ctx.measureText(txt).width + 26, 20, 1);
    ctx.fillStyle = 'rgba(244,63,94,' + (Math.sin(now / 280) > 0 ? 0.95 : 0.25) + ')';
    ctx.beginPath(); ctx.arc(38, 20, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,160,175,0.95)';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(txt, 46, 21);
    ctx.restore();
  }
  function drawCounters(ctx, w) {
    var txt = '📖 ' + dexCount() + '/5  ♻ ' + trashGot + '/' + TRASH_TOTAL;
    ctx.save();
    ctx.font = '11px "Roboto Mono", monospace';
    var tw = ctx.measureText(txt).width;
    var x = w - 28 - tw - 16;
    panel(ctx, x, 10, tw + 16, 20, 1);
    ctx.fillStyle = 'rgba(160,228,242,0.95)';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillText(txt, x + 8, 21);
    ctx.restore();
  }
  // 按鍵提示：只在桌機（pointer:fine）顯示；首次按鍵後淡成半透明（使用者要求：手機不顯示）
  function drawHint(ctx, w, h, dt) {
    if (!DESKTOP) return;
    var used = window.__SIM.kb && window.__SIM.kb.used;
    CAM.hintA += ((used ? 0.25 : 0.92) - CAM.hintA) * Math.min(1, dt * 1.6);
    var A = CAM.hintA;
    if (A < 0.04 || h < 240) return;
    var txt = 'W S 前後 · A D 轉向 · ↑ ↓ 升降 · L 燈 · P 拍照 · R 錄影';
    try { if (!used && document.hasFocus && !document.hasFocus()) txt = '點一下畫面啟用鍵盤 ⌨ ' + txt; } catch (_) {}
    ctx.save();
    ctx.font = '11px "Roboto Mono", monospace';
    var bw = ctx.measureText(txt).width + 22;
    panel(ctx, (w - bw) / 2, h - 40, bw, 22, A);
    ctx.globalAlpha = A;
    ctx.fillStyle = 'rgba(170,232,244,0.95)';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(txt, w / 2, h - 28.5);
    ctx.restore();
  }
  // 浮水印（誠實：這是模擬影像，非真實攝影機畫面）
  function drawWatermark(ctx, h, depth) {
    ctx.fillStyle = 'rgba(34,211,238,0.55)';
    ctx.font = '11px "Roboto Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('SIM · 模擬影像', 12, h - 12);
    ctx.fillText(depth < 0.05 ? 'DEPTH 0.00 m · 水面' : 'DEPTH ' + depth.toFixed(2) + ' m', 12, h - 26);
  }

  // ---------- 主繪製（由 sim-engine 主迴圈每幀呼叫） ----------
  function draw(now) {
    if (!CAM || !window.__SIM) return;
    var S = window.__SIM;
    var c = CAM.c, ctx = CAM.ctx, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    var dt = CAM.lastT ? clamp((now - CAM.lastT) / 1000, 0, 0.05) : 0.016; CAM.lastT = now;

    var st = S.st, a = S.ax;
    var fwd = a.fwd, turn = a.turn;
    var flowX = -turn * 0.55;                          // 轉右 → 世界往左流
    var flowY = clamp(-st.vspeed * 0.7, -1, 1);        // 上升 → 世界往下流（感覺在往上）
    CAM.flowX = flowX;

    // 相機動態：轉向 roll、升降 pitch、觸底/破水 shake（prefers-reduced-motion 時關閉變換）
    var kk = Math.min(1, dt * 4);
    CAM.roll += (-turn * 0.055 - CAM.roll) * kk;
    CAM.pitch += (a.vert * h * 0.045 - CAM.pitch) * kk;
    CAM.shake = Math.max(0, CAM.shake - dt * 2.4);
    CAM.expo = Math.max(0, CAM.expo - dt * 2.6);

    // 水平線：越深越往上（水面退到視野上方）
    var surfaceT = clamp(st.depth / 0.6, 0, 1);
    var bob = Math.sin(now / 700) * 0.012 * (1 - surfaceT);
    var waterline = 0.46 - surfaceT * 0.52 + bob;
    var wlPx = waterline * h + (REDUCED ? 0 : CAM.pitch);
    CAM.wl = wlPx / h;

    var df = clamp(st.depth / 2.5, 0, 1);
    var lit = !!st.ledManual, under = st.depth > 0.05;
    var m = 1 - (lit ? 0.5 : 0.8) * df;                // 越深越暗；開大燈補回一半

    // —— 事件：拍照（圖鑑）/ 破水（splash+曝光）/ 觸底（震動+揚沙）——
    var ph = S.ctrl.ph;
    if (lastPh === null) lastPh = ph;
    else if (ph !== lastPh) { lastPh = ph; onPhoto(); }

    var d0 = CAM.prevDepth, d1 = st.depth;
    if (d0 <= 0.06 && d1 > 0.06) {
      CAM.expo = Math.max(CAM.expo, 0.45); CAM.shake = Math.max(CAM.shake, 0.5);
      if (window.__SIM_AUDIO) window.__SIM_AUDIO.splash();
    } else if (d0 > 0.06 && d1 <= 0.06) {
      CAM.expo = 1;                                    // 破出水面：曝光泛白一下
      if (window.__SIM_AUDIO) window.__SIM_AUDIO.splash();
    }
    if (d0 < S.DEPTH_MAX - 0.01 && d1 >= S.DEPTH_MAX - 0.001) {
      CAM.shake = Math.max(CAM.shake, 1);
      spawnBurst(0.5, 0.92, 12, 45);                   // 觸底揚沙
      if (window.__SIM_AUDIO) window.__SIM_AUDIO.pop(200);
    }
    CAM.prevDepth = d1;

    ctx.clearRect(0, 0, w, h);
    CAM.hits.length = 0;

    // ---- 世界層（roll / shake 變換；scale 1.045 蓋住旋轉露角）----
    ctx.save();
    if (!REDUCED) {
      var shx = (Math.random() - 0.5) * 9 * CAM.shake, shy = (Math.random() - 0.5) * 9 * CAM.shake;
      ctx.translate(w / 2 + shx, h / 2 + shy);
      ctx.rotate(CAM.roll);
      ctx.scale(1.045, 1.045);
      ctx.translate(-w / 2, -h / 2);
    }

    if (waterline > 0) drawSky(ctx, w, h, wlPx, flowX, dt, df);

    // ---- 水下層（裁切在水平線以下）----
    ctx.save();
    var top = Math.max(0, wlPx);
    ctx.beginPath(); ctx.rect(0, top, w, h - top); ctx.clip();

    var g = ctx.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, 'rgb(' + Math.round(20 * m) + ',' + Math.round(130 * m) + ',' + Math.round(140 * m) + ')');
    g.addColorStop(1, 'rgb(' + Math.round(2 * m) + ',' + Math.round(22 * m) + ',' + Math.round(44 * m) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, top, w, h - top);

    drawCaustics(ctx, w, h, top, now, df, m);

    // 表面陽光光束：隨轉向水平掃動，越深越淡
    CAM.beam += turn * dt * 0.35;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < 4; i++) {
      var fr = (((i / 4 + 0.16 + CAM.beam) % 1) + 1) % 1, bx = fr * w;
      var lg = ctx.createLinearGradient(bx, top, bx + w * 0.04, h);
      lg.addColorStop(0, 'rgba(150,230,255,' + (0.13 * (1 - df)) + ')');
      lg.addColorStop(1, 'rgba(150,230,255,0)');
      ctx.fillStyle = lg; ctx.beginPath();
      ctx.moveTo(bx - w * 0.02, top); ctx.lineTo(bx + w * 0.02, top);
      ctx.lineTo(bx + w * 0.08, h); ctx.lineTo(bx - w * 0.06, h);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    drawBed(ctx, w, h, dt, now, st, fwd, m, df);

    updateCreatures(ctx, w, h, dt, now, flowX, flowY, fwd, m, lit && df > 0.4);

    // 氣泡（自身上浮 + 隨升降/轉向串動）
    ctx.strokeStyle = 'rgba(200,240,255,' + (0.2 + 0.3 * m) + ')'; ctx.lineWidth = 1;
    CAM.bubbles.forEach(function (b) {
      b.y -= b.sp * 0.01; b.x += b.drift * 0.004 + flowX * dt * 0.6; b.y += flowY * dt * 0.6;
      if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); } else if (b.y > 1.05) { b.y = -0.05; b.x = Math.random(); }
      if (b.x < -0.05) b.x = 1.05; else if (b.x > 1.05) b.x = -0.05;
      ctx.beginPath(); ctx.arc(b.x * w, b.y * h, b.r, 0, Math.PI * 2); ctx.stroke();
    });

    // 懸浮微粒：前進→自中心放射湧出（飛行感）、轉向/升降→整片平移；移動快畫成拖尾線
    ctx.strokeStyle = 'rgba(205,238,255,' + (0.5 * m + 0.12) + ')';
    CAM.specks.forEach(function (p) {
      var ox = p.x, oy = p.y;
      p.x += flowX * dt * p.z; p.y += (flowY + 0.02) * dt * p.z;
      p.x += (p.x - 0.5) * fwd * dt * 1.4 * p.z;
      p.y += (p.y - 0.5) * fwd * dt * 1.4 * p.z;
      if (p.x < -0.05 || p.x > 1.05 || p.y < -0.05 || p.y > 1.05) {
        if (fwd > 0.15) { p.x = 0.5 + (Math.random() - 0.5) * 0.16; p.y = 0.5 + (Math.random() - 0.5) * 0.16; }
        else { p.x = Math.random(); p.y = Math.random(); }
        p.z = 0.3 + Math.random() * 0.7; ox = p.x; oy = p.y;
      }
      ctx.lineWidth = p.z * 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ox * w, oy * h);
      ctx.lineTo(p.x * w + (p.x - ox) * w * 1.5, p.y * h + (p.y - oy) * h * 1.5); ctx.stroke();
    });

    ctx.restore();   // 結束水下裁切

    if (waterline > -0.02 && waterline < 1.02) {
      drawWaterline(ctx, w, wlPx, now, df);
      drawGlitter(ctx, w, wlPx, df);
    }

    ctx.restore();   // 結束世界變換

    // ---- 相機空間（不旋轉）----
    if (lit && under) drawHeadlight(ctx, w, h, df);
    drawFx(ctx, w, h, dt);
    drawVignette(ctx, w, h);
    if (!REDUCED) drawGrain(ctx, w, h);
    if (CAM.expo > 0.01) { ctx.fillStyle = 'rgba(235,250,255,' + (0.55 * CAM.expo) + ')'; ctx.fillRect(0, 0, w, h); }
    drawRec(ctx, now);
    drawCounters(ctx, w);
    drawHint(ctx, w, h, dt);
    drawWatermark(ctx, h, st.depth);
  }

  // ---------- 切場域：重生垃圾/生物位置（圖鑑進度保留） ----------
  function respawn() {
    if (!CAM) return;
    CAM.school = makeSchool(); CAM.tilapia = makeTilapia(); CAM.carp = makeCarp();
    CAM.shrimp = makeShrimp(); CAM.turtle = null; CAM.turtleT = rand(15, 35);
    CAM.bed = makeBed(); CAM.bedPan = 0;
    trashGot = 0;
  }

  // ---------- 啟動 ----------
  function initCam() {
    var wrap = document.querySelector('.video-wrap');
    var img = document.getElementById('stream');
    var ph = document.getElementById('stream-ph');
    if (!wrap || !img || !window.__SIM) return;
    img.src = TRANSPARENT;                       // 停掉真實 MJPEG，觸發 load → CAM 點亮、不再重連
    if (ph) ph.style.display = 'none';
    var c = document.createElement('canvas');
    c.id = 'sim-cam';                            // 版面（含橫向兩側 --gutter 黑邊）由 style.css 的 #sim-cam 控制
    wrap.insertBefore(c, img.nextSibling);       // 放在 #stream 之後、角框之前 → 角框仍在最上層
    var dc = document.getElementById('dot-cam');
    if (dc) dc.classList.add('on');
    CAM = {
      c: c, ctx: c.getContext('2d'),
      bubbles: makeBubbles(), specks: makeSpecks(), clouds: makeClouds(),
      school: makeSchool(), tilapia: makeTilapia(), carp: makeCarp(), shrimp: makeShrimp(),
      turtle: null, turtleT: rand(12, 30),
      bed: makeBed(), bedPan: 0, flowX: 0,
      beam: 0, sky: 0, lastT: 0,
      parts: [], ripples: [], texts: [], catches: 0, hits: [],
      roll: 0, pitch: 0, shake: 0, expo: 0, prevDepth: 0, wl: 0.46,
      recT0: null, fleeT: 0,
      caustic: makeCausticTile(), noise: makeNoiseTile(),
      vig: null, vigW: 0, vigH: 0, hintA: DESKTOP ? 0.9 : 0,
    };
    c.addEventListener('pointerdown', onCamClick);   // 彩蛋：戳生物
    c.addEventListener('pointermove', onCamMove);    // 滑過生物 → 游標變手指
    window.__SIM.onSite.push(respawn);
  }

  window.__SIM_CAM = {
    draw: draw,
    // 驗證/測試鉤子：目前圖鑑、垃圾數、戳魚數、烏龜在不在場
    state: function () { return { dex: Object.keys(dex), trash: trashGot, catches: CAM ? CAM.catches : 0, turtle: !!(CAM && CAM.turtle) }; },
    hits: function () { return CAM ? CAM.hits.slice() : []; },
  };

  // app.js 於本檔之後同步執行 boot()；setTimeout(0) 確保 initCam 在 initStream 設好 #stream 之後跑。
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(initCam, 0); });
  else setTimeout(initCam, 0);
})();
