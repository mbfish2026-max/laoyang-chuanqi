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
- `CQSys.hero() → {cls, name, lvl, xp, skOff:{技能id:1}, mode, rage(0–100), autoHeji(0/1), eq:{部位:物品}, t}`，缺字段自动补默认值
- `CQSys.heroProfs() → [cls…]`：战/法/道全部可选
- `CQSys.heroCreate(cls, name?) → {ok, hero} | {err}`：Lv22 解锁，每个角色只能建一个，从英雄 Lv1 开始
- `CQSys.heroUnlock() → boolean`：主角 Lv22 解锁；已有旧档英雄继续保留。
- `CQSys.hero.skToggle(id, on?) → {ok,on}|{err}`：`on=true` 开启，`false` 关闭，省略则切换；合击 id 为 `heji`。关闭后自动/手动合击均不施放。
- `CQSys.hero.skState() → {技能id:1}`：返回关闭表副本，默认全开，随存档恢复。
- `CQSys.heroMode(mode?)`：省略读取；可设置 `attack/follow/rest/recall`，跟随不攻击，休息不涨怒气，收回不在场。
- `CQSys.heroGainXp(n)`：由 `gainXp` 接入；英雄独立累计经验，英雄等级不超过主角等级，满当前上限不囤经验。
- 存档 `v:2 → v:3`：`heroMigrate()` 在读写档时幂等执行，旧佣兵 mage→法、archer→道、guard/barb→战；保留已有英雄。装备按职业/等级移交，溢出退背包、个人仓库或 `S.migBox`，锁定标记保留；删除旧佣兵字段。
- `CQSys.heroSet({name?, rage?, autoHeji?}) → hero`
- `CQSys.heroEquip(uid) → {ok, slot} | {err}`（从背包移入；职业锁定底材按英雄职业校验）/ `CQSys.heroUnequip(slot) → {ok} | {err:'背包已满'}`
- `CQSys.heroStats() → {cls, lvl, atkMin, atkMax, def, mdef, hp, takesDmg, heroK}`：英雄装备 + 等级 × `CQ_BAL.hero.cls[cls]`（占位系数，**待职业/数值方确认**）；`takesDmg=1`，英雄可受伤，阵亡后30秒自动复活

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

## 英雄伤害预算（CQ_BAL.budget.hero = 0.25）
- 规则：英雄普攻（hitMon src `'cqhero'`）+ 合击（src `'cqheji'`）≤ 总伤害 25%；`hero` 项不参与 `cqBudgetProduct()` 连乘
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
- 没有图的怪（首领 model 是占位 1001，或者图片文件不存在）返回 `null`，战斗侧自己用 emoji，不要退到骷髅。美术2 的立绘 `assets/cq/ui/mdl_mst_<key>.png` 按怪物 key 直接映射（钉耙猫王、红蛇王、半兽统领、骷髅精英、千年树妖、尸王、电僵王、石墓尸王，以及 imp、shaman…wraith、shroom、sporer、hopper、cowbeast、cowbrute 等 50 个 key）。第 1–3 章的怪和首领目前都有图（千年树妖、尸王、电僵王、石墓尸王用 mdl_mst_<key>）；新怪没图时 monArt 返回 null。召唤物 pet_* 立绘由战斗开发接。

### 9. 平衡修复（测试平衡定位，cq/bal_fix_cq.js）
- **自动回收保护**：可装备、并且战力高于身上同部位的装备（或者该部位还空着）不回收，由 `S.rcy.keepBetter` 控制，默认开，设成 0 关闭。戒指和两个戒指位里战力较低的那个比。
- **回收品质默认值**：魔法（q3）和稀有（q4）默认不回收。迁移 `S.rcy.dv=4` 只做一次，新旧角色都生效。之前 dv=3 把稀有也设成了回收，这次一起纠正；迁移之后玩家自己勾选的设置会保留。
- **掉落判定**：普通难度第 1–2 章，非首领的掉落判定 `DENSITY.drop` 从 0.6 改为 1.0；金币按同一系数计算，所以也一起提高。第 3 章起仍是 0.6。
- **技能书**（cq/m2_cq.js）：`bookLearn` 未学会的技能直接学会（1 级），已学会的 +1 级，最高 `CQ_BAL.book.maxLv=20`，不消耗技能点，结果写进 `S.sk[技能id]`，返回值里有 `{from,to}`。之后再调用职业 Bot 的 `onBookLearn(b)`，回调里 `b.from`/`b.to` 能看到升级前后的等级。挂机（`S.autoSk`）时 `autoTick` 会自动用掉本职业、等级够的书。技能满 20 级的书不再掉。
- **挂机自动强化**：`S.cqAE={on,max:3,keep:300}`，可以用 `CQSys.autoEnh(on,max)` 设置，强化界面里也有开关。挂机时每 5 秒强化一件已穿装备：等级最低的先强化，同级先强化武器；金币扣完要留够 keep，黑铁矿要够。不使用祝福油。统计在 `S.cqAEn`（强化次数）和 `S.cqGoldIn`（累计金币收入）。
- **重铸候选**：部位词缀池太小时（比如头盔只有 8 种属性），会依次用全等级池、护甲池、首饰池补足，保证 3 个候选互不相同。tests/cq_reforge_seed_test.js 用固定种子 8/1/2/3/13/21/34/55 回归。
- 模拟：`CLS=zs|fs|ds node tests/cq_bal_sim.js [小时]`，输出金币收入、强化等级、技能书数、回收数和被保护的件数。

## 福利 / 一键换装（cq/fuli_cq.js，存档 CQ_SV=4）
只做逻辑与存档，页面由战斗侧实现（设计稿 design/chuanqi_v2_live p5_role / p8_fuli）。`CQSys.api` 仍为 1，所有返回值都是普通对象 `{ok, reason?, ...}`。

### CQSys.signin（七日签到，账号级 `ACCT.cqSign={n,last}`）
- `state()` → `{ok, today:'YYYY-MM-DD', claimedToday, canClaim, day(1–7，今天对应第几天), signed(本轮已签 0–7), total, last, resetOnMiss:false, days:[{day,name,ic,big,state:'ok'|'now'|''}]}`
- `claim()` → 成功 `{ok:true, day, reward:{type,name,yb?|book?|item?}, state}`；同日重复 `{ok:false, reason:'今日已签到'}`
- `rewards()` → 7 天奖励表（`window.CQ_SIGN_RW`）：元宝×20 / 金创药×5（S.pot.hp）/ 技能书页（本职业随机技能书 1 本，无可用书时折 2000 金）/ 太阳水×5（S.pot.rej）/ 金币×5000 / 元宝×50 / 极品戒指（当前等级可穿的戒指底材，q=5）
- 规则：本地自然日（0 点换日）；断签不清零，每签一天进度 +1；第 7 天之后回到第 1 天。元宝进 ACCT.yb，其余进当前角色。
- 事件 `signin`（claim 结果）。

### CQSys.offline（离线收益领取 / 元宝双倍，角色级 `S.cqOff`）
- 结算沿用原 `offline()`（m2_cq.js：上限 8 小时、英雄/首领补算），结算时金币/经验/掉落已入账；本模块在结算对象上补 `xp/claimed/doubled/zone/t`。
- `state()` → 无待领 `{ok:true, has:false}`；有 `{ok, has, claimed, doubled, sec, capSec, capH:8, zone, kills, gold, xp, items(首领掉落件数), boss:[{key,n,kills}], ybCost, yb}`
- `claim(double)`：`false` = 确认领取；`true` = 扣 `ybCost` 元宝再补发一份 **金币+经验**（掉落不翻倍）。失败：`'没有可领取的离线收益'` / `'本次离线收益已领取'` / `'元宝不足'`（附 need/yb，不消耗任何东西）。每次离线结算只能领一次。
- 费用 `CQ_BAL.offYb={perH:10,min:10}`：每（不足）1 小时 10 元宝，8 小时 80。`cost()` 返回当前费用。
- 事件 `offlineReady`（结算出新的待领收益）、`offlineClaim`。

### CQSys.equip.autoBest(dryRun?)
- 按单件战力 `power(it)` 每个部位从「已穿 + 背包可穿（canEquip：等级/力量/敏捷/职业专属）」中取最高；两个戒指位取战力前二（已穿且仍在前二的不动）。仅角色本体，不含佣兵/英雄。
- 返回 `{ok:true, changed, changes:[{slot, from:{uid,name,q,power}|null, to:{...}, gain}], dryRun, power:{before,after}}`；无更好装备 `{ok:true, changed:0, changes:[], reason:'没有更强的装备'}`。替下的装备回背包（数量不增），`dryRun=true` 只返回方案不改动。
- 事件 `autoBest`。

### 存档迁移 v4
旧存档里已结算的 `S.cqOff`（无 claimed）视为已领取，不能补领双倍；`ACCT.cqSign` 缺省 `{n:0,last:''}`。
