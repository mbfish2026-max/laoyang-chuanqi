// R07: isolated appraisal state, loot wrapper and UI. No shared equipment mutations.
(function(){
'use strict';
const TIERS=['basic','woma','zuma','chiyue','molong','molongplus','baijin','xingwang'];
const TN=['基础','沃玛','祖玛','赤月','魔龙','强化魔龙','白金','星王'];
const QN=['精良','稀有','极品','套装','上古','至臻'];
const SN={weapon:'武器',armor:'衣服',helm:'头盔',amulet:'项链',shield:'左镯',gloves:'右镯',ring:'戒指',belt:'腰带',boots:'鞋子'};
const A=window.CQGamble={tiers:TIERS,names:QN,config:{bossDrop:.35,eliteDrop:.08,recycle:.1}};
function state(){if(!S.cqGamble)S.cqGamble={v:1,pity:0,pending:[],last:[]};const s=S.cqGamble;if(!Array.isArray(s.pending))s.pending=[];if(!Array.isArray(s.last))s.last=[];s.pity=Math.max(0,Math.min(49,Math.floor(+s.pity||0)));return s}
A.state=state;
A.rates=function(diff){const k=[.7,.85,1][diff]||1;const p=[55,30,9,5.5,.45,.05];for(let i=2;i<6;i++)p[i]*=k;p[0]=100-p.slice(1).reduce((a,b)=>a+b,0);return p};
A.price=t=>20000*(TIERS.indexOf(t)+1);
A.pool=function(t,slot,cls){return BASES.filter(b=>b.cqTier===t&&(!slot||b.s===slot)&&(!b.ccls||b.ccls===cls))};
A.receive=function(t,slot){if(!TIERS.includes(t)||!SN[slot]||!A.pool(t,slot,curCls()).some(b=>SETITEMS.some(u=>u.b===b.id)))return false;state().pending.push({tier:t,slot});save();return true};
A.drop=function(m,random=rnd){if(!m||m.raised)return false;const boss=m.boss||m.actboss,elite=m.fl==='champ'||m.fl==='uniq';if(!boss&&!elite||random()>=(boss?A.config.bossDrop:A.config.eliteDrop))return false;
 const t=TIERS[Math.min(7,Math.max(0,S.act||0))],slots=Object.keys(SN).filter(s=>A.pool(t,s,curCls()).some(b=>SETITEMS.some(u=>u.b===b.id)));if(!slots.length)return false;return A.receive(t,slots[Math.floor(random()*slots.length)])};
function roll(random){let r=random()*100;const p=A.rates(S.diff||0);for(let i=0;i<p.length;i++){r-=p[i];if(r<0)return i}return 5}
function result(stone,quality,random){const cls=curCls();let pool=A.pool(stone.tier,stone.slot,cls);if(quality>=3)pool=pool.filter(b=>SETITEMS.some(u=>u.b===b.id));if(!pool.length)throw Error('该档位部位结果池尚未接入');
 const b=pool[Math.floor(random()*pool.length)];let it;
 if(quality>=3){const defs=SETITEMS.filter(u=>u.b===b.id);const d=defs[Math.floor(random()*defs.length)];it=CQMir2Equip.createContent(d.id,Math.max(60,b.q,d.lv||1),{noAnc:true});if(quality>=4)ancApply(it,quality===5?2:1)}
 else it=genItem(Math.max(60,b.q),{base:b,q:[2,3,4][quality]});
 it.cqGambleQuality=quality;return it}
A.identify=function(n=1,random=rnd){if(n!==1&&n!==10)return{err:'次数无效'};const s=state();if(s.pending.length<n)return{err:'未鉴定物不足'};const stones=s.pending.slice(0,n),cost=Math.round(stones.reduce((a,x)=>a+A.price(x.tier),0)*(n===10?.9:1));if(S.gold<cost)return{err:'金币不足'};
 let pity=s.pity,items=[],hasGood=false;const uid=S.uid;
 try{for(let i=0;i<n;i++){let q=roll(random);if(pity===49)q=4;if(n===10&&i===9&&!hasGood&&q<2)q=2;const it=result(stones[i],q,random);items.push(it);hasGood=hasGood||q>=2;pity=q>=4?0:pity+1}
 const bag=S.bag.slice();for(const it of items){if(!fits(bag,it,BAG_SZ)){S.uid=uid;return{err:'背包空间不足'}}bag.push(it)}
 S.gold-=cost;S.bag=bag;s.pending.splice(0,n);s.pity=pity;s.last=items.map(it=>({name:itemName(it),quality:it.cqGambleQuality}));save();return{ok:1,cost,items};
 }catch(e){S.uid=uid;return{err:e.message}}};
A.recycle=function(){const s=state();const gold=s.pending.reduce((a,x)=>a+Math.round(A.price(x.tier)*A.config.recycle),0);s.pending=[];S.gold+=gold;save();return gold};
const oldKill=killMon;killMon=function(m){const r=oldKill.apply(this,arguments);A.drop(m);return r};
function esc(x){return String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
A.close=()=>document.getElementById('cq-gamble')?.remove();
A.open=function(reveal=false){A.close();const s=state(),el=document.createElement('div');el.id='cq-gamble';el.innerHTML=`<section role="dialog" aria-modal="true" aria-label="盟重赌石坊"><header><h2>盟重 · 赌石坊</h2><button data-close>关闭</button></header><p>金币 ${S.gold} · 未鉴定 ${s.pending.length} 件</p><strong>距上古保底 ${50-s.pity} 次</strong><div class="cg-grid">${Array.from({length:9},(_,i)=>{const x=reveal?s.last.slice(-9)[i]:s.pending[i];return `<div class="cg-card ${reveal&&x?'cg-flip':''}" style="--cg-q:${x?.quality>=4?'#ffb84c':'#bda56d'}">${x?esc(reveal?QN[x.quality]+' · '+x.name:TN[TIERS.indexOf(x.tier)]+'档 · '+SN[x.slot]):'空位'}</div>`}).join('')}</div>${reveal?`<p class="cg-results">本次 ${s.last.length} 件：${s.last.map(x=>esc(QN[x.quality]+'·'+x.name)).join('、')}</p>`:''}<div class="cg-rates">${A.rates(S.diff||0).map((p,i)=>`<span>${QN[i]} ${Number(p.toFixed(4))}%</span>`).join('')}</div><p>十连至少一件极品或以上 · 连续第50次上古</p><p>单次 ${s.pending[0]?A.price(s.pending[0].tier):20000} 金币起 · 十连九折<br>全部回收未鉴定物：返还鉴定原价10%</p><div class="cg-actions"><button data-n="1">鉴定</button><button data-n="10">十连</button><button data-recycle>全部回收</button></div><p class="cg-msg" role="status"></p></section>`;
 el.onclick=e=>{if(e.target===el||e.target.closest('[data-close]'))return A.close();const btn=e.target.closest('[data-n]');if(btn){const r=A.identify(+btn.dataset.n);if(r.ok)A.open(true);else el.querySelector('.cg-msg').textContent=r.err}if(e.target.closest('[data-recycle]')){A.recycle();A.open()}};document.body.appendChild(el)};
// Shop entry is installed by wrapper; map integration contract lives in docs.
if(typeof renderShop==='function'){const f=renderShop;renderShop=function(){const r=f.apply(this,arguments);if(!document.getElementById('cq-gamble-entry')){const b=document.createElement('button');b.id='cq-gamble-entry';b.textContent='盟重赌石坊';b.onclick=()=>A.open();document.querySelector('#panel')?.prepend(b)}return r}}
})();
