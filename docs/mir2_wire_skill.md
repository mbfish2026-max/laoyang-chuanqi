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

## 共享图标测试接线（明确的旧断言冲突）

原 `tests/cq_icons_test.js` 同时写死 `I.books.length===19` 和“目录中所有 book_ 文件必须在该 19 本清单中”。新增 26 本后，这两项无法同时成立；本块没有编辑该共享文件。合并者需在测试 harness 载入后临时加载技能扩展并调用 `mir2SkillsWire()`，再把数量断言改为 `I.books.length===45`（19+26），装备数量仍为 15；保留全部正向路径存在与反向覆盖断言。

本块提供 `python3 tests/mir2_skills_regression.py`：逐一运行所有 Node 测试，仅对上述图标测试在内存应用扩展加载与 19→45 的断言接线，不写共享文件。原样 Node 回归结果与临时集成结果分别保存在 `node_tests.json` / `integrated_node_tests.json`，不能把原样图标测试声称为通过。

## 本块验证结果（2026-10-22）

- 改动 JS 全部 `node --check` 通过；技能专项 128 项断言通过。
- 原样 `tests/*_test.js` + `cq/cq_battle_test.js`：38/39 个脚本通过，唯一失败为上述旧图标反向清单（新增 26 本未在旧 19 本注册表中）。战斗测试 219 项通过。
- 临时集成 `python3 tests/mir2_skills_regression.py`：39/39 个脚本通过，图标测试保留全部文件存在/目录反向覆盖检查，清单变为 45 本。
- `python3 tests/pw_baseline.py`：Chromium/WebKit × 390×844、375×667，问题 0 条。
- 专项 UI：Chromium/WebKit × 新档/旧档 × 三职业，共 12 组、72 张截图；检查新图成功加载、视口无横溢、配置按钮和英雄开关至少 44px、按钮不换行、弹窗空白关闭、战斗栏新技能成功释放。
- 既有 60 分钟九组合模拟：英雄+合击占比 18.59%–22.84%；新增满级技能、英雄召唤物和合击真实伤害预算九组合断言全部 ≤25%。未改首领数据。

报告及截图均在 `/workspace/design/laoyang_m1_shots/codex_mir2_skill/`。公共接线及共享测试断言由最终合并窗口实施，本块没有修改这些公共文件。
