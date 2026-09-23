> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 final convergence — money, recurring, wallet and documents

9 September 2026. Independent bounded audit for the accepted Q30 scope. This is a consolidation of the ratified donor journeys, not a new product fork, implementation or release certification. Source checkpoint freshly reconfirmed: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`, at `[historical Core checkout]`. The same five setup paths remain dirty. This lane changed only this work note; no source, outputs, canonical contracts, provider, database, dependency or GitHub changes.

## Result

The financial direction is coherent. I found **two specific cross-journey execution gaps** that should be closed in the final convergence requirements: the complete separate Wallet Remove result/recovery journey, and export of the newer annual-summary History descriptor. I also found an explicit older OpenSpec default-method statement that must be superseded during owner reconciliation. The accepted amount, date, recurring, receipt and recognition differences below are intentional and must not be flattened into a single total, status, default, success flag or timeout.

The review does not establish that the target source contracts or provider capabilities are implemented. Current wallet and generic receipt predecessors remain unsuitable. No fresh runtime tests were needed for this prose/cross-contract pass; prior evidence is qualified below.

## M01 — Finish the separate Wallet Remove journey and unknown-result fence

**Material concern: yes. Severity: high; potential financial/authorization impact if removal races a new use. Likelihood: credible integration error, with an incompatible current prototype; no live incident frequency is claimed.**

**Evidence.** Q03:13–21,170–184,242–243 already makes replacement selective, independently authorized and non-removing; it requires an exact credential command/result owner, all-dependency removal admission and a shared new-use fence. Its C17/T11 prohibits automatic detach/default/retirement and unsafe remove. Q16:173–211 adds intent-order and exact-target preference cleanup. Neither supplies the complete final Remove review/result/reentry journey. The inherited OpenSpec `add-donor-self-service/specs/donation-lifecycle/spec.md:139–153` requires remove and replacement for affected active-cohort lines. The current wallet has `Transfer & Delete` at1244, local mock methods at1255, first-method default at1378, local Set default at1393 and local remove/transfer handlers at1396–1416. Its in-use local count is not authoritative.

**What can go wrong.** A developer may make replacement imply detach, detach after only visible/active uses are replaced, lose the operation on navigation, retry with a new identity after a lost response, or clear a newer preference when an old removal finally completes. Provider detachment is not a reversible browser edit. A privacy-restricted dependency cannot be solved by exposing it, ignoring it, or calling the method unused.

**Exact permanent requirement to add.**

> **Separate Remove.** Wallet Remove SHALL resolve the exact qualified credential and current request scope through the existing payment/credential owner. Before showing its final consequential action, the owner SHALL qualify all relevant current dependencies, including accepted pending, paused, recovery, in-flight, unresolved and otherwise referenced uses, under the same admission fence used by new bindings/claims and source retirement. A visible zero-use count is never proof of removability. Restricted dependencies may block the action through safe non-disclosing copy; their existence, count and identity are not disclosed without independent permission.
> Historical evidence-only references and a new-gift preference pointer alone SHALL NOT become permanent in-use blockers; they remain preserved or receive the exact Q16 cleanup once the owner proves no live dependency requires the credential.
>
> If compatible authorized replacement is needed, the donor may enter Q03's existing guided Replace journey. Successful replacement SHALL return to a freshly revalidated separate Remove review; it SHALL NOT detach automatically. Deselected, incompatible, unavailable or indeterminate dependencies remain unresolved and prevent unsafe removal. Do not add a combined Transfer & Delete operation or quietly expand the selected gifts.
>
> Final Remove SHALL name the exact masked method and meaningful current consequence. An accepted removal commits one typed immutable source operation/result and an admission fence before any provider effect. No database lock is held over the provider call. The fence prevents new uses while removal is applying or indeterminate. Same-operation retries/readback reconcile the original effect; transport-key expiry, navigation, a new tab or reauthentication does not authorize a second detach identity.
>
> **Removing / Checking removal / Removed / Could not remove** SHALL reflect current owner evidence. A lost response is not failure or success. Already accepted work remains accessible through an authenticated exact-operation locator after preview/session expiry; the locator grants no authority. If the owner proves no provider effect and current safety permits it, only that owner may release the temporary fence. Do not invent an Undo for an irreversible detach or promise that the detached provider object can be reattached.
>
> After exact removal proof, clear only Q16 effective/pending references still pointing to the removed method, using its separate housekeeping and explicit-intent revision rules. Never clear a newer chosen method, revive an older pending choice, promote another method automatically or modify Stripe Customer billing defaults. Preserve historical method/authorization/effect references under their own retention. Adding a usable method again follows the qualified secure Add path.

**Scope impact.** Completes existing required Remove, not a new deletion feature, wallet service, founder question or automatic cleanup program. One source command/result extension already anticipated by Q03 is sufficient. The native provider primitive and actual account/rail/control behavior still need owner qualification; this review does not certify them.

**Required proof.** Actual owner/database/provider-seam tests for Remove versus new binding/claim, hidden and pending dependencies, replacement partial success, accepted removal followed by response loss, late old result after preference C, removal of effective A while valid pending B exists, exact provider no-effect recovery, repeated deep-link returns, and no newly admitted use during indeterminate removal. Browser proof must include Cancel before acceptance and reentry after acceptance without another mutation. Test the current direct paths, not only the new button.

## M02 — Preserve the annual History descriptor in Download history

**Material concern: yes. Severity: high for accidental scope widening; moderate for unexplained monetary mismatch. Likelihood: plausible because Q23 extends History after Q20's fixed export census.**

**Evidence.** Q20:13–17,209,237,375 requires copying all applied source-resolved predicates into a reviewed immutable export scope and an informational whole-gift CSV. Its base census specifies original Gift amount, Requested amount and material changes. Q23:15,37,110–118,155–157,223–245 adds the annual source descriptor, issuer-specific January1–today ranges and the current-effective posted monetary measure including charitable fee cover. Q23:245 expressly distinguishes current History from Q20's snapshot. Q10:81,90,222 requires original supported non-fee-cover Gift amount before refunds to retain its original meaning.

**What can go wrong.** An exporter that copies only visible Date/Fund/Amount controls can drop the annual legal-subject/issuer/currency/measure descriptor, collapse different issuer-local ranges into one browser-year filter, include pre-posting records excluded by the headline, or return a CSV whose only amount is the original pre-refund amount. Saying both values are giving without explaining their different bases undermines reconciliation. Freezing the original Home number to force equality would instead hide legitimate later corrections and current authority changes.

**Exact permanent requirement to add.**

> Download history opened from Q23's qualified annual History context SHALL copy its **complete effective source scope**, including exact giving subject, authorized issuer/currency partitions, each already-resolved civil interval, the existing monetary-measure identity/version and every applied narrowing predicate. The visible scope review SHALL disclose that annual/filtered context. A private descriptor is validated input, not authorization and not a bearer grant. Unsupported, expired or denied scope requires an explicit current proposal; it is never silently omitted or widened.
>
> The source's fixed **annual-context CSV schema** SHALL include a separately labelled **Current giving amount**, meaning Q23's current-effective monetary amount including actual charitable fee cover after finalized refunds/returns/corrections, at the export's coherent data-as-of basis. Retain the original **Gift amount** unchanged; do not repurpose it, calculate another independent measure, or add a cross-currency total. The added value is projected by the same owner at the same admitted root grain and field floor. It is not a browser sum, a tax deduction or a promise that an earlier Home total remains unchanged.
>
> Editing export scope uses the existing Q20 review and source resolver. Only a still-qualified annual/filtered descriptor may retain that schema/measure; ordinary generic History exports keep their reviewed base census. Scope and amount basis remain clear in the proposal and versioned CSV semantics, without a new wizard, report type picker or persistent saved report. A source change after Home entry can produce an honestly refreshed History/export basis; the accepted export subsequently remains one immutable as-of file, subject to current access invalidation.

**Why a basis note alone is insufficient.** A file containing only original gift100 while Home counts100+3 fee cover minus finalized inverse amounts cannot directly explain the displayed current measure. One extra source-owned value in this particular qualified context supplies the missing reconciliation without changing the filter meaning or creating a new ledger/total. Do not add recognition values or QCD deductible calculations to compensate.

**Required proof.** Home→annual History→export with a100 gift split40/60 plus3 cover, finalized partial/full refund, two issuer-local civil cutoffs, correction between entry and extraction, current permission contraction, and a later generic All available export. Confirm scope never broadens, original Gift amount remains100, current effective value matches the canonical fold at extraction, each root occurs once, and later corrections do not rewrite already Ready bytes. If a required amount is not export-authorized, resolve through current export policy with a truthful safe outcome rather than infer it from visible lines.

## M03 — Resolve the older Stripe-default OpenSpec language explicitly

**Material concern: yes. Severity: high. Likelihood: credible stale-contract implementation trap.**

`openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md:141` currently groups add/remove/**set-default through Stripe-managed flows**. Q16 expressly selects **Preferred for new gifts**, an Asym-owned actor/context preference that must not modify a Customer billing default or an existing recurring binding/retry. The older active-cohort-only remove example also cannot be the whole dependency test under Q03.

**Exact replacement meaning for formal owner reconciliation:**

> Donors add and remove qualified saved methods through the existing source-controlled provider boundary, using qualified Stripe-hosted fields for credential collection. **Preferred for new gifts** is the Q16 Asym-owned current human/giving-context preference used by the canonical new-gift checkout; it is not Stripe Customer billing default, a recurring binding, a mandate, fallback permission or a payment instruction. Remove uses Q03 and the completed separate Remove contract over every relevant source dependency, not only active subscriptions. Qualified hosted fields/native authentication do not delegate Core's scope, fee, authorization, command or result authority to Billing Portal.

Update the reached acceptance examples and callers together when formal publication is authorized. Do not fix the wording by quietly weakening Q16 or disabling legitimate existing recurring behavior. No source modification was performed in this audit.

## Cross-journey contracts that are consistent and must remain distinct

The following are **not newly discovered policy conflicts**. They are the exact assembly contract needed to prevent a generic UI/command abstraction from undoing accepted requirements.

### Financial action and outcome matrix

<!-- prettier-ignore -->
| Action/context | Permitted business effect | Result and recovery boundary |
| --- | --- | --- |
| Q16 standalone Add | Save/verify a credential for the separately disclosed setup purpose; optionally accept bounded new-gift preference intent | No payment, recurring authority, binding or billing-default change. Saved, ready and preference-applied are independent facts. Verification may validly finish after optional preference expiry. |
| Q03 Replace | Exact selected eligible recurring bindings/authorizations, group-specific independent results under one final reviewed intent | No automatic charge/retry/resume/restart/remove/default. A same-object metadata edit has potentially wider scope and cannot pretend deselection isolates it. Successful children remain successful during residual/unknown work. |
| Separate Remove | Only the precisely admitted credential removal and exact matching preference cleanup | The source admission fence and provider proof, not an unused UI count, decide completion. No catch-up, replacement rollback or automatic alternate preference. |
| Q09 ordinary recurring edit | Source-defined prospective changes to exact accepted lines | Ordinary Save is noncharging. An explicitly chosen, qualified Today occurrence is a separately named financial effect requiring exact review/authorization; one review may contain it. Unaccepted preparation is not an arrangement. |
| Q15 start again after fully canceled | Fresh recurring checkout and authorization, historical amount/frequency as editable suggestions only | Exactly one initial attempt per disclosed compatible new cohort after final authorization, even if continuing schedule starts later. Preserve separate real charges; no former mandate, debt, old retry or implicit earlier end/default. |
| Undo a still-active cancel-at-period-end | Only the separately qualified continuing source action, if supported | Not Q15's fully-canceled fresh restart. No old authorization resurrection from a raw Stripe canceled/active flag. |
| Q18 Pause | Current or future accepted pause interval over exact owner-qualified accepted lines | Preserve intent/control/payment axes. Initial ACH already in flight is independent; pending_activation can retain a future pause. Pause accepted now may close old recovery before its future start; copy must not say nothing changes until then. |
| Q18 Resume | Qualified continuing intent on unchanged source grid | No initial payment, re-anchor, proration or catch-up. A still-eligible original Today slot may be named/reviewed in the same action and collected only by its sole ordinary executor; expired/missed/submitted/unknown slots cannot be reopened. |
| Q06 optional repair follow-up | Only the exact failed scheduled occurrence whose original recovery window and source eligibility remain open, after the full original repair task is complete | No offer for terminal Missed, expired, paid or closed recovery, or after generic Wallet maintenance. Setup, provider return or partial replacement is not full repair. The offer starts a fresh exact owner review; it is not an automatic payment. |
| Q26 Request change/dispute | Nonexecuting immutable request; the explicit independently qualified dispute also enters protective authority review | Request received is committed receiving work, not terms changed or payments stopped. Fixed pledge authority, recurring authority and money remain separate. |

**One final financial-state statement:** UI actions that do not initiate a payment must not say **No charge today** when an independently authorized ordinary scheduled or already submitted payment can still occur. State the action's actual effect and separately show the source-qualified relevant payment facts. Likewise, an immediate successful checkout submission/ACH start is not received money. A calm success presentation may affirm the accepted instruction while retaining truthful Processing/verification/control qualification.

Q15's old known in-flight payment is not a universal blocker to fresh giving when the old future executor is definitively fenced and independent new authority is proved. Conversely, unknown old executor stop cannot be treated as safe. Q18's passed final horizon ends future intent across live intent axes while preserving cancellation/supersession precedence and remaining payment/control warnings. Q22 then derives Current/Past from complete authorized membership: terminal intent with a relevant unresolved stop/payment can remain Current without becoming ongoing; an unread receipt notice or new successor alone never revives it.

**Owner evidence:** P16 B1–B8:397–532; multi-axis facts:283–312; D3–D8:650–710; preview/apply:606–613; occurrences:1452; Q03:13–21,104,170–184; Q06:13–23,65–77; Q09:149–189; Q15 A2–A4 and:286; Q18 A1–A5/J01–J16; Q22:91–120. There is no support for a shared donor `active`, `success` or `amount` field deciding all of this.

### R06's positive case remains an explicit qualification gate, not an invented feature

Q06:77 and139 explicitly call same-object metadata repair and corrected-authorization preparation **candidates to examine**, not proved supported repair kinds. Current API field support cannot establish that the complete promised repair preserves an eligible old frozen occurrence. Some repair paths pay the invoice during authentication; other binding/cohort changes close old recovery. Do not mark this positive-case proof complete because repair and retry each exist separately.

The permanent implementation rule is finite: an unqualified repair-kind/rail/account profile exposes normal truthful completion/detail/help and **no optional follow-up**. Activate this optional action only for an exact positively qualified source repair result that preserves D4/D7 eligibility and current authorization. This does not block unrelated Wallet/History/recurring capabilities or add a debt/payment exception. The source qualification registry/test must name the supported positive case, or the optional feature stays absent for that profile. No new founder decision is needed and no generic provider dashboard is a fallback.

### Amount, legal-subject and document matrix

<!-- prettier-ignore -->
| Surface/record | Exact meaning | Must not be substituted |
| --- | --- | --- |
| Q05/Q10 ordinary legal-giving History | One source-qualified real gift root, with original evidence, permitted allocations and source-linked pre-posting/current outcome facts | Not one row per fee/refund/receipt attempt; not one fake combined charge across distinct compatible cohorts. |
| Q10 Gift amount filter/base CSV column | Original supported amount for ministries/projects before refunds, excluding separately recorded charitable fee cover, in one source currency | Not amount charged, matched allocation, current net, deductible amount or a reconstructed hidden parent. Pre-posting value is separately Requested amount. |
| Q23 Home and matching annual History | Current effective posted monetary hard-tender contributions including actual charitable fee cover, after finalized source inverse/delta effects; processor expenses not deducted | Not bank balance, irrevocable settlement, internal noncash FMV, soft credit, unpaid pledge, requested/processing payment or tax deduction. |
| Q26 Current commitment | Current fixed promise under P16 | Not payment authorization, balance due or sum of recurring future slots. |
| Q26 Received and applied | Source-owned conserving fulfillment applications/inverses against that fixed promise | Not the person's entire received giving or `promise minus current gifts`; reduced/released promise does not create refund or prove money received. |
| Q28 employee matching | Source-recorded progress and actual employer-funded received/reversed facts, partitioned by original issuer/currency and exact permitted employee relationship | Not employee legal donation or personal tax acknowledgment; expected amount/currency is advisory, not settlement authority. |
| Q29 DAF grants | Exact permitted sponsor-grant awareness/recognition; whole grant amount only if independently authorized | Not advisor legal-giving History/CSV, Q23 personal money, ordinary advisor tax receipt, or inferred full grant from partial `recognized_minor`. |
| Q29 IRA/QCD case | Actual admitted IRA owner/beneficiary's monetary gift plus separate custody/intent/case facts and qualified acknowledgment purpose | Not DAF soft credit, the custodian's automatic donation, a guaranteed deduction/exclusion, or a donor-owned tax calculation. |
| Q08/P18 official document | Source-purpose facts, logical document/current lawful head and immutable qualified artifact; current access separate from new issuance readiness | Not a live-text print of History, generic Stripe payment confirmation, newest file, successful email or financial permission. |
| P19 ordinary annual statement | Exact source-approved official annual item/subject/purpose population | Not Q23's informational current monetary amount, not a sum of overlapping individual/annual documents, and not QCD/DAF recognition inserted to force equality. |
| P19 Support overview | Separately qualified optional non-tax recognition report with its existing default Off | Not a gate to Q28/Q29 private awareness or a source of official deductible totals. |

**Proof fixture that ties the meanings together.** Person A makes an ordinary100 gift plus3 actual charitable fee cover, later finalized partial refund; has an employer-funded match50, an advisor-linked DAF grant200 and a source-admitted personal IRA gift300. Q23 includes the person's current ordinary monetary effect plus the300 IRA gift exactly once. It excludes the employer's50 and sponsor's200. Q10 original Gift amount for the ordinary record remains100. The annual-context export exposes both original and existing current-effective meanings at extraction. P18/P19 ordinary annual items and separate QCD acknowledgment retain their actual purposes; no sum or generic Receipt endpoint bridges a difference. Amounts remain partitioned by issuer/currency, with current authorization applied before any metadata, filter, number or detail is returned. A partially authorized fixture must not reconstruct excluded amounts from conservation or counts.

Q29 does not imply that every IRA-origin contribution is wholly nondeductible. Intent/source admission is organization-side qualification, not the person's final tax result; a P7-proved failed/withdrawn QCD intention can have its own lawful ordinary-case successor. Dark or unresolved QCD issuance alone never authorizes ordinary fallback. The actual purpose is `us.qcd.acknowledgment@1`; CodeY/1099-R, age or bank brand alone is not proof. These distinctions were already researched/ratified in Q29 and are not reopened here.

### Dates and currentness

- Q23 monetary annual membership uses effective P7 gift-date DATE under each issuer's verified timezone/civil today at one server as-of. A correction restates that gift-date cohort, not its later posting year. P2/P16 recurring `giving_timezone` has a different purpose; browser year and provider payout date are not substitutes.
- Q15 new checkout uses newly reviewed dates; last former amount/frequency can be suggestions, but old date/end/pause/authorization is not inherited. One initial attempt follows final new authorization even if the continuing start is future.
- Q18 interval is `[starts_on, resumes_on)` in arrangement timezone, with the inclusive final collection horizon independent. Pause end and next actual grid gift are different dates. Today means a source-admitted still-live window, not a universal midnight or 24-hour exception.
- Q20 freezes accepted scope then a coherent data-as-of file. Ordinary later new gifts/refunds/date corrections do not rewrite those Ready bytes. Relevant current row/field/subject/sensitivity contraction denies the whole file before further admitted egress. The original file may remain truthful while a later live History amount differs.
- Q08 current document and Q29 source-case corrections are different from export-as-of retention. A still-valid predecessor may remain available while a successor is pending/failed; a withdrawn predecessor cannot be exposed. Closing new issuance does not erase lawful historical access, but historical existence does not override an explicit access withdrawal.

No new universal source sequence is justified. P13 `effective_seq` is per owning header; date facts, P14 settlement membership/state and each header's sequence require a coherent source basis. A max timestamp/sequence or list cursor is not evidence of a transactionally coherent annual aggregate, match status/amount pair or export snapshot.

## Exact clock register — keep different purposes separate

These are accepted/source-defined limits, not freshly measured operational performance. Equality at a deadline must deny the expiring authority. Earlier current source/privacy/authority/qualified-provider restrictions win. A hold may preserve restricted evidence only under its exact owner; it does not extend donor UI access or authorize a stale payment/send.

<!-- prettier-ignore -->
| Clock | Start and boundary | Meaning / non-effect |
| --- | --- | --- |
| P16 preview/financial authorization challenge |15 minutes from issuance by default; terms/revision/authority changes invalidate immediately; a shorter qualified rule wins | New apply authority only. Expiry does not erase a source command already accepted in time or authorize replay. P16 S.6:2356. |
| P16 worker/claim lease |2 minutes with heartbeat, never beyond command/financial window | Execution coordination, not an extension of financial eligibility. P16 S.6:2357. |
| Provider idempotency cache |Provider-specific accepted retention; Stripe may prune after at least24 hours | Never Core's semantic-effect lifetime or permission to submit unknown work with a new key. Q03 P08; Q06 C10. |
| P16 durable semantic identity/evidence |For authoritative source life plus its audit retention; normalized record default7 years after later arrangement end or last related financial activity | Distinct from raw payload and temporary preview lifetimes. P16 S.6:2350–2356; stricter applicable owner policy applies. |
| Q16 optional new-gift preference request |24 elapsed hours from accepted Add/preference intent | Expiry ends automatic preference application, not independently valid credential setup/verification. |
| Q16 qualified microdeposit preference extension |10 elapsed days from that same original accepted instant, only positively classified before the24-hour ordinary window expires | No resend/read/classification clock reset. It is not a fabricated generic SetupIntent expiry. Q16:41–45,146,165. |
| Q20 reviewed export admission envelope |10 elapsed minutes from server issuance | Must be valid to admit new work; expired stale transport retry cannot create new work even after correlation purge. |
| Q20 accepted preparation |10 elapsed minutes from durable acceptance, including queue time | Different clock from review. No silent truncation or late Ready; retries retain the original deadline. |
| Q20 Ready file |24 elapsed hours after **first** atomic Ready (`ready_at`) | Reads/refetch/reauth do not renew. Current access contractions can deny earlier. |
| Q20 failed/incomplete preparation payload |No later than24 elapsed hours from acceptance | Temporary private payload, not money/history retention. Canceled/invalidated payload is promptly queued for deletion; access deny is immediate. |
| Q20 minimized operational correlation |30 elapsed days from acceptance | No private filter/manifests held merely for dedupe; security/egress evidence follows its own owner. Old expired-envelope retry cannot mint another export after cleanup. |
| Q25 first-handoff utility, both required steps |7 elapsed days from durable request acceptance, for first email handoff and first local notice materialization | Normal dispatch is immediate. Delayed sealing, retries or recovery do not create a new7-day window or unread item after it. Included here to distinguish its use of7/30/24 from financial material. |
| Q25 prepared external material |Same absolute7-day utility maximum, ended sooner by applicable P6 acceptance/no-send/terminal/exhaustion/source/privacy/unsafe-idempotency stop | Physical encrypted-byte/key/plaintext-cache purge within existing24-hour bound after stop; not30-day financial prepared material. Local step is prepared.none. |
| Q25 Core request body/detail |30 elapsed days from original acceptance | Existing notice detail/CTA cannot outlive it; does not promise erasure from provider or missionary mailbox. |
| Q26 ordinary/dispute request text |90 elapsed days from durable acceptance, earlier restrictive erasure; exact lawful hold only | No silent refresh or automatic normalized7-year narrative copy. Expiry is not completion or permission to guess an instruction. |
| Q26 normalized source journal |P16 authoritative retention above | Separate from90-day narrative; body erasure does not erase semantic result/idempotency. |
| Q29 QCD preparation investigation |24 elapsed hours after admission of a real source preparation operation without a hold | Operational investigation threshold, not a donor deadline, arbitrary business day, IRS rule or promise of issuance. A read does not start preparation. |
| Q15/Q16 indeterminate provider-effect investigation |5 elapsed minutes from first recorded uncertainty; exclude known normal bank processing/verification | Triage trigger, never terminal failure or provider settlement SLA. |
| P16 cash/occurrence read freshness |Normal p95≤2 minutes; Updating after5 minutes or a tighter applicable SLA breach | Source budget, not proof measured here. Exact provider stop/command deadlines still bind to their adopted owner registry. |

P16's card recovery also retains its independent civil +2/+4/+6 half-open windows,48-hour cutoff before the next ordinary occurrence and24-hour prior-payment control proof. The15 attempts in rolling30×24elapsed-hours number is specifically the **unattended product ceiling**; donor-present/provider-dashboard effects use applicable network headroom. This audit re-read P16 D6:679–690 and found no conflict with Q06. Do not turn these distinct budgets into one global count or reinterpret three later soft-failed normal cycles as three months.

## Current implementation versus accepted intent and proof

Fresh source reads confirm:

1. `apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx:65–188,1244–1416` remains a mock wallet with app-managed raw-form fields, first-method default, local transfer/delete and no authoritative use inventory. It is not a working Stripe-qualified wallet or a migration source for valid preference/authorization facts.
2. `packages/api/src/donor-portal/billing.ts:17–47` creates a generic Stripe Billing Portal session from the legacy donor Customer and returns its URL. `apps/donor/app/api/donor/billing-portal/route.ts:1` exposes that shared handler. It does not provide the ratified per-command selection, exact new-gift preference, recurring line effect or current result contract. Preserve only any independently valid qualified use; this generic handoff is not the new implementation or escape hatch.
3. `packages/api/src/donor-portal/receipts.ts:8–34,39–81` formats snapshot money with `/100`, creates current text labelled Donation Receipt and uses snapshot profile/ownership rather than P18 purpose/current artifact resolution. The new buttons cannot leave this direct URL as a generic fallback for QCD, DAF or unavailable official issuance.
4. Prior same-HEAD evidence in Q05/Q08/Q10/Q15/Q18/Q20/Q22/Q23/Q26/Q28/Q29 is reusable only within its recorded scope: existing model/unit/mock tests, source-bound probes, and in some earlier bundles actual isolated predecessor migration/RLS experiments. None becomes the target recurring executor, current giving/date fold, target PDP/RLS, canonical receipt/statement, real account capability, accessible browser or workload certification merely because Q30 scope is accepted.

**Adoption requirement.** Each enabled capability must have one reached source/read/mutation owner. Reconcile direct routes, command buttons, source callback handlers, caches, exports and records together; a hidden old UI button does not close an unsafe endpoint. Legacy mock defaults and snapshot-generated receipts are not fallback modes. Preserve independently safe donor read/help/document access and already accepted reconciliation when containing a new write/read; containment cannot undo giving or authorize manual SQL/provider-console repair.

## Minimal final proof additions

Reuse the previously specified target suites rather than adding one parallel suite per question. The final cross-journey integration matrix must contain these outcome assertions:

1. **Remove/admission race and unknown recovery:** M01's all-dependency and stale preference cases, on actual owner commands/schema and qualified provider seam; no second detach/effect or cross-context disclosure.
2. **Annual export continuity:** M02's complete descriptor and exact existing monetary measure across Home→History→CSV, with later source changes and access contraction.
3. **One financial effect despite multiple presentation successes:** Add, preference, replacement, ordinary edit, pause, initial ACH processing, first new restart authorization and exact Today resume distinguish accepted/source-money/control outcomes; a shared success toast creates zero extra provider calls.
4. **Partial cohort/leg failure:** Retain independently succeeded results, stop unknown duplicate replay, preserve each real gift root and provider evidence, and never re-run the complete original selection merely to fix one remaining child.
5. **Source-to-document purpose:** Ordinary money + QCD + DAF + employer match fixture above; direct legacy receipt URL cannot bypass current source-case/subject/artifact rules. Historical legitimate artifacts remain accessible under their own current grant while new issuance is dark.
6. **End/pause/cancel/currentness:** Horizon crossed during pending initial ACH, late initial success, future pause active, cancel control unknown and later finality; Q22 placement derives from permitted current reasons without losing Ended/Canceled meaning or reopening a past predecessor.
7. **Clock equality and restore:** Frozen clocks, same-operation retry after ephemeral cleanup, prolonged verification, delayed messages, old replicas/backups and mixed clients cannot extend effect authority, revive a prior preference, emit late first notices, or expose purged/withdrawn detail.
8. **Purpose-specific privacy and conservation:** Actor/context changes, issuer changes, hidden siblings, partial amounts and date/currency uncertainty deny the same facts in rows, counts, facets, summaries, CSV, wallet use hints and documents. No money sum or source conservation relation is used to reconstruct forbidden values.

These are release gates attached to existing owners. A failure of exact authorization, duplicate-effect prevention, money/case correctness, canonical current bytes or expiry fencing cannot be relegated to a vague monitoring entry. Operational5-minute/24-hour triage and p95 budgets remain named-owner responses after correctness proof; they never replace it.

## Ordered permanent path

1. Record M01/M02 and the explicit M03 supersession in the final convergence requirements. Retain the accepted matrix/clock meanings; no extra founder vote is required for these execution completions.
2. Reconcile the reached P7/P13/P14/P16/P18/P19/P3/P12 owner contracts and stale OpenSpec/ticket bodies at the authorized formal stage. Complete the existing typed credential/result and snapshot export/source-measure seams; do not add a wallet service, second ledger, global state/TTL registry, tax calculator or generic donor request engine.
3. Implement and prove those owner seams, then compose the single donor journeys and retire incompatible reached predecessor paths. Activate independently qualified capabilities; do not imply an unqualified R06 repair offer or document purpose is live.
4. Run the cross-journey assertions above alongside the prior targeted suites and actual scoped SQL/provider/browser/workload evidence. Ratified design and passing predecessor tests remain clearly separate from implementation readiness.

No further monetary product-choice fork was found. The remaining work is exact owner adoption and proof of the already accepted donor experience.
