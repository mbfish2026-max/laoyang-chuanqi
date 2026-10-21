// 老羊传奇测试公共载入：按 index.html 顺序载入全部脚本（无 UI），返回 {G,ok,done}
const fs=require('fs'),vm=require('vm'),path=require('path');const root=path.join(__dirname,'..');
module.exports=function(name,opt){opt=opt||{};
 const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>'':k==='readyState'?'loading':stub(),apply:()=>stub(),construct:()=>stub(),set:()=>true});
 let _sd=Number(process.env.SEED||opt.seed||20261021)>>>0;const SMath=Object.create(Math);SMath.random=()=>{_sd=(_sd+0x6D2B79F5)>>>0;let t=_sd;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
 const store={};const ctx={console:{log(){},warn(){},error:console.error},Math:SMath,Date,JSON,setTimeout:()=>0,setInterval:()=>0,clearInterval(){},clearTimeout(){},requestAnimationFrame:()=>0,
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]},key:()=>null,length:0},document:stub(),Image:function(){return stub()},navigator:{},location:{search:''},addEventListener(){},performance:{now:()=>Date.now()},confirm:()=>true};
 ctx.window=ctx;vm.createContext(ctx);ctx.__NOUI=1;ctx.__NOSHOWLOGIN=1;
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^(cloud|login_flow|audio|power|ui_art|icon2|art2_|cq\/battle_mount)/.test(f));
 const loadErr=[];for(const f of files)try{vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f})}catch(e){loadErr.push(f+': '+e.message)}
 const G=s=>vm.runInContext(s,ctx);let pass=0,fail=0;const ok=(c,m)=>{if(c)pass++;else{fail++;console.log('  ✗ '+m)}};
 return{G,ok,loadErr,ctx,done(){console.log(`${name}: ${pass} pass, ${fail} fail`);process.exitCode=fail?1:0}}};
