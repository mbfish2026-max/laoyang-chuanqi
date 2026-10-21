// 系统平衡修复：node tests/cq_balfix_test.js
const T=require('./cq_harness')('cq_balfix_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc()`);
// P0 回收
ok(G('S.rcy.dv')===4&&!G('S.rcy.q[3]')&&!G('S.rcy.q[4]'),'新角色：魔法/稀有默认不回收（dv=4）');
G(`S.rcy.dv=3;S.rcy.q[3]=1;S.rcy.q[4]=1;ensureLoot()`);ok(G('S.rcy.dv')===4&&!G('S.rcy.q[3]')&&!G('S.rcy.q[4]'),'旧档 dv=3（稀有回收）纠正为 dv=4');
G(`S.rcy.q[3]=1;ensureLoot()`);ok(G('S.rcy.q[3]')===1,'dv=4 后玩家自己勾选的设置保留');
G(`S.rcy.on=1;S.rcy.q={0:1,1:1,2:1,3:1,4:1};S.rcy.c=new Proxy({}, {get:()=>1});delete S.eq.helm;var hb=Object.values(BASEM).find(b=>b.s==='helm'&&canEquip(makeBase(b,1)));var h1=makeBase(hb,1);h1.q=1`);
ok(G('shouldRecycle(h1,false)')===false,'身上该部位空着：可装备的装备不回收');
G(`S.eq.helm=makeBase(hb,1);S.eq.helm.q=1;var h2=makeBase(hb,1);h2.q=1;h2.en=3`);ok(G('power(h2)>power(S.eq.helm)')&&G('shouldRecycle(h2,false)')===false,'战力高于身上：不回收');
G(`S.eq.helm.en=6;var h3=makeBase(hb,1);h3.q=1`);ok(G('power(h3)<=power(S.eq.helm)')&&G('shouldRecycle(h3,false)')===true,'战力不高于身上：照常回收');
// 1) 掉落判定
G('S.diff=0;S.act=0');ok(G('DENSITY.drop')===1,'第 1 章非首领掉落判定 1.0');G('S.act=1');ok(G('DENSITY.drop')===1,'第 2 章 1.0');G('S.act=2');ok(G('DENSITY.drop')===0.6,'第 3 章起仍 0.6');G('S.act=0');
// 2) 技能书
G(`S.bag=[];S.lvl=30;S.sk.gsjs=0;S.cqBooks={};addMat('book_zs_gsjs',3)`);const r1=JSON.parse(G(`JSON.stringify(CQSys.bookLearn('zs_gsjs'))`));ok(r1.ok&&r1.to===1&&G('S.sk.gsjs')===1,'技能书：未学会 → 学会 1 级');
const r2=JSON.parse(G(`JSON.stringify(CQSys.bookLearn('zs_gsjs'))`));ok(r2.ok&&G('S.sk.gsjs')===2&&G('S.kp|0')===G('S.kp|0'),'再用一本：+1 级，不耗技能点');
G(`S.sk.gsjs=20`);ok(/满级/.test(G(`CQSys.bookLearn('zs_gsjs').err`)),'满 20 级不能再用');G('S.sk.gsjs=2');
let hit=0;G(`CQSys.onBookLearn(b=>{window.__bk=b.sk})`);G(`CQSys.bookLearn('zs_gsjs')`);ok(G('window.__bk')==='gsjs'&&G('S.sk.gsjs')===3,'onBookLearn 回调收到技能 id');
G(`S.autoSk=1;S.sk.lhjf=1;addMat('book_zs_lhjf',2);CQSys.bookAutoUse()`);ok(G('S.sk.lhjf')===3&&G("CQSys.bookCount('zs_lhjf')")===0,'挂机自动用书');
ok(G(`Object.values(CQ_BOOKS).filter(b=>!b.placeholder).every(b=>SKM[b.sk]&&SKM[b.sk].cls===b.cls)`),'所有正式技能书都对得上 CLS_SKILLS');
// 3) 自动强化
G(`S.bag=[];for(const k of SLOTS)if(S.eq[k])S.eq[k].en=0;S.eq.weapon.en=0;S.gold=100000;S.mats=S.mats||{};addMat('heitie',50);S.cqAE={on:1,max:3,keep:300};for(let i=0;i<60;i++)CQSys.autoEnhTick()`);
ok(Object.values(JSON.parse(G(`JSON.stringify(Object.fromEntries(SLOTS.filter(k=>S.eq[k]).map(k=>[k,S.eq[k].en||0])))`))).every(v=>v>=2&&v<=3),'自动强化已穿装备到 +2/+3');
ok(G('S.eq.weapon.en')<=3,'不超过上限 +3');
G(`CQSys.autoEnh(0);S.eq.weapon.en=0;CQSys.autoEnhTick()`);ok(G('S.eq.weapon.en')===0,'关闭后不强化')
G(`CQSys.autoEnh(1);S.gold=200;S.eq.weapon.en=0;CQSys.autoEnhTick()`);ok(G('S.eq.weapon.en')===0,'金币不足保留额时不强化');
T.done();
