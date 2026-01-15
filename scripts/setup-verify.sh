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

if [[ -f ".env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  fail "DATABASE_URL not set. Export it or add it to .env.local."
  exit 1
fi

DB_URL="$DATABASE_URL"
log "Checking cloud database via DATABASE_URL..."

if [[ -n "$DB_URL" ]]; then
  SEED_FILE="$ROOT_DIR/supabase/seed.sql"
  if [[ ! -f "$SEED_FILE" ]]; then
    warn "Seed file not found at $SEED_FILE; skipping SQL checks."
  else
    TABLES="$(sed -nE 's/^[[:space:]]*INSERT[[:space:]]+INTO[[:space:]]+([^ (]+).*/\1/p' "$SEED_FILE" | sort -u)"
    if [[ -z "$TABLES" ]]; then
      warn "No INSERT statements found in seed file; skipping SQL checks."
    else
      if command -v psql >/dev/null 2>&1; then
        log "Running SQL row-count checks..."
        SQL=""
        while IFS= read -r table; do
          [[ -z "$table" ]] && continue
          SQL="${SQL}SELECT '${table}' AS table, COUNT(*) AS count FROM ${table};"$'\n'
        done <<< "$TABLES"
        if ! psql "$DB_URL" -v ON_ERROR_STOP=1 -c "$SQL"; then
          fail "SQL checks failed. Verify the database is reachable and seeded."
        fi
      else
        warn "psql not found; skipping SQL checks. Install Postgres client tools to enable counts."
      fi
    fi
  fi

  if command -v psql >/dev/null 2>&1; then
    log "Checking storage buckets..."
    BUCKET_COUNT="$(psql "$DB_URL" -tA -c "SELECT COUNT(*) FROM storage.buckets WHERE id IN ('profiles','document-uploads');" || true)"
    BUCKET_COUNT="$(echo "$BUCKET_COUNT" | tr -d '[:space:]')"
    if [[ "$BUCKET_COUNT" != "2" ]]; then
      fail "Expected storage buckets (profiles, document-uploads). Found count: ${BUCKET_COUNT:-0}."
    fi
  else
    warn "psql not found; skipping storage bucket checks."
  fi
fi

if command -v curl >/dev/null 2>&1; then
  log "Pinging http://localhost:3000 ..."
  if ! curl -fsS "http://localhost:3000" >/dev/null; then
    fail "No response from http://localhost:3000. Run 'bun run dev' in another terminal."
  fi
else
  warn "curl not found; skipping HTTP check for localhost:3000."
fi

if [[ $FAIL -ne 0 ]]; then
  exit 1
fi

log "Verification passed."
