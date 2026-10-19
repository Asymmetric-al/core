# Phase 27 D7 — close current development work, preserving its history

2026-10-10. Source checkout: `225c02e9499bd6c0d493223cd4b1a4120ff787e3`.
**Disposition: Accept with required amendments — ratified 2026-10-10.** The founder
confirmed, “Yes, ratify this amended D7.” D1–D4 and amended D6 remain ratified; D5 A remains
selected. This is the completed research and decision review, not a formal PRD,
OpenSpec change, issue, implementation or activation.

**Subsequent choice:** [D8](phase27-d8-reopening-review.md) now selects reopening
the same journey for a genuine later return. D7's original parent-lifetime
reservation below is historical; its correction, collision and proof gates still apply.

The selected answer is right for the question's actual situation: staff have
decided there is no meaningful further development work to pursue in this effort.
It must not become “close whenever there is no date.” An unknown date can coexist
with real continuing intent or an outstanding promise.

In ordinary language: **finish this piece of staff work, keep its story, and leave
the church's relationship with the ministry intact.** Closing must not label the
supporter lost, cancel giving, erase promises or manufacture completed work.

## Evidence and what it establishes

| Class                     | Verified evidence or explicit limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository authority      | P27 owns cultivation meaning; P9 owns Party/Ministry Assignment/assignment-derived portfolios and shared work. ADR-0183 controls source-owned task completion; ADR-0027 separates source state from notification engagement. P12 governs current purpose, scope, field/history and result authority. Exact anchors are in [ownership](d7-evidence/ownership.md) and [authorization](d7-evidence/authorization.md).                                                                                  |
| Current code              | No P27 cultivation-close implementation was found in the inspected API/database/migration paths. Generic task deletion can erase dependent task history. A current completion helper rewrites its completion timestamp on a repeat outcome. Prototype task counts can include cancelled overdue work that the default list excludes. These are bounded reuse hazards, not evidence of a deployed D7 vulnerability. See [implementation](d7-evidence/implementation.md) and [UX](d7-evidence/ux.md). |
| Financial boundary        | [P16 roadmap](../../../prds/sitestacker-parity/roadmap.md:925) keeps commitments, fulfillment, contributions and recognition distinct. Its indefinite financial pause does not authorize an indefinite cultivation hold, and closing cultivation cannot pause a commitment. P13/14/16 remain the financial authorities.                                                                                                                                                                             |
| Fresh published practice  | Official Salesforce integrated Nonprofit, RE NXT, Virtuous, CiviCRM, MPDX, TntConnect, OMF, AFP, WCAG and GOV.UK pages were opened on 2026-10-10. Edition/date/quotation limits are recorded in [UX](d7-evidence/ux.md) and [ministry](d7-evidence/ministry.md). Vendor help is evidence of documented behavior, not measured ministry preferences or Core authority.                                                                                                                               |
| Fresh executable evidence | [Ten scoped source tests](d7-evidence/source-probe/README.md) passed; one demonstrates the actual helper's timestamp-rewrite counterexample. [Six PostgreSQL race checks](d7-evidence/closure-race-probe/README.md) passed, including an insufficient-lock counterexample and both orders of a cooperating-writer strategy. Neither qualifies a D7 application.                                                                                                                                     |
| Product judgment          | A contextual close action, preserved authorized history and no extra holding state for the presented no-work case are the simplest appropriate direction. A reason essay, manager approval, new inbox, closure wizard, financial criterion or automatic event watcher is unsupported.                                                                                                                                                                                                               |
| Unverified assumptions    | Actual agency staff can distinguish finished work from event-dependent waiting using this language; source owners can expose a complete, safe, bounded closure-readiness result. These require usability and owner-contract proof before activation. No staff feedback, live Supabase catalog check, load benchmark or end-to-end D7 pass is claimed.                                                                                                                                               |

External patterns are not imported wholesale. Salesforce's opportunity represents
a particular solicitation, not D1's continuing journey. MPDX's documented Hide
changes a contact to Never Ask: that conflicts with D7's scope and is rejected.
Virtuous contact archiving has wider discovery consequences and is also rejected
as a model for this action. CiviCRM's distinct Completed/Cancelled/Not Required
supports a distinction Core already requires. PostgreSQL's actual policy/locking
semantics control over simplified secondary advice. No governing ADR needs to be
overridden for this decision.

## Exact corrected decision — ratified 2026-10-10

> **D7 — Close current development work, keeping its lawful, authorized history.**
> When an authorized person deliberately concludes that there is no meaningful
> further work to pursue in this identified ministry-partnership effort, close
> that current effort and remove it from current development workload. A missing
> date, declined ask, quiet giving period, absent lead or lack of response alone
> is not that conclusion. Actual outstanding or deliberately continuing development
> and stewardship work—including prayer-related or practical-support follow-through—
> counts whether or not a financial ask is open. A continuing prayer or financial
> relationship alone does not establish remaining development work.
>
> Before accepting closure, the source must account for the complete, bounded set
> of obligations whose applicability or accountability this closure would change.
> Do not infer readiness from an empty visible task list. Required work must be
> fulfilled, receive its own authorized disposition, or remain independently
> valid, accountable and findable outside this closed effort. Reassigning the
> same continuing effort does not make it finished. The person receives only a
> separately permitted minimal readiness/result; closing grants no access to
> protected obligations and no power to dispose of another owner's work.
>
> Closing changes this effort only. It does not archive the supporter or ministry,
> end their relationship or staff assignments, rewrite observed stage or ask
> responses, change giving or commitments, infer donor rejection or consent, or
> cancel independent service and stewardship. Preserve authorized historical
> discovery under existing retention, privacy and correction rules.
>
> Accept closure once through the authoritative source command, preserving the
> original actor, time and outcome on retry and preventing concurrent work from
> being stranded. End only the exact review/task/attention that becomes
> inapplicable. An actual review may be Completed; a future review made unnecessary
> is No longer required. No donor contact or closure message is implied.
>
> Later cultivation requires a deliberate, currently authorized action; gifts,
> imports, referrals and elapsed time do not restart it. D7 does not choose
> same-enrollment reopening versus a linked successor. Either later policy must
> preserve prior closure facts and must not revive ended child work, obsolete
> attention, erased content or revoked access. For this no-work case, add no
> undated holding state and require no artificial review date.

This narrows A to the presented premise and adds material source, obligation,
privacy and history guarantees. The founder explicitly ratified these amendments.
The next lifetime choice remains a genuine interview dependency, not an engineering
assumption or unfinished portion of this review.

## Exact requirements to carry into the eventual specification

These numbered clauses record the ratified requirements, not additions to published
OpenSpec. They avoid freezing table names, enum names or a generic workflow engine.

### R01 — Meaning and eligibility

“Close development work SHALL express an authorized deliberate conclusion about
the exact current effort. Absence of a useful date, an empty visible task list,
one declined ask, no gift, no recent response, staff departure or a score SHALL
NOT automatically establish closure eligibility. Meaningful nonfinancial work
and stewardship SHALL receive the same consideration as financial asks. Actual
continuing work SHALL retain valid accountability or its existing source-owned
assignment exception; closure SHALL NOT conceal missing ownership.”

### R02 — Narrow ownership and outcomes

“Closure SHALL be a P27 source lifecycle fact for the exact Party, identified
Ministry Assignment, purpose, Tenant and Legal Entity context. It SHALL NOT
mutate Party or ministry lifecycle, staff-assignment edges, other purposes,
observed cultivation stage, ask response, money, commitments, recognition,
communication restrictions or publishing. Portfolios SHALL continue to derive
from their authoritative assignments/views. Closing SHALL NOT count as a donor
interaction, financial success, donor loss or a fulfilled ask.”

Do not add an invented Party Legal Entity column to implement this rule. Enforce
the exact entity-bearing source relationships under their owners' models.

### R03 — Complete bounded readiness and surviving obligations

“The source SHALL check all work whose applicability or accountability this exact
closure changes, including relevant asks, accepted promises and stewardship.
Partial pages, stale caches and caller-/permission-filtered views SHALL NOT prove
completeness or absence. A complete owner-qualified aggregate or bounded enumeration
SHALL be revalidated under the closure fence; unknown or unavailable verification
SHALL NOT mean no work remains.
Blocking work SHALL be fulfilled or receive an owner-authorized disposition
before closure; a genuinely independent continuing obligation MAY survive only
with valid source authority, accountability and discoverability. Merely assigning
the same continuing cultivation work to another person SHALL NOT satisfy this
condition. Closing SHALL NOT blanket-complete, delete or cancel linked work.”

The P27 design must enumerate its exact affected source bindings and permitted
dispositions. This is not a scan of every obligation in Core or a new central
obligation ledger. Independently valid finance/service work is not an automatic
blocker. The application cannot certify unrecorded private promises; show the
meaning of the deliberate action without demanding an exhaustive narrative.

### R04 — Readiness, close and history are distinct powers

“The admitted close path SHALL independently qualify the actor's current close
authority and minimal readiness/result observability under P12's exact context,
processing purpose, scope, field/history floors and current authorization epoch.
Journey read, assignment, task ownership and service credentials SHALL NOT grant
either power. The internal check SHALL disclose no protected existence or detail
beyond the exact independently authorized minimized readiness/result projection,
including through counts, errors, timing or result differences. Specific blocker
details and resolution links SHALL require their own current source-detail
authorization; minimal readiness authority SHALL NOT grant them.
Where the minimum result is not permitted, the action SHALL remain uniformly
unavailable/non-admitted in the relevant hidden-present and hidden-absent cases,
with only an existing qualified recovery route. No read-all permission, new role,
manager-approval queue or hidden-detail access SHALL be inferred.”

P12's P21 close-readiness separation is a precedent, not an inherited P27 grant.
Define the P27 result contract before activation. A permission-safe failure is
not a claim that no obligations exist. Authorized users may receive the permitted
specific blocker and contextual resolution link.

### R05 — Atomic acceptance and cooperating writers

“The authoritative command SHALL accept against current scope, authority, source
revision and complete closure-relevant facts. Closure, its minimum lawful history,
durable result receipt and required local projection intent SHALL commit atomically.
Every admitted writer that can add or change closure-relevant work SHALL obey a
compatible concurrency protocol and recheck current applicability. A stale
preview, separate precheck, ordinary FK or transaction wrapper alone SHALL NOT
qualify that protocol. When work wins a race, close SHALL re-evaluate/reject;
when close wins, incompatible new work SHALL not be admitted to the closed effort.”

Require a proved transaction/constraint strategy, not a named lock everywhere.
Owner-controlled dispositions outside that atomic boundary must already be
authoritatively accepted and revalidated. No network request belongs inside the
database transaction. Do not introduce a distributed close saga merely to make
the UX appear instantaneous.

### R06 — Durable effect identity and time

“Repeat delivery of the same accepted close SHALL return the original permitted
receipt without duplicating history or rewriting its actor, accepted timestamp
or outcome. A reused key with conflicting intent SHALL not execute. Replay
disclosure SHALL use current authority. Later current source state SHALL be
distinguished from the original result. Normal closure SHALL use trusted server
acceptance time; it SHALL NOT silently backdate or future-date source effects.
Any separately governed historical import/correction SHALL preserve recorded-at,
effective-time and provenance distinctions and SHALL NOT replay past side effects.”

Do not use a mutable task completion timestamp as the closure fact. Caller-sent
actor, author, tenant, approval or audit attribution is not authoritative.

### R07 — Truthful task and attention ending

“A performed review whose accepted outcome is End MAY record that review as
Completed. Direct closure which makes a future review unnecessary SHALL record
No longer required. Only the exact source-owned applicability ends; independent
requirements and multi-reason work SHALL retain their remaining validity.
Queued obsolete attention SHALL not be admitted after source closure. Already
available attention SHALL end under its existing source/Recent policy without
fabricated read, completion, recall or engagement transfer. D7 SHALL add no
automatic donor contact, closure notification, external channel or new inbox.”

D6 remains internal-only. Independently owed financial receipts or communication
retain their own source/P6/P17 rules; an external request already submitted cannot
be truthfully recalled merely because cultivation closed.

### R08 — Coherent current views and authorized history

“Source applicability SHALL govern current lists, due/overdue badges, counts,
search projections and their drill-downs consistently, including during projection
lag. Closed work SHALL leave current development workload while remaining findable
through permitted source context and a clear closed/all-history view. Last contact,
successful asks, donor retention and gift totals SHALL not change merely because
work closed. Historical reports SHALL retain their declared cohort, time and
outcome semantics; current status SHALL NOT rewrite previous period facts.”

Caches/read models are not write authority. Their keys and invalidation must
preserve current viewer, tenant/entity, purpose and authorization context. A
delayed cleanup may be recoverable; presenting obsolete work as currently required
is not acceptable eventual-consistency behavior.

### R09 — Database and mutation boundary

“All admitted API/RPC/job/import/AI/repair writers SHALL preserve the same source
transition and authority invariants. Tenant-aware relationships SHALL prevent
wrong-Tenant or forbidden entity/source references. Identity, binding and accepted
provenance SHALL not be caller-mutable. Database nullability, defaults, valid-state
checks and deletion rules SHALL preserve accepted closure evidence; direct generic
status changes or task deletion SHALL NOT substitute for closure. Browser grants,
RLS, views, functions, storage and privileged service paths SHALL be tested under
their actual effective roles. Both old-row eligibility and resulting-row validity
SHALL hold for mutations, including UPSERT, RETURNING and retries.”

Applicable PostgreSQL policies may inherit USING when WITH CHECK is omitted;
omission alone is not a vulnerability. Inspect permissive-policy combinations,
owners/BYPASSRLS, function EXECUTE/search-path/security context and column grants.
Current revoked browser task grants do not qualify service-role behavior. Use
immutable same-source keys and justified indexes; do not freeze lifetime unique
constraints before the reopening/collision choice. Cross-row current authority
belongs in qualified transactional execution, not a mutable cross-row CHECK.
No money column or precision change is needed. Related errors must not leak
protected constraint conflicts. New attachments/storage policies are not required.

### R10 — Lawful history and restoration

“Retain minimum lawful structural evidence of accepted close, actor/cause, exact
scope, outcome and surviving references under source retention/correction rules.
Ordinary close/delete SHALL NOT cascade away required evidence. Private note
bodies, locations and readiness manifests SHALL NOT be copied wholesale into
permanent audit, logs, exports or generated documents. Current authority SHALL
govern history, search, export, audit, missionary and donor/public projections
independently. Redaction, anonymization, erasure, expiry and backup controls SHALL
still apply. Before restored readers/workers activate, reconcile current closure,
consumed-effect, revocation and content-disposal fences; if unavailable, hold the
affected surface/execution rather than resurrecting old state.”

Append-only business facts are not an exception to content disposal. Donor/public
surfaces gain no CRM history. Existing missionary floors remain binding; neither
ministry participation nor former responsibility is an access grant.

### R11 — Simple, accessible interaction

“Use a contextual Close development work action showing the identified supporter
and ministry and a short statement of consequences. Present only actual permitted
blockers and their source resolution routes. Do not require artificial dates,
supporter contact, a reason essay, monetary success or a new approval step. The
final action, pending/error/conflict result and retained history SHALL be usable
by keyboard, screen reader, touch and narrow/mobile layouts. A lost response SHALL
lead to safe result recovery, not blind repeated commands. Do not rely solely on
a toast, color, hover or an unqualified Undo action.”

Reuse Core components and history/work destinations. Preserve international names,
Unicode/RTL labels and existing address/localization models; this action adds no
name/address fields. Record time as an instant and display the zone; retain D6's
saved calendar date/zone independently. Do not require connectivity to unrelated
providers. Do not claim a closure succeeded offline before source acceptance.

### R12 — Future work without rewriting the past

“No gift, message, referral, import, timer, restored snapshot or generic task action
SHALL automatically resume closed cultivation. Later work SHALL require deliberate
current authority and eligible responsibility. D7 SHALL NOT select same-enrollment
reopening versus a linked successor. Either chosen policy SHALL preserve earlier
actual closure facts and SHALL NOT revive ended review/task/notification occurrences
or obsolete permissions. A mistaken close SHALL be correctable only through the
subsequently qualified source correction/return rule, never by deleting its history
or toggling a generic closed flag.”

Resolve the parent lifetime/correction and collision choice before schema uniqueness
and activation. ADR-0183's non-reopened predecessor concerns child source work; it
does not secretly settle this parent choice.

### R13 — Recovery and operational evidence

“A lost response after commit SHALL be recoverable from the durable accepted
receipt. Required projection failure SHALL be visible to authorized operational
owners and retried/reconciled from accepted source intent without repeating the
business effect. Distinguish committed closure from pending/failed secondary
cleanup; source applicability SHALL remain authoritative. Record bounded identifiers,
source/command revisions and permitted cause/outcome evidence. Technical logs,
business history, security audit and notification engagement SHALL remain distinct.
Supported repair SHALL re-prove current authority and source state.”

No recurring direct SQL repair, copied private payloads, silent retry exhaustion
or reliance on staff remembering hidden obligations is an acceptable design.

### R14 — Rollout and dependency isolation

“Qualify the narrow P27/P9/P12/D6 end contracts and every affected writer/reader
before tenant activation. Disable unsupported legacy writes and gate mixed-version
paths that cannot preserve closure. Import/archive/status mappings SHALL NOT infer
closure, donor refusal or historical completion without declared provenance and
accepted mapping. Activation/backfill SHALL NOT generate historical reminders or
outreach. A kill switch MAY stop new actions/effects but SHALL NOT undo accepted
history or reopen ended work. Roll-forward/rollback/restore SHALL preserve current
source and authorization fences. Native close SHALL NOT depend on optional Studio,
an external CRM, Stripe availability or a vendor-specific status.”

Use additive compatible evolution and bounded validated backfills where needed;
the actual retained-data census must determine the migration. No migration of
unobserved P27 production rows is invented by this review.

### R15 — Bounded performance and proof

“Before activation, declare the tested tenant/entity data volumes, affected-work
fan-out, concurrent writers, history/export size, query plans, pagination and
latency/error thresholds. Use tenant/source-keyed selective queries and indexes;
never treat a result cap as complete readiness. Measure realistic high-fan-out
and skewed-tenant fixtures, not just an empty database. Performance optimization
SHALL NOT bypass current authority or source applicability. Unknown verification
or overload SHALL fail visibly without a false clean closure.”

No numerical throughput, size limit or closure SLO is established by the small
mechanics probe. Use the existing platform's qualified jobs/repair where appropriate,
not one permanent timer per closed journey or a new scheduler.

## Independent review of every requested category

Severity is consequence if the defect is introduced; likelihood is a qualitative
implementation risk, not a measured incident rate. Each numbered result explicitly
states its effect on A, exact prevention clauses and acceptance proof. The linked
appendices provide line-level evidence and additional examples for each concern.

### 1. Problem validity, necessity, and alternatives

**Material concern: yes. High severity; plausible.** Closing simply because no
date exists can erase real continuing intent. The strongest B is a visible, owned
undated wait for an external change; it does not require an event engine. A is
simpler for the actual no-work premise, not proven universally superior. Q7's
premise, [ministry](d7-evidence/ministry.md) and [UX](d7-evidence/ux.md) support
this distinction. No-build alternative: stop generating tasks, but without an
explicit disposition current-work/history meaning remains ambiguous. **Narrow A**
with R01/R03/R11; test AC01/03. Do not invent dates or introduce B under another
name. Real ongoing-work/wait policy must not be inferred from this no-work case.

### 2. Brittleness

**Material concern: yes. High; likely if convenient lists are reused.** Empty
filtered or capped task results, stale owner assignments and incomplete integrations
can falsely establish readiness. Current shared attention query is capped at 100;
it is not a complete P27 readiness source ([implementation](d7-evidence/implementation.md)).
That limit is a query observation, not an allowed obligation maximum. **Amend A's
preconditions** with R03–R05/R15: explicit bounded source completeness, current
facts, unknown-is-not-empty. AC03/05/12 prove incomplete and changed conditions
cannot silently pass.

### 3. Technical debt

**Material concern: yes. High; likely under copy-and-paste reuse.** Generic mutable
statuses, cascading deletion and repeat completion timestamp rewrites would make
history costly to repair later. Actual [source replay test](d7-evidence/source-probe/README.md)
demonstrates the timestamp issue; [implementation](d7-evidence/implementation.md)
identifies the mutation paths. **Retain A, change implementation requirements**:
R05–R09/R13 require one source effect/receipt and derived task/attention state,
without a parallel engine. AC06/07/10 reject history drift and destructive reuse.
This review does not authorize unrelated code repair or call all current code unsafe.

### 4. Edge cases

**Material concern: yes. High; plausible.** Prayer-only work, one declined ask,
another ministry's work, changed missionary personnel, staff loss, a late gift,
or an accepted promise can be misclassified as finished. [Ownership](d7-evidence/ownership.md)
and OMF/TntConnect evidence in [ministry](d7-evidence/ministry.md) establish the
separate meanings; illustrative cases are not claims of actual agency usage.
**Narrow A**, do not reject it: R01–R03/R07/R12 preserve meaningful work and source
boundaries. AC01/02/03/08 and the scenario table below prove the distinctions.

### 5. Footguns

**Material concern: yes. High; plausible.** Archive, Delete, Closed Lost or a
generic Complete checkbox can imply donor refusal, erase evidence or cancel
promises. Current task delete paths and MPDX Hide→Never Ask show why labels and
reuse matter ([implementation](d7-evidence/implementation.md), [ministry](d7-evidence/ministry.md)).
**Amend A's action and effect boundary** with R02/R07/R09/R11. A short contextual
consequence review and deliberate final action are sufficient; do not add a
ceremonial checklist. AC02/07/11 prove scope, truthful outcomes and understandable
recovery. No generic Undo is promised before its source meaning is decided.

### 6. Tenant safety

**Material concern: yes. Critical; plausible if privileged or cached paths are
reused.** A wrong Tenant/source binding, coarse role check or unscoped projection
could close or expose another organization's ministry work. Current CRM action
labels are not full P12 per-action authorization ([authorization](d7-evidence/authorization.md)).
**Retain A with a release gate**, R02/R04/R08–R10/R14: server context, exact
tenant-aware relationships, current projection keys and privileged-path checks.
AC04/09/13 test boundaries. Permitted multi-Legal-Entity work within the active
Tenant is supported; no invented blanket entity isolation replaces P12.

### 7. Database, RLS, and authorization safety

**Material concern: yes. Critical; plausible.** Raw status/DELETE/service-role
writes, weak relationships or old-row-only policies can transform a permitted row
into a forbidden binding or erase history. Actual migration grants/cascades and
role-helper limits are cited in [authorization](d7-evidence/authorization.md).
The PostgreSQL race probe disproves relying on an FK and weak parent lock.
**Amend engineering acceptance**, R04–R06/R09/R10. AC05/06/09/10/13 require real
effective-role/catalog and both mutation-state tests, validated FKs/defaults/nulls,
safe delete behavior, indexes and privileged function boundaries. This is not a
claim that absent WITH CHECK always fails, nor that revoked browser grants expose
rows. Money precision is unaffected; no new finance schema is justified.

### 8. Overengineering

**Material concern: yes. Medium; plausible in response to this review.** A universal
obligation graph, configurable closure policy engine, new approvals, indefinite
timers or a private notification product would enlarge dependencies without
evidence. [Ownership](d7-evidence/ownership.md) and [UX](d7-evidence/ux.md) support
source-specific behavior and shared surfaces. **Retain A and constrain the fix**:
R03/R04/R11/R14/R15 require only relevant owner contracts, one contextual action
and existing qualified mechanics. AC14/16 check scope. Thorough analysis does not
justify introducing every comparator's configurable feature.

### 9. UX/UI and user friction

**Material concern: yes. High; plausible.** Users can mistake closure for ending
the relationship, lose historical context, encounter fictitious dates or repeat
a slow submission. The user previously found the terminology confusing; current
prototype labels/counts are inconsistent. [UX](d7-evidence/ux.md) links fresh WCAG,
GOV.UK and CRM evidence. **Amend A's presentation**, R01/R08/R11: plain language,
source context, one deliberate action, truthful blockers and findable history.
AC01/11 cover keyboard/focus, screen readers, 320 CSS-pixel reflow, touch, translated
and RTL labels, long international names, time zones and low-bandwidth recovery.
No address form or donor checkout step is added. No measured usability benefit
or accessibility pass is claimed.

### 10. Source of truth, ownership, and domain invariants

**Material concern: yes. High; likely if “closed” is reused across domains.**
Tasks, notifications, donor status and financial outcomes can become competing
authorities. P9/P27/ADR-0183/ADR-0027 expressly separate them ([ownership](d7-evidence/ownership.md)).
**Amend A's source contract**, R02–R08/R12: one accepted closure fact, preserved
stage/ask/money meanings, derived workload and independent obligations. AC02/06/07/08
prove no financial changes, no invented accomplishment and preserved cardinality
of accepted effects. No lifetime uniqueness rule is frozen; D3's ordinary-purpose
rule and parent-lifetime choice must be reconciled before that constraint.

### 11. Hidden coupling

**Material concern: yes. High; plausible.** Closing could erase Party assignment
edges to clear a portfolio, depend on optional Studio, or turn a gift integration
into reopening authority. P9's portfolios derive from assignments; P27 works
natively ([ownership](d7-evidence/ownership.md)). **Retain A, prohibit those
couplings**, R02/R07/R12/R14. AC02/08/14 prove independent work and native closure
continue correctly through provider/Studio unavailability. A portfolio may still
contain the church after its current cultivation effort closes.

### 12. Failure modes

**Material concern: yes. High; plausible under ordinary response/worker failure.**
A committed close with a lost response can be repeated; failed projection can
leave misleading work; incomplete checks can falsely report success. Current
task/link/event inserts are separate calls, not proof of transactional closure
([implementation](d7-evidence/implementation.md)). **Amend A's success/recovery
contract**, R03/R05–R08/R13. AC06/07/12 prove before-commit failure has no accepted
effect, post-commit failure preserves one result, and retry/reconciliation does
not reopen or fabricate cleanup. No external mutation is needed for D7; unrelated
ambiguous provider success stays under its existing owner.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: yes. High; demonstrated mechanism risk, application frequency
unknown.** Close and newly accepted work can both commit under inadequate locking;
retries can rewrite history; stale reminders can survive. Six fresh
[PostgreSQL checks](d7-evidence/closure-race-probe/README.md) and the actual-helper
replay counterexample substantiate this. **Amend A**, R05–R07/R12–R14; AC05–08/13
cover both race orders, repeated keys, late events and restore. Closing is a
durable disposition, not a transport request. No timezone conversion may rewrite
the accepted instant or old D6 date. Parent reopening/correction remains an
explicit pre-activation decision; ended child work cannot be revived by either
future option.

### 14. Data integrity risks

**Material concern: yes. High; plausible.** Duplicate closure facts, lost surviving
promises, false ask completion, imports mapping Archive→Closed and period reports
using today's status can corrupt operational or historical truth. Current mapper
uses donor status for lifecycle and updated_at for generic lastTouchAt; neither
is a cultivation closure/contact fact ([implementation](d7-evidence/implementation.md)).
**Amend A's persistence/reporting boundaries**, R02/R03/R06/R08/R14. AC02/03/06/10/13
verify durable references, exact original outcome, stable historical meaning and
explicit migration provenance. Do not write a second stored portfolio membership.

### 15. Security and privacy risks

**Material concern: yes. Critical; plausible.** “Cannot close” versus “closed” can
reveal a protected obligation even when details are hidden. Retained reasons,
exports, audit and backups can expose care/location data or revive revoked access.
P12 separates result observation and action powers; current audit redacts certain
secret-like keys, not every private narrative ([authorization](d7-evidence/authorization.md)).
**Materially amend A**, R04/R09/R10: qualify minimal result authority and current
history/egress floors, uniform non-admission where needed, minimum lawful evidence.
AC04/09/10/13 test hidden-present/absent outcomes, exports/logs/attachments/caches
and restore. No new permanent private snapshot, broad missionary history access
or arbitrary retention period is accepted.

### 16. Scalability and performance risks

**Material concern: yes. Medium/high; plausible with unbounded fan-out or hot rows.**
Whole-Party scans, one timer per journey, N+1 owner reads or long locks can degrade
large tenants and fail partial checks. The current 100-row helper and small PG
fixture prove no production envelope ([implementation](d7-evidence/implementation.md),
[race limits](d7-evidence/closure-race-probe/README.md)). **Retain A with measured
qualification**, R03/R05/R15; AC12 requires explicit volumes, plan evidence,
concurrency and thresholds before activation. Use exact source predicates/indexes
and bounded recovery. No unsupported “scalable,” millisecond or tenant-size claim
is accepted, and a cap cannot silently truncate readiness.

### 17. Operational burden

**Material concern: yes. Medium; plausible.** Staff can accumulate fake review
dates, developers can need SQL repairs, or unresolved hidden dependencies can
create permanent support loops. Q7, [UX](d7-evidence/ux.md) and current qualification
gaps establish the design risk, not measured burden. **Retain A and simplify the
permanent path**, R03/R04/R11/R13: clear owner-qualified resolution, contextual
close/history, durable results and supported repair. AC03/11/12/16 require failures
to reach the right authorized owner without a new generic queue or guessed admin.
Monitoring may detect regressions; it cannot replace a missing resolution path.

### 18. Observability and auditability gaps

**Material concern: yes. High; plausible.** Logs may say success while history is
missing, a future review may look performed, or timestamp retries may disguise
when work ended. Current helper replay and separate task events are direct
evidence ([implementation](d7-evidence/implementation.md), [source probe](d7-evidence/source-probe/README.md)).
**Amend A**, R06–R08/R10/R13. AC06/07/10/12 distinguish immutable accepted outcome,
source history, security attribution, technical reconciliation and personal
engagement. Monitor specified discrepancies below using bounded identifiers;
do not copy private blockers into unrestricted logs for diagnosis.

### 19. Dependency and integration risks

**Material concern: yes. High; plausible if existing generic paths/providers become
authority.** An external CRM status, gift webhook or optional workflow may reopen
work, cancel unrelated service or misinterpret terminal state. Current task and
permission seams are not yet qualified for D7 ([implementation](d7-evidence/implementation.md),
[ownership](d7-evidence/ownership.md)). **Retain A, narrow dependencies**,
R02/R07/R12–R14; AC08/14 prove delayed/duplicate/out-of-order external events have
only owner-authorized effects. Core owns cultivation; providers own their facts,
not cultivation closure. Reuse existing provider reconciliation; add no new
vendor, plugin, external write or status synchronization authority.

### 20. Migration, rollout, and upgrade risks

**Material concern: yes. High; plausible.** Old writers/readers can ignore closure,
backfills can invent donor outcomes, rollback can resurrect reminders, and restored
backups can expose redacted history. The generic current paths and D6 restore
contract substantiate the risk ([authorization](d7-evidence/authorization.md),
[implementation](d7-evidence/implementation.md)). **Amend activation requirements**,
R09/R10/R12/R14; AC13 tests N/N-1 writer fencing, explicit mappings, no catch-up
sends, kill switch and post-write rollback. Inventory retained data first; source
search found no D7 implementation, not proof every deployment is empty. Prefer
roll-forward repair and preserved receipts over destructive schema rollback.

### 21. Testability, traceability, and proof

**Material concern: yes. High; certain if the original sentence stands alone.**
“Close, keeping history” cannot consistently determine task outcomes, permission
boundaries, races or report meaning. No D7 implementation exists in inspected
paths. **Amend A into R01–R15 and AC01–AC16**, linked from Q7, the decision log and
glossary. Source/probe evidence is labeled separately from required application
proof. Future `/to-prd` must map these IDs into exact requirements/design/tasks;
`/to-issues` is separately required for tickets. Existing ADRs are referenced,
not duplicated. AC16 distinguishes this explicit ratification from published
OpenSpec, ticket coverage, implementation or release evidence that do not yet exist.

### 22. Other development hazards

**Material concern: no additional independent concern after the checks above.**
Unsafe defaults, repair/rollback, accountability, hidden retention obligations,
export portability, mixed versions and accidental new product scope are covered
by R03–R15. No required new package, external service, money field, deployment or
generic workflow abstraction was found. This is a bounded conclusion about D7,
not a certification of all Phase 27 or the repository. Preserve those gates and
AC13–AC16; no extra machinery is justified for this category.

## State, ownership and edge-case outcomes

These are semantic outcomes, not a proposed database enum or complete parent
lifecycle. D7 does not decide all possible reasons a journey may end.

| Situation                                                                     | Required result                                                                                                                                                                                           |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Genuinely no further current development work; actor and readiness qualified  | Accept one close; remove this effort from current work; preserve authorized history.                                                                                                                      |
| Useful review date/continuing work remains                                    | D6 dated pause or existing active-work behavior applies; do not close merely to clear a list.                                                                                                             |
| Continuing intent but no useful date                                          | No automatic conclusion. D7's no-work premise is not met; no new undated-hold state is authorized by this answer. Surface the truthful source condition rather than inventing a date or silently closing. |
| One declined ask; prayer/stewardship follow-through remains                   | Ask keeps its response; whole effort is not automatically closed.                                                                                                                                         |
| Prayer or financial partnership continues, with no remaining development work | Participation alone does not block closing this effort; its relationship and financial meanings survive unchanged.                                                                                        |
| Same work assigned to another lead                                            | Reassign through its authority; that does not prove the work ended.                                                                                                                                       |
| Source promise unresolved                                                     | Required owner disposition first; no blanket complete/cancel. A current filtered empty list is insufficient.                                                                                              |
| Independent receipt/commitment/service task remains                           | Preserve its independently valid source and discoverability; no global block or automatic cancellation.                                                                                                   |
| Incomplete source check or protected readiness result                         | No false clean close; permitted retry/recovery or uniform unavailable path, with no hidden-detail/count/existence leak.                                                                                   |
| Review performed and decides End                                              | Accepted review can be Completed; closure remains its distinct source outcome.                                                                                                                            |
| Direct close before a future review                                           | Review becomes No longer required; original date/zone/history remain truthful.                                                                                                                            |
| Close races with new promise/task or review change                            | Both participate in the qualified fence; no closed effort with incompatible admitted work.                                                                                                                |
| Response lost after closure committed                                         | Recover same permitted receipt/time; distinguish later current state from that prior outcome.                                                                                                             |
| Projection fails or stale link opens                                          | Source truth governs applicability; authorized reconciliation is visible; old link cannot perform a mutation or revive work.                                                                              |
| New gift/referral/import after close                                          | Its source processes valid native effects; cultivation stays closed without deliberate new action.                                                                                                        |
| Same supporter, other ministry or independent purpose                         | Other scope and portfolio assignments remain unchanged.                                                                                                                                                   |
| Ministry personnel changes or Party correction                                | Existing D2/P9 identity/history authority applies; no silent rebinding or union of permissions.                                                                                                           |
| Mistaken close or later legitimate return                                     | Preserve accepted history; use the subsequent qualified correction/return policy. No preselected generic undo, automatic new parent or automatic reopening.                                               |
| Permission revoked; actor anonymized; content erased                          | Current read/egress restrictions apply; keep only permitted structural evidence. Closing is not a retention override.                                                                                     |
| Restore from before close or revocation                                       | Reconcile current terminal/effect/access/content fences before affected readers and workers resume.                                                                                                       |

## Falsifiable acceptance criteria

These are **required later application proofs**, not results of the two small
evidence harnesses. Fixtures must cover real effective database roles and source
paths, not only mocks of the desired decision.

| ID                                | Independently observable pass condition                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 — Meaning                    | Agency staff and support-raising missionaries distinguish finished effort, declined ask, dated pause and continuing event-dependent intent in fictional church/prayer/multiple-ministry cases. Continuing prayer/giving without further development work does not itself block closure; actual promised follow-through does. Close is not selected solely to avoid choosing a date. Any comprehension failure changes the language/flow before release; no measured pilot is claimed now. |
| AC02 — Scope                      | Close one Party/ministry/purpose effort. Party/ministry lifecycle, observed stage, ask response, assignment-derived portfolio, gifts, commitments, recognition, contact restrictions and other efforts remain unchanged. No last-contact or successful-ask increment occurs.                                                                                                                                                                                                              |
| AC03 — Obligations                | Later pages, filtered/hidden relevant promises, pending asks and changed source facts cannot pass a false empty check. Valid independent work survives with an owner and retrieval route; reassigning this same continuing work does not clear it. Unknown checks fail safely.                                                                                                                                                                                                            |
| AC04 — Result authority           | Test permitted multi-entity scope, wrong Tenant/entity, departed lead, role/epoch change, service and human contexts. In paired protected-obligation-present/absent fixtures where result authority is missing, action availability and response do not reveal protected existence. Permitted blockers disclose only approved fields.                                                                                                                                                     |
| AC05 — Concurrency                | Real transactions exercise both orders of close/new work, close/review change, close/authority change and duplicate close. No two individually valid writes jointly strand required work. Inventory and exercise all alternate API/RPC/job/import/repair writers, not just the UI command.                                                                                                                                                                                                |
| AC06 — Durable result             | Lose the response after commit, retry at a different time, reuse a key with changed payload and replay after a later source transition or access loss. Exactly one accepted effect remains; original receipt/actor/time do not change; current authority governs result disclosure.                                                                                                                                                                                                       |
| AC07 — Work/attention truth       | Actual Review→End is Completed; direct Close makes the future review No longer required. Independent task reasons survive. Close/admission races, expired leases, unread/read history and stale links yield no new obsolete attention, false completion or false recall.                                                                                                                                                                                                                  |
| AC08 — Later events               | Repeated/out-of-order gifts, messages, referrals/imports and elapsed time do not resume cultivation. Qualified finance/receipt/service effects still work. Neither optional Studio nor provider outage controls native closure.                                                                                                                                                                                                                                                           |
| AC09 — Database safety            | Inspect actual keys/FKs/nullability/defaults/checks/indexes/grants/policies/functions/views/storage. Exercise SELECT/INSERT/UPDATE/DELETE/UPSERT/RETURNING/RPC and service-role paths with hostile source/tenant/actor changes. Both old and resulting rows stay permitted; generic task edits cannot bypass source closure or destroy evidence.                                                                                                                                          |
| AC10 — History/privacy/reporting  | Permitted closed-work history is findable; all current count drill-downs match applicable rows. Completed versus no-longer-required remains distinct, period facts do not drift and donor outcomes do not change. Revocation/redaction/anonymization reaches permitted exports/search/logs/audit/generated artifacts; required structural evidence survives ordinary deletion without retaining prohibited bodies.                                                                        |
| AC11 — Usability/accessibility    | Verify actual keyboard/screen-reader flow, focus after row removal, status/error announcements, 320 CSS-pixel reflow, zoom, touch targets, long/RTL labels and low-bandwidth lost-response recovery. No extra donor checkout/public workflow appears. No important consequence exists only in a toast or color.                                                                                                                                                                           |
| AC12 — Performance/failure/repair | Declare realistic volumes/fan-out/concurrency, query plans and measured latency/error acceptance before activation. Boundary/overload/partial-read cases cannot produce false readiness; authorized operators identify and repair failed projection from the accepted receipt without repeating the effect or direct SQL surgery.                                                                                                                                                         |
| AC13 — Migration/restore          | Test actual retained-data mappings, old/new code combinations, worker leases, feature gating, kill switch, rollback after accepted writes and restore before close/revocation/redaction. No inferred archive→closure, historical sends, revived work/access or erased accepted history.                                                                                                                                                                                                   |
| AC14 — Dependency/scope           | Owner contracts name exact closure-relevant dependencies and surviving obligations. No all-Core scan, new approval authority, duplicate task/notification store or vendor ownership is introduced. External disagreement goes to its existing source reconciliation, not a cultivation status override.                                                                                                                                                                                   |
| AC15 — Lifetime gate              | Before schema/activation, explicitly resolve same-enrollment/successor, mistaken-close correction and collision behavior against D3. Both permitted later source actions preserve prior closure/child outcomes. Reject any implementation that silently infers lifetime uniqueness or generic Undo from D7.                                                                                                                                                                               |
| AC16 — Traceability               | Confirm selected/ratified status and wording across grill log, Q7, glossary and this review. After explicit `/to-prd` and `/to-issues`, map R/AC IDs to governing references, OpenSpec/design/tasks/tickets, code/tests and release proof. No source/mock/mechanics test is represented as completed application qualification.                                                                                                                                                           |

## What was actually tested

**Ten tests passed in four files:** four existing CRM identity tests, one existing
command-log test, four existing CRM query tests and one new actual-helper replay
counterexample. The last uses a synthetic storage dependency and two controlled
clocks; it proves that the inspected helper rewrites task completion time on a
repeat approved outcome. It does not mutate a live table or prove a D7 defect.
[Results and reproduction](d7-evidence/source-probe/README.md) record Node
24.19.0/installed Vitest 4.1.4 versus declared Vitest 5.0.3 and the scoped config.
The earlier normal-config Sentry failure was not repaired or claimed to pass.

**Six controlled PostgreSQL 17.11 checks passed:** a weak parent lock plus FK
allows concurrent new work; a stale close then produces an invalid toy outcome;
both cooperating-writer race orders block/recheck and preserve the invariant.
Explicit barriers and observed database lock waits establish ordering. The pinned
container had no network, host ports or mounts; cleanup is verified in
[run metadata](d7-evidence/closure-race-probe/run-metadata.json). The generic
fixture is not a proposed schema. [Results and reproduction](d7-evidence/closure-race-probe/README.md)
show one adequate mechanism, not complete writer coverage or a required SQL recipe.

Five evidence appendices independently examined owner contracts, source code,
authorization, UX and ministry practice. Published source dates and retrieval
limits are recorded. Their proposed/pending labels describe the research-time
status before the founder's subsequent ratification recorded in this review.
No new hosted database, donor, provider, permission, message,
GitHub issue or product implementation was changed. No live RLS, browser,
accessibility, load, restore or D7 end-to-end test is claimed. Earlier D3/D4/D6
checks are prior evidence and are not counted again.

Three independent synthesis reviews checked ownership/lifetime, authorization
and UX. They corrected the distinction between continuing participation and
remaining staff work, limited readiness disclosure to its authorized projection,
and allowed complete owner-qualified enumeration while rejecting partial lists.
Documentation checks verify all 22 category verdicts, 15 requirement clauses,
16 acceptance criteria, the seven required adversarial headings, local links,
formatting and whitespace. These checks establish document consistency, not
application correctness.

## Ordered synthesis and disposition

**Final disposition: Accept with required amendments.** The permanent path is one
source-owned close action with truthful history and qualified shared projections.
Reject deletion, Party archive, fake completion and a new closure platform.

1. **Ratification completed 2026-10-10:** the founder adopted the exact corrected
   decision above, including its no-remaining-work premise, bounded obligation/
   readiness authority, truthful history and no automatic restart. The explicit
   confirmation is recorded in the decision log and glossary; no further D7
   approval is required.
2. **Next interview dependency:** decide deliberate later return and mistaken-close
   correction, including same enrollment versus linked successor. Then reconcile
   D3's ordinary-purpose rule and collisions. This is necessary before physical
   lifetime uniqueness; it does not invalidate closure of the current effort.
3. **Specification/design, after the requested workflow is invoked:** carry R01–R15
   and AC01–AC16 into traceable requirements; bind the exact P27/P9/P12/readiness
   powers and affected source dispositions, D6 task/attention end semantics,
   retention/read models and current-authority recovery. Do not build an all-domain
   obligation engine or inherit another phase's permissions.
4. **Implementation safeguards before activation:** prove all writers share the
   source fence, stable receipts/attribution, effective grants/RLS and current
   result/history disclosure. Qualify list/count/source consistency, source-ended
   attention, supported repair, mixed-version activation/rollback/restore and
   realistic performance. Missing source authority or application proof is a
   release blocker, not something to monitor after launch.
5. **Residual monitoring only after qualification:** use the specific signals below
   through existing authorized observability. No new default staff/donor message
   stream is created. Assignment of operational responsibility must be accepted
   by these owner functions before activation; no named individual's consent is
   fabricated by this document.

| Signal                                                                                                   | Threshold                                                               | Accountable owner function                        | Required response                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Incompatible new work or obsolete review attention admitted after accepted closure                       | Any confirmed occurrence (1)                                            | P27 source owner with shared-work/P6/P17 owner    | Disable affected admission path; preserve receipt/evidence; repair source-derived projection and requalify missed writer/fence before re-enabling.                                   |
| Required surviving obligation loses valid accountability or discoverability                              | Any confirmed occurrence (1)                                            | The obligation's source owner, coordinated by P27 | Restore through authorized owner command; block affected close path until its survival/disposition contract is corrected.                                                            |
| Accepted closure has required projection in a terminal error after the platform's qualified retry policy | Any terminal error (1); retry policy must be declared before activation | Shared-work/platform operations owner             | Reconcile from durable accepted intent; expose permitted repair status; never rerun the business close. Source-applicability protection applies immediately regardless of retry age. |
| Closed/no-longer-required work still appears as currently required or changes success/contact totals     | Any reproducible discrepancy (1)                                        | P27 read-model/reporting owner                    | Correct predicate/projection; invalidate affected cached result; verify matching drill-down/history. Stop affected reporting if meaning is unreliable.                               |
| Protected closure/readiness/history data disclosed or restored contrary to current authority/erasure     | Any confirmed occurrence (1)                                            | P12/security owner plus affected data owner       | Contain affected surface/worker, apply existing incident process, repair the authority/content fence and requalify before return.                                                    |

These are invariant/error thresholds, not promises of zero operational incidents
or latency SLOs. Performance and backlog limits remain AC12 pre-activation proof
obligations, not an unspecified “monitor later” disposition. No arbitrary closure
cadence is added.

## Adversarial check

### What could go wrong with this answer?

“Close” could erase a relationship, strand a promise, fabricate completed work,
leak private obligations or revive stale attention on retry. R01–R15 address these
with existing source ownership, current authority, durable history and tested
concurrency mechanics; application qualification remains required.

### What hidden assumptions are we making?

The premise is no meaningful current work, not simply no date. Actual users must
understand that distinction. Complete safe readiness must be qualified by owners;
neither an empty task list nor a read-all service query establishes it. No actual
agency workflow or measured benefit is invented.

### How does this affect the whole product?

P27 closes its effort; P9 identity/assignments/shared tasks, P12 authority,
P6/P17 attention and finance/consent retain their meanings. P28 receives only
authorized projections. Optional workflows and external providers gain no new
write authority, and no second work/history engine is introduced.

### How does this affect the end-user experience?

Staff can clear genuinely finished development work without fake dates or donor
contact and can find its history later. Actual obligations remain visible and
accountable. Plain contextual language and truthful completed/no-longer-required
outcomes reduce confusion; accessible rendered testing is still necessary.

### Does this follow modern best practices?

Official CRM documentation supports separating contact, solicitation, task and
financial meanings and preserving discoverable history. Missions sources
recognize prayer, friendship and practical support. Neither proves a universal
closure policy. PostgreSQL mechanics and WCAG guidance support specific safeguards
without requiring a generic workflow engine or cumbersome wizard.

### Does this fit Asym’s existing repo and product direction?

Yes, with the exact amendments and qualification gates. It follows the governing
owners and ratified D1–D6 boundaries. Current prototype task paths, coarse auth
and replay/delete behavior are implementation evidence to improve, not authority
to weaken the accepted design. No new ADR is needed merely to repeat existing
source/task/notification decisions.

### Should we adjust the recommendation?

The recommendation was **accept A with the exact amended D7 above**, and the
founder explicitly ratified it on 2026-10-10. No further amendment is identified
by recording that acceptance. Continue with the next plain-language lifetime
question. Do not claim the full phase, formal
specification or implementation is complete because this decision review is.
