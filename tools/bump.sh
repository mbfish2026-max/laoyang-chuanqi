#!/bin/sh
# 用法：tools/bump.sh cq-20261021f
# 改写所有版本号引用：index.html 全部 ?v= 及文中 cq-日期版本、sw.js 缓存名 V、cq/battle_mount.js VER（动态加载的 cq/* 与 cq_bridge 用 VER 拼 ?v=）、
# README.md「版本」行、docs/VERSION.txt；最后用 git grep 检查运行时文件里不再残留旧版本号。
set -e
V="$1"; case "$V" in cq-[0-9]*) ;; *) echo "版本号须为 cq-YYYYMMDDx"; exit 1;; esac
cd "$(dirname "$0")/.."
OLD=$(cat docs/VERSION.txt 2>/dev/null || true)
sed -i -E "s/\?v=[A-Za-z0-9-]+/?v=$V/g; s/cq-20[0-9]{6}[a-z]+/$V/g" index.html
sed -i -E "s/^var V='[^']*';/var V='$V';/; s/cq-20[0-9]{6}[a-z]+/$V/g" sw.js
sed -i -E "s/const VER='[^']*';/const VER='$V';/" cq/battle_mount.js
sed -i -E "s/^(- \*\*版本\*\*：\`)[^\`]*\`/\1$V\`/" README.md
echo "$V" > docs/VERSION.txt
if [ -n "$OLD" ] && [ "$OLD" != "$V" ]; then
  LEFT=$(git grep -n -F "$OLD" -- '*.html' '*.js' '*.css' '*.json' ':!tests/' ':!tools/' 2>/dev/null || true)
  [ -z "$LEFT" ] || { echo "仍有旧版本号 $OLD："; echo "$LEFT"; exit 2; }
fi
echo "index.html ?v=$V 处数：$(grep -o "?v=$V" index.html | wc -l)"
