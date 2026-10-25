// combat_guard.js：防御/魔御计算、原地挂机 45 秒无进展刷新本波。node tests/cq_guard_test.js
const T=require('./cq_harness')('cq_guard_test');const{G,ok}=T;
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();calc();H.life=ST.life;TAB='fight'`);
G(`window.M=mkMon(ACTS[0].zones[1].mons[0],10);M.res.fire=120;M.res.cold=100;M.res.light=50`);
G("M.mdef=100;var oldGuard=resOf(M,'fire');M.res.fire=0;M.res.cold=1000;M.cur={id:'lr',until:GT+5,x:1000}");
ok(G("resOf(M,'fire')===oldGuard&&resOf(M,'cold')===oldGuard&&oldGuard>0&&oldGuard<100"),'元素旧表与降抗不影响魔御');
G('M.def=200');ok(G("resOf(M,'phys')>oldGuard"),'物理防护使用防御');
// 直接驱动 stuckTick：原地挂机，怪不掉血、无击杀
G(`{S.auto=0;EGM=null;const m=mkMon(ACTS[0].zones[1].mons[0],10);MON=[m];ACX.st=0;ACX.k0=S.kills;ACX.mh=undefined;CG.n=0}`);
for(let i=0;i<44;i++)G('stuckTick(1)');ok(G('MON.length')===1&&G('CG.n')===0,'44 秒内不处理');
for(let i=0;i<3;i++)G('stuckTick(1)');ok(G('CG.n')===1&&G('MON.length')===0&&G('spawnT')===0.5,'超过 45 秒无进展：清波并 0.5 秒后刷新');
// 有进展（怪掉血）不触发
G(`{const m=mkMon(ACTS[0].zones[1].mons[0],10);m.hp=m.max;MON=[m];ACX.st=0;ACX.mh=undefined;CG.n=0}`);
for(let i=0;i<100;i++)G('MON[0].hp-=MON[0].max*0.006;stuckTick(1)');ok(G('CG.n')===0,'持续掉血不触发');
// 自动推进时交给 acts.js 原逻辑（300 秒撤退），本保底不动
G(`{S.auto=1;const m=mkMon(ACTS[0].zones[1].mons[0],10);MON=[m];ACX.st=0;ACX.mh=undefined;CG.n=0}`);for(let i=0;i<60;i++)G('stuckTick(1)');ok(G('CG.n')===0&&G('MON.length')===1,'自动推进时不介入');
// 真实战斗循环：打不死的怪（血量极高）原地挂机约 50 秒后刷新
G(`{S.auto=0;const m=mkMon(ACTS[0].zones[1].mons[0],10);m.hp=m.max=1e13;MON=[m];ACX.st=0;ACX.mh=undefined;CG.n=0}`);
for(let i=0;i<1000;i++)G('step(0.05)');ok(G('CG.n')>=1,'战斗循环内生效 n='+G('CG.n'));ok(G('!MON.some(x=>x.max===1e13)'),'卡住的那波已换掉');
T.done();
