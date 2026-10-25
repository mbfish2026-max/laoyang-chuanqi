'use strict';
// Pure object migration: no save/global character writes; caller commits the returned copy.
(function(){
const keep=new Set(['mindmg','maxdmg','def','mag','tao','mdef','ar','dex','luck','life','mana','defMin','defMax','magMin','magMax','taoMin','taoMax','mdefMin','mdefMax']);
function guardUpgrade(it){if(it.k||it.cqGuardVersion>=1)return it;const old=it.cqLegacy||{};const pct=Math.min(80,Math.max(0,old.allres||0)+Math.max(0,...['fres','cres','lres','pres'].map(k=>old[k]||0)));const previous=['allres','fres','cres','lres','pres','dr','mdr'].reduce((n,k)=>n+Math.max(0,Number(old[k])||0),0);// Use the maximum old protection ceiling as denominator so separate items also compose safely.
 const fixed=Math.ceil(100*pct/20)+Math.max(0,old.dr||0)+Math.max(0,old.mdr||0);it.m=it.m||{};it.m.mdef=(it.m.mdef||0)+Math.max(0,fixed-previous);it.cqGuardVersion=1;return it}
function migrateItem(input){const it=JSON.parse(JSON.stringify(input));if(it.k)return it;if(it.cqCleanVersion>=2)return guardUpgrade(it);
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
 it.cqCompensation={version:2,beforePower:target};return guardUpgrade(it)}
function migrate(state,account){const s=JSON.parse(JSON.stringify(state)),a=account==null?null:JSON.parse(JSON.stringify(account));
 let count=0;
 function walk(o){if(!o||typeof o!=='object')return o;if(typeof o.b==='string'&&('uid'in o||'m'in o)){if(!o.k&&(!(o.cqCleanVersion>=2)||!o.cqGuardVersion)){count++;return migrateItem(o)}return o}if(Array.isArray(o))return o.map(walk);for(const k of Object.keys(o))if(!['cqUnknown','cqLegacy','cqOriginalName','cqOriginal','cqCompensation'].includes(k))o[k]=walk(o[k]);return o}
 walk(s);if(a)walk(a);s.mir2Mig=Object.assign({},s.mir2Mig,{equipment:2});return{state:s,account:a,count}}
// Serialization boundary. Backups deliberately never enter GS or cloud payloads.
const PURGE_VERSION=1, BACKUP_KEY='cq-save-recovery-v1';
function backup(value,owner){
 const data=JSON.stringify(value);let hash=2166136261;
 for(let i=0;i<data.length;i++)hash=Math.imul(hash^data.charCodeAt(i),16777619)>>>0;
 const account=String(owner??(typeof ACCT_NS!=='undefined'?ACCT_NS:null)??'guest');
 // Each source/batch owns an immutable key. Old v1/v2 recovery data is left
 // untouched; neither a catalogue rewrite nor another account can evict it.
 const prefix=BACKUP_KEY+'-fixed-',base=prefix+encodeURIComponent(account)+'-'+hash+'-';
 try{
  for(let i=0;;i++){
   const key=base+i,existing=localStorage.getItem(key);
   if(existing!=null){
    try{const entry=JSON.parse(existing);if(entry.account===account&&entry.raw===data)return}catch(e){}
    continue; // Hash collision or corrupt record: never overwrite it.
   }
   const raw=JSON.stringify({version:3,account,hash,at:Date.now(),raw:data});
   localStorage.setItem(key,raw);
   if(localStorage.getItem(key)!==raw)throw Error('storage');
   return;
  }
 }catch(cause){const e=new Error('存档备份失败');e.code='CQ_BACKUP_FAILED';throw e}

}
const words=/暗夜|暗黑(?!战士)|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer/gi;
function purge(state,account){
 const s=JSON.parse(JSON.stringify(state)),a=account==null?null:JSON.parse(JSON.stringify(account));
 let gold=0;
 if(s.merc){const m=s.merc;s.hero=s.hero||{eq:{}};s.hero.eq=s.hero.eq||{};if(!s.hero.cls){s.hero.cls=({mage:'fs',archer:'ds',guard:'zs',barb:'zs'})[m.t]||'zs';s.hero.lvl=m.lvl||1;s.hero.xp=m.xp||0;s.hero.name=m.nm||'英雄'}
 const seen=new Set([...(s.bag||[]),...Object.values(s.eq||{}),...Object.values(s.hero.eq),...(s.pst||[]).flat()].filter(Boolean).map(x=>x.uid));
 for(const it of [...Object.values(m.eq||{}),...Object.values(m.prev?.eq||{})])if(it&&!seen.has(it.uid)){(s.bag||(s.bag=[])).push(it);seen.add(it.uid)}}
 if(s.bon?.res){const r=Math.max(0,+s.bon.res||0);s.bon.def=(s.bon.def||0)+r*4;s.bon.mdef=(s.bon.mdef||0)+r*5;s.bon.attack=(s.bon.attack||0)+r;delete s.bon.res}
 if(s.sockq)gold+=Math.max(0,+s.sockq||0)*5000;
 const credit=(n)=>{gold+=Math.max(0,Number(n)||0)};
 function walk(o,path='state'){
  if(!o||typeof o!=='object')return typeof o==='string'?o.replace(words,'旧版'):o;
  if(Array.isArray(o))return o.map((v,i)=>walk(v,path+'.'+i)).filter(x=>x!==undefined);
  if(pruneBad(o)){credit(pruneVal(o)*(o.n||1));return undefined}
  if(o.k==='mat'&&/rune|gem|keystone|essence/.test(o.id||''))o.id='ess';
  const equipment=typeof o.b==='string'&&!o.k;
  if(equipment){
   if(o.rw!=null&&o.q<=2&&BASEM[o.b])o.name=BASEM[o.b].n;
   // Read socket resources before the item migrator erases their active copy.
   const sockets=o.soc?.length?o.soc:(!o.cqPurgeVersion?o.cqOriginal?.soc:null);
   for(const x of sockets||[])credit(typeof x==='object'?pruneVal(x):50);
   if(!o.cqVersion||o.cqMigrated||o.cqLegacy)o=migrateItem(o);
   o.q=o.q<=2?1:o.q===7?4:o.q===8?5:o.q;
   const target=power(o);
   for(const field of ['m','cqBest','cqBonus','ax'])if(o[field]){
    for(const k of Object.keys(o[field]))if(!keep.has(k))delete o[field][k];
   }
   // Keep the paid counter and all candidates; convert any late archived modifiers.
   if(o.rf){const key=k=>keep.has(k)?k:'def';o.rf.k=o.rf.k?key(o.rf.k):o.rf.k;
    for(const f of ['boff','bless'])if(o.rf[f]){const m={};for(const[k,v]of Object.entries(o.rf[f]))m[key(k)]=(m[key(k)]||0)+Math.max(0,+v||0);o.rf[f]=m}
    if(o.rf.off)o.rf.off=o.rf.off.map(([k,...v])=>[key(k),...v]);}
   const deficit=target-power(o);if(deficit>0)o.m.def=(o.m.def||0)+Math.ceil(deficit);
   o.cqPurgeVersion=PURGE_VERSION;
  }
  // Preserve retired progress as neutral numeric counters, never raw snapshots.
  const retired=path==='state'||path==='state.eg'||path==='state.eg.history';
  for(const k of retired?['secret','rift','season']:[])if(o[k]&&typeof o[k]==='object'){
   if(k==='rift')credit((Number(o[k].keys)||Number(o[k].key)||Number(o[k].keystones)||0)*200);
   const counts=o.retiredProgress||(o.retiredProgress={});const dest=k==='secret'?'path':k==='rift'?'trial':'period';
   counts[dest]=Object.fromEntries(Object.values(o[k]).filter(v=>typeof v==='number').map((v,i)=>['n'+i,v]));
  }
  for(const k of path==='state'?['runes','gems','keystones']:[])if(o[k]){const val=o[k];credit(typeof val==='number'?val*200:Object.values(val).reduce((n,v)=>n+(Number(v)||0),0)*200)}
  if(retired&&o.lp){const n=Object.keys(o.lp).length;o.retiredPowerCount=Math.max(o.retiredPowerCount||0,n)}
  for(const k of Object.keys(o)){
   if((equipment&&['sock','soc','rw','rwm','lp','cqLegacy','cqOriginal','cqOriginalName','cqUnknown','af','unique','uniq','darkgold','affixes'].includes(k))||((path==='state')&&['sockq','merc','mercU','autoMerc','cqMetaHistory','kp','sp','cube','runes','gems','keystones','cqSeasonOld'].includes(k))||(retired&&['secret','rift','season','lp'].includes(k))){delete o[k];continue}
   if(k==='mode'&&o[k]==='season')o[k]='normal';
   if(k==='t'&&o[k]==='wrift'){o[k]='wboss'}
   o[k]=walk(o[k],path+'.'+k);if(o[k]===undefined)delete o[k];else{const cleanKey=k.replace(words,'旧版');if(cleanKey!==k){o[cleanKey]=o[k];delete o[k]}}
  }
  return o;
 }
 // Convert unspent points before deleting the obsolete keys.
 {const L=Math.max(s.lvl||1,s.cqLegacyLevel||1);credit((s.sp||0)*AG_GOLD.sp(L)+(s.kp||0)*AG_GOLD.kp(L));}
 const out=walk(s);if(a)walk(a,'account');
 if(gold){out.gold=(out.gold||0)+gold;out.cqPruneG=(out.cqPruneG||0)+gold;}
 out.cqPurgeVersion=PURGE_VERSION;return{state:out,account:a};
}
// Reconcile by UID to retain references held by active dialogs/combat systems.
function commit(dst,src){
 if(!dst||!src)return;
 if(Array.isArray(dst)&&Array.isArray(src)){
  const byId=new Map(dst.filter(x=>x&&typeof x==='object'&&x.uid!=null).map(x=>[x.uid,x]));
  const next=src.map((v,i)=>{const old=v&&typeof v==='object'&&v.uid!=null?byId.get(v.uid):dst[i];if(old&&v&&typeof old==='object'&&typeof v==='object'&&Array.isArray(old)===Array.isArray(v)){commit(old,v);return old}return v});
  dst.splice(0,dst.length,...next);return;
 }
 for(const k of Object.keys(dst))if(!(k in src))delete dst[k];
 for(const[k,v]of Object.entries(src)){if(v&&dst[k]&&typeof v==='object'&&typeof dst[k]==='object'&&Array.isArray(v)===Array.isArray(dst[k]))commit(dst[k],v);else dst[k]=v}
}
window.CQMir2EquipMigrate={commit,item:migrateItem,migrate,purge,backup,purgeVersion:PURGE_VERSION};
})();
