# Backend Deployment Guide (Neon Postgres)

## Prerequisites

- Node.js 20+ installed on server
- Neon Postgres database URL in `DATABASE_URL` environment variable
- JWT secret in `JWT_SECRET` environment variable

## Initial Deployment

1. **Upload backend folder** to server:
   ```bash
   scp -r apps/backend user@server:/path/to/app/
   ```

2. **Install dependencies** on server:
   ```bash
   cd /path/to/app/backend
   yarn install --production
   ```

3. **Set environment variables**:
   ```bash
   export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require"
   export JWT_SECRET="your-production-secret-key"
   export NODE_ENV="production"
   ```

4. **Run deployment script**:
   ```bash
   chmod +x scripts/deploy-db.sh
   ./scripts/deploy-db.sh
   ```

   This will:
   - Generate Prisma Client
   - Run database migrations
   - Create admin user (if doesn't exist)

5. **Start the server**:
   ```bash
   yarn start
   # or with PM2:
   pm2 start "yarn start" --name backend
   ```

## Updating Existing Deployment

When pushing new code with database changes:

```bash
cd /path/to/app/backend
git pull origin main
yarn install --production
./scripts/deploy-db.sh
pm2 restart backend
```

## Complete Database Reset (DANGER!)

⚠️ **This deletes ALL data!** Only use for fresh setup or if database is corrupted:

```bash
./scripts/reset-db.sh
# Type "DELETE EVERYTHING" to confirm
```

## Troubleshooting

### Issue: `Foreign key constraint violated: order_activities_adminId_fkey`

**Cause**: Admin user referenced in JWT token doesn't exist in database.

**Solution**:
```bash
# Option 1: Re-run seed to create admin user
npx tsx prisma/seed.ts

# Option 2: Clear frontend localStorage and login again
# In browser console:
localStorage.removeItem('adminToken')
# Then login at /admin with admin/admin123
```

### Issue: Migration fails

**Cause**: Database state doesn't match migration history.

**Solution**:
```bash
# Mark migrations as applied (if schema already correct)
npx prisma migrate resolve --applied "20260122150427_add_order_status_management" --schema=./prisma/schema.postgres.prisma

# Or force reset (deletes data!)
./scripts/reset-db.sh
```

### Issue: Prisma Client not found

**Cause**: Client not generated after schema changes.

**Solution**:
```bash
npx prisma generate --schema=./prisma/schema.postgres.prisma
```

## Environment Variables Reference

Required:
- `DATABASE_URL` - Neon Postgres connection string
- `JWT_SECRET` - Secret for signing admin tokens

Optional:
- `NODE_ENV` - Set to `production` for production builds
- `PORT` - Backend port (default: 3001)

## Database Schema Management

### Creating New Migrations

On your **local machine** (not on server):
```bash
cd apps/backend
npx prisma migrate dev --name your_migration_name --schema=./prisma/schema.postgres.prisma
git add prisma/migrations/
git commit -m "feat(db): add your_migration_name"
git push
```

On **server**, then run:
```bash
git pull
./scripts/deploy-db.sh
```

### Checking Database Status

```bash
# View current schema
npx prisma db pull --schema=./prisma/schema.postgres.prisma

# Check migration status
npx prisma migrate status --schema=./prisma/schema.postgres.prisma

# Open Prisma Studio (read-only recommended for production)
npx prisma studio --schema=./prisma/schema.postgres.prisma --port 5555
```

## Security Notes

1. **Change default admin password** after first deployment
2. **Use strong JWT_SECRET** (at least 32 random characters)
3. **Enable SSL** for Neon connections (included in connection string)
4. **Restrict database access** to your server's IP in Neon dashboard
5. **Never commit** `.env` files with production credentials

## Health Check

Test deployment:
```bash
# Check API health
curl http://localhost:3001/api/categories

# Test admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected response: `{"token":"eyJ...","admin":{"id":"...","username":"admin"}}`
