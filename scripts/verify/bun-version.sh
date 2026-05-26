#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if ! command -v bun >/dev/null 2>&1; then
  echo "error: bun is not installed or not on PATH." >&2
  echo "Install Bun from https://bun.sh/docs/installation" >&2
  exit 1
fi

package_json="$REPO_ROOT/package.json"
if [[ ! -f "$package_json" ]]; then
  echo "error: missing root package.json at $package_json" >&2
  exit 1
fi

expected_raw="$(bun -e "
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
" "$package_json")"

installed_raw="$(bun --version 2>/dev/null | tr -d '[:space:]')"
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
