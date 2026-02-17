# Verifying the demo database (Supabase)

The plan asks you to run verification queries against your **hosted** Supabase database. Here’s what that means and how to do it.

## What is `psql "$SUPABASE_DB_URL"`?

- **`psql`** – PostgreSQL command-line client. You use it to connect to a Postgres database and run SQL.
- **`SUPABASE_DB_URL`** – An environment variable that should hold your **database connection string** (URI).

So the instruction means: “Open a Postgres session to the Supabase database and run the following SQL there.”

## How to get the database URL

1. Open [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **Project Settings** (gear) → **Database**.
3. Under **Connection string**, choose **URI** and copy it. It looks like:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
4. Put the real password in place of `[YOUR-PASSWORD]` and set it as an env var:
   ```bash
   export SUPABASE_DB_URL="postgresql://postgres.[project-ref]:YourActualPassword@..."
   ```

## How to run the verification queries

**Option A – Using `psql` (if you have it installed)**

```bash
# From your machine, with SUPABASE_DB_URL set:
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) AS profile_rows FROM public.profiles;"
psql "$SUPABASE_DB_URL" -c "SELECT id, email, role, tenant_id FROM public.profiles ORDER BY created_at LIMIT 5;"
# … run the other verification queries from the plan the same way
```

**Option B – Using Supabase SQL Editor (no `psql` needed)**

1. In Supabase Dashboard, go to **SQL Editor**.
2. Paste and run each verification query from the plan, for example:
   - `SELECT COUNT(*) AS profile_rows FROM public.profiles;`
   - `SELECT id, email, role, tenant_id FROM public.profiles ORDER BY created_at LIMIT 5;`
   - etc.

Same checks, different interface. Use whichever you have available.

## What you’re checking

- **Single demo profile** – Exactly one row in `public.profiles`, with id `11111111-1111-1111-1111-111111111111`.
- **RLS / policies** – Demo-visible tables have the expected policies (e.g. SELECT-only for anon/authenticated).
- **Privileges** – `anon`/`authenticated` have only SELECT on those tables, no write.

If any of these are off, fix the DB (migrations/seed) before relying on the app’s read-only behavior.
