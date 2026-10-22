# R07 盟重赌石接线

加载 `cq/gamble_cq.css`、`cq/gamble_cq.js`，放在 mir2 装备 install / 全部 killMon 包装之后（index 已接）。独占模块包装 killMon 和 renderShop，不改装备定义与旧赌博。

- 商店自动添加「盟重赌石坊」按钮；地图集成者在盟重安全区 NPC 按钮调用 `CQGamble.open()`。地图入口暂由主线窗口接线，本分支未改共享地图页面。
- `CQGamble.drop(mon, random?)`：正常击杀包装调用；首领/章节首领 35%、精英 champ/uniq 8%，普通怪/复活怪无掉落。档位按 act=0..7 对应基础、沃玛、祖玛、赤月、魔龙、强化魔龙、白金、星王。后续地图可改为调用 `receive(tier, slot)` 显式指定。接入离线奖励时调用 drop，不重复包装。
- `receive(tier, slot)`：只接收当前职业有完整套装结果池的部位；沃玛/祖玛主要为首饰，不编造不存在的头盔/武器。未鉴定物独立保存在 `S.cqGamble.pending`，不占装备背包；不承诺固定怪物掉落部位。
- `pool(tier,slot,cls)` 使用 BASES 的 cqTier/ccls，套装采用 SETITEMS 稳定 content ID；上古/至臻复用 ancApply，不另造装备品质数据。禁用原生成器随机上古，确保公布概率独立生效。
- `identify(1|10,random?)` 返回 `{ok,cost,items}` 或 `{err}`。十连按队列前十件原价之和九折；全部生成且背包可容纳后才扣费、消耗与更新保底。九格展示最近九件，十连完整十件列在结果清单，全部进入背包。
- 地狱概率 55/30/9/5.5/.45/.05%；普通、噩梦将极品及以上乘 .70/.85，差额归精良，稀有固定30%。十连至少极品或以上；连续49次无上古/至臻后，下次强制上古。上古/至臻重置计数。
- `recycle()` 仅回收所有未鉴定物；价格为20000×档位序号（1..8），返还原价10%。§7.5 未指定档位系数、掉落率与回收数值，以上为本模块明确的初版配置，后续平衡只在本文件调整。
- 状态按角色保存，旧档首次访问惰性初始化，不改等级/装备。结果展示只存字符串和品质，无重复领取入口。翻牌0.55秒一次，刷新界面不循环；遮罩空白可关闭。
- 原创背景 `assets/cq/ui/gamble_workshop.png` 由内置 imagegen 生成。

验证：`node --check cq/gamble_cq.js`、`node tests/mir2_gamble_test.js`、相关 cq_migrate/cq_sysapi；`python3 tests/pw_gamble.py` 有限4组合截图到 `/workspace/design/laoyang_m1_shots/codex_gamble/`。本窗口遵从短测限制，不运行全套/长跑。
