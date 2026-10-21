'use strict';
// ===================================================================================
// cls_hero.js — 英雄职业侧（docs/merc_to_hero_plan.md P2/P3）：战士/法师/道士英雄的属性成长、技能表、技能书学习、施法 AI、道士英雄召唤。
// 存档（系统开发的 S.hero，见 cq/sysapi_cq.js）：本文件只新增 S.hero.sk={id:{lv,exp}}（英雄技能等级/熟练度，与主角 S.sk/S.skx 分开）；
//   开关只读 S.hero.skOff={id:1}（方案「补充需求」字段，系统开发存；关闭的技能英雄不释放）。英雄等级 = S.hero.lvl（缺省同主角等级）。
// 规则复用 classes.js（cls-book）：9 级、需求等级 r+3(L-1)、书 1,2,3,5,10,20,30,40,45 本（与主角共用材料 book_<cls>_<id>）、熟练度表，升级后熟练度清零。
// 英雄只放本职业主动技能（原版 heroSkills：主动 + 有伤害/效果；被动、诱惑之光、魔法盾、隐身术不给英雄）。
// 施法：heroSkPick() 选技能（AI），heroCast(id,base,host) 执行：伤害交给 host.hit（战斗开发 cq_hero 的 host，带 20% 预算封顶），治疗/召唤在这里直接做。
// ===================================================================================
const HERO_SK={zs:['gsjs','csjs','bywd','ymcz','lhjf'],fs:['hqs','kjhh','dyh','ldsh','bpx'],ds:['zys','lhhf','sds','zhkl','zhss']};
const HERO_SK0={zs:'gsjs',fs:'hqs',ds:'lhhf'};// 创建英雄时的初始技能（1 级）
// 英雄技能伤害：一次施放「总伤」= base × m × 等级成长，群体技能把总伤平分给 n 个目标（n=0 全体）——群体不再按目标数放大，给合击留预算。
// base 由 cq_hero 传入 = 普攻/skNorm(1.25)，所以 m=1.25 ≈ 一次普攻。等级成长 ×(1+0.03×(旧级-1))，9 级 ×1.57。cd 秒。
const HERO_FX={hit:{m:1.3,n:1,cd:2},bolt:{m:1.3,n:1,cd:2},mhit:{m:1.3,n:2,cd:2.5},cone:{m:1.25,n:3,cd:3},mall:{m:1.15,n:5,cd:3},aoe:{m:1.1,n:0,cd:4},pois:{m:1.0,n:0,cd:6,dot:5},heal:{cd:4},pet:{cd:3}};
// 预算：英雄普攻+技能+合击共享 CQ_BAL.budget.hero=20%（cq/sysapi_cq.js heroCap，30 秒窗口）。英雄占比 ≥ HERO_SHARE_MAX 时不放技能（改普攻），给合击留 ≥8%
const HERO_SHARE_MAX=0.12;
const heroH=()=>(typeof S!=='undefined'&&S&&S.hero&&typeof S.hero==='object')?S.hero:null;
const heroCls=()=>{const h=heroH();return h&&CLS_DEF[h.cls]?h.cls:null};
const heroLv=()=>{const h=heroH();return Math.max(1,(h&&h.lvl)|0||((typeof S!=='undefined'&&S&&S.lvl)|0)||1)};
// 属性：同主角成长表（CLS_DEF.grow），不加点；生命系数 0.8（原版英雄 hero.js:24），由系统 heroStats 使用
const HERO_LIFEK=0.8;
function heroAutoAt(cls,L){return clsAutoAt(cls||heroCls()||'zs',L||heroLv())}
function heroSkList(cls){cls=cls||heroCls();return(HERO_SK[cls]||[]).filter(id=>SKM[id])}
function heroSkOn(id){const h=heroH();return!(h&&h.skOff&&h.skOff[id])}
function heroSkInit(){const h=heroH(),c=heroCls();if(!h||!c)return null;if(!h.sk||typeof h.sk!=='object'){h.sk={};const k=HERO_SK0[c];if(k)h.sk[k]={lv:1,exp:0}}
 for(const id of Object.keys(h.sk)){const v=h.sk[id];if(!SKM[id]||SKM[id].cls!==c||!(HERO_SK[c]||[]).includes(id)){delete h.sk[id];continue}if(typeof v==='number')h.sk[id]={lv:v,exp:0};h.sk[id].lv=Math.min(CLS_SKMAX,h.sk[id].lv|0)}return h.sk}
function heroSkLv(id){const sk=heroSkInit();return sk&&sk[id]?sk[id].lv|0:0}
function heroSkExp(id){const sk=heroSkInit();return sk&&sk[id]?sk[id].exp|0:0}
function heroSkReq(id,L){const s=SKM[id];if(!s||L<1||L>CLS_SKMAX)return null;const q=clsSkReq(id,L);return q}
function heroSkillExp(id,n){const sk=heroSkInit();if(!sk||!sk[id]||sk[id].lv>=CLS_SKMAX)return 0;const q=heroSkReq(id,sk[id].lv+1);sk[id].exp=Math.min(q.exp,(sk[id].exp|0)+(n==null?1:n));return sk[id].exp}
function heroCanLearn(id,opt){const c=heroCls();if(!c)return{err:'没有英雄'};const s=SKM[id];if(!s||!s.cls)return{err:'未知技能'};if(s.cls!==c)return{err:'职业不符'};
 if(!heroSkList(c).includes(id))return{err:'英雄不能学习此技能'};const cur=heroSkLv(id);if(cur>=CLS_SKMAX)return{err:'技能已满级'};const q=heroSkReq(id,cur+1);
 if(heroLv()<q.lvl)return{err:`英雄需要等级 ${q.lvl}`};if(cur>0&&heroSkExp(id)<q.exp)return{err:`技能熟练度不足 (${heroSkExp(id)}/${q.exp})`};
 const have=opt&&opt.have!=null?opt.have:clsBookCount(id);if(have<q.books)return{err:`需要技能书 x${q.books}`};return{ok:1,from:cur,to:cur+1,books:q.books}}
function heroLearn(id,opt){const c=heroCanLearn(id,opt);if(!c.ok)return c;if(!(opt&&opt.noTake)){const k='book_'+clsBookId(id);if(typeof CQSys!=='undefined'&&CQSys.takeMat)CQSys.takeMat(k,c.books);else if(S.mats)S.mats[k]=(S.mats[k]|0)-c.books}
 heroSkInit()[id]={lv:c.to,exp:0};try{if(typeof CQSys!=='undefined'&&CQSys.emit)CQSys.emit('heroSkLearn',{id,from:c.from,to:c.to})}catch(e){}return c}
function heroSkInfo(id){const s=SKM[id];if(!s)return null;const L=heroSkLv(id),q=L<CLS_SKMAX?heroSkReq(id,L+1):null,B=CLS_BOOK[id]||{},F=HERO_FX[s.ty]||{};
 return{id,n:s.n,ty:s.ty,lv:L,max:CLS_SKMAX,exp:heroSkExp(id),need:q?q.exp:0,reqLvl:q?q.lvl:0,books:q?q.books:0,have:clsBookCount(id),bookId:clsBookId(id),bookName:B.on||s.n,
  on:heroSkOn(id),mul:F.m?heroMul(id,L||1):0,n_tgt:F.n,cd:F.cd||0,can:heroCanLearn(id)}}
function heroSkills(){return heroSkList().map(heroSkInfo)}
const heroMul=(id,L)=>{const F=HERO_FX[SKM[id].ty]||{};return F.m?+(F.m*(1+0.03*(clsOldL(L)-1))).toFixed(3):0};// 总伤倍率；新 9 级 ≈ 旧 20 级 → ×1.57
// ---------- 施法 AI ----------
const HERO_CD={};// 运行时冷却（游戏时间 GT 秒），不存档
const heroNow=()=>typeof GT!=='undefined'?GT:Date.now()/1000;
const heroPets=()=>ALLY.filter(a=>a.kind==='cqpet'&&a.owner==='hero'&&a.hp>0);
// ctx 可选：{targets:[怪], heroHpPct, playerHpPct}；返回技能 id 或 null
function heroSkPick(ctx){const c=heroCls();if(!c)return null;ctx=ctx||{};const now=heroNow();const ms=ctx.targets||(typeof liveMon==='function'?liveMon():[]);
 const pp=ctx.playerHpPct!=null?ctx.playerHpPct:(typeof H!=='undefined'&&ST&&ST.life?H.life/ST.life:1),hp=ctx.heroHpPct!=null?ctx.heroHpPct:1;
 const ok=id=>heroSkLv(id)>0&&heroSkOn(id)&&!((HERO_CD[id]||0)>now);
 if(c==='ds'){if(ok('zys')&&Math.min(pp,hp)<0.6)return'zys';const pet=['zhss','zhkl'].find(ok);if(pet&&!heroPets().length)return pet}
 if(!ms.length)return null;try{if(typeof CQSys!=='undefined'&&CQSys.heroShare){const st=CQSys.heroShare();if(st.player>0&&st.share>=HERO_SHARE_MAX)return null}}catch(e){}let best=null,bv=0;
 for(const id of heroSkList(c)){const s=SKM[id];if(!ok(id)||s.ty==='heal'||s.ty==='pet')continue;const F=HERO_FX[s.ty];if(!F||!F.m)continue;
  const v=heroMul(id,heroSkLv(id))*(F.n===1?1:1+0.02*Math.min(ms.length,5));if(v>bv){bv=v;best=id}}
 return best}
// 执行：base = 英雄本次普攻伤害（cq_hero 算好、已受预算约束的口径）；host = cq_hero 的 host（host.hit(t,d,src)、host.targets()），缺省用 hitMon
function heroCast(id,base,host){const s=SKM[id];if(!s||!heroSkLv(id)||!heroSkOn(id))return null;const L=heroSkLv(id),F=HERO_FX[s.ty]||{},out={id,n:s.n,lv:L,hits:[],total:0};
 HERO_CD[id]=heroNow()+(s.cd||F.cd||2);heroSkillExp(id,1);
 if(s.ty==='heal'){const v=clsSV(id,L);const h=v.heal||0;if(typeof H!=='undefined'&&ST)H.life=Math.min(ST.life,H.life+h);out.heal=h;if(host&&host.healHero)try{host.healHero(h)}catch(e){}}
 else if(s.ty==='pet'){const v=clsSV(id,L);for(const a of ALLY)if(a.kind==='cqpet'&&a.owner==='hero')a.hp=0;ALLY=ALLY.filter(a=>a.hp>0);if(typeof clsPetSweep==='function')clsPetSweep();
  for(let i=0;i<(v.max||1);i++){const a=addAlly('cqpet',{sub:id,n:'英雄·'+(v.pn||s.n),ic:s.ic,hp:v.hp,dmg:v.pd,el:v.el||'phys',th:v.th||0,owner:'hero'});out.pet=a.uid}}
 else{const ts=host&&host.targets?host.targets():(typeof liveMon==='function'?liveMon():[]);const L2=F.n===0?ts:ts.slice(0,F.n||1);const d=Math.max(1,Math.round((base||1)*heroMul(id,L)/Math.max(1,L2.length)));
  for(const t of L2){if(host&&host.hit)host.hit(t,d,'cqhero');else if(typeof hitMon==='function')hitMon(t,{[s.el||'phys']:d},'cqhero');out.hits.push({t,d});out.total+=d}
  if(F.dot)out.dot={sec:F.dot,per:d}}
 try{if(typeof CQSys!=='undefined'&&CQSys.emit)CQSys.emit('heroCast',{id,lv:L,total:out.total})}catch(e){}return out}
// ---------- 主角召唤不影响英雄召唤物（owner='hero'） ----------
{const f=CLS_TY.pet;CLS_TY.pet=function(s,v){const keep=ALLY.filter(a=>a.kind==='cqpet'&&a.owner==='hero');ALLY=ALLY.filter(a=>!(a.kind==='cqpet'&&a.owner==='hero'));try{return f.apply(this,arguments)}finally{ALLY.push(...keep.filter(a=>a.hp>0))}}}
