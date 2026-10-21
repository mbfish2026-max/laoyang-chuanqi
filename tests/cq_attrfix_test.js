// 法师角色页「魔法值」= -3 回归：战士存档直接改职业（S.at 仍是战士初始值）时法力/生命不得为负。node tests/cq_attrfix_test.js
const T=require('./cq_harness')('cq_attrfix_test');const{G,ok}=T;
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc()`);ok(G('S.at.ene')===10,'战士初始 精力 10');
G(`S.cls='fs';S.sk=respBaseSk();S.lvl=7;calc()`);
ok(G('ST.mana')>0,'战士存档改法师 Lv7：魔法值 '+G('ST.mana')+' > 0（修前 -3）');ok(G('S.at.ene')>=35&&G('S.at.vit')>=10,'属性补齐到法师初始值');
G(`S.cls='ds';S.lvl=7;calc()`);ok(G('ST.mana')>0&&G('ST.life')>0&&G('S.at.vit')>=20,'改道士同样不为负');
G(`S=newSave();load();S.cls='fs';S.ci=0;clsInit();S.at.ene=60;S.at.str=40;calc();var m=ST.mana`);ok(G('S.at.ene')===60&&G('S.at.str')===40,'正常加过的点不变');
for(const c of['zs','fs','ds'])for(const lv of[1,7,30]){G(`S=newSave();load();S.cls='${c}';S.ci=0;clsInit();S.lvl=${lv};calc()`);ok(G('ST.mana')>0&&G('ST.life')>0,`${c} Lv${lv} 法力/生命为正`)}
T.done();
