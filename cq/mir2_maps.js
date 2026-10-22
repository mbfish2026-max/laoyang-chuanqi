// Mir2 block 3. Load after data_cq2.js, before applyDiff / first character load.
// Reference numbers stay separate from player unlock levels; equipment definitions are untouched.
(function(){
'use strict';
if(window.CQMir2Maps)return;
const NORMALS={
 "cqwomawar": {
  "n": "沃玛战士",
  "ic": "◆",
  "hp": 265,
  "dmg": [
   14,
   28
  ],
  "ar": 13,
  "exp": 260,
  "refLv": 30,
  "ref": {
   "lv": 30,
   "exp": 260,
   "hp": 265,
   "def": 3,
   "mdef": 2,
   "dmg": [
    14,
    28
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqwomabrave": {
  "n": "沃玛勇士",
  "ic": "◆",
  "hp": 285,
  "dmg": [
   16,
   28
  ],
  "ar": 13,
  "exp": 280,
  "refLv": 30,
  "ref": {
   "lv": 30,
   "exp": 280,
   "hp": 285,
   "def": 3,
   "mdef": 2,
   "dmg": [
    16,
    28
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqwomageneral": {
  "n": "沃玛战将",
  "ic": "◆",
  "hp": 285,
  "dmg": [
   15,
   29
  ],
  "ar": 13,
  "exp": 280,
  "refLv": 30,
  "ref": {
   "lv": 30,
   "exp": 280,
   "hp": 285,
   "def": 3,
   "mdef": 2,
   "dmg": [
    15,
    29
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqfirewoma": {
  "n": "火焰沃玛",
  "ic": "◆",
  "hp": 340,
  "dmg": [
   14,
   26
  ],
  "ar": 20,
  "exp": 290,
  "refLv": 31,
  "ref": {
   "lv": 31,
   "exp": 290,
   "hp": 340,
   "def": 0,
   "mdef": 0,
   "dmg": [
    14,
    26
   ],
   "ar": 20,
   "dex": 20,
   "interval": 1700
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqdarkwar": {
  "n": "暗黑战士",
  "ic": "◆",
  "hp": 165,
  "dmg": [
   9,
   16
  ],
  "ar": 15,
  "exp": 200,
  "refLv": 26,
  "ref": {
   "lv": 26,
   "exp": 200,
   "hp": 165,
   "def": 3,
   "mdef": 2,
   "dmg": [
    9,
    16
   ],
   "ar": 15,
   "dex": 15,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqcentipede": {
  "n": "蜈蚣",
  "ic": "◆",
  "hp": 230,
  "dmg": [
   12,
   18
  ],
  "ar": 13,
  "exp": 230,
  "refLv": 26,
  "ref": {
   "lv": 26,
   "exp": 230,
   "hp": 230,
   "def": 0,
   "mdef": 5,
   "dmg": [
    12,
    18
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqblackmaggot": {
  "n": "黑色恶蛆",
  "ic": "◆",
  "hp": 230,
  "dmg": [
   10,
   15
  ],
  "ar": 13,
  "exp": 180,
  "refLv": 28,
  "ref": {
   "lv": 28,
   "exp": 180,
   "hp": 230,
   "def": 5,
   "mdef": 0,
   "dmg": [
    10,
    15
   ],
   "ar": 13,
   "dex": 15,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 5
 },
 "cqjumpbee": {
  "n": "跳跳蜂",
  "ic": "◆",
  "hp": 200,
  "dmg": [
   12,
   18
  ],
  "ar": 13,
  "exp": 210,
  "refLv": 26,
  "ref": {
   "lv": 26,
   "exp": 210,
   "hp": 200,
   "def": 3,
   "mdef": 3,
   "dmg": [
    12,
    18
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqworm": {
  "n": "巨型蠕虫",
  "ic": "◆",
  "hp": 200,
  "dmg": [
   15,
   18
  ],
  "ar": 13,
  "exp": 230,
  "refLv": 26,
  "ref": {
   "lv": 26,
   "exp": 230,
   "hp": 200,
   "def": 3,
   "mdef": 3,
   "dmg": [
    15,
    18
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqpincer": {
  "n": "钳虫",
  "ic": "◆",
  "hp": 270,
  "dmg": [
   15,
   25
  ],
  "ar": 13,
  "exp": 250,
  "refLv": 31,
  "ref": {
   "lv": 31,
   "exp": 250,
   "hp": 270,
   "def": 5,
   "mdef": 7,
   "dmg": [
    15,
    25
   ],
   "ar": 13,
   "dex": 15,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 5
 },
 "cqhornfly": {
  "n": "角蝇",
  "ic": "◆",
  "hp": 200,
  "dmg": [
   0,
   0
  ],
  "ar": 1,
  "exp": 300,
  "refLv": 30,
  "ref": {
   "lv": 30,
   "exp": 300,
   "hp": 200,
   "def": 0,
   "mdef": 6,
   "dmg": [
    0,
    0
   ],
   "ar": 1,
   "dex": 1,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqwedgemoth": {
  "n": "楔蛾",
  "ic": "◆",
  "hp": 220,
  "dmg": [
   13,
   18
  ],
  "ar": 12,
  "exp": 350,
  "refLv": 32,
  "ref": {
   "lv": 32,
   "exp": 350,
   "hp": 220,
   "def": 0,
   "mdef": 5,
   "dmg": [
    13,
    18
   ],
   "ar": 12,
   "dex": 15,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqredboar": {
  "n": "红野猪",
  "ic": "◆",
  "hp": 330,
  "dmg": [
   18,
   25
  ],
  "ar": 13,
  "exp": 320,
  "refLv": 32,
  "ref": {
   "lv": 32,
   "exp": 320,
   "hp": 330,
   "def": 0,
   "mdef": 8,
   "dmg": [
    18,
    25
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqblackboar": {
  "n": "黑野猪",
  "ic": "◆",
  "hp": 310,
  "dmg": [
   20,
   26
  ],
  "ar": 13,
  "exp": 380,
  "refLv": 35,
  "ref": {
   "lv": 35,
   "exp": 380,
   "hp": 310,
   "def": 10,
   "mdef": 0,
   "dmg": [
    20,
    26
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 10
 },
 "cqscorpionsnake": {
  "n": "蝎蛇",
  "ic": "◆",
  "hp": 330,
  "dmg": [
   22,
   28
  ],
  "ar": 13,
  "exp": 360,
  "refLv": 35,
  "ref": {
   "lv": 35,
   "exp": 360,
   "hp": 330,
   "def": 5,
   "mdef": 3,
   "dmg": [
    22,
    28
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 5
 },
 "cqrat": {
  "n": "大老鼠",
  "ic": "◆",
  "hp": 385,
  "dmg": [
   12,
   23
  ],
  "ar": 12,
  "exp": 330,
  "refLv": 24,
  "ref": {
   "lv": 24,
   "exp": 330,
   "hp": 385,
   "def": 3,
   "mdef": 5,
   "dmg": [
    12,
    23
   ],
   "ar": 12,
   "dex": 15,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 3
 },
 "cqzumaarcher": {
  "n": "祖玛弓箭手",
  "ic": "◆",
  "hp": 385,
  "dmg": [
   12,
   18
  ],
  "ar": 15,
  "exp": 370,
  "refLv": 40,
  "ref": {
   "lv": 40,
   "exp": 370,
   "hp": 385,
   "def": 10,
   "mdef": 10,
   "dmg": [
    12,
    18
   ],
   "ar": 15,
   "dex": 15,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 10,
  "ranged": 1
 },
 "cqzumastatue": {
  "n": "祖玛雕像",
  "ic": "◆",
  "hp": 495,
  "dmg": [
   20,
   32
  ],
  "ar": 15,
  "exp": 450,
  "refLv": 42,
  "ref": {
   "lv": 42,
   "exp": 450,
   "hp": 495,
   "def": 12,
   "mdef": 12,
   "dmg": [
    20,
    32
   ],
   "ar": 15,
   "dex": 17,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 12
 },
 "cqzumaguard": {
  "n": "祖玛卫士",
  "ic": "◆",
  "hp": 495,
  "dmg": [
   22,
   34
  ],
  "ar": 15,
  "exp": 480,
  "refLv": 43,
  "ref": {
   "lv": 43,
   "exp": 480,
   "hp": 495,
   "def": 15,
   "mdef": 15,
   "dmg": [
    22,
    34
   ],
   "ar": 15,
   "dex": 17,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 15
 },
 "cqfangspider": {
  "n": "暴牙蜘蛛",
  "ic": "◆",
  "hp": 500,
  "dmg": [
   22,
   34
  ],
  "ar": 17,
  "exp": 400,
  "refLv": 43,
  "ref": {
   "lv": 43,
   "exp": 400,
   "hp": 500,
   "def": 12,
   "mdef": 30,
   "dmg": [
    22,
    34
   ],
   "ar": 17,
   "dex": 17,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 12,
  "sk": [
   "web"
  ]
 },
 "cqwolfspider": {
  "n": "天狼蜘蛛",
  "ic": "◆",
  "hp": 500,
  "dmg": [
   22,
   34
  ],
  "ar": 15,
  "exp": 500,
  "refLv": 43,
  "ref": {
   "lv": 43,
   "exp": 500,
   "hp": 500,
   "def": 8,
   "mdef": 20,
   "dmg": [
    22,
    34
   ],
   "ar": 15,
   "dex": 17,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 8,
  "sk": [
   "web"
  ]
 },
 "cqflowerspider": {
  "n": "花吻蜘蛛",
  "ic": "◆",
  "hp": 750,
  "dmg": [
   20,
   60
  ],
  "ar": 17,
  "exp": 680,
  "refLv": 54,
  "ref": {
   "lv": 54,
   "exp": 680,
   "hp": 750,
   "def": 12,
   "mdef": 27,
   "dmg": [
    20,
    60
   ],
   "ar": 17,
   "dex": 25,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 12,
  "sk": [
   "web"
  ]
 },
 "cqpoisonspider": {
  "n": "剧毒蜘蛛",
  "ic": "◆",
  "hp": 1200,
  "dmg": [
   20,
   30
  ],
  "ar": 45,
  "exp": 530,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 530,
   "hp": 1200,
   "def": 5,
   "mdef": 10,
   "dmg": [
    20,
    30
   ],
   "ar": 45,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 5,
  "sk": [
   "web"
  ]
 },
 "cqmoonspider": {
  "n": "月魔蜘蛛",
  "ic": "◆",
  "hp": 850,
  "dmg": [
   27,
   27
  ],
  "ar": 50,
  "exp": 700,
  "refLv": 52,
  "ref": {
   "lv": 52,
   "exp": 700,
   "hp": 850,
   "def": 12,
   "mdef": 28,
   "dmg": [
    27,
    27
   ],
   "ar": 50,
   "dex": 20,
   "interval": 1000
  },
  "source": "1.76 Monster.DB",
  "def": 12,
  "sk": [
   "web"
  ]
 },
 "cqblackjawspider": {
  "n": "黑锷蜘蛛",
  "ic": "◆",
  "hp": 1200,
  "dmg": [
   15,
   75
  ],
  "ar": 17,
  "exp": 900,
  "refLv": 53,
  "ref": {
   "lv": 53,
   "exp": 900,
   "hp": 1200,
   "def": 11,
   "mdef": 30,
   "dmg": [
    15,
    75
   ],
   "ar": 17,
   "dex": 17,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 11,
  "sk": [
   "web"
  ]
 },
 "cqsteelspider": {
  "n": "钢牙蜘蛛",
  "ic": "◆",
  "hp": 800,
  "dmg": [
   35,
   50
  ],
  "ar": 20,
  "exp": 700,
  "refLv": 53,
  "ref": {
   "lv": 53,
   "exp": 700,
   "hp": 800,
   "def": 13,
   "mdef": 33,
   "dmg": [
    35,
    50
   ],
   "ar": 20,
   "dex": 17,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 13,
  "sk": [
   "web"
  ]
 },
 "cqphantomspider": {
  "n": "幻影蜘蛛",
  "ic": "◆",
  "hp": 1200,
  "dmg": [
   0,
   0
  ],
  "ar": 1,
  "exp": 900,
  "refLv": 53,
  "ref": {
   "lv": 53,
   "exp": 900,
   "hp": 1200,
   "def": 10,
   "mdef": 23,
   "dmg": [
    0,
    0
   ],
   "ar": 1,
   "dex": 1,
   "interval": 2200
  },
  "source": "1.76 Monster.DB",
  "def": 10,
  "sk": [
   "web"
  ]
 },
 "cqbloodzombie": {
  "n": "血僵尸",
  "ic": "◆",
  "hp": 1200,
  "dmg": [
   35,
   50
  ],
  "ar": 25,
  "exp": 800,
  "refLv": 47,
  "ref": {
   "lv": 47,
   "exp": 800,
   "hp": 1200,
   "def": 18,
   "mdef": 30,
   "dmg": [
    35,
    50
   ],
   "ar": 25,
   "dex": 10,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 18
 },
 "cqbullhead": {
  "n": "牛头魔",
  "ic": "◆",
  "hp": 330,
  "dmg": [
   15,
   25
  ],
  "ar": 13,
  "exp": 360,
  "refLv": 32,
  "ref": {
   "lv": 32,
   "exp": 360,
   "hp": 330,
   "def": 0,
   "mdef": 8,
   "dmg": [
    15,
    25
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqniumowar": {
  "n": "牛魔战士",
  "ic": "◆",
  "hp": 420,
  "dmg": [
   15,
   30
  ],
  "ar": 14,
  "exp": 400,
  "refLv": 33,
  "ref": {
   "lv": 33,
   "exp": 400,
   "hp": 420,
   "def": 2,
   "mdef": 8,
   "dmg": [
    15,
    30
   ],
   "ar": 14,
   "dex": 18,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 2
 },
 "cqniumofighter": {
  "n": "牛魔斗士",
  "ic": "◆",
  "hp": 460,
  "dmg": [
   20,
   38
  ],
  "ar": 15,
  "exp": 480,
  "refLv": 40,
  "ref": {
   "lv": 40,
   "exp": 480,
   "hp": 460,
   "def": 7,
   "mdef": 10,
   "dmg": [
    20,
    38
   ],
   "ar": 15,
   "dex": 18,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 7
 },
 "cqniumoguard": {
  "n": "牛魔侍卫",
  "ic": "◆",
  "hp": 500,
  "dmg": [
   26,
   44
  ],
  "ar": 15,
  "exp": 580,
  "refLv": 40,
  "ref": {
   "lv": 40,
   "exp": 580,
   "hp": 500,
   "def": 10,
   "mdef": 18,
   "dmg": [
    26,
    44
   ],
   "ar": 15,
   "dex": 17,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 10
 },
 "cqniumogeneral": {
  "n": "牛魔将军",
  "ic": "◆",
  "hp": 750,
  "dmg": [
   32,
   50
  ],
  "ar": 17,
  "exp": 780,
  "refLv": 45,
  "ref": {
   "lv": 45,
   "exp": 780,
   "hp": 750,
   "def": 12,
   "mdef": 21,
   "dmg": [
    32,
    50
   ],
   "ar": 17,
   "dex": 22,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 12
 },
 "cqniumomage": {
  "n": "牛魔法师",
  "ic": "◆",
  "hp": 360,
  "dmg": [
   14,
   28
  ],
  "ar": 18,
  "exp": 440,
  "refLv": 40,
  "ref": {
   "lv": 40,
   "exp": 440,
   "hp": 360,
   "def": 12,
   "mdef": 15,
   "dmg": [
    14,
    28
   ],
   "ar": 18,
   "dex": 18,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 12,
  "ranged": 1
 },
 "cqniumopriest": {
  "n": "牛魔祭司",
  "ic": "◆",
  "hp": 750,
  "dmg": [
   25,
   42
  ],
  "ar": 17,
  "exp": 750,
  "refLv": 45,
  "ref": {
   "lv": 45,
   "exp": 750,
   "hp": 750,
   "def": 16,
   "mdef": 16,
   "dmg": [
    25,
    42
   ],
   "ar": 17,
   "dex": 22,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 16,
  "ranged": 1
 },
 "cqevilzombie": {
  "n": "恶灵僵尸",
  "ic": "◆",
  "hp": 180,
  "dmg": [
   10,
   20
  ],
  "ar": 15,
  "exp": 190,
  "refLv": 28,
  "ref": {
   "lv": 28,
   "exp": 190,
   "hp": 180,
   "def": 1,
   "mdef": 3,
   "dmg": [
    10,
    20
   ],
   "ar": 15,
   "dex": 15,
   "interval": 2500
  },
  "source": "1.76 Monster.DB",
  "def": 1
 },
 "cqskelhammer": {
  "n": "骷髅锤兵",
  "ic": "◆",
  "hp": 390,
  "dmg": [
   24,
   35
  ],
  "ar": 13,
  "exp": 450,
  "refLv": 35,
  "ref": {
   "lv": 35,
   "exp": 450,
   "hp": 390,
   "def": 6,
   "mdef": 9,
   "dmg": [
    24,
    35
   ],
   "ar": 13,
   "dex": 15,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 6
 },
 "cqskelspear": {
  "n": "骷髅长枪兵",
  "ic": "◆",
  "hp": 390,
  "dmg": [
   20,
   30
  ],
  "ar": 13,
  "exp": 380,
  "refLv": 32,
  "ref": {
   "lv": 32,
   "exp": 380,
   "hp": 390,
   "def": 0,
   "mdef": 12,
   "dmg": [
    20,
    30
   ],
   "ar": 13,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "cqskelaxe": {
  "n": "骷髅刀斧手",
  "ic": "◆",
  "hp": 440,
  "dmg": [
   24,
   31
  ],
  "ar": 13,
  "exp": 420,
  "refLv": 35,
  "ref": {
   "lv": 35,
   "exp": 420,
   "hp": 440,
   "def": 9,
   "mdef": 0,
   "dmg": [
    24,
    31
   ],
   "ar": 13,
   "dex": 15,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 9
 },
 "cqskelarcher": {
  "n": "骷髅弓箭手",
  "ic": "◆",
  "hp": 190,
  "dmg": [
   12,
   28
  ],
  "ar": 20,
  "exp": 240,
  "refLv": 32,
  "ref": {
   "lv": 32,
   "exp": 240,
   "hp": 190,
   "def": 0,
   "mdef": 0,
   "dmg": [
    12,
    28
   ],
   "ar": 20,
   "dex": 20,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0,
  "ranged": 1
 },
 "cqmolongfrog": {
  "n": "魔龙血蛙",
  "ic": "◆",
  "hp": 600,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 800,
  "refLv": 48,
  "ref": {
   "lv": 48,
   "exp": 800,
   "hp": 600,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "cqmolongbreaker": {
  "n": "魔龙破甲兵",
  "ic": "◆",
  "hp": 600,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 800,
  "refLv": 48,
  "ref": {
   "lv": 48,
   "exp": 800,
   "hp": 600,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "cqmolongarcher": {
  "n": "魔龙射手",
  "ic": "◆",
  "hp": 600,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 800,
  "refLv": 48,
  "ref": {
   "lv": 48,
   "exp": 800,
   "hp": 600,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60,
  "ranged": 1
 },
 "cqmolongblade": {
  "n": "魔龙刀兵",
  "ic": "◆",
  "hp": 600,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 800,
  "refLv": 48,
  "ref": {
   "lv": 48,
   "exp": 800,
   "hp": 600,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 }
};
const CHIEFS={
 "womaguard": {
  "n": "沃玛卫士",
  "ic": "👹",
  "hp": 1000,
  "dmg": [
   22,
   42
  ],
  "ar": 17,
  "exp": 1200,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 1200,
   "hp": 1000,
   "def": 8,
   "mdef": 8,
   "dmg": [
    22,
    42
   ],
   "ar": 17,
   "dex": 20,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 8
 },
 "womalord": {
  "n": "沃玛教主",
  "ic": "👹",
  "hp": 2200,
  "dmg": [
   35,
   60
  ],
  "ar": 20,
  "exp": 2500,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 2500,
   "hp": 2200,
   "def": 17,
   "mdef": 17,
   "dmg": [
    35,
    60
   ],
   "ar": 20,
   "dex": 30,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 17
 },
 "evilpincer": {
  "n": "邪恶钳虫",
  "ic": "👹",
  "hp": 1000,
  "dmg": [
   22,
   45
  ],
  "ar": 17,
  "exp": 1400,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 1400,
   "hp": 1000,
   "def": 20,
   "mdef": 10,
   "dmg": [
    22,
    45
   ],
   "ar": 17,
   "dex": 15,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "chulongshen": {
  "n": "触龙神",
  "ic": "👹",
  "hp": 1000,
  "dmg": [
   15,
   30
  ],
  "ar": 15,
  "exp": 2200,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 2200,
   "hp": 1000,
   "def": 0,
   "mdef": 200,
   "dmg": [
    15,
    30
   ],
   "ar": 15,
   "dex": 15,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 0
 },
 "whiteboar": {
  "n": "白野猪",
  "ic": "👹",
  "hp": 1000,
  "dmg": [
   30,
   55
  ],
  "ar": 17,
  "exp": 1600,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 1600,
   "hp": 1000,
   "def": 15,
   "mdef": 15,
   "dmg": [
    30,
    55
   ],
   "ar": 17,
   "dex": 25,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 15
 },
 "evilsnake": {
  "n": "邪恶毒蛇",
  "ic": "👹",
  "hp": 1100,
  "dmg": [
   30,
   55
  ],
  "ar": 17,
  "exp": 1800,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 1800,
   "hp": 1100,
   "def": 20,
   "mdef": 20,
   "dmg": [
    30,
    55
   ],
   "ar": 17,
   "dex": 25,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "zumaguard": {
  "n": "祖玛卫士",
  "ic": "👹",
  "hp": 495,
  "dmg": [
   22,
   34
  ],
  "ar": 15,
  "exp": 480,
  "refLv": 43,
  "ref": {
   "lv": 43,
   "exp": 480,
   "hp": 495,
   "def": 15,
   "mdef": 15,
   "dmg": [
    22,
    34
   ],
   "ar": 15,
   "dex": 17,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 15
 },
 "zumalord": {
  "n": "祖玛教主",
  "ic": "👹",
  "hp": 3000,
  "dmg": [
   40,
   65
  ],
  "ar": 30,
  "exp": 3000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 3000,
   "hp": 3000,
   "def": 20,
   "mdef": 20,
   "dmg": [
    40,
    65
   ],
   "ar": 30,
   "dex": 32,
   "interval": 1000
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "bloodgiant": {
  "n": "血巨人",
  "ic": "👹",
  "hp": 1200,
  "dmg": [
   35,
   70
  ],
  "ar": 17,
  "exp": 1000,
  "refLv": 55,
  "ref": {
   "lv": 55,
   "exp": 1000,
   "hp": 1200,
   "def": 15,
   "mdef": 30,
   "dmg": [
    35,
    70
   ],
   "ar": 17,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 15
 },
 "twinblood": {
  "n": "双头血魔",
  "ic": "👹",
  "hp": 5000,
  "dmg": [
   80,
   150
  ],
  "ar": 30,
  "exp": 4000,
  "refLv": 55,
  "ref": {
   "lv": 55,
   "exp": 4000,
   "hp": 5000,
   "def": 40,
   "mdef": 10,
   "dmg": [
    80,
    150
   ],
   "ar": 30,
   "dex": 20,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 40
 },
 "twingold": {
  "n": "双头金刚",
  "ic": "👹",
  "hp": 5000,
  "dmg": [
   100,
   100
  ],
  "ar": 30,
  "exp": 4000,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 4000,
   "hp": 5000,
   "def": 5,
   "mdef": 50,
   "dmg": [
    100,
    100
   ],
   "ar": 30,
   "dex": 25,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 5
 },
 "chiyuedemon": {
  "n": "赤月恶魔",
  "ic": "👹",
  "hp": 5000,
  "dmg": [
   50,
   85
  ],
  "ar": 25,
  "exp": 5000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 5000,
   "hp": 5000,
   "def": 18,
   "mdef": 30,
   "dmg": [
    50,
    85
   ],
   "ar": 25,
   "dex": 25,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 18
 },
 "hongmaboar": {
  "n": "虹魔猪卫",
  "ic": "👹",
  "hp": 1500,
  "dmg": [
   40,
   60
  ],
  "ar": 17,
  "exp": 2000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 2000,
   "hp": 1500,
   "def": 20,
   "mdef": 20,
   "dmg": [
    40,
    60
   ],
   "ar": 17,
   "dex": 25,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "hongmascorpion": {
  "n": "虹魔蝎卫",
  "ic": "👹",
  "hp": 2000,
  "dmg": [
   45,
   65
  ],
  "ar": 17,
  "exp": 2500,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 2500,
   "hp": 2000,
   "def": 25,
   "mdef": 25,
   "dmg": [
    45,
    65
   ],
   "ar": 17,
   "dex": 25,
   "interval": 1800
  },
  "source": "1.76 Monster.DB",
  "def": 25
 },
 "hongmalord": {
  "n": "虹魔教主",
  "ic": "👹",
  "hp": 5000,
  "dmg": [
   70,
   120
  ],
  "ar": 30,
  "exp": 5000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 5000,
   "hp": 5000,
   "def": 25,
   "mdef": 30,
   "dmg": [
    70,
    120
   ],
   "ar": 30,
   "dex": 20,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 25
 },
 "evilcorpseking": {
  "n": "恶灵尸王",
  "ic": "👹",
  "hp": 500,
  "dmg": [
   17,
   45
  ],
  "ar": 15,
  "exp": 460,
  "refLv": 35,
  "ref": {
   "lv": 35,
   "exp": 460,
   "hp": 500,
   "def": 4,
   "mdef": 8,
   "dmg": [
    17,
    45
   ],
   "ar": 15,
   "dex": 18,
   "interval": 2000
  },
  "source": "1.76 Monster.DB",
  "def": 4
 },
 "huangquanlord": {
  "n": "黄泉教主",
  "ic": "👹",
  "hp": 3000,
  "dmg": [
   35,
   70
  ],
  "ar": 17,
  "exp": 2500,
  "refLv": 50,
  "ref": {
   "lv": 50,
   "exp": 2500,
   "hp": 3000,
   "def": 18,
   "mdef": 22,
   "dmg": [
    35,
    70
   ],
   "ar": 17,
   "dex": 25,
   "interval": 1200
  },
  "source": "1.76 Monster.DB",
  "def": 18
 },
 "niumoking": {
  "n": "牛魔王",
  "ic": "👹",
  "hp": 3600,
  "dmg": [
   45,
   80
  ],
  "ar": 30,
  "exp": 4000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 4000,
   "hp": 3600,
   "def": 20,
   "mdef": 28,
   "dmg": [
    45,
    80
   ],
   "ar": 30,
   "dex": 32,
   "interval": 1200
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "darkniumoking": {
  "n": "暗之牛魔王",
  "ic": "👹",
  "hp": 1000,
  "dmg": [
   100,
   120
  ],
  "ar": 30,
  "exp": 4000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 4000,
   "hp": 1000,
   "def": 20,
   "mdef": 200,
   "dmg": [
    100,
    120
   ],
   "ar": 30,
   "dex": 32,
   "interval": 1500
  },
  "source": "1.76 Monster.DB",
  "def": 20
 },
 "molongmoth": {
  "n": "魔龙巨蛾",
  "ic": "👹",
  "hp": 6000,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 12000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 12000,
   "hp": 6000,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "molongstrong": {
  "n": "魔龙力士",
  "ic": "👹",
  "hp": 6000,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 12000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 12000,
   "hp": 6000,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "molonggeneral": {
  "n": "魔龙战将",
  "ic": "👹",
  "hp": 6000,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 12000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 12000,
   "hp": 6000,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "molonglord": {
  "n": "魔龙教主（真）",
  "ic": "👹",
  "hp": 6000,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 12000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 12000,
   "hp": 6000,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 },
 "molongfake": {
  "n": "魔龙教主（假）",
  "ic": "👹",
  "hp": 6000,
  "dmg": [
   30,
   65
  ],
  "ar": 80,
  "exp": 12000,
  "refLv": 60,
  "ref": {
   "lv": 60,
   "exp": 12000,
   "hp": 6000,
   "def": 60,
   "mdef": 40,
   "dmg": [
    30,
    65
   ],
   "ar": 80,
   "dex": 20,
   "interval": 1800
  },
  "source": "1.80 名称；数值为本游戏原创",
  "def": 60
 }
};
for(const [k,v] of Object.entries(NORMALS))MONS[k]=v;
// Retain any stronger existing boss and mapped legacy encounter values.
const bossAliases={fallen:'zumaguard',forger:'zumaguard',seal1:'zumaguard',seal2:'zumaguard',seal3:'zumaguard',valax:'zumalord',siegelord:'bloodgiant',frostjailer:'twinblood',traitor:'twingold',eldron:'chiyuedemon'};
for(const p of ['anc','tw'])for(let i=1;i<=(p==='anc'?3:5);i++)bossAliases[p+i]='bloodgiant';
function preserve(v,old){if(!old)return;for(const k of ['hp','ar','def','exp'])v[k]=Math.max(v[k]||0,old[k]||0);v.dmg=v.dmg.map((n,i)=>Math.max(n,(old.dmg||[])[i]||0));}
CHIEFS.molonglord.hp=12000;CHIEFS.molonglord.ref.hp=12000;
for(const [k,v] of Object.entries(CHIEFS)){preserve(v,BOSSES[k]);for(const [old,to] of Object.entries(bossAliases))if(to===k)preserve(v,BOSSES[old]);BOSSES[k]=v;}
MONS.cqskelelite.n='骷髅战将';
for(const [k,lv,hp] of [['skelspirit',40,500],['zombieking',40,500],['treedemon',60,1800],['stonezombieking',55,5000],['rakecatking',50,1200],['orclord',50,700]]){BOSSES[k].refLv=lv;BOSSES[k].hp=Math.max(BOSSES[k].hp,hp);}
for(const [key,old,n] of [['rakecatelite','rakecat','钉耙猫头目'],['orcelite','halforc','半兽人头目']])MONS[key]=Object.assign({},MONS[old],{n,original:1});
BOSSES.redsnakeking.original=1;BOSSES.elezombieking.original=1;
const ids=[
'cqvillage,cqbichisouth,cqbichiwest,cqbichieast,cqbichinorth,cqsnakevalley,cqorctomb',
'cqskel1,cqskel2,cqskel3,cqwomaforest,cqwomaentrance,cqwoma1,cqwoma2,cqwoma3',
'cqminesouth,cqmineeast,cqmine1,cqmine2,cqminepit,cqbichimine,cqsnakemine,cqcentipede,cqdeathvalley',
'cqzuma1,cqzuma2,cqzuma3,cqzuma4,cqzuma5,cqzuma6,cqzuma7,cqzumage,cqzumahome',
'cqbairimen,cqjunglemaze,cqchiyueeast,cqchiyuesouth,cqchiyuenorth,cqchiyuesquare,cqchiyuelair',
'cqniumo1,cqniumo2,cqniumo3,cqniumo4,cqniumo5,cqniumo6,cqniumohall',
'cqmolongcity,cqmolongridge,cqmolongswamp,cqmolongblood,cqmolonghall'].map(s=>s.split(','));
const groups=[['cqwomawar','cqwomabrave','cqwomageneral','cqfirewoma','cqdarkwar'],['cqcentipede','cqblackmaggot','cqjumpbee','cqworm','cqpincer'],['cqrat','cqzumaarcher','cqzumastatue','cqzumaguard'],['cqfangspider','cqwolfspider','cqflowerspider','cqpoisonspider','cqmoonspider','cqblackjawspider','cqsteelspider','cqphantomspider','cqbloodzombie'],['cqbullhead','cqniumowar','cqniumofighter','cqniumoguard','cqniumogeneral','cqniumomage','cqniumopriest'],['cqmolongfrog','cqmolongbreaker','cqmolongarcher','cqmolongblade']];
function zone(id,n,ml,mons,extra){return Object.assign({id,n,ml,ml0:ml,w:10,mons,bg:'bg_cave'},extra||{});}
ACTS[0].zones.forEach((z,i)=>{z.id=ids[0][i];if(z.boss==='rakecatking'){z.elite='rakecatelite';delete z.boss;}if(z.boss==='orclord'){z.elite='orcelite';delete z.boss;}});
for(const q of ['q2','q6'])if(QUESTS[q]){QUESTS[q].clear=1;QUESTS[q].d=QUESTS[q].d.replace(/钉耙猫王/g,'钉耙猫头目').replace(/半兽统领/g,'半兽人头目');QUESTS[q].n=QUESTS[q].n.replace(/钉耙猫王/g,'钉耙猫头目').replace(/半兽统领/g,'半兽人头目');}
ACTS[0].boss='半兽人头目';
ACTS[1].zones=ACTS[1].zones.slice(0,4).concat([
zone(ids[1][4],'沃玛寺庙入口',20,['cqskel','cqbat'],{quest:'a2q5'}),
zone(ids[1][5],'沃玛寺庙一层',21,groups[0]),zone(ids[1][6],'沃玛寺庙二层',22,groups[0],{boss:'womaguard'}),zone(ids[1][7],'沃玛寺庙三层',22,groups[0],{boss:'womalord',quest:'a2q6'})]);
ACTS[1].boss='沃玛教主';BOSSES.womalord.actboss=1;
Object.assign(QUESTS.a2q5,{n:'沃玛入口',d:'肃清沃玛寺庙入口',clear:1});Object.assign(QUESTS.a2q6,{n:'沃玛教主',d:'击败沃玛寺庙三层的沃玛教主'});
ACTS[2].zones=ACTS[2].zones.slice(0,5).concat([
zone(ids[2][5],'比奇矿区',29,['cqzombie','cqcrawler'],{boss:'zombieking'}),zone(ids[2][6],'毒蛇矿区',29,['cqzombie','cqelezombie'],{boss:'zombieking'}),zone(ids[2][7],'蜈蚣洞',30,groups[1],{boss:'evilpincer'}),zone(ids[2][8],'死亡山谷',30,groups[1],{boss:'chulongshen',quest:'a3q6'})]);
ACTS[2].boss='触龙神';BOSSES.chulongshen.actboss=1;Object.assign(QUESTS.a3q6,{n:'触龙神',d:'击败蜈蚣洞深处的触龙神'});
for(const a of [1,2])ACTS[a].zones.forEach((z,i)=>{z.id=ids[a][i];z.ml0=z.ml0||z.ml;});
const chapterNames=['祖玛寺庙','赤月峡谷','牛魔寺庙','魔龙城'];
const names=[['祖玛寺庙一层','祖玛寺庙二层','祖玛寺庙三层','祖玛寺庙四层','祖玛寺庙五层','祖玛寺庙六层','祖玛神殿七层','祖玛阁','祖玛教主之家'],['白日门','丛林迷宫','赤月峡谷东入口','赤月峡谷南入口','赤月峡谷北入口','赤月峡谷广场','赤月魔穴'],['牛魔寺庙一层','牛魔寺庙二层','牛魔寺庙三层','牛魔寺庙四层','牛魔寺庙五层','牛魔寺庙六层','牛魔寺庙大厅'],['魔龙城','魔龙岭','魔龙沼泽','魔龙血域','魔龙殿']];
const ends=['zumalord','chiyuedemon','niumoking','molonglord'];
const chapters=[];
for(let a=3;a<7;a++){
 const j=a-3,zs=ids[a].map((id,i)=>zone(id,names[j][i],Math.round([30,38,46,54][j]+i*[8,8,8,6][j]/(ids[a].length-1)),groups[j+2],{bg:'bg_'+ids[a][0]}));
 const last=zs[zs.length-1];last.boss=ends[j];BOSSES[ends[j]].actboss=1;
 if(a===3)zs[6].boss='zumaguard';
 if(a===4){zs[0].bosses=['rakecatking','orclord'];zs[5].boss='bloodgiant';last.bosses=['twinblood','twingold','chiyuedemon'];}
 if(a===5)last.bosses=['niumoking','darkniumoking'];
 if(a===6){zs[1].boss='molongmoth';zs[2].boss='molongstrong';zs[3].bosses=['molonggeneral','molongfake'];}
 // Six stable quest IDs. Old reward IDs retain their meaning and are never reissued by migration.
 const qi=a===6?[0,1,2,3,4,4]:[0,1,2,3,4,zs.length-1];
 for(let q=1;q<=6;q++){const id='a'+(a+1)+'q'+q,z=zs[qi[q-1]];QUESTS[id]={act:a,n:z.n,d:'肃清'+z.n,rw:q===6?'解锁下一章节':'经验与金币',clear:1};if(q===6)QUESTS[id].fin=1;z.quest=id;}
 if(a===6){zs[4].quest='a7q5';zs[4].quests=['a7q5','a7q6'];}
 if(a===3){QUESTS.a4q1.rw='技能书 ×2';QUESTS.a4q2.rw='金币';}
 if(a===4){QUESTS.a5q1.rw='铁匠凹槽资格（旧奖励）';QUESTS.a5q3.rw='永久抗性 +10';QUESTS.a5q4.rw='个性化资格';QUESTS.a5q5.rw='经验';}
 ACTS[a]={id:'cqact'+(a+1),n:['第四','第五','第六','第七'][j]+'章 · '+chapterNames[j],camp:chapterNames[j]+'营地',boss:BOSSES[ends[j]].n,fq:'a'+(a+1)+'q6',mainEnd:zs.length-1,zones:zs,lock:0};chapters.push({act:a,bg:'assets/cq/bg/'+ids[a][0]+'.webp',thumb:'assets/cq/map/chapter_'+(a+1)+'.webp',boss:ends[j]});
}
const boars=['cqblackmaggot','cqhornfly','cqwedgemoth','cqredboar','cqblackboar','cqscorpionsnake'];
for(let i=1;i<=7;i++)ACTS[3].zones.push(zone('cqshimu'+i,'石墓'+i+'层',32+i,boars,{side:1,boss:i===7?'stonezombieking':i===5?'whiteboar':undefined}));
ACTS[3].zones.push(zone('cqshimuarray','石墓阵',36,boars,{side:1,boss:'evilsnake'}),zone('cqfengmovalley','封魔谷',37,['orcwar','cqskel'],{side:1,bosses:['treedemon','orclord']}),zone('cqfengmohall','封魔殿',40,groups[2],{side:1,bosses:['hongmaboar','hongmascorpion','hongmalord']}));
for(let i=1;i<=3;i++)ACTS[5].zones.push(zone('cqshimo'+i,'尸魔洞'+i+'层',43+i,['cqevilzombie'],{side:1,boss:i===3?'evilcorpseking':undefined}));
for(let i=1;i<=5;i++)ACTS[5].zones.push(zone('cqgumo'+i,'骨魔洞'+i+'层',43+i,['cqskelhammer','cqskelspear','cqskelaxe','cqskelarcher'],{side:1,boss:i===5?'huangquanlord':undefined}));
ACTS.forEach((a,i)=>{a.id='cqact'+(i+1);if(a.mainEnd==null)a.mainEnd=a.zones.length-1;});
const locate=id=>{for(let a=0;a<ACTS.length;a++){const z=ACTS[a].zones.findIndex(v=>v.id===id);if(z>=0)return{act:a,zone:z};}return null;};
const oldIds=[ids[0],ids[1].slice(0,5).concat('cqbichimine'),ids[2].slice(0,5).concat('cqshimu7'),['cqzuma1','cqzuma2','cqzuma3','cqzuma5','cqzumahome'],[0,1,2,2,3,3,4,4,5,5,5,5,5,5,6,6,6,6,6].map(i=>ids[4][i])];
const clone=v=>JSON.parse(JSON.stringify(v));
const union=(a,b)=>{const out=Object.assign({},a||{});for(const [k,v] of Object.entries(b||{}))out[k]=out[k]||v;return out;};
function migrate(input){
 if(input.mir2Mig&&input.mir2Mig.maps>=1)return input;
 const s=clone(input),snap=clone(input);s.mir2MapLegacy=snap;
 const d0=s.diff||0,a0=s.act||0,z0=s.zone||0;
 const cl=clone(s.CL||{}),un=clone(s.UN||{}),zn=clone(s.ZN||{});
 cl[d0+'_'+a0]=union(cl[d0+'_'+a0],s.cleared);un[d0+'_'+a0]=Math.max(un[d0+'_'+a0]||0,s.unl||0);zn[d0+'_'+a0]=z0;
 s.CL={};s.UN={};s.ZN={};s.Q=s.Q||{};s.Q[d0]=union(s.Q[d0],s.q);s.actU=s.actU||{};
 function target(a,z,d=d0){
  if(oldIds[a]&&oldIds[a][z])return locate(oldIds[a][z]);
  const safeAct=Math.min(6,Math.max(0,a),s.actU[d]||0),limit=Math.max(0,un[d+'_'+safeAct]||0);
  if(oldIds[safeAct])return locate(oldIds[safeAct][Math.min(limit,oldIds[safeAct].length-1)]);
  return{act:safeAct,zone:Math.min(limit,ACTS[safeAct].mainEnd)};
 }
 function unlock(d,t){const k=d+'_'+t.act;s.UN[k]=Math.max(s.UN[k]||0,t.zone);s.actU[d]=Math.max(s.actU[d]||0,t.act);}
 const keys=new Set([...Object.keys(cl),...Object.keys(un),...Object.keys(zn)]);
 for(const k of keys){const [d,a]=k.split('_').map(Number);if(!Number.isInteger(d)||!Number.isInteger(a))continue;
  for(const [z,v] of Object.entries(cl[k]||{}))if(v){const t=target(a,+z,d),nk=d+'_'+t.act;unlock(d,t);(s.CL[nk]||(s.CL[nk]={}))[t.zone]=v;}
  const max=Math.min(un[k]||0,(oldIds[a]||[]).length-1);for(let z=0;z<=max;z++)unlock(d,target(a,z,d));
  const t=target(a,zn[k]||0,d);unlock(d,t);s.ZN[d+'_'+t.act]=Math.max(s.ZN[d+'_'+t.act]||0,t.zone);
 }
 for(const [d,q] of Object.entries(s.Q)){
  if(q.a4q3){q.a4q6=1;unlock(+d,locate('cqzumahome'));}
  for(let a=0;a<7;a++)if(q[a?'a'+(a+1)+'q6':'q6']){s.actU[d]=Math.max(s.actU[d]||0,Math.min(6,a+1));unlock(+d,{act:a,zone:ACTS[a].mainEnd});}
 }
 const t=target(a0,z0);s.act=t.act;s.zone=t.zone;unlock(d0,t);const k=d0+'_'+t.act;s.ZN[k]=t.zone;s.cleared=s.CL[k]||(s.CL[k]={});s.unl=s.UN[k]||0;s.q=s.Q[d0]||(s.Q[d0]={});s.wave=0;
 // Canonical keys take the union of kills and the later refresh timestamp; legacy entries remain readable.
 if(s.bossRt)for(const [from,to] of Object.entries(bossAliases)){const r=s.bossRt[from];if(!r)continue;const v=s.bossRt[to]||{};s.bossRt[to]=Object.assign({},v,{k:Math.max(v.k||0,r.k||0),n:(v.n||0)+(r.n||0),ready:0});}
 for(const d of [0,1,2])if(s.bf)for(const [from,to] of Object.entries(bossAliases)){const k=d+'_'+from,n=d+'_'+to;if(s.bf[k])s.bf[n]=Math.max(s.bf[n]||0,s.bf[k]);}
 for(const field of ['blOwn','bossFirst'])if(s[field]&&typeof s[field]==='object')for(const [from,to] of Object.entries(bossAliases))if(s[field][from])s[field][to]=s[field][to]||s[field][from];
 s.mir2Mig=Object.assign({},s.mir2Mig,{maps:1});return s;
}
// Explicit runtime adapter: called by final merger after all CQ wrappers have loaded.
function install(){
 if(install.done)return;install.done=1;
 window.CQ_BOSSRT=window.CQ_BOSSRT||{};for(const k of Object.keys(CHIEFS))CQ_BOSSRT[k]=BOSSES[k].actboss?3600:600;
 const sp=spawnWave;spawnWave=function(){const r=sp.apply(this,arguments),z=zoneData();if(z.elite&&S.wave>=z.w-1){const m=mkMon(z.elite,z.ml,'champ');m.champ=1;MON.push(m);}return r;};
 const f=zoneClear;zoneClear=function(){const a=S.act,z=S.zone,A=ACTS[a],D=A.zones[z],auto=S.auto;const endpoint=z===A.mainEnd;
  if(endpoint)S.auto=0;
  try{const r=f.apply(this,arguments);if(D.quests)for(const q of D.quests)if(!S.q[q])questDone(q);if(endpoint&&auto){const n=nextStage();if(n&&S.lvl>=mlD(ACTS[n[0]].zones[0].ml0,n[1])-gateOf(n[0],n[1],1))goAct(n[0],n[1],1);}return r;}finally{S.auto=auto;}};
}
const artFiles={
 "cqrat": "assets/cq/ui/mdl_mst_cqrat.png",
 "cqzumaarcher": "assets/cq/ui/mdl_mst_cqzumaarcher.png",
 "cqzumastatue": "assets/cq/ui/mdl_mst_cqzumastatue.png",
 "cqzumaguard": "assets/cq/ui/mdl_mst_cqzumaguard.png",
 "cqfangspider": "assets/cq/ui/mdl_mst_cqfangspider.png",
 "cqmoonspider": "assets/cq/ui/mdl_mst_cqmoonspider.png",
 "cqbloodzombie": "assets/cq/ui/mdl_mst_cqbloodzombie.png",
 "chiyuedemon": "assets/cq/ui/mdl_mst_chiyuedemon.png",
 "cqniumowar": "assets/cq/ui/mdl_mst_cqniumowar.png",
 "cqniumomage": "assets/cq/ui/mdl_mst_cqniumomage.png",
 "niumoking": "assets/cq/ui/mdl_mst_niumoking.png",
 "darkniumoking": "assets/cq/ui/mdl_mst_darkniumoking.png",
 "cqmolongfrog": "assets/cq/ui/mdl_mst_cqmolongfrog.png",
 "cqmolongblade": "assets/cq/ui/mdl_mst_cqmolongblade.png",
 "cqmolongarcher": "assets/cq/ui/mdl_mst_cqmolongarcher.png",
 "molonglord": "assets/cq/ui/mdl_mst_molonglord.png",
 "cqwomawar": "assets/cq/ui/mdl_mst_cqwomawar.png",
 "cqwomabrave": "assets/cq/ui/mdl_mst_cqwomabrave.png",
 "cqwomageneral": "assets/cq/ui/mdl_mst_cqwomageneral.png",
 "cqfirewoma": "assets/cq/ui/mdl_mst_cqfirewoma.png",
 "cqdarkwar": "assets/cq/ui/mdl_mst_cqdarkwar.png",
 "cqcentipede": "assets/cq/ui/mdl_mst_cqcentipede.png",
 "cqblackmaggot": "assets/cq/ui/mdl_mst_cqblackmaggot.png",
 "cqjumpbee": "assets/cq/ui/mdl_mst_cqjumpbee.png",
 "cqworm": "assets/cq/ui/mdl_mst_cqworm.png",
 "cqpincer": "assets/cq/ui/mdl_mst_cqpincer.png",
 "cqhornfly": "assets/cq/ui/mdl_mst_cqhornfly.png",
 "cqwedgemoth": "assets/cq/ui/mdl_mst_cqwedgemoth.png",
 "cqredboar": "assets/cq/ui/mdl_mst_cqredboar.png",
 "cqblackboar": "assets/cq/ui/mdl_mst_cqblackboar.png",
 "cqscorpionsnake": "assets/cq/ui/mdl_mst_cqscorpionsnake.png",
 "cqwolfspider": "assets/cq/ui/mdl_mst_cqwolfspider.png",
 "cqflowerspider": "assets/cq/ui/mdl_mst_cqflowerspider.png",
 "cqpoisonspider": "assets/cq/ui/mdl_mst_cqpoisonspider.png",
 "cqblackjawspider": "assets/cq/ui/mdl_mst_cqblackjawspider.png",
 "cqsteelspider": "assets/cq/ui/mdl_mst_cqsteelspider.png",
 "cqphantomspider": "assets/cq/ui/mdl_mst_cqphantomspider.png",
 "cqniumofighter": "assets/cq/ui/mdl_mst_cqniumofighter.png",
 "cqniumoguard": "assets/cq/ui/mdl_mst_cqniumoguard.png",
 "cqniumogeneral": "assets/cq/ui/mdl_mst_cqniumogeneral.png",
 "cqniumopriest": "assets/cq/ui/mdl_mst_cqniumopriest.png",
 "cqevilzombie": "assets/cq/ui/mdl_mst_cqevilzombie.png",
 "cqskelhammer": "assets/cq/ui/mdl_mst_cqskelhammer.png",
 "cqskelspear": "assets/cq/ui/mdl_mst_cqskelspear.png",
 "cqskelaxe": "assets/cq/ui/mdl_mst_cqskelaxe.png",
 "cqskelarcher": "assets/cq/ui/mdl_mst_cqskelarcher.png",
 "cqmolongbreaker": "assets/cq/ui/mdl_mst_cqmolongbreaker.png",
 "womaguard": "assets/cq/ui/mdl_mst_womaguard.png",
 "womalord": "assets/cq/ui/mdl_mst_womalord.png",
 "evilpincer": "assets/cq/ui/mdl_mst_evilpincer.png",
 "chulongshen": "assets/cq/ui/mdl_mst_chulongshen.png",
 "whiteboar": "assets/cq/ui/mdl_mst_whiteboar.png",
 "evilsnake": "assets/cq/ui/mdl_mst_evilsnake.png",
 "zumaguard": "assets/cq/ui/mdl_mst_zumaguard.png",
 "zumalord": "assets/cq/ui/mdl_mst_zumalord.png",
 "bloodgiant": "assets/cq/ui/mdl_mst_bloodgiant.png",
 "twinblood": "assets/cq/ui/mdl_mst_twinblood.png",
 "twingold": "assets/cq/ui/mdl_mst_twingold.png",
 "hongmaboar": "assets/cq/ui/mdl_mst_hongmaboar.png",
 "hongmascorpion": "assets/cq/ui/mdl_mst_hongmascorpion.png",
 "hongmalord": "assets/cq/ui/mdl_mst_hongmalord.png",
 "evilcorpseking": "assets/cq/ui/mdl_mst_evilcorpseking.png",
 "huangquanlord": "assets/cq/ui/mdl_mst_huangquanlord.png",
 "molongmoth": "assets/cq/ui/mdl_mst_molongmoth.png",
 "molongstrong": "assets/cq/ui/mdl_mst_molongstrong.png",
 "molonggeneral": "assets/cq/ui/mdl_mst_molonggeneral.png",
 "molongfake": "assets/cq/ui/mdl_mst_molongfake.png",
 "cqbullhead": "assets/cq/ui/mdl_mst_cqbullhead.png"
};
function registerArt(){window.CQ_MONART=window.CQ_MONART||{};for(const k of Object.keys(artFiles))CQ_MONART[k]="mdl_mst_"+k;CQ_MONART.rakecatelite="mdl_mst_rakecatking";CQ_MONART.orcelite="mdl_mst_orclord";for(const c of chapters){for(const id of ids[c.act]){const key="bg_"+id;ASSETS[key]=c.bg;if(typeof IMG!=="undefined")IMG[key]=c.bg;}}}
// UI adapter kept here so shared page files remain merger-owned.
let view=0;
function mapHTML(){
 const d=MAPD==null?S.diff:MAPD,a=view,A=ACTS[a],open=actOpen(a,d),here=a===S.act&&d===S.diff,k=d+'_'+a,un=here?S.unl:(S.UN[k]||0),cl=here?S.cleared:(S.CL[k]||{}),c=chapters.find(c=>c.act===a);
 const button='min-width:44px;min-height:44px;white-space:nowrap;flex-shrink:0;';
 return `<div class="cqpg cqmap mir2map"><div class="b6entry"><button class="btn" onclick="CQB6.dungeonUI()">红龙圣地</button></div><div style="display:flex;overflow-x:auto;gap:4px;margin-bottom:8px">${ACTS.map((v,i)=>`<button class="cqbtn ${i===a?'gold':''}" data-mir2-ch="${i}" style="${button}" onclick="CQMir2Maps.show(${i})">${'一二三四五六七'[i]} · ${v.n.split('·')[1].trim()}</button>`).join('')}</div>
 <div style="display:flex;gap:6px;margin-bottom:8px">${DIFFS.map((v,i)=>`<button class="cqbtn ${i===d?'gold':''}" style="${button}" onclick="MAPD=${i};renderMap()">${v.n}</button>`).join('')}<button class="cqbtn" style="${button}" onclick="CQMir2Maps.bossPop()">首领刷新</button></div>
 <div style="padding:14px;border:1px solid #80623b;background:#211a13;border-radius:10px;${c?`background-image:linear-gradient(0deg,#17120de8,#17120d55),url('${c.thumb}');background-size:cover;`:''}"><h3>${A.n}</h3><div>营地 ${A.camp} · ${open?'已解锁':'未解锁'}</div><div>章节首领 ${A.boss}</div></div>
 ${A.zones.map((z,i)=>{const locked=!open||i>un,bs=z.bosses||(z.boss?[z.boss]:[]);return `<div style="display:flex;align-items:center;gap:8px;padding:12px 0;border-bottom:1px solid #51412d;${locked?'opacity:.55':''}">${c?`<img src="${c.thumb}" alt="" style="width:60px;height:54px;object-fit:cover;border-radius:6px">`:''}<div style="flex:1;min-width:0"><b>${z.n}</b> <small>Lv.${mlD(z.ml0||z.ml,d)} ${z.side?'· 支线':''} ${cl[i]?'✔':''}</small><div style="font-size:11px;line-height:1.6">${z.mons.map(k=>MONS[k].n).join(' / ')}</div>${z.elite?`<div style="font-size:11px;color:#e8bd77">精英：${MONS[z.elite].n}</div>`:''}${bs.length?`<div style="font-size:11px;color:#e8bd77">首领：${bs.map(k=>BOSSES[k].n).join(' / ')}</div>`:''}</div><button class="cqbtn" style="${button}" ${locked?'disabled':''} onclick="CQMir2Maps.preview(${a},${i},${d})">${locked?'锁定':here&&i===S.zone?'挂机中':'前往'}</button></div>`;}).join('')}</div>`;
}
function show(a){view=Math.max(0,Math.min(6,a));MAPA=view;renderMap();const e=document.querySelector('[data-mir2-ch="'+view+'"]');if(e)e.scrollIntoView({block:"nearest",inline:"center"});}
function preview(a,i,d){const z=ACTS[a].zones[i],c=chapters.find(c=>c.act===a);modal(`<div class="cqpg"><div class="cqpanel"><div class="cqttl">传送 · ${z.n}</div>${c?`<img src="${c.thumb}" style="width:100%;max-height:180px;object-fit:cover" alt="${z.n}">`:''}<p>${z.mons.map(k=>MONS[k].n).join(' / ')}</p><p>Lv.${mlD(z.ml0||z.ml,d)} · ${DIFFS[d].n}</p><div class="row c"><button class="cqbtn gold" style="min-height:44px;white-space:nowrap" onclick="closeM();CQMir2Maps.travel(${a},${i},${d})">传送挂机</button><button class="cqbtn" style="min-height:44px;min-width:44px;white-space:nowrap" onclick="closeM()">取消</button></div></div></div>`);}
function travel(a,i,d){if(!actOpen(a,d))return false;const un=a===S.act&&d===S.diff?S.unl:S.UN[d+'_'+a]||0;if(i>un)return false;if(a!==S.act||d!==S.diff)goAct(a,d,1);goZone(i);TAB='fight';render();return true;}
function bossPop(){modal(`<div class="cqpg"><div class="cqpanel"><div class="cqttl">首领刷新</div>${CQSys.bossList().map(b=>`<p>${b.n} · ${b.zn}<br><small>${b.ready?'可挑战':CQSys.fmtLeft(b.left)} · ${b.cd/60} 分钟刷新</small></p>`).join('')}<button class="cqbtn" style="min-height:44px;white-space:nowrap" onclick="closeM()">关闭</button></div></div>`);}
function installUI(){if(installUI.done)return;installUI.done=1;view=S.act||0;
 renderMap=function(){document.querySelector('#panel').innerHTML=mapHTML();};
 if(window.CQ&&CQ.Host){const f=CQ.Host.zone;CQ.Host.zone=function(){const r=f.apply(this,arguments),a=S.act,c=chapters.find(c=>c.act===a),field=document.querySelector('.cqb .field');if(field){const src=c?c.bg:'';if(field.dataset.mir2!==src){field.dataset.mir2=src;field.style.backgroundImage=src?'url("'+new URL(src,document.baseURI).href+'")':'';field.style.backgroundSize=src?'cover':'';field.style.backgroundPosition='center';}}return r;};}
}

function fresh(s){s.mir2Mig=Object.assign({},s.mir2Mig,{maps:1});return s;}
function installSaveHooks(){
 if(installSaveHooks.done)return;installSaveHooks.done=1;
 const n=newSave;newSave=function(){return fresh(n.apply(this,arguments));};
 const f=load;load=function(){const r=f.apply(this,arguments);if(typeof cqMigrationFailed!=='undefined'&&cqMigrationFailed)return r;if(S){const mapped=migrate(S);if(mapped!==S){S=mapped;MON=[];CORPSE=[];}applyDiff();calc();}return r;};
}
window.CQMir2Maps={installSaveHooks,artFiles,registerArt,fresh,mapHTML,show,preview,travel,bossPop,installUI,version:1,ids,locate,migrate,install,chapters,bossAliases,normalKeys:Object.keys(NORMALS),bossKeys:Object.keys(CHIEFS)};
})();
