// 召唤物接口：art 字段 + CQSys pet:spawn/hit/atk/die 事件（职业开发）
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.join(__dirname,'..');
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'' :k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
// 固定种子；通过正式角色工厂初始化章节状态，宠物接口测试原地挂机。
let _sd=Number(process.env.SEED||20261021)>>>0;const SMath=Object.create(Math);SMath.random=()=>{_sd=(_sd+0x6D2B79F5)>>>0;let t=_sd;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
const store={};const ctx={console:{log(){},warn(){},error:console.error},Math:SMath,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},MutationObserver:function(){return{observe(){},disconnect(){}}}};
ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of [...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_)/.test(f)))try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx)}catch(e){}
const G=s=>vm.runInContext(s,ctx);
let P=0,F=0;const ok=(c,n)=>{if(c)P++;else{F++;console.error(n)}};
G(`load();CQSys.createChar('召唤保全','ds');S.lvl=60;S.sk={zhss:16,zhkl:7};calc();clsCast('zhss',[]);CQSys.summonSync()`);
ok(G('S.summons.length===1&&ALLY[0].summonId===S.summons[0].id'),'技能连接存档');
G(`window.petId=S.summons[0].id;window.oldAtk=ALLY[0].dmg[0];window.oldDef=ALLY[0].def;window.collar={uid:S.uid++,b:BASES.find(b=>b.s==='amulet').id,mods:{maxdmg:100,def:100}};S.bag.push(collar)`);
// allMods uses affix array; override only the fixture item.
G(`window.am=allMods;allMods=function(it){return it===collar?{maxdmg:100,def:100}:am(it)};CQSys.summonEquipCollar(petId,collar.uid)`);
ok(G('ALLY[0].dmg[0]>oldAtk&&ALLY[0].def>oldDef'),'项圈攻防进入战斗');
G(`collar.lk=1`);ok(G('!!CQSys.summonRemove(petId).err&&S.summons.length===1'),'锁定拒绝移除');
G(`collar.lk=0;window.bf=bagFits;bagFits=()=>false`);ok(G('!!CQSys.summonRemove(petId).err&&S.summons[0].eq.collar===collar'),'满包保全');G('bagFits=bf');
G(`ALLY[0].hp=0;save()`);ok(G('S.summons[0].deadAt>0&&S.summons[0].eq.collar===collar'),'死亡保全项圈');
G(`S.summons[0].deadAt=Date.now()-61000;CQSys.summonRevive(petId)`);ok(G('ALLY.some(a=>a.summonId===petId&&a.hp>0)'),'复活投射');
G(`window.first=ACCT.cur;CQSys.createChar('另一角色','fs');switchChar(first);CQSys.summonSync()`);ok(G('S.summons[0].eq.collar.uid===collar.uid&&ALLY.some(a=>a.summonId===petId)'),'切角色恢复');
G(`resetRuntime();CQSys.summonSync()`);ok(G('ALLY.some(a=>a.summonId===petId)'),'清场重建');
G(`egEnter({name:'召唤短测',start(){ALLY=[]}})`);ok(G('ALLY.some(a=>a.summonId===petId)&&S.summons[0].eq.collar.uid===collar.uid'),'终局清场保留');
G(`egLeave(1);CQSys.createChar('双召唤','fs');S.lvl=60;S.sk={yhzg:7};calc();window.monkey=zoneData().mons[0];window.v=Object.assign(SV('yhzg',7),{p:100});for(let i=0;i<2;i++){let m=mkMon(monkey,1);m.lv=1;CLS_TY.charm(SKM.yhzg,v,[m])}CQSys.summonSync()`);
ok(G('S.summons.length===2&&ALLY.filter(a=>a.sub===\'yhzg\').length===2'),'七级双宝宝连接');
G(`ALLY.filter(a=>a.sub==='yhzg').forEach(a=>a.hp=0);save();S.summons.forEach(s=>s.deadAt=Date.now()-61000);CQSys.summonSync();let m=mkMon(monkey,1);m.lv=1;CLS_TY.charm(SKM.yhzg,v,[m]);CQSys.summonSync()`);
ok(G('S.summons.length===2&&ALLY.some(a=>a.hp>0)'),'诱惑死亡冷却后复用名额');
console.log(`mir2_summon_test: ${P} pass, ${F} fail`);process.exit(F?1:0);
