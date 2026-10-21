'use strict';
// ===================================================================================
// items2.js — 第四阶段装备机制（包装 game.js / items.js / acts.js 的函数，不改其本体）
// 双手武器、珠宝镶嵌、护身符（背包生效）、撕裂伤口/压碎性打击/致命一击等属性生效、详情显示修正、
// 珠宝/护身符掉落、升级/修复配方、新武器图标、随从可用弓/长柄。必须在 acts.js 之后加载。
// ===================================================================================
const CATN={wand:'魔杖',dagger:'匕首',sword:'剑',helm:'头盔',armor:'铠甲',shield:'盾',head:'缩颅',bow:'弓',xbow:'弩',polearm:'长柄',spear:'矛',jav:'标枪',throw:'投掷',axe:'斧',mace:'锤',staff:'法杖',jewel:'珠宝',scha:'小护身符',mcha:'大护身符',lcha:'超大护身符',gloves:'手套',belt:'腰带',boots:'靴子',pshd:'圣徽盾',pelt:'毛皮头饰',bhelm:'野蛮人头盔',orb:'法球',abow:'弓'};
const isTH=it=>!!(it&&!it.k&&BASEM[it.b]&&BASEM[it.b].th);
// 护身符/珠宝（isCharm/isJewel/charmMods/genJC/jewelUI）与炼金匣升级/修复配方已删除（legacy_prune 批次2）
// 随从：弓箭手用弓/弩，卫枪兵用长柄/矛（原版 1.13 随从武器规则）
if(typeof MERCS!=='undefined'){if(MERCS.archer)MERCS.archer.wcats=['bow','xbow'];if(MERCS.guard)MERCS.guard.wcats=[...new Set([...(MERCS.guard.wcats||[]),'polearm','spear'])];if(MERCS.barb)MERCS.barb.wcats=[...new Set([...(MERCS.barb.wcats||[]),'axe','mace'])]}

// ---------- 图标 ----------
const _i2_icon=itemIcon;itemIcon=function(it){if(it.k==='mat')return`<i class="ii">✷</i>`;if(!it.k){const b=BASEM[it.b];const g={bow:'🏹',xbow:'🏹',polearm:'🔱',spear:'🔱',jav:'🎯',throw:'🔪',axe:'🪓',mace:'🔨',staff:'🦯',jewel:'💎',scha:'🧿',mcha:'🧿',lcha:'🧿'}[b&&b.cat];if(g)return`<i class="ii ${b.s==='charm'?'chm c'+b.sz:''}">${g}</i>`}return _i2_icon(it)};

// ---------- 装备限制：双手武器与副手互斥 ----------
const _i2_equip=equip;equip=function(uid){const f=findItem(uid);if(!f||f.slot)return;const it=f.it,b=BASEM[it.b];
 let off=null;if(b.th&&S.eq.shield)off='shield';else if(b.s==='shield'&&isTH(S.eq.weapon))off='weapon';
 if(off){if(slotsUsed(S.bag)>=BAG_SZ)return toast('背包已满，无法卸下'+(off==='shield'?'副手':'双手武器'));S.bag.push(S.eq[off]);delete S.eq[off]}
 _i2_equip(uid)};
const _i2_auto=autoTick;autoTick=function(){const hide=S.bag.filter(it=>!it.k&&(isTH(it)||(isTH(S.eq.weapon)&&BASEM[it.b].s==='shield')));
 if(!hide.length)return _i2_auto();const set=new Set(hide);S.bag=S.bag.filter(x=>!set.has(x));try{_i2_auto()}finally{for(const x of hide)S.bag.push(x)}};

const _i2_calc=calc;calc=function(){const o=_i2_calc();
 const M=o.M||{};
 // 最大抗性：超出 75 的部分最多可到 75+最大抗性
 const pen=DIFFS[S.diff].pen,bon=(S.bon&&S.bon.res)||0;
 for(const [k,mk,rk] of [['fire','maxfres','fres'],['cold','maxcres','cres'],['light','maxlres','lres'],['pois','maxpres','pres']])if(M[mk]&&o.res[k]>=75){const raw=(M[rk]||0)+(M.allres||0)+pen+bon;o.res[k]=Math.min(75+M[mk],Math.max(o.res[k],raw))}
 if(M.arp)o.ar=Math.round(o.ar*(1+M.arp/100));
 ST=o;return o};

// ---------- 让“只显示”的属性在战斗中生效 ----------
// 撕裂伤口 ow：8 秒流血（伤害按角色等级，原版公式分段，首领 1/2）；压碎性打击 cb：扣当前生命 1/4（首领 1/8）；
// 致命一击 ds：物理伤害翻倍；对恶魔伤害 demon；无视防御 ignoredef；击退 kb；击中致盲 blind / 逃跑 flee：短暂失能；冻结 freeze。
function owDps(L){const f=L<=15?9*L+31:L<=30?18*L-104:L<=45?27*L-374:L<=60?36*L-779:45*L-1319;return Math.max(1,f*25/256)}
function attackerMods(src){if(src==='hero')return ST&&ST.M||{};if(src&&src.kind==='merc'&&S.merc){const M={};for(const k of ['weapon','helm','armor']){const it=S.merc.eq[k];if(!it)continue;const m=allMods(it);for(const x in m)M[x]=(M[x]||0)+m[x]}return M}return null}
let _i2_atk=0;
const _i2_hitMon=hitMon;hitMon=function(m,d,src,fxc){if(!m||m.hp<=0)return _i2_hitMon(m,d,src,fxc);
 const atk=(src==='hero'&&(fxc==='#fff'||(fxc==='#6f6'&&d.phys)))||(src&&src.kind==='merc');const M=atk?attackerMods(src):null;
 if(!M||!d.phys)return _i2_hitMon(m,d,src,fxc);
 const T=MONS[m.key]||BOSSES[m.key]||{};const dd=Object.assign({},d);
 if(M.demon&&T.demon)dd.phys*=1+M.demon/100;
 let crit=false;if(M.ds&&rnd()*100<Math.min(100,M.ds)){dd.phys*=2;crit=true}
 const r=_i2_hitMon(m,dd,src,crit?'#ff4':fxc);
 if(m.hp>0&&M.cb&&rnd()*100<M.cb){const x=Math.round(m.hp*(m.boss?1/8:1/4));if(x>0){m.hp-=x;floatNum(m.uid,x,'#c6f');if(m.hp<=0){killMon(m);return r+x}}}
 if(m.hp>0&&M.ow&&rnd()*100<M.ow){const lv=src==='hero'?S.lvl:(mercStats().L||S.lvl);m.ow={dps:owDps(lv)*(m.boss?0.5:1),left:8}}
 if(m.hp>0&&!m.boss){if(M.kb)m.t+=0.25;if((M.blind&&rnd()*100<M.blind)||(M.flee&&rnd()*100<M.flee))m.stun=Math.max(m.stun||0,0.8)}
 if(m.hp>0&&M.freeze){m.stun=Math.max(m.stun||0,0.2*M.freeze*(m.boss?0.5:1));m.slow=GT+2}
 return r};
const _i2_hc=hitChance;hitChance=function(ar,def,al,dl){if(ST&&ar===ST.ar&&ST.M&&ST.M.ignoredef)def=0;return _i2_hc(ar,def,al,dl)};
const _i2_step=step;step=function(dt){const hp0=H.life;_i2_step(dt);if(!ST)return;
 for(const m of MON){if(m.hp>0&&m.ow&&m.ow.left>0){const t=Math.min(dt,m.ow.left);m.hp-=m.ow.dps*t;m.ow.left-=t;if(m.hp<=0)killMon(m)}}
 const drp=Math.min(50,(ST.M&&ST.M.drp)||0);if(drp&&H.life<hp0&&H.life>0)H.life+=(hp0-H.life)*drp/100}; // 物理伤害减免%（近似：按本帧受到的伤害返还）
if(typeof monsTick==='function'){const _i2_mt=monsTick;monsTick=function(dt){const c=H.castT;_i2_mt(dt);if(ST&&ST.M&&ST.M.nofreeze&&H.castT>c)H.castT=c}}
// 战斗相关属性不再隐藏（详情中统一显示在【基础属性】）
for(const k of['ow','ds','cb','drp','ignoredef','kb','flee','blind','freeze','nofreeze','arp','demon','maxfres','maxcres','maxlres','maxpres'])HIDDEN_KEYS.delete(k);

// ---------- 物品详情：属性统一显示、双手、珠宝/护身符按钮 ----------
const _i2_show=showItem;showItem=function(uid){_i2_show(uid);if(typeof document==='undefined'||window.__NOUI)return;const f=findItem(uid);if(!f||f.it.k)return;const it=f.it,b=BASEM[it.b];
 const P=document.querySelector('#modal .ipanel');if(!P)return;
 const hid=P.querySelector('.sec.hid'),base=P.querySelector('.sec');
 if(hid&&base){const req=[...base.children].find(e=>/^需求等级/.test(e.textContent));for(const e of [...hid.children]){if(e.tagName==='H4')continue;e.className='g';base.insertBefore(e,req||null)}hid.remove()}
 if(b.th)P.innerHTML=P.innerHTML.replace('单手伤害','双手伤害');
};
modsTxt=function(m){return Object.entries(m).map(([k,v])=>(MODT[k]||k+' {v}').replace('{v}',Array.isArray(v)?v[0]+'-'+v[1]:v).replace('+-','-')).join('，')};

if(typeof mercPanel==='function'){const _i2_mp=mercPanel;mercPanel=function(){let h=_i2_mp();if(S.merc&&MERCS[S.merc.t].wcats){const T=MERCS[S.merc.t];const bad=T.wcats.map(c=>({wand:'魔杖',dagger:'匕首',sword:'剑'})[c]).join('/');h=h.replace(bad,T.wcats.map(c=>CATN[c]||c).join('/'))}return h}}
