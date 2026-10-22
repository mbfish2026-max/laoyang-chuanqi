'use strict';
// Run the existing nine-combination simulator with temporary extension loading.
// node tests/mir2_equipment_sim.js [minutes=60] [class=zs] [hero=zs]
const Module=require('module'),fs=require('fs'),vm=require('vm'),path=require('path');
const original=Module._load;
Module._load=function(id,parent,isMain){const out=original.apply(this,arguments);if(/cq_harness$/.test(id))return function(){const t=require('./mir2_equipment_test_loader')(out,...arguments);if(!process.env.EQUIP_SIM_BASELINE){for(const f of ['cq/mir2_equipment.js','cq/mir2_equipment_migrate.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),t.ctx,{filename:f});t.G('CQMir2Equip.install()')}const run=t.G,cls=['zs','fs','ds'].includes(process.argv[3])?process.argv[3]:'zs';t.G=source=>run(source.replaceAll("if(src==='cqhero'||src==='cqheji'){","if(src==='cqhero'||src==='cqheji'||(src&&src.owner==='hero')){").replaceAll("src==='cqhero'?'hero':'heji'","src==='cqheji'?'heji':'hero'").replaceAll("SIMD[src==='cqhero'?'hero':src==='cqheji'?'heji':'player']","SIMD[(src==='cqhero'||(src&&src.owner==='hero'))?'hero':src==='cqheji'?'heji':'player']").replace("CQSys.createChar('英雄模拟','fs')","CQSys.createChar('英雄模拟',"+JSON.stringify(cls)+")"));return t};return out};
require('../cq/cq_hero_balance_sim.js');
