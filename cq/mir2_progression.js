'use strict';
// 等级显示 1–60；50 后把旧 50–99 的固定成长压缩到 10 级。
const CQ_OLD_XPT=[0,0,500,1500,3750,7875,14175,22680,32886,44396,57715,72144,90180,112725,140906,176132,220165,275207,344008,430010,537513,671891,839864,1049830,1312287,1640359,2050449,2563061,3203826,3902260,4663553];
function cqOldXp(l){if(l<CQ_OLD_XPT.length)return CQ_OLD_XPT[l];const b=CQ_OLD_XPT[30];return Math.floor(b*1.1476**(Math.min(l,70)-30)*(l>70?1.0444**(l-70):1))}
function cqGrowthLevel(l){return l<=50?l:Math.min(99,50+Math.floor((l-50)*4.9))}
function cqDisplayLevel(l){return l<=50?l:Math.min(60,50+Math.ceil((l-50)/4.9))}
CQ_BAL.progress={xpK:1,accuracy:3,defense:40,player:{zs:1.4,fs:5,ds:4.2},life:{zs:1.4,fs:3.3,ds:4},farm:{fs:{start:50,span:5,bonus:1.5},ds:{start:55,span:4,bonus:1.2}},rebReward:{zs:{str:1,vit:1},fs:{ene:1,vit:1},ds:{ene:1,vit:1}}};
function cqRebNeed(n){return Math.round(MIR2_XP_EXTRAPOLATED[9]*(1+n*0.25))}
function cqProgressMigrate(){
 if(!S||(S.cqProgress===1&&S.lvl<=60))return;
 const old=Math.max(1,Math.min(99,S.lvl||1)),lv=cqDisplayLevel(old),a=cqOldXp(old),b=cqOldXp(old+1),fraction=Math.max(0,Math.min(0.999999,((+S.xp||0)-a)/Math.max(1,b-a)));
 S.cqLevelLegacy={lvl:old,xp:+S.xp||0};S.lvl=lv;S.xp=xpNeed(lv)+(lv<60?Math.floor(fraction*(xpNeed(lv+1)-xpNeed(lv))):0);
 // 包括已保存的固定加成；新成长至少等于旧成长。额外记录旧等级供等级相关派生属性使用。
 S.cqLegacyLevel=old;S.atb=S.atb||{};
 const before=cqRawAutoAt(curCls(),old),after=cqRawAutoAt(curCls(),cqGrowthLevel(lv));
 for(const k of AG_K)S.atb[k]=(S.atb[k]||0)+Math.max(0,before[k]-after[k]);
 S.reb=Math.max(0,Math.min(10,S.reb|0));S.rebXp=Math.max(0,+S.rebXp||0);S.rebApplied=S.reb; // 旧档已有转生奖励不重复发
 if(S.hero){const h=S.hero,hl=Math.min(old,h.lvl||1),ha=cqOldXp(hl),hb=cqOldXp(hl+1),hf=Math.max(0,Math.min(.999999,((+h.xp||0)-ha)/Math.max(1,hb-ha)));h.lvl=Math.min(lv,cqDisplayLevel(hl));h.xp=xpNeed(h.lvl)+(h.lvl<60?Math.floor(hf*(xpNeed(h.lvl+1)-xpNeed(h.lvl))):0);}
 S.cqProgress=1;
}
// 同一显示等级的所有职业按旧成长区间计算，不改怪物/首领基表。
let cqCalculatingGrowth=false;
const cqRawAutoAt=agAutoAt;
combatAccuracy=n=>n*CQ_BAL.progress.accuracy;
combatLevel=()=>cqCalculatingGrowth?S.lvl:Math.max(cqGrowthLevel(S.lvl),S.cqLegacyLevel||1);
agAutoAt=function(c,l){return cqRawAutoAt(c,cqCalculatingGrowth?l:cqGrowthLevel(l))};
// calc 中等级直接派生的生命/法力/准确等也使用压缩前成长等级；保存/显示始终为 1–60。
{const f=calc;calc=function(){if(!S)return f.apply(this,arguments);const lv=S.lvl;try{cqCalculatingGrowth=true;S.lvl=Math.max(cqGrowthLevel(lv),S.cqLegacyLevel||1);const result=f.apply(this,arguments);ST.life=Math.round(ST.life*CQ_BAL.progress.life[curCls()]);ST.ar*=CQ_BAL.progress.accuracy;ST.def*=CQ_BAL.progress.defense;if(curCls()==='fs')ST.mregen=(ST.mregen||0)+100;return result}finally{cqCalculatingGrowth=false;S.lvl=lv;cqAtFix()}}}
// 门槛按显示等级压缩，怪物 ml/refLv、HP、攻击、防御保持原值。
function cqGateLevel(raw){return cqDisplayLevel(Math.max(1,raw))}
{const f=gateOf;gateOf=function(a,d,entry){const old=f(a,d,entry)||0,z=ACTS[a].zones,raw=entry?mlD(z[0].ml0,d):Math.max(...z.map(x=>mlD(x.ml0,d)));return old+Math.max(0,raw-old-cqGateLevel(raw-old))}}
// 仅怪物经验适配累计曲线；任务按传奇表本级百分比发放的经验无需再次转换。
function cqXpRate(){const l=Math.min(60,S.lvl),a=cqGrowthLevel(l),b=cqGrowthLevel(Math.min(60,l+1));return CQ_BAL.progress.xpK*(xpNeed(l+1)-xpNeed(l))/Math.max(1,cqOldXp(l===60?100:b)-cqOldXp(a))}
{const f=mkMon;mkMon=function(){const m=f.apply(this,arguments);m.exp=Math.max(1,m.exp*cqXpRate());return m}}
// 后段法道清怪效率补偿；仅普通怪，首领与英雄仍使用原基准。
function cqFarmScale(m){const p=CQ_BAL.progress.farm[curCls()];return !p||!m||m.boss||m.actboss?1:1+p.bonus*Math.max(0,Math.min(1,(S.lvl-p.start)/p.span))}
// 职业基准补强：补偿技能等级词缀移除及传奇装备量级；英雄仍走独立预算，DOT 同样适配。
{const f=hitMon;hitMon=function(m,d,src){const hero=src==='cqhero'||src==='cqheji'||(src&&src.owner==='hero');const k=hero?1:(CQ_BAL.progress.player[curCls()]||1)*cqFarmScale(m);if(k>1&&d&&typeof d==='object'){const v={};for(const key in d)v[key]=d[key]*k;return f.call(this,m,v,src,arguments[3])}return f.apply(this,arguments)}}
{const f=gainXp;gainXp=function(x){x=Math.max(0,+x||0);if(S.lvl>=60)S.xp=xpNeed(60);const r=f.call(this,x);if(S.lvl>=60){if((S.reb||0)<10)S.rebXp=(S.rebXp||0)+Math.max(0,S.xp-xpNeed(60));S.xp=xpNeed(60)}return r}}
CQSys.progression=()=>({lvl:S.lvl,cap:60,reb:S.reb||0,max:10,xp:S.rebXp||0,need:cqRebNeed(S.reb||0),reward:Object.assign({},CQ_BAL.progress.rebReward[curCls()])});
CQSys.rebirth=()=>{const p=CQSys.progression();if(p.lvl<60)return{err:'60级解锁转生'};if(p.reb>=10)return{err:'转生已满'};if(p.xp<p.need)return{err:'转生经验不足'};S.rebXp-=p.need;S.reb=p.reb+1;S.atb=S.atb||{};for(const k in p.reward)S.atb[k]=(S.atb[k]||0)+p.reward[k];S.rebApplied=S.reb;calc();save();CQSys.emit('rebirth',CQSys.progression());if(!window.__NOUI)render();return{ok:1,reb:S.reb}};
CQSys.rebirthUI=()=>{const p=CQSys.progression(),reward=curCls()==='zs'?'力量 +1、体力 +1':'精力 +1、体力 +1';modal(`<div class="ipanel cqpg" style="margin:16px;padding:18px"><h3 class="mtitle">转生 ${p.reb} / 10</h3><p>等级60后经验进入转生条，装备保留。</p><p>每次固定获得：${reward}</p><p>${p.reb>=10?'转生已满':`经验 ${fmt(p.xp)} / ${fmt(p.need)}`}</p><div class="btns c"><button class="btn gold" style="min-height:44px;min-width:88px;white-space:nowrap" ${p.lvl<60||p.reb>=10||p.xp<p.need?'disabled':''} onclick="CQSys.rebirth();CQSys.rebirthUI()">转生</button><button class="btn" style="min-height:44px;min-width:88px;white-space:nowrap" onclick="closeM()">关闭</button></div></div>`)};
// 角色页提供可触达的转生入口，封顶前也能查看固定奖励。
{const f=renderHero;renderHero=function(){const r=f.apply(this,arguments);if(!window.__NOUI){const p=document.getElementById('panel');if(p&&S.lvl>=60){const info=p.querySelector('.sub');if(info)info.textContent=`等级已满 · 转生经验 ${fmt(S.rebXp||0)} / ${fmt(cqRebNeed(S.reb||0))}`}if(p&&!p.querySelector('.cqprogress'))p.insertAdjacentHTML('afterbegin',`<div class="gp cqprogress"><div class="row"><b>等级 ${S.lvl} / 60 · ${S.reb||0} 转</b><button class="btn" style="min-height:44px;min-width:88px;white-space:nowrap" onclick="CQSys.rebirthUI()">转生</button></div></div>`)}return r}}
// 英雄的等级成长与主角使用同一映射，界面仍显示 1–60。
{const f=CQSys.heroStats;CQSys.heroStats=function(){const r=f.apply(this,arguments),h=CQSys.hero(),lv=r.lvl,g=cqGrowthLevel(lv),b=CQ_BAL.hero.cls[h.cls||'zs'];if(g>lv){r.atkMin+=Math.round(g*b.atk*.6)-Math.round(lv*b.atk*.6);r.atkMax+=Math.round(g*b.atk)-Math.round(lv*b.atk);r.def+=Math.round(g*b.def)-Math.round(lv*b.def);r.mdef+=Math.round(g*b.def*.5)-Math.round(lv*b.def*.5);r.hp+=Math.round(g*b.hp)-Math.round(lv*b.hp)}return r}}
// 已迁移的旧装备需求随旧等级同步压缩；新传奇装备保留原需求等级。
{const f=itemReq;itemReq=function(it){const r=f.apply(this,arguments);if(it&&it.cqMigrated)r.lv=cqDisplayLevel(it.req||r.lv);return r}}
// 固定转生替代旧魂阶：保留旧档已生效属性，停止产生/分配自由点。
egParaShare=()=>0;egParaGain=()=>0;egPfree=()=>0;egParaAdd=()=>0;egParaAuto=()=>0;egParaReset=()=>0;
egParaLock=()=>S.lvl>=60?null:'60级解锁转生';
egParaPage=()=>{const p=CQSys.progression();return `<div class="gp"><h3>转生 ${p.reb} / 10</h3><p>60级后经验进入转生条，每次获得固定职业属性，装备保留。</p><p>${p.reb>=10?'转生已满':`经验 ${fmt(p.xp)} / ${fmt(p.need)}`}</p><button class="btn" style="min-height:44px;min-width:88px;white-space:nowrap" onclick="CQSys.rebirthUI()">查看转生</button></div>`};
{const p=EG_PAGES.find(x=>x.k==='para');if(p)Object.assign(p,{n:'转生',lock:egParaLock,render:egParaPage,dot:()=>S.lvl>=60&&(S.reb||0)<10&&(S.rebXp||0)>=cqRebNeed(S.reb||0)})}
