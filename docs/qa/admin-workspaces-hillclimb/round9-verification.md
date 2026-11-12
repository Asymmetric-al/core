### Snapshot under review

- **A (earlier checkpoint):** base commit `8368004b339384eb98129a086ca71b7db88534ed`
  plus checkpoint `round8`: `docs/qa/admin-workspaces-hillclimb/snapshots/round8.diff`
  (diff sha256
  `93df8224c5871585e5d4a04de862a378325b1b65dee769ab74725b64e435ef8e`, 407
  files; manifest `snapshots/round8-manifest.json`, full copies in
  `snapshots/round8-checkpoint/`).
- **B (later checkpoint):** the same base commit plus checkpoint `round9`:
  `snapshots/round9.diff` (diff sha256
  `21b7072cc047a21eaecc83426abb168f2afe91d931bb0b140cdd82bbb8c953dd`, 435
  files; manifest `snapshots/round9-manifest.json`, full copies in
  `snapshots/round9-checkpoint/`). The working tree holds B. Review A's code
  in `snapshots/round8-checkpoint/` and B's in the working tree or
  `snapshots/round9-checkpoint/`.
- Both versions were served from the working tree on port 3030, one after
  the other: A's app source was restored from its checkpoint
  (`restore-checkpoint.mjs round8`, every path hash-checked), captured and
  checked; then B's was restored and hash-checked the same way, captured and
  checked. The capture and check scripts are the same for both.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 9").
  Round 8 findings: `review/round8-results.md`. States:
  `workspace-states.mjs` and `module-states.mjs`. Fixtures: `fixtures/`.
- Evidence: A in `candidate-8r/`, B in `candidate-9/` (125 states each),
  sheets in `comparisons/round9-ab/` and `comparisons/round9-ba/` (215 each,
  the same pairs with the sides swapped).

### What this round covers

All seven areas. `run.md` ("Round 9 work") lists each change and each item
deliberately skipped. The round addresses round 8's findings
(`review/round8-results.md`): money parsing in refund and correction, report
periods, the Workflow runs status filter, copy that promised behaviour the
product does not have, Eve visibility by role, and the polish list. Check
that those findings are fixed and that nothing that worked in A broke in B.

### Evidence conditions

- The capture now waits for skeletons, busy regions and "Loading…" text to
  clear (and for the PDF editor, the API JSON and the map) before each
  screenshot. A was recaptured under these same conditions, so A's
  screenshots here differ from earlier rounds' A captures.
- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time. Web Studio runs on a real local Payload database shared by
  both captures.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Organization updates, Mobilize, Tasks, Teams) show that data and say so.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics and the signed-in profile name. The Eve assistant
  needs a user record and is absent from both versions' captures.
- **Ignore the round, colourful "palm tree" button at the bottom right of
  most captures in both versions.** It is the TanStack Query Devtools
  trigger, which only renders in development.
- Email Studio and PDF Studio load third-party editors.
- `contribution-fund-correction` is not applicable: neither version offers
  that correction for the fixture gift, so the capture shows the page.
  `care-profile-plan` on phones: neither version shows a "Care plan" tab at
  that width, so it is captured as the page stands.
- The "Recent" list in the Web Studio rail and "Untitled (N)" entries come
  from earlier capture runs against the same local Payload database.
- The `tasks-drawer` state's trigger was anchored to the task's own button
  (`/^send year-end tax receipts/i`) after B's first capture: in B the
  row's done toggle is also named after the task ("Mark … complete"), and
  the unanchored pattern clicked it. B's `tasks-drawer` was recaptured and
  rechecked with the anchored trigger; A's capture opened the drawer with
  the old pattern, which matched only the task button there.

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts; server-side totals are a data-layer change outside this UI work.
- Teams and Mobilize stay session-only sample data (labelled on the page).
- Users, Tenants and Account are Payload's stock views in Core's chrome; the
  Versions and API views and Payload's bulk dialogs are Payload's own.
- Funds rows in Reports do not link to Contributions: Contributions has no
  fund URL filter, so such a link would look filtered and not be.
- Routing review has no screen in Mission Control: a held inbound email is
  routed by an administrator, and the run says so.

### Checks run on B before freezing

- Typecheck: admin `tsc --noEmit`, 0 errors.
- UI lint wrapper on the 75 changed source files: 0 errors (import-order
  warnings fixed); Prettier written on every changed file.
- Unit: admin, shared UI, config, admin API, CMS, contract and acceptance
  suites: 410 files, 2,952 tests, all passing. Two stale tests were updated
  to the changed behaviour (Relationships' sparse columns at 1440; the Home
  shortcut tests now supply a role, since shortcuts are filtered by role).

### Checks on the captured states (check-workspaces.mjs)

Run on A and on B with the same script, 192 state/viewport checks each.

- axe violations: A in 4 of 192 checks, B in 5. Shared by both, in
  Payload's stock views: Versions (`list`, desktop and phone), API (`list`,
  `color-contrast`) and media edit (`aria-allowed-attr`). B only:
  `pdf-studio` desktop (`color-contrast`, `list`, `listitem`), all three
  inside the third-party Unlayer editor's iframe
  (`.blockbuilder-branding`, its tab list). In A that editor's canvas is
  blank at this width, so axe has nothing to scan there.
- No horizontal page overflow in either version.
- Dialogs: 41 in each. Every modal one is contained in the viewport with no
  sideways scroll, keeps focus inside across 12 Tabs and closes on Escape,
  in both. The Contributions status filter and Web Studio's template picker
  are non-modal popups and close on Tab, as designed, in both.
- Keyboard: every row grid is reached by Tab and ArrowDown moves to the
  next row: A 14 of 14, B 14 of 14.
- Web Studio's editor views have two `h1` elements in both versions
  (Payload's document title and Core's page heading).
- Several Web Studio states log "ready text not seen" in both runs (the
  checker's ready text does not appear in those layouts; the pages render).
