# ui 组暗黑残留清理

分支：clean-ui；仅在 /workspace/cqx-clean-ui 工作。用户本次要求优先于早期设计待定项。

## 负责条目

| 条目 | 改动 | 兼容保留与边界 |
| --- | --- | --- |
| 高01 | game.js 提供 heroDisplayAttrs；cq/pages_cq.js 的最终动态首屏直接使用它。删除 mir2_equipment.js 较早安装的角色 DOM 改写，消除覆盖顺序和旧面板残留。只展示八属性及生命、魔法值。 | 只改展示，不改装备、存档、购买次数、成长与战力计算。防御继续显示当前 ST.def，魔法/道术/魔御使用现有 equipRanges。 |
| 高02 | game.js 详细区替换力量/体力/精力、元素抗、偷取、速度断点及百分比表；late.js 删除角色页增伤说明包装；自动成长说明删除点数词语，自动出售说明删除旧槽位词语。 | late.js 内部成长与伤害实现保留，交数值/迁移组处理；不以隐藏面板宣称已修复有效计算。game.js 任务列表与任务奖励执行逻辑未改。 |
| 高03 | ASSETS.hero 指向 assets/char/zs_portrait.webp，战士缺图占位改剑；生成原创人类战士立绘覆盖该资源，同时覆盖角色首屏与职业头像已有同路径消费者。 | 保留 heroArt 调用接口与法师、道士图片；旧图片文件未批量删除。 |
| 高04 | 更新 icon180/192/512.png 和 favicon.ico；index 显式声明 favicon；manifest 补充180图引用，保留192/512。 | 应用名称、版本号、SW缓存名不变。未发布；旧安装缓存是否更新需后续发布流程验收。 |
| 中04 | art.css 的 .gp/.ipanel 改暗金红金属渐变边框，使用新生成饰片；标题去掉旧西式标题图。按钮行单行、横向滚动，触控最小尺寸沿用44px。 | 其他导航、战场卡框等非本条目皮肤保留。新饰片无动画；背景关闭沿用 bagux 的300ms防误触机制。 |
| 中05 | audio.js 的 sched/sfx/playSkill 不再走旧合成曲、掉落钟群、技能合成回退；audio_cq 缺采样、解码失败、首领/地下城/血月无素材均静默接管。 | 保留音频总线、音量/静音、解锁、现有传奇采样和独立命中/盟友音效。旧合成曲定义目前不可由 sched 调用，未为精简而重写总线。未进行真人听辨验收；静默路径用探针验证。 |
| 低05 | 全库调用检索后，移除 data.js 的 items/runes/ui_stone/ui_frame 四个无消费者映射，避免 loadAssets 无效预加载；index 不再加载无外部调用的 art2_map.js。 | ASSETS 背景/召唤物、art_map 装备/材料/背景、art_icons3 回退包装仍有消费者，未盲删。skills_* 表仍被 game.js/skills.js 回退读取，保留。art2_map 源文件及旧位图仍留仓库；SW文件未改，旧缓存资源清单由对应组处理。 |

## 新图与生成方式

使用内置 imagegen，随后按用户授权用 Pillow 转尺寸/格式；目检三张输出，无骷髅、亡灵。最终资源：

- assets/char/zs_portrait.webp：512×768。
- assets/pwa/icon180.png、icon192.png、icon512.png：对应方形尺寸；favicon.ico：16/32/48/64/128/256 多尺寸。
- assets/cq/ui/clean/panel_orn.webp：192×64，保留透明通道。

最终提示词如下（完整记录）：

战士：Use case: stylized-concept. Original Chinese classic martial fantasy warrior portrait for mobile game, full body upright heroic human male swordsman, broad dao sword, dark gold and crimson forged plate armour, black hair visible face, readable silhouette, centered vertical composition, plain dark charcoal background. No skulls, no skeletons, no undead, no hood, no green magic, no lettering. Painterly high quality game character art.

图标：Use case: logo-brand. Square mobile game app icon, original Chinese martial fantasy emblem: single broad dao sword upright against a round crimson lacquer shield, burnished dark gold forged metal edging, bold simple silhouette readable at 32px, dark charcoal background full bleed. No text, no letters, no skulls, no skeletons, no undead, no green magic. Premium classic Chinese RPG dark gold and crimson style.

饰片：Use case: stylized-concept. UI ornamental metal plaque for original Chinese classic martial fantasy game, horizontal symmetrical short decorative bar, burnished dark gold forged metal with crimson lacquer inlay, restrained angular Chinese cloud motifs, readable sculpted silhouette, isolated centered on transparent background. No text, no skulls, no skeletons, no undead, no western heraldry. Asset intended as small popup border ornament.

## 验证

- 改动的8个JS文件分别 node --check，通过；git diff --check 通过。
- tests/cq_ui_test.js：16 pass；tests/cq_late_test.js：9 pass；tests/mir2_equipment_test.js：587 pass，无长模拟。
- Node VM 音频探针：无采样的首领、地下城、掉落、未知技能静默接管；采样请求失败后不走合成回退。
- 本地 Chromium 390×844、禁SW、阻断外网，内存构造角色并绕过登录/建角门禁（未登录、未接触真实云存档）：动态首屏10行名称正确，详细图为 zs_portrait.webp，无 latebn，面板无旧 border-image，无文档横向溢出，无 pageerror；弹窗饰片 computed style 指向新图，按钮高度44px；等待防误触窗口后点空白关闭成功。截图仅 /tmp/clean_ui_role.png，为本地探针状态。

## 未清项与协作边界

本组没有处理旧属性等价迁移、抗性战斗、套装/品质逻辑及其他组文案；保留现有计算并不表示这些问题已通过。旧档装备/进度/次数没有删除或重置。game.js 任务奖励 switch、acts.js 均未改。不合并 d3b7818、不push、不运行 bump，不改版本/SW缓存名。

少量交叉触碰：cq/mir2_equipment.js 仅删除高01涉及的旧UI包装一行，未动其迁移/装备/战斗代码；game.js 仅角色展示及其共享展示助手；classes.js 仅战士图片占位。其余改动均是本组条目明确涉及的文件和新资源。
