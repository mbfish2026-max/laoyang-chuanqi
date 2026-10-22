# Mir2 并行开发 ID 契约

版本：2026-10-22，基线 master `650e105`，文档分支 `mir2-ids`。本文是后续块 2–5 的命名及接线契约，**不是已实现功能清单**。本次只提交本文，不修改运行代码。

## 1. 优先级与范围

用户本轮定案 > 本文 ID/归属约定 > `/workspace/design/mir2_ref/gap.md` 的任务划分 > 同目录 version/maps/monsters/equipment/affixes/skills/systems/icons 文档 > `/workspace/design/chuanqi_v2_plan.md` 的旧建议。资料实际文件为 `*.md`，图标说明为 `icons.md`。

- 目标是 1.80 英雄合击版，基础数据采用 1.76；不采用龙帝版属性，不做内功、心法、宝石镶嵌。
- 等级封顶 60；1–50 使用原表，51–60 外推。单职业通关仍需 60–80 小时。旧档等级迁移不得让角色变弱。
- 转生采用设计方案 §6 的固定职业主属性/体力，1–10 次、记入 `S.atb`，不清装备，不产生可分配属性点或技能点。
- 英雄 Lv22 解锁；资料中 40 级英雄的建议作废。技能书最高 9 级；不另建“四级技能”ID。
- 第 4–7 章固定为祖玛寺庙、赤月峡谷、牛魔寺庙、魔龙城，覆盖 maps.md §4 的旧章节建议；雷炎/火龙只预留终局命名，不扩展主线版本。
- 赤月之后依次是魔龙、强化魔龙、白金、星王。未知原版数值须注明“本游戏设计值”，不能伪称官方值。
- 平衡只加强弱流派，不削首领。按钮不换行、触控 ≥44px、弹窗空白关闭，按 390×844 验证；特效每次只播一次。
- 只本地 commit，不 push，不运行 `tools/bump.sh`，不合并或 cherry-pick `d3b7818`。测试角色必须由 `CQSys.createChar(name,cls)` 创建。

## 2. 已核对的代码约定

| 对象 | 当前代码事实 | 本契约 |
|---|---|---|
| 职业 | `classes.js`：`zs/fs/ds`；英雄战斗层职业号 1/2/3 | 存档沿用字符串；仅 `cq/cq_hero.js` 适配为数字 |
| 技能 | `cls_*.js`：`jbjs/hqs/lhhf` 等拼音缩写，全局 `SKM[id]` | 旧 ID 全保留，新增也用无下划线小写缩写 |
| 技能书 | `clsBookId(id)` 返回 `<cls>_<id>`；`CQSys.bookCount` 自加 `book_` | API 参数与材料键严格区分，见 §3 |
| 地图 | `ACTS[a].zones[z]` 无稳定 id；`S.act/S.zone` 为 0 起下标 | 新增字符串 `id`，保留下标接口与顺序映射 |
| 怪物 | `MONS` 旧名无统一前缀；`data_cq2.js` 新怪用 `cq` 前缀 | 新普通怪用 `cq`，首领沿用无前缀英文组合 |
| 装备 | `CQB(id,s,cat,n,q,o)`；存档 `it.b` 引用 `BASEM` | 保留现有短 ID；新底材用同类前缀 + 名称拼音 |
| 套装 | `SETS.zuma`；部件 `SETITEMS[].set`；暗金/套装没有稳定物品 id | 新增稳定内容 id，但不可改写物品实例 `uid` |
| 图标 | `cq/icons_cq.js`：`assets/cq/icon/book_<id>.png`、`eq_<b>.png` | 沿用目录/前缀；登记真实存在文件后才请求 |
| 怪图 | `CQ_MONART` → `assets/cq/ui/<artId>.png` | 沿用 `mdl_mst_<key>`，旧数字 artId 不强制重命名 |

命名大小写敏感。内容 ID 不包含等级、品质、强化、性别文案或版本号；不从中文显示名反查 ID。以下新增目录、字段、表名均为待实现约定，不能假设基线已有。

## 3. 技能与技能书（块 2）

表格中的 ID 与中文名为唯一登记。括号“现有”表示保持当前存档 ID；新增 ID 不复用 D2 技能。

| 职业/来源 | 技能登记 |
|---|---|
| zs 1.76（现有） | `jbjs` 基本剑术、`gsjs` 攻杀剑术、`csjs` 刺杀剑术、`bywd` 半月弯刀、`ymcz` 野蛮冲撞、`lhjf` 烈火剑法 |
| fs 1.76（现有） | `hqs` 火球术、`kjhh` 抗拒火环、`yhzg` 诱惑之光、`dyh` 地狱火、`ldsh` 雷电术、`mfd` 魔法盾、`bpx` 冰咆哮 |
| fs 1.76（新增 7） | `dhq` 大火球、`sxyd` 瞬息移动、`blhy` 爆裂火焰、`hq` 火墙、`jgdy` 疾光电影、`dylg` 地狱雷光、`sys` 圣言术 |
| ds 1.76（现有） | `zys` 治愈术、`lhhf` 灵魂火符、`sds` 施毒术、`zhkl` 召唤骷髅、`ysh` 隐身术、`zhss` 召唤神兽 |
| ds 1.76（新增 7） | `jslzf` 精神力战法、`jtys` 集体隐身术、`yld` 幽灵盾、`sszjs` 神圣战甲术、`xlqs` 心灵启示、`kmz` 困魔咒、`qtzls` 群体治疗术 |
| zs 扩展 | `szh` 狮子吼、`zrjf` 逐日剑法 |
| fs 扩展 | `hbz` 寒冰掌、`mth` 灭天火、`lxhy` 流星火雨 |
| ds 扩展 | `qgb` 气功波、`wjzq` 无极真气、`sxs` 噬血术 |
| 通用扩展 | `htsd` 护体神盾（各职业共用技能 id；书按职业区分） |
| 英雄专属 | zs `ktz` 开天斩、fs `fss` 分身术、ds `zhyl` 召唤月灵 |

扩展清单按 gap.md N3/N4 纳入；其中后期技能年代并非都在 2005 年，展示不可统一标为“原始 1.80”。不新增内功或连击技能。

### 3.1 书的三个标识层

对任何上表的 `(cls,id)`，统一推导：

| 层 | 格式 | 示例 |
|---|---|---|
| `SKM`/`S.sk`/英雄 `sk` | `<id>` | `dhq` |
| `CQ_BOOKS`、`CQSys.bookDef/bookCount` 参数 | `<cls>_<id>` | `fs_dhq` |
| `MATS`、`S.mats`、材料物品 `it.id` | `book_<cls>_<id>` | `book_fs_dhq` |
| 材料物品外壳 | `{k:'mat',id:材料键,...}` | `id:'book_fs_dhq'` |
| 书图 | `assets/cq/icon/book_<id>.png` | `book_dhq.png` |

英雄沿用 `book_<cls>_<id>`，不产生 `hero_` 书命名空间。英雄专属技能以 `heroOnly:true` 元数据区分，主角不可学习；同一技能的主角/英雄等级仍分别存储。`htsd` 书为 `book_zs_htsd/book_fs_htsd/book_ds_htsd`，共用图标；通用技能的职业校验需要块 2 在引擎适配，不能重复注册三份 `SKM.htsd`。

现有 `CLS_BOOK[].oid` 的 104xxx 是来源编号，不是运行时技能书 item id；新增项未有可靠来源编号就留空，不编造编号。技能 1/4/7 级对应原版 1/2/3 级，其他等级插值/外推，但保留现有角色与熟练度收益，不用旧 20 级映射反复迁移已标记的 9 级档。

### 3.2 合击与旧技能映射

`COMBO` 继续用排序后的数字职业对作 key，不创建可升级普通技能书：

| key | 名称 | 新图标/特效 slug |
|---|---|---|
| `1+1` | 破魂斩 | `pohunzhan` |
| `1+2` | 雷霆一击 | `leitingyiji` |
| `1+3` | 劈星斩 | `pixingzhan` |
| `2+2` | 火龙气焰 | `huolongqiyan` |
| `2+3` | 末日审判 | `morishenpan` |
| `3+3` | 噬魂沼泽 | `shihunzhaoze` |

旧 `sds→sds`（群体施毒术→施毒术）、`zhkl→zhkl`（召唤术→召唤骷髅），只改显示名与描述，不清技能等级。合击按职业 key 修正名称、描述、效果与 fx 的一致性，不把玩家职业组合迁到另一 key。块 1 已有改名工作不得用禁用提交引入，块 2 需核对合并后实际结果。

所有旧技能 id 恒等映射。技能修饰键 `sk_<id>`、自动施法栏、主角 `S.skx` 与英雄熟练度/禁用列表中的 ID 同样恒等保留。任意旧 `book_<id>`，若 id 是表内单职业技能，则数量累加迁入 `book_<cls>_<id>` 后删旧键；已带职业前缀恒等映射，已学消耗/熟练度也按同规则处理。`book_htsd` 无法推导职业时按存档所属角色职业迁移，未知书保留原键，不丢弃。迁移必须幂等，主角和英雄不能各搬一次同一材料。

## 4. 地图与区域（块 3）

章节 ID 为 `cqact1`…`cqact7`，分别对应下标 0…6。区域 ID 用 `cq` + 地区英文 + 数字层数，沿用怪物的 cq 命名方式；`zones[].id` 是稳定定位键，不用显示名作键。下表列表顺序就是新章内下标顺序（从 0 起）；逗号连接的每项均是一个独立 ID。

| 章 | 区域 ID（按顺序） |
|---|---|
| 1 新手村 | `cqvillage,cqbichisouth,cqbichiwest,cqbichieast,cqbichinorth,cqsnakevalley,cqorctomb` |
| 2 比奇 | `cqskel1,cqskel2,cqskel3,cqwomaforest,cqwomaentrance,cqwoma1,cqwoma2,cqwoma3` |
| 3 矿区 | `cqminesouth,cqmineeast,cqmine1,cqmine2,cqminepit,cqbichimine,cqsnakemine,cqcentipede,cqdeathvalley` |
| 4 祖玛寺庙 | `cqzuma1,cqzuma2,cqzuma3,cqzuma4,cqzuma5,cqzuma6,cqzuma7,cqzumage,cqzumahome` |
| 5 赤月峡谷 | `cqbairimen,cqjunglemaze,cqchiyueeast,cqchiyuesouth,cqchiyuenorth,cqchiyuesquare,cqchiyuelair` |
| 6 牛魔寺庙 | `cqniumo1,cqniumo2,cqniumo3,cqniumo4,cqniumo5,cqniumo6,cqniumohall` |
| 7 魔龙城 | `cqmolongcity,cqmolongridge,cqmolongswamp,cqmolongblood,cqmolonghall` |

归位支线追加在所属章主链之后，`side:1`：章 4 `cqshimu1`…`cqshimu7,cqshimuarray,cqfengmovalley,cqfengmohall`；章 6 `cqshimo1`…`cqshimo3,cqgumo1`…`cqgumo5`。支线不改变 `fq` 与终点任务，不能让自动推进以数组最后一项代替主线终点。预留终局 `cqleiyan1,cqleiyan2,cqhuolonghall`；预留不等于本轮必须实现或开放。

任务 ID 沿用 `q1`…`q6`、`a2q*`、`a3q*`，新增章 4/5/6/7 用 `a4q*`/`a5q*`/`a6q*`/`a7q*`。每章终点固定 `aNq6`（章 1 是 `q6`），旧奖励硬编码按 id 保留，重写任务描述和位置需同时核对奖励语义。

### 4.1 旧下标到新区域

迁移输入以 **650e105 实际最终 ACTS** 为准：`data_acts.js` 的原第二、三章已被 `data_cq2.js` 覆盖，不能重复迁移。以下 `a:z` 为旧的零起章节/区域下标。

| 旧位置 | 新目标 |
|---|---|
| `0:0…6` | 章 1 同下标 ID，恒等保留进度 |
| `1:0…3` | `cqskel1,cqskel2,cqskel3,cqwomaforest` |
| `1:4` 森林深处 | `cqwomaentrance`（旧树妖击杀记录保留，树妖实体归位封魔谷） |
| `1:5` 尸王殿 | `cqbichimine`（章 3）；保留旧章 2 已完成/解锁资格 |
| `2:0…4` | `cqminesouth,cqmineeast,cqmine1,cqmine2,cqminepit` |
| `2:5` 石墓深处 | `cqshimu7`（章 4 支线）；保留旧章 3 已完成/解锁资格 |
| `3:0…4` 外围平原至混沌圣所 | `cqzuma1,cqzuma2,cqzuma3,cqzuma5,cqzumahome` |
| `4:0…18` 血丘至世界之心 | `cqbairimen,cqjunglemaze,cqchiyueeast,cqchiyueeast,cqchiyuesouth,cqchiyuesouth,cqchiyuenorth,cqchiyuenorth,cqchiyuesquare,cqchiyuesquare,cqchiyuesquare,cqchiyuesquare,cqchiyuesquare,cqchiyuesquare,cqchiyuelair,cqchiyuelair,cqchiyuelair,cqchiyuelair,cqchiyuelair` |

新档按新主链推进；旧档迁移同时处理每个难度的 `S.act/S.zone/S.ZN/S.CL/S.UN/S.actU` 及当前缓存 `S.cleared/S.unl/S.q/S.Q`，不能只改当前位置。多个旧节点合入同节点时完成状态取并集，解锁不得回退；跨章归位目标对老玩家补足可达资格。`diffU` 与已通关资格保留。越界/未识别历史布局先保留原始快照，再落到最近已解锁主线节点，不能猜成当前基线下标。战斗临时单位重建，不迁移半场血量。

## 5. 怪物、首领与掉落引用（块 3）

现有 MONS ID 全保留：`chick,deer,scarecrow,hookcat,rakecat,halforc,spider1,redsnake,tigersnake,orcwar,cqskel,cqskelwar,cqaxeskel,cqyeti,cqmaneater,cqskelelite,cqzombie,cqcrawler,cqelezombie,cqmaggot,cqbeetle,cqbat`。其中 `cqskelelite` 显示名改为骷髅战将。新增登记：

| 区域 | 普通怪 ID=名 |
|---|---|
| 沃玛 | `cqwomawar` 沃玛战士、`cqwomabrave` 沃玛勇士、`cqwomageneral` 沃玛战将、`cqfirewoma` 火焰沃玛、`cqdarkwar` 暗黑战士 |
| 蜈蚣/石墓 | `cqcentipede` 蜈蚣、`cqblackmaggot` 黑色恶蛆、`cqjumpbee` 跳跳蜂、`cqworm` 巨型蠕虫、`cqpincer` 钳虫、`cqhornfly` 角蝇、`cqwedgemoth` 楔蛾、`cqredboar` 红野猪、`cqblackboar` 黑野猪、`cqscorpionsnake` 蝎蛇 |
| 祖玛 | `cqrat` 大老鼠、`cqzumaarcher` 祖玛弓箭手、`cqzumastatue` 祖玛雕像、`cqzumaguard` 祖玛卫士 |
| 赤月 | `cqfangspider` 暴牙蜘蛛、`cqwolfspider` 天狼蜘蛛、`cqflowerspider` 花吻蜘蛛、`cqpoisonspider` 剧毒蜘蛛、`cqmoonspider` 月魔蜘蛛、`cqblackjawspider` 黑锷蜘蛛、`cqsteelspider` 钢牙蜘蛛、`cqphantomspider` 幻影蜘蛛、`cqbloodzombie` 血僵尸 |
| 牛魔/苍月 | `cqbullhead` 牛头魔、`cqniumowar` 牛魔战士、`cqniumofighter` 牛魔斗士、`cqniumoguard` 牛魔侍卫、`cqniumogeneral` 牛魔将军、`cqniumomage` 牛魔法师、`cqniumopriest` 牛魔祭司、`cqevilzombie` 恶灵僵尸、`cqskelhammer` 骷髅锤兵、`cqskelspear` 骷髅长枪兵、`cqskelaxe` 骷髅刀斧手、`cqskelarcher` 骷髅弓箭手 |
| 魔龙 | `cqmolongfrog` 魔龙血蛙、`cqmolongbreaker` 魔龙破甲兵、`cqmolongarcher` 魔龙射手、`cqmolongblade` 魔龙刀兵 |

普通怪与地图属于不同表，`MONS.cqcentipede` 和区域 `cqcentipede` 允许同名，外部引用必须说明对象类型。普通/精英同物种共用 key，用现有精英标志区分，不把精英词缀拼进持久 ID。

| 首领 ID | 显示名 / 固定归属 |
|---|---|
| `skelspirit` | 骷髅精灵 / `cqskel2` |
| `zombieking` | 尸王 / `cqbichimine`、`cqsnakemine` |
| `treedemon` | 千年树妖 / `cqfengmovalley` |
| `stonezombieking` | 石墓尸王 / `cqshimu7`（原始参考 Lv55/HP5000，块 5 不得以缩放削弱现有首领） |
| `rakecatking` | 钉耙猫王 / `cqbairimen`，原始参考 Lv50；新手区移除同名首领 |
| `orclord` | 半兽统领 / `cqbairimen`、`cqfengmovalley` |
| `redsnakeking`、`elezombieking` | 既有原创首领，分别保留毒蛇山谷、采矿所二层；标注本游戏原创 |
| `womaguard,womalord` | 沃玛卫士、沃玛教主 / 沃玛寺庙 |
| `evilpincer,chulongshen` | 邪恶钳虫、触龙神 / 蜈蚣洞 |
| `whiteboar,evilsnake` | 白野猪、邪恶毒蛇 / 石墓 |
| `zumaguard,zumalord` | 祖玛卫士、祖玛教主 / 祖玛寺庙、`cqzumahome` |
| `bloodgiant,twinblood,twingold,chiyuedemon` | 血巨人、双头血魔、双头金刚、赤月恶魔 / 赤月峡谷，后三者在 `cqchiyuelair` |
| `hongmaboar,hongmascorpion,hongmalord` | 虹魔猪卫、虹魔蝎卫、虹魔教主 / `cqfengmohall` |
| `evilcorpseking,huangquanlord` | 恶灵尸王、黄泉教主 / 尸魔洞、骨魔洞 |
| `niumoking,darkniumoking` | 牛魔王、暗之牛魔王 / `cqniumohall` |
| `molongmoth,molongstrong,molonggeneral,molonglord,molongfake` | 魔龙巨蛾、魔龙力士、魔龙战将、魔龙教主（真）、魔龙教主（假） / 魔龙城 |

新手原首领位置改普通精英遭遇，任务 id 和既有奖励保留；新手替代 key 为 `rakecatelite,orcelite`，显示“钉耙猫头目/半兽人头目”（原创），旧首杀不重复发奖励。旧 `rakecatking/orclord` 首杀、掉落图鉴保留原 key 的记录，不因为实体归位而清空。首领的刷新记录也按 key 保留。

D2 首领旧 key 仅用于兼容读取，主线不再生成，替换映射：`fallen→zumaguard`、`forger→zumaguard`、`seal1/2/3→zumaguard`、`valax→zumalord`；其中 `BOSSES.zumaguard` 是祖玛卫士首领遭遇，区别于普通 `MONS.cqzumaguard`。`siegelord→bloodgiant`、`frostjailer→twinblood`、`traitor→twingold`、`anc1/2/3→bloodgiant`、`tw1/2/3/4/5→bloodgiant`、`eldron→chiyuedemon`。映射首杀记录取并集，刷新到期时间取较晚值，防止重复领取。未列出的 D2 MONS/BOSSES 只读保留，不将无对应物种强改名为传奇怪。

掉落的 `boss`、区域 `boss/bosses/bw.b`、刷新表、图鉴、模拟器统一使用此处 BOSSES key。掉落条目只引用块 4 的 `b`/稳定内容 id，技能书只引用 §3 材料键，不让地图块另写装备或书定义。

## 6. 装备基底、套装与属性（块 4）

### 6.1 保留与新增 ID

既有底材恒等映射，完整集合为：`swd1`…`swd8`、`dag1`、`axe1/axe2`、`wand1`…`wand4`、`arm1`…`arm7`、`hlm1`…`hlm4`、`amu/amu2`…`amu6`、`shd1`…`shd5`、`glv1`…`glv5`、`rin/rin2`…`rin6`、`blt1`…`blt3`、`bot1`…`bot3`。不要因资料纠正显示名/职业而将旧底材换到另一槽位。

新增基底使用现有部位前缀，后接完整无声调拼音，无分隔符：武器剑刀 `swd`、斧 `axe`、法道武器 `wand`、衣服 `arm`、头 `hlm`、链 `amu`、左镯 `shd`、右镯 `glv`、戒 `rin`、腰 `blt`、鞋 `bot`。具体项如下，名称不可自行改另一英文缩写：

| 显示名 | 基底 ID |
|---|---|
| 银蛇、无极棍、骨玉权杖、血饮、龙纹剑、龙牙、嗜魂法杖、逍遥扇 | `wandyinshe,wandwujigun,wandguyuquanzhang,wandxueyin,wandlongwenjian,wandlongya,wandshihunfazhang,wandxiaoyaoshan` |
| 井中月、裁决之杖、屠龙、怒斩、霸者之刃、开天、镇天、玄天 | `swdjingzhongyue,swdcaijuezhizhang,swdtulong,swdnuzhan,swdbazhezhiren,swdkaitian,wandzhentian,wandxuantian` |
| 黑铁头盔、凤天魔甲、凰天魔衣 | `hlmheitietoukui,armfengtianmojia,armhuangtianmoyi` |

其余资料中的新增单件也按“部位前缀+完整拼音”唯一推导，例如力量戒指 `rinliliangjiezhi`、紫碧螺 `rinzibiluo`、泰坦戒指 `rintaitanjiezhi`。资料括号的性别/别称不拼入主 ID；同属性男女衣使用同底材，外观元数据区分。若确需独立属性，块 4 在自己登记表追加 `nan/nv` 后缀并交合并者核对。

左右手镯同名、不同基底：如骑士手镯 `shdqishishouzhuo/glvqishishouzhuo`；同一戒指基底允许装备 ring1/ring2，不创建第二个戒指 ID。`ring` 是底材部位，`ring1/ring2` 是装备槽；原有十槽键均不改。

### 6.2 档位与套装

普通早期底材 `cqTier` 为 `basic`；档位字段新增 `cqTier`（字符串），顺序表独立于现有数字 `tier`（旧掉落逻辑仍使用它）；不能把两者互换。

| cqTier | zs 套装 id / 系列名 | fs | ds |
|---|---|---|---|
| `woma` | `woma_zs` 沃玛战 | `woma_fs` 沃玛法 | `woma_ds` 沃玛道 |
| `zuma` | `zuma_zs` 祖玛战 | `zuma_fs` 祖玛法 | `zuma_ds` 祖玛道 |
| `chiyue` | `shengzhan` 圣战 | `fashen` 法神 | `tianzun` 天尊 |
| `molong` | `leiting` 雷霆 | `lieyan` 烈焰 | `guangmang` 光芒 |
| `molongplus` | `leitingplus` 强化雷霆 | `lieyanplus` 强化烈焰 | `guangmangplus` 强化光芒 |
| `baijin` | `baijin_zs` 白金战士 | `baijin_fs` 白金法师 | `baijin_ds` 白金道士 |
| `xingwang` | `xingwang_zs` 星王战士 | `xingwang_fs` 星王法师 | `xingwang_ds` 星王道士 |

战神/圣魔/真魂系列另保留套装 ID `zhanshen/shengmo/zhenhun`，放入 `molongplus` 掉落带；它们不是白金的别名。通用特殊套装 ID 固定 `qidao,jiyi,hongmo,moxue,shenmi,kuangfeng`。白金与铂金戒指不是同物，`baijin` 不能替代 既有戒指 ID（铂金戒指新增为 `rinbojinjiezhi`）。

系列基底也采用上述拼音规则：`hlmleitingtoukui/amuleitingxianglian/shdleitingshouzhuo/glvleitingshouzhuo/rinleitingjiezhi/bltleitingyaodai/botleitingzhanxue/armleitingzhanjia`；强化系列在相应基底末尾加 `plus`。白金/星王使用 `<部位前缀><baijin|xingwang><zs|fs|ds>`，如 `hlmbaijinzs`、`rinxingwangfs`；显示名由块 4 登记，不将猜测名称标为原版名。

新套装部件稳定内容 id 为 `set_<setId>_<slot>`，slot 使用 `weapon/armor/helm/amulet/shield/gloves/ring/belt/boots`，同基底戒指共用一个内容 id。新增暗金稳定内容 id 为 `uniq_<baseId>`；同基底多种暗金则末尾追加完整名称拼音。首领专属的现有条目首次登记为 `uniq_<bossKey>_<baseId>`，迁移先按旧保存的名称+底材定位，不按数组下标猜测。`it.uid` 永远是实例身份，以上是定义身份。

`SETS.zuma` 占位保留为只读 legacy 套装，旧 `set:'zuma'→'zuma'`；不按当前角色职业强转成新三套，避免跨职业仓库装备失效。新掉落只用新 ID。原有四件占位不降属性、不清套装奖励。新增 2/4/6 件效果标为本游戏原创，不宣称 1.76 原版机制。

### 6.3 属性键与数据形状

| 含义 | 定义/存储契约 |
|---|---|
| 攻击 x-y | 基底 `dmg:[x,y]`；附加词缀为 `mindmg/maxdmg` 两个标量；API 沿用 `atkMin/atkMax` |
| 防御 x-y | 基底 `def:[x,y]`；新增区间词缀 `defMin/defMax`，原 `m.def` 标量保持旧计算语义，禁止改类型 |
| 魔法、道术、魔御 x-y | 基底 `bm.mag/bm.tao/bm.mdef:[x,y]` 为现有形状；新区间端点固定 `magMin/magMax,taoMin/taoMax,mdefMin/mdefMax` |
| 准确 | `ar`（标量）；区分原版准确点与引擎命中率，换算只在适配层执行 |
| 敏捷 | 沿用装备修饰键 `dex`，不新增同义 `agi`；角色 `S.at.dex` 与装备贡献分别保存，结算层换算时避免重复相加 |
| 幸运、诅咒 | `luck/curse`（标量，非负）；有效幸运由结算层计算，不覆盖原值；`S.curse` 是技能状态，不能挪作武器诅咒 |
| 极品附加 | `it.cqBest` 为键到固定增量的对象（只用本表属性键），不混入基础值；强化仍是 `it.en`，淬锋仍是 `it.rf` |
| 暴击、攻速、生命、法力 | 沿用 `crit/ias/life/mana`，不新增同义键 |
| 特戒 | 沿用 `para/prot/revive`；新增 `invis/teleport/overload` 为隐身/传送/超负载效果键 |
| 固定成长/转生 | `S.at/S.atb` 内仍是 `str/dex/vit/ene`；与装备修饰对象内的 `dex` 区分 |

重要：当前 `bm.mag:[1,2]` 等区间经过生成器会随机取单个值，**不是已经支持战斗 x-y**。块 4 必须增加定义层区间元数据 `cqRange:{mag:[x,y],tao:[x,y],mdef:[x,y],def:[x,y]}`，由 `itemLocal/allMods` 适配输出上述端点；旧标量 `mag/tao/mdef/def` 继续原义，不把 `[x,y]` 塞进全局标量累加器。端点表示该装备贡献，不能再次当成随机词缀范围抽样。新区间和旧标量的兼容结算必须只加一次。

旧 `b→b`、`uid→uid`、`en/rf/anc/lock→原值` 为默认映射。纠正传奇底材属性后，要比较旧档装备与角色迁移前后的实战属性；较弱项以独立 `it.cqLegacy` 固定补偿对象记录（端点键同本表，标量旧键仍有效），不可每次读档再次累计。覆盖玩家、英雄、背包、个人/共享仓库与已保存掉落。未知底材走已有 `cqD2Slot` 兜底并保留快照，不静默销毁。块 4 提供纯装备迁移函数，统一读档钩子由合并者接入。

## 7. 等级、经验、缩放、转生（块 5）

沿用 `S.lvl/S.xp/S.reb/S.atb`、`CQ_BAL.lvlCap/rebirthMax/capMul`，不另造 level/prestige 等同义字段。新增 `S.rebXp` 为 60 级后转生经验，转生 id 是整数 1…10；固定奖励表按 `zs/fs/ds` 登记，奖励只修改 `S.atb` 并按新增次数结算。设计方案没定每次具体奖励数值，由块 5 在 ≤0.1 转生预算内确定并记录，不在本契约冒充既定数值。

经验表沿用 `XPT` 及 `xpNeed()` 接口，块 5 明确“当前级升下一级”和函数参数的偏移，尤其检查现有 `cq/sys_cq.js` 的 `l>=lvlCap` 哨兵是否阻止 59→60。原始 1–50 表和 51–60 外推表分开保存元数据，不篡改原表以达时长；实际挂机节奏用经验获取系数校准，地图 `ml0/ml` 仍区分原始等级与难度调整值。怪物参考等级单存 `refLv`，不直接把原版 Lv60 首领当成玩家解锁等级。

旧 `lvl→min(lvl,60)` 只作为显示上限，不得仅截断属性：超限旧档保留迁移前等级、经验和战斗属性快照，经验转入 `rebXp`，属性不足通过固定 `S.atb` 补足；50–60 内旧档保留原等级与当前级经验进度，经验需求缩放时按进度比例换算。不能重复使用现有迁移再截一次经验。块 4 的装备补偿先执行，块 5 再比较整角色情况，避免双方对同一损失双重补偿。

统一迁移版本新增 `S.mir2Mig` 对象，子标记 `skills/maps/equipment/progression` 各从 1 起，原有 `S.sv/S.sk9/S.cqsk` 不挪用。各块迁移先计算后提交，成功才写对应标记，失败保留原档；合并者按技能→地图→装备→等级顺序调用。幂等复读两次必须无数值变化；未知未来版本不可按旧版重迁移。

## 8. 图标、素材路径与注册（各块按内容拥有）

| 内容 / 所有者 | 新文件路径规则 | 已有行为及接线 |
|---|---|---|
| 技能图标 / 块 2 | `assets/cq/icon/sk_<skillId>.png` | 当前 `classes.js` 从 `assets/skills/manifest.json` 读 webp；由块 2 增加新路径优先查找，旧路径保留回退 |
| 技能书 / 块 2 | `assets/cq/icon/book_<skillId>.png` | 扩展 `CQ_ICONS.books`，职业前缀只在材料键，不放文件名 |
| 合击图标 / 块 2 | `assets/cq/icon/sk_heji_<slug>.png` | slug 见 §3.2 |
| 技能/合击特效 / 块 2 | `assets/cq/fx/<skillId>/frame_000.png`、`assets/cq/fx/heji_<slug>/frame_000.png` | 三位帧号递增；新增 manifest 描述帧数/时长，现有 cqfx 名是视觉资源别名，不替代技能 id |
| 装备 / 块 4 | `assets/cq/icon/eq_<baseId>.png` | 扩展 `CQ_ICONS.eqs`；套装/暗金默认取基底图 |
| 普通怪/首领 / 块 3 | `assets/cq/ui/mdl_mst_<key>.png` | `CQ_MONART[key]='mdl_mst_'+key`，既有数字 artId 原路径可继续使用 |
| 地图背景 / 块 3 | `assets/cq/bg/<zoneId>.webp` | `ASSETS['bg_'+zoneId]` 登记，区域 bg 指向该资源键；同章可共享一张静态图 |

表中为统一文件名约定，不代表文件已存在。只注册实际文件，未生成时继续现有 fallback，禁止为不存在素材触发 404。`cq/icons_cq.js` 是公共注册文件，由合并者合并各块清单；各块不得并行编辑。CSS 的相对 url 以 CSS 所在目录解析，沿用 `absUrl/document.baseURI`，不能产生 `cq/assets/...`。

资料 icons.md 仅供风格/命名参考，不直接拷贝版权素材；需要新图使用内置 imagegen 生成传奇风图片。旧图路径恒等映射，不为改名复制版权图。特效一次性播放结束释放节点/计时器；持续伤害可持续结算，视觉不能无限循环。

## 9. 文件独占与合并接线

为解决 gap.md 中块 3 和块 4 都触及 `data_cq*.js` 的冲突，采用“现有文件单一所有者 + 新扩展文件”方式。新文件是本契约预留，当前未创建；每块可以独立提交其文件，公共接线在最终合并统一完成。

| 块 | 独占可编辑文件 | 禁止顺带修改 |
|---|---|---|
| 2 技能 | `cls_zs.js,cls_fs.js,cls_ds.js,classes.js,cls_hero.js,cq/cq_hero.js`；新 `cq/mir2_skills.js`；对应 sk/book/fx 素材；新 `tests/mir2_skills_test.js`，既有 `tests/cls_*_test.js`、`cq/cq_battle_test.js` | 不改地图/装备数据；块 1 的合击修正先在本块核对后整合 |
| 3 地图怪物 | `data_acts.js,cq/data_cq2.js`；新 `cq/mir2_maps.js,cq/mir2_loot.js`（只含掉落引用/权重）；对应地图/怪物素材；`tests/cq_m2_test.js`、新 `tests/mir2_maps_test.js` | `data_cq2.js` 既有 UNIQUES 段冻结，由新装备扩展覆盖；不在此处改装备定义 |
| 4 装备属性 | `cq/data_cq.js`（只限 CQ_BASES/词缀/UNIQUES/SETS/SETITEMS 段，地图段冻结）、`items.js`；新 `cq/mir2_equipment.js,cq/mir2_equipment_migrate.js`；装备素材；新 `tests/mir2_equipment_test.js` | 不改 data_cq.js 怪物地图段；不编辑 data_cq2.js 的掉落条目，而在扩展中按稳定身份更新 |
| 5 等级转生 | `data.js`（经验表）、`cq/balance.js,cq/bal_fix_cq.js,cq/cap_cq.js,cq/cq_hero_balance_sim.js`；新 `cq/mir2_progression.js`；新 `tests/mir2_progression_test.js` | 不直接改职业/装备/地图基表；缩放用扩展层读数据，不以改首领基础数值达标 |

所有未列入独占的既有文件默认由合并者协调，特别是 `game.js,acts.js,loot.js,bossloot.js,cq/cq_scene.js,cq/cq_fx.js,cq/icons_cq.js,cq/sys_cq.js`、共享测试 harness 和跨块测试，不能各分支先改再解决冲突。块 5 如需成长引擎变更，提供接线说明，不抢块 2 的 `classes.js`。每块提交具体调用签名、加载顺序和公共文件补丁说明，公共文件只能最终合并时修改。

| 公共文件（只由合并者改） | 块 2 接线 | 块 3 接线 | 块 4 接线 | 块 5 接线 |
|---|---|---|---|---|
| `index.html` | 技能扩展放职业注册后、技能消费前 | 地图扩展在 data_cq2 后；掉落引用在装备定义后 | 装备扩展在两份旧数据后、genItem 首次使用前 | progression 在经验/平衡数据定义后、首次建角/读档前；维持 cap 包装次序 |
| `cq/sysapi_cq.js` | 技能/英雄列表及 heroOnly、22 级解锁 | 稳定区域 id 查找、`CQ_MONART`、首领位置查询 | 区间端点 API、装备职业与英雄穿戴属性 | 等级/转生 API、英雄等级封顶及属性计算 |
| `cq/m2_cq.js` | CQ_BOOKS 注册/掉落池/自动学书只用新书键 | `CQ_BOSSRT` 全首领刷新/归位、离线首领 | 首领专属与特戒掉落接新定义 | 60 级后经验分流、离线经验、转生固定奖励 |
| `cq/pages_cq.js`、`cq/pages_cq.css` | 技能格/书/英雄专属和一次性提示 | 7 章主线、支线、首领列表/预览 | x-y 属性、准确敏捷幸运诅咒极品、套装/迁移文案 | 60 级进度、转生按钮/说明，禁止加点入口 |
| `cq/sys_cq.js` | 书/技能幂等迁移 | 全难度地图进度迁移 | 全容器装备迁移 | 最后执行属性保底与等级经验迁移，更新封顶钩子 |
| `cq/icons_cq.js` | 新技能书与技能图标注册 | 怪图由 sysapi 登记，此处无怪图注册 | 新底材图标注册 | 无新素材要求 |

`CQSys.createChar`、加载后的新档首次计算和读档路径都必须执行同一最终契约。主线仍用现有数组下标接口，字符串 ID 通过合并层解析，不允许某块单独改成字符串 `S.zone`。公共接口在实现前允许补充显式导出，但不直接调用其它块闭包内私有函数。

## 10. 合并验收与本次验证边界

每块交付先校验：技能/书/区域/首领/底材/套装定义无重复，同类型引用可解析；图标登记路径存在；旧→新映射覆盖其修改的所有持久字段；同档读档两次无变化；未知内容不丢失。装备区间、旧档不变弱、全难度地图可达、英雄专属不能被主角学习是必测断言。

提交前执行改动 JS 的 `node --check`、全部 `tests/*_test.js`、`node cq/cq_battle_test.js`、`python3 tests/pw_baseline.py`。UI 改动还需 Chromium/WebKit × 新档/旧档，在 390×844 截图并校验触控、换行与空白关闭。完整合并后以三职业正常换装模拟验证 60–80 小时与弱流派加强；不得降低首领以通过测试。

本窗口只改文档，没有改动 JS 或 UI，因此 JS 语法检查及新增 UI 四组合截图不适用；仍执行全部 Node 测试、战斗测试及现有 Playwright baseline，结果随本地提交报告。既有基线失败须据实记录，不能为文档提交去改代码，也不能声称“全过”。
