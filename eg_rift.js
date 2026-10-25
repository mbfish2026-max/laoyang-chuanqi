'use strict';
// 幽冥圣域共用怪池工具与只读历史，旧玩法已停用。
function egRiftPool(a){const s=new Set();for(const z of ACTS[a].zones)for(const m of z.mons||[])if(MONS[m])s.add(m);return[...s]}
function egRiftNorm(a,ml){const st=p=>{let h=0,d=0;for(const k of p){const m=_eg_mkMonQ(k,ml);h+=m.max;d+=(m.dmg[0]+m.dmg[1])/2}return[h/p.length,d/p.length]};
 const all=ACTS.map((_,i)=>st(egRiftPool(i)));const ah=all.reduce((s,x)=>s+x[0],0)/all.length,ad=all.reduce((s,x)=>s+x[1],0)/all.length;return{h:ah/all[a][0],d:ad/all[a][1]}}
function _eg_mkMonQ(k,lv){const u=mUid;const m=mkMon(k,lv);mUid=u;return m}
function egRank(){try{return JSON.parse(GS.getItem('cq-eg_rank'))||[]}catch(e){return[]}}
function egRankHistory(){return '<div class="gp"><h3>历史功业</h3><p>封存记录 '+Object.keys((EG().history||{}).ach||{}).length+' 项，仅供核对。</p></div><div class="gp"><h3>历史挑战记录</h3>'+egRank().map(r=>'<div class="row"><span>'+Number(r.t||0)+'层</span><span>'+egTime(Number(r.s||0))+' · Lv.'+Number(r.lv||0)+'</span></div>').join('')+'</div>'}
egPage({k:'history',n:'历史',render:egRankHistory});
