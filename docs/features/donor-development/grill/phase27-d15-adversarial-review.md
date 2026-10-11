# Phase 27 D15 — retire a stage list without disrupting existing work

2026-10-10 UTC. **Amended D15 explicitly ratified; review disposition: Accept with required amendments.**
The founder wants existing work to continue using the list, tenant flexibility and
excellent, clear UX/UI. This review concerns the developing Phase 27 interview
against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`. It does not declare
implementation, activation or full-phase readiness. The founder subsequently
instructed, “Yes, ratify this amended D15.” The exact corrected decision and
reviewed safeguards below are explicitly ratified on 2026-10-10.
[Q16](phase27-q16-list-applicability.md) subsequently selected shared approved
choices, explicitly ratified in D16. D15 itself inferred no applicability,
default or switching answer.

## Exact corrected decision

> **D15 — Withdraw a stage list from new work while keeping existing work usable.**
> An authorized organization configurator may stop offering a stage list for new
> partnership work. Existing journeys currently using it keep that same list and
> recorded stage, or their valid “Not yet assessed” condition. Authorized people
> can continue setting or changing their stage using its available stages.
> Individually retired stages remain unavailable for fresh selection.
>
> Returning to the same paused or closed journey follows the same rule, subject
> to its normal resume/reopen requirements and current permissions. This does not
> create a new journey, reassess it, revive ended tasks or grant access. Prior
> historical use alone does not permit a new journey or a new attachment to the
> withdrawn list.
>
> Retirement is reversible: an authorized configurator may make that same list
> available for new work again, preserving its identity and configuration history.
> This does not restore individually retired stages or change existing work.
> Saved lists, including unused mistakes, are retained and withdrawn through
> ordinary controls rather than deleted; separately governed retention or erasure
> remains available under its own rules.
> Every list retained for continued use must retain at least one selectable stage;
> replacing its last available stage must leave a usable list in the same accepted
> configuration change.
>
> An organization may deliberately leave an applicable scope with no list
> available for new work, after explicitly handling any real required default or
> dependency. Existing work continues. Starting new work then clearly explains
> the unavailable configuration and the permitted way to resolve it; it never
> guesses another list or treats “Not yet assessed” as a missing-list substitute.
>
> Use clear wording such as “Unavailable for new work.” Explain that existing
> partnerships can still use the list. Keep normal stage controls and follow-up
> usable, show relevant list context, and make the administrative reversal easy
> to find. Preserve lawful history, truthful save/retry outcomes and current
> authorization. Retirement does not close, hide, migrate or duplicate journeys;
> change giving or consent; cancel follow-up; or contact anyone.

**What changes beyond the offered A:** the explicit same-journey return policy,
same-identity reversal with retention of saved lists, usable-stage minimum for
retained lists, and deliberate
zero-new-list state. Q15 expressly reserved these cases. They are practical,
small additions, now explicitly ratified with the reviewed decision. The remaining clauses
make the selected A precise or carry forward D1–D14 safeguards.

## Evidence, authority and limits

| Evidence                                                       | What it establishes                                                                                                                |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d15-evidence/ownership.md)                         | Owning ADR/OpenSpec/P27/P28 contracts, D8–D14, the genuinely new policy choices and source invariants.                             |
| [Authorization](d15-evidence/authorization.md)                 | P12 context, configuration versus journey access, dependency-result disclosure, references, RLS/grants and acceptance fences.      |
| [Implementation and mechanics](d15-evidence/implementation.md) | Bounded current-source inspection, unsafe reuse patterns and newly executed isolated PostgreSQL evidence with limits.              |
| [UX](d15-evidence/ux.md)                                       | Core's shared UI, precise interaction states, mobile/accessibility requirements and primary comparator evidence.                   |
| [Ministry evidence](d15-evidence/ministry.md)                  | Christian missions relevance, nonprofit comparisons, the strongest alternative and the absence of direct user-validation evidence. |

**Repository facts:** [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
keeps CRM truth in Asym Postgres. [P27](../../../prds/sitestacker-parity/roadmap.md:4087)
owns cultivation; P28 consumes that model. P9 owns identity, assignments and shared
tasks, P12 authorization, P33 governed reporting. Finance and communication owners
retain their facts. [The API boundary](../../../guides/architecture/data-access-boundary.md)
keeps multi-table business commands server-owned. D10 retirement concerns a stage,
not a list; D14 did not select a whole-list lifecycle. No external practice
supersedes these decisions.

**Current behavior:** the inspected source contains CRM donor-status controls,
personal saved views, generic table mutations and shared UI components. These are
not a qualified P27 list-retirement command. The bounded search does not establish
what every deployment contains. In particular, an active-only lookup, client
filter or generic row update cannot establish the intended D15 behavior.

**External verified facts:** Salesforce documents deactivating record types while
retaining existing records' types; CiviCRM documents disabling relationship types
without removing existing relationships. Those are useful analogues for separating
new choice from retained context. They do not prove continued editing for Core's
stage lists. Sources and edition/date limits are in the ministry appendix. Pelf's
warning about configuration damaging historical interpretation supports preserving
identity, not copying its case model. The OMF account demonstrates one long-lived
church partnership, not a universal agency software workflow.

**Technical facts:** PostgreSQL distinguishes row privileges from business
eligibility. Its [RLS documentation](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
also documents implicit WITH CHECK inheritance and referential-check disclosure
risks. Its [locking contract](https://www.postgresql.org/docs/17/explicit-locking.html)
does not make a key-share lock conflict with every non-key update. A foreign key
alone therefore cannot fence admission against a changed availability flag.
The current [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
was retrieved through its documentation tool. Effective roles, policies and grants
must be tested together; no blanket “missing WITH CHECK means bypass,” “all views
bypass,” or “every definer bypasses” claim is used here.

The Supabase changelog was checked on 2026-10-10, including the
[15.19/17.11 upgrade notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes).
Its extension/operator upgrade conditions do not select D15 architecture. This
review uses no such dependency and makes no claim about the live project's version
or unaffected status. Hosted capability qualification remains required.

**Judgments and unknowns:** continuity is the selected product policy. Same-ID
reversal and a usable retained catalog are the recommended minimal permanent
solution. No actual tenant workload, observed failure rate, staff usability study
or production P27 test was supplied. Severity/likelihood below are prospective
engineering judgments, not measured incident probabilities. Unknown implementation
evidence becomes a release gate, never a claim of proven safety.

## Strongest alternative and sufficient scope

B would stop new use and require a deliberate move to a current list before the
next stage change. Its strongest benefit is a consistently taught organizational
process. Its costs are extra work, a qualified switching/mapping dependency and
potentially interrupted ordinary updates. A fits the founder's preference for
continuity. Choosing A does not add a toggle for B or forbid later independently
qualified deliberate switching.

Leaving obsolete lists selectable is simpler to build but fails the stated
problem. Deleting lists, copying journeys or mass-migrating them corrupts meaning
or adds unnecessary work. Freezing a separate copy of the list per journey adds
another configuration authority. A small reversible availability rule, stable
references and the existing stage editor suffice. No pipeline engine, archive
service, scheduled sunset, new approval queue, per-list ACL system, grandfathering
flags on every journey or retirement-triggered migration task is required.

Long-lived work need not naturally drain from an old list. Keep obsolete choices
out of new-work pickers while retaining applicable work in normal work views.
Do not use forced expiration to manufacture administrative cleanliness.

## Concrete user experience

Use Core's `@asym/ui`, Base UI, base-maia and semantic tokens. Beauty here depends
on calm hierarchy, consistent spacing, legible names and predictable actions;
another visual system or a complex workflow diagram adds no value.

| Place/state                          | Required experience                                                                                                                                                                                                                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organization settings                | “Stage lists”; distinguish “Available for new work” and “Unavailable for new work.” Keep unavailable lists discoverable through a clear filter or section. Do not hide the list immediately after success.                                                                                                |
| Stop new use                         | One deliberate action with a concise consequence statement: “New partnership work will no longer use this list. Existing work can continue using it.” Use the shared settings save pattern, not an extra approval ceremony or mandatory rationale. No automatic action on merely opening/toggling a menu. |
| Make available again                 | Clearly named reverse action on the same list; current validation and authority apply. Do not imply that stages, defaults, tasks or integrations will also be restored.                                                                                                                                   |
| Existing assessed work               | Current stage, lead and next action remain prominent. Change stage continues normally. Subordinate list context can say “Unavailable for new work · Still usable here.” No blocking banner or repeated acknowledgment.                                                                                    |
| Existing unassessed work             | “Not yet assessed” with the normal authorized Set stage action. List withdrawal neither manufactures an assessment nor disables the first one.                                                                                                                                                            |
| Individual retired current stage     | Keep its recorded label/history visible as permitted, explain that it is no longer selectable, and offer available choices. Keeping the recorded value is not a fresh selection.                                                                                                                          |
| New-work picker                      | Offer only currently applicable, admission-eligible lists. Do not load obsolete choices and silently preselect the first remaining item. Preserve other entered form data when a stale selection becomes invalid.                                                                                         |
| No eligible list                     | “No stage list is available for new partnership work.” A currently authorized configurator gets a relevant settings action; other users get the organization's existing help route or plain instruction to contact its administrator. No invented request queue or permission grant.                      |
| Configuration conflict               | Keep proposed edits, refresh current source state and explain the specific permitted conflict. Do not overwrite a newer change or relabel it as a successful save.                                                                                                                                        |
| Lost response                        | “We couldn't confirm whether the change was saved.” Reconcile/retry the same intent, then show the accepted result and current state as distinct facts if they differ. Closing a dialog is not undo.                                                                                                      |
| Permission lost / source unavailable | Show only the currently permitted outcome. Neither becomes an empty catalog, “Not yet assessed,” a guessed replacement or a reason to reveal hidden dependencies.                                                                                                                                         |
| Legacy invalid zero-stage list       | Retain the journey and unrelated work. Explain unavailable stage choices and offer permitted repair. Do not invent an assessment, automatic restore or forced migration.                                                                                                                                  |

International names, long translated labels and RTL must not be truncated into
indistinguishable choices. Accessible names, textual status, visible focus,
keyboard/screen-reader operation and pointer alternatives must survive narrow
layouts and zoom. Follow Core's touch-target convention; test 200% text resizing
and 320 CSS-pixel reflow as distinct cases. Errors and accepted results cannot be
color-only, hover-only or fleeting toasts. No drag is needed for availability;
existing stage reorder retains its non-drag option. Test soft keyboards, reduced
motion and low-bandwidth retry without claiming offline editing support.

No donor/public controls or checkout steps follow. Authorized staff and missionary
surfaces share the same source meaning, with different permitted actions where
appropriate. Financial/prayer participation and international address/name rules
remain with their owners. Render actor/history dates in the user's context; list
eligibility does not change at local midnight or because an input date is backdated.

## Exact requirements to carry forward

**R01 — Two different eligibility questions.** The source SHALL distinguish
whether a list may be attached to new work from whether currently attached existing
work may continue using its stages. Whole-list withdrawal SHALL affect the former,
not globally hide definitions or reject the latter. It SHALL NOT itself retire any
stage. Configuration and record mutations remain separate commands and facts.

**R02 — Existing means current source binding.** Continued use SHALL be established
from the same authorized journey's current retained list binding. New sessions,
staff transfers, new tasks or later asks on that journey do not make it new work.
An actor's prior use, a donor's other journey, copied input, historical attachment,
caller-supplied existing flag or backdated date SHALL NOT bypass fresh admission
or attachment checks. A future switch away and back is a new attachment to the
target, not continued use. D3 identity/reuse collisions must resolve before
admission classification, without exposing hidden work or resetting reused stage.

**R03 — Return and assessment continuity (amendment).** Qualified resume/reopen
of the same journey SHALL retain its list, last recorded stage or valid absence,
and eligibility to choose that list's available stages. D6–D9 return requirements,
current authority and new next-work obligations remain. Previously ended child
work SHALL not revive. D12 direct movement and D13 first assessment remain valid;
return alone creates no assessment, stage event or changed stage-entry time. This
does not authorize ordinary stage mutation while work remains closed or an
unselected bypass of paused-work policy.

**R04 — Simple reversible list availability (amendment).** Authorized commands
SHALL stop or allow new use on the same stable list identity, recording each real
change. Restoration SHALL validate current configuration, applicable naming constraints
and dependencies; it SHALL
not restore child stages, defaults, former grants or consumed effects. Configuration
edits under D10 remain possible while withdrawn. Persisted lists, including unused
mistakes, SHALL use withdrawal through ordinary administration, not destructive
delete; cancellation before creation commits creates nothing. No extra draft,
publish, archive, expiry or approval lifecycle is introduced. Materially changed
meaning still needs appropriate new identity under D10, not restoration as reuse.
Any current name conflict receives permitted explicit resolution or rejection;
never silently rename, merge identities or assume retired-name reuse. D14 owns
the qualified naming policy; D15 introduces no new namespace.

**R05 — Usable retained catalog (amendment).** Every list offered for new use OR
retained for continued use SHALL contain at least one selectable stage. The rule
SHALL depend on catalog validity, not counts of visible, active or historical
journeys. Removing the last selectable stage SHALL require an explicitly chosen
valid replacement within the same accepted configuration change; it SHALL NOT
automatically restore or manufacture one. Concurrency must preserve this invariant
across separate stage edits. Legacy corruption/import gaps SHALL be diagnosed
without hiding existing work, fabricating history or preventing unrelated work;
qualified configuration repair is required before a stage can be selected.

**R06 — Zero new-work choices and dependency treatment (amendment).** An authorized
organization MAY deliberately leave an owner-qualified applicability scope with
no admission-eligible lists. Existing work SHALL remain usable. No-list admission
SHALL fail clearly before creating partial work; a missing stage is not a missing
list. For actual supported defaults, rules or required references, the accepted
withdrawal SHALL require explicit valid removal, replacement or disabling of the
dependent entry path under its owner's contract. A dependency may first be repaired
through its owner's authorized command; withdrawal then revalidates the authoritative
result under the qualified acceptance fence. Joint atomic treatment is required
only where the supported owner boundary provides it. Otherwise reject pending
repair; do not accept an invalid intermediate configuration or build a distributed
repair engine. If no authorized valid treatment exists, do not accept withdrawal.
Do not guess a default or create a default/assignment engine.
Restoring availability SHALL not silently re-establish removed references.

**R07 — Current authority and safe disclosure.** Server commands SHALL derive
tenant, principal, context and attribution from trusted context, and validate
caller targets against current P12 capability, source/entity scope, processing
purpose, field/history floors, residency and policy epoch. Configuration power
SHALL NOT grant journey mutation, history, aggregate or affected-user access.
Before a validation result can reveal hidden default/dependency presence, establish
independent authority for that bounded readiness result in both present and absent
cases. Otherwise return the same permitted unavailable outcome. Source checks may
enforce hidden invariants internally without exposing their rows. No raw FK/error,
count, timing shortcut or privileged repair path may become a disclosure channel.
Authorization/revocation and eligibility SHALL be fenced at acceptance, not checked
only in a prior UI request; reads and replay disclosure use current authority.

**R08 — Relational, RLS and command boundary.** Stable list and stage references
SHALL preserve tenant/list membership through suitable primary/unique/composite
foreign keys and immutable scope binding. Required tenant/list scope SHALL be
enforced independently of nullable stage. Retained references SHALL NOT cascade
delete, SET NULL, reparent or depend on a list always being admission-eligible.
Availability SHALL have an explicit valid value; null/unknown is not available.
Effective table/column/function grants, exposed schemas, RLS USING and WITH CHECK
semantics, SELECT visibility, views, RPC owner/search path and service-role bypass
paths SHALL preserve the same boundaries. RLS is not a replacement for transition
or column invariants. UI/API/jobs/imports/repair cannot update availability or
retained history around the authoritative command. No new storage or money fields
are required; existing storage/export policies remain applicable where consumed.

**R09 — Atomic acceptance and ordered races.** A configuration command SHALL
validate the expected current configuration revision and atomically commit the
accepted change, required configuration history, durable business-effect result
and required projection intent. Ordinary journey stage changes retain their own
expected revision and atomic source/history contract. Withdrawal, restoration,
new admission/attachment, stage availability changes and relevant dependencies
SHALL share an acceptance protocol that establishes an actual valid order.
Admission accepted first remains existing work; withdrawal accepted first blocks
new use. Existing eligible stage choice SHALL not fail solely because withdrawal
occurred. An FK, detached precheck or nonconflicting key-share lock is insufficient.
For D4 reviewed groups, evaluate each still-unaccepted member at its actual
acceptance: earlier accepted members remain, while later ineligible members are
reported without retargeting, expanding the reviewed group or undoing successful
members. Reuse/replay follows its existing-source contract.
Use a suitable conflict/recheck protocol; choose physical lock/isolation details
in qualified design, with consistent ordering and bounded retry, not global locks.

**R10 — Durable retry and temporal truth.** Idempotency SHALL identify the durable
business intent and normalized payload, not just a freshly generated transport
request. Same intent recovers its original authorized result without repeating
history/effects; changed payload under that intent conflicts. Same-state new
intent is a no-op, not a new retirement/restoration event. A newer opposite change
does not permit replay of an old intent to overwrite it. Expected revisions detect
ABA changes. Accepted order is source revision/transaction order, not client dates,
timestamp-only comparison or local time zones. Backdated import/correction cannot
masquerade as prior admission; any historical preservation path needs explicit
source-owned qualification. Precommit failure leaves no accepted partial result;
postcommit lost response reconciles, and secondary projection failure cannot undo
source truth. Undo after acceptance is a new authorized inverse command.

**R11 — Preserve independent facts and ordinary visibility.** Retirement and
restoration SHALL NOT emit an enrollment/assessment transition, create a new
journey, change stage/history/owner, restart clocks, close or pause work, cancel
tasks, send messages, or alter gifts, commitments, recognition, consent or prayer
participation. Existing source follow-up remains in the shared Tasks Hub. Native
functionality SHALL NOT require Workflow Studio, a CRM plugin or a donor action.
DON-14's enrollment/transition contract is not a list-configuration trigger.

**R12 — Read models, privacy and reporting.** Existing permitted work SHALL remain
in normal scoped work views, history, searches and reporting regardless of list
availability for new work. Only the new-choice catalog is filtered that way.
Counts must reflect their declared authorized scope; partial/failed reads are not
zero. Identity/meaning survives same labels and later reordering; retirement is
not relationship progress. Revalidate permission/context on caches, export jobs,
generated documents and replay; no shared cache key may omit relevant tenant and
authorization context. Names/guidance may be sensitive: minimize copied details,
escape displayed text, qualify export encoding and keep protected content out of
logs. Lawful retention/redaction overrides indefinite personal-content retention
while preserving required non-sensitive integrity and provenance.

**R13 — Coherent actionable UI.** Implement the concrete states above through
the shared Core components. Always distinguish current source state, unsaved
proposal, accepted historical result and failed/unconfirmed save. Explain why a
control is unavailable when permitted, and provide a currently authorized next
action. Do not show controls that imply automatic mapping, grants or donor contact.
Preserve unaffected form input on stale-choice failure. No mandatory essay,
duplicate confirmation, accessibility regression or repeated acknowledgment follows
from routine use of a withdrawn list. UI must not select business defaults.

**R14 — Compatibility, migration and recovery.** Before activation, inventory
all new-choice and retained-reference readers/writers, integrations and jobs.
Deploy compatible schema and both classes of reader before enabling withdrawal;
fence old writers that ignore it and old readers that hide retained work. Backfill
only proved list identity/availability; do not infer from stage rank, donor status,
current visibility or timestamps. Unknown retained data requires qualified repair,
not guessed activation. Feature/command kill switches SHALL stop unsafe mutations
while preserving permitted existing reads/work where safe. Rollback cannot erase
accepted history or rely on code that treats every list as available. Prefer
compatible roll-forward; reconcile source revisions, receipts, current access and
redaction after restore before reactivation. Do not replay donor effects.

**R15 — Bounded scale and operations.** Withdrawal SHALL be a bounded catalog
change, not a rewrite of all journeys or an N+1 impact census. Use tenant/list-keyed
lookups, justified referencing-column indexes and bounded catalog/history queries.
Measure list/stage counts, retained histories, tenant skew, query plans, concurrent
commands and wait times in milliseconds before choosing capacities/SLOs. A list
may remain used for years; pagination and filters, not forced expiry, handle that.
Do not import vendor quotas or claim toy-test timing proves production capacity.
Supported withdrawal/reversal and configuration repair SHALL avoid routine direct
database edits; operational repair uses the same authority/audit principles.

**R16 — Traceability and proof.** Carry D15/R01–R16 and AC01–AC20 into the glossary
as appropriate, then the authorized `/to-prd` specification/design/tasks and later
`/to-issues` tickets, implementation, tests and release evidence. No product
release may substitute these interview docs or isolated mechanics for actual
P12/API/browser/migration proof. Retain distinct business configuration history,
security audit and technical diagnostics. No new ADR is necessary merely to
repeat existing source ownership; a real later owner conflict must be resolved
explicitly before dependent implementation.

## Full category review

Every category is evaluated independently. Concern ratings describe failures if
the selected sentence were implemented without its safeguards. “Changes” identifies
the proposed material additions above; “narrows” makes A's existing boundary exact;
“preserves” adds implementation proof without changing the product choice. Each
row names the permanent prevention and exact clauses/acceptance criteria.

| Category                                                      | Material concern, consequence, severity and likelihood                                                                                                                                                             | Evidence, effect on A and permanent prevention                                                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Problem validity, necessity, alternatives                  | **Yes. Medium; plausible.** Retention could be mistaken for endorsing every obsolete process forever, or B's standardization benefit ignored. This would add clutter or freeze an unnecessary migration facility.  | Q15, ministry evidence. **Narrows:** support continued use plus withdrawal, not a parallel-policy engine. R01/R04/R15; AC01/02/19. B is stronger only where standardization outweighs continuity; founder chose A. |
| 2. Brittleness                                                | **Yes. High; likely with a shared active-only helper.** One availability predicate reused for both choices and existing records would hide work or disable editing.                                                | Current-source/UX inspection and D14's one shared model. **Narrows:** separate the two questions at the source and all consumers, R01/R12/R14; AC01/02/15/18.                                                      |
| 3. Technical debt                                             | **Yes. Medium; plausible.** Per-journey catalog copies, grandfather flags, duplicate active-status columns or repeated app rules create divergent truth.                                                           | ADR-0001, API/platform boundaries. **Preserves:** one source availability fact plus current binding; no forked snapshots/engine, R01/R02/R08/R15; AC02/13/19.                                                      |
| 4. Edge cases                                                 | **Yes. High; plausible.** Unassessed, paused, reopened, zero-choice and accidentally withdrawn cases could strand staff.                                                                                           | D8–D14 expressly leave whole-list cases open. **Changes:** explicit return/reversal/usable-stage/zero-new-list behavior, R03–R06/R13; AC03–08.                                                                     |
| 5. Footguns                                                   | **Yes. High; plausible.** Misleading Delete/Archive, stale forms, first-option fallback or “undo” could erase context or attach fresh work to the wrong list.                                                      | D10/D14, comparator history warnings. **Narrows/changes recovery:** R02/R04/R06/R10/R13; AC05/08–11. Preserve data, one explicit action, durable reconciliation.                                                   |
| 6. Tenant safety                                              | **Yes. Critical; plausible in caches or privileged commands.** Foreign list/stage targets, cross-context caches or configurator impact counts could expose another tenant or entity.                               | P12 authorization appendix, composite-reference evidence. **Preserves:** exact source/tenant authority and scoped relations/read models, R07/R08/R12; AC12/13/15.                                                  |
| 7. Database, RLS and authorization safety                     | **Yes. Critical; plausible.** Mutable tenant/list IDs, null-scope escape, active-only RLS, broad RPC grants or stale auth could accept forbidden updates or conceal legitimate work.                               | PostgreSQL/Supabase docs and P12. **Narrows:** effective old/new-row, column and role checks plus atomic source command, R07–R10; AC09–14. No money/precision change is introduced.                                |
| 8. Overengineering                                            | **Yes. Medium; plausible.** A publish/archive engine, migration wizard, separate approval or usage-dependent retention machinery would burden a simple availability change.                                        | D14/Q15 scope and source contract review. **Narrows:** reversible availability, valid catalog and existing editor only, R04/R05/R15; AC05/07/19. No speculation-driven dependency.                                 |
| 9. UX/UI and friction                                         | **Yes. High; likely if “retired” stands alone.** Staff may think the missionary or partnership ended, lose options, or retry a committed command. Mobile/assistive users may miss status or recovery.              | Core UI rules, UX evidence, founder's explicit requirement. **Changes recovery; preserves A:** concrete state matrix and R13; AC01–08/11/16/20. Verify real task comprehension, not aesthetic claims.              |
| 10. Source of truth, ownership and invariants                 | **Yes. High; plausible.** New-choice projection could become authority, retirement could affect source tasks, or historical membership could permit reattachment.                                                  | ADR-0001/P9/P12/P27/P28/P33, D3/D14. **Narrows:** current binding, distinct availability, conserved work/history and source-owned acceptance, R01/R02/R08/R11/R12; AC02/09/13/15.                                  |
| 11. Hidden coupling                                           | **Yes. High; plausible.** Defaults, workflow bindings or generic stage-change listeners could silently reassign, create follow-up or block retirement on hidden records.                                           | P27/DON-14 and dependency evidence. **Changes valid zero-choice treatment:** R06/R07/R11; AC08/12/17. Qualify actual dependencies; do not invent new ones.                                                         |
| 12. Failure modes                                             | **Yes. High; plausible.** Partial configuration/history, lost response or stale projection could appear successful or cause duplicate reversal.                                                                    | PostgreSQL transactions, D10–D14 durable-effect contracts. **Preserves:** atomic required write and receipt, current-authority reconciliation, R09/R10/R13; AC10/11/14.                                            |
| 13. Lifecycle, temporal correctness, concurrency, idempotency | **Yes. High; likely without coordination.** Admission can race withdrawal; two stage edits can remove the final option; old retry can overwrite restoration; dates can fake prior use.                             | PG locking and new mechanics evidence, D10 revision semantics. **Changes lifecycle; narrows acceptance:** R02–R06/R09/R10; AC05/07/09–11/14.                                                                       |
| 14. Data integrity                                            | **Yes. High; plausible.** Cascades, SET NULL, name-based mapping, same-purpose copies or malformed imports can lose context or manufacture eligibility.                                                            | D3/D10–D14 and relational/source inspection. **Preserves:** stable composite references, no implicit migration, qualified import and repair, R02/R08/R10/R14; AC09/13/18.                                          |
| 15. Security and privacy                                      | **Yes. Critical; plausible.** Retirement is mistaken for security revocation; retained names/history/exports or affected counts expose sensitive missionary work.                                                  | P12, ministry/privacy evidence. **Narrows:** continuing use never overrides present access; independently authorized disclosure and lawful retention, R07/R12; AC12/15/17.                                         |
| 16. Scalability and performance                               | **Yes. Medium; plausible with long-lived catalogs or global locks.** Per-retirement journey scans, mass updates or catalog-wide contention degrade larger tenants.                                                 | PG locking and source-query analysis; no actual workload supplied. **Preserves:** bounded list-scope changes, measured indexes/queries/concurrency, R09/R15; AC19. No invented capacity or latency claim.          |
| 17. Operational burden                                        | **Yes. Medium; plausible.** Irreversible mistakes or zero choices could need developer SQL, while automated cleanup could destroy useful configuration.                                                            | Q15 recovery reservation, ministry continuity. **Changes:** same-ID reversal and valid configuration repair; no automatic expiry, R04–R06/R15; AC05–08/18.                                                         |
| 18. Observability and auditability                            | **Yes. High; plausible.** A mutable flag/log alone cannot explain who withdrew/restored, whether retry succeeded, or why a stage action failed.                                                                    | D10–D14 accepted history/result requirements. **Preserves:** separate durable business evidence, security events and diagnostics, R09/R10/R16; AC10/11/14/17 and monitor table.                                    |
| 19. Dependencies and integrations                             | **Yes. High; plausible if consumer semantics are copied.** A vendor's delete/disable behavior or an old import/workflow can override Core's retained-use policy.                                                   | CRM/CiviCRM comparisons, DON-14 and ADR-0001. **Narrows:** Core owns availability; every adapter follows source checks, R02/R08/R11/R14; AC09/17/18. No new provider is required.                                  |
| 20. Migration, rollout and upgrade                            | **Yes. High; plausible.** Mixed versions can admit onto withdrawn lists or hide existing work; rollback can erase state or replay effects.                                                                         | Current source lacks qualified D15 path; dynamic-list compatibility is unproved. **Preserves:** compatibility-first activation, conservative backfill and roll-forward/restore fencing, R14; AC18/19.              |
| 21. Testability, traceability and proof                       | **Yes. High; certain evidence gap before implementation.** The short answer lacks falsifiable return/zero-choice/race criteria; toy SQL cannot prove UX or P12.                                                    | Q15 explicit reservations and actual evidence limits. **Changes precision:** R01–R16, AC01–AC20 and artifact trace below; no phase-ready claim.                                                                    |
| 22. Other development hazards                                 | **No additional material concern beyond those above.** Checked physical state names, new money/storage obligations, optional workflow dependencies, donor/public side effects, retention promises and scope creep. | No new financial, public or workflow authority is necessary. R04/R08/R11/R16 keep those boundaries explicit; their identified risks are already covered in categories 7/11/15/19/20.                               |

## Acceptance criteria and release proof

These are outcome tests, not assertions that the proposed implementation already
exists. Run through real source commands and all applicable API/job/import doors,
actual roles and UI—not only a privileged fixture.

| ID   | Falsifiable required result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC01 | Withdraw an available list: new admission cannot use it, while previously attached assessed work can select available stages forward, backward or by skipping. One normal stage event records an actual change; withdrawal creates none.                                                                                                                                                                                                                                                                                                                     |
| AC02 | Existing work remains in authorized staff/missionary lists, boards, search and reports with the same journey, list, stage, lead and due work. No gifts, consent, task or contact effects occur.                                                                                                                                                                                                                                                                                                                                                              |
| AC03 | Existing unassessed work can make its first later assessment on the withdrawn list; no fabricated initial stage/date or compulsory review is added.                                                                                                                                                                                                                                                                                                                                                                                                          |
| AC04 | Resume/reopen the same eligible journey on its withdrawn list: current source binding and stage/absence survive; later stage choice works. Prior ended tasks remain ended. Current permission/return requirements still apply.                                                                                                                                                                                                                                                                                                                               |
| AC05 | Restore availability on the same list ID; one configuration event records the real change. Individually retired stages/defaults/grants/tasks remain unchanged. New admission becomes possible only when current applicability and other checks pass. An applicable current naming collision requires permitted explicit resolution or rejection, without silent rename, merge or disclosure.                                                                                                                                                                 |
| AC06 | Retiring an unused mistaken list removes it from new-work choices while keeping authorized settings/history and reversal available. Cancel before creation commits leaves no persisted list. No normal hard-delete path erases retained facts.                                                                                                                                                                                                                                                                                                               |
| AC07 | Reject removal of the last selectable stage on a retained usable list, including withdrawn/no-visible-use cases and two concurrent removals. An explicit atomic replacement succeeds; no hidden journey count is required or disclosed.                                                                                                                                                                                                                                                                                                                      |
| AC08 | Deliberately withdraw the last admission-eligible list in a valid scope with explicit valid dependency treatment. Existing work remains usable; new start explains missing configuration and preserves input. Required unresolved dependency prevents acceptance without exposing hidden rows.                                                                                                                                                                                                                                                               |
| AC09 | Controlled admission-first and withdrawal-first interleavings produce respectively retained existing work or rejected new use, never an accepted post-withdrawal attachment. Stale form, background retry, copied IDs, backdated input and future switch-back cannot bypass the rule. In one fixed reviewed group, preserve already accepted members, allow qualified current-bound reuse, reject unaccepted new members after withdrawal and reconcile uncertain receipts; review/enqueue is not admission, and retry never expands or retargets the group. |
| AC10 | Same intent delivered concurrently yields one accepted effect/history/result. Changed payload conflicts. Retirement → restoration → retry of the old retirement does not retire again; a stale fresh command conflicts despite matching the old Boolean state.                                                                                                                                                                                                                                                                                               |
| AC11 | Inject failure before commit, after commit before response and during secondary projection. No partial source/history/receipt commits; accepted source is reconciled after response loss; projections catch up without repeating business effects. UI never claims cancellation undid a commit.                                                                                                                                                                                                                                                              |
| AC12 | Test two tenants, different entities/contexts, a configurator without journey visibility, lead without configuration authority, revoked assignment, expired policy and appropriate service contexts. No unauthorized operation or hidden dependency/count/result disclosure succeeds.                                                                                                                                                                                                                                                                        |
| AC13 | Reject foreign-list stage and foreign-tenant list, nullable-stage scope escape, tenant/actor/history tampering and direct availability mutation through every exposed role/RPC/view/service path. An allowed row update cannot move it into a forbidden scope.                                                                                                                                                                                                                                                                                               |
| AC14 | Concurrent last-stage edits, availability edits and dependency changes preserve valid configuration and acceptance order; deadlock/serialization recovery remains bounded without lost/duplicated business effects. Revocation before acceptance blocks; later revocation limits subsequent disclosure.                                                                                                                                                                                                                                                      |
| AC15 | Equal labels across lists retain distinct identities and provenance; matching labels do not establish equivalence. Counts retain withdrawn-list work in declared scope and report incomplete reads honestly. Cache/export/history tests apply current authority and redaction; sensitive text is absent from operational logs.                                                                                                                                                                                                                               |
| AC16 | Keyboard, screen reader, pointer/touch, narrow viewport, 200% text, 320 CSS-pixel reflow, long names/RTL, reduced motion and low-bandwidth states preserve understandable options, focus, errors and next actions. Automated accessibility scans complement manual checks.                                                                                                                                                                                                                                                                                   |
| AC17 | Configuration retirement/restoration triggers no DON-14 enrollment/transition action, donor delivery, prayer/giving change or retirement-generated migration task. Authorized audit shows actor, list, before/after state, revision and business intent; unauthorized readers gain nothing.                                                                                                                                                                                                                                                                  |
| AC18 | Rehearse compatible mixed-version rollout, retained-data census/backfill, disabled mutations, failed migration, restore and roll-forward with real retained fixtures. Old readers cannot hide work; old writers cannot ignore withdrawal; existing accepted history/receipts survive.                                                                                                                                                                                                                                                                        |
| AC19 | Measure plans, query counts, milliseconds, lock waits and payload sizes at owner-declared workload/budget boundaries and one-over cases, including skew and long-lived withdrawn lists. Withdrawal cost must not grow with a mass journey rewrite. Capacity is qualified before release.                                                                                                                                                                                                                                                                     |
| AC20 | With representative agency configurators and working staff/missionaries, test stop-new-use, continue existing work, first assessment, reverse a mistake and resolve no new-work choices. Each participant must correctly explain whether partnerships/tasks ended and identify the next action. Any wrong end/contact/access interpretation is a design blocker to fix and retest; record observed results, not invented feedback.                                                                                                                           |

## Evidence actually executed

The appendices retain source/document inspection and dated primary links. A new
[isolated PostgreSQL 17.11 probe](d15-evidence/list-retirement-probe/README.md) passed
**9/9 checks** on 2026-10-10, with five exact-backend blocking schedules. It
reproduced inadequate key-share fencing and active-only reference resolution;
proved both admission/withdrawal orders under the fixture fence, continued assessed
and first stage selection, both existing-stage-change/withdrawal orders, concurrent
last-stage protection without a usage count, and rejection of restoration on
deliberately malformed zero-stage fixture data.

The pinned disposable container used network none, no published ports or host
mounts and an isolated tmpfs database; exact removal and input hashes are retained.
The root reviewer inspected the SQL and concurrency/assertion scripts. An
independent synthesis review checked the final policy against all five evidence
appendices; its unused-list retention, owner-native dependency repair, per-member
admission, naming-conflict and label-equivalence corrections are incorporated. The fixture
lacks real authorization, complete configuration audit/revisions and durable
receipts; its functions are not a proposed Core API. These are mechanism checks,
not production behavior or load evidence. D10–D14 probes were not rerun. Actual P12/Auth/PostgREST/role,
browser, tenant-data migration and workload acceptance remain release proof.

Documentation validation passed: nine review/session Markdown files, 141 local
links, all 22 category entries, 16 requirement definitions, 20 acceptance criteria,
the seven adversarial questions and selected-versus-proposed status. Formatting
and whitespace checks passed. The root independently verified all three probe
input hashes, Python syntax, nine successful recorded results, isolation metadata
and absence of the exact created container; the probe was not rerun. No product
code, live database, formal OpenSpec/PRD, ticket, donor communication or deployment
is changed in this interview review. No current production issue is asserted from
the prospective failure analysis alone.

## Synthesis, ownership and order

1. **Ratified 2026-10-10 — founder/P27:** the founder explicitly accepted the exact
   amended decision and reviewed safeguards, including all four material additions.
   This resolves the practical lifecycle, including accidental withdrawal and
   same-journey return. Applicability and the other reserved product choices are
   not inferred from ratification.
2. **In the later authorized spec/design — P27 with P12/P9/P28/P33:** carry R01–R16,
   the lifecycle/UX matrix and AC01–AC20. Qualify exact applicability and actual
   default/switching features still reserved by D14; D15 specifies their boundaries
   without selecting their broader product policy. An unsupported feature stays
   absent. Do not ship additional-list creation with an undefined lifecycle.
3. **Implementation safeguards — P27/P12 and database owners:** one authoritative
   command family, immutable scope, composite references, effective grants/RLS,
   current authorization, ordered eligibility checks and durable intent/history.
   Then compatible readers, minimal shared UI and recovery. No migration engine
   or new permission hierarchy is prerequisite to A.
4. **Before release — engineering, QA and product design:** execute the acceptance
   matrix against real source/API/browser/roles and retained fixtures. Measure
   workloads before choosing limits. Conduct the usability probes, fix failures,
   and attach evidence. SQL mechanics cannot waive these gates.
5. **After release — named owner roles below:** observe invariant violations and
   user-facing recovery, with actionable thresholds. These monitors supplement,
   not replace, preventative constraints and release proof.

| Signal                                                                                                   | Threshold                                          | Accountable owner                      | Response                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| New attachment accepted while withdrawal is current at that attachment's ordered acceptance              | Any confirmed occurrence                           | P27 engineering on-call                | Disable the affected admission/attachment door, preserve receipts/history, identify affected work and correct through the source; involve P12/security if authority failed. |
| Existing stage operation denied solely by whole-list withdrawal, or existing work omitted by that filter | Any reproducible occurrence                        | P27 engineering with P28 surface owner | Repair the eligibility/read path; reconcile affected projections. Do not make the list available for new work as a workaround.                                              |
| Retained usable catalog has zero selectable stages                                                       | Any confirmed catalog violation                    | P27 configuration/source owner         | Block unsafe further configuration/selection, retain unrelated work, perform authorized audited repair and identify the failing writer.                                     |
| Accepted configuration lacks required history/result, or same intent has duplicate business effects      | Any confirmed mismatch                             | P27 source operations owner            | Contain the affected mutation path, reconcile from authoritative evidence, repair without deleting accepted history and verify retry safety.                                |
| Unauthorized tenant/context/history/count disclosure                                                     | Any confirmed event                                | P12 security incident owner            | Contain affected access/cache/export, apply existing incident procedure and verify scope/revocation before reopening.                                                       |
| Staff misinterpret list retirement as ending a partnership or stopping follow-up                         | Any validated report or observed usability failure | P27 product/design owner               | Reproduce the flow, correct wording/hierarchy/behavior and retest affected scenarios; investigate missed work where applicable.                                             |

The implementation release record must assign these owner roles to the actual
team/on-call routing. None of these rows invents a new product inbox or exposes
protected records in telemetry. Performance limits remain a pre-release measured
qualification, not an undefined “monitor scalability” promise.

## Adversarial check

### What could go wrong with this answer?

“Existing” could become an authorization bypass, and “retired” could become a
global exclusion filter. R01/R02/R07 prevent both. Restoration without current
validation could revive obsolete defaults; R04/R06 prohibits that. The minimum
stage rule could obstruct emergency privacy treatment; governed security/redaction
remains separate and must not be implemented as ordinary retirement.

### What hidden assumptions are we making?

We assume organizations benefit from continuing valid work on an older process;
the founder selected that policy. We do not assume universal ministry stage names,
short-lived relationships, staff access to every donor, a default list or automatic
eventual migration. Actual agency usability and capacity remain unverified gates.

### How does this affect the whole product?

P27 owns one availability rule and list binding; authorized P28/staff consumers
use it consistently. Shared tasks, finance, communication, identity and reporting
retain their owners. No public or donor burden is introduced.

### How does this affect the end-user experience?

An ordinary worker can continue a relationship and change its stage normally.
An administrator can stop future use and reverse a mistake, with plain consequences.
New-work forms explain a genuine lack of eligible configuration instead of guessing.
The detailed state matrix makes failure and recovery as deliberate as the happy path.

### Does this follow modern best practices?

It uses proven separation of current choices from retained records, stable identity,
source-controlled mutations, durable retries and accessible state feedback. Vendor
deactivation is evidence, not a substitute for Core's policy; no deletion, financial
closure, campaign lifecycle or executable workflow behavior is imported by analogy.

### Does this fit Asym’s existing repo and product direction?

Yes, as intended policy with qualified implementation still required. It preserves
ADR-0001, P12, one shared cultivation model, source-owned tasks, shared API/UI and
D1–D14. The current source is inspected for reuse and hazards, not treated as proof
that this new capability exists or is safe.

### Should we adjust the recommendation?

**Accept with required amendments.** Keep A and add explicit return, reversal,
usable-stage and zero-new-choice semantics. This is the minimum complete lifecycle
for this decision; the exact corrected decision above is now explicitly ratified.
