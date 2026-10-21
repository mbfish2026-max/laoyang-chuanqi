# 旧模块清理审计（PHASE 1，只审计不删除）

依据：`/workspace/design/chuanqi_v2_plan.md`（下称「方案」），`docs/deps_graph.md`（M0 剥离记录），已拍板设计稿 `design/chuanqi_v2_live`（p5/p6/p8）。
审计对象：master `c09767a`。行数/字节数取自工作区当前文件。
标记：**[cq]** 表示涉及 cq/ 目录或 cq_bridge.js（战斗开发）；**[职业]** 表示涉及 classes.js / cls_*.js / skills.js（职业开发）。

> **重要结论**：方案 §2.1 并不是要删掉终局模块。cowlevel、bloodmoon、uber、eg_rift、eg_mj、eg_para、eg_season 都写的是「**改皮**」（秘境→幽冥圣域、奶牛关→暗之地图、巅峰→转生）。ancient、tianguang、bossloot 写的是「**直接复用**」。所以用户举例里的 远古(上古)/天光/uber/血月/虚隙/秘境/纪元，方案都**不同意直接删**，下面归入 A（保留）或 C（待定），不放进 B。

## 福利页「更多」入口现状
`cq/pages_cq.js` 里，福利页签有 签到 / 离线收益 / 悬赏 / 功业 / 事件 / 更多。「更多」打开的是原暗夜终局页 `renderEG`，里面有这些 `egPage`：
- 虚隙（eg_rift），子页 秘境（eg_mj）、暗渊（uber）
- 魂阶（eg_para）
- 威能（eg_power）
- 秘径（eg_secret）
- 纪元（eg_season）

悬赏、功业、事件也在 EG_PAGES 里，但福利页把它们单独做成了页签。

---------------------------------------------------------------------
## A) KEEP 保留（方案已移植或明确复用）

| 模块 | 文件（行/字节） | index 引用 | 方案出处 |
|---|---|---|---|
| 核心 | game.js 512/67K, items.js 194/23K, items2.js 114/14K*, loot.js 84/12K, shop.js 50/8.6K, acts.js 240/28K, data.js, data_items*.js, data_acts.js | script | §2.1「直接复用 / 重写数据」 |
| 背包仓库 | stash.js 153/22K, stashux, stash_equip, bagux(.css), bagkeep, sort(.css), lock(.css), salvage(.css), compare, cmp2, bagwrap.css, items.css, stash.css | script+css | §2.1、§5.8 |
| 刷宝 | ancient.js 52/5.6K(+css), reforge.js 59/10K(+css), tianguang.js 24/3.6K(+css), bossloot.js 43/5.8K(+css), dmgstats(+css), auto_status, offpeek | script+css | §2.1「直接复用」、§5.2/5.3/5.7 |
| 云与设置 | cloud.js, login_flow.js, applock(.css), settings.js, audio.js, audio_cq.js, sw.js, power.js(.css) | script | §2.1、§2.4/2.5 |
| 召唤框架 | merc.js 250/37K(+css), summon_keep.js 10/1.7K | script | §2.1「改造为召唤物框架」、§4.3 |
| 美术挂载 | art_map.js, art.css, icon2.js, art2_icon_entries.js, art2_map.js, art2_icon3.js(.css), ui_art.js, art_icons3.js | script+css | §2.1「保留挂载机制」 |
| 新职业 **[职业]** | classes.js 218/28K（已缩为战/法/道引擎）, cls_zs/fs/ds.js, skills.js 130/15K（自动施法/技能栏，cq/pages_cq、cq_bridge 在用） | script | §2.1、§4（原 D2 职业已在 M0 删除） |
| cq 系统层 **[cq]** | cq/*.js（sys/enhance/stash/ui/sysapi/hud/m2/bal_fix/fuli/balance/cap/data_cq*）、cq_bridge.js、cq/battle_mount.*、cq/cq_scene/fx/move/hero（动态加载） | script | §2.2 |
| 福利页 | eg_core.js 75/7.9K（页面框架）, eg_bounty.js 48/7.7K（悬赏）, eg_ach.js 31/5.1K（功业）, eg_events.js 45/6.5K（事件）, data_endgame.js 中 EG_BOUNTY/EG_ACH/EG_CODEX/EG_AFF/EG_WB | script | 已拍板设计稿 p8_fuli（签到/离线/悬赏/功业/事件） |
| 隐藏图 | eg_secret.js 29/3.8K（秘径，改皮为 传奇部落/一线天 等） | script | §3「隐藏图，随机开启，同暗夜 eg_secret」 |
| 洗点 | respec.js 33/4.7K | script | 设计稿 p6 有「洗点」按钮 |
| 神秘商店 | gamble_fix.js 13/1.5K | script | §3/§8「神秘商店（赌博）」 |
| 杂项基础 | dlog.js（掉落记录）, ui_hold.js（render 最外层）, bonus.js(.css)（角色页「详细·加成汇总」）, group.css/endgame.css/style.css/acts.css/skills.css/shop.css/merc.css | script+css | 基础设施，角色页「详细」在用 |

\* items2.js 里有护身符/珠宝/炼金匣等 D2 函数（genJC、cubeUpgrade 等），被 sys_cq、lock、ui_art、bonus、stash_equip、merc、bloodmoon、uber 引用，见 C-8。

---------------------------------------------------------------------
## B) DELETE 删除（方案明确不带，或 M0 已从 index 移除但文件还留着）

| # | 项 | 文件（行/字节） | index 引用 | 页面入口 | 数据 | 存档字段 | 测试 | 涉及 [cq]/[职业] | 依赖：删了会坏什么 |
|---|---|---|---|---|---|---|---|---|---|
| B1 | **D2 传说威能 / 威能熔炼匣** | eg_power.js 68/8.5K | `eg_power.js` script | 福利「更多」→威能 | data_endgame.js EG_LP/EG_LPC/EG_LEG | `S.eg.lp`（arch/lp 物品字段 `it.lp`） | 无 | 否 | bonus.js 用 `EG_LPS`；eg_events.js、eg_secret.js 调 `egLpApply`；lock.js、ui_art.js 调 `egLpExtract`。这 5 处要先加 `typeof` 保护或删掉调用。方案没有威能（§7.2 神兵器魂是另一套） |
| B2 | 魔改技能（6 个 D2 职业 60/75 级） | late_mods.js 37/4.8K | script | 技能页（注册进 clsDef） | 内置 | 无 | tests/cq_late_test.js 部分断言 | 有，**[职业]**：通过 clsDef 注册技能，要职业开发确认 | 只用 late.js 的 `latePct`。删了要改 cq_late_test。方案 §4 只做 1.76 技能 |
| B3 | 技能次数词缀 mcast | multicast.js 31/3.8K | script | 无（物品词缀） | 词缀 mcast | 物品 `it.m.mcast`（无害，可忽略） | 无 | 有，**[职业]**：包装 skills.js `acCast`/`acFeasible` | 没有文件引用它。方案 §5.6 词缀表里没有 |
| B4 | D2 召唤物生存成长 | summon_surv.js 20/2.5K | script | 无 | 无 | 无 | 无 | 否（只用 late.js 的 latePct） | 没有文件引用它。对象是 亡灵/德鲁伊/射手 召唤物，现在三职业用的是 m2_cq 召唤框架。方案说「改造 summon_surv」，但内容都是 D2 单位，建议删掉重写 |
| B5 | 弱势流派打首领补偿（D2 流派） | uber_bal.js 23/3.4K | script | 无 | 无 | 无 | 无 | 否 | 没有文件引用它，只用 uber.js 的 `ubHitHero`、eg_mj 的 `egMjBoss`。内容是 召唤死灵/锤子圣骑/风德 等 D2 流派 |
| B6 | M0 已出 index 的遗留文件 | art_cls_icons.js 2.6K、build_manual.js、clsfilter.js + clsfilter.css | **不在 index** | 无 | — | 无 | 无 | 否 | art_icons3.js 引用 `artClsIconUrl`（typeof 保护，要确认）；clsfilter 引用 EG_LP。deps_graph D 批次已经去掉它们的 index 引用 |
| B7 | D2 第 4/5 章地图数据 | data_acts.js 中 ACTS[3]「炎狱之门」5 区、ACTS[4]「霜峰之巅」19 区（D2 地名） | — | 地图页第 4/5 章 | ACTS[3..4]、相关 QUESTS/BOSSES/MONS | `S.act≥3`、`S.cleared`、`S.q` 里第 4/5 章任务键、`S.actU` | 依赖第 5 章的终局测试（uber_test、mj_test） | 否，但 **[cq]** 战斗页读 ACTS 渲染地图 | **不能单独删**：cowlevel 挂在 ACTS[4].zones.cow；uber 解锁条件是「地狱第五章通关」；eg_season、秘境、首领掉落都按 5 章设计。方案 §3/§2.1 要求改成 第 4 章 沃玛、第 5 章 祖玛（M3），所以建议是「M3 用传奇数据整体替换」，不是删掉留空。存档迁移：已在第 4/5 章的角色要退回第 3 章末区域 |

B 组合计约 205 行代码、约 27KB（不含 B7 数据）。

---------------------------------------------------------------------
## C) UNSURE 待用户确认（方案写「改皮」或没写清楚；先不删）

| # | 项 | 文件（行/字节） | 页面入口 | 存档字段 | 测试 | 方案态度 / 疑点 | 涉及 |
|---|---|---|---|---|---|---|---|
| C1 | 虚隙 / 深渊虚隙（D2 钥石裂隙） | eg_rift.js 70/10K + data_endgame EG_RIFT | 「更多」→虚隙 | `S.eg.rift`、localStorage `cq_eg_rank` | 无 | §2.1 写 eg_rift **改皮**；§6.2 只提「幽冥圣域」对应秘境 eg_mj。eg_mj/eg_secret/offpeek/bossloot 都依赖它的框架（egRiftPool/egRiftNorm/egRiftGuard）。**建议**：保留框架，去掉「虚隙」玩法入口；或者问用户虚隙要不要 | 否 |
| C2 | 秘境 → 幽冥圣域 | eg_mj.js 94/12.6K | 「更多」→虚隙→秘境 | `S.eg.mj` | tests/mj_test.js | §6.2 **改皮保留**（M5）。当前是暗夜文案和怪池 | 否 |
| C3 | 暗渊三魂 → 暗之地图/暗之魔龙教主 | uber.js 124/18K(+uber.css) | 「更多」→虚隙→暗渊 | `S.eg.uber`、`S.eldron` | tests/uber_test.js | §6.2/§6.4 **改皮保留**（M5）；解锁条件依赖 D2 第 5 章（B7） | 否 |
| C4 | 魂阶 → 转生 | eg_para.js 31/4.5K | 「更多」→魂阶 | `S.eg.para` | 无 | §2.1/§6.3「巅峰→转生」改皮；现在 CQ_BAL 已有 `rebirthMax`/`S.reb`，但没有转生实现。保留改皮还是删掉另写 | 否 |
| C5 | 纪元（赛季） | eg_season.js 35/5.1K | 「更多」→纪元；新建角色「赛季」模式 | `S.eg.season`、`S.mode='season'`、`ACCT.chars[].mode` | 无 | §2.1 列在改皮行，但 §6 没有对应玩法，单机也不需要赛季。**倾向删**，但删了要迁移 S.mode=season 的角色。eg_rift 读 `EG().season` | 否 |
| C6 | 血月之地 + 破障护符 | bloodmoon.js 29/5.1K(+css) | 地图页血月标记 | `S.bm` | tests/bloodmoon_test.js | §7.4 要「血月降临」异变（掉率×2、怪伤+30%、滤镜），现有实现规则不同；「破障护符」是 D2 护身符，方案没有。**建议**保留并改造成 §7.4，去掉护符部分 | 是 **[cq]**：audio_cq.js 用 `bmHere`；滤镜要战斗页实现 |
| C7 | 奶牛关 → 暗之地图 | cowlevel.js 41/4.8K | 地图页第 5 章终章入口 | `S.cowN`、`S.cowPrev`、`S.dz` | 无 | §2.1 改皮；挂在 D2 ACTS[4]（B7）。data_acts.js 调 `inCow` | 否 |
| C8 | 符文/符文之语/护身符/珠宝/炼金匣数据和函数 | data_items.js 中 RUNES/RUNEWORDS、items2.js（charm/jewel/cube 函数）、data_items2.js 护身符词缀 | 已关闭入口（sys_cq） | 物品 `it.k='rune'/'gem'` 已迁移为黑铁矿 | items_test | 方案 Q4 还没定；deps_graph 记「RUNES 数据暂留，M1 再清」。被 lock/ui_art/bonus/stash_equip/merc/bloodmoon/uber 引用 | 是 **[cq]**：sys_cq.js 覆盖了 genJC/rollRune |
| C9 | 怪物难度 1–9 | mdiff.js 19/2.7K | 角色页「详细·设置」 | `S.md` | 无 | 方案没写（只有 普通/噩梦/地狱） | 否 |
| C10 | 免疫保底 | immfloor.js 9/1K | 无 | 无 | 无 | 传奇没有元素免疫；data_acts 里还有 D2 免疫怪的话才需要 | 否 |
| C11 | 旧战斗视图辅助 | group.js 21/2.6K(+group.css)、focus.js 18/2.1K(+focus.css) | 旧 #fbattle 卡片 | 无 | 无 | 战斗已换成 #cqStage，这两个可能已经不起作用；要 战斗开发 确认 cq_scene 有没有用到 | 是 **[cq]** |
| C12 | 后期伤害方案 | late.js 61/7.9K | 无 | 无 | cq_balance_test、cq_late_test | classes.js 用 lateMul/LATE_SHARE/LATE_MAIN；内容是 D2 职业系数和主属性加伤。**不能单独删** | 是 **[职业]** |
| C13 | 开发脚本 | shot.py、shot_eg.py、shot_eq4.py、shot_p3.py、shot_stash.py、sim.py（不在 index） | 无 | 无 | — | sim.py 在方案 §9 里提到；shot*.py 是暗夜截图脚本 | 否 |
| C14 | 佣兵页（D2 佣兵 4 系） | merc.js 里的佣兵 UI 和装备（角色页子页签「佣兵」） | 角色页「佣兵」 | `S.merc` | merc_late_sim | 方案是改造为召唤物框架，设计稿 p5 还保留了「佣兵」页签 | 否 |

---------------------------------------------------------------------
## 执行建议（PHASE 2，等用户确认后）
1. 每删一项都要：从 index.html 去掉引用 → 删文件 → 给依赖方加 `typeof` 保护 → `node --check` → 全部 tests → pw_baseline。
2. 存档字段一律「忽略不删」：`S.eg.lp`、`S.eg.season`、`S.md` 等留在存档里也无害。只有 B7（第 4/5 章进度）和 C5（赛季角色）需要写 CQ_SV 迁移。
3. 涉及 **[职业]**（B2、B3、C12）先交给职业开发；涉及 **[cq]**（B7 地图、C6、C8、C11）先跟战斗开发确认。
