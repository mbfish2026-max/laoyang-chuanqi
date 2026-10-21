# M0 依赖图与剥离记录（老羊传奇）

来源：idle-arpg `a1501db3062fe437d509df517def1ae60edeaca7`（见 SOURCE_COMMIT.txt）

## 保留（直接复用）
- 核心：game.js, items.js, items2.js, loot.js, shop.js, data*.js, acts.js
- 背包/仓：stash.js, stashux.js, stash_equip.js, bagux, bagkeep, sort, lock, salvage, compare, cmp2
- 刷宝：ancient.js, reforge.js, tianguang.js, bossloot.js, dmgstats, auto_status, offpeek
- 云/设置：cloud.js, login_flow.js, applock, settings, audio.js, sw.js, power.js
- 终局壳（M1+ 改皮）：eg_*, uber*, bloodmoon, cowlevel, merc（召唤框架）

## 剥离（本 M0）
| 批次 | 文件 | 原因 | 替代 |
|------|------|------|------|
| A | cubeux.js | 炼金匣关闭 | 从 index 移除 |
| B | rwx.js, rwx_craft.js, rwx.css | 符文之语 UI 关闭 | 从 index 移除；RUNES 数据暂留（掉落逻辑兼容），M1 再清 |
| C | art2_atmo.js/css, art2_char.js, art2_hook.js | 暗夜战斗画面不带入 | `#cqStage` 挂载点 + cq/battle_mount.js |
| D | amazon/druid/paladin/nec_build/cls_build/pw_build/classes2 | D2 扩展职业 | 从 index 移除；classes.js 缩为战/法/道占位 |
| E | art_nec_icons / 部分职业美术映射 | 随职业剥离 | 保留 art2_icon* 挂载机制 |

## 测试策略
每删一批 → `node --check` 改动 JS → 跑 `tests/*_test.js`（依赖已删系统的测试删除或改断言）。

## 执行记录（M0）
- A 删除 cubeux.js → index 移除
- B 删除 rwx.js / rwx_craft.js / rwx.css；删 tests/rw*_test.js
- C 删除 art2_atmo/char/hook；接入 cq/battle_mount.*
- D 删除 amazon/druid/paladin/nec_build/cls_build/pw_build/classes2/art_nec_icons/legend；classes 改为 zs/fs/ds；删 cls_bal/clshpk/clsfilter 测试；index 去掉 art_cls_icons/build_manual/clsfilter
- 存档前缀 cq_；SW V=cq-20261021a；云表 cq_saves
- 删 tests/pb_test.js、bonus_test.js、pb_sim.js、nb_sim.js（依赖 nec_build 流派/威能套装 NB）；items_test 改用 zs；light_bases 去 RWX 断言
