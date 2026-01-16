#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

log() {
  printf "==> %s\n" "$*"
}

fail() {
  printf "error: %s\n" "$*" >&2
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    fail "Missing required command: $cmd. Install it to continue."
    exit 1
  fi
}

trim_value() {
  local value="$1"
  value="${value//$'\r'/}"
  value="${value//$'\n'/}"
  value="$(printf "%s" "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  printf "%s" "$value"
}

log "Checking prerequisites..."
require_cmd bun
require_cmd git

if [[ ! -f ".env.local" ]]; then
  if [[ -f ".env.example" ]]; then
    cp .env.example .env.local
    log "Created .env.local from .env.example"
  else
    cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF
    log "Created .env.local with placeholders"
  fi
else
  log ".env.local already exists"
fi

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

missing=0

check_required_env() {
  local name="$1"
  local placeholder="$2"
  local value="${!name-}"

  value="$(trim_value "$value")"

  if [[ -z "$value" || "$value" == "$placeholder" ]]; then
    missing=1
  fi
}

check_required_env "NEXT_PUBLIC_SUPABASE_URL" "https://your-project.supabase.co"
check_required_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "your-anon-key"

if [[ $missing -ne 0 ]]; then
  fail "Missing required env vars in .env.local. This is expected on first run."
  log "Edit .env.local and set:"
  log "  - NEXT_PUBLIC_SUPABASE_URL"
  log "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  log "Then re-run ./scripts/setup"
  exit 1
fi

log "Installing dependencies..."
bun install

log "Running setup verification..."
if bun run setup:verify; then
  log "Setup complete"
  exit 0
fi

exit 1
