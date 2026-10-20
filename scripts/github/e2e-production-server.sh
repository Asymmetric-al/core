#!/usr/bin/env bash
# Build and start Next.js apps in production mode for CI Integration e2e jobs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

APP="${1:-}"
ACTION="${2:-}"

usage() {
  echo "Usage: $0 <donor|admin|missionary> <build|start|wait> ..." >&2
  exit 1
}

[[ -n "$APP" && -n "$ACTION" ]] || usage

case "$APP" in
  donor) APP_DIR="apps/donor"; BUILD_SCRIPT="build:donor" ;;
  admin) APP_DIR="apps/admin"; BUILD_SCRIPT="build:admin" ;;
  missionary) APP_DIR="apps/missionary"; BUILD_SCRIPT="build:missionary" ;;
  *) echo "Unknown app: $APP" >&2; exit 1 ;;
esac

# Bound heap on 8 GiB self-hosted runners during next build/start.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"

build_app() {
  node scripts/run-with-ci-env.mjs -- bun run "$BUILD_SCRIPT"
}

start_app() {
  local port="${1:?port required for start}"
  local host="${2:-127.0.0.1}"
  local log="${3:-/tmp/${APP}-prod.log}"
  local pidfile="${4:-/tmp/${APP}-prod.pid}"

  nohup node scripts/run-with-ci-env.mjs -- bun run --cwd "$APP_DIR" start -- \
    --port "$port" --hostname "$host" >"$log" 2>&1 &
  echo $! >"$pidfile"
}

wait_app() {
  local port="${1:?port required for wait}"
  local host="${2:-127.0.0.1}"
  local health_path="${3:-/api/health}"
  local extra_path="${4:-}"
  local log="${5:-/tmp/${APP}-prod.log}"
  local pidfile="${6:-/tmp/${APP}-prod.pid}"
  local max_seconds="${7:-120}"

  local base="http://${host}:${port}"
  for i in $(seq 1 "$max_seconds"); do
    if curl -sf "${base}${health_path}" >/dev/null; then
      if [[ -z "$extra_path" ]] || curl -sf "${base}${extra_path}" >/dev/null; then
        echo "${APP} production server ready after ${i}s"
        exit 0
      fi
    fi
    if [[ "$i" -eq "$max_seconds" ]]; then
      echo "Timed out waiting for ${APP} at ${base}${health_path}" >&2
      tail -n 150 "$log" 2>/dev/null || true
      kill "$(cat "$pidfile" 2>/dev/null)" 2>/dev/null || true
      exit 1
    fi
    sleep 1
  done
}

case "$ACTION" in
  build) build_app ;;
  start)
    shift 2
    start_app "$@"
    ;;
  wait)
    shift 2
    wait_app "$@"
    ;;
  *)
    echo "Unknown action: $ACTION" >&2
    usage
    ;;
esac
