# 暗黑残留清理集成分支独立审核

审核日期：2026-10-26。工作树 `/workspace/cqx-clean-int`，分支 clean-int；被审 HEAD `fa0cbab84b406107b93c9730bb51a84d331489b6`，master 基线 `af6bfe1ac8d3100e4e19ec4c9e04e1766198c1d3`。审核输入为31条审计、三组开发说明和 `diablo_clean_common.txt`。初始工作树干净。本次只写本报告，不修改实现和测试，不访问真实账号或写云端，不 push。

结论：请求修改。最主要的问题是补偿写入装备的魔御没有进入主角实际减伤；另外仍有日常玩家可见禁词。下列“已清”针对原条目具体问题，不表示所有相关系统都通过；禁止词总验收和迁移有效性另行列出。

## 31条逐项结果

| 编号 | 判定 | 当前代码与理由 |
|---|---|---|
| 高01 | 已清 | `game.js:346` heroDisplayAttrs 与 `cq/pages_cq.js:22` 最终首屏共用传奇属性；取消较早的DOM补丁。首屏不再列吸血和旧百分比属性。加成汇总仍泄漏禁词，另见 MUST-FIX-02。 |
| 高02 | 已清 | `game.js:352` 详细面板使用同一展示助手；`late.js` 删除旧主属性增伤说明。旧力量/精力、元素抗、偷取、断点等详细表已替换。 |
| 高03 | 已清 | `data.js:4` ASSETS.hero 与职业分支指向 `zs_portrait.webp`。目检现图为持刀人类战士。 |
| 高04 | 已清 | index favicon、apple图和 manifest 180/192/512 引用存在；三张PNG均逐张目检为刀盾图，无亡灵。favicon二进制已更换，未逐一目检ICO内全部尺寸。 |
| 高05 | 已清 | `shop.js:22` 旧 gamble 只转盟重赌石坊；旧独立抽取/扣费链移除。外层 gamble_fix 的容量检查不恢复旧赌博。 |
| 高06 | 已清 | `reforge.js:11` 白名单、传奇品质资格和7/10/15上限；保留超过上限的历史 n、未决 off、boff/bless；待选时不能再次扣费，可保留原值。专项12项通过。 |
| 高07 | 已清 | 全局 QN、赌石q3/q4/q5、回收/仓库/融合显示统一。稀有是本次原则明确允许品质，不能因原报告高07名称仍在就判失败；旧数字q映射属于兼容。 |
| 高08 | 已清 | `data_endgame.js` 去掉旧收集/关卡目标，等级30/45/60、转生1/10；`eg_core.js:10` 封存废弃已完成记录，不再要求玩家完成。 |
| 高09 | 已清 | `eg_ach.js:10` 图鉴改固定攻击/防御，不再注入全抗、MF、完整收集经验倍率；旧收集键保留。 |
| 高10 | 已清 | `eg_bounty.js:14` r.ore与实际黑铁矿一致，页面奖励说明也已改；旧周常封存与补宝匣有一次性标记。 |
| 高11 | 已清 | `eg_events.js:26` 去钥石、改黑铁矿，说明极品/稀有；世界首领改魔龙统领，未下调其生命/攻击配置。 |
| 高12 | 已清 | eg_secret.js已删除、index无注册；运行时 egSecretStart 未定义；旧 staff/runs/king移至history，仅存档核对。 |
| 高13 | 已清 | `dlog.js` q5标签改极品，旧名称显示有过滤；`eg_ach.js:3` 新增极品日志同步更新。tianguang仍有旧标签常量，但自然掉落的unique不在TOP横幅集合，详见词表，不冒充已复现泄漏。 |
| 高14 | 已清 | `cq/mir2_maps.js:1989` 等任务文案与 `acts.js:136` 等执行改金币/防御魔御；cqMetaRewardsV1与难度+任务领取表防重；旧资格/永久防护归档折算。 |
| 高15 | 已清 | `cq/mir2_sets.js` 改固定八属性，删除套装吸血、1.5倍、追加斩击/叠墙等钩子；身份、收集、300杀保底和待领保留。此结论限套装，不替其他战斗链背书。 |
| 高16 | 未清 | `allMods` 正常路径已隔离cqLegacy；对象迁移、战力分值、装备数量及幂等测试通过。但迁移 mdef被 `newRange` 排除，1000点火伤不减，未达到“等价补偿、不变弱”。见 MUST-FIX-01。 |
| 高17 | 未清 | pen归零、元素免疫/降抗失效、怪物改防御/魔御已落实；主角侧旧装备魔御补偿失效，防护链尚未完成。禁止效果不能仅归零后算完成，见 MUST-FIX-01。 |
| 高18 | 已清 | `cq/mir2_equipment.js:589` 最终有效白名单；随机PREFIX/SUFFIX和淬锋仅八属性，固定生命/魔法上限按本次原则允许。 |
| 中01 | 已清 | eg_rift.js仅剩圣域所需怪池工具/历史页；运行时无egRiftStart、无rift页注册。eg_mj独立入口和uber父入口接到已批准圣域，不再保留封魔幻境玩法。 |
| 中02 | 已清 | GS规范化、账号/角色命名空间、偏好、auth、IDB采用cq-；旧cq_读取迁移，云extra导入也规范化；登出清新旧session避免复活。SQL cq_saves不改。内存/替身测试通过，未连接真实云。 |
| 中03 | 已清 | `sw.js:5` 删除条件为 startsWith('cq-') && k!==V，运行测试只删cq-old，保留当前版本、anye及其他缓存。版本名未改。 |
| 中04 | 已清 | `art.css` .gp/.ipanel边框改金红CSS及新饰片；标题旧背景去掉。目检新饰片；不把其他选择器的旧ui2资源一概判违规。本次未做浏览器computed style复验。 |
| 中05 | 已清 | audio的sched/sfx/playSkill不再调旧曲/技能合成回退；audio_cq失败或无采样静默。保留音频总线及独立命中音；未进行真人听辨。 |
| 低01 | 保留兼容 | 旧data_items等同步加载，但后续表清空/覆盖；ITYPES/AF与CQ_D2_SLOT底材ID→部位映射仍是运行与旧档迁移依赖。允许保留依赖，不把旧名字字符串当当前掉落。 |
| 低02 | 保留兼容 | prune_mig、sys_cq/sysapi负责旧消耗物折算、点数折金币、旧招募装备转英雄/溢出容器，必须保留以接管旧档。未发现恢复旧玩法入口。补偿提示本次明确豁免。 |
| 低03 | 已清 | EG_DEF不再创建lp/cube/season/已取消关卡空壳；旧lp/season读取及season→normal记录保留，因旧档进度必须可追溯。 |
| 低04 | 未清 | game.js:362/384/386/399/419/422与旧数据中仍有被最终实现覆盖的技能点、符文宝石、凹槽/暗金模板；`cq/pages_cq.js:95`等过时注释仍在。当前主路径已接管，不算现存玩法入口，但“删除被覆盖模板”尚未完成，列为剩余清理项。 |
| 低05 | 保留兼容 | 已移除无消费者ASSETS项及art2_map加载；其余ASSETS、art_map、art_icons3和技能图有调用/回退依赖。保留依赖可接受，文件存在不等于当下显示；未对全部战场资源逐帧目检。 |
| 低06 | 保留兼容 | 活跃品质抽取改一次抽取；qualityChance/qRoll接口、稳定q/uid/部位ID及生成骨架供调用/旧档保留，理由成立。q5失败降q4等有限回退仍存在，不等于继续展示旧品质体系。 |
| 低07 | 已清 | DESIGN/README/TODO改为七章/八属性/英雄/新键；旧规则移docs/archive并明确非现行。 |
| 低08 | 已清 | 两份旧方案改为当前决定，旧版移archive；data_cq过期章节待改说明已更新，不再据旧方案保留取消模块。 |

统计：已清24条，保留兼容4条，未清3条。未清条目为高16、高17、低04；另有全仓词表验收发现的独立问题。

## 词表扫描与命中判读

对全仓JS/HTML/CSS/manifest执行：

```sh
rg -n '暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer' --glob '*.js' --glob '*.html' --glob '*.css' --glob '*manifest*'
```

主程序排除 tests/** 后共203命中行（其中cq/cq_battle_test.js为测试文件，进一步排除时不计玩家代码）；测试和工具也检索，均不作为玩家文案。完整主程序原始命中在文末，保留行号，避免只列修改文件。以下是按最终消费者分类的清单。

| 命中 | 最终判读 |
|---|---|
| bonus.js:63「传说威能」 | **确定泄漏**：角色→展开加成汇总，bxBody直接生成；Node VM bxBody().match(/传说威能/g)命中。无需拥有任何旧玩法字段。 |
| bonus.js:31「威能共鸣」 | 来源弹窗的条件文案，实际有非装备技能加成时可生成，应随废弃区一起清理。 |
| bonus.js:47「无生效威能」 | 受旧全局是否存在影响的回退；不能作为保留日常栏目理由。 |
| cloud.js:126「掉落暗金/套装时立即同步」 | **确定泄漏**：登录后的账号与云存档/设置。内存设CU后accountPanel().includes('暗金')为true，无联网。 |
| cq/hero_page.js:22「不加属性点、技能点」 | **确定泄漏**：已创建英雄的正常英雄页说明。虽然表达不加点，但本次禁词没有“否定句”豁免；改“技能书与熟练度满足条件后升级”。 |
| cowlevel.js:34「符文↑」 | 旧地图包装有文本，但最终CQMir2Maps.installUI重设renderMap，动态加载完成后的地图主路径不执行该包装；不列已复现泄漏。应删除过时模板。 |
| tianguang.js:5「暗金」「高阶符文」 | TAG常量遗留。tgTier(q5)返回unique，但TG.TOP不含unique，正常q5仅光柱不显示此标签；符文已不产出。潜在直调tgBanner可显，建议统一字典，未当成正常掉落泄漏。 |
| bloodmoon.js:26「抗性」 | 旧ward详情包装被最终装备showItem接管，cha_s不存在且新变异替代旧血月；不列当前可达面板。 |
| data.js:17/39/199/200/202/206、data_items*.js、data_acts.js:228/242/244 | 初始品质/旧技能/旧物/旧任务定义；内容表被cq与mir2模块替换。保留迁移ID/结构依赖，不把这些名称断言为新掉落/新任务。 |
| game.js:130/362/384/386/399/419/422/439 | 旧SV/技能/背包/装备/难度模板；传奇技能/背包/装备最终覆盖、pen归零。低04仍需清理，但不等于恢复旧系统。 |
| cq/data_cq.js:106「吸血」 | MODT历史格式表；最终装备白名单不允许ll，新装备不由此产生吸血。 |
| eg_ach.js:4/16、dlog.js:27、cq/ui_cq.js:5/6、settings.js:11 | 旧名规范化、过滤正则和替换器，字面命中不是输出文案。 |
| prune_mig.js:26、classes.js:163/167 | 仅旧档一次性物品/技能迁移提示；按本次豁免，不计日常禁词。 |
| cq/mir2_maps.js:120「暗黑战士」 | 明确允许的传奇怪名。 |
| 其余命中（见原始清单） | 注释、内部键、迁移分支、测试描述或不再加载文件。不得以rg总命中数直接判31条全失败。index.html、manifest及CSS content未发现直接输出的禁词。 |

本次没有发现正常日常输出“暗夜、暗黑（例外除外）、护身符、炼金、凹槽、虚隙、秘径、纪元、佣兵、抗性、吸血、魔法物品、亡灵、necromancer”的新增可达模板；这不是全浏览器全流程截图保证。已确认输出的是威能、暗金、技能点、属性点。

## 必须修复的问题

### MUST-FIX-01：旧装备的魔御补偿未进入主角减伤，旧档实际变弱

位置：`cq/mir2_equipment.js:615` newRange排除cqMigrated、`:618` magicGuard只读取newRange；`:643` hurtHero闭包直接使用该函数；`cq/mir2_equipment_migrate.js:15`–16写入m.mdef、`:29`统一标为cqMigrated；`acts.js:89`主角技能伤害仅额外读取S.bon.mdef。

用现有cq_harness载入实际脚本、创建60级战士，直接迁移：

```js
const it = {uid:999,b:'arm1',q:4,def:2,
  m:{allres:75,ll:7},cqVersion:1,cqMigrated:1};
const v = CQMir2EquipMigrate.item(it);
S.eq={armor:v}; calc(); H.life=100000;
hurtHero(1000,'fire',{ar:100,lv:60},false);
```

实测 allMods(v) 含 mdef:75、def:506，power(v)=508；CQMir2Equip.magicGuard(1000,'fire')=1000，实际生命损失1000。该角色没有任务魔御或套装。master的hurtHero在75火防时同样输入只损失250；清理后旧防护字段已退出计算，却没有有效魔御承接。总战力分值被固定防御补平，不能证明实际等价。即使仅删除cqMigrated条件也不充分：ranges来自cqRange，并不自动读取迁移的m.mdef；现有函数还被闭包捕获，改导出对象上的方法不能覆盖全部元素伤害路径。

修法：让迁移装备的有效固定魔御统一进入主角所有魔法/毒伤减伤路径，避免cqRange与m重复计数，补偿值要按伤害尺度满足旧防护等价；保留原始字段和幂等标记。核对法师/道士primary路径同样排除迁移装备的影响。增加实际hurtHero对迁移前后、普通/技能/毒伤的短测试，不能只断言power或ST.res=0。不要重新启用cqLegacy的禁止字段，也不要用削首领抵消。

### MUST-FIX-02：清除仍然可达的日常禁词

位置和修法：

- `bonus.js:63`：删除废弃威能栏目及bxPowers调用，清理`:31`的威能来源说明、`:47`旧空态；保留合法技能/套装来源。不要靠DOM异步删字掩盖模板。
- `cloud.js:126`：把账号同步说明的“暗金/套装”改为“极品/套装”，与实际品质字典一致。
- `cq/hero_page.js:22`：删除否定句里的属性点/技能点，保留技能书和熟练度说明。

验证角色展开加成汇总、登录态accountPanel、已创建英雄页的生成HTML不含禁词。清理tianguang旧TAG及cowlevel旧模板可同批完成，但不把它们未复现的自然路径描述成已触发。

## 其他问题与风险

- **REVIEW-01，低04未完成**：死展示模板/过期注释仍在。建议删除game.js旧技能/背包/装备的被覆盖展示，保留计算接口和真实迁移所需ID映射；不能把纯死文案称作“旧档迁移必须”。当前无旧入口证据，严重度低于上述两项。
- **REVIEW-02，集成测试旧断言**：`tests/mir2_integration_test.js:14`仍要求rf===3；本次运行9通过1失败。独立读取迁移结果为 `{uid:90001,old:'future_legacy_armor',en:7,rf:{k:null,n:3,off:null},lock:1}`，说明次数/强化/锁定与未知原记录保留，失败是断言未跟随schema。更新为验证rf.n===3及实际保留语义；不能照开发说明宣称集成10/10。
- 主角角色属性的魔御显示仍由equipRanges读取cqRange，迁移有效m.mdef也可能未完整展示；应随MUST-FIX-01统一实际与显示来源。
- 未发现本次引入的未定义函数调用或index缺失本地文件；Node语法校验不等于浏览器全路径无异常。审核脚本曾误调用不存在的cloudUI，已更正用实际accountPanel复验，此错误不属于产品缺陷。

## 迁移、入口与战斗专项结论

装备对象迁移复制而非就地销毁，遍历角色/英雄/背包/个人/共享/待领等容器，旧全局迁移标记不会跳过装备升级，原始记录封存不进入正常allMods。专项样本未丢装备；已购淬锋n、待选结果、超上限历史次数保留且幂等；unknown样本也保留。低02消费物折算不是删除装备。以上对象/战力分值检查通过，但MUST-FIX-01阻止“不变弱/等价补偿”验收通过。

秘径、旧虚隙/封魔幻境无页注册、无start函数；凹槽无加孔入口/函数；旧赌博转盟重赌石坊。历史页只读，批准的幽冥圣域继续独立运行。旧offpeek等包装会先检查函数存在，不构成未定义调用。

cq_→cq-有单向读兼容和云extra规范化；本地旧会话恢复、旧IDB键回读、登出不复活测试通过。真实浏览器IDB与真实云没有操作，不声称完成线上迁移。SW只删本作旧缓存已执行替身验证。

战斗静态检查：首领生命、伤害配置没有下调；元素免疫/降抗和难度pen已退出有效防护。怪物旧元素表按最大防护映成统一魔御，意味着原先较弱元素也会承受较强防护；需要留意职业/技能差异，不能仅凭“能打出非零伤害”证明七章可通关。三职业短伤害与1.8倍叠加测试通过；未跑长模拟，未发现足以单独断言全职业必卡死的证据。然而已复现旧档承伤从250升为1000的防护损失，应先修复再评估难度。不得通过削首领解决。

## 本次实际验证

| 检查 | 结果 |
|---|---|
| 改动且仍存在的JS语法 | 43文件 node --check 全通过；删除的eg_secret不参与语法校验 |
| git diff --check master..HEAD | 通过 |
| index所有本地src/href文件存在 | 无缺失 |
| diablo_clean_migrate_test | 15通过 |
| diablo_meta_test | 20通过 |
| reforge_test | 12通过 |
| mir2_b6_test | 32通过 |
| mir2_bal_short_test | 19通过，无推进长循环 |
| mir2_cloud_test | 14通过，内存替身 |
| cq_migrate_test / cq_prune2_test / cq_guard_test | 10 / 58 / 8通过 |
| mir2_maps_test | 250通过 |
| mir2_integration_test | 9通过、1失败，原因见REVIEW-02 |
| 独立只读运行时探针 | 复现bonus和accountPanel禁词、迁移魔御无减伤；旧start与加孔函数不存在；unknown迁移次数保留 |
| 美术 | 目检战士、新饰片及180/192/512安装图；未执行390×844浏览器交互或真人听辨 |

## 附录：主程序词表原始命中

以下含注释、历史表、过滤器、迁移提示，必须结合前文分类判读；不是203条玩家泄漏。审核报告自身不纳入扫描。

```text
art.css:38:/* ===== UI2 批次二：生命/法力球、怪物/角色卡框、血条/经验条/分割线、日志羊皮纸、快捷栏药水、炼金匣图标 ===== */
art_icons3.js:2:// art_icons3.js — 美术：16 个轻型底材专属图标（assets/icon2/light/<id>.webp）+ 17 个新威能图标（assets/icon2/pw/<id>.webp），tools/art/gen_pw_lt_icons.py
art_icons3.js:3:// 底材：写 ICON2[base id]（icon2Url 按 ICON2[it.b] 优先查）。威能：带 it.lp 且有图、且没有按名字专属图标的物品才显示威能图标（包装 icon2Url + 最外层 itemIcon）
art_icons3.js:4:// 保留原图标：nec/cls 按名映射命中；或暗金/套装(q 5/6)且原链路给出的不是通用底材图（ICON2[b]/ICON2[cat_tier]）
art_icons3.js:5:// 熔炼匣槽位 / 威能图鉴行原本无图标位置，不新增 DOM。须在 light_bases.js、art_nec_icons.js、art_cls_icons.js 之后加载
prune_mig.js:2:// prune_mig.js — legacy_prune 批次2：符文 / 宝石 / 护身符 / 珠宝 / 炼金匣 已删除后的旧存档清理（每次载入都跑，幂等）
prune_mig.js:5://    符文(k:'rune') 宝石(k:'gem') 护身符(cha_s/m/l) 珠宝(jew) 整件移除，按旧卖价折金币：符文 50×(号+1)，宝石 20×(级+1)，护身符/珠宝 200
prune_mig.js:6://  · 装备上已镶嵌的符文/宝石/珠宝：拆掉销毁并同样折金币，凹槽清零（it.sock=0, it.soc=[]）
prune_mig.js:7://  · 符文之语：保留物品本体、去掉符文之语（删 it.rw / it.rwm，白/灰底材名字恢复底材名）
prune_mig.js:13:// 清理一件留下的装备：拆镶嵌物、去符文之语；返回折算金币
prune_mig.js:26: g+=sh;if(g>0){S.gold=(S.gold||0)+g;S.cqPruneG=(S.cqPruneG||0)+g;try{if(typeof log==='function')log('旧版符文/宝石/护身符已移除，折合 '+g+' 金币')}catch(e){}
loot.js:69:// 炼金匣「精华重铸」已删除（legacy_prune 批次2）
acts.js:135: case'a4q2':{const g=[1500,3000,6000][d];S.gold+=g;log('熔炉迸出 '+g+' 金币');break}// 原奖励宝石+符文（已删除）改金币
acts.js:137: case'a5q2':{const g=[2000,4000,8000][d];S.gold+=g;log('获得 '+g+' 金币');break}// 原奖励符文×3（已删除）改金币
acts.js:173:// ---------- 物品：加凹槽 / 个性化 （任务奖励） ----------
stashux.js:2:// stashux.js — 个人/共享仓库：显眼「⇅ 自动整理」按钮（同背包样式）+「炼金匣」（仓库物品可作材料）
stashux.js:4:// 炼金匣：打开时把当前仓库物品临时并入背包供配方识别/消耗，每次配方或界面刷新后立即放回原页；产物留在背包，背包满则放回当前仓库。
stashux.js:7:// 仓库内炼金匣（stashCube/STCUBE）已删除（legacy_prune 批次2）
stash.js:6:// 堆叠：宝石(同色同级)/符文(同号) 在数组中仍是独立对象（所有旧消耗逻辑天然“一次扣 1”），显示与占格按组合并；
stash.js:20: for(const c of ACCT.chars)if(c&&c.mode==='season')c.mode='normal';// 纪元已删除：账号角色列表里的纪元标记转普通
stash.js:40: S.name=S.name||c.name;S.cid=c.id;S.cls=S.cls||c.cid||'zs';S.mode=S.mode||c.mode||'normal';if(S.mode==='season'){S.mode='normal';S.cqSeasonOld=1}if(c.mode==='season')c.mode='normal';/* 纪元已删除（legacy_prune C5）：旧纪元角色转普通，S.eg.season 原样保留不生效 */if(!S.ci&&typeof clsInit==='function')clsInit();if(!S.ast)S.ast={on:0,dest:'p',t:{gem:1,rune:1,mat:1,jewel:0,charm:0,unique:0,set:0,rare:0,sock:0}}}
stash.js:111:const AST_T={mat:'材料',unique:'极品',set:'套装',rare:'稀有'};// 宝石/符文/珠宝/护身符/凹槽底材 已删除（legacy_prune 批次2）
data.js:17:const QN=['低劣','普通','超强','魔法','稀有','暗金','套装','合成','符文之语'];
data.js:39: {id:'sr',t:0,n:'冥仆抗性',r:24,col:0,pre:['gm'],kind:'passive',ic:'🛡'},
data.js:66:// ===== 怪物（mechanics: hp/dmg 为 mlvl1 基准，ranged 远程，undead 亡灵，res 抗性%）=====
data.js:127:// ===== 基础类型：tier 0普通 1扩展 2精英；cat 用于符文之语底材 =====
data.js:199: fres:'火焰抗性 +{v}%',cres:'冰冷抗性 +{v}%',lres:'闪电抗性 +{v}%',pres:'毒素抗性 +{v}%',allres:'所有抗性 +{v}%',
data.js:200: allsk:'+{v} 所有技能等级',t0sk:'+{v} 冥仆系技能',t1sk:'+{v} 骨毒系技能',t2sk:'+{v} 咒怨系技能',sockp:'凹槽 ({v})',
data.js:202: regen:'生命回复 +{v}/秒',mpk:'+{v} 法力/每次击杀',undead:'+{v}% 对亡灵伤害',firemin:'+{v} 火焰伤害',coldmin:'+{v} 冰冷伤害',lightmax:'+1-{v} 闪电伤害',poisdmg:'+{v} 毒素伤害(3秒)',
data.js:206:for(const s of SKILLS)MODT['sk_'+s.id]='+{v} '+s.n+'（亡灵术士专属）';
data.js:209:// ===== 暗金 =====
bagkeep.js:3:// 背包顺序会被很多路径改动：拾取 push 到末尾、自动换装/佣兵换装换下件 push 到末尾、items2/gamble_fix/lock 在 autoTick/回收/出售期间把
bagkeep.js:4:// 双手/护身符/珠宝/赌博/锁定物品临时移出再 push 回末尾、回收 S.bag=keep.concat(mats) 等。逐个修补不可靠，改为「整理状态」：
ui_art.js:2:// ui_art.js — UI2 手绘框架的少量 DOM 接入（只替换 emoji / 给炼金匣配方加工匠图标；不改玩法文件）
ui_art.js:3:// 商店「药水/卷轴」行的 🧪💜📜 → assets/ui2/pot_*.webp；炼金匣配方行 → artCraft() 工匠图标（art_map.js）
ui_art.js:11:  if(tt&&tt.textContent.includes('炼金匣'))m.querySelectorAll('.row').forEach(r=>{if(r.dataset.ua)return;const b=r.querySelector('button[onclick]'),sp=r.firstElementChild;if(!b||!sp||sp===b)return;
eg_ach.js:4:function egUname(it){return String(it.name).replace(/^亡灵术士的/,'')}
eg_ach.js:16:function egTitles(){const e=EG(),t=EG_ACH.filter(a=>a[5]&&e.ach[a[0]]).map(a=>a[5]);if(e.ach._t)t.push(...Object.keys(e.ach._t).filter(t=>! /暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|亡灵|necromancer/i.test(t)));return t}
data_items2.js:3:// data_items2.js — 装备扩充（第四阶段）：弓/弩/长柄/矛/标枪/投掷/斧/锤/法杖底材、珠宝、护身符、
data_items2.js:4:// 追加暗金/套装/符文之语、升级配方。全部原创命名；机制与量级参照原版 1.13。必须在 data_items.js 之后加载。
data_items2.js:37: W2('stfx1','staff','乔木杖',30,1,[6,21],25,0,2),W2('stfx2','staff','四分杖',35,1,[8,26],25,0,3),W2('stfx3','staff','雪松杖',38,1,[11,32],25,0,4),W2('stfx4','staff','符文杖',47,1,[24,58],25,0,6),
data_items2.js:41:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：珠宝/护身符 RARE_B、AF2 前后缀
data_items2.js:42:// 珠宝/护身符后缀的显示名：与其它后缀统一为「XX之」放在名字最前（内部 n 不变，旧存档的词缀引用不受影响）
data_items2.js:72: U2('暗夜之衣','arme2',82,73,{allsk:2,fcr:20,manapct:15,edef:[150,200],mdr:15}),U2('不灭之铠','arme3',88,80,{dr:[15,20],life:[100,150],allres:[30,40],edef:[180,220],drp:5}),
data_items2.js:140:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：符文之语 NEW_RW2、升级/修复配方
data_items2.js:144:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：SOCKET_RECIPES 扩充、符文之语 NEW_RW3/NEW_RW4
cq_bridge.js:2:// cq_bridge.js — 老羊传奇战斗胶水（M1）：把传奇卡片战场（cq/*）接到暗夜框架的真实数据上。
cowlevel.js:34: const h=`<div class="zc bz cowzc ${cur?'cur':''}" onclick="cowGo(${d})"><div><b>🐮 ${COWZ.n}</b> <span class="tag">秘境</span><span class="tag">${DIFFS[d].n}</span><div class="dim">狂蛮牛魔·铁角蛮牛 · 首领 <span class="bossn">牛魔王</span></div><div class="dim">经验+25% · 寻宝+60 · 符文↑ · 循环刷图</div></div><div class="zr"><span>mlvl ${mlD(45,d)+COW.ml}</span><small>${COW.w}波</small>${cur?'<em>当前</em>':''}</div></div>`;
sort.js:4:// 排序：品质高到低（暗金/符文之语→套装→合成→稀有→魔法→已开孔白装→超强→普通→低劣；非装备最后）→ 类型（武器→头盔→铠甲→盾牌→手套→鞋子→腰带→戒指→项链→护身符→珠宝 → 宝石 → 符文 → 材料 → 其他）→ 等级高到低（符文按等级）→ 名称
game.js:28:function socketMods(it){return{}}// 宝石/符文/符文之语已删除（legacy_prune 批次2），凹槽不再提供属性
game.js:52: if(b.s!=='weapon'&&!b.sock){/*无凹槽部位不出嵌工*/}const f=c.filter(a=>!(a[3]==='sockp'&&!b.sock));if(!f.length)return null;
game.js:86: const CB=typeof clsBase==='function'?clsBase():{life0:45,lpl:1.5,lpv:2,mana0:25,mpl:2,mpe:2,at:{vit:15,ene:25}};// 职业系数（classes.js；亡灵术士与原公式一致）
game.js:130: case'ad':{const t=8+3*(L-1);v={dur:t,n:ncur(L),txt:`${ncur(L)} 个目标物理抗性 -100%，${t}秒`};break}
game.js:186:// 符文/宝石已删除（legacy_prune）：原来出符文的奖励改出黑铁矿（强化材料）
game.js:360:// 符文图鉴页已删除（legacy_prune 批次2）
game.js:362: P.innerHTML=`<div class="stabs">${tabs}</div><div class="pts">技能点 <b>${S.kp}</b>　主攻：<b>${S.main?SKM[S.main].n:'自动'}</b>　诅咒：<b>${S.curse?SKM[S.curse].n:'自动'}</b></div>
game.js:384: const why=S.lvl<s.r?`需要角色等级 ${s.r}`:!s.pre.every(p=>bl(p))?`需要前置：${s.pre.map(p=>SKM[p].n).join('、')}`:S.kp<=0?'技能点不足':'';
game.js:386: <div class="dim">剩余技能点：${S.kp}${why?` · <span style="color:#f66">${why}</span>`:''}</div><div class="btns c"><button class="btn" onclick="closeM()">关闭</button><button class="btn gold" onclick="learn('${id}')" ${canLearn(id)?'':'disabled'}>开始升级</button></div></div>`)}
game.js:399: const fl=[['all','全部'],['eq','装备'],['misc','符文宝石']];const items=S.bag.filter(it=>BAGF==='all'||(BAGF==='eq'?!it.k:!!it.k));
game.js:419: modal(`<div class="ipanel q${it.q}"><div class="ih">${itemIcon(it)}<div><b style="color:${itemColor(it)}">${itemName(it)}</b><div class="dim">${b.n} · ${['普通','扩展','精英'][b.tier]}级 · ${QN[it.rw!=null?8:it.q]}${it.sock&&it.q<3&&it.rw==null?' · 有凹槽':''}</div><div class="star">${stars(it)}</div><div class="dim">物品等级 ${it.il} · 耐久 —（挂机不磨损）</div></div></div>
game.js:422: <div class="pw">战力 <b>${power(it)}</b></div>${cmp}<div class="tags"><span>可交易</span><span>已鉴定</span>${it.q===5?'<span class="u">暗金</span>':''}${it.set?'<span class="s">套装</span>':''}${it.rw!=null?'<span class="u">符文之语</span>':''}</div>
game.js:439: <div class="btns">${DIFFS.map((d,i)=>`<button class="btn xs ${S.diff===i?'on':''}" disabled>${d.n}${d.pen?`(抗性${d.pen})`:''}${d.lock?' 🔒':''}</button>`).join('')}</div></div>
mdiff.js:5:// 高级物品掉率：每次掉落额外按（倍率-1）次重掷掉落表，只保留稀有及以上（稀有/暗金/套装/传说）；额外重掷产生的金币和药水退回，不白送。
compare.js:5:// 复用原有详情面板（威能/凹槽/锁定等其他模块的包装都照常生效）。加载于所有 showItem 包装之后。
cq/sysapi_cq.js:39:// v2 → v3：保留已有英雄；旧佣兵按职业转换，装备溢出退回背包/仓库。
bonus.js:4:// 数值一律读现有计算结果：ST（calc）的 allsk / t0sk..t2sk / sk_<技能> / M.tc_* / nb.skd；生效威能 EG_LPS、共鸣 ST.pbr（pw_build.js pbRes）、
bonus.js:5:// 超上限 PB.over；套装件数 setCount()；流派 nbOn()；文字 modsTxt / MODT / egLpName。来源归属 = 遍历身上装备（含镶嵌/符文之语）、
bonus.js:6:// 背包护身符、已激活套装档位的词缀；与总值的差额记为「其他来源」（流派被动/威能/魂阶等）。
bonus.js:21:// 来源：装备（含镶嵌/符文之语）、背包护身符、套装档位
bonus.js:24: for(const it of S.bag||[])if(typeof isCharm==='function'&&isCharm(it))out.push({n:itemName(it),c:itemColor(it),w:'护身符（背包）',m:it.m||{}});
bonus.js:31:  const tot=off?sum:bxTotal(k);if(!tot&&!sum)continue;if(Math.round(tot-sum))by.push({n:'其他来源',c:'#aaa',w:'流派被动 / 威能共鸣 / 魂阶等',v:Math.round((tot-sum)*10)/10});
bonus.js:37:// 威能 / 共鸣
bonus.js:47: return L||res||over?res+L+over:'<div class="dim">无生效威能</div>'}
bonus.js:52:// 其他：流派 / 符文之语
bonus.js:63: BX.html=`<div class="bxsec"><h4>技能加成 <small class="dim">点一行看来源</small></h4>${sk||'<div class="dim">无</div>'}</div><div class="bxsec"><h4>传说威能</h4>${bxPowers()}</div><div class="bxsec"><h4>套装</h4>${bxSets()}</div>${ot?`<div class="bxsec"><h4>其他</h4>${ot}</div>`:''}`;BX.sig=sig;return BX.html}
data_items.js:3:// data_items.js — 装备 / 掉落 / 符文 / 合成 数据（覆盖 data.js 中同名表，原地修改以保持 const 引用）
data_items.js:5:// treasureclassex/runes/gems/cubemain）。所有物品/词缀/套装/符文名称均为本作原创。
data_items.js:10:// gs = 原版 gemsockets；TCAP = 物品类型凹槽上限 [ilvl1-25, 26-40, 41+]；sock 由两者取小
data_items.js:12:const NECRO_BLOCK=20; // 原版职业格挡加成（亡灵术士 20），盾/缩颅的 block 字段已含此值
data_items.js:29: // 缩颅（亡灵术士专属副手）
data_items.js:49: // 手套 / 腰带 / 鞋（无凹槽）
data_items.js:96: // 凹槽
data_items.js:105: // 对亡灵 / 毒伤
data_items.js:110: AF('力量之',1,1,'str','amul,belt',{str:[1,2]}),AF('威能之',10,8,'str','amul,belt',{str:[3,5]}),AF('公牛之',26,19,'str','amul,belt',{str:[6,9]}),AF('巨人之',42,34,'str','amul,belt',{str:[10,15]}),AF('泰坦之',58,50,'str','amul,belt',{str:[16,20]}),
data_items.js:161:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：GOODT/JEWEL_SCALE/RUNE_FALL/COUNTESS_RTC、宝石数值、NEW_RUNES/RUNE_UP、符文之语 NEW_RW
data_items.js:163:// ---------- 暗金（lv=物品等级门槛 qlvl，rq=需求等级；蓝本为原版对应物品，重新命名并小幅改造） ----------
data_items.js:265:// 已删除（legacy_prune 批次2：符文/宝石/护身符/珠宝/炼金匣）：合成配方 CRAFTS、底材加孔 SOCKET_RECIPES
data_items.js:270: maxfres:'+{v}% 最大火焰抗性',maxcres:'+{v}% 最大冰冷抗性',maxlres:'+{v}% 最大闪电抗性',maxpres:'+{v}% 最大毒素抗性',ds:'{v}% 致命一击',blind:'{v}% 击中致盲',cb:'{v}% 压碎性打击',
ancient.js:22:// 额外词缀：上古 +1、至臻 +2；从该部位合法词缀池抽（排除技能等级/凹槽/与已有属性重复），区间同样上移，至臻取满；记录在 it.ax={k:[lo,hi]}
cq/cq_battle_test.js:127: ok(/\['bag','背包'\],\['shop','商店'\],\['merc','英雄'\]\]/.test(bm)&&!/\['merc','佣兵'\]/.test(bm),'背包/商店在角色页子页签可达，英雄入口恢复');}
cq/cq_battle_test.js:162: const T2=JSON.parse(G('JSON.stringify(cqPg._t.TOPT)'));ok(['hero','bag','shop','skill','eg','map'].every(k=>T2[k])&&!T2.fight,'顶栏在 角色(含背包/商店/佣兵)/技能/福利/地图 显示，战斗页不显示（战斗页有自己的金属顶栏）');
cq/cq_battle_test.js:193:// ---------- 英雄战斗（M2：走位 / 开启技能 AI / 合击怒气 / 受伤阵亡复活 / 无佣兵） ----------
cq/cq_battle_test.js:216: G(`ALLY.push({kind:'merc',uid:991,hp:50,max:50});S.merc=S.merc||{t:'archer',lvl:1,eq:{}};CQSys.heroMigrate();step(.1)`);ok(G("ALLY.every(a=>a.kind!=='merc')")&&G('typeof mercTick')==='undefined','旧佣兵不再参战');}
uber.js:52:// 每角色限 1：同 ub 的 uniq1 护身符只算第一件
uber.js:53:// charmMods 包装已删除（护身符已移除，legacy_prune）
cq/data_cq2.js:1:// cq/data_cq2.js — 老羊传奇 M2：第 2 章「比奇」、第 3 章「矿区」数据（方案 §3）。替换 ACTS[1]/ACTS[2]（原暗夜第二、三章）。
cq/data_cq2.js:2:// 怪物 key 统一 cq 前缀，避免与暗夜 MONS（skel/yeti 等）冲突。首领真实时间刷新周期见 cq/m2_cq.js 的 CQ_BOSSRT。
shop.js:28:const ESS_EX=[];// 精华兑换的宝石/护身符/符文已删除（legacy_prune 批次2）
bossloot.js:2:// BOSS_LOOT[key]=[普通档, 噩梦档, 地狱档] 各 1 件现有暗金（按底材等级分档，确定性分配、互不重复）。
bossloot.js:3:// 首领掉出暗金时，专属暗金权重 ×4（只替换暗金，不改暗金总量 → 不影响通关时长）。
bossloot.js:6: EXTRA:{rift_guard:()=>typeof EG_RIFT!=='undefined'?EG_RIFT.guard:'虚隙守望者',mj_lord:()=>typeof EG_MJ!=='undefined'?EG_MJ.boss:'秘境之主'}};
cq/ui_cq.js:2:// 去掉：符文图鉴/符文之语页签、回收设置里的符文行、缩颅/法球等 D2 部位选项。
cq/ui_cq.js:5:const BAD_BTN=/^(符文图鉴|炼金匣|符文|宝石|符文宝石|高阶符文|符文之语|缩颅|法球)(\s|$|（|\()/;
cq/ui_cq.js:6:const BAD_ROW=/^(符文[：:]|符文之语|高阶符文|缩颅|法球)/;
cq/stash_cq.js:7:// 旧存档（暗夜结构 20 页）：把物品压缩进前 N 页；装不下则保留所需页数（只增不删，绝不丢物品）。ACCT.sv 记录账号层版本。
lock.js:4:// 锁定物品：不可出售/一键出售/自动回收；不会被炼金匣等配方当材料消耗；不能作为重铸/拆除/升级/改造/提取等破坏性操作的目标；
lock.js:5:// 不被自动换装（角色/佣兵）替换。全部为运行时包装，不改他人源文件。
offpeek.js:6:// 已接入：离线收益 offline、深渊虚隙结果 egRiftResult、秘境结果 egMjResult、悬赏宝箱 egOpenCache。
offpeek.js:7:// （虚隙/秘境自动连打不弹结果窗，无倒计时需暂停；掉落记录 dlog.js 本就可点。）
cq/battle_mount.js:3:// 暗夜自有战斗画面（#mgrid/#arow/#fx + art2_atmo/char）不再作为主战场。
cq/battle_mount.js:16:   * 从暗夜 calc() 结果映射到传奇战斗属性（M1 由 cq_bridge 填充）。
cq/battle_mount.js:80:// 暗夜旧页签（背包/商店/佣兵/终局）不再出现在底栏：背包/商店/佣兵并入「角色」页顶部子页签；「福利」= 原终局页（悬赏/功业/事件/设置…）。
cq/battle_mount.js:85:// 英雄页沿用旧佣兵子页签键，存档与界面名称均为英雄。
dlog.js:4:// 亮眼掉落：暗金/套装/符文之语/20号及以上符文/可做 3 孔以上符文之语的白色·精良空孔底材。
dlog.js:11: return false}// 符文之语已删除
dlog.js:12:// q码：u暗金 s套装 w符文之语 r符文 b底材
dlog.js:27:function displayName(value){return /暗夜|暗黑|符文|护身符|炼金|凹槽|暗金|威能|虚隙|秘径|纪元|佣兵|抗性|吸血|魔法物品|技能点|属性点|亡灵|necromancer/i.test(String(value))?'旧版装备':value}
dmgstats.js:2:// 归属：技能施放期间的英雄伤害→该技能；heroAct 内非施法→普通攻击；召唤物→召唤它的技能；佣兵→佣兵；
audio.js:3:// 音效：普攻 / 技能 / 掉落(按品质，暗金/套装/符文之语特殊) / 升级 / UI 点击。
audio.js:124://       ③ 同类同时发声上限 CAT_MAX；④ 召唤物/佣兵/命中类额外随机稀疏，避免满屏召唤物时成噪音。
audio.js:179: // 诅咒（共用暗黑和弦底色，音程/音色各异）
audio.js:248:// --- 召唤物 / 佣兵 / 命中 / 暴击 / 格挡 ---
audio.js:265:// 命中 / 暴击(致命一击黄色飘字) / 召唤物与佣兵攻击：包装最外层 hitMon
audio.js:272:// 格挡：英雄格挡飘字 / 佣兵格挡飘字
audio.js:277:// 1 稀有 · 2 暗金/套装 · 3 高符文 · 4 上古/至臻 · 5 神话。不受战斗页限制，受音效音量/静音/后台暂停控制。
audio.js:282: (D,t)=>{// 暗金/套装：低沉坠地 + 上行钟组
audio.js:284: (D,t)=>{// 高符文：重石坠地「咚」+ 石面共振 + 符文低鸣，余韵 2 秒
audio.js:294: (D,t)=>{// 神话：大地震颤 → 三连坠地 → 管风琴般的暗金和声 + 合唱 + 丧钟，约 4 秒
audio.js:309:// AUDIO.reforge(kind)：charge 蓄力(~1s 熔炉+符文嗡鸣) / reveal 翻牌(连续 3 次不吞，音高递升) / pick 选定 / perfect 满值华丽。
audio.js:314:  for(const d of[-8,8])tone(D,{f:mtof(38),glide:mtof(45),t,dur:1,type:'sawtooth',vol:0.05,a:0.6,d:0.2,sus:0.9,r:0.25,cut:700,q:5,det:d,wet:0.5});// 符文嗡鸣上升
audio.js:333:// 否则最高品质为暗金及以上（暗金/套装/符文之语/高符文≥20号/上古/至臻/神话）→ 自己补播对应分档音效，旧 drop 音永不播；
audio.js:334:// 其余（稀有/魔法/符文/宝石/普通）播旧 drop 音。离线结算/无 UI 时静默。
items2.js:4:// 双手武器、珠宝镶嵌、护身符（背包生效）、撕裂伤口/压碎性打击/致命一击等属性生效、详情显示修正、
items2.js:5:// 珠宝/护身符掉落、升级/修复配方、新武器图标、随从可用弓/长柄。必须在 acts.js 之后加载。
items2.js:7:const CATN={wand:'魔杖',dagger:'匕首',sword:'剑',helm:'头盔',armor:'铠甲',shield:'盾',head:'缩颅',bow:'弓',xbow:'弩',polearm:'长柄',spear:'矛',jav:'标枪',throw:'投掷',axe:'斧',mace:'锤',staff:'法杖',jewel:'珠宝',scha:'小护身符',mcha:'大护身符',lcha:'超大护身符',gloves:'手套',belt:'腰带',boots:'靴子',pshd:'圣徽盾',pelt:'毛皮头饰',bhelm:'野蛮人头盔',orb:'法球',abow:'弓'};
items2.js:9:// 护身符/珠宝（isCharm/isJewel/charmMods/genJC/jewelUI）与炼金匣升级/修复配方已删除（legacy_prune 批次2）
items2.js:25: // 最大抗性：超出 75 的部分最多可到 75+最大抗性
items2.js:57:// ---------- 物品详情：属性统一显示、双手、珠宝/护身符按钮 ----------
cq/data_cq.js:4:// 原地替换暗夜 D2 数据表：部位名、品质名、底材 BASES/BASEM、词缀 PREFIX/SUFFIX、极品 UNIQUES、套装 SETS/SETITEMS、
cq/data_cq.js:9:// ---------- 部位：内部键沿用暗夜（避免改装备/对比/仓库逻辑），显示名换成传奇 10 部位 ----------
cq/data_cq.js:12:// ---------- 品质：0/2/7/8 不再产出（破旧/超强/合成/符文之语），保留下标以兼容旧逻辑 ----------
cq/data_cq.js:106: def:'防御 +{v}',ar:'准确 +{v}',dex:'敏捷 +{v}',life:'生命 +{v}',mana:'魔法值 +{v}',ias:'攻速 +{v}%',ll:'吸血 {v}%',mf:'寻宝 +{v}%',gf:'金币 +{v}%',
cq/data_cq.js:108:// ---------- 极品（暗金位）：第 1 章 + 特戒；boss 字段 = 该首领专属（bossloot.js 优先使用，方案 §5.3 每首领 2–4 件） ----------
cq/data_cq.js:129:// ---------- 符文 / 符文之语 / 宝石：数据层清空（M1 已定不做；旧存档中的符文由迁移折算，见 cq/sys_cq.js） ----------
cq/pages_cq.js:78:// 与战斗页 #cqStage .cqb .top 同一组件外观（样式同 cq.css .cqb .top），这里给 角色(含背包/商店/佣兵)/技能/福利 页单独挂一份；地图页、战斗页不显示。
cq/pages_cq.js:95:// 第四章起仍是暗夜数据，只显示「敬请期待」卡；原地图页（难度切换/主线任务/其他扩展）保留在底部「难度 · 任务」折叠区。
bloodmoon.js:3:// 精英/头目必掉 1 件魔法以上；专属掉落「破障护符」6 种。秘境/虚隙等终局模式中不生效。
bloodmoon.js:4:// 破障护符（小护身符，背包生效，同类不叠加）：目标该伤害类型有效抗性上限 80→40（含免疫）；代价：自身同系抗性 -25（骨裂/虚空无对应抗性，改为所有抗性 -10/-15）。
bloodmoon.js:15:function wardMake(k){const W=BM.WARD[k];if(!W||!BASEM.cha_s)return null;/* 老羊传奇：D2 护身符底材已移除，破障护符待 M4「血月降临」重做 */const it=makeBase(BASEM.cha_s,Math.min(99,(S&&S.lvl)||1));it.q=5;it.name='破障护符·'+W.n;it.ward=k;it.req=1;it.m=Object.assign({},W.m);it.uid=S.uid++;return it}
bloodmoon.js:20:// charmMods 包装已删除（护身符已移除，legacy_prune）
bloodmoon.js:26: const h=`<div class="sec bmward">破障：目标<b>${ELN[it.ward]}</b>系有效抗性上限 80→${BM.CAP}（含免疫）<br><small class="dim">放在背包生效，同类不叠加 · 血月之地专属掉落</small></div>`;const b=p.querySelector('.btns');if(b)b.insertAdjacentHTML('beforebegin',h);else p.insertAdjacentHTML('beforeend',h)}}catch(e){console.warn(e)}return r}}
data_acts.js:30:// 仅主线区域：任何终局模式（EGM：秘境/虚隙/魂狱/暗渊/隐秘等）与奶牛关不生效（CLS_XPK/CLS_HPK 共用）
data_acts.js:35:// ---------- 第一章怪物：补充噩梦/地狱抗性 ----------
data_acts.js:36:// resN/resH 未写时：噩梦 = 普通非零抗性 +15，地狱 = +30（≥100 即免疫）
data_acts.js:44:// sk: 怪物技能 charge冲撞 frost冰霜新星 nova元素新星 spark闪电弹 randel随机元素弹 poisbreath毒息 inferno烈焰喷吐 leech吸血 manaburn噬法 curse诅咒(降抗) stun重击眩晕 web缠网 revive复活同伴 heal治疗同伴 chill冰寒光环(减速)
data_acts.js:228: a2q2:{act:1,n:'合铸权杖',d:'收集 符文匣、权杖杖身、蛇首护符',rw:'开启真墓',parts:{cube:'符文匣',shaft:'权杖杖身',amulet:'蛇首护符'}},
data_acts.js:242: a5q1:{act:4,n:'围城',d:'击败 围城统领·申克',rw:'铁匠为一件物品加凹槽'},
data_acts.js:244: a5q3:{act:4,n:'冰牢',d:'击败冻河的 冰封典狱·弗洛斯，救出巫女',rw:'永久所有抗性 +10'},
gamble_fix.js:3:// 永不被自动回收 / 自动存仓 / 自动换装(本人与佣兵) 挪走，留在背包里由玩家在弹窗中自行决定（装备/锁定/存仓/出售）。
settings.js:11:  o.game=g?g.innerHTML.replace(/自动出售（无凹槽）/g,'自动回收').replace(/<h3>[\s\S]*?<\/h3>/,''):'';o.audio=tmp.querySelector('#audioSet')?.innerHTML.replace(/<h3>[\s\S]*?<\/h3>/,'')||'';
art2_icon3.js:3:// art2_icon3.js — 美术2：终局/章节/佣兵/回收 emoji → 手绘图标 assets/icon3/<slug>.webp（计划：/workspace/emoji_plan.json）
art2_icon3.js:31:// 底部导航：只换终局/佣兵两个按钮的图标（不碰战斗/角色/技能等其他按钮）
art2_icon3.js:42:// ---------- 秘径蘑菇怪立绘（原只有 emoji 占位）----------
cq/sys_cq.js:4:// 1) 品质：不再产出 破旧/超强/合成/符文之语；底材自带属性 bm（传奇白字）写入 it.m；无凹槽
cq/sys_cq.js:5:// 2) 符文/宝石掉落 → 黑铁矿；熔炼匣（炼金匣）入口关闭
cq/sys_cq.js:8:// 5) 存档版本 S.sv / ACCT.sv 与迁移 cqMigrate（只处理本作 cq_ 存档，绝不读取暗夜 anye_ 数据）
cq/sys_cq.js:28:// ---------- 黑铁矿（原符文/宝石掉落位） ----------
cq/sys_cq.js:38:// v0（暗夜结构 fork 后首次）→ v1：去掉符文/宝石/凹槽/符文之语；D2 底材物品折算金币；补强化字段
cq/sys_cq.js:51: // v5（自动成长）：属性改为按等级推导；剩余属性点/技能点、洗点药水折金币；技能等级 20 → 9 按比例映射（职业侧 clsSk9：ceil(1+(旧-1)×8/19)）
cq/sys_cq.js:70:// ---------- 自动成长（docs/auto_growth_plan.md，照原版传奇之旅：升级不给属性点/技能点） ----------
cq/sys_cq.js:74:// 旧点数折金币：属性点 100×(1+等级/10)、技能点 500×(1+等级/10)（每点）
cq/mir2_b6.js:17:// 同名、同底材、同品质；绑定/锁定、套装/暗金、上古装备不作为融合原料。
cls_ds.js:6:// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（灵魂火符 150%+18 → 245%+1202、施毒 3→4 目标、5 秒冷却）。
cq/mir2_maps.js:120:  "n": "暗黑战士",
art_map.js:15:// 首饰类无档次：按品质取色（普通/魔法+/暗金及以上）
late.js:3:// 主属性：超出职业初始值的部分每 X 点 → 所有技能、攻击、召唤物伤害 +1%（雇佣兵不算）
late.js:32:// 伤害：英雄与召唤物（非雇佣兵）的所有命中
late.js:33:// 亡灵召唤物（骨仆/骨巫/复生/魔像等，不含雇佣兵）地狱段额外系数：55 级前 =1（普通/噩梦不变），地狱 2–3 秒击杀普通怪
late.js:43:// 详情显示：伤害没有走协同系数的技能（如亡灵召唤物），把伤害区间按倍率换算后替换到文字里
classes.js:30:// 属性自动成长：S.at = 初始 + floor(每级成长 × (L-1))（升级不给属性点）
classes.js:131:function clsResK(s,ms){const el=s.el||(CLS_MELEE.has(s.ty)?(SV(s.id,slvl(s.id)).el||'phys'):null);if(!el||!ms.length)return 1;let a=0;for(const m of ms)a+=Math.max(0,1-resOf(m,el)/100);return a/ms.length}// 估值计入目标抗性：免疫时改用其他元素/魔法技能
classes.js:158:// 旧存档清理（一次）：不属于本职业的已学技能（例如旧版战士自动学到的召唤/骨系技能）退还技能点；空技能的角色补本职业初始技能
classes.js:159:// 旧存档清理（一次）：已删除模块（late_mods 魔改技能 x*_ 等）残留的技能 id，不在 SKM 中的退还技能点
classes.js:163: if(back){S.kp=(S.kp||0)+back;if(S.main&&!SKM[S.main])S.main=null;if(typeof log==='function')try{log(`<b style="color:#ffd76a">技能整理：移除已下线技能，退还技能点 ${back}</b>`)}catch(e){}}}
classes.js:167: S.kp=(S.kp||0)+back;S.main=null;S.curse=null;if(gone.length&&typeof log==='function')try{log(`<b style="color:#ffd76a">职业技能整理：移除非本职业技能 ${gone.join('、')}，退还技能点 ${back}</b>`)}catch(e){}}
classes.js:193:// 技能学习 / 升级（沿用原版「传奇之旅」skill.txt）：升级不再给技能点，技能只能用技能书学习、升级
classes.js:219:// 学习/升级按原版（职业相符、等级够、熟练度够、书够），不用技能点
sw.js:2:/* 缓存名前缀 cq-，与暗夜 anye- 隔离；同域部署互不删缓存 */
cloud.js:4:// 同步：有改动时每 20 秒防抖上传；切后台/关页面/切角色/锁定/暗金套装掉落立即上传；失败指数退避重试并显示状态。
cloud.js:126: <div class="btns"><button class="btn sm gold" onclick="flushNow().then(()=>render())">立即同步</button><button class="btn sm" onclick="clSignOut()">退出登录</button></div>${chSwBtn()}<div class="dim">存档仅保存在云端：有改动时约 20 秒自动同步，切到后台、切换角色、锁定物品、掉落暗金/套装时立即同步。</div></div>`
tianguang.js:5: TAG:{unique:'暗金',set:'套装',ancient:'上古',primal:'至臻',hirune:'高阶符文',mythic:'终极'},
cq/m2_cq.js:100:// 任务奖励「技能书 ×n」（替代旧技能点）：本职业、未满级、需求等级 ≤ 当前等级的书里，优先已学会的（升级用）
cls_fs.js:5:// 技能书最高 9 级，不分配技能点。数值参考 web-replica skill.txt（雷电 150%→285%、冰咆哮 240%+173 → 330%+1333、5→6 目标）。
cls_zs.js:5:// 技能书最高 9 级，不分配技能点；需求等级按 1.76 学习顺序压缩到 M1 第一章（1–16 级）。
cls_zs.js:11:// 基本剑术附带吸血（1.76 无单独吸血技能，并入剑术被动）：[1 级, 上限] %
items.js:3:// items.js — 装备生成 / 掉落 TC / 镶嵌 / 炼金匣 / 储物箱（覆盖 game.js 中的同名函数）
items.js:44:  q=4;it.dur3=1} // 原版：暗金失败 → 稀有（3 倍耐久）
items.js:57:function finishDefense(it,b){/* 暗金/套装的 def 区间作为本地加成；防御基础值已在 makeBase 生成 */return it}
items.js:61:// socketMods：宝石/符文/符文之语已删除（legacy_prune 批次2），沿用 game.js 的空实现
items.js:67:// 掉落「好东西」：只出戒指/护符（符文/宝石已删除；cq/sys_cq.js 会再覆盖为首饰/黑铁矿）
items.js:113:// 镶嵌 / 炼金匣 / 合成已删除（legacy_prune 批次2）
items.js:120:// 法系流派套装/暗金（亡灵 3 流派 + cls_build 中 role:'caster' 的流派）：力量/敏捷需求再封顶 30。
cq/hero_page.js:22: return `<div class="cqpg hppage">${tabs}${panel('英雄 · '+N[c],'主角 '+N[S.cls]+' · 等级不超过主角',top)}${panel('英雄装备','背包穿戴 · 点击装备格',eq)}${panel('合击','主角职业 + 英雄职业',`<div class="hpcombo"><img src="${U}${cb?cb.fx:'btn_heji'}.png"><div><b>${esc(cb&&cb.name)}</b><div class="dim">${esc(cb&&cb.desc)}</div><div class="dim">怒气满 100 可放</div></div>${toggle('heji',off.heji)}</div>`)}${panel('英雄技能','技能书升级 · Lv.1–9 · 开关',skills)}<p class="dim">技能书与熟练度满足条件后升级，不加属性点、技能点。</p></div>`;
```

必须修复：MUST-FIX-01（迁移魔御进入实际防护并验证等价）、MUST-FIX-02（清除三个已确认日常界面的禁词）。修复后重新审核；低04死模板及旧测试断言需明确处理。
VERDICT: CHANGES_REQUESTED
