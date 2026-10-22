// 地图异变：UTC 现实整点窗口，确定性抽签，刷新/离线不补发过期奖励。
(function(){
'use strict';
const HOUR=3600000,DURATION=600000;
const rules={blood:{name:'血月降临',hours:2,chance:.30,icon:'☾',desc:'掉落×2 · 怪伤+30%'},corpse:{name:'尸王潮',hours:3,chance:.25,icon:'☠',desc:'每波×1.5 · 第5波尸王'},pig:{name:'财神猪',hours:1,chance:.10,icon:'◆',desc:'60秒追击 · 金币与极品宝箱'}};
function eligible(k,z){return k==='corpse'?/骷髅洞|尸王殿|石墓/.test(z.n):k==='pig'?!z.dun: true}
function roll(k,slot){let x=(slot^({blood:173,corpse:937,pig:2027}[k]))>>>0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return((x^(x>>>16))>>>0)/4294967296}
function state(){return S.mutation||(S.mutation={checked:{}})}
function current(t=Date.now()){
 if(!S||typeof EGM!=='undefined'&&EGM)return null;
 const s=state();s.checked=s.checked||{};
 if(s.active&&t>=s.active.end)delete s.active;
 for(const k of Object.keys(rules)){
  const r=rules[k],slot=Math.floor(t/(r.hours*HOUR)),start=slot*r.hours*HOUR;
  if(s.checked[k]===slot)continue;s.checked[k]=slot;
  if(!s.active&&t<start+DURATION&&eligible(k,zoneData())&&roll(k,slot)<r.chance)s.active={k,start,end:start+DURATION,a:S.act,z:S.zone,d:S.diff,waves:0,pigDone:false};
 }
 const a=s.active;return a&&a.a===S.act&&a.z===S.zone&&a.d===S.diff&&eligible(a.k,zoneData())?a:null;
}
function sync(t=Date.now()){
 const a=current(t);
 for(const m of MON){
  const blood=!!a&&a.k==='blood'&&!m.mutationPig;
  if(blood&&!m.mutationBlood){m.dmg=m.dmg.map(v=>v*1.3);m.mutationBlood=1}
  if(!blood&&m.mutationBlood){m.dmg=m.dmg.map(v=>v/1.3);delete m.mutationBlood}
  if(m.mutationPig){m.t=1e9;if(!a||a.k!=='pig'||t>=m.escapeAt){m.hp=0;m.fade=0;m.mutationEscaped=true;if(a){a.pigDone=true;a.pigOutcome='已逃走';}}}
 }
 if(a&&a.k==='pig'&&!a.pigDone){a.pigDone=true;const m=mkMon(zoneData().mons[0],zoneData().ml);Object.assign(m,{n:'财神猪·极品宝箱',ic:'🐖',boss:false,actboss:false,fl:'',mutationPig:true,mutationMoveAt:t+5000,exp:0,t:1e9,escapeAt:Math.min(a.end,t+60000),dmg:[0,0]});MON.push(m);a.pigUid=m.uid;}
 return a;
}
{const f=spawnWave;spawnWave=function(){const a=current(),before=new Set(MON);const out=f.apply(this,arguments);if(a&&a.k==='corpse'){const wave=MON.filter(m=>!before.has(m)&&!m.boss&&!m.mutationPig);for(let i=0;i<Math.ceil(wave.length/2);i++)MON.push(mkMon(wave[i%wave.length].key,zoneData().ml));a.waves++;if(a.waves%5===0){const m=mkMon('zombieking',zoneData().ml);m.n='异变·尸王';m.mutationCorpse=true;MON.unshift(m)}}sync();return out}}
{const f=rollTC;rollTC=function(m){const a=current();if(m.mutationPig){if(m.mutationPaid||Date.now()>=m.escapeAt)return [];m.mutationPaid=true;if(a)a.pigOutcome='宝箱已领取';S.gold+=Math.max(10000,m.lv*2000);if(typeof cqInc==='function')cqInc(Math.max(10000,m.lv*2000));const treasure=genItem(m.lv,{q:4});treasure.mutationChest=true;return [treasure]}
 const out=f.apply(this,arguments)||[];if(a&&a.k==='blood')out.push(...(f.apply(this,arguments)||[]));if(m.mutationCorpse&&!out.some(it=>it&&!it.k&&it.q>=4))out.push(genItem(m.lv,{q:4}));return out}}
{const f=step;step=function(dt){sync();return f.apply(this,arguments)}}
let shown='';
function paint(){if(window.__NOUI)return;const host=document.getElementById('fbattle');if(!host)return;const a=current(),key=a?a.k+':'+a.start:'';host.dataset.mutation=a?a.k:'';
 let el=document.getElementById('cqMutation');if(!el){el=document.createElement('div');el.id='cqMutation';el.setAttribute('role','status');host.appendChild(el)}
 el.hidden=!a;if(a){const r=rules[a.k],sec=Math.ceil((a.end-Date.now())/1000),pig=MON.find(m=>m.mutationPig&&m.hp>0);el.textContent=`${r.icon} ${r.name} ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')} ｜ ${r.desc}${pig?' · 逃跑'+Math.max(0,Math.ceil((pig.escapeAt-Date.now())/1000))+'秒':a.pigOutcome?' · '+a.pigOutcome:''}`;}
 if(key!==shown){shown=key;host.classList.remove('mutation-enter');if(a){void host.offsetWidth;host.classList.add('mutation-enter');setTimeout(()=>host.classList.remove('mutation-enter'),700)}}
}
{const f=renderFight;renderFight=function(){const r=f.apply(this,arguments);paint();return r}}
window.CQMutation={rules,current,sync,roll,eligible,paint};
})();
