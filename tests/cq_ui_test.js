// M1 补充：D2 残留关停 / 云报错中文化 / beacon catch / 命名：node tests/cq_ui_test.js
const fs=require('fs'),vm=require('vm');
const T=require('./cq_harness')('cq_ui_test');const{G,ok}=T;
ok(!T.loadErr.some(e=>e.startsWith('cq/')),'cq/ 脚本载入无错 '+T.loadErr.join(';'));
G(`S=newSave();load();S.lvl=20;calc()`);
const b0=G('S.bag.filter(x=>x.k==="rune"||x.k==="gem").length'),o0=G('matCount("heitie")');
G(`addBag({uid:S.uid++,k:'rune',r:9});addBag({uid:S.uid++,k:'gem',g:'rub',lv:2});addBag(rollRune(30))`);
ok(G('S.bag.filter(x=>x.k==="rune"||x.k==="gem").length')===b0,'直接造出的符文/宝石不进背包');
ok(G('matCount("heitie")')-o0>=3,'符文/宝石入包时换成黑铁矿');
ok(!G(`Object.values(QUESTS).some(q=>/符文|宝石/.test(q.rw||''))`),'任务奖励文字无符文/宝石');
ok(!G(`Object.values(TCS).some(t=>t&&t.runes)`),'掉落表不再带符文');
let nm='';for(let i=0;i<400&&!/之/.test(nm);i++){const it=G('JSON.stringify(genItem(10,{q:3}))');const o=JSON.parse(it);nm=o.name||''}
ok(/^[^之]+之/.test(nm)&&!/^之/.test(nm),'后缀名为「X之…」：'+nm);
ok(fs.existsSync(__dirname+'/../cq/ui_cq.js')&&/SKT=3/.test(fs.readFileSync(__dirname+'/../cq/ui_cq.js','utf8')),'界面清理脚本存在');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
ok(/cq\/balance\.js/.test(html)&&html.indexOf('cq/balance.js')<html.indexOf('"stash.js'),'index.html 在 stash.js 前引入 cq/balance.js');
ok(/cq\/ui_cq\.css/.test(html)&&/cq\/ui_cq\.js/.test(html),'index.html 引入 ui_cq');
const cl=fs.readFileSync(__dirname+'/../cloud.js','utf8');
ok(/keepalive:true[^]*?body\}\)\.catch\(/.test(cl),'clBeacon fetch keepalive 带 .catch');
const fe=cl.match(/function clFriendlyErr[^\n]*/)[0];const c={console:{warn(){}}};vm.createContext(c);vm.runInContext(fe,c);
const t1=vm.runInContext(`clFriendlyErr({message:"Could not find the table 'public.cq_saves' in the schema cache"})`,c);
ok(/[\u4e00-\u9fa5]/.test(t1)&&!/schema/.test(t1),'云表缺失 → 中文提示：'+t1);
ok(!/[a-z]{4}/i.test(vm.runInContext(`clFriendlyErr({message:'Something weird happened'})`,c)),'未知英文报错不外露');
ok(/^[\u4e00-\u9fa5]/.test(vm.runInContext(`clFriendlyErr({message:'JWT expired'})`,c)),'JWT 失效中文');
const css=fs.readFileSync(__dirname+'/../cq/ui_cq.css','utf8');
ok(/flex-wrap:nowrap/.test(css)&&/font-size:11px/.test(css),'nowrap + 11px 规则');
T.done();
