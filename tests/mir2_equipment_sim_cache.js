'use strict';
// Simulation only: cache pure item power, retaining the locked-ring contextual result.
module.exports=`(function(){
const original=power,cache=new WeakMap();window.__mir2UncachedPower=original;
power=function(it){
 if(!it||it.k)return original(it);
 if(typeof LK!=='undefined'&&LK.inAuto&&isLk(it)&&(it===S.eq.ring1||it===S.eq.ring2))return original(it);
 const signature=JSON.stringify([it.b,it.m,it.cqLegacy,it.dmg,it.def,it.en,it.anc,it.cqVersion,it.cqMigrated,it.cqBest,it.cqBonus,curCls()]);
 const prior=cache.get(it);if(prior&&prior.signature===signature)return prior.value;
 const value=original(it);if(Number.isFinite(value))cache.set(it,{signature,value});return value;
};
})();`;
