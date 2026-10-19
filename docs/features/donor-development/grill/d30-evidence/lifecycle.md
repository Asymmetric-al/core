# D30 lifecycle, concurrency and operational review

2026-10-11 UTC. Research-only review of reviewed transfers by default plus
tenant-enabled automatic updates within bounded rule scope. **Recommend acceptance
with the following permanent safeguards.** They implement the selected control,
not a new approval product or independent assignment engine. Only this appendix
is edited; no implementation, database probe, runtime or load test was performed.
Severity/likelihood below are qualitative judgments, not measured incident rates.

## Evidence and limits

[Q30](../phase27-q30-assignment-rule-changes.md) separates initial routing from
replacement of existing responsibility. [P9 A12](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:485)
owns assignment edges, multiple role-qualified assignees and one primary;
portfolios derive from those edges. [D5](../phase27-q5-accountability-default.md:182)
separates the Party representative, partnership lead and individual Request/task
owners. An initial lead default is not a standing succession instruction.

[P12 authorization spine](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1540)
requires current capabilities, exact tenant context and current authority for
deferred work. [ADR0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:18)
distinguishes assignment from permission and a concrete human action requirement;
source-backed work retains its source identity and closure authority. The optional
[ADM-02 staff-transition pattern](../../../../prds/workflow-studio/07-core-workflow-catalog.md:44)
includes receiving-owner acknowledgment, but is disabled by default and explicitly
requires exact owner qualification. It does not impose acknowledgment on every
Party-edge change or make native transfers depend on Workflow Studio.

**Static implementation evidence:** the current
[CRM relationship list](../../../../../packages/api/src/admin/crm/relationships/service.ts:43)
maps donor, missionary, profile, pledge and activity rows; it is not a qualified
P9/P27 rule-managed assignment command. The existing
[task assignment helper](../../../../../packages/api/src/admin/mission-control-tasks/assignment-policy.ts:6)
chooses actor/queue fields from supplied arguments; it does not prove recipient
eligibility, protected exceptions, current rule authority or a handoff. Nearby
Support Hub routing belongs to conversation assignment and cannot supply CRM
responsibility semantics by analogy. These are reuse limits, not verified
production defects or an exhaustive implementation census.

Fresh primary sources, read **2026-10-11 UTC**:

- [HubSpot owner rotation](https://knowledge.hubspot.com/workflows/assign-and-rotate-record-owners-using-workflows),
  updated **2026-09-01**, Sales/Service Hub Professional/Enterprise, explicitly
  separates overwriting an existing owner from recipient eligibility. It also
  documents deactivated-recipient exclusion and owner-sync conflicts. Its routing
  algorithms, seat rules and fallback-to-unassigned behavior are not Core policy.
- [PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html)
  explains statement snapshots at Read Committed, changed-row predicate rechecks
  and whole-transaction retries after serialization failure. A transaction wrapper
  alone does not validate a multi-record business condition.
- [PostgreSQL 17 locking](https://www.postgresql.org/docs/17/explicit-locking.html)
  explains conflicting row locks, deadlocks, consistent acquisition order and the
  danger of holding transactions open for human input. It establishes available
  mechanisms, not that any proposed Core protocol is implemented or sufficient.

The PostgreSQL references are a versioned technical basis, not a claim about the
production database version. Product rules below are engineering recommendations
grounded in the owners above, not dictated by these vendors.

## Exact lifecycle clauses

**L01 — Scope the decision, not a universal owner slot.** Reviewed transfers remain
the tenant default. Automatic replacement requires an enabled exact policy scope,
role and source-proved rule-managed responsibility. Preserve P9's allowed
cardinality and primary invariant; do not assume every role has one assignee or
replace every edge when one responsibility changes. Rule settings, assignment
authority and receiving-person eligibility are separate checks. A role label,
portfolio membership, old rule provenance or current login does not authorize a
transfer. Unknown legacy/imported provenance remains protected until deliberately
qualified, not silently converted to rule-managed.

**L02 — Empty is not always available.** Distinguish an eligible initial/unassigned
responsibility from deliberate unassignment, pending handoff, failed eligibility
resolution and unknown provenance. Rules may fill only the qualified first case.
Clearing an assignment deliberately preserves that intent until an authorized
person explicitly returns it to rule control. Protect manual changes and **Keep
current** similarly across future rule edits. Keep can change management intent
without changing the assignee ID; record that fact and invalidate stale proposals.
Ordinary same-value mutation suppression must not discard it.

**L03 — Resolve one policy deterministically.** Use the disclosed ordered rules:
the first predicate proved true selects the rule; recipient eligibility is checked
afterward. An ineligible selected target does not silently fall through to another
rule. An unknown or forbidden higher-priority predicate is not false. Missing
inputs, contradictory responsibility or an unresolved target set leave the current
eligible assignment in place and an understandable unresolved result. No match
does not mean unassign. Multiple possible people require the owner's qualified
selection policy; array order is not a tie-breaker. No rule evaluation invents
an always-eligible queue or assigns the operator as a fallback.

**L04 — Configuration is not a historical rewrite.** Editing or saving a draft
does nothing to assignments. Explicitly activating an approved version governs
future qualified events by default. It does not silently scan and move every current relationship.
A separate finite **Apply to current assignments** action reviews the actual
current/proposed responsibility, explanation and affected-work meaning. This may
be one ordinary reviewed group action, without a second approver or a dialog per
record. Bind its identities, intended changes, relevant revisions and policy
basis; a stale preview cannot authorize a different target or an expanded query.
Configuration-save success and per-item transfer completion are distinct results.

**L05 — Disable prospectively and fence old work.** Turning off automatic transfers
ends admission of further automatic replacements under that activation, including
queued but uncommitted work. Preserve accepted assignments, history and separate
initial-routing policy; do not undo past transfers, cancel independent source work
or disable a still-authorized reviewed transfer merely because Auto is Off.
Re-enable starts a new activation on current policy for future qualified events.
Never replay old desired-owner payloads, historical triggers or a catch-up backlog.
Applying current policy to existing relationships uses L04's finite reviewed action.
Rule retirement similarly invalidates its queued authority without erasing history.

**L06 — Commit against current relevant facts.** Every path—reviewed, automatic,
bulk, import-supported or privileged—uses the same qualified source command.
Bind semantic intent and prove current tenant, actor/service authority, policy
activation/version, exact responsibility revision, management protection, relevant
input revision, receiving-person eligibility and applicable handoff prerequisites.
Record edits that do not affect this decision need not invalidate it; changed
decision inputs must. Policy edits/disablement, manual Keep/change, identity repair,
departure/revocation and transfer acceptance need a shared, proven ordering at
their actual mutation boundary. An earlier check followed by an assignment-only
lock is insufficient when another authoritative input can change independently.

Qualify the smallest transaction/fence protocol with the owning sources, fixed
lock order and bounded retries. Do not hold locks while a person reviews. Where
initial responsibility has no edge row, locking a nonexistent row proves nothing:
qualify concurrency at the stable source responsibility identity and enforce the
actual allowed cardinality. This is not a prescribed table or global tenant lock.

**L07 — Preserve responsibility and required handoff atomically.** An accepted
edge change, required source history, durable result and any required handoff intent
commit together or not at all. The Party transfer does not move partnership leads,
Requests, tasks, financial handling, commitment authority or protected notes by
implication. Preserve each independent owner's state. If its contract makes a
particular acceptance a prerequisite, do not claim completion before that exact
acceptance; where acknowledgment follows a transfer, show it as outstanding rather
than inventing a universal blocking gate. Downstream delivery failure cannot lose
the accepted obligation or relabel incomplete handoff as complete. Pending external
work is not cross-domain atomic completion.

**L08 — Departures and identity changes need truthful recovery.** An ineligible or
departed person may remain in lawful history but cannot be presented as an eligible
current actor or receive restored access. Auto may replace a rule-managed
responsibility only when all normal gates pass. Manual protection cannot fabricate
eligibility; an unresolved protected assignment needs the source-owned repair path,
not a guessed successor. Preserve real open work under its own owner. Party merges
must reconcile compatible role assignments/protection and retain provenance;
conflicts do not become survivor-wins. Staff identity repair must not copy grants,
financial authority or manual exceptions to an unrelated person. Stale jobs pinned
to former identities cannot silently retarget their effects.

**L09 — Retry receipts are not fresh authority.** Same semantic intent and payload
returns its admitted historical result without reapplying it; conflicting payload
reuse is rejected. A former A→B receipt, replayed after a newer B→A or manual Keep,
must not overwrite today's state. Re-prove current result disclosure and distinguish
receipt from current responsibility. A genuinely new later transfer is a new
occurrence, even if it repeats the same people. An unchanged assignment emits no
fictional transfer/handoff; a changed protection or management fact has its own
truthful history under L02.

**L10 — Finite bulk work has finite truthful outcomes.** Capture exact reviewed
members and intentions; evaluate each against current facts at application. Allow
partial outcomes with applied, unchanged/protected, stale/needs-review, canceled
and failed/unknown meanings as appropriate. Do not re-run a saved filter to add
people on retry. Cancellation stops unaccepted items, not committed history; any
reversal is a new current-authorized action. Bound batches and recovery so one
problem relationship does not freeze the whole portfolio. Item results, totals
and reasons remain current-permission projections; no hidden assignment inventory
is disclosed through failure counts.

**L11 — Rules cannot chase their own output.** The bounded automatic rule inputs
must not depend on assignment output fields or derived portfolio membership that
the same operation changes. Deduplicate one source-event/purpose evaluation and
share the source effect identity with any optional executor. An emitted
`assignment_changed` event is not an implicit invitation to re-run routing until
some owner appears. Genuine later relevant input changes may produce a new
evaluation. Conflicting or unsupported recursive configuration stays unapplied
with a clear repair path, not an infinite retry or a new workflow language.

**L12 — Exceptions need useful operations, not surveillance.** Show current owner,
proposed owner, management basis and the permitted unresolved cause together.
Project shared work only when a source proves a concrete required human action;
no task for every unchanged evaluation, inactive rule or retained historical edge.
Measure queued age, stale/rejected transfers, required handoff failures and exact
unauthorized/duplicate effects with minimized identifiers. Stop the affected
automatic scope on a verified authority violation or overwrite of protected intent;
retain safe reviewed operations and source-required work. Capacity, retry budgets
and latency targets require actual workload qualification, not invented numbers.

## Graded acceptance requirements

These are required future proofs, **not executed tests**. Exercise real source
commands and least-privilege paths, not only a fixture implementing these rules.

| Risk                                               | Severity / likelihood                     | Precise acceptance proof                                                                                                                                                                               |
| -------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Manual intent mistaken for no assignment           | High / likely without explicit provenance | L01–02: route eligible initial absence, preserve deliberate absence; Keep on the same person changes protection and stops a captured automatic transfer.                                               |
| Rule-order fallback silently changes intent        | High / plausible                          | L03: first true rule with ineligible target stops; unknown earlier predicate does not fall through; known false predicate can advance normally.                                                        |
| Policy edit or re-enable replays old transfers     | High / likely with queued jobs            | L04–05: existing assignments survive edits/Off/On; old activation jobs cannot apply; only a fresh qualifying event or finite reviewed current-apply acts.                                              |
| Revocation/disable race accepts obsolete authority | High / plausible                          | L06: force both commit orders against disable, actor/recipient revocation and manual Keep. A valid earlier commit remains history; later acceptance on invalidated proof fails without partial change. |
| First-assignment race or unrelated-role overwrite  | High / plausible                          | L01/L06: concurrent fills enforce actual source cardinality/primary rules; transferring one managed responsibility preserves unrelated assignees and roles.                                            |
| Edge commit loses work or implies permission       | High / plausible                          | L07–08: fail required history/intent persistence and prove rollback; stop the projection worker after commit and retain actionable source obligation; transfer changes no grant or financial owner.    |
| Retry overwrites a later decision                  | High / likely under timeout/retry         | L09: accept A→B, then B→A/Keep, then retry first intent; return historical outcome without new transfer or owner mutation. New legitimate A→B remains possible.                                        |
| Departure or merge invents succession              | High / plausible                          | L08: departed manual owner produces qualified repair; a merge conflict retains both origins and no automatic survivor authority, hidden-data disclosure or lost duty.                                  |
| Bulk recovery expands scope or lies about success  | High / plausible                          | L10: crash after some commits, change one remaining target, retry and cancel; no duplicated accepted item, no changed intended population, precise per-item recovery.                                  |
| Rules oscillate or generate task storms            | Medium/High / plausible                   | L09/L11–12: output-dependent configuration is not admitted; unchanged evaluation and duplicate event produce no transfer/task; a real later input change remains actionable.                           |

Reviewed-only operation is the strongest simpler alternative, but the selected
tenant opt-in is supportable within these boundaries. No rule compiler, separate
portfolio store, mandatory global handoff ceremony or new authorization/financial
authority is needed. Release qualification must demonstrate the reached native
paths; prior Phase 27 probes do not establish D30's multi-source concurrency.
