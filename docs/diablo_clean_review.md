# 暗黑残留清理独立审核（第3轮）

日期：2026-10-26。工作区 `/workspace/cqx-clean-int`，分支 clean-int；被审 HEAD `d3cc799`，基线 master=`af6bfe1`。读取外部31条审计、共同原则、三组开发说明、两轮审核及 `docs/diablo_clean_fix2.md`，对照基线差异、当前代码及最终加载链。本轮仅覆盖本报告并提交，不修改产品或测试、不push、不访问真实账号或写云端。初始工作树干净。

结论：通过。31条为已清27条、保留兼容4条、未清0条。本轮重点复核恢复套装、测试改写及设置难度按钮。以下结论以静态阅读、实际快速测试和本地隔离浏览器验证为限，不等于七章长模拟或真实云迁移验收。

## 各轮问题处理情况

| 轮次及编号 | 本轮状态 | 依据 |
|---|---|---|
| 第1轮 MUST-FIX-01（迁移魔御未进入战斗） | 已解决，复验通过 | `cq/mir2_equipment.js:615–620/645` 有效区间与magicGuard，普通攻击和hurtHero均接入；专项五种伤害、组合装备、任务奖励魔御及幂等29项通过。 |
| 第1轮 MUST-FIX-02（日常禁词） | 已解决，复验通过 | bonus栏目、账号说明、英雄技能书页清理；全仓扫描与新旧档44页均未发现日常禁词输出。 |
| 第1轮 REVIEW-01（低04旧模板） | 已解决 | game旧技能/装备模板删去，最终传奇模块仍接管；本轮地图250项、浏览器加载与战斗220项通过。 |
| 第1轮 REVIEW-02（融合权益断言） | 已解决 | 当前集成断言检查rf.n/k/off保留；没有要求清空购买次数。 |
| 第2轮 REVIEW-03（首次迁移严格JSON相等失败） | 已解决 | `tests/cq_prune2_test.js:28`改验UID唯一、强化、品质、卖价、战力及原有效属性；装备专项又检查第二次重载JSON幂等。本轮58/581项通过。 |
| 独立测试报告：设置难度按钮过小 | 已解决 | `cq/ui_cq.css:23–24` 5列网格，1–9分两行，宽高至少44px且单行；Chromium/WebKit新旧档实测通过。 |
| 独立测试报告：旧套装机制及过时断言 | 已解决 | d3cc799恢复合法技能机制和生命/法力奖励；删除旧吸血/百分比属性契约，改测实际输出，见后文。 |

## 31条逐项结果

| 编号 | 判定 | 当前代码与理由 |
|---|---|---|
| 高01 | 已清 | `game.js:345` heroDisplayAttrs 与 `cq/pages_cq.js:22` 最终首屏共用传奇属性；取消较早的DOM补丁。首屏不再列吸血和旧百分比属性；bonus.js:47已删除废弃栏目，生成HTML专项通过。 |
| 高02 | 已清 | `game.js:351` 详细面板使用同一展示助手；`late.js` 删除旧主属性增伤说明。旧力量/精力、元素抗、偷取、断点等详细表已替换。 |
| 高03 | 已清 | `data.js:4` ASSETS.hero 与职业分支指向 `zs_portrait.webp`。目检现图为持刀人类战士。 |
| 高04 | 已清 | index favicon、apple图和 manifest 180/192/512 引用存在；三张PNG均逐张目检为刀盾图，无亡灵。favicon二进制已更换，未逐一目检ICO内全部尺寸。 |
| 高05 | 已清 | `shop.js:22` 旧 gamble 只转盟重赌石坊；旧独立抽取/扣费链移除。外层 gamble_fix 的容量检查不恢复旧赌博。 |
| 高06 | 已清 | `reforge.js:11` 白名单、传奇品质资格和7/10/15上限；保留超过上限的历史 n、未决 off、boff/bless；待选时不能再次扣费，可保留原值。专项12项通过。 |
| 高07 | 已清 | 全局 QN、赌石q3/q4/q5、回收/仓库/融合显示统一。稀有是本次原则明确允许品质，不能因原报告高07名称仍在就判失败；旧数字q映射属于兼容。 |
| 高08 | 已清 | `data_endgame.js` 去掉旧收集/关卡目标，等级30/45/60、转生1/10；`eg_core.js:10` 封存废弃已完成记录，不再要求玩家完成。 |
| 高09 | 已清 | `eg_ach.js:10` 图鉴改固定攻击/防御，不再注入全抗、MF、完整收集经验倍率；旧收集键保留。 |
| 高10 | 已清 | `eg_bounty.js:14` r.ore与实际黑铁矿一致，页面奖励说明也已改；旧周常封存与补宝匣有一次性标记。 |
| 高11 | 已清 | `eg_events.js:26` 去钥石、改黑铁矿，说明极品/稀有；世界首领改魔龙统领，未下调其生命/攻击配置。 |
| 高12 | 已清 | eg_secret.js已删除、index无注册；运行时 egSecretStart 未定义；旧 staff/runs/king移至history，仅存档核对。 |
| 高13 | 已清 | `dlog.js` q5标签改极品，旧名称显示有过滤；`eg_ach.js:3` 新增极品日志同步更新。`tianguang.js:5/8`标签改极品并去掉旧物触发分支。 |
| 高14 | 已清 | `cq/mir2_maps.js:1989` 等任务文案与 `acts.js:136` 等执行改金币/防御魔御；cqMetaRewardsV1与难度+任务领取表防重；旧资格/永久防护归档折算。 |
| 高15 | 已清 | `cq/mir2_sets.js:16–26` 套装奖励均为允许固定属性（含生命/法力）；吸血及全局1.5倍执行链未恢复。`:49–67`恢复双烈火、双火墙、冷却和神兽溅射，系特定技能机制，不是装备百分比属性；43项专项通过。身份、收集、300杀保底和待领保留。 |
| 高16 | 已清 | `cq/mir2_equipment_migrate.js:5`–6增加cqGuardVersion单次补差；`:13`隔离禁止属性、`:36`补足旧战力。`cq/mir2_equipment.js:615`–618将迁移固定魔法/道术/魔御与区间接入实际计算。独立原样本伤害211、幂等通过；容器/UID/已购次数/待选结果保留专项通过。 |
| 高17 | 已清 | `acts.js:11/54/66/88`取消难度惩罚、元素免疫与降抗，使用防御/魔御；`cq/mir2_equipment.js:645`统一hurtHero魔法及毒伤入口，普通攻击由`game.js:265`调用同一magicGuard。首领生命、攻击配置未下调；原迁移魔御无效问题已修复，短验见下文。 |
| 高18 | 已清 | `cq/mir2_equipment.js:589` 最终有效白名单；随机PREFIX/SUFFIX和淬锋仅八属性，固定生命/魔法上限按本次原则允许。 |
| 中01 | 已清 | eg_rift.js仅剩圣域所需怪池工具/历史页；运行时无egRiftStart、无rift页注册。eg_mj独立入口和uber父入口接到已批准圣域，不再保留封魔幻境玩法。 |
| 中02 | 已清 | GS规范化、账号/角色命名空间、偏好、auth、IDB采用cq-；旧cq_读取迁移，云extra导入也规范化；登出清新旧session避免复活。SQL cq_saves不改。内存/替身测试通过，未连接真实云。 |
| 中03 | 已清 | `sw.js:5` 删除条件为 startsWith('cq-') && k!==V，运行测试只删cq-old，保留当前版本、anye及其他缓存。版本名未改。 |
| 中04 | 已清 | `art.css` .gp/.ipanel边框改金红CSS及新饰片；标题旧背景去掉。目检新饰片；不把其他选择器的旧ui2资源一概判违规。本次未做浏览器computed style复验。 |
| 中05 | 已清 | audio的sched/sfx/playSkill不再调旧曲/技能合成回退；audio_cq失败或无采样静默。保留音频总线及独立命中音；未进行真人听辨。 |
| 低01 | 保留兼容 | 旧data_items等同步加载，但后续表清空/覆盖；ITYPES/AF与CQ_D2_SLOT底材ID→部位映射仍是运行与旧档迁移依赖。允许保留依赖，不把旧名字字符串当当前掉落。 |
| 低02 | 保留兼容 | prune_mig、sys_cq/sysapi负责旧消耗物折算、点数折金币、旧招募装备转英雄/溢出容器，必须保留以接管旧档。未发现恢复旧玩法入口。补偿提示本次明确豁免。 |
| 低03 | 已清 | EG_DEF不再创建lp/cube/season/已取消关卡空壳；旧lp/season读取及season→normal记录保留，因旧档进度必须可追溯。 |
| 低04 | 已清 | `game.js:359/374`旧技能点模板和弹窗已移除，保留被包装函数接口；`:387`分类改材料，`:394`旧装备详情改最小回退；旧凹槽/暗金/五章服务模板及pages过期章节注释已清。`cq/pages_cq.js:147`最终技能书页、`classes.js:225`技能弹窗继续安装，七章地图最终覆盖仍在；本轮地图250项及浏览器实际技能页加载通过。低01依赖表中的历史定义不归为现行模板。 |
| 低05 | 保留兼容 | 已移除无消费者ASSETS项及art2_map加载；其余ASSETS、art_map、art_icons3和技能图有调用/回退依赖。保留依赖可接受，文件存在不等于当下显示；未对全部战场资源逐帧目检。 |
| 低06 | 保留兼容 | 活跃品质抽取改一次抽取；qualityChance/qRoll接口、稳定q/uid/部位ID及生成骨架供调用/旧档保留，理由成立。q5失败降q4等有限回退仍存在，不等于继续展示旧品质体系。 |
| 低07 | 已清 | DESIGN/README/TODO改为七章/八属性/英雄/新键；旧规则移docs/archive并明确非现行。 |
| 低08 | 已清 | 两份旧方案改为当前决定，旧版移archive；data_cq过期章节待改说明已更新，不再据旧方案保留取消模块。 |

## 词表扫描与命中清单

实际对全仓 `*.js / *.html / *.css / *manifest*` 运行rg（包含模板及CSS content），词表如下。原始全仓扫描包含测试和工具；主程序清单排除tests/tools后173行，仍含 `cq/cq_battle_test.js`。逐行分类后的清单附末尾，不能把命中行数当玩家泄漏数。

```sh
rg -n '暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer' -g '*.js' -g '*.html' -g '*.css' -g '*manifest*'
```

| 命中位置/组 | 判读 |
|---|---|
| cq/mir2_maps.js:120 | 暗黑战士，明确允许的传奇怪名。 |
| prune_mig.js:26；classes.js:163/167 | 只在旧档整理触发的历史补偿/退点日志，按用户迁移提示豁免处理。 |
| data.js:17/39/199/200/202/206；data_items.js:110/270；data_items2.js:37/72；data_acts.js:228/242/244 | 初始历史内容表及格式词典，最终cq/data_cq和mir2表清空/覆盖；底材ID到部位映射、AF/ITYPES依赖需保留。没有作为当前新掉落/任务显示的证据。 |
| cq/data_cq.js:106；items2.js:7 | ll旧格式及旧分类名称；最终有效白名单和当前分类不输出对应项。 |
| dlog.js:27；eg_ach.js:4/16；cq/ui_cq.js:5/6；settings.js:11；ui_art.js:11 | 过滤器/旧名识别字面量，不是新建入口或输出这些文字。 |
| bloodmoon.js:15 | cha_s底材已不存在，wardMake返回null；不会新生成旧护符。 |
| bossloot.js:6 | 已取消rift_guard的备用名，无当前生成/挑战入口；不判为可达首领名称。 |
| 其他各行 | 注释、迁移内部说明、cq下测试、旧资源回退说明；完整文件行见附录。 |

index、manifest和CSS content未发现直接禁词输出；恢复的套装定义/图鉴说明无词表命中。Chromium/WebKit新旧档44页无禁词。旧字段名、注释和历史一次性补偿提示没有当作残留。旧日志记录保留不等于当前玩法宣传；不以DOM隐藏替代有效属性隔离。

## 第2轮修复重点复核

`cq/mir2_sets.js:16–26`的奖励只有固定攻击/魔法/道术/防御/魔御及允许的生命/法力。`:49–55`的35%神兽溅射和半力烈火是特定技能追加动作；`:56–67`的两层火墙、独立到期和冷却调整属于技能规则。它们没有把ll、edmg、ias等重新加入allMods，也未恢复雷霆/烈焰/光芒全局1.5倍。追加烈火调用clsMelee，不再次施法耗蓝或播放施法动画；溅射直接调用捕获的下层hit，且排除英雄神兽。该恢复符合独立技能机制边界。

`tests/mir2_sets_test.js`仍以实际命中测无回血、无直接/延迟1.5倍，以clsSV实测六件固定魔法增加上下限各9点，并检查双击、双墙到期、卸装冷却、溅射比例与职业限制、保底和满包待领。43项均通过，非删空断言。`mir2_equipment_test`保留全部底材矩阵、六类容器、独立旧计分基准、实际魔御/英雄/召唤路径；不再要求被禁止属性继续有效，改验允许属性和补偿战力，合理。`cq_prune2`保留实质权益而允许新增迁移标记，合理。

`tests/items_test.js`改用当前完整入口，42项覆盖一次品质抽取边界/分布、合法内容、三职业属性、买卖回购、旧赌博不扣钱和存档守恒。旧MF/赌博/禁止属性要求应当删除；但同时删去1500次随机跨仓、多角色/命名空间和部分自动回收覆盖，确实缩小了该文件的回归范围，不能称其与原套件逐项等价。相关仓库、云和迁移有其他专项；本轮列非阻断维护建议。

难度按钮仅CSS布局修改，没有改难度系数、解锁门槛或首领。后置 `#setM .mdset .btns` 的grid声明覆盖前面的flex；五列最小44px、6px间距，390宽度实测通过。

## 迁移、入口、难度和明显bug

装备迁移为复制后遍历，覆盖角色、英雄、背包、个人/共享仓库及待领。UID、强化、锁定、品质、历史进度和rf.n/off/boff/bless保留；超新上限次数不截断，未决候选不能再扣钱，可保留原结果。禁止属性封存cqLegacy/cqOriginal，正常allMods只出允许属性；旧计分仅用于迁移，固定攻防换算及战力缺口补防御有版本标记。测试检查不删装备、补偿计分不降、候选价值和重复迁移幂等。战力分数保全有证据，不声称所有旧构筑实战DPS完全相同。

原75防护样本经迁移固定魔御进入effectiveRanges和hurtHero，1000伤害不超过250；火/冰/雷/魔法/毒伤、分散多件旧装备、已清理档guard补差和任务固定魔御均通过。旧抗性不回流。任务旧资格折金币、永久防护折固定属性，有历史记录与领取标记；第五章新奖励不再授予凹槽/元素属性。

GS新写cq-并规范旧cq_；cqRead、账号/角色命名空间、云extra、localStorage登录态及旧cq_auth IndexedDB有向前读取链。登出删除新旧会话避免复活。SQL仍用cq_saves，表名不属于浏览器前缀要求。云和meta替身测试通过，未操作真实账号/数据库。SW activate执行测试只删cq-old，保留当前cq-20261021z、anye及其他应用缓存；没有改版本或缓存名。

EG_PAGES没有secret/rift注册，egSecretStart/egRiftStart未定义；eg_secret.js删除且入口无引用。eg_rift仅留获准圣域工具及历史页。旧赌博函数只转盟重赌石坊，不再扣款抽取；addSock及其按钮移除。旧staff/runs/king/rift记录只封存，不恢复入口。

静态比较首领hp/dmg与难度生命/攻击系数未因本轮清理下调。防护由固定防御/魔御计算，旧元素免疫/降抗不再决定伤害，防护有限；三职业可对首领造成伤害的meta短验通过。未发现明显不可通关的静态证据，也没有发现削首领来补难度的改动。19项平衡短测通过，但测试没有穿齐本轮恢复的机制套装，不能据此宣称其整套持续输出也已经证明≤1.8倍；这属于验证边界，见建议。

58个变更且存在的JS均通过node --check；git diff --check通过；index所有本地src/href文件存在。harness和浏览器加载无错误，本轮未发现明确未定义函数引用。192安装图本轮目检为刀盾；其他图与装饰沿用前轮已目检记录，本轮未重复全资源视觉验收。音频仅核查清理后的回退链，未真人听辨。

## 本轮实际验证

| 检查 | 结果 |
|---|---|
| 语法 / diff空白 / index本地引用 | 58个JS通过 / 通过 / 无缺失 |
| mir2_sets / mir2_equipment / items | 43 / 581 / 42 pass，0 fail |
| diablo_clean_migrate / diablo_clean_save / diablo_meta | 29 / 13 / 20 pass，0 fail |
| cq_prune2 / reforge / bloodmoon | 58 / 12 / 16 pass，0 fail |
| mir2_bal_short / mir2_cloud | 19 / 14 pass，0 fail |
| cq_m1 / tianguang / mir2_maps / cq战斗 | 41 / 9 / 250 / 220 pass，0 fail |
| python3 tests/diablo_clean_browser.py | 退出0；Chromium/WebKit × 新旧档 × 11页=44页，无pageerror/禁词/按钮换行/小于44px主按钮，弹窗空白关闭通过 |

浏览器禁SW、阻断非本地请求、内存构造角色，未登录或写云端；产物在原脚本外部目录 `/workspace/design/laoyang_m1_shots/codex_diablo_clean/`。本轮未重跑全部58份Node套件，开发说明中的全套结果不冒充独立实测。

## 问题清单

必须修复项：无；MUST-FIX-01/02均关闭，无新增MUST-FIX。

- REVIEW-04（非阻断，测试覆盖）：`tests/items_test.js:34–38`仅一次共享存取及重载。建议把原随机跨仓、角色隔离和自动回收守恒场景改用当前合法物品恢复到对应专项，避免后续仓库回归漏测。
- REVIEW-05（非阻断，平衡证据）：`tests/mir2_bal_short_test.js:6–23`没有激活恢复的完整套装；建议增加三职业短探针，包含双烈火、双墙/冷却和神兽溅射，明确定义1.8倍预算对技能追加机制的口径，再验实际伤害及持续输出。当前短测只能支持既有强化/器魂/首爆/转生封顶链，不能证明所有套装搭配的持续输出。
- 低01/05/06依赖保留理由成立；后续拆分需先提取稳定迁移表/公共结构并核查消费者。未把保留兼容误记为整文件已删除。

## 附录：主程序词表原始命中

以下173行含注释、兼容表、过滤器和cq下测试，应结合前文分类判读；报告本身不在扫描范围。

```text
art.css:38:/* ===== UI2 批次二：生命/法力球、怪物/角色卡框、血条/经验条/分割线、日志羊皮纸、快捷栏药水、炼金匣图标 ===== */
acts.js:135: case'a4q2':{const g=[1500,3000,6000][d];S.gold+=g;log('熔炉迸出 '+g+' 金币');break}// 原奖励宝石+符文（已删除）改金币
acts.js:137: case'a5q2':{const g=[2000,4000,8000][d];S.gold+=g;log('获得 '+g+' 金币');break}// 原奖励符文×3（已删除）改金币
acts.js:173:// ---------- 物品：加凹槽 / 个性化 （任务奖励） ----------
audio.js:3:// 音效：普攻 / 技能 / 掉落(按品质，暗金/套装/符文之语特殊) / 升级 / UI 点击。
audio.js:124://       ③ 同类同时发声上限 CAT_MAX；④ 召唤物/佣兵/命中类额外随机稀疏，避免满屏召唤物时成噪音。
audio.js:179: // 诅咒（共用暗黑和弦底色，音程/音色各异）
audio.js:248:// --- 召唤物 / 佣兵 / 命中 / 暴击 / 格挡 ---
audio.js:265:// 命中 / 暴击(致命一击黄色飘字) / 召唤物与佣兵攻击：包装最外层 hitMon
audio.js:272:// 格挡：英雄格挡飘字 / 佣兵格挡飘字
audio.js:277:// 1 稀有 · 2 暗金/套装 · 3 高符文 · 4 上古/至臻 · 5 神话。不受战斗页限制，受音效音量/静音/后台暂停控制。
audio.js:282: (D,t)=>{// 暗金/套装：低沉坠地 + 上行钟组
audio.js:284: (D,t)=>{// 高符文：重石坠地「咚」+ 石面共振 + 符文低鸣，余韵 2 秒
audio.js:294: (D,t)=>{// 神话：大地震颤 → 三连坠地 → 管风琴般的暗金和声 + 合唱 + 丧钟，约 4 秒
audio.js:309:// AUDIO.reforge(kind)：charge 蓄力(~1s 熔炉+符文嗡鸣) / reveal 翻牌(连续 3 次不吞，音高递升) / pick 选定 / perfect 满值华丽。
audio.js:314:  for(const d of[-8,8])tone(D,{f:mtof(38),glide:mtof(45),t,dur:1,type:'sawtooth',vol:0.05,a:0.6,d:0.2,sus:0.9,r:0.25,cut:700,q:5,det:d,wet:0.5});// 符文嗡鸣上升
audio.js:333:// 否则最高品质为暗金及以上（暗金/套装/符文之语/高符文≥20号/上古/至臻/神话）→ 自己补播对应分档音效，旧 drop 音永不播；
audio.js:334:// 其余（稀有/魔法/符文/宝石/普通）播旧 drop 音。离线结算/无 UI 时静默。
items2.js:4:// 双手武器、珠宝镶嵌、护身符（背包生效）、撕裂伤口/压碎性打击/致命一击等属性生效、详情显示修正、
items2.js:5:// 珠宝/护身符掉落、升级/修复配方、新武器图标、随从可用弓/长柄。必须在 acts.js 之后加载。
items2.js:7:const CATN={wand:'魔杖',dagger:'匕首',sword:'剑',helm:'头盔',armor:'铠甲',shield:'盾',head:'缩颅',bow:'弓',xbow:'弩',polearm:'长柄',spear:'矛',jav:'标枪',throw:'投掷',axe:'斧',mace:'锤',staff:'法杖',jewel:'珠宝',scha:'小护身符',mcha:'大护身符',lcha:'超大护身符',gloves:'手套',belt:'腰带',boots:'靴子',pshd:'圣徽盾',pelt:'毛皮头饰',bhelm:'野蛮人头盔',orb:'法球',abow:'弓'};
items2.js:9:// 护身符/珠宝（isCharm/isJewel/charmMods/genJC/jewelUI）与炼金匣升级/修复配方已删除（legacy_prune 批次2）
items2.js:25: // 最大抗性：超出 75 的部分最多可到 75+最大抗性
items2.js:57:// ---------- 物品详情：属性统一显示、双手、珠宝/护身符按钮 ----------
ui_art.js:2:// ui_art.js — UI2 手绘框架的少量 DOM 接入（只替换 emoji / 给炼金匣配方加工匠图标；不改玩法文件）
ui_art.js:3:// 商店「药水/卷轴」行的 🧪💜📜 → assets/ui2/pot_*.webp；炼金匣配方行 → artCraft() 工匠图标（art_map.js）
ui_art.js:11:  if(tt&&tt.textContent.includes('炼金匣'))m.querySelectorAll('.row').forEach(r=>{if(r.dataset.ua)return;const b=r.querySelector('button[onclick]'),sp=r.firstElementChild;if(!b||!sp||sp===b)return;
data.js:17:const QN=['低劣','普通','超强','魔法','稀有','暗金','套装','合成','符文之语'];
data.js:39: {id:'sr',t:0,n:'冥仆抗性',r:24,col:0,pre:['gm'],kind:'passive',ic:'🛡'},
data.js:66:// ===== 怪物（mechanics: hp/dmg 为 mlvl1 基准，ranged 远程，undead 亡灵，res 抗性%）=====
data.js:127:// ===== 基础类型：tier 0普通 1扩展 2精英；cat 用于符文之语底材 =====
data.js:199: fres:'火焰抗性 +{v}%',cres:'冰冷抗性 +{v}%',lres:'闪电抗性 +{v}%',pres:'毒素抗性 +{v}%',allres:'所有抗性 +{v}%',
data.js:200: allsk:'+{v} 所有技能等级',t0sk:'+{v} 冥仆系技能',t1sk:'+{v} 骨毒系技能',t2sk:'+{v} 咒怨系技能',sockp:'凹槽 ({v})',
data.js:202: regen:'生命回复 +{v}/秒',mpk:'+{v} 法力/每次击杀',undead:'+{v}% 对亡灵伤害',firemin:'+{v} 火焰伤害',coldmin:'+{v} 冰冷伤害',lightmax:'+1-{v} 闪电伤害',poisdmg:'+{v} 毒素伤害(3秒)',
data.js:206:for(const s of SKILLS)MODT['sk_'+s.id]='+{v} '+s.n+'（亡灵术士专属）';
data.js:209:// ===== 暗金 =====
dmgstats.js:2:// 归属：技能施放期间的英雄伤害→该技能；heroAct 内非施法→普通攻击；召唤物→召唤它的技能；佣兵→佣兵；
data_items.js:3:// data_items.js — 装备 / 掉落 / 符文 / 合成 数据（覆盖 data.js 中同名表，原地修改以保持 const 引用）
data_items.js:5:// treasureclassex/runes/gems/cubemain）。所有物品/词缀/套装/符文名称均为本作原创。
data_items.js:10:// gs = 原版 gemsockets；TCAP = 物品类型凹槽上限 [ilvl1-25, 26-40, 41+]；sock 由两者取小
data_items.js:12:const NECRO_BLOCK=20; // 原版职业格挡加成（亡灵术士 20），盾/缩颅的 block 字段已含此值
data_items.js:29: // 缩颅（亡灵术士专属副手）
data_items.js:49: // 手套 / 腰带 / 鞋（无凹槽）
data_items.js:96: // 凹槽
data_items.js:105: // 对亡灵 / 毒伤
data_items.js:110: AF('力量之',1,1,'str','amul,belt',{str:[1,2]}),AF('威能之',10,8,'str','amul,belt',{str:[3,5]}),AF('公牛之',26,19,'str','amul,belt',{str:[6,9]}),AF('巨人之',42,34,'str','amul,belt',{str:[10,15]}),AF('泰坦之',58,50,'str','amul,belt',{str:[16,20]}),
data_items.js:161:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：GOODT/JEWEL_SCALE/RUNE_FALL/COUNTESS_RTC、宝石数值、NEW_RUNES/RUNE_UP、符文之语 NEW_RW
data_items.js:163:// ---------- 暗金（lv=物品等级门槛 qlvl，rq=需求等级；蓝本为原版对应物品，重新命名并小幅改造） ----------
data_items.js:265:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：合成配方 CRAFTS、底材加孔 SOCKET_RECIPES
data_items.js:270: maxfres:'+{v}% 最大火焰抗性',maxcres:'+{v}% 最大冰冷抗性',maxlres:'+{v}% 最大闪电抗性',maxpres:'+{v}% 最大毒素抗性',ds:'{v}% 致命一击',blind:'{v}% 击中致盲',cb:'{v}% 压碎性打击',
data_acts.js:30:// 仅主线区域：任何终局模式（EGM：秘境/虚隙/魂狱/暗渊/隐秘等）与奶牛关不生效（CLS_XPK/CLS_HPK 共用）
data_acts.js:35:// ---------- 第一章怪物：补充噩梦/地狱抗性 ----------
data_acts.js:36:// resN/resH 未写时：噩梦 = 普通非零抗性 +15，地狱 = +30（≥100 即免疫）
data_acts.js:44:// sk: 怪物技能 charge冲撞 frost冰霜新星 nova元素新星 spark闪电弹 randel随机元素弹 poisbreath毒息 inferno烈焰喷吐 leech吸血 manaburn噬法 curse诅咒(降抗) stun重击眩晕 web缠网 revive复活同伴 heal治疗同伴 chill冰寒光环(减速)
data_acts.js:228: a2q2:{act:1,n:'合铸权杖',d:'收集 符文匣、权杖杖身、蛇首护符',rw:'开启真墓',parts:{cube:'符文匣',shaft:'权杖杖身',amulet:'蛇首护符'}},
data_acts.js:242: a5q1:{act:4,n:'围城',d:'击败 围城统领·申克',rw:'铁匠为一件物品加凹槽'},
data_acts.js:244: a5q3:{act:4,n:'冰牢',d:'击败冻河的 冰封典狱·弗洛斯，救出巫女',rw:'永久所有抗性 +10'},
ancient.js:22:// 额外词缀：上古 +1、至臻 +2；从该部位合法词缀池抽（排除技能等级/凹槽/与已有属性重复），区间同样上移，至臻取满；记录在 it.ax={k:[lo,hi]}
bloodmoon.js:3:// 精英/头目必掉 1 件魔法以上；专属掉落「破障护符」6 种。秘境/虚隙等终局模式中不生效。
bloodmoon.js:4:// 破障护符（小护身符，背包生效，同类不叠加）：目标该伤害类型有效抗性上限 80→40（含免疫）；代价：自身同系抗性 -25（骨裂/虚空无对应抗性，改为所有抗性 -10/-15）。
bloodmoon.js:15:function wardMake(k){const W=BM.WARD[k];if(!W||!BASEM.cha_s)return null;/* 老羊传奇：D2 护身符底材已移除，破障护符待 M4「血月降临」重做 */const it=makeBase(BASEM.cha_s,Math.min(99,(S&&S.lvl)||1));it.q=5;it.name='破障护符·'+W.n;it.ward=k;it.req=1;it.m=Object.assign({},W.m);it.uid=S.uid++;return it}
bloodmoon.js:20:// charmMods 包装已删除（护身符已移除，legacy_prune）
art2_icon3.js:3:// art2_icon3.js — 美术2：终局/章节/佣兵/回收 emoji → 手绘图标 assets/icon3/<slug>.webp（计划：/workspace/emoji_plan.json）
art2_icon3.js:31:// 底部导航：只换终局/佣兵两个按钮的图标（不碰战斗/角色/技能等其他按钮）
art2_icon3.js:42:// ---------- 秘径蘑菇怪立绘（原只有 emoji 占位）----------
uber.js:52:// 每角色限 1：同 ub 的 uniq1 护身符只算第一件
uber.js:53:// charmMods 包装已删除（护身符已移除，legacy_prune）
gamble_fix.js:3:// 永不被自动回收 / 自动存仓 / 自动换装(本人与佣兵) 挪走，留在背包里由玩家在弹窗中自行决定（装备/锁定/存仓/出售）。
settings.js:11:  o.game=g?g.innerHTML.replace(/自动出售（无凹槽）/g,'自动回收').replace(/<h3>[\s\S]*?<\/h3>/,''):'';o.audio=tmp.querySelector('#audioSet')?.innerHTML.replace(/<h3>[\s\S]*?<\/h3>/,'')||'';
bossloot.js:2:// BOSS_LOOT[key]=[普通档, 噩梦档, 地狱档] 各 1 件现有暗金（按底材等级分档，确定性分配、互不重复）。
bossloot.js:3:// 首领掉出暗金时，专属暗金权重 ×4（只替换暗金，不改暗金总量 → 不影响通关时长）。
bossloot.js:6: EXTRA:{rift_guard:()=>typeof EG_RIFT!=='undefined'?EG_RIFT.guard:'虚隙守望者',mj_lord:()=>typeof EG_MJ!=='undefined'?EG_MJ.boss:'秘境之主'}};
lock.js:4:// 锁定物品：不可出售/一键出售/自动回收；不会被炼金匣等配方当材料消耗；不能作为重铸/拆除/升级/改造/提取等破坏性操作的目标；
lock.js:5:// 不被自动换装（角色/佣兵）替换。全部为运行时包装，不改他人源文件。
bagkeep.js:3:// 背包顺序会被很多路径改动：拾取 push 到末尾、自动换装/佣兵换装换下件 push 到末尾、items2/gamble_fix/lock 在 autoTick/回收/出售期间把
bagkeep.js:4:// 双手/护身符/珠宝/赌博/锁定物品临时移出再 push 回末尾、回收 S.bag=keep.concat(mats) 等。逐个修补不可靠，改为「整理状态」：
cq/sysapi_cq.js:39:// v2 → v3：保留已有英雄；旧佣兵按职业转换，装备溢出退回背包/仓库。
cq/cq_battle_test.js:129: ok(/\['bag','背包'\],\['shop','商店'\],\['merc','英雄'\]\]/.test(bm)&&!/\['merc','佣兵'\]/.test(bm),'背包/商店在角色页子页签可达，英雄入口恢复');}
cq/cq_battle_test.js:164: const T2=JSON.parse(G('JSON.stringify(cqPg._t.TOPT)'));ok(['hero','bag','shop','skill','eg','map'].every(k=>T2[k])&&!T2.fight,'顶栏在 角色(含背包/商店/佣兵)/技能/福利/地图 显示，战斗页不显示（战斗页有自己的金属顶栏）');
cq/cq_battle_test.js:195:// ---------- 英雄战斗（M2：走位 / 开启技能 AI / 合击怒气 / 受伤阵亡复活 / 无佣兵） ----------
cq/cq_battle_test.js:218: G(`ALLY.push({kind:'merc',uid:991,hp:50,max:50});S.merc=S.merc||{t:'archer',lvl:1,eq:{}};CQSys.heroMigrate();step(.1)`);ok(G("ALLY.every(a=>a.kind!=='merc')")&&G('typeof mercTick')==='undefined','旧佣兵不再参战');}
cq/data_cq2.js:1:// cq/data_cq2.js — 老羊传奇 M2：第 2 章「比奇」、第 3 章「矿区」数据（方案 §3）。替换 ACTS[1]/ACTS[2]（原暗夜第二、三章）。
cq/data_cq2.js:2:// 怪物 key 统一 cq 前缀，避免与暗夜 MONS（skel/yeti 等）冲突。首领真实时间刷新周期见 cq/m2_cq.js 的 CQ_BOSSRT。
cq/ui_cq.js:2:// 去掉：符文图鉴/符文之语页签、回收设置里的符文行、缩颅/法球等 D2 部位选项。
cq/ui_cq.js:5:const BAD_BTN=/^(符文图鉴|炼金匣|符文|宝石|符文宝石|高阶符文|符文之语|缩颅|法球)(\s|$|（|\()/;
cq/ui_cq.js:6:const BAD_ROW=/^(符文[：:]|符文之语|高阶符文|缩颅|法球)/;
cq/stash_cq.js:7:// 旧存档（暗夜结构 20 页）：把物品压缩进前 N 页；装不下则保留所需页数（只增不删，绝不丢物品）。ACCT.sv 记录账号层版本。
cls_ds.js:6:// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（灵魂火符 150%+18 → 245%+1202、施毒 3→4 目标、5 秒冷却）。
cq/battle_mount.js:3:// 暗夜自有战斗画面（#mgrid/#arow/#fx + art2_atmo/char）不再作为主战场。
cq/battle_mount.js:16:   * 从暗夜 calc() 结果映射到传奇战斗属性（M1 由 cq_bridge 填充）。
cq/battle_mount.js:80:// 暗夜旧页签（背包/商店/佣兵/终局）不再出现在底栏：背包/商店/佣兵并入「角色」页顶部子页签；「福利」= 原终局页（悬赏/功业/事件/设置…）。
cq/battle_mount.js:85:// 英雄页沿用旧佣兵子页签键，存档与界面名称均为英雄。
eg_ach.js:4:function egUname(it){return String(it.name).replace(/^亡灵术士的/,'')}
eg_ach.js:16:function egTitles(){const e=EG(),t=EG_ACH.filter(a=>a[5]&&e.ach[a[0]]).map(a=>a[5]);if(e.ach._t)t.push(...Object.keys(e.ach._t).filter(t=>! /暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|亡灵|necromancer/i.test(t)));return t}
classes.js:30:// 属性自动成长：S.at = 初始 + floor(每级成长 × (L-1))（升级不给属性点）
classes.js:131:function clsResK(s,ms){const el=s.el||(CLS_MELEE.has(s.ty)?(SV(s.id,slvl(s.id)).el||'phys'):null);if(!el||!ms.length)return 1;let a=0;for(const m of ms)a+=Math.max(0,1-resOf(m,el)/100);return a/ms.length}// 估值计入目标抗性：免疫时改用其他元素/魔法技能
classes.js:158:// 旧存档清理（一次）：不属于本职业的已学技能（例如旧版战士自动学到的召唤/骨系技能）退还技能点；空技能的角色补本职业初始技能
classes.js:159:// 旧存档清理（一次）：已删除模块（late_mods 魔改技能 x*_ 等）残留的技能 id，不在 SKM 中的退还技能点
classes.js:163: if(back){S.kp=(S.kp||0)+back;if(S.main&&!SKM[S.main])S.main=null;if(typeof log==='function')try{log(`<b style="color:#ffd76a">技能整理：移除已下线技能，退还技能点 ${back}</b>`)}catch(e){}}}
classes.js:167: S.kp=(S.kp||0)+back;S.main=null;S.curse=null;if(gone.length&&typeof log==='function')try{log(`<b style="color:#ffd76a">职业技能整理：移除非本职业技能 ${gone.join('、')}，退还技能点 ${back}</b>`)}catch(e){}}
classes.js:193:// 技能学习 / 升级（沿用原版「传奇之旅」skill.txt）：升级不再给技能点，技能只能用技能书学习、升级
classes.js:219:// 学习/升级按原版（职业相符、等级够、熟练度够、书够），不用技能点
sw.js:2:/* 缓存名前缀 cq-，与暗夜 anye- 隔离；同域部署互不删缓存 */
cq_bridge.js:2:// cq_bridge.js — 老羊传奇战斗胶水（M1）：把传奇卡片战场（cq/*）接到暗夜框架的真实数据上。
mdiff.js:5:// 高级物品掉率：每次掉落额外按（倍率-1）次重掷掉落表，只保留稀有及以上（稀有/暗金/套装/传说）；额外重掷产生的金币和药水退回，不白送。
prune_mig.js:2:// prune_mig.js — legacy_prune 批次2：符文 / 宝石 / 护身符 / 珠宝 / 炼金匣 已删除后的旧存档清理（每次载入都跑，幂等）
prune_mig.js:5://    符文(k:'rune') 宝石(k:'gem') 护身符(cha_s/m/l) 珠宝(jew) 整件移除，按旧卖价折金币：符文 50×(号+1)，宝石 20×(级+1)，护身符/珠宝 200
prune_mig.js:6://  · 装备上已镶嵌的符文/宝石/珠宝：拆掉销毁并同样折金币，凹槽清零（it.sock=0, it.soc=[]）
prune_mig.js:7://  · 符文之语：保留物品本体、去掉符文之语（删 it.rw / it.rwm，白/灰底材名字恢复底材名）
prune_mig.js:13:// 清理一件留下的装备：拆镶嵌物、去符文之语；返回折算金币
prune_mig.js:26: g+=sh;if(g>0){S.gold=(S.gold||0)+g;S.cqPruneG=(S.cqPruneG||0)+g;try{if(typeof log==='function')log('旧版符文/宝石/护身符已移除，折合 '+g+' 金币')}catch(e){}
compare.js:5:// 复用原有详情面板（威能/凹槽/锁定等其他模块的包装都照常生效）。加载于所有 showItem 包装之后。
cq/sys_cq.js:4:// 1) 品质：不再产出 破旧/超强/合成/符文之语；底材自带属性 bm（传奇白字）写入 it.m；无凹槽
cq/sys_cq.js:5:// 2) 符文/宝石掉落 → 黑铁矿；熔炼匣（炼金匣）入口关闭
cq/sys_cq.js:8:// 5) 存档版本 S.sv / ACCT.sv 与迁移 cqMigrate（只处理本作 cq_ 存档，绝不读取暗夜 anye_ 数据）
cq/sys_cq.js:28:// ---------- 黑铁矿（原符文/宝石掉落位） ----------
cq/sys_cq.js:38:// v0（暗夜结构 fork 后首次）→ v1：去掉符文/宝石/凹槽/符文之语；D2 底材物品折算金币；补强化字段
cq/sys_cq.js:51: // v5（自动成长）：属性改为按等级推导；剩余属性点/技能点、洗点药水折金币；技能等级 20 → 9 按比例映射（职业侧 clsSk9：ceil(1+(旧-1)×8/19)）
cq/sys_cq.js:70:// ---------- 自动成长（docs/auto_growth_plan.md，照原版传奇之旅：升级不给属性点/技能点） ----------
cq/sys_cq.js:74:// 旧点数折金币：属性点 100×(1+等级/10)、技能点 500×(1+等级/10)（每点）
cq/mir2_b6.js:17:// 同名、同底材、同品质；绑定/锁定、套装/暗金、上古装备不作为融合原料。
cq/m2_cq.js:100:// 任务奖励「技能书 ×n」（替代旧技能点）：本职业、未满级、需求等级 ≤ 当前等级的书里，优先已学会的（升级用）
offpeek.js:6:// 已接入：离线收益 offline、深渊虚隙结果 egRiftResult、秘境结果 egMjResult、悬赏宝箱 egOpenCache。
offpeek.js:7:// （虚隙/秘境自动连打不弹结果窗，无倒计时需暂停；掉落记录 dlog.js 本就可点。）
items.js:3:// items.js — 装备生成 / 掉落 TC / 镶嵌 / 炼金匣 / 储物箱（覆盖 game.js 中的同名函数）
items.js:44:  q=4;it.dur3=1} // 原版：暗金失败 → 稀有（3 倍耐久）
items.js:57:function finishDefense(it,b){/* 暗金/套装的 def 区间作为本地加成；防御基础值已在 makeBase 生成 */return it}
items.js:61:// socketMods：宝石/符文/符文之语已删除（legacy_prune 批次2），沿用 game.js 的空实现
items.js:67:// 掉落「好东西」：只出戒指/护符（符文/宝石已删除；cq/sys_cq.js 会再覆盖为首饰/黑铁矿）
items.js:113:// 镶嵌 / 炼金匣 / 合成已删除（legacy_prune 批次2）
items.js:120:// 法系流派套装/暗金（亡灵 3 流派 + cls_build 中 role:'caster' 的流派）：力量/敏捷需求再封顶 30。
data_items2.js:3:// data_items2.js — 装备扩充（第四阶段）：弓/弩/长柄/矛/标枪/投掷/斧/锤/法杖底材、珠宝、护身符、
data_items2.js:4:// 追加暗金/套装/符文之语、升级配方。全部原创命名；机制与量级参照原版 1.13。必须在 data_items.js 之后加载。
data_items2.js:37: W2('stfx1','staff','乔木杖',30,1,[6,21],25,0,2),W2('stfx2','staff','四分杖',35,1,[8,26],25,0,3),W2('stfx3','staff','雪松杖',38,1,[11,32],25,0,4),W2('stfx4','staff','符文杖',47,1,[24,58],25,0,6),
data_items2.js:41:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：珠宝/护身符 RARE_B、AF2 前后缀
data_items2.js:42:// 珠宝/护身符后缀的显示名：与其它后缀统一为「XX之」放在名字最前（内部 n 不变，旧存档的词缀引用不受影响）
data_items2.js:72: U2('暗夜之衣','arme2',82,73,{allsk:2,fcr:20,manapct:15,edef:[150,200],mdr:15}),U2('不灭之铠','arme3',88,80,{dr:[15,20],life:[100,150],allres:[30,40],edef:[180,220],drp:5}),
data_items2.js:140:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：符文之语 NEW_RW2、升级/修复配方
data_items2.js:144:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：SOCKET_RECIPES 扩充、符文之语 NEW_RW3/NEW_RW4
dlog.js:4:// 亮眼掉落：暗金/套装/符文之语/20号及以上符文/可做 3 孔以上符文之语的白色·精良空孔底材。
dlog.js:11: return false}// 符文之语已删除
dlog.js:12:// q码：u暗金 s套装 w符文之语 r符文 b底材
dlog.js:27:function displayName(value){return /暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer/i.test(String(value))?'旧版装备':value}
sort.js:4:// 排序：品质高到低（暗金/符文之语→套装→合成→稀有→魔法→已开孔白装→超强→普通→低劣；非装备最后）→ 类型（武器→头盔→铠甲→盾牌→手套→鞋子→腰带→戒指→项链→护身符→珠宝 → 宝石 → 符文 → 材料 → 其他）→ 等级高到低（符文按等级）→ 名称
art_map.js:15:// 首饰类无档次：按品质取色（普通/魔法+/暗金及以上）
game.js:28:function socketMods(it){return{}}// 宝石/符文/符文之语已删除（legacy_prune 批次2），凹槽不再提供属性
loot.js:69:// 炼金匣「精华重铸」已删除（legacy_prune 批次2）
late.js:3:// 主属性：超出职业初始值的部分每 X 点 → 所有技能、攻击、召唤物伤害 +1%（雇佣兵不算）
late.js:32:// 伤害：英雄与召唤物（非雇佣兵）的所有命中
late.js:33:// 亡灵召唤物（骨仆/骨巫/复生/魔像等，不含雇佣兵）地狱段额外系数：55 级前 =1（普通/噩梦不变），地狱 2–3 秒击杀普通怪
late.js:43:// 详情显示：伤害没有走协同系数的技能（如亡灵召唤物），把伤害区间按倍率换算后替换到文字里
stashux.js:2:// stashux.js — 个人/共享仓库：显眼「⇅ 自动整理」按钮（同背包样式）+「炼金匣」（仓库物品可作材料）
stashux.js:4:// 炼金匣：打开时把当前仓库物品临时并入背包供配方识别/消耗，每次配方或界面刷新后立即放回原页；产物留在背包，背包满则放回当前仓库。
stashux.js:7:// 仓库内炼金匣（stashCube/STCUBE）已删除（legacy_prune 批次2）
art_icons3.js:2:// art_icons3.js — 美术：16 个轻型底材专属图标（assets/icon2/light/<id>.webp）+ 17 个新威能图标（assets/icon2/pw/<id>.webp），tools/art/gen_pw_lt_icons.py
art_icons3.js:3:// 底材：写 ICON2[base id]（icon2Url 按 ICON2[it.b] 优先查）。威能：带 it.lp 且有图、且没有按名字专属图标的物品才显示威能图标（包装 icon2Url + 最外层 itemIcon）
art_icons3.js:4:// 保留原图标：nec/cls 按名映射命中；或暗金/套装(q 5/6)且原链路给出的不是通用底材图（ICON2[b]/ICON2[cat_tier]）
art_icons3.js:5:// 熔炼匣槽位 / 威能图鉴行原本无图标位置，不新增 DOM。须在 light_bases.js、art_nec_icons.js、art_cls_icons.js 之后加载
cls_fs.js:5:// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（雷电 150%→285%、冰咆哮 240%+173 → 330%+1333、5→6 目标）。
cq/data_cq.js:4:// 原地替换暗夜 D2 数据表：部位名、品质名、底材 BASES/BASEM、词缀 PREFIX/SUFFIX、极品 UNIQUES、套装 SETS/SETITEMS、
cq/data_cq.js:9:// ---------- 部位：内部键沿用暗夜（避免改装备/对比/仓库逻辑），显示名换成传奇 10 部位 ----------
cq/data_cq.js:12:// ---------- 品质：0/2/7/8 不再产出（破旧/超强/合成/符文之语），保留下标以兼容旧逻辑 ----------
cq/data_cq.js:106: def:'防御 +{v}',ar:'准确 +{v}',dex:'敏捷 +{v}',life:'生命 +{v}',mana:'魔法值 +{v}',ias:'攻速 +{v}%',ll:'吸血 {v}%',mf:'寻宝 +{v}%',gf:'金币 +{v}%',
cq/data_cq.js:108:// ---------- 极品（暗金位）：第 1 章 + 特戒；boss 字段 = 该首领专属（bossloot.js 优先使用，方案 §5.3 每首领 2–4 件） ----------
cq/data_cq.js:129:// ---------- 符文 / 符文之语 / 宝石：数据层清空（M1 已定不做；旧存档中的符文由迁移折算，见 cq/sys_cq.js） ----------
cls_zs.js:5:// 技能书最高 9 级，不分配技能点；需求等级按 1.76 学习顺序压缩到 M1 第一章（1–16 级）。
cls_zs.js:11:// 基本剑术附带吸血（1.76 无单独吸血技能，并入剑术被动）：[1 级, 上限] %
cq/mir2_maps.js:120:  "n": "暗黑战士",
stash.js:6:// 堆叠：宝石(同色同级)/符文(同号) 在数组中仍是独立对象（所有旧消耗逻辑天然“一次扣 1”），显示与占格按组合并；
stash.js:20: for(const c of ACCT.chars)if(c&&c.mode==='season')c.mode='normal';// 纪元已删除：账号角色列表里的纪元标记转普通
stash.js:40: S.name=S.name||c.name;S.cid=c.id;S.cls=S.cls||c.cid||'zs';S.mode=S.mode||c.mode||'normal';if(S.mode==='season'){S.mode='normal';S.cqSeasonOld=1}if(c.mode==='season')c.mode='normal';/* 纪元已删除（legacy_prune C5）：旧纪元角色转普通，S.eg.season 原样保留不生效 */if(!S.ci&&typeof clsInit==='function')clsInit();if(!S.ast)S.ast={on:0,dest:'p',t:{gem:1,rune:1,mat:1,jewel:0,charm:0,unique:0,set:0,rare:0,sock:0}}}
stash.js:111:const AST_T={mat:'材料',unique:'极品',set:'套装',rare:'稀有'};// 宝石/符文/珠宝/护身符/凹槽底材 已删除（legacy_prune 批次2）
shop.js:28:const ESS_EX=[];// 精华兑换的宝石/护身符/符文已删除（legacy_prune 批次2）
```

VERDICT: APPROVE
