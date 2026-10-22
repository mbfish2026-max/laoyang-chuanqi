// Test the actual integrated index/runtime, without temporary extension injection.
const fs=require('fs'),path=require('path');
const T=require('./cq_harness')('mir2_maps_test'),{G,ok}=T;
G('load();CQSys.createChar("地图验证","zs")');
const baseline=require('./cq_harness')('mir2_pre_map',{exclude:['cq/mir2_maps.js','cq/mir2_loot.js']});
const old=JSON.parse(baseline.G('JSON.stringify(BOSSES)')),equipment=baseline.G('JSON.stringify([BASES,UNIQUES,SETS,SETITEMS])');
G('CQMir2Maps.install();CQMir2Loot.install();CQMir2Maps.fresh(S);applyDiff()');
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'CQ scripts load');
ok(G('ACTS.length')===7,'seven chapters');
ok(G('ACTS.slice(3).map(a=>a.n.split("·")[1].trim()).join()')==='祖玛寺庙,赤月峡谷,牛魔寺庙,魔龙城','chapter names');
ok(G('JSON.stringify([BASES,UNIQUES,SETS,SETITEMS])')===equipment,'equipment definitions remain byte equivalent');
ok(G('new Set(ACTS.map(a=>a.id)).size===7&&new Set(ACTS.flatMap(a=>a.zones.map(z=>z.id))).size===ACTS.flatMap(a=>a.zones).length'),'unique stable IDs');
ok(G('ACTS.every(a=>a.zones.every(z=>z.mons.every(k=>MONS[k])&&(z.bosses||(z.boss?[z.boss]:[])).every(k=>BOSSES[k])))'),'all entity references resolve');
ok(G('ACTS.slice(3).every(a=>a.zones.slice(0,a.mainEnd+1).every(z=>!z.side)&&a.zones.slice(a.mainEnd+1).every(z=>z.side))'),'branches appended after main chain');
ok(G('ACTS.every((a,i)=>QUESTS[a.fq].fin&&a.fq===(i?"a"+(i+1)+"q6":"q6"))'),'canonical final quest IDs');
ok(G('ACTS.slice(3).every((a,j)=>Array.from({length:6},(_,i)=>"a"+(j+4)+"q"+(i+1)).every(q=>a.zones.some(z=>z.quest===q||(z.quests||[]).includes(q))))'),'all new quests have a location');
for(const [key,id] of Object.entries({treedemon:'cqfengmovalley',stonezombieking:'cqshimu7',skelspirit:'cqskel2',zombieking:'cqbichimine',rakecatking:'cqbairimen',orclord:'cqfengmovalley',womalord:'cqwoma3',chulongshen:'cqdeathvalley',zumalord:'cqzumahome',chiyuedemon:'cqchiyuelair',niumoking:'cqniumohall',molonglord:'cqmolonghall'}))ok(G(`(()=>{const b=CQSys.bossRt('${key}');return ACTS[b.act].zones[b.zone].id})()` )===id,'boss location '+key);
for(const [key,b] of Object.entries(old))if(G(`!!BOSSES['${key}']`))ok(G(`BOSSES['${key}'].hp`)>=b.hp&&G(`BOSSES['${key}'].dmg[1]`)>=b.dmg[1],'boss not weakened '+key);
let legacy=JSON.parse(G('JSON.stringify(S)'));
Object.assign(legacy,{act:1,zone:5,unl:5,wave:4,cleared:{0:1,5:1},q:{q6:1,a2q6:1},Q:{0:{a2q6:1},1:{a4q3:1},2:{a5q6:1}},CL:{'1_2':{5:1},'2_4':{2:1,3:1,18:1}},UN:{'1_2':5,'2_4':18},ZN:{'1_2':5,'2_4':18},actU:{0:2,1:3,2:4},diffU:2,bossRt:{valax:{k:300,n:1},zumalord:{k:400,n:2},seal1:{k:500,n:2},fallen:{k:600,n:1}},unknown:{preserve:true}});
delete legacy.mir2Mig;G('window._legacy='+JSON.stringify(legacy));const before=G('JSON.stringify(_legacy)');G('window._mapped=CQMir2Maps.migrate(_legacy)');
ok(G('JSON.stringify(_legacy)')===before,'migration is pure');
ok(G('ACTS[_mapped.act].zones[_mapped.zone].id')==='cqbichimine','cross-chapter current position');
ok(G('_mapped.CL["1_3"][15]')===1,'stone king progress moved to branch');
ok(G('_mapped.CL["2_4"][2]&&_mapped.CL["2_4"][6]&&_mapped.UN["2_4"]>=6'),'merged progress union');
ok(G('_mapped.Q[1].a4q6&&_mapped.actU[1]>=4&&_mapped.actU[2]>=5&&_mapped.diffU===2'),'finished chapters and all difficulty unlocks preserved');
ok(G('_mapped.bossRt.zumalord.k===400&&_mapped.bossRt.zumalord.n===3&&_mapped.bossRt.zumaguard.k===600'),'boss aliases preserve kills and latest refresh');
ok(G('_mapped.unknown.preserve&&_mapped.mir2MapLegacy.zone===5'),'unknown data and source snapshot preserved');
ok(G('JSON.stringify(CQMir2Maps.migrate(_mapped))===JSON.stringify(_mapped)'),'repeat migration is identical');
ok(G('JSON.stringify(CQMir2Maps.migrate({mir2Mig:{maps:9},act:8}))===JSON.stringify({mir2Mig:{maps:9},act:8})'),'future version untouched');
ok(G('CQMir2Maps.migrate({act:99,zone:999,diff:0}).zone===0'),'unknown layout safe fallback');
for(const cls of ['zs','fs','ds']){
 G(`CQSys.createChar('地图${cls}','${cls}');CQMir2Maps.fresh(S);S.lvl=60;S.auto=0`);
 for(let d=0;d<3;d++){
  G(`S.diff=${d};S.diffU=2;S.actU[${d}]=6;applyDiff()`);
  ok(G(`ACTS.every((a,ai)=>a.zones.every((z,zi)=>{S.act=ai;S.zone=zi;S.wave=z.w-1;S.bossRt={};MON=[];spawnWave();return MON.length>0&&MON.every(m=>Number.isFinite(m.hp)&&m.hp>0&&Number.isFinite(m.dmg[1]))}))`),cls+' every zone spawns on difficulty '+d);
 }
}
G('S.diff=0;S.act=3;S.zone=ACTS[3].mainEnd;S.unl=S.zone;S.q={};S.Q[0]=S.q;S.cleared={};S.CL["0_3"]=S.cleared;S.auto=1;S.lvl=60;S.actU[0]=3;zoneClear()');
ok(G('!!S.q.a4q6&&S.act===4&&S.zone===0&&S.auto===1'),'main endpoint advances without entering appended branches');
G('S.act=6;S.zone=4;S.unl=4;S.q={};S.Q[0]=S.q;S.auto=0;zoneClear()');ok(G('S.q.a7q5&&S.q.a7q6'),'both quests at dragon hall complete');
ok(G('CQMir2Loot.pool("zombieking").some(r=>r.id==="book_fs_mfd")&&CQMir2Loot.pool("niumoking").some(r=>r.id==="wandxiaoyaoshan")'),'reference drops use contract IDs');
ok(G("Object.keys(CQMir2Loot.rows).every(k=>CQMir2Loot.pool(k).every(r=>r.resolved))"),'all equipment and book content references resolve after integration');
ok(G('Object.values(CQMir2Loot.rows).every(rows=>rows.every(([id,n])=>typeof id==="string"&&n>0))'),'valid drop weights');
// Resolve and materialize a stable equipment reference without redefining it in the map block.
G(`window._roll=rollTC;window._random=Math.random;Math.random=()=>0;window._it=rollTC(Object.assign(mkMon('skelspirit',30),{boss:1}));Math.random=_random`);
ok(G('_it.some(it=>it.b==="wand4")'),'reference pool participates in actual loot generation');

G(`window._pool=CQMir2Loot.rows.__pending;CQMir2Loot.rows.__pending=[['mir2_equipment_pending',1]];window._rng=Math.random;Math.random=()=>0;window._safe=rollTC(Object.assign(mkMon('redsnakeking',10),{key:'__pending',boss:1}));Math.random=_rng;delete CQMir2Loot.rows.__pending`);
ok(G("CQMir2Loot.resolve('mir2_equipment_pending')===null&&_safe.every(it=>it&&(it.k?!!MATS[it.id]:!!BASEM[it.b]))"),'pending equipment references skip safely without empty items');
G("window._late=CQMir2Loot.resolve('book_future_integration');MATS.book_future_integration={n:'test'}");
ok(G("_late===null&&CQMir2Loot.resolve('book_future_integration').type==='book'"),'late definitions are resolved dynamically without a negative cache');G('delete MATS.book_future_integration');
const assets=G('CQMir2Maps.artFiles');
ok(Object.keys(assets).length===68&&Object.values(assets).every(p=>fs.existsSync(path.join(__dirname,'..',p))),'68 generated creature sprites exist');
for(const c of G('CQMir2Maps.chapters'))ok(fs.existsSync(path.join(__dirname,'..',c.bg))&&fs.existsSync(path.join(__dirname,'..',c.thumb)),'chapter '+(c.act+1)+' scene and thumbnail exist');
G('CQMir2Maps.registerArt()');ok(G('Object.keys(CQMir2Maps.artFiles).every(k=>CQSys.monArt(k).src===CQMir2Maps.artFiles[k])'),'CQSys resolves generated art paths');
ok(G('!BOSSES.rakecatelite&&!BOSSES.orcelite&&ACTS[0].zones[2].elite==="rakecatelite"&&ACTS[0].zones[6].elite==="orcelite"'),'starter encounters are ordinary champions, relocated chiefs remain distinct');
G('S.act=0;S.diff=0;S.zone=2;S.wave=ACTS[0].zones[2].w-1;MON=[];spawnWave()');ok(G('MON.some(m=>m.key==="rakecatelite"&&m.champ&&!m.boss)'),'starter champion spawns without boss flag');
ok(G('rollTC(Object.assign(mkMon("molongfake",60),{boss:1})).length===0'),'false dragon lord has no loot');
ok(G('CQMir2Loot.pool("stonezombieking").some(r=>r.id==="swdcaijuezhizhang"&&r.denominator===4000)'),'stone king exact reference drop denominator');
const oldPositions=[['cqvillage','cqbichisouth','cqbichiwest','cqbichieast','cqbichinorth','cqsnakevalley','cqorctomb'],['cqskel1','cqskel2','cqskel3','cqwomaforest','cqwomaentrance','cqbichimine'],['cqminesouth','cqmineeast','cqmine1','cqmine2','cqminepit','cqshimu7'],['cqzuma1','cqzuma2','cqzuma3','cqzuma5','cqzumahome'],['cqbairimen','cqjunglemaze','cqchiyueeast','cqchiyueeast','cqchiyuesouth','cqchiyuesouth','cqchiyuenorth','cqchiyuenorth','cqchiyuesquare','cqchiyuesquare','cqchiyuesquare','cqchiyuesquare','cqchiyuesquare','cqchiyuesquare','cqchiyuelair','cqchiyuelair','cqchiyuelair','cqchiyuelair','cqchiyuelair']];
for(let d=0;d<3;d++)oldPositions.forEach((zs,a)=>zs.forEach((id,z)=>{
 const raw={act:a,zone:z,diff:d,unl:z,actU:{[d]:a},cleared:{[z]:1},q:{}};
 G('window._position=CQMir2Maps.migrate('+JSON.stringify(raw)+')');
 ok(G('ACTS[_position.act].zones[_position.zone].id')===id&&G('_position.cleared[_position.zone]===1&&_position.unl>=_position.zone'),'legacy '+d+'/'+a+'/'+z+' -> '+id);
}));
G('CQSys.createChar("持久迁移","zs")');ok(G('S.mir2Mig.maps===1&&!S.mir2MapLegacy'),'new characters start marked without legacy snapshot');
G('delete S.mir2Mig;S.act=2;S.zone=5;S.unl=5;S.ZN={"0_2":5};S.UN={"0_2":5};S.CL={"0_2":{5:1}};S.Q={0:{a3q6:1}};S.q=S.Q[0];S.cleared=S.CL["0_2"];save();load()');
ok(G('ACTS[S.act].zones[S.zone].id==="cqshimu7"&&S.mir2Mig.maps===1'),'real persisted save load migrates across chapters');
G('save();window._loaded=JSON.stringify(Object.assign({},S,{last:0}));load()');ok(G('JSON.stringify(Object.assign({},S,{last:0}))===_loaded'),'second persisted reload is identical except baseline last-login timestamp');
G('window._union=CQMir2Maps.migrate({act:0,zone:0,diff:0,Q:{0:{q6:1}},q:{q6:0},CL:{"0_0":{0:1}},cleared:{0:0}})');ok(G('_union.Q[0].q6===1&&_union.CL["0_0"][0]===1'),'cached zero never overwrites completed progress');

for(const cls of ['zs','fs','ds'])for(let d=0;d<3;d++){
 G(`CQSys.createChar('可达${cls}','${cls}');CQMir2Maps.fresh(S);S.lvl=60;S.diffU=2;S.diff=${d};S.actU[${d}]=0;S.Q[${d}]={};S.q=S.Q[${d}];S.auto=0;applyDiff()`);
 ok(G(`(()=>{for(let a=0;a<7;a++){if(!actOpen(a,${d}))return false;goAct(a,${d},1);for(let z=0;z<=ACTS[a].mainEnd;z++){if(z>S.unl)return false;goZone(z);S.wave=zoneData().w-1;MON=[];spawnWave();for(const m of MON)if(m.qb){m.hp=0;bossKilled(m);}zoneClear();}if(!S.q[ACTS[a].fq])return false;}return true;})()`),cls+' difficulty '+d+' complete quest/unlock route at level 60');
}
T.done();
