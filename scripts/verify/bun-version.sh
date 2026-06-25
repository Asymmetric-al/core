#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

resolve_windows_bun_for_wsl() {
  local windows_bun_path
  windows_bun_path="$(where.exe bun 2>/dev/null | tr -d '\r' || true)"
  windows_bun_path="${windows_bun_path%%$'\n'*}"

  if [[ -z "$windows_bun_path" ]]; then
    return 1
  fi

  if [[ "$windows_bun_path" =~ ^([A-Za-z]):\\(.*)$ ]]; then
    local drive="${BASH_REMATCH[1],,}"
    local rest="${BASH_REMATCH[2]//\\//}"
    printf '/mnt/%s/%s\n' "$drive" "$rest"
    return 0
  fi

  return 1
}

bun_cmd="${BUN_VERSION_GUARD_BUN:-bun}"
if [[ -z "${BUN_VERSION_GUARD_BUN:-}" ]] &&
  ! command -v "$bun_cmd" >/dev/null 2>&1; then
  if windows_bun_path="$(resolve_windows_bun_for_wsl)" &&
    "$windows_bun_path" --version >/dev/null 2>&1; then
    bun_cmd="$windows_bun_path"
  fi
fi

if ! "$bun_cmd" --version >/dev/null 2>&1; then
  echo "error: bun is not installed or not on PATH." >&2
  echo "Install Bun from https://bun.sh/docs/installation" >&2
  exit 1
fi

package_json="$REPO_ROOT/package.json"
if [[ ! -f "$package_json" ]]; then
  echo "error: missing root package.json at $package_json" >&2
  exit 1
fi

expected_raw="$("$bun_cmd" -e "
const fs = require('node:fs');
const pkg = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
const pm = pkg.packageManager;
if (!pm || typeof pm !== 'string') {
  process.stderr.write('error: package.json is missing packageManager\\n');
  process.exit(2);
}
const match = pm.match(/^bun@(.+)$/);
if (!match) {
  process.stderr.write('error: packageManager must look like bun@<version>, got: ' + pm + '\\n');
  process.exit(2);
}
process.stdout.write(match[1]);
" package.json)"

if [[ -n "${BUN_VERSION_GUARD_INSTALLED_VERSION:-}" ]]; then
  installed_raw="${BUN_VERSION_GUARD_INSTALLED_VERSION}"
else
  installed_raw="$("$bun_cmd" --version 2>/dev/null | tr -d '[:space:]')"
fi
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
