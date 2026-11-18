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

## Workflow follow-up

- Add a `test:api-contract` package script and a `docs/ci.md` entry after workstreams A and B merge (outside this pass's fence).
- Consider moving the job onto the AL-2673 local Supabase stack once it lands.
- Add money-path tests (duplicate and out-of-order events, refunds, 1,001-gift history) against the WP8 commands when they exist.
- Archive after merge and an owner decision on promotion.
