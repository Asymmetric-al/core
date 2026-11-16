# Round 13 loaded-giving HTTP fixture

Test-only preparation for a **later root-authorized** loaded Home/Reports
capture. It does not supply a rendered screenshot or change any app/package
source. Leave the current candidate on `http://localhost:3031` and scratch CMS
on `localhost:54322` untouched. Port 3030 is not the current candidate.

## Read contract

`server.mjs` binds only an ephemeral `127.0.0.1` port by default. Its public
helper accepts an explicit canonical UTC `asOf`, a lifetime of at most 900,000 ms
and a request budget of at most 1,024 (default 256). `close()` is idempotent and
closes its own sockets; `closed` resolves after shutdown. There are no outbound
requests, auth endpoints, JWT minting, database connections or mutation routes.
The published synthetic key is an exact-match fixture marker, **not** a secret,
JWT, real service-role credential or authentication provider.

Only these current dashboard requests are supported:

| Method / table               | Required predicates / result                                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HEAD donors                  | Exact demo tenant, `select=id`, `Prefer: count=exact`; 48                                                                                                              |
| HEAD missionaries            | Same count contract; 12                                                                                                                                                |
| HEAD funds                   | Same count contract plus `is_active=eq.true`; 4                                                                                                                        |
| GET donations                | Exact dashboard projection, tenant, canonical `gift_date`/legacy `created_at` 13-month window, no raw-status prefilter, `id.asc`, explicit offset/limit; 43 candidates |
| GET contribution_adjustments | Exact dashboard projection, tenant, `status=eq.applied`, up to 150 loaded donation IDs, stable time/ID order and offset/limit; one applicable correction               |

The server read folds applied corrections before deciding effective settled
membership (`completed`, `succeeded`, `success`) and derives the monthly gift
count from those same rows; it no longer sends a donations HEAD count. All
synthetic gifts have a null `gift_date`, exercising the legacy timestamp
fallback. Correction IDs may reference any loaded candidate, including raw
unsettled rows. Unknown
tenants, unsupported projections/routes/preferences, repeated or unknown query
parameters, conflicting Range headers, writes, nonlocal Host/Origin/forwarding
and nonpublic schemas fail closed. No rejected request changes fixture data.
Count headers, JSON projections, paging and empty terminal pages are real HTTP.

All amounts are integer USD cents. Twelve full prior UTC months have net totals
`125000, 142500, 137500, 168000, 155000, 181000, 174000, 192500, 210000, 205000,
223000, 240000`. The current month has four settled records: an applied
`10000 -> 8000` correction less a `1000` refund yields `7000`; another `6000`
and `12000`, plus a fully refunded `5000`, yield **25000** net cents. Reversed,
out-of-window, unsettled and foreign-tenant distractors never contribute.
`adjustments-unavailable` is an explicit startup-only negative scenario: a real
503 rejects the whole read rather than returning a partial/zero dashboard.
The adjacent unchanged loader suite separately proves failures return null.
There is no mixed-currency scenario or runtime scenario switch.

## Repeat the contract proof

From this r12 checkout, with installed dependencies, no Next or Postgres needed:

```powershell
$env:CORE_QA_HTTP_PROOF = '1'
bunx --no-install vitest run tests/unit/scripts/dashboard-http-fixture.test.ts tests/unit/apps/admin/app/dashboard-stats-loader.test.ts --maxWorkers=1 --reporter=dot
Remove-Item Env:CORE_QA_HTTP_PROOF
```

The suite starts/closes its own ephemeral listeners only. It exercises raw HTTP,
the installed Supabase SDK, the current read, lifetime cleanup and a
child Bun `--no-env-file` probe with a sanitized process environment. The last
probe uses the **unmocked** `getAdminClient` factory, guards fetch to this one
loopback origin with redirects disabled, verifies each response marker and
prints JSON. The opt-in proof writes a fresh `logs/http-proof-<runId>.json`
without overwriting another run. It records seven HTTP requests (proof HEAD plus
six read requests), source hashes, fixture headers, returned stats and server
request records. No auth endpoint is requested and no credential is logged.
Historical proof files describe their recorded source hashes; this contract
update does not recertify those earlier captures.

Scoped static checks:

```powershell
bunx --no-install eslint tests/unit/scripts/dashboard-http-fixture.test.ts docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/server.mjs docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/probe.ts
node --check docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/server.mjs
node --check docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture/run.mjs
```

## Later root operator handoff

**Do not run the following setup during the current evidence run.** The current
3031 process has no service key; its admin factory caches that missing-key
result. Browser interception or setting variables in another shell cannot
change that process. Root must first obtain separate authorization for any
candidate process lifecycle/env change; do not start another Next server or
restart/reconfigure the current one under this task.

After that authorization, start only the fixture helper in a separate local
terminal, from r12, retaining its JSONL output at a fresh path:

```powershell
$fixtureDir = 'docs/qa/admin-workspaces-hillclimb/review/round13/runtime/loaded-giving-fixture'
$asOf = [DateTime]::UtcNow.ToString('yyyy-MM') + '-01T00:00:00.000Z'
$log = "$fixtureDir/logs/operator-$([guid]::NewGuid()).jsonl"
node "$fixtureDir/run.mjs" --as-of $asOf --lifetime-ms 900000 --max-requests 256 | Tee-Object -FilePath $log
```

The first JSON record supplies the actual loopback `baseUrl`, `runId`, tenant,
`dataSha256`, scenario, timestamp and bounds. It expires automatically; the last
record includes the complete bounded request log. Graceful SIGINT/SIGTERM also
closes it; forced termination cannot guarantee that final record. Never redirect
it through a proxy or expose its port. The fixture rejects protected/deployed
runtime use in its operator entrypoint. The `asOf` sets the **data window**, not
the Next process clock: use the current UTC month, avoid a month rollover and
record the actual read/capture timestamps.

For the later authorized root-owned **local child process only**, use sanitized
placeholder configuration, not inherited credentials or env-file edits:

| Process variable                | Synthetic value / constraint                                           |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Exact `baseUrl` from this fixture run, not a tenant URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `round13-local-placeholder-anon`                                       |
| `SUPABASE_SERVICE_ROLE_KEY`     | `round13-local-synthetic-service-key-not-a-secret` (exported constant) |
| `SKIP_ENV_VALIDATION`           | `1`, local synthetic QA only                                           |
| `E2E_AUTH_BYPASS`               | `true`, existing local E2E mechanism only                              |
| `ASYM_E2E_AUTH_SURFACE`         | `admin`, explicit even on a nonstandard admin port                     |
| `NODE_ENV`                      | `development`, never protected production/preview                      |
| `PAYLOAD_DISABLE_SCHEMA_PUSH`   | `1`; preserve root-owned scratch CMS wiring unchanged                  |

Do not bring real Supabase/Stripe/Resend credentials, protected deployment flags,
session cookies or tenant data into that process. This fixture is not a login
destination. The demo tenant is `00000000-0000-0000-0000-000000000001`; other
tenant predicates are rejected. The existing E2E identity remains owned by the
application's explicit local bypass, not this fixture.

The optional standalone probe command is
`bun --no-env-file <fixtureDir>/probe.ts <baseUrl> <runId> <dataSha256>` with the
same sanitized local process variables. Redirect its stdout to a fresh proof
file. Its source hashes and fixture request log must agree. This is transport
evidence, not a rendered page check.

For later PNG/check evidence, use only the committed runners with
`CAPTURE_BASE_URL` explicitly set to the later authorized candidate. Run
`capture-workspaces.mjs <freshOutDir> shell,tools home,reports` and
`check-workspaces.mjs <differentFreshOutDir> shell,tools home,reports` under
`docs/qa/admin-workspaces-hillclimb/`. Each runner must successfully execute
`prepareFixtureBundle` first and retain its candidate `fixture-proof.json`;
**never bypass preflight or substitute saved browser fixtures**. Keep the
declared viewport/DPR/light/reduced-motion settings, exact generated PNGs,
runner commands, exit codes, logs and capture metadata. This helper does not
replace those runners or their browser fixture interception.

## Attribution and limits

To distinguish these responses from a tenant service, correlate all of:

1. The process-only loopback URL, startup proof and matching shutdown request log.
2. `x-core-qa-fixture=round13-loaded-giving-v1`, `x-core-qa-fixture-run`,
   `x-core-qa-fixture-sha256`, `x-core-qa-fixture-as-of` and scenario headers.
3. Accepted GET/HEAD query predicates, row counts, paging and run/hash in the
   server log, including actual capture-triggered requests, not just probe calls.
   A fresh candidate cache matters: an absent new request is not HTTP proof.
4. Unchanged owning read/factory/status/correction source hashes and frozen
   checkpoint `round13-manifest.json` (1,032 entries), with `round13.diff`
   SHA256 `8e4c354259160e26be0fed1a3308ae87452b5fe6c58ea1c5448c1ffcbd143547`.
5. Candidate preflight proof, capture base/commands/timestamps and exact PNG
   metadata. Root must reconcile this approved test and QA provenance as extras;
   do not overwrite or regenerate the frozen product checkpoint here.

A passing unit/static/axe/exit-0 result is not loaded rendered evidence, a visual
9.5 score, real provider success, auth/RLS/tenant integration, or WCAG
conformance. This task prepares the read transport; later root capture and
independent visual/interaction review remain required.
