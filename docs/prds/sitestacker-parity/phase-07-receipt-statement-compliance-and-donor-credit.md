# Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model

> **Program:** SiteStacker Parity · **Phase:** 7 · **Status:** Groomed (grill-with-docs, 2026-07-05) · **Base:** `develop`
> **Predecessors:** Phase 1 (CRM Operating Foundation) · Phase 2 (Site, Locale & Currency) · Phase 3 (Minimum Permission & Role-Scoped Projection) · Phase 4 (Identity & Account-Claiming) · Phase 5 (Public Website Runtime Contract) · Phase 6 (Shared Communication Event Model)
> **Hard dependencies (must ship first):** Phase 4 tenant-isolation foundation slice · Phase 6 communication-event spine + `sendEmail` seam · Phase 3 consent gate (in-flight, PR #502, **unmerged**)
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md` (Areas 7, 9, 10; touches 2, 5, 11)
> **Production gate:** requires review by qualified finance/tax counsel before production use (this document is not legal or tax advice).

Modern SiteStacker parity for the **finance/legal record foundation** of the platform — a **rules-first engine that decides what is receiptable, who the legal donor is, what facts a receipt or year-end statement asserts, how corrections/voids/supersedes work, and how annual statements are generated — before any template renders a single document** — built on a **full donor-identity/credit model** (party spine, hard vs soft credit, DAF, matching gifts, households, tributes) so the right document always goes to the right party. This is a **foundation-and-consolidation** phase: the money-truth adjustment ledger, correction/approval machinery, receipt-delivery policy, contribution audit trail, the Inngest durable-workflow substrate, and the PDF/Statement Studio render layer **already ship**. What is missing is the **brain** — the rules, the immutable versioned facts, the credit model, and the correct tax-year — that those systems render, deliver, and report. Phase 7 adds that brain, **references** (never forks) the money-truth ledger, **reuses** (never rebuilds) the delivery/approval/audit machinery, builds the Phase-4-reserved identity/party spine on top of Phase 4's isolation foundation, wires all donor-facing documents through the Phase-6 communication seam, and migrates additively — so that **finance can explain why any gift did or did not get a receipt, issue/correct/void/supersede receipts and year-end statements from audited rules, and no legally-wrong document ever reaches the wrong party.**

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

If PDF/Statement Studio templates, year-end statement operations, accounting exports, or offline batches ship before these rules exist, each one invents its own tax truth — the precise fragmentation this program exists to prevent. The recon for this phase confirmed the durable substrate (adjustment ledger, correction/approval machinery, delivery policy, contribution audit, Inngest runtime, render layer) already exists; what is missing is the **rules-first brain and the credit model** that make them one finance record.

## Solution

A **rules-first, server-only receipt & statement engine** — the system of record for _the official facts of a donor communication about money_ — built on a **full donor-identity/credit model**, that **references** (never forks) the money-truth adjustment ledger, **reuses** the shipping correction/approval/delivery/audit machinery, renders **through** PDF/Statement Studio (which never invents truth), and delivers **through** the Phase-6 communication seam. Twelve moving parts, built from the finance-operator, donor, and staff point of view so the platform issues one coherent, defensible finance record:

1. **The receipt as an immutable, versioned facts record (`contribution_receipts`).** A durable row that **freezes the approved acknowledgment at issuance** — org legal name/EIN, cash amount, gift date, deductible amount, goods-and-services statement + FMV, intangible-religious-benefits statement, in-kind description, and the frozen legal-donor name+address+party type. Once issued it never mutates. A correction or partial refund **issues a new version** (base receipt number + version suffix, prior retained/void-audited); numbering is a **per-tenant gapless-safe allocator** (jurisdiction-gated). It **references** the adjustment ledger by an explicit cursor; it does **not** widen the ledger with tax semantics. The demoted `contribution_receipt_snapshots` becomes a legacy annotation, never the system of record.

2. **Issue-on-accept eligibility with a per-method state machine.** A first-class, **reason-carrying** rule decides receiptability from the gift's _effective_ state (via the shipped `deriveEffectiveContribution` fold), enforced at both **issuance** and **read**. A receipt issues as soon as a gift is **accepted** — card on capture, ACH on `payment_intent.processing` (pre-settlement, for donor UX), offline on recorded-received — settlement is a **no-op**, and a receipt is voided/superseded **only** on a negative terminal event. ACH post-success returns arrive as `charge.dispute.created` (final → void immediately); card disputes are contestable (hold → void on lost, reinstate on won); a partial refund **supersedes with a reduced amount**. A minimal, jurisdiction-aware policy surface (`hold_ach_receipt_until_settled`, `ach_hold_window`, `high_value_ach_threshold`, `year_end_ach_policy`) keeps it pro-donor by default without a combinatorial matrix.

3. **The full donor-credit model behind every document.** Every gift has **exactly one hard-credit legal donor** (`donations.donor_id`, the sole receipt owner and frozen-snapshot subject) and **zero or more soft credits** (`gift_credits`, recognition-only, `is_receiptable = FALSE` — a hard invariant that never enters a money total). Donor becomes a typed **party** (individual / household / organization / church / business / DAF-sponsor / foundation). A **household is a group of persons, never an account that absorbs them.** DAF grants receipt the sponsor and give the advisor a **$0-deductible acknowledgment**; a matching gift is **two donations** (employee gift + company match receipted to the company); a tribute is a gift annotation whose notify party gets a **notification**, never a receipt.

4. **The three-document wall, enforced structurally.** A **tax receipt** (legal donor only; may carry deductibility + EIN), an **acknowledgment** (soft-credited parties; **no** deductibility language), and a **notification** (tribute notify party; **amount hidden**; never a tax document). Acknowledgment and notification templates have **no access to deductibility or amount merge-fields** — a wrong-party tax statement is impossible by construction, not by staff memory.

5. **The year-end statement as a frozen inclusion snapshot + a live view + versioning.** A **statement run** is an async batch that computes a frozen `statement_inclusion_snapshots` (which gifts included, which excluded **with reasons**, deductible vs indirect totals, legal-donor/household grouping) — the official/audit record — plus a **live "running summary"** portal view (recomputed on demand, cached, explicitly labeled non-official), plus **statement versioning** (a post-run correction issues a superseding version, prior retained, donor re-notified). Inclusion is driven by the credit model: DAF/soft-credit/matched gifts go in a separate labeled indirect section, never the deductible total; refunds net-reduce; households roll up to one deduped statement.

6. **A high-performance, resumable statement batch.** The run reuses the repo's **durable outbox → work-claim → per-recipient Inngest function → recovery-scan** pattern: keyset-paged set-based seeding, a cron-drain fan-out that respects Inngest limits, one inclusion RPC per recipient (no N+1), content-hash idempotency, per-tenant concurrency, and a first-class auditable exclusion set — sized to complete the year-end population before the ~Jan 31 contemporaneous deadline.

7. **Correct tax year by stored date-of-delivery.** A single **delivery date is resolved once at ingestion/entry, in the tenant tax timezone, and stored** in `gift_date` (never recomputed on read): card/ACH = settlement; mailed check = **postmark** (the IRS mailbox rule — the written check date is not authoritative); hand-delivered/cash/in-kind = received; private carrier = received. A `delivery_basis` field records which input governed. An **offline gift-entry** flow captures postmark + received date, shows the computed tax year before save, and warns on a year-boundary straddle. **Backdating** to a prior year is permission-gated, evidence-required, cutoff-bounded, and separation-of-duties-approved when it crosses an issued-statement year — append-only, never a silent rewrite. This fixes the shipped UTC year-bucketing bug.

8. **Lean tax facts from a fund deductibility policy.** Deductibility is sourced from a **fund/designation policy** (fully-deductible / has-goods-services / non-deductible / in-kind) so most gifts are correct by default; a small set of frozen per-gift/per-line fields (deductible amount, goods-services FMV, quid-pro-quo, in-kind description) with per-gift override; a normalized benefit child table **only** for the rare multi-benefit gift. Split gifts may carry **mixed deductibility per designation line**.

9. **Delivery through the Phase-6 seam; the three pre-existing bugs fixed.** All three document types send **through the one Phase-6 `sendEmail` seam** (captured as communication events by construction); delivery status attaches (Phase 6 owns tracking, Phase 7 owns generation); a void/supersede emits a `receipt_void`/`statement_supersede` communication (official retention) + an **idempotent, version-scoped** re-notification. Three shipped bugs are fixed as part of this: the version-less idempotency key that would silently drop a second correction notice, the delivery path that emails a stale amount after a correction, and the generators that leak the donor's amount/deductibility to soft-credited and notify parties.

10. **A finance explanation surface.** Mission Control gains a **full interactive receipt-eligibility explainer**: per-gift, why included/excluded, deductible vs indirect, the audited reason, the version history, and the correction/void trail — so finance can defend any receipt and answer "why isn't my gift here?" from the screen.

11. **Additive, backward-compatible migration (expand → migrate → contract).** New columns are nullable; historical online gifts get `delivery_basis='settlement'` + an inferred `gift_method`; the dormant `receipt_status` values are formalized by the eligibility rule (no schema change); the donor-portal live-text paths are replaced behind a **shadow-compared feature flag** and then **deleted** (a scheduled contract-phase deliverable, enforced by a CI symbol-grep). No destructive backfill.

12. **A privacy-, audit-, and counsel-governed posture.** Role-scoped visibility via the Phase-3 chokepoint (donor self-download always allowed; delivery to others consent-gated; Stripe ids never on a receipt; households scoped member-by-member); a permanent **negative/safety test tier** and structural CI gates; an **evidence file**; and an explicit **counsel-review gate** before production, with the jurisdiction axis as the seam for counsel input.

Underneath, everything lives **server-only at the Asym boundary** in new `packages/api/src/receipts` and `packages/api/src/statements` modules; the receipt/statement facts are the **single source of truth** that PDF/Statement Studio renders and never invents; and every deferred concern — live DAFpay/matching-vendor integrations, the full Studio template product, a fiscal-close engine, bank reconciliation, non-US tax rules beyond the reserved jurisdiction gate — is a **reserved seam**, not a build.

---

## User Stories

### Finance operator (Mission Control)

1. As a **finance operator**, I want every gift to carry a clear receiptable/not-receiptable verdict with a plain-language reason, so that I can answer "why did this gift get a receipt — or not?" without reverse-engineering it.
2. As a **finance operator**, I want a receipt to issue automatically the moment a gift is accepted (even a pre-settlement ACH gift), so that donors get their record immediately.
3. As a **finance operator**, I want a receipt to be an immutable, numbered, versioned record, so that I can always show exactly what a donor was told and when.
4. As a **finance operator**, I want a correction or partial refund to issue a new receipt version (keeping the original number with a version marker) and retain the prior, so that the audit trail is legible and nothing is silently overwritten.
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
24. As a **donor**, I want a permanent, never-expiring link to my official statement and a list of every tax year, so that tax prep for any year is one click.
25. As a **donor** in a household, I want one joint statement for our household with a combined deductible total, so that my spouse and I don't receive two conflicting documents.
26. As a **donor**, I want my deductible gifts, indirect/soft-credited gifts, and in-kind gifts shown in clearly separate sections, so that I know exactly what I can deduct.
27. As a **donor** whose statement was corrected, I want to see the superseded version, a "corrected" badge, and a plain-language explanation of what changed, so that I understand and can amend my return if needed.
28. As a **DAF advisor**, I want a warm thank-you that clearly states it is not a tax receipt, so that I am acknowledged without being misled about deductibility.

### Organization / staff operator

29. As an **organization admin**, I want the deductibility of gifts to a fund configured once at the fund level and inherited by every gift, with per-gift overrides, so that receipts are correct by default without per-gift data entry.
30. As an **organization admin**, I want my organization's receipt numbering and jurisdiction (US non-gapless vs Canada gapless) to be tenant-configurable, so that our numbering matches our legal regime.
31. As a **staff operator**, I want to enter a DAF gift, a matching gift, a household, or a tribute and have the right documents route to the right parties automatically, so that the credit model does the compliance work for me.
32. As an **organization admin**, I want every backdate, void, correction, and statement run recorded in an immutable audit trail, so that our finance actions are tamper-evident.

### Developer / platform

33. As a **developer**, I want the receipt/statement facts to be the single source of truth that PDF/Statement Studio only renders, so that no template can invent tax truth.
34. As a **developer**, I want soft credit to be structurally incapable of minting a receipt or entering a money total, so that the most damaging correctness bug is impossible.
35. As a **developer**, I want all three document types to send through the one Phase-6 seam with a version-scoped idempotency key, so that no send bypasses the audit log and no correction notice is double-sent or dropped.
36. As a **developer**, I want the migration to be additive expand → migrate → contract with a scheduled deletion of the legacy path, so that nothing existing breaks and no dead code lingers.
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

- **A3 — One authoritative representation of "receipt changed."** The versioned `contribution_receipts` row is the single tax-truth authority. The existing `contribution_corrections.correction_type` values (`receipt_correction`/`statement_correction`) and the `receipt_effect`/`statement_effect` JSONB are demoted to **legacy operational annotations derived from the version**, never independent authors of receipt truth. `contribution_receipt_snapshots` is **not** the system of record and is not extended into one. (D1 R3/R4.)

- **A4 — DB-enforced immutability + gapless-safe numbering.** `contribution_receipts` carries a BEFORE UPDATE/DELETE trigger rejecting mutation of frozen columns (mirroring the shipped tenant-integrity trigger), a `NOT NULL`/`RESTRICT` FK to the causing adjustment/correction, and a per-tenant number. Numbering uses a **dedicated per-tenant allocator with a gapless-safe locking strategy — explicitly not a bare Postgres `SEQUENCE`** (gap-prone on rollback, which would silently violate the CRA-gapless requirement). A superseding version **keeps the base receipt number + a version suffix**; the base number is stable across a receipt's version chain. Gapless-serial enforcement is gated behind a tenant tax-regime flag (US = non-gapless allowed; Canada/CRA = gapless required). (D1 R4/R5, D9#2.)

- **A5 — Eligibility is a reason-carrying rule, enforced at issuance and read.** A pure evaluator reads the gift's effective state and returns `{ eligible, reason_code, evaluated_at }`; issuance creates no receipt version when not eligible (recording the reason), and every read/download path re-checks (or reads the frozen verdict / latest non-voided version). This finally assigns the dormant `receipt_status` values `not_required` and `suppressed`. Payment/refund state is Asym-owned and computed from the effective fold — Stripe reports state; it never decides receiptability. (D2.)

- **A6 — Issue-on-accept per payment method; settlement is a no-op; negative terminal events void/supersede.** "Accepted" = card captured / ACH `payment_intent.processing` / offline recorded-received (never `requires_payment_method`/`requires_action`/`requires_capture`/`canceled`). The receipt lifecycle actions are `issue | noop_confirm | void | supersede_reduced | under_review_hold | no_receipt | reinstate`, keyed by (event, method). **ACH post-success returns arrive as `charge.dispute.created`** (final, non-contestable → void immediately + notify); **card disputes** withdraw funds but are contestable → `under_review_hold` on `created`, `void` on `closed/lost`, `reinstate` on `closed/won`; **partial refund** → `supersede_reduced`. This requires new `charge.dispute.*` ingestion in the Stripe event processor (a currently-unhandled correctness hole). (D2.)

- **A7 — Jurisdiction/method policy knobs, not a matrix.** Default issue-on-accept everywhere. The only knobs: `hold_ach_receipt_until_settled` (default off US, forced on for CRA/stricter), `ach_hold_window`, `high_value_ach_threshold`, `year_end_ach_policy`. Everything else (void-supersede, donor notification, statement exclusion, audit, idempotency) is always-on. (D2.)

- **A8 — One hard-credit legal donor per gift; soft credit is recognition-only and structurally non-receiptable.** `donations.donor_id` stays the single legal donor and sole receipt owner (unchanged invariant). `gift_credits` holds 0..N soft credits with `is_receiptable = FALSE` enforced by DB CHECK **and** service layer; a soft credit can never mint a receipt or enter any money/receipt/cash total. Do not add a second donor FK to `donations`. (D3.)

- **A9 — Donor is a typed party; a household is a group of persons, never an account that absorbs them.** `party_type ∈ {individual, household, organization, church, business, daf_sponsor, foundation}` replaces free-text `donors.type`. Individuals resolve to a `persons` anchor; households are a group with a primary/address-of-record and time-bound membership; org/church/business/DAF/foundation carry an org profile (EIN, legal name, subtype) and org-contacts (the human signer, soft-credited). (D3, D4.)

- **A10 — The three-document wall is structural.** `document_type ∈ {receipt, acknowledgment, notification}`. Tax receipt → legal donor only (deductibility + EIN allowed). Acknowledgment → soft-credited parties (**no** deductibility merge-fields available to the template). Notification → tribute notify party (**amount hidden**, never a tax document). DAF advisor = acknowledgment with $0 deductible + "this is not a tax receipt." (D3, D7 bug #3.)

- **A11 — Matching = two donations; tribute = annotation; recurring = per-installment.** An employer match is a **separate** donation with `donor_id` = the company (its own receipt); the employee gets a soft credit only. A tribute is a gift-level annotation whose notify party gets a notification. A pledge commitment is never receiptable; each **paid installment** is its own receiptable gift; the annual statement aggregates installments. (D3.)

- **A12 — Year-end statement = frozen inclusion snapshot + live view + versioning.** `statement_runs` (batch header) → `statement_run_recipients` (per-recipient work ledger/outbox) → `statement_versions` (immutable per-recipient version, base statement number + version) → `statement_inclusion_snapshots` (frozen facts DTO). The **frozen** snapshot is the official/audit record; a **live** portal view (cached in `statement_live_cache`, staleness-probed) is the running summary, always labeled non-official; a post-run correction issues a superseding version and re-notifies. Deductible total = hard-credit legal-donor, receiptable, personally-deductible lines only; soft-credit/DAF/matched go to a labeled indirect section; refunds net-reduce; in-kind described-not-valued; **no aggregation of sub-$250 gifts** (IRS-explicit); households roll up to one deduped statement. (D5.)

- **A13 — The statement batch reuses the shipped durable pattern.** Outbox (`statement_run_recipients`) → work-claim RPC (`acquire_statement_target`) → per-recipient Inngest function (per-tenant concurrency) → cron-drain fan-out + recovery-scan, mirroring the shipped donation-saga. Keyset-paged set-based seeding; one inclusion RPC per recipient (LATERAL fold, no N+1); content-hash idempotency + partial-unique-live-version guard; first-class auditable exclusion set; events carry pointers (ids), never rendered content. Respect Inngest's 1000-step/5000-event/4MB limits by construction. (D5.)

- **A14 — Tax year = one resolved, stored date-of-delivery in the tenant tax timezone; never recomputed on read.** Resolution at ingestion/entry: card/ACH = settlement timestamp → DATE in tax timezone; **mailed check = postmark** (the written check date is not authoritative — IRS mailbox rule); hand-delivered/cash/in-kind = received; private carrier = received (no USPS postmark). `delivery_basis ∈ {postmark, received, settlement}` records which input governed. Stored in `gift_date`; `tax_year = year(gift_date)`. Fixes the shipped UTC year-bucketing bug via a tenant `tax_timezone`. (D6.)

- **A15 — Backdating is append-only, evidence-required, cutoff-bounded, and approval-gated across tax years.** True backdating (`gift_date` year < entry year) requires a non-suppressible reason + evidence (postmark for checks); crossing into a year whose statements issued routes through separation-of-duties approval and supersedes that year's statement; a tenant `prior_year_backdate_cutoff` (default ~Jan 31) bounds it, and backdating past the cutoff / older than the prior year is blocked without an elevated capability. All via the shipped adjustment ledger (`gift_date_correction` adjustment/action type); `gift_date` is never rewritten in place. (D6.)

- **A16 — Tax facts from a fund deductibility policy + lean per-gift/per-line fields.** A fund/designation `deductibility_policy ∈ {fully_deductible, has_goods_services, non_deductible, in_kind}` drives auto-populated per-gift facts; legacy funds default to `fully_deductible`; split gifts may carry **mixed deductibility per designation line**; per-gift/line overrides take precedence. Frozen facts on the receipt version: deductible amount, goods-services FMV, quid-pro-quo, in-kind description, is-deductible. A normalized benefit child table is added **only** for the rare multi-benefit gift. In-kind: deductible amount `NULL` (excluded from the deductible SUM), described-not-valued. (D6-B, D9#1/#6.)

- **A17 — All donor-facing documents deliver through the Phase-6 seam; three shipped bugs are fixed here.** Receipt/acknowledgment/notification and void/supersede notices route through the one `sendEmail` seam (captured by construction; delivery attaches, never decides eligibility). Fix, as part of this: (a) **version-scope the idempotency key** on (document, version, kind, party) so a second correction notice can't collide/drop; (b) render delivery from **approved facts / effective values**, not the stale staged-gift row + `new Date()`; (c) a **structural kind-aware redaction wall** so a notification can't leak the donor's amount and an acknowledgment can't carry deductibility. Retention: receipt & receipt_void & statement_supersede = `official`; acknowledgment & notification = `operational`; visibility fail-closed `staff_only` + a `credited_party_visible` path. (D7.)

- **A18 — Formatting authority: freeze rendered strings into the snapshot; templates bind, never compute.** Phase 7 freezes canonical, locale-correct display strings (via Phase 2's currency-metadata primitive and the frozen `rendered_locale`) **and** the raw structured values into the immutable snapshot; PDF/Statement Studio merge-tags bind both and never compute — so a receipt renders identically forever and a later formatter change cannot alter an issued document. Fixes the `formatMoney` /100 + `en-US` hardcode and the mixed-currency statement total. (D9#4, Phase 2.)

- **A19 — Migration is additive expand → migrate → contract with a scheduled, enforced contract phase.** New columns nullable; `gift_method` and `delivery_basis` are **TEXT + CHECK (not native enums)**; `receipt_status` dormant values are formalized with no schema change; `delivery_basis='settlement'` is a batched historical backfill assigned at write-time by domain logic (not a static column default); the donor-portal live-text path is replaced behind a shadow-compared feature flag and then **deleted**, with a CI symbol-grep failing the build if the legacy generator is still referenced post-cutover. One shared free-text→`gift_method` normalizer prevents drift. (D7, D9.)

- **A20 — Phase 7 builds the Phase-4-reserved party spine but inherits, never re-invents, Phase 4's isolation foundation.** The `persons` anchor, party tables, `gift_credits`, tributes, matching, org profiles/contacts, and the frozen legal-donor snapshot column are built here (fulfilling Phase 4 reservations), but every new table uses composite `(tenant_id, id)` keys, `ENABLE`+`FORCE` RLS, the tenant-guard wrapper, and a cross-tenant negative-test CI row — all inherited from Phase 4's isolation slice, which is a **hard prerequisite that ships first**. (D4.)

### B. Deep modules (built in isolation, tested behind a stable interface)

- **B1 — Receipt eligibility evaluator.** Input: a gift's effective state + method + policy. Output: `{ eligible, reason_code, evaluated_at }`. Pure, exhaustively table-tested against the D2 state machine. No I/O.
- **B2 — Receipt facts + versioning core.** Freezes the approved facts against an adjustment cursor, allocates the number, enforces immutability, supersedes on correction. The A1/A4 keystone.
- **B3 — Credit resolver.** Given a gift + party graph, resolves the one hard-credit legal donor and 0..N typed soft credits (household, DAF advisor, matching employee/company, org signer, tribute), enforcing `is_receiptable = FALSE`. Drives document-type routing.
- **B4 — Date-of-delivery resolver.** Given method + postmark/received/settlement inputs + tenant timezone, returns `{ gift_date, delivery_basis, tax_year }`. Pure; the A14 core.
- **B5 — Statement inclusion engine.** Given tenant + tax year + recipient, returns the frozen inclusion set (included/excluded lines + reasons, deductible/indirect totals, grouping). Reused by both the batch build and the live view. The A12 core.
- **B6 — Statement run orchestrator.** The durable batch (seed → claim → build → render-handoff → recovery), reusing the shipped workflow substrate. A13.
- **B7 — Document delivery adapter.** Routes the three document types + void/supersede notices through the Phase-6 seam with the version-scoped idempotency key and the redaction wall. A17.
- **B8 — Fund deductibility policy resolver.** Resolves per-line deductible/goods-services/in-kind facts from fund policy + overrides. A16.

### C. Predecessor plug-ins & prerequisites (dependency sequencing)

Phase 7 sits on a stack of predecessors that are **not yet built**. The PRD states this plainly; tickets may be authored and net-new work prototyped in parallel, but Phase 7 must not merge to `develop` until the hard prerequisites land.

- **C1 — Phase 4 tenant-isolation foundation (HARD, not started).** Composite `(tenant_id, id)` keys, `ENABLE`+`FORCE` RLS, tenant-guard wrapper, canonical email-normalizer, cross-tenant negative-test CI tier, and the inert `persons` anchor must ship first. Phase 7 builds the party/credit spine on top and inherits this plumbing (A20).
- **C2 — Phase 6 communication-event spine + `sendEmail` seam (HARD, groomed-PRD-only).** No `communication_events`/`retention_class` exists in code and there is no single send seam yet (sends are scattered; `test-send.ts` writes an inline log — the bypass hole). D7/A17 routes all documents through this seam; it must ship or be co-sequenced as an explicit Phase-7 prerequisite, and the sole-seam ESLint gate must land with it.
- **C3 — Phase 3 consent gate (HARD, in-flight, unmerged).** The message-type-aware fail-closed outbound gate is on **PR #502, open/unmerged** — `packages/api/src/email/consent.ts` does not exist on `develop`. Phase 7 consumes it (self-vs-others asymmetry, per-(kind, party, version) consent snapshot) and must **not** re-implement it. **Correction:** the prior "shipped as PR #502" note is wrong; treat as in-flight.
- **C4 — CRM identity-link enum extension (blocking, small, early).** `crm_link_entity_type` (DB enum) and `CrmIdentityConceptId` (TS union) must gain `household`, `organization`, `daf_sponsor`, `person`, `gift_credit` (the current 15 members include `receipt_record`/`statement_record` but none of these). Reuse the reserved `receipt_record`/`statement_record`; do not invent new ones.
- **C5 — Reserved consumption of Phase 2 / 3 / 5 seams.** Phase 7 populates Phase 2's reserved `rendered_locale` (frozen at issuance) + introduces the jurisdiction axis; reads through Phase 3's projection chokepoint + the reserved acknowledgment/notification document classes + household-privacy predicate; and relies only on Phase 5's reserved (plumb-not-build) tribute/DAF/matching/party-type handoff hints (public capture is deferred; manual staff entry is in scope).
- **C6 — Shipped substrate Phase 7 builds ON (present, verified).** `contribution_adjustments` + `deriveEffectiveContribution`, `contribution_operation_batches`, correction requests + approval policy, receipt-delivery policy/snapshots, the Inngest substrate (dispatch ledger / work claims / recovery scan / stripe-event-processing), and the PDF/Statement Studio render layer. **Caveats the PRD carries:** `contribution_receipt_snapshots` is not a system of record; the Stripe webhook has no `charge.dispute.*` handling.
- **Prerequisite-number correction:** the "branded auth-email hook #511" reference is a **phantom PR number** (does not resolve on GitHub); it is likely the AL-262/AL-263 delivery-email PRs (#450/#451, both open). Drop or correct before citing.

### D. Data model (canonical names; all tenant-scoped, composite keys, FORCE RLS, service-role writes)

**New tables — party spine:**

- `persons` — the individual identity anchor (Phase-4-reserved, built here). Hard-credit individuals resolve here.
- `households` — a group of persons (never absorbs them): primary/head, address-of-record, include-in-name/greeting toggles.
- `household_members` — person↔household membership; role (spouse/partner/child), time-bound `started_at`/`ended_at`, include flags.
- party org profile (organization/church/business/DAF/foundation) — EIN, legal name, subtype, `is_matching_gift_company`.
- `org_contacts` — the human signer(s) attached to an org party (soft-credited).

**New tables — credit, tribute, matching, DAF:**

- `gift_credits` — soft-credit ledger; one gift → 0..N rows `{party, credit_role, amount NULL|partial, recognition_only}`; **`is_receiptable = FALSE`** hard invariant. (Rejected synonym: `gift_attributions`.)
- `tributes` / `donation_tributes` / `tribute_notifications` — tribute definition, gift↔tribute annotation, notify parties (+ notify-once flag).
- `matching_gifts` — employer-match lifecycle tracker; only `received` spawns the separate company donation.
- `daf_sponsors` — DAF sponsor registry (alias-match incoming payers → sponsor = legal donor + advisor = $0 acknowledgment).

**New tables — receipt engine:**

- `contribution_receipts` — the immutable versioned facts keystone (frozen acknowledgment; adjustment cursor; base number + version; supersedes link; immutability trigger; `UNIQUE(tenant, base_number, version)`; `NOT NULL`/`RESTRICT` FK to causing adjustment). Explicitly not `contribution_receipt_snapshots`.
- receipt tax-facts child (multi-benefit QPQ lines) — normalized child only for the rare multi-benefit gift.
- receipt numbering allocator — per-tenant gapless-safe allocator table (not a bare SEQUENCE).

**New tables — statement engine:**

- `statement_runs` — batch header/job ledger (tax_year, period, `job_key='donor.statement.annual_giving'`, status, execution_mode, inclusion_policy, config_fingerprint, idempotency_key). (Rejected synonyms: `giving_statements`, bare `statements`.)
- `statement_run_recipients` — per-recipient work ledger/outbox (subject_type, legal_donor_id XOR household_id, frozen_donor_snapshot, document_type, totals, status, current_version_id). (Rejected synonym: `statement_run_targets`; if the claim RPC keeps `acquire_statement_target`, document that a "target" is a recipients row.)
- `statement_run_items` — per-gift statement line (donation_id XOR gift_credit_id, credit_type, `included_on`, effective/deductible/QPQ amounts, frozen_effective_revision).
- `statement_run_exclusions` — first-class auditable exclusion set (reason_code + detail).
- `statement_versions` — immutable per-recipient version (version_number, statement_number gapless jurisdiction-gated, supersedes link, status, snapshot_id, artifact_id → Studio's `pdf_template_artifacts`, notified_at).
- `statement_inclusion_snapshots` — the frozen facts DTO (frozen donor identity, ordered lines, totals, IRS substantiation text, exclusions, content_hash). Named "inclusion snapshot" to avoid collision with Studio's render "artifact/snapshot"; mega-donor line detail spills to a child table; never stores PDF bytes.
- `statement_live_cache` — the live running-summary cache (totals, source_max_updated_at, computed_at).

**New columns on existing tables:**

- `donations`: `gift_method` (TEXT+CHECK), `received_date`, `postmark_date`, `delivery_basis` (TEXT+CHECK), `deposit_reference`. `gift_date` is now the resolved date-of-delivery (contract change). `entry_date` = `created_at::date` (no new column). Tax-facts fields are frozen onto the receipt version (source policy on fund); the PRD locates the mutable per-gift/per-line source vs the frozen receipt value explicitly.
- `donors`: `party_type` (replaces free-text `type`); link to the org profile (replaces free-text `organization`).
- `tenants.org_settings`: `tax_timezone` (IANA, default `America/New_York`), `prior_year_backdate_cutoff`.
- `contribution_adjustments.effective_values`: add `giftDate` + `deliveryBasis` (do **not** add tax semantics — the closed shape stays amount/fund/missionary/paymentStatus/designationLines).
- funds/designations: `deductibility_policy`.
- `contribution_receipt_snapshots` / frozen legal-donor snapshot: party-type-aware `{donor_id, party_type, legal_name, EIN(org), address-of-record, household_id+member_ids, org_subtype}` (the shipped snapshot carries designation lines but no legal-donor identity yet).
- Phase-2 `rendered_locale` on receipts (populated + frozen); a jurisdiction axis (new; not reserved on `sites` today).

**New enums / types / reservations Phase 7 populates:**

- `party_type`, `credit_role`, `document_type`, tribute type, `gift_method`, `delivery_basis`, receipt eligibility reason codes, receipt lifecycle actions, matching-gift lifecycle status, statement run/recipient/item/exclusion/version statuses (all TEXT+CHECK, not native enums).
- `contribution_adjustments` action type `gift_date_correction` (reuse existing `receipt_correction`/`statement_correction`/`refund`/`payment_state_correction`).
- `crm_link_entity_type` + `CrmIdentityConceptId` extended identically with `household`, `organization`, `daf_sponsor`, `person`, `gift_credit`.
- Phase-6 comms kinds `acknowledgment`, `notification`, `receipt_void`, `statement_supersede` (`receipt` exists); retention (receipt/void/supersede = official, ack/notification = operational); visibility `credited_party_visible`; related-types `gift_credit`, `tribute`, `donation_tribute`, `matching_gift`, `party`, `person`, `household`, `org_contact`.

### E. Contracts & wiring

- **E1 — The receipt/statement facts are the DTO PDF/Statement Studio renders.** The frozen snapshot supplies the merge-tag contract (both formatted strings and raw values) keyed by subject + `job_key='donor.statement.annual_giving'`; Studio writes `pdf_template_renders`/`pdf_template_artifacts` + retention and never authors facts. Phase 7 supplies the recipient/subject/job_key contract Studio's integration-map flagged as missing. "Statement Studio" and "PDF Studio" are the **same surface** (implementation under `pdf`/`pdf_templates`/`pdf-studio` identifiers — always search both names).
- **E2 — `charge.dispute.*` ingestion.** Extend the Stripe event processor (durable Inngest path) to handle `charge.dispute.created/closed` + `charge.dispute.funds_withdrawn/reinstated`, mapping ACH returns → void and card disputes → hold/void/reinstate, idempotent on the Stripe event id.
- **E3 — Single-gift issuance path.** Wire issue-on-accept + void-on-negative into the Stripe event processor (durable, not inline in the webhook), keyed on `donation.id` + the frozen snapshot so the staged-gift delivery path calls **into** the shared issuance, and manual/imported/historical gifts (no staged gift) can be receipted.
- **E4 — Reconciliation.** A scheduled Inngest function reconciles payment state ↔ receipt version and runs the ACH finality watch through the ~60-day window, flagging any gift whose latest fold value disagrees with its newest non-voided receipt version.

### F. ADRs (decisions worth recording; hard to reverse, surprising without context, real trade-offs)

- **F1** — Receipt/statement truth is an immutable versioned facts/inclusion record that references — never forks — the money-truth adjustment ledger.
- **F2** — Receipt eligibility is issue-on-accept per payment method; ACH post-success returns arrive as disputes and void finally, card disputes hold-then-resolve; a jurisdiction-gated hold option.
- **F3** — One hard-credit legal donor owns the receipt; soft credit is structurally non-receiptable; the three-document wall (receipt/acknowledgment/notification) is enforced by document class.
- **F4** — DAF grants receipt the sponsor and give the advisor a $0-deductible acknowledgment; matching gifts are two donations.
- **F5** — The year-end statement is a frozen, versioned inclusion snapshot (official) + a labeled live running view; supersede-not-edit on post-issue corrections.
- **F6** — Statement runs use the durable outbox/claim/recovery-scan batch pattern; Inngest orchestrates, DB claims guarantee correctness.
- **F7** — Gift tax year = one resolved, stored date-of-delivery (postmark governs mailed checks) in the tenant tax timezone; backdating is append-only + approval-gated + cutoff-bounded; no fiscal-close engine.
- **F8** — All donor-facing documents send through the single Phase-6 seam with a version-scoped idempotency key; delivery renders from approved facts, never stale rows.
- **F9** — Migration is additive expand → migrate → contract with a scheduled, CI-enforced contract-phase deletion of the legacy live-text path.
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
- Receipt numbering is gapless-safe under concurrency (CRA regime) and never reused across voids; a superseding version keeps the base number.
- Cross-tenant isolation: no receipt/statement/party/credit row ever crosses a tenant.
- The emailed receipt amount equals the frozen snapshot amount after a correction (bug #2 regression test).

**Structural CI gates:** the sole-seam import lint (no provider send outside the seam; `test-send.ts` fixed), and the legacy-symbol grep (build fails if the live-text donor-portal generator is referenced after cutover).

**Evidence file:** records repo files inspected, the external sources used (IRS Pub 1771 / date-of-delivery / quid-pro-quo, Treas. Reg. 1.170A-1(b), Rev. Rul. 54-465/78-38, Stripe refunds/disputes, Nacha return windows, and the incumbent-CRM references), the tests run, the route/API checks, known gaps, stop conditions, and what Phase 7 intentionally did not build.

---

## Out of Scope

Reserved as seams, **not** built in Phase 7:

- **Live third-party integrations** — DAFpay/Chariot DAF ingestion and Double-the-Donation (or any matching-gift-vendor) sync. Phase 7 builds the full data model + **manual staff entry** end-to-end; the ingestion adapters are reserved.
- **The full PDF/Statement Studio template product** — Phase 7 owns the facts + inclusion snapshot + versioning; Studio renders and owns the artifact/retention. Template authoring, assignment, and the render-stack cutover are Studio's phases.
- **A fiscal-close / accounting-period engine** — calendar year + a tenant tax timezone only; no per-tenant fiscal-year-start, no period-locking state machine, no GL close/reopen (a cutoff date + high-risk approval covers "closed").
- **Deposit / bank reconciliation** — a single optional `deposit_reference` string only; batching/deposit matching is a later phase.
- **Non-US jurisdiction tax rules** beyond the reserved jurisdiction gate (CRA-gapless-vs-US numbering + tax language); full CRA/other-jurisdiction receipting is future work.
- **Accounting exports & reconciliation (Area 11)** — Phase 7's facts make them safe later; the export product is not built here.
- **Public-checkout capture** of tribute/DAF/matching/party-type — reserved (plumb-not-build) on the Phase 5 handoff; manual staff entry is the Phase 7 path.
- **Full stock/noncash valuation, transfer-agent modeling, Form 8283 handling** — in-kind is described-not-valued; valuation is out.
- **Donor/missionary portal redesign; missionary-facing receipt/soft-credit visibility** — reserved scaffolding only.
- **The retention/DSAR pruning jobs** — classification ships (via Phase 6); the pruning/erasure jobs are the retention phase's.

---

## Further Notes

- **Not legal or tax advice.** The engine encodes best-effort rules from primary sources; **production use requires review by qualified finance/tax counsel.** The jurisdiction axis is the seam for jurisdiction-specific rules. A **counsel-review checklist** ships as a PRD appendix / evidence artifact, compiled from the cited IRS/CRA/Nacha sources (date-of-delivery, $250 CWA content, quid-pro-quo >$75 disclosure, in-kind describe-not-value, DAF advisor non-deductibility, contemporaneous ~Jan 31 timing, gapless-numbering by regime).
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
5. Rely on every document delivering through the Phase-6 seam with a durable, retention-classified, version-scoped record, and on the three pre-existing bugs being fixed.

**Acceptance artifacts:** the permanent negative/safety test tier + structural CI gates pass; the evidence file is complete; the counsel-review checklist is produced; the parity-matrix rows (7, 9, 10; touch 2, 5, 11) reflect Phase 7 ownership; the OpenSpec change + `CONTEXT.md` glossary terms are authored; and the additive migration's contract phase (legacy live-text path deletion) is scheduled and CI-enforced.

---

## Tracking Issues

_Epic + children to be created via `/to-issues` after PRD approval. First-pass breakdown (final slicing during `/to-issues`):_

- **{{EPIC}}** — Phase 7: Receipt & Statement Compliance Rules + Donor Identity/Credit Model.
- **{{T1}}** — Docs: the PRD, the OpenSpec change + `CONTEXT.md` glossary, the 10 ADRs (F1–F10), the counsel-review checklist. _(foundation)_
- **{{T2}}** — Canonical vocabulary + source-of-truth rules (party/hard-credit/soft-credit/receipt-version/inclusion-snapshot; rejected synonyms retired). _(foundation)_
- **{{T3}}** — CRM identity-link enum extension (`household`/`organization`/`daf_sponsor`/`person`/`gift_credit`). _(foundation, small)_ _(prereq: C1)_
- **{{T4}}** — Party spine: `persons` + `households` + `household_members` + org profiles + `org_contacts` + `party_type` on donors. _(prereq: C1)_
- **{{T5}}** — `gift_credits` soft-credit ledger + `is_receiptable=FALSE` invariant + the three-document wall + credit resolver (B3). _(blocked on T4)_
- **{{T6}}** — DAF (`daf_sponsors`), matching-gift lifecycle, tribute (+ notifications) models + routing. _(blocked on T5)_
- **{{T7}}** — Date-of-delivery resolver (B4) + `gift_method`/`received_date`/`postmark_date`/`delivery_basis` columns + tenant `tax_timezone` + the UTC-bug fix. _(foundation-ish)_
- **{{T8}}** — Offline gift-entry flow + backdating governance (evidence, cutoff, separation-of-duties, `gift_date_correction`). _(blocked on T7)_
- **{{T9}}** — Fund deductibility policy + lean per-gift/per-line tax facts + resolver (B8). _(foundation-ish)_
- **{{T10}}** — Receipt eligibility evaluator (B1) + the issue-on-accept/void state machine + `receipt_status` formalization. _(blocked on T9)_
- **{{T11}}** — `charge.dispute.*` ingestion in the Stripe event processor (E2) + the single-gift issuance path (E3) + reconciliation (E4). _(blocked on T10)_
- **{{T12}}** — `contribution_receipts` immutable versioned facts core (B2) + numbering allocator + immutability trigger + supersede. _(blocked on T10)_
- **{{T13}}** — Statement inclusion engine (B5) + `statement_inclusion_snapshots` + live view + `statement_live_cache` (replaces the donor-portal live-text path behind a flag). _(blocked on T12)_
- **{{T14}}** — Statement run orchestrator (B6): runs/recipients/items/exclusions/versions + the durable batch + the run wizard + pre-flight gate + dry-run/test-send + supersede. _(blocked on T13)_
- **{{T15}}** — Delivery adapter (B7): route all three document types + void/supersede through the Phase-6 seam; version-scoped idempotency key; redaction wall; the 3 pre-existing bug fixes. _(blocked on T12; prereq: C2, C3)_
- **{{T16}}** — Mission Control full interactive receipt-eligibility explainer + version/correction/void history. _(blocked on T12)_
- **{{T17}}** — Donor-portal approved-facts receipts + statement list (official vs live) + never-expiring link + household joint view; delete the legacy live-text generator (contract phase). _(blocked on T13, T15)_
- **{{T18}}** — Formatting authority: freeze rendered strings + raw values into snapshots (Phase-2 currency metadata + frozen `rendered_locale`); fix `formatMoney`/mixed-currency. _(blocked on T12, T13)_
- **{{T19}}** — Additive migration (expand→migrate→contract): `gift_method` backfill, `delivery_basis`, dormant `receipt_status`, shared normalizer, scheduled contract deletion + CI symbol-grep. _(blocked on T17)_
- **{{T20}}** — The permanent negative/safety test tier + structural CI gates (sole-seam lint, legacy-symbol grep) + the evidence file. _(blocked on T2–T19)_

**Related:** program charter + parity matrix (`README.md`, `parity-matrix.md`); predecessor epics Phase 2–6. **Prerequisites (must land first):** Phase 4 isolation foundation (C1), Phase 6 comms spine + seam (C2), Phase 3 consent gate PR #502 (C3).
