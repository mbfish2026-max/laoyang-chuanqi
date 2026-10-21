# 老羊传奇 · 系统侧接口（M1）

All of these live on `window.CQSys`. Data/numbers come from `CQ_BAL` in cq/balance.js. Load order in index.html: `… cq/sys_cq.js → cq/enhance.js → cq/stash_cq.js → cq/ui_cq.js → cq/sysapi_cq.js → cq/battle_mount.js`. The battle engine is loaded dynamically by battle_mount after DOMContentLoaded, so it sits on the outermost layer and can wrap freely.
This replaces the fallbacks in `CQ.MISSING` in cq_bridge.js. Detection: `window.CQSys && CQSys.api===1`.
**No signature changes**: hitMon(m,d,src,fxc), floatNum, killMon(m), groundLoot and usePot(k) are only wrapped at runtime, so their parameters and return values are unchanged.

## Events
`CQSys.on(ev, fn) → off()`. A `window` CustomEvent `cq:<ev>` (detail is the same as the payload) also fires at the same time.
| ev | detail |
|---|---|
| `char` | `{id, cls}` new character |
| `hero` | the S.hero object (create / modify / equip changes) |
| `skill` | `{id, t}` skill cast |
| `yb` | `{d, why, yb}` 元宝 change |
| `crit` | `{crit:true, src, dmg, t}` |
| `bossSpawn` | `{key, name, enrageIn}` (seconds) |
| `bossEnrage` | `{key, mul}` |
| `bossDead` | `{key}` |

## Classes / character creation
- `CQSys.classes() → [{id:'zs'|'fs'|'ds', n, d, ic, open}]`
- `CQSys.createChar(name, cls, mode?) → id` (creates and switches to the new character; wraps stash.js `newChar`). Returns 0 when the class isn't open.
- `CQSys.curCls() → 'zs'|'fs'|'ds'`

## Hero (saved with the character: `S.hero`, so it goes into the cloud save automatically and is separate per character)
- `CQSys.hero() → {cls, name, lvl, rage(0–100), autoHeji(0/1), eq:{slot:item}, t}`. Missing fields are filled with defaults.
- `CQSys.heroProfs() → [cls…]`: recommended hero classes (zs → fs/ds, others → zs first)
- `CQSys.heroCreate(cls, name?) → {ok, hero} | {err:'已有英雄'|'职业无效'}`: one per character
- `CQSys.heroSet({name?, rage?, autoHeji?}) → hero`
- `CQSys.heroEquip(uid) → {ok, slot} | {err}` (moves from the bag; class-locked bases check the hero's class) / `CQSys.heroUnequip(slot) → {ok}|{err:'背包已满'}`
- `CQSys.heroStats() → {cls, lvl, atkMin, atkMax, def, mdef, hp, takesDmg, heroK}`. Formula: hero gear + level × `CQ_BAL.hero.cls[cls]` (placeholder, **numbers to be confirmed by the class/numbers side**). `takesDmg=0` means the hero currently takes no damage.

## Player stats / gear
- `CQSys.equipAttrs()`: totals of the player's equipped attributes (with enhancement). `CQSys.itemCls(it)`: the item's class.
- `CQSys.power() → int` combat power: sum of equipped `power(it)` + hero gear ×0.5 + level×20, × rebirth multiplier (capped at `cqCapMul` 1.8)

## Skill cooldowns (filled in by the class bot)
- Registry `window.CQ_SKCD[skillId] = cooldown in seconds`
- `CQSys.skillCast(id)`: call when the skill is cast (the class bot calls it at its cast point)
- `CQSys.skillCooldown(id) → {id, cd, left, ready, placeholder}`. `placeholder:true` means no cooldown is registered for it; the battle side can keep using its fallback.

## Monster → 传奇 portraits
- `CQSys.monArt(key) → {id, src:'assets/cq/ui/<id>.png'} | null`. The table is `window.CQ_MONART` (chapter-1 monsters/bosses are mapped to the 5 existing portraits; it can be extended by assignment)

## 元宝 (account-level `ACCT.yb`, saved to the cloud, shared across characters)
- `CQSys.currency() → {gold, yb}`; `CQSys.ybAdd(n, why) → balance`; `CQSys.ybSpend(n, why) → bool`

## Crit flag (replaces the global CRIT)
- `CQSys.critNow`: true while hitMon is running if this hit is a crit (it counts the old CRIT and also rolls the equipment stat `crit`% × `CQ_BAL.critMul`=1.5; doesn't roll for hero/dot sources)
- `CQSys.hit = {crit, src, dmg, t}`: the most recent hit; crits also emit `crit`

## Boss spawn / enrage
- `CQ_BAL.boss = {respawn:60, enrage:90, enrMul:1.5}` (seconds)
- `CQSys.bossInfo()`: while alive `{alive:true, key, spawnAt, enrageAt, enrageLeft, enraged}`; after death `{alive:false, killAt, respawnAt, respawnLeft}`
- step() runs `bossTick()` after each call: it detects boss spawn/death and enrages after 90 s (`m.dmg×1.5`, `m.cqEnr=1`)

## Potions (unchanged; the battle side only calls them)
- **Potion function `usePot(k)`** (game.js:279), `k ∈ 'hp'|'mp'|'rej'|'tp'` (红药 / 蓝药 / 瞬回 / 回城; `tp` goes to `townPortal()`). Does nothing when the count is 0. Also available as `CQSys.usePot(k)` and `CQSys.potions() → {hp, mp, rej, tp}` (stock in `S.pot`).
- **Auto-drink already exists**: inside `step(dt)` in game.js (lines 237–239), with no toggle and no separate entry point: HP < 40% and not already drinking → 红药 (heals 50% over 7 s, `H.potT`); HP < 20% → 瞬回 (35% HP/MP immediately); MP < 15% → 蓝药 (60% over 5 s, `H.mpT`).
- **The three bars' ids (structure unchanged)**: potion bar `#pots` (buttons `#pb_hp #pb_mp #pb_rej #pb_tp`, counts `#p_hp #p_mp #p_rej #p_tp`; click handlers are bound in game.js:504); quest row `#fquest`; area bar `#fzone`.

## Other
- `CQSys.rollDrops(m)`, `addItem(it)`, `addMat/matCount/takeMat`, `acts()/zone()/monDef(id)` are listed in docs/systems_m1.md.
- `cqEnhance(uid,{oil})` enhancement; `cqStashExpand('p'|'s')` warehouse.
