'use strict';
// Pure object migration: no save/global character writes; caller commits the returned copy.
(function(){
const keep=new Set(['mindmg','maxdmg','def','mag','tao','mdef','ar','dex','luck','curse','ias','life','mana','crit','para','prot','revive','invis','teleport','overload','defMin','defMax','magMin','magMax','taoMin','taoMax','mdefMin','mdefMax']);
function migrateItem(input){const it=JSON.parse(JSON.stringify(input));if(it.k||it.cqVersion>=1)return it;
 const original=JSON.parse(JSON.stringify(it));const b=BASEM[it.b];
 if(!b){const slot=typeof cqD2Slot==='function'&&cqD2Slot(it.b)|| (it.dmg?'weapon':'armor');const dest=BASES.find(b=>b.s===slot);if(!dest)return it;it.b=dest.id;it.cqUnknown=original}
 it.cqLegacy=Object.assign({},it.cqLegacy);it.m=Object.assign({},it.m);for(const k in it.m)if(!keep.has(k)){it.cqLegacy[k]=(it.cqLegacy[k]||0)+it.m[k];delete it.m[k]}
 // Preserve legacy rolled combat values; correcting reference metadata must not reroll them.
 const base=BASEM[it.b];it.cqRange=JSON.parse(JSON.stringify(base.cqRange||{}));
 for(const[k,keys]of Object.entries({mag:['magMin','magMax'],tao:['taoMin','taoMax'],mdef:['mdefMin','mdefMax']})){
  const v=(it.m[k]||0)+(it.cqLegacy[k]||0);if(v)it.cqRange[k]=[v,v]
 }
 if(it.dmg)it.cqRange.dmg=it.dmg.slice();if(it.def!=null)it.cqRange.def=[it.def,it.def];
 it.cqMigrated=1;it.cqLegacyClass=window.CQMir2Equip?.oldBases[it.b]?.ccls||null;it.cqContentId=(UNIQUES.find(u=>u.b===it.b&&u.n===it.name)||SETITEMS.find(u=>u.b===it.b&&u.n===it.name)||{}).id||null;it.cqOriginalName=it.name;it.name=UNIQUES.some(u=>u.b===it.b&&u.n===it.name)||it.set?it.name:base.n;
 it.cqBest={};it.af=[];it.sock=0;it.soc=[];it.cqVersion=1;return it}
function migrate(state,account){const s=JSON.parse(JSON.stringify(state)),a=account==null?null:JSON.parse(JSON.stringify(account));
 if((s.mir2Mig?.equipment||0)>1)return{state:s,account:a,count:0};let count=0;
 function walk(o){if(!o||typeof o!=='object')return o;if(typeof o.b==='string'&&('uid'in o||'m'in o)){if(!o.k&&!(o.cqVersion>=1)){count++;return migrateItem(o)}return o}if(Array.isArray(o))return o.map(walk);for(const k of Object.keys(o))if(!['cqUnknown','cqLegacy','cqOriginalName'].includes(k))o[k]=walk(o[k]);return o}
 walk(s);if(a)walk(a);s.mir2Mig=Object.assign({},s.mir2Mig,{equipment:1});return{state:s,account:a,count}}
window.CQMir2EquipMigrate={item:migrateItem,migrate};
})();
