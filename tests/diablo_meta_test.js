'use strict';
const fs=require('fs'),vm=require('vm');
const T=require('./cq_harness')('diablo_meta_test'),{G,ok}=T;
ok(!T.loadErr.length,'scripts load');
G('load();calc()');
ok(G("!EG_PAGES.some(p=>['secret','rift'].includes(p.k))&&typeof egSecretStart==='undefined'&&typeof egRiftStart==='undefined'"),'cancelled entries and combat functions removed');
ok(G("['lp','cube','season'].every(k=>!(k in EG_DEF()))"),'new saves do not create cancelled shells');
G(`S.eg={secret:{staff:{2:1},runs:7,king:3},rift:{keys:17,best:25},ach:{x1:123,l3:124,p1:125},codex:{u:{old:1},s:{}},lp:{arch:{old:1}},season:{n:3}};EG();var snapshot=JSON.stringify(S.eg);EG()`);
ok(G('JSON.stringify(S.eg)===snapshot'),'endgame archive idempotent');
ok(G('S.eg.history.secret.runs===7&&S.eg.history.secret.king===3&&S.eg.history.secret.staff[2]===1&&S.eg.history.rift.keys===17&&S.eg.history.ach.x1===123&&S.eg.lp.arch.old===1&&S.eg.season.n===3&&S.eg.codex.u.old===1'),'all old progress and collection retained');
G(`S.bon={life:20,res:30};S.sockq=3;delete S.cqMetaRewardsV1;S.Q[0].a5q1=1;var oldGold=S.gold;cqMetaRewards();var rewardSnapshot=JSON.stringify({bon:S.bon,gold:S.gold,h:S.cqMetaHistory});cqMetaRewards()`);
ok(G('rewardSnapshot===JSON.stringify({bon:S.bon,gold:S.gold,h:S.cqMetaHistory})'),'quest compensation idempotent');
ok(G('S.bon.def===120&&S.bon.mdef===120&&S.bon.attack===30&&!S.bon.res&&!S.sockq&&S.cqMetaHistory.bonRes===30&&S.gold===oldGold+15000'),'legacy rewards archived and fixed rewards granted');
G(`S.q=S.Q[0];var beforeGold=S.gold;questDone('a5q1')`);
ok(G('S.gold===beforeGold'),'claimed quest not reissued');
G(`delete S.q.a5q3;delete S.cqQuestReward['0_a5q3'];questDone('a5q3');var beforeDef=S.bon.def;questDone('a5q3')`);
ok(G('S.bon.def===beforeDef&&beforeDef===130'),'new fixed quest reward issued once');
G('calc()');
ok(G('ST.def>0&&Object.values(ST.res).every(x=>x===0)'),'combat no longer uses player elemental resistance');
for(const cls of ['zs','fs','ds']){
 G(`CQSys.createChar('短战斗${cls}','${cls}');S.lvl=60;calc();var m=mkMon('orclord',60);m.res={fire:1000,phys:1000};var a=resOf(m,'fire');m.cur={id:'lr',until:GT+100,x:1000};var b=resOf(m,'fire');var hp=m.hp;hitMon(m,{phys:100,fire:100},'player')`);
 ok(G('a===b&&a<100&&m.hp<hp'),cls+' damages boss without immunity or resistance reduction');
}
G(`GS.setItem('cq_eg_rank','[{"t":25,"s":30,"se":"纪元"}]')`);
ok(G("GS.keys().every(k=>!k.startsWith('cq_'))&&egRank()[0].t===25&&!egRankHistory().includes('纪元')"),'old cloud keys canonicalized; history omits old era column');
G(`localStorage.setItem('cq_bonus_open','1');var oldPref=cqRead(localStorage,'cq-bonus_open')`);
ok(G("oldPref==='1'&&localStorage.getItem('cq-bonus_open')==='1'"),'old preference migrates forward');
G(`EG_ACV='cx';var codexHtml=egAchPage()`);
ok(G("!/全抗|寻宝|经验 \+|暗金/.test(codexHtml)"),'codex only advertises approved rewards');
// SW activation must leave unrelated games alone, preserving V.
let activate;const deleted=[];const c={self:{addEventListener(k,f){if(k==='activate')activate=f},clients:{claim(){}}},caches:{keys:async()=>['cq-20261021z','cq-old','anye-old','other'],delete:async k=>deleted.push(k)}};vm.runInNewContext(fs.readFileSync('sw.js','utf8'),c);
(async()=>{
 await new Promise((resolve,reject)=>activate({waitUntil:p=>p.then(resolve,reject)}));
 ok(deleted.length===1&&deleted[0]==='cq-old'&&c.V==='cq-20261021z','SW deletes only its own obsolete caches');
 G(fs.readFileSync('cloud.js','utf8'));
 G(`localStorage.setItem('cq_sb_auth','old-token');CL_IDB.get=async()=>null;CL_IDB.set=async()=>null;CL_IDB.del=async()=>null`);
 ok(await G("CL_STORE.getItem('cq-sb_auth')")==='old-token','old local session restored');
 await G("CL_STORE.removeItem('cq-sb_auth')");
 ok(await G("CL_STORE.getItem('cq-sb_auth')")==null,'signout cannot resurrect legacy session');
 G(`CL_IDB.get=async k=>k==='cq_sb_auth'?'idb-token':null`);
 ok(await G("CL_STORE.getItem('cq-sb_auth')")==='idb-token','legacy IndexedDB session restored');
 T.done();
})().catch(e=>{console.error(e);process.exitCode=1});
