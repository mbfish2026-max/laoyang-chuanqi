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

## mir2-int 集成补充

`CQMir2Equip.install()` 在同步脚本末尾安装传奇属性详情；`cqbInstall()` 在 DOMContentLoaded 包装最终详情并保留新操作栏。装备详情不会进入旧 compare.js 的 showItem 包装，因此 `cqbCompare()` 在未生成 `.cmpw` 时，用最终详情分别渲染当前装备和查看装备，再复用 `cmpTarget/cmpHtml/cmpDiff` 构建双栏与变化表。存取仓和穿戴/对比/锁定/回收操作栏保持整行。

集成后的海魂、偃月都按 1.76 表归法师；背包验收中的 55 件共享仓库样本因此应筛出 28 件法师装备。首领掉落统计固定使用有暗金定义的非专属底材，并检查两组各 40000 件有效暗金，避免新增高阶底材回退后导致样本不足。
