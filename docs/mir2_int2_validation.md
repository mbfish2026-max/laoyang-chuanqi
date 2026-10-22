# mir2-int 装备与背包集成验收

装备合并提交 `ae14bd9`；背包合并提交 `26b3988`（包含 `713c16a`）。地图装备 ID 已接入精确内容工厂；新装备属性、旧档/共享仓库迁移、英雄召唤物预算、魔御与幸运使用正式页面加载顺序。背包保留 40 格布局和 48 格仓库分页，详情保留传奇属性，并提供穿戴、对比、锁定、回收及存取仓入口。

## Node 与浏览器验收

- 改动 JS 28 个全部通过 `node --check`。
- `tests/*_test.js` 全部 41 个通过；`cq/cq_battle_test.js` 219 pass。其中装备 587、地图 251、技能 189、正式接线集成 10 pass。
- `pw_baseline`：Chromium/WebKit × 390×844/375×667，0 问题。
- `pw_skillbar`、`pw_hero_m1`、`pw_mir2_b1`、`pw_mir2_maps`、`mir2_equipment_shots`、`mir2_skills_ui`、`pw_bag`：Chromium/WebKit × 新档/旧档通过，优先视口 390×844。
- 背包专项检查传奇属性详情、双栏对比、44px 按钮、不换行、背景关闭、实际穿戴、锁定、回收、筛选、分页、扩容、存取仓；旧档 Lv48 与 110 件仓库存货保留。
- 9 组合各跑 60 分钟，英雄含召唤物与合击合计占比 16.28%–24.64%，全部 ≤25%；合击单项 9.02%–14.74%。明细见 `hero_budget.json`。
- WebKit 旧档 reload 的 Supabase mock keepalive 跨域噪声与既有基线一致，单列到报告；未访问真实后端。

截图与完整报告：`/workspace/design/laoyang_m1_shots/codex_mir2_int2/`，分 `baseline/`、`equipment/`、`bag/`、`skillbar/`、`hero/`、`b1/`、`map/`、`skills/`。

## 留给第 5 块

法师旧末章节奏变慢的问题仍存在于装备块的历史单种子对照：旧第 5 章首次完成约 21.9161→39.8344 小时。该对照是旧 5 章节/旧经验表，不代表当前 7 章节/60 级最终通关时长；未宣称单职业 60–80 小时目标已完成。第 5 块需统一等级曲线、角色属性和全局缩放后，进行多种子全流程校准。没有削弱首领。详情见 `docs/mir2_equip_validation.md`。

仅本地提交；未 push，未运行 tools/bump.sh；排除提交 d3b7818 未进入历史。
