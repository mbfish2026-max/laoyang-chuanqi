'use strict';
// Real step/loot/auto progression, deterministic seed. No free gear, points or boss edits.
const fs=require('fs'),path=require('path'),checkpointDir=path.join(require('os').tmpdir(),'mir2-lvl');
fs.mkdirSync(checkpointDir,{recursive:true});
const seed=Number(process.env.SEED||20261021)>>>0;
const T=require('./cq_harness')('mir2_lvl_sim',{seed}),{G}=T;
const cls=process.argv[2]||'zs',hours=+(process.argv[3]||80);
G(`var SimRealDate=Date,simEpoch=Date.UTC(2026,9,22);Date=class extends SimRealDate{constructor(...a){super(...(a.length?a:[Date.now()]))}static now(){return simEpoch+Math.round(GT*1000)}}`);
G(`load();CQSys.createChar('时长模拟','${cls}');S.auto=1;S.autoEq=1;S.autoSk=1;TAB='fight';H.life=ST.life;H.mana=ST.mana;var record={zones:[],deaths:0,clears:{}};var seen={};var oldDie=die;die=function(){record.deaths++;return oldDie.apply(this,arguments)};`);
const start=Date.now();
for(let hour=0;hour<hours;hour++){
 G(`for(var tick=0;tick<18000;tick++){step(0.2);if(tick%5===0){autoTick();if(S.lvl>=60&&record.cap60==null)record.cap60=${hour}+tick/18000;for(var d=0;d<3;d++)if(S.Q[d]&&S.Q[d].a7q6&&!record.clears[d])record.clears[d]=${hour}+tick/18000;var key=S.diff+'-'+S.act+'-'+S.zone;if(!seen[key]){seen[key]=1;record.zones.push({h:${hour}+tick/18000,key,lv:S.lvl})}}}`);
 fs.writeFileSync(path.join(checkpointDir,'checkpoint_'+cls+'.json'),G('JSON.stringify({s:S,a:ACCT,record})'));
 process.stderr.write(JSON.stringify({hour:hour+1,state:G('[S.diff,S.act,S.zone,S.lvl,S.kills]'),deaths:G('record.deaths')})+'\n');
 if(G('record.cap60!=null&&record.clears[2]!=null'))break;
}
G('record.lvl=S.lvl;record.kills=S.kills;record.q=S.q;record.state=[S.diff,S.act,S.zone];record.stats={life:ST.life,mana:ST.mana,wmax:ST.wmax}');
console.log(JSON.stringify({cls,hoursLimit:hours,seed,wallSec:(Date.now()-start)/1000,...JSON.parse(G('JSON.stringify(record)'))}));
