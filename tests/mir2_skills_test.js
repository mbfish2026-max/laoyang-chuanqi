const fs=require('fs'),path=require('path');
const T=require('./cq_harness')('mir2_skills_test'),{G,ok}=T;
G(fs.readFileSync(path.join(__dirname,'../cq/mir2_skills.js'),'utf8'));
G("S=newSave();load();CQSys.createChar('技能验收','fs');S.lvl=60;S.autoSk=0;mir2SkillsWire();calc()");
const ids={fs:'dhq sxyd blhy hq jgdy dylg sys hbz mth lxhy fss',ds:'jslzf jtys yld sszjs xlqs kmz qtzls qgb wjzq sxs zhyl',zs:'szh zrjf ktz'};
for(const [c,list] of Object.entries(ids))for(const id of list.split(' ')){
 ok(G(`SKM.${id}.cls==='${c}'&&CLS_BOOK.${id}.on===SKM.${id}.n`),'定义与技能书 '+id);
 ok(G(`clsSkReq('${id}',9).lvl<=60&&clsSkReq('${id}',9).books===45`),'可升满9级 '+id);
 ok(fs.existsSync(path.join(__dirname,'../assets/cq/icon/book_'+id+'.png')),'书图存在 '+id);
 ok(fs.existsSync(path.join(__dirname,'../assets/cq/icon/sk_'+id+'.png')),'技能图存在 '+id);
}
for(const [c,id] of [['zs','ktz'],['fs','fss'],['ds','zhyl']]){
 G(`CQSys.createChar('专属${c}','${c}');S.lvl=60;S.autoSk=0;CQSys.heroCreate('${c}');S.hero.lvl=60;mir2SkillsWire();addMat('book_${c}_${id}',1)`);
 ok(G(`!!clsCanLearn('${id}').err&&!CQSys.setBattleSkill(0,'${id}')`),'主角禁学/禁配置 '+id);
 ok(G(`heroLearn('${id}').ok===1&&heroSkLv('${id}')===1`),'英雄学习 '+id);
 G(`CQSys.hero.skToggle('${id}',false)`);ok(G(`!heroSkOn('${id}')&&heroCast('${id}',100)===null`),'英雄关闭 '+id);
}
for(const c of ['zs','fs','ds']){
 G(`CQSys.createChar('共享${c}','${c}');S.lvl=60;S.autoSk=0;mir2SkillsWire();addMat('book_${c}_htsd',1)`);
 ok(G(`clsLearn('htsd').ok===1&&clsBookId('htsd')==='${c}_htsd'`),'共享盾独立书 '+c);
}
G("CQSys.createChar('迁移','fs');addMat('book_dhq',2);S.sk.hqs=9;S.skx.hqs=123;S.battleSkills=['dhq','hqs',null,null];mir2SkillsMigrate(S);window.snap=JSON.stringify(S);mir2SkillsMigrate(S)");
ok(G('JSON.stringify(S)===snap&&S.sk.hqs===9&&S.skx.hqs===123'),'幂等且保留旧技能收益');
ok(G("CQSys.bookCount('fs_dhq')===2"),'旧书容器迁移');
G("S.lvl=60;S.sk.dhq=1;calc();MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].hp=MON[0].max=1e9;H.mana=ST.mana;H.castT=0;CQSys.setBattleSkill(0,'dhq')");
ok(G("CQSys.manualSkill('dhq').ok"),'新技能战斗栏释放');
ok(fs.existsSync(path.join(__dirname,'../assets/cq/icon/book_htsd.png'))&&fs.existsSync(path.join(__dirname,'../assets/cq/icon/sk_htsd.png')),'共享盾素材');
G("CQSys.createChar('护盾','fs');S.lvl=60;CQSys.heroCreate('ds');S.hero.lvl=34;heroSkInit();addMat('book_ds_htsd',1)");
ok(G("heroLearn('htsd').ok===1"),'英雄34级学习神盾');
G('S.hero.lvl=39;calc();window.shieldSnap=JSON.stringify(S.sk);calc()');
ok(G('S.sk.htsd===1&&JSON.stringify(S.sk)===shieldSnap'),'英雄39级主角获得盾且不重复');
G("S.hero.sk.future={lv:3,exp:8};heroSkInit()");ok(G('S.hero.sk.future.lv===3'),'保留未来未知英雄技能');
// All learned additions, all nine professions: pets use the same actual damage budget.
for(const c of ['zs','fs','ds'])for(const hc of ['zs','fs','ds']){
 G(`CQSys.createChar('预算${c}${hc}','${c}');S.lvl=60;S.autoSk=0;CQSys.heroCreate('${hc}');S.hero.lvl=60;mir2SkillsWire();heroSkInit();for(const id of heroSkList())S.hero.sk[id]={lv:9,exp:0};calc();CQSys._heroReset();GT+=200;MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].hp=MON[0].max=1e12;hitMon(MON[0],{magic:10000},'player');for(const id of heroSkList())heroCast(id,10000,{targets:()=>MON,hit:(m,d)=>hitMon(m,{magic:d},'cqhero'),healHero:()=>{}});hitMon(MON[0],{magic:100000},'cqheji');for(const a of ALLY.filter(a=>a.owner==='hero'))hitMon(MON[0],{magic:10000},a)`);
 ok(G('CQSys.heroShare().share<=.25+1e-9'),'新增满级技能+英雄宠物+合击预算 '+c+'/'+hc);
}
T.done();
