# cq/ — 老羊传奇战场（M1 战斗移植）

挂载：`cq/battle_mount.js` 在 DOMContentLoaded 后按顺序动态加载 `cq/cq.css` + `cq_move.js → cq_hero.js → cq_fx.js → cq_scene.js → ../cq_bridge.js`（不改 index.html）。
`window.__CQ_NO_ENGINE=1` 可关闭战场引擎（只留挂载点）。

| 文件 | 来源（传奇之旅 web-replica） | 作用 |
|---|---|---|
| cq_move.js | js/move.js（原样，MOVE→CQ.MOVE，射程/步速注入） | 6×5 格 A* 走位、贴身才攻击、首领只在第 3 行以下 |
| cq_hero.js | js/systems/hero.js（COMBO/怒气/doHeji/hejiDamage） | 英雄单位 + 合击规则 |
| cq_fx.js | js/fx.js（sheet/粒子/光环/合击蓄力+冲击） | canvas 特效层，队列空即停；`once()` 一次性 DOM 动画 |
| cq_scene.js | js/ui.js buildScene/moveCard、js/popcard.js | 卡片战场 DOM + 样稿表现（顶栏/首领条/冷却圈/合击/暴击/光柱/地面标签） |
| cq.css | 样稿 live.css | 作用域 `#cqStage .cqb`；壳覆盖只在 `body.cq-on` |
| ../cq_bridge.js | — | CQ.Host 数据适配 + 运行时包装 hitMon/floatNum/floatHero/killMon/groundLoot/spawnFloat/spend + CQBattle.register |
| cq_battle_test.js | — | `node cq/cq_battle_test.js` |

## 数据流
game.js `step()` 仍是唯一战斗结算：伤害/击杀/掉落（rollTC→addBag）都在原逻辑里。战场只做表现 + 英雄/合击（伤害经 `hitMon` 写回）。
走位是表现层（传奇规则），不影响 game.js 的命中判定。

## 特效规则
- 只有 `.cqb .card .fig` 的 `cqBreath` 是 infinite（怪物卡片呼吸）。切页签/息屏时 `#cqStage.cq-paused` 暂停全部动画并停 rAF。
- 其余全部 `animation-iteration-count:1`，`CQ.FX.once()` 在 animationend（或兜底超时）后移除 class/节点；canvas 队列空了自动停。
- 地面标签/光柱 9 秒后淡出（一次），或「一键拾取」清除（物品已由 killMon 入包）。

## 缺的系统接口（本地兜底见 cq_bridge.js `CQ.MISSING`）
英雄存档字段、英雄职业选择、英雄属性、技能真实冷却、怪物→传奇立绘映射、元宝、战力、暴击标记、首领刷新/狂暴时间、英雄与合击数值确认。
