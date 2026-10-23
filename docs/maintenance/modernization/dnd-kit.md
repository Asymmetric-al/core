# Current dnd-kit API checkpoint

Tracking: [AL-1965](https://github.com/Asymmetric-al/core/issues/1965) and
[PR #2195](https://github.com/Asymmetric-al/core/pull/2195).
The [successor review-feedback record](dnd-kit-review-feedback.json) routes the
current candidate and binds its source, evidence and remaining gates. Task
notification and filtered-ordering fixes were committed through normal hooks as
`906d5f4b1068187b36543fb559df5aff4dc6b7d6`, then normally merged with develop
`cc568c92c1cd283d82a4ef9c6d4be7dabe4efee4` at source checkpoint
`7b79de8e62d9abbfe047ddcd48dc449ee95df85f`. Current-lock installation and both
strict quality guards pass locally. Final successor documentation/inventory/quality
commit, full pre-push, current-head CI/review, all three hosted previews and merge
remain open. Production execution is outside this checkpoint.

The original [qualification](dnd-kit-qualification.json), SHA256
`27b47b8533522f2a8e729ed6acd4d9a9a442f56a85775198bcb95f4d80484c5b`, remains
byte-exact historical evidence with its 19 dated receipts and original source
bindings. Its earlier open pre-push state was later satisfied for published
parent `de87149ad569e58def4d5de1708c4218e77e8767`; that completed parent gate
preceded the later fixes and does not qualify this successor. UI PR #2190 is
merged and integrated into this lineage.
A dated native GitHub readback also confirms all four required parent checks and
label-gated hosted QA run `39840790842` succeeded at `de87149`; the successor
record preserves that parent evidence without transferring it to later source.

## Replacement and ownership

The official [legacy installation guide](https://dndkit.com/legacy/introduction/installation/)
recommends the new API. Core's only first-party consumer, the missionary task
board, follows the [current migration guide](https://dndkit.com/react/guides/migration/)
and coordinated `@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/helpers` and
`@dnd-kit/abstract` 0.5.1 releases. [Release metadata](dnd-kit-releases.json)
retains upstream integrity, constraints and repository ownership. The successor
record adds a fresh official npm/GitHub observation: all seven consumed current
Dnd packages still report latest 0.5.1, and selected integrity/dependency/peer
constraints match. Seven current Dnd packages resolve to one physical runtime
each; the reviewed peer-expanded closure contains twelve packages.

Four unused admin declarations and three missionary legacy declarations were
removed. No first-party legacy import remains. No override or dependency patch
is introduced. Exact `base-maia`, Base UI controls, shared semantic tokens,
public component callbacks and the existing four visible task statuses remain.

## Preserved behavior and final failure ownership

`DragDropProvider`, pointer/keyboard sensors, grouped/indexed sortable entries,
explicit column droppables and the public move helper replace legacy contexts,
attributes and listeners. Empty columns are real drop targets. React owns the
controlled preview lists; the upstream optimistic DOM-reparenting plugin is
excluded from sortable defaults because it conflicts with that ownership.
Other default plugins, including keyboard/accessibility and auto-scroll, remain.

Only a confirmed, changed final destination submits the existing
`onMoveTask(taskId, status, index)` callback. Cancellation, missing targets and
unchanged positions submit no request. The actual `useTasks` hook owns optimistic
persistence, rollback, logging and the false result through the same-origin PATCH
endpoint with only `status`/`sort_key` fields. Its redundant move-failure toast is
removed; other mutation toasts remain. Server role, profile and tenant boundaries
are unchanged.

The board owns one failure notification through Core's existing shared Toaster,
which remains mounted outside the board/list view. A stable public Sonner-generated
identifier is reused for that board's errors; retry dismisses only its own defined
prior identifier. Both false and thrown results show the complete existing
“Task move failed. Please try again.” copy once, including when List view has
already unmounted the board. Unrelated notifications remain. The intermediate
shared destructive Alert implementation is historical and has been superseded
because its local message disappeared on unmount. Keyboard focus restores after
React commits restored order while later intentional user focus is preserved.

Core's shared motion boundary supplies reduced-motion preference. Sortable/drop
feedback uses existing duration/easing tokens for pointer movement and instant
keyboard feedback. Public Feedback configuration disables upstream keyboard
translation; Core's shared 0.01 ms reduced-motion baseline remains authoritative.
The moving overlay is inert and has no duplicate sortable registration.

The drag manager remains suspended until the supplied persistence Promise settles.
A Promise that never settles intentionally retains pending admission. No client
deadline, transport abort, automatic replay or new operation protocol is added.
The server update/read path provides no terminal cancellation acknowledgement:
aborting a browser fetch and reading old state can race a later commit. Existing
pending-admission tests and settled false/throw-after-unmount tests qualify these
specific boundaries; they do not establish a bounded network timeout or server
cancellation guarantee.

## Filtered ordering and persistence

The page controller translates a displayed board position to the full committed
destination column through the pure shared `task-move-index` helper and its
explicit library export. Both callback signatures and PATCH fields remain
unchanged. The helper excludes the moved task, sorts the full destination by
`sort_key`, then inserts before the next shown sibling. Without a next shown
sibling it inserts immediately after the last shown sibling; without any shown
destination sibling it appends to the full destination. Hidden siblings retain
their records and relative order. Inputs are not mutated, and stale/invalid
positions are rejected before persistence.

For A(call,100), hidden B(email,200), C(call,300), the displayed column is [A,C].
Moving A after C previously sent visible index 1 and persisted rank 250 before C.
The controller now sends full-column index 2 and the unchanged hook persists
rank 400 after C. Actual Search and Refine type/priority controls are tested
through the page/controller callback with a board stub; separate real-hook HTTP
tests verify exact saved ranks, including hidden-first/hidden-last, cross-column,
empty, no-shown-sibling and unfiltered cases across all three filter classes.

## Evidence and current qualification

The successor JSON contains exact hashes, times, commands, logs and independent
reviews. Each result remains bound to its tested source and lock; later rows do
not relabel earlier proofs.

| Observation                                                    | Recorded result                                                                 | Boundary                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Original qualification and UI-base work                        | 19 dated receipts, original board/hash and hook bridge retained                 | Historical source; original record stays byte-exact                                            |
| Published parent `de87149` normal pre-push                     | 923 unit files, 7,749 cases, 15 typechecks and three builds passed              | Completed parent gate before review-feedback fixes                                             |
| Intermediate shared Alert browser run                          | 299 passed, five existing skips                                                 | Historical board fixture; no HTTP-hook or pending-unmount proof                                |
| Hook toast deduplication units                                 | 17 passed across four files after meaningful RED                                | Historical test bytes; hook behavior retained, later units expanded                            |
| Final global-Toaster browser run                               | 303 passed, five existing skips, zero unexpected/flaky, four projects           | Exact final board/fixture/spec bytes; old lock; no actual provider writes                      |
| Final mapper/controller/HTTP-hook units                        | 63 passed across six files after rank-250 RED                                   | Exact current source bytes under tested old lock; actual page controls plus separate HTTP seam |
| Merged-source frozen install                                   | Passed with lock `7935bcc9…` unchanged and opaque input link identity preserved | Current develop integration; no environment values read/copied                                 |
| Current merged-lock strict Doctor/Shadscan                     | Both passed; details below                                                      | Current source/quality snapshot, independent of final publication                              |
| Final successor pre-push, remote CI/reviews/previews and merge | Open                                                                            | New combined published head and final readback still required                                  |

The full offline browser matrix imports the real board, shared controls and
actual shared Toaster. It covers pointer/touch and keyboard movement, empty
columns, cancellation/no-op, activation/outside drop, focus, retry, pending
admission, accessibility and reduced-motion projects. The new lifecycle case
starts a real drag, waits for a pending save, switches to List/unmounts the board,
then resolves false or throws. It proves one visible live-region failure,
preserved later focus, no page/console errors or stuck overlay, and a fresh
successful drag after remount. Existing cases also prove unrelated toasts survive
owned dismissal and repeated failure does not duplicate feedback. These are
Chromium input and DOM/live-region proofs, not physical-device performance,
assistive-technology speech or hosted-provider qualification.

The final 63-unit run retains denial/network rollback and no-duplicate-hook-toast
assertions plus fetch ordering/lifecycle, controls and deletion/focus recovery.
The actual-controller cases preserve raw true/false results. Product/helper lint
and scoped formatting pass. Explicit ad-hoc lint of the dedicated actual-page
test hits the existing cross-app test-import restriction; that unsuccessful
receipt is retained. No suppression, alias workaround or lint policy change was
added. Normal repository gates remain required.

The old ref-incompatible attribute-spread Doctor exception was removed in the
original migration. Later source-only requalification preserves existing reasons:
hook exception 153 changes only its whole-file hash after toast removal; genuine
current diagnostics rebind five existing location/id/source-file leaves for page
exception 148. Its capture block/handler, context hash, support files and focus
ownership are unchanged. After normal develop integration, exactly 21 existing
Doctor supporting lock hashes were refreshed. Shadscan retains all 118 existing
classifications and every score floor; only existing source/manifest proof hashes
were updated. No new exception, suppression, reclassification or floor relaxation
was introduced.

Fresh current-base strict Doctor passes all eight targets with zero actionable
findings, 293 exact exceptions and no skipped checks. Fresh Shadscan passes with
raw score 48, admin 43 (floor 43), donor 61 (floor 59) and missionary 47 (floor 47).
The record binds current Doctor `44900787…`, Shadscan `5921a27b…`, merged lock and
the separate exact execution receipts. Earlier strict scans remain dated history.

The bounded browser/unit harnesses use an OS-only environment and exact
`bun run --no-env-file` placement. A harmless isolated public-sentinel experiment
proves both Node script children omit `.env`/`.env.local` sentinels under that
placement while explicit `--env-file` positive controls load them. Plain
unflagged package run was not a positive control. This establishes the tested
run boundary, not Bun install parsing. Browser launch independently supplies an
OS-only environment and pinned sandboxed Chromium. No real environment values
were inspected/copied; the frozen install has separate opaque-link evidence.

## Required upstream compatibility and remaining release work

The original compatibility audit found official Payload Next/UI beta.3 requiring
legacy Dnd packages internally; observed beta.4 retained those constraints.
They remain upstream-owned compatibility candidates with explicit Core CMS
ownership and release/import/constraint/advisory recheck conditions. The campaign
must qualify a coherent current Payload cohort before the combined freeze;
this checkpoint grants no indefinite version hold.

The reviewed Dnd closure matched official metadata/integrity, with no missing or
incompatible physical dependency/peer edge and no introduced advisory pair.
That graph receipt remains tied to its original lock. Whole-Core advisories,
including Braces 3.0.3, remain open; no unreachability exception or repository-wide
security closure is granted here. Root recorded the two new current-develop
`pg`/`@types/pg` identities as open inventory work; their 8.20.0-to-8.23.1 upgrade
is separate and is not claimed complete by this Dnd checkpoint.

Final successor commit/full pre-push, complete current-head review reconciliation,
required CI, all three exact-head hosted previews/QA, approved-head merge and
post-merge workflows remain open. The campaign also owns final SBOM/manual
advisory reconciliation and the immutable production release package. Production
migration execution remains excluded.
