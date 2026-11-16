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
- An initial concurrent full unit run had four resource-timeout failures in two suites. The final serial `bun run test:unit --maxWorkers=2` run passes with coverage enabled: 1,354 suites / 13,749 tests passed, 22 suites / 463 tests skipped, and 4 todo. The previously timed-out suites pass in that complete run.
- All seven integrated TypeScript checks pass with `bunx tsc --noEmit --incremental false -p <project>/tsconfig.json` for admin, donor, missionary, UI, API, database and lib. `bun run skills:verify` and `bun run verify:workspace-contract` pass. Fresh `develop` at `072160debce34273f252a91d5f8a4815a854b214` merges without conflicts in `e1943cc2e1bba0cb4851b87097efb420102a11f9`; enabled commit hooks pass.
- Shadscan now passes at admin 49/43, donor 67/59, missionary 49/47 with category floors unchanged. Removed three obsolete duplicate classifications; qualified the remaining exact shared-label finding against current source and actual caller tests. The five-suite / 35-test proof selection passes.
- Upstream shadcn verification passes for 53 installed components, 54 explicit file diffs, 34 local adapters and 4 owned toolkit directories. Shared globals' focus-revealed scroll fade and select-label proof hashes are reviewed and rebound.
- The donor QA record now identifies portable import commit `8ec86d8fa8db1ea7de3cf277ae36d965d37976e8`; that anchor does not relabel historical screenshots as current acceptance.
- Strict React Doctor is still failing. The fresh eight-target scan completed without skipped checks, then rejected stale supporting evidence in `tests/unit/apps/admin/app/eve-operations-workspace.test.tsx`. Exact diagnostic deltas and changed evidence need per-finding adjudication; no blanket rehash or expansion was applied.
- The CI avatar-smoke trace shows successful demo and donor-portal responses but no browser Supabase session. The hermetic workflow uses a signed server-only synthetic session and a placeholder Supabase host, whereas the new retained-draft provider derives ownership from browser auth/profile state. This is a reproduced infrastructure/identity mismatch, not evidence that a real authorized profile is missing; the photo assertions have not been weakened or bypassed.
- Hosted portal 500s and activation of `20261111164500_post_autosave_preconditions.sql` remain unverified. No production credentials, migrations or deployment activation are used by this integration.

## Hook and hermetic smoke follow-up

- The first normal push stopped at `verify:eslint`: 70 existing disable directives lacked the required tracking prefix. Existing directives now retain their reasons with tracking TODOs; no lint rule, suppression inventory or score floor was relaxed. The scoped lint run exposed one additional app type import in a chart test; the fixture now derives its type from the tested component's public props rather than bypassing that boundary.
- `bun run verify:eslint` and scoped source/test lint pass. The chart-state regression passes 8 tests.
- A red/green regression reproduces the absent hermetic browser identity. The Playwright helper now installs a cookie-backed donor identity only after a successful explicit bypass response, with all three hermetic environment guards, the exact placeholder Supabase URL and a loopback application origin. Hosted previews, real Supabase projects, real demo sign-ins and unsuccessful responses remain unchanged. Only exact test-user/profile GETs are mocked; product auth and retained-draft ownership are unchanged.
- Ten fixture tests pass, including the negative environment/origin/response guards, exact tenant/profile ownership, rejection of other users and rejection of writes. An isolated real Chromium probe using the installed Supabase SSR 0.12.7 client restores that owner from the cookie and mocked profile response. This proves fixture/client compatibility, not the full app smoke flow or production authorization. Fresh CI app-smoke verification remains required.

## Published preflight and hosted smoke selectors

- Normal hook-on push published `ad465089f16569c7fc0d3796160019eef38d12db`. The complete pre-push gate passed formatting, skills/contracts, lint, integrity, typecheck, all three production builds and coverage-enabled units: 1,355 suites / 13,759 tests passed, 22 suites / 463 tests skipped and 4 todo. This is local preflight evidence, not head-specific hosted acceptance.
- The prior hosted report shows authenticated donor `Welcome back, Preview` and missionary `Welcome back` headings, while the smoke expected the superseded time-of-day donor greeting and a visible `Dashboard` missionary heading. The missionary document title remains Dashboard. Donor portal requests succeeded; missionary portal requests separately returned 500.
- A focused regression first fails both happy paths against current dashboard markup. The smoke now uses semantic Welcome back headings, the donor's Given in year and More updates headings, and the missionary's Monthly support/Giving by month headings. Four regression cases pass, including missing donor financial content and an explicit missionary portal error. Existing authenticated routes, login absence, document titles, error checks and Partners navigation remain required. No hosted datasource is mocked by this repair.
- The selector regression executes the actual smoke callbacks against synthetic DOM/Page boundaries. It proves selector contracts and failure preservation, not deployment, login, network correctness or resolution of the missionary portal 500. Fresh GitHub app smoke remains required.

## Support Hub smoke repair

- GitHub CI on `ad465089f16569c7fc0d3796160019eef38d12db` passes the primary CI gate, builds, integrity, types, units, migration and health smoke. The avatar scenario passes. Two Support Hub assertions fail because the hermetic CI datasource returns 500 and the previous UI masked those failures.
- The final layout assertion retains the Table/Board pressed states and removal of the board region, then accepts a native table, the empty state, or the table view's honest inbox-load alert. The unknown-ID deep link accepts a real not-found or retryable load-failure state while still rejecting the Next.js error page. No Support UI or API changes, network fixtures or viewport changes remain in the final spec.
- The earlier fixture-backed Chromium run verifies a superseded test version only. A fresh real Chromium run against the local hermetic admin app passes all six final no-fixture scenarios with no retries or skips (4.5 minutes); the protected Acceptance suite passes nine cases. Scoped lint and Prettier checks pass. This proves the final UI/error-state assertions, not hosted datasource correctness.
- A strict Doctor scan at `32459f6a271dec17eae2ba9c46cffadba72a519e` completes eight targets with 701 diagnostics. Independent read-only reconciliation finds 148 exact identities, only 25 with valid source/supporting bindings, 63 same-message/context positional candidates and 66 stale supporting files. Even accepting those 63 candidates would leave 490 unmatched identities without that continuity; these are not 490 established runtime defects. Two unmatched cleanup errors require individual evidence qualification. The original stale Eve test hash is not the only blocker. No blanket rehash or waiver is applied.

## Preflight timer repair

- The next normal hook-on push fails the unit gate even though 1,356 suites / 13,763 assertions pass: an untracked two-second profile-success timeout dispatches after jsdom teardown. This is an actual lifecycle defect, not permission to ignore unhandled errors.
- A regression first demonstrates that unmount does not cancel the specific timer and an older save clears a newer success too early. The success reset now belongs to an effect that cleans up on unmount or cleared success; the save-drain and retained cross-route completion remain unchanged.
- Three suites / 43 tests pass, including unmount cancellation, the exact two-second expiry, successive-save timing and existing retained editor navigation. Missionary TypeScript and scoped product-source lint pass. Explicitly linting the test with the root app-boundary config exposes its pre-existing cross-app test-import errors; no rule is disabled or broadened. The repository's configured lint targets remain unchanged.
- The complete per-comment source/test assessment is in [the review disposition](./pr2647-review-disposition.md). The earlier 24 resolved conversations are historical evidence. Six late material repairs and the source-versus-deployment autosave disposition are recorded in [final repairs](./pr2647-final-repairs.md); final published replies and resolution are verified on GitHub. Hosted activation remains a release prerequisite, not a claimed result of merging into develop.

## Open limitations

- `bun run react-doctor:check` fails stale supporting evidence. Independent historical reviews contain unresolved semantic holds; their recommendations are not blanket approval. The Doctor ledger is not silently rehashed or broadened. A fresh integrated strict check and per-finding qualification remain outstanding.
- Before this integration, the published PR head was `86220a1f3f1636a2735c3b424220a76db959b1d1`. Its CI unit/lint/types/build/integrity checks passed, but integration avatar smoke and hosted portal smoke failed. Historical green checks do not certify this candidate.
- Apart from the isolated Chromium fixture compatibility probe and the six fixture-backed local Support Hub browser scenarios, no new hosted app acceptance, deployment, authenticated provider flow, hosted migration activation or visual acceptance is established by these checks.
