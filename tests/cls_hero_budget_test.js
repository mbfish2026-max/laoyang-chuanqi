// 英雄+合击 伤害占比 < 20% 且合击能放出：跑 cq/cq_hero_balance_sim.js（10 分钟）三职业：node tests/cls_hero_budget_test.js
const {execFileSync}=require('child_process'),path=require('path');let P=0,F=0;const ok=(c,n)=>{if(c)P++;else{F++;console.error('  ✗ '+n)}};
for(const c of['zs','fs','ds']){const o=JSON.parse(execFileSync('node',[path.join(__dirname,'..','cq','cq_hero_balance_sim.js'),'10',c]).toString().trim().split('\n').pop());
 ok(o.share.both<0.2,`${c} 英雄+合击占比 ${o.share.both} < 0.2`);ok(o.hejiN>=15,`${c} 10 分钟合击 ${o.hejiN} 次（冷却 30 秒）`);ok(o.share.heji>=0.05,`${c} 合击占比 ${o.share.heji} ≥ 5%（未被英雄挤掉）`)}
console.log(`cls_hero_budget_test: ${P} pass, ${F} fail`);if(F)process.exit(1);
