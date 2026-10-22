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
 if(!mir2SkillsWire.petHook){const f=hitMon;hitMon=function(m,d,src,fx){return f.call(this,m,d,src&&typeof src==='object'&&src.owner==='hero'?'cqhero':src,fx)};mir2SkillsWire.petHook=true;}
 mir2SkillsMigrate(S);
}

// Learned hero shield reaches the protagonist at hero Lv39; no repeated additive bonus.
{const f=calc;calc=function(){if(S&&S.hero&&S.hero.lvl>=39&&S.hero.sk&&S.hero.sk.htsd){S.sk=S.sk||{};S.sk.htsd=Math.max(S.sk.htsd||0,1)}return f.apply(this,arguments)}}
