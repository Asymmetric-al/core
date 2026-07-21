# Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model

> **Program:** SiteStacker Parity · **Phase:** 7 · **Status:** Groomed (grill-with-docs, 2026-07-05) · **Base:** `develop`
> **Predecessors:** Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection) · Phase 4 (Identity & Account-Claiming) · Phase 5 (Public Website Runtime Contract) · Phase 6 (Shared Communication Event Model)
> **Hard dependencies (must ship first):** Phase 4 tenant-isolation foundation slice · Phase 6 communication-event spine + `sendEmail` seam · Phase 3 consent gate (in-flight, PR #502, **unmerged**)
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md` (Areas 7, 9, 10; touches 2, 5, 11)
> **Production gate:** requires review by qualified finance/tax counsel before production use (this document is not legal or tax advice).

Modern SiteStacker parity for the **finance/legal record foundation** of the platform — a **rules-first engine that decides what is receiptable, who the legal donor is, what facts a receipt or year-end statement asserts, how corrections/voids/supersedes work, and what belongs in an annual statement — before any template renders a single document** — built on a **full donor-identity/credit model** (party spine, hard vs soft credit, DAF, matching gifts, households, tributes) so the right document always goes to the right party. Phase 7 supplies that legal/facts brain, **references** (never forks) the money-truth ledger, and builds the Phase-4-reserved identity/party spine on top of Phase 4's isolation foundation. Current receipt/PDF/send code is prototype evidence only: Phase 18 owns the clean generated-document runtime, Phase 17 owns delivery, and Phase 19 owns statement populations and runs. The result lets finance explain why any gift did or did not get a receipt and authorize correct/void/replacement facts without allowing a template, renderer, payment provider, or delivery event to invent legal truth.

> **Controlling Phase 18 amendment (2026-07-21).** Phase 7 remains the
> authority for legal donor identity, receipt/statement eligibility, immutable
> facts, correction/void/replacement effect, and optional issuance. Phase 18 is
> the sole authority for document definitions, publications, generation
> requests, render attempts, exact PDF artifacts, logical-document current
> heads, artifact access, and generated-document records evidence. The existing
> PDF/Statement Studio, live text downloads, `contribution_receipt_snapshots`,
> and other receipt/document paths are non-production prototypes and are
> removed through Phase 18's environment-gated clean cut; they are not preserved
> through an additive migration or compatibility runtime. Phase 17 alone owns
> delivery, and Phase 19 alone owns statement populations, cutoffs, and run
> timing. An ACH payment that is only `processing` is not receipt eligible;
> source-confirmed success is required. U.S. acknowledgments use Phase 18's
> short opaque reference plus immutable versions. Canadian official receipts,
> when an exact issuer deliberately activates the pack, use the one issuer-owned
> `R-` series with uniqueness, nonreuse, and explicit disposition accounting;
> this PRD no longer claims mathematical gaplessness or base-number reuse for a
> corrected Canadian receipt. Where older text below conflicts, this amendment
> and the Phase 18 PRD/manifest control.

---

## Problem Statement

The platform issues "receipts" today, but they are not finance records — they are a thank-you email built on the fly and a live-recomputed plain-text file, with no rules behind them, no durable versioned record, and no model of who the legal donor is. Everything downstream that a nonprofit needs — corrected receipts, voids, year-end statements, DAF and soft-credit handling, offline gifts, accounting exports — has nowhere to stand. Nine concrete gaps block the whole finance/compliance surface:

1. **There is no rules-first receipt engine — templates would invent tax truth.** Today `receipt_status` defaults to `pending` for every staged gift and flips to `sent` only because an email went out; the two enum values that would express "not receiptable" (`not_required`) and "suppressed" (`suppressed`) are **never assigned by any code**. There is no rule that decides whether a gift is receiptable, no reason a gift did or did not get a receipt, and the donor-portal download will render a "Donation Receipt" for a gift that is **pending, failed, or fully refunded**. If templates (PDF/Statement Studio) ship before the rules exist, each one invents its own version of the tax truth.

2. **Receipts are not durable, immutable, or versioned — so "what did the 2024 receipt say?" is unanswerable.** A receipt is generated on demand and stored nowhere authoritative; `contribution_receipt_snapshots` exists but has **no immutability trigger, no numbering, no unique constraint, and a severable link to its cause** — it is not a system of record. A correction cannot produce a traceable new version because there is no version to supersede, and the IRS's contemporaneous-written-acknowledgment requirement only means something if you can prove what was issued and when.

3. **There is no donor-credit model — so a legally-wrong receipt is one keystroke away.** A gift links to exactly one flat `donations.donor_id`. There is no legal-donor-vs-soft-credit distinction, no DAF/foundation donor, no household or organization/church party, no matching-gift or tribute model. Without this, a tax receipt can go to a DAF advisor (who already took their deduction), both spouses can be receipted for one joint gift, or a soft-credited match can be counted as the donor's deduction — each a real compliance error.

4. **Payment state does not drive receipting, and the ACH clawback path is invisible.** The Stripe webhook handles `payment_intent.processing`, `succeeded`, `payment_failed`, `canceled`, and `charge.refunded`, but has **zero `charge.dispute.*` handling** — which is exactly how Stripe delivers an ACH return that arrives **after** a payment looked settled (an unauthorized consumer return can land up to ~60 calendar days later, after the donor may have filed). So an ACH gift that returns after settlement, and every card chargeback, is currently invisible: the receipt wrongly stands while the money is gone.

5. **The tax year is derived wrong — offline gifts and the year boundary break.** `gift_date` is filtered in **UTC**, and `statementYear` is computed with `getUTCFullYear()`, so a Dec-31-11pm-Eastern online gift is mis-bucketed to the next year. There is no offline gift entry at all, no concept of the IRS **date-of-delivery** rule (a mailed check's tax year is its **postmark**, not the date written on it or the date received), and no governed way to backdate a January-arriving December check to the correct prior year.

6. **The statement is a live-recomputed text file, not an auditable record.** The donor-portal year-end statement recomputes on every download, includes settled gifts by a naive calendar filter, **counts partially-refunded gifts at full value** (the refund columns exist but are ignored), sums across currencies and mislabels the total, and snapshots nothing — so there is no provable record of what a donor was given at filing time, and a post-January correction silently changes a "prior" statement.

7. **Money is formatted wrong, violating the currency foundation.** `formatMoney` divides by 100 and hard-codes the `en-US` locale — currency-aware for the symbol but not zero-decimal-safe (JPY breaks) and not locale-aware — the exact bug Phase 2's currency-metadata primitive exists to prevent.

8. **Finance cannot explain any of it.** There is no view that answers "why did this $500 gift not get a receipt?", no receipt version history, no correction/void audit tied to the receipt, and no way to defend a snapshot to an examiner.

9. **The identity/party foundation this all needs is unbuilt.** Phase 4 **reserved** the persons anchor, party entities, soft-credit ledger, and the frozen legal-donor snapshot, and reserved extending the CRM identity-link enum for households/organizations — but none of it exists in code, and Phase 4 itself is a groomed PRD, unshipped. Phase 7 is where that reserved spine is built (on top of Phase 4's isolation foundation) because the receipt/credit rules cannot stand without it.

If generated-document templates, year-end statement operations, accounting exports, or offline batches ship before these rules exist, each one invents its own tax truth — the precise fragmentation this program exists to prevent. The recon for this phase confirmed reusable money, correction, audit, and execution patterns. The existing render, snapshot, and live-download paths are non-production prototype evidence and Phase 18 D17 removal targets, not a shipped document substrate.

## Solution

A **rules-first, server-only receipt & statement facts engine** — the system of record for _the official facts of a donor communication about money_ — built on a **full donor-identity/credit model** and referencing (never forking) the money-truth adjustment ledger. Phase 18 alone turns an approved Facts Package into an exact generated document; Phase 17 alone renders the surrounding message and delivers it through the Phase 6 communication spine. Twelve moving parts, built from the finance-operator, donor, and staff point of view so the platform issues one coherent, defensible finance record:

1. **The receipt as an immutable, versioned facts record (`contribution_receipts`).** A durable row that **freezes the approved acknowledgment at issuance** — org legal name/EIN, cash amount, gift date, deductible amount, goods-and-services statement + FMV, intangible-religious-benefits statement, in-kind description, and the frozen legal-donor name+address+party type. Once issued it never mutates. A correction or partial refund creates source-authorized successor facts with the prior version retained/void-audited. Phase 18 owns the document identity rules: U.S. acknowledgment reference plus `vN`, and a new serial that cites the canceled predecessor for a corrected Canadian official receipt. The facts record **references** the adjustment ledger by an explicit cursor; it does **not** widen the ledger with tax semantics. The non-production `contribution_receipt_snapshots` prototype is removed by Phase 18 D17 rather than becoming a second authority.

2. **Receipt eligibility with a per-method state machine.** A first-class, **reason-carrying** rule decides receiptability from the gift's _effective_ state (via `deriveEffectiveContribution`), enforced at both **issuance** and **read**. A receipt issues only after the tender reaches the source-owned successful/received state: card on confirmed capture, ACH on processor-confirmed success, and offline tender according to its ratified Phase 15 posting/receipt rule. ACH initiation or `processing` receives a truthful Phase 17 initiation confirmation, never an official successful-payment receipt. A later ACH return or other negative terminal event appends the exact inverse and source-authorized void/replacement effect; a partial refund produces successor facts rather than mutation.

   **Dated Phase 16 recurring-ACH amendment (2026-07-13).** For a Phase 16
   recurring ACH occurrence, `payment_intent.processing` creates a truthful
   initiation/submission confirmation only—it is not the official successful-
   payment receipt and must not say the gift was received or paid. The official
   receipt issues after processor-confirmed success. A later ACH return appends
   the exact inverse/supersession and notifies through the existing document and
   communication contracts; history is never deleted. This narrow amendment
   governs Phase 16 recurring ACH only and does not rewrite the card or settled
   offline-tender rules.

3. **The full donor-credit model behind every document.** Every gift has **exactly one hard-credit legal donor** (`donations.donor_id`, the sole receipt owner and frozen-snapshot subject) and **zero or more soft credits** (`gift_credits`, recognition-only, `is_receiptable = FALSE` — a hard invariant that never enters a money total). Donor becomes a typed **party** on a thin `parties` supertype (`party_kind ∈ {person, household, org}` + reserved `'group'`, with `org_type` distinguishing church/business/DAF-sponsor/foundation on the org subtype — amended 2026-07-06 per Phase 9 §C2; see A9). A **household is a group of persons, never an account that absorbs them.** DAF grants receipt the sponsor and give the advisor a **$0-deductible acknowledgment**; a matching gift is **two donations** (employee gift + company match receipted to the company); a tribute is a gift annotation whose notify party gets a **notification**, never a receipt.

4. **The three-document wall, enforced structurally.** A **tax receipt** (legal donor only; may carry deductibility + EIN), an **acknowledgment** (soft-credited parties; **no** deductibility language), and a **notification** (tribute notify party; **amount hidden**; never a tax document). Acknowledgment and notification templates have **no access to deductibility or amount merge-fields** — a wrong-party tax statement is impossible by construction, not by staff memory.

5. **The year-end statement as a frozen inclusion snapshot + a live view + versioning.** A **statement run** is an async batch that computes a frozen `statement_inclusion_snapshots` (which gifts included, which excluded **with reasons**, deductible vs indirect totals, legal-donor/household grouping) — the official/audit record — plus a **live "running summary"** portal view (recomputed on demand, cached, explicitly labeled non-official), plus **statement versioning** (a post-run correction issues a superseding version, prior retained, donor re-notified). Inclusion is driven by the credit model: DAF/soft-credit/matched gifts go in a separate labeled indirect section, never the deductible total; refunds net-reduce; households roll up to one deduped statement.

6. **A high-performance, resumable statement batch contract.** Phase 19 owns population, cutoff, scheduling, run recovery, and item selection; each item invokes Phase 18's one generation seam over Phase 7 facts. The run uses item-authoritative idempotency, bounded fair concurrency, resumable claims, and a first-class auditable exclusion set. January 31 may be a tenant service target, but this PRD does not present it as a universal federal contemporaneous deadline; the exact legal timing rule is qualified and revalidated at release.

7. **Correct tax year by stored date-of-delivery.** A single **delivery date is resolved once at ingestion/entry, in the tenant tax timezone, and stored** in `gift_date` (never recomputed on read): card/ACH = settlement; mailed check = **postmark** (the IRS mailbox rule — the written check date is not authoritative); hand-delivered/cash/in-kind = received; private carrier = received. A `delivery_basis` field records which input governed. An **offline gift-entry** flow captures postmark + received date, shows the computed tax year before save, and warns on a year-boundary straddle. **Backdating** to a prior year is permission-gated, evidence-required, cutoff-bounded, and separation-of-duties-approved when it crosses an issued-statement year — append-only, never a silent rewrite. This fixes the shipped UTC year-bucketing bug.

8. **Lean tax facts from a fund deductibility policy.** Deductibility is sourced from a **fund/designation policy** (fully-deductible / has-goods-services / non-deductible / in-kind) so most gifts are correct by default; a small set of frozen per-gift/per-line fields (deductible amount, goods-services FMV, quid-pro-quo, in-kind description) with per-gift override; a normalized benefit child table **only** for the rare multi-benefit gift. Split gifts may carry **mixed deductibility per designation line**.

9. **Delivery through Phase 17 over the Phase-6 spine; the three pre-existing bugs fixed.** Phase 7 emits typed source issuance/correction meaning only. Phase 18 hands Phase 17 the exact current artifact identity; Phase 17 renders the governed wrapper and crosses the one Phase-6 `sendEmail` seam. Delivery status never decides issuance or artifact currentness. A void/supersede produces an idempotent, version-scoped Phase 17 communication. The cutover fixes the version-less correction-notice identity, stale-amount delivery, and wrong-party amount/deductibility leaks without creating a Phase 7 sender or renderer.

10. **A finance explanation surface.** Mission Control gains a **full interactive receipt-eligibility explainer**: per-gift, why included/excluded, deductible vs indirect, the audited reason, the version history, and the correction/void trail — so finance can defend any receipt and answer "why isn't my gift here?" from the screen.

11. **One clean generated-document cutover.** Phase 7 source facts are built cleanly, while Phase 18 uses an environment-gated destructive pre-production cut to replace every prototype document writer, reader, live-text route, receipt carrier, and compatibility path with one canonical Generated Document service. If the environment assertion finds any real production tenant, irreplaceable artifact/history, or external reliance, destructive work stops before mutation and requires re-grooming; implementation may not improvise a migration.

12. **A privacy-, audit-, and counsel-governed posture.** Role-scoped visibility via the Phase-3 chokepoint (donor self-download always allowed; delivery to others consent-gated; Stripe ids never on a receipt; households scoped member-by-member); a permanent **negative/safety test tier** and structural CI gates; an **evidence file**; and an explicit **counsel-review gate** before production, with the jurisdiction axis as the seam for counsel input.

Underneath, Phase 7 source facts live **server-only at the Asym boundary** in new `packages/api/src/receipts` and `packages/api/src/statements` modules. Phase 18 consumes only an immutable approved Facts Package through its one Generated Document service; Phase 19 owns statement population/runs/items; Phase 17 owns message/delivery. Every other deferred concern — live DAFpay/matching-vendor integrations, a fiscal-close engine, bank reconciliation, and unsupported jurisdiction rules — is a reserved seam, not a Phase 7 build.

---

## User Stories

### Finance operator (Mission Control)

1. As a **finance operator**, I want every gift to carry a clear receiptable/not-receiptable verdict with a plain-language reason, so that I can answer "why did this gift get a receipt — or not?" without reverse-engineering it.
2. As a **finance operator**, I want a receipt to issue automatically when the source confirms the gift as successful/received, while a pre-settlement ACH gift receives only a truthful initiation confirmation, so that donors get prompt communication without treating pending money as received.
3. As a **finance operator**, I want a receipt to be an immutable, numbered, versioned record, so that I can always show exactly what a donor was told and when.
4. As a **finance operator**, I want a correction or partial refund to authorize successor facts and retain the prior facts, so that the audit trail is legible and nothing is silently overwritten. Phase 18 applies the jurisdiction policy: U.S. keeps the opaque acknowledgment reference with a new immutable version, while a Canadian replacement receives a new serial citing the canceled predecessor.
5. As a **finance operator**, I want an ACH gift that is returned weeks later (or a lost card dispute) to automatically void or reduce its receipt and notify the donor, so that a good-faith early receipt can't quietly become a wrong tax document.
6. As a **finance operator**, I want to void a receipt with a reason and an audit trail, so that a mistaken issuance is corrected defensibly.
7. As a **finance operator**, I want a full interactive explainer on a gift showing every included/excluded line, deductible vs indirect, the reason each fired, and the version history, so that I can defend any receipt to a donor or an examiner.
8. As a **finance operator**, I want to enter an offline gift and see the tax year it will be counted in (based on the postmark) before I save, so that a January-arriving December check lands in the right year.
9. As a **finance operator**, I want to backdate a legitimate prior-year gift with evidence and approval, but be stopped from backdating a February gift into December without justification, so that our records are correct but not abusable.
10. As a **finance operator**, I want to run year-end statements through a guided wizard with a pre-flight data-health check, a live preview, a per-donor inclusion explainer, a dry-run/test-send, and a diff against last year, so that thousands of tax documents go out reviewed and correct.
11. As a **finance operator**, I want a post-run correction to supersede only the affected statements with a new version and an auto-drafted donor re-notification, so that one refund doesn't force a full re-blast.
12. As a **finance operator**, I want the wizard to block commit if the template is missing EIN, the goods-and-services statement, or the tax-year label, so that IRS requirements are a checklist, not tribal knowledge.

### Finance / compliance

13. As **finance staff**, I want the receipt owner to always be the frozen legal (hard-credit) donor, never a login, email, or soft-credited person, so that a tax receipt never goes to the wrong party.
14. As **finance staff**, I want a DAF grant to receipt the sponsoring fund and give the advising individual a clearly non-deductible acknowledgment, so that we never tell a DAF advisor a grant is deductible to them.
15. As **finance staff**, I want an employer match to be the company's own receipted gift and only a soft credit to the employee, so that the same dollars are never receipted twice.
16. As **finance staff**, I want a couple to receive one joint statement and the second spouse only a soft credit, so that we never double-receipt one contribution.
17. As **finance staff**, I want soft credits, DAF grants, and in-kind gifts to be excluded from a donor's deductible total and shown in a clearly labeled indirect section, so that the one deductible number a donor hands their accountant is unambiguous.
18. As **finance staff**, I want in-kind gifts described but never valued on the receipt, quid-pro-quo gifts to show the benefit value and the net deductible, and gifts over $75 with a benefit to carry the required disclosure, so that we meet IRS substantiation rules.
19. As **finance staff**, I want money on receipts and statements formatted with real currency metadata and the frozen render locale, so that amounts are correct in any currency and a receipt renders identically forever.
20. As **finance staff**, I want a durable, retention-classified record that a receipt or statement was sent, corrected, or voided, and whether it delivered, so that we can substantiate official communications for years.
21. As **finance staff**, I want statement runs, corrections, and voids to require the right permission and separation-of-duties approval where they cross a tax year or an issued document, so that high-risk finance actions are controlled.

### Donor (self-service)

22. As a **donor**, I want to download a correct, compliant PDF receipt for any gift with one click, so that I have my own record without emailing the office.
23. As a **donor**, I want a clearly-labeled "running total for this year" view separate from my official year-end statement, so that I never confuse a mid-year summary with my filing document.
24. As a **donor**, I want my authorized portal to keep every retained official statement discoverable by tax year, while each open/download re-proves current access instead of relying on a never-expiring bearer link, so that tax prep is simple without weakening document security.
25. As a **donor** in a household, I want one joint statement for our household with a combined deductible total, so that my spouse and I don't receive two conflicting documents.
26. As a **donor**, I want my deductible gifts, indirect/soft-credited gifts, and in-kind gifts shown in clearly separate sections, so that I know exactly what I can deduct.
27. As a **donor** whose statement was corrected, I want to see the superseded version, a "corrected" badge, and a plain-language explanation of what changed, so that I understand and can amend my return if needed.
28. As a **DAF advisor**, I want a warm thank-you that clearly states it is not a tax receipt, so that I am acknowledged without being misled about deductibility.

### Organization / staff operator

29. As an **organization admin**, I want the deductibility of gifts to a fund configured once at the fund level and inherited by every gift, with per-gift overrides, so that receipts are correct by default without per-gift data entry.
30. As an **organization admin**, I want ordinary U.S. acknowledgment references to work automatically and an exact Canadian issuer to expose its protected `R-` receipt series only after deliberate proof-gated activation, so that identity follows the verified legal issuer rather than a loose tenant setting.
31. As a **staff operator**, I want to enter a DAF gift, a matching gift, a household, or a tribute and have the right documents route to the right parties automatically, so that the credit model does the compliance work for me.
32. As an **organization admin**, I want every backdate, void, correction, and statement run recorded in an immutable audit trail, so that our finance actions are tamper-evident.

### Developer / platform

33. As a **developer**, I want receipt/statement facts to be the source authority consumed only through Phase 18's typed Facts Package and one generation seam, so that no template can invent tax truth.
34. As a **developer**, I want soft credit to be structurally incapable of minting a receipt or entering a money total, so that the most damaging correctness bug is impossible.
35. As a **developer**, I want Phase 17 to deliver the exact Phase 18 artifact through the one Phase-6 seam with version-scoped identity, so that no send bypasses history and no correction notice is double-sent or dropped.
36. As a **developer**, I want Phase 18's environment-gated clean cut to delete every non-production document prototype and install only the final canonical runtime, so that no legacy compatibility or migration path becomes technical debt.
37. As a **developer**, I want the new party/credit/receipt/statement tables to inherit Phase 4's tenant-isolation plumbing (composite keys, FORCE RLS, tenant-guard, cross-tenant CI) rather than re-invent it, so that isolation is guaranteed by construction.
38. As a **developer**, I want a permanent negative/safety test tier and structural CI gates, so that a soft-credit-in-the-deductible-total or a wrong-party receipt fails the build.

### Auditor / counsel (governance)

39. As **tax counsel**, I want an explicit statement that production use requires my review, with the jurisdiction axis as the seam for jurisdiction-specific rules, so that the engine's best-effort rules are validated before a real donor relies on them.
40. As an **auditor**, I want an evidence file recording the sources, tests, and what was intentionally not built, so that the compliance posture is transparent.

---

## Implementation Decisions

### A. Architecture rulings

- **A1 — Receipt truth is an immutable versioned facts record that references, never forks, the money-truth ledger.** The keystone table `contribution_receipts` freezes the approved acknowledgment at issuance and is the sole system of record for the tax fact. It **reads** the effective gift value via the shipped `deriveEffectiveContribution` fold but **owns** all tax computation; it does **not** add tax semantics to the adjustment ledger's closed effective-values shape. Corrections/refunds are appended to the existing `contribution_adjustments` ledger and **cause** a new receipt version; the ledger is never widened or forked. (D1.)

- **A2 — The adjustment fold is last-writer-wins, not additive; versions freeze against a cursor.** `deriveEffectiveContribution` overwrites each field with an absolute value (a $40 refund on $100 is stored as absolute `60`, not `-40`). A receipt version therefore freezes against the **fold result at a specific adjustment cursor** and stores that cursor (the id of the newest applied adjustment it reflects); reconciliation is replay-to-cursor, not summing. Fold ordering must be a **monotonic per-donation sequence**, not the client-adjacent `created_at`. (D1 R1/R9.)

- **A3 — One authoritative representation of "receipt changed."** The versioned `contribution_receipts` source-facts row is the single tax-truth authority. Existing correction JSON and `contribution_receipt_snapshots` are non-production evidence removed by Phase 18 D17; they are not retained as annotations, compatibility carriers, or independent authors. (D1 R3/R4.)

- **A4 — DB-enforced immutability + jurisdiction-owned identity.** `contribution_receipts` carries a BEFORE UPDATE/DELETE trigger rejecting mutation of frozen columns, plus a `NOT NULL`/`RESTRICT` FK to the causing adjustment/correction. Phase 18 owns the generated-document identity implementation: U.S. uses a short opaque `ACK-XXXXX-XXXXX` reference plus immutable `vN`; an activated Canadian issuer uses one locked, unbounded `R-` series with uniqueness, nonreuse, and explicit disposition accounting. A corrected Canadian official receipt receives a new serial citing the retained canceled predecessor. Neither a bare Postgres `SEQUENCE` nor a mathematical zero-gap promise is accepted as the product contract.

- **A5 — Eligibility is a reason-carrying rule, enforced at issuance and read.** A pure evaluator reads the gift's effective state and returns `{ eligible, reason_code, evaluated_at }`; issuance creates no receipt version when not eligible (recording the reason), and every read/download path re-checks (or reads the frozen verdict / latest non-voided version). This finally assigns the dormant `receipt_status` values `not_required` and `suppressed`. Payment/refund state is Asym-owned and computed from the effective fold — Stripe reports state; it never decides receiptability. (D2.)

- **A6 — Source-confirmed success before receipt; negative events void/replace.** Card capture success and the applicable Phase 15 offline recorded/cleared rule may become receipt eligible; ACH `payment_intent.processing` never does. Processor-confirmed ACH success may issue once. Later ACH returns, refunds, or lost disputes append source-owned inverse/correction facts and the appropriate void/replacement effect; card disputes remain a separate contestable state. Phase 18 renders only the exact frozen eligible facts, while Phase 17 owns initiation, failure, correction, and delivery communication.
  _(Amended 2026-07-13 for Phase 16 recurring ACH: “accepted” at
  `payment_intent.processing` is sufficient to persist the agreement,
  occurrence, attempt, and processing confirmation, but not to run the
  successful-receipt `issue` action. That action waits for confirmed success;
  failed processing produces no successful receipt. A post-success return
  still follows the exact void/supersession path above.)_

- **A7 — Source-confirmed receipt finality, not a tenant timing matrix.** Card capture success and the applicable Phase 15 offline received/cleared rule may authorize issuance. ACH `processing` never does; processor-confirmed ACH success may authorize exactly once. Tenants cannot weaken that floor with a hold toggle. Later returns/refunds append source-owned inverse and correction effects; Phase 17 communicates them and Phase 18 preserves exact document lineage.
  _(Amended 2026-07-13: Phase 16 recurring ACH always uses success-only
  official receipting; this is a product contract, not a tenant toggle. Tenant
  policy may be stricter but may not label processing funds received.)_

- **A8 — One hard-credit legal donor per gift; soft credit is recognition-only and structurally non-receiptable.** `donations.donor_id` stays the single legal donor and sole receipt owner (unchanged invariant). `gift_credits` holds 0..N soft credits with `is_receiptable = FALSE` enforced by DB CHECK **and** service layer; a soft credit can never mint a receipt or enter any money/receipt/cash total. Do not add a second donor FK to `donations`. (D3.) _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14: the `donations.donor_id` phrasing now reads through the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ledger — the single legal donor is the `contribution_headers` frozen legal-donor snapshot — and `gift_credits` is renamed `contribution_credits` (keyed to `contribution_headers` + optional line scope); the one-hard-credit-donor invariant is unchanged.)_

- **A9 — Donor is a typed party on a thin `parties` supertype; a household is a group of persons, never an account that absorbs them.** _(Amended 2026-07-06 per Phase 9 §C2.)_ `party_kind ∈ {person, household, org}` (+ reserved `'group'`) on the `parties` supertype replaces free-text `donors.type`; `org_type ∈ {church, school, foundation, business, daf_sponsor, partner, agency, …}` lives on the org subtype; the canonical value name is `person` (not `individual`). `donors.party_id` is a NOT NULL composite FK to `parties` from the first migration; `donors.party_type` is **never created**. Persons resolve to a `persons` anchor (shared-PK subtype: `persons.id = parties.id`); households are a group with a primary/address-of-record and time-bound membership; org-kind parties carry an org profile (EIN, legal name, `org_type`) and org-contacts (the human signer, soft-credited). Frozen receipt snapshots copy the resolved taxonomy at issuance (a frozen copy, never live dual truth). (D3, D4; Phase 9 §C2.)

- **A10 — The three-document wall is structural.** `document_type ∈ {receipt, acknowledgment, notification}`. Tax receipt → legal donor only (deductibility + EIN allowed). Acknowledgment → soft-credited parties (**no** deductibility merge-fields available to the template). Notification → tribute notify party (**amount hidden**, never a tax document). DAF advisor = acknowledgment with $0 deductible + "this is not a tax receipt." (D3, D7 bug #3.) _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D3.4 — the single-field carve-out: the notification class gains exactly ONE governed field, `tribute_aggregate_total`, renderable only when the notify-party row has `include_total = true` (a per-family opt-in); per-gift amount fields remain structurally absent.)_

- **A11 — Matching = two donations; tribute = annotation; recurring = per-installment.** An employer match is a **separate** donation with `donor_id` = the company (its own receipt); the employee gets a soft credit only. A tribute is a gift-level annotation whose notify party gets a notification. A pledge commitment is never receiptable; each **paid installment** is its own receiptable gift; the annual statement aggregates installments. (D3.) _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D4.4/D4.2: the matched contribution's legal donor = the **payer-of-record** — defaults to the employer, but a workplace-giving intermediary that administers the employer's program CAN pay a genuine match, and the matched_employee-vs-workplace_giving_donor classification is per designation LINE; the lifecycle tracker is `matching_gift_expectancies` (rows are expectancies, never gifts), whose states gain `received → reversed` (driven by Phase 13 domain events), `closed` (+ `closed_reason`), and `superseded`; the D1.8-style spawn topology is restated in Phase 14 D4.2 — a staff batch received is an ordinary Phase 13 entry transaction, and the `matching_gift_settlements` junction replaces any unique spawned-header reference.)_

- **A12 — Year-end statement source contract = immutable inclusion facts plus a separate live view.** Phase 7 produces the exact deductible/indirect inclusion Facts Package and approved exclusions/reasons; a live portal summary remains explicitly non-official. Phase 19 alone owns statement run, recipient/item selection, cutoff, scheduling, and run recovery. Each Phase 19 item invokes Phase 18 for an immutable generated-document revision; a correction creates successor source facts and a new item/request, while Phase 17 handles any re-notification. (D5.)

- **A13 — The statement batch contract is split by authority.** Phase 19 owns run intent, population, cutoff, scheduling, seeding, item selection, and run recovery. Phase 7 supplies immutable inclusion/facts authority. Each stable item invokes the Phase 18 Generated Document service, which alone renders and stores the exact artifact. Item-authoritative idempotency, bounded fair claims, resumability, auditable exclusions, and pointer-only events remain mandatory; no phase creates a second renderer or artifact store.

- **A14 — Tax year = one resolved, stored date-of-delivery in the tenant tax timezone; never recomputed on read.** Resolution at ingestion/entry: card/ACH = settlement timestamp → DATE in tax timezone; **mailed check = postmark** (the written check date is not authoritative — IRS mailbox rule); hand-delivered/cash/in-kind = received; private carrier = received (no USPS postmark). `delivery_basis ∈ {postmark, received, settlement}` records which input governed. Stored in `gift_date`; `tax_year = year(gift_date)`. Fixes the shipped UTC year-bucketing bug via a tenant `tax_timezone`. (D6.)

- **A15 — Backdating is append-only, evidence-required, cutoff-bounded, and approval-gated across tax years.** True backdating (`gift_date` year < entry year) requires a non-suppressible reason + evidence (postmark for checks); crossing into a year whose statements issued routes through separation-of-duties approval and supersedes that year's statement; a tenant `prior_year_backdate_cutoff` (default ~Jan 31) bounds it, and backdating past the cutoff / older than the prior year is blocked without an elevated capability. All via the shipped adjustment ledger (`gift_date_correction` adjustment/action type); `gift_date` is never rewritten in place. (D6.)

- **A16 — Tax facts from a fund deductibility policy + lean per-gift/per-line fields.** A fund/designation `deductibility_policy ∈ {fully_deductible, has_goods_services, non_deductible, in_kind}` drives auto-populated per-gift facts; legacy funds default to `fully_deductible`; split gifts may carry **mixed deductibility per designation line**; per-gift/line overrides take precedence. Frozen facts on the receipt version: deductible amount, goods-services FMV, quid-pro-quo, in-kind description, is-deductible. A normalized benefit child table is added **only** for the rare multi-benefit gift. In-kind: deductible amount `NULL` (excluded from the deductible SUM), described-not-valued. (D6-B, D9#1/#6.)

- **A17 — Phase 17 owns donor-facing delivery over the Phase-6 spine.** Phase 7 submits typed issuance/correction meaning; Phase 18 supplies the exact current artifact identity. Phase 17 alone resolves the wrapper, recipient-safe content, idempotent occurrence, and delivery. The correction identity is version-scoped, delivery reads approved facts/exact artifact rather than stale rows, and purpose-specific walls prevent wrong-party money/tax disclosure. Communication retention stays in Phases 6/17; document retention stays in Phase 18. (D7.)

- **A18 — Formatting authority: freeze approved display facts and raw values in the Facts Package.** Phase 7 freezes canonical, locale-correct display facts (via Phase 2 currency metadata and `rendered_locale`) plus raw structured values. Phase 18's purpose-scoped Approved Data View binds them and never recomputes source truth; the stored exact artifact, not a later rerender, preserves what was issued. (D9#4, Phase 2.)

- **A19 — Clean source-facts build plus Phase 18 clean cut.** Phase 7's source-owned facts use the final constrained schema from the start. Phase 18's environment gate proves that prototype receipt/document paths have no production or irreplaceable reliance before deleting and replacing them; otherwise work stops for re-grooming. No shadow runtime, legacy backfill, compatibility view, synthetic document history, or migration console is created. A CI inventory proves all document reads/writes use the one final service after cutover.

- **A20 — Phase 7 builds the Phase-4-reserved party spine but inherits, never re-invents, Phase 4's isolation foundation.** The `persons` anchor, party tables, `gift_credits`, tributes, matching, org profiles/contacts, and the frozen legal-donor snapshot column are built here (fulfilling Phase 4 reservations), but every new table uses composite `(tenant_id, id)` keys, `ENABLE`+`FORCE` RLS, the tenant-guard wrapper, and a cross-tenant negative-test CI row — all inherited from Phase 4's isolation slice, which is a **hard prerequisite that ships first**. (D4.)

### B. Deep modules (built in isolation, tested behind a stable interface)

- **B1 — Receipt eligibility evaluator.** Input: a gift's effective state + method + policy. Output: `{ eligible, reason_code, evaluated_at }`. Pure, exhaustively table-tested against the D2 state machine. No I/O.
- **B2 — Receipt facts + source versioning core.** Freezes the approved facts against an adjustment cursor, enforces immutability, and authorizes correction/void/replacement effects. Phase 18 applies the jurisdiction-owned document identity/serial policy under its one generation seam. The A1/A4 keystone.
- **B3 — Credit resolver.** Given a gift + party graph, resolves the one hard-credit legal donor and 0..N typed soft credits (household, DAF advisor, matching employee/company, org signer, tribute), enforcing `is_receiptable = FALSE`. Drives document-type routing.
- **B4 — Date-of-delivery resolver.** Given method + postmark/received/settlement inputs + tenant timezone, returns `{ gift_date, delivery_basis, tax_year }`. Pure; the A14 core.
- **B5 — Statement inclusion engine.** Given tenant + tax year + recipient, returns the frozen inclusion set (included/excluded lines + reasons, deductible/indirect totals, grouping). Reused by both the batch build and the live view. The A12 core.
- **B6 — Statement inclusion contract.** Produces the immutable source-owned inclusion/facts package consumed by Phase 19's item-authoritative run and Phase 18's one generation seam. A13.
- **B7 — Document delivery intent.** Supplies the purpose, recipient and exact current-artifact handoff facts; Phase 17 alone prepares/sends through the Phase-6 spine with version-scoped semantic idempotency and the redaction wall. A17.
- **B8 — Fund deductibility policy resolver.** Resolves per-line deductible/goods-services/in-kind facts from fund policy + overrides. A16.

### C. Predecessor plug-ins & prerequisites (dependency sequencing)

Phase 7 sits on a stack of predecessors that are **not yet built**. The PRD states this plainly; tickets may be authored and net-new work prototyped in parallel, but Phase 7 must not merge to `develop` until the hard prerequisites land.

- **C1 — Phase 4 tenant-isolation foundation (HARD, not started).** Composite `(tenant_id, id)` keys, `ENABLE`+`FORCE` RLS, tenant-guard wrapper, canonical email-normalizer, cross-tenant negative-test CI tier, and the inert `persons` anchor must ship first. Phase 7 builds the party/credit spine on top and inherits this plumbing (A20).
- **C2 — Phase 6 communication-event spine + `sendEmail` seam (HARD, groomed-PRD-only).** No `communication_events`/`retention_class` exists in code and there is no single send seam yet (sends are scattered; `test-send.ts` writes an inline log — the bypass hole). D7/A17 routes all documents through this seam; it must ship or be co-sequenced as an explicit Phase-7 prerequisite, and the sole-seam ESLint gate must land with it.
- **C3 — Phase 3 consent gate (HARD, in-flight, unmerged).** The message-type-aware fail-closed outbound gate is on **PR #502, open/unmerged** — `packages/api/src/email/consent.ts` does not exist on `develop`. Phase 7 consumes it (self-vs-others asymmetry, per-(kind, party, version) consent snapshot) and must **not** re-implement it. **Correction:** the prior "shipped as PR #502" note is wrong; treat as in-flight.
- **C4 — CRM identity-link enum extension (re-scoped 2026-07-06 — no longer a blocking Phase 7 prerequisite).** The original rationale — projecting the party tables to Twenty via the extended enum — is retired with [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) (Asym Postgres owns all CRM truth; see the [Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)). The `crm_link_entity_type` (DB enum) / `CrmIdentityConceptId` (TS union) reservation remains only for **generalized provider links** (Stripe now, Mailchimp later): extend with `household`, `organization`, `daf_sponsor`, `person`, `gift_credit` only if/when a provider link actually needs them (the current 15 members include `receipt_record`/`statement_record` but none of these). Reuse the reserved `receipt_record`/`statement_record`; do not invent new ones.
- **C5 — Reserved consumption of Phase 2 / 3 / 5 seams.** Phase 7 populates Phase 2's reserved `rendered_locale` (frozen at issuance) + introduces the jurisdiction axis; reads through Phase 3's projection chokepoint + the reserved acknowledgment/notification document classes + household-privacy predicate; and relies only on Phase 5's reserved (plumb-not-build) tribute/DAF/matching/party-kind handoff hints (party-kind per the 2026-07-06 Phase 9 §C2 amendment; public capture is deferred; manual staff entry is in scope).
- **C6 — Existing substrate and prototype evidence.** `contribution_adjustments` + `deriveEffectiveContribution`, `contribution_operation_batches`, correction requests + approval policy, the dispatch/work-claim/recovery substrate, and Stripe event processing are reusable evidence where their current contracts survive. The existing PDF/Statement Studio render layer, live text routes, receipt-delivery snapshots, and `contribution_receipt_snapshots` are prototypes/removal targets under Phase 18 D17, not target runtime authority. The Stripe webhook's missing `charge.dispute.*` handling remains a correctness gap.
- **Prerequisite reference:** the "branded auth-email hook" is Phase 4 **issue #511** ("Branded auth emails via Supabase Send Email Hook → Email Studio → Resend") — cite it as issue **#511**. (It is an issue, not a PR; an earlier readiness pass mis-flagged it as a "phantom PR" by checking for a PR of that number.)

### D. Data model (canonical names; all tenant-scoped, composite keys, FORCE RLS, service-role writes)

**New tables — party spine** _(restructured 2026-07-06 per Phase 9 §C2)_:

- `parties` — thin supertype: `party_kind ∈ {person, household, org}` (TEXT+CHECK; `'group'` reserved). Subtype rows use shared-PK subtyping (`persons.id = parties.id`) — a subtype row **is** its party, never a second record. No new inline contact columns on `parties` or its subtypes, ever (migration lint). `parties` (and Phase 9's relationship edges) join the Phase 4 A9 merge re-point list (Phase 9 §C1).
- `persons` — the person identity anchor (Phase-4-reserved, built here; shared-PK subtype of `parties`). Hard-credit persons resolve here.
- `households` — a group of persons (never absorbs them): primary/head, address-of-record, include-in-name/greeting toggles.
- `household_members` — person↔household membership; role (spouse/partner/child), time-bound `started_at`/`ended_at`, include flags.
- party org profile (the org-kind shared-PK subtype) — EIN, legal name, `org_type` (church/school/foundation/business/daf_sponsor/partner/agency, …), `is_matching_gift_company`.
- `org_contacts` — the human signer(s) attached to an org party (soft-credited).

**New tables — credit, tribute, matching, DAF:**

- `gift_credits` — soft-credit ledger; one gift → 0..N rows `{party, credit_role, amount NULL|partial, recognition_only}`; **`is_receiptable = FALSE`** hard invariant. (Rejected synonym: `gift_attributions`.)
- `tributes` / `donation_tributes` / `tribute_notifications` — tribute definition, gift↔tribute annotation, notify parties (+ notify-once flag).
- `matching_gifts` — employer-match lifecycle tracker; only `received` spawns the separate company donation.
- `daf_sponsors` — DAF sponsor registry (alias-match incoming payers → sponsor = legal donor + advisor = $0 acknowledgment).

_(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14/D3.14/D4.14: this table set is renamed, re-keyed to the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ledger, and its build ownership moves to Phase 14 — `gift_credits` → `contribution_credits`, keyed to `contribution_headers` with optional designation-line scope (Phase 14 D1 owns the build: one credit table; lifecycle objects generate credit rows); `donation_tributes` → `contribution_tributes`; `tribute_notifications` is RETIRED → `tribute_notify_parties` — the old name was ambiguous with sent letters, and the notify-once flag generalizes into the frequency value `once`; sent letters are Phase 6 (Shared Communication Event Model) communication events plus a `tribute_notification_items` coverage ledger; `matching_gifts` → `matching_gift_expectancies` (rows are expectancies, never gifts) + a new `matching_gift_settlements` line-grain fulfillment junction; `daf_sponsors` survives as a party-extension (PK = party_id) plus the shared `party_payer_aliases` payer registry.)_

**New tables — receipt engine:**

- `contribution_receipts` — the immutable versioned **source-facts** keystone (frozen acknowledgment facts; adjustment cursor; source version/supersedes link; immutability trigger; `NOT NULL`/`RESTRICT` FK to causing adjustment). It carries no public document reference or Canadian serial allocator; those belong to Phase 18. Explicitly not `contribution_receipt_snapshots`.
- receipt tax-facts child (multi-benefit QPQ lines) — normalized child only for the rare multi-benefit gift.
- no Phase 7 document-number allocator: Phase 18 owns the U.S. reference and exact-issuer Canadian serial authorities, while Phase 7 supplies any required source-owned issuance authorization.

**Downstream Phase 19 run contract — not Phase 7 tables:**

- Phase 19 defines `statement_runs`, recipient/items, exclusions, and run recovery. Phase 7 supplies only the immutable inclusion/facts package and source-owned exclusion reason authority those rows reference. This historical table sketch is superseded and MUST NOT be dispatched as a Phase 7 schema task.
- `statement_versions` — immutable source-owned per-recipient facts version (version number, supersedes link, status and snapshot identity). Phase 18 owns generated-document identity/current artifact; Phase 17 owns notification outcome.
- `statement_inclusion_snapshots` — the frozen facts DTO (frozen donor identity, ordered lines, totals, IRS substantiation text, exclusions, content_hash). Named "inclusion snapshot" to avoid collision with Studio's render "artifact/snapshot"; mega-donor line detail spills to a child table; never stores PDF bytes.
- `statement_live_cache` — the live running-summary cache (totals, source_max_updated_at, computed_at).

**New columns on existing tables:**

- `donations`: `gift_method` (TEXT+CHECK), `received_date`, `postmark_date`, `delivery_basis` (TEXT+CHECK), `deposit_reference`. `gift_date` is now the resolved date-of-delivery (contract change). `entry_date` = `created_at::date` (no new column). Tax-facts fields are frozen onto the receipt version (source policy on fund); the PRD locates the mutable per-gift/per-line source vs the frozen receipt value explicitly.
- `donors`: `party_id` — NOT NULL composite FK to `parties` from the first migration (`party_kind` lives on `parties`; `donors.party_type` is **never created** — amended 2026-07-06 per Phase 9 §C2). The party spine replaces free-text `type` and `organization` (an org-kind donor reaches its org profile through `party_id`).
- `tenants.org_settings`: `tax_timezone` (IANA, default `America/New_York`), `prior_year_backdate_cutoff`.
- `contribution_adjustments.effective_values`: add `giftDate` + `deliveryBasis` (do **not** add tax semantics — the closed shape stays amount/fund/missionary/paymentStatus/designationLines).
- funds/designations: `deductibility_policy`.
- `contribution_receipt_snapshots` is a Phase 18 D17 removal target. The final Phase 7 `contribution_receipts` facts record freezes legal donor identity directly from first write; there is no interim dual authority or overlap period.
- Phase-2 `rendered_locale` on receipts (populated + frozen); a jurisdiction axis (new; not reserved on `sites` today).

**New enums / types / reservations Phase 7 populates:**

- `party_kind ∈ {person, household, org}` + reserved `'group'` on `parties`, with `org_type` on the org subtype (`donors.party_type` is never created — amended 2026-07-06 per Phase 9 §C2), `credit_role`, `document_type`, tribute type, `gift_method`, `delivery_basis`, receipt eligibility reason codes, receipt lifecycle actions, matching-gift lifecycle status, statement run/recipient/item/exclusion/version statuses (all TEXT+CHECK, not native enums). _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14: the authoritative `credit_role` and lifecycle-state registries now live in Phase 14 — the fixed credit-role set with amount classes, the tribute notify-party frequency values (incl. `once`), and the six matching-gift-expectancy states `identified | submitted | received | reversed | closed | superseded`.)_
- `contribution_adjustments` action type `gift_date_correction` (reuse existing `receipt_correction`/`statement_correction`/`refund`/`payment_state_correction`).
- `crm_link_entity_type` + `CrmIdentityConceptId` — extension re-scoped by ADR-0001 (see C4): no longer a Phase 7 deliverable; extend identically with `household`, `organization`, `daf_sponsor`, `person`, `gift_credit` only if/when generalized provider links actually need the new members.
- Phase-6 comms kinds `acknowledgment`, `notification`, `receipt_void`, `statement_supersede` (`receipt` exists); retention (receipt/void/supersede = official, ack/notification = operational); visibility `credited_party_visible`; related-types `gift_credit`, `tribute`, `donation_tribute`, `matching_gift`, `party`, `person`, `household`, `org_contact`.

### E. Contracts & wiring

- **E1 — Receipt/statement facts become a typed Phase 18 Facts Package.** Phase 7 freezes raw structured values, approved display facts, source revision, recipient/subject, eligibility/correction/issuance authority and policy fingerprint. Phase 18 validates that package against the exact Document Purpose Contract and Approved Data View, then alone renders/stores the artifact. Templates bind approved semantic facts and never compute or query live records.
- **E2 — `charge.dispute.*` ingestion.** Extend the Stripe event processor (durable Inngest path) to handle `charge.dispute.created/closed` + `charge.dispute.funds_withdrawn/reinstated`, mapping ACH returns → void and card disputes → hold/void/reinstate, idempotent on the Stripe event id.
- **E3 — Single-gift issuance path.** Wire issue-on-accept + void-on-negative into the Stripe event processor (durable, not inline in the webhook), keyed on `donation.id` + the frozen snapshot so the staged-gift delivery path calls **into** the shared issuance, and manual/imported/historical gifts (no staged gift) can be receipted.
- **E4 — Reconciliation.** A scheduled Inngest function reconciles payment state ↔ receipt version and runs the ACH finality watch through the ~60-day window, flagging any gift whose latest fold value disagrees with its newest non-voided receipt version.

### F. ADRs (decisions worth recording; hard to reverse, surprising without context, real trade-offs)

- **F1** — Receipt/statement truth is an immutable versioned facts/inclusion record that references — never forks — the money-truth adjustment ledger.
- **F2** — Receipt eligibility requires source-confirmed successful/received money; ACH initiation/processing is not a receipt, later returns create exact inverse/correction effects, and card disputes retain their contestable lifecycle.
- **F3** — One hard-credit legal donor owns the receipt; soft credit is structurally non-receiptable; the three-document wall (receipt/acknowledgment/notification) is enforced by document class.
- **F4** — DAF grants receipt the sponsor and give the advisor a $0-deductible acknowledgment; matching gifts are two donations.
- **F5** — The year-end statement is a frozen, versioned inclusion snapshot (official) + a labeled live running view; supersede-not-edit on post-issue corrections.
- **F6** — Phase 19 owns statement runs/populations; Phase 7 owns inclusion facts; Phase 18 owns item generation/artifacts. Durable claims and database invariants guarantee item truth.
- **F7** — Gift tax year = one resolved, stored date-of-delivery (postmark governs mailed checks) in the tenant tax timezone; backdating is append-only + approval-gated + cutoff-bounded; no fiscal-close engine.
- **F8** — Phase 17 delivers the exact Phase 18 artifact through the single Phase-6 seam with version-scoped occurrence identity; no Phase 7 sender or rerender path exists.
- **F9** — Phase 18 performs one environment-gated destructive pre-production cut to the canonical generated-document system; contrary production evidence stops work for re-grooming.
- **F10** — Phase 7 builds the Phase-4-reserved party spine but inherits Phase 4's isolation foundation; it does not re-invent tenant-safety plumbing.

---

## Testing Decisions

Good tests here assert **external behavior and compliance invariants**, not implementation details, and the safety tier is **permanent** because this is money and tax documents. Prior art: the repo's existing negative/structural tiers (cross-tenant isolation tests, the Phase-6 sole-seam lint pattern, the contribution-operations idempotency/approval tests). Modules B1–B8 are each tested behind their stable interface; the deepest coverage goes to the pure resolvers (B1 eligibility, B4 date-of-delivery, B5 inclusion) which are exhaustively table-driven.

**Permanent negative/safety test tier (a failure fails the build):**

- Soft credit can **never** enter a deductible total or mint a receipt (`is_receiptable = FALSE` invariant).
- A DAF advisor **never** receives a tax receipt or deductibility language; a DAF grant receipts the sponsor.
- An acknowledgment **never** renders deductibility; a notification **never** renders an amount (structural redaction wall).
- A partial refund **net-reduces** (never drops); a full refund/void voids; an ACH `charge.dispute.created` after issuance supersedes the prior-year statement.
- A supersede re-notifies **exactly once per version**; a same-version retry dedupes; a late `sent` after `bounced` is a no-op.
- Date-of-delivery: check postmarked 2025-12-30 / received 2026-01-03 → **tax year 2025**; check dated 2025-12-31 / postmarked 2026-01-02 → **2026**; a Dec-31-11pm-ET online gift → that year (tax-timezone).
- U.S. acknowledgment references and Canadian exact-issuer serials satisfy the Phase 18 identity policies under concurrency; Canadian serials are unique, never reused, and disposition-accounted, and a formal replacement receives a new serial that cites the predecessor.
- Cross-tenant isolation: no receipt/statement/party/credit row ever crosses a tenant.
- The emailed receipt amount equals the frozen snapshot amount after a correction (bug #2 regression test).

**Structural CI gates:** the sole-seam import lint (no provider send outside the seam; `test-send.ts` fixed), and the legacy-symbol grep (build fails if the live-text donor-portal generator is referenced after cutover).

**Evidence file:** records repo files inspected, the external sources used (IRS Pub 1771 / date-of-delivery / quid-pro-quo, Treas. Reg. 1.170A-1(b), Rev. Rul. 54-465/78-38, Stripe refunds/disputes, Nacha return windows, and the incumbent-CRM references), the tests run, the route/API checks, known gaps, stop conditions, and what Phase 7 intentionally did not build.

---

## Out of Scope

Reserved as seams, **not** built in Phase 7:

- **Live third-party integrations** — DAFpay/Chariot DAF ingestion and Double-the-Donation (or any matching-gift-vendor) sync. Phase 7 builds the full data model + **manual staff entry** end-to-end; the ingestion adapters are reserved.
- **Generated-document authoring, rendering, artifact access, and retention** — Phase 18 owns this entire runtime. Phase 7 owns source eligibility/facts/issuance/correction effect only; Phase 19 owns statement run/items and Phase 17 owns delivery.
- **A fiscal-close / accounting-period engine** — calendar year + a tenant tax timezone only; no per-tenant fiscal-year-start, no period-locking state machine, no GL close/reopen (a cutoff date + high-risk approval covers "closed").
- **Deposit / bank reconciliation** — a single optional `deposit_reference` string only; batching/deposit matching is a later phase.
- **Non-U.S. jurisdiction tax rules** beyond Phase 18's selectively activated, qualified Canadian registered-charity pack; every other jurisdiction remains outside the product claim until separately groomed and reviewed.
- **Accounting exports & reconciliation (Area 11)** — Phase 7's facts make them safe later; the export product is not built here.
- **Public-checkout capture** of tribute/DAF/matching/party-kind — reserved (plumb-not-build) on the Phase 5 handoff; manual staff entry is the Phase 7 path.
- **Full stock/noncash valuation, transfer-agent modeling, Form 8283 handling** — in-kind is described-not-valued; valuation is out.
- **Donor/missionary portal redesign; missionary-facing receipt/soft-credit visibility** — reserved scaffolding only.
- **The retention/DSAR pruning jobs** — classification ships (via Phase 6); the pruning/erasure jobs are the retention phase's.

---

## Further Notes

- **Not legal or tax advice.** The engine encodes best-effort rules from primary sources; **production use requires review by qualified finance/tax counsel.** The jurisdiction axis is the seam for jurisdiction-specific rules. A **counsel-review checklist** ships as a dated evidence artifact covering date of delivery, `$250` written acknowledgment content, quid-pro-quo disclosure over `$75`, in-kind describe-not-value, DAF-advisor non-deductibility, applicable contemporaneous timing, and Phase 18's U.S./Canadian identity rules. January 31 is only a possible service target, and Canada promises controlled uniqueness/nonreuse/accounting rather than mathematical gaplessness.
- **Primary sources (validated during the grill):** IRS Pub 1771; IRS "Written acknowledgments" / "Substantiating charitable contributions" / "Quid pro quo contributions"; Treas. Reg. §1.170A-1(b); Rev. Rul. 54-465 (mailbox rule), 78-38 (card charge date); IRS Pub 526 (date-of-delivery); Treas. Reg. §1.170A-13(f) (payroll-deduction per-withholding); Stripe refunds/disputes/ACH docs; Nacha return-code windows (R01/R05/R07/R10/R11, 2-day admin vs 60-day unauthorized). Incumbent-CRM references (Blackbaud RE NXT receipt series/replace-in-series, Bloomerang giving statements/indirect section, Virtuous receipt-vs-acknowledgment, Salesforce NPSP hard/soft credit, Little Green Light DAF, Double the Donation matching, Fidelity Charitable DAF acknowledgment) informed the model; they are reference, not authority.
- **SiteStacker benchmark:** the product-intent requires a cited SiteStacker/WMTEK receipt/statement doc or an explicit `(s)` not-yet-sourced mark — currently **`(s)` not-yet-sourced**; parity is measured by the outcome (compliant receipts/statements a donor can rely on), not a screen clone.
- **Congruence:** Phase 7 is congruent with Phases 0–6 (a six-lens audit found only additive amendments, since applied to the predecessor PRDs + parity matrix + README + Statement Studio docs). Phase 7 fulfills the Phase-4-reserved identity/party/credit seams.
- **Over-engineering guardrails (explicit):** no fiscal-close engine; no per-gift timestamps for the tax basis (one resolved DATE); no new corrections subsystem (reuse the adjustment ledger); no deposit-reconciliation module; **no recompute-on-read** (freeze at entry); TEXT+CHECK not native enums; a scheduled, enforced contract phase so no dead path lingers.

---

## Evidence & Acceptance

**Done when finance can:**

1. See a receiptable/not-receiptable verdict + reason on every gift, and issue/correct/void/supersede receipts as immutable, numbered, versioned records that reference the money-truth ledger.
2. Have the right document reach the right party for every case — individual, couple/household, organization/church, DAF (sponsor + $0 advisor acknowledgment), matching (company + employee soft credit), tribute (notify-party notification) — with soft credit structurally unable to mint a receipt or enter a deductible total.
3. Enter an offline gift, see and confirm its tax year (postmark-governed), and backdate a legitimate prior-year gift with evidence + approval, bounded by a cutoff.
4. Run year-end statements as frozen, versioned inclusion snapshots (with a live running view, a pre-flight gate, an inclusion explainer, dry-run/test-send, and supersede-on-correction), and explain every inclusion/exclusion.
5. Rely on Phase 17 delivering the exact Phase 18 artifact through the Phase-6 spine with durable, version-scoped communication evidence, and on the three pre-existing bugs being fixed.

**Acceptance artifacts:** the permanent negative/safety test tier + structural CI gates pass; the evidence file is complete; the counsel-review checklist is produced; the parity-matrix rows (7, 9, 10; touch 2, 5, 11) reflect the Phase 7/17/18/19 ownership split; the OpenSpec change + `CONTEXT.md` glossary terms are authored; and Phase 18's environment-gated D17 clean-cut inventory proves every non-production document path is removed without a compatibility runtime.

---

## Tracking Issues

_Epic #566 + children #567–#586 created via `/to-issues`. First-pass breakdown below (final slicing landed during `/to-issues`):_

- **{{EPIC}}** — Phase 7: Receipt & Statement Compliance Rules + Donor Identity/Credit Model.
- **{{T1}}** — Docs: the PRD, the OpenSpec change + `CONTEXT.md` glossary, the 10 ADRs (F1–F10), the counsel-review checklist. _(foundation)_
- **{{T2}}** — Canonical vocabulary + source-of-truth rules (party/hard-credit/soft-credit/receipt-version/inclusion-snapshot; rejected synonyms retired). _(foundation)_
- **{{T3}}** — CRM identity-link enum extension (`household`/`organization`/`daf_sponsor`/`person`/`gift_credit`) — **re-scoped by ADR-0001** (the Twenty-projection rationale is retired): no longer blocking; extend only if/when generalized provider links need it (see C4). _(small)_ _(prereq: C1)_
- **{{T4}}** — Party spine: `parties` supertype + `persons` + `households` + `household_members` + org subtype + `org_contacts` + `party_id` on donors (`party_kind` lives on `parties` — amended 2026-07-06 per Phase 9 §C2). _(prereq: C1)_
- **{{T5}}** — `gift_credits` soft-credit ledger + `is_receiptable=FALSE` invariant + the three-document wall + credit resolver (B3). _(blocked on T4)_ _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14: T5/#571 is RESCOPED to receipt/statement CONSUMPTION of the Phase 14 credit read models — Phase 14 takes build ownership of all six credit objects; `gift_credits` is renamed `contribution_credits`.)_
- **{{T6}}** — DAF (`daf_sponsors`), matching-gift lifecycle, tribute (+ notifications) models + routing. _(blocked on T5)_ _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.14: T6/#572 is RESCOPED to receipt/statement CONSUMPTION of the Phase 14 credit read models — the DAF/matching/tribute objects (`daf_sponsors` party-extension + `party_payer_aliases`, `matching_gift_expectancies` + `matching_gift_settlements`, `tributes`/`contribution_tributes`/`tribute_notify_parties`) are built by Phase 14.)_
- **{{T7}}** — Date-of-delivery resolver (B4) + `gift_method`/`received_date`/`postmark_date`/`delivery_basis` columns + tenant `tax_timezone` + the UTC-bug fix. _(foundation-ish)_
- **{{T8}}** — Offline gift-entry flow + backdating governance (evidence, cutoff, separation-of-duties, `gift_date_correction`). _(blocked on T7)_
- **{{T9}}** — Fund deductibility policy + lean per-gift/per-line tax facts + resolver (B8). _(foundation-ish)_
- **{{T10}}** — Receipt eligibility evaluator (B1) + the issue-on-accept/void state machine + `receipt_status` formalization. _(blocked on T9)_
- **{{T11}}** — `charge.dispute.*` ingestion in the Stripe event processor (E2) + the single-gift issuance path (E3) + reconciliation (E4). _(blocked on T10)_
- **{{T12}}** — `contribution_receipts` immutable versioned source-facts core (B2) + immutability trigger + source-authorized correction/supersede; no document number/serial allocator. _(blocked on T10; document identity belongs to Phase 18)_
- **{{T13}}** — Statement inclusion/facts engine (B5) + immutable source package/exclusions + explicitly non-official live running view. It does not own a statement run, generated artifact, delivery, or compatibility flag. _(blocked on T12)_
- **{{T14}} — SUPERSEDED / DO NOT DISPATCH IN PHASE 7.** Phase 19 owns statement runs/populations/items and Phase 18 owns each generated item/artifact.
- **{{T15}} — SUPERSEDED / DO NOT DISPATCH IN PHASE 7.** Phase 17 owns the wrapper and delivery through Phase 6; Phase 18 supplies the exact artifact. Keep only Phase 7's typed source occurrence and correction meaning.
- **{{T16}}** — Mission Control full interactive receipt-eligibility explainer + version/correction/void history. _(blocked on T12)_
- **{{T17}}** — Donor-portal source eligibility/explanation and running-summary facts only; Phase 18 owns the persistent document list/current head and per-request authorized artifact access. The legacy live-text route is a Phase 18 D17 direct-removal target, not an additive contract phase. _(blocked on T13; consumes Phase 18)_
- **{{T18}}** — Formatting authority: freeze rendered strings + raw values into snapshots (Phase-2 currency metadata + frozen `rendered_locale`); fix `formatMoney`/mixed-currency. _(blocked on T12, T13)_
- **{{T19}} — SUPERSEDED / DO NOT DISPATCH.** Phase 18 D17 permits no document migration/backfill/compatibility runtime. Any still-valid Phase 7 source-fact normalization belongs in its owning source-facts ticket; prototype document paths are deleted only after the environment assertion passes.
- **{{T20}}** — The permanent negative/safety test tier + structural CI gates + the evidence file, including contract tests at the Phase 7 facts boundary and explicit downstream ownership checks. _(blocked on the still-valid Phase 7 tickets; superseded T14/T15/T19 are not dependencies)_

**Related:** program charter + parity matrix (`README.md`, `parity-matrix.md`); predecessor epics Phase 2–6. **Prerequisites (must land first):** Phase 4 isolation foundation (C1), Phase 6 comms spine + seam (C2), Phase 3 consent gate PR #502 (C3).

## Dated Phase 17 official-document presentation amendment (2026-07-19)

**Old statement.** Phase 7 owns receipt/statement rules, frozen facts, the
three-document wall, official versions, and delivery eligibility; earlier
template prose does not yet distinguish a protected truth core from editable
surrounding message content or an expiring sent-email support copy.

**New winner.** Phase 7 and the applicable statement phase continue to own the
authoritative legal donor/recipient, organization identity, amount/currency,
gift date, deductibility/goods-or-services result, document identity,
correction/void/supersession state, currentness, and official artifact handoff.
Phase 17 may let a tenant author the allowed surrounding voice and visual
presentation around those source-owned protected fact/action nodes through an
immutable publication. The message contract determines which nodes cannot be
removed, relabeled, hidden, or contradicted.

**Compatibility boundary.** Phase 17 never decides receipt eligibility,
deductibility, amount, document currentness, void/supersession, or artifact
truth. A Phase 17 email wrapper or Recent sent copy may expire while the Phase 7
official artifact and Phase 6 delivery evidence remain available. The recent
copy is not the official document and cannot reconstruct, resend, correct, or
supersede one. Receipt, acknowledgment, and notification document classes keep
their existing forbidden-field walls.
