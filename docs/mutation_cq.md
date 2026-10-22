# R11 地图三异变

入口：`cq/mutation_cq.js`，样式：`cq/mutation_cq.css`。

- 现实 UTC 整点窗口：血月每 2 小时 30%、尸王潮每 3 小时 25%、财神猪每小时 10%。独立确定性散列抽签，刷新不会重抽；重叠按血月、尸王潮、财神猪顺序取一个，其他窗口消耗。每次持续 10 分钟，离线过期不补发。
- 绑定触发时的地图和难度，切图不转移；状态及窗口保存在 `S.mutation`，旧档缺字段自动补齐。旧版 `S.bm` 不再触发，已有破障护符仍兼容。
- 血月怪物伤害增加 30%，掉落独立结算两次（包含金币、药水、装备等），不改等级/经验。到期现存怪物恢复伤害。
- 尸王潮只在骷髅洞、尸王殿、石墓；普通波怪物向上取整补足 1.5 倍，每第 5 波增加异变尸王，保底稀有以上装备，不影响首领原始属性。
- 财神猪只在野外图，每次一只，不攻击玩家或英雄；每 5 个现实秒尝试向远离玩家的空邻格移动。卡住则等待下一次；60 秒逃走且不结算奖励。击杀获得至少 10000 金币与一份极品宝箱奖励（直接开出 q4 装备入包），标记 `mutationChest`，重复结算无奖励。
- 场景使用静态红/灰绿/金色遮罩，进入闪光及逃跑烟尘各播一次；显示异变剩余时间及猪逃跑时间。沿用现有卡片结构，没有新增可点击控件。

短测：`node tests/mir2_mutation_test.js`（直接推进时钟），`python3 tests/pw_mutation.py`（Chromium/WebKit、新角色/旧档、390×844）。截图和报告输出到 `/workspace/design/laoyang_m1_shots/codex_mutate/`。

## batch3 集成

与 R03 套装共存时，血月第二次掉落使用临时 `cqLootReplay` 标记，结算后在 finally 中恢复。套装随机掉落仍可再次抽取，但击杀累计及300杀保底只结算一次；专测覆盖299→300杀、仅一件保底及标记清理。

本窗口集成短验收：166个JS文件 node --check 通过；mir2_sets 35、mir2_summon 11、mir2_mutation 22、cq_migrate 10、cq_sysapi 34、mir2_equipment 587、cq_battle 219项通过。三项功能均完成 Chromium/WebKit × 新档/旧档 390×844 截图检查；汇总报告位于 `/workspace/design/laoyang_m1_shots/batch3/`，原图分别位于同级 `codex_sets/`、`codex_summon/`、`codex_mutate/`。本次以窗口短验收清单为准，未完成整套 tests/*_test.js；误启动的全量任务已中止，未完成长时英雄预算模拟。

pw_baseline.py 单次默认矩阵通过：Chromium/WebKit × 390×844/375×667，0问题。报告：`/workspace/design/laoyang_m1_shots/batch3/baseline-report.json`。
