# 块 4 装备接线

本分支不改公共文件。现有页面直接打开仍使用基线功能；测试使用临时注入完整验证本扩展。内容 ID 沿用 `mir2_ids.md`，不修改实例 uid。

## 加载顺序（index.html）

在 `cq/data_cq2.js` 后、`game.js` 前加：

```html
<script src="cq/mir2_equipment.js"></script>
<script src="cq/mir2_equipment_migrate.js"></script>
```

在所有运行时包装（包括 `cq/sysapi_cq.js`、`cq/icons_cq.js`、`cq/pages_cq.js`、强化/重铸/背包模块）加载后、首次 init/建角前加：

```html
<script>CQMir2Equip.install();</script>
```

install 幂等，包装最终 `genItem/makeBase/newChar/setCount/allMods/itemLocal/itemName/itemReq/canEquip/showItem/renderBag/renderHero/hurtHero/clsSV/power/icon2Url/itemIcon`；新增 `CQSys.equipRanges()`、`heroEquipRanges()`。同一运行时只 install 一次，后续公共包装如需覆盖这些函数应先迁入此顺序。各块合并后也须使用此顺序验证。

## 读档（cq/sys_cq.js）

统一迁移顺序为技能→地图→装备→等级。调用以下片段，放在旧 `cqStrip/cqBadItem` 删除未知底材之前；旧装备必须先备份，不能先销毁再补偿。账号级共享仓库同一次提交：

```js
const equipmentMigration = CQMir2EquipMigrate.migrate(S, ACCT);
S = equipmentMigration.state;
ACCT = equipmentMigration.account;
// 后续调用等级迁移；最后 calc()、save()、acctSave()。
```

纯函数返回深拷贝，输入不变；失败直接抛出，由统一读档层保留原档，不写成功标记。标记为 `S.mir2Mig.equipment=1`，未知未来版本不会重迁。函数递归覆盖装备、英雄、背包、pst/stash、migBox、shared、已保存掉落等物品容器；未知底材用 cqD2Slot 兜底且保留 cqUnknown 全快照。旧 dmg/def、uid、en/rf/anc/lock 原样保留；未知套装保留原键，计算时跳过无定义奖励，避免读档崩溃。不支持的新词缀移到 cqLegacy，allMods 只加一次，旧词缀实际效果保留但不再作为新掉落展示。

新档由 `CQSys.createChar(name,cls)` 创建。install 同时包装 makeBase/newChar，初始装备与掉落使用同一 cqVersion/cqRange 结构。初始礼装需求固定 Lv1（本游戏开局换算）：法师使用乌木剑、固定魔法值 +10；道士使用攻击 3–9 的极品木剑，保持旧偃月开局的有效攻击。旧偃月不换底材，迁移用 cqLegacyClass 保持旧道士可穿戴。合并者不要再次替换初始武器。

items.js 的旧「冥想/法力回复百分比」补偿在装备扩展开启后停止注入；已存在的旧档数值由 cqLegacy 保留。新档初始装备已带 cqVersion，统一迁移只补标记，不会误当旧装再次补偿。

## 区间 API 与界面（sysapi/pages）

```js
const ranges = CQMir2Equip.ranges(item);
// {dmg:[min,max],mag:[min,max],tao:[min,max],def:[min,max],mdef:[min,max]}
const playerRanges = CQSys.equipRanges();
const heroRanges = CQSys.heroEquipRanges();
```

`ranges()` 返回只读区间（缓存按底材元数据引用及极品点数校验；替换 cqRange 应赋新对象）。`allMods` 保持旧 `mag/tao/mdef/def` 标量，并输出 `magMin/magMax` 等端点。端点只代表区间贡献；暗金/套装固定附加主属性存 cqBonus，与 cqBest 分开且只加一次；使用端点的消费者不可再次累加同名旧标量。旧档仍以原有标量计算兼容战斗；新装备魔法/道术区间已接入 clsSV 的伤害数组 dmg 和召唤攻击数组 pd，不增加技能等级。魔法每点换算 3 点伤害、道术每点 1 点，是本游戏替代旧法杖技能词缀的设计换算；旧档装备不重复享受这层补偿。新装备战力按职业计入魔法/道术，保证自动换装会选择相应主属性。新区间同时用于正式 API/详情/纸娃娃；不能在其它块给同一装备再乘传奇原始数值倍率。角色防御当前按实效单值显示 x-x，装备详情仍保留原表 x-y；主属性成长、全局防御缩放属于块 5，需合并后统一验证。

扩展的详情 UI 替换旧暗黑文案，显示需求等级、职业、重量、持久、极品、强化与套装；纸娃娃展示五类 x-y。公共页面不必再次包装相同功能。攻击/魔法/精神力要求由 `cqReq` 保留，新装备穿戴校验按当前端点上限；旧档保留原等级门槛与旧职业适用性（cqLegacyClass），不额外提高穿戴门槛。所有属性表是资料值，旧底材战斗区间保留必要的兼容强度，详情攻击显示实际强化后的区间。

## 图标（icons_cq.js）

新增图暂驻 `assets/cq/icon/mir2/eq_<b>.png`；15 张既有图仍在原目录。旧图标回归测试将注册数量写死为 15，不能在并行块改公共清单。完整路径查 `assets/cq/equip_source/manifest.json`，不扫描文件猜路径。

```js
// 如合并者将注册统一迁入 icons_cq.js：
const MIR2_EQ_ICONS = CQMir2Equip.icons;
function mir2EqIcon(it) {
  return it && !it.k ? MIR2_EQ_ICONS[it.b] || null : null;
}
// 接入现有 itemUrl、CQSys.itemIcon、icon2Url；本块 install 已提供对应包装。
```

## 首领/特戒（m2_cq.js）

不按数组下标保存物品身份；保留旧 boss 专属身份：

```js
const item = CQMir2Equip.createContent(contentId, level);
// 精确生成指定定义（包括同底材多种暗金/套装），未知 ID 抛错。
// 也可用 genItem(level, {contentId})；不改实例 uid。
```

本块为所有旧暗金定义添加 `uniq_<bossKey>_<baseId>` 或 `uniq_<baseId>`；新套装为 `set_<setId>_<slot>`。祖玛 legacy 套装只兼容旧档，新掉落回退普通极品，新套装用三职业 ID。特戒底材标为 cqSpecialBase，从普通 cqJewBase 池排除，防止掉出同名但无特效的普通戒指。新定义已进入原 UNIQUES/SETITEMS 池；沿用首领掉落算法，不改首领强度/掉率。麻痹/护身/复活沿用既有效果键；隐身/传送/超负载元数据需在公共战斗/导航中统一消费，不能误称已经具有独立主动技能入口。

## 本块测试

```sh
node tests/mir2_equipment_test.js
node tests/mir2_equipment_sim.js 60 zs fs
python3 tests/mir2_equipment_shots.py
```

截图脚本只在浏览器中注入，Chromium/WebKit × 新档/旧档，390×844；旧档先拍迁移前，再同页迁移拍后。报告包含战力及有效属性对照、触控尺寸、按钮不换行与空白关闭断言。

### bossloot.js 精确生成接线（由合并者替换 blSwap）

现有 blSwap 直接按旧模板构造物品，会绕过新区间、极品元数据；统一合并时用下段替换。外层 genItem 目前也会补齐本块元数据，独立调用 blSwap 则需此补丁。此片段已在本块测试中临时加载验证，不编辑公共文件。

```js
function blSwap(it, key, level) {
  const pool = blPool(key, level);
  if (!pool.length || pool.some(u => u.id === it.cqContentId)) return it;
  const def = pick(pool), uid = it.uid, ancient = it.anc, previous = BL.cur;
  let next;
  BL.cur = null; // 避免精确生成再次进入首领替换。
  try { next = CQMir2Equip.createContent(def.id, it.il || level, {noAnc:true}); }
  finally { BL.cur = previous; }
  delete next.anc;
  delete next.ax;
  next.uid = uid;
  for (const field of Object.keys(it)) delete it[field];
  Object.assign(it, next);
  if (ancient && typeof ancApply === 'function') ancApply(it, ancient);
  it.blk = key;
  return it;
}
```

后续块 3 按内容 ID 组织首领池时，池内应直接保存 `UNIQUES[].id`；旧名称池兼容解析只用于旧数据，不能将新定义再次降回数组下标或只按中文名称查找。

### sysapi_cq.js：英雄召唤物也计入 25% 预算

装备道术可影响召唤攻击，必须把 owner 为 hero 的召唤物统一计入英雄预算。现有 hitMon 包装内，将：

```js
const isH=src==='cqhero'||src==='cqheji';
```

替换为：

```js
const isH=src==='cqhero'||src==='cqheji'||!!(src&&typeof src==='object'&&src.owner==='hero');
```

原对象来源继续传入内层 hitMon，不转换为字符串，保留宠物本身的结算语义。原 heroCap/shAdd 会随此判断统一封顶。9 组合模拟在临时加载 sysapi 时应用此精确替换，并在统计端将 hero 宠物归入 hero，避免把宠物伤害误记为主角伤害。改前/改后均采用同一统计口径。

本块 install 已为英雄自身装备接入主属性到 heroStats；heroCast 的取值上下文使用英雄 eq，避免同职业英雄召唤物错误获得主角装备属性。旧档装备不重复获得这层转换。

### game.js / classes.js：魔御与幸运接线

game.js 怪物攻击角色的魔法分支，将：

```js
else v=Math.round(v*(1-ST.res[el]/100));
```

替换为：

```js
else v=Math.round((window.CQMir2Equip?CQMir2Equip.magicGuard(v,el):v)*(1-ST.res[el]/100));
```

install 已包装 hurtHero 覆盖怪物技能；game.js 上述片段只补普通攻击，不能再在 hurtHero 里重复调用。魔御仅对火/冰/雷/魔法固定吸收新区间内的伤害，这一层最低保留 1 点，再走既有抗性/减伤；毒/物理不套用新魔御。旧装维持原有结算，不追溯添加负面效果或删除旧抗性。

game.js 中每一处 `R(ST.wmin,ST.wmax)` 替换为：

```js
(window.CQMir2Equip?CQMir2Equip.rollAttack([ST.wmin,ST.wmax]):R(ST.wmin,ST.wmax))
```

classes.js 的区间掷骰声明中，将 `clsRR=d=>R(Math.round(d[0]),Math.round(d[1]))` 替换为：

```js
clsRR=d=>window.CQMir2Equip?CQMir2Equip.rollAttack(d):R(Math.round(d[0]),Math.round(d[1]))
```

classes.js 的 clsWRoll 中，将 `const w=R(ST.wmin,ST.wmax);` 替换为：

```js
const w=window.CQMir2Equip?CQMir2Equip.rollAttack([ST.wmin,ST.wmax]):R(ST.wmin,ST.wmax);
```

保留 clsWRoll 后面的既有职业权重/基础伤害换算。幸运/诅咒采用本游戏概率：净值绝对值除以 9 为取上限/下限概率，范围 -9～9；零值保留原 RNG 调用。旧档不追溯改变分布。这里只替换主角攻击区间的掷骰，不替换敌人伤害 RNG。

`tests/mir2_equipment_test_loader.js` 在独立 VM 里临时应用以上全部共享片段；正式文件未改。回归包含实际 20 点火伤被魔御 5 抵成 15、运 9 取攻击上限、旧档原值保留；不是只检查文字或返回的元数据。
