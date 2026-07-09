#!/bin/bash

INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  if ! COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty'); then
    echo "BLOCKED: failed to parse Claude hook input with jq." >&2
    exit 2
  fi
else
  PYTHON_BIN=""
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  fi

  if [ -n "$PYTHON_BIN" ]; then
    if ! COMMAND=$(TOOL_INPUT="$INPUT" "$PYTHON_BIN" -c '
import json
import os
import sys

raw = os.environ.get("TOOL_INPUT", "{}").lstrip("\ufeff").strip()
try:
    parsed = json.loads(raw)
except Exception:
    sys.exit(1)

tool_input = parsed.get("tool_input") or {}
sys.stdout.write(tool_input.get("command") or "")
'); then
      echo "BLOCKED: failed to parse Claude hook input with python." >&2
      exit 2
    fi
  else
    NODE_BIN=""
    if command -v node >/dev/null 2>&1; then
      NODE_BIN="node"
    elif command -v node.exe >/dev/null 2>&1; then
      NODE_BIN="node.exe"
    fi

    if [ -z "$NODE_BIN" ]; then
      echo "BLOCKED: cannot inspect Claude hook input because neither jq, python, nor node is available." >&2
      exit 2
    fi

    if ! COMMAND=$(TOOL_INPUT="$INPUT" "$NODE_BIN" -e '
const raw = (process.env.TOOL_INPUT || "{}").replace(/^\uFEFF/, "").trim();
try {
  const parsed = JSON.parse(raw);
  process.stdout.write(parsed?.tool_input?.command || "");
} catch {
  process.exit(1);
}
'); then
      echo "BLOCKED: failed to parse Claude hook input with node." >&2
      exit 2
    fi
  fi
fi

DANGEROUS_PATTERNS=(
  "git push"
  "git reset --hard"
  "git clean -fd"
  "git clean -f"
  "git branch -D"
  "git[[:space:]]+checkout[[:space:]]+(--[[:space:]]+)?\."
  "git[[:space:]]+restore[[:space:]]+(--[[:space:]]+)?\."
  "push --force"
  "reset --hard"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

exit 0
