// Current loaded equipment, quality, commerce and storage contracts.
'use strict';
const vm=require('vm');
const {G,ok,done,loadErr}=require('./cq_harness')('items');
ok(!loadErr.length,'runtime loads');
G("load();CQSys.createChar('物品验证','zs');S.lvl=60;calc()");
// Test exact boundaries and one random draw independently of content availability.
const source=G('rollQuality.toString()');
for(const [roll,want] of [[0,5],[.019999,5],[.02,6],[.049999,6],[.05,4],[.249999,4],[.25,3],[.749999,3],[.75,1],[.999999,1]]){
 let draws=0;const q=vm.runInNewContext('('+source+')()',{rnd:()=>{draws++;return roll}});
 ok(q===want&&draws===1,'single quality roll at '+roll);
}
const counts=G('(()=>{const c={};for(let i=0;i<20000;i++){const q=rollQuality();c[q]=(c[q]||0)+1}return c})()');
for(const [q,p] of Object.entries({1:.25,3:.5,4:.2,5:.02,6:.03}))ok(Math.abs(counts[q]/20000-p)<.015,'quality probability '+q);
ok(G("qualityChance('u',85,BASES[0],0,null)===qualityChance('u',85,BASES[0],300,null)"),'MF compatibility input has no effect');
ok(G('new Set(BASES.map(b=>b.id)).size===BASES.length'),'unique base identities');
ok(G('UNIQUES.every(u=>BASEM[u.b]&&u.id)&&SETITEMS.every(u=>BASEM[u.b]&&SETS[u.set]&&(u.id||u.set==="zuma"))'),'all content resolves');
for(const cls of ['zs','fs','ds']){
 G(`S.cls='${cls}';var samples=Array.from({length:300},(_,i)=>genItem(1+i%60,{q:[1,3,4,5,6][i%5]}))`);
 ok(G('samples.every(it=>it.uid&&BASEM[it.b]&&Number.isFinite(power(it))&&power(it)>0)'),'finite equipment power '+cls);
 ok(G('samples.every(it=>Object.keys(allMods(it)).every(k=>CQMir2Equip.allowed.has(k)))'),'only allowed effective attributes '+cls);
 ok(G('samples.every(it=>!it.sock&&!it.soc.length&&!it.rw&&!it.af.length)'),'no obsolete affixes or sockets '+cls);
 ok(G('samples.every(it=>it.name===BASEM[it.b].n||[...UNIQUES,...SETITEMS].some(p=>p.n===it.name&&p.b===it.b))'),'current content names '+cls);
}
G("S.cls='zs';var exact=UNIQUES.slice(0,25).map(u=>CQMir2Equip.createContent(u.id,60,{noAnc:true}))");
ok(G('exact.every(it=>UNIQUES.some(u=>u.id===it.cqContentId&&u.n===it.name&&u.b===it.b))'),'exact content identity and name');
G('S.bag=[];S.rcy.on=0;S.ast.on=0;S.gold=1e7;ensureShop(true);var stock=S.shop.items[0],price=buyPrice(stock),gold=S.gold;buyItem(stock.uid)');
ok(G('S.bag.includes(stock)&&!S.shop.items.includes(stock)&&S.gold===gold-price'),'purchase transfers item and charges once');
G('shopSell(stock.uid)');ok(G('!S.bag.includes(stock)&&S.shop.bb[0].it===stock'),'sale preserves buyback identity');
G('buyBack(0)');ok(G('S.bag.includes(stock)&&!S.shop.bb.length'),'buyback transfers same object');
ok(G('shopSellPrice(stock)<=buyPrice(stock)'),'buy and sell prices ordered');
G('S.gold=0;var pots=JSON.stringify(S.pot);buyPot("hp")');ok(G('S.gold===0&&JSON.stringify(S.pot)===pots'),'insufficient funds preserve potions');
G('var noSpend=S.gold,noBag=JSON.stringify(S.bag),retiredRoll=gamble(0)');ok(G('retiredRoll===null&&S.gold===noSpend&&JSON.stringify(S.bag)===noBag'),'retired gambling cannot charge or generate items');
G('S.bag=Array.from({length:12},()=>genItem(30,{q:4}));ACCT.shared=[[],[],[]];S.pst=[[],[],[]];var identities=S.bag.map(it=>it.uid).sort((a,b)=>a-b).join();var originalPowers=S.bag.map(it=>power(it)).sort((a,b)=>a-b).join();var movedItem=S.bag[0],moved=movedItem.uid;depositUid(moved,"s",0)');
ok(G('!S.bag.some(it=>it.uid===moved)&&ACCT.shared[0].includes(movedItem)&&movedItem.uid!==moved'),'deposit moves item');
G('withdrawUid(movedItem.uid)');ok(G('S.bag.includes(movedItem)&&!ACCT.shared.flat().length'),'withdraw moves item');
G('identities=S.bag.map(it=>it.uid).sort((a,b)=>a-b).join();save();load()');ok(G('S.bag.map(it=>it.uid).sort((a,b)=>a-b).join()===identities&&S.bag.map(it=>power(it)).sort((a,b)=>a-b).join()===originalPowers'),'save reload preserves identities and power');
G('S.bag.push({uid:S.uid++,k:"mat",id:"ess",n:5},{uid:S.uid++,k:"mat",id:"ess",n:3});mergeMats(S.bag)');ok(G('S.bag.filter(it=>it.k==="mat"&&it.id==="ess").length===1&&matCount("ess")===8'),'material merging conserves quantity');
done();
