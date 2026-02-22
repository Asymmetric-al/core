#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

shopt -s globstar nullglob

api_route_files=(apps/*/app/api/**/*.ts)

if [[ ${#api_route_files[@]} -eq 0 ]]; then
  echo "No app API route TypeScript files found under apps/*/app/api/**/*.ts; data boundary check skipped."
  exit 0
fi

violations="$(
  grep -rn \
    -e "@asym/database/supabase/admin" \
    -e "@asym/database/supabase/server" \
    -e "@asym/database/supabase/client" \
    -e "@supabase/ssr" \
    -e "@supabase/supabase-js" \
    "${api_route_files[@]}" || true
)"

if [[ -n "$violations" ]]; then
  echo "Data access boundary violations detected in apps/*/app/api/**/*.ts:"
  echo "$violations"
  echo
  echo "Route handlers under apps/*/app/api/ must be thin re-exports and must not import Supabase clients directly."
  echo "See docs/guides/architecture/data-access-boundary.md for the boundary rule and approved exceptions."
  exit 1
fi

echo "Data access boundary check passed: no direct Supabase imports found in apps/*/app/api/**/*.ts."
exit 0
