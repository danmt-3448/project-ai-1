#!/bin/bash
# Database deployment script for Neon Postgres
# Safe for production - runs migrations and creates admin if needed

set -e

echo "🚀 Deploying to Neon Postgres..."

# Ensure schema file exists
if [ ! -f "./prisma/schema.postgres.prisma" ]; then
  echo "❌ Error: schema.postgres.prisma not found"
  exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.postgres.prisma

# Run migrations (safe for production)
echo "🔄 Running migrations..."
npx prisma migrate deploy --schema=./prisma/schema.postgres.prisma

# Seed admin user only
echo "🌱 Ensuring admin user exists..."
npx tsx prisma/seed.ts || echo "⚠️  Seed failed (admin may already exist)"

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Restart your backend service"
echo "  2. Test admin login at /admin"
echo "  3. Change default password if needed"
