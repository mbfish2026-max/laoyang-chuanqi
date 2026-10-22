'use strict';
// R10: item-owned progress; fixed legendary damage, never random affixes.
(function(){
 const limits=[1000,10000,50000,200000], names=['初醒','共鸣','天威','终焉'];
 const credited=new WeakSet();
 function eligible(it){const b=it&&BASEM[it.b];return !!(b&&b.s==='weapon'&&!it.k&&(b.tier>=2||it.q>=3))}
 function kills(it){return eligible(it)?Math.min(200000,Math.max(0,Math.floor(Number(it.soulKills)||0))):0}
 function stage(it){return limits.filter(n=>kills(it)>=n).length}
 function profile(it){const b=BASEM[it.b],key=b.ccls==='fs'?'魔法':b.ccls==='ds'?'道术':'攻击';let seed=0;for(const c of it.b)seed+=c.charCodeAt(0);return names.map((n,i)=>({name:b.n+'·'+['锋魂','鸣魂','威魂','归魂'][i],text:key+'魂伤 +'+(1+(seed+i)%3),flat:1+(seed+i)%3}))}
 function flat(it){return eligible(it)?profile(it).slice(0,stage(it)).reduce((a,x)=>a+x.flat,0):0}
 function multiplier(it,total){return 1+Math.min(CQ_BAL.budget.soul,Math.max(0,total)>0?flat(it)/total:0)}
 function flash(it,s){if(window.__NOUI)return;const e=document.createElement('div');e.className='cqsoul-flash';e.textContent=BASEM[it.b].n+' · '+names[s-1];document.body.appendChild(e);e.addEventListener('animationend',()=>e.remove(),{once:true});setTimeout(()=>e.remove(),1600)}
 function credit(m,it){if(!m||credited.has(m))return 0;credited.add(m);if(!eligible(it))return 0;const old=stage(it),weight=m.boss?20:(m.fl==='champ'||m.fl==='uniq'||m.elite)?3:1;it.soulKills=Math.min(200000,kills(it)+weight);const s=stage(it);if(s>old){it.soulSeen=s;flash(it,s)}return weight}
 const kill=killMon;killMon=function(m){const it=S.eq&&S.eq.weapon;const r=kill.apply(this,arguments);credit(m,it);return r};
 const hit=hitMon;hitMon=function(m,d,src,fxc){let soulMul=1;if(d&&typeof d==='object'&&src!=='dot'&&!['cqhero','cqheji','cqpet','hero','combo','summon'].includes(src)){const total=Object.values(d).reduce((a,x)=>a+(+x||0),0),p=multiplier(S.eq&&S.eq.weapon,total);soulMul=p;if(p>1){d=Object.assign({},d);for(const k in d)d[k]*=p}}const prev=CQSoul.damageMul;CQSoul.damageMul=soulMul;try{return hit.call(this,m,d,src,fxc)}finally{CQSoul.damageMul=prev}};
 const color=itemColor;itemColor=function(it){return stage(it)===4?'#ffb34d':color.apply(this,arguments)};
 function ui(uid,selected){const f=findItem(uid),it=f&&f.it;if(!eligible(it))return;const s=stage(it),p=profile(it),j=Math.max(0,Math.min(3,selected==null?Math.min(s,3):selected));modal(`<div class="ipanel cqsoul"><div class="mtitle">${BASEM[it.b].n} · 器魂</div><div class="cqsoul-tabs" role="tablist">${names.map((n,i)=>`<button class="btn ${i===j?'gold':''}" role="tab" aria-selected="${i===j}" onclick="CQSoul.ui(${uid},${i})">${n}</button>`).join('')}</div><p>累计魂数 <b>${kills(it).toLocaleString()}</b> / 200,000</p><small>普通 1 · 精英 3 · 首领 20；随本件武器保存</small>${limits.map((n,i)=>`<div class="cqsoul-row ${i>=s?'locked':''} ${i===j?'selected':''}"><b>${names[i]} · ${n.toLocaleString()}</b><progress value="${Math.min(kills(it),n)}" max="${n}"></progress><span>${p[i].name}：${p[i].text} ${i<s?'已觉醒':'未觉醒'}</span></div>`).join('')}<p class="dim">固定魂伤随命中结算，累计增伤最多 10%。</p><div class="btns c"><button class="btn" onclick="showItem(${uid})">装备详情</button><button class="btn" onclick="CQSoul.close()">关闭</button></div></div>`)}
 function close(){closeM();document.querySelector('#modal').classList.add('hide')}
 if(!window.__NOUI)document.addEventListener('click',e=>{if(e.target.id==='modal'&&e.target.querySelector('.cqsoul')){e.stopImmediatePropagation();close()}},true);
 let wrapped;
 function wire(){if(showItem===wrapped)return;const show=showItem;wrapped=showItem=function(uid){const r=show.apply(this,arguments),f=findItem(uid);if(!window.__NOUI&&f&&eligible(f.it)){const title=document.querySelector('#modal .ipanel .ih b');if(title&&stage(f.it)===4)title.style.color='#ffb34d';const p=document.querySelector('#modal .ipanel .btns');if(p)p.insertAdjacentHTML('beforeend',`<button class="btn" onclick="CQSoul.ui(${uid})">器魂 · ${names[stage(f.it)-1]||'未醒'}</button>`)}return r}}
 window.CQSoul={eligible,kills,stage,profile,flat,multiplier,credit,ui,close,wire,limits};wire();
 const install=CQMir2Equip.install;CQMir2Equip.install=function(){const r=install.apply(this,arguments);wire();return r};
})();
