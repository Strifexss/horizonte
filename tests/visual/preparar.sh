#!/usr/bin/env bash
# Prepara o app local para a verificação visual: .env, SQLite, migrations e usuário de teste.
# Idempotente. Rode da raiz do repositório: bash tests/visual/preparar.sh
set -euo pipefail

PORTA="${PORTA:-8080}"

[ -f .env ] || cp .env.example .env
grep -q '^APP_KEY=base64' .env || php artisan key:generate --no-interaction -q
sed -i "s#^APP_URL=.*#APP_URL=http://localhost:${PORTA}#" .env

touch database/database.sqlite
php artisan migrate --force --no-interaction -q
php artisan db:seed --class=VerificacaoVisualSeeder --force --no-interaction -q
[ -e public/storage ] || php artisan storage:link --no-interaction -q

echo "Pronto. Suba com: php artisan serve --port=${PORTA}"
