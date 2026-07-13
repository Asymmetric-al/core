#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
exec node "$REPO_ROOT/scripts/verify/bun-version.mjs"
