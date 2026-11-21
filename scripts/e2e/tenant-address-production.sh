#!/usr/bin/env bash
# The tenant-address end-to-end specs on production builds (AL-2675; council
# round 1, A15): `bun run test:e2e:tenant-address:production`.
#
# A production build bakes NEXT_PUBLIC_SUPABASE_URL in, so each app is built
# here against the Supabase stub (tests/e2e/fixtures/supabase-stub.mjs), then
# started on the loopback name and its spec run; the specs' production block
# (prerendered shells, form sign-in, the D-19 guard) runs only this way.
#
# Needs: a Payload database for Mission Control's Web Studio case, migrated
# with `bun run cms:migrate`, in PAYLOAD_DATABASE_URI. Ports below 49152, all
# overridable: TENANT_E2E_STUB_PORT (24399), TENANT_E2E_ADMIN_PORT (24432),
# TENANT_E2E_MISSIONARY_PORT (24442); each spec also starts a second server of
# its build on the port after its own, bound to 127.0.0.1 (the D-19 case).
# Usage: tenant-address-production.sh [admin|missionary ...] [-- playwright args]
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

apps=()
while [[ $# -gt 0 && "$1" != "--" ]]; do
  case "$1" in
    admin | missionary) apps+=("$1") ;;
    *)
      echo "Unknown app: $1 (admin or missionary)" >&2
      exit 2
      ;;
  esac
  shift
done
[[ "${1:-}" == "--" ]] && shift
[[ ${#apps[@]} -gt 0 ]] || apps=(admin missionary)

if [[ " ${apps[*]} " == *" admin "* && -z "${PAYLOAD_DATABASE_URI:-}" ]]; then
  echo "PAYLOAD_DATABASE_URI must name a Payload database migrated with bun run cms:migrate (Mission Control's Web Studio case)." >&2
  exit 2
fi

stub_port="${TENANT_E2E_STUB_PORT:-24399}"
pids=()
cleanup() {
  for pid in "${pids[@]}"; do kill -TERM -- "-$pid" 2>/dev/null || true; done
}
trap cleanup EXIT

wait_for() {
  for _ in $(seq 1 300); do
    curl -s -o /dev/null --max-time 30 "$1" && return 0
    sleep 1
  done
  echo "Nothing answered at $1" >&2
  return 1
}

SUPABASE_STUB_PORT="$stub_port" setsid node tests/e2e/fixtures/supabase-stub.mjs &
pids+=("$!")
wait_for "http://127.0.0.1:${stub_port}/" || exit 1

export NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:${stub_port}"
export NEXT_PUBLIC_SUPABASE_ANON_KEY=stub-anon-key
export E2E_SUPABASE_STUB_URL="http://127.0.0.1:${stub_port}"
export VERCEL_ENV=preview EXPOSE_TESTING_API=1 INSTANT_NAV_RIG=1
export EVE_BASE_URL=http://127.0.0.1:9 PLAYWRIGHT_REUSE_EXISTING_SERVER=1
export PAYLOAD_SECRET="${PAYLOAD_SECRET:-tenant-address-e2e-payload-secret}"

status=0
for app in "${apps[@]}"; do
  case "$app" in
    admin)
      port="${TENANT_E2E_ADMIN_PORT:-24432}"
      base_var=PLAYWRIGHT_ADMIN_BASE_URL
      ;;
    missionary)
      port="${TENANT_E2E_MISSIONARY_PORT:-24442}"
      base_var=PLAYWRIGHT_MISSIONARY_BASE_URL
      ;;
  esac
  echo "==> ${app}: production build against the Supabase stub"
  rm -rf "apps/${app}/.next" packages/eve-runtime/.eve
  node scripts/run-with-ci-env.mjs -- bun run --cwd "apps/${app}" build || {
    status=1
    continue
  }
  # The loopback name, never the IP literal (record D-19).
  NODE_OPTIONS="${NODE_OPTIONS:+${NODE_OPTIONS} }--dns-result-order=ipv4first" \
    setsid node scripts/run-with-ci-env.mjs -- bun run --cwd "apps/${app}" start -- \
    --port "$port" --hostname localhost &
  server=$!
  pids+=("$server")
  wait_for "http://localhost:${port}/login" || {
    status=1
    continue
  }
  env "${base_var}=http://localhost:${port}" \
    node scripts/run-with-ci-env.mjs -- node node_modules/@playwright/test/cli.js test \
    -c "playwright.${app}.config.ts" "tests/e2e/${app}-tenant-address.spec.ts" \
    --project="${app}-boneyard" --retries=0 "$@" || status=1
  kill -TERM -- "-$server" 2>/dev/null || true
done
exit "$status"
