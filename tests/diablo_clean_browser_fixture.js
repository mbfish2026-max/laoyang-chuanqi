'use strict';
// Exercise the complete retired-field source in real browsers before load().
module.exports = require('./diablo_clean_save_fixture').replace('GS.clear();', `
S.reb=4;S.gold=12345;S.kp=2;S.sp=3;S.sockq=2;S.bon={res:25};
S.lp={old:1};S.rift={max:12};S.eg.rift={max:12};
S.eg.history={secret:{staff:3,runs:7,king:1},rift:{max:12},season:{id:2}};
S.merc={t:'mage',lvl:20,xp:123,eq:{}};
qaOldItems.forEach(it=>{it.lp='old_power';it.cqLegacy={allres:10,ll:2};it.cqOriginalName='暗金符文';});
S.eq.weapon.rf={n:23,k:'ll',off:[['ll',5,3,8]]};
qaOldPower=qaOldItems.map(it=>CQMir2Equip.legacyPower(it));
var qaPurgeSource=JSON.stringify(S);
GS.clear();`);
