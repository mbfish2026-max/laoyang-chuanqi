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
const HDEF=()=>({cls:null,name:'',lvl:1,rage:0,autoHeji:1,eq:{},t:0,xp:0,skOff:{},mode:'attack'});
CS.hero=()=>{if(!S.hero||typeof S.hero!=='object')S.hero=HDEF();const h=S.hero;for(const[k,v]of Object.entries(HDEF()))if(h[k]==null)h[k]=v;h.lvl=Math.max(1,Math.min(h.lvl|0||1,S.lvl||1));return h};
CS.heroSet=p=>{const h=CS.hero();for(const k of['name','rage','autoHeji'])if(p&&k in p)h[k]=p[k];h.rage=Math.max(0,Math.min(100,+h.rage||0));CS.emit('hero',h);return h};
CS.heroProfs=()=>['zs','fs','ds'];
CS.heroUnlock=()=>!!CS.hero().cls||(S.lvl||1)>=22;
CS.heroCreate=(cls,name)=>{const h=CS.hero();if(h.cls)return{err:'已有英雄'};if(!CS.heroUnlock())return{err:'22级解锁英雄'};if(!['zs','fs','ds'].includes(cls))return{err:'职业无效'};
  h.cls=cls;h.name=(name||'').trim().slice(0,12)||({zs:'战士',fs:'法师',ds:'道士'}[cls]+'英雄');h.lvl=1;h.xp=0;h.t=now();save();CS.emit('hero',h);return{ok:1,hero:h}};
CS.heroEquip=uid=>{const h=CS.hero();const i=S.bag.findIndex(x=>x.uid===uid);if(i<0)return{err:'背包无此物品'};const it=S.bag[i],b=BASEM[it.b];if(!b||it.k)return{err:'不可装备'};
  const c=CS.itemCls?CS.itemCls(it):null;if(c&&c!==h.cls)return{err:'职业不符'};const s=b.s;const old=h.eq[s];S.bag.splice(i,1);h.eq[s]=it;if(old)S.bag.push(old);save();CS.emit('hero',h);return{ok:1,slot:s}};
CS.heroUnequip=s=>{const h=CS.hero();const it=h.eq[s];if(!it)return{err:'空'};if(typeof bagFits==='function'&&!bagFits(it))return{err:'背包已满'};delete h.eq[s];S.bag.push(it);save();CS.emit('hero',h);return{ok:1}};
CS.heroStats=()=>{const h=CS.hero(),K=CQ_BAL.hero,lv=Math.min(h.lvl||1,S.lvl||1,CQ_BAL.lvlCap);let mn=0,mx=0,def=0,mdef=0,hp=0;
  for(const it of Object.values(h.eq)){const l=itemLocal(it),m=allMods(it);mn+=l.min||0;mx+=l.max||0;def+=l.def||0;mdef+=m.mdef||0;hp+=m.life||0}
  const bm=K.cls[h.cls||'zs'];return{cls:h.cls,lvl:lv,atkMin:Math.round(mn+lv*bm.atk*0.6),atkMax:Math.round(mx+lv*bm.atk),def:Math.round(def+lv*bm.def),mdef:Math.round(mdef+lv*bm.def*0.5),
    hp:Math.round(K.hp0+lv*bm.hp+hp),takesDmg:!!K.takesDmg,heroK:K.k}};
// 开关与模式均随角色存档；英雄事件通知战斗层重新读取。
CS.hero.skState=()=>Object.assign({},CS.hero().skOff);
CS.hero.skToggle=(id,on)=>{const h=CS.hero();if(id!=='heji'&&!(typeof heroSkList==='function'&&heroSkList(h.cls).includes(id)))return{err:'技能无效'};
 if(on==null)on=!!h.skOff[id];if(on)delete h.skOff[id];else h.skOff[id]=1;save();CS.emit('hero',h);return{ok:1,on:!!on}};
CS.heroMode=mode=>{const h=CS.hero();if(mode==null)return h.mode;if(!['attack','follow','rest','recall'].includes(mode))return{err:'模式无效'};h.mode=mode;save();CS.emit('hero',h);return{ok:1,mode}};
CS.heroGainXp=n=>{const h=CS.hero();if(!h.cls||h.mode==='rest'||h.mode==='recall'||!(n>0))return;
 const cap=Math.min(S.lvl||1,CQ_BAL.lvlCap);if(h.lvl>=cap)return;h.xp=(+h.xp||0)+n;
 while(h.lvl<cap&&h.xp>=xpNeed(h.lvl+1)){h.lvl++;CS.emit('hero',h)}
 if(h.lvl>=cap)h.xp=Math.min(h.xp,xpNeed(cap+1)-1)};
{const f=gainXp;gainXp=function(n){const r=f.apply(this,arguments);CS.heroGainXp(n);return r}}
// v2 → v3：保留已有英雄；旧佣兵按职业转换，装备溢出退回背包/仓库。
CS.heroMigrate=()=>{const m=S.merc;if(m){const h=CS.hero();if(!h.cls&&m.t){h.cls=({mage:'fs',archer:'ds',guard:'zs',barb:'zs'})[m.t]||'zs';h.name=m.nm||'英雄';h.lvl=Math.max(1,Math.min(m.lvl||1,S.lvl||1));h.xp=Math.min(+m.xp||0,xpNeed(h.lvl+1)-1);h.autoEq=m.auto?1:0;h.t=now()}
 const seen=new Set([...S.bag,...Object.values(S.eq||{}),...Object.values(h.eq),...(S.pst||[]).flat(),...(S.stash||[]),...(S.migBox||[])].filter(Boolean).map(x=>x.uid));
 for(const it of [...Object.values(m.eq||{}),...Object.values(m.prev&&m.prev.eq||{})]){if(!it||typeof it!=='object'||seen.has(it.uid))continue;seen.add(it.uid);
 if(typeof pruneObj==='function'){const box={it};const g=pruneObj(box);S.gold=(S.gold||0)+g;S.cqPruneG=(S.cqPruneG||0)+g;if(!box.it)continue}
 const b=BASEM[it.b],c=CS.itemCls?CS.itemCls(it):null,req=b&&!it.k&&typeof itemReq==='function'?itemReq(it):{};
 if(h.cls&&b&&!it.k&&!h.eq[b.s]&&(!c||c===h.cls)&&h.lvl>=(req.lv||1)){h.eq[b.s]=it;continue}
 if(bagFits(it))S.bag.push(it);else{const pg=(S.pst||[]).find(a=>fits(a,it,PAGE_SZ));if(pg)pg.push(it);else(S.migBox=S.migBox||[]).push(it)}}}
 delete S.merc;delete S.mercU;delete S.autoMerc;ALLY=ALLY.filter(a=>a.kind!=='merc');S.migHero=1;S.v=3;return CS.hero()};
{const f=load;load=function(){const r=f.apply(this,arguments);CS.heroMigrate();save();CS.emit('hero',CS.hero());return r}}
{const f=save;save=function(){CS.heroMigrate();return f.apply(this,arguments)}}
// ---------- 技能冷却（职业 Bot 填 CQ_SKCD[id]=秒；施放时调 CQSys.skillCast(id)） ----------
window.CQ_SKCD=window.CQ_SKCD||{};const CAST={};
CS.skillCast=id=>{CAST[id]=now();CS.emit('skill',{id,t:CAST[id]})};
CS.skillCooldown=id=>{const cd=+window.CQ_SKCD[id]||0,t=CAST[id]||0,left=t&&cd?Math.max(0,cd-(now()-t)/1000):0;return{id,cd,left,ready:left<=0,placeholder:!window.CQ_SKCD[id]}};
// ---------- 怪物 → 传奇立绘（assets/cq/ui/<art>.png） ----------
// 按 web-replica monster.txt 的 name→model 对照（同名取首条；首领在 monster.txt 里 model 为占位 1001=鸡 的视为无图；美术2 的 mdl_mst_<key>.png 按 key 补入）；无图的怪为 ''，monArt 返回 null，不兜底骷髅
window.CQ_MONART=Object.assign({chick:'mdl_mst_1001',deer:'mdl_mst_1002',scarecrow:'mdl_mst_1005',hookcat:'mdl_mst_1003',rakecat:'mdl_mst_1004',halforc:'mdl_mst_1006',spider1:'mdl_mst_1009',redsnake:'mdl_mst_1025',tigersnake:'mdl_mst_1025',orcwar:'mdl_mst_1008',rakecatking:'mdl_mst_rakecatking',redsnakeking:'mdl_mst_redsnakeking',orclord:'mdl_mst_orclord',cqskel:'mdl_mst_1013',cqskelwar:'mdl_mst_1015',cqaxeskel:'mdl_mst_1014',cqyeti:'mdl_mst_1007',cqmaneater:'mdl_mst_1011',cqskelelite:'mdl_mst_cqskelelite',skelspirit:'mdl_mst_skelspirit',treedemon:'mdl_mst_treedemon',zombieking:'mdl_mst_zombieking',cqzombie:'mdl_mst_1023',cqcrawler:'mdl_mst_1024',cqelezombie:'mdl_mst_2002',cqmaggot:'mdl_mst_1022',cqbeetle:'mdl_mst_1034',cqbat:'mdl_mst_1012',elezombieking:'mdl_mst_elezombieking',stonezombieking:'mdl_mst_stonezombieking',ape:'mdl_mst_ape',archer:'mdl_mst_archer',bat:'mdl_mst_bat',beetle:'mdl_mst_beetle',corrupt:'mdl_mst_corrupt',cowbeast:'mdl_mst_cowbeast',cowbrute:'mdl_mst_cowbrute',fiend:'mdl_mst_fiend',flayer:'mdl_mst_flayer',flshaman:'mdl_mst_flshaman',fly:'mdl_mst_fly',frog:'mdl_mst_frog',ghost:'mdl_mst_ghost',hopper:'mdl_mst_hopper',horror:'mdl_mst_horror',hound:'mdl_mst_hound',hulk:'mdl_mst_hulk',husk:'mdl_mst_husk',imp:'mdl_mst_imp',jackal:'mdl_mst_jackal',knight:'mdl_mst_knight',leaper:'mdl_mst_leaper',mauler:'mdl_mst_mauler',minion:'mdl_mst_minion',mosq:'mdl_mst_mosq',pitlord:'mdl_mst_pitlord',priest:'mdl_mst_priest',rat:'mdl_mst_rat',rogue:'mdl_mst_rogue',serpent:'mdl_mst_serpent',shaman:'mdl_mst_shaman',shroom:'mdl_mst_shroom',siren:'mdl_mst_siren',skel:'mdl_mst_skel',spider:'mdl_mst_spider',sporer:'mdl_mst_sporer',storm:'mdl_mst_storm',tombmage:'mdl_mst_tombmage',vamp:'mdl_mst_vamp',venom:'mdl_mst_venom',vulture:'mdl_mst_vulture',wolf:'mdl_mst_wolf',wraith:'mdl_mst_wraith',yeti:'mdl_mst_yeti',zealot:'mdl_mst_zealot',zombie:'mdl_mst_zombie'},window.CQ_MONART||{});
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

(function(){const CS=window.CQSys;
// 战斗栏配置随 S 保存；首次访问复制旧栏位的已学优先顺序。
CS.battleSkills=()=>{
 const valid=id=>!!(SKM[id]&&skOfCls(SKM[id])&&SKM[id].ty!=='passive');
 if(!Array.isArray(S.battleSkills)||(S.battleSkillsCls&&S.battleSkillsCls!==curCls())){
  const ids=acLearned().filter(valid).slice(0,4);
  CLS_SKILLS.filter(s=>valid(s.id)).slice().sort((a,b)=>a.r-b.r||((window.CQ&&CQ.SK_ICON&&CQ.SK_ICON[b.id])?1:0)-((window.CQ&&CQ.SK_ICON&&CQ.SK_ICON[a.id])?1:0)).forEach(s=>{if(ids.length<4&&!ids.includes(s.id))ids.push(s.id)});
  S.battleSkills=Array.from({length:4},(_,i)=>ids[i]||null);
 }
 S.battleSkillsCls=curCls();
 S.battleSkills=Array.from({length:4},(_,i)=>valid(S.battleSkills[i])?S.battleSkills[i]:null);
 return S.battleSkills.slice();
};
CS.setBattleSkill=(slot,id)=>{
 if(!Number.isInteger(slot)||slot<0||slot>3)return false;
 if(id!==null&&!(SKM[id]&&skOfCls(SKM[id])&&SKM[id].ty!=='passive'))return false;
 const ids=CS.battleSkills(),other=id===null?-1:ids.indexOf(id);
 if(other>=0&&other!==slot)ids[other]=ids[slot];
 ids[slot]=id;S.battleSkills=ids;save();return true;
};
CS.battleSkillState=id=>{
 const s=SKM[id],lock=!s||!bl(id)||S.lvl<s.r;
 const cd=s&&s.cd||0,left=cd?clsCdLeft(id):Math.max(0,H.castT||0);
 return {lock,cd:cd||Math.max(ST.castT||0,ST.atkT||0,0.3),left,mana:!!s&&H.mana>=SV(id,Math.max(1,slvl(id))).mana};
};
CS.manualSkill=id=>{
 if(!CS.battleSkills().includes(id))return {ok:0,err:'未配置'};
 const s=SKM[id],st=CS.battleSkillState(id),ms=liveMon();
 if(st.lock)return {ok:0,err:'尚未学会'};
 if(st.left>0)return {ok:0,err:'冷却中'};
 if(!st.mana)return {ok:0,err:'法力不足'};
 if(H.life<=0)return {ok:0,err:'角色已倒下'};
 if(!['buff','heal','pet'].includes(s.ty)&&!ms.length)return {ok:0,err:'暂无目标'};
 if(s.ty==='charm'&&CLS_TY.charm.ok&&!CLS_TY.charm.ok(s,ms))return {ok:0,err:'暂无可诱惑目标'};
 const r=clsCast(id,ms);H.castT=r===2?ST.atkT:ST.castT;return {ok:1};
};
{const f=save;save=function(){CS.battleSkills();return f.apply(this,arguments)}}
{const f=load;load=function(){const r=f.apply(this,arguments);CS.battleSkills();return r}}

{const f=resetRuntime;resetRuntime=function(){for(const id in ACT)delete ACT[id];return f.apply(this,arguments)}}

})();
