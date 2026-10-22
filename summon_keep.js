// R05: S.summons owns persistent pets; ALLY is its combat projection.
var SMKEEP={on:1};
function skpWire(CS){
 const list=()=>{if(!Array.isArray(S.summons))S.summons=[];for(const s of S.summons)s.eq=s.eq||{};return S.summons};
 const managed=a=>a.kind==='cqpet'&&a.owner!=='hero';
 let owner=null;
 function capture(){if(owner!==S)return;for(const a of ALLY.filter(managed)){const s=list().find(s=>s.id===a.summonId);if(!s)continue;s.hp=Math.max(0,a.hp);if(a.hp<=0&&!s.deadAt)CS.summonDie(s.id)}}
 function project(){owner=S;const records=list();for(const a of ALLY.filter(a=>managed(a)&&a.hp>0&&!a.summonId)){const kind=a.sub==='zhss'?'dog':a.sub==='zhkl'?'skel':'pet';let s=records.find(s=>s.sk===a.sub&&!s.deadAt&&!ALLY.some(x=>x.summonId===s.id));if(!s){s={id:'s'+(S.uid++),kind,sk:a.sub,mon:a.mkey||a.art,lv:slvl(a.sub)||1,hp:a.hp,deadAt:0,eq:{},base:{hp:a.max,dmg:a.dmg.slice()}};records.push(s)}a.summonId=s.id;}ALLY=ALLY.filter(a=>!managed(a)||(a.hp>0&&records.some(s=>s.id===a.summonId&&!s.deadAt)));
  for(const s of records){s.eq=s.eq||{};if(s.deadAt)continue;let a=ALLY.find(a=>managed(a)&&a.summonId===s.id);const st=CS.summonStats(s.id);if(!st)continue;
   const sk=s.sk||(s.kind==='dog'?'zhss':s.kind==='skel'?'zhkl':'yhzg');const L=Math.max(s.lv||1,slvl(sk)||0);let v=SKM[sk]?SV(sk,L):{};
   const base=s.base||{hp:v.hp||st.hp,dmg:v.pd||[st.atk,st.atk]};const mods=s.eq.collar?allMods(s.eq.collar):{};
   const hp=Math.max(st.hp,Math.max(base.hp,v.hp||0)*(1+(ST.sumlife||0)/100)+(mods.life||0));const dmg=base.dmg.map((x,i)=>Math.max(st.atk,Math.max(x,(v.pd||[])[i]||0)+(mods.maxdmg||0)));
   if(!a){a=addAlly('cqpet',{summonId:s.id,sub:sk,n:v.pn||(s.kind==='pet'?'宝宝·'+((MONS[s.mon]||{}).n||s.mon):'神兽'),art:s.kind==='pet'?s.mon:undefined,hp,dmg,el:v.el||'phys',th:v.th||0});a.hp=Math.min(hp,s.hp>0?s.hp:hp)}
   a.max=Math.round(hp);a.hp=Math.min(a.hp,a.max);a.dmg=dmg;a.def=st.def;a.sub=sk;
   if(s.kind==='dog'){a.n=v.pn||'神兽';a.art=L>=7?'pet_ss_gold':'pet_ss';a.form=L>=7?'gold':L>=4?'grown':'young'}
   s.hp=a.hp;
  }
 }
 CS.summonSync=()=>{capture();project()};
 const oldSave=save;save=function(){capture();return oldSave.apply(this,arguments)};
 const oldLoad=load;load=function(){const r=oldLoad.apply(this,arguments);owner=null;return r};
 const oldReset=resetRuntime;resetRuntime=function(){capture();owner=null;return oldReset.apply(this,arguments)};
 const oldStep=step;step=function(dt){project();const pets=ALLY.filter(managed);const r=oldStep(dt);for(const a of pets){const s=list().find(s=>s.id===a.summonId);if(s){s.hp=Math.max(0,a.hp);if(a.hp<=0&&!s.deadAt)CS.summonDie(s.id)}}capture();return r};
 const oldPet=CLS_TY.pet;CLS_TY.pet=function(s,v){if(!['zhkl','zhss'].includes(s.id))return oldPet.apply(this,arguments);
  capture();let record=list().find(x=>x.kind==='dog'||x.kind==='skel');if(record&&record.deadAt&&CS.summonStats(record.id).reviveLeft>0)return[];
  const kind=s.id==='zhss'?'dog':'skel';if(!record){const r=CS.summonAdd(kind,{sk:s.id,lv:slvl(s.id)});if(!r.ok)return[];record=r.summon}
  record.kind=kind;record.sk=s.id;record.lv=slvl(s.id);record.base={hp:v.hp,dmg:v.pd};record.deadAt=0;record.hp=Math.max(record.hp||0,v.hp);
  ALLY=ALLY.filter(a=>!managed(a)||a.summonId!==record.id);project();return[]};
 const oldCharm=CLS_TY.charm;CLS_TY.charm=function(s,v,ms){const before=new Set(ALLY);const out=oldCharm.apply(this,arguments);for(const a of ALLY.filter(a=>managed(a)&&!before.has(a))){const dead=list().find(x=>x.kind==='pet'&&x.deadAt&&CS.summonStats(x.id).reviveLeft<=0);const r=dead?{ok:1,summon:dead}:CS.summonAdd('pet',{mon:a.mkey,sk:s.id,lv:slvl(s.id)});if(r.ok){a.summonId=r.summon.id;r.summon.deadAt=0;r.summon.mon=a.mkey;r.summon.sk=s.id;r.summon.lv=slvl(s.id);r.summon.base={hp:a.max,dmg:a.dmg.slice()};r.summon.hp=a.hp}else a.hp=0}capture();return out};CLS_TY.charm.ok=function(){return !list().some(x=>x.kind==='pet'&&x.deadAt&&CS.summonStats(x.id).reviveLeft>0)&&oldCharm.ok.apply(this,arguments)};
 for(const key of ['summonEquipCollar','summonSetLv','summonRevive','summonRemove']){const f=CS[key];CS[key]=function(){capture();const r=f.apply(this,arguments);if(r&&r.ok){if(key==='summonRemove')ALLY=ALLY.filter(a=>a.summonId!==arguments[0]);project();save()}return r}}
 const oldEnter=egEnter;egEnter=function(m){capture();const r=oldEnter.apply(this,arguments);if(SMKEEP.on&&EGM===m)project();return r};
}
