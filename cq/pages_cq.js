'use strict';
// cq/pages_cq.js — 角色 / 技能 / 福利 三页按设计稿 chuanqi_v2_live p5_role / p6_skill / p8_fuli 重排（运行时包装，不改他人文件）
// 角色：装备人偶（10 部位围绕立绘）+ 名字/战力 + 属性表 + 操作按钮；原角色页内容（加点/设置/加成汇总…）保留在下方「详细」面板。
// 技能：「X技能」列表（图标/名称/等级条/升级→原 skPop）+ 自动释放顺序（▲▼/开关 → acMove/acSet）；「自动施法」= 原 acPanel；「技能树」= 原页面。
// 福利（TAB=eg）：签到 / 离线收益 / 悬赏 / 功业 / 事件 / 更多（=原终局全部页签与设置）。
(function(){
if(typeof document==='undefined'||window.__NOUI)return;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const ok=n=>{try{return typeof eval(n)==='function'}catch(e){return false}};
const UI='assets/cq/ui/';const CLSN={zs:'战士',fs:'法师',ds:'道士'};
const cls=()=>ok('curCls')?curCls():'zs';
const pw=()=>{try{return window.CQSys&&CQSys.power?CQSys.power():0}catch(e){return 0}};
const num=n=>Math.round(+n||0).toLocaleString('en-US');
const kn=n=>n>=1e4?(Math.round(n/1e3)/10)+'万':n>=1e3?(Math.round(n/100)/10)+'千':String(n);
// ---------------- 角色 ----------------
const EQL=['helm','amulet','shield','ring1','belt'],EQR=['weapon','armor','boots','ring2','gloves'];
function slot(k){const it=S.eq[k],nm=(typeof SLOTN!=='undefined'&&SLOTN[k])||k;
 if(!it)return `<div class="cqslot emp" title="${esc(nm)}"><div class="sn">${esc(nm)}</div></div>`;
 let img='';try{const u=ok('icon2Url')&&icon2Url(it);img=u?`<img src="${esc(u)}" alt="">`:(ok('itemIcon')?itemIcon(it):'')}catch(e){}
 const c=ok('itemColor')?itemColor(it):'#6b4a24';
 return `<div class="cqslot q${it.q|0}" style="--c:${c}" title="${esc(nm)}" onclick="showItem(${it.uid},'eq')">${img}${it.en?`<div class="en">+${it.en}</div>`:''}<div class="sn">${esc(nm)}</div></div>`}
function attrs(){return heroDisplayAttrs()}
function roleTop(){const c=cls(),por=`assets/char/${c}_portrait.webp`;
 return `<div class="cqpg cqrole"><div class="cqpanel"><div class="cqttl">装备<span class="r">10 部位 · 点击查看/强化</span></div>
 <div class="eqw"><div class="por" style="background-image:url(${por})"></div><div class="col L">${EQL.map(slot).join('')}</div><div class="col R">${EQR.map(slot).join('')}</div>
 <div class="nm">${esc(S.name||'')}　Lv.${S.lvl} ${CLSN[c]||''}</div><div class="pw">战力 <b>${num(pw())}</b></div></div></div>
 <div class="cqpanel"><div class="cqttl">属性<span class="r">自动成长 · <b class="g">${S.reb||0} 转</b></span></div>
 <div class="kv">${attrs().map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>
 <div class="b6entry"><button class="cqbtn" style="min-height:44px;min-width:88px;white-space:nowrap" onclick="CQB6.refineUI()">部位淬炼</button></div><div class="acts"><button class="cqbtn gold" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="cqPg.autoEquip()">一键换装</button><button class="cqbtn" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="cqPg.smith()">铁匠强化</button><button class="cqbtn cqreb-entry" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="CQSys.rebirthUI()">转生</button><button class="cqbtn" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="charUI()">切换职业</button></div>
 <div class="cqttl cqmore">详细<span class="r">成长 · 设置 · 加成汇总</span></div></div>`}
// 一键换装：系统接口 CQSys.equip.autoBest（docs/systems_api.md §福利 / 一键换装）
function autoEquip(){const E=window.CQSys&&CQSys.equip;if(!E||!E.autoBest){if(ok('toast'))toast('一键换装暂不可用');return null}
 const r=E.autoBest();if(ok('toast'))toast(r&&r.changed?`已换上 ${r.changed} 件更好的装备 · 战力 ${num(r.power&&r.power.before)}→${num(r.power&&r.power.after)}`:(r&&r.reason)||'没有更强的装备');render();return r}
// ---------------- 技能 ----------------
let SKV='list';
function skList(){return SKILLS.filter(s=>skOfCls(s)).sort((a,b)=>a.r-b.r||a.col-b.col)}
function skIcon(id,sm){const n=window.CQ&&CQ.SK_ICON&&CQ.SK_ICON[id];return n?`<img src="${SKM[id]&&SKM[id].mir2?n:UI+"sk/ic_sk_"+n+".png"}" alt="">`:`<span class="gl">${esc((SKM[id]||{}).ic||'✦')}</span>`}
function skDesc(s){try{const v=SV(s.id,Math.max(1,bl(s.id)));const t=(v&&v.txt)||'';return (s.kind==='passive'&&!/^被动/.test(t)?'被动 · ':'')+t}catch(e){return ''}}
function skillPage(){const L=skList(),lv=S.lvl;
 const SKMX=()=>typeof CLS_SKMAX!=='undefined'&&CLS_SKMAX>0?CLS_SKMAX:20;// 技能上限：职业开发 cls-book 合并后 CLS_SKMAX=9，之前沿用 20
 const row=s=>{const b=bl(s.id),lk=!b&&lv<s.r;const d=lk?`Lv.${s.r} 解锁`:skDesc(s);
  const btn=b>=SKMX()?'<button class="cqbtn xs dis" disabled>满级</button>':lk?'<button class="cqbtn xs dis">未解锁</button>':`<button class="cqbtn xs ${canLearn(s.id)?'gold':''}" onclick="skPop('${s.id}')">${b?'升级':canLearn(s.id)?'学习':'详情'}</button>`;
  return `<div class="sk2 ${lk?'lk':''}"><div class="ic">${skIcon(s.id)}</div><div class="i"><div class="n">${esc(s.n)}${b?`<small>Lv.${b}</small>`:''}</div><div class="d">${esc(d)}</div><div class="lvw"><div class="lv"><i style="width:${Math.min(100,b/SKMX()*100)}%"></i></div><span class="lvt">Lv.${b}/${SKMX()}</span></div></div>${btn}</div>`};
 const A=ok('acLearned')?acLearned():[];
 const ord=A.map((id,i)=>{const c=acCfg(id);return `<div class="ord"><div class="no">${i+1}</div>${skIcon(id)}<b>${esc(SKM[id].n)}</b><span class="c">${esc((ok('acSmartTxt')&&acSmartTxt(id))||'冷却好即放')}</span><span class="ar" onclick="acMove('${id}',-1)">▲</span><span class="ar" onclick="acMove('${id}',1)">▼</span><div class="sw ${c.on?'':'off'}" onclick="acSet('${id}','on',${c.on?0:1})"></div></div>`}).join('')||'<div class="dim">尚未学会主动技能</div>';
 return `<div class="cqpanel"><div class="cqttl">技能<span class="r">技能书修炼 · 等级上限 ${SKMX()}</span></div>${L.map(row).join('')}</div>
 <div class="cqpanel"><div class="cqttl">自动释放顺序<span class="r">从上到下检查</span></div>${ord}</div>`}
function battleBarPanel(){return `<div class="cqpanel cqbarcfg"><div class="cqttl">战斗栏</div><p class="dim">点击位置选择主动技能，未学技能也可放入。重复选择会交换位置。</p><div class="cqbarslots">${CQSys.battleSkills().map((id,i)=>`<button class="cqbtn" onclick="cqPg.barPick(${i})"><small>${['左一','左二','右一','右二'][i]}</small>${id?skIcon(id):'＋'}<span>${id?esc(SKM[id].n):'空位'}</span><small>${id&&!bl(id)?'未学':''}</small></button>`).join('')}</div></div>`}
function barPick(i){modal(`<div class="mtitle">战斗栏 · ${['左一','左二','右一','右二'][i]}</div><div class="cqbarchoices">${skList().filter(s=>s.ty!=='passive').map(s=>`<button class="cqbtn" onclick="cqPg.barSet(${i},'${s.id}')">${skIcon(s.id)}<span>${esc(s.n)}</span><small>${bl(s.id)?'Lv.'+bl(s.id):'未学'}</small></button>`).join('')}<button class="cqbtn" onclick="cqPg.barSet(${i},null)">＋ 留空</button></div>`)}
function skTabs(){const c=cls();return `<div class="stabs cqsktabs">${[['list',(CLSN[c]||'')+'技能'],['ac','自动施法'],['bar','战斗栏'],['tree','技能树']].map(([k,n])=>`<button class="${SKV===k?'on':''}" onclick="cqPg.sk('${k}')">${n}</button>`).join('')}</div>`}
// ---------------- 福利 ----------------
let FLT='sign';const FLN=[['sign','签到'],['off','离线收益'],['bounty','悬赏'],['ach','功业'],['event','事件'],['more','更多']];
// 签到 / 离线收益：系统接口 CQSys.signin / CQSys.offline（逻辑、奖励、存档都在 cq/fuli_cq.js）
const SG=()=>window.CQSys&&CQSys.signin,OF=()=>window.CQSys&&CQSys.offline;
const rwIc=ic=>ic?(/[\/.]/.test(ic)?ic:`${UI}pg/${ic}.png`):'';
// UI 杂项图：优先 CQSys.uiIcon(key)（cq/icons_cq.js），缺则用当前路径；以 CSS 变量交给 pages_cq.css
const UIC=(k,fb)=>{try{const u=window.CQSys&&CQSys.uiIcon&&CQSys.uiIcon(k);if(u)return u}catch(e){}return fb};
// CSS 变量里的 url() 按引用它的样式表（cq/pages_cq.css）解析 → 一律转成绝对地址
const ABS=u=>{try{return new URL(u,document.baseURI).href}catch(e){return u}};
function uiVars(){const r=document.documentElement&&document.documentElement.style;if(!r)return;for(const[k,fb]of[['prof_bar','assets/ui/prof_bar_9s.png'],['prof_bar_fill','assets/ui/prof_bar_fill_9s.png'],['sign_cell','assets/ui/sign_cell_9s.png'],['stamp_ok','assets/ui/stamp_ok.png']])r.setProperty('--cq-'+k.replace(/_/g,'-'),`url("${ABS(UIC(k,fb))}")`)}
try{uiVars()}catch(e){}
const SIGNIC={};// 签到 claim() 返回的奖励图标（技能书随机，按实际抽到的书显示）
function signState(){try{return SG()&&SG().state()}catch(e){return null}}
function signPanel(){const st=signState();if(!st||!st.ok)return `<div class="cqpanel"><div class="cqttl">七日签到</div><div class="dim">签到系统未就绪</div></div>`;
 const D=(st.days||[]).map((d,i)=>`<div class="dy ${d.state||''}${d.big&&!d.state?' big':''}"><span>第${d.day||i+1}天</span>${(SIGNIC[d.day||i+1]||d.ic)?`<img src="${SIGNIC[d.day||i+1]||rwIc(d.ic)}" alt="">`:''}<span>${esc(d.name)}</span></div>`).join('');
 return `<div class="cqpanel"><div class="cqttl">七日签到<span class="r">已签 ${st.signed|0}/7 · 断签不清零</span></div><div class="days">${D}</div>
 <div class="row c"><button class="cqbtn ${st.canClaim?'gold':'dis'}" onclick="cqPg.sign()">${st.canClaim?'签到领取':'今日已签到'}</button></div></div>`}
function offPanelPg(){let st=null;try{st=OF()&&OF().state()}catch(e){}
 const head=`<div class="cqttl">离线收益<span class="r">上限 ${(st&&st.capH)||8} 小时</span></div>`;
 if(!st||!st.ok||!st.has)return `<div class="cqpanel">${head}<div class="dim">暂无离线收益。离线超过 1 分钟后再上线，会在这里领取。</div></div>`;
 const fm=s=>(window.CQSys&&CQSys.fmtLeft)?CQSys.fmtLeft(s):Math.round(s/60)+'分';
 const boss=(st.boss||[]).filter(b=>b.kills).map(b=>`${esc(b.n)} ×${b.kills}`).join('、');
 const btn=st.claimed?`<span class="tag">${st.doubled?'已双倍领取':'已领取'}</span>`:`<button class="cqbtn gold xs" onclick="cqPg.offClaim(false)">领取</button><button class="cqbtn xs" onclick="cqPg.offClaim(true)">元宝双倍 ${st.ybCost|0}</button>`;
 return `<div class="cqpanel">${head}<div class="row" style="justify-content:space-between"><div class="offl">离线 <b>${fm(st.sec)}</b>${st.zone?' · '+esc(st.zone):''}<br>经验 <b class="q5">+${kn(st.xp|0)}</b>　金币 <b>+${num(st.gold)}</b><br>击杀 <b>${num(st.kills)}</b>　装备 <b class="q3">×${st.items|0}</b>${boss?`　首领 <b class="q6">${boss}</b>`:''}</div>
 <div class="offb">${btn}</div></div><div class="dim">元宝 ${num(st.yb)} · 双倍只翻金币与经验</div></div>`}
function flTabs(){return `<div class="stabs sm cqfltabs">${FLN.map(([k,n])=>`<button class="${FLT===k?'on':''}" onclick="cqPg.fl('${k}')">${n}${(k==='sign'&&(signState()||{}).canClaim)||(k==='off'&&cqPg._offDot())?'<em class="dot"></em>':''}</button>`).join('')}</div>`}
// ---------------- 顶栏（设计稿 live.js topbar()：头像 / Lv+名字+战力 / 血蓝条 / 金币元宝 / 菜单）----------------
// 与战斗页 #cqStage .cqb .top 同一组件外观（样式同 cq.css .cqb .top），这里给 角色(含背包/商店/英雄)/技能/福利 页单独挂一份；地图页、战斗页不显示。
const TOPT={merc:1,hero:1,bag:1,shop:1,skill:1,eg:1,map:1};
function topData(){const c=cls(),cur=(window.CQSys&&CQSys.currency)?CQSys.currency():{gold:S.gold,yb:null};const st=ST||{},h=(typeof H!=='undefined'&&H)||{};
 let xp=0;try{const a=xpNeed(S.lvl),b=xpNeed(S.lvl+1);xp=b>a?Math.max(0,Math.min(100,(S.xp-a)/(b-a)*100)):100}catch(e){}
 if(S.lvl>=60&&window.CQSys&&CQSys.progression){const p=CQSys.progression();xp=p.reb>=p.max?100:Math.max(0,Math.min(100,p.xp/p.need*100))}
 return {cls:c,lvl:S.lvl|0,name:S.name||'',power:pw(),hp:st.life?Math.max(0,Math.min(100,(+h.life||0)/st.life*100)):0,mp:st.mana?Math.max(0,Math.min(100,(+h.mana||0)/st.mana*100)):0,xp,gold:cur.gold|0,yb:cur.yb}}
function topEl(){let e=document.getElementById('cqtopx');if(e)return e;const P=document.getElementById('panel');if(!P)return null;
 e=document.createElement('div');e.id='cqtopx';e.className='cqtopx hide';
 e.innerHTML=`<div class="ava"></div><div class="pinfo"><div class="clv"><span data-r="pn"></span><small data-r="pw"></small></div><div class="cbar hp"><i data-r="hp"></i></div><div class="cbar mp"><i data-r="mp"></i></div></div>
 <div class="ccur"><div><img src="${UI}coin.png" alt=""><span data-r="gold"></span></div><div><img src="${UI}yb.png" alt=""><span data-r="yb"></span></div></div><div class="menu metal" title="设置" onclick="cqPg.menu()"><b></b><b></b><b></b></div>`;
 P.parentNode.insertBefore(e,P);return e}
const tx=(e,v)=>{if(e&&e.textContent!==v)e.textContent=v},wd=(e,v)=>{v=v.toFixed(1)+'%';if(e&&e.style.width!==v)e.style.width=v};
function topSync(){const e=topEl();if(!e)return;const on=!!TOPT[TAB];e.classList.toggle('hide',!on);document.body.classList.toggle('cq-topx',on);if(!on)return;
 const d=topData(),q=k=>e.querySelector('[data-r='+k+']');const ac='ava '+d.cls;const a=e.querySelector('.ava');if(a.className!==ac)a.className=ac;
 tx(q('pn'),'Lv.'+d.lvl+' '+d.name);tx(q('pw'),'战力 '+num(d.power));wd(q('hp'),d.hp);wd(q('mp'),d.mp);tx(q('gold'),num(d.gold));tx(q('yb'),d.yb!=null?num(d.yb):'—');return d}
const MAPN=3,CHB=[['stage_1001.png','orclord'],['stage_1002.png','zombieking'],['a2_cave_0.webp','stonezombieking']];
let MAPOPEN=false,MQOPEN=false;
// 主线任务行：CQSys.questLine()（名称+进度，去掉标签），单行省略；点开 = 原 hud_cq 的 .cqmq 面板（移到这里，不再放底部折叠区）
function mqText(){let t='';try{t=(window.CQSys&&CQSys.questLine)?CQSys.questLine():(ok('questLine')?questLine():'')}catch(e){}return String(t||'').replace(/<[^>]*>/g,'').replace(/^【主线】/,'').trim()||'暂无主线任务'}
function mlv(z,d){try{return ok('mlD')?mlD(z.ml0!=null?z.ml0:z.ml,d):z.ml}catch(e){return z.ml}}
function bossRt(k){try{return CQSys.bossRt(k)}catch(e){return null}}
function cdTxt(r){if(!r)return'';if(r.ready)return'可挑战';const s=Math.max(0,Math.ceil(r.left||0)),m=Math.floor(s/60),x=s%60;return (m<10?'0':'')+m+':'+(x<10?'0':'')+x}
function zState(a,i,d){const open=ok('actOpen')?actOpen(a,d):a===0,here=a===S.act&&d===S.diff,k=ok('pkey')?pkey(a,d):'';
 const cl=here?S.cleared:((S.CL||{})[k]||{}),unl=here?S.unl:((S.UN||{})[k]||0);
 if(!open||i>unl)return'lk';if(here&&i===S.zone)return'here';if(cl[i])return'done';return'open'}
function chInfo(a,d){const A=ACTS[a],q=d===S.diff?S.q:((S.Q||{})[d]||{}),qs=Object.keys(QUESTS).filter(k=>QUESTS[k].act===a),dn=qs.filter(k=>q[k]).length;
 const open=ok('actOpen')?actOpen(a,d):a===0;const ml=A.zones.map(z=>mlv(z,d));
 return {a,n:(A.n.split('·')[1]||A.n).trim(),no:A.n.split('·')[0].trim(),camp:A.camp,boss:A.boss,open,done:qs.length&&dn===qs.length,qd:dn,qn:qs.length,lv:Math.min(...ml)+'–'+Math.max(...ml)}}
// 地图缩略图（美术2 0a58e56/df2d26b）：assets/cq/map/zone_<章 1起>_<区 1起>.webp，章 = ACTS[a]（a=0..2）；缺图隐藏
const zImg=(a,i)=>`assets/cq/map/zone_${a+1}_${i+1}.webp`,zThumb=(a,i,c)=>`<img class="${c}" src="${zImg(a,i)}" alt="" loading="lazy" onerror="this.style.display='none'">`;
function zoneRow(a,z,i,d){const s=zState(a,i,d),b=z.boss,B=b&&BOSSES[b],r=b?bossRt(b):null,tm=b&&s!=='lk'?cdTxt(r):'';
 const mons=(z.mons||[]).slice(0,3).map(k=>(MONS[k]||{}).n||k).join(' / ');
 const TAG={done:'<span class="tag ok">已通关</span>',here:'<span class="tag here">挂机中</span>',open:'<span class="tag op">已解锁</span>',lk:'<span class="tag lk">未解锁</span>'}[s];
 const per=r?(r.cd>=3600?'60':r.cd>=1800?'30':String(Math.round((r.cd||600)/60))):'';
 const btn=s==='lk'?'<button class="cqbtn xs dis">未解锁</button>':s==='here'?`<button class="cqbtn xs gold" onclick="cqPg.mapFight()">挂机中</button>`:`<button class="cqbtn xs" onclick="cqPg.mapGo(${a},${i})">前往</button>`;
 return `<div class="z ${s}" data-a="${a}" data-i="${i}"${s!=='lk'&&s!=='here'?` onclick="if(event.target.tagName!=='BUTTON')cqPg.mapGo(${a},${i})"`:''}><div class="pin">${s==='done'?'✔':s==='lk'?'🔒':i+1}</div>${zThumb(a,i,'zth')}<div class="i"><div class="n">${esc(z.n)}<small>Lv.${mlv(z,d)}</small>${z.dun?'<span class="tag dun">副本</span>':''}${TAG}</div>
 <div class="m">怪物：${esc(mons)}</div><div class="m">${B?`首领：<b>${esc(B.n)}</b> · ${r&&r.actboss?'章节首领 ':''}${per} 分钟${tm?` · <span class="${tm==='可挑战'?'rdy':'cd'}">${tm}</span>`:''}`:'首领：—'}</div></div>
 <div class="rt">${b?`<div class="bh"><img src="${UI}mdl_mst_${b}.png" alt="" onerror="this.style.display='none'"></div>`:''}${btn}</div></div>`}
function chapCard(c,d){const [bg,bo]=CHB[c.a]||[];const st=c.done?'<span class="tag ok">已通关</span>':c.open?'<span class="tag new">进行中</span>':`<span class="tag lk">${c.a?'击败'+esc(ACTS[c.a-1].boss)+'解锁':'未解锁'}</span>`;
 return `<div class="chc ${c.open?'':'lk'}" id="cqch_${c.a}"><div class="bg" style="background-image:url(${c.a>=2?`assets/cq/map/chapter_${c.a+1}.webp`:UI+'pg/'+bg})"></div><img class="boss" src="${UI}mdl_mst_${bo}.png" alt="">
 <div class="tx"><div class="no">${esc(c.no)} · CHAPTER</div><div class="t">${esc(c.n)}</div><div class="m">Lv.${c.lv} · 营地 ${esc(c.camp)}</div><div class="m">章节首领 <b class="bn">${esc(c.boss)}</b> · 区域 ${ACTS[c.a].zones.length}</div></div>
 <div class="st"><div class="prog"><i style="width:${c.qn?c.qd/c.qn*100:0}%"></i></div><span class="m">任务 ${c.qd}/${c.qn}</span>${st}</div></div>
 <div class="zl">${ACTS[c.a].zones.map((z,i)=>zoneRow(c.a,z,i,d)).join('')}</div>`}
function mapPage(old){const d=MAPD==null?S.diff:MAPD,cs=[];for(let a=0;a<MAPN&&a<ACTS.length;a++)cs.push(chInfo(a,d));const cur=Math.min(MAPN-1,S.act);
 return `<div class="cqpg cqmap"><div class="jump"><div class="stabs sm cqmaptabs">${cs.map(c=>`<button class="${c.a===cur?'on':''}" data-ch="${c.a}" onclick="cqPg.mapJump(${c.a})">${'一二三'[c.a]} · ${esc(c.n)}</button>`).join('')}<button onclick="cqPg.bossPop()">首领刷新</button></div>
 <div class="cqmqrow${MQOPEN?' open':''}" onclick="cqPg.mqToggle()"><b>主线任务</b><span class="t">${esc(mqText())}</span><i>${MQOPEN?'▴':'▾'}</i></div><div class="cqmqbox${MQOPEN?'':' hide'}"></div></div>
 ${d!==S.diff?`<div class="dim dnote">正在查看 ${esc(DIFFS[d].n)} 难度（当前挂机：${esc(DIFFS[S.diff].n)}）</div>`:''}
 ${cs.map(c=>chapCard(c,d)).join('')}
 <div class="chc lk soon"><div class="bg" style="background-image:url(assets/cq/map/chapter_4.webp),url(${UI}pg/img_bg_maptile1.png)"></div><div class="tx"><div class="no">第四章 · CHAPTER</div><div class="t">敬请期待</div><div class="m">击败${esc(ACTS[2].boss)}后开放</div></div></div>
 <details class="cqmapold"${MAPOPEN?' open':''} ontoggle="cqPg._mapOpen(this.open)"><summary>难度 · 主线任务 · 其他</summary>${old}</details></div>`}
function mqToggle(v){MQOPEN=v==null?!MQOPEN:!!v;const P=document.getElementById('panel');const b=P&&P.querySelector('.cqmap .cqmqbox'),r=P&&P.querySelector('.cqmap .cqmqrow');
 if(b)b.classList.toggle('hide',!MQOPEN);if(r){r.classList.toggle('open',MQOPEN);const i=r.querySelector('i');if(i)i.textContent=MQOPEN?'▴':'▾'}return MQOPEN}
function mapGo(a,i){const z=ACTS[a]&&ACTS[a].zones[i];if(!z)return;const d=MAPD==null?S.diff:MAPD,s=zState(a,i,d);if(s==='lk'){if(ok('toast'))toast('尚未解锁');return}
 const r=z.boss?bossRt(z.boss):null,mons=(z.mons||[]).map(k=>(MONS[k]||{}).n||k).join(' / ');
 modal(`<div class="cqpg cqgo"><div class="cqpanel"><div class="cqttl">传送 · ${esc(z.n)}</div>${zThumb(a,i,'zhead')}<div class="kv one"><div><span>怪物等级</span><b>Lv.${mlv(z,d)}</b></div><div><span>主要怪物</span><b>${esc(mons)}</b></div>${r?`<div><span>首领</span><b>${esc(r.n)} · ${cdTxt(r)}</b></div><div><span>推荐战力</span><b>${num(r.recPower)}</b></div>`:''}<div><span>难度</span><b>${esc(DIFFS[d].n)}</b></div></div>
 <div class="row c"><button class="cqbtn gold" onclick="closeM();cqPg.travel(${a},${i},${d})">传送挂机</button><button class="cqbtn" onclick="closeM()">取消</button></div></div></div>`)}
function travel(a,i,d){if(d==null)d=MAPD==null?S.diff:MAPD;if(zState(a,i,d)==='lk')return false;if(a!==S.act||d!==S.diff){if(ok('goAct'))goAct(a,d,1)}
 if(i>S.unl)return false;goZone(i);try{S.auto=S.auto}catch(e){}TAB='fight';render();return true}
function bossPop(){let L=[];try{L=CQSys.bossList().filter(b=>b.act<MAPN)}catch(e){}
 modal(`<div class="cqpg"><div class="cqpanel"><div class="cqttl">首领刷新</div><div class="kv one">${L.map(b=>`<div><span>${esc(b.n)} · ${esc(b.zn)}</span><b class="${b.ready?'rdy':''}">${cdTxt(b)}</b></div>`).join('')}</div>
 <div class="dim" style="margin-top:6px">普通首领 10 分钟 · 章节首领 30 分钟（第三章起 60 分钟）</div><div class="row c"><button class="cqbtn" onclick="closeM()">关闭</button></div></div></div>`)}
function mapJump(a){const e=document.getElementById('cqch_'+a),P=document.getElementById('panel');if(!e||!P)return;const j=P.querySelector('.cqmap .jump');
 const y=a===0?0:P.scrollTop+e.getBoundingClientRect().top-P.getBoundingClientRect().top-(j?j.offsetHeight:0)-4;P.scrollTo({top:Math.max(0,y),behavior:'smooth'});mapHi(a)}
function mapHi(a){document.querySelectorAll('#panel .cqmaptabs button[data-ch]').forEach(b=>b.classList.toggle('on',+b.dataset.ch===a))}
function mapScroll(){if(TAB!=='map')return;const P=document.getElementById('panel'),j=P&&P.querySelector('.cqmap .jump');if(!j)return;let a=0;
 const pt=P.getBoundingClientRect().top+j.offsetHeight+12;for(let i=0;i<MAPN;i++){const e=document.getElementById('cqch_'+i);if(e&&e.getBoundingClientRect().top<=pt)a=i}if(P.scrollTop+P.clientHeight>=P.scrollHeight-4)a=MAPN-1;mapHi(a);return a}
// ---------------- 包装 ----------------
function hook(){
 if(ok('renderHero')&&!renderHero.__cqpg){const f=renderHero;renderHero=function(){const r=f.apply(this,arguments);try{const P=$('#panel');P.insertAdjacentHTML('afterbegin',roleTop());P.classList.add('cqpgp')}catch(e){console.error('[cq pages] role',e)}return r};renderHero.__cqpg=1}
 if(ok('renderSkills')&&!renderSkills.__cqpg){const f=renderSkills;renderSkills=function(){const P=$('#panel');
   try{if(SKV==='list'){P.innerHTML=skTabs()+`<div class="cqpg cqskill">${skillPage()}</div>`;return}
    if(SKV==='bar'){P.innerHTML=skTabs()+battleBarPanel();return} if(SKV==='ac'){P.innerHTML=skTabs()+`<div class="cqpg">${ok('acPanel')?acPanel():''}</div>`;return}}catch(e){console.error('[cq pages] skill',e)}
   if(SKT===4)SKT=0;const r=f.apply(this,arguments);try{P.querySelectorAll('.stabs button[onclick*="SKT=4"]').forEach(b=>b.remove());P.insertAdjacentHTML('afterbegin',skTabs())}catch(e){}return r};renderSkills.__cqpg=1}
 if(ok('renderMap')&&!renderMap.__cqpg){const f=renderMap;renderMap=function(){const P=$('#panel');const r=f.apply(this,arguments);
   try{const st=P.scrollTop,kids=[...P.childNodes];const box=document.createElement('div');box.innerHTML=mapPage('');const det=box.querySelector('.cqmapold'),mqb=box.querySelector('.cqmqbox');kids.forEach(n=>(n.classList&&n.classList.contains('cqmq')?mqb:det).appendChild(n));P.innerHTML='';P.appendChild(box.firstElementChild);P.scrollTop=st;if(!P.__cqms){P.__cqms=1;P.addEventListener('scroll',()=>{try{mapScroll()}catch(e){}},{passive:true});P.addEventListener('click',e=>{if(TAB==='map'&&MQOPEN&&e.target.closest&&!e.target.closest('.cqmqbox,.cqmqrow'))mqToggle(false)})}
    if(!P.__cqmapfirst&&TAB==='map'){P.__cqmapfirst=1;const a0=Math.min(MAPN-1,S.act);if(a0>0)setTimeout(()=>mapJump(a0),0)}else mapScroll()}catch(e){console.error('[cq pages] map',e)}return r};renderMap.__cqpg=1}
 if(ok('renderEG')&&!renderEG.__cqpg){const f=renderEG;renderEG=function(){const P=$('#panel');
   try{if(FLT==='sign'||FLT==='off'){P.innerHTML=flTabs()+`<div class="cqpg cqfuli">${FLT==='sign'?signPanel()+offPanelPg():offPanelPg()}</div>`;return}}catch(e){console.error('[cq pages] fuli',e)}
   if(FLT!=='more')EGT=FLT;const r=f.apply(this,arguments);try{P.insertAdjacentHTML('afterbegin',flTabs());if(FLT!=='more')P.classList.add('cqfl1');else P.classList.remove('cqfl1')}catch(e){}return r};renderEG.__cqpg=1}
}
window.cqPg={barPick,barSet(i,id){CQSys.setBattleSkill(i,id);closeM();render()},autoEquip,smith(){TAB='shop';try{SHT='enh'}catch(e){}render()},toAttr(){const a=document.querySelector('#panel .attr');if(a)a.scrollIntoView({block:'center'})},
 mapGo,travel,mqToggle,mqText,bossPop,mapJump,mapScroll,mapFight(){TAB='fight';render()},_mapOpen(o){MAPOPEN=!!o},
 menu(){try{if(typeof setUI==='function')return setUI()}catch(e){}TAB='eg';FLT='more';render()},topSync,topData,
 sk(k){SKV=k;if(k==='ac')SKT=4;render()},fl(k){FLT=k;render()},sign(){const G=SG();if(!G)return null;const r=G.claim();if(r&&r.ok&&r.reward&&r.reward.icon)SIGNIC[r.day]=r.reward.icon;if(ok('toast'))toast(r&&r.ok?'签到成功：'+((r.reward&&r.reward.name)||''):(r&&r.reason)||'签到失败');render();return r},
 offClaim(d){const O=OF();if(!O)return null;const r=O.claim(!!d);if(ok('toast'))toast(r&&r.ok?(d?'已双倍领取':'已领取'):(r&&r.reason)||'领取失败');render();return r},
 _offDot(){try{const o=OF()&&OF().state();return !!(o&&o.has&&!o.claimed)}catch(e){return false}},
 _t:{zState,chInfo,mapPage,MAPN,TOPT,attrs,skList,FLN,EQL,EQR,roleTop,skillPage,signPanel,offPanelPg,flTabs,skTabs,get SKV(){return SKV},get FLT(){return FLT}}};
// 顶栏刷新：每次 render 后 + 0.5s 轮询（只在页签显示时写 DOM，且值变了才写）；换角色/职业后 render 也会同步
{const f=render;if(!render.__cqtop){render=function(){const r=f.apply(this,arguments);try{topSync()}catch(e){}return r};render.__cqtop=1}}
setInterval(()=>{try{if(TOPT[TAB]||document.body.classList.contains('cq-topx'))topSync()}catch(e){}},500);
hook();setTimeout(()=>{hook();try{if(TAB!=='fight')render()}catch(e){}},0);
})();
