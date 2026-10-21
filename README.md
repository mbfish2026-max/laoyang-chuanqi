# 老羊传奇

竖屏挂机刷宝的 1.76 传奇。以「老羊传奇」为代码底子，战斗画面另接传奇卡片战场。

- **来源**：从 [idle-arpg](https://github.com/mbfish2026-max/idle-arpg) 当前 main 干净复制（**不保留** git 历史）
- **来源 commit**：`a1501db3062fe437d509df517def1ae60edeaca7`
- **本地路径**：`/workspace/laoyang-chuanqi`
- **版本**：`cq-20261021h`
- **存档前缀**：`cq_` / SW 缓存名 `cq-*`（与暗夜 `anye-` 隔离）
- **云存档表**：`public.cq_saves`（见 `sql/laoyang_saves.sql`，需管理员在 Supabase 执行）

本地预览：`python3 -m http.server` 后打开 `index.html`。

设计方案：`/workspace/design/chuanqi_v2_plan.md`。战斗挂载点见 `docs/battle_mount.md`。
