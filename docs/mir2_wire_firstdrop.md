# R08 首爆接线

新增 `cq/firstdrop_cq.js/.css`，index 在装备、地图、技能、系统包装之后加载；不需要图像资产。

- `CQFirstdrop.advance(now=Date.now())`：10 分钟粒度闭式补算，120 本地角色，等级封顶60；领先组约提前10%抵达72小时标尺，离线不逐分钟循环。职业、在线时段及活跃系数稳定生成。
- `CQFirstdrop.dropped(item,now)`：稳定 `cqContentId` 匹配 UNIQUES/SETITEMS；rollTC 的最终怪物掉落事件调用。商店购买、生成预览、已有装备不追奖。即使满包自动出售，实际掉落仍参与首爆。
- `S.cqFirstdrop`：角色独立的本地模拟服；start/high/tick、120人、owners、titles、notice 随原存档保存。旧档缺字段时惰性初始化，从接入时刻开服，不改等级。high 是不回退的时间水位；归属与奖励同一次同步操作写入，不存在重复领取入口。不承诺抵抗手工篡改/恢复整个历史存档。
- 每件首爆立即发扩仓券 `ckq ×1` 和永久称号；每称号1%，最多 `CQ_BAL.budget.title` 5%。当前称号存为 active，全部称号展示于首爆图鉴。`bonus()` 无副作用，供 cap 读取。
- `cap_cq.js.statMul` 乘入 title，保留1.8上限。calc 增强攻击、防御、生命、魔法、准确；hurtHero 补入魔御增益；战力显示同步增益，非物理 elMul 增强法术/道术伤害，避免职业漏加或物理双算。
- 地图入口：包装 render 并观察 panel 重绘（地图 install 会替换 renderMap），在 panel 顶部右对齐插入“排行·首爆”；`CQFirstdrop.ui('lv'|'power'|'drop')` 使用现有 modal 空白关闭规则。三榜121人，首爆图鉴按需求等级映射章节（每9级一章，最多7章）。
- 公告统一高水位每60秒最多一条；离线追赶只播最新的一条，不倒灌公告。玩家首爆公告2.6秒单次动画，结束移除DOM。
- 短测 `node tests/mir2_firstdrop_test.js`，UI短测 `python3 tests/pw_firstdrop.py`；不额外跑长期挂机模拟。
