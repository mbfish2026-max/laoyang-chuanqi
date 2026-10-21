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
function attrs(){const s=ST||{},p=v=>(Math.round((+v||0)*10)/10)+'%';
 return [['攻击',(s.wmin|0)+'-'+(s.wmax|0)],['防御',num(s.def)],['生命',num(s.life)],['魔法值',num(s.mana)],['准确',num(s.ar)],['攻速','+'+p(s.ias)],
  ['暴击',p(s.bcrit)],['吸血',p(s.ll)],['寻宝','+'+p(s.mf)],['金币','+'+p(s.gf)],['格挡',p(s.block)],['减伤',p(s.dr)]]}
function roleTop(){const c=cls(),por=`assets/char/${c}_portrait.webp`;
 return `<div class="cqpg cqrole"><div class="cqpanel"><div class="cqttl">装备<span class="r">10 部位 · 点击查看/强化</span></div>
 <div class="eqw"><div class="por" style="background-image:url(${por})"></div><div class="col L">${EQL.map(slot).join('')}</div><div class="col R">${EQR.map(slot).join('')}</div>
 <div class="nm">${esc(S.name||'')}　Lv.${S.lvl} ${CLSN[c]||''}</div><div class="pw">战力 <b>${num(pw())}</b></div></div></div>
 <div class="cqpanel"><div class="cqttl">属性<span class="r">剩余属性点 <b class="g">${S.sp|0}</b></span></div>
 <div class="kv">${attrs().map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div></div>
 <div class="acts"><button class="cqbtn gold" onclick="cqPg.autoEquip()">一键换装</button><button class="cqbtn" onclick="cqPg.smith()">铁匠强化</button><button class="cqbtn${S.sp?'':' dis'}" onclick="cqPg.toAttr()">分配属性点</button><button class="cqbtn" onclick="charUI()">切换职业</button></div>
 <div class="cqttl cqmore">详细<span class="r">加点 · 设置 · 加成汇总</span></div></div>`}
// 一键换装：系统接口 CQSys.equip.autoBest（docs/systems_api.md §福利 / 一键换装）
function autoEquip(){const E=window.CQSys&&CQSys.equip;if(!E||!E.autoBest){if(ok('toast'))toast('一键换装暂不可用');return null}
 const r=E.autoBest();if(ok('toast'))toast(r&&r.changed?`已换上 ${r.changed} 件更好的装备 · 战力 ${num(r.power&&r.power.before)}→${num(r.power&&r.power.after)}`:(r&&r.reason)||'没有更强的装备');render();return r}
// ---------------- 技能 ----------------
let SKV='list';
function skList(){const c=cls();return SKILLS.filter(s=>s.cls===c&&skOfCls(s)).sort((a,b)=>a.r-b.r||a.col-b.col)}
function skIcon(id,sm){const n=window.CQ&&CQ.SK_ICON&&CQ.SK_ICON[id];return n?`<img src="${UI}sk/ic_sk_${n}.png" alt="">`:`<span class="gl">${esc((SKM[id]||{}).ic||'✦')}</span>`}
function skDesc(s){try{const v=SV(s.id,Math.max(1,bl(s.id)));const t=(v&&v.txt)||'';return (s.kind==='passive'&&!/^被动/.test(t)?'被动 · ':'')+t}catch(e){return ''}}
function skillPage(){const L=skList(),lv=S.lvl;
 const row=s=>{const b=bl(s.id),lk=!b&&lv<s.r;const d=lk?`Lv.${s.r} 解锁`:skDesc(s);
  const btn=lk?'<button class="cqbtn xs dis">未解锁</button>':`<button class="cqbtn xs ${canLearn(s.id)?'gold':''}" onclick="skPop('${s.id}')">${b?'升级':canLearn(s.id)?'学习':'详情'}</button>`;
  return `<div class="sk2 ${lk?'lk':''}"><div class="ic">${skIcon(s.id)}</div><div class="i"><div class="n">${esc(s.n)}${b?`<small>Lv.${b}</small>`:''}</div><div class="d">${esc(d)}</div><div class="lv"><i style="width:${Math.min(100,b*5)}%"></i></div></div>${btn}</div>`};
 const A=ok('acLearned')?acLearned():[];
 const ord=A.map((id,i)=>{const c=acCfg(id);return `<div class="ord"><div class="no">${i+1}</div>${skIcon(id)}<b>${esc(SKM[id].n)}</b><span class="c">${esc((ok('acSmartTxt')&&acSmartTxt(id))||'冷却好即放')}</span><span class="ar" onclick="acMove('${id}',-1)">▲</span><span class="ar" onclick="acMove('${id}',1)">▼</span><div class="sw ${c.on?'':'off'}" onclick="acSet('${id}','on',${c.on?0:1})"></div></div>`}).join('')||'<div class="dim">尚未学会主动技能</div>';
 return `<div class="cqpanel"><div class="cqttl">技能<span class="r">技能点 <b class="g">${S.kp|0}</b> · 等级上限 20</span></div>${L.map(row).join('')}</div>
 <div class="cqpanel"><div class="cqttl">自动释放顺序<span class="r">从上到下检查</span></div>${ord}</div>`}
function skTabs(){const c=cls();return `<div class="stabs cqsktabs">${[['list',(CLSN[c]||'')+'技能'],['ac','自动施法'],['tree','技能树']].map(([k,n])=>`<button class="${SKV===k?'on':''}" onclick="cqPg.sk('${k}')">${n}</button>`).join('')}</div>`}
// ---------------- 福利 ----------------
let FLT='sign';const FLN=[['sign','签到'],['off','离线收益'],['bounty','悬赏'],['ach','功业'],['event','事件'],['more','更多']];
// 签到 / 离线收益：系统接口 CQSys.signin / CQSys.offline（逻辑、奖励、存档都在 cq/fuli_cq.js）
const SG=()=>window.CQSys&&CQSys.signin,OF=()=>window.CQSys&&CQSys.offline;
const rwIc=ic=>ic?`${UI}pg/${ic}.png`:'';
function signState(){try{return SG()&&SG().state()}catch(e){return null}}
function signPanel(){const st=signState();if(!st||!st.ok)return `<div class="cqpanel"><div class="cqttl">七日签到</div><div class="dim">签到系统未就绪</div></div>`;
 const D=(st.days||[]).map((d,i)=>`<div class="dy ${d.state||''}${d.big&&!d.state?' big':''}"><span>第${d.day||i+1}天</span>${d.ic?`<img src="${rwIc(d.ic)}" alt="">`:''}<span>${esc(d.name)}</span></div>`).join('');
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
// ---------------- 包装 ----------------
function hook(){
 if(ok('renderHero')&&!renderHero.__cqpg){const f=renderHero;renderHero=function(){const r=f.apply(this,arguments);try{const P=$('#panel');P.insertAdjacentHTML('afterbegin',roleTop());P.classList.add('cqpgp')}catch(e){console.error('[cq pages] role',e)}return r};renderHero.__cqpg=1}
 if(ok('renderSkills')&&!renderSkills.__cqpg){const f=renderSkills;renderSkills=function(){const P=$('#panel');
   try{if(SKV==='list'){P.innerHTML=skTabs()+`<div class="cqpg cqskill">${skillPage()}</div>`;return}
    if(SKV==='ac'){P.innerHTML=skTabs()+`<div class="cqpg">${ok('acPanel')?acPanel():''}</div>`;return}}catch(e){console.error('[cq pages] skill',e)}
   if(SKT===4)SKT=0;const r=f.apply(this,arguments);try{P.querySelectorAll('.stabs button[onclick*="SKT=4"]').forEach(b=>b.remove());P.insertAdjacentHTML('afterbegin',skTabs())}catch(e){}return r};renderSkills.__cqpg=1}
 if(ok('renderEG')&&!renderEG.__cqpg){const f=renderEG;renderEG=function(){const P=$('#panel');
   try{if(FLT==='sign'||FLT==='off'){P.innerHTML=flTabs()+`<div class="cqpg cqfuli">${FLT==='sign'?signPanel()+offPanelPg():offPanelPg()}</div>`;return}}catch(e){console.error('[cq pages] fuli',e)}
   if(FLT!=='more')EGT=FLT;const r=f.apply(this,arguments);try{P.insertAdjacentHTML('afterbegin',flTabs());if(FLT!=='more')P.classList.add('cqfl1');else P.classList.remove('cqfl1')}catch(e){}return r};renderEG.__cqpg=1}
}
window.cqPg={autoEquip,smith(){TAB='shop';try{SHT='enh'}catch(e){}render()},toAttr(){const a=document.querySelector('#panel .attr');if(a)a.scrollIntoView({block:'center'})},
 sk(k){SKV=k;if(k==='ac')SKT=4;render()},fl(k){FLT=k;render()},sign(){const G=SG();if(!G)return null;const r=G.claim();if(ok('toast'))toast(r&&r.ok?'签到成功：'+((r.reward&&r.reward.name)||''):(r&&r.reason)||'签到失败');render();return r},
 offClaim(d){const O=OF();if(!O)return null;const r=O.claim(!!d);if(ok('toast'))toast(r&&r.ok?(d?'已双倍领取':'已领取'):(r&&r.reason)||'领取失败');render();return r},
 _offDot(){try{const o=OF()&&OF().state();return !!(o&&o.has&&!o.claimed)}catch(e){return false}},
 _t:{attrs,skList,FLN,EQL,EQR,roleTop,skillPage,signPanel,offPanelPg,flTabs,skTabs,get SKV(){return SKV},get FLT(){return FLT}}};
hook();setTimeout(()=>{hook();try{if(TAB!=='fight')render()}catch(e){}},0);
})();
