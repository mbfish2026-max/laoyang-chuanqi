'use strict';
// cq/cq_scene.js — 老羊传奇卡片战场（M1）。
// 来源：传奇之旅 js/ui.js buildScene/moveCard/fitBoss（卡片战场+走位落位）、js/popcard.js（出场/攻击/受击/倒下）、js/fx.js（飘字/合击），
//       视觉按 /workspace/design/chuanqi_v2_live 样稿：金属顶栏、首领大血条、技能冷却圈、合击演出、暴击大字、掉落光柱、地面掉落标签。
// 数据：全部经 CQ.Host（cq_bridge.js）读写；本文件不直接碰 game.js 全局。
// 规则：特效只播一次（CQ.FX.once / animation 1 次）；只有怪物卡片立绘呼吸是循环动画。
(function(){
  var W0 = typeof window !== 'undefined' ? window : globalThis, CQ = W0.CQ = W0.CQ || {};
  var UI = 'assets/cq/ui/', DW = 390, TOPH = 62, BOTH = 116, POTH = 0;
  var MAX_FLOATS = 22, LOOT_LIFE = 9000;
  var st = null;       // 场景状态
  function h(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }
  function fmt(n){ n = Math.round(n || 0); return n.toLocaleString ? n.toLocaleString('en-US') : String(n); }
  function txt(e, v){ v = String(v); if (e && e.textContent !== v) e.textContent = v; }
  function wpct(e, p){ var v = Math.max(0, Math.min(100, p)).toFixed(1) + '%'; if (e && e.style.width !== v) e.style.width = v; }

  // ---------- 布局 ----------
  // 格子（照搬传奇之旅 map_battle/fight_battle battleNode：750 设计宽，6×5，cell 120×125，间距 2，左内边距 9，上内边距 4；
  //   纵向按 stretchBattle 规则把多出的高度均分给行距）。390 宽 → k=0.52：cell 62.4×65，列距 63.44，首列中心 x=35.9。
  // 网格固定，不随首领出现/消失移动（首领条盖在顶部，网格顶 = 首领条下沿），所有单位只站格子中心、底边对齐格子底边。
  var PICKH = 124, GK = DW / 750, CELLW = 120 * GK, CELLH = 125 * GK, GAPX = 2 * GK, PADL = 9 * GK, GRID_TOP = 150;
  function geom(){ var g = st.g, M = CQ.MOVE, top = GRID_TOP, bot = g.H - BOTH - POTH - PICKH;   /* M1.9：网格底边让出右下「一键拾取」那一行（pick 在 pb-120），按钮不再压最后一排格子 */
    var rowStep = Math.max(CELLH + 2 * GK, (bot - top - CELLH) / (M.ROWS - 1)), colStep = CELLW + GAPX;
    return {top: top, bot: bot, rowStep: rowStep, colStep: colStep}; }
  function cellCenter(idx){ var p = CQ.MOVE.xy(idx), G = geom(); return {x: PADL + p[0] * G.colStep + CELLW / 2, bottom: G.top + p[1] * G.rowStep + CELLH, row: p[1], col: p[0]}; }
  // 卡片尺寸（M1.5）：原版 itemRole 卡 = 格子 120×125（卡:格 = 1:1），这里按同比例缩到列距减 2.5px，相邻卡留 ≈2.5px 间距、不重叠。
  //   首领同原版只占 1 格（BOSS_MIN 之后的格），立绘可向上探出卡外（原版 _popFig/fitBoss）；英雄、角色、召唤物都用同一张格子卡尺寸。
  var CARD_GAP = 2.5, CARDW = Math.floor((CELLW + GAPX - CARD_GAP) * 2) / 2, CARDH = Math.floor(CARDW * 125 / 120 * 2) / 2;
  function cellBox(idx, kind){ var c = cellCenter(idx), w = CARDW, hh = CARDH;
    var x = c.x - w / 2, y = c.bottom - hh;
    return {x: x, y: y, w: w, h: hh, cx: x + w / 2, cy: y + hh * .45, row: c.row}; }
  function place(el, box, z){ var t = 'translate(' + Math.round(box.x) + 'px,' + Math.round(box.y) + 'px)'; if (el.style.transform !== t) el.style.transform = t; if (z != null && el.style.zIndex != z) el.style.zIndex = z;
    var W = box.w + 'px', H = box.h + 'px'; if (el.style.width !== W) el.style.width = W; if (el.style.height !== H) el.style.height = H; }

  // ---------- 构建 ----------
  function build(stage){
    var root = h('div', 'cqb');
    root.innerHTML =
      '<div class="world"><div class="field"></div><div class="layer" data-r="units"></div><div class="layer" data-r="loot"></div></div>' +
      '<canvas class="cqfx"></canvas><div class="layer" data-r="fx" style="pointer-events:none;z-index:36"></div>' +
      '<div class="top"><div class="ava"></div><div class="pinfo"><div class="clv"><span data-r="pn"></span><small data-r="pw"></small></div>' +
        '<div class="cbar hp"><i data-r="hp"></i></div><div class="cbar mp"><i data-r="mp"></i></div><div class="cbar xp"><i data-r="xp"></i></div></div>' +
        '<div class="ccur"><div><img src="' + UI + 'coin.png" alt=""><span data-r="gold"></span></div><div><img src="' + UI + 'yb.png" alt=""><span data-r="yb"></span></div></div>' +
        '<div class="menu metal" data-a="menu" title="英雄 / 合击说明"><b></b><b></b><b></b></div></div>' +
      '<div class="bossbar metal" data-a="plaque"><div class="head" data-r="bhead"></div><div class="bn"><span data-r="bname"></span><small>首领</small><em data-r="blv"></em></div>' +
        '<div class="bbar"><div class="trail" data-r="btrail"></div><div class="fill" data-r="bfill"></div><div class="txt" data-r="btxt"></div><div class="x" data-r="bx"></div></div>' +
        '<div class="csub"><span><i data-r="blab">战斗用时</i> <b data-r="btime">00:00</b></span><span data-r="bwave"></span></div></div>' +
      '<div class="plaque metal" data-r="plaque" data-a="plaque" title="切换区域"></div>' +
      '<div class="ticker glass"><div class="rows" data-r="ticker"></div></div>' +
      '<div class="side" data-r="side"><div class="chip glass" data-a="auto"></div><div class="chip glass" data-a="zauto" data-r="zauto"></div></div>' +
      '<div class="pick" data-a="pick" data-r="pick"></div>' +
      '<div class="zpop metal" data-r="zpop"><button data-a="zprev">◀</button><span data-r="zname"></span><button data-a="znext">▶</button><button data-a="zmap">地图</button></div>' +
      '<div class="hpanel metal" data-r="hpanel"></div>' +
      '<div class="bottom"><div class="skills" data-r="skills"></div></div>';
    stage.innerHTML = ''; stage.appendChild(root);
    var R = {}; root.querySelectorAll('[data-r]').forEach(function(e){ R[e.getAttribute('data-r')] = e; });
    // 技能栏：2 技能 + 合击 + 2 技能（样稿 bottom()）
    var C = 2 * Math.PI * 48;
    var sk = function(i){ return '<div class="csk cempty" data-a="sk" data-sk="' + i + '"><div class="ic"></div><div class="cd" style="--p:100%"></div><div class="cdt"></div><div class="key"></div></div>'; };
    R.skills.innerHTML = sk(0) + sk(1) + '<div class="heji" data-a="heji"><svg viewBox="0 0 104 104"><circle cx="52" cy="52" r="48" fill="none" stroke="rgba(0,0,0,.6)" stroke-width="5"/><circle data-ring cx="52" cy="52" r="48" fill="none" stroke="#ff7a2a" stroke-width="5" stroke-linecap="round" stroke-dasharray="0 ' + C + '"/></svg><img src="' + UI + 'btn_heji.png" alt=""><div class="t">合击</div><div class="rg"></div></div>' + sk(2) + sk(3);
    R.sk = [].slice.call(R.skills.querySelectorAll('.csk')); R.heji = R.skills.querySelector('.heji'); R.ring = R.heji.querySelector('[data-ring]'); R.ringC = C;
    R.root = root; R.world = root.querySelector('.world'); R.canvas = root.querySelector('canvas.cqfx'); R.ava = root.querySelector('.ava');
    root.addEventListener('click', onClick);
    return R;
  }
  function onClick(e){ var a = e.target.closest && e.target.closest('[data-a]'); if (!a) return; var k = a.getAttribute('data-a');
    if (k === 'heji' && !st.hero.present()) toggleHeroPanel(true);
    else if (k === 'heji') { var r = doHejiNow(); if (!r.ok) CQ.Host.toast(r.msg); }
    else if (k === 'auto') { st.hero.h.autoHeji = !st.hero.h.autoHeji; st.hero.persist(); renderSide(); }
    else if (k === 'pick') pickAll();
    else if (k === 'sk') { var id = a._id; if (id && CQ.Host.skillPop) CQ.Host.skillPop(id); }
    else if (k === 'menu' || k === 'hero') toggleHeroPanel();
    else if (k === 'hclose') toggleHeroPanel(false);
    else if (/^h(create|equip|unequip|rename)$/.test(k)) heroAct(k, a);
    else if (k === 'plaque') { st.R.zpop.style.top = (st.bossOn ? 154 : 100) + 'px'; st.R.zpop.classList.toggle('on'); }
    else if (k === 'zprev' || k === 'znext') { CQ.Host.zoneNav(k === 'zprev' ? -1 : 1); st.R.zpop.classList.remove('on'); }
    else if (k === 'zauto') { CQ.Host.autoAdv(true); renderSide(); }
    else if (k === 'zmap') { st.R.zpop.classList.remove('on'); CQ.Host.openMap(); }
  }

  // ---------- 生命周期 ----------
  function mount(stage){
    if (st && st.stage === stage && stage.contains(st.R.root)) return;
    var role = CQ.Host.role();
    st = {stage: stage, R: build(stage), b: {mons: [], roleIdx: null, _pets: []}, views: {}, floats: 0, loots: [], lastT: 0, raf: 0, paused: false, bossOn: false, bossT0: 0, uiT: 0, logKey: '', g: {s: 1, H: 600}};
    st.hero = CQ.heroCore ? CQ.heroCore() : new CQ.Hero(CQ.HEJI.PROF[role.cls] || 1, CQ.Host.store());   // 英雄核心在 cq_bridge（step 内出手），战斗页只做表现
    st.b._pets = st.hero.present() ? [st.hero.unit] : [];
    CQ.MOVE.config({range: CQ.Host.range, walk: function(){ return 1.3; }});
    st.R.ava.className = 'ava ' + (role.cls === 'ds' ? 'ds' : '');
    // 角色 / 英雄立绘
    st.roleEl = unitFigure('me', roleArt(role.cls), role.name);
    st.heroEl = unitFigure('pet', heroArt(st.hero.h.prof), st.hero.h.name); st.heroEl.setAttribute('data-a', 'hero');
    st.heroHb = h('div', 'hhb', '<i></i>'); st.heroEl.querySelector('.in').appendChild(st.heroHb); st.heroRv = h('div', 'hrv'); st.heroEl.querySelector('.in').appendChild(st.heroRv);
    CQ.FX.attach(st.R.canvas, DW, 600); CQ.FX.preload();
    layout(); if (W0.ResizeObserver) { st.ro = new ResizeObserver(layout); st.ro.observe(stage); }
    renderSide(); start();
  }
  // 换角色/换职业（stash newChar/switchChar、转职）后刷新角色卡名字与形象：renderUI 10Hz 比对 name|cls，变了才动 DOM
  function refreshRole(){ var r = CQ.Host.role(), k = r.name + '|' + r.cls; if (st._roleK === k) return; var first = st._roleK == null; st._roleK = k; if (first) return;
    var nm = st.roleEl.querySelector('.hn'), img = st.roleEl.querySelector('img'); txt(nm, r.name); var src = UI + (roleArt(r.cls)) + '.png';
    if (img.getAttribute('src') !== src) img.setAttribute('src', src); st.R.ava.className = 'ava ' + (r.cls === 'ds' ? 'ds' : ''); onHeroChange(); }
  function unitFigure(kind, img, name){ var e = h('div', 'hero ' + (kind === 'me' ? 'me' : 'pet'), '<div class="in"><div class="shadow"></div><div class="hn">' + esc(name) + '</div><img src="' + UI + img + '.png" alt=""></div>'); st.R.units.appendChild(e); return e; }
  function layout(){ if (!st) return; var w = st.stage.clientWidth || DW, hh = st.stage.clientHeight || 600, s = w / DW;
    st.g = {s: s, H: Math.max(420, hh / s)}; var r = st.R.root; r.style.transform = 'scale(' + s + ')'; r.style.height = st.g.H + 'px';
    st.R.canvas.style.width = DW + 'px'; st.R.canvas.style.height = st.g.H + 'px'; CQ.FX.resize(DW, st.g.H);
    var H = st.g.H, pb = H - BOTH - POTH; st.R.ticker.parentNode.style.top = (pb - 92) + 'px';
    st.R.side.style.top = (pb - 78) + 'px'; st.R.pick.style.top = (pb - 120) + 'px'; st.R.zpop.style.top = (st.bossOn ? 154 : 100) + 'px';
    Object.keys(st.views).forEach(function(k){ st.views[k]._pos = null; }); }
  function start(){ if (st.raf || st.paused) return; st.lastT = performance.now(); st.raf = requestAnimationFrame(frame); }
  function stop(){ if (st && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; } }
  function pause(){ if (!st) return; st.paused = true; stop(); st.stage.classList.add('cq-paused'); CQ.FX.clear(); st.hero.persist(); }
  function resume(){ if (!st) return; st.paused = false; st.stage.classList.remove('cq-paused'); start(); }
  function unmount(){ if (!st) return; pause(); if (st.ro) st.ro.disconnect(); st.stage.innerHTML = ''; st = null; }

  // ---------- 每帧 ----------
  function frame(now){
    st.raf = 0; if (st.paused) return;
    var dt = Math.min(.1, (now - st.lastT) / 1000); st.lastT = now;
    try { sync(dt, now); } catch (e) { if (W0.console) console.error('[CQ] frame', e); }
    st.raf = requestAnimationFrame(frame);
  }
  function kindOf(v){ return v.boss ? 'boss' : 'mon'; }
  // ---------- 召唤物小卡（M1.3）：只做表现，伤害归职业开发（game.js step 的 ALLY） ----------
  function petCard(a){ var art = CQ.Host.petArt(a), lv = CQ.Host.petLvl(a);
    var e = h('div', 'card cpet spawn', '<div class="in"><div class="bd"></div>' + (art ? '<img class="fig" alt="" src="' + esc(art) + '">' : '') + '<span class="pic"' + (art ? ' style="display:none"' : '') + '>' + esc(a.ic || '🐾') + '</span>' +
      '<div class="clv">' + (lv ? 'Lv.' + lv : '') + '</div><div class="cnm">' + esc(a.n || '召唤物') + '</div><div class="hb"><i></i></div></div>');
    var img = e.querySelector('img'), fb = CQ.Host.petArtFb ? CQ.Host.petArtFb(a) : null; if (img) img.onerror = function(){ if (fb && img.getAttribute('src') !== fb) { img.src = fb; return; } img.remove(); e.querySelector('.pic').style.display = ''; };   // 没图→原版模型→emoji
    e.style.transform = 'translate(-200px,-200px)'; st.R.units.appendChild(e); CQ.FX.once(e, 'spawn', false, 600); return e; }
  function syncPets(){ var live = CQ.Host.pets(), seen = {}, P = st.pets || (st.pets = {}), ev = CQ.petEvents && CQ.petEvents();
    live.forEach(function(a){ seen[a.uid] = 1; var pv = P[a.uid];
      if (!pv) { pv = P[a.uid] = {uid: a.uid, ref: a, unit: {isPet: true, hp: 1, idx: null}, lastHp: a.hp}; pv.el = petCard(a); pv.hb = pv.el.querySelector('.hb i'); petFx(pv, 'zhaohuan'); }
      pv.ref = a; if (!ev && a.hp < pv.lastHp - .5) petHurt(pv, Math.round(pv.lastHp - a.hp)); pv.lastHp = a.hp; });
    Object.keys(P).forEach(function(k){ if (!seen[k]) petDie(P[k]); });
    var units = st.hero.present() ? [st.hero.unit] : []; Object.keys(P).forEach(function(k){ units.push(P[k].unit); }); st.b._pets = units;
    Object.keys(P).forEach(function(k){ var pv = P[k], u = pv.unit; if (u.idx == null) return; var key = u.idx + (st.bossOn ? 'b' : ''); if (pv._pos === key) return; pv._pos = key; pv.box = cellBox(u.idx, 'pet'); place(pv.el, pv.box, 11 + pv.box.row * 3); }); }
  function petFx(pv, dir){ var b = pv.box; setTimeout(function(){ if (!st) return; b = pv.box || b; if (b) CQ.FX.sprite(dir, b.cx, b.cy, {scale: .5}); }, 60); }
  function petHurt(pv, d){ var b = pv.box; if (b && d > 0) float(b.cx + (Math.random() - .5) * 12, b.y + 10, '-' + fmt(d), 'me'); CQ.FX.once(pv.el, 'hit', false, 600); }
  function petDie(pv){ if (!pv || pv.dead) return; pv.dead = true; delete st.pets[pv.uid]; var b = pv.box; if (b) CQ.FX.burst(b.cx, b.cy, 12, ['#9effa0', '#3a8a3a', '#ffffff'], 160, 4, .5); CQ.FX.once(pv.el, 'die', true, 800); }
  function petsHP(){ var P = st.pets || {}; Object.keys(P).forEach(function(k){ var pv = P[k], a = pv.ref; wpct(pv.hb, a.max ? a.hp / a.max * 100 : 0); }); }
  // 事件（CQSys pet:spawn/hit/atk/die 优先；fallback=true 来自桥接的 hitMon 兜底）
  function onPet(k, d, fallback){ if (!st || st.paused) return; var pv = (st.pets || {})[d.uid];
    if (k === 'spawn') { syncPets(); return; } if (!pv) return;
    if (k === 'hit') petHurt(pv, Math.round(d.dmg || 0));
    else if (k === 'atk') { var t = d.tgt && typeof d.tgt === 'object' ? d.tgt : (CQ.Host.mons().filter(function(m){ return m.uid === d.tgt; })[0]); if (t) { lunge(pv.el, pv.unit.idx, t); hitFlash(t); } }
    else if (k === 'die') petDie(pv); }
  // 英雄事件（来自 cq_bridge 的 step 内英雄核心）：普攻前冲、受伤飘字、阵亡变灰、复活
  function onHeroEvent(ev){ if (!st || st.paused || !ev) return; var u = st.hero.unit;
    if (ev.type === 'heji') { playHeji(ev); return; }
    if (ev.type === 'heroatk') { lunge(st.heroEl, u.idx, ev.target); return; }
    if (ev.type === 'herorevive') { st._heroPos = null; st.heroEl.classList.remove('dead'); CQ.Host.log('<span style="color:#7dff8a">' + esc(st.hero.h.name) + ' 复活了</span>'); return; }
    if (ev.type === 'herohurt') { var v = viewOf(ev.m); if (v && v.el) lunge(v.el, v.idx, null); var bx = st.heroBox; if (bx) float(bx.cx + (Math.random() - .5) * 16, bx.y + 14, '-' + fmt(ev.dmg), 'me');
      CQ.FX.once(st.heroEl, 'hurt', false, 400);
      if (ev.dead) { st.heroEl.classList.add('dead'); u.idx = null; st._heroPos = null; CQ.Host.log('<span style="color:#f77">英雄 ' + esc(st.hero.h.name) + ' 阵亡，' + CQ.HERO_TUNE.reviveSec + ' 秒后复活</span>'); } } }
  function onDot(o){ if (!st || st.paused) return; var c = centerOfMon(o.m); if (c) float(c.x, c.top + 14, '-' + fmt(o.d), 'heal'); }
  function toggleHeroPanel(on){ var p = st.R.hpanel; if (on == null) on = !p.classList.contains('on'); p.classList.toggle('on', on); if (on) renderHeroPanel(); }
  // 英雄存档/创建/装备（CQSys）。没有英雄时面板只显示「召唤英雄」选职业
  function heroSysHTML(){ var C = CQ.Host.heroSys(); if (!C || !C.hero) return '<div class="hn2">英雄存档：本地（未检测到 CQSys）</div>';
    var H = C.hero(), eq = H.eq || {}, slots = Object.keys(eq), bag = CQ.Host.heroBag();
    return '<div class="hn2">存档：随角色云存档 · Lv.' + (H.lvl || 1) + ' · <a data-a="hrename">改名</a></div>' +
      '<div class="heq"><b>英雄装备</b>' + (slots.length ? slots.map(function(k){ var i = CQ.Host.itemInfo(eq[k]) || {}; return '<button data-a="hunequip" data-s="' + esc(k) + '" style="color:' + (i.color || '#e8e0cc') + '">' + esc(i.name) + ' ✕</button>'; }).join('') : '<i>无</i>') + '</div>' +
      (bag.length ? '<div class="heq"><b>背包可穿</b>' + bag.slice(0, 8).map(function(it){ var i = CQ.Host.itemInfo(it) || {}; return '<button data-a="hequip" data-u="' + esc(it.uid) + '" style="color:' + (i.color || '#e8e0cc') + '">' + esc(i.name) + '</button>'; }).join('') + '</div>' : ''); }
  function heroCreateHTML(){ var C = CQ.Host.heroSys(), P = C && C.heroProfs ? C.heroProfs() : ['zs', 'fs', 'ds'], N = {zs: '战士', fs: '法师', ds: '道士'}, me = CQ.HEJI.PROF[CQ.Host.role().cls] || 1;
    return '<div class="ht"><b>召唤英雄</b><small>每个角色一位</small><button data-a="hclose">✕</button></div><p class="hn2">选英雄职业（合击由「你的职业+英雄职业」决定）：</p>' +
      P.map(function(c){ var cb = CQ.HEJI.COMBO[CQ.HEJI.comboKey(me, CQ.HEJI.PROF[c])]; return '<button class="hpick" data-a="hcreate" data-c="' + c + '"><b>' + N[c] + '</b><small>合击【' + esc(cb.name) + '】' + esc(cb.desc.split(': ')[1] || '') + '</small></button>'; }).join(''); }
  function heroAct(k, a){ var C = CQ.Host.heroSys(); if (!C) return; var r;
    if (k === 'hcreate') { r = C.heroCreate(a.getAttribute('data-c')); if (r && r.err) CQ.Host.toast(r.err); }
    else if (k === 'hequip') { r = C.heroEquip(+a.getAttribute('data-u') || a.getAttribute('data-u')); if (r && r.err) CQ.Host.toast(r.err); }
    else if (k === 'hunequip') { r = C.heroUnequip(a.getAttribute('data-s')); if (r && r.err) CQ.Host.toast(r.err); }
    else if (k === 'hrename') { var n = W0.prompt ? W0.prompt('英雄名字（最多 12 字）', st.hero.h.name) : null; if (n && n.trim()) C.heroSet({name: n.trim().slice(0, 12)}); }
    onHeroChange(); }
  function roleArt(c){ return c === 'ds' ? 'hero_ds' : c === 'fs' ? 'hero_fs' : 'hero_zs'; }
  function heroArt(p){ return p === 3 ? 'hero_ds' : p === 2 ? 'hero_fs' : 'hero_zs'; }
  function onHeroChange(){ if (!st) return; st.hero.reload(); var nm = st.heroEl.querySelector('.hn'); if (nm) txt(nm, st.hero.h.name); var img = st.heroEl.querySelector('img'); if (img) { var src = UI + (heroArt(st.hero.h.prof)) + '.png'; if (img.getAttribute('src') !== src) img.setAttribute('src', src); }
    st._pres = null; if (st.R.hpanel) { st.R.hpanel._h = ''; renderHeroPanel(); } renderSide(); }
  function onBossEnrage(d){ if (!st) return; var w = h('div', 'warn', '<span>首领狂暴 · 伤害 ×' + ((d && d.mul) || 1.5) + '</span>'); st.R.root.appendChild(w); CQ.FX.once(w, null, true, 3000); }
  function renderHeroPanel(){ var p = st.R.hpanel; if (!p.classList.contains('on')) return;
    if (!st.hero.present()) { var ch = heroCreateHTML(); if (p._h !== ch) { p._h = ch; p.innerHTML = ch; } return; } var H = st.hero.h, u = st.hero.unit, cb = st.hero.combo(), now = Date.now(), T = CQ.HERO_TUNE, PN = CQ.HEJI.PNAME;
    var stt = u.deadUntil ? '阵亡 · ' + st.hero.reviveLeft(now) + ' 秒后复活' : '战斗中';
    var html = '<div class="ht"><b>' + esc(H.name) + '</b><small>' + PN[H.prof] + '</small><button data-a="hclose">✕</button></div>' +
      '<div class="hr"><span>生命</span><div class="cbar hp"><i style="width:' + (u.maxhp ? u.hp / u.maxhp * 100 : 0).toFixed(1) + '%"></i></div><em>' + fmt(u.hp) + '/' + fmt(u.maxhp) + '</em></div>' +
      '<div class="hr"><span>怒气</span><div class="cbar rage"><i style="width:' + Math.floor(H.rage || 0) + '%"></i></div><em>' + Math.floor(H.rage || 0) + '/100</em></div>' +
      '<div class="hr"><span>状态</span><em class="l">' + stt + '</em></div>' +
      '<div class="hr"><span>普攻</span><em class="l">每 ' + T.atkT + ' 秒 · 玩家近期秒伤×' + Math.round((CQ.heroDpsK ? CQ.heroDpsK({cls: function(){ return CQ.Host.role().cls; }}) : T.dpsK) * 100) + '%' + (CQ.dps ? '（当前 ' + fmt(CQ.dps()) + '/秒）' : '') + '</em></div>' +
      '<div class="hc"><b>合击【' + esc(cb.name) + '】</b><p>' + esc(cb.desc) + '</p><p>已施放 ' + (H.hejiCount || 0) + ' 次' + (H.hejiCd > 0 ? ' · 冷却 ' + Math.ceil(H.hejiCd) + ' 秒' : '') + '</p></div>' +
      '<div class="hb2"><button data-a="auto">' + (H.autoHeji ? '自动合击：开' : '自动合击：关') + '</button><button data-a="heji">立即合击</button></div>' +
      heroSysHTML();
    if (p._h !== html) { p._h = html; p.innerHTML = html; } }
  function renderPots(){ if (!st.R.pots) return;  var P = CQ.Host.pots(), R = st.R; R.pots.querySelectorAll('button[data-k]').forEach(function(b){ var n = P[b.getAttribute('data-k')] || 0; txt(b.querySelector('b'), n); b.classList.toggle('none', n <= 0); });
    var r = CQ.Host.role(); [[R.orbL, r.hp, r.maxhp], [R.orbR, r.mp, r.maxmp]].forEach(function(o){ var p = o[2] ? Math.max(0, Math.min(1, o[1] / o[2])) : 0, i = o[0].querySelector('i'), v = (100 - p * 100).toFixed(1) + '%'; if (i.style.top !== v) i.style.top = v; txt(o[0].querySelector('span'), Math.max(0, Math.round(o[1]))); }); }
  function renderZpop(){ var R = st.R; if (!R.zpop.classList.contains('on')) return; txt(R.zname, CQ.Host.zone().name); }
  function sync(dt, now){
    var live = CQ.Host.mons(), seen = {}, b = st.b;
    live.forEach(function(m){ var v = st.views[m.uid]; seen[m.uid] = 1;
      if (!v) { v = st.views[m.uid] = {uid: m.uid, ref: m, boss: !!m.boss, dead: false, idx: null, walk_spd: m.boss ? 2.2 : 1.6};
        b.mons.push(v); v.el = monCard(m); if (m.boss) onBossSpawn(m); }
      v.stunned = (m.stun || 0) > 0; });
    b.mons.forEach(function(v){ if (!v.dead && (!seen[v.uid] || v.ref.hp <= 0)) killView(v); });
    var bossLive = b.mons.some(function(v){ return v.boss && !v.dead; });
    if (bossLive !== st.bossOn) { st.bossOn = bossLive; st.R.root.classList.toggle('boss', bossLive); b.mons.forEach(function(v){ v._pos = null; }); st._rolePos = st._heroPos = null; }
    // 英雄
    if (!CQ.heroCore) { var ev = st.hero.tick(dt, hostForHero()); if (ev) onHeroEvent(ev); }
    syncPets();
    var pres = st.hero.present(); if (st._pres !== pres) { st._pres = pres; st.heroEl.style.display = pres ? '' : 'none'; if (!pres) st.hero.unit.idx = null; st._heroPos = null; }
    // 走位（传奇原规则）
    CQ.MOVE.update(b, dt);
    b.mons.forEach(function(v){ if (v.dead || v.idx == null) return; var key = v.idx + (st.bossOn ? 'b' : ''); if (v._pos === key) return; v._pos = key;
      var bx = cellBox(v.idx, kindOf(v)); v.box = bx; place(v.el, bx, 10 + bx.row * 3 + (v.boss ? 1 : 0)); });
    var rk = b.roleIdx + (st.bossOn ? 'b' : ''); if (st._rolePos !== rk) { st._rolePos = rk; st.roleBox = cellBox(b.roleIdx, 'role'); place(st.roleEl, st.roleBox, 11 + st.roleBox.row * 3); }
    var u = st.hero.unit, hk = u.idx + (st.bossOn ? 'b' : ''); if (u.idx != null && u.hp > 0 && st._heroPos !== hk) { st._heroPos = hk; st.heroBox = cellBox(u.idx, 'hero'); place(st.heroEl, st.heroBox, 11 + st.heroBox.row * 3); }
    // 血条：每帧（便宜）；其余 UI 10Hz
    b.mons.forEach(function(v){ if (v.dead) return; var p = v.ref.max ? v.ref.hp / v.ref.max * 100 : 0; wpct(v.hbI, p); wpct(v.hbS, p); });
    st.uiT -= dt; if (st.uiT <= 0) { st.uiT = .1; renderUI(now); }
  }
  function monCard(m){ var cls = 'card spawn' + (m.boss ? ' boss' : m.fl === 'champ' ? ' elite' : m.fl === 'uniq' ? ' cuniq' : '');
    var e = h('div', cls, '<div class="in"><div class="bd"></div>' + (m.boss ? '<div class="ctag">首领</div>' : '') + '<img class="fig" alt="" src="' + esc(CQ.Host.monArt(m)) + '" style="animation-delay:-' + ((m.uid * 7) % 26 / 10) + 's">' +
      '<div class="clv">Lv.' + (m.lv || 1) + '</div><div class="cnm">' + esc(m.n) + '</div><div class="hb"><s></s><i></i></div></div>');
    var im = e.querySelector('img.fig'); im.onerror = function(){ var u = im.getAttribute('src'), nx; CQ.artBad(u); nx = CQ.Host.monArt(m); if (nx && nx !== u) im.src = nx; else im.onerror = null; };   // 缺图逐级兜底（结果缓存）
    e.style.transform = 'translate(-200px,-200px)'; st.R.units.appendChild(e); CQ.FX.once(e, 'spawn', false, 600);
    var v = st.views[m.uid]; if (v) { v.hbI = e.querySelector('.hb i'); v.hbS = e.querySelector('.hb s'); }
    return e; }
  function killView(v){ v.dead = true; var el = v.el; CQ.FX.once(el, 'die', true, 800);
    st.b.mons.splice(st.b.mons.indexOf(v), 1); delete st.views[v.uid]; if (st.b._tgt === v) st.b._tgt = null; }

  // ---------- UI（10Hz） ----------
  function renderUI(now){ refreshRole();
    var R = st.R, r = CQ.Host.role();
    txt(R.pn, 'Lv.' + r.lvl + ' ' + r.name); txt(R.pw, r.power != null ? '战力 ' + fmt(r.power) : r.clsName);
    wpct(R.hp, r.maxhp ? r.hp / r.maxhp * 100 : 0); wpct(R.mp, r.maxmp ? r.mp / r.maxmp * 100 : 0); wpct(R.xp, r.xpPct);
    txt(R.gold, fmt(r.gold)); txt(R.yb, r.yb != null ? fmt(r.yb) : '—');
    var z = CQ.Host.zone(), pk = z.name + '|' + z.sub; if (R.plaque._k !== pk) { R.plaque._k = pk; R.plaque.innerHTML = esc(z.name) + '<small>' + esc(z.sub) + '</small>'; }
    // 未登录/未建角色：主循环被 login_flow 拦住，战场给出同样提示
    var gate = document.body.classList.contains('nochar') ? (document.getElementById('fbattle') || {dataset: {}}).dataset.gate || '' : '';
    if (R.gate == null) { R.gate = h('div', 'cgate'); R.gate.style.cssText = 'position:absolute;left:0;right:0;top:42%;text-align:center;color:#c8b48a;font-size:15px;letter-spacing:2px;z-index:29;pointer-events:none;text-shadow:0 1px 2px #000'; R.root.appendChild(R.gate); }
    txt(R.gate, gate);
    // 首领条
    var bv = st.b.mons.filter(function(v){ return v.boss && !v.dead; })[0];
    if (bv) { var m = bv.ref, p = m.max ? m.hp / m.max * 100 : 0; txt(R.bname, m.n); txt(R.blv, 'Lv.' + m.lv); wpct(R.bfill, p); wpct(R.btrail, p);
      txt(R.btxt, fmt(Math.max(0, m.hp)) + ' / ' + fmt(m.max)); txt(R.bx, '×' + Math.max(1, Math.ceil(p / 10)));
      var art = CQ.Host.monArt(m); if (R.bhead._a !== art) { R.bhead._a = art; R.bhead.style.backgroundImage = 'url("' + art + '")'; R.bhead.style.backgroundPosition = '50% 15%'; R.bhead.style.backgroundSize = '160% auto'; }
      var mmss = function(x){ x = Math.max(0, Math.ceil(x)); return ('0' + Math.floor(x / 60)).slice(-2) + ':' + ('0' + x % 60).slice(-2); }, bi = CQ.Host.bossInfo ? CQ.Host.bossInfo() : null;
      if (bi && bi.alive) { txt(R.blab, bi.enraged ? '已狂暴' : '狂暴倒计时'); txt(R.btime, bi.enraged ? '×' + (((W0.CQ_BAL || {}).boss || {}).enrMul || 1.5) : mmss(bi.enrageLeft)); R.root.classList.toggle('enraged', !!bi.enraged); }
      else { txt(R.blab, '战斗用时'); txt(R.btime, mmss((now - st.bossT0) / 1000)); }
      txt(R.bwave, z.sub); }
    // 技能冷却圈
    var sks = CQ.Host.skills();
    R.sk.forEach(function(e, i){ var s = sks[i]; if (!s) { if (e._id !== null) { e._id = null; e.className = 'csk cempty'; e.querySelector('.ic').textContent = ''; txt(e.querySelector('.key'), ''); txt(e.querySelector('.cdt'), ''); e.querySelector('.cd').style.setProperty('--p', '100%'); } return; }
      if (e._id !== s.id) { e._id = s.id; e.querySelector('.ic').innerHTML = s.img ? '<img src="' + esc(s.img) + '" alt="">' : esc(s.ic || '✦'); txt(e.querySelector('.key'), s.n); }
      var left = Math.max(0, s.cdLeft || 0), max = s.cdMax || 1, ready = left <= 0.05;
      e.classList.toggle('ready', ready && !s.off && !s.lock); e.classList.toggle('off', !!s.off); e.classList.toggle('lock', !!s.lock); e.title = s.lock ? s.n + '（' + s.need + ' 级可学）' : s.n; e.classList.remove('cempty');
      e.querySelector('.cd').style.setProperty('--p', ready ? '100%' : (100 - left / max * 100).toFixed(1) + '%');
      txt(e.querySelector('.cdt'), ready ? '' : left.toFixed(1));
      if (s.fired && e._fired !== s.fired) { e._fired = s.fired; CQ.FX.once(e, 'fire', false, 500); } });
    // 合击按钮
    var H = st.hero.h, rage = Math.floor(H.rage || 0), full = rage >= CQ.HEJI.RAGE_MAX;
    R.ring.setAttribute('stroke-dasharray', (R.ringC * rage / 100).toFixed(1) + ' ' + R.ringC); R.ring.setAttribute('stroke', full ? '#ffcf4a' : '#ff7a2a');
    R.heji.classList.toggle('cd', H.hejiCd > 0); R.heji.classList.toggle('full', full && !(H.hejiCd > 0));
    var ht = R.heji.querySelector('.t'); if (ht) txt(ht, H.hejiCd > 0 ? Math.ceil(H.hejiCd) + '秒' : '合击');   // 冷却直接显示在合击按钮上
    txt(R.heji.querySelector('.rg'), H.hejiCd > 0 ? '冷却 ' + Math.ceil(H.hejiCd) + '秒' : full ? '怒气已满' : '怒气 ' + rage + '%');
    renderZpop(); if (CQ.Host.autoAdv() !== st._aa) { st._aa = CQ.Host.autoAdv(); renderSide(); } renderHeroPanel();
    petsHP(); var hu = st.hero.unit; wpct(st.heroHb.querySelector('i'), hu.maxhp ? hu.hp / hu.maxhp * 100 : 0); st.heroEl.classList.toggle('dead', !!hu.deadUntil); txt(st.heroRv, hu.deadUntil ? st.hero.reviveLeft(Date.now()) + '秒' : '');
    // 掉落滚动条（首行主线任务，原任务行收起后放这里）
    var L = CQ.Host.logs(4), lk = L.join('\u0001'); if (lk !== st.logKey) { st.logKey = lk; R.ticker.innerHTML = L.map(function(x){ return '<div class="crow">' + x + '</div>'; }).join(''); CQ.FX.once(R.ticker, 'tick', false, 700); }
  }
  function renderSide(){ var c = st.R.side.querySelector('[data-a=auto]'); c.textContent = st.hero.h.autoHeji ? '自动合击 ✓' : '自动合击 ✗'; c.classList.toggle('off', !st.hero.h.autoHeji); var z = st.R.zauto, a = CQ.Host.autoAdv(); txt(z, a ? '自动推进 ✓' : '原地挂机'); z.classList.toggle('off', !a); }

  // ---------- 事件（由 bridge 调用） ----------
  function viewOf(m){ return m && st && st.views[m.uid]; }
  function centerOfMon(m){ var v = viewOf(m); if (v && v.box) return {x: v.box.cx, y: v.box.cy, top: v.box.y}; return st && st.lastKill || {x: DW / 2, y: st ? st.g.H * .45 : 300, top: 200}; }
  function float(x, y, str, cls, force){ if (!st || st.paused) return; if (st.floats >= MAX_FLOATS && !force) return;
    var e = h('div', 'dmg ' + (cls || '')); e.textContent = str; e.style.left = Math.round(x) + 'px'; e.style.top = Math.round(y) + 'px';
    st.R.fx.appendChild(e); st.floats++; CQ.FX.once(e, null, true, 1000); setTimeout(function(){ st && st.floats--; }, 1000); }
  function lunge(el, fromIdx, m){ if (!el || el._lt > performance.now()) return; el._lt = performance.now() + 300; var v = viewOf(m), dx = 0, dy = -10;
    if (v && v.idx != null && fromIdx != null) { var a = CQ.MOVE.xy(fromIdx), b = CQ.MOVE.xy(v.idx); dx = Math.sign(b[0] - a[0]) * 10; dy = Math.sign(b[1] - a[1]) * 10 || -6; }
    el.style.setProperty('--ax', dx + 'px'); el.style.setProperty('--ay', dy + 'px'); CQ.FX.once(el, 'atk', false, 400); }
  function hitFlash(m){ var v = viewOf(m); if (!v) return; var t = performance.now(); if (v._hf > t) return; v._hf = t + 260; CQ.FX.once(v.el, 'hit', false, 600); }
  // 怪物受伤：src='hero' 玩家 / 'cqhero' 英雄 / 'cqheji' 合击 / 其它(召唤物、反伤…)
  function onMonDamage(m, amount, src, crit){
    if (!st || st.paused || src === 'cqheji') return;
    var c = centerOfMon(m), n = typeof amount === 'number' ? Math.round(amount) : amount;
    if (typeof n !== 'number') { float(c.x, c.top + 8, n, 'txt'); return; }
    if (crit) { float(c.x + (Math.random() - .5) * 20, c.top - 4, '暴击 -' + fmt(n), 'cgold crit', true); hitFlash(m); CQ.FX.burst(c.x, c.y, 10, ['#fff3b0', '#ffb000', '#ffffff'], 220, 4, .4); }
    else float(c.x + (Math.random() - .5) * 28, c.top + 10, '-' + fmt(n), src === 'cqhero' ? 'heal' : '');
    if (src === 'hero') { lunge(st.roleEl, st.b.roleIdx, m); hitFlash(m); }   // 怒气在 cq_bridge 的 hitMon 包装里加（step 内，不依赖战斗页）
    else if (src === 'cqhero') hitFlash(m);
  }
  function onRoleHurt(str, color){ if (!st || st.paused) return; var bx = st.roleBox || {cx: DW / 2, y: st.g.H * .6};
    var num = /^-\d/.test(str); float(bx.cx + (Math.random() - .5) * 16, bx.y + 10, str, num ? 'me' : (color && /0f|6f|5f/.test(color) ? 'heal' : 'txt'));
    if (num) { CQ.FX.once(st.roleEl, 'hurt', false, 400); } }
  function onKill(m){ if (!st) return; var c = centerOfMon(m); st.lastKill = {x: c.x, y: c.y + 20, top: c.top, boss: !!m.boss, name: m.n}; }
  function onBossSpawn(m){ st.bossT0 = performance.now(); var w = h('div', 'warn', '<span>首领出现 · ' + esc(m.n) + '</span>'); st.R.root.appendChild(w); CQ.FX.once(w, null, true, 3000); }
  function onSkill(id){ if (!st || st.paused) return; var dir = CQ.Host.skillFx(id); if (!dir) return;
    var tg = st.b._tgt && !st.b._tgt.dead ? st.b._tgt : st.b.mons.filter(function(v){ return !v.dead && v.box; })[0];
    var s = st.roleBox ? {x: st.roleBox.cx, y: st.roleBox.cy} : null, t = tg && tg.box ? {x: tg.box.cx, y: tg.box.cy} : null; CQ.FX.playSkill(dir, s, t); }

  // ---------- 合击演出（样稿 p3） ----------
  function playHeji(ev){
    if (!st) return; var R = st.R;
    var tPos = ev.hits.map(function(x){ return centerOfMon(x.m); });
    var rp = st.roleBox ? {x: st.roleBox.cx, y: st.roleBox.cy} : null, hp = st.heroBox ? {x: st.heroBox.cx, y: st.heroBox.cy} : null;
    lunge(st.roleEl, st.b.roleIdx, ev.hits[0].m); lunge(st.heroEl, st.hero.unit.idx, ev.hits[0].m);
    var imp = CQ.FX.heji(ev, {role: rp, hero: hp, targets: tPos}, function(k){
      var x = ev.hits[k]; if (!x || !st) return; var got = ev.applied ? x.got : CQ.Host.hit(x.m, x.d, 'cqheji') || 0; var c = tPos[k];
      float(c.x, c.top + 6, '-' + fmt(got || x.d), 'pop cgold', true); hitFlash(x.m);
      if (!ev.applied && ev.combo.stun) CQ.Host.stun(x.m, ev.combo.stun);
      if (!ev.applied && ev.combo.dot) dot(x.m, Math.round(x.d * ev.combo.dot), 5);
      if (!k) { shake(); flash(); } });
    // 冲击时：大字 + 连击 + 光环（一次性）
    setTimeout(function(){ if (!st) return;
      var cy = tPos[0] ? tPos[0].y : st.g.H / 2, big = h('div', 'critw', '<span class="w">合击·' + esc(ev.name) + '</span><span class="n">' + fmt(ev.total) + '</span>');
      big.style.top = Math.max(TOPH + 8, (st.bossOn ? 150 : 90)) + 'px'; R.fx.appendChild(big); CQ.FX.once(big, null, true, 1500);
      if (ev.hits.length > 1) { var cb = h('div', 'combo', '<b>×' + ev.hits.length + '</b><span>连 击</span>'); cb.style.top = Math.round(cy) + 'px'; R.fx.appendChild(cb); CQ.FX.once(cb, null, true, 1400); }
      tPos.slice(0, 3).forEach(function(c){ var rg = h('div', 'ring'); rg.style.cssText = 'left:' + (c.x - 70) + 'px;top:' + (c.y - 70) + 'px;width:140px;height:140px'; R.fx.appendChild(rg); CQ.FX.once(rg, null, true, 800); });
      if (!ev.applied && ev.combo.heal) CQ.Host.healPct(ev.combo.heal);
    }, Math.max(0, imp - 40));
    CQ.Host.log('<b style="color:#ffb000">【合击·' + esc(ev.name) + '】</b> 你与 ' + esc(st.hero.h.name) + ' 联手，对 ' + ev.hits.length + ' 个目标共造成 ' + fmt(ev.total) + ' 伤害');
  }
  function dot(m, d, n){ var i = 0, t = setInterval(function(){ if (!st || ++i > n || !(m.hp > 0)) { clearInterval(t); return; } CQ.Host.hit(m, d, 'cqheji'); var c = centerOfMon(m); float(c.x, c.top + 14, '-' + fmt(d), 'heal'); }, 1000); }
  function shake(){ CQ.FX.once(st.R.world, 'shake', false, 500); }
  function flash(){ var f = h('div', 'flash'); st.R.fx.appendChild(f); CQ.FX.once(f, null, true, 600); }

  // ---------- 掉落：光柱 + 地面标签（样稿 p4） ----------
  var QCOL = {6: ['#ff4a36', 'rgba(255,120,60,.9)'], 5: ['#ffa02a', 'rgba(255,200,80,.9)'], 4: ['#c66bff', 'rgba(200,120,255,.9)'], 3: ['#4aa8ff', 'rgba(100,180,255,.8)']};
  function hexA(c, a){ var m = /^#([0-9a-f]{6})$/i.exec(c || ''); if (!m) return 'rgba(255,255,255,' + a + ')'; var n = parseInt(m[1], 16); return 'rgba(' + (n >> 16) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')'; }
  function onLoot(it){
    if (!st || st.paused) return; var info = CQ.Host.itemInfo(it); if (!info) return;
    var k = st.lastKill || {x: DW / 2, y: st.g.H * .55}, n = st.loots.filter(function(l){ return !l.gone; }).length;
    var maxY = st.g.H - BOTH - 150, baseY = Math.max(TOPH + 130, Math.min(maxY - 46, k.y - 10)), baseX = Math.max(96, Math.min(DW - 150, k.x));
    var x = baseX + [0, -84, 84][n % 3] + (Math.random() - .5) * 10, y = Math.min(maxY, baseY + Math.floor(n / 3) % 3 * 46 + (n % 3 ? 14 : 0));
    var c = info.color, c2 = hexA(c, .85), tier = info.tier;
    if (tier) { var qc = QCOL[tier.rank >= 4 ? 6 : tier.rank >= 3 ? 5 : tier.rank >= 2 ? 4 : 5]; c = tier.color || qc[0]; c2 = hexA(c, .9); }
    var rec = {gone: false, els: []};
    if (tier) { var ph = 110 + tier.rank * 34, p = h('div', 'pillar', '<div class="halo"></div><div class="beam"></div><div class="core"></div><div class="base"></div>');
      p.style.cssText = 'left:' + x + 'px;top:' + (y + 36 - ph) + 'px;height:' + ph + 'px;--c:' + c + ';--c2:' + c2; st.R.loot.appendChild(p); rec.els.push(p); CQ.FX.once(p, null, false, 900); }
    var l = h('div', 'cloot' + (tier || info.good ? '' : ' csmall'), '<div class="ic">' + (info.img ? '<img src="' + esc(info.img) + '" alt="">' : esc(info.ic || '◆')) + '</div><div class="lb">' + esc(info.name) + '</div>');
    l.style.cssText = 'left:' + x + 'px;top:' + y + 'px;--c:' + c + ';--c2:' + c2; st.R.loot.appendChild(l); rec.els.push(l);
    st.loots.push(rec); rec.t = setTimeout(function(){ fade(rec); }, LOOT_LIFE);
    if (tier && tier.top) toastLoot(info, c);
    renderPick();
  }
  function toastLoot(info, c){ var k = st.lastKill, t = h('div', 'ltoast metal', '<div class="ti">' + (info.img ? '<img src="' + esc(info.img) + '" alt="" style="width:42px;height:42px;object-fit:contain">' : esc(info.ic || '◆')) + '</div><div><div class="tt">' + esc((k && k.name ? k.name + ' 掉落' : '掉落') + ' · ' + info.tier.tag) + '</div><div class="ctn">' + esc(info.name) + '</div></div><div class="ctg">极品</div>');
    t.style.setProperty('--c', c); if (st.bossOn) t.style.top = '156px'; st.R.fx.appendChild(t); CQ.FX.once(t, null, true, 3400); }
  function fade(rec){ if (rec.gone) return; rec.gone = true; clearTimeout(rec.t); rec.els.forEach(function(e){ e.classList.add('gone'); CQ.FX.once(e, null, true, 600); });
    setTimeout(function(){ if (!st) return; st.loots = st.loots.filter(function(r){ return r !== rec; }); renderPick(); }, 650); renderPick(); }
  function pickAll(){ st.loots.slice().forEach(fade); }   // 物品已由 game.js killMon→addBag 入包，拾取只清地面标签
  function renderPick(){ var n = st.loots.filter(function(l){ return !l.gone; }).length; st.R.pick.classList.toggle('on', n > 0); txt(st.R.pick, '一键拾取 (' + n + ')'); }

  function doHejiNow(){ if (CQ.heroHejiNow) return CQ.heroHejiNow(); var r = st.hero.doHeji(hostForHero(), true); if (r.ok) playHeji(r); return r; }
  function hostForHero(){ if (CQ.heroHost) return CQ.heroHost; var H = CQ.Host; return {now: function(){ return Date.now(); }, targets: function(){ return st.b.mons.filter(function(v){ return !v.dead && v.ref.hp > 0; }).map(function(v){ return v.ref; }); },
    pick: function(ts){ var b = ts.filter(function(m){ return m.boss; })[0]; return b || ts[0]; },
    hit: function(m, d, src){ return H.hit(m, d, src); }, atkMax: H.atkMax, lvl: H.lvl, heroK: H.heroK, maxhp: H.maxhp, heroStats: H.heroStats}; }

  CQ.Scene = {mount: mount, unmount: unmount, pause: pause, resume: resume, onMonDamage: onMonDamage, onRoleHurt: onRoleHurt, onKill: onKill, onLoot: onLoot, onSkill: onSkill, playHeji: playHeji, onHeroChange: onHeroChange, onPet: onPet, pets: function(){ return st && st.pets; }, onHeroEvent: onHeroEvent, onDot: onDot, onBossEnrage: onBossEnrage,
    doHeji: function(){ if (!st) return {ok: false}; return doHejiNow(); },
    state: function(){ return st; }, mounted: function(){ return !!st; }};
})();
