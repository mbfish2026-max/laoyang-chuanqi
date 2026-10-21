// 英雄平衡模拟（step 内英雄，经 cq_bridge 包装）：node cq/cq_hero_balance_sim.js [分钟=60] [职业=zs]
// 输出：玩家/英雄普攻/合击伤害占比、英雄 DPS ÷ 玩家 DPS、合击 ÷ 玩家秒伤（≈几秒 DPS）。目标：普攻 8–10%、合击 6–8 秒、合计 ≤20%。
const fs=require('fs'),path=require('path'),vm=require('vm');const root=path.join(__dirname,'..');
const MIN=+(process.argv[2]||60),CLS=process.argv[3]||'zs';
const T=require(path.join(root,'tests','cq_harness'))('cq_hero_balance_sim');const{G,ctx}=T;
for(const f of['cq/cq_move.js','cq/cq_hero.js','cq/cq_fx.js','cq_bridge.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
G(`S=newSave();S.cls='${CLS}';S.ci=0;if(typeof clsInit==='function')clsInit();calc();H.life=ST.life;H.mana=ST.mana;S.auto=1;S.autoEq=1;S.autoSk=1;S.autoAt=1;TAB='fight';MON=[];spawnT=0.1;
 var SIMD={player:0,hero:0,heji:0,hejiN:0,hejiDps:[]};var _hm=hitMon;hitMon=function(m,d,src){const t=_hm.apply(this,arguments)||0;SIMD[src==='cqhero'?'hero':src==='cqheji'?'heji':'player']+=t;return t};
 CQ._install();var HC=CQ.heroCore();if(window.CQSys&&CQSys.heroCreate&&!CQSys.hero().cls)CQSys.heroCreate(CQSys.heroProfs()[0]);HC.reload();
 var _ap=CQ.heroHejiNow;`);
// 记录每次合击时的玩家 DPS（合击 ÷ DPS = 相当于几秒）
G(`var _dh=HC.doHeji;HC.doHeji=function(h,m){const d=CQ.dps(),r=_dh.apply(this,arguments);if(r&&r.ok){SIMD.hejiN++;if(d>0)SIMD.hejiDps.push(r.total/d)}return r}`);
const dt=0.05;for(let t=0;t<MIN*60;t+=dt){G(`step(${dt})`);if(Math.round(t/dt)%200===0)G("typeof autoTick==='function'&&autoTick()")}
const r=JSON.parse(G('JSON.stringify(SIMD)')),tot=r.player+r.hero+r.heji,hs=r.hejiDps.sort((a,b)=>a-b);
const out={cls:CLS,min:MIN,lvl:G('S.lvl'),share:{hero:+(r.hero/tot).toFixed(4),heji:+(r.heji/tot).toFixed(4),both:+((r.hero+r.heji)/tot).toFixed(4)},
 heroVsPlayer:+(r.hero/r.player).toFixed(4),hejiN:r.hejiN,hejiSecOfDps:hs.length?+hs[hs.length>>1].toFixed(2):null};
console.log(JSON.stringify(out));
if(require.main===module&&process.env.CHECK){const ok=out.heroVsPlayer>=0.07&&out.heroVsPlayer<=0.11&&out.share.both<=0.2;process.exit(ok?0:1)}
