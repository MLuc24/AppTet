#!/bin/bash

# Environment Setup Script
# Usage: ./scripts/setup-env.sh

echo "🚀 Setting up development environment..."

# Copy env files
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup database
echo "🗄️ Setting up database..."
cd apps/backend-api
npx prisma generate
npx prisma migrate dev
cd ../..

echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "  1. Update .env with your credentials"
echo "  2. Run: docker compose -f infrastructure/docker/docker-compose.yml up -d"
echo "  3. Run: npm run backend"
