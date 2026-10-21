// 系统平衡模拟（系统开发）：同 cls_sim 推进逻辑，额外输出金币/强化/技能书/回收吞装备统计。[CLS=zs|fs|ds] node tests/cq_bal_sim.js [小时=6]
// 全自动挂机（自动加点/加属性/换装/买药/推进），记录每张图首次进入时间与等级、阵亡数、技能等级、主线首领通关时间。
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.join(__dirname,'..');
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'' :k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
const store={};let _sd=Number(process.env.SEED||7)>>>0;const SMath=Object.create(Math);SMath.random=()=>{_sd=(_sd+0x6D2B79F5)>>>0;let t=_sd;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const ctx={console:{log(){},warn(){},error:console.error},Math:SMath,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},MutationObserver:function(){return{observe(){},disconnect(){}}}};
ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_)/.test(f));
for(const f of files)try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f})}catch(e){console.error('load',f,e.message)}
const G=s=>vm.runInContext(s,ctx);const CLS=process.env.CLS||'zs';
G(`S=newSave();try{load()}catch(e){};S.cls='${CLS}';S.ci=0;clsInit();if(typeof ensureLoot==='function')ensureLoot();calc();H.life=ST.life;H.mana=ST.mana;S.auto=1;S.autoEq=1;S.autoSk=1;S.autoAt=1;TAB='fight';MON=[];spawnT=0.1;
 window.__D=0;{const f=die;die=function(){__D++;return f.apply(this,arguments)}}`);
const hours=+process.argv[2]||6,dt=0.05;let last='',seen={},t=0,out=[];
for(;t<hours*3600;t+=dt){G(`step(${dt})`);if(Math.round(t/dt)%20===0){G('autoTick()');const k=G('S.diff+"-"+S.act+"-"+S.zone');
  if(!seen[k]){seen[k]=1;out.push(`${(t/3600).toFixed(2)}h 进入 ${k} ${G('ACTS[S.act].zones[S.zone].n')} lv${G('S.lvl')} 阵亡${G('__D')}`)}
  if((G('S.act')>0||G('!!(S.q&&S.q.q6)'))&&!seen.ch1){seen.ch1=1;out.push(`${(t/3600).toFixed(2)}h ★第一章通关 lv${G('S.lvl')}`);if(process.env.STOP1)break}}}
for(const l of out)console.log(l);
console.log('任务',G('JSON.stringify(S.q)'),'hold',G("typeof autoHoldWhy==='function'?autoHoldWhy():''"),'unl',G('JSON.stringify([S.unl,S.cleared])'));console.log('end',G('[S.diff,S.act,S.zone].join()'),'lv',G('S.lvl'),'kills',G('S.kills'),'阵亡',G('__D'),'技能',G('JSON.stringify(S.sk)'),'非本职业技能',G(`Object.keys(S.sk).filter(k=>!SKM[k]||SKM[k].cls!==curCls()).join()||'无'`));
console.log('系统',G(`JSON.stringify({gold:S.gold,goldIn:(S.cqGoldIn||0),autoEnh:(S.cqAEn||0),enh:Object.fromEntries(Object.entries(S.eq).filter(([k,v])=>v&&!v.k).map(([k,v])=>[k,v.en||0])),books:Object.keys(S.cqBooks||{}).length,rcy:STATS.rcy||0,rcyBetter:(window.CQ_RCYBETTER||0),heitie:matCount('heitie'),pw:typeof CQSys!=='undefined'&&CQSys.power?CQSys.power():0})`));
