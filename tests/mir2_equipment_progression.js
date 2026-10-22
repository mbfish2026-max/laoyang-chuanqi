'use strict';
// Fast batched fixed-step campaign comparison; character creation always uses CQSys.
// node tests/mir2_equipment_progression.js zs before|after [hours=80]
const fs=require('fs'),vm=require('vm'),path=require('path');
const {G,ctx}=require('./mir2_equipment_test_loader')(require('./cq_harness'),'mir2_equipment_progression');
const cls=process.argv[2]||'zs',after=process.argv[3]!=='before',hours=+(process.argv[4]||80),dt=+(process.env.SIM_DT||0.05);
if(after){for(const f of ['cq/mir2_equipment.js','cq/mir2_equipment_migrate.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx,{filename:f});G('CQMir2Equip.install()')}
if(process.env.SIM_CACHE_POWER==='1')G(require('./mir2_equipment_sim_cache'));
ctx.__paceProgress=h=>process.stderr.write(cls+' '+(after?'after':'before')+' '+h+'h\n');
G(`(()=>{load();CQSys.createChar('装备节奏','${cls}');S.auto=1;S.autoEq=1;S.autoSk=1;TAB='fight';MON=[];spawnT=0.1;calc();H.life=ST.life;H.mana=ST.mana;window.PACE={first:{},deaths:0};var oldDeath=die;die=function(){PACE.deaths++;return oldDeath.apply(this,arguments)};
for(let i=0;i<${hours}*3600/${dt};i++){step(${dt});if(i%Math.round(1/${dt})===0){autoTick();for(let a=0;a<ACTS.length;a++){const fq=ACTS[a].fq;if(S.q&&S.q[fq]&&PACE.first[a]==null)PACE.first[a]=+(i*${dt}/3600).toFixed(4)}}if(i&&i%Math.round(36000/${dt})===0)__paceProgress(i*${dt}/3600)}
PACE.lvl=S.lvl;PACE.act=S.act;PACE.zone=S.zone;PACE.power=CQSys.power();PACE.life=ST.life;})();`);
console.log(JSON.stringify({cls,after,hours,dt,...JSON.parse(G('JSON.stringify(PACE)'))}));
