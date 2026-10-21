// audio_cq.js — 传奇原版采样层（占位）：在 audio.js 程序化合成之上，优先播放 assets/audio/cq/ 下的原 Cocos 传奇工程音频。
// 有采样的场景/事件用采样，缺的自动回落到 audio.js 合成音（地下城、首领战、血月、品质拾取、强化等）。
// 音量/静音沿用 S.audio（走 audio.js 的 musBus/sfxBus）；首次触摸解锁由 audio.js 负责，本层只在 ctx running 后解码播放。
// 注意：设计方案 §10 规定原拆包素材只做占位，正式上线前需替换为 AI 生成音频——替换时同名覆盖文件即可。
(function(){'use strict';
const B='assets/audio/cq/';
// 场景 → BGM（null = 无原版素材，用合成曲）
const BGM={login:'bgm_login',town:'bgm_town',field:'bgm_field',dungeon:null,boss:null,bloodmoon:null};
// 简单事件音效
const SFX={click:'ui_click',gold:'game_coin',level:'game_levelup',die:'game_die',zone:'game_exmap',pot:'game_usedrugs',equip:'ui_weapon',door:'bgsound_openDoor',attack:'skill/s999'};
// 技能：按元素/类型 → 1.76 技能音
const EL={phys:'skill/s1002',fire:'skill/s2001',light:'skill/s2002',cold:'skill/s2007',pois:'skill/s3004',magic:'skill/s3003'};
const KIND={summon:'skill/s3005',golem:'skill/s3005',buff:'skill/s3007',cbuff:'skill/s3007',warcry:'skill/s3007',wall:'skill/s2003',melee:'skill/s1004',heal:'skill/s3002',shield:'skill/s2005'};
const buf={},loading={};let bg=null,bgKey=null,want=null,last={};
function K(){return window.AUDIO_SK}
function ctx(){const k=K();const b=k&&k.bus&&k.bus();return b&&b.context}
function ok(){const c=ctx();return c&&c.state==='running'}
function load(n){if(buf[n]||loading[n])return;const c=ctx();if(!c)return;loading[n]=1;
 fetch(B+n+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(a=>new Promise((y,f)=>c.decodeAudioData(a,y,f))).then(b=>{buf[n]=b;if(want===n)startBgm(n)}).catch(()=>{buf[n]=false})}
function startBgm(n){const c=ctx(),k=K();if(!c||!k.mbus)return;stopBgm();const s=c.createBufferSource(),g=c.createGain();s.buffer=buf[n];s.loop=true;
 g.gain.setValueAtTime(0.0001,c.currentTime);g.gain.linearRampToValueAtTime(1.6,c.currentTime+1.5);s.connect(g);g.connect(k.mbus());s.start();bg={s,g};bgKey=n}
function stopBgm(){const c=ctx();if(!bg||!c)return;const o=bg;bg=null;bgKey=null;o.g.gain.cancelScheduledValues(c.currentTime);o.g.gain.setValueAtTime(o.g.gain.value,c.currentTime);o.g.gain.linearRampToValueAtTime(0.0001,c.currentTime+1.5);setTimeout(()=>{try{o.s.stop()}catch(e){}},1700)}
function loginOpen(){const m=document.querySelector('#modal:not(.hide) .mtitle');return!!(m&&/登录|选择角色|新建角色|创建角色/.test(m.textContent))}
function cqScene(s){if(loginOpen())return'login';if(s==='boss'||s==='uber')return'boss';
 try{if(typeof bmHere==='function'&&bmHere())return'bloodmoon'}catch(e){}
 if(s==='town')return'town';return'field'}
// audio.js tick 每 250ms 调用；返回 true 表示由采样接管（合成曲不排程）
function scene(s){if(!ok())return false;const n=BGM[cqScene(s)];if(!n||buf[n]===false){want=null;stopBgm();return false}
 if(bgKey!==n){want=n;if(buf[n])startBgm(n);else load(n)}return true}
function play(n,vol,gap){if(!n||!ok())return false;if(buf[n]===false)return false;if(!buf[n]){load(n);return false}
 const now=performance.now();if(gap&&now-(last[n]||0)<gap)return true;last[n]=now;
 const c=ctx(),s=c.createBufferSource(),g=c.createGain();s.buffer=buf[n];g.gain.value=vol||1;s.connect(g);g.connect(K().bus());s.start();return true}
function sfx(name){return play(SFX[name],name==='click'?0.6:1,name==='attack'?90:0)}
function skill(id){const s=typeof SKM!=='undefined'&&SKM[id];if(!s)return false;return play(KIND[s.kind]||EL[s.el]||(s.kind==='attack'||s.kind==='spell'?EL[s.el||'magic']:null),1,70)}
function pre(){if(!ok())return;Object.values(SFX).concat(Object.values(EL),Object.values(KIND)).forEach(load)}
document.addEventListener('pointerdown',()=>setTimeout(pre,300),{once:true,capture:true,passive:true});
function wrap(n,after){const f=window[n];if(typeof f!=='function')return;window[n]=function(){const r=f.apply(this,arguments);try{after(r,arguments)}catch(e){}return r}}
function muted(){return typeof S==='object'&&S&&S.audio&&S.audio.sm}
wrap('die',()=>{if(!muted())play(SFX.die)});
wrap('usePot',(r,a)=>{if(!muted()&&a[0]!=='tp')play(SFX.pot,1,300)});
wrap('goZone',()=>{if(!muted())play(SFX.zone,1,500)});
window.AUDIO_CQ={scene,sfx,skill,map:{BGM,SFX,EL,KIND},get bgm(){return bgKey},loaded:()=>Object.keys(buf).filter(k=>buf[k])};
})();
