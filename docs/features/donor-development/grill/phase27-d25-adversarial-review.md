# Phase 27 D25 — gifts awaiting finance

2026-10-11, Asia/Bangkok; evidence records actual UTC dates and times.
**Founder selected A; amended D25 explicitly ratified.** Review disposition:
**Accept with required amendments.** The founder subsequently instructed,
“Yes, ratify this amended D25.” The exact reviewed decision and safeguards below
are ratified without substantive change. Reviewed against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and ratified D24. This remains research
and decision development in grill-with-docs, not a formal PRD/OpenSpec,
implementation, ticket publication or activation.

The capability is useful. The important amendment is that **a link to a draft gift
is insufficient**. The existing P15 contract needs a narrow, explicit source-owned
handoff capability that records an authorized report of actual receipt, maintains
responsibility and follows exact financial-source lineage. P15 already permits
incomplete staged donor/amount fields; missing details alone do not require a new
precursor record. The extension qualifies first reporting and accountability,
including reports not yet admissible to a Legal-Entity-scoped batch. Its appeal view cannot
become a second gift record. **Finance recording and physical handling can finish
at different times.** Neither may falsely complete the other.

## Exact corrected decision

> **D25 — Track applicable gifts awaiting finance through one source-owned intake
> handoff, visible in the appeal.** An authorized person can deliberately report
> an offline gift actually received and keep its next handling or recording action
> accountable. Phase 15 owns the handoff evidence and lifecycle, including the
> narrow reporting and accountability extension, including intake not yet
> admissible to a financial-entry batch. Reuse existing incomplete staging where
> its scope and authority fit; this does not mandate a separate precursor record.
> Phase 27 displays and links the qualified source item; staff continue that same
> intake instead of entering another gift in the appeal.
>
> Distinguish who recorded the report, what receipt or handling was reported and
> when, and who is currently responsible for the next step. An ordinary authorized
> staff report can supply that evidence; no routine photograph, signature or second
> approval is added. A draft, promise, assignment or received-date field alone does
> not prove current physical possession. Unknown donor, intended entity or amount
> remains a controlled intake exception; never invent values or weaken the financial
> owner's required scope to accept the report.
>
> **Awaiting finance** is operational work, not received funding, bank clearance,
> commitment fulfillment or authority to issue a receipt. P15's existing financial
> entry/commit path remains the only offline-money writer; P13 owns effective money,
> P16 fulfillment, and their correction and receipt owners remain unchanged.
> Recording a handoff creates none of those facts and sends no acknowledgment.
>
> Resolve the recording step from exact, source-qualified evidence for the same
> intake occurrence. Reuse or reconcile an already recorded gift rather than posting
> again; amount, date, donor or check-number similarity is insufficient. Preserve
> partial outcomes, multiple gifts and multiple appeal references without duplicate
> intake, inflated totals or one misleading supporter status. Posting resolves only
> the recording step; any real remaining physical handling or deposit work continues
> under its source owner. A later financial reversal does not reopen old physical
> possession by inference.
>
> Retain truthful correction, duplicate-report, returned, lost, disputed and other
> qualified exception outcomes with lawful history. Removing a supporter, closing
> an appeal, archiving a draft or completing a generic task cannot discard unresolved
> responsibility. Use existing source-backed shared work, current eligible routing,
> minimized projections and safe retry. Show what happened, what remains uncertain,
> who acts next and the permitted next action in Asym's shared accessible interface.
> Show this capability only where applicable; online gifts and ordinary appeal
> members acquire no extra manual stage.

## Evidence, alternatives and confidence

| Evidence                                                        | Establishes; does not establish                                                                                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d25-evidence/ownership.md)                          | Exact financial/intake/shared-work contracts and necessary narrow source extension. Planning contracts are not deployed source APIs.                                                |
| [Authorization](d25-evidence/authorization.md)                  | Report versus finance powers, protected evidence, incomplete identity/scope, grants/policy pitfalls and lawful recovery. No live catalog or confirmed deployed vulnerability claim. |
| [Implementation and experiment](d25-evidence/implementation.md) | Existing code limitations and new bounded source-resolution mechanics. No complete P15 posting, real permission, custody or UI proof.                                               |
| [UX](d25-evidence/ux.md)                                        | Shared interface, reporting/handling/recording flow and recovery/accessibility requirements. No tested prototype or measured staff preference.                                      |
| [Practice](d25-evidence/practice.md)                            | Fresh primary missions/nonprofit documentation and differences between products/agencies. No invented ministry interviews or universal workflow.                                    |
| [Independent challenge](d25-evidence/independent-review.md)     | Findings and readback of the integrated decision, with explicit proof limits.                                                                                                       |

**Verified repository intent.** [P27's roadmap](../../../prds/sitestacker-parity/roadmap.md#phase-27-open-decisions)
and the original brief explicitly reserve physically-in-hand versus processed gift
meaning. [P15 D1](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:431)
requires one gift-entry staging/validation/commit owner; quick entry is a skin over
that source. Its [batch root](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:1885)
requires Legal Entity; [tender details](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:2000)
contain date/receiving-staff evidence but do not establish a current handoff source.
[P16 Received](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1101)
reads P13 effective money. [ADR0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md)
prohibits mutable handoff state on posted financial rows.

**Current implementation.** The legacy offline-entry path remains unbound and
returns 501; P15 directs its retirement. Existing donation-backed staged rows,
finance role checks, dialog defaults and table/task primitives are adjacent code,
not proof of this reported-handoff capability. The UX evidence finds a disabled
legacy entry affordance and ambiguous timeout/retry mechanics. The authorization
review identifies historic grants/policy composition that need current qualification.
None justifies wiring the retired donation writer, exposing raw staged rows, granting
full finance access or presenting a draft as evidence of possession.

**Verified external documentation.** Reliant's Check Giving FAQ, modified May 20,
2026, explicitly covers a check handed to a missionary and forwarded to its office;
it also encourages direct delivery. That is evidence of this need in one missions
organization, not a universal procedure. MPDX documents in-hand versus processed
appeal gifts, but its Received/Given labels and manual bucket changes cannot override
Core money semantics. Salesforce NPSP and Blackbaud document staged entry and later
processing; their defaults are not Core's authority. Agency check instructions differ,
so Core must not hard-code memo, payee, endorsement or mailing policy from one example.
The practice appendix supplies exact primary URLs, edition/date and retrieval limits.

**Strongest alternative.** B keeps all handoff work in finance intake and ordinary
notes/tasks; the appeal shows only source-backed financial outcomes. This can be
sufficient where appeal staff do not need operational visibility. It avoids another
view, but makes this selected coordination need harder to follow in appeal context.
A is proportionate when it is a permitted view/action on the same source item, not
another queue requiring parallel updates. A note with a task is a credible no-build
alternative, but cannot independently establish exact gift lineage, durable partial
resolution or financial completion. A general custody/shipping/asset system would
exceed the chosen need.

**Conflicts resolved.** MPDX's in-hand “Received” differs from Core's P13/P16 money
meaning: use operational **Awaiting finance** and qualified financial labels instead.
An old P15 schema sketch allowing a deposit pointer on a posted header is superseded
by ADR0206; use separate operational relations. P15's image/file cut remains binding:
no check-photo feature, OCR or new storage lane is pulled into D25. P15's one-entry
path remains binding; a report before complete financial entry is an explicit
**additive P15 intake requirement**, not an alternative writer or a silent relaxation
of the financial batch schema. Reconcile that requirement through /to-prd before
implementation; no existing formal owner document is changed in this research turn.

**Judgments, assumptions and unknowns.** The selected appeal-side visibility, lean
staff attestation, honest incomplete intake and present-state correction are product
judgments. Staff volumes, actual local handling policies, successful task routing,
source readiness and comprehension are unmeasured. No practitioner interview, pilot,
production financial service, deployed RLS or live physical process was verified.
These are explicit implementation/release gates, not unanswered button preferences.
D21 delegates routine details; this review asks no additional micro-question.

## Smallest complete source and lifecycle

### Authoritative facts

| Fact                                         | Owner and invariant                                                                                                                                  |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Appeal and planned supporters                | P27/D24. A link supplies development context, not donor, money, contact or financial access authority. Removing it does not delete intake.           |
| Reported receipt/handling and intake lineage | Narrow P15 source extension. An attributed human assertion and subsequent source actions, not guaranteed continuous physical custody.                |
| Next accountable handling/recording action   | P15 source-work predicate and eligible responsibility. Tasks Hub/attention project it; an assignee edit does not transfer physical property.         |
| Complete staged financial gift               | Existing P15 staging model with required Tenant/Legal Entity and qualified donor/tender details. A draft is not posted money or proof of possession. |
| Recorded contribution and current money      | P13 initial posting/effective fold, reached through P15's admitted commit for offline entry. No handoff status creates or reverses it.               |
| Commitment application                       | P16 conserved fulfillment; exact source matching remains independent of appeal context or physical receipt.                                          |
| Physical deposit, bank match and clearance   | P15/P20 and qualified external accounting/payment owners. Recording, possession, deposit and clearance are not one linear status.                    |
| Official receipt/artifact/delivery           | P7/P18/P17/P6. Handoff recording has no independent authorization or sender path.                                                                    |

One physical gift intake must not multiply because several staff, requests or appeals
refer to it. One check can have several designation lines; those lines are not several
checks. Different checks remain distinguishable even from the same supporter. An
envelope or collection with unresolved contents must not be asserted as one verified
financial gift: retain the handling report and let the intake owner resolve the actual
items. Use owner-qualified lineage for any split/carry-forward or existing-entry
reconciliation; do not freeze a universal one-handoff-to-one-header cardinality or
invent a general N:M allocation engine. Appeals reference the qualified occurrence,
not duplicate it. Physical identity is not inferred from equal amounts, shared email,
names or a check number that can legitimately recur.

### Required narrow P15 extension

Record these clauses explicitly in the future owner design, with the source boundary
qualified before activation:

1. **Report actual receipt.** Accept a deliberate authorized staff report with trusted
   recording actor/Tenant, receipt/handling assertion and its stated time/precision,
   source intake identity and current accountable next work. A report entered for
   another person names the actual recorder and the reported holder separately.
   It is not a verified independent custody audit. No default signature, image or
   second approver is necessary; existing financial controls still govern finance.
2. **Allow incomplete intake honestly.** Unknown donor, amount, intended entity or
   allocation can remain unknown within a qualified, restricted intake envelope and
   owned exception. Do not create a fake Party, anonymous legal donor, guessed USD,
   default Legal Entity, valued noncash gift or nullable financial-root escape hatch.
   Tenant/source scope and report accountability are still required. Resolving a
   financial row later proves its complete P15/P7 scope and exact currency/units.
3. **Keep reporting and finance powers distinct.** Register the bounded reporting
   action/read projection through P12. Selection of A grants no blanket staff or
   missionary power. A permitted reporter may not create a donor, post, correct,
   allocate fulfillment, issue receipts or read the finance record without its own
   authorization. Source-generated minimal completion evidence can be visible where
   the exact projection permits, even when full financial details are not.
4. **Continue the same intake.** Qualified finance entry starts from or reconciles
   this source occurrence; it does not ask the reporter to create another gift.
   Preserve lineage across movement between drafts/batches and source correction.
   An existing recorded gift is linked only through a qualified exact source
   resolution. Duplicate reports reconcile to one canonical intake with both origins;
   no heuristic auto-merge or duplicate contribution is authorized.
5. **Resolve exactly what is complete.** Exact current source evidence establishes
   recording for the covered intake item(s). A partial batch/result resolves only
   covered work. If recording already committed but its projection/reply was lost,
   recover/link that result; never rerun gift posting to fix the appeal display.
   Posting may finish before physical transfer; preserve any real remaining handling
   work. Physical transfer may finish before posting; keep recording work visible.
6. **Preserve responsibility and lawful correction.** Explicit source dispositions
   handle mistakes, duplicates, returns, loss, disputes and rejection. They are not
   money outcomes or convenient dismiss buttons. Draft archive, age-based cleanup,
   appeal closure, staff departure and recipient removal cannot erase an unresolved
   physical-gift obligation. End only the exact action the source proves resolved;
   do not create perpetual work after a qualified exception is genuinely settled.
7. **Use native shared work.** Reuse the existing qualified P15/shared-task work where
   it already covers the same action. Do not create a parallel appeal task or queue.
   Each actual source work occurrence has its stable identity, permitted recipient
   ceiling and current action predicate under ADR0183; internal attention uses the
   existing presentation contract. No external donor reminder follows from reporting.
8. **Qualify the bounded lane.** Prove report/read/correction/routing, finance lineage,
   failure recovery and retained evidence together. Activation cannot precede the
   required source contract, nor use a manual duplicate-entry workaround. This does
   not require every future P15, P20, P29 or optional Studio feature to ship first.

The incomplete-intake envelope is **not** a contribution, staged money row, escrow,
financial suspense allocation or independent custody ledger. The owner must enforce
its finite operational purpose and current source visibility. A wrong-entity or
wrong-organization check goes through authorized intake handling; never retarget
Tenant/Legal Entity or manufacture a cross-organization financial transfer.
Here, "envelope" means the bounded operational fact and authority, not a required
new table or form. Existing P15 draft donor and amount fields already permit NULL;
reuse them when the report fits the qualified batch and action. The additive work
is explicit receipt evidence, accountable lifecycle and safe unresolved intake,
not replacing already-valid staging with another compulsory step.

### Meaningful transitions and recovery

These are observable meanings and source predicates, not a prescribed database enum
or configurable workflow builder. Recording and handling are separate dimensions.

| Situation / transition                                            | Required result                                                                                                                                                                                    |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Donor says a check is coming; ordinary draft exists               | No assertion of actual possession. Track a real promise/next action under its existing owner, not a fabricated in-hand item.                                                                       |
| Authorized person reports actual receipt                          | One durable intake report and appropriate native next work. No money, gift receipt, donor creation, appeal enrollment or message is created by this report.                                        |
| Report lacks financial details                                    | Save within qualified source scope with explicit unknown/exception and accountable recovery; never coerce invented identity/entity/amount. No invalid financial row is posted.                     |
| Responsible person changes                                        | Validate current eligible responsibility, retain attribution, preserve remaining action. The physical handling facts do not change merely because assignment changed.                              |
| Gift is sent or handed to finance                                 | Record the supported handling assertion. Sending is not confirmed receipt; neither is financial posting. Preserve uncertainty and the next actual action.                                          |
| Finance records exact covered item                                | Show the source-confirmed recording outcome and permitted link. End the awaiting-recording predicate for that coverage; independently required handling/deposit work remains.                      |
| One of several items is recorded                                  | Preserve distinct unresolved items. One recorded gift does not complete another, and one supporter can have pending and recorded facts simultaneously.                                             |
| Finance already recorded it elsewhere                             | Resolve exact same-source lineage with qualified authority, preserving origins. No second contribution, receipt or fulfillment application.                                                        |
| Gift/report is lost, returned, disputed, duplicate or mistaken    | A source action records the truthful disposition and remaining owner work. No implicit success, financial reversal or history deletion. Correct a mistaken report with evidence, not blanket undo. |
| Posted gift is later corrected/returned/NSF                       | Show current financial-owner truth; create only its applicable source work. Do not reopen old physical possession or rewrite the earlier recording event.                                          |
| Intake draft archived/carry-forward; appeal closes/member removed | Preserve unresolved source responsibility and exact lineage. D24 planning effects do not cancel financial/handling obligations.                                                                    |
| Reporter leaves or loses access                                   | Current source authority can continue/rescue work independently of that person's former grant. Narrow their projections immediately; historical authorship remains lawful evidence.                |
| All financial/handling work has a qualified disposition           | Keep permitted history; no permanent task or repeated alerts. A genuinely new receipt is a new source occurrence, not revival of an old task.                                                      |

There must be an eligible accountable handler **or an explicit owned routing
exception**, not a hidden unassigned row. Configure the qualified intake recovery
responsibility before activating this lane. Proved-zero task recipients, unknown
eligibility or a failed directory lookup cannot trigger a guessed administrator or
finance-group broadcast. The source remains discoverable to independently authorized
intake stewards. Task/notification failure does not negate an accepted receipt report.

## Staff experience

Use the shared Asym record shell and `@asym/ui`, exact **Base UI/base-maia and Zinc
semantic tokens**. Add the source-backed information where staff already see the
appeal's actual requests/outcomes. Use a compact list/card and detail panel; do not
force every check into a dense finance grid or another customizable status board.

1. **Discover the right action.** A permitted **Report gift received** action explains
   “Track a gift you've received and pass it to finance. This does not record a
   contribution.” It does not appear as an obligation for every supporter or online
   gift. If a qualified intake already exists, offer its permitted continuation.
2. **Capture a short truthful report.** Preserve appeal context, identify the actual
   item/receipt and reported handling, and show the next responsible action. Known
   relevant details can be reused through their authorized projection. Let genuinely
   missing financial details stay unknown; do not require an email, new donor record,
   full designation split or finance permission merely to make the bounded report.
   Do not preselect a receipt request or silently assume currency, donor or issuer.
3. **Save once with useful feedback.** State whether the source report is saved,
   pending or could not be confirmed. Provide a stable permitted way to check the
   original result after disconnect. Closing a dialog or timing out does not cancel
   accepted source work. A blind “try again” that creates another record is inadequate.
4. **Show understandable progress.** **Awaiting finance** identifies the current
   recording need, with who acts next and the actual permitted action. Show reported
   receipt/transfer facts with time and attribution, not an unqualified badge saying
   who currently has the property. **Recorded by finance** comes from exact source
   evidence; **Handling still needed**, when applicable, remains visible beside it.
   A restricted record shows only independently permitted status, not a dead link
   requiring broader access or a copied private financial summary.
5. **Let finance continue the same item.** Authorized finance staff use the qualified
   intake/quick-entry flow, preserving source identity and known data. Existing
   validation/review gates remain; D25 introduces no extra universal approval. A
   duplicate or already-recorded possibility leads to source reconciliation, never
   automated matching by amount or another immediate post.
6. **Make exceptions actionable.** Use concise actions such as **Update handoff** or
   **Resolve issue**, with the exact owner-qualified effect explained before acceptance.
   Correcting a report does not refund money; changing responsibility does not prove
   transfer. A handled exception says what was resolved without pretending the gift
   was recorded. Keep notes brief and optional where not required by a real owner rule.

These are proposed labels/composition, not measured user language or a completed UI.
The small report, permitted status and handoff/recovery actions must work on mobile.
[P15 D3](../../../prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md:76)
keeps its full entry grid desktop/tablet-landscape first and phones to
list/status/review/approval. D25's additive reporting surface does not silently
expand that grid or grant mobile financial posting. A permitted continuation leads
to the owner's supported experience with the existing intake preserved.
Pending counts describe distinct qualified intake items, not people, promised money
or gifts already received in the financial sense. No pending total enters gift,
public progress, fulfillment or forecast-as-actual money totals. Any displayed
reported amount says what it represents and retains exact currency; unknown is not
zero. A supporter can have a recorded gift and another item awaiting finance.

Keyboard, touch and screen-reader users must discover the action, known/unknown
fields, current responsibility and result recovery without hover, drag or color
alone. Announce save/status changes, associate errors with fields, preserve focus
and prevent sticky controls from obscuring it. Test **320 CSS pixels**, zoom, RTL,
long international names and translations, contrast and reduced motion. Use Core's
existing touch targets and date controls. Recorded server time, reported occurrence
and governed financial dates are separate; never infer a tax date or business zone
from the browser, address or a received report.

Low-bandwidth recovery keeps the same operation identity. No silent offline replay
of a consequential action, sensitive localStorage cache, photo upload or public
asset link is introduced. A delayed response after a Tenant/assignment change must
not reveal the old report. This is internal coordination: it adds no donor checkout
step or universal waiting period before ordinary authorized personal thanks.

## Database, authorization and failure contract

Keep the new operational evidence in the P15 owner, separate from immutable posted
rows. Persist one scoped receipt/handoff identity, minimal attributed facts, current
source head/responsibility and qualified links/outcomes using existing command,
receipt, audit and durable-work patterns. The physical names and exact SQL types
remain design work; no general event-sourcing, shipping or workflow framework is
needed. A local P27 JSON gift copy is not a temporary or permanent solution.

Require non-null trusted Tenant/source/operation identities. Financial source
relations add the exact Legal Entity and required inner scope. Use composite FKs,
scoped uniqueness and finite allowed state combinations; a nullable donor or unresolved
intended entity cannot weaken the required report scope or financial-row constraints.
Partial references are rejected or represented explicitly as unresolved evidence,
not half-formed FKs. Prevent ordinary mutation of Tenant, source occurrence, actor,
accepted completion evidence or posted financial facts. Optional asserted details
remain distinguishable from server-derived attribution and owner-confirmed facts.

Money uses the owning exact currency-aware representation and supported minor-unit
rules, never binary float, a universal two-decimal assumption or silent FX. The report
must not value a noncash item or turn prayer/hosting into a zero-value gift. Retained
financial links are references, not another sum/ledger/allocation authority. Index
scoped pending/responsibility/time and source-link access paths; validate plans under
real role/tenant distribution before adding caches, materialization or partitioning.

Qualify normal commands, imports, source consumers, repairs, views/RPCs and privileged
paths against the same authority. Inspect effective table/function grants, execution
roles, search paths, RLS **USING** and resulting **WITH CHECK** behavior. A permitted
old report cannot become a forbidden new entity, assignee or completed-money link.
Current P12 raw-table restrictions apply. PostgreSQL UPDATE/ALL can inherit USING
as WITH CHECK when omitted; omission alone is not a vulnerability. A false permissive
policy does not override another permissive allow. Integrity constraints can reveal
existence, so hidden-match and duplicate outcomes need the permitted uniform boundary.
Current source classification also governs counts, filter inputs, results and exports.

Each accepted report/change, required local evidence, responsibility/work disposition
and durable operation receipt/intent commits coherently. Normal P15 posting retains
its existing source transaction and lineage guarantees; it is not replaced by a
handoff consumer. When the financial commit is already independent, a failed consumer
transaction must preserve that money and leave explicit reconciliation work—never
roll back or repost the financial source. Secondary projections/attention retry from
durable intent. Distinguish source acceptance, projection freshness and delivery.

Expected source heads and qualified locks/fences order material report correction,
exact resolution, responsibility loss and duplicate consumption. Recheck after waits;
serialize the absent-to-created identity too. Concurrent independent duplicates and
same-intent transport retries are different problems: semantic idempotency prevents
replaying the same effect, while source duplicate resolution handles separate reports
about one actual item. Do not make check number/date/amount globally unique identity.
Old receipts remain historical results, not permission to overwrite a newer head.
Changed source references or action under the same key conflict. Reauthorize disclosure
of every replay; source-owned finance completion must not require the original
reporter's continued access to the record.
Only changes material to the asserted source or covered item invalidate incompatible
confirmation. A note, display correction or responsibility change cannot by itself
turn an already recorded gift into unrecorded work. Preserve accepted lineage and
history; derive any remaining reconciliation or handling from current source facts.

No ordinary delete, profile cleanup or draft TTL may cascade away unresolved handling
or required lawful evidence. P15 already recognizes that a draft can be the only record
of a physical check. Apply its retention, hold and PII-pruning boundaries; keep no
unnecessary bank fields, signatures or whole private source payloads in notes, tasks,
notifications, analytics or logs. Future document references require the separately
qualified P29 boundary; D25 adds no file collection. Restore/roll-forward re-proves
current financial lineage, later responsibility/dispositions, access, consumed effects
and disposal before activating readers or workers. A backup is not current custody.

## Exact requirements for the future specification

These clauses belong in the /to-prd reconciliation, including the explicit P15
extension. They do not publish an OpenSpec amendment or claim implementation today.

- **R01 — Single intake owner.** P15 SHALL own the reported-handoff occurrence,
  evidence, lifecycle and exact intake lineage; P27 SHALL consume qualified source
  projections/actions. No separate appeal gift/custody writer SHALL be created.
- **R02 — Explicit receipt evidence.** The source SHALL distinguish trusted recorder,
  reported receipt/handling and time, and next accountable responsibility. Drafts,
  promises, assignments and dating fields SHALL NOT imply current physical custody.
- **R03 — Honest incomplete intake.** Unknown donor, intended entity, amount or
  allocation SHALL have a bounded source-owned exception path without invented
  values, weakened financial-root constraints or a P27 shadow record.
- **R04 — Separate authority.** Reporting, viewing, routing, financial entry/posting,
  correction, receipts and fulfillment SHALL use their own current qualified actions.
  Possession, assignment, role labels and appeal membership SHALL grant none.
- **R05 — Scoped identity and evidence.** Required source keys/FKs, actor attribution,
  legal-entity-bearing relationships and allowed resulting states SHALL be enforced
  across commands, grants/RLS, views/functions, imports and privileged paths.
- **R06 — Same-item continuation.** Reporters and finance SHALL continue the same
  source intake. Exact lineage SHALL survive moves/carry-forward; duplicate reports
  and existing recorded gifts SHALL reconcile without duplicate contributions.
- **R07 — Exact resolution.** Only qualified source evidence for the exact covered
  occurrence SHALL resolve recording. Amount/date/donor/check-number similarity,
  a generic status, task completion or incomplete coverage SHALL NOT suffice.
- **R08 — Independent dimensions.** Recording, physical handling/deposit, clearance,
  appeal membership, requests, commitment and fulfillment SHALL remain distinct.
  Posting SHALL NOT close independently required handling; transfer SHALL NOT post.
- **R09 — Truthful exceptions/history.** Loss, return, rejection, dispute, mistake and
  duplicate dispositions SHALL retain lawful evidence and exact remaining work.
  Source archive/appeal closure/member removal SHALL NOT discard unresolved handling.
- **R10 — Eligible native work.** Actual next work SHALL reuse qualified source Tasks
  Hub/attention identity, current eligible routing and source-controlled closure.
  No duplicate appeal queue, guessed fallback or automatic donor contact is permitted.
- **R11 — Atomic local effects.** Accepted source changes, required evidence/work
  disposition and operation receipts/intents SHALL commit coherently. Projection
  failure SHALL NOT falsify acceptance; independent posted money SHALL survive
  consumer failure and SHALL NOT be reposted to repair the consumer.
- **R12 — Concurrency and retry.** Material source heads and owner fences SHALL order
  competing changes. Same-intent retry SHALL preserve one effect and historical
  results; changed intent SHALL conflict and stale replay SHALL NOT overwrite later
  disposition. Incidental notes, display or assignment edits SHALL NOT erase
  accepted financial lineage or restart recording by themselves. Current result
  disclosure SHALL be independently reauthorized.
- **R13 — Honest money.** Pending reports SHALL NOT enter recorded-funding, settlement,
  public-progress or fulfillment totals. Qualified displayed amounts SHALL retain
  entity, currency, unit and meaning; unknown/noncash SHALL NOT become cash value.
- **R14 — Minimal protected data.** Report facts, references, counts, tasks, logs,
  exports, caches and history SHALL obey current field/purpose floors and retention.
  D25 SHALL introduce no check images, raw bank/card fields, OCR or file-store bypass.
- **R15 — Clear accessible flow.** The shared interface SHALL show known facts,
  uncertainty, next responsibility and permitted actions without duplicate entry,
  mandatory extra approval, exclusive supporter-status distortion or blind retry.
  The actual browser SHALL pass the concrete accessibility/recovery cases below.
- **R16 — Applicable bounded capability.** Online gifts and ordinary appeal members
  SHALL acquire no mandatory handoff stage. Noncash/other tender use SHALL require
  its owner qualification; no new inventory, shipping, valuation or policy engine.
- **R17 — Safe rollout and restore.** Reconcile the narrow P15 extension and qualify
  source scope/routing/lineage before activation. Migration, mixed writers and
  rollback SHALL preserve accepted evidence and current restrictions; restore SHALL
  reconcile current source truth before affected readers/workers resume.
- **R18 — Measured operations.** Numeric admitted workloads, query/command/recovery
  budgets, retry ceilings and named operating owners SHALL be established from
  measured source-shaped tests before release; no silent truncation or scale claim.
- **R19 — Traceable proof.** D25's glossary, owner extension, R/AC outcomes, future
  formal requirements/design/tasks and real release evidence SHALL agree. Synthetic
  resolution mechanics SHALL NOT be promoted to financial, RLS, custody or UI proof.

## Full adversarial category review

Severity: **Critical** means unauthorized financial/disclosure effects; **High** means
lost property/accountability, wrong financial interpretation or consequential history
loss; **Medium** means significant friction, maintenance or operations burden.
Likelihood is qualitative and conditional, not a measured incident rate. Each concern
below has its own consequence, evidence, effect and exact R/AC prevention. These are
risks to an unqualified implementation, not claims of deployed D25 vulnerabilities.

| Category                                                            | Material concern and why it matters                                                                                                                                                    | Severity / likelihood; evidence                                                                                                                  | Effect on A; permanent fix and exact proof                                                                                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **01 Problem validity, necessity and alternatives**                 | **Yes.** A duplicate appeal queue could add work without helping staff; a mere finance link fails to show an actual outstanding handoff.                                               | Medium / plausible. User choice, roadmap reservation and current Reliant example establish a real comparable need; volume/preference unmeasured. | **Accept capability, amend source requirement.** Reuse one source item/view, compare B fairly. **R01, R06, R15–16; AC01, AC04, AC27, AC30.**                                             |
| **02 Brittleness**                                                  | **Yes.** Treating any draft/date as physical receipt or any post as completed handling works only in one assumed order.                                                                | High / likely if facts are collapsed. P15 draft and independent entry/deposit contracts; external staged-entry examples.                         | **Amend** to explicit receipt evidence and independent recording/handling. **R02–03, R07–09; AC02–03, AC07–10.**                                                                         |
| **03 Technical debt**                                               | **Yes.** P27 gift JSON, mutable header columns, shadow amount/status and revived legacy entry create competing truth and painful repair.                                               | Critical/High / plausible. ADR0206 and P15 retirement, actual unbound legacy/staged seams.                                                       | **Constrain design** to narrow P15 operation and qualified projections. **R01, R05–08, R13; AC04–06, AC13, AC25, AC27.**                                                                 |
| **04 Edge cases**                                                   | **Yes.** Unknown donor/entity, wrong payee, two checks, partial processing, duplicate reports, staff departure, loss/return and post-before-transfer can strand or misstate real work. | High / plausible. Owner constraints, explicit lifecycle reasoning and missions example; no invented frequency.                                   | **Amend** with owned incomplete intake and truthful source dispositions. **R02–10, R13, R16; AC03, AC06–13, AC16–18.**                                                                   |
| **05 Footguns**                                                     | **Yes.** Save defaults issue a receipt, changing owner claims delivery, a drag marks received, or retry creates another gift.                                                          | Critical/High / plausible. Legacy dialog defaults/retry and MPDX writable buckets are unsafe shortcuts for Core.                                 | **Require explicit effect and source-only truth. R02, R04, R07–08, R11–15; AC01–02, AC08, AC14–15, AC20–22.**                                                                            |
| **06 Tenant safety**                                                | **Yes.** A report/link/assignee or worker crosses Tenant/entity scope; a cached completion leaks another ministry's finances.                                                          | Critical / plausible. P12/P3 and source identity contracts; no live policy proof.                                                                | **Require full scoped references and current per-surface projection. R03–05, R12, R14, R17; AC03, AC13, AC16, AC19, AC23, AC26.**                                                        |
| **07 Database, RLS and authorization safety**                       | **Yes.** Reporting reuses broad finance grants, permitted old rows are retargeted, NULL bypasses FKs, or false permissive policies are mistaken for a deny.                            | Critical / plausible. Actual endpoint/migration seams and fresh PostgreSQL policy semantics.                                                     | **Amend bounded action and prove every write door. R03–05, R11–14; AC13–16, AC19, AC23.** No RLS-only or UI-only authority claim.                                                        |
| **08 Overengineering**                                              | **Yes.** A handoff becomes custody signatures, photo uploads, another inbox, mandatory dual control, shipping tracking or universal gift stages.                                       | Medium / plausible. P15 cut lists, D21 delegation and strongest B.                                                                               | **Narrow** to applicable attestation, same intake and existing shared work. **R01–02, R10, R14–16; AC01, AC20, AC24, AC27, AC30.**                                                       |
| **09 UX/UI and friction**                                           | **Yes.** Staff cannot distinguish reported, assigned, handed over, recorded and cleared; forced donor/entity defaults, dead finance links and lost-response retry undermine trust.     | High / plausible. Current UI seams and source/practice review; no pilot claimed.                                                                 | **Require complete shared flow** and accurate parallel facts/recovery. **R02–04, R08, R12, R15; AC03, AC08–10, AC16, AC20–22, AC30.**                                                    |
| **10 Source of truth, ownership and invariants**                    | **Yes.** Appeal status becomes money/fulfillment authority or a draft becomes custody evidence. A source handoff is currently missing.                                                 | Critical/High / likely without owner extension. P15/P13/P16, ADR0206, Q25.                                                                       | **Required amendment:** explicit narrow P15 report/lineage source; preserve owner table. **R01–09, R13; AC01–13, AC25, AC27.** No silent owner borrowing.                                |
| **11 Hidden coupling**                                              | **Yes.** Posting is made dependent on deposit, appeal close deletes intake, reporter revocation blocks finance completion, or recording ends unrelated physical work.                  | High / plausible. P15 independent dimensions and ADR0183 exact action predicates.                                                                | **Separate dependencies and completion causes. R04, R07–10, R16; AC08–10, AC16–18, AC24, AC27.**                                                                                         |
| **12 Failure modes**                                                | **Yes.** A report succeeds but reply/task projection fails; money posts but handoff resolution fails. Repeating the apparent failed action creates duplicates.                         | Critical/High / plausible. Existing timeout semantics and cross-source transaction reasoning.                                                    | **Atomic local receipt; reconcile authoritative success. R06–07, R11–12; AC14–15, AC17, AC25.** No distributed rollback or repost promise.                                               |
| **13 Lifecycle, temporal correctness, concurrency and idempotency** | **Yes.** Material correction races resolution, independent duplicate intake posts twice, or old completion overwrites a newer disposition/date.                                        | Critical/High / plausible. Expected-head/source contracts; new bounded probe only.                                                               | **Require durable business identity, exact confirmation and ordered mutations. R02, R06–12; AC06–10, AC14–18, AC25–26.** Record time is not receipt/tax date.                            |
| **14 Data integrity**                                               | **Yes.** Monthly and appeal gifts match by amount, one check becomes several gifts across appeals, pending sums inflate success, or partial processing erases remaining items.         | Critical/High / plausible. P13/P16 identity/conservation and MPDX association example.                                                           | **Use source lineage, exact coverage and independent counts. R03, R06–08, R13; AC05–07, AC10–13, AC25.** No dedupe by weak attributes.                                                   |
| **15 Security and privacy**                                         | **Yes.** Images, signatures, bank fields, protected donor/location, task previews or retained exports expose sensitive information beyond source rights.                               | Critical / plausible. P15 image cut/P29 seam, P10/P12, current public email-assets distinction.                                                  | **Keep minimal source evidence and current protected projections. R04–05, R14, R17; AC13, AC16, AC19, AC23, AC26.** No new uploads or personal-data permanence.                          |
| **16 Scalability and performance**                                  | **Yes.** Pending queues scan history, source joins become N+1, stale projections mislead, or unbounded recovery monopolizes finance locks.                                             | High/Medium / plausible; no load evidence. Qualified read indexes and workload shape still need measurement.                                     | **Bound source-shaped queries/recovery and measure real roles. R05–07, R11–12, R18; AC14–15, AC28–29.** No unmeasured production cap/throughput claim.                                   |
| **17 Operational burden**                                           | **Yes.** Staff retype gifts, manually compare exports, chase missing owners or use SQL to resolve duplicates/lost checks.                                                              | High / plausible. Missing qualified handoff plus current legacy gap.                                                                             | **Provide same-item continuation, exact source reconciliation and owned exceptions. R03, R06–10, R15; AC03–10, AC16–18, AC20, AC30.**                                                    |
| **18 Observability and auditability**                               | **Yes.** A generic “done” log cannot explain who reported receipt, who handled it, which posting resolved it or why remaining work ended.                                              | High / plausible. New operational fact and lawful history obligations.                                                                           | **Retain distinct attributed business evidence and source receipts; minimize technical logs. R02, R06–12, R14, R18; AC08–10, AC14–19, AC25.**                                            |
| **19 Dependency and integration**                                   | **Yes.** Appeal tracking depends on all future finance/storage/Studio, or consumes raw/retired APIs to avoid that wait. Provider success becomes assumed posting.                      | Critical/High / plausible. Unbound legacy, narrow P15 need and existing owner cuts.                                                              | **Qualify the necessary source contract, preserve optional independence. R01, R07, R10–11, R14, R16–17; AC24–27.** No alternate writer or new vendor.                                    |
| **20 Migration, rollout and upgrade**                               | **Yes.** Existing “received” staging becomes fabricated custody, old workers duplicate records, or rollback/restore revives private or already-resolved handling.                      | Critical/High / plausible. Legacy status naming and uninspected retained/live data.                                                              | **Census, additive compatibility, qualified activation and current-state restore. R05–12, R14, R17; AC25–26, AC31.** Preserve real unfinished property obligations when disabling paths. |
| **21 Testability, traceability and proof**                          | **Yes.** “Awaiting finance” stays undefined, source extension is omitted from P15, or a toy resolver test is advertised as posted-money/UI safety.                                     | High / likely without explicit trace. Q25's gap and all evidence limits.                                                                         | **Use exact amendment/R/AC and owner reconciliation before build. R01–19; AC01–32.** Formal artifacts/tickets remain separately invoked.                                                 |
| **22 Other development hazards**                                    | **Yes.** A stale report assigns a tax date, organization accepts forbidden property by status, noncash becomes valued cash, or cleanup erases an unresolved original.                  | Critical/High / plausible. P7/P15 boundaries and varied agency practice.                                                                         | **Keep source acceptance/date/valuation/retention separate. R02–04, R08–09, R13–17; AC02–03, AC11–13, AC18–19, AC24, AC26.** No new jurisdiction policy or speculative engine.           |

## Acceptance criteria and proof matrix

These are actual-product qualification outcomes unless the experiment expressly
identifies a narrower tested mechanism. Tests must verify user/source outcomes and
real roles, not merely the proposed table shape.

| ID       | Falsifiable outcome                                                                                                                                                                                                                                                                                                                                                    | Clauses               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **AC01** | Report an actually received check with a report-only actor: one qualified intake identity and required next work; no contribution, donor creation, receipt, message, journey or automatic fulfillment.                                                                                                                                                                 | R01–04, R10, R16      |
| **AC02** | Promise of an incoming check, generic draft, received-date field, responsible-person change and report-on-behalf do not fabricate present possession or impersonate the recorder. Correct reported date without changing tax date.                                                                                                                                     | R02, R04–05, R08      |
| **AC03** | Unknown donor/amount/intended entity and wrong-payee receipt retain truthful qualified source intake/accountability; no fake identity/default currency/nullable financial-root workaround or cross-Tenant transfer.                                                                                                                                                    | R03–05, R13           |
| **AC04** | Finance continues the same reported intake with known permitted information and existing validations; no second gift data entry or P27 writer.                                                                                                                                                                                                                         | R01, R04, R06, R15    |
| **AC05** | Exact same source item is visible through two authorized appeals and several designation lines without duplicate intake, work, contributions or additive money. Distinct checks remain separate.                                                                                                                                                                       | R06–08, R13           |
| **AC06** | Two independent reports about one item and repeated same-intent submissions have qualified distinct recovery: exact replay is idempotent; confirmed duplicates preserve both origins and resolve one canonical intake without auto-merging by amount/name/check number.                                                                                                | R05–07, R09, R12      |
| **AC07** | Only exact owner-confirmed covered posting references resolve the same intake. Wrong source/tenant/entity, generic draft and equal-amount recurring gift do not; missing/withheld/partial source coverage is not complete or zero.                                                                                                                                     | R04–07, R13           |
| **AC08** | Finance records before physical transfer: show recorded fact and any real remaining handling. Transfer before recording: show supported handling evidence and keep recording work pending. No forced posting/deposit order.                                                                                                                                            | R02, R07–10, R15      |
| **AC09** | Lost, returned, disputed, rejected and mistakenly reported items get truthful authorized dispositions and remaining work. An exception disposition or generic task Complete/Delete cannot itself establish Recorded by finance or erase a previously source-confirmed recording. Preserve current owner-qualified financial status/history and any remaining handling. | R02, R07–10           |
| **AC10** | Partial processing of multiple items preserves unresolved identities. Recorded and pending items from one supporter coexist without a mutually exclusive supporter bucket or loss of historical facts.                                                                                                                                                                 | R06–08, R13, R15      |
| **AC11** | P13 reversal/NSF/correction changes financial truth under its owner without reopening old physical possession, erasing original recording history or creating a replacement contribution.                                                                                                                                                                              | R07–09, R11, R13      |
| **AC12** | A known existing source-recorded gift is reconciled to this intake by authorized exact lineage; no new posting/receipt/P16 application. Correcting an erroneous link preserves its evidence and does not alter immutable money.                                                                                                                                        | R04–09, R12           |
| **AC13** | Cross-Tenant/entity/appeal/source/assignee substitution and forbidden resulting-row mutation fail across real API/RLS/RPC/views/import/service/repair paths. Foreign/hidden references yield no partial effect or existence leak.                                                                                                                                      | R03–05, R12–14        |
| **AC14** | Inject failure of required local evidence/receipt/work disposition after preparing a report/resolution: no half-accepted source mutation. Independently already-posted money survives a failed consumer; reconciliation never retries posting.                                                                                                                         | R06–07, R11–12        |
| **AC15** | Lost accepted reply, concurrent exact replay, changed payload under one key, and late/out-of-order completion produce one durable effect or an explicit conflict; old results cannot reapply over later corrections.                                                                                                                                                   | R06–07, R11–12        |
| **AC16** | Permission/recipient eligibility loss races capture, reassignment, completion and result read in both orders. Current finance authority can continue after reporter departure, while reporter access and task/notification disclosure narrow immediately.                                                                                                              | R04–05, R10–12, R14   |
| **AC17** | Material handoff correction and exact source resolution race in both orders with controlled interleavings. Stale resolution cannot overwrite newer facts; accepted financial source history remains and unresolved correspondence is owned. Incidental note/display/assignment edits do not erase lineage or restart recording.                                        | R06–09, R11–12        |
| **AC18** | Draft deletion/archive/carry-forward, appeal closure/member removal, staff anonymization and delayed handling preserve lawful evidence and actual remaining responsibility; qualified final exception closure ends only applicable work.                                                                                                                               | R06, R08–10, R14, R17 |
| **AC19** | Protected financial detail, bank/check content, missionary identity/location, counts, notes, logs, exports, caches and deep links obey current field/purpose floors. No image picker/public upload/sensitive browser persistence is introduced.                                                                                                                        | R04–05, R14–15        |
| **AC20** | Ordinary staff report, finance continuation, restricted completion view and exception correction show known facts, next actor and permitted action without duplicate entry, dead links, mandatory extra approval or confusing finance controls.                                                                                                                        | R02–04, R08, R15      |
| **AC21** | Keyboard/screen reader can complete the real flow; errors/status changes are announced, focus survives save/recovery and is not obscured. Touch and non-drag alternatives remain available.                                                                                                                                                                            | R15                   |
| **AC22** | Real small report/status/handoff browser flow passes 320-CSS-pixel/zoom, long names/translations/RTL, contrast/reduced-motion and low-bandwidth recovery, without expanding P15's full entry grid to phones. Closing or timing out does not pretend cancellation; context switch blocks late private responses.                                                        | R12, R14–15           |
| **AC23** | Report-only/currently restricted actor sees only qualified handoff/completion facts, not full ledger/provider details; task assignee and historical author gain no new rights. Exports have separate current authorization.                                                                                                                                            | R04–05, R10, R14      |
| **AC24** | Direct online gift has no invented physical step. Applicable noncash intake follows acceptance/describe-never-value rules; prayer/hosting remains D22 nonfinancial participation. No tax/acknowledgment action follows a handoff alone.                                                                                                                                | R02, R08, R13, R16    |
| **AC25** | Normal P15 commit and exact source lineage are coherent; source-recorded gift with delayed projection remains real. Duplicate/out-of-order integration/worker callbacks neither double-post nor falsely resolve unqualified coverage.                                                                                                                                  | R06–08, R11–12, R17   |
| **AC26** | Restore from before later posting, correction, routing/access loss, disposition or privacy disposal; affected reads/workers remain fenced until reconciled, with no resurrected custody, erased content or duplicate posting.                                                                                                                                          | R09, R12, R14, R17    |
| **AC27** | Qualified handoff works natively with Studio/P34/P42, general files and optional providers unavailable. Missing exact finance source capability blocks only the affected lane; no retired writer or shadow fallback is activated.                                                                                                                                      | R01, R10, R14, R16–17 |
| **AC28** | Declare numeric report/pending/history volumes, large-Tenant skew, source-reference fanout, concurrent operations, roles and query/command/recovery budgets; measure p50/p95/p99, plans/locks and permission-safe pagination.                                                                                                                                          | R05–07, R11–12, R18   |
| **AC29** | Stall work/projection/reconciliation and exhaust bounded retries; staff see accepted source truth separately from delayed processing, and the named source owner can recover without SQL repair or duplicate intake.                                                                                                                                                   | R09–12, R15, R18      |
| **AC30** | Real staff scenarios distinguish reported receipt, present handling, responsibility, finance recording and clearance; complete same-item/unknown-details/exception/recovery flows without unsafe misconceptions. Correct and retest any such misconception before expansion.                                                                                           | R02–03, R08, R15, R19 |
| **AC31** | Retained-data census and mixed-client/job rollout do not convert old received labels/drafts/notes into present possession. Compatible readers/writers precede activation; rollback preserves accepted reports and qualified recovery for real property.                                                                                                                | R02, R05–09, R17      |
| **AC32** | D25's exact P15 extension, glossary and R01–R19/AC01–AC32 trace into owner formal requirements/design/tasks and real test/release evidence; no synthetic or dated research result is relabelled production qualification.                                                                                                                                              | R01, R17–19           |

## Executed evidence and its limits

The new [handoff-resolution experiment](d25-evidence/handoff-probe/README.md)
passed **7/7 on its first runtime attempt**, 2026-10-10 UTC, 18:51:57–18:52:04,
on isolated PostgreSQL **17.11**, read committed. Its exact
[results](d25-evidence/handoff-probe/results.json) and
[execution metadata](d25-evidence/handoff-probe/run-metadata.json) retain all
three executed-input hashes, pinned image and exact container cleanup. Network
was disabled with no published ports, bind mounts or volumes.

Three genuine two-session schedules observed the exact backend blockers:
material report revision before confirmation consumption, consumption before
revision, and concurrent exact duplicate consumption. Other cases checked
unqualified/wrong-scope/empty/substitute evidence, an exact two-reference owner
result, late local consumer rollback/recovery and historical replay across later
source/finance correction. Financial facts were seeded independently; the consumer
performed no financial write. The two references exercise coverage without
choosing final business cardinality. The fixture's raised `40001` is its version
guard, not proof of SERIALIZABLE isolation.

The experiment models source-qualified resolution of existing financial evidence,
not the actual P15 money writer or a real physical handoff. Owner-only synthetic
roles cannot establish P12/RLS, source evidence veracity, identity resolution,
production retention, complete posting integration, task/notification operation,
UI/accessibility or representative scale. Earlier D24 experiments were not rerun or
counted again. No product code, migration, live database, provider configuration or
external contact was changed.

Fresh primary [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html),
[transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html) and
[Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
were checked for the reviewed mechanisms; the authorization appendix qualifies
policy composition and current-source limitations. Prior same-session Supabase
changelog/PG17.11 review is dated supporting evidence, not a new project-upgrade
audit. No installed or live database version is inferred from a synthetic container.

## Ruthless synthesis and implementation order

**Resolve before recording the amended decision.** Preserve selected A; make the
missing P15 source extension explicit, allow truthful incomplete intake under its
owner, separate reporter/handling/responsibility and recording, and refuse any new
money writer. Resolve exact lineage and recording-versus-physical completion rather
than importing MPDX's statuses. The corrected decision above is complete; routine
UX/exception choices do not become another founder questionnaire.

**Capture in spec/design.** Carry the explicit P15 extension, R01–R19 and AC01–AC32
through /to-prd, updating the governing source and its declared projections together.
Specify minimum capture, authority, incomplete-scope handling, current projections,
lineage/completion/correction, source tasks and retention. D25 does not quietly grant
finance capability or settle broader appeal attribution/response buckets. The existing
P13 live-versus-frozen attribution conflict remains a gate for affected financial
reports, not permission to infer matching. No new ADR is needed merely to repeat
ADR0206 or shared-task ownership; any genuinely conflicting owner change must be
explicitly reconciled. Issue publication remains separately invoked through /to-issues.

**Build/prove in dependency order.**

1. Qualify the narrow P15 report source and P12 action/read classifications, including
   incomplete intake and owned routing recovery. Configure only authorized source
   recipients; no universal finance role or new contact grant.
2. Establish scoped constraints, report/lineage/correction commands, exact local
   evidence and durable receipt/work identity. Prove real-role mutation and concurrency,
   including absent identity, hidden duplicates and stale result disclosure.
3. Connect normal financial entry/posting and exact existing-gift reconciliation.
   Prove both recording/handling orders, partial coverage and independent committed
   source success. Keep source correction, physical work, receipts and P16 separate.
4. Compose the lean shared appeal/finance/task flow on that same item. Test actual
   assistive technology, mobile/low bandwidth and staff comprehension; simplify any
   confusion rather than adding a mandatory confirmation to every action.
5. Census retained data, rehearse mixed versions and backup restore, measure admitted
   workload and run a bounded authorized pilot. Activate only qualified lanes with
   assigned operational owners. Disabling new reporting must preserve recovery access
   for real accepted handoffs; it must not strand existing property or erase history.

**Monitor after preventive qualification.** The named role owners below must be
assigned to actual people/on-call teams in release evidence. Thresholds are proposed
operating triggers, not measured service promises. Authorization, exact money and
source integrity are release requirements, not risks deferred to monitoring.

| Signal                                                                                              | Threshold                                                            | Named accountable owner                                             | Response                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Duplicate posting, wrong source linkage or pending item counted as received money                   | Any one verified occurrence                                          | P15 intake + P13 financial on-call                                  | Stop affected resolution/new-post lane, preserve source truth, reconcile with existing correction authority and add regression proof. Never delete posted history.             |
| Unresolved physical-gift responsibility silently disappears or recording falsely completes handling | Any one verified occurrence                                          | P15 intake operations owner                                         | Contain the closing/cleanup path, recover source responsibility and physical handling through authorized operations, correct the projection.                                   |
| No eligible handler and no owned source recovery route                                              | Any one confirmed occurrence                                         | P15 intake recovery owner with P12                                  | Surface the restricted source exception; repair eligibility/routing without broad broadcast or guessed permission. Keep accepted evidence.                                     |
| Private handoff/financial facts leak through tasks, logs, exports or cached results                 | Any one verified occurrence                                          | P12/security owner with P15                                         | Contain affected projection/egress, follow incident process, reconcile access/cache and requalify before reopening.                                                            |
| Accepted source change lacks required projection/reconciliation                                     | Older than 5 minutes, or any terminal retry failure                  | P15 integration on-call                                             | Show accepted source state and delayed projection separately; replay exact durable intent/reconcile financial outcome without reposting. Five minutes is an operating trigger. |
| Human handling action exceeds its source-owned due/review date                                      | Any overdue applicable action                                        | Current P15 accountable handler; intake lead for routing exceptions | Review the actual obstruction/handling, update source next action and existing attention; no automatic donor solicitation or bank-clearance inference.                         |
| Pilot user confuses possession, assignment, posting or clearance, or enters a second gift           | Any one unsafe misunderstanding                                      | Product/UX owner with finance-intake lead                           | Revise the flow/wording and retest before pilot expansion. No assumed safety from primitive accessibility alone.                                                               |
| Declared admitted workload budget exceeded                                                          | Three consecutive 5-minute windows, or one exhausted recovery budget | P15 operations/database owner                                       | Diagnose scoped plans/locks/backlog and bound affected ingestion/projections without losing accepted handoffs. Set numeric budgets before activation.                          |

## Adversarial check

### What could go wrong with this answer?

The appeal could become another financial writer, or claim custody/recording from a
draft, task or guessed match. A failed projection could trigger duplicate posting,
and posting could conceal an outstanding original check. The corrected source,
identity and independent-completion requirements prevent those shortcuts.

### What hidden assumptions are we making?

The user selected appeal-side handoff visibility, and one current missions manual
establishes a comparable need. We do not know each tenant's volumes, staffing,
handling policies or whether the source APIs exist in a deployed environment.
Lean attestation and shared work are design judgments; real qualification/pilot
must establish safe use without invented agency feedback.

### How does this affect the whole product?

It adds a bounded operational capability to P15 and a permitted view in P27, while
preserving financial, receipt, identity, communication and task owners. Existing
source data is reused once. The owner extension must be explicit in future formal
artifacts so it is not missed as an apparently cosmetic appeal status.

### How does this affect the end-user experience?

Staff can report what they actually received without pretending to know all finance
facts. Finance continues the same intake. Each permitted user sees what happened,
who acts next, what remains uncertain and how to correct it. No extra stage burdens
direct online gifts, and recorded money is not confused with pending handling.

### Does this follow modern best practices?

It uses source-owned intake, precise financial semantics, explicit responsibility,
durable lineage/recovery and accessible progressive disclosure. Current primary
nonprofit products show the underlying need but also defaults Core must avoid;
agency guidance varies and does not become universal policy.

### Does this fit Asym’s existing repo and product direction?

Yes, with the explicit narrow P15 extension. It preserves one offline-money front
door, immutable posted financial rows, separate operational records, current P12
scope and source-projected shared tasks. The unbound legacy dialog and raw staging
rows are evidence of gaps, not permanent implementation paths.

### Should we adjust the recommendation?

**Accept with required amendments**, as recorded above. The amendment makes the
missing intake capability and separate completion meanings explicit; it does not
replace the selected useful workflow with a workaround. All 22 categories, exact
requirements, proof cases and ordered owner work are recorded. The
[document checks](d25-evidence/review-checks.json) verify this research record
separately from the bounded experiment and future implementation qualification.

## Explicit ratification

The founder ratified this amended D25 on 2026-10-11 (Asia/Bangkok). Its exact
corrected decision, R01–R19, AC01–AC32 and source qualifications are unchanged.
The original six appendices, 7/7 experiment and document checks remain dated
evidence of the review; they are not rewritten as new execution or runtime proof.
No runtime experiment was rerun. The [ratification/continuation checks](d25-ratification-q26-validation.json)
verify this status update, preservation and the next substantive question.
