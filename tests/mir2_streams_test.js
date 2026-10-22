const T=require('./cq_harness')('mir2_streams_test'),{G,ok}=T;
G('S=newSave();load()');
for(const c of ['zs','fs','ds'])for(let i=0;i<3;i++){
 G(`ACCT.chars=[];CQSys.createChar('流派${c}${i}','${c}');S.lvl=60;S.autoSk=0;for(const s of CLS_SKILLS)if(s.cls===S.cls&&!s.heroOnly)S.sk[s.id]=4;calc();CQSys.streamChoose(${i})`);
 ok(G(`S.stream===${i}&&JSON.stringify(CQSys.battleSkills())===JSON.stringify(mir2Stream()[1])`),'四格 '+c+i);
 ok(G('acState().order[0]===mir2Stream()[1][0]'),'优先顺序 '+c+i);
 G('save();load()');ok(G(`S.stream===${i}`),'保存 '+c+i);
}
G("ACCT.chars=[];CQSys.createChar('双召','ds');S.lvl=60;S.sk.zhkl=4;S.sk.zhss=4;S.stream=2;calc();CLS_TY.pet(SKM.zhkl,SV('zhkl',4));CLS_TY.pet(SKM.zhss,SV('zhss',4))");
ok(G("clsPetN('zhkl')===1&&clsPetN('zhss')===1"),'双召唤');
G("ACCT.chars=[];CQSys.createChar('火墙','fs');S.lvl=60;S.sk.hq=4;calc();MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].hp=MON[0].max=1e9;window.hp0=MON[0].hp;CLS_TY.burn(SKM.hq,SV('hq',4),MON);step(1)");
ok(G('MON[0].hp<hp0&&MON[0].burn.left>0'),'火墙真实持续伤害');
ok(G("heroSkList('fs').includes('mfd')&&heroSkList('ds').includes('ysh')"),'英雄护持白名单');
G("H.cbs={};setBuff('sszjs',{def:25,dur:10},'sszjs');setBuff('yld',{res:30,dur:10},'yld')");
ok(G("mir2PetGuard(100,'phys')===75&&mir2PetGuard(100,'fire')===70"),'护甲与幽灵盾分担召唤物伤害');
G('GT+=11');ok(G("mir2PetGuard(100,'phys')===100&&mir2PetGuard(100,'fire')===100"),'护持到期不残留');
G("MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].boss=true;CLS_TY.debuff(SKM.kmz,SV('kmz',1),MON)");
ok(G('!MON[0].stun'),'困魔不控首领');
G("window.CQ=window.CQ||{};window.gridTest={b:{roleIdx:0,mons:[{idx:1}],_pets:[{idx:2,hp:1}]}};window.sceneBefore=CQ.Scene;window.moveBefore=CQ.MOVE;CQ.Scene={grid:()=>gridTest};CQ.MOVE={N:4};clsAfterCast(SKM.sxyd,{},[],[])");
ok(G('gridTest.b.roleIdx===3'),'瞬移避开人物与怪物占格');
G('CQ.Scene=sceneBefore;CQ.MOVE=moveBefore');
G("ACCT.chars=[];CQSys.createChar('控场顺序','fs');S.lvl=60;S.autoSk=0;S.sk.hq=4;S.sk.blhy=4;S.sk.dyh=4;CQSys.streamChoose(1);calc();H.mana=ST.mana;MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].hp=MON[0].max=1e9;for(const id in ACT)delete ACT[id]");
ok(G("acSmart('hq',MON)&&!acSmart('blhy',MON)"),'火墙优先');
G("CLS_TY.burn(SKM.hq,SV('hq',4),MON)");
ok(G("!acFeasible('hq',MON)&&acSmart('blhy',MON)"),'不重刷火墙且回退爆裂');
G("H.mana=0");ok(G("!acFeasible('hq',MON)&&!acFeasible('blhy',MON)"),'缺蓝不施放');
T.done();
