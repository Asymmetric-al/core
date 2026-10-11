# Phase 27 D30 — tenant-controlled reassignment with a reviewed default

2026-10-11, Asia/Bangkok. Primary research retrieved 2026-10-11 UTC against Core
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, preserving the earlier interview work.
**Amended D30 explicitly ratified.** Review disposition: **Accept with required
amendments.** The founder subsequently instructed, “Yes, ratify this amended D30.”
The exact reviewed decision and safeguards are ratified without substantive change
on 2026-10-11, Asia/Bangkok. A with optional B is the selected direction: reviewed
transfers are the starting mode; a tenant may deliberately enable bounded automatic
changes to existing rule-managed staff responsibilities.

This is a completed decision review, not formal PRD/OpenSpec publication,
implementation or activation. Ratification does not claim live authorization proof
or a successful user pilot. D21 delegates routine design and edge-case judgment;
the safeguards below resolve those details without more small founder questions.
Formal owner reconciliation remains for /to-prd and tickets for /to-issues.

## Exact corrected decision

> **D30 — Organizations control whether existing staff-representative assignments
> change through staff review or through approved automatic rules.** Start with
> **Review changes**. Permit an authorized tenant administrator to enable **Apply
> changes automatically** for an explicit bounded rule/role scope. Keep existing
> native initial assignment available; changing the transfer mode does not itself
> disable initial routing or require Workflow Studio.
>
> This policy governs exact Party staff-assignment responsibilities, such as the
> church-relations representative. P9 remains the assignment authority; portfolios
> remain views of those assignments. Preserve multiple role-qualified assignees and
> the existing primary-representative meaning. Replacing one responsibility must
> not replace other roles or silently change the primary. A partnership lead,
> Request owner, task owner, access grant and financial obligation are separate.
>
> In reviewed mode, rules propose changes and authorized staff deliberately apply
> them, individually or as a finite reviewed group. This is ordinary assignment
> editing, not a compulsory second-person approval chain. In automatic mode, only
> source-proved rule-managed responsibilities within the enabled scope may change,
> using current policy, eligibility, permissions and any applicable handoff
> requirements. A review proposal or preview is not a committed assignment.
>
> Preserve manual assignments, deliberate unassignment and unknown legacy/import
> provenance. An empty assignee field does not prove eligibility for initial
> routing. **Keep this assignment** protects the choice even if the person's ID
> does not change. **Use rules again** explicitly releases that protection and
> shows the resulting behavior under the current tenant mode. No temporary leave,
> unavailable source, missing field or failed rule automatically removes a valid
> representative or chooses an arbitrary replacement.
>
> Keep configuration bounded and explainable. Use approved source fields, ordered
> conditions and eligible targets, not free code, an AI assignment decision or a
> second workflow language. Evaluate the first proved matching rule in the stated
> order. An unknown higher-priority condition or ineligible selected target is an
> unresolved result, not permission to fall through silently. Assignment outputs
> must not recursively determine their own routing. Financial ratings, wealth and
> protected care/location data are not admitted as D30 routing criteria.
>
> Saving a rule draft changes no assignment. Activation and rule/mode edits apply
> to future qualified evaluation events by default. **Apply to current matching
> assignments** is a separate deliberate, finite operation with an impact preview;
> enabling, disabling or reenabling automatic changes does not silently sweep old
> records or replay stale transfers. Disabling blocks uncommitted automatic
> transfers under the old policy while retaining committed assignments, lawful
> history and independent work. Current permissions still govern every action.
>
> Account for affected work through its source. Unrelated valid responsibilities
> continue with their actual owners. Where the change would invalidate required
> responsibility, require a lawful source disposition or durable, owned repair/
> handoff before claiming success. Do not claim acknowledged handoff when only an
> assignment changed. Access revocation proceeds immediately under its owner;
> neither reviewed mode nor a handoff delay keeps departed staff authorized.
>
> The interface clearly distinguishes current responsibility, proposed change,
> manual protection and handoff state. Show the exact role, current and proposed
> person, permitted reason and next action. Make ordinary changes quick, bulk scope
> explicit, conflicts recoverable and partial results honest. Sensitive work,
> people or rule inputs must not leak through explanations, counts, search,
> exports, notifications or stale screens. No donor-facing action or missionary
> reporting obligation is introduced.
>
> Use one source-authorized, concurrency-safe mutation boundary with durable
> history, execution provenance and idempotent recovery. Tenant and actor come
> from trusted context. Automatic execution uses current approved policy and
> bounded execution authority, not a caller's claim that a change is automatic.
> Source assignment identity, role-aware constraints, primary handling, grants,
> RLS, handoff adapters and accessible UI must be qualified before activation.

## Evidence, alternatives and confidence

[Practice](d30-evidence/practice.md), [ownership](d30-evidence/ownership.md),
[authorization](d30-evidence/authorization.md), [lifecycle](d30-evidence/lifecycle.md)
and [UX](d30-evidence/ux.md) contain focused evidence and source anchors. The
[independent challenge](d30-evidence/independent-review.md) checks the combined
answer rather than treating each appendix as independently sufficient.

**Verified repository intent.** P27 already requires native rule-based assignment,
overrides, transfers and history. [P9 A12](../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:484)
reserves role-qualified staff edges, multiple assignees, one primary and derived
portfolios. [D5](phase27-q5-accountability-default.md:182) explicitly separates
initial partnership-lead defaulting from ongoing reassignment. ADR0001 fixes Asym
Postgres ownership; ADR0183 fixes source work versus shared task presentation.
The optional Studio ADM-02 recipe cannot become mandatory for native assignment.
P44's deny-first deactivation cannot wait for portfolio transfer review.

**A real governing-model conflict requires amendment.** P9 A4's active edge
uniqueness on `(from, to, type)` can conflict with A12's multiple role-qualified
responsibilities if a staff-family type holds one scalar role. The same person
must be able to hold two distinct legitimate roles for one Party. D30 resolves
that logical identity requirement explicitly; the owner reconciliation below
narrows the uniqueness rule for staff assignments without changing unrelated
relationship identities. This is not silently dismissed as an implementation
choice or solved with a shadow portfolio table.

**Current implementation is not the target contract.** The authorization and UX
appendices inspect actual source. The relationship service derives legacy
relationships; it does not establish a qualified P9 staff-assignment writer.
The legacy `donors.missionary_id` also participates in missionary access, so
repurposing it as a staff representative could change disclosure or write rights.
The CRM's generic Owner label masks that distinction. Existing Support settings
provide useful interaction patterns, but resetting an edited draft on background
version change or rendering failed settings as an empty default is unsuitable
for automatic assignment. These are evidence-backed reuse hazards, not claims
of an exploited deployed D30 feature.

**External evidence supports explicit policy, not indiscriminate automation.**
HubSpot makes overwriting existing ownership a separate setting. Salesforce
nonprofit supports both rule-based and manual assignment; Sales Territories
separately models planning and activation. Dynamics distinguishes prospective
rule changes from treatment of existing records. Blackbaud's fundraiser guidance
keeps related action/opportunity work after ending a constituent assignment.
Those patterns support tenant choice, preview, manual exceptions and separate
work continuity. Their vendor stores, role-based access shortcuts, wealth criteria
and workflow dependencies do not override Core's owners. Sources, dates and
limitations are recorded in the practice appendix.

**Strongest alternative.** A-only, with reviewed bulk transfers, is simpler to
operate and protects existing responsibility. The founder explicitly chooses
additional tenant-controlled automation; a bounded native policy supports that
without imposing it on everyone. Pure manual assignment would discard an inherited
capability. Always-on rebalancing would discard the selected reviewed default.
A no-build alternative remains appropriate for small teams: ordinary source
assignment edits and saved portfolio views, with no configured routing rules.

**Product judgments.** The reviewed default, prospective activation, explicit
current-population application, first-match ordering, protected manual intent,
nonrecursive inputs and no-match retention are chosen safeguards. They are not
empirical claims about all ministries. They narrow how automation may act without
rejecting the selected flexibility.

**Unknowns and proof limits.** No interviews, representative staff pilot, live RLS
inspection, retained-data census or performance measurements were completed in this
documentation task. The existence of a feature in another CRM does not prove task
success here. Exact source adapters, deployed grants, workload envelopes and
composed usability require the acceptance evidence below; no release readiness is
inferred from ratification or document checks.

## Coherent staff and administrator experience

Use Mission Control's existing record shell, assignment controls and shared
`@asym/ui` Base UI/base-maia components with Zinc semantic tokens. This feature
needs clear status and consequences, not a new visual system or a workflow canvas.

1. **Understand current responsibility.** The record identifies the role, actual
   person and assignment basis: for example, “Church relations: Maria — Kept by
   staff” or “Church relations: Joel — Regional assignment rule.” Proposed changes
   appear alongside, never in place of the actual assignee. The primary marker
   remains distinct. Other partnership/Request/task owners remain in their own
   appropriate context.
2. **Choose the organization policy.** In the existing assignment settings, label
   the control **Changes to existing assignments**, with radio choices **Review
   changes** and **Apply changes automatically**. Display its exact role/rule scope
   and explain that initial assignment is configured separately. The default is a
   real saved mode; an unreadable policy is **Settings unavailable**, not assumed
   Review or Auto. Hide no consequential behavior behind an unexplained toggle.
3. **Edit understandable rules.** Each rule shows the allowed matching criteria,
   affected role, target and priority. Draft saving is ordinary and inert. Preview
   distinguishes new assignments, proposed/eligible transfers, protected manual
   choices, unchanged results and actionable exceptions using permitted data.
   Provide explicit Move up/Move down controls as well as any drag gesture.
4. **Activate with clear effect.** One consequence summary identifies scope,
   mode, protected exceptions and the prospective behavior. The separate action
   **Review current matches** prepares the finite existing-population operation;
   **Apply selected changes** confirms its displayed effect. A background policy
   change makes the draft/preview stale; preserve authorized edits and show a
   compare/reload path instead of replacing them.
5. **Review together, apply precisely.** A compact comparison shows Church/Person,
   Role, Current, Proposed, Why and permitted work impact. Staff may accept a
   selected set or **Keep this assignment**. Do not require a dialog per row or
   create a mandatory task for every proposal. Selected-page and all-matching
   operations name their exact scope and freeze that set. A changed target or
   newly matching record cannot quietly enter an already reviewed operation.
6. **Keep or return control deliberately.** An ordinary staff replacement defaults
   to a protected manual choice, visibly explained. Keeping the current person
   is also a meaningful protection change. **Use rules again** previews current
   matching and releases protection through one clear save: reviewed mode keeps
   the current person pending deliberate transfer; automatic mode may apply the
   displayed current eligible result. Missing matches keep valid responsibility
   and explain why no transfer occurred. No invisible timer expires protection.
7. **Finish or repair honestly.** Show Applied, Kept, Changed since preview,
   Needs assignment/repair or Not attempted as appropriate. A partial bulk result
   lists permitted per-record results and safe retry. A lost response first checks
   the original operation; it does not start a new transfer. Disabling Auto explains
   that future automatic transfers stop and existing assignments remain.

Illustrative content, not an observed tenant workflow:

```text
Church relations · Existing assignments
Mode: Review changes                                    Change policy

Grace Church
Current representative       Maria
Suggested representative     Joel
Reason                       Regional assignment rule changed
Other responsibilities       Kept with their current owners

Apply transfer       Keep Maria       View permitted work
```

Only show the last line about other work when its truth can be safely established.
A restricted-work count is not a harmless hint. If an action is blocked, explain
what the viewer may do next without naming hidden work, its owner or its volume.

Keep mobile rows readable with role, current/proposed identity and next action
before secondary detail. Support long Unicode names, translated/RTL labels and
locale-aware dates without assuming surnames, addresses or a universal business
timezone. Preserve keyboard operation, focus after success/conflict, textual
statuses and screen-reader announcements. Require WCAG 2.2 AA at the composed-flow
level, including applicable 320 CSS px reflow, target sizing and light/dark contrast.
Core actions should remain usable on a slow connection independently of optional
charts. No durable offline copy of sensitive assignment data is promised; clear
or restrict drafts after tenant/session/access change. No new donor checkout,
public-site or missionary action is part of this feature.

## Exact requirements to carry into the spec

**R01 — Scope and default.** P27 SHALL provide reviewed transfers by default and
an explicit tenant-controlled automatic mode for a bounded declared role/rule
scope. Native initial routing remains separate. Only current authorized policy
administration can change the mode; caller payload, UI state or optional Studio
configuration SHALL NOT independently authorize an automatic transfer. No new
territory platform, general workflow language or provider dependency is required.

**R02 — Bounded rule evaluation.** Rules SHALL use a code-owned supported catalog
of authorized source criteria and targets, with explicit deterministic order and
traceable input/policy revisions. The first predicate proved true selects the
rule before target eligibility is checked. Unknown or unauthorized higher-priority
input is not false; an ineligible selected target SHALL NOT cause implicit
fallthrough. Conflicting/unqualified target selection becomes an exception, not
array-order choice. Rule writes SHALL NOT feed their own matching inputs or create
cycles between assignment policies. D30 admits no ratings/wealth, protected care/
location, arbitrary SQL/code or AI routing input. Ordinary permitted region facts
remain subject to their source classification. Rule scope never grants access to
its matching input or explanation.

**R03 — Source identity and cardinality.** P9 SHALL remain the authoritative
assignment owner; P27 owns policy intent and consumes its qualified commands.
A transfer identifies the exact managed responsibility/edge and role lineage,
not every edge between a person and Party. Preserve multiple assignees and
multiple legitimate roles for the same staff/Party. For the staff-assignment
family, active identity SHALL distinguish the role; duplicate same-role source
responsibilities remain forbidden, while unrelated A4 edge uniqueness is retained.
Do not introduce one-assignee-per-role uniqueness or a second portfolio store.
Primary changes, when needed, SHALL be explicit in the source command and valid
atomically. A last/primary-assignee removal must produce the source's honest
unassigned/repair outcome, not a fabricated successor or contradictory primaries.

**R04 — Durable manual intent.** Distinguish rule-managed responsibility, protected
manual choice, intentional unassignment and unknown provenance. Only an explicitly
qualified initial-unassigned or managed scope is automatically eligible. Manual
replacement/removal and **Keep this assignment** establish protected intent even
when the resulting person is unchanged or absent. Imports, merges and missing
metadata SHALL NOT confer rule-managed status. An authorized **Use rules again**
command explicitly ends protection, preserves history, revalidates current policy
and discloses whether it merely permits a proposal or applies the displayed result.
No rule edit, automatic-mode activation or default timer silently clears protection.

**R05 — Prospective policy and finite application.** Saving drafts SHALL be inert.
An enabled approved revision governs future qualified source changes/evaluations;
only relevant source revisions trigger reevaluation. Editing/enabling a policy
SHALL NOT silently sweep existing records. Applying it to current matches requires
a distinct finite, authorized impact-reviewed operation with fixed member/source
identities, expected versions and intended results. Legacy/unknown/manual records
are not silently adopted. Show whether existing assignments have been evaluated
under the new policy; do not imply convergence. An event or pending decision
ordered before a policy activation/edit SHALL NOT be rebound to the new generation
as a fresh trigger; supersede/reject its old authority. The new policy requires a
qualified source change ordered after activation, or an explicit finite current-
application/Use rules again operation. Qualify that authoritative source admission/
revision order with the policy owner; transport arrival, worker start and backdated
business occurrence do not decide it. A newly admitted current source update may
carry an earlier occurred-at date without replaying its historical event stream.
Reenable performs fresh current qualification for future events, not old desired-
owner replay or hidden catch-up.

**R06 — Reviewed proposals and bulk effects.** Proposals SHALL show current versus
proposed responsibility and reason without changing source truth. One current
proposal per exact affected responsibility/basis is sufficient; superseded
proposals remain history under retention, not accumulating actionable copies.
Applying a proposal rechecks its exact policy, target, source and authorization.
Stale materially changed intent requires fresh review; do not silently substitute
a new target. Bulk operations preserve their reviewed population and report
per-member commits, conflicts, failures and unattempted results. Cancellation
stops uncommitted members without claiming reversal of committed changes.

**R07 — No-match and loss of eligibility.** No match, unknown input, missing or
ineligible target SHALL preserve an otherwise valid current assignment and reveal
an appropriate permitted review/repair path. A rule miss alone SHALL NOT unassign
someone. Invalid/departed current responsibility SHALL NOT be displayed as healthy
coverage or remain an access path. Source revocation and current ineligibility
win immediately; missing successor produces an owned, discoverable exception
under the existing source contract, never a guessed person, queue or primary.

**R08 — Independent work and handoff.** Party assignment SHALL NOT implicitly
transfer a partnership lead, Request, task, commitment, care responsibility or
permission. Preserve each current eligible owner. Before claiming a transfer
complete, prove affected work remains lawfully owned/actionable or record its
source-approved disposition/durable owned handoff. If that precondition cannot be
proved, the transfer is blocked/repairable; do not require a distributed transaction
that completes every independent obligation. An exact source-required pre-transfer
acceptance SHALL be satisfied before the assignment commit. Where acknowledgment is subsequent, commit only the lawful
assignment and durable handoff intent, and show acknowledgment outstanding.
Receiving acknowledgment remains a separate source fact; neither pending intent
nor notification read state substitutes for required acceptance. ADR0183 tasks and
ADR0027 notifications project only qualified human-action occurrences; proposals or edge changes alone do not
create mandatory chores. Directory/access revocation never waits for this process.

**R09 — Tenant and authority everywhere.** Derive tenant, actor, timestamps and
execution provenance from trusted server context. Validate every proposed Party,
staff identity, role, policy scope, primary and source reference under current
same-tenant authority. Separate policy editing, applying current-population changes
and ordinary transfer powers through qualified P12 actions; a broad admin label
is not proof. Automatic execution uses a current tenant-approved policy and bounded
service authority; retain human approval lineage separately from execution actor.
Do not impersonate the original policy author or retain their session token.
An NHI executor SHALL recheck its current qualified human-owner ceiling and
operation scope; owner deactivation or lost execution authority blocks its writes
until the source-governed reassignment/repair succeeds. Historical policy approval
does not preserve revoked execution authority.
P12's independently qualified access predicates remain authoritative; a staff edge
or display role creates no new grant. APIs, jobs, imports, RPCs and privileged
paths enforce the same controls, including mutation of fields which influence
routing. Other tenants, Legal Entities and restricted scopes are never inferred.

**R10 — Data and database invariants.** Required tenant/identity/role/revision fields
SHALL be nonnull; use same-tenant foreign keys and role-aware current uniqueness.
Preserve temporal source history and protected attribution; an ended edge is not
reopened by editing its historical identity. Reject wrong-tenant reassignment and
invalid old-to-new state transitions. Enforce local primary/cardinality and valid
mode/provenance combinations in constraints or one atomic source boundary;
inspect FK/query indexes for tenant, Party, role and current work. No cascade may
erase source work, financial records or required history. D30 has no money field,
conversion or amount writer; existing financial precision and ownership survive.
Inspect grants and effective RLS `USING` and `WITH CHECK` behavior, including
PostgreSQL's inherited check where applicable, views, RPC execution/search paths,
service-role bypass and storage. Field authorization and safe constraint errors
are still required; RLS alone is insufficient. Preserve lawful retention/redaction,
not infinite plaintext retention or arbitrary hard deletion.

**R11 — Atomicity, ordering and durable effect identity.** Policy/manual/assignment
heads and relevant revocation must participate in a defined source serialization
order. A worker's earlier check is not sufficient at commit. A stale transfer
loses to a committed manual protection, policy-disable or applicable revocation
fence. Assignment, primary changes, manual-control state, history, receipt and
required durable effect intent SHALL commit atomically at their owner or not at
all. Business-effect identity binds exact tenant, source responsibility, basis and
operation; it survives transport retry but permits a later distinct legitimate
transfer. Reauthorize receipt reads. After-commit projection/notification failure
must be repairable without losing or repeating the assignment. Do not promise
cross-provider exactly-once execution or claim recall of already admitted effects.

**R12 — Disable, return and correction.** Disabling Auto SHALL immediately deny
uncommitted automatic existing-assignment changes under older generations; it
retains current assignments, history, initial-routing configuration and independent
work. Reenable requires a new current generation and qualification, not replay.
Corrections are new attributed source changes under current authority, not history
rewrites or blind undo of intervening work. Returning to an earlier staff member is
a new valid transition, not deduplication of an old transfer or resurrection of
expired access. Imports/backdates preserve occurred-at precision separately from
recorded-at and do not invent past rule effects or execute historical backlog.

**R13 — Permission-safe explanations and privacy.** Authorize before filtering,
counting, ordering, comparing or explaining. Preview totals, rule match reasons,
manual-override histories, target searches, notifications, logs, exports, generated
briefs/AI and caches SHALL not reveal hidden people/work/input values. Use the
minimum permitted explanation and an actionable safe recovery path. Restricted
missionary location or care detail is not routing metadata. Bind cached results and
resumable drafts to current tenant/viewer/purpose/generation; revoke stale delivery
and clear disallowed local data. Existing export/retention/backup deletion policy
applies to lawful history; no new attachment store is necessary.

**R14 — Clear accessible interaction.** Use the composed experience above and
shared Base UI/base-maia/Zinc system. Keep current, proposed, protected, failed,
unknown and applied states distinct. Show role and mode scope, not generic Owner.
One ordinary apply/save must suffice absent an actual source-required review.
Preserve authorized drafts on failure/version conflict; do not replace edits with
background refresh or display missing settings as the default. Provide keyboard,
screen-reader, pointer/touch and non-drag alternatives, WCAG 2.2 AA reflow/contrast/
targets, long international names and localized dates. New donor/public/missionary
surfaces or logging duties are not authorized.

**R15 — Bounded execution and performance.** Page authorized proposals and use
stable server ordering, indexed source predicates and bounded jobs/checkpoints.
Aggregate the qualified complete scope, not a loaded page. Reevaluate only
relevant input/policy events; coalesce superseded queued evaluations without
losing source history. Prevent recursive feedback and repeated churn from the
same basis. Do not fetch every private child for a portfolio row. State whether
an impact preview is complete or still calculating. Qualify actual tenant sizes,
rule counts, rule overlap, concurrent staff, p95 latency/error and freshness limits
before activation; no arbitrary claim of unlimited scale or invented safe cap.

**R16 — Operational recovery and observability.** The assignment history SHALL
explain old/new responsibility, role, policy/version or deliberate action,
recorded/effective time and actor/provenance within current permissions. Business
history, security audit and technical diagnostics remain distinct. Technical
records use safe IDs/reasons, not protected narratives. Provide source-owned
inspection/retry/correction with truthful receipts; ordinary repair must not need
DB edits. Exceptions have qualified accountable responsibility, or remain at the
source for independently authorized repair when no recipient can lawfully be
resolved. Do not generate repeated tasks for unchanged problems.

**R17 — Migration and rollout.** Census retained assignments, provenance, primary
state, role collisions, active consumers and outstanding work. Unknown imported
provenance remains protected until deliberately qualified. Ship compatible readers
and source constraints before writers; fence incompatible old clients and queued
jobs. Backfills are resumable/idempotent and cause no transfers, notifications or
access changes. Activate the reviewed journey first, then a bounded tenant Auto
pilot after the same source safety gates. Disable uncommitted effects safely;
rollback preserves committed assignments/manual protections/history and uses
compatible reads or roll-forward, never destructive downgrade to a scalar owner.

**R18 — Proof and traceability.** Carry this decision through the glossary, exact
P9/P27/P12/shared-work owner reconciliation, OpenSpec, design/tasks/issues and
release evidence. Prove real admitted DB roles/RLS, owner commands, concurrent
schedules, migration/restore and representative staff flows. A mocked policy
function, synthetic SQL model or component-only accessibility pass is insufficient.
Do not interpret this reviewed decision as implementation, whole-phase completion
or subsequent founder ratification. Residual monitoring requires a named operator,
explicit signal, threshold and response.

## All-category adversarial review

Severity is potential impact; likelihood is qualitative exposure without the
required safeguards, not measured production incidence. Each row states a material
concern or its absence, evidence, consequence and effect on the selected answer.
R clauses above give exact amendment language; ACs below make it falsifiable.

| Category                                                         | Material concern, consequence and evidence                                                                                                                                                                                  | Severity / likelihood                         | Effect on answer and permanent treatment                                                                                                                              |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** A universal routing system overbuilds a real assignment need; manual-only ignores inherited automation. P27/Q30 and current CRM comparisons support bounded routing, not measured ministry demand.                 | Medium / plausible                            | Accept tenant choice, narrow machinery; ordinary edits and reviewed bulk remain adequate without rules. R01–R02; AC01–AC03.                                           |
| 2. Brittleness                                                   | **Yes.** Null owner, missing input, rule order or staff eligibility may be mistaken for valid automatic transfer. The lifecycle appendix identifies normal counterexamples.                                                 | High / likely                                 | Preserve explicit provenance, deterministic matching and unknown/no-match handling. R02–R05, R07; AC04–AC10.                                                          |
| 3. Technical debt                                                | **Yes.** A scalar owner or local portfolio table duplicates P9 truth and can inherit legacy missionary access semantics. Current authorization/UI source proves the reuse hazard.                                           | High / plausible                              | One role-aware source authority; reconcile A4/A12 before implementation. R03, R09–R10; AC11–AC14.                                                                     |
| 4. Edge cases                                                    | **Yes.** One staff person in two roles, a manually unassigned record, departed primary, merged Party or corrected address can break simplistic replacement. P9/D5 and worked cases establish consequences.                  | High / likely over lifetime                   | Exact responsibility identity, protected intent, primary/revocation repair and current merge qualification. R03–R08, R12; AC04–AC14, AC31.                            |
| 5. Footguns                                                      | **Yes.** A toggle or saved rule may move a whole portfolio, or Keep may silently do nothing because the ID is unchanged. HubSpot explicit overwrite and current settings/selection seams expose the risk.                   | High / plausible                              | Inert drafts, explicit mode scope, finite impact-reviewed application and durable same-person protection. R04–R06, R14; AC05, AC15–AC17.                              |
| 6. Tenant safety                                                 | **Yes.** Cross-tenant targets, policy keys, worker authority or stale drafts can mix assignments and disclose relationships. P12/platform boundaries require structural isolation.                                          | Critical / plausible                          | Trusted tenant/actor, composite references and scoped consumers at execution time. R09–R13; AC18–AC21.                                                                |
| 7. Database, RLS and authorization safety                        | **Yes.** Old-row access can permit forbidden new owner/scope, a broad admin path can bypass source authority, or constraints can leak hidden records. No qualified writer/RLS proof exists in inspected code.               | Critical / plausible                          | Constraints plus atomic owner command, effective old/new policies, grants and all privileged/indirect paths. No new money writer. R09–R11, R13; AC11–AC14, AC18–AC23. |
| 8. Overengineering                                               | **Yes.** New territory, queue, round-robin, workflow or approval systems could be invented for a two-mode policy. Vendor capability breadth is not Core scope.                                                              | Medium / plausible                            | Fixed supported predicates/targets and ordinary reviewed edits; no general DSL or universal acknowledgment. R01–R02, R08, R14; AC01–AC03, AC24.                       |
| 9. UX/UI and user friction                                       | **Yes.** Generic Owner, hidden override meaning, repeated dialogs, destructive refresh and vague Needs attention prevent confident work. Current UI and accessibility evidence are concrete.                                | High / likely without composed design         | Exact role/current/proposed/basis/next action, brief settings, finite bulk and accessible recovery. R04–R06, R14; AC15–AC17, AC32–AC35.                               |
| 10. Source of truth, ownership and invariants                    | **Yes.** Policy output could become authoritative without an assignment commit, or an edge change could imply all work/access transferred. P9 A12, D5, ADR0183 and Blackbaud separation contradict that.                    | High / plausible                              | Qualified source references, role-aware identity, separate work/primary facts and atomic history. R03, R08–R11; AC11–AC14, AC24–AC25.                                 |
| 11. Hidden coupling                                              | **Yes.** Routing could depend on optional Studio, ratings, identity-provider fields or assignment outputs, creating circular authority or outages. Governing P27/P34/P44 boundaries prohibit it.                            | High / plausible                              | Native bounded policy, approved inputs, no feedback loops, deny-first identity revocation. R01–R02, R07–R09; AC03, AC10, AC24, AC30.                                  |
| 12. Failure modes                                                | **Yes.** A commit followed by failed notification/projection, lost response or partially applied batch can duplicate or conceal transfers. Current nontransactional command seams are not sufficient proof.                 | High / plausible                              | Atomic history/receipt/effect intent; truthful per-member outcomes and current-authorized replay. R06, R11, R16; AC22–AC23, AC26–AC28.                                |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** A stale worker may beat a new manual override, old Auto jobs may run after Off, or return-to-former-owner may be deduplicated incorrectly. These are normal race/retry schedules.                                  | High / likely under concurrency               | Shared current-head ordering, prospective policy, effect identity and distinct later transitions. R04–R06, R11–R12; AC26–AC30.                                        |
| 14. Data integrity                                               | **Yes.** Duplicate responsibilities, two primaries, unknown migration provenance or partial bulk writes corrupt accountability and portfolio counts. P9 A4/A12 is a concrete identity conflict.                             | High / plausible                              | Role-qualified invariants, source serialization, protected unknowns and exact finite results. R03–R06, R10–R12; AC11–AC14, AC28, AC31.                                |
| 15. Security and privacy                                         | **Yes.** Rules, targets, reasons and affected-work counts can expose care/location or private financial context. Broad assignment is not a private-reader grant; current legacy scalar fields already affect access.        | Critical for sensitive disclosure / plausible | Minimize inputs/explanations and enforce current scope across all derivatives; lawful retention. R02, R09–R10, R13; AC18–AC21, AC36.                                  |
| 16. Scalability and performance                                  | **Yes.** Full rescans, per-row work fan-out, growing proposal duplicates or endless rule feedback can stall large tenants. No production workload evidence establishes a safe limit.                                        | Medium to High / plausible at growth          | Relevant-event evaluation, bounded reads/jobs, coalescing and measured envelope; never truncate impact silently. R06, R15; AC10, AC28, AC37.                          |
| 17. Operational burden                                           | **Yes.** Every proposal becoming a task, undocumented exceptions or DB-only repairs turns flexibility into recurring administration. D21/ADR0183 and the lifecycle comparison oppose it.                                    | Medium / likely if unbounded                  | Explicit control state, no repeat chores, source repair and safe finite bulk. R04, R06–R08, R16; AC05, AC24–AC25, AC28.                                               |
| 18. Observability and auditability                               | **Yes.** Staff cannot explain why ownership changed or whether a handoff completed if only final IDs or generic logs remain. P9 history and source-work contracts require more.                                             | High / plausible                              | Separate lawful assignment history, security evidence and content-safe diagnostics, with source operation receipts. R08, R11–R13, R16; AC22, AC25–AC28, AC36.         |
| 19. Dependency and integration risks                             | **Yes.** Directory updates, optional workflows, delayed imports or notifications could acquire reassignment/access authority or repeat effects. P44 and ADM-02 define separate owners.                                      | High / plausible                              | Qualified native owner commands, no directory-inferred successor, exact external event/effect reconciliation. R07–R09, R11–R12; AC24, AC27, AC30–AC31.                |
| 20. Migration, rollout and upgrade                               | **Yes.** Old scalar-owner clients or imported nulls can bypass new manual protections or erase role history on rollback. Current seams require a census, not inferred compatibility.                                        | High / plausible                              | Protected unknown provenance, additive readers, old-writer fences, effect-free backfill and history-preserving disable/rollback. R17; AC38–AC39.                      |
| 21. Testability, traceability and proof                          | **Yes.** Flexible tenant policy is ambiguous without rule order, time, control and source semantics; stale A4 uniqueness could contradict implementation.                                                                   | High / certain drift if unreconciled          | Exact owner amendments, outcome tests and source/UI/release evidence. R18 and all clauses; AC40.                                                                      |
| 22. Other development hazards                                    | **No additional material concern found.** Checked unsafe defaults, financial side effects, missionary autonomy, task proliferation, unsupported routing engines, repair and rollback; material concerns are assigned above. | No independent additional hazard established  | Preserve R01–R18; no new finance/privacy authority, extra approval ceremony or speculative platform is justified.                                                     |

## Worked counterexamples and transition checks

These are explicit reasoning fixtures, not claims of executed source/RLS tests.

| Situation                                                                | Required result                                                                                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A new genuinely unassigned role matches one valid rule                   | Initial routing may assign through its source; no cultivation enrollment, private access or unrelated task follows.                                                 |
| Maria currently holds the role; reviewed policy now selects Joel         | Maria remains current; one proposal explains Joel and the reason. Applying requires current source proof.                                                           |
| Automatic scope selects Joel for a proved managed responsibility         | Transfer only that exact responsibility if all current gates pass. Preserve other roles and independent work.                                                       |
| Staff choose Keep Maria while Maria is already current                   | Save protected manual intent and provenance even though person identity is unchanged. Old jobs cannot overwrite it.                                                 |
| Staff deliberately clear a role                                          | Keep intentional-unassignment provenance and owned accountability treatment; a null field cannot trigger refill.                                                    |
| Earlier rule predicate is unknown; later rule matches                    | Do not pretend the earlier rule is false. Retain valid current responsibility and expose a permitted exception.                                                     |
| First matching rule targets an ineligible/departed staff member          | No implicit fallthrough or arbitrary replacement; repair the rule/target through its source.                                                                        |
| A region change means no rule matches                                    | Retain an otherwise eligible current representative; do not silently abandon the relationship.                                                                      |
| One person has church-relations and mobilizer roles                      | Transfer only the selected role; preserve the other and obey explicit primary treatment.                                                                            |
| Rules/Auto are enabled for the first time or reenabling follows downtime | Future evaluations use the current generation; old matching records are not swept unless a separate finite application is chosen.                                   |
| A source event precedes P2 activation but its worker starts afterward    | Supersede the old intent; do not run P1 or silently rebind that old event to P2. P2 needs a qualified post-activation source event or explicit current application. |
| A qualified source event follows P2 activation but arrives late          | Recheck current source/policy before acting; worker arrival and the historical occurred-at date do not alter source order.                                          |
| Auto is disabled while a worker is evaluating                            | A transfer committed before disable remains; an uncommitted old-generation transfer fails the final fence.                                                          |
| Source assignment commits but the browser loses its response             | The same operation receipt reconciles; retry does not create another history/effect. Read permission is rechecked.                                                  |
| A staff member is deactivated with outstanding stewardship tasks         | Revoke access immediately, mark invalid coverage honestly and preserve source-owned repair; no directory-inferred successor.                                        |
| A Party merge combines a manual exception and rule-managed record        | Preserve conflicting provenance; no merge winner silently overrides the protected assignment. Qualified source repair decides.                                      |
| A finite transfer group partly succeeds, then staff cancel               | Committed results remain; identify unattempted/failed/conflicting members. Do not substitute newly matching people.                                                 |
| Someone transfers Maria to Joel, later legitimately back to Maria        | The second transition is new business history, not replay of the first or restoration of old grants.                                                                |
| A preview cannot read hidden care work                                   | No hidden count or reason appears. The source returns only a permitted actionable disposition or blocks safely.                                                     |

## Exact owner reconciliation

These amendments are recorded for formal reconciliation when /to-prd is invoked;
no formal owner file is edited by this review.

1. **P27 roadmap and retained owner obligations — portfolios and responsibility:**
   “Preserve rule-based initial assignment. Existing representative transfers
   default to staff review, with explicit tenant opt-in for bounded automatic
   changes to source-proved rule-managed responsibilities. Preserve manual and
   intentional-unassignment exceptions. Rule edits are prospective; applying to
   current records is a separate finite reviewed action. Assignment, access and
   independent work remain distinct.” Carry R01–R18 and AC01–AC40 into their
   appropriate requirements/design/tasks, not just an overview banner.
2. **P9 A4/A12 and their CRM projections:** “For staff-assignment relationships,
   active identity must distinguish the role-qualified responsibility. The same
   staff person may hold multiple legitimate roles for one Party without being
   blocked by a `(from, to, type)` uniqueness that omits a separately stored role.
   Where a staff-family edge uses a role attribute, include the role in its active
   identity/uniqueness; role-qualified type identity may satisfy the same invariant
   if that is the owner's chosen representation. Preserve non-staff A4 uniqueness,
   no mirrored edges, tenant-aware references, assignment history, multiple
   assignees and the primary-representative contract. Portfolios remain derived.”
   This resolves logical uniqueness; it does not freeze table/index names or
   silently impose one assignee per role. Qualify the exact primary/unassigned
   source transition and repair semantics before writer activation.
3. **P9/P27 source commands and P12 authorization:** define the bounded policy,
   assignment/protection/proposal command contract, current execution authority,
   role/primary/history atomicity, safe receipts and all-path policies. Existing
   scalar missionary assignment, broad admin helpers or policy-author sessions
   are not substitute authority. Reconcile the legacy read/access consumers
   before retiring them; do not reinterpret historical money or donor visibility.
4. **Shared work/notifications, P34 ADM-02 and P44:** bind exact source work and
   effect identities. Preserve applicable handoff acknowledgment as its own fact
   and the recipe's unresolved qualification status. Deny-first revocation remains
   immediate. Neither directory nor Studio mutates assignment authority directly;
   neither is required for ordinary native routing. No new blanket finance,
   care, donor or missionary access grant is created.
5. **Glossary and release evidence:** add Staff-assignment policy and Manual
   staff-assignment exception as business terms, preserving Staff-assignment edge,
   portfolio, partnership lead and work ownership distinctions. Physical states,
   schema and UI components belong in design. No new platform-wide ADR is needed
   merely to repeat existing owners; any future authority change requires explicit
   owner reconciliation instead of being smuggled into an implementation ticket.

## Acceptance criteria and proof

These are required product outcomes, not tests claimed completed by this review.

| ID   | Falsifiable outcome                                                                                                                                                                                                                                                                                                                                                                                                                    | Requirements      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| AC01 | New tenant uses reviewed existing-assignment transfers; tenant can explicitly enable Auto for a declared bounded scope and safely return to Review. Other scopes keep their own stated mode.                                                                                                                                                                                                                                           | R01               |
| AC02 | Native rule-based initial assignment and ordinary manual/bulk edits work without configuring a territory engine or automatic existing-assignment transfers.                                                                                                                                                                                                                                                                            | R01–R02           |
| AC03 | Studio, ratings, optional reports and directory services being unavailable do not block independently safe native assignment; no rule uses unauthorized external authority.                                                                                                                                                                                                                                                            | R01–R02, R09      |
| AC04 | A manually assigned record, deliberately unassigned role and imported unknown-provenance record are not moved or refilled by initial routing, Auto, rule edit or replay.                                                                                                                                                                                                                                                               | R04               |
| AC05 | Keep current person creates durable protected intent despite an unchanged assignee ID; concurrent/queued automation cannot erase it.                                                                                                                                                                                                                                                                                                   | R04, R11          |
| AC06 | Use rules again clearly releases protection: Review produces a current proposal; Auto can apply the displayed current eligible result. No match does not silently clear valid responsibility.                                                                                                                                                                                                                                          | R04, R07          |
| AC07 | Ordered overlapping rules produce the first proved matching rule; unknown earlier predicates and ineligible selected targets do not silently fall through.                                                                                                                                                                                                                                                                             | R02               |
| AC08 | No match or missing target preserves eligible current responsibility and exposes a permitted reason/repair action; missing current responsibility is not called healthy.                                                                                                                                                                                                                                                               | R07               |
| AC09 | Target choices obey current staff/role/tenant/source eligibility and qualified deterministic resolution; multiple candidates are not resolved by database order.                                                                                                                                                                                                                                                                       | R02, R09          |
| AC10 | Assignment outputs cannot trigger cyclic routing; duplicate irrelevant source updates do not produce new transfers/proposals/tasks.                                                                                                                                                                                                                                                                                                    | R02, R15          |
| AC11 | Same staff/Party can hold distinct roles; replacing one does not erase the other. Duplicate same-role source identities and cross-tenant references fail at admitted database paths.                                                                                                                                                                                                                                                   | R03, R10          |
| AC12 | Concurrent primary/replacement/removal produces one valid source result or conflict; primary remains a valid assignee, or the source's honest unassigned/repair state is used.                                                                                                                                                                                                                                                         | R03, R10–R11      |
| AC13 | No writer or read model treats legacy missionary ID, membership role, display Owner or a saved portfolio view as P9 assignment authority.                                                                                                                                                                                                                                                                                              | R03, R09          |
| AC14 | Ended assignments and prior manual protections retain lawful actor/time/role history; correction and return are new transitions, not edits to historical identity.                                                                                                                                                                                                                                                                     | R03–R04, R12      |
| AC15 | Draft save, activation, current-population application and mode change have the exact disclosed effects; enabling does not silently move all current matches.                                                                                                                                                                                                                                                                          | R05, R14          |
| AC16 | A reviewed group contains only its finite original identities and intended results; filter/rule/target changes cannot substitute records or enlarge scope before apply.                                                                                                                                                                                                                                                                | R05–R06           |
| AC17 | Concurrent settings refresh preserves an edited authorized draft and shows conflict; unreadable settings never render as the saved default or authorize Auto.                                                                                                                                                                                                                                                                          | R01, R14          |
| AC18 | API, direct admitted DB role, RPC, import, worker and service-role tests reject forged tenant/actor/role/primary/policy IDs and unauthorized current-state changes. Revoked NHI owner authority blocks automatic execution despite historical policy approval.                                                                                                                                                                         | R09–R11           |
| AC19 | A permitted old-row update cannot create an unauthorized new tenant, subject, recipient, role, control state or scope; effective USING/WITH CHECK, grants and bypass paths are proved.                                                                                                                                                                                                                                                 | R09–R10           |
| AC20 | Target search, preview counts/differences, reasons, sorting, history, exports, caches, AI/briefs and notifications reveal no unauthorized people, work or rule inputs.                                                                                                                                                                                                                                                                 | R09, R13          |
| AC21 | Tenant switch, revoked permission and expired session between preview and apply/download narrow or reject current output; cached drafts/receipts cannot leak or replay across tenants.                                                                                                                                                                                                                                                 | R09, R11, R13     |
| AC22 | Fault injection before authoritative commit proves assignment/control/primary/history/receipt/effect intent all-or-none; after-commit projection failure preserves source truth.                                                                                                                                                                                                                                                       | R10–R11, R16      |
| AC23 | Retrying a lost response returns the same current-authorized operation result and creates one business effect; a later legitimate transfer remains possible.                                                                                                                                                                                                                                                                           | R11–R12           |
| AC24 | Representative transfer does not move partnership/Request/task ownership, grant access, start cultivation, send donor messages or generate a task for every proposal.                                                                                                                                                                                                                                                                  | R08–R09           |
| AC25 | Where affected required work would lose eligible responsibility, require lawful source disposition/durable owned handoff. Source-required pre-transfer acceptance gates assignment commit; subsequent acknowledgment remains visibly outstanding after lawful assignment plus durable intent. Neither acknowledgment nor handoff completion is fabricated.                                                                             | R07–R08           |
| AC26 | Race manual Keep/unassign/transfer against Auto; race policy edit/disable and revocation against commit using independent connections. Only an outcome valid under the proved serialization order survives.                                                                                                                                                                                                                            | R04, R11–R12      |
| AC27 | Disable/re-enable, stale queued events, duplicate/out-of-order callbacks and replay after restore cannot apply old desired-owner decisions or revive old grants/tasks.                                                                                                                                                                                                                                                                 | R11–R12, R17      |
| AC28 | Bulk partial success, cancel, retry and timeout expose exact permitted member results, preserve committed changes and resume without duplicates or unseen expansion.                                                                                                                                                                                                                                                                   | R06, R11, R15–R16 |
| AC29 | Delay workers for source events committed before and after policy activation: the earlier event cannot execute the retired policy or be rebound to the new policy; the later qualified event may use the current policy after revalidation. Explicit current-application/Use rules again is distinct. Backdated business dates and transport arrival cannot change the authoritative source order or invent historical responsibility. | R05, R11–R12      |
| AC30 | Staff departure/revocation acts immediately despite pending review/handoff; no successor is inferred from directory fields and no ineligible assignee appears as healthy current coverage.                                                                                                                                                                                                                                             | R07–R09           |
| AC31 | Merge/import/legacy provenance conflicts preserve protected choices and source work; do not mark every surviving edge rule-managed or guess a primary.                                                                                                                                                                                                                                                                                 | R03–R04, R12, R17 |
| AC32 | Representative staff correctly identify current versus proposed assignee, role, manual protection, Auto scope and effects of Apply/Keep/Use rules again/disable without facilitator correction. Any critical meaning/action error blocks pilot acceptance.                                                                                                                                                                             | R14, R18          |
| AC33 | Keyboard/focus and screen-reader checks cover settings, ordering, previews, grouped apply, conflict, partial results and recovery; automated checks supplement manual verification.                                                                                                                                                                                                                                                    | R14               |
| AC34 | At applicable 320 CSS px reflow/zoom, long Unicode/RTL/translated names and labels stay readable; target sizes and light/dark contrast meet WCAG 2.2 AA without drag-only or color-only operation.                                                                                                                                                                                                                                     | R14               |
| AC35 | Throttled/mobile and lost-response journeys keep essential context/actions usable, preserve permitted edits and reconcile without duplicate transfer; access loss clears disallowed local data.                                                                                                                                                                                                                                        | R11, R13–R14      |
| AC36 | Logs/notifications omit sensitive rule input and work content; lawful retention/redaction/export/backup recovery does not resurrect deleted protected text.                                                                                                                                                                                                                                                                            | R10, R13, R16     |
| AC37 | Publish a measured envelope for tenant/role/rule counts, overlap, largest portfolio, concurrent editing/bulk, p95/error/freshness and indexed query plans using real source authorization; incomplete preview coverage is disclosed.                                                                                                                                                                                                   | R15               |
| AC38 | Retained-data census and idempotent backfill preserve unknown/manual provenance and roles, cause no assignment/outward/access effects, and safely handle old/new readers and writers.                                                                                                                                                                                                                                                  | R17               |
| AC39 | Pilot disable/kill switch, mixed-version rollback and restore after new writes retain history/manual protections, fence stale work and preserve independent obligations.                                                                                                                                                                                                                                                               | R12, R17          |
| AC40 | Trace Q30 → D30 → glossary → exact owner/OpenSpec amendments → design/tasks/issues → source/security/concurrency/UI tests → release evidence, distinguishing selected/reviewed/ratified/implemented/qualified states.                                                                                                                                                                                                                  | R18               |

## Ruthless synthesis and execution order

**Before recording the reviewed answer:** fix the actual policy semantics,
manual/null provenance, role-aware identity, temporal application and work/access
separation. This review supplies those amendments and compares them with the
strongest simpler alternative. Record the user's combined choice; do not silently
fall back to A-only or treat every optional safeguard as another question.

**Capture in formal spec/design when invoked:** reconcile the five owner areas,
including A4/A12's role identity conflict. Define the exact assignment/primary/
protection command and current policy/event order before wiring a rule UI. Bind
only qualified source work and P12 actions; keep domain behavior separate from
physical implementation choices. Carry the complete R/AC trace into tickets.

**Require in implementation before activation:** complete one reviewed transfer
journey with source-safe manual exceptions, truthful impact and failure recovery.
Prove tenancy/grants/RLS, primary and role constraints, revocation, source-work
continuity, operation identity, compatibility and accessible mobile use. Then
qualify Auto for a bounded tenant cohort against the same commands, including
concurrent disable/Keep/revoke races. No UI or generic job result substitutes for
source proof. No optional Studio dependency or second portfolio store fills a gap.

**Monitor after gates pass:** the following role owners must be assigned to named
operators at rollout. A missing accountable operator blocks activation. Numerical
thresholds here are operational policy proposals, not measured current performance.

| Signal                                                                                 | Threshold                                                                                                                                          | Owner                                              | Response                                                                                                                                       |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized/cross-tenant assignment or private-data disclosure                        | Any confirmed occurrence                                                                                                                           | Security lead + P9 source owner                    | Disable the affected mutation/egress path, contain access and repair through the source; requalify before enabling.                            |
| Manual protection overwritten, stale Auto after disable or invalid primary/role result | Any confirmed invariant failure                                                                                                                    | P9/P27 engineering owner                           | Stop affected automatic writes, reconcile exact receipts/source history, correct lawfully and prove the failed schedule before resume.         |
| Required work loses accountable eligible responsibility without lawful disposition     | Any confirmed occurrence                                                                                                                           | Development operations owner + affected work owner | Surface source repair, stop affected transfer path and restore qualified responsibility without resurrecting access or fabricating completion. |
| Repeated reassignment for unchanged authoritative basis                                | More than one non-no-op transfer for the same responsibility and input/policy basis                                                                | Assignment service owner                           | Fence that policy scope, inspect duplicate/cyclic input and repair history/effects; do not hide churn with a longer polling interval.          |
| Projection/preview freshness                                                           | Any output represented as current beyond its predeclared source budget                                                                             | Source projection owner                            | Immediately mark Updating/unavailable, stop unsafe dependent application and reconcile source versions.                                        |
| Performance outside qualified envelope                                                 | p95 or error rate exceeds release-manifest numeric bound for two consecutive five-minute windows                                                   | Application operations owner                       | Bound bulk concurrency or disable affected enhancement, inspect query/worker load, requalify; preserve safe ordinary reads/edits.              |
| Critical staff misunderstanding or recurring manual workaround                         | Any reproducible harmful meaning/action error; or duplicate entry/DB repair for the same ordinary task in two independent incidents within 30 days | Product/UX + P27 engineering owners                | Block pilot/affected expansion, fix composition or source workflow and verify the scenario with representative staff.                          |

## Proof completed and limits

Repository/primary-source inspection, five focused evidence appendices, worked
counterexamples and independent review test the decision's consistency. The
[document verification](d30-evidence/review-checks.json) checks links, coverage,
traceability structure, formatting and preservation of prior artifacts. No old
runtime probe is rerun and no artificial implementation test is presented as live
qualification. Source services, grants/RLS, production-shaped concurrency, migration,
performance and observed usability remain explicit activation proofs.

## Final disposition

**Accept with required amendments.** Keep reviewed transfers as the default and
let tenants deliberately enable bounded automatic changes. Preserve staff intent,
source authority and independent work, and make every assignment's current state,
reason, control and next action understandable. This accepts the selected
flexibility while preventing silent portfolio churn and accidental access changes.
