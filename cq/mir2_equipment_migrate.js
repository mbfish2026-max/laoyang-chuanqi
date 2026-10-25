'use strict';
// Pure object migration: no save/global character writes; caller commits the returned copy.
(function(){
const keep=new Set(['mindmg','maxdmg','def','mag','tao','mdef','ar','dex','luck','life','mana','defMin','defMax','magMin','magMax','taoMin','taoMax','mdefMin','mdefMax']);
function migrateItem(input){const it=JSON.parse(JSON.stringify(input));if(it.k||it.cqCleanVersion>=2)return it;
 const original=JSON.parse(JSON.stringify(it));
 if(!BASEM[it.b]){const slot=typeof cqD2Slot==='function'&&cqD2Slot(it.b)||(it.dmg?'weapon':'armor'),dest=BASES.find(b=>b.s===slot);if(!dest)return it;it.b=dest.id;it.cqUnknown=original}
 const base=BASEM[it.b],target=window.CQMir2Equip?.legacyPower?CQMir2Equip.legacyPower(it):power(it);
 it.cqOriginalName=it.cqOriginalName||it.name;it.cqOriginal=it.cqOriginal||original;
 it.cqLegacy=Object.assign({},it.cqLegacy);it.m=Object.assign({},it.m);
 const effective=Object.assign({},it.cqLegacy);for(const[k,v]of Object.entries(it.m))if(!keep.has(k)){effective[k]=(effective[k]||0)+v;it.cqLegacy[k]=(it.cqLegacy[k]||0)+v;delete it.m[k]}
 // Percent local damage/defence becomes the same fixed local value, once.
 if(it.dmg&&effective.edmg>0)it.dmg=it.dmg.map(v=>Math.floor(v*(1+effective.edmg/100)));
 if(it.def!=null&&effective.edef>0)it.def=Math.floor(it.def*(1+effective.edef/100));
 const guard=['allres','fres','cres','lres','pres','dr','mdr'].reduce((n,k)=>n+Math.max(0,Number(effective[k])||0),0);
 if(guard)it.m.mdef=(it.m.mdef||0)+Math.ceil(guard);
 // Preserve paid offers with fixed-point replacements; original offers stay in cqOriginal.
 const key=k=>keep.has(k)?k:'def';
 if(typeof it.rf==='number')it.rf={k:null,n:it.rf,off:null};
 if(it.rf&&typeof it.rf==='object'){
  it.rf.k=it.rf.k?key(it.rf.k):it.rf.k;
  if(it.rf.off)it.rf.off=it.rf.off.map(([k,v,lo,hi])=>[key(k),Math.max(1,Math.ceil(v)),Math.max(1,Math.ceil(lo)),Math.max(1,Math.ceil(hi))]);
  for(const field of ['boff','bless'])if(it.rf[field]){const out={};for(const[k,v]of Object.entries(it.rf[field]))out[key(k)]=(out[key(k)]||0)+Math.max(0,Math.ceil(v));it.rf[field]=out}
 }
 for(const field of ['cqBest','cqBonus','ax'])if(it[field])it[field]=Object.fromEntries(Object.entries(it[field]).filter(([k])=>keep.has(k)));
 it.cqRange=it.cqRange||JSON.parse(JSON.stringify(base.cqRange||{}));
 if(it.dmg)it.cqRange.dmg=it.dmg.slice();if(it.def!=null)it.cqRange.def=[it.def,it.def];
 it.cqLegacyClass=it.cqLegacyClass||window.CQMir2Equip?.oldBases[it.b]?.ccls||null;
 it.cqMigrated=1;it.cqVersion=1;it.cqCleanVersion=2;
 it.q=it.q<=2?1:it.q===7?4:it.q===8?5:it.q;
 it.name=UNIQUES.some(u=>u.b===it.b&&u.n===it.name)||SETITEMS.some(u=>u.b===it.b&&u.n===it.name)?it.name:base.n;
 it.af=[];it.sock=0;it.soc=[];delete it.rw;
 // Use real fixed defence (also scores on jewellery), never a display-only power floor.
 const deficit=Math.max(0,target-power(it));if(deficit)it.m.def=(it.m.def||0)+Math.ceil(deficit);
 // A paid obsolete candidate must retain its value, including when it replaces
 // the compensation field. Price each archived outcome through the old scorer.
 if(original.rf?.off&&it.rf){it.rf.off=original.rf.off.map(([k,v,lo,hi])=>{
  if(keep.has(k))return[k,v,lo,hi];
  const converted=amount=>{const old=JSON.parse(JSON.stringify(original));old.b=it.b;old.m=Object.assign({},old.m);old.cqLegacy=Object.assign({},old.cqLegacy);delete old.m[original.rf.k];delete old.cqLegacy[original.rf.k];old.m[k]=amount;
   const next=JSON.parse(JSON.stringify(it));delete next.m[it.rf.k];delete next.m.def;return Math.max(1,Math.ceil(CQMir2Equip.legacyPower(old)-power(next)))};
  const low=converted(lo),high=converted(hi);return['def',converted(v),Math.min(low,high),Math.max(low,high)];
 })}
 it.cqCompensation={version:2,beforePower:target};return it}
function migrate(state,account){const s=JSON.parse(JSON.stringify(state)),a=account==null?null:JSON.parse(JSON.stringify(account));
 let count=0;
 function walk(o){if(!o||typeof o!=='object')return o;if(typeof o.b==='string'&&('uid'in o||'m'in o)){if(!o.k&&!(o.cqCleanVersion>=2)){count++;return migrateItem(o)}return o}if(Array.isArray(o))return o.map(walk);for(const k of Object.keys(o))if(!['cqUnknown','cqLegacy','cqOriginalName','cqOriginal','cqCompensation'].includes(k))o[k]=walk(o[k]);return o}
 walk(s);if(a)walk(a);s.mir2Mig=Object.assign({},s.mir2Mig,{equipment:2});return{state:s,account:a,count}}
window.CQMir2EquipMigrate={item:migrateItem,migrate};
})();
