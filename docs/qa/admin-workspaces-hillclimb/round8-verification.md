### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round8`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round8.diff` (diff sha256
  `93df8224c5871585e5d4a04de862a378325b1b65dee769ab74725b64e435ef8e`, 407
  files; manifest `snapshots/round8-manifest.json`, full copies in
  `snapshots/round8-checkpoint/`). Served from the working tree on port 3030.
  Review the frozen copies in `snapshots/round8-checkpoint/`. This note was
  completed after the freeze, so the checkpoint holds its draft; read this
  copy.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 8 work").
  Round 7 findings and decisions: `review/round7-results.md`. States:
  `workspace-states.mjs` (CRM, Contributions, Web Studio) and
  `module-states.mjs` (shell, people, Support Hub, tools). Fixtures:
  `fixtures/`.
- Evidence: A in `original/`, B in `candidate-8/`, sheets in
  `comparisons/round8-ab/` (213).

### What this round covers

All seven areas. Round 7's regression (Web Studio Tenant cells "Loading...")
and partial regression (Support Overview without the Open/Pending split),
its important findings (Support thread room, Workflow runs held run and
counts, Tasks View on cards and reminder channels) and most of its polish
were repaired; `run.md` ("Round 8 work") lists each change and what was
deliberately kept. Check in particular that the round 7 findings are fixed,
not only that B still beats A.

### Evidence conditions

- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time. Web Studio runs on a real local Payload database.
- The Workflow runs fixture's held run is now an inbound email
  ("Inbound email routing", `email_inbound_message`, the notification
  policy's reason): only inbound emails are ever held for routing review
  (`packages/api/src/workflows/summaries.ts`); round 7's fixture used a
  pledge, a subject no workflow dispatches. A shows the same fixture.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Organization updates, Mobilize, Tasks, Teams) show that data. B says so on
  each page; A does not.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics and the signed-in profile name (money formatting is
  covered by unit tests). The Eve assistant needs a user record and is
  absent from both versions' captures.
- **Ignore the round, colourful "palm tree" button at the bottom right of
  most captures in both versions.** It is the TanStack Query Devtools
  trigger, which only renders in development and never in production.
- Email Studio and PDF Studio load third-party editors; their canvases may
  be blank in headless capture for both versions.
- `contribution-fund-correction` is not applicable: neither version offers
  that correction for the fixture gift, so the capture shows the detail
  sheet.
- `support-conversation` keeps the page's own scroll in the capture. In B
  the desktop pane now opens on the thread with Reply and Internal note
  below it (the composer opens from them), as the phone sheet does.
- The app header stays pinned while the page scrolls (in A it scrolls
  away), so full-page captures of B show the header once at the top.
- The "Recent" list in the Web Studio rail and "Untitled (N)" entries come
  from earlier capture runs against the same local Payload database (both
  versions share it).

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts; server-side totals are a data-layer change outside this UI work.
- Teams and Mobilize stay session-only sample data (labelled on the page).
- Users, Tenants and Account are Payload's stock views in B's chrome (their
  synced fields are now read-only and say so); the Versions and API views
  are Payload's, now with the document named in the bar. Payload's bulk
  buttons and bulk publish and delete dialogs are Payload's own.
- The CRM drawer timeline keeps gifts (the record's chronology), and nested
  dialogs keep Base UI's single backdrop.
- Routing review has no screen in Mission Control: a held inbound email is
  routed by an administrator, and the run says so.

### Checks run on B before freezing

- Typecheck: admin, ui, config and their dependencies pass (12 tasks).
- UI lint wrapper on the 48 changed source files: 0 errors, 0 warnings;
  Prettier clean on every changed file.
- Unit: the admin, shared UI, config and CMS suites (326 files, 2,086
  tests) pass. The run found that round 7's "Show more" threw where there
  is no ResizeObserver (two moderation tests); it now measures once there,
  with a test.

### Checks on the captured states (check-workspaces.mjs)

Run on B per area, 190 state/viewport checks, the same states and widths
as A's 190.

- axe violations: A in 73 of 190 checks, B in 4, all in Payload's stock
  views that A shares: Versions (`list`, desktop and phone), API (`list`)
  and media edit (`aria-allowed-attr`). Correction after review: the API
  view's JSON had not rendered when it was captured and checked (it renders
  about 6s after load on the live server), so round 7's `color-contrast`
  finding there is not shown to be gone; treat it as still present. No horizontal page overflow in either version.
- Dialogs: B opens 41 dialogs; every modal one is contained in the
  viewport with no sideways scroll, keeps focus inside across 12 Tabs and
  closes on Escape (CRM drawer, gift history, notes and relationship
  dialogs, resend receipt, the contribution sheet, refund, correction and
  send-receipts confirmations, command menu, phone navigation, Teams,
  Support phone sheet, Mobilize, Tasks drawer and new-task sheet). The
  Contributions status filter and Web Studio's template picker are
  non-modal popups and close on Tab, as designed (A's status filter does
  the same). A fails five: the CRM drawer and its gift history scroll
  sideways on phones, focus leaves the drawer opened from the row menu,
  and Escape does not close the Studio group menu or the phone navigation.
- Keyboard: every row grid in B is reached by Tab and ArrowDown moves to
  the next row: 14 of 14 (A 3 of 14).
- Not applicable, as before: `contribution-fund-correction` (neither
  version offers that correction for the fixture gift). Nine Web Studio
  states log "ready text not seen" in both rounds (the checker's ready text
  does not appear in those layouts; the pages render).
