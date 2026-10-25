// R03: canonical item stats come from mir2_equipment; all set bonuses are original.
(function(){
'use strict';
if(window.CQMir2Sets||!window.CQMir2Equip)return;
const classes=['zs','fs','ds'], ids=[], descriptions={};
function define(id,name,cls,bonus,effect){
 const previous=SETS[id]||{};SETS[id]=Object.assign({},previous,{n:name,ccls:cls,cqTier:previous.cqTier||(id.startsWith('zuma_')?'zuma':'chiyue'),cqOriginal:true,bonus});
 ids.push(id);descriptions[id]=effect||'';
}
function clonePart(from,id){
 const part=Object.assign({},from,{id:'set_'+id+'_'+BASEM[from.b].s,set:id,m:Object.assign({},from.m)});
 if(!SETITEMS.some(x=>x.id===part.id))SETITEMS.push(part);return part;
}
for(let c=0;c<3;c++){
 const cls=classes[c],z='zuma_'+cls,a='chiyue_'+cls,legacy=['shengzhan','fashen','tianzun'][c],dragon=['leiting','lieyan','guangmang'][c];
 const main=['maxdmg','mag','tao'][c],bonus={2:{def:1,mdef:1,life:12},4:{[main]:2,life:18},6:{[main]:3,mana:15}};
 define(z,'祖玛·'+['战士','法师','道士'][c],cls,{2:{def:1,mdef:1},4:{[main]:2,life:30}});
 const helm=BASES.find(b=>b.n==='黑铁头盔');
 if(helm&&!SETITEMS.some(p=>p.set===z&&BASEM[p.b].s==='helm'))clonePart({b:helm.id,n:helm.n,lv:helm.q,rq:helm.q,m:{}},z);
 define(a,'赤月·'+['圣战','法神','天尊'][c],cls,{2:{def:1,mdef:1,life:12},4:{[main]:3,life:18}});
 for(const p of SETITEMS.filter(p=>p.set===legacy&&['helm','amulet','shield','ring'].includes(BASEM[p.b].s)))clonePart(p,a);
 define(dragon,['雷霆','烈焰','光芒'][c],cls,bonus);
 define(legacy,['圣战','法神','天尊'][c],cls,bonus,[
  '6件：烈火剑法追加半力斩击，不重复耗蓝或播放特效',
  '6件：火墙可叠2层，各自持续；火墙冷却减半',
  '6件：神兽命中向另外2个目标溅射'
 ][c]);

}
const pools={zumalord:ids.filter(id=>id.startsWith('zuma_')),chiyuedemon:ids.filter(id=>id.startsWith('chiyue_')),molonglord:['leiting','lieyan','guangmang'],darkniumoking:['shengzhan','fashen','tianzun']};
function count(id){if(!S||!SETS[id]||SETS[id].ccls!==curCls())return 0;return Object.entries(S.eq||{}).filter(([slot,it])=>SLOTS.includes(slot)&&it&&it.set===id).length}
function active(id,n){return count(id)>=n}
function record(){if(!S.mir2Sets)S.mir2Sets={kills:{},seen:{},pending:[]};const r=S.mir2Sets;r.kills=r.kills||{};r.seen=r.seen||{};r.pending=r.pending||[];return r}
function parts(key){return SETITEMS.filter(p=>(pools[key]||[]).includes(p.set))}
function remember(it){if(it&&ids.includes(it.set)&&it.cqContentId)record().seen[it.cqContentId]=1}
let installed=false,splashing=false;
function install(){if(installed)return;installed=true;
 const style=document.createElement('style');style.textContent='#modal:has(.mir2-set-codex){position:fixed;inset:0;height:100dvh;align-items:center}#modal:has(.mir2-set-codex) .mb{max-height:calc(100dvh - 32px);overflow-y:auto;margin:0 auto;width:calc(100% - 24px);max-width:366px;box-sizing:border-box}#modal .mir2-set-codex{font-size:13px;line-height:1.55}#modal .mir2-set-codex .sec{border-top:1px solid #886b3d;padding:10px 0}';document.head.appendChild(style);
 // Duplicate names are valid across collection/mechanism sets; exact identity wins.
 const gen=genItem;genItem=function(lv,opt){const it=gen.apply(this,arguments);if(it&&it.set&&ids.includes(it.set)){
 const exact=opt&&SETITEMS.find(p=>p.id===opt.contentId),p=exact||SETITEMS.find(p=>p.set===it.set&&p.b===it.b);if(p)it.cqContentId=p.id;
 }return it};
 // Fixed set attributes feed the same primary damage and guard paths as equipment.
 function fixed(k){let sum=0;for(const id of ids){const n=count(id);for(const[need,m]of Object.entries(SETS[id].bonus||{}))if(n>=+need)sum+=m[k]||0}return sum}
 const calculate=calc;calc=function(){const r=calculate.apply(this,arguments);if(curCls()==='zs'){ST.wmin+=fixed('mindmg');ST.wmax+=fixed('maxdmg')}return r};
 const values=clsSV;clsSV=function(id){const v=values.apply(this,arguments),cls=curCls(),field=Array.isArray(v.dmg)?'dmg':Array.isArray(v.pd)?'pd':null;if(SKM[id]?.cls!==cls||!field||!['fs','ds'].includes(cls))return v;const add=fixed(cls==='fs'?'mag':'tao')*(cls==='fs'?3:1);if(!add)return v;const damage=v[field].map(x=>x+add);return Object.assign({},v,{[field]:damage,txt:typeof v.txt==='string'?v.txt.replace(v[field].join('-'),damage.join('-')):v.txt})};
 const hurt=hurtHero;hurtHero=function(value,el){if(value>0&&['fire','cold','light','magic'].includes(el))arguments[0]=Math.max(1,value-fixed('mdef'));return hurt.apply(this,arguments)};
 // Summon splash is a skill mechanism; it never adds an equipment multiplier.
 const hit=hitMon;hitMon=function(m,d,src,col){
 const pet=src&&typeof src==='object'&&src.kind==='cqpet'&&src.owner!=='hero';
 const before=m.hp,result=hit.apply(this,arguments);
 if(!splashing&&pet&&src.sub==='zhss'&&active('tianzun',6)&&before>m.hp){splashing=true;try{for(const other of liveMon().filter(x=>x!==m).slice(0,2))hit.call(this,other,Object.fromEntries(Object.entries(d).filter(([k])=>k!=='pois').map(([k,v])=>[k,v*.35])),src,col)}finally{splashing=false}}
 return result;
 };
 const melee=CLS_TY.hit;CLS_TY.hit=function(s,v,ms,tg){const r=melee.apply(this,arguments);if(s.id==='lhjf'&&active('shengzhan',6)&&tg.hp>0)clsMelee(tg,((1+(v.pct||0)/100)*.5-1)*100,(v.flat||0)*.5,v);return r};
 const burn=CLS_TY.burn;CLS_TY.burn=function(s,v,ms,tg){
 if(s.id!=='hq')return burn.apply(this,arguments);
 const multi=active('fashen',6),targets=ms.slice(0,v.n||8);
 for(const m of targets){const old=m.burn,alive=old&&old.left>0&&old.cqWalls;
 const layers=multi?(alive?old.cqWalls.filter(x=>x.until>GT):[]):[];
 layers.push({dps:v.dps*elMul('fire'),until:GT+(v.bdur||4)});
 const kept=layers.slice(-2),end=Math.max(...kept.map(x=>x.until));
 m.burn={left:end-GT,acc:0,cqWalls:kept};Object.defineProperty(m.burn,'dps',{enumerable:true,get(){return kept.filter(x=>x.until>GT).reduce((sum,x)=>sum+x.dps,0)}});
 }return targets;
 };
 const feasible=acFeasible;acFeasible=function(id,ms){if(id==='hq'&&active('fashen',6)&&castable(id)&&clsCdLeft(id)<=0)return ms.length>0;return feasible.apply(this,arguments)};
 const cooldown=clsCdLeft;clsCdLeft=function(id){const left=cooldown.apply(this,arguments);return id==='hq'&&active('fashen',6)&&ACT[id]!=null?Math.max(0,left-SKM[id].cd/2):left};
 const tc=rollTC;rollTC=function(m){const out=tc.apply(this,arguments);if(!m||!m.boss||!pools[m.key])return out;
 const r=record(),replay=!!m.cqLootReplay,n=r.kills[m.key]=(r.kills[m.key]||0)+(replay?0:1),all=parts(m.key);
 out.forEach(remember);
 let candidate=null;if(!replay&&n%300===0){const own=all.filter(p=>SETS[p.set].ccls===curCls());candidate=own.find(p=>!r.seen[p.id])||own[(n/300-1)%own.length]}
 else if(rnd()<.025)candidate=pick(all);
 if(candidate){const it=CQMir2Equip.createContent(candidate.id,m.lv||60);if(!replay&&n%300===0)it.cqSetGuarantee=1;out.push(it);remember(it)}return out;
 };
 const bag=addBag;addBag=function(it){remember(it);if(it&&it.cqSetGuarantee&&!bagFits(it)){record().pending.push(it);return false}return bag.apply(this,arguments)};
 const hero=renderHero;renderHero=function(){const r=hero.apply(this,arguments),p=document.querySelector('#panel');if(p&&!p.querySelector('.mir2-set-entry'))p.insertAdjacentHTML('beforeend','<button class="btn mir2-set-entry" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="CQMir2Sets.show()">套装图鉴</button>');return r};
 const show=showItem;showItem=function(uid){const r=show.apply(this,arguments),it=findItem(uid)?.it;if(it&&ids.includes(it.set)){const p=document.querySelector('#modal .ipanel');if(p)p.insertAdjacentHTML('beforeend','<div class="sec">已穿戴 '+count(it.set)+' 件 · '+descriptions[it.set]+'<br>原创套装奖励，单件采用传奇属性</div>')}return r};
}
function claim(){const r=record();while(r.pending.length&&bagFits(r.pending[0]))S.bag.push(r.pending.shift());save();show()}
function show(){const r=record();for(const it of [...Object.values(S.eq||{}),...(S.bag||[])])remember(it);
 modal('<div class="ipanel mir2-set-codex"><h3>传奇套装图鉴</h3><div class="dim">原创2/4/6件效果 · 同套按装备部位计数<br>首领每300杀补一件本职业未收集部件；背包满时保留在待领取。</div><button class="btn" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="CQMir2Sets.claim()">领取保底（'+r.pending.length+'）</button>'+Object.entries(pools).map(([key,sets])=>'<div class="sec"><b>'+blName(key)+'</b> · '+(r.kills[key]||0)+'杀 · 距保底 '+(300-(r.kills[key]||0)%300)+'<br>'+sets.map(id=>'<div><b>'+SETS[id].n+'</b> · 穿戴 '+count(id)+'件<br>'+Object.entries(SETS[id].bonus).map(([n,m])=>n+'件：'+modsTxt(m)).join('；')+'<br>'+descriptions[id]+'<br>'+SETITEMS.filter(p=>p.set===id).map(p=>(r.seen[p.id]?'✓ ':'· ')+p.n).join(' / ')+'</div>').join('')+'</div>').join('')+'<button class="btn" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="closeM()">关闭</button></div>');
}
window.CQMir2Sets={ids,descriptions,pools,parts,count,active,install,show,claim};
if(!window.__NOUI)install();
})();
