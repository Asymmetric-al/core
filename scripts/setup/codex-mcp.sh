#!/usr/bin/env bash
set -euo pipefail

CONFIG_PATH="${CODEX_CONFIG_TOML:-$HOME/.codex/config.toml}"

log() {
  printf "==> %s\n" "$*"
}

warn() {
  printf "warning: %s\n" "$*" >&2
}

die() {
  printf "error: %s\n" "$*" >&2
  exit 1
}

if ! command -v rg >/dev/null 2>&1; then
  die "Missing required command: rg (ripgrep). Install it to continue."
fi

if [[ ! -f "$CONFIG_PATH" ]]; then
  warn "Codex config not found at $CONFIG_PATH"
  warn "Create it and add MCP servers: context7, nia, github."
  exit 0
fi

missing=0

check_block() {
  local block_name="$1"
  if rg -q "^\\[${block_name}\\]" "$CONFIG_PATH"; then
    log "Found [$block_name] in $CONFIG_PATH"
  else
    warn "Missing [$block_name] in $CONFIG_PATH"
    missing=1
  fi
}

check_block "mcp_servers.context7"
check_block "mcp_servers.nia"
check_block "mcp_servers.github"

if [[ $missing -eq 1 ]]; then
  warn "MCP servers missing. Add them to $CONFIG_PATH before using Codex."
else
  log "All required MCP servers are present."
fi
