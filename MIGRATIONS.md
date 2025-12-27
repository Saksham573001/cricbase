# Database Migrations Guide

This project uses Supabase CLI for database migrations. This guide explains how to set up and manage migrations.

## Quick Start

1. **Install Supabase CLI:**

   **macOS (Homebrew - Recommended):**
   ```bash
   brew install supabase/tap/supabase
   ```

   **Linux/macOS (Direct download):**
   ```bash
   # Download latest binary
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
   sudo mv supabase /usr/local/bin/
   ```

   **Using npx (no installation needed, but slower):**
   ```bash
   npx supabase <command>
   ```

   **Note:** `npm install -g supabase` is no longer supported. Use one of the methods above.

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   Your project ref is in the Supabase dashboard URL: `https://app.supabase.com/project/<project-ref>`

4. **Apply migrations:**
   ```bash
   supabase db push
   ```

## Available Migrations

1. **20240101000000_initial_schema.sql**
   - Creates all database tables (users, matches, deliveries, comments, etc.)
   - Sets up indexes for performance
   - Configures Row Level Security (RLS) policies
   - Creates triggers and functions

2. **20240101000001_seed_data.sql**
   - Inserts sample matches (India vs Australia, England vs Pakistan, etc.)
   - Adds sample deliveries
   - Creates sample player and team statistics
   - Adds sample comments (requires auth users to be created first)

## Creating Sample Users

The seed migration includes sample comments, but you need to create auth users first:

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" and create:
   - Email: `cricket_lover@cricbase.com`, Password: (any)
   - Email: `stats_guru@cricbase.com`, Password: (any)
   - Email: `bowling_fan@cricbase.com`, Password: (any)

3. Copy the UUIDs of these users

4. Either:
   - Update `supabase/migrations/20240101000001_seed_data.sql` with the real UUIDs, or
   - Manually insert them:
     ```sql
     INSERT INTO public.users (id, username, email)
     VALUES
       ('user-uuid-1', 'cricket_lover', 'cricket_lover@cricbase.com'),
       ('user-uuid-2', 'stats_guru', 'stats_guru@cricbase.com'),
       ('user-uuid-3', 'bowling_fan', 'bowling_fan@cricbase.com');
     ```

## Creating New Migrations

When you need to modify the database schema:

```bash
supabase migration new your_migration_name
```

This creates a new file in `supabase/migrations/` with a timestamp. Edit the file and add your SQL.

## Deploying Migrations

### To Development/Staging:
```bash
supabase db push
```

### To Production:
1. Link to production project:
   ```bash
   supabase link --project-ref production-project-ref
   ```

2. Push migrations:
   ```bash
   supabase db push
   ```

Or use Supabase Dashboard:
- Go to SQL Editor
- Run migration files manually in order

## Local Development

You can run Supabase locally for testing:

```bash
# Initialize (first time only)
supabase init

# Start local Supabase
supabase start

# Apply migrations
supabase migration up

# Stop local Supabase
supabase stop
```

## Useful Commands

- `supabase migration list` - List all migrations and their status
- `supabase db pull` - Pull schema changes from remote database
- `supabase db diff` - Generate migration from schema differences
- `supabase db reset` - Reset local database and re-run all migrations

## Migration Best Practices

1. ✅ **Always test migrations locally first**
2. ✅ **Create new migrations for changes** (never edit existing ones)
3. ✅ **Use descriptive migration names**
4. ✅ **Review SQL before pushing to production**
5. ✅ **Backup database before production migrations**
6. ✅ **Run migrations in order** (they're executed chronologically)
7. ❌ **Don't edit migrations that have been applied**
8. ❌ **Don't delete migration files**

## Troubleshooting

### Migration fails
- Check the error message in the Supabase dashboard
- Verify SQL syntax
- Ensure dependencies are met (e.g., tables exist before adding foreign keys)

### Conflicts with existing schema
- Use `CREATE TABLE IF NOT EXISTS` for idempotent migrations
- Use `ON CONFLICT` clauses where appropriate
- Consider using `DO $$ ... END $$` blocks for conditional logic

### Need to reset everything
```bash
# Local
supabase db reset

# Remote (use Supabase Dashboard > Database > Reset)
```

For more details, see `supabase/README.md`.

