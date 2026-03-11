#!/usr/bin/env bash
set -euo pipefail

max_attempts="${1:-3}"

for ((attempt=1; attempt<=max_attempts; attempt++)); do
  echo "Attempt ${attempt}/${max_attempts}" >&2
  if bun run verify:e2e; then
    echo "Verification passed." >&2
    exit 0
  fi

  if (( attempt < max_attempts )); then
    echo "Verification failed. Fix the code, then retry." >&2
    read -r -p "Press Enter to retry, or type q to quit: " response
    if [[ "${response}" == "q" ]]; then
      exit 1
    fi
  fi
done

echo "Reached max attempts without a pass." >&2
exit 1
