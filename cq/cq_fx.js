'use strict';
// cq/cq_fx.js — 战场特效层，移植自传奇之旅 js/fx.js 的 canvas 部分（序列帧 sheet、粒子、光环、拖尾、合击蓄力/冲击）。
// 规则：所有特效只播一次 —— sheet 播完即删、粒子寿命到即删、队列空了 rAF 自动停（不常驻循环）。
// DOM 一次性动画统一用 CQ.FX.once(el, cls)：animationend 后移除 class / 节点，绝不使用 infinite（唯一例外是怪物卡片呼吸，在 cq.css）。
(function(){
  var W0 = typeof window !== 'undefined' ? window : globalThis, CQ = W0.CQ = W0.CQ || {};
  var BASE = 'assets/cq/fx/', MAX_P = 360;
  var sheets = {}, canvas = null, ctx = null, dpr = 1, Wd = 390, Hd = 600;
  var parts = [], anims = [], rings = [], running = false, last = 0, low = false;
  var HEJI_DIRS = ['heji_pohunzhan', 'heji_pixingzhan', 'heji_leitingyiji', 'heji_huolongqiyan', 'heji_shihunzhaoze', 'heji_morishenpan'];
  var HEJI_COL = {heji_pohunzhan: ['#fff3b0', '#ff8a00'], heji_pixingzhan: ['#fffbe0', '#ffd34d'], heji_leitingyiji: ['#e6f2ff', '#6fb8ff'],
    heji_huolongqiyan: ['#fff2a8', '#ff4d00'], heji_shihunzhaoze: ['#e2c4ff', '#5fd36b'], heji_morishenpan: ['#fff6c0', '#ffd34d']};
  var HEJI_WIND = 280;
  function loadSheet(dir){
    if (sheets[dir]) return sheets[dir];
    var s = sheets[dir] = {ok: false, failed: false};
    if (typeof fetch !== 'function') { s.failed = true; return s; }
    fetch(BASE + dir + '/fx.json').then(function(r){ if (!r.ok) throw 0; return r.json(); }).then(function(meta){
      var img = new Image(); img.onload = function(){ s.img = img; s.meta = meta; s.cols = Math.max(1, Math.floor(img.width / meta.frameW)); s.ok = true; };
      img.onerror = function(){ s.failed = true; }; img.src = BASE + dir + '/sheet.png';
    }).catch(function(){ s.failed = true; });
    return s;
  }
  function preload(){ HEJI_DIRS.forEach(function(d){ loadSheet(d); loadSheet(d + '_charge'); }); SKILL_DIRS.forEach(loadSheet); }
  function attach(cv, w, h){ canvas = cv; ctx = cv.getContext('2d'); resize(w, h); }
  function resize(w, h){ Wd = w; Hd = h; dpr = Math.min(2, W0.devicePixelRatio || 1); if (!canvas) return;
    var bw = Math.round(w * dpr), bh = Math.round(h * dpr); if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; } }
  function kick(){ if (running || !canvas) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
  function P(o){ var cap = low ? 120 : MAX_P; if (parts.length >= cap) parts.shift(); o.life = o.max = o.life || .6; o.vx = o.vx || 0; o.vy = o.vy || 0; o.g = o.g || 0; o.s = o.s || 4; o.drag = o.drag == null ? .98 : o.drag; parts.push(o); kick(); return o; }
  function burst(x, y, n, col, spd, size, life, up){ if (low) n = Math.ceil(n / 3);
    for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, v = spd * (.3 + Math.random()); P({x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (up || 0), s: size * (.5 + Math.random()), c: col[i % col.length], life: life * (.6 + Math.random() * .6)}); } }
  function ring(x, y, r0, r1, col, life, w){ rings.push({x: x, y: y, r0: r0, r1: r1, c: col, life: life, max: life, w: w || 6}); kick(); }
  function sprite(dir, x, y, o){ var s = loadSheet(dir); if (!s.ok) return false; o = o || {};
    anims.push({s: s, x: x, y: y, t: 0, scale: o.scale || 1, done: o.done, tx: o.tx, ty: o.ty, dur: o.dur, line: !!o.line}); kick(); return true; }
  // 能量流：从 s 飞向 t 的拖尾粒子（原 trailFollow）
  function trail(s, t, dur, cols){ var n = low ? 6 : 16; for (var i = 0; i < n; i++) (function(i){ setTimeout(function(){
      var f = i / n; P({x: s.x + (t.x - s.x) * f, y: s.y + (t.y - s.y) * f - Math.sin(f * Math.PI) * 40, vx: (Math.random() - .5) * 40, vy: (Math.random() - .5) * 40, s: 7, c: cols[i % cols.length], life: .35}); }, dur * 1000 * i / n); })(i); }
  function hejiImpact(dir){ var sh = sheets[dir]; if (!(sh && sh.ok)) return 60; var me = sh.meta;
    return me.impact != null && isFinite(+me.impact) ? Math.round(Math.max(0, Math.min(me.frames - 1, +me.impact)) / me.fps * 1000) : Math.round(me.frames / me.fps * 350); }
  // 合击：蓄力(角色+英雄身上 charge sheet + 能量流) → HEJI_WIND 后在每个目标上播 sheet → impact 帧回调 onImpact(k)
  function heji(o, pos, onImpact){
    var col = HEJI_COL[o.fx] || HEJI_COL.heji_pohunzhan, cdir = o.fx + '_charge', imp = hejiImpact(o.fx);
    var t0 = pos.targets[0] || {x: Wd / 2, y: Hd / 2};
    [pos.role, pos.hero].forEach(function(p){ if (!p) return; if (!sprite(cdir, p.x, p.y, {scale: .7})) ring(p.x, p.y, 50, 8, col[1], HEJI_WIND / 1000, 5); trail(p, t0, (HEJI_WIND - 60) / 1000, col); });
    setTimeout(function(){
      pos.targets.forEach(function(t){ if (!sprite(o.fx, t.x, t.y, {scale: .62})) { ring(t.x, t.y, 10, 90, col[1], .5, 6); burst(t.x, t.y, 24, [col[0], col[1], '#fff'], 260, 6, .5); } });
      pos.targets.forEach(function(t, k){ setTimeout(function(){ burst(t.x, t.y, 12, [col[0], col[1], '#ffffff'], 240, 4, .45); if (onImpact) onImpact(k); }, imp + k * 60); });
    }, HEJI_WIND);
    return HEJI_WIND + imp;
  }
  // 普通技能序列帧（传奇之旅 assets/fx，只播一次）：projectile 从施法者飞向目标、onTarget 落在目标、onSelf 落在施法者
  var SKILL_DIRS = ['kangjuhuohuan', 'diyuhuo', 'youhuozhiguang', 'yinshenshu', 'huoqiu', 'leidianshu', 'banyue', 'liehuo', 'gongsha', 'bingpaoxiao', 'huoqiang', 'linghunhuofu', 'shidu', 'zhiliaoshu', 'yemanchongzhuang', 'mofadun', 'zhaohuan', 'shenshengzhanjia'];
  var lastSkill = 0;
  function playSkill(dir, s, t){ if (!dir) return false; var now = performance.now(); if (now - lastSkill < (low ? 900 : 320)) return false;
    var sh = loadSheet(dir); if (!sh.ok) return false; lastSkill = now; var ty = sh.meta.type, sc = .62;
    if (ty === 'projectile' && s && t) return sprite(dir, s.x, s.y, {tx: t.x, ty: t.y, dur: .38, scale: .5, done: function(){ burst(t.x, t.y, 14, ['#fff2a8', '#ffb300', '#ff4d00'], 220, 5, .4); ring(t.x, t.y, 6, 50, 'rgba(255,200,120,.9)', .3, 5); }});
    if (ty === 'line' && s) { var tt = t || {x: s.x + 1, y: s.y}, dx = tt.x - s.x, dy = tt.y - s.y, L = Math.hypot(dx, dy) || 1; // 身前 18px 起
      return sprite(dir, s.x + dx / L * 18, s.y + dy / L * 18, {tx: tt.x, ty: tt.y, line: true, scale: Math.max(.6, Math.min(1.2, (L + 20) / 192))}); }
    var p = ty === 'onSelf' ? s : (t || s); return p ? sprite(dir, p.x, p.y, {scale: sc}) : false; }
  function loop(now){
    if (!canvas) { running = false; return; }
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = rings.length - 1; i >= 0; i--) { var r = rings[i]; r.life -= dt; if (r.life <= 0) { rings.splice(i, 1); continue; }
      var p = 1 - r.life / r.max; ctx.globalAlpha = 1 - p; ctx.strokeStyle = r.c; ctx.lineWidth = r.w * (1 - p) + 1; ctx.beginPath(); ctx.arc(r.x, r.y, r.r0 + (r.r1 - r.r0) * (1 - (1 - p) * (1 - p)), 0, Math.PI * 2); ctx.stroke(); }
    for (i = parts.length - 1; i >= 0; i--) { var q = parts[i]; q.life -= dt; if (q.life <= 0) { parts.splice(i, 1); continue; }
      var a = q.life / q.max; q.vx *= q.drag; q.vy = q.vy * q.drag + q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt; glow(q.x, q.y, q.s, q.c, a); }
    for (i = anims.length - 1; i >= 0; i--) { var an = anims[i], s = an.s, me = s.meta; an.t += dt;
      var fr = Math.floor(an.t * me.fps), ax = an.x, ay = an.y;
      if (an.dur) { var ff = Math.min(1, an.t / an.dur); ax = an.x + (an.tx - an.x) * ff; ay = an.y + (an.ty - an.y) * ff; fr = fr % me.frames; if (ff >= 1) { anims.splice(i, 1); if (an.done) an.done(); continue; } }
      else if (fr >= me.frames) { anims.splice(i, 1); if (an.done) an.done(); continue; }
      var sw = me.frameW, sh = me.frameH, c = fr % s.cols, row = Math.floor(fr / s.cols), dw = sw * an.scale, dh = sh * an.scale;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = me.blend === 'lighter' ? 'lighter' : 'source-over';
      if (an.line) { // line：帧左缘中点=火柱根部，锚在施法者身前；按朝向目标旋转，面朝左时水平翻转
        var ldx = (an.tx != null ? an.tx : an.x + 1) - an.x, ldy = (an.ty != null ? an.ty : an.y) - an.y, flip = ldx < 0, ang = Math.atan2(ldy, Math.abs(ldx) || 1e-6);
        ctx.save(); ctx.translate(an.x, an.y); if (flip) ctx.scale(-1, 1); ctx.rotate(ang); ctx.drawImage(s.img, c * sw, row * sh, sw, sh, 0, -dh / 2, dw, dh); ctx.restore(); }
      else ctx.drawImage(s.img, c * sw, row * sh, sw, sh, ax - dw / 2, ay - dh / 2, dw, dh);
      ctx.globalCompositeOperation = 'lighter'; }
    ctx.globalAlpha = 1;
    if (parts.length || anims.length || rings.length) requestAnimationFrame(loop);
    else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); running = false; }
  }
  function glow(x, y, r, c, a){ if (r <= .5) return; ctx.globalAlpha = a; var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  // 一次性 DOM 动画：加 class，animationend 后移除；remove=true 则移除节点。带兜底超时，防止 animationend 丢失。
  function once(el, cls, remove, ms){ if (!el) return; if (cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
    var done = function(){ el.removeEventListener('animationend', h); clearTimeout(el['_cqT' + cls]); if (remove) { if (el.parentNode) el.parentNode.removeChild(el); } else if (cls) el.classList.remove(cls); };
    var h = function(e){ if (e.target === el) done(); };
    el.addEventListener('animationend', h); clearTimeout(el['_cqT' + cls]); el['_cqT' + cls] = setTimeout(done, ms || 1600); }
  function clear(){ parts.length = anims.length = rings.length = 0; }
  CQ.FX = {playSkill: playSkill, SKILL_DIRS: SKILL_DIRS, attach: attach, resize: resize, preload: preload, loadSheet: loadSheet, sprite: sprite, burst: burst, ring: ring, trail: trail, heji: heji, hejiImpact: hejiImpact, once: once, clear: clear,
    setLow: function(v){ low = !!v; }, stats: function(){ return {parts: parts.length, anims: anims.length, rings: rings.length, running: running}; }, HEJI_COL: HEJI_COL};
})();
