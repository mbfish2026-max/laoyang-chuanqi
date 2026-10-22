'use strict';
// Local simulated server. Absolute high-water timestamps make rollback/reload idempotent.
(function(){
const STEP=600000,HOUR=3600000;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
function catalog(){return [...UNIQUES,...SETITEMS].filter(x=>x.id&&BASEM[x.b]).map(x=>{const b=BASEM[x.b],lv=x.rq||x.lv||b.q||1;return{id:x.id,n:x.n,chapter:Math.min(7,Math.max(1,Math.ceil(lv/9))),hours:x.n==='屠龙'?40:Math.max(1,lv*0.7),span:x.n==='屠龙'?50:Math.max(2,lv*0.6)}})}
function state(now=Date.now()){if(!S.cqFirstdrop){S.cqFirstdrop={v:1,start:now,high:now,tick:0,notice:0,owners:{},titles:{},players:Array.from({length:120},(_,i)=>({id:'npc'+i,name:['龙城','孤月','烈火','清风','赤霄','天涯','无双','星河'][i%8]+['刀客','剑影','行者','战魂','追风'][Math.floor(i/8)%5]+(Math.floor(i/40)+1),cls:['zs','fs','ds'][i%3],lv:1,power:20,count:0,online:[i%24,(i%24+8)%24]}))}}return S.cqFirstdrop}
function announce(d,msg,now,full){if(d.notice&&now-d.notice<60000)return;d.notice=now;if(typeof log==='function')log('<b class="cqfd-gold">'+esc(msg)+'</b>');if(full&&typeof document!=='undefined'){const e=document.createElement('div');e.className='cqfd-flash';e.textContent=msg;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}}
function advance(now=Date.now()){const d=state(now);d.high=Math.max(d.high,now);const tick=Math.floor((d.high-d.start)/STEP);if(tick<=d.tick)return d;d.tick=tick;
 // Closed-form deterministic catch-up: cost is bounded even after years offline.
 for(const p of d.players){const h=tick/6,pace=0.86+(hash(p.id)%25)/100;const active=0.9+(hash(p.id+'online')%11)/100;p.lv=Math.min(60,Math.floor(1+59*Math.pow(Math.min(1,h*pace*active/72),0.55)));p.power=Math.round(20+p.lv*p.lv*(2+(hash(p.id)%100)/100));p.count=0}
 let latest=null;for(const x of catalog()){const due=d.start+(x.hours+hash(x.id)%10000/10000*x.span)*HOUR;if(!d.owners[x.id]&&due<=d.high){const p=d.players[hash(x.id+'owner')%120];d.owners[x.id]={who:p.id,name:p.name,at:due};latest=x}const owner=d.owners[x.id];if(owner&&owner.who!=='self'){const p=d.players.find(p=>p.id===owner.who);if(p)p.count++}}
 if(latest){const o=d.owners[latest.id];announce(d,`恭喜【${o.name}】获得【${latest.n}】，夺得首爆`,d.high,false)}return d}
function dropped(it,now=Date.now()){if(!it||it.k||it.q<5)return false;const x=catalog().find(x=>x.id===it.cqContentId);if(!x)return false;const d=advance(now);if(d.owners[x.id])return false;d.owners[x.id]={who:'self',name:S.name||'少侠',at:d.high};d.titles[x.id]='首爆·'+x.n;d.active=x.id;addMat('ckq',1);calc();announce(d,`恭喜【${S.name||'少侠'}】夺得【${x.n}】首爆！称号与扩仓券已发放`,d.high,true);save();return true}
function bonus(){return S&&S.cqFirstdrop?Math.min(CQ_BAL.budget.title,Object.keys(S.cqFirstdrop.titles).length*0.01):0}
function ranks(kind='lv'){const d=advance(),me={id:'self',name:S.name||'少侠',lv:S.lvl,power:typeof CQSys.power==='function'?CQSys.power():Object.values(S.eq||{}).filter(Boolean).reduce((n,it)=>n+power(it),S.lvl*20),count:Object.values(d.owners).filter(x=>x.who==='self').length};const key=kind==='drop'?'count':kind==='power'?'power':'lv';return[...d.players,me].sort((a,b)=>b[key]-a[key]||a.id.localeCompare(b.id))}
function ui(tab='lv'){const d=advance(),rows=ranks(tab),mine=rows.findIndex(x=>x.id==='self')+1;modal(`<section class="cqfd"><div class="mtitle">龙城风云榜 <button onclick="closeM()">关闭</button></div><p>单机模拟 · 120 位侠客 · 每10分钟更新</p><nav>${[['lv','等级榜'],['power','战力榜'],['drop','首爆榜']].map(([id,n])=>`<button class="${id===tab?'on':''}" onclick="CQFirstdrop.ui('${id}')">${n}</button>`).join('')}</nav><p class="cqfd-gold">我的排名 ${mine} · 首爆称号 +${Math.round(bonus()*100)}% 全属性</p><p class="cqfd-gold">${d.active?esc(d.titles[d.active]):'尚未获得首爆称号'}</p><div class="cqfd-list">${rows.map((p,i)=>`<div class="${p.id==='self'?'cqfd-me':''}"><span>${i+1}　${esc(p.name)}</span><b>${tab==='drop'?p.count+' 件':tab==='power'?p.power:'Lv.'+p.lv}</b></div>`).join('')}</div><h3>首爆图鉴</h3><p>抢先获得装备：称号 +1%（合计最多5%）及扩仓券 ×1。称号永久生效。</p><div class="cqfd-book">${Array.from({length:7},(_,i)=>`<h4>第 ${i+1} 章</h4>${catalog().filter(x=>x.chapter===i+1).map(x=>{const o=d.owners[x.id];return`<div><b>${esc(x.n)}</b><small>${o?esc(o.name)+' · '+new Date(o.at).toLocaleString('zh-CN'):'尚无首爆'}</small></div>`}).join('')}`).join('')}</div></section>`)}
window.CQFirstdrop={state,advance,dropped,bonus,ranks,catalog,ui};
// Observe finalized monster loot, including offline rolls; shops/previews never award.
{const f=rollTC;rollTC=function(){const out=f.apply(this,arguments)||[];for(const it of out)dropped(it);return out}}
{const f=calc;calc=function(){const r=f.apply(this,arguments),b=bonus();if(b)for(const k of ['wmin','wmax','def','mdef','life','mana','mag','tao','ar','dodge'])if(typeof ST[k]==='number')ST[k]=Math.round(ST[k]*(1+b));return r}}
// Equipment magic guard is applied outside calc; add the title's share here.
{const f=hurtHero;hurtHero=function(value,el){const b=bonus();if(b&&['fire','cold','light','magic'].includes(el)){const r=CQMir2Equip.equipRanges(S.eq).mdef||[0,0];value=Math.max(1,value-R(Math.min(...r),Math.max(...r))*b)}const args=Array.from(arguments);args[0]=value;return f.apply(this,args)}}
{const f=elMul;elMul=function(el){return f.apply(this,arguments)*(el==='phys'?1:1+bonus())}}
{const f=CQSys.power;CQSys.power=function(){return Math.round(f.apply(this,arguments)*(1+bonus()))}}
{const f=step;step=function(){advance();return f.apply(this,arguments)}}
function entry(){if(window.__NOUI||TAB!=='map')return;const p=document.querySelector('#panel');if(p&&!p.querySelector('.cqfd-entry'))p.insertAdjacentHTML('afterbegin','<div class="cqfd-entry"><button onclick="CQFirstdrop.ui()">排行 · 首爆</button></div>')}
{const f=render;render=function(){const r=f.apply(this,arguments);entry();return r}}
function watch(){const p=document.querySelector('#panel');if(p)new MutationObserver(entry).observe(p,{childList:true});const m=document.querySelector('#modal');if(m)window.addEventListener('click',e=>{if(e.target===m&&m.querySelector('.cqfd'))closeM()},true);entry()}
if(!window.__NOUI){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch()}
})();
