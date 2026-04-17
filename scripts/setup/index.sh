#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

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

supabase_cli_guidance() {
  if command -v supabase >/dev/null 2>&1; then
    local version
    version="$(supabase --version 2>/dev/null || true)"
    if [[ -n "$version" ]]; then
      log "Found global Supabase CLI (${version})"
    else
      log "Found global Supabase CLI"
    fi
    return
  fi

  log "Supabase CLI not found globally. Repo fallback will use pinned CLI via: bun run supabase -- <command>"
  log "Recommended global install for faster startup: brew install supabase/tap/supabase (macOS/Linux) or Scoop on Windows"
  log "Docs: https://supabase.com/docs/guides/local-development/cli/getting-started"
}

trim_value() {
  local value="$1"
  value="${value//$'\r'/}"
  value="${value//$'\n'/}"
  value="$(printf "%s" "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
  printf "%s" "$value"
}

has_env_value() {
  local value="$1"
  value="$(trim_value "$value")"
  [[ -n "$value" ]]
}

log "Checking prerequisites..."
require_cmd bun
require_cmd git
supabase_cli_guidance

existing_supabase_url="$(trim_value "${NEXT_PUBLIC_SUPABASE_URL-}")"
existing_supabase_anon_key="$(trim_value "${NEXT_PUBLIC_SUPABASE_ANON_KEY-}")"

if has_env_value "$existing_supabase_url" && has_env_value "$existing_supabase_anon_key"; then
  log "Using Supabase vars from process environment"
elif [[ -f ".env.local" ]]; then
  log ".env.local already exists"
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
elif has_env_value "$existing_supabase_url" || has_env_value "$existing_supabase_anon_key"; then
  log "Detected partial Supabase env vars in process environment"
else
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

  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if has_env_value "$existing_supabase_url"; then
  export NEXT_PUBLIC_SUPABASE_URL="$existing_supabase_url"
fi

if has_env_value "$existing_supabase_anon_key"; then
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$existing_supabase_anon_key"
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
  fail "Missing required env vars. Set them in process env or .env.local."
  log "Set these values:"
  log "  - NEXT_PUBLIC_SUPABASE_URL"
  log "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
  log "Then re-run: bun run setup"
  exit 1
fi

log "Installing dependencies..."
bun install

log "Verifying repo skill mirrors..."
if ! bun run skills:verify; then
  exit 1
fi

log "Running setup verification..."
if bun run setup:verify; then
  log "Setup complete"
  exit 0
fi

exit 1
