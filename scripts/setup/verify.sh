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

strip_crlf() {
  printf "%s" "${1:-}" | tr -d '\r\n'
}

is_placeholder() {
  local v
  v="$(strip_crlf "${1:-}")"
  [[ -z "$v" ]] && return 0
  [[ "$v" == "your-anon-key" ]] && return 0
  [[ "$v" == "your_anon_key" ]] && return 0
  [[ "$v" == "your-anon-key-here" ]] && return 0
  [[ "$v" == "changeme" ]] && return 0
  [[ "$v" == "TODO" ]] && return 0
  [[ "$v" == "https://your-project.supabase.co" ]] && return 0
  [[ "$v" == *"your-project.supabase.co"* ]] && return 0
  return 1
}

looks_like_url() {
  local v
  v="$(strip_crlf "${1:-}")"
  [[ "$v" == http://* || "$v" == https://* ]]
}

looks_like_supabase_anon_jwt() {
  local v
  v="$(strip_crlf "${1:-}")"
  [[ "$v" == eyJ* ]]
}

if [[ -f ".env.local" ]]; then
  set -a
  source ".env.local"
  set +a
fi

require_env NEXT_PUBLIC_SUPABASE_URL
require_env NEXT_PUBLIC_SUPABASE_ANON_KEY

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

SUPABASE_URL="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_URL%/}")"
SUPABASE_ANON_KEY="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_ANON_KEY}")"

if is_placeholder "$SUPABASE_URL"; then
  fail "NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder. Set it to your Supabase Project URL (Project Settings → API)."
fi

if is_placeholder "$SUPABASE_ANON_KEY"; then
  fail "NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be a placeholder. Set it to your Supabase anon public key (Project Settings → API)."
fi

if ! looks_like_url "$SUPABASE_URL"; then
  fail "NEXT_PUBLIC_SUPABASE_URL must start with http:// or https:// (got: $SUPABASE_URL)"
fi

if [[ "$SUPABASE_ANON_KEY" == sb_secret_* ]]; then
  fail "NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a secret key (sb_secret_*). Do NOT use secrets in NEXT_PUBLIC_* vars. Use the Supabase anon public key (Project Settings → API)."
fi

if [[ "$SUPABASE_ANON_KEY" == sb_publishable_* ]]; then
  fail "NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a publishable key (sb_publishable_*). Use the Supabase anon public key (Project Settings → API)."
fi

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

if ! looks_like_supabase_anon_jwt "$SUPABASE_ANON_KEY"; then
  warn "NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like the typical Supabase anon JWT (usually starts with eyJ...). If the REST check fails, re-copy the anon public key from Project Settings → API."
fi

REST_ROOT="${SUPABASE_URL}/rest/v1/"

if ! command -v curl >/dev/null 2>&1; then
  warn "curl not found; skipping Supabase checks."
  log "Verification passed."
  exit 0
fi

log "Checking Supabase host reachability (${SUPABASE_URL})..."
code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 "$SUPABASE_URL" || true)"
case "$code" in
  200|301|302|401|403|404) ;;
  000|"")
    fail "Supabase URL check failed (no response). Verify network connectivity and NEXT_PUBLIC_SUPABASE_URL."
    ;;
  *)
    fail "Supabase URL check failed with HTTP ${code}. Verify NEXT_PUBLIC_SUPABASE_URL."
    ;;
esac

log "Checking anon key is accepted by Supabase REST API..."
code="$(curl -sS -o /dev/null -w "%{http_code}" --max-time 8 \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  "$REST_ROOT" || true)"
case "$code" in
  200|404) ;;
  401|403)
    fail "Anon key was rejected (HTTP $code). Ensure NEXT_PUBLIC_SUPABASE_ANON_KEY is the anon public key for this project URL (Project Settings → API)."
    ;;
  000|"")
    fail "Supabase REST check failed (no response). Verify network connectivity, URL, and key."
    ;;
  *)
    fail "Supabase REST check failed with HTTP ${code}. Verify network, URL, and key."
    ;;
esac

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

log "Verification passed."