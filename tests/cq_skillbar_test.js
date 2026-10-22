const T=require('./cq_harness')('cq_skillbar_test');const {G,ok}=T;
G('load();calc()');
for(const c of ['zs','fs','ds']){
 G(`CQSys.createChar('栏位${c}','${c}');S.lvl=60;calc()`);
 ok(G('CQSys.battleSkills().length')===4,c+' 默认四格');
 ok(G(`CQSys.battleSkills().every(id=>SKM[id].cls==='${c}'&&SKM[id].ty!=='passive')`),c+' 仅本职业主动');
 const expected=G('JSON.stringify(CQSys.battleSkills())');
 G('delete S.battleSkills;delete S.battleSkillsCls');ok(G('JSON.stringify(CQSys.battleSkills())')===expected,c+' 旧档默认');
 G('CQSys.setBattleSkill(0,null);save();load()');ok(G('CQSys.battleSkills()[0]')===null,c+' 空位存读');
 ok(!G(`CQSys.setBattleSkill(1,'jbjs')`),c+' 拒绝被动/跨职业');
}
G(`CQSys.createChar('独立一','fs');window.first=ACCT.cur;CQSys.setBattleSkill(0,null);CQSys.createChar('独立二','fs');window.second=ACCT.cur`);
ok(G('CQSys.battleSkills()[0]')!==null,'角色独立默认');G('switchChar(first)');ok(G('CQSys.battleSkills()[0]')===null,'切回保留空位');
G(`S.lvl=60;S.sk={hqs:1,mfd:1};calc();CQSys.setBattleSkill(0,'mfd');H.mana=ST.mana;H.life=ST.life;H.castT=0;MON=[];window.before=H.mana;window.cost=SV('mfd',1).mana`);
ok(G(`CQSys.manualSkill('mfd').ok`)===1,'无怪可手动增益');ok(G('H.mana===before-cost'),'扣蓝精确');ok(!G(`CQSys.manualSkill('mfd').ok`),'重复点击冷却拒绝');ok(G(`!acFeasible('mfd',[])`),'手动后自动共用冷却');
G(`GT+=100;H.castT=0;H.cbs={};H.mana=ST.mana;clsCast('mfd',[]);H.castT=ST.castT`);ok(!G(`CQSys.manualSkill('mfd').ok`),'自动后手动共用冷却');
G(`GT+=100;H.castT=0;H.mana=0;window.before=ACT.mfd`);ok(!G(`CQSys.manualSkill('mfd').ok`),'缺蓝拒绝');ok(G('ACT.mfd===before&&H.mana===0'),'失败不扣蓝不改冷却');
G(`S.sk.mfd=0;H.mana=ST.mana`);ok(!G(`CQSys.manualSkill('mfd').ok`),'未学锁定');
G(`S.sk.hqs=1;CQSys.setBattleSkill(0,'hqs');H.castT=0;H.mana=ST.mana;MON=[mkMon(Object.keys(MONS)[0],60)];MON[0].hp=MON[0].max=1e9;window.before=H.mana;window.cost=SV('hqs',1).mana`);
ok(G(`CQSys.manualSkill('hqs').ok`)===1&&G('H.mana===before-cost'),'无独立冷却技能实际攻击和扣蓝');
ok(G('H.castT>0')&&!G(`CQSys.manualSkill('hqs').ok`),'行动时间阻止连点');
G(`CQSys.createChar('清冷却','fs')`);ok(G('Object.keys(ACT).length')===0,'角色切换清理运行时冷却');
T.done();
