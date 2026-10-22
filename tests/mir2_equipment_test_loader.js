'use strict';
// Apply the documented shared-file wires only while constructing an isolated test VM.
const fs=require('fs');
module.exports=function(factory,...args){
 const read=fs.readFileSync;
 const replace=(s,a,b,file)=>{if(!s.includes(a))throw new Error('Equipment wire anchor changed: '+file);return s.replace(a,b)};
 fs.readFileSync=function(file,...options){let s=read.call(this,file,...options);if(typeof s!=='string')return s;const f=String(file);
  if(f.endsWith('/cq/sysapi_cq.js'))s=replace(s,"const isH=src==='cqhero'||src==='cqheji';","const isH=src==='cqhero'||src==='cqheji'||!!(src&&typeof src==='object'&&src.owner==='hero');",f);
  if(f.endsWith('/game.js')){
   s=replace(s,'else v=Math.round(v*(1-ST.res[el]/100));','else v=Math.round((window.CQMir2Equip?CQMir2Equip.magicGuard(v,el):v)*(1-ST.res[el]/100));',f);
   if(!s.includes('R(ST.wmin,ST.wmax)'))throw new Error('Equipment weapon wire anchor changed');
   s=s.replaceAll('R(ST.wmin,ST.wmax)','(window.CQMir2Equip?CQMir2Equip.rollAttack([ST.wmin,ST.wmax]):R(ST.wmin,ST.wmax))');
  }
  if(f.endsWith('/classes.js')){
   s=replace(s,'clsRR=d=>R(Math.round(d[0]),Math.round(d[1]))','clsRR=d=>window.CQMir2Equip?CQMir2Equip.rollAttack(d):R(Math.round(d[0]),Math.round(d[1]))',f);
   s=replace(s,'const w=R(ST.wmin,ST.wmax);','const w=window.CQMir2Equip?CQMir2Equip.rollAttack([ST.wmin,ST.wmax]):R(ST.wmin,ST.wmax);',f);
  }
  return s;
 };
 try{return factory(...args)}finally{fs.readFileSync=read}
};
