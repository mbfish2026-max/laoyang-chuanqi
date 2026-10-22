# 老羊传奇系统层接口说明（M1基础与当前覆盖层）

加载顺序（index.html）：`data_acts.js → cq/data_cq.js → cq/balance.js → … game.js / stash.js … → cq/sys_cq.js → cq/enhance.js → cq/stash_cq.js → cq/battle_mount.js`。
`window.CQ_DATA===1` 表示老羊数据层生效；旧模块用它跳过 D2 注入。

## window.CQSys（cq/sys_cq.js）
| 成员 | 说明 |
|---|---|
| `sv` | `sv()` 返回当前存档版本（CQ_SV=6） |
| `itemCls(it)` | 装备职业：`'zs'|'fs'|'ds'|null(通用)` |
| `equipAttrs()` | 已穿装备汇总属性（含强化加成），键：dmgMin/dmgMax/def/mdef/mag/tao/hp/mp/luck/crit/para/prot/revive… |
| `genItem(ilvl,o)` | 生成装备；传奇装备覆盖层会参与底材/品质选择，不能按早期M1的品质子集限制调用方 |
| `rollDrops(mon)` | 掉落结算（战斗引擎击杀后调用；返回物品数组，材料直接入账） |
| `addItem(it)` / `addMat(k,n)` / `matCount(k)` / `takeMat(k,n)` | 背包/材料操作；材料键 `ess`(黑铁碎片) `heitie`(黑铁矿) `zhufu`(祝福油) `ckq`(仓库扩充券) |
| `acts()` / `zone(a,z)` / `monDef(id)` | 当前七章地图/怪物定义；后加载的 `mir2_maps.js` 覆盖旧章节与首领归属 |

新属性键 `mag tao mdef luck crit para prot revive` 由系统层产出；**战斗 Bot 负责结算其效果**（麻痹/护身/复活特戒尤其是）。

## 数值框架 window.CQ_BAL（cq/balance.js）
等级上限 60、转生 10、强化 rate/pct/cost、仓库 p0/pMax/s0/sMax；`cqEnhPct(n)`、`cqCapMul(p)`（总倍率封顶 1.8）、`cqBudgetProduct()`。

## 强化（cq/enhance.js）
`cqEnhance(uid,{oil,roll,ore}) → {ok,res:'up'|'fail'|'keep',from,to}|{err}`。+1~+9，失败按 `cqEnhFail(n)` 降级，**永不碎**；`it.en` 为等级，`it.en9` 满级标记。`itemLocal` 已把强化计入攻防，战斗侧直接读最终数值即可。
- `ore` 缺省 `heitie`（纯度10，旧矿不变）；`heitie15` / `heitie20` 分别加 5 / 10 个百分点成功率，最高100%，耗矿数量不变，分别独立堆叠。
- 普通黑铁掉落保留；精英额外15%掉纯度15，首领额外50%掉1–3块高纯矿，其中25%为纯度20；首领10%掉转移石 `zhuanyi`。
- `cqEnhTransfer(fromUid,toUid)`：同部位（两侧手镯视为同部位），原强化至少+2，目标必须低于转移结果；消耗1转移石，原强化归零，目标变为原等级减1。校验失败不扣料。
- +9装备入场后播放1.2秒CSS光效并移除；地图入场/战场初建触发，重绘和属性计算不重播。

## 仓库（stash.js + cq/stash_cq.js）
个人页 `S.pstN`（2→6），共享页 `ACCT.shN`（2→8）；`cqStashExpand('p'|'s')`。共享仓拒收 `bind`/`quest`。职业筛选 全部/战/法/道/通用。

## 首领专属
`UNIQUES[i].boss='<bossId>'` 指定专属，bossloot.js 优先使用且不再分给他人。

## 职业 Bot 注意
classes.js 中 D2 技能暂留（已标注），D2 职业底材/词缀注入在 CQ_DATA 下跳过。职业锁定底材用 `ccls`；初始武器 zs 木剑 swd1 / fs 海魂 wand1 / ds 偃月 wand2 + 布衣 arm1。

## 已知问题
- 总倍率上限1.8；历史预算连乘约2.07并非最终实战结论，持续伤害/机制套装与完整成长收益仍需R16验收。
- 左右手镯保留旧键 shield/gloves；任意 bracelet 底材可穿任一侧。手动可选左右，自动替换空位或较弱侧，英雄同样支持。
- 黑铁纯度与转移石已实现（R06）；七章由传奇数据层覆盖。宝石镶嵌不在范围，旧模块字符串不能当作已开放功能。
- 系统侧接口总表见 docs/systems_api.md

## 当前覆盖层（master b042567）

本页加载顺序是M1节选，完整顺序以 `index.html` 为准：`mir2_maps.js` 覆盖七章；`mir2_equipment.js`、装备迁移、`mir2_loot.js`、`mir2_sets.js` 提供装备/套装；`mir2_skills.js` 与职业脚本提供技能；`mir2_progression.js` 覆盖60级成长与固定转生。赌石、首爆、器魂、召唤接线、异变、终局已加载，详见 `systems_api.md` 与各 `mir2_wire_*.md`。

采用1.80英雄合击规则、1.76基础数据；不做内功心法/宝石镶嵌，不加属性点/技能点。英雄22级解锁、独立经验追级；技能最高9级。赤月之后为魔龙、强化魔龙、白金、星王。旧档迁移保留成长与装备，不以显示等级压缩削弱旧角色。
