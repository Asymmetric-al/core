# Phase 16 — Pledges & Recurring Commitments: Automatic Recurring Support First, Fixed Campaign Commitments Kept Truthful

## Status

Groomed via `grill-with-docs` on 2026-07-12 through 2026-07-13. Conrad ratified all nineteen decision families, **D1–D19**, after current-primary-source research and explicit adversarial hardening. This PRD is the authoritative `/to-spec` synthesis of those decisions. The supporting evidence is in `phase-16-pledges-recurring-commitments-research-evidence.md`; the dated predecessor reconciliation is in `phase-16-cross-prd-congruence-2026-07-13.md`.

**Slug:** `pledges-commitments` · **Roadmap position:** Phase 16 of 41 (roadmap v2) · **Primary predecessor:** Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) · **Other required predecessors:** Phases 2–7, 9–10, 12, 14, and 15 · **Later consumers:** Phases 17, 20, 25, 27–28, 33, and 35.

**Program posture: groomed-not-built and not dispatched.** This is a planning specification. Committing this planning package to PR #465 authorizes no product code, issue publication, label change, or `ready-for-agent` state; dispatch remains a separate founder decision. Phase 13's append-only contribution ledger, Stripe Connect topology, recurring-group substrate, Phase 6 communication-event spine, Phase 7 Party/receipt contracts, and Phase 3 role-projection floor are committed design dependencies but are not all implemented in the current worktree. Every anchor below is labeled **REAL** or **FORWARD** so an implementing agent cannot mistake current prototype code for the product contract.

**Critical predecessor supersession.** Published Phase 13 recurring children #706–#710 remain open and blocked, but their older recurring behavior is not safe to dispatch unchanged. Dated amendments A1–A15 and the issue dispositions in the congruence package are binding. In particular, this phase replaces one-subscription-per-line, `items[0]`, Stripe-Smart-Retry authority, one six-state status, UTC-as-business-calendar pause behavior, and optimistic provider adoption with the group/cohort/line, civil-date, product-owned-recovery, multi-axis, and proof-gated-control contracts below.

**Production gate.** Recurring card terms, off-session permission, ACH mandate and reinitiation, staff-assisted authorization, cancellation, required network notices, and campaign-commitment reminder purpose/consent are compliance-adjacent. Qualified payments/compliance counsel and the applicable processor/acquirer must approve the final production terms, scripts, evidence retention, and jurisdiction/rail rules. This document is not legal, accounting, tax, or network advice. Product defaults remain binding unless a stricter current rule narrows them.

---

## Problem Statement

Recurring support is the economic heartbeat of a missions organization, but the current platform has no trustworthy recurring-giving product. The checkout server accepts one one-time gift. Dormant client fields imply recurrence that the API does not support. Stripe webhook code reflects some subscription events into one legacy `donor_pledges` row, hides important provider states, increments mutable counters under at-least-once delivery, and cannot represent one donor arrangement with several independently managed destinations. The legacy table has nullable tenancy in later overlays, no enforced RLS, duplicated schedule fields, a payment-method string, and one status trying to mean donor intent, provider state, payment health, and fulfillment at once. It is migration evidence, not a foundation.

That gap hurts every participant differently:

1. **The donor cannot confidently create or manage ongoing support.** The product cannot show an immediate first gift and a separately chosen future recurring date, preserve an anchor across short months and retries, change one destination line without disturbing another, or distinguish a paused schedule from a failed charge. A generic Billing Portal link cannot supply those product semantics.
2. **The nonprofit cannot safely operate recurring collection.** There is no durable group/cohort/item binding, rail-isolated retry policy, one-use ACH recovery authority, exact-term staff service desk, or proof-gated response when a connected account is restricted or disconnected. A retry or reconnect can too easily become a duplicate charge.
3. **The missionary cannot tell cash from expectation.** The present read path selects the first active-looking pledge, normalizes it to monthly, and can expose a payment-method label. It cannot answer the everyday questions: what cash was actually received this month, what automatic gifts are scheduled this month, which support is paused or at risk, and what happens next.
4. **The organization cannot record the uncommon fixed-total promise without overbuilding it.** A church may promise `$10,000` to a campaign, perhaps with four expected checks. That is different from `$200 monthly until I stop`. Treating both as one pledge produces false balances, false lapse, false reminders, and poor UX; ignoring the fixed promise sends staff back to spreadsheets.
5. **A received gift cannot be authoritatively related to an expectation.** Header counters and amount/date similarity cannot prove which line or occurrence a gift fulfilled, especially for splits, partials, household remittances, DAFs, corrections, ACH returns, or late checks.
6. **Communications can become noisy or untruthful.** A provider attempt is not automatically a new human message. A pledge date is not permission to email. An email accepted by a provider is not proof that the donor read it. The current generic `scheduled_gift_reminder` literal does not establish purpose, authority, or truth.

The result is the most dangerous kind of product gap: the UI can look simple while the system silently conflates promise, schedule, authorization, provider control, payment, received money, fulfillment, recognition, health, and communication. Phase 16 must make the common online recurring experience excellent without building a second accounting system or a heavyweight pledge office for an edge workflow.

---

## Solution

Phase 16 delivers two deliberately separate products over shared platform foundations.

### 1. Flagship automatic recurring support

The donor creates one explicit **recurring-giving group** containing one or more destination-specific **recurring commitment lines**. Compatible lines share one logical **billing cohort**. An ordinary cadence has one explicit provider execution leg/subscription; twice-monthly has two, one for the 1st and one for the 15th. Every leg binds one exact provider item to every participating line. The donor sees one clear arrangement; provider objects remain executors, never business identity.

Monthly is featured when the tenant offers it. One-time giving stays clearly available as an adjacent gift mode, while exact alternate schedules use progressive disclosure: weekly, every two weeks, twice monthly on the 1st and 15th, every four weeks, monthly, quarterly, semiannual, and annual. The amount is always per occurrence. Tenant availability affects new choices only; existing schedules remain manageable.

An initial real gift is attempted immediately for each disclosed compatible billing cohort, never for each line or twice-monthly execution leg. The common one-cohort checkout therefore makes one initial charge; if genuine incompatibilities require multiple cohorts, the donor sees the exact number, amount, date, and destination allocation of every initial charge before authorizing. The continuing schedule defaults to the donor's current civil date in the tenant's frozen giving timezone, or the donor may choose a future date. The checkout review says exactly what happens today and what happens next. There is no duplicate same-day charge within a cohort, no organization-assigned 1st/15th billing date, no proration, and no hidden catch-up. Open-ended is automatic; **Set an end date** is quiet, accessible, and optional.

The donor can later change amount, destination, cadence, next recurring date, end date, or payment method; skip one named gift; pause until a date or indefinitely; resume; cancel directly; stop retries for one missed gift; and restart only through fresh authorization. Every change previews the exact affected line/cohort, amount, next dates, sibling effect, immediate-charge effect, and in-flight work. Historical anchors and occurrences are never overwritten.

Cards use one platform-owned, bounded, schedule-first recovery policy. Stripe creates ordinary renewals and proves payment finality; Asym owns eligibility, exact candidate dates, slot consumption, the three-later-occurrence runway, communication meaning, and safety fences. ACH has no silent same-occurrence retry. A narrow one-use donor-confirmed R01/R09 recovery is available only when the actual processor/ODFI path proves it lawful and exclusive; otherwise the donor may update future authorization or make a separate one-time gift.

Provider-control loss enters an evidence-derived quarantine. Asym suppressing its own commands never means the old provider executor stopped. Donor cancellation is accepted immediately, unsafe commands are fenced, and only same-binding cohorts that pass current-object, event-gap, in-flight, authorization, ledger, and no-conflict reconciliation return to managed collection.

### 2. Lightweight fixed-total campaign commitments

A **fixed-total pledge** records one explicit promised total for one Commitment Party. The common staff form asks only Party, total/currency, destination/campaign, commitment date, and evidence. It does not ask a scheduling question and it does not charge, invoice, receipt, recognize revenue, or create cash.

When the actual promise includes timing, staff deliberately choose **Add installment plan** and record one expected date, even installments, or custom expected dates. A partial custom plan must explicitly retain an undated remainder. Named expectations and the undated remainder exactly conserve the promise, but remain planning facts.

One calm **Change or close campaign commitment** doorway offers four truthful actions: donor-requested change, donor-requested ending, organization-only expectation release, or factual entry correction. They share a shell but not authority, meaning, or downstream effects. Received gifts and fulfillment history never change implicitly.

Campaign-commitment reminders are Off for every tenant and pledge by default. A tenant may make reminders unavailable, permit the fixed 30-day upcoming courtesy stage only, or permit that stage plus one source-aware follow-up. Authorized staff explicitly enroll a current plan and verified purpose-bound service contact. Every stage is merely a candidate that must re-prove current pledge, fulfillment, source freshness, authority, contact, consent, suppression, template, and duplicate truth at send time through the Phase 6/17 seam.

### 3. One authoritative relationship between expectation and money

Posted Phase 13/15 contribution designation lines remain the only money truth. Phase 16 adds immutable, conserved **fulfillment applications** from an effective contribution line to a recurring occurrence line or fixed-pledge expectation line. Complete provider lineage, authenticated donor instruction, or approved exact structured remittance may auto-apply. Names, amounts, dates, memos, OCR, recognition, and relationships may suggest a match but cannot silently create one.

All audiences consume the same append-only facts through different role-safe projections. Staff see complete evidence and repair paths. Donors see calm, actionable schedule and pledge truth. Missionaries see received cash first, then automatic recurring outcomes and next scheduled support, with fixed pledges only in a quiet conditional section. No projection authorizes money movement or becomes a second writable status.

---

## Decision Overview

| Decision | Binding result                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D1**   | Recurring commitments and fixed-total pledges are separate aggregates. Collection arrangement and posted money are orthogonal. No universal mutable commitment row, lifecycle, editor, or automatic conversion.                                                                                                                                                                                                |
| **D2**   | One explicit recurring-giving group contains independent destination lines and compatible billing cohorts. Ordinary cohorts have one provider execution leg; twice-monthly cohorts have two. Every leg binds one exact subscription item to each participating line. Grouping is never inferred.                                                                                                               |
| **D3**   | Monthly is featured when enabled; one-time is adjacent; tenants may offer the closed cadence catalog. Twice monthly means the 1st and 15th and uses two explicit execution legs, never an interval approximation.                                                                                                                                                                                              |
| **D4**   | One real initial gift is attempted immediately per disclosed compatible billing cohort, never per line or twice-monthly leg. Multi-cohort checkout discloses charge count, amount, and allocation before authorization. Continuing dates are donor-controlled civil dates in a frozen tenant IANA giving timezone. Epochs are append-only; short months clamp and recover; end date is optional and inclusive. |
| **D5**   | Skip one occurrence, bounded/indefinite pause, unchanged-grid resume, direct cancel, and freshly authorized restart. No debt, catch-up, or ordinary-save charge. Missionaries see truthful pause state but cannot act.                                                                                                                                                                                         |
| **D6**   | Asym owns narrow recovery policy and retry commands; Stripe owns ordinary renewals, network/rail facts, execution, and payment finality. No unattended retry for activation, ACH, hard/action-required, invalid, or uncontrolled cases.                                                                                                                                                                        |
| **D7**   | Balanced card recovery is original plus +2/+4 for weekly and +2/+4/+6 for all other cadences, with fixed local-date windows, a 48-hour floor, no sliding, actual-attempt accounting, manual slot substitution, and a direct stop-recovery action.                                                                                                                                                              |
| **D8**   | The triggering soft-failed occurrence and three later normally scheduled soft-failed occurrences may receive D7. The fourth later occurrence is schedule-only until success or genuinely new authorization resolves the episode. No backcharge; future safe gifts continue.                                                                                                                                    |
| **D9**   | Communicate on meaningful transitions, not each attempt. Recovery start, action required, terminal miss, ordinary success receipt, and mandatory notices have distinct owners and permanent semantic dedupe.                                                                                                                                                                                                   |
| **D10**  | ACH gets one normal unattended entry. No silent representment. One donor-confirmed exact-occurrence R01/R09 recovery is allowed only with provider/ODFI proof; otherwise schedule-only plus a separate one-time gift.                                                                                                                                                                                          |
| **D11**  | Fulfillment is an immutable line-and-occurrence application. Exact provider lineage, an authenticated donor instruction, or an approved authenticated structured-remittance mapping may each authorize automatic application; staff may confirm an exact manual application. Heuristics only suggest. Atomic conservation, exact inverses, ambiguity quarantine, and one shared effective fold are mandatory.  |
| **D12**  | Support health is a pure, versioned, freshness-gated derivation at line/fixed-pledge grain; collection lapse is cohort-grained. Lifecycle and attention reasons coexist. Unknown never defaults healthy.                                                                                                                                                                                                       |
| **D13**  | Missionary UX is cash-first and automatic-recurring-first. Month occurrence outcomes and the recurring list precede secondary goal coverage, forecast, and conditional other commitments.                                                                                                                                                                                                                      |
| **D14**  | Each commitment has one immutable Commitment Party. Representative, service contact, expected remitter, collection authorizer, posted legal donor, and Recognition Party are separately proven facts.                                                                                                                                                                                                          |
| **D15**  | Staff own one fast service case, but the real financial authorizer owns financial permission. Every command passes operator authority, Party instruction, and collection authorization and yields one of four server-derived outcomes.                                                                                                                                                                         |
| **D16**  | Provider-control loss uses a bounded evidence ladder and one tenant/account incident. Unknown control fences unsafe work; reconnect only starts reconciliation; a replacement needs old-stop proof and current authority.                                                                                                                                                                                      |
| **D17**  | Fixed pledge is total-first. An optional focused plan builder supports one date, even installments, or custom expectations with an explicit undated remainder and exact conservation.                                                                                                                                                                                                                          |
| **D18**  | Donor change, donor ending, internal release, and correction are four distinct append-only operations behind one short accessible doorway and one exact line/expectation fold.                                                                                                                                                                                                                                 |
| **D19**  | One Gentle fixed-pledge reminder profile, explicit current-plan enrollment, tenant reduction-only maximum, proof at send, permanent idempotency, easy purpose stop, and no parallel communication system.                                                                                                                                                                                                      |

---

## Dependencies and Predecessor Contracts

### Hard dependencies

1. **Phase 2 — locale, currency, and calendar foundation.** Reuse civil-date and currency conventions, but add one tenant-owned IANA **giving timezone**. It is not tax timezone, site locale, browser timezone, or processor settlement zone. Missing/invalid configuration fails closed for new recurring authorization; it never silently uses the server zone.
2. **Phase 3 — permission and role-safe projection.** Register every Phase 16 record/action/export. New fields fail closed. Privacy and anonymity are applied before display and aggregation.
3. **Phases 4 and 9 — identity and Party.** Reuse Party identity, claiming, and governed dedupe/merge. A merge may repair a canonical Party ID but never transfers the promise. A true owner change supersedes the old commitment.
4. **Phase 5 — public handoff.** Abandonment creates no donor-facing agreement. Once the processor accepts the exact recurring authorization and returns a durable initial-payment state, persist the agreement/occurrence/attempt even if ACH remains processing; never call it received.
5. **Phase 6 — communication intent, event, and consent spine.** Phase 16 records typed domain meanings/candidates. After domain re-proof, and only when the exact System message contract is Live in the pinned Phase 17 activation generation, it submits one authoritative bounded plan occurrence with a separate stable plan-occurrence token plus independent member tokens through Phase 6's atomic compiler. Even a one-member meaning uses that compiler; Phase 16 never loops over independently committed child submissions. An unknown or Reserved key creates zero Phase 6 communication state and is never historically caught up after activation. Phase 6 owns the coordination header, server-derived hashes, durable `communication_intents`, contactability, consent, suppression, `communication_events`, dispatch, and delivery evidence. Do not revive `notification_queue` or create a parallel sender.
6. **Phase 7 — legal donor, receipt, and statement truth.** Card success may issue the normal receipt. ACH processing issues an initiation confirmation only; official success receipt waits for confirmed success. Late return appends the exact reversal and superseding receipt/statement lineage.
7. **Phase 10 — sensitive-data firewall.** Payment details, authority evidence, provider/KYC facts, decline codes, and restricted identity remain out of donor/missionary projections except for the smallest safe donor-owned masked information.
8. **Phase 12 — capabilities and active assignment.** Server-resolved command capabilities are mandatory. Job title or UI visibility never authorizes a command.
9. **Phase 13 — contribution ledger, designations, Connect, and base recurring objects.** Consume the append-only money ledger and direct-charge connected-account topology. Amend its recurring contract to D1–D16; do not fork a second ledger, cart, Connect wrapper, or contribution writer.
10. **Phase 14 — recognition.** Soft credit, DAF advisor, tribute, and recognition remain separate from fulfillment, legal donor, Party ownership, and authority.
11. **Phase 15 — offline money front door.** Every check, cash gift, offline bank remittance, or other offline contribution posts through the governed batch commit path. Phase 16 may match a posted line; it may not create another money-entry side door.

### Later seams

- **Phase 17** owns governed localized message templates and rendering. Phase 16 pins typed facts, purpose, eligibility, and preview, not a vendor or mutable prose.
- **Phase 20** owns receivable/accounting classification, GL export, and finance posting. A CRM pledge is not automatically a receivable.
- **Phase 25** may deepen donor preferences and portal breadth, but Phase 16 must ship the core recurring self-service actions required for a complete recurring product.
- **Phases 27–28/33/35** may consume health, partner, reporting, and channel facts but cannot redefine them or bypass D9/D19 consent and proof.

### Dated congruence amendments A1–A15

The full amendment text is normative in `phase-16-cross-prd-congruence-2026-07-13.md`. This PRD incorporates it as follows:

- **A1–A4:** two aggregates, compatible cohorts, separate axes, and D6–D10 product-owned recovery supersede the roadmap and Phase 13 universal pledge/status/Smart-Retry language.
- **A5–A8:** civil-date skip/pause/cancel, explicit donor commands, separate recurring end semantics, and evidence-gated adoption supersede UTC/provider-owned lifecycle shortcuts.
- **A9:** recurring ACH processing is not successful receipt.
- **A10–A14:** cash-first missionary projection, immutable Commitment Party, Phase 6/17 communication ownership, recognition-versus-fulfillment separation, and Phase 15's sole offline money writer are binding.
- **A15:** the Phase 16 OpenSpec delta supersedes the active one-to-one `donor_pledges` recurring proposals before any implementation dispatch.

Issue dispositions are also binding: #706 and #707 are materially superseded; #708 is partially superseded; #709 is materially amended; #710 is re-scoped. #705 remains mostly orthogonal but any recurring fee-cover change must follow the same exact-term authorization rules as the underlying amount.

---

## Non-Goals / Out of Scope (Headline)

- A universal commitment/pledge table, lifecycle, editor, or mutation service.
- A second contribution ledger, receipt system, offline-money writer, recognition model, Party graph, capability system, or communication queue.
- A tenant-authored cadence engine, card-retry calendar, health/status vocabulary, matching DSL, reminder journey, legal rules language, or arbitrary approval chain.
- Daily recurring giving. D3's closed catalog does not include daily.
- Catch-up balances, donor debt, automatic backcharges, proration, or silent prepayment of future occurrences.
- A custom card vault, raw PAN/CVV/bank storage, custom ACH mandate engine, or recurring ACH TEL shortcut.
- Automatic provider failover, active-active executors, metadata-based adoption, or reconnect-as-recovery.
- Fixed-pledge receivables, GL, accounting write-offs, legal enforceability decisions, collections workflow, bulk write-off, or equal-prominence pledge operations center.
- Automatic pledge-reminder enrollment, force-send, due-date message, third touch, catch-up, inferred recipient, SMS escalation, AI timing, or general journey builder.
- Probability-weighted support scoring, donor risk ranking, cross-tenant benchmarks, or opaque churn prediction.
- Indefinite compatibility dual writes to `donor_pledges`, `pledge_charge_attempts`, or the legacy recurring mapper.

---

## Repo Anchors — REAL vs FORWARD

These are evidence and seams, not instructions to extend every named file.

### REAL today — reusable primitives

- `packages/api/src/donate/idempotency.ts`, `saga.ts`, and `payment-intent.ts`: required product idempotency, provider calls outside database transactions, durable outbox, claim/recovery, and unknown-outcome patterns.
- `packages/api/src/stripe/webhooks.ts` and `event-store.ts`: signed raw-event persistence, event-ID dedupe, async processing, failure/dead-letter handling.
- `packages/api/src/workflows/events.ts`, `ledger.ts`, `claims.ts`, and `functions/stripe-event-processing.ts`: identifier-only envelopes, product-owned dispatch ledger, tenant-scoped claims, recovery scans, and bounded concurrency. Workflow infrastructure executes work; it never owns commitment truth or becomes the billing engine.
- `packages/api/src/admin/contribution-operations/permissions.ts`, `viewer-projection.ts`, and `detail-read-model.ts`: server capability resolution, subtract-only projection, and stable staff read-model precedents.
- `packages/api/src/email/consent.ts`, `email/webhooks/resend.ts`, `email/template-store.ts`, and contribution-notification send/store modules: fail-closed eligibility, signed/deduped delivery events, versioned template binding, frozen policy evidence, and semantic/provider idempotency.
- `packages/api/src/donor-portal/service.ts` and `packages/api/src/missionary-portal/donors.ts`: tenant/ownership checks and stable server read seams to replace, not direct table access to preserve.
- `packages/api/src/admin/mission-control-tasks/service.ts` and `attention.ts`: tenant/dedupe-keyed exception work. Use for repairable exceptions, never normal occurrences or every miss.

### REAL today — red-list migration evidence only

- `donor_pledges`: one mixed mutable row, unsafe target model, RLS disabled in the original migration.
- `pledge_charge_attempts`: no production writer and insufficient occurrence/epoch/provider grain.
- `packages/api/src/stripe/recurring.ts`: provider reflection with collapsed states, non-tenant lookup risk, and replay-unsafe counters.
- Dormant donor-checkout recurrence/ACH fields: client residue while the server remains one-time/card.
- Stripe Billing Portal redirect: useful fallback for provider-owned capabilities, not the grouped/per-line management product.
- Missionary first-active-row monthly math and browser collections over `donor_pledges`: must be removed.
- `scheduled_gift_reminder` classified as unconditional transactional email: explicitly superseded by D19.
- Plaintext per-tenant Stripe secrets: predecessor gap; Phase 16 uses the Phase 13 connected-account substrate and must not spread the pattern.

### FORWARD contracts — required before dependent slices

- Phase 13 `commitment_groups`, `recurring_commitments`, append-only commitment amendments, contribution headers/designation lines/postings, and connected-account execution.
- Phase 6 `communication_events` and the one send/outcome seam.
- Phase 7/9 Party graph, contribution legal-donor record, and donor-claiming model.
- Phase 3/10 policy census and purpose-safe projection chokepoint.
- Phase 15 match-at-entry inspector seam.
- Phase 17 published template resolution.

An implementing agent must re-check these anchors against the branch at implementation time. If a forward dependency is absent, the dependent Phase 16 ticket remains blocked; do not privately rebuild the predecessor under a temporary Phase 16 name.

---

## User Stories

### Donor checkout and confirmation

- As Maria, I can choose **Give monthly** without navigating a wall of frequency tiles, while one-time and exact alternate schedules remain obvious and accessible.
- As Maria, I see that `$50 twice monthly — 1st and 15th` means two `$50` gifts, not `$50` split in half and not every two weeks.
- As Maria, I can add support for Ana and Clean Water in one recurring-giving group and review each line, today's total, the exact number and allocation of charges today, future charge count and dates, fee-cover, and payment method before authorization.
- As Maria, today's date is the default continuing anchor. If I choose June 1 on May 10, the review says **First gift: $50 today**, **Recurring schedule begins: June 1**, and shows the next three dates.
- As Maria, I am never charged twice today, never assigned silently to the 1st or 15th, and never charged by merely editing a date.
- As Maria, ongoing giving is the automatic default. I see no end-date question unless I open the quiet **Set an end date** control.
- As Maria, a card success produces a truthful success confirmation and receipt; action required tells me exactly what to do; ACH processing tells me it is processing and does not issue a successful-payment receipt.
- As Maria, refreshing, double-clicking, using two tabs, or recovering after a timeout creates at most one group and exactly one initial occurrence/provider attempt for each cohort disclosed in the review, never another attempt per line or twice-monthly leg.

### Donor recurring-gift management

- As Maria, I see one group with independent destination lines, original creation date, current anchor, amount/cadence, last successful gift, next scheduled gift, optional final eligible date, pause state, collection health, and truthful provider-sync state.
- As Maria, I can change one line without silently changing siblings. If the change creates a separate charge/cohort, the preview says so before I confirm.
- As Maria, I can skip one named occurrence, pause until an explicit date, pause indefinitely, resume on the unchanged grid, or cancel directly with one neutral confirmation.
- As Maria, I see **Paused — Resumes on [date]**, **Paused indefinitely**, or **Pause requested — being confirmed**, with resume and next scheduled gift shown separately.
- As Maria, I can update my payment method without being charged. A separate **Try this gift now** action states the exact amount/date and consumes an existing retry opportunity rather than creating a bonus attempt.
- As Maria, I can choose **Stop retries for this missed gift** without canceling future recurring support.
- As Maria, restarting after cancellation creates a new authorization and executor epoch linked to history, never a resurrection or catch-up.
- As Maria, every applied schedule change ends on a durable confirmation that states exactly what changed, when it takes effect, my next dates, any final date, whether an existing payment is still in flight, and whether provider synchronization is complete.

### Donor failure and ACH recovery

- As Maria, the first eligible card failure produces one useful recovery-start message with possible retry dates and safe actions, not an email after every internal attempt.
- As Maria, a terminal missed occurrence clearly says it was not received, is not debt, will not be added later, and that the next normal gift continues unless I change it.
- As Maria, a hard decline or authentication requirement produces one action-oriented message rather than pretend retries.
- As Maria, a returned ACH debit is never silently submitted again. If exact R01/R09 recovery is supported, I deliberately authorize one exact retry; otherwise I can repair future bank authorization or make a separate one-time gift.
- As Maria, neither a recovered ACH occurrence nor a one-time gift resets a repeated-normal-return runway unless a normal scheduled debit succeeds or a genuinely new authorization lineage is established.

### Staff recurring-support service desk

- As Maya, an authorized donor-care staff member, I manage the entire case from one **Manage recurring support** workspace without impersonating the donor or switching among CRM and processor screens.
- As Maya, the server tells me **Apply now**, **Complete with donor now**, **Awaiting authorization**, or **Collection blocked** from the exact before/after terms. I cannot relabel an increase as a correction.
- As Maya, I can immediately record a verified stop, reduction, postponement, pause, cancellation, or protective block with proportional evidence and no failed-message dependency.
- As Maya, I can prepare an increase, earlier date, new charged line, restart, or method replacement, then let the actual cardholder/account holder complete a minimal exact-term provider/e-sign step in the same case.
- As Maya, I see **Today / Next / Then**, affected lines/cohorts, in-flight work, exact authorization state, provider confirmation, and safe repair steps. I never see or store raw credentials.
- As Maya, a timeout or duplicate submit resumes the same case and operation reference rather than inviting a second command.

### Provider-control operations

- As Priya, the tenant payment owner, I see one incident when a connected account loses control, with safely masked identity, affected counts/amounts, support due soon, urgent donor-stop queue, indeterminate commands, owner/backup, and one next action.
- As Priya, a timeout is distinguished from restriction, deauthorization, wrong account/mode, and externally controlled executor.
- As Priya, reconnect moves cohorts to **Reconciling**, not Managed. Only proof-passing cohorts return; exceptions remain quarantined.
- As Priya, a donor cancellation during control loss is recorded immediately and prioritized, while the donor sees truthful pending provider confirmation.
- As Priya, I cannot press deceptive global **Pause all** or **Resume all**, replay stale changes, or activate a replacement before old-stop proof.

### Staff fixed-total campaign commitment

- As Maya, I record Grace Church's `$10,000` campaign commitment through a short form without answering a schedule or reminder question and with **No automatic charges** visible in review.
- As Maya, if the church supplied dates, I open **Add installment plan** and choose one expected date, even installments, or custom dates. A partial custom plan explicitly leaves `$X` without an expected date.
- As Maya, I always see Promised, Received and applied, Released internally, Remaining expected, named expectations, and undated remainder as separate facts.
- As Maya, I use one **Change or close campaign commitment** doorway and choose the truthful operation. Donor change, donor ending, internal release, and correction never share proof or silently alter gifts.
- As Maya, a stale/concurrent preview shows the canonical diff and makes me review again rather than overwriting newer fulfillment or terms.

### Fulfillment and matching

- As Maya, a posted contribution is received and receipted correctly even when its commitment match needs review.
- As Maya, complete provider lineage, an authenticated donor instruction, or an approved exact structured-remittance map may each apply automatically through its closed proof path; fuzzy similarity produces an explained suggestion only.
- As Maya, I can apply one gift across named expectations or several gifts to one expectation without cloning money or receipts.
- As Maya, partial/excess/reversed/returned gifts conserve exact minor units. An ambiguous partial reversal retracts uncertain coverage and opens one correction case rather than guessing oldest or proportional.

### Missionary dashboard

- As Ana, I first see **Gifts received this month** from the effective ledger, then **Online recurring this month** partitioned into Received, Processing, Upcoming, Recovery — needs attention, and Not received.
- As Ana, retries update the one planned occurrence rather than inflating this month's support.
- As Ana, my main recurring list shows permitted donor identity or Anonymous, destination, amount/currency, cadence, last successful gift, next scheduled gift, and calm health/attention wording.
- As Ana, a paused gift remains visible with the exact safe pause wording. A terminal miss remains clear in the source projection while its message key is Reserved; after the exact key becomes Live, it produces one grouped in-product notice, no email and no automatic outreach task.
- As Ana, monthly goal coverage and the 12-month forecast are secondary planning views. A fixed-total pledge appears only under conditional **Other commitments** when a relevant record exists.
- As Ana, I never see card/bank details, provider/mandate IDs, decline or retry internals, service contacts, reminder consent/delivery, staff notes, or hidden sibling lines.

### Reminder administrator and recipient

- As a tenant administrator, I can set the organization-wide maximum to Unavailable, Upcoming only, or Upcoming plus one follow-up. I cannot expand the fixed profile or auto-enroll records.
- As Maya, I deliberately choose **Set up reminders** for a current named expectation and current verified service contact. Saving the pledge or plan never enrolls it.
- As Maya, I see recipient, purpose, plan version, exact possible/skipped dates, timezone, current tenant maximum, send-time checks, and non-effects before **Turn on pledge reminders**.
- As Ruth, a service contact, I receive factual stewardship language, not debt or guilt. I can stop this reminder purpose without signing in or ending Grace Church's pledge.
- As Ana, I receive no reminder-recipient, consent, reply, or delivery noise in my missionary view.

### Developer, auditor, security, and operations

- As an implementing developer, I have one pure calendar kernel, one server command boundary, exact provider bindings, permanent semantic idempotency, and explicit state axes rather than inferred status strings.
- As a security engineer, every record/reference/query/job/cache/token/idempotency key is tenant scoped; cross-tenant/account/mode/application poison fails closed and alerts.
- As an auditor, I can reconstruct actor, Party instruction, collection authorization, schedule epoch, occurrence, attempt, provider evidence, fulfillment, receipt, communication, and correction without treating an audit entry as consent.
- As an operator, I see exception-only worklists, stable reason codes, correlations, freshness, and safe repair actions. Routine success, ordinary Off state, and normal misses do not create a task storm.

---

## Canonical Language and Truth Boundaries

### Product language

| Meaning                                                | Use                                                                       | Avoid                                                      |
| ------------------------------------------------------ | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Ongoing amount/cadence without promised lifetime total | Recurring gift / recurring support / recurring commitment                 | Pledge, debt, subscription as donor relationship           |
| Explicit promised cumulative amount                    | Campaign commitment / fixed-total pledge                                  | Automatic recurring gift merely because installments exist |
| Actual money                                           | Gift received / contribution                                              | Scheduled, pledged, expected, attempted                    |
| Provider-side automatic execution                      | Recurring executor / automatic collection                                 | Commitment truth                                           |
| Future calendar slot                                   | Next scheduled gift / expected occurrence                                 | Guaranteed payment, due debt                               |
| Failed occurrence whose recovery is over               | Not received / missed occurrence                                          | Amount owed, arrears                                       |
| Provider collection unavailable                        | Automatic gifts are not currently scheduled / collection lapse internally | Lapsed donor                                               |
| Organization-only fixed-pledge decision                | Released from internal expectation                                        | Donor canceled, paid, forgiven debt                        |

### Facts that must never impersonate one another

1. **Promise:** recurring line or fixed-total pledge.
2. **Collection arrangement:** manual, provider automatic, or externally managed.
3. **Schedule:** effective-dated civil-date rules and named expected occurrences.
4. **Authorization:** Party instruction plus rail-specific future-use authority.
5. **Provider control:** whether Asym can observe/direct the exact executor.
6. **Attempt/payment:** a provider call and its normalized state/finality.
7. **Money:** effective Phase 13 ledger contribution lines.
8. **Fulfillment:** explicit application of money to expectation.
9. **Recognition/legal donor:** Phase 7/14 contribution facts.
10. **Health/projection:** derived audience interpretation with freshness.
11. **Communication:** intent, dispatch, delivery, suppression, and correction evidence.

No table, enum, API DTO, dashboard counter, webhook mapper, or message template may collapse these axes into one writable `status` or infer one from another.

---

## Implementation Decisions — Aggregate Ownership and Domain Boundaries (D1, D2, D11, D14)

### A.1 Two operational aggregates

The implementation owns two domain modules:

- `packages/api/src/commitments/recurring/`: recurring group, independent lines, compatible cohorts, schedule epochs, occurrences, executor/control, recovery, donor/staff commands, and projections.
- `packages/api/src/commitments/fixed/`: promised total and lines, optional expectation plans, D18 operations, reminder enrollment/candidates, and pledge projections.

They share platform primitives and one typed fulfillment boundary, but not an aggregate table, lifecycle machine, mutation service, or generic editor. A semantic change creates a successor in the other domain, links predecessor/successor, resolves old expectations explicitly, and prevents overlap. It never flips a type column.

### A.2 One explicit recurring group, never inferred

A recurring-giving group is created by one accepted checkout or a later deliberate group action. It requires one tenant, one Commitment Party, one legal payer/collection-authorizer context, and one currency. Any mismatch in Party, legal payer context, or currency creates a separate group, not another cohort inside the old group. The system may not merge or infer groups from email, household, Stripe Customer, payment method, amount, date, destination, cadence, or connected account.

One group contains stable destination-specific lines. Line identity survives provider replacement, cohort split, schedule change, and historical allocation changes. A group may contain several cohorts only for a real incompatibility or provider limit, and every audience-visible preview discloses separate charge count, amount, and date.

### A.3 Compatibility predicate

Two active line epochs may share a billing cohort only when every following value is equal or explicitly compatible:

- tenant and Commitment Party;
- legal payer and collection authorizer scope;
- currency;
- connected account, livemode, merchant, charge architecture, and provider Customer;
- payment authorization lineage and rail;
- cadence, continuing anchor, giving timezone, and operational-time resolver;
- pause/skip/recovery behavior and final eligible horizon;
- collection arrangement and current provider-control posture; and
- provider item-count and feature capability limits.

Compatibility is a pure server predicate with a version. The client never decides it. A line change that breaks compatibility creates a prospective split under one command and one review; it does not mutate siblings or rebuild an old failed invoice.

### A.4 Ownership matrix

| Fact/action                                                                        | Owner                                                                   |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Group identity and visible history                                                 | Recurring group                                                         |
| Destination, amount, planned end, attribution/allocation                           | Recurring line                                                          |
| Civil-date epoch and line-to-cohort membership                                     | Schedule epoch                                                          |
| Payment method, invoice timing, collection behavior, retry/recovery                | Logical billing cohort                                                  |
| 1st/15th composite business intent                                                 | Recurring line/schedule                                                 |
| Ordinary one provider executor; twice-monthly two provider-side 1st/15th executors | Execution legs under the one logical cohort, each with exact line items |
| Provider invoice/payment                                                           | Cohort occurrence/attempt                                               |
| Received money                                                                     | Phase 13 contribution ledger                                            |
| Commitment coverage                                                                | Fulfillment application                                                 |
| Party ownership/authority roles                                                    | D14 typed evidence records                                              |
| Staff/donor operation                                                              | Append-only command request/event journal                               |
| Audience summary                                                                   | Rebuildable projection only                                             |

### A.5 One Commitment Party with separate roles

Each recurring group or fixed-total pledge has exactly one non-null Commitment Party. The owner is immutable business history. A governed same-real-world-Party merge may re-point the canonical ID while retaining the original owner snapshot; a true owner change supersedes the record and requires fresh intent and collection authority.

Keep these facts separately typed and effective-dated:

- representative authority, scoped to represented Party, purpose/action, and optionally one commitment;
- service contact, scoped to commitment and message purpose;
- expected remitter, a matching hint only;
- collection authorizer and exact rail terms;
- posted legal donor on each contribution; and
- Recognition Party from Phase 14.

One role never grants another. Household membership, marriage, shared contact, treasurer title, employee role, prior payment, provider Customer, DAF advisor, soft credit, or missionary relationship grants no implicit promise ownership, portal access, Party instruction, mandate, legal-donor status, or fulfillment.

The common individual self-giving path creates no artificial representative row and asks no extra donor question. Organization/household/third-party cases use progressive disclosure. V1 excludes co-obligors, guarantors, recursive delegation, tenant-defined role semantics, and a general legal-agreement graph.

### A.6 Typed cross-product fulfillment target

D11 requires one safe application interface without reintroducing a universal commitment aggregate. Use an immutable `commitment_fulfillment_targets` registry whose sole purpose is to expose the conserved target grain:

- `recurring_occurrence_line`;
- `fixed_expectation_line`; or
- `fixed_unscheduled_balance_line`.

Every target is created transactionally by its owning domain, carries non-null tenant, currency, designation, capacity, and an exact same-tenant source FK, and cannot change type. It contains no lifecycle/editor/status. Applications reference this target ID rather than an unchecked polymorphic pair. The owner domain remains the source of expectation meaning.

---

## Implementation Decisions — Cadence, Calendar, Checkout, and Initial Gift (D3, D4)

### B.1 Closed cadence registry

| Key                  | Donor label                  | Calendar rule                         | Native provider representation      |
| -------------------- | ---------------------------- | ------------------------------------- | ----------------------------------- |
| `weekly`             | Weekly                       | Anchor + 7 calendar days              | week × 1                            |
| `every_2_weeks`      | Every 2 weeks                | Anchor + 14 calendar days             | week × 2                            |
| `twice_monthly_1_15` | Twice monthly — 1st and 15th | Fixed 1st and 15th slots              | two explicit monthly execution legs |
| `every_4_weeks`      | Every 4 weeks                | Anchor + 28 calendar days             | week × 4                            |
| `monthly`            | Monthly                      | same preferred day, clamp-and-recover | month × 1                           |
| `quarterly`          | Quarterly                    | same preferred day + 3 months         | month × 3                           |
| `semiannual`         | Every 6 months               | same preferred month/day + 6 months   | month × 6                           |
| `annual`             | Annual                       | same preferred month/day + 12 months  | year × 1                            |

One-time is `gift_mode=one_time`, never a cadence. Daily is invalid. Labels such as biweekly/bimonthly are forbidden in donor-facing copy and canonical types.

The amount is per occurrence. Twice monthly charges the entered amount on both slots; review shows the two dates and combined monthly face amount. Every active policy has exactly one enabled featured cadence. Monthly is that cadence whenever enabled; if a tenant disables monthly, it must atomically choose one other enabled cadence as featured. Disabling affects only new selection; existing schedules are grandfathered and fully serviceable.

Tenant cadence policy is append-only/versioned. Checkout binds the policy version used, then revalidates availability at final submit. A policy change never rewrites an accepted line.

### B.2 Giving timezone and missing-configuration behavior

Phase 2 `org_settings.giving_timezone` is the tenant-owned canonical IANA setting for donation schedule intent. Schedule epochs freeze the zone and timezone-rule evidence used at creation. It is separate from tax timezone, site locale, user browser zone, database zone, and Stripe's UTC timestamps.

New automatic recurring authorization fails closed with an admin-actionable configuration error when the zone is missing or invalid. Existing imported records with authoritative source zones retain them. An imported date without enough rule/zone evidence is read-only/quarantined until staff resolve it; the system never guesses from processor UTC.

Changing the tenant default affects new epochs only. A normal donor schedule amendment inherits the arrangement's existing zone. Moving an existing arrangement to a new zone is an explicit, previewed re-anchor operation, not a side effect of tenant settings.

### B.3 Pure schedule kernel

Implement one provider-independent calendar module with deterministic inputs:

```ts
type ScheduleTerms = {
  cadence: RecurringCadence;
  preferredAnchorDate: LocalDate;
  timezone: IanaTimezone;
  finalEligibleDate: LocalDate | null;
  ruleVersion: string;
  timezoneRulesVersion: string;
};

type ProjectedOccurrence = {
  occurrenceKey: string;
  scheduledLocalDate: LocalDate;
  executionLeg: "primary" | "day_1" | "day_15";
  resolvedInstant: Instant;
  resolvedOffset: string;
  eligible: boolean;
};
```

The kernel owns next-N dates, epoch boundaries, short-month/leap restoration, twice-monthly slots, end eligibility, skip/pause suppression, and retry-window resolution. Same inputs, evaluation time, and rule versions produce the same outputs. It never reads provider settlement, retry, last-success, or `Date.now()` inside domain logic.

Month-family calculations always add from the original preferred calendar day/month, not the prior clamped date. January 31 produces February 28/29 and then March 31. February 29 annual produces February 28 in a non-leap year and returns to February 29 in a leap year. Quarterly/semiannual use the same clamp-and-recover rule. Property tests cover a 400-year Gregorian cycle.

Provider execution time is a separate resolved fact. A universal local-noon or UTC-midnight shortcut is forbidden. The adapter must prove a zone/cadence-safe operational time, freeze the resolved offset/instant on each materialized occurrence, and fail closed if provider mapping cannot preserve the donor's civil-date promise. Timezone database updates trigger drift comparison for future unclaimed occurrences; they never rewrite historical resolved evidence.

### B.4 Initial gift and continuing schedule

Every payment-backed recurring checkout attempts one real initial contribution per disclosed compatible billing cohort immediately after authorization submission. A one-cohort group therefore has one initial provider attempt. A multi-cohort group may have multiple initial charges only because the provider cannot honestly combine those cohorts; checkout shows the exact count, each amount/destination set, and date before submission. There is never one initial attempt per line or per twice-monthly execution leg.

The recurring schedule start is a civil date in the tenant's governed giving timezone. It defaults to the tenant's current civil date resolved from the server clock and may be today or a future date only. Preview and apply independently reject any selected date before that current civil date, using the same explicit clock, IANA timezone, tzdb version, and resolver version under lock. Checkout preserves the donor's other inputs, focuses a linked error summary, and says **Choose today or a future date** beside the field; it never silently substitutes today, UTC, the browser date, or a provider default.

1. **Continuing anchor is today:** each cohort's initial gift is its first scheduled occurrence. The next occurrence is one full cadence later. No second same-day invoice or PaymentIntent exists for that cohort.
2. **Continuing anchor is future:** each cohort's initial gift is linked to the group and line allocations but outside the continuing series. The selected future date is occurrence one of the series. No trial/proration semantics substitute for this distinction.
3. **Twice monthly, today is 1st/15th and selected start is today:** the initial gift fulfills that slot; the next series slot is the other fixed date.
4. **Twice monthly, today is off-slot:** the initial gift remains outside the series; the default continuing start is the next 1st/15th. A donor-selected future start must be a 1st or 15th.

The accepted-agreement saga uses distinct permanent identities for checkout command, group, line, initial occurrence, schedule epoch, cohort, required execution legs/bindings, provider mutations, and later occurrences. Browser loss retrieves the command by tenant/session/semantic idempotency; it never resubmits blindly.

The provider adapter must prove exactly one initial PaymentIntent per disclosed cohort across all branches. The accepted-agreement saga freezes one mutually exclusive owner: either the executor's initial invoice owns that attempt, or a separate product-triggered operation does; never both and never neither. For a today-start subscription, that cohort's initial invoice PaymentIntent may be its initial gift. For a future-start arrangement, the immediate PaymentIntent and later executor are separately identified and authorized. A twice-monthly cohort still receives only one immediate initial attempt even though its continuing schedule has two leg subscriptions. Do not use `billing_cycle_anchor=now`, hidden trial behavior, or proration as a generic shortcut.

Each successful actual initial provider attempt produces one Phase 13 contribution header with its exact cohort line/designation allocation and one initial occurrence allocation snapshot. The group review aggregates these facts for comprehension but never merges unlike provider attempts into false money identity.

### B.5 Activation and payment finality

| Initial outcome           | Recurring intent/executor behavior                                                                                                        | Donor confirmation                                          | Money/receipt                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| Card `succeeded`          | Activate accepted schedule after binding/reconciliation                                                                                   | Success + next scheduled gift                               | Post once; normal receipt                            |
| Card `requires_action`    | Pending activation; no unattended future collection until action succeeds                                                                 | Exact action required                                       | No received gift/receipt                             |
| Card hard/soft failure    | Activation failed/action required; no D7 automatic activation retry                                                                       | Repair/retry checkout safely                                | No received gift/receipt                             |
| ACH accepted/`processing` | Persist agreement and occurrence as activation processing; future bank execution remains fenced until first normal authorization succeeds | Initiated/processing + schedule shown as pending activation | No received gift; initiation confirmation only       |
| ACH `succeeded`           | Establish bank collection lineage and activate future executor when all controls pass                                                     | Success + next scheduled gift                               | Post once; normal receipt                            |
| ACH return/failure        | Follow initial-activation repair, not D10 recurring recovery                                                                              | Reason-safe repair                                          | No success receipt; append correction if late return |
| Unknown provider outcome  | `Being confirmed`; exclusive command fence and reconciliation                                                                             | Do not resubmit                                             | No guessed money/receipt                             |

An accepted ACH arrangement may exist while activation is processing, satisfying Phase 5 recovery after browser loss, but it is not successfully funded or safe for another debit. If a scheduled date arrives before activation is proven, materialize it as safety-suppressed/activation-pending with no catch-up.

### B.6 Checkout interaction contract

The common mobile/desktop order is:

1. amount and first destination;
2. gift mode, with Monthly featured when enabled and One time clearly available;
3. **Other schedules** progressive disclosure;
4. optional **Add another destination**;
5. quiet recurring details: today-default **Recurring schedule start date** or **Next recurring donation date**, and secondary **Set an end date**;
6. provider-owned payment authorization; and
7. one editable check-answers view.

The check-answers view includes every line/designation, amount per occurrence, total today, the exact number of separate charges today with each charge's amount and destination allocation, continuing charge count, cadence, continuing anchor, named giving timezone, next three dates, optional final eligible date, fee-cover separately, payment rail/masked method, off-session/ACH terms, and how to manage/cancel. The submit label names the outcome and, when more than one initial charge is required, names the charge count and total. Twice-monthly copy explicitly says the full amount is charged on both dates while its logical cohort still receives only one initial charge.

The end date is not a required choice, is not called Recommended, and has no guilt/confirm-shaming. Only after the donor opens the control does brief guidance explain that the selected date is the final eligible gift date and that pause/cancel remain available. A selected end date gets one concise inline review, not a retention modal.

Errors preserve input, focus a linked summary, repeat the same inline correction, and expose status programmatically. On submit, controls become unavailable with a live waiting state. A timeout offers **Check donation status**, not another charge button.

### B.7 Schedule amendments

Historical creation date and original anchor never change. A later donor or authorized staff edit creates a new schedule epoch with:

- exact before/after terms;
- effective boundary after any already claimed/in-flight occurrence;
- current line and cohort revisions;
- projected next three dates;
- end-date and pause/skip consequences;
- cohort split/join plan;
- provider mutation plan/capability; and
- no-immediate-charge assertion unless a separate named charge action is confirmed.

Changing the **Next recurring donation date** re-anchors future occurrences. It never creates a retroactive charge. If the chosen date is today, the donor confirms exact amount/date in a financial review before any attempt. A pending provider payment cannot be rescheduled; the preview says the change starts with the next eligible occurrence.

Every requested next recurring date or re-anchor date must be today or a future civil date in the arrangement's governed giving timezone. Preview and locked apply independently reject a past date using the same frozen clock, IANA timezone, tzdb version, and resolver version; the UI preserves input and presents the same linked error-summary and inline correction used at checkout. Correcting historical schedule evidence is a separate, capability-gated record-correction operation: it never changes the live epoch, materializes an occurrence, or attempts money.

Schedule, amount, cadence, or destination changes never silently prorate, catch up, apply credit, or rebuild an old invoice. The command is atomic at domain grain; provider partial outcomes remain explicit and repairable.

Every applied schedule amendment returns a durable, refreshable confirmation derived from the immutable command result and accepted schedule epoch, not a transient toast or a later live recomputation. It identifies the affected line(s), exact effective civil date, amount per gift, cadence, next three projected dates, final eligible date or **No end date**, and whether any payment is due today. It separately states any already submitted/processing payment that the change cannot affect and the current provider-sync result (`complete`, `pending reconciliation`, or `failed — organization is repairing`). A duplicate apply, webhook, refresh, or Phase 6 replay returns the same command/confirmation identity and cannot create another epoch or contradictory summary.

The source-owned durable confirmation is complete without a communication send. `recurring_schedule_changed_v1` is **Reserved** in the current Phase 17 executable catalog, so the successful command MUST NOT invoke the Phase 6 compiler or create a plan-occurrence header, child intent, `communication_event`, notification item, or delivery claim. Only a future idempotent activation generation that proves this exact key **Live** may allow later successful amendments to submit one complete bounded plan occurrence after current source, recipient, and purpose proof. That Live path supplies separate stable plan-occurrence and member tokens; Phase 6 owns the header, exact binding/plan resolution, child intent, and release, and Phase 17 owns rendering. Activation is prospective: it never catches up or replays historical amendments. Delivery failure after Live activation never reverses a valid change, but the durable confirmation may show only evidenced Phase 6 truth such as **Confirmation requested**, **Sent**, or **Could not deliver** and exposes the safe contact-repair path. While the key remains Reserved, the confirmation shows arrangement/provider-sync facts only and makes no delivery claim. Skip, pause, cancel, and payment-recovery actions retain their own truthful action confirmations rather than being mislabeled as a schedule-change message.

### B.8 Final eligible date

The final eligible date is optional, line-scoped, and inclusive. An occurrence exactly on it may begin; no new scheduled occurrence or retry starts after it. An attempt submitted on/before it may settle, fail, return, refund, or dispute later. The cutoff disables provider automatic collection/retry and is proved by retrieval/reconciliation.

The final eligible date must be on or after the first continuing scheduled occurrence under the accepted terms. This is validated in the server-owned preview and again under lock when the command applies. For example, a May 10 immediate gift with a June 1 continuing start rejects a May 20 final eligible date; June 1 is valid and permits that one continuing occurrence. The immediate initial gift is not used to make an otherwise impossible continuing range appear valid.

A line with a different final/retry horizon splits prospectively from siblings. For twice-monthly, each execution leg independently honors the line's boundary while the business line ends only after all eligible slots are resolved. Passing the boundary produces **Ended as scheduled**, not pledge completion, cancellation, shortfall, or collection lapse.

## Implementation Decisions — Recurring Lifecycle and Donor Control (D5)

### C.1 Separate state axes

No writable `active`, `past_due`, `lapsed`, or `closed` column may stand in for the recurring arrangement. The product derives human language from independently auditable facts:

| Axis             | Canonical examples                                                                                                  | Owner                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Donor intent     | `pending_activation`, `ongoing`, `paused`, `cancellation_requested`, `canceled`, `ended_as_scheduled`, `superseded` | Asym command journal                              |
| Schedule         | current epoch, next eligible occurrence, skipped occurrence, pause boundary, final eligible date                    | Schedule kernel + epoch journal                   |
| Occurrence       | `planned`, `suppressed`, `claiming`, `submitted`, `closed`, with an evidence-derived closure reason                 | Asym occurrence ledger                            |
| Payment          | `processing`, `succeeded`, `failed`, `action_required`, `indeterminate`, `reversed`, or not applicable              | Provider event store and normalized payment facts |
| Collection       | `healthy`, `retry_scheduled`, `at_risk_future_continues`, `action_required`, `schedule_only`                        | D6–D10 evaluator                                  |
| Provider control | D16 control ladder                                                                                                  | Evidence-derived control evaluator                |
| Reconciliation   | `current`, `pending`, `mismatch`, `blocked`, `unknown`                                                              | Reconciliation worker                             |
| Support health   | lifecycle plus zero or more D12 attention reasons and freshness                                                     | Pure versioned evaluator                          |

Display labels may combine axes, for example **Paused — Resumes on 14 June**, **At risk — Next scheduled gift still planned**, or **Being confirmed**. A combined label is a projection, never command input or financial truth.

### C.2 Four ordinary donor actions

The donor dashboard offers four clear operations from one recurring-line detail view:

1. **Skip the next gift** — suppress one named future occurrence after previewing its exact date and amount.
2. **Pause gifts** — choose a resume date or pause indefinitely.
3. **Change this recurring gift** — edit permitted future amount, destination, cadence, next date, final eligible date, or payment method through the D4/D15 authorization rules.
4. **Cancel recurring gift** — record cancellation intent immediately and stop future collection when provider control can be proved.

This is not a four-button danger wall. The first view shows the current arrangement and one **Manage** action; the four truthful operations appear in a calm task sheet or full page with plain-language consequences. Destructive final actions use consequence-based labels such as **Cancel future gifts**, not generic **Confirm**.

### C.3 Skip one occurrence

Skip targets an immutable occurrence identity, not “the next date” as an unguarded string. On save, the server revalidates that the occurrence is still future, unclaimed, eligible, and in the same epoch/revision shown in the preview. A successful skip:

- appends a command and suppression event;
- records who acted, authority, before/after revision, reason category if provided, and civil date/zone;
- leaves the occurrence in history as `suppressed_by_donor` or `suppressed_by_staff`;
- does not move the normal grid, create debt, or add a catch-up gift;
- suppresses all execution legs for that business occurrence; and
- splits a line prospectively if cohort siblings should continue.

If the provider has already accepted or may have accepted the payment, the action is unavailable and the UI states **This gift is already being processed. Your change will apply to the next eligible gift.** Unknown provider outcomes use the same safe fence.

### C.4 Bounded and indefinite pause

A pause is either:

- **bounded**, with an explicit civil resume date in the line's giving timezone; or
- **indefinite**, with no invented duration.

The resume date is the first date on which new eligible occurrences may proceed; it is not necessarily itself a charge date. The unchanged schedule kernel determines the next grid occurrence on or after that boundary. Due occurrences inside the pause window materialize as suppressed facts so forecasts and audits explain the gap. No paused occurrence becomes debt.

At the cohort boundary, the adapter must prove provider collection suppression or mark provider control uncertain. An Asym pause command by itself is not proof that an external subscription stopped. A resume worker uses the stored epoch, expected revision, claimed-occurrence fence, and current provider evidence; it cannot blindly reactivate a changed or externally canceled executor.

The missionary projection keeps the line visible and says exactly:

- **Paused — Resumes on [date]** when bounded; or
- **Paused indefinitely** when no resume date exists.

Missionaries cannot resume, cancel, change payment, or change schedule. A future missionary email about a pause is typed future domain meaning only. Phase 16 submits no runtime intent or event for it; a future owning phase may submit eligible meaning through Phase 6 only after its exact contract is proved Live, and Phase 6 alone creates the durable intent/event while Phase 17 owns the governed template. No provider name is hardcoded.

### C.5 Resume, cancel, and restart

Resume preserves the existing schedule grid and does not charge immediately unless a separately named, explicitly confirmed gift is authorized. A bounded pause may resume automatically only after revalidation of provider control, authorization, payment method usability, and occurrence eligibility. Indefinite pause requires an authorized command.

Cancel is direct and does not require a pause detour, survey, retention offer, or phone call. Asym records the donor's cancellation request immediately. If provider control is managed, it disables future executor collection and reconciles proof. If provider control is unknown or lost, the record becomes `cancellation_requested` plus the truthful D16 warning; it must never falsely say Stripe or another executor has stopped.

A canceled line never resumes in place. **Restart giving** creates a new accepted authorization and schedule epoch, and may require a new executor binding. History remains linked for display but no old off-session mandate, terms acceptance, attempt budget, occurrence, or provider item is silently reused.

### C.6 Cohort-safe commands and concurrency

Commands begin at the line or selected-line level. The domain planner then chooses one of three explicit outcomes:

- mutate the existing compatible cohort and exact item;
- split affected lines into a new cohort and its required leg executor(s); or
- reject/quarantine because safe provider control or authorization is absent.

Every preview returns an opaque preview token bound to tenant, actor, authority, aggregate revision, schedule epoch, affected line IDs, occurrence claims, provider snapshot, terms version, and expiration. Apply is a CSRF-protected POST with idempotency key and compares the token's facts under a database lock. A stale preview returns a fresh explanation; it does not best-effort mutate a changed arrangement.

Provider operations run through an outbox/saga with permanent operation identity. A partial provider result is reconciled to the exact cohort/item binding; it never rolls back committed history or silently applies to `items[0]`.

## Implementation Decisions — Card Collection and Recovery (D6–D9)

### D.1 Authority boundary: policy here, execution at the provider

Asym owns recurring intent, occurrence materialization, retry eligibility, candidate slots, failure-episode runway, suppression, and the decision whether one provider command is allowed. Stripe or another approved adapter owns ordinary payment execution, authentication, rail submission, and provider finality. The provider is not the product-policy scheduler, and Asym is not a card-network simulator.

There is one executor owner per occurrence at a time. Before any command, the system proves tenant, connected account, live/test mode, executor binding, exact provider invoice/payment object, authorization lineage, amount/currency, cohort line snapshot, schedule epoch, lifecycle eligibility, and control evidence. Provider-native automatic retries must be disabled or proven unable to overlap Asym-owned D7 commands. A dashboard setting or assumed default is not proof; configuration is read back and continuously reconciled.

Automatic accelerated card recovery is never used for:

- initial activation failure;
- ACH or another rail;
- `requires_action`, authentication, corrected card data, or donor-present work;
- hard, fraudulent, lost/stolen, closed-account, invalid-credential, stop-payment, revoked-authorization, or do-not-retry advice;
- an unknown/indeterminate prior attempt;
- uncertain provider control, account, mode, ownership, or authorization;
- a paused, skipped, canceled, ended, superseded, or already in-flight occurrence; or
- a provider, network, acquirer, jurisdiction, or product safety rule that forbids it.

Provider evidence has scope: occurrence stop, credential stop, action required, retry permitted, or unknown. The most restrictive live evidence wins. A reviewed versioned transient allowlist may classify a known provider code; unknown/null advice otherwise fails closed for accelerated retries.

### D.2 Exact D7 retry incident

One retry incident belongs to one immutable failed card occurrence at grain:

`tenant × billing cohort × schedule epoch × execution leg × scheduled local date × provider invoice`

It freezes the policy/profile version, cadence tier, giving timezone and resolved offsets, original attempt, amount/currency, line-allocation snapshot, provider/credential binding, next ordinary occurrence, and every candidate command identity. It is not donor-wide debt, a pledge balance, or a floating retry job.

The only v1 tenant profiles are:

- **Balanced** — weekly receives at most original + local-date +2 and +4 attempts; every other enabled cadence receives at most original +2, +4, and +6. Each twice-monthly execution leg has its own occurrence and incident.
- **Off** — one ordinary scheduled attempt only.

Balanced is a maximum, not a promise. **Balanced → Off** and emergency kill apply immediately to every unstarted slot. **Off → Balanced**, a new Balanced version, or any attempt-expanding change applies only to new incidents. Tenants cannot define arbitrary retry formulas.

### D.3 Candidate windows, consumption, and expiry

The D4 resolver turns each authoritative local +2/+4/+6 date into a frozen provider-safe half-open execution window:

- `not_before` is the later of that date's resolved operational instant and 48 elapsed hours after the previous actual attempt;
- `expires_at` is the earliest of the next local midnight, 48 hours before the next ordinary occurrence, or any earlier live lifecycle, final-date, provider, authorization, or safety cutoff; and
- if `not_before >= expires_at`, the slot is suppressed.

DST may move an attempt later within its original candidate date, never to a different date. Weekends stay weekends. A delayed worker can execute only inside the frozen window; after expiry the slot is permanently expired, not caught up.

The model distinguishes candidate slot, claimed command, provider operation, and actual authorization attempt. Infrastructure retries reuse one permanent command identity. Only immutable provider/network evidence that an authorization attempt actually occurred consumes attempt budget. A queued job, local fence failure, provisional record, or Stripe invoice `attempt_count` alone does not prove consumption.

An indeterminate provider response reserves the slot and occurrence in **Being confirmed**. It does not release headroom or permit another command until reconciliation proves the outcome. If evidence proves no provider attempt occurred, the slot may be released only while its original window remains open.

### D.4 Donor-present retry and stopping one incident

**Update payment method** never charges. An authenticated donor may use **Try this scheduled gift now** before a queued slot only after completing any required action or providing valid new/corrected authorization, and only if live advice permits. The review names the exact missed occurrence, amount, date, method effect, and remaining schedule.

Apply atomically claims the earliest remaining slot, fences earlier/equal automation, and substitutes for that slot. It never adds a slot, resets the incident, moves later candidate dates, revives a terminal miss, or becomes an unlinked one-time gift.

**Stop retries for this missed gift** immediately suppresses all not-yet-in-flight slots for that occurrence while leaving the recurring arrangement and next normal occurrence intact. It is direct, neutral, audited, and distinct from pause or cancel.

### D.5 Collision cutoff with the next ordinary occurrence

No old-occurrence command may start at or after 48 hours before the next ordinary occurrence. By 24 hours before that occurrence, the old provider artifact must be proved paid, voided, or safely parked. If not, the next occurrence becomes **Suppressed — unresolved prior payment** and staff receive a high-severity exception rather than risking two close charges.

The next ordinary occurrence cannot become collectable while an old occurrence remains indeterminate or provider retry is still possible. A line/cohort mutation, split, pause, cancellation, end, or designation/amount change closes the old indivisible recovery path; an old provider invoice is never partially rebuilt.

### D.6 Credential-wide pressure ceiling

Per-occurrence budgets do not protect a credential shared by several recurring groups. Therefore the system maintains separate immutable product-attempt and network-sent-attempt evidence across:

`tenant × connected provider account × live/test mode × durable credential lineage`

Asym's v1 unattended product-attempt ceiling is **15 attempts in a rolling 30 × 24 elapsed-hour window**. This is a conservative internal ceiling, not a universal card-network rule. The effective ceiling is the strictest live product, provider, network, acquirer, risk, jurisdiction, or mandate limit; tenants may narrow recovery by choosing Off but may not expand the ceiling.

Ordinary scheduled attempts have priority. Accelerated retry slots are suppressed first to preserve headroom for the earliest normal occurrence. If even a normal attempt is unsafe, the occurrence closes **Suppressed — safety**, with no provider call, money, debt, catch-up, or schedule drift; the next occurrence is evaluated independently.

Provider/Radar pre-network rejection consumes product pressure when a real product command reached the provider, but not network-sent headroom unless immutable evidence shows network submission. Donor-present manual or provider-dashboard attempts consume the applicable network headroom. The adapter must ingest and reconcile those facts where the provider exposes them; ambiguity narrows, never expands, eligibility.

### D.7 Failure episode: trigger, three later cycles, then schedule only

An established card lineage's first retry-permitted soft-failed normal occurrence opens a failure episode. The trigger may receive D7. If it closes Missed, the next three later normal occurrences that each make a real ordinary attempt and soft-fail may open their own D7 incident as **Scheduled recovery cycle 1 of 3**, **2 of 3**, and **3 of 3**. The fourth later occurrence and all following occurrences are **Schedule only** and receive at most one safe ordinary attempt while the episode remains unresolved.

The count is occurrence-based, not “three months” or 90 days:

- monthly: May trigger; June, July, August cycles 1–3; September schedule only;
- weekly: trigger; the next three weekly occurrences are cycles 1–3;
- quarterly: trigger; the next three quarterly occurrences are cycles 1–3; and
- twice-monthly: each 1st/15th leg is an independent occurrence, ordered by its real scheduled date.

A cycle is consumed when its D7 incident opens even if provider advice, rolling safety, outage, lifecycle, or another live guard suppresses later slots. Cycles do not roll over, reorder, refund, or reset by tenant action. A hard/action-required/control-loss/safety-suppressed-before-attempt occurrence is not disguised as a soft-failure cycle and receives no unattended D7.

When one credential lineage spans several groups, later-cycle entitlement is consumed in deterministic order: scheduled civil date, resolved execution instant, then occurrence UUID as the final tie-breaker. Competing claims serialize under the lineage episode lock. This preserves D8's intentional credential-wide pressure and success-reset behavior without allowing worker order or concurrency to decide which occurrence receives a cycle.

Every occurrence remains independent. After its retry budget is exhausted and no attempt is unresolved, it closes **Missed**; the provider artifact is proved voided/parked and provider-native retry is neutralized. Missed creates no contribution, receipt, accounting entry, receivable, debt, balance, arrears, proration, or future backcharge. A payment-method update may not revive it. A separate one-time gift is new donor-authorized money and does not rewrite the miss.

A provider-confirmed success on a normal occurrence or D7 attempt ends the failure episode immediately. Historical misses remain. A later unrelated soft failure may start a new episode, but the independent rolling attempt history does not reset. A donor-present, genuinely new/corrected credential with fresh successful authorization may also resolve the old lineage episode. Same-card resave, token/metadata churn, automatic account updater, a staff note, pause, message open/click, or one-time gift does not.

Repeated soft misses alone never cancel, pause, end, or mark donor intent Lapsed. The staff display says **Extra retry cycles complete · scheduled gifts continue** after cycle 3. `Lapsed` is reserved for the derived condition in which future automatic collection is truly unavailable or intentionally parked.

### D.8 Forecast, staff, and missionary truth during failure

Future safe unsuppressed occurrences remain **Scheduled support**, with an **of which at risk** subtotal. Past misses appear only in expected-versus-received variance. Only final posted contribution money counts as received or dependable cash.

Authorized staff see the triggering miss, scheduled recovery cycle count, current incident slots and outcomes, next ordinary amount/date and expected mode, rolling safety headroom, last success/miss, no-catch-up balance of zero, authorization/reset evidence, communication evidence, and append-only attempt ledger.

Missionaries see only permitted designation/anonymity-safe facts:

- latest scheduled gift: Received, Processing, Not received, or Suppressed;
- **Recurring support continues**;
- **Scheduled recovery cycle N of 3**, **Recovery in progress**, or **At risk — regular schedule continues** when applicable;
- next permitted ordinary amount/date; and
- truthful donor-notice delivery state from Phase 6 evidence.

They see no card/bank, provider, decline reason, credential, safety cap, exact internal retry dates, sibling-line data, or recovery controls. While `recurring_occurrence_missed_v1` is Reserved, terminal-miss truth remains in the recurring source projection and creates no notification item. After the key becomes Live, its terminal-miss notice is in-product only, grouped in the UI, informational, and creates no default donor-outreach task.

### D.9 Meaningful-transition communication contract

A provider attempt is not automatically a human message. A new human meaning creates a source-owned communication candidate, not permission to bypass catalog lifecycle. Phase 16 always records the durable domain transition and bounded recipient candidates. It re-proves current business eligibility and submits a complete authoritative plan occurrence through Phase 6's guarded atomic compiler only when the exact named contract is **Live** in the pinned Phase 17 activation generation. An unknown or Reserved key fails before a coordination header, child intent, `communication_event`, notification item, prepared material, or provider work exists. Source-owned confirmations and role-safe recurring/dashboard projections remain available without pretending they are catalog notifications. A later Reserved-to-Live activation applies only to future eligible transitions and never catches up historical candidates. For a Live key, Phase 6 creates and owns its coordination header, independently keyed durable `communication_intents`, consent/contactability, channel dispatch, resulting `communication_events`, delivery outcomes, and suppression; Phase 17 owns governed templates. The vendor remains replaceable.

The baseline state transitions are:

| Transition                  | Donor treatment                                                                                                                                                                                                | Missionary treatment                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| D7 plan durably opened      | Source status immediately; after the exact recovery key becomes Live, one recovery-start message with exact occurrence, next candidate dates, next ordinary date, and safe self-service                        | No per-attempt notice                                                           |
| Same-state retry fails      | No discretionary Asym message                                                                                                                                                                                  | None                                                                            |
| New action required         | Source action state immediately; after the exact action key becomes Live, one immediate action message, deduped until meaning changes                                                                          | High-level source projection only                                               |
| Provider-confirmed success  | Normal receipt; no extra “recovered” email                                                                                                                                                                     | Projection updates                                                              |
| Occurrence closes Missed    | Source/portal truth immediately; after `recurring_occurrence_missed_v1` becomes Live, one terminal message with exact amount/date, no debt/backcharge, schedule continuation, next amount/date, and safe paths | Source projection now; one grouped in-product notice only after Live activation |
| ACH processing              | Source processing confirmation immediately; catalog delivery only after the exact key becomes Live                                                                                                             | Processing projection                                                           |
| ACH final success           | Normal receipt                                                                                                                                                                                                 | Projection updates                                                              |
| Applied schedule amendment  | Durable source-owned arrangement confirmation; after `recurring_schedule_changed_v1` becomes Live, one deduped plan occurrence for the proven recipient                                                        | Projection updates; no missionary message                                       |
| Corrected or reversed truth | Source correction immediately; append a corrective/superseding message only after the exact key becomes Live                                                                                                   | Projection updates; old history remains                                         |

A mandatory network, payment-rail, jurisdiction, provider, authorization, or authentication notice overrides the discretionary quiet period. Reserved status never authorizes a direct-send workaround: if the exact required notice contract is not Live, the affected payment/recurring lane is release-blocked. An applicable Visa merchant-initiated stored-credential decline receives written notice and at least seven calendar days of access to an alternative payment method unless current written guidance for the exact acquirer/network program expressly permits a different compliant treatment. Semiannual and annual recurring donors receive a seven-day upcoming-charge reminder as the v1 baseline; stricter live requirements win.

One billing-cohort occurrence is the domain communication unit, not each line, allocation, attempt, or webhook. Phase 16 owns its permanent candidate semantic key, source occurrence/fence, bounded candidate envelope, one stable plan-occurrence token, and one independent stable member occurrence-slot token for each possible concrete recipient/channel step. When—and only when—the exact contract is Live in the pinned activation generation, it calls Phase 6 once with the complete candidate set, even when exactly one or zero members apply. The generated registry and Phase 6 derive the immutable binding projection, effective plan, authoritative member set, coordination-header slot, compilation/member digests, member occurrence slots, semantic identities, and immutable commands; Phase 16 neither computes nor stores those hashes. One PostgreSQL transaction releases all independently keyed children only after exact parent/member verification. Exact replay returns the same released header and children; changed plan, binding, condition, recipient, or membership under the plan token hard-conflicts. A Reserved key creates none of that Phase 6 state and is never backfilled after later activation. Repeated/out-of-order domain events are no-ops. Templates may vary bounded branding and tone but cannot alter eligibility, dates, action effect, mandatory content, no-debt language, safety logic, or transaction truth. Transactional messages contain no marketing, guilt, or upsell.

For a Live contract, recipient resolution is purpose-specific and never inferred from the Commitment Party alone. Phase 7's legal donor receives the official receipt; the current financial authorizer receives authorization, payment-action, recovery, and applicable rail/network notices; a separately proven D14 service contact receives only the stewardship purpose for which that contact is effective. An authorization challenge freezes the exact recipient Party/contact point used for delivery, but apply re-proves the current authorizer and terms. If one cohort contains lines with different permitted recipients, Phase 16 supplies all bounded purpose-specific candidates and independent member tokens under the one plan-occurrence token. Phase 6's generated binding resolver proves exactly one concrete recipient for each applicable step, compiles the complete set, and atomically releases the independently keyed intents. Each member includes only that recipient's authorized line facts plus the truthful cohort-level payment effect needed to act and dedupes by recipient as well as meaning. Missing, ambiguous, stale, unauthorized, extra, or duplicate recipient evidence rejects or suppresses according to the exact contract before any child becomes eligible; it never falls back to a Party email, payer email, or another line's contact.

The UI never says **Donor aware**. It may say **Notice requested**, **Sent**, **Delivered to recipient mail server**, **Delivery not confirmed**, or **Could not deliver** only from evidenced Phase 6 state. Opens and clicks do not prove comprehension or authorize payment.

Email GET links are read-only and may land on a tenant-bound review page. Any mutation requires a deliberate authenticated, CSRF-protected, tenant-bound, idempotent POST and reauthentication when financial risk warrants it. Updating a method does not charge; **Try this scheduled gift now** is the only old-occurrence retry action and atomically fences automation.

Rollout begins with shadow candidate evaluation and no historical outbound catch-up. Test tenants, provider-notification ownership readback, canaries, reversible optional-message controls, and delivery-state observability are release gates. Mandatory notices and donor-portal truth cannot be silently killed.

## Implementation Decisions — Recurring ACH Finality and Recovery (D10)

### E.1 One normal entry; no silent re-presentment

An established ACH billing-cohort occurrence gets at most one unattended normal entry. A return never inherits card D7, Stripe Smart Retries, or silent same-occurrence re-presentment. The next normal calendar occurrence remains independently eligible under the then-current mandate and safety facts; it never includes the missed amount.

ACH verification, debit initiation, settlement/success, return exposure, and final correction are separate facts. `processing` means initiated or pending, not received. Only provider-confirmed success posts money and emits the official receipt. A later return appends the exact financial inverse and supersedes affected receipt/statement artifacts; it does not delete history.

### E.2 Narrow donor-confirmed R01/R09 recovery

One old occurrence may enter `recovery_open` only after a normal ACH return coded R01 or R09 and only when the actual processor/ODFI path supplies current written proof that lawful same-entry reinitiation is available, Asym is the exclusive retry owner, required waiting/timing is met, the mandate remains valid, and provider retry is disabled/read back.

The donor then completes a dedicated authenticated financial review for the exact total cohort occurrence. It names the original amount/date, destinations, return-safe explanation, payment account ending, recovery date/effect, next normal occurrence, and no-debt/no-catch-up rule. The donor explicitly submits **Retry this bank donation**. The server re-evaluates every gate and exchanges the preview for a one-use, short-lived execution grant bound to tenant, account/mode, mandate lineage, occurrence, amount/currency, provider object, terms version, and command identity.

The grant authorizes one execution only. It cannot partially recover one line from an indivisible cohort, change the amount, change the schedule, or become a general future mandate. A saved bank account never triggers recovery by itself. An indeterminate provider response reserves the grant and occurrence; no normal or recovery debit overlaps until reconciliation.

If any provider/ODFI proof is unavailable, the full product path is **Schedule continues; this occurrence will not be retried** plus an optional separate one-time donation through normal checkout. The fallback is not a generic PaymentIntent labeled recovery.

### E.3 Reason-specific ACH outcomes

| Outcome family                                                   | Product treatment                                                                                                                         |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Initial activation failure/return                                | Dedicated activation repair; no recurring recovery grant and no active-success claim                                                      |
| R01 / R09 after established success                              | Recovery-open may be offered only through E.2; otherwise terminal Missed                                                                  |
| R08 stop payment; unauthorized/revoked; R11 authorization defect | Block unattended collection on the affected mandate lineage and require appropriate fresh donor authorization; no old-occurrence recovery |
| Administrative/hard account errors                               | Action required or terminal Missed according to current provider/rail guidance; no generic retry                                          |
| Sensitive/fraud/legal block                                      | Privacy-safe donor language, credential/mandate stop, and restricted staff detail                                                         |
| Unknown/unsupported return                                       | Fail closed; reconcile; never guess eligibility                                                                                           |
| Provider response unknown                                        | `Being confirmed`; exclusive fence and no overlap                                                                                         |

Raw return codes and sensitive bank detail are restricted to the minimum authorized operations role. Donors and missionaries receive reason-safe language. The exact processor fact remains immutable for audit.

### E.4 Normal-date ACH runway

Recovery success does not prove the next normal debit is healthy and does not reset the normal-date runway. On the same mandate lineage, future automatic collection is parked at the earlier of:

- the third normal scheduled soft return without an intervening normal scheduled success; or
- 180 calendar days from the first normal scheduled soft return without normal success or genuinely new authorized lineage.

Live provider, ODFI, network, authorization, jurisdiction, or fraud rules may narrow sooner. This boundary affects future collection eligibility; it does not create debt, stop the calendar grid, or rewrite prior occurrences. Staff see the return count, start/boundary date, last normal success, last return, recovery grant evidence, and exact reason for any parked future collection. Missionaries see only privacy-safe high-level health.

### E.5 ACH release invariants

Every ACH path must prove structural tenant, connected-account, live/test-mode, mandate, authorization-lineage, occurrence, amount, and provider-object binding. Provider configuration/retry ownership is read back. Reconciliation, canary, kill switch, additive schema rollback, and late-return drills are mandatory. No ACH recovery launches merely because the current SDK exposes a generic payment command.

## Implementation Decisions — Authoritative Fulfillment (D11)

### F.1 Facts that remain separate

Money finality, contribution designation, recurring/fixed commitment, expected-support occurrence, collection attempt, fulfillment, recognition/soft credit, and review certainty are different facts. A payment attempt or replacement payment never creates another expected occurrence. A recognition relationship never proves fulfillment or Party authority.

### F.2 Typed expectation targets

An application targets exactly one typed expectation line:

- normally, an immutable recurring or fixed-plan scheduled occurrence line; or
- only for a genuinely unscheduled fixed-total pledge, an explicit unscheduled pledge-balance line.

The cross-product `commitment_fulfillment_targets` registry is a narrow typed identity/projection that resolves to one authorized target adapter. It is not an unchecked polymorphic `(type, id)` pair, universal status, universal editor, or ownership aggregate. A target row carries tenant, kind, source record ID, currency, designation, capacity, revision, and retired state, all maintained by its source domain.

No fabricated occurrence date may be created merely to match money. An unscheduled fixed pledge stays unscheduled until a staff amendment adds a real plan.

### F.3 One conserved application operation

One immutable operation groups signed application entries. Each entry links one effective Phase 13 contribution designation line to one named expectation line. The command enforces, inside one database transaction:

- same tenant and permitted environment/provider scope;
- exact currency match; v1 has no cross-currency fulfillment;
- designation compatibility and staff authority;
- effective source money capacity;
- effective target capacity;
- semantic idempotency and expected revisions;
- sorted permanent lock order across the source and targets; and
- conservation of signed minor-unit amounts.

The service uses one permanent lock order: the applicable authority fence first, then the contribution source, then sorted fulfillment targets. A donor-instruction application locks its immutable instruction header; a structured-remittance application locks its source head and then mapping head and verifies both expected revisions/event folds; provider-lineage and staff-confirmed paths lock or revision-fence their canonical evidence/authorization record. Authority invalidation uses the same authority-grain lock. The service then re-folds current authority and effective capacity under lock, applies all or none, appends operation/entries/outbox facts, and retries the whole transaction on deadlock. Thus an apply racing revoke/supersede either commits before the invalidation as a completed historical application or observes the invalidation and fails closed; it cannot begin with stale proof and commit afterward. Cross-row database CHECK constraints support local validity but do not replace this command-level conservation proof.

### F.4 Explicit recurring-to-fixed linkage counts money once

A fixed-total pledge may be fulfilled by gifts generated through a separately authorized recurring commitment only through an effective-dated `recurring_fixed_pledge_links` row with exact donor/representative authority, recurring line, fixed pledge line, currency/designation compatibility, and allocation-rule version. The link never makes the pledge an executor and never lets pledge actions mutate recurring collection.

The contribution designation line receives one source-consuming D11 application to its recurring occurrence target. Fixed-pledge coverage is then a derived linked roll-up from that exact effective application, never a second application of the same money. The v1 `fixed_plan_capacity_order_v1` rule caps coverage at both source and fixed-target capacity and, within the linked fixed pledge line, resolves the current plan under locks in this order: the exact same scheduled date when one current expectation exists, then earliest remaining named expectation, then explicit unscheduled balance. Any ambiguous designation/currency/plan identity fails to Needs review rather than guessing. Excess remains recurring support only.

The resolved linked-coverage allocation is frozen to the exact recurring D11 application, fixed plan version, and fixed target that were effective when it occurred. A later plan amendment allocates only then-remaining capacity; it never recomputes or moves historical coverage against the new plan. An exact source inverse appends the corresponding coverage inverse once. This temporal allocation preserves audit truth while keeping the contribution source-consumed exactly once.

### F.5 Automatic, suggested, and manual authority

Automatic application is allowed only when one of these exact proofs exists:

1. complete frozen provider lineage from the recurring cohort/item/occurrence to the resulting contribution designation line;
2. an authenticated donor instruction captured with the gift; or
3. an approved authenticated structured-remittance line with an exact versioned mapping.

These are three independent, closed application-authority types—not ingredients that must all be present. Every path re-proves the same tenant, Commitment Party, currency, designation, source capacity, target capacity, current revision, and non-revoked authority at apply or reapply time while holding that authority type's invalidation fence in the F.3 lock order. The donor-instruction and structured-remittance records and their exact target allocations are defined in O.11; a generic note, source ID, import flag, or opaque evidence string cannot substitute for them. Staff-confirmed manual application is a fourth closed application-authority type, but it is never reclassified as automatic. A later inverse or uncertain-vector retraction is a correction, not a new application: it requires current canonical correction evidence tied to the original operation and entries and never reuses or re-proves an expired, revoked, or consumed application authority.

Names, dates, equal amounts, memo text, OCR, PDFs, soft credits, household/member relationships, donor-recipient history, and missionary relationships may create ranked suggestions but never authorize an application. Suggestions carry evidence and confidence explanations and enter **Commitment match: Needs review**. Staff can accept, change, split, or reject them through the same conserved command.

**Gift: Received** remains visible even while **Commitment match: Needs review**. An unresolved match never blocks correct posting/receipting or implies that the money is missing from its fund.

### F.6 No debt, prepayment, or lifecycle inference

Open-recurring misses and partials are planning variance, never donor debt. Excess money never silently prepays another recurring period. Fixed-pledge excess can be applied only to explicitly named current/future expectation lines or the valid unscheduled balance. Changing future expectations is a separate pledge-plan amendment.

Pause, skip, cancel, end, and internal expectation release remain separate lifecycle facts. Received money cannot silently resume collection, create an expectation, fulfill a released/nonexistent target, or convert one commitment kind to another. Internal expectation release resolves an expectation without pretending money was received or creating a Phase 20 accounting write-off.

### F.7 Reversal and correction

Refund, ACH return, chargeback, NSF, void, re-designation, or match correction appends signed inverse entries tied to the original application. History is never edited. A full exact source reversal produces exact inverses once. The correction command proves an immutable, same-tenant canonical source-correction or staff match-correction fact and the exact original operation/entries it affects; it does not require the original provider lineage, donor instruction, structured mapping, or staff application authority to remain current. Expiry, revocation, or consumption of that earlier application authority can never block a mandatory correction or be misrepresented as fresh authority.

If an external partial reversal does not identify which of several prior applications changed, the system retracts the entire affected allocation vector from definite coverage, leaves the surviving effective amount unmatched, and opens a staff correction case. The retraction references every original entry in that vector plus the canonical partial-reversal fact and is idempotent for that correction identity. It never guesses oldest, newest, proportional, or “most likely.” Once staff re-applies the surviving amount, the new operation is explicit, conserved, and authorized by a new current application authority.

Canonical journal facts authorize writes. A projection or dashboard never does. Every role-safe projection exposes a cursor/watermark and becomes **Status updating** when behind the Phase 13 money source.

## Implementation Decisions — Derived Support Health (D12)

### G.1 Subject grain and lifecycle language

Support health is evaluated for one recurring line or one fixed-total pledge, never a person. A billing-cohort collection incident is evaluated once and inherited as a consequence by its member lines; group summaries preserve authorized composition rather than multiplying a shared incident or collapsing everything to the worst line.

Recurring presentation uses one primary lifecycle statement plus zero or more coexisting attention reasons. Examples include:

- **On track now**;
- **Processing**;
- **Recovery in progress**;
- **At risk — recurring gifts continue**;
- **Action needed to continue automatic gifts**;
- **Paused — Resumes on [date]**;
- **Paused indefinitely**;
- **Ended as scheduled**; and
- **Status updating**.

`Lapsed` is an internal/staff derived collection consequence only when future automatic collection is actually unavailable or safely parked. It is never caused merely by a timer, miss count, one failed occurrence, pause, cancellation, or planned end, and it is not donor-facing copy. A later successful occurrence returns current presentation to **On track now** without deleting prior misses.

Fixed-total pledges use their own vocabulary: **Open**, **Fulfilled**, **Partially fulfilled**, **Released internally**, **Ended by donor**, **Disputed/Quarantined**, and attention reasons tied to explicit expectations. Fulfilled/partially fulfilled are derived progress statements, not promise lifecycle values. They do not inherit recurring “healthy/lapsed” language.

### G.2 Pure versioned evaluator

One pure evaluator consumes a versioned input snapshot containing intent, expected occurrences, effective D11 fulfillment, provider collection/control, reconciliation, source cursor/freshness, policy version, and current civil date/zone. It returns:

- primary lifecycle statement and reason code;
- independent attention reason codes;
- safe next action(s) by role;
- review/next-evaluation instant;
- included source cursor/version; and
- explanatory trace suitable for authorized staff/audit.

The evaluator has no database writes, network calls, clock reads, notification side effects, or tenant-authored expression language. A cursor-backed CAS projector persists its result only if the aggregate revision and all source cursors still match. On conflict it requeues; it never overwrites newer health.

Stale, conflicting, or unavailable sources produce **Status updating**, suppress negative outreach, preserve independently valid facts, and raise a staff incident. Unknown never defaults to healthy, lapsed, zero, or received.

### G.3 Bounded tenant policy

Tenants may prospectively choose saved views, escalation routing, optional follow-up enrollment, and a bounded review interval for manual/offline expectation evidence. V1 review-policy defaults are 14 calendar days for mailed manual gifts, 0 calendar days for hand-delivered cash, and 24 hours for a proved structured feed; structured-feed overrides are bounded from 5 minutes through 7 days. They may not redefine money, fulfillment, schedule, lifecycle, lapse, safety, Party authority, or provider truth.

For an offline expected gift without structured feed finality:

- mailed/manual review defaults to 14 calendar days after the promised date, configurable only from 7–30 days;
- hand-delivery/cash review defaults within 0–7 days; and
- a structured feed uses its governed SLA plus one ingestion window.

The promised date remains frozen. `review_after_at` determines when staff attention begins; it does not move the promise, manufacture debt, or imply donor fault. Policy changes are previewed, versioned, audited, and prospective; existing evaluated facts retain their policy version.

Thirty/sixty/ninety-day and consecutive-miss values are filters/worklist facets, never lifecycle transitions. Donor-facing copy remains calm and actionable; tenant branding cannot introduce blame or debt language.

## Implementation Decisions — Missionary Support Projection (D13)

### H.1 Cash-first, automatic-recurring-first hierarchy

Provider-automated online recurring giving is the flagship workflow. Manual/external recurring support and fixed-total pledges remain accurate and fully auditable, but rarity changes navigation prominence and implementation depth. The missionary dashboard order on desktop and mobile is:

1. **Gifts received this month** — all effective legal-money contributions in the missionary's authorized designation scope. Currency, tenant giving timezone, as-of time, ledger cursor, and freshness are visible. Attempts, promises, schedules, soft credit, processor payout, and field-account balance are not received cash.
2. **Online recurring this month** — exact normal automatic-card/ACH occurrences in the same tenant-calendar-month window, labeled **planned**, with mutually exclusive outcomes **Received**, **Processing**, **Upcoming**, **Recovery — needs attention**, and **Not received**. Each normal occurrence counts once; retries and replacements only update that occurrence.
3. **Recurring donations** — the operational list, default-filtered to automatic recurring lines and ordered by next scheduled gift.
4. **Monthly support committed toward goal** — a secondary planning view with visible D12 composition.
5. **12-month schedule** — an exact dated drill-down, not a hero metric.
6. **Other commitments** — rendered only when an authorized manual recurring or fixed-total record exists. Zero records produce no card, KPI, tab, or empty-state noise.

The default period is the tenant calendar month in its governed giving timezone. A one-action **Next 30 days** alternate is offered near month end and remains explicitly labeled; it never silently changes the aggregate definition. Lists may show a future next date while the card remains calendar-month scoped.

### H.2 Occurrence and cash truth

**Received** reads only the Phase 13 effective ledger fold. Refunds, returns, chargebacks, NSF, corrections, and re-designations affect it through canonical inverse/effective facts, not display counters.

**Online recurring this month** reads versioned D4 occurrences after pause, skip, start, amendment, end, D7–D10 recovery, and D12 consequences. It never reads provider subscription status or multiplies a monthly equivalent. A retry executed this month for last month's occurrence belongs to last month's planned occurrence and appears only as current recovery activity.

ACH processing is never Received. A future-only **Scheduled this month** subset may contain only still-future eligible occurrences. A terminal miss is variance, not debt. A late payment does not move the occurrence month or schedule.

### H.3 Exact monthly-equivalent planning transform

The platform-owned comparison factors are exact rationals:

| Cadence          | Monthly-equivalent factor |
| ---------------- | ------------------------: |
| Weekly           |                 `52 / 12` |
| Every two weeks  |                 `26 / 12` |
| Twice monthly    |                       `2` |
| Every four weeks |                 `13 / 12` |
| Monthly          |                       `1` |
| Quarterly        |                   `1 / 3` |
| Semiannual       |                   `1 / 6` |
| Annual           |                  `1 / 12` |

Compute exact minor-unit rational totals before display rounding and expose the rounding policy. This is planning comparison, not a dated forecast, received cash, receivable, or spendable balance.

Current coverage may stack **On track**, **Processing/Recovery**, and **At risk — recurring gifts continue** at face value. Paused, future-start, and collection-unavailable support appears adjacent with exact reason/date and does not silently fill active coverage. Canceled/ended lines add no future coverage.

Fixed-total pledges are never divided into sustaining monthly coverage. Only named effective expectation installments enter the exact dated schedule. The pledge's total promised, fulfilled, released internally, and remaining remain separate.

### H.4 Recurring list contract

Each permitted line row shows:

- donor name or anonymity-safe label;
- designation/fund;
- amount per occurrence and currency;
- cadence;
- primary lifecycle plus attention reason;
- original creation date, original anchor date, and current anchor date as separate values;
- last successful donation date;
- next scheduled donation date;
- optional final eligible date; and
- bounded resume date or **Paused indefinitely** when paused; and
- latest occurrence outcome.

Last successful, next scheduled, and final eligible are separate labeled values. Schedule and payment statements are separate so **Next scheduled donation** never implies guaranteed success. A paused line remains visible as **Paused — Resumes on [date]** or **Paused indefinitely**. The list supports cursor pagination, stable sort, filter by outcome/health/cadence/designation, and an accessible details view. Missionaries have no mutation controls.

### H.5 Other commitments contract

Manual/external recurring support displays provenance, recurring amount/cadence, expected date, matched gift date, and review state. Fixed-total commitments display Party-safe identity, total promised, fulfilled, released internally, remaining, and next named installment if one exists. They never impersonate online auto-pay, and they do not receive a parallel retry/dunning engine.

### H.6 Metric registry and privacy-before-aggregation

Every dashboard metric has a versioned registry entry defining source table/fold, grain, inclusion/exclusion, currency, half-open local-time window, evaluator version, freshness SLA, authorization, anonymity, small-cell behavior, and display rounding. Unlike currencies remain separate. An optional reporting-currency view preserves each source total and labels the FX source/date and approximation; FX never authorizes money or fulfillment.

Tenant, designation, role, restricted-worker, and anonymity rules apply to line-level facts before every sum, count, composition, filter, URL, export, or drill-down. Hidden sibling lines never leak through totals. Unsafe small cells are coarsened/suppressed, not represented as zero.

The missionary projection contains no card/bank type, last four, billing address, provider/mandate ID, raw decline, exact retry date, credential, cap, or sibling-line facts. Rail is not a missionary column. Projection reads are side-effect-free and cannot charge, retry, fulfill, notify, or mutate intent.

Cards degrade independently. Valid received cash may remain visible while schedule projection says **Updating**, and vice versa. Unknown or stale is never displayed as zero, healthy, scheduled, or received. Aggregate queries are server-owned, cursor-backed, and independent of paginated list rows; there is no client-side total, N+1 donor loop, hidden row cap, or TTL-only truth.

## Implementation Decisions — Commitment Party and Related Roles (D14)

### I.1 One promise owner; separate roles

One recurring group or fixed-total pledge has exactly one explicit, non-null promise-owning Party. Every human, communication, remittance, payment-consent, legal-donor, and recognition relationship is a separately typed, scoped, effective, provenance-bearing fact. No fact infers another and none manufactures cash.

| Fact                     | Grain                                                                               | Boundary                                                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Commitment Party         | Exactly one Party on group/pledge                                                   | Owns recorded intent only; never inferred from payer, contact, method, provider customer, recognition, address, or relationship                         |
| Representative authority | Person → represented Party, optionally narrowed to commitment, purpose, and actions | Verified, effective-dated, evidence-bearing, revocable; a job title/relationship grants nothing and does not create payment consent or staff capability |
| Service contact          | Commitment × message purpose × contact point                                        | Receives only that communication; gains no ownership, portal access, management/payment authority, legal-donor status, or recognition                   |
| Expected remitter        | Optional expectation-line hint                                                      | Source/confidence/effective dates; proves no fulfillment, legal donor, receipt ownership, collection permission, or Party                               |
| Collection authorizer    | Versioned agreement/mandate × human authorization evidence                          | Binds exact terms, rail, provider/merchant, method token, timing, amount rule, and effective period                                                     |
| Posted legal donor       | Frozen header on each effective contribution                                        | Resolved from contribution-specific Phase 7/13/14 evidence; never copied blindly from Party/remitter                                                    |
| Recognition Party        | Phase 14 contribution recognition                                                   | Non-receiptable attribution only; never fulfillment, ownership, authority, cash, or payment permission                                                  |

### I.2 Ownership and role lifecycle

Commitment Party is immutable business history. A true owner change supersedes/closes the old record and creates a new Party-owned record with fresh intent and, where required, fresh collection authorization. It is never a normal edit. A governed duplicate merge may re-point the canonical identity while preserving original Party snapshot and merge audit; merge is not transfer.

One recurring group contains only one Party and compatible collection authority. A single checkout may therefore produce separate groups when different Parties are involved.

Self-giving adds no donor ceremony or artificial representative row. A household owns only when explicit household intent was captured; membership, marriage, shared address, or shared email grants nothing. An organization owns its own promise while representatives, signers, treasurers, remitters, and contacts may turn over independently.

A donor-advised-fund advisor recommendation is not a commitment, goal coverage, receivable, or cash. The sponsoring organization becomes Party only from sponsor-issued evidence of a real promise under applicable policy.

Changeable roles use half-open `[effective_from, effective_to)` ranges and append/supersede history. Each version retains tenant, source, evidence reference, asserting/verifying/revoking actors, reason, timestamp, and request/command identity. Raw documents/recordings remain in restricted evidence storage, not ordinary CRM projections.

The role and message-purpose vocabularies are closed and versioned. Tenants configure workflows and recipients but cannot redefine **service contact** as **authorized representative**. At most one current primary service contact exists per purpose, with ordered alternates; multiple recipients may exist where policy and consent allow.

Phase 16 does not implement co-obligors, guarantors, nested delegation, tenant-defined roles, or a generic legal-contract engine. Complex multi-obligor arrangements remain outside v1 rather than being falsely simplified.

## Implementation Decisions — Staff-Led, Authorization-Bound Service Desk (D15)

### J.1 Broad service control, not invented consent

Capability-scoped staff own the case end to end: find the right commitment, verify Party/representative, prepare a requested change, preview exact effect, select the valid authorization lane, observe completion, execute, confirm, and repair without switching tools. The smallest additional donor/cardholder/account-holder action is requested only when the rail or action genuinely requires authorization of new terms. A staff click never impersonates that authorizer.

From one **Manage recurring support** workspace, permitted staff can:

- capture manual recurring support or a fixed-total pledge;
- prepare/create automatic recurring support while the real authorizer completes secure authorization;
- change supported amount, cadence, next date, end date, future designation, and service contact;
- skip, pause, resume, cancel, or stop one recovery incident;
- replace a method through provider-owned fields;
- assist a D7 donor-confirmed retry or D10 ACH reinitiation;
- apply an immediate protective block for governed safety/compliance reasons; and
- release a fixed expectation internally without saying it was paid, donor-canceled, or written off for accounting.

Missionaries remain read/request-only and never receive the mutation/provider surface.

### J.2 Three independent gates

Every command proves, where applicable:

1. **Operator authority** — authenticated staff, active tenant assignment, exact capability, and current scope.
2. **Party instruction** — Party or D14 representative, verified instruction channel/evidence, and exact requested terms.
3. **Collection authorization** — actual cardholder/account holder's current rail-compatible authorization for exact amount, cadence/dates, merchant/account, method use, purpose, retry/recovery, and cancellation terms.

A second staff approval may be an optional tenant internal control but satisfies none of these gates. A saved method, prior successful charge, generic checkbox, audit trail, after-the-fact notice, or second staff member authorizes zero new/wider collection.

Recurring consumer ACH requires the account holder's signed/similarly authenticated supported standing mandate and a retained copy. A generic oral/staff attestation is insufficient. Stripe TEL is not a recurring ACH lane while official provider documentation limits it to single-entry use. Card MOTO may be enabled only after current account/reader support, donor-initiated instruction, identity verification, PCI/call-recording controls, exact future-use terms, retained agreement, reconciliation, and legal/compliance approval.

### J.3 Four server-derived outcomes

The server compares canonical before/after terms and returns one outcome. The client cannot classify an increase as a correction.

| Outcome                     | UX                                                                                                            | Typical actions                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Apply now**               | Short before/after review + precise CTA                                                                       | Record manual intent; stop/pause/cancel/reduce; lower cadence; postpone; add/lower end/cap; eligible unchanged-exposure destination change from exact instruction             |
| **Complete with donor now** | Minimal embedded provider/e-sign step binds the real authorizer to immutable exact terms; staff stays on case | Create/increase automatic support; increase frequency; move earlier/today; remove/extend end; restart; add charged line; replace/bind method; D7/D10 donor-confirmed recovery |
| **Awaiting authorization**  | Entire prepared case persists; nothing widens until expiring approval completes                               | Authorizer absent, provider lane unavailable, or evidence incomplete                                                                                                          |
| **Collection blocked**      | Stop unsafe execution immediately and show repair/choice                                                      | Invalid/revoked mandate, safety/compliance concern, closed destination, tenant/provider control problem; never called donor cancellation unless donor requested it            |

Reducing, stopping, postponing, pausing, or canceling must stay fast. Failure to deliver a confirmation never reverses a valid protective action. A bounded pause may resume on its agreed date if authorization/control remain valid; early/indefinite resume or restart after cancellation requires applicable fresh authorization.

Party, payer, currency, merchant, connected account, or materially different authorization scope cannot be rewritten in place. Supersede and create fresh. Designation changes are prospective; if merchant/account scope changes, use fresh authorization. No bulk action may widen exposure, redirect, bind methods, remove limits, or restart donors. A separately gated bulk protective block may only narrow/stop unsafe collection.

### J.4 Staff UX and immutable terms

Use one responsive workspace, not a modal maze: prefilled state, changed fields highlighted, and a live **Today / Next / Then** summary showing any in-flight payment, next dates, amount, cadence, destination, final state, and whether a charge occurs now. Dynamic CTAs are **Apply changes**, **Confirm with donor now**, **Send secure confirmation**, or **Stop collection**, never generic Save.

Only the selected rail/action shows its concise script/disclosure. A donor confirmation can use an accessible expiring SMS/email/QR/e-sign/provider step without account creation or case reconstruction. Payment fields remain provider-owned/masked; PAN, CVV, and raw bank credentials never enter Asym forms, notes, logs, or recordings. Sensitive call segments are paused/redacted and CVV is never retained.

Every material case creates one server-owned exact-term snapshot and hash containing tenant, Party/representative, financial authorizer, amount/currency, cadence/anchor/next/end/cap, projected occurrences, destinations/line amounts, immediate-charge effect, rail/masked method, merchant/account, future-use purpose, recovery/cancellation terms, notices, expiry, and authorization ID. Any term edit invalidates the challenge. The authorization event binds the same version/hash.

The command journal freezes operator/capability version, instruction/evidence, before/after terms, action class, boundary, lines/cohorts/occurrences, mandate lineage, provider command/result, confirmation delivery, and repair result. Explicit states include `requested`, `awaiting_authorization`, `authorized`, `applying`, `applied`, `provider_sync_failed`, `reconciled`, and `rejected`. UI success never invents provider success.

## Implementation Decisions — Provider-Control Loss and Recovery (D16)

### K.1 Control is evidenced, not assumed

Provider access, capability, executor ownership, command control, payment execution, money finality, donor intent, and reconciliation are separate axes. “Disconnected,” `charges_enabled`, payout state, API success, or a reconnect click cannot stand in for them.

The internal ladder is deliberately small:

| State                               | Entry evidence                                                                                                                                               | Safe behavior                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| **Managed**                         | Current authenticated reads prove tenant/account/mode, merchant/application ownership, required capabilities, exact executor, and reconciliation             | Normal authorized commands                                                                                           |
| **Degraded observation**            | Timeout, rate limit, provider 5xx, or webhook lag without identity/revocation evidence                                                                       | Fence indeterminate mutations; retry safe reads; no donor/missionary alarm until real impact                         |
| **Control at risk**                 | Reachable account with a known future requirement/deadline threatening collection/control                                                                    | Show exact deadline/remediation; preserve current truth; notify only if commitment-level impact materializes         |
| **Control restricted**              | Reachable account but one required capability is disabled/restricted                                                                                         | Suppress only dependent actions; never confuse payout restriction with charge stop                                   |
| **Control unknown**                 | Revocation, wrong account/mode/application, inaccessible/mismatched executor, missing ownership proof, or inability to prove control at a financial boundary | Suppress all new Asym attempts, D7, widening, replacement, migration, and stale replay; never claim provider stopped |
| **Reconciling**                     | Same binding appears restored but event gap, objects, in-flight work, controls, and ledger are not proved                                                    | Read-only reconciliation; cancellation/protective stops first; no general release                                    |
| **Externally controlled/read-only** | Known executor is owned/controlled by another application/operator                                                                                           | Observe qualified facts only; never adopt by metadata or start a competitor                                          |

A timeout is not deauthorization. Conversely, an indeterminate financial mutation is fenced immediately even if other reads remain Managed. Entry/exit/escalation depends on evidence and the next financial-risk boundary, not one arbitrary timer.

### K.2 Immutable binding and trusted routing

Every executor binding includes tenant, live/test mode, connected account, connection epoch, Connect application/ownership evidence, charge architecture, merchant/`on_behalf_of`, transfer destination where applicable, customer, subscription/schedule, exact item map, mandate/payment-method reference, and last trusted reconciliation cursor/time. Provider IDs are tokenized references and masked display metadata only.

The top-level signed Connect event account and event live/test mode are authoritative routing inputs and must match the binding. Metadata may corroborate but never selects tenant. Tenant/account/mode/application mismatch fails closed, alerts security, and cannot fall back to an unscoped lookup.

Charge architecture affects truth:

- a direct charge on a full-Dashboard account may continue after Asym disconnects, so quarantine and never create a replacement;
- destination charge and separate charge/transfer have separate payment and tenant-funds availability facts;
- `on_behalf_of` draft invoices are not debt/catch-up work after reconnect;
- another application's/account's subscription remains external read-only;
- `charges_enabled=false` is a collection restriction, while `payouts_enabled=false` alone does not prove donor collection stopped; and
- a provider pause is used only when current topology/capability proves it affects the exact executor.

### K.3 One tenant incident, not per-gift noise

An unplanned loss or credible mismatch creates one tenant/account incident with a paginated affected-binding set. It freezes unsafe Asym work, preserves donor intent, schedule anchors, and history, and produces per-line projection consequences without creating one staff task or donor message per agreement.

The incident workspace shows last verified state/time, account/mode/application identity, affected due-soon cohorts/amounts, in-flight/indeterminate work, cancellation queue, capability restrictions, event/cursor gap, reconciliation progress/exceptions, and one safe next action. It has an assigned payment owner plus backup and a concise runbook/audit export.

Planned disconnect is blocked until inventory proves every executor canceled, migrated, or explicitly handed off; in-flight payments/invoices are resolved; transfer/destination exposure is handled; and continuing application fees are removed. An exceptional override records each exposure and owner but never asserts stop.

### K.4 Cancellation-first safety

A donor stop/cancel request is recorded immediately even when provider control is unknown. It suppresses every new Asym command and receives the highest-priority provider-stop work. The donor/staff UI says **Cancellation requested — provider confirmation pending** until exact stop proof exists. It never claims the external executor stopped merely because Asym stopped issuing commands.

Already in-flight card/ACH attempts remain separate facts. A payment submitted before the boundary may later resolve normally. A provider attempt evidenced after the protected boundary becomes an urgent reconciliation/refund exception, not a normal new occurrence.

Old retry, increase, restart, method-change, and migration commands expire. Recovery may synthesize only a current protective stop from current donor intent; it never blindly replays a stale financial mutation.

### K.5 Proof-gated recovery and cutover

Reconnection to the same apparent account enters **Reconciling**, never Managed. A cohort is released only when current evidence proves:

- same tenant/account/mode/application/merchant and expected charge architecture;
- current ownership/capabilities and exact object/item mapping;
- accessible event-gap reconciliation plus current-object census where retention is insufficient;
- in-flight/indeterminate occurrences resolved;
- donor pause/cancel/end and authorization terms still valid;
- provider retry/executor controls match product policy;
- Phase 13 money/receipt and Phase 16 occurrence/fulfillment folds agree; and
- no competing executor or unresolved command exists.

Release may be cohort-by-cohort. Proven-safe lines can split/release while unknown lines remain quarantined; group history stays intact.

A different account, merchant, mode, application, or replacement executor is formal cutover, not reconnect. It requires proof the old executor stopped plus applicable fresh IDs and collection authorization before new activation. If proof is unavailable, the old executor remains external/read-only and no active-active replacement is created.

There is no automatic failover, blind catch-up, backcharge, distributed-control DSL, per-gift incident storm, or universal second approval. Received cash changes only from authoritative payment/ledger facts; quarantined future support moves to a qualified attention bucket.

### K.6 Role communication

Donors are contacted only when their own arrangement crosses a meaningful impact boundary, with plain next action and no provider/KYC dump. Missionaries see privacy-safe qualified support health and scheduled-support impact, never provider internals. A notification failure creates communication-repair evidence and changes no intent, control, occurrence, or cash truth.

## Implementation Decisions — Fixed-Total Campaign Commitments (D17)

### L.1 Total first; no forced plan

The ordinary staff form contains only:

- Commitment Party;
- promised total and currency;
- destination/campaign allocation;
- commitment civil date; and
- D14/D15 instruction source and evidence.

It visibly states **No expected dates recorded** and **This does not charge the donor or record money received.** Staff can record the promise without answering a schedule question. **Add installment plan** is a secondary, intentional action; saving/importing a pledge does not create one.

### L.2 Focused plan builder

The builder is a normal full page carrying existing context forward. It presents an unselected native radio group and explicit Continue action:

- **One expected date**;
- **Even installments**; or
- **Custom expected dates**.

It is not a modal, checkbox reveal, spreadsheet, automatic navigation, approval workflow, or tenant schedule DSL. One-date and even plans cover the full current remaining promise. A partial custom plan is valid only after staff explicitly select **Leave $X without an expected date**; that remainder cannot become late or enter a dated forecast/reminder.

Every screen shows promised total, named-date total, undated total, count, and actual dates/amounts. Named expectations cannot exceed current remaining capacity. Amounts use integer minor units; the last even installment absorbs any visible rounding residual. The server command is authoritative; client validation is assistance.

Canonical expectations contain destination-bearing child lines. Multi-destination plans use the Phase 13 deterministic largest-remainder allocation by default. Custom per-date allocation is progressively disclosed only when evidence requires it. This preserves D11 exact line/occurrence targets without burdening the common staff form.

Expected dates are civil date-only facts produced by the shared D4 calendar rules, never settlement timestamps. Evidence-backed past dates are permitted with warning and immediately mean **Past expected date**, not Failed payment.

### L.3 Non-execution and separate truths

Creating/changing a fixed plan cannot charge, retry, invoice, bind a method, create a mandate, post cash, receipt, classify a receivable, enable reminders, notify a missionary, or change donor intent. Exceptional automatic collection separately satisfies D14–D16 and remains the recurring product, not an execution mode hidden in a pledge plan.

Staff detail shows **Promised**, **Received and applied**, **Released internally**, **Remaining expected**, **Named expectations**, and **Without an expected date**. Promise lifecycle, plan attention, collection/payment, money, fulfillment, and Phase 20 accounting remain separate axes. Do not use an unexplained Balance label.

Donors see a conditional **Campaign commitment** card with promise/progress and a request-change action, never debt, invoice, accounting-write-off, or internal-release language. Missionaries see a quiet read-only **Other commitments** section only when data exists, below cash and online recurring, and never monthly-normalized.

### L.4 Atomic append-only creation and amendment

One tenant-scoped idempotent command saves pledge, destination lines, plan version, expectations/child lines, fulfillment targets, evidence reference, audit, and outbox atomically. Plan changes append a version and supersede only affected unfulfilled expectations. Original/past/applied/money facts never change. Concurrent D11 fulfillment and amendment use common target locks, expected revisions, and CAS.

The review above **Record campaign commitment** is editable, repeats **No automatic charges**, and requires no routine confirmation modal. Errors preserve input, focus a linked summary, repeat identical inline corrections, and expose status accessibly.

## Implementation Decisions — Change, End, Release, and Correct a Fixed Pledge (D18)

### M.1 One doorway, four distinct operations

The pledge detail offers the quiet secondary action **Change or close campaign commitment**. A three-stage full-page flow contains:

1. one unselected native radio group choosing **Record a donor-requested change**, **End the remaining commitment at the donor's request**, **Release an amount from internal expectation**, or **Correct an entry error**;
2. only that operation's evidence/fields; and
3. one editable **Current / After** review with an outcome-named submit control.

Selection never auto-navigates. There is no generic adjustment, Undo, typed phrase, ritual checkbox, second generic modal, universal approval, drawer/accordion maze, or spreadsheet.

### M.2 Exact conserved resolution fold

For current donor amount `P`, net authoritative fulfillment `F`, effective donor-ended amount `D`, effective internal release `R`, remaining expected `E`, and applied fulfillment above the current commitment `X`:

```text
P = min(F, P) + D + R + E
X = max(F - P, 0)
```

Current donor capacity is established first; proven fulfillment consumes it first; donor-ended resolution controls overlapping unfulfilled capacity before internal release; release covers only what remains; and the rest is expected. The fold operates at line/expectation minor-unit grain. Header totals are rebuildable projections.

### M.3 Donor-requested change

Requires exact Party instruction or valid representative authority. Every donor-term change that changes effective remaining capacity appends both a donor-term version and a conserving plan version. An increase becomes explicit undated remainder unless the donor supplied revised timing. A reduction requires an explicit proposed target-level plan adjustment across dates and designations; the server never guesses. Apply remains unavailable until named expectations plus undated remainder exactly equal the new effective remaining. A timing-only plan edit routes to D17.

A reduction below prior fulfillment is valid: remaining becomes zero and the UI shows **Applied above current commitment**. It does not refund, unapply, re-designate, rewrite receipts, or create future credit. Identity/Party/currency/type/tenant/merchant changes are not ordinary changes and follow M.6.

### M.4 Donor-requested end

End affects only unfulfilled remaining capacity proven by donor instruction. It preserves original promise and fulfillment history, supersedes eligible future expectations, and suppresses plan-version-bound reminder candidates. If no remainder exists, explain that there is nothing left to end instead of manufacturing a terminal event.

Ending the fixed pledge and stopping a separately linked recurring commitment/executor are separate commands over separate aggregates. The fixed-pledge end never stops collection by itself. Only when the donor also explicitly requests the recurring stop and current authorization rules accept it may the workflow append that separate protective stop intent; the pledge event still commits without waiting for provider proof. Until the separate stop is proved, show **Campaign commitment ended; recurring donation stop requested — provider confirmation pending**. Already-submitted card/ACH work remains in flight.

### M.5 Internal release

Release is an organization-only overlay requiring a dedicated capability, blank-by-default exact amount, civil effective date, concise governed reason, and only a real policy-required approval. It changes no donor promise, money, destination, executor, receipt, or accounting fact.

Undated remainder is consumed transparently first. Releasing named expectations requires target selection or explicit **Release all remaining expectations**. If an executor remains linked, review and confirmation state clearly that collection continues.

A later restoration is a linked signed inverse of the release. A renewed future donor promise is a new donor-authorized term. Neither is generic Undo.

### M.6 Correction and authority dispute

A factual correction supersedes/replaces same-identity facts with complete before/after history and evidence. Wrong Party, currency, tenant, promise type, merchant boundary, or material identity never mutates in place: tombstone the invalid record and, if authorized, link a same-tenant successor. Records never move between tenants. Money and D11 applications change only through their own inverse/reapply contracts.

**I never authorized this** is not silently correction or donor end. It enters a bounded authority-review quarantine, leaves history, and is excluded from active forecast/reminders until evidence resolves it.

A late gift records as a contribution first. Similar amount/date/Party/memo never resurrects an ended or internally released pledge and cannot displace those effective facts. It remains unmatched unless another still-effective target already existed. Restoring released capacity requires a separately authorized D18 release inverse before a later D11 application; donor-ended capacity requires a real new/reaffirmed promise rather than an administrative inverse. No collection or reminder restarts from the late gift itself.

### M.7 Review, concurrency, and recovery

Review names original/current promise, received/applied, donor-ended recorded/effective, release recorded/effective, remaining expected, excess fulfillment, plan, executor, and in-flight truth. It explicitly lists what does not change: existing gifts, receipts, fulfillment history, refunds/charges, and accounting.

D11/D18 share target locking, aggregate/target revisions, CAS revalidation, semantic idempotency, and one transaction. Secondary provider/finance/notification/search/projection work uses an idempotent outbox. On timeout, query the durable operation reference; never blind-retry. A stale preview shows the canonical diff and requires review again. Confirmation shows reference, effective result, non-effects, follow-up state, and authorized recovery route.

## Implementation Decisions — Gentle Fixed-Pledge Reminders (D19)

### N.1 One profile and a reduction-only tenant maximum

There is exactly one platform-governed **Gentle** profile:

1. upcoming courtesy candidate 30 calendar days before `scheduled_for`; and
2. one careful D12 source-aware follow-up candidate at `review_after_at`.

The v1 profile is email-only through the Phase 6 governed communication seam. SMS, postal mail, push, and channel escalation are not available reminder choices in this phase. Channel is therefore a platform-fixed contract, not a tenant-level or pledge-level setting.

Tenant maximum is exactly:

- **Unavailable**;
- **Upcoming reminder only**; or
- **Upcoming reminder + one follow-up**.

Tenants may narrow availability, stage 2, capability, governed sender/reply-to, locale, and published template binding. They cannot define cadence/stages/intervals/channels per pledge, auto-enroll, force-send, add due-date/third touches, catch up, relabel purpose, infer a recipient, bypass current truth/consent/suppression, or erase evidence. Narrowing immediately fences incompatible future candidates. Expanding/re-enabling never resurrects old enrollment or passed stages.

### N.2 Explicit current-plan enrollment

Every tenant, pledge, import, and migration starts Off. Saving/changing a plan sends nothing. Authorized staff use secondary **Set up reminders** to enroll the current plan only when it has at least one current named expectation and a current D14 purpose-bound verified service contact. No-plan and undated remainder cannot enroll. A plan amendment supersedes the old enrollment and the new plan returns to Off until explicitly reviewed and enrolled.

Late enrollment skips passed stages. If no stage remains, do not create an inert enrollment. With one eligible contact, carry it to review as an explicit fact; with several, ask only that unknown in an unselected native radio group; with none, show the exact repair route and reject arbitrary email entry.

One check-answers page shows Party, current plan version, its eligible expectation stages, tenant maximum, recipient/purpose, timezone, possible/skipped dates, send-time gates, and non-effects before **Turn on pledge reminders**. Confirmation is durable and easy to reverse.

### N.3 Every stage is only a candidate

Immediately before Phase 6 submission, re-prove tenant/site, tenant maximum, enrollment/plan/expectation versions, positive unresolved capacity, D11 fulfillment, partial/pending gifts/batches/checks, source coverage/matching, D18 end/release/correction/quarantine, D16 control state where relevant, current service contact/purpose, jurisdiction, consent, suppression, published Phase 17 template, and permanent semantic duplicate state.

Phase 16 owns policy, enrollment, candidate derivation, and pledge/source eligibility. Phase 6 owns consent/suppression/events/delivery. Phase 17 owns governed rendering. Phase 25 consumes the same preference. Actual sends remain blocked until required Phase 6 and 17 seams exist; Phase 16 does not create a parallel queue, studio, or provider binding.

The old `scheduled_gift_reminder` transactional literal is not authority. Fixed-total pledge reminders use an explicit campaign-commitment stewardship/fundraising purpose and the stricter consent gate unless later governing policy proves otherwise.

### N.4 Idempotency, delivery truth, and stopping contact

The permanent semantic database key is tenant + pledge + plan version + expectation + stage. Provider idempotency is secondary and time-limited. Candidate claims use leases/CAS; submitted/accepted/delivered/bounced/complained/failed/suppressed evidence is monotonic and replay-safe. No state claims the recipient read or understood.

Email GET is read-only against link scanners. A narrow signed POST and RFC 8058 one-click POST immediately stop only this communication purpose without sign-in, guilt, reason, or staff approval. Tokens are tenant/purpose/recipient-bound, short-lived where appropriate, replay-safe, and can only narrow contact. Stopping reminders does not end/change the pledge.

### N.5 Content and role UX

Subjects omit amount, urgency, and restricted-worker identity. Organization copy names the Commitment Party rather than implying a service contact personally owes money. Follow-up says current records do not yet show an applied gift and acknowledges processing/matching uncertainty. Debt, invoice, overdue, delinquent, failed-donor, guilt, unrelated appeal, and donor-aware language is forbidden. Open/click tracking is off by default and never product truth.

Staff see one compact reminder block and a **Needs attention** list containing only human-repairable exceptions, with **All expected dates** available. Normal Off/scheduled/fulfilled/suppressed states create no tasks. Missionaries remain cash-first and see no contact, consent, reminder, delivery, reply, or notification detail.

## Canonical Data Model

### O.1 Storage and tenancy rules for every Phase 16 table

All names below are the canonical build target. Phase 13 forward names `commitment_groups` and `recurring_commitments` are retained but their old one-subscription-per-line and six-state semantics are superseded. Every Phase 16-owned table follows these rules unless a stricter rule is stated:

- UUID primary key generated server-side; `tenant_id uuid NOT NULL` with no default.
- Parent tables declare `UNIQUE (id, tenant_id)`; every tenant-owned reference uses a composite same-tenant FK such as `(child_id, tenant_id) → (id, tenant_id)`.
- `created_at`, `created_by`, `request_id`, and aggregate revision/provenance where applicable; authoritative business dates are separately named.
- money is signed or nonnegative `bigint` integer minor units plus ISO currency; no floating-point money.
- civil schedule dates are Postgres `date`; execution/provider facts are `timestamptz`; every civil calculation also binds an IANA zone and schedule-rule version.
- FORCE RLS where table exposure is appropriate; deny-by-default policies use the active server-resolved tenant and capability. Internal journals/evidence are revoked from the Data API and reachable only through SECURITY DEFINER/service functions with explicit tenant and capability checks.
- no raw PAN, CVV, bank routing/account number, mandate document, or provider secret; store token/reference IDs, safe display metadata, and restricted evidence references only.
- authoritative journals are append-only with BEFORE UPDATE/DELETE denial except an explicitly documented soft-retire/projection maintenance path. Corrections append superseding/inverse facts.
- tenant/account/mode/semantic identities are included in unique/idempotency keys; no unscoped cache, worker, outbox, or provider lookup.
- all server-created timestamps use the database clock. Effective commands also store the caller's displayed civil date/zone and the resolver version.

### O.2 Tenant schedule, recovery, and review policy

#### `recurring_policy_versions`

Key columns: `id`, `tenant_id`, `version`, `giving_timezone_snapshot`, `org_settings_revision`, `recovery_profile` (`balanced|off`), system-owned `platform_attempt_ceiling_snapshot` fixed at 15 for v1, `platform_recovery_rules_version`, `effective_from`, `effective_to`, `status`, `created_by`, `reason`.

Constraints/indexes:

- unique `(tenant_id, version)`;
- exclusion or transaction-enforced no overlapping active effective ranges;
- `giving_timezone_snapshot` must equal the validated IANA identifier from Phase 2 `org_settings.giving_timezone` at version creation; `org_settings` remains the only setting authority and this frozen value is reproducibility evidence, not a second configurable timezone;
- `recovery_profile` is the tenant's only retry control; tenants cannot edit the platform attempt ceiling, timing formula, cycle count, or rail rules;
- only new incidents use attempt-expanding versions; narrowing is live as specified in D7.

#### `recurring_policy_cadences`

Key columns: `id`, `policy_version_id`, `tenant_id`, `cadence_code`, `enabled`, `checkout_rank`, `featured`, `resolver_version`.

Constraints: one row per policy/cadence; exactly one enabled row is featured in every active policy; monthly must be that row whenever enabled, otherwise the tenant chooses one other enabled cadence. Daily is not a valid v1 code; closed codes are `weekly`, `every_2_weeks`, `twice_monthly_1_15`, `every_4_weeks`, `monthly`, `quarterly`, `semiannual`, `annual`. Historical lines bind the accepted policy/cadence version and remain manageable if later disabled.

#### `commitment_review_policy_versions`

Key columns: `id`, `tenant_id`, `version`, `mailed_review_days` constrained to 7–30 with default 14, `hand_delivery_review_days` constrained to 0–7 with default 0, `structured_feed_ingestion_window_seconds` constrained to 300–604800 with default 86400, `effective_from`, `effective_to`, `status`, `created_by`, `reason`.

This bounded, append-only policy governs only when a manual/external recurring occurrence or fixed-pledge expectation becomes eligible for staff review. A structured-feed window is accepted only with source-specific, frozen SLA evidence stored on that occurrence or expectation. Policy changes are prospective: each created expectation stores the policy version, review basis/evidence, the authoritative giving-timezone snapshot, resolver version, and derived `review_after_at timestamptz` that applied at creation. Mailed and hand-delivery day windows resolve from the civil scheduled date in that frozen zone; structured-feed seconds resolve from the source-accepted instant. The policy cannot move the promised/scheduled date, create debt, claim payment failure, or change lifecycle/fulfillment truth. Unique `(tenant_id, version)` and no overlapping active effective ranges.

### O.3 Recurring aggregate and topology

#### `commitment_groups`

Key columns: `id`, `tenant_id`, `commitment_party_id`, `currency`, `legal_payer_context_hash`, `collection_authorizer_context_hash`, `display_reference`, `origin`, `created_at`, `created_by`, `revision`, `superseded_by_group_id`.

This is the donor-facing grouping object only. It stores no cached total, universal status, provider subscription ID, method ID, or inferred grouping key. All lines share Party, currency, legal payer context, and a compatible collection-authorizer context; a mismatch creates another group. `collection_authorizer_context_hash` is a frozen grouping-integrity snapshot, never authorization. Exact financial authority remains in `recurring_authorization_terms` and the D14 evidence chain. Index `(tenant_id, commitment_party_id, created_at desc, id)`.

#### `recurring_commitments`

One stable row per independently manageable destination line. Key columns: `id`, `tenant_id`, `commitment_group_id`, `intent_state`, `original_creation_at`, `original_anchor_date`, `current_term_version_id`, `current_schedule_epoch_id`, `current_revision`, `superseded_by_line_id`.

Constraints:

- original creation/anchor immutable;
- same-tenant Party/group/current-term/current-epoch references;
- no provider customer/subscription/item or payment-method columns on this business line;
- valid intent states only: `pending_activation`, `ongoing`, `paused`, `cancellation_requested`, `canceled`, `ended_as_scheduled`, `superseded`;
- `intent_state` and current pointers are revision/CAS projections; immutable term versions, schedule epochs, pause events, commands, and evidence remain authoritative;
- index `(tenant_id, commitment_group_id, id)` and partial index over live intent states.

#### `recurring_commitment_term_versions`

Key columns: `id`, `tenant_id`, `recurring_commitment_id`, `version`, `designation_id`, `amount_minor`, `currency`, `cadence_code`, `collection_arrangement` (`provider_automatic|manual_external`), `optional_final_eligible_date`, `recurring_policy_version_id`, `site_id`, nullable `source_code_id`, `entry_method`, `captured_locale`, `source_code_snapshot_hash`, `fee_cover_election`, `fee_cover_policy_version_id`, `fee_cover_terms_snapshot_hash`, `effective_from_occurrence_date`, nullable `effective_to_occurrence_date`, `supersedes_term_version_id`, `created_by_command_id`, `created_at`.

Unique `(tenant_id, recurring_commitment_id, version)` and one effective version per line/date. Amount is positive; currency and cadence use closed validated vocabularies. Composite same-tenant FKs bind the line, designation, site, source code, policy, and command. The source-code snapshot remains frozen even after retirement, campaign attribution continues to derive through that source code rather than a second mutable campaign field, and the fee-cover election/policy is re-evaluated for the actual rail on every occurrence without silently changing donor terms. Amount, destination, cadence, arrangement, end boundary, attribution, or fee-cover changes append a prospective version; no historical revision is overwritten.

#### `recurring_billing_cohorts`

Key columns: `id`, `tenant_id`, `commitment_group_id`, `collection_arrangement` (`provider_automatic|manual_external`), nullable `connected_account_id`, nullable `livemode`, nullable `rail` (`card|ach`), nullable `merchant_scope_hash`, `currency`, nullable `current_authorization_terms_id`, `schedule_compatibility_hash`, `collection_behavior_version`, `current_schedule_version_id`, `current_revision`, `retired_at`, `retired_reason`.

The compatibility hash is an integrity aid, not authority; the server recomputes the full predicate. A cohort is the one logical collection unit and owns one or more explicit execution legs: exactly one for ordinary cadences and exactly two for twice-monthly. It never stores a single executor/subscription slot. Provider-automatic cohorts require account/mode/rail and a non-null composite same-tenant FK from `current_authorization_terms_id` to `recurring_authorization_terms`, plus one live binding per leg. The pointer is revision/CAS convenience only; immutable terms history remains authoritative. Manual/external cohorts require those provider fields, the authorization pointer, and bindings to be null; they reuse schedule/occurrence/fulfillment truth and never receive a fake executor/retry engine. Unique live cohort identity is tenant-scoped and cannot merge across groups merely because donor/method match.

#### `recurring_cohort_memberships`

Key columns: `id`, `tenant_id`, `billing_cohort_id`, `recurring_commitment_id`, `line_term_version_id`, `line_schedule_epoch_id`, `cohort_schedule_version_id`, `effective_from_occurrence_date`, `effective_to_occurrence_date`, `reason`, `command_id`.

Half-open effective ranges, append-only. An exclusion/transaction constraint prevents a line from belonging to two live cohorts over the same occurrence-date range; both twice-monthly legs remain inside the one cohort membership. Index by `(tenant_id, recurring_commitment_id, effective_from_occurrence_date desc)` and `(tenant_id, billing_cohort_id, effective_from_occurrence_date)`.

#### `recurring_schedule_epochs`

Key columns: `id`, `tenant_id`, `recurring_commitment_id`, `epoch_number`, `cadence_code`, `anchor_date`, `giving_timezone`, `tzdb_version`, `resolver_version`, `effective_after_occurrence_id`, `effective_from_date`, `final_eligible_date`, `terms_snapshot_hash`, `created_by_command_id`, `created_at`.

Unique `(tenant_id, recurring_commitment_id, epoch_number)`. Immutable. The original epoch is 1. Changes append epochs; historical dates never rewrite.

The schedule epoch is the authoritative calendar for its line. The corresponding term version freezes the donor-disclosed cadence and final boundary and must equal the epoch at the shared effective boundary. A cohort schedule version is only the executable projection of equivalent member epochs; every membership range must prove its line epoch equals the cohort cadence, anchor, timezone, resolver, and final-boundary semantics. A mismatch splits the cohort and cannot be activated.

#### `recurring_pause_events`

Key columns: `id`, `tenant_id`, `recurring_commitment_id`, `pause_series_id`, `event_type` (`opened|ended|superseded`), nullable `starts_on date`, nullable `resumes_on date`, nullable `effective_at timestamptz`, `reason_code`, `source`, `created_by_command_id`, nullable `supersedes_event_id`, `created_at`.

These immutable, line-grained events are the authoritative D5 pause facts; the header's `intent_state` is a projection. An `opened` event requires `starts_on`; `resumes_on` null means indefinite and a bounded value must be later than `starts_on`. An `ended` or `superseded` event references the prior event/series and records its effective instant without mutating the open fact. The command service serializes on the line, folds the event stream, and rejects overlapping effective pauses. Pausing selected lines prospectively splits an incompatible shared cohort rather than pausing siblings. Ending or changing a pause appends an event and never deletes the original interval or moves the schedule grid.

#### `recurring_cohort_schedule_versions`

Key columns: `id`, `tenant_id`, `billing_cohort_id`, `version`, `cadence_code`, `anchor_date`, `giving_timezone`, `tzdb_version`, `resolver_version`, `effective_from_date`, `effective_after_occurrence_id`, `final_collection_boundary`, `created_by_command_id`.

This immutable version is the executable schedule shared by compatible member-line epochs. The planner proves every membership epoch is equivalent to it. Unique `(tenant_id, billing_cohort_id, version)`; the current pointer on the cohort is only a convenience protected by revision/CAS.

#### `recurring_execution_legs`

Key columns: `id`, `tenant_id`, `billing_cohort_id`, `cohort_schedule_version_id`, `leg_code`, `ordinal`, `effective_from`, `effective_to`, `created_by_command_id`.

Ordinary cadences have exactly one `primary` leg. Twice-monthly has exactly `day_1` and `day_15` legs. Unique per cohort schedule version/leg code. Each provider-automatic leg receives its own executor binding/subscription and exact item-per-participating-line bindings. A manual/external leg has no provider binding and exists only to preserve its truthful expected-date/fulfillment grain. A leg is execution structure, not another donor-visible line or group/cohort.

### O.4 Occurrence and attempt ledger

#### `recurring_occurrences`

One business schedule occurrence per logical cohort execution-leg slot or initial per-cohort attempt. For provider-automatic collection it is the reconciliation grain for the provider's ordinary renewal or an explicitly product-triggered payment; for manual/external collection it is an expectation/fulfillment grain and never implies a provider attempt. Key columns: `id`, `tenant_id`, `occurrence_semantic_key`, `billing_cohort_id`, `cohort_schedule_version_id`, `collection_arrangement_snapshot`, `occurrence_kind` (`scheduled|initial_out_of_series`), nullable `execution_leg_id`, nullable `execution_leg_code`, nullable `initial_checkout_command_id`, nullable `initial_execution_mode` (`executor_invoice|product_triggered`), `scheduled_for date`, nullable `review_policy_version_id`, nullable `review_basis` (`mailed_manual|hand_delivery_cash|structured_feed`), nullable `review_basis_evidence_ref`, nullable `structured_source_version_id`, nullable `structured_source_sla_snapshot_hash`, nullable `review_after_at timestamptz`, nullable `review_timezone`, nullable `review_resolver_version`, `giving_timezone`, `resolved_window_start`, `resolved_window_end`, `execution_state` (`planned|suppressed|claiming|submitted|closed`), nullable `closure_reason`, `execution_state_cursor`, nullable `suppression_reason`, nullable `product_trigger_command_id`, nullable `connected_account_id`, nullable `livemode`, nullable `provider_invoice_id`, nullable `current_payment_state` (`processing|succeeded|failed|action_required|indeterminate|reversed`), nullable `payment_state_cursor`, nullable `finalized_at`, `updated_at`, `revision`.

A scheduled occurrence requires an execution leg and stable leg code. Its stored semantic key is deterministically derived from tenant, cohort, scheduled kind, stable leg code, and civil scheduled date and is globally unique within the tenant; schedule-version changes therefore cannot materialize the same business slot twice. A future-start/off-slot immediate payment-backed gift is `initial_out_of_series`, has no execution leg, and derives its unique key from tenant, initial checkout command, and cohort. Thus one checkout creates exactly one initial occurrence/provider attempt per disclosed automatic cohort, never per line or per twice-monthly leg. `initial_execution_mode` is required exactly when `initial_checkout_command_id` is present and is otherwise null; it freezes which mutually exclusive owner may create that attempt. Execution state answers whether the named occurrence was planned, fenced, claimed, submitted, or closed; payment state separately folds immutable attempt/provider evidence and never re-anchors the schedule. Posted/received money remains the independent Phase 13 contribution fold. `closure_reason` is a closed, evidence-derived outcome such as `succeeded`, `missed`, `reversed`, `manual_fulfilled`, `ended`, or `superseded`, not a payment-status substitute. Manual/external occurrences require a composite same-tenant `review_policy_version_id` FK, a closed review basis with evidence, and a frozen, reconstructable policy-derived `review_after_at`, timezone, and resolver version; structured-feed rows additionally require an approved same-tenant structured-source-version FK and source-specific SLA snapshot. Provider-automatic occurrences require every review field null and carry immutable account/mode scope whenever a provider invoice ID is present; `(tenant_id, connected_account_id, livemode, provider_invoice_id)` is unique when present. Manual/external occurrences retain null payment state and derive Expected/Past expected/Fulfilled review truth from schedule plus D11/D12; they cannot enter claiming/submitted or receive a provider attempt without a prospective, freshly authorized collection-arrangement supersession. A `missed` closure is terminal except a late event proving a pre-closure attempt; that correction is explicit and exactly-once.

Indexes: due claim `(tenant_id, execution_state, resolved_window_start, id)`; reconciliation `(tenant_id, current_payment_state, updated_at)`; cohort history `(tenant_id, billing_cohort_id, scheduled_for desc, id)`.

#### `recurring_occurrence_lines`

Immutable snapshot rows: `id`, `tenant_id`, `occurrence_id`, `recurring_commitment_id`, `line_term_version_id`, `designation_id`, `amount_minor`, `currency`, `site_id`, nullable `source_code_id`, `entry_method`, `captured_locale`, `source_code_snapshot_hash`, `fee_cover_election`, `fee_cover_policy_version_id`, `fee_cover_terms_snapshot_hash`, `fulfillment_target_id`.

Unique `(tenant_id, occurrence_id, recurring_commitment_id)`. Sum of line amounts must equal cohort occurrence amount, enforced by the occurrence creation command and reconciliation, not only a CHECK. A shared-cohort attempt outcome applies to every snapshotted line; role projections filter lines before aggregation. Contribution generation copies the frozen site/entry/source/designation/locale attribution from these rows and recomputes the accepted fee-cover election for the actual rail under the pinned policy; it never re-reads mutable checkout attribution.

#### `recurring_collection_attempts`

Key columns: `id`, `tenant_id`, `occurrence_id`, nullable `retry_slot_id`, nullable `product_command_id`, nullable `commitment_provider_operation_id`, `connected_account_id`, `livemode`, nullable `provider_operation_id`, `execution_source` (`provider_renewal|provider_executor_initial|product_triggered`), `attempt_kind` (`ordinary|initial|accelerated|donor_present|ach_proof_gated`), nullable `product_attempted_at`, nullable `provider_accepted_at`, `outcome`, `advice_scope`, `provider_code`, `indeterminate_at`, `resolved_at`, `raw_evidence_ref`.

Unique provider operation identities include tenant/account/mode, enforced directly on immutable snapshot columns and checked against the occurrence/binding scope. Attempts are append-only. An ordinary provider renewal is ingested/reconciled from verified provider evidence, has no product-trigger timestamp, and may have no Phase 16 command/operation child. An initial executor-invoice attempt references the exact `provision_executor` operation that created its charge-owning leg. A product-triggered attempt requires one composite same-tenant/account/mode `commitment_provider_operation_id` whose kind is `create_payment` or `retry_payment`. One provider-operation child may have infrastructure delivery retries but at most one provider authorization attempt. Manual/external occurrences have no attempt rows. Raw evidence remains restricted.

#### `recurring_network_attempt_evidence`

Key columns: `id`, `tenant_id`, `attempt_id`, `connected_account_id`, `livemode`, `payment_credential_lineage_id`, `network_sent_at`, `network_reference_hash`, `source`, `confidence`, `reconciled_at`.

Unique when a stable network reference exists. The lineage FK is composite and same-tenant/account/mode, and must resolve to `rail=card` for card network evidence. Used for the rolling ceiling; product-attempt and network-sent counts remain separate.

### O.5 Authorization, provider executor, and command journals

#### `payment_credential_lineages`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `rail` (`card|ach`), `durable_lineage_hash`, `lineage_source`, `confidence`, `state`, `created_at`, nullable `superseded_by_id`.

This is the processor/network-proven identity used for attempt pressure, failure episodes, and credential replacement safety. It is not collection authorization and grants no payment right. Unique `(tenant_id, connected_account_id, livemode, rail, durable_lineage_hash)`; all inbound references use composite same-tenant/account/mode FKs. Token or method-reference rotation remains in the same lineage only when processor/network evidence proves continuity. Otherwise it creates a new lineage; a token ID, masked digits, note, or staff assertion alone can neither merge nor reset a lineage.

#### `recurring_authorization_terms`

Key columns: `id`, `tenant_id`, `commitment_group_id`, `commitment_party_id`, `financial_authorizer_party_id`, `connected_account_id`, `livemode`, `rail`, `payment_credential_lineage_id`, `provider_method_ref`, `masked_method`, `terms_schema_version`, `terms_version`, `terms_hash`, `amount_rule` (`fixed_per_occurrence|bounded_variable`), nullable `authorized_amount_minor`, nullable `authorized_amount_cap_minor`, `currency`, `cadence_code`, `anchor_date`, `first_continuing_date`, nullable `final_eligible_date`, `giving_timezone_snapshot`, `merchant_identity_snapshot_hash`, `merchant_scope_hash`, `line_allocation_snapshot_hash`, `retry_recovery_terms_version`, `future_use_purpose_code`, `cancellation_terms_version`, `notice_bundle_version`, `authorization_source`, `evidence_ref`, `accepted_at`, `effective_from`.

This is the collection-authority lineage, not Party ownership or credential identity. The credential and group FKs are composite and must match tenant/account/mode/rail/Party. Closed-schema validation requires exactly one fixed amount or bounded cap rule and retains the exact schedule, merchant/application, destinations, future-use, retry/recovery, cancellation, and notice terms the authorizer accepted. Terms/evidence are immutable. Material change creates fresh terms and a supersession event; revocation/expiry never updates the accepted record. Unique `(tenant_id, terms_hash, financial_authorizer_party_id, connected_account_id, livemode)` only prevents replay of the exact acceptance; it does not merge agreements.

#### `recurring_authorization_term_events`

Key columns: `id`, `tenant_id`, `authorization_terms_id`, `event_type` (`revoked|expired|superseded`), `effective_at`, nullable `successor_authorization_terms_id`, `reason_code`, `evidence_ref`, `commitment_command_id`, `created_at`.

Events are append-only and composite same-tenant/account/mode scoped through their terms. `superseded` requires a distinct successor terms record; revoked/expired forbid one. Unique semantic event identity prevents double termination. Current authorization is a fold over accepted terms plus these events, never a mutable status or timestamp on the accepted evidence.

#### `recurring_executor_bindings`

Key columns: `id`, `tenant_id`, `execution_leg_id`, `billing_cohort_id`, `connected_account_id`, `livemode`, `rail`, `connection_epoch`, `connect_application_id`, `ownership_state`, `charge_architecture`, `merchant_id`, `on_behalf_of_account_id`, `transfer_destination_account_id`, `provider_customer_id`, `provider_subscription_id`, `provider_schedule_id`, `authorization_terms_id`, `last_trusted_event_id`, `last_reconciled_at`, `binding_revision`, `effective_from`, `effective_to`.

Unique provider object identities are scoped by account+mode, for example `(connected_account_id, livemode, provider_subscription_id)`. A second live executor for one execution leg is prohibited. An ordinary cohort therefore has one live binding; a twice-monthly cohort has two, one per leg. At every effective boundary, the binding's `authorization_terms_id` must equal the cohort's current authorization-terms pointer, and the binding, cohort, terms, and credential lineage must agree on tenant, account, mode, rail, merchant scope, and currency. Composite FKs plus the command finalizer enforce equality; a hash or application assertion is not enough. Bindings are append-only epochs; reconnect does not edit the old proof.

#### `recurring_executor_line_bindings`

Key columns: `id`, `tenant_id`, `executor_binding_id`, `execution_leg_id`, `recurring_commitment_id`, `line_term_version_id`, `connected_account_id`, `livemode`, `provider_subscription_item_id`, `provider_price_id`, `effective_from`, `effective_to`, `last_verified_at`.

Unique live item per line per execution leg and unique live line per item, both scoped directly by tenant/account/mode and checked against the parent executor binding. Twice-monthly therefore has two item bindings for each participating business line, one under each leg/subscription. All provider mutations resolve by this exact binding; no code may use an array ordinal or `items[0]`.

#### `commitment_commands`

Key columns: `id`, `tenant_id`, `command_type`, `request_id`, `idempotency_key`, `expected_revision`, `preview_token_hash`, `payload_version`, `requested_by_actor_id`, `instruction_actor_id`, `instruction_authority_ref`, `operator_capability_version`, nullable `authorization_terms_id`, `terms_snapshot_hash`, `state`, `effective_boundary`, `outcome_code`, `created_at`, `expires_at`.

This shared envelope/journal records commands for both separate aggregates without merging their lifecycles. Unique `(tenant_id, idempotency_key, command_type)`. State: `requested`, `awaiting_authorization`, `authorized`, `applying`, `applied`, `provider_sync_failed`, `reconciling`, `reconciled`, `rejected`, `expired`, `indeterminate`. Command payload is a closed, versioned schema validated server-side and contains exact affected IDs; it never contains credentials. Structural subjects use the typed relation below rather than an unenforceable polymorphic ID. An applied recurring schedule command freezes a versioned, role-safe confirmation snapshot with exact effective terms, projected civil dates/resolved instants, in-flight non-effects, provider-sync result, and Phase 6 intent identity/status reference. Authorized GET responses rebuild from that frozen snapshot and monotonic provider/communication evidence; they never recalculate historical confirmation copy from current policy.

#### `commitment_command_subjects`

Key columns: `id`, `tenant_id`, `commitment_command_id`, `subject_kind` (`recurring_group|recurring_line|recurring_cohort|recurring_occurrence|card_recovery_incident|ach_recovery_grant|fixed_total_pledge|party|representative_authority|service_contact|expected_remitter|recurring_policy|review_policy|reminder_policy|provider_control_incident|contribution_designation_line|fulfillment_target|fulfillment_operation`), nullable `commitment_group_id`, nullable `recurring_commitment_id`, nullable `recurring_billing_cohort_id`, nullable `recurring_occurrence_id`, nullable `card_recovery_incident_id`, nullable `ach_recovery_grant_id`, nullable `fixed_total_pledge_id`, nullable `party_id`, nullable `representative_authority_id`, nullable `service_contact_id`, nullable `expected_remitter_id`, nullable `recurring_policy_version_id`, nullable `review_policy_version_id`, nullable `reminder_policy_version_id`, nullable `provider_control_incident_id`, nullable `contribution_designation_line_id`, nullable `fulfillment_target_id`, nullable `fulfillment_operation_id`, `relationship` (`primary|affected|created|superseded`).

Exactly one typed subject FK is non-null and matches `subject_kind`; every FK is composite same-tenant. Each command has exactly one `primary` subject and may have additional exact affected/created/superseded subjects. This permits Party-wide role commands and multi-line/cohort sagas without raw polymorphic references or trusting payload IDs for tenancy.

#### `commitment_provider_operations`

Key columns: `id`, `tenant_id`, `commitment_command_id`, `operation_index`, `operation_kind` (`provision_executor|create_payment|retry_payment|update_executor|stop_executor|reconcile_executor|cutover_executor`), `target_kind` (`occurrence|execution_leg|executor_binding|executor_line_binding|provider_control_incident`), nullable `recurring_occurrence_id`, nullable `recurring_execution_leg_id`, nullable `recurring_executor_binding_id`, nullable `recurring_executor_line_binding_id`, nullable `provider_control_incident_id`, `connected_account_id`, `livemode`, `semantic_idempotency_key`, `provider_idempotency_key`, nullable `provider_operation_id`, `state` (`planned|claimed|submitted|accepted|indeterminate|succeeded|failed|reconciled`), nullable `evidence_ref`, `created_at`, `updated_at`.

Exactly one target FK is non-null, matches `target_kind`, and is composite same-tenant/account/mode where applicable. Unique `(tenant_id, commitment_command_id, operation_index)`, `(tenant_id, connected_account_id, livemode, semantic_idempotency_key)`, and scoped provider identity when present. Initial executor creation is one `provision_executor` operation per execution leg, targeted at that pre-existing leg because no executor binding exists yet. Its immutable payload references the exact cohort schedule version, authorization terms, initial-execution mode, and complete line-term/item plan for that leg; it never targets a fabricated future binding. A command may own several provider operations, but every operation has one permanent semantic identity and its own outcome/evidence. Attempts and executor mutations reference this row; the parent command never pretends one provider ID represents a multi-effect saga.

#### `commitment_command_events`

Append-only events: `id`, `tenant_id`, `commitment_command_id`, `sequence`, `event_type`, `payload`, `evidence_ref`, `occurred_at`, `recorded_at`, `actor_id`. Unique command/sequence. Payloads are versioned and redacted. This is a domain-specific journal, not a platform-wide event-sourcing framework.

#### `recurring_authorization_challenges`

Key columns: `id`, `tenant_id`, `commitment_command_id`, `intended_authorizer_party_id`, nullable `recipient_party_id`, nullable `recipient_contact_point_id`, `terms_version`, `terms_hash`, `purpose_code`, `delivery_channel` (`email|sms|qr|staff_present`), `token_hash`, `state` (`pending|viewed|accepted|declined|expired|superseded|consumed`), `expires_at`, nullable `superseded_by_id`, nullable `consumed_by_authorization_terms_id`, `created_at`, nullable `viewed_at`, nullable `accepted_at`, nullable `consumed_at`.

One challenge binds one exact current command, preview/revision, authorizer Party, frozen delivery recipient/contact point, and immutable terms hash. The recipient fields are delivery evidence, not authority; apply always re-proves the authorizer. Tokens are high-entropy, hash-stored, single-use, tenant/purpose bound, and scanner-safe: GET may display a read-only review but never accept terms; deliberate POST plus the required authentication/verification accepts. Any material edit, stale revision, expiry, authorizer mismatch, or supersession invalidates the challenge. Acceptance appends `recurring_authorization_terms`; it never lets staff proxy-consent or exposes credentials.

### O.6 Card recovery

#### `card_failure_episodes`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `payment_credential_lineage_id`, `trigger_occurrence_id`, `state` (`open|resolved`), `scheduled_cycles_consumed`, `current_cycle_number`, `opened_at`, nullable `resolved_at`, nullable `resolved_by`, nullable `reset_evidence_ref`, `policy_version_id`.

At most one open episode for a proven card credential lineage. The composite FK must resolve to `rail=card`. `scheduled_cycles_consumed` is 0–3; trigger is separate. Same-card token churn cannot change lineage/reset. Index `(tenant_id, connected_account_id, livemode, payment_credential_lineage_id, state)`.

#### `card_recovery_incidents`

One exact occurrence incident: `id`, `tenant_id`, `failure_episode_id`, `occurrence_id`, `incident_role` (`trigger|scheduled_cycle|none`), nullable `cycle_number`, `policy_version_id`, `cadence_tier`, `next_ordinary_occurrence_id`, `connected_account_id`, `livemode`, nullable `provider_invoice_id`, `amount_minor`, `currency`, `state` (`recovering|succeeded|exhausted|suppressed|indeterminate`), `opened_at`, nullable `closed_at`, nullable `close_reason`.

Unique `(tenant_id, occurrence_id)` and scoped provider invoice identity `(tenant_id, connected_account_id, livemode, provider_invoice_id)` where present. Cycle number null for trigger and 1–3 for later cycles. Opening a cycle incident consumes the episode entitlement even if slots later suppress.

#### `card_retry_slots`

Key columns: `id`, `tenant_id`, `recovery_incident_id`, `slot_number`, `candidate_local_date`, `resolved_offset`, `not_before`, `expires_at`, `state`, `claimed_command_id`, `consumed_attempt_id`, `suppression_reason`, `reserved_at`, `resolved_at`.

Unique incident/slot and unique claimed command. State: `available`, `claimed`, `reserved_indeterminate`, `consumed`, `suppressed`, `expired`, `canceled_by_donor`. A database/service invariant prevents a claim outside `[not_before, expires_at)` and prevents claims after control/lifecycle/next-occurrence fences.

### O.7 ACH recovery and normal-date runway

#### `ach_authorization_lineages`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `payment_credential_lineage_id`, `authorization_terms_id`, `provider_mandate_ref`, `provider_bank_method_ref`, `lineage_hash`, `state` (`active|action_required|revoked|parked|superseded`), `normal_soft_return_count`, nullable `first_normal_soft_return_date`, nullable `last_normal_success_at`, nullable `automatic_collection_parked_at`, nullable `park_reason`, `revision`.

The composite credential FK must resolve to the same tenant/account/mode and `rail=ach`; authorization terms must bind the same credential lineage. Counters are rebuildable projections over occurrence/return facts and may be cached only with cursor. The lineage is never inferred from a token ID alone.

#### `ach_recovery_grants`

Key columns: `id`, `tenant_id`, `occurrence_id`, `ach_authorization_lineage_id`, `return_code`, `provider_eligibility_evidence_ref`, `odfi_eligibility_evidence_ref`, `terms_snapshot_hash`, `granted_to_party_id`, `one_use_token_hash`, `state`, `expires_at`, `consumed_by_command_id`, `indeterminate_at`, `resolved_at`.

Unique `(tenant_id, occurrence_id)` for a recovery grant and unique consumed command. States: `offered`, `authorized`, `claimed`, `indeterminate`, `consumed_success`, `consumed_failed`, `expired`, `revoked`. Grant creation is impossible except R01/R09 with all D10 proof; terminal Missed cannot reopen.

### O.8 Provider-control evidence and incidents

#### `provider_control_evidence`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `connection_epoch`, `evidence_type`, `provider_object_type` (closed enum), `provider_object_id`, `observed_value`, `source_event_id`, `source_request_id`, `provider_occurred_at`, `received_at`, `verified_at`, `evidence_hash`, `restricted_payload_ref`.

Append-only and deduped by provider/account/mode/evidence identity. Current control is a fold, never a mutable boolean.

#### `provider_control_incidents`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `connection_epoch`, `opened_control_state`, `opening_evidence_cursor`, `incident_stage`, `opened_at`, `last_verified_at`, nullable `risk_boundary_at`, `owner_user_id`, `backup_user_id`, `affected_count`, `affected_amounts_by_currency`, `state` (`open|closed`), nullable `closed_at`, nullable `close_evidence_ref`.

One open tenant/account/mode incident. `opened_control_state` is the immutable state that caused the incident; current control is always folded from evidence/snapshots and never updated on this row. Stages: `detect`, `protect`, `resolve_access`, `reconcile`, `restore_management`. Counts/totals are cursor-backed projections, not authority.

#### `provider_control_snapshots`

Key columns: `id`, `tenant_id`, `connected_account_id`, `livemode`, `connection_epoch`, `control_state`, `evidence_cursor`, `evidence_set_hash`, `evaluator_version`, `freshness_state`, `computed_at`, `revision`.

This is a rebuildable CAS cache over `provider_control_evidence`, unique per tenant/account/mode/connection epoch/evaluator. It never authorizes a command. Every mutation folds and revalidates current evidence; stale or absent snapshots fail to the conservative D16 posture.

#### `provider_control_incident_bindings`

Key columns: `id`, `tenant_id`, `incident_id`, `executor_binding_id`, `impact_state`, `next_occurrence_id`, `due_before_boundary`, `reconciliation_state`, `released_at`, `exception_code`.

Unique incident/binding. Indexed for cancellation first, due date, exception, and cursor pagination. Binding rows record evidence progress only. A cohort leaves quarantine only after every live execution-leg binding and exact item binding passes the same-account/mode/application/authorization/control reconciliation predicate; partial-leg or partial-item proof is never cohort release.

### O.9 Fixed-total pledge aggregate and plan

#### `fixed_total_pledges`

Key columns: `id`, `tenant_id`, `commitment_party_id`, `currency`, `commitment_date`, `origin`, `current_term_version_id`, `current_plan_version_id`, `lifecycle_state` (`open|ended_by_donor|superseded|tombstoned`), `authority_review_state` (`clear|under_review|quarantined|resolved`), `revision`, `superseded_by_id`, `created_by`, `created_at`.

The total lives in the term version, not a mutable header counter. Promise lifecycle, authority review, internal release, and fulfillment are separate axes. Fulfilled/partially fulfilled/open progress is derived from the cursor-qualified D11/D18 fold and may reverse through exact D11 inverses; it is never an authoritative lifecycle transition.

#### `fixed_total_pledge_lines`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `designation_id`, `original_amount_minor`, `currency`, `sort_order`, `introduced_at`, nullable `introduced_by_term_version_id`. Stable line identities are append-only. The initial set records the original allocation; a donor-authorized later term may append a new stable line for a newly introduced designation, then include it in that and later term-line versions. Existing line identity/history never changes or disappears merely because a later version assigns it zero remaining amount.

#### `fixed_pledge_term_versions`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `version`, `promised_total_minor`, `currency`, `effective_from`, `instruction_actor_id`, `representative_authority_id`, `evidence_ref`, `reason`, `terms_hash`, `supersedes_version_id`, `created_by_command_id`.

Unique pledge/version. Append-only. Line-level version entries conserve the header total by designation and preserve prior identity.

#### `fixed_pledge_term_line_versions`

Key columns: `id`, `tenant_id`, `fixed_pledge_term_version_id`, `fixed_total_pledge_line_id`, `designation_id`, nullable `giving_campaign_id`, `amount_minor`, `currency`, `supersedes_term_line_version_id`.

Unique term version/pledge line. Sum equals the term version total. `giving_campaign_id` is an explicit, nullable, same-tenant promise attribution and is never inferred from designation. Original line identity persists while donor-authorized amount, destination, or campaign changes append versions.

#### `fixed_pledge_plan_versions`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `fixed_pledge_term_version_id`, `version`, `plan_shape` (`none|one_date|even|custom`), `base_remaining_minor`, `named_total_minor`, `undated_total_minor`, `date_generation_rule`, `giving_timezone`, `source_fulfillment_cursor`, `source_resolution_cursor`, `evidence_ref`, `supersedes_version_id`, `created_by_command_id`, `created_at`.

Unique pledge/version. Composite same-tenant FKs bind the exact term version and shared command. `named + undated = base_remaining_minor`, where the base is reconstructed from the bound term plus frozen fulfillment/resolution cursors under target locks. Later fulfillment/resolution affects effective remaining without editing the version.

#### `fixed_pledge_unscheduled_balance_lines`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `plan_version_id`, `fixed_total_pledge_line_id`, `fixed_pledge_term_line_version_id`, `designation_id`, nullable `giving_campaign_id`, `amount_minor`, `currency`, `fulfillment_target_id`, `state`, `superseded_by_id`, `revision`.

These are the explicit typed D11 targets for genuinely undated pledge remainder, including a total-only/no-plan pledge. Sum equals the plan version's undated total. They have no fabricated date and cannot become late, enter a dated forecast, or generate a reminder.

#### `fixed_pledge_expectations`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `plan_version_id`, `ordinal`, `scheduled_for date`, `expected_total_minor`, `currency`, `state`, `superseded_by_expectation_id`, `review_policy_version_id`, `review_basis` (`mailed_manual|hand_delivery_cash|structured_feed`), `review_basis_evidence_ref`, nullable `structured_source_version_id`, nullable `structured_source_sla_snapshot_hash`, `review_after_at timestamptz`, `review_timezone`, `review_resolver_version`, `revision`.

Named expectations require a date, a composite same-tenant `review_policy_version_id` FK, a closed review basis with evidence, and a frozen, reconstructable policy-derived `review_after_at`, timezone, and resolver version; structured-feed rows additionally require an approved same-tenant structured-source-version FK and source-specific SLA snapshot. The undated balance is not represented by a fake dated row. Unique plan/ordinal and plan/date/ordinal. Past dates are valid with explicit attention state. A later review-policy version never rewrites existing expectation dates or review instants.

#### `fixed_pledge_expectation_lines`

Key columns: `id`, `tenant_id`, `fixed_pledge_expectation_id`, `fixed_total_pledge_line_id`, `fixed_pledge_term_line_version_id`, `designation_id`, nullable `giving_campaign_id`, `amount_minor`, `currency`, `fulfillment_target_id`, `revision`.

Sum child lines equals expectation total, enforced in the create/amend command. D11 targets these immutable lines.

#### `fixed_pledge_resolution_operations`

Key columns: `id`, `tenant_id`, `commitment_command_id`, `fixed_total_pledge_id`, `operation_type` (`donor_change|donor_end|internal_release|release_inverse|correction|tombstone_successor|authority_quarantine|authority_resolution`), `evidence_ref`, `before_fold`, `after_fold`, `created_at`.

#### `fixed_pledge_resolution_entries`

Signed target-level entries: `id`, `tenant_id`, `resolution_operation_id`, `target_kind` (`undated_remainder|expectation_line|term_line`), nullable `fixed_pledge_unscheduled_balance_line_id`, nullable `fixed_pledge_expectation_line_id`, nullable `fixed_pledge_term_line_version_id`, `amount_minor`, `effective_date`, `reason_code`, `inverse_of_entry_id`.

Exactly one typed target ID is non-null, matches `target_kind`, and uses a composite same-tenant FK. The shared command enforces the D18 formula, authorization, idempotency and lock order. Unique semantic inverse prevents double restoration. JSON before/after is audit convenience; entries and canonical sources authorize the fold.

### O.10 Commitment-related roles

#### `commitment_representative_authorities`

Key columns: `id`, `tenant_id`, `representative_party_id`, `represented_party_id`, nullable `recurring_commitment_id`, nullable `fixed_total_pledge_id`, `purpose_code`, `action_scope`, `effective_from`, `effective_to`, `status`, `evidence_ref`, `asserted_by`, `verified_by`, `revoked_by`, `reason`, `command_id`.

At most one commitment target is non-null; both null means Party-wide scoped authority. Every populated target uses a composite same-tenant FK and must belong to the represented Commitment Party. Exclusion/command constraints prevent overlapping duplicate active authority at the same grain. These rows grant no provider/collection capability.

#### `commitment_service_contacts`

Key columns: `id`, `tenant_id`, nullable `recurring_commitment_id`, nullable `fixed_total_pledge_id`, `purpose_code`, `contact_point_id`, `recipient_party_id`, `priority`, `is_primary`, `effective_from`, `effective_to`, `source`, `evidence_ref`, `command_id`.

A CHECK requires exactly one commitment target and composite same-tenant FKs. Partial/exclusion uniqueness permits at most one current primary per commitment/purpose. Contactability/consent remains Phase 6 truth and is resolved at use time.

#### `commitment_expected_remitters`

Key columns: `id`, `tenant_id`, `target_kind` (`recurring_occurrence_line|fixed_expectation_line|fixed_unscheduled_balance_line`), nullable `recurring_occurrence_line_id`, nullable `fixed_pledge_expectation_line_id`, nullable `fixed_pledge_unscheduled_balance_line_id`, `remitter_party_id`, `source`, `confidence_code`, `effective_from`, `effective_to`, `evidence_ref`, `command_id`.

A CHECK requires exactly one target ID matching `target_kind`; composite FKs enforce the tenant. This table is suggestion evidence only and is never consumed as automatic D11 authority without an independent approved structured mapping.

### O.11 Fulfillment

#### `recurring_fixed_pledge_links`

Key columns: `id`, `tenant_id`, `recurring_commitment_id`, `fixed_total_pledge_id`, `fixed_total_pledge_line_id`, `allocation_rule` fixed to `fixed_plan_capacity_order_v1`, `allocation_rule_version`, `authority_type`, `authority_evidence_ref`, `effective_from`, nullable `effective_to`, `created_by_command_id`, nullable `superseded_by_id`, `created_at`.

Composite same-tenant FKs bind both separate aggregates and the exact fixed pledge line. Currency/designation/Party authority is re-proved on create and at roll-up. V1 permits at most one effective fixed-pledge link for a recurring line on any civil date; overlapping links are rejected rather than splitting one recurring application across several pledges. This row grants no collection authority. Derived fixed-pledge coverage reads the one effective recurring application and never consumes contribution capacity again.

#### `recurring_fixed_pledge_coverage_allocations`

Key columns: `id`, `tenant_id`, `recurring_fixed_pledge_link_id`, `recurring_fulfillment_entry_id`, `fixed_total_pledge_id`, `fixed_plan_version_id`, `fixed_fulfillment_target_id`, signed `amount_minor`, `currency`, `allocation_rule_version`, `source_cursor`, nullable `inverse_of_allocation_id`, `created_at`.

These append-only derived allocations preserve what a linked recurring D11 application covered under the exact effective pledge plan/target at that time. They do not consume source money or fixed-target capacity a second time. Later plan versions allocate only then-remaining capacity and never recompute historical coverage against a new plan. A D11 inverse appends one exact coverage inverse; no temporal reclassification or duplicate count is allowed.

#### `commitment_fulfillment_targets`

Key columns: `id`, `tenant_id`, `target_kind` (`recurring_occurrence_line|fixed_expectation_line|fixed_unscheduled_balance_line`), nullable `recurring_occurrence_line_id`, nullable `fixed_pledge_expectation_line_id`, nullable `fixed_pledge_unscheduled_balance_line_id`, `designation_id`, `currency`, `capacity_minor`, `target_revision`, `state`, `source_cursor`, `retired_at`.

A CHECK requires exactly one typed target; composite FKs enforce same tenant. Unique source target. `capacity_minor` is a rebuildable convenience checked against the source domain before writes. The target registry cannot be updated directly by clients.

#### `commitment_donor_fulfillment_instructions`

Immutable header for an authenticated donor's exact apply-with-this-gift direction. Key columns: `id`, `tenant_id`, `contribution_designation_line_id`, `commitment_party_id`, `authenticated_actor_id`, `authentication_context_ref`, `instruction_terms_hash`, `currency`, `source_amount_minor`, `accepted_at`, `expires_at`, `created_by_command_id`. The immutable header row is also the serialization fence: apply and revoke/expire/supersede commands lock it before folding lifecycle events, then retain that lock through the fulfillment write. No mutable status field is needed.

#### `commitment_donor_fulfillment_instruction_lines`

Exact requested allocations: `id`, `tenant_id`, `donor_fulfillment_instruction_id`, `fulfillment_target_id`, `designation_id`, `amount_minor`, `ordinal`. Positive lines sum exactly to the instruction source amount and use the source currency/designation. Composite FKs bind source line, Party, target, actor, and command to the same tenant. The donor must explicitly name each target in an authenticated, exact-term review; household, service-contact, remitter, recognition, memo, or similarity evidence cannot create this record. It is single-use authority for at most one original `apply` operation: a database uniqueness constraint on the instruction reference plus the locked command makes concurrent or repeated submissions return the already-recorded operation instead of applying twice. Expiry, revocation, supersession, or prior consumption before a new application fails closed to suggestion/manual review; a later correction does not consume or re-prove it again.

#### `commitment_structured_remittance_source_versions`

Immutable authorization/configuration for one authenticated structured source: `id`, `tenant_id`, `structured_source_key`, `version`, `source_kind`, `transport_identity_hash`, `authentication_scheme`, `schema_version`, `source_party_namespace`, `source_configuration_hash`, `authority_evidence_ref`, `effective_from`, `expires_at`, nullable `supersedes_source_version_id`, `created_by_command_id`, `created_at`. `(tenant_id, structured_source_key, version)` is unique, and `(tenant_id, structured_source_key, id)` is a unique composite-FK target for mappings and authority heads. A supersession edge must remain in the same tenant and source key, point to an earlier version, and cannot form a cycle.

This stores no secret. A source version is usable only after an authorized approval event and while current, unexpired, and unrevoked. Authentication is verified at ingestion against the frozen transport/principal/schema facts; a filename, uploaded spreadsheet, memo, or claimed source code is not authenticated structured remittance. The approval command locks the tenant/source-key authority head and atomically supersedes the prior winner while approving the new one. A unique current-head slot permits at most one approved current source version per `(tenant_id, structured_source_key)`; the head pointer and immutable event fold must agree or automatic application fails closed.

#### `commitment_structured_remittance_mapping_versions`

One immutable exact source-line mapping set: `id`, `tenant_id`, `structured_source_key`, `structured_source_version_id`, `external_source_line_key_hash`, `mapping_version`, `contribution_designation_line_id`, `commitment_party_id`, `designation_id`, `currency`, `source_amount_minor`, `source_observed_at`, `source_provenance_hash`, nullable `supersedes_mapping_version_id`, `created_by_command_id`, `created_at`. A composite FK requires `(tenant_id, structured_source_key, structured_source_version_id)` to name that exact source version, so the duplicated key is immutable, validated, and usable in database constraints rather than trusted denormalization. `(tenant_id, structured_source_key, external_source_line_key_hash, mapping_version)` is unique, and `(tenant_id, structured_source_key, external_source_line_key_hash, id)` is a unique composite-FK target for supersession and mapping heads. A supersession edge must stay within that same tenant/key/line identity, point to an earlier mapping version, and remain acyclic.

#### `commitment_structured_remittance_mapping_lines`

Exact allocations under the mapping set: `id`, `tenant_id`, `structured_remittance_mapping_version_id`, `fulfillment_target_id`, `amount_minor`, `ordinal`. Lines are positive, same tenant/currency/designation/Commitment Party, unique per target, and sum exactly to the authenticated source line. Mapping approval locks the source-line authority head and atomically supersedes its prior winner. A unique current-head slot permits at most one approved current mapping per `(tenant_id, structured_source_key, external_source_line_key_hash)`, even across source-version rotation. A mapping version is eligible for automatic application only while the apply transaction holds the source head and then mapping head locks, their expected revisions match, its source version and mapping version are both the current approved head winners and unrevoked, the immutable event folds agree with those heads, the observed source identity/provenance matches, the contribution line is exact, and every target/revision/capacity still passes. A revoked or superseded mapping can no longer authorize unstarted work and never rewrites a prior application; correction uses the exact D11 correction contract.

#### `commitment_structured_remittance_authority_heads`

Small tenant-scoped serialization registry for the two authority grains. Key columns: `tenant_id`, `head_kind` (`source|mapping`), `structured_source_key`, nullable `external_source_line_key_hash`, nullable `current_source_version_id`, nullable `current_mapping_version_id`, `revision`, `last_authority_event_id`, `updated_at`. An exclusive-arc CHECK makes source heads omit the line hash and point only to a source version, while mapping heads require the line hash and point only to a mapping version. Unique keys are `(tenant_id, structured_source_key)` for source heads and `(tenant_id, structured_source_key, external_source_line_key_hash)` for mapping heads. Composite FKs keep every pointer in the same tenant/key. Approval, revocation, expiry, and supersession lock this row, require `expected_revision`, append the immutable lifecycle event, and update the pointer/revision in one transaction. The registry is rebuildable and continuously checked against the event fold; it serializes concurrent winners but never replaces the evidence or event history.

#### `commitment_fulfillment_authority_events`

Append-only authority lifecycle: `id`, `tenant_id`, `subject_kind` (`donor_instruction|structured_source_version|structured_mapping_version`), nullable `donor_fulfillment_instruction_id`, nullable `structured_source_version_id`, nullable `structured_mapping_version_id`, `event_type` (`approved|revoked|superseded|expired`), `effective_at`, `reason_code`, `evidence_ref`, `commitment_command_id`, `semantic_idempotency_key`, `created_at`. Exactly one typed composite same-tenant subject FK matches the kind. `(tenant_id, semantic_idempotency_key)` is permanently unique, and replay returns the first event/outcome. Donor instructions are accepted by their authenticated command and use events only for later invalidation; source and mapping versions require explicit approval. Approval and supersession of one authority grain are one locked atomic transition, so no crash or concurrent command can leave two winners or no intended winner. Current authority is the deterministic event fold corroborated by the current-head registry, never a mutable boolean on a version row.

#### `commitment_fulfillment_operations`

Key columns: `id`, `tenant_id`, `commitment_command_id`, `contribution_designation_line_id`, `operation_type` (`apply|inverse|retract_vector|reapply`), nullable `application_authority_type` (`provider_lineage|authenticated_donor_instruction|structured_remittance_mapping|staff_confirmed_manual`), nullable `provider_lineage_evidence_ref`, nullable `donor_fulfillment_instruction_id`, nullable `structured_remittance_mapping_version_id`, nullable `staff_application_authority_evidence_ref`, nullable `correction_evidence_type` (`source_full_reversal|source_partial_reversal|source_designation_correction|staff_fulfillment_correction`), nullable `source_correction_journal_ref`, nullable `staff_correction_evidence_ref`, nullable `reapplies_after_operation_id`, `certainty` (`automatic_proven|staff_confirmed`), `source_revision`, `created_at`.

Two disjoint exclusive arcs prevent application and correction authority from being conflated. `apply|reapply` requires exactly one current `application_authority_type` and its matching reference, forbids all correction fields, and re-proves that authority under the same source/target locks as capacity. Provider lineage, donor instruction, and structured mapping may use `automatic_proven` only after their exact proof path passes; `staff_confirmed_manual` requires the command's current capability/instruction evidence and can use only `staff_confirmed`. The operation's entries must equal the frozen instruction/mapping allocation set when one is referenced. `reapply` additionally requires `reapplies_after_operation_id` and cannot reuse a consumed donor instruction.

`inverse|retract_vector` instead forbids every application-authority field and requires exactly one correction reference appropriate to `correction_evidence_type`. Source reversal/designation correction types point to an immutable same-tenant Phase 13 canonical journal/correction fact; staff fulfillment correction points to immutable, capability-bound staff correction evidence. A database compatibility CHECK permits `inverse` only with `source_full_reversal|source_designation_correction|staff_fulfillment_correction` and permits `retract_vector` only with an ambiguous `source_partial_reversal`. Canonical source-correction operations require `automatic_proven`; staff fulfillment corrections require `staff_confirmed`. Therefore an ambiguous partial reversal cannot be disguised as an exact inverse, and an exact full reversal cannot be weakened into uncertainty.

The correction-target junction below names every original operation in scope. Full inverse entries reference and negate the exact effective original entries selected by the canonical correction once. `retract_vector` references and negates the complete uncertain effective allocation vector across every affected operation, then leaves any surviving amount unmatched. These operations never re-prove or reuse the original application authority, so its expiry, revocation, supersession, or consumption cannot block correction. Composite same-tenant FKs, permanent semantic idempotency, and unique correction-fact/original-entry semantics prevent duplicate or cross-tenant correction.

#### `commitment_fulfillment_entries`

Key columns: `id`, `tenant_id`, `fulfillment_operation_id`, `fulfillment_target_id`, signed `amount_minor`, `currency`, `target_revision`, `inverse_of_entry_id`.

All entries in an operation share source/currency/tenant. Effective applied total may not exceed effective source money or target capacity. Index both source history and target history. Inverses link exact originals.

#### `commitment_fulfillment_correction_targets`

Complete typed membership for a correction operation: `id`, `tenant_id`, `correction_operation_id`, `original_operation_id`, `ordinal`, `created_at`. The operations table exposes the supporting unique typed FK target `(tenant_id, id, operation_type, contribution_designation_line_id)`. Composite same-tenant FKs therefore require the correction operation to be `inverse|retract_vector`, every original to be `apply|reapply`, and every row to share the correction's contribution designation line without relying on a cross-table CHECK. `(tenant_id, correction_operation_id, original_operation_id)` and `(tenant_id, correction_operation_id, ordinal)` are unique. Every correction has at least one target. Under source/target locks, an `inverse` target set and its `inverse_of_entry_id` rows must equal every still-effective original entry selected by the canonical full/certain correction fact; a `retract_vector` target set and entry rows must equal the whole still-effective uncertain vector selected by the canonical partial-correction fact, including when that vector spans several prior operations. No original entry may be negated twice for one correction identity, and a correction cannot omit an affected operation merely because its application authority is no longer current.

#### `commitment_match_suggestions`

Non-authoritative staff worklist: `id`, `tenant_id`, `contribution_designation_line_id`, `fulfillment_target_id`, `producer`, `producer_version`, `evidence_summary`, `confidence_code`, `state`, `source_cursor`, `expires_at`. Suggestions can be regenerated/killed per producer and never create applications themselves.

### O.12 Reminder governance

#### `fixed_pledge_reminder_policy_versions`

Key columns: `id`, `tenant_id`, `version`, `maximum_profile` (`unavailable|upcoming_only|upcoming_and_followup`), `communication_delivery_profile_version_id`, `locale_policy`, `template_binding_version`, `candidate_local_time`, `giving_timezone_snapshot`, `tzdb_version`, `resolver_version`, `effective_from`, `effective_to`, `created_by`, `reason`.

The composite same-tenant delivery-profile FK resolves the Phase 6 governed sender identity and reply-to contact point; Phase 16 does not invent sender configuration. V1 channel is fixed to email. `candidate_local_time` and the frozen zone/tzdb/resolver deterministically turn each calendar candidate day into an instant; DST gaps advance to the first valid instant on the same civil day and overlaps choose the earlier offset. No per-pledge stage/cadence/channel configuration. Policy expansion is prospective; narrowing immediately suppresses incompatible unsubmitted candidates.

#### `fixed_pledge_reminder_enrollments`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `plan_version_id`, `service_contact_id`, `purpose_code`, `policy_version_id`, `state` (`on|off|superseded|no_future_stage`), `terms_snapshot_hash`, `enrolled_by`, `enrolled_at`, `stopped_at`, `stop_source`, `revision`.

Unique current enrollment per pledge/plan/purpose. Enrollment is impossible without at least one current named expectation and an eligible purpose-bound contact. A plan change supersedes the enrollment; the new plan remains Off until staff explicitly reviews and enrolls it. Expectation-specific stages are candidates under that current-plan enrollment, not separate enrollments.

#### `fixed_pledge_reminder_candidates`

Key columns: `id`, `tenant_id`, `fixed_total_pledge_id`, `enrollment_id`, `plan_version_id`, `expectation_id`, `stage` (`upcoming|source_aware_followup`), `candidate_at`, `candidate_semantic_key`, `communication_plan_occurrence_token`, `communication_plan_occurrence_token_schema_version`, `communication_member_occurrence_slot_token`, `communication_member_occurrence_slot_token_schema_version`, `state`, `claim_token`, `claim_expires_at`, `suppression_reason`, nullable `communication_plan_occurrence_id`, nullable `communication_intent_id`, `last_evaluated_at`, `source_cursor`.

`fixed_total_pledge_id` has a composite same-tenant FK and must match the enrollment/plan/expectation chain. The `reminders` domain and this candidate row are the sole durable D19 writer and owner of `candidate_semantic_key`, the original plan/member token bytes, and their schema versions. `candidate_semantic_key` is Phase 16's permanent domain dedupe identity; it is not supplied to or copied into Phase 6 as an intent key. The plan-occurrence token is separate from the member token and remains stable even for this one-member plan or an intentional zero-member result. For a Live reminder contract, the candidate persists and re-emits both original token bytes and schema versions across retry, N/N-1, and rollback. The `communications` adapter receives those values read-only, validates and submits the complete envelope atomically, and records only Phase 6's returned references; it cannot mint, rotate, replace, or separately persist a D19 candidate token. If the exact reminder key is Reserved, evaluation moves the source candidate to `suppressed` with reason `catalog_reserved`, creates no Phase 6 state, and never reopens it after later activation; a future eligible occurrence gets its own new candidate. `communication_plan_occurrence_id` and `communication_intent_id`, when present, are the exact same-tenant durable identities returned by Phase 6 after it derives and locks its own parent/member slots and comparison hashes; Phase 16 never receives, invents, stores, or owns those hashes. Permanent unique `(tenant_id, fixed_total_pledge_id, plan_version_id, expectation_id, stage)` via stored candidate-key components. Exact replay reuses both tokens; a legitimate new source occurrence or meaning uses a fresh plan token, and a legitimate new recipient/channel-step successor uses a fresh member token. State: `candidate`, `claimed`, `submitted`, `suppressed`, `expired`, `canceled`, `indeterminate`; provider delivery state remains Phase 6. Candidate evaluation cannot force submission.

### O.13 Projections and health caches

#### `commitment_health_snapshots`

Key columns: `id`, `tenant_id`, `subject_kind` (`recurring_line|recurring_cohort|fixed_total_pledge`), nullable `recurring_commitment_id`, nullable `recurring_billing_cohort_id`, nullable `fixed_total_pledge_id`, `evaluator_version`, `policy_bundle_hash`, nullable `recurring_policy_version_id`, nullable `review_policy_version_id`, `primary_statement`, `attention_reasons`, `next_review_at`, `source_cursors`, `subject_revision`, `freshness_state`, `computed_at`.

Exactly one subject ID is non-null, matches `subject_kind`, and uses a composite same-tenant FK. One partial unique index per subject kind/evaluator identifies the current snapshot. CAS only. Rebuildable and never command authority.

#### `missionary_support_period_projections`

Key columns: `id`, `tenant_id`, `missionary_party_id`, `designation_scope_hash`, `period_kind`, `period_start`, `period_end`, `giving_timezone`, `currency`, `received_minor`, `planned_received_minor`, `planned_processing_minor`, `planned_upcoming_minor`, `planned_recovery_attention_minor`, `planned_not_received_minor`, `monthly_equivalent_numerator`, `monthly_equivalent_denominator`, `source_cursors`, `projection_version`, `privacy_policy_version`, `freshness_state`, `computed_at`.

Unique exact metric grain `(tenant_id, missionary_party_id, designation_scope_hash, period_kind, period_start, period_end, currency, projection_version, privacy_policy_version)`.

#### `missionary_recurring_line_projections`

Key columns: `id`, `tenant_id`, `missionary_party_id`, `recurring_commitment_id`, `donor_display_label`, `donor_reference`, `designation_display_label`, `designation_reference`, `amount_minor`, `currency`, `cadence_code`, `original_creation_date`, `original_anchor_date`, `current_anchor_date`, `last_successful_date`, `next_scheduled_date`, nullable `final_eligible_date`, nullable `pause_kind` (`bounded|indefinite`), nullable `pause_resume_date`, `lifecycle_statement`, `schedule_statement`, `payment_statement`, `attention_reasons`, `latest_occurrence_outcome`, `donor_notice_delivery_statement`, `source_cursors`, `projection_version`, `privacy_policy_version`, `freshness_state`, `computed_at`.

Unique current projection `(tenant_id, missionary_party_id, recurring_commitment_id, projection_version, privacy_policy_version)`. All missionary projections are server-built after privacy filtering. They are read-only, cursor-paginated, and may be fully rebuilt from authoritative facts.

#### `missionary_other_commitment_projections`

Key columns: `id`, `tenant_id`, `missionary_party_id`, `commitment_kind` (`manual_recurring|fixed_total_pledge`), nullable `recurring_commitment_id`, nullable `fixed_total_pledge_id`, `party_display_label`, `designation_display_label`, nullable `amount_minor`, `currency`, nullable `cadence_code`, nullable `expected_date`, nullable `matched_gift_date`, nullable `promised_total_minor`, nullable `fulfilled_minor`, nullable `released_minor`, nullable `remaining_minor`, `review_statement`, `source_cursors`, `projection_version`, `privacy_policy_version`, `freshness_state`, `computed_at`.

Exactly one typed commitment FK is non-null and matches `commitment_kind`; all references are composite same-tenant. This read-only, role-safe projection builds H.5's conditional **Other commitments** section without polluting the primary online-recurring list. It contains no payment credentials, provider facts, service-contact details, reminder state, or mutation controls.

#### `commitment_successor_links`

Key columns: `id`, `tenant_id`, `predecessor_kind` (`recurring_line|fixed_total_pledge`), nullable `predecessor_recurring_commitment_id`, nullable `predecessor_fixed_total_pledge_id`, `successor_kind` (`recurring_line|fixed_total_pledge`), nullable `successor_recurring_commitment_id`, nullable `successor_fixed_total_pledge_id`, `reason_code`, `authority_evidence_ref`, `created_by_command_id`, `created_at`.

Exclusive typed composite same-tenant FKs bind each side. A link records an authorized semantic successor or correction across the two product types; it transfers no money, fulfillment, collection authorization, status, or Party ownership and cannot create a cycle. Old and new aggregates retain independent histories.

### O.14 Cross-table invariant enforcement

Migrations and command services must implement and test these invariants explicitly; comments or application convention are insufficient:

1. A group has one tenant, Commitment Party, currency, legal-payer context, and collection-authorizer context. Line/cohort insertion re-proves those values; a mismatch requires a new group. The context hash is never accepted as financial authorization.
2. A cohort has one collection arrangement and one logical compatible schedule. Ordinary schedule versions have exactly one `primary` leg; twice-monthly versions have exactly `day_1` and `day_15`. A deferred constraint or same-transaction finalizer rejects every incomplete or extra topology.
3. A provider-automatic cohort has account/mode/rail/merchant/authorization proof, a current same-tenant authorization-terms pointer, and exactly one current executor binding per live leg. At the effective boundary, each binding's authorization-terms ID equals that pointer and its account/mode/rail/merchant/currency scope equals the cohort and terms. A manual/external cohort has none of those provider fields, authorization pointers, bindings, attempt rows, retry incidents, or provider queue work.
4. Every provider-automatic live leg has exactly one current provider item binding for every effective member line and no extra item. Twice-monthly therefore has two complete item sets. A domain saga may be temporarily reconciling after partial provider response, but it cannot become active/reconciled until topology is complete.
5. A line has at most one effective cohort membership on a date. A scheduled occurrence, including a today-start initial gift that fulfills the scheduled slot, has one leg and one immutable line snapshot for every effective member. Its schedule-version-independent semantic key prevents stale/new materializers from creating the same cohort/leg/date slot twice. Only a future-start or off-slot `initial_out_of_series` occurrence has no leg. Every initial occurrence is unique per checkout command/cohort regardless of kind.
6. Line term and schedule epoch agree at every effective boundary. The epoch is authoritative calendar truth; the term is the matching donor-disclosure snapshot; the cohort schedule is an executable projection accepted only when every member epoch is equivalent. Any disagreement fails closed or splits the cohort.
7. Provider account, mode, application, merchant, customer, subscription, invoice, item, mandate, and operation identities are unique only within their correct scoped composite key. Metadata, array order, customer match, or unscoped provider ID never routes authority.
8. A provider-renewal attempt requires verified provider evidence and null `product_command_id`; a product-triggered attempt requires an allowed trigger kind, command, and exact provider-operation child. Every checkout cohort freezes exactly one initial-execution mode. In `executor_invoice` mode, one exact `provision_executor` operation owns the initial attempt and no `create_payment` operation may exist. In `product_triggered` mode, one exact `create_payment` operation owns the initial attempt and every executor-provisioning operation must be proven non-charging. Database checks reject both owners, no owner, opposite combinations, and any attempt for manual/external collection. A multi-effect command is complete only when every child operation is reconciled.
9. D11 source and target capacities conserve under the authority-fence → source → sorted-target lock order. `apply|reapply` has exactly one closed current application-authority type/reference; automatic provider lineage, donor instruction, and structured-remittance mapping each independently re-prove tenant/Party/currency/designation/capacity/current authority, while incomplete or revoked evidence can only suggest. Instruction/mapping allocation rows equal the operation entries. `inverse|retract_vector` has no application-authority field and instead requires one compatible canonical correction-evidence type/reference plus the complete typed set of affected prior operations and exact original entries; it does not re-prove stale application authority. Fixed-pledge term lines, named expectations, and undated lines conserve their owning totals. Signed corrections identify exact originals and cannot apply twice. One recurring application consumes source capacity once; a linked fixed-pledge coverage allocation is an append-only temporal roll-up, never a second consumption, and v1 permits only one effective fixed link per recurring line/date.
10. Pause, review, role, resolution, communication-intent, and provider-control histories are immutable facts. Review instants are reconstructable from frozen policy/basis/timezone/resolver evidence. A cohort leaves control quarantine only when every live leg/item binding passes proof.
11. Current pointers and cached counters are revision/CAS-protected conveniences. Authoritative epochs, commands, evidence, attempts, applications, resolutions, reminder meanings, and control facts remain append-only and rebuildable.
12. Every command subject is a typed same-tenant FK; every provider effect is an exact scoped child operation. Every credential-lineage, authorization, review-policy, RLS, SECURITY DEFINER, worker claim, cache key, idempotency key, outbox key, projection key, and export reference includes or server-resolves tenant scope. Rail/account/mode and cross-tenant poison tests must fail at both service and database layers.

## Canonical Transition Matrices

### P.1 Recurring intent

| From                              | Command/evidence                                                      | To                                            | Required side effects and guards                                                                                 |
| --------------------------------- | --------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| None                              | accepted checkout + initial card success or ACH activation acceptance | `ongoing` or `pending_activation`             | Persist group/lines/epoch/cohort/auth/executor/initial occurrence atomically; never mark funded from form submit |
| `pending_activation`              | provider-confirmed success + reconciled binding                       | `ongoing`                                     | Post/receipt once; activate future executor                                                                      |
| `pending_activation`              | failed/action-required/return                                         | remains pending or superseded failed checkout | No D7; no future unattended collection; donor repair path                                                        |
| `ongoing`                         | skip named occurrence                                                 | `ongoing`                                     | Append suppression; no grid change/debt                                                                          |
| `ongoing`                         | bounded/indefinite pause                                              | `paused`                                      | Append pause fact; prove/safely track provider suppression; materialize due suppressed occurrences               |
| `paused`                          | authorized resume/valid boundary                                      | `ongoing`                                     | Preserve grid; no immediate gift unless separately confirmed; reconcile provider                                 |
| live state                        | donor/staff cancel                                                    | `cancellation_requested` then `canceled`      | Record immediately; stop new Asym work; provider confirmation required for final canceled claim                  |
| `ongoing`                         | final eligible date passed and all eligible occurrences resolved      | `ended_as_scheduled`                          | No new occurrence/retry; preserve history                                                                        |
| any mutable live state            | genuine owner/merchant/material identity change                       | `superseded`                                  | Create fresh group/line/auth/binding; no in-place transfer                                                       |
| `canceled` / `ended_as_scheduled` | restart request                                                       | unchanged old record + new record/epoch       | Fresh authorization and executor as applicable; never resume old mandate in place                                |

Intent never moves to Lapsed from payment failures. Provider/control/health transitions do not overwrite this table.

### P.2 Occurrence execution and payment finality

These are separate folds. An execution transition never manufactures payment finality, and a late/retried/settled payment never moves the occurrence's scheduled date or future grid.

| Execution state | May enter from / leave to                                                                                                                                          | Forbidden claim                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `planned`       | Schedule materialization; may move to `suppressed`, to `claiming` for a closed product trigger, or directly to `submitted` from verified ordinary-renewal evidence | Not money or guaranteed support; manual/external remains expectation-only                               |
| `suppressed`    | Pause/skip/safety/control/activation/end fence; terminal unless the exact temporary reason clears while its future window remains open                             | Not donor/payment failure; no catch-up                                                                  |
| `claiming`      | Exclusive initial/D7/D10 product claim; moves to `submitted`, or back to planned only when provider attempt absence is proved and the window remains open          | Never manually drives an ordinary provider renewal; job start alone consumes nothing                    |
| `submitted`     | Provider accepted a permitted product command or verified ordinary-renewal evidence arrived; remains through processing/recovery, then closes with exact reason    | Not received until the independent payment/ledger fold proves success                                   |
| `closed`        | Exact evidence proves `succeeded`, `missed`, `reversed`, `manual_fulfilled`, `ended`, or `superseded`; late correction appends evidence and recomputes projection  | Never reopened by method save/later gift; prior facts remain; a missed amount is not debt or backcharge |

| Payment state     | May enter from / leave to                                                                                                | Forbidden claim                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| null              | No provider attempt/payment evidence, including every manual/external occurrence; may enter any evidenced provider state | Not failed, processing, or received                         |
| `processing`      | Provider accepted but finality is pending; may move to succeeded, failed, reversed, or indeterminate                     | ACH/card processing is not receipt or cash                  |
| `failed`          | Exact attempt failure; may remain while bounded recovery exists or move only from later exact evidence                   | Not debt and not automatically a closed missed occurrence   |
| `action_required` | Provider/rail evidence requires donor-present action; may move from exact completion/failure evidence                    | No unattended retry                                         |
| `indeterminate`   | Provider acceptance/outcome is unknown; may move only from exact reconciliation evidence                                 | No overlapping attempt or failed/success message            |
| `succeeded`       | Provider-confirmed payment finality; may move to reversed only through authoritative provider/reversal evidence          | Does not itself claim ledger posting; no schedule re-anchor |
| `reversed`        | Return/refund/chargeback exact inverse                                                                                   | Never delete original success                               |

### P.3 Card incident and failure episode

| Condition                                                      | Incident/episode action                                                                                                                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| First established retry-permitted soft failure, episode absent | Open episode + trigger incident; materialize D7 slots                                                                                                                 |
| Trigger or cycle soft failure, D7 slots remain                 | Incident `recovering`; occurrence health Recovery in progress                                                                                                         |
| Slot actual attempt succeeds                                   | Close incident succeeded and resolve episode immediately                                                                                                              |
| All slots expired/consumed/suppressed and no in-flight         | Close occurrence Missed; close incident exhausted; later cycle remains eligible if under 3                                                                            |
| Later normal soft failure with cycles consumed < 3             | Increment cycle atomically; open cycle incident and D7 slots                                                                                                          |
| Fourth and later normal soft failure                           | No incident/slots; one ordinary attempt then Missed                                                                                                                   |
| Hard/credential stop/action required/unknown                   | No unattended slots; park applicable lineage and require action/reconcile                                                                                             |
| Genuine new/corrected authorization                            | Resolve episode with evidence; rolling attempt ledger remains                                                                                                         |
| Same-card/token/updater churn                                  | No reset                                                                                                                                                              |
| Rolling/provider safety lacks headroom                         | Suppress accelerated first; normal may become Suppressed — safety only after required provider-side protection is proved before its window; no payment execution/debt |

### P.4 ACH recovery

| From                                                                            | Evidence/action                            | To                                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- |
| Normal entry `processing`                                                       | provider pending                           | processing; initiation confirmation only                             |
| Processing                                                                      | confirmed success                          | success; post/receipt once                                           |
| Normal entry                                                                    | R01/R09 + all provider/ODFI proof          | `recovery_open`; donor may review one-use recovery                   |
| Recovery open                                                                   | donor exact-term authorization + all gates | grant claimed, provider command, then indeterminate/success/failure  |
| Any noneligible return or missing proof                                         | terminal Missed/action required            | No old-occurrence retry; schedule-only + optional separate gift      |
| Success                                                                         | late return                                | append financial/application/receipt inverse; update normal runway   |
| Third normal soft return or 180-day boundary without normal success/new lineage | future collection parked                   | Preserve grid and intent; no automatic collection until valid repair |

### P.5 Provider control

| From                       | Evidence                                                               | To                                       |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Managed                    | timeout/429/5xx/lag only                                               | Degraded observation                     |
| Any                        | known future requirement/deadline                                      | Control at risk                          |
| Any reachable              | action capability restricted                                           | Control restricted for affected actions  |
| Any                        | deauth/wrong identity/ownership unknown/financial-boundary uncertainty | Control unknown; immediate command fence |
| Degraded                   | current proof restored, no financial indeterminate                     | Managed                                  |
| Unknown/restricted/at risk | apparent same binding restored                                         | Reconciling only                         |
| Reconciling                | all K.5 predicates pass per cohort                                     | Managed for that cohort                  |
| Any                        | another application/operator owns executor                             | Externally controlled/read-only          |
| Any                        | different account/merchant/mode/application selected                   | no transition; formal cutover workflow   |

Control state is evidence-derived; operators cannot manually set Managed. Closing an incident is blocked while any stop/control proof or exception remains unresolved.

### P.6 Fixed-total pledge and reminder

| Operation/evidence           | Promise/plan result                                    | Money/executor/reminder result                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Record total, no plan        | Open pledge + undated remaining capacity               | No money, payment instrument, recurring executor, or reminder enrollment                                                                                                                       |
| Add/amend plan               | New plan/expectation version                           | No charge; old fulfilled/past facts preserved; enrollment version fences                                                                                                                       |
| Donor change                 | New term version; any supplied plan amendment separate | No implicit refund/charge; increase without plan becomes undated                                                                                                                               |
| Donor end                    | Effective donor-ended entries over remaining capacity  | Existing money preserved; reminder candidates suppressed; any separately linked recurring commitment/executor is unchanged unless its own donor-authorized stop was requested and later proved |
| Internal release             | Organization-only release entries                      | Donor promise preserved; no money/accounting effect; any separately linked recurring collection remains unchanged                                                                              |
| Release inverse              | Exact restoration entries                              | No donor change or automatic collection restart                                                                                                                                                |
| Correction                   | Superseding facts or tombstone+successor               | D11/money changes only through their own inverse; never cross tenant                                                                                                                           |
| Authority dispute            | Quarantine                                             | Exclude forecast/reminders; preserve history                                                                                                                                                   |
| D11 fulfillment              | Fold may reach fulfilled                               | Does not mutate promise/plan; candidates suppress at send-time proof                                                                                                                           |
| Reminder enrollment          | Current plan/contact explicitly bound                  | Off → On only through exact setup; expectation stages remain candidates and no send occurs yet                                                                                                 |
| Policy narrowed/contact stop | Enrollment/candidate fenced/stopped                    | No pledge change                                                                                                                                                                               |

## Capabilities and Role Matrix

Capabilities are exact dot-delimited verbs registered through the Phase 12 permission foundation; no legacy blanket role grants the whole surface. The keys below are binding unless the Phase 12 registry already has an equivalent exact key at implementation time, in which case the congruence change must name and prove the mapping. Operator capability is only the first D15 gate: it never supplies Party instruction, representative authority, cardholder/account-holder authorization, or collection consent.

| Capability                                           | Permitted operations                                                                                                  | Explicitly not granted                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `commitments.view_detail`                            | Role-safe recurring/fixed staff detail                                                                                | Restricted payment/evidence internals                                                                 |
| `commitments.record_manual`                          | Record manual recurring/fixed intent with D14/D15 evidence                                                            | Payment authorization or money posting                                                                |
| `commitments.manage_recurring`                       | Prepare/apply eligible recurring changes, including protective stop/reduce and an authorization-pending widening case | Provider admin, widening without the real authorizer, raw credentials                                 |
| `commitments.manage_recurring_policy`                | Version the closed cadence catalog and bounded recovery profile; preview prospective and live-narrowing effects       | Current-gift mutation, provider settings, or safety-ceiling expansion                                 |
| `commitments.manage_review_policy`                   | Version bounded manual/offline review timing and proven structured-feed review windows                                | Promise dates, debt, payment failure, lifecycle, or fulfillment writes                                |
| `commitments.manage_fixed`                           | D17 plan and donor-authorized D18 changes/end                                                                         | Internal release or correction by implication                                                         |
| `commitments.release_expectations`                   | Exact organization-only release/inverse                                                                               | Donor end, money write, or stop of a separately linked recurring executor                             |
| `commitments.apply_corrections`                      | Proof-bound same-identity correction/tombstone successor                                                              | Intent change disguised as correction                                                                 |
| `commitments.review_authority`                       | Open/resolve proof-bound commitment authority quarantine and record its evidence                                      | Donor term change, correction by implication, or collection authorization                             |
| `commitments.apply_fulfillment`                      | Preview/apply/invert exact D11 source-to-target fulfillment under capacity locks                                      | Contribution posting, recognition, guessed matching, or source duplication                            |
| `commitments.manage_structured_remittance_authority` | Version, approve, supersede, or revoke authenticated structured sources and exact source-line mappings after preview  | Posting money, applying fulfillment, approving heuristic mappings, or bypassing source authentication |
| `commitments.manage_service_contacts`                | Purpose-bound service-contact versions                                                                                | Representative/payment authority or portal grant                                                      |
| `commitments.manage_expected_remitters`              | Record/revoke evidence-backed expected-remitter hints                                                                 | Automatic fulfillment, promise ownership, or payment authority                                        |
| `commitments.verify_representative_authority`        | Verify/revoke scoped D14 authority                                                                                    | Collection authorization                                                                              |
| `commitments.manage_reminders`                       | Enroll/stop within tenant D19 maximum                                                                                 | Force-send, cadence/template editing                                                                  |
| `commitments.manage_reminder_policy`                 | Version tenant reminder maximum, Phase 6 delivery-profile binding, locale and eligible template binding               | Per-pledge enrollment, direct send, consent bypass, or arbitrary journeys                             |
| `commitments.run_recurring_recovery`                 | Stop an incident or assist an authorized donor-present D7/D10 action                                                  | Add attempt budget, silently authorize, or bypass proof                                               |
| `payments.operate_provider_control`                  | D16 incident/reconciliation/cutover controls                                                                          | Donor-intent mutation or tenant crossing                                                              |
| `payments.view_restricted_evidence`                  | Minimum necessary provider/return/authority evidence                                                                  | Missionary/donor disclosure or credential access                                                      |
| `missionary_support.view`                            | Designation/anonymity-safe H projections                                                                              | Any mutation, contact/payment/provider detail                                                         |
| `commitments.export`                                 | Governed, purpose-bound role-safe commitment reports/exports through the Phase 3/12 egress meter                      | Restricted evidence, credentials, hidden identity, or mutation                                        |

Donors can read/manage only commitments whose Party/portal-claim rules authorize them. A service contact, expected remitter, household member, recognition Party, or provider customer match grants no portal access. Missionaries are always read-only. Background workers use narrowly scoped service roles and repeat tenant/account/mode/capability predicates; service-role bypass never substitutes for command validation.

## Module, Command, and API Contracts

### Q.1 Module ownership

New implementation belongs under a cohesive `packages/api/src/commitments/` domain, divided by business ownership rather than UI:

| Module                       | Owns                                                                                                                                   | Must not own                                                                                                                                                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recurring/aggregate`        | group/line/epoch/cohort planning and commands                                                                                          | Provider SDK calls or communication sends                                                                                                                                                                                                                                  |
| `recurring/schedule`         | pure civil-date resolver/materializer                                                                                                  | Database/network/time reads                                                                                                                                                                                                                                                |
| `recurring/execution`        | occurrence materialization, ordinary-renewal preflight/fences, event reconciliation, and explicitly product-triggered payment commands | Manually submitting provider-automatic ordinary renewals or retry-policy inference in adapters                                                                                                                                                                             |
| `recurring/recovery/card`    | D7/D8 incidents, slots, episode/pressure evaluation                                                                                    | ACH logic                                                                                                                                                                                                                                                                  |
| `recurring/recovery/ach`     | D10 return families, grants, runway                                                                                                    | Card retry logic                                                                                                                                                                                                                                                           |
| `recurring/providers/stripe` | versioned Stripe mapping, commands, retrieval/reconciliation                                                                           | Product lifecycle, health, or tenant policy                                                                                                                                                                                                                                |
| `recurring/control`          | D16 evidence fold/incidents/reconciliation/cutover                                                                                     | Donor intent or money posting                                                                                                                                                                                                                                              |
| `fixed`                      | pledge/plan/term/D18 resolution aggregate                                                                                              | Automatic payment engine                                                                                                                                                                                                                                                   |
| `fulfillment`                | D11 conserved operations and suggestions                                                                                               | Contribution posting or recognition                                                                                                                                                                                                                                        |
| `health`                     | pure D12 evaluator and projections                                                                                                     | Domain writes/notifications                                                                                                                                                                                                                                                |
| `reminders`                  | D19 policy/enrollment/candidates and sole durable D19 candidate semantic-key plus raw plan/member-token ownership                      | Consent/delivery/rendering or Phase 6-derived hashes                                                                                                                                                                                                                       |
| `communications`             | D9 candidate/token ownership; Live-only D19 whole-plan submit adapter; Reserved source suppression                                     | Minting/replacing/persisting D19 tokens; Phase 6 coordination header, binding/plan resolution, occurrence/compilation/member/semantic/command hashes, consent/suppression, templates, dispatch, provider delivery, provider-envelope idempotency, or communication history |
| `projections`                | donor/staff/missionary role-safe read models                                                                                           | Write authorization                                                                                                                                                                                                                                                        |

Phase 13 owns contribution headers/designation lines/postings and provider-confirmed money. Phase 6 owns communication consent/delivery. Phase 14 owns recognition. Phase 15 is the only offline-money entry front door. Phase 16 calls those typed services; it does not duplicate their tables or writers.

### Q.2 Common command envelope

Every financial or intent mutation accepts a server-created/authenticated envelope equivalent to:

```ts
type CommitmentCommandEnvelope<T> = {
  tenantId: string;
  actorId: string;
  requestId: string;
  idempotencyKey: string;
  expectedRevision: number;
  previewToken: string;
  payloadVersion: number;
  payload: T;
};
```

The client never supplies trusted tenant, capability, Party authority, provider account/mode, action classification, amount totals, or current revision. The server resolves and compares them. `previewToken` is opaque, short-lived, single-purpose, hash-stored, and bound to actor/tenant/exact terms/source cursors. Apply returns a durable `operationId` and one of `applied`, `awaiting_authorization`, `processing`, `indeterminate`, `rejected`, or `reconciliation_required` plus role-safe facts. A timeout is recovered with the role-appropriate read-only GET operation resource; the UI never generates a fresh key and resubmits blindly. Guest checkout receives a separate opaque, tenant/session-bound status token that grants only that operation's safe status.

### Q.3 Public service commands

| Command                                                                           | Required input/result contract                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `previewRecurringCheckout`                                                        | Policy, cart lines, Party/session, cadence/start/end, rail intent → exact groups/cohorts/legs, Today/Next/Then, next 3 dates, total plus exact initial charge count/amount/allocation, terms version, errors, preview token; no write/provider call                                                                    |
| `submitRecurringCheckout`                                                         | Valid preview + provider-owned method/authorization result + idempotency → accepted-agreement saga, one adapter-capability-selected initial-execution mode, and exactly one initial actual contribution per disclosed automatic cohort; exact per-charge card/ACH/unknown results                                      |
| `previewManualRecurringCommitment` / `createManualRecurringCommitment`            | Party/line/terms/review-basis evidence → expectation-only group/line/cohort/occurrences under `commitments.record_manual`; no payment method, authorization, executor, attempt, receipt, or cash claim                                                                                                                 |
| `previewRecurringChange`                                                          | Selected line(s), requested fields/action, actor/authority → D15 outcome, cohort/leg split plan, projected dates, immediate-charge truth, authorization need                                                                                                                                                           |
| `applyRecurringChange`                                                            | Valid preview/authorization → append command/epoch/membership/terms, frozen source-owned confirmation and provider saga; communication follows the D9 lifecycle gate: zero Phase 6 work while Reserved, Live-only whole-plan submission, never a child intent, delivery claim without evidence, or historical catch-up |
| `previewRecurringPolicyChange` / `applyRecurringPolicyChange`                     | Exact cadence/recovery change + current version → Current/After impact, prospective expansion or immediate safety narrowing, then append one policy version; never mutate current gifts or provider settings                                                                                                           |
| `previewCommitmentReviewPolicyChange` / `applyCommitmentReviewPolicyChange`       | Bounded manual/offline review change + current version → affected future expectation classes and frozen existing behavior, then append one policy version; never move promise dates or claim debt/failure                                                                                                              |
| `previewFixedPledgeReminderPolicyChange` / `applyFixedPledgeReminderPolicyChange` | Exact reminder maximum/Phase 6 delivery-profile/template-eligibility change + current version → Current/After candidate impact, then append one policy version; narrowing fences immediately and widening never resurrects stopped/expired work                                                                        |
| `skipRecurringOccurrence`                                                         | Exact future occurrence + preview → suppression only if unclaimed/eligible/current                                                                                                                                                                                                                                     |
| `pauseRecurringLines` / `resumeRecurringLines` / `cancelRecurringLines`           | Exact lines and dates/evidence → D5/D16 truth; no catch-up or false provider-stop claim                                                                                                                                                                                                                                |
| `stopCardRecoveryIncident`                                                        | Incident/actor → suppress unstarted slots; schedule intact                                                                                                                                                                                                                                                             |
| `tryCardOccurrenceNow`                                                            | Exact incident/slot, authorization if needed → atomic slot substitution, not extra gift                                                                                                                                                                                                                                |
| `authorizeAchOccurrenceRecovery`                                                  | Exact R01/R09 preview + donor action → one-use grant or complete schedule-only fallback                                                                                                                                                                                                                                |
| `materializeAndPreflightRecurringOccurrences`                                     | Worker tenant/account shard, planning horizon, now, lease → bounded deterministic named occurrences and eligibility/control fences; no provider call inside the database transaction and no ordinary-renewal submission command                                                                                        |
| `claimProductTriggeredRecurringCommands`                                          | Worker tenant/account shard, allowed trigger kind, now, lease → bounded D7/donor-present/proof-valid-D10 commands plus only initial cohorts frozen to `product_triggered`; never an executor-owned initial invoice or ordinary subscription renewal                                                                    |
| `executeProductTriggeredRecurringCommand`                                         | Claimed allowed command + current proof → one provider-neutral payment execution or suppression/indeterminate fact; rejects `ordinary_renewal`                                                                                                                                                                         |
| `ingestRecurringProviderEvent`                                                    | Verified event/account/mode → dedupe, immutable evidence, exact reconciliation; no metadata routing                                                                                                                                                                                                                    |
| `reconcileRecurringBinding`                                                       | Binding/incident checkpoint → current object/event/ledger/control proof and leg/cohort-safe release/exception                                                                                                                                                                                                          |
| `previewProviderControlAction` / `applyProviderControlAction`                     | Closed D16 protective-fence, assignment, reconcile, same-binding restore, or formal-cutover action → exact affected set/proof/Current/After; no manual Managed override or donor-intent mutation                                                                                                                       |
| `previewFixedTotalPledge` / `createFixedTotalPledge`                              | Party/total/lines/date/evidence/optional plan → exact conserving preview, then atomic pledge/plan/targets, no money/reminder                                                                                                                                                                                           |
| `previewFixedPledgePlanChange` / `applyFixedPledgePlanChange`                     | Exact current term/fold/cursors plus proposed one-date/even/custom/no-plan version → conserving named/undated targets under `commitments.manage_fixed`; concurrent fulfillment forces a fresh preview                                                                                                                  |
| `previewFixedPledgeOperation` / `applyFixedPledgeOperation`                       | One D18 operation → exact current/after fold and conserved append-only result                                                                                                                                                                                                                                          |
| `previewCommitmentFulfillment` / `applyCommitmentFulfillment`                     | Effective contribution line, named targets, current application authority or compatible canonical correction evidence with complete affected-operation/entry set → exact conserved preview then locked apply/reapply/inverse/vector-retract under `commitments.apply_fulfillment`                                      |
| `previewStructuredRemittanceSource` / `applyStructuredRemittanceSource`           | Authenticated source principal/transport/schema/current evidence + action → immutable source version and approval/revocation event under `commitments.manage_structured_remittance_authority`; no secret or money write                                                                                                |
| `previewStructuredRemittanceMapping` / `applyStructuredRemittanceMapping`         | Exact authenticated source line, contribution line, Party/designation/currency and target allocations + action → conserving immutable mapping version and approval/revocation event; no heuristic approval or fulfillment side effect                                                                                  |
| `previewCommitmentAuthorityReview` / `applyCommitmentAuthorityReview`             | Typed commitment/dispute evidence/current revision → quarantine or proof-bound resolution under `commitments.review_authority`; no correction, term, money, or collection side effect                                                                                                                                  |
| `previewCommitmentRoleChange` / `applyCommitmentRoleChange`                       | Closed service-contact, representative-authority, or expected-remitter action → exact typed target/effective range/evidence; server maps to the corresponding exact capability and appends/revokes only that role                                                                                                      |
| `evaluateCommitmentHealth`                                                        | Versioned facts/policy/cursors/as-of → pure D12 result                                                                                                                                                                                                                                                                 |
| `enrollFixedPledgeReminder` / `stopFixedPledgeReminder`                           | Current plan/eligible expectations/contact/policy → exact plan enrollment or purpose-contact reduction                                                                                                                                                                                                                 |
| `claimReminderCandidates` / `proveAndCompileReminderPlanOccurrence`               | Bounded due shard + exact source/fence and persisted tokens → D9 lifecycle gate, then Live-only Phase 6 compilation or terminal `catalog_reserved` source suppression; no catch-up                                                                                                                                     |
| `proveAndCompileRecurringCommunicationPlanOccurrence`                             | Named D9 transition + exact domain candidate/source/tokens/bounded candidates → D9 lifecycle gate, then Live-only Phase 6 plan/intent identities or terminal Reserved source suppression; no direct send, per-child commit loop, or historical catch-up                                                                |
| `previewCommitmentExport` / `requestCommitmentExport`                             | Purpose, typed fields/filter, role projection and current privacy/egress budget → bounded asynchronous export or explicit denial under `commitments.export`; no raw model serialization                                                                                                                                |

Twice-monthly planning returns one logical cohort with two execution legs and two continuing-executor mutation plans, plus at most one separately disclosed initial cohort payment attempt. A line add/change must plan and reconcile both exact item bindings atomically at the domain level; partial provider success becomes explicit repair, never a one-leg “complete” claim.

For a provider-automatic leg, the configured provider subscription owns each ordinary renewal. Asym materializes the named occurrence, pre-proves or fences its eligibility, and reconciles the provider-generated invoice/payment back to that occurrence; it must not also create a one-time PaymentIntent or manually submit the renewal. Product-triggered payment execution is closed to the per-cohort initial gift, D7 accelerated or donor-present recovery, proof-valid D10 recovery, and any future adapter topology whose separate authoritative contract proves that the product must initiate ordinary collection. Protective stop/change commands use their dedicated adapter operations. A manual/external cohort materializes expectation/fulfillment occurrences only and never enters any provider-payment claim queue.

### Q.4 HTTP and server-action surface

Use the repo's server-mediated data-access boundary. Exact framework wiring may be a thin route or server action, but these resource semantics are fixed:

- extend REAL `POST /api/donate` with a versioned recurring payload and the existing required `Idempotency-Key`; it remains the one checkout submission front door;
- guest checkout status uses read-only `GET /api/donate/operations/{operationId}?status_token=...`, bound to the original tenant/session and opaque operation token; it returns stable state/reason/reference only and never mutates or exposes another charge;
- authenticated donor/staff operation recovery uses read-only `GET /api/donor/commitment-operations/{operationId}` and `GET /api/admin/commitment-operations/{operationId}` with actor/tenant/capability projection checks;
- donor reads under `GET /api/donor/commitments`, `GET /api/donor/commitments/recurring/{lineId}`, and `GET /api/donor/commitments/fixed/{pledgeId}` return only portal-authorized projections;
- donor mutations use `POST /api/donor/commitments/{lineId}/preview` then `POST /api/donor/commitments/{lineId}/commands`; GET never mutates;
- donor command confirmation uses role-safe `GET /api/donor/commitment-commands/{commandId}` and returns the frozen result plus monotonic provider/Phase 6 evidence; it never re-applies or exposes sibling-line facts;
- a donor fixed-pledge change request uses `POST /api/donor/commitments/fixed/{pledgeId}/change-requests`; it records a tenant/Party-bound service request and evidence only, never mutates pledge terms before the D18 authorization-bound staff command;
- pending recurring authorization uses scanner-safe read-only `GET /api/recurring-authorization/{challengeId}?token=...` and single-use deliberate `POST /api/recurring-authorization/{challengeId}/accept`; the server re-proves challenge, authorizer, terms, command, revision, expiry and token before accepting;
- staff reads use `GET /api/admin/commitments/{kind}/{id}`; staff previews/commands use analogous CSRF-protected POST endpoints and exact capability checks;
- tenant policy reads use `GET /api/admin/commitment-settings`; each of recurring, review, and reminder settings uses a typed `POST /api/admin/commitment-settings/{policy}/preview` then `/commands` pair with its exact policy capability and current version;
- fixed pledge creation uses `POST /api/admin/commitments/fixed/preview` then `/commands`, preserving one command service;
- D11 staff application uses `POST /api/admin/commitment-fulfillment/preview` then `/commands`;
- governed reports/exports use `POST /api/admin/commitments/exports/preview` then `/requests`, with `commitments.export`, Phase 3/12 projection, purpose, metering, audit, redaction and asynchronous status/download authorization;
- missionary support uses read-only `GET /api/missionary/support?period=calendar-month|next-30-days|next-12-months`, cursor-paginated `GET /api/missionary/support/recurring`, and conditional cursor-paginated `GET /api/missionary/support/other-commitments`; the 12-month response is an exact dated occurrence schedule with explicit timezone/currency, source cursors, freshness and privacy-before-aggregation rather than a monthly-normalized promise;
- provider webhooks continue through verified Stripe webhook entrypoints but call one shared ingestion service; multiple app routes do not duplicate domain handling; and
- worker routes/functions are not public browser APIs and require internal authentication plus explicit tenant/account shard.

Every mutation requires origin/CSRF protection, authenticated session or narrow signed token, `Idempotency-Key`, content-type/size limits, server tenant resolution, and rate/abuse controls. Donor financial actions use recent authentication or narrow reauthentication according to risk. Signed email links may only read; purpose-stop POST tokens can only narrow communication.

Responses use stable reason codes plus plain copy, never raw provider errors. Categories are `validation`, `stale_preview`, `authorization_required`, `capability_denied`, `provider_control`, `already_in_flight`, `indeterminate`, `safety_suppressed`, and `reconciliation_required`. Unknown errors return a durable reference and preserve the case.

### Q.5 Provider adapter contract

The Stripe adapter implements provider-neutral operations with explicit capability results:

```ts
interface RecurringProviderAdapter {
  preflightExecutor(input: BindingScope): Promise<ControlEvidence>;
  createAcceptedAgreement(
    input: AcceptedAgreementPlan,
  ): Promise<ProviderCommandResult>;
  changeExecutionLeg(
    input: ExecutionLegMutationPlan,
  ): Promise<ProviderCommandResult>;
  submitProductTriggeredPayment(
    input: ProductTriggeredPaymentPlan,
  ): Promise<ProviderCommandResult>;
  stopFutureCollection(input: StopPlan): Promise<ProviderCommandResult>;
  retrieveCurrentBinding(input: BindingScope): Promise<ProviderBindingSnapshot>;
  reconcileAttempt(input: AttemptScope): Promise<ProviderAttemptEvidence>;
}
```

Each result is accepted/succeeded, action-required, retry-permitted failure, do-not-retry failure, indeterminate, unsupported, or control-mismatch with restricted raw evidence. Adapter methods never mutate product state directly, classify health, send messages, create contributions, or retry under a new idempotency identity. Retrieve-after-write and webhook reconciliation are mandatory for financial commands.

`ProductTriggeredPaymentPlan.triggerKind` is a closed enum of `initial_cohort`, `card_accelerated_recovery`, `card_donor_present_recovery`, and `ach_proof_gated_recovery`. `ordinary_renewal` is deliberately absent. Before provider mutation, the accepted-agreement saga selects and freezes one supported initial-execution mode from adapter preflight and the disclosed cohort plan. In `executor_invoice` mode, `createAcceptedAgreement` provisions every required leg and exactly one designated leg owns the cohort's initial invoice PaymentIntent; `submitProductTriggeredPayment(initial_cohort)` is forbidden. In `product_triggered` mode, `createAcceptedAgreement` provisions non-charging future executors and `submitProductTriggeredPayment(initial_cohort)` owns the one initial attempt. The adapter must prove the selected branch and one occurrence/operation identity; both branches, zero branches, looping over lines, and one attempt per twice-monthly leg are forbidden.

For twice-monthly, the orchestrator calls `changeExecutionLeg` separately for `day_1` and `day_15` under one domain command/saga. An adapter may not collapse them into an interval approximation, and successful mutation of one leg does not declare the cohort reconciled.

### Q.6 Worker claims and outbox

Occurrence materialization/preflight, product-triggered recovery slot, reconciliation, health projection, fulfillment suggestion, dashboard projection, and reminder workers use bounded keyset scans with `FOR UPDATE SKIP LOCKED`, expiring leases, tenant/account shard, deterministic order, and checkpoint. Work is idempotent at permanent semantic identity. The occurrence worker never turns a provider-automatic ordinary renewal into a provider payment command, and manual/external occurrences never enter a provider queue. Provider rate/backpressure cannot starve the high-priority donor-stop queue.

Domain transactions append outbox rows in the same commit. Dispatch may repeat. A D9 domain producer owns and persists its candidate semantic key and plan/member tokens. For D19, `reminders` and `fixed_pledge_reminder_candidates` alone own and persist those values; the `communications` consumer accepts the exact reminder-owned values read-only and cannot mint, rotate, replace, or separately store them. The applicable owner dedupes its domain candidate by the Phase 16 candidate semantic key and supplies one persisted stable bounded plan-occurrence token plus original schema version, the source occurrence/fence, the complete bounded candidate envelope, and one independent persisted member token per possible recipient/channel step. Only after proving the exact key Live does the adapter call `compileAndReleaseCommunicationPlanOccurrence` exactly once—even for one or zero applicable members—and record the returned plan-occurrence and intent identities. A Reserved key instead receives terminal `catalog_reserved` source suppression before Phase 6 and cannot be caught up after later activation. The adapter never calls a child insert repeatedly; receives, supplies, stores, or owns Phase 6's header/occurrence-slot/compilation/member/semantic/command hashes; calls an email provider; creates a `communication_event`; or derives provider-request idempotency. Phase 6 resolves the immutable binding/plan and member set, atomically releases all children, performs send-time consent/suppression, and creates each event only at the actual send seam. Provider-request idempotency belongs to the exact one-member or batch submission envelope and never aliases a Phase 16 candidate key, plan occurrence, or Phase 6 intent identity. Consumers record monotonic outcomes. Dead letters never roll back money/intent; they create a repairable exception with owner and SLO.

### Q.7 Stripe version and current-documentation gate

REAL repository state at PRD authoring is `stripe@22.2.0` with API version `2026-05-27.dahlia`. Current official Stripe documentation reviewed on 2026-07-13 describes API version `2026-06-24.dahlia`. This PRD does not silently upgrade the SDK or API version and does not assume current docs exactly match the pinned runtime.

Before implementation locks provider behavior, the owning ticket must:

1. read the installed SDK types/source and the pinned API changelog;
2. compare every used Subscription, Invoice, PaymentIntent, SetupIntent, Connect, ACH-return, retry, pause, schedule/anchor, item, event, and webhook behavior against current official docs;
3. decide and record whether to remain pinned or upgrade through the repo's Stripe-upgrade process;
4. pin account, request, webhook-endpoint, and typed-event versions explicitly;
5. update sandbox contract fixtures and replay tests for the chosen versions; and
6. prove production Connect account capabilities/configuration by readback, not docs alone.

Official current schedule documentation confirms end-of-month clamp/recovery behavior and provider timestamps are UTC, reinforcing the separation between D4 civil schedule truth and provider operational instants. Official retry documentation permits bounded custom retry configuration but has hard-decline and Connect/topology conditions; provider Smart Retries must not stack with D7. Any material behavior not provable under the pinned version is a stop condition, not a guess.

### Q.8 Provider capability matrix

| Product operation          | Required Stripe proof                                                                                                                                                                    | Fail-closed behavior                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary multi-line cohort | Multi-item subscription under exact connected account/mode; item IDs stable/retrievable; subscription demonstrably owns ordinary renewal execution                                       | Do not activate; no one-subscription-per-line or product-triggered one-time renewal fallback                                    |
| Twice-monthly cohort       | Two monthly leg subscriptions/anchors, each with exact complete item map, one logical domain saga                                                                                        | Keep arrangement pending/repair; never approximate interval or claim one-leg success                                            |
| Today-start initial gift   | Exactly one initial invoice PaymentIntent per disclosed cohort may serve as its occurrence; item/amount/finality reconciled                                                              | Being confirmed; never create a second PaymentIntent for that cohort                                                            |
| Future continuing start    | One immediate PaymentIntent per disclosed cohort plus separately authorized future executor without hidden trial/proration                                                               | Do not accept if duplicate-free cohort mapping cannot be proved                                                                 |
| Initial collection owner   | Adapter preflight proves and freezes either charge-owning executor invoice or separately product-triggered payment; every provision leg and line plan has a permanent operation identity | Do not submit until exactly one owner is provable; never permit both owners, zero owners, or a fabricated future binding target |
| Date/cadence/end change    | Exact anchor/schedule/item behavior and proration disabled; current invoice/in-flight state retrieved                                                                                    | Split/supersede or await authorization; no in-place unsafe guess                                                                |
| Pause/skip/cancel          | Provider capability affects exact executor/leg and returns retrievable stop/suppression proof                                                                                            | Record Asym intent; mark provider confirmation pending; suppress new Asym work                                                  |
| Card D7                    | Custom retry ownership, `next_payment_attempt`/Smart Retries neutralized, exact invoice reusable, advice available                                                                       | Balanced becomes zero accelerated slots for affected scope; ordinary schedule evaluated safely                                  |
| ACH activation/recovery    | Mandate/verification/processing/return evidence, supported SEC/ODFI path, exclusive R01/R09 reinitiation proof                                                                           | No receipt at processing and no old-occurrence reinitiation; schedule-only fallback                                             |
| Staff card MOTO            | Account+reader feature enabled, provider-owned capture/save, retained exact off-session terms                                                                                            | Await alternative donor authorization; never manual PAN/CVV capture                                                             |
| Recurring ACH staff assist | Supported WEB/written standing mandate and copy                                                                                                                                          | Await authorization; never use single-entry TEL as recurring                                                                    |
| Connect control/reconnect  | Signed account routing, controller/application ownership, charge architecture, capabilities, current objects/events                                                                      | Control unknown/external read-only; no replacement/adoption                                                                     |

Capability facts are versioned evidence with observed time and expiry. Cached metadata may make a UI preview faster but expired/unknown facts recheck and fail closed at command time.

## UI, Copy, and Accessibility Contract

### R.1 Checkout state/copy matrix

| Situation                    | Required visible copy/behavior                                                                                                                                                    | Forbidden                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Monthly enabled              | Monthly is featured; One time is adjacent and clear; **Other schedules** reveals enabled alternatives                                                                             | Hiding one-time, preselecting a tenant-disabled cadence, showing all eight in a crowded grid |
| Recurring amount             | Label/summarize as amount **per gift**; twice-monthly says “$X on the 1st and $X on the 15th”                                                                                     | Presenting $X as monthly total for twice-monthly                                             |
| Default start today          | **First donation: $X today** / **Then: $X [cadence], next on [date]**                                                                                                             | Ambiguous Start date or a second charge today                                                |
| Future continuing start      | **First donation: $X today** / **Recurring schedule begins: [date]** / **Then: $X [cadence]**                                                                                     | Implying no gift today                                                                       |
| No end chosen                | No question or required interaction; secondary **Set an end date**                                                                                                                | Ongoing-versus-end chooser, recommended badge, guilt copy                                    |
| End opened                   | “This is the final eligible donation date. You can change, pause, or cancel later.”                                                                                               | Blocking retention modal                                                                     |
| Multi-line/group             | Each destination/amount; total today; exact number, amount, and destination allocation of separate charges today; continuing charge count/date; twice-monthly schedule disclosure | Hidden sibling/initial charges or provider-object terms                                      |
| Card success                 | **Donation received** + receipt/next date                                                                                                                                         | “Pending” or duplicate schedule activation                                                   |
| Card action required/failure | Exact safe action; no receipt/received claim                                                                                                                                      | Raw decline/network details or active-success claim                                          |
| ACH processing               | **Bank donation initiated — awaiting confirmation** + next schedule pending activation                                                                                            | “Received,” “Paid,” or official receipt                                                      |
| Provider unknown             | **We’re confirming your donation. Do not submit again.** + status check                                                                                                           | Retry/resubmit button                                                                        |

The final review always names tenant/organization, Party-safe donor identity, line destinations, amount/currency, rail/masked method, fee cover separately, schedule timezone, next three dates, optional final date, cancellation/manage path, and exact submit effect. A common one-charge button may say **Donate $X and start recurring giving**. If multiple initial charges are required, the action and immediately adjacent review say **Donate $X today in N charges and start recurring giving**, then list each charge without exposing internal cohort terminology. The UI must not expose “subscription,” “PaymentIntent,” “invoice,” “cohort,” “epoch,” or “execution leg” to donors.

### R.2 Donor recurring detail matrix

| Projection state                   | Headline                                                                                                             | Available actions                                                                                                |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Ongoing/healthy                    | **Recurring donation** + next scheduled date                                                                         | Change, skip next, pause, cancel                                                                                 |
| D7 active                          | **We’ll try this scheduled gift again** + exact remaining candidate dates                                            | Update method, Try this scheduled gift now when eligible, Stop retries for this missed gift, pause/cancel future |
| Action required                    | **Action needed to continue automatic gifts**                                                                        | Complete required action/update authorization; pause/cancel                                                      |
| Missed, future continues           | **This scheduled gift was not received. It will not be added later.** + next ordinary date                           | Give once separately, update future method, pause/cancel                                                         |
| Paused bounded                     | **Paused — Resumes on [date]** + next grid gift                                                                      | Resume/change/cancel                                                                                             |
| Paused indefinite                  | **Paused indefinitely**                                                                                              | Resume/change/cancel                                                                                             |
| Cancellation pending control proof | **We recorded your request to stop future donations.** Provider stop not yet confirmed; any processing gift separate | View status/contact support; no false completed claim                                                            |
| Provider control unknown           | **Organization is checking this automatic donation**                                                                 | Safe stop request; widening/edit actions unavailable with reason                                                 |
| Ended/canceled                     | Exact historical outcome and last successful gift                                                                    | Start a new recurring donation; no Resume old agreement                                                          |

The detail always separates original creation, original anchor, current next date, last successful gift, latest occurrence, cadence/amount, optional final date, pause/cancel, payment method safe display, and schedule history. Changes preview at least the next three dates and whether anything charges today. Pending provider work is immutable in the UI. After apply, the same flow ends on a bookmarkable confirmation page with the frozen effective arrangement, next three dates, final-date truth, any in-flight non-effect, provider-sync state, and evidenced confirmation-delivery state. Refreshing that page reads the original command result; it cannot submit the command again.

### R.3 Staff service-desk matrix

One page presents current truth first, then **Manage recurring support**. It shows Party/roles, line/cohort/leg composition in plain operational language, intent, schedule, occurrence/payment, collection/recovery, control/reconciliation, last/next dates, no-catch-up balance, authorization, and audit without collapsing them.

| Outcome                 | Banner/CTA                                                              | Completion truth                                                       |
| ----------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Apply now               | **Ready to apply** / **Apply changes**                                  | Domain result plus any provider sync status                            |
| Complete with donor now | **Donor authorization needed now** / **Confirm with donor now**         | Applied only after exact terms accepted and provider/domain reconciled |
| Awaiting authorization  | **Prepared — waiting for authorization** / **Send secure confirmation** | Nothing wider takes effect; expiration/repair shown                    |
| Collection blocked      | **Collection blocked** / **Stop collection** or exact repair action     | Intent, provider stop proof, and in-flight work remain separate        |
| Indeterminate           | **Being confirmed — do not retry**                                      | Durable operation reference and reconciliation owner                   |
| Stale preview           | **This recurring donation changed while you were reviewing it**         | Show canonical diff; require a fresh review                            |

Legal/rail copy is progressively disclosed and plain language. Verification happens once per interaction where safe. Stop/reduce/pause/cancel is not buried behind authorization copy intended for increases. There is no raw object JSON in the main workflow; restricted evidence is a separate capability-gated view.

### R.4 Provider-control incident UX

The first screen order is incident truth, impact, urgent donor-stop work, safe action, then evidence:

- plain control state and incident stage;
- started/last verified times;
- masked account/mode/application/charge architecture;
- affected agreement count and per-currency due-before-boundary amount;
- cancellation/stop queue and in-flight/indeterminate count;
- owner and backup; and
- one safe next action.

Never show deceptive **Pause all** or **Resume all**. Missionary projection copy is **Organization is checking this automatic donation** and, for an affected cancellation, **Ending — organization confirmation in progress**. Future affected support is **Needs organization attention**, not dependable expected support.

### R.5 Fixed pledge UI matrix

| Surface                                      | Required behavior/copy                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create, no plan                              | **No expected dates recorded**; “No dated expectations or plan-based reminders will be created”; **No automatic charges**                                                                                                                                              |
| Add plan                                     | One date / Even installments / Custom; named/undated conservation always visible                                                                                                                                                                                       |
| Partial custom                               | Explicit **Leave $X without an expected date**                                                                                                                                                                                                                         |
| Staff detail                                 | Promised; Received and applied; Released internally; Remaining expected; Named dates; Without expected date                                                                                                                                                            |
| Change/close                                 | Four unselected choices; only chosen fields; Current/After review; exact result CTA                                                                                                                                                                                    |
| Reduction below fulfillment                  | **Applied above current commitment**; no implied refund/credit                                                                                                                                                                                                         |
| End with separately linked recurring support | Ending the fixed pledge does not stop the recurring agreement. The review separately names whether a donor-authorized recurring stop was not requested, requested and pending provider proof, or proved. Never imply the fixed pledge owns an executor/payment method. |
| Donor view                                   | **Campaign commitment**, progress, request change; no debt/invoice/internal release language                                                                                                                                                                           |
| Missionary view                              | Conditional **Other commitments** only; promised/fulfilled/released/remaining; no monthly normalization                                                                                                                                                                |
| Reminder enrollment                          | **Set up reminders** → current plan/eligible-expectations/contact review → **Turn on pledge reminders**                                                                                                                                                                |

### R.6 Tenant policy settings

Authorized tenant administrators get one simple **Commitment settings** page with three plain-language cards, not a policy DSL:

1. **Recurring options and recovery** — enabled schedules, Monthly featured when enabled, and Balanced or Off recovery within platform limits.
2. **Review timing** — bounded mailed, hand-delivery, and proven structured-feed windows for when manual/offline expectations need staff review.
3. **Fixed-pledge reminders** — Off, Upcoming only, or Upcoming + one follow-up, with one governed Phase 6 email delivery profile, locale, deterministic local send time, and eligible template binding.

Each card shows the current effective version, a concise explanation, and **Review changes**. The review shows Current and After, exactly which future records use the new version, which existing commitments remain grandfathered/frozen, and which already-unstarted work a safety reduction suppresses immediately. Apply is one clear confirmation with a reason and durable result. A stale version shows the canonical diff and requires a fresh review. Expanding recovery or reminders is prospective; narrowing takes the D7/D19 live safety effect already specified. The page exposes no provider retry toggles, raw thresholds outside the bounded controls, arbitrary cadences, journeys, or template editors. Users without the exact policy capability get a role-safe read-only explanation or no card, never a disabled control that implies permission.

### R.7 Accessibility and error prevention

WCAG 2.2 AA is a release gate. Financial/legal submissions provide a concise editable review and outcome-specific action. Required proof includes:

- native labels, fieldsets, radio groups, date input alternatives, tables/lists, headings, and buttons;
- complete keyboard use with logical focus order and visible focus;
- linked error summary plus identical inline errors; input preserved after error;
- programmatic status; polite live regions for progress, urgent alerts only for immediate risk, and no focus theft;
- status meaning in text/icon, never color alone; forced-colors support;
- 320 CSS-pixel reflow, 200%/400% zoom, text spacing, virtual keyboards, long names/currencies/translations, and no horizontal financial-form dependence;
- reduced motion; no time pressure except security expiry with warning/extension where safe;
- screen-reader verification on NVDA/Chrome and VoiceOver/Safari; and
- real usability/comprehension sessions with infrequent nonprofit staff, donors, and missionaries.

Test participants must correctly explain what charges now, what happens next, whether a payment succeeded, what pause/cancel/end/release changes, what remains in flight, and what does not change. Completion time alone is insufficient.

## Security, Privacy, and Data-Access Invariants

1. Active tenant comes only from authenticated server context. Tenant IDs in URLs, bodies, provider metadata, jobs, or cache values are treated as untrusted assertions and must match.
2. Signed top-level Stripe Connect `event.account` and `livemode` route provider events. Verify the endpoint signature before parsing trusted data. Metadata cannot select tenant/account/mode.
3. Every provider/customer/subscription/item/invoice/payment/method/mandate reference is scoped by tenant, connected account, mode, connection epoch, and expected application/ownership. Wrong-scope lookup is a security incident, not Not Found fallback.
4. RLS and composite FKs prevent horizontal tenant access even if an API check fails. Internal service functions accept explicit tenant and re-check capabilities; never use a default tenant.
5. Staff, donor, missionary, worker, and communication DTOs are purpose-specific. The richest internal model is never serialized and filtered in the browser.
6. Provider payment components/tokenization keep Asym out of raw credential storage. CVV is never persisted. Sensitive call recordings pause/redact; evidence references have separate encryption, access, retention, and audit.
7. Party/contact/authority/recognition/remitter relationships do not infer portal access. Portal claiming uses authenticated identity and explicit Party authorization.
8. Preview/apply prevents parameter substitution: terms are server-owned, exact, hashed, short-lived, and revalidated under lock. Changing any material term invalidates authorization.
9. Financial or consent mutation via GET is forbidden. CSRF, origin, recent-auth, replay, session fixation, scanner, and signed-token tests are mandatory.
10. Logs/traces exclude raw credentials, bank facts, unrestricted evidence, email token, provider payload, and hidden donor identity. Use opaque IDs and reason codes with controlled lookup.
11. Anonymity, restricted-worker policy, and designation authorization apply before aggregation. Small-cell protection prevents inference from counts/differences.
12. Exports are capability-gated, tenant-scoped, redacted by role, versioned, auditable, and provider-neutral. An export does not include secrets or convert suggestions into authoritative applications.

## Observability and Operational Contract

### S.1 Required metrics

Metrics are tagged only with bounded non-sensitive dimensions such as environment, rail, cadence tier, command/outcome reason, control state, and policy version; never donor/Party/payment IDs.

- schedule materialization due/lag, duplicate prevented, resolver version, clamp/recover/DST case;
- occurrence counts by planned/claimed/submitted/processing/succeeded/missed/suppressed/indeterminate and suppression reason;
- provider command latency/outcome, retrieve-after-write mismatch, webhook receive/processing lag, duplicate/out-of-order/gap;
- D7 candidate/claimed/actual/expired/suppressed/manual-substitution counts, 48-hour/cutoff guard, and old-invoice closure age;
- D8 episode trigger/cycle/schedule-only/reset reason, rolling product/network headroom, normal-attempt safety suppression;
- ACH processing age, return family, recovery-open/grant consumption, indeterminate age, late return, runway count/boundary;
- provider-control state age/transitions, last trusted read/event, affected/due totals by currency, stop-request age, reconciliation checkpoints/exceptions, cross-scope rejection;
- command state/age, stale preview, auth expiry, duplicate/fence, provider partial, repair age;
- D11 unmatched/suggested/applied/inverse/retracted-vector totals, capacity/conservation mismatch, projection cursor lag;
- D12 Status-updating count/age, evaluator version drift, CAS conflict/rebuild parity;
- missionary projection lag, source cursor drift, privacy suppression/coarsening, aggregate-versus-list parity;
- fixed pledge plan conservation, undated share, authority quarantine, D18 overlap/inverse/excess fulfillment, fold rebuild mismatch;
- reminder due/claimed/suppressed/submitted by reason, including `catalog_reserved`, semantic duplicate prevented, contact/consent/template/source failure, stop-token result, Phase 6 delivery state; and
- communication intent/delivery/correction transitions without open/click-as-truth.

### S.2 Alerts and hard invariants

Page or create a high-severity incident for:

- duplicate provider executor on one execution leg, missing/duplicate line item on any leg, or partial twice-monthly topology declared reconciled;
- wrong tenant/account/mode/application routing or cache/idempotency poisoning;
- provider call after occurrence/slot expiry, donor stop, pause, cancellation, final date, control-unknown fence, or safety ceiling;
- old occurrence still retryable inside the next-occurrence cutoff, or two overlapping attempts;
- payment/contribution/receipt duplication, ACH processing counted received, or late reversal not exactly inverted;
- D11 source/target over-application, cross-currency/cross-designation unauthorized application, or fold mismatch;
- cancellation/control incident closed without proof;
- stale projection used for negative outreach or mutable action;
- reminder submission without current plan/contact/consent/template/semantic proof; or
- projection rebuild differing from live effective fold.

Less urgent operational alerts cover worker lag, message bounce, unmatched provider event, policy/template drift, inaccessible evidence, and aging human-repair worklists. Alerting must be rate-limited/grouped at tenant incident or invariant type, not one page per gift.

### S.3 Runbooks and repair

Ship runbooks for:

1. duplicate/indeterminate provider attempt;
2. D7 cutoff or rolling-ceiling breach;
3. ACH late return and receipt/statement supersession;
4. provider-control incident from detect through proof-gated restoration;
5. donor cancellation while control is unknown;
6. twice-monthly one-leg partial mutation/reconciliation;
7. D11 conservation/vector-retraction exception;
8. stale health/missionary projection rebuild;
9. fixed-pledge authority dispute/correction; and
10. reminder duplicate, consent failure, template failure, or signed-stop issue.

Repair commands use the same domain services, capabilities, idempotency, locks, and audit. There is no direct SQL/provider-dashboard “fix and mark done” path. Where provider dashboard action is unavoidable, staff record/import provider evidence and reconciliation proves the result.

### S.4 Service objectives and capacity posture

Exact numeric SLOs must bind to the repo's platform SLO registry during implementation; minimum product objectives are:

- donor stop recorded synchronously even when provider unavailable;
- due occurrence and retry claims processed before their half-open windows expire under forecast peak load;
- provider webhooks/reconciliation do not cause duplicate financial effects under arbitrary replay;
- cancellation queue retains priority during tenant-wide control incidents;
- dashboard cards state freshness and never substitute zero during projection delay; and
- reminder/failure communications can be delayed safely because send-time proof prevents stale content.

Load tests cover large tenants, thousands of affected bindings in one incident, month boundaries, simultaneous recurring due windows, multi-group shared credential pressure, exact aggregate totals beyond current row limits, and bounded provider rate/backpressure. Do not add table partitioning, distributed queues, or multi-provider failover without measured evidence.

### S.5 Initial performance budgets

Measured in production-like test data, excluding third-party latency where stated:

| Seam                                 | Initial release budget                                                                                |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Pure next-3 schedule projection      | p95 ≤ 10 ms per line; deterministic batch of 100 ≤ 250 ms                                             |
| Donor/staff detail server response   | p95 ≤ 500 ms, p99 ≤ 1.5 s before provider-present action                                              |
| Missionary aggregate + first page    | p95 ≤ 750 ms, p99 ≤ 2 s at 100k authorized lines; totals independent of page size                     |
| Local preview/classification         | p95 ≤ 750 ms; provider capability refresh may return explicit Checking rather than block indefinitely |
| Local command acceptance/intent stop | p95 ≤ 1 s; provider completion is asynchronous and truthfully pending                                 |
| Verified webhook acknowledgement     | ≤ 2 s after durable intake; normalized projection p95 ≤ 60 s under normal load                        |
| Due/retry worker                     | 99.99% of eligible claims begin before their frozen expiry; zero post-expiry provider calls           |
| Cash/occurrence projection freshness | normal p95 ≤ 2 min; UI shows Updating after 5 min or source-specific SLA breach                       |
| Provider-control donor stop queue    | local record ≤ 1 s; provider work prioritized ahead of bulk reconciliation                            |

Budgets are release alarms, not reasons to weaken proof. If a budget fails, optimize indexed queries/projections/batching before relaxing safety or adding distributed architecture.

### S.6 Retention and ephemeral lifetimes

The stricter applicable predecessor, tenant contract, jurisdiction, tax, card/ACH rule, dispute/legal hold, or counsel policy always wins. Phase 16 defaults are:

- authoritative commitment terms, authorization evidence references/hashes, command/audit journals, occurrences/attempt outcomes, provider-control evidence, D18 resolutions, D11 applications/inverses, communication consent/stop and delivery evidence: seven years after the later of arrangement end or last related financial activity;
- normalized money/receipt facts: Phase 7/13 statutory retention, never shortened here;
- raw restricted provider payload/document/recording material: 90 days unless a dispute, law, or verified provider investigation requires longer; retain normalized facts and cryptographic provenance afterward;
- domain semantic idempotency keys and inverse links: for the life of the authoritative source plus its audit retention; never depend on a provider's 24-hour key window;
- preview/authorization challenge: 15 minutes by default, invalidated immediately by term/revision/authority change; counsel/provider may require shorter;
- worker/claim leases: 2 minutes with heartbeat and command-specific expiry never beyond the financial window;
- rebuildable dashboard/health caches: current plus 13 complete months, then rebuild from durable sources rather than retain as authority;
- security application logs with minimized identifiers: 30 days hot/90 days restricted archive; aggregate metrics follow platform policy; and
- communication-purpose stop preference: retained until explicitly changed under Phase 6/25 or tenant deletion policy, never expired silently.

Deletion/anonymization honors legal holds and preserves non-identifying conservation/audit requirements. A retention worker is tenant-scoped, idempotent, observable, and tested not to delete a still-referenced evidence source.

## Migration, Cutover, and Legacy Disposition

### T.1 Fresh-build posture

This product has no production users under the founder's fresh-build ruling. Phase 16 therefore replaces unsafe prototypes instead of dual-writing or carrying compatibility shims. The migration still must be explicit so development fixtures, imports, active OpenSpec changes, and provider objects cannot become accidental truth.

Use **expand → classify/shadow → reconcile → switch → contract**. New tables and read models land inert; shadow evaluators prove parity/invariants without charging or messaging; test tenants/canaries exercise full flows; writers/readers switch once; old surfaces are removed. Rollback disables new commands/workers and preserves additive journals for inspection; it never reactivates an old writer.

### T.2 Table and code disposition

| Legacy/prototype surface                                           | Disposition                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `donor_pledges`                                                    | Do not extend. Proof-backed records may classify into recurring line or fixed-total pledge, never both. Nullable tenant, status, frequency, end, counters, Stripe link, `total_expected`, and relationship fields manufacture no intent/authority/plan/fulfillment. Ambiguity remains quarantined with source/certainty. Remove old reads/writes/RLS-off table after cutover. |
| `pledge_charge_attempts`                                           | Not an occurrence/attempt authority. Import only independently verified provider evidence at its real certainty; never fabricate schedule occurrences or actual network attempts. Remove table/writers.                                                                                                                                                                       |
| legacy Stripe recurring mapper / one-line subscription assumptions | Replace with group/cohort/leg/exact-item mapping. No `items[0]`, donor×account inferred group, or one-subscription-per-line default.                                                                                                                                                                                                                                          |
| dormant checkout recurring fields/state                            | Salvage validated UI/provider primitives only; submit through the one accepted-agreement contract. Delete duplicate writer/state machine.                                                                                                                                                                                                                                     |
| whole-account Stripe Billing Portal management                     | Do not use as the authoritative recurring editor. Provider-hosted narrow payment/auth surfaces may be embedded; Asym commands and projections remain truth.                                                                                                                                                                                                                   |
| missionary first-row/ad hoc cadence math/client sums               | Replace with server metric registry and exact cursor-backed projections; remove rail/payment details and hidden row caps.                                                                                                                                                                                                                                                     |
| legacy `scheduled_gift_reminder` literal/queue                     | Supersede with D19 purpose/policy/enrollment/candidate and Phase 6/17 seam. It creates no consent or enrollment.                                                                                                                                                                                                                                                              |
| plaintext tenant Stripe keys                                       | Eliminate through the governed Connect/token/secret posture before provider-control release; never copy into Phase 16.                                                                                                                                                                                                                                                        |

External/tenant imports classify each field/link as **proved**, **hint**, or **unknown**, retain source schema/version/provenance, and never backfill consent, Party authority, legal donor, collection authorization, fulfillment, reminder enrollment, or cash. Imported executors without account/mode/application/authorization/ownership proof default to external read-only/control unknown. No historical notifications, retries, receipts, or financial side effects replay.

The classifier's evidence order is exact:

1. prove tenant/source/environment; otherwise quarantine the whole row;
2. classify **recurring commitment** only from an explicit repeating-gift agreement plus authoritative amount/cadence/Party evidence; a provider subscription corroborates execution but does not alone prove Party/intent;
3. classify **fixed-total pledge** only from explicit promise-total/Party evidence; `total_expected`, frequency, an end date, notes, or counters alone are hints;
4. if both/neither product is proved, create a provenance-tagged import-review record and no operational aggregate;
5. map schedule epochs/occurrences only from explicit civil schedule/transaction lineage; do not reverse-engineer dates from settlements;
6. classify executor control only with account+mode+application/merchant/ownership/current-object evidence; otherwise external read-only/control unknown;
7. map Party, authorizer, legal donor, service contact, remitter, recognition, and fulfillment independently; never propagate one role;
8. import only exact contribution/target links as D11 applications; aggregate coverage stays informational certainty, not authority; and
9. shadow folds and human review must reconcile before any operational enablement. Classification never sends, charges, receipts, retries, or activates reminders.

### T.3 Phase 13 published issue disposition

- Epic #690 remains the Phase 13 ledger/cart predecessor; its recurring children are not dispatchable until dated supersession is visible.
- #705 fee-cover remains mostly orthogonal but per-occurrence amounts must follow cohort/leg/item execution and authorization; configuration cannot silently change existing gifts.
- #706 retains repo-owned intent, append-only linkage, and idempotent provider events; Phase 16 supersedes one-subscription-per-line, donor×account grouping, six-state authority, `items[0]`, and unsafe cutover.
- #707 is superseded by D6–D10: no Stripe-owned Smart-Retry policy, early timer lapse, per-attempt messages, or mixed card/ACH recovery.
- #708 keeps epoch/CAS race protection and truthful display; D4/D5/D16 supersede raw UTC duration, default month hold, unconditional provider-stop claim, and single-line executor assumptions.
- #709 keeps accessible self-service, append-only commands, eligibility revalidation, and redacted reads; D2–D5/D15/D16 supersede one-line mutation/status collapse and add donor-controlled dates, exact previews, cohort/leg scope, and quarantine.
- #710 is re-scoped: recurring planned end belongs to recurring lifecycle; fixed pledge completion/release/reminder belongs to D17–D19; no automatic continuation/conversion.

Ticket authoring must name these supersessions. It may not leave two buildable definitions or dispatch the stale recurring tickets.

## Testing Strategy and Release-Blocking Acceptance Matrix

### U.1 One public-seam vertical tracer first

The first executable slice proves one real lifecycle through public seams, not isolated table creation:

1. a donor submits one explicit group with two same-currency/same-Party monthly lines;
2. the planner creates one logical cohort, one execution leg/subscription, and one exact provider item per line;
3. one initial card gift succeeds and produces one contribution with two designation lines and exact D11 applications;
4. duplicate/out-of-order provider events are no-ops;
5. a later occurrence fails softly, enters D7, succeeds on one retry, and does not drift the anchor or duplicate line money;
6. donor, staff, and missionary projections agree at their permitted detail; and
7. replay/rebuild returns identical authoritative and projection folds.

The tracer runs through real database/RLS/service/API/provider-fixture boundaries. Mock-only unit success is insufficient.

### U.2 Four invariant suites

1. **Pure calendar suite:** table/property tests over cadence, anchor, timezone, DST/tzdb, short month, leap year, start/end, epochs, twice-monthly legs, pause/skip/resume, and projected dates.
2. **Database/tenant/concurrency suite:** real Postgres migrations, RLS, composite FKs, locks/CAS, idempotency, append-only triggers, conservation, worker leases, and cross-tenant poison.
3. **Provider/control/recovery suite:** pinned Stripe contract fixtures, webhook replay, account/mode/application routing, card/ACH finality, D7/D8/D10, charge architectures, outages/indeterminate, control incidents, and cutover.
4. **Communication/projection suite:** candidate/meaning dedupe, Phase 6/17 seams, privacy-before-aggregation, freshness, delivery corrections, reminders, dashboards, and accessibility/Playwright.

### U.3 Calendar and checkout acceptance

| ID     | Required proof                                                                                                                                                                                                                                                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CAL-01 | Monthly created May 10 charges once May 10, anchors May 10, next June 10.                                                                                                                                                                                                                                                                                                                            |
| CAL-02 | Every-two-weeks created May 10 charges once then May 24. Weekly and every-four-weeks use 7/28-day grids.                                                                                                                                                                                                                                                                                             |
| CAL-03 | Future start June 1 submitted May 10 charges May 10 once, then June 1/July 1; review discloses both.                                                                                                                                                                                                                                                                                                 |
| CAL-04 | No system path silently normalizes donor anchor to 1st/15th/end-of-month.                                                                                                                                                                                                                                                                                                                            |
| CAL-05 | Jan 29/30/31 monthly clamps to February's last day then recovers the original day; leap/non-leap fixtures pass.                                                                                                                                                                                                                                                                                      |
| CAL-06 | Feb 29 annual uses documented clamp/recovery. Quarterly/semiannual preserve original anchor semantics.                                                                                                                                                                                                                                                                                               |
| CAL-07 | Twice-monthly is one group/cohort with `day_1` and `day_15` legs/subscriptions and exact item-per-line on each; it charges the full per-occurrence amount twice and never approximates an interval.                                                                                                                                                                                                  |
| CAL-08 | Tenant IANA zone, DST nonexistent/ambiguous operational time, frozen offset, and tzdb-version changes preserve civil dates and no duplicate.                                                                                                                                                                                                                                                         |
| CAL-09 | Open-ended requires no interaction. A selected inclusive final date permits an occurrence on that date and none after; retries cannot start after the boundary.                                                                                                                                                                                                                                      |
| CAL-10 | Exact policy capability and preview/version checks protect tenant cadence changes. Disable affects new checkout only; grandfathered lines render/manage. Exactly one enabled cadence is featured; it must be monthly whenever monthly is enabled, otherwise the tenant selects one other enabled cadence. Daily and arbitrary cadence codes are rejected. Existing schedule epochs remain unchanged. |
| CAL-11 | Group splits on Party, legal payer/authorizer context, or currency mismatch. Cohort splitting handles account/mode/rail/schedule/control incompatibility without group inference.                                                                                                                                                                                                                    |
| CAL-12 | Browser refresh/double submit/timeouts create one group and exactly one initial gift/provider attempt per disclosed compatible cohort, never per line or twice-monthly leg; Check status recovers each unknown charge without resubmitting.                                                                                                                                                          |
| CAL-13 | Card success receipts once; card action/failure does not. Recurring ACH processing confirms initiation but does not post, receipt, or enter received totals; later success does once, and a late return appends the exact inverse and receipt/statement supersession.                                                                                                                                |
| CAL-14 | Initial ACH still processing fences later scheduled debit; the occurrence is safety-suppressed/pending activation, with no catch-up.                                                                                                                                                                                                                                                                 |
| CAL-15 | One-cohort group creates one initial provider attempt. Multi-cohort group creates exactly one per disclosed cohort/charge; never per line. Twice-monthly creates one initial attempt for its logical cohort despite two continuing legs.                                                                                                                                                             |
| CAL-16 | Final eligible date must be on/after the first continuing occurrence. A future-start schedule ending before it is rejected; equality permits that one continuing occurrence.                                                                                                                                                                                                                         |
| CAL-17 | Initial start or later next/re-anchor date before the tenant's current civil date is rejected in both preview and locked apply with an accessible linked field error. Today/future use the explicit giving timezone; UTC/browser/provider dates cannot change the result. Historical correction is a separate non-collection operation.                                                              |
| CAL-18 | Every applied schedule amendment yields one durable, refreshable confirmation with exact effective terms, next three dates, final-date truth, immediate/in-flight non-effects, provider-sync state and evidenced Phase 6 delivery truth. Duplicate apply/webhook/refresh returns the same command and intent identity.                                                                               |

### U.4 Recurring management, recovery, and control acceptance

| ID     | Required proof                                                                                                                                                                                                                                                                                                              |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REC-01 | Skip suppresses one immutable future occurrence, preserves history/grid, and creates no debt. Claimed/in-flight occurrence cannot be skipped.                                                                                                                                                                               |
| REC-02 | Bounded and indefinite pause show exact copy; immutable open/end/supersede events rebuild the current pause; suppressed occurrences remain explainable; resume keeps grid and does not charge immediately.                                                                                                                  |
| REC-03 | Cancel records immediately; Managed provider proves stop; Control unknown shows confirmation pending. Restart creates fresh authorization/epoch, never resumes old in place.                                                                                                                                                |
| REC-04 | Schedule change shows next 3 dates and immediate-charge truth; historical anchor stays; pending provider payment stays pending. A past requested next/re-anchor date fails in preview and locked apply without changing history or attempting money.                                                                        |
| REC-05 | Cohort mutation addresses exact line item on every execution leg; no `items[0]`. One-leg partial twice-monthly mutation enters repair and never claims complete.                                                                                                                                                            |
| REC-06 | Weekly D7 has +2/+4; all other enabled cadences +2/+4/+6. 48-hour floor/DST/window/expiry never rolls a missed slot to another day.                                                                                                                                                                                         |
| REC-07 | Only evidenced actual attempt consumes budget; infrastructure retry reuses command; indeterminate reserves slot and fences overlap.                                                                                                                                                                                         |
| REC-08 | Try-now substitutes earliest remaining slot; method save alone never charges; Stop retries suppresses slots but future schedule continues.                                                                                                                                                                                  |
| REC-09 | Old command cannot start at/after next occurrence minus 48h; unresolved provider artifact by minus 24h suppresses/escalates next occurrence rather than double charge.                                                                                                                                                      |
| REC-10 | Trigger + later cycles 1,2,3 may receive D7; fourth later occurrence is ordinary-only. Monthly/weekly/quarterly/twice-monthly fixtures count occurrences, not months; cross-group claims on one credential lineage serialize in deterministic scheduled-date/instant/UUID order.                                            |
| REC-11 | Any success/new verified authorization resolves episode; same-card/token/updater/note/open does not. Historical misses remain and no old amount is backcharged.                                                                                                                                                             |
| REC-12 | Rolling 15/30×24h shared lineage ceiling across groups protects normal occurrences first; stricter live rule narrows; unsafe normal occurrence is Suppressed — safety.                                                                                                                                                      |
| REC-13 | Hard/action-required/credential-stop/unknown/control-loss never gets unattended D7. Advice scope and India/jurisdiction fixture fail closed.                                                                                                                                                                                |
| REC-14 | One ACH normal entry only. R01/R09 recovery exists only with exact provider/ODFI proof and donor one-use authorization; missing proof yields complete schedule-only path.                                                                                                                                                   |
| REC-15 | R08/unauthorized/revoked/R11/admin/hard/sensitive/unknown follow distinct reason-safe paths. Terminal Missed never reopens.                                                                                                                                                                                                 |
| REC-16 | ACH late return exactly reverses money, D11 application, receipt/statement; processing never counted received.                                                                                                                                                                                                              |
| REC-17 | ACH runway parks future auto collection when the third normal soft return is recorded or at the 180-day boundary; recovery success does not reset; new authorized lineage/normal success behaves exactly.                                                                                                                   |
| REC-18 | Recovery-start/action/terminal/mandatory/upcoming annual messages dedupe by meaning and recipient; recipient precedence follows exact legal-donor/financial-authorizer/service-contact purpose, differing line visibility redacts sibling facts, same-state retries do not message, and corrected truth appends correction. |
| REC-19 | Applicable Visa MIT notice/alternative access and other live mandatory notices override quiet period; provider ownership does not duplicate Asym sends.                                                                                                                                                                     |
| REC-20 | Degraded timeout self-recovers with no donor alarm. Deauth/wrong account/mode/application enters Control unknown and fences commands.                                                                                                                                                                                       |
| REC-21 | Direct/full-dashboard executor may keep charging after disconnect; no replacement is created and cash posts only from evidence. Destination/separate/on-behalf-of/external ownership fixtures match architecture.                                                                                                           |
| REC-22 | One large incident/paginated affected set, urgent cancel queue, owner+backup, bounded rate-aware reconciliation; no per-gift task storm.                                                                                                                                                                                    |
| REC-23 | Same-account reconnect stays Reconciling until full proof. Event gap beyond retention uses current objects/source evidence. Different-account cutover requires old-stop and fresh authorization.                                                                                                                            |
| REC-24 | Old commands never replay; a cohort remains quarantined until every live leg and item binding is proved, so partial release cannot expose unknown lines. Rollback/operator close cannot re-enable unresolved control.                                                                                                       |
| REC-25 | Provider-automatic ordinary renewal is generated only by the configured subscription and reconciled to its named occurrence; worker replay cannot create a second PaymentIntent or other one-time charge.                                                                                                                   |
| REC-26 | Manual/external recurring support materializes expected occurrence/fulfillment truth without an executor binding, payment attempt, retry incident, provider queue entry, receipt, or received-cash claim.                                                                                                                   |
| REC-27 | Exact recurring-policy capability, expected version and preview token are required. Recovery expansion affects only new incidents; narrowing suppresses unstarted candidate slots live, never exceeds platform safety, and never rewrites schedules or provider settings.                                                   |

### U.5 Fulfillment, fixed pledge, health, and reminder acceptance

| ID     | Required proof                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FUL-01 | Exact provider lineage, an authenticated donor instruction, and an approved authenticated versioned structured-remittance mapping each independently auto-apply through their closed authority type. Every path proves tenant, currency, designation, source/target capacity, and Commitment Party. Incomplete or conflicting evidence, name/amount/date/OCR, and relationships only suggest.                                                                                                                                                                                                                |
| FUL-02 | One gift can apply to several targets and several gifts to one target under source/target capacity; no cloned gift/receipt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FUL-03 | Cross-tenant/account/mode/currency/designation poison fails at DB/service. Concurrent applications conserve and deadlock retry whole transaction.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| FUL-04 | Gift Received coexists with Match Needs review; uncertainty does not block posting/receipt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FUL-05 | A canonical full reversal exact-inverts once even after the original application authority expired, was revoked/superseded, or was consumed; correction never reuses stale application authority. An ambiguous partial reversal spanning one or several prior fulfillment operations names them all, retracts the complete affected entry vector once, leaves surviving amount unmatched, opens a case, and never guesses.                                                                                                                                                                                   |
| FUL-06 | Projection lag cannot authorize; proof-only migration preserves certainty; rebuild equals live fold.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FUL-07 | One recurring line has at most one effective fixed-pledge link per date. Its D11 application consumes source capacity once; append-only coverage records preserve the exact plan/target effective then, later plans use remaining capacity only, and an inverse retracts coverage once.                                                                                                                                                                                                                                                                                                                      |
| FUL-08 | Structured-source and mapping approval, expiry, revocation, supersession, duplicate delivery, wrong principal/schema, stale target, and split-allocation fixtures fail closed. Revocation stops unstarted auto-application without rewriting a completed application; later canonical correction still exact-inverts without re-proving the revoked authority.                                                                                                                                                                                                                                               |
| FUL-09 | Concurrent source or mapping approval/supersession commands at the same exact authority grain serialize under the current-head revision: one version wins, the stale command conflicts, no two current winners exist, and replay of either semantic key returns its original outcome.                                                                                                                                                                                                                                                                                                                        |
| FUL-10 | Concurrent or repeated submission of one authenticated donor instruction records at most one original apply operation and returns that same operation on replay; a later reapply requires new current authority and cannot reuse the consumed instruction.                                                                                                                                                                                                                                                                                                                                                   |
| FUL-11 | Apply racing source/mapping revocation or donor-instruction invalidation serializes on the same authority fence: apply either commits first as valid history or observes invalidation and fails before writing. An ambiguous partial source reversal cannot pass as `inverse`, an exact full reversal cannot pass as `retract_vector`, and certainty matches the canonical source or staff evidence type.                                                                                                                                                                                                    |
| FIX-01 | Staff records total-only pledge with short form, no plan/payment/receipt/reminder. No schedule prompt.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| FIX-02 | One-date/even/custom plan conserves remaining amount; final even installment absorbs residual; partial custom requires explicit undated remainder.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FIX-03 | Destination child lines conserve each expectation using deterministic largest remainder; custom allocation only when chosen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FIX-04 | Past expected date means Past expected date, not failed payment/debt. No-plan/undated never behind or reminder-eligible.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| FIX-05 | D11 fulfillment racing plan amendment resolves under target locks/CAS with no lost history or over-capacity.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| FIX-06 | D18 formula holds for random fulfill/change/end/release/inverse orders; header projections rebuild.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FIX-07 | Reduction below fulfillment displays Applied above current commitment without refund/unapply/credit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| FIX-08 | Donor end preserves money/history and leaves any separately linked recurring agreement unchanged unless a separate donor-authorized recurring stop is requested/proved. Internal release changes no donor/money/recurring-executor/accounting truth.                                                                                                                                                                                                                                                                                                                                                         |
| FIX-09 | Wrong identity correction tombstones/links same-tenant successor; authority dispute quarantines; late gift never resurrects.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| HLT-01 | Pure evaluator returns lifecycle + multiple reasons. Unknown/stale becomes Status updating and suppresses negative outreach.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| HLT-02 | Shared cohort incident counted once; privacy filtering precedes group summary. Soft misses are At risk while future safe collection exists; later success On track now.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| HLT-03 | Exact review-policy capability, preview, append-only version, same-tenant FK, exact bounded defaults and proven structured-feed window produce a reconstructable frozen `review_after_at` with timezone/resolver evidence without moving promised date/debt. Existing expectations do not change when policy changes.                                                                                                                                                                                                                                                                                        |
| REM-01 | All tenants/pledges/imports Off. Exact reminder-policy capability, preview and append-only version are required; tenant maximum has only 3 values. Narrowing fences immediately; widening never resurrects stopped, expired or previously ineligible work.                                                                                                                                                                                                                                                                                                                                                   |
| REM-02 | Enrollment binds the current plan, requires at least one named expectation and verified purpose contact, and is superseded by a plan change; late enrollment skips; no future stage creates no inert row.                                                                                                                                                                                                                                                                                                                                                                                                    |
| REM-03 | Upcoming at 30 calendar days and follow-up at exact D12 review date; no due/third/catch-up stage. DST/date boundaries pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| REM-04 | Fulfillment, pending source, plan version, end/release/correction, contact turnover, consent/suppression, template, D16, and duplicate races re-prove immediately before submit.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| REM-05 | The Phase 16 candidate semantic key defeats duplicate domain jobs/webhooks. One separate stable plan-occurrence token serializes the complete fixed plan result, including zero members, while independent member tokens preserve recipient/channel-step identities beyond provider idempotency retention. Exact replay returns one released header/set; changed plan, binding, condition, recipient, membership, count, digest, or child input hard-conflicts without partial eligibility. A legitimate successor uses fresh applicable tokens. Delivery evidence is monotonic and never claims read/aware. |
| REM-06 | Scanner GET cannot stop/change; narrow POST/RFC8058 stops purpose only and cannot widen or cross tenant.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| REM-07 | V1 reminders are email-only. The Phase 6 delivery-profile version supplies governed sender/reply-to; frozen local time/zone/tzdb/resolver produces one deterministic candidate instant across DST.                                                                                                                                                                                                                                                                                                                                                                                                           |

**Reserved lifecycle proof.** For every Reserved Phase 16 message key, the
source transition and role-safe source projection/confirmation remain truthful,
the source candidate terminates with `catalog_reserved`, and no Phase 6
header/intent/event, notification item, prepared material, or provider work is
created. A later Live activation does not catch up that historical candidate; a
future eligible transition receives its own identity and must pass every normal
Live proof above.

### U.6 Party authority and service-desk acceptance

| ID      | Required proof                                                                                                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 | Commitment Party, representative, service contact, expected remitter, collection authorizer, posted legal donor, Recognition Party, and portal grant never infer one another. Grant/revoke/effective-boundary tests change only the named scope, preserve history, and cannot cross tenant.                         |
| AUTH-02 | Identity merge may repair a canonical Party reference without transferring the promise. A real owner transfer supersedes the old commitment and requires fresh instruction/collection evidence; household, employer, missionary, or DAF relationships cannot bypass that rule.                                      |
| AUTH-03 | Every D15 command independently proves current operator capability/scope, Party or representative instruction, and exact rail-compatible collection authorization. Missing or revoked proof fails closed, including after preview and during concurrent apply. A second staff approval satisfies none.              |
| AUTH-04 | The server—not the client—derives exactly one of Apply now, Complete with donor now, Awaiting authorization, or Collection blocked from canonical before/after terms. Negative fixtures prove that increases, earlier dates, end removal, method binding, restart, and recovery cannot be mislabeled safe.          |
| AUTH-05 | Authorization challenge and apply bind identical versioned terms/hash, Party/authorizer, tenant, command, revision, expiry, and provider path. Any material edit or stale/replayed/scanner/cross-session/cross-tenant request invalidates the challenge; GET cannot mutate and POST remains CSRF/re-auth protected. |
| AUTH-06 | The responsive service desk completes common protective changes without a modal maze or raw credentials, while widening requests use the smallest required donor/provider step. Keyboard/screen-reader flows, redaction, audit visibility, delivery failure, provider partial outcome, and repair all pass.         |

### U.7 Missionary, privacy, accessibility, and nonfunctional acceptance

| ID      | Required proof                                                                                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| VIEW-01 | Dashboard order is cash, online recurring month outcomes, recurring list, secondary goal, 12-month drill, conditional Other. Zero exceptional records render no noise.                                                                                                                                                                     |
| VIEW-02 | Received reconciles Phase 13 effective fold after refund/chargeback/NSF/re-designation. Retries count one occurrence; ACH processing is not received.                                                                                                                                                                                      |
| VIEW-03 | Exact monthly rational factors aggregate before rounding; exact dated forecast uses occurrences; fixed total never monthly-normalizes.                                                                                                                                                                                                     |
| VIEW-04 | Calendar month and explicit Next 30 days differ at boundaries without silent switching. Mixed currencies remain separate; optional FX stays approximate/source-labeled.                                                                                                                                                                    |
| VIEW-05 | Anonymous/restricted/sibling line facts are filtered before totals/export/drilldown; unsafe small cells suppress. No payment/provider/rail facts reach missionary DTO.                                                                                                                                                                     |
| VIEW-06 | Totals remain exact beyond row caps and independent of pagination; high-volume/month-boundary/projection rebuild/fault/stale tests pass.                                                                                                                                                                                                   |
| VIEW-07 | Recurring rows expose original creation, original/current anchor, last success, next scheduled, final eligible, separate schedule/payment statements, exact bounded/indefinite pause copy, and safe donor-notice delivery truth. Conditional Other rows expose manual recurring/fixed pledge facts without payment/contact/reminder noise. |
| A11Y-01 | Keyboard, focus, error summary/inline parity, live status, forced color, reduced motion, 320px, 400% zoom, text spacing, long translation pass.                                                                                                                                                                                            |
| A11Y-02 | NVDA/Chrome and VoiceOver/Safari flows pass checkout, donor management, staff service, D16 incident, fixed pledge, reminder setup.                                                                                                                                                                                                         |
| A11Y-03 | Representative donors/staff/missionaries explain Today/Next/Then, processing versus received, pause/cancel/end/release, and non-effects without facilitator help.                                                                                                                                                                          |
| OPS-01  | Duplicate/out-of-order/replay/fault/timeout/concurrent edit/revocation/merge/DST/load/kill/canary/additive rollback suites leave zero duplicate money, intent, occurrence, application, or message.                                                                                                                                        |
| OPS-02  | Security tests cover IDOR, RLS, composite FK, webhook signature/routing, CSRF, token replay/scanner, cache/idempotency poison, log/DTO redaction, evidence access.                                                                                                                                                                         |
| OPS-03  | Every command has typed same-tenant subject FKs; every provider effect has one scoped child operation, including one `provision_executor` operation targeted at each pre-binding execution leg. Multi-effect partial outcomes remain reconciling and cannot collapse into one provider ID or success flag.                                 |
| OPS-04  | Each initial cohort freezes exactly one execution owner. Executor-invoice and product-triggered fixtures each create one occurrence and one attempt; concurrent/replayed branches can produce neither both owners nor zero owners. Binding authorization terms equal the cohort's current terms and account/mode/rail scope.               |

### U.8 Test implementation rules

- Unit tests use deterministic clocks and explicit tzdb/resolver version; property tests generate anchors, cadences, money splits, operation orders, and boundary instants.
- Database tests run against actual migrations/RLS/functions, not an in-memory substitute.
- Provider tests use recorded/version-pinned contract fixtures plus Stripe test-mode integration for behavior that mocks cannot prove. Never assert from undocumented dashboard behavior alone.
- Webhook tests replay duplicates, missing events, adversarial order, account/mode poison, late success/return, and retention gaps.
- Playwright tests exercise public UI seams, keyboard/screen reader semantics, status recovery, refresh, and multi-tab races.
- Load/fault tests inject worker delay, provider 429/5xx/timeout, database deadlock, outbox replay, communication outage, and projection lag.
- Every production invariant has a reconciliation query/metric and at least one negative test that proves the unsafe shortcut fails.

## Required Build Order and Kill/Rollback Boundaries

No agent may build a UI over unresolved truth or add a temporary flat writer while waiting for a predecessor.

1. **Durable design and congruence.** Land this PRD, A1–A15 dated package, ADR-0012–0017, OpenSpec reconciliation, ownership-matrix/glossary/roadmap amendments, and exact #706–#710 supersession. Nothing is dispatchable merely because docs exist.
2. **Predecessor proof.** Verify Phase 3/10 role-safe projections, Phase 7 receipt/finality, Phase 9 Party, Phase 12 capabilities, Phase 13 contribution ledger/Connect topology, Phase 14 recognition, and Phase 15 offline-money front door. Build only the minimum predecessor seams explicitly assigned; do not fork them.
3. **Schema and typed domain core.** Add tenant-safe tables, enums/types, append-only cadence/recovery/review/reminder policy versions, RLS/composite FKs, exact policy and operation capability entries, ownership registry, command/idempotency/outbox foundation, and migration red-list tests. **Kill:** all workers off; no provider commands.
4. **Pure calendar and topology planner.** Ship cadence registry, tenant giving timezone, line epochs, cohort schedule versions, ordinary/twice-monthly legs, occurrence identity, exact item plan, and 400-year/DST/property matrix. **Kill:** planner is read-only.
5. **Provider adapter and control fence before collection.** Pin/review Stripe version, implement exact account/mode/application/leg/item bindings, verified event intake, control evidence/incident, indeterminate fence, configuration readback, and reconciliation. **Kill:** provider command allowlist remains empty; donor stop still records locally.
6. **Initial contribution vertical tracer.** Extend one checkout path, accepted-agreement saga, card/ACH activation, contribution posting/receipt, exact D11 provider-lineage application, browser-loss recovery, and role-safe confirmation. **Kill:** tenant/rail creation flag; disable creates no new arrangements but preserves reads/reconciliation.
7. **Recurring materialization and ordinary renewal reconciliation.** Bounded materialization/preflight workers, exact occurrence/line snapshots, subscription-owned provider-automatic renewals, verified-event reconciliation, manual/external expectation-only handling, one executor owner, finality/inverses, no drift/catch-up, and dashboard projections. Twice-monthly must prove both legs. **Kill:** protective fencing is proved before the provider renewal window while product-triggered execution is disabled independently; the grid remains intact.
8. **Donor/staff management, Party roles, and tenant settings.** D14 authority/service/remitter facts, D15 workspace/gates/terms, date/amount/cadence/method/end, skip/pause/resume/cancel/restart, cohort/leg split, in-flight behavior, and the bounded preview/apply settings surface. Stops/reductions remain available when widening is killed.
9. **Card then ACH recovery.** D7 windows/slots/pressure; D8 episodes/cycles; D9 meanings; then separately D10 ACH returns/grants/runway. Bind every incident to the accepted policy version and enforce prospective expansion/live narrowing. **Kill:** Balanced→Off suppresses unstarted card slots; ACH recovery kill removes offers/commands but preserves normal schedule and truth.
10. **Fixed pledge and fulfillment.** Total-first pledge/optional plan, frozen review-policy binding, D18 fold/actions, general D11 suggestions/manual applications/inverses. There is no payment executor. **Kill:** writes off while role-safe reads/reconciliation remain.
11. **Health and missionary projection.** One pure D12 evaluator, freshness/CAS, metric registry, cash-first dashboard, list/privacy/aggregates/12-month drill. **Kill:** fall back to Status updating or independently valid cards, never legacy math.
12. **Communication candidates.** D9 typed intents and D19 reminder-policy preview/version, enrollment/candidates/stop. Actual dispatch remains dependency-blocked until Phase 6 and Phase 17 contracts/templates are live. **Kill:** optional candidate submission off; mandatory notices escalate and cannot be silently disabled.
13. **Classify, shadow, reconcile, canary, contract.** Run proof-only legacy classification, provider object census, no-send/no-charge shadow, canary tenants/rails, incident drill, full U matrix, accessibility/human comprehension, then remove legacy writes/reads/tables. **Rollback:** command/worker flags fail closed; additive new facts stay auditable; never switch back to old mutable writers.

Each slice must include its migrations, RLS/capabilities, fixtures, public-seam tests, observability, reconciliation, runbook, docs, and rollback. “Core logic now, tests/docs later” is not complete.

## Explicit Cut List — Do Not Over-Engineer

Phase 16 does not build:

- a universal pledge/commitment aggregate, state machine, editor, or conversion;
- a second contribution ledger, receivable, GL, invoice, payout, bank-reconciliation, or accounting engine;
- a second recurring executor, active-active provider failover, custom card vault, ACH mandate engine, or provider-control DSL;
- daily cadence, arbitrary recurrence rules, tenant schedule/retry/matching/health/legal DSLs, or probabilistic/ML authorization;
- one Stripe subscription per line, one inferred group per donor/account, or twice-monthly interval approximation;
- catch-up balances, backcharges, proration, arrears, automatic pledge continuation/conversion, or failed-gift donor debt;
- co-obligors, guarantors, nested delegation, tenant-defined role meaning, or legal-adjudication engine;
- cross-currency fulfillment, a generic accounting allocator, bulk widening/restart/write-off, or arbitrary approval chains;
- a separate offline-pledge operations center, equal-prominence missionary pledge dashboard, spreadsheet plan widget, or pledge dunning platform;
- a parallel email queue/studio/provider, arbitrary reminder journey/cadence/channel escalation, force-send, or open/click truth; or
- compatibility shims/dual writes to `donor_pledges` or `pledge_charge_attempts`.

Complexity already required by money/authorization/tenant truth is not optional. Complexity outside this list requires a new evidence-backed decision, not an implementation convenience.

## D1–D19 Coverage Ledger

| Decision                    | Binding implementation location                | Release proof                                                                                                                                                                  |
| --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1 separate products        | Solution; A.1; L–N; cut list                   | No shared aggregate/type flip/status/editor; conversion requires successor                                                                                                     |
| D2 group/lines/cohorts      | A.2–A.4; O.3/O.5; topology correction          | One logical cohort, ordinary one leg/twice-monthly two, exact item per line per leg                                                                                            |
| D3 cadence UX               | B.1; R.1; CAL-02/07/10                         | Closed catalog, monthly featured, per-occurrence truth, grandfathering                                                                                                         |
| D4 donor dates/initial gift | B.2–B.8; P.2; CAL suite                        | One initial contribution per disclosed compatible cohort, multi-charge review, today/future start, no duplicate per line/leg, clamp/recover, frozen zone, no drift/end default |
| D5 skip/pause/cancel        | C; P.1; REC-01–04                              | Named suppression, unchanged grid, exact pause labels, direct/proved cancel, fresh restart                                                                                     |
| D6 authority boundary       | D.1; Q.3/Q.5/Q.8                               | Provider subscription owns ordinary renewal; Asym owns closed product-triggered recovery policy/commands; excluded unattended cases; one owner per occurrence                  |
| D7 retry budget/timing      | D.2–D.5; O.6; REC-06–09                        | +2/+4[/+6], 48h/window, actual consumption, indeterminate, stop/try-now, cutoff                                                                                                |
| D8 three later cycles       | D.6–D.8; O.6; P.3; REC-10–13                   | Trigger + cycles 1–3; fourth schedule-only; 15/30×24; no debt/backcharge                                                                                                       |
| D9 meaningful messages      | D.9; template contract below; REC-18/19        | State/mandatory meanings, one unit, dedupe, read-only GET, no donor-aware claim                                                                                                |
| D10 ACH                     | E; O.7; P.4; REC-14–17                         | One normal entry, proof-gated one-use R01/R09, reason families, finality, runway                                                                                               |
| D11 fulfillment             | F; O.11; FUL suite                             | Typed exact targets, three auto-authorities, conservation/locks, inverse/vector retraction                                                                                     |
| D12 health                  | G; O.13; HLT suite                             | Pure evaluator, line/pledge grain, cohort lapse, bounded review, Status updating                                                                                               |
| D13 missionary              | H; O.13; VIEW suite                            | Cash/online recurring/list first, exact outcomes/factors, quiet Other, privacy before sum                                                                                      |
| D14 Party roles             | I; O.10; AUTH-01–02                            | One immutable Party; separate authority/contact/remitter/authorizer/donor/recognition; no role or portal inference; revocation and transfer proof                              |
| D15 staff service           | J; capabilities; R.3; API commands; AUTH-03–06 | Three independent gates, four server outcomes, exact-term invalidation, one accessible workspace, no proxy consent                                                             |
| D16 control loss            | K; O.8; P.5; REC-20–24                         | Seven-state ladder, one incident, cancel first, same-binding proof, cutover old-stop                                                                                           |
| D17 total-first pledge      | L; O.9; FIX-01–05                              | Short form, optional plan, named/undated conservation, no execution                                                                                                            |
| D18 four operations         | M; O.9; P.6; FIX-06–09                         | Separate proof/effects, exact formula, stop distinct, inverse/correction/quarantine                                                                                            |
| D19 reminders               | N; O.12; REM suite                             | One Gentle 30-day + review profile, reduction-only tenant max, Off/enroll/proof-at-send                                                                                        |

No ratified decision is deferred to ticket-level invention. A later ticket may refine names within established repository convention only if it updates this ledger/congruence without changing semantics.

## A1–A15 Dated Congruence Ledger

The authoritative package is `docs/prds/sitestacker-parity/phase-16-cross-prd-congruence-2026-07-13.md`. This PRD incorporates every amendment:

| Amendment | Older conflict                                                     | Winner and incorporated result                                                                                                            |
| --------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A1        | Roadmap universal pledge model and Active→Lapsed→Closed            | D1/D2/D11/D12: two aggregates, typed fulfillment, independent axes; labels derived only                                                   |
| A2        | Phase 13/#706 one subscription per line and donor×account grouping | D2 plus topology correction: explicit Party/payer/currency group, logical compatible cohort, one or two legs, exact item per line per leg |
| A3        | #706/#709 six-state canonical lifecycle                            | D2/D5/D8/D12/D16: intent, schedule, occurrence/payment, collection, control, reconciliation, health separate                              |
| A4        | #707 Stripe Smart Retries, early park/lapse, multi-touch           | D6–D10: Asym bounded policy, trigger+three cycles, schedule-only continuity, rail isolation, meaningful messages                          |
| A5        | #708/#709 default months hold, UTC duration, void assumption       | D4/D5: donor skip/bounded/indefinite pause, civil date, unchanged grid, provider proof                                                    |
| A6        | #709 `items[0]`, one-line in-place edits/provider phases           | D2–D5/D15/D16: exact item-per-leg, server commands/previews, cohort split, pending/unknown fences                                         |
| A7        | #710 recurring completion/continuation mixed with pledge           | D1/D4/D17–D19: recurring final date distinct; fixed pledge outcomes/reminders separate; no continuation/conversion                        |
| A8        | Phase 13/#706 confident provider adoption/cutover                  | D16: evidence-derived control, reconnect→reconcile, different binding formal cutover with old-stop/fresh auth                             |
| A9        | Phase 7/13 ACH receipt/posting at processing                       | D4/D10: recurring processing is evidence only; official posting/receipt only success; late-return exact inverse                           |
| A10       | Phase 9 one on-track/behind health and support-goal-first view     | D12/D13: lifecycle+reasons, cash-first/online-recurring-first, goal secondary, quiet fixed pledge                                         |
| A11       | Phase 4/9 identity merge broadly re-points promise                 | D14: merge preserves owner snapshot; owner transfer supersedes/fresh evidence                                                             |
| A12       | Phase 6 legacy pledge refs/provider naming                         | D9/D19: typed intents/candidates; Phase 6 delivery, Phase 17 render, provider replaceable                                                 |
| A13       | Phase 14 recognition might satisfy pledge                          | D11/D14: only conserved application fulfills; recognition/DAF/remitter are not authority                                                  |
| A14       | Phase 15 entry might become promise/match money writer             | D11/D17/D18 + ADR-0010: promise writes no money; Phase 15 posts, then D11 applies                                                         |
| A15       | merged/active OpenSpec one-to-one pledge/subscription/status       | D1–D16 and new delta: separate products/topology/axes/schedule/recovery/control/commands/finality                                         |

This ledger is a dated narrow supersession, not an invitation to rewrite unrelated predecessor behavior.

## ADR and OpenSpec Package

The durable decision records are:

1. `docs/adr/0012-separate-recurring-commitments-from-fixed-total-pledges.md` — D1 boundary.
2. `docs/adr/0013-explicit-recurring-groups-and-compatible-billing-cohorts.md` — D2 group/cohort/line and one-/two-leg executor mapping.
3. `docs/adr/0014-product-owned-rail-isolated-recurring-recovery.md` — D6–D10 policy authority and card/ACH isolation.
4. `docs/adr/0015-provider-control-loss-quarantine-and-proof-gated-recovery.md` — D16 observation/control/reconciliation/cutover.
5. `docs/adr/0016-proof-gated-fixed-total-pledge-reminders.md` — D19 one profile, explicit enrollment, proof at send.
6. `docs/adr/0017-donor-anchored-civil-date-recurring-schedules.md` — D3–D5 civil-date/initial-gift/no-drift contract.

OpenSpec reconciles, rather than layering over, stale active changes:

- `openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md` holds the Phase 16 product boundary and scenarios;
- `openspec/changes/sitestacker-parity/specs/donation-lifecycle/spec.md` holds the normative lifecycle delta;
- `openspec/changes/add-recurring-giving/` is amended to the group/cohort/leg/line target;
- `openspec/changes/add-donor-self-service/` is amended to the server-command and proof-gated management target; and
- the site-stacker proposal/design/tasks identify this PRD, congruence, ADR, and acceptance contract.

The OpenSpec scenarios must stay at least as strict as U. If an active change still describes a one-to-one subscription/pledge, single status, provider-owned retry, or direct legacy-row mutation, implementation stops until reconciled.

## Phase 17 Template and Localization Contract

Phase 16 pins typed meanings and merge facts; Phase 17 owns governed localized rendering and executable lifecycle. The following identifiers reserve canonical meanings; they do not make a contract Live:

| Identifier                              | Purpose/classification                      | Required facts                                                                                                                           |
| --------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `recurring_recovery_started_v1`         | Transactional/stewardship as governed; D9   | organization, Party-safe recipient, occurrence amount/currency/date, candidate dates, next ordinary date, safe actions                   |
| `recurring_action_required_v1`          | Required payment action                     | reason-safe action, deadline if authoritative, no raw decline                                                                            |
| `recurring_occurrence_missed_v1`        | Terminal occurrence stewardship             | missed amount/date, no debt/backcharge, schedule continues, next amount/date, manage/give-once paths                                     |
| `recurring_payment_truth_corrected_v1`  | Correction/supersession                     | old stated fact, new provider-confirmed fact, receipt/statement impact, support route                                                    |
| `recurring_ach_initiated_v1`            | ACH initiation confirmation                 | amount/date/masked account, processing meaning, final receipt later                                                                      |
| `recurring_upcoming_charge_v1`          | Mandatory/product-baseline upcoming         | semiannual/annual charge amount/date/merchant/cancel/manage, required notice facts                                                       |
| `recurring_schedule_changed_v1`         | Transactional arrangement confirmation      | affected lines, effective date, amount/cadence, next three dates, final-date truth, immediate/in-flight non-effects, provider-sync state |
| `fixed_pledge_upcoming_v1`              | Campaign-commitment stewardship/fundraising | Party, expectation amount/date, organization/campaign-safe facts, no debt                                                                |
| `fixed_pledge_source_aware_followup_v1` | Campaign-commitment stewardship/fundraising | current records show no applied gift, processing/matching uncertainty, contact/help/stop purpose                                         |

Every identifier in this table is **Reserved** in the current Phase 17 catalog generation. Phase 16 therefore creates zero Phase 6 plan-occurrence headers, child intents, `communication_events`, notification items, prepared material, or provider work for these keys. Its domain transitions, durable command confirmations, donor/staff/missionary source projections, and required release blocks remain authoritative without being mislabeled as catalog delivery. Only a future idempotent activation generation may prove an exact key Live; submission is then prospective for later eligible transitions only, with no historical catch-up. A mandatory notice cannot bypass this gate: the affected lane remains blocked until its exact contract is Live and delivery-ready.

Normal success uses the Phase 7 governed receipt template, not a Phase 16 duplicate. Phase 16 missionary pause status and terminal missed-occurrence visibility remain source-owned while the applicable catalog keys are Reserved. After `recurring_occurrence_missed_v1` is separately proved Live, its missionary step is in-product only; failed-attempt missionary alerts remain non-email. A future missionary pause email is a typed future domain meaning under D5 only: Phase 16 submits neither a Phase 6 plan occurrence nor a `communication_event` for it. A future owning phase may submit one complete bounded eligible plan occurrence through `compileAndReleaseCommunicationPlanOccurrence` only after its exact contract is Live; only Phase 6's private transaction-scoped primitive may create its child intent(s), and Phase 6 may create the event only at dispatch/publication. This phase selects no delivery platform or template identifier. Localization must preserve amounts/currencies, civil dates/timezone, action effects, no-debt language, mandatory terms, and terminology bans. Missing/unpublished/incompatible template suppresses optional submission and creates a repair exception; it never falls back to arbitrary English/provider content.

## Counsel, Network, and Compliance Evidence Gates

This PRD defines product defaults, not legal advice. Production enablement is blocked until accountable counsel/compliance and provider/acquirer owners record current, versioned approval/evidence for:

- recurring off-session card terms, merchant identity, amount/timing rule, cancellation, retention, and applicable MIT notices;
- ACH SEC/mandate path, recurring written/electronic authorization and copy, return-code handling, R01/R09 reinitiation exclusivity/timing, revocation/stop, and late return treatment;
- staff-assisted card MOTO and call-recording/PCI controls; recurring ACH WEB/written path and TEL exclusion;
- provider-control/Connect charge architecture, application ownership, account/mode routing, disconnect/reconnect/cutover, and old-executor stop proof;
- donor cancellation/stop representation while provider confirmation is pending;
- reminder purpose classification, consent/suppression, sender/reply-to, RFC 8058, jurisdiction, retention, and marketing-content separation; and
- tax receipt/statement wording and reversal/supersession after ACH return/refund/chargeback.

Each evidence record names jurisdiction/program, source URL/document/version/date, reviewer/owner, scope, expiry/review date, and resulting adapter/policy version. Expired/missing evidence narrows or disables the affected lane; it never falls back to a generic rule.

## PRD-Author Pins — Resolved

1. **Names:** O pins canonical aggregates, topology, schedule, occurrence, attempts, commands, fulfillment, fixed pledge, roles, reminders, incidents, and projections; Q pins modules/commands/APIs.
2. **Giving timezone:** Phase 2 `org_settings.giving_timezone`; no fallback; D4 resolver/frozen tzdb evidence in B/O/U.
3. **Accepted agreement:** B.4/B.5 distinguish abandonment, provider-accepted processing ACH, card success/action/unknown, immediate gift, future continuing executor, and browser-loss recovery.
4. **Provider matrix/version:** Q.7/Q.8 records repo/current Stripe versions, exact operation proof, one-/two-leg topology, and fail-closed behavior.
5. **States/copy:** C/P/R pin state axes, transitions, headlines, outcomes, and forbidden claims.
6. **Legacy classification:** T.2 pins proof order, ambiguity quarantine, no side effects, and table/code retirement.
7. **#706–#710/OpenSpec:** T.3 and the A/OpenSpec ledgers name every supersession; no duplicate build path.
8. **Phase 17 templates:** the template table pins identifiers, purposes, merge facts, localization invariants, and missing-template behavior.
9. **Compliance:** the counsel/network evidence section separates product defaults from release approvals and pins fail-closed ownership/evidence.
10. **Performance/retention:** S.5/S.6 pins initial budgets, cache/source posture, evidence lifetimes, and stricter-policy precedence.

No product choice is left for ticket-time invention. A newly discovered external constraint may narrow a lane under the defined fail-closed contract; changing donor behavior requires a dated product decision and congruence update.

## Research Evidence and Authority

The reviewed evidence is preserved in `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments-research-evidence.md` and the D1–D19 decision log. Implementation agents must refresh unstable vendor/network/legal facts at build time and attach the source/version to the applicable policy/adapter test.

Primary authorities include:

- [Stripe official Billing, Subscriptions, Invoice/PaymentIntent, custom retry, stored/off-session method, ACH Direct Debit/SEC code, Terminal MOTO, Connect account/control/webhook, idempotency, and API-version documentation](phase-16-pledges-recurring-commitments-research-evidence.md#43-current-legal-network-and-security-release-authorities);
- [CFPB Regulation E §1005.10 recurring electronic-transfer authorization/copy requirements](https://www.consumerfinance.gov/rules-policy/regulations/1005/10/);
- [Visa Core Rules and Product and Service Rules, 18 April 2026 edition, including stored-credential/MIT notice rules](https://cis.visa.com/dam/VCOM/download/about-visa/visa-rules-public.pdf), applied only through the proved exact acquirer program;
- [Nacha reinitiation guidance](https://www.nacha.org/rules/ach-network-risk-and-enforcement-topics) plus current processor/ODFI written proof for the exact ACH path;
- [OWASP Transaction Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html) and [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) guidance;
- [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058) and [Stripe Terminal MOTO](https://docs.stripe.com/terminal/features/mail-telephone-orders/overview) scoped requirements;
- WCAG 2.2 legal/financial error prevention and related accessibility criteria; and
- repository OpenSpec, predecessor PRDs/ADRs, installed dependency source, RLS/migration tests, and provider sandbox/readback evidence.

Comparable nonprofit systems (including Fundraise Up, GoFundMe Pro, Givebutter, Virtuous, Planning Center, Bloomerang, Blackbaud, and Salesforce nonprofit patterns) informed UX and operational comparisons but do not override primary rules or this ratified product contract. A vendor button or retry default is precedent, not legal/technical authority.

## Hard Stop Conditions

Implementation or release stops, with the affected lane disabled, when any of the following is true:

- a Phase 3/6/7/9/10/12/13/14/15/17 dependency needed by the slice is absent or contradictory;
- OpenSpec, ADR, congruence, roadmap, or #706–#710 still exposes a competing buildable definition;
- tenant giving timezone is missing/invalid or a provider mapping cannot preserve the civil-date grid;
- Stripe SDK/API/webhook/account behavior for the chosen pinned version is not verified from source/docs/sandbox/readback;
- ordinary/twice-monthly executor topology, exact item binding, provider retry ownership, or exactly one initial charge per disclosed compatible cohort cannot be proved;
- tenant/account/mode/application/merchant/Party/authorization scope is unknown or mismatched;
- a prior payment/command is indeterminate, in-flight, retryable, or could overlap the proposed action;
- RLS/composite FK/capability/idempotency/CAS/append-only/conservation invariants fail;
- ACH R01/R09 provider/ODFI proof or exact donor grant is missing; the safe schedule-only path remains complete;
- provider-control old-stop proof is missing for cutover or cancellation completion;
- D11 source/target capacity or reversal allocation cannot be proved; route to review rather than guess;
- communication consent/purpose/contact/template/current-source/semantic proof is missing; optional send suppresses;
- cash, receipt, fulfillment, health, or dashboard projection is stale/conflicting in a way that could mislead or authorize; show Status updating and raise repair;
- any release-blocking U test, accessibility/comprehension test, incident drill, reconciliation, canary, metric, or runbook is incomplete; or
- rollback would reactivate a legacy writer/provider executor or lose durable evidence.

Stopping one lane must not corrupt another. For example, ACH recovery may remain disabled while ordinary safe card recurring works; reminders may remain blocked while pledges are accurately recorded; projections may show Updating while donor cancellation still records.

## Definition of Done for a Future Build

Phase 16 is implemented only when:

- every required table, constraint, RLS/capability, append-only journal, command, adapter, projection, and legacy retirement in this PRD exists;
- the public-seam tracer and all U matrices pass against real database/provider-contract boundaries;
- Stripe version/capability, compliance, accessibility, privacy, tenant, scale, fault, migration, canary, rollback, and human-comprehension evidence is attached and current;
- provider-control, payment/receipt, D11 conservation, health/projection, and communication reconciliation report zero unexplained variance;
- donor, staff, and missionary copy/state exactly reflects processing, success, failure, pause, cancellation, control loss, received cash, fixed promise, release, and reminders without debt or false assurance;
- every worker/command has observability, owner/SLO, kill control, repair path, and rehearsed runbook;
- `donor_pledges`, `pledge_charge_attempts`, stale one-line recurring mappers/reads, duplicate email/reminder paths, unsafe missionary math/DTOs, and plaintext provider-secret patterns are absent from the operational path;
- docs, ADRs, OpenSpec, ownership matrix, glossary, data dictionary, API contract, admin/donor/missionary help, and support runbooks are updated with the shipped versions; and
- no Phase 16 issue is dispatched until Conrad separately authorizes dispatch.

## Program Status and Dispatch Boundary

This document is the Phase 16 product specification requested by Conrad. It authors no product code, publishes no GitHub issues, applies no labels, and does not make the phase `ready-for-agent`. Grooming, issue minting, dispatch, implementation, commit, and push are separate explicit founder steps. In particular, this PRD does not authorize dispatch of #706–#710 or any newly authored Phase 16 ticket.

All D1–D19 founder decisions are closed and incorporated. There are no open founder questions, unresolved product markers, or deferred permanent fixes in this PRD. Any later inability to satisfy a release gate is a visible blocked lane under Hard Stop Conditions, not permission to weaken the contract or add a workaround.

## Dated Phase 17 catalog, presentation, and sender amendment (2026-07-19)

**Old statement.** Phase 16 owns recurring/fixed-pledge meaning, eligibility,
recipient projection, and candidates while Phase 17 later owns editable
content; its message catalog predates Phase 17's complete executable catalog,
Sender Profiles, reply destinations, and prepared-message recovery contracts.

**New winner.** Phase 16 continues to own exact typed meaning, the current
producer fence, and bounded recipient candidates. It submits into the Phase 6/17
seam only when the exact contract is Live in a proved Phase 17 activation
generation; a Reserved key creates zero Phase 6 communication state and later
activation never catches up historical transitions. Phase 17 maps each Phase 16
obligation admitted to the executable catalog to one stable executable System
message contract, activation generation, protected truth core, Delivery Plan/step,
publication, locale, layout/Brand Kit, Sender Purpose/Profile, reply posture,
recent-copy class, and whole-message recovery posture. Every other inventoried
obligation retains its census disposition (`deferred`, `source/context
projection`, or `not_a_message`) and MUST NOT synthesize a key or runtime path.
Normal successful recurring payment continues to use the Phase 7 receipt; Phase
17 does not invent a duplicate success email.

**Compatibility boundary.** Phase 16 alone owns payment/recurring/pledge states,
material transitions, donor/missionary/staff audiences, candidate timing,
retry/no-debt/no-backcharge meaning, fixed-pledge reminder enrollment, and
protected recovery actions. Phase 17 cannot send per-attempt missionary noise,
create a recipient, interpret a processor event, or make an optional reminder
required. The Phase 6 delivery-profile snapshot is an exact on-demand
composition; multiple Sender Profile/reply revisions may coexist, and no
secret or mutable sender authority moves into Phase 16.
