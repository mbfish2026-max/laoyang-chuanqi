// 存档版本迁移测试：node tests/cq_migrate_test.js
const T=require('./cq_harness')('cq_migrate_test');const{G,ok}=T;
ok(G('newSave().sv')===G('CQ_SV')&&G('CQ_SV')>=1,'新存档带 sv');
// 构造 fork 前（暗夜结构 sv 缺失）的旧存档
G(`S=newSave();load();delete S.sv;S.gold=0;S.lvl=70;
 S.bag=[{uid:900,k:'rune',r:5},{uid:901,k:'gem',g:'rub',lv:2},{uid:902,b:'arme2',q:5,m:{},name:'D2 暗金'},Object.assign(genItem(8,{q:3}),{uid:903,sock:2,soc:[{r:1}],rw:3})];
 S.eq.helm={uid:904,b:'circ1',q:4,m:{}};S.pst=[[{uid:905,k:'rune',r:0}],[]];
 GS.setItem(KEY,JSON.stringify(S));GS.setItem(CH_PRE+ACCT.cur,JSON.stringify(S));load()`);
ok(G('S.sv')===G('CQ_SV'),'载入后升级到当前版本');
ok(G("S.bag.every(x=>x.k!=='rune'&&x.k!=='gem')")&&G("S.pst.flat().every(x=>x.k!=='rune')"),'符文/宝石已移除');
ok(G("S.bag.some(x=>x.uid===902&&x.cqUnknown)&&S.eq.helm.uid===904&&!!S.eq.helm.cqUnknown"),'未知旧底材保留 uid 和原始快照');
const it=JSON.parse(G("JSON.stringify(S.bag.find(x=>x.uid===903))"));ok(it&&it.sock===0&&it.soc.length===0&&it.rw==null&&it.en===0,'凹槽/符文之语清空，补 en=0');
ok(G('S.gold')===G('S.cqMigGold')&&G('S.gold')===50*6+20*3+50,'折算金币 '+G('S.gold'));
ok(G('S.lvl')===60,'等级压到上限 60');
ok(G('ACCT.sv')===1&&G('ACCT.shN')===2,'账号层 sv 与共享仓库页数');
// 幂等：再载入不再改动
G(`S.gold=123;save();load()`);ok(G('S.gold')===123,'迁移幂等');
// 不触碰暗夜数据：迁移只读取 cq_ 键
ok(G("KEY")==='cq_save_v2'&&G("ACCT_KEY").startsWith('cq_')&&G("CH_PRE").startsWith('cq_'),'存档键均为 cq_ 前缀');
T.done();
