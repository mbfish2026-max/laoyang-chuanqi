// 重铸候选固定种子回归：RF_SEED=8 曾只出 1 个候选（头盔词缀池 8 种、物品已占 7 种）。node tests/cq_reforge_seed_test.js
const {execFileSync}=require('child_process'),path=require('path');let pass=0,fail=0;
for(const sd of [8,1,2,3,13,21,34,55]){let out='';try{out=execFileSync(process.execPath,[path.join(__dirname,'reforge_test.js')],{env:Object.assign({},process.env,{RF_SEED:String(sd)}),encoding:'utf8'})}catch(e){out=String(e.stdout||'')+e}
 if(/ 0 fail/.test(out)&&!/✗/.test(out)){pass++}else{fail++;console.log('  ✗ RF_SEED='+sd+' '+(out.match(/✗.*/g)||[]).join(' | '))}}
console.log(`cq_reforge_seed_test: ${pass} pass, ${fail} fail`);process.exitCode=fail?1:0;
