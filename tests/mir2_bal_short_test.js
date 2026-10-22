'use strict';
// R16: fixed seed, no progression loops; exercise the real damage wrapper stack.
const T=require('./cq_harness')('mir2_bal_short_test'),{G,ok}=T;
ok(!T.loadErr.length,'all scripts loaded');
const rows=[];
for(const cls of ['zs','fs','ds'])for(const raw of [10,1000]){
 const r=JSON.parse(G(`(()=>{
 load();CQSys.createChar('叠加短验','${cls}');S.lvl=60;
 const id=Object.keys(BASEM).find(k=>BASEM[k].s==='weapon'&&BASEM[k].ccls==='${cls}'&&BASEM[k].tier>=2);
 const w=makeBase(BASEM[id],60);S.eq.weapon=w;
 const m={hp:1e12,max:1e12,res:{},def:0,lv:1,key:'deer'};
 calc();ST.dsx=0;const base=hitMon(m,{phys:${raw}},'player');
 w.en=9;w.anc=2;w.rf={n:10};w.soulKills=200000;S.reb=10;
 CQFirstdrop.state().titles=Object.fromEntries(Array.from({length:100},(_,i)=>['t'+i,'首爆']));
 calc();ST.dsx=0;const full=hitMon(m,{phys:${raw}},'player');
 return JSON.stringify({cls:'${cls}',raw:${raw},weapon:id,base,full,ratio:full/base,soul:CQSoul.multiplier(w,${raw}),title:CQFirstdrop.bonus(),budget:cqBudgetProduct(),last:CQ_BAL.capLast()});
 })()`));
 ok(r.title===0.05&&r.soul>1&&r.soul<=1.1,`${cls}/${raw}: title/soul budget`);
 ok(r.last.capped&&r.last.mul>1.8,`${cls}/${raw}: full stack reaches cap`);
 ok(r.base>0&&r.full>0&&r.ratio<=1.8+1e-6,`${cls}/${raw}: actual damage ratio ${r.ratio}`);
 rows.push(r);
}
if(process.env.BAL_REPORT)require('fs').writeFileSync(process.env.BAL_REPORT,JSON.stringify(rows,null,2)+'\n');
T.done();
