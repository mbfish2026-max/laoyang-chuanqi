# 集成审核修复轮 fix1

工作分支 clean-int；对应 docs/diablo_clean_review.md。只在本 worktree 修改，未 push、未合并 d3b7818、未运行 bump，未改产品版本或 SW 缓存名。

## 逐项处理

- 高16、高17 / MUST-FIX-01：mir2_equipment 的有效范围汇总接入迁移装备固定 mag/tao/mdef 与上下限，复用到主角/英雄范围显示和法师、道士实际技能。固定值与范围各计一次；cqLegacy 不进入正常 allMods。
- 高16、高17 / MUST-FIX-01：magicGuard 统一火、冰、雷、魔法、毒伤；hurtHero 包装只应用一次，acts.js 去掉原先毒伤特判及独立任务魔御算法。任务魔御也进入同一计算。魔御取固定扣减与 100/(100+魔御) 两者中保护更强者，保留已有固定魔御的保护能力。
- 高16 / 迁移补偿：增加 cqGuardVersion=1 单次修复标记，覆盖已经 cqCleanVersion=2 的旧档。读取归档防护，仅在迁移时把百分比转换为固定魔御；按旧上限80的保守尺度每点折5固定点，减去已补部分后只增加差额，兼顾多件叠加；原始记录、次数、待选、装备与旧进度不删除。样本 allres:75,ll:7 修复为 mdef:375，1000点各类魔法/毒伤实际损失211，低于旧版250。补偿幂等；未调整首领。
- 高01、高02 / MUST-FIX-02：bonus.js 删除栏目、bxPowers实现与来源说明，删除背包旧护符来源；保留有效技能、套装和现存流派来源。
- 高07、高13 / MUST-FIX-02：cloud.js 同步说明与注释改极品；tianguang 品质字典改极品，删除高阶标签与旧物触发分支。
- 低04 / MUST-FIX-02、REVIEW-01：英雄说明去点数否定句；cowlevel 旧奖励说明清理；bloodmoon 旧详情不输出禁词。game.js 删除被覆盖的技能树/点数弹窗与旧装备详情模板，保留函数挂接接口、材料详情回退、计算接口、技能ID和底材迁移映射；背包旧分类改材料，移除旧难度防护文字和过期注释；pages_cq 删除旧章节注释。
- REVIEW-02：集成测试验证 rf.n===3、k/off为空，继续核验 uid、未知底材原记录、强化、锁定、共享仓库与重载幂等。

## 快速验证

- 所有13个改动JS执行 node --check，通过；git diff --check通过。
- diablo_clean_migrate_test：29通过，包含审核原样本实际 hurtHero、五种伤害、已迁移档修复、幂等、多件叠加、固定值/范围不重计、法师道士实际技能及账号/英雄/加成生成HTML。
- mir2_integration_test 10、mir2_b6_test 32、mir2_bal_short_test 19、mir2_cloud_test 14、diablo_meta_test 20、reforge_test 12、cls_hero_test 22，全部通过；云测试使用内存替身。
- 额外试跑 mir2_equipment_test：未通过。前三项仍要求旧禁止属性、旧数值rf与旧套装行为；第45行读取已移除 bm.ias[0] 时异常中止。本轮不重写整份历史装备测试，不宣称其通过。
- 未运行长模拟，未做浏览器390×844交互/视觉复验；没有调整布局或特效。

## 全仓词表复查及兼容边界

执行 rg 覆盖仓库 JS、HTML、CSS、manifest，关键词包含用户全部禁词。排除 tests 后原始命中173行（其中仍包含 cq/cq_battle_test.js）。逐类复核：本轮指定的日常模板已清；剩余包括 data/data_items/data_acts 的被覆盖历史定义与迁移底材表、过滤正则、一次性旧档迁移提示、内部键/注释、测试，以及获准怪名“暗黑战士”。这些命中不能作为日常可达输出的证据，未批量替换历史ID或归档原记录。未宣称全仓字面零命中或浏览器所有路径验收通过。

保留兼容部分：cqOriginal/cqLegacy/cqUnknown、稳定ID、旧品质数字迁移、已购重铸次数及待选、历史进度；原因是旧档可追溯和不丢权益。没有重新启用禁止属性计算。原始历史数据/注释的全面拆除不在本轮范围；上述旧装备测试需要后续按当前规则专门更新。

必要关联文件：acts.js（统一hurtHero入口，属高17）、tests/mir2_integration_test.js（审核明确要求）、bloodmoon.js/cowlevel.js（旧模板禁词）；其余为审核点名文件及新增说明/迁移测试。
