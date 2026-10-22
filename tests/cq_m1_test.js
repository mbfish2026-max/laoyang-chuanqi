// 老羊传奇 M1 系统测试：node tests/cq_m1_test.js
// 数据层清理 / 10 部位底材 / 第 1 章掉落与品质 / 强化 / 仓库 / 地图链 / 数值框架 / 存档迁移
const T=require('./cq_harness')('cq_m1_test');const{G,ok}=T;
ok(T.loadErr.filter(e=>!/bagux|power/.test(e)).length===0,'脚本载入无错误：'+T.loadErr.join(' | '));
G(`S=newSave();load();S.lvl=12;calc()`);
// ---------- 数据层清理 ----------
ok(G('typeof RUNES')==='undefined'&&G('typeof RUNEWORDS')==='undefined','符文/符文之语数据已删除');
ok(G('BASES.every(b=>!b.sock||!b.sock.some(x=>x))'),'底材无凹槽');
ok(G("typeof rollRune")==='undefined'&&G("(S=S||newSave(),oreItem(2).id==='heitie'&&oreItem(2).n===2)"),'符文掉落已删除，原奖励改黑铁矿 oreItem');
ok(G("typeof rollGem")==='undefined','宝石掉落已删除');
ok(G("Object.values(TCS).every(t=>!t.runes)"),'TC 无符文必掉');
ok(G("BASES.every(b=>!['orb','bhelm','head','charm','jewel'].includes(b.cat))"),'无 D2 职业底材/护身符/珠宝');
// ---------- 10 部位 ----------
const slots=G('JSON.stringify(SLOTS.map(k=>SLOTN[k]))');ok(slots==='["武器","左手镯","头盔","衣服","右手镯","腰带","鞋子","项链","戒指","戒指"]','10 部位显示名：'+slots);
for(const s of ['weapon','shield','helm','armor','gloves','belt','boots','amulet','ring'])ok(G(`BASES.filter(b=>b.s==='${s}'&&b.q<=12).length`)>=1,'第 1 章等级段有底材：'+s);
ok(G("BASES.every(b=>ITYPES[b.cat]&&ITYPES[b.cat].length)"),'每个底材类别都有词缀类型');
ok(G("BASEM.swd1.n==='木剑'&&BASEM.arm1.n==='布衣'"),'木剑/布衣');
ok(G("S.eq.weapon&&S.eq.weapon.b==='swd1'&&S.eq.armor&&S.eq.armor.b==='arm1'"),'新角色初始：木剑 + 布衣');
ok(G("UNIQUES.every(u=>BASEM[u.b])&&SETITEMS.every(u=>BASEM[u.b]&&SETS[u.set])"),'极品/套装底材与套装存在');
ok(G("UNIQUES.filter(u=>u.lv<=12).length")>=5,'第 1 章极品 ≥5');
ok(G("['麻痹戒指','护身戒指','复活戒指'].every(n=>UNIQUES.some(u=>u.n===n&&BASEM[u.b].s==='ring'))"),'特戒为极品戒指');
ok(G("SETS.zuma.bonus[4].edmg")===10&&G("SETITEMS.filter(it=>it.set==='zuma').length")===4,'祖玛旧套 4 件兼容保留');
// ---------- 品质 ----------
const dist=JSON.parse(G(`(()=>{const c={};for(let i=0;i<6000;i++){const it=genItem(R(1,12),{mf:0});c[it.q]=(c[it.q]||0)+1}return JSON.stringify(c)})()`));
ok(!dist[0]&&!dist[2]&&!dist[7]&&!dist[8],'不产出 破旧/超强/合成/符文之语：'+JSON.stringify(dist));
ok(dist[1]>0&&dist[3]>0&&dist[4]>0,'普通/精良/稀有都会出现');
const u=JSON.parse(G(`(()=>{let n=0,bad=0;for(let i=0;i<300;i++){const it=genItem(12,{q:5});if(it.q===5){n++;if(!UNIQUES.some(u=>u.n===it.name))bad++}}return JSON.stringify([n,bad])})()`));ok(u[0]>50&&u[1]===0,'强制极品产出正确名字 '+u);
ok(G("(()=>{const it=genItem(5,{base:BASEM.rin,q:3});return it.m.maxdmg!=null||Object.keys(it.m).length>0})()"),'首饰有底材白字/词缀');
ok(G("(()=>{for(let i=0;i<200;i++){const it=genItem(12,{q:4});if(Object.keys(it.m).some(k=>!MODT[k]))return false}return true})()"),'稀有词缀键都有显示文字');
ok(G("QN[5]==='极品'&&QN[3]==='精良'"),'品质名：精良/极品');
// ---------- 第 1 章掉落 ----------
G(`(()=>{const z=ACTS[0].zones[6];globalThis._drops=[];for(let i=0;i<3000;i++){const m=mkMon?null:null}})()`);
const drops=JSON.parse(G(`(()=>{const c={eq:0,ore:0,q5:0,bad:0};const mon={lv:10,key:'halforc',hp:1};for(let i=0;i<4000;i++){for(const it of rollTC(mon)){if(it.k==='mat'&&it.id==='heitie')c.ore++;else if(!it.k){c.eq++;if(it.q===5)c.q5++;if(!BASEM[it.b])c.bad++}else if(it.k==='rune'||it.k==='gem')c.bad++}}return JSON.stringify(c)})()`));
ok(drops.eq>100&&drops.ore>20&&drops.bad===0,'普通怪掉装备与黑铁矿、无符文宝石：'+JSON.stringify(drops));
const bd=JSON.parse(G(`(()=>{const c={eq:0,ore:0};const mon={lv:12,key:'orclord',boss:1,actboss:1,hp:1};for(let i=0;i<400;i++)for(const it of rollTC(mon)){if(!it.k)c.eq++;else if(it.id==='heitie')c.ore+=it.n}return JSON.stringify(c)})()`));
ok(bd.eq>400&&bd.ore>100,'章节首领掉落更丰富：'+JSON.stringify(bd));
// ---------- 地图链 ----------
const zn=G("ACTS[0].zones.map(z=>z.n).join('→')");ok(zn==='银杏村外→比奇城南→比奇城西→比奇城东→比奇城北→毒蛇山谷→半兽人古墓','第 1 章地图链：'+zn);
ok(G("ACTS[0].camp==='银杏村'&&ACTS[0].fq==='q6'"),'安全区银杏村，章节任务 q6');
ok(G("ACTS[0].zones.every(z=>z.mons.every(k=>MONS[k])&&(!z.boss||BOSSES[z.boss]))"),'地图怪物/首领定义齐全');
ok(G("ACTS[0].zones.every((z,i,a)=>!i||z.ml>=a[i-1].ml)&&ACTS[0].zones[6].ml===12"),'等级段 1→12 递增');
ok(G("BOSSES.orclord.actboss===1&&BOSSES.orclord.n==='半兽统领'"),'章节首领 半兽统领');
// ---------- 数值框架 ----------
ok(G('CQ_BAL.lvlCap')===60&&G('xpNeed(60)')<1e15&&G('xpNeed(60)')>G('xpNeed(59)'),'等级上限 60');
ok(G('cqEnhPct(9)')===54&&G('cqEnhPct(3)')===12&&G('cqEnhPct(6)')===30,'强化累计加成 12/30/54%');
ok(Math.abs(G('cqBudgetProduct()')-2.071)<0.01,'预算乘积（方案数值）= 2.07，需由 CQ_BAL.cap 截断到 1.8');
ok(G('cqCapMul(3)')===1.8&&G('cqCapMul(1.2)')===1.2,'总倍率截断 1.8');
T.done();
