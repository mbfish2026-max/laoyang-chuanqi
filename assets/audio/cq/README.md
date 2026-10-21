# 传奇原版采样（占位）
来源：/workspace/chuanqi/src/assets/resources/audio/（「传奇之旅」所复刻的 Cocos 传奇手游拆包），原文件原样复制（game_die.wav→mp3 64k 单声道）。
按设计方案 §10，拆包素材仅作占位，上线前需同名替换为 AI 生成音频。由 audio_cq.js 加载，缺失文件自动回落到 audio.js 合成音。
| 文件 | 原文件 | 用途 |
|---|---|---|
| bgm_login.mp3 | bgsound_login.mp3 (34s) | 登录/选角/建角弹窗 BGM |
| bgm_town.mp3 | bgsound_sellect.mp3 (44s) | 城镇/新手村 BGM |
| bgm_field.mp3 | bgsound_create.mp3 (36s) | 野外 BGM |
| game_*.mp3, ui_*.mp3, bgsound_openDoor.mp3 | 同名 | 金币/升级/死亡/切图/喝药/点击/装备 |
| skill/sNNNN.mp3 | skill/mp3_sNNNN.mp3 | 1.76 技能施放音（999 普攻，1002 攻杀…3007 神圣战甲） |
