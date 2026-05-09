#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

tmp_seed="$(mktemp)"
trap 'rm -f "$tmp_seed"' EXIT

python3 - "$tmp_seed" <<'PY'
from pathlib import Path
import sys

target = Path(sys.argv[1])
sql = Path("supabase/seed.sql").read_text()
sql = sql.replace(
    "ON CONFLICT (user_id, tenant_id, role, COALESCE(staff_role::text, ''))",
    "ON CONFLICT (user_id, tenant_id, role, staff_role)",
)

missionary_health_columns = """  phone,
  timezone,
  region,
  health_status,
  last_check_in,
  manual_attention,
  health_signals,
  birth_date,
  cover_url,"""
sql = sql.replace(
    missionary_health_columns,
    """  phone,
  cover_url,""",
    1,
)

marker = "-- Demo identity as missionary"
before, marker_text, after = sql.partition(marker)
after = after.replace(
    """  phone,
  cover_url,
  social_links,""",
    missionary_health_columns + """
  social_links,""",
    1,
)
sql = before + marker_text + after
target.write_text(sql)
PY

psql "$DATABASE_URL" -f "$tmp_seed" -v ON_ERROR_STOP=1
