'use strict';
// ===== 第二阶段逻辑：章节/难度切换、怪物难度与免疫、精英词缀、怪物技能、多首领/波次首领、任务奖励、随从 =====
// 通过包装 game.js 中的函数实现，尽量不改动 game.js 本体。
const ACX={};const HSOFT=0.008,DSOFT=0.018;// 高等级怪物生命/伤害成长软化(近似调校)
const GATE=4;let MAPD=null;
// 章节推进宽限由 HELL_GATE 提供；传奇七章与显示等级由 mir2_maps/progression 接管。
const GATE_N=6,GATE_NE=8;// 普通难度挂机推进宽限：章内区域间 6 级、进入新章节首区域 8 级（噩梦仍 GATE=4，地狱见 HELL_GATE）
function gateOf(a,d,entry){return d===2?HELL_GATE[a]:d===0?(entry?GATE_NE:GATE_N):GATE}
const ELK=['fire','cold','light','pois'],ELN={phys:'物',fire:'火',cold:'冰',light:'电',pois:'毒',magic:'魔'};
function curPen(){return 0}
// ---------- 存档 / 进度 ----------
function pkey(a=S.act,d=S.diff){return d+'_'+a}
function syncProg(){if(!S.Q)return;S.Q[S.diff]=S.q;const k=pkey();S.CL[k]=S.cleared;S.UN[k]=S.unl;S.ZN[k]=S.zone}
function cqMetaParaDefense(){
 const pts=S.eg&&S.eg.para&&S.eg.para.pts;if(!pts||!pts.allres)return;
 S.cqMetaHistory=S.cqMetaHistory||{};const r=Math.max(0,+pts.allres||0);
 S.cqMetaHistory.paraAllres=(S.cqMetaHistory.paraAllres||0)+r;
 const b=S.bon||(S.bon={});b.def=(b.def||0)+r*4;b.mdef=(b.mdef||0)+r*4;b.attack=(b.attack||0)+r;
 delete pts.allres;
}
function cqMetaRewards(){cqMetaParaDefense();
 if(S.cqMetaRewardsV1)return;S.cqMetaHistory=S.cqMetaHistory||{};
 const b=S.bon||(S.bon={}),r=Math.max(0,+b.res||0),q=Math.max(0,+S.sockq||0);
 S.cqMetaHistory.bonRes=b.res||0;S.cqMetaHistory.sockq=S.sockq||0;
 // 旧永久防护折为固定防御与魔御，同时补固定攻击，原始值留档核对。
 b.def=(b.def||0)+r*4;b.mdef=(b.mdef||0)+r*4;b.attack=(b.attack||0)+r;
 if(q)S.gold=(S.gold||0)+q*5000;
 delete b.res;delete S.sockq;
 S.cqQuestReward=S.cqQuestReward||{};for(const d in S.Q||{})for(const k of ['a5q1','a5q3'])if(S.Q[d][k])S.cqQuestReward[d+'_'+k]=1;
 S.cqMetaRewardsV1=1;
}
function migrate(){
 if(!S.Q){S.Q={0:S.q||{}};S.CL={'0_0':S.cleared||{}};S.UN={'0_0':S.unl||0};S.ZN={'0_0':S.zone||0};S.diff=0;S.act=0}
 S.ZN=S.ZN||{};S.actU=S.actU||{0:0};S.diffU=S.diffU||0;S.bon=S.bon||{life:0};cqMetaRewards();S.pers=S.pers||0;
 if(S.act1done)S.actU[0]=Math.max(S.actU[0]||0,1);
 S.q=S.Q[S.diff]||(S.Q[S.diff]={});const k=pkey();S.cleared=S.CL[k]||(S.CL[k]={});S.unl=S.UN[k]||0;
 applyDiff();MAPA=S.act;MAPD=S.diff}
function applyDiff(){for(const A of ACTS)for(const z of A.zones){if(z.ml0==null)z.ml0=z.ml;z.ml=mlD(z.ml0,S.diff)}}
const _load=load;load=function(){_load();migrate()};
const _save=save;save=function(){syncProg();_save()};
function actOpen(a,d){return d<=S.diffU&&a<=(S.actU[d]||0)}
function goAct(a,d,quiet){if(!actOpen(a,d))return toast('尚未解锁');syncProg();const dc=d!==S.diff;S.diff=d;S.act=a;
 S.q=S.Q[d]||(S.Q[d]={});const k=pkey();S.cleared=S.CL[k]||(S.CL[k]={});S.unl=S.UN[k]||0;S.zone=Math.min(S.ZN[k]||0,S.unl);S.wave=0;
 applyDiff();MON=[];CORPSE=[];if(dc)ALLY=[];spawnT=2;calc();H.life=ST.life;H.mana=ST.mana;
 log(`<b class="quest">前往 ${DIFFS[d].n} · ${ACTS[a].n}（营地：${ACTS[a].camp}）</b>`);if(!quiet)render()}
function unlockAfter(a){const d=S.diff;
 if(a<ACTS.length-1){S.actU[d]=Math.max(S.actU[d]||0,a+1);log(`<b class="quest">${DIFFS[d].n}难度 ${ACTS[a+1].n} 已解锁</b>`)}
 else if(d<DIFFS.length-1){S.diffU=Math.max(S.diffU,d+1);S.actU[d+1]=Math.max(S.actU[d+1]||0,0);log(`<b class="quest">${DIFFS[d+1].n}难度已解锁！</b>`);toast(DIFFS[d+1].n+'难度已解锁')}
 else log('<b class="quest">恭喜！地狱难度全部章节已完成</b>')}
function nextStage(){const a=S.act,d=S.diff;if(a<ACTS.length-1&&actOpen(a+1,d))return[a+1,d];if(a===ACTS.length-1&&d<DIFFS.length-1&&actOpen(0,d+1))return[0,d+1];return null}

// ---------- 怪物：难度、防御/魔御、精英词缀、技能 ----------
// 将旧怪物防护表统一成固定魔御；生命、攻击和首领成长保持原配置。
function monsterMagicDefense(T,lv,d){const r=Object.assign({},T.res||{},d===1?T.resN:d===2?T.resH:{});const old=Math.min(80,Math.max(0,...['fire','cold','light','pois','magic'].map(k=>Math.max(0,r[k]||0)+(r[k]>0?(d===1?15:d===2?30:0):0))));const scale=100+Math.max(0,lv-1)*5;return Math.max(T.mdef||0,scale*old/(100-old))}
const _mkMon=mkMon;mkMon=function(key,lv,flag){const m=_mkMon(key,lv,flag),T=MONS[key]||BOSSES[key],D=DIFFS[S.diff]||DIFFS[0];
 m.res={};m.mdef=monsterMagicDefense(T,lv,S.diff);const basePhys=(T.res&&T.res.phys)||0;const rp=Math.min(80,Math.max(0,basePhys+(basePhys>0?(S.diff===1?15:S.diff===2?30:0):0)));m.def=Math.max(m.def,(100+Math.max(0,lv-1)*5)*rp/(100-rp));
 const hg=lv>25?1/(1+HSOFT*(lv-25)):1,dg=lv>25?1/(1+DSOFT*(lv-25)):1;m.max=m.hp=Math.round(m.max*D.hp*hg*(typeof clsHpK==="function"?clsHpK():1));const bfm=BOSSES[key]&&S.bf?Math.max(0.5,Math.pow(0.8,S.bf[bfKey(key)]||0)):1;m.dmg=m.dmg.map(x=>x*D.dmg*dg*bfm);m.exp=m.exp*expCurve(lv)*D.exp*(typeof clsXpK==="function"?clsXpK():1);m.sk=(T.sk||[]).slice();m.skT=2.5+rnd()*3;m.demon=T.demon;
 if(flag==='uniq'){const ks=Object.keys(ELITE_AFF).filter(k=>!(k==='mb'&&false));const n=Math.min(3,D.naff||1);const aff=[];
  while(aff.length<n){const k=pick(ks);if(!aff.includes(k))aff.push(k)}for(const k of aff)ELITE_AFF[k].f(m);m.aff=aff.map(k=>ELITE_AFF[k].n);m.n=pick(UNIQ_T)+'·'+T.n}
 if(flag==='champ'){const v=pick(CHAMP_V);v.f(m);m.n=v.n+'·'+T.n}
 if(!BOSSES[key]){m.max=m.hp=Math.max(1,Math.round(m.max*DENSITY.hp));m.dmg=m.dmg.map(x=>x*DENSITY.dmg);m.exp*=DENSITY.exp}
 if(S.diff===2)m.exp*=HELL_ACT_EXP[S.act]||1;
 if(!S.diff&&S.act===0)m.dmg=m.dmg.map(x=>x*NORM_EARLY.dmg);
 m.imm=[];return m};
// 防御/魔御为唯一防护来源；不读取元素免疫或降抗诅咒。
resOf=function(m,k){const d=k==='phys'?Math.max(0,m.def||0):Math.max(0,m.mdef||0);return 100*d/(d+100+Math.max(0,(m.lv||1)-1)*5)};
const DN=n=>Math.max(1,Math.round(n*DENSITY.n));
function zoneMons(z){return z.mons&&z.mons.length?z.mons:['imp']}
spawnWave=function(){const z=zoneData(),wi=S.wave,last=wi>=z.w-1;const mons=zoneMons(z);
 const bw=z.bw&&z.bw[wi];
 if(bw){for(const k of bw.b){const m=mkMon(k,z.ml+2);MON.push(m);log(`<b class="bossn">${m.n}</b> 现身！`)}for(let i=0;i<DN(bw.n||3);i++)MON.push(mkMon(pick(bw.m||mons),z.ml+1,i===0?'champ':''));MON=MON.slice(0,DENSITY.cap);return}
 if(last&&(z.boss||z.bosses)){const list=z.bosses||[z.boss];for(const k of list){const lv=z.ml+(BOSSES[k].actboss?(z.bl||0):2);const m=mkMon(k,lv);m.qb=1;MON.push(m);log(`<b class="bossn">${m.n}</b> 出现了！`)}
  if(!z.solo)for(let i=0;i<DN(R(2,4));i++)MON.push(mkMon(pick(mons),z.ml));MON=MON.slice(0,DENSITY.cap);return}
 const r=rnd();
 if(r<0.1){const k=pick(mons);for(let i=0;i<DN(R(2,3));i++)MON.push(mkMon(k,z.ml+2,'champ'))}
 else if(r<0.15){const k=pick(mons);const L=mkMon(k,z.ml+3,'uniq');MON.push(L);log(`<span class="uniq">${L.n}</span> [${L.aff.join('/')}]${L.imm.length?' <b style="color:#f66">免疫'+L.imm.map(x=>ELN[x]).join('')+'</b>':''}`);
  for(let i=0;i<DN(R(2,3));i++){const mm=mkMon(k,z.ml+3);if(L.fan)mm.spd*=1.25;MON.push(mm)}}
 else for(let i=0;i<DN(R(2,5));i++)MON.push(mkMon(pick(mons),z.ml));
 MON=MON.slice(0,DENSITY.cap)};
// TC 升级：噩梦/地狱中精英与首领按更高一档(每难度 +3 级)的宝藏级别抽取
const _rollTC=rollTC;rollTC=function(m){if(!m.boss&&rnd()>DENSITY.drop)return[];const lv=m.lv;const up=(m.boss||m.fl==='uniq'||m.fl==='champ')?3*S.diff:0;m.lv=lv+up;try{return _rollTC(m)}finally{m.lv=lv}};
// 离线击杀金币按掉落表期望值(items.js tcGoldExp)：同步乘上密度掉落系数，避免离线金币随密度虚涨
if(typeof tcGoldExp==='function'){const _tcg=tcGoldExp;tcGoldExp=function(m){return _tcg(m)*(m.boss?1:DENSITY.drop)}}
// 多首领：最后一个任务首领倒下时才完成任务
bossKilled=function(m){if(!m.qb)return;if(MON.some(x=>x!==m&&x.hp>0&&x.qb))return;const z=zoneData();if(z.quest&&!S.q[z.quest]&&!QUESTS[z.quest].clear)questDone(z.quest)};
// ---------- 怪物技能 ----------
const SKCD={charge:5,frost:9,nova:9,spark:4,randel:4,poisbreath:8,inferno:8,leech:5,manaburn:5,curse:9,stun:6,web:7,revive:6,heal:6,corpsefire:6};
function hurtHero(v,el,m,dodge){if(dodge&&!hitChance(m.ar,ST.def,m.lv,S.lvl)){floatHero('闪避','#aaa');return 0}
 if(el==='phys'){v=Math.max(1,v-ST.dr);const ab=Math.min(H.abs,v);H.abs-=ab;v-=ab}else v=el==='pois'&&window.CQMir2Equip?CQMir2Equip.magicGuard(v,el):Math.max(1,v*100/(100+((S.bon&&S.bon.mdef)||0)));v=Math.round(v);if(v>0){H.life-=v;floatHero('-'+v,{fire:'#f84',cold:'#8cf',light:'#ff6',pois:'#6f6'}[el]||'#f44')}return v}
function hurtAlly(a,v,el){v=Math.max(1,v-(el==='phys'?(a.def||0):(a.mdef||0)));v=Math.round(v);a.hp-=v;a.hitT=0.25;floatNum('a'+a.uid,v,'#f66');return v}
function aoe(m,v,el){hurtHero(v,el,m,0);for(const a of ALLY)if(a.hp>0)hurtAlly(a,v*0.8,el)}
function single(m,v,el,dodge){const al=ALLY.filter(a=>a.hp>0);const w=al.find(a=>a.kind==='wall');const tg=w||(al.length&&rnd()<0.6?pick(al):'hero');if(tg==='hero')return hurtHero(v,el,m,dodge);return hurtAlly(tg,v,el)}
function monSkill(m,s){let avg=(m.dmg[0]+m.dmg[1])/2;if(curseOf(m,'wk'))avg*=0.67;if(curseOf(m,'de'))avg*=0.5;const el=m.el&&m.el!=='phys'?m.el:null;
 switch(s){
 case'charge':single(m,avg*1.8,'phys',1);break;
 case'frost':aoe(m,avg*0.8,'cold');fx('nova',[]);break;
 case'nova':aoe(m,avg*0.8,el||'light');fx('nova',[]);break;
 case'spark':single(m,avg*1.2,'light',0);break;
 case'randel':single(m,avg*1.2,pick(ELK),0);break;
 case'poisbreath':aoe(m,avg*0.9,'pois');break;
 case'inferno':aoe(m,avg*0.9,'fire');break;
 case'leech':{const v=single(m,avg,'phys',1);m.hp=Math.min(m.max,m.hp+v);break}
 case'manaburn':{const v=Math.round(avg*1.5);H.mana=Math.max(0,H.mana-v);floatHero('噬法-'+v,'#58f');break}
 case'curse':single(m,avg,'magic',0);floatHero('魔法冲击','#c3f');break;
 case'stun':if(single(m,avg*1.2,'phys',1)>0&&!ST.cbr){H.castT+=0.8;floatHero('眩晕','#fc6')}break;
 case'web':H.castT+=0.5;floatHero('缠网','#ccc');break;
 case'revive':{const i=CORPSE.findIndex(c=>MONS[c.key]);if(i<0||liveMon().length>=8)return 0;const c=CORPSE.splice(i,1)[0];const n=mkMon(c.key,c.lv);n.exp*=0.5;n.n='复苏·'+n.n;MON.push(n);log(`${m.n} 复活了 ${n.n}`);break}
 case'heal':{const t=liveMon().filter(x=>x.hp<x.max).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(!t)return 0;t.hp=Math.min(t.max,t.hp+t.max*0.2);break}
 case'corpsefire':{if(!CORPSE.length)return 0;const c=CORPSE.pop();aoe(m,Math.min(c.max*0.25,avg*3),'fire');fx('boom',[]);break}
 default:return 0}return 1}
function monsTick(dt){const ms=liveMon();let chill=0;
 for(const m of ms){if(m.sk&&m.sk.includes('chill'))chill=1;if(!m.sk||!m.sk.length||m.stun>0||curseOf(m,'tr'))continue;
  m.skT-=dt*(curseOf(m,'de')?0.5:1);if(m.skT>0)continue;const s=pick(m.sk.filter(x=>x!=='chill'));if(!s){m.skT=99;continue}
  if((m.ranged||['spark','randel'].includes(s))&&curseOf(m,'dv')){m.skT=2;continue}
  if(curseOf(m,'cf')){m.skT=SKCD[s]||5;continue}
  monSkill(m,s);m.skT=(SKCD[s]||5)*(0.8+rnd()*0.4)/(m.spd||1)}
 if(chill){H.castT+=dt*0.33;for(const a of ALLY){a.t+=dt*0.33;if(a.mt!=null)a.mt+=dt*0.33}}
 if(H.curse&&H.curse<GT){H.curse=0;calc()}}

// ---------- 角色属性：任务永久奖励、随从光环、受咒 ----------
const _calc=calc;calc=function(){const o=_calc();const b=S.bon||{life:0,res:0};o.life+=b.life||0;
 cqMetaRewards();o.def+=b.def||0;o.mdef=(o.mdef||0)+(b.mdef||0);o.wmin+=b.attack||0;o.wmax+=b.attack||0;
 for(const k in o.res)o.res[k]=0;
 ST=o;return o};

// ---------- 任务 ----------
const _questDone=questDone;questDone=function(q){cqMetaRewards();if(S.q[q])return;const d=S.diff,Q=QUESTS[q],rk=d+'_'+q;S.cqQuestReward=S.cqQuestReward||{};if(S.cqQuestReward[rk])return;_questDone(q);S.cqQuestReward[rk]=1;
 switch(q){
 case'q2':break;
 case'a2q1':if(window.CQSys&&CQSys.bookGive)CQSys.bookGive(1);break;
 case'a3q1':S.bon.life+=20;calc();break;
 case'a3q2':{const it=genItem(S.lvl,{base:BASEM.rin,q:3});addBag(it);log('获得 '+itemName(it));break}
 case'a3q4':{const x=S.atb||(S.atb={}),k=(typeof clsBase==='function'&&clsBase().main||['str'])[0];x[k]=(x[k]|0)+3;x.vit=(x.vit|0)+2;calc();break}
 case'a4q1':if(window.CQSys&&CQSys.bookGive)CQSys.bookGive(2);break;
 case'a4q2':{const g=[1500,3000,6000][d];S.gold+=g;log('熔炉迸出 '+g+' 金币');break}// 原奖励宝石+符文（已删除）改金币
 case'a5q1':S.gold+=5000;toast('铁匠赠予金币 5000');break;
 case'a5q2':{const g=[2000,4000,8000][d];S.gold+=g;log('获得 '+g+' 金币');break}// 原奖励符文×3（已删除）改金币
 case'a5q3':S.bon.def=(S.bon.def||0)+10;S.bon.mdef=(S.bon.mdef||0)+10;calc();break;
 case'a5q4':S.pers++;toast('可个性化一件物品');break;
 case'a5q5':{const x=Math.round((xpNeed(S.lvl+1)-xpNeed(S.lvl))*0.6);gainXp(x);log('远古英灵的祝福：经验 +'+fmt(x));break}
 }
 if(Q&&Q.fin)unlockAfter(Q.act)};
function partGet(qid,p){const k=qid+'_'+p;if(S.q[k])return;S.q[k]=1;const Q=QUESTS[qid];log(`<b class="quest">获得任务道具【${Q.parts[p]}】</b>`);if(Object.keys(Q.parts).every(x=>S.q[qid+'_'+x])&&!S.q[qid])questDone(qid)}
const _zoneClear=zoneClear;zoneClear=function(){const z=zoneData(),zi=S.zone,a=S.act;
 if(z.quest&&QUESTS[z.quest].clear&&!S.q[z.quest])questDone(z.quest);if(z.part)partGet(z.part[0],z.part[1]);
 _zoneClear();

 const zs=ACTS[a].zones;
 // 挂机推进门槛：角色等级 ≥ 下一区域怪物等级 - GATE 才自动前进，否则原地历练
 if(S.auto&&S.zone!==zi&&S.lvl<zs[S.zone].ml-gateOf(a,S.diff)){log(`<span class="dim">${zs[S.zone].n} 推荐 ${zs[S.zone].ml-gateOf(a,S.diff)} 级，先在 ${zs[zi].n} 历练</span>`);S.zone=zi}
 if(S.auto&&zi===zs.length-1&&S.q[ACTS[a].fq]){const n=nextStage();if(n){const nz=ACTS[n[0]].zones[0];if(S.lvl>=mlD(nz.ml0,n[1])-gateOf(n[0],n[1],1))goAct(n[0],n[1],TAB!=='fight')}}};
// 首领"连战受创"：每次在其面前阵亡，该首领(本难度)伤害 ×0.8，最低 ×0.5 —— 保留死亡风险又不形成死墙
function bfKey(k){return S.diff+'_'+k}
const _die=die;die=function(){S.bf=S.bf||{};for(const m of MON)if(m.boss&&m.hp>0){const k=bfKey(m.key);S.bf[k]=(S.bf[k]||0)+1;log(`<span class="dim">${m.n} 在连战中受创（伤害 -${Math.round((1-Math.max(0.5,Math.pow(0.8,S.bf[k])))*100)}%）</span>`)}
const D=DIFFS[S.diff];if(false&&D.dxp){const cur=S.xp-xpNeed(S.lvl),loss=Math.min(cur,Math.floor((xpNeed(S.lvl+1)-xpNeed(S.lvl))*D.dxp));if(loss>0){S.xp-=loss;log(`<b style="color:#f44">${D.n}死亡惩罚：经验 -${fmt(loss)}</b>`)}}
 _die();H.curse=0;calc()};
questLine=function(){const z=zoneData();let q=z.quest&&!S.q[z.quest]?z.quest:Object.keys(QUESTS).find(k=>QUESTS[k].act===S.act&&!S.q[k]);
 if(!q){const n=nextStage();return`【主线】${DIFFS[S.diff].n}·${ACTS[S.act].n.split('·')[1]} 已完成${n?'，可前往 '+DIFFS[n[1]].n+'·'+ACTS[n[0]].n.split('·')[1]:''}`}
 const Q=QUESTS[q];let p='';if(Q.parts)p=` (${Object.keys(Q.parts).filter(x=>S.q[q+'_'+x]).length}/${Object.keys(Q.parts).length})`;else p=` (${S.q[q]?1:0}/1)`;return`【主线】${Q.n}：${Q.d}${p}`};

// ---------- 随从 ----------
const _monCard=monCard;monCard=function(m){let h=_monCard(m);if(m.imm&&m.imm.length)h=h.replace('<div class="pt">',`<em class="imm">${m.imm.map(x=>ELN[x]).join('')}免</em><div class="pt">`);return h};

// ---------- 防卡死：自动推进时，场上有怪却 STUCK 秒既无击杀、怪物血量也无进展（如治疗型首领群耗尽法力）判定为僵持，撤回上一主线区域历练（不算死亡） ----------
const STUCK=300;
function stuckTick(dt){const ms=liveMon();const hp=ms.reduce((a,m)=>a+m.hp/m.max,0);
 // 有击杀，或怪物总血量比本轮最低点再低 0.5%（仍在推进）则重置计时
 if(!ms.length||S.kills!==ACX.k0||hp<(ACX.mh??1e9)-0.005){ACX.k0=S.kills;ACX.st=0;ACX.mh=hp;return}ACX.st=(ACX.st||0)+dt;
 if(ACX.st>STUCK&&S.auto){ACX.st=0;ACX.stuckN=(ACX.stuckN||0)+1;{const k=ACTS[S.act].zones[S.zone].n;(ACX.stz=ACX.stz||{})[k]=(ACX.stz[k]||0)+1}log('<b style="color:#f84">久战不下，暂且撤退历练</b>');let z=Math.max(0,S.zone-1);while(z>0&&ACTS[S.act].zones[z].side)z--;goZone(z)}}
// ---------- 主循环附加 ----------
const _step=step;step=function(dt){_step(dt);if(!ST)return;stuckTick(dt);monsTick(dt);ACX.eqT=(ACX.eqT||0)+dt;if(ACX.eqT>3){ACX.eqT=0;}};

// ---------- 物品：加凹槽 / 个性化 （任务奖励） ----------
function personalize(uid){const f=findItem(uid);if(!f||S.pers<=0)return;const it=f.it;if(it.k||it.pn||it.rw!=null)return;it.name='勇士的'+it.name;it.pn=1;S.pers--;log('个性化完成：'+it.name);showItem(uid);render()}
const _showItem=showItem;showItem=function(uid){_showItem(uid);const f=findItem(uid);if(!f||f.it.k)return;const it=f.it,b=BASEM[it.b];const box=document.querySelector('#modal .ipanel .btns.c');if(!box)return;let h='';
 if(S.pers>0&&!it.pn&&it.rw==null)h+=`<button class="btn gold" onclick="personalize(${uid})">个性化×${S.pers}</button>`;
 if(h)box.insertAdjacentHTML('afterbegin',h)};

// ---------- UI：战斗页、角色页随从、地图页 ----------
const _renderFight=renderFight;renderFight=function(){_renderFight();{const fb=$('#fbattle'),bk='bg_act'+(S.act+1);if(fb&&IMG[bk]){fb.style.backgroundImage=`linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.25) 35%,rgba(0,0,0,.7)),url(${IMG[bk]})`}}const e=document.querySelector('#ftop .zn');if(e&&S.diff&&!e.querySelector('.diff'))e.innerHTML=`<b class="diff d${S.diff}">${DIFFS[S.diff].n}</b> `+e.innerHTML};
function mapGo(a,d,i){if(a!==S.act||d!==S.diff)goAct(a,d,1);goZone(i);TAB='fight';render()}
