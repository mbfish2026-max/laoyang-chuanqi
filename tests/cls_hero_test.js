// 英雄职业侧：技能表/书学习/熟练度/开关/AI/道士召唤：node tests/cls_hero_test.js
const T=require('./cq_harness')('cls_hero_test');const{G,ok}=T;
G(`S=newSave();load();CQSys.createChar('t','zs');calc();S.lvl=30;CQSys.heroCreate('ds','小道');S.hero.lvl=30;calc()`);
ok(G('heroCls()')==='ds','英雄职业 ds');
ok(G(`JSON.stringify(heroSkList('zs'))`)==='["gsjs","csjs","bywd","ymcz","lhjf"]'&&G(`heroSkList('fs').length`)===5&&G(`JSON.stringify(heroSkList('ds'))`)==='["zys","lhhf","sds","zhkl","zhss"]','三英雄技能表');
ok(G(`JSON.stringify(heroAutoAt('ds',11))`)===G(`JSON.stringify(clsAutoAt('ds',11))`)&&G('HERO_LIFEK')===0.8,'属性复用成长表');
ok(G(`heroSkLv('lhhf')`)===1&&G(`Object.keys(S.hero.sk).length`)===1,'初始只有灵魂火符 1 级');
ok(G(`heroCanLearn('gsjs').err`)==='职业不符'&&G(`heroCanLearn('ysh').err`)==='英雄不能学习此技能','职业/白名单');
ok(/需要技能书 x1/.test(G(`heroCanLearn('zhkl').err`)),'没书');G(`addMat('book_ds_zhkl',1)`);
ok(G(`heroLearn('zhkl').ok`)===1&&G(`heroSkLv('zhkl')`)===1&&G(`S.sk.zhkl`)===undefined,'英雄学会，主角技能不变');
G(`addMat('book_ds_zhkl',2)`);ok(/熟练度不足/.test(G(`heroCanLearn('zhkl').err`)),'熟练度不足');
G(`heroSkillExp('zhkl',1000)`);ok(G(`heroLearn('zhkl').to`)===2&&G(`heroSkExp('zhkl')`)===0&&G("CQSys.bookCount('ds_zhkl')")===0,'升 2 级扣 2 本，熟练度清零');
G(`S.hero.lvl=5;addMat('book_ds_sds',1)`);ok(/英雄需要等级 7/.test(G(`heroCanLearn('sds').err`)),'英雄等级门槛');G(`S.hero.lvl=30`);
ok(G(`heroSkInfo('zhkl').need`)===2000&&G(`heroSkInfo('zhkl').on`)===true,'heroSkInfo');
// AI：无召唤物先召唤（英雄主人），关闭的技能不放
G(`ALLY=[];MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].life=MON[0].max=1e9`);
ok(G(`heroSkPick()`)==='zhkl','AI 先召骷髅');
const r=JSON.parse(G(`JSON.stringify(heroCast('zhkl',10))`));ok(r&&r.pet&&G(`ALLY.filter(a=>a.owner==='hero'&&a.art==='pet_kl').length`)===1&&G(`heroSkExp('zhkl')`)===1,'召唤骷髅：owner=hero、art、熟练度 +1');
ok(G(`heroSkPick()`)==='lhhf','有宠后打灵魂火符');
G(`S.hero.skOff={lhhf:1}`);ok(G(`heroSkPick()`)===null&&G(`heroCast('lhhf',10)`)===null,'关闭的技能不释放');G(`S.hero.skOff={}`);
G(`H.life=1`);ok(G(`heroSkPick()`)===null||G(`heroSkPick()`)!=='zys','未学治愈术不治疗');
// 主角召唤不顶掉英雄召唤物
G(`S.sk.zhkl=1;CLS_TY.pet(SKM.zhkl,SV('zhkl',1))`);ok(G(`ALLY.filter(a=>a.owner==='hero').length`)===1&&G(`ALLY.filter(a=>a.kind==='cqpet'&&!a.owner).length`)===1,'主角/英雄召唤物并存');
// 伤害：base × mul，host.hit 接收
G(`window._hits=[];const host={targets:()=>MON,hit:(t,d,src)=>_hits.push([d,src])};HERO_CD.lhhf=0;window._r=heroCast('lhhf',100,host)`);
ok(G('_hits.length')===1&&G('_hits[0][1]')==='cqhero'&&G('_hits[0][0]')===Math.round(100*G(`heroMul('lhhf',1)`)),'heroCast 伤害走 host.hit');
ok(Math.abs(G(`heroMul('lhjf',9)`)/G(`heroMul('lhjf',1)`)-1.57)<0.01,'9 级总伤倍率 ×1.57');
G(`window._hits=[];MON=[0,1,2,3].map(()=>mkMon(ACTS[0].zones[1].mons[0],1));S.hero.sk.sds={lv:1,exp:0};HERO_CD.sds=0;heroCast('sds',100,{targets:()=>MON,hit:(t,d)=>_hits.push(d)})`);ok(G('_hits.length')===4&&Math.abs(G('_hits.reduce((a,b)=>a+b,0)')-100*G(`heroMul('sds',1)`))<3,'群体技能总伤平分，不随目标数放大');
G(`CQSys.heroShare=()=>({player:100,hero:20,share:0.15});MON=[mkMon(ACTS[0].zones[1].mons[0],1)];HERO_CD.lhhf=0;HERO_CD.sds=0`);ok(G('heroSkPick()')==='lhhf'||G('heroSkPick()')==='sds','英雄占比超过 12% 仍释放攻击技能');
// 旧存档 S.hero 无 sk / skOff 不报错
G(`delete S.hero.sk;delete S.hero.skOff`);ok(G(`heroSkLv('lhhf')`)===1&&G(`heroSkOn('lhhf')`)===true,'旧英雄存档补初始技能、默认全开');
T.done();
