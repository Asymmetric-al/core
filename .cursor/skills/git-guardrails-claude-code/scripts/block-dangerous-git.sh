#!/bin/bash
# CORE-OVERLAY: fail-closed hook JSON parsing and `git checkout -- .` /
# `git restore -- .` patterns. Upstream git-guardrails uses a fail-open jq
# one-liner and literal `git checkout .` / `git restore .` only. Restore this
# overlay after refreshing mattpocock/skills git-guardrails-claude-code.

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
  "git[[:space:]]+checkout[[:space:]]+(--[[:space:]]+)?['\"]?\.\/?['\"]*([[:space:];&|]|$)"
  "git[[:space:]]+restore[[:space:]]+(--[[:space:]]+)?['\"]?\.\/?['\"]*([[:space:];&|]|$)"
  "push --force"
  "reset --hard"
)

NORMALIZED=$(
  set -o pipefail
  printf '%s' "$COMMAND" |
    sed -E 's/\$\{IFS\}|\$IFS/ /g' |
    tr -d "\"'" |
    sed -E 's/\$\././g' |
    tr -s '[:space:]' ' '
) || {
  echo "BLOCKED: failed to normalize the git command." >&2
  exit 2
}

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$NORMALIZED" | grep -qE "$pattern"; then
    echo "BLOCKED: '$COMMAND' matches dangerous pattern '$pattern'. The user has prevented you from doing this." >&2
    exit 2
  fi
done

pathspec_discards_worktree() {
  case "$1" in
    ':/'|':/*'|':.'|'::'|':(top)'|':(top)*'|':(prefix:0)'|':(prefix:0)*'|':(literal).'|':(literal)./'|':(icase).'|':(icase)./')
      return 0
      ;;
  esac

  printf '%s' "$1" | grep -qE '^\.$|^\.(/\.*)+$'
}

command_discards_worktree() {
  local part="$1"
  local -a tokens=()
  local token=""
  local seen_git=0
  local skip_next=0
  local subcommand=""
  local staged=0
  local worktree=0
  local past_double_dash=0
  local discards=0

  read -r -a tokens <<< "$part"

  for token in "${tokens[@]}"; do
    case "$token" in
      :\(*) ;;
      *\)) token="${token%)}" ;;
    esac

    if [ "$skip_next" -eq 1 ]; then
      skip_next=0
      continue
    fi

    if [ "$seen_git" -eq 0 ]; then
      case "$token" in
        git|*/git) seen_git=1 ;;
      esac
      continue
    fi

    if [ -z "$subcommand" ]; then
      case "$token" in
        --*=*) continue ;;
        -C|-c|--git-dir|--work-tree|--namespace|--super-prefix|--config-env|--exec-path)
          skip_next=1
          continue
          ;;
        -*) continue ;;
        *) subcommand="$token" ;;
      esac
      continue
    fi

    if [ "$past_double_dash" -eq 0 ]; then
      case "$token" in
        --)
          past_double_dash=1
          continue
          ;;
        --staged)
          staged=1
          continue
          ;;
        --worktree)
          worktree=1
          continue
          ;;
        --source|--pathspec-from-file|--conflict)
          skip_next=1
          continue
          ;;
        --*=*) continue ;;
        --*) continue ;;
        -*)
          case "$token" in
            *W*) worktree=1 ;;
          esac
          case "$token" in
            *S*) staged=1 ;;
          esac
          case "$token" in
            *s*) skip_next=1 ;;
          esac
          continue
          ;;
      esac
    fi

    if pathspec_discards_worktree "$token"; then
      discards=1
    fi
  done

  [ "$subcommand" = "checkout" ] || [ "$subcommand" = "restore" ] || return 1
  [ "$discards" -eq 1 ] || return 1
  if [ "$subcommand" = "restore" ] && [ "$staged" -eq 1 ] && [ "$worktree" -eq 0 ]; then
    return 1
  fi
  return 0
}

DISCARDS_WORKTREE="false"
while IFS= read -r COMMAND_PART; do
  if command_discards_worktree "$COMMAND_PART"; then
    DISCARDS_WORKTREE="true"
    break
  fi
done <<EOF
$(printf '%s' "$NORMALIZED" | sed -E 's/\$\(/\n/g; s/`/\n/g' | tr ';|&' '\n')
EOF

if [ "$DISCARDS_WORKTREE" = "true" ]; then
  echo "BLOCKED: '$COMMAND' discards the working tree." >&2
  exit 2
fi

exit 0
