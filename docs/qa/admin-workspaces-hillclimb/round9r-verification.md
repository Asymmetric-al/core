### Snapshot under review

- **A (earlier checkpoint):** base commit
  `8368004b339384eb98129a086ca71b7db88534ed` plus checkpoint `round8`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round8.diff` (diff sha256
  `93df8224c5871585e5d4a04de862a378325b1b65dee769ab74725b64e435ef8e`, 407
  files; manifest `snapshots/round8-manifest.json`, full copies in
  `snapshots/round8-checkpoint/`).
- **B (later checkpoint):** the same base commit plus checkpoint `round9r`:
  `snapshots/round9r.diff` (diff sha256
  `48a80660164d2bb3fbbfe3a68077ef1a1cd6d5c56d0eff8753ed99ae245fd892`, 466
  files; manifest `snapshots/round9r-manifest.json`, full copies in
  `snapshots/round9r-checkpoint/`). The working tree holds B. Review A's
  code in `snapshots/round8-checkpoint/` and B's in the working tree or
  `snapshots/round9r-checkpoint/`.
- Both versions were served from the working tree on port 3030 under the
  same capture and check scripts: A's app source was restored from its
  checkpoint and hash-checked, then captured; B was frozen, served from a
  clean build and captured. A's captures are the same ones used in the
  previous comparison (`candidate-8r/`).
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 9",
  "Round 9 outcome", "Round 9 repair results", the merge note). Findings
  this version answers: `review/round9-results.md`. States:
  `workspace-states.mjs` and `module-states.mjs`. Fixtures: `fixtures/`.
- Evidence: A in `candidate-8r/`, B in `candidate-9r/` (125 states each),
  sheets in `comparisons/round9r-ab/` and `comparisons/round9r-ba/` (215
  each, the same pairs with the sides swapped).

### What this version covers

All seven areas. B is the round 9 candidate after a repair pass on the
findings an earlier independent review raised against it, plus a second
line of improvements merged in. `run.md` lists each change and each item
deliberately left as a stated limit. Check the earlier findings
(`review/round9-results.md`, "Round 9 summary") against B, and check that
nothing that worked in A broke in B.

### Evidence conditions

- The capture waits for skeletons, busy regions and "Loading…" text to
  clear (and for the PDF editor, the API JSON and the map) before each
  screenshot. A and B were captured under the same conditions.
- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time (A and B were captured on different days, so relative dates
  and day buckets shift). Web Studio runs on a real local Payload database
  shared by both captures.
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
- The single-gift "Send receipt" success path has no fixture; that capture
  shows the harness's "fixture missing" toast in both versions.
- The "Recent" list in the Web Studio rail and "Untitled (N)" entries come
  from earlier capture runs against the same local Payload database.

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts; server-side totals are a data-layer change outside this UI work.
- Teams and Mobilize stay session-only sample data (labelled on the page).
- Users, Tenants and Account are Payload's stock views in Core's chrome; the
  Versions and API views and Payload's bulk dialogs are Payload's own.
- Automations cannot show which rule failed: the page has no per-rule
  failure data, and its card says so.
- Contributions' toolbar takes two rows at 1024 (there is no room for one).
- Funds rows in Reports do not link to Contributions: Contributions has no
  fund URL filter.
- Routing review has no screen in Mission Control: a held inbound email is
  routed by an administrator, and the run says so.

### Checks run on B before freezing

- Typecheck: admin, shared UI, API and config packages, 0 errors.
- UI lint wrapper on every changed source file: 0 errors; Prettier written.
- Unit: admin, shared UI, config, admin API and database suites: 390 files,
  2,739 tests, all passing. New tests cover the repairs (among them: every
  admin grid either shows a pager or renders every row; a 31-period report
  table lists 31 rows; a Payload where with clauses beside its groups is
  not offered as editable; an Eve index jump adds a history entry).

### Checks on the captured states (check-workspaces.mjs)

Run on A and on B with the same script, 192 state/viewport checks each.

- axe violations: A in 4 of 192 checks, B in 5. Shared by both, in
  Payload's stock views: Versions (`list`, desktop and phone), API (`list`,
  `color-contrast`) and media edit (`aria-allowed-attr`). B only:
  `pdf-studio` desktop (`color-contrast`, `list`, `listitem`), all three
  inside the third-party Unlayer editor's iframe. In A that editor's canvas
  is blank, so axe has nothing to scan there.
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
