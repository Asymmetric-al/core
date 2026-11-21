# Tasks

## 1. Evidence and plan

- [x] 1.1 Read the AL-2671, AL-2673, AL-2674 and AL-2675 branches read-only and record the stable and unstable seams in design.md; verify by the seam table citing branch evidence.
- [x] 1.2 Create this change and verify with `bun run openspec -- validate add-api-contract-verification --strict` and `bun run verify:openspec-deltas`.

## 2. Select inventory

- [x] 2.1 Write failing unit tests for the select inventory (literals, templates, same-file constants, `.schema()`, unresolved selects) and verify they fail before the inventory exists.
- [x] 2.2 Implement the inventory and verify its unit tests pass and that it finds the missionary-portal task select.

## 3. Harness and stack

- [x] 3.1 Add the harness script that prepares the migrated database (local-only setup SQL) and starts PostgREST with settings read from `supabase/config.toml`; verify with unit tests for config parsing and a local run in `al2708-` containers.
- [x] 3.2 Add token minting and two-tenant fixtures; verify a minted token resolves to its user through PostgREST.

## 4. Contract tests

- [x] 4.1 Select sweep: verify it passes on the current tree and fails with file, line, table, select and error when the 23f2bd454 column is re-introduced (scratch, restored exactly).
- [x] 4.2 Missionary-portal two-tenant reads: verify rows are asserted per tenant.
- [x] 4.3 Tenant isolation sweep (signed-in both ways, anonymous with the ruled list): verify it passes, and fails when a policy is weakened in the scratch database only.

## 5. CI wiring

- [x] 5.1 Add `.github/workflows/api-contract.yml` (advisory, hosted, read-only, SHA-pinned, no secrets); verify the existing workflow-convention tests pass with it present.
- [x] 5.2 Record the CI-minute estimate, the run command and any product defects found in the workstream report.
- [ ] 5.3 Observe the first pull-request run of the workflow on GitHub and record its duration (needs the branch pushed by the integrator).

## 6. Review fixes (#2708, review e)

- [x] 6.1 Harness safety: refuse host-overriding connection-string parameters, never remove a same-named container or network the state file does not record, bind PostgREST to loopback on the host network; verify with `stack-config.test.ts` red then green and a dummy same-named container surviving `up`.
- [x] 6.2 Known defects: each entry names text specific to its select; an entry matching more than one failing select fails; verify with `select-failures.test.ts` red then green and a scratch break of `admin/comments/comment.ts:29` that the previous sweep hid and the new one names.
- [x] 6.3 Count a 42501 as refused only when it names the swept relation; verify with `isolation-probe.test.ts` red then green and a scratch policy calling a non-executable function.
- [x] 6.4 Identity guard: own profile by id and an own-tenant row outside the ruled reads; verify a token for an unknown subject fails it (red against the previous guard).
- [x] 6.5 Column-grant probe, ruled rows by predicate, required evidence on core tables both ways, tables listed by name; verify red on the previous probe (missionaries never evidenced; scratch `USING (true)` on missionaries, posts and locations left it green) and green now, with the same scratch policies failing by name.
- [x] 6.6 Row cap served live: verify the test fails when the declared cap differs from the served one (scratch `max_rows = 999`, restored) and passes otherwise.
- [x] 6.7 Workflow filter covers every input; verify `workflow-paths.test.ts` red on the previous filter then green, and the workflow-convention tests pass.
- [x] 6.8 Reword the workflow header, proposal, spec and design to what the check proves, and correct the inexact seam rows; verify with `bun run openspec -- validate add-api-contract-verification --strict` and `bun run verify:openspec-deltas`.

## 7. Final review fixes (#2708, review 5)

- [x] 7.1 Identity guard proves the tenant claim: its second check needs a row of the caller's tenant in `funds`, `campaigns` or `assets` (only SELECT policy `tenant_id = authz.current_tenant_id()`, checked in `pg_policies`); each fixture tenant gets a fund; verify tenant A's subject with tenant B's claim and with no claim each fail the guard (red against the previous guard, green now), and both callers pass.
- [x] 7.2 The seed tenant's claim does not resolve (`authz.current_tenant_id()` rejects `00000000-…-0001`): the sweep's callers become two fixture tenants and a live test records the defect two-way; verify the seed user's token fails only the claim check and tenant A is evidenced on the core tables.
- [x] 7.3 Filter derivation follows relative imports, literal repository paths and shell-named paths from the files the job runs and the project's tests; verify `workflow-paths.test.ts` red with 14 uncovered inputs (the migrate step's helpers, `prepare-apt.sh`, the preflight's SQL files, the census artefacts) and green after the filter names them.
- [x] 7.4 Checkout fetches full history for the census's `git show`; verify `workflow-checkout.test.ts` red then green.
- [x] 7.5 Harness ownership by Docker id, per-checkout default state file, `down` limited to the prefix; verify `stack-config.test.ts` red then green and live: a name-only state file, a stale id, an unrecorded network and a resource outside the prefix are each left alone, and `up` replaces its own containers by id.
- [x] 7.6 Known-defect entries carry a message fragment; verify `select-failures.test.ts` red on a different failure of the excused select, then green, and the live sweep still matches both defects.
- [x] 7.7 The key reader pages by the declared `max_rows` and stops only on an empty page; verify `isolation-probe.test.ts` red (3 of 7 rows behind a cap of 3) then green, and the live sweep unchanged.
- [x] 7.8 A tenant fixture that fails part-way removes its rows before rethrowing; verify `fixtures.live.test.ts` red (14 rows left) then green.
- [x] 7.9 The pure tests move to `tests/unit/api-contract/`; verify a targeted root-config run executes them and no live test, and the project still includes them.
- [x] 7.10 Reword the spec, design, proposal and workflow header to what the check now proves; verify with `bun run openspec -- validate add-api-contract-verification --strict` and `bun run verify:openspec-deltas`.

## 8. Published pull request review (#2727)

- [x] 8.1 Route local and hosted seeding and PostgREST setup through the shared loopback, marker and psql helpers. Focused tests cover routing-key refusal, marker refusal, consistent targeting, mixed-case ambient settings and password handling. The disposable replay reached PostgREST and reproduced the existing `donors` embed failure (`PGRST201`).
- [x] 8.2 Include the hosted API Contract service and local harness in the Postgres image bump instructions.

## Workflow follow-up

- Add a `test:api-contract` package script and a `docs/ci.md` entry after workstreams A and B merge (outside this pass's fence).
- Consider moving the job onto the AL-2673 local Supabase stack once it lands.
- Add money-path tests (duplicate and out-of-order events, refunds, 1,001-gift history) against the WP8 commands when they exist.
- Before promotion to a required check: drop the pull-request path filter (or report success on skipped runs) and add a `merge_group` trigger. `workflow-paths.test.ts` asserts that the filter covers every derived input and fails when it finds no filter, so adapt it in the same change (keep the derivation; assert the unfiltered trigger instead).
- Once the seed tenant's claim resolves (the known-defect test in `tenant-isolation.live.test.ts` fails), delete that test and consider sweeping the seed user as a third caller.
- Archive after merge and an owner decision on promotion.
