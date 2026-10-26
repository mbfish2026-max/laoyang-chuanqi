# 装备对比独立验收报告（第二轮）

日期：2026-10-26。分支：`fix-compare`。被测提交：`555d41dae169f7e852101fd8e6b32c71e69a778b`。只更新测试、报告和证据文件，未修改业务代码。

## 运行结果

- 所有 JS：`node --check`，179 / 179 通过（含独立测试）。
- `tests/*_test.js`：60 个文件，全部通过；另外 `node cq/cq_battle_test.js` 通过。
- `ancient_test.js` 使用 120 秒超时，实际 31.12 秒完成，通过。
- 扩展并运行 `node tests/compare_independent_test.js`：460 pass，0 fail。
- 浏览器命令：`python3 tests/compare_browser_acceptance.py`（Python Playwright 已安装 Chromium/WebKit）。本地静态服务器、390×844、移动/触摸模式、禁用 Service Worker、阻断外站；不连接真实云账号。真实 UI 初始化，未设置启动期 `__NOUI`。

## 上轮失败项复验

上轮 `cq_enh_detail_test.js` 的英雄双手镯断言失败已由 `91b59cd` 修正夹具等级。本轮实际重新运行该文件并通过；未修改业务代码，未跳过、屏蔽或放宽断言。本轮无失败项。

## 对比和箭头覆盖

| 维度 | 结果 |
| --- | --- |
| 新档 / 旧档 | 通过；旧档经 GS 写入后 load() 的真实迁移边界，并断言 cqMigrated |
| 主角 / 英雄 | 通过；英雄使用自己的职业、等级和装备 |
| 武器、戒指双槽、手镯双槽、真实套装件、空槽 | 通过；真实套装分别使用战士/法师对应 contentId，展示套装已穿戴件数 |
| 更强 / 更弱 / 相等 | 通过；分别显示 / 隐藏 / 隐藏绿色箭头 |
| 空槽 / 双槽与较弱者比 | 通过；空槽优先，否则独立调用 power() 找较弱槽 |
| 英雄 / 旧档 | 同一矩阵全部通过 |
| 职业不符 / 等级不足 | 隐藏箭头；资格判断与结果一致 |
| 弹窗战力差 | 使用 power(候选,职业) − power(目标槽,职业) 独立计算，与每个槽 section 的显示逐项比对 |

460 项断言矩阵：2 种存档 × 2 个角色主体 × 4 类装备 × 7 种情形 × 4 项核心断言，另含旧档迁移与套装显示检查。原有 compare_fix_test.js 也通过，包含第二戒指空槽、缓存和不改存档检查。

箭头表示“满足穿戴条件且对目标槽有提升”；职业/等级不满足时，即使原始战力差为正也不显示箭头。双槽弹窗保留两个槽的独立差值，因此可同时出现一个负差和一个正差；箭头按较弱槽判断。

## 浏览器矩阵

| 浏览器 | 存档 | 背包/仓库/英雄候选箭头 | 弹窗差值 | 词表命中 | 按钮折行 | <44px 按钮 | 空白关闭 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| chromium | new | 通过 | 通过 | 0 | 0 | 0 | 2/2通过 |
| chromium | old | 通过 | 通过 | 0 | 0 | 0 | 2/2通过 |
| webkit | new | 通过 | 通过 | 0 | 0 | 0 | 2/2通过 |
| webkit | old | 通过 | 通过 | 0 | 0 | 0 | 2/2通过 |

检查覆盖背包/仓库页面所有可见 button（含顶栏和底部导航），以及弹窗内按钮。尺寸取 getBoundingClientRect；文本折行用文本 Range 的行矩形检测。弹窗等待 500ms 后点击 (2,2)，确认命中 #modal 且随后隐藏，8/8 次通过。240 个按钮观测的最小宽、高均为 44px。浏览器 pageerror 为零。

背包、仓库、英雄候选各可见一个绿色箭头；主角与英雄弹窗都显示强槽 `-1000`、弱槽 `+980`，弱槽正差与箭头一致。

词表扫描 document.body.innerText，覆盖全部 20 个场景；词表：暗夜、暗黑、符文、护身符、炼金、凹槽、暗金、威能、虚隙、秘径、纪元、佣兵、抗性、吸血、魔法物品、技能点、属性点、亡灵。旧档故意注入旧名称，经迁移后零命中。范围限本次可见场景，不代表所有游戏页面穷举。

## 截图

目录：`/workspace/design/laoyang_m1_shots/codex_compare/`。前四类为要求的 16 张，另有 4 张英雄候选箭头证据。长弹窗使用自身滚动容器；截图保留当时视口，双槽全部 DOM 差值见原始证据。

| 浏览器/存档 | 文件名 |
| --- | --- |
| chromium/new | chromium_new_bag_390x844.png |
| chromium/new | chromium_new_stash_390x844.png |
| chromium/new | chromium_new_compare_390x844.png |
| chromium/new | chromium_new_hero_candidates_390x844.png |
| chromium/new | chromium_new_hero_compare_390x844.png |
| chromium/old | chromium_old_bag_390x844.png |
| chromium/old | chromium_old_stash_390x844.png |
| chromium/old | chromium_old_compare_390x844.png |
| chromium/old | chromium_old_hero_candidates_390x844.png |
| chromium/old | chromium_old_hero_compare_390x844.png |
| webkit/new | webkit_new_bag_390x844.png |
| webkit/new | webkit_new_stash_390x844.png |
| webkit/new | webkit_new_compare_390x844.png |
| webkit/new | webkit_new_hero_candidates_390x844.png |
| webkit/new | webkit_new_hero_compare_390x844.png |
| webkit/old | webkit_old_bag_390x844.png |
| webkit/old | webkit_old_stash_390x844.png |
| webkit/old | webkit_old_compare_390x844.png |
| webkit/old | webkit_old_hero_candidates_390x844.png |
| webkit/old | webkit_old_hero_compare_390x844.png |

## 全量测试记录

| 文件 | 结果 |
| --- | --- |
| `tests/ancient_test.js` | PASS |
| `tests/ancx_test.js` | PASS |
| `tests/bloodmoon_test.js` | PASS |
| `tests/bossloot_test.js` | PASS |
| `tests/cls_book_test.js` | PASS |
| `tests/cls_hero_budget_test.js` | PASS |
| `tests/cls_hero_test.js` | PASS |
| `tests/cls_pet_test.js` | PASS |
| `tests/compare_fix_test.js` | PASS |
| `tests/cq_attrfix_test.js` | PASS |
| `tests/cq_autobest_test.js` | PASS |
| `tests/cq_autogrow_test.js` | PASS |
| `tests/cq_balance_test.js` | PASS |
| `tests/cq_balfix_test.js` | PASS |
| `tests/cq_enh_detail_test.js` | PASS |
| `tests/cq_enh_test.js` | PASS |
| `tests/cq_guard_test.js` | PASS |
| `tests/cq_hero_system_test.js` | PASS |
| `tests/cq_icons_test.js` | PASS |
| `tests/cq_late_test.js` | PASS |
| `tests/cq_lifepct_test.js` | PASS |
| `tests/cq_m1_test.js` | PASS |
| `tests/cq_m2_test.js` | PASS |
| `tests/cq_migrate_test.js` | PASS |
| `tests/cq_offline_test.js` | PASS |
| `tests/cq_prune2_test.js` | PASS |
| `tests/cq_prune_test.js` | PASS |
| `tests/cq_reforge_seed_test.js` | PASS |
| `tests/cq_signin_test.js` | PASS |
| `tests/cq_skillbar_test.js` | PASS |
| `tests/cq_spend_test.js` | PASS |
| `tests/cq_stash_test.js` | PASS |
| `tests/cq_sysapi_test.js` | PASS |
| `tests/cq_ui_test.js` | PASS |
| `tests/diablo_clean_migrate_test.js` | PASS |
| `tests/diablo_clean_purge_test.js` | PASS |
| `tests/diablo_clean_save_test.js` | PASS |
| `tests/diablo_meta_test.js` | PASS |
| `tests/items_test.js` | PASS |
| `tests/mir2_b6_test.js` | PASS |
| `tests/mir2_bal_short_test.js` | PASS |
| `tests/mir2_cloud_test.js` | PASS |
| `tests/mir2_equipment_test.js` | PASS |
| `tests/mir2_firstdrop_test.js` | PASS |
| `tests/mir2_gamble_test.js` | PASS |
| `tests/mir2_integration_test.js` | PASS |
| `tests/mir2_lvl_test.js` | PASS |
| `tests/mir2_maps_test.js` | PASS |
| `tests/mir2_mutation_test.js` | PASS |
| `tests/mir2_sets_test.js` | PASS |
| `tests/mir2_skills_test.js` | PASS |
| `tests/mir2_soul_test.js` | PASS |
| `tests/mir2_streams_test.js` | PASS |
| `tests/mir2_summon_test.js` | PASS |
| `tests/mj_test.js` | PASS |
| `tests/recycle_mir2_test.js` | PASS |
| `tests/reforge_test.js` | PASS |
| `tests/tianguang_test.js` | PASS |
| `tests/uber_test.js` | PASS |
| `cq/cq_battle_test.js` | PASS |
| `tests/compare_independent_test.js` | PASS |

本轮重跑全部现有测试和浏览器脚本；新增断言后独立测试及其语法检查均通过，完整全量运行亦包含更新后的 460 项断言。截图抽查覆盖两引擎的背包、仓库、主角与英雄弹窗，长内容可在弹窗内滚动。

完整退出码、输出、语法清单和浏览器按钮尺寸见 `docs/compare_test_evidence.json`；截图目录也保存 `browser_results.json`。

VERDICT: PASS
