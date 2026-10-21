// 技能书 + 熟练度 成长模拟（auto_growth_plan）：CLS=zs|fs|ds SEED=7 node tests/cq_book_sim.js [小时=30]
// 全自动挂机；记录到达 Lv 7/15/22/30/40 时各技能等级、熟练度、掉书数。目标（主技能，旧 20 级按比例）：Lv22≥3、Lv30≥5、Lv40≥8
const T=require('./cq_harness')('cq_book_sim',{seed:+(process.env.SEED||7)});const{G}=T;const CLS=process.env.CLS||'zs';
G(`S=newSave();S.cls='${CLS}';S.ci=0;clsInit();if(typeof ensureLoot==='function')ensureLoot();calc();H.life=ST.life;H.mana=ST.mana;if(!S.actU)S.actU=[0,0,0];S.auto=1;S.autoEq=1;S.autoSk=1;TAB='fight';MON=[];spawnT=0.1;
 window._bd=0;CQSys.on('bookDrop',()=>_bd++);`);
const H=+process.argv[2]||30,dt=0.05,marks=[7,15,22,30,40],seen={};let t=0;
for(;t<H*3600;t+=dt){G(`step(${dt})`);if(Math.round(t/dt)%20===0){G('autoTick()');const L=G('S.lvl');for(const m of marks)if(L>=m&&!seen[m]){seen[m]=1;
 console.log(`${(t/3600).toFixed(1)}h Lv${L} 掉书${G('_bd')} 技能`,G(`JSON.stringify(Object.fromEntries(Object.entries(S.sk).filter(x=>x[1]>0).map(([k,v])=>[k,v+'/'+((S.skx||{})[k]|0)])))`))}if(seen[40])break}}
console.log('end',(t/3600).toFixed(1)+'h','lv',G('S.lvl'),'kills',G('S.kills'));
