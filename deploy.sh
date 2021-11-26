#!/usr/bin/env sh

# abort on errors
set -e

yarn run build

cd dist

git init
git add -A
git commit -m 'deploy'

git push -f git@github.com:marioamandio/orderbook.git master:gh-pages

cd -