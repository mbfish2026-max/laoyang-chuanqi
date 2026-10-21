'use strict';
// cq/cq_hero.js — 英雄 + 合击，规则移植自传奇之旅 js/systems/hero.js（按热血传奇 1.80 英雄版经典规则）
// - 英雄是同场单位（CQ 战场里的 _pets 成员），跟随走位、自动攻击
// - 怒气 0~100：玩家/英雄造成伤害、玩家受伤都会增加；满怒气可施放合击（手动点按钮或自动），冷却 30 秒
// - 合击按「玩家职业+英雄职业」查 COMBO（与顺序无关）
// 数值落地：本游戏唯一真相源是 game.js 的 hitMon/MON，英雄与合击伤害通过 Host.hit() 打进去（见 cq_bridge.js）。
(function(){
  var W = typeof window !== 'undefined' ? window : globalThis, CQ = W.CQ = W.CQ || {};
  var RAGE_MAX = 100, HEJI_CD = 45;   // HEJI_CD 只是导出值，实际读 TUNE.hejiCd
  // 英雄可调常量 CQ.HERO_TUNE（README_M1.md 有说明）
  // 伤害按「玩家近期 DPS」定（总控平衡）：普攻 DPS = 玩家 DPS × dpsK；合击总伤 = 玩家 DPS × clamp(hejiSec × 组合倍率/hejiRef, hejiSecMin, hejiSecMax) 秒；合击冷却 hejiCd。
  // 普攻+合击目标占总伤害 ≤ 20%：普攻 ~9% + 合击 ~6.7s/46s ≈ 0.24 倍玩家伤害 → 约 19.5%（cq/cq_hero_balance_sim.js 验证）。DPS 未知（刚开局 <dpsMin 秒）时用 atkK × 玩家武器上限兜底。
  // 有 CQSys.heroStats 时：生命 = heroStats.hp × statHpK，受伤减 def × defK，takesDmg=0 不受伤；hpK 只作兜底。
  var TUNE = CQ.HERO_TUNE = CQ.HERO_TUNE || {atkT: 1.6, dpsK: 0.095, hejiSec: 6.5, hejiSecMin: 6, hejiSecMax: 6.8, hejiRef: 3.2, hejiCd: 45, dpsWin: 120, dpsMin: 8,
    atkK: 0.35, hpK: 0.8, hurtK: 1.0, hurtT: 2.3, hurtP: 0.35, regen: 0.005, reviveSec: 30, statHpK: 1.0, defK: 0.5};
  // 职业：1 战士 2 法师 3 道士（与传奇之旅 prof 一致）；老羊传奇 S.cls：zs/fs/ds
  var PROF = {zs: 1, fs: 2, ds: 3}, PNAME = {1: '战士', 2: '法师', 3: '道士'};
  var COMBO = {
    '1+1': {name: '破魂斩',   fx: 'heji_pohunzhan',    mult: 3.0, aoe: true,  desc: '战+战: 双刀破魂, 对所有敌人造成巨大物理伤害'},
    '1+2': {name: '劈星斩',   fx: 'heji_pixingzhan',   mult: 4.5, aoe: false, desc: '战+法: 单体极高伤害, 无视 50% 防御', pierce: .5},
    '1+3': {name: '雷霆一击', fx: 'heji_leitingyiji',  mult: 3.2, aoe: true,  desc: '战+道: 雷霆贯地, 群体伤害并眩晕 2 秒', stun: 2},
    '2+2': {name: '火龙气焰', fx: 'heji_huolongqiyan', mult: 3.6, aoe: true,  desc: '法+法: 火龙席卷全场, 群体魔法伤害'},
    '2+3': {name: '噬魂沼泽', fx: 'heji_shihunzhaoze', mult: 2.6, aoe: true,  desc: '法+道: 群体伤害, 之后 5 秒每秒追加 20% 伤害', dot: .2},
    '3+3': {name: '末日审判', fx: 'heji_morishenpan',  mult: 2.8, aoe: true,  desc: '道+道: 群体伤害并为玩家和英雄回复 20% 生命', heal: .2}
  };
  // 伤害封顶：host.cap = CQ_BAL.cap(dmg, ctx)（cq_bridge 接入，系统实现缺时兜底）
  function capOf(host, d, ctx){ return host && host.cap ? host.cap(d, ctx) : d; }
  function comboKey(a, b){ return Math.min(a, b) + '+' + Math.max(a, b); }
  function defaultHeroProf(p){ return p === 1 ? 3 : 1; }   // 战士带道士，法师/道士带战士（样稿：战神 + 英雄·道士）

  // 存档：store 有 load/save（cq_bridge 的 CQSys 适配器，存进 S.hero → 云存档）就用它；否则是 localStorage 形式的兜底（无 CQSys 时 / node 测试）
  var STORE_KEY = 'cq_battle_hero_v1';
  function load(store){ if (store && store.load) return store.load(); try { var s = store && store.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function save(store, h){ if (store && store.save) return store.save(h); try { if (store) store.setItem(STORE_KEY, JSON.stringify(h)); } catch (e) {} }

  function create(playerProf, store){
    var h = load(store);
    if (!h || !h.prof) h = {prof: defaultHeroProf(playerProf), name: '', rage: 0, hejiCd: 0, autoHeji: true, hejiCount: 0, exists: !(store && store.load)};
    if (h.exists == null) h.exists = true;
    if (!h.name) h.name = '英雄·' + PNAME[h.prof];
    return h;
  }
  // 战斗中的英雄单位状态（不入存档）
  function Hero(playerProf, store){
    this.store = store; this.playerProf = playerProf;
    this.h = create(playerProf, store);
    this.unit = {isHero: true, hp: 1, maxhp: 1, idx: null, atkT: TUNE.atkT, deadUntil: 0};
  }
  // 存档变化（CQSys hero 事件：创建/改名/装备）后重新读，保留战斗中的冷却/计数
  Hero.prototype.reload = function(){ var o = this.h, n = create(this.playerProf, this.store); n.hejiCd = o.hejiCd || 0; n.hejiCount = o.hejiCount || 0; this.h = n; this.unit.atkT = Math.min(this.unit.atkT, TUNE.atkT); };
  Hero.prototype.present = function(){ return this.h.exists !== false; };
  Hero.prototype.stats = function(host){ var s = host && host.heroStats ? host.heroStats() : null; return s && s.atkMax != null ? s : null; };
  Hero.prototype.combo = function(){ return COMBO[comboKey(this.playerProf, this.h.prof)]; };
  Hero.prototype.addRage = function(n){ this.h.rage = Math.min(RAGE_MAX, (this.h.rage || 0) + n); };
  Hero.prototype.ready = function(){ return this.present() && this.h.rage >= RAGE_MAX && !(this.h.hejiCd > 0) && this.unit.hp > 0; };
  // 合击伤害：(玩家攻击上限 + 英雄攻击上限) * 倍率 * (1 + 主角等级/50)，原版公式；英雄攻击上限 = 玩家 * heroK
  // 合击总伤：玩家 DPS 已知 → dps × hejiSec × mult/hejiRef；否则 (玩家上限 + 玩家上限×heroK) × mult（去掉了 1+等级/50）
  Hero.prototype.hejiTotal = function(cb, host){ var dps = host.dps ? host.dps() : 0, r = 0.9 + Math.random() * 0.2;
    if (dps > 0) { var sec = Math.max(TUNE.hejiSecMin, Math.min(TUNE.hejiSecMax, TUNE.hejiSec * cb.mult / TUNE.hejiRef)), base = dps * TUNE.hejiSec; return Math.max(1, Math.round(capOf(host, dps * sec * r, {src: 'combo', base: base, mul: sec / TUNE.hejiSec * r}))); }
    var a = host.atkMax(), b0 = a + a * (host.heroK ? host.heroK() : TUNE.atkK); return Math.max(1, Math.round(capOf(host, b0 * cb.mult * r, {src: 'combo', base: b0 * TUNE.hejiRef, mul: cb.mult / TUNE.hejiRef * r}))); };
  // 旧接口（兜底公式，无等级加成）
  Hero.prototype.hejiDamage = function(cb, atkMax, lvl, heroK){ return Math.max(1, Math.round((atkMax + atkMax * (heroK != null ? heroK : TUNE.atkK)) * cb.mult * (0.9 + Math.random() * 0.2))); };
  // 每帧：冷却、复活、英雄普攻、自动合击。host: {targets(), hit(m,d,src), atkMax(), lvl(), heroK(), now()}
  Hero.prototype.tick = function(dt, host){
    var h = this.h, u = this.unit, now = host.now();
    if (h.hejiCd > 0) h.hejiCd = Math.max(0, h.hejiCd - dt);
    if (!this.present()) return null;
    var hs = this.stats(host), mx = Math.max(1, Math.round(hs ? hs.hp * TUNE.statHpK : (host.maxhp ? host.maxhp() : 100) * TUNE.hpK));
    if (u.maxhp !== mx) { u.hp = u.maxhp > 1 ? Math.round(u.hp * mx / u.maxhp) : mx; u.maxhp = mx; }
    if (u.deadUntil) { if (now < u.deadUntil) return null; u.deadUntil = 0; u.hp = u.maxhp; u.idx = null; return {type: 'herorevive'}; }
    if (u.hp <= 0) return null;
    u.hp = Math.min(u.maxhp, u.hp + u.maxhp * TUNE.regen * dt);
    var ev = null;
    u.atkT -= dt;
    if (u.atkT <= 0) { u.atkT = TUNE.atkT;
      var ts = host.targets(); if (ts.length) { var t = host.pick ? host.pick(ts) : ts[0];
        var dps = host.dps ? host.dps() : 0, d = dps > 0 ? this.carry(capOf(host, dps * TUNE.dpsK * TUNE.atkT * (0.9 + Math.random() * 0.2), {src: 'hero', base: dps * TUNE.dpsK * TUNE.atkT})) : Math.max(1, Math.round(host.atkMax() * TUNE.atkK * (0.8 + Math.random() * 0.4)));
        if (d > 0) host.hit(t, d, 'cqhero'); this.addRage(1); ev = {type: 'heroatk', target: t, dmg: d}; } }
    if (h.autoHeji && this.ready() && host.targets().length) { var r = this.doHeji(host, false); if (r && r.ok) ev = r; }
    return ev;
  };
  // 英雄受伤：怪物攻击英雄时调用；返回 {dmg, dead}
  Hero.prototype.hurt = function(d, host){ var u = this.unit; if (!this.present() || u.hp <= 0 || u.deadUntil) return null; var hs = this.stats(host);
    if (hs && !hs.takesDmg) return null;   // heroStats.takesDmg=0：英雄当前不受伤
    d = Math.max(1, Math.round((d - (hs ? (hs.def || 0) * TUNE.defK : 0)) * TUNE.hurtK)); u.hp -= d;
    if (u.hp <= 0) { u.hp = 0; u.deadUntil = host.now() + TUNE.reviveSec * 1000; return {dmg: d, dead: true}; }
    this.addRage(1); return {dmg: d, dead: false}; };
  // 小数伤害累积（低等级玩家 DPS 很小时不被取整到 1 放大）
  Hero.prototype.carry = function(x){ this._fr = (this._fr || 0) + x; var d = Math.floor(this._fr); this._fr -= d; return d; };
  Hero.prototype.reviveLeft = function(now){ return this.unit.deadUntil ? Math.max(0, Math.ceil((this.unit.deadUntil - now) / 1000)) : 0; };
  Hero.prototype.doHeji = function(host, manual){
    var h = this.h, cb = this.combo();
    if (!this.present()) return {ok: false, msg: '尚未召唤英雄'};
    if (this.unit.hp <= 0) return {ok: false, msg: '英雄阵亡中'};
    if ((h.hejiCd || 0) > 0) return {ok: false, msg: '合击冷却中 (' + Math.ceil(h.hejiCd) + '秒)'};
    if ((h.rage || 0) < RAGE_MAX) return {ok: false, msg: '怒气不足 (' + Math.floor(h.rage || 0) + '/' + RAGE_MAX + ')'};
    var ts = host.targets(); if (!ts.length) return {ok: false, msg: '没有目标'};
    var targets = cb.aoe ? ts : [host.pick ? host.pick(ts) : ts[0]], hits = [], total = 0, self = this;
    h.rage = 0; h.hejiCd = TUNE.hejiCd; h.hejiCount = (h.hejiCount || 0) + 1;
    var tot = this.hejiTotal(cb, host), per = Math.max(1, Math.round(tot / targets.length));   // 群体合击：总伤平分到目标
    targets.forEach(function(m){ hits.push({m: m, d: per}); total += per; });
    save(this.store, h);
    return {ok: true, type: 'heji', name: cb.name, fx: cb.fx, combo: cb, hits: hits, total: total, manual: !!manual};
  };
  Hero.prototype.persist = function(){ save(this.store, this.h); };
  CQ.Hero = Hero; CQ.HEJI = {COMBO: COMBO, comboKey: comboKey, PROF: PROF, PNAME: PNAME, RAGE_MAX: RAGE_MAX, HEJI_CD: HEJI_CD, TUNE: TUNE};
  if (typeof module !== 'undefined') module.exports = {Hero: Hero, HEJI: CQ.HEJI};
})();
