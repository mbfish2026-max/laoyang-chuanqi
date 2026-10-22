'use strict';
// ===================================================================================
// bagux.js — 手机端背包/仓库体验 + 弹窗点空白关闭（加载于最后）
// 1) 弹窗：点暗色背景（pointerdown 与 click 都落在背景上，且打开 >300ms）即关闭；ESC 关闭。登录/新建角色/他处登录/存档冲突/上传存档等必选弹窗除外
// 2) 物品详情：底部抽屉（.sheet），操作按钮加大固定在底部
// 3) 传奇分类、8×5 背包 / 8×6 仓库、职业芯片与分页
// 4) 仓库/背包网格左右滑动翻页；长按物品弹快捷菜单（详情对比/锁定/出售/存仓/取回）
// ===================================================================================
const BUX={openAt:0,downBg:0,lp:null,lpFired:0};
function buxLocked(){const m=document.getElementById('modal');if(!m)return true;
 if(typeof CL_GATE!=='undefined'&&CL_GATE&&typeof CU!=='undefined'&&!CU)return true;
 const t=((m.querySelector('.mtitle')||{}).textContent||'')+'|'+(m.textContent||'').slice(0,60);
 if(/老羊传奇 · 账号|已在其他设备登录|存档冲突|上传本地存档|正在恢复|连接云端失败/.test(t))return true;
 if(/新建角色/.test(t)&&typeof LF!=='undefined'&&LF.placeholder)return true;
 if(m.querySelector('[data-nobg]'))return true;return false}
function buxTryClose(){const m=document.getElementById('modal');if(!m||m.classList.contains('hide'))return;if(Date.now()-BUX.openAt<300||buxLocked())return;closeM()}
(function(){if(typeof MutationObserver==='undefined')return;const m=document.getElementById('modal');if(!m)return;
 const mark=()=>{const open=!m.classList.contains('hide');if(open&&!BUX.wasOpen)BUX.openAt=Date.now();BUX.wasOpen=open;
  m.classList.toggle('sheet',open&&!!m.querySelector('.mb>.ipanel,.mb>.cmpw,.mb>.buxq'))};
 new MutationObserver(mark).observe(m,{attributes:true,attributeFilter:['class'],childList:true});
 // 内容替换（如详情→镶嵌）也算重新打开，避免同一次点击落到新背景
 new MutationObserver(()=>{BUX.openAt=Date.now()}).observe(m,{childList:true});
 m.onclick=null;// 取代 game.js 无保护的背景关闭
 const isBg=t=>t===m||(t&&t.classList&&t.classList.contains('mb')&&t.parentNode===m&&!m.classList.contains('sheet'));
 m.addEventListener('pointerdown',e=>{BUX.downBg=isBg(e.target)&&Date.now()-BUX.openAt>=300},true);
 document.addEventListener('click',e=>{if(!isBg(e.target))return;e.stopPropagation();if(BUX.downBg){BUX.downBg=0;buxTryClose()}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')buxTryClose()})})();
// ---------- 网格左右滑动翻页 ----------
function buxPage(grid,dir){const sg=grid.classList.contains('sgrid');let v,n;
 if(sg){const sh=STV==='shared';if(STF.q!=='all'||STF.t!=='all'||STF.s)return;v=sh?'SHP':'STP';n=(sh?ACCT.shared:S.pst).length}
 else{const pg=grid.parentElement&&grid.parentElement.querySelector('.pager');if(!pg||grid.closest('.stash2'))return;v='BGP';n=+((pg.textContent.match(/\/(\d+)页/)||[])[1]||1)}
 const cur=window[v]!==undefined?window[v]:eval(v),nx=Math.max(0,Math.min(n-1,cur+dir));if(nx===cur)return;eval(v+'='+nx);render();if(!window.__NOUI)toast(`第 ${nx+1}/${n} 页`)}
{let sx=0,sy=0,g=null,t0=0;
 document.addEventListener('touchstart',e=>{const t=e.touches[0];g=e.touches.length===1&&e.target.closest&&e.target.closest('#panel .buxswipe');if(g){sx=t.clientX;sy=t.clientY;t0=Date.now()}},{passive:true});
 document.addEventListener('touchend',e=>{if(!g)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy,G=g;g=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>1.6*Math.abs(dy)&&Date.now()-t0<800){BUX.swiped=Date.now();buxPage(G,dx<0?1:-1)}},{passive:true})}
// ---------- 长按快捷菜单 ----------
function buxUid(cell){const s=cell.getAttribute('onclick')||'';const m=/(?:showItem|depositUid|withdrawUid|qtyUI|stTap)\((\d+)/.exec(s);return m?+m[1]:null}
function buxImbue(uid){imbue(uid);render();if(findItem(uid))buxQuick(uid)}
function buxQuick(uid){const f=findItem(uid);if(!f)return;const it=f.it,lk=!!it.lk,b=[];
 b.push(`<button class="btn gold" onclick="showItem(${uid})">${!it.k&&!f.slot&&typeof cmpTarget==='function'&&cmpTarget(it)?'详情 / 对比':'详情'}</button>`);
 if(typeof toggleLock==='function'&&!it.k)b.push(`<button class="btn" onclick="toggleLock(${uid});closeM();render()">${lk?'🔓 解锁':'🔒 锁定'}</button>`);
 if(f.stash){b.push(`<button class="btn" onclick="fromStash(${uid})">取回背包</button>`,`<button class="btn" onclick="stashToStash(${uid})">转到${f.where==='s'?'个人':'共享'}仓库</button>`)}
 else if(!f.slot){b.push(`<button class="btn" onclick="depositUid(${uid},'p')">存个人仓库</button>`,`<button class="btn" onclick="depositUid(${uid},'s')">存共享仓库</button>`);
  if(S.imbue>0&&!it.k&&(it.q===1||it.q===2)&&!(it.soc&&it.soc.length)&&typeof imbue==='function')b.push(`<button class="btn gold" onclick="buxImbue(${uid})">灌注（剩 ${S.imbue}）</button>`);
  if(!lk)b.push(`<button class="btn" onclick="sell(${uid})">出售 ${sellPrice(it)}◈</button>`)}
 modal(`<div class="buxq ipanel"><div class="ih">${itemIcon(it)}<div><b style="color:${itemColor(it)}">${itemName(it)}</b><div class="dim">${f.stash?(f.where==='s'?'共享仓库':'个人仓库'):f.slot?'已装备':'背包'}${lk?' · 已锁定':''}</div></div></div><div class="btns c buxbtns">${b.join('')}<button class="btn" onclick="closeM()">关闭</button></div></div>`)}
{const P=()=>document.getElementById('panel');let x0=0,y0=0;
 const cancel=()=>{if(BUX.lp){clearTimeout(BUX.lp);BUX.lp=null}};
 document.addEventListener('pointerdown',e=>{cancel();BUX.lpFired=0;const c=e.target.closest&&e.target.closest('#panel .cell');if(!c||c.classList.contains('void')||c.classList.contains('empty'))return;const uid=buxUid(c);if(uid==null)return;
  x0=e.clientX;y0=e.clientY;BUX.lp=setTimeout(()=>{BUX.lp=null;BUX.lpFired=Date.now();try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}buxQuick(uid)},480)},true);
 document.addEventListener('pointermove',e=>{if(BUX.lp&&Math.hypot(e.clientX-x0,e.clientY-y0)>10)cancel()},true);
 ['pointerup','pointercancel'].forEach(t=>document.addEventListener(t,cancel,true));
 document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('#panel .cell'))e.preventDefault()},true);
 // 长按/滑动后的那次 click 不再触发格子原有动作
 document.addEventListener('click',e=>{const now=Date.now();if((BUX.lpFired&&now-BUX.lpFired<900)||(BUX.swiped&&now-BUX.swiped<400)){if(e.target.closest&&e.target.closest('#panel')){e.preventDefault();e.stopPropagation()}BUX.lpFired=0}},true)}

// 方案 §8 / §5.8。最后安装钩子，避开各模块旧版 renderBag 的 DOM 注入。
const CQ_BAG_UI={type:'all',cls:'all',page:0,lock:false,compare:false};
const CQ_BAG_UI_TYPES=[['all','全部'],['weapon','武器'],['armor','防具'],['jewelry','首饰'],['mat','材料']];
function cqbType(it){if(it.k)return 'mat';const b=BASEM[it.b]||{},s=b.s;return s==='weapon'?'weapon':b.cat==='bracelet'||['ring','amulet','bracelet'].includes(s)?'jewelry':'armor'}
function cqbFilter(type){CQ_BAG_UI.type=type;CQ_BAG_UI.page=0;BGP=0;render()}
function cqbTab(v){STV=v;CQ_BAG_UI.page=0;CQ_BAG_UI.lock=false;render()}
function cqbCls(v){CQ_BAG_UI.cls=v;CQ_BAG_UI.page=0;render()}
function cqbPage(p){if(STV==='bag')BGP=p;else{CQ_BAG_UI.page=p;if(CQ_BAG_UI.type==='all'&&CQ_BAG_UI.cls==='all'){if(STV==='shared')SHP=p;else STP=p}}render()}
function cqbTap(uid){if(CQ_BAG_UI.lock){toggleLock(uid);closeM();render()}else showItem(uid)}
function cqbSort(){if(STV==='bag'){BGP=0;autoSortBag()}else{CQ_BAG_UI.page=0;autoSortStash(STV==='shared'?1:0)}}
function cqbRecycleMenu(){modal(`<div class="mtitle">装备回收</div><div class="gp"><p>一键回收按当前设置处理背包装备，锁定物品始终保留。</p><div class="btns c"><button class="btn gold" onclick="closeM();recycleNow()">一键回收</button><button class="btn" onclick="rcyUI()">自动回收设置</button><button class="btn" onclick="closeM()">返回</button></div></div>`)}
function cqbRecycle(uid){const f=findItem(uid);if(!f||f.slot||f.it.k||f.it.lk)return;
 if(!confirm('回收「'+itemName(f.it)+'」？'))return;ensureLoot();const a=f.stash?pagesOf(f.where)[f.pg]:S.bag;const i=a.indexOf(f.it);if(i<0)return;a.splice(i,1);doRecycle(f.it);calc();save();if(f.stash&&f.where==='s'){acctSave();if(typeof clSyncSoon==='function')clSyncSoon()}closeM();render()}
function cqbCompare(uid){CQ_BAG_UI.compare=true;try{showItem(uid)}finally{CQ_BAG_UI.compare=false}}
function cqbCell(g){const it=g.it,c=cqItemCls(it),badge=c&&c!==curCls()?`<b class="cqb-class">${{zs:'战',fs:'法',ds:'道'}[c]||''}</b>`:'';
 return cellG(g,`cqbTap(${it.uid})`).replace(/<\/div>$/,`${badge}${it.lk?'<b class="cqb-lock">锁</b>':''}</div>`)}
function cqbRender(){if(!S.pst)migrateChar(curChar()||{name:'战士',id:1});drainOld();cqStashNorm();
 const sh=STV==='shared',bag=STV==='bag',P=sh?ACCT.shared:S.pst,size=bag?40:48;
 const filtered=CQ_BAG_UI.type!=='all'||(sh&&CQ_BAG_UI.cls!=='all');
 const match=g=>(CQ_BAG_UI.type==='all'||cqbType(g.it)===CQ_BAG_UI.type)&&(!sh||cqClsMatch(g.it,CQ_BAG_UI.cls));
 const all=groups(bag?S.bag:P.flat()).filter(match);const n=bag||filtered?Math.max(1,Math.ceil(all.length/size)):P.length;
 let pi=Math.max(0,Math.min(bag?BGP:CQ_BAG_UI.page,n-1));if(bag)BGP=pi;else CQ_BAG_UI.page=pi;
 const gs=bag||filtered?all.slice(pi*size,(pi+1)*size):groups(P[pi]);
 const cap=bag?BAG_SZ:P.length*48,used=bag?slotsUsed(S.bag):stashTotal(P),cost=bag?null:cqStashCost(sh?'s':'p');
 const chips=(pairs,active,fn)=>pairs.map(([k,t])=>`<button class="${active===k?'on':''}" onclick="${fn}('${k}')">${t}</button>`).join('');
 $('#panel').innerHTML=`<section class="cqbag"><header><span>行囊</span><small>${bag?'背包':sh?'共享仓库':'个人仓库'} ${used}/${cap}</small></header>
 <div class="cqb-actions"><button onclick="cqbSort()">排序</button><button onclick="cqbRecycleMenu()">回收</button><button class="${CQ_BAG_UI.lock?'on':''}" onclick="CQ_BAG_UI.lock=!CQ_BAG_UI.lock;render()">${CQ_BAG_UI.lock?'完成锁定':'锁定'}</button></div>
 <nav class="cqb-tabs bagv">${chips([['bag','背包'],['pst','个人仓库'],['shared','共享仓库']],STV,'cqbTab')}</nav>
 ${sh?`<div class="cqb-chips cqclsf">${chips(CQ_CLSF,CQ_BAG_UI.cls,'cqbCls')}</div>`:''}
 <div class="cqb-chips cqb-types">${chips(CQ_BAG_UI_TYPES,CQ_BAG_UI.type,'cqbFilter')}</div>
 <div class="cqb-grid ${bag?'':'cqb-stash'}">${gs.map(cqbCell).join('')+'<div class="cell void" aria-hidden="true"></div>'.repeat(Math.max(0,size-gs.length))}</div>
 <div class="cqb-pages cqstx"><button aria-label="上一页" onclick="cqbPage(${pi-1})" ${pi===0?'disabled':''}>‹</button><span>${pi+1} / ${n} 页${filtered?' · 筛选':''}</span><button aria-label="下一页" onclick="cqbPage(${pi+1})" ${pi===n-1?'disabled':''}>›</button>${cost?`<button aria-label="扩容仓库" onclick="cqStashExpandUI('${sh?'s':'p'}')">＋</button>`:''}</div>
 <p class="cqb-hint">${CQ_BAG_UI.lock?'点装备切换锁定，再点「完成锁定」。':bag?'点物品查看详情；长按可存入仓库。':'点物品查看详情并取回；长按可转仓。'}${!bag?`<br>${cost?'扩容：金币 '+fmt(cost.gold)+(cost.ckq?' + 仓库扩充券 ×1':''):'仓库已达扩容上限'}`:''}</p></section>`;
}
function cqbInstall(){const oldRender=renderBag;renderBag=function(){if(window.__NOUI)return oldRender.apply(this,arguments);return cqbRender()};
 const oldShow=showItem;showItem=function(uid){if(window.__NOUI||CMP_BUSY)return oldShow.apply(this,arguments);const f=findItem(uid);if(!f)return;
 // 详情默认单栏，点击「对比」时才启用现成对比属性面板。
 const busy=CMP_BUSY;if(!CQ_BAG_UI.compare)CMP_BUSY=1;let r;try{r=oldShow.apply(this,arguments)}finally{CMP_BUSY=busy}
 const m=document.getElementById('modal'),box=m.querySelector('.btns.c');if(!box||f.it.k||f.slot)return r;
 const uid0=f.it.uid;box.classList.add('cqb-detail-actions');box.innerHTML=`<button class="btn gold" onclick="${f.stash?'stEquip':'equip'}(${uid0})" ${canEquip(f.it)?'':'disabled'}>穿戴</button><button class="btn" onclick="cqbCompare(${uid0})" ${cmpTarget(f.it)?'':'disabled'}>对比</button><button class="btn" onclick="toggleLock(${uid0})">${f.it.lk?'解锁':'锁定'}</button><button class="btn" onclick="cqbRecycle(${uid0})" ${f.it.lk?'disabled':''}>回收</button>`;
 const extra=document.createElement('div');extra.className='cqb-transfer';extra.innerHTML=f.stash?`<button class="btn" onclick="fromStash(${uid0})">取回背包</button><button class="btn" onclick="stashToStash(${uid0})">转${f.where==='s'?'个人':'共享'}仓库</button>`:`<button class="btn" onclick="depositUid(${uid0},'p')">存个人仓库</button><button class="btn" onclick="depositUid(${uid0},'s')">存共享仓库</button>`;box.before(extra);return r};
 if(typeof TAB!=='undefined'&&TAB==='bag'&&!window.__NOUI)renderBag();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',cqbInstall);else cqbInstall();
