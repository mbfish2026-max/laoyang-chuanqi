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
  // 系统接口：window.CQSys（api===1，docs/systems_api.md）。每项先用正式接口，接口不在时用本地兜底。
  var SYS = function(){ var C = window.CQSys; return C && C.api === 1 ? C : null; };
  var sysFn = function(n){ var C = SYS(); return C && typeof C[n] === 'function' ? C : null; };
  CQ.MISSING = [   // 已由 CQSys 提供的接口不再列出；下面是仍然缺、或 CQSys 不在时才用的兜底
    {api: 'CQSys 不存在时（单测/旧页面）', why: '离线兜底', fallback: '英雄存 localStorage cq_battle_hero_v1；属性按 CQ.HERO_TUNE；元宝显示 —；战力显示职业名；暴击读全局 CRIT；首领条副行显示战斗用时+波次；立绘按 key 哈希；冷却按 spend 时刻'},
    {api: 'CQ_SKCD 冷却登记（职业 Bot）', why: 'skillCooldown 未登记时 placeholder:true', fallback: '冷却圈按 spend(id) 施放时刻 + max(ST.castT,1s)'},
    {api: 'CQ_MONART 未覆盖的怪', why: 'monArt(key) 返回 null', fallback: '首领 mdl_mst_2001，其余按 key 哈希到 4 张立绘'},
    {api: 'CQ_BAL.hero 数值确认', why: 'heroStats 公式是占位（待职业/数值侧确认）', fallback: 'CQ.HERO_TUNE.statAtkK/statHpK/defK 可调系数'},
    {api: '英雄等级成长 / 英雄经验', why: 'S.hero.lvl 目前随角色等级', fallback: '面板只显示'}
  ];

  // 技能 → 传奇之旅序列帧（按技能名关键字；系统开发换成传奇技能后同样按名字匹配，例如 火球术/雷电术/半月弯刀/烈火剑法/灵魂火符/施毒术/治愈术）
  var SKILL_FX = [[/火球|爆炎球|火焰弹|陨石/, 'huoqiu'], [/雷|电/, 'leidianshu'], [/冰|霜|雪|寒/, 'bingpaoxiao'], [/火墙|焰|炎/, 'huoqiang'], [/毒/, 'shidu'],
    [/灵魂|火符|骨矛|骨魂|噬骨|念力/, 'linghunhuofu'], [/半月|旋风|双重挥击/, 'banyue'], [/烈火/, 'liehuo'], [/冲撞|跃/, 'yemanchongzhuang'], [/攻杀|刺杀|猛击|斩|震晕|狂乱|投掷|狂暴|专注/, 'gongsha'],
    [/治|愈|复生/, 'zhiliaoshu'], [/召唤|唤起|魔像/, 'zhaohuan'], [/神圣|战甲|壁垒/, 'shenshengzhanjia'], [/盾|甲|护|吼|号令|指挥|嚎|呐|吶|图腾|挑衅|炎附|闪移/, 'mofadun']];
  CQ.SKILL_FX = SKILL_FX;
  // 美术专属序列帧（77305ba，按技能名精确匹配，优先于 SKILL_FX 与职业 cqfx 的通用映射）
  var SKILL_FX_ART = CQ.SKILL_FX_ART = {'抗拒火环': 'kangjuhuohuan', '地狱火': 'diyuhuo', '诱惑之光': 'youhuozhiguang', '隐身术': 'yinshenshu'};
  var castAt = {};
  // 技能栏图标：传奇原版 ic_sk_*（assets/cq/ui/sk/），按技能 id 对应；无图的技能回退到 SKM.ic 字符
  var SK_ICON = {jbjs:1001, gsjs:1002, csjs:1003, bywd:1004, ymcz:1005, lhjf:1007, hqs:2001, ldsh:2002, hq:2003, yhzg:2004, mfd:2005, bpx:2007, kjhh:2006, dyh:2008,
    jsl:3001, zys:3002, lhhf:3003, sds:3004, zhkl:3005, zhss:3008, ysh:3006, sszj:3007};
  CQ.SK_ICON = SK_ICON;
  function skImg(id){ return SK_ICON[id] ? 'assets/cq/ui/sk/ic_sk_' + SK_ICON[id] + '.png' : null; }
  // 设计稿：技能栏固定 4 格 = 当前职业技能。已学（自动施放顺序）在前，不足 4 个用本职业未学主动技能（按需求等级）补位，显示为锁定
  function skRow(L){ var cls = Host.role().cls, SKM = G('SKM') || {}, pool = (G('CLS_SKILLS') || []).filter(function(x){ return x && x.cls === cls && x.kind !== 'passive' && SKM[x.id]; });
    L = (L || []).filter(function(o){ var s = SKM[o.id]; return !s || !s.cls || s.cls === cls; }).slice(0, 4);
    var seen = {}; L.forEach(function(o){ seen[o.id] = 1; });
    pool.slice().sort(function(a, b){ return (a.r || 0) - (b.r || 0) || (SK_ICON[b.id] ? 1 : 0) - (SK_ICON[a.id] ? 1 : 0); }).forEach(function(x){ if (L.length < 4 && !seen[x.id]) { seen[x.id] = 1; L.push({id: x.id, n: x.n, ic: x.ic, lock: 1, need: x.r || 1, cdMax: 1, cdLeft: 0}); } });
    L.forEach(function(o){ o.img = o.img || skImg(o.id); });
    return L; }      // 技能施放时刻（冷却圈兜底）
  var ART = ['mdl_mst_1015', 'mdl_mst_1014', 'mdl_mst_1017', 'mdl_mst_1013'];
  // 传奇之旅 config/monster.txt 的 name→model（立绘已拷到 assets/cq/ui/）：CQSys.monArt 返回 null 时按怪名兜底
  var ART_BY_NAME = {'鸡': 'mdl_mst_1001', '鹿': 'mdl_mst_1002', '多钩猫': 'mdl_mst_1003', '钉耙猫': 'mdl_mst_1004', '稻草人': 'mdl_mst_1005', '半兽人': 'mdl_mst_1006', '森林雪人': 'mdl_mst_1007',
    '半兽战士': 'mdl_mst_1008', '毒蜘蛛': 'mdl_mst_1009', '食人花': 'mdl_mst_1011', '山洞蝙蝠': 'mdl_mst_1012', '骷髅': 'mdl_mst_1013', '掷斧骷髅': 'mdl_mst_1014', '骷髅战士': 'mdl_mst_1015',
    '洞蛆': 'mdl_mst_1022', '僵尸': 'mdl_mst_1023', '爬行僵尸': 'mdl_mst_1024', '红蛇': 'mdl_mst_1025', '虎蛇': 'mdl_mst_1025', '盔甲虫': 'mdl_mst_1034', '电僵尸': 'mdl_mst_2002'};
  CQ.ART_BY_NAME = ART_BY_NAME;
  // 立绘候选链（M1.8）：CQSys.monArt → 同名 mdl_mst_<key>.png → 按怪名 → 首领 2001 / 旧随机池。不手写文件清单：卡片 img onerror 时
  //   CQ.artBad(url) 记一笔（缓存在 ART_BAD，整局不再请求），再取下一级。美术以后加 mdl_mst_<key>.png 无需改代码。
  var ART_BAD = {}; CQ.artBad = function(u){ if (u) ART_BAD[u] = 1; }; CQ._artBad = ART_BAD;
  var PCLS = {1: 'zs', 2: 'fs', 3: 'ds'}, PPROF = {zs: 1, fs: 2, ds: 3};
  // 冷却圈：CQSys.skillCooldown 已登记（placeholder:false）就用正式冷却
  function cdFix(o){ var C = sysFn('skillCooldown'); if (!C) return o; try { var c = C.skillCooldown(o.id); if (c && !c.placeholder && c.cd > 0) { o.cdMax = c.cd; o.cdLeft = c.left; o.sys = 1; } } catch (e) {} return o; }
  function hash(s){ s = String(s || ''); var x = 0; for (var i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  var memStore = (function(){ var m = {}; return {getItem: function(k){ return k in m ? m[k] : null; }, setItem: function(k, v){ m[k] = String(v); }}; })();

  var Host = CQ.Host = {
    store: function(){ try { return window.localStorage || memStore; } catch (e) { return memStore; } },
    // 英雄存档：有 CQSys 时存 S.hero（随角色进云存档），并把旧 localStorage 存档一次性迁移进来后删掉
    heroStore: function(){ var C = sysFn('hero'), ls = Host.store(); if (!C) return ls;
      try { var old = ls.getItem('cq_battle_hero_v1'); if (old) { var o = JSON.parse(old) || {}, H = C.hero();
        if (!H.cls && o.prof && C.heroCreate) { C.heroCreate(PCLS[o.prof] || 'ds', o.name || ''); C.heroSet({rage: o.rage || 0, autoHeji: o.autoHeji === false ? 0 : 1}); }
        if (ls.removeItem) ls.removeItem('cq_battle_hero_v1'); } } catch (e) { console.warn('[CQ] 英雄存档迁移', e); }
      return {load: function(){ var H = C.hero(), cls = H.cls || (C.heroProfs ? C.heroProfs()[0] : 'ds');
          return {prof: PPROF[cls] || 3, cls: H.cls, name: H.name || '', rage: +H.rage || 0, autoHeji: !!H.autoHeji, exists: !!H.cls, lvl: H.lvl, eq: H.eq || {}}; },
        save: function(h){ if (h.exists && C.heroSet) C.heroSet({name: h.name, rage: Math.floor(h.rage || 0), autoHeji: h.autoHeji ? 1 : 0}); }}; },
    heroSys: function(){ return SYS(); },
    // 召唤物（职业开发：ALLY.kind==='cqpet'，sub=技能 id，死后移出 ALLY）。战场只显示同主人最多 2 只
    pets: function(){ var A = G('ALLY') || []; return A.filter(function(a){ return a && a.kind === 'cqpet' && a.hp > 0; }).slice(0, CQ.PET_MAX || 2); },
    petLvl: function(a){ try { return has('slvl') ? G('slvl')(a.sub) || 0 : 0; } catch (e) { return 0; } },
    // 立绘：a.art（宝宝=原怪 monArt key；pet_kl/pet_ss/pet_ss_gold=assets/cq/ui/<art>.png）→ 兜底按名字/子类推断 → 都没有时由卡片退回 a.ic emoji
    petArtFb: function(a){ var art = a.art || (a.sub === 'zhkl' ? 'pet_kl' : ''); return CQ.PET_ART_FB[art] ? 'assets/cq/ui/' + CQ.PET_ART_FB[art] + '.png' : null; },
    petArt: function(a){ var art = a.art;
      if (!art) { if (a.sub === 'zhkl') art = 'pet_kl'; else if (a.sub === 'zhss') art = /金色/.test(a.n || '') ? 'pet_ss_gold' : 'pet_ss';
        else { var nm = String(a.n || '').replace(/^宝宝·/, ''), M = G('MONS') || {}; for (var k in M) if (M[k] && M[k].n === nm) { art = k; break; } } }
      if (!art) return null; if (/^pet_/.test(art)) return 'assets/cq/ui/' + art + '.png';   // 图缺时卡片按 CQ.PET_ART_FB 退回原版模型，再退回 emoji
      var src = Host.monArt({key: art}); return /mdl_mst_2001/.test(src) ? null : src; },
    heroStats: function(){ var C = sysFn('heroStats'); if (!C) return null; try { var s = C.heroStats(); return s && s.cls ? s : null; } catch (e) { return null; } },
    heroBag: function(){ var S = G('S') || {}, B = G('BASEM') || {}; return (S.bag || []).filter(function(it){ return it && !it.k && B[it.b]; }).slice(0, 16); },
    role: function(){ var S = G('S') || {}, ST = G('ST') || {}, H = G('H') || {}, cls = (has('curCls') ? G('curCls')() : S.cls) || 'zs';
      var lv = S.lvl || 1, xn = has('xpNeed') ? G('xpNeed') : null, xp = 0;
      if (xn) { var a = xn(lv), b = xn(lv + 1); xp = b > a ? (S.xp - a) / (b - a) * 100 : 0; }
      var r = {name: S.name || (has('clsName') ? G('clsName')() : '勇士'), clsName: has('clsName') ? G('clsName')() : '', cls: cls, lvl: lv, hp: H.life || 0, maxhp: ST.life || 1, mp: H.mana || 0, maxmp: ST.mana || 1,
        xpPct: xp, gold: S.gold || 0, yb: null, power: null};
      var C = SYS(); if (C) { try { if (C.currency) { var cu = C.currency(); r.gold = cu.gold; r.yb = cu.yb; } if (C.power) r.power = C.power(); } catch (e) {} }
      return r; },
    mons: function(){ var M = G('MON') || []; return M.filter(function(m){ return m && m.hp > 0; }).slice(0, 12); },
    zone: function(){ var S = G('S') || {}, z = has('zoneData') ? G('zoneData')() : null; if (!z) return {name: '', sub: ''};
      var w = Math.min(S.wave || 0, z.w || 0); return {name: z.n, sub: z.boss && w >= (z.w || 0) ? '首领' : '第' + w + '/' + (z.w || 0) + '波'}; },
    logs: function(n){ var L = G('LOGS') || []; return L.slice(-n); },
    skills: function(){ return skRow(Host.skLearned()); },
    skLearned: function(){ var S = G('S') || {}, SKM = G('SKM') || {}, ST = G('ST') || {}, now = performance.now() / 1000, cls = Host.role().cls;
      if (has('acLearned')) { var L = G('acLearned')() || [], cfg = has('acCfg') ? G('acCfg') : null, cm = Math.max(1, +ST.castT || 1);
        return L.slice(0, 4).map(function(id){ var s = SKM[id] || {}, t = castAt[id] || 0; return cdFix({id: id, n: s.n, ic: s.ic, img: null, off: cfg ? !cfg(id).on : false, cdMax: cm, cdLeft: t ? Math.max(0, cm - (now - t)) : 0, fired: t}); }); }
      var ids = Object.keys(S.sk || {}).filter(function(id){ var s = SKM[id]; return s && s.kind !== 'passive' && (S.sk[id] || 0) > 0 && (!s.cls || s.cls === cls || s.ccls === cls); });
      ids.sort(function(a, b){ return (castAt[b] || 0) - (castAt[a] || 0) || (SKM[a].r || 0) - (SKM[b].r || 0); });
      ids = ids.slice(0, 4).sort(function(a, b){ return (SKM[a].r || 0) - (SKM[b].r || 0) || (a < b ? -1 : 1); });
      var cdMax = Math.max(1, +ST.castT || 1);
      return ids.map(function(id){ var s = SKM[id], t = castAt[id] || 0; return cdFix({id: id, n: s.n, ic: s.ic, img: null, cdMax: cdMax, cdLeft: t ? Math.max(0, cdMax - (now - t)) : 0, fired: t}); }); },
    bossInfo: function(){ var C = sysFn('bossInfo'); try { return C ? C.bossInfo() : null; } catch (e) { return null; } },
    range: function(){ var ST = G('ST') || {}; return ST.ranged || /fs|ds/.test(Host.role().cls) ? 3 : 1; },
    atkMax: function(){ var ST = G('ST') || {}; return Math.max(1, (+ST.wmax || 0) + (+ST.fire || 0) + (+ST.cold || 0)); },   // 去掉了 等级×3 下限
    lvl: function(){ return Host.role().lvl; },
    heroK: function(){ var hs = Host.heroStats(); return hs && hs.heroK != null ? hs.heroK : (CQ.HERO_TUNE || {}).atkK || 0.35; },
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
    skillFx: function(id){ var SKM = G('SKM') || {}, n = (SKM[id] || {}).n || ''; if (SKILL_FX_ART[n]) return SKILL_FX_ART[n]; for (var i = 0; i < SKILL_FX.length; i++) if (SKILL_FX[i][0].test(n)) return SKILL_FX[i][1]; return null; },
    skillPop: function(id){ if (has('acPop')) G('acPop')(id); },
    toast: function(t){ if (has('toast')) G('toast')(t); },
    monArts: function(m){ var L = [], C = sysFn('monArt'), U = 'assets/cq/ui/';
      if (C) { try { var a = C.monArt(m.key); if (a && a.src) L.push(a.src); } catch (e) {} }
      if (m.key) L.push(U + 'mdl_mst_' + m.key + '.png');
      var bn = ART_BY_NAME[m.n || ((G('MONS') || {})[m.key] || {}).n]; if (bn) L.push(U + bn + '.png');
      L.push(U + (m.boss ? 'mdl_mst_2001' : ART[hash(m.key || m.n) % ART.length]) + '.png');
      return L.filter(function(u, i){ return L.indexOf(u) === i; }); },
    monArt: function(m){ var L = Host.monArts(m); for (var i = 0; i < L.length; i++) if (!ART_BAD[L[i]]) return L[i]; return L[L.length - 1]; },
    itemInfo: function(it){ if (!it) return null; var name = has('itemName') ? G('itemName')(it) : (it.name || '物品'), color = has('itemColor') ? G('itemColor')(it) : '#e8e0cc';
      var t = has('tgTier') ? G('tgTier')(it) : null, TG = G('TG'), tier = null;
      if (t && TG) tier = {key: t, rank: TG.RANK[t] || 1, color: TG.COL[t], tag: TG.TAG[t] || '极品', top: !!TG.TOP[t] || (TG.RANK[t] || 0) >= 3};
      var img = has('icon2Url') ? G('icon2Url')(it) : null;
      return {name: name, color: color, tier: tier, good: it.q >= 3 || !!it.k, img: img, ic: it.k === 'rune' ? '☉' : it.k === 'gem' ? '◆' : '⚔'}; }
  };

  // ---------- 英雄核心：在 game.js step() 里出手（包装 step，不在战斗页/后台定时器也算；离线按 S.kpm 结算，kpm 已含英雄击杀） ----------
  // 玩家近期「有效」DPS：hitMon 中 src 不是 cqhero/cqheji 的伤害（含持续伤害、召唤物），只算到怪物剩余血量为止（秒怪溢出不算），1 秒一桶，滑动 TUNE.dpsWin(≈120) 秒
  var DPS = {b: [0], t: 0, age: 0};
  function dpsAdd(v){ if (v > 0) DPS.b[DPS.b.length - 1] += v; }
  function dpsTick(dt){ DPS.t += dt; DPS.age += dt; while (DPS.t >= 1) { DPS.t -= 1; DPS.b.push(0); var W = (CQ.HERO_TUNE || {}).dpsWin || 120; if (DPS.b.length > W + 1) DPS.b.shift(); } }
  function dpsNow(){ var T = CQ.HERO_TUNE || {}; if (DPS.age < (T.dpsMin || 8)) return 0; var n = DPS.b.length - 1, sum = 0; for (var i = 0; i < n; i++) sum += DPS.b[i]; return n > 0 ? sum / n : 0; }
  var core = null, hurtT = 0, saveT = 0, dots = [];
  function heroCore(){ if (!core && CQ.Hero) { var prof = (CQ.HEJI.PROF[Host.role().cls] || 1); core = new CQ.Hero(prof, Host.heroStore()); } return core; }
  var coreHost = {cls: function(){ try { return Host.role().cls; } catch (e) { return null; } }, now: function(){ var gt = G('GT'); return typeof gt === 'number' ? gt * 1000 : Date.now(); },   /* 游戏时间（随 SPEED/后台定时器推进） */ targets: function(){ return Host.mons(); }, pick: function(ts){ return ts.filter(function(m){ return m.boss; })[0] || ts[0]; },
    hit: function(m, d, src){ return Host.hit(m, d, src); }, atkMax: function(){ return Host.atkMax(); }, lvl: function(){ return Host.lvl(); }, heroK: function(){ return Host.heroK(); },
    maxhp: function(){ return Host.maxhp(); }, heroStats: function(){ return Host.heroStats(); }, dps: dpsNow};
  // 伤害封顶：系统入口 CQ_BAL.cap(dmg, ctx)，ctx={src:'player'|'hero'|'combo'|'summon', base?, mul?}，上限 CQ_BAL.capMul=1.8。
  // 系统实现没到时用下面的兜底（待替换）。注意：当前 cq/balance.js 里 CQ_BAL.cap 还是数字 1.8（cqCapMul 在用），这种情况下不覆盖它，只在本地用兜底。
  function capFallback(dmg, ctx){ var B = G('CQ_BAL') || window.CQ_BAL || {}, M = +B.capMul || (typeof B.cap === 'number' ? B.cap : 1.8); ctx = ctx || {};
    if (ctx.base > 0) return Math.min(dmg, ctx.base * M); if (ctx.mul > M) return dmg * M / ctx.mul; return dmg; }
  function capDmg(dmg, ctx){ var B = G('CQ_BAL'); if (!B) { B = window.CQ_BAL = window.CQ_BAL || {}; }
    if (typeof B.cap === 'function') { try { return B.cap(dmg, ctx); } catch (e) { return capFallback(dmg, ctx); } }
    if (B.cap == null) B.cap = B.cap || capFallback;   // CQ_BAL.cap = CQ_BAL.cap || 兜底（待替换）
    return capFallback(dmg, ctx); }
  coreHost.cap = capDmg; CQ.capDmg = capDmg;
  CQ.heroCore = heroCore; CQ.heroHost = coreHost; CQ.dps = dpsNow; CQ._dpsState = DPS;
  function emit(name, ev){ try { if (on() && CQ.Scene[name]) CQ.Scene[name](ev); } catch (e) {} }
  // 合击结算（伤害/眩晕/持续/回血都在这里真实发生；战斗页只播演出）
  function applyHeji(ev){ ev.hits.forEach(function(x){ x.got = Host.hit(x.m, x.d, 'cqheji') || 0; if (ev.combo.stun) Host.stun(x.m, ev.combo.stun); if (ev.combo.dot) dots.push({m: x.m, d: Math.round(x.d * ev.combo.dot), n: 5, t: 1}); });
    if (ev.combo.heal) { Host.healPct(ev.combo.heal); core.unit.hp = Math.min(core.unit.maxhp, core.unit.hp + core.unit.maxhp * ev.combo.heal); }
    ev.applied = true; emit('playHeji', ev); }
  function coreStep(dt){ var hc = heroCore(); if (!hc) return; dpsTick(dt);
    dots = dots.filter(function(o){ o.t -= dt; if (o.t > 0) return true; o.t = 1; if (!(o.m.hp > 0)) return false; Host.hit(o.m, o.d, 'cqheji'); emit('onDot', o); return --o.n > 0; });
    var ev = hc.tick(dt, coreHost);
    if (ev) { if (ev.type === 'heji') applyHeji(ev); else emit('onHeroEvent', ev); }
    // 英雄受伤：有怪时每 hurtT 秒，hurtP 概率被一只活怪打一下（战斗页的格子站位只做表现）
    var T = CQ.HERO_TUNE; hurtT -= dt; if (hurtT <= 0) { hurtT = T.hurtT * (0.85 + Math.random() * 0.3); var ms = Host.mons();
      if (ms.length && Math.random() < T.hurtP) { var m = ms[Math.floor(Math.random() * ms.length)], d = m.dmg ? m.dmg[0] + Math.random() * (m.dmg[1] - m.dmg[0]) : 3; var r = hc.hurt(d, coreHost); if (r) emit('onHeroEvent', {type: 'herohurt', m: m, dmg: r.dmg, dead: r.dead}); } }
    saveT += dt; if (saveT > 15) { saveT = 0; hc.persist(); } }
  CQ._coreStep = coreStep;
  CQ.heroHejiNow = function(){ var hc = heroCore(); var r = hc.doHeji(coreHost, true); if (r.ok) applyHeji(r); return r; };

  // ---------- 运行时包装（最外层，最后加载） ----------
  var curSrc = null, curMon = null;
  // 召唤物事件：CQSys pet:spawn/pet:hit/pet:atk/pet:die {uid,dmg?,tgt?} 一旦出现就以事件为准，否则场景每帧按 uid 对比 ALLY 兜底
  // 召唤物立绘兜底：pet_kl 用原版变异骷髅模型 mdl_mst_1014（web-replica monster.txt 300101）；神兽原版无专用模型（1091 用的是占位 1001），保持 emoji，待美术2出 pet_ss/pet_ss_gold
  CQ.PET_ART_FB = {};   /* 美术2 9661a04 已出 pet_kl/pet_ss/pet_ss_gold，不再退回 1014 */
  var petEv = false; CQ.petEvents = function(){ return petEv; };
  function emitPet(k, d, fallback){ try { if (on() && CQ.Scene.onPet) CQ.Scene.onPet(k, d || {}, !!fallback); } catch (e) {} }
  function wrap(name, mk){ if (!has(name)) return false; var f = G(name); if (typeof f !== 'function' || f._cq) return false; var g = mk(f); g._cq = 1; window[name] = g;
    try { eval(name + '=g'); } catch (e) {} return true; }
  function install(){
    wrap('hitMon', function(f){ return function(m, d, src, fxc){ var prev = curSrc, pm = curMon; curSrc = src; curMon = m; var hp0 = m && m.hp > 0 ? m.hp : 0; try { var r = f.apply(this, arguments); if (src !== 'cqhero' && src !== 'cqheji') dpsAdd(Math.min(+r || 0, hp0));
        if (src && typeof src === 'object' && src.kind === 'cqpet' && !petEv) emitPet('atk', {uid: src.uid, tgt: m, dmg: +r || 0}, true);
        if (src === 'hero' && core) core.addRage(window.CQSys && CQSys.critNow ? 4 : 2); return r; } finally { curSrc = prev; curMon = pm; } }; });
    wrap('step', function(f){ return function(dt){ var r = f.apply(this, arguments); try { coreStep(+dt || 0); } catch (e) { console.error('[CQ] hero step', e); } return r; }; });
    // 暴击：有 CQSys 时按 crit 事件出大字（替代全局 CRIT）；暴击那一下的普通飘字跳过，由事件补成暴击大字
    var C = sysFn('on'); if (C && !install._crit) { install._crit = 1;
      C.on('crit', function(d){ try { if (on() && curMon) CQ.Scene.onMonDamage(curMon, d && d.dmg || 0, d && d.src || curSrc, true); } catch (e) {} });
      C.on('hero', function(){ try { if (CQ.Scene.mounted()) CQ.Scene.onHeroChange(); } catch (e) {} });
      ['spawn', 'hit', 'atk', 'die'].forEach(function(k){ C.on('pet:' + k, function(d){ petEv = true; emitPet(k, d, false); }); });
      C.on('bossEnrage', function(d){ try { if (on()) CQ.Scene.onBossEnrage(d); } catch (e) {} }); }
    wrap('floatNum', function(f){ return function(id, v, c){ var r = f.apply(this, arguments);
      try { if (on() && typeof id === 'number') { var m = (G('MON') || []).filter(function(x){ return x.uid === id; })[0]; if (m) { var S2 = SYS(); if (S2) { if (!S2.critNow) CQ.Scene.onMonDamage(m, v, curSrc, false); } else CQ.Scene.onMonDamage(m, v, curSrc, !!G('CRIT') && curSrc === 'hero'); } } } catch (e) {}
      return r; }; });
    wrap('floatHero', function(f){ return function(t, c){ var r = f.apply(this, arguments); if (core && /^-\d/.test(String(t))) core.addRage(3); try { if (on()) CQ.Scene.onRoleHurt(String(t), c); } catch (e) {} return r; }; });
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
