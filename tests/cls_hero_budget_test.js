// 真实 step 战斗：玩家三职业 × 英雄三职业，每组合 60 分钟。
const {execFileSync}=require('child_process'),path=require('path'),assert=require('assert');
const rows=[];
for(const cls of ['zs','fs','ds'])for(const hero of ['zs','fs','ds']){
 const o=JSON.parse(execFileSync(process.execPath,[path.join(__dirname,'..','cq','cq_hero_balance_sim.js'),'60',cls,hero],{timeout:180000}).toString().trim().split('\n').pop());
 assert.strictEqual(o.hero,hero);assert.strictEqual(o.min,60);
 assert(Number.isFinite(o.share.both)&&o.share.both>0&&o.share.both<=0.25,`${cls}/${hero} share=${o.share.both}`);
 assert(o.hejiN>0,`${cls}/${hero} 未释放合击`);
 assert(o.skShare>0,`${cls}/${hero} 未释放英雄技能`);
 rows.push(o);console.log(`${cls}/${hero}: ${(o.share.both*100).toFixed(2)}%, 合击 ${o.hejiN}`);
}
console.log('cls_hero_budget_test: 9 combinations pass');
if(process.env.HERO_REPORT)require('fs').writeFileSync(process.env.HERO_REPORT,JSON.stringify(rows,null,2)+'\n');
