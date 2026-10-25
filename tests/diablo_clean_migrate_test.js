'use strict';
const T=require('./cq_harness')('diablo_clean_migrate'),{G,ok}=T;
ok(!T.loadErr.length,'all scripts load: '+T.loadErr.join('; '));
G("load();CQSys.createChar('迁移验证','zs');S.lvl=60;calc();var fixtures=BASES.map((b,i)=>{var it=makeBase(b,60);it.uid=9000+i;it.q=5;it.name='旧版装备';it.m={allres:20,ll:7,edmg:30,edef:20,allsk:2,ar:8};it.sock=3;it.soc=['r01'];it.rw=1;it.rf={n:6,k:'ll',off:[['allres',12,10,15],['ll',5,3,8]],boff:{edmg:3}};return it});var oldP=fixtures.map(it=>CQMir2Equip.legacyPower(it));var source={eq:{weapon:fixtures[0]},bag:fixtures,hero:{eq:{weapon:fixtures[1]}},pst:[[fixtures[2]]],drop:[fixtures[3]],mir2Mig:{equipment:1}};var account={shared:[fixtures[4]]};var migrated=CQMir2EquipMigrate.migrate(source,account)");
ok(G('migrated.state.bag.length===fixtures.length'),'every equipment retained');
ok(G('migrated.state.bag.every((it,i)=>power(it)>=oldP[i])'),'power never decreases across all bases');
ok(G('migrated.state.bag.every(it=>Object.keys(allMods(it)).every(k=>CQMir2Equip.allowed.has(k)))'),'only allowed effective properties');
ok(G('migrated.state.bag.every(it=>it.cqLegacy.ll===7&&it.cqOriginal.sock===3&&it.cqOriginal.rw===1&&!it.sock&&!it.soc.length&&it.rw==null)'),'original fields archived; prohibited effects disabled');
ok(G('migrated.state.bag.every(it=>it.q===5&&it.rf.n===6&&it.rf.off.length===2&&it.rf.k==="def"&&it.rf.off.every(x=>CQMir2Equip.allowed.has(x[0])))'),'quality and paid offers retained and converted');
ok(G('JSON.stringify(CQMir2EquipMigrate.migrate(migrated.state,migrated.account))===JSON.stringify({...migrated,count:0})'),'state/account idempotence');
ok(G('source.bag[0].m.ll===7&&account.shared[0].sock===3'),'pure migration');
G('var v1={uid:19000,b:"swd1",q:5,dmg:[4,8],m:{ar:4},cqVersion:1,cqMigrated:1,cqLegacy:{allres:20,ll:7,edmg:30},rf:{n:20,k:"ll",off:[["ll",5,3,8]]}};var v1power=CQMir2Equip.legacyPower(v1);var v2=CQMir2EquipMigrate.item(v1)');
ok(G('power(v2)>=v1power&&!allMods(v2).ll&&v2.rf.n===20&&rfLimit(v2)>=20'),'v1 migration upgrades without resetting purchased counts');
G('S.bag=[v2];var paidGold=S.gold;rfPick(v2.uid,-1)');
ok(G('!v2.rf.off&&v2.rf.n===20&&S.gold===paidGold'),'paid result can keep original without charge');
G('var sample=Array.from({length:80},(_,i)=>genItem(60,{q:[1,3,4,5,6][i%5]}))');
ok(G('sample.every(it=>Object.keys(it.m).every(k=>CQMir2Equip.allowed.has(k)))'),'new drops use approved properties');
ok(G('PREFIX.every(a=>Object.keys(a.m).every(k=>RF_KEYS.has(k)))'),'random best property pool restricted to eight');
ok(G('Object.values(SETS).every(s=>Object.values(s.bonus||{}).every(m=>Object.keys(m).every(k=>CQMir2Equip.allowed.has(k))))'),'set bonuses fixed and allowed');
// Check a paid obsolete offer against its archived outcome, not just its label.
G('var offered=CQMir2EquipMigrate.item(v1);var archived=JSON.parse(JSON.stringify(v1));delete archived.cqLegacy.ll;archived.m.ll=5;var offeredTarget=CQMir2Equip.legacyPower(archived);S.bag=[offered];rfPick(offered.uid,0)');
ok(G('power(offered)>=offeredTarget'),'converted paid candidate retains archived outcome power');
// A separate VM without the new equipment wrappers supplies an independent old score.
const legacy=require('./cq_harness')('clean_baseline',{exclude:['cq/mir2_equipment.js','cq/mir2_equipment_migrate.js']});
legacy.G("load();CQSys.createChar('旧分支基准','zs');S.lvl=60;calc();var legacySample=['swd1','arm1','rin'].map((id,i)=>{var it=makeBase(BASEM[id],60);it.q=5;it.uid=22000+i;it.m={edmg:30,edef:20,ll:7,allres:20,allsk:2,life:30};return {it,power:power(it)}})");
T.ctx.__baseline=JSON.parse(legacy.G('JSON.stringify(legacySample)'));
ok(G('__baseline.every(row=>power(CQMir2EquipMigrate.item(row.it))>=row.power)'),'independent pre-wrapper power baseline');
T.done();
