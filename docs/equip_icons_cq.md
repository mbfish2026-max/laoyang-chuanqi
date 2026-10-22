# 装备图标盘点（实施前）

现有传奇图 15 张保留；其余旧底材补原创图。新增装备按部位与档位共享原创图形，禁止回退暗黑图。

|底材 ID|名称|处理|
|---|---|---|
|swd1|木剑|imagegen 原创重画|
|dag1|匕首|imagegen 原创重画|
|swd2|青铜剑|imagegen 原创重画|
|swd3|铁剑|imagegen 原创重画|
|axe1|青铜斧|保留现有传奇图|
|swd4|短剑|imagegen 原创重画|
|wand1|海魂|imagegen 原创重画|
|wand2|偃月|imagegen 原创重画|
|swd5|八荒|imagegen 原创重画|
|swd6|凌风|保留现有传奇图|
|swd7|修罗|imagegen 原创重画|
|wand3|魔杖|imagegen 原创重画|
|wand4|降魔|imagegen 原创重画|
|axe2|斩马刀|保留现有传奇图|
|swd8|炼狱|imagegen 原创重画|
|arm1|布衣|imagegen 原创重画|
|arm2|轻型盔甲|imagegen 原创重画|
|arm3|中型盔甲|imagegen 原创重画|
|arm4|重盔甲|imagegen 原创重画|
|arm5|魔法长袍|imagegen 原创重画|
|arm6|灵魂战衣|imagegen 原创重画|
|arm7|战神盔甲|保留现有传奇图|
|hlm1|青铜头盔|imagegen 原创重画|
|hlm2|魔法头盔|imagegen 原创重画|
|hlm3|骷髅头盔|imagegen 原创重画|
|hlm4|道士头盔|imagegen 原创重画|
|amu|金项链|imagegen 原创重画|
|amu2|传统项链|imagegen 原创重画|
|amu3|灯笼项链|imagegen 原创重画|
|amu4|白色虎齿项链|保留现有传奇图|
|amu5|黑檀项链|imagegen 原创重画|
|amu6|天珠项链|imagegen 原创重画|
|shd1|小手镯|imagegen 原创重画|
|shd2|银手镯|imagegen 原创重画|
|shd3|大手镯|imagegen 原创重画|
|shd4|魔力手镯|保留现有传奇图|
|shd5|骷髅手镯|保留现有传奇图|
|glv1|铁手镯|imagegen 原创重画|
|glv2|皮制护腕|保留现有传奇图|
|glv3|钢手镯|保留现有传奇图|
|glv4|死神手套|imagegen 原创重画|
|glv5|道士手镯|imagegen 原创重画|
|rin|古铜戒指|imagegen 原创重画|
|rin2|牛角戒指|imagegen 原创重画|
|rin3|六角戒指|保留现有传奇图|
|rin4|珊瑚戒指|imagegen 原创重画|
|rin5|骷髅戒指|imagegen 原创重画|
|rin6|蓝色水晶戒指|保留现有传奇图|
|blt1|布腰带|imagegen 原创重画|
|blt2|皮腰带|保留现有传奇图|
|blt3|钢腰带|保留现有传奇图|
|bot1|布鞋|imagegen 原创重画|
|bot2|皮靴|保留现有传奇图|
|bot3|铁靴|保留现有传奇图|

新增沃玛/祖玛/赤月/魔龙/强化魔龙/白金/星王：武器、衣服、头盔、链、左右镯、戒、腰、鞋采用原创图族；注册清单由 CQMir2Equip.icons 导出。

## 生成结果

内置 imagegen 生成一张 8×8 原创装备图集，按等分网格裁出 PNG；新增底材共享部位图族。原图：`assets/cq/equip_source/equipment_atlas.png`。完整注册：`assets/cq/equip_source/manifest.json`。

|ID|名称|图集行:列|
|---|---|---|
|swd1|木剑|1:1|
|dag1|匕首|1:2|
|swd2|青铜剑|1:3|
|swd3|铁剑|1:4|
|swd4|短剑|1:5|
|wand1|海魂|2:1|
|wand2|偃月|2:2|
|swd5|八荒|1:6|
|swd7|修罗|1:8|
|wand3|魔杖|2:3|
|wand4|降魔|2:4|
|swd8|炼狱|7:1|
|arm1|布衣|2:6|
|arm2|轻型盔甲|2:7|
|arm3|中型盔甲|2:8|
|arm4|重盔甲|3:1|
|arm5|魔法长袍|3:2|
|arm6|灵魂战衣|3:3|
|hlm1|青铜头盔|3:4|
|hlm2|魔法头盔|3:5|
|hlm3|骷髅头盔|3:6|
|hlm4|道士头盔|3:7|
|amu|金项链|3:8|
|amu2|传统项链|4:1|
|amu3|灯笼项链|4:2|
|amu5|黑檀项链|4:3|
|amu6|天珠项链|4:4|
|shd1|小手镯|4:5|
|shd2|银手镯|4:6|
|shd3|大手镯|4:7|
|glv1|铁手镯|4:8|
|glv4|死神手套|5:2|
|glv5|道士手镯|5:3|
|rin|古铜戒指|5:4|
|rin2|牛角戒指|5:5|
|rin4|珊瑚戒指|5:6|
|rin5|骷髅戒指|5:7|
|blt1|布腰带|5:8|
|bot1|布鞋|6:3|
|swdwumujian|乌木剑|7:3|
|swdhezuichu|鹤嘴锄|7:3|
|swdluocha|罗刹|7:1|
|swdpohun|破魂|7:1|
|swdningshuang|凝霜|7:1|
|swdjingzhongyue|井中月|7:1|
|swdcaijuezhizhang|裁决之杖|7:1|
|swdtulong|屠龙|7:1|
|swdmingyunzhiren|命运之刃|7:1|
|swdluoposhenbing|落魄神兵|7:1|
|swdchixuemojian|赤血魔剑|7:1|
|swdnuzhan|怒斩|7:1|
|swdqidaozhiren|祈祷之刃|7:1|
|wandxueyin|血饮|7:2|
|wandguyuquanzhang|骨玉权杖|7:2|
|wandshihunfazhang|嗜魂法杖|7:2|
|wandlongya|龙牙|7:2|
|wandbanyue|半月|7:3|
|wandyinshe|银蛇|7:3|
|wandwujigun|无极棍|7:3|
|wandlongwenjian|龙纹剑|7:3|
|wandxiaoyaoshan|逍遥扇|7:3|
|armtianmoshenjia|天魔神甲|7:5|
|armshengzhanbaojia|圣战宝甲|7:5|
|armemochangpao|恶魔长袍|7:6|
|armfashenpifeng|法神披风|7:6|
|armnichangyuyi|霓裳羽衣|7:6|
|armyoulingzhanyi|幽灵战衣|7:7|
|armtianzundaopao|天尊道袍|7:7|
|armtianshizhangpao|天师长袍|7:7|
|amuqifuxianglian|祈福项链|8:2|
|amujiqiaoxianglian|技巧项链|8:2|
|amutancexianglian|探测项链|8:2|
|amuheiseshuijingxianglian|黑色水晶项链|8:2|
|amuhuangseshuijingxianglian|黄色水晶项链|8:2|
|amumoguixianglian|魔鬼项链|8:2|
|amulanfeicuixianglian|蓝翡翠项链|8:2|
|amuyoulingxianglian|幽灵项链|8:2|
|amulvsexianglian|绿色项链|8:2|
|amukuangfengxianglian|狂风项链|8:2|
|amujiyixianglian|记忆项链|8:2|
|amushengzhanxianglian|圣战项链|8:2|
|amubaijinxianglian|白金项链|8:2|
|amuhupoxianglian|琥珀项链|8:2|
|amufangdajing|放大镜|8:2|
|amushengmingxianglian|生命项链|8:2|
|amuemolingdang|恶魔铃铛|8:2|
|amufashenxianglian|法神项链|8:2|
|amumoxuexianglian|魔血项链|8:2|
|amuhongmoxianglian|虹魔项链|8:2|
|amuduobishoulian|躲避手链|8:2|
|amufenghuangmingzhu|凤凰明珠|8:2|
|amuzhudi|竹笛|8:2|
|amulinghunxianglian|灵魂项链|8:2|
|amuqidaoxianglian|祈祷项链|8:2|
|amutianzunxianglian|天尊项链|8:2|
|shdtieshouzhuo|铁手镯|6:7|
|glvxiaoshouzhuo|小手镯|6:7|
|glvyinshouzhuo|银手镯|6:7|
|shdpizhishoutao|皮制手套|6:7|
|glvpizhishoutao|皮制手套|6:7|
|shdgangshouzhuo|钢手镯|6:7|
|shdxiapuershouzhuo|夏普儿手镯|6:7|
|glvxiapuershouzhuo|夏普儿手镯|6:7|
|shdbixieshouzhuo|辟邪手镯|6:7|
|glvbixieshouzhuo|辟邪手镯|6:7|
|shdjiangushoutao|坚固手套|6:7|
|glvjiangushoutao|坚固手套|6:7|
|shdmofashouzhuo|魔法手镯|6:7|
|glvmofashouzhuo|魔法手镯|6:7|
|shdshenmiyaodai|神秘腰带|6:7|
|glvshenmiyaodai|神秘腰带|6:7|
|glvdashouzhuo|大手镯|6:7|
|glvmolishouzhuo|魔力手镯|6:7|
|shdsishenshoutao|死神手套|6:7|
|shdjinshouzhuo|金手镯|6:7|
|glvjinshouzhuo|金手镯|6:7|
|shdyoulingshoutao|幽灵手套|6:7|
|glvyoulingshoutao|幽灵手套|6:7|
|shdyanluoshoutao|阎罗手套|6:7|
|glvyanluoshoutao|阎罗手套|6:7|
|shdqishishouzhuo|骑士手镯|6:7|
|glvqishishouzhuo|骑士手镯|6:7|
|shdheitieshoutao|黑铁手套|6:7|
|glvheitieshoutao|黑铁手套|6:7|
|shdqidaoshouzhuo|祈祷手镯|6:7|
|glvqidaoshouzhuo|祈祷手镯|6:7|
|shdshengzhanshouzhuo|圣战手镯|6:7|
|glvshengzhanshouzhuo|圣战手镯|6:7|
|shdheitanshouzhuo|黑檀手镯|6:7|
|glvheitanshouzhuo|黑檀手镯|6:7|
|shdsibeiershouzhuo|思贝儿手镯|6:7|
|glvsibeiershouzhuo|思贝儿手镯|6:7|
|shdlongzhishouzhuo|龙之手镯|6:7|
|glvlongzhishouzhuo|龙之手镯|6:7|
|shdjiyishouzhuo|记忆手镯|6:7|
|glvjiyishouzhuo|记忆手镯|6:7|
|shdfashenshouzhuo|法神手镯|6:7|
|glvfashenshouzhuo|法神手镯|6:7|
|shddaoshishouzhuo|道士手镯|6:7|
|shdsanyanshouzhuo|三眼手镯|6:7|
|glvsanyanshouzhuo|三眼手镯|6:7|
|shdxinlingshouzhuo|心灵手镯|6:7|
|glvxinlingshouzhuo|心灵手镯|6:7|
|shdtianzunshouzhuo|天尊手镯|6:7|
|glvtianzunshouzhuo|天尊手镯|6:7|
|shdmoxueshouzhuo|魔血手镯|6:7|
|glvmoxueshouzhuo|魔血手镯|6:7|
|shdhongmoshouzhuo|虹魔手镯|6:7|
|glvhongmoshouzhuo|虹魔手镯|6:7|
|rinjinjiezhi|金戒指|6:8|
|rinjiangyaochumojiezhi|降妖除魔戒指|6:8|
|rinshenmijiezhi|神秘戒指|6:8|
|rinyinshenjiezhi|隐身戒指|6:8|
|rinchuansongjiezhi|传送戒指|6:8|
|rinfangyujiezhi|防御戒指|6:8|
|rinfuhuojiezhi|复活戒指|6:8|
|rinhushenjiezhi|护身戒指|6:8|
|rinchaofuzaijiezhi|超负载戒指|6:8|
|rinhuoyanjiezhi|火焰戒指|6:8|
|rinqiuhunjiezhi|求婚戒指|6:8|
|rinheiseshuijingjiezhi|黑色水晶戒指|6:8|
|rinlongzhijiezhi|龙之戒指|6:8|
|rinliliangjiezhi|力量戒指|6:8|
|rinkuangfengjiezhi|狂风戒指|6:8|
|rinshengzhanjiezhi|圣战戒指|6:8|
|rinmoxuejiezhi|魔血戒指|6:8|
|rinhongmojiezhi|虹魔戒指|6:8|
|rinmabijiezhi|麻痹戒指|6:8|
|rinshengtiejiezhi|生铁戒指|6:8|
|rinsheyanjiezhi|蛇眼戒指|6:8|
|rinmeilijiezhi|魅力戒指|6:8|
|rinhongbaoshijiezhi|红宝石戒指|6:8|
|rinzibiluo|紫碧螺|6:8|
|rinqidaojiezhi|祈祷戒指|6:8|
|rinfashenjiezhi|法神戒指|6:8|
|rinbolijiezhi|玻璃戒指|6:8|
|rinzhenzhujiezhi|珍珠戒指|6:8|
|rindaodejiezhi|道德戒指|6:8|
|rinbojinjiezhi|铂金戒指|6:8|
|rintaitanjiezhi|泰坦戒指|6:8|
|rinjiyijiezhi|记忆戒指|6:8|
|rintianzunjiezhi|天尊戒指|6:8|
|hlmjinglingtoukui|精灵头盔|7:4|
|hlmheitietoukui|黑铁头盔|6:6|
|hlmshenmitoukui|神秘头盔|7:4|
|hlmqidaotoukui|祈祷头盔|7:4|
|hlmjiyitoukui|记忆头盔|7:4|
|hlmshengzhantoukui|圣战头盔|7:4|
|hlmfashentoukui|法神头盔|7:4|
|hlmtianzuntoukui|天尊头盔|7:4|
|bltshengzhanyaodai|圣战腰带|6:1|
|botshengzhanzhanxue|圣战靴|6:5|
|bltfashenyaodai|法神腰带|6:1|
|botfashenmoxue|法神靴|6:5|
|blttianzunyaodai|天尊腰带|6:1|
|bottianzundaoxue|天尊靴|6:5|
|armleitingzhanjia|雷霆衣服|7:5|
|hlmleitingtoukui|雷霆头盔|7:4|
|amuleitingxianglian|雷霆项链|8:2|
|shdleitingshouzhuo|雷霆手镯|6:7|
|glvleitingshouzhuo|雷霆手镯|6:7|
|rinleitingjiezhi|雷霆戒指|6:8|
|bltleitingyaodai|雷霆腰带|6:1|
|botleitingzhanxue|雷霆靴|6:5|
|armlieyanmoyi|烈焰衣服|7:6|
|hlmlieyantoukui|烈焰头盔|7:4|
|amulieyanxianglian|烈焰项链|8:2|
|shdlieyanshouzhuo|烈焰手镯|6:7|
|glvlieyanshouzhuo|烈焰手镯|6:7|
|rinlieyanjiezhi|烈焰戒指|6:8|
|bltlieyanyaodai|烈焰腰带|6:1|
|botlieyanmoxue|烈焰靴|6:5|
|armguangmangdaopao|光芒衣服|7:7|
|hlmguangmangtoukui|光芒头盔|7:4|
|amuguangmangxianglian|光芒项链|8:2|
|shdguangmangshouzhuo|光芒手镯|6:7|
|glvguangmangshouzhuo|光芒手镯|6:7|
|ringuangmangjiezhi|光芒戒指|6:8|
|bltguangmangyaodai|光芒腰带|6:1|
|botguangmangdaoxue|光芒靴|6:5|
|armleitingzhanjiaplus|强化雷霆衣服|7:5|
|hlmleitingtoukuiplus|强化雷霆头盔|7:4|
|amuleitingxianglianplus|强化雷霆项链|8:2|
|shdleitingshouzhuoplus|强化雷霆手镯|6:7|
|glvleitingshouzhuoplus|强化雷霆手镯|6:7|
|rinleitingjiezhiplus|强化雷霆戒指|6:8|
|bltleitingyaodaiplus|强化雷霆腰带|6:1|
|botleitingzhanxueplus|强化雷霆靴|6:5|
|armlieyanmoyiplus|强化烈焰衣服|7:6|
|hlmlieyantoukuiplus|强化烈焰头盔|7:4|
|amulieyanxianglianplus|强化烈焰项链|8:2|
|shdlieyanshouzhuoplus|强化烈焰手镯|6:7|
|glvlieyanshouzhuoplus|强化烈焰手镯|6:7|
|rinlieyanjiezhiplus|强化烈焰戒指|6:8|
|bltlieyanyaodaiplus|强化烈焰腰带|6:1|
|botlieyanmoxueplus|强化烈焰靴|6:5|
|armguangmangdaopaoplus|强化光芒衣服|7:7|
|hlmguangmangtoukuiplus|强化光芒头盔|7:4|
|amuguangmangxianglianplus|强化光芒项链|8:2|
|shdguangmangshouzhuoplus|强化光芒手镯|6:7|
|glvguangmangshouzhuoplus|强化光芒手镯|6:7|
|ringuangmangjiezhiplus|强化光芒戒指|6:8|
|bltguangmangyaodaiplus|强化光芒腰带|6:1|
|botguangmangdaoxueplus|强化光芒靴|6:5|
|armbaijinzs|白金战士衣服|8:8|
|hlmbaijinzs|白金战士头盔|8:1|
|amubaijinzs|白金战士项链|8:2|
|shdbaijinzs|白金战士手镯|8:3|
|glvbaijinzs|白金战士手镯|8:3|
|rinbaijinzs|白金战士戒指|8:4|
|bltbaijinzs|白金战士腰带|8:5|
|botbaijinzs|白金战士靴|8:6|
|armbaijinfs|白金法师衣服|8:8|
|hlmbaijinfs|白金法师头盔|8:1|
|amubaijinfs|白金法师项链|8:2|
|shdbaijinfs|白金法师手镯|8:3|
|glvbaijinfs|白金法师手镯|8:3|
|rinbaijinfs|白金法师戒指|8:4|
|bltbaijinfs|白金法师腰带|8:5|
|botbaijinfs|白金法师靴|8:6|
|armbaijinds|白金道士衣服|8:8|
|hlmbaijinds|白金道士头盔|8:1|
|amubaijinds|白金道士项链|8:2|
|shdbaijinds|白金道士手镯|8:3|
|glvbaijinds|白金道士手镯|8:3|
|rinbaijinds|白金道士戒指|8:4|
|bltbaijinds|白金道士腰带|8:5|
|botbaijinds|白金道士靴|8:6|
|armxingwangzs|星王战士衣服|8:8|
|hlmxingwangzs|星王战士头盔|8:1|
|amuxingwangzs|星王战士项链|8:2|
|shdxingwangzs|星王战士手镯|8:3|
|glvxingwangzs|星王战士手镯|8:3|
|rinxingwangzs|星王战士戒指|8:4|
|bltxingwangzs|星王战士腰带|8:5|
|botxingwangzs|星王战士靴|8:6|
|armxingwangfs|星王法师衣服|8:8|
|hlmxingwangfs|星王法师头盔|8:1|
|amuxingwangfs|星王法师项链|8:2|
|shdxingwangfs|星王法师手镯|8:3|
|glvxingwangfs|星王法师手镯|8:3|
|rinxingwangfs|星王法师戒指|8:4|
|bltxingwangfs|星王法师腰带|8:5|
|botxingwangfs|星王法师靴|8:6|
|armxingwangds|星王道士衣服|8:8|
|hlmxingwangds|星王道士头盔|8:1|
|amuxingwangds|星王道士项链|8:2|
|shdxingwangds|星王道士手镯|8:3|
|glvxingwangds|星王道士手镯|8:3|
|rinxingwangds|星王道士戒指|8:4|
|bltxingwangds|星王道士腰带|8:5|
|botxingwangds|星王道士靴|8:6|

补充 1.80 注册：swdkaitian, wandzhentian, wandxuantian, amuzhanshenxianglian, shdzhanshenshouzhuo, glvzhanshenshouzhuo, rinzhanshenjiezhi, bltzhanshenyaodai, botzhanshenzhanxue, amushengmoxianglian, shdshengmoshouzhuo, glvshengmoshouzhuo, rinshengmojiezhi, bltshengmoyaodai, botshengmomoxue, amuzhenhunxianglian, shdzhenhunshouzhuo, glvzhenhunshouzhuo, rinzhenhunjiezhi, bltzhenhunyaodai, botzhenhundaoxue。均使用同一原创图集相应部位。

接线约束：现有 cq_icons_test 将 15 张旧图和公共清单写死。新增图暂驻 `assets/cq/icon/mir2/eq_<b>.png`，既有 15 张保持原路径；内容 ID 不变，完整路径只查 manifest，不扫描猜图。

最终共 331 个底材图标映射：保留 15 张既有传奇图，316 张补充 PNG 来自本次原创图集（部位图族共享）。完整生成提示词见 `assets/cq/equip_source/prompt.txt`。

补充：凤天魔甲 `armfengtianmojia`、凰天魔衣 `armhuangtianmoyi` 采用原创星王衣服图族；霸者之刃 `swdbazhezhiren` 采用原创高阶武器图族。
