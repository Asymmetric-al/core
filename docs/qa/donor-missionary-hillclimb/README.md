# Donor and missionary UI hillclimb (November 2026)

Evidence-based UI hillclimb across `apps/donor`, `apps/missionary`, their shared UI and connected flows. Each candidate was built by one lead agent, compared against the current best on frozen screenshots by two independent read-only reviewers, and accepted only when both preferred it.

- **Status:** correctness and delivery verification are in progress as of November 12, 2026; see [Current verification](#current-verification-november-12-2026). The original visual run was resource-limited. The primary donor and missionary journeys, and missionary Tasks, reached about 8/10 from both reviewers. Tasks reached a plateau after R14, with only minor polish remaining. Secondary screens in the queue below were not attempted.
- **Base:** `develop` at `bfde43a20`. The historical Git tree `76df5c4a745795b8095016fbc3994dd9ba31dac5` (a tree object, not a commit) is candidate E13, accepted in R14. It includes E10 (the last reviewed state of the first run), three non-visual commit-gate fixes (see Shadscan), and the Tasks work (R12–R14).
- **Portable import anchor:** commit `8ec86d8fa8db1ea7de3cf277ae36d965d37976e8` first imports this QA record and its retained evidence into the PR history. Use `git show 8ec86d8fa8db1ea7de3cf277ae36d965d37976e8:docs/qa/donor-missionary-hillclimb/README.md` to inspect that published record. This anchor makes the record retrievable after a fresh clone; it is not the historical E13 tree, a recreation of those screenshots, or acceptance of later changes.
- **Continuation:** a later request asked to continue the hillclimb. Its weakness and reference placeholders were left unfilled and no references were attached, so the run continued under the original instructions with the same rubric and references.
- **Dashboard rounds (R15–R21):** a later continuation re-reviewed the signed-in donor and missionary dashboards as seven areas and kept climbing; see [Dashboard rounds](#dashboard-rounds-r15r21).
- **Not done:** no merge or deploy. Admin was only checked for compatibility (lint and typecheck).

## Current verification (November 12, 2026)

The current working candidate is based on local commit `c17f2f0201d68dc1edf0096c0f7ff3ebdc2fbe37`; it includes later correctness repairs beyond the historical screenshots and scores below. The published PR head last inspected was `1e21cc984b1477a8f0a52320eed8222f8b98d65c`. These observations do not certify that published head.

- Final application regression selection: **99 suites, 688 tests passed** using the root `test:unit` script, coverage disabled, one worker, and fresh module caches. This includes privacy ordering, authorization revocation, retained draft ownership/revisions, queued publication cancellation, currency boundaries, pledge paging, date-only handling, and the repaired prerender calendar anchor. A separate verifier selection passed **4 suites, 55 tests** for Windows CLI path handling, compiler launchers, native projections and archive checkout attributes. Overlapping historical test counts are not added to these totals.
- Subsequent focused fixes passed **63 tests** across checkout, Wallet and sidebar sign-out. Wallet uses exact currency-aware minor units, including JPY/KWD and safe-integer limits; invalid monetary values remain unavailable. Checkout renders an invalid-submit summary alongside associated field errors. The real account-menu test verifies pending text, disabled repeat activation and recovery after settlement. The guarded upstream verifier suites passed **170 tests** with two existing skips; the design-system health suite passed all **13 tests** after its fixture dependencies were repaired.
- The comparison-history default now belongs to the metrics hook rather than four individual screens. Its default requests 25 months while the chart retains 13; explicit shorter windows still suppress incomplete comparisons. The nearest hook, dashboard, analytics and chart suites passed **90 tests** after this consolidation.
- Local browser smoke: **4 donor usability tests and 11 photo/crop tests passed**. Photo-removal prerequisites came from a read-response fixture; removal stayed unsaved and the cropper was cancelled without upload. These commands used each test's Demo Access flow and skipped the unrelated shared authentication setup.
- Connected browser checks: donor profile, missionary profile, and a new composer retained edits through six route transitions plus Back/Forward. All edits were reverted without saving. Wallet/feed/history and 390px keyboard checks passed. History reconciled to **$954 across 15 paid gifts**, excluding one processing gift. Settings reached Photo/contact controls on direct navigation, client navigation and reload, with no console or page errors.
- Browser limitations: the local development tree was editable during capture. Earlier temporary unavailable/skeletal editor states recovered after navigation; their cause remains unresolved. Development query devtools obstructed narrow pointer access to Payments, while keyboard navigation worked. These observations do not verify production performance, screen readers, cross-user authorization, or save/payment operations.
- Database regression: the autosave precondition migration and SQL fixture assertions passed against the isolated local hillclimb database inside one transaction. The function replacement, grants and fixture writes were rolled back. A clean reseed and hosted migration apply were not performed.
- Production verification: root lint and typecheck each passed all 15 tasks. Direct production builds of donor, missionary and admin passed with CI fixture environment values; these builds did not deploy or contact live payment services. The missionary dashboard prerender completed after the calendar-anchor repair.
- Integrity: the canonical gate passes with raw scores admin **43**, donor **67**, missionary **49** and donor forms **100/100**. Windows discovery is normalized in the repository wrapper; scanner bytes, rule versions and all raw floors remain unchanged. The exact sidebar pending finding is supported by source and deferred real-menu tests. Only individually reviewed proof hashes were refreshed, including the two portable upstream-test fixtures.
- Preflight: phase-27 and phase-28 projection and exact archival evidence checks pass after correcting native-path comparisons and preserving archive bytes at checkout. The two native projection checks, four archive checkout checks, 13 compiler-launcher tests and workspace contract check pass. The full preflight passed formatting, lint and the contract/configuration stages before stopping at a guarded fixture hash; the reviewed hash was subsequently refreshed. Full preflight and published CI remain pending. The final regression selections above include the palette, CSV formula safety, month-end chart and compiler-launcher repairs. No merge or deployment is claimed.

Representative captures from the connected checks are retained in [verification-2026-11-12](verification-2026-11-12/). The older evidence and scores below remain historical; they are not fresh visual council scores for these correctness repairs. The seed now gives the six display-only missionaries no profile link, so that earlier local fixture adjustment is represented in source. A clean reseed was not performed during this verification.

## Evidence

`before/` is the untouched base and `after/` the final tree, captured with the same script, routes, data and sizes: Chromium, DPR 1, light, reduced motion, desktop 1440×900 and mobile 390×844, first viewport unless noted. File names match one to one.

Data: an isolated local Supabase stack with the repository seed. Local-only fixture adjustments were made so the demo identity could reach both portals: six of the seven seeded missionaries were unlinked from the shared demo profile, and the `missionary_tasks.is_auto_generated` column (missing from migrations, gap G1) was added. One demo identity signs in to both apps, so cross-user boundaries are proven by unit tests, not screenshots.

## Reviewers

Exactly two independent reviewers through T3 orchestration, both read-only by instruction with no editing or delegation (an enforced sandbox was not available; this is the run-specific override of the council skill):

- Claude Opus `claude-opus-5-5`, provider `claudeAgent_claude_luke_004`, effort `high`.
- GPT `gpt-5.6-sol` via Codex, provider `codex_3b390d41-…`, reasoning effort `high`.

Briefs used neutral, counterbalanced Version 1 / Version 2 labels, fixed references (ReUI dashboard-5 and solution-crm-9 previews) and a fixed five-category rubric (task clarity, information hierarchy, readability, consistency and finish, responsive usability; anchors 6/8/9/10).

### Scores by round (mean of the five categories; candidate vs current best)

| Round | Target                                                        | Opus                        | GPT                         | Decision                |
| ----- | ------------------------------------------------------------- | --------------------------- | --------------------------- | ----------------------- |
| R1    | Baseline diagnostic: shells, roster, dashboard, wallet, feeds | 6.0 / 5.2 / 6.6 / 5.8 / 6.0 | 6.6 / 5.6 / 7.4 / 7.2 / 6.0 | —                       |
| R2    | Shells and navigation                                         | 8.4 vs 6.2                  | 8.4 vs 6.6                  | accept                  |
| R2    | Missionary partner roster                                     | 7.4 vs 5.6                  | 8.6 vs 6.2                  | accept                  |
| R2    | Donor wallet (sample state)                                   | 7.8 vs 6.2                  | 8.2 vs 6.4                  | accept                  |
| R3    | Roster                                                        | 7.6 vs 5.0                  | 8.4 vs 5.2                  | accept                  |
| R3    | Wallet                                                        | 8.4 vs 8.2                  | 8.8 vs 8.4                  | accept                  |
| R3    | Donor and missionary feeds                                    | 7.6 vs 5.4                  | 8.2 vs 6.0                  | accept                  |
| R3    | Settings (scored under a wrong brief fact, see below)         | 8.2 vs 5.6                  | 8.6 vs 5.8                  | accept, later corrected |
| R4    | Missionary dashboard and analytics                            | 7.6 vs 6.2                  | 8.2 vs 6.5                  | accept                  |
| R4    | Feeds                                                         | 7.8 vs 6.6                  | 8.3 vs 7.3                  | accept                  |
| R4    | Settings                                                      | 8.0 vs 7.8                  | 8.2 vs 7.4                  | accept                  |
| R4    | Donor history                                                 | 7.6 vs 5.8                  | 8.2 vs 6.3                  | accept                  |
| R5    | Dashboard and analytics                                       | 7.8 vs 7.0                  | 7.8 vs 6.6                  | accept                  |
| R5    | History                                                       | 8.2 vs 6.8                  | 8.2 vs 6.2                  | accept                  |
| R5    | Donor dashboard featured update                               | 7.6 vs 6.6                  | 8.0 vs 7.0                  | accept                  |
| R6    | Dashboard and analytics                                       | 8.0 vs 5.8                  | 8.8 vs 5.4                  | accept                  |
| R6    | History                                                       | 7.8 vs 7.8 (tie)            | 8.0 vs 7.2                  | accept                  |
| R6    | Donor dashboard featured update                               | 8.0 vs 6.8                  | 9.0 vs 6.8                  | accept                  |
| R7    | Public worker profile and giving widget                       | 8.0 vs 6.2                  | 8.3 vs 6.9                  | accept                  |
| R7    | Checkout alternative payment tabs                             | 7.2 vs 5.4                  | 7.9 vs 6.1                  | accept                  |
| R7    | History                                                       | 7.8 vs 7.6                  | 8.2 vs 8.1                  | accept                  |
| R8    | Checkout confirm and worker journal tab                       | 8.0 vs 7.4                  | 8.2 vs 7.3                  | accept                  |
| R8    | Whole donor app, final vs original                            | 8.0 vs 5.6                  | 7.8 vs 6.6                  | —                       |
| R8    | Whole missionary app, final vs original                       | 7.8 vs 5.8                  | 8.4 vs 6.4                  | —                       |
| R9    | Missionary money units                                        | 8.0 vs 4.8                  | 8.4 vs 4.8                  | accept                  |
| R9    | Worker profile notice and update rail                         | 8.0 vs 7.0                  | 8.3 vs 6.6                  | accept                  |
| R10   | Worker profile disclosure                                     | 8.2 vs 7.2                  | 8.0 vs 7.4                  | accept                  |
| R10   | Dashboard comparisons and partner detail                      | 7.8 vs 5.8                  | 8.2 vs 6.8                  | accept                  |
| R10   | Account security honesty and donor sub-navigation             | 8.4 vs 5.6                  | 8.2 vs 5.8                  | accept                  |
| R11   | Profile disclosure copy and metric tiles                      | 8.0 vs 7.2                  | 8.2 vs 7.6                  | accept                  |
| R12   | Missionary Tasks (vs the crash fix alone)                     | 7.6 vs 5.4                  | 8.3 vs 5.8                  | accept                  |
| R13   | Tasks: filter chips, deferred list, column fit, counts        | 8.0 vs 6.0                  | 8.7 vs 6.0                  | accept                  |
| R14   | Tasks: focus after removing a filter; deferred wording        | 7.8 vs 7.2                  | 8.2 vs 7.6                  | accept (final)          |

No candidate was rejected and every round had both scores. The R8 whole-app scores describe candidate E7, not the final tree; later rounds were targeted.

**Correction.** From R3 the briefs stated that `/forgot-password` was live. It is not: both apps' pages say password reset is not enabled. The settings copy approved in R3 and R4 therefore promised an email reset that does not exist. A pre-R10 audit found this; the copy now says password changes are not available, and R10 judged it under the corrected fact.

### Pre-R10 audit

A non-voting, read-only audit (10 agents: five dimension checkers, each with an adversarial verifier) reviewed the whole diff. The lead re-verified each finding against source before acting. Fixed:

- **Blocker:** a C0 fix let `GET /api/posts` without `missionaryId` return every published post in the tenant, including `partners_only`. Every read now returns public posts plus the caller's own.
- False password-reset claims in both settings pages.
- Autosave unpublishing an edited published update.
- Invented "+100%" and partial-window period comparisons.
- Edge-fade mask hiding the scroll viewport's focus ring.
- Focus lost when the stacked partner list and detail swap.
- shadcn upstream-review baseline not refreshed.
- Odd-cent formatting ("$125.5").
- Active sub-navigation link resting under the fade.
- History chart month keying across time zones.

Reverted: an attempt to make sticky table cells opaque; the design-system lint requires a `table.tsx` variant.

### Tasks (continuation)

`/tasks` crashed to the global error card with the seed data. The seed (and the older `packages/config` task vocabulary) stores `pending`, `cancelled`, `note`, `report` and `urgent`, which the Tasks UI does not define, and the board grouped by status without a guard. The dashboard's "View All Tasks" link (added in R4) led straight to the crash.

R12 compared the candidate with the current best plus the crash fix alone, so the UI changes were judged on their own merits. A pre-R13 read-only audit (four agents) found seven issues, all fixed before review; the most serious was focus lost after "Show in list".

## What changed

- **Shells and navigation:**
  - Missionary sidebar account menu adapted from ReUI c-sidebar-1 and c-skeleton-1 (MIT examples) on Core primitives, replacing the "User Name / Missionary" placeholder.
  - Labelled navigation landmark; mobile sheet closes on navigate.
  - Breadcrumbs only link to real routes; mobile section label.
  - Donor sub-navigation as a labelled, horizontally scrolling row with a shared edge fade (`ScrollArea edgeFade="x"`, `scroll-fade-x` utility in `packages/ui`).
- **Money correctness:**
  - Missionary partner pages, dashboard tiles and giving chart treated stored cents as dollars (100× too large); they now convert, and match analytics and the donor app.
  - Period comparisons no longer invent percentages.
- **Missionary partners:**
  - Readable roster rows.
  - List and detail swap below 1024px, with focus moving to "Back to partner list" and returning to the opening row.
  - Detail tab rail with edge fade and keyboard reveal.
- **Ministry updates:**
  - Shared media-unavailable fallback and real titles and categories.
  - New-post creation (a read-only demo on the server) is disabled with an explanation instead of failing.
  - Autosave limited to drafts.
  - Feed audience boundary enforced on the server read.
- **Donor dashboard and history:**
  - Featured update from real data with loading, error and empty states.
  - Update-rail thumbnails fall back to initials.
  - Year totals unaffected by table search; processing and failed gifts noted.
  - Readable payment methods.
  - Row menu only offers real actions; zero-filled monthly chart.
- **Honest states:**
  - Wallet labelled as sample data.
  - Settings say what is not implemented (preferences, two-factor, sessions, password changes).
  - Analytics shows the giving trend that exists instead of placeholder KPIs.
  - Public worker profiles disclose that everything on them is demo content, and the giving widget labels sample figures.
  - Checkout bank and wallet tabs say they are unavailable, and Confirm is card-only (no payment behavior changed).
- **API fix (C0):** `GET /api/posts` returned 400 for every feed request (absent `missionaryId` parsed as null); it now parses and applies the audience rule above.

### Prebuilt sources

ReUI was searched first: c-sidebar-1 (account menu), c-skeleton-1 (loading row), c-alert-5 (info notice pattern, built with Core `Alert` `role="note"`) and the c-scroll-area-4 technique (edge fade, implemented in Core `ScrollArea`). These were compared with shadcn registry items. Everything else reuses existing Core `packages/ui` components: Alert, Badge, Card, Empty, Skeleton, ScrollArea, DataTableResponsive, Meter, Tabs, DropdownMenu and Sidebar. No new style, preset or primitive base.

## Verification

- TDD at each seam: new or changed tests failed first, then passed. Two exceptions, recorded in the run record: a CSS contract test written after the edit, and one assertion refinement.
- `bunx turbo run lint typecheck` for donor, missionary-app, missionary, ui, database, admin, api and lib: 23/23.
- `prettier --check` on every changed file.
- Related unit tests (117 files): 1097 passed, 10 failed, 5 skipped. All 10 failures were already failing at the base on this Windows machine:
  - `issue-492` registry ×3
  - `donors-page-dates` (Windows ESM URL scheme)
  - design-system content-boundaries, health ×2, suppressions and theme
  - `shadcn-upstream-review`
- shadcn upstream review: baseline refreshed for `scroll-area.tsx` and `globals.css`. The method reproduces the base hashes exactly. The full review passes through the script's API with POSIX-normalised paths: 53 components, 54 file diffs, 34 adapters. The Windows CLI prints backslash paths the parser rejects.
- Real-browser checks:
  - Account menu keyboard and Escape focus; mobile sheet; roster swap and focus round trip at 390px.
  - Donor sub-nav focus ring under the fade; tab rail reveal.
  - Composer states; reset-link absence; history totals.
  - Feed audience counts.
- **Not verified:**
  - Screen readers, dark mode, tablet captures and 200% text zoom.
  - Metric tiles in a real percentage state.
  - Cross-user feed exclusion in a browser (single local identity).
  - The full `bun run test:unit` (exceeds the 30-minute background limit here).
  - A passing commit hook (see Shadscan commit gate).

### Tasks changes

- **Crash:** the API mapper normalises legacy values on read (`pending` to not started, `cancelled` to deferred, unknown types to-do, `urgent` to high) without changing stored rows. The board skips any status it cannot place.
- **Summary cards:** they open the list with their filter and read as pressed only while that filter applies. Cards are hidden while tasks load or after a failed load, instead of showing zeros.
- **Deferred tasks:** a note above the board ("N deferred tasks aren't shown on the board, including any marked cancelled") opens a Deferred-only list and moves focus to the selected List view control. Deferred rows no longer carry overdue badges.
- **Filters:** Overdue, Due today and Deferred filters appear as removable chips. The shared `FilterBar` (also used by three admin screens) keeps keyboard focus when a chip or Clear all is removed. Due Today lists match their counts.
- **Layout:** compact page header; four board columns fit from 1280px; card actions keep their labels; partner chips are sentence case, named by the partner, and truncate without overflowing phones; status tabs show on mobile.

## Shadscan commit gate

The pre-commit hook runs `verify:shadscan --staged`. On this Windows host it either times out (its hard-coded 120-second spawn limit) or completes and fails, and HEAD fails it here too. HEAD snapshot scores here are admin 42 (floor 43), donor 56 (floor 59) and missionary 39 (floor 47). There are also two stale admin classifications (`not-found-recovery-present`, `route-loading-boundary-present`).

This work's effect, compared on the same host:

- **Fixed:** the history row menu's "Manage Recurring" item passed an empty `<Link />` render element, which the scanner flagged under `links-have-accessible-names`. The link now carries its own label (like "Open Statement"). Covered by `tests/unit/apps/donor/history-row-actions.test.tsx`.
- **Refreshed after review:** 13 findings-ledger entries (24 proof hashes) pointed at files this work changed. Each scanner-limitation claim was re-checked in source, and every cited verification test passes. After the refresh the staged gate result equals HEAD's: no new unclassified or stale findings.
- **Continuation:** the `FilterBar` baseline hashes and two task-row ledger entries (92, 93) were refreshed after re-verifying their claims and cited tests.
- **Open gate risk:** donor drops from 56 to 50 here. HEAD's only scanner-recognised donor "collection" was the history chart's `data.map(<Cell/>)`, removed when the chart became single-colour. `empty-state-present` therefore went from pass to not-applicable, though the real lists still render empty states. CI likely sits near the donor floor of 59, so this may fail CI. The fix is a product or owner call: accept the change and ratchet the floor, or reintroduce a recognised collection. This run did not rename code or re-add chart cells to recover points.

## Dashboard rounds (R15–R21)

The continuation reviewed the signed-in dashboards as seven areas: D4a donor overview and updates, D4b donor giving records, D4c donor account, M1 missionary shell and home, M2 partners and analytics, M3 updates, and M4 work and account. Each round compared the candidate with the current best on 50 frozen screenshot pairs (desktop 1440×900 and mobile 390×844, plus a second viewport for long screens), with a randomized A/B draw and the same rubric and references. Reviewers also read the working tree's source, so behaviour findings carry `file:line` evidence.

R21 was decided by the Opus reviewer alone: the Codex provider could not start (a stale shadow state file), and the request was to continue without it.

| Round | Opus, candidate area means               | Codex, candidate area means | Decision |
| ----- | ---------------------------------------- | --------------------------- | -------- |
| R19   | 7.4–8.2                                  | 7.6–8.6                     | accept   |
| R20   | 7.8–8.4                                  | 7.8–8.6                     | accept   |
| R21   | 7.8–8.4 (ahead in six areas, tied in M4) | —                           | accept   |

### What changed in R15–R21

- **Behaviour and data truth:**
  - Donor overview "Give again" and "Who you support" open checkout for that missionary instead of a sample profile that returned 404; the public directory says it is sample content.
  - Unsaved updates, Giving page edits and donor profile edits survive in-app navigation and tab switches, behind a leave-or-stay dialog.
  - Analytics totals, comparisons and the chart use one calendar-month window.
  - Exact money amounts show cents in both apps; chart axes keep round dollars.
  - The donor Updates feed loads a page at a time with "Load more updates", and only says "You're all caught up" at the real end.
  - Home's "View partner" opens that partner (`/donors?partner=<id>`), loading further pages until found.
  - "Partner since" is the earliest of join, pledge or gift; a partner added by hand shows no last gift instead of $0.00.
- **Accessibility:**
  - Every monthly chart gives its values to screen readers in a clipped, visually hidden table; the plotted area is hidden from assistive technology.
  - The password form keeps focus while saving; answering a follow request moves focus to the next one.
  - Receipt links are named by recipient, date and amount; sidebar counts are worded ("4 requests", "3 overdue").
- **Layout and finish:**
  - The donor header fits tablets (short tab names below 1280px); Settings is a header link marked as the current page.
  - Phone layouts put urgent work and content first: two-up stat cards, compact follow requests, Tasks in list view with five tabs that fit 320px, and partner detail replacing the summary.
  - Feeds show the photo in the same place for authors and supporters; donor filter chips scroll in one row.
  - The Giving page preview is look-only and has one photo control. The removed camera chip's contrast record (`docs/qa/core-ui/missionary-camera-contrast.json`) is kept as history.

## Open items

**From the dashboard rounds**

- Tasks load once per visit; "Refresh tasks" stays until `packages/lib/hooks/use-tasks.ts` refetches when the page is shown again.
- Shared `packages/ui` follow-ups: sentence-case data-table headers, a current-page flag on account-menu links, plain table semantics when keyboard grid navigation is off, and dark-mode input placeholder contrast (about 4.48:1).
- Charts no longer take keyboard focus, so sighted keyboard users can't step through per-month tooltips; the values are in the hidden tables.

**Product decisions**

- Sample worker profiles open real card checkout routed to seeded `givingMissionaryId` values (the documented mock-data design). Whether demo profiles should accept gifts, and how to name the recipient beside "Give", is a product decision.
- Partner-audience model: `partners_only` posts are now visible only to their author until a partner check exists.
- The missionary dashboard "Monthly support goal" uses `missionaries.current_funding`, which does not reconcile with pledge totals (G6).

- Cancelled tasks: the task model has no cancelled status, so legacy cancelled rows are read and shown as deferred (P4). Two task vocabularies coexist (`packages/config` vs the Tasks UI).

**Pre-existing gaps (not changed)**

- G1: `missionary_tasks.is_auto_generated` missing from migrations.
- G4 and G4b: `Date.now()` prerender diagnostics at `apps/missionary/app/layout.tsx` and `DonorRoleGate` in `apps/donor/app/(dashboard)/donor-dashboard/layout.tsx`.
- G5: seed pledge `total_paid` and `total_expected` on a different scale from `amount`.
- Sticky data-table columns use translucent tints, in admin too; this needs a `table.tsx` variant.
- Follower approvals are local-only; feed "Security & Access" and donor notification saves are not persisted.

**Remaining queue (not attempted)**

- Auth screens: hard-coded "GH" initials.
- Public and CMS pages: dead CTAs (financial downloads, ways-to-give, placeholder phone, FAQ contact); legal "TODO" effective date.
- Email studio, help pages and the profile page.
- Checkout: step focus management; amount carry-over.
- Naming consistency (Donors vs Partners); static footer year.

The full chronological record with candidate hashes and patch checksums is kept outside the repository by the lead agent.
