# D7 current implementation and database review

Research-only evidence, 2026-10-10, source HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. The user selected closing the
current cultivation work, preserving its history, when there is no remaining
development follow-up and no useful review date. This review does not decide
whether later deliberate work reopens the same enrollment or creates a linked
successor. No application code, migration, hosted database or live message was
changed. No deployed D7 behavior is claimed.

**Recommendation:** retain A. A source-owned closure with truthful history is
feasible in the existing PostgreSQL/Supabase architecture. It should leave the
current cultivation workload without requiring a fabricated task/date. The
inspected donor lifecycle, generic task completion/deletion and contribution
outcome paths do not already implement that command. Reuse their appropriate
infrastructure and correct their relevant limitations before D7 activation;
do not make their current behaviors the product meaning of “close.”

Root/API/database/Supabase/app instructions, the repository data-access rule,
and the previously loaded Supabase/Postgres skills apply. Multi-record business
state stays in the qualified `packages/api` server-command boundary. This is
decision research, not a formal implementation specification or a claim that
current neighboring features are fully qualified.

## Current source evidence

Bounded case-insensitive searches for `cultivation`, `donor.?development`,
`development.?enrollment`, `pause.?review` and `enrollment` in
`packages/api/src`, `packages/database`, `supabase/migrations`, the staff CRM
surface and missionary app found no matching TypeScript/TSX/SQL implementation.
The selected P27 cultivation lifecycle/source command is therefore **not found
in those inspected paths**. This is not a query of production, a claim about
all possible synonyms, or proof of deployed migrations.

The following exact paths are repository-relative.

| Source                                                                                                                         | Observed behavior                                                                                                                                                                                        | D7 significance and limit                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/api/src/admin/crm/model.ts:41–69`                                                                                    | CRM grid `lifecycleStatus` comes directly from `donor.status`; `lastTouchAt` comes from `donor.updated_at`; `nextTaskSummary` is null.                                                                   | None is a current cultivation closure field or proof of no work. Mutating donor metadata to implement D7 could also appear as a new “touch” in this legacy projection. The source does not prove a real relationship interaction occurred.                                   |
| `packages/api/src/admin/crm/service.ts:23–30,46–58,164–199`; `query.ts:151–166`                                                | CRM filtering/sorting uses donor status when requested; normal list selection is by tenant and donor fields. No cultivation active/closed predicate is present.                                          | The default CRM roster is not the current cultivation workload. D7 should not remove a Party from the CRM or mutate its lifecycle to remove work from a portfolio.                                                                                                           |
| `apps/admin/app/(app)/crm/types.ts:31–64`                                                                                      | Detail-to-grid model also uses donor status, donor update timestamp, null next task and initially empty activity array.                                                                                  | A drawer snapshot is not an authoritative closure receipt or complete obligation check.                                                                                                                                                                                      |
| `apps/admin/app/(app)/crm/page-client.tsx:68–70`; `packages/api/src/admin/crm/index.ts:22–40`                                  | Bulk archive displays “Bulk archive is not available yet.” The inspected CRM list API exports GET.                                                                                                       | The archive menu is not a source-owned close command. `crm.record.delete` in the action type union (`packages/api/src/crm/types/index.ts:3–17`) is also not evidence of such implementation.                                                                                 |
| `packages/api/src/missionary-portal/donor.ts:25–54,73–100`                                                                     | Donor editing accepts `Active`, `Lapsed`, `New`, `At Risk` and writes the donor record's status/updated timestamp.                                                                                       | These existing donor labels are not exact Ministry Assignment cultivation states. “At Risk” is not an acceptable inferred outcome of D7.                                                                                                                                     |
| `packages/api/src/missionary-portal/model.ts:388–397`                                                                          | `activeDonorCount` counts donor relationships whose status is not the exact string `inactive`.                                                                                                           | This support metric is not active enrollment count, nor should closure silently change it. Current mixed label conventions are another reason not to reuse it for D7. No production metric error is measured here.                                                           |
| `packages/api/src/missionary-portal/task.ts:25–58,81–97`                                                                       | Generic task PATCH accepts status and rewrites `completed_at` to now for completed, otherwise null; update filters task id/profile, without an expected source revision.                                 | This is legacy profile-owned task editing, not closure of a purpose-scoped source journey. Clearing completion on reopening would not preserve source closure history if copied verbatim.                                                                                    |
| Same file `:102–123`; `packages/lib/hooks/use-tasks.ts:441–463`                                                                | DELETE physically deletes the profile's task and returns success if the query reports no error; hook removes it from local state.                                                                        | Deletion is not D7's “keep history.” Success does not itself assert that one row existed/changed or supply an accepted source closure receipt. This is existing task behavior, not an observed D7 deletion bug.                                                              |
| `packages/lib/hooks/use-tasks.ts:466–538`                                                                                      | Complete/reopen PATCH task status; client writes its own completion timestamp or clears it.                                                                                                              | A generic task toggle does not decide cultivation state, reopen a journey or select later enrollment identity.                                                                                                                                                               |
| `supabase/migrations/20260526193000_mission_control_tasks.sql:14–36,39–75`                                                     | Shared tasks have completed/dismissed/suppressed fields. Links, comments, reminder rows and task events reference task with `ON DELETE CASCADE`.                                                         | Physically deleting this task also deletes those related rows under the declared constraints. Preserve source history and intentionally govern projection retention; do not use task deletion as a closure/history implementation. No deletion was executed.                 |
| `packages/database/collections/admin-workspace.ts:766,805–837`; `apps/admin/app/(app)/tasks/tasks-content.tsx:170–179,190–207` | Staff task state is seeded, mutable module memory. Generic completion/deletion acts on that collection.                                                                                                  | This is not persistent source history or a qualified server transition. D6 already records the full reminder/runtime limitations.                                                                                                                                            |
| `packages/api/src/admin/mission-control-tasks/store.ts:130–142`                                                                | Contribution Needs Attention reads only attention rows with `status = open`.                                                                                                                             | It is a source-specific active projection, not an archive/history endpoint and not evidence that shared task completion itself resolves its attention row.                                                                                                                   |
| `packages/api/src/missionary-portal/service.ts:194–221,252–275`                                                                | Dashboard snapshot fetches up to 100 tasks by profile; standalone task list filters profile and optional donor, without a cultivation source predicate.                                                  | Neither query defines current P27 workload. A bounded dashboard list cannot prove the absence of another outstanding obligation.                                                                                                                                             |
| `packages/lib/hooks/use-tasks.ts:202–260,262–289`                                                                              | Client task filters/stats inspect loaded task status and due dates; completed/deferred are omitted from due/overdue counts.                                                                              | Hiding an item from a local count is not a source transition. Closure eligibility cannot depend on this UI's loaded subset, chosen filter or task-label vocabulary.                                                                                                          |
| `packages/api/src/admin/crm/detail/service.ts:11,243–256,279–293,448–462,475–517`                                              | Detail uses the first 100 gifts with explicit gift truncation, up to 50 donor activities and 50 pledges, and composes a timeline.                                                                        | Useful CRM history display, not a complete cultivation ledger or proof that all obligations are settled. The explicit gift-history truncation must not become fabricated completeness for another history type.                                                              |
| `packages/database/hooks/admin-crm-infinite.ts:168–208`; `admin-crm-detail.ts:85–120`                                          | Grid has local loaded-row collection and cached pages; detail cache uses record id. Both disable refetch-on-focus and have 30-second stale time. Note creation explicitly invalidates grid/detail/notes. | D7 needs its own authoritative post-command projection/invalidation behavior. Existing note invalidation is useful precedent, not proof every cultivation list/count/history or changed authorization is updated. No cross-user cache leak is alleged from these keys alone. |

### Existing source outcome patterns are useful but not exact D7 behavior

`packages/api/src/admin/contribution-operations/approval-notifications.ts:443–538`
checks that the correction source is pending, creates a shared task, conditionally
links it if still pending with no task, and dismisses an unlinked concurrent
loser. The dismissal at `:363–379` records a reason. These are useful evidence
of source applicability and truthful loser cleanup. They are separate requests,
not an atomic source/closure/obligation transaction, and their correction/queue
meaning is not P27 policy.

The exported `recordCorrectionApprovalOutcome` at `:600–618` unconditionally
sets the selected shared task's `status`, `completed_at` and `updated_at`, scoped
by tenant/id. The comment at `:595–598` calls repeated completion a no-op, but
the actual query has no already-completed guard and chooses a fresh timestamp.
The route wires this helper at `contribution-operations/route.ts:294`; the same
already-decided outcome calls it again at
`correction-requests.ts:313–330`. Thus repeated source outcome projection can
rewrite that task completion timestamp. This is a concrete neighboring-source
behavior and a copying warning, not a D7 vulnerability, measured production
incident or statement that the underlying financial decision is duplicated.
Its outcome notifications have separate dedupe (`approval-notifications.ts:648–683`).

Likewise, CRM notes insert a record and then separately append the command log
(`packages/api/src/admin/crm/notes/service.ts:224–278`). The logger itself is a
single insert (`packages/api/src/crm/commands/log.ts:69–104`). Having a function
named “command log” does not establish source state and accepted closure history
commit atomically. Neither local retry cleanup nor a later log insert substitutes
for a durable source receipt.

## Material concerns and exact safeguards

Severity describes impact if the implementation mistake occurs. Likelihood is
qualitative and conditional, not an observed incident rate. Each concern
supports retaining A with a bounded implementation requirement; none requires
an undated holding state or a new workflow platform.

### I1 — Closing the donor, ministry or relationship instead of this work

**Severity:** high. **Likelihood:** high if existing donor-status/archive UI is
reused. **Evidence:** CRM model/status filtering, missionary donor edit and
placeholder archive above. **Decision effect:** retain A; scope the command.

**Proposed exact safeguard:** “Close only the selected current cultivation
work for the exact supporter Party, Ministry Assignment and agreed purpose.
Preserve the Party, ministry relationship, independent purposes, gifts,
commitments, stewardship obligations, communications restrictions and access
grants. Closure supplies no automatic financial, outbound or permission effect.”

**Permanent acceptance proof:** one Party supports two ministries and has a
separate legitimate purpose. Close one selected effort; only its current
cultivation workload ends. Assert unchanged donor/Party status, gifts,
recurring commitments, contact restrictions and unrelated source/task state.
The historical record identifies the exact closed scope without needing an
invented Party legal-entity column. Updating a gift or donor profile later
does not reopen this work.

### I2 — Deletion or overwritten timestamps destroy the promised history

**Severity:** high. **Likelihood:** high if task DELETE/reopen/complete is copied.
**Evidence:** missionary DELETE/PATCH, shared task cascades and contribution
outcome replay above. **Decision effect:** retain A; preserve accepted facts.

**Proposed exact safeguard:** “Keep an accepted source closure record with
who/when/which work and the applicable outcome. Replaying the same accepted
command returns its existing result without changing the historical actor,
effective time or accepted meaning. Later corrections and renewed work retain
the prior facts; they do not silently overwrite or delete them.”

This does not mandate indefinite storage of every note or message, broad
historical access, an immutable copy of private content, or a new reason catalog.
Retention, redaction and access continue under their owners. Record enough
closure provenance to preserve business truth within that policy; the source
event is a lifecycle fact, not a fabricated supporter call/email/meeting or
evidence of successful fundraising.

**Permanent acceptance proof:** close, retry at a later clock time, lose/recover
the response, project/reproject shared work, and exercise allowed correction or
later resumption once its meaning is decided. The accepted closure remains
identifiable; no unrelated history is erased and no retry changes the original
receipt. Direct generic task DELETE/Complete/Reopen cannot masquerade as that
source command. Retention/permission tests independently prove which historical
content remains available.

### I3 — An incomplete screen is treated as proof that no work remains

**Severity:** high. **Likelihood:** medium/high if closure checks inspect a
drawer, dashboard count or current filter. **Evidence:** bounded task/dashboard
and history readers, null `nextTaskSummary`, client-only task counts above.
**Decision effect:** retain A only with authoritative current obligation checks.

**Proposed exact safeguard:** “Evaluate the closure premise from authoritative
current source obligations, not loaded UI rows or a missing next-task label.
Unresolved work that still belongs to this cultivation effort must receive an
explicit permitted disposition before closure is accepted. Independent work
can continue under its own source and accountable owner; closing cultivation
does not mark it completed, silently detach it or move it to an unowned queue.”

The implementation should prevent silent loss and explain the permitted next
action. It must not invent authority to cancel promises or force every unrelated
task to finish before staff can close this work. A useful real review date still
uses the accepted D6 path; a made-up next date is not required to close.

**Permanent acceptance proof:** an outstanding obligation outside the first
page; filtered-out work; no due date; an independent ongoing promise; a linked
task that is not the relevant obligation; and a hidden obligation whose
existence cannot be disclosed in detail. The command uses truthful current
source facts and a role-safe response, without pretending the user can dispose
of work they cannot manage. Changing page size/sort/filter cannot change
closure eligibility.

### I4 — Close races with a new task, date change or another source command

**Severity:** high. **Likelihood:** medium/high in normal multi-user execution.
**Evidence:** task creation is separate task/link/event requests
(`mission-control-tasks/service.ts:62–77`, `store.ts:75–124`); generic task update
is unversioned; no D7 source command is found. **Decision effect:** retain A;
establish a shared source mutation protocol before activation.

**Proposed exact safeguard:** “Closure, new cultivation-owned work and review
changes serialize against the same current source applicability/revision. An
accepted close commits the source disposition, durable history and obligations
to end obsolete projections together, or none. A stale writer cannot create
new current cultivation work after closure. Conflicting human commands receive
the truthful current result and do not silently overwrite one another.”

A transaction around “read tasks, then close” alone does not stop another
transaction inserting a relevant task unless both writers participate in the
source locking/conditional protocol (or another proved concurrency mechanism).
Ordinary foreign keys prove referenced identity exists; they do not prove its
current business state permits new work. A parent-row lock used only by close
is insufficient as a general application protocol. Every relevant writer,
including imports, repair tools, retries and optional Studio actions, must obey
the same fence. Choose exact SQL/constraints after lifecycle/source contracts
are settled; do not freeze an active-only partial index or a new “closed” enum
from this review.

The atomic boundary can preserve a durable projection/effect obligation rather
than synchronously rewrite every UI cache. Source-authorized readers and actions
must nevertheless stop presenting obsolete work as actionable; asynchronous
repair must be recoverable and honest. External sends are outside the database
transaction and cannot be rolled back by undoing a task row.

**Permanent acceptance proof:** deterministic two-connection schedules for
close/new-work, close/reschedule, close/close and close/relevant-obligation
change, in both commit orders. Assert either new work wins and closure is
re-evaluated/rejected, or closure wins and stale work is rejected. No committed
state contains accepted closure plus newly admitted current cultivation work
from an obsolete head. Inject each persistence failure and recover to one
truthful source result. Retry the entire transaction after a serialization
failure; do not replay only its last write.

### I5 — A stale reminder or replay resurrects closed work

**Severity:** high. **Likelihood:** medium/high during retries or delayed jobs.
**Evidence:** D6 [implementation evidence](../d6-evidence/implementation.md)
records reminder substrate, missing qualified D6 worker, lease expiry and
source revision fences. Current dispatch recovery repairs handoffs
(`packages/api/src/workflows/recovery.ts:48–69,114–139`), not cultivation truth.
**Decision effect:** retain A; no perpetual review schedule after closure.

**Proposed exact safeguard:** “An accepted close ends applicability of this
effort's unresolved pause-review and future cultivation attention. Retain
truthful historical attention; cancel/supersede only the source-owned pending
effects that closure actually ends. Every later wake, retry and repair checks
current source applicability and reuses durable effect receipts. None reopens
work or replaces an absent next date with an automatic reminder.”

Do not cancel all tasks or communications attached to the Party. Independent
stewardship, receipt, commitment or compliance work retains its own source
authority. Already released messages cannot be unsent; distinguish accepted
historical release from newly admitting an obsolete reminder. A read/unread
change is not a closure event.

**Permanent acceptance proof:** close before wake, wake admitted before close,
old executor resumes after its lease expires, duplicate wake after repair,
provider failure and optional Studio unavailable. No newly admitted stale
cultivation reminder, duplicate source task or automatic restart occurs, while
independent work remains intact. Test the precise release-ordering boundary;
do not promise to undo already delivered messages.

### I6 — Closed work either stays in the workload or disappears from history

**Severity:** medium/high. **Likelihood:** high if one existing CRM/status query
is reused for both. **Evidence:** donor-based CRM list, open-only contribution
attention, profile task lists and bounded timelines above. **Decision effect:**
retain A with explicit current-versus-history projections.

**Proposed exact safeguard:** “Exclude closed cultivation from the current
cultivation workload and its due/overdue/active counts. Keep authorized access
to its history through the existing source/record context. Display closure as
closure, without implying a lost donor, cancelled support, failed relationship
or completed outreach. Default work filters, explicit history, details, counts
and exports use the same source meaning.”

History visibility must remain current-authority filtered, including names,
counts, notifications and exports. Retaining a closure record does not make a
formerly authorized worker perpetually eligible. Do not declare complete
history when only a bounded subset is shown. Closure itself should not fabricate
`lastTouchAt`; source lifecycle events and actual contact activity are different.

**Permanent acceptance proof:** after accepted close and reload, the effort is
absent from current work/counts but discoverable in permitted source history;
unrelated current work remains. Compare detail, grid, shared tasks, missionary
projection, saved view, report/export and counts, including pagination boundary
and out-of-order cache responses. Verify the Party still appears normally in
CRM and financial/support records. Missing authorization removes protected
historical content, not the closure's business truth.

### I7 — A successful close response is lost, replayed or overwritten in caches

**Severity:** medium/high. **Likelihood:** medium under normal network failure.
**Evidence:** generic delete returns success without a receipt; contribution
completion replay changes timestamp; CRM caches require explicit invalidation;
task hook's request sequencing (`use-tasks.ts:157–192`) only guards its fetch
ordering. **Decision effect:** retain A; use the established command/receipt
principle rather than adding a new confirmation workflow.

**Proposed exact safeguard:** “A close has stable accepted intent and a durable
source result. A repeated same-intent request, including one whose response
was lost, returns that result under current access rather than another event.
Conflicting intent cannot reuse the key to alter history. Reconcile affected
work/history/count caches from the authoritative command result; an old fetch
cannot resurrect actionability or overwrite a newer source head.”

This does not authorize disclosing a hidden receipt after permission loss.
Semantic duplicates and unknown/missing/unauthorized identities require
role-safe handling. The D3 uniqueness oracle caution still applies: a conflict
is not permission to read somebody else's source or receipt. Do not use an
in-memory browser flag, expiring executor claim or a changed task status as the
sole idempotency record.

**Permanent acceptance proof:** accepted write with lost response, retries from
another permitted surface, two devices, late old GET, cache reload, changed
recipient rights and conflicting payload under the same command identity.
One source acceptance remains, with the original historical time and truthful
current UI. Uncertain UI shows recovery rather than falsely declaring failure
and prompting a new destructive command.

### I8 — Automatic integrations or backfills convert history into active work

**Severity:** high. **Likelihood:** medium during migration or repair.
**Evidence:** no P27 source is found; donor/task fields represent other concepts;
current CRM command logs and activities do not establish D7 approval.
**Decision effect:** retain A and deliberate D4 admission; later identity open.

**Proposed exact safeguard:** “Gift, referral, import, profile change, merge,
inactive flag or elapsed time does not close or restart cultivation. Preserve
explicit source closure across integrations and identity reconciliation. A
legacy row is not an approved admission/closure event; unresolved retained-data
mapping stays visible for authorized review rather than guessed.”

One old profile can represent multiple ministries. Neither donor.status nor
task deletion supplies the selected Ministry Assignment, purpose or closure
actor. Closure backfill must not fabricate those facts or touch financial
history. Before activating a new invariant, reject legacy writers that could
bypass it. Rollback may disable execution/presentation without erasing accepted
closures or returning ended work to automatic reminder queues.

**Permanent acceptance proof:** migration fixtures for missing/ambiguous scope,
multiple ministries, duplicate tasks and existing gifts/commitments; then
replay old clients, imports and repair jobs. Assert no invented history and
no automatic closure/restart. Verify recovery can resume from accepted source
receipts without reissuing ended effects.

### I9 — Premature uniqueness makes deliberate future work impossible or duplicate

**Severity:** high. **Likelihood:** medium if “closed” is immediately converted
to a database occupancy predicate. **Evidence:** D7's question explicitly leaves
same-enrollment reopen versus linked successor open; D3's qualified PostgreSQL
mechanics already cover nullable/partial uniqueness and concurrency.
**Decision effect:** retain A; preserve the next lifetime decision.

**Proposed exact safeguard:** “Closing this work leaves current workload and
keeps history. Later work requires a deliberate authorized action. Do not decide
same-row reopening, successor identity, uniqueness-slot release or collisions
merely from the current label. Whichever lifetime rule is selected must prevent
concurrent duplicate current work while preserving the exact prior history.”

No generic purpose catalog or lifecycle framework is required to resolve that
next question. Keeping database design provisional here avoids turning a
fixture's partial unique index into product policy.

**Permanent acceptance proof after the owner decision:** concurrent fresh
admission/reopen, linked successor if selected, two closed historical periods,
retry of the original close after later work begins, and merge collisions.
The old command cannot re-close new work; the new command cannot overwrite the
old closure; at most the permitted current work exists for the selected purpose
and scope. Until that decision, do not claim those schema rules are settled.

## PostgreSQL/Supabase feasibility and evidence limits

This is a small relational command, not a need for an event-sourcing product,
new task engine or generic lifecycle registry. A source record, durable accepted
history/receipts, qualified shared-work bindings and current-authority projections
can use PostgreSQL's existing transactional/constraint tools. Exact table names,
columns, source status vocabulary and uniqueness predicate remain implementation
work following the unresolved lifetime decision.

Primary PostgreSQL 17 documentation was refreshed on 2026-10-10:

- [Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): a
  foreign key maintains referenced identity; it does not encode the source's
  full business applicability. Cross-row rules cannot be safely replaced with
  an ordinary `CHECK` that depends on other rows. Deletion actions require
  explicit care where history must survive.
- [Explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html):
  row-lock modes have different conflicts. A transaction and a foreign key
  are not an application-wide close/new-work protocol. Select an explicit
  protocol obeyed by every writer, keep transactions bounded and account for
  deadlocks/retries; do not infer that arbitrary parent/child writes serialize.
- [Transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html):
  READ COMMITTED statements can see different committed snapshots. Sequential
  reads alone do not prove no competing insert; serializable transactions
  require application retries. Do not treat a stale preflight/UI observation
  as a permanent closure prerequisite proof.

The fresh D6 [database/version evidence](../d6-evidence/implementation.md)
documents current Supabase function/grant guidance and the manifest/installed
package drift on the same source checkout: Supabase JS declared 2.117.3 versus
installed 2.103.0; SSR 0.12.7 versus 0.8.0; Inngest ^4.22.0 versus 4.5.1.
`supabase/config.toml:27–34` requests local PostgreSQL major 17. No hosted version,
actual grants, job activation, migration application or deployment dependencies
were queried for D7. Declared source is not installed/deployed qualification.

No application implementation or SQL migration was written for this appendix.
Prior D3/D4 mechanics and D6 source probes remain evidence of their exact tested
seams, not D7 live transaction or end-to-end proof. A narrow additional source
probe was proposed to the root reviewer for the actual contribution completion
timestamp replay; any executed probe's adjacent artifact owns its commands,
outcome and limits. This reviewer did not execute a competing database lab.

The permanent gates above are tests for later production implementation, not
claims that they passed now. Useful measured operational signals at activation
are closed work still actionable, stale write/release rejection, obligation
projection recovery failures and repeated-command recovery. Unauthorized
disclosure, lost accepted history, duplicate current work and invalid scope
are invariant failures, not acceptable quotas. No capacity SLA, retention
duration, artificial close reason or mandatory next date was invented here.
