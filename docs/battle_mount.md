# 战斗页挂载点（给战斗开发 Bot）

## DOM
- 容器：`#cqStage`（在 `#fbattle` 内，位于 `#ftop` 下方）
- 壳宽约 390 CSS px；传奇 `cc.js` 设计宽 750，建议 `transform:scale(390/750)` 挂入
- 暗夜原战场节点 `#mgrid` / `#arow` / `#fx` 已加 `.cq-legacy-hide`，**不要再往那里画**

## JS 接口 `window.CQBattle`
| 方法 | 说明 |
|------|------|
| `stage()` | 返回 `#cqStage` |
| `isActive()` | 是否在战斗页签 |
| `mapAttrs()` | 从暗夜 `ST`/`S` 映射攻防等（M1 由 `cq_bridge.js` 完善） |
| `onKill(monSpec)` | 击杀后触发掉落（接 `loot.js` / `rollTC`） |
| `pause()` / `resume()` | 切页签时壳会调用；引擎应停/开 move/fx 计时器 |
| `register(impl)` | 战斗引擎把自己挂到 `window.CQ_impl` |

## 文件
- `cq/battle_mount.js` / `cq/battle_mount.css` — 本挂载点
- 后续：`cq/battle_scene.js`、`cq/battle_core.js`、`cq_bridge.js`（见设计方案 §2.2）

## 样稿
`/workspace/design/chuanqi_v2_live/`（只参考，本 M0 不实现战斗）
