#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

cd "$ROOT_DIR"

log() {
  printf "==> %s\n" "$*"
}

warn() {
  printf "warning: %s\n" "$*" >&2
}

fail() {
  printf "error: %s\n" "$*" >&2
  FAIL=1
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    fail "Missing required env var: $name"
  fi
}

if [[ -f ".env.local" ]]; then
  set -a
  source .env.local
  set +a
fi

require_env NEXT_PUBLIC_SUPABASE_URL
require_env NEXT_PUBLIC_SUPABASE_ANON_KEY

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

SUPABASE_URL="$(printf "%s" "${NEXT_PUBLIC_SUPABASE_URL%/}" | tr -d '\r\n')"
SUPABASE_ANON_KEY="$(printf "%s" "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" | tr -d '\r\n')"
REST_ROOT="${SUPABASE_URL}/rest/v1/"

if ! command -v curl >/dev/null 2>&1; then
  warn "curl not found; skipping Supabase checks."
  if [[ $FAIL -ne 0 ]]; then
    exit 1
  fi
  log "Verification passed."
  exit 0
fi

log "Checking Supabase host reachability (${SUPABASE_URL})..."
code="$(curl -sS -o /dev/null -w "%{http_code}" "$SUPABASE_URL" || true)"
case "$code" in
  200|301|302|401|403|404) ;;
  *)
    fail "Supabase URL check failed with HTTP ${code:-unknown}. Verify NEXT_PUBLIC_SUPABASE_URL."
    ;;
esac

log "Checking anon key is accepted by Supabase REST API..."
code="$(curl -sS -o /dev/null -w "%{http_code}" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$REST_ROOT" || true)"
case "$code" in
  200|404) ;;
  401|403)
    fail "Anon key was rejected (HTTP $code). Verify NEXT_PUBLIC_SUPABASE_ANON_KEY matches this project URL."
    ;;
  *)
    fail "Supabase REST check failed with HTTP ${code:-unknown}. Verify network, URL, and key."
    ;;
esac

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

log "Verification passed."
