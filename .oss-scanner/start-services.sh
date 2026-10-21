#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mode=${1:-db}
case "$mode" in db|apps|demo|stop) ;; *) echo 'Usage: start-services.sh db|apps|demo|stop' >&2; exit 2 ;; esac
if [[ "$PWD" != /src || $(id -u) != 0 ]]; then
  echo 'Run this helper as root inside the scanner image at /src.' >&2
  exit 1
fi
state=/tmp/core-oss-scanner
mkdir -p "$state"
trap 'echo "Scanner service setup failed; inspect logs in /tmp/core-oss-scanner." >&2' ERR
as_postgres() {
  runuser -u postgres -- env -i HOME=/var/lib/postgresql LANG=C.UTF-8 PATH=/usr/lib/postgresql/15/bin:/usr/bin:/bin "$@"
}

stop_apps() {
  for app in donor admin missionary; do
    if [[ -f "$state/$app.pid" ]]; then
      pid=$(cat "$state/$app.pid")
      if kill -0 "$pid" 2>/dev/null; then
        kill -TERM -- "-$pid"
        for ((attempt=0; attempt<30; attempt++)); do
          if ! kill -0 "$pid" 2>/dev/null; then break; fi
          sleep 1
        done
        if kill -0 "$pid" 2>/dev/null; then
          echo "App $app did not stop; inspect $state/$app.log" >&2
          exit 1
        fi
      fi
      rm "$state/$app.pid"
    fi
  done
}

if [[ "$mode" == stop ]]; then stop_apps; exit 0; fi

if [[ "$mode" == db ]]; then
  pg_bin=/usr/lib/postgresql/15/bin
  pg_data="$state/postgres"
  install -d -o postgres -g postgres "$pg_data" "$state/socket"
  if [[ ! -f "$pg_data/PG_VERSION" ]]; then
    pwfile=$(mktemp)
    printf '%s\n' scanner-local-only > "$pwfile"
    chown postgres:postgres "$pwfile"
    as_postgres "$pg_bin/initdb" -D "$pg_data" --username=postgres --pwfile="$pwfile" --encoding=UTF8 --locale=C.UTF-8 --auth-host=scram-sha-256 --auth-local=trust > "$state/initdb.log"
    rm "$pwfile"
  fi
  if ! as_postgres "$pg_bin/pg_ctl" -D "$pg_data" status >/dev/null 2>&1; then
    as_postgres "$pg_bin/pg_ctl" -D "$pg_data" -l "$pg_data/server.log" -o "-h 127.0.0.1 -p 55432 -k $state/socket -c max_connections=32 -c shared_buffers=128MB" -w -t 30 start
  fi
  # Service initialization is repeatable, but never resets an existing database.
  if ! as_postgres psql -h "$state/socket" -p 55432 -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname='core_scanner'" | grep -qx 1; then
    as_postgres createdb -h "$state/socket" -p 55432 core_scanner
  fi
  if [[ ! -f "$state/database-ready" ]]; then
    if [[ -d /src/.git ]]; then
      bash .oss-scanner/run-local.sh normal node scripts/verify/supabase-migrations.mjs > "$state/migrations.log" 2>&1
    else
      # The official wrapper restores the exact clone's full .git history.
      # Standalone images use the real public historical object fetched at
      # construction for the census's git-show provenance check, never host Git.
      [[ -d /opt/core-provenance.git ]]
      bash .oss-scanner/run-local.sh normal env GIT_DIR=/opt/core-provenance.git node scripts/verify/supabase-migrations.mjs > "$state/migrations.log" 2>&1
    fi
    bash .oss-scanner/run-local.sh normal bun run cms:migrate > "$state/payload-migrations.log" 2>&1
    bash .oss-scanner/run-local.sh normal bun run cms:migrate:status >> "$state/payload-migrations.log" 2>&1
    bash .oss-scanner/run-local.sh normal bash -c 'psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql' > "$state/seed.log" 2>&1
    touch "$state/database-ready"
  fi
  echo "Local Postgres ready on 127.0.0.1:55432/core_scanner; logs: $state"
  exit 0
fi

stop_apps
profile=normal
command=start
apps=(donor admin missionary)
if [[ "$mode" == demo ]]; then
  profile=demo
  command=dev
  # Admin next dev starts Eve's development sandbox prewarmer. The bounded UI
  # demonstration exercises donor only; normal built startup covers all apps.
  apps=(donor)
fi
for app in "${apps[@]}"; do
  case "$app" in donor) port=3005 ;; admin) port=3030 ;; missionary) port=4000 ;; esac
  setsid bash .oss-scanner/run-local.sh "$profile" bash -c 'cd "apps/$1"; exec bun run "$2" -- --port "$3" --hostname 127.0.0.1' scanner-app "$app" "$command" "$port" > "$state/$app.log" 2>&1 &
  pid=$!
  echo "$pid" > "$state/$app.pid"
  ready=0
  deadline=$((SECONDS + 180))
  while (( SECONDS < deadline )); do
    # The unmodified Supabase client retries unavailable local HTTP for ~7s.
    status=$(curl --max-time 12 -sS -o "$state/$app-health.json" -w '%{http_code}' "http://127.0.0.1:$port/api/health" 2>/dev/null) || status=000
    # Normal mode correctly reports degraded/503 without full Supabase.
    # A successful HTTP document alone is insufficient: verify the app identity.
    if [[ "$status" == 200 || ( "$profile" == normal && "$status" == 503 ) ]]; then
      if python3 -c 'import json,sys; assert json.load(open(sys.argv[1]))["observability"]["surface"] == sys.argv[2]' "$state/$app-health.json" "$app"; then
        ready=1
        break
      fi
    fi
    if ! kill -0 "$pid" 2>/dev/null; then break; fi
    sleep 1
  done
  if [[ "$ready" != 1 ]]; then
    tail -n 80 "$state/$app.log" >&2
    echo "$app readiness failed." >&2
    exit 1
  fi
  echo "$app ($profile) ready at http://127.0.0.1:$port"
done
