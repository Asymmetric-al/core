#!/usr/bin/env bash
# Lists Nia sources for asymmetric-al/core and prints the chosen source id (same logic as CI).
# POST /v2/sources/{id}/sync does not apply to GitHub repository sources (Nia API returns 400).
#
# Usage: export NIA_API_KEY=... && ./scripts/nia-reindex-dry-run.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${NIA_API_KEY:-}" ]]; then
  echo "error: set NIA_API_KEY in the environment" >&2
  exit 1
fi

response="$(curl --fail --silent --show-error --get \
  'https://apigcp.trynia.ai/v2/sources' \
  -H "Authorization: Bearer ${NIA_API_KEY}" \
  --data-urlencode 'type=repository' \
  --data-urlencode 'query=asymmetric-al/core' \
  --data-urlencode 'limit=100')"

source_id="$(printf '%s' "$response" | python3 scripts/nia_pick_core_source.py)"
echo "SOURCE_ID=$source_id"
echo "Note: GitHub repo sources cannot be re-synced via POST .../sync (local folders / Google Drive only). Indexing uses Nia's GitHub integration."
