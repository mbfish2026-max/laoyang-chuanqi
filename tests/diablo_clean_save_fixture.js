'use strict';
// Shared by the VM and real-browser save/load tests; no product mutation.
module.exports = `load();CQSys.createChar('旧档验收','zs');S.lvl=60;S.auto=0;S.autoEq=0;S.sv=0;
S.eq={};S.bag=[];S.pst=[[]];
['swd1','arm1','rin'].forEach((id,i)=>{var it=makeBase(BASEM[id],60);it.uid=81001+i;it.q=5;it.name='暗金符文旧装备';it.m={allres:25,ll:7,edmg:30,edef:20};it.sock=3;it.soc=['r01'];it.rw=1;if(i===0)S.eq.weapon=it;else if(i===1)S.eq.armor=it;else S.bag.push(it)});
S.eg=S.eg||{};delete S.eg.metaArchiveV1;S.eg.secret={staff:3,runs:7,king:1};S.season={id:2,active:1};S.eg.season={id:2,active:1};
var qaOldItems=[S.eq.weapon,S.eq.armor,...S.bag];var qaOldPower=qaOldItems.map(it=>CQMir2Equip.legacyPower(it));
GS.clear();GS.setItem('cq_save_v2',JSON.stringify(S));load();S.auto=0;calc();`;
