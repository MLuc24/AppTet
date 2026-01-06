#!/bin/bash

# Database Migration Script
# Usage: ./scripts/db-migrate.sh [environment]

ENV=${1:-development}

echo "🔄 Running migrations for: $ENV"

cd apps/backend-api

if [ "$ENV" = "production" ]; then
  npx prisma migrate deploy
else
  npx prisma migrate dev
fi

echo "✅ Migration completed"
