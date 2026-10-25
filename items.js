'use strict';
// ===================================================================================
// items.js — 装备生成 / 掉落 TC / 镶嵌 / 炼金匣 / 储物箱（覆盖 game.js 中的同名函数）
// 依赖 data.js + data_items.js + game.js；必须在 game.js 之后、init 之前加载
// ===================================================================================

// ---------- 存档兼容 ----------
const _itm_load=load;
load=function(){_itm_load();if(!S.stash)S.stash=[];
 // 法力过紧修正：新角色的初始魔杖改为魔法品质（+10法力 / 法力回复+15%），仅作用于 1 级零经验的新档
 {const w=S.eq.weapon;if(!window.CQMir2Equip&&S.lvl===1&&!S.xp&&w&&w.q===1&&!w.af){w.q=3;w.m={mana:10,mregen:15};w.af=['冥想'];w.name='冥想之'+((BASEM[w.b]||{}).n||'魔杖')}}
for(const k of SLOTS)if(S.eq[k]&&!S.eq[k].name&&!S.eq[k].k)S.eq[k].name=(BASEM[S.eq[k].b]||{}).n;
 if(!window.CQ_DATA)for(const arr of[S.bag,S.stash])for(const it of arr)if(!it.k&&!BASEM[it.b])it.b=BASES.find(b=>b.s===(it.b||'').replace(/\d.*/,''))?.id||'wand1'};

// 原版式区间在说明中显示为 a-b
modsTxt=function(m){return Object.entries(m).map(([k,v])=>(MODT[k]||k+' {v}').replace('{v}',Array.isArray(v)?v[0]+'-'+v[1]:v).replace('+-','-')).join('，')};
// ---------- 基础工具 ----------
function baseTypes(b){return ITYPES[b.cat]||[]}
function affOk(a,b){const t=baseTypes(b);return a.it.some(x=>t.includes(x))&&!a.ex.some(x=>t.includes(x))}
// 传奇品质一次抽取；保留 qualityChance/qRoll 接口供旧调用兼容。
function qualityChance(k,ilvl,b,mf,fac){const rates={u:.02,s:.03,r:.20,m:.50,h:0,n:1};return rates[k]?Math.round(128/rates[k]):Number.MAX_SAFE_INTEGER}
qRoll=function(k,ilvl,b,mf,fac){return rnd()<128/qualityChance(k,ilvl,b,mf,fac)};
function rollQuality(){const r=rnd();return r<.02?5:r<.05?6:r<.25?4:r<.75?3:1}
maxSock=function(b,ilvl){const s=b.sock;if(!s)return 0;return ilvl<=25?s[0]:ilvl<=40?s[1]:s[2]};
alvlOf=function(ilvl,qlvl){if(qlvl>ilvl)ilvl=qlvl;let a=ilvl<99-Math.floor(qlvl/2)?ilvl-Math.floor(qlvl/2):2*ilvl-99;return clamp(a,1,99)};

// ---------- 词缀 ----------
rollAff=function(list,b,alvl,used){const c=list.filter(a=>a.lv<=alvl&&affOk(a,b)&&!used.has(a.g)&&!(a.m.sockp&&!maxSock(b,99)));if(!c.length)return null;const a=pick(c);used.add(a.g);return a};
applyAff=function(it,a,b,ilvl){for(const k in a.m){const[lo,hi]=a.m[k];const v=R(lo,hi);if(k==='sockp'){it.sock=Math.max(it.sock||0,Math.max(1,Math.min(v,maxSock(b,ilvl))));continue}it.m[k]=(it.m[k]||0)+v}
 it.req=Math.max(it.req||0,a.rq);(it.af=it.af||[]).push(a.n)};
function rollMods(m){const o={};for(const k in m){const v=m[k];o[k]=Array.isArray(v)?R(v[0],v[1]):v}return o}
function staffMods(it,b,ilvl){if(!STAFFMOD_CATS.has(b.cat)||rnd()<0.5)return;const pool=SKILLS.filter(s=>s.r<=Math.max(1,ilvl));const n=rnd()<0.7?1:2;
 for(let i=0;i<n&&pool.length;i++){const s=pool.splice(Math.floor(rnd()*pool.length),1)[0];const v=R(1,ilvl>=24?3:ilvl>=12?2:1);it.m['sk_'+s.id]=(it.m['sk_'+s.id]||0)+v;it.req=Math.max(it.req||0,s.r)}}

// ---------- 底材选择：weapX/armoX 以 3 级为一档，当前档权重最高，向下逐档递减 (近似原版 TC 递归) ----------
pickBase=function(ilvl,slot){const lv=Math.ceil(Math.max(1,ilvl)/3)*3;const c=BASES.filter(b=>!b.jew&&b.q<=lv&&(!slot||b.s===slot));if(!c.length)return BASEM.wand1;
 const isW=b=>b.s==='weapon';const pool=slot?c:(rnd()<0.5?c.filter(isW):c.filter(b=>!isW(b)));
 return wpick(pool.length?pool:c,b=>3*Math.pow(0.55,Math.floor((lv-b.q)/3)))};

// ---------- 物品生成 ----------
genItem=function(ilvl,opt={}){const b=opt.base||pickBase(ilvl,opt.slot);const it=makeBase(b,ilvl),mf=opt.mf||0,fac=opt.fac||(opt.bossMod?{u:opt.bossMod,s:opt.bossMod,r:opt.bossMod,m:1024}:null);
 it.name=b.n;let q=opt.q;if(q==null)q=rollQuality(ilvl,b,mf,fac);if(b.jew&&q<3)q=3;
 if(q===5){const u=UNIQUES.filter(x=>x.b===b.id&&x.lv<=ilvl&&!opt.noUnique);if(u.length){const U=pick(u);it.q=5;it.name=U.n;it.req=U.rq;it.m=rollMods(U.m);finishDefense(it,b);return it}
  q=4;it.dur3=1} // 原版：暗金失败 → 稀有（3 倍耐久）
 if(q===6){const u=SETITEMS.filter(x=>x.b===b.id&&x.lv<=ilvl);if(u.length){const U=pick(u);it.q=6;it.name=U.n;it.set=U.set;it.req=U.rq;it.m=rollMods(U.m);finishDefense(it,b);return it}
  q=3} // 原版：套装失败 → 魔法
 it.q=q;const used=new Set(),al=alvlOf(ilvl,b.q);
 if(q===0){it.name='破旧的'+b.n;if(it.def)it.def=Math.max(1,Math.floor(it.def*0.75));if(it.dmg)it.dmg=it.dmg.map(x=>Math.max(1,Math.floor(x*0.75)))}
 else if(q===1||q===2){it.name=(q===2?'精良的':'')+b.n;if(q===2){if(b.dmg)it.m.edmg=R(5,15);else if(b.def)it.m.edef=R(5,15)}
  if(maxSock(b,ilvl)&&rnd()<0.18)it.sock=R(1,maxSock(b,ilvl))}
 else if(q===3){let p=null,s=null;const r=rnd();if(r<0.75)p=rollAff(PREFIX,b,al,used);if(r>=0.25||!p)s=rollAff(SUFFIX,b,al,used);if(!p&&!s)p=rollAff(PREFIX,b,al,used);
  if(p)applyAff(it,p,b,ilvl);if(s)applyAff(it,s,b,ilvl);staffMods(it,b,ilvl);it.name=(s?(s.dn||s.n):'')+(p?p.n:'')+b.n}
 else if(q===4||q===7){const n=q===7?R(1,4):R(3,6);let np=0,ns=0;
  for(let i=0;i<n*4&&np+ns<n;i++){const wantP=np<3&&(ns>=3||rnd()<0.5);const a=rollAff(wantP?PREFIX:SUFFIX,b,al,used);if(!a)continue;applyAff(it,a,b,ilvl);wantP?np++:ns++}
  it.np=np;it.ns=ns;staffMods(it,b,ilvl);if(q===4)it.name=pick(RARE_A)+pick(RARE_A)+pick(RARE_B[slotOf(b)])}
 finishDefense(it,b);return it};
function finishDefense(it,b){/* 暗金/套装的 def 区间作为本地加成；防御基础值已在 makeBase 生成 */return it}

// ---------- 物品显示 / 需求 ----------
const _itm_itemName=itemName;itemName=function(it){if(it&&!it.k&&it.rw==null&&!it.name)return(BASEM[it.b]||{n:'?'}).n;const nm=_itm_itemName(it);return typeof sufDn==='function'&&it&&!it.k&&nm&&nm[0]==='之'?nm.replace(/^之.(·[小大巨])?/,x=>sufDn(x)):nm};
// socketMods：宝石/符文/符文之语已删除（legacy_prune 批次2），沿用 game.js 的空实现
itemReq=function(it){const b=BASEM[it.b];let l=it.req||0;
 const red=(socketMods(it).reqp||0)/100;const f=(it.q===0?0.8:1)*(1-red);return{lv:l,str:Math.floor((b.str||0)*f),dex:Math.floor((b.dex||0)*f)}};

// ---------- 掉落 ----------
function goodBand(off){return clamp((S.diff||0)*5+(S.act||0)+(off||0),0,14)}
// 掉落「好东西」：只出戒指/护符（符文/宝石已删除；cq/sys_cq.js 会再覆盖为首饰/黑铁矿）
function rollGood(m){return genItem(m.lv,{base:rnd()<8/12?BASEM.rin:BASEM.amu,mf:ST.mf,fac:m._fac})}
function tcOf(m){if(m.actboss)return TCS.actboss;if(m.key==='countess')return TCS.countess;if(m.boss)return TCS.boss;if(m.fl==='uniq')return TCS.uniq;if(m.fl==='champ')return TCS.champ;return TCS.normal}
function rollPicks(m,T,out){m._fac=T.f||null;const band=goodBand(T.gb||0);
 for(let i=0;i<T.pk;i++){const e=wpick([['nd',T.nd],['gold',T.gold],['junk',T.junk],['eq',T.eq],['good',T.good]],x=>x[1])[0];
  if(e==='gold'){const g=Math.round(R(m.lv,4*m.lv+8)*(T.gmul||1)*(1+ST.gf/100));S.gold+=g}
  else if(e==='junk'){const k=wpick([['hp',5],['mp',3],['rej',1],['tp',1]],x=>x[1])[0];S.pot[k]++}
  else if(e==='eq')out.push(genItem(m.lv,{mf:ST.mf,fac:T.f}));
  else if(e==='good')out.push(rollGood(m))}}
rollTC=function(m){const T=tcOf(m),out=[];rollPicks(m,T,out);
 if(T.extra)for(let i=0;i<T.extraPk;i++)rollPicks(m,TCS[T.extra],out);
 if(T.pots)for(let i=0;i<T.pots;i++)if(rnd()<0.5)S.pot.hp++;
 return out};

// ---------- 背包 / 出售（addBag 返回是否进入背包） ----------
addBag=function(it){
 if(!it.k&&!it.sock&&S.sell[it.q]&&it.q<3){S.gold+=sellPrice(it);return false}
 if(S.bag.length>=40){S.gold+=sellPrice(it);log('背包已满，自动出售 '+itemName(it));return false}S.bag.push(it);return true};

// ---------- 离线收益：只列出真正放入背包的物品 ----------
// 离线：按掉落表期望值折算的每只怪金币（与在线 rollPicks 的金币分支一致，不实际掷骰）
function tcGoldExp(m){let g=0;const one=T=>{const w=T.nd+T.gold+T.junk+T.eq+T.good;if(w>0)g+=T.pk*T.gold/w*(5*m.lv+8)/2*(T.gmul||1)};const T=tcOf(m);one(T);if(T.extra)for(let i=0;i<T.extraPk;i++)one(TCS[T.extra]);return g*(1+(ST.gf||0)/100)}
offline=function(){const sec=(Date.now()-S.last)/1000;if(sec<60)return;const t=Math.min(sec,8*3600);const kpm=Math.max(2,S.kpm||4);const kills=Math.floor(kpm*t/60*0.5);if(kills<1)return;
 const z=zoneData();let xp=0,g0=S.gold,got=[],kept=[],sold=0,soldG=0,baseG=0;
 for(let i=0;i<kills;i++){const m=mkMon(pick(z.mons),z.ml);const diff=S.lvl-m.lv;let f=diff>5?([.81,.62,.43,.24][diff-6]??.05):1;xp+=m.exp*f;if(got.length<30)for(const it of rollTC(m))got.push(it);else baseG+=tcGoldExp(m)}
 xp=Math.round(xp);gainXp(xp);baseG=Math.round(baseG);S.gold+=baseG;
 for(const it of got){const g=S.gold;if(addBag(it))kept.push(it);else{sold++;soldG+=S.gold-g}}
 modal(`<div class="mtitle">离线收益</div><div class="gp"><div>离线 ${Math.floor(t/3600)}小时${Math.floor(t%3600/60)}分（上限8小时，效率50%）</div><div>于 <b>${z.n}</b> 击杀 ${kills} 只怪物</div><div>经验 +${fmt(xp)}　金币 +${fmt(S.gold-g0)}${baseG?`<span class="dim">（含击杀金币 ${fmt(baseG)}）</span>`:''}</div>
 ${sold?`<div class="dim">自动出售 ${sold} 件（${soldG}◈）</div>`:''}<div class="grid">${kept.map(it=>cell(it,'')).join('')||'<div class="dim">没有新物品放入背包</div>'}</div><div class="btns c"><button class="btn gold" onclick="closeM()">收下</button></div></div>`)};

// ---------- 储物箱 ----------
let BAGV='bag';
const _itm_findItem=findItem;findItem=function(uid){const f=_itm_findItem(uid);if(f)return f;const i=(S.stash||[]).findIndex(x=>x.uid===uid);return i>=0?{it:S.stash[i],i:null,si:i,stash:1}:null};
function toStash(uid){const i=S.bag.findIndex(x=>x.uid===uid);if(i<0)return;if(S.stash.length>=STASH_SIZE)return toast('储物箱已满');S.stash.push(S.bag.splice(i,1)[0]);closeM();render()}
function fromStash(uid){const i=S.stash.findIndex(x=>x.uid===uid);if(i<0)return;if(S.bag.length>=40)return toast('背包已满');S.bag.push(S.stash.splice(i,1)[0]);closeM();render()}
const _itm_showItem=showItem;
showItem=function(uid){const f=findItem(uid);if(!f)return;_itm_showItem(uid);const box=document.querySelector('#modal .btns.c');if(!box)return;
 if(f.stash){box.innerHTML=`<button class="btn gold" onclick="fromStash(${uid})">取回背包</button><button class="btn" onclick="closeM()">关闭</button>`;return}
 if(!f.slot){box.insertAdjacentHTML('afterbegin',`<button class="btn" onclick="toStash(${uid})">存入储物箱</button>`)}};
// 背包页：在原渲染后追加储物箱切换与面板；修正空槽图标
const _itm_renderBag=renderBag;
renderBag=function(){_itm_renderBag();const P=$('#panel');const gps=P.querySelectorAll('.gp');const bagGp=gps[gps.length-1];
 const sw=`<div class="stabs sm bagv"><button class="${BAGV==='bag'?'on':''}" onclick="BAGV='bag';render()">背包</button><button class="${BAGV==='stash'?'on':''}" onclick="BAGV='stash';render()">储物箱 ${S.stash.length}/${STASH_SIZE}</button></div>`;
 bagGp.insertAdjacentHTML('beforebegin',sw);
 if(BAGV==='stash'){bagGp.outerHTML=`<div class="gp stash"><h3>储物箱 ${S.stash.length}/${STASH_SIZE} <span class="r dim">点击物品可取回</span></h3><div class="grid">${S.stash.map(it=>cell(it,`showItem(${it.uid})`)).join('')||'<div class="dim">空。可在背包物品详情中点“存入储物箱”。</div>'}</div></div>`}};

// 镶嵌 / 炼金匣 / 合成已删除（legacy_prune 批次2）

// 若 game.js 未延迟 init（旧版入口），在此补齐存档字段
if(typeof S!=='undefined'&&S&&!S.stash)S.stash=[];
// ---------- 防具力量/敏捷需求缩放（D3 式放宽） ----------
// 原版底材需求（精英腰带 106、精英盔甲 158 力量）远超法系默认加点（自动加点只把力量加到「背包里够得着的装备」，法系 85 级约 25 力量）。
// 防具类（头/甲/盾/手/腰/鞋）：50 以内不变，超出部分 ×0.35（106→70、158→88；重甲仍高于轻甲）。武器不变。
// 法系流派套装/暗金（亡灵 3 流派 + cls_build 中 role:'caster' 的流派）：力量/敏捷需求再封顶 30。
const REQ_ARMS=new Set(['helm','armor','shield','gloves','belt','boots']);
function reqScale(v){return v>50?50+Math.round((v-50)*0.35):v}
function reqCasterBuild(it){if(!it||!it.name||typeof NB_NAMES==='undefined'||!NB_NAMES.has(it.name))return false;const k=it.nb||(it.set&&SETS[it.set]&&SETS[it.set].nb)||(typeof UNIQUES!=='undefined'&&(UNIQUES.find(u=>u.n===it.name)||{}).nb);if(!k)return false;
 if(['sum','bone','plague'].includes(k))return true;const c=typeof CB_SPECS!=='undefined'&&CB_SPECS.find(x=>x.k===k);return!!(c&&c.role==='caster')}
{const f=itemReq;itemReq=function(it){const r=f(it);try{const b=BASEM[it.b];if(b&&REQ_ARMS.has(b.s)){r.str=reqScale(r.str);r.dex=reqScale(r.dex)}if(reqCasterBuild(it)){r.str=Math.min(r.str,30);r.dex=Math.min(r.dex,30)}}catch(e){}return r}}
// 自动加点的力量目标：原来只看「需求 ≤ 当前力量+10」的装备且封顶 60，法系力量永远停在初始值附近。
// 改为：背包中需求等级 ≤ 角色等级+3、力量需求 ≤ 20+0.6×等级（30 级 38 / 60 级 56 / 85 级 71）的装备里取最高需求。
function reqStrCap(){return Math.round(20+0.6*((S&&S.lvl)||1))}
needStr=function(){const cap=reqStrCap();let n=0;for(const it of S.bag)if(it&&!it.k&&BASEM[it.b]){const r=itemReq(it);if(r.lv<=S.lvl+3&&r.str<=cap)n=Math.max(n,r.str)}return Math.min(n,cap)};
