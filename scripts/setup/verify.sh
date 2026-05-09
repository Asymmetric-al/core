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

EXISTING_SUPABASE_URL="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_URL:-}")"
EXISTING_SUPABASE_PUBLISHABLE_KEY="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}")"
EXISTING_SUPABASE_ANON_KEY="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}")"

if [[ -n "$EXISTING_SUPABASE_URL" && ( -n "$EXISTING_SUPABASE_PUBLISHABLE_KEY" || -n "$EXISTING_SUPABASE_ANON_KEY" ) ]]; then
  log "Using Supabase vars from process environment"
elif [[ -f ".env.local" ]]; then
  set -a
  source ".env.local"
  set +a

  if [[ -n "$EXISTING_SUPABASE_URL" ]]; then
    export NEXT_PUBLIC_SUPABASE_URL="$EXISTING_SUPABASE_URL"
  fi

  if [[ -n "$EXISTING_SUPABASE_ANON_KEY" ]]; then
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="$EXISTING_SUPABASE_ANON_KEY"
  fi

  if [[ -n "$EXISTING_SUPABASE_PUBLISHABLE_KEY" ]]; then
    export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$EXISTING_SUPABASE_PUBLISHABLE_KEY"
  fi
elif [[ -n "$EXISTING_SUPABASE_URL" || -n "$EXISTING_SUPABASE_PUBLISHABLE_KEY" || -n "$EXISTING_SUPABASE_ANON_KEY" ]]; then
  log "Detected partial Supabase env vars in process environment"
fi

require_env NEXT_PUBLIC_SUPABASE_URL

SUPABASE_PUBLIC_KEY_SOURCE="NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
SUPABASE_PUBLIC_KEY="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-}")"
if [[ -z "$SUPABASE_PUBLIC_KEY" ]]; then
  SUPABASE_PUBLIC_KEY_SOURCE="NEXT_PUBLIC_SUPABASE_ANON_KEY"
  SUPABASE_PUBLIC_KEY="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}")"
fi

if [[ -z "$SUPABASE_PUBLIC_KEY" ]]; then
  fail "Missing Supabase public key. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY."
fi

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

SUPABASE_URL="$(strip_crlf "${NEXT_PUBLIC_SUPABASE_URL%/}")"

if is_placeholder "$SUPABASE_URL"; then
  fail "NEXT_PUBLIC_SUPABASE_URL appears to be a placeholder. Set it to your Supabase Project URL (Project Settings → API)."
fi

if is_placeholder "$SUPABASE_PUBLIC_KEY"; then
  fail "${SUPABASE_PUBLIC_KEY_SOURCE} appears to be a placeholder. Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase Project Settings → API."
fi

if ! looks_like_url "$SUPABASE_URL"; then
  fail "NEXT_PUBLIC_SUPABASE_URL must start with http:// or https:// (got: $SUPABASE_URL)"
fi

if [[ "$SUPABASE_PUBLIC_KEY" == sb_secret_* ]]; then
  fail "${SUPABASE_PUBLIC_KEY_SOURCE} looks like a secret key (sb_secret_*). Do NOT use secrets in NEXT_PUBLIC_* vars. Use a Supabase publishable key or legacy anon public key (Project Settings → API)."
fi

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

if [[ "$SUPABASE_PUBLIC_KEY" != sb_publishable_* ]] && ! looks_like_supabase_anon_jwt "$SUPABASE_PUBLIC_KEY"; then
  warn "${SUPABASE_PUBLIC_KEY_SOURCE} does not look like a Supabase publishable key (sb_publishable_*) or legacy anon JWT (usually starts with eyJ...). If the REST check fails, re-copy the public API key from Project Settings → API."
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
  -H "apikey: $SUPABASE_PUBLIC_KEY" \
  -H "Authorization: Bearer $SUPABASE_PUBLIC_KEY" \
  "$REST_ROOT" || true)"
case "$code" in
  200|404) ;;
  401|403)
    fail "Supabase public key was rejected (HTTP $code). Ensure ${SUPABASE_PUBLIC_KEY_SOURCE} belongs to this project URL (Project Settings → API)."
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