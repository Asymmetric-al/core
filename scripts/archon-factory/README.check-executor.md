# Disposable candidate-check executor

`pack/.shared/executor.mjs` exports `executeCandidateCheck(input)` and `CheckCleanupError`.
It is not a controller, queue, scheduler, service, role runner, checkout copier or publisher.

## Input

- `dockerExecutable`: operator-controlled absolute Docker CLI path.
- `image`: inspected local image ID: `sha256:` plus 64 lowercase hex digits. Tags and registry digests are not substitutes.
- `workspaceRoot`: existing dedicated disposable-check root, not a filesystem root. Keep it inaccessible to candidates and other writers.
- `workspaceDirectory`: existing real directory directly inside that root. Symlinks/junctions, escaped roots, quotes and line breaks are rejected. Spaces, commas and shell metacharacters are passed literally using Docker CSV quoting.
- `command`: executable and arguments as an array. No host shell is used.
- `user`: optional non-root numeric UID:GID, default `1000:1000`. Match disposable-copy permissions to this identity.
- `signal`: optional `AbortSignal` for ordinary cancellation.
- `attempt`: optional caller-chosen UUID for the container name and attempt label (check-mcp records it in its slot before starting).
- `runId`, `issue`: optional factory run id and positive issue number, added as labels `core.archon.run` and `core.archon.issue` so cancel-run can find every container of a run.
- `mounts`: optional extra bind mounts `{ source, target, readOnly }`. Both `source=` and `target=` are quoted CSV fields, so a comma in a writer-created path cannot add mount options; quotes and line breaks are rejected.
- `limits`: optional finite positive bounds; unknown keys rejected; non-CPU values must be integers.

| Limit              | Default                                    | Maximum  |
| ------------------ | ------------------------------------------ | -------- |
| `cpus`             | 2                                          | 16       |
| `memoryMb`         | 2048                                       | 32768    |
| `pids`             | 128                                        | 2048     |
| `timeoutMs`        | 900000                                     | 3600000  |
| `controlTimeoutMs` | 5000 per Docker call                       | 30000    |
| `outputBytes`      | 1048576 combined stdout/stderr input bytes | 16777216 |

Cleanup runs outside the candidate deadline, with separately bounded control calls.
A killed Docker client has at most one additional second to report closure; otherwise reuse is blocked.
Output overflow stops the candidate and retains only the bounded prefix.

The CLI receives an empty environment, an adapter-created credential-free Docker config directory and the explicit local Unix socket endpoint. Neither config nor socket is mounted inside the container. The pinned image is never pulled.
The container has network `none`, read-only rootfs, dropped capabilities, no-new-privileges, no restart/healthcheck/logging, CPU/memory/swap/PID limits, one writable candidate bind and a 256 MiB `/tmp` tmpfs. The adapter overrides the image entrypoint and sets `HOME=/tmp` and `CI=1`. Extra image-declared volumes are rejected before start.

## Result and recovery contract

The receipt includes `status` (`passed`, `failed`, `timed_out`, `cancelled`, `output_limit`), inspected `exitCode`, bounded `stdout`/`stderr`, full `containerId`, generated `containerName`, ownership `labels`, image, command, workspace, limits, config directory, `cleanupConfirmed` and `reusable`.

Every create uses a fresh name and labels `core.archon.executor=candidate-check` and `core.archon.attempt=<UUID>`. Inspect must match full ID, image and both labels before start and cleanup. Ambiguous creation is reconciled by the generated name and labels, never broad process/container selectors. An attach-client exit is not workload completion: the daemon must report a stopped, non-paused, non-restarting container. If active, kill the exact ID and inspect again before non-forced removal. Only confirmed stop plus successful ID-matching removal permits cleanup/reuse. A failed check can have confirmed cleanup without becoming a passing check.

Uncertain inspect, ownership, client closure, kill/readback or removal throws `CheckCleanupError` with `error.receipt.cleanupConfirmed === false` and `error.receipt.reusable === false`. Retain the slot/workspace and reconcile that exact identity; do not launch a retry. Missing inspect after ambiguous create is deliberately not cleanup proof. The adapter never removes the candidate directory, original checkout, dirty files or untracked issue work. Only its own Docker config is removed, after confirmed cleanup.

Receipts are not durable storage. Parent/runtime crash recovery must reconcile actual labeled containers before reuse. The parent must wire ordinary cancellation to the signal; SIGKILL cannot run JavaScript cleanup.

`removeLabeledContainers({ dockerExecutable, labels })` is that reconciliation: it lists every container carrying all given labels (`core.archon.attempt`, `core.archon.run`, `core.archon.issue` or `core.archon.executor` only), force-removes each, and lists again. It returns `{ ok, found, remaining }`; `ok` is true only when the second listing is empty, and a failed listing returns `ok: false` with `remaining: null`.

## Check slots (`check-mcp.mjs`)

`run_check` takes one of `limits.heavyCheckSlots` lock directories under `<root>/locks`. The slot's `owner` file records the server pid, the attempt UUID, its container name, run and node. When every slot is busy the call waits (polling, bounded by `limits.checkQueueMs`, default 10 minutes) instead of refusing at once, so Micaiah and Luke queue behind each other; a refusal tells the role to report the check as not run. A slot is released after confirmed cleanup. After unconfirmed cleanup the slot stays held and is marked `unconfirmed`; any later acquirer (or a dead owner's slot) is reclaimed only after `removeLabeledContainers` confirms no container with that attempt label remains. A slot with a missing or unreadable owner record, or one without an attempt (written before this format), is treated as busy until an operator clears it. SIGTERM, SIGINT and stdin close abort running checks through the executor's signal; the server exits after they settle.

## Prerequisites and evidence limits

The parent prepares a credential-free disposable **copy**, never the original issue checkout. Exclude credentials, control/profile files, Git authentication, peer artifacts and links to non-disposable data. Filesystem provenance, embedded secrets, image contents, host disk quotas and absence of concurrent workspace writers cannot be established by lexical containment or this adapter. Qualify the pinned image as credential-free, including its inherited environment, configuration and toolchain. The Docker daemon and executable are trusted.

Run the native factory as the authorized admin user, not root; Docker access is privileged. No worker service or global configuration is installed. This adapter targets a Linux Docker daemon. Windows unit tests fake Docker; they do not qualify Docker Desktop path translation.

Before live VM100 use, inspect retained `core-archon-checks:node24.22.1-bun1.4.3-jq` and supply its actual full image ID. No ID is guessed or embedded. The parent must perform real cancellation, resource/isolation and slot-reuse qualification on Docker 29.9.3. Unit fixtures establish argv/env, identity and fail-closed lifecycle only, not live containment, image contents, role isolation, CI parity or unattended execution.

Focused verification: `bunx vitest run tests/unit/scripts/archon-check-executor.test.ts`. The second argument `{ spawn }` replaces only the external Docker CLI boundary for unit tests; omit it in production.
