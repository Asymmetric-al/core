#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
DB_PASSWORD="${SUPABASE_DB_PASSWORD:-}"
VERIFY=0

usage() {
  cat <<'USAGE'
Usage: ./setup-cloud.sh [--project-ref <ref>] [--db-password <password>] [--verify]

Options:
  --project-ref  Supabase project ref (or set SUPABASE_PROJECT_REF).
  --db-password  Supabase database password used by `supabase link` (or set SUPABASE_DB_PASSWORD).
  --verify       Run setup verification checks after provisioning.
  --help         Show this help message.
USAGE
}

log() {
  printf "==> %s\n" "$*"
}

warn() {
  printf "warning: %s\n" "$*" >&2
}

die() {
  printf "error: %s\n" "$*" >&2
  exit 1
}

require_cmd() {
  local cmd="$1"
  local hint="$2"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    die "Missing required command: $cmd. $hint"
  fi
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    die "Missing required env var: $name"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-ref)
      PROJECT_REF="${2:-}"
      shift
      ;;
    --db-password)
      DB_PASSWORD="${2:-}"
      shift
      ;;
    --verify)
      VERIFY=1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "Unknown option: $1 (use --help for usage)"
      ;;
  esac
  shift
done

cd "$ROOT_DIR"

require_cmd bun "Install Bun from https://bun.sh"
require_cmd supabase "Install Supabase CLI (https://supabase.com/docs/guides/cli)"

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
else
  if [[ -f ".env.example" ]]; then
    cp .env.example .env.local
    warn "Created .env.local from .env.example. Fill in the required values before running the app."
  fi
fi

require_env NEXT_PUBLIC_SUPABASE_URL
require_env NEXT_PUBLIC_SUPABASE_ANON_KEY
require_env SUPABASE_SERVICE_ROLE_KEY

if [[ $VERIFY -eq 1 ]]; then
  require_env DATABASE_URL
fi

if [[ -z "$PROJECT_REF" ]]; then
  if [[ -t 0 ]]; then
    read -r -p "Supabase project ref: " PROJECT_REF
  else
    die "SUPABASE_PROJECT_REF not set and no --project-ref provided."
  fi
fi

if [[ -z "$DB_PASSWORD" ]]; then
  if [[ -t 0 ]]; then
    read -r -s -p "Supabase DB password (for link): " DB_PASSWORD
    echo
  fi
fi

if [[ -z "$DB_PASSWORD" && ! -t 0 ]]; then
  die "SUPABASE_DB_PASSWORD is required in non-interactive shells."
fi

log "Installing dependencies..."
if ! bun install; then
  die "bun install failed. Check your Bun installation and network access."
fi

log "Linking Supabase project..."
if [[ -n "$DB_PASSWORD" ]]; then
  supabase link --project-ref "$PROJECT_REF" --password "$DB_PASSWORD"
else
  supabase link --project-ref "$PROJECT_REF"
fi

log "Pushing schema + seed to Supabase (db push --include-seed)..."
supabase db push --include-seed

if [[ $VERIFY -eq 1 ]]; then
  log "Running setup verification..."
  "$ROOT_DIR/scripts/setup-verify.sh"
fi

log "Cloud setup complete. Run 'bun run dev' to start the app."
