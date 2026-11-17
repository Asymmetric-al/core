# VM 100 Archon commissioning

Status: **installed and operating on VM 100; acceptance partly verified**. The
factory delivered both authorized issues on 12 November 2026 (#2233 merged,
#2234 pull request ready); see
[Live commissioning](#live-commissioning---12-november-2026) for that evidence,
[Verification and council pass](#verification-and-council-pass---12-november-2026)
for the wider test that followed, and
[Unattended batch and usage limit](#unattended-batch-and-usage-limit---13-november-2026)
for the six-issue batch that the account's weekly usage limit stopped after
one delivery. What is open is listed once, in [Still open](#still-open).
Governing authority is the owner's private
installation plan supplied on 10 November 2026. That plan and its private
appendix must never enter Git, and this record uses owner aliases and omits
network addresses and credentials.

## Local safety checkpoint - 12 November 2026 (before the live run)

This section records the local source checkpoint taken before the 12 November
installation. Its working evidence files were not committed. Independent
reviews found cleanup-handoff, hold-precedence and malformed-member gaps in
offline probes; each was repaired with regression tests before installation.
A fresh independent review of the final integrated source is still open.

- **Immutable native identity and reports:**
  [identity binding](../../scripts/archon-factory/pack/.shared/identity.mjs)
  preserves the exact run/owner/profile/provider/account digest. The
  [native classifier](../../scripts/archon-factory/pack/.shared/native-faults.mjs)
  and [recorder](../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs)
  retain same-run fault evidence, including persisted holds; later clean or
  wrong-run reports cannot authorize release. Missing/malformed/uncertain
  evidence fails closed, not into a generic code retry.
- **Recovery boundary:** explicit same-run identity/effects reconciliation is
  required, including independent external readback for publication/merge
  uncertainty. Trusted recovery of native holds is currently unavailable;
  `retry`, `reopen`, `release`, ordinary `reconcile`, sign-in, reset times and
  lease expiry are not substitutes. Preserve native reports, bindings, views,
  leases and reservations. See [work-item controls](../../scripts/archon-factory/pack/.shared/workitem.mjs).
- **Cleanup retention:** a `receiptReference` binds `path`, `sha256`, `bytes`
  and exact labels to the trusted run root's `round/cleanup-state.json`.
  [Receipt handling](../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs)
  and the recorder require no-follow/regular-file identity, hash/length and
  directory checks before using it; original bytes survive success/failure.
  Independent exact-owned cleanup and an empty relist are still necessary.
  Windows checks do not establish Linux no-follow/race qualification.
- **Settlement priority:** cleanup > unresolved native hold > ordinary capacity
  settlement, including after cleanup confirmation. `check-capacity` or
  `check-cancelled` must not erase a native hold or release its ownership,
  reservations or views. Uncertain MCP receipts/labels must reach the durable
  round cleanup barrier; retaining only a global slot or reduced check JSON is
  insufficient. Every retained and newly observed cleanup attempt must be
  confirmed; malformed nested members retain the hold. Independent re-review of
  the final integrated source is required before qualification.
- **Capacity and reservations:** both [MCP](../../scripts/archon-factory/pack/.shared/check-mcp.mjs)
  and [heavy-check](../../scripts/archon-factory/pack/.shared/heavy-check.mjs)
  slot release require strict `cleanupConfirmed === true` and `reusable === true`.
  Receiptless failures retain ownership; stale reuse needs independent empty
  workload proof. `feedback`/`deliver` waits retain shared areas; unresolved
  native/cleanup holds prevent [reservation release](../../scripts/archon-factory/pack/.shared/reservations.mjs)
  even after a lease ends or status otherwise appears terminal.
- **Freeze budget:** the [workflow](../../scripts/archon-factory/pack/deliver/deliver.yaml)
  sets `freeze.timeout` to `7800000` ms (130 minutes), preserving clean installs,
  normal hooks, a possible second hooked commit and reviewer views. Expiry is
  not cleanup proof.

- **Storage and final admission:** the storage guard requires explicit
  operator reserves and fresh durable capacity probes at protected effects.
  Final admission rereads eligibility, scope, capacity and context after
  identity verification, then retains the final issue CAS and storage check
  before assignment. The injected local checks did not qualify Linux capacity
  or actual admission; the live check is recorded below.
- **Policy transitions:** retained assignment/run/attempt identity stays
  immutable. Incompatible installed-policy recovery must refuse before mutation;
  a policy switch must not strand recoverable assignments, including BLOCKED
  items. At this checkpoint only the containment fence existed. The explicit
  `adopt-policy` transition was built and used on 12 November (see below).

Entries below preserve dated 10-11 November history, including then-current
claims, test totals and later corrections. They are not a current deployment,
health, admission or delivery assertion; the current state is in
[Live commissioning](#live-commissioning---12-november-2026).

## Verified inventory - 10 November 2026

- Proxmox login succeeds; VM 100 is `core-dev`.
- Guest address is on the private LAN (not recorded here); normal SSH key
  login as `admin` succeeds.
- Admin home is `/home/admin`, UID 1000. Provisioning uses the operator's
  administrative access.
- VM allocation is 32 vCPUs, 48 GiB RAM, initially a 256 GiB virtual system disk,
  host CPU passthrough, and an enabled guest agent.
- Guest root filesystem initially had approximately 14 GiB available (95%
  occupied). After the checkpoint below, the virtual disk grew to 512 GiB;
  online `growpart` and `resize2fs` completed successfully. The filesystem
  reports 496 GiB total, 234 GiB used, 263 GiB available (48% occupied).
- The current system disk is on the host's Samsung SATA `local-lvm` pool,
  not the disabled `core-nvme` pool. NVMe devices are present; current boot
  logs alone do not establish long-term storage stability. USB resets are
  present and must be distinguished from NVMe/system-disk failures.
- VM 101 is named `core-factory-executor` and is stopped. Its disks, retained
  work, prior ownership, and executor relationship remain to be reconciled.
- Existing services include a legacy `core-factory` controller, an admin-owned
  Archon smoke server, and a read-only production-built Console preview.
  These are retained unfinished installations, not proof of factory acceptance.
- Observed binaries: Archon 0.14.0 / `8def159a`, native Claude 2.1.317.
  Provider/forge compatibility, effective settings and native entitlement
  remain to be qualified independently.
- Existing loopback ports: Archon smoke `39192`, Console preview `39342`.
  These are inventory, not commissioned operator endpoints.
- Current remote Core `develop`: `61b38df4621d3fcbd94788311d29aca384cd5fd7`.
  VM checkouts are older and include substantial uncommitted prior work.
  Preserve them; do not reset or treat them as the current installed policy.

## Implementation checklist - historical 10-11 November 2026

- [x] Read the supplied specification, role originals, acceptance matrix,
      and private bootstrap appendix.
- [x] Verify Proxmox login, VM identity, guest network, and normal admin SSH.
- [x] Inventory and preserve existing state, source, dirty work, Git objects,
      services, bindings, and applicable ownership before replacement.
- [x] Verify storage health and provide sufficient guest disk headroom.
- [x] Reconcile VM 101 and stop only confirmed duplicate dispatch.
- [ ] Pin and qualify engine, Claude provider, forge, native Claude, and
      stable native settings under the eventual admin service environment.
- [ ] Prove owner-bound native execution and actual trigger execution after
      service restart and VM reboot.
- [ ] Implement one Core pack, deterministic eligibility, bounded selection,
      assignment/lease/slot separation, and all six adapted specialist roles.
- [ ] Qualify actual role/tool/candidate boundaries and independent reviews.
- [ ] Prove local gates, normal hooks, publication, external feedback,
      current GitHub readiness, and protected delivery on authorized work.
- [ ] Qualify holds, cancellation, continuation, unknown-effect reconciliation,
      no-progress limits, and two independent issue flows.
- [ ] Complete the thin Maia Console against the actual engine APIs,
      production services, real chat/controls, and bounded assessments.
- [x] Prove coherent backup and isolated unpushed-candidate restoration.
- [ ] Complete independent implementation review and every governing
      acceptance-matrix row with evidence or an explicit external blocker.

## Safety and handoff

Do not enable broad stock intake, select arbitrary backlog work, expose an
unauthenticated shared control plane, or register an Actions runner. Preserve
hosted required CI and older-run `CI_RUNNER_FALLBACK` compatibility. The new
installation must replace conflicting legacy dispatch only after preserving
recoverable work. The obsolete qualification controller has subsequently been
preserved and disabled as recorded below. The Archon smoke and Console preview
remain qualification surfaces, not an operating factory.

Record subsequent evidence and exact installed revisions here. A service being
healthy, a retained receipt, or a preview dashboard does not pass acceptance.
PR_READY, MERGED, BLOCKED and unqualified must remain distinct.

## Provisioning evidence

- Proxmox disk checkpoint: `pre-archon-commission-20261110` on VM 100,
  created with guest-agent filesystem freeze/thaw and without memory state.
  This is a same-host rollback checkpoint, not an off-host recovery backup.
- Verified VM name and `local-lvm:vm-100-disk-0` before expansion. No other
  guest or unidentified disk was resized, started, formatted or removed.
- Host SATA SMART reports PASSED, zero reallocated sectors, zero uncorrectable
  errors and zero CRC errors. Both visible WD NVMe devices report PASSED,
  zero critical warnings, zero media/data-integrity errors and zero error-log
  entries. These observations do not prove stability under sustained load.
- Thin pool was approximately 35% physically occupied before expansion.
  Proxmox warns that aggregate thin virtual allocations exceed pool capacity
  and automatic thin-pool extension is not configured. Monitor physical data
  and metadata use; virtual free space is not a dedicated reservation.
- Guest AVX2 is exposed. Current guest-boot logs examined show no filesystem
  or block-I/O error. The host USB reset events need separate attribution.
- VM 101 is stopped with `onboot: 0`; configuration identifies it as the old
  disposable executor. Its data and snapshots remain unchanged. Its offline
  service/unfinished-work inventory is not yet complete.
- The old `core-factory.service` actually ran the fixed synthetic issue
  `900058` ordinary-v5 qualification, not production backlog intake. Its
  SIGTERM path stops admission and drains operations. After the disk
  checkpoint it was stopped and disabled, with no remaining processes under
  its service account. No abandon or workspace deletion was used.
- Coherent legacy SQLite backup:
  `/var/backups/core-archon/precommission-20261110/legacy-controller.sqlite`.
  SQLite backup API completed after shutdown; integrity check returned `ok`.
  Six operations are `succeeded`; four jobs are `completed`, two
  `checkpointed`. Checkpointed work remains preserved, not reclassified done.
- Restricted legacy configuration archive:
  `/var/backups/core-archon/precommission-20261110/legacy-configuration.tgz`.
  Full retained source, artifacts, Git objects and unfinished work also remain
  in the VM checkpoint. Portable backup and isolated restore subsequently
  completed as recorded below.

## Qualified binary identity

The existing Archon executable, Claude provider and GitHub forge match the
official v0.14.0 release `checksums.txt`, retrieved independently through the
authenticated GitHub CLI. Release publication: 7 November 2026, 08:57:08 UTC.
Source inspected at `8def159a6b2c23e832a5283b4131cfffd9af9344`.

| Binary                           | SHA-256                                                            |
| -------------------------------- | ------------------------------------------------------------------ |
| Archon linux-x64                 | `996d9989933bd7214645840723c48a803e781256435a0f0d22eb4fe645985bab` |
| Claude provider linux-x64        | `45995d33f84bc0532e8a1c80a8c00d6a1c5a4bb0cc2ae79bae53979cd5cfb8c7` |
| GitHub forge linux-x64           | `4ab4917b3a1b746037fac17094098724f01ed35a408b4fd1f301d147eb8c2e28` |
| Native Claude 2.1.317 (observed) | `eb224419e344575faa4a1f39b290b649425a10cd5ee2ef1d003480cd9ae57eb0` |

Native Claude's observed hash is a local identity, not an independently
verified upstream checksum. Actual role capability, settings stability,
installed policy isolation and provider/forge end-to-end behavior remain
qualification requirements.

## Native quota wait - reconciled 11 November 2026

A new signed trigger `commission-20261110-current-01` was admitted by the
running admin-owned Archon service. Receipt
`2b1398e4-04e7-40fe-9c03-e500e34398ae` links to real workflow run
`576668de-b04c-4c1a-897a-d372ee23a2c4`. The native provider paused its `verify`
node with `kind: quota`; the initial attempt was **not a completed model request**. Archon
reports `resumeAt: 2026-11-10T17:40:00.000Z` (the provider's reported reset time).
The same run subsequently completed successfully at the scheduled reset, as
recorded in the continuation evidence below. No replacement run, account
rotation, forced early resume, API or overage fallback was used.

## Coherent recovery and off-host copy

The legacy controller stayed stopped and the smoke engine was stopped during
capture. The SQLite backup API returned `integrity_check: ok`. The capture
contains engine database, artifacts/configuration, all Git refs/objects,
tracked binary patches and 431 retained untracked files. Native login stores
were deliberately excluded; restoration cannot silently transplant sessions.

- Restricted guest backup: `/var/backups/core-archon/precommission-20261110`.
- Isolated restoration: `/var/lib/core-archon-restore-qualification-20261110`.
  The restored old HEAD, staged/unstaged binary patches and untracked files
  match; restored engine database integrity is `ok`. The restored engine was
  never started, so it cannot become a second dispatch owner.
- A separate explicitly synthetic unpushed-candidate fixture restored commit
  `5839c189fe0a416f84b1b8cc62c36cb5700b3b23` and identical file bytes from a
  Git bundle. This proves bundle recovery, not a real issue's delivery/hooks.
- The consolidated private archive is 308,735,418 bytes, SHA-256
  `c8e634c026d1175b7e68d2dc5343bc7da97d32f3a9672d0235052b7e04c74f8a`.
  An off-host copy was taken through verified admin SSH. Its outer hash and
  all ten member hashes match. The archive is private and must not be
  published; no native profile was copied into it.

Restoring operation requires stopping the original owner first, restoring the
coherent set into isolated paths, verifying hashes/integrity and reconciling
GitHub effects before allowing one engine to admit work. A disk checkpoint
and the bundle fixture alone do not qualify every runtime recovery scenario.

## Reboot and observed access

After capture, VM 100 was rebooted through its confirmed Proxmox identity.
The boot ID changed from `6c723156-935a-4ec0-884e-5f58f1c52069` to
`fb5afbce-af0b-4ab8-80e9-d57d4a557f59`. The smoke engine and retained preview
returned active; the legacy controller remained disabled. The same real
quota-paused run/pause identity and reset time survived. This proves durable
wait persistence, not successful resumed model execution.

A disposable 512 MiB fsync/write/read probe matched SHA-256 (write/fsync
1.471 s; read/verify 1.300 s). This is not sustained storage qualification or
a representative Core build benchmark.

Normal admin SSH forwarding exposes Archon's native console to the existing
operator browser at `http://127.0.0.1:49192/console`, forwarding guest loopback 39192. A browser readback showed the current run as waiting for provider
limit with the expected automatic continuation time. The separate retained
read-only Console preview is forwarded on local port 49342 to guest 39342.
Neither is the commissioned full Core Console. The current tunnel is a
local SSH process, not yet a restart-persistent access shortcut.

## VM-lane authority

The 10 November owner request authorizes this separate native Claude/Archon
VM lane, its installation and protected expected-head merge where the live
rules permit. It supersedes an older custom-controller architecture for this
installation only. It does not activate paused hosted Codex trials, grant
arbitrary product backlog scope, weaken required human review, or alter
product Eve. The active change `commission-core-archon-vm100` records that
scope separately from retained hosted-trial contracts. No production intake
is enabled until the relevant acceptance evidence is complete.

## VM 101 offline reconciliation

VM 101 remained stopped with onboot disabled throughout inspection. Its
confirmed `local-lvm:vm-101-disk-0` volume was activated only for a read-only
loop mapping of the identified Linux root partition. The ext4 mount used
`ro,noload,nodev,nosuid,noexec`; no journal replay or guest boot occurred.
The mount/loop were released and the volume deactivated afterward.

The disk contains an old disposable executor image, approximately 944 MiB
of retained image assets, eight small candidate-intent/result control records
and an otherwise empty runs directory. No Git working-copy metadata was found
in the inspected home/executor roots. No custom factory/Archon/runner system
unit, user service or cron dispatcher was found. No unrelated service was
stopped and no disk/snapshot/data was erased. Historical failed qualification
snapshots remain preserved and do not count as accepted delivery evidence.

The host retained the control records, image descriptor, systemd and cron
configuration in restricted archive
`/var/backups/core-archon/vm101-readonly-control-20261110.tgz` (9,844 bytes,
SHA-256 `79b662612395cdb7eb8da42697c98ef3d2754c24490c6112fe810366a408f5d4`).
Its original disk and existing snapshots remain the recovery source for full
image assets. VM 101 is not required by the new single-VM design.

## Native state qualification - 10 November, 16:12-16:18 UTC

The bounded native adapter uses the existing Archon project state store, one
compare-and-swap write, and its actual run-owned lease flags. It introduces no
queue, database or continuation service. The two script-only qualification
workflows explicitly declare workflow-level `mutates_checkout: false`; the
node-level field alone does not bypass the engine checkout lock.

- Synthetic issue 900100 is not a GitHub issue or product assignment. Selector
  `09e2a7f6a84737fe9212341e013aab60` completed, leaving revision 1, a durable
  assignment and no execution lease.
- Separate delivery `957c37936c762cf912b2f8a59bd4d9eb` took its own live lease
  at revision 2 and paused at its explicit attention gate. The completed
  selector did not release the delivery run's lease.
- Operator CAS writes persisted Hold at revision 3 and Stop at revision 4
  without releasing that lease. The native CLI refused cancellation of a
  paused run. No abandon, dirty-work deletion or cancellation-success claim
  was substituted for that refusal.
- The synthetic attention gate was explicitly rejected through the owning CLI
  control path. Actual terminal readback was completed; the stopped assignment
  remained at revision 4 and the original lease became non-live.
- A subsequent delivery attempt `da3f4c14f4d09bbb85d921116d78a592` actually
  failed its activation step. Revision 4, Stop and the original assignment
  remained unchanged. No retry or child may clear that durable Stop implicitly.

Earlier selector attempts `67ff9d788b93eeac37037eb9943845a5` and
`c7940bfc511c7b5bd8163f285c7f7ccd` were cancelled before execution because
the smoke checkout was locked. They are failed qualification attempts, not
successful dispatch. Native `workflow wait` returned exit zero for terminal
failed/cancelled runs; callers must inspect its actual status.

This qualifies the synthetic state transitions only. It does not prove complete
production control semantics, parent/child capacity, role execution, admission
serialization, or any issue delivery. The latest adapter also rejects a write
acknowledgement whose value or lease does not match the planned operation;
that strengthening has unit proof and still needs a new live qualification.

## Disposable local checks - 10 November, 16:16-16:32 UTC

The Docker adapter is a bounded one-shot candidate-command executor, not a
worker service. The inspected local image is pinned by actual image ID:
`sha256:2d4fe5a6aba791a8d6e9f445ba4c0849da040dbf2dd0747bf00ea117cce72597`.

The final live fixture under
`/home/admin/.local/share/core-archon-commissioning/disposable-checks/qualification-18bNcO`
retains its input marker, output and full `qualification-receipt.json`.
Readback proves Node 24.22.1, Bun 1.4.3, UID 1000, only loopback networking,
read-only rootfs, no mounted Docker socket/profile, and writable disposable
candidate files. Four actual outcomes were distinguished: passing exit 0,
failing exit 7, timeout exit 137 and cancellation exit 137. Each final container
was identity-checked, observed stopped and removed before `reusable: true`.
Cancellation included a spawned child process. No active labelled check
containers remained, and unfinished candidate files were preserved.

An earlier cancellation fixture returned `CheckCleanupError` because a cleanup
inspect was unavailable. Capacity/workspace reuse remained false. Subsequent
manual inspection verified the exact image, labels, full ID and exited/PID-0
state before removing only that container; its disposable files were retained.
The transient inspect failure is not explained by the successful rerun and
must not be presented as an always-reliable daemon qualification.

Live evidence exposed a receipt defect: the adapter retained the pre-kill exit
code instead of the final daemon result. A failing regression preceded the
fix; final timeout/cancel receipts now report 137. No required CI, hooks,
publisher credentials, source checkout, or existing runner fallback changed.

## Local implementation evidence and remaining work

The integrated readiness, native-profile, assignment, native-state and check
adapters have 143 passing focused Vitest tests across five files. Node syntax
checks and role structural-provenance verification pass. The role manifest
still explicitly reports `runtimeQualified: false` and no consumed assets.
An ESLint directory invocation rejected the ignored operational-script tree;
the focused test files linted, but that is not a whole-tree lint pass.
The combined coverage includes the standalone role verifier with zero unit
coverage; its separate provenance command is not equivalent to unit coverage.

An SDK control-only probe under the selected native profile observed first-party
Claude Team, no API-key helper, no authentication override keys and settings
hash `f3bc73acb96c25445a9a56726132f88b353aa50cfff5bd5f4e59ce5f9b664120`.
No model prompt was submitted by that probe. Native model success, owner
authorization, child/resume binding and full service-environment qualification
are still separate acceptance obligations.

At that checkpoint the real quota-paused smoke run remained preserved for its
17:40 UTC continuation; its eventual result is reconciled below. The factory is not commissioned and production intake
is not enabled. Full specialist execution/isolation, actual GitHub issue flows,
post-hook delivery/required CI/protected merging and the complete backend-linked
Core Console remain unfinished. Independent adapter review and Console
implementation are in progress; their results must be reconciled before use.

## Native-state review correction - 11 November 2026

Accepted the independent review's bounded-termination finding. The native
assignment transport now owns a 30-second deadline, sends SIGTERM on deadline,
output overflow or cancellation, and escalates to SIGKILL after one second.
It allows one further second for close confirmation; if confirmation never
arrives, it destroys its pipes, unreferences the child and rejects explicitly
with `termination unconfirmed; reconcile before retry`. That outcome is not
cleanup confirmation or permission to release capacity. Even valid JSON and
exit code zero cannot turn a timed-out operation into success. No state write
is automatically retried.

Five added regression tests cover ignored termination, output overflow,
unconfirmed cleanup, cancellation and late successful output. Red was observed
before the implementation; all 148 focused adapter tests now pass. Focused
Prettier, test-file ESLint and native-module syntax checks also pass. These are
not a whole-repository preflight or installation acceptance pass.

Live Linux fixtures ran over normal admin SSH on VM100 using isolated copies
in `/tmp/core-native-review-r99l931H`. A real Node child ignored SIGTERM in all
three cases: deadline rejected in 31,011 ms, overflow in 1,015 ms and cancellation
in 1,026 ms. Each fixture verified the exact child PID no longer existed and
its unfinished sentinel file survived. The no-close final fallback is tested
with a synthetic child, not claimed as a reproduced Linux kernel failure.

The correction is in the working tree and isolated qualification copies;
this checkpoint does not claim deployment to the installed workflow pack.
No service, native profile, paused run, admission mode or production intake
was changed by these fixtures. Full factory commissioning remains incomplete.

## Same-run native continuation - 11 November 2026

Read-only reconciliation used the owning server's actual
`GET /api/workflows/runs/576668de-b04c-4c1a-897a-d372ee23a2c4` endpoint,
the service journal and native session records. No resume/cancel/trigger write
or new model request was made during this reconciliation.

- Event 230 recorded the quota reset at `2026-11-10T17:40:00.000Z`.
- Event 259 unpaused the same run at `17:40:02Z`; event 260 started it.
  The service journal records `workflow.dag_resuming` at `17:40:02.538Z`
  under the existing admin execution process, PID 2558.
- The original node invocation `8a95be10-0992-4d84-bdc3-2e4548dc17eb`
  survived. Continued attempt `fe1f6a2b-a765-44da-8e71-9095ce36ca99`
  began at `17:40:04.560Z`; event 266 completed it at `17:40:08Z`.
- Event 267 and the persisted terminal record report `completed/succeeded`
  at `17:40:09Z`, with available return value
  `{"ok":true,"marker":"CORE_NATIVE_SMOKE"}`. This proves consumption of
  the model's structured result, not merely an acknowledgement or wait exit.
- Requested model was `haiku`; provider-observed model was `claude-haiku-5-5`.
  The completed provider attempt reported 5,170 input and 104 output tokens.
  Provider cost telemetry is not evidence of API/overage billing.
- The original quota session and continued native session
  `b6315b74-55b5-40c3-b8cb-bb6df1ed9c9b` have identical account/organization
  owner records (compared without publishing identifiers). Service profile is
  `/home/admin/.claude`, HOME `/home/admin`, pinned Claude 2.1.317.
  Read-only auth status under the service environment reports first-party
  `claude.ai`, Team, logged in, and no authentication override variables.
- Native settings file SHA-256 is
  `f8efeb98c83210f75ba118241ed5bb35f074cf68aa2463a03eedd1f39a980ebc`;
  it predates this work and contains no API-key helper. This file hash and
  the earlier SDK effective-settings hash identify different artifacts.
- Archon transcript SHA-256 is
  `be7349c453d9bf8e893afe383208e961608eefc61d9d7cbafa97c5edac4fb51c`;
  continued native session log SHA-256 is
  `9ca02c6019a45feaa7b7e2d78f1ad601996c42fd6fdb31d5b00fd30a380b4f9b`.

The pinned server's continuation scheduler scans due native continuations every
five seconds through `wakeDueWorkflowContinuations` and server-owned admission.
Observed timing and persisted run/journal evidence support automatic scheduled
continuation. The unpause event does not include an actor, so it alone cannot
provide an independent actor-attribution audit. No manual resume was issued by
this commissioning reconciliation. The native session starts fresh for the
continued attempt; same owner/profile does not mean the same model session ID.

This qualifies the preserved smoke lane's quota continuation and native result
only. It does not qualify six-role model quality, child/profile isolation, a
reviewed production pack, two issue deliveries, protected merge or the Console.
Production intake remains disabled and the factory remains **not commissioned**.

## Exact candidate preparation - 11 November 2026

Added a Git-plumbing-only candidate materializer and synthetic native-loader
qualification. Views bind exact candidate/base commit identities, assignment,
attempt and specialist, and verify each blob against its Git object identity.
Dirty/untracked source files and Git metadata are not copied; checkout filters,
candidate scripts, hooks and submodules are never executed during preparation.
The receipt explicitly reports `isolationQualified: false`: this is a Gitless
snapshot, not runtime model-tool isolation or a production delivery worktree.

Accepted both independent candidate review findings. All directory prefixes
now reject case and file/directory collisions before creating output, and the
source must be the actual Git top-level directory rather than an arbitrary
subdirectory whose parent Git discovers. Three regressions failed before the
fixes and pass afterwards. The combined six-file adapter suite passes all
158 tests; this is not whole-repository preflight or installation acceptance.

Fresh VM100 evidence is retained at
`/tmp/core-candidate-view-stage-i7KksirP/native-loader-2/qualification-receipt.json`.
The pinned Archon loader executed the trusted script with
`--dry-run --exec-code`: node `prepare-and-check` completed with no stubs.
It created independent Micaiah/Luke snapshots of synthetic candidate
`a4c7669b264a6f27b6a9578270284fdfb40eaaab` over base
`f35c71c4afb128335268b8d042aac1b66e37f2e4`, with manifest digest
`211b092ef86792972c1c51054b20988ad1700a7945a3e19bbede77283b0a67a9`.
Both component-collision fixtures, a discovered-parent checkout and a tracked
symlink were rejected. Dirty/untracked sentinels survived. A real network-none,
non-root disposable container checked the second snapshot and confirmed cleanup:
`7166236da870a13834b78fe558d0ae5c8b1dacaed65d2de5a9aa8f529c1b7cf1`.
The inspected image remains
`sha256:2d4fe5a6aba791a8d6e9f445ba4c0849da040dbf2dd0747bf00ea117cce72597`.
Earlier stage `/tmp/core-candidate-view-stage-MIpJzuBP` remains preserved.
No model/GitHub request, server-owned delivery run or production admission
was created by this qualification.

## Core pack checkpoint - 11 November 2026 (Claude session)

Codex sessions could no longer open, so a Claude session continued from this
checklist. The operator network changed; a matching private-LAN UFW SSH
rule was added. The VM's `gh` login for the
owner's GitHub account is **invalid**: publication needs a native GitHub
sign-in on the VM (human action, not yet requested).

The installable pack now lives in `scripts/archon-factory/pack/` (folder
project `core-factory`, entrypoints `core-select`, `core-deliver`,
`core-answer`, `core-analyze`). Design:

- Runs execute in a root-owned control folder project, never in a candidate,
  so candidate `.archon`/`.claude` files cannot shadow installed policy.
- Roles have no host shell. A trusted PreToolUse guard (`.shared/guard.mjs`,
  `policy.mjs`) limits each node's file tools to its run-context roots; a
  `core-check` MCP server runs commands only in the qualified Docker executor.
- One delivery round per governed run on a queued delivery resource; the work
  item (`core/issues/<n>`) keeps assignment, lease, control and history.
- Core's hooks run candidate code, so commit and pre-push (`ci:preflight`) run
  in the credential-free executor pushing to a private outbox; the host pushes
  the verified commit from the hookless mirror and reads the remote back.
- `develop` is strict, requires `ci-gate`, `e2e-smoke-gate`, `migrate`,
  `smoke` (app 15368), conversation resolution, 0 approvals, merge commits
  only. Readiness integrates the base by ordinary merge and carries reviews
  forward only when the candidate's own diff is byte-identical.

Pinned-loader evidence on VM100 (scratch home `/home/admin/core-factory-dev`):
all four workflows validate; six `core-deliver` route fixtures pass
(initial-clear, disputed-findings, claim-refused, repair-round,
feedback-ready, feedback-wait). Live model, guard, MCP, executor-commit and
GitHub publication qualification are still pending. Not yet installed.

## Production installation - 11 November 2026

`scripts/archon-factory/installation/install.mjs` (root, idempotent) installed
the factory: engine `/opt/archon/0.14.0/archon` (pinned SHA), pack release
under `/opt/core-archon-factory/releases/`, root-owned control folder
`/srv/core-factory/control` (folder project `_folder/control`, id
`bee6bca1…`), `ARCHON_HOME=/srv/core-factory/archon`
(store `e4610f47…`), run-as user
`8d62c60a…`. Service `core-archon.service` (User admin,
`127.0.0.1:39190`, `ARCHON_TRIGGER_HOST=core-dev`, `CLAUDE_CONFIG_DIR=/home/admin/.claude`,
`DISABLE_AUTOUPDATER=1`, two conversation slots). Intake initialized **paused**.
The obsolete smoke engine (`core-archon-vm100-smoke`) was stopped and disabled
with its state intact; the retained Console now reads the production engine.

- **DNS:** the DHCP-supplied resolver failed 6/6 raw queries while three
  public resolvers answered 6/6; model calls failed `EAI_AGAIN`.
  Netplan override `/etc/netplan/70-core-factory-dns.yaml` (original files
  backed up under `/root/core-factory-network-backup`) fixed resolution.
- **Live role boundary** (run `212677a7-2f1e-4500-8469-dfa70dc36ca5`, Haiku,
  native subscription profile): guard allowed a read inside the role view,
  denied a read of the control config and a reviewer Write, allowed
  `StructuredOutput`; `run_check` executed in the executor as UID 1000 with
  only the view visible, no native profile and no network, cleanup confirmed.
  The hook and MCP server inherited the run identity. A first run exposed that
  the guard denied `StructuredOutput`; fixed and requalified.
- **Correction:** probe runs `aa906737…` and `4714772c…` (including the first
  "after restart" check) were executed by the CLI host (`origin=cli`), not the
  server: `archon trigger fire` drains its host itself. A CLI fire from a
  systemd oneshot left selector run `fa8f5b09…` pending (owner killed); it was
  verified ownerless and abandoned. All factory starts now use signed Standard
  Webhooks deliveries to the server's own sources (`.shared/webhook.mjs`,
  `control/sources.json`). The plugin was rebuilt from commit `8def159a` and is
  byte-identical (SHA-256 `182b4ab5…e6ea`) to the earlier session's build.
- **Server-owned starts:** probe run `7c027223-34d9-4852-b87a-cd61955fcb46`
  (`origin=api`); timer-driven selector run `a505d454-0ae5-42e7-8b68-a5bd2155d18f`
  completed with "Intake closed: intake-paused". Replaying a delivery id with
  the same body returns 200 with no new start; a different body returns 409.
- **Controls:** `control.mjs` factory hold/release-merge wrote revisions 2 and
  3; replaying request `ctl-qual-0001` was a no-op; an unassigned issue was
  refused (`no-assignment`).
- **Backup:** `/srv/core-factory/backups/2026-11-10T20-51-52-557Z` holds an
  online SQLite backup (integrity ok), control/run evidence and the unpushed
  qualification candidate `ccf8e5e0…` as a Git bundle. Daily timer enabled.
- **Hooks in the executor:** synthetic workspace 900201 (not a GitHub issue):
  container install 27 s; commit through Core's real pre-commit hook (lint-staged,
  shadscan) produced `ccf8e5e041b1ba374fc398e134cea46ca1f121c4` on `61b38df…`
  with a clean tree. The real pre-push guard ran `ci:preflight` (343 s): all
  stages passed except `test-unit` (137/11,699 in 13 files). Cause: Docker's
  tmpfs `/tmp` defaults to `noexec`, so tests' fake `bun`/`supabase`/`gh`
  shims could not run (hosted runners allow it). The executor now mounts
  `/tmp` with `exec`; the 13 files then passed (494 tests). Full rerun pending.

## Storage failure - 11 November 2026, about 01:30 UTC (resolved; see the next section)

During the third publication qualification (workspace 900203; Core's full
`ci:preflight` in the executor with 16 CPUs / 32 GiB), the Proxmox host's SATA
SSD left the bus. Observed read-only, without writes:

- VM 100: `sd 0:0:0:0 ... Sense Key: Aborted Command`, `I/O error, dev sda`,
  root ext4 `emergency_ro`; writes fail with EROFS/EIO.
- Host: `/proc/partitions` lists only `nvme0n1` and `nvme1n1` (both WD_BLACK
  SN850X 4 TB, state `live`); no `sd*` device. A SCSI rescan of all eight AHCI
  hosts found nothing; every `ata_link` reports speed `<unknown>`. Host root
  `/dev/mapper/pve-root` is `emergency_ro`; binaries such as `dmesg` and
  `uptime` fail with EIO; volume group `pve` (host root and `local-lvm`, which
  holds `vm-100-disk-0`) is gone and `local-lvm` is inactive. Only volume group
  `pve-OLD` on NVMe (an older Proxmox install and a nearly empty
  3.49 TiB thin pool) remains.
- Earlier evidence recorded NVMe drops under load; this event is the SATA SSD
  under load. Two devices failing under heavy I/O points at a shared cause
  (power delivery, cabling, controller/chipset or thermals) as well as the drive.

Nothing on VM 100 can be written until the drive returns. Preserved off the
host: the 10 November precommission archive and all factory source in this
worktree (with a private archive copy).
Lost unless the SSD returns: the production install's runtime state, the
11 November backup and qualification evidence on VM 100, and the factory's
GitHub CLI profile (re-creatable). This requires a person at the machine; the
exact recovery steps are in the runbook's "Storage failure" section.

## Storage root cause and recovery - 11 November 2026, 02:30-03:00 UTC

The "SATA" failure above was misattributed. The Samsung 870 EVO 1 TB that
holds the Proxmox root, `local-lvm` and VM 100's disk is attached over USB 3
through a JMicron JMS578 bridge (`152d:0578`, `uas` driver, SCSI host 8); all
four onboard SATA links (ata5-8) are empty. The persisted journals of the three
previous host boots (8, 9 and 10 November) each end in UAS command aborts and
`usb 2-1: reset SuperSpeed USB device` after 8, 14 and 14 device resets. The
drive's SMART data is clean (0 reallocated, 0 uncorrectable, 0 CRC errors, no
error log, 362 power-on hours). Both WD SN850X NVMe drives logged no timeout or
reset in any persisted boot and their SMART data is clean.

- Before acting: VM 101 stopped, VM 100 the only running guest (read-only), no
  delivery work admitted. The salvaged engine store (`integrity ok`, off-host)
  holds 36 runs, all selector or probe runs and none running; `core/factory`
  revision 3 (intake paused) and no `core/scope` yet. Nothing on GitHub needed
  reconciling.
- 02:38:29 UTC: remote platform power cycle through the kernel (`reboot` type
  `pci`, mode `cold`, SysRq `b`), because host binaries failed with EIO. The SSD
  returned; `pve` and `local-lvm` came back; VM 100 started on boot and its
  `fsck` reported clean after clearing one orphaned inode.
- Mitigation: host kernel parameter `usb-storage.quirks=152d:0578:u` (GRUB;
  original kept in `/root/grub.default.pre-uas-quirk-20261111`); clean VM 100
  shutdown and host reboot at 02:42:38 UTC. The bridge now binds to
  `usb-storage` (bulk-only).
- Load test afterwards: publication qualification 900204 (below) plus a
  concurrent Console production build; `journalctl -k` on the host shows no
  UAS reset, I/O error, ext4 error or disconnect.
- Durable fix needing a person (not blocking): move the SSD to an onboard SATA
  port or move VM disks to the NVMe drives. VM 101's disk is on the same pool.

Post-recovery evidence:

- Pack redeployed 02:45 UTC: policy revision `4d0f0174…0ab6`. All five
  workflows validate with the pinned loader; the two warnings are expected (the
  admission guard reads `ANTHROPIC_API_KEY`/`CLAUDE_CODE_OAUTH_TOKEN` to refuse
  an override, and the probe records `ARCHON_CLI_COMMAND`).
- After both host reboots the intake timer started selector `3530fa66…`
  (02:49:15 UTC) through the server: `facts` ran, `rank` and `admit` were
  skipped because intake is paused, completed in 617 ms.
- Publication qualification 900204 (02:47-02:54 UTC, synthetic workspace, no
  GitHub write): mirror at `61b38df`; install 47.6 s; commit through Core's real
  pre-commit hook produced `ff018e1c7bb88fde4c0016a3f417d20f2ca0f057` with a
  clean tree; the real pre-push guard ran `ci:preflight` in the executor
  (16 CPUs / 32 GiB, image `sha256:2d4fe5a6…`) in 355.9 s, exit 0, all 19 stages
  PASS, `test-unit` 1,073 files passed / 22 skipped and 11,233 tests passed /
  462 skipped / 4 todo (of 11,699); outbox head equals the candidate;
  container cleanup confirmed. This closes the earlier `noexec /tmp` and PID 1
  reaping parity gaps.
- Console release `20261111-console-2` (built on the VM from `61b38df` plus this
  branch's changes; previous release kept for rollback) serves through
  `core-factory-console.service` (unit now ordered after `core-archon.service`):
  401 without credentials, 200 with them, `/api/console/snapshot` 200 in
  0.76 s with live engine data. Owner alias `conrad`.
- Sign-ins on the VM: the factory GitHub CLI profile (written before the
  failure) is valid with admin on the repository; native Claude reports a
  `claude.ai` subscription login with the first-party provider.

## Console integration checkpoint - 11 November 2026

The independently completed Console delegate's 31 source files are integrated
under `apps/factory-console`; generated output, temporary dependency junctions
and fixture runtime artifacts were not copied. Its exact fixture verification
and limitations remain in `apps/factory-console/VERIFICATION.md`. The parent's
integrated run confirms 22 unit tests, TypeScript and ESLint pass. The app uses
shared Maia/Base UI and pinned Archon APIs, with explicit unavailable states for
missing evidence, native holds/drain/resume, usage and unqualified operations.
These are not equivalent to the full Console acceptance row.

The Bun 1.4.3 lock remains version 1 with only the new workspace declaration
and alias added; frozen filtered installation and workspace-manifest validation
pass. A Linux production build is staged independently before replacing any
retained preview service. Production intake, owner profile and the completed
smoke run are unchanged. Chat/cancellation are not enabled by this checkpoint.

## Engine limitation: analysis turn cap (S11.16) - 11 November 2026

Archon 0.14.0 has no node-level turn cap (`maxTurns` exists only on inline
sub-agents), so `core-analyze` cannot enforce the six-turn analysis target. The
bound it does have (`scripts/archon-factory/pack/analyze/analyze.yaml`, node
`analyst`):

- `allowed_tools: []`: each attempt is one structured reply.
- `retry: { max_attempts: 1 }`: one retry, which bounds only ordinary transient
  failures and timeouts. Unknown failures are not retried.
- Capacity (overloaded) and rate-limit failures fall outside that bound. The
  engine gives them at least five retries: capacity delays centre on 45, 90,
  180, 300 and 300 s, rate limits on a flat 45 s (both with ±50% jitter). A rate
  limit that outlasts those retries, or a quota wait, pauses the run and later
  resumes the node.

The six-turn target is therefore **not enforced**. A run observed below six
turns demonstrates only that run. Claim enforcement only after implementing a
supported cap and verifying it with provider-observed counts, including retry
and resume paths.

## Repair verification checkpoint - 11 November 2026

Wave 1 and the finishing pass are present in the local commissioning checkout.
The operating runbook and pack README now describe the review-only route,
acceptance/implementation repair ownership, shared-area parking, protected-path
grants, revision-bound dispatch, reconciliation and cancellation cleanup,
readiness checkpoints, and installer/backup recovery procedures. This records
implementation progress; it does not qualify the installed factory.

Fresh parent checks after the interrupted review launch:

- Console unit tests: 12 files, 115 passed. Its typecheck passes with the
  Console's pinned TypeScript 7.0.2 after the Bun-generated lockfile repair.
- Ops and pack configuration tests on Windows: 5 files, 110 passed, 2 skipped
  (Linux-only checks). The combined invocation's 5 failures were in the root
  TypeScript toolchain suite because Bun's Windows install has no Unix
  `node_modules/.bin/tsc` symlink.
- The root toolchain suite passes on Linux: 1 file, 7 tests. The manifests,
  lockfile, verifier and test bytes matched the local files before that run.
  The Linux staging copy's backup and installer differed from the local bytes;
  this toolchain result is not evidence for those repairs.
- A separate archive of the current local factory source and ops tests passes
  all 70 ops tests on Linux (4 files, no skips). It ran from a fresh tmpfs in
  the retained check image with networking disabled and the existing dependency
  store mounted read-only. Archive SHA-256:
  `c64bb8651b1b9e58f9596c41c482a02bbe4edc1540bb6126ffce258dc2703197`.
  In a second disposable copy, disabling both initial and per-call trusted Git
  restoration makes the planted-clean-filter regression fail at
  `archon-ops-backup.test.ts:248` because its marker exists. The current source
  prevents the marker and produces the patch. This is local regression evidence,
  not an installed backup/restore qualification.
- Parent review reproduced and repaired two cancellation hold failures:
  four conditional-write conflicts previously still allowed engine cancellation,
  and replaying a request after its hold was released trusted the old receipt.
  Both now refuse before engine cancellation or container removal. Each new
  regression failed with `ok: true` before its fix. The focused control/lifecycle
  suites pass 148 tests; the complete factory suite then passes 39 files,
  1,596 tests with 9 skipped on Windows. This is not live cancellation evidence.

Live readback at this checkpoint: `core-archon.service` and
`core-factory-console.service` are active; intake is paused, factory mode is
`run`, there is no authorized scope and there are no issue work items. No real
issue was started by this verification pass.

Independent verification of candidate boundaries, lifecycle recovery and the
review/publication/merge flow remains pending. Console verification against the
live VM backend, redeployment, post-install qualification, both authorized
issue flows and the remaining wave 2 requirements are still open. Intake must
remain paused until those prerequisite checks permit real work.

## Live commissioning - 12 November 2026

All times UTC. Run and release identifiers are shortened. Issue and pull
request numbers refer to `Asymmetric-al/core`.

### Outcome

| Issue | Authorized end state | Result                                                                                                      |
| ----- | -------------------- | ----------------------------------------------------------------------------------------------------------- |
| #2233 | MERGED               | PR #2648 merged at 10:55:21 as `072160deb` (head `53e17004`); issue closed; 13 rounds, work item `MERGED`   |
| #2234 | PR_READY             | PR #2649 open at head `e41c1619`, merge state clean, required checks green; 13 rounds, work item `PR_READY` |

The factory merged #2233 itself through the protected branch rules (strict
required checks `ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke`,
conversation resolution, merge commit). It did not merge #2234, because that
issue's authorized end state is a ready pull request. After the #2233 merge it
integrated the new base into #2234 by an ordinary merge and re-ran review
before reporting it ready.

State at 11:30: intake open, mode `run`, both work items settled, no run active;
`core-archon.service`, `core-factory-console.service`,
`core-factory-intake.timer` and `core-factory-backup.timer` active; guest root
filesystem 56% used; no host storage event since the 11 November mitigation.
Installed release `6f68e56b`.

### Six roles on real work

First delivery round of #2233 (07:59-08:15): Samson scoped; Ezra wrote the
acceptance tests and saw seven fail before any implementation; Bezalel
implemented until they passed; the candidate was committed through Core's real
hooks and frozen; Micaiah and Luke reviewed in parallel in separate read-only
views and both cleared; Ezra's final acceptance passed in its own view; the
pre-push gate ran in the disposable executor, the branch was pushed and PR
#2648 opened. The guard log holds 155 decisions; its only denials were four
searches outside the role's view.

Feedback on #2233: a Cursor review thread was judged valid by Samson and
routed to Ezra, who corrected the acceptance test (head `53e17004`). Review and
final acceptance ran again before the merge. Agabus (analysis) and the answer
workflow are installed and validate on the pinned engine; neither was exercised
on a real incident in this window.

#2234 was admitted automatically while #2233 was publishing and started when
that run ended. It is a test-only issue: Ezra was the only writer and Bezalel
confirmed against unchanged code.

### Defects found on the live system

Each was reproduced, fixed test-first (failing test, then passing) and
re-verified on the VM.

1. The engine's credential preflight event made the identity check refuse a
   genuine first run.
2. A read-only dependency cache broke Core's own cache tests inside the
   executor; the executor now seeds a per-lockfile cache and mounts a private
   view.
3. The installer wrote a malformed commit author name.
4. The disk-space guard's target list did not match the VM, and no thresholds
   were set; live admission now reports all targets ready, and a low-space
   fixture refuses with `STORAGE_BYTES_LOW`.
5. Prose in a linked document was parsed as unresolved issue dependencies.
6. The delivery claim repeated defect 1 (now one shared predicate).
7. Reviewer views read the whole tree through one 256 MB buffer; Core's tree
   is larger. Views are now written in bounded batches.
8. The round recorder could not read a large run event record through the
   command output bound.
9. A test-only issue was blocked because a scope required a source path.
10. Final acceptance could not see which files changed. It now receives the
    changed-file list and diff computed by the factory.
11. Readiness waited forever for review bots that had already answered:
    CodeRabbit reports a clean head as a check run, and Cursor reviews a pull
    request only when it opens. Provider coverage now accepts a completed
    check run from the provider's app, and an earlier-head review for a
    provider configured `"coverage":"once"`, and says so in its reasons.

A missing capability was also built: `issue <n> adopt-policy` moves a blocked
or stopped issue to a new release without discarding its branch or pull
request, after proving the signed-in account is unchanged. Reviews earned under
the previous release are dropped and re-run.

Releases installed during the window: `4a52ecc2`, `cecbcadc`, `2b702ed8`,
`415d662a`, `234d50d9`, `1e7de1ec`, `f946fd75`, `87dd1837`, `6f68e56b`. The
factory suite passes 2,673 of 2,673 tests on Linux at the last release.

### Operator interventions

The window was not hands-off. Every intervention used the documented controls
with a unique request identifier:

- Intake paused and resumed around each release change.
- Two commissioning resets of work items that had no published branch and no
  pull request (state documents, a Git bundle and the workspaces were
  preserved first). These predate `adopt-policy`.
- For the last two releases: `stop`, `adopt-policy`, then `retry` or `reopen`
  for each issue.
- Review-provider settings and disk thresholds written to the operator-owned
  configuration (previous file kept).
- Two orphaned check containers left by the 11 November storage failure were
  removed.

No abandon, hook bypass, forced merge, account switch, API fallback or
fabricated check was used.

### Console

Console release 6 serves on guest loopback behind HTTP Basic and the owner's
SSH tunnel: unauthenticated requests get 401. A live pass covered nine tabs at
three viewport sizes with no serious accessibility finding and no console,
page or HTTP error. Hashed static assets are cached; pages and API answers are
`no-store`; JSON answers are compressed. The `adopt-policy` control is present.

### Backup and restore drill

At 09:11 the backup service took a complete backup while a round was live
(manifest `complete: true`, no failures). An isolated restore matched all 11
manifest hashes, passed the database integrity check, unpacked both archives
and restored both issues' unpushed candidates exactly from their bundles. The
drill directory was removed afterwards.

### Open after the first run

Superseded by [Still open](#still-open) at the end of this record.

The owner merged PR #2649 by hand at 14:59; the table above is the state at
11:30.

## Verification and council pass - 12 November 2026

All times UTC. This pass widened the scope to three more real issues, had
three independent models analyse the whole factory before any further repair,
repaired what they and the live system confirmed, and ran the real workflow
again. After the commissioning run above, the owner merged PR #2649 (issue
#2234) by hand at 14:59; the factory had reported it ready and did not merge
it.

### What was run

| Time  | Event                                                                                                             |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| 13:22 | Scope approved: issues 2206, 2215 and 2228 added, all to a ready pull request                                     |
| 13:23 | Selector timed out on three passes in a row; nothing admitted (defect 12)                                         |
| 13:55 | Engine restart left a selector run "running"; later passes started nothing (defect 13)                            |
| 14:11 | The intake pass cleared the orphan by itself after the fix                                                        |
| 14:12 | GitHub API quota exhausted (old selector plus probes): admission refused on changed evidence, retried after reset |
| 14:24 | Timer pass admitted #2206; Samson's reason: a correctness bug outranks a wording fix                              |
| 14:34 | Timer pass admitted #2215; #2228 reported blocked (defect 14)                                                     |
| 15:05 | Engine restarted on purpose while #2215 was mid-round                                                             |
| 15:14 | Timer pass cleared the dead run, settled #2215 to waiting and started #2206's queued round, with no operator      |
| 16:31 | #2206 blocked at round 3 with both reviews clear: final acceptance inconclusive (defect 15)                       |
| 17:13 | Release `620140dd` installed from commit `230c5e3c6`                                                              |
| 17:17 | Timer pass started #2206 and #2215 one second apart on lanes 1 and 2; both ran at once                            |
| 17:27 | #2206 published as PR #2652: both reviews clear, final acceptance passed on all seven criteria                    |
| 17:29 | Hold placed on #2215 mid-round; replaying the same request was a no-op                                            |
| 17:55 | #2206 ready: the factory merged the newer `develop` into the branch, carried the reviews, waited for the checks   |
| 17:56 | Hold on #2215 released; its unfinished work was intact                                                            |
| 17:58 | Timer pass resumed #2215 and admitted #2228, which was no longer blocked                                          |
| 18:02 | Intake paused as a recorded checkpoint                                                                            |
| 18:07 | #2215 and #2228 stopped at their round boundary so a release could be installed                                   |
| 18:14 | #2215 published as PR #2653 (the round already running finished first)                                            |
| 18:25 | Release `345cc035` installed from commit `90381c331`; both issues moved to it and reopened                        |
| 18:30 | Timer pass started both issues one second apart on lanes 1 and 2                                                  |
| 18:41 | Engine restarted on purpose with #2215 waiting in its feedback cooldown and #2228 mid-review                      |
| 18:50 | #2215's waiting round resumed by itself; the timer pass removed #2228's leftover check container, cleared its run |
| 18:51 | #2215 ready (PR #2653): required checks passed on the current head                                                |
| 18:53 | #2228 blocked `no-change`: the restarted round began again although its candidate was committed (defect 21)       |
| 19:01 | The next pass posted the blocked notice on issue #2228 by itself                                                  |
| 19:21 | Release `d44390a5` installed from commit `3387942ac`; #2228 moved to it and retried                               |
| 19:24 | Scope approved with #2239 and #2208 added; intake resumed. No operator step after this until 20:43                |
| 19:29 | #2228: review, one acceptance correction, review again; both reviews clear, final acceptance passed (8 criteria)  |
| 19:33 | Timer pass admitted #2239 and kept #2208 out: its prerequisite #2068 has no merged pull request that closes it    |
| 19:35 | #2228 published as PR #2657; #2239's first round started on lane 2 while #2228 continued on lane 1                |
| 19:57 | #2228 ready (PR #2657)                                                                                            |
| 20:01 | #2239 published as PR #2659: both reviews clear, final acceptance passed                                          |
| 20:12 | #2239: Samson judged a CodeRabbit finding valid; a repair round fixed it with a test and was reviewed again       |
| 20:42 | #2239 ready (PR #2659), 68 minutes after admission, with no operator request on the issue                         |
| 20:43 | Intake paused as a recorded checkpoint; the third review round ran on this state                                  |
| 21:24 | Release `52dcbf1c` installed from commit `3c79dc7b4` (defects 26 to 30)                                           |
| 21:25 | Scope approved with #2205 and #2207 added; intake resumed                                                         |
| 21:27 | Timer pass admitted #2205                                                                                         |
| 21:33 | #2205 blocked in its first round: Ezra found the requested check cannot pass without editing protected files      |
| 21:38 | The next pass posted the blocked notice on issue #2205 and admitted #2207                                         |
| 21:46 | Engine restarted on purpose while #2207's committed candidate was under review (the state that blocked #2228)     |
| 21:48 | Timer pass cleared the dead run and sent #2207 to review only; both reviews started again, with no operator       |
| 21:54 | #2207's publish failed the pre-push gate at `format`; the factory ran a repair round and reviewed again           |
| 22:18 | #2207 published as PR #2660: both reviews clear, final acceptance passed                                          |
| 22:39 | #2207 ready (PR #2660)                                                                                            |
| 22:42 | Intake paused as a recorded checkpoint; the fourth review round ran on this state                                 |
| 23:29 | Release `2cfd7082` installed from commit `629fffb17` (defects 31 to 33); intake stayed paused                     |
| 23:29 | #2239 stopped, moved to the new release and reopened, to have the factory review its candidate again              |
| 23:32 | Timer pass started that round: both reviews clear with no finding, final acceptance passed, pre-push gate passed  |
| 23:42 | PR #2659 republished with its description rewritten; 23:52 #2239 ready again                                      |

PR #2660 (issue #2207) at 22:42: head `b28f1911`, mergeable, clean, 24
checks successful and 3 skipped on that head, no review thread, no required
approval. The
bots reported no finding; CodeRabbit and Codex reviewed this head. Its
description states the reviews with the corrected wording (defect 27).

PR #2659 (issue #2239) at 20:44: head `850bbe4d`, mergeable, no conflict,
required checks `ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke` successful
on that head, no open review thread, no required approval. The full `test-e2e`
job, which is not a required check, was still running when the factory
reported the pull request ready. CodeRabbit raised one finding on the first
head (a report entry that is not an object made the verifier throw); Samson
confirmed it in the workspace, Bezalel fixed it with a test, both reviewers
looked at the new head, and the thread is resolved. CodeRabbit then skipped
the new head (rate limit) and Cursor reviews a pull request once, so the
readiness comment says a person must confirm review coverage. Two optional
(P3) reviewer notes on the repaired head were assessed as not material and
were not acted on.

PR #2657 (issue #2228) at 20:44: head `ff47abaa`, mergeable, clean, all
checks successful on that head, no review thread. CodeRabbit was rate-limited
and reviewed nothing, which the readiness comment says. Cursor's five reviews
of that head reported no finding.

PR #2652 at 18:00: head `f6a1457b`, mergeable, no conflict, required checks
`ci-gate`, `e2e-smoke-gate`, `migrate` and `smoke` successful on that head,
CodeRabbit's check successful on that head, no review thread, no required
approval. Samson judged twelve pieces of bot feedback, each with a stated
reason, and answered the one request (CodeRabbit asked for the deploy
checklist) on the pull request. No bot raised a finding about the code. Cursor
reviewed the first head only, which the readiness comment says.

### Defects found, in order

Each was reproduced or confirmed on the running system, repaired test-first
and checked again on the VM. The numbering continues the list above.

12. The selector walked the whole dependency history of every scope issue
    (more than 600 GitHub calls) and hit its ten-minute limit. It now reads an
    authorized issue and its direct prerequisites only; a pass over the same
    scope takes about 20 seconds and 26 calls.
13. A run whose engine process died stayed "running" and kept its resource,
    so one interrupted selector stopped every later pass. The intake pass now
    abandons factory runs whose recorded engine process is provably gone,
    after removing that run's check containers.
14. Selection blocked #2228 on issues its own specification says it does not
    depend on ("not blocked by #2268", "no relation and no dependency"). A
    denial now declares nothing, each sentence is classified by its own words,
    and a prerequisite outside the scope is only asked whether its closing
    pull request is merged.
15. Reviewers and final acceptance check the candidate where `node_modules`
    is read-only. A test that starts its own child test process failed there
    for a reason that was not the candidate's, so those roles answered
    inconclusive, and optional findings were turned into repair rounds to get
    a new review. Read-only checks now have a private scratch mount over the
    dependency cache directories, read-only roles are told which gates the
    pre-push gate owns, and an optional finding no longer starts a round.
16. A bot check that finished skipped (CodeRabbit on PR #2649) counted as a
    review. Finished any way but successful now means the bot did not review:
    the pull request can become ready, but it is not merged until a person
    confirms.
17. Two admitted issues ran one round at a time, because the engine
    serializes runs that share a resource and a folder. Each issue now has its
    own delivery lane, recorded at admission.
18. GitHub requests had no deadline; one unanswered request could cost a pass.
19. A crash while taking a check slot left a slot nobody could reclaim.
20. Nobody was told when an issue blocked. The next pass now posts one comment
    on the GitHub issue with the reason and the next step.

21. A round interrupted after its candidate was committed was started again
    on its own route. The implementer had nothing left to change and the issue
    blocked `no-change` (#2228 at 18:53). The next round now follows what the
    interrupted one recorded: a committed candidate goes to review only,
    anything else runs again (see defect 26 for the case in between).
22. The first denial rule (defect 14) dropped real prerequisites: "not ready
    because blocked by #50" read as a denial. Only a negated dependency word
    or issue reference is a denial now, and a denial takes the issues it names
    with it ("requires #51, not #50").
23. A range ("#2223 to #2225") named only its two ends. It now names every
    issue in it; a range wider than 25 issues stops for a person. An issue
    named both as related and as a prerequisite is a prerequisite, not a
    conflict.
24. The lane-clash rule added with defect 17 chose a lane from the other live
    issues at each start, so one round could have been started on two lanes.
    The lane is now read from the work item alone; two issues that record one
    lane take turns.
25. A blocked issue was announced only while its blocker was less than a day
    old (now a week), and an update needed the first install's build
    directories for the pinned engine binary and plugin (it now takes them
    from the installed copies).

Defects 21 to 25 were found by the 18:41 restart test and the second review
round, repaired test-first in commit `3387942ac`, and were in release
`d44390a5`, whose 103 installed pack files hashed identically to that commit.

26. The repair for defect 21 also sent a round that had defined acceptance and
    committed nothing straight to the implementer, as the existing rule for a
    failed step already did. Only the run that records acceptance tests may
    commit them, so that round would have set the tests aside and blocked the
    issue. This was reproduced in a test, not seen live. The first repair
    (define acceptance again) was replaced by defect 31's.
27. The pull request said "Micaiah CLEAR" for a review sealed with a finding
    that Samson assessed as not material (PR #2659). The description now says
    that findings were raised and not upheld, and a long brief ends at a line
    end. PR #2659 was rewritten by the factory at 23:42 (below).
28. A bot's request about the pull-request description (CodeRabbit asked for
    the deploy checklist on PR #2659) was assigned as a code fix that nothing
    can carry out, and stayed unanswered. Samson is now told to answer such a
    request in a reply. PR #2659's request is still unanswered.
29. Dependency text: "#50/#51" and "#50; #51" read only the first issue;
    "wasn't blocked by" and "not after" were read as prerequisites; a
    prerequisite named by its pull request blocked for good. All read
    correctly now, and a pull request named as a prerequisite is settled when
    it is merged on `develop`.
30. Runbook: the hash comparison did not work as written, reopening the
    already merged #2234 was suggested, and the `ask` conversation id format
    and the reset directory were missing.

Defects 26 to 30 were found by the third review round, repaired test-first in
commit `3c79dc7b4`, and were in release `52dcbf1c`, whose 103 installed pack
files hashed identically to that commit.

31. Defect 26 had a third way in that its repair missed: pre-commit hooks
    rejecting a round's first commit. The cause was one rule in the commit
    step (a run could commit only acceptance tests recorded in that same
    run). The commit step now carries every acceptance test the work item
    records that no commit holds yet, and only with exactly the recorded
    content; a changed one still blocks. A round that defined acceptance and
    committed nothing goes to the implementer again, as first designed.
32. A stray file that was staged and in no commit made the cleanup before a
    commit fail. It is now unstaged and kept as evidence.
33. The semicolon rule of defect 29 also joined "#50; #51 is required" into
    one list. Only a bare list of issues is a list now.

Defects 31 to 33 were found by the fourth review round, repaired test-first in
commit `629fffb17`, and are in release `2cfd7082`, whose 103 installed pack
files hash identically to that commit. One suggestion of that round was not
taken: blocking on files left outside an issue's assigned paths is deliberate
and keeps its test; the runbook says what to do when it happens.

Console (release 7): saving a scope erased the per-issue end states that limit
what may merge; 38 pack refusal codes were shown as "effect unknown"; the work
map showed a Scope step that repair rounds do not run. All three are fixed.

### Independent analysis

Three reviewers analysed the whole factory before the repairs for defects 14
to 20, each alone, read-only, in its own checkout, without access to the VM:
Claude Fable 5.2, GPT-6.1 Sol and Gemini 4 Carbon, each configured at high
reasoning effort. Their scores for "ready to run unattended today" were 3, 5
and 4.5 out of 10. Every repair above from 14 on answers a finding at least
one of them made and the coordinator confirmed; defect 15's cause was found by
the coordinator from the sealed reviews. One reviewer claim was rejected on
evidence: the "duplicate run" at 15:48 was #2215's queued start honouring an
operator stop.

A second round reviewed the repaired factory at commit `90381c331` against the
run records. Claude Fable 5.2 answered "changes still required" (5 out of 10
for unattended use) and Gemini 4 Carbon "verified within the demonstrated
scope" (6.5); GPT-6.1 Sol did not run (its provider reported a usage limit),
so that round had two reviewers, not three. Their confirmed findings are
defects 22 to 25, the incomplete intervention list below, and the missing
unassisted run on one release, which the #2239 run above answers.

A third round reviewed commit `c5f60f4e9` and the 20:44 state. Claude Fable
5.2 answered "verified within the demonstrated scope" (6.5 out of 10 for
unattended use on a wider scope, 8 for the exercise) and Gemini 4 Carbon
"changes still required" (7 and 8); GPT-6.1 Sol again did not run (usage
limit). Both confirmed that #2239 was delivered unattended and that the
installed release matched its commit. Their findings are defects 26 to 30.

A fourth round reviewed commit `942b8687d` and the 22:44 state. Claude Fable
5.2 and Gemini 4 Carbon both answered "changes still required" (6 and 7.5 out
of 10 for unattended use on a wider scope; 8 and 8.5 for the exercise), for
defect 31; GPT-6.1 Sol did not run (usage limit). Both confirmed that #2207
recovered from the deliberate restart by itself, that PR #2660 is ready and
that the installed release matched its commit. The result of the fifth
round, on the final state below, is in the description of pull request #2651:
both reviewers that ran answered "verified within the demonstrated scope".

After the final snapshot the owner merged PR #2652 (00:06 on 13 November),
PR #2653 (00:20) and PR #2660 (00:33) by hand. The factory did not take
part: it does not watch a ready pull request.

### Operator interventions in this pass

Every operator action from 13:22 to 23:52, by kind:

- **Scope:** approved at 13:22 (2206, 2215, 2228 added), at 19:24 (2239, 2208
  added) and at 21:25 (2205, 2207 added).
- **Intake:** paused and resumed at 13:55 and at 14:11 (with one manual
  intake start at 14:11, the only pass the timer did not start), paused
  15:15, resumed 17:13, paused 18:02, resumed 19:24, paused 20:43, resumed
  21:25, paused 22:42.
- **Releases:** seven installs, each with an engine restart: 13:55, 14:11,
  17:13 (`620140dd`), 18:25 (`345cc035`), 19:21 (`d44390a5`), 21:24
  (`52dcbf1c`) and 23:29 (`2cfd7082`).
- **Moving issues to a new release:** `adopt-policy` then `retry` or `reopen`
  for #2206 and #2215 at 17:13, for #2215 and #2228 at 18:26, and
  `adopt-policy` then `retry` for #2228 at 19:21 and 19:22, and `stop`,
  `adopt-policy` and `reopen` for #2239 at 23:29.
- **Stops:** #2215 at 15:15, and #2215 and #2228 at 18:07, to settle them
  before the 17:13 and 18:25 installs.
- **Configuration:** the check-queue wait raised to 30 minutes in the
  operator-owned configuration (previous file kept).
- **Deliberate tests:** engine restarts at 15:05, 18:41 and 21:46; a hold on
  #2215 at 17:30, released at 17:56.

No abandon by hand, hook bypass, forced merge, account switch, API fallback
or fabricated check was used, and no pull request was merged in this pass.

How each issue's delivery is classified:

| Issue | Result          | Classification                                                                                                 |
| ----- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| #2239 | Ready, PR #2659 | **Unattended** from admission to ready on one release. Operator: scope approval and resume before, pause after |
| #2228 | Ready, PR #2657 | **Assisted**: falsely blocked until defect 14 was repaired; blocked by defect 21; one retry after that repair  |
| #2206 | Ready, PR #2652 | **Assisted**: blocked by defect 15, retried after the repair; its last four rounds ran without an operator     |
| #2215 | Ready, PR #2653 | **Assisted**: interrupted, held, stopped and reopened on purpose and across two release changes                |
| #2208 | Not admitted    | Kept out by the selector with a recorded reason; the other issues carried on                                   |
| #2207 | Ready, PR #2660 | **Unattended**, including recovery from the deliberate 21:46 restart. No operator request on the issue         |
| #2205 | Blocked         | Stopped by Ezra for a reason in the issue itself and announced on GitHub; it needs a person's scope decision   |

Automatic selection of the next issue, two issues side by side, recovery from
an engine restart (a waiting round, and a round in review with a leftover
container) and the blocked notice each ran with no operator. Recovery of a
round interrupted after its candidate was committed (defect 21) was proven on
the running system at 21:48 with #2207. The rule for a round that ends
between acceptance and its first commit (defects 26 and 31) is tested against
real repositories in the test suite and was not exercised live.

The final release `2cfd7082` was exercised by the re-review of #2239 at 23:32
(freeze of the recorded candidate, both reviews, final acceptance, pre-push
gate, publication, readiness). That run was started by an operator through the
documented update steps and built nothing new: no issue has gone from
admission to a ready pull request on `2cfd7082` itself. #2239 did so on
`d44390a5` and #2207 on `52dcbf1c`.

The list of open points that closed this pass is now
[Still open](#still-open), after the next section.

## Unattended batch and usage limit - 13 November 2026

All times UTC. This pass answered the fifth review round, added six small
follow-up issues to the scope and let the factory work through them without
help. One issue went from admission to a ready pull request in 52 minutes
with the engine killed in the middle. Two more were published and were in
repair or review when the factory's Claude account reached its weekly usage
limit at 07:24. Nothing was lost and nothing was duplicated, but nothing can
run until the limit resets on 16 November at 15:00 (22:00 in Bangkok), and
three of the six issues were never admitted.

### What was run

| Time  | Event                                                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 04:52 | Release `9b217961` installed from commit `89c5d0a80` (defects 34 to 38)                                                                                |
| 04:58 | First pass on it recorded six pull requests the owner had merged by hand and pruned seven finished workspaces (17 GB)                                  |
| 05:02 | Scope approved with 2370, 2418, 2419, 2421, 2422 and 2526 added, all to a ready pull request; intake resumed                                           |
| 05:09 | Six issues eligible; Samson ranked them; the admit step rejected his answer and admitted nothing (defect 39)                                           |
| 05:15 | Intake paused                                                                                                                                          |
| 05:20 | Release `97fabab0` installed from commit `8facb0881`; intake resumed at 05:21. No operator step on an issue until 09:24                                |
| 05:31 | Timer pass admitted #2526 out of six; Samson's reason: the only bug, and fixing it makes pushes safer for the other five                               |
| 05:33 | Fault injection armed: kill the engine the moment #2526's first commit lands                                                                           |
| 05:41 | Timer pass admitted #2370; both lanes running                                                                                                          |
| 05:48 | #2526's first commit landed and the engine was killed (SIGKILL) before the commit was recorded; restarted in 3 seconds                                 |
| 05:50 | Timer pass cleared both dead runs and started both issues again, with no operator                                                                      |
| 06:12 | #2526 published as PR #2663: its unrecorded commit was taken back and committed again through the hooks                                                |
| 06:21 | #2370 published as PR #2664 (its first round had died with the engine and ran again from the start)                                                    |
| 06:23 | #2526 ready: the four required checks passed on the published head, 52 minutes after admission                                                         |
| 06:33 | Timer pass admitted #2419 into the lane #2526 had freed; #2370: Samson judged four Codex findings valid                                                |
| 06:54 | #2370: acceptance corrected and reviewed; the review asked for two more acceptance corrections                                                         |
| 07:00 | #2419 published as PR #2665                                                                                                                            |
| 07:12 | #2419: Samson judged one CodeRabbit finding valid and answered CodeRabbit's deploy-checklist request in a reply                                        |
| 07:16 | #2370 published again on PR #2664 and waited for the bots                                                                                              |
| 07:24 | Weekly usage limit reached: #2419's two reviewers failed on it, and at 07:26 #2370's feedback step                                                     |
| 07:26 | Both rounds had recorded a provider-fault hold with the reset time; the engine paused both runs until the reset                                        |
| 07:33 | First of eleven passes (to 09:18) that admitted nothing: both lanes were held. #2418, #2421 and #2422 stayed eligible                                  |
| 07:49 | The owner merged PR #2663 by hand; the 07:54 pass recorded #2526 as merged                                                                             |
| 09:23 | Intake paused                                                                                                                                          |
| 09:24 | `recover-native` on #2419 and #2370 from the staged commit `208058f44` (its first live use); both issues stopped                                       |
| 09:54 | Release `34ce64a7` installed from commit `208058f44` (defects 40 and 41)                                                                               |
| 09:55 | Both issues moved to it and reopened; intake resumed                                                                                                   |
| 09:59 | Timer pass started both review rounds one second apart; #2370's lost a fetch race and ended in 9 seconds (defect 42)                                   |
| 09:59 | #2370's next round started by itself 6 seconds later                                                                                                   |
| 10:00 | Both rounds froze their candidate; Micaiah and Luke failed on the usage limit; both issues held and paused as at 07:24                                 |
| 10:09 | First of the passes (still running at 12:05) that report both issues `reset-pending` and admit nothing                                                 |
| 12:29 | Outside the factory: "Update branch" was pressed on PR #2664 and PR #2665, merging `develop` into both branches (defect 45)                            |
| 13:08 | The coordinator put both branches back to the heads the factory recorded                                                                               |
| 15:28 | Pull request #2666 opened with the repairs for defects 42 to 45; its reviews found more gaps, repaired there                                           |
| 18:57 | Intake paused; `stop`, then `recover-native` from the installed release, on #2370 and #2419                                                            |
| 18:57 | Release `d4ef3329` installed from commit `4939d83aa` (defects 42 to 45 and the review repairs)                                                         |
| 18:58 | Both issues moved to it and reopened; intake resumed                                                                                                   |
| 19:03 | Timer pass started both review rounds 0.6 seconds apart; #2370's mirror fetch lost the race again and its second attempt succeeded, with no round lost |
| 19:04 | Both rounds froze their candidate; Micaiah and Luke failed on the usage limit; both issues held and paused until the reset, for the third time         |

The six pull requests recorded at 04:58 belong to issues 2206, 2207, 2215,
2228, 2234 and 2239. PR #2657 (#2228) and PR #2659 (#2239) were merged by the
owner at 00:46 and 01:37.

#2526, from the work item and the engine's records: admitted 05:31:04; first
commit `a0bd3ce0e7dd` at 05:48:24.6, engine killed in the same instant
(`core-archon.service: Main process exited, code=killed, status=9/KILL`);
both dead runs cleared at 05:50:05, and the next round's claim ledger records
that commit as restored; published 06:12:43; ready 06:23:30 on head
`2fd97d52`. The issue's operator request list is empty. The bots reported no
finding on that head.

The usage limit, as the provider reported it: "You've hit your weekly limit,
resets Nov 16, 10pm (Asia/Bangkok)", which is 2026-11-16T15:00:00Z. Each held
work item carries that time, and the engine shows each paused run as "tries
again at 2026-11-16T15:00:00.000Z". No check container was left behind either
time.

### Defects found, in order

The numbering continues the list above. Defects 34 to 38 answer the fifth
review round (commit `89c5d0a80`, release `9b217961`); three of them were on
the open list of 12 November.

34. A round stopped between its commit and the record of that commit (or
    one whose hooks left files behind after the commit) blocked the issue: the
    next round put the branch back and the acceptance tests of the unrecorded
    commit were gone. A reviewer reproduced it in round 5. The next round that
    commits work now takes the unrecorded commits back into the working tree
    and commits them again through the hooks. Proven live at 05:48 on #2526,
    with the engine killed in exactly that window.
35. Ezra could not remove or rename a committed acceptance test: the freeze
    step put the old file back. A removal is now recorded with the acceptance
    and committed; a test somebody else deleted is still put back.
36. A tool killed by a signal inside the pre-push hook cost a repair round
    (#2207 on 12 November). The hook now runs once more on the same commit
    before the failure counts. Not seen live since.
37. The factory kept listing a pull request as ready after its owner merged
    it. The intake pass now records that merge, and nothing else about a
    ready pull request. Seen live at 04:58 (six issues) and 07:54 (#2526).
38. Finished workspaces were never pruned. The intake pass now removes the
    dependency trees of merged issues and keeps the clone. Seen live at 04:58.
39. With six eligible issues Samson wrote the chosen issue as `2526` where
    the eligible list writes `#2526`, the check rejected his whole answer and
    the 05:09 pass admitted nothing. Earlier passes had one or two eligible
    issues and never produced that form. The same number without its `#` now
    names the same issue, the recorded id is the eligible list's own, and
    Samson is told to copy it as written. Commit `8facb0881`, release
    `97fabab0`; the 05:31 pass admitted on it.
40. The hold after a provider fault had no way out (on the open list of 12
    November). It occurred live at 07:24, on a usage limit: `record` held
    both issues, and no control could release them. `issue <n> recover-native`
    now clears a hold once the evidence is in (same release and account, the
    issue's branch on GitHub at a recorded commit, no check container left,
    the engine reports the held run ended), and the intake pass runs it by
    itself for faults the engine classifies as recoverable, after any reported
    reset. Three such faults in a row without a new commit block the issue.
    Commit `012c40e6d`.
41. `recover-native` as first written refused every run it was meant to end.
    The engine keeps a run's lease live until the run is completed or
    cancelled, so a failed or paused run still holds its issue's lease; the
    command refused any live lease, and it ended only failed runs, while a
    usage limit leaves the run paused. Its tests passed because their failed
    run held no lease. Found before the command was installed, by reading the
    two live holds against the engine's source. The held run's own lease no
    longer refuses the command, a paused run is ended like a failed one, a run
    that still executes is never ended, and the tests use the lease the engine
    really reports. Commit `208058f44`, release `34ce64a7`.
42. Two rounds that start in the same second both fetch into the one Git
    mirror, and the slower fetch fails on every branch the faster one already
    moved ("incorrect old value provided"). At 09:59 this cost #2370 one
    round of nine seconds; the next round started by itself and prepared its
    workspace. A fetch that loses that race now runs again, up to four times;
    any other failure is still reported at once. The test reproduces the race
    with two real fetches.
43. The intake pass could reach a paused run in the seconds in which the
    engine wakes it. The engine looks for due waits every five seconds, and
    the pass's own recovery ends a run it finds paused, so a pass that landed
    in those seconds after a reset would have ended a run the engine was
    about to continue. Found by reading the engine's scheduler, not seen
    live. The pass now leaves a held issue alone until two minutes after the
    reported reset; a run still paused then was not woken, and ending it is
    the fallback.
44. The Console still said that no recovery exists for a provider-fault hold
    and had no control for it, and the hold's own "what to do" line predated
    the command. The issue page now has "Clear the provider-fault hold"
    (enabled only on a held issue, confirmed before it runs, with the hold
    and the reported reset shown), the Console explains each refusal of the
    command, and the hold's recovery line names the command and says when the
    intake pass clears the hold by itself.

45. A push from outside the factory left a held issue held for good, with
    nobody told. At 12:29 GitHub's "Update branch" was pressed on PR #2664
    and PR #2665 (a bulk update that reached other pull requests too), which
    merged `develop` into both factory branches. `recover-native` refused
    while a branch held a commit the work item never recorded, a refusal
    writes nothing, and only a blocked issue is announced. After the reset
    both issues would have spent a review round, failed to publish over the
    new head and stayed held, keeping both lanes. The sixth review round
    found it (below). The coordinator put both branches back at 13:08; only
    the two merges were dropped. Repaired test-first: in the feedback stage a
    head that contains the candidate and adds nothing but `develop` is
    adopted and reviewed again, the way an operator's conflict resolution
    already was; any other outside head blocks the issue, which is announced;
    and a held issue whose branch moved is cleared onto the feedback route
    instead of being refused. The check that tells an update from other
    outside commits is tested against real merges. A bot review of pull
    request #2666 then found that the feedback stage still answered and
    resolved review comments before it blocked on a head it did not adopt;
    it now blocks (`outside-head`) before it writes anything to the pull
    request. The reviews of that pull request found four more gaps, all
    repaired: a merge commit could carry changes of its own, or drop
    `develop`'s, and still pass as an update (each merge's tree must now
    equal a clean merge of its parents); a woken run's failed publish or
    readiness step was hidden by the stored usage-limit hold, so the pass
    would have cleared it by itself (it is now held for a person, as without
    a stored hold); the feedback stage judged an outside head against refs
    fetched when the round started, so an update pressed during the round
    would have blocked the issue (it now fetches first); and the pass could
    end a run the engine had paused again for a later reset (it now asks the
    engine, and leaves a paused run alone until two minutes after the time
    the engine set to wake it; a run still paused after that counts as not
    woken and is ended).

Defects 42 to 45, and the gaps the reviews of pull request #2666 found, were
repaired test-first and are in release `d4ef3329`, installed at 18:57 from
commit `4939d83aa`. Its 103 installed pack files hash identically to that
commit, and the installer's diagnostics passed. The fetch retry was seen on
the running system at the first pass after the install: the claim ledger of
#2370's round records two fetch attempts, and the round went on. The other
repairs of this group have not been exercised live.

The pack of release `34ce64a7` (103 files) hashes identically to commit
`208058f44`, and the installer's diagnostics passed.

One property of the design, not a defect: after a usage limit the engine wakes
the paused run by itself at the reset and that run finishes its round, but the
hold stays until the next pass clears it with `recover-native`, and what
the woken round did is not recorded. The round is then run again on the same
candidate: its reviews, final acceptance, pre-push gate and publication run a second time, and what the woken round found is not kept: the repeated reviews may find something different. A usage limit
therefore costs one repeated round per held issue.

### Independent analysis

The fifth round reviewed the state of 12 November at 23:52. Claude Fable 5.2
and Gemini 4 Carbon both answered "verified within the demonstrated scope"
(6.5 and 7.5 out of 10 for unattended use on a wider scope; 8 and 8.5 for the
exercise); GPT-6.1 Sol did not run (usage limit). Their findings are defects
34 to 38. Both named the same missing proof: several issues delivered in a
row with no operator, which this pass set out to give.

The sixth round reviewed commit `83eb925e6` and the state at 12:48, with one
main question: will the factory carry on by itself at the reset? Claude Fable
5.2 and Gemini 4 Carbon both answered no, and "changes still required" (5 and
5.5 out of 10 for unattended use on a wider scope; 7 and 6.5 for the
exercise); GPT-6.1 Sol did not run (usage limit). Both found defect 45
independently, by reading the two pull requests on GitHub, and both traced
the rest of the path at the reset and found it sound once the branches were
back. Gemini 4 Carbon also found that a woken run's newer fault was discarded
in favour of the stored one (a later reset time, or a fault that needs a
person), which is repaired in the same commit as defect 45, and the two
limits now listed under Still open: a woken round's result is not kept, and a
failed run whose `record` step did not settle. Both confirmed the mirror
fetch retry and the two-minute wait as correct. Their corrections to the
runbook are made: when "Update branch" is safe, `stop` before
`recover-native`, what a refusal leaves behind, and what a usage limit costs.

### What this pass shows, and what it does not

Shown on the running system, with no operator step on the issue:

- A whole delivery on one installed release: #2526 from admission to a ready
  pull request in 52 minutes on `97fabab0`.
- Recovery from an engine kill in the seconds between a round's commit and
  the record of that commit. Both lanes were cut off; both issues continued by
  themselves at the next pass.
- Selection among six eligible issues with recorded reasons, two issues side
  by side, and the next issue admitted when a lane came free.
- Repairs driven by real bot findings: four Codex threads on #2370, one
  CodeRabbit thread on #2419, each judged by Samson with a stated reason.
- A real usage limit with two lanes running: no work lost, nothing done
  twice, both issues held with the provider's reset time, twice (07:24, and
  again at 10:00 on the release that can recover them).
- An owner's merge recorded, and finished workspaces pruned.

Not shown:

- **The batch did not finish.** Of six issues one is delivered, two are
  published and not ready (#2370 with PR #2664, #2419 with PR #2665) and
  three were never admitted (#2418, #2421, #2422). The cause is the usage
  limit, not a factory fault, but that is the result.
- **Automatic recovery after the reset.** It can first be seen after 15:00 on
  16 November. Until then it rests on tests and on the operator command's
  live use at 09:24.
- **How much usage an issue costs.** The account's weekly allowance ran out
  on the fourth day of commissioning. The factory has no measure of usage per
  issue, does not know how much of the allowance its own rounds took, and has
  no rule that slows admission as the allowance runs out.

### Operator interventions in this pass

Every operator action from 04:52 to 18:58:

- **Releases:** four installs, each with an engine restart: 04:52
  (`9b217961`), 05:20 (`97fabab0`), 09:54 (`34ce64a7`) and 18:57
  (`d4ef3329`).
- **Scope:** approved at 05:02 (six issues added).
- **Intake:** resumed 05:02, paused 05:15, resumed 05:21, paused 09:23,
  resumed 09:55, paused 18:57, resumed 18:58.
- **Deliberate test:** the fault injection armed at 05:33, which killed and
  restarted the engine at 05:48. The script is a test fixture, not part of
  the factory.
- **Provider-fault holds:** `recover-native` on #2419 at 09:24:19 and on #2370
  at 09:24:54, run from the staged copy of commit `208058f44`: the installed
  release had no such command, and the installer refuses to change releases
  while an issue is held. For each issue the command read back the branch on
  GitHub, proved the release and the account, ended the paused run through the
  engine and settled the item with its committed work kept. At 18:57 the
  same was done for the second release change, this time from the installed
  release and with `stop` first, so that each issue settled as stopped and no
  pass could start a round in between.
- **Moving issues to the new release:** `stop` for #2370 and #2419 at 09:24:55;
  `adopt-policy` then `reopen` for both at 09:55, and again at 18:58.
- **Factory branches:** at 13:08 both issue branches were moved back, through
  the GitHub API, to the heads the work items record (PR #2664 to
  `ce30c37f7610`, PR #2665 to `89958f49a290`), after checking that each
  outside head was a merge of `develop` on top of exactly that head. The
  dropped merges are `7e828c4880a4` and `c15021c39f4d`. The session that
  reviews the other open pull requests was told to leave `factory/*`
  branches alone.

No operator step touched #2526, #2370 or #2419 between their admission and
09:24. No abandon by hand, hook bypass, forced merge, account switch, API
fallback or fabricated check was used, and the factory merged nothing.

| Issue                  | Result                    | Classification                                                                                                                   |
| ---------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| #2526                  | Ready, PR #2663           | **Unattended**, across the deliberate engine kill. The owner merged it afterwards                                                |
| #2370                  | Published, PR #2664, held | **Unattended until the usage limit** (six rounds, one bot-driven repair); then moved to the new release by hand; held again      |
| #2419                  | Published, PR #2665, held | **Unattended until the usage limit** (three rounds); then moved to the new release by hand; held again with candidate `4b6f4640` |
| #2418, #2421 and #2422 | Not admitted              | Eligible since 05:09; both lanes have been held since 07:26                                                                      |

## Still open

State on 13 November 2026 at 19:05 UTC.

- **The batch is unfinished and the factory is out of usage until 16
  November, 15:00 UTC.** Intake is open. At the reset the engine wakes the two
  paused rounds and a later pass settles them, and the factory carries on with
  #2370, #2419 and then #2418, #2421 and #2422, using the new weekly
  allowance. `factory pause-intake` before the reset stops new admissions;
  the two paused rounds still finish.
- **Automatic recovery after a usage limit has not been seen end to end**
  (above). Hold kinds the engine does not classify as recoverable (sign-in,
  budget, configuration, unclear effects) wait for a person, who now has
  `recover-native`.
- **Usage is not measured or rationed** (above).
- **Installed and not yet exercised live:** the wait after a reset (defect
  43), the adoption of an outside update and the block on any other outside
  head (defect 45), and a woken run's newer fault. They rest on tests. The
  fetch retry (defect 42) was seen at 19:03.
- **An update pushed while the factory holds a newer candidate it has not
  published** still blocks the issue after the repair: the two histories
  have diverged, and the branch has to be put back by hand.
- **`recover-native` reads the held run's status and then asks the engine to
  end it.** Whether the engine would end a run it woke between those two
  steps was not established: the two reviewers read its source differently.
  Committed work would be kept either way. The intake pass avoids that moment
  (defect 43). An operator should not use the command in the minute after a
  reset.
- **A round whose `record` step did not settle the work item, while another
  step had failed, is not recovered and nobody is told.** The engine reports
  the run `failed`, a failed run keeps its issue's lease, and no pass or
  control ends it. A reviewer found this in round 6 by reading the code; it
  has not been seen. The runbook has the manual steps (Reboot and recovery).
- **A woken round's result is not kept** (above): after a usage limit the
  round is repeated, at the cost of its reviews and gates.
- **The Console on VM 100 is the earlier build.** Until it is rebuilt it has
  no control for a provider-fault hold (the command line has it) and reads
  owners and admission capacity from its own settings.
- **A release change with a held issue is manual:** `stop`, `recover-native`,
  install, `adopt-policy`, `reopen`, for each issue (runbook, Updates).
- **Off-host backup copy** and the **USB disk bridge**: both need a person.
- **Disputed bot feedback** stops for a person; Agabus is not consulted in the
  feedback stage.
- **Scope is approved by hand.** The factory orders and admits what is in the
  scope; it does not choose issues from the backlog or the roadmap.
- **A prerequisite closed without a merged pull request that closes it** is
  never counted as done; the issue that names it stays blocked, with that
  reason. #2208 is such a case: #2068 was closed by hand, and the pull request
  that delivered it does not say it closes it. Reword the issue or name the
  closing pull request to release it.
- **A ready pull request is watched for one thing only.** The intake pass
  records that somebody merged it. It does not follow `develop`, later
  comments or checks; `issue <n> reopen` runs the feedback stage again.
  "Ready" means the four required checks passed on the current head: the
  full `test-e2e` job is not required and may still be running. The
  pull-request description is not rewritten when the factory later merges
  `develop` into the branch.
- **Bot coverage needs a person when a bot is rate-limited.** CodeRabbit
  skipped #2657 and the repaired head of #2659; the factory says so on the
  pull request and never merges such a head by itself. A reviewer reported
  that a CodeRabbit check carried forward from an earlier head may count as a
  review of the new head; that was not reproduced.
- **`"coverage":"once"` for Cursor** lets a head repaired after Cursor's only
  review be merged without Cursor seeing it. It is an operator choice.
- **Console:** chat and bounded assessments were not exercised. It now
  reads owners and admission capacity from the factory configuration (merged
  with pull request #2651), which the build on VM 100 does not have yet.
- **Analysis runs** are started only by an operator, and an open attention
  item is never closed.
- **Only merged issues are pruned.** The workspace of a ready, blocked or
  stopped issue (about 3 GB) stays until the issue is merged.
- **Not exercised live:** identity drift, an interrupted publish or merge, a
  failed required check on a published head, a round that ends between
  acceptance and its first commit (defects 26 and 31), the second run of a
  crashed gate tool (defect 36), the removal of a committed acceptance test
  (defect 35), and a whole delivery on the installed release `d4ef3329`.
- **Files left outside an issue's paths block it** (`acceptance-strays`), by
  design; the runbook has the steps.
- **#2205 needs a decision:** the check it asks for cannot pass unless
  protected skill documents are edited, which the issue does not authorize.
- **The factory's own merge was proven once,** on #2233 in the commissioning
  run. Every later delivery ended at a ready pull request that the owner
  merged.
- **Analysis turn cap** is not enforced by the engine (see above).

The governing acceptance matrix is partly verified, not complete.
