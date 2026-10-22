'use strict';
// 传奇装备回收；ess 保留为材料存档 ID，显示名统一为黑铁碎片。
const MATS={ess:{n:'黑铁碎片',c:'#b98cff',d:'回收装备得到的黑铁碎片，用于淬锋精铸。'}};
const RCY_Q=[[1,'普通'],[3,'精良'],[4,'稀有'],[5,'极品'],[6,'套装'],[8,'上古'],[9,'至臻']];
const RCY_S=[['weapon','武器'],['armor','衣服'],['helm','头盔'],['amulet','项链'],['shield','左手镯'],['gloves','右手镯'],['ring','戒指×2'],['belt','腰带'],['boots','靴子']];
const RCY_C=RCY_S;
function rcyDefault(){return {v:2,dv:4,on:0,q:{1:1,3:0,4:0,5:0,6:0,8:0,9:0},c:Object.fromEntries(RCY_S.map(([k])=>[k,1])),classes:{zs:1,fs:1,ds:1,any:1},nonClass:0,levelBelow:0,tierBelow:0,keepNew:1,keepBetter:1,mode:'ess'}}
function rcyMigrate(){if(!S||S.rcy?.v>=2)return;const old=S.rcy,d=rcyDefault();
 if(old){d.on=old.on?1:0;d.q={...d.q,...old.q,1:(old.q?.[0]||old.q?.[1]||old.q?.[2])?1:0};
 for(const [k] of RCY_S){if(k==='weapon')d.c[k]=Object.keys(old.c||{}).some(c=>['wand','dagger','sword','axe','mace','staff','bow','xbow','polearm','spear','jav','throw','weapon'].includes(c)&&old.c[c])?1:0;else d.c[k]=old.c?.[k]?1:0}
 d.keepNew=old.keepNew===0?0:1;d.keepBetter=old.keepBetter===0?0:1;d.mode=old.mode==='gold'?'gold':'ess';
 }else if(S.sell){d.on=S.sell[0]||S.sell[1]?1:0;d.q[1]=S.sell[0]||S.sell[1]||S.sell[2]?1:0}S.rcy=d}
function ensureLoot(){if(!S)return;rcyMigrate();if(!S.codex){S.codex={};const all=[...(S.bag||[]),...Object.values(S.eq||{}),...(S.pst||[]).flat()];for(const it of all)if(it&&!it.k&&(it.q===5||it.q===6))S.codex[it.name]=1}}
const _lt_load=load;load=function(){_lt_load();ensureLoot()};
// ---------- 材料 ----------
function matCount(id){return S.bag.filter(x=>x.k==='mat'&&x.id===id).reduce((a,x)=>a+(x.n||0),0)}
function addMat(id,n){if(n<=0)return;pushInto(S.bag,{uid:S.uid++,k:'mat',id,n})}
function takeMat(id,n){if(matCount(id)<n)return false;for(const x of S.bag)if(x.k==='mat'&&x.id===id){const t=Math.min(x.n,n);x.n-=t;n-=t;if(!n)break}mergeMats(S.bag);return true}
const _lt_name=itemName;itemName=function(it){return it&&it.k==='mat'?(MATS[it.id]?MATS[it.id].n:'未知材料'):_lt_name(it)};
const _lt_color=itemColor;itemColor=function(it){return it.k==='mat'?MATS[it.id].c:_lt_color(it)};
const _lt_price=sellPrice;sellPrice=function(it){return it.k==='mat'?2:_lt_price(it)};
const _lt_show=showItem;showItem=function(uid){const f=findItem(uid);if(f&&f.it.k==='mat'){const it=f.it;const n=f.stash?groupCount(f):matCount(it.id);
 return modal(`<div class="ipanel"><div class="ih">${itemIcon(it)}<div><b style="color:${itemColor(it)}">${itemName(it)}</b><div class="dim">材料 · 数量 ${n}</div></div></div><div class="sec"><div>${MATS[it.id].d}</div></div>
 <div class="btns c">${f.stash?`<button class="btn gold" onclick="fromStash(${uid})">取回背包</button>`:`<button class="btn" onclick="depositUid(${uid},'p')">存入个人仓库</button><button class="btn" onclick="depositUid(${uid},'s')">存入共享仓库</button>`}<button class="btn" onclick="closeM()">关闭</button></div></div>`)}
 return _lt_show(uid)};
// 出售：堆叠一次卖 1；材料一次卖 1
const _lt_sell=sell;sell=function(uid){const f=findItem(uid);if(f&&f.it.k==='mat'&&!f.stash){S.gold+=2;f.it.n--;mergeMats(S.bag);closeM();render();return}return _lt_sell(uid)};
// ---------- 回收规则 ----------
function rcyCat(it){return BASEM[it?.b]?.s}
function rcyQuality(it){return it.anc===2?9:it.anc?8:it.q<=2?1:it.q}
function rcyProtected(it){if(!it||it.k||!BASEM[it.b])return '非装备';
 if(it.lk||(typeof isLk==='function'&&isLk(it)))return '锁定';
 if(it.set||it.q===6)return '套装件';
 const def=typeof UNIQUES!=='undefined'&&UNIQUES.find(u=>(it.cqContentId&&u.id===it.cqContentId)||(u.b===it.b&&u.n===it.name));
 if(it.blk||it.boss||def?.boss)return '首领专属';
 if(/屠龙|嗜魂|逍遥扇|怒斩|龙牙/.test(BASEM[it.b].n+' '+(it.name||'')))return '神器';
 if(it.anc||it.q===8||it.q===9)return '上古/至臻';
 if(S.rcy?.keepNew!==0&&(it.q===5||it.q===6)&&!S.codex?.[it.name])return '未收录图鉴';
 return ''}
function rcyReject(it){const protectedWhy=rcyProtected(it);if(protectedWhy)return protectedWhy;const r=S.rcy,b=BASEM[it.b];
 if(!r.q[rcyQuality(it)])return '品质未勾选';if(!r.c[rcyCat(it)])return '部位未勾选';
 const req=typeof itemReq==='function'?itemReq(it):{lv:it.req||b.cqReq?.lv||1,cls:b.ccls};const cls=req.cls||null;
 if(!r.classes[cls||'any']||(r.nonClass&&(!cls||cls===curCls())))return '职业条件';
 if(r.levelBelow&&req.lv>=r.levelBelow)return '等级条件';
 // 档位按基础装备等级需求排序，避免同为 basic 的木剑与屠龙混为一档。
 if(r.tierBelow&&(b.cqReq?.lv||b.q||1)>=r.tierBelow)return '档位条件';
 return ''}
function shouldRecycle(it,isNew){return !!(S.rcy?.on&&!rcyReject(it))}
function essOf(it){return[1,1,2,3,6,15,12,5][it.q]||1}
function doRecycle(it){if(rcyProtected(it))return false;const r=S.rcy;STATS.rcy++;if(r.mode==='ess'){const e=essOf(it);addMat('ess',e);STATS.rcyE+=e}else{const g=Math.min(35000,sellPrice(it));S.gold+=g;STATS.rcyG+=g}}
addBag=function(it){ensureLoot();if(it.k==='mat'){pushInto(S.bag,it);return true}
 const protectedItem=!!rcyProtected(it);const isNew=!it.k&&(it.q===5||it.q===6)&&!S.codex[it.name];
 if(shouldRecycle(it,isNew)){doRecycle(it);return false}
 if(isNew)S.codex[it.name]=1;
 if(autoStash(it))return true;
 if(!bagFits(it)&&!protectedItem){S.gold+=sellPrice(it);log('背包已满，自动出售 '+itemName(it));return false}S.bag.push(it);return true};
function recycleNow(){ensureLoot();const was=S.rcy.on;S.rcy.on=1;const b0=STATS.rcy,g0=STATS.rcyG,e0=STATS.rcyE;const keep=[];
 for(const it of S.bag){if(shouldRecycle(it,false))doRecycle(it);else keep.push(it)}
 // doRecycle 可能新增黑铁碎片材料到 S.bag，需要保留
 const mats=S.bag.filter(x=>x.k==='mat'&&!keep.includes(x));S.bag=keep.concat(mats);mergeMats(S.bag);S.rcy.on=was;calc();
 const n=STATS.rcy-b0;if(!window.__NOUI){const why=rcyKeepWhy(S.bag),wt=Object.entries(why).map(([k,v])=>`${k}${v}`).join('、');
 toast((n?`回收 ${n} 件：+${STATS.rcyG-g0}金币 +${STATS.rcyE-e0}黑铁碎片`:'没有符合回收规则的物品')+(wt?`\n保留 ${Object.values(why).reduce((a,b)=>a+b,0)} 件：${wt}`:''));
 const te=document.getElementById('toast');if(te&&wt){te.style.whiteSpace='pre';te.style.textAlign='center';clearTimeout(te._t);te._t=setTimeout(()=>{te.classList.remove('on');te.style.whiteSpace='';te.style.textAlign=''},3200)}render()}save();return n}
// 一键回收后统计保留原因（只统计装备；与 shouldRecycle 顺序一致）
function rcyKeepWhy(bag){const o={};for(const it of bag){if(!it||it.k)continue;const why=rcyReject(it)||'战力保护';o[why]=(o[why]||0)+1}return o}
// ---------- 离线结算附加回收/存仓统计 ----------
const _lt_off=offline;offline=function(){const a=STATS.rcy,g=STATS.rcyG,e=STATS.rcyE,s=STATS.ast;_lt_off();const n=STATS.rcy-a,m=STATS.ast-s;if(window.__NOUI||(!n&&!m))return;
 const box=document.querySelector('#modal .gp .grid');for(const d of document.querySelectorAll('#modal .gp>.dim'))if(n&&d.textContent.startsWith('自动出售'))d.remove();if(box)box.insertAdjacentHTML('beforebegin',`<div class="g">自动回收 ${n} 件：+${STATS.rcyG-g} 金币，+${STATS.rcyE-e} 黑铁碎片${m?`；自动存仓 ${m} 件`:''}</div>`)};
// 炼金匣「精华重铸」已删除（legacy_prune 批次2）
// ---------- 设置面板 ----------
function rcyUI(){ensureLoot();const r=S.rcy;const ck=(on,fn,t)=>`<button class="btn ${on?'on':''}" aria-pressed="${!!on}" onclick="${fn};rcyUI()">${t}</button>`;
 const threshold=(field,label)=>`<label class="rcy-limit">${label}<select aria-label="${label}" onchange="S.rcy.${field}=+this.value">${[0,5,10,15,20,25,30,35,40,45,50,55,60,61].map(n=>`<option value="${n}" ${r[field]===n?'selected':''}>${n?'低于 '+n+' 级':'不限'}</option>`).join('')}</select></label>`;
 modal(`<div class="mtitle">自动回收设置</div><div class="gp rcy">
 <div class="row"><b>自动回收</b>${ck(r.on,'S.rcy.on^=1',r.on?'已开启':'已关闭')}</div>
 <p class="dim">品质、部位、职业、等级与档位条件须同时满足。自动回收优先于自动存仓；离线同样生效。</p>
 <h4>品质</h4><div class="btns">${RCY_Q.map(([q,n])=>ck(r.q[q],`S.rcy.q[${q}]^=1`,n)).join('')}</div>
 <h4>部位（10 个装备位）</h4><div class="btns">${RCY_S.map(([k,n])=>ck(r.c[k],`S.rcy.c['${k}']^=1`,n)).join('')}</div>
 <h4>职业</h4><div class="btns">${[['zs','战士'],['fs','法师'],['ds','道士'],['any','通用']].map(([k,n])=>ck(r.classes[k],`S.rcy.classes['${k}']^=1`,n)).join('')}${ck(r.nonClass,'S.rcy.nonClass^=1','仅回收非本职业')}</div>
 ${threshold('levelBelow','需求等级')}${threshold('tierBelow','装备档位')}
 <p class="dim">档位按基础装备的等级需求划分（木剑 1 级起）；0 为不限。</p>
 <h4>保护</h4><p>始终保留：锁定、套装件、首领专属、神器、上古与至臻。</p>
 <div class="btns">${ck(r.keepNew,'S.rcy.keepNew^=1','未收录极品/套装')}${ck(r.keepBetter,'S.rcy.keepBetter^=1','比已穿装备更好')}</div>
 <h4>回收所得</h4><div class="btns">${ck(r.mode==='gold',"S.rcy.mode='gold'",'金币')}${ck(r.mode==='ess',"S.rcy.mode='ess'",'黑铁碎片')}</div><p>黑铁碎片：${matCount('ess')}</p>
 <h4>自动存仓</h4><div class="btns">${ck(S.ast.on,'S.ast.on^=1',S.ast.on?'已开启':'已关闭')}${Object.entries(AST_T).map(([k,n])=>ck(S.ast.t[k],`S.ast.t['${k}']^=1`,n)).join('')}</div>
 <div class="btns">${ck(S.ast.dest!=='s',"S.ast.dest='p'",'个人仓库')}${ck(S.ast.dest==='s',"S.ast.dest='s'",'共享仓库')}</div>
 <div class="btns c"><button class="btn gold" onclick="closeM();recycleNow()">一键回收</button><button class="btn" onclick="save();closeM();render()">完成</button></div></div>`)}
// 背包页按钮；角色页旧“自动出售”入口改为提示
const _lt_rb=renderBag;renderBag=function(){_lt_rb();ensureLoot();const r=document.querySelector('#panel .gp h3 .r');const gps=[...document.querySelectorAll('#panel .gp')];const bg=gps.find(g=>/背包 \d+/.test(g.querySelector('h3')?.textContent||''));
 const sp=bg&&bg.querySelector('h3 .r');if(sp)sp.insertAdjacentHTML('beforeend',`<button class="btn xs" onclick="rcyUI()">自动回收${S.rcy.on?'✓':''}</button><button class="btn xs gold" onclick="recycleNow()">一键回收</button>`)};
const _lt_hero=renderHero;renderHero=function(){_lt_hero();const d=[...document.querySelectorAll('#panel .dim')].find(e=>/自动出售/.test(e.textContent));if(d){const nx=d.nextElementSibling;if(nx&&nx.classList.contains('btns'))nx.remove();d.innerHTML='自动出售已升级为「自动回收」：背包页 → 自动回收 设置'}};
