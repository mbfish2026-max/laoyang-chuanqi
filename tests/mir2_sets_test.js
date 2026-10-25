'use strict';
const {G,ok,done,loadErr}=require('./cq_harness')('mir2_sets');
ok(!loadErr.length,'runtime loads');
G("load();CQSys.createChar('套装短测','zs');S.lvl=60;S.auto=0;calc();function wear(id,n){S.eq={};for(const p of SETITEMS.filter(p=>p.set===id).slice(0,n)){const it=CQMir2Equip.createContent(p.id,60);S.eq[BASEM[it.b].s==='ring'?'ring1':BASEM[it.b].s]=it}calc()}");
for(const id of ['zuma_zs','zuma_fs','zuma_ds','chiyue_zs','chiyue_fs','chiyue_ds'])ok(G(`SETITEMS.filter(p=>p.set==='${id}').length>=4`),'four pieces '+id);
G("wear('zuma_zs',4)");ok(G('CQMir2Sets.count("zuma_zs")===4&&SETS.zuma_zs.bonus[4].maxdmg===2&&!SETS.zuma_zs.bonus[2].ias'),'zuma four counted');
G("var original=JSON.stringify(S.eq);CQMir2Sets.install()");ok(G('JSON.stringify(S.eq)===original'),'install preserves gear');
G("wear('shengzhan',6);var m={hp:1e8,max:1e8,def:0,lv:1,res:{},boss:true};var oldMelee=clsMelee, calls=0;clsMelee=()=>{calls++;return 1};CLS_TY.hit(SKM.lhjf,{pct:100,flat:10},[m],m);clsMelee=oldMelee");ok(G('calls===2'),'holy warrior double strike');
G("S.cls='fs';wear('fashen',6);GT=10;var wall={hp:1e8,max:1e8,res:{}};CLS_TY.burn(SKM.hq,{dps:100,bdur:8,n:5},[wall],wall);GT=12;CLS_TY.burn(SKM.hq,{dps:100,bdur:8,n:5},[wall],wall)");ok(G('wall.burn.dps===200'),'two wall layers');G('GT=19');ok(G('wall.burn.dps===100'),'old wall expires independently');
G("ACT.hq=GT;var half=clsCdLeft('hq');S.eq={}");ok(G("half===SKM.hq.cd/2&&clsCdLeft('hq')===SKM.hq.cd"),'wall cooldown follows equipment');
G("S.cls='ds';wear('tianzun',6);var oldLive=liveMon;var mobs=[0,1,2].map(i=>({hp:10000,max:10000,def:0,lv:1,res:{},uid:i}));liveMon=()=>mobs;hitMon(mobs[0],{phys:100},{kind:'cqpet',sub:'zhss'});liveMon=oldLive");ok(G('mobs[1].hp<10000&&mobs[2].hp<10000'),'dog splash reaches two targets');
ok(G('Math.abs((10000-mobs[1].hp)/(10000-mobs[0].hp)-.35)<.02'),'splash does not apply global multiplier twice');
G("var splashHp=mobs[1].hp;var heroVictim={hp:10000,max:10000,def:0,lv:1,res:{}};hitMon(heroVictim,{phys:100},{kind:'cqpet',sub:'zhss',owner:'hero'})");ok(G('mobs[1].hp===splashHp'),'no recursive splash');
G("S.cls='zs';S.mir2Sets={kills:{zumalord:299},seen:{},pending:[]};var reward=rollTC({boss:true,key:'zumalord',lv:45}).find(it=>it.cqSetGuarantee)");ok(G('reward&&reward.set==="zuma_zs"&&reward.cqContentId.startsWith("set_zuma_zs_")'),'300th boss gives own missing piece');
G('S.bag=Array.from({length:BAG_SZ},()=>Object.assign({},reward));addBag(reward)');ok(G('S.mir2Sets.pending.length===1'),'full bag keeps guaranteed reward');
G("S.mir2Sets.kills.zumalord=599;var reward2=rollTC({boss:true,key:'zumalord',lv:45}).find(it=>it.cqSetGuarantee)");ok(G('reward2.cqContentId!==reward.cqContentId'),'next guarantee fills missing identity');
G('var saved=JSON.stringify(S.mir2Sets);S.mir2Sets=JSON.parse(saved)');ok(G('S.mir2Sets.pending[0].uid===reward.uid'),'pending reward survives JSON save');
// Isolate fixed skill rolls while retaining the full hitMon pipeline.
G("S.cls='fs';wear('lieyan',6);var savedSV=SV,savedSpend=spend;SV=()=>({dmg:[100,100]});spend=()=>{};var fixed={hp:1e7,max:1e7,lv:1,def:0,res:{}};clsCast('ldsh',[fixed]);var boosted=1e7-fixed.hp;delete S.eq.ring1;calc();fixed.hp=1e7;clsCast('ldsh',[fixed]);var normal=1e7-fixed.hp;SV=savedSV;spend=savedSpend");
ok(G('boosted===normal&&SETS.lieyan.bonus[6].mag===3'),'dragon six adds fixed magic, no direct multiplier');
G("wear('lieyan',6);fixed.hp=1e7;CLS_TY.aoe(SKM.lxhy,{dmg:[1,1],dps:100,bdur:4},[fixed],fixed)");ok(G('fixed.burn.dps===100&&SETS.lieyan.bonus[6].mag===3'),'meteor has no delayed damage multiplier');
G("wear('chiyue_fs',4);H.life=100;var savedSV=SV,savedSpend=spend;SV=()=>({dmg:[100,100]});spend=()=>{};fixed.hp=1e7;clsCast('ldsh',[fixed]);var healed=H.life-100, lost=1e7-fixed.hp;SV=savedSV;spend=savedSpend");
ok(G('healed===0&&lost>0&&SETS.chiyue_fs.bonus[4].mag===3&&!SETS.chiyue_fs.bonus[4].ll'),'chiyue gives fixed magic and no spell leech');
ok(G('Object.values(S.eq).every(it=>it.cqContentId.startsWith("set_chiyue_fs_"))'),'duplicate names preserve exact set identity');
G("S.cls='fs';wear('lieyan',6);var fixedMagic=clsSV('ldsh',9).dmg;S.eq.ring1.set=null;calc();var lessMagic=clsSV('ldsh',9).dmg");ok(G('fixedMagic.every((v,i)=>v===lessMagic[i]+9)'),'six-piece fixed magic reaches actual skill values');
for(const id of ['shengzhan','fashen','tianzun','leiting','lieyan','guangmang'])ok(G(`SETS['${id}'].bonus[2].life===12&&SETS['${id}'].bonus[4].life===18&&SETS['${id}'].bonus[6].mana===15`),'retained life and mana '+id);
ok(G('CQMir2Sets.ids.every(id=>Object.values(SETS[id].bonus).every(m=>Object.keys(m).every(k=>CQMir2Equip.allowed.has(k))))'),'all set attribute rewards are allowed fixed values');
for(const cls of ['zs','fs','ds']){
 G(`S.cls='${cls}';wear('chiyue_${cls}',4)`);ok(G(`CQMir2Sets.active('chiyue_${cls}',4)`),'chiyue threshold '+cls);
 G('delete S.eq.ring1');ok(!G(`CQMir2Sets.active('chiyue_${cls}',4)`),'four pieces required '+cls);
}
G("S.cls='zs';wear('shengzhan',6);S.cls='fs'");ok(!G("CQMir2Sets.active('shengzhan',6)"),'wrong class cannot borrow mechanism');
for(const key of ['zumalord','chiyuedemon','molonglord','darkniumoking'])ok(G(`CQMir2Sets.parts('${key}').every(p=>BASEM[p.b]&&p.id&&SETS[p.set])`),'resolvable boss pool '+key);
done();
