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
  --connect-timeout "${NIA_CURL_CONNECT_TIMEOUT_SECONDS:-10}" \
  --max-time "${NIA_CURL_MAX_TIME_SECONDS:-30}" \
  --retry "${NIA_CURL_RETRIES:-2}" \
  --retry-delay "${NIA_CURL_RETRY_DELAY_SECONDS:-2}" \
  --retry-connrefused \
  "${NIA_API_URL}/sources" \
  -H "Authorization: Bearer ${NIA_API_KEY}" \
  --data-urlencode 'type=repository' \
  --data-urlencode 'query=asymmetric-al/core' \
  --data-urlencode 'limit=100')"

source_id="$(printf '%s' "$response" | python3 scripts/nia_pick_core_source.py)"

if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  {
    echo "source_id=${source_id}"
    echo "registered=true"
  } >> "$GITHUB_OUTPUT"
fi

python3 - "$source_id" <<'PY'
import json
import sys

print(
    json.dumps(
        {
            "source_id": sys.argv[1],
            "registered": True,
            "repository": "asymmetric-al/core",
        }
    )
)
PY
echo "Nia source for asymmetric-al/core is registered."
echo "Note: GitHub repo indexing is handled by Nia's GitHub connector, not this script."
