// 英雄普攻数值模拟（不改游戏代码）：无 UI 跑 game.js step()，并按 cq/cq_hero.js + cq_bridge.js 的规则在旁边驱动英雄。
// 用法：CQ_ROOT=<站点根，默认仓库根> CLS=zs|fs|ds HOURS=8 HERO=0|1 K=0.35 T=1.6 [SCALE=none|lvl] [HEJI=1] SEED=1 node tests/cq_hero_sim.js
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
vm.runInContext(fs.readFileSync(path.join(root,'cq/cq_hero.js'),'utf8'),ctx,{filename:'cq/cq_hero.js'});
const G=s=>vm.runInContext(s,ctx);
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
