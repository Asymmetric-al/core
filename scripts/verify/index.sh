#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

log() {
  printf "==> %s\n" "$*"
}

fail() {
  printf "==> FAIL %s\n" "$*"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    printf "error: Missing required command: %s. Install it to continue.\n" "$cmd" >&2
    exit 1
  fi
}

request_code() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" --max-time 5 "$url" || true
}

require_cmd curl

server_code="$(request_code "http://localhost:3000")"
if [[ -z "$server_code" || "$server_code" == "000" ]]; then
  fail "server up"
  printf "Dev server not running. Start it with: bun run dev\n"
  exit 1
fi

log "PASS server up"

check_route() {
  local route="$1"
  local url="http://localhost:3000${route}"
  local code
  code="$(request_code "$url")"
  if [[ "$code" != "200" ]]; then
    fail "${route} (${code:-unknown})"
    exit 1
  fi
  log "PASS ${route} (200)"
}

check_route "/"
check_route "/login"
check_route "/register"

log "Running Supabase verification..."
if bun run setup:verify; then
  log "PASS supabase verify"
else
  fail "supabase verify"
  exit 1
fi
