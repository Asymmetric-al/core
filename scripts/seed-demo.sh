#!/usr/bin/env bash
set -euo pipefail

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

# The hosted seed is retired (WP0, audit finding NA-03). supabase/seed.sql
# deletes every tenant's rows before it reseeds, and this mode also pushed
# every pending migration, so it must never reach a hosted database. The mode
# name is kept only so that a stale command fails loudly.
run_hosted() {
  echo "Refusing to seed a hosted database: the hosted seed deletes every organization's data and is retired." >&2
  echo "Seed the local stack with: bash ./scripts/seed-demo.sh local" >&2
  exit 1
}

# Succeeds only for a postgres URL whose host is loopback: localhost,
# 127.0.0.0/8 or [::1]. Anything else, including an unparseable URL, fails.
is_loopback_database_url() {
  local url="$1"
  local authority host
  [[ "$url" =~ ^postgres(ql)?://([^/?#]*) ]] || return 1
  authority="${BASH_REMATCH[2]}"
  authority="${authority##*@}"
  if [[ "$authority" =~ ^\[([^]]*)\] ]]; then
    host="${BASH_REMATCH[1]}"
  else
    host="${authority%%:*}"
  fi
  host="$(printf '%s' "$host" | tr '[:upper:]' '[:lower:]')"
  [[ "$host" == "localhost" || "$host" == "::1" ]] && return 0
  [[ "$host" =~ ^127\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]] && return 0
  return 1
}

require_loopback_database_url() {
  if ! is_loopback_database_url "$SUPABASE_DB_URL"; then
    echo "Refusing to run against a non-loopback database. SUPABASE_DB_URL must name localhost, 127.0.0.1 or [::1]." >&2
    exit 1
  fi
}

run_verify() {
  require_cmd psql
  require_env SUPABASE_DB_URL
  require_loopback_database_url

  echo "Row counts:"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
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
  echo "Fixture identity check (expected: 3 profiles, 2 tenants, 6 live memberships):"
  psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -P pager=off -c "
    SELECT (SELECT COUNT(*)::bigint FROM public.profiles) AS profile_rows,
           (SELECT COUNT(*)::bigint FROM public.profiles
             WHERE id IN ('11111111-1111-1111-1111-111111111111',
                          '33333333-3333-3333-3333-333333333333',
                          '44444444-4444-4444-4444-444444444444')) AS fixture_profile_rows,
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
