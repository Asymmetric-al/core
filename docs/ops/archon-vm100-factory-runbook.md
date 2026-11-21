# Core factory on VM 100: operator runbook

One pinned Archon 0.14.0 engine and the Core pack run on the Proxmox guest
VM 100 (`core-dev`). Design and contracts:
[pack README](../../scripts/archon-factory/pack/README.md). Dated installation
evidence and open checks: [commissioning record](archon-vm100-commissioning.md).
The paths and commands below are operating guidance, not a fresh readback of
the installed release or services.

## Current state - 13 November 2026, 19:05 UTC

Intake is **open**, but nothing can run. The factory's Claude account reached
its weekly usage limit at 07:24 UTC on 13 November, and the limit resets on
**16 November at 15:00 UTC (22:00 in Bangkok)**. Release `d4ef33293af1a02d`
is installed, built from commit `4939d83aa`. The scope holds fifteen issues,
all to a ready pull request (2233 was allowed to merge):

| Issue                                    | State                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------- |
| #2233                                    | Merged by the factory (PR #2648)                                              |
| #2206, #2207, #2215, #2228, #2234, #2239 | Ready, then merged by the owner                                               |
| #2526                                    | Ready (PR #2663) on 13 November, then merged by the owner                     |
| #2370                                    | Published (PR #2664), in review; held on the usage limit                      |
| #2419                                    | Published (PR #2665); a newer candidate is in review; held on the usage limit |
| #2418, #2421, #2422                      | In scope, not admitted: both lanes are held                                   |
| #2205                                    | Blocked `acceptance-blocked`: needs a scope decision (see the issue)          |
| #2208                                    | Not admitted: its prerequisite #2068 has no merged closing request            |

At the reset the factory carries on by itself ([Usage limit](#usage-limit)):
the engine wakes the two paused rounds, the next pass settles them, and as
lanes come free it admits #2418, #2421 and #2422. That spends the new weekly
allowance. `factory pause-intake` before the reset keeps the three new issues
out. The part after the reset has not been seen on the running system yet.

Do not change the release before the reset (Updates, step 1). Before any
release change, read the open checks in the
[commissioning record](archon-vm100-commissioning.md#still-open). The factory
merges only an issue whose approved end state is `MERGED`. The safety gates
below supersede older unconditional retry/resume guidance.

## Access

From the operator PC (key-based SSH as `admin`; the VM firewall admits only
the operator's private LAN ranges). `core-dev` below is an SSH host alias for
the guest's private address, which is kept out of Git:

```sh
ssh -N -L 39342:127.0.0.1:39342 -L 49190:127.0.0.1:39190 admin@core-dev
```

- Core Console: <http://127.0.0.1:39342> (HTTP Basic; the owner alias as user, password in
  `/home/admin/.config/core-factory-console/owner.env` on the VM, never in Git).
- Archon's own console (fallback): <http://127.0.0.1:49190/>.

Keep the Console origin port identical locally and on the VM (39342), because
the Console checks the browser origin.

## Services

| Unit                           | Purpose                                                                |
| ------------------------------ | ---------------------------------------------------------------------- |
| `core-archon.service`          | The engine (`127.0.0.1:39190`, trigger host `core-dev`)                |
| `core-factory-intake.timer`    | Every 10 minutes: clear orphaned runs, then start `core-select`        |
| `core-factory-backup.timer`    | Daily 03:30 VM time (20:30 UTC): backup to `/srv/core-factory/backups` |
| `core-factory-console.service` | The Console (`127.0.0.1:39342`)                                        |

`systemctl status core-archon core-factory-console`; logs with
`journalctl -u core-archon -n 200`.

## How work is chosen

The factory works only inside the scope the owner approves: an explicit list
of issue numbers with an end state (`scope` in Controls). It never widens that
list by itself, and the roadmap cannot add an issue to it.

Every ten minutes the selector does three things:

1. **Sweep.** It restarts admitted issues whose next round did not start,
   settles rounds that ended without recording, clears provider-fault holds
   that are recoverable ([Usage limit](#usage-limit)), records a ready pull
   request that somebody merged, and removes the dependency trees of merged
   issues (the clone stays).
2. **Eligibility (code, not a model).** An issue in scope is eligible when the
   GitHub issue is open, it has no work item and no open pull request that
   closes it, its dependencies could be read without ambiguity, every hard
   prerequisite has a closing pull request merged on `develop`, no other
   issue holds a shared area it needs, and a delivery lane is free.
   Dependencies come from GitHub's blocked-by list, the issue text and
   comments, and the governing documents the issue cites. A range ("#12 to
   #15") names every issue in it, and a denial ("not blocked by #12") names
   none. An open or green pull request is not merged work. Anything that
   cannot be read or classified keeps that one issue out and is recorded with
   its reason; the other issues carry on.

   Reading prose is a heuristic. To be sure a prerequisite is seen, use
   GitHub's blocked-by relation or write `Depends on #N` on a line of its
   own. Two things to know: a sentence such as "After #N, the doc should..."
   counts as a prerequisite on #N, and a prerequisite written after the issue
   number ("#N must merge first") is not read.

3. **Ranking (Samson).** With one eligible issue it is admitted directly. With
   several, Samson picks one from that list only, using operator priorities,
   unfinished repairs, what unlocks other scope issues, the roadmap and
   waiting time, with the issue number as tie-break. Trusted code checks his
   answer against the eligible list and re-reads GitHub once more before the
   assignment is written.

Each decision is kept with its reasons and sources:
`archon state get core/selection --project _folder/control`, or the Console's
Overview. The full ledger of a pass (who was eligible, who was blocked and
why) is `/srv/core-factory/runs/<selector run>/eligibility.json`.

Up to `limits.admittedIssues` issues (2) are in flight. Each runs in its own
delivery lane, so their rounds run side by side; heavy checks still run one at
a time. A blocked issue retried after a newer one took its lane shares that
lane, and the two take turns. Keep a scope to a few dozen issues: a pass reads every issue in it and
stops observing after three minutes.

## Controls

For a qualified installed release, the Console's Controls panel and this
command expose the same controls. Verify the installed policy first. Every
mutation needs a unique `--request` id of 8-128 letters, digits, `.`, `_`, `:`
or `-`; repeating an id does not authorize a new effect:

```sh
# On the VM, as admin (ssh admin@core-dev). All five variables are needed:
# without them a control refuses (for example `identity-archon-home-mismatch`).
cd /srv/core-factory/control
export CORE_FACTORY_CONFIG=/srv/core-factory/control/core-factory.json
export ARCHON_HOME=/srv/core-factory/archon ARCHON_USER_ID=core-factory
export HOME=/home/admin CLAUDE_CONFIG_DIR=/home/admin/.claude
C=.archon/workflows/core-factory/.shared/control.mjs
N=/opt/node-v24.22.3-linux-x64/bin/node
$N $C status
```

| I want to                                         | Command                                                                                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Assign a phase or issues                          | `$N $C scope --issues 2233,2234 --end-state PR_READY --end-states 2233=MERGED --owner conrad --request <id> --by <me> --note "why"` |
| Start admitting only after all prerequisites pass | `$N $C factory resume-intake --request <id> --by <me>`                                                                              |
| Stop admitting new issues                         | `$N $C factory pause-intake ...`                                                                                                    |
| Let admitted work finish, then idle (maintenance) | `$N $C factory drain ...`                                                                                                           |
| Stop all rounds at their next boundary            | `$N $C factory stop ...` (undo: `factory resume`)                                                                                   |
| Hold or release merging                           | `$N $C factory hold-merge ...` / `release-merge`                                                                                    |
| Hold one issue                                    | `$N $C issue <n> hold ...` (undo: `release`)                                                                                        |
| Stop one issue                                    | `$N $C issue <n> stop ...` (undo: `reopen`)                                                                                         |
| Retry an ordinary BLOCKED issue                   | `$N $C issue <n> retry ...`                                                                                                         |
| Re-run feedback for a PR_READY issue              | `$N $C issue <n> reopen ...`                                                                                                        |
| Settle an ordinary ended run left active          | `$N $C issue <n> reconcile ...`                                                                                                     |
| Clear a provider-fault hold                       | `$N $C issue <n> recover-native ...` (see Native identity and fault evidence)                                                       |
| Move a blocked or stopped issue to a new release  | `$N $C issue <n> adopt-policy ...` (then `retry` or `reopen`; see Updates)                                                          |
| Let one issue's scope reach protected paths       | `$N $C allow-protected <n> 'package.json,.github/**' ...` (`all` for every protected path, `none` to revoke)                        |
| Change ranking                                    | `$N $C prioritize <n> <0-100> ...`                                                                                                  |
| Cancel one run                                    | `$N $C cancel-run <runId> ...` (holds the issue first; release remains subject to all safety gates)                                 |
| Ask Samson a question (the Console chat)          | `$N $C ask --conversation <id> --request <id> --question "text"` (conversation id: 8-64 lowercase letters, digits or `-`)           |
| Start an advisory analysis (never a gate)         | `$N $C analyze --scope factory --request <id>` (or `--scope issue:<n>`)                                                             |

A ready pull request is watched for one thing: the intake pass records that
somebody merged it, and the issue becomes `MERGED`. Otherwise the factory
leaves a `PR_READY` issue alone, so the pull request falls behind when
`develop` moves and a later comment or failed check is not seen. GitHub's
"Update branch" brings it up to date, or `issue <n> reopen` runs its
feedback stage again (the factory merges `develop` in, re-checks and answers).

Use "Update branch" only on a `PR_READY` issue. On an issue the factory is
still working on it pushes a head the factory did not publish (see
[Somebody pushed to a factory branch](#somebody-pushed-to-a-factory-branch)).
On release `34ce64a7` and earlier, do not `reopen` an issue after "Update
branch": its feedback stage blocks on the updated head.
After a release change `reopen` is refused until the issue is moved to the new
release: `issue <n> stop`, `issue <n> adopt-policy`, then `issue <n> reopen`
(Updates, step 8), which also re-runs the reviews.

Hold, stop and drain never abandon a run or delete work: they take effect at
the next round boundary, and unfinished code stays in
`/srv/core-factory/issues/<n>/repo`. Never use `archon workflow abandon` on a
delivery run unless the run's owner is verifiably gone; it can delete files.

- `retry`, `reopen`, `release` and `adopt-policy` verify the owner's signed-in
  account, so run them as `admin` with the environment above; otherwise they
  refuse `identity-profile-environment-mismatch` or
  `identity-archon-home-mismatch`. The Console sets it itself.
- `retry`, `reopen` and `release` require evidence that the installed policy
  still matches the retained assignment. Missing policy evidence or a changed
  policy refuses the control before mutation; these controls never rebind an
  assignment or replace its native account digest. Identity drift and unresolved
  native/cleanup holds also refuse recovery. Ordinary same-policy `retry` and
  `reopen` reset round budgets, subject to those safety gates.
- `reconcile` settles an ordinary active item only after matching engine
  completion/cancellation (or an ended lease for that same run), with no live
  lease or unresolved native/cleanup hold. The item then waits on the route
  its recorded progress calls for (Reboot and recovery). It is not
  identity/effects reconciliation. On an otherwise safe pending
  or waiting item it only records the request, re-arming the next round start.
- `allow-protected` accepts only issues in the current scope and only the exact
  protected globs: `.github/**`, `.husky/**`, `scripts/git/**`,
  `scripts/archon-factory/**`, `.archon/**`, `.claude/**`, `bunfig.toml`,
  `.npmrc`, `package.json` (the root one) and `scripts/verify/ci-*.mjs`. It
  writes `core/scope.allowProtected[<n>]`; approving a new scope keeps grants
  only for issues still in it.
- `cancel-run` holds the issue, asks the engine to cancel, removes the run's
  executor containers (label `core.archon.run=<runId>`) and lists them again. It
  is ok only when the run is completed or cancelled and no container remains;
  otherwise `containers.remaining` names what is left. Run the same command with
  the same request id to list and remove them again (the engine then answers
  the repeated cancel with HTTP 409 because the run has already ended; read
  `containers`). The engine cancels only a running run: a paused or failed run
  is refused, and the issue stays held.
  If the issue hold cannot be saved, cancellation and container removal do not
  start. A request whose earlier hold was released also refuses: re-read the
  issue and use a new request id if you intend a new cancellation.
  A run-level cancellation receipt does not clear an issue's exact-attempt
  cleanup hold, native fault hold or heavy-check slot by itself.
- Budgets: an issue is BLOCKED `round-limit` after 8 work rounds,
  `feedback-limit` after more than 12 feedback rounds, and `no-progress` when
  the same problem comes back a third time in a row without a new head
  (`limits` in `core-factory.json`). Rounds parked behind another issue's shared
  area do not count. Provider faults count the same way: the third in a row
  without a new head blocks the issue `no-progress`.

The Console offers the same `reconcile` (disabled while the issue's lease is
live) and shows `core/scope.allowProtected` read-only; grant it with the command
above. An enabled control is not proof that native/cleanup recovery is safe;
the backend can still refuse it. Its cancel-run receipt says whether the issue
was held. When the run ended but executor containers remain it shows
**Incomplete**; retry with the
same request id (that receipt then shows the engine refusing the repeated
cancel; its container line tells whether any remain).

## Native identity and fault evidence

[Identity binding](../../scripts/archon-factory/pack/.shared/identity.mjs)
retains `runs/<runId>/native-identity.json` with the exact run, owner, absolute
profile, provider and account `profileDigest`. A genuine initial entry can
establish the binding; it is create-only and idempotent only for identical
content. Resumed/inherited execution must verify it, not overwrite it after
sign-in. Missing, corrupt, wrong-run or drifted inherited bindings are refusals,
not permission to capture whichever account is signed in.
Keep credentials and raw sign-in output out of reports.

[Native classification](../../scripts/archon-factory/pack/.shared/native-faults.mjs)
uses typed native run/event evidence and a `core-native-faults/v1` report for
the exact owning run, not error-text guesses or a generic code-failure fallback.
Unavailable, malformed, mismatched or uncertain evidence keeps ownership held.
A stored hold cannot be cleared by a later clean report; even a nominally normal
report for another run is not clearance. Legacy absence of a report remains
compatible, but does not prove current native execution safe.

A hold is cleared by `issue <n> recover-native`, and only on evidence. The
command checks that the installed release and the signed-in account are the
assignment's, reads the issue's branch on GitHub (absent, or at a commit the
work item recorded, with no merge the factory requested still pending),
confirms the held run's check containers are gone, ends the held run through
the engine when it is failed or paused, and requires the engine to report
that run cancelled or completed. It does not end a run the engine reports as
running, and a refusal leaves the work item as it was. The refusal names what
is missing: `effects-unreconciled` (a merge the factory requested is still
pending, the branch could not be read, or it holds a commit the factory did
not publish and there is no pull request to read), `containers-unconfirmed`,
`run-not-ended`, `run-not-terminal`, `lease-live` (another run holds the
issue), `identity-drift` or `policy-transition-required`. Before the last two
container and run checks refuse, the held run's leftover check containers
have already been removed. The issue then waits on the route its recorded
progress calls for, with its committed work kept. When the branch on GitHub
holds a commit the factory did not publish and the issue has a pull request,
the hold is cleared onto the feedback route, which reads the pull request
first (see [Somebody pushed to a factory branch](#somebody-pushed-to-a-factory-branch)).

The intake pass runs the same command by itself for a hold the engine
classified `native-recovery` (a transient error, a rate limit, an overload, or
a quota whose reset the provider reported), once any reported reset has
passed. Every other hold (sign-in, budget, configuration, unclear effects)
waits for a person to deal with the cause and then run the command.

`retry`, `reopen`, `release`, ordinary `reconcile`, lease expiry, sign-in or a
quota reset cannot substitute for it. Preserve the binding, native reports,
views, work item, leases and reservations; do not edit state or transplant
sessions to bypass `native-fault-held` or `identity-drift`. Sources:
[record decisions](../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs),
[work-item controls](../../scripts/archon-factory/pack/.shared/workitem.mjs)
and the [control command](../../scripts/archon-factory/pack/.shared/control.mjs).

## Cleanup evidence and shared capacity

Required settlement priority is **cleanup > unresolved native hold > ordinary
capacity settlement**, including after independent cleanup confirmation. A
`check-capacity` or `check-cancelled` result must not mask or erase a retained
native report, release its run/lease or reservations, or remove its views.
Confirming cleanup clears only the cleanup barrier; re-evaluate the same-run
native hold before considering an ordinary capacity outcome.

Every uncertain MCP check must feed its trusted exact-attempt receipt/labels
into the round's durable cleanup barrier. Retaining only the global check slot
or reduced check JSON is insufficient: issue ownership, reservations and
mounted views must also survive. An independent review found this handoff gap
and it was repaired with regression tests; an independent re-review of the
final source is still open.

Cleanup retains either its original inline receipt or a `receiptReference`
with `path`, `sha256`, `bytes` and exact labels, never both. A reference is not
proof of cleanup. The only accepted reference path is the trusted run artifact
root's `round/cleanup-state.json`. The recorder and
[reconciler](../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs)
check real directories, a regular non-symlink file, no-follow open where
available, file/directory identity before and after reading, byte length, hash
and exact top-level labels. Preserve the original receipt bytes and retained
reference on success and failure. Windows checks do not qualify Linux no-follow
or race behavior.

The trusted round supplies the Docker executable, artifact root, run,
assignment and issue. Reconciliation checks all four full `core.archon.*`
executor/attempt/run/issue labels, then requires successful owned removal and
an independent empty relist. Wrong identity, failed or signaled commands,
missing receipts or changed artifacts retain the hold and views; a bare
`confirmed` marker cannot release ownership. See the
[shared cleanup predicate](../../scripts/archon-factory/pack/.shared/cleanup-state.mjs)
and [record wiring](../../scripts/archon-factory/pack/deliver/scripts/record.ts).

Both [MCP checks](../../scripts/archon-factory/pack/.shared/check-mcp.mjs) and
[trusted heavy checks](../../scripts/archon-factory/pack/.shared/heavy-check.mjs)
release a slot only when `cleanupConfirmed === true` **and** `reusable === true`.
One flag, truthy values, wrapper exit, timeout, cancellation or a dead PID is
insufficient. Receiptless failures retain an unconfirmed owner. Stale reclaim
requires independent successful exact-attempt cleanup with `remaining: []`;
never delete a slot file to make capacity available.

## Reservations and freeze budget

Shared-area reservations, native execution leases and heavy-check slots are
separate ownership. Waiting `feedback` and `deliver` rounds retain their shared
areas. Terminal status or an ended lease alone cannot release them while
native or cleanup evidence is unresolved. The
[reservation sweep](../../scripts/archon-factory/pack/.shared/reservations.mjs)
and [round recorder](../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs)
must confirm safe settlement before release.

The [delivery workflow](../../scripts/archon-factory/pack/deliver/deliver.yaml)
gives `freeze` **130 minutes** (`7800000` ms): up to 129 minutes for clean
installs, two normal hooked commits when hooks rewrite content, and reviewer
views, plus one minute of headroom. Do not shorten it to a per-command timeout
or bypass hooks to fit it. Exhaustion is not cleanup or slot-release proof.

## Where things are

- Issue code: `/srv/core-factory/issues/<n>/repo`, branch `factory/<n>-<slug>`;
  published branches and PRs on GitHub (PR body says "Closes #n").
- Per-round evidence: `/srv/core-factory/runs/<runId>/` (guard decisions in
  `guard.jsonl`, every check in `checks/`, sealed reviews, role materials).
- Per-step ledgers of a round (what `claim`, `freeze`, `publish` and the
  others decided):
  `/srv/core-factory/archon/workspaces/_folder/control/artifacts/runs/<runId>/round/<step>.json`.
- Engine records: `archon workflow get <runId>`, `archon workflow logs <runId>`
  (env `ARCHON_HOME=/srv/core-factory/archon ARCHON_USER_ID=core-factory`).
- Work items: `archon state get core/issues/<n> --project _folder/control`.

A failed check or unresolved review shows on the issue's detail page (PR,
readiness reasons, feedback dispositions) and in the work item's `blocker`.

## Usage limit

When the factory's Claude account has used up its allowance, the AI step that
meets the limit fails. `record` then holds the issue: `$N $C status` shows
`BLOCK:native-recovery`, and the work item's `nativeFaults` carries the reset
time the provider reported. The engine pauses that run until the reset
(`archon workflow status` shows "tries again at ..."). Until then every pass
lists the issue under `swept` in its `eligibility.json` as `recover-native`
with code `reset-pending`, and a held issue keeps its lane, so with both
lanes held nothing new is admitted. Nothing is lost: committed work stays in
the issue clone and on the work item, and no check container is left.

At the reset, with no operator: the engine wakes the same run and it finishes
its round, but `record` keeps the hold and does not record what that round
did. The next pass clears the hold with `recover-native`, and the round is
then run again on the same candidate: its reviews, final acceptance, pre-push gate and publication run a second time, and what the woken round found is not kept: the repeated reviews may find something different. If the engine did not
wake the run, the pass ends it and starts the round again. If the woken run
meets another fault (the limit again, an expired sign-in), the hold takes the
newer fault and its reset time. The pass leaves a held issue alone until two
minutes after the reset, so that it cannot end a run in the seconds in which
the engine wakes it. It also asks the engine when it will wake a paused run,
and leaves that run alone until two minutes after that time, whatever reset
the work item carries. A run that is still paused after that was not woken:
the pass ends it and starts the round again. When the engine cannot be
asked, the pass ends nothing and asks again next time. These rules are in
release `d4ef3329` and later. A usage limit
therefore costs one repeated round per held issue. On 13 November this
was observed twice up to the hold; the part after the reset has not been seen
yet.

What an operator can do in the meantime:

- Nothing. That is the designed path.
- Keep new issues out after the reset: `factory pause-intake`.
- Keep a held issue from continuing at the reset: `issue <n> stop`, then
  `issue <n> recover-native` (it ends the paused run and keeps the work; the
  issue settles as stopped). In that order no pass can start a round in
  between. Later, `issue <n> reopen`.
- Do not try to get past the limit with another account, an API key or
  `archon workflow resume`. A round started before the reset fails on the
  limit again and is held again.

## Somebody pushed to a factory branch

The factory records every head it publishes on an issue's branch
(`factory/<n>-<slug>`). A head it did not publish is somebody else's push.
The usual cause is GitHub's "Update branch" button, which merges `develop`
into the pull request. On 13 November it was pressed on two pull requests the
factory was working on.

What the factory does with such a head, from release `d4ef3329`:

- **In the feedback stage, when the head is the published candidate plus
  nothing but `develop`, joined by clean merges** (that is what "Update
  branch" produces; a merge that carries changes of its own, drops
  `develop`'s or resolves a conflict by hand does not count): the
  factory adopts it as the candidate and reviews it again (freeze, Micaiah,
  Luke, final acceptance, hooked publish) before anything else. No operator
  step.
- **Any other outside head** (somebody's own commit, a rewritten branch, or an
  update pushed while the factory holds a newer candidate it has not
  published yet): the feedback stage blocks the issue `outside-head` before
  it answers or resolves anything on the pull request, with the head and the
  command to put the branch back in the blocker, and the next pass posts the
  notice on the GitHub issue. A round that tries to publish over such a head
  blocks `push-unverified`.
- **A held issue** (provider fault): the hold is cleared onto the feedback
  route, and one of the two cases above follows.

On release `34ce64a7` and earlier nothing is adopted: the feedback stage
blocks on any outside head, and a held issue stays held (`recover-native`
refuses `effects-unreconciled`).

To release a blocked issue when the outside commits are only an update from
`develop`, put the branch back to the head the factory published and retry.
The factory merges `develop` itself when the pull request needs it:

```sh
# <published> is the work item's pr.head; <outside> is the head GitHub shows now.
git push --force-with-lease=factory/<n>-<slug>:<outside> origin <published>:refs/heads/factory/<n>-<slug>
$N $C issue <n> retry --request <id> --by <me>
```

If the outside commits are somebody's own work, decide by hand whether they
belong in the issue; the factory never takes them over unreviewed.

## Waits and sign-in

- **Usage limit:** see [Usage limit](#usage-limit). Retain the same
  owner/profile; no other account and no paid API fallback.
- **Owner sign-in expired:** admission refuses new work for that owner. Sign in
  again as `admin` on the VM:
  `CLAUDE_CONFIG_DIR=/home/admin/.claude /home/admin/.local/share/claude/versions/2.1.317`
  then `/login` (Team subscription, not an API key). Reverify the original
  binding; do not retry native-held work or rewrite its digest after login.
- **GitHub API quota:** the factory's account has 5,000 REST calls an hour. When
  it runs out, observations come back unavailable, nothing is admitted or
  decided on stale evidence, and the next pass after the hourly reset carries
  on. A selector pass uses about 5 calls per scope issue (26 for a five-issue scope
  on 12 November).
- **GitHub sign-in:** the factory's own profile is
  `GH_CONFIG_DIR=/srv/core-factory/credentials/gh` (`gh auth status`). Roles
  never see it.

## Reboot and recovery

An ordinary interruption heals by itself. The engine never declares a running
run dead, so a run whose engine process died (service restart, VM reboot)
would otherwise stay "running" and keep its lane or the admission slot. Before
each admission pass the intake unit runs `.shared/orphans.mjs reap`, which
takes each factory run whose recorded engine process is provably gone,
removes that run's check containers (one may still be writing the issue's
workspace) and then abandons the run. A run whose containers cannot be
confirmed gone is left for the next pass. The sweep in the same pass settles
the issue back to waiting and starts its next round, which follows what the
interrupted round had recorded: a candidate it had committed goes to review
only, acceptance it had defined goes to the implementer (the next commit
carries the tests the acceptance author recorded), and anything earlier runs
the round again. Unfinished code stays in the issue clone. A round that was
waiting (the feedback cooldown) is not orphaned: the engine resumes it by
itself. This takes at most one timer interval (ten minutes). `journalctl -u
core-factory-intake.service` shows what was cleared.

A round stopped in the seconds between its commit and the record of that
commit is covered too: the next round that commits work takes the unrecorded
commit back into the working tree and commits it again through the hooks
(the claim ledger records it as `restoredCommit`). This was proven on 13
November by killing the engine at that moment.

One case is not healed by itself: a round whose `record` step did not
settle the work item (it crashed, timed out or was refused) while another
step had failed. The engine then reports the run `failed`, a failed run keeps
its issue's lease, and neither the orphan step nor the sweep touches it. The
issue stays `active` with nothing running and no blocker. Check that the
work item has no `nativeFaults` and that no check container of that run is
left (`docker ps -a --filter label=core.archon.run=<runId>`; remove any it
lists), end the run with `archon workflow abandon <runId>` (nothing executes
in a failed run), then `issue <n> reconcile`.

That path covers ordinary rounds only. For a run with a native or cleanup
hold, inspect the engine/run metadata, immutable identity binding, native
reports, cleanup evidence, work-item lease and reservations before acting. Do
not call the engine resume endpoint yourself: use `issue <n> recover-native`,
which reconciles same-run identity and effects first (Native identity and
fault evidence). Preserve unresolved work.

Only an ordinary ended run without unresolved native/cleanup evidence can be
settled by `issue <n> reconcile` or the intake sweep. The sweep can re-fire a
missed successor while intake is paused, subject to its durable gates; neither
path touches a live lease or overrides a hold. Each round start is keyed
`${assignment}:r${round+1}:v${revision}` with the work item's revision, so a
replayed start is a no-op and any write to the item gives the next start a new
key.

## Base conflict

When readiness cannot merge the target branch into the PR, the issue is
BLOCKED `base-conflict` and its blocker lists the files and the recorded head.
Resolve it from your own checkout, not the factory's issue clone:

```sh
git fetch origin
git switch -C factory/<n>-<slug> <recorded head>
git merge origin/develop          # a merge, not a rebase
# resolve the conflicts, commit the merge
git push origin factory/<n>-<slug>
```

Then `issue <n> retry`. Readiness adopts the pushed head only if it contains
the conflicted candidate; it records it as the candidate and sends it through
the review-only route (freeze, Micaiah, Luke, final acceptance, hooked publish)
before any merge. A pushed head that does not contain the candidate is not
adopted and the issue blocks again.

Readiness integrates the base by itself only when no repair for Ezra or Bezalel
is pending. A round that resolves review threads answers WAIT and decides in
the next round. A thread someone unresolves after the factory resolved it goes
back to Samson, flagged reopened.

## Merge queue on develop

GitHub's merge queue replaces the "Require branches to be up to date before
merging" rule. It is available here only while the repository is public and
owned by an organization; a private repository needs GitHub Enterprise Cloud.
The factory sees a queue only when a repository **ruleset** requires it: the
REST branch-protection response has no merge-queue field, so do not use the
classic rule's "Require merge queue" box. With a queue rule, readiness stops
asking a branch that is only behind `develop` to update, and the merge lane
adds the pull request to the queue instead of merging it (OpenSpec change
`support-factory-merge-queue`). Without one, nothing changes.

Check first:

1. The installed release contains that change, merge-lane wiring (its task
   3.1) included. Until it is installed, set `factory hold-merge` while the
   queue is on; otherwise the factory's direct merge is refused and the issue
   blocks `merge-refused` (it is never reported merged).
2. Every required check reports on `merge_group`. `ci.yml` and
   `ci-integration.yml` both trigger on it, and the #2201 acceptance test
   (`tests/unit/acceptance/issue-2201/merge-group.acceptance.test.ts`) expects
   all three apps to compile there and `test-e2e` to be skipped; `ci-gate`,
   `migrate`, `smoke` and `e2e-smoke-gate` still report. No `merge_group` run
   has happened yet, so the first queued pull request is the first real test.

Turn it on (repository admin, in this order so `develop` is never unprotected):

1. Settings → Rules → Rulesets → New ruleset → New branch ruleset. Name
   `develop merge queue`, Enforcement status **Active**, empty bypass list,
   Target branches → Add target → Include by pattern → `develop`.
2. Tick **Require merge queue**: Merge method **Merge commit** (the repository
   allows only merge commits), **Require all queue entries to pass required
   checks** on, Status check timeout **120** minutes (the integration jobs
   allow up to 50 + 10 + 25 minutes), other values as offered. Rules the form
   pre-selects, such as blocking force pushes and deletions, repeat what the
   classic rule already enforces. Create.
3. Settings → Branches → edit the `develop` rule → untick **Require branches
   to be up to date before merging**; keep the four required checks. Save.
4. Read back: `gh api repos/Asymmetric-al/core/rules/branches/develop --jq '.[].type'`
   lists `merge_queue`, and
   `gh api repos/Asymmetric-al/core/branches/develop/protection --jq .required_status_checks.strict`
   prints `false`.

Watch the first factory merge: the pull request appears on the `develop` queue
page and `merge_group` runs of both workflows start. The round answers WAIT
("Added to the develop merge queue"), the work item's `pr.mergeRequest.status`
is `queued`, and each later round answers WAIT ("Still in the develop merge
queue") until GitHub merges it; the round after that records MERGED with
`merged_by: external`, because the queue, not a factory request, made the
merge commit. The factory never enqueues the same head twice.

Each of those WAITs is a feedback round, counted in the same budget of 12 as
the rounds the issue already spent on its pull request's checks and reviews.
So the issue can block `feedback-limit` while its pull request is still queued
and healthy, not only after the queue removed it (a failed `merge_group`
check, or a person). A blocked issue does not notice when the queue merges its
pull request later. Look at the pull request, then:

- merged or still queued: `issue <n> retry`. The next round records MERGED if
  the queue has merged it meanwhile, otherwise it waits again with a fresh
  budget;
- removed from the queue: re-add it with **Merge when ready**, then
  `issue <n> retry`. While the ruleset requires the queue, a direct merge is
  refused, so this is the only way to merge it.

`factory hold-merge`, an issue hold or a stop only keeps the factory from
enqueueing. None of them takes a pull request out of the queue, and GitHub
still merges one that is queued. To stop a queued merge, remove its entry on
the `develop` queue page.

If the enqueue's outcome is unknown (GitHub's answer had no queue entry, its
errors did not all say that it rejected the request, or the response was
lost), the issue blocks `merge-unconfirmed` with `pr.mergeRequest.status`
`unknown`. The pull request may be queued, so do not clear that record and do
not merge it directly (GitHub refuses that while the queue is required). Look
at the `develop` queue page:

- the pull request is there: leave `pr.mergeRequest` as it is, and run
  `issue <n> retry` only after GitHub reports it merged. That round records
  MERGED;
- it is not there: add it with **Merge when ready**, then run
  `issue <n> retry` only after GitHub reports it merged.

A retry before GitHub reports the merge blocks `merge-unconfirmed` again; the
factory never enqueues a head whose request is unknown.

If the issue stops at `PR_READY` instead of being enqueued, with "Required
human review pending (0/0)", and the round's `readiness-observation` shows
`state: blocked`, GitHub reports queued-base pull requests as blocked and
readiness cannot tell; turn the queue off and report it. People merge by hand
with **Merge when ready**.

`develop` requires no code-owner review today. If it ever does, readiness
counts that review as given only when GitHub reports the pull request
`clean`, so a pull request GitHub reports `behind` stops at `PR_READY`
("Required human review pending (0/0, code owners)") even under the queue. A
person checks the code owner's approval and adds it with **Merge when ready**.

Turn it off (restore the rule first, again so `develop` is never unprotected):

1. Settings → Branches → edit the `develop` rule → tick **Require branches to
   be up to date before merging**. Save.
2. Empty the queue (remove each entry on the queue page, or let it drain);
   GitHub's documentation does not say what happens to entries when the rule
   goes away.
3. Settings → Rules → Rulesets → `develop merge queue` → Enforcement status
   **Disabled** (or delete it). Read back as in step 4 above: no
   `merge_queue`, `strict` is `true`.

The factory resumes direct merges when the queue rule is disabled. A queued
request keeps the factory waiting for that same head commit. If restoring
strict checks requires a base update, the factory can publish a new head,
carry reviews forward, and merge directly once checks pass.

To prevent factory merges during shutdown, activate `factory hold-merge`
before disabling the queue. If a pull request remains open on the same queued
head after shutdown, merge it by hand, then run `issue <n> retry` if the issue
has blocked.

## Backups, restore and updates

### Backups

`/srv/core-factory/backups/<stamp>/` holds `archon.db` (SQLite online backup,
integrity-checked), `control-and-runs.tgz` (control folder and run evidence),
`engine-runs.tgz` (the engine's round ledgers, frozen workflow sources and
state, which a restored engine needs to continue paused rounds) and, per issue,
a Git bundle of unpushed commits, a binary patch of uncommitted changes and a
tarball of untracked files. The bundle and the tarball are written only when
there is something to hold; the patch is always written and is empty for a
clean clone. Files a round set aside under
`runs/<run>/strays/untracked` are not in the backup. Each part is captured on
its own, so one failure
does not stop the rest. `manifest.json` lists every file with its hash and
carries `complete` and `failures[]`. A non-zero exit of
`core-factory-backup.service` means a partial backup: read `failures` in its
manifest.

- A clone without its factory-written `issues/<n>/git-trust.json` is recorded
  as a failure and Git never runs in it; recreate that clone.
- Directories under `issues/` that are not issue numbers are skipped with a
  warning in the manifest.
- Retention keeps the newest 14 backups and also the newest 14 complete ones.
- Copy backups off the host; a backup on the same disk does not survive the
  disk.

### Restore

1. Stop dispatch first:
   `sudo systemctl disable --now core-factory-intake.timer`, then
   `sudo systemctl stop core-archon`.
2. Restore into an isolated place. Check the manifest (`complete`, `failures`),
   `PRAGMA integrity_check` on `archon.db` and `git bundle verify` on each
   bundle. `engine-runs.tgz` unpacks into `ARCHON_HOME`.
3. For a replacement host, separately reprovision the reviewed runtime inputs
   at their recorded paths before starting any restored model or resume. The
   backup does not reconstruct the installed release/launcher, actual
   Claude/Node/Archon/provider executables, managed settings, Archon configuration,
   or service HOME/profile. Match their recorded hashes and securely provision
   the same authorized account; keep credentials out of backup artifacts.
   `manifest.complete` describes captured backup parts, not a resumable host.
   Validate the retained `native-identity.json` with `readRunIdentity` and
   independently call `verifyNativeIdentity` with its `expectedDigest`. A mismatch
   remains held; never replace the immutable binding with the ambient identity.
4. Make it the single active engine only after the original is stopped. Never
   run two engines on the same scope. Before starting it, verify that durable
   intake pause/holds survive restoration. Reconcile same-run identity/effects,
   cleanup and reservations; an unresolved native hold stays held until
   `recover-native` accepts its evidence. Do not re-enable intake merely because
   restore integrity checks pass; all commissioning prerequisites still apply.

### Updates

**Before any install: the release name.** A release is named after the digest
of `pack/` alone (`policyRevision`). An install that changes nothing under
`pack/` keeps the installed release's name: it reuses that release's directory
and overwrites its `release.json`. When such an install changes a setting or
a binary that the release binds (the role settings, `/etc/claude-code`,
`ARCHON_HOME/config.yaml`, Node, native Claude and its launcher, the engine or
the provider plugin), every retained item is then refused `identity-drift`,
and `adopt-policy` refuses it as `policy-current`, so nothing can move it. Do
not run such an install until this is fixed. An install whose `pack/` equals
an older release's (a rollback) takes that release's name in the same way and
overwrites its `release.json`. So before any install, with the stage of step
2 in place, print the staged pack's digest and the installed release's:

```sh
# On the VM, as admin; $N as in Controls, $S as in step 2.
$N --input-type=module -e 'const { stageIdentity } = await import(process.argv[1] + "/installation/install-logic.mjs"); console.log(stageIdentity(process.argv[1]).packDigest)' "$S/scripts/archon-factory"
$N -p 'JSON.parse(require("fs").readFileSync("/srv/core-factory/control/.archon/core-factory-release.json", "utf8")).policyRevision'
ls /opt/core-archon-factory/releases/
```

The first line must differ from the second, and its first 16 characters must
not name a directory of that listing (re-running the same stage after a
failed install, step 5, is the one exception). The Node 24.22.3 install
planned for 19 November 2026 is not such an install: `pack/` at that change
digests to `19218b95…`, and the installed release is `d4ef3329…`.

1. Pause intake (`factory pause-intake`, or `factory drain` to let admitted work
   continue) and inspect every retained assignment (`$N $C status`). A policy
   switch requires every assignment to be settled: MERGED, PR_READY, BLOCKED or
   stopped. An issue that can still start a round (pending, waiting or active)
   must finish first, or be stopped with `issue <n> stop`. Unresolved
   native/cleanup holds, live or ambiguous leases, and unreconciled runs/routes
   also prevent a switch. Preserve their work and original bindings; back up
   before an eligible update.

   An issue held on a provider fault has to be cleared first:
   `issue <n> stop`, then `issue <n> recover-native`. During a usage limit do
   this only when the new release cannot wait for the reset. After
   `adopt-policy` and `reopen` (step 8) the issue's next round meets the limit
   again and the issue is held again, which is what happened on 13 November.

2. Stage exactly one reviewed, pushed commit and run the installer from that
   stage, so the release record names the commit:

   ```sh
   # In a Linux or WSL checkout that has the commit (on Windows `git archive`
   # rewrites line endings). Copy "$S" to the VM if it was made elsewhere.
   S=/home/admin/factory-stage/<commit>          # an empty directory
   git archive <commit> scripts/archon-factory | tar -x -C "$S"
   git rev-parse <commit> > "$S/scripts/archon-factory/SOURCE_COMMIT"
   # On the VM, as root:
   cd "$S/scripts/archon-factory"
   sudo /opt/node-v24.22.3-linux-x64/bin/node installation/install.mjs \
     --stage "$S/scripts/archon-factory"
   sudo systemctl daemon-reload && sudo systemctl restart core-archon.service
   ```

   The installer takes the pinned engine binary and webhook plugin from the
   installed copies (`/opt/archon/0.14.0/archon`,
   `/opt/core-archon-factory/plugins/standard-webhooks.mjs`) when the build
   copies of the first install are gone; `--archon <file>` and
   `--plugin <file>` name others. Either way the bytes must match the pins.

   The installer needs network access to GitHub releases (the pinned launcher
   downloads the engine server and web UI and verifies them against its
   embedded checksums, and adds any missing provider or forge plugin the same
   way) and the check image `core-archon-checks:node24.22.3-bun1.4.3-jq` with
   the exact pinned image ID.

   Which Node runs what. The pins name Node 24.22.3
   (`/opt/node-v24.22.3-linux-x64`, on VM 100 since 18 November 2026); Node
   24.22.1 (`/opt/node-v24.22.1-linux-x64`) stays installed. The controls
   (`$N $C`) and the installer do not depend on the Node that runs them: the
   controls' identity checks hash the Node that the installed release record
   names (`node` in `core-factory-release.json`), and the installer checks its
   own pinned path. So `$N` above runs the controls before and after the install, as long
   as both directories stay. The install moves everything it writes to the new
   Node at once: before it, the engine's `PATH`, the intake pass, the backup,
   the guard hook, the check MCP server and the native Claude launcher use
   24.22.1, and every check runs in `core-archon-checks:node24.22.1-bun1.4.3-jq`;
   after it, with `daemon-reload` and the engine restart, they use 24.22.3 and
   the image above. Do not remove 24.22.1: earlier releases' records name it.
   The installer does not write the Console's unit
   (`installation/core-factory-console.service`, copied by hand) or its
   `FACTORY_NODE` in `owner.env`, so the Console stays on 24.22.1 until that
   unit is copied again and `FACTORY_NODE` changed. That is harmless while
   24.22.1 stays installed: the Console runs the controls, which do not depend
   on their Node.

   Without `SOURCE_COMMIT` the release is recorded with no source. The
   installer records the commit you declare and does not check it against Git.
   To prove it, run the same command in the installed pack
   (`/srv/core-factory/control/.archon/workflows/core-factory`) and in
   `scripts/archon-factory/pack` of the staged commit, and compare the two
   lines it prints:

   ```sh
   find . -type f | LC_ALL=C sort | xargs sha256sum | sha256sum
   ```

   Run both on Linux or WSL: Git Bash on Windows prints the per-file lines
   differently, so its final line never matches.

3. It verifies everything before changing anything: pinned binary hashes, the
   engine pieces, plugins (added into a temporary home and checked against
   their pins and receipts), the settings inputs, the configuration to install
   (with the staged pack's own validator) and the check slots. If the pack or
   any settings input changed (a policy switch), it refuses unless intake is
   paused and every work item is a validated, settled item (MERGED, PR_READY,
   BLOCKED or stopped) with no retained execution ownership or run. It names
   each BLOCKED, PR_READY or stopped issue that stays on the previous release.
   There is no override; `--allow-policy-change` no longer exists.
4. Old-format check slots (`/srv/core-factory/locks/check-slot-<n>` whose owner
   is a bare PID) are removed when their process is gone; the install refuses
   while one is held by a live process. This legacy-file migration is not
   exact-attempt cleanup proof or authority to reuse an unresolved workload.
5. If a later step fails (folder registration, `trigger whoami`, initializing
   `core/factory`), the release record still names the previous release: keep
   intake paused and re-run the installer.
6. It writes `control/.archon/core-factory-diagnostics.json` and exits 1 if a
   required diagnostic (`archon version`, `validate workflows`) fails; `doctor`,
   engine-active and health are advisory. Keep intake paused and read that file.
   It enables the services for boot but starts nothing, so an engine you stopped
   for the update stays stopped until you start it. Previous releases stay
   under `/opt/core-archon-factory/releases/`.
7. When the install changes the check image, or the Node or Bun that the
   checks run on, qualify the installed image with the full publication
   qualification before any issue is retried, reopened or admitted. Paused
   intake stops admission only: `retry` and `reopen` (step 8) start rounds,
   and an issue with a candidate goes straight to review and the hooked
   publish, whose pre-push gate runs in the new image. The qualification is
   that gate on a synthetic workspace: it fetches the mirror, clones and
   installs `develop`, commits one file through Core's pre-commit hook and
   pushes it through the pre-push gate (`ci:preflight`) into the workspace's
   private outbox, all in the executor. It writes nothing to GitHub.

   ```sh
   # On the VM, as admin, with intake still paused; $N as in Controls.
   # <q>: a workspace number of 900000 or more that has no directory under
   # /srv/core-factory/issues yet (900204 was used on 11 November 2026).
   S=/home/admin/factory-stage/<commit>          # the stage of step 2
   CORE_FACTORY_CONFIG=/srv/core-factory/control/core-factory.json \
     $N "$S/scripts/archon-factory/qualification/publication.mjs" <q>
   ```

   It prints one line per step and keeps them, with each container's
   receipt, in `/srv/core-factory/runs/qualification-publication-<q>/`
   (`steps.jsonl`, `commit.json`, `pre-push.json`). A step that breaks ends it
   with a non-zero exit, but the gate's own result is recorded, not thrown, so
   read it. The qualification passed only when the `post-commit` line shows
   `"commitStatus":"passed"`, `"commitHooksRan":true` and `"clean":true`, and
   the last line (`outbox`) shows `"prePush":"passed"`,
   `"prePushHooksRan":true` and `"matchesCandidate":true`; the gate's output
   in `pre-push.json` holds `==> PASS ci:preflight` and
   `core-factory: pre-push hook passed`.

   If anything else shows, keep intake paused and retry, reopen and admit
   nothing. Read `steps.jsonl` and the receipts. A failure that comes from the
   image (a missing or wrong tool or version) needs a new image and a reviewed
   pin change, which is a new release and a new install; a failure in
   `develop`'s own code or tests is a fix in the repository. Only when the gate
   failed on unit tests alone, run the qualification once more with a new
   number; hand a second failure to a person.

8. After step 7 has passed, where it applies: an issue left on the previous
   release refuses `retry`, `reopen` and `release`
   (`policy-transition-required`), and a round started for it blocks it
   `policy-changed`. Move it explicitly, one issue at a time:

   ```sh
   $N $C issue <n> adopt-policy --request <id> --by <me> --reason "why"
   $N $C issue <n> retry --request <id2> --by <me>    # BLOCKED
   $N $C issue <n> reopen --request <id2> --by <me>   # stopped
   ```

   `adopt-policy` works only on a BLOCKED or stopped issue that no run owns
   (stop a PR_READY issue first). It is refused under a cleanup or native hold,
   a live lease or an unverifiable installed release. It starts nothing. It
   records the previous and new release on the assignment
   (`assignment.transitions`) and on the request, and drops the reviews and
   final acceptance earned under the previous release: an issue with a
   candidate goes through the review-only route again (freeze, Micaiah, Luke,
   final acceptance, hooked publish) before anything is published or merged.
   Its branch, PR, acceptance and history stay as they are.

   The assignment's identity digest covers the release, so it moves too, and
   only after proof that the account is unchanged: the digest is recomputed
   from the previous release's record
   (`/opt/core-archon-factory/releases/<first 16 of its revision>/release.json`,
   kept by the installer) with the account signed in now, and must equal the
   retained digest. Another account is refused (`identity-account-drift`), a
   record that does not reproduce the digest is refused (`identity-drift`), and
   a missing record is refused (`predecessor-release-unavailable`). Keep the
   previous release's directory until every issue bound to it has been moved
   or has finished.

9. Then, with step 7 passed where it applies, use `factory resume` if the
   factory was stopped, and `factory resume-intake` for the authorized scope.

The settings digest covers the control folder's role files
(`.archon/config.yaml`, `.claude/settings.json`, `CLAUDE.md`,
`mcp/core-check.json`), everything under `/etc/claude-code` (Claude Code's
managed policy) and `ARCHON_HOME/config.yaml`. The installer writes the control
files and `ARCHON_HOME/config.yaml` itself, so hand edits are overwritten. A
change to any of them, `/etc/claude-code` included, is a policy switch: make it
only with the factory prepared as in step 1, then re-install.

`core-factory.json` is written by the installer, which keeps the operator-owned
values (`owners`, `defaultEndState`, `reviewProviders`, `limits`) from the
existing file:

- `reviewProviders` defaults to `[]`. A list such as
  `[{"login":"coderabbitai[bot]","required":true,"skipMarkers":["Review skipped"]}]`
  makes readiness wait for a review of the current head from each required
  provider; a skip marker it posts ends the wait but leaves a person to confirm
  review coverage.
  Two optional keys match how each bot really reports. `appSlug` (for example
  `"coderabbitai"` or `"cursor"`) also reads that GitHub App's check runs on
  the current head: all finished and all successful is a review of that head
  (CodeRabbit reports a clean head this way, without a formal review). Finished
  any other way (skipped, neutral, cancelled, failed) means the bot did not
  review it: the pull request can still become ready, but it is never merged
  by the factory until a person confirms. `"coverage":"once"` is for a bot
  that reviews a pull request only when it opens (Cursor here): a review of an
  earlier head covers it, and readiness says so in its reasons. That is a
  choice: with it, a head repaired after the first review can be merged
  without that bot having seen it. A bot that never reviewed still blocks the
  wait.
- `limits.checkQueueMs` (default 600000; 1800000 on VM 100) is how long a
  role's check waits for a free heavy-check slot before it is reported as not
  run. With two lanes one issue's pre-push gate can hold the slot for several
  minutes, so keep it well above that.
- There is no `bindings` key; every start is a signed webhook.

## Disk-space guard

Admission, publication and merge each refuse when disk space or inodes are
short, or when the service cannot write where it needs to. The thresholds are
the operator's, in `storage.reserves` in
`/srv/core-factory/control/core-factory.json` (`storage` also needs
`"version": 1`; the installer keeps the whole block):

| Reserve     | Applies to                                             | VM 100 value              |
| ----------- | ------------------------------------------------------ | ------------------------- |
| `state`     | `ARCHON_HOME`, the factory root, `runs`, `locks`       | 5 GiB and 100,000 inodes  |
| `artifacts` | `ARCHON_HOME/workspaces`, the run's artifact directory | 5 GiB and 100,000 inodes  |
| `checkout`  | `issues`, `views`, `mirror.git`, the issue's clone     | 20 GiB and 500,000 inodes |
| `cache`     | `cache`                                                | 10 GiB and 200,000 inodes |

- Without a `storage` policy every admission is refused
  (`STORAGE_POLICY_MISSING`); the selector's `admit` output says so.
- A refusal names a code and the directory's role, never a path:
  `STORAGE_BYTES_LOW`, `STORAGE_INODES_LOW`, `STORAGE_DIRECTORY_UNAVAILABLE`
  (a directory is missing), `STORAGE_PROBE_FAILED` (the service could not
  write a probe file there). Free space or repair the directory; the next
  selector tick or an issue `retry` tries again.
- The root-owned control folder is not probed: the service never writes it.
- `storage.additionalTargets` (up to 16 `{path, minAvailableBytes,
minAvailableInodes}`) adds reserves for other mounts.

## Resetting an item during commissioning

Prefer `adopt-policy` (Updates, step 8): it keeps the issue's work. A reset
discards the work item so the selector admits the issue again from the start.
While commissioning it was used for items a defect had stranded before
`adopt-policy` existed. Do this only when the item has no run, no live lease,
no published branch and no PR; preserve an unpublished local commit as a
bundle first:

```sh
A=/opt/archon/0.14.0/archon   # with ARCHON_HOME and ARCHON_USER_ID as in Controls
$N $C factory pause-intake --request <id> --by <me>
mkdir -p /srv/core-factory/retired/commissioning-resets
$A state get core/issues/<n> --project _folder/control > /srv/core-factory/retired/commissioning-resets/issue-<n>-<stamp>.json
$A state delete core/issues/<n> --if-revision <revision> --project _folder/control
```

Then follow [Updates](#updates) from step 2: the release-name check before
it, the install and the engine restart, the qualification of step 7 when the
install changes the check image or the Node or Bun the checks run on, and
`factory resume-intake` only at step 9. An item that has a published branch
or an open PR is never reset: use `adopt-policy`.

## Storage failure

### Recorded host incident - 11 November 2026

The hardware observations and mitigation below are dated incident history, not
a fresh health check. The disk-space guard above protects admission,
publication and merge; it does not detect this hardware fault.

The Proxmox host boots from, and keeps `local-lvm` (VM 100 and VM 101 disks) on,
a Samsung 870 EVO SSD that is attached over **USB 3 through a JMicron JMS578
bridge** (`152d:0578`), not a motherboard SATA port. In UAS mode this bridge
resets under sustained queued writes and finally drops off the bus: the last
three host boots before 11 November 2026 all ended that way (`uas_eh_abort_handler`,
`usb 2-1: reset SuperSpeed USB device`). The drive's own SMART data is clean.

Mitigation recorded on 11 November 2026: the host kernel command line carries
`usb-storage.quirks=152d:0578:u` (`/etc/default/grub`, then `update-grub`;
original saved as `/root/grub.default.pre-uas-quirk-20261111`), which forces the
bridge to the bulk-only `usb-storage` driver. Check it with
`cat /proc/cmdline` and `readlink /sys/bus/usb/devices/2-1:1.0/driver`
(must end in `usb-storage`). A full `ci:preflight` plus a Console build ran
afterwards with no storage error.

Symptoms of a recurrence: VM root read-only (`emergency_ro`), `I/O error,
dev sda`; on the host `/proc/partitions` lists no `sd*` device and `local-lvm`
is inactive.

1. Confirm which guests run (normally only VM 100; VM 101 is stopped). Nothing
   on the failed disk can be written; copy anything still readable off the VM
   first if it matters.
2. A remote full power cycle usually brings the bridge back:
   `echo pci > /sys/kernel/reboot/type; echo cold > /sys/kernel/reboot/mode;
echo b > /proc/sysrq-trigger` on the host (binaries on the dead root may fail
   with EIO; these are kernel interfaces). Firmware boot order falls back to the
   old `pve-OLD` install on NVMe if the SSD stays missing.
3. After it returns: confirm `local-lvm` active, VM 100 running (it starts on
   boot and runs `fsck`), `systemctl status core-archon`, reconcile `running`
   rounds as above, and take a fresh backup.
4. Durable fix (needs a person, not urgent while the quirk holds): move the SSD
   to an onboard SATA port (ports 5-8 are empty) or move VM disks to the healthy
   WD SN850X NVMe drives.

## When an issue blocks on its workspace

These blocks mean the issue clone is not in the state the round expects.
`retry` alone repeats them; look first, in `/srv/core-factory/issues/<n>/repo`
and the round's evidence under `/srv/core-factory/runs/<run>/strays`.

| Blocker                                                                      | What it means                                                                                               | What to do                                                                                                                                                      |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `acceptance-strays`                                                          | Files outside the issue's source and test paths were dirty before or after Ezra                             | Save the named files if they matter. Move untracked ones out of the clone; put tracked ones back with `git restore --staged --worktree -- <file>`. Then `retry` |
| `acceptance-tampered`                                                        | A test the acceptance author recorded is missing from the workspace or no longer holds the recorded content | See below the table                                                                                                                                             |
| `candidate-integrity`                                                        | The commit holds a path it may not, or lacks a recorded acceptance test                                     | Read the blocker detail; a missing test is in the round's `strays` evidence. Restore, then `retry`                                                              |
| `no-progress` with "uncommitted work on a different revision" in the history | The clone has uncommitted work on a different commit than the recorded one; three starts stopped on it      | See below the table                                                                                                                                             |
| `review-precondition`                                                        | The recorded candidate is not what the clone has checked out, or it is dirty                                | Make the clone's HEAD the recorded head with a clean tree, then `retry`                                                                                         |

A round stopped just after its commit and before that commit was recorded
used to end in `acceptance-tampered` or the dirty-workspace block. The next
round now recovers it by itself (Reboot and recovery). The manual steps below
remain for an issue that still blocks this way. Check for it in the clone: `git reflog -5` shows a `factory round` commit that is
not the recorded commit (the work item's `head`, or its `base` while `head`
is still empty in a first round). Its content is that commit, not the `strays`
evidence. To recover, put its files back as uncommitted work on the recorded
commit and retry, so the next round commits them again:

```sh
cd /srv/core-factory/issues/<n>/repo
git status --porcelain                    # move anything listed out of the clone first
git checkout <unrecorded commit> -- .     # its files, as uncommitted work
git status --porcelain                    # only the issue's source and test paths
```

If the clone is still on the unrecorded commit (the dirty-workspace block), use
`git reset --soft <recorded commit>` instead: it keeps the same files as
uncommitted work. Then `issue <n> retry`. These steps follow from the code
and have not been exercised on the VM. If the test content differs from what the work item
records for another reason (someone edited a test), there is no control that
has acceptance defined again for a blocked issue: restore the recorded
content, or stop the issue and decide by hand.

If a blocker is not understood, stop the issue (`issue <n> stop`) and leave
the clone as it is: nothing is lost while it is stopped.

## What always needs a person

Physical hardware repair; native Claude or GitHub sign-in; authorizing a scope
and its end state (`PR_READY` or `MERGED`); any required human review GitHub
enforces; decisions the factory raises as BLOCKED with a recovery step; a
provider-fault hold the engine did not classify as recoverable (sign-in,
budget, configuration, unclear effects); and any decision about the Claude
plan when the usage limit stops the factory, which can otherwise only wait
for the reset.
