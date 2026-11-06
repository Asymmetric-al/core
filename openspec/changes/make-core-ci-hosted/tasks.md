# Tasks

## 1. Routing and security contract

- [x] 1.1 Prove RED/GREEN for the seven-job hosted inventory across supported
      events, forks and unset/empty/cased/invalid legacy variable values with the
      existing workflow evaluator.
- [x] 1.2 Replace the seven runner selections and amend explicit R1
      reachability to empty; verify local/indirect/privileged/fork mutations remain
      rejected and existing build-skip/E2E semantics remain covered; prove RED/GREEN
      for missing/invalid compilation-plan output in the pure and executed gate.
- [x] 1.3 Update the owning runbook and existing CI pointer; inspect protected
      bytes before narrowly recalculating any necessary acceptance fingerprints.

## 2. Qualification and review

- [ ] 2.1 Pass focused suites, strict OpenSpec validation and delta compatibility,
      then execute current `ci:preflight` and `test:acceptance`; record actual results
      and distinguish unrelated baseline failures.
- [ ] 2.2 Publish a focused follow-up PR referencing AL-2218 and inspect final
      candidate CI jobs, logs, runner identities and artifacts, including requested
      three-app compilation, migration, browser smoke and a safe manual navigation
      run; report any precise unavailable proof.
- [ ] 2.3 Complete applicable CodeRabbit/Greptile review and record final SHA,
      run IDs/attempts, results, old-branch rollout and safe rollback without merging
      or deploying production.

## Workflow follow-up

- Archive only after the implementation merges and becomes accepted reality.

Evidence for 1.3: #2180 documentation policy assertions failed twice before the
runbook/pointer update; the focused #2180 and #2221 documentation suites then
passed all 31 tests. Existing accepted `docs/ci.md` byte prefixes are unchanged.

Evidence for 1.1/1.2: the hosted inventory and #2153 placement assertions were
RED before the label changes; the focused workflow contracts then passed 572
tests and acceptance/security contracts passed 298 tests. Six pure-validator
cases and executed invalid-plan cases were RED before strict output validation;
the final compilation-policy/#2153 run passed 115 tests. The #2258 full CI-doc
fingerprint was recalculated only after reviewing the terminal pointer change;
its 40,204-byte content now hashes to
`8a5c648f445c05f600b568a754e9b5caa84c969c8e3747bac4b941d3508a40ed`.

Initial publication evidence: candidate
`02a3aa28d81538d00e4c4ca354cdd0360167ff98` passed normal required pre-push
`ci:preflight` (1,070 files, 11,225 tests passed) and `test:acceptance` (2,178
passed). All three app builds also passed with Turbo forced to execute. That
force setting caused two cache-contract failures when inherited by the first
unit invocation; this container's non-reaping PID 1 caused one unchanged process
cleanup fixture to fail. Normal cache settings plus a local-only subreaper
restored all 32 tests in those unchanged suites and the complete preflight.
No test assertion, CI policy or hook was bypassed. PR #2642 records subsequent
final-revision runs after synchronizing accepted develop changes; qualification
tasks remain pending until those results and reviews are inspected.
