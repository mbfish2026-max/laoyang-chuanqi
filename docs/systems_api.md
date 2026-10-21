# 老羊传奇 · 系统侧接口（M1）

全部挂在 `window.CQSys` 上；数值来自 cq/balance.js 的 `CQ_BAL`。index.html 加载顺序：`… cq/sys_cq.js → cq/enhance.js → cq/stash_cq.js → cq/ui_cq.js → cq/sysapi_cq.js → cq/hud_cq.js → cq/battle_mount.js`。战斗引擎由 battle_mount 在 DOMContentLoaded 后动态加载，处于最外层，可以随意包装。
本文接口用来替换 cq_bridge.js 里 `CQ.MISSING` 的兜底实现。是否就绪：`window.CQSys && CQSys.api===1`。
**签名不变**：hitMon(m,d,src,fxc)、floatNum、killMon(m)、groundLoot、usePot(k) 只做运行时包装，参数和返回值都没改。

## 事件
`CQSys.on(ev, fn) → off()`；同时在 `window` 上派发 CustomEvent `cq:<ev>`（detail 与回调参数相同）。
| ev | detail |
|---|---|
| `char` | `{id, cls}` 新建角色 |
| `hero` | S.hero 对象（创建/修改/穿脱装备） |
| `skill` | `{id, t}` 技能施放 |
| `yb` | `{d, why, yb}` 元宝变动 |
| `crit` | `{crit:true, src, dmg, t}` |
| `bossSpawn` | `{key, name, enrageIn}`（秒） |
| `bossEnrage` | `{key, mul}` |
| `bossDead` | `{key}` |
| `autoPot` | 当前自动吃药配置 |
| `auto` | `{auto}` 挂机开关变化 |

## 职业 / 创建角色
- `CQSys.classes() → [{id:'zs'|'fs'|'ds', n, d, ic, open}]`
- `CQSys.createChar(name, cls, mode?) → id`：新建并切换到该角色（包装 stash.js `newChar`）；职业未开放返回 0
- `CQSys.curCls() → 'zs'|'fs'|'ds'`

## 英雄（存在角色存档 `S.hero` 中 → 自动进云存档、按角色区分）
> 已确认（M1，commit 9d01957 起）：`S.hero` 是角色存档 S 的普通字段，随 `save()` → `exportAccount()` 进 `public.cq_saves`；`switchChar` 换角色即换英雄。tests/cq_sysapi_test.js「新角色英雄独立 / 切回原角色英雄还在」覆盖。cq_bridge 的 `localStorage cq_battle_hero_v1` 兜底可换成 `CQSys.hero()/heroSet()`。
- `CQSys.hero() → {cls, name, lvl, rage(0–100), autoHeji(0/1), eq:{部位:物品}, t}`，缺字段自动补默认值
- `CQSys.heroProfs() → [cls…]`：推荐英雄职业（战士 → 法/道，其余 → 战士优先）
- `CQSys.heroCreate(cls, name?) → {ok, hero} | {err:'已有英雄'|'职业无效'}`：每个角色只能建一个
- `CQSys.heroSet({name?, rage?, autoHeji?}) → hero`
- `CQSys.heroEquip(uid) → {ok, slot} | {err}`（从背包移入；职业锁定底材按英雄职业校验）/ `CQSys.heroUnequip(slot) → {ok} | {err:'背包已满'}`
- `CQSys.heroStats() → {cls, lvl, atkMin, atkMax, def, mdef, hp, takesDmg, heroK}`：英雄装备 + 等级 × `CQ_BAL.hero.cls[cls]`（占位系数，**待职业/数值方确认**）；`takesDmg=0` 表示目前英雄不受伤

## 玩家属性 / 装备
- `CQSys.equipAttrs()`：玩家已穿装备属性合计（含强化）；`CQSys.itemCls(it)`：物品职业
- `CQSys.power() → int` 战力：已穿装备 `power(it)` 之和 + 英雄装备 ×0.5 + 等级×20，再乘转生倍率（`cqCapMul` 封顶 1.8）

## 技能冷却（职业 Bot 填）
- 登记表 `window.CQ_SKCD[技能id] = 冷却秒数`
- `CQSys.skillCast(id)`：施放时调用（由职业 Bot 在施放点调用）
- `CQSys.skillCooldown(id) → {id, cd, left, ready, placeholder}`；`placeholder:true` 表示该技能尚未登记冷却，战斗侧可继续用兜底

## 怪物 → 传奇立绘
- `CQSys.monArt(key) → {id, src:'assets/cq/ui/<id>.png'} | null`；对照表 `window.CQ_MONART`（第 1 章怪物/首领已映射到现有 5 张立绘，可直接赋值扩充）

## 元宝（账号级 `ACCT.yb`，进云存档，跨角色共享）
- `CQSys.currency() → {gold, yb}`；`CQSys.ybAdd(n, why) → 余额`；`CQSys.ybSpend(n, why) → bool`

## 暴击标记（替代全局 CRIT）
- `CQSys.critNow`：hitMon 执行期间为 true 表示本次是暴击（兼容旧 CRIT；另按装备属性 `crit`% 掷骰，伤害 × `CQ_BAL.critMul`=1.5；hero/dot 来源不掷）
- `CQSys.hit = {crit, src, dmg, t}`：最近一次命中；暴击同时派发 `crit`

## 首领刷新 / 狂暴
- `CQ_BAL.boss = {respawn:60, enrage:90, enrMul:1.5}`（秒）
- `CQSys.bossInfo()`：存活时 `{alive:true, key, spawnAt, enrageAt, enrageLeft, enraged}`；死亡后 `{alive:false, killAt, respawnAt, respawnLeft}`
- 每次 step() 之后执行 `bossTick()`：检测首领出现/死亡，90 秒后狂暴（`m.dmg×1.5`，`m.cqEnr=1`）

## 英雄伤害预算（CQ_BAL.budget.hero = 0.20）
- 规则：英雄普攻（hitMon src `'cqhero'`）+ 合击（src `'cqheji'`）≤ 总伤害 20%；`hero` 项不参与 `cqBudgetProduct()` 连乘
- 系统侧强制：hitMon 包装按 30 秒滑动窗口记账，`cqhero/cqheji` 本次伤害超出余量时等比截断，派发 `heroCapped {want, got}`
- `CQSys.heroShare() → {player, hero, share, cap, win}`；工具函数 `cqHeroShare(h,j,t)`、`cqHeroShareOk(h,j,t)`、`cqHeroDmgCap(本体伤害)`
- 现状：战斗侧 7f75beb 已按玩家近期 DPS 定英雄伤害（普攻≈9%、合击合计≤20%，cq/cq_hero_balance_sim.js 验证），系统侧截断只作兜底，正常情况下不会触发

## 吃药（函数不变，战斗侧只调用）
- **吃药函数 `usePot(k)`**（game.js），`k ∈ 'hp'|'mp'|'rej'|'tp'`（红药/蓝药/瞬回/回城；`tp` 走 `townPortal()`）；数量为 0 时不做任何事。也可用 `CQSys.usePot(k)`；`CQSys.potions() → {hp, mp, rej, tp}`（库存在 `S.pot`）
- **已有自动吃药**：在 game.js `step(dt)` 内，无单独入口，阈值现由 `cqAP(k)` 读取（见下节）：血量低于阈值且未在回血 → 红药（7 秒回 50%，`H.potT`）；血量低于瞬回阈值 → 瞬回（立即回 35% 血/蓝）；蓝量低于阈值 → 蓝药（5 秒回 60%，`H.mpT`）
- **三个栏的 id（结构未改）**：药水栏 `#pots`（按钮 `#pb_hp #pb_mp #pb_rej #pb_tp`，数量 `#p_hp #p_mp #p_rej #p_tp`，点击绑定在 game.js）；任务行 `#fquest`；区域栏 `#fzone`

## 底栏收起后的承接（cq/hud_cq.js）
战斗侧在 cq/ 里隐藏 `#pots`（红蓝球+药水栏）、`#fquest`（主线任务行）、`#fzone`（区域切换+原地挂机按钮）；**id/结构不变**，game.js 仍会写入，只是不显示。
- **自动吃药（可配置）**：`CQSys.autoPot() → {on, hp, rej, mp}`（百分比，默认 1/40/20/15）；`CQSys.autoPot({on?, hp?, rej?, mp?})` 修改并存入 `S.apot`（按角色，进云存档），取值 0–95，`0` = 该药不自动吃，`on:0` = 全部关闭；派发 `autoPot`
- **药水数量**：背包页（`renderBag`）底部追加「药水」面板 `.cqpot`：红/蓝/瞬回/回城数量 + 「使用」+ 阈值 ± + 自动吃药开关；`CQSys.potHTML()` 返回同样的 HTML，可复用
- **主线任务**：地图页（`renderMap`）顶部追加「主线任务」面板 `.cqmq`（`questLine()` + 自动推进暂停原因）+ 自动推进/原地挂机开关；`CQSys.questLine()` 返回文字
- **挂机开关**：`CQSys.idle() → bool`（true = 原地挂机，即 `S.auto=0`）；`CQSys.setAuto(0|1)` 保存并重绘，派发 `auto`
- **战斗统计**：`#dsbtn` 运行时移入战场顶栏 `.cqb .top`，放在菜单按钮 `.menu` 左侧（加 class `cqtop`，只显示 📊 图标）；弹窗逻辑不变
- **版本号**：战斗页左下角 `#cqver` 和挂载点 `.cq-ph-v` 隐藏（元素保留）；设置弹窗 `#setM` 底部追加「版本」行 `.cqverrow`；`CQSys.version()` 返回版本字符串

## 其他
- `CQSys.rollDrops(m)`、`addItem(it)`、`addMat/matCount/takeMat`、`acts()/zone()/monDef(id)` 见 docs/systems_m1.md
- 强化 `cqEnhance(uid,{oil})`；仓库扩充 `cqStashExpand('p'|'s')`

---

## M2 系统接口（cq-20261021f 之后）

### 1. 首领真实时间刷新（cq/m2_cq.js）
- 刷新间隔 `CQ_BAL.bossRt`：小首领 600 秒，章节首领 1800 秒，后期章节首领 3600 秒。状态存在 `S.bossRt[key]`（下次刷新的时间戳）。
- `bossCd(key)` 返回剩余秒数，`bossList()` 列出所有首领及状态，`bossGo(key)` 前往该首领所在地图。
- spawnWave 被包装过：首领没刷新时这一波不出首领，`bossInfo().rt` 显示倒计时。
- 事件：`bossKill`、`bossReady`、`bossWait`（用 `CQSys.on` 订阅，或监听 window 的 `cq:bossKill` 等）。

### 2. 离线收益
- 小怪击杀按 `kills × 0.2` 计算。首领按离线时长内的刷新次数结算，有战力判定，掉落减半，最多 6 只。离线收益最多计 8 小时。
- 结果写在 `S.cqOff`，同时触发 `offline` 事件，并显示 `offPanel()` 面板。

### 3. 第 2、3 章（cq/data_cq2.js）
- 第 2 章比奇（12–22 级）：骷髅洞一/二/三层 → 沃玛森林 → 森林深处 → 尸王殿。
- 第 3 章矿区（22–30 级）：南部/东部矿区 → 采矿所一/二层 → 黑铁矿坑 → 石墓深处。
- 章节终点任务是 a2q6、a3q6，带 `fin`。每个首领有 2 件专属暗金装备（UNIQUES 的 `boss` 字段）。
- **修复**：第 1 章的 q1–q6 原来没有 `act`，q6 也没有 `fin`，所以打完半兽统领后不会调用 `unlockAfter`，cls_sim 一直提示「已到达最终章节」。现已补上。旧存档由迁移 v2 处理（`CQ_SV=2`）：已完成 q6 的存档补解锁第 2 章，并给 bossRt、summons、cqBooks 填默认值。

### 4. 技能书（职业 Bot 对接）
- 物品 id 格式：`book_<cls>_<技能id>`，以 mats 形式存放，例如 `book_zs_csjs`、`book_ds_ysh`。技能 id 和 cls_zs/fs/ds.js 的 CLS_SKILLS 一致。
- `CQ_BOOKS[id] = {cls, sk, lv, n}`：`sk` 是职业技能 id，`lv` 是学习所需等级（等于技能的 r）。
- 接口：`bookDef(id)`、`bookKnown(cls,sk)`、`bookCount(id)`、`bookLearn(id)`、`bookDropFor(monster)`。
- 职业 Bot 用 `onBookLearn(fn)` 注册回调。学习时会调用 `fn(cls, sk, def)`，由职业侧把技能写进自己的技能表。系统侧只负责扣书和检查等级/职业。
- 掉落：包装了 `rollTC`，按怪物等级掉出本章节对应的技能书。物品详情里会出现「学习」按钮。

### 5. 召唤物（战斗 / 职业 Bot 对接）
- 数据存在 `S.summons`。接口：`summonAdd(type, lv)`、`summonRemove(i)`、`summonSetLv(i, lv)`、`summonStats(i)`（返回 hp/dmg/ar/def）、`summonDie(i)`、`summonRevive(i)`、`summonEquipCollar(i, item)`（项圈槽，暂时用护身符类物品）。
- 数量上限 `summonCap(type)`：狗 1、骷髅 1、宠物 1（技能 10 级以上为 2）。
- 战斗侧造成伤害时调用 `hitMon(m, d, 'cqpet')`。系统在 30 秒窗口内把召唤物的伤害占比限制在 `CQ_BAL.summon.share`（0.6）以内。

### 6. 伤害封顶 CQ_BAL.cap
- `CQ_BAL.capMul = 1.8`。脚本加载时就定义 `CQ_BAL.cap(dmg, ctx)`，返回封顶后的伤害。
- `ctx = {src:'player'|'hero'|'combo'|'summon', base?, mul?}`，字段可以缺：
  - 有 `base` 时返回 `min(dmg, base×1.8)`；
  - 有 `mul` 且大于 1.8 时返回 `dmg×1.8/mul`；
  - 两个都没有时，按 `CQ_BAL.curMul(src)` 估算；
  - 什么信息都没有时原样返回。
- 实际结算由 `cq/cap_cq.js` 负责（紧跟 game.js 加载，是最内层的 hitMon 包装）。总倍率 = `statMul`（强化、远古、精炼、转生）× 外层包装放大比例，超过 1.8 就按比例缩小。最近一次的结果在 `CQ_BAL.capLast`。
- **英雄/合击重复削减**：英雄伤害参考玩家有效 DPS（cq_hero.js，120 秒窗口）。战斗开发实测英雄和合击没有被双重削减（capped=false，statMul 最高 1.79），所以不改代码。如果以后英雄 DPS 改成直接继承玩家加成，战斗侧调用 cap 时请传 `ctx.base`（未加成的伤害），只做最终上限检查。
- `cqCapMul(p)` 读 `CQ_BAL.capMul`（CQ_BAL.cap 现在是函数，别再当数字用）。
- 测试：tests/cq_balance_test.js 在全部拉满的情况下验证实际结算倍率 ≤ 1.8，英雄和召唤物的伤害也会封顶。

### 7. 后期加点 / 后期技能
- late.js：`LATE_MAIN`/`LATE_K`/`LATE_SHARE` 补上了 zs（力量）、fs/ds（精神），比例和 classes.js 的 clsLateFix 一致。
- late_mods.js：删除了暗黑 2 的 60/75 级职业技能，只保留通用的后期内容。

### 8. 怪物立绘 CQSys.monArt(key)
- 映射表 `CQ_MONART` 按 web-replica `assets/config/monster.txt` 的 name→model 对照。例：鸡 1001、鹿 1002、多钩猫 1003、钉耙猫 1004、稻草人 1005、半兽人 1006、半兽战士 1008、毒蜘蛛 1009、红蛇/虎蛇 1025。
- 第 2/3 章：骷髅 1013、掷斧骷髅 1014、骷髅战士 1015、骷髅精灵 2001、僵尸 1023、爬行僵尸 1024、洞蛆 1022、山洞蝙蝠 1012、盔甲虫 1034、森林雪人 1007、食人花 1011、电僵尸 2002。
- 没有图的怪（首领 model 是占位 1001，或者图片文件不存在）返回 `null`，战斗侧自己用 emoji，不要退到骷髅。目前无图：钉耙猫王、红蛇王、半兽统领、千年树妖、尸王、电僵王、石墓尸王、骷髅精英。
