#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

bun_cmd="${BUN_BIN:-bun}"

if [[ -z "${BUN_BIN:-}" ]] && ! command -v "$bun_cmd" >/dev/null 2>&1; then
  windows_bun="/mnt/c/Users/${USER:-}/.bun/bin/bun.exe"
  if [[ -x "$windows_bun" ]]; then
    bun_cmd="$windows_bun"
  fi
fi

if ! command -v "$bun_cmd" >/dev/null 2>&1; then
  echo "error: bun is not installed or not on PATH." >&2
  echo "Install Bun from https://bun.sh/docs/installation" >&2
  exit 1
fi

package_json="$REPO_ROOT/package.json"
if [[ ! -f "$package_json" ]]; then
  echo "error: missing root package.json at $package_json" >&2
  exit 1
fi

expected_raw="$(sed -n 's/.*"packageManager": "bun@\([^"]*\)".*/\1/p' "$package_json" | head -n 1)"

if [[ -z "$expected_raw" ]]; then
  echo "error: packageManager must look like bun@<version>" >&2
  exit 2
fi

installed_raw="$("$bun_cmd" --version 2>/dev/null | tr -d '[:space:]')"
installed="${installed_raw#v}"
expected="${expected_raw#v}"

if [[ "$installed" != "$expected" ]]; then
  echo "error: Bun version mismatch." >&2
  echo "  expected (package.json packageManager): bun@${expected}" >&2
  echo "  installed (bun --version):              bun@${installed}" >&2
  echo "" >&2
  echo "Upgrade Bun to match the repo pin, for example:" >&2
  echo "  curl -fsSL https://bun.sh/install | bash" >&2
  echo "  # or: bun upgrade" >&2
  exit 1
fi

echo "Bun version OK: bun@${installed}"
