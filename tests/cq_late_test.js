// late.js 传奇化（late_mods.js 已删除）：node tests/cq_late_test.js
const T=require('./cq_harness')('cq_late_test');const{G,ok}=T;
G(`S=newSave();load();calc()`);
ok(G(`['zs','fs','ds'].every(c=>LATE_MAIN[c]&&LATE_K[c]&&LATE_SHARE[c])`),'LATE_MAIN/LATE_K/LATE_SHARE 有 zs/fs/ds');
ok(G(`LATE_MAIN.zs[0]`)==='str'&&G(`LATE_MAIN.fs[0]`)==='ene'&&G(`LATE_MAIN.ds[0]`)==='ene','主属性：战士力量、法道精力');
ok(G(`typeof XMOD`)==='undefined'&&!G(`CLS_SKILLS.some(s=>/^x[nsbdap]_/.test(s.id))`),'D2 60/75 级魔改技能已删除');
ok(!G(`CLS_SKILLS.some(s=>s.r===60||s.r===75)`),'无 60/75 级技能残留');
// 自动成长（auto_growth_plan）：不再加点，S.at = 职业×等级推导；残余属性点折金币
for(const c of ['zs','fs','ds']){G(`CQSys.createChar('t','${c}');calc();window._a0=JSON.stringify(S.at);S.lvl=20;S.sp=40;calc();autoTick(0.1)`);
 const a0=JSON.parse(G('_a0')),a1=JSON.parse(G('JSON.stringify(S.at)'));const k=G(`LATE_MAIN.${c}[0]`);
 ok(G('S.sp')===0&&a1[k]>a0[k]&&a1[k]===G(`agAutoAt('${c}',20).${k}`),`${c} 主属性 ${k} 随等级自动成长: ${a0[k]}→${a1[k]}`)}
// 旧存档：已删除技能 id 退还技能点；mcast 词缀不显示不报错
G(`CQSys.createChar('t','zs');calc();window._kp=S.kp;S.sk.xzs_boom=3;S.skPr=0;calc()`);
ok(G('S.sk.xzs_boom')===undefined&&G('S.kp')===G('_kp')+3,'已删除技能 xzs_boom 退还 3 技能点');
ok(!/mcast|连发/.test(G(`modsTxt({mcast:2,str:5})`)),'旧 mcast 词缀忽略');
T.done();
