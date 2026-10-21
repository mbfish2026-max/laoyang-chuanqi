// late.js / late_mods.js 传奇化：node tests/cq_late_test.js
const T=require('./cq_harness')('cq_late_test');const{G,ok}=T;
G(`S=newSave();load();calc()`);
ok(G(`['zs','fs','ds'].every(c=>LATE_MAIN[c]&&LATE_K[c]&&LATE_SHARE[c])`),'LATE_MAIN/LATE_K/LATE_SHARE 有 zs/fs/ds');
ok(G(`LATE_MAIN.zs[0]`)==='str'&&G(`LATE_MAIN.fs[0]`)==='ene'&&G(`LATE_MAIN.ds[0]`)==='ene','主属性：战士力量、法道精力');
ok(G(`XMOD.list.length`)===0&&!G(`CLS_SKILLS.some(s=>/^x[nsbdap]_/.test(s.id))`),'D2 60/75 级魔改技能已删除');
ok(!G(`CLS_SKILLS.some(s=>s.r===60||s.r===75)`),'无 60/75 级技能残留');
for(const c of ['zs','fs','ds']){G(`CQSys.createChar('t','${c}');calc();S.lvl=20;S.sp=40;S.autoAt=1;calc();window._a0=JSON.stringify(S.at);autoTick(0.1)`);
 const a0=JSON.parse(G('_a0')),a1=JSON.parse(G('JSON.stringify(S.at)'));const k=G(`LATE_MAIN.${c}[0]`);
 ok(G('S.sp')===0&&a1[k]>a0[k],`${c} 自动加点用完属性点且加主属性 ${k}: ${a0[k]}→${a1[k]}`)}
T.done();
