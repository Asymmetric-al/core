#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ "$PWD" != /src || $(id -u) != 0 ]]; then
  echo 'Run as root inside the scanner image at /src with --network none.' >&2
  exit 1
fi

echo '==> Real local PostgreSQL migrations and synthetic fixtures'
bash .oss-scanner/start-services.sh db
for sql in tests/integration/supabase/donation-fee-replay-verification.sql tests/integration/supabase/eve-final-launch-verification.sql .oss-scanner/verify-rls.sql; do
  bash .oss-scanner/run-local.sh normal bash -c 'psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$1"' scanner-sql "$sql"
done

echo '==> Unit security seams (mocked providers; not a hosted Supabase proof)'
bash .oss-scanner/run-local.sh normal env NODE_ENV=test node node_modules/vitest/vitest.mjs run --maxWorkers=2 --no-file-parallelism \
  tests/unit/auth \
  tests/unit/packages/api/donor-portal/auth-ownership.test.ts \
  tests/unit/packages/api/missionary-portal/auth-ownership.test.ts \
  tests/unit/packages/api/crm-auth.test.ts \
  tests/unit/packages/api/stripe-webhooks.test.ts \
  tests/unit/packages/api/email/webhooks-resend.test.ts \
  tests/unit/cms/tenant-access.test.ts \
  tests/unit/cms/tenant-context.test.ts \
  tests/unit/cms/web-studio-authenticated-preview.test.ts \
  tests/unit/packages/api/eve-governance-kernel.test.ts \
  tests/unit/eve-github-webhook-signature.test.ts \
  tests/unit/eve-runtime-admin-session-auth.test.ts

echo '==> Built application startup and fail-closed normal authorization profile'
bash .oss-scanner/start-services.sh apps
trap 'bash .oss-scanner/start-services.sh stop' EXIT
bash .oss-scanner/run-local.sh normal node .oss-scanner/smoke.mjs

echo '==> Explicit UI demonstration profile (authentication bypass; not an auth proof)'
bash .oss-scanner/start-services.sh demo
bash .oss-scanner/run-local.sh demo env CI=1 PLAYWRIGHT_REUSE_EXISTING_SERVER=1 PLAYWRIGHT_INCLUDE_ADMIN=0 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3005 \
  node node_modules/@playwright/test/cli.js test tests/e2e/demo-auth-preflight.spec.ts --project=chromium --workers=1 --retries=0

echo 'PASS: local SQL/RLS, selected mocked unit seams, normal app smoke, and explicit demo checks.'
echo 'Excluded: full hosted Supabase Auth/PostgREST/Storage, paid providers, live webhooks, production deployments, and a full vulnerability audit.'
