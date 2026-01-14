#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

FORCE=0
VERIFY=0

usage() {
  cat <<'EOF'
Usage: ./setup-local.sh [--force] [--verify]

Options:
  --force   Skip confirmation before resetting the local database.
  --verify  Run setup verification checks after provisioning.
  --help    Show this help message.
EOF
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force)
      FORCE=1
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
require_cmd supabase "Install Supabase CLI (e.g. brew install supabase/tap/supabase)"
require_cmd docker "Install Docker Desktop and ensure the Docker CLI is available."

log "Checking Docker daemon..."
if ! docker info >/dev/null 2>&1; then
  die "Docker is not running. Start Docker Desktop and wait for it to finish booting."
fi

if [[ $FORCE -ne 1 ]]; then
  if [[ ! -t 0 ]]; then
    die "This script needs confirmation to reset the local database. Re-run with --force in non-interactive shells."
  fi

  read -r -p "This will RESET your local Supabase database and re-seed data. Continue? [y/N] " reply
  case "$reply" in
    [Yy]|[Yy][Ee][Ss])
      ;;
    *)
      die "Aborted by user."
      ;;
  esac
fi

log "Installing dependencies..."
if ! bun install; then
  die "bun install failed. Check your Bun installation and network access."
fi

log "Starting Supabase..."
if ! supabase start; then
  die "supabase start failed. Ensure Docker is running and the Supabase CLI is up to date."
fi

log "Resetting Supabase database (schema + seed)..."
if ! supabase db reset; then
  die "supabase db reset failed. Check Supabase logs or run 'supabase status' for details."
fi

if [[ $VERIFY -eq 1 ]]; then
  log "Running setup verification..."
  "$ROOT_DIR/scripts/setup-verify.sh"
fi

log "Local setup complete. Run 'bun run dev' to start the app."
