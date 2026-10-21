// 自动成长（docs/auto_growth_plan.md）：无属性点/技能点；属性按职业×等级推导；技能书照原版规则；旧存档迁移；同等级战力不弱于旧版自动加点
const T=require('./cq_harness')('cq_autogrow_test');const{G,ok}=T;
// 旧版（cq-20261021m，S.sp=5/级 + late.js 自动加点，裸装）同等级面板：life/mana/def/ar/武器伤害上限/主属性加伤%
const OLD={zs:{1:[83,10,5,78,2,0],7:[276,16,5,99,2,3],15:[534,24,5,126,3,7],22:[755,31,5,151,3,10],30:[1013,39,5,178,4,14],40:[1272,49,5,213,4,20]},
 fs:{1:[65,35,6,93,2,0],7:[120,77,6,111,2,3],15:[194,133,6,135,2,8],22:[258,183,6,156,2,13],30:[332,239,6,180,2,18],40:[409,321,6,210,2,26]},
 ds:{1:[45,25,6,93,2,0],7:[91,67,6,111,2,3],15:[153,123,6,135,2,8],22:[206,173,6,156,2,13],30:[268,229,6,180,2,18],40:[331,311,6,210,2,26]}};
const rows=[];
for(const c in OLD)for(const L in OLD[c]){const n=JSON.parse(G(`(()=>{S=newSave();S.cls='${c}';S.ci=0;clsInit();S.lvl=${L};S.eq={};S.autoSk=0;calc();try{autoTick()}catch(e){};calc();const B=CLS_DEF['${c}'].at,mk=CLS_DEF['${c}'].main;
 return JSON.stringify([ST.life,ST.mana,ST.def,ST.ar,ST.wmax,Math.floor(Math.max(0,S.at[mk[0]]-B[mk[0]])/mk[1]),S.sp|0,S.kp|0,S.at])})()`));
 const o=OLD[c][L],bad=o.map((v,i)=>n[i]<v?i:-1).filter(i=>i>=0);rows.push(`${c} Lv${L} 生命${o[0]}→${n[0]} 法力${o[1]}→${n[1]} 防御${o[2]}→${n[2]} 准确${o[3]}→${n[3]} 加伤${o[5]}→${n[5]}%`);
 ok(!bad.length,`${c} Lv${L} 不弱于旧版自动加点（${['生命','法力','防御','准确','攻击','主属性加伤'].filter((x,i)=>bad.includes(i)).join('、')}）`);ok(n[6]===0&&n[7]===0,`${c} Lv${L} 无属性点/技能点`)}
if(process.env.SHOW)console.log(rows.join('\n'));
// 升级：不给点数，属性自动成长
G(`S=newSave();S.cls='zs';S.ci=0;clsInit();calc();window._s0=S.at.str;gainXp(xpNeed(5)+1)`);ok(G('S.lvl')>=5&&G('S.sp|0')===0&&G('S.kp|0')===0&&G('S.at.str')>G('_s0'),'升级不给点、力量自动成长');
ok(G(`(()=>{S.at.str=999;calc();return S.at.str})()`)===G(`agAutoAt('zs',S.lvl).str`),'手改 S.at 会被推导值覆盖');
G(`S.atb={str:5};calc()`);ok(G('S.at.str')===G(`agAutoAt('zs',S.lvl).str+5`),'S.atb 固定加成（任务/转生）叠加');
ok(G(`typeof useResp==='undefined'&&typeof RESP==='undefined'`),'洗点已移除');
// 残余点数折金币
G(`S.gold=0;S.lvl=10;S.sp=3;S.kp=2;calc()`);ok(G('S.gold')===3*200+2*1000&&G('S.sp')===0&&G('S.kp')===0,'残余点数折金币 属性点 100×(1+L/10)、技能点 500×(1+L/10)');
// 旧存档迁移 v5
G(`S=newSave();S.cls='zs';S.ci=1;S.sv=4;delete S.sk9;S.lvl=30;S.at={str:300,dex:20,vit:20,ene:10};S.sp=10;S.kp=4;S.autoAt=1;S.resp={sk:1,at:2};S.sk={gsjs:20,jbjs:6,lhjf:13,csjs:1};S.gold=0;cqMigrate();calc()`);
const g=(10*400+4*2000)+Math.round((1000+900*30)/100)*100+2*Math.round((500+900*20)/100)*100;
ok(G('S.sv')===G('CQ_SV')&&G('S.gold')===g,'迁移：点数+洗点药水折金币 '+G('S.gold')+'='+g);
ok(G('S.sk.gsjs')===9&&G('S.sk.jbjs')===3&&G('S.sk.lhjf')===6&&G('S.sk.csjs')===1&&G('S.sk9')===1,'迁移：技能 20→9 按比例向上取整');
ok(G('S.resp')===undefined&&G('S.autoAt')===undefined&&G('S.at.str')===G(`agAutoAt('zs',30).str`),'迁移：删 resp/autoAt，属性按等级重算');
G(`cqMigrate();calc()`);ok(G('S.sk.gsjs')===9&&G('S.gold')===g,'迁移幂等');
// 技能书规则（照原版）
G(`S=newSave();S.cls='zs';S.ci=0;clsInit();S.lvl=1;S.bag=[];S.sk={};S.skx={};calc()`);
const r=G(`SKM.gsjs.r`);ok(G(`CQSys.bookLearn('fs_hqs').err`)==='职业不符','职业不符');
G(`addMat('book_zs_gsjs',10)`);ok(G(`CQSys.bookLearn('zs_gsjs').err`)===`需要等级 ${r}`,'等级不足');
G(`S.lvl=${r}`);ok(G(`CQSys.bookLearn('zs_gsjs').ok`)===1&&G('S.sk.gsjs')===1&&G(`CQSys.bookCount('zs_gsjs')`)===9,'学会 1 级，耗 1 本');
G(`S.lvl=${r}+3`);ok(/熟练度不足 \(0\/30\)/.test(G(`CQSys.bookLearn('zs_gsjs').err`)),'熟练度不足（30=600×0.05）');
G(`S.lvl=${r}+2;CQSys.skillExp('gsjs',30)`);ok(G(`CQSys.bookLearn('zs_gsjs').err`)===`需要等级 ${r+3}`,'2 级需求等级 = 需求+3');
G(`S.lvl=${r}+3`);ok(G(`CQSys.bookLearn('zs_gsjs').ok`)===1&&G('S.sk.gsjs')===2&&G('CQSys.skExp("gsjs")')===0,'升 2 级，熟练度清零');
G(`S.lvl=60;S.sk.gsjs=3;S.skx.gsjs=999;S.bag=[];addMat('book_zs_gsjs',1)`);ok(G(`CQSys.bookLearn('zs_gsjs').err`)==='需要技能书 x2','4 级需 2 本');
const st=JSON.parse(G(`JSON.stringify(CQSys.skState('gsjs'))`));ok(st.lv===3&&st.max===9&&st.next.books===2&&st.have===1&&!st.can&&st.why==='需要技能书 x2','skState 给技能页 '+JSON.stringify(st));
G(`S.sk.gsjs=9`);ok(G(`CQSys.bookLearn('zs_gsjs').err`)==='技能已满级','9 级满');
G(`S.sk.gsjs=1;S.skx.gsjs=1e6;S.autoSk=1;S.bag=[];addMat('book_zs_gsjs',4);CQSys.bookAutoUse()`);ok(G('S.sk.gsjs')===2&&G(`CQSys.bookCount('zs_gsjs')`)===3&&G('CQSys.skExp("gsjs")')===0,'挂机自动用书：熟练度满才升，升后清零停下');
// 熟练度：施放 +1
G(`S.sk.gsjs=1;S.skx.gsjs=0;TAB='hero';try{clsCast('gsjs',[])}catch(e){}`);ok(G('CQSys.skExp("gsjs")')===1,'施放 +1 熟练度');
// 任务奖励
G(`S=newSave();S.cls='zs';S.ci=0;clsInit();S.lvl=20;S.bag=[];calc();questDone('q1')`);ok(G(`CQSys.books('zs').reduce((a,b)=>a+CQSys.bookCount(b.id),0)`)===1&&G('S.kp|0')===0,'q1 奖励技能书 ×1');
G(`S.atb={};S.q.a3q4=0;questDone('a3q4')`);ok(G('S.atb.str')===3&&G('S.atb.vit')===2,'a3q4 主属性+3 体力+2（固定）');
T.done();
