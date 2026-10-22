'use strict';
// 第六块：固定部位淬炼、三合一融合、红龙圣地。只保存普通 JSON。
(function(){
const B=window.CQB6={tiers:['蛟龙','蟠龙','应龙'],names:{weapon:'武器',armor:'衣服',helm:'头盔',belt:'腰带',boots:'鞋子'}};
const slots=Object.keys(B.names);
B.init=()=>{if(!S.slotRefine||typeof S.slotRefine!=='object')S.slotRefine={};for(const k of slots){let r=S.slotRefine[k];if(!r||typeof r!=='object')r=S.slotRefine[k]={tier:0,star:0};r.tier=Math.max(0,Math.min(2,r.tier|0));r.star=Math.max(0,Math.min(10,r.star|0))}S.refineMat=Math.max(0,+S.refineMat||0);return S.slotRefine};
B.level=k=>{B.init();const r=S.slotRefine[k];return r?r.tier*10+r.star:0};
B.cost=k=>({gold:1000*(1+B.level(k)),mat:1+Math.floor(B.level(k)/10)});
B.refine=k=>{if(!slots.includes(k))return{err:'部位无效'};const n=B.level(k),c=B.cost(k);if(n>=30)return{err:'已满星'};if(S.gold<c.gold||S.refineMat<c.mat)return{err:'金币或淬炼精华不足'};S.gold-=c.gold;S.refineMat-=c.mat;const next=n+1;S.slotRefine[k]={tier:Math.min(2,Math.floor((next-1)/10)),star:(next-1)%10+1};calc();save();return{ok:1}};
// 每星固定 +1；武器按当前职业主属性，衣服/头盔加防御，腰带/鞋子加魔御。
B.bonus=()=>{B.init();return{primary:B.level('weapon'),def:B.level('armor')+B.level('helm'),mdef:B.level('belt')+B.level('boots')}};
{const f=calc;calc=function(){const r=f.apply(this,arguments);if(!S)return r;const b=B.bonus();ST.def+=b.def;if(curCls()==='zs'){ST.wmin+=b.primary;ST.wmax+=b.primary}return r}}
let heroContext=0;
{const f=heroCast;heroCast=function(){heroContext++;try{return f.apply(this,arguments)}finally{heroContext--}}}
{const f=clsSV;clsSV=function(id,l){const v=f.apply(this,arguments),key=Array.isArray(v.dmg)?'dmg':Array.isArray(v.pd)?'pd':null;if(key&&SKM[id]?.cls===curCls()&&curCls()!=='zs'&&!heroContext){const b=B.bonus().primary*(curCls()==='fs'?3:1),damage=v[key].map(x=>x+b);return Object.assign({},v,{[key]:damage,txt:typeof v.txt==='string'?v.txt.replace(v[key].join('-'),damage.join('-')):v.txt})}return v}}
{const f=hurtHero;hurtHero=function(v,el){if(v>0&&['fire','cold','light','magic'].includes(el))arguments[0]=Math.max(1,v-B.bonus().mdef);return f.apply(this,arguments)}}
// 同名、同底材、同品质；绑定/锁定、套装/暗金、上古装备不作为融合原料。
B.eligible=it=>!!(it&&!it.k&&!it.lk&&!it.anc&&!it.set&&it.rw==null&&BASEM[it.b]&&[1,2,3,4].includes(it.q));
B.group=uid=>{const it=S.bag.find(x=>x.uid===uid);return B.eligible(it)?S.bag.filter(x=>B.eligible(x)&&x.b===it.b&&x.name===it.name&&x.q===it.q):[]};
B.fuse=uid=>{const g=B.group(uid);if(g.length<3)return{err:'需背包中三件同名同品质装备'};const keep=g.find(x=>x.uid===uid),others=g.filter(x=>x!==keep).slice(0,2),cost=2000*keep.q;if(S.gold<cost||matCount('ess')<3)return{err:'金币或残骸精华不足'};
 S.gold-=cost;takeMat('ess',3);rfBlessClear(keep);keep.q=keep.q<=2?3:keep.q===3?4:5;keep.en=Math.max(...[keep,...others].map(x=>x.en||0));delete keep.rf;
 // 保留主体原词条及淬锋结果；固定攻击上限 +1，形成可感知的品质提升。
 keep.m.maxdmg=(keep.m.maxdmg||0)+1;keep.cqBonus=keep.cqBonus||{};keep.cqBonus.maxdmg=(keep.cqBonus.maxdmg||0)+1;
 S.bag=S.bag.filter(x=>!others.includes(x));calc();save();return{ok:1,uid:keep.uid}};
{const f=killMon;killMon=function(m){const r=f.apply(this,arguments);if(m&&(m.boss||m.actboss)&&!m.b6Rewarded){m.b6Rewarded=1;B.init();S.refineMat+=1;save()}return r}}
B.day=()=>new Date(Date.now()+8*3600000).toISOString().slice(0,10);
B.dungeon=()=>{B.init();return S.redDragon||(S.redDragon={day:'',used:0,state:'idle',stage:0,left:180})};
B.enter=()=>{const d=B.dungeon();if(d.state==='battle')return{err:'挑战进行中'};if(S.lvl<22)return{err:'22级解锁'};if(d.day!==B.day()){d.day=B.day();d.used=0}if(d.used>=1)return{err:'今日次数已用完'};d.used++;S.auto=1;Object.assign(d,{state:'battle',stage:1,left:180,hp:ST.life,maxHp:ST.life,enemy:1200,maxEnemy:1200,clock:0});save();return{ok:1}};
B.finish=state=>{const d=B.dungeon();if(d.state!=='battle')return;d.state=state;if(state==='clear')S.refineMat+=20;save()};
B.tick=dt=>{const d=B.dungeon();if(d.state!=='battle'||!Number.isFinite(dt)||dt<=0)return;let t=Math.min(dt,900);while(t>0&&d.state==='battle'){const v=Math.min(t,1,d.left);t-=v;d.left-=v;const range=CQMir2Equip.equipRanges(S.eq),b=B.bonus(),cls=curCls();const p=cls==='fs'?range.mag:cls==='ds'?range.tao:[ST.wmin,ST.wmax];const attack=Math.max(1,(p[0]+p[1])/2+(cls==='zs'?0:b.primary)+S.lvl*2);d.enemy-=attack*v;d.hp-=Math.max(1,8+d.stage*4-(ST.def+b.mdef)/80)*v;
 if(d.hp<=0){B.finish('dead');break}if(d.enemy<=0){if(d.stage===5){B.finish('clear');break}d.stage++;d.left=180;d.maxEnemy=1200*d.stage;d.enemy=d.maxEnemy;save()}else if(d.left<=0){B.finish('timeout');break}}
};
{const f=autoTick;autoTick=function(){if(B.dungeon().state==='battle')return;return f.apply(this,arguments)}}
{const f=step;step=function(dt){if(B.dungeon().state==='battle'){if(S.auto!==0)B.tick(dt);return}return f.apply(this,arguments)}}
B.result=r=>{if(r.err)toast(r.err);return r};
B.refineUI=()=>{B.init();modal(`<div class="b6panel"><h3>装备位淬炼</h3><p>换装保留 · 三阶十星 · 每星固定 +1 · 必定成功</p><p>淬炼精华 ${S.refineMat} · 通关红龙圣地获得</p>${slots.map(k=>{const r=S.slotRefine[k],c=B.cost(k);return `<div class="b6row"><span>${B.names[k]} · ${B.tiers[r.tier]} ${r.star}星<br><small>${k==='weapon'?'本职业攻击/魔法/道术':k==='armor'||k==='helm'?'防御':'魔御'} +${B.level(k)}</small></span><button class="btn" ${B.level(k)>=30?'disabled':''} onclick="CQB6.result(CQB6.refine('${k}'));CQB6.refineUI()">${c.gold}金 / ${c.mat}精华</button></div>`}).join('')}<button class="btn" onclick="closeM()">关闭</button></div>`)};
B.fuseUI=()=>{const list=S.bag.filter(B.eligible).filter((it,i,a)=>a.findIndex(x=>x.b===it.b&&x.name===it.name&&x.q===it.q)===i);modal(`<div class="b6panel"><h3>三合一融合</h3><p>三件同名同品质 → 更高品质。保留选中主体词条、淬锋结果与三件最高强化；祝福及次数清空。每次另需3残骸精华。</p>${list.map(it=>`<div class="b6row"><span>${itemName(it)}<br><small>品质 ${it.q} · ${B.group(it.uid).length}/3 · ${it.q*2000}金币</small></span><button class="btn" ${B.group(it.uid).length<3?'disabled':''} onclick="CQB6.result(CQB6.fuse(${it.uid}));CQB6.fuseUI()">融合</button></div>`).join('')||'<p>背包暂无可融合装备</p>'}<button class="btn" onclick="closeM()">关闭</button></div>`)};
B.dungeonUI=()=>{const d=B.dungeon(),active=d.state==='battle';modal(`<div class="b6panel" data-b6="dungeon"><h3>红龙圣地</h3><p>22级解锁 · 每日一次（北京时间）· 五阶段每段180秒</p><p>单机自动战斗；死亡不掉装备。通关获得20淬炼精华。关闭窗口仍继续，离线暂停。</p><div id="b6status">${B.status()}</div>${active?'<button class="btn" onclick="CQB6.finish(\'retreat\');CQB6.dungeonUI()">退出挑战</button>':`<button class="btn gold" onclick="CQB6.result(CQB6.enter());CQB6.dungeonUI()">开始挑战</button>`}<button class="btn" onclick="closeM()">关闭</button></div>`)};
B.status=()=>{const d=B.dungeon(),names={idle:'尚未挑战',battle:'战斗中',clear:'通关 · 已获20淬炼精华',dead:'挑战失败 · 未损失装备',timeout:'阶段超时',retreat:'已退出'};return `<p>${names[d.state]||'尚未挑战'} · 今日 ${d.day===B.day()?d.used:0}/1</p>${d.stage?`<p>第 ${d.stage}/5 阶段 · 剩余 ${Math.ceil(d.left)} 秒</p><p>生命 ${Math.max(0,Math.ceil(d.hp))}/${d.maxHp}</p><p>红龙守卫 ${Math.max(0,Math.ceil(d.enemy))}/${d.maxEnemy}</p>`:''}`};
if(!window.__NOUI)setInterval(()=>{const p=document.getElementById('b6status');if(p)p.innerHTML=B.status();if(B.dungeon().state==='battle')save()},1000);
})();
