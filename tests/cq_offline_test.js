// 离线收益领取 / 元宝双倍：node tests/cq_offline_test.js
const T=require('./cq_harness')('cq_offline_test');const{G,ok}=T;
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc();S.lvl=15;S.xp=xpNeed(15);calc();S.kpm=6;ACCT.yb=0`);
const st=()=>JSON.parse(G('JSON.stringify(CQSys.offline.state())'));const cl=d=>JSON.parse(G(`JSON.stringify(CQSys.offline.claim(${d}))`));
ok(!st().has,'无离线结算时 has=false');ok(cl(false).ok===false,'无结算不能领');
G(`S.last=Date.now()-3*3600e3-5e3;offline()`);let s=st();ok(s.has&&s.gold>0&&s.xp>0&&s.capSec>=3*3600,'离线 3h 结算：金币 '+s.gold+' 经验 '+s.xp);
ok(s.ybCost===40&&s.capH===8,'双倍费用 每(不足)1 小时 10 元宝：3h 余 5 秒 = 40');
G('var g0=S.gold,x0=S.xp');let r=cl(true);ok(!r.ok&&r.reason==='元宝不足'&&G('S.gold')===G('g0')&&G('S.xp')===G('x0')&&G('ACCT.yb')===0,'元宝不足：失败且不消耗');
ok(st().has,'失败后仍可领');
G('ACCT.yb=100');r=cl(true);ok(r.ok&&r.double&&G('ACCT.yb')===60&&G('S.gold-g0')===s.gold&&G('S.xp-x0')===s.xp,'元宝双倍：扣 40 元宝，金币/经验再 +1 份');
r=cl(true);ok(!r.ok&&r.reason==='本次离线收益已领取'&&G('ACCT.yb')===60,'同一次离线只能领一次');
G(`S.last=Date.now()-20*3600e3;offline()`);s=st();ok(s.has&&s.capSec===8*3600&&s.ybCost===80,'封顶 8 小时，费用 80');
G('var g1=S.gold,y1=ACCT.yb');r=cl(false);ok(r.ok&&!r.double&&G('S.gold')===G('g1')&&G('ACCT.yb')===G('y1'),'普通领取：不扣元宝、不加倍');ok(!st().has,'领取后 has=false');
// 迁移：旧存档 cqOff 无 claimed → 视为已领
G(`S.cqOff={sec:100,capSec:100,gold:5,items:[],boss:[]};S.sv=3;cqMigrate()`);ok(G('S.sv')===G('CQ_SV')&&G('S.cqOff.claimed')===1&&!st().has,'迁移 v4：旧离线结算视为已领取');
T.done();
