#!/usr/bin/env bash
# Verifies asymmetric-al/core is registered as a Nia GitHub repository source.
# This does not trigger a reindex; GitHub repository indexing is handled by
# Nia's GitHub connector rather than POST /v2/sources/{id}/sync.
#
# Usage: export NIA_API_KEY=... && ./scripts/nia-source-check.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -z "${NIA_API_KEY:-}" ]]; then
  echo "error: set NIA_API_KEY in the environment" >&2
  exit 1
fi

if [[ -z "${NIA_API_URL:-}" ]]; then
  NIA_API_HOST="${NIA_API_HOST:-apigcp.trynia.ai}"
  NIA_API_URL="https://${NIA_API_HOST}/v2"
fi
NIA_API_URL="${NIA_API_URL%/}"
if [[ "${NIA_API_URL}" != */v2 ]]; then
  NIA_API_URL="${NIA_API_URL}/v2"
fi

response="$(curl --fail --silent --show-error --get \
  "${NIA_API_URL}/sources" \
  -H "Authorization: Bearer ${NIA_API_KEY}" \
  --data-urlencode 'type=repository' \
  --data-urlencode 'query=asymmetric-al/core' \
  --data-urlencode 'limit=100')"

source_id="$(printf '%s' "$response" | python3 scripts/nia_pick_core_source.py)"
echo "SOURCE_ID=$source_id"
echo "Nia source for asymmetric-al/core is registered."
echo "Note: GitHub repo indexing is handled by Nia's GitHub connector, not this script."
