#!/usr/bin/env bash
# Start Next.js dev servers for CI Integration e2e jobs (loopback / hermetic Supabase only).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

APP="${1:-}"
ACTION="${2:-}"

# Job-scoped scratch dir on Actions (RUNNER_TEMP is per job and cleaned between
# jobs), so a stale pidfile from another job cannot point at an unrelated
# process group on a persistent self-hosted runner.
TMP_DIR="${RUNNER_TEMP:-/tmp}"

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
  local pidfile="${TMP_DIR}/${app}-dev.pid"
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
  local log="${TMP_DIR}/${APP}-dev.log"
  local pidfile="${TMP_DIR}/${APP}-dev.pid"
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

# One readiness probe, bounded by the time left before the deadline (floor 1s):
# --connect-timeout <= min(5, remaining) and --max-time <= min(10, remaining).
probe_url() {
  local deadline="${1:?deadline required}"
  local url="${2:?url required}"
  local remaining=$((deadline - SECONDS))
  if [[ "$remaining" -lt 1 ]]; then
    remaining=1
  fi
  local connect_timeout=5
  local max_time=10
  if [[ "$remaining" -lt "$connect_timeout" ]]; then
    connect_timeout="$remaining"
  fi
  if [[ "$remaining" -lt "$max_time" ]]; then
    max_time="$remaining"
  fi
  curl -sf --connect-timeout "$connect_timeout" --max-time "$max_time" "$url" >/dev/null
}

wait_app() {
  local port="${1:?port required for wait}"
  local host="${2:-127.0.0.1}"
  local health_path="${3:-/api/health}"
  local extra_path="${4:-}"
  local log="${5:-${TMP_DIR}/${APP}-dev.log}"
  local pidfile="${6:-${TMP_DIR}/${APP}-dev.pid}"
  local max_seconds="${7:-120}"

  local base="http://${host}:${port}"
  # max_seconds is an elapsed-time deadline (bash SECONDS), not a loop count:
  # a server that accepts but never answers cannot stretch the wait.
  local start="$SECONDS"
  local deadline=$((start + max_seconds))
  local pid
  while true; do
    if probe_url "$deadline" "${base}${health_path}"; then
      if [[ -z "$extra_path" ]] || probe_url "$deadline" "${base}${extra_path}"; then
        echo "${APP} dev server ready after $((SECONDS - start))s"
        exit 0
      fi
    fi
    pid="$(cat "$pidfile" 2>/dev/null || true)"
    if [[ -n "$pid" ]] && ! kill -0 "$pid" 2>/dev/null; then
      echo "${APP} dev server (pid ${pid}) exited before becoming ready" >&2
      tail -n 150 "$log" 2>/dev/null || true
      rm -f "$pidfile"
      exit 1
    fi
    if [[ "$SECONDS" -ge "$deadline" ]]; then
      echo "Timed out after ${max_seconds}s waiting for ${APP} at ${base}${health_path}" >&2
      tail -n 150 "$log" 2>/dev/null || true
      kill_process_group "$pid"
      rm -f "$pidfile"
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
