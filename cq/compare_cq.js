'use strict';
// Shared, read-only item comparison. Never temporarily equip or recalculate a character.
(function(){
const labels={dmg:'攻击',mag:'魔法',tao:'道术',def:'防御',mdef:'魔御',ar:'准确',dex:'敏捷',luck:'幸运',life:'生命上限',mana:'魔法上限'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stats(it){const out={};for(const k in labels)out[k]=[0,0];if(!it)return out;
 const m=allMods(it),l=itemLocal(it),r=CQMir2Equip.ranges(it);
 for(const k of ['dmg','mag','tao','def','mdef']){const p=k==='dmg'?['mindmg','maxdmg']:[k+'Min',k+'Max'];out[k]=k==='dmg'?l.min!=null?[l.min,l.max]:(r.dmg||[m.mindmg||0,m.maxdmg||0]).slice():it.cqMigrated?[(m[k]||0)+(m[p[0]]||0),(m[k]||0)+(m[p[1]]||0)]:(r[k]||[0,0]).slice();}
 if(it.cqMigrated&&l.def!=null)out.def=[l.def,l.def];
 for(const k of ['ar','dex','luck','life','mana'])out[k]=[m[k]||0,m[k]||0];return out}
function slots(it){const b=BASEM[it.b];return cqBrace(b)?['shield','gloves']:slotOf(b)==='ring'?['ring1','ring2']:[slotOf(b)]}
// Scores use the existing game formula. Cache per item and class, invalidating on
// all serialized item changes (including in-place enhancement/reforge changes).
const scores=new WeakMap();
function score(it,cls){if(!it)return 0;const sig=JSON.stringify(it),hit=scores.get(it);if(hit&&hit.sig===sig&&hit.cls===cls)return hit.value;const value=power(it,cls);scores.set(it,{sig,cls,value});return value}
function subject(eq){return S.hero&&eq===S.hero.eq?S.hero:S}
function compare(it,eq=S.eq,only){
 const who=subject(eq),ks=only?[only]:slots(it),cls=who===S?curCls():who.cls;
 const k=ks.find(k=>!eq[k])||ks.reduce((a,b)=>score(eq[a],cls)<=score(eq[b],cls)?a:b);
 const current=eq[k]||null,delta=score(it,cls)-score(current,cls),req=itemReq(it);
 const eligible=!!cls&&who.lvl>=req.lv&&(!req.cls||req.cls===cls);
 return {slot:k,current,delta,eligible,better:eligible&&current!==it&&(!current||delta>0)};
}
function powerHTML(it,eq,k){const r=compare(it,eq,k);return '<div class="cqpower '+(r.delta>0?'up':r.delta<0?'dn':'')+'">战力差 '+(r.delta>0?'↑ +':r.delta<0?'↓ ':'＝ ')+r.delta+'</div>'}
function arrow(it,eq=S.eq){return it&&!it.k&&BASEM[it.b]&&compare(it,eq).better?'<i class="cqup" aria-label="战力提升">↑</i>':''}
function html(it,eq=S.eq,only){const a=stats(it);return '<div class="cqcompare">'+(only?[only]:slots(it)).map(k=>{const cur=eq[k],b=stats(cur);return '<section><h4>'+esc(SLOTN[k]||k)+' · '+(cur?esc(itemName(cur)):'空槽，可直接穿戴')+'</h4>'+powerHTML(it,eq,k)+'<div class="cqcompare-head"><span>查看中</span><span>当前装备</span></div>'+Object.keys(labels).map(key=>{const x=a[key],y=b[key];if(![...x,...y].some(Boolean))return '';const d=x.map((v,i)=>v-y[i]),up=d.some(v=>v>0),dn=d.some(v=>v<0),cl=up&&dn?'mixed':up?'up':dn?'dn':'same',arrow=up&&dn?'↑↓':up?'↑':dn?'↓':'＝',fmt=v=>v[0]===v[1]&&!['dmg','mag','tao','def','mdef'].includes(key)?v[0]:v.join('-');return '<div class="cqcompare-row '+cl+'"><span>'+labels[key]+' '+fmt(x)+' '+arrow+'</span><span>'+fmt(y)+'</span><small>差值 '+d.map(v=>v>0?'+'+v:v).join(' / ')+'</small></div>'}).join('')+'</section>'}).join('')+'</div>'}
function sets(it,eq){if(!it.set||!SETS[it.set])return '';const n=Object.values(eq).filter(x=>x&&x.set===it.set).length;return '<div class="sec cqset">套装已穿戴 '+n+' 件'+Object.entries(SETS[it.set].bonus).map(([need,m])=>'<div class="'+(n>=+need?'up':'dim')+'">'+need+'件 · '+(n>=+need?'已激活':'未激活')+'：'+esc(modsTxt(m))+'</div>').join('')+'</div>'}
function perfect(it){
 const best=Object.assign({},it.cqBest),bounds=typeof ancRanges==='function'?ancRanges(it):{};
 for(const k in bounds)if(k in labels||['mindmg','maxdmg'].includes(k))best[k]=it.m?.[k]||0;
 return Object.entries(best).filter(([,v])=>v>0).map(([k,v])=>{const max=bounds[k]?.[1]||(k==='maxdmg'?5:k==='def'?4:3),full=v>=max;return '<div class="cqbest '+(full?'full':'')+'">极品'+esc(labels[k]||({mindmg:'攻击下限',maxdmg:'攻击上限'}[k])||'属性')+' +'+v+(full?' · 满值':'')+'</div>'}).join('');
}

const old=showItem;showItem=function(uid){const busy=CMP_BUSY;CMP_BUSY=1;let ret;try{ret=old.apply(this,arguments)}finally{CMP_BUSY=busy}const f=findItem(uid);if(window.__NOUI||!f||f.it.k)return ret;const p=document.querySelector('#modal .ipanel');if(!p)return ret;const it=f.it;
 p.insertAdjacentHTML('beforeend',perfect(it)+sets(it,S.eq)+html(it));const box=p.querySelector('.btns.c');if(box){box.insertAdjacentHTML('afterbegin','<button class="btn" onclick="toggleLock('+uid+')">'+(it.lk?'解锁':'锁定')+'</button>');if(!f.slot)box.insertAdjacentHTML('beforeend','<button class="btn" '+(rcyProtected(it)?'disabled':'')+' onclick="cqbRecycle('+uid+')">回收</button>');const why=rcyProtected(it);if(why)p.insertAdjacentHTML('beforeend','<div class="dim">回收保护：'+esc(why)+'</div>');if(f.stash){const wear=box.querySelector('button[onclick^="equip("]');if(wear)wear.setAttribute('onclick','stEquip('+uid+')');box.insertAdjacentHTML('beforeend','<button class="btn" onclick="fromStash('+uid+')">取回</button>')}}return ret};
// Keep existing explicit comparison entry on the same canonical path.
cqbCompare=uid=>showItem(uid);
window.CQCompare={compare,score,arrow,stats,slots,html,sets,perfect,hero(uid,k){const it=S.bag.find(x=>x.uid===uid)||Object.values(CQSys.hero().eq).find(x=>x?.uid===uid);if(!it)return;const h=CQSys.hero();modal('<div class="ipanel"><h3>英雄 · '+esc(itemName(it))+'</h3>'+(it.lk?'<p>已锁定 · 回收保护</p>':'')+perfect(it)+sets(it,h.eq)+html(it,h.eq)+'<div class="btns c"><button class="btn" onclick="toggleLock('+uid+');CQCompare.hero('+uid+',\''+k+'\')">'+(it.lk?'解锁':'锁定')+'</button>'+(S.bag.includes(it)?'<button class="btn" '+(compare(it,h.eq,k).eligible?'':'disabled')+' onclick="cqHeroPage.wear('+uid+',\''+k+'\')">穿戴</button>':'')+'<button class="btn" onclick="closeM()">关闭</button></div></div>')}};

if(window.cqHeroPage){cqHeroPage.equip=function(k){const h=CQSys.hero(),it=h.eq[k],items=S.bag.filter(x=>!x.k&&BASEM[x.b]&&slots(x).includes(k));modal('<div class="ipanel"><h3>英雄 · '+esc(SLOTN[k])+'</h3>'+(it?'<button class="btn" onclick="CQCompare.hero('+it.uid+',\''+k+'\')">查看已穿装备</button><button class="btn" onclick="cqHeroPage.unequip(\''+k+'\')">卸下</button>':'<p>空槽，可直接穿戴</p>')+'<div class="hpcandidates">'+items.map(x=>'<button class="btn cqcandidate" data-cq-hero="'+x.uid+'" onclick="CQCompare.hero('+x.uid+',\''+k+'\')">'+itemIcon(x)+arrow(x,h.eq)+esc(itemName(x))+'</button>').join('')+'</div><button class="btn" onclick="closeM()">关闭</button></div>')};}
function refreshHeroCandidates(){
 if(window.__NOUI)return;const nodes=document.querySelectorAll('#modal [data-cq-hero]');if(!nodes.length)return;
 const bag=new Map(S.bag.map(it=>[String(it.uid),it])),eq=S.hero?.eq||{};
 nodes.forEach(node=>{node.querySelector('.cqup')?.remove();const it=bag.get(node.dataset.cqHero);if(it)node.insertAdjacentHTML('beforeend',arrow(it,eq))});
}
const renderBefore=render;render=function(){const r=renderBefore.apply(this,arguments);refreshHeroCandidates();return r};
if(window.CQSys){CQSys.on('hero',refreshHeroCandidates);CQSys.on('char',refreshHeroCandidates)}
const cellBefore=cell;cell=function(it,on){const h=cellBefore.apply(this,arguments);return it&&!it.k?h.replace(/<\/div>$/,arrow(it)+'</div>'):h};
// Explicit links preserve operation dialogs and their pending results.
function detailLink(it){return '<button class="btn" onclick="showItem('+it.uid+')">装备详情 / 对比</button>'}
for(const name of ['fuseUI','refineUI']){const before=CQB6[name];CQB6[name]=function(){const r=before.apply(this,arguments);if(window.__NOUI)return r;const rows=document.querySelectorAll('#modal .b6row');const items=name==='fuseUI'?S.bag.filter(CQB6.eligible).filter((it,i,a)=>a.findIndex(x=>x.b===it.b&&x.name===it.name&&x.q===it.q)===i):Object.keys(CQB6.names).map(k=>S.eq[k]);rows.forEach((row,i)=>{if(items[i])row.insertAdjacentHTML('beforeend',detailLink(items[i]))});return r};}
const forge=rfMain;rfMain=function(uid){const r=forge.apply(this,arguments),it=findItem(uid)?.it;if(!window.__NOUI&&it){const p=document.querySelector('#modal .rf3');if(p)p.insertAdjacentHTML('beforeend',html(it))}return r};
const st=document.createElement('style');st.textContent=`.cqup{position:absolute;right:1px;top:0;color:#75f28d;font-size:14px;line-height:16px;font-weight:bold;text-shadow:0 1px 2px #000;pointer-events:none;z-index:3}.cell,.cqcandidate{position:relative}.cqcandidate .ii{width:32px;height:32px}.cqpower.up{color:#88ec99}.cqpower.dn{color:#ff9090}#modal .b6row{flex-wrap:wrap}#modal .b6row>span{flex:1 1 100%}#modal .b6row>.btn{flex:1}#cq-gamble .cg-card{flex-direction:column}#cq-gamble .cg-card button{padding:4px;font-size:11px;max-width:100%}#modal:has(.ipanel){z-index:10001}#modal .ipanel .btns.cqb-detail-actions{display:flex!important;flex-wrap:nowrap!important}#modal .ipanel .btns.cqb-detail-actions .btn{min-width:44px!important;flex:1 0 44px!important}#modal .btns{display:flex!important;flex-wrap:nowrap!important;overflow-x:auto;max-width:100%;gap:4px}#modal button{min-height:44px;min-width:44px;white-space:nowrap;flex-shrink:0}#modal .ipanel{box-sizing:border-box;max-width:100%}.cqcompare{margin-top:10px}.cqcompare h4{font-size:12px;overflow-wrap:anywhere}.cqcompare-head,.cqcompare-row{display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;line-height:1.8}.cqcompare-row small{grid-column:1/-1}.cqcompare .up,.cqset .up{color:#88ec99}.cqcompare .dn{color:#ff9090}.cqcompare .mixed{color:#f0cf85}.cqbest{padding:5px;margin:4px 0}.cqbest.full{border:1px solid #d7b25e;box-shadow:inset 0 0 4px #d7b25e}.cqcompare section{border-top:1px solid #78603c}`;document.head.appendChild(st);
})();
