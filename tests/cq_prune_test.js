// 旧模块清理（legacy_prune 批次 1）：旧存档含 威能/纪元 等字段可正常载入、字段不丢、纪元角色转普通。node tests/cq_prune_test.js
const T=require('./cq_harness')('cq_prune_test');const{G,ok}=T;
ok(!T.loadErr.filter(e=>!/MutationObserver/.test(e)).length,'载入无错 '+T.loadErr.join(';'));// bagux.js 的 MutationObserver 是 node 环境缺失，HEAD 也一样
for(const n of['egLpApply','egLpExtract','egSeasonOn','RES_CAP_EFF','grpPre','EG_LP','EG_SEASON','artClsIconUrl'])ok(G(`typeof ${n}`)==='undefined',n+' 已移除');
ok(!G(`EG_PAGES.some(p=>p.k==='power'||p.k==='season')`),'「更多」不再有 威能 / 纪元 页');
ok(G(`EG_PAGES.some(p=>p.k==='bounty')&&EG_PAGES.some(p=>p.k==='ach')&&EG_PAGES.some(p=>p.k==='event')`),'悬赏/功业/事件 保留');
// 构造旧存档：纪元角色、带威能字段与传说物品
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc();
 const it=genItem(10,{q:5});it.lp='bs_split';S.bag.push(it);window.__uid=it.uid;
 EG().lp={arch:{bs_split:1,legion:1},cube:{w:'bs_split',a:null,j:null}};EG().season={id:1,n:'第一纪元·灰烬之潮',lv:3,done:{a:1}};S.mode='season';
 const c=curChar();c.mode='season';save();acctSave();window.__raw=GS.getItem(CH_PRE+ACCT.cur)`);
ok(/"season"/.test(G('__raw')),'旧存档确实含纪元字段');
G(`ACCT=null;resetRuntime();acctLoad();load();calc()`);
ok(G('S.mode')==='normal'&&G('curChar().mode')==='normal','纪元角色转为普通角色（存档与账号列表）');
ok(G('S.cqSeasonOld')===1,'标记 cqSeasonOld 便于追溯');
ok(G(`JSON.stringify(S.eg.lp.arch)`)==='{"bs_split":1,"legion":1}'&&G(`S.eg.lp.cube.w`)==='bs_split','S.eg.lp 原样保留（不丢数据）');
ok(G(`S.eg.season&&S.eg.season.lv`)===3,'S.eg.season 原样保留');
ok(G(`S.bag.some(x=>x.uid===__uid&&x.lp==='bs_split')`),'带 it.lp 的旧物品保留');
G(`TAB='eg';try{render()}catch(e){window.__re=e.message}`);ok(!G('window.__re'),'终局/福利页渲染不报错');
G(`for(let i=0;i<200;i++)step(0.05);autoTick()`);ok(G('S.lvl')>=1,'战斗循环正常');
T.done();
