# Admin workspaces UI hillclimb (CRM, Contributions, Web Studio)

## Scope and conditions

This run covers three Admin (Mission Control) areas, including every subpage,
tab, view and flyout that can be reached locally:

- **CRM:** `/crm` in records and kanban views, the `?donor=` record drawer
  with its Overview, Properties and Gift history tabs, the gift-history
  dialogs, `/crm/notes` and `/crm/relationships`.
- **Contributions:** `/contributions`, the `?gift=` detail sheet, the refund
  and correction flows, the operation shell, and the offline gift dialog.
- **Web Studio:** `/web-studio/**`, covering the shell, dashboard, every
  collection list, the document workspace and its settings dialog, the
  template gallery, the missionaries hub and the create flows.

The bar: both independent reviewers rate every part 9.0 or higher. Existing
features, required information and working behaviour are preserved. The run
keeps exact `base-maia`, Base UI, Zinc semantic tokens and shared ownership in
`@asym/ui`. ReUI is used for every grid and table. Nothing is merged or
deployed.

- **Worktree:** `C:/Users/Conrad/.t3/worktrees/core/t3-5a24111d`.
- **Branch:** `t3/sync-latest-and-use-skills`.
- **Original and base:** `8368004b339384eb98129a086ca71b7db88534ed`.
- **Preserved, not part of this task:** `bun.lock`,
  `packages/eve-runtime/package.json`, `supabase/.temp/cli-latest`, and the
  earlier Mission Control home hillclimb (`docs/qa/admin-home-hillclimb/`,
  `apps/admin/features/mission-control/**`).

**Fixed capture conditions:** CSS widths 1440x1000, 1024x900, 640x900 and
390x844; DPR 1; forced light; reduced motion; only `nextjs-portal` hidden.
`capture-workspaces.mjs` produces the screenshots and `page-metrics.json`,
and `check-workspaces.mjs` produces `workspace-checks.json`. The checks cover
axe WCAG 2A/AA/2.1AA, overflow, dialog containment, rendered rows against the
fixture total, and keyboard reach and row movement. `compose-sheets.mjs`
builds A|B sheets.

**Data:**

- **CRM and Contributions:** the local APIs need Supabase, which is not
  available here, so Playwright `page.route` fixtures serve them. The
  fixtures are typed against the real API types through the real builders,
  with 1645 structural checks (see `fixtures/README.md`).
- **Web Studio:** a scratch local Postgres (port 54322) runs real Payload
  4.0.0-beta.3, seeded by `seed-cms-extra.mjs`, which refuses non-local
  databases. `studio-fixtures.mjs` serves the missionaries and funds lookups.
- **Status:** none of this is tenant-integration proof.

**Rubric (each out of 10):** task clarity, information hierarchy,
readability, consistency/finish, and responsive usability. Anchors: 6 is
usable with friction, 8 is strong with remaining weaknesses, 9 is polished
with no substantive weakness found on inspection, and 10 is exceptional.
Each reviewer scores each part independently, with no combined average. Hard
requirements outrank scores.

## Review identities

- **Claude:** provider `claudeAgent`, model `claude-opus-5-5`, effort high.
- **GPT:** provider `codex_3b390d41-75c6-478d-a97b-a63ae1c5069c`, model
  `gpt-6.1-sol`, reasoningEffort high.

Both reviewers are read-only, receive identical evidence in counterbalanced
order, and are told no desired score or preference.

## Shared foundation (orchestrator-owned)

- **Vendored ReUI data-grid:** `packages/ui/components/reui/data-grid/`. Its
  provenance and adaptations are in `packages/ui/components/reui/README.md`,
  and its explicit lint exception is in
  `tooling/eslint-config/reui-data-grid-exceptions.mjs`.
- **Core composition `@asym/ui/components/data-grid-panel`:** `DataGridPanel`
  (Card shell modelled on ReUI c-data-grid-22), the toolbar parts, the
  selection bar, `DataGridRowPrimary`, row keyboard navigation and the
  engine boundary. Seven tests cover it in
  `tests/unit/packages/ui/data-grid-panel.test.tsx`.
- **Inherited sidebar accessibility fix:** `mc-shell.tsx` now renders the
  Collapsible as the `SidebarMenuItem`. This removes the only axe violation
  that appeared on every page (list/listitem). It was built red-to-green in
  `mc-shell-navigation-names.test.tsx`.
- **CSS layer order:** the root cause of Web Studio's broken chrome was
  Payload's reset outranking Tailwind utilities. The fix is
  `apps/admin/app/css-layer-order.css`, imported before `globals.css`.

## Defects found in the original

- **CRM money shown at 100x:** the grid, kanban, drawer and relationships
  read cents as dollars ($241,000.00 instead of $2,410.00).
- **Truncated tables:** only 10 rows render in the CRM, notes and
  relationships tables, which use a paginated row model with no controls.
- **Contributions totals:** only 50 gifts load, so the KPI totals mislead.
- **Raw identifiers:** a fund UUID appears under the fund name.
- **Dead controls:** CRM New Record and Archive, and Contributions Export,
  Delete and Add Contribution.
- **Ignored parameters:** the CRM ignores the Support Hub's
  `/crm?email|contact` parameters.
- **Web Studio:** triple chrome, clipped buttons and duplicated badges, all
  traced to the CSS layer order.
- **Accessibility:** two axe violations at desktop (sidebar list/listitem),
  notes and relationships rows unreachable by keyboard, and mobile
  contribution rows unreachable.

## Rounds and decisions

See the per-round entries below. Each candidate is frozen under
`snapshots/` before review.

### Evidence harness (round 2 preparation)

- **States:** the 56 states live in one catalogue, `workspace-states.mjs`,
  and both the capture and the check scripts iterate it. It adds 24 flyouts
  and sub-views to the first round's states: row menus, view options,
  search, gift history and its views menu, note detail, selection, bulk
  receipts, card view, filters, the fund correction and receipt
  operations, Workspace settings, versions, API, create, trash, the
  ministry update, navigation and media editors, the stock Users, Tenants
  and Account screens, and the mobile Studio navigation. The full list is in
  `coverage.md`.
- **Checks:** `check-workspaces.mjs` covers every state at desktop and
  mobile. It sets the viewport before navigating, and now probes dialog
  focus containment (12 Tabs, with Base UI focus guards counted as inside)
  and Escape-to-close.
- **Original server (A):** a detached worktree at `8368004b` (scratchpad
  `core-original`) runs on port 3031 with `ASYM_E2E_AUTH_SURFACE=admin`.
  The test sign-in picks the app from the port, and 3031 is not mapped.
  Its dev log is written outside the worktree: a log inside the worktree
  root made Turbopack reload `/crm` in a loop, and the first two attempts
  captured the sign-in page or a reloading page. Those captures were
  deleted and recaptured.
- **Where a trigger doesn't exist in the original,** the page is captured as
  it is and the gap is logged:
  - `crm-view-options` has no "View" button (the original's column menu is
    named differently).
  - `contribution-fund-correction` has no Correct fund designation entry in
    the original sheet.
  - `studio-nav-mobile` has no mobile navigation trigger in the original at
    390px.
- **Defects the new original captures show:** clicking the CRM row actions
  menu also opens the record drawer, and the drawer shows gift totals at
  100x. In the original sheet, Send receipt posts the operation directly,
  which is the product's direct action.
- **Shared panel additions,** all tested in `data-grid-panel.test.tsx`
  (12/12 pass):
  - `createDataGridSelectionColumn`: row checkboxes named "Select {record}",
    in a flex box sized for a table cell.
  - `view` and `DataGridViewToggle`: restore Contributions' original desktop
    table/cards switch.
  - `labelledBy`: names the grid region from its visible heading.
  - A bottom rule only when pagination or a footer follows, which removes
    the empty strip under empty states.
- **Users label:** the stock Payload heading read "Cms Users". The
  collection now sets `labels: { singular: "User", plural: "Users" }`,
  built red to green in `tests/unit/cms/collection-contracts.test.ts`.

### Round 3 fixes and integration (resumed session, 2026-11-08)

The orchestrating session hit its usage limit while two fix agents
(`fix:crm:3`, `fix:studio:3`) were mid-run. Their journals and transcripts
were read and every QA round 3 finding was checked against the code. The
agents had landed the CRM fixes (row menu propagation, shared search clear
button, card meta lines, relationship KPI skeletons, owner lookup, sort
selects, cause-neutral error copy, hidden rollback badge) and the Studio
fixes (compact phone document chrome, sort menu default, reference IDs,
giving-page naming, sort-aware card meta, select hints, template
permission gate, count units, wrapping title). The lead then finished the
integration pass:

- **Import map:** regenerated with `bun run cms:importmap`, which restores
  the committed header; Prettier on 11 files.
- **Lint suppressions:** pruned with `lint.mjs --prune-suppressions`. Only
  entries for files this run changed were removed; admin lint passes.
- **Regression: Web Studio filters (functional).** `NativeCollectionGrid`
  deep-imported Payload's `WhereBuilder`. That module tree reads Payload's
  providers from separate files, not the client bundle the admin providers
  come from, so it saw no translations or permissions: operators showed raw
  keys (`operators:equals`), the label column was empty and only ID was
  offered. The original stock list had working filters. Replaced with
  Core's shared `FilterBuilder` (inline) plus
  `payload-where-filters.ts`, which maps Payload fields to filter
  definitions and converts state to and from Payload's `or`/`and` where
  (19 tests). Browser-verified: six readable fields, "contains", URL where,
  rows 10 → 1, badge 1, survives reload. Shared `FilterRow` now gives the
  value input the remaining width (`min-w-40 flex-1`) so a condition fits
  one line.
- **Regression: Revert to published (functional).** The deep-imported
  Payload `Status` had the same disconnected providers and could never
  offer the revert. `NativeRevertToPublished` now performs Payload's revert
  (read published, PATCH it back) with the client-barrel hooks and Core's
  `AlertDialog`, then reloads the view, because Payload's document state is
  client state a route refresh does not reset (8 tests). Browser-verified
  on local page 13: draft created through the REST API, reverted through
  the UI; title, status and button all correct afterwards.
- **Contract regressions** (found by running the full suite on the
  original worktree for comparison; the original fails the same 144
  Windows-environment tests in 31 files): `routes.test.ts` pinned the dead
  `/contributions/batches/new` shortcut that the home hillclimb replaced, so
  it now checks a real route; two menu labels moved into the groups they
  label (Studio account menu; vendored column-header filter slot, recorded
  as README adaptation 6); three triggers with `render=` children moved
  their content inside the rendered element (CRM export, Studio preview,
  document Details).
- **Not a regression:** the remaining Next dev "1 Issue" is the shared
  `PageShell` motion hydration mismatch under reduced motion, recorded as
  pre-existing by the home hillclimb.
- **Open polish:** the CRM board has no add-filter control (filters are
  set from the table view).

### Round 1 preparation (2026-11-08)

- Twelve Studio states added to the catalogue for QA round 3 coverage
  (filters, view and sort menus, filtered empty, giving edit, phone Details
  and Preview, create-flow errors and template picker, hub status error,
  templates error), captured with new `freshPerWidth` and `routes` hooks on
  both A and B; `clickFirst` treats a disabled trigger as missing.
  `contribution-fund-correction` is n/a (neither version offers it).
- Fixed quality reference: `references/reui-c-data-grid-22-light.png`
  (official ReUI preview), given to both reviewers in every round.
- `write-briefs.mjs` now asks for per-category reasons, the screenshots
  actually opened, component fit and integration, missing verification and
  whether a substantive issue remains.
- Checks on candidate-1: axe states 56 (A) → 19 (B); grid keyboard failures
  11 → 2 (hub skeleton timing). Pre-review fixes: `Item render={<div />}`
  for Studio and hub cards; Payload's unnamed preview icon button removed
  from the action bar. Studio recaptured and rechecked after them;
  checkpoint `round1` refrozen afterwards.

### Round 1 council (started 2026-11-08)

Original (A) vs checkpoint `round1` (B, diff sha256 `8836e61f…`), six fresh
read-only tasks with identical evidence, counterbalanced order
(`snapshots/round1-<area>-<reviewer>-brief.md`):

| Area          | Claude Opus 5.5 (claudeAgent, effort high) | GPT-6.1 Sol (codex ChatGPT Pro, reasoningEffort high) |
| ------------- | ------------------------------------------ | ----------------------------------------------------- |
| CRM           | delegate-task 882e9bd5                     | delegate-task 7836e836                                |
| Contributions | delegate-task 22490963                     | delegate-task 8407d475                                |
| Web Studio    | delegate-task 8cf8ef35                     | delegate-task 92a76e55                                |

- **GPT launch failure (environment, not review):** the three GPT tasks
  failed at start: "Cannot create Codex shadow home entry 'state_5.sqlite'
  ... already exists and is not a symlink" in
  `~/.t3/userdata/providers/codex/codex_3b390d41-…/shadow/`. A Codex run at
  02:45 left a regular `state_5.sqlite` (+ `-shm`, `-wal`) where T3 expects
  a symlink to `~/.codex`. The files were moved (not deleted) to
  `shadow-stray-backup-20261108/`. A relaunch works but the child recreates
  the regular file, so GPT reviews run one at a time with the stray files
  moved aside between launches. CRM (GPT) relaunched as delegate-task
  310a99a4; Contributions and Web Studio follow.
- **Full unit suite on checkpoint `round1`:** 144 failed / 11,147 passed in
  1,117 files; the 31 failing files are exactly the original's Windows
  baseline set (no new failures, none fixed).

### Round 1 outcome and round 2 plan (lead decision, 2026-11-08)

Round 1 complete (6/6). Both reviewers prefer B in every part (B means
7.2–8.6, none 9). Disagreements and dismissals, resolved on evidence:

- **Studio row selection (GPT blocking, Claude important): dismissed as a
  capability loss.** Verified on A (port 3031): ticking rows shows no count
  and no Delete/Edit/Publish action; A never rendered Payload's
  `ListSelection`. The checkboxes were decorative. Bulk actions would be new
  scope.
- **Studio Group by (GPT): accepted.** A's "Columns & filters" exposes a
  working Group by (field + order). B drops it. Restore it.
- **Users / Tenants / Versions stock tables:** polish; deferred unless cheap.

Round 2 batch (one candidate, all three areas):

- Contributions: request-bound correction context (proposed values and
  requester from the detail API; Approve disabled when the change cannot be
  read) [GPT blocking]; reachable bulk selection bar [both]; named column
  filter popover [both]; donor and gift identity in the refund dialog
  [GPT]; cause-neutral load error copy [Claude]; compact phone summary
  [GPT, Claude]; long donor names wrap in cards [GPT].
- CRM: Notes and Relationships continue past 50 and page within the panel
  [GPT]; compact phone Relationships summary [both]; owner name from the
  detail API instead of a client search [Claude]; desktop name width and
  header spacing [both]; "Resend receipt" when already sent [GPT]; board
  counts marked as loaded [Claude].
- Web Studio: Group by restored [GPT]; filters never rewrite a where the
  builder cannot represent [GPT]; Trash with one chrome, Trash copy and
  trash row links [both]; phone cards keep tenant and the missionary ID
  [GPT]; error-state evidence recaptured [both]; Versions/API breadcrumb
  keeps the document title [Claude]; phone dashboard puts Your documents
  first [GPT]; create-form placeholders read as examples [Claude].

### Round 2 implementation progress (lead, 2026-11-08)

Done (TDD where behaviour changed; focused suites green):

- **Contributions:** correction approvals now show each request's own
  change, built server-side from its payload by
  `packages/api/.../correction-request-change.ts` (amount, fund,
  missionary, designation lines, payment status, refund amount, donor
  relink) plus the requester's name; Approve is disabled with an
  explanation when the payload cannot be read. The attention-summary
  plumbing is removed. `correctionEffectiveValues` moved to its own module
  (shared by the operation and the describer). Fixture payloads corrected to
  the real `amount` key. Sticky, opaque selection bar (shared panel).
  Named column filter popover (ReUI adaptation 7). Donor and gift date in
  operation dialogs. Cause-neutral load error copy. Compact phone summary
  rows. Donor names wrap in cards.
- **CRM:** Notes and Relationships hooks page by cursor (`useInfiniteQuery`);
  both grids use the bounded virtual body with load-more (shared
  `crm-virtual.ts`, reused by records). Owner name comes from the CRM
  detail API (profiles), and the client search hook is deleted. Name column
  `minSize` 280 (identity before tags at 1440px; tags return on wider
  panels); wider Last gift / Lifetime giving columns. Compact phone
  Relationships KPIs. "Resend receipt" when the receipt was sent. Board
  count badges say "loaded" while more pages exist.

Next: Web Studio (Group by, compound filters, Trash, phone card context,
breadcrumbs, dashboard order, placeholders), then gates, recapture and
round 2 council.

- **Web Studio:** Group by restored as a ReUI-style toolbar menu
  (`grid-group-by-menu.tsx`: field + order, written to Payload's `groupBy`;
  Payload renders grouped tables server-side, shown inside the same Card).
  Filters use the shared `FilterBuilder` mapped to Payload's canonical
  `{or:[{and:[…]}]}` where (`payload-where-filters.ts`); a where the panel
  cannot represent is never rewritten — a notice and Clear filters instead.
  Trash is a native list (one chrome, "{title} trash", "Back to {noun}",
  trash row links); the Trash link only appears when the collection enables
  trash (none do today, so Trash copy is honest about it). Phone cards keep
  the sorted column and tenant; the missionaries hub shows each
  missionary's ID. Revert to published rebuilt on the Payload barrel hooks
  (the deep import never shared providers, so it never worked). Phone
  dashboard puts Your documents / Recently updated first. Create-form
  placeholders read "e.g. …".
- **Deferred with reason:** Versions/API breadcrumb document title — the
  Payload template header slot has no document context, so it needs an
  upstream slot or a fork of the stock view; Users/Tenants/Versions stock
  tables — polish with a larger blast radius than this round.

### Round 2 evidence conditions (lead, 2026-11-08)

- **Harness fix: shared CMS state leaked between captures.** Payload
  autosaves a draft when its stock create view opens, so each
  `studio-page-create` capture left an untitled page (16 by now), and the
  pages list preference held a stale sort (`-title`), page size 10 and, after
  the first grouped capture, `groupBy=_status`. Both versions share the
  database, so both were affected. `resetStudioState` (studio-fixtures.mjs)
  now deletes untitled pages and the pages list preference before the run
  and after every Studio state, in capture and check.
- Because of that, the original's whole Studio area is recaptured on the
  clean database for round 2, not only the new states.
- New states: `studio-pages-grouped`, `studio-pages-group-menu`,
  `crm-relationships-more` (coverage.md).

### Round 2 gates (lead, 2026-11-08)

- Typecheck (admin, ui, api, database): pass. Admin and ui lint: pass after
  three fixes the design-system lint caught in round 2 code (CardTitle
  alignment via `justify-self-*`, `grid-cols-2` instead of an arbitrary
  grid, no `tabular-nums` restyle on Badge; CardAction `sm:flex`).
  `importMap.js` regenerated (`bun run cms:importmap`) after the dev server
  rewrote it.
- Full unit suite: one new failure versus the Windows baseline,
  `admin-crm-cache-stability-contracts` (a source contract expecting
  `fetchCrmRelationships({ domains, …`; the paging change put `after`
  first). Argument order restored; the contract and paging suites pass
  (21/21). All other failures are the 31 baseline files.

### Round 2 council (started 2026-11-08)

Original (A) vs checkpoint `round2` (B, diff sha256 `e79ebb5c…`, 174
files), A recaptured for Studio on the clean database. Order swapped from
round 1 (Claude sees B first, GPT sees A first). Verification:
`round2-verification.md`. Same reviewer identities and rubric. Pre-launch:
the trash view without trash enabled now shows only its empty state (no
toolbar or pagination); recaptured and rechecked before freezing.

| Area          | Claude Opus 5.5 (claudeAgent, effort high) | GPT-6.1 Sol (codex, reasoningEffort high)  |
| ------------- | ------------------------------------------ | ------------------------------------------ |
| CRM           | delegate-task 977165f3                     | delegate-task 0ef2d86c (2 launch failures) |
| Contributions | delegate-task e144b60a                     | delegate-task b7c7ee11                     |
| Web Studio    | delegate-task 9c3acf04                     | pending (sequential)                       |

- The stray regular `state_5.sqlite` in the Codex shadow home was back;
  moved (not deleted) to `shadow-stray-backup-20261108-r2/` before the GPT
  launch. GPT reviews run one at a time.
- Implementation files stay unchanged while reviews run.
- GPT CRM 9e20e536 failed to start: a regular `db-backups` directory in the
  Codex shadow home ("already exists and is not a symlink"). Moved (not
  deleted) to the same backup folder; relaunched as facfa5a7.- facfa5a7 failed the same way on `thread_history_1.sqlite-shm`. Every
  regular (non-symlink) entry left in the shadow home was then moved aside
  together: `models_cache.json`, `tmp`, and the stale (13:00/13:30)
  `thread_history_1.sqlite-shm`/`-wal` sidecars from an earlier child run;
  the live `~/.codex` files were not touched. Shadow home now holds only
  symlinks. Relaunched as 0ef2d86c.- After GPT CRM completed, its Codex server kept the recreated shadow
  files open (busy), so they stay; the Contributions launch reused the
  running server and started normally.

### Round 2 findings triage (lead, read-only while GPT Studio runs)

- **"Tenant Loading…" on ministry-update phone cards: capture timing, not a
  bug.** A probe at 390px (fresh load, and desktop then resize like the
  capture) shows "E2E Tenant" on every card after the lookups return.
- **Blank API JSON pane: capture timing.** The probe renders the document
  JSON with the Studio header and tabs.
- Harness: `capture-workspaces.mjs` now waits up to 15s for Payload
  "Loading…" placeholders to clear before each screenshot.
- **Received counts refunds (both reviewers): confirmed.** `amountCents` is
  the gross `donation.amount`; refunds are `refundedAmountCents`;
  `summarizeContributions` buckets by grid status, while the Status filter
  (issue #274) and should-be badge use the shared payment status. No
  OpenSpec contract defines the hub summary; under "preserve financial
  truth" the round 3 fix nets refunds, counts by shared payment status and
  shows the effective status badge.

### Round 2 outcome and round 3 plan (lead decision, 2026-11-08)

Round 2 complete (6/6, `review/round2-results.md`). Every review prefers B
in every part; B means rose to 7.4–9.0 (round 1: 7.2–8.6), with the first
9.0s. Bar not met; not a plateau. Accept checkpoint `round2` as the current
best and repair. Round 3 is the 3-round checkpoint.

Disagreements resolved on evidence:

- **Studio row selection (GPT again):** round 1 showed A's checkboxes did
  nothing. Rather than argue it, round 3 makes selection real: Payload's
  barrel exports `SelectionProvider`, `useSelection`, `ListSelection` and
  Edit/Publish/Unpublish/Delete Many, and the list view receives
  `disableBulkEdit`/`disableBulkDelete`/`hasDeletePermission`. B gains bulk
  actions A never had, inside Core's selection bar.
- **"Tenant Loading…" / blank API pane:** capture timing (probe); harness
  fixed, not product work.
- **Received vs refunds:** confirmed in code (see triage above).

Round 3 batch:

- Contributions: Received net of refunds, counts by shared payment status,
  effective status badge [both]; compact phone summary [both]; phone sort
  [Claude]; evidence for phone selection, mobile correction, empty and
  error [both].
- CRM: scrollable note dialog [GPT]; Ctrl/Cmd+Home/End reach the logical
  first/last row through virtualization [GPT]; compact phone Relationships
  summary [both]; banner and button agree on "Resend receipt", Views menu
  selected state, "Toggle columns" sentence case, Export disabled on load
  error [Claude]; evidence for gift-row menu, Resend receipt, relationship
  details, long note, narrow empty/error, drawer scrolled to gifts [both].
- Web Studio: relationship (Tenant) filters [GPT]; real selection with
  Payload bulk actions [GPT]; column reorder through Payload's
  `moveColumn` with accessible controls [GPT]; grouped lists without
  decorative selection, usable on phones, keeping Sort/View [both]; View
  and Group by limited to suitable fields, consistent casing [Claude];
  settings dialog switch layout and picker focus ring [Claude]; compact
  empty "Your documents" so Collections rises at intermediate widths [GPT].
- Still deferred unless cheap after the above: Versions/API breadcrumb
  title, stock Users/Tenants/Versions tables and their inherited axe
  findings.

### Round 3 implementation progress (lead, 2026-11-08)

- Contributions: Received is net of refunds, with the refunded total on the
  card ("49 gifts completed · $270.00 refunded"); completed counts follow
  the shared payment status; badges show the effective status
  (`effectiveContributionStatus`). Compact two-column phone summary. Sort
  control for card layouts (phones and card view) via the shared
  `DataGridSortSelect` (moved from CRM into `packages/ui` data-grid-panel).
- CRM: note dialog uses the shared `scrollable` DialogContent;
  Ctrl/Cmd+Home/End scroll a virtualized body to the edge and focus the
  logical first/last row (shared `data-grid-row-keyboard.ts`); compact
  two-column phone Relationships metrics; pinned receipt action reads
  "Send or resend receipt"; saved views listed under a "Saved views" group;
  ReUI's "Toggle Columns" set to Core's sentence case through the panel's
  `i18n` override (vendored file untouched).
- Declined with reason: disabling Export when the records grid fails to
  load. The export is the donor report from its own route, independent of
  the grid's query, so it can still succeed.
- Web Studio:
  - **Relationship filters restored** (GPT A→B regression): a single-
    collection relationship (Tenant) is a select/multi-select filter whose
    options are the related documents, loaded through Payload's REST API with
    the viewer's access (`relationship-filter-options.ts`); Payload's numeric
    ids read back from links. Polymorphic relationships stay out.
  - **Real selection with Payload's bulk actions** (GPT): the list view
    wraps Payload's `SelectionProvider`; grid and phone-card checkboxes drive
    it; Core's selection bar hosts Payload's own Edit/Publish/Unpublish/
    Delete Many (their permissions, confirmations and requests), gated by
    `enableRowSelections`, `disableBulkEdit`, `disableBulkDelete` and the
    delete/trash permissions, as Payload's `ListSelection` does. A had only
    decorative checkboxes; B now does what they implied.
  - **Column order restored** (GPT): the View panel (Popover) shows/hides
    columns and moves them up/down with named buttons, saved through
    Payload's `setColumns` (its column preferences). Headers keep one-click
    sort (an attempt with ReUI's header "Move to left/right" turned every
    header into a menu, unlike CRM/Contributions, and was dropped).
  - **Grouped lists:** Payload's grouped-table checkboxes now select through
    the same provider and get the same bulk bar; Sort and View stay while
    grouped; phones give the tables the card's width; the tables read as
    the grid (scoped CSS: muted header row, row rules, plain title links).
  - Group by offers only fields that form groups (no free text); filter,
    group-by and column labels share sentence case ("Page type").
  - Switch fields (shared `AsymSwitchField`): label and description stack
    with the switch beside them (settings dialog).
  - Empty "Your documents" states are compact so Collections rises.
- Deferred with reason: the template picker's search focus ring (shared
  `SearchableSelect`; cosmetic; needs a cross-app check), the Versions/API
  breadcrumb title and the stock Users/Tenants/Versions tables.
- Harness: phones for every empty/error/correction state and the other create
  flows; `crm-drawer-gifts` truly scrolls; phone selection kept in view;
  seven new states (coverage.md, "Round 3 additions").
- Found while capturing round 3: the receipt operation dialog said "Send
  receipt … to the donor again" for every gift. It now reads "Resend
  receipt" (title, description, submit) once a receipt was sent and "Send
  receipt … to the donor" otherwise (`operationCopy` in operation-shell),
  matching the gift row's button. Tests updated (operation shell, CRM gift
  entry); the two receipt states recaptured.
- Full unit suite after round 3 code: one non-baseline failure, the list
  view test lacking Payload's router adapter for the new SelectionProvider
  (the app provides it); the test now stubs the provider like the others and
  gains a bulk-gating test. Everything else is the 31-file Windows baseline.

### Round 3 council (started 2026-11-08, the 3-round checkpoint)

Original (A) vs checkpoint `round3` (B, diff sha256 `4fa3971b…`, 181
files; frozen after regenerating the import map). Both versions fully
recaptured on the same harness. Order: Claude sees A first, GPT B first
(swapped back from round 2). Verification: `round3-verification.md`.
Checks: axe states A 67 / B 4 (stock Payload only); grid keyboard A 11/14
fail, B 0/14; no overflow.

| Area          | Claude Opus 5.5 (claudeAgent, effort high) | GPT-6.1 Sol (codex, reasoningEffort high) |
| ------------- | ------------------------------------------ | ----------------------------------------- |
| CRM           | delegate-task 0eaf411f                     | delegate-task a0b8dc16                    |
| Contributions | delegate-task a94f826c                     | delegate-task be233d66                    |
| Web Studio    | delegate-task 1325167e                     | delegate-task d6c2fd7b (a0144e41 failed)  |

- Regular files in the Codex shadow home moved (not deleted) to
  `shadow-stray-backup-20261108-r3/` before the GPT launch.
- Implementation files stay unchanged while reviews run.
- GPT Web Studio a0144e41 failed at the provider: "401 Unauthorized:
  Provided authentication token is expired" (OpenAI responses API). One
  relaunch (d6c2fd7b) to let a fresh session refresh the token; no account
  switch or fallback. If it fails again the GPT seat is Blocked on the
  user's Codex sign-in.
- Checkpoint `round3` re-verified while reviews ran: no implementation file
  differs (only run.md and the verification note, which are records).

### Status: Blocked at the round 3 checkpoint (lead, 2026-11-08)

- The GPT reviewer seat cannot run: two launches failed with an expired
  Codex/OpenAI authentication token. The goal forbids switching accounts or
  configuring fallbacks, and the council needs both reviewers, so the run
  stops here as **Blocked** until the user signs Codex in again.
- Round 3 is the 3-round checkpoint. Current best: checkpoint `round3`
  (diff sha256 `4fa3971b…`, 181 files), uncommitted on branch
  `t3/sync-latest-and-use-skills`. Nothing merged, pushed or deployed.
- Round 4 plan, ready to start once the GPT seat works (needs that
  reviewer's Web Studio round 3 review first, or a fresh round 4):
  - Studio: phone cards print "<No Tenant>" below the fold (Payload's lazy
    RelationshipCell) — label from the loaded relationship options;
    grouped view parity and a capture proving grouped checkboxes and
    Unpublish in the ⋯ menu; untitled draft heading; Updated at on cards
    and at 1024; phone selection bar wrapping.
  - CRM: long notes open at the end (initial focus to the heading); Tag
    options from the dataset, not loaded rows; disabled "CRM posting
    unavailable" gift-menu items; Relationships dialog focus check;
    duplicate Last activity/Updated; plain-language subtitles.
  - Contributions: Copy transaction ID disabled or falling back to gift ID
    when absent; Needs attention count unit; phone header gap; receipt on
    phone cards; error icon tone; intermediate-width preamble.

## Phase 2: whole-admin hillclimb, one reviewer (user decision, 2026-11-08)

- The user resumed the run with a changed council: "continue for now with
  just Claude opus 5.5 … with one voter". The GPT seat is dropped until the
  user restores Codex, not replaced; no account switch, no fallback model.
- Scope widened to every Mission Control surface: all routes, views, tabs,
  fields, grids, tables, shells, icons, drawers, tooltips and dropdowns, plus
  Web Studio, CRM and Contributions from phase 1.
- Bar raised: every part ≥ 9.5 from the reviewer, hard requirements first.
  ReUI first for refreshed elements; shadcn base-maia on Base UI throughout.
- Same loop: inspect → independent criticism → hypothesis → implement (TDD)
  → capture → independent A/B comparison → accept/repair/reject; checkpoint
  every 3 rounds; the lead alone edits; the reviewer is read-only.
- Survey script: `survey-routes.mjs` (every route, 1440 and 390, missing
  fixtures, console errors, overflow) → `survey-b/`.
- Inventory (three read-only Explore agents, 2026-11-08): every route,
  its browser data, composition and code-visible problems. Headline:
  five navigation definitions; fake shell blocks (language, activity,
  notification bell — ADR-0027 calls the bell hard-coded demo
  presentation); Admin links to five unbuilt pages and shows invented
  "Operational" health; Sign Studio is static numbers and dead links;
  Member Care, Events, Feed, Mobilize, Teams and Support carry no-op
  controls, fake saves or hard-coded stats.
- Fixtures: `fixtures/module-fixtures.mjs` (Member Care, Locations,
  Workflows, Support Hub, Eve, Automations, Reports, Resend, Email and PDF
  templates), registered after the CRM/Contributions fixtures.
- Policy for modules without a backend: no control without a working
  handler, no success message for work not done, numbers derived from the
  data shown, and an honest empty state where a feature has no service.

### Phase 2 round 4 work (lead, in progress)

- Shell: one navigation source (`@asym/config/navigation`, role-filtered,
  with module sub-pages) for sidebar, breadcrumbs and search; demo
  language/activity/notification menus removed; header breadcrumbs;
  profile menu without stock avatar, fake presence dot or placeholder
  email ("Sign out", role and organization shown); tenant-named brand.
- Names unified across sidebar, search, home cards and page titles.
- Administration: only working destinations (Teams, Web Studio editors,
  Email delivery, Eve) as ReUI c-item-2 rows; no fake service status.
- Sign Studio: honest "not set up" page; out of the navigation.
- Home cards: copy rewritten to what each module does.
- Shared `MetricCard`/`MetricGrid` (packages/ui primitives) from the
  Contributions summary card, for every module's totals.
- Member Care: overview (metrics, follow-up list from the directory's own
  fields, birthdays, recent activity), directory on the shared ReUI grid,
  profile under PageShell with real details and working actions (toasts on
  failure), settings page honest; demo palette and no-op buttons removed.
- Hash-bound ledgers (payload-quality-qualification, react-doctor
  requalification, shadscan findings) will need requalifying before any
  commit; dead care files (UI.tsx, ShortcutsHelp, CareTools, PersonnelList,
  HealthHeatmap, TimezoneScheduler) kept until then because ledgers cite
  them.
- Mistake (lead, 2026-11-08): while clearing a failed Playwright run's
  output I ran `rm -rf test-results` without listing it first. That
  ignored, untracked folder also held raw evidence logs from earlier runs
  (home hillclimb red/green and gate logs, item-row source JSON, phase-1
  logs). Only the live dev-server log survived. The run records' written
  summaries of those logs remain; the raw files are gone and are not
  recreated.
- Further round 4 work (lead): Events (relative sample dates, derived
  metrics, token chart, schedule, attendee grid with real CSV export, dead
  actions removed); Ministry Updates (derived metrics, invented activity and
  "AI moderation" claim removed, no-op menu items removed, pin works);
  Organization updates (fake settings sheet and sample-image media removed,
  edit loads the post, publishing a draft moves it); Tasks on the shared
  grid (sentence-case labels, status and assignee filters, named done
  checkbox, delete confirmation, relative sample dates); Mobilize on the
  shared grid (working add form and stage moves, session-only like Tasks);
  Teams rewritten (grid, manage sheet that saves, new-team dialog, people
  grid); Support Hub (compact header, shared metric cards with Unassigned
  matching its tab, one AlertDialog confirm for every delete, sentence case,
  no internal phase copy, platform-neutral send hint, inbox error state,
  client-side mobile sub-nav); Reports (metric cards, horizontal bar
  charts, plain-sentence highlights instead of Markdown rendered as HTML);
  Automations (metric cards, placeholder telemetry and developer guidance
  removed, link to Workflow runs); Workflow runs on the shared grid with
  metrics and a fallback for unknown states (now in the navigation under
  Automations); email delivery under PageShell with a disconnect
  confirmation; About tidied; admin login hides Register and Forgot
  password (both dead ends); Locations renamed with an AlertDialog delete;
  PDF Studio toast-only menu items removed; Home's illustrative "Ministry
  health" widgets removed and its metrics on the shared cards.
- Harness: `module-states.mjs` (46 states across shell, people, support,
  tools) wired into capture and check; `write-briefs.mjs` gains the four
  parts and `BRIEF_AREAS`/`BRIEF_REVIEWERS`.
- Checkpoint `round4` frozen: 299 files, diff sha256 `89916164…`.
  Verification note `round4-verification.md`.

### Round 4 council (one reviewer, started 2026-11-09)

Original (A) vs checkpoint `round4` (B, diff sha256 `99b6a305…`, 300
files; re-frozen after fixing B's own new axe findings). Parts: shell,
people, support, tools (CRM, Contributions and Web Studio were reviewed in
rounds 1–3). Reviewer sees A first. Checks on the new states: axe A 42/63,
B 4/63 (pre-existing Support markup); no overflow. Sheets:
`comparisons/round4-ab/` (72). Briefs: `snapshots/round4-*-claude-brief.md`.

| Part    | Claude Opus 5.5 (claudeAgent, effort high) |
| ------- | ------------------------------------------ |
| Shell   | delegate-task e9952534                     |
| People  | delegate-task 25f67cff                     |
| Support | delegate-task f947f266                     |
| Tools   | delegate-task c49791e1                     |

Implementation stays unchanged while these reviews run.

Results (`review/round4-results.md`), B means:

| Area    | Parts (B mean)                                                                        |
| ------- | ------------------------------------------------------------------------------------- |
| Shell   | shell 8.3, home 7.9, administration and teams 7.8, settings and system 8.3            |
| People  | Member Care 8.5, Mobilize 8.2, Events 8.3, Ministry Updates 8.4, Tasks 8.3            |
| Support | inbox 7.2, reports 6.4, settings 7.0                                                  |
| Tools   | Reports 8.4, Automations 8.5, Workflow runs 8.0, Email Studio 6.4\*, PDF Studio 7.1\* |

\* four categories (no mobile evidence; canvases blank in both).

B preferred in every part. Regressions found: Mobilize sheet focus escape
(blocking), Support automations copy claiming a runtime, Teams "saved" for
session-only changes, `MetricCard` lost the failure emphasis, Reports
per-fund precision; dialog focus slightly worse on the search palette and
New team. Decision: **accept** `round4` as the baseline and repair in round
5 (regressions first). No part is at 9.5 yet.

## Round 5 (lead, started 2026-11-09)

Work list: the round 4 repairs above, then the round 4 important and polish
items, then the round 3 carry-overs (CRM, Contributions, Web Studio). Round
5 reviews all seven areas.

Round 5 work (lead):

- Harness: the dialog focus probe now measures where focus settles two
  frames after each Tab (Base UI moves focus through a guard on the next
  frame; the old probe read that frame as `document.body` in both
  versions). Traced in the Mobilize sheets: focus never leaves the dialog.
  Both versions are rechecked with the new probe. CRM fixtures answer the
  new `GET /api/admin/crm/tags`.
- Honesty: Support automations, round-robin and auto-resolve say they are
  saved but do not run yet (no runtime applies them); auto-resolve input
  labelled. One shared `SampleDataNotice` on every module that shows
  browser sample data (Teams, Mobilize, Tasks, Events, Ministry Updates,
  Organization updates), with session-only toasts ("for this session").
  Care settings no longer claims reminders.
- Shared UI: `MetricCard` tone (attention/critical: icon plus a named
  status, not color alone) used for failed runs, rules needing repair,
  past due, unassigned, waiting on staff; `MetricGrid` lays out by count
  (no lone card) and takes `busy`. `DataGridPanel` `view="auto"`: table
  when the columns fit, cards when they would not (Tasks, Teams, People,
  Mobilize, Member Care, Workflow runs, Funds, Support table). Grid error
  icon in the destructive tone.
- Shell: Eve moves into the header (floating only in Web Studio), so it no
  longer covers Send reply, table values or toasts; profile shortcuts
  follow the role and say "Teams"; avatar fallback is the person icon;
  About and Sign Studio get a breadcrumb; Home lists Ministry Updates and
  Tasks.
- Teams: members linked by team id (rename and delete stay correct), access
  list built from the navigation (no Sign Studio), phone cards.
- Workflow runs: four state buckets that add up, urgent callout, search and
  status filter (no empty band), phone cards with status and urgency,
  "Requested" for the request time.
- Reports: a Funds grid with exact giving in cents, share and last gift;
  the period and the 8-fund chart cap are stated; Highlights removed.
- Support Hub: conversation table on the shared ReUI grid (selection bar,
  pagination, view options, phone cards); conversation pane opens on the
  thread on phones (Reply / Internal note open the composer), one close
  button, keyboard-focusable thread, no nested list item; reports on the
  shared metric cards with one duration format, named table columns and a
  Customer waiting chart of wait times only; grouped settings side
  navigation; SLA durations in h/d; 1024 toolbar in one wrapping row;
  duplicate Urgent label dropped.
- People: event money and room rates in cents; Events tabs fit phones;
  Tasks copy in sentence case and the drawer titled by the task; Member
  Care region filter, rows that do not truncate on phones, sentence-case
  activity types; Mobilize row actions.
- Tools: studio page headings, PDF engine shown as a badge, the Email
  Studio developer pill removed; Automations links to Workflow runs and
  uses `ButtonLink`.
- Carry-overs: Contributions copies the gift ID when there is no
  transaction ID, attention count has a unit, receipt state on phone cards,
  no empty header row; CRM tag filter offers every tenant tag (new
  tenant-scoped `GET /api/admin/crm/tags`), long notes open at the title,
  retired CRM posting collapses to one menu note, plain-language copy,
  Relationships on the shared metric cards with Updated hidden by default,
  "Lifetime giving" on phone cards; Web Studio cards name the tenant from
  loaded options (no "<No Tenant>"), show Updated, and untitled drafts read
  "Untitled page".
- Lint: grid code imports the engine through `data-grid-engine.ts`; the
  ESLint config records the sanctioned boundary and keeps the vendored
  ReUI registry files' upstream hook lists (exhaustive-deps off for those
  listed files only).
- Checkpoint `round5` frozen: 354 files, diff sha256 `9e7675f4…`
  (home files now inside the freeze). Verification note
  `round5-verification.md`. Checks (both versions rechecked with the settled
  focus probe): axe A 73/190, B 4/190 (Payload's own versions, API and
  media-edit views, shared with A); no overflow. A late fix before the
  freeze: the phone sidebar's hidden menu tooltips caught the first Escape
  (both versions); disabling hidden tooltips lets Escape close the sheet
  (regression test added; state recaptured).
- Note for reviewers: the round "palm tree" button in captures is the
  dev-only TanStack Query Devtools trigger, not the Eve launcher (round 4
  reviewers read it as Eve).

### Round 5 council (one reviewer, started 2026-11-09)

All seven areas, Claude Opus 5.5 (claudeAgent, effort high), briefs
`snapshots/round5-*-claude-brief.md`, sheets `comparisons/round5-ab/` (213).

| Area          | delegate-task |
| ------------- | ------------- |
| CRM           | 385c27d9      |
| Contributions | df9af313      |
| Web Studio    | 0bad83ec      |
| Shell         | 784e8ab7      |
| People        | 77a732e5      |
| Support       | ba3a6c71      |
| Tools         | c80d4870      |

Implementation stays unchanged while these reviews run.

Results (`review/round5-results.md`): B preferred in every part of all
seven areas; part means 7.0–8.8, none at 9.5. New blocking finding shared
with A: home "Giving this month" treats cents as dollars. Regressions:
Member Care "Add requirement" removed; `MetricCard` phone header overflow;
Support wait-time unit labels; Workflow-run phone cards drop the record ID.
Decision: **accept** `round5` as the baseline and repair in round 6.

## Round 6 (lead, started 2026-11-09)

Work list: the round 5 blocking and regression items first, then the
important and polish items from `review/round5-results.md`, all seven
areas.

Round 6 work (lead):

- Money: home "Giving this month" reads `donations.amount` as cents
  (`revenueThisMonthCents`, divided by 100 where it is shown); the home test
  now asserts 5000 cents as "$50.00".
- Regressions repaired: Member Care's care plan sets a contact rhythm again
  (Contact, Every (days), Note, "Add rhythm" through
  `useUpsertCareRequirement`), and saved goals show because the plan reads
  the same care gaps the API refreshes; `MetricCard` puts the icon in the
  label row (no two-column header on phones); Support wait-time labels drop
  the "(min)" suffix; Workflow-run phone cards show the record ID and wrap
  long titles.
- Home: honest "Common tasks" (where each kind of work starts for the
  role) instead of "Suggested workflows"; a "Needs attention" summary from
  the Contributions needs-attention data (renders nothing when nothing is
  waiting); catalog badges "Not in your role" and "Not set up".
- Shell and administration: Web Studio editors in the Administration menu;
  About copy in plain language; Teams' "+N" count stays with the last
  module badge; the Eve card description fits two lines on phones; profile
  menus with no name show the role and organisation, else "Your account"
  (also Web Studio's top bar); Eve's policy JSON behind "Edit policy JSON".
- Contributions: the detail sheet's three disclosures use the shared Base
  UI Collapsible (a real button with `aria-expanded`, chevron on every
  expandable row only, panel hidden until found); card view cards match in
  height (shared `DataGridPanel` change); receipt "Queued" instead of a
  second "Pending"; "Needs attention" title no longer wraps at 390.
- CRM: Relationships columns and footer in staff language, default sort by
  last activity; notes toast and empty copy; "Resend receipt" when a
  receipt was sent; muted menu group names; compact column tier keeps row
  actions on screen at a 1024 window.
- People: Mobilize "Remove from pipeline" (row menu and sheet, confirmed in
  an alert dialog, session collection delete handler) for candidates who
  withdraw or are not selected; Care profile sections from a select on
  phones (Private notes no longer hidden off the edge); Tasks phone cards
  get the Done checkbox, one date format, the drawer no longer repeats the
  title; Ministry Updates and Organization updates lose the legacy motion,
  uppercase labels and `rounded-2xl` overrides, sentence-case labels,
  readable post types, audience shown at every width, dead `add-media`,
  upload and settings state removed; Events "Checked in".
- Support Hub: the conversation sheet renders only below desktop (no
  duplicate pane); the table loses the duplicate search and trims column
  widths; inbox views as a select on phones; SLA "Make default" button;
  round-robin, auto-resolve and assignment rules are shown read-only as
  "Not available yet" (nothing runs them).
- Tools: Automations status badges by state ("Needs repair" for invalid),
  On/Off switch removed (no runtime applies it), Retry on errors in
  Automations, Workflow runs and Reports; Funds grid right-aligned numbers;
  Resend settings on the shared metric cards with readable warning titles;
  Email and PDF Studio labels in sentence case, "Free mode".
- Web Studio: grid list view switches to cards when columns would not fit
  (`view="auto"`); Payload's own cells (grouped tables, stock views) use
  the short date format the grid uses (`admin.dateFormat`
  "MMM d, yyyy, h:mm a"); phone card details wrap under their label instead
  of truncating the date; page-builder internals (layout sections,
  body text, the fallback switch) are hidden from list columns, filters and
  grouping through Payload 4's `admin.disabled` (the filter and group menus
  read Payload 3's `disableListFilter` and `disableGroupBy`, which Payload
  4 no longer has, and now honour `admin.disabled`); plain-language field
  labels and descriptions for those fields; the inspector says "Unpublished
  changes: None" instead of "Unpublished 0"; untitled saved documents read
  "Untitled (ID)" in the editor as in the lists; the empty "Your documents"
  states are one-line notes, so Collections is not pushed down at 1024.
- Shared grid: no "0 - 0 of 0" pager on an empty grid; card-view cards fill
  their grid row; the selection bar's Clear is an icon with its name on
  phones, and its live region stays in the page empty, so the first count
  is announced.
- Contributions (late): the updated-receipt email option shows the donor's
  address on its own line (it wrapped mid-address at a hyphen on phones).
- Tests: the motion contract now asserts admin Feed has no exit animation
  (its strips mount and unmount at once) instead of requiring
  `AnimatePresence` there.
- Known limits kept and stated: the Contributions hub still totals in the
  browser over pages of 100 (the server caps a page at 100; server-side
  totals with filter parity is a data-layer change outside this UI work);
  Teams and Mobilize stay session-only sample data.
- Checkpoint `round6` frozen: 375 files, diff sha256 `8c4ae0af…`
  (verified, no mismatches). Verification note `round6-verification.md`.
  Checks on B: axe 4/190 (unchanged: Payload's versions, API and
  media-edit views, shared with A; A 73/190); no overflow; every dialog
  keeps focus and closes on Escape. Sheets `comparisons/round6-ab/` (213).

### Round 6 council (one reviewer, started 2026-11-09)

All seven areas, Claude Opus 5.5 (claudeAgent, effort high), briefs
`snapshots/round6-*-claude-brief.md`, sheets `comparisons/round6-ab/` (213).

| Area          | delegate-task |
| ------------- | ------------- |
| CRM           | 1db8d606      |
| Contributions | 6654c730      |
| Web Studio    | 5e785974      |
| Shell         | b036166e      |
| People        | b643a5af      |
| Support       | 56f1eda2      |
| Tools         | 4746ed4e      |

Implementation stays unchanged while these reviews run. Planned for round
7 regardless of scores: Web Studio's grouped view on the shared grid
(Payload 4 passes `groupedData` to the client list view; per-group pages
through `queryByGroup`).

Results (`review/round6-results.md`): B preferred in every part of all
seven areas; part means 7.0–8.8, none at 9.5; no blocking finding.
Regression from round 5: card views overlap at 1024 (shared card track).
Decision: **accept** `round6` as the baseline and repair in round 7.

## Round 7 (lead, started 2026-11-09)

Work list: `review/round6-results.md` "Round 6 summary", in order.

Round 7 work (lead):

- Regression: card views no longer overlap at 1024; the shared card `<li>`
  is `grid grid-cols-1` (a `minmax(0, 1fr)` track), so a long truncated
  title cannot widen a card past its slot (every card view).
- Shell: the app header and every sticky toolbar now actually stick. The
  content column had `overflow-hidden` and the main area `overflow-auto`
  without a height, so the never-scrolling column was the sticky container
  (also true in A); both now let the window scroll (`min-w-0`, no overflow
  clip), and the checks report no horizontal overflow.
- Support Hub: round-robin, auto-resolve and fallback-agent controls are
  gone (nothing runs them); the Assignment page explains how a
  conversation reaches an agent today. The desktop conversation pane is
  sticky and one screen tall, scrolls into view when a conversation opens,
  is wider (5 of 12 columns), and its header lays out by its own width
  (container query); the composer is compact (Macros as an icon in its
  footer, no duplicate hint row), so the thread keeps room. The board's
  lanes follow the board's width (1, 2 or 4 per row) with no sideways
  scroll. Table: a conversation count beside View and an ID column under
  View. Agents report counts unassigned conversations apart; the waiting
  chart plots hours; settings group "Routing" with "Inbox identity" (Inbox
  names only the top tab); no empty side-nav column on phones; the phone
  sheet focuses the thread first; automations copy no longer contradicts
  itself; report tables on the shared Card and Table.
- Reports: "Summary" opens the giving summary as plain text (exact
  amounts, top fund and its share) with Copy; the old Quick Summary's
  markdown-through-HTML is gone.
- Workflow runs: donation, donor and conversation-move runs link to their
  record (Contributions gift sheet, CRM record, Support conversation);
  internal records stay plain text. Attempts right-aligned; phone cards
  name the module; the error alert has a title (page test added).
- Home: each needs-attention kind links to Contributions filtered to it
  (`?attention=` opens the grid with that filter and More filters open);
  "The 3 most urgent of N kinds are listed"; retired CRM posting is left
  out of Home's work.
- Web Studio: grouped lists render each group on Core's grid (heading and
  count, same columns, sort and selection, cards on phones, per-group pages
  and sizes through Payload's `queryByGroup`); grouped rows never borrow
  the flat page's rendered cells and name relationships and select options
  themselves. Plus: no View menu on phones (cards show no columns), one
  clear control on a filtered empty list, editor subtitle shows the address
  only, plain-language giving field help ("Missionary ID", "Search
  description"), no filters around a failed template list, Collections
  second where the dashboard stacks, and the Missionaries hub offers "View
  giving pages" (and says why Create is hidden) when status fails.
- Eve operations: four tabs (Overview, Approvals and budgets, Policy and
  memory, Connections) after the full panel index (spec: operations first,
  every surface reachable); index links and #section URLs open the right
  tab; the page is 2,877px instead of ~6,100px.
- CRM: Relationships put the type on the name's line and mark names that
  open the CRM record with an arrow; Notes shows its data source only when
  it needs attention; phone cards keep the record type visible.
- Contributions: the inactive selection bar makes no box (no 16px band
  above toolbars); selected table rows tint at full muted (shared ReUI
  table); the error state's icon is destructive; "Import review"; phones
  name every other needs-attention kind; orphaned JSDoc merged.
- People: Feed posts expand ("Show more") instead of clamping, and the
  toggle appears only when the text actually runs past its lines (measured,
  and again on resize), so a post that fits shows whole; post dates
  no longer wrap on phones; Care profile dates use the locale hook; Tasks
  titles wrap to two lines; Mobilize's remove button is outline (the
  confirmation is destructive); the attendee CSV URL is released after the
  download starts.
- Tools and shell copy: rule keys read as titles ("Giving: thank you
  email", searchable), plain automations copy, Funds phone cards show the
  last gift and the grid uses the full width, "Available features",
  "Untitled email", the Email delivery header no longer repeats
  "Connected", the Eve card fits two lines on phones.
- Kept and stated: the CRM drawer timeline keeps gifts (it is the record's
  chronology and money tests pin each entry's exact amount); nested
  dialogs keep Base UI's single backdrop; `/care/settings` stays an honest
  unlinked page (route coverage indexes list it); unused
  `EmailStudioProviderStatus` and `CareTools` stay (hash-bound ledgers);
  Teams and Mobilize stay session sample data; Contributions totals stay in
  the browser; Users, Tenants, Versions, API and Account stay Payload's
  stock views, and the Versions/API breadcrumb still lacks the document
  name (needs Payload's step nav in the Studio header).
- Harness: captures and checks sign in again every 15 minutes (the demo
  session expired mid-run and later states captured the sign-in page) and
  wait for the page heading when a state names no ready text (skeleton
  captures on a slow dev server); the checks save after every measurement,
  so areas run separately and a stopped run keeps its results; evidence
  folders are ignored by a `.gitignore` inside the hillclimb folder.

### Round 7 council (one reviewer, started 2026-11-09)

Checkpoint `round7` (398 files, diff sha256 `6f859e08…`), verification
`round7-verification.md`, sheets `comparisons/round7-ab/` (213). Checks on
B: axe 4 of 190 (Payload's stock Versions, API and media edit views; A
73), no overflow, every modal dialog contained, focus kept and closed by
Escape, row keyboard 14 of 14 (A 3). Seven read-only Claude Opus 5.5
(effort high) reviews, briefs `snapshots/round7-*-claude-brief.md`:
CRM `13ff7095`, Contributions `26c08401`, Web Studio `023bcbd6`, shell
`250566ce`, people `e0f64683`, Support Hub `e6049db7`, tools `d7041f4d`.
Implementation stays frozen until they return.

Round 7 outcome: B preferred in every part of every area (means 7.1–9.0,
none at 9.5), no blocking finding; one regression (Studio Tenant cells
"Loading...") and one partial regression (Support Open/Pending report).
Accepted as the baseline; work list in `review/round7-results.md` "Round 7
summary".

## Round 8 (lead, started 2026-11-09)

Work list: `review/round7-results.md` "Round 7 summary", in order.

Round 8 work (lead):

- Web Studio (regression): relationship cells use the label the grid has
  already loaded, so the Tenant column never shows Payload's "Loading...".
  Grouped tables put each group's heading in its card's top row (no empty
  band), use fixed widths so every group's columns line up, and the shared
  toolbar sits in a card as above the flat list. Phone card titles wrap to
  two lines. Missionaries phone cards offer "View giving pages" when status
  fails. Versions and API name the document in the bar (from Payload's own
  step nav). Users and Tenants: every field the sign-in sync rewrites
  (email, sign-in ID, tenant, role; tenant name and slug) is read-only
  (field update access false; the sync uses overrideAccess) and says "Set
  from Mission Control at each sign-in"; an edit there was undone at the
  next sign-in, and a changed tenant slug would have orphaned the tenant.
  Plain labels ("Sign-in ID", "Tenant ID", "Active"); Users list shows
  email and role.
- Support: the desktop pane opens on the thread (Reply or Internal note
  opens the composer, Hide composer closes it, as on phones); status,
  owner, priority and labels share one wrapping row; Overview's "Open or
  pending" card says "N open · N pending" (A's table); subjects wrap to two
  lines; lanes are as tall as their cards (empty lanes keep a drop area);
  the Reports "Inbox" tab is "Messages"; unassigned work is a callout on
  Agents; quiet days, weeks and months chart at zero; a thinner focus ring
  on the thread.
- Workflow runs: the callout counts urgent runs ("2 urgent runs") with
  "Show urgent runs"; "Waiting on staff" is "Held for routing review"
  (inbound emails waiting to be routed, the only run that waits on a
  person); held runs say "No review screen yet: ask an administrator to
  route it" (there is no routing-review page; the fixture's pledge subject
  is not a type any workflow dispatches); the status filter lives in the
  URL (?status=), so Automations' "Check failed workflow runs" opens the
  failed runs; error codes stay beside urgent reasons; record types read
  as staff names ("Inbound email").
- Automations: acronyms keep capitals ("CRM: duplicate review"); "Rules
  needing repair" says each is marked Needs repair below.
- Shared grid: View (columns) stays off phones, where every grid shows
  cards (Tasks and every other grid).
- Tasks: reminders say they are not sent (sample tasks); drawer dates in
  the short form.
- Shell: the pinned header is opaque; Eve's index lists every panel without
  repeating the tab names (spec: index first) and the tab is kept in the URL
  (?tab=); Email delivery runs the page width, says a recommendation once
  (title, then what to do) and uses sentence case; Administration sub-nav
  matches the page order; Home lists modules in sidebar order.
- CRM: gift rows show the receipt state only (CRM posting is retired; the
  gift sheet keeps its history); opening a note clears a lingering save
  toast; the records toolbar shows the count; wide Relationships show
  Commitment and Contact columns; the pinned row action reads "… is the
  action on every gift" with "Use suggested actions".
- Contributions: every needs-attention group is named with urgency and
  count (desktop names those beyond the three cards); the receipts dialog
  speaks plainly ("Will be skipped", no "staged gift id"); the refund's
  cannot-be-undone note is destructive; card content is top-aligned; a
  failed copy says so.
- People: "Show more" lines up with the post text and measures once where
  there is no ResizeObserver (round 7's version threw there: two
  moderation tests failed in the full suite); Moderation's sample
  dates are relative to now; "Monthly Newsletter"; health signals and
  readiness are meters; Speakers says how many still need a session.
- Tools: PDF Studio's status is a shared Badge tone in sentence case, the
  toolbar no longer repeats "PDF Studio", "Untitled document".
- Kept and stated: the Contributions toolbar at 1024 still wraps More
  filters; the 1+2 phone metric grid is the shared three-card layout; the
  Saved views menu indents radio items (shadcn's radio layout); Payload's
  bulk buttons on phones and its bulk dialogs stay Payload's; Users and
  Tenants lists stay Payload's stock list (now with read-only synced
  fields); the media edit preview, filter chevron and View menu row heights
  are unchanged; Teams and Mobilize stay session samples.

GPT seat restored (user, 2026-11-09: "bring the codex agent back in"):
from round 8 the council is two reviewers again, Claude Opus 5.5 (effort
high) and GPT-6.1 Sol (`codex_3b390d41-…`, reasoningEffort high), same
identities as rounds 1–3, identical evidence in counterbalanced order, both
read-only. The Codex shadow home again holds a regular `state_5.sqlite`
(0 bytes, 19:53) beside a live T3 Codex app-server from 18:23 (another
session); it is left alone unless a launch fails on it.

### Round 8 council (two reviewers, started 2026-11-09)

Checkpoint `round8` (407 files, diff sha256 `93df8224…`), verification
`round8-verification.md`, sheets `comparisons/round8-ab/` (A left) and
`comparisons/round8-ba/` (B left), 213 each. Checks on B: axe 4 of 190
(Payload's Versions, API and media edit; A 73), no overflow, every modal
dialog contained, focus kept and closed by Escape, row keyboard 14 of 14
(A 3). Fourteen read-only reviews, briefs `snapshots/round8-*-{claude,gpt}-brief.md`
(Claude sees A first, GPT sees B first):

| Area          | Claude Opus 5.5 (high) | GPT-6.1 Sol (high) |
| ------------- | ---------------------- | ------------------ |
| CRM           | d39b80a2               | 46057e01           |
| Contributions | c1f60eb0               | 92e743d0           |
| Web Studio    | 8864eaf5               | 083ca621           |
| Shell         | abe3e44d               | ec15626b           |
| People        | aadd204b               | e6bba5d4           |
| Support Hub   | 9f111a7b               | a584b147           |
| Tools         | d4562b65               | 72c2a871           |

All seven GPT launches started without the shadow-home error.
Implementation stays frozen until they return.

Round 8 outcome: fourteen reviews, B preferred in every part by both
reviewers (Claude 7.1–9.0, GPT 7.6–9.0), none at 9.5, no blocking finding;
two round 8 regressions and a set of inherited important items. Accepted
as the baseline; work list in `review/round8-results.md` "Round 8 summary".

## Round 9 (lead, started 2026-11-09)

Work list: `review/round8-results.md` "Round 8 summary", in order.

Round 9 work (lead items 1–6; item 7 polish by six area agents with
disjoint file ownership, shared changes by the lead):

- Money: one strict amount parser (full-string decimal, grouping only in
  valid thousands, exact cents) for refund and correction, client and
  payload builder; "1,000.00" is $1,000.00 and "600abc" is refused.
- Round 8 regressions: report periods fill the selected range under the cap
  and otherwise keep every populated period (no dropped late activity);
  the Workflow runs status filter accepts its own six values only
  (`?status=constructor` falls back to All runs).
- Data truth: Support Notifications says nothing reads the preferences yet
  (no bell promise); saving a published update as a draft moves it to
  Drafts with its edits; Eve is hidden from roles its page refuses
  (sidebar, search, Home shortcut, Administration; server gate unchanged);
  Automations' run and failure cards name their source (activity log) and
  no longer link to Workflow runs.
- Shared grid: View hides whenever the panel shows cards (Tasks at 1024).
- Web Studio: the shared filter builder edits OR-of-AND groups (opt-in
  `allowGroups`); Studio round-trips grouped Payload queries exactly.
- Capture: waits for skeletons, busy regions and "Loading…" to clear, and
  for the PDF editor, API JSON and map; captures the Care plan tab and the
  1024 Contributions cards.
- Polish (shell, lead): Home attention badges right-aligned so titles line
  up; Eve's index grouped by tab in plain language and links keep `?tab=`;
  Teams status badges and right-aligned Members; "Open Resend dashboard".
- Polish (CRM): Type and Owner under the name when the width tier hides
  them; phone record count; one count after search; compact Reset; Notes
  names wrap to two lines; quieter pinned gift-action line; the virtual
  list height is measured from the panel's own top; phone Relationships
  summary is label and figure only (details for screen readers);
  Relationships hides sparse Contact/Commitment columns at every width
  (values under the name).
- Polish (Contributions): status facets count each gift once (Pending
  excludes Processing); batch "Ready to send" uses the server's
  eligibility; phone needs-attention header fits; designation rows match;
  less above the first gift on small screens.
- Polish (Support): lanes share the width and scroll sideways only when
  narrower than 16rem (pane open, 1024), sticky board filters; "Urgent"
  once in the table; Agents callout links to the inbox; plain subtitle;
  SLA title matches the nav; less above the first table row; ReportTable
  moved onto the shared ReUI DataGridPanel.
- Polish (People): Care Settings description and a Settings nav item;
  Org updates dates consistent and the composer collapsed until "New
  update"; Tasks' done toggle named "Mark … complete"; drawer labels in
  sentence case; shorter 640 placeholder; flagged-comment cards tighter
  with two-letter initials; Mobilize dialog button order; Speakers
  tighter; Care activity metadata stacks on phones.
- Polish (Tools): rule keys visible; each rule needing repair says why and
  what to do; phone run IDs shortened, badges no longer wrap; phone sort on
  Workflow runs and Reports funds; Status sorts by severity; stable summary
  keys; fund names wrap on phones; the shell's route wrapper is a flex
  column so Email and PDF Studio fill the space under the header (toolbar
  no longer clipped).
- Polish (Web Studio): compact phone selection bar with a destructive
  Delete; View menu rows even and Title "Always shown"; filter value
  chevron matches the other selects; Giving and Project Pages show
  missionary and fund names; the table fits at 1024; template search ring
  has room; Missionaries IDs shortened with Copy; recent work earlier on
  narrow dashboards.
- Skipped with reasons: Funds rows to Contributions (Contributions has no
  fund URL filter, a link would look filtered and not be); Last gift under
  the CRM name (not named in the fix); shared compact Reset, SheetFooter
  order and a resolved-view callback for tablet sort (optional shared
  changes, deferred).

Round 9 evaluation: the evaluation conditions changed (the capture now
waits for loading to clear), so the current best was reassessed under them
before judging the candidate. Both checkpoints were served from the working
tree on port 3030, one after the other: `restore-checkpoint.mjs round8`
(hash-checked), captured to `candidate-8r/` and checked; then
`restore-checkpoint.mjs round9` (410 app paths hash-checked, 0 mismatches),
captured to `candidate-9/` and checked. 125 states and 192 checks each.
Harness fixes during the run, applied to both: axe retries once when the
page navigates mid-scan; the `tasks-drawer` trigger is anchored (B's done
toggle "Mark Send year-end … complete" matched the old pattern; B's state
recaptured). The scratch Postgres (54322) had stopped with the old session
and was restarted before the Studio checks.

Checks: axe A 4/192, B 5/192 (the shared Payload Versions, API and media
edit findings; B adds three inside the Unlayer iframe on `pdf-studio`, whose
canvas is blank in A); no overflow in either; 41 dialogs each, every modal
contained, focus kept and closed by Escape; row keyboard 14/14 in both.
Verification `round9-verification.md`; sheets `comparisons/round9-ab/` (A
left) and `comparisons/round9-ba/` (B left), 215 each. Labels are neutral
("earlier checkpoint round8", "later checkpoint round9"). Fourteen read-only
reviews, briefs `snapshots/round9-*-{claude,gpt}-brief.md` (order swapped
from round 8: Claude sees B first, GPT sees A first):

| Area          | Claude Opus 5.5 (high) | GPT-6.1 Sol (high) |
| ------------- | ---------------------- | ------------------ |
| CRM           | 6018c53c               | 34eb2262           |
| Contributions | f46d349e               | 3a81b964           |
| Web Studio    | 9585414a               | 128a2bbc           |
| Shell         | 7377c11e               | 94fa0bc3           |
| People        | 540b3dd5               | 0be12edc           |
| Support Hub   | 08448bba               | ee9754db           |
| Tools         | 1db3ac80               | c1464d56           |

Implementation stays frozen until they return.

Round 9 outcome: fourteen reviews (`review/round9-results.md`). Both
reviewers prefer B in every area, and in every part except Support Reports,
where both prefer A over a blocking regression (report tables stopped at
ten rows). Decision: **repair**, not accept unchanged and not reject.

Round 9 repair (lead): unpaged grids opt out of TanStack's default page of
ten (`manualPagination: true` on Support ReportTable, Workflow runs, both
Teams tables and Event attendees; tests for 31 report rows and 15 runs, and
a structural test that every admin grid either shows a pager or opts out);
Web Studio `readWhere` refuses a where with clauses beside its `or`/`and`
lists (test); Eve index jumps push a history entry and Back to an entry
without a #section reopens its `?tab=` (tests). Remaining items run as
workflow `round9-repair` (wf_15bbc806-7a5): seven area agents with disjoint
files, each verified by an independent read-only skeptic, with a fix-up
stage only for blocking or important problems.

Parallel line (user-directed): the user told the Claude CRM reviewer thread
directly to keep improving every admin area until each scores 9.5 or
better. It works in a separate worktree, `t3-5a24111d-r10` (branch
`t3/admin-ux-round10`, round 9 applied and hash-checked, its own server on
port 3040), and so far changed CRM (the six round 9 items, a compact shared
Reset, MetricCard `compactDetail`, a phone Type menu on Relationships),
Automations (rules on the shared grid) and Support (Labels filter size,
saved views as button pairs). The lead sent it the main line's repair list
so it works on areas nothing else touches; both lines are merged before the
next independent review. Stop condition from now on: 9.5 or better per part
from both reviewers.

Round 9 repair results (workflow wf_15bbc806-7a5, 19 agents): every area's
items fixed or explained; independent verifiers found important problems in
Tools (repair copy still promised controls; a pointer to an activity log no
staff page shows), Shell (Eve permission copy dropped the platform-owner
rule; tile line not rendered by role), Web Studio (saved sort and the
200-name cap on reference columns), CRM (owner still shrank at 1024) and
Support (lanes no longer full-height drop targets); fix-up agents repaired
each. Lead follow-ups: TileCard renders `insideForRole` (test);
`DataGridSortSelect whenCards` shows the phone sort whenever the panel draws
cards (Funds, Workflow runs; test); `inputGroupInputStyles` gains
`focus-visible:ring-offset-0`, removing the doubled clipped inner ring in
every input group (test); the Tasks toggle keeps one tooltip label matching
its name (WCAG 2.5.3) with its icons inside the Button (trigger-nesting
contract); `receiptSuppressed?: true` is typed on
`SharedContributionRowFields`; Care rules copy no longer implies another
place to change them. Left as stated limits: Automations cannot show which
rule failed (the page has no per-rule failure data; the card says so);
Contributions "More filters" still takes a second toolbar row at 1024 (no
room for one row); And/Or filter buttons keep different variants (adding
within a group vs adding a group).

Merge of the parallel line (batch 2, 40 files): files only it changed were
taken; files both changed were merged three-way against the round 9
checkpoint with no conflicts (Automations page and rules, the contribution
sheet, Events, and their tests). For CRM both lines fixed the same six
items; the main line's verified version was kept, so the parallel line's
CRM files, its phone Type menu test and its two CRM-only shared options
(compact Reset, MetricCard `compactDetail`) were not taken. The new paging
guard caught its Automations `rules-grid.tsx` stopping at ten rules; it now
sets `manualPagination: true`.

Parallel line batch 3 (held until the round9r review finishes, saved in
the lead's scratchpad): one style for page-section tabs (new shared
`NavTabs`/`NavTabsLink` for tabs that are pages, underline style; Events
sections; the Support Hub section strip), moderation decisions as labelled
footer buttons matching flagged comments, and the shared `Empty` for an
empty queue. Pre-commit gates it reported failing on round9r, to fix before
any commit: `verify:shadcn-diff` (packages/ui/components/primitives/
tanstack-form.tsx changed without a baseline refresh), the stale Shadscan
proof hash for content-moderation-sections.tsx in tooling/shadscan/
findings.json, and the React Doctor exceptions bound to old Automations
lines. Dead code noted: apps/admin/app/web-studio/web-studio-sections.tsx
(no route uses it; hard-coded zinc and blue).

Round 9r evaluation: checkpoint `round9r` (466 files, diff sha256
`48a80660…`) captured to `candidate-9r/` on a clean build (125 states, 192
checks): axe 5/192 (the same Payload stock views plus the Unlayer iframe),
no overflow, 41 dialogs all contained with focus kept, row keyboard 14/14;
Support report tables now list every period (34 rows against A's 10). Same
A as round 9 (`candidate-8r/`). Verification `round9r-verification.md`,
sheets `comparisons/round9r-ab/` and `comparisons/round9r-ba/` (215 each).
Order swapped back: Claude sees A first, GPT sees B first.

| Area          | Claude Opus 5.5 (high) | GPT-6.1 Sol (high) |
| ------------- | ---------------------- | ------------------ |
| CRM           | 4829028e               | b47260e2           |
| Contributions | e7153772               | d356f93e           |
| Web Studio    | d2dad5f9               | cf550c30           |
| Shell         | 40dbd062               | 55150d9d           |
| People        | f1d70004               | ebb96835           |
| Support Hub   | f622af2e               | c16c854e           |
| Tools         | f63bb774               | 8d8b2a51           |

The first seven GPT launches failed at start with the known shadow-home
error (a regular `goals_1.sqlite-shm` where T3 expects a symlink). Every
non-symlink entry (`goals_1.sqlite-shm`/`-wal`, `models_cache.json`, `tmp`)
was moved, not deleted, to `shadow-stray-backup-20261110-r9r/`, and the
seven were relaunched with the same briefs (IDs above).

The parallel line's batch 3 stays out of the working tree until these
return.

Round 9r outcome (`review/round9r-results.md`): both reviewers prefer B
(`round9r`) in every area; per part B wins everywhere except CRM
Relationships for Claude (list floor at 1024) and Support Reports for GPT
(a server-render crash), and Web Studio lists for GPT carry a preservation
regression. No part reaches 9.5 (best 9.0). Decision: repair the three
regressions, re-verify the affected areas with both reviewers, then accept.

Round 9r2 repair (lead, test-first): Support reports no longer crash on
server render (`periodKeys` skips the date axis for the server's empty
range; test runs every slice over it; a server render of /support/reports
returns 200 with no RangeError in the dev log); CRM Relationships keeps at
least 60dvh for its list (`minViewportShare` option, Relationships only, so
Notes and Records keep their exact fit; page test proves the wiring and fails
without it); Web Studio named reference columns sort again by the stored
ID, a saved or linked ID sort is kept, and the header reads "Missionary (by
ID)" while that sort is active (the replacement helper and its tests were
removed). Frozen as `round9r2` (467 files, diff sha256 `da16d190…`); five
source files differ from `round9r`. Support, CRM and Web Studio were
recaptured and rechecked into `candidate-9r2/` (seeded from `candidate-9r/`
for the four unchanged areas).

Round 9r2 evaluation: `candidate-9r2/` (Support Hub, CRM and Web Studio
recaptured; the other areas carry the identical `round9r` captures). Checks
192: the same five axe findings, no overflow, 41 dialogs pass, row keyboard
14/14; Relationships at 1024 renders 21 rows; Support reports 34 rows and no
server-render errors. Verification `round9r2-verification.md`; sheets
`comparisons/round9r2-ab/` and `-ba/`. Six reviews of the three changed
areas, order swapped (Claude sees B first, GPT A first); Codex shadow-home
strays (`models_cache.json`, `tmp`) moved to
`shadow-stray-backup-20261110-r9r2/` first.

| Area        | Claude Opus 5.5 (high) | GPT-6.1 Sol (high) |
| ----------- | ---------------------- | ------------------ |
| Support Hub | 74a26605               | c6e2ba02           |
| CRM         | fd7feb0f               | f51e7a13           |
| Web Studio  | c82c1e21               | 14f5c670           |

Round 9r2 outcome: six reviews (`review/round9r2-results.md`), B preferred
or equal in every part of the three areas, no blocking issue. **Accepted:
`round9r2` is the current best checkpoint.** Round 10 starts from it.

## Round 10 (lead, started 2026-11-10)

Start: current best `round9r2`. Merged the parallel line's batch 3 (held
during the round 9r/9r2 reviews; all eight files unchanged since round9r):
shared `NavTabs`/`NavTabsLink` (underline tabs for tabs that are pages),
Events section tabs, the Support Hub section strip, labelled moderation
decisions in each post's footer, and the shared `Empty` for an empty
moderation queue; 57 files / 222 tests and lint clean.

Round 10 work runs as workflow `round10-improve` (wf_0eeb5687-e3c): seven
area agents with disjoint files, each checked by an independent read-only
skeptic, with a fix-up stage for blocking or important problems. Order per
area: the two round9r2 regressions (Support Open lane cap; Web Studio phone
sort label), then the important items both reviewers raised against B
(Support donor-panel setting, Agents filters, board card names,
notifications; Web Studio empty Untitled drafts, Payload stock-view axe;
Contributions resend in bulk and gift-list access; Eve permission picker and
Teams dialog copy; phone Care status, Locations keyboard path and ReUI
table; Automations per-rule failures, Email Studio start cue, PDF export
watermark), then the named polish.

Round 10 results (wf_0eeb5687-e3c, 20 agents, all verified; fix-ups for
every blocking or important verifier finding):

- Support: Open lane cap removed (every card in page flow at 1024/640/390,
  2x2 kept, lanes full-height drop targets); the Donor panel setting is read
  per inbox; Agents, Labels and Teams reports hide the Group by and Business
  hours controls their data ignores; board card names carry unread,
  priority and labels; the in-app notification channel has a real consumer
  (a "For you" note from the inbox's own data, gated by the saved in-app
  preferences; email, digest and mentions still need a server sender, and
  the settings page says which switches act today); Customer waiting card
  no longer stretches; long period tables offer "Hide days with no
  activity" (off by default); SLA page and nav titled "SLA policies"; phone
  inbox first card 92px higher.
- Web Studio: every sort surface says a named reference column orders by ID;
  the template gallery's create links no longer open Payload's autosave
  create view (each visit used to save an empty "Untitled" draft; Payload's
  stock create view does this during render for autosave collections, the
  remaining direct URL is noted); API view line-number contrast fixed in
  Core's Payload stylesheet; bulk Delete styled without `!` overrides;
  grouped filter controls labelled "Add condition" / "Add OR group" side by
  side; giving and project editors name their missionary or fund in the
  header. Stated limits: Payload's Versions tab list markup and media popup
  ARIA need Payload changes; the hidden duplicate document h1 is Payload's;
  reference names past 200 need an `ids` filter on the directory APIs.
- Contributions: bulk receipts separate already-sent gifts with an explicit
  opt-in to resend; a "Skip to gifts" link and a shorter overview; shorter
  1024 search placeholder; even attention actions; sticky refund actions
  that never hide a focused field; retired CRM-post tasks filtered once on
  the server read model.
- Shell: Eve launch permissions picked by person with plain labels (same
  payload, platform-owner rule kept); Teams dialogs say changes are sample
  only; Home's module directory collapses on phones; Eve copy and status
  tones; Teams "+N" reveals its modules; Email delivery spacing and phone
  grid; No access actions are buttons; Home heading scale matches.
- People: phone Care profile puts status, last check-in and local time by
  the header; Locations can be added from the keyboard and its list is on
  the shared ReUI grid; map legend; distinct Pending/Due tones; one Mobilize
  footer layout; Tasks placeholder; Care wording aligned.
- Tools: Automations show per-rule failures (last 24 hours) and the failure
  card filters to failing rules; Email Studio shows a starting prompt on a
  blank email; PDF Studio warns before a free-mode export that can carry
  Unlayer's watermark (Unlayer's iframe markup is the vendor's); phone
  "Jump to funds"; workflow ID shortening threshold; sortable rule columns.
- CRM: Relationships shows Contact and Commitment as columns on wide panels
  and labels the folded contact; 1024 subline readable in full; phone note
  subject on its own line; empty Notes footer band removed; phone kanban
  scroll cue. Stated limits: no list total from the API ("50 of N"), and the
  records API cannot sort by owner.

Lead follow-ups: the shared pager no longer lets `sizes: undefined`
overwrite its default page sizes (every `pagination` panel showed an empty
rows-per-page menu; test); Home attention badges sit beside their titles;
resend opt-in counts gifts, not donors; the skip link keeps its padding when
shown; the donor report export is withheld only when the CRM list failed
with nothing loaded (it is built from donations on the server); a generated
`web-studio/importMap.js` reordered by lint --fix was restored (same 60
entries) and is left out of lint.

Round 10 evaluation: frozen `round10` (513 files, diff sha256 `6a1754ff…`);
gate on it: typecheck (admin, ui, api, config, database) 0 errors, lint and
Prettier clean on 85 changed source files, unit 408 files / 2,888 tests
passing (two stale tests updated to the round's sentence-case "Marker type"
and to a saved location that has coordinates). Captured to `candidate-10/`
(125 states) from a clean build; checks 192: axe 5/192 (API contrast now
passes), no overflow, 41 dialogs pass, row keyboard 14/14, two-h1 states
14 → 12. The capture took ~2h and the T3 server restarted mid-check, so the
checks ran as a detached process. A = `candidate-9r2/` (current best).
Verification `round10-verification.md`; sheets `comparisons/round10-ab/`
and `-ba/`. Order: Claude sees A first, GPT B first. Codex shadow strays
moved to `shadow-stray-backup-20261110-r10/`.

| Area          | Claude Opus 5.5 (high) | GPT-6.1 Sol (high) |
| ------------- | ---------------------- | ------------------ |
| CRM           | b8a91dba               | 169a4a71           |
| Contributions | 4009c5f4               | 99a519d8           |
| Web Studio    | aa860927               | af82fc0b           |
| Shell         | 139555bb               | a53b060b           |
| People        | 332bc339               | 5b69d3ed           |
| Support Hub   | 491d0ddb               | 1bd281bb           |
| Tools         | 5f2c2b5f               | 20a6cae6           |

Round 10 outcome: fourteen reviews (`review/round10-results.md`). Both
reviewers prefer B in every area; no blocking issue. **Accepted: `round10`
is the current best checkpoint.** Five regressions or prominence issues are
carried into round 11 as first items, with the evidence fixes the reviewers
asked for.

## Round 11 (lead, started 2026-11-10)

Start: current best `round10`. Product work runs as workflow
`round11-improve` (wf_9f70a09b-5a2): seven area agents, each verified by an
independent skeptic, fix-ups for blocking or important findings. First items
are round 10's carried regressions (phone refund footer covering the Amount
field; Locations cards without sorting or Last updated; clipped Tasks
placeholder; No access primary button looping; Navigation editor Tenant
label), then the open important items (undelivered notification switches
made non-interactive; Workflow runs' held inbound email no longer counted as
urgent staff work; unknown per-rule automation activity not shown as "No
runs"; Eve lookup retry and guidance; phone gift access; Payload tab-list
and media-popup markup), then named polish.

Evidence fixes (lead, applied to every later capture):

- The needs-attention fixture now runs the store's own
  `withoutRetiredNeedsAttention` before grouping (10 actionable items, no
  retired CRM posting), as the route serves them.
- The automations fixture carries per-rule activity that adds up to the
  summary (148 runs, 2 failed, from one rule).
- `/api/admin/users?role=super_admin` answers with two platform owners, so
  the Eve launch-permission picker renders its normal state.
- The capture's loading wait also matches "Loading templates…"-style text
  and input placeholders (round 10 captured Web Studio's giving form
  mid-load).
- New states: `locations-list` (desktop, phone), `locations-add`,
  `automations-failing`, `pdf-export-menu`,
  `studio-giving-pages-sort-menu` (phone) and `studio-new-template`
  (desktop, phone), added to the review briefs' parts.

Round 11 results (wf_9f70a09b-5a2, 19 agents, verified; fix-ups for each
blocking or important verifier finding):

- Contributions: the refund dialog scrolls the focused field clear of the
  pinned action row on focus and on every resize (round 10 capture opened
  at 1440, then resized); a visible phone "Jump to gifts" link; "Search
  donor, fund, ID…" from xl; resend-only bulk dialog retitled "Resend
  receipts?" with accurate copy. Skipped: moving Approve/Reject in the phone
  correction sheet (they follow what the approver must read first).
- People: Locations cards show Last updated and a cards-only sort; Tasks
  placeholder fits ("Search tasks or people…"); phone Care profile keeps only
  status, last check-in and local time by the header; one-line follow-up
  description linking to Care rules; phone page rhythm tightened.
- Shell: No access leads with "Switch account"; Eve person lookup has Retry,
  plain guidance and the ID fallback; Teams People copy says sample only;
  manage sheet's last row clear of the footer with even select widths;
  Administration overview uses the 1440 width; one module control on phone
  Home.
- Web Studio: Versions/API tab list rendered with list items and the media
  popup trigger given an allowed role, through Core's own edit views
  (cms-users and tenants keep Payload's stock tabs); giving/project editors
  move the raw reference ID out of the way; header spacing and phone wrap.
  The Navigation editor's empty Tenant was a load race in Payload's stock
  relationship field (its label arrives ~16s after load on the dev server),
  not a bug. Bulk Publish/Unpublish counts have no supported override.
- Tools: missing per-rule activity reads as unknown and failures past the
  first 100 rules are fetched rather than blamed on deleted rules; held
  inbound email waits for an administrator instead of counting as urgent
  staff work (`packages/api/src/workflows/notification-policy.ts`); Email
  Studio prompt uses a readable token in light and dark with no `!`; Workflow
  runs placeholder fits; Automations phone sort.
- Support: the four undelivered notification channels are a read-only
  statement, not switches; only the two working in-app switches remain and
  save; phone inbox chrome reduced; with a conversation open every lane has
  a header jump near the top; phone period tables hide empty days by
  default (switch kept); Reports sub-tabs lighter than the section tabs.
- CRM: compact Relationships summary (shared MetricGrid kept); Contact and
  Commitment columns only when enough rows have values; "Skip to records"
  and "Skip to relationships" (board view included); phone record card in
  the table's order; filtered toolbar on one row at 1440; nested dialog
  scrim for Resend receipt; kanban cue only while lanes are off-screen.

Lead follow-ups: Workflow runs banner copy no longer names held emails (test
updated to the current policy); `MetricCard compactOnPhone` (opt-in, phone
only, every line kept; tests) used by the moderation and Mobilize
summaries; the capture waits for Payload relationship labels on saved Web
Studio documents (up to 30s).
