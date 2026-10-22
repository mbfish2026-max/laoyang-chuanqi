# 战斗栏

战斗页四格按左一、左二、右一、右二排列。点技能立即施放；未学锁定，缺蓝灰显，冷却显示遮罩与秒数；点空位进入技能页「战斗栏」。在配置页点位置，再选本职业主动技能或留空。已占用技能换位置时交换两格。

角色存档字段 `S.battleSkills` 保存四个技能 id / null，`S.battleSkillsCls` 标记职业。新档及缺失字段的旧档按原战斗栏规则生成：已学自动顺序优先，再按需求等级补主动技能。首次存档即写入，后续学技能不会改变栏位。配置不影响自动施法顺序和开关。

手动施放调用现有 `clsCast`，耗蓝、熟练度、伤害与一次性战场特效沿用原实现。有独立冷却的技能使用 `clsCdLeft`（ACT / GT）；其余使用现有行动计时 H.castT，成功施放后按施法/攻击速度设置行动时间。切换角色清空运行时 ACT，避免前一角色冷却影响当前角色。没有修改技能数值、首领、装备或地图。

验证：`node tests/cq_skillbar_test.js`；`python3 tests/pw_skillbar.py`（390×844，Chromium/WebKit × 新/旧档 × 战/法/道，实际按钮点击、冷却与耗蓝、弹窗空白关闭、配置刷新存读、44px 触控及内容溢出检查）。截图与报告保存在 `/workspace/design/laoyang_m1_shots/codex_skillbar/`，每组合六张：normal / cooldown / nomana / empty / config / picker。
