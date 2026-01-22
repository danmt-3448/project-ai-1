#!/bin/bash
# DANGER: Complete database reset for Neon Postgres
# ⚠️  This will DELETE ALL DATA - only use for fresh setup or development

set -e

echo "⚠️⚠️⚠️  DANGER ZONE  ⚠️⚠️⚠️"
echo "This will DROP ALL TABLES and DELETE ALL DATA in your Neon database!"
echo ""
echo "Type 'DELETE EVERYTHING' to confirm (Ctrl+C to cancel):"
read CONFIRM

if [ "$CONFIRM" != "DELETE EVERYTHING" ]; then
  echo "❌ Confirmation failed. Aborting."
  exit 1
fi

echo ""
echo "🗑️  Dropping all tables..."

# Drop tables in correct order (respecting foreign keys)
npx prisma db execute --schema=./prisma/schema.postgres.prisma --stdin <<'EOF'
DROP TABLE IF EXISTS "order_activities" CASCADE;
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "admin_users" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
EOF

echo "📦 Recreating schema..."
npx prisma migrate deploy --schema=./prisma/schema.postgres.prisma

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Default admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  Remember to change the default password!"
