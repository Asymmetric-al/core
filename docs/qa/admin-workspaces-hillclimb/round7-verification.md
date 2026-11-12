### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round7`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round7.diff` (diff sha256
  `6f859e0874f2f0d399c00259b1b7cd1b8b7203776afd0571d1ed6a9039e5f33d`, 398
  files; manifest `snapshots/round7-manifest.json`, full copies in
  `snapshots/round7-checkpoint/`). Served from the working tree on port 3030.
  Review the frozen copies in `snapshots/round7-checkpoint/`. This note was
  completed after the freeze, so the checkpoint holds its draft; read this
  copy.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 7 work").
  Round 6 findings and decisions: `review/round6-results.md`. States:
  `workspace-states.mjs` (CRM, Contributions, Web Studio) and
  `module-states.mjs` (shell, people, Support Hub, tools). Fixtures:
  `fixtures/`.
- Evidence: A in `original/`, B in `candidate-7/`, sheets in
  `comparisons/round7-ab/` (213).

### What this round covers

All seven areas: CRM, Contributions, Web Studio, the shell with home and
administration, the people modules, Support Hub and the tools. Round 6's
regression (card views overlapping at 1024), its important findings and
most of its polish findings were repaired; `run.md` ("Round 7 work") lists
each change and what was deliberately kept. Check in particular that the
round 6 findings are fixed, not only that B still beats A.

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
- `support-conversation` keeps the page's own scroll in the capture (B
  scrolls the reply pane into view when a conversation opens; A opens a
  modal sheet and does not scroll).
- The app header now stays pinned while the page scrolls (in A it scrolls
  away), so full-page captures of B show the header once at the top and
  scrolled viewport captures show it pinned.

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts (the server caps a page at 100); server-side totals with filter
  parity is a data-layer change outside this UI work.
- Teams and Mobilize stay session-only sample data (labelled on the page).
- Users, Tenants, Versions, API and Account are Payload's stock views in
  B's chrome; the Versions and API breadcrumb does not yet name the
  document. Payload's bulk publish and delete dialogs are Payload's own.
- The CRM drawer timeline keeps gifts (it is the record's chronology; money
  tests pin each entry's exact amount), and nested dialogs keep Base UI's
  single backdrop.

### Checks run on B before freezing

- Typecheck: admin, ui, database, config, lib, api pass.
- UI lint wrapper on all 255 changed source files: 0 errors, 0 warnings.
- Unit: the full suite on Windows has no new failure from product code.
  Three tests outside the baseline timed out: two read every untracked file
  (`git ls-files --others`) and slowed on this round's ~450 MB of QA
  evidence (now ignored by a `.gitignore` inside the evidence folder; both
  pass), and `design-system-theme` fails identically on the base commit
  (a Tailwind compile over the whole repo that exceeds 60 s on Windows).

### Checks on the captured states (check-workspaces.mjs)

Run on B per area (CRM and Contributions; shell and tools; Support Hub;
people; Web Studio), 190 state/viewport checks, the same states and widths
as A's 190.

- axe violations: A in 73 of 190 checks, B in 4, all in Payload's stock
  views that A shares: Versions (`list`, desktop and phone), API
  (`color-contrast`, `list`) and media edit (`aria-allowed-attr`). No
  horizontal page overflow in either version, including the shell now that
  the window scrolls.
- Dialogs: B opens 41 dialogs across the states; every modal one is
  contained in the viewport with no sideways scroll, keeps focus inside
  across 12 Tabs and closes on Escape: the CRM drawer and its gift
  history, notes and relationship dialogs, resend receipt, the
  contribution sheet, refund, correction and send-receipts
  confirmations, the command menu and phone navigation, Teams sheets,
  the Support phone sheet, Mobilize sheets, and the Tasks drawer and
  new-task sheet (the checker could not open the last two in rounds 5
  and 6; it does now). The Contributions status filter and Web Studio's
  template picker are non-modal popups and close on Tab, as designed (A's
  status filter does the same). A fails five: the CRM drawer and its gift
  history scroll sideways on phones, focus leaves the drawer opened from
  the row menu, and Escape does not close the Studio group menu or the
  phone navigation.
- Keyboard: every row grid in B (CRM records, notes and relationships,
  Contributions, Studio pages, ministry updates and missionaries, at both
  widths) is reached by Tab and ArrowDown moves to the next row: 14 of 14. A passes 3 of 14.
- Nine Web Studio states log "ready text not seen" (page editor on
  phones, page settings, new page and new giving page forms). Rechecked
  alone they log the same, as in round 6: the checker's ready text does
  not appear in those layouts (the phone editor folds "Document state"
  into a panel; the create forms' heading differs). The checks ran on the
  rendered pages and the captures are complete.
- Harness: the round 7 check run was first stopped by the 2-hour limit
  with nothing saved; the checker now saves after every measurement and
  ran per area. The first B dev server hung (3.8 GB, no longer listening);
  the restart's dev cache was damaged and reloaded every page every ~2 s,
  so the server was restarted on a clean cache before any capture or
  check used here. Feed and Organization updates were recaptured on the
  clean server after the "Show more" change below.

### Change after the first capture

- Feed "Show more" appeared on posts that already fit (it was shown
  whenever a post was clamped). It now measures the clamped text and
  shows only when the text runs past its lines, measured again when the
  card resizes (`expandable-post-content.tsx`, unit test with measured
  heights for both cases). The Feed captures and sheets are from this
  version.
