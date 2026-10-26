# 装备对比修复

工作基线：master `6ef7fa7`（线上 `cq-20261022b`）。仅在 `/workspace/cqx-fix-compare` 的 `fix-compare` 修改；复用已有 worktree。没有合并 `d3b7818`，没有修改 master、推送或发布。

## 丢失原因与提交定位

使用 `git diff af6bfe1 6ef7fa7 -- compare.js cmp2.js bagux.js cq/mir2_equipment.js cq/hero_page.js cq/gamble_cq.js cq/mir2_b6.js`，并向前追踪 `git log -S 'const show=showItem' -- cq/mir2_equipment.js`、详情渲染安装顺序。两端 compare.js/cmp2.js/bagux.js 未改动，不能把清理批次判为首次回归。

确切原因：`51272c9` 编写了 `CQMir2Equip.install()` 内的全新 `showItem`。装备分支直接调用 `modal()`，没有调用此前保存的 `show`；只有非装备分支才走旧函数。`ae14bd9` 首次在 index.html 中安装它，安装位置晚于 compare.js、cmp2.js、lock.js、ancient.js、reforge.js 等包装，从而绕过自动对比和详情附加信息。这个接入提交是可运行页面首次失去自动对比的提交。

`713c16a` 的背包详情还会设置 `CMP_BUSY=1`。`33a72f1` 后来修补了显式 `cqbCompare`，克隆新详情后附加旧差异表，却没有恢复普通点开自动对比。清理批次修改属性白名单和文案，没有移除这个显式入口。

`python3 tests/compare_fix_history.py` 将历史 JS/CSS/index 导出到临时目录，使用本地 Chromium、全新角色、同底材武器重现，不切换工作分支：

| 历史版本 | 普通 showItem 自动对比 | 显式 cqbCompare |
| --- | --- | --- |
| ae14bd9 第一父提交 b0f2ced | 有 | 尚无该入口 |
| ae14bd9 | 无 | 尚无该入口 |
| 33a72f1 | 无 | 有 |
| af6bfe1（cq-20261021z） | 无 | 有 |
| 6ef7fa7（cq-20261022b） | 无 | 有 |

入口审计：背包、个人/共享仓库、商店 shopPeek 均通过最终 showItem，因而受详情覆盖影响；商店只是临时提供可查物品，不是独立比较器。`ca09207` 的英雄装备选择原本直接穿戴，没有详情比较；`8ca83b1` 的赌石结果只保存名字与品质，没有结果 UID；`bc1329e` 的融合/部位淬炼弹窗原本没有详情入口。这三类是原有缺口，本次一起补齐，不伪记为清理删除。淬锋原先有候选满值金边，继续保留，并补上与当前装备比较。

## 恢复内容

- 新增最终加载的 `cq/compare_cq.js`，从最终传奇详情追加比较，不克隆旧面板、不试穿、不调用 calc、更不写装备或存档。
- 仅输出攻击、魔法、道术、防御、魔御、准确、敏捷、幸运和生命/魔法上限。区间格式如 `攻击 0-5 ↑`；上升绿、下降红、两端一升一降显示双色语义的金色 `↑↓`，同时列出当前值和差值。
- 主角对照 S.eq，英雄对照自己的 eq、职业和等级。戒指与手镯各列左右两槽，空槽显示“空槽，可直接穿戴”。英雄候选改为图标和详情入口，修正原有 ring 存档写入错误，明确写入 ring1/ring2，并校验英雄等级。
- 背包、个人仓库、共享仓库、商店详情自动展示；赌石新结果保存 UID，可以点详情；已离开容器的结果不展示失效按钮。旧结果只有名字时保留原展示，不猜测物品。
- 融合、部位淬炼提供已存在装备的详情/对比入口；淬锋主弹窗直接展示比较。未鉴定物尚无装备属性，不虚构比较结果。
- 恢复详情中的套装当前件数、各档“已激活/未激活”提示；英雄按英雄已穿件数计数。
- 恢复极品属性满值金边，兼容现有上古属性区间；原有淬锋候选 `.rfo.full` 金边保持。
- 恢复穿戴详情锁定入口、英雄详情锁定入口、回收保护原因提示。继续使用原 `toggleLock`、`rcyProtected`、`cqbRecycle`，锁定/套装/首领专属等原保护规则不变，受保护物品的回收按钮禁用。

## 列表升级箭头与共用比较器（A/B）

`CQCompare.compare(item, eq, onlySlot)` 是战力差和图标箭头的共同入口，返回目标槽、当前装备、战力差、职业/等级资格和 better。`html()` 通过它逐槽显示战力差，`arrow()` 通过它生成绿色小箭头。双槽列表选空槽或战力较弱者；两槽详情仍分别比较。

调用游戏现有 `power()`，没有另造评分公式。为通用底材增加可选的比较角色职业参数，英雄按自身职业计算；原来只传物品的调用保持原口径。比较属性来源是现有传奇属性系统。

背包/仓库复用 cell → cellG → cqbCell 的图标渲染链；英雄候选使用相同 arrow。职业不符或等级不足均不显示，空槽算提升。箭头右上角 14px、pointer-events:none，保持原点击/长按链。

战力以 WeakMap 按物品对象缓存；序列化签名检测原地修改的强化、词缀、属性和版本变化，职业也是缓存键。反复绘制不重复执行 power；不对整个仓库逐格重新计算战力，只绘制当前页。换装及角色切换沿用原 render 立即生成新箭头；英雄候选在 render 和 hero/char 事件后刷新。缓存不进入本地/云存档，不阻止旧物品回收。

## 移动端与验证

390×844：详情操作按钮强制一行，最小 44×44；必要时横向滚动，按钮文字不换行。修复后样式选择器覆盖 cq/ui_cq.css 的旧三列规则。详情可纵向滚动；继续使用原 300ms 防误触的背景关闭机制，赌石背景保持可关闭。新脚本和修改过的脚本更新 URL 版本参数，避免命中旧静态缓存。

验证通过：

- `node --check cq/compare_cq.js cq/mir2_equipment.js cq/sysapi_cq.js cq/gamble_cq.js`（实际逐文件执行）。
- `node tests/compare_fix_test.js`：21 项，覆盖空槽、双槽、英雄自身等级/职业、原评分一致性、缓存复用/原地变更/职业变更失效、比较不改状态、英雄戒指槽和保护。
- 相关 Node 测试：mir2_equipment_test（581）、cq_hero_system_test（16）、cq_sysapi_test（34）、mir2_gamble_test（38）、mir2_b6_test（32）、recycle_mir2_test（23）、mir2_sets_test（43）、reforge_test（12）、cq_stash_test（19）。合计含新增 819 项通过。
- `python3 tests/compare_fix_browser.py`：Chromium/WebKit、390×844、触屏，通过背包/个人及共享仓库/英雄/商店/赌石/融合/淬炼/淬锋入口、双戒指、满值金边、锁定回收禁用、按钮同一行及 44×44、空白关闭、等级变化后的箭头刷新、pointer-events，以及新增显示内容的词汇检查。两个引擎均无 pageerror。
- `python3 tests/compare_fix_history.py`：上述历史边界复现。
- `git diff --check` 通过。浏览器截图输出到 `/tmp/compare_fix_chromium.png`、`/tmp/compare_fix_webkit.png`。

## 独立验收失败修正（2026-10-26）

基于 `e1082ac` 复现 `docs/compare_test.md` 中的失败：`cq_enh_detail_test.js` 创建的英雄为 1 级，而生成的 `BASEM.shd1` 手镯实际要求 5 级。`CQSys.heroEquip` 返回“英雄等级不足”，未执行双槽穿戴。原因是测试夹具没有满足新增的英雄等级限制，并非双手镯业务回归；未修改业务代码或降低装备等级要求。

修正夹具时，先验证低等级英雄被拒绝、物品仍在背包且目标槽为空，再按两件手镯 `itemReq` 的最大需求提升英雄等级，断言两次接口成功且分别返回 `gloves` / `shield`，保留原双槽装备对象断言。该测试现为 13 pass、0 fail。

将已有但未提交的 `docs/compare_review.md` 原样纳入本次提交；其中审核对象和历史验证结论保持原记录。`docs/compare_test.md` 也保留当时 FAIL 的独立验收记录，本节记录后续修正与复验。

本次全量复验：按文件逐一执行 `node tests/*_test.js` 对应的全部 60 个测试文件（每个进程设置 120 秒超时），60/60 通过；`ancient_test.js` 耗时 32.92 秒，未超时。另执行 `node cq/cq_battle_test.js` 通过，总计 61/61 文件通过、0 失败。`git diff --check` 通过。仅提交到 `fix-compare`，不推送。
