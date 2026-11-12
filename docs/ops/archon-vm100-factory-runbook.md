# Core factory on VM 100: operator runbook

One pinned Archon 0.14.0 engine and the Core pack run on the Proxmox guest
VM 100 (`core-dev`). Design and contracts:
[pack README](../../scripts/archon-factory/pack/README.md). Dated installation
evidence and open checks: [commissioning record](archon-vm100-commissioning.md).
The paths and commands below are operating guidance, not a fresh readback of
the installed release or services.

## Current state - 12 November 2026

The factory is installed and delivered both authorized issues (#2233 merged,
#2234 pull request ready). The scope holds only those two issues, so nothing
else is admitted until the owner approves a new scope. Before changing a
release or admitting more work, read the open checks in the
[commissioning record](archon-vm100-commissioning.md#still-open). The safety
gates below supersede older unconditional retry/resume guidance.

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

| Unit                           | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `core-archon.service`          | The engine (`127.0.0.1:39190`, trigger host `core-dev`)               |
| `core-factory-intake.timer`    | Every 10 minutes: signed start of `core-select` (admission and sweep) |
| `core-factory-backup.timer`    | Daily 03:30: coherent backup to `/srv/core-factory/backups`           |
| `core-factory-console.service` | The Console (`127.0.0.1:39342`)                                       |

`systemctl status core-archon core-factory-console`; logs with
`journalctl -u core-archon -n 200`.

## Controls

For a qualified installed release, the Console's Controls panel and this
command expose the same controls. Verify the installed policy first. Every
mutation needs a unique `--request` id of 8-128 letters, digits, `.`, `_`, `:`
or `-`; repeating an id does not authorize a new effect:

```sh
C=/srv/core-factory/control/.archon/workflows/core-factory/.shared/control.mjs
N=/opt/node-v24.22.1-linux-x64/bin/node
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
| Move a blocked or stopped issue to a new release  | `$N $C issue <n> adopt-policy ...` (then `retry` or `reopen`; see Updates)                                                          |
| Let one issue's scope reach protected paths       | `$N $C allow-protected <n> 'package.json,.github/**' ...` (`all` for every protected path, `none` to revoke)                        |
| Change ranking                                    | `$N $C prioritize <n> <0-100> ...`                                                                                                  |
| Cancel one run                                    | `$N $C cancel-run <runId> ...` (holds the issue first; release remains subject to all safety gates)                                 |

Hold, stop and drain never abandon a run or delete work: they take effect at
the next round boundary, and unfinished code stays in
`/srv/core-factory/issues/<n>/repo`. Never use `archon workflow abandon` on a
delivery run unless the run's owner is verifiably gone; it can delete files.

- `retry`, `reopen`, `release` and `adopt-policy` verify the owner's signed-in
  account, so run them as `admin` with the owner's profile in the environment
  (`HOME=/home/admin CLAUDE_CONFIG_DIR=/home/admin/.claude`); otherwise they
  refuse `identity-profile-environment-mismatch`. The Console sets both.
- `retry`, `reopen` and `release` require evidence that the installed policy
  still matches the retained assignment. Missing policy evidence or a changed
  policy refuses the control before mutation; these controls never rebind an
  assignment or replace its native account digest. Identity drift and unresolved
  native/cleanup holds also refuse recovery. Ordinary same-policy `retry` and
  `reopen` reset round budgets, subject to those safety gates.
- `reconcile` settles an ordinary active item only after matching engine
  completion/cancellation (or an ended lease for that same run), with no live
  lease or unresolved native/cleanup hold. The item then waits on that run's
  route. It is not identity/effects reconciliation. On an otherwise safe pending
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
  the repeated cancel with HTTP 400 because the run has already ended; read
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
  area do not count.

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

Finite recovery requires explicit same-run identity/effects reconciliation,
including independent remote branch/GitHub readback for uncertain publication
or merge effects. **A trusted recovery operation for those native holds is
currently unavailable.** `native-recovery` is a classification, not a supported
resume command. `retry`, `reopen`, `release`, ordinary `reconcile`, lease expiry,
sign-in or a quota reset cannot substitute for that evidence. Preserve the
binding, native reports, views, work item, leases and reservations; do not edit
state or transplant sessions to bypass `native-fault-held` or `identity-drift`.
Sources: [record decisions](../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs)
and [work-item controls](../../scripts/archon-factory/pack/.shared/workitem.mjs).

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
- Engine records: `archon workflow get <runId>`, `archon workflow logs <runId>`
  (env `ARCHON_HOME=/srv/core-factory/archon ARCHON_USER_ID=core-factory`).
- Work items: `archon state get core/issues/<n> --project _folder/control`.

A failed check or unresolved review shows on the issue's detail page (PR,
readiness reasons, feedback dispositions) and in the work item's `blocker`.

## Waits and sign-in

- **Quota wait:** distinguish a qualified same-run native wait from a typed
  quota fault requiring `owner-action` or `native-recovery`. A reported reset
  does not itself authorize continuation or clear a stored hold. Retain the
  same owner/profile; no other account, paid API fallback or automatic retry.
  Other authorized work can continue only within independently proven capacity.
- **Owner sign-in expired:** admission refuses new work for that owner. Sign in
  again as `admin` on the VM:
  `CLAUDE_CONFIG_DIR=/home/admin/.claude /home/admin/.local/share/claude/versions/2.1.317`
  then `/login` (Team subscription, not an API key). Reverify the original
  binding; do not retry native-held work or rewrite its digest after login.
- **GitHub sign-in:** the factory's own profile is
  `GH_CONFIG_DIR=/srv/core-factory/credentials/gh` (`gh auth status`). Roles
  never see it.

## Reboot and recovery

After a VM or service restart, keep admission paused and inspect the actual
engine/run metadata, immutable identity binding, native reports, cleanup
evidence, work-item lease and reservations. An active service or a paused,
failed, cancelled or apparently ownerless run is not reconciliation proof.
Do not blindly call the engine resume endpoint: same-run identity and effects
must be reconciled first, and the native-hold recovery operation is unavailable.
Preserve unresolved work and request the missing implementation/qualification.

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

## Backups, restore and updates

### Backups

`/srv/core-factory/backups/<stamp>/` holds `archon.db` (SQLite online backup,
integrity-checked), `control-and-runs.tgz` (control folder and run evidence),
`engine-runs.tgz` (the engine's round ledgers, frozen workflow sources and
state, which a restored engine needs to continue paused rounds) and, per issue,
a Git bundle of unpushed commits, a binary patch of uncommitted changes and a
tarball of untracked files. Each part is captured on its own, so one failure
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
   cleanup and reservations; unresolved native holds remain blocked because
   trusted recovery is unavailable. Do not re-enable intake merely because
   restore integrity checks pass; all commissioning prerequisites still apply.

### Updates

1. Pause intake (`factory pause-intake`, or `factory drain` to let admitted work
   continue) and inspect every retained assignment (`$N $C status`). A policy
   switch requires every assignment to be settled: MERGED, PR_READY, BLOCKED or
   stopped. An issue that can still start a round (pending, waiting or active)
   must finish first, or be stopped with `issue <n> stop`. Unresolved
   native/cleanup holds, live or ambiguous leases, and unreconciled runs/routes
   also prevent a switch. Preserve their work and original bindings; back up
   before an eligible update.
2. Run the installer from a reviewed commit:
   `sudo node scripts/archon-factory/installation/install.mjs --stage <dir>`. It
   needs network access to GitHub releases (the pinned launcher downloads the
   engine server and web UI and verifies them against its embedded checksums,
   and adds any missing provider or forge plugin the same way) and the check
   image `core-archon-checks:node24.22.1-bun1.4.3-jq` with the exact pinned
   image ID.
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
7. An issue left on the previous release refuses `retry`, `reopen` and
   `release` (`policy-transition-required`), and a round started for it blocks
   it `policy-changed`. Move it explicitly, one issue at a time:

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

8. Then use `factory resume` if the factory was stopped, and
   `factory resume-intake` for the authorized scope.

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
  `"coderabbitai"` or `"cursor"`) also accepts that GitHub App's check runs on
  the current head as coverage once all of them have completed; CodeRabbit
  reports a clean head this way, without a formal review. `"coverage":"once"`
  is for a bot that reviews a pull request only when it opens (Cursor here): a
  review of an earlier head covers it, and readiness says so in its reasons. A
  bot that never reviewed still blocks the wait.
- `limits.checkQueueMs` (default 600000) is how long a role's check waits for a
  free heavy-check slot before it is reported as not run.
- There is no `bindings` key; every start is a signed webhook.

## Disk-space guard

Admission, publication and merge each refuse when disk space or inodes are
short, or when the service cannot write where it needs to. The thresholds are
the operator's, in `storage` in `/srv/core-factory/control/core-factory.json`
(the installer keeps them):

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

Prefer `adopt-policy` (Updates, step 7): it keeps the issue's work. A reset
discards the work item so the selector admits the issue again from the start.
While commissioning it was used for items a defect had stranded before
`adopt-policy` existed. Do this only when the item has no run, no live lease,
no published branch and no PR; preserve an unpublished local commit as a
bundle first:

```sh
A=/opt/archon/0.14.0/archon   # with ARCHON_HOME and ARCHON_USER_ID as in Controls
$N $C factory pause-intake --request <id> --by <me>
$A state get core/issues/<n> --project _folder/control > /srv/core-factory/retired/commissioning-resets/issue-<n>-<stamp>.json
$A state delete core/issues/<n> --if-revision <revision> --project _folder/control
```

Then install, restart `core-archon` and `factory resume-intake`. An item that
has a published branch or an open PR is never reset: use `adopt-policy`.

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

## What always needs a person

Physical hardware repair; native Claude or GitHub sign-in; authorizing a scope
and its end state (`PR_READY` or `MERGED`); any required human review GitHub
enforces; decisions the factory raises as BLOCKED with a recovery step.
