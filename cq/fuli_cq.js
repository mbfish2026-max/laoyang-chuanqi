'use strict';
// cq/fuli_cq.js — 福利/角色页系统逻辑（只做逻辑+存档+接口，页面由战斗开发实现；设计稿 design/chuanqi_v2_live p5_role / p8_fuli）
// 1) CQSys.signin   七日签到（账号级 ACCT.cqSign，本地自然日；断签不清零，每签一天进度 +1，第 7 天后回到第 1 天）
// 2) CQSys.offline  离线收益领取 / 元宝双倍（基于 m2_cq.js 的 offline 结算 S.cqOff；每次离线结算只能领取一次）
// 3) CQSys.equip    一键换装（按战力，仅角色本体）
// 接口说明见 docs/systems_api.md「福利 / 一键换装」。
(function(){
const CS=window.CQSys=window.CQSys||{};
// ---------------- 1) 七日签到 ----------------
// 奖励（p8_fuli 设计稿）：元宝×20 / 金创药×5 / 技能书页 / 太阳水×5 / 金币×5千 / 元宝×50 / 极品戒指
const SIGN_RW=[
 {t:'yb',n:20,name:'元宝×20',ic:'ic_im103037'},
 {t:'pot',k:'hp',n:5,name:'金创药×5',ic:'ic_im100012'},
 {t:'book',n:1,name:'技能书页',ic:'ic_im104001'},
 {t:'pot',k:'rej',n:5,name:'太阳水×5',ic:'ic_im100031'},
 {t:'gold',n:5000,name:'金币×5千',ic:'coin'},
 {t:'yb',n:50,name:'元宝×50',ic:'ic_im103037'},
 {t:'ring',q:5,n:1,name:'极品戒指',ic:'ic_im122020',big:1}];
window.CQ_SIGN_RW=SIGN_RW;
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const nowMs=()=>typeof CS._now==='function'?CS._now():Date.now();// 测试可覆盖 CQSys._now
function signRec(){const A=(typeof ACCT!=='undefined'&&ACCT)?ACCT:S;if(!A.cqSign||typeof A.cqSign!=='object')A.cqSign={n:0,last:''};return A.cqSign}
function signSave(){try{if(typeof ACCT!=='undefined'&&ACCT&&typeof acctSave==='function')acctSave();if(typeof save==='function')save()}catch(e){}}
function signState(){const R=signRec(),today=dayKey(nowMs()),claimedToday=R.last===today;
 const signed=claimedToday?((R.n-1)%7)+1:R.n%7;// 本轮已签天数（0–7）
 const day=claimedToday?signed:signed+1;// 今天对应第几天（已签则为刚签的那天）
 return{ok:true,today,claimedToday,canClaim:!claimedToday,day,signed,total:R.n|0,last:R.last||null,resetOnMiss:false,
  days:SIGN_RW.map((r,i)=>({day:i+1,name:r.name,ic:r.ic,big:!!r.big,state:i<signed?'ok':(i===day-1&&!claimedToday?'now':'')}))}}
function bookPick(){const c=typeof curCls==='function'?curCls():S.cls;const B=window.CQ_BOOKS||{};
 const L=Object.keys(B).filter(id=>{const b=B[id];return b&&!b.placeholder&&b.cls===c&&(!b.sk||!S.sk||(S.sk[b.sk]|0)<(CQ_BAL.book.maxLv||20))});
 return L.length?L.sort((a,b)=>(B[a].r||B[a].lv||0)-(B[b].r||B[b].lv||0))[Math.floor(Math.random()*Math.min(3,L.length))]:null}
// 极品戒指：按当前等级可穿的最高档戒指底材优先，凑不出极品（该底材无极品）时依次换低档底材；都不行才收下稀有
function ringItem(q){const lv=S.lvl||1;const rs=BASES.filter(b=>b.s==='ring');const ok=rs.filter(b=>b.q<=Math.max(3,lv));const L=(ok.length?ok:rs).sort((a,b)=>b.q-a.q);let it=null;
 for(const base of L){for(let i=0;i<8;i++){const x=genItem(Math.max(lv,base.q),{base,q});if(x&&!x.k){it=it||x;if(x.q===q){it=x;break}}}if(it&&it.q===q)break}
 if(it&&!it.k)it.req=Math.min(it.req||0,lv);return it}
function giveSign(r){const out={type:r.t,name:r.name};
 if(r.t==='yb')out.yb=CS.ybAdd(r.n,'七日签到');
 else if(r.t==='pot'){S.pot[r.k]=(S.pot[r.k]|0)+r.n}
 else if(r.t==='gold'){S.gold+=r.n}
 else if(r.t==='book'){const id=bookPick();if(id){addMat('book_'+id,1);out.book=id;out.icon=(window.CQ_ICONS&&CQ_ICONS.matIcon('book_'+id))||null;out.name='技能书·'+(CQ_BOOKS[id].n||id)}else{S.gold+=2000;out.fallback='gold';out.gold=2000}}
 else if(r.t==='ring'){const it=ringItem(r.q);addBag(it);out.item={uid:it.uid,name:itemName(it),q:it.q}}
 return out}
function signClaim(){const st=signState();if(st.claimedToday)return{ok:false,reason:'今日已签到',state:st};
 const R=signRec(),idx=R.n%7,r=SIGN_RW[idx];const got=giveSign(r);R.n=(R.n|0)+1;R.last=st.today;signSave();
 const res={ok:true,day:idx+1,reward:got,state:signState()};CS.emit&&CS.emit('signin',res);return res}
CS.signin={state:signState,claim:signClaim,rewards:()=>SIGN_RW.map((r,i)=>Object.assign({day:i+1},r))};
// ---------------- 2) 离线收益 / 元宝双倍 ----------------
// 结算时金币/经验/掉落已入账（沿用原结算）；claim(false)=确认领取；claim(true)=扣元宝再补发一份 金币+经验（掉落不翻倍）
CQ_BAL.offYb={perH:10,min:10};// 双倍费用：每（不足）1 小时 10 元宝，至少 10；上限 8 小时 → 80
const offCost=res=>Math.max(CQ_BAL.offYb.min,Math.ceil((res.capSec||0)/3600)*CQ_BAL.offYb.perH);
if(typeof offline==='function'){const f=offline;offline=function(){const o0=S.cqOff,x0=S.xp||0;const r=f.apply(this,arguments);
 try{const res=S.cqOff;if(res&&res!==o0){res.xp=Math.max(0,Math.round((S.xp||0)-x0));res.claimed=0;res.doubled=0;res.zone=(()=>{try{return zoneData().n}catch(e){return''}})();res.t=nowMs();CS.emit&&CS.emit('offlineReady',offState())}}catch(e){console.error('[cq fuli offline]',e)}
 return r}}
function offState(){const res=S.cqOff;if(!res||res.claimed==null)return{ok:true,has:false};
 return{ok:true,has:!res.claimed,claimed:!!res.claimed,doubled:!!res.doubled,sec:res.sec,capSec:res.capSec,capH:CQ_BAL.off.maxH,zone:res.zone||'',kills:res.kills,
  gold:res.gold|0,xp:res.xp|0,items:(res.items||[]).length,boss:(res.boss||[]).map(b=>({key:b.key,n:b.n,kills:b.kills})),ybCost:offCost(res),yb:CS.currency().yb}}
function offClaim(dbl){const res=S.cqOff;if(!res||res.claimed==null)return{ok:false,reason:'没有可领取的离线收益'};if(res.claimed)return{ok:false,reason:'本次离线收益已领取'};
 let add={gold:0,xp:0},cost=0;
 if(dbl){cost=offCost(res);if(CS.currency().yb<cost)return{ok:false,reason:'元宝不足',need:cost,yb:CS.currency().yb};
  if(!CS.ybSpend(cost,'离线收益双倍'))return{ok:false,reason:'元宝不足',need:cost,yb:CS.currency().yb};
  add={gold:res.gold|0,xp:res.xp|0};S.gold+=add.gold;if(add.xp)gainXp(add.xp);res.doubled=1}
 res.claimed=1;try{save()}catch(e){}
 const out={ok:true,double:!!dbl,ybCost:cost,gold:(res.gold|0)+add.gold,xp:(res.xp|0)+add.xp,extra:add};CS.emit&&CS.emit('offlineClaim',out);return out}
CS.offline={state:offState,claim:offClaim,cost:()=>S.cqOff?offCost(S.cqOff):null};
// ---------------- 3) 一键换装（按战力） ----------------
const ITM=it=>it?{uid:it.uid,name:itemName(it),q:it.q,power:power(it)}:null;
function eqOk(it){return it&&!it.k&&BASEM[it.b]&&canEquip(it)}
function autoBest(dryRun){if(!S||!S.eq)return{ok:false,reason:'无角色'};const plan=[];const used=new Set();
 for(const k of SLOTS){if(k==='ring1'||k==='ring2')continue;let best=S.eq[k]||null,bp=best?power(best):-1;
  for(const it of S.bag)if(eqOk(it)&&slotOf(BASEM[it.b])===k&&power(it)>bp){best=it;bp=power(it)}
  if(best&&best!==S.eq[k]){plan.push({slot:k,from:S.eq[k]||null,to:best});used.add(best)}}
 // 戒指：已穿两枚 + 背包所有可穿戒指，取战力前二
 const pool=[S.eq.ring1,S.eq.ring2].filter(Boolean).concat(S.bag.filter(it=>eqOk(it)&&slotOf(BASEM[it.b])==='ring'));pool.sort((a,b)=>power(b)-power(a));
 const top=pool.slice(0,2);const keep={};for(const k of['ring1','ring2'])if(S.eq[k]&&top.includes(S.eq[k]))keep[k]=S.eq[k];
 const newR=top.filter(it=>it!==S.eq.ring1&&it!==S.eq.ring2);
 for(const k of['ring1','ring2'])if(!keep[k]&&newR.length){const it=newR.shift();plan.push({slot:k,from:S.eq[k]||null,to:it})}
 const changes=plan.map(p=>({slot:p.slot,from:ITM(p.from),to:ITM(p.to),gain:power(p.to)-(p.from?power(p.from):0)}));
 if(!changes.length)return{ok:true,changed:0,changes:[],dryRun:!!dryRun,reason:'没有更强的装备'};
 if(dryRun)return{ok:true,changed:changes.length,changes,dryRun:true};
 const p0=CS.power?CS.power():0;
 for(const p of plan){const i=S.bag.indexOf(p.to);if(i>=0)S.bag.splice(i,1);S.eq[p.slot]=p.to}
 for(const p of plan)if(p.from&&!plan.some(q=>q.to===p.from))S.bag.push(p.from);
 calc();try{if(typeof H!=='undefined'&&ST)H.life=Math.min(H.life,ST.life)}catch(e){}try{save()}catch(e){}
 const out={ok:true,changed:changes.length,changes,dryRun:false,power:{before:p0,after:CS.power?CS.power():0}};CS.emit&&CS.emit('autoBest',out);return out}
CS.equip=Object.assign(CS.equip||{},{autoBest});
})();
