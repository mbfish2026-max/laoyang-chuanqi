# R10 神兵器魂接线

加载在装备 install 与 m2/cap 后；独立模块 `cq/soul_cq.js/.css`，不修改 firstdrop。

- `CQSoul.eligible(it)`：基础武器 tier≥2 或品质≥3；所有职业通用。
- 每件物品字段 `soulKills`，缺省 0，上限 200000；阶段由 1000/10000/50000/200000 推导。`soulSeen` 记录本次突破，载入不播放特效。
- 包装 killMon，捕获击杀前所持武器，普通/精英 champ、uniq、elite/首领分别 +1/3/20。WeakSet 去重同一怪物对象。召唤物和毒击杀走同一入口；不追溯历史总击杀。
- 四条固定魂伤由武器 ID 确定，每条 +1～3，不生成百分比词条；不同武器有独立魂名和固定值。攻击/魔法/道术标签按基础职业确定，伤害分摊到本次命中各分量；累计收益不超过 budget.soul=0.10。设计示例的随机再斩改为固定魂伤，符合固定传奇属性要求。
- hitMon 包装只处理本体直接伤害，排除 dot、英雄、合击、召唤物，避免派生伤害重复放大。`CQSoul.damageMul` 在同步结算期间传给 cap.statMul，finally 恢复；最内层按装备×器魂×已有包装倍率统一执行 1.8 封顶，不在 cap 重复加伤。
- 若集成者调整包装顺序，必须保持器魂在 CQ_CAPIN 外，damageMul 只在当前调用有效；不可再次在 calc 加魂伤。
- 详情入口包装 showItem；装备 install 后自动重新接线。四阶段页签、四条进度和锁定魂效，终焉 itemColor 金红，一次突破动画，背景可关闭。
- 换装、私人/共享仓库、淬锋、强化均沿用物品原字段，不按底材合并计数；旧档无字段自动从零开始，不修改旧档属性。

验收：tests/mir2_soul_test.js；390×844 Chromium/WebKit 新旧档四阶段页签和动画短测。未执行长时间挂机／25–30h 时长测定。

本次验证：44 个 `tests/*_test.js` 全部退出 0（器魂 15 项）；`cq/cq_battle_test.js` 219 项；`python3 tests/pw_baseline.py` 19 项，失败 0；改动 JS 均通过 node --check。`tests/pw_soul.py` 覆盖 Chromium/WebKit × 新旧档，检查四页签、触控尺寸、空白关闭和单次动画。截图目录 `/workspace/design/laoyang_m1_shots/codex_soul/`。
