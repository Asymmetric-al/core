# Proposal

## Why

React Doctor's strict acceptance has not held on `develop` for weeks, and
nothing notices, because no hook, preflight stage or CI job runs it. AL-1958
(closed October 2026) set that acceptance: zero unexcepted warnings across
eight targets, with every exception recorded in
`docs/qa/react-doctor/exceptions.json` and bound to source, whole-file and
evidence-file hashes. Measured on `develop` at `6e2ac3807` with the pinned
React Doctor 0.9.18:

- 182 of the ledger's 254 records no longer match the files they hash.
- 536 of 753 current diagnostics have no record. 531 of them are in files
  changed since the last full requalification on 2026-10-22.
- `bun run react-doctor:check`, and even the plain `react-doctor:audit`, stop at
  `Exception evidence changed: packages/ui/styles/globals.css` before writing
  their findings report. Only `react-doctor:raw` completes.
- Records hash widely shared files as evidence: `packages/ui/package.json`
  (74 records), `packages/ui/styles/globals.css` (62) and `bun.lock` (12). A
  dependency bump or a CSS edit stales dozens of records at once, though no
  finding changed.
- The Mission Control hill-climb's round 13 review (2026-11-11) already
  reported the ledger as NOT PASS (243 of its 283 records stale), and that
  work merged anyway.

The audit itself is worth keeping. That same review found real defects with
it: a revert that wrote back an unchecked failed read, render-time ref
mutation in the shared data grid, and scroll scheduling inside a state
updater. The ledger and the zero-finding target are what cost every pull
request, and today they protect nothing: they are unenforced and mostly stale,
and they block the report the audit exists to produce.

Shadscan has the same problem. The active `make-shadscan-advisory` change
proposes the same remedy for it: report findings, triage them by review, and
retire the hashed ledger.

## What Changes

- **BREAKING (workflow):** React Doctor stops having an acceptance target.
  `bun run react-doctor:audit` reports every applicable diagnostic and exits 0
  whenever all eight targets scan completely. It exits non-zero only when the
  scan itself fails, is incomplete or skips checks, or when the source changes
  during the run. Those cases are reported as unavailable evidence, never as a
  pass.
- The audit writes a readable summary beside the raw per-target reports: counts
  by target and by rule, and the findings themselves. An optional base ref
  narrows the listed findings to files changed since that ref, so a pull
  request author can review their own findings without reading 750 others.
- Retire the hashed exceptions ledger: `docs/qa/react-doctor/exceptions.json`,
  `bun run react-doctor:check`, and the ledger review and hashing code in
  `scripts/react-doctor-ledger.mjs`, with the tests that cover only that code.
  The supported-report parser and the disposable-copy integrity checks stay,
  with their tests.
- Reviewers triage findings. A confirmed defect is repaired at its owner with a
  focused behavior test, or tracked as an issue. A false positive or accepted
  pattern needs no repository record.
- Rewrite the React Doctor guide and skill, the "React diagnostics" bullet in
  `CONTRIBUTING.md`, and the ledger list in the `no-comments` skill for
  advisory use. Keep the guide's 2026-09-19 section that a contract test pins,
  and add a short list of accepted patterns whose obvious fix would break
  something else. Remove the ledger row from `docs/ai/protected-paths.md` and
  the strict-check line from the getting-started guide.
- Keep unchanged: the pinned React Doctor version, `doctor.config.json` and its
  applicable rule profile, `react-doctor:raw`, `react-doctor:first-party`,
  `test:react-cleanup`, `docs/qa/react-doctor/native-exceptions.json`, and the
  dated evidence under `docs/qa/` and `docs/maintenance/`.

## Non-goals

- Removing React Doctor, its pinned version, or its rule configuration.
- Adding React Doctor to CI, the pre-commit or pre-push hooks, or
  `ci:preflight`, as a required or a non-required step. An eight-target scan
  takes 2 to 3 minutes, which is not worth spending on every event while the
  result is advisory.
- Fixing the 536 current findings, or moving React Doctor rules into ESLint.
  Confirmed defects are handled by the triage rule above.
- Changing Shadscan, its ledger or the `make-shadscan-advisory` change. In
  particular, the donor and missionary apps keep declaring `next-themes`: the
  Shadscan 0.17.0 rule `theme-hydration-safe` reads that declaration from each
  app's own `package.json` and is not applicable without it. React Doctor's
  matching `unused-dependency` finding becomes an ordinary reported finding
  instead of ledger records 89 and 100, and the guide's accepted-patterns list
  keeps the reason.
- Editing dated QA, maintenance or OpenSpec evidence that cites the ledger.

## Authority

AL-1958 set the strict acceptance and its ledger through
`docs/guides/development/react-doctor.md`. No durable spec or active OpenSpec
change requires React Doctor acceptance. Active changes cite it only in dated
verification notes, which stay as history. This proposal is the governing
intent once the owner ratifies it. Implementation SHALL NOT start before that
ratification.

## Capabilities

### New Capabilities

- `ui-quality-audits`: how Core runs and reports quality audits of its
  first-party UI and React source. This change adds the requirements that React
  source audits are on-demand reports with no acceptance target, that a report
  can focus on one change, and that findings are triaged by review without a
  hashed ledger. No durable spec exists at this path yet. The active
  `make-shadscan-advisory` and `modernize-shadscan-readiness` changes also
  propose ADDED requirements here, under different names. This delta uses
  `make-shadscan-advisory`'s Purpose word for word, so the two can archive in
  either order (design D8).

### Modified Capabilities

None.

## Impact

- **Scripts:** `scripts/react-doctor-audit.mjs` (report instead of ledger
  review; summary and changed-file view). `scripts/react-doctor-ledger.mjs` is
  deleted; its report parser moves to `scripts/react-doctor-report.mjs`.
- **Root `package.json`:** the `react-doctor:check` script is removed.
- **Tests:** `tests/unit/scripts/react-doctor-ledger.test.ts` becomes
  `react-doctor-report.test.ts`: the ledger cases go, and the report-boundary
  cases stay unchanged. New tests cover the advisory exit rules, the summary
  and the changed-file view.
  `tests/unit/apps/react-doctor-config-contracts.test.ts` and
  `tests/unit/scripts/react-doctor-snapshot.test.ts` still pass as they are.
- **Docs and skills:** the React Doctor guide; `CONTRIBUTING.md`; the
  `react-doctor` and `no-comments` skills with their generated mirrors;
  `docs/ai/skill-source-audit.json` (both skills' hashes);
  `docs/ai/protected-paths.md`; `docs/guides/development/getting-started.md`.
- **Removed data:** `docs/qa/react-doctor/exceptions.json`. Git history keeps
  it. Dated review scripts under `docs/qa/admin-workspaces-hillclimb/` that
  read it remain as history and are not re-run.
- **No product impact:** no app, package, API, database, auth or payment code
  changes. No CI, hook or required-check change.
- **Rollback:** revert the implementing pull request. That restores the
  ledger, `react-doctor:check` and the strict guide exactly. The ledger would
  then still need the full requalification described under Why before its
  check could pass.
