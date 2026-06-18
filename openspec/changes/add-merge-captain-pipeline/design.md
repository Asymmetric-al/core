# Design: Merge Captain pipeline

## Goal

Carry every open `develop` PR from "machine-reviewed" to "merged or explicitly escalated", with no
human approval gate, where automated tests + GitHub-enforced gates are the only merge bar.

## Stage map

| Stage               | Owner                    | Behavior                                                                                                 |
| ------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| 1. PR opens         | Human + authoring agents | Multiple commits, draft-first, conventional titles (unchanged).                                          |
| 2. Machine review   | CI + 3 bots              | `ci-gate`, `integration-gate`, Greptile, Cursor Bugbot, Cursor Security Reviewer. Greptile chains Codex. |
| 3. Signal reconcile | PR Signal Coordinator    | `automation:*` labels → terminal `automation:pr-intake-ready`.                                           |
| 4. Shepherd         | **Merge Captain**        | Fix CI → update stale/conflict → triage findings → close test gaps → arm auto-merge.                     |
| 5. Merge            | **GitHub**               | Auto-merge completes when `ci-gate` + `integration-gate` pass. No human approval required.               |
| 6. Notify/audit     | Operator                 | Merge Report comment + `captain:merged-clean` / `captain:merged-with-findings` labels.                   |

## Key decisions

1. **Merge safety lives in GitHub, not the prompt.** Required status checks + `enforce_admins` +
   strict up-to-date stay on `develop`; the agent token has no bypass. The worst a misbehaving
   loop can do is open noise, never merge a red PR. The only thing removed is the _required human
   review_ — that is the "no human gate" decision, applied as GitHub branch-protection state.

2. **Auto-merge is the terminal action, never a direct merge.** `gh pr merge --auto --merge` arms
   the platform; GitHub merges only when required checks pass. This keeps GitHub authoritative and
   makes premature/erroneous merges structurally impossible.

3. **Triage before acting; severity contract bounds the must-fix set.** Codex P0/P1, Greptile
   above-threshold, and all Bugbot/Security findings are must-fix-or-rebut; everything else is
   batchable. Dismissals are replied-to on-thread (audit + bot training). This, plus the cap on
   chasing nits, is the loop-breaker against fix→new-nit cycles.

4. **Tests are the merge bar.** With no human gate, every PR gets a mandatory test-gap pass:
   untested new behavior gets a proportionate unit test in-PR; oversized gaps become tracked
   follow-up issues. Never weaken tests to pass.

5. **Model-agnostic + multi-host.** The command assumes no specific model and works whether run
   via local `/loop`, a cloud session with Auto-fix, or a routine. Auth resolves `gh` → repo
   wrappers (`.git/bin/gh`, `.git/bin/ghapi`) → cloud `GH_TOKEN`.

6. **Hard circuit breakers.** ≤5 fix-iterations and ≤6 pushes per PR, one flaky re-run, then
   `needs-human`. Escalation is a first-class outcome.

## Alternatives considered

- **Keep a one-human-approval floor** — rejected per the explicit no-human-gate requirement; the
  audit happens post-merge instead.
- **GitHub Action / webhook-only auto-fix** — viable later; chosen path is operator-triggered so
  the human controls when the sweep runs and on which model. Auto-fix PR (cloud) is the documented
  webhook-driven evolution and is noted in the runbook.
- **Squash merges** — rejected; repo enforces merge commits and the release/back-merge topology
  depends on the ancestry merge commits preserve. A merge commit is still revertible as a unit.
- **Severity-gate required check now** — deferred; the command-level discipline covers it, and a
  required check that parses bot findings can be added once the bots are tuned.

## Out of scope (follow-ups)

- Promoting `test:e2e:production-gate` and the boneyard smokes to required checks after burn-in.
- Fixing the CMS suite's silent-skip masking so it can become a gate.
- Net-new suites for donor checkout (Stripe test mode) and signed Stripe webhook integration
  through real route handlers — the highest-value test gaps.
- An optional severity-gate required check that fails while unresolved P0/P1 threads exist.
