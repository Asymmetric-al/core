# Phase 27 D22 — financial and nonfinancial partnership requests

2026-10-11, Asia/Bangkok (research evidence dated in UTC). **Reviewed D22 explicitly ratified;
disposition: Accept.** Review against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the accepted D1–D21 decisions.
This is a decision review and research record, not the formal PRD/OpenSpec,
implementation, ticket publication, activation or a claim of practitioner testing.
The founder subsequently instructed, “Yes, ratify this amended D22.” The exact
reviewed decision and safeguards below are explicitly ratified on 2026-10-11,
Asia/Bangkok, without substantive change. Routine design choices below use the
judgment delegated in D21.

The answer solves a real missions need: a significant invitation deserves a
responsible person, an honest response and follow-through whether or not money is
involved. The required clarification is to keep **what was requested, what was
said, and what actually happened** unambiguously different, as Q22's boundaries
already require. Showing or hiding money fields alone
does not establish those distinctions.

## Exact decision recorded

> **D22 — Cover financial and significant nonfinancial partnership requests in one
> coherent Requests experience.** On the existing ministry partnership, authorized
> staff may prepare or record a specific invitation for funding, prayer partnership,
> introductions, hosting a missionary visit or another appropriate partnership
> purpose. Each request preserves responsibility and an honest record of its
> preparation/presentation and response. Outstanding work has an accountable
> eligible person and visible follow-through or an owned actionable exception;
> completed work keeps its disposition without perpetual tasks or forced owner
> replacement. Ordinary calls, reminders and to-dos remain shared tasks;
> another request does not create another partnership journey.
>
> Record independently answerable decisions separately when their responses or
> obligations need separate tracking. Reuse the same permitted conversation and
> appropriate follow-up where the source contract supports it. Keep a coherent
> invitation together when it can be understood and answered together. Do not
> create another request solely because of an installment, designation or reporting
> measure, or introduce a proposal-bundle engine. Agreement to prayer, an introduction or hosting cannot
> accept or fund a monetary request.
>
> Show financial details only for the request meaning to which they apply. Monetary
> requests preserve explicit Legal Entity, currency, amount meaning and applicable
> cadence/term/horizon. Requested, staff-expected, supporter-responded, committed
> and received are distinct facts. Unknown is not zero; nonfinancial is not a
> zero-value donation. Narrow noncash intentions may describe the intended support
> without inventing a valuation, receipt, asset ledger or tax result.
>
> Preserve what was actually presented and earlier responses when a proposal is
> revised, corrected, deferred or withdrawn. A positive response records what the
> supporter said, including conditions or a partial response; it does not create a
> pledge, recurring agreement, charge, gift, permission, subscription, referral
> relationship or event booking. Those actions require their qualified source
> owners and current authority. Silence is not a decline, and a completed task is
> not fulfillment. Keep genuine outcomes and lawful history when work ends.
>
> Use the shared Asym record, form and task patterns: clear context, relevant
> fields, a visible next action, ordinary deliberate save, accessible controls and
> truthful pending/error/conflict feedback. Staff can record an already-made
> request and response together without manufacturing intermediate work. Saved
> changes, history and required follow-through intent must remain coherent across
> retries, competing edits and downstream failures. Current tenant, field and
> purpose permissions apply to every view, mutation, history, notification and
> export; responsibility does not grant access.

These safeguards resolve ambiguous implementations of A within Q22's stated
boundaries and D21's delegated design judgment. They introduce no material product
or owner-contract change requiring another ratification loop. No new approval
ladder, request-specific workflow designer, valuation
system, donor score or mandatory extra journey is justified. The separate
phase-wide ask-review policy remains a substantive grooming topic; D22 does not
silently invent it or authorize outward delivery before applicable review and
communication gates are satisfied.

## Evidence, alternatives and limits

| Evidence                                                              | Verified contribution and limit                                                                                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership review](d22-evidence/ownership.md)                         | Governing ADRs, durable OpenSpec, roadmap and current owner boundaries; distinguishes adopted planning intent from runtime qualification.                                          |
| [Authorization review](d22-evidence/authorization.md)                 | P12 scope, protected content, current implementation seams and database/security requirements. No live tenant or production-policy inspection.                                     |
| [Implementation and financial review](d22-evidence/implementation.md) | Current code, financial ownership, SQL mechanics and bounded experiment evidence. A synthetic database is not a qualified Core command.                                            |
| [UX review](d22-evidence/ux.md)                                       | Actual shared UI constraints, current implementation seams, accessible workflow and external primary guidance. No completed product UI or measured missions-staff usability claim. |
| [Missions and comparable practice](d22-evidence/practice.md)          | Official missions examples and nonprofit CRM comparisons, including the strongest narrower alternative. No inferred customer frequency or practitioner interview.                  |

**Repository fact:** [ADR-0001](../../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
keeps CRM truth in Asym Postgres. The [P27 roadmap](../../../prds/sitestacker-parity/roadmap.md#phase-27-what-it-covers)
already requires first-class asks, native next work and an accessible complete
prospect-to-follow-up journey. Its [owner constraints](../../../prds/program-roadmap/owner-constraints.md#phase-27)
qualify entity/currency rules as applying to monetary asks. Financial fields in
roadmap shorthand do not require fake money on every nonfinancial invitation.
D3 already allows different participation within one ordinary partnership; D22
adds structured request/response tracking to that relationship.

**Current behavior:** the evidence review searches source, migrations and tests,
rather than treating roadmap prose or adjacent CRM editors as an implemented P27
request service. Reusable task, interaction and UI patterns exist. Their coarse
authorization, form state and ordinary mutation mechanics must not be assumed to
satisfy this compound request contract. This review identifies design and
qualification risks, not an exploited production D22 vulnerability.

**External fact:** official OMF material describes prayer, church advocacy and
hosting missionaries. MPDX's documented appeals are financially scoped, while
tasks and referrals serve other work. Blackbaud and Salesforce fundraising
records demonstrate responsible-person, proposal and response/forecast concepts,
but their financial opportunity semantics do not establish a universal missions
request lifecycle. Exact primary URLs and access limits are retained in the
practice appendix. External examples support the use cases and alternatives;
they do not override Core ownership.

**Strongest alternative:** structured records only for fundraising; use existing
interactions and shared tasks for other invitations. That is simpler when an
organization rarely needs to distinguish what it asked from the response. It is
insufficient for the selected scope when staff need an accountable nonfinancial
request still awaiting an answer after a call is completed. A common small core
with relevant details meets that need; a universal workflow platform does not.
For an ordinary reminder or one-off administrative to-do, the no-build answer
remains the existing task.

**Product judgment:** one independently answerable request, progressive fields,
minimal recording steps and source-linked follow-through are the recommended
design. These are reasoned decisions, not measured agency preferences. Flexible
purpose text and clear examples avoid freezing these four examples into the only
permitted ministry workflows. No additional configurable taxonomy engine is
required by D22.

**Unknowns:** actual retained P27-like data, deployed Supabase version/grants,
tenant volumes, eligible actor matrix, response-to-commitment qualification,
partnership-specific contact policy and real staff usability remain unproved.
Where needed they are explicit implementation/release gates below. They are not
excuses to require fake amounts, add approval ceremonies or claim a shipped product.

## Smallest sufficient model and authoritative facts

This is one request capability with common identity, purpose, responsibility,
presentation/response history and follow-through. Financial details are a bounded
extension of meaning. This review deliberately does not freeze table count,
physical enum names, a custom-fields system or a generalized state-machine engine.

| Fact                                                                            | Authority and invariant                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Party, organization, human representative, relationship and Ministry Assignment | P9 and its governing identity/ministry contracts. A pastor or shared mailbox is not the church's identity or financial authority. Requests reference qualified identities; they do not replace them.                                     |
| Continuing cultivation work                                                     | P27 D1–D21. A request belongs to the permitted source scope and continuing purpose; multiple requests alone do not justify a new journey.                                                                                                |
| Request and presented terms                                                     | P27. Preserve the exact meaningful version that was presented, and original/revised terms. Current draft edits cannot rewrite earlier presentation.                                                                                      |
| Responsible person                                                              | Qualified source assignment and P12 eligibility. A client may nominate an eligible person; the server proves eligibility. Neither nomination nor assignment grants access.                                                               |
| Staff forecast                                                                  | P27 assumption with as-of time, basis, entity/currency and reporting horizon. It is independently changeable and historically comparable; actual outcome does not rewrite prior forecasts.                                               |
| Supporter response                                                              | P27 evidence of what the identified speaker said about identified request terms, with actual occurrence precision and trusted recording attribution. A staff interpretation is not a source financial promise.                           |
| Commitment, fulfillment and received money                                      | P16 commitment/fulfillment; P13 effective contribution/designation lines; P14 recognition. Read qualified source results; absence of access or coverage is not zero.                                                                     |
| Referral, visit, prayer participation or other execution                        | The appropriate qualified relationship, communication or operational owner, where one exists. P27 may record the requested outcome and attributed observation; it cannot invent a booking, membership, consent or care system.           |
| Follow-through                                                                  | Source-owned purpose shown through P9/shared Tasks Hub. Reuse an appropriate task only where the qualified source linkage supports it. Completion of one call proves that task completed, not every request's acceptance or fulfillment. |
| Communication and public content                                                | P6/P17 eligibility/delivery; approved public projections and CMS owners. Request preparation or a response does not publish or send anything.                                                                                            |
| History, audit and derived views                                                | Business history retains lawful request meaning; security audit records access/action evidence; technical logs support diagnosis. Views, search, reports, caches and workflow runs never become write authorities.                       |

Financial conservation is an upstream invariant: source-confirmed money cannot
be manufactured or double-counted by linking it to requests, representatives or
appeals. Staff-attribution views may overlap only when explicitly labelled;
organization totals cannot add that overlap. A designation split or several
payments can serve one request without multiplying the request itself.

## Coherent staff experience

Use **Requests** in the existing partnership record, with the person/organization
and ministry visible. Do not expose database or orchestration concepts. Use shared
`@asym/ui`, exact Base UI/base-maia, Zinc semantic tokens and existing record,
form, task, saved-view and table conventions. Good visual design here means clear
hierarchy, readable spacing, restrained status treatment and predictable controls;
it is not a decorative board with hidden rules.

1. **Add request.** Show the partnership context, plain purpose/title and eligible
   responsible person. Prefill the proved eligible partnership lead visibly,
   permit an authorized change, and explain a missing eligible owner. Keep task
   creation available for ordinary to-dos. Examples help staff recognize what
   belongs here without forcing them into a rigid list of four types.
2. **Show relevant details.** A prayer or introduction request contains no amount,
   currency or empty financial cards. A monetary request exposes currency/entity,
   requested terms and optional known forecast details. Display cadence and term
   when relevant. A noncash intention can describe what is intended without a
   required money valuation. Financially meaningful unknowns are visibly unknown.
3. **Save at the actual point in the work.** Staff can save preparation or record
   that a request was already made. The latter can include its response and next
   action in the same deliberate save. Do not require clicking through fictional
   preparation/presentation events or claiming a precise date that is not known.
   Recording a historical fact is distinct from authorizing an outward action.
4. **Record response.** Show the relevant presented terms and speaker. Use clear
   response choices with room for exact conditions: positive, partial/conditional,
   declined or deferred. No recorded response remains distinct from all of them.
   These are product meanings, not a required storage enum or forced narrative.
   A partial financial response can record different proposed terms without
   silently replacing what was requested. A late response can be recorded with
   provenance; it does not automatically reopen closed partnership work.
5. **Follow through.** Show the currently responsible person and appropriate next
   shared action or owned exception, with due/review information. Do not create a
   duplicate “follow up” task for every status edit. Link to an existing qualified
   commitment, contribution, interaction or other source only where permitted;
   otherwise show the honest recording or availability limit and a useful next
   step. No task completion or “yes” button silently performs the linked action.
6. **Revise, correct or close.** A draft is editable. After presentation, a real
   change preserves prior terms and records whether revised terms were actually
   presented. Corrections preserve who corrected what and why the historical
   interpretation changed where needed, without making ordinary edits require a
   justification essay. Closing request work records its actual disposition;
   declining/withdrawing one request does not close the partnership or cancel
   unrelated commitments. Reopening work or editing while paused never revives
   ended effects by implication.

An illustrative nonfinancial record, using ordinary Asym controls:

```text
Grace Church · Partnership with [permitted ministry label]

Host a missionary visit                        Response recorded
Responsible: [eligible staff person]           Change

Request made: [known date, or date not known]
Response: Interested — needs committee confirmation
Recorded from: [permitted representative / interaction]

Next action
Confirm possible dates · [owner] · [due date]  Open task

Edit request    Record response    Close request
History
```

This is illustrative language, not an actual church's data or a newly required
committee workflow. It shows uncertainty plainly and avoids presenting interest
as confirmed hosting. A funding request uses the same structure plus its relevant
financial section, with separately labelled requested, expected and source-backed
outcomes. Do not imply that a blank financial section means no gifts exist.

**Interaction edge cases:** changing unsaved financial applicability must not
silently submit hidden old amounts or discard entered work. Explain the relevant
consequence once; allow cancel/revert while the authorized editor remains open.
Previously saved terms remain in permitted history. A load failure is an error,
not an empty response or a zero amount. Preserve the draft on safe retry and show
conflicting current changes; do not report success or erase the form before the
authoritative save result. If access expires, remove protected content rather
than keeping a recoverable sensitive browser draft indefinitely.

**Accessibility and field use:** explicit labels, keyboard operation, visible
focus, non-color status cues and announced save/error states; no drag-only flow.
At 320 CSS pixels and equivalent zoom, use a readable stacked form and list
without losing actions or context; test RTL, light/dark themes, mobile keyboard
and focus visibility. Core targets 44px touch areas; WCAG AA target-size criteria
allow 24px or stated exceptions, so do not conflate the two standards. Wrap long international names and translated labels, reuse identity and
address controls without forced Western name shapes, format money/date values by
locale while retaining explicit currency and source time meaning, and respect
reduced motion. Low-bandwidth retries must preserve one business effect. D22 does
not require an offline synchronization engine or a public/donor request inbox.

## Lifecycle and edge cases resolved together

The following are observable meanings and transition rules, not a prescribed
physical status enum. Request preparation/presentation, latest response and
outstanding work remain distinguishable without multiplying user-facing badges.

| Situation                                                           | Required treatment                                                                                                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preparation only                                                    | Editable draft; do not say “Asked,” start a response clock or imply delivery. Owner and accountable follow-through still matter.                                                 |
| Request actually presented                                          | Record the relevant terms and source/occurrence evidence. Delivery-attempt success alone does not prove a human received or agreed to it.                                        |
| Existing verbal request and response entered later                  | Record them together with honest date precision and recording time; no fabricated intermediary tasks or required new send.                                                       |
| Awaiting answer / no answer                                         | Keep the response unknown. Staff may deliberately defer or close work with truthful disposition; age alone is not a decline.                                                     |
| Positive or partial/conditional response                            | Record exact known scope and conditions; track unresolved follow-through. Do not create source commitments or claim execution.                                                   |
| Deferral                                                            | Preserve the response and identify appropriate internal next work/review, without scheduling unauthorized contact.                                                               |
| Decline or withdrawal                                               | Distinguish supporter response from staff withdrawal. Neither changes Party lifecycle, contact consent, other requests or financial promises.                                    |
| New proposal replaces old terms                                     | Preserve original terms and response; only real revised presentation changes what was asked. Record a superseding alternative if it is a genuinely separate decision.            |
| Alternative financial proposals                                     | Make mutual exclusivity explicit to forecasts; do not count all alternatives as expected concurrent support. No generalized proposal-bundle engine is required.                  |
| Prayer yes, funding no/unknown                                      | Separate actual requested decisions have separate outcomes on the same partnership. Shared encounter evidence does not propagate acceptance.                                     |
| Several installments/designations toward one ask                    | Keep one request where the requested decision is one; consume qualified source allocation/fulfillment, not duplicated asks.                                                      |
| Organization contact changes / unauthorized representative responds | Keep the speaker and known capacity, old evidence and current owner separate. Record reported interest without asserting the organization's authorized financial instruction.    |
| Responsible person leaves or loses access                           | Use source-owned reassignment/eligible work routing or visible owned exception; no broadcast to every administrator and no silent assignment-as-access.                          |
| Partnership paused                                                  | Permit authorized information/history updates; preserve D6 review and pause. A new outbound action remains independently authorized and must not silently resume cultivation.    |
| Partnership closed; late response or factual correction arrives     | Record the truthful evidence through an authorized correction/recording path; do not rewrite closure or restart work. Genuine renewed work uses D8's deliberate return.          |
| Request closed; late payment arrives                                | Show qualified source outcome independently from the request's work disposition. Do not reopen work, rewrite the historical forecast or reissue ended tasks automatically.       |
| Old request response is corrected                                   | Append a traceable correction; do not silently undo a P16 promise, P13 contribution or already delivered message. Route any necessary correction to its owner.                   |
| Money applicability changes                                         | Preserve saved historical meaning; validate the new current terms atomically. Nonfinancial current terms contain no stale hidden monetary values.                                |
| Same request delivered twice / response lost                        | Return the original authorized result for the same business intent; do not create another request, response, task or handoff.                                                    |
| Two staff revise/respond/close concurrently                         | Check the exact source revision and relevant terms; reject or explicitly reconcile stale intent. Never accept a response against unseen replacement terms.                       |
| Restricted financial history or interaction                         | Redact through owner-qualified projections and fail closed on mutation proof. Do not turn withheld data into absent/zero facts or disclose its existence through counts.         |
| Source payment later corrected/refunded                             | Recompute source-backed outcome from current authoritative evidence with provenance; keep original request, response and forecast history intact.                                |
| Identity merge or ministry representation changes                   | Consume qualified source continuity/correction. Preserve historical subject/represented people; flag affected future work under D2 rather than silently retargeting invitations. |

## Exact clauses to carry into the future specification

These are bounded D22 requirements for later `/to-prd` traceability, not a formal
specification package or authorization to implement it now.

**R01 — Scope.** P27 SHALL provide one request/response capability for monetary,
narrow noncash-intention and significant nonfinancial partnership requests. It
SHALL reuse the existing partnership and distinguish routine shared tasks. The
four examples SHALL NOT be the exclusive permissible purposes.
Contextual recording SHALL NOT automatically enroll a Party or require an active
journey merely to preserve an otherwise-permitted historical fact. Qualify source
linking and any actual new admission under D4; do not invent a context-free request
inbox or duplicate existing P25/Support intake.

**R02 — Independent decisions.** Separate requested decisions that need independent
responses SHALL have independently attributable outcomes. The minimum design is
separate request records on the same partnership, sharing qualified encounter
references where appropriate. A coherent invitation that can be understood and
answered together MAY remain one request without splitting all descriptive parts.
An installment, designation line, staff attribution
or reporting dimension alone SHALL NOT create another request. Partial agreement
SHALL NOT imply agreement to other requested decisions or conditions.

**R03 — Responsibility and follow-through.** Each request SHALL preserve its
responsibility history. Outstanding request work SHALL have current eligible
accountability and visible next work or an owned actionable exception. Closed
work with no remaining obligation SHALL NOT require a new task, review date or
currently employed replacement owner just to retain or correct its history.
An appropriate source-qualified shared task MAY cover related request work; do
not duplicate it or invent a generic multi-source task graph. Every active
enrollment retains the existing next-task/due-date or owned-exception invariant.
A closed request with a remaining independent obligation must retain that obligation
and its eligible accountability, rather than use closure to hide it.
Task completion SHALL NOT change response or fulfillment by inference.

**R04 — Relevant monetary facts.** A current monetary request SHALL carry valid
explicit entity/currency and the meaning of each applicable amount; recurring or
multi-year terms SHALL retain cadence, term and reporting horizon where relevant.
Unknown requested/expected values SHALL remain unknown, never zero defaults.
Nonfinancial current terms SHALL have no monetary fields or financial total
contribution. Financial rows SHALL use exact currency-aware minor units with
defined range/scale handling, no floating point or implicit FX. Narrow noncash
intentions SHALL NOT require or invent a monetary valuation or received-gift fact.

**R05 — Presentation, revision and forecast history.** The system SHALL distinguish
draft preparation, actual presentation, current revised terms and earlier
presented terms. Response evidence SHALL identify the terms it addresses. Original
and revised requested terms and staff forecast versions SHALL remain lawfully
traceable; later outcome SHALL NOT rewrite the forecast that preceded it. A
correction and a genuinely new proposal SHALL be distinguishable.

A fresh, currently authorized recording MAY identify an older presented version
for a late response; current-revision checks prevent stale writes, not truthful
recording about historical terms.

**R06 — Honest response.** Record the actual known response, speaker/capacity,
occurrence precision, recording time and trusted recorder. No answer, positive,
partial/conditional, declined and deferred meanings SHALL remain distinct;
withdrawal is not a supporter decline. Record already-made requests/responses
together without fictional intermediate transitions. Recording a fact SHALL NOT
claim that the action was authorized, compliant, delivered or legally binding.

**R07 — Owner boundaries.** Positive response SHALL NOT create a pledge, recurring
agreement, charge, gift, consent, subscription, referral edge, appointment, booking
or application. Any deliberate handoff SHALL use the qualified owning command,
current authority, explicit scope and durable result identity. Unavailable owner
capability SHALL leave a visible actionable state, never a local shadow substitute.
Required native internal follow-through SHALL work without Phase 34 or 42.

**R08 — Lifecycle independence.** Request edits/closure/response SHALL NOT silently
change partnership stage, pause/review/closure, Party lifecycle, other requests,
communication eligibility or independent obligations. Late evidence and corrections
SHALL preserve earlier facts and recording provenance. Genuine resumed partnership
work follows D8; ended child effects SHALL NOT revive automatically.

**R09 — Atomic source mutation and replay.** Accept the intended source change,
required lawful history, durable business result and required effect intent
atomically. Check current authority and expected source/terms revisions. Durable
replay SHALL be bound to tenant/source/business purpose and normalized semantic
payload; changed terms with the same identity conflict. A retry of a formerly
successful action SHALL NOT reapply it over newer state. Distinguish current
authorization to disclose a result from the original accepted effect.

**R10 — Tenant and actor safety.** Derive tenant, actor, recorder, authority and
audit attribution from trusted server context. Caller-selected assignees,
subjects, lists, financial references and source links require current eligibility
proof. Parent and child relationships SHALL be tenant/source aware independently
of nullable financial references. Disallow generic patches that can transform a
permitted row into a foreign, differently owned or historically rewritten state.

**R11 — All database paths.** Before release, prove least-privilege grants and
RLS for all exposed tables; old-row and new-row mutation authorization, necessary
SELECT visibility, projection-safe views/functions/RPCs/storage, and equivalent
checks on privileged workers/imports. A function with elevated privileges requires
narrow grants, a fixed safe search path and explicit authority checks. Direct
history UPDATE/DELETE and cascading deletion of retained business facts SHALL be
denied except through qualified retention/correction procedures. Ordinary staff
commands SHALL NOT accept actor/tenant/approval metadata as authority.

**R12 — Minimized disclosure.** Apply P12 field/purpose/existence rules to request
content, contacts, history, attachments, source links, search, caches, summaries,
counts, exports, logs and notifications. Staff, missionary and public surfaces
SHALL consume separately authorized projections. Prayer/visit records SHALL NOT
become care case notes, location dossiers or permission grants. Retention,
redaction/anonymization and backups follow governing owners; lawful history does
not mean indefinite unredacted retention. No new private-file store.

**R13 — Clear accessible UX.** Use the shared Asym design system and record/task
patterns. Show current context, responsible person, actual request/response,
relevant financial details and next action. Provide deliberate Save, edit/record
response/close actions with truthful pending, success, denied and conflict states.
No default financial zero, required irrelevant field, drag-only action, fictional
stage progression, unannounced content change or compulsory narrative for an
ordinary permitted save. Mobile, keyboard, focus, locale and low-bandwidth recovery
are acceptance requirements, not optional polish.

**R14 — Lossless conditional editing.** Changing applicable details SHALL NOT
silently discard entered work or submit hidden stale amounts. Current saved terms
and historical presented terms remain distinguishable. Omitted fields, explicit
absence, unknown, not applicable and denied/unloaded values SHALL NOT be collapsed
by forms, schemas, imports or projections. On unsafe stale state, preserve only
the draft content the current actor may still access and provide a clear recovery.

**R15 — Financial reporting.** Report requested, forecast, response, source
commitment and source received/adjusted outcomes separately with coverage and
as-of meaning. Nonfinancial requests SHALL NOT lower monetary averages or inflate
funding totals; optional amount queries SHALL NOT make them vanish from ordinary
request counts. Do not add mutually exclusive proposals, recognition and gifts,
different currencies/entities, or repeated source coverage into an unlabeled
total. Any allocation/fulfillment claim requires the owning contract, not a
date/amount/Party match or copied financial status.

**R16 — Recoverable secondary effects.** Preserve one permanent source-purpose
identity across native and optional configurable follow-up. After source commit,
delivery/materialization failures SHALL be visible and retryable without another
business effect. An ambiguous external success SHALL reconcile with the owner
before replay. Cancellation stops remaining intent, not a committed historical
effect; no source-success rollback is fabricated when a response is lost.

**R17 — Bounded implementation and operations.** Use tenant/source/owner/status/due
queries appropriate to real views, indexed qualified references and bounded page
sizes. Avoid loading every request/history/gift before rendering one record or
doing authorization per row through unbounded remote calls. Set and prove actual
input/page/batch/range budgets from the supported workload before activation;
do not invent capacity claims here. Expose recovery/reassignment through authorized
product controls, not recurring direct database repair.

**R18 — Safe adoption and traceability.** Census actual legacy/custom/demo/import
data before migration; never reinterpret a zero-value gift/task as nonfinancial
request or create historical acceptance from inferred data. Expand compatible
readers/constraints before enabling writers, qualify old/new combinations, and
quarantine ambiguous imports for accountable resolution. After new writes,
rollback SHALL preserve lawful request/history/effect identities and prohibit old
writers that cannot express them. Trace D22 clauses and acceptance evidence into
the later glossary/PRD/OpenSpec/design/tasks/tickets/release record through their
canonical authoring sources when those workflows are invoked.

## All 22 categories — independent adversarial findings

Severity/likelihood below describe the consequence **if the stated safeguard is
omitted**, not an observed production defect or measured incidence. High means
material financial/privacy/authorization or historical-integrity harm; medium
means a materially unreliable workflow or misleading data. Likelihood is a
reasoned assessment of the concrete path. The referenced R clauses are exact
required spec language and the AC cases below are its proof; each row states the
effect on the selected answer independently.

| # / category                                                     | Material concern, what could go wrong and why                                                                                                                                                                                                                                                                                             | Severity / likelihood / evidence                                                                                                                                    | Effect, permanent prevention and exact language                                                                                                                                                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Turning every call into a formal request creates duplicate work; funding-only tracking loses the unanswered nonfinancial invitation after a task completes. Four hard-coded purposes would unnecessarily limit missions use.                                                                                                     | Medium / likely if scope is vague. Founder selection, original brief, OMF examples and MPDX task/appeal distinction; practice and ownership evidence.               | **Narrows A.** One small request core for significant independently answerable invitations; ordinary tasks remain sufficient elsewhere. No new universal engine. **R01–R03; AC01–AC03.**                                                         |
| 2. Brittleness                                                   | **Yes.** Assuming every request has a price, one response, a known date or a permanent church representative fails realistic changes and imports. Hidden money can survive a type switch.                                                                                                                                                 | High for monetary meaning, otherwise medium / plausible to likely. Nullable/conditional form and source semantics in implementation, UX and authorization evidence. | **Changes required detail.** Relevant typed facts, honest unknowns, lossless switching and speaker/terms provenance. **R04–R06, R14; AC04–AC09, AC14.**                                                                                          |
| 3. Technical debt                                                | **Yes.** Separate prayer/funding/hosting CRMs, custom fields pretending to be asks, duplicated encounter prose or copied promise/gift state would create divergent authorities.                                                                                                                                                           | High / plausible if existing shortcuts are reused. ADR-0001, P9/P13/P16/P26 and bounded current-code review.                                                        | **Narrows implementation.** Shared source record, references, qualified owners and one command boundary; do not preserve an inadequate adjacent editor merely for consistency. **R01, R05, R07, R09; AC01, AC10–AC12, AC20.**                    |
| 4. Edge cases                                                    | **Yes.** Partial yes, alternative proposals, unknown dates, late responses, staff departure, changed missionary representation and corrected gifts can make a simple global status false.                                                                                                                                                 | High / plausible; these follow from independent request/response/source facts and original brief, not invented claims of agency frequency.                          | **Clarifies behavior.** Use the resolved scenario matrix, truthful independently scoped outcomes and authorized correction paths. **R02–R08, R15; AC02, AC06–AC16, AC24.**                                                                       |
| 5. Footguns                                                      | **Yes.** “Save” might send a request, “Accepted” might create money, hiding a field might delete terms, or finishing a call might mark everything fulfilled.                                                                                                                                                                              | High / plausible. Existing action/owner boundaries and conditional UI semantics.                                                                                    | **Narrows A.** Visible action consequences, relevant fields, explicit qualified handoffs and no inferred effects. Routine save does not need another acknowledgment. **R06–R08, R13–R14; AC03, AC10–AC12, AC14, AC26.**                          |
| 6. Tenant safety                                                 | **Yes.** A valid request can reference another tenant's ministry, owner, task, interaction or financial source; cached request results may cross scope even when the main row is filtered.                                                                                                                                                | High / plausible with ID-only links or coarse roles. P12 and tenant-scoped CRM contracts; authorization evidence.                                                   | **Required invariant.** Trusted context plus independent scoped references and protected projections on every path. Nonfinancial absence cannot bypass scope. **R10–R12; AC17–AC19, AC22–AC23.**                                                 |
| 7. Database, RLS and authorization safety                        | **Yes.** Nullable CHECK/FK semantics, permissive grants, broad updates or elevated RPCs can admit invalid money tuples, wrong parents, forged attribution or mutable history. RLS alone does not protect fields.                                                                                                                          | High / plausible; documented PostgreSQL/Supabase behavior, current limited role helpers and bounded mechanics evidence.                                             | **Requires database proof.** Independent required parents, explicit null-aware constraints, immutable attribution/history boundary, least privilege, old/new checks and service-path parity. **R04, R09–R12; AC04–AC05, AC17–AC23.**             |
| 8. Overengineering                                               | **Yes.** A generalized request engine, custom status/workflow builder, child-item hierarchy, approval ladder or offline sync would make this small scope expensive and confusing.                                                                                                                                                         | Medium / likely if “flexible” is read as unlimited configuration. Stronger no-build alternative and the founder's D21 direction.                                    | **Narrows A.** Common core plus relevant detail; separate actual requests only as needed; retain existing tasks/owners and no new required dependency. **R01–R03, R07, R13, R17; AC01–AC03, AC29.**                                              |
| 9. UX/UI and user friction                                       | **Yes.** Financial jargon and blank cards devalue nonfinancial partnership; hidden state, compulsory guessed values, too many clicks or premature success confuse staff on mobile/slow connections.                                                                                                                                       | Medium, high when money meaning changes / likely without intentional design. Actual shared-component seams and primary accessibility guidance; UX evidence.         | **Changes UX requirements.** The six-step experience above uses relevant fields, direct historical recording, clear next work and familiar accessible controls. **R04, R06, R13–R14; AC01, AC06, AC14, AC25–AC27.**                              |
| 10. Source of truth, ownership and invariants                    | **Yes.** Response, forecast, commitment, received money and actual hosting can become one writable status; history may change with current names/terms.                                                                                                                                                                                   | High / likely if “response” is treated as fulfillment. Governing ownership matrix, ADR-0001, P13/P14/P16 and D1–D21.                                                | **Clarifies definition.** Adopt the authority table and exact distinction of facts. No inferred acceptance or downstream authority. **R02, R04–R08, R15; AC02, AC07–AC13, AC24.**                                                                |
| 11. Hidden coupling                                              | **Yes.** A request type or response could change cultivation stage, auto-subscribe a prayer partner, start a workflow, or couple native follow-up to optional products.                                                                                                                                                                   | High / plausible. P6/P17 and DON-15 is explicitly unqualified/disabled; source and stage contracts.                                                                 | **Narrows effects.** Preserve independent lifecycle/consent/owner gates; native internal work remains usable without Phase 34/42. **R07–R08, R16; AC10–AC12, AC15–AC16, AC29.**                                                                  |
| 12. Failure modes                                                | **Yes.** Source save can succeed while its response or task projection fails; replay can duplicate requests or externally accepted commitments. A failed lookup may look like zero funding.                                                                                                                                               | High / plausible under ordinary network and worker failures. Existing durable workflow/command contracts and null/absence semantics.                                | **Requires coherent recovery.** Atomic source/history/result/effect intent, visible pending/error state, exact replay and owner reconciliation. **R09, R14, R16; AC20–AC23, AC27.**                                                              |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** A response can attach to unseen revised terms; a stale close can erase new work; backdated recording can rewrite history; a retry can apply over later corrections.                                                                                                                                                              | High / plausible. Original request explicitly requires revisions/late responses; PostgreSQL concurrency and existing D12–D21 intent rules.                          | **Clarifies lifecycle.** Pin intended terms/revision, distinguish occurred versus recorded time, preserve current-state concurrency and durable effect identity. **R05–R09, R16; AC06–AC09, AC15–AC16, AC20–AC21.**                              |
| 14. Data integrity                                               | **Yes.** Imported blank/zero/omitted values, duplicated notes/contacts, overlapping proposals or funding links can corrupt counts and forecasts without breaking a row.                                                                                                                                                                   | High / plausible. Original financial brief, P9 merge/source references and financial conservation rules.                                                            | **Requires semantic validation.** Explicit value states, source references, independently scoped outcomes, separate forecast/actual and accountable import correction. **R02, R04–R06, R14–R15, R18; AC04–AC09, AC24, AC28.**                    |
| 15. Security and privacy                                         | **Yes.** Prayer details, travel plans, third-party introductions, contact authority or staff-private notes can leak through tasks, summaries, history or exports; “keep history” can become indefinite retention.                                                                                                                         | High / plausible; missions subject matter plus governing P12/P26 disclosure contracts, not a claim all requests are highly sensitive.                               | **Narrows stored/disclosed content.** Minimum purpose-relevant facts, owner-qualified projections and retention/correction. No access from role labels/response and no new private file store. **R10–R12; AC17–AC19, AC22–AC23.**                |
| 16. Scalability and performance                                  | **Yes.** Full-history joins, N+1 authorization, unbounded list rendering, or aggregation across money and nonmoney can become slow or wrong for a large tenant.                                                                                                                                                                           | Medium / plausible at increased volume; no verified volume/latency figures. Data shape and actual bounded-query principles support the concern, not a benchmark.    | **Requires measured budgets.** Scope/index/page actual views, separate aggregate meanings and production-shaped plan/load tests before activation. No premature partitioning/materialization. **R15, R17; AC24, AC30.**                          |
| 17. Operational burden                                           | **Yes.** Lost owners, unexplained blocked handoffs and duplicate tasks leave staff cleaning up records or asking developers to repair the database.                                                                                                                                                                                       | Medium / plausible. P27 next-action discipline and ADR0183 source task rules.                                                                                       | **Changes recovery UX.** Eligible routing, actionable owned exceptions, current failure reasons and authorized correction/reassignment; no per-status task churn. **R03, R09, R16–R17; AC03, AC16, AC21, AC30.**                                 |
| 18. Observability and auditability                               | **Yes.** A technical request log alone cannot prove which terms were presented, who responded, what changed or why money appears in a rollup; logging full notes creates a second disclosure surface.                                                                                                                                     | High / plausible. P12 audit/egress and P27 historical forecast requirements; current logging limitations in evidence.                                               | **Requires separate evidence types.** Durable source history and actor provenance; permission-safe security audit; minimal operational IDs/error traces. **R05–R06, R09, R12, R16; AC07–AC09, AC19–AC23.**                                       |
| 19. Dependency and integration risks                             | **Yes.** Vendor/webhook success or optional workflow state may be promoted into a response or source financial fact; nonfinancial work may accidentally require an unbuilt event system.                                                                                                                                                  | High / plausible. Qualified P13/P16/P6 owners and disabled/unresolved DON-15 source binding.                                                                        | **Narrows dependency surface.** Core owns requests; qualified owners execute their facts. No provider guessing, Twenty revival or new event/volunteer dependency. Ambiguous external effects reconcile. **R07, R15–R16; AC10–AC12, AC21, AC29.** |
| 20. Migration, rollout and upgrade                               | **Yes.** Existing zero-valued records or tasks may be misclassified; old clients can overwrite new nonfinancial facts; destructive rollback can erase history after real use.                                                                                                                                                             | High / plausible if such data/writers exist, presently unverified. Current-source gaps and Supabase mixed-version realities.                                        | **Requires release gates.** Census first, explicit mapping/quarantine, compatible readers/constraints before writers, cohort activation and non-destructive rollback/roll-forward. **R18; AC28–AC30.**                                           |
| 21. Testability, traceability and proof                          | **Yes.** “Flexible,” “beautiful” and “has a response” are not falsifiable; a synthetic pass can be misrepresented as a qualified UI or production RLS result.                                                                                                                                                                             | High for unsafe release, otherwise medium / likely without evidence discipline. Repository authority rules and actual absent qualification.                         | **Defines proof.** Use AC01–AC30, retained evidence limits, canonical glossary/decision lineage and release gates; no formal spec/ticket until invoked. **R13, R17–R18; all ACs.**                                                               |
| 22. Other development hazards                                    | **No additional material concern found beyond the independently evaluated categories above.** Checked monetizing prayer/relationship value, unsafe defaults, donor/public spillover, new dependencies, repair and rollback traps. Each material hazard already has an owner and clause; this row adds no speculative engine or checklist. | No separate severity/likelihood claim. The bounded source/financial/privacy/UX review supports this conclusion, not a whole-repository assurance.                   | **No further change to A.** Preserve R01–R18 and the qualification boundary; do not claim exhaustive proof of unimplemented code.                                                                                                                |

## Falsifiable acceptance and traceability

Each case requires the real qualified source command and relevant authorized UI
where applicable; a mocked event or a function that merely echoes its arguments
does not prove it. R references connect this review to the later canonical
requirements, design, tasks, tickets, implementation and release evidence.

| ID   | Required observable outcome                                                                                                                                                                                                                                                                                                                                                            | Clauses       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AC01 | Create and read prayer, introduction, hosting, another valid nonfinancial purpose, monetary and narrow noncash-intention requests on the same source model; no new journey or irrelevant money field is required.                                                                                                                                                                      | R01, R04, R13 |
| AC02 | On one partnership, prayer acceptance leaves a separate funding request unanswered; several installments or designations for one decision do not duplicate requests.                                                                                                                                                                                                                   | R02, R15      |
| AC03 | A qualified follow-up is visible once through shared work; completing a shared call changes neither all linked responses nor source fulfillment. For outstanding work, loss of owner produces eligible reassignment or an owned visible exception. Genuinely finished requests retain history without new tasks or forced replacement owners.                                          | R03, R17      |
| AC04 | Known monetary terms require qualified entity/currency and exact currency-aware values; unknown amount remains unknown. Nonfinancial terms with any hidden financial tuple are rejected, not coerced to zero. Test zero-, two- and three-decimal currency handling, range/overflow and invalid currency, against the actual qualified currency contract.                               | R04, R10–R11  |
| AC05 | Noncash intention can be recorded without invented value or gift; a display estimate, if independently admitted by its owner, cannot enter requested/received monetary totals as source money.                                                                                                                                                                                         | R04, R07, R15 |
| AC06 | Staff record an already-presented request and response in one save with unknown/partial date precision; record time remains trustworthy and distinct. No fictional send/task/presentation timeline is generated.                                                                                                                                                                       | R05–R06, R13  |
| AC07 | Revise a presented request and a staff forecast: original terms, what was actually presented, revised terms and prior forecast remain independently reconstructible without reading today's labels as historical fact.                                                                                                                                                                 | R05–R06       |
| AC08 | Record partial/conditional response, deferral, decline and staff withdrawal; none collapses into the others or alters the original requested terms. No-answer remains distinct from denied/unavailable response data.                                                                                                                                                                  | R06, R12, R14 |
| AC09 | A stale edit against replaced terms conflicts explicitly. A fresh authorized recording can deliberately identify older presented terms for a late response; it does not relabel that response against current terms. Corrected occurrence evidence retains original recording and correction history. Day-only dates and daylight-saving boundaries do not imply a fabricated instant. | R05–R06, R09  |
| AC10 | Positive funding response performs no charge, promise creation or gift write. A deliberate qualified P16 handoff proves its independent donor-instruction/identity/authorization and returns its own result.                                                                                                                                                                           | R07           |
| AC11 | Prayer/hosting/introduction acceptance sends no newsletter, grants no access, creates no unqualified referral edge, booking or consent. Never-ask and current communication rules remain enforced at actual outward action.                                                                                                                                                            | R07–R08, R12  |
| AC12 | Financial source links display current permitted authoritative outcomes, including reversal/partial fulfillment, without copying them into a writable request amount. Unknown/denied coverage cannot appear as zero.                                                                                                                                                                   | R07, R12, R15 |
| AC13 | Alternatives, overlapping staff attribution, recognition and source gifts cannot be summed as independent funding; per-entity/currency/horizon reports identify their measure and coverage.                                                                                                                                                                                            | R05, R15      |
| AC14 | Switch an unsaved monetary request to nonfinancial and back: no silent data loss or hidden money submission. Saved changes preserve authorized prior terms; omission and explicit absence remain distinct.                                                                                                                                                                             | R04, R14      |
| AC15 | Edit/record response while partnership is paused, or record a late fact after closure: preserve pause/review/closure and ended effects. Genuine return uses explicit reopening; a late gift does not reopen work.                                                                                                                                                                      | R08           |
| AC16 | Close/withdraw one request or change its responsible person: preserve other requests, source promises, current task accountability and meaningful history; assignment never creates access.                                                                                                                                                                                            | R03, R08, R10 |
| AC17 | Two-tenant tests reject foreign partnership/Party/ministry/owner/task/interaction/entity/designation/history links on create, update, import and elevated worker paths, including absent financial fields.                                                                                                                                                                             | R10–R12       |
| AC18 | Test every real actor class/capability and old/new row transformation. Deny forged actor/approval/owner authority, parent retargeting, unauthorized protected fields and direct immutable-history changes. Verify zero-row UPDATE is not misreported as success.                                                                                                                       | R10–R11       |
| AC19 | Search, counts, list, history, brief, attachment, export, cache, notification and replay result each respect existence/field/purpose restrictions and current revocation; no raw sensitive prose enters technical logs.                                                                                                                                                                | R12           |
| AC20 | Inject failure before commit: request change, history, result and required effect intent all roll back. Lost response after commit returns the same authorized durable result; retry cannot duplicate or overwrite a newer change.                                                                                                                                                     | R09, R16      |
| AC21 | Controlled concurrent revise/respond/close/owner-change, duplicate import/worker delivery, changed-payload retry and late downstream acknowledgment preserve invariants. External ambiguous success reconciles before repeat execution.                                                                                                                                                | R09, R16      |
| AC22 | Exercise real Supabase roles, grants, policies, views/RPCs and privileged paths; independently verify both eligible operations and prohibited transformed states. Elevated tests do not substitute for ordinary-role proof.                                                                                                                                                            | R10–R12       |
| AC23 | Retention/redaction preserves only permitted business/audit facts, removes restricted content from read models/caches/exports as governed, and follows backup policy. History cannot be hard-deleted through ordinary child/parent removal.                                                                                                                                            | R11–R12       |
| AC24 | Ordinary request counts include nonfinancial and amount-unknown records; financial totals exclude nonapplicable amounts and do not change because a money row joined twice. Source corrections preserve forecast history.                                                                                                                                                              | R04–R05, R15  |
| AC25 | Keyboard-only and screen-reader users can add, edit, record response and follow next action with labelled fields, focus continuity, non-color states, announced errors and no drag requirement. Verify WCAG 2.2 AA applicable criteria, not just an automated score.                                                                                                                   | R13           |
| AC26 | Representative ministry staff complete funding and nonfinancial scenarios, identify what was requested versus responded/received, change relevant details and find the next action without facilitator correction of those meanings. Any critical meaning/access/action error blocks pilot acceptance.                                                                                 | R13–R14       |
| AC27 | Narrow mobile layout, long international names/translated labels, locale money/dates, slow/lost response, permission expiry and concurrent edit preserve clarity and current-safe draft recovery; one intentional save yields one business effect.                                                                                                                                     | R09, R13–R14  |
| AC28 | A production-shaped retained-data rehearsal proves explicit mapping, no fabricated responses, duplicate handling, counts/source totals, quarantine ownership, old/new writer compatibility and safe roll-forward/rollback after new records exist.                                                                                                                                     | R18           |
| AC29 | With Phase 34/42 and unrelated event/volunteer/application products unavailable, prepare/record/resolve a nonfinancial request and follow internal work. Financial handoffs fail visibly when their required owner is unavailable; no shadow replacement appears.                                                                                                                      | R07, R16, R18 |
| AC30 | Under recorded supported tenant/request/history/actor workload and declared input/page/batch budgets, indexed plans, authorization cost, concurrency and recovery meet the adopted service budgets. Retain dataset, units, percentile/throughput definitions and limits; no unmeasured “scalable” claim.                                                                               | R17–R18       |

## Evidence obtained and proof not claimed

The new [conditional-money experiment](d22-evidence/conditional-money-probe/README.md)
passed **8/8 checks on its first runtime attempt**, PostgreSQL 17.11 at read
committed, 2026-10-10 17:21:53–17:21:58 UTC. It demonstrates the nullable-CHECK
counterexample, conditional applicable/unknown values, independent scoped parents,
rejection of a type-only change leaving old money, atomic local version/result
rollback, semantic replay preserving later terms, explicitly scoped aggregate
coverage and integer-cast/JavaScript-range hazards. Inputs, observations, pinned
image and exact container cleanup are retained. The root reviewer inspected the
SQL, cases, runner and results and verifies input hashes in the review checks.

It does **not** prove P12, nonowner RLS, concurrency, network response loss, real
money transport/UI, accepted financial services, ministry workflow usability or
any live Supabase release. No prior probe or application suite was rerun; this is
a documentation/research change. The fixture's kinds, keys, allowed unknown/zero
values and optional target do not ratify a production schema or universal monetary
presentation policy.

Fresh primary documentation confirms PostgreSQL's [CHECK and foreign-key semantics](https://www.postgresql.org/docs/17/ddl-constraints.html),
[numeric behavior](https://www.postgresql.org/docs/17/datatype-numeric.html), and
[policy behavior](https://www.postgresql.org/docs/17/sql-createpolicy.html).
When an UPDATE/ALL policy omits WITH CHECK, PostgreSQL can use its USING expression;
omission alone is not the claimed vulnerability. Inspect effective old/new policy
behavior, grants, privileges and all write paths. The [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
requires grants and row policies together; neither is a protected-field projection.
The changelog index was fetched after the web reader rejected its Markdown content
type. The relevant [PostgreSQL minor-release notice](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
was inspected: its extension/custom-operator migration concerns are not exercised
by this plain-constraint fixture. No live project upgrade assessment is claimed.

Pattern classification: source ownership and shared Tasks Hub are **durable
patterns**; exact-money helpers and labelled shared forms are **useful precedents**
requiring consumer qualification; legacy donation reports and coarse role checks
are **current limited patterns**, not forward P27 authority. Copying gift state
into request outcomes would **conflict with first principles**. We do not label
uninspected code an implementation accident or rewrite it in this review.

The [independent review](d22-evidence/independent-review.md) challenges the integrated
answer separately from the topic research. [Review checks](d22-evidence/review-checks.json)
record exact category/requirement/acceptance coverage, links, formatting, statuses,
prior-evidence preservation and bounded experiment integrity. These establish a
coherent documented decision; they do not qualify unimplemented product behavior.
The [initial documentation check](d22-evidence/review-checks-initial.json) found
only formatting in the independently appended review. Formatting was corrected. A subsequent
[check-ordering result](d22-evidence/review-checks-ordering.json) caught the new
link to that initial report before the validator archived it; the retained report
now exists. Final verification rechecks both links. Neither documentation issue
changed the database experiment or its executed inputs.

## Ruthless synthesis and implementation order

**Before recording this reviewed answer:** distinguish request from task, response
from execution, and nonfinancial from zero-value financial data; resolve mixed
invitations without another journey or bundle engine; preserve source ownership.
The exact recorded decision, owner table and R01–R18 do that. A is accepted with
its inherited boundaries and the coherent design safeguards above. No material
change was required by the review. The founder has now explicitly ratified the
reviewed decision and safeguards.

**Capture in the future spec/design:** common source semantics; the six-step UX;
presentation/response/forecast history; relevant money and honest absence;
responsibility/follow-through; allowed correction and lifecycle independence;
all-path authority; AC01–AC30. Reconcile each through canonical authoring sources,
including the financial-only shorthand in derived views, rather than editing a
generated mirror or treating a historical research note as current authority.
Ask-review policy, appeal population/attribution and comprehensive financial
association allocation remain their substantive Phase 27 branches. D22 identifies
and preserves those boundaries; it does not falsely complete the whole phase.

**Require implementation safeguards in this order:**

1. Verify the actual P9/P12/P13/P14/P16 and shared-work contracts and deployed
   eligibility boundaries needed for the selected operation. Inventory existing
   retained data and source-qualified references. This prevents building a second
   Party, task, promise or received-money authority.
2. Implement the smallest source command/model with tenant-aware relational and
   conditional-value constraints, narrow authorization, versioned business history
   and atomic durable result/effect intent. Prove ordinary and privileged paths,
   replay and competing edits before binding production UI writers.
3. Build one complete accessible staff flow using the shared UI: create or record
   existing request, record response, find/complete next work, correct/close with
   honest outcomes. Include both nonfinancial and monetary examples; do not ship
   nonfinancial as a hidden or inferior secondary workflow.
4. Add qualified financial handoff/read projections and source corrections, then
   reports with correct entity/currency/coverage. A nonfinancial record must not
   require a fundraising-provider outage to clear before it can be used.
5. Rehearse migration and mixed versions, test production-shaped budgets and run
   the representative staff pilot. Enable a bounded cohort only after source,
   authorization, accessibility, recoverability and meaning tests pass. Keep a
   writer/effect kill switch that preserves existing reads and history where safe;
   do not roll back to an incompatible writer after new data exists.

These steps are grooming-level ordering, not implementation tickets. No runtime
activation is authorized by this document.

**Monitor only residual operational risk after the gates pass:**

| Signal                                                                                                        | Threshold                                                              | Accountable owner                                                                       | Required response                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate request/response/effect for one permanent source-purpose identity, or impossible monetary tuple     | Any one confirmed case                                                 | P27 engineering owner; financial owner for affected links                               | Contain the affected writer/consumer, preserve evidence, reconcile by source identity and repair through qualified correction; investigate before reenabling. |
| Source-confirmed financial aggregate disagrees with its explicit owner measure after completed reconciliation | Any nonzero unexplained difference in the same entity/currency/horizon | Finance data owner with P27 reporting owner                                             | Mark affected result unavailable/incomplete, stop relying on it, identify duplicate/missing coverage; never alter source money to make the report match.      |
| Due work with no eligible responsible destination or failed required task projection at the recovery check    | Any one unresolved occurrence                                          | Tenant development operations owner; shared-work engineering owner for delivery failure | Surface the authorized exception, reassign/recover through source controls; do not broadcast protected work or mark it complete.                              |
| Unauthorized request/history/content disclosure                                                               | Any one verified disclosure                                            | Security/privacy owner and affected source owner                                        | Contain the projection, investigate scope and follow incident/retention procedure; monitoring never substitutes for authorization.                            |
| Accepted source mutation missing its required lawful history/result/effect intent                             | Any one confirmed inconsistency                                        | P27 engineering owner                                                                   | Disable affected mutation path, preserve source evidence and repair through an audited owner procedure; treat as atomicity defect.                            |

No absence of alerts proves usability, safe RLS or capacity. Those remain release
proof, not concerns deferred to monitoring. Thresholds above are invariant checks,
not invented production SLAs or assertions of known customer volumes.

## Adversarial check

### What could go wrong with this answer?

A general request screen could conceal financial assumptions, flatten partial
answers, duplicate tasks or treat willingness as money, consent or execution.
R01–R18 prevent those failures while retaining the selected broader scope.

### What hidden assumptions are we making?

We infer that some significant invitations benefit from separately tracked
answers. OMF confirms the support categories, not the frequency or preferred UI.
The representative pilot must verify that the workflow is useful and that routine
tasks remain easy. No agency interviews or user-satisfaction results are claimed.

### How does this affect the whole product?

P27 owns requests and their development meaning; P28 consumes the same source.
P9 shared work, P12 disclosure, P13/P14/P16 financial facts and P6/P17 communication
remain separate. P25 newsletter/service intake and Support requests do not
silently become cultivation requests or enrollment. A hosting invitation does not
require P37 to be installed merely to record it, or replace P37's execution facts.

### How does this affect the end-user experience?

Staff see a short relevant form, the actual response and a clear next action.
They can record existing work directly and correct mistakes without fictional
steps. Nonfinancial partnership gets an equally useful experience without empty
financial cards. Closed work stays understandable without perpetual follow-up.

### Does this follow modern best practices?

It uses explicit source ownership, exact money, current authorization, durable
business effects, progressive fields and accessible recovery. Official vendor
examples support parts of that judgment; no competitor supplies proof of this
whole model. The PostgreSQL experiment proves bounded mechanics only.

### Does this fit Asym’s existing repo and product direction?

Yes: native Asym Postgres CRM, one partnership source, shared work and exact shared
Maia/Base UI. Adjacent coarse permissions, numeric forms or legacy gift reports
are useful evidence of present code, not the accepted permanent request design.
No new vendor, UI system or general workflow engine is needed.

### Should we adjust the recommendation?

Retain A. Its already-stated boundaries need the coherent safeguards recorded
above; the review finds no material product or owner-contract change requiring
another founder vote. Independent review removed an accidental perpetual-follow-up
rule and an overbroad splitting restriction before final acceptance.

**Final disposition: Accept.** Cover both financial and significant nonfinancial
requests with the exact recorded decision and safeguards above, now explicitly
ratified by the founder. Do not replace the answer with funding-only tracking, a universal request
engine or a UI that hides incoherent financial data.

Verification results and retained experiment limits are recorded in
[D22 review checks](d22-evidence/review-checks.json). The founder's answer is
recorded in [Q22](phase27-q22-partnership-request-scope.md), and the
[session log](phase27-grill-log.md) is the continuing decision index.

The [ratification and continuation checks](d22-ratification-q23-validation.json)
verify the preserved exact decision, all D22 evidence and glossary. The earlier
review checks remain dated evidence of the pre-ratification documents. No runtime
experiment was rerun. [Q23](phase27-q23-request-review-policy.md) moves to the
substantive choice of organization-required review before selected requests are
presented; no answer to that question is inferred.
