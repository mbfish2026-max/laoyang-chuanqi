# 老羊传奇 clean-int 独立测试报告（第2轮）

测试日期：2026-10-26（Asia/Shanghai）。worktree `/workspace/cqx-clean-int`；测试 HEAD `a4e30cc6f071e66d82d770d4e50e04af37f1cdf6`（含开发修复 `d3cc799`），master 基线 `af6bfe1ac8d3100e4e19ec4c9e04e1766198c1d3`。

本轮完整重跑，覆盖上一轮报告与截图。未修改产品代码；仅加强保存测试的 season 断言并更新测试记录、报告。未 push，未运行 tools/bump.sh、`*_sim.js` 或 auto_sim。Node v20.19.2；Python Playwright，本地 HTTP server，阻断外网、禁用 Service Worker，视口390×844。

## 1. JS语法：PASS

`git diff master..HEAD` 中改动且存在的 JS 共 58 个，逐个 `node --check`：58 PASS / 0 FAIL。本轮修改的保存测试另经 node --check 通过；git diff --check 通过。逐文件原始输出见 [Node结果](diablo_clean_node_results.json)。

## 2. 全部 tests/*_test.js：PASS

共 57 个文件：57 PASS / 0 FAIL。每个独立进程，60秒超时；ancient_test.js 为120秒。超时 0 个。

| 文件 | 结果 | 秒 | 输出摘要 |
|---|---|---:|---|
| `tests/ancient_test.js` | PASS | 31.82 | ancient_test: 17 pass, 0 fail |
| `tests/ancx_test.js` | PASS | 0.19 | ancx_test: 10 pass, 0 fail |
| `tests/bloodmoon_test.js` | PASS | 0.44 | bloodmoon_test: 16 pass, 0 fail |
| `tests/bossloot_test.js` | PASS | 1.03 | bossloot_test: 21 pass, 0 fail |
| `tests/cls_book_test.js` | PASS | 0.22 | cls_book_test: 34 pass, 0 fail |
| `tests/cls_hero_budget_test.js` | PASS | 30.53 | ds/ds: 13.24%, 合击 27；cls_hero_budget_test: 9 combinations pass |
| `tests/cls_hero_test.js` | PASS | 0.15 | cls_hero_test: 22 pass, 0 fail |
| `tests/cls_pet_test.js` | PASS | 0.42 | cls_pet_test: 6 pass, 0 fail |
| `tests/cq_attrfix_test.js` | PASS | 0.17 | cq_attrfix_test: 14 pass, 0 fail |
| `tests/cq_autobest_test.js` | PASS | 0.15 | cq_autobest_test: 9 pass, 0 fail |
| `tests/cq_autogrow_test.js` | PASS | 0.17 | cq_autogrow_test: 58 pass, 0 fail |
| `tests/cq_balance_test.js` | PASS | 0.16 | cq_balance_test: 15 pass, 0 fail |
| `tests/cq_balfix_test.js` | PASS | 0.17 | cq_balfix_test: 20 pass, 0 fail |
| `tests/cq_enh_detail_test.js` | PASS | 0.16 | cq_enh_detail_test: 11 pass, 0 fail |
| `tests/cq_enh_test.js` | PASS | 0.16 | +0→+9 平均尝试次数 213.0；cq_enh_test: 16 pass, 0 fail |
| `tests/cq_guard_test.js` | PASS | 0.18 | cq_guard_test: 8 pass, 0 fail |
| `tests/cq_hero_system_test.js` | PASS | 0.16 | cq_hero_system_test: 16 pass, 0 fail |
| `tests/cq_icons_test.js` | PASS | 0.16 | cq_icons_test: 150 pass, 0 fail |
| `tests/cq_late_test.js` | PASS | 0.17 | cq_late_test: 9 pass, 0 fail |
| `tests/cq_lifepct_test.js` | PASS | 0.15 | cq_lifepct_test: 4 pass, 0 fail |
| `tests/cq_m1_test.js` | PASS | 0.45 | cq_m1_test: 41 pass, 0 fail |
| `tests/cq_m2_test.js` | PASS | 0.29 | cq_m2_test: 49 pass, 0 fail |
| `tests/cq_migrate_test.js` | PASS | 0.16 | cq_migrate_test: 10 pass, 0 fail |
| `tests/cq_offline_test.js` | PASS | 0.2 | cq_offline_test: 12 pass, 0 fail |
| `tests/cq_prune2_test.js` | PASS | 0.19 | cq_prune2_test: 58 pass, 0 fail |
| `tests/cq_prune_test.js` | PASS | 0.17 | cq_prune_test: 19 pass, 0 fail |
| `tests/cq_reforge_seed_test.js` | PASS | 1.41 | cq_reforge_seed_test: 8 pass, 0 fail |
| `tests/cq_signin_test.js` | PASS | 0.16 | cq_signin_test: 18 pass, 0 fail |
| `tests/cq_skillbar_test.js` | PASS | 0.18 | cq_skillbar_test: 28 pass, 0 fail |
| `tests/cq_spend_test.js` | PASS | 0.15 | cq_spend_test: 17 pass, 0 fail |
| `tests/cq_stash_test.js` | PASS | 0.72 | cq_stash_test: 19 pass, 0 fail |
| `tests/cq_sysapi_test.js` | PASS | 0.17 | cq_sysapi_test: 34 pass, 0 fail |
| `tests/cq_ui_test.js` | PASS | 0.16 | cq_ui_test: 16 pass, 0 fail |
| `tests/diablo_clean_migrate_test.js` | PASS | 0.34 | diablo_clean_migrate: 29 pass, 0 fail |
| `tests/diablo_clean_save_test.js` | PASS | 0.16 | Migration metrics: {"uids":[81001,81002,81003],"oldPower":[222,210,206],"newPower":[222,210,206]}；diablo_clean_save: 14 pass, 0 fail |
| `tests/diablo_meta_test.js` | PASS | 0.17 | diablo_meta_test: 20 pass, 0 fail |
| `tests/items_test.js` | PASS | 0.28 | items: 42 pass, 0 fail |
| `tests/mir2_b6_test.js` | PASS | 0.2 | mir2_b6_test: 32 pass, 0 fail |
| `tests/mir2_bal_short_test.js` | PASS | 0.18 | mir2_bal_short_test: 19 pass, 0 fail |
| `tests/mir2_cloud_test.js` | PASS | 0.17 | mir2_cloud_test: 14 pass, 0 fail |
| `tests/mir2_equipment_test.js` | PASS | 0.35 | mir2_equipment: 581 pass, 0 fail |
| `tests/mir2_firstdrop_test.js` | PASS | 0.3 | mir2_firstdrop_test: 15 pass, 0 fail |
| `tests/mir2_gamble_test.js` | PASS | 0.18 | mir2_gamble_test: 38 pass, 0 fail |
| `tests/mir2_integration_test.js` | PASS | 0.17 | mir2_integration_test: 10 pass, 0 fail |
| `tests/mir2_lvl_test.js` | PASS | 0.33 | mir2_lvl_test: 69 pass, 0 fail |
| `tests/mir2_maps_test.js` | PASS | 0.4 | mir2_maps_test: 250 pass, 0 fail |
| `tests/mir2_mutation_test.js` | PASS | 0.17 | mir2_mutation_test: 22 pass, 0 fail |
| `tests/mir2_sets_test.js` | PASS | 0.17 | mir2_sets: 43 pass, 0 fail |
| `tests/mir2_skills_test.js` | PASS | 0.25 | mir2_skills_test: 189 pass, 0 fail |
| `tests/mir2_soul_test.js` | PASS | 0.18 | mir2_soul_test: 15 pass, 0 fail |
| `tests/mir2_streams_test.js` | PASS | 0.23 | mir2_streams_test: 37 pass, 0 fail |
| `tests/mir2_summon_test.js` | PASS | 0.16 | mir2_summon_test: 11 pass, 0 fail |
| `tests/mj_test.js` | PASS | 0.08 | 结果：通过 19，失败 0 |
| `tests/recycle_mir2_test.js` | PASS | 0.14 | recycle_mir2_test: 23 pass, 0 fail |
| `tests/reforge_test.js` | PASS | 0.16 | reforge_test: 12 pass, 0 fail |
| `tests/tianguang_test.js` | PASS | 0.14 | tianguang_test: 9 pass, 0 fail |
| `tests/uber_test.js` | PASS | 0.2 | uber_test: 47 pass, 0 fail |

## 3. 战斗测试：PASS

`node cq/cq_battle_test.js`，退出码 0，0.27 秒。cq_battle_test: 220 pass, 0 fail。包含当前存储键及旧键输入兼容断言。

## 4. 旧档迁移：PASS

`tests/diablo_clean_migrate_test.js` 存在且通过；另复用 `tests/diablo_clean_save_test.js` 与共享 fixture 完整 load() 旧档测试，本轮新增两处 season 标志保留断言，14 PASS / 0 FAIL。

旧档包含 allres=25、ll=7、edmg=30、edef=20、q5、sock=3/soc/rw、secret staff=3/runs=7/king=1、S.season/S.eg.season 和 cq_ 旧存储键。验证旧键读取与复制、装备数量3→3、uid 81001/81002/81003全部保留；单件旧战力 [222,210,206]→[222,210,206]，合计638→638。火/冰/电/魔法/毒五类1000伤害均不超过旧档50%防护下的500；secret归档及两处season标志保留。角色渲染HTML及背包装备名禁词零命中。纯迁移测试另覆盖独立旧战力基准、多个装备合并防护、付费淬锋候选及幂等。

## 5. Chromium / WebKit：PASS

复用 `python3 tests/diablo_clean_browser.py`，退出码0。每浏览器新档/旧档独立context；内存创建角色、停主循环并开放本地门禁；旧档经fixture保存到旧键后load()迁移。每场景11页，44页/44张重新生成的PNG。角色详细为角色页下方详细区域滚动截图；世界首领经事件页开放旗标进入。

| 浏览器 | 档 | 页/截图 | 禁词 | pageerror | 换行 | <44×44主要按钮 | 空白关闭 |
|---|---|---:|---:|---:|---:|---:|---|
| chromium | new | 11 | 0 | 0 | 0 | 0 | PASS |
| chromium | old | 11 | 0 | 0 | 0 | 0 | PASS |
| webkit | new | 11 | 0 | 0 | 0 | 0 | PASS |
| webkit | old | 11 | 0 | 0 | 0 | 0 | PASS |

全词表：暗夜、暗黑（排除“暗黑战士”怪名）、符文、护身符、炼金、凹槽、暗金、威能、虚隙、秘径、纪元、佣兵、抗性、吸血、魔法物品、技能点、属性点、亡灵、necromancer（大小写不敏感）。收集各页 body.innerText 后断言零命中；未捕获“旧版xx已折算”一次性补偿提示，无豁免项。

按钮以可显示元素文字节点的行矩形检查单行，图标与文字分别排布的导航不算文字换行；主要按钮（.gold/.cqbtn/.btn，非禁用）宽高均须≥44px。设置难度按钮已为5+4网格，本轮四场景均通过。设置弹窗每场景检查两次，共8次真实鼠标点空白关闭；等待400ms避开产品300ms防误触期。每次可见弹窗均检测关闭。

## 失败清单

本轮无失败项，无待区分的产品缺陷或过时断言。上一轮7个测试文件失败、战斗测试失败与设置触控宽度问题，在本轮对应完整重跑中均通过。结论限于本次短测与所列页面；未执行长时间模拟。

## 截图清单

目录：`/workspace/design/laoyang_m1_shots/codex_diablo_clean/`。同目录 `results.json` 保存44页innerText、按钮尺寸、点击关闭证据与pageerror；以下PNG均本轮重新生成。

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
