# 老羊传奇 clean-save 独立测试报告（第3轮：旧存档彻底清理）

测试日期：2026-10-26（Asia/Shanghai）。worktree `/workspace/cqx-clean-save`，产品 HEAD `26eaef52495b0ba9c4970d568afd35514c7281aa`，指定基线 `af6bfe1ac8d3100e4e19ec4c9e04e1766198c1d3`。本地 master 已是 `ae95283b02a403b53a8d7e42fa618c3c87c2d249`，故所有差异检查明确使用用户指定基线，避免漏测。

本轮为独立测试；未修改产品代码。仅更新测试、fixture、结果记录和本报告。未 push、未运行 tools/bump.sh、`*_sim.js` 或 auto_sim。参考 docs/diablo_clean_purge.md 的最终修复边界，完整重跑。Node v20.19.2；Python Playwright，本地临时 HTTP server，外网请求阻断，Service Worker 禁用，390×844，独立浏览器 context。

## 1. JS语法：PASS

指定基线到产品 HEAD 中改动且存在的 JS：62 个，逐个 `node --check`，全部通过。新增/修改的两份 JS 测试另经语法检查通过，Python 脚本编译通过，git diff --check 通过。逐文件退出码与原始输出见 [Node结果](diablo_clean_node_results.json)。

## 2. 全部 tests/*_test.js：PASS

共 58 个文件，58 PASS / 0 FAIL / 0 超时。每个独立进程限时60秒，ancient_test.js限时120秒。最多3个并行进程；不运行长模拟文件。补强后的 purge 测试单独重跑并更新以下记录。

| 文件 | 结果 | 秒 | 输出摘要 |
|---|---|---:|---|
| `tests/ancient_test.js` | PASS | 32.91 | ancient_test: 17 pass, 0 fail |
| `tests/ancx_test.js` | PASS | 0.18 | ancx_test: 10 pass, 0 fail |
| `tests/bloodmoon_test.js` | PASS | 0.46 | bloodmoon_test: 16 pass, 0 fail |
| `tests/bossloot_test.js` | PASS | 1.23 | bossloot_test: 21 pass, 0 fail |
| `tests/cls_book_test.js` | PASS | 0.3 | cls_book_test: 34 pass, 0 fail |
| `tests/cls_hero_budget_test.js` | PASS | 35.87 | ds/ds: 13.24%, 合击 27；cls_hero_budget_test: 9 combinations pass |
| `tests/cls_hero_test.js` | PASS | 0.25 | cls_hero_test: 22 pass, 0 fail |
| `tests/cls_pet_test.js` | PASS | 0.51 | cls_pet_test: 6 pass, 0 fail |
| `tests/cq_attrfix_test.js` | PASS | 0.27 | cq_attrfix_test: 14 pass, 0 fail |
| `tests/cq_autobest_test.js` | PASS | 0.18 | cq_autobest_test: 9 pass, 0 fail |
| `tests/cq_autogrow_test.js` | PASS | 0.21 | cq_autogrow_test: 58 pass, 0 fail |
| `tests/cq_balance_test.js` | PASS | 0.2 | cq_balance_test: 15 pass, 0 fail |
| `tests/cq_balfix_test.js` | PASS | 0.21 | cq_balfix_test: 20 pass, 0 fail |
| `tests/cq_enh_detail_test.js` | PASS | 0.23 | cq_enh_detail_test: 11 pass, 0 fail |
| `tests/cq_enh_test.js` | PASS | 0.19 | cq_enh_test: 16 pass, 0 fail |
| `tests/cq_guard_test.js` | PASS | 0.21 | cq_guard_test: 8 pass, 0 fail |
| `tests/cq_hero_system_test.js` | PASS | 0.2 | cq_hero_system_test: 16 pass, 0 fail |
| `tests/cq_icons_test.js` | PASS | 0.19 | cq_icons_test: 150 pass, 0 fail |
| `tests/cq_late_test.js` | PASS | 0.25 | cq_late_test: 9 pass, 0 fail |
| `tests/cq_lifepct_test.js` | PASS | 0.18 | cq_lifepct_test: 4 pass, 0 fail |
| `tests/cq_m1_test.js` | PASS | 0.48 | cq_m1_test: 41 pass, 0 fail |
| `tests/cq_m2_test.js` | PASS | 0.4 | cq_m2_test: 49 pass, 0 fail |
| `tests/cq_migrate_test.js` | PASS | 0.22 | cq_migrate_test: 10 pass, 0 fail |
| `tests/cq_offline_test.js` | PASS | 0.23 | cq_offline_test: 12 pass, 0 fail |
| `tests/cq_prune2_test.js` | PASS | 0.24 | cq_prune2_test: 58 pass, 0 fail |
| `tests/cq_prune_test.js` | PASS | 0.19 | cq_prune_test: 19 pass, 0 fail |
| `tests/cq_reforge_seed_test.js` | PASS | 1.89 | cq_reforge_seed_test: 8 pass, 0 fail |
| `tests/cq_signin_test.js` | PASS | 0.19 | cq_signin_test: 18 pass, 0 fail |
| `tests/cq_skillbar_test.js` | PASS | 0.32 | cq_skillbar_test: 28 pass, 0 fail |
| `tests/cq_spend_test.js` | PASS | 0.16 | cq_spend_test: 17 pass, 0 fail |
| `tests/cq_stash_test.js` | PASS | 0.85 | cq_stash_test: 19 pass, 0 fail |
| `tests/cq_sysapi_test.js` | PASS | 0.24 | cq_sysapi_test: 34 pass, 0 fail |
| `tests/cq_ui_test.js` | PASS | 0.18 | cq_ui_test: 16 pass, 0 fail |
| `tests/diablo_clean_migrate_test.js` | PASS | 0.39 | diablo_clean_migrate: 29 pass, 0 fail |
| `tests/diablo_clean_purge_test.js` | PASS | 0.39 | diablo_clean_purge: 37 pass, 0 fail |
| `tests/diablo_clean_save_test.js` | PASS | 0.2 | diablo_clean_save: 14 pass, 0 fail |
| `tests/diablo_meta_test.js` | PASS | 0.23 | diablo_meta_test: 20 pass, 0 fail |
| `tests/items_test.js` | PASS | 0.35 | items: 42 pass, 0 fail |
| `tests/mir2_b6_test.js` | PASS | 0.34 | mir2_b6_test: 32 pass, 0 fail |
| `tests/mir2_bal_short_test.js` | PASS | 0.32 | mir2_bal_short_test: 19 pass, 0 fail |
| `tests/mir2_cloud_test.js` | PASS | 0.31 | mir2_cloud_test: 14 pass, 0 fail |
| `tests/mir2_equipment_test.js` | PASS | 0.57 | mir2_equipment: 581 pass, 0 fail |
| `tests/mir2_firstdrop_test.js` | PASS | 0.41 | mir2_firstdrop_test: 15 pass, 0 fail |
| `tests/mir2_gamble_test.js` | PASS | 0.74 | mir2_gamble_test: 38 pass, 0 fail |
| `tests/mir2_integration_test.js` | PASS | 0.22 | mir2_integration_test: 10 pass, 0 fail |
| `tests/mir2_lvl_test.js` | PASS | 1.89 | mir2_lvl_test: 69 pass, 0 fail |
| `tests/mir2_maps_test.js` | PASS | 0.89 | mir2_maps_test: 250 pass, 0 fail |
| `tests/mir2_mutation_test.js` | PASS | 0.2 | mir2_mutation_test: 22 pass, 0 fail |
| `tests/mir2_sets_test.js` | PASS | 0.22 | mir2_sets: 43 pass, 0 fail |
| `tests/mir2_skills_test.js` | PASS | 0.78 | mir2_skills_test: 189 pass, 0 fail |
| `tests/mir2_soul_test.js` | PASS | 0.21 | mir2_soul_test: 15 pass, 0 fail |
| `tests/mir2_streams_test.js` | PASS | 0.43 | mir2_streams_test: 37 pass, 0 fail |
| `tests/mir2_summon_test.js` | PASS | 0.23 | mir2_summon_test: 11 pass, 0 fail |
| `tests/mj_test.js` | PASS | 0.09 | 结果：通过 19，失败 0 |
| `tests/recycle_mir2_test.js` | PASS | 0.17 | recycle_mir2_test: 23 pass, 0 fail |
| `tests/reforge_test.js` | PASS | 0.22 | reforge_test: 12 pass, 0 fail |
| `tests/tianguang_test.js` | PASS | 0.16 | tianguang_test: 9 pass, 0 fail |
| `tests/uber_test.js` | PASS | 0.29 | uber_test: 47 pass, 0 fail |

## 3. 战斗测试：PASS

`node cq/cq_battle_test.js`：退出码 0，0.49 秒，220 PASS / 0 FAIL。

## 4. 迁移与彻底清理：PASS

`tests/diablo_clean_migrate_test.js` 存在且29项通过；`tests/diablo_clean_save_test.js` 存在且14项通过；`tests/diablo_clean_purge_test.js` 本轮补强后37项通过。

保存迁移测试：3件装备 UID 81001/81002/81003 全部保留，战力 [222,210,206] → [222,210,206]。火/冰/电/魔法/毒五类1000伤害均≤旧档50%防护下的500；迁移专项另覆盖75%与多装备累计防护。玩家可见渲染HTML禁词零命中。

purge 专项实际执行 load/save、账号 export/import、cq_ 与 cq- 别名转换和 upload（内存云桩，不连接真实账号）。本轮增加三条解析后断言：纯清理结果、本地存档、云payload（递归解析内嵌角色JSON字符串）均无指定旧键或完整禁词表。覆盖 sock/soc/rw/sockq/allres/res/ll/lp/rift/secret/staff/king/season/merc/cqLegacy/kp 与角色旧 sp；秘径 runs 随 secret 对象删除。现行 eg.mj.runs、eg.uber.runs、cqSp.sp 及合法装备兼容字段 cqLegacyClass/cqLegacyLevel 按文档保留，不误判为旧字段。

验证装备数量/UID、等级/转生、付费次数与候选数量保留；金币和材料按明确公式精确折算一次，战力不降；纯清理和固定时钟下完整二次load幂等。验证备份失败阻止迁移、别名重写、import与upload；真实load迁移后45次save仍能逐字取回角色、账号与排行源文本，另一账号45份备份不会淘汰原始副本；固定备份不进入GS或云payload。云非当前角色也清理，CAS version/updated_at条件、递增版本和会话保留。恢复检查为取回原始JSON及逐字校验，不依赖真实云恢复。

浏览器新增 `tests/diablo_clean_browser_fixture.js`，复用保存fixture，在首次load前加入完整旧字段：装备 allres/ll/edmg/q5、sock/soc/rw、旧词缀快照与付费候选，角色 sockq/bon.res/lp/rift/merc/kp/sp、秘径staff/runs/king、history与season、cq_键。sockq按实际旧结构放在角色根，cqLegacy使用扁平数值词缀对象。首次扩充fixture的格式不符已在测试中修正；最终全部44页重新生成，未据无效fixture判定产品缺陷。

| 浏览器旧档 | 装备数/UID | 单件战力前→后 | 等级/转生 | 金币前→后 | 付费次数 | 旧键/禁词 | 二次load/原文备份 |
|---|---|---|---|---|---|---|---|
| chromium | 3 / 81001,81002,81003 | [298, 286, 282] → [298, 286, 282] | 60 / 4 | 12345 → 31595 | 23 | 0 / 0 | PASS / PASS |
| webkit | 3 / 81001,81002,81003 | [298, 286, 282] → [298, 286, 282] | 60 / 4 | 12345 → 31595 | 23 | 0 / 0 | PASS / PASS |

## 5. Chromium / WebKit 44页：PASS

`python3 tests/diablo_clean_browser.py` 最终退出码0。Chromium/WebKit × 新档/旧档 × 11页，共44页、44张本轮截图。通过浏览器内存创建角色、停主循环、开放页面标志绕过登录；旧档通过真实load迁移。角色详细为角色页下方详细区域滚动截图，世界首领通过事件页开放标志进入。

| 浏览器 | 档 | 页/截图 | 禁词 | pageerror | 文字换行 | <44×44主要按钮 | 空白关闭 |
|---|---|---:|---:|---:|---:|---:|---|
| chromium | new | 11 | 0 | 0 | 0 | 0 | PASS |
| chromium | old | 11 | 0 | 0 | 0 | 0 | PASS |
| webkit | new | 11 | 0 | 0 | 0 | 0 | PASS |
| webkit | old | 11 | 0 | 0 | 0 | 0 | PASS |

收集各页 body.innerText，词表：暗夜、暗黑（仅排除怪名“暗黑战士”）、符文、护身符、炼金、凹槽、暗金、威能、虚隙、秘径、纪元、佣兵、抗性、吸血、魔法物品、技能点、属性点、亡灵、necromancer，大小写不敏感。无一次性“旧版xx已折算”提示捕获，无豁免项。

按钮以可见文字节点矩形检查单行，图标与文字分开排布不算文字换行；主要按钮（.gold/.cqbtn/.btn，非禁用）宽高均≥44px。可见弹窗检查真实坐标空白点击，等待400ms避开300ms防误触期；四场景设置弹窗各两次，共8次关闭通过。抽查Chromium旧档设置与WebKit旧档事件截图，布局与自动检查一致。

## 失败清单

无产品缺陷，无过时断言FAIL，无超时或未完成测试项。测试fixture格式修正属于测试构造问题，最终有效fixture全量重跑通过。验证范围限于列出的短测和页面；云测试为内存桩。

## 截图清单

目录：`/workspace/design/laoyang_m1_shots/codex_diablo_clean/`。`results.json` 包含44页innerText、尺寸、关闭坐标、pageerror，以及两浏览器迁移后序列化JSON/UID/战力/资源/幂等/备份证据。以下44张PNG均最终重跑覆盖。

| 页面 | Chromium新档 | Chromium旧档 | WebKit新档 | WebKit旧档 |
|---|---|---|---|---|
| role | `chromium_new_role.png` | `chromium_old_role.png` | `webkit_new_role.png` | `webkit_old_role.png` |
| role_detail | `chromium_new_role_detail.png` | `chromium_old_role_detail.png` | `webkit_new_role_detail.png` | `webkit_old_role_detail.png` |
| bag | `chromium_new_bag.png` | `chromium_old_bag.png` | `webkit_new_bag.png` | `webkit_old_bag.png` |
| shop | `chromium_new_shop.png` | `chromium_old_shop.png` | `webkit_new_shop.png` | `webkit_old_shop.png` |
| reforge | `chromium_new_reforge.png` | `chromium_old_reforge.png` | `webkit_new_reforge.png` | `webkit_old_reforge.png` |
| ach | `chromium_new_ach.png` | `chromium_old_ach.png` | `webkit_new_ach.png` | `webkit_old_ach.png` |
| codex | `chromium_new_codex.png` | `chromium_old_codex.png` | `webkit_new_codex.png` | `webkit_old_codex.png` |
| bounty | `chromium_new_bounty.png` | `chromium_old_bounty.png` | `webkit_new_bounty.png` | `webkit_old_bounty.png` |
| more | `chromium_new_more.png` | `chromium_old_more.png` | `webkit_new_more.png` | `webkit_old_more.png` |
| settings | `chromium_new_settings.png` | `chromium_old_settings.png` | `webkit_new_settings.png` | `webkit_old_settings.png` |
| worldboss_event | `chromium_new_worldboss_event.png` | `chromium_old_worldboss_event.png` | `webkit_new_worldboss_event.png` | `webkit_old_worldboss_event.png` |

VERDICT: PASS
