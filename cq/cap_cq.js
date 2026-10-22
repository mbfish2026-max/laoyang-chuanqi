// cq/cap_cq.js — 老羊传奇 M2：game.js 伤害结算的实际倍率封顶（紧跟 game.js 加载 → 成为 hitMon 最内层包装）。
// 总倍率 = 装备侧倍率（强化 / 上古·至臻 / 淬锋，按武器估算）× 运行时包装倍率（最外层进入 hitMon 的伤害 → 最内层实际结算伤害之比，含 late.js 属性加伤等）。
// 超过 CQ_BAL.capMul(1.8) 时等比压回。英雄/合击/召唤物伤害由玩家伤害推算，同样按玩家总倍率封顶（src 映射：cqhero→hero，cqheji→combo，cqpet→summon）。
(function(){
const CAP={out:null,depth:0,last:{mul:1,stat:1,wrap:1,capped:false}};
function statMul(){const w=S&&S.eq&&S.eq.weapon||{};const B=CQ_BAL.budget;let m=1;
 if(window.CQFirstdrop)m*=1+CQFirstdrop.bonus();
 if(w.en&&typeof cqEnhPct==='function')m*=1+Math.min(cqEnhPct(w.en),B.enh*100)/100;
 if(w.anc)m*=1+B.anc*(w.anc>=2?1:0.67);
 if(w.rf&&(w.rf.n|0)>0)m*=1+B.rf*Math.min(1,(w.rf.n|0)/10);
 if(S.reb)m*=1+B.reb*Math.min(1,S.reb/(CQ_BAL.rebirthMax||10));
 if(window.CQSoul)m*=CQSoul.damageMul||1;
 return m}
CQ_BAL.statMul=statMul;
CQ_BAL.curMul=src=>CAP.last.wrap*statMul();
const sum=d=>{let t=0;for(const k in d)t+=+d[k]||0;return t};
// 最内层：实际结算
{const f=hitMon;hitMon=function(m,d,src,fxc){if(!d||typeof d!=='object'||src==='dot')return f.apply(this,arguments);
 const tin=sum(d),o=CAP.out;const wrap=o&&o.t>0&&tin>0?Math.max(1,tin/o.t):1;const st=statMul(),mul=wrap*st;
 CAP.last={mul,stat:st,wrap,capped:mul>CQ_BAL.capMul,src:src||null};
 if(mul>CQ_BAL.capMul){const k=CQ_BAL.capMul/mul,d2={};for(const e in d)d2[e]=d[e]*k;d=d2}
 return f.call(this,m,d,src,fxc)}}
// 最外层入口由 cq/m2_cq.js 调用 CQ_CAPIN(d) 记录（它在全部共享包装之后加载）
window.CQ_CAPIN=function(d){CAP.out=d&&typeof d==='object'?{t:sum(d)}:null};
CQ_BAL.capLast=()=>Object.assign({},CAP.last);
})();
