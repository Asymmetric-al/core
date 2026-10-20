#!/usr/bin/env bash
# Build and start Next.js apps in production mode for CI Integration e2e jobs.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

APP="${1:-}"
ACTION="${2:-}"

usage() {
  echo "Usage: $0 <donor|admin|missionary|all> <build|build-all|start|wait|stop> ..." >&2
  exit 1
}

[[ -n "$APP" && -n "$ACTION" ]] || usage

# Bound heap on 8 GiB self-hosted runners during next build/start.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
export ASYM_E2E_INTEGRATION_BUILD=1

app_dir_for() {
  case "$1" in
    donor) echo "apps/donor" ;;
    admin) echo "apps/admin" ;;
    missionary) echo "apps/missionary" ;;
    *) return 1 ;;
  esac
}

build_script_for() {
  case "$1" in
    donor) echo "build:donor" ;;
    admin) echo "build:admin" ;;
    missionary) echo "build:missionary" ;;
    *) return 1 ;;
  esac
}

stop_app() {
  local app="${1:?app required}"
  local pidfile="/tmp/${app}-prod.pid"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]]; then
      kill "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
    fi
    rm -f "$pidfile"
  fi
}

stop_all_apps() {
  stop_app donor
  stop_app admin
  stop_app missionary
}

build_one_app() {
  local app="${1:?app required}"
  local build_script
  build_script="$(build_script_for "$app")" || {
    echo "Unknown app: $app" >&2
    exit 1
  }
  stop_app "$app"
  echo "==> E2E production build: ${app} (NODE_OPTIONS=${NODE_OPTIONS})"
  node scripts/run-with-ci-env.mjs -- bun run "$build_script"
}

build_app() {
  build_one_app "$APP"
}

build_all_apps() {
  stop_all_apps
  build_one_app donor
  build_one_app admin
  build_one_app missionary
}

start_app() {
  local port="${1:?port required for start}"
  local host="${2:-127.0.0.1}"
  local log="${3:-/tmp/${APP}-prod.log}"
  local pidfile="${4:-/tmp/${APP}-prod.pid}"
  local app_dir
  app_dir="$(app_dir_for "$APP")" || {
    echo "Unknown app: $APP" >&2
    exit 1
  }

  nohup node scripts/run-with-ci-env.mjs -- bun run --cwd "$app_dir" start -- \
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

case "$APP" in
  donor | admin | missionary) ;;
  all)
    case "$ACTION" in
      build-all) build_all_apps ;;
      stop) stop_all_apps ;;
      *)
        echo "Unknown action for all: $ACTION" >&2
        usage
        ;;
    esac
    exit 0
    ;;
  *)
    echo "Unknown app: $APP" >&2
    exit 1
    ;;
esac

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
  stop) stop_app "$APP" ;;
  *)
    echo "Unknown action: $ACTION" >&2
    usage
    ;;
esac
