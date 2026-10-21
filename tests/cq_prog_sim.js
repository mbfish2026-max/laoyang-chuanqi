// 推进/卡关消融模拟（不改游戏代码）：在 cls_sim 的全自动挂机基础上，逐项加强玩家侧，看尸王等章节首领何时可打。
// 用法：CQ_ROOT=<站点快照> CLS=zs|fs|ds SEED=1 HOURS=12 [旋钮] node tests/cq_prog_sim.js
// 旋钮（都只动玩家侧，不改怪物/首领）：
//   XP=1.5      击杀经验 ×（≈等级曲线放缓/加快）        DROP=2   非首领掉落判定 DENSITY.drop ×（掉落数量）
//   MF=100      附加魔法寻宝（掉落品质）                  ENH=5    自动把身上装备强化到 +N（不扣金币；另报金币是否够）
//   SKK=1.3     职业技能/近战系数 dk/mk ×                 EK=1.6   对首领/精英额外系数 ek 设为该值
//   RCY=keep    自动回收不收魔法/稀有（设置层）  RCY=up  自动回收前先放行「可装备且战力更高」的物品（结构修正）
//   BOOKS=1     自动学会已掉落的技能书（当前书无技能效果，仅验证）
// 输出 JSON：每张图首次进入时间/等级、章节首领首杀时间、尸王战每场结果（首领剩余血量%、用时）、进入尸王殿时角色面板。
const fs=require('fs'),vm=require('vm'),path=require('path');const root=process.env.CQ_ROOT||path.join(__dirname,'..');const E=process.env;
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
const store={};let _sd=Number(E.SEED||7)>>>0;const SMath=Object.create(Math);SMath.random=()=>{_sd=(_sd+0x6D2B79F5)>>>0;let t=_sd;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const ctx={console:{log(){},warn(){},error(){}},Math:SMath,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},MutationObserver:function(){return{observe(){},disconnect(){}}}};
ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_)/.test(f));
const loadErr=[];for(const f of files)try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f})}catch(e){loadErr.push(f+': '+e.message)}
const G=s=>vm.runInContext(s,ctx);const CLS=E.CLS||'zs',HOURS=+(E.HOURS||12);
const K={XP:+(E.XP||1),DROP:+(E.DROP||1),MF:+(E.MF||0),ENH:+(E.ENH||0),SKK:+(E.SKK||1),EK:E.EK?+E.EK:null,BOOKS:E.BOOKS==='1',RCY:E.RCY||''};
G(`S=newSave();try{load()}catch(e){};S.cls='${CLS}';S.ci=0;clsInit();if(typeof ensureLoot==='function')ensureLoot();calc();H.life=ST.life;H.mana=ST.mana;S.auto=1;S.autoEq=1;S.autoSk=1;S.autoAt=1;TAB='fight';MON=[];spawnT=0.1;
 var K=${JSON.stringify(K)};var P={deaths:0,fights:[],cur:null,bossKill:{}};
 {const f=die;die=function(){P.deaths++;if(P.cur){const b=P.cur.m;P.cur.res='die';P.cur.left=+(Math.max(0,b.hp)/b.max).toFixed(3);P.cur.sec=+(GT-P.cur.t).toFixed(1);P.fights.push(P.cur);P.cur=null}return f.apply(this,arguments)}}
 P.rcy=0;{const f=shouldRecycle;shouldRecycle=function(it,n){let v=f(it,n);if(v&&it&&!it.k&&BASEM[it.b]){if(K.RCY==='keep'&&(it.q===3||it.q===4))v=false;
  if(K.RCY==='up'&&canEquip(it)){let k=slotOf(BASEM[it.b]);const cur=k==='ring'?[S.eq.ring1,S.eq.ring2]:[S.eq[k]];if(cur.some(c=>!c||power(it)>power(c)))v=false}}if(v)P.rcy++;return v}}
 if(K.XP!==1){const f=mkMon;mkMon=function(){const m=f.apply(this,arguments);if(m)m.exp*=K.XP;return m}}
 if(K.DROP!==1)DENSITY.drop=Math.min(1,DENSITY.drop*K.DROP);
 if(K.MF||K.ENH){const f=calc;calc=function(){if(K.ENH)for(const s in S.eq){const it=S.eq[s];if(it&&!it.k&&(it.en||0)<K.ENH)it.en=K.ENH}const r=f.apply(this,arguments);if(K.MF)ST.mf=(ST.mf||0)+K.MF;return r}}
 {const B=CLS_BAL[curCls()];if(B){for(const k of['dk','mk'])if(B[k]&&K.SKK!==1)B[k]=B[k].map(([l,v])=>[l,v*K.SKK]);if(K.EK!=null&&B.ek)B.ek=B.ek.map(([l])=>[l,K.EK])}}`);
const dt=0.05;const zones=[],seen={};let enterKing=null;const t0=Date.now();
const KING=E.KING||'zombieking';
for(let t=0;t<HOURS*3600;t+=dt){G(`step(${dt})`);const st=Math.round(t/dt);
 if(st%10===0){G(`{const b=MON.find(m=>m.boss&&m.actboss&&m.hp>0);if(b&&(!P.cur||P.cur.m!==b))P.cur={m:b,key:b.key,t:GT,lv:b.lv,plv:S.lvl};
   if(P.cur&&!(P.cur.m.hp>0)){P.cur.res='kill';P.cur.sec=+(GT-P.cur.t).toFixed(1);P.cur.left=0;P.fights.push(P.cur);if(!P.bossKill[P.cur.key])P.bossKill[P.cur.key]=[+(GT/3600).toFixed(2),S.lvl];P.cur=null}
   else if(P.cur&&!MON.includes(P.cur.m)){P.cur.res='leave';P.cur.left=+(P.cur.m.hp/P.cur.m.max).toFixed(3);P.cur.sec=+(GT-P.cur.t).toFixed(1);P.fights.push(P.cur);P.cur=null}}`)}
 if(st%20===0){G('autoTick()');if(K.BOOKS)G(`for(const k in (S.mats||{}))if(/^book_/.test(k)&&S.mats[k]>0)try{CQSys.bookLearn(k.slice(5))}catch(e){}`);
  const k=G('S.act+"-"+S.zone');if(!seen[k]){seen[k]=1;zones.push([+(t/3600).toFixed(2),k,G('ACTS[S.act].zones[S.zone].n'),G('S.lvl'),G('P.deaths')]);
   if(G(`ACTS[S.act].zones[S.zone].boss==='${KING}'`)&&!enterKing)enterKing=JSON.parse(G(`JSON.stringify({h:+(GT/3600).toFixed(2),lvl:S.lvl,life:Math.round(ST.life),def:Math.round(ST.def||0),wmin:ST.wmin,wmax:ST.wmax,ar:Math.round(ST.ar||0),gold:S.gold,eq:Object.values(S.eq).filter(Boolean).map(i=>[i.b,i.q,i.lv||i.ilvl,i.en||0]),sk:S.sk})`))}}
 if(E.STOPKING&&G(`!!P.bossKill['${KING}']`))break}
const r=JSON.parse(G(`JSON.stringify({lvl:S.lvl,act:S.act,zone:S.zone,deaths:P.deaths,kills:S.kills,gold:S.gold,bossKill:P.bossKill,fights:P.fights.filter(f=>f.key==='${KING}').map(f=>({res:f.res,left:f.left,sec:f.sec,plv:f.plv,lv:f.lv})),books:Object.keys(S.mats||{}).filter(k=>/^book_/.test(k)),learned:S.cqBooks,life:Math.round(ST.life),def:Math.round(ST.def||0),wmax:ST.wmax,sk:S.sk,rcy:P.rcy,eqn:Object.keys(S.eq).filter(k=>S.eq[k]).length,eqq:Object.values(S.eq).filter(Boolean).map(i=>i.q)})`));
const kf=r.fights;console.log(JSON.stringify({cls:CLS,seed:+(E.SEED||7),K,hours:HOURS,loadErr,zones,enterKing,king:{tries:kf.length,kills:kf.filter(f=>f.res==='kill').length,bestLeft:kf.length?Math.min(...kf.map(f=>f.left)):null,first:kf.slice(0,3),last:kf.slice(-3)},...r,wallSec:(Date.now()-t0)/1000}));
