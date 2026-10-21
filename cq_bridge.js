'use strict';
// cq_bridge.js — 老羊传奇战斗胶水（M1）：把传奇卡片战场（cq/*）接到暗夜框架的真实数据上。
// 唯一真相源仍是 game.js 的 step()/MON/hitMon/killMon/rollTC；本文件只做三件事：
//   1) CQ.Host：读数据（S/ST/H/MON/LOGS/zoneData…）+ 少量写入（英雄/合击伤害走 hitMon，眩晕写 m.stun，回血写 H.life）
//   2) 运行时包装（不改共享文件）：hitMon/floatNum/floatHero/killMon/groundLoot/spawnFloat/spend → 转成战场事件
//   3) 接 CQBattle（cq/battle_mount.js）：register / pause / resume / mapAttrs
// 缺的系统接口见 CQ.MISSING（本地兜底已实现，等系统开发提供正式接口后替换）。
(function(){
  if (typeof window === 'undefined' || window.__CQ_NO_ENGINE) return;
  var CQ = window.CQ = window.CQ || {};
  var has = function(n){ try { return typeof eval(n) !== 'undefined'; } catch (e) { return false; } };   // 探测 let/const 全局（S/ST/H/MON/LOGS 等不在 window 上）
  var G = function(n){ try { return eval(n); } catch (e) { return undefined; } };
  var on = function(){ return !!(CQ.Scene && CQ.Scene.mounted() && window.CQBattle && CQBattle.isActive()); };

  // ---------- 缺口清单（本地兜底） ----------
  CQ.MISSING = [
    {api: 'Host.heroSave / 英雄存档字段', why: '英雄(职业/名字/怒气/自动合击)要进云存档', fallback: 'localStorage cq_battle_hero_v1（不跟云存档、不分角色）'},
    {api: 'Host.heroProf / 英雄创建界面', why: '英雄职业由玩家选择', fallback: '战士带道士，法师/道士带战士'},
    {api: 'Host.heroStats', why: '英雄自身攻防血/装备', fallback: 'CQ.HERO_TUNE：普攻 1.6 秒/玩家武器上限×0.35，血量=玩家生命×0.8，贴身怪按其攻击力打英雄，阵亡 30 秒复活'},
    {api: 'Host.skillCooldown(id)', why: '技能冷却圈需要真实冷却/剩余时间（暗夜技能无独立冷却）', fallback: '技能列表取 acLearned() 前 4 个；按 spend(id) 施放时刻 + max(ST.castT,1s) 画圈；点圈调 acPop(id)'},
    {api: 'Host.monArt(key) / 怪物→传奇立绘映射', why: '卡片立绘', fallback: '首领 mdl_mst_2001，其余按 key 哈希到 4 张骷髅立绘'},
    {api: 'Host.currency().yb 元宝', why: '顶栏第二货币', fallback: '显示 —'},
    {api: 'Host.power() 战力', why: '顶栏战力', fallback: '显示职业名'},
    {api: 'Host.crit 标记', why: '暴击飘字', fallback: '读 skills.js 全局 CRIT（致命一击）'},
    {api: 'Host.onBossSpawn / 首领刷新时间', why: '首领大血条狂暴倒计时、真实时间刷新', fallback: '血条副行显示战斗用时+波次'},
    {api: 'Host.hejiBalance', why: '英雄/合击伤害系数需数值确认', fallback: 'heroK=0.35，合击倍率沿用传奇之旅 COMBO'}
  ];

  // 技能 → 传奇之旅序列帧（按技能名关键字；系统开发换成传奇技能后同样按名字匹配，例如 火球术/雷电术/半月弯刀/烈火剑法/灵魂火符/施毒术/治愈术）
  var SKILL_FX = [[/火球|爆炎球|火焰弹|陨石/, 'huoqiu'], [/雷|电/, 'leidianshu'], [/冰|霜|雪|寒/, 'bingpaoxiao'], [/火墙|焰|炎/, 'huoqiang'], [/毒/, 'shidu'],
    [/灵魂|火符|骨矛|骨魂|噬骨|念力/, 'linghunhuofu'], [/半月|旋风|双重挥击/, 'banyue'], [/烈火/, 'liehuo'], [/冲撞|跃/, 'yemanchongzhuang'], [/攻杀|刺杀|猛击|斩|震晕|狂乱|投掷|狂暴|专注/, 'gongsha'],
    [/治|愈|复生/, 'zhiliaoshu'], [/召唤|唤起|魔像/, 'zhaohuan'], [/神圣|战甲|壁垒/, 'shenshengzhanjia'], [/盾|甲|护|吼|号令|指挥|嚎|呐|吶|图腾|挑衅|炎附|闪移/, 'mofadun']];
  CQ.SKILL_FX = SKILL_FX;
  var castAt = {};      // 技能施放时刻（冷却圈兜底）
  var ART = ['mdl_mst_1015', 'mdl_mst_1014', 'mdl_mst_1017', 'mdl_mst_1013'];
  function hash(s){ s = String(s || ''); var x = 0; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  var memStore = (function(){ var m = {}; return {getItem: function(k){ return k in m ? m[k] : null; }, setItem: function(k, v){ m[k] = String(v); }}; })();

  var Host = CQ.Host = {
    store: function(){ try { return window.localStorage || memStore; } catch (e) { return memStore; } },
    role: function(){ var S = G('S') || {}, ST = G('ST') || {}, H = G('H') || {}, cls = (has('curCls') ? G('curCls')() : S.cls) || 'zs';
      var lv = S.lvl || 1, xn = has('xpNeed') ? G('xpNeed') : null, xp = 0;
      if (xn) { var a = xn(lv), b = xn(lv + 1); xp = b > a ? (S.xp - a) / (b - a) * 100 : 0; }
      return {name: S.name || (has('clsName') ? G('clsName')() : '勇士'), clsName: has('clsName') ? G('clsName')() : '', cls: cls, lvl: lv, hp: H.life || 0, maxhp: ST.life || 1, mp: H.mana || 0, maxmp: ST.mana || 1,
        xpPct: xp, gold: S.gold || 0, yb: null, power: null}; },
    mons: function(){ var M = G('MON') || []; return M.filter(function(m){ return m && m.hp > 0; }).slice(0, 12); },
    zone: function(){ var S = G('S') || {}, z = has('zoneData') ? G('zoneData')() : null; if (!z) return {name: '', sub: ''};
      var w = Math.min(S.wave || 0, z.w || 0); return {name: z.n, sub: z.boss && w >= (z.w || 0) ? '首领' : '第' + w + '/' + (z.w || 0) + '波'}; },
    logs: function(n){ var L = G('LOGS') || []; return L.slice(-n); },
    skills: function(){ var S = G('S') || {}, SKM = G('SKM') || {}, ST = G('ST') || {}, now = performance.now() / 1000, cls = Host.role().cls;
      if (has('acLearned')) { var L = G('acLearned')() || [], cfg = has('acCfg') ? G('acCfg') : null, cm = Math.max(1, +ST.castT || 1);
        return L.slice(0, 4).map(function(id){ var s = SKM[id] || {}, t = castAt[id] || 0; return {id: id, n: s.n, ic: s.ic, img: null, off: cfg ? !cfg(id).on : false, cdMax: cm, cdLeft: t ? Math.max(0, cm - (now - t)) : 0, fired: t}; }); }
      var ids = Object.keys(S.sk || {}).filter(function(id){ var s = SKM[id]; return s && s.kind !== 'passive' && (S.sk[id] || 0) > 0 && (!s.cls || s.cls === cls || s.ccls === cls); });
      ids.sort(function(a, b){ return (castAt[b] || 0) - (castAt[a] || 0) || (SKM[a].r || 0) - (SKM[b].r || 0); });
      ids = ids.slice(0, 4).sort(function(a, b){ return (SKM[a].r || 0) - (SKM[b].r || 0) || (a < b ? -1 : 1); });
      var cdMax = Math.max(1, +ST.castT || 1);
      return ids.map(function(id){ var s = SKM[id], t = castAt[id] || 0; return {id: id, n: s.n, ic: s.ic, img: null, cdMax: cdMax, cdLeft: t ? Math.max(0, cdMax - (now - t)) : 0, fired: t}; }); },
    range: function(){ var ST = G('ST') || {}; return ST.ranged || /fs|ds/.test(Host.role().cls) ? 3 : 1; },
    atkMax: function(){ var ST = G('ST') || {}; return Math.max(1, (+ST.wmax || 0) + (+ST.fire || 0) + (+ST.cold || 0), Host.role().lvl * 3); },
    lvl: function(){ return Host.role().lvl; },
    heroK: function(){ return (CQ.HERO_TUNE || {}).atkK || 0.35; },
    maxhp: function(){ return Host.role().maxhp; },
    pots: function(){ var S = G('S') || {}; return S.pot || {}; },
    // 自动吃药已在 game.js step() 内（阈值 CQSys.autoPot，默认开），战斗侧不重复吃
    autoPot: function(){ var C = window.CQSys; return C && C.autoPot ? C.autoPot() : null; },
    usePot: function(k){ if (has('usePot')) { G('usePot')(k); return true; } return false; },
    quest: function(){ try { return has('questLine') ? G('questLine')() : ''; } catch (e) { return ''; } },
    zoneNav: function(d){ var S = G('S'); if (!S || !has('goZone')) return; G('goZone')(Math.max(0, Math.min(S.unl || 0, S.zone + d))); },
    autoAdv: function(t){ var C = window.CQSys, S = G('S'); if (C && C.idle && C.setAuto) { if (t) C.setAuto(C.idle() ? 1 : 0); return !C.idle(); } if (!S) return false; if (t) { S.auto ^= 1; if (has('render')) G('render')(); } return !!S.auto; },
    openMap: function(){ var b = document.querySelector('#tabs button[data-t=map]'); if (b) b.click(); },
    hit: function(m, d, src){ if (!m || !(m.hp > 0) || !has('hitMon')) return 0; var col = src === 'cqheji' ? '#ffb000' : '#7dff8a';
      try { return G('hitMon')(m, {phys: Math.round(d)}, src, col) || 0; } catch (e) { console.error('[CQ] hit', e); return 0; } },
    stun: function(m, s){ if (m && m.hp > 0) m.stun = Math.max(m.stun || 0, s); },
    healPct: function(p){ var H = G('H'), ST = G('ST'); if (H && ST) H.life = Math.min(ST.life, H.life + ST.life * p); },
    log: function(html){ if (has('log')) G('log')(html); },
    skillFx: function(id){ var SKM = G('SKM') || {}, n = (SKM[id] || {}).n || ''; for (var i = 0; i < SKILL_FX.length; i++) if (SKILL_FX[i][0].test(n)) return SKILL_FX[i][1]; return null; },
    skillPop: function(id){ if (has('acPop')) G('acPop')(id); },
    toast: function(t){ if (has('toast')) G('toast')(t); },
    monArt: function(m){ if (m.boss) return 'assets/cq/ui/mdl_mst_2001.png'; return 'assets/cq/ui/' + ART[hash(m.key || m.n) % ART.length] + '.png'; },
    itemInfo: function(it){ if (!it) return null; var name = has('itemName') ? G('itemName')(it) : (it.name || '物品'), color = has('itemColor') ? G('itemColor')(it) : '#e8e0cc';
      var t = has('tgTier') ? G('tgTier')(it) : null, TG = G('TG'), tier = null;
      if (t && TG) tier = {key: t, rank: TG.RANK[t] || 1, color: TG.COL[t], tag: TG.TAG[t] || '极品', top: !!TG.TOP[t] || (TG.RANK[t] || 0) >= 3};
      var img = has('icon2Url') ? G('icon2Url')(it) : null;
      return {name: name, color: color, tier: tier, good: it.q >= 3 || !!it.k, img: img, ic: it.k === 'rune' ? '☉' : it.k === 'gem' ? '◆' : '⚔'}; }
  };

  // ---------- 运行时包装（最外层，最后加载） ----------
  var curSrc = null;
  function wrap(name, mk){ if (!has(name)) return false; var f = G(name); if (typeof f !== 'function' || f._cq) return false; var g = mk(f); g._cq = 1; window[name] = g;
    try { eval(name + '=g'); } catch (e) {} return true; }
  function install(){
    wrap('hitMon', function(f){ return function(m, d, src, fxc){ var prev = curSrc; curSrc = src; try { return f.apply(this, arguments); } finally { curSrc = prev; } }; });
    wrap('floatNum', function(f){ return function(id, v, c){ var r = f.apply(this, arguments);
      try { if (on() && typeof id === 'number') { var m = (G('MON') || []).filter(function(x){ return x.uid === id; })[0]; if (m) CQ.Scene.onMonDamage(m, v, curSrc, !!G('CRIT') && curSrc === 'hero'); } } catch (e) {}
      return r; }; });
    wrap('floatHero', function(f){ return function(t, c){ var r = f.apply(this, arguments); try { if (on()) CQ.Scene.onRoleHurt(String(t), c); } catch (e) {} return r; }; });
    wrap('killMon', function(f){ return function(m){ try { if (on()) CQ.Scene.onKill(m); } catch (e) {} return f.apply(this, arguments); }; });
    wrap('groundLoot', function(f){ return function(it){ if (on()) { try { CQ.Scene.onLoot(it); } catch (e) {} return; } return f.apply(this, arguments); }; });
    wrap('spawnFloat', function(f){ return function(){ if (on()) return; return f.apply(this, arguments); }; });
    wrap('spend', function(f){ return function(id){ castAt[id] = performance.now() / 1000; var r = f.apply(this, arguments); try { if (on()) CQ.Scene.onSkill(id); } catch (e) {} return r; }; });
  }

  // ---------- 接 CQBattle ----------
  function mount(){ var stage = window.CQBattle && CQBattle.stage(); if (!stage || !CQ.Scene) return false;
    delete stage.dataset.ready; document.body.classList.add('cq-on'); CQ.Scene.mount(stage); if (!CQBattle.isActive() || document.hidden) CQ.Scene.pause(); return true; }
  function boot(){
    install(); mount();
    window.CQ_pause = function(){ CQ.Scene.pause(); };
    window.CQ_resume = function(){ if (!CQ.Scene.mounted()) mount(); CQ.Scene.resume(); };
    document.addEventListener('visibilitychange', function(){ if (document.hidden) CQ.Scene.pause(); else if (CQBattle.isActive()) CQ.Scene.resume(); });
    if (window.CQBattle) {
      CQBattle.mapAttrs = function(){ var ST = G('ST') || {}, S = G('S') || {}, r = ST.res || {};
        return {atk: [ST.wmin || 0, ST.wmax || 0], mag: (ST.fire || 0) + (ST.cold || 0) + (ST.light || 0), tao: ST.pois || 0, def: ST.def || 0, mdef: Math.round(((r.fire || 0) + (r.cold || 0) + (r.light || 0)) / 3), acc: ST.ar || 0, agi: ST.def || 0,
          luck: 0, aspd: ST.ias || 0, crit: ST.dsx || 0, life: ST.life || 0, mana: ST.mana || 0, lvl: S.lvl || 1, cls: Host.role().cls}; };
      CQBattle.register({version: 'm1', scene: CQ.Scene, host: Host, missing: CQ.MISSING, heji: function(){ return CQ.Scene.doHeji(); }});
    }
  }
  CQ.bridgeBoot = boot; CQ._install = install;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 0); }); else setTimeout(boot, 0);
})();
