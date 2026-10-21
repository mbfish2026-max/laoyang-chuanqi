'use strict';
// stashux.js — 个人/共享仓库：显眼「⇅ 自动整理」按钮（同背包样式）+「炼金匣」（仓库物品可作材料）
// 整理：sort.js 的 sortPages（品质→类型→等级→名称，锁定不变，从第 1 页起铺满）；共享仓库 acctSave + 云同步（clSyncSoon，同其他共享仓库事件）。
// 炼金匣：打开时把当前仓库物品临时并入背包供配方识别/消耗，每次配方或界面刷新后立即放回原页；产物留在背包，背包满则放回当前仓库。
autoSortStash=function(sh){const P=sh?ACCT.shared:S.pst;sortPages(P);if(sh){SHP=0;acctSave()}else STP=0;save();if(sh&&typeof clSyncSoon==='function')try{clSyncSoon()}catch(e){}
 if(!window.__NOUI){toast(sh?'共享仓库已整理':'个人仓库已整理');render()}return true};
// 仓库内炼金匣（stashCube/STCUBE）已删除（legacy_prune 批次2）
{const f=renderBag;renderBag=function(){f.apply(this,arguments);if(typeof document==='undefined'||window.__NOUI)return;const G=document.querySelector('#panel .stash2');if(!G)return;
 const sh=G.classList.contains('shared')?1:0;G.querySelectorAll('.sttools .sortbtn').forEach(b=>b.remove());
 if(!G.querySelector('.sortbar')){const h3=G.querySelector('h3');if(h3)h3.insertAdjacentHTML('afterend',`<div class="sortbar stsortbar"><button class="btn gold sortbtn" onclick="autoSortStash(${sh})">⇅ 自动整理</button></div>`)}}}
