'use strict';
// ===================================================================================
// cq/bal_fix_cq.js — 系统侧平衡修复（测试平衡定位，2026-10-21）
// P0 自动回收（S.rcy.keepBetter，缺省开，=0 关）：可装备且战力高于身上同部位（或该部位空着）的装备永不回收；魔法/稀有默认不回收（rcy.dv=4 一次性迁移，新旧角色都生效）
// 1) 第 1–2 章（普通难度 act 0/1）非首领掉落判定 DENSITY.drop 0.6 → 1.0（金币同比，见 acts.js tcGoldExp）
// 2) 技能书效果见 cq/m2_cq.js（学习/升级职业技能，可重复用到 20 级，挂机自动学）
// 3) 挂机自动强化：按金币/黑铁矿把已穿装备强化到 +S.cqAE.max（默认 +3，可关 S.cqAE.on=0 / CQSys.autoEnh(on,max)）
// 依赖：game.js(power/canEquip/slotOf/SLOTS) loot.js(shouldRecycle) salvage.js(rcyMigrate) cq/enhance.js(cqEnhance)
// ===================================================================================
// ---------- P0 回收保护 ----------
window.CQ_RCYBETTER=0;
function cqBetterThanWorn(it){try{if(!it||it.k||!BASEM[it.b]||(typeof canEquip==='function'&&!canEquip(it)))return false;const b=BASEM[it.b];let k=slotOf(b);
 if(k==='ring'){const r1=S.eq.ring1,r2=S.eq.ring2;if(!r1||!r2)return true;return power(it)>Math.min(power(r1),power(r2))}
 if(!k||!SLOTS.includes(k))return false;const w=S.eq[k];return !w||power(it)>power(w)}catch(e){return false}}
{const f=shouldRecycle;shouldRecycle=function(it,isNew){if(S.rcy&&S.rcy.keepBetter!==0&&cqBetterThanWorn(it)){CQ_RCYBETTER++;return false}return f.apply(this,arguments)}}
// 品质 3=魔法 4=稀有：默认不回收；旧档 dv≤3（20261020a 把稀有也设为回收）纠正一次
function cqRcyFix(){const r=S&&S.rcy;if(!r||(r.dv|0)>=4)return;r.q=Object.assign({},r.q||{});r.q[3]=0;r.q[4]=0;r.dv=4}
{const f=ensureLoot;ensureLoot=function(){const o=f.apply(this,arguments);cqRcyFix();return o}}
// ---------- 1) 第 1–2 章掉落判定 ----------
const CQ_DROP0=DENSITY.drop;
Object.defineProperty(DENSITY,'drop',{configurable:true,get(){return(typeof S!=='undefined'&&S&&!S.diff&&(S.act|0)<=1)?1:CQ_DROP0},set(v){}});
// ---------- 3) 挂机自动强化 ----------
function cqAE(){if(!S.cqAE)S.cqAE={on:1,max:3,keep:300};return S.cqAE}
function cqAutoEnhTick(){const A=cqAE();if(!A.on||typeof cqEnhance!=='function')return 0;let n=0;
 const eq=Object.keys(S.eq).map(k=>S.eq[k]).filter(it=>it&&!it.k&&BASEM[it.b]&&(it.en||0)<Math.min(A.max,CQ_BAL.enh.max));
 eq.sort((a,b)=>(a.en||0)-(b.en||0)||(BASEM[b.b].s==='weapon')-(BASEM[a.b].s==='weapon'));
 for(const it of eq){const c=cqEnhCost(it.en||0);if(S.gold-c.gold<(A.keep|0)||matCount('heitie')<c.ore)continue;const r=cqEnhance(it.uid,{});if(r&&!r.err){n++;S.cqAEn=(S.cqAEn||0)+1;break}}
 return n}
{let acc=0,g0=null;const f=step;step=function(dt){const r=f.apply(this,arguments);try{if(typeof S==='undefined'||!S)return r;if(g0!=null&&S.gold>g0)S.cqGoldIn=(S.cqGoldIn||0)+(S.gold-g0);
 acc+=dt;if(acc>=5){acc=0;if(S.auto)cqAutoEnhTick()}g0=S.gold}catch(e){}return r}}
if(typeof CQSys!=='undefined'){CQSys.autoEnh=(on,max)=>{const A=cqAE();if(on!=null)A.on=on?1:0;if(max!=null)A.max=Math.max(0,Math.min(CQ_BAL.enh.max,max|0));return Object.assign({},A)};CQSys.autoEnhTick=cqAutoEnhTick;CQSys.betterThanWorn=cqBetterThanWorn}
// 强化界面加开关
if(typeof cqEnhUI==='function'){const f=cqEnhUI;cqEnhUI=function(uid){f.apply(this,arguments);if(typeof document==='undefined'||window.__NOUI)return;const g=document.querySelector('#modal .cqenh');if(!g||g.querySelector('.cqae'))return;const A=cqAE();
 g.insertAdjacentHTML('beforeend',`<div class="row cqae"><label style="white-space:nowrap"><input type="checkbox" ${A.on?'checked':''} onchange="CQSys.autoEnh(this.checked)"> 挂机自动强化已穿装备到 +${A.max}（保留 ${A.keep} 金币）</label></div>`)}}
