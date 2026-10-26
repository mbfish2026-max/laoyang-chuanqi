'use strict';
// Independent acceptance matrix: use the real serialization migration boundary.
const T=require('./cq_harness')('compare_independent'),{G,ok}=T;
for(const legacy of [false,true]){
 G(`load();CQSys.createChar('独立验收','zs');S.lvl=60;S.eq={};S.bag=[];S.pst=[[]];var h=CQSys.hero();h.cls='fs';h.lvl=60;h.eq={};`);
 for(const subject of ['player','hero'])for(const kind of ['weapon','ring','brace','set']){
  G(`var eq=${subject==='hero'?'h.eq':'S.eq'};for(var key of Object.keys(eq))delete eq[key];var base=${kind==='weapon'?'BASEM.swd1':kind==='brace'?'BASES.find(b=>cqBrace(b)&&!b.ccls)':'BASES.find(b=>b.s==="ring"&&!b.ccls)'};var candidate=genItem(60,{base,q:3});candidate.req=1;${kind==='set'?`candidate=genItem(60,{contentId:SETITEMS.find(x=>x.id&&x.set!=='zuma'&&BASEM[x.b].ccls===${subject==='hero'?"'fs'":"'zs'"}).id,noAnc:1});candidate.req=1;`:''}S.bag=[candidate];`);
  if(legacy)G(`delete S.sv;delete candidate.cqVersion;delete candidate.cqCleanVersion;candidate.m.ll=3;GS.setItem(KEY,JSON.stringify(S));GS.setItem(CH_PRE+ACCT.cur,JSON.stringify(S));load();h=CQSys.hero();eq=${subject==='hero'?'h.eq':'S.eq'};candidate=S.bag[0];candidate.req=1;`);
  const prefix=`${legacy?'旧档':'新档'}/${subject}/${kind}`;
  if(legacy)ok(G('candidate.cqMigrated===1'),prefix+' migrated through load');
  for(const scenario of ['empty','stronger','weaker','equal','dual','class','level']){
   G(`for(var key of Object.keys(eq))delete eq[key];var who=${subject==='hero'?'h':'S'};who.lvl=60;candidate.req=1;candidate.cqLegacyClass=null;var ks=CQCompare.slots(candidate);var current=JSON.parse(JSON.stringify(candidate));current.uid=999001;current.m.life=(current.m.life||0)+${scenario==='weaker'?1000:0};${scenario!=='empty'?'for(var key of ks)eq[key]=JSON.parse(JSON.stringify(current));':''}${scenario==='stronger'?'candidate.m.life=(candidate.m.life||0)+1000;':''}${scenario==='dual'?'eq[ks[0]].m.life=(candidate.m.life||0)+1000;if(ks.length>1)eq[ks[1]].m.life=(candidate.m.life||0)-1;':''}${scenario==='class'?`candidate.cqMigrated=1;candidate.cqLegacyClass=${subject==='hero'?"'zs'":"'fs'"};`:''}${scenario==='level'?'who.lvl=1;candidate.req=50;':''}var result=CQCompare.compare(candidate,eq);var cls=${subject==='hero'?'h.cls':'curCls()'};var expectedSlot=ks.find(k=>!eq[k])||ks.reduce((a,b)=>power(eq[a],cls)<=power(eq[b],cls)?a:b);var expectedDelta=power(candidate,cls)-(eq[expectedSlot]?power(eq[expectedSlot],cls):0);var expectedEligible=${!['class','level'].includes(scenario)};var expectedBetter=expectedEligible&&(!eq[expectedSlot]||expectedDelta>0);var panel=CQCompare.html(candidate,eq);var segment=panel.split('<section>')[ks.indexOf(expectedSlot)+1].split('</section>')[0];`);
   ok(G('result.slot===expectedSlot&&result.delta===expectedDelta'),prefix+'/'+scenario+' weaker slot and independent power delta');
   ok(G('result.eligible===expectedEligible&&result.better===expectedBetter&&!!CQCompare.arrow(candidate,eq)===expectedBetter'),prefix+'/'+scenario+' arrow eligibility');
   ok(G('segment.includes("战力差 "+(expectedDelta>0?"↑ +":expectedDelta<0?"↓ ":"＝ ")+expectedDelta)'),prefix+'/'+scenario+' popup delta agrees');
  }
  if(kind==='set')ok(G('CQCompare.sets(candidate,eq).includes("套装已穿戴")'),prefix+' set display');
 }
}
T.done();
