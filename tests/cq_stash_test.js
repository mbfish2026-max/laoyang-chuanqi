// 个人/共享仓库测试：node tests/cq_stash_test.js
const T=require('./cq_harness')('cq_stash_test');const{G,ok}=T;
G(`S=newSave();load();S.lvl=20;calc();S.gold=1e9`);
ok(G('S.pst.length')===2&&G('S.pstN')===2,'个人仓库初始 2 页');ok(G('ACCT.shared.length')===2&&G('ACCT.shN')===2,'共享仓库初始 2 页');
ok(G('PAGE_SZ')===48,'每页 48 格');
let c=JSON.parse(G(`JSON.stringify(cqStashCost('p'))`));ok(c.gold===900000&&c.ckq===0&&c.page===3,'个人第 3 页 = 10 万×3² = 90 万');
ok(G(`cqStashExpand('p').ok`)===true&&G('S.pst.length')===3&&G('S.pstN')===3,'个人扩容 → 3 页');
G(`while(cqStashExpand('p').ok);`);ok(G('S.pstN')===6&&G(`cqStashCost('p')`)===null,'个人最多 6 页');
c=JSON.parse(G(`JSON.stringify(cqStashCost('s'))`));ok(c.gold===1500000&&c.ckq===1,'共享第 3 页 = 扩充券 + 50 万×3');
ok(G(`cqStashExpand('s').err`)==='需要仓库扩充券','无扩充券不能扩共享');
G(`addMat('ckq',10)`);ok(G(`cqStashExpand('s').ok`)&&G('ACCT.shN')===3&&G("matCount('ckq')")===9,'扩充券扩共享 → 3 页');
G(`while(cqStashExpand('s').ok);`);ok(G('ACCT.shN')===8&&G('ACCT.shared.length')===8,'共享最多 8 页');
// 绑定/任务物品不可进共享
G(`var b=genItem(10,{q:3});b.bind=1;S.bag.push(b);var q=genItem(10,{q:3});q.quest=1;S.bag.push(q);var n=genItem(10,{q:3});S.bag.push(n)`);
ok(G(`depositUid(b.uid,'s')`)===false&&G(`depositUid(q.uid,'s')`)===false,'绑定/任务物品不能存共享');
ok(G(`depositUid(n.uid,'s')`)!==false&&G(`ACCT.shared.flat().some(x=>x.uid===n.uid)`),'普通物品可存共享');
ok(G(`depositUid(b.uid,'p')`)!==false,'绑定物品可存个人仓库');
ok(G(`stashToStash(b.uid)`)===false,'个人→共享 也拦截绑定物品');
// 职业筛选
const cls=G(`[cqItemCls(genItem(20,{base:BASEM.wand1})),cqItemCls(genItem(20,{base:BASEM.wand2})),cqItemCls(genItem(30,{base:BASEM.swd8})),cqItemCls(genItem(5,{base:BASEM.swd1}))].join()`);
ok(cls==='fs,ds,zs,','职业判定 海魂=法 偃月=道 炼狱=战 木剑=通用：'+cls);
ok(G(`cqClsMatch(genItem(20,{base:BASEM.wand1}),'fs')&&!cqClsMatch(genItem(20,{base:BASEM.wand1}),'zs')&&cqClsMatch(genItem(5,{base:BASEM.swd1}),'none')&&cqClsMatch(genItem(5,{base:BASEM.swd1}),'all')`),'筛选芯片 全部/战/法/道/通用');
G(`STV='shared';STF.c='fs'`);ok(G(`stMatch({it:genItem(20,{base:BASEM.wand1})})`)&&!G(`stMatch({it:genItem(5,{base:BASEM.swd1})})`),'共享仓库 stMatch 叠加职业筛选');G(`STV='bag';STF.c='all'`);
// 旧存档 20 页 → 压缩
G(`S.pst=Array.from({length:20},()=>[]);for(let i=0;i<10;i++)S.pst[15].push(genItem(5,{q:3}));S.pstN=2;cqStashNorm()`);ok(G('S.pst.length')===2&&G('S.pst.flat().length')===10,'旧 20 页存档压缩到 2 页且不丢物品');
G(`S.pst=Array.from({length:20},()=>Array.from({length:48},()=>genItem(5,{q:3})));S.pstN=2;cqStashNorm()`);ok(G('S.pst.flat().length')===960&&G('S.pstN')===20,'装不下时保留原页数，绝不丢物品');
T.done();
