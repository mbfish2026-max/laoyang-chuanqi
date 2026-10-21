'use strict';
// cq/cq_move.js — 战场走位，移植自传奇之旅 js/move.js（AStar.js + BattleTool.updateRole / onMonsterInstruct / onPartnerInstruct）
// 规则原样保留：6×5 格，idx = x + 6*y；角色/怪物/宝宝(英雄)各占一格；A*（4 邻、曼哈顿、占格阻挡）。
// 角色：射程(切比雪夫)内无怪时每 walk 秒向最近怪走一格；怪物：贴身(切比雪夫 1)才攻击，否则向最近目标走；宝宝/英雄：贴身攻击，否则向最近怪走。
// 改动：全局 MOVE → CQ.MOVE；射程/步速由 opts 注入（原版读 CFG.skill / CFG.profession）。
(function(){
  var W = typeof window !== 'undefined' ? window : globalThis, CQ = W.CQ = W.CQ || {};
  var COLS = 6, ROWS = 5, N = 30, ROLE_START = 26, MON_START = [1, 3, 5, 8, 10, 13, 15, 17, 20, 22, 7, 11];
  var opts = {range: function(){ return 1; }, walk: function(){ return 1.3; }};
  function xy(i){ return [i % COLS, Math.floor(i / COLS)]; }
  function cheb(a, b){ var p = xy(a), q = xy(b); return Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1])); }
  function manh(a, b){ var p = xy(a), q = xy(b); return Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); }
  function occ(b){ var o = {}; if (b.roleIdx != null) o[b.roleIdx] = 'role';
    b.mons.forEach(function(m){ if (!m.dead && m.idx != null) o[m.idx] = m; }); (b._pets || []).forEach(function(p){ if (p.hp > 0 && p.idx != null) o[p.idx] = p; }); return o; }
  function freeCell(b, near){
    var o = occ(b), free = []; for (var i = 0; i < N; i++) if (!o[i]) free.push(i);
    if (!free.length) return -1;
    if (near != null) { free.sort(function(a, c){ return cheb(a, near) - cheb(c, near); }); return free[0]; }
    return free[Math.floor(Math.random() * free.length)];
  }
  function path(b, s, e){
    var o = occ(b), open = [{i: s, g: 0, f: manh(s, e), p: null}], closed = {}, best = {};
    while (open.length) {
      open.sort(function(a, c){ return a.f - c.f; }); var cur = open.shift();
      if (cur.i === e) { var r = []; while (cur) { r.unshift(cur.i); cur = cur.p; } return r; }
      closed[cur.i] = 1; var c = xy(cur.i);
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function(d){
        var x = c[0] + d[0], y = c[1] + d[1]; if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
        var j = x + y * COLS; if (closed[j] || (o[j] && j !== e)) return;
        var g = cur.g + 1; if (best[j] != null && best[j] <= g) return; best[j] = g;
        open.push({i: j, g: g, f: g + manh(j, e), p: cur});
      });
    }
    return [];
  }
  function greedy(b, s, e){ var o = occ(b), p = xy(s), q = xy(e), c = [];
    if (p[0] > q[0]) c.push(s - 1); if (p[0] < q[0]) c.push(s + 1); if (p[1] > q[1]) c.push(s - 6); if (p[1] < q[1]) c.push(s + 6);
    for (var k = 0; k < c.length; k++) if (c[k] >= 0 && c[k] < N && !o[c[k]]) return c[k]; return -1; }
  function stepToward(b, s, e){ var p = path(b, s, e); if (p.length > 2 || (p.length === 2 && p[1] !== e)) return p[1]; return p.length ? -1 : greedy(b, s, e); }
  function roleRange(){ var d = +opts.range() || 1; return Math.max(1, d); }
  var BOSS_MIN = 12;
  function bossCell(b){ var o = occ(b), f = []; for (var i = BOSS_MIN; i < N; i++) if (!o[i]) f.push(i); return f.length ? f[Math.floor(f.length / 2)] : freeCell(b); }
  function ensure(b){
    if (b.roleIdx == null) b.roleIdx = ROLE_START;
    b.mons.forEach(function(m){ if (m.boss && !m.dead && m.idx != null && m.idx < BOSS_MIN) m.idx = bossCell(b); });
    b.mons.forEach(function(m, k){
      if (m.dead) { m._wasDead = true; return; }
      if (m.idx == null || m._wasDead) { m._wasDead = false; var occ0 = occ(b), want = MON_START[k % MON_START.length]; m.idx = (m.idx == null && !occ0[want] && !(m.boss && want < BOSS_MIN)) ? want : m.boss ? bossCell(b) : freeCell(b); m.moveT = 0.5 + Math.random() * 1.5; }
    });
    (b._pets || []).forEach(function(p){ if (p.idx == null) { p.idx = freeCell(b, b.roleIdx); p.moveT = 1; } });
  }
  function nearestMon(b, i){ var best = null, bd = 99; b.mons.forEach(function(m){ if (m.dead || m.idx == null) return; var d = cheb(i, m.idx); if (d < bd) { bd = d; best = m; } }); return best; }
  function roleTarget(b){
    ensure(b); var R = roleRange(), inR = b.mons.filter(function(m){ return !m.dead && m.idx != null && cheb(b.roleIdx, m.idx) <= R; });
    if (!inR.length) return null;
    if (b._tgt && inR.indexOf(b._tgt) >= 0) return b._tgt;
    inR.sort(function(a, c){ return cheb(b.roleIdx, a.idx) - cheb(b.roleIdx, c.idx); }); return b._tgt = inR[0];
  }
  function monCanAttack(b, m){ ensure(b); if (m.idx == null) return false;
    if (cheb(m.idx, b.roleIdx) <= 1) return 'role';
    var pets = (b._pets || []).filter(function(p){ return p.hp > 0 && p.idx != null && cheb(m.idx, p.idx) <= 1; }); return pets.length ? 'pet' : false; }
  function update(b, dt){
    ensure(b);
    var walk = +opts.walk() || 1.3;
    b.roleMoveT = (b.roleMoveT || 0) - dt;
    if (b.roleMoveT <= 0) { b.roleMoveT = walk;
      if (!roleTarget(b)) { var t = nearestMon(b, b.roleIdx); var e = t ? t.idx : Math.floor(Math.random() * N);
        var n = stepToward(b, b.roleIdx, e); if (n >= 0) { b.roleIdx = n; } } }
    b.mons.forEach(function(m){ if (m.dead || m.idx == null) return; m.moveT = (m.moveT || 0) - dt; if (m.moveT > 0) return; m.moveT = (m.walk_spd || 1.6) + Math.random() * .6;
      if (m.stunned) return;
      if (monCanAttack(b, m)) return;
      var tg = b.roleIdx, bd = cheb(m.idx, b.roleIdx); (b._pets || []).forEach(function(p){ if (p.hp > 0 && p.idx != null && cheb(m.idx, p.idx) < bd) { bd = cheb(m.idx, p.idx); tg = p.idx; } });
      var n = stepToward(b, m.idx, tg); if (n >= 0 && !(m.boss && n < BOSS_MIN)) m.idx = n; });
    (b._pets || []).forEach(function(p){ if (p.hp <= 0 || p.idx == null) return; p.moveT = (p.moveT || 0) - dt; if (p.moveT > 0) return; p.moveT = 1.2;
      var t = nearestMon(b, p.idx); if (!t || cheb(p.idx, t.idx) <= 1) return; var n = stepToward(b, p.idx, t.idx); if (n >= 0) p.idx = n; });
  }
  function dirKey(from, to){ var p = xy(from), q = xy(to), dx = Math.sign(q[0] - p[0]), dy = Math.sign(q[1] - p[1]);
    return ({'0,-1': 'up', '0,1': 'down', '-1,0': 'left', '1,0': 'right', '1,-1': 'slant_rightup', '-1,-1': 'slant_leftup', '1,1': 'slant_rightdown', '-1,1': 'slant_leftdown'})[dx + ',' + dy] || 'up'; }
  CQ.MOVE = {COLS: COLS, ROWS: ROWS, N: N, BOSS_MIN: BOSS_MIN, xy: xy, ensure: ensure, update: update, roleTarget: roleTarget, monCanAttack: monCanAttack, path: path, cheb: cheb, dirKey: dirKey, roleRange: roleRange, nearestMon: nearestMon,
    config: function(o){ for (var k in o) opts[k] = o[k]; }};
  if (typeof module !== 'undefined') module.exports = CQ.MOVE;
})();
