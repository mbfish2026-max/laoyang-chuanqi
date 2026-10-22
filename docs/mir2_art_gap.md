# R18 缺图盘点与补图

盘点日期：2026-10-22。依据 `/workspace/design/mir2_ref/gap.md` 的地图、装备、技能范围，采用已定案的 1.80 英雄合击内容；本次只补显示缺图，不改变玩法数据。

## 本次修复：真实缺图

旧 `cq/pages_cq.js:zImg()` 按章/区域序号拼接路径，前三章已有 7/8/9 个区域，图文件却只有 7/6/6 张。运行时由 `CQMir2Maps.installUI()` 接管，原适配器只给第四章以后显示章节共用图，前三章列表和预览没有区域图。本次在 `cq/mir2_maps.js` 接入前三章已有区域图，并补齐以下 5 张缺图；第四章以后继续使用已有章节图。

|文件（均在 assets/cq/map/）|场景|原状态|处理|
|---|---|---|---|
|zone_2_7.webp|沃玛寺庙二层|路径缺失，适配器尚未接图|imagegen 原创补图|
|zone_2_8.webp|沃玛寺庙三层|路径缺失，适配器尚未接图|imagegen 原创补图|
|zone_3_7.webp|毒蛇矿区|路径缺失，适配器尚未接图|imagegen 原创补图|
|zone_3_8.webp|蜈蚣洞|路径缺失，适配器尚未接图|imagegen 原创补图|
|zone_3_9.webp|死亡山谷|路径缺失，适配器尚未接图|imagegen 原创补图|

生成方式、完整提示词与输出规格见 `assets/cq/map/r18_generation.json`。使用内置 imagegen；无外部素材拷贝。保留其余已有图片。

## 仍有的 404：旧预加载表

`data.js` 的 ASSETS 经 `game.js:loadAssets()` 无条件预加载下列 17 个缺失文件；`tests/pw_baseline.py:KNOWN_404` 已登记。它们不在 assets/cq 中，属于旧渲染路径，当前传奇页面有自己的图片/回退。不能以补齐同名旧精灵表的方式认定已完成传奇化；本次不生成无效占位图，也不修改基线白名单。

|用途|仍缺路径|
|---|---|
|旧背景|assets/bg/moor.png、cave.png、graveyard.png、forest.png、ruined_village.png、tower.png、monastery.png、jail.png、cathedral.png、catacomb.png|
|旧技能精灵表|assets/icon/skills_summon.png、skills_bone.png、skills_curse.png|
|旧物品/符文精灵表|assets/icon/items_sheet.png、runes_gems_sheet.png|
|旧面板/边框|assets/ui/stone_panel.png、gold_frame.png|

## 占位、共享图与暗黑残留

|位置|现状/影响|本次处理|
|---|---|---|
|cq/pages_cq.js MAPN=3、mapPage()|旧模板只展示前三章，第四章写“敬请期待”；运行时七章适配器已替换 renderMap，因此不是当前显示缺陷|保留旧模板，避免将未运行代码误判为在用占位|
|cq/pages_cq.js CHB|旧模板第二章卡用 zombieking、第三章用 stonezombieking，与新数据不一致；当前适配器不使用 CHB|记录为未运行的旧图引用|
|cq_bridge.js monArts()|按怪物 key 猜 `mdl_mst_<key>.png`，未知 key 允许失败后转名字映射/通用骷髅或教主；不代表每个候选都应画图|100 个在用区域怪物/精英/首领的首选路径已有文件；不机械补候选|
|assets/cq/icon/mir2/ 装备图|高阶及不同职业装备按部位共享图族，并非每件有独立造型；manifest 已有映射|有显示，保留；参见 docs/equip_icons_cq.md|
|art_map.js / art2_map.js / icon2.js|保留旧章节沙漠/丛林/地狱/冰原、符文宝石、亡灵特效和旧装备映射；旧详细面板仍可能使用|记录旧美术残留；不批量重画，不增加宝石玩法|
|assets/cq/ui 数字模型与旧技能图|现有素材包含历史引入资源，本次没有重新导入或复制。文件存在不能当作原创来源证明|保留并明确来源审计仍需单独处理；新增仅 imagegen 原创|

## 核查方法与边界

- 原有 assets/cq 共 706 个文件；根目录与 cq/ 的非测试 JS/CSS 中共 415 条唯一 assets/cq 字面路径（含 jpg），缺失 0。另核对动态拼接路径，以及运行时 ACTS、CQ_MONART、CQ.Host.monArts()、SKM、装备 manifest。
- 使用 `CQSys.createChar('素材检查','zs')` 建测试角色；按当前 ACTS 遍历区域怪物和首领，共 100 个唯一 key，首选立绘文件均存在。
- 新增 mir2 技能 `sk_<id>.png` 均存在；技能书、原有装备图与 UI 杂项由 cq_icons_test / mir2_skills_test / mir2_equipment_test 复核。
- 图片存在与解码通过不代表所有旧素材已完成人工视觉/版权审计。本清单不宣称全库都已替换成原创。
- 390×844 Chromium/WebKit 新建角色和存档重载检查，以及完整基线结果见下方验收记录。

补充：对 assets/cq 中全部 677 张 PNG/JPEG/WebP 执行完整解码检查，无损坏文件或小于 8px 的空白尺寸占位。前三章 24 张区域缩略图路径全部存在。

## 验收记录

- 修改 JS：`node --check cq/mir2_maps.js` 通过。
- `tests/*_test.js`：51 个脚本全部通过（含 cq_icons_test 的 150 项图标检查）。
- `node cq/cq_battle_test.js`：219 pass，0 fail。
- `python3 tests/pw_baseline.py`：Chromium、WebKit × 390×844、375×667 全部完成，新增问题 0；17 项旧预加载白名单未变。报告：`test-artifacts/worktree/report.json`。
- 专项：Chromium、WebKit × 新档、旧档，390×844；用 CQSys.createChar 创建角色，旧档由真实导出结构设置 Lv35、sv=0、移除迁移标记后从旧 cq_ 存储键加载，迁移后仍 Lv35。每个场景校验 5 张补图解码和地图内缩略图加载，另校验死亡山谷传送预览、点空白关闭。
- 截图：`test-artifacts/r18/{chromium,webkit}_{new,legacy}_chapter{2,3}.png` 和同前缀的 `_preview.png`，共 12 张。专项报告、复测脚本及日志同目录（不纳入 git）。
- 无玩法/数值变更；无 push，未运行 tools/bump.sh，未合并或 cherry-pick d3b7818。
