# 老羊传奇 clean-int 独立测试报告

测试日期：2026-10-26（Asia/Shanghai）。worktree `/workspace/cqx-clean-int`；产品 HEAD `4cd5e6cab177e9b9fc7de462e5d61e046c9d5f28`；基线 master `af6bfe1ac8d3100e4e19ec4c9e04e1766198c1d3`。

仅新增测试与报告；未改产品代码，未 push，未运行 tools/bump.sh、`*_sim.js` 或 auto_sim。使用 Node v20.19.2、Python 3.13 Playwright；本地 ThreadingHTTPServer，390×844，阻断非本地请求、禁用 Service Worker。WebKit 所需运行库已安装。

## 1. JS 语法：PASS

`git diff --name-only master..HEAD` 中存在的 JS 共 48 个，逐个 `node --check`，48 PASS / 0 FAIL。新增 JS 测试与 fixture 也通过 node --check。完整逐文件结果见 [原始 Node 记录](diablo_clean_node_results.json)。

## 2. 全部 tests/*_test.js

原有 56 个：49 PASS / 7 FAIL；新增保存迁移测试 1 个 PASS。最终共 57 个：50 PASS / 7 FAIL。每文件独立 Node 进程，超时 60s，ancient_test.js 为 120s；无超时。

| 文件 | 结果 | 用时（秒） | 摘要 |
|---|---|---:|---|
| `tests/ancient_test.js` | PASS | 32.9 | ancient_test: 17 pass, 0 fail |
| `tests/ancx_test.js` | PASS | 0.17 | ancx_test: 10 pass, 0 fail |
| `tests/bloodmoon_test.js` | FAIL | 0.47 | ✗ 无护符：免疫封顶 80（combat_guard.js）（immfloor 免疫保底已删除，legacy_prune C10）0；bloodmoon_test: 14 pass, 1 fail |
| `tests/bossloot_test.js` | PASS | 1.08 | bossloot_test: 21 pass, 0 fail |
| `tests/cls_book_test.js` | PASS | 0.2 | cls_book_test: 34 pass, 0 fail |
| `tests/cls_hero_budget_test.js` | PASS | 33.64 | 正常退出 |
| `tests/cls_hero_test.js` | PASS | 0.18 | cls_hero_test: 22 pass, 0 fail |
| `tests/cls_pet_test.js` | PASS | 0.48 | cls_pet_test: 6 pass, 0 fail |
| `tests/cq_attrfix_test.js` | PASS | 0.19 | cq_attrfix_test: 14 pass, 0 fail |
| `tests/cq_autobest_test.js` | PASS | 0.22 | cq_autobest_test: 9 pass, 0 fail |
| `tests/cq_autogrow_test.js` | PASS | 0.21 | cq_autogrow_test: 58 pass, 0 fail |
| `tests/cq_balance_test.js` | PASS | 0.18 | cq_balance_test: 15 pass, 0 fail |
| `tests/cq_balfix_test.js` | PASS | 0.2 | cq_balfix_test: 20 pass, 0 fail |
| `tests/cq_enh_detail_test.js` | PASS | 0.2 | cq_enh_detail_test: 11 pass, 0 fail |
| `tests/cq_enh_test.js` | PASS | 0.19 | cq_enh_test: 16 pass, 0 fail |
| `tests/cq_guard_test.js` | PASS | 0.21 | cq_guard_test: 8 pass, 0 fail |
| `tests/cq_hero_system_test.js` | PASS | 0.18 | cq_hero_system_test: 16 pass, 0 fail |
| `tests/cq_icons_test.js` | PASS | 0.2 | cq_icons_test: 150 pass, 0 fail |
| `tests/cq_late_test.js` | PASS | 0.29 | cq_late_test: 9 pass, 0 fail |
| `tests/cq_lifepct_test.js` | PASS | 0.19 | cq_lifepct_test: 4 pass, 0 fail |
| `tests/cq_m1_test.js` | FAIL | 0.6 | ✗ 祖玛旧套 4 件兼容保留；✗ 强制极品产出正确名字 300,228；cq_m1_test: 39 pass, 2 fail |
| `tests/cq_m2_test.js` | PASS | 0.31 | cq_m2_test: 49 pass, 0 fail |
| `tests/cq_migrate_test.js` | PASS | 0.18 | cq_migrate_test: 10 pass, 0 fail |
| `tests/cq_offline_test.js` | PASS | 0.21 | cq_offline_test: 12 pass, 0 fail |
| `tests/cq_prune2_test.js` | FAIL | 0.2 | ✗ 普通装备原样保留；cq_prune2_test: 57 pass, 1 fail |
| `tests/cq_prune_test.js` | PASS | 0.19 | cq_prune_test: 19 pass, 0 fail |
| `tests/cq_reforge_seed_test.js` | PASS | 1.59 | cq_reforge_seed_test: 8 pass, 0 fail |
| `tests/cq_signin_test.js` | PASS | 0.17 | cq_signin_test: 18 pass, 0 fail |
| `tests/cq_skillbar_test.js` | PASS | 0.19 | cq_skillbar_test: 28 pass, 0 fail |
| `tests/cq_spend_test.js` | PASS | 0.15 | cq_spend_test: 17 pass, 0 fail |
| `tests/cq_stash_test.js` | PASS | 0.8 | cq_stash_test: 19 pass, 0 fail |
| `tests/cq_sysapi_test.js` | PASS | 0.18 | cq_sysapi_test: 34 pass, 0 fail |
| `tests/cq_ui_test.js` | PASS | 0.19 | cq_ui_test: 16 pass, 0 fail |
| `tests/diablo_clean_migrate_test.js` | PASS | 0.37 | diablo_clean_migrate: 29 pass, 0 fail |
| `tests/diablo_meta_test.js` | PASS | 0.19 | diablo_meta_test: 20 pass, 0 fail |
| `tests/items_test.js` | FAIL | 6.94 | 异常中断（见失败清单） |
| `tests/mir2_b6_test.js` | PASS | 0.2 | mir2_b6_test: 32 pass, 0 fail |
| `tests/mir2_bal_short_test.js` | PASS | 0.19 | mir2_bal_short_test: 19 pass, 0 fail |
| `tests/mir2_cloud_test.js` | PASS | 0.18 | mir2_cloud_test: 14 pass, 0 fail |
| `tests/mir2_equipment_test.js` | FAIL | 0.22 | ✗ every effective modifier preserved；✗ identity and upgrade fields retained；✗ legacy zuma intact |
| `tests/mir2_firstdrop_test.js` | PASS | 0.35 | mir2_firstdrop_test: 15 pass, 0 fail |
| `tests/mir2_gamble_test.js` | PASS | 0.2 | mir2_gamble_test: 38 pass, 0 fail |
| `tests/mir2_integration_test.js` | PASS | 0.21 | mir2_integration_test: 10 pass, 0 fail |
| `tests/mir2_lvl_test.js` | PASS | 0.35 | mir2_lvl_test: 69 pass, 0 fail |
| `tests/mir2_maps_test.js` | PASS | 0.44 | mir2_maps_test: 250 pass, 0 fail |
| `tests/mir2_mutation_test.js` | PASS | 0.19 | mir2_mutation_test: 22 pass, 0 fail |
| `tests/mir2_sets_test.js` | FAIL | 0.19 | ✗ zuma four counted；✗ holy warrior double strike；✗ two wall layers；✗ wall cooldown follows equipment；✗ dog splash reaches two targets；✗ splash does not apply global multiplier twice；✗ dragon six direct skill damage is 1.5；✗ meteor delayed damage boosted once；✗ chiyue spell leech uses actual damage once；mir2_sets: 26 pass, 9 fail |
| `tests/mir2_skills_test.js` | PASS | 0.26 | mir2_skills_test: 189 pass, 0 fail |
| `tests/mir2_soul_test.js` | PASS | 0.17 | mir2_soul_test: 15 pass, 0 fail |
| `tests/mir2_streams_test.js` | PASS | 0.24 | mir2_streams_test: 37 pass, 0 fail |
| `tests/mir2_summon_test.js` | PASS | 0.18 | mir2_summon_test: 11 pass, 0 fail |
| `tests/mj_test.js` | PASS | 0.08 | 正常退出 |
| `tests/recycle_mir2_test.js` | PASS | 0.15 | recycle_mir2_test: 23 pass, 0 fail |
| `tests/reforge_test.js` | PASS | 0.19 | reforge_test: 12 pass, 0 fail |
| `tests/tianguang_test.js` | FAIL | 0.15 | ✗ 符文≥20 紫，稀有/宝石无光柱；tianguang_test: 8 pass, 1 fail |
| `tests/uber_test.js` | PASS | 0.2 | uber_test: 47 pass, 0 fail |
| `tests/diablo_clean_save_test.js` | PASS | <1 | diablo_clean_save: 13 pass, 0 fail |

## 3. 战斗测试：FAIL

`node cq/cq_battle_test.js`：退出 1，约 0.15 秒。旧 localStorage 键断言抛 TypeError，后续断言未执行，不能声称整份战斗测试通过。详见下表。

## 4. 旧档迁移：PASS

已有 `tests/diablo_clean_migrate_test.js` 存在并通过：29 pass / 0 fail。覆盖纯迁移、幂等、付费淬锋候选、独立旧战力基准、多个伤害入口、组合防护及法/道技能属性。

新增 `tests/diablo_clean_save_test.js`：13 pass / 0 fail；共享 fixture 位于 `tests/diablo_clean_save_fixture.js`。通过完整 `load()` 包装链载入 sv=0 旧档，包含 allres/ll/edmg/edef、q5、sock/soc/rw、秘径 staff/runs/king、S.season 与 S.eg.season，以及 cq_ 保存键。另验证 cqRead 对旧 localStorage 键的复制兼容。

- 装备 3 → 3，uid 81001/81002/81003 全部保留。
- 单件战力旧值 `[222,210,206]` → 新值 `[222,210,206]`，合计 638 → 638。
- 两件 allres=25 的旧防护基准：1000 元素伤害承受至多 500；迁移后火/冰/电/魔法/毒实测约 285–286，全部 ≤500。
- staff=3、runs=7、king=1 归档到 S.eg.history.secret；两处 season 标志保留。
- VM 检查角色 HTML 和背包装备显示名称无禁词；真实浏览器进一步检查全部要求页面 innerText。

## 失败清单（全部计入 FAIL）

| 文件 | 判断 | 现象与建议 |
|---|---|---|
| `tests/bloodmoon_test.js` | 过时断言 | 仍要求有效抗性封顶 80；当前战斗已统一防御/魔御，相关封顶包装已删除。改测防御/魔御与免卡波。 |
| `tests/cq_m1_test.js` | 过时断言 | 2 项：旧祖玛 4 件仍要求 edmg=10；强制 q5 名字必须属于旧 UNIQUES（300 件中 228 件不匹配）。改测原创套装固定属性及当前极品命名表。 |
| `tests/cq_prune2_test.js` | 过时断言 | 普通装备要求完整 JSON 字节不变；新迁移添加版本/归档字段。改为核对 uid、数量、强化、价值和有效属性。 |
| `tests/items_test.js` | 过时断言/已删 API | 调用已删除的 effMF 后 ReferenceError 中断；仍验证旧 MF 品质公式。改测当前一次品质抽取及概率。 |
| `tests/mir2_equipment_test.js` | 过时断言/已删属性 | 3 个断言失败后访问 bm.ias[0] 抛 TypeError：仍要求每个旧词缀有效、rf 为数字、祖玛 edmg 与底材 ias。改核对转换补偿、rf.n 与八种允许属性。 |
| `tests/mir2_sets_test.js` | 过时断言 | 9 项失败：祖玛 ias、双烈火、双火墙、减 CD、神兽溅射及倍率、烈焰 1.5 倍、流星增伤、赤月吸血。当前 cq/mir2_sets.js 已改为原创固定属性；更新对应效果断言，保留套装识别/保底断言。 |
| `tests/tianguang_test.js` | 过时断言 | 仍要求高阶 rune 返回 hirune 光柱；已删除符文掉落。改断言旧 rune 不产生有效光柱。 |
| `cq/cq_battle_test.js` | 过时存储键断言 | 读取 cq_battle_hero_v1 得 null 并访问 hejiCount 中断；cq/cq_hero.js 当前写 cq-battle_hero_v1 并兼容旧键读取。改读新键，并单测旧键输入兼容。 |

| `settings.js` / `cq/ui_cq.css` 设置难度控件 | 产品触控尺寸问题（严格按 44×44px 判定） | 四场景中 1–9 难度按钮均为高 44px、宽约 35.3px，共 36 次尺寸不达标。建议采用可横向滑动的单行组或两行网格，保证每个数字按钮 44×44px；按钮内文字保持单行。其他本次检查的主要按钮均达到 44×44px。 |

## 5. Chromium / WebKit 页面检查：FAIL（触控宽度）

每个浏览器分别新建独立 context 跑新档/旧档。新档使用浏览器内存角色；旧档使用与保存测试相同的 sv=0 fixture，经 GS 旧键及 load() 完成迁移。仅在测试内停主循环并开放本地登录门禁，不连接云端，不测试账号登录服务。完整页面 innerText、按钮尺寸及点击证据保存在截图目录的 `results.json`。

| 浏览器 | 档 | 页面/截图 | 禁词命中 | pageerror | 按钮文字换行 | 主要控件尺寸 | 空白关闭 |
|---|---|---:|---:|---:|---:|---|---|
| chromium | new | 11 / 11 | 0 | 0 | 0 | FAIL：9 个难度按钮宽约35.3px | PASS |
| chromium | old | 11 / 11 | 0 | 0 | 0 | FAIL：9 个难度按钮宽约35.3px | PASS |
| webkit | new | 11 / 11 | 0 | 0 | 0 | FAIL：9 个难度按钮宽约35.3px | PASS |
| webkit | old | 11 / 11 | 0 | 0 | 0 | FAIL：9 个难度按钮宽约35.3px | PASS |

四场景合计 44 页、44 张截图；全词表（含 necromancer 大小写不敏感，排除“暗黑战士”怪名）零命中。未出现“旧版xx已折算”一次性提示，无须豁免。全量词表：暗夜、暗黑、符文、护身符、炼金、凹槽、暗金、威能、虚隙、秘径、纪元、佣兵、抗性、吸血、魔法物品、技能点、属性点、亡灵、necromancer。

按钮检查按可显示按钮的文字节点矩形统计文字行数；图标与下方标签分别排布的底部导航不算文字换行。44 页均无按钮文字换行；数字难度按钮高度均达到44px，失败为触控宽度。角色详细通过滚动角色页至底部检查，世界首领通过“事件”页开放旗标进入。

点空白使用真实 mouse 点击，自动寻找 elementFromPoint 为 #modal 的坐标（本次 x=2,y=2）。设置弹窗每场景检查两次，合计8次均关闭。必须在打开后等待400ms：bagux.js 明确设有300ms防误触期，早于该时限的点击不作为缺陷。

复现：`python3 tests/diablo_clean_browser.py`。脚本已对覆盖、pageerror、词表、换行、空白关闭及44×44px做断言；本次仅最终触控尺寸断言失败，退出码1。网络仅允许本地 HTTP，Service Worker 为 block。截图为390×844视口，不是把整页缩成一张。

## 截图清单

目录：`/workspace/design/laoyang_m1_shots/codex_diablo_clean/`。`results.json` 为逐页原文及DOM测量记录；以下44张PNG均已生成。

| 页面 | Chromium 新档 | Chromium 旧档 | WebKit 新档 | WebKit 旧档 |
|---|---|---|---|---|
| 角色页 | `chromium_new_role.png` | `chromium_old_role.png` | `webkit_new_role.png` | `webkit_old_role.png` |
| 角色详细 | `chromium_new_role_detail.png` | `chromium_old_role_detail.png` | `webkit_new_role_detail.png` | `webkit_old_role_detail.png` |
| 背包 | `chromium_new_bag.png` | `chromium_old_bag.png` | `webkit_new_bag.png` | `webkit_old_bag.png` |
| 商店 | `chromium_new_shop.png` | `chromium_old_shop.png` | `webkit_new_shop.png` | `webkit_old_shop.png` |
| 淬锋 | `chromium_new_reforge.png` | `chromium_old_reforge.png` | `webkit_new_reforge.png` | `webkit_old_reforge.png` |
| 功业 | `chromium_new_ach.png` | `chromium_old_ach.png` | `webkit_new_ach.png` | `webkit_old_ach.png` |
| 图鉴 | `chromium_new_codex.png` | `chromium_old_codex.png` | `webkit_new_codex.png` | `webkit_old_codex.png` |
| 悬赏 | `chromium_new_bounty.png` | `chromium_old_bounty.png` | `webkit_new_bounty.png` | `webkit_old_bounty.png` |
| 更多 | `chromium_new_more.png` | `chromium_old_more.png` | `webkit_new_more.png` | `webkit_old_more.png` |
| 设置 | `chromium_new_settings.png` | `chromium_old_settings.png` | `webkit_new_settings.png` | `webkit_old_settings.png` |
| 世界首领（事件） | `chromium_new_worldboss_event.png` | `chromium_old_worldboss_event.png` | `webkit_new_worldboss_event.png` | `webkit_old_worldboss_event.png` |

## 结论

语法与两份迁移测试通过；原有测试中7个文件及战斗测试因过时断言/API失败，全部保留为FAIL交开发更新。真实浏览器禁词、运行错误、按钮文字单行和空白关闭通过；设置难度控件触控宽度不足。未因过时断言而放宽总判定。

VERDICT: FAIL
