# 块 2 技能接线

本块不修改公共文件。新增 26 个技能 ID（法、道各 7 个基础技能，8 个后期技能、3 个英雄专属、1 个共用盾）。原技能 ID、旧 9 级映射和熟练度不变。新增倍率、未知耗蓝、挂机化效果为本游戏设计值，不宣称官方数值；原版三级位于新 1/4/7 级，其间线性插值，8/9 级外推。无内功、技能点和属性点。

## 加载顺序与调用

`index.html`：在 `cls_hero.js`、`cq/m2_cq.js`、`cq/icons_cq.js` 均载入后，首次角色消费前加入：

```html
<script src="cq/mir2_skills.js"></script>
<script>mir2SkillsWire();</script>
```

扩展载入时一次注册定义；`mir2SkillsWire()` 可重复调用，注册书目录、技能图和书图。必须在自动用书及掉落前调用。建议放 `cq/icons_cq.js` 后，页面脚本前。新英雄表由 `heroMir2Register()` 注册，`S.hero.skOff` 原接口可直接开关全部新技能，英雄仍 Lv22 解锁。

`cq/sys_cq.js`：统一迁移顺序的技能阶段、当前角色 S 完整加载后、技能自动学习前：

```js
mir2SkillsMigrate(S);
```

`cq/sysapi_cq.js`：`CS.createChar` 中 `newChar` 返回后，首次消费前同样调用 `mir2SkillsMigrate(S)`。`battleSkills` 与 `setBattleSkill` 复用已更新的 `skOfCls`，自动接受共用盾、拒绝英雄专属。无需另列新 ID。英雄列表继续调用 `heroSkills()`。

`cq/m2_cq.js`：以 `mir2SkillsWire()` 覆盖新书定义。需删除原占位错键，仅在旧书迁移完成后清理定义：`ds_jsl/ds_yss/ds_ylyd/ds_sszj/ds_qtzy`，迁移分别至 `ds_jslzf/ds_ysh/ds_yld/ds_sszjs/ds_qtzls`。不能直接删除库存。

## UI 精确替换

`cq/pages_cq.js` 的 `skList`：

```js
function skList(){return SKILLS.filter(s=>skOfCls(s)).sort((a,b)=>a.r-b.r||a.col-b.col)}
```

同文件 `skIcon` 的 img src 从 `${UI}sk/ic_sk_${n}.png` 改为：

```js
${SKM[id]&&SKM[id].mir2?n:UI+"sk/ic_sk_"+n+".png"}
```

`cq/hero_page.js` 英雄技能 img src 从 `${U}sk/ic_sk_${ic}.png` 改为：

```js
${SKM[s.id].mir2?ic:U+"sk/ic_sk_"+ic+".png"}
```

现有技能页、配置弹窗和英雄列表复用新目录，无新按钮。图标仅注册随本块提交的实际文件。新技能使用现有一次性 cqfx 序列，不新增循环动画。

## 本块临时验证

`node tests/mir2_skills_test.js` 在测试 VM 中临时加载扩展。
`python3 tests/mir2_skills_ui.py` 通过 Playwright route 在内存应用上述两处 UI 接线，并在建角后注入本块脚本；不写公共文件。Chromium/WebKit × 新旧档 × 三职业，390×844，截图目录 `/workspace/design/laoyang_m1_shots/codex_mir2_skill/`。因此主分支最终合并仍必须实施以上接线，未接线的页面不会启用新增技能。

`cq_bridge.js` 的 `skImg(id)` 改为以下实现（这是本块临时截图应用的第三处接线）：

```js
function skImg(id){
 const s=G('SKM')[id];
 return s&&s.mir2?'assets/cq/icon/sk_'+id+'.png':
   SK_ICON[id]?'assets/cq/ui/sk/ic_sk_'+SK_ICON[id]+'.png':null;
}
```

`mir2SkillsWire()` 应在战斗桥 `CQ._install()` 完成后再调用一次（仅一次安装伤害来源包装），使英雄分身/月灵伤害通过 `cqhero` 进入现有 25% 预算，不能计为玩家伤害。建议最终初始化在全部脚本载入后调用。扩展会注入限定于英雄技能行的 ≥44px 触控样式，不修改公共 CSS。

技能挂机化说明：瞬息移动为战斗内短时闪避，不跳过地图进度；心灵启示转为洞察弱点；圣言术对符合等级的不死普通怪可净化，对首领正常结算魔法伤害、绝不秒杀；疾光对不死目标 +50%；新增控制沿用首领免疫规则。英雄护体神盾 34 级可学，英雄达到 39 级且已学盾时主角自动获得一级，反复计算不累加。

## 审核修复接线（2026-10-22）

`cq/pages_cq.js` 的 `skillPage` 中，将 `const btn=lk?` 替换为：

```js
const btn=b>=SKMX()?'<button class="cqbtn xs dis" disabled>满级</button>':lk?
```

后续原表达式保持不变。此项修正原有页面问题，所有原有及新增技能均使用同一上限判断；满级按钮无 onclick、原生 disabled。公共页面不在本块修改，专项 Playwright 在内存使用该精确替换。

技能图 `assets/cq/icon/sk_<id>.png` 使用独立 imagegen 圆形浮雕图标；书物品继续使用原 `book_<id>.png`。技能列表、战斗栏和英雄共用技能图路径，材料映射只走书图。生成提示词与来源见 `assets/cq/icon/mir2_skill_art.json`。

玩家描述已去掉开发备注，设计数值出处仅保留在源码注释和本文档。`classes.js` 自动施法说明按真实类型与条件显示：治疗自身低于75%或召唤物低于60%，召唤数量未满（同组优先高级），施毒未中毒或即将结束，增益未生效或即将结束；攻击参与伤害选择。未调整战斗数值。

图标回归测试已直接加载本块扩展，使用45本完整清单并保留文件存在与目录反向覆盖检查；不再临时替换测试断言。

## 本次审核验证结果

- 6 个改动 JS 文件 `node --check` 通过；`tests/*_test.js` 全部38个脚本与 `node cq/cq_battle_test.js` 通过（共39/39）；技能专项188项通过，战斗219项通过。
- `python3 tests/pw_baseline.py`：Chromium/WebKit × 390×844、375×667，问题0条。
- `python3 tests/mir2_skills_ui.py`：Chromium/WebKit × 新旧档 × 三职业，390×844；覆盖圆形技能图、满级禁用、玩家文案、自动释放说明、战斗释放、弹窗空白关闭与触控尺寸，共84张页面截图。同目录覆盖旧截图。
- 图标使用 built-in imagegen 逐技能生成，26张独立圆形透明图位于 `assets/cq/icon/sk_*.png`；提示词模板、逐技能主题及原图SHA256见 `mir2_skill_art.json`。技能书图保持原样。
- 扩展样式补齐技能列表按钮、自动释放排序箭头与开关的44px触控区域；自动释放说明完整换行显示。
- 报告与截图：`/workspace/design/laoyang_m1_shots/codex_mir2_skill/`，图标总览 `icon_contact_sheet.png`。

## 二次审核：胶囊开关回归修复

自动释放开关移除可见控件上的 44px 最小宽高，恢复公共 CSS 的 38×20 胶囊与 16×16 圆钮；透明 `::before` 向上下扩展12px、左右扩展3px，实际点击区域为44×44。排序网格仍为开关预留44px列，避免与相邻箭头触控区域重叠。

专项 UI 验证新增胶囊、圆钮与透明触控区域尺寸断言，并从胶囊外上下各10px点击验证开关状态切换；同时检查英雄页内部胶囊保持38×20、外层按钮及战斗栏按钮触控区域≥44px。对照 `codex_hero/`、`codex_skillbar/` 的 master 截图复核。公共文件未修改。

本次复测：改动 JS 的 `node --check`、全部38个 `tests/*_test.js` 与战斗测试（39/39）通过；`pw_baseline.py` 四组通过、问题0条；技能专项 Chromium/WebKit × 新旧档 × 三职业12组通过，共96张截图（含开关关闭态）。
