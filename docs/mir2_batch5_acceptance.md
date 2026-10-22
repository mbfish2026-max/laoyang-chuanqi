# Batch5 本地集成短验收

基点 `b042567`，分支 `mir2-batch5`。依次合并 `mir2-streams`（`e65a290`）、`mir2-docs`（`e40ce88`）、`mir2-polish`（`2c734d0`），无冲突。现有 index.html 已加载技能模块与背包修补，无需增加重复接线。

- R04：九流派选择、四格与自动优先级、技能协同、双召唤和护持；技能继续用书修炼，未新增属性点/技能点。
- R01：合并系统 API 与差异状态文档；补充本批 R04/R15 实际落地状态，R16 长时平衡继续保留。
- R14/R15：战场容器定位、背包/仓库长按和翻页、两列菜单及44px按钮。

## 验证

- 改动 JS 8 个文件全部 `node --check` 通过；`git diff --check` 通过。
- `tests/*_test.js` 共51入口，50个短测试全部通过（包含全部 mir2、streams 与相关 cls 测试）。`cls_hero_budget_test.js` 会调用九组合各60分钟模拟，尝试在45秒短验收上限停止，未完成；依据本窗口“禁止长跑”不继续，不能声称全量51项通过。
- `node cq/cq_battle_test.js`：219 pass，0 fail。
- `python3 tests/pw_streams.py`：Chromium/WebKit × 新旧档 × 三职业，12组通过、108张截图。
- `python3 tests/pw_polish.py`：Chromium/WebKit × 新旧档，4组通过、12张截图。
- `python3 tests/pw_baseline.py --browsers chromium,webkit --viewports 390x844`：通过，0问题。仅运行一次390×844双浏览器基线，不作长时模拟。
- 测试角色均经 `CQSys.createChar(name,cls)` 创建；新旧档UI覆盖390×844、触控、弹窗空白关闭及保存重载。抽看WebKit旧档流派页和长按菜单截图。

截图：`/workspace/design/laoyang_m1_shots/codex_streams/`、`/workspace/design/laoyang_m1_shots/codex_polish/`、`test-artifacts/worktree/{chromium,webkit}_390x844/`。测试日志在 `/tmp/mir2-batch5/`。

未 push、未运行 tools/bump.sh、未合并或 cherry-pick d3b7818；未新增素材、未改首领数值。60–80小时通关与九流派TTK属于R16，未在本次短验收宣称完成。
