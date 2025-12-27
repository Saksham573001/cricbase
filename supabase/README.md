# Supabase Migrations

This directory contains Supabase database migrations for the CricBase platform.

## Prerequisites

1. Install Supabase CLI (choose one method):

   **Option A: Homebrew (Recommended for macOS):**
   ```bash
   brew install supabase/tap/supabase
   ```

   **Option B: Direct download (macOS/Linux):**
   ```bash
   # Download the latest binary
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_amd64.tar.gz | tar -xz
   sudo mv supabase /usr/local/bin/
   ```

   **Option C: Using npx (no installation needed):**
   ```bash
   npx supabase <command>
   ```

   **Note:** Global npm installation (`npm install -g supabase`) is no longer supported.

2. Login to Supabase:
   ```bash
   supabase login
   ```

## Migration Files

- `20240101000000_initial_schema.sql` - Creates all database tables, indexes, and policies
- `20240101000001_seed_data.sql` - Inserts sample data (users, matches, deliveries, stats)

## Setting Up Your Project

### Option 1: Link to Existing Supabase Project (Recommended)

1. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   You can find your project ref in your Supabase dashboard URL: `https://app.supabase.com/project/<project-ref>`

2. Run migrations:
   ```bash
   supabase db push
   ```

### Option 2: Initialize New Local Project

1. Initialize Supabase locally:
   ```bash
   supabase init
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Apply migrations:
   ```bash
   supabase migration up
   ```

## Running Migrations

### Push migrations to remote project:
```bash
supabase db push
```

### Pull remote schema changes:
```bash
supabase db pull
```

### Create a new migration:
```bash
supabase migration new migration_name
```

### Check migration status:
```bash
supabase migration list
```

## Sample Data Setup

The seed migration (`20240101000001_seed_data.sql`) includes sample data, but **users need to be created via Supabase Auth first**.

### Creating Sample Users:

1. Go to your Supabase Dashboard > Authentication > Users
2. Create the following users (or use your own):
   - `cricket_lover@cricbase.com`
   - `stats_guru@cricbase.com`
   - `bowling_fan@cricbase.com`

3. Note the UUIDs of the created users

4. Update the seed migration file with the actual user UUIDs:
   - Open `supabase/migrations/20240101000001_seed_data.sql`
   - Replace the placeholder UUIDs (starting with `00000000-0000-0000-0000-000000000001`) with actual user IDs

5. Re-run the seed migration or manually update the users table

Alternatively, you can manually insert users after creating auth users:
```sql
INSERT INTO public.users (id, username, email)
VALUES
  ('actual-user-id-1', 'cricket_lover', 'cricket_lover@cricbase.com'),
  ('actual-user-id-2', 'stats_guru', 'stats_guru@cricbase.com'),
  ('actual-user-id-3', 'bowling_fan', 'bowling_fan@cricbase.com');
```

## Deployment

When deploying to production:

1. Link your production project:
   ```bash
   supabase link --project-ref your-production-project-ref
   ```

2. Push migrations:
   ```bash
   supabase db push
   ```

Or use Supabase Dashboard:
1. Go to SQL Editor
2. Run each migration file in order
3. Ensure seed data is added after creating auth users

## Migration Best Practices

1. **Never edit existing migrations** - Create new migrations for changes
2. **Test migrations locally** - Use `supabase start` to test locally first
3. **Backup before production** - Always backup your database before running migrations
4. **Review migrations** - Check the generated SQL before pushing
5. **Run in order** - Migrations run in chronological order based on filename

## Troubleshooting

### Migration conflicts
If you have conflicts, you may need to reset:
```bash
supabase db reset
```

### Connection issues
Make sure you're logged in:
```bash
supabase login
```

### Check migration status
```bash
supabase migration list
```

