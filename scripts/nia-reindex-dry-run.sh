#!/usr/bin/env bash
# Local mirror of .github/workflows/nia-reindex.yml (GET sources + POST sync).
# Usage: export NIA_API_KEY=... && ./scripts/nia-reindex-dry-run.sh [--sync-only]
# With --sync-only, POSTs sync for SOURCE_ID env only (no listing).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${NIA_API_KEY:-}" ]]; then
  echo "error: set NIA_API_KEY in the environment" >&2
  exit 1
fi

if [[ "${1:-}" == "--sync-only" ]]; then
  if [[ -z "${SOURCE_ID:-}" ]]; then
    echo "error: SOURCE_ID required for --sync-only" >&2
    exit 1
  fi
  curl --fail-with-body --silent --show-error \
    -X POST "https://apigcp.trynia.ai/v2/sources/${SOURCE_ID}/sync" \
    -H "Authorization: Bearer ${NIA_API_KEY}" \
    -H 'Content-Type: application/json' \
    --data '{}'
  echo >&2
  echo "Triggered Nia sync for source ${SOURCE_ID}" >&2
  exit 0
fi

response="$(curl --fail --silent --show-error --get \
  'https://apigcp.trynia.ai/v2/sources' \
  -H "Authorization: Bearer ${NIA_API_KEY}" \
  --data-urlencode 'type=repository' \
  --data-urlencode 'query=asymmetric-al/core' \
  --data-urlencode 'limit=100')"

source_id="$(printf '%s' "$response" | python3 scripts/nia_pick_core_source.py)"
export SOURCE_ID="$source_id"
echo "SOURCE_ID=$source_id"
curl --fail-with-body --silent --show-error \
  -X POST "https://apigcp.trynia.ai/v2/sources/${SOURCE_ID}/sync" \
  -H "Authorization: Bearer ${NIA_API_KEY}" \
  -H 'Content-Type: application/json' \
  --data '{}'
echo
echo "Triggered Nia sync for source ${SOURCE_ID}"
