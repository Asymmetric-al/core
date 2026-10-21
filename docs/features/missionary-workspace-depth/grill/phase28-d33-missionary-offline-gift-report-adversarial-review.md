# Phase 28 D33 — optional missionary reporting of actual offline gifts

**Disposition: Accept with required amendments.**

**The corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**
Reviewed October 18, 2026 UTC against `9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the working
tree. D32 remains ratified. This is research and decision development under the
[founder boundary](phase28-founder-brief.md:21), not formal PRD/ADR/OpenSpec,
implementation, permission activation or release qualification. The next researched
question is [Q34](phase28-q34-expired-referral-history-research.md).

## Exact corrected decision to record

> **D33 — Optional missionary gift reporting, off by default.** Authorized staff
> can enable or disable **Allow missionaries to report offline gifts** through
> one organization-wide setting. It starts Off for every tenant; later upgrades
> preserve the organization's explicit qualified choice. When enabled
> and currently authorized, Maya can deliberately report an eligible offline
> gift she actually received for the organization and see its permitted status.
> Reporting remains optional and uses the existing Phase 15 intake; finance
> continues or exactly reconciles that same occurrence.
>
> The short report records known facts and honest unknowns. It distinguishes who
> recorded it, what receipt or handling was reported, who reportedly has the gift
> and who is accountable next. It does not require a new donor, complete finance
> entry, check photograph, signature or routine second approval. A promise or
> donor's statement that a check was sent is not an actual-receipt report.
>
> Turning the setting Off stops new missionary reports at acceptance. It does
> not erase accepted reports, stop staff finance processing or complete remaining
> handling. Existing status, correction and handling actions remain subject to
> their own current permissions. Re-enabling does not submit saved drafts or
> replay rejected requests. An older actual receipt can be reported deliberately
> when currently permitted; its real occurrence date is preserved.
>
> Maya sees clear, separate facts such as **Awaiting finance**, **Recorded by
> finance** and **Handling still needed**, without unnecessary financial detail.
> Finance recording and physical handling can finish in either order. Errors,
> duplicates and corrections stay with the source owner and preserve lawful
> evidence; retry never creates another financial gift.
>
> A report creates no received-support total, deposit, bank clearance, commitment
> fulfillment, receipt, acknowledgment or automatic donor message. It grants no
> financial power. Existing staff entry remains available without a compulsory
> missionary report. No per-missionary exceptions, new intake ledger, parallel
> inbox or general workflow builder is introduced by this decision.

The founder's reason that most tenants will not want this is the basis for the
explicit **Off** default. It is a product judgment, not a measured adoption
statistic. No further product clarification is needed to preserve that direction.
The additional Off/retry/lifecycle language above resolves consequences of the
choice; the founder subsequently ratified the complete corrected decision and amendments.

## Evidence, authority and alternatives

| Evidence class            | Finding and practical limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Selected product behavior | A permits optional missionary reporting; the founder explicitly requires tenant disable and default Off. Organization-wide control is the smallest coherent setting, consistent with the request; no exception hierarchy is justified.                                                                                                                                                                                                                                                                                                                            |
| Existing owner contract   | [P15 D1](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:429), [P27 F56–F74](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:569) and [owner reconciliation](../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:21) already own the bounded actual-receipt intake, independent handling, exact finance continuation, unknowns, permissions and recovery. D33 adds the qualified missionary doorway and its organization control.                                                   |
| Governing boundaries      | [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md), [platform principles](../../../../openspec/specs/platform-principles/spec.md), [platform boundaries](../../../../openspec/specs/platform-boundaries/spec.md) and [contribution operations](../../../../openspec/specs/contribution-operations/spec.md) preserve native ownership, permission correctness and immutable posted finance. Operational intake cannot mutate posted rows. |
| Active OpenSpec           | [P27 contribution delta](../../../../openspec/changes/add-donor-development/specs/contribution-operations/spec.md) and [identity delta](../../../../openspec/changes/add-donor-development/specs/identity-and-access/spec.md) explicitly establish this source and separate reporting authority. The [proposal](../../../../openspec/changes/add-donor-development/proposal.md) remains a planning contract, not qualified runtime.                                                                                                                               |
| Current implementation    | The existing offline-entry bridge is deliberately unbound, with 501 dependencies; financial staging requires money-linked fields and is not this incomplete operational envelope. The unrelated organization-setting route uses a demo/default tenant. These are static incompatibilities with D33, not observed production exploits. Exact paths are in the [database review](d33-evidence/database-authorization.md).                                                                                                                                           |
| Current external evidence | Official missionary/nonprofit documentation corroborates gifts physically reaching missionaries, in-hand versus processed states, finance review and duplicate-entry hazards. It does not establish Core permissions or a universal ministry procedure. See [comparison](d33-evidence/comparable-products.md) and [UX research](d33-evidence/ux-and-primary-research.md).                                                                                                                                                                                         |
| Product judgment          | An optional short report with honest status can reduce an extra handoff. Off by default preserves the staff-mediated workflow for tenants that do not want it. Neither benefit nor likely adoption has been measured with Core users.                                                                                                                                                                                                                                                                                                                             |
| Unproved evidence         | No real P15 producer, hosted role/RLS catalog, live policy race, finance integration, mobile/assistive flow, representative user study or production capacity was qualified. The tests below distinguish bounded reasoning from required release proof.                                                                                                                                                                                                                                                                                                           |

**Strongest alternative:** staff record the intake after Maya passes along the
receipt details; she may still hold the gift. It introduces fewer reporting actors and requires no missionary
entry surface. It remains the default path when Off. It cannot by itself give
Maya a tracked report before staff enter it. A mandatory report, complete finance
form or duplicate missionary donation record would add friction and violate the
chosen source boundary; none is needed to solve this problem.

**External lessons do not override Core.** TntConnect's local gift entries and
matching/correction workarounds are not a second ledger to reproduce. MPDX's
warning about manual entries alongside synchronization supports the same-item
rule, not a ban on source-owned reporting. Givebutter's direct offline-entry
totals/receipt options are outside this report. Blackbaud batch approval does not
justify adding report approval. One organization's check-payee, forwarding,
currency or tax guidance is not a platform-wide rule. General form guidance is
adapted through Core's exact shared Base UI/base-maia system, not copied as a new
component library. No new external service or package is necessary.

## Source ownership and domain invariants

| Fact                                                                                                      | Authority                                                                    | D33 consumer boundary                                                                                          |
| --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Organization allows new missionary reporting                                                              | Qualified tenant settings/P12 command and current source admission predicate | Off by default; never a browser-only visibility flag or a role-name shortcut.                                  |
| Actual receipt/handling assertion, recorder, occurrence precision, current responsibility and disposition | P15 operational intake                                                       | Attributed report, not independently verified continuous custody.                                              |
| Existing Party identity and corrected/merged identity                                                     | P4 with applicable P12 disclosure                                            | Reported name may remain an assertion; report permission cannot create or merge a canonical donor.             |
| Accepted source lineage into staging, batch, posted contribution and subsequent correction                | P15/P13 financial owners                                                     | Same intake continuation or exact reconciliation, never a second posting to repair the view.                   |
| Posted money, deposit, clearance, commitment application, receipt and dispatch                            | Their existing P13/P15/P16/P7/P6 and related owners                          | Read only the exact qualified projection; reported amounts do not contribute to their outcomes.                |
| Outstanding operational task and eligible recipient                                                       | P15 source work projected through existing shared Tasks Hub                  | A generic task Done, assignment change or notification delivery cannot establish finance recording or custody. |

Invariants are intentionally small: every accepted report has one trusted tenant
and recorder, one stable source occurrence and accountable next work or owned
exception; independent reports can resolve to the same item while retaining both
origins. One check may have several designation lines. Distinct checks are not
merged by similar values. Each semantic command has at most one accepted effect;
exact financial coverage may resolve only the covered recording work. Neither
assignment nor posting proves physical transfer. Pending facts never become
received money by display aggregation. Current read authority applies independently
of historic author/holder/assignee status.

The organization setting gates **new missionary report admission**. It is not a
global P15 switch. A staff member who also has a missionary role acts through an
independently qualified staff context; a caller-controlled role flag cannot bypass
Off. The tenant setting also cannot enable an unqualified source. Deployment
safety may withhold an unsafe capability independently, while preserving accepted
facts and a qualified staff recovery route.

## Complete staff, missionary and finance journey

**Staff setup.** One setting reads **Allow missionaries to report offline gifts**,
initially Off. Help text: **“Let authorized missionaries report gifts they have
received for finance. This does not give them access to financial entry.”**
Reuse existing source routing and permission setup; no new per-project policy,
rule builder or mandatory notification configuration. Enable only when reporting,
minimal status, accountable source work and finance continuation are qualified.
If unavailable, explain the missing capability in staff-facing language without
asking staff to repair a technical integration. Saving the setting shows pending,
accepted or failed state truthfully; a successful save records actor and revision.

**Maya while Off.** Do not show an empty reporting dashboard, persistent upsell
or inert primary button. Ordinary giving records and the staff-mediated process
remain. If she already has permitted reports, retain their small status entry
point. A stale form explains **“New gift reports are turned off. Your report was
not submitted. Please follow your organization's usual handoff process.”** That
copy is used only after a definitive no-effect result; an uncertain response
requires **Check status**, not a claim of failure.

**Maya while On.** In the existing giving/finance context, show one action,
**Report a gift for finance**. A short single-column form says **“Use this for a
gift you actually received for your organization. Finance handles the financial recording.”**
Collect only source-required receipt/handling context and the useful facts she
knows. The organization/ministry context is visible and validated, not silently
inferred from an arbitrary profile field. Existing permitted supporter lookup is
optional; **Not sure** does not create an anonymous legal donor. Amount/currency,
type and receipt date are assertions with honest uncertainty. Current holder can
be different from the person who first received it; do not silently default an
old receipt to **Still with me**. The authoritative next responsibility comes
from qualified routing or an owned exception, not a guessed assignee.

Optional context stays secondary. No compulsory appeal, address, email, bank
number, photograph, signature, valuation, account code or tax date. No separate
preview modal for an ordinary report: the form itself shows the known facts and
one **Submit report** action. An explicit submission attributes the receipt
assertion; an extra checkbox or approval essay adds no necessary proof.

**After acceptance.** Show **Report submitted**, the permitted next action and
reference. Add **Awaiting finance** only when current source evidence confirms
it; finance may already have recorded the gift. If the current projection is
unavailable, preserve acceptance and say **Current status unavailable** rather
than guessing a pending or failed state. A source-backed list/details view lets Maya find it
again. Keep finance and handling distinct; show a second line only when relevant.
Do not require a new dashboard or global status taxonomy.

| Finance source                   | Handling source                    | Clear outcome                                                                             |
| -------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Not yet recorded                 | Still outstanding                  | **Awaiting finance**; permitted physical next step remains.                               |
| Recorded                         | Still outstanding                  | **Recorded by finance · Handling still needed**.                                          |
| Not yet recorded                 | Source-confirmed handling resolved | **Awaiting finance · Handling completed**; no false received funding.                     |
| Recorded                         | Handling resolved                  | **Recorded by finance**; no implication of bank clearance without separate evidence.      |
| Unknown, unavailable or disputed | Any                                | Explain the uncertain dimension; never replace it with zero, complete or a green success. |

**Finance continuation.** Staff open the source intake in their existing work
surface, see the recorder and asserted facts, and continue that record. They
complete identity/entity/tender/allocations through existing authorized entry,
or reconcile a gift already independently recorded. No retyping of known data
into another gift just to clear a task. Source-controlled physical handling and
financial recording remain independent; only qualified exact evidence closes
each relevant obligation. A mismatch becomes an accountable exception, not an
automatic merge or an endless generic “pending” state.

**Correction and Off.** Maya may use only correction/handling actions independently
allowed for that source; otherwise show a permitted staff-help route. An accepted
report is not deleted to fix a typo or rolled back because a response was lost.
Turning Off tells staff **“Stops new missionary reports. Existing reports and
finance work continue.”** No repeated confirmation is needed for this reversible
setting. Off does not silently reassign property or staff work. Re-enable never
submits old forms. A later deliberate report may describe an older actual receipt,
including one received while Off, using the real date and present handling facts.

**Coherence and accessibility.** Use existing record/list/form patterns, exact
base-maia, shared Base UI primitives and semantic Zinc tokens. Keep the main
status and next action prominent, with a restrained details/history disclosure.
No color-only statuses, hover-only help, dense finance grid or floating success
toast as the sole evidence. Test keyboard/focus, screen-reader feedback, 320 CSS
pixel reflow, mobile keyboard, large text, long names, Unicode/RTL, translated
copy and low bandwidth. Occurrence precision and business timezone remain
source facts; browser timezone never supplies a tax date. WCAG 2.2 AA's target
minimum/exception rules are distinct from Core's comfortable 44px preference.

## Exact required decision and design clauses

These are proposed amendments for ratification and later owner integration.
They specify observable outcomes and invariants rather than new table/component
names. Existing source requirements are inherited, not invented again in P28.

**C01 — Optional and Off by default.** One organization-wide setting SHALL control
new missionary reporting. New tenants and existing tenants without an explicit
qualified D33 choice SHALL start Off. Later upgrades SHALL preserve a deliberately
selected qualified On/Off value. Missing/invalid policy SHALL not authorize creation. No per-missionary,
project or tender exception engine is added. Ordinary staff entry remains usable.

**C02 — Qualified setting command.** Only a currently authorized tenant actor
SHALL change the policy. Derive tenant/actor from trusted context, validate exact
capability and relevant revision, and atomically accept policy, required audit
and semantic result. Visibility of settings or a role name is insufficient.
Concurrent changes and report admission SHALL share an authoritative fence; a
stale cache, token or pre-lock check cannot override a subsequently accepted Off.

**C03 — One existing owner.** P28 SHALL call the P15 operational-intake owner
through shared server services. It SHALL NOT directly insert donations, financial
staging, a new missionary gift ledger, receipt or task-as-source record. Existing
valid financial entry needs no mandatory prior report. P15/P27 source contracts
and ADR-0206's immutable financial boundary remain governing.

**C04 — Actual and eligible receipt.** A report SHALL be a deliberate attributed
assertion of actual receipt for an eligible organizational purpose, under current
source/context rights. A promise, sender's mailing claim, form draft, assignment
or entered date alone SHALL not qualify. Supported cash/check and other tender
paths require their existing owner qualification; unknown tender or a known
payee/purpose problem can remain a restricted operational exception, not proof of
an acceptable organizational donation, invented noncash value, inventory or financial rights.

**C05 — Honest incomplete facts.** Known donor/amount/currency/entity/allocation
facts SHALL retain assertion/provenance and permitted scope; unknowns SHALL remain
explicit within a restricted nonfinancial envelope. Required tenant/source identity
and accountability SHALL remain nonnull. Do not create a fake Party, default
financial entity/currency, zero money value or nullable financial-root escape.
If a monetary amount is supplied, its currency/unit must be known and validated
with exact supported precision; do not silently round or aggregate unlike units.
Unresolved literal amount information may remain an attributed source assertion,
not a normalized financial amount or a demand to guess its currency.

**C06 — Distinct attribution.** Server-derived recorder, tenant, acceptance time
and operation identity SHALL remain distinct from asserted receipt time/precision,
reported receiver/holder and current responsible actor. Caller-supplied actor,
author, approval, owner or audit fields SHALL not acquire trusted meaning. A
selected holder is an assertion to validate, not an access grant or verified chain
of custody. Date-only/approximate facts SHALL not manufacture an exact timestamp.

**C07 — Independent current powers.** Create, read, correct, route, financial
entry/post/correction, Party mutation, commitment, receipt and communication SHALL
have separately qualified current capabilities. Feature On is necessary but not
sufficient for missionary creation. Re-prove actual acting context, source scope,
field/purpose floors and time-bound authority at final acceptance after waits.
Existing submissions and minimal results SHALL disclose only what is permitted now.
Any actual projection-policy widening SHALL follow
[ADR-0211](../../../adr/0211-distinct-human-approval-for-projection-widening.md);
ordinary reports and
policy toggles within an already qualified projection SHALL not acquire routine
second approval. The feature switch itself is not approval to widen disclosure.

**C08 — Database and alternate-path closure.** Enforce same-tenant source keys,
required relationships, exact semantic uniqueness, immutable attribution and
allowed lifecycle/resulting states through owner commands and database constraints
where possible. Review grants, RLS old-row `USING` and new-row `WITH CHECK`, SELECT
needs, views/RPCs, function ownership/search paths, exports, imports, service-role
and repair entry points. Prevent a permitted row update from changing tenant,
source, author or financial meaning into a forbidden state. No unprotected
financial-staging access or destructive history cascade follows from report access.

**C09 — Atomic acceptance.** Accepted report/correction/disposition, required
source history, semantic command receipt and required durable work intent SHALL
commit coherently under the owner boundary. Required accountability cannot wait
for a best-effort notification. Secondary views/attention may retry from durable
intent. External I/O SHALL remain outside the database transaction; projection
failure SHALL not undo or repeat an accepted report or financial commit.

**C10 — Retry binds the business effect.** A tenant/actor/context-scoped semantic
operation SHALL bind its reviewed intent, not merely a transport request. Same-key
accepted retries SHALL recover the original effect under current disclosure even
after Off, without re-execution or newer-state overwrite. Changed payload SHALL
conflict. An Off rejection is a terminal no-effect outcome, never queued for On;
later deliberate submission after review uses a new intent. An unknown response
SHALL offer same-operation recovery before any replacement submission. Retention
of minimized dedupe evidence SHALL preserve this guarantee without restoring PII.
A stale reviewed policy after an intervening Off/On cycle SHALL likewise require
fresh deliberate review and a new intent; a terminal no-effect result cannot turn
into acceptance by substituting the current revision behind the user's action.

**C11 — Off and re-enable lifecycle.** Off SHALL fence new missionary acceptance,
including stale forms and delayed workers, while preserving accepted occurrences,
staff processing and separately authorized reads/corrections/handling. It SHALL
not transfer, close, delete or relabel obligations. Re-enable SHALL not auto-submit
or resurrect ended work. Older actual receipts may be deliberately reported under
current authority; preserve actual occurrence precision and current handling.

**C12 — Same-item finance continuation.** Finance SHALL continue or exactly
reconcile the source intake through existing staging/batch/commit, retaining
lineage across splits, moves, carried rows and corrections. Exact already-posted
results SHALL be linked without reposting, reissuing receipts or reapplying money.
Only qualified source coverage resolves its covered recording work; no matching
amount/date/name/check number or generic task state substitutes for that proof.

**C13 — Duplicates and cardinality.** Same-intent retry SHALL deduplicate one
command; independent human reports SHALL retain separate origins until qualified
source resolution establishes one item. One check with multiple designations is
not multiple physical gifts, and distinct checks are not silently merged. Unknown
collections SHALL remain unresolved operational reports until source-qualified
constituents are established. Reconciliation SHALL not imply universal one-to-one
report/header cardinality or require a speculative general matching engine.

**C14 — Independent lifecycle dimensions.** Financial recording, reported
possession/transfer, deposit, clearance, Request/appeal, commitment and fulfillment
SHALL remain separate. Posting resolves only exactly covered recording; handling
may finish first or later. Return/loss/dispute/mistake/rejection/duplicate SHALL use
attributed source dispositions with precise remaining work. A reversal/NSF SHALL
not resurrect physical possession. Generic Done/archive/TTL/departure SHALL not
erase unresolved obligations; genuinely resolved work need not remain pending.

**C15 — Corrections and concurrency.** Serialize material assertion correction,
duplicate/identity resolution, source-lineage resolution and disposition under the
owner's relevant revisions/fences. Reject stale conflicting new commands while
recovering prior accepted results without overwriting later state. Ordinary notes,
display or responsibility edits SHALL not erase financial lineage or restart
recording. Corrections to intake assertions SHALL never mutate posted finance;
source financial corrections retain their separate policy, including C-01 where
applicable. No full-process failure is required for unrelated permitted changes.

**C16 — Accountable existing work.** Every accepted report SHALL have qualified
current next responsibility or an owned unresolved exception using existing
source Tasks Hub/attention identity. Route only to eligible current recipients;
do not guess an all-staff audience or fallback assignee. Recipient departure or
access loss requires source reassignment/recovery without falsely moving the
gift. No parallel inbox, mandatory report review, automatic donor reminder,
personal thank-you task or financial acknowledgment arises from reporting alone.

**C17 — Minimized current disclosure and retention.** Report/source names,
amounts, references, counts, tasks, history, receipts of commands, search, export,
caches, Realtime and logs SHALL obey current tenant/field/purpose floors. Protect
unknown-donor assertions and sensitive ministry context; report authority does
not expose all CRM or finance. No check images, bank/card numbers, OCR or new
attachments. Use source-class retention/redaction/disposal and restore rules;
pending real obligations cannot expire by draft cleanup, and completed PII cannot
be retained indefinitely merely because audit exists. Operational/security logs
SHALL not copy report bodies. No new coach/public/donor projection is authorized.

**C18 — Clear staff control.** Settings SHALL state Off default, exact eligible
actor scope and that Off stops only new missionary reports. Reuse current routing
and permissions; no rule builder. Show authoritative save status and recover
ambiguous saves. Enable only a qualified narrow source lane with accountable
recovery, not merely a visible toggle; absence of a producer SHALL not induce staff
to configure fictional finance fields or require all future accounting features.

**C19 — Short missionary flow.** Use one optional action, one short form and one
deliberate submission with known facts/unknown choices, visible scope and no
compulsory finance fields, photo, signature, approval, second modal or essay.
Show an authoritative result and findable permitted status. Explain financial
recording and remaining handling separately, with current next action. When Off
and no retained permitted reports exist, omit unused reporting UI. Keep ordinary
giving and staff help coherent. Prove actual keyboard, screen reader, phone,
international text, reflow, contrast, focus and status feedback with shared UI.

**C20 — Honest failure and current context.** Distinguish unsent, saving, accepted,
definitively rejected, unknown response, source unavailable, conflict and denied.
Do not close the form or claim success before authoritative acceptance; do not
label a timeout as rejection. Provide same-intent Check status/Retry without
duplicate work. Tenant/account switch or revocation SHALL clear forbidden content
and prevent late responses from exposing or replaying prior context. No default
sensitive persistent browser queue, offline auto-submit or background retry of a
terminally rejected report is introduced.
Before submission, Cancel discards only the unsent form. After submission,
closing the form, browser or connection SHALL not claim cancellation of an
accepted or in-flight command. A mistaken accepted report uses its qualified
source disposition; no delete-and-recreate shortcut is introduced.

**C21 — Bounded workload.** Reuse source list pagination, indexed scoped lookup,
bounded reconciliation and established admission/rate controls. Before release,
declare numeric payload/page/batch/retry ceilings and query/command/recovery
budgets with units, based on source-shaped skewed-tenant tests. Test below/at/above
each boundary, concurrent edits and failed recovery. Never silently truncate,
aggregate full tenant history per row or claim scale from a synthetic model.

**C22 — Durable history and operations.** Keep attributable policy changes,
receipt assertions/corrections, duplicate origins, accepted source lineage,
dispositions, current responsibility and semantic results in lawful business
history. Technical traces SHALL identify failed stages with minimized references,
not substitute for history. Named source/permission/operations/product owners
SHALL own the synthesis's signals and response thresholds; recovery uses supported
commands rather than direct SQL edits or reposting money.

**C23 — Safe rollout, disable and restore.** Activate only after the exact
P15/P12/settings/shared-task/finance consumer seams are qualified. New and upgrade
policies start Off when no explicit qualified D33 choice exists; later upgrades
preserve that choice. Do not infer opt-in from roles, old gifts or a legacy setting.
Mixed code/schema, old writers, imports, workers and restore SHALL preserve current
Off, consumed operation identities and newer source/privacy restrictions. A kill
switch fences unsafe admission without rewriting saved preference, erasing intake
or stranding qualified staff recovery. Roll forward accepted data; no destructive
downgrade or historical report/task backfill is implied.

**C24 — Traceable qualification.** Reconcile D33 into its glossary and later
authorized P15/P12/P28/settings/Tasks Hub contracts, OpenSpec/design/tasks/tests and
release evidence with exact clause/proof IDs. Preserve E7, C-01 and other owner
gates only on dependent paths. Research, static analysis, bounded models and
ratification SHALL not be labelled implemented, source-qualified or released.

## Consolidated adversarial findings

Severity and likelihood are qualitative judgments about an implementation that
omits the stated prevention, not measured incidents or predictions. Each row
states the harm, evidence, effect on A and exact permanent requirement. The next
matrix evaluates every requested category independently without duplicating fixes.

| ID  | What could go wrong and why it matters                                                                                                                            | Severity / likelihood; evidence or reasoning                                                                            | Effect on answer and permanent fix / exact change                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| F01 | A missionary report becomes a second donation or changes funding, receipts or fulfillment. Financial truth and donor trust diverge.                               | Critical / plausible if direct-entry precedents are copied. P15 D1, P27 F56/F68, ADR-0206 and vendor contrasts.         | Narrows A to operational intake; C03–C05, C12, C14.                                                                          |
| F02 | Developers widen the retired 501 bridge, financial staging or default-tenant setting handler. Existing-looking code supplies the wrong root, scope and atomicity. | High / plausible; static paths and migration evidence in database review, not a demonstrated exploit.                   | Changes implementation path: use qualified owners, close legacy writers; C02–C03, C08–C09, C23.                              |
| F03 | Off only hides a button, or deletes/hides accepted work; re-enable silently sends an old form. Checks can disappear from accountability or arrive unexpectedly.   | High / likely ambiguity in “turn off.” P27 independent powers and survival requirements.                                | Explicit new-admission meaning, authoritative fence, no auto-replay; C01–C02, C10–C11, C18.                                  |
| F04 | Role labels, profile membership, caller-selected tenant or stale grants admit or reveal another person's/tenant's report.                                         | Critical / plausible across API, recovery and service paths; P12 and active identity delta.                             | Preserve exact current action/context and disclosure; C02, C06–C08, C17, C20.                                                |
| F05 | A permitted update changes tenant, author, source or state; raw table/view/RPC access bypasses the intended command.                                              | Critical / plausible without resulting-row and privilege review; PostgreSQL/RLS semantics and current staging examples. | Enforce immutable attribution, tenant-aware keys and every alternate entry path; C06–C08, C15.                               |
| F06 | Double-click, lost response, a second reporter or already-posted finance produces duplicate intake or money; heuristic dedupe merges distinct checks.             | High / likely in retry/manual handoffs; MPDX warning and P27 F61/F67.                                                   | Separate semantic retry from item resolution, retain origins and exact source lineage; C10, C12–C13.                         |
| F07 | Report commits but work/audit/result does not, or projection repair repeats financial entry. The system loses responsibility or posts twice.                      | High / plausible with multiple writes/remote effects; P27 F66 and current staged-mutation anti-pattern.                 | Atomic owner effect/history/receipt/intent, idempotent projection and original-result recovery; C09–C10, C12, C16.           |
| F08 | A required donor/amount/date field forces guesses; unknown Entity becomes wildcard access or approximate time becomes tax evidence.                               | High / likely if a finance form is reused; P15 operational envelope and P27 F57/F58/F68.                                | Honest unknowns, exact known currency units, attributed time precision, no fake financial root; C04–C06.                     |
| F09 | “Done” conflates posting with physical transfer or clearance; return/reversal invents renewed possession. Real property handling is lost.                         | High / likely with one status enum; P27 F62–F64 and concrete opposite-order scenarios.                                  | Independent dimensions and source dispositions, clear two-line status when relevant; C12, C14, C19.                          |
| F10 | A late correction or stale retry overwrites source lineage, restores an ended occurrence or restarts recording after an incidental edit.                          | High / plausible in concurrent finance/report edits; P27 F67.                                                           | Relevant source serialization, original-result recovery, precise correction scope; C10, C12–C15.                             |
| F11 | Donor assertions, check data or ministry details leak through search/counts/logs/history/cache/export; restored backups revive disposed data.                     | High / plausible across secondary surfaces; P27 F69 and current-authority invariants.                                   | Minimal fields, protected projections, finite source retention and restore fences; C07–C08, C17, C20, C23.                   |
| F12 | Long forms, nested dialogs, ambiguous save states and hidden phone actions make reporting harder than handing details to staff.                                   | Moderate / likely if staff finance UI is mirrored; Core principles and primary form/accessibility guidance.             | One short ordinary form, explicit optional unknowns, persistent result, accessible recovery; C18–C20.                        |
| F13 | “Flexible” expands into per-person rules, mandatory approvals, photos, custody signing, arbitrary routing or a new workflow system.                               | Moderate / plausible scope creep; none is selected or required by P27 intake.                                           | One optional org setting, reuse owners and source actions; C01, C03, C16, C18–C19.                                           |
| F14 | No eligible finance recipient, staff departure or unknown Entity leaves an accepted report ownerless; a guessed fallback leaks it.                                | High / plausible in real staffing changes; P27 F57/F65/F72.                                                             | Qualified accountable next work or owned exception, safe reassignment independent of physical facts; C05–C07, C16, C18, C22. |
| F15 | List totals, duplicate search, large input or repair scans become unbounded; retry storms starve another tenant.                                                  | Moderate / unknown frequency without workload evidence; inherited source list/repair costs.                             | Bounded indexed owner operations and measured numeric release budgets; C21–C22. No invented capacity claim.                  |
| F16 | Staff cannot explain who reported/corrected/resolved an item or recover a failed handoff without developer SQL.                                                   | High / plausible if logs replace history or failure is silent; P27 F66/F73.                                             | Durable minimized business evidence, named monitors and supported recovery; C09–C10, C16, C22.                               |
| F17 | Upgrade defaults opt tenants in; old writers or restored policy bypass Off; rollback destroys unresolved handling.                                                | High / plausible during mixed deployment; P27 F72 and owner immutability.                                               | Explicit Off migration, writer fencing, safe disable and roll-forward/restore reconciliation; C01, C08, C23.                 |
| F18 | A plausible spec/model is mistaken for live capability or evidence that most ministries prefer this; downstream artifacts contradict the decision.                | High / plausible in a developing spec; document authority and founder transition boundary.                              | Label evidence classes, exact trace and real source/UX/load proof; C21, C24 and acceptance matrix.                           |

## Every requested review category

| Category                                                  | Material concern? Independent assessment                                                                                                                                                                                                                                | Required resolution                                                                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, alternatives                 | **Yes.** The actual-receipt handoff is corroborated, but universal demand is not. Staff-entered intake is a strong default alternative; a second gift system solves the wrong problem. F01/F13/F18.                                                                     | A remains optional and Off; only add the missionary consumer. C01/C03/C24.                                                                    |
| Brittleness                                               | **Yes.** An open form, assumed current holder, complete donor data or always-available finance source is fragile. F03/F08/F14.                                                                                                                                          | Current admission, honest unknowns and owned recovery; C04–C07/C11/C16/C20.                                                                   |
| Technical debt                                            | **Yes.** Reusing legacy financial staging/501 bridge or duplicating intake logic freezes the wrong abstraction. F02/F13.                                                                                                                                                | Existing qualified owner commands and shared UI; C03/C08/C18/C23.                                                                             |
| Edge cases                                                | **Yes.** Older receipts, unknown donor/entity, split checks, independent duplicate reports, opposite-order posting/transfer and NSF are realistic. F06/F08–F10.                                                                                                         | Explicit occurrence, identity and orthogonal outcome rules; C04–C06/C10–C15.                                                                  |
| Footguns                                                  | **Yes.** Off as delete, generic Done, donor auto-creation and blind Retry make accidental harm easy. F01/F03/F06/F09.                                                                                                                                                   | Narrow settings and meaningful actions; C01/C05/C10–C14/C19–C20.                                                                              |
| Tenant safety                                             | **Yes.** Default tenant, tenant switching, cached results and privileged paths can cross boundaries. F02/F04/F11.                                                                                                                                                       | Trusted exact scope and current authorization on every route/projection; C02/C06–C08/C17/C20.                                                 |
| Database, RLS, authorization safety                       | **Yes.** Old/new state, grants, source FKs, functions/views/service paths and atomic effects all matter. Unknown financial facts must not weaken required scope. F04–F08.                                                                                               | Exact tenant-aware constraints, immutable attribution, denied alternate writes and proven atomic commands; C05–C10/C15.                       |
| Overengineering                                           | **Yes.** Per-person settings, custody ledgers, uploads, approval chains or a configurable intake builder add unrequested burden. F13.                                                                                                                                   | One org control and the existing source workflow; C01/C03/C16/C18–C19.                                                                        |
| UX/UI and user friction                                   | **Yes.** Copying finance entry or conflating status undermines the user journey, especially on phones. F08/F09/F12.                                                                                                                                                     | Short form, progressive detail, clear status and actual accessible recovery; C18–C20. No new donor step.                                      |
| Source of truth, ownership, invariants                    | **Yes.** Reported receipt is not posted money, identity, transfer or clearance. F01/F06/F09.                                                                                                                                                                            | Keep each fact with its existing owner; C03–C06/C12–C16.                                                                                      |
| Hidden coupling                                           | **Yes.** Requiring appeal completion, workflow automation, full finance rollout or raw finance-read permission blocks a narrow useful report. F01/F13/F14.                                                                                                              | Exact source capability/recipient gates only; minimal completion projection and independent staff continuation; C07/C12/C16/C18/C24.          |
| Failure modes                                             | **Yes.** Lost replies, accepted source followed by failed projection and inaccessible recovery can duplicate or strand work. F03/F06/F07/F14.                                                                                                                           | Atomic local effects, durable work intent, current result recovery and actionable exceptions; C09–C12/C16/C20/C22.                            |
| Lifecycle, temporal correctness, concurrency, idempotency | **Yes.** Off racing submission, stale On after an intervening Off, old receipt dates, correction/resolution races and replayed terminal rejections need exact meaning. F03/F06/F10.                                                                                     | Current policy plus relevant revisions; terminal no-effect Off result, deliberate new intent, independent source dimensions; C02/C06/C09–C15. |
| Data integrity risks                                      | **Yes.** Fake donors, guessed amounts, double reports/money and partial lineage corrupt reporting. F01/F06–F10.                                                                                                                                                         | Honest incomplete envelope, exact finance lineage, qualified identity/duplicate resolution; C05–C06/C09–C15.                                  |
| Security and privacy risks                                | **Yes.** A narrow reporter may obtain raw finance/CRM data or leave sensitive copies outside retention. F04/F05/F11.                                                                                                                                                    | Minimal scoped projections, no check/bank capture, lawful history/disposal and current disclosure; C07–C08/C17/C20/C23.                       |
| Scalability and performance                               | **Yes.** Bounded source work is viable, but no measured capacity is established. F15.                                                                                                                                                                                   | Numeric limits with units and source-shaped boundary/concurrency tests before activation; C21.                                                |
| Operational burden                                        | **Yes.** Routine manual duplicate repair, ownerless work or SQL fixes defeat the purpose. F06/F14/F16.                                                                                                                                                                  | Continue the same intake, route qualified work, expose supported recovery; C12–C13/C16/C22.                                                   |
| Observability and auditability                            | **Yes.** Technical logs alone cannot prove an attributed receipt, correction or exact resolution. F07/F16.                                                                                                                                                              | Business history and semantic receipts separate from minimized diagnostics; C06/C09–C10/C22.                                                  |
| Dependency and integration                                | **Yes, at existing owner seams; no new vendor dependency.** A missing P15 producer or inconsistent finance result cannot be replaced with local state. F01/F02/F07.                                                                                                     | Qualify the narrow existing contracts and reconcile exact source effects; C03/C09/C12/C23–C24.                                                |
| Migration, rollout and upgrade                            | **Yes.** Auto-enabling tenants, old writers and stale restores can violate Off or lose obligations. F17.                                                                                                                                                                | Explicit Off activation, mixed-version fences and safe roll-forward; C01/C08/C23.                                                             |
| Testability, traceability and proof                       | **Yes.** “Optional,” “received,” “status” and “same record” otherwise lack falsifiable meaning. F18.                                                                                                                                                                    | C01–C24 and P01–P36 with source/UX proof; preserve selected versus ratified/runtime status.                                                   |
| Other development hazards                                 | **No additional material concern beyond those mapped.** Checked unsupported financial advice, new platform/vendor coupling, bypass via alternate role, needless file/AI features and false adoption claims. They are either excluded or explicitly resolved in F01–F18. | Keep the bounded scope and source qualification gates; no speculative subsystem or universal ministry policy.                                 |

## Acceptance criteria and release proof

These are required observable outcomes for the later authorized implementation,
not results claimed by this document. A bounded model cannot prove database,
real authorization, provider, browser or deployment behavior.

| ID  | Falsifiable acceptance criterion                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01 | New tenants and existing tenants without a qualified explicit D33 choice start Off; later upgrades preserve deliberately chosen On/Off. Missing/malformed policy does not allow missionary creation. Existing staff entry works without a preliminary report.                                                                                                                                                                                                |
| P02 | Authorized staff enable/disable exactly their current tenant with audited revision and result; unauthorized actors, forged tenant and stale conflicting settings changes are denied without mutation.                                                                                                                                                                                                                                                        |
| P03 | With On and exact current reporting capability, Maya submits an actual eligible receipt once; a role label or On alone is insufficient.                                                                                                                                                                                                                                                                                                                      |
| P04 | Submit begun while On but accepted after Off creates nothing. Policy/auth changes during lock waits are respected at acceptance. No API, worker or stale cache bypasses Off.                                                                                                                                                                                                                                                                                 |
| P05 | Accepted report then lost response then Off recovers the same permitted result with no new report. Off rejection remains no-effect after re-enable; a new deliberate reviewed intent can report the older receipt.                                                                                                                                                                                                                                           |
| P06 | On→Off→On does not auto-submit old forms or let a stale reviewed policy revision silently act as fresh intent. Any retry/review requirement is clear and preserves safely usable input.                                                                                                                                                                                                                                                                      |
| P07 | Off retains accepted intake, independent staff finance, qualified minimal status and separately authorized correction/handling. It neither reassigns nor marks anything Done.                                                                                                                                                                                                                                                                                |
| P08 | Promise, mailing claim, draft, assignment or entered date alone cannot create actual-receipt evidence. A report distinguishes the recorder, asserted receiver/holder and responsible next actor.                                                                                                                                                                                                                                                             |
| P09 | Unknown donor/amount/intended Entity/allocation/tender can remain honest operational exceptions without fake Party, USD, zero value or nullable financial root. Tenant/source/accountability are still required.                                                                                                                                                                                                                                             |
| P10 | Known amount/currency honors source units, zero-/three-decimal currencies and exact supported bounds; invalid precision/overflow is explained without rounding. Unknown and noncash do not enter cash totals.                                                                                                                                                                                                                                                |
| P11 | Date-only/approximate or older occurrence remains distinct from server acceptance time and tax/deposit dates; localization/timezone display does not change source meaning.                                                                                                                                                                                                                                                                                  |
| P12 | Cross-tenant and cross-context create/read/update/recovery fail through API, direct database grants/RLS, views/RPCs, imports, privileged and repair paths; old/new-row tests prevent scope/author/source transformation.                                                                                                                                                                                                                                     |
| P13 | Report power cannot post/correct finance, create/merge canonical donors, apply commitments, issue receipts or read unrestricted finance/CRM. Multi-role users require the actual independently qualified acting context. Actual projection-policy widening requires ADR-0211 proof; routine reports/toggles within a qualified projection need no new second approval.                                                                                       |
| P14 | Double-click/reconnect/same-intent replay produces one effect and original result. Changed payload conflicts; later corrected/disposed source state is not overwritten by recovery.                                                                                                                                                                                                                                                                          |
| P15 | Inject failure before and after acceptance: required state/history/result/work intent are all committed or none. Failed secondary task/attention projection retries without another report or financial write.                                                                                                                                                                                                                                               |
| P16 | A report with no currently eligible next person enters a qualified owned exception; no guessed all-staff recipient or ownerless acceptance. Reassignment after departure preserves handling facts.                                                                                                                                                                                                                                                           |
| P17 | Finance continues the same occurrence through staging/commit and qualified split/carry-forward; no repeat entry is required merely to update the missionary view.                                                                                                                                                                                                                                                                                            |
| P18 | An already-posted exact gift reconciles to the report without posting, receipting or applying money again. Matching name/amount/date/check number alone cannot resolve it.                                                                                                                                                                                                                                                                                   |
| P19 | Two independent reports about the same physical item retain both origins during qualified resolution; two distinct checks with equal values remain distinct. One check with multiple designation lines is not duplicated.                                                                                                                                                                                                                                    |
| P20 | An unresolved collection is not asserted to be one verified financial gift. Partial financial coverage closes only covered recording work and preserves remaining accountable items.                                                                                                                                                                                                                                                                         |
| P21 | Posting before transfer shows Recorded by finance plus handling still needed. Transfer before posting preserves Awaiting finance. Neither implies bank clearance.                                                                                                                                                                                                                                                                                            |
| P22 | Return, loss, mistake, rejection, dispute and duplicate dispositions retain exact evidence and remaining work; genuinely resolved exceptions terminate applicable work.                                                                                                                                                                                                                                                                                      |
| P23 | Reversal/NSF changes current financial projection without reviving physical possession or erasing original recording. Generic task Done/archive/departure cannot drop unresolved handling.                                                                                                                                                                                                                                                                   |
| P24 | Material correction racing posting-lineage or duplicate resolution is serialized or conflicts safely. Incidental note/assignee changes do not clear lineage or restart recording. Financial correction retains its own authority/policy.                                                                                                                                                                                                                     |
| P25 | Reported amounts never change received-support/public progress, deposit, clearance, commitment or fulfillment. Submission emits no receipt, acknowledgment, donor message or automatic personal gift-follow-up purpose.                                                                                                                                                                                                                                      |
| P26 | Current privacy/anonymity/classification rules hold for report fields, minimal results, search/counts/tasks, exports, history, Realtime, logs and error messages. Hidden canonical matching cannot be inferred from UI responses.                                                                                                                                                                                                                            |
| P27 | Retention/disposal removes/redacts eligible sensitive content while preserving lawful unresolved responsibility and minimized consumed-effect proof; restored backups cannot resurrect revoked access, disposed PII or duplicate effects.                                                                                                                                                                                                                    |
| P28 | Tenant/account switch, logout or revocation clears forbidden content; delayed responses do not reveal or apply the prior context. Default browser storage contains no sensitive offline report queue.                                                                                                                                                                                                                                                        |
| P29 | The ordinary journey needs one short report form and deliberate submission; no required donor creation, photo/signature, full financial fields, second modal, approval or appeal. Off without history leaves no unused reporting clutter.                                                                                                                                                                                                                    |
| P30 | Staff understand On/Off, source readiness and continued accepted work. Maya distinguishes Report submitted, Awaiting finance, Recorded by finance and remaining handling; finance continues the same item. Any critical misunderstanding blocks activation until corrected and retested.                                                                                                                                                                     |
| P31 | The actual composed flow supports keyboard, screen reader, focus/overlay return, error summary and status announcements; 320 CSS pixel reflow, large text, international/RTL names, translated labels and both themes remain usable.                                                                                                                                                                                                                         |
| P32 | Low-bandwidth and lost-response tests retain honest saving/unknown/rejected states and same-operation recovery; the UI never suggests another report for an uncertain accepted one. An accepted report with unavailable current projection remains accepted with status unavailable, not assumed Awaiting finance. Cancel before submission creates nothing; closing after submission does not cancel accepted/in-flight work or replace source disposition. |
| P33 | Declare and test payload/page/batch/retry limits at limit−1, limit and limit+1 with units, skewed tenants and concurrent policy/correction/finance work. Query plans, memory and p95/p99 latency meet approved measured budgets without N+1 or silent truncation.                                                                                                                                                                                            |
| P34 | Operations can detect and recover failed projection, overdue owned exceptions and policy/source errors through supported commands; durable history explains actor, origin, disposition and exact finance lineage without sensitive log bodies.                                                                                                                                                                                                               |
| P35 | Mixed old/new readers/writers, deployment kill switch, rollback and restore preserve Off/current source restrictions, accepted reports, consumption receipts and staff recovery; no historical report flood or destructive downgrade occurs.                                                                                                                                                                                                                 |
| P36 | D33 and the glossary trace to authorized owner/OpenSpec/design/task/implementation/test/release artifacts by C/P IDs; generated mirrors stay coordinated and none claims qualification from this review alone.                                                                                                                                                                                                                                               |

## Ruthless synthesis and ordering

1. **Resolve before recording a settled amended answer:** retain the selected A,
   tenant control and Off default. Adopt the exact creation-only Off boundary,
   preserved accepted work, deliberate re-enable behavior, one P15 intake and
   independent financial/physical states. This document supplies the complete
   corrected recommendation; no engineering choice is left to an ambiguous toggle.
2. **Capture in the later authorized spec/design:** reconcile C01–C24 into the
   existing P15/P12/settings/Tasks Hub/P28 owners and exact consumer contracts.
   Do not create another intake domain. Add the bounded missionary actor and
   minimal status projection; keep staff finance operations independent. Source
   qualification dependencies block only this lane or their affected subpaths.
3. **Require before activation:** actual producer, policy/authority fences,
   atomic semantic outcomes, exact lineage, independent handling, recovery,
   database/alternate-path closure, retained-data migration and the composed
   staff/Maya finance journey. P01–P36 require actual evidence. Start Off and
   activate only explicitly chosen qualified tenants; do not infer adoption.
4. **Monitor only residual operations and usability after prevention is proved:**
   use the following signals. Values are proposed operating triggers, not measured
   capacity or an excuse to ship known integrity/privacy defects.

| Owner                                    | Named signal                                                                           | Threshold                                                      | Response                                                                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P12 security maintainer                  | Unauthorized report/policy acceptance or cross-context disclosure                      | Any 1 confirmed occurrence                                     | Contain the affected route, preserve lawful evidence, invoke incident response and requalify all entry paths before re-enable.                         |
| P15 intake maintainer                    | Duplicate semantic effect, false finance resolution or missing required accountability | Any 1 confirmed occurrence                                     | Fence affected admission/resolution, recover through owner commands, preserve money and add the failing regression before restore.                     |
| P15 operations owner                     | Accepted work intent with no projection progress                                       | Older than 5 minutes, or any terminal retry failure            | Follow inherited MON27-110: investigate/replay the bounded projection; retain accepted report and show honest updating. Do not resubmit or repost.     |
| P15 operations owner                     | Same-intent repair repeatedly fails                                                    | 3 consecutive failed attempts                                  | Stop noisy retries, route an owned operational exception and use supported diagnostic/recovery actions.                                                |
| Tenant finance operations owner          | Accepted item exceeds its existing configured next-action deadline without progress    | First missed applicable deadline                               | Review current responsibility and real remaining work; reassign/escalate through existing qualified routing. No new global SLA or fabricated due date. |
| Missionary Workspace product owner       | User believes a report posted money or Off deleted a submitted report                  | Any 1 credible unsafe misunderstanding before or after release | Follow inherited MON27-112: block release or contain affected presentation, correct and retest before pilot expansion.                                 |
| Missionary Workspace accessibility owner | Blocking report/status/recovery failure with supported assistive input or phone layout | Any 1 reproducible blocking failure                            | Fix shared UI composition and repeat the failing actual journey before affected activation.                                                            |

The source thresholds preserve [P27 operations](../../../prds/sitestacker-parity/phase-27-donor-development/operations.md:116),
including MON27-110 and MON27-112; D33 does not relax inherited controls.
Assign actual maintainers to these functional roles before activation. Numeric
workload and latency budgets must come from the implemented source and actual
release workload; inventing them here would freeze unsupported claims. Unresolved
authorization, financial identity and custody truth are prevention gates, not
monitor-only risks.

## Evidence and verification limits

Independent [governance/lifecycle](d33-evidence/governance-and-lifecycle.md),
[database/authorization](d33-evidence/database-authorization.md),
[UX](d33-evidence/ux-and-primary-research.md),
[comparable products](d33-evidence/comparable-products.md) and
[counterexample review](d33-evidence/counterexample-review.md) inform the corrected
answer. Fresh primary sources are dated and their limits stated in those notes.
The [bounded model](d33-evidence/model-readme.md) and
[root reproduction](d33-evidence/root-reproduction.json) test specified semantic
counterexamples only; no real source, SQL/RLS, lock contention, browser,
performance or user study is claimed. Independent final challenges are recorded
in [cross-review resolution](d33-evidence/cross-review-resolution.md).

The revised model passed **91 outcome assertions across 15 counterexample
families and 5 positive controls**, reproduced byte-for-byte by the root reviewer.
The initial 79-assertion model and notes are preserved after the root found its
missing On→Off→On stale-review case; the revised model also makes ministry-context
scoping explicit. These counts establish only the described finite examples.

The [original Q33](d33-evidence/q33-before-answer.txt) and all 25 D32 evidence
artifacts are preserved by [hash manifest](d33-evidence/prior-evidence-sha256.json).
[Documentation verification](d33-evidence/review-verification.json) checks the
review structure, status, local links and preserved evidence. No earlier model,
probe or verifier was rerun. No formal PRD/ADR/OpenSpec/ticket, application/schema,
live data, provider, supporter communication or GitHub state changed.

**Final disposition: Accept with required amendments.** The founder has now
ratified A, organization control, default Off, the exact corrected decision and
all required amendments above. The original answer review posed no Q34.

## Explicit ratification

On October 18, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”** This
ratifies the exact corrected decision, C01–C24, P01–P36 and operational controls
as future requirements. It includes one organization-wide setting, initial Off
and preservation of qualified choices on later upgrades, optional actual-receipt
reporting through the existing P15 intake, honest unknowns, independent
permissions and source-backed status, same-occurrence finance continuation,
separate physical handling, safe Off/re-enable/retry behavior and all stated
privacy, correction, migration and proof requirements. Ratification does not
qualify a source, implementation, live permission or release.

All 18 preexisting D33 evidence files and the exact pre-ratification review and
Q33 research are preserved in the
[ratification manifest](d33-evidence/ratification-evidence-sha256.json). The
[new ratification verification](d33-evidence/ratification-verification.json)
checks unchanged decision/clauses/proofs, coherent status, links and preserved
evidence. Original verification and model results remain historical evidence;
no earlier verifier, model or probe was rerun.
