'use strict';
const T=require('./cq_harness')('diablo_clean_save'),{G,ok}=T;
ok(!T.loadErr.length,'all scripts loaded');
G(require('./diablo_clean_save_fixture'));
ok(G('!cqMigrationFailed'),'complete load migration succeeds');
G("localStorage.setItem('cq_qa_legacy','old-key-payload')");
ok(G("cqRead(localStorage,'cq-qa_legacy')==='old-key-payload'&&localStorage.getItem('cq-qa_legacy')==='old-key-payload'"),'cq_ localStorage key lazily copied without loss');
ok(G('GS.getItem("cq_save_v2")===GS.getItem("cq-save_v2")'),'cq_ old storage key reads canonical save');
ok(G('JSON.stringify([S.eq.weapon,S.eq.armor,...S.bag].filter(x=>!x.k).map(x=>x.uid).sort())===JSON.stringify([81001,81002,81003])'),'equipment count and every UID retained');
ok(G('[S.eq.weapon,S.eq.armor,...S.bag].filter(x=>!x.k).every(it=>power(it)>=qaOldPower[it.uid-81001])'),'each item power no lower than old score');
for(const el of ['fire','cold','light','magic','pois']){
 G(`H.life=100000;var qaHit=hurtHero(1000,'${el}',{lv:60,ar:100},false)`);
 ok(G('qaHit<=500'),'damage no greater than old combined 50% protection: '+el);
}
ok(G('S.eg.history.secret.staff===3&&S.eg.history.secret.runs===7&&S.eg.history.secret.king===1'),'secret progress archived');
ok(G('S.season.id===2&&S.season.active===1&&S.eg.season.id===2&&S.eg.season.active===1'),'both legacy season flags retained');
console.log('Migration metrics: '+G('JSON.stringify({uids:[S.eq.weapon,S.eq.armor,...S.bag].filter(x=>!x.k).map(x=>x.uid),oldPower:qaOldPower,newPower:[S.eq.weapon,S.eq.armor,...S.bag].filter(x=>!x.k).map(power)})'));
G("var qaPanel={innerHTML:''};document.querySelector=()=>qaPanel;renderHero();var qaHTML=qaPanel.innerHTML;qaHTML+=S.bag.map(it=>itemName(it)).join(' ')");
ok(G('!/暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer/i.test(qaHTML)'),'player rendered HTML has no retired vocabulary');
T.done();
