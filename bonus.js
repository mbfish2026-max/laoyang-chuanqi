'use strict';
// ===================================================================================
// bonus.js — 角色页底部「加成汇总」可折叠模块（运行时包装 renderHero，不改他人文件）
// 展示有效技能和套装来源，折叠偏好使用 cq-bonus_open。
const BX={key:'cq-bonus_open',sig:'',html:'',src:{}};
function bxOpen(){try{return cqRead(localStorage,BX.key)==='1'}catch(e){return false}}
function bxToggle(){const o=!bxOpen();try{localStorage.setItem(BX.key,o?'1':'0')}catch(e){}const el=document.querySelector('#panel .bonusx');if(el)el.outerHTML=bxCard()}
const bxEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
const bxCls=()=>typeof curCls==='function'?curCls():'nec';
// 技能类词缀：全部技能 / 系别 / 单技能 / 技能伤害
function bxKind(k){if(k==='allsk')return'all';if(/^t[012]sk$/.test(k)||/^tc_[a-z]+\d$/.test(k))return'tree';if(/^sk_/.test(k))return'one';if(/^skd_/.test(k))return'dmg';return null}
function bxKeyCls(k){if(/^t[012]sk$/.test(k))return'nec';let m;if((m=/^tc_([a-z]+)\d$/.exec(k)))return m[1];if((m=/^sk[d]?_(.+)$/.exec(k))){const s=typeof SKM!=='undefined'&&SKM[m[1]];return s?(s.cls||'nec'):null}return null}
function bxName(k){if(k==='allsk')return'所有技能';const t=MODT[k];if(t)return t.replace(/^\+\{v\}\s*/,'').replace(/\s*\+?\{v\}%?/,'').trim();const m=/^skd?_(.+)$/.exec(k);return m&&SKM[m[1]]?SKM[m[1]].n:k}
// 总值：取 calc 结果
function bxTotal(k){if(!ST)return 0;if(k==='allsk')return ST.allsk||0;if(/^t[012]sk$/.test(k))return ST[k]||0;if(/^sk_/.test(k))return ST[k]??((ST.M||{})[k]||0);
 if(/^skd_/.test(k)){const id=k.slice(4),N=ST.nb&&ST.nb.skd;return N&&N[id]!=null?N[id]:((ST.M||{})[k]||0)}return(ST.M||{})[k]||0}
// 来源：装备、套装档位
function bxSources(){const out=[];const mods=it=>{try{return allMods(it)}catch(e){return it.m||{}}};
 for(const s of SLOTS){const it=S.eq[s];if(it)out.push({n:itemName(it),c:itemColor(it),w:SLOTN[s]||s,m:mods(it)})}
 const sc=typeof setCount==='function'?setCount():{};for(const s in sc){const bo=SETS[s]&&SETS[s].bonus||{};for(const n in bo)if(sc[s]>=+n)out.push({n:`${SETS[s].n} ${n} 件`,c:'#6c6',w:'套装加成',m:bo[n]})}
 return out}
function bxSkillRows(){const src=bxSources(),keys=new Set(['allsk']);for(const x of src)for(const k in x.m)if(bxKind(k))keys.add(k);
 if(ST){for(let t=0;t<3;t++)if(ST['t'+t+'sk'])keys.add('t'+t+'sk');for(const k in ST.M||{})if(bxKind(k)&&ST.M[k])keys.add(k)}
 const c=bxCls(),rows=[];BX.src={};
 for(const k of keys){const by=src.filter(x=>typeof x.m[k]==='number'&&x.m[k]).map(x=>({n:x.n,c:x.c,w:x.w,v:x.m[k]})),sum=by.reduce((a,x)=>a+x.v,0),kc=bxKeyCls(k),off=!!kc&&kc!==c;
  const tot=off?sum:bxTotal(k);if(!tot&&!sum)continue;if(Math.round(tot-sum))by.push({n:'其他来源',c:'#aaa',w:'技能 / 套装等',v:Math.round((tot-sum)*10)/10});
  BX.src[k]=by;rows.push({k,kind:bxKind(k),n:bxName(k),v:tot,off,cnt:by.length})}
 const ord={all:0,tree:1,one:2,dmg:3};return rows.sort((a,b)=>ord[a.kind]-ord[b.kind]||a.off-b.off||b.v-a.v)}
function bxSrc(k){const by=BX.src[k]||[],dmg=bxKind(k)==='dmg';
 modal(`<div class="mtitle">来源 · ${bxEsc(bxName(k).replace(/（[^）]*）$/,''))}</div><div class="gp bxsrc">${by.length?by.map(x=>`<div class="bxr"><span><b style="color:${x.c}">${bxEsc(x.n)}</b><small class="dim">${bxEsc(x.w)}</small></span><b>${x.v>0?'+':''}${x.v}${dmg?'%':''}</b></div>`).join(''):'<div class="dim">无</div>'}
 <div class="btns c"><button class="btn" onclick="closeM()">关闭</button></div></div>`)}
// 套装
function bxSets(){const sc=typeof setCount==='function'?setCount():{},ks=Object.keys(sc);if(!ks.length)return'<div class="dim">未穿戴套装</div>';
 return ks.map(s=>{const S_=SETS[s];if(!S_)return'';const bo=S_.bonus||{},tiers=Object.keys(bo).map(Number).sort((a,b)=>a-b),mx=tiers[tiers.length-1]||0,n=sc[s];
  return`<div class="bxset"><div class="bxr"><b style="color:#6c6">${bxEsc(S_.n)}</b><b>${n}${mx?' / '+mx:''} 件</b></div>${tiers.map(t=>`<div class="bxtier ${n>=t?'on':''}"><i>${n>=t?'✔':'○'} ${t} 件</i><span>${bxEsc(modsTxt(bo[t]))}</span></div>`).join('')}</div>`}).join('')}
// 其他：流派
function bxOther(){const o=[];const b=typeof nbOn==='function'?nbOn():null;
 if(b){const B=NB.builds[b];o.push(`<div class="bxr"><span>流派 <b>${bxEsc(B.n)}</b><small class="dim">${bxEsc(B.pas||'')}</small></span></div>`)}
 return o.join('')}
function bxSig(){const e=SLOTS.map(s=>{const it=S.eq[s];return it?it.uid+':'+(it.lp||'')+':'+(it.soc||[]).length:''}).join(',');const ch=(S.bag||[]).filter(it=>typeof isCharm==='function'&&isCharm(it)).map(it=>it.uid).join(',');
 return[e,ch,S.build||'',S.cls||'',typeof EG_LPS!=='undefined'?[...EG_LPS].join(','):'',ST?ST.allsk:'',ST&&ST.pbr?ST.pbr.lv+'/'+ST.pbr.n:''].join('|')}
function bxBody(){const sig=bxSig();if(sig===BX.sig&&BX.html)return BX.html;
 const rows=bxSkillRows(),KN={all:'全部技能',tree:'技能树 / 系别',one:'单个技能',dmg:'技能伤害'};let sk='',last='';
 for(const r of rows){if(r.kind!==last){last=r.kind;sk+=`<div class="bxsub">${KN[r.kind]}</div>`}
  sk+=`<div class="bxr bxsk ${r.off?'off':''}" onclick="bxSrc('${r.k}')"><span>${bxEsc(r.n)}${r.off?'<small class="dim">非本职业，不生效</small>':''}</span><b>${r.v>0?'+':''}${r.v}${r.kind==='dmg'?'%':''} <small class="dim">${r.cnt}项 ›</small></b></div>`}
 const ot=bxOther();
 BX.html=`<div class="bxsec"><h4>技能加成 <small class="dim">点一行看来源</small></h4>${sk||'<div class="dim">无</div>'}</div><div class="bxsec"><h4>套装</h4>${bxSets()}</div>${ot?`<div class="bxsec"><h4>其他</h4>${ot}</div>`:''}`;BX.sig=sig;return BX.html}
function bxCard(){const o=bxOpen();let body='';if(o)try{body=bxBody()}catch(e){console.warn('bonus',e);body='<div class="dim">加成数据暂不可用</div>'}
 return`<div class="gp bonusx ${o?'open':''}"><h3 class="bxh" onclick="bxToggle()"><span>加成汇总</span><small class="dim">${o?'收起 ▴':'展开 ▾'}</small></h3>${o?`<div class="bxbody">${body}</div>`:''}</div>`}
{const f=renderHero;renderHero=function(...a){const r=f.apply(this,a);if(window.__NOUI)return r;try{const P=document.getElementById('panel');if(P&&!P.querySelector('.bonusx'))P.insertAdjacentHTML('beforeend',bxCard())}catch(e){console.warn('bonus',e)}return r}}
