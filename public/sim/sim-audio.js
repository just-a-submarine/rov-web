'use strict';
// =============================================================================
//  模擬器極簡音效（sim-audio.js）— 全 WebAudio 即時合成，零音檔、零依賴
//  - 連續音：馬達嗡鳴（鋸齒波＋低通，音量/音高隨油門）、水體環境噪（入水才有）
//  - 事件音：氣泡、快門、撈起「叮」、破水 splash、低沉觸底、完成小號角
//  - 首次手勢（pointerdown/keydown）才建 AudioContext（瀏覽器 autoplay 限制）
//  - 🔊/🔇 鈕在頂列 HUD（#btn-snd，沿用 .fs-btn 樣式）；狀態記 localStorage
//  - 由 sim-engine 的主迴圈每幀呼叫 tick(dt)；事件音由 sim-cam 呼叫
// =============================================================================

(function () {
  var ac = null, master = null, noiseBuf = null;
  var motorOsc = null, motorLP = null, motorGain = null, ambGain = null;
  var VOL = 0.12;          // 整體低調（背景陪襯，不搶戲）
  var bubbleT = 0.8;       // 下一顆環境氣泡倒數（秒）
  var muted = false;
  try { muted = localStorage.getItem('sim-muted') === '1'; } catch (_) {}

  function makeNoise() {
    var len = ac.sampleRate, buf = ac.createBuffer(1, len, ac.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function init() {
    if (ac) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { ac = new AC(); } catch (_) { return; }
    master = ac.createGain();
    master.gain.value = muted ? 0 : VOL;
    master.connect(ac.destination);
    noiseBuf = makeNoise();

    // 馬達：鋸齒波 → 低通 → 增益（tick 內跟著油門連續調）
    motorOsc = ac.createOscillator(); motorOsc.type = 'sawtooth'; motorOsc.frequency.value = 50;
    motorLP = ac.createBiquadFilter(); motorLP.type = 'lowpass'; motorLP.frequency.value = 300;
    motorGain = ac.createGain(); motorGain.gain.value = 0;
    motorOsc.connect(motorLP); motorLP.connect(motorGain); motorGain.connect(master);
    motorOsc.start();

    // 水體環境：白噪循環 → 重低通（像悶悶的水流聲）
    var amb = ac.createBufferSource(); amb.buffer = noiseBuf; amb.loop = true;
    var ambLP = ac.createBiquadFilter(); ambLP.type = 'lowpass'; ambLP.frequency.value = 220;
    ambGain = ac.createGain(); ambGain.gain.value = 0;
    amb.connect(ambLP); ambLP.connect(ambGain); ambGain.connect(master);
    amb.start();
  }

  function resume() {
    init();
    if (ac && ac.state === 'suspended') {
      var p = ac.resume();
      if (p && p.catch) p.catch(function () {});
    }
  }
  window.addEventListener('pointerdown', resume, { capture: true });
  window.addEventListener('keydown', resume, { capture: true });

  // 短噪音爆（氣泡/快門/觸底/splash 的底層）
  function burst(type, freq, q, peak, dur) {
    if (!ac || muted || ac.state !== 'running') return;
    var src = ac.createBufferSource(); src.buffer = noiseBuf;
    var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = ac.createGain(), t = ac.currentTime;
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  // 短音符（叮/號角的底層）
  function tone(type, f0, f1, peak, dur, when) {
    if (!ac || muted || ac.state !== 'running') return;
    var o = ac.createOscillator(); o.type = type;
    var t = ac.currentTime + (when || 0);
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  window.__SIM_AUDIO = {
    // 每幀：馬達/環境音跟著 __SIM 狀態走
    tick: function (dt) {
      if (!ac || ac.state !== 'running' || !window.__SIM) return;
      var a = window.__SIM.ax, st = window.__SIM.st, t = ac.currentTime;
      var effort = (Math.abs(a.fwd) + Math.abs(a.turn) + Math.abs(a.vert)) / 1.6;
      if (effort > 1) effort = 1;
      var under = st.depth > 0.05;

      motorGain.gain.setTargetAtTime(effort > 0.02 ? 0.16 + 0.5 * effort : 0, t, 0.08);
      motorOsc.frequency.setTargetAtTime(46 + effort * 60, t, 0.1);
      motorLP.frequency.setTargetAtTime(under ? 230 + effort * 170 : 380 + effort * 260, t, 0.12);  // 水下更悶
      ambGain.gain.setTargetAtTime(under ? 0.05 + effort * 0.05 : 0.012, t, 0.3);

      if (under && !muted) {                       // 環境氣泡：隨機叮咚
        bubbleT -= dt;
        if (bubbleT <= 0) {
          bubbleT = 0.35 + Math.random() * 1.4;
          burst('bandpass', 700 + Math.random() * 1600, 6, 0.04 + Math.random() * 0.05, 0.09 + Math.random() * 0.1);
        }
      }
    },
    click:   function () { burst('highpass', 2400, 1, 0.22, 0.05); },          // 快門
    pop:     function (f) { burst('lowpass', f || 480, 1, 0.18, 0.11); },      // 戳魚/觸底（低頻悶響）
    splash:  function () { burst('bandpass', 520, 1.2, 0.3, 0.32); },          // 破水
    ding:    function () { tone('triangle', 880, 1318, 0.2, 0.22); },          // 撈起/新收錄
    fanfare: function () {                                                      // 達成（小號角）
      tone('triangle', 523, 0, 0.16, 0.12, 0);
      tone('triangle', 659, 0, 0.16, 0.12, 0.1);
      tone('triangle', 784, 0, 0.16, 0.12, 0.2);
      tone('triangle', 1046, 0, 0.2, 0.32, 0.3);
    },
    muted: function () { return muted; },
  };

  // 🔊/🔇 鈕（#btn-snd，頂列 HUD、沿用 .fs-btn 樣式 → 視覺與全螢幕鈕一致）
  function initBtn() {
    var b = document.getElementById('btn-snd');
    if (!b) return;
    var paint = function () {
      b.textContent = muted ? '🔇' : '🔊';
      b.style.opacity = muted ? '.55' : '1';
      b.title = muted ? '音效：關' : '音效：開';
    };
    paint();
    b.addEventListener('click', function () {
      muted = !muted;
      try { localStorage.setItem('sim-muted', muted ? '1' : '0'); } catch (_) {}
      resume();
      if (ac && master) master.gain.setTargetAtTime(muted ? 0 : VOL, ac.currentTime, 0.05);
      paint();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initBtn);
  else initBtn();
})();
