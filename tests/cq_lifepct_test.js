// 职业生命加成 CLS_DEF[c].lifePct 生效：node tests/cq_lifepct_test.js
const T=require('./cq_harness')('cq_lifepct_test');const{G,ok}=T;
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc()`);
ok(G('CLS_DEF.zs.lifePct')===50,'战士 lifePct=50');const a=G('ST.life');G('CLS_DEF.zs.lifePct=0;calc()');const b=G('ST.life');
ok(Math.abs(a-Math.round(b*1.5))<=1,`lifePct 50% 作用于最大生命 ${b}→${a}`);G('CLS_DEF.zs.lifePct=50;calc()');
for(const c of['fs','ds'])ok(!G(`CLS_DEF.${c}.lifePct`),c+' 无 lifePct');
T.done();
