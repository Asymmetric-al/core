### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round6`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round6.diff` (diff sha256
  `8c4ae0af86a6adf9a2c3b3f19316e341ed1eabecb0666ca3d1325005bd03b6aa`, 375
  files; manifest `snapshots/round6-manifest.json`, full copies in
  `snapshots/round6-checkpoint/`). Served from the working tree on port 3030.
  Review the frozen copies in `snapshots/round6-checkpoint/`.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 6 work").
  Round 5 findings and decisions: `review/round5-results.md`. States:
  `workspace-states.mjs` (CRM, Contributions, Web Studio) and
  `module-states.mjs` (shell, people, Support Hub, tools). Fixtures:
  `fixtures/`.
- Evidence: A in `original/`, B in `candidate-6/`, sheets in
  `comparisons/round6-ab/` (213).

### What this round covers

All seven areas: CRM, Contributions, Web Studio, the shell with home and
administration, the people modules, Support Hub and the tools. Round 5's
blocking, regression, important and polish findings were repaired;
`run.md` ("Round 6 work") lists each change. Check in particular that the
round 5 findings are fixed, not only that B still beats A.

### Evidence conditions

- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time. Web Studio runs on a real local Payload database.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Organization updates, Mobilize, Tasks, Teams) show that data. B says so on
  each page; A does not.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics and the signed-in profile name. The home "Giving this
  month" money fix (cents shown as dollars, round 5's blocking finding) is
  therefore not visible in captures; it is covered by unit tests
  (`mission-control-home.test.tsx`: 5,000 cents reads "$50.00"). The demo
  session has no user record, so the Eve assistant (shown only to a
  signed-in admin) is absent from both versions' captures, and B's profile
  menu shows the role and organisation where a name would be.
- **Ignore the round, colourful "palm tree" button at the bottom right of
  most captures in both versions.** It is the TanStack Query Devtools
  trigger, which only renders in development and never in production.
- Email Studio and PDF Studio load third-party editors; their canvases may
  be blank in headless capture for both versions.
- `contribution-fund-correction` is not applicable: neither version offers
  that correction for the fixture gift, so the capture shows the detail
  sheet.
- Some Web Studio states took two to four minutes to compile on first load
  in the dev server; they rendered fully (checked by eye).

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts (the server caps a page at 100). Server-side totals with filter
  parity is a data-layer change outside this UI work; B labels partial
  totals while older pages load and at its 5,000-gift ceiling.
- Teams and Mobilize stay session-only sample data (labelled on the page).
- Web Studio's grouped list view is still Payload's own table (planned for
  the next round on the shared grid), and Users, Tenants, Versions, API and
  Account are Payload's stock views inside B's chrome. Payload's own cells
  now use the short date format the grid uses.

### Checks run on B before freezing

- Typecheck: admin, ui, database, config, lib, api pass.
- UI lint wrapper on all 246 changed source files: 0 errors, 0 warnings.
- Unit: the full suite on Windows fails in 34 files, all in the known
  Windows-only baseline of the base commit (script, acceptance-harness and
  docs-skill tests that pass in Linux CI); three fewer files fail than in
  round 5. The four files this round broke were fixed (a motion contract
  updated for the motion-free admin Feed, a Payload 4 field option, a Base
  UI trigger render rule, and a test that ran mid-edit), and a rerun of
  every admin, CMS, shared UI and database test passes (2,156 tests).

### Checks on the captured states (check-workspaces.mjs)

- axe violations: A in 73 of 190 state/viewport checks, B in 4 (Payload's
  own versions, API and media-edit views, which A shares; unchanged from
  round 5). No horizontal overflow in either.
- Dialogs: every B dialog keeps focus inside across 12 Tabs and closes on
  Escape, including the refund, correction and resend-receipt
  confirmations, Mobilize's sheets and the Teams sheets. The contributions
  filter popover and Web Studio's template list close on Tab, as non-modal
  popups do.
- The checker's own setup missed four triggers on this run
  (`events-attendees`, `tasks-drawer`, `tasks-new`, `support-table`); the
  captures of those states are correct, and `events-attendees` rechecked on
  its own passes (axe 0, 3 rows). The other three missed in round 5 too.
