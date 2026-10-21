// cq/sysapi_cq.js — 老羊传奇 M1：给战斗 Bot / 职业 Bot 的系统侧正式接口（替换 cq_bridge.js 的 CQ.MISSING 兜底）。
// 说明见 docs/systems_api.md。只做运行时包装，不改 hitMon/floatNum/killMon/groundLoot/usePot 签名。
(function(){
const CS=window.CQSys=window.CQSys||{};
// ---------- 事件 ----------
const LS={};CS.on=(ev,fn)=>{(LS[ev]=LS[ev]||[]).push(fn);return()=>{LS[ev]=LS[ev].filter(f=>f!==fn)}};
CS.emit=(ev,d)=>{for(const f of LS[ev]||[])try{f(d)}catch(e){console.error('[CQSys]',ev,e)}
  try{if(typeof CustomEvent==='function'&&window.dispatchEvent)window.dispatchEvent(new CustomEvent('cq:'+ev,{detail:d}))}catch(e){}};
const now=()=>Date.now();
// ---------- 职业 / 角色 ----------
CS.classes=()=>CLASSES.map(c=>({id:c.id,n:c.n,d:c.d,ic:c.ic,open:!!c.open}));
CS.createChar=(name,cls,mode)=>{const id=newChar(name,cls,mode);if(id||id===0)CS.emit('char',{id,cls});return id};
CS.curCls=()=>(typeof curCls==='function'?curCls():S.cls)||'zs';
// ---------- 英雄（S.hero：随角色存档 → 进云存档、按角色区分） ----------
const HDEF=()=>({cls:null,name:'',lvl:1,rage:0,autoHeji:1,eq:{},t:0});
CS.hero=()=>{if(!S.hero||typeof S.hero!=='object')S.hero=HDEF();const h=S.hero;for(const[k,v]of Object.entries(HDEF()))if(h[k]==null)h[k]=v;return h};
CS.heroSet=p=>{const h=CS.hero();for(const k of['name','rage','autoHeji'])if(p&&k in p)h[k]=p[k];h.rage=Math.max(0,Math.min(100,+h.rage||0));CS.emit('hero',h);return h};
CS.heroProfs=()=>{const c=CS.curCls();return c==='zs'?['fs','ds']:['zs','fs','ds'].filter(x=>x!==c).concat(['zs']).filter((x,i,a)=>a.indexOf(x)===i)};
CS.heroCreate=(cls,name)=>{const h=CS.hero();if(h.cls)return{err:'已有英雄'};if(!['zs','fs','ds'].includes(cls))return{err:'职业无效'};
  h.cls=cls;h.name=(name||'').trim().slice(0,12)||({zs:'战士',fs:'法师',ds:'道士'}[cls]+'英雄');h.lvl=S.lvl||1;h.t=now();save();CS.emit('hero',h);return{ok:1,hero:h}};
CS.heroEquip=uid=>{const h=CS.hero();const i=S.bag.findIndex(x=>x.uid===uid);if(i<0)return{err:'背包无此物品'};const it=S.bag[i],b=BASEM[it.b];if(!b||it.k)return{err:'不可装备'};
  const c=CS.itemCls?CS.itemCls(it):null;if(c&&c!==h.cls)return{err:'职业不符'};const s=b.s;const old=h.eq[s];S.bag.splice(i,1);h.eq[s]=it;if(old)S.bag.push(old);save();CS.emit('hero',h);return{ok:1,slot:s}};
CS.heroUnequip=s=>{const h=CS.hero();const it=h.eq[s];if(!it)return{err:'空'};if(typeof bagFits==='function'&&!bagFits(it))return{err:'背包已满'};delete h.eq[s];S.bag.push(it);save();CS.emit('hero',h);return{ok:1}};
CS.heroStats=()=>{const h=CS.hero(),K=CQ_BAL.hero,lv=Math.min(S.lvl||1,CQ_BAL.lvlCap);let mn=0,mx=0,def=0,mdef=0,hp=0;
  for(const it of Object.values(h.eq)){const l=itemLocal(it),m=allMods(it);mn+=l.min||0;mx+=l.max||0;def+=l.def||0;mdef+=m.mdef||0;hp+=m.life||0}
  const bm=K.cls[h.cls||'zs'];return{cls:h.cls,lvl:lv,atkMin:Math.round(mn+lv*bm.atk*0.6),atkMax:Math.round(mx+lv*bm.atk),def:Math.round(def+lv*bm.def),mdef:Math.round(mdef+lv*bm.def*0.5),
    hp:Math.round(K.hp0+lv*bm.hp+hp),takesDmg:!!K.takesDmg,heroK:K.k}};
// ---------- 技能冷却（职业 Bot 填 CQ_SKCD[id]=秒；施放时调 CQSys.skillCast(id)） ----------
window.CQ_SKCD=window.CQ_SKCD||{};const CAST={};
CS.skillCast=id=>{CAST[id]=now();CS.emit('skill',{id,t:CAST[id]})};
CS.skillCooldown=id=>{const cd=+window.CQ_SKCD[id]||0,t=CAST[id]||0,left=t&&cd?Math.max(0,cd-(now()-t)/1000):0;return{id,cd,left,ready:left<=0,placeholder:!window.CQ_SKCD[id]}};
// ---------- 怪物 → 传奇立绘（assets/cq/ui/<art>.png） ----------
// 按 web-replica monster.txt 的 name→model 对照（同名取首条；首领在 monster.txt 里 model 为占位 1001=鸡 的视为无图）；无图的怪为 ''，monArt 返回 null，不兜底骷髅
window.CQ_MONART=Object.assign({chick:'mdl_mst_1001',deer:'mdl_mst_1002',scarecrow:'mdl_mst_1005',hookcat:'mdl_mst_1003',rakecat:'mdl_mst_1004',halforc:'mdl_mst_1006',spider1:'mdl_mst_1009',redsnake:'mdl_mst_1025',tigersnake:'mdl_mst_1025',orcwar:'mdl_mst_1008',rakecatking:'',redsnakeking:'',orclord:'',cqskel:'mdl_mst_1013',cqskelwar:'mdl_mst_1015',cqaxeskel:'mdl_mst_1014',cqyeti:'mdl_mst_1007',cqmaneater:'mdl_mst_1011',cqskelelite:'',skelspirit:'mdl_mst_2001',treedemon:'',zombieking:'',cqzombie:'mdl_mst_1023',cqcrawler:'mdl_mst_1024',cqelezombie:'mdl_mst_2002',cqmaggot:'mdl_mst_1022',cqbeetle:'mdl_mst_1034',cqbat:'mdl_mst_1012',elezombieking:'',stonezombieking:''},window.CQ_MONART||{});
CS.monArt=key=>{const a=window.CQ_MONART[key];return a?{id:a,src:'assets/cq/ui/'+a+'.png'}:null};
// ---------- 元宝（账号级 ACCT.yb，进云存档、跨角色共享） ----------
CS.currency=()=>({gold:S.gold||0,yb:(typeof ACCT!=='undefined'&&ACCT&&ACCT.yb)|0});
CS.ybAdd=(n,why)=>{n=Math.floor(+n||0);if(n<=0)return CS.currency().yb;ACCT.yb=(ACCT.yb|0)+n;acctSave();CS.emit('yb',{d:n,why,yb:ACCT.yb});return ACCT.yb};
CS.ybSpend=(n,why)=>{n=Math.floor(+n||0);if(n<=0||(ACCT.yb|0)<n)return false;ACCT.yb-=n;acctSave();CS.emit('yb',{d:-n,why,yb:ACCT.yb});return true};
// ---------- 战力 ----------
CS.power=()=>{let p=0;for(const it of Object.values(S.eq||{}))if(it)p+=power(it);for(const it of Object.values(CS.hero().eq))p+=Math.round(power(it)*0.5);
  return Math.round((p+(S.lvl||1)*20)*cqCapMul(1+(S.reb||0)*CQ_BAL.budget.reb))};
// ---------- 英雄伤害占比上限（CQ_BAL.budget.hero：英雄普攻 cqhero + 合击 cqheji ≤ 总伤害 20%，滑动 30 秒窗口） ----------
const SH={win:30,b:[]};// [秒桶, 本体, 英雄]
function shBucket(){const t=Math.floor(now()/1e3);let b=SH.b[SH.b.length-1];if(!b||b[0]!==t){b=[t,0,0];SH.b.push(b);while(SH.b.length&&SH.b[0][0]<=t-SH.win)SH.b.shift()}return b}
function shAdd(h,v){if(!(v>0))return;shBucket()[h?2:1]+=v}
CS.heroShare=()=>{let p=0,h=0;shBucket();for(const b of SH.b){p+=b[1];h+=b[2]}return{player:p,hero:h,share:p+h>0?h/(p+h):0,cap:CQ_BAL.budget.hero,win:SH.win}};
function heroCap(d){const st=CS.heroShare();if(!(st.player>0))return d;/* 窗口内本体尚无伤害（开战瞬间/测试）不截断 */const room=Math.max(0,cqHeroDmgCap(st.player)-st.hero);let tot=0;for(const k in d)tot+=+d[k]||0;
 if(tot<=room)return d;const k2=tot>0?room/tot:0,o={};for(const k in d)o[k]=(+d[k]||0)*k2;CS.emit('heroCapped',{want:tot,got:room});return o}
CS._heroReset=()=>{SH.b.length=0};
// ---------- 正式暴击标记（替代全局 CRIT） ----------
// CQSys.hit = 最近一次 hitMon 的 {crit,src,dmg,t}；hitMon 执行期间 CQSys.critNow===true 表示本次为暴击。
CS.hit={crit:false,src:null,dmg:0,t:0};CS.critNow=false;
{const f=hitMon;hitMon=function(m,d,src,fxc){let crit=(typeof CRIT!=='undefined'&&!!CRIT);
  const isH=src==='cqhero'||src==='cqheji';if(isH&&d&&typeof d==='object')d=heroCap(d);
  if(!crit&&!isH&&src!=='dot'&&d&&typeof d==='object'){const c=(CS.equipAttrs?CS.equipAttrs().crit:0)||0;if(c>0&&rnd()*100<c){crit=true;const d2={};for(const k in d)d2[k]=d[k]*CQ_BAL.critMul;d=d2}}
  CS.critNow=crit;try{const r=f.call(this,m,d,src,fxc);if(src!=='dot')shAdd(isH,+r||0);CS.hit={crit,src:src||null,dmg:r||0,t:now()};if(crit)CS.emit('crit',CS.hit);return r}finally{CS.critNow=false}}}
// ---------- 首领刷新 / 狂暴 ----------
const BS={on:null,spawnAt:0,killAt:0,enr:false};
CS.bossInfo=()=>{const B=CQ_BAL.boss,t=now(),m=BS.on;if(m&&m.hp>0)return{alive:true,key:m.key,spawnAt:BS.spawnAt,enrageAt:BS.spawnAt+B.enrage*1e3,enrageLeft:Math.max(0,B.enrage-(t-BS.spawnAt)/1e3),enraged:BS.enr};
  return{alive:false,killAt:BS.killAt,respawnAt:BS.killAt?BS.killAt+B.respawn*1e3:0,respawnLeft:BS.killAt?Math.max(0,B.respawn-(t-BS.killAt)/1e3):0}};
CS.bossTick=()=>{if(typeof MON==='undefined')return;const b=MON.find(m=>m&&m.hp>0&&(m.boss||m.actboss));
  if(b&&b!==BS.on){BS.on=b;BS.spawnAt=now();BS.enr=false;CS.emit('bossSpawn',{key:b.key,name:b.name||b.n,enrageIn:CQ_BAL.boss.enrage})}
  if(BS.on&&BS.on.hp<=0){CS.emit('bossDead',{key:BS.on.key});BS.on=null;BS.killAt=now();BS.enr=false}
  if(BS.on&&!BS.enr&&(now()-BS.spawnAt)/1e3>=CQ_BAL.boss.enrage){BS.enr=true;const m=BS.on;m.cqEnr=1;if(Array.isArray(m.dmg))m.dmg=m.dmg.map(x=>x*CQ_BAL.boss.enrMul);CS.emit('bossEnrage',{key:m.key,mul:CQ_BAL.boss.enrMul})}};
{const f=step;step=function(dt){const r=f.apply(this,arguments);try{CS.bossTick()}catch(e){}return r}}
// ---------- 吃药（只说明，不改） ----------
CS.potions=()=>({hp:S.pot.hp|0,mp:S.pot.mp|0,rej:S.pot.rej|0,tp:S.pot.tp|0});
CS.usePot=k=>usePot(k);
CS.api=1;
})();
