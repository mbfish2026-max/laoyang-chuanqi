# 背包接线

本块直接使用 index.html 已加载的 bagux.js、bagwrap.css，无需修改 index.html 或新增公共脚本入口。
bagux.js 在 DOMContentLoaded 时安装最终 renderBag/showItem 钩子；复用 cq/stash_cq.js 的容量迁移、职业判定与扩容接口。保留现有装备属性渲染，详情底部提供穿戴/对比/锁定/回收和二级存取仓入口。

背包容量仍为 400 格，视觉分页固定 40 格（8×5）；仓库物理页为 48 格（8×6），筛选跨物理页后再按 48 格分页。旧档超过扩容上限的仓库页保留并全部可访问。
详情默认不自动展开对比；点击「对比」复用 compare.js。并行装备块应继续包装 showItem 内容与属性，不应替换 bagux.js 的最终操作栏。

## 验证

- `node --check bagux.js`
- `tests/*_test.js` 全部 37 个文件、`node cq/cq_battle_test.js`
- `python3 tests/pw_baseline.py`：Chromium / WebKit × 390×844 / 375×667。
- `python3 tests/pw_bag.py`：Chromium / WebKit × 新档 / 旧档，覆盖固定格数、按钮高度与不换行、背包分页、职业过滤、个人/共享扩容、对比、锁定、回收、取仓及背景关闭。旧档使用 CQSys.createChar 建档再写入历史 20 页结构，校验 Lv48 与 110 件仓库存货完整保留。
- 专项截图：`/workspace/design/laoyang_m1_shots/codex_bag/{chromium,webkit}_{new,old}_{bag,personal,shared,chips,detail}.png`；同目录 `report.json` 记录组合结果。基线报告位于 `test-artifacts/worktree/report.json`。
