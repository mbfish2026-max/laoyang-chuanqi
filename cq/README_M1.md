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
英雄伤害跟着「玩家近期 DPS」走（玩家对怪的 hitMon 伤害，含持续伤害，1 秒一桶，滑动 dpsWin 秒），不再用 等级×3 下限，也去掉了合击的 (1+等级/50)。
| 键 | 默认 | 含义 |
|---|---|---|
| atkT | 1.6 | 英雄普攻间隔（秒） |
| dpsK | 0.095 | 普攻 DPS = 玩家近期 DPS × dpsK（实测约 8.9%，因为玩家 DPS 窗口包含刷怪空档） |
| hejiSec / hejiRef | 6.5 / 3.2 | 合击总伤 = 玩家 DPS × hejiSec × 组合倍率/hejiRef 秒… |
| hejiSecMin / hejiSecMax | 6 / 6.8 | …再夹在 6–6.8 秒 DPS 之间（群体合击把总伤平分到各目标） |
| hejiCd | 45 | 合击冷却（秒）；满 100 怒气才能放 |
| dpsWin / dpsMin | 30 / 8 | DPS 统计窗口；开局不到 dpsMin 秒时用兜底：玩家武器上限 × atkK |
| atkK | 0.35 | 兜底系数（无 DPS 数据时；也是 heroStats 不在时的 heroK） |
| hpK | 0.8 | 兜底英雄生命 = 玩家生命 × hpK；有 heroStats 时用 heroStats.hp × statHpK |
| statHpK / defK | 1 / 0.5 | heroStats 生命系数 / 受伤减 def×defK；heroStats.takesDmg=0 时不受伤 |
| hurtK / hurtT / hurtP | 1 / 2.3 / 0.35 | 受伤倍率；每 hurtT 秒以 hurtP 概率被一只活怪打一下 |
| regen / reviveSec | 0.005 / 30 | 每秒回复比例 / 阵亡复活秒数（按游戏时间 GT） |
实测（`node cq/cq_hero_balance_sim.js 120 <zs|fs|ds>`，跑 2 小时）：普攻约等于玩家伤害的 8.8–9.1%，合击约 6.5–7 秒 DPS，普攻+合击占总伤害 18.7–19.97%（zs 最高，贴近 20% 上限）。和 tests/cq_hero_sim.js 的口径一样，都是 hitMon 返回值。

### 英雄在 step() 里出手（不在战斗页也算）
- cq_bridge 在运行时包装 `step(dt)`，和 sysapi_cq 的 bossTick 用同一种方式，game.js 没改。每次 step 后跑 `coreStep(dt)`：统计 DPS、英雄普攻、自动合击（伤害、眩晕、持续伤害、回血都在这里结算）、英雄受伤/阵亡/复活，每 15 秒存一次档。
- 非战斗页由 game.js 的 4 次/秒定时器驱动 step，英雄一样出手。离线收益按 `S.kpm`（近 2 分钟击杀数）结算，kpm 已经算进英雄贡献，所以不需要改离线公式，也不需要新钩子。
- 战斗页只做表现：`CQ.Scene.onHeroEvent / playHeji(ev.applied) / onDot`。
- 怒气在 hitMon 包装里加：玩家命中 +2，有 CQSys.critNow 时 +4；floatHero('-N') 也就是玩家受伤 +3；英雄命中 +1。

### CQSys 接入（docs/systems_api.md，api===1；接口不存在时保留兜底）
- 英雄存档：`Host.heroStore()` 读 `CQSys.hero()`，写 `CQSys.heroSet({name,rage,autoHeji})`，存进 S.hero，随角色进云存档。旧的 `localStorage cq_battle_hero_v1` 第一次读取时迁移：没有英雄就 heroCreate + heroSet，然后删掉旧 key。
- 英雄面板：没有英雄时显示「召唤英雄」，按 heroProfs 选职业，并显示对应合击。有英雄时可以改名（heroSet）、看/卸英雄装备（heroUnequip）、穿背包装备（heroEquip）。监听 `hero` 事件后刷新。
- 英雄属性：heroStats 给生命/防御/takesDmg；伤害按上面的 DPS 规则（总控平衡），heroStats.heroK 只在兜底公式里用。
- 顶栏：`CQSys.currency()` 显示金币/元宝，`CQSys.power()` 显示战力。
- 暴击大字：监听 `crit` 事件（替代全局 CRIT）；暴击那一下的普通飘字在 critNow 时跳过，由事件补成大字。
- 首领条第二行：`bossInfo()` 显示「狂暴倒计时 mm:ss」或「已狂暴 ×1.5」；`bossEnrage` 事件出警示条。
- 怪物立绘：`CQSys.monArt(m.key)`，返回 null 时退回哈希立绘。
- 冷却圈：`skillCooldown(id)` 不是 placeholder 时用正式 cd/left，否则按 spend 时刻兜底。
- 剩余兜底见 `CQ.MISSING`。

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
