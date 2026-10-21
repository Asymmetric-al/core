#!/usr/bin/env bash
# Start Next.js dev servers for CI Integration e2e jobs (loopback / hermetic Supabase only).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

APP="${1:-}"
ACTION="${2:-}"

usage() {
  echo "Usage: $0 <donor|admin|missionary> <start|wait|stop|check-dev-supabase> ..." >&2
  exit 1
}

[[ -n "$APP" && -n "$ACTION" ]] || usage

log_runner_snapshot() {
  local label="${1:-snapshot}"
  echo "==> Runner memory snapshot (${label})"
  free -h 2>/dev/null || true
  ps aux --sort=-%mem 2>/dev/null | head -n 15 || ps aux 2>/dev/null | head -n 15 || true
}

app_dir_for() {
  case "$1" in
    donor) echo "apps/donor" ;;
    admin) echo "apps/admin" ;;
    missionary) echo "apps/missionary" ;;
    *) return 1 ;;
  esac
}

# Returns 0 when URL is an allowed hermetic/loopback Supabase endpoint (Node URL parsing).
is_allowed_dev_supabase_url() {
  local raw="${1:-}"
  [[ -n "$raw" ]] || return 1

  ASYM_E2E_SUPABASE_URL_TO_CHECK="$raw" node -e "
    const raw = process.env.ASYM_E2E_SUPABASE_URL_TO_CHECK ?? '';
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      process.exit(1);
    }
    if (parsed.username || parsed.password) {
      process.exit(1);
    }
    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('[') && host.endsWith(']')) {
      host = host.slice(1, -1);
    }
    const allowed = new Set([
      'example.supabase.co',
      'localhost',
      '127.0.0.1',
      '::1',
    ]);
    process.exit(allowed.has(host) ? 0 : 1);
  "
}

assert_dev_supabase_allowed() {
  if [[ "${ASYM_E2E_REQUIRE_HERMETIC_SUPABASE:-}" != "1" ]]; then
    return 0
  fi

  local url="${NEXT_PUBLIC_SUPABASE_URL:-}"
  if is_allowed_dev_supabase_url "$url"; then
    return 0
  fi
  echo "Refusing to start E2E dev server: NEXT_PUBLIC_SUPABASE_URL must be the hermetic placeholder (https://example.supabase.co) or a loopback host (127.0.0.1 / localhost / ::1). Got: ${url:-<unset>}" >&2
  exit 1
}

kill_process_group() {
  local pid="${1:-}"
  [[ -n "$pid" ]] || return 0

  kill -TERM -- "-${pid}" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  local waited=0
  while kill -0 "$pid" 2>/dev/null && [[ "$waited" -lt 10 ]]; do
    sleep 1
    waited=$((waited + 1))
  done
  kill -KILL -- "-${pid}" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
}

stop_app() {
  local app="${1:?app required}"
  local pidfile="/tmp/${app}-dev.pid"
  if [[ -f "$pidfile" ]]; then
    local pid
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]]; then
      kill_process_group "$pid"
    fi
    rm -f "$pidfile"
  fi
}

start_app() {
  local port="${1:?port required for start}"
  local host="${2:-127.0.0.1}"
  local log="/tmp/${APP}-dev.log"
  local pidfile="/tmp/${APP}-dev.pid"
  local app_dir
  app_dir="$(app_dir_for "$APP")" || {
    echo "Unknown app: $APP" >&2
    exit 1
  }

  assert_dev_supabase_allowed
  stop_app "$APP"
  log_runner_snapshot "before-start-${APP}-dev"

  echo "==> E2E dev server: ${APP} on ${host}:${port}"
  setsid nohup node scripts/run-with-ci-env.mjs -- bun run --cwd "$app_dir" dev -- \
    --port "$port" --hostname "$host" >"$log" 2>&1 &
  echo $! >"$pidfile"
}

wait_app() {
  local port="${1:?port required for wait}"
  local host="${2:-127.0.0.1}"
  local health_path="${3:-/api/health}"
  local extra_path="${4:-}"
  local log="${5:-/tmp/${APP}-dev.log}"
  local pidfile="${6:-/tmp/${APP}-dev.pid}"
  local max_seconds="${7:-120}"

  local base="http://${host}:${port}"
  for i in $(seq 1 "$max_seconds"); do
    if curl -sf "${base}${health_path}" >/dev/null; then
      if [[ -z "$extra_path" ]] || curl -sf "${base}${extra_path}" >/dev/null; then
        echo "${APP} dev server ready after ${i}s"
        exit 0
      fi
    fi
    if [[ "$i" -eq "$max_seconds" ]]; then
      echo "Timed out waiting for ${APP} at ${base}${health_path}" >&2
      tail -n 150 "$log" 2>/dev/null || true
      local pid
      pid="$(cat "$pidfile" 2>/dev/null || true)"
      kill_process_group "$pid"
      exit 1
    fi
    sleep 1
  done
}

case "$APP" in
  donor | admin | missionary) ;;
  *)
    echo "Unknown app: $APP" >&2
    exit 1
    ;;
esac

case "$ACTION" in
  start)
    shift 2
    start_app "$@"
    ;;
  wait)
    shift 2
    wait_app "$@"
    ;;
  stop) stop_app "$APP" ;;
  check-dev-supabase) assert_dev_supabase_allowed ;;
  *)
    echo "Unknown action: $ACTION" >&2
    usage
    ;;
esac
