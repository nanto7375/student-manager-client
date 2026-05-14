#!/bin/bash
set -e

echo "🚀 배포 시작..."

git checkout prod
git merge dev
git push origin prod
git checkout dev

echo "✅ 배포 완료!"
