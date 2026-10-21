// 一键换装（按战力）：node tests/cq_autobest_test.js
const T=require('./cq_harness')('cq_autobest_test');const{G,ok}=T;
G(`S=newSave();load();S.cls='zs';S.ci=0;clsInit();ensureLoot();calc();S.lvl=30;S.at.str=200;S.at.dex=200;calc();S.bag=[];for(const k of SLOTS)delete S.eq[k];calc()
 var mk=(s,q,lv)=>{const b=BASES.filter(x=>x.s===s&&!x.cls&&x.q<=lv).sort((a,c)=>c.q-a.q)[0];const it=genItem(lv,{base:b,q});it.req=Math.min(it.req||0,S.lvl);return it}`);
const ab=d=>JSON.parse(G(`JSON.stringify(CQSys.equip.autoBest(${d?'true':''}))`));
let r=ab();ok(r.ok&&r.changed===0&&r.reason,'背包空：无变化');
G(`var h1=mk('helm',1,5),h2=mk('helm',4,25);h2.en=3;S.bag.push(h1,h2);var r1=mk('ring',1,5),r2=mk('ring',4,20),r3=mk('ring',3,20);S.bag.push(r1,r2,r3);
 var big=mk('helm',4,25);big.req=99;S.bag.push(big)`);
r=ab(true);ok(r.dryRun&&r.changed===3&&G('S.bag.length')===6&&!G('S.eq.helm'),'dryRun：返回 3 处变化但不改动');
r=ab();ok(r.changed===3&&G('S.eq.helm===h2')&&G('S.bag.includes(h1)'),'头盔换成战力最高可穿的 '+G('itemName(h2)'));
ok(G('S.bag.includes(big)')&&G('S.eq.helm!==big'),'需求等级不够的不穿');
const top2=G('[r1,r2,r3].sort((a,b)=>power(b)-power(a)).slice(0,2).every(x=>x===S.eq.ring1||x===S.eq.ring2)');ok(top2,'两个戒指位放战力前二');
ok(r.changes.every(c=>c.to&&typeof c.gain==='number')&&r.power.after>=r.power.before,'返回变化列表与战力前后');
r=ab();ok(r.changed===0,'再次执行：无变化');
G(`var h3=JSON.parse(JSON.stringify(h2));h3.uid=S.uid++;h3.en=9;S.bag.push(h3);var n0=S.bag.length`);r=ab();ok(r.changed===1&&r.changes[0].from.uid===G('h2.uid')&&G('S.bag.includes(h2)')&&G('S.bag.length')===G('n0'),'替换下的旧装备回背包');
G(`var wr=BASES.find(b=>b.cls&&b.ccls&&b.ccls!=='zs');var cw=wr?genItem(30,{base:wr,q:5}):null;if(cw){cw.req=1;S.bag.push(cw)}`);
if(G('!!cw')){ab();ok(G('S.eq.weapon!==cw'),'他职业专属装备不穿')}
T.done();
