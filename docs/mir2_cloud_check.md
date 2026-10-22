# R17 云存档本地短验

日期：2026-10-22。工作目录：`/workspace/cqx-cloud`（mir2-cloud）。

## 范围与结论

核对 `cloud.js`、`stash.js`、`cq/sysapi_cq.js`、`sql/laoyang_saves.sql`；以真实游戏脚本 + 内存 Supabase 桩验证读写、切角色、共享仓与多设备冲突。浏览器所有 Supabase 请求均拦截；未部署、未操作真实云库，未 push、未运行 `tools/bump.sh`，未合并或 cherry-pick `d3b7818`。

本地可测路径通过。发现并修复四处风险：

1. 离页 keepalive 请求之前不等响应就推进本地版本并清除 dirty；失败可能被当作同步成功。现等待成功响应才确认版本，失败恢复 dirty 并安排重试，同步期间新修改保留 dirty。
2. 离页请求与常规上传可能同时写。现共享 `CL_BUSY`，并且两个路径都用 `user_id + updated_at + version` 条件更新，避免相同毫秒时间戳下覆盖另一设备进度。空更新结果触发停止写入，首次插入的唯一键冲突也停止写入。keepalive 大小按 UTF-8 字节计算。
3. 旧档迁移上传返回 kicked 时仍清理旧档。现直接返回，保留迁移源。
4. 仓库合并时导入物品的较大 UID 没有推进计数器。现推进，避免之后分配物品 UID 碰撞；既有去重、冲突重编号和满页顺延保持有效。

## 存储契约

- 表：`public.cq_saves`，不是 `public.saves`。`user_id uuid` 为主键、关联 `auth.users`，删除账号级联删除；`data jsonb NOT NULL`，`version int NOT NULL DEFAULT 1`，`updated_at timestamptz NOT NULL DEFAULT now()`。
- SQL 开启 RLS；select/insert/update/delete 限制 `auth.uid() = user_id`，authenticated 获得对应权限。这里只静态核对 SQL，未执行 SQL 或验证线上 RLS。
- `fetchRemote(true)` 读取 `data,updated_at,version`；常规写入走 Supabase insert/update，离页走 `/rest/v1/cq_saves` PATCH。
- `data` 为 `{fmt:1, acct, chars, extra, profile, at}`。`acct` 包含当前角色、角色列表、共享仓页及 UID 计数；`chars[id]` 为各自角色数据（背包、个人仓、装备等）；`extra` 当前导出排行榜 `cq_eg_rank`，`profile` 为昵称快照。
- 运行中游戏数据在 `GS` 内存键 `cq_acct` / `cq_ch_<id>`（支持已有命名空间）及当前角色镜像中。登录会话另存 localStorage / IndexedDB，不等于游戏数据持久化。
- 导入先写账号、全部角色及 extra，再载入当前角色；切角色先保存原角色，再载入目标角色，账号共享仓独立于单个角色。
- 旧 localStorage 存档按角色合并；相同身份取进度更高者，个人仓和共享仓合并去重。云端确认迁移成功后才清理旧键。

## 验证

- 改动的三个 JS（`cloud.js`、`tests/mir2_cloud_test.js`、`tests/cq_ui_test.js`）逐一 `node --check`：通过。
- `tests/*_test.js` 全部 52 个文件：全部通过。
- `node cq/cq_battle_test.js`：219 项通过，0 失败。
- `node tests/mir2_cloud_test.js`：14 项通过，0 失败。覆盖载荷结构、既有云档读取、双角色/共享仓往返、普通上传失败、版本冲突、首次插入竞争、离页互斥/成功/失败/空响应、迁移冲突保留旧档、合并 UID。
- `python3 tests/pw_cloud_check.py`：Chromium / WebKit × 新档 / 旧档，共 4 组通过；390×844，0 页面异常。角色通过 `CQSys.createChar(name, cls)` 创建。旧档由游戏导出结构生成，迁移后等级 7 与旧键清理均断言；远端只递增 version 的冲突验证远端 data 未被覆盖。
- `python3 tests/pw_baseline.py`：Chromium / WebKit × 390×844 / 375×667 共 4 组通过，0 新问题，0 fatal；既有缺失资源与预期云表缺失情景按基线规则单列。
- `git diff --check`：通过。

原 `cq_ui_test.js` 对 beacon 的 `.catch()` 字符串断言不适用于 `await + try/catch`；删除该实现形式断言，由上述可执行失败桩测验证异常处理。

## 截图与报告

产物为本地忽略文件，不进 Git：

- `test-artifacts/r17-cloud/{chromium,webkit}_{new,legacy}.png`：新档/旧档迁移画面。
- `test-artifacts/r17-cloud/{chromium,webkit}_{new,legacy}_conflict.png`：冲突保护提示。
- `test-artifacts/r17-cloud/report.json`：专项浏览器报告。
- `test-artifacts/worktree/{chromium,webkit}_{390x844,375x667}/`：基线各页面、迁移、弹窗截图。
- `test-artifacts/worktree/report.json`：全量浏览器基线报告。

## 未验证边界

没有对真实 Supabase schema、线上 RLS、跨真实设备登录及真实弱网做验收；桩测能证明客户端条件写入与失败处理行为，不能替代服务端权限验证。关闭页面后的网络发送仍是浏览器 best effort；断网后立即关闭页面时，未成功上传的内存进度无法保证保留。已有客户端若仍使用旧的仅时间戳条件，不能获得新增的 version 条件保护。此次不修改 UI、游戏平衡、等级或角色迁移规则。
