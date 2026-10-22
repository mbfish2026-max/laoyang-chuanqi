# R05 召唤物接线

`summon_keep.js` 的 `skpWire(CQSys)` 由 `cq/m2_cq.js` 在系统接口注册完成后调用。
`S.summons` 保存身份、技能、血量、死亡时间、项圈和原技能/怪物基础属性；`ALLY.summonId` 关联战斗单位。英雄召唤物不参与此映射。

- 道士骷髅/神兽共用持久身份，升级形态保留项圈；技能 1/4/7 为幼体/成长/金色，保留旧高等级。法师技能 7 级双宝宝，系统上限同步。
- step 前投射、step 后记录死亡；save 前记录血量；load/reset 切断旧角色引用。终局 egEnter 后重建，不免费复活死亡宝宝。
- 项圈生命/攻击叠加在旧技能强度之上，防御写入 ALLY.def。game.js 怪物攻击召唤物分支将物理伤害减去防御，最低 1；元素抗性分支沿用原逻辑。
- m2_cq.js：移除前检查项圈锁定/背包容量；替换拒绝锁定物品，采用背包原位腾格换装；伤害预算识别真实 cqpet 对象来源。
- 对外接口 `CQSys.summonSync()` 可立即同步；装备、等级、复活、移除接口成功后自动同步保存。

短测：`node tests/mir2_summon_test.js`；浏览器截图/报告见 `/workspace/design/laoyang_m1_shots/codex_summon/`。无长时间平衡模拟。

验收：47 个 `tests/*_test.js` 全部通过，`cq/cq_battle_test.js` 219 项通过；新增召唤短测 11 项通过。`python3 tests/pw_baseline.py` Chromium/WebKit × 390×844/375×667，0 问题。`python3 tests/pw_summon.py` 两浏览器 × 新档/旧档 390×844，关联及无异常检查通过。英雄并存测试原来用战士直接召骷髅，现将正式工厂测试角色改成道士。
