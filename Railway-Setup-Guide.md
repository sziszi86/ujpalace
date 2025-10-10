# Railway Migration Guide for Palace Poker

## Overview
This guide will help you migrate your Palace Poker application from the current tarhely.eu hosting to Railway with PostgreSQL database.

## Prerequisites
- Railway account (sign up at https://railway.app)
- Railway Hobby plan subscription ($5/month)

## Step 1: Create Railway Project

1. Login to Railway web dashboard
2. Click "New Project"
3. Select "Empty Project"
4. Name it "palace-poker"

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Wait for the database to provision
4. Copy the connection details from the "Connect" tab

## Step 3: Import Database Schema

1. Connect to your new PostgreSQL database using a tool like pgAdmin or psql
2. Run the migration script: `migrate-to-postgresql.sql`
3. Import your existing data (you'll need to manually migrate data from MySQL export)

## Step 4: Deploy Application

### Option A: Using Railway CLI

```bash
# Login to Railway
npx @railway/cli login

# Link to your project
npx @railway/cli link

# Deploy
npx @railway/cli up
```

### Option B: Using GitHub Integration

1. Push your code to GitHub
2. In Railway project, click "New Service" → "GitHub Repo"
3. Select your repository
4. Railway will auto-deploy

## Step 5: Configure Environment Variables

In Railway dashboard, go to your service → Variables tab and add:

```
NODE_ENV=production
DATABASE_HOST=[from Railway PostgreSQL service]
DATABASE_PORT=5432
DATABASE_USER=[from Railway PostgreSQL service]
DATABASE_PASSWORD=[from Railway PostgreSQL service]
DATABASE_NAME=[from Railway PostgreSQL service]
```

## Step 6: Update Application Code

Switch your application to use PostgreSQL by changing imports:

```typescript
// Replace this import in your API routes:
// import { ... } from '@/lib/database';

// With this:
import { ... } from '@/lib/database-postgresql';
```

## Step 7: Migrate Data

### Manual Data Migration Steps:

1. Export current data from MySQL:
```bash
mysqldump -h tarhely.eu -u [username] -p [database] --no-create-info --complete-insert > data-export.sql
```

2. Convert MySQL INSERT statements to PostgreSQL format
3. Import to Railway PostgreSQL database

### Important Changes from MySQL to PostgreSQL:

- `AUTO_INCREMENT` → `SERIAL`
- `TINYINT(1)` → `BOOLEAN`
- `LONGBLOB` → `BYTEA`
- `NOW()` → `CURRENT_TIMESTAMP`
- Parameter placeholders: `?` → `$1, $2, $3...`
- Boolean values: `1/0` → `true/false`

## Step 8: Domain Configuration

1. In Railway project → Settings → Domains
2. Add your custom domain (palacepoker.hu)
3. Update DNS records as instructed by Railway
4. Enable SSL (automatic with Railway)

## Cost Comparison

### Current Setup (tarhely.eu):
- Hosting: ~€5-10/month
- Database: Included

### Railway Setup:
- Hobby Plan: $5/month
- PostgreSQL: $5/month
- Total: $10/month

## Benefits of Railway Migration

1. **Better Performance**: Modern infrastructure with global CDN
2. **Auto-scaling**: Handles traffic spikes automatically
3. **Git Integration**: Deploy on every push
4. **Better Monitoring**: Built-in metrics and logging
5. **PostgreSQL**: More robust than MySQL for complex queries
6. **SSL by Default**: Automatic HTTPS certificates
7. **Environment Management**: Easy staging/production environments

## Migration Checklist

- [ ] Create Railway account and project
- [ ] Add PostgreSQL service
- [ ] Run schema migration script
- [ ] Update application to use PostgreSQL driver
- [ ] Configure environment variables
- [ ] Deploy application
- [ ] Migrate data from current database
- [ ] Test all functionality
- [ ] Update DNS records
- [ ] Monitor for 24-48 hours

## Rollback Plan

If issues occur:
1. Revert DNS to current hosting
2. Keep current tarhely.eu setup until Railway is fully tested
3. Gradually migrate traffic using DNS TTL

## Support

For issues during migration:
- Railway Discord: https://discord.gg/railway
- Railway Docs: https://docs.railway.app
- PostgreSQL Migration guides available online

---

**Note**: This migration gives you a modern, scalable platform that will serve your poker club well as it grows!