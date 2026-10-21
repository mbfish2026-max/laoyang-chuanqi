// 七日签到：node tests/cq_signin_test.js
const T=require('./cq_harness')('cq_signin_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.includes('fuli')),'fuli_cq 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc();S.lvl=20;calc();(ACCT||S).cqSign={n:0,last:''};ACCT.yb=0;window.__T=new Date(2026,9,21,10,0,0).getTime();CQSys._now=()=>__T`);
const st=()=>JSON.parse(G('JSON.stringify(CQSys.signin.state())'));const cl=()=>JSON.parse(G('JSON.stringify(CQSys.signin.claim())'));
let s=st();ok(s.canClaim&&s.day===1&&s.signed===0&&s.days.length===7&&s.days[0].state==='now','初始：第 1 天可签');
ok(G('CQ_SIGN_RW.map(r=>r.name).join()')==='元宝×20,金创药×5,技能书页,太阳水×5,金币×5千,元宝×50,极品戒指','奖励与设计稿一致');
let r=cl();ok(r.ok&&r.day===1&&G('ACCT.yb')===20,'第 1 天：元宝 +20');
r=cl();ok(!r.ok&&r.reason==='今日已签到'&&G('ACCT.yb')===20,'同日不能重复签');
s=st();ok(s.claimedToday&&s.signed===1&&s.days[0].state==='ok','已签 1/7');
G('__T+=86400e3;var hp0=S.pot.hp');r=cl();ok(r.day===2&&G('S.pot.hp-hp0')===5,'第 2 天：金创药 ×5');
G('__T+=3*86400e3');r=cl();ok(r.day===3&&/^技能书·/.test(r.reward.name)&&r.reward.book,'断签 2 天不清零：第 3 天 技能书 '+r.reward.name);
G('__T+=86400e3;var rj=S.pot.rej');r=cl();ok(r.day===4&&G('S.pot.rej-rj')===5,'第 4 天：太阳水 ×5');
G('__T+=86400e3;var g0=S.gold');r=cl();ok(r.day===5&&G('S.gold-g0')===5000,'第 5 天：金币 5000');
G('__T+=86400e3');r=cl();ok(r.day===6&&G('ACCT.yb')===70,'第 6 天：元宝 +50');
G('__T+=86400e3;var b0=S.bag.length');r=cl();ok(r.day===7&&r.reward.item&&r.reward.item.q===5&&G('S.bag.length')===G('b0')+1,'第 7 天：极品戒指 '+(r.reward.item&&r.reward.item.name));
ok(G(`canEquip(S.bag[S.bag.length-1])`),'极品戒指当前等级可穿');
s=st();ok(s.signed===7&&s.days.every(d=>d.state==='ok'),'7/7');
G('__T+=86400e3');s=st();ok(s.day===1&&s.signed===0&&s.canClaim,'第 8 天回到第 1 天');r=cl();ok(r.day===1&&G('ACCT.yb')===90,'循环第 1 天元宝');
// 跨日按本地自然日：23:59 签，次日 00:01 可签
G('__T=new Date(2026,10,1,23,59,0).getTime()');cl();G('__T=new Date(2026,10,2,0,1,0).getTime()');ok(st().canClaim,'本地自然日 0 点后可签');
ok(G('!!ACCT.cqSign')&&G('S.cqSign===undefined'),'签到记录在账号级 ACCT.cqSign');
T.done();
