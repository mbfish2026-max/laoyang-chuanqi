'use strict';
// Exercise public loading and dropping, rather than temporary injection wires.
const T=require('./cq_harness')('mir2_integration_test'),{G,ok}=T;
G("load();CQSys.createChar('集成验证','ds');S.auto=0;S.lvl=42;calc()");
ok(!T.loadErr.some(e=>!e.startsWith('bagux.js: MutationObserver')),'integrated scripts load without errors');
ok(G('Object.values(blBuild()).flat().every(id=>UNIQUES.some(u=>u.id===id))'),'boss pools retain stable unique content IDs');
ok(G('Object.keys(CQMir2Loot.rows).every(k=>CQMir2Loot.pool(k).every(r=>r.resolved))'),'all map equipment IDs resolve');
G("var originalRandom=Math.random;Math.random=()=>0;var referenceDrops=rollTC(Object.assign(mkMon('molonglord',60),{boss:1}));Math.random=originalRandom");
ok(G('referenceDrops.filter(it=>it.set).some(it=>it.cqContentId==="set_leiting_helm")'),'map set drops use exact content factory');
ok(G('referenceDrops.filter(it=>!it.k).every(it=>it.cqVersion===1&&it.cqRange&&it.cqBest)'),'map drops have complete legendary metadata');
G("var unknown={uid:90001,b:'future_legacy_armor',q:4,def:37,m:{life:55},en:7,rf:3,lock:1};S.bag=[unknown];S.sv=0;delete S.mir2Mig;ACCT.shared=[[JSON.parse(JSON.stringify(unknown))]];var oldLevel=S.lvl;save();load()");
ok(G('S.bag[0].uid===90001&&S.bag[0].cqUnknown.b==="future_legacy_armor"&&S.bag[0].en===7&&S.bag[0].rf.n===3&&S.bag[0].rf.k===null&&S.bag[0].rf.off===null&&S.bag[0].lock===1'),'load migrates unknown legacy gear before cleanup');
ok(G('S.lvl===oldLevel&&allMods(S.bag[0]).life>=55'),'legacy level and effective modifiers preserved');
ok(G('ACCT.shared[0][0].cqVersion===1&&ACCT.shared[0][0].uid===90001'),'shared account gear migrates with character');
G('var savedState=JSON.stringify(S),savedAccount=JSON.stringify(ACCT.shared);load()');
ok(G('JSON.stringify(S.bag)===JSON.stringify(JSON.parse(savedState).bag)&&JSON.stringify(ACCT.shared)===savedAccount'),'reloading is idempotent');
G('var savedRaw=GS.getItem(CH_PRE+ACCT.cur),oldMigration=CQMir2EquipMigrate.migrate;CQMir2EquipMigrate.migrate=()=>{throw new Error("injected migration failure")};load();CQMir2EquipMigrate.migrate=oldMigration');
ok(G('GS.getItem(CH_PRE+ACCT.cur)===savedRaw'),'failed migration never writes a success save');
T.done();
