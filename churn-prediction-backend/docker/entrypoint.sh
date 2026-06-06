#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
fi

if [ "$RUN_DATABASE_SEED" = "true" ]; then
  npm run prisma:seed
fi

exec "$@"
