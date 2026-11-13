# Core factory pack (Archon 0.14.0)

The installed Core workflow pack for the VM 100 factory. Archon is the engine;
this pack supplies Core's admission rules, the six-role delivery round, operator
chat, bounded analysis and the trusted adapters they need. Installation and
operations: `docs/ops/archon-vm100-factory-runbook.md`.

## Layout on VM 100

| Path                                           | Owner                | Purpose                                                                                                                                                                                                                                               |
| ---------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/opt/archon/0.14.0/archon`                    | root                 | Pinned engine binary (SHA-256 `996d9989…5bab`)                                                                                                                                                                                                        |
| `/opt/core-archon-factory/releases/<rev>/pack` | root                 | Installed pack release, read-only                                                                                                                                                                                                                     |
| `/srv/core-factory/control`                    | root, admin-readable | Trusted folder project every factory run executes in: installed pack, `core-factory.json`, `.claude/settings.json` (guard hook), `mcp/core-check.json`, `sources.json` (signed webhook sources), `.archon/core-factory-release.json` (release record) |
| `/srv/core-factory/archon`                     | admin                | `ARCHON_HOME` (SQLite store, plugins, logs)                                                                                                                                                                                                           |
| `/srv/core-factory/mirror.git`                 | admin                | Bare mirror; `refs/remotes/origin/*` mirrors GitHub                                                                                                                                                                                                   |
| `/srv/core-factory/issues/<n>/repo`            | admin                | One clone per issue (objects via mirror alternates)                                                                                                                                                                                                   |
| `/srv/core-factory/issues/<n>/outbox.git`      | admin                | Private push target for the hooked pre-push                                                                                                                                                                                                           |
| `/srv/core-factory/views/<run>/<role>`         | admin                | Exact, Gitless candidate views for read-only roles                                                                                                                                                                                                    |
| `/srv/core-factory/runs/<run>`                 | admin                | Trusted run context, guard log, check receipts, role materials                                                                                                                                                                                        |
| `/srv/core-factory/credentials/gh`             | admin, 0700          | The factory's GitHub CLI profile (never given to roles)                                                                                                                                                                                               |

## Workflows

| Workflow       | Started by                           | Resource (capacity, overlap)       | Job                                                                                                                                                                                                                                                                                                                                                                                                                |
| -------------- | ------------------------------------ | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `core-select`  | `core-factory-intake.timer` (10 min) | `core-factory:admission` (1, skip) | Sweep admitted work (recover recoverable provider faults, start idle rounds, reconcile runs that ended without recording, release stale reservations, record ready pull requests somebody merged, drop the dependency trees of merged issues); compute the eligible frontier of the authorized scope; Samson ranks it together with the newest 10 open `core/attention` items; record one assignment; fire round 1 |
| `core-deliver` | selector, previous round, sweep      | one lane each (1, queue; below)    | One delivery round for one issue (below)                                                                                                                                                                                                                                                                                                                                                                           |
| `core-answer`  | Console chat (`control.mjs ask`)     | `core-factory:chat` (1, queue)     | One Samson operator turn; may _propose_ one operation                                                                                                                                                                                                                                                                                                                                                              |
| `core-analyze` | Console / incidents                  | `core-factory:analysis` (1, skip)  | Bounded advisory analysis; never a gate                                                                                                                                                                                                                                                                                                                                                                            |
| `core-probe`   | qualification                        | `core-factory:probe` (1, queue)    | Identity and boundary probes                                                                                                                                                                                                                                                                                                                                                                                       |

Every start is a signed Standard Webhooks delivery to the engine's own sources
(`.shared/webhook.mjs`, `control/sources.json`). There are no CLI trigger
bindings, and `core-factory.json` has no `bindings` key.

**Delivery lanes.** The engine starts one run at a time among runs that share
a resource and a folder, whatever the resource's capacity, and every factory
run executes in the control folder. Delivery therefore has one single-run
resource per lane (`core-factory:delivery-<lane>`, source
`core-factory-deliver-<lane>`), as many lanes as `limits.admittedIssues`.
Admission records on the work item the lowest lane no live issue holds
(`lane`), and every round of that issue starts on it, so two admitted issues
run side by side while one issue's rounds still follow each other. The lane
is read from the work item alone, so every start of one round reaches the
same lane (the same start sent to two lanes would start two runs). A work
item admitted before lanes were recorded takes one fixed lane by its issue
number. Two live issues that record the same lane (a blocked issue retried
after a newer one took its lane) take turns on it. Heavy checks stay
serialized by `limits.heavyCheckSlots`.

**Admission observation.** For every authorized issue the selector reads the
issue, its comments (not the factory's own), GitHub's blocked-by list and the
governing documents it cites, and from those its prerequisites. Each sentence
is classified by its own words. A denial ("not blocked by #12", "no relation
and no dependency", "requires #14, not #12") declares none and takes the
issues it names with it; only a negated dependency word or issue reference is
a denial, so "not ready because blocked by #12" still blocks. A range ("#12
to #15", "#12–#15") names every issue in it; one wider than 25 issues stops
for a person. An issue named both as related and as a prerequisite is a
prerequisite; any other pair of different statements about one issue is a
conflict a person settles. Issues in a list are read whatever separates them
(",", "and", "&", "/", ";"). Only the order "directive, then issue" is read
("depends on #12"; not "#12 must merge first"), and a semicolon list is a
list only when it holds bare issues ("#12; #13"), so prose is a heuristic and
GitHub's blocked-by relation is the reliable declaration. A prerequisite named
by its pull request is settled when that pull request is merged on the target
branch. A prerequisite outside the scope decides one thing: a closing pull request
merged on the target branch settles it, anything else blocks the issue that
needs it. Its own text and history are not read. A governing file is fetched
once per pass, every GitHub request has a deadline, and a pass stops observing
after three minutes: whatever was not read is reported unavailable and blocks
only the issues that need it.

**Interrupted runs.** The engine never declares a running run dead by its age,
so a run whose engine process died (restart, reboot) would keep its resource
for good. Before each admission pass `.shared/orphans.mjs reap` takes each
factory run whose recorded engine process is provably gone, removes that run's
check containers, and only then abandons it; the sweep settles the work item
and starts its next round. That round follows what the interrupted one had
recorded: a candidate it committed goes to review only; acceptance it defined
and did not commit goes to the implementer; anything earlier runs the round
again. The same rule decides the route after a failed node and after a stop.
Freeze commits the acceptance tests Ezra recorded that no commit holds yet,
whichever run recorded them, and only with exactly the recorded content, so a
round that ended before its first commit (an interruption, a failed step,
rejected hooks) loses nothing. A run whose
containers cannot be confirmed gone is left for the next pass.

**Provider faults.** A round that fails on a provider error (not on its own
code) is not settled by `record`: the work item keeps the run, the lease and a
`core-native-faults/v1` report, and every claim, sweep and ordinary control
refuses it (`native-fault-held`). When the engine classified the fault as
recoverable (`native-recovery`: a transient error, a rate limit, an overload,
or a quota whose reset the provider reported) the next selector pass recovers
it by itself with `issue <n> recover-native`, after any reported reset has
passed; the pass interval is the backoff. The recovered issue waits on the
route its progress calls for, and three such faults in a row without a new
commit block it (`no-progress`). Every other native hold (sign-in, budget,
configuration, unclear effects) waits for an operator to deal with the cause
and run the same command.

**Blocked issues.** When an issue blocks, the next selector pass posts one
comment on the GitHub issue with the reason and the next step, so the owner is
notified where the work is. A blocker is announced until it is a week old.

A round start's dispatch key is `${assignment}:r${round+1}:v${revision}`, where
`revision` is the work item's state revision when the start is fired (admission's
round 1, `record`'s successor and the sweep's re-fire all use it). Archon's
webhook dedup is durable, so any write to the item (a finish, a refused claim's
marker, an operator control) gives the next start a new key, while replaying an
unchanged item's start stays a no-op.

### A delivery round

`claim` takes the issue lease and checks the issue clone out at the recorded
head; `context` assembles the source-linked packet; Samson `scope`s the first
round; Ezra `define`s acceptance; Bezalel `build`s; `freeze` commits through
Core's normal hooks in the credential-free executor and records the post-hook
candidate; Micaiah and Luke review separate exact views; `seal` releases both
reports together; Samson `assess`es; Agabus `adjudicate`s genuine disputes; Ezra
runs `final` acceptance; `publish` runs the hooked pre-push (`ci:preflight`) in
the executor, pushes the verified commit from the hookless mirror and
opens/updates the PR. Feedback rounds read live checks, threads and comments
(`feedback-facts`), Samson `dispose`s each item, and `readiness` takes one live
readiness decision (`PR_READY`, protected expected-head `MERGED`, `WAIT`,
`REPAIR`, `BLOCKED`). `record` always runs: one finish write releases the lease
and fires the successor round.

**Unrecorded commits.** `freeze` commits and then records the commit. A round
stopped between the two, or one whose hooks left files behind after the
commit, leaves the clone ahead of the record. `claim` of the next round that
commits work (`initial`, `repair`, `oracle`) takes those commits back into the
working tree: the branch returns to the recorded commit and every file keeps
its content (`restoredCommit` in the claim ledger), so the round commits them
again through the hooks and the freeze checks. Only a plain line of commits
on top of the recorded one is taken back; a merge or a different history is
left as it is and stops the round (`dirty-workspace`) when the tree is dirty.
A `review` or `feedback` round works on the recorded commit as before.

**Routes.** The route `record` writes picks the next round's stages:

| Route      | Stages                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| `initial`  | scope, define, build, freeze, reviews, assess (and adjudicate), final, publish                                     |
| `oracle`   | Ezra corrects acceptance, then Bezalel builds in the same round; freeze onward as `initial`                        |
| `repair`   | Bezalel builds (Ezra first only if acceptance corrections are pending); freeze onward as `initial`                 |
| `review`   | No scope, define or build: freeze re-freezes the recorded head, then reviews, assess, final and the hooked publish |
| `feedback` | feedback-facts, dispose, readiness                                                                                 |

Repairs travel in `brief.repair` as
`{acceptance[], implementation[], reviewOnly?, source}` (built only by
`deliver/scripts/repair-logic.mjs`). `record` routes acceptance items to
`oracle`, otherwise implementation items to `repair`, otherwise a review-only
repair to `review`. After a node failure, a round whose candidate was already
frozen goes to `review` and one that already had acceptance goes to `repair`
(Interrupted runs, above).
An older `{kind, items}` repair maps `acceptance` and `context-change` to Ezra,
`review-again` to a review-only repair and any other kind to Bezalel.

**Scope.** `after-scope` validates Samson's scope: source and test paths are
disjoint repository-relative globs, and none may reach a protected path
(`.github/**`, `.husky/**`, `scripts/git/**`, `scripts/archon-factory/**`,
`.archon/**`, `.claude/**`, `bunfig.toml`, `.npmrc`, the root `package.json`,
`scripts/verify/ci-*.mjs`) unless `core/scope.allowProtected[<n>]` is `true` or
lists that protected glob (`control.mjs allow-protected`). Otherwise the issue
is BLOCKED `protected-path`; later rounds re-check the recorded scope against
the current grant. When Samson scoped (the initial route or a re-scope),
`after-scope` reserves the brief's `shared_areas` in `core/reservations` with a
conditional write (retried up to four times on a conflict). If another issue
holds any of them it writes nothing, runs no AI stage and records the ledger
entry
`{define: false, build: false, stopped: true, reason, parked: {code: "area-reserved", areas, holders}}`.
`record` then keeps the issue `waiting` on its route with
`parked: {areas, holders, at}`; a parked round counts toward no budget, and the
sweep fires the issue again only when no other issue holds those areas. `record`
releases an issue's reservations on every terminal outcome, and the sweep
releases any whose holder has finished.

**Acceptance-only issues.** A scope may name test paths and no source path when
the issue changes acceptance tests alone (an issue owned by Acceptance); a scope
with no path at all is BLOCKED `scope-paths`. Ezra is then the only writer and
makes the change. Bezalel still runs, with nothing he may edit: he runs the
acceptance tests against the unchanged code and reports. Every repair of such
an issue goes to Ezra, whoever it was addressed to.

**Acceptance.** `after-define` records `acceptance.tests` as every file matching
the brief's test globs that changed on the branch or in the working tree, plus
the tests an earlier acceptance revision recorded (each with its blob id); a
test file inside the implementation paths blocks the round. A tracked test file
Ezra removed (a rename is a removal and a new file) is recorded in
`acceptance.removed`; freeze commits the removal, refuses the round
(`acceptance-tampered`) if the file is back before the commit, and puts back
any test file somebody else deleted. When Ezra corrects
acceptance in a later round without changing any test file and Bezalel has
nothing to repair, the round ends before the build with a review-only repair,
and the next round re-freezes and reviews the recorded head.

**Freeze.** On the `review` route `freeze` skips the build and re-freezes the
recorded head without committing; it refuses (BLOCKED `review-precondition`) a
dirty tree or a HEAD that is not the recorded head. Bezalel's `oracle_requests`
go to Ezra as acceptance repair items: finished work is committed and recorded
first, a BLOCKED build keeps its uncommitted work and gets a finish item for
Bezalel, and the next round takes the `oracle` route. The freeze ledger keeps
the build's `oracle_requests`, `gaps` and `checks_run`. The freeze node may run
for 130 minutes (clean installs before hooks and after commit, two hooked
commits and both views).

**Review and final acceptance.** Agabus sees disputed findings only as neutral
claims `D1..Dn` (ordered by content, reviewer names removed); the map from `D`
ids back to findings stays in the trusted round ledger (`assess-plan`), and
`after-adjudicate` translates the rulings through it. Ezra's final result gives
every criterion an `owner`: an `acceptance` FAIL goes back to Ezra (the `oracle`
route); an `implementation` FAIL, or a missing or unknown owner, goes to
Bezalel. On the `review` route a context change does not stop the round: it is
added to `brief.repair` for Ezra, the head is still reviewed, and `after-assess`
returns the candidate to Ezra instead of final acceptance. `publish` refuses
unless both first-pass reviews are CLEAR and Ezra's final is a DONE PASS, all
bound to the frozen candidate and the current acceptance revision, with no
acceptance correction pending. The PR body calls a review clear only when
the reviewer sealed it clear; findings that were assessed as not material or
rejected are named as findings not upheld. The PR body's hook line is built only from
freeze's pre-commit receipts and publication's pre-push proof. When a tool in
the pre-push hook is killed by a signal (the runner's own "terminated by signal
SIG..." line), the same hook runs once more on the same commit before its
failure counts; the ledger entry `pre-push.crashed` keeps the signal and stage.

**Readiness.** Readiness integrates the base by an ordinary merge only when that
is the sole repair (strict protection is behind, or the PR conflicts) and no
owner has repair work pending; an integration that changed the candidate's own
diff goes to the `review` route, one that left it identical carries the reviews
forward. A merge that conflicts BLOCKs the issue with `base-conflict` and the
files; when an operator pushes a merge commit that contains the conflicted
candidate and retries the issue, readiness adopts it as the candidate and sends
it through the `review` route before any merge (runbook, "Base conflict"). A
round that resolves review threads answers `WAIT` and decides next round on
fresh mergeability. A thread someone unresolves after the factory resolved it
goes back to Samson, flagged `reopened`. A `MERGED` verdict carries `merged_by`: `factory` when the
factory requested the merge of that exact head (`pr.mergeRequest`), otherwise
`external`; `record` keeps an external merge as a fact even under a `PR_READY`
assignment.

**After `PR_READY`.** The factory follows one thing on a pull request it
reported ready: whether somebody merged it. The intake pass asks GitHub once
per ready issue (for 30 days after it became ready) and records a merge into
the target branch as `MERGED`, `external`, with who merged and when. It starts
no run, needs no policy match and is refused for a held issue. Later comments,
checks and a moving base are not followed: `issue <n> reopen` runs the
feedback stage again. Once an issue is `MERGED` (by the factory or not) the
pass removes every `node_modules` tree of its clone and its install marker;
the clone, its history and files a round set aside stay.

**Budgets.** A round that continues to `feedback` counts toward
`limits.maxFeedbackRounds` (12; beyond it the issue is BLOCKED
`feedback-limit`); any other continuing round counts toward `limits.maxRounds`
(8; BLOCKED `round-limit` when reached). The same problem repeating without a new
head more than `limits.noProgressRepeats` (2) times in a row is BLOCKED
`no-progress`. Parked rounds count toward none of these; `retry` and `reopen`
reset them.

Every AI output is validated by the trusted script after it; branching uses
those scripts' scalar outputs. Role prompts are generated from
`.shared/roles/*.md` by `scripts/archon-factory/build-pack.mjs` (provenance in
`.shared/roles/manifest.json`).

## Role boundaries

Runs execute in the control folder, so candidate `.archon` or `.claude` files
never shadow installed policy. Roles have no host shell. The PreToolUse guard
(`.shared/guard.mjs` + `policy.mjs`) allows each node only its role's tools and
the read/write roots recorded for that node in
`/srv/core-factory/runs/<run>/context.json`; it resolves symlinks and denies Git
metadata. Commands run only through the `core-check` MCP tool, which executes in
the qualified Docker executor (network none, read-only rootfs, UID 1000, one
writable candidate bind, confirmed cleanup) against the calling role's own
workspace. A read-only role's view has the candidate's dependencies mounted
read-only, with a private scratch mount over the cache directories tools write
there (`node_modules/.vite-temp`, `.vite`, `.cache`), so a test that starts its
own child test process can run; nothing written there leaves the container.
Read-only roles are told that the repository-wide gates are the pre-push
gate's job and that a failure caused only by their container is not a failure
of the candidate. For the writers (Ezra, Bezalel) that workspace is the issue clone
with its `.git` and the mirror's objects mounted read-only, so a check cannot
commit, move refs or plant Git config. Installs, hooked commits and the hooked
pre-push use the same executor with registry network but no credentials.
Executor containers started for a run are labelled `core.archon.run=<runId>` and
`core.archon.issue=<n>`.

**Package cache.** Bun will not install, even offline, unless it can rename into
its cache directory, and Core's own unit tests run `bun install --offline`, so
steps that run candidate code need a populated cache they can write but cannot
share. `/srv/core-factory/cache/bun-seed/<lockfile digest>/` is a seed written
only by the fixed `bun install --frozen-lockfile --ignore-scripts` (no candidate
code runs; registry bytes are verified against that lockfile) and completed by
the marker `<digest>.json` beside it, which no container mounts. Every other
step (the scripted install, the pre-push hook) mounts the seed read-only and uses
a private cache on the container's tmpfs made of links into it, so nothing a
step writes outlives its container or reaches another issue. A lockfile without
a completed seed gets an empty private cache. Seeds unused for a week beyond the
newest four are pruned.

## State documents (project `_folder/control`)

| Document                                                         | Writer                      | Shape                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/factory`                                                   | operators                   | `{v, intake: open\|paused, mode: run\|drain\|stop, mergeHold, reason, updatedAt, updatedBy, requests[]}`                                                                                                                                                                                                                                                                                                                                                                                  |
| `core/scope`                                                     | operators                   | `{v, issues[], endState: PR_READY\|MERGED, endStates{issue: endState}, owner, approvedBy, approvedAt, note, priorities{}, allowProtected{issue: true\|[protected glob]}, requests[]}`                                                                                                                                                                                                                                                                                                     |
| `core/issues/<n>`                                                | selector, rounds, operators | Work item: `assignment` (owner, profile, scope and policy revisions, end state), `control` (run/hold/stop) and `controlReason`, `status` (pending/active/waiting/PR_READY/MERGED/BLOCKED/stopped), `route`, `round`, `run`, `branch`/`base`/`head`, `acceptance`, `reviews`, `final`, `pr`, `brief` (with `repair`), `blocker`, `workRounds`/`feedbackRounds`/`repeats`, `parked`, `areas`, `lastRefusal`, `history[]` (last 12), `requests[]` (last 20); the lease is the live round run |
| `core/issues/<n>/feedback`                                       | rounds                      | `{v, dispositions{itemId: {action, reason, head, kind, lastComment?, updatedAt?, status? (fix-pending\|fixed), fixedIn?, resolvedAt?, at, run}}}`                                                                                                                                                                                                                                                                                                                                         |
| `core/reservations`                                              | rounds, selector sweep      | `{v, areas{area: issue}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `core/selection`                                                 | selector                    | `{v, decisions[]}` (last 20, with sources and reasons)                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `core/merge-lane`                                                | readiness                   | Leased while a protected merge is in progress                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `core/chat/<conversation>`                                       | answer runs                 | `{v, messages[]}` (operator and Samson turns; proposed operations)                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `core/analysis`, `core/analysis/reports/<run>`, `core/attention` | analyze runs                | Report index, reports, open material findings for Samson                                                                                                                                                                                                                                                                                                                                                                                                                                  |

A disposition is current only for the item as Samson judged it: a review
thread's for its last comment someone other than the factory wrote
(`lastComment`), a person's top-level comment's for its `updatedAt`. A newer
reply or an edit needs a new disposition.

Besides `number`, `url`, `nodeId`, `head` and `publishedAt`, a work item's `pr`
may carry `pending {head, base, from, carried, at}` (a base integration pushed
but not yet recorded), `conflict {head, base, files, at}` (a conflicted base
merge), `mergeRequest {head, at, run}` (the factory asked GitHub to merge that
head) and, once merged, `mergedAt`, `mergeCommit`, `mergedBy`, `onTarget` and
`issueClosed`.

Read with `archon state get|list --project _folder/control` (env
`ARCHON_HOME=/srv/core-factory/archon`, `ARCHON_USER_ID=core-factory`).

## Operator controls (`.shared/control.mjs`)

One command surface for the Console, runbook and shell. Every mutation needs
`--request <id>` (8-128 letters, digits, `.`, `_`, `:` or `-`; idempotent) and
reports the observed result as JSON. Exit code 0 means ok, 2 refused or not
confirmed, 1 an error.

```
node control.mjs status
node control.mjs factory pause-intake|resume-intake|drain|stop|resume|hold-merge|release-merge --request <id> --by <who> [--reason <text>]
node control.mjs issue <n> hold|release|stop|retry|reopen|reconcile|adopt-policy|recover-native --request <id> --by <who> [--reason <text>]
node control.mjs scope --issues 12,13 --end-state PR_READY [--end-states 12=MERGED] --owner conrad --request <id> --by <who> [--note <text>]
node control.mjs prioritize <n> <0-100> --request <id> --by <who>
node control.mjs allow-protected <n> <all|none|glob[,glob...]> --request <id> --by <who>
node control.mjs cancel-run <runId> --request <id> --by <who>     # server API; reports observed status
node control.mjs ask --conversation <id> --request <id> --question <text>
node control.mjs analyze --scope factory|issue:<n> [--trigger operator] --request <id>
```

Hold, stop and drain take effect at the next round boundary (`claim` and
`context` re-read them); they never abandon a run or discard work. A stopped
issue stays stopped until an operator reopens it.

- `retry` (a BLOCKED issue under control `run`), `reopen` (PR_READY or stopped,
  not held; clears a stop) and `release` work only while the installed release
  is the one the assignment is bound to; `retry` and `reopen` also reset the
  round budgets. After a release change they refuse
  (`policy-transition-required`) until `issue <n> adopt-policy` moves the
  assignment, which also drops the reviews earned under the old release.
- `reconcile` settles an item that a cancelled or unrecorded run left `active`:
  once the engine reports that run completed or cancelled (or its lease ended),
  the item waits again, on the route its recorded progress calls for
  (Interrupted runs, above). It is refused while the lease is
  live. On a pending or waiting item it only records the request, which moves
  the item's revision and so re-arms its dispatch key. The intake sweep
  reconciles ended runs by itself as well.
- `recover-native` is the way out of a native-fault hold (below). It refuses
  unless every one of these holds, and changes nothing when it refuses: the
  installed release and the native identity are the assignment's; the issue
  branch on GitHub is absent or at a commit the work item recorded, and no
  merge the factory requested is pending (`effects-unreconciled`); the held
  run's check containers are confirmed gone (`containers-unconfirmed`); the
  engine ends the failed run (`run-not-ended`) and then reports it cancelled or
  completed (`run-not-terminal`; a run that still executes is never ended by
  this control). The issue then waits on the route its recorded progress calls
  for and the next pass starts that round.
- `allow-protected` writes `core/scope.allowProtected[<n>]`: `all` stores `true`,
  `none` removes the grant, and a comma list must name exact protected globs
  from the Scope paragraph above (anything else refuses the request). Only
  in-scope issues can be granted, and a later `scope` approval keeps grants only
  for issues still in scope.
- `cancel-run` first holds the issue whose round the run is (`issue <n> release`
  resumes it; a cancelled round is never requeued by itself), asks the engine to
  cancel, then removes the run's labelled executor containers through
  `executor.mjs` `removeLabeledContainers` (a credential-free Docker config over
  the local unix socket) and lists them again. It reports
  `{ok, status, detail, observed, containers: {ok, found, remaining, removed, error?}, held?}`
  and is ok only when the run is completed or cancelled and no container
  remains.
  If the hold cannot be saved, or a repeated request refers to a hold that was
  since released, it refuses before cancelling the run or removing containers.
  Re-read the issue; use a new request id for a new cancellation after release.
