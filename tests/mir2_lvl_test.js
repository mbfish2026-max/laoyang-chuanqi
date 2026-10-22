'use strict';
const T=require('./cq_harness')('mir2_lvl_test'),{G,ok}=T;
G("load();CQSys.createChar('等级验证','zs');S.auto=0");
ok(G('xpNeed(2)-xpNeed(1)===100&&xpNeed(51)-xpNeed(50)===4200000000'),'原表与累计接口');
ok(G('Array.from({length:60},(_,i)=>xpNeed(i+2)>xpNeed(i+1)).every(Boolean)'),'1–61 累计经验递增');
for(const c of ['zs','fs','ds']){
 G(`CQSys.createChar('迁移${c}','${c}');S.lvl=70;S.xp=cqOldXp(70);delete S.cqProgress;var before=cqRawAutoAt('${c}',70);cqProgressMigrate();calc()`);
 ok(G('S.lvl===55&&AG_K.every(k=>S.at[k]>=before[k])'),c+' 旧成长不降低');
 G('var snap=JSON.stringify([S.lvl,S.xp,S.atb]);cqProgressMigrate();calc()');
 ok(G('JSON.stringify([S.lvl,S.xp,S.atb])===snap'),c+' 迁移幂等');
 G('S.lvl=60;S.xp=xpNeed(60);S.reb=0;S.rebXp=0;calc();var growth=JSON.stringify(S.at);calc()');
 ok(G('JSON.stringify(S.at)===growth'),c+' calc 不重复压缩');
 G('gainXp(cqRebNeed(0));var gear=JSON.stringify(S.eq);var at0=Object.assign({},S.atb);var result=CQSys.rebirth()');
 ok(G('result.ok&&S.lvl===60&&S.reb===1&&S.rebXp===0&&JSON.stringify(S.eq)===gear'),c+' 满级经验转生且保留装备');
 ok(G(`S.atb.vit===(at0.vit||0)+1&&S.atb.${c==='zs'?'str':'ene'}===(at0.${c==='zs'?'str':'ene'}||0)+1&&!S.sp&&!S.kp`),c+' 固定属性无点数');
}
const legacy=require('./cq_harness')('legacy_reference',{exclude:['cq/mir2_progression.js']});
for(const c of ['zs','fs','ds'])for(const lv of [50,51,60,70,85,99]){
 legacy.G(`load();CQSys.createChar('成长对照','${c}');S.lvl=${lv};calc()`);
 const before=JSON.parse(legacy.G('JSON.stringify({life:ST.life,mana:ST.mana,ar:ST.ar,wmin:ST.wmin,wmax:ST.wmax})'));
 G(`CQSys.createChar('成长迁移','${c}');S.lvl=${lv};S.xp=cqOldXp(${lv});delete S.cqProgress;cqProgressMigrate();calc()`);
 ok(Object.entries(before).every(([k,v])=>G('ST.'+k)>=v),`${c} 旧${lv}级面板生命/法力/准确/攻击不降低`);
}
G("CQSys.createChar('英雄迁移','zs');S.lvl=70;CQSys.heroCreate('fs');S.hero.lvl=70;S.hero.xp=cqOldXp(70)+(cqOldXp(71)-cqOldXp(70))/2;delete S.cqProgress;cqProgressMigrate()");
ok(G('S.hero.lvl===55&&Math.abs((S.hero.xp-xpNeed(55))/(xpNeed(56)-xpNeed(55))-.5)<1e-8'),'旧英雄等级与经验进度同步迁移');
G("CQSys.createChar('英雄追级','zs');S.lvl=60;CQSys.heroCreate('fs');S.hero.lvl=1;S.hero.xp=0;gainXp(xpNeed(22))");
ok(G('S.hero.lvl>=22&&S.lvl===60'),'主角满级后英雄继续追级');
for(let d=0;d<3;d++)for(let a=0;a<7;a++)ok(G(`Math.max(...ACTS[${a}].zones.map(z=>mlD(z.ml0,${d})))-gateOf(${a},${d})<=60`),`难度${d}章节${a+1}门槛可达`);
for(const [cls,ratio] of [['fs',2.5],['ds',2.2]]){
 G(`CQSys.createChar('后段清怪','${cls}');S.lvl=60;calc();var normal=mkMon(ACTS[0].zones[0].mons[0],1);normal.hp=normal.max=1e9;normal.res={};var boss=Object.assign({},normal,{boss:1,actboss:1});var trashDamage=hitMon(normal,{magic:1000},'player'),bossDamage=hitMon(boss,{magic:1000},'player')`);
 ok(Math.abs(G('trashDamage/bossDamage')-ratio)<.001,cls+' 后段仅补强清怪，不改变首领伤害');
}
G('S.reb=0;var rebPower0=CQSys.power();S.reb=10;var rebPower10=CQSys.power()');
ok(G('rebPower10<=rebPower0*1.1+1'),'十转战力估值加成不超过10%预算');
G("CQSys.createChar('魂阶兼容','zs');S.lvl=60;EG().para.lv=3;EG().para.pts={str:2};var oldPara=JSON.stringify(EG().para);egParaGain(1e12);egParaAdd('str',1);egParaAuto();egParaReset()");
ok(G('JSON.stringify(EG().para)===oldPara&&egPfree()===0&&egPval("str")>0'),'旧魂阶收益保留且不再产生或分配点数');
ok(G('EG_PAGES.find(p=>p.k==="para").n==="转生"&&egParaLock()===null&&!/分配/.test(egParaPage())'),'终局魂阶入口替换为固定转生');
G("CQSys.createChar('旧点数折金','zs');S.lvl=70;S.xp=cqOldXp(70);S.gold=100;S.sp=2;S.kp=3;S.sv=4;delete S.cqProgress;save();load()");
ok(G('S.gold>=100+2*AG_GOLD.sp(70)+3*AG_GOLD.kp(70)&&!S.sp&&!S.kp'),'旧点数按迁移前等级折金，不因等级压缩贬值');
G("CQSys.createChar('旧经验收益','zs');S.lvl=60;S.xp=xpNeed(60);EG().para.pts={xp:10};var expectedRebXp=100*(1+egPval('xp')/100);gainXp(100)");
ok(G('Math.abs(S.rebXp-expectedRebXp)<.001&&EG().para.lv===0'),'满级转生经验保留旧档已分配经验加成，旧魂阶不再升级');
G('S.reb=10;S.rebXp=0;gainXp(1e12)');ok(G('S.rebXp===0&&!!CQSys.rebirth().err'),'十转封顶');
G("CQSys.createChar('溢出经验','zs');S.lvl=59;S.reb=0;S.xp=xpNeed(60)-10;S.rebXp=0;gainXp(30)");ok(G('S.lvl===60&&S.xp===xpNeed(60)&&S.rebXp===20'),'升级溢出经验不丢失');
G('S.rebXp=cqRebNeed(0)/2');
ok(G('combatXpBar().includes("width:50%")'),'原战斗页满级经验条显示转生进度');
G('S.reb=10;S.rebXp=0');
ok(G('combatXpBar().includes("width:100%")'),'原战斗页十转后经验条显示已满');
T.done();
