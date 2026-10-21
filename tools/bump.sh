#!/bin/sh
# 用法：tools/bump.sh cq-20261021b   —— 同时改写 index.html 全部 ?v=、sw.js 缓存名 V、cq/battle_mount.js 版本常量、docs/VERSION.txt
set -e
V="$1"; case "$V" in cq-*) ;; *) echo "版本号须为 cq- 前缀"; exit 1;; esac
cd "$(dirname "$0")/.."
sed -i -E "s/\?v=[A-Za-z0-9-]+/?v=$V/g" index.html
sed -i -E "s/^var V='[^']*';/var V='$V';/" sw.js
sed -i -E "s/const VER='[^']*';/const VER='$V';/" cq/battle_mount.js
echo "$V" > docs/VERSION.txt
grep -c "?v=$V" index.html
