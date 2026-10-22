# mir2-batch4：R06 / R13 集成验收

基线：`eb66f30`。依次合并 `mir2-enhance`（`478ef8d`）与 `mir2-endgame`（`ae6534a`）。

- R06：高纯度黑铁矿、强化转移、双手镯互穿与英雄双槽、+9 入场单次光效；装备详情、自动装备、比较、仓库与锁定逻辑沿用同一槽位规则。
- R13：封魔幻境、转生层数门槛与旧档层数保留、幽冥圣域、龙钥收集及暗之魔龙三阵；入口、战斗和结果页沿用现有加载顺序，无须增加脚本。
- 修正终局 UI 测试：使用本地模拟登录，移除暂停主循环前留下的无角色遮罩，并断言实际角色入口已开放、无未捕获页面异常。测试角色使用 `CQSys.createChar`。

## 短验收

- 改动的 22 个 JS 文件：`node --check` 通过。
- `cq_enh_test`、`cq_enh_detail_test`、`cq_migrate_test`、`cq_sysapi_test`、`cq_m1_test`、`mj_test`、`uber_test`、全部 13 个 `mir2_*_test.js`、`cq/cq_battle_test.js`：21 项通过。
- `python3 tests/pw_enhance.py` 与 `python3 tests/pw_endgame.py`：Chromium / WebKit × 新档 / 旧档，390×844；按钮触控尺寸、不换行、横向溢出、弹窗空白关闭及功能断言通过。
- 截图：`/workspace/design/laoyang_m1_shots/codex_enhance/`、`/workspace/design/laoyang_m1_shots/codex_endgame/`。
- 按本窗口短验收要求，不运行可选基线与长时平衡模拟。全量测试尝试中触发的 `cls_hero_budget_test` 平衡模拟已停止，未计入本次通过项。
- 未 push，未运行 `tools/bump.sh`，未合并或 cherry-pick `d3b7818`。
