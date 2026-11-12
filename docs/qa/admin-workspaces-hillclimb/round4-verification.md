### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round4`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round4.diff` (diff sha256
  `99b6a305f18b3580369ef00b7d4189d6b7d19a7d74878d0b3fbe476f884d938b`, 300
  files; manifest `snapshots/round4-manifest.json`, full copies in
  `snapshots/round4-checkpoint/`). Served from the working tree on port 3030.
  Review the frozen copies in `snapshots/round4-checkpoint/` (the working
  tree may move on after the freeze). `importMap.js` is the
  `bun run cms:importmap` output.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` (phase 2 section).
  States: `module-states.mjs`. Fixtures: `fixtures/module-fixtures.mjs`.
- Evidence: A in `original/`, B in `candidate-4/`, sheets in
  `comparisons/round4-ab/`.

### What this round covers

Phase 2 widens the hillclimb from CRM, Contributions and Web Studio to every
Mission Control surface. This round reviews the four new parts: the shell,
home and administration; the people modules (Member Care, Mobilize and
Locations, Events, Ministry Updates, Tasks); Support Hub; and the tools
(Reports, Automations, Workflow runs, Email and PDF studios). CRM,
Contributions and Web Studio were reviewed in rounds 1–3 and are not
re-scored here, though the shell changes reach them too.

### Evidence conditions

- Browser APIs for Member Care, Locations, Workflows, Support Hub, Eve,
  Automations, Reports, email delivery and the studios are answered by
  `fixtures/module-fixtures.mjs` for both versions, dated relative to the
  capture time so "2 hours ago" reads the same in both.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Mobilize, Tasks, Teams) show that data. B dates its samples relative to
  today; A keeps fixed 2025/April 2026 dates (so A's events are in the past
  and every task is overdue). This is a real difference between the versions.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics, the signed-in profile (no name or email in either
  header), and the legacy `/support/tickets` pages (not captured).
- Email Studio and PDF Studio load third-party editors; their canvases may be
  blank in headless capture for both versions.

### Policy for modules without a backend (applied in B)

No control without a working handler; no success message for work that was
not done; numbers derived from the data on the page; an honest empty state
where a feature has no service. Where a module keeps session-only sample data
(Tasks already did), B gives Mobilize and Teams the same session-only write
handlers so their forms and actions work for the session.

### Component provenance (B)

- Grids: ReUI `data-grid` via `@asym/ui/components/data-grid-panel` (Member
  Care directory, Tasks, Mobilize, Teams and People, Events attendees,
  Workflow runs), the same panel CRM and Contributions use.
- Summary numbers: new shared `MetricCard`/`MetricGrid`
  (`packages/ui/components/primitives/metric-card.tsx`), taken from the
  Contributions summary card, now on Home, Member Care, Events, Ministry
  Updates, Tasks, Mobilize, Support inbox, Reports, Automations and Workflow
  runs.
- Rows: shadcn `Item` (ReUI c-item-2 pattern) for Administration, Member Care
  follow-ups, Events lodging and speakers.
- Charts: shadcn `ChartContainer` (Events registrations, Reports).
- Confirmations: shadcn `AlertDialog` (Support settings via one
  `ConfirmProvider`, Locations, Tasks, Teams, email delivery).
- Navigation: `@asym/config/navigation` is now the single source for the
  sidebar, header breadcrumbs (shadcn `Breadcrumb`) and the search palette.

### Checks run on B before freezing

- Typecheck: admin, ui, config, lib, database (12 turbo tasks) pass.
- UI lint wrapper on every changed `.tsx`: 0 errors.
- Unit: admin, ui, config, lib, ui-contract and cms suites, 2,194 tests: 2
  failures, both fixed and rerun green (a stale label assertion and a
  UTC/local date helper in a new test).
- e2e specs touched by the shell and Teams changes were updated; they could
  not be run here (Playwright's bundled browser is not installed).

### Checks on the captured states (check-workspaces.mjs)

- New-part states: axe violations in A 42 of 63 state/viewport checks, in B
  4 of 63 (all pre-existing Support Hub markup that A shares: a nested list
  item and a scrollable timeline in the conversation pane, and one unlabeled
  auto-resolve input in inbox settings). No horizontal overflow in either.
- Before the freeze, B's own new list and chart markup failed axe (link rows
  inside an `Item` list, a definition list wrapping a progress bar, an
  aria-label on a chart without a role); those were fixed, the affected
  states recaptured and rechecked, and the checkpoint re-frozen.
