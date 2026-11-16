### Snapshot under review

- **A (original):** commit `8368004b339384eb98129a086ca71b7db88534ed`, served
  from a detached worktree on port 3031.
- **B (candidate):** the same base commit plus the task-owned working-tree
  changes frozen as checkpoint `round5`:
  `docs/qa/admin-workspaces-hillclimb/snapshots/round5.diff` (diff sha256
  `9e7675f4c221ada8a5f6c2f4e92220999fe3ebcace22960d59922937bff639ae`, 354
  files; manifest `snapshots/round5-manifest.json`, full copies in
  `snapshots/round5-checkpoint/`). Served from the working tree on port 3030.
  Review the frozen copies in `snapshots/round5-checkpoint/`. From this
  round the Mission Control home files are inside the checkpoint too.
- Run record: `docs/qa/admin-workspaces-hillclimb/run.md` ("Round 5 work").
  States: `workspace-states.mjs` (CRM, Contributions, Web Studio) and
  `module-states.mjs` (shell, people, Support Hub, tools). Fixtures:
  `fixtures/`.
- Evidence: A in `original/`, B in `candidate-5/`, sheets in
  `comparisons/round5-ab/` (213).

### What this round covers

All seven areas: CRM, Contributions, Web Studio, the shell with home and
administration, the people modules, Support Hub and the tools. Round 4's
findings and the round 3 carry-overs were repaired; `run.md` lists what
changed.

### Evidence conditions

- CRM and Contributions use the typed fixtures; the other modules' browser
  APIs are answered by `fixtures/module-fixtures.mjs`, dated relative to the
  capture time. B's new `GET /api/admin/crm/tags` is answered from the same
  CRM records. Web Studio runs on a real local Payload database.
- Modules that keep sample data in the browser (Events, Ministry Updates,
  Organization updates, Mobilize, Tasks, Teams) show that data. B now says
  so on each page; A does not.
- Server-loaded data is unavailable without Supabase in both versions: the
  home tenant metrics and the signed-in profile. The demo session has no
  user record, so the Eve assistant (shown only to a signed-in admin) is
  absent from both versions' captures. In B, Eve's button now sits in the
  header beside search; in A it floated at the bottom right.
- **Ignore the round, colourful "palm tree" button at the bottom right of
  most captures in both versions.** It is the TanStack Query Devtools
  trigger, which only renders in development and never in production. In
  round 4 it was mistaken for the Eve launcher.
- Email Studio and PDF Studio load third-party editors; their canvases may
  be blank in headless capture for both versions.
- `contribution-fund-correction` is not applicable: neither version offers
  that correction for the fixture gift, so the capture shows the detail
  sheet.

### Checks run on B before freezing

- Typecheck: admin, ui, database, config, lib, api pass.
- UI lint wrapper on all 235 changed source files: 0 errors.
- Unit: the full suite on Windows has 150 failures, matching the known
  Windows-only baseline of the base commit (script, acceptance-harness and
  docs-skill tests that pass in Linux CI). Every file touching this work
  passes: admin (1,069 tests), Support Hub, Web Studio and CMS (393), CRM
  API, shared UI. Three suspicious files (`design-system-health`,
  `design-system-suppressions`, `shadcn-upstream-review`) fail identically
  on the base commit.

### Checks on the captured states (check-workspaces.mjs)

- The dialog focus probe now reads where focus settles two frames after
  each Tab. Base UI wraps focus through a guard element and moves it on the
  next frame; the round 4 probe sometimes read that frame as
  `document.body`, in both versions. A and B were both rechecked with the
  new probe.
- axe violations: A in 73 of 190 state/viewport checks, B in 4 (Payload's
  own versions, API and media-edit views, which A shares). No horizontal
  overflow in either.
- Dialogs: every B dialog keeps focus inside across 12 Tabs, except the
  contributions filter popover and Web Studio's template list, which close
  on Tab as non-modal popups do. Escape closes every B dialog except the
  refund and resend-receipt confirmations, which ignore Escape in both
  versions. B's phone sidebar now closes on the first Escape (A's does
  not).
