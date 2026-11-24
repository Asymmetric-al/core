#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_env() {
  local var_name="$1"
  if [[ -z "${!var_name:-}" ]]; then
    echo "Missing required env var: $var_name" >&2
    exit 1
  fi
}

run_local() {
  require_cmd bun
  echo "Applying local migrations and seeding via Supabase CLI (repo runner)..."
  bun run supabase -- db reset --local
  echo "Local seed complete."
}

# The hosted seed is retired (WP0, audit finding NA-03). supabase/seed.sql
# deletes every tenant's rows before it reseeds, and this mode also pushed
# every pending migration, so it must never reach a hosted database. The mode
# name is kept only so that a stale command fails loudly.
run_hosted() {
  echo "Refusing to seed a hosted database: the hosted seed deletes every organization's data and is retired." >&2
  echo "Seed the local stack with: bash ./scripts/seed-demo.sh local" >&2
  exit 1
}

# Succeeds only when the repository's one local-database decision
# (isLoopbackDatabaseUrl, packages/env/src/database-url.mjs) admits the URL in
# the environment variable named by $1: a Postgres URL on 127.0.0.1,
# localhost or [::1] with no routing override in its query.
is_loopback_database_url() {
  node "$SCRIPT_DIR/lib/local-database.mjs" admit "$1"
}

require_loopback_database_url() {
  if ! is_loopback_database_url SUPABASE_DB_URL; then
    echo "Refusing to run against a non-loopback database. SUPABASE_DB_URL must name localhost, 127.0.0.1 or [::1], with no routing override (host, hostaddr, port, dbname, user or service) in its query." >&2
    exit 1
  fi
}

# Runs psql on SUPABASE_DB_URL through the repository's one psql runner
# (spawnPsql, scripts/lib/psql.mjs): the URL is the whole target, every
# ambient PG* setting is dropped, and the password travels in PGPASSWORD.
local_psql() {
  node "$SCRIPT_DIR/lib/local-database.mjs" psql SUPABASE_DB_URL "$@"
}

run_verify() {
  require_cmd node
  require_cmd psql
  require_env SUPABASE_DB_URL
  require_loopback_database_url

  echo "Row counts:"
  local_psql -v ON_ERROR_STOP=1 -P pager=off -c "
    SELECT *
    FROM (
      VALUES
        ('tenants', (SELECT COUNT(*)::bigint FROM public.tenants)),
        ('profiles', (SELECT COUNT(*)::bigint FROM public.profiles)),
        ('memberships', (SELECT COUNT(*)::bigint FROM authz.memberships)),
        ('missionaries', (SELECT COUNT(*)::bigint FROM public.missionaries)),
        ('donors', (SELECT COUNT(*)::bigint FROM public.donors)),
        ('funds', (SELECT COUNT(*)::bigint FROM public.funds)),
        ('posts', (SELECT COUNT(*)::bigint FROM public.posts)),
        ('post_likes', (SELECT COUNT(*)::bigint FROM public.post_likes)),
        ('post_prayers', (SELECT COUNT(*)::bigint FROM public.post_prayers)),
        ('post_fires', (SELECT COUNT(*)::bigint FROM public.post_fires)),
        ('post_comments', (SELECT COUNT(*)::bigint FROM public.post_comments)),
        ('campaigns', (SELECT COUNT(*)::bigint FROM public.campaigns)),
        ('donations', (SELECT COUNT(*)::bigint FROM public.donations)),
        ('follows', (SELECT COUNT(*)::bigint FROM public.follows)),
        ('notification_queue', (SELECT COUNT(*)::bigint FROM public.notification_queue)),
        ('donor_feed_preferences', (SELECT COUNT(*)::bigint FROM public.donor_feed_preferences)),
        ('donor_activities', (SELECT COUNT(*)::bigint FROM public.donor_activities)),
        ('donor_pledges', (SELECT COUNT(*)::bigint FROM public.donor_pledges)),
        ('pledge_charge_attempts', (SELECT COUNT(*)::bigint FROM public.pledge_charge_attempts)),
        ('follower_requests', (SELECT COUNT(*)::bigint FROM public.follower_requests)),
        ('locations', (SELECT COUNT(*)::bigint FROM public.locations)),
        ('missionary_tasks', (SELECT COUNT(*)::bigint FROM public.missionary_tasks)),
        ('pdf_templates', (SELECT COUNT(*)::bigint FROM public.pdf_templates)),
        ('audit_logs', (SELECT COUNT(*)::bigint FROM public.audit_logs)),
        ('assets', (SELECT COUNT(*)::bigint FROM public.assets))
    ) AS counts(table_name, row_count)
    ORDER BY table_name;
  "

  echo
  echo "Fixture identity check (expected: 5 profiles, 2 tenants, 9 live memberships):"
  local_psql -v ON_ERROR_STOP=1 -P pager=off -c "
    SELECT (SELECT COUNT(*)::bigint FROM public.profiles) AS profile_rows,
           (SELECT COUNT(*)::bigint FROM public.profiles
             WHERE id IN ('11111111-1111-1111-1111-111111111111',
                          '33333333-3333-3333-3333-333333333333',
                          '44444444-4444-4444-4444-444444444444',
                          '55555555-5555-5555-5555-555555555555',
                          '57000000-0000-4000-8000-000000000001')) AS fixture_profile_rows,
           (SELECT COUNT(*)::bigint FROM public.tenants) AS tenant_rows,
           (SELECT COUNT(*)::bigint FROM authz.memberships WHERE is_active) AS live_membership_rows;
  "
}

case "$MODE" in
  local)
    run_local
    ;;
  hosted)
    run_hosted
    ;;
  verify)
    run_verify
    ;;
  *)
    echo "Usage: $0 [local|hosted|verify]" >&2
    exit 1
    ;;
esac
