'use strict';
// ===================================================================================
// classes.js — 老羊传奇职业技能引擎（数据驱动）：战士(zs) / 法师(fs) / 道士(ds)。
// 技能定义在 cls_zs.js / cls_fs.js / cls_ds.js（只用热血传奇 1.76 技能），本文件只提供通用引擎：注册、数值、施放、自动施法、被动/增益、自动加点。
// 存档：S.cls ∈ zs/fs/ds（未知职业按战士处理）；S.ci=1 表示已按职业初始化（新建/重置角色时一次性写入属性、技能、初始装备）。
// 技能放入全局 SKILLS/SKM（带 cls 字段），技能页/加点/自动施法只认本职业技能（无 cls 字段的旧技能不属于任何职业）。
// 必须在 skills.js 之后加载（包装其自动施法函数）。
// ===================================================================================
// 平衡系数表（按角色等级线性插值）：dk=技能伤害系数、mk=近战伤害系数、ek=对首领/精英额外系数；各职业文件填写 CLS_BAL[cls]={dk,mk,ek}
const CLS_BAL={};
function clsEK(m){const t=(CLS_BAL[curCls()]||{}).ek;return(t&&m&&(m.boss||m.fl==='uniq'||m.fl==='champ'))?clsBalK(t):1}
function clsBalK(t){const l=(typeof S!=='undefined'&&S&&S.lvl)||1;if(l<=t[0][0])return t[0][1];for(let i=1;i<t.length;i++)if(l<=t[i][0]){const[a,x]=t[i-1],[b,y]=t[i];return x+(y-x)*(l-a)/(b-a)}return t[t.length-1][1]}
const CLS_DEF={
 zs:{n:'战士',ic:'⚔',glyph:'⚔',at:{str:30,dex:20,vit:25,ene:10},life0:55,lpl:2,lpv:4,mana0:10,mpl:1,mpe:1,trees:['剑术','战技','体魄'],
  sk:{},eq:['swd1','shd1'],ww:1,main:['str',5],autoEne:()=>false},
 fs:{n:'法师',ic:'✦',glyph:'✦',at:{str:10,dex:25,vit:10,ene:35},life0:40,lpl:1.5,lpv:2,mana0:35,mpl:2,mpe:2,trees:['火系','冰系','雷系'],
  sk:{},eq:['wand1'],main:['ene',4],autoEne:()=>S.at.ene<S.lvl+35},
 ds:{n:'道士',ic:'☯',glyph:'☯',at:{str:15,dex:25,vit:20,ene:25},life0:45,lpl:1.5,lpv:2.5,mana0:25,mpl:2,mpe:2,trees:['召唤','符毒','辅助'],
  sk:{},eq:['wand2'],main:['ene',4],autoEne:()=>false},
};
// 职业主属性（main，供 late.js 自动加点 LATE_MAIN 用）：战士力量、法师/道士精神（魔法/道术）。late.js 在本文件之后加载，首次 calc 时补登记
function clsLateFix(){try{if(typeof LATE_MAIN!=='undefined'){for(const c of['zs','fs','ds'])if(!LATE_MAIN[c])LATE_MAIN[c]=CLS_DEF[c].main;if(typeof LATE_SHARE!=='undefined')for(const c of['zs','fs','ds'])if(!LATE_SHARE[c])LATE_SHARE[c]=[[1,0.5],[30,0.5],[60,0.6]]}}catch(e){}}
const curCls=()=>(S&&CLS_DEF[S.cls])?S.cls:'zs';
function clsBase(){return CLS_DEF[curCls()]}
function clsName(){return clsBase().n}
function heroArt(cls){const c=curCls();return c==='zs'?art('hero','🧙‍♂️',cls):`<img class="art ${cls||''}" src="assets/char/${c}_portrait.webp" alt="${clsBase().n}" onerror="this.outerHTML='<span class=&quot;glyph&quot;>${clsBase().glyph}</span>'">`}// 法师/道士：美术立绘 assets/char/{id}_portrait.webp
function trees(){return clsBase().trees}
function skOfCls(s){return!!s&&s.cls===curCls()}// 只认本职业技能：无 cls 的旧技能不再默认算战士（修：战士自动学到旧召唤技能）
// 新角色/重置角色：按职业写入初始属性/技能/装备（只执行一次）
function clsInit(){const c=curCls();if(S.ci)return;const D=CLS_DEF[c];S.ci=1;S.cqsk=1;S.at=Object.assign({},D.at);S.sk=Object.assign({},D.sk);S.main=null;S.curse=null;S.autoCast=null;
 S.eq={};for(const b of D.eq.concat(['arm1'])){const B=BASEM[b];if(B)S.eq[B.s]=makeBase(B,1)}calc();H.life=ST.life;H.mana=ST.mana}
// ===================================================================================
// 职业技能引擎（数据驱动）：每个技能 = 定义 {id,cls,t 系,n,r 需求等级,col,pre 前置,ty 类型,el 元素,ic,mana,sm 智能施放所需怪数,v(L,sy) 数值}
// ty：bolt 单体 / splash 溅射 / cone 前排 n 个 / multi n 发随机 / chain 弹跳 / aoe 全体 / burn 灼烧 / static 按当前生命比例 / turret 持续炮台
//     buff 自身增益(g 同组互斥) / passive 被动 / hit 近战单体 / mhit 近战多目标 / mall 近战全体 / throw 投掷 / debuff 减益 / wcry 范围震伤；cls_*.js 可追加新类型（CLS_TY/CLS_PRI）
// 音效：每个技能 sfx 字段 = 独立音效 id，接入 audio.js 的 AUDIO_SK.table（无配方时静默）
// 美术：assets/skills/manifest.json 列出已到位的 icons / fx（文件 assets/skills/<id>.webp、assets/skills/fx_<id>.webp），列入才加载，避免 404
// 省电：只做一次性特效，不加持续动画
// ===================================================================================
const CLS_SKILLS=[];const CLS_LEGACY=new Set();// 有专属音效配方的技能 id（audio.js）
const CLS_DR=(a,b,ga,gb,L,sy)=>[Math.round((a+ga*(L-1))*sy),Math.round((b+gb*(L-1))*sy)];
const CLS_TYK={bolt:'spell',splash:'spell',cone:'spell',multi:'spell',chain:'spell',aoe:'spell',burn:'spell',static:'spell',turret:'spell',
 buff:'cbuff',passive:'passive',hit:'melee',mhit:'melee',mall:'melee',throw:'melee',debuff:'warcry',wcry:'warcry'};
const CLS_PRI={buff:0,debuff:1,wcry:2,turret:3,burn:4,static:4,aoe:5,mall:5,chain:6,splash:6,cone:7,multi:7,mhit:7,throw:7,bolt:8,hit:8,passive:9};
const CLS_SINGLE=new Set(['bolt','cone','multi','hit','mhit','throw']),CLS_AOE=new Set(['aoe','splash','chain','mall','burn']),CLS_MELEE=new Set(['hit','mhit','mall','throw']);// CLS_MELEE：按武器伤害估算的近战类型（druid.js 追加）
function clsDef(cls,list){for(const o of list){const s=Object.assign({cls,pre:[],sm:1,sfx:CLS_LEGACY.has(o.id)?o.id:'sfx_'+o.id,mana:()=>0},o);s.kind=CLS_TYK[s.ty]||'spell';s.pri=CLS_PRI[s.ty]??8;CLS_SKILLS.push(s)}}
function clsRegister(){CLS_SKILLS.sort((a,b)=>a.pri-b.pri);for(const s of CLS_SKILLS){if(SKM[s.id])continue;SKILLS.push(s);SKM[s.id]=s;MODT['sk_'+s.id]='+{v} '+s.n+(CLS_DEF[s.cls]?'（'+CLS_DEF[s.cls].n+'专属）':'');HIDDEN_KEYS.add('sk_'+s.id);if(s.syn)SYN[s.id]=s.syn}}
// ---------- 美术清单 ----------
const CLS_ART={icons:new Set(),fx:new Set()};
function clsArtLoad(){if(typeof fetch!=='function'||typeof document==='undefined')return;try{const st=document.createElement('style');st.textContent='.ski.img{background:center/cover no-repeat;color:transparent}';document.head.appendChild(st);fetch('assets/skills/manifest.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;for(const k of['icons','fx'])for(const id of j[k]||[])CLS_ART[k].add(id);if(typeof ACX!=='undefined')ACX.skSig=''}).catch(()=>{})}catch(e){}}
const clsIconUrl=id=>CLS_ART.icons.has(id)?`assets/skills/${id}.webp`:null,clsFxUrl=id=>CLS_ART.fx.has(id)?`assets/skills/fx_${id}.webp`:null;
{const f=skIcon;skIcon=function(s){if(s&&s.cls){const u=clsIconUrl(s.id);return u?`<i class="ski img" style="background-image:url(${u})"></i>`:`<i class="ski t${s.t}">${s.ic}</i>`}return f(s)}}
// ---------- 数值 ----------
function clsMk(){const t=(CLS_BAL[curCls()]||{}).mk;return t?clsBalK(t):1}// mk：职业近战伤害总系数（平衡用）
function clsDk(c){const t=(CLS_BAL[c]||{}).dk;return t?clsBalK(t):1}
function clsSV(id,L){const s=SKM[id];if(!s||!s.v)return{txt:''};return s.v(Math.max(1,L),syn(id)*clsDk(s.cls))}// dk：职业技能伤害总系数（平衡用，已计入显示数值）
const CLS_ELC={fire:'#f84',cold:'#8cf',light:'#ff6',magic:'#e0c0ff',phys:'#fff'};
const clsAvgD=d=>d?(d[0]+d[1])/2:0,clsRR=d=>R(Math.round(d[0]),Math.round(d[1]));
const buffOn=id=>{const b=H.cbs&&H.cbs[id];return b&&b.until>GT?b:null};
function pasV(id){return bl(id)?clsSV(id,slvl(id)):null}
function elMul(el){let p=ST.sdmg||0;const f=CLS_DEF[curCls()].elMul;if(f)p+=f(el)||0;return 1+p/100}// 职业元素加成钩子 CLS_DEF[c].elMul(el)→百分比
function clsHit(m,el,dmg,col){if(!m||m.hp<=0||!(dmg>0))return 0;dmg*=clsEK(m);
 return hitMon(m,{[el]:dmg*elMul(el)},'hero',col||CLS_ELC[el])}
function clsOthers(ms,tg){return[tg,...ms.filter(m=>m!==tg)]}
function clsCC(m,v){if(!m||m.hp<=0)return;if(v.slow)m.slow=Math.max(m.slow||0,GT+v.slow);if(v.stun&&!m.boss)m.stun=Math.max(m.stun||0,v.stun)}
// 近战：武器伤害 × (1+pct%) + flat；o.el 转换元素(如狂暴→魔法)
function clsMelee(m,pct,flat,o){o=o||{};if(!m||m.hp<=0)return 0;const db=m.dbf&&m.dbf.until>GT?m.dbf:null;const df=m.def*(1-ST.tdef/100)*(1-((db&&db.def)||0)/100);
 if(!o.sure&&!hitChance(ST.ar*(1+(o.ar||0)/100),df,S.lvl,m.lv))return 0;let k=1+(pct||0)/100;if(ST.bcrit&&rnd()*100<ST.bcrit)k*=2;
 const base=Math.max(1,(clsWRoll()*k+(flat||0))*clsMk()*clsEK(m));const d=o.el?hitMon(m,{[o.el]:base},'hero',CLS_ELC[o.el]):hitMon(m,{phys:base,fire:ST.fire,cold:ST.cold,light:ST.light?R(1,ST.light):0,pois:ST.pois},'hero','#fff');
 if(d){H.life=Math.min(ST.life,H.life+d*(ST.ll+(ST.bll||0))/100);H.mana=Math.min(ST.mana,H.mana+d*ST.ml/100+(CLS_DEF[curCls()].hitMana||0));clsCC(m,o)}return d}// hitMana：职业每次近战命中回蓝
// 近战职业武器权重（ww:1，战士）：伤害 = 20% 实际武器 + 80% 等级基准武器(2+0.9×等级)，基准同样吃力量/精通/增益倍率
const CLS_WW=0.2;const clsWW=()=>!!CLS_DEF[curCls()].ww;function clsWRef(){return(2+0.9*S.lvl)*(ST.wmul||1)}
function clsWRoll(){const w=R(ST.wmin,ST.wmax);return clsWW()?CLS_WW*w+(1-CLS_WW)*clsWRef():w}
function clsWAvg(){const w=(ST.wmin+ST.wmax)/2;return clsWW()?CLS_WW*w+(1-CLS_WW)*clsWRef():w}
function setBuff(id,v,g){H.cbs=H.cbs||{};if(g)for(const k in H.cbs)if(k!==id&&H.cbs[k].g===g)delete H.cbs[k];H.cbs[id]=Object.assign({},v,{g,until:GT+(v.dur||30)});calc()}
const CLS_TY={
 bolt(s,v,ms,tg){clsHit(tg,s.el,clsRR(v.dmg));clsCC(tg,v);return[tg]},
 splash(s,v,ms,tg){clsHit(tg,s.el,clsRR(v.dmg));clsCC(tg,v);const o=ms.filter(m=>m!==tg).slice(0,v.n||8);for(const m of o){clsHit(m,s.el,clsRR(v.dmg)*(v.sp||50)/100);clsCC(m,v)}return[tg,...o]},
 cone(s,v,ms,tg){const L=clsOthers(ms,tg).slice(0,v.n||3);for(const m of L){clsHit(m,s.el,clsRR(v.dmg));clsCC(m,v)}return L},
 chain(s,v,ms,tg){return CLS_TY.cone(s,v,ms,tg)},
 multi(s,v,ms,tg){const L=[];for(let i=0;i<(v.n||3);i++){const l=liveMon();if(!l.length)break;const m=pick(l);if(rnd()<(v.acc||0.7)){clsHit(m,s.el,clsRR(v.dmg));L.push(m)}}return L},
 aoe(s,v,ms,tg){const L=ms.slice(0,v.n||8);for(const m of L){clsHit(m,s.el,clsRR(v.dmg));clsCC(m,v);if(v.dps)m.burn={dps:v.dps*elMul('fire'),left:v.bdur||3}}return L},
 burn(s,v,ms,tg){const L=ms.slice(0,v.n||8);for(const m of L)m.burn={dps:v.dps*elMul('fire'),left:v.bdur||4};return L},
 static(s,v,ms,tg){for(const m of ms){if(m.hp<=m.max*0.05)continue;const b=(m.boss||m.fl==='uniq')?0.5:1;hitMon(m,{light:Math.max(1,Math.min(m.hp*v.pct/100,v.cap||Infinity)*b)},'hero','#ff6')}return ms},// 每只怪伤害 ≤ 技能等级上限 cap；首领/精英头目减半
 turret(s,v,ms,tg){H.tur=H.tur||{};H.tur[s.id]={until:GT+v.dur,next:GT,iv:v.iv,dmg:v.dmg,el:s.el,n:v.n||1,id:s.id};floatHero(s.n,CLS_ELC[s.el]);return[]},
 buff(s,v){setBuff(s.id,v,s.g);floatHero(s.n,'#ffd76a');return[]},
 hit(s,v,ms,tg){for(let i=0;i<(v.hits||1);i++)clsMelee(tg,v.pct,v.flat,v);return[tg]},
 mhit(s,v,ms,tg){const L=clsOthers(ms,tg).slice(0,v.n||2);for(const m of L)clsMelee(m,v.pct,v.flat,v);if(v.fz)setBuff('bfrz_st',{ias:v.fz,dur:4},null);return L},
 mall(s,v,ms,tg){const L=ms.slice(0,v.n||8);for(const m of L)v.pct==null?clsCC(m,v):clsMelee(m,v.pct,v.flat,v);if(v.dmg)for(const m of L)hitMon(m,{phys:clsRR(v.dmg)},'hero','#fff');return L},
 throw(s,v,ms,tg){const L=clsOthers(ms,tg).slice(0,v.n||2);for(const m of L)clsMelee(m,v.pct,v.flat,v);return L},
 debuff(s,v,ms){for(const m of ms){m.dbf={id:s.id,until:GT+v.dur,dmg:v.wk||0,def:v.dd||0};clsCC(m,v)}floatHero(s.n,'#ffb050');return ms},
 wcry(s,v,ms){for(const m of ms){hitMon(m,{phys:clsRR(v.dmg)},'hero','#ffb050');clsCC(m,v)}floatHero(s.n,'#ffb050');return ms},
};
const CLS_TYR={hit:2,mhit:2,throw:2};// 单体近战按攻速；其余按施法速度
function clsFxRing(c){if(TAB!=='fight')return;FX.push({k:'nova',pts:[],h:heroPos(),c,t:0,life:.7})}
function clsFx(s,L){if(typeof TAB==='undefined'||TAB!=='fight'||clsCqOn())return;const u=clsFxUrl(s.id);// 传奇战场在场时只走 cq/ 事件（spend→CQ.Scene.onSkill），旧特效不叠播
 if(u&&typeof sprite==='function'&&typeof fxOk==='function'&&fxOk('c_'+s.id)){const pts=L.map(m=>rectOf('c'+m.uid)).filter(Boolean);const h=heroPos();for(const p of(pts.length?pts.slice(0,3):[h]))sprite('pop',u,p.x,p.y,84,'animation-duration:500ms',500);return}
 const k=s.fx||({fire:'boom',cold:'ring',light:'bolt',magic:'spirit'}[s.el])||'slash';
 if(k==='ring')clsFxRing(CLS_ELC[s.el]||'#e8d0a0');else if(k==='shield')fx('shield');else fx(k,L.length?L:[])}
// ---------- 传奇战场（cq/）事件接口 ----------
// 施放 → spend(id)（cq_bridge.js 包装）→ CQ.Scene.onSkill(id) → CQ.Host.skillFx(id) 按技能名查 CQ.SKILL_FX → CQ.FX.playSkill（序列帧只播一次、有节流）。
// 技能定义 cqfx = 序列帧目录：首次施放前把「^技能名$ → cqfx」插到 CQ.SKILL_FX 最前（精确匹配，不影响其他技能）。
function clsCqOn(){try{return!!(typeof window!=='undefined'&&window.CQBattle&&CQBattle.isActive&&CQBattle.isActive())}catch(e){return false}}
let CLS_CQFX=0;function clsCqFx(){if(CLS_CQFX||typeof window==='undefined'||!window.CQ||!Array.isArray(CQ.SKILL_FX))return;CLS_CQFX=1;
 for(const s of CLS_SKILLS)if(s.cqfx)CQ.SKILL_FX.unshift([new RegExp('^'+s.n+'$'),s.cqfx])}
// 冷却：技能定义 cd（秒，游戏时间 GT）；登记到 CQ_SKCD 供战场冷却圈（cq/sysapi_cq.js）
if(typeof window!=='undefined')window.CQ_SKCD=window.CQ_SKCD||{};
function clsCdLeft(id){const s=SKM[id];if(!s||!s.cd||ACT[id]==null)return 0;return Math.max(0,ACT[id]+s.cd-GT)}
function clsCast(id,ms){const s=SKM[id],v=SV(id,slvl(id));clsCqFx();spend(id);ACT[id]=GT;try{if(s.cd&&window.CQSys&&CQSys.skillCast)CQSys.skillCast(id)}catch(e){}
 const tg=target(ms);const L=CLS_TY[s.ty](s,v,ms,tg)||[];if(typeof clsAfterCast==='function')clsAfterCast(s,v,ms,L);clsFx(s,L);return CLS_TYR[s.ty]||1}
// ---------- 通用新类型：治愈 heal / 召唤 pet / 施毒 pois ----------
Object.assign(CLS_TY,{
 heal(s,v){const h=v.heal*(1+(ST.sdmg||0)/200);H.life=Math.min(ST.life,H.life+h);for(const a of ALLY)if(a.hp>0&&a.kind==='cqpet')a.hp=Math.min(a.max,a.hp+h*1.5);floatHero('+'+Math.round(h),'#6f6');return[]},
 pet(s,v){for(const a of ALLY)if(a.kind==='cqpet'&&(a.sub===s.id||(s.g&&SKM[a.sub]&&SKM[a.sub].g===s.g)))a.hp=0;ALLY=ALLY.filter(a=>a.hp>0);if(typeof clsPetSweep==='function')clsPetSweep();
  for(let i=0;i<(v.max||1);i++)addAlly('cqpet',{sub:s.id,n:v.pn||s.n,ic:s.ic,hp:v.hp,dmg:v.pd,el:v.el||'phys',th:v.th||0});floatHero(s.n,'#ffd76a');return[]},
 pois(s,v,ms,tg){const L=clsOthers(ms,tg).filter(m=>!(m.pois&&m.pois.left>1)).slice(0,v.n||1);for(const m of L){m.pois={dps:v.dps*elMul('pois')*clsEK(m)*(typeof lateMul==='function'?lateMul():1),left:v.dur};
  if(v.dd)m.dbf={id:s.id,until:GT+v.dur,dmg:0,def:v.dd}}return L},
});
Object.assign(CLS_PRI,{heal:0,pet:1,pois:2});
function clsPetPick(g){let b=null,r=-1;for(const s of CLS_SKILLS)if(s.g===g&&skOfCls(s)&&bl(s.id)&&acCfg(s.id).on&&s.r>r){r=s.r;b=s.id}return b}// 召唤同组：已学高阶优先（神兽 > 骷髅）
const clsPetN=id=>ALLY.filter(a=>a.kind==='cqpet'&&a.sub===id&&a.hp>0).length;
// ---------- 自动施法 ----------
for(const k of['melee','spell','cbuff','warcry'])if(!AC_KINDS.includes(k))AC_KINDS.push(k);
function clsEst(s,ms){const v=SV(s.id,slvl(s.id)),n=ms.length;const tn=CLS_SINGLE.has(s.ty)?Math.min(n,s.ty==='hit'?1:(v.n||1)):Math.min(n,v.n||8);
 if(CLS_MELEE.has(s.ty))return(clsWAvg()*(1+(v.pct||0)/100)+(v.flat||0)+clsAvgD(v.dmg))*(v.hits||1)*tn;
 if(s.ty==='burn')return v.dps*(v.bdur||4)*elMul('fire')*tn;if(s.ty==='multi')return clsAvgD(v.dmg)*elMul(s.el)*(v.n||3)*(v.acc||0.7);
 return(clsAvgD(v.dmg)*(s.ty==='splash'?1+(tn-1)*(v.sp||50)/100:tn)+(v.dps?v.dps*(v.bdur||3)*tn:0))*elMul(s.el)}
function clsResK(s,ms){const el=s.el||(CLS_MELEE.has(s.ty)?(SV(s.id,slvl(s.id)).el||'phys'):null);if(!el||!ms.length)return 1;let a=0;for(const m of ms)a+=Math.max(0,1-resOf(m,el)/100);return a/ms.length}// 估值计入目标抗性：免疫时改用其他元素/魔法技能
{const f=clsEst;clsEst=function(s,ms){return f(s,ms)*clsResK(s,ms)}}
function clsBest(set,ms){let b=null,bv=-1;for(const s of SKILLS){if(!s.cls||!skOfCls(s)||!set.has(s.ty)||!bl(s.id)||!castable(s.id)||!acCfg(s.id).on)continue;if(CLS_AOE.has(s.ty)&&ms.length<s.sm&&!ms.some(m=>m.boss||m.fl==='uniq'))continue;const e=clsEst(s,ms);if(e>bv){bv=e;b=s.id}}return b}
// 同组互斥技能（护甲/变身/藤蔓/灵体）：只自动施放已学且开启自动施法、等级最高的一个，避免互相顶掉来回切换
function clsGroupPick(g){let b=null,bv=-1;for(const s of CLS_SKILLS){if(s.g!==g||!skOfCls(s)||!bl(s.id)||!acCfg(s.id).on)continue;const L=slvl(s.id)+s.r/100;if(L>bv){bv=L;b=s.id}}return b}
{const f=acFeasible;acFeasible=function(id,ms){const s=SKM[id];if(!s||!s.cls)return f(id,ms);if(!castable(id))return 0;
 switch(s.ty){case'buff':{if(s.g&&clsGroupPick(s.g)!==id)return 0;const b=buffOn(id);return!(b&&b.until>GT+2)}case'passive':return 0;
  case'turret':return ms.length>0&&!(H.tur&&H.tur[id]&&H.tur[id].until>GT+1);case'debuff':return ms.some(m=>!(m.dbf&&m.dbf.id===id&&m.dbf.until>GT)&&!(m.stun>0));
  case'static':return ms.some(m=>m.hp>m.max*0.4);case'burn':return ms.some(m=>!(m.burn&&m.burn.left>1))}
 return ms.length>0}}
// 冷却中不施放；新类型可行性
{const f=acFeasible;acFeasible=function(id,ms){const s=SKM[id];if(!s||!s.cls)return f(id,ms);if(clsCdLeft(id)>0||!castable(id))return 0;
 if(s.ty==='heal')return H.life<ST.life*0.75||ALLY.some(a=>a.kind==='cqpet'&&a.hp>0&&a.hp<a.max*0.6);
 if(s.ty==='pet'){if(s.g){const b=clsPetPick(s.g);if(b&&b!==id)return 0}return clsPetN(id)<(SV(id,slvl(id)).max||1)}
 if(s.ty==='pois')return ms.some(m=>!(m.pois&&m.pois.left>1));
 if(s.ty==='charm')return CLS_TY.charm&&CLS_TY.charm.ok?CLS_TY.charm.ok(s,ms):0;
 return f(id,ms)}}
{const f=acSmart;acSmart=function(id,ms){const s=SKM[id];if(!s||!s.cls)return f(id,ms);const big=ms.some(m=>m.boss||m.fl==='uniq'||m.fl==='champ');
 if(['buff','turret'].includes(s.ty))return 1;if(['debuff','wcry','static'].includes(s.ty))return ms.length>=s.sm||big;
 if(CLS_AOE.has(s.ty)){if(ms.length<s.sm&&!big)return 0;const b=clsBest(CLS_AOE,ms);const bs=clsBest(CLS_SINGLE,ms);return b===id&&(!bs||clsEst(s,ms)>=clsEst(SKM[bs],ms)*0.9)}
 if(CLS_SINGLE.has(s.ty)){const b=clsBest(new Set([...CLS_SINGLE,...CLS_AOE]),ms);return b===id}return 1}}
{const f=acCast;acCast=function(id,ms){const s=SKM[id];if(!s||!s.cls)return f(id,ms);return clsCast(id,ms)}}
{const f=acSmartTxt;acSmartTxt=function(id){const s=SKM[id];if(!s||!s.cls)return f(id);
 if(s.ty==='buff')return'增益未生效时施放';if(s.ty==='turret')return'未在场时召出';if(s.ty==='debuff'||s.ty==='wcry')return`怪物≥${s.sm}或有精英/首领，且未受此效果`;if(s.ty==='static')return'有敌人生命高于40%';
 return CLS_AOE.has(s.ty)?`怪物≥${s.sm}或有精英/首领，且为当前伤害最高的技能`:'当前伤害最高的单体技能'}}
// ---------- 属性：被动/增益（game.js calc 末尾调用） ----------
// 旧存档清理（一次）：不属于本职业的已学技能（例如旧版战士自动学到的召唤/骨系技能）退还技能点；空技能的角色补本职业初始技能
function clsMigrate(){clsLateFix();if(typeof S==='undefined'||!S||!S.sk||S.cqsk===1||!CLS_SKILLS.length)return;S.cqsk=1;const c=curCls();let back=0;const gone=[];
 for(const k of Object.keys(S.sk)){const s=SKM[k];if(s&&s.cls===c)continue;back+=S.sk[k]||0;if(s)gone.push(s.n);delete S.sk[k]}
 for(const k in CLS_DEF[c].sk||{})if(!S.sk[k])S.sk[k]=CLS_DEF[c].sk[k]
 S.kp=(S.kp||0)+back;S.main=null;S.curse=null;if(gone.length&&typeof log==='function')try{log(`<b style="color:#ffd76a">职业技能整理：移除非本职业技能 ${gone.join('、')}，退还技能点 ${back}</b>`)}catch(e){}}
const clsWCat=()=>{const w=S.eq&&S.eq.weapon;return w&&BASEM[w.b]?BASEM[w.b].cat:null};
function clsCalc(o){const c=curCls();clsMigrate();const M=o.M||{};const lv=id=>{const b=bl(id);return b?b+o.allsk+(M['tc_'+SKM[id].cls+SKM[id].t]||0)+(o['sk_'+id]||0):0};const pv=id=>{const L=lv(id);return L?clsSV(id,L):null};
 let wd=0,ar=0,ias=0,crit=0,lifeP=0,manaP=0,defP=0;
 for(const s of CLS_SKILLS)if(s.cls===c&&s.ty==='passive'&&s.cat!=null){const v=pv(s.id);if(!v)continue;if(s.cat==='*'||s.cat.split(',').includes(clsWCat()||'none')){wd+=v.dmg||0;ar+=v.ar||0;crit+=v.crit||0;ias+=v.ias||0}}
 for(const s of CLS_SKILLS)if(s.cls===c&&s.ty==='passive'&&s.cat==null){const v=pv(s.id);if(!v)continue;lifeP+=v.life||0;defP+=v.def||0;ias+=v.ias||0;crit+=v.crit||0;
  if(v.res)for(const k in o.res)o.res[k]=Math.min(75,o.res[k]+v.res);if(v.mregen)o.mregen+=v.mregen;if(v.mf)o.mf+=v.mf;if(v.gf)o.gf+=v.gf;if(v.ll)o.bll=(o.bll||0)+v.ll}
 if(CLS_DEF[c].block&&BASEM[S.eq.shield?.b]?.block)o.block=Math.min(75,o.block+CLS_DEF[c].block);// 职业额外格挡
 for(const id in H.cbs||{}){const b=buffOn(id);if(!b)continue;wd+=b.wdmg||0;ar+=b.ar||0;ias+=b.ias||0;defP+=b.def||0;lifeP+=b.life||0;manaP+=b.mana||0;o.allsk+=b.allsk||0;o.sdmg=(o.sdmg||0)+(b.sdmg||0);
  if(b.cres)o.res.cold=Math.min(75,o.res.cold+b.cres);if(b.res)for(const k in o.res)o.res[k]=Math.min(75,o.res[k]+b.res);if(b.dodge)o.cdodge=Math.max(o.cdodge||0,b.dodge);if(b.es)o.ces=Math.max(o.ces||0,b.es);if(b.dr)o.cdr=Math.max(o.cdr||0,b.dr);if(b.ret)o.cret=b}
 o.wmin=Math.floor(o.wmin*(1+wd/100));o.wmax=Math.floor(o.wmax*(1+wd/100));o.wmul=(1+o.attr.str/100)*(1+wd/100);o.ar=Math.round(o.ar*(1+ar/100));o.bcrit=Math.min(60,crit);o.atkT=1.5/(1+(o.ias+ias)/100);
 o.def=Math.round(o.def*(1+defP/100));o.life=Math.round(o.life*(1+lifeP/100));o.mana=Math.round(o.mana*(1+manaP/100))}
// ---------- 每帧：增益到期、减益减伤、灼烧、炮台、闪避/能量护盾/反击 ----------
{const f=step;step=function(dt){if(!ST)return f(dt);
 let ch=0;for(const k in H.cbs||{})if(H.cbs[k].until<=GT){delete H.cbs[k];ch=1}if(ch)calc();
 const sv=[];for(const m of MON)if(m.dbf&&m.dbf.until>GT&&m.dbf.dmg&&m.hp>0){sv.push([m,m.dmg]);m.dmg=m.dmg.map(x=>x*(1-m.dbf.dmg/100))}
 const h0=H.life,mp0=H.mana;let r;try{r=f(dt)}finally{for(const[m,d]of sv)m.dmg=d}
 for(const m of MON){const b=m.burn;if(!b||m.hp<=0||b.left<=0)continue;b.acc=(b.acc||0)+dt;b.left-=dt;if(b.acc>=0.5||b.left<=0){const d=b.dps*b.acc;b.acc=0;hitMon(m,{fire:d},'hero','#f60')}}
 for(const k in H.tur||{}){const t=H.tur[k];if(t.until<=GT){delete H.tur[k];continue}if(GT<t.next)continue;t.next=GT+t.iv;const l=liveMon();if(!l.length)continue;const L=[];for(let i=0;i<t.n;i++){const m=pick(l);clsHit(m,t.el,clsRR(t.dmg));L.push(m)}clsFx(SKM[t.id],L)}
 const loss=h0-H.life;if(loss>0&&H.life>0){let back=0;if(ST.cdodge&&rnd()*100<ST.cdodge){back=loss;floatHero('闪避','#aaf')}
  else{if(ST.cdr)back=loss*ST.cdr/100;if(ST.ces){const ab=Math.max(0,Math.min((loss-back)*ST.ces/100,(H.mana-ST.mana*0.4)/1.5));back+=ab;H.mana-=ab*1.5}}// 护甲减伤；能量护盾在法力低于 40% 时不再吸收，保证仍能施法
  H.life=Math.min(ST.life,H.life+back);
  if(ST.cret&&GT>(H.retT||0)){H.retT=GT+1;const ml=liveMon().filter(m=>!m.ranged);if(ml.length){const m=pick(ml);clsHit(m,'cold',clsRR(ST.cret.ret));m.slow=GT+2}}}
 return r}}
{const f=resetRuntime;resetRuntime=function(){f();H.cbs={};H.tur={}}}
const CLS_SKPLAN={};// 各职业自动加点计划：cls_*.js 填 CLS_SKPLAN[cls]={order:[...],fill:()=>[...]}
// 加点前置校验：计划里某技能的前置没点过时，先点前置（递归）；对所有职业的 CLS_SKPLAN 生效
function clsPlanFix(order){const out=[],cnt={};const add=(id,d)=>{const s=SKM[id];if(!s||d>8)return;for(const p of s.pre||[])if(!cnt[p]&&!bl(p))add(p,d+1);out.push(id);cnt[id]=(cnt[id]||0)+1};for(const id of order)add(id,0);return out}
function clsFirstNeed(id,d){const s=SKM[id];if(!s||(d||0)>8)return id;for(const p of s.pre||[])if(!bl(p))return clsFirstNeed(p,(d||0)+1);return id}
const CLS_PLANC={};
function clsSkPlan(){const c=curCls(),P=CLS_SKPLAN[c];if(!P)return null;const sig=c+JSON.stringify(S.sk||{});if(CLS_PLANC.sig!==sig){CLS_PLANC.sig=sig;CLS_PLANC.p={order:clsPlanFix(P.order),fill:()=>[...new Set((P.fill()||[]).map(x=>clsFirstNeed(x)))]}}return CLS_PLANC.p}

// clsRegister() 由 cls_zs/fs/ds.js 定义完技能后调用（可重复调用，已注册的跳过）；clsArtLoad 只加载一次
clsArtLoad();
// ===================================================================================
// 职业专属底材 / 技能等级加成（b.ccls = 职业 id）
// ===================================================================================
TCAP.orb=[2,3,3];TCAP.bhelm=[2,3,3];ITYPES.orb=['armo','shld','orb'];ITYPES.bhelm=['armo','helm','phlm'];
const baseCls=b=>b&&b.ccls||null;
// 职业专属底材：其他职业不可装备
{const f=canEquip;canEquip=function(it){const b=it&&!it.k&&BASEM[it.b];if(b&&b.ccls&&b.ccls!==curCls())return false;return f(it)}}
// 技能等级：职业技能吃 +全部技能、本职业系别(tc_<cls><t>)、单技能 sk_<id>
{const f=slvl;slvl=function(id){const s=SKM[id];if(!s||!s.cls)return f(id);const b=bl(id);if(!b)return 0;const M=ST.M||{};return b+ST.allsk+(M['tc_'+s.cls+s.t]||0)+(ST['sk_'+id]||0)}}
// 法杖类技能词缀只出本职业技能（底材有 ccls 用其职业，否则用当前角色职业）
if(typeof staffMods==='function'){STAFFMOD_CATS.add('orb');STAFFMOD_CATS.add('bhelm');const f=staffMods;staffMods=function(it,b,ilvl){const c=(b&&b.ccls)||curCls();const all=SKILLS.slice();
 SKILLS.length=0;for(const s of all)if(s.cls===c)SKILLS.push(s);try{return f(it,b,ilvl)}finally{SKILLS.length=0;for(const s of all)SKILLS.push(s)}}}
// ===================================================================================
// 召唤物接口（战斗开发用）：ALLY 里 kind==='cqpet' 的召唤物带 art（骷髅 pet_kl / 神兽 pet_ss / 金色神兽 pet_ss_gold / 诱惑宝宝 = 原怪 key，查 CQSys.monArt(key)）
// 事件 CQSys.emit：pet:spawn {uid} / pet:hit {uid,dmg} / pet:atk {uid,dmg,tgt:怪物 uid} / pet:die {uid}（死亡、重召、换图清场都算，每只只发一次）
// 攻击/受伤结算仍在 game.js step()：攻击包装 hitMon（src 为召唤物），受伤按 step 前后生命对比，不改 game.js。
// ===================================================================================
const CLS_PETS=new Map();// uid → 召唤物（已发 spawn、未发 die）
function clsPetEmit(ev,d){try{if(typeof window!=='undefined'&&window.CQSys&&typeof CQSys.emit==='function')CQSys.emit(ev,d)}catch(e){}}
function clsPetSpawned(a){if(!a||CLS_PETS.has(a.uid))return;CLS_PETS.set(a.uid,a);clsPetEmit('pet:spawn',{uid:a.uid})}
function clsPetSweep(){if(!CLS_PETS.size)return;const live=new Set(ALLY.filter(a=>a.hp>0).map(a=>a.uid));for(const[u]of CLS_PETS)if(!live.has(u)){CLS_PETS.delete(u);clsPetEmit('pet:die',{uid:u})}}
{const f=addAlly;addAlly=function(kind,o){const a=f(kind,o);if(kind==='cqpet'){if(!a.art){a.art=a.sub==='zhss'?(/金色/.test(a.n)?'pet_ss_gold':'pet_ss'):a.sub==='zhkl'?'pet_kl':(o.mkey||null)}clsPetSpawned(a)}return a}}
{const f=hitMon;hitMon=function(m,d,src,c){const r=f.apply(this,arguments);if(src&&typeof src==='object'&&src.kind==='cqpet'&&r)clsPetEmit('pet:atk',{uid:src.uid,dmg:r,tgt:m&&m.uid});return r}}
{const f=step;step=function(dt){const h0=new Map();for(const a of ALLY)if(a.kind==='cqpet'&&a.hp>0)h0.set(a.uid,a.hp);const r=f(dt);
 for(const a of ALLY)if(a.kind==='cqpet'&&h0.has(a.uid)&&a.hp<h0.get(a.uid))clsPetEmit('pet:hit',{uid:a.uid,dmg:Math.round(h0.get(a.uid)-Math.max(0,a.hp))});
 clsPetSweep();return r}}
{const f=resetRuntime;resetRuntime=function(){const r=f.apply(this,arguments);clsPetSweep();return r}}
