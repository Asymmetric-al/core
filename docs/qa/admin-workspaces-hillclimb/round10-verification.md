### Snapshot under review

- **A (earlier checkpoint, the current best):** base commit
  `8368004b339384eb98129a086ca71b7db88534ed` plus checkpoint `round9r2`:
  `snapshots/round9r2.diff` (diff sha256
  `da16d1902b9526b20aeca01515b0731ba04019a7a8fb59e6c6d4cb148fe300cd`, 467
  files; manifest `snapshots/round9r2-manifest.json`, full copies in
  `snapshots/round9r2-checkpoint/`).
- **B (later checkpoint):** the same base commit plus checkpoint `round10`:
  `snapshots/round10.diff` (diff sha256
  `6a1754ff1178cc825cb6affcdc1137c805b069348bc672248965aa567898a5ba`, 513
  files; manifest `snapshots/round10-manifest.json`, full copies in
  `snapshots/round10-checkpoint/`). The working tree holds B. Review A's
  code in `snapshots/round9r2-checkpoint/` and B's in the working tree or
  `snapshots/round10-checkpoint/`.
- Both versions were served from the working tree on port 3030 under the
  same capture and check scripts, each from a clean build of its frozen
  checkpoint. A's captures are `candidate-9r2/` (its Support Hub, CRM and
  Web Studio states captured from `round9r2`, the other areas from the
  identical earlier code); B's are `candidate-10/`, all captured from
  `round10`.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 10",
  "Round 10 results"). Findings this version answers:
  `review/round9r-results.md` and `review/round9r2-results.md`. States:
  `workspace-states.mjs` and `module-states.mjs`. Fixtures: `fixtures/`.
- Evidence: A in `candidate-9r2/`, B in `candidate-10/` (125 states each),
  sheets in `comparisons/round10-ab/` and `comparisons/round10-ba/` (215
  each, the same pairs with the sides swapped).

### What this version covers

All seven areas. B fixes the two regressions the last review found in A
(the Support Open lane cap; the phone sort label for named reference
columns) and works through the important items both reviewers raised
against A, then their named polish. `run.md` ("Round 10 results") lists
each change and each item left as a stated limit. Check those findings
against B, and check that nothing that worked in A broke in B.

### Evidence conditions

- The capture waits for skeletons, busy regions and "Loading…" text to
  clear (and for the PDF editor, the API JSON and the map) before each
  screenshot. A and B were captured under the same conditions.
- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time (A and B were captured at different times, so relative dates
  shift). Web Studio runs on a real local Payload database shared by both
  captures.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Organization updates, Mobilize, Tasks, Teams) show that data and say so.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics and the signed-in profile name. The Eve assistant
  needs a user record and is absent from both versions' captures. The
  Support Hub "For you" note needs the signed-in user to be a Support Hub
  agent, which the capture user is not, so it does not appear in captures.
- **Ignore the round, colourful "palm tree" button at the bottom right of
  most captures in both versions.** It is the TanStack Query Devtools
  trigger, which only renders in development.
- Email Studio and PDF Studio load third-party editors.
- `contribution-fund-correction` is not applicable: neither version offers
  that correction for the fixture gift. `care-profile-plan` on phones:
  neither version shows a "Care plan" tab at that width.
- The single-gift "Send receipt" success path has no fixture; that capture
  shows the harness's "fixture missing" toast in both versions.
- The "Recent" list in the Web Studio rail and "Untitled (N)" entries come
  from earlier capture runs against the same local Payload database.

### Known limits B keeps and states

- The Contributions hub totals and filters in the browser over pages of 100
  gifts; server-side totals are a data-layer change outside this UI work.
- Teams and Mobilize stay session-only sample data (labelled on the page and
  now in Teams' dialogs).
- Users, Tenants and Account are Payload's stock views in Core's chrome;
  Payload's Versions tab list markup and media popup ARIA need Payload
  changes; the second (hidden) document h1 is Payload's own.
- Support notifications: the in-app channel acts (a "For you" note from the
  inbox's own data); email, the daily digest and mentions need a server
  sender, and the settings page says which switches act today.
- Automations show failures per rule for the last 24 hours; Unlayer's
  iframe markup in PDF Studio is the vendor's.
- CRM: the records API returns no total ("50 of N") and cannot sort by owner.
- Contributions' toolbar takes two rows at 1024.
- Funds rows in Reports do not link to Contributions (no fund URL filter).
- Sign Studio is not set up and says so.

### Checks run on B before freezing

- Typecheck: admin, shared UI, API, config and database packages, 0 errors.
- UI lint wrapper on every changed source file (85): 0 errors, 0 warnings;
  Prettier clean.
- Unit: admin, shared UI, config, admin API and database suites: 408 files,
  2,888 tests, all passing. New tests cover the round's changes.

### Checks on the captured states (check-workspaces.mjs)

Run on A and on B with the same script, 192 state/viewport checks each.

- axe violations: A in 5 of 192 checks, B in 5. B no longer fails
  `color-contrast` in the API view (Monaco line numbers); both still fail
  Payload's Versions and API tab `list` markup and the media editor's
  `aria-allowed-attr`, and the Unlayer iframe in PDF Studio (vendor markup).
- No horizontal page overflow in either version.
- Dialogs: 41 in each. Every modal one is contained, keeps focus inside
  across 12 Tabs and closes on Escape, in both. The Contributions status
  filter and Web Studio's template picker are non-modal popups and close on
  Tab, as designed, in both.
- Keyboard: every row grid is reached by Tab and ArrowDown moves to the next
  row: A 14 of 14, B 14 of 14. The Contributions hub takes 47 Tab stops to a
  row in B (45 in A) because the new "Skip to gifts" link is the first stop;
  activating it moves focus straight to the first gift.
- Web Studio editor views with two `h1` elements: A 14 states, B 12 (the
  create views now have one).
- Server log during B's capture: no server-render errors from B's changes.
  The Locations collection's server-side fetch of a relative URL logs a
  recovered error in both versions (also in A's captures); it is noted for
  the next round.
