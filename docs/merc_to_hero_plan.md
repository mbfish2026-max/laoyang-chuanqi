# 佣兵 → 传奇英雄 替换方案（merc_to_hero_plan）

> 范围：整套暗夜「佣兵」系统（merc.js 及其散落依赖）下线，由传奇「英雄」接管（同场作战、10 格装备、技能书、怒气合击）。
> 依据：`/workspace/design/chuanqi_v2_plan.md` §1 表（46 行：merc/summon_keep 改造为召唤物框架）、§2.2（64、74 行：英雄同场、英雄面板）、§4.3（177 行）、§4.4 合击（179–180 行）、§11 英雄页（344 行）；样稿 `chuanqi_v2_live/p9_hero.html`（美术进行中）。
> 调查基于 master `d5d3d04`（2026-10-22）。本文只是方案，未改代码。

## 1. 现状盘点：佣兵系统

### 1.1 数据
| 位置 | 内容 |
|---|---|
| `data_acts.js:145` `MERCS` | 4 种佣兵 archer/guard/mage/barb：名字、营地 act、life/def/dmg 成长、str/dex、res、wcats、vars（版本） |
| `merc.js:8-50` | `MERC_V=2`、`MERC_SLOTS`（10 格）、`MERC_SHIELD`、`MERC_WCATS`、`MERC_HIRELV`、`MERC_XPR`、`MERC_NAMES`、`MERC_ART`、`AURAS`（13 种光环）、`RW_AURA`（符文之语光环，符文已在 e1214e5 删除，成死数据）、`MERC_VARS` |
| `merc.js:72-75` | `MERC_GROW`、`MERC_MAIN`、`MERC_SKX` 后期成长 |
| `assets/merc/*.webp`（4 张）、`merc.css` | 立绘 / 样式 |
| `art2_icon3.js:10,32` | `merc_aura`、`merc_recall`、`tab_merc` 图标 |

### 1.2 逻辑（文件 → 函数）
| 文件 | 函数 / 钩子 |
|---|---|
| `acts.js:21-22,118` | migrate：`S.merc` 默认 null；任务 q2「堕落女猎手」完成 → `S.mercU=1` + 免费 `hireMerc('archer')` |
| `acts.js:30,136,145` | 换难度/回城保留 `kind==='merc'` 的 ALLY；zoneClear 时 `mercRevive(1)`；死亡时保留佣兵 |
| `acts.js:112` | calc 包装：guard 旧固定光环（merc.js 已覆盖） |
| `acts.js:151-187` | 旧版 `mercAlive/mercDead/mercAvail/hireMerc/mercRevive/mercStats/canMercEquip/mercEquip/mercUnequip/mercAutoEq/mercTick/allyCard` |
| `acts.js:197` | `step` 包装每帧 `mercTick(dt)`、每 3 秒 `mercAutoEq()` |
| `merc.js` 全文件 | 覆盖上面全部：`mercNorm`（load 包装迁移）、`mercStats`、`calc` 包装（光环加到角色）、`resOf` 包装（信念降抗）、`hireCost/reviveCost/hireMerc/mercDismiss/mercRecall/mercRevive`、`mercGainXp`+`gainXp` 包装、`canMercEquip/mercEquip/mercUnequip/mercAutoEq/mercWScore`、`attackerMods` 包装、`mercTick`、`allyCard` 包装、`mercArmHp`（格挡/减伤 setter）、`hurtAlly`/`floatNum` 包装、界面 `mercPanel/renderMercPage/mercSlotUI/mercCands/mercDelta/render` 包装、`mercAddTab` |
| `items2.js:36-46,68` | `attackerMods(src.kind==='merc')`、压碎/撕裂等命中特效、`mercPanel` 包装 |
| `late.js:36` | 召唤物加成排除 merc |
| `stash.js:43,110` | `resetRuntime` 清 `ACX.mercOn`；`mercUnequip` 覆盖（背包满判定） |
| `lock.js:10,15` | 锁定物品遍历 `S.merc.eq`；`mercSlotUI` 刷新 |
| `prune_mig.js:4,24` | 删除旧物品时遍历 `S.merc.eq` |
| `cowlevel.js:27` | 牛关清场复活佣兵 |
| `summon_keep.js` | 终局 egEnter 保留「非佣兵」召唤物 + 召回骷髅/骨巫/德鲁伊（D2 职业 nec/dru，老羊已无此职业 → 实际只剩排除 merc 的分支，可整体删除或改为道士神兽/法师诱惑宝宝保留） |
| `respec.js:18` | 技能重置时保留 merc ALLY |
| `dmgstats.js:14,22,30,31` | `_merc` 伤害统计行 |
| `audio.js:148-150,279` | merc 音效分类 |
| `gamble_fix.js:11`、`bagkeep.js:16` | 包装 `mercAutoEq` |

### 1.3 页面 / UI 入口
- 暗夜底栏 `#tabs` 的「⚜佣兵」按钮（`merc.js:237 mercAddTab`）→ `TAB='merc'` → `renderMercPage`。
- 老羊壳：`cq/battle_mount.js:83-84` 角色组子页签 `['merc','佣兵']`；`cq/pages_cq.js:71 TOPT.merc`。
- 角色页 `mercPanel()` 小卡（`merc.js:187`）；物品详情里的「佣兵穿戴」路径（`mercSlotUI`）。
- 战斗卡片 `allyCard`（kind=merc）、伤害统计 `_merc` 行。

### 1.4 存档字段
`S.merc={_v,t,v,nm,lvl,xp,hd,eq:{10 格},dead,off,auto,ar,prev,hires}`、`S.mercU`、`S.autoMerc`；运行时 `ACX.mercOn/mst`、`MX.*`。

### 1.5 测试
`tests/merc_late_sim.js`（整文件）、`tests/cq_prune2_test.js:16,25`（S.merc.eq 护身符删除）、`tests/cq_spend_test.js:21`（随从自动复活）、`cq/cq_battle_test.js:127,162`（佣兵子页签断言）。

### 1.6 已有英雄 / 合击（要合并进去的「新家」）
| 文件 | 内容 |
|---|---|
| `cq/cq_hero.js` | `CQ.Hero`：同场单位、怒气 0–100、`COMBO` 六种合击（职业对查表）、`tick/hurt/doHeji/hejiTotal`、`HERO_TUNE`（伤害按玩家 DPS 比例，dpsKBy 分职业） |
| `cq_bridge.js:64-151` | `Host.heroStore()`（S.hero ↔ 旧 localStorage 迁移）、`Host.heroStats/heroK`；CQ.MISSING 里仍写「heroStats 公式是占位」「S.hero.lvl 随角色等级」 |
| `cq/sysapi_cq.js:14-27` | `CQSys.hero/heroSet/heroProfs/heroCreate/heroEquip/heroUnequip/heroStats`；`S.hero={cls,name,lvl,rage,autoHeji,eq,t}` |
| `cq/balance.js:7-8,36-48` | `CQ_BAL.hero`（k/hp0/takesDmg=0/cls 成长）、`budget.hero=0.20`（英雄普攻+合击 ≤ 总伤 20%）、离线 `off.heroK=0.2` |
| `cq/m2_cq.js:35-54` | 离线结算英雄击杀/经验/金币 |
| `cq/cq_scene.js:351`、`cq/hud_cq.js` | 场景 host、左下「英雄」/右下「合击」按钮 |
| 测试 | `cq/cq_battle_test.js`、`tests/cq_sysapi_test.js`、`tests/cq_hero_sim.js`、`cq/cq_hero_balance_sim.js`、`tests/cq_m2_test.js` |
| 原版参考 | `/workspace/chuanqi/web-replica/js/systems/hero.js`（Lv22 解锁、独立等级≤主角、属性=profession 表×成长、生命×0.8、本职业主动技能、10 装备位、休息模式、复活 30 秒） |

结论：**英雄框架已经在 cq/ 跑通**（战斗、合击、存档、装备接口），缺的是：英雄页（p9）、英雄属性/成长真公式、英雄技能、英雄自动换装、受伤与复活规则、与旧佣兵功能（自动换装、复活、装备对比、离线）对齐。

## 2. 目标设计（按 plan + p9 样稿）
1. **解锁**：原版 Lv22 解锁（hero.js `UNLOCK_LEVEL=22`）。老羊现状是任何等级可 `heroCreate`。建议：主线任务（原 q2 位置改为「英雄召唤」任务）或 Lv22 二选一 → 见开放问题 Q1。
2. **职业**：战/法/道任选（`CQSys.heroProfs`），可「更换英雄职业」（p9：保留等级与装备，消耗元宝/金币）。
3. **等级**：英雄等级 = 主角等级（现状）或独立经验≤主角（原版）。p9 写「不再获得经验」→ 采用同步主角等级，删 `MERC_XPR`。
4. **属性**：按 auto_growth_plan 同一张「职业×等级成长表」算（英雄生命 ×0.8，原版 hero.js:24），叠加 10 格装备；替换 `CQ_BAL.hero` 占位系数。最终伤害仍受 `budget.hero=20%` 约束（`HERO_TUNE` 保留为护栏）。
5. **装备**：10 格，同主角部位/职业限制（`CQSys.heroEquip` 已校验职业）；合并佣兵的：候选列表（背包+仓库）、属性差对比（`mercDelta`）、锁定、自动换装（`mercAutoEq` → `heroAutoEq`，复用 `CQSys.equip.autoBest` 的评分）。
6. **技能**：p9：英雄技能靠技能书学会、靠使用涨熟练度升级、「不加技能点、不消耗技能点」。用 auto_growth_plan 的书+熟练度规则，存 `S.hero.sk={id:{lv,exp}}`。英雄只放本职业主动技能（原版 `heroSkills`）。
7. **模式**：攻击 / 休息（原版 `h.mode=='rest'` 不涨怒气）、收回（离开战场）。
8. **受伤 / 复活**：现状 `takesDmg=0`。原版：可死亡，30 秒自动复活（`TUNE.reviveSec`），**无金币复活费**。佣兵的 `reviveCost/自动复活/ar 开关` 全部下线。
9. **光环**：暗夜光环不进英雄（1.76 无此概念）。道士英雄的辅助（治愈术、神圣战甲术）走职业技能。
10. **合击**：沿用 `cq_hero.js COMBO`（M5 前可先开放，见 Q4）。
11. **召唤物**：plan §4.3 要求「召唤物框架复用 merc.js + summon_keep」→ 把 `mercArmHp`（格挡/减伤 setter）、自动换装、`allyCard` 立绘替换这几段**抽出**给道士神兽（项圈 1 格）/法师诱惑宝宝用，其余删除。

## 3. 旧存档迁移（系统，`prune_mig.js` 同风格新建 `hero_mig.js` 或并入 `cq/sysapi_cq.js` load 包装）
运行一次，标记 `S.migHero=1`：
1. **装备退回**：`S.merc.eq` 与 `S.merc.prev` 无装备；把 `S.merc.eq` 10 格逐件 → 英雄可穿则直接给英雄（仅当英雄已存在且该格空且职业/等级符合）→ 否则放背包 → 背包满放个人仓库 `S.pst`/`S.stash` → 都满则写入「邮件/待领取」列表 `S.migBox`（福利页领取），**不丢装备、不折金币**（锁定 `lk` 保留）。
2. **英雄创建**：若 `S.mercU||S.merc.t` 且无 `S.hero.cls`：自动创建英雄，职业按佣兵类型映射 archer→道士？无对应关系，建议 **barb/guard→战士、mage→法师、archer→道士**（或按 `heroProfs()[0]` 并允许一次免费改职业，见 Q2）；名字沿用 `S.merc.nm`。
3. **等级**：英雄等级=主角等级（与佣兵现状一致，`merc.js:57` 已强制 lvl=S.lvl），`xp` 丢弃。
4. **开关**：`S.merc.auto` → `S.hero.autoEq`；`S.merc.ar` 丢弃（英雄自动复活）；`S.autoMerc` 删除。
5. **补偿**：佣兵雇佣/复活花费不退。
6. **清理**：`delete S.merc, S.mercU, S.autoMerc`；ALLY 中 `kind==='merc'` 过滤；云存档兼容：老客户端读到无 `S.merc` 时 `acts.js:22` 会重新免费雇佣 → 迁移需与删除 acts.js 佣兵段**同一版本**发布。
7. 测试：`tests/cq_hero_mig_test.js`（满背包、锁定、prev 召回态、off=1 已解雇、未解锁、重复加载幂等）。

## 4. 分工
| 负责人 | 工作 |
|---|---|
| **系统（你）** | 删 `merc.js`、`merc.css`、`assets/merc`、`summon_keep.js`（或改造后保留，见上）、`acts.js:21-22,30,112,118,136,145,151-187,197` 佣兵段、`data_acts.js MERCS`、q2 奖励改为英雄解锁；清依赖：`items2.js:36-46,68`、`late.js:36`、`stash.js:43,110`、`lock.js:10,15`（改为遍历 `S.hero.eq`）、`prune_mig.js:24`（同）、`cowlevel.js:27`、`respec.js:18`、`dmgstats.js`（`_merc`→`_hero`，由 src 'cqhero'/'cqheji' 归类）、`audio.js`、`gamble_fix.js`、`bagkeep.js`（`mercAutoEq`→`heroAutoEq`）、`art2_icon3.js`；`CQSys`：`heroUnlock/heroChangeCls/heroAutoEq/heroCands/heroDelta/heroMode/heroSkills/heroBookLearn`，`heroStats` 改用成长表；存档迁移 + 测试；index.html 去脚本；删 `tests/merc_late_sim.js`，改 `cq_prune2_test`/`cq_spend_test` |
| **职业开发**（classes.js / cls_*.js / skills.js） | 给英雄提供「同职业技能数值」接口：`clsSV(id,L)` 可传入英雄属性（目前读全局 ST/S）→ 新增 `clsHeroCast(h,stats,id,L,host)`；英雄技能白名单（每职业主动技能、需求等级）；道士英雄治疗主角；英雄技能熟练度增长点（施放 +1） |
| **战斗开发**（cq/） | `cq_hero.js`：英雄技能施放（按 `S.hero.sk` 优先级）、受伤开关 `takesDmg=1` + 30 秒复活、休息/收回模式、英雄普攻改用 `heroStats`（保留 20% 预算 cap）；`cq_bridge.js` 删 CQ.MISSING 两条；`battle_mount.js:83-84`/`pages_cq.js:71` 把子页签「佣兵」换成「英雄」，实现 p9 英雄页（立绘+属性+模式、10 格装备、技能书学习、合击表）；`cq_battle_test.js:127,162` 改断言 |
| **美术** | p9_hero：英雄立绘（3 职业×性别?）、合击图标、子页签图标 `tab_hero`、英雄技能书图标（可复用主角书）；`assets/merc` 下线 |

## 5. 分期
| 期 | 内容 | 验收 |
|---|---|---|
| **P0 准备**（系统） | `CQSys` 英雄接口补齐（unlock/autoEq/cands/delta/mode）；heroStats 接成长表；迁移脚本 + 测试（先不删 merc，迁移函数可空跑） | 测试全绿 |
| **P1 切换**（系统+战斗，同一版本） | 战斗：p9 英雄页替换佣兵子页签；系统：删除 merc.js 及依赖、执行迁移、q2 改英雄解锁 | 老存档进游戏：佣兵装备在英雄/背包/仓库/待领取里，件数一致；无「佣兵」字样 |
| **P2 英雄技能**（职业+战斗+系统） | 技能书/熟练度（与 auto_growth_plan 同规则）、英雄施法、受伤/复活 | `cq_hero_sim`：英雄伤害占比 ≤20% |
| **P3 召唤物框架**（职业+系统） | 道士神兽项圈装备位、召唤物格挡/减伤、终局进场保留（summon_keep 改写） | cls_pet_test |
| **P4 合击/美术** | 合击全屏演出、美术替换占位 | plan M4/M5 |

## 6. 开放问题
- **Q1 解锁**：Lv22（原版）还是主线任务？老存档 <22 级且已有佣兵的是否直接给英雄？（建议直接给）
- **Q2 职业映射**：老佣兵 → 英雄职业按类型映射，还是让玩家首次进英雄页免费选一次？（建议后者，迁移时先放装备不创建）
- **Q3 英雄等级**：同步主角（现状、p9「不再获得经验」）vs 原版独立经验≤主角？
- **Q4 合击开放时间**：plan §4.4 说 M5，现在 cq/ 已可用——是否立即开放？
- **Q5 英雄受伤**：开启 `takesDmg` 会改变难度；是否保留「英雄不死」作为挂机友好设定？
- **Q6 战力**：`CS.power` 英雄装备按 50% 计入，是否保持？
- **Q7 神兽/宝宝**是否也需要装备位（plan 只说狗 1 格项圈）。
- **Q8** 光环类装备词缀（RW_AURA 已随符文删除）确认作废。

## 补充需求：英雄技能单独开关（用户要求）
- 英雄的每个技能都可以单独开关；关闭的技能英雄不会释放（自动施法和合击触发都跳过）。
- 开关状态存档：`S.hero.skOff = {技能id: 1}`，默认全开；旧存档没有这个字段时视为全开。
- 接口：`CQSys.hero.skToggle(id, on)`、`CQSys.hero.skState()`，供战斗开发在 p9 英雄页做开关 UI。
- 施法入口（cq_hero 选技能处）先检查 `skOff`；放在 P2 英雄技能一起做，并加测试。
