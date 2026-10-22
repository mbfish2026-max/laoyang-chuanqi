// cq/icons_cq.js：技能书/装备底材/UI 杂项图标路径全部真实存在，查找优先新图、无图回退。node tests/cq_icons_test.js
const fs=require('fs'),path=require('path');const T=require('./cq_harness')('cq_icons_test');const{G,ok}=T;const root=path.join(__dirname,'..');
G(fs.readFileSync(path.join(root,'cq/mir2_skills.js'),'utf8'));
G("S=newSave();load();CQSys.createChar('图标集成','fs');mir2SkillsWire()");
const I=JSON.parse(G('JSON.stringify({books:CQ_ICONS.books,eqs:CQ_ICONS.eqs,ui:CQ_ICONS.ui})'));
const paths=[...I.books.map(b=>'assets/cq/icon/book_'+b+'.png'),...I.eqs.map(e=>'assets/cq/icon/eq_'+e+'.png'),...Object.values(I.ui)];
for(const p of paths)ok(fs.existsSync(path.join(root,p)),'文件存在 '+p);
ok(I.books.length===45&&I.eqs.length===15,'45 本书 + 15 件底材');
for(const e of I.eqs)ok(G(`!!BASEM['${e}']`),'底材 id 存在于 BASEM: '+e);
// 反向：assets/cq/icon 下的 book_/eq_ 文件都被接入
for(const f of fs.readdirSync(path.join(root,'assets/cq/icon')).filter(f=>/^(book|eq)_.*\.png$/.test(f)))ok(paths.includes('assets/cq/icon/'+f),'已接入 '+f);
ok(G("CQ_ICONS.matIcon('book_gsjs')")==='assets/cq/icon/book_gsjs.png'&&G("CQ_ICONS.matIcon('book_zs_gsjs')")==='assets/cq/icon/book_gsjs.png','两种书键都映射到同一文件');
ok(G("CQ_ICONS.matIcon('book_nope')")===null&&G("CQ_ICONS.matIcon('heitie')")===null,'无图材料回退');
G(`S=newSave();load();S.cls='zs';clsInit();calc()`);
ok(G("icon2Url({uid:1,b:'axe1',q:3,m:{}})")==='assets/cq/icon/eq_axe1.png','装备优先 eq_<id>.png');
ok(G("icon2Url({uid:1,k:'mat',id:'book_fs_mfd',n:1})")==='assets/cq/icon/book_mfd.png','背包书材料用 book 图');
const other=G("Object.keys(BASEM).find(k=>!CQ_ICONS.eqs.includes(k))");ok(G(`(()=>{const it={uid:2,b:'${other}',q:3,m:{}};return icon2Url(it)!=='assets/cq/icon/eq_${other}.png'})()`),'无 eq 图的底材走原映射');
ok(/book_mfd\.png/.test(G("itemIcon({uid:3,k:'mat',id:'book_mfd',n:1})")),'itemIcon（书弹窗/掉落）用 book 图');
ok(G("CQSys.uiIcon('stamp_ok')")==='assets/ui/stamp_ok.png'&&G("CQSys.uiIcon('nope')")===null,'CQSys.uiIcon');
T.done();
