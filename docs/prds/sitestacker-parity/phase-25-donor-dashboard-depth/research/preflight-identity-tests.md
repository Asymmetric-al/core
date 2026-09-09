> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase25 spec preflight — identity and authorization test seams

Read-only checkpoint: 9 September 2026, source `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, `[historical Core checkout]`. Inspected actual tests, runners, CI, migration bootstrap and relevant source. No test, Auth endpoint, provider, database, GitHub or source mutation ran in this preflight. Only this research note was created.

## Recommended confirmation to carry into the spec

**Use one primary donor-journey acceptance seam: the actual donor experience through shared public application reads/commands, with current Auth and P12 enforcement.** Prefer existing Playwright and public API-handler test structures. Add lower boundary proof only for claims that this highest seam cannot establish: **real PostgreSQL grants/RLS/transaction behavior** and **native Supabase Auth/provider G01 behavior before Core callback admission**. These are required independent proof layers, not three competing identity implementations or a new testing framework.

User-facing confirmation can say: “Test the donor's complete journeys through the real portal and its public API, and back them with direct database and native Auth/provider checks for isolation, atomic saves and credential safety; reuse the existing harnesses rather than testing private helper internals.” The full phase may need equivalent provider/document checks from the other lanes. Do not describe mocked callbacks or green demo auth as native qualification.

The current canonical `docs/ai/skills/to-spec/SKILL.md`, process step2, requires proposing the highest existing seams and checking them with the user before writing/publishing the spec. Parent owns that single confirmation. This lane has not asked the user separately.

## Existing seams and what they actually prove

<!-- prettier-ignore -->
| Existing seam / prior art | Current behavior | Use for Phase25 | Limits that must remain explicit |
| --- | --- | --- | --- |
| `tests/e2e/auth-session-guards.spec.ts`, `auth-permissions.spec.ts` | Real browser password form, redirect/persistence/signout and protected-route navigation; each skips when required environment values are absent. | Highest browser precedent for login → exact authorized return → task → signout/reentry. Extend with selected email-link/code, current personal/represented context and shared profile journey. | Current tests are password-only; no link/code/social/G01/claim/P12 matrix is established. Skipped fixture-dependent tests are not a passing release gate. |
| `tests/e2e/auth-demo-donor.spec.ts`, `demo-auth-preflight.spec.ts` and existing demo helpers | Demo availability map, Demo Access, donor home and persistence. The donor demo test can skip when demo availability is missing. | Retain separate smoke coverage and existing selectors/setup conventions. | Demo paths and synthetic cookies do not establish native Auth, P4 possession, target P12 or real provider behavior. |
| `tests/unit/packages/api/donor-portal/auth-ownership.test.ts` | Invokes public donor portal GET/PATCH and owned-record services with mocked Auth/admin clients and fluent query doubles. | Good public-handler starting point for exact response/result semantics, rejection before mutation, current source context, lost-response behavior and no secondary refresh redefining success. Extend at the public command boundary rather than testing field builder internals alone. | It currently expects donor-role admission and deterministic fallback snapshots. Those predecessor expectations must change with F02/F04; keeping them green does not prove the new contract. Query doubles do not execute SQL or enforce RLS. |
| `tests/unit/auth/resolve-user-role.test.ts` | Public resolver outputs, explicit fake that rejects unexposed `.schema()` and tracks the narrow RPC. | Useful error/admission shape precedent while shared Auth/P12 is adopted. | Current role/profile semantics are predecessor behavior, not a future fallback. Still mocked database results. |
| `tests/unit/auth/membership-rpc-contract.test.ts`, `role-hardening-migration.test.ts` | Source-text assertions for configured schemas, function definition/grants and caller predicate. The membership test itself explains CI bypass misses the real resolver. | Keep structural reachability guards as inexpensive companion checks. | These are **not database authorization tests**. A regex can pass while actual grants, role context, policies, schema publication or function execution disagree. |
| `tests/unit/auth/client-session.test.ts`, `client-signout.test.ts`, `signout-handler.test.ts`; `packages/auth/context.require.test.ts` | Shared session/load/signout/error guards under unit fixtures. | Reuse the actual shared helper seam for stale-result, same-human context/epoch changes and failure signals. | No actual cookie/browser/hosted-session revocation or direct native credential guarantee. |
| `tests/unit/packages/api/profile/queries.test.ts` | Mocked `findFullProfileById` happy/missing/error outputs and query shape. | Prior art for returned source/error distinction only. Add actual command-level tests for F04 across reached REST/GraphQL entry points. | Does not test profile PATCH, partial commit, GraphQL mutation, SQL transaction or current contact authority. |

Scoped search of `tests`, package Auth tests and package API tests found no existing tests of `exchangeCodeForSession`, the shared callback module, `bindClaim`, `resolveProjection`, `email_verified_at`, `linkIdentity`, `signInWithOAuth` or `verifyOtp`. This is the scoped committed-tree observation, not a claim no hosted feature exists. Earlier Q11/Q14 ad hoc fixtures and native-source audits remain historical evidence; they are not a committed complete target acceptance suite.

## Existing database harness: useful infrastructure, missing identity proof

- `scripts/verify/supabase-migrations.mjs` is the real `verify:supabase-migrations` package script. It requires `DATABASE_URL`, rejects nonlocal hosts by default, bootstraps compatibility schemas and applies every timestamp-prefixed forward migration in order through `psql` with `ON_ERROR_STOP=1`. It does not merely inspect files; **running it mutates the specified database**, so it belongs only on a deliberately disposable target. No database was selected or changed here.
- `.github/workflows/ci-integration.yml:20–72` uses disposable `postgres:15-alpine`, runs that migration verifier, applies Payload migrations/demo seed and checks a profile count. This establishes actual migration execution, not a general P12/RLS/identity test suite.
- `scripts/sql/supabase-compat-bootstrap.sql` creates minimal Auth tables/functions and local roles. `auth.uid()` reads a request GUC; `auth.identities` is only a compatibility table. There is no running GoTrue/OAuth protocol, real JWT verification, PostgREST or real Supabase Storage/Realtime service merely because those compatibility schemas exist.
- The located `tests/integration/supabase/eve-final-launch-verification.sql` is a useful transaction/rollback and atomic-outcome SQL prior art. It seeds exact fixtures, calls public domain functions, raises on failures and rolls back. It is Eve-specific, sets a service-role claim and does not constitute donor RLS coverage or native authentication. The inspected package/CI scripts do not call it as a general automatic SQL test runner.
- No dedicated current P4/P12 donor identity/RLS/native Auth integration runner or pgTAP suite was found in the scoped committed tree. Therefore the spec must explicitly require **a small identity/access proof family using existing disposable migration infrastructure**, with actual `anon`/`authenticated`/approved service role execution and current tenant-source context. Do not create a second framework merely because these proofs are currently missing.

Database proof must include both allowed and denied reads/writes, grants/column/EXECUTE/Storage access, forbidden OLD→NEW reassignment, source-derived actor and tenant, genuine transaction rollback, same-operation result, stale/ABA update, current grant revocation and nonfinancial/representative-only admission. A superuser `SET request.jwt.claim.sub` fixture alone does not prove RLS: execute under the actual restricted database role and separately prove the API's trusted context creation. The full Supabase stack is required where the claim concerns its HTTP/service behavior.

## Native G01 is a separate highest boundary, not a callback unit test

Current supported-control uncertainty remains as recorded in the final identity audit: the public v2.196.0 source/docs/Management API did not establish a stable exact native pre-link/credential guarantee. The spec must name that gate rather than invent a mock success that papers over it.

Once the supported target contract is established, test at **Supabase Auth's public protocol endpoints**, from the position of an ordinary client, before any Core callback/P12 admission. Cover new email-matched OAuth identity versus existing stable provider subject; manual link and already-owned collision; missing/changed/non-authoritative mailbox; authorize/ID-token/code exchange, refresh, unlink, recovery and credential mutation. Assert actual native identity/session/result state through permitted test administration, not Core page accessibility alone. Use isolated synthetic accounts and the exact pinned Auth/runtime/configuration; do not exercise real donors.

A local faithful runtime with controlled provider assertions can prove the native boundary's deterministic behavior. Separate qualification against the actual Google/Apple/Facebook test/eligible application and normal non-role account must prove provider interoperability and deployment readiness. Neither substitutes for the other. No new broker/fork/auth schema writer is authorized to obtain a green test. A direct native test suite is a **new required acceptance family at an existing external protocol seam**, not evidence the feature or its missing control is already implemented.

## Practical commands and placement

Commands below are inspected existing entry points for later execution after the appropriate fixtures/target authorization. They were not run by this preflight.

```bash
# Full existing unit gate (Vitest via committed wrapper, not Bun's test runner)
bun run test:unit

# Focused current public-handler/Auth unit prior art
bunx vitest run tests/unit/auth tests/unit/packages/api/donor-portal/auth-ownership.test.ts tests/unit/packages/api/profile/queries.test.ts

# Existing donor browser smoke; this is demo proof only
bun run test:e2e:auth:donor

# Existing real-browser password/session guard precedent, fixtures injected separately
E2E_AUTH_BYPASS=false PLAYWRIGHT_INCLUDE_ADMIN=0 bun run test:e2e:strict tests/e2e/auth-session-guards.spec.ts tests/e2e/auth-permissions.spec.ts --project=chromium --workers=1

# Actual forward migration execution, only with an already-verified disposable DATABASE_URL
bun run verify:supabase-migrations

# Existing architectural and accessibility checks supplement behavior tests
bun run verify:data-boundary
bun run test:a11y:strict
```

Important runner qualifications:

- `vitest.config.ts` includes `tests/unit/**/*.test.ts(x)`, `packages/api/tests/unit/**/*.test.ts(x)` and `packages/auth/**/*.test.ts`; use those existing paths. Unit env deliberately supplies placeholders and clears real service credentials. No live Auth/provider calls in this unit seam.
- `scripts/verify/unit-tests.mjs` owns the full CI suite and coverage wrapper. Use the focused Vitest command for file selection rather than assuming the full wrapper forwards arbitrary filenames. No new test runner required.
- `playwright.config.ts:72–76,173–188` can default to `E2E_AUTH_BYPASS=true`; even the strict command needs an explicitly verified false value and a real isolated backend for native/claim tests. `PLAYWRIGHT_BASE_URL` or `QA_DONOR_BASE_URL` selects donor host. Remote target state must be separately verified; a runner variable cannot disable bypass on an already deployed server.
- The existing `chromium-donor` project testMatch is limited to upload-crop and donor-giving-history. The ordinary Auth specs run under `chromium`; do not select the donor-named project and accidentally run zero Auth tests.
- Existing session tests require injected `E2E_EMAIL`, `E2E_PASSWORD` and declared path expectations; otherwise they skip. These are only predecessor password fixtures. The new email-code/social/claim suite needs explicit test fixtures and must fail qualification when required cases skip rather than report release success.
- No ready native G01 command exists in the committed tree. Do not publish a fictional `test:auth-native` command. Add the minimal qualified suite/CI hook when its supported contract can be implemented, reusing Playwright request/browser facilities or the provider owner's existing appropriate runner rather than adding a framework by default.

## Highest-level acceptance scenarios for the confirmation

1. Exact personal or represented task link → qualified sign-in/claim → correct resource; denied/missing/current-grant failure never becomes a demo/profile-role fallback or another donor.
2. Ordinary contact Name/Phone save through each reached public mutation path → durable source result; phone 403-after-write regression eliminated; one failed field/audit rolls back, lost response reconciles, a page-refresh failure does not change save truth, and legal/public/other-person values remain untouched.
3. Same principal switches Tenant or represented context or loses permission while a request is pending → stale results cannot reappear; server egress also denies, independently of browser timing.
4. Actual database role attempts to cross Tenant/person/purpose or rewrite actor/owner/grant/revision → denied by the combined approved P12/service/grant/RLS boundaries; positive authorized cases remain usable.
5. Unqualified new OAuth identity attempts the native path before Core loads → G01 protection holds; existing exact subject and proper recovery remain usable. Browser-only callback tests cannot close this case.

These seams preserve the skill's preference for testing externally visible behavior at the highest useful boundary. They do not demand unit tests for every component or add unnecessary internal seams. The spec should carry the verified prior-art and remaining proof boundaries, not imply that the current suites already provide them.
