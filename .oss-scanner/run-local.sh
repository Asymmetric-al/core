#!/usr/bin/env bash
set -euo pipefail

profile=${1:-}
case "$profile" in
  normal|demo) shift ;;
  *) echo 'Usage: run-local.sh normal|demo command [args...]' >&2; exit 2 ;;
esac
if (( $# == 0 )); then
  echo 'A command is required.' >&2
  exit 2
fi

cd "$(dirname "$0")/.."
# Next and other loaders must never discover developer inputs in this image.
for directory in . apps/admin apps/donor apps/missionary packages/eve-runtime; do
  for filename in .env .env.local .env.production .env.production.local .env.development .env.development.local .env.test .env.test.local; do
    if [[ -e "$directory/$filename" ]]; then
      echo "Refusing local environment file: $directory/$filename" >&2
      exit 1
    fi
  done
done

settings=(
  HOME=/root PATH=/usr/local/bin:/usr/bin:/bin LANG=C.UTF-8
  NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 TURBO_TELEMETRY_DISABLED=1
  PLAYWRIGHT_BROWSERS_PATH=/opt/playwright
  DATABASE_URL=postgresql://postgres:scanner-local-only@127.0.0.1:55432/core_scanner
  PAYLOAD_DATABASE_URI=postgresql://postgres:scanner-local-only@127.0.0.1:55432/core_scanner
  PAYLOAD_SECRET=oss-scanner-synthetic-local-secret-00000000
  PAYLOAD_DISABLE_SCHEMA_PUSH=1
  CORE_EVE_BUILD_MODE=artifacts
  NODE_OPTIONS=--max-old-space-size=4096 RAYON_NUM_THREADS=2 CIRCLE_NODE_TOTAL=3
)
if [[ "$profile" == normal ]]; then
  settings+=(NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=scanner-local-anon-key E2E_AUTH_BYPASS=false)
else
  # UI demonstration only. This does not verify Auth, PostgREST, or RLS.
  settings+=(NODE_ENV=development ASYM_USE_CI_ENV_DEFAULTS=1 SKIP_ENV_VALIDATION=1 E2E_AUTH_BYPASS=true NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=example-anon-key)
fi
exec env -i "${settings[@]}" "$@"
