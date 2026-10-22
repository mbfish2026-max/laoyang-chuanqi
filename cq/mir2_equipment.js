'use strict';
// Block 4: load after legacy data; install after runtime wrappers, before first character.
(function(){
if(window.CQMir2Equip)return;
const TABLE=[
{"id":"swd1","s":"weapon","cat":"sword","n":"木剑","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[2,5]},"cqReq":{"lv":1},"weight":7,"durability":4,"cqSource":"1.76 资料表","dmg":[2,5]},
{"id":"dag1","s":"weapon","cat":"sword","n":"匕首","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[4,5]},"cqReq":{"lv":1},"weight":5,"durability":10,"cqSource":"1.76 资料表","dmg":[4,5]},
{"id":"swdwumujian","s":"weapon","cat":"sword","n":"乌木剑","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[4,8],"mag":[0,1]},"cqReq":{"lv":1},"weight":8,"durability":7,"cqSource":"1.76 资料表","dmg":[4,8],"bm":{"mag":[0,1]}},
{"id":"swd2","s":"weapon","cat":"sword","n":"青铜剑","q":5,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[3,7]},"cqReq":{"lv":5},"weight":9,"durability":6,"cqSource":"1.76 资料表","dmg":[3,7]},
{"id":"swd4","s":"weapon","cat":"sword","n":"短剑","q":10,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[3,11]},"cqReq":{"lv":10},"weight":9,"durability":8,"cqSource":"1.76 资料表","dmg":[3,11]},
{"id":"swd3","s":"weapon","cat":"sword","n":"铁剑","q":10,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[5,9]},"cqReq":{"lv":10},"weight":10,"durability":10,"cqSource":"1.76 资料表","dmg":[5,9]},
{"id":"swdhezuichu","s":"weapon","cat":"sword","n":"鹤嘴锄","q":11,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,8]},"cqReq":{"lv":11},"weight":10,"durability":10,"cqSource":"1.76 资料表","dmg":[0,8]},
{"id":"axe1","s":"weapon","cat":"sword","n":"青铜斧","q":13,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,15]},"cqReq":{"lv":13},"weight":10,"durability":10,"cqSource":"1.76 资料表","dmg":[0,15]},
{"id":"swdluocha","s":"weapon","cat":"sword","n":"罗刹","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[15,0]},"cqReq":{"lv":15},"weight":30,"durability":25,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[15,0]},
{"id":"swd5","s":"weapon","cat":"sword","n":"八荒","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[4,12]},"cqReq":{"lv":15},"weight":25,"durability":18,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[4,12]},
{"id":"swd6","s":"weapon","cat":"sword","n":"凌风","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[6,12]},"cqReq":{"lv":19},"weight":20,"durability":18,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[6,12]},
{"id":"swdpohun","s":"weapon","cat":"sword","n":"破魂","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[8,10]},"cqReq":{"lv":20},"weight":8,"durability":11,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[8,10],"bm":{"ar":[2,2]}},
{"id":"axe2","s":"weapon","cat":"sword","n":"斩马刀","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[5,15]},"cqReq":{"lv":20},"weight":27,"durability":19,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[5,15]},
{"id":"swd7","s":"weapon","cat":"sword","n":"修罗","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,20]},"cqReq":{"lv":22},"weight":40,"durability":25,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,20]},
{"id":"swdningshuang","s":"weapon","cat":"sword","n":"凝霜","q":25,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[10,13]},"cqReq":{"lv":25},"weight":20,"durability":20,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[10,13]},
{"id":"swd8","s":"weapon","cat":"sword","n":"炼狱","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,25]},"cqReq":{"lv":26},"weight":60,"durability":28,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,25]},
{"id":"swdjingzhongyue","s":"weapon","cat":"sword","n":"井中月","q":28,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[7,22]},"cqReq":{"lv":28},"weight":58,"durability":30,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[7,22]},
{"id":"swdcaijuezhizhang","s":"weapon","cat":"sword","n":"裁决之杖","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,30]},"cqReq":{"lv":30},"weight":80,"durability":32,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,30]},
{"id":"swdtulong","s":"weapon","cat":"sword","n":"屠龙","q":34,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[5,35]},"cqReq":{"lv":34},"weight":99,"durability":33,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[5,35]},
{"id":"swdmingyunzhiren","s":"weapon","cat":"sword","n":"命运之刃","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[12,16]},"cqReq":{"lv":35},"weight":48,"durability":20,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[12,16]},
{"id":"swdluoposhenbing","s":"weapon","cat":"sword","n":"落魄神兵","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[30,0]},"cqReq":{"lv":40},"weight":40,"durability":28,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[30,0]},
{"id":"swdchixuemojian","s":"weapon","cat":"sword","n":"赤血魔剑","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[15,10],"mag":[4,3],"tao":[4,2]},"cqReq":{"lv":1},"weight":22,"durability":23,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[15,10],"bm":{"mag":[4,3],"tao":[4,2],"ar":[1,1]}},
{"id":"swdnuzhan","s":"weapon","cat":"sword","n":"怒斩","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[12,26]},"cqReq":{"dmg":46},"weight":85,"durability":35,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[12,26],"bm":{"ar":[3,3]}},
{"id":"swdqidaozhiren","s":"weapon","cat":"sword","n":"祈祷之刃","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[8,20]},"cqReq":{"lv":20},"weight":10,"durability":20,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[8,20],"bm":{"ar":[3,3]}},
{"id":"wand1","s":"weapon","cat":"wand","n":"海魂","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[3,10],"mag":[1,2]},"cqReq":{"lv":15},"weight":12,"durability":12,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[3,10],"bm":{"mag":[1,2]}},
{"id":"wand2","s":"weapon","cat":"wand","n":"偃月","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[4,10],"mag":[1,3]},"cqReq":{"lv":20},"weight":13,"durability":12,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[4,10],"bm":{"mag":[1,3]}},
{"id":"wand3","s":"weapon","cat":"wand","n":"魔杖","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[5,9],"mag":[2,5]},"cqReq":{"lv":26},"weight":10,"durability":15,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[5,9],"bm":{"mag":[2,5]}},
{"id":"wandxueyin","s":"weapon","cat":"wand","n":"血饮","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[3,14],"mag":[3,5]},"cqReq":{"mag":27},"weight":12,"durability":20,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[3,14],"bm":{"mag":[3,5],"ar":[5,5]}},
{"id":"wandguyuquanzhang","s":"weapon","cat":"wand","n":"骨玉权杖","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[6,12],"mag":[2,6]},"cqReq":{"lv":35},"weight":20,"durability":18,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[6,12],"bm":{"mag":[2,6]}},
{"id":"wandshihunfazhang","s":"weapon","cat":"wand","n":"嗜魂法杖","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[6,13],"mag":[2,8]},"cqReq":{"lv":35},"weight":26,"durability":10,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[6,13],"bm":{"mag":[2,8]}},
{"id":"wandlongya","s":"weapon","cat":"wand","n":"龙牙","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[10,18],"mag":[3,6]},"cqReq":{"mag":28},"weight":25,"durability":28,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"dmg":[10,18],"bm":{"mag":[3,6],"ar":[5,5]}},
{"id":"wandbanyue","s":"weapon","cat":"wand","n":"半月","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[5,10],"mag":[0,1],"tao":[1,1]},"cqReq":{"lv":15},"weight":16,"durability":14,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[5,10],"bm":{"mag":[0,1],"tao":[1,1]}},
{"id":"wand4","s":"weapon","cat":"wand","n":"降魔","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[6,11],"tao":[1,2]},"cqReq":{"lv":20},"weight":20,"durability":17,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[6,11],"bm":{"tao":[1,2],"ar":[1,1]}},
{"id":"wandyinshe","s":"weapon","cat":"wand","n":"银蛇","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[7,14],"tao":[1,3]},"cqReq":{"lv":26},"weight":26,"durability":24,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[7,14],"bm":{"tao":[1,3],"ar":[1,1]}},
{"id":"wandwujigun","s":"weapon","cat":"wand","n":"无极棍","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[8,16],"tao":[3,5]},"cqReq":{"tao":25},"weight":15,"durability":25,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[8,16],"bm":{"tao":[3,5]}},
{"id":"wandlongwenjian","s":"weapon","cat":"wand","n":"龙纹剑","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[8,20],"tao":[3,6]},"cqReq":{"lv":35},"weight":40,"durability":22,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[8,20],"bm":{"tao":[3,6]}},
{"id":"wandxiaoyaoshan","s":"weapon","cat":"wand","n":"逍遥扇","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[5,13],"tao":[4,10]},"cqReq":{"lv":35},"weight":45,"durability":30,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"dmg":[5,13],"bm":{"tao":[4,10],"luck":[1,1]}},
{"id":"arm1","s":"armor","cat":"armor","n":"布衣","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,2],"mdef":[0,1]},"cqReq":{"lv":1},"weight":5,"durability":5,"cqSource":"1.76 资料表","def":[0,2],"bm":{"mdef":[0,1]}},
{"id":"arm2","s":"armor","cat":"armor","n":"轻型盔甲","q":11,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[3,3],"mdef":[1,2]},"cqReq":{"lv":11},"weight":8,"durability":8,"cqSource":"1.76 资料表","def":[3,3],"bm":{"mdef":[1,2]}},
{"id":"arm3","s":"armor","cat":"armor","n":"中型盔甲","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[3,5],"mdef":[1,2]},"cqReq":{"lv":16},"weight":12,"durability":12,"cqSource":"1.76 资料表","def":[3,5],"bm":{"mdef":[1,2]}},
{"id":"arm4","s":"armor","cat":"armor","n":"重盔甲","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[4,7],"mdef":[2,3]},"cqReq":{"lv":22},"weight":23,"durability":25,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[4,7],"bm":{"mdef":[2,3]}},
{"id":"arm7","s":"armor","cat":"armor","n":"战神盔甲","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[5,9],"mdef":[3,5]},"cqReq":{"dmg":46},"weight":45,"durability":30,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[5,9],"bm":{"mdef":[3,5]}},
{"id":"armtianmoshenjia","s":"armor","cat":"armor","n":"天魔神甲","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[1,2],"def":[5,12],"mdef":[4,7]},"cqReq":{"lv":40},"weight":62,"durability":35,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[1,2],"def":[5,12],"bm":{"mdef":[4,7]}},
{"id":"armshengzhanbaojia","s":"armor","cat":"armor","n":"圣战宝甲","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[1,2],"def":[5,12],"mdef":[4,7]},"cqReq":{"lv":40},"weight":62,"durability":35,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[1,2],"def":[5,12],"bm":{"mdef":[4,7]}},
{"id":"arm5","s":"armor","cat":"armor","n":"魔法长袍","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[0,2],"def":[3,5],"mdef":[3,4]},"cqReq":{"lv":22},"weight":12,"durability":20,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[3,5],"bm":{"mag":[0,2],"mdef":[3,4]}},
{"id":"armemochangpao","s":"armor","cat":"armor","n":"恶魔长袍","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[1,4],"def":[4,7],"mdef":[3,4]},"cqReq":{"mag":28},"weight":19,"durability":25,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[4,7],"bm":{"mag":[1,4],"mdef":[3,4]}},
{"id":"armfashenpifeng","s":"armor","cat":"armor","n":"法神披风","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[2,5],"def":[4,9],"mdef":[4,6]},"cqReq":{"lv":40},"weight":21,"durability":26,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[4,9],"bm":{"mag":[2,5],"mdef":[4,6]}},
{"id":"armnichangyuyi","s":"armor","cat":"armor","n":"霓裳羽衣","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[2,5],"def":[4,9],"mdef":[4,6]},"cqReq":{"lv":40},"weight":21,"durability":26,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[4,9],"bm":{"mag":[2,5],"mdef":[4,6]}},
{"id":"arm6","s":"armor","cat":"armor","n":"灵魂战衣","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[0,2],"def":[3,6],"mdef":[3,3]},"cqReq":{"lv":22},"weight":15,"durability":20,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[3,6],"bm":{"tao":[0,2],"mdef":[3,3]}},
{"id":"armyoulingzhanyi","s":"armor","cat":"armor","n":"幽灵战衣","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,4],"def":[4,7],"mdef":[3,4]},"cqReq":{"tao":27},"weight":26,"durability":28,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[4,7],"bm":{"tao":[1,4],"mdef":[3,4]}},
{"id":"armtianzundaopao","s":"armor","cat":"armor","n":"天尊道袍","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[2,5],"def":[4,9],"mdef":[4,6]},"cqReq":{"lv":40},"weight":37,"durability":30,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[4,9],"bm":{"tao":[2,5],"mdef":[4,6]}},
{"id":"armtianshizhangpao","s":"armor","cat":"armor","n":"天师长袍","q":40,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[2,5],"def":[4,9],"mdef":[4,6]},"cqReq":{"lv":40},"weight":37,"durability":30,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[4,9],"bm":{"tao":[2,5],"mdef":[4,6]}},
{"id":"amuqifuxianglian","s":"amulet","cat":"amulet","n":"祈福项链","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":1},"weight":1,"durability":10,"cqSource":"1.76 资料表","jew":1},
{"id":"amu","s":"amulet","cat":"amulet","n":"金项链","q":2,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":2},"weight":1,"durability":8,"cqSource":"1.76 资料表","jew":1,"dmg":[0,1],"bm":{"dex":[1,1]}},
{"id":"amu2","s":"amulet","cat":"amulet","n":"传统项链","q":3,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":3},"weight":1,"durability":8,"cqSource":"1.76 资料表","jew":1,"bm":{"ar":[1,1]}},
{"id":"amujiqiaoxianglian","s":"amulet","cat":"amulet","n":"技巧项链","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":16},"weight":1,"durability":8,"cqSource":"1.76 资料表","jew":1},
{"id":"amutancexianglian","s":"amulet","cat":"amulet","n":"探测项链","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":1},"weight":1,"durability":8,"cqSource":"1.76 资料表","jew":1},
{"id":"amuheiseshuijingxianglian","s":"amulet","cat":"amulet","n":"黑色水晶项链","q":13,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[1,0]},"cqReq":{"lv":13},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[1,0]},
{"id":"amuhuangseshuijingxianglian","s":"amulet","cat":"amulet","n":"黄色水晶项链","q":13,"str":0,"tier":0,"cqTier":"basic","cqRange":{"tao":[1,0]},"cqReq":{"lv":13},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"bm":{"tao":[1,0]}},
{"id":"amumoguixianglian","s":"amulet","cat":"amulet","n":"魔鬼项链","q":17,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[2,0]},"cqReq":{"lv":17},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[2,0]},
{"id":"amu3","s":"amulet","cat":"amulet","n":"灯笼项链","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,0]},"cqReq":{"lv":18},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[1,0]},
{"id":"amulanfeicuixianglian","s":"amulet","cat":"amulet","n":"蓝翡翠项链","q":23,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[2,2]},"cqReq":{"lv":23},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[2,2]},
{"id":"amuyoulingxianglian","s":"amulet","cat":"amulet","n":"幽灵项链","q":24,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,5]},"cqReq":{"lv":24},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,5]},
{"id":"amulvsexianglian","s":"amulet","cat":"amulet","n":"绿色项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,5]},"cqReq":{"dmg":39},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[2,5]},
{"id":"amukuangfengxianglian","s":"amulet","cat":"amulet","n":"狂风项链","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":19},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,1]},
{"id":"amujiyixianglian","s":"amulet","cat":"amulet","n":"记忆项链","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[2,4]},"cqReq":{"lv":26},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[2,4]},
{"id":"amushengzhanxianglian","s":"amulet","cat":"amulet","n":"圣战项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[3,6]},"cqReq":{"dmg":40},"weight":2,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[3,6]},
{"id":"amubaijinxianglian","s":"amulet","cat":"amulet","n":"白金项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,2]},"cqReq":{"mag":10},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,2]}},
{"id":"amu5","s":"amulet","cat":"amulet","n":"黑檀项链","q":13,"str":0,"tier":0,"cqTier":"basic","cqRange":{"mag":[1,0]},"cqReq":{"lv":13},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,0]}},
{"id":"amuhupoxianglian","s":"amulet","cat":"amulet","n":"琥珀项链","q":17,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[2,0]},"cqReq":{"lv":17},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[2,0]}},
{"id":"amufangdajing","s":"amulet","cat":"amulet","n":"放大镜","q":24,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[1,3]},"cqReq":{"lv":24},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,3]}},
{"id":"amushengmingxianglian","s":"amulet","cat":"amulet","n":"生命项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[1,5]},"cqReq":{"mag":25},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,5],"ar":[1,1]}},
{"id":"amuemolingdang","s":"amulet","cat":"amulet","n":"恶魔铃铛","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,7]},"cqReq":{"mag":27},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,7],"ar":[2,2]}},
{"id":"amufashenxianglian","s":"amulet","cat":"amulet","n":"法神项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[1,8]},"cqReq":{"mag":28},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,8],"ar":[2,2]}},
{"id":"amumoxuexianglian","s":"amulet","cat":"amulet","n":"魔血项链","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,2],"mag":[1,3]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"dmg":[2,2],"bm":{"mag":[1,3]}},
{"id":"amuhongmoxianglian","s":"amulet","cat":"amulet","n":"虹魔项链","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,4]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,4]}},
{"id":"amu4","s":"amulet","cat":"amulet","n":"白色虎齿项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,1]},"cqReq":{"tao":11},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,1]}},
{"id":"amuduobishoulian","s":"amulet","cat":"amulet","n":"躲避手链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{},"cqReq":{"tao":12},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"dex":[3,3]}},
{"id":"amufenghuangmingzhu","s":"amulet","cat":"amulet","n":"凤凰明珠","q":17,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[1,2]},"cqReq":{"lv":17},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,2],"ar":[1,1]}},
{"id":"amuzhudi","s":"amulet","cat":"amulet","n":"竹笛","q":24,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[1,3]},"cqReq":{"lv":24},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,3]}},
{"id":"amu6","s":"amulet","cat":"amulet","n":"天珠项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,5]},"cqReq":{"tao":22},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,5]}},
{"id":"amulinghunxianglian","s":"amulet","cat":"amulet","n":"灵魂项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,6]},"cqReq":{"tao":23},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,6],"ar":[2,2]}},
{"id":"amuqidaoxianglian","s":"amulet","cat":"amulet","n":"祈祷项链","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"tao":[0,4]},"cqReq":{"lv":15},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[0,4]}},
{"id":"amutianzunxianglian","s":"amulet","cat":"amulet","n":"天尊项链","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[2,7]},"cqReq":{"tao":25},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[2,7],"ar":[2,2]}},
{"id":"glv1","s":"gloves","cat":"bracelet","n":"铁手镯","q":3,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":3},"weight":1,"durability":4,"cqSource":"1.76 资料表","bm":{"ar":[1,1]}},
{"id":"shdtieshouzhuo","s":"shield","cat":"bracelet","n":"铁手镯","q":3,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":3},"weight":1,"durability":4,"cqSource":"1.76 资料表","bm":{"ar":[1,1]}},
{"id":"shd1","s":"shield","cat":"bracelet","n":"小手镯","q":5,"str":0,"tier":0,"cqTier":"basic","cqRange":{"mdef":[0,1]},"cqReq":{"lv":5},"weight":1,"durability":5,"cqSource":"1.76 资料表","bm":{"mdef":[0,1]}},
{"id":"glvxiaoshouzhuo","s":"gloves","cat":"bracelet","n":"小手镯","q":5,"str":0,"tier":0,"cqTier":"basic","cqRange":{"mdef":[0,1]},"cqReq":{"lv":5},"weight":1,"durability":5,"cqSource":"1.76 资料表","bm":{"mdef":[0,1]}},
{"id":"shd2","s":"shield","cat":"bracelet","n":"银手镯","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":7},"weight":2,"durability":7,"cqSource":"1.76 资料表","bm":{"dex":[1,1]}},
{"id":"glvyinshouzhuo","s":"gloves","cat":"bracelet","n":"银手镯","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":7},"weight":2,"durability":7,"cqSource":"1.76 资料表","bm":{"dex":[1,1]}},
{"id":"shdpizhishoutao","s":"shield","cat":"bracelet","n":"皮制手套","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1]},"cqReq":{"lv":7},"weight":2,"durability":6,"cqSource":"1.76 资料表","def":[0,1]},
{"id":"glvpizhishoutao","s":"gloves","cat":"bracelet","n":"皮制手套","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1]},"cqReq":{"lv":7},"weight":2,"durability":6,"cqSource":"1.76 资料表","def":[0,1]},
{"id":"glv3","s":"gloves","cat":"bracelet","n":"钢手镯","q":8,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[0,1]},"cqReq":{"lv":8},"weight":1,"durability":5,"cqSource":"1.76 资料表","def":[0,1],"bm":{"mdef":[0,1]}},
{"id":"shdgangshouzhuo","s":"shield","cat":"bracelet","n":"钢手镯","q":8,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[0,1]},"cqReq":{"lv":8},"weight":1,"durability":5,"cqSource":"1.76 资料表","def":[0,1],"bm":{"mdef":[0,1]}},
{"id":"shdxiapuershouzhuo","s":"shield","cat":"bracelet","n":"夏普儿手镯","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":16},"weight":1,"durability":7,"cqSource":"1.76 资料表","bm":{"ar":[2,2]}},
{"id":"glvxiapuershouzhuo","s":"gloves","cat":"bracelet","n":"夏普儿手镯","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":16},"weight":1,"durability":7,"cqSource":"1.76 资料表","bm":{"ar":[2,2]}},
{"id":"shdbixieshouzhuo","s":"shield","cat":"bracelet","n":"辟邪手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":19},"weight":1,"durability":7,"cqSource":"1.76 资料表","bm":{"dex":[2,2]}},
{"id":"glvbixieshouzhuo","s":"gloves","cat":"bracelet","n":"辟邪手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":19},"weight":1,"durability":7,"cqSource":"1.76 资料表","bm":{"dex":[2,2]}},
{"id":"shdjiangushoutao","s":"shield","cat":"bracelet","n":"坚固手套","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,2]},"cqReq":{"lv":18},"weight":3,"durability":8,"cqSource":"1.76 资料表","def":[0,2]},
{"id":"glvjiangushoutao","s":"gloves","cat":"bracelet","n":"坚固手套","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,2]},"cqReq":{"lv":18},"weight":3,"durability":8,"cqSource":"1.76 资料表","def":[0,2]},
{"id":"shdmofashouzhuo","s":"shield","cat":"bracelet","n":"魔法手镯","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[1,2]},"cqReq":{"lv":18},"weight":1,"durability":7,"cqSource":"1.76 资料表","def":[0,1],"bm":{"mdef":[1,2]}},
{"id":"glvmofashouzhuo","s":"gloves","cat":"bracelet","n":"魔法手镯","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[1,2]},"cqReq":{"lv":18},"weight":1,"durability":7,"cqSource":"1.76 资料表","def":[0,1],"bm":{"mdef":[1,2]}},
{"id":"shdshenmiyaodai","s":"shield","cat":"bracelet","n":"神秘腰带","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":18},"weight":1,"durability":8,"cqSource":"1.76 资料表"},
{"id":"glvshenmiyaodai","s":"gloves","cat":"bracelet","n":"神秘腰带","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":18},"weight":1,"durability":8,"cqSource":"1.76 资料表"},
{"id":"shd3","s":"shield","cat":"bracelet","n":"大手镯","q":9,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[1,1]},"cqReq":{"lv":9},"weight":2,"durability":10,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[1,1]},
{"id":"glvdashouzhuo","s":"gloves","cat":"bracelet","n":"大手镯","q":9,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[1,1]},"cqReq":{"lv":9},"weight":2,"durability":10,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[1,1]},
{"id":"shd4","s":"shield","cat":"bracelet","n":"魔力手镯","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":20},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,1]},
{"id":"glvmolishouzhuo","s":"gloves","cat":"bracelet","n":"魔力手镯","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":20},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,1]},
{"id":"glv4","s":"gloves","cat":"bracelet","n":"死神手套","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,2]},"cqReq":{"lv":22},"weight":2,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[1,2]},
{"id":"shdsishenshoutao","s":"shield","cat":"bracelet","n":"死神手套","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,2]},"cqReq":{"lv":22},"weight":2,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[1,2]},
{"id":"shdjinshouzhuo","s":"shield","cat":"bracelet","n":"金手镯","q":23,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1],"mdef":[2,3]},"cqReq":{"lv":23},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,1],"bm":{"mdef":[2,3]}},
{"id":"glvjinshouzhuo","s":"gloves","cat":"bracelet","n":"金手镯","q":23,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1],"mdef":[2,3]},"cqReq":{"lv":23},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,1],"bm":{"mdef":[2,3]}},
{"id":"shdyoulingshoutao","s":"shield","cat":"bracelet","n":"幽灵手套","q":25,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,3]},"cqReq":{"lv":25},"weight":5,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,3]},
{"id":"glvyoulingshoutao","s":"gloves","cat":"bracelet","n":"幽灵手套","q":25,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,3]},"cqReq":{"lv":25},"weight":5,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,3]},
{"id":"shdyanluoshoutao","s":"shield","cat":"bracelet","n":"阎罗手套","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[0,4]},"cqReq":{"lv":30},"weight":10,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,4]},
{"id":"glvyanluoshoutao","s":"gloves","cat":"bracelet","n":"阎罗手套","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[0,4]},"cqReq":{"lv":30},"weight":10,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,4]},
{"id":"shdqishishouzhuo","s":"shield","cat":"bracelet","n":"骑士手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,2]},"cqReq":{"dmg":39},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[2,2]},
{"id":"glvqishishouzhuo","s":"gloves","cat":"bracelet","n":"骑士手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,2]},"cqReq":{"dmg":39},"weight":1,"durability":8,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[2,2]},
{"id":"shdheitieshoutao","s":"shield","cat":"bracelet","n":"黑铁手套","q":38,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[0,6]},"cqReq":{"lv":38},"weight":10,"durability":10,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,6]},
{"id":"glvheitieshoutao","s":"gloves","cat":"bracelet","n":"黑铁手套","q":38,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[0,6]},"cqReq":{"lv":38},"weight":10,"durability":10,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"def":[0,6]},
{"id":"shdqidaoshouzhuo","s":"shield","cat":"bracelet","n":"祈祷手镯","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,2]},"cqReq":{"lv":15},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,2]},
{"id":"glvqidaoshouzhuo","s":"gloves","cat":"bracelet","n":"祈祷手镯","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,2]},"cqReq":{"lv":15},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[0,2]},
{"id":"shdshengzhanshouzhuo","s":"shield","cat":"bracelet","n":"圣战手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,3],"def":[0,1]},"cqReq":{"dmg":40},"weight":2,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[2,3],"def":[0,1]},
{"id":"glvshengzhanshouzhuo","s":"gloves","cat":"bracelet","n":"圣战手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[2,3],"def":[0,1]},"cqReq":{"dmg":40},"weight":2,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"dmg":[2,3],"def":[0,1]},
{"id":"shdheitanshouzhuo","s":"shield","cat":"bracelet","n":"黑檀手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[0,1]},"cqReq":{"lv":19},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,1]}},
{"id":"glvheitanshouzhuo","s":"gloves","cat":"bracelet","n":"黑檀手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[0,1]},"cqReq":{"lv":19},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,1]}},
{"id":"shdsibeiershouzhuo","s":"shield","cat":"bracelet","n":"思贝儿手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,2]},"cqReq":{"mag":24},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,2]}},
{"id":"glvsibeiershouzhuo","s":"gloves","cat":"bracelet","n":"思贝儿手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,2]},"cqReq":{"mag":24},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,2]}},
{"id":"shdlongzhishouzhuo","s":"shield","cat":"bracelet","n":"龙之手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,3]},"cqReq":{"mag":28},"weight":3,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,3]}},
{"id":"glvlongzhishouzhuo","s":"gloves","cat":"bracelet","n":"龙之手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,3]},"cqReq":{"mag":28},"weight":3,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[0,3]}},
{"id":"shdjiyishouzhuo","s":"shield","cat":"bracelet","n":"记忆手镯","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[1,1]},"cqReq":{"lv":26},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[1,1]}},
{"id":"glvjiyishouzhuo","s":"gloves","cat":"bracelet","n":"记忆手镯","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[1,1]},"cqReq":{"lv":26},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"bm":{"mag":[1,1]}},
{"id":"shdfashenshouzhuo","s":"shield","cat":"bracelet","n":"法神手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,4],"def":[0,1]},"cqReq":{"mag":28},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[0,1],"bm":{"mag":[0,4]}},
{"id":"glvfashenshouzhuo","s":"gloves","cat":"bracelet","n":"法神手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,4],"def":[0,1]},"cqReq":{"mag":28},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"def":[0,1],"bm":{"mag":[0,4]}},
{"id":"glv5","s":"gloves","cat":"bracelet","n":"道士手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[0,1]},"cqReq":{"lv":19},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,1]}},
{"id":"shddaoshishouzhuo","s":"shield","cat":"bracelet","n":"道士手镯","q":19,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[0,1]},"cqReq":{"lv":19},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,1]}},
{"id":"shdsanyanshouzhuo","s":"shield","cat":"bracelet","n":"三眼手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,3],"def":[1,1]},"cqReq":{"tao":22},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[1,1],"bm":{"tao":[1,3]}},
{"id":"glvsanyanshouzhuo","s":"gloves","cat":"bracelet","n":"三眼手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,3],"def":[1,1]},"cqReq":{"tao":22},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[1,1],"bm":{"tao":[1,3]}},
{"id":"shdxinlingshouzhuo","s":"shield","cat":"bracelet","n":"心灵手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,2]},"cqReq":{"tao":24},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[1,2]}},
{"id":"glvxinlingshouzhuo","s":"gloves","cat":"bracelet","n":"心灵手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,2]},"cqReq":{"tao":24},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[1,2]}},
{"id":"shdtianzunshouzhuo","s":"shield","cat":"bracelet","n":"天尊手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,4],"def":[1,2]},"cqReq":{"tao":25},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[1,2],"bm":{"tao":[1,4]}},
{"id":"glvtianzunshouzhuo","s":"gloves","cat":"bracelet","n":"天尊手镯","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[1,4],"def":[1,2]},"cqReq":{"tao":25},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"def":[1,2],"bm":{"tao":[1,4]}},
{"id":"shdmoxueshouzhuo","s":"shield","cat":"bracelet","n":"魔血手镯","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,1]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,1]}},
{"id":"glvmoxueshouzhuo","s":"gloves","cat":"bracelet","n":"魔血手镯","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,1]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,1]}},
{"id":"shdhongmoshouzhuo","s":"shield","cat":"bracelet","n":"虹魔手镯","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,2]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,2]}},
{"id":"glvhongmoshouzhuo","s":"gloves","cat":"bracelet","n":"虹魔手镯","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,2]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"bm":{"tao":[0,2]}},
{"id":"rinjinjiezhi","s":"ring","cat":"ring","n":"金戒指","q":22,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,1],"mag":[1,1],"tao":[1,1],"mdef":[0,3]},"cqReq":{"lv":22},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"dmg":[1,1],"bm":{"mag":[1,1],"tao":[1,1],"mdef":[0,3]}},
{"id":"rinjiangyaochumojiezhi","s":"ring","cat":"ring","n":"降妖除魔戒指","q":25,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,2],"mag":[1,2],"tao":[1,2],"mdef":[0,4]},"cqReq":{"lv":25},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"dmg":[1,2],"bm":{"mag":[1,2],"tao":[1,2],"mdef":[0,4]}},
{"id":"rinshenmijiezhi","s":"ring","cat":"ring","n":"神秘戒指","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":18},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1},
{"id":"rinyinshenjiezhi","s":"ring","cat":"ring","n":"隐身戒指","q":12,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":12},"weight":1,"durability":4,"cqSource":"1.76 资料表","jew":1},
{"id":"rinchuansongjiezhi","s":"ring","cat":"ring","n":"传送戒指","q":12,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":12},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1},
{"id":"rinfangyujiezhi","s":"ring","cat":"ring","n":"防御戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[1,2]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"bm":{"tao":[1,2]}},
{"id":"rinfuhuojiezhi","s":"ring","cat":"ring","n":"复活戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[0,1]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"def":[0,1],"bm":{"mdef":[0,1]}},
{"id":"rinhushenjiezhi","s":"ring","cat":"ring","n":"护身戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[0,1]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"def":[0,1]},
{"id":"rinchaofuzaijiezhi","s":"ring","cat":"ring","n":"超负载戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"dmg":[0,1]},
{"id":"rinhuoyanjiezhi","s":"ring","cat":"ring","n":"火焰戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[1,2]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","jew":1,"bm":{"mag":[1,2]}},
{"id":"rinqiuhunjiezhi","s":"ring","cat":"ring","n":"求婚戒指","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":1},"weight":1,"durability":10,"cqSource":"1.76 资料表","jew":1},
{"id":"rin","s":"ring","cat":"ring","n":"古铜戒指","q":3,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":3},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,1]},
{"id":"rin2","s":"ring","cat":"ring","n":"牛角戒指","q":9,"str":0,"tier":0,"cqTier":"basic","cqRange":{"dmg":[0,1],"mdef":[0,1]},"cqReq":{"lv":9},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,1],"bm":{"mdef":[0,1]}},
{"id":"rin6","s":"ring","cat":"ring","n":"蓝色水晶戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[1,0],"mdef":[0,2]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[1,0],"bm":{"mdef":[0,2]}},
{"id":"rinheiseshuijingjiezhi","s":"ring","cat":"ring","n":"黑色水晶戒指","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,2]},"cqReq":{"lv":20},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,2]},
{"id":"rin5","s":"ring","cat":"ring","n":"骷髅戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,3]},"cqReq":{"dmg":30},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,3]},
{"id":"rin4","s":"ring","cat":"ring","n":"珊瑚戒指","q":25,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,4]},"cqReq":{"lv":25},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,4]},
{"id":"rinlongzhijiezhi","s":"ring","cat":"ring","n":"龙之戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,5]},"cqReq":{"dmg":37},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,5]},
{"id":"rinliliangjiezhi","s":"ring","cat":"ring","n":"力量戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,6]},"cqReq":{"dmg":46},"weight":3,"durability":6,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,6]},
{"id":"rinkuangfengjiezhi","s":"ring","cat":"ring","n":"狂风戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,1]},
{"id":"rinshengzhanjiezhi","s":"ring","cat":"ring","n":"圣战戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,7],"mdef":[0,1]},"cqReq":{"dmg":40},"weight":2,"durability":7,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,7],"bm":{"mdef":[0,1]}},
{"id":"rinmoxuejiezhi","s":"ring","cat":"ring","n":"魔血戒指","q":35,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[1,3],"tao":[1,0]},"cqReq":{"lv":35},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[1,3],"bm":{"tao":[1,0]}},
{"id":"rinhongmojiezhi","s":"ring","cat":"ring","n":"虹魔戒指","q":33,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,4]},"cqReq":{"lv":33},"weight":2,"durability":4,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,4]},
{"id":"rinmabijiezhi","s":"ring","cat":"ring","n":"麻痹戒指","q":16,"str":0,"tier":1,"cqTier":"basic","cqRange":{"dmg":[0,1]},"cqReq":{"lv":16},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"zs","cls":1,"jew":1,"dmg":[0,1]},
{"id":"rin3","s":"ring","cat":"ring","n":"六角戒指","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{"mag":[0,1]},"cqReq":{"lv":7},"weight":1,"durability":6,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,1]}},
{"id":"rinshengtiejiezhi","s":"ring","cat":"ring","n":"生铁戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,1],"def":[0,2]},"cqReq":{"mag":9},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"def":[0,2],"bm":{"mag":[0,1]}},
{"id":"rinsheyanjiezhi","s":"ring","cat":"ring","n":"蛇眼戒指","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[0,2]},"cqReq":{"lv":20},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,2]}},
{"id":"rinmeilijiezhi","s":"ring","cat":"ring","n":"魅力戒指","q":23,"str":0,"tier":1,"cqTier":"basic","cqRange":{"mag":[1,2]},"cqReq":{"lv":23},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,2]}},
{"id":"rinhongbaoshijiezhi","s":"ring","cat":"ring","n":"红宝石戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,4]},"cqReq":{"mag":17},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,4]}},
{"id":"rinzibiluo","s":"ring","cat":"ring","n":"紫碧螺","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,5]},"cqReq":{"mag":24},"weight":2,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[0,5]}},
{"id":"rinqidaojiezhi","s":"ring","cat":"ring","n":"祈祷戒指","q":15,"str":0,"tier":0,"cqTier":"basic","cqRange":{"mag":[1,5]},"cqReq":{"lv":15},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,5]}},
{"id":"rinfashenjiezhi","s":"ring","cat":"ring","n":"法神戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[1,6],"mdef":[0,1]},"cqReq":{"mag":28},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"fs","cls":1,"jew":1,"bm":{"mag":[1,6],"mdef":[0,1]}},
{"id":"rinbolijiezhi","s":"ring","cat":"ring","n":"玻璃戒指","q":7,"str":0,"tier":0,"cqTier":"basic","cqRange":{"tao":[0,1]},"cqReq":{"lv":7},"weight":1,"durability":3,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[0,1]}},
{"id":"rinzhenzhujiezhi","s":"ring","cat":"ring","n":"珍珠戒指","q":20,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[0,2]},"cqReq":{"lv":20},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[0,2]}},
{"id":"rindaodejiezhi","s":"ring","cat":"ring","n":"道德戒指","q":23,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[1,2]},"cqReq":{"lv":23},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,2]}},
{"id":"rinbojinjiezhi","s":"ring","cat":"ring","n":"铂金戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,4]},"cqReq":{"tao":17},"weight":1,"durability":5,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[0,4]}},
{"id":"rintaitanjiezhi","s":"ring","cat":"ring","n":"泰坦戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[2,6]},"cqReq":{"tao":24},"weight":3,"durability":5,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[2,6]}},
{"id":"rinjiyijiezhi","s":"ring","cat":"ring","n":"记忆戒指","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"tao":[1,3]},"cqReq":{"lv":26},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[1,3]}},
{"id":"rintianzunjiezhi","s":"ring","cat":"ring","n":"天尊戒指","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[2,7],"mdef":[0,1]},"cqReq":{"tao":25},"weight":1,"durability":7,"cqSource":"1.76 资料表","ccls":"ds","cls":1,"jew":1,"bm":{"tao":[2,7],"mdef":[0,1]}},
{"id":"hlmjinglingtoukui","s":"helm","cat":"helm","n":"精灵头盔","q":1,"str":0,"tier":0,"cqTier":"basic","cqRange":{},"cqReq":{"lv":1},"weight":5,"durability":1,"cqSource":"1.76 资料表"},
{"id":"hlm1","s":"helm","cat":"helm","n":"青铜头盔","q":10,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1]},"cqReq":{"lv":10},"weight":4,"durability":8,"cqSource":"1.76 资料表","def":[0,1]},
{"id":"hlm2","s":"helm","cat":"helm","n":"魔法头盔","q":14,"str":0,"tier":0,"cqTier":"basic","cqRange":{"def":[0,1],"mdef":[1,1]},"cqReq":{"lv":14},"weight":4,"durability":8,"cqSource":"1.76 资料表","def":[0,1],"bm":{"mdef":[1,1]}},
{"id":"hlm4","s":"helm","cat":"helm","n":"道士头盔","q":24,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[1,2],"mdef":[2,3]},"cqReq":{"lv":24},"weight":3,"durability":8,"cqSource":"1.76 资料表","def":[1,2],"bm":{"mdef":[2,3]}},
{"id":"hlm3","s":"helm","cat":"helm","n":"骷髅头盔","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[2,3]},"cqReq":{"dmg":30},"weight":5,"durability":8,"cqSource":"1.76 资料表","def":[2,3]},
{"id":"hlmheitietoukui","s":"helm","cat":"helm","n":"黑铁头盔","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"def":[4,5],"mdef":[2,3]},"cqReq":{"dmg":46},"weight":20,"durability":10,"cqSource":"1.76 资料表","def":[4,5],"bm":{"mdef":[2,3]}},
{"id":"hlmshenmitoukui","s":"helm","cat":"helm","n":"神秘头盔","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{},"cqReq":{"lv":18},"weight":10,"durability":10,"cqSource":"1.76 资料表"},
{"id":"hlmqidaotoukui","s":"helm","cat":"helm","n":"祈祷头盔","q":18,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[3,4],"mdef":[1,2]},"cqReq":{"lv":18},"weight":2,"durability":5,"cqSource":"1.76 资料表","def":[3,4],"bm":{"mdef":[1,2]}},
{"id":"hlmjiyitoukui","s":"helm","cat":"helm","n":"记忆头盔","q":26,"str":0,"tier":1,"cqTier":"basic","cqRange":{"def":[3,3]},"cqReq":{"lv":26},"weight":7,"durability":8,"cqSource":"1.76 资料表","def":[3,3]},
{"id":"hlmshengzhantoukui","s":"helm","cat":"helm","n":"圣战头盔","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"dmg":[0,1],"def":[4,5],"mdef":[2,3]},"cqReq":{"dmg":40},"weight":20,"durability":7,"cqSource":"1.76 资料表","dmg":[0,1],"def":[4,5],"bm":{"mdef":[2,3]}},
{"id":"hlmfashentoukui","s":"helm","cat":"helm","n":"法神头盔","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"mag":[0,1],"def":[4,4],"mdef":[1,2]},"cqReq":{"mag":28},"weight":2,"durability":7,"cqSource":"1.76 资料表","def":[4,4],"bm":{"mag":[0,1],"mdef":[1,2]}},
{"id":"hlmtianzuntoukui","s":"helm","cat":"helm","n":"天尊头盔","q":30,"str":0,"tier":2,"cqTier":"basic","cqRange":{"tao":[0,1],"def":[4,4],"mdef":[1,2]},"cqReq":{"tao":25},"weight":3,"durability":7,"cqSource":"1.76 资料表","def":[4,4],"bm":{"tao":[0,1],"mdef":[1,2]}}
];
const ICONS={
 "swd1": "assets/cq/icon/mir2/eq_swd1.png",
 "dag1": "assets/cq/icon/mir2/eq_dag1.png",
 "swd2": "assets/cq/icon/mir2/eq_swd2.png",
 "swd3": "assets/cq/icon/mir2/eq_swd3.png",
 "axe1": "assets/cq/icon/eq_axe1.png",
 "swd4": "assets/cq/icon/mir2/eq_swd4.png",
 "wand1": "assets/cq/icon/mir2/eq_wand1.png",
 "wand2": "assets/cq/icon/mir2/eq_wand2.png",
 "swd5": "assets/cq/icon/mir2/eq_swd5.png",
 "swd6": "assets/cq/icon/eq_swd6.png",
 "swd7": "assets/cq/icon/mir2/eq_swd7.png",
 "wand3": "assets/cq/icon/mir2/eq_wand3.png",
 "wand4": "assets/cq/icon/mir2/eq_wand4.png",
 "axe2": "assets/cq/icon/eq_axe2.png",
 "swd8": "assets/cq/icon/mir2/eq_swd8.png",
 "arm1": "assets/cq/icon/mir2/eq_arm1.png",
 "arm2": "assets/cq/icon/mir2/eq_arm2.png",
 "arm3": "assets/cq/icon/mir2/eq_arm3.png",
 "arm4": "assets/cq/icon/mir2/eq_arm4.png",
 "arm5": "assets/cq/icon/mir2/eq_arm5.png",
 "arm6": "assets/cq/icon/mir2/eq_arm6.png",
 "arm7": "assets/cq/icon/eq_arm7.png",
 "hlm1": "assets/cq/icon/mir2/eq_hlm1.png",
 "hlm2": "assets/cq/icon/mir2/eq_hlm2.png",
 "hlm3": "assets/cq/icon/mir2/eq_hlm3.png",
 "hlm4": "assets/cq/icon/mir2/eq_hlm4.png",
 "amu": "assets/cq/icon/mir2/eq_amu.png",
 "amu2": "assets/cq/icon/mir2/eq_amu2.png",
 "amu3": "assets/cq/icon/mir2/eq_amu3.png",
 "amu4": "assets/cq/icon/eq_amu4.png",
 "amu5": "assets/cq/icon/mir2/eq_amu5.png",
 "amu6": "assets/cq/icon/mir2/eq_amu6.png",
 "shd1": "assets/cq/icon/mir2/eq_shd1.png",
 "shd2": "assets/cq/icon/mir2/eq_shd2.png",
 "shd3": "assets/cq/icon/mir2/eq_shd3.png",
 "shd4": "assets/cq/icon/eq_shd4.png",
 "shd5": "assets/cq/icon/eq_shd5.png",
 "glv1": "assets/cq/icon/mir2/eq_glv1.png",
 "glv2": "assets/cq/icon/eq_glv2.png",
 "glv3": "assets/cq/icon/eq_glv3.png",
 "glv4": "assets/cq/icon/mir2/eq_glv4.png",
 "glv5": "assets/cq/icon/mir2/eq_glv5.png",
 "rin": "assets/cq/icon/mir2/eq_rin.png",
 "rin2": "assets/cq/icon/mir2/eq_rin2.png",
 "rin3": "assets/cq/icon/eq_rin3.png",
 "rin4": "assets/cq/icon/mir2/eq_rin4.png",
 "rin5": "assets/cq/icon/mir2/eq_rin5.png",
 "rin6": "assets/cq/icon/eq_rin6.png",
 "blt1": "assets/cq/icon/mir2/eq_blt1.png",
 "blt2": "assets/cq/icon/eq_blt2.png",
 "blt3": "assets/cq/icon/eq_blt3.png",
 "bot1": "assets/cq/icon/mir2/eq_bot1.png",
 "bot2": "assets/cq/icon/eq_bot2.png",
 "bot3": "assets/cq/icon/eq_bot3.png",
 "swdwumujian": "assets/cq/icon/mir2/eq_swdwumujian.png",
 "swdhezuichu": "assets/cq/icon/mir2/eq_swdhezuichu.png",
 "swdluocha": "assets/cq/icon/mir2/eq_swdluocha.png",
 "swdpohun": "assets/cq/icon/mir2/eq_swdpohun.png",
 "swdningshuang": "assets/cq/icon/mir2/eq_swdningshuang.png",
 "swdjingzhongyue": "assets/cq/icon/mir2/eq_swdjingzhongyue.png",
 "swdcaijuezhizhang": "assets/cq/icon/mir2/eq_swdcaijuezhizhang.png",
 "swdtulong": "assets/cq/icon/mir2/eq_swdtulong.png",
 "swdmingyunzhiren": "assets/cq/icon/mir2/eq_swdmingyunzhiren.png",
 "swdluoposhenbing": "assets/cq/icon/mir2/eq_swdluoposhenbing.png",
 "swdchixuemojian": "assets/cq/icon/mir2/eq_swdchixuemojian.png",
 "swdnuzhan": "assets/cq/icon/mir2/eq_swdnuzhan.png",
 "swdqidaozhiren": "assets/cq/icon/mir2/eq_swdqidaozhiren.png",
 "wandxueyin": "assets/cq/icon/mir2/eq_wandxueyin.png",
 "wandguyuquanzhang": "assets/cq/icon/mir2/eq_wandguyuquanzhang.png",
 "wandshihunfazhang": "assets/cq/icon/mir2/eq_wandshihunfazhang.png",
 "wandlongya": "assets/cq/icon/mir2/eq_wandlongya.png",
 "wandbanyue": "assets/cq/icon/mir2/eq_wandbanyue.png",
 "wandyinshe": "assets/cq/icon/mir2/eq_wandyinshe.png",
 "wandwujigun": "assets/cq/icon/mir2/eq_wandwujigun.png",
 "wandlongwenjian": "assets/cq/icon/mir2/eq_wandlongwenjian.png",
 "wandxiaoyaoshan": "assets/cq/icon/mir2/eq_wandxiaoyaoshan.png",
 "armtianmoshenjia": "assets/cq/icon/mir2/eq_armtianmoshenjia.png",
 "armshengzhanbaojia": "assets/cq/icon/mir2/eq_armshengzhanbaojia.png",
 "armemochangpao": "assets/cq/icon/mir2/eq_armemochangpao.png",
 "armfashenpifeng": "assets/cq/icon/mir2/eq_armfashenpifeng.png",
 "armnichangyuyi": "assets/cq/icon/mir2/eq_armnichangyuyi.png",
 "armyoulingzhanyi": "assets/cq/icon/mir2/eq_armyoulingzhanyi.png",
 "armtianzundaopao": "assets/cq/icon/mir2/eq_armtianzundaopao.png",
 "armtianshizhangpao": "assets/cq/icon/mir2/eq_armtianshizhangpao.png",
 "amuqifuxianglian": "assets/cq/icon/mir2/eq_amuqifuxianglian.png",
 "amujiqiaoxianglian": "assets/cq/icon/mir2/eq_amujiqiaoxianglian.png",
 "amutancexianglian": "assets/cq/icon/mir2/eq_amutancexianglian.png",
 "amuheiseshuijingxianglian": "assets/cq/icon/mir2/eq_amuheiseshuijingxianglian.png",
 "amuhuangseshuijingxianglian": "assets/cq/icon/mir2/eq_amuhuangseshuijingxianglian.png",
 "amumoguixianglian": "assets/cq/icon/mir2/eq_amumoguixianglian.png",
 "amulanfeicuixianglian": "assets/cq/icon/mir2/eq_amulanfeicuixianglian.png",
 "amuyoulingxianglian": "assets/cq/icon/mir2/eq_amuyoulingxianglian.png",
 "amulvsexianglian": "assets/cq/icon/mir2/eq_amulvsexianglian.png",
 "amukuangfengxianglian": "assets/cq/icon/mir2/eq_amukuangfengxianglian.png",
 "amujiyixianglian": "assets/cq/icon/mir2/eq_amujiyixianglian.png",
 "amushengzhanxianglian": "assets/cq/icon/mir2/eq_amushengzhanxianglian.png",
 "amubaijinxianglian": "assets/cq/icon/mir2/eq_amubaijinxianglian.png",
 "amuhupoxianglian": "assets/cq/icon/mir2/eq_amuhupoxianglian.png",
 "amufangdajing": "assets/cq/icon/mir2/eq_amufangdajing.png",
 "amushengmingxianglian": "assets/cq/icon/mir2/eq_amushengmingxianglian.png",
 "amuemolingdang": "assets/cq/icon/mir2/eq_amuemolingdang.png",
 "amufashenxianglian": "assets/cq/icon/mir2/eq_amufashenxianglian.png",
 "amumoxuexianglian": "assets/cq/icon/mir2/eq_amumoxuexianglian.png",
 "amuhongmoxianglian": "assets/cq/icon/mir2/eq_amuhongmoxianglian.png",
 "amuduobishoulian": "assets/cq/icon/mir2/eq_amuduobishoulian.png",
 "amufenghuangmingzhu": "assets/cq/icon/mir2/eq_amufenghuangmingzhu.png",
 "amuzhudi": "assets/cq/icon/mir2/eq_amuzhudi.png",
 "amulinghunxianglian": "assets/cq/icon/mir2/eq_amulinghunxianglian.png",
 "amuqidaoxianglian": "assets/cq/icon/mir2/eq_amuqidaoxianglian.png",
 "amutianzunxianglian": "assets/cq/icon/mir2/eq_amutianzunxianglian.png",
 "glvxiaoshouzhuo": "assets/cq/icon/mir2/eq_glvxiaoshouzhuo.png",
 "glvyinshouzhuo": "assets/cq/icon/mir2/eq_glvyinshouzhuo.png",
 "shdpizhishoutao": "assets/cq/icon/mir2/eq_shdpizhishoutao.png",
 "glvpizhishoutao": "assets/cq/icon/mir2/eq_glvpizhishoutao.png",
 "shdxiapuershouzhuo": "assets/cq/icon/mir2/eq_shdxiapuershouzhuo.png",
 "glvxiapuershouzhuo": "assets/cq/icon/mir2/eq_glvxiapuershouzhuo.png",
 "shdbixieshouzhuo": "assets/cq/icon/mir2/eq_shdbixieshouzhuo.png",
 "glvbixieshouzhuo": "assets/cq/icon/mir2/eq_glvbixieshouzhuo.png",
 "shdjiangushoutao": "assets/cq/icon/mir2/eq_shdjiangushoutao.png",
 "glvjiangushoutao": "assets/cq/icon/mir2/eq_glvjiangushoutao.png",
 "shdmofashouzhuo": "assets/cq/icon/mir2/eq_shdmofashouzhuo.png",
 "glvmofashouzhuo": "assets/cq/icon/mir2/eq_glvmofashouzhuo.png",
 "shdshenmiyaodai": "assets/cq/icon/mir2/eq_shdshenmiyaodai.png",
 "glvshenmiyaodai": "assets/cq/icon/mir2/eq_glvshenmiyaodai.png",
 "glvdashouzhuo": "assets/cq/icon/mir2/eq_glvdashouzhuo.png",
 "glvmolishouzhuo": "assets/cq/icon/mir2/eq_glvmolishouzhuo.png",
 "shdjinshouzhuo": "assets/cq/icon/mir2/eq_shdjinshouzhuo.png",
 "glvjinshouzhuo": "assets/cq/icon/mir2/eq_glvjinshouzhuo.png",
 "shdyoulingshoutao": "assets/cq/icon/mir2/eq_shdyoulingshoutao.png",
 "glvyoulingshoutao": "assets/cq/icon/mir2/eq_glvyoulingshoutao.png",
 "shdyanluoshoutao": "assets/cq/icon/mir2/eq_shdyanluoshoutao.png",
 "glvyanluoshoutao": "assets/cq/icon/mir2/eq_glvyanluoshoutao.png",
 "shdqishishouzhuo": "assets/cq/icon/mir2/eq_shdqishishouzhuo.png",
 "glvqishishouzhuo": "assets/cq/icon/mir2/eq_glvqishishouzhuo.png",
 "shdheitieshoutao": "assets/cq/icon/mir2/eq_shdheitieshoutao.png",
 "glvheitieshoutao": "assets/cq/icon/mir2/eq_glvheitieshoutao.png",
 "shdqidaoshouzhuo": "assets/cq/icon/mir2/eq_shdqidaoshouzhuo.png",
 "glvqidaoshouzhuo": "assets/cq/icon/mir2/eq_glvqidaoshouzhuo.png",
 "shdshengzhanshouzhuo": "assets/cq/icon/mir2/eq_shdshengzhanshouzhuo.png",
 "glvshengzhanshouzhuo": "assets/cq/icon/mir2/eq_glvshengzhanshouzhuo.png",
 "shdheitanshouzhuo": "assets/cq/icon/mir2/eq_shdheitanshouzhuo.png",
 "glvheitanshouzhuo": "assets/cq/icon/mir2/eq_glvheitanshouzhuo.png",
 "shdsibeiershouzhuo": "assets/cq/icon/mir2/eq_shdsibeiershouzhuo.png",
 "glvsibeiershouzhuo": "assets/cq/icon/mir2/eq_glvsibeiershouzhuo.png",
 "shdlongzhishouzhuo": "assets/cq/icon/mir2/eq_shdlongzhishouzhuo.png",
 "glvlongzhishouzhuo": "assets/cq/icon/mir2/eq_glvlongzhishouzhuo.png",
 "shdjiyishouzhuo": "assets/cq/icon/mir2/eq_shdjiyishouzhuo.png",
 "glvjiyishouzhuo": "assets/cq/icon/mir2/eq_glvjiyishouzhuo.png",
 "shdfashenshouzhuo": "assets/cq/icon/mir2/eq_shdfashenshouzhuo.png",
 "glvfashenshouzhuo": "assets/cq/icon/mir2/eq_glvfashenshouzhuo.png",
 "shdsanyanshouzhuo": "assets/cq/icon/mir2/eq_shdsanyanshouzhuo.png",
 "glvsanyanshouzhuo": "assets/cq/icon/mir2/eq_glvsanyanshouzhuo.png",
 "shdxinlingshouzhuo": "assets/cq/icon/mir2/eq_shdxinlingshouzhuo.png",
 "glvxinlingshouzhuo": "assets/cq/icon/mir2/eq_glvxinlingshouzhuo.png",
 "shdtianzunshouzhuo": "assets/cq/icon/mir2/eq_shdtianzunshouzhuo.png",
 "glvtianzunshouzhuo": "assets/cq/icon/mir2/eq_glvtianzunshouzhuo.png",
 "shdmoxueshouzhuo": "assets/cq/icon/mir2/eq_shdmoxueshouzhuo.png",
 "glvmoxueshouzhuo": "assets/cq/icon/mir2/eq_glvmoxueshouzhuo.png",
 "shdhongmoshouzhuo": "assets/cq/icon/mir2/eq_shdhongmoshouzhuo.png",
 "glvhongmoshouzhuo": "assets/cq/icon/mir2/eq_glvhongmoshouzhuo.png",
 "rinjinjiezhi": "assets/cq/icon/mir2/eq_rinjinjiezhi.png",
 "rinjiangyaochumojiezhi": "assets/cq/icon/mir2/eq_rinjiangyaochumojiezhi.png",
 "rinshenmijiezhi": "assets/cq/icon/mir2/eq_rinshenmijiezhi.png",
 "rinyinshenjiezhi": "assets/cq/icon/mir2/eq_rinyinshenjiezhi.png",
 "rinchuansongjiezhi": "assets/cq/icon/mir2/eq_rinchuansongjiezhi.png",
 "rinfangyujiezhi": "assets/cq/icon/mir2/eq_rinfangyujiezhi.png",
 "rinfuhuojiezhi": "assets/cq/icon/mir2/eq_rinfuhuojiezhi.png",
 "rinhushenjiezhi": "assets/cq/icon/mir2/eq_rinhushenjiezhi.png",
 "rinchaofuzaijiezhi": "assets/cq/icon/mir2/eq_rinchaofuzaijiezhi.png",
 "rinhuoyanjiezhi": "assets/cq/icon/mir2/eq_rinhuoyanjiezhi.png",
 "rinqiuhunjiezhi": "assets/cq/icon/mir2/eq_rinqiuhunjiezhi.png",
 "rinheiseshuijingjiezhi": "assets/cq/icon/mir2/eq_rinheiseshuijingjiezhi.png",
 "rinlongzhijiezhi": "assets/cq/icon/mir2/eq_rinlongzhijiezhi.png",
 "rinliliangjiezhi": "assets/cq/icon/mir2/eq_rinliliangjiezhi.png",
 "rinkuangfengjiezhi": "assets/cq/icon/mir2/eq_rinkuangfengjiezhi.png",
 "rinshengzhanjiezhi": "assets/cq/icon/mir2/eq_rinshengzhanjiezhi.png",
 "rinmoxuejiezhi": "assets/cq/icon/mir2/eq_rinmoxuejiezhi.png",
 "rinhongmojiezhi": "assets/cq/icon/mir2/eq_rinhongmojiezhi.png",
 "rinmabijiezhi": "assets/cq/icon/mir2/eq_rinmabijiezhi.png",
 "rinshengtiejiezhi": "assets/cq/icon/mir2/eq_rinshengtiejiezhi.png",
 "rinsheyanjiezhi": "assets/cq/icon/mir2/eq_rinsheyanjiezhi.png",
 "rinmeilijiezhi": "assets/cq/icon/mir2/eq_rinmeilijiezhi.png",
 "rinhongbaoshijiezhi": "assets/cq/icon/mir2/eq_rinhongbaoshijiezhi.png",
 "rinzibiluo": "assets/cq/icon/mir2/eq_rinzibiluo.png",
 "rinqidaojiezhi": "assets/cq/icon/mir2/eq_rinqidaojiezhi.png",
 "rinfashenjiezhi": "assets/cq/icon/mir2/eq_rinfashenjiezhi.png",
 "rinbolijiezhi": "assets/cq/icon/mir2/eq_rinbolijiezhi.png",
 "rinzhenzhujiezhi": "assets/cq/icon/mir2/eq_rinzhenzhujiezhi.png",
 "rindaodejiezhi": "assets/cq/icon/mir2/eq_rindaodejiezhi.png",
 "rinbojinjiezhi": "assets/cq/icon/mir2/eq_rinbojinjiezhi.png",
 "rintaitanjiezhi": "assets/cq/icon/mir2/eq_rintaitanjiezhi.png",
 "rinjiyijiezhi": "assets/cq/icon/mir2/eq_rinjiyijiezhi.png",
 "rintianzunjiezhi": "assets/cq/icon/mir2/eq_rintianzunjiezhi.png",
 "hlmjinglingtoukui": "assets/cq/icon/mir2/eq_hlmjinglingtoukui.png",
 "hlmheitietoukui": "assets/cq/icon/mir2/eq_hlmheitietoukui.png",
 "hlmshenmitoukui": "assets/cq/icon/mir2/eq_hlmshenmitoukui.png",
 "hlmqidaotoukui": "assets/cq/icon/mir2/eq_hlmqidaotoukui.png",
 "hlmjiyitoukui": "assets/cq/icon/mir2/eq_hlmjiyitoukui.png",
 "hlmshengzhantoukui": "assets/cq/icon/mir2/eq_hlmshengzhantoukui.png",
 "hlmfashentoukui": "assets/cq/icon/mir2/eq_hlmfashentoukui.png",
 "hlmtianzuntoukui": "assets/cq/icon/mir2/eq_hlmtianzuntoukui.png",
 "bltshengzhanyaodai": "assets/cq/icon/mir2/eq_bltshengzhanyaodai.png",
 "botshengzhanzhanxue": "assets/cq/icon/mir2/eq_botshengzhanzhanxue.png",
 "bltfashenyaodai": "assets/cq/icon/mir2/eq_bltfashenyaodai.png",
 "botfashenmoxue": "assets/cq/icon/mir2/eq_botfashenmoxue.png",
 "blttianzunyaodai": "assets/cq/icon/mir2/eq_blttianzunyaodai.png",
 "bottianzundaoxue": "assets/cq/icon/mir2/eq_bottianzundaoxue.png",
 "armleitingzhanjia": "assets/cq/icon/mir2/eq_armleitingzhanjia.png",
 "hlmleitingtoukui": "assets/cq/icon/mir2/eq_hlmleitingtoukui.png",
 "amuleitingxianglian": "assets/cq/icon/mir2/eq_amuleitingxianglian.png",
 "shdleitingshouzhuo": "assets/cq/icon/mir2/eq_shdleitingshouzhuo.png",
 "glvleitingshouzhuo": "assets/cq/icon/mir2/eq_glvleitingshouzhuo.png",
 "rinleitingjiezhi": "assets/cq/icon/mir2/eq_rinleitingjiezhi.png",
 "bltleitingyaodai": "assets/cq/icon/mir2/eq_bltleitingyaodai.png",
 "botleitingzhanxue": "assets/cq/icon/mir2/eq_botleitingzhanxue.png",
 "armlieyanmoyi": "assets/cq/icon/mir2/eq_armlieyanmoyi.png",
 "hlmlieyantoukui": "assets/cq/icon/mir2/eq_hlmlieyantoukui.png",
 "amulieyanxianglian": "assets/cq/icon/mir2/eq_amulieyanxianglian.png",
 "shdlieyanshouzhuo": "assets/cq/icon/mir2/eq_shdlieyanshouzhuo.png",
 "glvlieyanshouzhuo": "assets/cq/icon/mir2/eq_glvlieyanshouzhuo.png",
 "rinlieyanjiezhi": "assets/cq/icon/mir2/eq_rinlieyanjiezhi.png",
 "bltlieyanyaodai": "assets/cq/icon/mir2/eq_bltlieyanyaodai.png",
 "botlieyanmoxue": "assets/cq/icon/mir2/eq_botlieyanmoxue.png",
 "armguangmangdaopao": "assets/cq/icon/mir2/eq_armguangmangdaopao.png",
 "hlmguangmangtoukui": "assets/cq/icon/mir2/eq_hlmguangmangtoukui.png",
 "amuguangmangxianglian": "assets/cq/icon/mir2/eq_amuguangmangxianglian.png",
 "shdguangmangshouzhuo": "assets/cq/icon/mir2/eq_shdguangmangshouzhuo.png",
 "glvguangmangshouzhuo": "assets/cq/icon/mir2/eq_glvguangmangshouzhuo.png",
 "ringuangmangjiezhi": "assets/cq/icon/mir2/eq_ringuangmangjiezhi.png",
 "bltguangmangyaodai": "assets/cq/icon/mir2/eq_bltguangmangyaodai.png",
 "botguangmangdaoxue": "assets/cq/icon/mir2/eq_botguangmangdaoxue.png",
 "armleitingzhanjiaplus": "assets/cq/icon/mir2/eq_armleitingzhanjiaplus.png",
 "hlmleitingtoukuiplus": "assets/cq/icon/mir2/eq_hlmleitingtoukuiplus.png",
 "amuleitingxianglianplus": "assets/cq/icon/mir2/eq_amuleitingxianglianplus.png",
 "shdleitingshouzhuoplus": "assets/cq/icon/mir2/eq_shdleitingshouzhuoplus.png",
 "glvleitingshouzhuoplus": "assets/cq/icon/mir2/eq_glvleitingshouzhuoplus.png",
 "rinleitingjiezhiplus": "assets/cq/icon/mir2/eq_rinleitingjiezhiplus.png",
 "bltleitingyaodaiplus": "assets/cq/icon/mir2/eq_bltleitingyaodaiplus.png",
 "botleitingzhanxueplus": "assets/cq/icon/mir2/eq_botleitingzhanxueplus.png",
 "armlieyanmoyiplus": "assets/cq/icon/mir2/eq_armlieyanmoyiplus.png",
 "hlmlieyantoukuiplus": "assets/cq/icon/mir2/eq_hlmlieyantoukuiplus.png",
 "amulieyanxianglianplus": "assets/cq/icon/mir2/eq_amulieyanxianglianplus.png",
 "shdlieyanshouzhuoplus": "assets/cq/icon/mir2/eq_shdlieyanshouzhuoplus.png",
 "glvlieyanshouzhuoplus": "assets/cq/icon/mir2/eq_glvlieyanshouzhuoplus.png",
 "rinlieyanjiezhiplus": "assets/cq/icon/mir2/eq_rinlieyanjiezhiplus.png",
 "bltlieyanyaodaiplus": "assets/cq/icon/mir2/eq_bltlieyanyaodaiplus.png",
 "botlieyanmoxueplus": "assets/cq/icon/mir2/eq_botlieyanmoxueplus.png",
 "armguangmangdaopaoplus": "assets/cq/icon/mir2/eq_armguangmangdaopaoplus.png",
 "hlmguangmangtoukuiplus": "assets/cq/icon/mir2/eq_hlmguangmangtoukuiplus.png",
 "amuguangmangxianglianplus": "assets/cq/icon/mir2/eq_amuguangmangxianglianplus.png",
 "shdguangmangshouzhuoplus": "assets/cq/icon/mir2/eq_shdguangmangshouzhuoplus.png",
 "glvguangmangshouzhuoplus": "assets/cq/icon/mir2/eq_glvguangmangshouzhuoplus.png",
 "ringuangmangjiezhiplus": "assets/cq/icon/mir2/eq_ringuangmangjiezhiplus.png",
 "bltguangmangyaodaiplus": "assets/cq/icon/mir2/eq_bltguangmangyaodaiplus.png",
 "botguangmangdaoxueplus": "assets/cq/icon/mir2/eq_botguangmangdaoxueplus.png",
 "armbaijinzs": "assets/cq/icon/mir2/eq_armbaijinzs.png",
 "hlmbaijinzs": "assets/cq/icon/mir2/eq_hlmbaijinzs.png",
 "amubaijinzs": "assets/cq/icon/mir2/eq_amubaijinzs.png",
 "shdbaijinzs": "assets/cq/icon/mir2/eq_shdbaijinzs.png",
 "glvbaijinzs": "assets/cq/icon/mir2/eq_glvbaijinzs.png",
 "rinbaijinzs": "assets/cq/icon/mir2/eq_rinbaijinzs.png",
 "bltbaijinzs": "assets/cq/icon/mir2/eq_bltbaijinzs.png",
 "botbaijinzs": "assets/cq/icon/mir2/eq_botbaijinzs.png",
 "armbaijinfs": "assets/cq/icon/mir2/eq_armbaijinfs.png",
 "hlmbaijinfs": "assets/cq/icon/mir2/eq_hlmbaijinfs.png",
 "amubaijinfs": "assets/cq/icon/mir2/eq_amubaijinfs.png",
 "shdbaijinfs": "assets/cq/icon/mir2/eq_shdbaijinfs.png",
 "glvbaijinfs": "assets/cq/icon/mir2/eq_glvbaijinfs.png",
 "rinbaijinfs": "assets/cq/icon/mir2/eq_rinbaijinfs.png",
 "bltbaijinfs": "assets/cq/icon/mir2/eq_bltbaijinfs.png",
 "botbaijinfs": "assets/cq/icon/mir2/eq_botbaijinfs.png",
 "armbaijinds": "assets/cq/icon/mir2/eq_armbaijinds.png",
 "hlmbaijinds": "assets/cq/icon/mir2/eq_hlmbaijinds.png",
 "amubaijinds": "assets/cq/icon/mir2/eq_amubaijinds.png",
 "shdbaijinds": "assets/cq/icon/mir2/eq_shdbaijinds.png",
 "glvbaijinds": "assets/cq/icon/mir2/eq_glvbaijinds.png",
 "rinbaijinds": "assets/cq/icon/mir2/eq_rinbaijinds.png",
 "bltbaijinds": "assets/cq/icon/mir2/eq_bltbaijinds.png",
 "botbaijinds": "assets/cq/icon/mir2/eq_botbaijinds.png",
 "armxingwangzs": "assets/cq/icon/mir2/eq_armxingwangzs.png",
 "hlmxingwangzs": "assets/cq/icon/mir2/eq_hlmxingwangzs.png",
 "amuxingwangzs": "assets/cq/icon/mir2/eq_amuxingwangzs.png",
 "shdxingwangzs": "assets/cq/icon/mir2/eq_shdxingwangzs.png",
 "glvxingwangzs": "assets/cq/icon/mir2/eq_glvxingwangzs.png",
 "rinxingwangzs": "assets/cq/icon/mir2/eq_rinxingwangzs.png",
 "bltxingwangzs": "assets/cq/icon/mir2/eq_bltxingwangzs.png",
 "botxingwangzs": "assets/cq/icon/mir2/eq_botxingwangzs.png",
 "armxingwangfs": "assets/cq/icon/mir2/eq_armxingwangfs.png",
 "hlmxingwangfs": "assets/cq/icon/mir2/eq_hlmxingwangfs.png",
 "amuxingwangfs": "assets/cq/icon/mir2/eq_amuxingwangfs.png",
 "shdxingwangfs": "assets/cq/icon/mir2/eq_shdxingwangfs.png",
 "glvxingwangfs": "assets/cq/icon/mir2/eq_glvxingwangfs.png",
 "rinxingwangfs": "assets/cq/icon/mir2/eq_rinxingwangfs.png",
 "bltxingwangfs": "assets/cq/icon/mir2/eq_bltxingwangfs.png",
 "botxingwangfs": "assets/cq/icon/mir2/eq_botxingwangfs.png",
 "armxingwangds": "assets/cq/icon/mir2/eq_armxingwangds.png",
 "hlmxingwangds": "assets/cq/icon/mir2/eq_hlmxingwangds.png",
 "amuxingwangds": "assets/cq/icon/mir2/eq_amuxingwangds.png",
 "shdxingwangds": "assets/cq/icon/mir2/eq_shdxingwangds.png",
 "glvxingwangds": "assets/cq/icon/mir2/eq_glvxingwangds.png",
 "rinxingwangds": "assets/cq/icon/mir2/eq_rinxingwangds.png",
 "bltxingwangds": "assets/cq/icon/mir2/eq_bltxingwangds.png",
 "botxingwangds": "assets/cq/icon/mir2/eq_botxingwangds.png",
 "swdkaitian": "assets/cq/icon/mir2/eq_swdkaitian.png",
 "wandzhentian": "assets/cq/icon/mir2/eq_wandzhentian.png",
 "wandxuantian": "assets/cq/icon/mir2/eq_wandxuantian.png",
 "amuzhanshenxianglian": "assets/cq/icon/mir2/eq_amuzhanshenxianglian.png",
 "shdzhanshenshouzhuo": "assets/cq/icon/mir2/eq_shdzhanshenshouzhuo.png",
 "glvzhanshenshouzhuo": "assets/cq/icon/mir2/eq_glvzhanshenshouzhuo.png",
 "rinzhanshenjiezhi": "assets/cq/icon/mir2/eq_rinzhanshenjiezhi.png",
 "bltzhanshenyaodai": "assets/cq/icon/mir2/eq_bltzhanshenyaodai.png",
 "botzhanshenzhanxue": "assets/cq/icon/mir2/eq_botzhanshenzhanxue.png",
 "amushengmoxianglian": "assets/cq/icon/mir2/eq_amushengmoxianglian.png",
 "shdshengmoshouzhuo": "assets/cq/icon/mir2/eq_shdshengmoshouzhuo.png",
 "glvshengmoshouzhuo": "assets/cq/icon/mir2/eq_glvshengmoshouzhuo.png",
 "rinshengmojiezhi": "assets/cq/icon/mir2/eq_rinshengmojiezhi.png",
 "bltshengmoyaodai": "assets/cq/icon/mir2/eq_bltshengmoyaodai.png",
 "botshengmomoxue": "assets/cq/icon/mir2/eq_botshengmomoxue.png",
 "amuzhenhunxianglian": "assets/cq/icon/mir2/eq_amuzhenhunxianglian.png",
 "shdzhenhunshouzhuo": "assets/cq/icon/mir2/eq_shdzhenhunshouzhuo.png",
 "glvzhenhunshouzhuo": "assets/cq/icon/mir2/eq_glvzhenhunshouzhuo.png",
 "rinzhenhunjiezhi": "assets/cq/icon/mir2/eq_rinzhenhunjiezhi.png",
 "bltzhenhunyaodai": "assets/cq/icon/mir2/eq_bltzhenhunyaodai.png",
 "botzhenhundaoxue": "assets/cq/icon/mir2/eq_botzhenhundaoxue.png",
 "shdtieshouzhuo": "assets/cq/icon/mir2/eq_shdtieshouzhuo.png",
 "shdgangshouzhuo": "assets/cq/icon/mir2/eq_shdgangshouzhuo.png",
 "shdsishenshoutao": "assets/cq/icon/mir2/eq_shdsishenshoutao.png",
 "shddaoshishouzhuo": "assets/cq/icon/mir2/eq_shddaoshishouzhuo.png",
 "armfengtianmojia": "assets/cq/icon/mir2/eq_armfengtianmojia.png",
 "armhuangtianmoyi": "assets/cq/icon/mir2/eq_armhuangtianmoyi.png",
 "swdbazhezhiren": "assets/cq/icon/mir2/eq_swdbazhezhiren.png"
};
const TIERS=['basic','woma','zuma','chiyue','molong','molongplus','baijin','xingwang'];
const OLD=Object.fromEntries(BASES.map(b=>[b.id,JSON.parse(JSON.stringify(b))]));
const prefix={weapon:'swd',armor:'arm',helm:'hlm',amulet:'amu',shield:'shd',gloves:'glv',ring:'rin',belt:'blt',boots:'bot'};
const slots=Object.keys(prefix), labels={weapon:'武器',armor:'衣服',helm:'头盔',amulet:'项链',shield:'手镯',gloves:'手镯',ring:'戒指',belt:'腰带',boots:'靴'};
function register(b){if(BASEM[b.id])Object.assign(BASEM[b.id],b);else{BASES.push(b);BASEM[b.id]=b}return BASEM[b.id]}
for(const b of TABLE){const speed={'祈祷之刃':-1,'狂风项链':2,'狂风戒指':1}[b.n];if(speed)b.bm=Object.assign({},b.bm,{ias:[speed,speed]});if(b.s!=='weapon'&&b.dmg){b.bm=Object.assign({},b.bm,{mindmg:[b.dmg[0],b.dmg[0]],maxdmg:[b.dmg[1],b.dmg[1]]});delete b.dmg}register(b)}
for(const b of BASES){b.cqTier=b.cqTier||'basic';b.cqRange=b.cqRange||Object.assign({},b.def?{def:b.def}:{});b.cqReq=b.cqReq||{lv:b.q};b.weight=b.weight==null?1:b.weight;b.durability=b.durability||10;b.cqSource=b.cqSource||'本游戏设计值'}
// Explicit names/ids: no guessed names are presented as sourced canonical values.
const series=[['chiyue','shengzhan','圣战','shengzhan','fashen','法神','fashen','tianzun','天尊','tianzun',40],['molong','leiting','雷霆','leiting','lieyan','烈焰','lieyan','guangmang','光芒','guangmang',42],['molongplus','leitingplus','强化雷霆','leiting','lieyanplus','强化烈焰','lieyan','guangmangplus','强化光芒','guangmang',46],['baijin','baijin_zs','白金战士','baijinzs','baijin_fs','白金法师','baijinfs','baijin_ds','白金道士','baijinds',52],['xingwang','xingwang_zs','星王战士','xingwangzs','xingwang_fs','星王法师','xingwangfs','xingwang_ds','星王道士','xingwangds',58]];
const suf={helm:'toukui',amulet:'xianglian',shield:'shouzhuo',gloves:'shouzhuo',ring:'jiezhi',belt:'yaodai'};
function setDef(id,n,cls,tier){SETS[id]={n,ccls:cls,cqTier:tier,cqOriginal:true,bonus:{2:{life:12},4:{life:18},6:{mana:15}}}}
function setPart(id,b){const cid='set_'+id+'_'+b.s;if(!SETITEMS.some(x=>x.id===cid))SETITEMS.push({id:cid,n:b.n,b:b.id,set:id,lv:b.q,rq:b.q,m:{},cqOriginal:true})}
for(let t=0;t<series.length;t++){
 const r=series[t];for(let c=0;c<3;c++){
  const cls=['zs','fs','ds'][c],id=r[1+c*3],n=r[2+c*3],stem=r[3+c*3],key=['dmg','mag','tao'][c];setDef(id,n,cls,r[0]);
  for(const slot of slots.filter(s=>s!=='weapon')){
   const tail=slot==='armor'?['zhanjia','moyi','daopao'][c]:slot==='boots'?['zhanxue','moxue','daoxue'][c]:suf[slot];
   const bid=prefix[slot]+stem+(t>=3?'':tail)+(r[0]==='molongplus'?'plus':'');
   let range={[key]:[slot==='armor'?1:0,2+t*2]},source='本游戏设计值';
   if(slot==='armor')range.def=[5+t,12+t];else if(['helm','belt','boots'].includes(slot))range.def=[1+t,3+t];
   if(slot==='armor'||slot==='helm')range.mdef=[1+t,3+t];
   if(t===1||t===2){const a=t===2?1:0;const rr=c===0?{amulet:[3,7],shield:[2,5],gloves:[2,5],ring:[3,8],belt:[1,3],boots:[1,3],armor:[1,3]}:c===1?{amulet:[3,8],shield:[2,6],gloves:[2,6],ring:[3,9],belt:[1,4],boots:[1,4],armor:[3,5]}:{amulet:[3,7],shield:[2,6],gloves:[2,6],ring:[3,8],belt:[1,4],boots:[1,4],armor:[3,5]};if(rr[slot]){range[key]=[rr[slot][0],rr[slot][1]+a];source='1.80 资料表；强化主属性上限+1'}if(['shield','gloves','ring'].includes(slot))range.def=[0,1];if(slot==='belt')range.def=c===1?[1,3]:[2,4];if(slot==='boots')range.def=[1,2];if(slot==='armor'){range.def=t===1?[5,12]:[6,13];range.mdef=t===1?[4,8]:[4,9]}}
   const canonical=t===0?TABLE.find(b=>b.n===(slot==='armor'?['圣战宝甲','法神披风','天尊道袍'][c]:['圣战','法神','天尊'][c]+(slot==='helm'?'头盔':slot==='amulet'?'项链':['shield','gloves'].includes(slot)?'手镯':slot==='ring'?'戒指':'?'))&&b.s===slot):null;
   const b=canonical?register(Object.assign({},canonical,{ccls:cls,cls:1,cqTier:r[0]})):register({id:bid,s:slot,cat:['shield','gloves'].includes(slot)?'bracelet':slot,n:n+(slot==='armor'?['战甲','魔衣','道袍'][c]:slot==='boots'?['战靴','魔靴','道靴'][c]:slot==='helm'?'头盔':slot==='belt'?'腰带':labels[slot]),q:r[10],tier:2,str:0,ccls:cls,cls:1,jew:['amulet','ring'].includes(slot)?1:0,cqTier:r[0],cqRange:range,cqReq:{lv:r[10]},weight:slot==='armor'?[60,20,35][c]:2,durability:slot==='armor'?[60,40,50][c]:8,cqSource:source});
   if(canonical){setPart(id,b);continue}
   if(range.dmg){b.bm=Object.assign(b.bm||{},{mindmg:[range.dmg[0],range.dmg[0]],maxdmg:[range.dmg[1],range.dmg[1]]})}
   if(range.def)b.def=range.def;
   b.bm=Object.assign(b.bm||{},Object.fromEntries(Object.entries(range).filter(([k])=>!['dmg','def'].includes(k))));setPart(id,b);
  }
 }
}
// 1.80 weapons: sourced main ranges; absent metadata explicitly uses design values.
for(const [id,n,cls,lv,dmg,magic,weight,durability]of [
 ['swdkaitian','开天','zs',43,[6,40],null,73,35],['wandzhentian','镇天','fs',43,[7,25],[5,12],26,35],['wandxuantian','玄天','ds',43,[8,31],[5,12],26,35]]){
 const r={dmg};if(magic)r[cls==='fs'?'mag':'tao']=magic;
 register({id,n,s:'weapon',cat:cls==='zs'?'sword':'wand',q:lv,tier:2,str:0,cls:1,ccls:cls,dmg,bm:magic?{[cls==='fs'?'mag':'tao']:magic,ar:[1,1]}:{},cqRange:r,cqTier:'xingwang',cqReq:{lv},weight,durability,cqSource:'1.80 武器资料；镇天/玄天重量持久为本游戏设计值'});
}
for(const [id,n,cls,stem,neck,brace,ring]of [['zhanshen','战神','zs','zhanshen',[3,8],[1,5],[0,9]],['shengmo','圣魔','fs','shengmo',[0,9],[1,5],[2,8]],['zhenhun','真魂','ds','zhenhun',[1,8],[1,5],[2,9]]]){
 setDef(id,n,cls,'molongplus');const key=cls==='zs'?'dmg':cls==='fs'?'mag':'tao';
 for(const slot of ['amulet','shield','gloves','ring','belt','boots']){
  const r={[key]:slot==='amulet'?neck:['shield','gloves'].includes(slot)?brace:slot==='ring'?ring:[1,1]};if(slot==='belt'||slot==='boots')r.def=[0,3];if(['shield','gloves'].includes(slot)){if(cls==='zs')r.def=[0,1];if(cls==='fs'){r.def=[0,2];r.mdef=[0,2]}}if(slot==='ring')r.mdef=[0,1];
  const bid=prefix[slot]+stem+(slot==='boots'?{zs:'zhanxue',fs:'moxue',ds:'daoxue'}[cls]:suf[slot]);
  const b=register({id:bid,n:n+labels[slot],s:slot,cat:['shield','gloves'].includes(slot)?'bracelet':slot,q:46,tier:2,str:0,cls:1,ccls:cls,cqTier:'molongplus',cqReq:{lv:46},cqRange:r,bm:key==='dmg'?{mindmg:[r[key][0],r[key][0]],maxdmg:[r[key][1],r[key][1]]}:{[key]:r[key]},weight:2,durability:8,cqSource:'1.80 首饰资料；腰靴为本游戏设计值'});if(r.def)b.def=r.def;if(r.mdef)b.bm.mdef=r.mdef;if(slot==='amulet'&&cls==='zs')b.bm.luck=[1,1];if(slot==='amulet'&&cls==='fs')b.bm.dex=[3,3];setPart(id,b);
 }
}
// 1.80 phoenix garments; same sourced stats, independent documented content identities.
for(const [id,n]of [['armfengtianmojia','凤天魔甲'],['armhuangtianmoyi','凰天魔衣']])register({id,n,s:'armor',cat:'armor',q:45,tier:2,str:0,cqTier:'xingwang',cqReq:{lv:45},def:[8,12],bm:{mindmg:[2,2],maxdmg:[2,2],mag:[3,5],tao:[3,5],mdef:[8,8]},cqRange:{dmg:[2,2],mag:[3,5],tao:[3,5],def:[8,12],mdef:[8,8]},weight:23,durability:50,cqSource:'1.80 衣服资料'});
register({id:'swdbazhezhiren',n:'霸者之刃',s:'weapon',cat:'sword',q:43,tier:2,str:0,cqTier:'molongplus',cqReq:{lv:43},dmg:[6,32],bm:{mag:[3,6],tao:[3,6]},cqRange:{dmg:[6,32],mag:[3,6],tao:[3,6]},weight:50,durability:35,cqSource:'本游戏设计值（资料未提供精确属性）'});
// Source-defined classic sets use their actual jewellery, rather than generic tier names.
const classic=[['woma_zs','沃玛战','zs','woma',['幽灵项链','幽灵手套','龙之戒指']],['woma_fs','沃玛法','fs','woma',['生命项链','思贝儿手镯','红宝石戒指']],['woma_ds','沃玛道','ds','woma',['天珠项链','心灵手镯','铂金戒指']],['zuma_zs','祖玛战','zs','zuma',['绿色项链','骑士手镯','力量戒指']],['zuma_fs','祖玛法','fs','zuma',['恶魔铃铛','龙之手镯','紫碧螺']],['zuma_ds','祖玛道','ds','zuma',['灵魂项链','三眼手镯','泰坦戒指']],['qidao','祈祷',null,'basic',['祈祷之刃','祈祷手镯','祈祷项链','祈祷戒指','祈祷头盔']],['jiyi','记忆',null,'basic',['记忆项链','记忆戒指','记忆手镯','记忆头盔']],['hongmo','虹魔',null,'zuma',['虹魔戒指','虹魔项链','虹魔手镯']],['moxue','魔血',null,'zuma',['魔血戒指','魔血手镯','魔血项链']],['shenmi','神秘',null,'basic',['神秘戒指','神秘腰带','神秘头盔']],['kuangfeng','狂风',null,'basic',['狂风项链','狂风戒指']]];
for(const [id,n,cls,tier,names]of classic){setDef(id,n,cls,tier);for(const name of names)for(const b of BASES.filter(b=>b.n===name)){b.cqTier=tier;setPart(id,b)}}
// Stable unique identity, including boss-specific legacy definitions.
const allowed=new Set(['mindmg','maxdmg','def','mag','tao','mdef','ar','dex','luck','curse','ias','life','mana','para','prot','revive','invis','teleport','overload']);
function clean(m,legacyDefinition=false){const out={};for(const[k,raw]of Object.entries(m||{})){const scale=legacyDefinition?(k==='ias'?5:k==='ar'?2:1):1;const v=scale===1?raw:Array.isArray(raw)?raw.map(n=>Math.ceil(n/scale)):Math.ceil(raw/scale);if(allowed.has(k))out[k]=v;else{const a=Array.isArray(v)?v:[v,v];out.life=Array.isArray(v)?a.map((x,i)=>(Array.isArray(out.life)?out.life[i]:out.life||0)+Math.max(0,Math.ceil(x||0))):(Array.isArray(out.life)?out.life[1]:out.life||0)+Math.max(0,Math.ceil(v||0))}}return out}
for(const u of UNIQUES){u.id=u.id||'uniq_'+(u.boss?u.boss+'_':'')+u.b;u.m=clean(u.m,true)}
const special=[['麻痹戒指','para',6],['护身戒指','prot',35],['复活戒指','revive',1],['隐身戒指','invis',1],['传送戒指','teleport',1],['超负载戒指','overload',1],['防御戒指',null,0],['火焰戒指',null,0]];
for(const[n,k,v]of special){const b=BASES.find(b=>b.n===n);if(!b)continue;b.cqSpecialBase=true;const id='uniq_'+b.id;if(!UNIQUES.some(u=>u.id===id))UNIQUES.push({id,n,b:b.id,lv:n==='隐身戒指'||n==='传送戒指'?12:16,rq:n==='隐身戒指'||n==='传送戒指'?12:16,m:k?{[k]:v}:{},spec:1})}
// Only fixed-point best properties; no Diablo suffix, resistance or skill affix.
PREFIX.length=0;SUFFIX.length=0;
for(const [k,n]of [['maxdmg','攻击'],['mag','魔法'],['tao','道术'],['def','防御'],['mdef','魔御'],['ar','准确'],['dex','敏捷'],['luck','幸运'],['ias','攻速'],['life','生命'],['mana','魔法值']])PREFIX.push(AF('极品'+n,1,1,k,k==='luck'?'weap,amul':k==='ias'?'weap,amul,ring':'weap,armo,amul,ring',{[k]:k==='life'||k==='mana'?[5,15]:k==='maxdmg'?[1,5]:k==='def'?[1,4]:[1,3]}));
// Both legacy roll positions draw legal best points, preserving the 1–2 / 3–6 roll budget.
SUFFIX.push(...PREFIX);
Object.assign(MODT,{invis:'隐身',teleport:'传送',overload:'超负载（负重上限提高）',ias:'攻速 +{v}',curse:'诅咒 +{v}',magMin:'魔法下限 +{v}',magMax:'魔法上限 +{v}',taoMin:'道术下限 +{v}',taoMax:'道术上限 +{v}',defMin:'防御下限 +{v}',defMax:'防御上限 +{v}',mdefMin:'魔御下限 +{v}',mdefMax:'魔御上限 +{v}'});
const EP={dmg:['mindmg','maxdmg'],mag:['magMin','magMax'],tao:['taoMin','taoMax'],def:['defMin','defMax'],mdef:['mdefMin','mdefMax']};
const RANGE_CACHE=new WeakMap();
function ranges(it){
 const b=BASEM[it.b]||{},raw=it.cqRange||b.cqRange||{},best=it.cqBest||{},bonus=it.cqBonus||{},cached=RANGE_CACHE.get(it);
 let signature='';for(const m of [best,bonus])for(const k in m)signature+=k+':'+m[k]+';';
 if(cached&&cached.raw===raw&&cached.signature===signature)return cached.value;
 const out={};for(const[k,p]of Object.entries(EP)){
  if(!raw[k]&&!best[k]&&!bonus[k]&&!p.some(x=>best[x]||bonus[x]))continue;
  out[k]=(raw[k]||[0,0]).map((v,i)=>v+(best[p[i]]||0)+(best[k]||0)+(bonus[p[i]]||0)+(bonus[k]||0));Object.freeze(out[k]);
 }
 Object.freeze(out);RANGE_CACHE.set(it,{raw,signature,value:out});return out;
}

function newRange(eq,key){const out=[0,0];for(const it of Object.values(eq||{}))if(it&&!it.k&&it.cqVersion>=1&&!it.cqMigrated){const r=ranges(it)[key];if(r){out[0]+=r[0];out[1]+=r[1]}}return out}
function rollAttack(range,eq){let luck=0;for(const it of Object.values(eq||(typeof S!=='undefined'?S.eq:{})))if(it&&!it.k&&it.cqVersion>=1&&!it.cqMigrated)luck+=(it.m?.luck||0)-(it.m?.curse||0);luck=Math.max(-9,Math.min(9,luck));const lo=Math.round(range[0]),hi=Math.round(range[1]);if(luck&&rnd()<Math.abs(luck)/9)return luck>0?hi:lo;return R(lo,hi)}
function magicGuard(value,element,eq){if(!(value>0))return value;if(!['fire','cold','light','magic'].includes(element))return value;const r=newRange(eq||(typeof S!=='undefined'?S.eq:{}),'mdef');if(!r[0]&&!r[1])return value;return Math.max(1,value-R(Math.min(...r),Math.max(...r)))}
let installed=false;
function equipRanges(eq){const out={dmg:[0,0],mag:[0,0],tao:[0,0],def:[0,0],mdef:[0,0]};for(const it of Object.values(eq||{})){if(!it||it.k)continue;for(const[k,v]of Object.entries(ranges(it)))if(out[k])out[k]=out[k].map((x,i)=>x+v[i])}return out}
function install(){if(installed)return;installed=true;
 const url=it=>it&&!it.k&&ICONS[it.b]||null;
 if(window.CQSys){CQSys.itemIcon=url;const oldClass=CQSys.itemCls;CQSys.itemCls=it=>it&&it.cqMigrated?it.cqLegacyClass||null:oldClass(it);CQSys.equipRanges=()=>equipRanges(S.eq);CQSys.heroEquipRanges=()=>equipRanges(CQSys.hero().eq)}
 const oldIcon=typeof icon2Url==='function'?icon2Url:null;window.icon2Url=it=>url(it)||(oldIcon?oldIcon(it):null);
 const oldItemIcon=itemIcon;itemIcon=function(it){const u=url(it);return u?'<i class="ii art cqic" style="background-image:url('+u+');background-size:contain;background-repeat:no-repeat;background-position:center"></i>':oldItemIcon(it)};

 if(typeof cqJewBase==='function')cqJewBase=function(lv){const pool=BASES.filter(b=>b.jew&&!b.cqSpecialBase&&b.q<=Math.max(3,lv));return pool.length?pick(pool):BASEM.rin};
 // Capture fixed definition rolls before the legacy wrapper adds base bm rolls.
 let equipmentGenerating=0;
 const make=makeBase;makeBase=function(b,level){const it=make.apply(this,arguments);it.name=b.n;it.req=b.cqReq?.lv||1;it.cqVersion=1;it.cqRange=JSON.parse(JSON.stringify(b.cqRange||{}));it.cqBest={};const old=OLD[b.id];if(old&&old.def&&it.def!=null)it.def=Math.max(it.def,old.def[0]);if(!equipmentGenerating&&b.bm){for(const[k,v]of Object.entries(b.bm))it.m[k]=(it.m[k]||0)+(Array.isArray(v)?R(v[0],v[1]):v);it.bmd=1}return it};
 const factory=newChar;newChar=function(){const id=factory.apply(this,arguments);if(!id)return id;if(S.lvl===1&&!S.xp){if(S.cls==='ds'&&S.eq.weapon?.b==='wand2'){const w=makeBase(BASEM.swd1,1),old=OLD.wand2.dmg;w.q=3;w.req=1;w.name=BASEM.swd1.n;w.cqBest={mindmg:Math.max(0,old[0]-w.dmg[0]),maxdmg:Math.max(0,old[1]-w.dmg[1])};Object.assign(w.m,w.cqBest);S.eq.weapon=w}else if(S.cls==='fs'&&S.eq.weapon?.b==='wand1'){const w=makeBase(BASEM.swdwumujian,1);w.q=3;w.req=1;w.name=BASEM.swdwumujian.n;w.m.mana=(w.m.mana||0)+10;w.cqBest.mana=10;S.eq.weapon=w}for(const it of Object.values(S.eq)){if(it){it.req=1;it.cqStarter=1}}calc();H.life=ST.life;H.mana=ST.mana;save()}return id};
 const roll=rollMods;rollMods=function(m){const out=roll(m);Object.defineProperty(out,'__cqRolled',{value:Object.assign({},out),writable:true,configurable:true});return out};
 if(typeof ancApply==='function'){const ancient=ancApply;ancApply=function(it,level){const before=Object.assign({},it&&it.m),hadAnc=it&&it.anc,result=ancient.apply(this,arguments);if(it&&it.m){if(it.cqMigrated&&!hadAnc&&it.anc){const def=typeof ancDef==='function'?ancDef(it):null;for(const[k,scale]of [['ar',2],['ias',5]])if(def&&def.m&&def.m[k]!=null&&it.m[k]!=null)it.m[k]*=scale;for(const[k,v]of Object.entries(before))if(typeof v==='number'&&v>0)it.m[k]=Math.max(it.m[k]||0,v)}for(const k of Object.keys(it.m)){const delta=it.m[k]-(before[k]||0);if(!delta||!Number.isFinite(delta))continue;if(it.m.__cqRolled)it.m.__cqRolled[k]=(it.m.__cqRolled[k]||0)+delta;if(it.cqBonus)it.cqBonus[k]=(it.cqBonus[k]||0)+delta}RANGE_CACHE.delete(it)}return result}}
 const apply=applyAff;applyAff=function(it,a,b,lv){const before=Object.assign({},it.m);const result=apply.apply(this,arguments);it.cqBest=it.cqBest||{};for(const k of Object.keys(it.m))if(allowed.has(k)){const delta=it.m[k]-(before[k]||0);if(delta)it.cqBest[k]=(it.cqBest[k]||0)+delta}RANGE_CACHE.delete(it);return result};
 const gen=genItem;genItem=function(lv,opt){const exact=opt&&opt.contentId&&(UNIQUES.find(u=>u.id===opt.contentId)||SETITEMS.find(u=>u.id===opt.contentId));if(opt&&opt.contentId&&!exact)throw new Error('Unknown equipment contentId: '+opt.contentId);if(exact)opt=Object.assign({},opt,{base:BASEM[exact.b],q:exact.set?6:5});let it;const bossContext=exact&&typeof BL!=='undefined'?BL.cur:null;if(exact&&typeof BL!=='undefined')BL.cur=null;equipmentGenerating++;try{it=gen(lv,opt)}finally{equipmentGenerating--;if(exact&&typeof BL!=='undefined')BL.cur=bossContext}if(exact){const ancient=opt.noAnc?0:it.anc;delete it.anc;delete it.ax;it.cqBest={};it.name=exact.n;it.q=exact.set?6:5;it.set=exact.set;it.req=exact.rq;it.m=rollMods(exact.m);if(ancient&&typeof ancApply==='function')ancApply(it,ancient);for(const[k,v]of Object.entries(BASEM[it.b].bm||{}))it.m[k]=(it.m[k]||0)+(Array.isArray(v)?R(v[0],v[1]):v)}if(!it||it.k)return it;const b=BASEM[it.b],old=OLD[it.b];if(it.set==='zuma'){delete it.set;it.q=3;it.name=b.n}if(old&&old.dmg&&it.dmg)it.dmg=it.dmg.map((v,i)=>Math.max(v,old.dmg[i]));if(old&&old.def&&it.def!=null)it.def=Math.max(it.def,old.def[0]);it.cqBonus={};for(const[k,v]of Object.entries(it.m.__cqRolled||{}))if(['mindmg','maxdmg','mag','tao','def','mdef'].includes(k))it.cqBonus[k]=v;it.m=clean(it.m);it.cqRange=JSON.parse(JSON.stringify(b.cqRange||{}));it.cqBest=it.cqBest||{};
 const content=UNIQUES.find(u=>u.b===it.b&&u.n===it.name)||SETITEMS.find(u=>u.b===it.b&&u.n===it.name);it.cqContentId=content&&content.id||null;it.name=content?it.name:b.n;it.af=[];it.sock=0;it.soc=[];it.cqVersion=1;it.req=Math.min(60,it.req||b.q);return it};
 const countSets=setCount;setCount=function(){const counts=countSets();for(const id of Object.keys(counts))if(!SETS[id])delete counts[id];return counts};
 const mods=allMods;allMods=function(it){const m=mods(it);if(it.cqVersion>=1&&!it.cqMigrated){if(m.ar)m.ar*=2;if(m.ias)m.ias*=5}for(const[k,v]of Object.entries(it.cqLegacy||{}))m[k]=(m[k]||0)+v;for(const[k,r]of Object.entries(ranges(it))){const p=EP[k];if(k!=='dmg'){m[p[0]]=(m[p[0]]||0)+r[0];m[p[1]]=(m[p[1]]||0)+r[1]}}return m};
 const local=itemLocal;itemLocal=function(it){const b=BASEM[it.b];const compatible=b&&((b.dmg&&!it.dmg)||(b.def&&it.def==null))?Object.assign({},it,{dmg:it.dmg||[0,0],def:it.def||0}):it;const o=local(compatible);const rs=ranges(it);for(const[k,r]of Object.entries(rs)){if(k==='dmg')continue;o[k+'Min']=r[0];o[k+'Max']=r[1]}return o};
 if(typeof hurtHero==='function'){const hurt=hurtHero;hurtHero=function(value,element,monster,dodge){return hurt.call(this,magicGuard(value,element),element,monster,dodge)}}
 // Primary attributes replace the removed skill-level affixes; only new gear contributes.
 let heroValueContext=0;
 if(typeof heroCast==='function'){const cast=heroCast;heroCast=function(){heroValueContext++;try{return cast.apply(this,arguments)}finally{heroValueContext--}}}
 function primary(eq,cls){return newRange(eq,cls==='fs'?'mag':cls==='ds'?'tao':null)}
 if(window.CQSys&&typeof CQSys.heroStats==='function'){const stats=CQSys.heroStats;CQSys.heroStats=function(){const base=stats.apply(this,arguments),h=CQSys.hero(),p=primary(h.eq,h.cls),factor=h.cls==='fs'?3:1;return Object.assign({},base,{atkMin:base.atkMin+p[0]*factor,atkMax:base.atkMax+p[1]*factor})}}
 const score=power;power=function(it){const value=score(it);if(!it||it.k||!(it.cqVersion>=1)||it.cqMigrated||!Number.isFinite(value))return value;const cls=BASEM[it.b]?.ccls||curCls(),r=ranges(it),key=cls==='fs'?'mag':cls==='ds'?'tao':null;let bonus=r.mdef?(r.mdef[0]+r.mdef[1])*2:0;if(key&&r[key])bonus+=(r[key][0]+r[key][1])*(cls==='fs'?6:4);bonus+=Math.max(-9,Math.min(9,(it.m?.luck||0)-(it.m?.curse||0)))*6;return Math.max(1,Math.round(value+bonus))};
 if(typeof clsSV==='function'){const skillValue=clsSV;clsSV=function(id,level){const v=skillValue.apply(this,arguments),cls=SKM[id]?.cls,subject=heroValueContext&&window.CQSys?CQSys.hero():S,subjectClass=heroValueContext?subject.cls:curCls();const field=Array.isArray(v.dmg)?'dmg':Array.isArray(v.pd)?'pd':null;if(cls!==subjectClass||!['fs','ds'].includes(cls)||!field)return v;const p=primary(subject.eq,cls);if(!p[0]&&!p[1])return v;const factor=cls==='fs'?3:1,damage=v[field].map((n,i)=>Math.round(n+p[i]*factor));return Object.assign({},v,{[field]:damage,txt:typeof v.txt==='string'?v.txt.replace(v[field].join('-'),damage.join('-')):v.txt})}}
 const nm=itemName;itemName=function(it){const s=nm(it);const n=Object.values(it&&it.cqBest||{}).reduce((a,v)=>a+Math.max(0,v),0);return n?s+'（极品 +'+n+'）':s};
 const wearing=canEquip;canEquip=function(it){if(it.cqMigrated){const r=itemReq(it),c=it.cqLegacyClass;return S.lvl>=r.lv&&(!c||c===curCls())}if(!wearing(it))return false;const req=BASEM[it.b]?.cqReq||{};if(req.dmg==null&&req.mag==null&&req.tao==null)return true;return ['dmg','mag','tao'].every(k=>{if(req[k]==null||(k==='dmg'&&(ST.wmax||0)>=req[k]))return true;let upper=0;for(const equipped of Object.values(S.eq||{}))if(equipped&&!equipped.k)upper+=(ranges(equipped)[k]||[0,0])[1];return upper>=req[k]})};
 const req=itemReq;itemReq=function(it){const r=req(it);const b=BASEM[it.b];return Object.assign(r,{lv:it.cqMigrated?Math.min(60,it.req||0):Math.min(60,it.req||b?.cqReq?.lv||b?.q||1),cq:b?.cqReq,cls:it.cqMigrated?it.cqLegacyClass||null:b?.ccls||null,weight:b?.weight||0})};
 const bag=renderBag;renderBag=function(){const r=bag.apply(this,arguments);document.querySelectorAll('#panel button br').forEach(br=>br.replaceWith(document.createTextNode('')));document.querySelectorAll('#panel button').forEach(b=>{b.style.setProperty('min-height','44px','important');b.style.setProperty('min-width','44px','important');b.style.whiteSpace='nowrap'});document.querySelectorAll('#panel .pager,#panel .stabs').forEach(row=>row.style.flexWrap='wrap');return r};
 // Details are installed here so the shared page files remain untouched.
 if(typeof renderHero==='function'){const role=renderHero;renderHero=function(){const ret=role.apply(this,arguments),kv=document.querySelector('.cqrole .kv');if(kv){const r=equipRanges(S.eq);r.dmg=[ST.wmin||0,ST.wmax||0];r.def=[ST.def||0,ST.def||0];kv.innerHTML=Object.entries({dmg:'攻击',mag:'魔法',tao:'道术',def:'防御',mdef:'魔御'}).map(([k,n])=>'<div><span>'+n+'</span><b>'+r[k].join('-')+'</b></div>').join('')+'<div><span>生命</span><b>'+ST.life+'</b></div><div><span>魔法值</span><b>'+ST.mana+'</b></div>';const m=CQSys.equipAttrs();kv.insertAdjacentHTML('beforeend',[['准确',ST.ar],['敏捷',ST.attr.dex],['幸运',m.luck||0],['诅咒',m.curse||0],['攻速（换算）','+'+(ST.ias||0)+'%']].map(([n,v])=>'<div><span>'+n+'</span><b>'+v+'</b></div>').join(''))}return ret}}
 const show=showItem;showItem=function(uid){const f=findItem(uid);if(!f||f.it.k)return show.apply(this,arguments);const it=f.it,b=BASEM[it.b];if(!b)return show.apply(this,arguments);const r=Object.assign({},ranges(it)),l=itemLocal(it),req=itemReq(it);if(l.min!=null)r.dmg=[l.min,l.max];if(it.cqMigrated){const effective=allMods(it);if(l.def!=null)r.def=[l.def,l.def];for(const k of ['mag','tao','mdef'])if(effective[k]!=null)r[k]=[effective[k],effective[k]]}
 const names={dmg:'攻击',mag:'魔法',tao:'道术',def:'防御',mdef:'魔御'};
 const need=Object.entries(b.cqReq||{}).filter(([k])=>k!=='lv').map(([k,v])=>'<div>需求'+({dmg:'攻击',mag:'魔法',tao:'道术'}[k]||k)+'：'+v+'</div>').join('');
 const rows=Object.entries(r).map(([k,v])=>'<div>'+names[k]+'：'+v.join('-')+'</div>').join('');
 const extra=Object.entries(it.m||{}).filter(([k])=>['ar','dex','luck','curse','ias','life','mana','para','prot','revive','invis','teleport','overload'].includes(k)).map(([k,v])=>'<div>'+modsTxt({[k]:v})+'</div>').join('');
 const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bonus=it.set&&SETS[it.set]?'<div class="sec"><b>'+SETS[it.set].n+'</b> · 本游戏原创套装效果'+Object.entries(SETS[it.set].bonus).map(([n,m])=>'<div>'+n+'件：'+modsTxt(m)+'</div>').join('')+'</div>':'';
 modal('<div class="ipanel"><div class="ih">'+itemIcon(it)+'<b>'+safe(itemName(it))+'</b></div><div class="sec">'+rows+extra+'<div>需求等级：'+req.lv+'</div>'+need+'<div>职业：'+({zs:'战士',fs:'法师',ds:'道士'}[req.cls]||'通用')+(it.cqMigrated&&req.cls!==(b.ccls||null)?'（旧档兼容）':'')+'</div><div>重量：'+b.weight+'</div><div>持久：'+b.durability+'/'+b.durability+'（挂机不磨损）</div><small>'+b.cqSource+'</small></div>'+bonus+(it.cqLegacy?'<div class="dim">旧档属性已保留</div>':'')+'<div>战力 '+power(it)+'</div><div class="btns c">'+(f.slot?'<button class="btn" onclick="unequip(\''+f.slot+'\')">卸下</button>':'<button class="btn" onclick="equip('+uid+')" '+(canEquip(it)?'':'disabled')+'>装备</button>')+'<button class="btn" onclick="cqEnhUI('+uid+')">强化</button><button class="btn" onclick="closeM()">关闭</button></div></div>');
 if(typeof cqEnhActions==='function')cqEnhActions(uid);
 };
 if(typeof document!=='undefined'&&document.createElement){const s=document.createElement('style');s.textContent='.cqslot{min-height:44px;min-width:44px}#panel button,#panel .cqbtn{min-height:44px;min-width:44px;white-space:nowrap}#modal .btn{min-height:44px;min-width:44px;white-space:nowrap}#modal:has(.ipanel){position:fixed;inset:0}#modal:has(.ipanel) .mb{max-height:85vh;overflow:auto;box-sizing:border-box}';document.head.appendChild(s)}
}
window.CQMir2Equip={tiers:TIERS,oldBases:OLD,table:TABLE,ranges,equipRanges,rollAttack,magicGuard,createContent:(id,lv,options)=>genItem(lv||60,Object.assign({},options,{contentId:id})),install,icons:ICONS};
})();
