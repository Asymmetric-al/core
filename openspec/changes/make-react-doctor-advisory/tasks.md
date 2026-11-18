# Tasks

## 1. Authority

- [x] 1.1 Record the owner's ratification of this proposal, with its date and scope, in `proposal.md` under Authority. Verify that the ruling names this change ID and the AL-1958 strict acceptance it supersedes

## 2. Advisory audit runner

- [x] 2.1 Write failing tests, against pure functions the audit calls, for the report rules in design D1 and D2:
  - complete scans with findings give exit code 0;
  - a missing or repeated target and a scan with skipped checks fail with an "evidence unavailable" error;
  - `findings.json` carries the version, the config hash, the base revision and every finding's target, file, line, column, plugin, rule, severity and message;
  - `summary.md` gives the totals per target and per rule;
  - with a base revision, the listing keeps only findings in files the working tree adds, modifies or renames relative to the merge base, or that are untracked and not ignored, including a target's `package.json`, while the totals still cover every finding;
  - files changed only by base commits after the merge base are not listed;
  - an unresolvable revision fails before any scan and names the revision;
  - the report parser rejects a diagnostic whose severity is not `warning` or `error`, or whose `fingerprint`, `plugin` or `rule` is missing or empty (design D3).

  Build the changed-file cases in a temporary Git repository with a branch that diverges from its base after the base moves on. Verify that each new test fails before the implementation and passes after it

- [x] 2.2 Move `parseReactDoctorReport` and the config-hash helper into `scripts/react-doctor-report.mjs`. Rename `tests/unit/scripts/react-doctor-ledger.test.ts` to `react-doctor-report.test.ts`, keeping its supported CLI report boundary cases byte-identical. Move the "fails closed when any required project or check is absent" case to the audit's completeness check, and move the per-diagnostic severity, fingerprint, plugin and rule checks from `reviewReactDoctorFindings` into `parseReactDoctorReport`. Verify that the renamed file and `tests/unit/scripts/react-doctor-snapshot.test.ts` pass unchanged
- [x] 2.3 Implement design D1 and D2 in `scripts/react-doctor-audit.mjs`:
  - the summary files for both the default and raw modes;
  - `--changed-since=<revision>`;
  - exit 0 on any complete scan;
  - exit 1 with `React Doctor audit evidence is unavailable: <reason>` on every failure;
  - `--check` rejected as an unknown argument.

  Verify that the tests from 2.1 pass

- [x] 2.4 Delete `scripts/react-doctor-ledger.mjs`, the ledger-only test cases and `docs/qa/react-doctor/exceptions.json`, and remove the `react-doctor:check` script from the root `package.json`. Verify that `git grep -n -E "react-doctor-ledger|reviewReactDoctorFindings|evidenceFileHash|react-doctor:check" -- scripts tests package.json` prints nothing, that `node scripts/react-doctor-audit.mjs --check` fails as an unknown argument before any scan, and that `bunx --no-install vitest run tests/unit/scripts/react-doctor-` passes

## 3. Guide, skill and registries

- [x] 3.1 Rewrite `docs/guides/development/react-doctor.md` per design D4: replace the strict acceptance and ledger sections, rewrite the strict and ledger sentences in "Rule configuration", "Verification" and "Historical audits", add the "Accepted patterns" list with the donor and missionary `next-themes` declarations (design D7), and keep "2026-09-19 Cleanup Decisions" word for word. Verify that `grep -n -i -E "ledger|exact exception|react-doctor:check" docs/guides/development/react-doctor.md` matches nothing that tells a reader to run the strict check or maintain the ledger, and that `tests/unit/apps/react-doctor-config-contracts.test.ts` passes, that `bun run format:check` passes, and that every command the guide documents runs as written
- [x] 3.2 Update `docs/ai/skills/react-doctor/SKILL.md` for advisory use, and drop `docs/qa/react-doctor/exceptions.json` from the ledger list in `docs/ai/skills/no-comments/SKILL.md`, per design D4. Run `bun run skills:sync`, and update both skills' hashes in `docs/ai/skill-source-audit.json`. Verify that `bun run skills:verify` and `tests/unit/docs/skill-inventory-audit.test.ts` pass, and that each skill's three mirrors match its canonical file
- [x] 3.3 Remove the `exceptions.json` row from `docs/ai/protected-paths.md`, replace the strict-check line in `docs/guides/development/getting-started.md`, and replace the "React diagnostics" bullet in `CONTRIBUTING.md`. Verify that `git grep -n -E "qa/react-doctor/exceptions\.json|react-doctor:check" -- . ':!docs/qa/' ':!docs/maintenance/' ':!docs/features/' ':!openspec/' ':!GOAL_LOG.md'` prints nothing (the excluded paths are the dated evidence in design D6)

## 4. Integration verification

- [ ] 4.1 On the implementing branch, run `bun run react-doctor:audit`. Verify that it completes all eight targets, exits 0 while reporting findings, and writes `findings.json` and `summary.md`. Run it again with `-- --changed-since=origin/develop` and verify that only files the branch changed are listed. Verify that `bun run react-doctor:raw` exits 0, and that `-- --changed-since=no-such-ref` exits 1 and names the revision. Record the counts and exit codes in the pull request
- [ ] 4.2 Verify that `bun run openspec -- validate make-react-doctor-advisory --strict`, `bun run verify:openspec-deltas`, `bun run lint`, `bun run format:check` and the full unit suite (`bun run test:unit`) pass, and that CI's required checks pass on the pull request
- [ ] 4.3 Prove that rollback works: in a scratch worktree, revert the implementing commit and verify that `docs/qa/react-doctor/exceptions.json`, `scripts/react-doctor-ledger.mjs` and the `react-doctor:check` script return byte-identical to their state on the pull request's base

## Workflow follow-up

- Archive this change after the implementing pull request merges and its
  verification is recorded.
