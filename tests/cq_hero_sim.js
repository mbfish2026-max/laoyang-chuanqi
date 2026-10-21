// 英雄普攻数值模拟（不改游戏代码）：无 UI 跑 game.js step()，并按 cq/cq_hero.js + cq_bridge.js 的规则在旁边驱动英雄。
// 用法（7f75beb 起用 ENGINE=bridge，直接跑游戏内英雄）：ENGINE=bridge CQ_ROOT=<快照> CLS=zs HOURS=6 HEJICD=45 HEJISECMAX=6.8 SEED=1 node tests/cq_hero_sim.js
// 旧用法（35304ef 规则旁路模拟）：CQ_ROOT=<站点根，默认仓库根> CLS=zs|fs|ds HOURS=8 HERO=0|1 K=0.35 T=1.6 [SCALE=none|lvl] [HEJI=1] SEED=1 node tests/cq_hero_sim.js
// 输出一行 JSON：玩家/英雄/合击伤害占比、等级与地图进度时间线、首领击杀耗时。
// 英雄规则（照抄 35304ef）：每 T 秒一次，伤害 = atkMax × K × U(0.8,1.2)，phys 经 hitMon；atkMax = max(1, ST.wmax+ST.fire+ST.cold, 等级×3)
//   怒气：英雄命中 +1、玩家命中 +2（暴击 +4，此处取 +2）、玩家受伤 +3；满 100 且冷却 30 秒结束 → 自动合击
//   合击伤害 = (atkMax + atkMax×K) × mult × (1+lvl/50) × U(0.9,1.1)，群体合击打全部目标
// 注意：游戏内英雄只在战斗页可见且未暂停时（rAF）才出手；本模拟假设一直在战斗页（上限情形）。
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=process.env.CQ_ROOT||path.join(__dirname,'..');
const E=process.env,CLS=E.CLS||'zs',HOURS=+E.HOURS||8,HERO=E.HERO!=='0',K=+(E.K||0.35),T=+(E.T||1.6),SCALE=E.SCALE||'none',HEJI=E.HEJI!=='0';
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
let _sd=Number(E.SEED||1)>>>0;const SMath=Object.create(Math);SMath.random=()=>{_sd=(_sd+0x6D2B79F5)>>>0;let t=_sd;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const store={};const ctx={console:{log(){},warn(){},error(){}},Math:SMath,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]},key:()=>null,length:0},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},confirm:()=>true};
ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_|cq\/battle_mount)/.test(f));
const loadErr=[];for(const f of files)try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f})}catch(e){loadErr.push(f+': '+e.message)}
const G=s=>vm.runInContext(s,ctx);
// ===== ENGINE=bridge：7f75beb 起英雄在 cq_bridge 包装的 step() 内出手，直接用游戏自己的英雄代码 =====
// 额外参数：NOCAP=1 关掉 20% 截断（看自然占比）；HEJICD HEJISECMAX HEJISECMIN DPSK（覆盖 CQ.HERO_TUNE）；HERO=0 关英雄；WIN=统计窗口秒(默认300)
if(E.ENGINE==='bridge'){
 vm.runInContext(fs.readFileSync(path.join(root,'cq/cq_hero.js'),'utf8'),ctx,{filename:'cq/cq_hero.js'});
 for(const f of['cq/cq_move.js','cq/cq_fx.js','cq_bridge.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
 const tune={};for(const [e,k] of [['HEJICD','hejiCd'],['HEJISECMAX','hejiSecMax'],['HEJISECMIN','hejiSecMin'],['DPSK','dpsK']])if(E[e]!=null)tune[k]=+E[e];
 const WIN=+(E.WIN||300);
 G(`S=newSave();try{load()}catch(e){};S.cls='${CLS}';S.ci=0;if(typeof clsInit==='function')clsInit();if(typeof ensureLoot==='function')ensureLoot();calc();H.life=ST.life;H.mana=ST.mana;S.auto=1;S.autoEq=1;S.autoSk=1;S.autoAt=1;TAB='fight';MON=[];spawnT=0.1;
  Object.assign(CQ.HERO_TUNE,${JSON.stringify(tune)});if(${E.NOCAP==='1'})CQ_BAL.budget.hero=0.99;
  var SIM={tot:{boss:{player:0,hero:0,heji:0},trash:{player:0,hero:0,heji:0}},win:[],cur:{player:0,hero:0,heji:0},heji:[],rageFull:[],boss:[],bossLive:{}};
  var _hm=hitMon;hitMon=function(m,d,src){const b=!!(m&&m.boss);const t=_hm.apply(this,arguments)||0;const k=src==='cqhero'?'hero':src==='cqheji'?'heji':'player';SIM.tot[b?'boss':'trash'][k]+=t;SIM.cur[k]+=t;return t};
  CQ._install();var HC=CQ.heroCore();
  if(${HERO}){if(window.CQSys&&CQSys.heroCreate&&!CQSys.hero().cls)CQSys.heroCreate(CQSys.heroProfs()[0]);HC.reload();HC.h.autoHeji=true}else{HC.h.exists=false}
  var _dh=HC.doHeji;HC.doHeji=function(h,m){const d=CQ.dps(),r=_dh.apply(this,arguments);if(r&&r.ok)SIM.heji.push({t:GT,boss:MON.some(x=>x.boss&&x.hp>0),sec:d>0?r.total/d:null,n:r.hits.length});return r};
  var _rf=0;`);
 const dt=0.05;const t0=Date.now();let lastKey='',tl=[];
 for(let t=0;t<HOURS*3600;t+=dt){G(`step(${dt})`);const st=Math.round(t/dt);
  if(st%4===0)G(`if(HC.h.rage>=100&&!_rf){_rf=1;SIM.rageFull.push(GT)}else if(HC.h.rage<100)_rf=0`);
  if(st%20===0)G(`for(const m of MON){if(m.boss&&m.hp>0&&!SIM.bossLive[m.uid])SIM.bossLive[m.uid]={t:GT,n:m.n||m.key}}for(const u in SIM.bossLive){if(!MON.some(m=>m.uid==u&&m.hp>0)){const b=SIM.bossLive[u];SIM.boss.push({n:b.n,sec:+(GT-b.t).toFixed(1),plv:S.lvl});delete SIM.bossLive[u]}}`);
  if(st%Math.round(WIN/dt)===0&&t>0)G(`SIM.win.push(SIM.cur);SIM.cur={player:0,hero:0,heji:0}`);
  if(st%200===0){G("typeof autoTick==='function'&&autoTick()");const k=G("[S.diff,S.act,S.zone].join('/')");if(k!==lastKey){lastKey=k;tl.push([+(t/3600).toFixed(3),k,G('S.lvl')])}}}
 const r=JSON.parse(G(`JSON.stringify({lvl:S.lvl,kills:S.kills,prog:[S.diff,S.act,S.zone],tune:CQ.HERO_TUNE,heroCls:window.CQSys&&CQSys.hero?CQSys.hero().cls:null,combo:HC.combo()&&HC.combo().name,SIM,kpm:S.kpm,budget:CQ_BAL.budget,prod:typeof cqBudgetProduct==='function'?cqBudgetProduct():null})`));
 const sh=o=>{const t=o.player+o.hero+o.heji;return t?{hero:o.hero/t,heji:o.heji/t,both:(o.hero+o.heji)/t,dmg:t}:null};
 const ws=r.SIM.win.map(sh).filter(Boolean).map(x=>x.both);const mean=ws.reduce((a,b)=>a+b,0)/(ws.length||1),sd=Math.sqrt(ws.reduce((a,b)=>a+(b-mean)**2,0)/(ws.length||1));
 const all={player:0,hero:0,heji:0};for(const g of['boss','trash'])for(const k in all)all[k]+=r.SIM.tot[g][k];
 const hj=r.SIM.heji;const gaps=hj.slice(1).map((x,i)=>x.t-hj[i].t);
 // 怒气是否卡脖子：合击后到怒气满的时间（<冷却 → 冷却是瓶颈）
 const rageWait=hj.map(h=>{const f=r.SIM.rageFull.find(t=>t>h.t+0.01);return f!=null?f-h.t:null}).filter(x=>x!=null);
 const med=a=>{a=[...a].sort((x,y)=>x-y);return a.length?a[a.length>>1]:null};
 console.log(JSON.stringify({engine:'bridge',cls:CLS,hero:HERO,hours:HOURS,seed:+(E.SEED||1),loadErr,heroCls:r.heroCls,combo:r.combo,tune:{dpsK:r.tune.dpsK,hejiCd:r.tune.hejiCd,hejiSecMin:r.tune.hejiSecMin,hejiSecMax:r.tune.hejiSecMax},
  share:sh(all),boss:sh(r.SIM.tot.boss),trash:sh(r.SIM.tot.trash),win:{n:ws.length,mean,sd,min:Math.min(...ws),max:Math.max(...ws),over20:ws.filter(x=>x>0.2).length},
  heji:{n:hj.length,gapMed:med(gaps),secMed:med(hj.map(x=>x.sec).filter(x=>x!=null)),bossFrac:hj.length?hj.filter(x=>x.boss).length/hj.length:0,rageWaitMed:med(rageWait)},
  bossSecMed:med(r.SIM.boss.map(b=>b.sec)),bossN:r.SIM.boss.length,bossByName:Object.fromEntries([...new Set(r.SIM.boss.map(b=>b.n))].map(n=>[n,med(r.SIM.boss.filter(b=>b.n===n).map(b=>b.sec))])),
  lvl:r.lvl,kills:r.kills,prog:r.prog,kpm:r.kpm,budget:r.budget,budgetProduct:r.prod,timeline:tl,wallSec:(Date.now()-t0)/1000}));
 process.exit(0);
}
vm.runInContext(fs.readFileSync(path.join(root,'cq/cq_hero.js'),'utf8'),ctx,{filename:'cq/cq_hero.js'});
G(`S=newSave();try{load()}catch(e){};S.cls='${CLS}';S.ci=0;if(typeof clsInit==='function')clsInit();if(typeof ensureLoot==='function')ensureLoot();calc();H.life=ST.life;H.mana=ST.mana;S.auto=1;S.autoEq=1;S.autoSk=1;S.autoAt=1;TAB='fight';MON=[];spawnT=0.1;
var SIM={dmg:{player:0,hero:0,heji:0},hejiN:0,rage:0,boss:[],bossLive:{},hurtN:0};
var _hm=hitMon;hitMon=function(m,d,src,c){const t=_hm.apply(this,arguments);const k=src==='cqhero'?'hero':src==='cqheji'?'heji':'player';SIM.dmg[k]+=t;if(src==='hero'&&SIM.heroObj)SIM.heroObj.addRage(2);return t};
var PROF={zs:1,fs:2,ds:3}[S.cls]||1;var HERO_ON=${HERO};SIM.heroObj=HERO_ON?new CQ.Hero(PROF,null):null;
if(SIM.heroObj){SIM.heroObj.unit.atkT=${T};if(!${HEJI})SIM.heroObj.h.autoHeji=false}
function simAtkMax(){return Math.max(1,(+ST.wmax||0)+(+ST.fire||0)+(+ST.cold||0),S.lvl*3)}
function simK(){return ${K}*(${JSON.stringify(SCALE)}==='lvl'?(1+S.lvl/60):1)}
var SIMHOST={targets:()=>MON.filter(m=>m&&m.hp>0),hit:(m,d,src)=>(m&&m.hp>0)?hitMon(m,{phys:Math.round(d)},src):0,atkMax:simAtkMax,lvl:()=>S.lvl,heroK:simK,now:()=>GT};`);
// 英雄每次出手的间隔：cq_hero.js 写死 1.6，这里在 tick 后改写 atkT 以模拟其它间隔
const dt=0.05;let lastLife=null,tl=[],lastKey='';const t0=Date.now();
for(let t=0;t<HOURS*3600;t+=dt){
 G(`step(${dt})`);
 if(HERO){G(`(function(){const H0=SIM.heroObj,a=H0.unit.atkT;const ev=H0.tick(${dt},SIMHOST);if(H0.unit.atkT>a)H0.unit.atkT=${T};
   if(ev&&ev.type==='heji'){SIM.hejiN++;for(const x of ev.hits){SIMHOST.hit(x.m,x.d,'cqheji');if(ev.combo.stun)x.m.stun=Math.max(x.m.stun||0,ev.combo.stun)}if(ev.combo.heal)H.life=Math.min(ST.life,H.life+ST.life*ev.combo.heal)}})()`);
   const life=G('H.life');if(lastLife!=null&&life<lastLife-0.5)G('SIM.heroObj.addRage(3)');lastLife=life}
 const step=Math.round(t/dt);
 if(step%20===0){G(`for(const m of MON){if(m.boss&&m.hp>0&&!SIM.bossLive[m.uid])SIM.bossLive[m.uid]={t:GT,n:m.n||m.key,lv:m.lv}}for(const u in SIM.bossLive){if(!MON.some(m=>m.uid==u&&m.hp>0)){const b=SIM.bossLive[u];SIM.boss.push({n:b.n,lv:b.lv,at:+(GT/3600).toFixed(3),sec:+(GT-b.t).toFixed(1),plv:S.lvl});delete SIMHOST._;delete SIM.bossLive[u]}}`)}
 if(step%200===0){G("typeof autoTick==='function'&&autoTick()");const k=G("[S.diff,S.act,S.zone].join('/')");if(k!==lastKey){lastKey=k;tl.push([+(t/3600).toFixed(3),k,G('S.lvl')])}}
}
const r=JSON.parse(G(`JSON.stringify({lvl:S.lvl,kills:S.kills,prog:[S.diff,S.act,S.zone,S.wave],dmg:SIM.dmg,hejiN:SIM.hejiN,boss:SIM.boss,atkMax:simAtkMax(),wmax:ST.wmax,fire:ST.fire,cold:ST.cold,skills:Object.keys(S.sk||{}).filter(k=>S.sk[k]>0)})`));
const tot=r.dmg.player+r.dmg.hero+r.dmg.heji;
console.log(JSON.stringify({cls:CLS,hero:HERO,K,T,scale:SCALE,heji:HEJI,hours:HOURS,seed:+(E.SEED||1),loadErr,share:{hero:+(r.dmg.hero/tot).toFixed(4),heji:+(r.dmg.heji/tot).toFixed(4)},...r,timeline:tl,wallSec:(Date.now()-t0)/1000}));
