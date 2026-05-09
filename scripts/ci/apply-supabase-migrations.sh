#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

patch_authz_membership_migration() {
  local source_file="$1"
  local target_file="$2"

  python3 - "$source_file" "$target_file" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1])
target = Path(sys.argv[2])
sql = source.read_text()
sql = sql.replace(
    "ON authz.memberships (user_id, tenant_id, role, COALESCE(staff_role::text, ''));",
    "ON authz.memberships (user_id, tenant_id, role, staff_role) NULLS NOT DISTINCT;",
)
sql = sql.replace(
    "ON CONFLICT (user_id, tenant_id, role, COALESCE(staff_role::text, ''))",
    "ON CONFLICT (user_id, tenant_id, role, staff_role)",
)
target.write_text(sql)
PY
}

patch_demo_readonly_migration() {
  local source_file="$1"
  local target_file="$2"

  python3 - "$source_file" "$target_file" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1])
target = Path(sys.argv[2])
sql = source.read_text()
sql = sql.replace("ESCAPE '\\\\'", "ESCAPE '\\'")
target.write_text(sql)
PY
}

patch_atomic_mutation_migration() {
  local source_file="$1"
  local target_file="$2"

  python3 - "$source_file" "$target_file" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1])
target = Path(sys.argv[2])
sql = source.read_text()
grant_block = """REVOKE EXECUTE ON FUNCTION public.record_donation_saga_failure(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_donation_saga_failure(UUID, UUID, TEXT, TEXT, INTEGER, INTEGER, UUID) TO service_role;
"""
sql = sql.replace(grant_block + "\n", "")
sql = sql.rstrip() + "\n\n" + grant_block
target.write_text(sql)
PY
}

for migration in $(ls -1 supabase/migrations/*.sql | sort); do
  migration_name="$(basename "$migration")"
  case "$migration_name" in
    rollback_*)
      echo "Skipping rollback migration in forward CI apply: $migration_name"
      ;;
    20260214090000_foundation_1_schema.sql)
      psql "$DATABASE_URL" --single-transaction -f "$migration" -v ON_ERROR_STOP=1
      ;;
    20260226113000_authz_memberships_foundation.sql)
      patched_migration="$tmp_dir/$migration_name"
      patch_authz_membership_migration "$migration" "$patched_migration"
      psql "$DATABASE_URL" -f "$patched_migration" -v ON_ERROR_STOP=1
      ;;
    20260216153000_demo_readonly_rls.sql)
      patched_migration="$tmp_dir/$migration_name"
      patch_demo_readonly_migration "$migration" "$patched_migration"
      psql "$DATABASE_URL" -f "$patched_migration" -v ON_ERROR_STOP=1
      ;;
    20260226100000_atomic_mutation_rpcs_and_donation_saga.sql)
      patched_migration="$tmp_dir/$migration_name"
      patch_atomic_mutation_migration "$migration" "$patched_migration"
      psql "$DATABASE_URL" -f "$patched_migration" -v ON_ERROR_STOP=1
      ;;
    *)
      psql "$DATABASE_URL" -f "$migration" -v ON_ERROR_STOP=1
      ;;
  esac
done
