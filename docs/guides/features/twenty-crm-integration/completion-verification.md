# Twenty CRM Completion Verification

> **Note (2026-07-06):** Twenty CRM has since been retired (ADR-0001); this
> file records the state as of its date.

Verified at: 2026-05-09 15:09:40 +0700

Branch: `production`

Working tree: uncommitted Twenty CRM implementation was present during this verification. Existing unrelated changes were left intact.

## Verdict

The repo-level gaps from the first completion audit have been addressed:

- Clean CRM migrations now apply to a disposable database with the repo verifier.
- The seed now applies after those migrations.
- `crm_projection_state.target_surface` type drift is fixed for `event` and `reporting`.
- Mission Control CRM no-env runtime smoke now returns `200` for `/crm`, `/crm/notes`, `/crm/relationships`, `/crm/projections`, and the matching admin APIs.
- Browser smoke coverage now includes the Twenty-backed CRM subpages.
- A non-production Twenty infrastructure proof artifact now exists.
- Live Twenty webhook delivery and signature verification are now captured against an isolated local receiver.

The implementation is not production-complete until Phase 07 evidence exists. The correct production status remains:

`operations-ready, production evidence pending`

## Phase Ledger

**00 - Strategy and proof**

- Status: Verified.
- Evidence:
  - `openspec/changes/integrate-twenty-crm-core/`
  - `docs/guides/features/twenty-crm-integration/phase-00-strategy-and-proof.md`
  - `docs/guides/features/twenty-crm-integration/proofs/2026-05-09-non-production-twenty-proof.md`
- Verified:
  - Isolated Twenty Compose stack started.
  - Server/db/redis healthy; worker running.
  - Browser loaded Twenty UI.
  - Workspace `Asym CRM Proof` activated.
  - Unauthenticated API returned `403`.
  - Authenticated REST read returned `200`.
  - API-key rows were created.
  - Synthetic company write returned `201` and persisted in the workspace schema.
  - Signed webhook delivery was captured and HMAC verification passed.
  - Local storage volume and workspace storage path existed.
  - Backup and restore succeeded.
  - Server/worker restart recovery succeeded.

**01 - Core seam and authorization**

- Status: Verified.
- Evidence:
  - `packages/api/src/crm/`
  - `packages/api/src/admin/crm/`
  - `apps/admin/app/api/admin/crm/`
  - `packages/env/src/schema.ts`
  - `packages/env/README.md`
  - `supabase/migrations/20260507234343_crm_command_logs.sql`
- Verified:
  - Twenty secrets remain server-side.
  - App routes are thin adapters.
  - CRM auth/boundary/unit tests pass.
  - No-env gateway status returns safe degraded state.

**02 - Identity, schema, and mapping**

- Status: Verified.
- Evidence:
  - `packages/api/src/crm/identity/`
  - `packages/api/src/crm/mapping/`
  - `supabase/migrations/20260508000413_crm_identity_mapping.sql`
  - `tests/unit/packages/api/crm-identity-concepts.test.ts`
  - `tests/unit/packages/api/crm-duplicates.test.ts`
  - `tests/unit/packages/api/crm-mapping.test.ts`
  - `tests/unit/packages/api/crm-schema-model.test.ts`
- Verified:
  - Identity links, duplicate scoring, object model, and mapping tests pass.
  - Clean disposable DB migration proof passes.
  - Generated/manual database type drift found in the first audit was corrected for projection target surfaces.

**03 - Sync, eventing, and replay**

- Status: Verified.
- Evidence:
  - `packages/api/src/crm/sync/`
  - `packages/api/src/crm/webhooks/`
  - `packages/api/src/crm/reconciliation/`
  - `supabase/migrations/20260508001923_crm_sync_eventing_replay.sql`
  - `tests/unit/packages/api/crm-outbound-sync.test.ts`
  - `tests/unit/packages/api/crm-replay-reconciliation.test.ts`
  - `tests/unit/packages/api/crm-webhook-ingress.test.ts`
  - `tests/unit/packages/api/crm-webhook-signature.test.ts`
- Verified:
  - Signed webhook, durable event store, outbound jobs, replay, pause config, and reconciliation unit tests pass.
  - Twenty worker processed webhook jobs in the non-production proof.
  - The isolated proof receiver captured a live `company.created` webhook and validated `X-Twenty-Webhook-Signature` against the raw payload and proof signing secret.

**04 - First domain Mission Control**

- Status: Verified.
- Evidence:
  - `apps/admin/app/crm/notes/`
  - `apps/admin/app/api/admin/crm/notes/`
  - `packages/api/src/admin/crm/notes/`
  - `tests/unit/packages/api/crm-notes.test.ts`
  - `tests/unit/packages/api/admin/crm-notes-query.test.ts`
- Verified:
  - `/crm/notes` browser smoke passes.
  - `/api/admin/crm/notes` no-env smoke returns `200`, `configured: false`, and empty rows without crashing.

**05 - Relationship expansion**

- Status: Verified.
- Evidence:
  - `apps/admin/app/crm/relationships/`
  - `apps/admin/app/api/admin/crm/relationships/`
  - `packages/api/src/admin/crm/relationships/`
  - `tests/unit/packages/api/crm-relationships.test.ts`
  - `tests/unit/packages/api/admin/crm-relationships-query.test.ts`
- Verified:
  - `/crm/relationships` browser smoke passes.
  - `/api/admin/crm/relationships` no-env smoke returns `200`, `configured: false`, and no crash.

**06 - Cross-surface projections and shadow mode**

- Status: Verified for no-env runtime and database shape.
- Evidence:
  - `apps/admin/app/crm/projections/`
  - `apps/admin/app/api/admin/crm/projections/`
  - `packages/api/src/admin/crm/projections/`
  - `packages/database/types/database.ts`
  - `supabase/migrations/20260508092918_crm_projection_shadow_surfaces.sql`
  - `tests/unit/packages/api/crm-projections.test.ts`
  - `tests/unit/packages/api/admin/crm-projections-query.test.ts`
- Verified:
  - `CrmProjectionState.target_surface` includes `event` and `reporting`.
  - Clean disposable DB contains `crm_projection_target_surface` enum values `mission_control`, `donor`, `missionary`, `public`, `cms`, `event`, `reporting`.
  - `/crm/projections` browser smoke passes.
  - `/api/admin/crm/projections` no-env smoke returns `200` with shadow report data.

**07 - Production cutover and operations**

- Status: Requires production evidence.
- Evidence:
  - `docs/guides/features/twenty-crm-integration/phase-07-production-cutover-and-operations.md`
  - `docs/guides/operations/twenty-crm-cutover.md`
- Verified:
  - Operations runbook exists.
  - Phase 07 requires domain ledger, development parity, backup/restore proof, monitoring, rollback rehearsal, support owner, rollback owner, and go/no-go record.
- Remaining proof:
  - No production domain evidence exists in this repo snapshot. Do not call Phase 07 production-complete.

## Static Evidence

- Thin app route adapters exist under `apps/admin/app/api/admin/crm/`.
- Business logic exists under `packages/api/src/crm/` and `packages/api/src/admin/crm/`.
- `packages/api/package.json` exports `./crm` and admin CRM route handler entrypoints.
- Server-only Twenty env keys are defined in `packages/env/src/schema.ts` and documented in `packages/env/README.md`.
- No `NEXT_PUBLIC_TWENTY_*` entries were found.
- `scripts/verify/data-boundary-check.mjs` checks for direct app route Supabase imports and raw Twenty access from app source.
- CRM migrations present:
  - `supabase/migrations/20260507234343_crm_command_logs.sql`
  - `supabase/migrations/20260508000413_crm_identity_mapping.sql`
  - `supabase/migrations/20260508001923_crm_sync_eventing_replay.sql`
  - `supabase/migrations/20260508092918_crm_projection_shadow_surfaces.sql`
- Supabase migration verifier added:
  - `scripts/sql/supabase-compat-bootstrap.sql`
  - `scripts/verify/supabase-migrations.mjs`
  - `package.json` script `verify:supabase-migrations`

Nia was required by the repo instructions, but no Nia tool was exposed in this session. I used repo-scoped `rg`, direct file reads, local commands, and runtime evidence as the fallback path.

## Commands Run

| Command                                                                                                                                                                                                                                                        | Result | Notes                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55436/asymmetrical_test bun run verify:supabase-migrations`                                                                                                                                             | PASS   | Verified 17 forward Supabase migrations against fresh disposable Postgres. A rerun against an already-migrated DB correctly failed as non-idempotent. |
| `psql postgresql://postgres:postgres@127.0.0.1:55436/asymmetrical_test -v ON_ERROR_STOP=1 -f supabase/seed.sql`                                                                                                                                                | PASS   | Seed applied after all migrations; profile count `1`, authz membership count `3`.                                                                     |
| CRM migration evidence SQL queries                                                                                                                                                                                                                             | PASS   | 9 CRM tables had RLS enabled; 29 CRM indexes; 25 CRM policies; projection enum included `event` and `reporting`.                                      |
| Admin HTTP smoke against `http://127.0.0.1:3030`                                                                                                                                                                                                               | PASS   | `/crm`, `/crm/notes`, `/crm/relationships`, `/crm/projections`, and matching CRM APIs returned `200` in no-env mode.                                  |
| `node node_modules/playwright/cli.js install chromium`                                                                                                                                                                                                         | PASS   | Installed Playwright Chromium build expected by repo Playwright version.                                                                              |
| `PLAYWRIGHT_ADMIN_BASE_URL=http://127.0.0.1:3030 E2E_AUTH_BYPASS=true ... node node_modules/@playwright/test/cli.js test -c playwright.admin.config.ts tests/e2e/admin-table-pages-smoke.spec.ts --project=admin-boneyard --grep 'Twenty-backed CRM surfaces'` | PASS   | 3 browser smoke tests passed for `/crm/notes`, `/crm/relationships`, `/crm/projections`.                                                              |
| `docker compose -p asymtwentyproof -f /tmp/asym-twenty-proof/docker-compose.yml up -d`                                                                                                                                                                         | PASS   | Isolated Twenty stack created.                                                                                                                        |
| `curl -i http://127.0.0.1:55440/healthz`                                                                                                                                                                                                                       | PASS   | Twenty server returned `200` health OK.                                                                                                               |
| Twenty Playwright proof                                                                                                                                                                                                                                        | PASS   | Browser loaded UI, signed up local proof user, activated `Asym CRM Proof` workspace, and saved screenshots under `/tmp/asym-twenty-proof/`.           |
| Twenty authenticated REST proof                                                                                                                                                                                                                                | PASS   | Authenticated read returned `200`; API-key creation returned `201`; company create returned `201` and persisted.                                      |
| Twenty webhook proof                                                                                                                                                                                                                                           | PASS   | `POST /rest/metadata/webhooks` returned `201`; worker processed the job; receiver captured the request; HMAC signature validation passed.             |
| `docker exec asymtwentyproof-db-1 pg_dump ...` and `pg_restore ...`                                                                                                                                                                                            | PASS   | Backup/restore validated 62 core tables, 28 workspace tables, 1 workspace, 2 API keys, and 9 companies.                                               |
| `docker restart asymtwentyproof-server-1 asymtwentyproof-worker-1`                                                                                                                                                                                             | PASS   | Health recovered; worker resumed BullMQ jobs.                                                                                                         |
| `bun run format:check`                                                                                                                                                                                                                                         | PASS   | Prettier check passed.                                                                                                                                |
| `bun run skills:verify`                                                                                                                                                                                                                                        | PASS   | Skill mirrors verified/synced.                                                                                                                        |
| `bun run verify:data-boundary`                                                                                                                                                                                                                                 | PASS   | No direct Supabase imports in app API routes and no raw Twenty access in app source.                                                                  |
| `bun run verify:workspace-contract`                                                                                                                                                                                                                            | PASS   | Workspace contract verified.                                                                                                                          |
| `bun run verify:eslint`                                                                                                                                                                                                                                        | PASS   | ESLint config verification passed.                                                                                                                    |
| `bun run lint`                                                                                                                                                                                                                                                 | PASS   | Existing warning remains in `packages/ui/components/shadcn/data-grid/data-grid.tsx` import order.                                                     |
| `bun run typecheck`                                                                                                                                                                                                                                            | PASS   | 13 package tasks successful.                                                                                                                          |
| `bun run build`                                                                                                                                                                                                                                                | PASS   | Existing warnings: Payload unsupported Next.js 16 notice and admin `process.on` Edge Runtime warning.                                                 |
| `bun run test:unit`                                                                                                                                                                                                                                            | PASS   | 123 test files and 503 tests passed.                                                                                                                  |
| `bunx @fission-ai/openspec@latest validate integrate-twenty-crm-core --strict`                                                                                                                                                                                 | PASS   | OpenSpec change is valid.                                                                                                                             |
| `bun run ci:preflight`                                                                                                                                                                                                                                         | PASS   | Combined preflight passed: format, skills, lint, data boundary, workspace, ESLint, shadcn diff, typecheck, build, and unit tests.                     |

## Runtime Smoke

No-env Mission Control smoke used:

- disposable Postgres container `asym_crm_verify_pg` on host port `55432`
- PostgREST container `asym_crm_verify_postgrest` on host port `55433`
- local `/rest/v1` proxy on `http://127.0.0.1:55434`
- admin dev server on `http://127.0.0.1:3030`
- `TWENTY_API_URL`, `TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, and `TWENTY_WORKSPACE_ID` intentionally unset/empty

Results:

- `/crm` -> `200`
- `/crm/notes` -> `200`
- `/crm/relationships` -> `200`
- `/crm/projections` -> `200`
- `/api/admin/crm/gateway/status` -> `200`, `configured: false`
- `/api/admin/crm/notes` -> `200`, `configured: false`, rows `[]`
- `/api/admin/crm/relationships` -> `200`, `configured: false`
- `/api/admin/crm/projections` -> `200`, `mode: "shadow"`, `totalProjections: 6`

Browser smoke:

- `/crm/notes` -> PASS
- `/crm/relationships` -> PASS
- `/crm/projections` -> PASS

## Failed Or Missing Requirements

1. Production cutover evidence is absent. Phase 07 remains `operations-ready, production evidence pending`.
2. Live configured Mission Control mode with real `TWENTY_*` production/development credentials was not run against a durable development Twenty instance. The local Twenty proof used an isolated proof workspace and local proof credentials only.

## Recommended Follow-Up Fixes

1. Keep Phase 07 blocked until each production domain has a dated evidence note with development parity, backup/restore proof, monitoring, rollback rehearsal, support owner, rollback owner, and go/no-go result.
2. When development `TWENTY_*` credentials exist, run the Mission Control configured-mode smoke against those credentials and append the evidence to this report.

## Production Evidence Status

Production evidence is not present in this repo snapshot. Based on the available evidence, the correct production status is:

`operations-ready, production evidence pending`

Do not archive the OpenSpec change or declare production cutover complete until the Phase 07 domain evidence exists and is stable.
