# 块 3：地图、怪物与掉落接线

本地分支 `mir2-map`，基线 `1f36659`。不修改公共文件；不引入 `d3b7818`。现有 D2 MONS/BOSSES 定义保留只读兼容，七章主链不再引用它们。装备表保持原样。

## 1. 加载顺序（index.html）

紧随现有 `cq/data_cq2.js`：

```html
<script src="cq/mir2_maps.js"></script>
```

`cq/mir2_loot.js` 放在 **块 4 的新装备定义、items.js、bossloot.js、cq/m2_cq.js 之后，第一次建角/读档之前**：

```html
<script src="cq/mir2_loot.js"></script>
<script>
CQMir2Maps.install();
CQMir2Maps.registerArt();
CQMir2Loot.install();
</script>
```

地图扩展必须早于首次 `applyDiff()`。它为全部区域补齐 `ml0`，不把 Monster.DB 的 `refLv` 当作玩家门槛。块 5 继续用 `ml0/ml` 校准成长，不降低 BOSSES。

## 2. 存档（cq/sys_cq.js，统一迁移入口）

在统一 `newSave` 包装返回前新增：

```js
CQMir2Maps.fresh(s);
```

统一迁移顺序为技能 → 地图 → 装备 → 等级；在技能迁移成功后、装备补偿之前插入：

```js
S = CQMir2Maps.migrate(S);
```

在完整迁移成功后按既有路径保存、`applyDiff(); calc();`。读档恢复战斗时重建 `MON/CORPSE`，不恢复半场血量。

`migrate(input)` 是纯函数：先克隆计算，成功才写 `mir2Mig.maps=1` 并返回；调用方只在返回成功后替换 S。已有 maps≥1（包括未来版本）原样返回。保留完整原始快照 `mir2MapLegacy`，未知字段不丢弃。未知布局落到最近已解锁主线节点。不能把新角色当旧档迁移，须由 `fresh(s)` 标记。

本块临时集成测试使用以下替代包装；**最终统一迁移入口接好后，不要再调用该包装**，以免与其它块的迁移顺序重叠：

```js
CQMir2Maps.installSaveHooks();
```

其作用是给 `newSave()` 加 fresh 标记，在旧 `load()` 后执行地图纯迁移、清理战斗临时对象并重新 `applyDiff()/calc()`。浏览器测试确实写入 `KEY` 与角色 key，刷新页面执行读档，并验证二次读档数值不变（既有 last 登录时间戳除外）。

迁移覆盖：`act/zone/ZN/CL/UN/actU/diffU/cleared/unl/q/Q`、全部三难度、首领 `bossRt`、带难度前缀的 `bf`。旧 q6、a2q6、a3q6 保留；旧 a4q3 完成资格补为 a4q6，不调用 questDone、不重发奖励。旧首领 key/图鉴项原样保留，新增 canonical key 合并记录，刷新时间取较晚值、击杀次数累加。

## 3. 七章地图页与战场（cq/pages_cq.js 的 hook 完成后）

在 pages 脚本加载完成、`hook()` 和 CQ.Host 注册完成后调用一次：

```js
CQMir2Maps.installUI();
```

例如 `cq/battle_mount.js` 的 `loadPages()` 中，现有创建 script 的代码改为：

```js
const s = document.createElement('script');
s.src = 'cq/pages_cq.js?v=' + VER;
s.onload = function () {
  function connectMaps() {
    if (window.CQMir2Maps && window.cqPg && window.CQ && CQ.Host) {
      CQMir2Maps.installUI();
    } else {
      setTimeout(connectMaps, 50);
    }
  }
  // pages_cq.js 自身还会在 setTimeout(0) 再执行 hook。
  setTimeout(connectMaps, 0);
};
document.body.appendChild(s);
```

适配器提供 `mapHTML/show/preview/travel/bossPop`，替换旧三章限制；地图支持七章、三难度、支线、锁定、传送预览、完整首领列表。按钮至少 44×44、文字不换行；预览沿用现有 modal 的空白关闭。章节导航横向滚动，选中章滚入可见范围。无新动画、特效或持续计时器。

CQ.Host.zone 的薄包装只更新当前 `.cqb .field` 的背景，不修改战斗数据或战斗时钟。四张场景与章节缩略图均为原创 imagegen，章内共用实际存在的文件。无 `cq/assets/...` 相对路径错误。

若合并者将 UI 收回公共页面，等价替换为：删除旧 `MAPN=3`、`'一二三'[a]` 和“第四章敬请期待”卡；区域按稳定 id 定位；章节缩略图取 `CQMir2Maps.chapters`；首领列表不再截断 act<3。此时不要同时装 `installUI()`。

## 4. 进度与首领接线（acts.js / cq/m2_cq.js / cq/sysapi_cq.js）

`install()` 为自动推进补主线终点判断；石墓/封魔、尸魔/骨魔支线追加在主链后，不要求清支线才去下一章。保持数组下标接口，字符串定位使用：

```js
const pos = CQMir2Maps.locate('cqchiyuelair'); // {act:4, zone:6}
```

第七章五张图对应六个任务；魔龙殿 `quests=['a7q5','a7q6']`，清图同时结算未领任务，终点仍 a7q6。各章 `mainEnd` 明确主线末尾，不能使用 zones.length-1 判章末。最终合并可将适配器的 zoneClear 包装移入 acts.js，二者只保留一处。

新手钉耙猫/半兽人头目属于普通怪 champion 遭遇：使用 `MONS.rakecatelite/orcelite`，区域字段为 `elite`，最后一波由适配器生成；不在 BOSSES 里假装低级首领。原 q2/q6 奖励保留，通过 clear 任务结算。钉耙猫王和半兽统领实体分别归白日门及封魔谷/白日门，保留旧 key 的首杀/刷新记录。二者原有首领数值不降低。

`registerArt()` 在 sysapi 注册以后调用。为 44 种新增普通怪、24 种新增首领登记实际 PNG；头目复用原模型路径，不复制旧图。CQSys.monArt 已能读取 CQ_MONART，无需改闭包。地图背景登记 `ASSETS['bg_'+zoneId]`；`chapters` 给出章内共用的真实路径。

现有 `bossWhere/bossList` 动态扫描 `boss/bosses` 已可覆盖新区域；`install()` 为新增首领登记项目采用的刷新节奏（普通 10 分钟，章节 60 分钟），不冒充原版刷新分钟数。尸王仍兼容旧 actboss 标记，其位置现在是第三章两矿区。`ref` 保存原始参考数值；新魔龙普通怪/无完整数值的首领标明原创数值。真魔龙教主参考生命 12000。旧首领及 D2 映射目标按数值上包络保留较强项。

## 5. 掉落与块 4 协作

`cq/mir2_loot.js` 只有稳定装备/书引用、分母权重和消费适配，不定义 BASES/UNIQUES/SETS/SETITEMS。1.76 首领表按 monsters.md「首领掉落节选」逐条转换，名称相同性别衣合并，不自行重新命名底材。普通掉落 TC 保留，新增资料池是额外来源。1.80 已知名称但缺失概率的魔龙池明确标原创权重；假教主返回空掉落（也不掉旧 TC 的装备/书）。

查询接口：

```js
CQMir2Loot.pool('niumoking');
// [{id:'swdtulong', denominator:10000, weight:0.0001, resolved:...}, ...]
CQMir2Loot.resolve('set_shengzhan_helm');
```

稳定定义身份支持 `id/contentId/cqId`；套装解析 SETITEMS，暗金解析 UNIQUES，底材解析 BASEM，书解析 MATS。**当前分支没有块 4 的新增定义**，找不到的引用保留在表内但不伪造装备、不触发异常；合并后动态解析，不缓存“缺定义”。技能书只引用职业前缀材料键。

强化魔龙/白金/星王的定义和准入归块 4/5；本块不将 1.80 资料没有的条目标成原版掉落，也不擅自设新的等级/转生门槛。合并验收须用块 4 完整定义核对 `pool(key).filter(row=>!row.resolved)`；所有资料引用都须能解析后才算完整合并。普通怪魔龙掉落原始资料“未查到”，保留通用 TC，不编造原版专属。

## 6. 验证与素材来源

- `node tests/mir2_maps_test.js`：临时加载本块扩展；248 项，包括全部历史下标×三难度、幂等、真实保存重载、全职业全区域刷怪、60 级三职业×三难度逐章任务/解锁链、首领不变弱、实际掉落消费、68 张怪物路径。
- `python3 tests/pw_mir2_maps.py`：只在响应内临时注入扩展，磁盘 index 不改；Chromium/WebKit × 新档/旧档，390×844；四章地图/预览/战斗和全部 24 新首领，共 144 张。
- `python3 tests/pw_mir2_maps.py --node-suite`：执行全部 `tests/*_test.js` 和 `cq/cq_battle_test.js`，并执行改动 JS `node --check`。因公共 CQ_MONART 禁止修改，测试 preloader 只把本块实际 artFiles 清单临时注册进已有 harness；不载入地图替换，因此既有六图/三章回归仍测原基线。原样运行 `node tests/cq_sysapi_test.js` 会在“磁盘每张怪图都在 CQ_MONART”处失败，最终公共注册接好后可撤掉 preloader。临时文件位于 Python TemporaryDirectory，结束自动删除。
- `python3 tests/pw_baseline.py`：保持原 index、原公共运行时，两浏览器×两尺寸组合回归；本块 UI 的四组合验收另由上述注入测试完成。
- 截图/报告：`/workspace/design/laoyang_m1_shots/codex_mir2_map/`；baseline 另在 `test-artifacts/worktree/`。

素材全部由内置 imagegen 生成，未使用外部版权图片。原图生成目录 `01a161ba-522b-7dd2-a652-cd47c339bb8a`；保存到本块 assets 路径。atlas 仅按等分网格提取并缩小，保留生成的透明 alpha。提示词组与提取顺序见 `assets/cq/map/mir2_art_manifest.json`。
