# D30 independent adversarial review

2026-10-11 UTC. Independent review of the complete
[D30 decision](../phase27-d30-adversarial-review.md), its R01–R18 requirements,
22-category assessment and AC01–AC40 matrix, together with all five appendices:
[ownership](ownership.md), [authorization](authorization.md),
[lifecycle](lifecycle.md), [practice](practice.md) and [UX](ux.md).
Repository baseline: `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.

**Disposition: Accept with required amendments, as recorded in the revised D30.**
Two material ambiguities were returned to the author, corrected in the integrated
requirements and acceptance criteria, and reread. No unresolved material decision
contradiction was found within this review's scope. This is not founder
ratification, implementation verification or proof of production readiness.

## IR30-01 — Delayed events could defeat prospective policy

**High severity; plausible with ordinary asynchronous processing.** The initial
R05 required prospective application, while R11 required current policy at commit.
Neither explicitly resolved an event committed under P1 but first processed after
P2 activation. Running P1 would use obsolete authority; silently re-evaluating that
old event under P2 would move an existing assignment despite no qualifying event
after activation. Worker scheduling would determine the apparent product policy.

The permanent fix distinguishes eligibility to trigger the new generation from
current validity of a resulting transfer. R05 now explicitly prevents rebinding
an earlier event or pending decision to the new generation. P2 requires a qualified
source change ordered after activation, or a deliberate finite current-application
or **Use rules again** operation. Transport arrival, worker start and a backdated
business date do not define this order. Every admitted result still needs current
policy, input, protection, eligibility and authorization checks.

**Resolved.** The revised R05, delayed-worker counterexample and AC29 were read.
AC29 requires both event-before-activation and event-after-activation schedules,
including the explicit current-application exception. A newly admitted current
source update may honestly carry an earlier occurrence date; this does not license
replay of its historical event stream. This narrows temporal behavior while
preserving the founder's optional automation. No queue or concurrency experiment
was executed by this review.

## IR30-02 — Durable handoff intent is not every required acceptance

**High severity; plausible where owners have different handoff conditions.**
The initial main R08 allowed lawful disposition or durable owned handoff before
claiming transfer completion, but did not carry lifecycle L07's explicit distinction
between acceptance required before replacement and acknowledgment required afterward.
An implementer could accept a durable pending intent in place of an actual source
prerequisite, or impose a needless receiving-person approval on every transfer.

The permanent fix preserves the exact owner's condition. Revised R08 requires
source-required pre-transfer acceptance before assignment commit. Where
acknowledgment is subsequent, the lawful assignment and durable handoff intent may
commit while acknowledgment remains visibly outstanding. Notification read state
and pending intent cannot counterfeit required acceptance. AC25 tests both meanings.

**Resolved.** Revised R08 and AC25 were reread against lifecycle L07 and the
[ADM-02 catalog](../../../../prds/workflow-studio/07-core-workflow-catalog.md:45).
ADM-02 triggers after a responsibility change is recorded, is disabled by default
and has an unresolved exact source binding. It does not impose a universal
pre-transfer acknowledgment or make native assignment depend on Studio. Actual
source prerequisites remain binding; access revocation remains immediate.

## Other material challenges resolved by the existing draft

**Source ownership and cardinality.** The exact P9 source is
[Phase 9 A4/A12](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:353),
not the roadmap's similarly numbered lines. A4's active `(from,to,type)` uniqueness
can conflict with A12's separately role-qualified responsibilities. D30 explicitly
amends the staff-family identity to distinguish roles while preserving unrelated
edge uniqueness. It allows multiple assignees and several legitimate roles for
one person; it does not invent one assignee per role or a second portfolio store.
R03/R10 and AC11–AC14 require primary, duplicate, removal and historical integrity
at the actual source boundary rather than silently selecting a successor.

**Manual intent and current authority.** R04 correctly distinguishes rule-managed,
manual, intentionally unassigned and unknown-provenance responsibility. Keeping
the same person is a meaningful protection change; an empty value is not proof
that initial routing may fill it. Return to rules is an explicit current-state
operation whose effect depends on the visible tenant mode. R09 now expressly
requires the NHI's live human-owner ceiling, consistent with
[P12:1552](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552);
AC18 includes revoked executor-owner authority. Historical policy approval does
not become a permanent grant or permission to impersonate its author.

**Matching and disclosure.** R02 selects the first predicate proved true before
checking its target. An ineligible selected person does not justify a lower-rule
fallback; an unknown higher predicate is not false. R07 retains otherwise valid
responsibility and uses qualified repair for missing or invalid coverage. R13
requires permission-safe explanations, target searches, counts and derivatives.
These rules avoid guessed assignment without authorizing hidden-input disclosure.

**Proportion and usability.** The draft preserves reviewed transfers by default
and tenant-controlled Auto; it does not retreat to A-only. Ordinary Apply needs
no second approver or per-row confirmation. Policy activation, optional application
to current matches and ordinary assignment editing concern distinct effects;
their distinction is not a three-approval chain. Inert drafts, finite reviewed
groups, explicit current/proposed/protected states and recoverable partial results
are coherent. Lifecycle and ownership appendices were checked after clarification
that saving a draft is inert and reenabling does not silently sweep existing records.
No new territory, generic workflow, financial or missionary-supervision engine is
justified by this decision.

**Coverage and release discipline.** Every requested category has an explicit
disposition, with exact requirements and outcome-oriented acceptance coverage.
Unrelated Requests, partnership leads, tasks, grants and money retain their owners.
The monitoring table supplies signals, thresholds, accountable roles and responses,
with named operators and numeric workload/freshness qualification required before
activation. Published CRM capabilities support the comparison, not measured ministry
benefit, achieved accessibility or an invented performance guarantee.

## Evidence boundary

This review read the integrated documents, directly checked the cited P9, P12 and
ADM-02 source clauses, challenged concrete counterexamples, and verified both
corrections. It does not independently reproduce every web retrieval or every
bounded code search recorded by the research authors.

No source adapter, migration, database policy, worker, UI or provider interaction
was executed or modified. No test suite, synthetic probe, live database, load test,
browser session or practitioner pilot was run. Real source/RLS/concurrency,
retained-data compatibility, primary/role integrity and composed usability remain
explicit activation requirements. Document consistency supports recording the
reviewed amendment; it cannot establish those product outcomes.
