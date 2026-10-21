// cq/m2_cq.js — 老羊传奇 M2 系统层：首领真实时间刷新、离线收益（含英雄/首领）、技能书掉落、召唤物框架（系统侧）。
// 接口与对接点见 docs/systems_api.md「M2」。不改 hitMon/killMon/spawnWave/offline 签名，只做运行时包装。
(function(){
const CS=window.CQSys=window.CQSys||{};const now=()=>Date.now();const emit=(e,d)=>CS.emit&&CS.emit(e,d);
// ============ 1) 首领真实时间刷新（§7.3） ============
// 周期：章节首领(actboss) 第 1–2 章 30 分钟、第 3 章起 60 分钟；其余首领 10 分钟。可用 CQ_BOSSRT[key]=秒 覆盖。
window.CQ_BOSSRT=window.CQ_BOSSRT||{};
function bossWhere(key){for(let a=0;a<ACTS.length;a++){const zs=ACTS[a].zones||[];for(let i=0;i<zs.length;i++){const z=zs[i];if(z.boss===key||(z.bosses||[]).includes(key))return{act:a,zone:i,zn:z.n,ml:z.ml0||z.ml}}}return null}
function bossCd(key){if(window.CQ_BOSSRT[key])return+window.CQ_BOSSRT[key];const B=BOSSES[key]||{},w=bossWhere(key);const R=CQ_BAL.bossRt;return B.actboss?(w&&w.act>=2?R.actLate:R.act):R.small}
function rtS(){if(!S.bossRt||typeof S.bossRt!=='object')S.bossRt={};return S.bossRt}
function bossRec(key){const w=bossWhere(key);return Math.round(((w&&w.ml)||1)*40*(BOSSES[key]&&BOSSES[key].actboss?1.5:1))}
CS.bossCd=bossCd;
CS.bossRt=key=>{const r=rtS()[key],cd=bossCd(key),k=r&&r.k||0,at=k?k+cd*1e3:0,left=at?Math.max(0,(at-now())/1e3):0;
 const w=bossWhere(key),B=BOSSES[key]||{};return{key,n:B.n,act:w?w.act:-1,zone:w?w.zone:-1,zn:w?w.zn:'',cd,killAt:k,readyAt:at,left,ready:left<=0,kills:(r&&r.n)|0,recPower:bossRec(key),actboss:!!B.actboss}};
CS.bossList=(act)=>{const out=[];const seen={};for(let a=0;a<ACTS.length;a++){if(act!=null&&a!==act)continue;for(const z of ACTS[a].zones||[])for(const k of(z.bosses||(z.boss?[z.boss]:[])))if(!seen[k]&&BOSSES[k]){seen[k]=1;out.push(CS.bossRt(k))}}return out};
CS.bossGo=key=>{const r=CS.bossRt(key);if(r.act<0)return{err:'未知首领'};if(typeof actOpen==='function'&&!actOpen(r.act,S.diff||0))return{err:'章节未解锁'};
 if(r.act!==S.act&&typeof goAct==='function')goAct(r.act,S.diff||0,1);if(r.zone>S.unl)return{err:'地图未解锁'};goZone(r.zone);return{ok:1,ready:r.ready}};
function markKill(m){const key=m&&m.key;if(!key||!BOSSES[key]||!(m.boss||m.actboss||m.qb))return;const R=rtS();const r=R[key]=R[key]||{k:0,n:0};r.k=now();r.n=(r.n|0)+1;r.ready=0;emit('bossKill',CS.bossRt(key))}
{const f=killMon;killMon=function(m){const r=f.apply(this,arguments);try{markKill(m)}catch(e){console.error(e)}return r}}
// 首领波：未到刷新时间则本波不出首领（照常出普通怪，地图可正常推进），并提示倒计时
{const f=spawnWave;spawnWave=function(){const z=zoneData(),last=S.wave>=z.w-1;const list=z.bosses||(z.boss?[z.boss]:[]);
 if(!last||!list.length||!S.bossRt)return f.apply(this,arguments);const wait=list.filter(k=>!CS.bossRt(k).ready);if(!wait.length)return f.apply(this,arguments);
 const ob=z.boss,obs=z.bosses;if(z.bosses)z.bosses=list.filter(k=>CS.bossRt(k).ready);if(z.bosses&&!z.bosses.length)delete z.bosses;if(ob&&wait.includes(ob))delete z.boss;
 try{const r=f.apply(this,arguments);for(const k of wait){const b=CS.bossRt(k);if(!window.__NOUI)log(`<span class="dim">${b.n} 刷新中，还需 ${fmtLeft(b.left)}</span>`);emit('bossWait',b)}return r}finally{if(ob)z.boss=ob;if(obs)z.bosses=obs}}}
function fmtLeft(s){s=Math.ceil(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}小时${m}分`:m?`${m}分${x}秒`:`${x}秒`}
CS.fmtLeft=fmtLeft;
// 到点派发 bossReady（在线每秒检查一次；登录/读档时离线期间到点的也会补发一次）
let rtT=0;function rtTick(){const R=rtS();for(const k in R){const r=R[k];if(r.ready||!r.k)continue;if(now()>=r.k+bossCd(k)*1e3){r.ready=1;emit('bossReady',CS.bossRt(k))}}}
{const f=step;step=function(dt){const r=f.apply(this,arguments);rtT+=dt;if(rtT>=1){rtT=0;try{rtTick()}catch(e){}}return r}}
// bossInfo：补充当前地图首领的真实时间刷新信息 rt
if(CS.bossInfo){const f=CS.bossInfo;CS.bossInfo=function(){const o=f.apply(this,arguments);try{const z=zoneData();const k=z.boss||(z.bosses||[])[0];if(k)o.rt=CS.bossRt(k)}catch(e){}return o}}
// ============ 2) 离线收益（含英雄击杀、首领按真实时间补算；上限 8 小时，弹结算） ============
{const f=offline;offline=function(){const last=S.last,sec=(now()-last)/1000;if(!(sec>=60))return f.apply(this,arguments);
 const O=CQ_BAL.off,t=Math.min(sec,O.maxH*3600),kpm=Math.max(2,S.kpm||4),kills=Math.floor(kpm*t/60*0.5);const g0=S.gold,x0=S.xp||0;
 const r=f.apply(this,arguments);const res={sec:Math.round(sec),capSec:Math.round(t),kills,heroKills:0,heroXp:0,heroGold:0,boss:[],items:[]};
 try{const z=zoneData();const h=S.hero&&S.hero.cls?S.hero:null;
  if(h&&kills>0){const hk=Math.floor(kills*O.heroK);res.heroKills=hk;let xp=0,g=0;for(let i=0;i<hk;i++){const m=mkMon(pick(z.mons),z.ml);xp+=m.exp*0.5;g+=typeof tcGoldExp==='function'?tcGoldExp(m)*0.5:0}
   xp=Math.round(xp);g=Math.round(g);gainXp(xp);S.gold+=g;res.heroXp=xp;res.heroGold=g}
  // 当前地图首领：按离线期间刷新次数补算击杀（按战力判胜负，掉落折半）
  const list=z.bosses||(z.boss?[z.boss]:[]);const pw=CS.power?CS.power():0;
  for(const k of list){const R=rtS(),r=R[k]||{k:0,n:0},cd=bossCd(k)*1e3,from=Math.max(last,r.k?r.k+cd:last),end=last+t*1e3;let n=0;
   if(r.k||S.q[z.quest]){n=end>=from?1+Math.floor((end-from)/cd):0}n=Math.min(n,O.bossMax);const rec=bossRec(k),win=pw>=rec*O.winPow;
   const one={key:k,n:BOSSES[k].n,tries:n,win,kills:win?n:0,recPower:rec,power:pw};
   if(win&&n>0){for(let i=0;i<n;i++){const m=mkMon(k,z.ml+(BOSSES[k].actboss?0:2));gainXp(Math.round(m.exp*0.5));for(const it of rollTC(m))if(rnd()<O.bossDrop&&addBag(it))res.items.push(it)}
    R[k]={k:last+Math.min(t*1e3,(from-last)+(n-1)*cd),n:(r.n|0)+n,ready:0}}
   res.boss.push(one)}
  rtTick();
 }catch(e){console.error('[cq offline]',e)}
 res.gold=S.gold-g0;S.cqOff=res;emit('offline',res);if(!window.__NOUI)offPanel(res);return r}}
function offPanel(res){const m=document.querySelector('#modal:not(.hide) .gp');const h=`<div class="cqoff"><h4>离线结算（老羊传奇）</h4>${res.heroKills?`<div>英雄击杀 ${res.heroKills} 只：经验 +${fmt(res.heroXp)} 金币 +${fmt(res.heroGold)}</div>`:''}
 ${res.boss.map(b=>`<div>首领 <b class="bossn">${b.n}</b>：${b.tries?(b.win?`击杀 ${b.kills} 次（掉落折半）`:`战力不足（${b.power}/${b.recPower}），未击杀`):'未刷新'}</div>`).join('')}
 ${res.items.length?`<div class="grid">${res.items.map(it=>cell(it,'')).join('')}</div>`:''}</div>`;
 if(m){const b=m.querySelector('.btns.c');b?b.insertAdjacentHTML('beforebegin',h):m.insertAdjacentHTML('beforeend',h)}
 else if(res.heroKills||res.boss.some(b=>b.kills))modal(`<div class="mtitle">离线收益</div><div class="gp">${h}<div class="btns c"><button class="btn gold" onclick="closeM()">收下</button></div></div>`)}
CS.offlineLast=()=>S.cqOff||null;
// ============ 3) 技能书（职业 Bot 登记/学习） ============
// 书 = 材料（S.mats 不占格）：MATS['book_<skillId>']，名称「技能书·<技能名>」。职业 Bot 用 CQSys.bookDef 覆盖/补充，用 CQSys.onBookLearn 接学习。
window.CQ_BOOKS=window.CQ_BOOKS||{};
const BK=[['zs',[['jbjs','基本剑术',1],['gsjs','攻杀剑术',7],['cs','刺杀剑术',22],['ymcz','野蛮冲撞',19],['bywd','半月弯刀',26],['lhjf','烈火剑法',35]]],
 ['fs',[['hqs','火球术',7],['kjhh','抗拒火环',12],['yhzg','诱惑之光',13],['dyh','地狱火',16],['ldsh','雷电术',17],['sxyd','瞬息移动',19],['dhq','大火球',19],['blhy','爆裂火焰',22],['hq','火墙',24],['jgdy','疾光电影',26],['dylg','地狱雷光',26],['mfd','魔法盾',31],['sys','圣言术',32],['bpx','冰咆哮',35]]],
 ['ds',[['zys','治愈术',7],['jsl','精神力战法',9],['sds','施毒术',14],['lhhf','灵魂火符',18],['zhkl','召唤骷髅',19],['yss','隐身术',20],['ylyd','幽灵盾',22],['xlqs','心灵启示',23],['sszj','神圣战甲术',25],['kmz','困魔咒',28],['qtzy','群体治愈术',33],['zhss','召唤神兽',35]]]];
// 与职业 Bot 对齐：cls_zs/fs/ds.js 已注册的技能（SKM[id].cls）按「同名」取其技能 id 与需求等级 r；书 id = 职业_技能id，sk = 技能 id
const clsSk=c=>(typeof CLS_SKILLS!=='undefined'?CLS_SKILLS:[]).filter(x=>x&&x.cls===c);
for(const[c,L]of BK){const real=clsSk(c);for(const[id0,n,lv0]of L){const r=real.find(x=>x.n===n);const id=r?r.id:id0,k=c+'_'+id;
 if(!window.CQ_BOOKS[k])window.CQ_BOOKS[k]=r?{id:k,sk:id,n,cls:c,lv:r.r||lv0}:{id:k,sk:id,n,cls:c,lv:lv0,placeholder:1}}
 for(const r of real)if(!/^x/.test(r.id)&&!window.CQ_BOOKS[c+'_'+r.id]&&r.ty!=='passive_hidden')window.CQ_BOOKS[c+'_'+r.id]={id:c+'_'+r.id,sk:r.id,n:r.n,cls:c,lv:r.r||1}}
function bookMat(b){const k='book_'+b.id;if(!MATS[k])MATS[k]={n:'技能书·'+b.n,c:'#e8c070',d:`${({zs:'战士',fs:'法师',ds:'道士'})[b.cls]}技能书，需要等级 ${b.lv}。使用：未学会则学会，已学会则技能 +1 级（最高 20 级，不耗技能点）；挂机时自动使用。`};return k}
for(const b of Object.values(window.CQ_BOOKS))bookMat(b);
CS.books=cls=>Object.values(window.CQ_BOOKS).filter(b=>!cls||b.cls===cls);
CS.bookDef=(id,o)=>{const b=window.CQ_BOOKS[id]=Object.assign(window.CQ_BOOKS[id]||{id},o||{},{id});delete b.placeholder;if(o&&o.n&&MATS['book_'+id])MATS['book_'+id].n='技能书·'+o.n;bookMat(b);return b};
CS.bookKnown=id=>!!(S.cqBooks&&S.cqBooks[id]);
CS.bookCount=id=>CS.matCount?CS.matCount('book_'+id):((S.mats||{})['book_'+id]|0);
const LH=[];CS.onBookLearn=fn=>{LH.push(fn)};
CS.bookLearn=id=>{const b=window.CQ_BOOKS[id];if(!b)return{err:'未知技能书'};if(b.cls!==CS.curCls())return{err:'职业不符'};if((S.lvl|0)<b.lv)return{err:`需要等级 ${b.lv}`};
 if(CS.bookMaxed(id))return{err:'技能已满级'};if(CS.bookCount(id)<1)return{err:'没有这本书'};CS.takeMat('book_'+id,1);(S.cqBooks=S.cqBooks||{})[id]=(S.cqBooks[id]|0)+1;
 // 系统侧效果：未学会 → 学会（1 级）；已学会 → +1 级（上限 CQ_BAL.book.maxLv=20，不耗技能点）。职业 Bot 的 onBookLearn 回调在此之后执行，可再覆盖
 let from=0,to=0;if(typeof SKM!=='undefined'&&SKM[b.sk]){S.sk=S.sk||{};from=S.sk[b.sk]|0;to=Math.min(CQ_BAL.book.maxLv||20,from+1);S.sk[b.sk]=to;if(typeof calc==='function')calc()}b.from=from;b.to=to;
 for(const f of LH)try{f(b)}catch(e){console.error(e)}emit('bookLearn',b);save();return{ok:1,book:b,from,to}};
CS.bookMaxed=id=>{const b=window.CQ_BOOKS[id];return !!b&&!!(S.sk&&(S.sk[b.sk]|0)>=(CQ_BAL.book.maxLv||20))};
// 挂机（S.autoSk 开）时，本职业、等级够的书掉落即自动使用
CS.on&&CS.on('bookDrop',e=>{try{if(!S.autoSk)return;const b=window.CQ_BOOKS[e.id];if(!b||b.cls!==CS.curCls()||(S.lvl|0)<b.lv)return;CS._bookQ=(CS._bookQ||[]).concat(e.id)}catch(x){}});
CS.bookAutoUse=()=>{let n=0;const q=CS._bookQ||[];CS._bookQ=[];for(const id of q){if(CS.bookCount(id)>0&&CS.bookLearn(id).ok)n++}
 if(S.autoSk)for(const b of CS.books(CS.curCls()))while((S.lvl|0)>=b.lv&&CS.bookCount(b.id)>0&&CS.bookLearn(b.id).ok)n++;return n};
{const f=autoTick;autoTick=function(){const r=f.apply(this,arguments);try{if(S.autoSk)CS.bookAutoUse()}catch(e){}return r}}
CS.bookDropFor=(m)=>{const B=CQ_BAL.book;const p=m.actboss?B.actboss:m.boss?B.boss:(m.fl||m.champ||m.elite)?B.elite:B.normal;if(rnd()>=p)return null;
 const ml=m.lv||1,c=CS.curCls();const ok=b=>b.lv<=ml+3;let pool=Object.values(window.CQ_BOOKS).filter(b=>ok(b)&&!CS.bookMaxed(b.id));if(!pool.length)return null;
 const own=pool.filter(b=>b.cls===c);if(own.length&&rnd()<B.ownCls)pool=own;const w=b=>1/(1+b.lv/10);return wpick(pool,w)};
{const f=rollTC;rollTC=function(m){const out=f.apply(this,arguments)||[];try{const b=m&&CS.bookDropFor(m);if(b){const k=bookMat(b);out.push({uid:S.uid++,k:'mat',id:k,n:1});emit('bookDrop',{id:b.id,n:b.n,mon:m.key})}}catch(e){}return out}}
// ============ 4) 召唤物框架（系统侧：存档、属性、伤害预算） ============
// S.summons = [{id, kind:'dog'|'skel'|'pet', mon?, sk(技能id), lv(技能等级), hp, deadAt, eq:{collar?}}]（随角色存档）
function SM(){if(!Array.isArray(S.summons))S.summons=[];return S.summons}
const CAP={dog:1,skel:1};
CS.summonCap=(kind,skLv)=>kind==='pet'?Math.min(CQ_BAL.summon.petMax,(skLv|0)<=0?0:(skLv>=10?2:1)):(CAP[kind]||0);
CS.summonList=()=>SM().map(s=>Object.assign({},s,{stats:CS.summonStats(s.id)}));
CS.summonAdd=(kind,o)=>{o=o||{};if(!['dog','skel','pet'].includes(kind))return{err:'种类无效'};const c=CS.curCls();if((kind==='pet'&&c!=='fs')||(kind!=='pet'&&c!=='ds'))return{err:'职业不符'};
 const lv=Math.max(1,o.lv|0);const have=SM().filter(s=>s.kind===kind).length;if(have>=CS.summonCap(kind,lv))return{err:'数量已满'};
 if(kind==='pet'){const z=zoneData();if(!o.mon||!(z.mons||[]).includes(o.mon)||BOSSES[o.mon])return{err:'只能诱惑当前地图的普通怪'}}
 const s={id:'s'+(S.uid++),kind,mon:o.mon||null,sk:o.sk||null,lv,hp:0,deadAt:0,eq:{}};SM().push(s);s.hp=CS.summonStats(s.id).hp;save();emit('summon',{op:'add',s});return{ok:1,summon:s}};
CS.summonRemove=id=>{const L=SM(),i=L.findIndex(s=>s.id===id);if(i<0)return{err:'无'};const[s]=L.splice(i,1);if(s.eq.collar)S.bag.push(s.eq.collar);save();emit('summon',{op:'remove',s});return{ok:1}};
CS.summonSetLv=(id,lv)=>{const s=SM().find(x=>x.id===id);if(!s)return{err:'无'};s.lv=Math.max(1,lv|0);emit('summon',{op:'lv',s});return{ok:1}};
CS.summonStats=id=>{const s=SM().find(x=>x.id===id);if(!s)return null;const K=CQ_BAL.summon,a=CS.equipAttrs?CS.equipAttrs():{};const lvl=S.lvl||1;
 const base=(s.kind==='pet'?(a.mag|0):(a.tao|0))+lvl*K.attrLv,g=1+s.lv*K.lvK;let hp,atk,def;
 if(s.kind==='pet'){const T=MONS[s.mon]||{hp:20,dmg:[2,4],def:2};const mk=typeof mkMon==='function'?mkMon(s.mon,Math.max(1,Math.round(lvl*0.8))):null;
  hp=(mk?mk.max||mk.hp:T.hp)*K.pet.hp*g;atk=((mk&&mk.dmg?(mk.dmg[0]+mk.dmg[1])/2:(T.dmg[0]+T.dmg[1])/2)+base*0.2)*K.pet.atk*g;def=((mk&&mk.def)||T.def||0)*K.pet.def}
 else{const k=K[s.kind];hp=base*k.hp*g+40;atk=base*k.atk*g+2;def=base*k.def*g}
 if(s.eq.collar){const m=allMods(s.eq.collar);hp+=m.life||0;atk+=(m.maxdmg||0);def+=(m.def||0)}
 return{id:s.id,kind:s.kind,mon:s.mon,lv:s.lv,hp:Math.round(hp),atk:Math.round(atk),def:Math.round(def),alive:!s.deadAt,reviveLeft:s.deadAt?Math.max(0,K.revive-(now()-s.deadAt)/1e3):0}};
CS.summonDie=id=>{const s=SM().find(x=>x.id===id);if(!s)return;s.deadAt=now();s.hp=0;emit('summon',{op:'die',s})};
CS.summonRevive=id=>{const s=SM().find(x=>x.id===id);if(!s)return{err:'无'};const st=CS.summonStats(id);if(st.reviveLeft>0)return{err:'冷却中',left:st.reviveLeft};s.deadAt=0;s.hp=st.hp;emit('summon',{op:'revive',s});return{ok:1}};
CS.summonEquipCollar=(id,uid)=>{const s=SM().find(x=>x.id===id);if(!s||s.kind!=='dog')return{err:'只有神兽有项圈位'};const i=S.bag.findIndex(x=>x.uid===uid);if(i<0)return{err:'背包无此物品'};
 const b=BASEM[S.bag[i].b];if(!b||b.s!=='amulet')return{err:'项圈位暂用项链类物品'};const old=s.eq.collar;s.eq.collar=S.bag.splice(i,1)[0];if(old)S.bag.push(old);save();emit('summon',{op:'collar',s});return{ok:1}};
// 伤害预算：src 'cqpet' 计入召唤物；30 秒窗口内召唤物占总伤害 ≤ CQ_BAL.summon.share，超出部分等比截断
const SW={b:[]};function swB(){const t=Math.floor(now()/1e3);let b=SW.b[SW.b.length-1];if(!b||b[0]!==t){b=[t,0,0];SW.b.push(b);while(SW.b.length&&SW.b[0][0]<=t-30)SW.b.shift()}return b}
CS.summonShare=()=>{swB();let o=0,p=0;for(const b of SW.b){o+=b[1];p+=b[2]}return{other:o,pet:p,share:o+p>0?p/(o+p):0,cap:CQ_BAL.summon.share}};
{const f=hitMon;hitMon=function(m,d,src,fxc){const pet=src==='cqpet';if(pet&&d&&typeof d==='object'){const st=CS.summonShare(),s=st.cap;if(st.other>0){const room=Math.max(0,st.other*s/(1-s)-st.pet);let t=0;for(const k in d)t+=+d[k]||0;if(t>room){const k2=t>0?room/t:0,o={};for(const k in d)o[k]=(+d[k]||0)*k2;d=o}}}
 const r=f.call(this,m,d,src,fxc);if(src!=='dot'&&r>0)swB()[pet?2:1]+=r;return r}}
CS._summonReset=()=>{SW.b.length=0};
// 背包里点技能书 → 详情弹窗追加「学习」按钮
if(typeof showItem==='function'){const f=showItem;showItem=function(uid){const r=f.apply(this,arguments);try{if(!window.__NOUI){const F=findItem(uid),it=F&&F.it;if(it&&it.k==='mat'&&/^book_/.test(it.id||'')){const id=it.id.slice(5);const m=document.querySelector('#modal .btns');
 if(m&&!m.querySelector('.cqbook'))m.insertAdjacentHTML('afterbegin',`<button class="btn gold cqbook" onclick="(()=>{const r=CQSys.bookLearn('${id}');toast(r.ok?'学会 '+r.book.n:r.err);if(r.ok){closeM();render()}})()">学习</button>`)}}}catch(e){}return r}}
// 伤害封顶：记录进入 hitMon 最外层（共享包装之外）的伤害，供 cq/cap_cq.js 计算运行时包装倍率
{const f=hitMon;hitMon=function(m,d,src,fxc){const o=window.CQ_CAPIN;if(o)o(d);try{return f.apply(this,arguments)}finally{if(o)o(null)}}}
CS.capLast=()=>CQ_BAL.capLast?CQ_BAL.capLast():null;
CS.m2=1;
})();
