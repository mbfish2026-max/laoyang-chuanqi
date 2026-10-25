# 老羊传奇

浏览器单机挂机传奇，战士、法师、道士，传奇七章、技能书、英雄与合击。当前规则见 [DESIGN.md](DESIGN.md)，待办见 [TODO.md](TODO.md)。

浏览器通过 index.html 启动。游戏存档在内存 GS 与云端 SQL 表 cq_saves；新存储键统一 cq- 前缀，旧 cq_ 键只读迁移。登录态同时持久化至 localStorage 和 IndexedDB。

旧装备、进度、购买次数必须保留；禁止属性只在迁移层一次性折成传奇属性，原始记录供核对，不重新参与有效计算。品质与装备迁移由对应装备模块维护。

历史文档在 [docs/archive](docs/archive/)，不作为现行规则。meta 清理范围与验证见 [docs/diablo_clean_meta.md](docs/diablo_clean_meta.md)。
