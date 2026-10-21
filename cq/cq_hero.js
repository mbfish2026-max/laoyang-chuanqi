'use strict';
// cq/cq_hero.js — 英雄 + 合击，规则移植自传奇之旅 js/systems/hero.js（按热血传奇 1.80 英雄版经典规则）
// - 英雄是同场单位（CQ 战场里的 _pets 成员），跟随走位、自动攻击
// - 怒气 0~100：玩家/英雄造成伤害、玩家受伤都会增加；满怒气可施放合击（手动点按钮或自动），冷却 30 秒
// - 合击按「玩家职业+英雄职业」查 COMBO（与顺序无关）
// 数值落地：本游戏唯一真相源是 game.js 的 hitMon/MON，英雄与合击伤害通过 Host.hit() 打进去（见 cq_bridge.js）。
(function(){
  var W = typeof window !== 'undefined' ? window : globalThis, CQ = W.CQ = W.CQ || {};
  var RAGE_MAX = 100, HEJI_CD = 30, REVIVE_SEC = 30, HERO_ATK_T = 1.6;
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
  function comboKey(a, b){ return Math.min(a, b) + '+' + Math.max(a, b); }
  function defaultHeroProf(p){ return p === 1 ? 3 : 1; }   // 战士带道士，法师/道士带战士（样稿：战神 + 英雄·道士）

  var STORE_KEY = 'cq_battle_hero_v1';
  function load(store){ try { var s = store && store.getItem(STORE_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function save(store, h){ try { if (store) store.setItem(STORE_KEY, JSON.stringify(h)); } catch (e) {} }

  function create(playerProf, store){
    var h = load(store);
    if (!h || !h.prof) h = {prof: defaultHeroProf(playerProf), name: '', rage: 0, hejiCd: 0, autoHeji: true, hejiCount: 0};
    if (!h.name) h.name = '英雄·' + PNAME[h.prof];
    return h;
  }
  // 战斗中的英雄单位状态（不入存档）
  function Hero(playerProf, store){
    this.store = store; this.playerProf = playerProf;
    this.h = create(playerProf, store);
    this.unit = {isHero: true, hp: 1, idx: null, atkT: HERO_ATK_T, deadUntil: 0};
  }
  Hero.prototype.combo = function(){ return COMBO[comboKey(this.playerProf, this.h.prof)]; };
  Hero.prototype.addRage = function(n){ this.h.rage = Math.min(RAGE_MAX, (this.h.rage || 0) + n); };
  Hero.prototype.ready = function(){ return this.h.rage >= RAGE_MAX && !(this.h.hejiCd > 0) && this.unit.hp > 0; };
  // 合击伤害：(玩家攻击上限 + 英雄攻击上限) * 倍率 * (1 + 主角等级/50)，原版公式；英雄攻击上限 = 玩家 * heroK
  Hero.prototype.hejiDamage = function(cb, atkMax, lvl, heroK){ return Math.max(1, Math.round((atkMax + atkMax * heroK) * cb.mult * (1 + lvl / 50) * (0.9 + Math.random() * 0.2))); };
  // 每帧：冷却、复活、英雄普攻、自动合击。host: {targets(), hit(m,d,src), atkMax(), lvl(), heroK(), now()}
  Hero.prototype.tick = function(dt, host){
    var h = this.h, u = this.unit, now = host.now();
    if (h.hejiCd > 0) h.hejiCd = Math.max(0, h.hejiCd - dt);
    if (u.deadUntil && now >= u.deadUntil) { u.deadUntil = 0; u.hp = 1; }
    if (u.hp <= 0) return null;
    var ev = null;
    u.atkT -= dt;
    if (u.atkT <= 0) { u.atkT = HERO_ATK_T;
      var ts = host.targets(); if (ts.length) { var t = host.pick ? host.pick(ts) : ts[0];
        var d = Math.max(1, Math.round(host.atkMax() * host.heroK() * (0.8 + Math.random() * 0.4)));
        host.hit(t, d, 'cqhero'); this.addRage(1); ev = {type: 'heroatk', target: t, dmg: d}; } }
    if (h.autoHeji && this.ready() && host.targets().length) { var r = this.doHeji(host, false); if (r && r.ok) ev = r; }
    return ev;
  };
  Hero.prototype.doHeji = function(host, manual){
    var h = this.h, cb = this.combo();
    if (this.unit.hp <= 0) return {ok: false, msg: '英雄阵亡中'};
    if ((h.hejiCd || 0) > 0) return {ok: false, msg: '合击冷却中 (' + Math.ceil(h.hejiCd) + '秒)'};
    if ((h.rage || 0) < RAGE_MAX) return {ok: false, msg: '怒气不足 (' + Math.floor(h.rage || 0) + '/' + RAGE_MAX + ')'};
    var ts = host.targets(); if (!ts.length) return {ok: false, msg: '没有目标'};
    var targets = cb.aoe ? ts : [host.pick ? host.pick(ts) : ts[0]], hits = [], total = 0, self = this;
    h.rage = 0; h.hejiCd = HEJI_CD; h.hejiCount = (h.hejiCount || 0) + 1;
    targets.forEach(function(m){ var d = self.hejiDamage(cb, host.atkMax(), host.lvl(), host.heroK()); hits.push({m: m, d: d}); total += d; });
    save(this.store, h);
    return {ok: true, type: 'heji', name: cb.name, fx: cb.fx, combo: cb, hits: hits, total: total, manual: !!manual};
  };
  Hero.prototype.persist = function(){ save(this.store, this.h); };
  CQ.Hero = Hero; CQ.HEJI = {COMBO: COMBO, comboKey: comboKey, PROF: PROF, PNAME: PNAME, RAGE_MAX: RAGE_MAX, HEJI_CD: HEJI_CD, REVIVE_SEC: REVIVE_SEC};
  if (typeof module !== 'undefined') module.exports = {Hero: Hero, HEJI: CQ.HEJI};
})();
