// 强化 +1~+9 测试：node tests/cq_enh_test.js
const T=require('./cq_harness')('cq_enh_test');const{G,ok}=T;
G(`S=newSave();load();S.lvl=20;calc();S.gold=1e9;addMat('heitie',500);addMat('zhufu',20);var w=S.eq.weapon;var a=S.eq.armor;`);
ok(G('JSON.stringify(CQ_BAL.enh.rate)')==='[100,90,80,65,50,40,30,20,12]','成功率表');
ok(G('[0,1,2,3,4,5,6,7,8].map(cqEnhFail).join()')==='0,1,2,2,3,4,6,6,6','失败结果：+1~3 无损 / +4~6 掉 1 / +7~9 回 +6');
const g0=G('S.gold'),o0=G("matCount('heitie')");
let r=JSON.parse(G(`JSON.stringify(cqEnhance(w.uid,{roll:0}))`));ok(r.ok&&r.to===1&&G('w.en')===1,'+0→+1 成功');
ok(g0-G('S.gold')===500&&o0-G("matCount('heitie')")===1,'花费 500 金 + 1 黑铁矿');
ok(G("itemName(w)").endsWith(' +1'),'名称显示 +1');
G('w.en=3');r=JSON.parse(G(`JSON.stringify(cqEnhance(w.uid,{roll:99}))`));ok(!r.ok&&r.to===2&&r.res==='fail','+3→+4 失败掉到 +2');
G('w.en=7');r=JSON.parse(G(`JSON.stringify(cqEnhance(w.uid,{roll:99}))`));ok(r.to===6&&G('!!S.eq.weapon'),'+7→+8 失败回 +6，装备仍在（不碎）');
G('w.en=8');const z0=G("matCount('zhufu')");r=JSON.parse(G(`JSON.stringify(cqEnhance(w.uid,{roll:99,oil:1}))`));ok(r.to===8&&r.res==='keep'&&z0-G("matCount('zhufu')")===1,'祝福油：失败不掉级，消耗 1 瓶');
r=JSON.parse(G(`JSON.stringify(cqEnhance(w.uid,{roll:0}))`));ok(r.to===9&&G('w.en9')===1,'+8→+9 成功，标记 +9 光芒');
ok(/已强化/.test(G(`cqEnhance(w.uid,{roll:0}).err`)),'+9 封顶');
const base=JSON.parse(G(`JSON.stringify(itemLocal(Object.assign({},a,{en:0})))`)).def,nine=JSON.parse(G(`JSON.stringify(itemLocal(Object.assign({},a,{en:9})))`)).def;
ok(nine===Math.round(base*1.54),'防御 +9 = ×1.54：'+base+'→'+nine);
const wmax0=G(`itemLocal(Object.assign({},w,{en:0})).max`),wmax9=G(`itemLocal(w).max`);ok(wmax9>wmax0,'攻击随强化提升');
ok(G(`(()=>{const p0=power(Object.assign({},w,{en:0}));return power(w)>p0})()`),'战力随强化提升');
// 材料不足
G(`S.gold=0;a.en=0`);ok(G(`cqEnhance(a.uid,{roll:0}).err`)==='金币不足','金币不足拦截');
G(`S.gold=1e9;cqTakeMat('heitie',matCount('heitie'))`);ok(G(`cqEnhance(a.uid,{roll:0}).err`)==='黑铁矿不足','黑铁矿不足拦截');
// 统计：+0→+9 的期望尝试次数（无祝福油），供数值参考
const tries=G(`(()=>{let t=0;for(let k=0;k<200;k++){const it={en:0};while(it.en<9){t++;const n=it.en;it.en=rnd()*100<cqEnhRate(n)?n+1:cqEnhFail(n)}}return t/200})()`);
ok(tries>20&&tries<400,'+0→+9 平均尝试 '+tries.toFixed(1)+' 次');console.log('  +0→+9 平均尝试次数 '+tries.toFixed(1));
T.done();
