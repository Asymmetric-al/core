# PR 2647 admin integration verification

Date: November 12, 2026. This record describes the standalone WSL candidate, not deployed behavior or a new visual score.

## Provenance and scope

- Source: uncommitted round12 admin candidate on base `8368004b339384eb98129a086ca71b7db88534ed`.
- Rechecked 1,182 explicit candidate paths, including 43 tracked deletions. Screenshot, capture, candidate, comparison, checkpoint, diff-copy and test-results evidence stays outside the shipping manifest. No production environment was read or used.
- Coordinated implementation commit: `26302de8a`. API, shared UI, admin source and regression proofs are atomic because the admin score/category floors require their combined accessible composition.
- The generated Payload import map is excluded narrowly from authored-source ESLint. A red/green regression checks root and admin config parity and confirms authored CMS import boundaries remain enabled.

## Verified before branch integration

- Full unit command: `bun run test:unit`; 1,276 suites and 13,202 tests passed; 22 suites / 462 tests skipped and 4 todo. Coverage uses the existing V8 harness, not a whole-repository completeness claim.
- Focused new proof suites: 7 files / 82 tests passed; CRM focus regression: 57 tests passed. Generated-import-map lint boundary: initial failing regression, then 13 passing cases.
- TypeScript checks passed for admin, API, database, lib and shared UI before integration. Donor/missionary and integrated checks remain required.
- Shadscan: admin 49 (floor 43), donor 61 (floor 59), missionary 47 (floor 47), with category floors satisfied. No floor was reduced. Reverified exact exception contexts and supporting files; removed obsolete admin error/not-found waivers and replaced changed exact findings.
- Upstream shadcn: 53 installed components, 54 explicit file diffs, 34 local adapters and 4 owned toolkit directories verified. Official pinned CLI diff/dry-run output reviewed for chart, checkbox, command, sheet and sidebar before rebinding.
- Source ESLint and formatting pass through the enabled pre-commit hook. An exploratory lint invocation over tests and QA scripts additionally reports their existing root-config import restrictions; that unsupported expansion is not an application lint pass.
- `bun run skills:verify` and `bun run verify:workspace-contract` passed.

## Integrated verification before the merge commit

- The donor/missionary head is integrated with the admin implementation. Conflict resolutions preserve both surfaces' intent, shared Base UI primitive contracts, stricter score/category floors, regression tests, and explicit ledger ownership; no suppressions were increased.
- Native admin ESLint passes after compiler-ref ownership repairs in the support composer and settings editor. The live composer-context regression selection passes 5 suites / 38 tests, including canned responses arriving after mount and changing agent/mode context.
- Integrated full units completed with 1,351 passing suites and 13,727 passing tests, but two suites had four resource-timeout failures while lint and Doctor ran concurrently. Both timeout suites passed in the isolated 18-suite / 186-test proof run. A serial full rerun remains required; isolated success is not represented as a full-suite pass.
- Shadscan now passes at admin 49/43, donor 67/59, missionary 49/47 with category floors unchanged. Removed three obsolete duplicate classifications; qualified the remaining exact shared-label finding against current source and actual caller tests. The five-suite / 35-test proof selection passes.
- Upstream shadcn verification passes for 53 installed components, 54 explicit file diffs, 34 local adapters and 4 owned toolkit directories. Shared globals' focus-revealed scroll fade and select-label proof hashes are reviewed and rebound.
- The donor QA record now identifies portable import commit `8ec86d8fa8db1ea7de3cf277ae36d965d37976e8`; that anchor does not relabel historical screenshots as current acceptance.
- Strict React Doctor is still failing. The fresh eight-target scan completed without skipped checks, then rejected stale supporting evidence in `tests/unit/apps/admin/app/eve-operations-workspace.test.tsx`. Exact diagnostic deltas and changed evidence need per-finding adjudication; no blanket rehash or expansion was applied.
- The CI avatar-smoke trace shows successful demo and donor-portal responses but no browser Supabase session. The hermetic workflow uses a signed server-only synthetic session and a placeholder Supabase host, whereas the new retained-draft provider derives ownership from browser auth/profile state. This is a reproduced infrastructure/identity mismatch, not evidence that a real authorized profile is missing; the photo assertions have not been weakened or bypassed.
- Hosted portal 500s and activation of `20261111164500_post_autosave_preconditions.sql` remain unverified. No production credentials, migrations or deployment activation are used by this integration.

## Open limitations

- `bun run react-doctor:check` fails stale supporting evidence. Independent historical reviews contain unresolved semantic holds; their recommendations are not blanket approval. The Doctor ledger is not silently rehashed or broadened. A fresh integrated strict check and per-finding qualification remain outstanding.
- Before this integration, the published PR head was `86220a1f3f1636a2735c3b424220a76db959b1d1`. Its CI unit/lint/types/build/integrity checks passed, but integration avatar smoke and hosted portal smoke failed. Historical green checks do not certify this candidate.
- No new browser, deployment, authenticated provider flow, hosted migration activation or visual acceptance is established by the preceding unit/static checks.
