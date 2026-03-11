#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEED_SQL="$ROOT_DIR/supabase/seed.sql"
EXPECTED_PROJECT_REF="${SUPABASE_PROJECT_REF:-btewedpsxwsjczvmegby}"
EXPECTED_SUPABASE_URL="https://${EXPECTED_PROJECT_REF}.supabase.co"
MODE="${1:-local}"

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

run_hosted() {
  require_cmd bun
  require_cmd psql
  require_env SUPABASE_SERVICE_ROLE_KEY
  require_env SUPABASE_DB_URL
  require_env NEXT_PUBLIC_SUPABASE_URL

  local normalized_url="${NEXT_PUBLIC_SUPABASE_URL%/}"
  if [[ "$normalized_url" != "$EXPECTED_SUPABASE_URL" ]]; then
    echo "NEXT_PUBLIC_SUPABASE_URL mismatch. Expected: $EXPECTED_SUPABASE_URL" >&2
    exit 1
  fi

  echo "Applying migrations to hosted database via Supabase CLI (repo runner)..."
  bun run supabase -- db push --db-url "$SUPABASE_DB_URL"

  echo "Running deterministic seed SQL on hosted database..."
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$SEED_SQL"
  echo "Hosted seed complete."
}

run_verify() {
  require_cmd psql
  require_env SUPABASE_DB_URL

  echo "Row counts:"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
    SELECT *
    FROM (
      VALUES
        ('tenants', (SELECT COUNT(*)::bigint FROM public.tenants)),
        ('profiles', (SELECT COUNT(*)::bigint FROM public.profiles)),
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
  echo "Single-profile check:"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
    SELECT COUNT(*)::bigint AS profile_rows,
           COUNT(*) FILTER (WHERE id = '11111111-1111-1111-1111-111111111111')::bigint AS demo_profile_rows
    FROM public.profiles;
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
