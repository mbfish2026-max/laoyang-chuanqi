// 职业侧：技能书学习/熟练度（原版传奇之旅 9 级）、属性自动成长、旧存档映射：node tests/cls_book_test.js
const T=require('./cq_harness')('cls_book_test');const{G,ok}=T;
G(`S=newSave();load();calc()`);
// 新手只给初始技能
const init={zs:'jbjs',fs:'hqs',ds:'lhhf'};
for(const c in init){G(`CQSys.createChar('t${c}','${c}');calc()`);ok(G('JSON.stringify(Object.keys(S.sk).filter(k=>S.sk[k]>0))')===JSON.stringify([init[c]]),`${c} 新手只有 ${init[c]}`)}
// 属性自动成长
ok(G(`JSON.stringify(clsAutoAt('zs',11))`)===JSON.stringify({str:58,dex:23,vit:50,ene:10}),'战士 11 级 力+28 敏+3 体+25');
ok(G(`JSON.stringify(clsAutoAt('fs',11))`)===JSON.stringify({str:10,dex:28,vit:35,ene:63}),'法师 11 级 精+28');
ok(G(`JSON.stringify(clsAutoAt('ds',11))`)===JSON.stringify({str:17,dex:28,vit:45,ene:52}),'道士 11 级 精+27 力+2');
ok(G(`JSON.stringify(clsAutoAt('zs',1))`)===G(`JSON.stringify(CLS_DEF.zs.at)`),'1 级 = 初始属性');
// 学习规则
G(`CQSys.createChar('tz','zs');calc();S.lvl=1`);
ok(G(`clsCanLearn('hqs').err`)==='职业不符','职业不符');
ok(/需要等级 3/.test(G(`clsCanLearn('gsjs').err`)),'等级不够');G(`S.lvl=30`);
ok(/需要技能书 x1/.test(G(`clsCanLearn('gsjs').err`)),'没书');G(`addMat('book_zs_gsjs',1)`);
ok(G(`canLearn('gsjs')`)===true&&G(`learn('gsjs').ok`)===1&&G('S.sk.gsjs')===1&&G("CQSys.bookCount('zs_gsjs')")===0,'learn 学会 1 级并扣 1 本');
G(`addMat('book_zs_gsjs',2)`);ok(/熟练度不足 \(0\/600\)/.test(G(`clsCanLearn('gsjs').err`)),'熟练度不足');
G(`clsSkillExp('gsjs',599)`);ok(G(`canLearn('gsjs')`)===false,'599/600 不行');G(`clsSkillExp('gsjs')`);
G(`CQSys.takeMat('book_zs_gsjs',1)`);ok(/需要技能书 x2/.test(G(`clsCanLearn('gsjs').err`)),'2 级要 2 本');G(`addMat('book_zs_gsjs',1)`);
const r=JSON.parse(G(`JSON.stringify(learn('gsjs'))`));ok(r.ok&&r.to===2&&G("clsSkExpGet('gsjs')")===0&&G("CQSys.bookCount('zs_gsjs')")===0,'升 2 级：扣 2 本，熟练度清零');
G(`S.sk.gsjs=9`);ok(G(`clsCanLearn('gsjs').err`)==='技能已满级','9 级满级');G(`S.sk.gsjs=2`);
ok(G(`clsSkReq('lhjf',9).lvl`)===G('SKM.lhjf.r')+24&&G(`clsSkReq('lhjf',9).books`)===45&&G(`clsSkReq('lhjf',9).exp`)===40000,'9 级需求 r+24 / 45 本 / 8 级熟练度 40000');
// 熟练度：主动施放 +1、被动命中 +1
G(`MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].life=MON[0].max=1e9;window._e=clsSkExpGet('gsjs');acCast('gsjs',liveMon())`);ok(G("clsSkExpGet('gsjs')")===G('_e')+1,'acCast 熟练度 +1');
G(`window._p=clsSkExpGet('jbjs');hitMon(MON[0],{phys:10},'hero')`);ok(G("clsSkExpGet('jbjs')")===G('_p')+1,'被动 基本剑术 命中 +1');
// 效果换算：新 9 级 = 旧 20 级
ok(G('clsOldL(9)')===20&&G('clsOldL(1)')===1,'clsOldL 9→20');
ok(G(`SV('lhjf',9).txt`)===G(`SKM.lhjf.v(20,syn('lhjf')*clsDk('zs')).txt`),'烈火 9 级效果 = 旧 20 级');
// 旧存档：技能等级向上取整映射，不变弱；技能点/属性点字段不报错
G(`S.sk={jbjs:20,gsjs:5,lhjf:2};S.sk9=0;S.kp=7;S.sp=4;calc()`);ok(G('S.sk.jbjs')===9&&G('S.sk.gsjs')===3&&G('S.sk.lhjf')===2,'旧 20/5/2 级 → 9/3/2');
ok(['jbjs','gsjs','lhjf'].every((k,i)=>G(`clsOldL(S.sk.${k})`)>=[20,5,2][i]),'映射后不弱于旧等级');
calcOnce=G('S.sk9');ok(calcOnce===1,'映射只做一次');
// 接口导出
ok(G(`clsBookList('zs').length`)===6&&G(`JSON.stringify(clsBookList('zs')[0].books)`)==='[1,2,3,5,10,20,30,40,45]'&&G(`clsBookList('ds').find(b=>b.sk==='zhss').oid`)===104020,'clsBookList');
ok(G(`clsSkInfo('gsjs').need`)===3000&&G(`clsSkInfo('gsjs').bookId`)==='zs_gsjs','clsSkInfo');
// 召唤物生命加成（原 summon_surv.js）：学了 xd_wild 时 +min(60,10+3(L-1))
G(`calc();window._sl=ST.sumlife||0;SKM.xd_wild={id:'xd_wild',cls:'zz',t:0};S.sk.xd_wild=3;calc()`);ok(G('(ST.sumlife||0)-_sl')===Math.min(60,10+3*(G("slvl('xd_wild')")-1)),'xd_wild 召唤物生命加成');G(`delete SKM.xd_wild;delete S.sk.xd_wild;calc()`);
// 改名保留技能书 ID；模拟旧档持有的书，走真实保存/载入及学习入口。
for(const [id,name,oid] of [['sds','施毒术',104007],['zhkl','召唤骷髅',104025]]){
 G(`CQSys.createChar('旧书兼容','ds');S.lvl=30;S.autoSk=0;addMat('book_ds_${id}',1);save();load();calc()`);
 ok(G(`clsSkInfo('${id}').bookName`)===name&&G(`CLS_BOOK.${id}.oid`)===oid,'书名修正且原版物品 ID 不变 '+id);
 ok(G(`CQ_BOOKS.ds_${id}.n`)===name&&G(`MATS.book_ds_${id}.n`)==='技能书·'+name,'掉落与材料名一致 '+id);
 ok(G(`CQSys.bookLearn('ds_${id}').ok`)===1&&G(`S.sk.${id}`)===1&&G(`CQSys.bookCount('ds_${id}')`)===0,'旧档原 ID 书可学习并扣书 '+id);
}
// 符文图鉴按钮已删
ok(!/符文图鉴/.test(require('fs').readFileSync(__dirname+'/../skills.js','utf8')),'技能页无符文图鉴');
T.done();
