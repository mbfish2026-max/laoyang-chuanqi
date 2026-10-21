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

## M1.1 补充

### 英雄数值常量 `CQ.HERO_TUNE`（cq/cq_hero.js）
| 键 | 默认 | 含义 |
|---|---|---|
| atkT | 1.6 | 英雄普攻间隔（秒） |
| atkK | 0.35 | 普攻伤害 = 玩家武器上限 × atkK |
| hpK | 0.8 | 英雄生命上限 = 玩家生命上限 × hpK |
| hurtK | 1.0 | 怪物打英雄的伤害倍率 |
| regen | 0.005 | 每秒回复生命上限的比例 |
| reviveSec | 30 | 阵亡后复活秒数 |
改这个对象即可调平衡，`cq_bridge.js` 的 heroK 也从这里读。系统开发接管英雄属性后（docs/systems_api.md），Host.maxhp/heroStats 换成真实接口。

### 战斗页布局
- `body.cq-on` 下隐藏 #hud（药水栏）、#fquest（任务行）、#fzone（区域栏），只写在 cq/cq.css，没有改 index.html。
- 卡片恢复样稿尺寸：普通 76×96，首领 118×150。
- 按样稿 p1，底部只留技能行、合击按钮和壳的底部导航栏；去掉红蓝球、四格药水、主线任务行、区域栏和原地挂机按钮，省下的高度全给战场。
- 药水自动吃：game.js step() 本来就会自动吃药（阈值见 `CQSys.autoPot`，默认开，在背包页可调）。战斗侧不重复吃，只在 `Host.autoPot()` 里读它的配置。
- 区域：点右侧竖牌弹出 ◀ 区域 ▶ / 地图（goZone、地图页）。挂机开关在竖牌下「自动合击」旁，chip 写「自动推进 ✓ / 原地挂机」，切换的是原有挂机开关：有 `CQSys.idle/setAuto` 就用它，没有就退回 S.auto。

### 英雄受伤 / 阵亡 / 复活 与面板
- 怪物贴身且 `MOVE.monCanAttack()==='pet'` 时，每 2.0–2.6 秒用 m.dmg 打英雄一次，显示红字和英雄头顶血条。
- 血量到 0 阵亡（变灰并离开格子），倒计时 reviveSec 秒后满血复活。
- 点英雄立绘或右上菜单打开面板：生命、怒气、状态、普攻参数、合击说明、自动合击开关、立即合击。召唤/改名/选职业/装备要等 systems_api。

### 普通技能序列帧
- 从传奇之旅搬到 assets/cq/fx：huoqiu、leidianshu、banyue、liehuo、gongsha、bingpaoxiao、huoqiang、linghunhuofu、shidu、zhiliaoshu、yemanchongzhuang、mofadun、zhaohuan、shenshengzhanjia。
- 包装 `spend(id)`，按技能名匹配（`CQ.SKILL_FX`，见 cq_bridge.js）→ `CQ.FX.playSkill`：projectile 从角色飞到目标，onTarget 落在目标，onSelf 落在自身。每个只播一次，有节流。
