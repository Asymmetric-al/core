# Evidence-Based Audit And TDD Patch Log

Session label: 2026-05-18 audit-and-tdd-cycle

## Work Plan

1. [x] Load required repo instructions and relevant domain rules.
2. [x] Build the read-only repo map.
3. [x] Record orientation findings.
4. [x] Search for candidate high-confidence bugs or test gaps.
5. [x] Classify findings by confidence.
6. [x] Record the ranked audit before editing.
7. [x] Select up to 3 top high-confidence findings.
8. [x] Patch each selected finding one by one using TDD.
9. [x] For each patch, record red test, fix, green test, and relevant checks.
10. [x] Run final validation.
11. [x] Record final update log, revert notes, and remaining risks.

## Instruction Files Read

- `AGENTS.md`
- `C:\Users\Conrad\.codex\skills\goal\SKILL.md`
- `.agents/skills/test-driven-development/SKILL.md`
- `.agents/skills/clean-code/SKILL.md`
- `.agents/skills/architecture-patterns/SKILL.md`
- `docs/ai/skills/repo-entry/SKILL.md`
- `docs/ai/rules/general.md`
- `docs/ai/rules/testing.md`
- `docs/ci.md`
- `docs/ai/stack-registry.md`
- `docs/ai/nia.md`
- `docs/ai/working-set.md`
- `docs/ai/rules/backend.md`
- `docs/guides/architecture/data-access-boundary.md`
- `scripts/AGENTS.md`
- `supabase/AGENTS.md`
- `docs/ai/skills/supabase/SKILL.md`
- `docs/ai/skills/nextjs-supabase-auth/SKILL.md`
- `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`
- `docs/ai/skills/nextjs-app-router/SKILL.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
- `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`
- `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `README.md`
- `docs/README.md`
- `docs/guides/development/getting-started.md`
- `docs/guides/development/contributing.md`
- `docs/guides/architecture/overview.md`
- `openspec/project.md`
- `openspec/specs/platform-boundaries/spec.md`
- `openspec/specs/platform-principles/spec.md`
- `docs/ai/rules/frontend.md`
- `docs/ai/skills/react-component-dev/SKILL.md`
- `docs/features/support-hub/phase-06-reports-settings-automation.md`
- `docs/features/support-hub/final-audit-and-wrap-up.md`
- `docs/features/support-hub/admin-guide.md`

## Orientation Summary

Apps found:

- `apps/admin` (`@asym/admin`) - Next.js App Router admin / Mission Control surface on port 3030.
- `apps/donor` (`@asym/donor`) - donor/public surface on port 3000, Playwright default test port 3005.
- `apps/missionary` (`@asym/missionary-app`) - missionary workspace on port 4000.

Packages found:

- `@asym/api`, `@asym/auth`, `@asym/config`, `@asym/database`, `@asym/email`, `@asym/env`, `@asym/graphql`, `@asym/lib`, `@asym/missionary`, `@asym/ui`.

Test setup found:

- Vitest root config: `vitest.config.ts`.
- Unit include globs: `tests/unit/**/*.test.ts(x)`, `packages/api/tests/unit/**/*.test.ts(x)`, `packages/auth/**/*.test.ts`.
- Unit env defaults: `SKIP_ENV_VALIDATION=1`, placeholder Supabase public URL/key.
- Playwright root config: `playwright.config.ts`.
- E2E test directory: `tests/e2e`.
- Playwright web servers cover donor/admin with CI-equivalent env defaults and optional `PLAYWRIGHT_REUSE_EXISTING_SERVER`.

CI gates found:

- `.github/workflows/ci.yml`: `format`, `lint`, `typecheck`, `build`, `test-unit`, summarized by `ci-gate`.
- `.github/workflows/ci-integration.yml`: `migrate`, `smoke`, `test-e2e`, summarized by `integration-gate` and production-only `e2e-gate`.
- `docs/ci.md` and `scripts/verify/ci-preflight.mjs` define local preflight order.

Repo rules that matter for this task:

- Bun is the package manager/runtime; use Bun commands.
- Do not patch before the ranked audit is recorded.
- Use TDD for production fixes: failing test first, smallest fix, green test.
- Route handlers under `apps/*/app/api/**` must stay thin and delegate business data access to `packages/api`.
- Supabase, auth, RLS, tenant isolation, money state, and role scope are high-risk.
- Next.js behavior must be checked against installed docs under `node_modules/next/dist/docs`.
- OpenSpec applies because `openspec/` exists; current boundary specs prioritize tenant isolation, server-side sensitive operations, and honest money state.

Verification commands available:

- Focused unit: `bunx vitest run <test-file>`
- Unit suite: `bun run test:unit`
- App-scoped: `bun run lint:admin`, `bun run typecheck:admin`, `bun run lint:donor`, `bun run typecheck:donor`, `bun run lint:missionary`, `bun run typecheck:missionary`
- Repo checks: `bun run format:check`, `bun run skills:verify`, `bun run lint`, `bun run verify:data-boundary`, `bun run verify:workspace-contract`, `bun run verify:eslint`, `bun run typecheck`, `bun run build`, `bun run test:unit`
- PR preflight: `bun run ci:preflight`
- E2E/a11y: `bun run test:e2e:smoke`, `bun run test:e2e:auth-preflight`, `bun run test:e2e:cms`, `bun run test:a11y`

Missing files expected but not found:

- `docs/CONTRIBUTING.md` is referenced by root agent/docs language but does not exist; the actual contributing guide is `docs/guides/development/contributing.md`.

Other orientation notes:

- `git status --short` was clean before creating this log.
- `git diff --stat` was empty before creating this log.
- Recent history is CI/deployment/Payload-heavy, including `fix(ci): scope playwright app coverage`, `fix(ci): run Turbo build on Windows`, and `refactor(missionary): narrow donors page view model`.
- `README.md`, `docs/guides/architecture/overview.md`, and `openspec/project.md` still mention Next.js `16.2.1` or `16.1` in places, while root/app package manifests use `next@16.2.6`.
- `bun.lock` exists and was inspected as a lockfile artifact (`594227` bytes, last write `2026-05-16 23:01:11` local filesystem time).

## Search Strategy

- Nia availability was checked via tool discovery. No Nia repository search/read/grep tools are exposed in this Codex session.
- Fallback strategy: use repo-scoped `rg`, direct file reads, `git` history, package/test inspection, and installed Next.js docs.
- Audit target order:
  1. Verification scripts with tests, because they are recent CI-critical code and can be tested without network/browser state.
  2. Pure logic in shared packages with weak or missing edge coverage.
  3. Thin route/data-boundary contracts where expected behavior is explicit and unit-testable.
  4. Existing weak tests where a focused assertion can prove a regression risk.

## Candidate Findings

- Support Hub report `volume` slice ignores the selected report date range because `buildReportSeries()` computes `inRangeConversations` and then passes `scopedConversations` to `buildVolumeSeries()`.
- Missionary donor list sort direction is inverted for the visible `Ascending` toggle. The UI labels `sortAsc` as `Ascending`, but `filterAndSortDonors()` reverses the comparison when `sortAsc` is true and the existing test preserves that incorrect behavior.
- Missionary donor search treats surrounding or whitespace-only input as meaningful query text. The search box passes raw input to `filterAndSortDonors()`, which lowercases without trimming, and `hasDonorsActiveFilters()` treats whitespace as an active filter.
- Support Hub report `businessHoursOnly` semantics are broader than the code currently enforces for some conversation-based slices. The admin guide says only timestamps inside business-hours should count, while the aggregator only applies the check to messages today. This is important, but expected per-slice timestamp choice needs product confirmation before patching broadly.
- Documentation drift: some high-level docs still mention Next.js `16.1` or `16.2.1` while manifests use `next@16.2.6`. This is true but does not affect runtime correctness and is outside the selected bug patch set.

## Confidence Classification

- High confidence:
  - Support Hub volume reports count conversations outside the requested range.
  - Missionary donor list `Ascending` sort produces descending order.
  - Missionary donor search does not trim user-entered search text.
- Medium confidence:
  - Support Hub `businessHoursOnly` behavior for all conversation-based metrics needs a per-slice product rule before a broad patch.
  - Next.js version docs drift should be cleaned up, but it is documentation maintenance rather than a code/test regression.
- Low confidence:
  - No low-confidence findings selected for this cycle.

## Ranked Audit

## High-confidence findings

### 1. Support Hub volume report counts conversations outside the selected range

- Confidence: High
- Area: `apps/admin` Support Hub reports
- Files:
  - `apps/admin/features/support-hub/lib/report-aggregations.ts`
  - `tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`
  - `apps/admin/features/support-hub/components/reports/surfaces/OverviewReport.tsx`
  - `docs/features/support-hub/phase-06-reports-settings-automation.md`
- Evidence:
  - `buildReportSeries()` documents that it filters by `range + scope + business-hours` before routing to metric-specific aggregators.
  - The same function computes `inRangeConversations` from `conversation.createdAt`, but the `case "volume"` branch calls `buildVolumeSeries(request, scopedConversations, ...)`.
  - `OverviewReport` labels the volume card helper as `Conversations in range`.
  - The Phase 6 metric catalogue defines `volume` as per-day counts of `conversation.createdAt`.
  - The existing `buckets volume by day` test only uses in-range conversations, so it would pass even when out-of-range rows are counted.
- Gap:
  - An out-of-range conversation can inflate the volume total and produce buckets outside the selected report window.
- Why it matters:
  - Admin report totals and CSV/JSON exports can overstate donor-care volume for a selected period.
- Suggested tests:
  - Add an out-of-range conversation to the volume fixture and assert the total excludes it.
  - Assert no bucket is emitted for the out-of-range date.
- Smallest safe fix:
  - Pass `inRangeConversations` into `buildVolumeSeries()` for the `volume` branch.
- Validation:
  - `bunx vitest run tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`
  - `bun run typecheck:admin`
- Expected change size:
  - Small
- Patch recommendation:
  - Patch now

### 2. Missionary donor list `Ascending` sort is inverted

- Confidence: High
- Area: `apps/missionary` donor list model
- Files:
  - `apps/missionary/app/donors/donors-list-model.ts`
  - `tests/unit/apps/missionary/donors-list-model.test.ts`
  - `apps/missionary/app/donors/use-donors-page-view.tsx`
- Evidence:
  - The donor list UI renders a checkbox item labeled `Ascending`, checked by `sortAsc`.
  - `filterAndSortDonors()` currently returns `filters.sortAsc ? -comparison : comparison`.
  - `compareDonors()` returns natural ascending order for names, so `sortAsc: true` reverses `Alpha`/`Zulu`.
  - The existing unit test named `keeps the existing sortAsc inversion behavior` expects `sortAsc: true` to return `["zulu", "alpha"]`, which contradicts the UI label.
- Gap:
  - Users selecting `Ascending` for names get descending order; other sort fields use inconsistent comparison direction.
- Why it matters:
  - Donor-facing missionary workflow lists can be sorted opposite to the visible control state, making scanning and lookup unreliable.
- Suggested tests:
  - Change the existing inversion test to assert `sortAsc: true` sorts names `Alpha` then `Zulu`.
  - Preserve the existing default descending gift-date and total-given behavior.
- Smallest safe fix:
  - Make `compareDonors()` return natural ascending comparisons for all sort fields and invert only when `sortAsc` is false.
- Validation:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts`
  - `bun run typecheck:missionary`
- Expected change size:
  - Small
- Patch recommendation:
  - Patch now

### 3. Missionary donor search does not trim user-entered search text

- Confidence: High
- Area: `apps/missionary` donor filters
- Files:
  - `apps/missionary/app/donors/donors-list-model.ts`
  - `apps/missionary/app/donors/donors-page-model.ts`
  - `tests/unit/apps/missionary/donors-list-model.test.ts`
  - `tests/unit/apps/missionary/donors-page-model.test.ts`
  - `apps/missionary/app/donors/use-donors-page-view.tsx`
- Evidence:
  - The UI search box is a free-text `Search partners...` input that stores raw `e.target.value`.
  - `filterAndSortDonors()` normalizes with `filters.searchTerm.toLowerCase()` but does not trim.
  - `hasDonorsActiveFilters()` treats `filters.searchTerm.length > 0` as active, so whitespace-only input shows active filters and can empty the list.
  - Existing tests cover matching `computing`, but not equivalent input with surrounding whitespace or whitespace-only input.
- Gap:
  - Pasted or accidentally spaced search terms fail to match otherwise exact donor identity fields; whitespace-only search behaves as an active filter.
- Why it matters:
  - A common search-box edge case can hide valid donors and display false active-filter state.
- Suggested tests:
  - Assert `"  computing  "` still matches the organization field.
  - Assert whitespace-only search returns the unfiltered list and does not count as an active filter.
- Smallest safe fix:
  - Trim `searchTerm` before lowercasing in the list model and before active-filter detection in the page model.
- Validation:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts tests/unit/apps/missionary/donors-page-model.test.ts`
  - `bun run typecheck:missionary`
- Expected change size:
  - Small
- Patch recommendation:
  - Patch now

## Needs human confirmation

- Support Hub `businessHoursOnly` currently filters message timestamps but not every conversation-based metric timestamp. The admin guide says only timestamps inside business hours count, but the desired timestamp for metrics such as first-response, resolution, customer-waiting, open-count, and snoozed-count should be confirmed before changing broad report semantics.
- Docs still mention older Next.js versions while package manifests use `next@16.2.6`. This should be handled as a docs cleanup issue, not as part of the selected regression patch set.

## Recommended patch set

I recommend patching these top high-confidence items, one by one:

1. Support Hub volume report counts conversations outside the selected range.
2. Missionary donor list `Ascending` sort is inverted.
3. Missionary donor search does not trim user-entered search text.

I will use test-driven development: add or update the focused test first, confirm it fails for the expected reason, make the smallest production change, re-run the focused test, then run relevant checks before moving to the next item.

## Patch Sequence

### Finding 1: Support Hub volume report counts conversations outside the selected range

- Intended patch:
  - Add a regression test proving `volume` excludes conversations whose `createdAt` falls outside `request.range`.
  - Confirm the focused report aggregation test fails before production code changes.
  - Change the `volume` branch to aggregate `inRangeConversations`.
  - Re-run the focused test and relevant admin checks.
- Red test:
  - `bunx vitest run tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`: failed as expected.
  - Failure reason: the new range regression expected `series.total` to be `1`, but the current implementation returned `3`.
- Green test:
  - `bunx vitest run tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`: passed (`10` tests).
- Relevant checks:
  - `bun run typecheck:admin`: passed.
  - `bun run lint:admin`: passed.
- Files changed:
  - `tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`
  - `apps/admin/features/support-hub/lib/report-aggregations.ts`
- Status: Complete.

### Finding 2: Missionary donor list `Ascending` sort is inverted

- Intended patch:
  - Update the existing sort regression test so `sortAsc: true` with `sortBy: "name"` expects natural ascending order.
  - Confirm the focused donor list model test fails before production code changes.
  - Normalize all donor sort comparisons to natural ascending order and reverse only when `sortAsc` is false.
  - Re-run the focused test and relevant missionary checks.
- Red test:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts`: failed as expected.
  - Failure reason: the updated sort regression expected `["alpha", "zulu"]`, but the current implementation returned `["zulu", "alpha"]`.
- Green test:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts`: passed (`4` tests).
- Relevant checks:
  - `bun run typecheck:missionary`: passed.
  - `bun run lint:missionary`: passed.
- Files changed:
  - `tests/unit/apps/missionary/donors-list-model.test.ts`
  - `apps/missionary/app/donors/donors-list-model.ts`
- Status: Complete.

### Finding 3: Missionary donor search does not trim user-entered search text

- Intended patch:
  - Add donor list model coverage proving surrounding whitespace is ignored for text search.
  - Add donor page model coverage proving whitespace-only search does not count as an active filter.
  - Confirm the focused donor tests fail before production code changes.
  - Trim search input in the list model and active-filter helper.
  - Re-run focused tests and relevant missionary checks.
- Red test:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts tests/unit/apps/missionary/donors-page-model.test.ts`: failed as expected.
  - Failure reason: `"  computing  "` produced no donor matches, and whitespace-only `searchTerm` returned active-filter state `true`.
- Green test:
  - `bunx vitest run tests/unit/apps/missionary/donors-list-model.test.ts tests/unit/apps/missionary/donors-page-model.test.ts`: passed (`12` tests).
- Relevant checks:
  - `bun run typecheck:missionary`: passed.
  - `bun run lint:missionary`: passed.
- Files changed:
  - `tests/unit/apps/missionary/donors-list-model.test.ts`
  - `tests/unit/apps/missionary/donors-page-model.test.ts`
  - `apps/missionary/app/donors/donors-list-model.ts`
  - `apps/missionary/app/donors/donors-page-model.ts`
- Status: Complete.

## Validation Commands And Outcomes

- Read-only orientation commands completed:
  - `git status --short`: clean
  - `git log --oneline -20`: reviewed
  - `git diff --stat`: empty
  - package/test/workflow/doc inspection commands: completed
- Focused final regression suite:
  - `bunx vitest run tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts tests/unit/apps/missionary/donors-list-model.test.ts tests/unit/apps/missionary/donors-page-model.test.ts`: passed (`3` files, `22` tests).
- App-scoped checks:
  - `bun run typecheck:admin`: passed.
  - `bun run lint:admin`: passed.
  - `bun run typecheck:missionary`: passed after finding 2 and again after finding 3.
  - `bun run lint:missionary`: passed after finding 2 and again after finding 3.
- Broader checks:
  - `bun run test:unit`: passed (`238` files, `1058` passed, `2` skipped).
  - `bunx prettier GOAL_LOG.md --check`: passed.
  - `bun run ci:preflight`: partially completed. Passed `verify-git-attribution`, `format`, `skills:verify`, `lint`, `verify:data-boundary`, `verify:workspace-contract`, `verify:eslint`, `verify:shadcn-diff`, `typecheck`; the admin Next.js build printed `10 successful, 10 total` and the route summary, then the Turbo/Next wrapper stayed open without proceeding to donor/missionary build or unit test stages. The idle preflight process tree was stopped to avoid leaving an orphaned validation session.
  - `bun run build:missionary`: the missionary Next.js build printed `10 successful, 10 total` and the route summary, then the Turbo wrapper stayed open without a clean exit. The idle wrapper was stopped. No stale `.next/**/lock` files were left behind.
- PR CI follow-up:
  - After rebuilding the PR branch from `origin/epic` to remove earlier CI workflow/script commits, GitHub `CI Integration` failed in `Run Playwright E2E` because the workflow starts only the donor app with `PLAYWRIGHT_INCLUDE_ADMIN=0`, while the default Playwright `chromium` project still collected admin and missionary specs that require `localhost:3030` or other app servers.
  - Red test: `bunx vitest run tests/unit/playwright-config.test.ts` failed as expected because `getDefaultProjectTestIgnore()` did not exist.
  - Fix: `playwright.config.ts` now makes the default `chromium` and `mobile-chrome` projects ignore admin, missionary, boneyard, support-hub, and local CMS specs only when `PLAYWRIGHT_INCLUDE_ADMIN=0`. No GitHub workflow or CI gate file was changed.
  - Green test: `bunx vitest run tests/unit/playwright-config.test.ts` passed (`6` tests).
- Final repository state:
  - `git status --short`: intended modified files only plus untracked `GOAL_LOG.md`.
  - Changed files: `apps/admin/features/support-hub/lib/report-aggregations.ts`, `apps/missionary/app/donors/donors-list-model.ts`, `apps/missionary/app/donors/donors-page-model.ts`, `playwright.config.ts`, `tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`, `tests/unit/apps/missionary/donors-list-model.test.ts`, `tests/unit/apps/missionary/donors-page-model.test.ts`, `tests/unit/playwright-config.test.ts`, `GOAL_LOG.md`.
  - Build artifact check: no tracked build artifacts and no stale Next lock files found.

## Revert Notes

- To remove this tracking artifact only: delete `GOAL_LOG.md`.
- To revert finding 1: change `apps/admin/features/support-hub/lib/report-aggregations.ts` back to passing `scopedConversations` to `buildVolumeSeries()` and remove the new range regression from `tests/unit/apps/admin/features/support-hub/report-aggregations.test.ts`.
- To revert finding 2: restore the previous donor sort comparison direction in `apps/missionary/app/donors/donors-list-model.ts` and restore the former inversion expectation in `tests/unit/apps/missionary/donors-list-model.test.ts`.
- To revert finding 3: remove `.trim()` normalization from `apps/missionary/app/donors/donors-list-model.ts` and `apps/missionary/app/donors/donors-page-model.ts`, and remove the whitespace-search assertions from `tests/unit/apps/missionary/donors-list-model.test.ts` and `tests/unit/apps/missionary/donors-page-model.test.ts`.
- To revert the PR CI follow-up: remove `getDefaultProjectTestIgnore()` and its two arrays from `playwright.config.ts`, restore the inline default `testIgnore` arrays on the `chromium` and `mobile-chrome` projects, and remove the `getDefaultProjectTestIgnore` tests from `tests/unit/playwright-config.test.ts`.

## Final Update Log

- Support Hub volume reports now aggregate only `inRangeConversations`, so conversations with `createdAt` outside the selected report window no longer affect the `volume` total or buckets.
- Missionary donor sort comparisons now use natural ascending comparisons and apply the `sortAsc` flag at the final comparator boundary, making the visible `Ascending` control match the list order.
- Missionary donor search now trims the search term before matching donor identity fields and before deciding whether search makes filters active.
- Playwright default projects now respect the existing `PLAYWRIGHT_INCLUDE_ADMIN=0` setting by not collecting specs that require non-donor app servers during the donor-only E2E phase.
- No docs or generated files were changed beyond this task log.

## Remaining Risks

- `businessHoursOnly` handling for conversation-based Support Hub report slices still needs product confirmation before a broader semantics change.
- Several docs mention older Next.js versions than the installed `next@16.2.6`; this was not patched because it is documentation drift outside the selected regression fixes.
- `bun run ci:preflight` and `bun run build:missionary` both reached successful build output but their Turbo/Next wrappers did not exit cleanly in this Windows session. The direct full unit suite, focused tests, lint, typecheck, and emitted build success output were used as the next-best validation evidence.
