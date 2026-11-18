# Design

## Context

See `proposal.md` (Why) for the measured state of the ledger. The pieces this
design changes:

- `scripts/react-doctor-audit.mjs` copies the inventoried source into a fresh
  disposable snapshot, runs the pinned CLI once per target, writes each
  target's JSON and stderr plus `scans.json`, and checks that neither the
  checkout nor the snapshot changed during the run. Unless `--raw` is given,
  it then calls `reviewReactDoctorFindings` with the ledger and writes
  `actionable.json`. `--check` turns any actionable finding into exit 1.
- `scripts/react-doctor-ledger.mjs` holds two unrelated things: the ledger
  review (`findingIdentity`, the three hash functions and
  `reviewReactDoctorFindings`), and `parseReactDoctorReport`, which enforces
  the supported CLI report contract (schema, version, complete project, no
  skipped checks, no score, consistent counts).
- `reviewReactDoctorFindings` also owns one check that is not about the
  ledger: every one of the eight targets completed exactly once.
- The plain audit and `--check` both throw inside the ledger review on any
  stale evidence hash, so today neither writes a findings report.
- Nothing in CI, the hooks or `ci:preflight` runs any of this. The only
  references are the guide, the skill and its mirrors, `package.json`,
  `docs/ai/protected-paths.md`, the getting-started guide, and dated evidence.

## Goals / Non-Goals

**Goals:**

- A plain `bun run react-doctor:audit` that always produces a usable report
  when the scan completes, on any branch, with no upkeep from unrelated work.
- A per-change view that makes it cheap for an author or reviewer to look at
  only their own findings.
- Keep every integrity guarantee the audit has today: pinned version,
  disposable snapshot, supported-report parsing, all eight targets complete,
  and no source drift during the run.

**Non-Goals:**

- A baseline file, finding counts that may only shrink, or any other stored
  state that unrelated changes would have to maintain.
- Changing the scanner version, `doctor.config.json`, the target list or the
  snapshot inventory rules.

## Decisions

### D1. The audit's exit status reflects only scan completeness

`runReactDoctorAudit` returns exit code 0 whenever the scan completed and both
integrity checks passed, whatever the findings. Every failure (CLI error or
non-zero status, unreadable or unsupported report, skipped checks, a missing
or repeated target, or source drift) exits 1. The main entry catches the
error and prints `React Doctor audit evidence is unavailable: <reason>`, so a
failure is never read as a clean result. The eight-target completeness check
moves out of the ledger review into the audit, next to
`parseReactDoctorReport`.

`--check` and the `react-doctor:check` script are removed, not kept as an
alias. Kept, they would either mean "fail on any finding", which is the
target this change retires, or mean nothing, which is misleading.

Alternatives considered:

- **Keep a ledger keyed by fingerprint only, without hashes.** It would go
  stale more slowly but still needs per-pull-request upkeep. All 536
  unrecorded findings would need records before it could pass, and nothing
  would enforce it.
- **Keep the ledger and requalify it once.** That restores today's design,
  which went stale within three weeks of its last full requalification.

### D2. A readable summary and an optional changed-file view

Next to the existing per-target outputs, the audit writes:

- `findings.json`: one entry per applicable diagnostic, with target,
  repository-relative file, line, column, plugin, rule, severity and message.
  It also records the React Doctor version, the `doctor.config.json` hash and
  the base revision, if one was given.
- `summary.md`: totals per target and per rule, followed by the listed
  findings grouped by file.

The console prints the per-target totals and the paths of both files.

`--changed-since=<revision>` resolves `git merge-base <revision> HEAD`. A
finding is listed when its target-relative path, joined to the target
directory, is added, modified or renamed between that merge base and the
working tree (`git diff --name-only --diff-filter=AMR <merge-base>`), or is
untracked and not ignored. Package-level findings (`unused-dependency` on a
target's `package.json`) follow the same rule. The totals still cover every
finding. An unresolvable revision fails before the scan starts. The merge base
is used, so `--changed-since=origin/develop` lists the branch's own findings
even after `develop` moves on.

`react-doctor:raw` keeps its unsuppressed profile and also writes both files,
labeled as the raw profile, so the two modes read the same way.

Alternative considered: **a stored baseline of known findings, flagging only
new ones.** Rejected, because it is the ledger again under another name. The
changed-file view gives authors most of the same focus with no stored state.

### D3. Retire the ledger code and data outright

Delete `findingIdentity`, `sourceContextHash`, `sourceFileHash`,
`evidenceFileHash` and `reviewReactDoctorFindings`. Move
`parseReactDoctorReport`, and the `sha256` helper still used for the config
hash, into `scripts/react-doctor-report.mjs`, and delete
`react-doctor-ledger.mjs`. Rename `tests/unit/scripts/react-doctor-ledger.test.ts`
to `react-doctor-report.test.ts` and keep its "supported CLI report boundary"
cases unchanged. Drop the "evidence ledger" cases, except the one proving the
audit fails closed when a target or check is missing, which moves to the
audit's own completeness check. Delete
`docs/qa/react-doctor/exceptions.json`. Git history keeps every record and
its reasoning.

`reviewReactDoctorFindings` also rejects any diagnostic whose severity is not
`warning` or `error`, or whose `fingerprint`, `plugin` or `rule` is not a
non-empty string. `parseReactDoctorReport` does not check those fields today.
Those checks move into `parseReactDoctorReport`, so a malformed diagnostic
still fails the audit before any summary is written. The report tests gain
one case per field.

`docs/qa/react-doctor/native-exceptions.json` is unrelated to the ledger. It
documents one native ESLint false positive and is not read by the audit, so
it stays.

### D4. Guide, skill and registries describe advisory use

- `docs/guides/development/react-doctor.md`: replace "Commands and
  acceptance" and "Exact exception ledger" with how to run the audit, read
  `summary.md`, use `--changed-since`, and triage findings (a confirmed defect
  is fixed with a behavior test or tracked as an issue; a false positive needs
  no record; rules are not disabled to hide findings). Rewrite every other
  sentence that requires the strict check, zero findings, exact exceptions or
  the ledger: in "Rule configuration" the line about previous exceptions, in
  "Verification" the strict warning-level audits and the retained ledger, and
  in "Historical audits" the closing pointer to the current ledger. Add the
  accepted patterns from D7. Keep "2026-09-19 Cleanup Decisions" word for word,
  because `tests/unit/apps/react-doctor-config-contracts.test.ts` pins its
  sentences, and keep "Source boundaries" as it is.
- `CONTRIBUTING.md`: replace the "React diagnostics" bullet, which says
  `react-doctor:check` enforces the profile and exact exceptions, with the
  advisory audit and a pointer to the guide.
- `docs/ai/skills/no-comments/SKILL.md`: drop
  `docs/qa/react-doctor/exceptions.json` from its list of hash-checked
  ledgers and keep `tooling/shadscan/findings.json`. Sync the mirrors and
  update that skill's hashes in `docs/ai/skill-source-audit.json`, as for the
  React Doctor skill below.
- `docs/ai/skills/react-doctor/SKILL.md`: run the audit with
  `--changed-since` after React edits, triage the changed files' findings, fix
  confirmed defects with tests, and report remaining findings without
  claiming a pass. Regenerate the three mirrors with `bun run skills:sync`.
  Update the skill's entry in `docs/ai/skill-source-audit.json`
  (`entrypointHash`, `treeHash` and `reviewEvidence[].entrypointSha256`) the
  way that file's other skill updates are recorded.
- `docs/ai/protected-paths.md`: remove the `exceptions.json` row.
- `docs/guides/development/getting-started.md`: replace the line calling
  `react-doctor:check` the strict acceptance check with one pointing at the
  advisory audit.

### D5. No CI or hook integration

The audit stays a local command. A non-required CI report job, as the
Shadscan change adds, was considered. It would cost a full install and 2 to 3
minutes per event for a report that is already cheap to run locally, and CI
workflow files carry issue-evidence pins. If reviewers later want the report
on pull requests, that is a separate change.

### D6. Dated evidence stays as written

Review scripts and reports under `docs/qa/admin-workspaces-hillclimb/`,
qualification JSON under `docs/maintenance/modernization/`, the AL-1958
reports under `docs/qa/react-doctor/`, `GOAL_LOG.md`, and verification notes
in active OpenSpec changes mention the ledger or `react-doctor:check`. They
record what was true then, and none of them is executed by a gate. They are
not edited. Their scripts that read `exceptions.json` are not meant to be
re-run.

### D7. `next-themes` stays declared

The donor and missionary apps declare `next-themes` without importing it.
Shadscan 0.17.0's `theme-hydration-safe` rule reads the dependency from each
app's own `package.json` and reports "not applicable" without it. Removing the
declaration would drop that hydration check from both apps' Shadscan audits.
React Doctor's `unused-dependency` finding for it becomes an ordinary
reported finding. Deleting the ledger also deletes the only working-tree copy
of that reason, and an unused-dependency finding invites exactly the removal
that would break the Shadscan check. So the guide gains a short "Accepted
patterns" list, starting with this one: what the finding is, why it stays,
and when to revisit it. That list records patterns whose obvious fix breaks
something else, not individual findings, and nothing validates it. Once
Shadscan stops being consulted, or detects workspace-owned providers, the
declarations can be removed in their own change.

### D8. The shared `ui-quality-audits` Purpose

`ui-quality-audits` does not exist yet, and three active changes add to it.
The pinned merger uses a delta's Purpose only to create a missing spec. When
the spec already exists with a different Purpose, it warns, and
`verify:openspec-deltas` fails on that warning. This change therefore uses
`make-shadscan-advisory`'s Purpose word for word, so those two can archive in
either order. `modernize-shadscan-readiness` already carries a different
Purpose than `make-shadscan-advisory`. That conflict exists without this
change, and `make-shadscan-advisory`'s planned amendment of that change is
where it gets resolved.

## Risks / Trade-offs

- [Findings are ignored once nothing fails on them] → The skill directs
  agents to run the audit with `--changed-since` after React edits and to
  report their changed files' findings. That makes per-change review a short
  list instead of 750 lines. Strict enforcement already did not happen: the
  536 unrecorded findings accumulated while it was the rule.
- [The ledger's 254 recorded reasons leave the working tree] → They remain in
  Git history. Most were bound to locations that have since moved or
  disappeared, and a recorded reason never suppressed a finding outside its
  exact location.
- [A false positive keeps reappearing in reports] → Accepted. Hiding it would
  need either a rule change (forbidden by the spec) or stored state (what this
  change removes). The changed-file view only shows it again when its file
  changes.
- [Someone runs `react-doctor:check` from old notes] → The script name no
  longer exists, so `bun run` fails with an unknown-script error instead of
  passing silently. The guide and skill name the replacement.
- [Agent memory or external notes still describe rebinding ledger hashes] →
  Out of repository scope. The guide is the authority, and it changes in the
  same pull request.

## Migration Plan

1. The owner ratifies this proposal. Record the date and scope under
   Authority in `proposal.md`.
2. One implementing pull request, test first: write the failing audit and
   report tests, then change the scripts. After that, delete the ledger,
   remove the script, rewrite the guide and skill, sync the mirrors and update
   the skill audit entry, then run the verification in `tasks.md`.
3. Rollback: revert that pull request. That restores the ledger, the script
   and the strict guide exactly. The ledger would still need a full
   requalification before its check could pass.
