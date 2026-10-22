'use strict';
clsMir2Shared();clsMir2Zs();clsMir2Fs();clsMir2Ds();heroMir2Register();
// Load after m2_cq/sysapi/icons and cls_hero; no shared-file mutation required.
function mir2SkillsMigrate(s){
 if(!s||((s.mir2Mig||{}).skills||0)>=1)return s;
 const mats=Object.assign({},s.mats||{});
 for(const id of Object.keys(SKM))if(SKM[id].cls&&mats['book_'+id]!=null){
  const c=SKM[id].shared?(s.cls||'zs'):SKM[id].cls,k='book_'+c+'_'+id;
  mats[k]=(mats[k]||0)+mats['book_'+id];delete mats['book_'+id];
 }
 // Inventory material shells retain uid, count and lock state; counts naturally sum.
 const boxes=[s.bag,s.stash,s.migBox,...(s.pst||[])].filter(Array.isArray);
 const aliases={ds_jsl:'ds_jslzf',ds_yss:'ds_ysh',ds_ylyd:'ds_yld',ds_sszj:'ds_sszjs',ds_qtzy:'ds_qtzls'};
 for(const [old,id] of Object.entries(aliases)){const from='book_'+old,to='book_'+id;if(mats[from]!=null){mats[to]=(mats[to]||0)+mats[from];delete mats[from];}}
 const seen=new Set();for(const box of boxes)for(const it of box){if(!it||seen.has(it))continue;seen.add(it);if(it.k!=='mat')continue;const old=String(it.id||'').replace(/^book_/,'');if(aliases[old]){it.id='book_'+aliases[old];continue;}
 const m=/^book_([a-z]+)$/.exec(it.id||'');if(!m||!SKM[m[1]])continue;const sk=SKM[m[1]];it.id='book_'+(sk.shared?(s.cls||'zs'):sk.cls)+'_'+m[1];}
 s.mats=mats;s.mir2Mig=Object.assign({},s.mir2Mig,{skills:1});return s;
}
function mir2SkillsWire(){
 if(typeof document!=='undefined'&&!window.__NOUI&&!document.getElementById('mir2-skill-touch')){const el=document.createElement('style');el.id='mir2-skill-touch';el.textContent='#panel .sk2 .cqbtn,#panel .hppage .hptoggle,#panel .hppage .hpskill .cqbtn{min-height:44px;min-width:44px;white-space:nowrap}#panel .ord{display:grid;grid-template-columns:20px 24px minmax(0,1fr) 44px 44px 44px;gap:4px;align-items:center}#panel .ord .no{grid-column:1;grid-row:1/3}#panel .ord img{grid-column:2;grid-row:1}#panel .ord b{grid-column:3;grid-row:1;min-width:0}#panel .ord .c{grid-column:2/4;grid-row:2;white-space:normal;overflow:visible;line-height:1.4}#panel .ord .ar{grid-row:1/3;min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center}#panel .ord .ar:nth-of-type(2){grid-column:4}#panel .ord .ar:nth-of-type(3){grid-column:5}#panel .ord .sw{grid-column:6;grid-row:1/3;justify-self:center}#panel .ord .sw::before{content:"";position:absolute;inset:-12px -3px}';document.head.appendChild(el);}

 for(const c of ['zs','fs','ds'])for(const b of clsBookList(c)){
  CQSys.bookDef(b.bookId,{sk:b.sk,n:b.n,cls:c,lv:SKM[b.sk].r,heroOnly:!!SKM[b.sk].heroOnly});
 }
 if(typeof CQ_ICONS!=='undefined')for(const s of CLS_SKILLS.filter(s=>s.mir2)){if(!CQ_ICONS.books.includes(s.id))CQ_ICONS.books.push(s.id)};
 if(typeof CQ_ICONS!=='undefined'&&!CQ_ICONS.mir2){const old=CQ_ICONS.matIcon;const mat=k=>{const m=/^book_(?:(?:zs|fs|ds)_)?([a-z]+)$/.exec(k||'');return m&&SKM[m[1]]&&SKM[m[1]].mir2?'assets/cq/icon/book_'+m[1]+'.png':old(k)};CQ_ICONS.matIcon=mat;CQSys.matIcon=mat;const item=CQ_ICONS.itemUrl;CQ_ICONS.itemUrl=it=>it&&it.k==='mat'?mat(it.id):item(it);CQSys.itemIcon=CQ_ICONS.itemUrl;if(typeof icon2Url==='function'){const prev=icon2Url;icon2Url=it=>CQ_ICONS.itemUrl(it)||prev(it);}CQ_ICONS.mir2=true;}
 if(window.CQ&&Array.isArray(CQ.SKILL_FX)&&!mir2SkillsWire.fxHook){CLS_CQFX=0;clsCqFx();mir2SkillsWire.fxHook=true;}
 for(const s of CLS_SKILLS.filter(s=>s.mir2))if(s.cd)window.CQ_SKCD[s.id]=s.cd;
 if(window.CQ){CQ.SK_ICON=CQ.SK_ICON||{};for(const s of CLS_SKILLS.filter(s=>s.mir2))CQ.SK_ICON[s.id]='assets/cq/icon/sk_'+s.id+'.png';}
 if(mir2SkillsWire.petHook!==hitMon){const f=hitMon;hitMon=function(m,d,src,fx){return f.call(this,m,d,src&&typeof src==='object'&&src.owner==='hero'?'cqhero':src,fx)};if(f._cq)hitMon._cq=f._cq;mir2SkillsWire.petHook=hitMon;}
 mir2SkillsMigrate(S);
 for(const id of ['ds_jsl','ds_yss','ds_ylyd','ds_sszj','ds_qtzy']){delete CQ_BOOKS[id];delete MATS['book_'+id];}
}

// Learned hero shield reaches the protagonist at hero Lv39; no repeated additive bonus.
{const f=calc;calc=function(){if(S&&S.hero&&S.hero.lvl>=39&&S.hero.sk&&S.hero.sk.htsd){S.sk=S.sk||{};S.sk.htsd=Math.max(S.sk.htsd||0,1)}return f.apply(this,arguments)}}

// R04: build choice changes priorities and adds synergy; learning remains book-only.
const MIR2_STREAMS={
 zs:[['烈火单体',['lhjf','gsjs','csjs','ymcz'],['jbjs','gsjs'],'剑术协同烈火，优先爆发'],['半月群刷',['bywd','csjs','ymcz','lhjf'],['csjs'],'刺杀协同半月，优先群刷'],['刺杀冲撞',['csjs','ymcz','gsjs','lhjf'],['gsjs'],'攻杀协同刺杀，冲撞控制']],
 fs:[['雷电爆发',['ldsh','dylg','bpx','mfd'],['hqs','dhq','jgdy'],'火球、疾光协同雷电'],['火墙控场',['hq','blhy','dyh','kjhh'],['dyh','blhy'],'地狱火、爆裂协同火墙'],['宝宝流',['yhzg','mfd','sys','sxyd'],['sys','mfd'],'圣言、魔法盾协同宝宝']],
 ds:[['狗道',['zhss','sszjs','yld','qtzls'],['sszjs','yld','qtzls'],'护持技能协同神兽'],['毒符',['sds','lhhf','ysh','kmz'],['sds','kmz'],'施毒、困魔协同火符'],['骷髅辅助',['zhkl','zhss','xlqs','zys'],['jslzf','xlqs','zys'],'启示、治疗协同骷髅，可与神兽同场']]
};
function mir2Stream(){return MIR2_STREAMS[curCls()][Number.isInteger(S.stream)&&S.stream>=0&&S.stream<3?S.stream:0]}
function mir2StreamChoose(i){if(!Number.isInteger(i)||i<0||i>2)return false;S.stream=i;const ids=mir2Stream()[1],a=acState();a.order=[...ids,...a.order.filter(id=>!ids.includes(id))];for(const id of ids)a.cfg[id]=Object.assign({},a.cfg[id],{on:1,mode:'smart'});S.battleSkills=ids.slice();S.battleSkillsCls=curCls();save();calc();render();return true}
CQSys.streamChoose=mir2StreamChoose;
{const f=clsSV;clsSV=function(id,L){const v=f(id,L),b=mir2Stream();if(id!==b[1][0])return v;const k=1+b[2].reduce((n,x)=>n+bl(x),0)*.02;
 const out=Object.assign({},v);for(const key of ['pct','flat','dps','hp','k'])if(out[key])out[key]*=k;for(const key of ['dmg','pd'])if(out[key])out[key]=out[key].map(n=>Math.round(n*k));if(k>1)out.txt+='；流派协同 +'+Math.round((k-1)*100)+'%';return out}}
{const f=clsEst;clsEst=function(s,ms){return f(s,ms)*(mir2Stream()[1].includes(s.id)?1.35:1)}}
// The build's ordered attacks take priority when ready, while existing healing/buffs
// still run first. Ineligible spells (cooldown, mana, active DOT) never block fallback.
{const f=acSmart;acSmart=function(id,ms){if(S.stream==null)return f(id,ms);const b=mir2Stream(),s=SKM[id];if(!s||!CLS_SINGLE.has(s.ty)&&!CLS_AOE.has(s.ty))return f(id,ms);
 const chosen=acState().order.filter(x=>b[1].includes(x)).find(x=>{const sk=SKM[x];return sk&&(CLS_SINGLE.has(sk.ty)||CLS_AOE.has(sk.ty))&&bl(x)&&acCfg(x).on&&acFeasible(x,ms)&&(ms.length>=sk.sm||ms.some(m=>m.boss)||!CLS_AOE.has(sk.ty))});return chosen?id===chosen:f(id,ms)}}

{const f=acFeasible;acFeasible=function(id,ms){if(curCls()==='ds'&&S.stream===2&&['zhkl','zhss'].includes(id))return castable(id)&&clsCdLeft(id)<=0&&clsPetN(id)<1;return f(id,ms)}}
// Fire wall scales with learned support and magic damage, and refreshes only on expiry.
SKM.hq.v=(L,sy)=>{const dps=Math.round((8+L*3)*sy*(1+(ST.sdmg||0)/100));return{dps,bdur:4+L/3,n:5,txt:`火墙：最多5个目标每秒 ${dps} 火焰伤害，持续 ${(4+L/3).toFixed(1)} 秒`}};
SYN.hq=[['dyh','blhy'],3];SYN.ldsh=[['hqs','dhq','jgdy'],5];SYN.lhhf=[['sds','kmz'],3];
// Older 1.76 defensive skills belong in the hero whitelist as well.
for(const [c,ids] of Object.entries({fs:['mfd'],ds:['ysh']}))for(const id of ids)if(!HERO_SK[c].includes(id))HERO_SK[c].push(id);
{const f=render;render=function(){const out=f.apply(this,arguments),p=document.querySelector('#panel');if(TAB==='skill'&&p&&!p.querySelector('.mir2-streams')){const box=document.createElement('div');box.className='cqpanel mir2-streams';box.innerHTML='<div class="cqttl">流派选择</div><div style="display:flex;gap:4px">'+MIR2_STREAMS[curCls()].map((b,i)=>`<button class="cqbtn ${i===(S.stream||0)?'gold':''}" style="flex:1;min-width:0;min-height:44px;white-space:nowrap" onclick="CQSys.streamChoose(${i})">${b[0]}</button>`).join('')+'</div><p class="dim">'+mir2Stream()[3]+'。选择后配置四格和自动顺序；技能仍需技能书学习，可继续手动调整。</p>';p.prepend(box)}return out}}
// 1.76 support spells have party effects as well as the protagonist's buff.
function mir2PetGuard(dmg,el){const armor=buffOn('sszjs'),ghost=buffOn('yld'),hide=buffOn('jtys');
 if(hide&&rnd()*100<(hide.dodge||0))return 0;
 const b=el&&el!=='phys'?ghost:armor;return Math.max(0,dmg*(1-Math.min(75,b?(b.res||b.def||0):0)/100))}
{const f=CLS_TY.debuff;CLS_TY.debuff=function(s,v,ms){if(s.id==='kmz')ms=ms.filter(m=>!m.boss&&!m.uniq&&!m.champ&&!m.fl&&m.lv<=combatLevel()+1);const out=f.call(this,s,v,ms);if(s.id==='xlqs')for(const m of out)m.revealedUntil=GT+v.dur;return out}}
{const f=acFeasible;acFeasible=function(id,ms){if(id==='kmz'&&!ms.some(m=>!m.boss&&!m.uniq&&!m.champ&&!m.fl&&m.lv<=combatLevel()+1))return false;return f(id,ms)}}
// Instant movement stays in the current map; never resets monsters or the boss.
{const f=typeof clsAfterCast==='function'?clsAfterCast:null;window.clsAfterCast=function(s,v,ms,out){if(f)f.apply(this,arguments);if(s.id!=='sxyd'||!window.CQ||!CQ.Scene||!CQ.MOVE)return;const grid=CQ.Scene.grid();if(!grid)return;const occupied=new Set([grid.b.roleIdx,...grid.b.mons.filter(m=>!m.dead).map(m=>m.idx),...(grid.b._pets||[]).filter(a=>a.hp>0).map(a=>a.idx)]);const cells=Array.from({length:CQ.MOVE.N},(_,i)=>i).filter(i=>!occupied.has(i));if(cells.length)grid.b.roleIdx=cells[Math.floor(rnd()*cells.length)]}}
SKM.sxyd.v=L=>({dodge:15+L*2,dur:12+L,txt:'瞬息移动：移到当前战场空格，闪避提高 '+(15+L*2)+'%，持续 '+(12+L)+' 秒'});
