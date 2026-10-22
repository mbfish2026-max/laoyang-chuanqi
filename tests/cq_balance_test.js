// 数值框架：node tests/cq_balance_test.js
const T=require('./cq_harness')('cq_balance_test');const{G,ok}=T;
ok(G('CQ_BAL.budget.hero')===0.25,'budget.hero = 25%');
ok(Math.abs(G('cqBudgetProduct()')-1.35*1.15*1.1*1.05*1.1*1.05)<1e-9,'英雄项不进战力连乘');
ok(G('cqHeroShareOk(150,50,1000)')===true&&G('cqHeroShareOk(150,101,1000)')===false,'英雄普攻+合击 ≤ 25% 判定');
ok(Math.abs(G('cqHeroDmgCap(800)')-800/3)<1e-9,'本体 800 → 英雄上限 800/3（英雄/总伤=25%）');
ok(G('cqHeroShare(0,0,0)')===0,'无伤害时占比 0');
// 系统侧强制：hitMon 对 cqhero/cqheji 按 30 秒窗口截断到 25%
G(`S=newSave();load();S.lvl=30;calc();CQSys._heroReset();MON.length=0;window._m={hp:1e9,max:1e9,res:{},def:0,lv:30,key:'deer'};MON.push(_m)`);
G(`for(let i=0;i<20;i++)hitMon(_m,{phys:100},'player')`);const p1=JSON.parse(G('JSON.stringify(CQSys.heroShare())'));
G(`for(let i=0;i<50;i++){hitMon(_m,{phys:200},'cqhero');hitMon(_m,{phys:300},'cqheji')}`);const sh=JSON.parse(G('JSON.stringify(CQSys.heroShare())'));
ok(p1.player>0&&sh.hero>0,'窗口记账 '+JSON.stringify(sh));
ok(sh.share<=0.25+1/(sh.player+sh.hero),'英雄普攻+合击实际占比 '+sh.share.toFixed(4)+' ≤ 25%');
ok(sh.share>0.24,'上限内不被多砍（占比贴近 25%）');
// ---- 实际伤害封顶 CQ_BAL.cap / cq/cap_cq.js
ok(G('CQ_BAL.capMul')===1.8&&G('typeof CQ_BAL.cap')==='function','CQ_BAL.cap 加载即定义');
ok(G('CQ_BAL.cap(300,{base:100})')===180&&G('CQ_BAL.cap(150,{base:100})')===150,'cap：有 base → ≤ base×1.8');
ok(Math.abs(G('CQ_BAL.cap(260,{mul:2.6})')-180)<1e-9&&G('CQ_BAL.cap(100,{mul:1.5})')===100,'cap：有 mul → 按比例压到 1.8');
ok(G('CQ_BAL.cap(100)')===100&&G('CQ_BAL.cap(0,{})')===0,'cap：ctx 缺字段兼容');
// 实测：同一怪同一原始伤害，叠满强化 +9 / 至臻 / 淬锋 10 次 / 转生 10 / 高力量（late.js 加伤），最终结算倍率 ≤ 1.8
function hitWith(on){return G(`(()=>{S=newSave();load();S.cls='zs';S.lvl=60;calc();const w=S.eq.weapon;w.en=${on?9:0};w.anc=${on?2:0};w.rf=${on?'{n:10}':'null'};S.reb=${on?10:0};S.at.str=${on?600:30};calc();
 CQSys._heroReset&&CQSys._heroReset();MON.length=0;const m={hp:1e12,max:1e12,res:{},def:0,lv:1,key:'deer',n:'鹿'};MON.push(m);ST.dsx=0;const r=hitMon(m,{phys:1000},'hero');return JSON.stringify({r,last:CQ_BAL.capLast(),late:typeof lateMul==='function'?lateMul():1})})()`)}
const base=JSON.parse(hitWith(false)),full=JSON.parse(hitWith(true));
const ratio=full.r/base.r;ok(base.r>0&&full.last.mul>1.8&&full.last.capped,'叠满后未封顶倍率 '+full.last.mul.toFixed(2)+'（>1.8）');
ok(ratio<=1.8+1e-6,'实际结算倍率 '+ratio.toFixed(3)+' ≤ 1.8');
const hb=G(`(()=>{const m=MON[0];return hitMon(m,{phys:1000},'cqhero')})()`);ok(hb/base.r<=1.8*1.0001,'英雄伤害同样封顶 '+(hb/base.r).toFixed(3));
T.done();
