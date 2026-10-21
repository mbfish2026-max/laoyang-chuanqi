'use strict';
// cq/icons_cq.js — 美术图标接入（系统侧）。只认下面清单里真实存在的文件（tests/cq_icons_test.js 校验每条路径存在），其余回退原逻辑。
//  · 技能书 assets/cq/icon/book_<技能id>.png（70b5668）：材料键 book_<id> 或 职业开发 cls-book 的 book_<职业>_<id>（zs/fs/ds 前缀去掉后匹配）
//  · 装备底材 assets/cq/icon/eq_<底材id>.png（a396733）：优先于 icon2/ic_im 旧映射
//  · UI 杂项（d851afb，页面归战斗开发）：CQSys.uiIcon(key) 返回路径，供 pages_cq.js 取用
(function(){
const D='assets/cq/icon/';
const BOOKS=['bpx','bywd','csjs','dyh','gsjs','hqs','jbjs','kjhh','ldsh','lhhf','lhjf','mfd','sds','yhzg','ymcz','ysh','zhkl','zhss','zys'];
const EQS=['axe1','swd6','axe2','amu4','shd4','shd5','glv2','glv3','rin6','rin3','blt2','blt3','bot2','bot3','arm7'];
const UI_ICONS={hero_head_zs:'assets/cq/ui/hero_head_zs.png',hero_head_fs:'assets/cq/ui/hero_head_fs.png',hero_head_ds:'assets/cq/ui/hero_head_ds.png',prof_bar:'assets/ui/prof_bar_9s.png',prof_bar_fill:'assets/ui/prof_bar_fill_9s.png',sign_cell:'assets/ui/sign_cell_9s.png',stamp_ok:'assets/ui/stamp_ok.png'};
// 绝对地址：pages_cq.js 把它放进 CSS 变量 url()，变量在 cq/pages_cq.css 里使用时相对路径会按 cq/ 解析成 cq/assets/...（404）
function absUrl(p){try{const b=typeof document!=='undefined'&&document.baseURI;if(typeof b==='string'&&b)return new URL(p,b).href}catch(e){}return p}
const BS=new Set(BOOKS),ES=new Set(EQS);
// 材料键 → 技能 id：book_gsjs / book_zs_gsjs → gsjs
function bookId(key){const m=/^book_(?:(?:zs|fs|ds)_)?([a-z0-9]+)$/.exec(String(key||''));return m&&BS.has(m[1])?m[1]:null}
function matIcon(key){const id=bookId(key);return id?D+'book_'+id+'.png':null}
function eqIcon(it){return it&&!it.k&&ES.has(it.b)?D+'eq_'+it.b+'.png':null}
function itemUrl(it){if(!it)return null;if(it.k==='mat')return matIcon(it.id);return eqIcon(it)}
window.CQ_ICONS={dir:D,books:BOOKS,eqs:EQS,ui:UI_ICONS,bookId,matIcon,eqIcon,itemUrl};
if(typeof icon2Url==='function'){const f=icon2Url;icon2Url=function(it){return itemUrl(it)||f(it)}}else window.icon2Url=it=>itemUrl(it);// 未载入 icon2.js 时也提供（pages_cq.js 先调 icon2Url）
if(typeof itemIcon==='function'){const f=itemIcon;itemIcon=function(it){const u=itemUrl(it);return u?`<i class="ii art cqic" style="background-image:url(${u});background-size:contain;background-position:center;background-repeat:no-repeat"></i>`:f(it)}}
const CS=window.CQSys;if(CS){CS.itemIcon=it=>itemUrl(it);CS.matIcon=k=>matIcon(k);CS.uiIcon=k=>UI_ICONS[k]?absUrl(UI_ICONS[k]):null}
})();
