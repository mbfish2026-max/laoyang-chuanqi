// 召唤物接口：art 字段 + CQSys pet:spawn/hit/atk/die 事件（职业开发）
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.join(__dirname,'..');
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'' :k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
const store={};const ctx={console:{log(){},warn(){},error:console.error},Math,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},MutationObserver:function(){return{observe(){},disconnect(){}}}};
ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');for(const f of [...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_)/.test(f)))try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx)}catch(e){}
const G=s=>vm.runInContext(s,ctx);
G(`S=newSave();S.cls='ds';S.ci=0;clsInit();calc();H.life=ST.life;window.EV=[];for(const e of['pet:spawn','pet:hit','pet:atk','pet:die'])CQSys.on(e,d=>EV.push([e,d]));S.lvl=20;S.sk={zhkl:5,zhss:16};calc();TAB='fight';MON=[];spawnT=0.1;S.auto=1`);
G(`clsCast('zhkl',[])`);const a1=G('ALLY[0].art');G(`clsCast('zhss',[])`);const a2=G('ALLY.map(a=>a.art).join()');
for(let i=0;i<4000;i++)G('step(0.05)');
const c=G(`(()=>{const o={};for(const[e]of EV)o[e]=(o[e]||0)+1;return JSON.stringify(o)})()`);
const dup=G(`(()=>{const s=new Set();for(const[e,d]of EV)if(e==='pet:die'){if(s.has(d.uid))return 1;s.add(d.uid)}return 0})()`);
G(`S.cls='fs';S.sk={yhzg:10};calc();MON=[mkMon(ACTS[0].zones[1].mons[0],1)];MON[0].lv=1;CLS_TY.charm(SKM.yhzg,Object.assign(SV('yhzg',10),{p:100}),MON)`);
let P=0,F=0;const ok=(c,n)=>{if(c)P++;else{F++;console.error('  ✗ '+n)}};
const E=JSON.parse(c);ok(a1==='pet_kl','骷髅 art');ok(a2==='pet_ss_gold','16 级金色神兽 art，骷髅被替换');
ok(E['pet:spawn']===2&&E['pet:die']===1,'spawn 2 / 重召 die 1');ok(E['pet:hit']>0&&E['pet:atk']>0,'受伤/攻击事件');ok(dup===0,'die 每只一次');
ok(G("ALLY.filter(a=>a.sub==='yhzg').map(a=>a.art).join()")===G('ACTS[0].zones[1].mons[0]'),'诱惑宝宝 art = 原怪 key');
console.log(`cls_pet_test: ${P} pass, ${F} fail`);process.exit(F?1:0);
