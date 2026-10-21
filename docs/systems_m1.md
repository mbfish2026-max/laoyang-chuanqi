# 老羊传奇 M1 系统层接口说明（给战斗 Bot / 职业 Bot）

加载顺序（index.html）：`data_acts.js → cq/data_cq.js → cq/balance.js → … game.js / stash.js … → cq/sys_cq.js → cq/enhance.js → cq/stash_cq.js → cq/battle_mount.js`。
`window.CQ_DATA===1` 表示老羊数据层生效；旧模块用它跳过 D2 注入。

## window.CQSys（cq/sys_cq.js）
| 成员 | 说明 |
|---|---|
| `sv` | 当前存档版本（CQ_SV=1） |
| `itemCls(it)` | 装备职业：`'zs'|'fs'|'ds'|null(通用)` |
| `equipAttrs()` | 已穿装备汇总属性（含强化加成），键：dmgMin/dmgMax/def/mdef/mag/tao/hp/mp/luck/crit/para/prot/revive… |
| `genItem(ilvl,o)` | 生成装备（品质仅 1 普通/3 精良/5 极品/6 套装） |
| `rollDrops(monId,lvl)` | 掉落结算（战斗引擎击杀后调用；返回物品数组，材料直接入账） |
| `addItem(it)` / `addMat(k,n)` / `matCount(k)` / `takeMat(k,n)` | 背包/材料操作；材料键 `ess`(黑铁碎片) `heitie`(黑铁矿) `zhufu`(祝福油) `ckq`(仓库扩充券) |
| `acts()` / `zone(a,z)` / `monDef(id)` | 第 1 章地图链与怪物定义（等级 1–12，首领 rakecatking / redsnakeking / orclord） |

新属性键 `mag tao mdef luck crit para prot revive` 由系统层产出；**战斗 Bot 负责结算其效果**（麻痹/护身/复活特戒尤其是）。

## 数值框架 window.CQ_BAL（cq/balance.js）
等级上限 60、转生 10、强化 rate/pct/cost、仓库 p0/pMax/s0/sMax；`cqEnhPct(n)`、`cqCapMul(p)`（总倍率封顶 1.8）、`cqBudgetProduct()`。

## 强化（cq/enhance.js）
`cqEnhance(uid,{oil,roll}) → {ok,res:'up'|'fail'|'keep',from,to}|{err}`。+1~+9，失败按 `cqEnhFail(n)` 降级，**永不碎**；`it.en` 为等级，`it.en9` 满级标记。`itemLocal` 已把强化计入攻防，战斗侧直接读最终数值即可。

## 仓库（stash.js + cq/stash_cq.js）
个人页 `S.pstN`（2→6），共享页 `ACCT.shN`（2→8）；`cqStashExpand('p'|'s')`。共享仓拒收 `bind`/`quest`。职业筛选 全部/战/法/道/通用。

## 首领专属
`UNIQUES[i].boss='<bossId>'` 指定专属，bossloot.js 优先使用且不再分给他人。

## 职业 Bot 注意
classes.js 中 D2 技能暂留（已标注），D2 职业底材/词缀注入在 CQ_DATA 下跳过。职业锁定底材用 `ccls`；初始武器 zs 木剑 swd1 / fs 海魂 wand1 / ds 偃月 wand2 + 布衣 arm1。

## 已知问题
- 方案预算连乘 ≈2.07 > 封顶 1.8，以 `cqCapMul` 截断，需策划确认。
- 手镯/护腕分属两个底材组（shield 槽 = 手镯，gloves 槽 = 护腕）。
- 黑铁纯度、转移石未实现；第 2–7 章仍为暗夜数据；ESS_EX 仍出售宝石。
- 系统侧接口总表见 docs/systems_api.md
