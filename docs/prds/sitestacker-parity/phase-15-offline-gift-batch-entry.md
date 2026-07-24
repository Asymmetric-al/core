# Phase 15 — Offline Gift & Batch Entry: The Professional Batch-Entry Workbench

## Status

Groomed via `grill-with-docs` (2026-07-11). All seven decision families **D1–D7** are ratified, plus the **NF3** loose-thread ("Send acknowledgments" gate) and the two thin founder-confirms that rode alongside it (cash dual-count deferred to fast-follow; a counsel/finance sign-off gate added as a phase deliverable). Each decision was pressure-tested by a dedicated adversarial review fleet before ratification — the fleet lineage is: **D3** three-layer workbench (17-category `wf_f4a1135a-b58`, ratified-as-hardened with 16 amendments + a cut list (binding do-not-build) + 2 gating spikes); **D4** tender menu (17-category `wf_bd7b7b90-a0a`) followed by a nine-agent **Stripe deep dive** (`wf_3089d3d8-91a`) that vindicated the native-embedded phone lane; **D5** commit contract (17-category `wf_3d29b7cc-f8d`, 14 amendments + 4 founder micro-choices); **D6** deposit grouping (`wf_33b236ee-f71`, field-validated undeposited-funds spine, 16 amendments + 6 call-backs); **D7** batch templates (17-category `wf_fddff5b6-be6`, 13 amendments); a whole-scope **loose-threads sweep** (`wf_4923b56c-393`, 49 scope areas → 23 DECIDED · 17 CARRYABLE · 9 DANGLING, all closed); and the **NF3** acknowledgment-send design fleet (`wf_15809123-59f`). The PRD is authored from that decision record.

**Slug:** `gift-batch-entry` · **Roadmap position:** Phase 15 of 41 (roadmap v2) · **Predecessors:** Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) and Phase 14 (Donor Credit Operations), both committed on PR #465 (MERGEABLE) and both **groomed-not-built** — Phase 13's append-only ledger (epic #690) has **zero SQL on disk today**, and Phase 14's credit machinery (epic #719) is likewise unbuilt.

**Program posture: groomed-not-built.** This document is a design against not-yet-built Phase 13 and Phase 14 contracts; it makes no live or shipped claims. Every repo anchor cited below (see **Repo Anchors**) is **evidence as of authoring** — proof that the seam, precedent, or infrastructure exists to build against — never a brittle build instruction, and never an assertion that the Phase 15 product exists. The Phase 15 tables (`gift_entry_batches`, `batch_templates`, `deposit_groups`, `deposit_assignment_events`, `noncash_gift_details`) are all net-new. Because the product has **no users** (founder ruling 2026-07-06), there is no migration ceremony and no compatibility shim: every table ships correct-from-start, and the cross-PRD congruence package (see S10) renames predecessor vocabulary freely because nothing it names is built. **Tracked by epic #758 + children #759–#786** (minted 2026-07-11 via `/to-tickets`; every child `status:blocked` on the predecessor spine — dispatch is a separate founder decision, no `ready-for-agent`).

**Production gate:** the receipt, tax-year, noncash-duty (IRS 8283/8282), and NACHA/MOTO mandate-and-consent surfaces this phase touches are tax- and compliance-adjacent and require review by **qualified finance/tax counsel** before production use (this document is not legal or tax advice) — see the Counsel Review deliverable.

> **Controlling Phase 19 year-boundary amendment (2026-07-24).** Phase 15
> captures the source fact; Phase 19 owns statement cutoffs, frozen populations,
> primary release, and the late-fact lane. For a legitimate December check
> entered in January, the default low-friction control is an append-only staff
> attestation of the asserted mail/delivery date, basis, reason, actor, and
> time. A visible postmark or other proof may be retained when available, and a
> tenant or jurisdiction contract may require stronger evidence or independent
> review, but no donor attestation, uploaded envelope, certified-mail proof, or
> second approver is universally required. The source correction never mutates
> posted money or a frozen run. Before release it stales the affected Run
> Preflight; after release it enters Phase 19's bounded late-fact
> successor/supplemental workflow. Commit also consumes Phase 7's frozen
> exact-issuer prospective cash-receipt plan. `individual_cash` permits the
> ordinary per-gift receipt path after the tender reaches its required finality;
> `annual_cumulative_cash` emits no per-gift official receipt and records the
> occurrence as ready for Phase 7-owned year-end coverage. Intake may not
> override, infer, or recompute the plan. Without an active exact-issuer
> Canadian pack, the prospective plan is structurally absent and the applicable
> ordinary Phase 7 receipt policy governs unchanged. This two-lane rule controls
> every older unqualified “receipt immediately on post” statement below.

---

## Problem Statement

Picture the finance operator on a Monday morning. The mail brought a stack of checks — some from individual donors, some a single check from First Baptist covering twenty families, one from Fidelity Charitable, one accompanied by a stock-transfer confirmation. The offering plate produced an envelope of cash. Three donors called over the weekend wanting to give by card or from their bank account. A corporate matching payment arrived from Benevity. **Not one of these has a real place to be entered.**

Today the platform can accept an **online** gift — a donor keys their own card on a hosted surface and the Stripe webhook writes the money. That path is durable and real. But everything that arrives **offline** — the check, the cash, the ACH remittance, the stock gift, the in-kind donation, the church's monthly remittance, the phone donor who wants a human to take the payment — has **no entry product**. There is a single-gift dialog (`Enter Offline Gift`) that opens one modal per gift with an "Enter another" loop, and behind it a **Track-B slice that is built but deliberately unwired**: its Zod schema, its receipt-status logic, and its permission gate all exist, but the persistence path throws `501 Not Implemented` because it was never bound to a ledger. It is parts on a shelf, not a workbench.

So finance staff do what finance staff at every under-tooled nonprofit do: they keep **shadow spreadsheets** — batch the checks in Excel, tally a control total by hand, reconcile against the deposit slip in a second tab, and re-key the survivors into the CRM one modal at a time, losing the tab-through speed, copy-down defaults, running total, and column layout that made the spreadsheet fast. The competitor for this phase is not another CRM. **The competitor is Excel** — the fluent, keyboard-native, control-totaled data-entry experience a spreadsheet gives for free and that most nonprofit batch-entry tools (by their own users' documented complaints) fail to match. Blackbaud RE NXT's web batch is slower than its own legacy client; Bloomerang has no in-app batch grid and outsources to a Google Sheets add-on — the shadow spreadsheet made into a product. When the entry tool is slower than Excel, staff route around it and the money truth lives in an un-audited, unreportable sidecar until someone re-keys it.

The cost is concrete: money that is real (a deposited check) sits outside the system for days; control totals are reconciled in a spreadsheet no auditor can trace; a mis-keyed gift is caught late or never; and the deposit that went to the bank cannot be tied back to the gifts it contained. Phase 13 modeled the offline **tenders** and their lifecycle on paper and explicitly reserved the batch-entry **surface** for Phase 15. This is that surface.

---

## Solution

Phase 15 builds **the professional batch-entry workbench** — the finance operator's daily home for turning a pile of offline gifts into audited, posted, receipted, deposit-grouped contributions faster than a spreadsheet, without ever leaving one coherent product.

**One front door.** Every staff-entered offline gift — check, cash, offline ACH or wire, securities, in-kind, church remittance, or a phone payment — lives in a **gift-entry batch**. A single gift is simply a batch of one. The UI offers two _experiences_ over one domain: a full **New batch** workbench for the Monday check-stack, and a light **Quick entry** that auto-creates a one-row batch with defaults prefilled and the word "batch" hidden from casual staff. Underneath is one staging model, one validation engine, one atomic commit service, and one audit spine. **Nothing writes offline money except the batch commit path** — the standalone dialog's write path is retired, the 501 bridge is deleted, and the reusable parts of the Track-B slice (its Zod schema, its receipt-status resolver) feed the new row editor.

**Validate = post.** The lifecycle is `draft → validate → commit`, and by default validating a completed batch **posts it immediately** — the conventional separate approve step collapses into validate, because low friction is the point. Validation is always non-mutating and revision-bound: it re-checks the whole batch (control totals balanced, designations live-resolvable, tenders well-formed) and any material edit invalidates the prior pass. Control-total mismatches **block commit** and are never silently erased — an override is a distinct capability with a required reason and the original expected totals frozen forever. Safety is risk-scaled, not blanket: ordinary gifts post instantly, while large, brand-new-donor, cash, or backdated gifts route to a brief review, a new operator's first few batches route to review and then auto-graduate, and a short donor-invisible catch-window lets staff recall a fat-fingered receipt before the email leaves. For a settled tender, the P7 tax receipt is admitted immediately only when the governing Phase 7 policy permits an individual receipt: the frozen plan for an active Canadian pack, ordinary policy otherwise. `annual_cumulative_cash` records year-end readiness without minting or sending a per-gift receipt. A posted gift is amended by compensating correction, never in-place mutation.

**Native phone payments.** When a donor is on the phone, staff start the gift from the workbench with donor, amount, and designation pre-populated, pick card or ACH, and complete the payment inside one Asym-native flow — even though Stripe securely owns the sensitive fields underneath. The card lane is an **embedded Stripe Payment Element keyed by staff** (SAQ-A: the PAN goes browser→Stripe and never touches Asym) with a server-confirm MOTO flag; the ACH lane pairs a mid-call Financial Connections link with a bounded secondary staff-keyed path. The resulting gift is an **online** gift written by the Stripe webhook, auto-linked back to the workbench — never an offline money row, so it is never double-counted. **Asym never stores, logs, or processes raw card or bank details.**

**Deposit grouping.** Bank-bound tenders (check, cash, offline ACH, wire) carry a **deposit-state** — a sixth orthogonal lifecycle axis (undeposited → assigned → deposited/cleared) decoupled from both entry and posting — and can be grouped into first-class **deposit groups** with a gift-grain, changeable link. The relationship is fully flexible: deposit-before-entry, entry-before-deposit, 1:1, many-batches-to-one-deposit, or an inconsistent mix week to week all work, because nothing forces a rigid batch=deposit binding. Phase 15 owns the deposit slip and the operational deposit-state; Phase 20 owns the general-ledger undeposited-funds account and the bank-statement tie-out. Stripe-settled gifts are excluded from manual deposits — they reconcile via Stripe payouts.

The result is a workbench where a finance operator enters a stack of offline gifts at spreadsheet speed with a live reconciliation rail, validates once, posts and receipts atomically, groups the checks into the deposit that went to the bank, and confirms the acknowledgments — all inside one audited product that _is_ the books.

---

## Decision Overview

**D1 — One front door for offline money.** Every staff-entered offline gift lives in a `gift_entry_batches` record; a single gift is a batch of one; the two UI experiences (New batch, Quick entry) are skins over one pipeline. One staging model, one validation engine, one atomic commit service, one audit spine — nothing writes offline money except the batch commit path. `gift_entry_batches` (which _creates_ new contributions) is a **distinct domain** from the existing `contribution_operation_batches` (which operates over _existing_ gifts); generic infrastructure may be reused but the domain records and state machines are never shared. The built-but-unwired Track-B offline-entry slice is reclassified as parts inventory — its Zod schema and receipt-status resolver are salvaged into the row editor; its legacy-`donations` write path and 501 binding are deleted, never wired (fresh-build posture; Phase 15 posts through the Phase 13 ledger contract).

**D2 — One lifecycle, policy-scaled strictness.** The lifecycle spine is `draft → validate → approve → commit → finalize`, where validation is **always non-mutating and revision-bound** (any material edit invalidates validation and approval; commit accepts only the approved revision — non-negotiable). Control-total mismatch **blocks commit by default**; a governed override is a distinct capability with a required reason and the **original expected totals frozen forever** (fixing the CiviCRM audit-erasure trap), stamped on the batch and the deposit report, with an optional per-tenant second person. Approval is policy-driven (reusing the AL-261 `contribution_approval_policies` pattern, quorum-aware per Phase 12) and keys on tender/amount/overrides/backdating/new-donor. The **founder rider** binds the PRD and tickets: _not too restrictive, frustrating, or cumbersome — clarity and amazing UX._ The rider governs presentation and defaults, not control existence — every gate must explain itself in plain language, default rules stay lean, and friction is spent only where money-integrity buys it back; implementers may not read the rider as "make controls optional."

**D3 — Three-layer keyboard-native workbench.** The workbench is three layers: an always-visible **reconciliation rail** (expected vs entered count and amount, issues, save state), an **editable grid** holding only common-path fields (donor, amount, designation, gift date, check/reference), and a **non-modal row inspector** for exceptions (DAF, tribute, matching, remittance sub-grid, splits, new donor) that keeps the row visible and returns focus to the originating cell. The grid is a purpose-built accessible editable grid implementing the ARIA APG grid keyboard contract (single tab stop / roving tabindex, arrow navigation, Enter/F2 edit, Escape cancel, focus stable under autosave and virtualization), seeded from the dormant `data-grid` component — not the read-only `DataTableResponsive`. It is desktop- and tablet-landscape-first; phones are scoped to batch list/status/review/approve, deliberately not the entry grid. The Enter-advance semantics and keystroke/latency budgets are **spike-validated-before-freeze** hypotheses with a defined amendment path; the two gating spikes (keyboard contract, donor typeahead) become the **first build tickets** of the phase.

**D4 — Every tender first-class.** `gift_method` is a single vocabulary sourced from Phase 13 — `check, cash, ach, wire, securities, in_kind, church_remittance` first-class, with `crypto`, `vehicle`, and `real_estate` reserved. Non-cash gifts share **one** `noncash_gift_details` extension (not five lanes); **describe-never-value** is a schema invariant across all channels (the org never attests value — Form 8283 is the donor's duty; the 8282 disposition clock ships with proceeds). Securities are one gift with a liquidation/proceeds lifecycle whose proceeds are non-contribution facts Phase 20 reads; in-kind is $0 recognized with walled valuation. The **phone lane** is a native embedded Stripe Payment Element keyed by staff (SAQ-A) with a server-confirm MOTO flag (support-gated per connected account; gate+detect+degrade), plus an ACH lane in both variants (mid-call Financial Connections as primary, a bounded secondary staff-keyed TEL lane behind its own capability and consent guardrails). Phone gifts are **online** gifts written by the Stripe webhook, dispatched and tracked from the workbench, never offline money rows. A distinct `take_phone_payment` capability gates the lane. This targets the **Phase 13 Stripe Connect connected-account substrate from day one** (Connect is already ratified in Phase 13); the phone lane never stores, logs, or processes raw card or bank details.

**D5 — Commit contract + auto-post default.** Commit is atomic all-or-nothing by default, with an explicit, capability-gated, audited **escape valve** — commit the clean rows and carry unresolved rows into a linked follow-on draft batch, each commit atomic and idempotent over its subset, with a SQL-enforced conservation invariant (committed + pending-async + carried = frozen original expected). **Validate = post** by default (the approve node collapses into validate but is never deleted from the model; a second approver or quorum is opt-in per tenant). The **P7 tax receipt only** is admitted immediately for a settled-on-entry tender (check/cash/settled card) when the governing Phase 7 policy admits an individual receipt—`individual_cash` for an active Canadian pack, ordinary policy otherwise; ACH waits for `succeeded`. An `annual_cumulative_cash` occurrence emits no per-gift receipt or receipt-send outbox row and remains available only to Phase 7's year-end coverage authority. Phase 14 acknowledgment streams stay batch-origin-gated (see NF3). A posted single gift is amended by **compensating correction** via the AL-261 spine, never raw edit; a draft row edits freely. Postmark is optional (a pure dating resolver with a defensible fallback plus a December/January year-boundary nudge). Safety is delivered by a **high-risk auto-route** (large-$/new-donor/cash/backdated), an **auto-graduating new-operator soft-guard**, a **short donor-invisible receipt catch-window**, and **one per-batch commit confirm** — replacing the removed default second approver. Phase 15's **first build ticket lands the minimal Phase 13 posting substrate** (headers/designation_lines/postings + `effective_seq` + immutability trigger + `credit_recheck` outbox), because MOD3's post-commit correction rides that append-only ledger; flat-`donations` in-place edit is forbidden.

**D6 — Deposit grouping via the undeposited-funds spine.** First-class `deposit_groups` + a nullable, changeable, **gift-grain** scalar link + a **derived** deposit-state (a 6th orthogonal axis formalizing Phase 13's narrated recorded→deposited→cleared, retiring the flat `deposit_reference` TEXT), decoupled from both entry and posting. A `settlement_rail` discriminator (bank-direct vs Stripe-rail) governs eligibility: bank-direct check/cash/ACH/wire are depositable; Stripe-rail card/ACH are forced `settles_via_payout` and the DB rejects any deposit link (prevents double-count vs payout). Maximum flexibility: temporal ordering is unfixed (deposit-before-entry, entry-before-deposit, simultaneous), cardinality is unfixed (1:1, N:1, 1:N), assignment is optional and changeable after posting. A printed slip is a retained **immutable snapshot**; membership stays free-to-edit until Phase 20 export, then compensating-correction-only. Phase 15 owns the grouping workflow + slip/report + operational state; **Phase 20 owns the GL undeposited-funds account and bank-statement tie-out** — no GL or bank-rec is built in Phase 15. Deposit-membership moves no money, so it never creates a compensating posting; an append-only `deposit_assignment_events` log satisfies both Phase 13 append-only truth and "changeable after posting."

**D7 — Config-frozen, safety-live batch templates.** A tenant-level `batch_templates` row controls column set/order, default field values, required-field policy, and _which_ opt-in validation/approval policy applies. On batch creation the presentation config is **frozen by value** onto the batch header (a typed snapshot struct + `snapshot_schema_version`, plus a `revision` integer — no versions table); a later template edit never mutates an in-progress or posted batch. But **all money-integrity is resolved live at commit** against current tenant config: templates set **defaults within** the D1–D6 invariants and can **never override** them (cannot make an ineligible gift receiptable, cannot disable the control-total gate, cannot change a tender's `settlement_rail`, cannot bypass the auto-post/high-risk-route model). Three system-seeded starters ship (Mail/Check, Sunday Cash, Church Remittance) plus one non-deletable System Default; personal per-user column preferences overlay without touching the shared template. Cut for v1: conditional logic, per-template custom fields, versioning UI, per-template numbering.

**NF3 — The "Send acknowledgments" gate.** Phase 14 suppresses acknowledgment auto-send for batch/import-origin rows, but D1 reclassifies every quick-entry gift as a batch-of-one — which would silently suppress a deliberate single tribute or DAF gift's acknowledgment, the opposite of intent. The founder designed a third path: batch-origin acknowledgments (DAF advisor thank-you, tribute notifications, soft-credit acks) are **no longer suppressed forever** — at commit they land in Phase 14's `held` state (origin reason `batch_gate_pending`), and a single deliberate per-batch **"Send acknowledgments"** action (available after validation, on the posted-batch summary panel and the D3 rail card, never in the hot-path grid) flips this batch's ready `held` acks into Phase 14's _existing_ send pipeline. One trigger edge, no second send path. The **tax-receipt rail is untouched** — Phase 7's frozen plan and tender finality independently decide individual issuance, and the acknowledgment action never writes `gift_receipt_records` (the three-document wall holds). Quick-entry (batch of one) surfaces this as a checked-by-default, one-tap-reversible line inside D5's single post-commit confirm ("☑ Also send the thank-you to Jane Advisor"), not silent auto-send.

---

## Dependencies & Predecessor Contracts

Phase 15 is a **downstream integrator** — it builds almost entirely against contracts other phases own. Whether each is REAL (code exists today) or FORWARD (groomed-not-built) determines build order; the pivotal fact is that Phase 15's **first build ticket lands the Phase 13 ledger substrate itself**, because that substrate is FORWARD (zero SQL on disk) and every posted gift keys to it.

- **Phase 2 (Site, Locale & Currency Foundation)** — FORWARD. Provides presentment-currency-equals-settlement-currency and the tenant payment-account identity. Its §A2 currently asserts a now-false "no Stripe Connect"; the S10 congruence package corrects it to the Connect connected-account topology Phase 13 ratified.

- **Shipped giving pipeline** (pre-program production code; the "phase 03" in migration `20260512190000_phase_03_giving_pipeline.sql` is that migration's own label, **not** roadmap Phase 3 `permission-floor`) — REAL. Provides the durable Stripe ingest substrate the phone lane reuses: the `stripe_raw_events` full-lifecycle ledger, the atomic donation+outbox RPC, claim/retry/dead-letter, and replay. The phone-gift webhook lifecycle extends this rather than reinventing it.

- **Phase 4 (Donor Identity / Guest Giving)** — REAL (partial). Provides `resolveDonorMatch` (email-exact → attach; name+address → possible; never auto-merge; `donor_merge_candidates`), built for guest checkout. The offline `resolveKnownDonor` dependency is **not yet bound** to it and there is no general staff party-search typeahead — the donor-typeahead spike (a D3 first build ticket) closes that gap. Acceptance bar: an inline-created donor is **immediately matchable within the same batch** (the RE-NXT differentiator).

- **Phase 6 (Email Consent Gate)** — REAL (shipped, PR #502). The message-type-aware, fail-closed outbound-email gate. Both a Phase 7 plan-admitted individual tax receipt and the NF3 acknowledgment streams pass through it; the three ack streams are transactional-relational (bypass marketing opt-outs, always respect do_not_contact/bounce/complaint).

- **Phase 7 (Receipt & Statement Compliance)** — FORWARD (evaluator consumed unchanged). Provides the three-document wall (receipt / acknowledgment / notification), the pure receipt-eligibility rules evaluator, the in-kind described-never-valued rule, and the DAF advisor $0 non-receipt. Phase 15 consumes the evaluator; receipt _timing_ is Phase 15's concern, not P7's eligibility rules.

- **Phase 8 (CRM Operating Foundation)** — FORWARD. Provides the data-health signal catalog and the `crm_escalations` open-source enum. Phase 15 adds an owned post-hoc worklist (corrections, void-receipts, failed receipts, open follow-on batches, undeposited-cash aging, and the NF3 `acknowledgments-pending-past-N-days` signal) that the open enum absorbs.

- **Phase 9 (Full CRM Depth & Relationship Graph)** — FORWARD. Provides the party spine, the employer prefill the matching sub-grid reads, and the time-bounded household membership household-recognition derives from. Phase 15 matches against it at entry; it does not own the party model.

- **Phase 10 / Phase 11 (Catalog & Field Projection / Restricted Data)** — FORWARD. Provide the field catalog and the per-viewer projection chokepoint that filters restricted parties and fields live. The D3 grid, the template column allowlist, and the NF3 manifest all project per-viewer through this chain.

- **Phase 12 (Full Role & Permission Configuration) + the shipped approval-policy machinery** — REAL (partial). The AL-261 `contribution_approval_policies` machinery and separation-of-duties (requester ≠ approver) exist as shipped repo code today (a pre-program seam, not a Phase 12 deliverable — Phase 12 `permission-config` itself is FORWARD, epic #665 blocked); quorum-awareness is FORWARD. D2/D5 reuse this pattern for the opt-in second approver, the high-risk auto-route, and the new-operator guard — no new approval machinery. Of the money-surface capabilities only `finance:manage_contributions` exists today (REAL); `finance:record_contribution`, `finance:manage_batch_templates`, `finance:manage_deposits`, `take_phone_payment`, and the distinct control-override capability are INTRODUCED/RESERVED by this phase (FORWARD — new capability strings registered against the Phase 12 registry).

- **Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart)** — **FORWARD, zero SQL today (epic #690 blocked).** The append-only ledger substrate — `contribution_headers` (frozen legal-donor snapshot), `contribution_designation_lines` (money source of truth, fund XOR missionary, `UNIQUE(tenant_id, header_id, id)`), `contribution_postings` (signed deltas, monotonic seq under FOR UPDATE, immutability trigger) — plus the `gift_method` vocabulary, the dating resolver, and the recorded→deposited→cleared / NSF lifecycle. **Phase 15's first build ticket lands the minimal version of this substrate**; the commit service posts through it via one RPC / one transaction under a per-contribution advisory lock with a `credit_recheck` outbox event in-transaction. Phase 13 explicitly reserved "the batch-entry UI product" for Phase 15.

- **Phase 14 (Donor Credit Operations)** — FORWARD (epic #719 blocked). Provides `contribution_credits` and the DAF/tribute/soft-credit/matching machinery, and **forward-declares three P15 contracts the workbench must honor verbatim**: (1) the church-remittance attribution sub-grid uses the same keying surface as a per-remittance-line sub-grid and generates `contribution_credits` — the grid never writes credit rows; (2) a per-row DAF/soft-credit/tribute/matching capture cell (one-checkbox expectancy create, employer prefill from Phase 9); (3) batch/import-origin rows gate acknowledgment auto-send — reconciled by NF3 into the explicit per-batch gate.

- **Phase 16 (Pledges & Recurring Commitments)** — FORWARD; **reserve, don't build.** Phase 15 reserves the inspector seam for a match-at-entry affordance but defers building it until an open-commitment model exists to read.

- **Phase 20 (Accounting Export & GL)** — FORWARD; **out of scope for Phase 15.** Owns the undeposited-funds GL account, deposit clearing, the accounting-export axis, and bank-statement reconciliation/tie-out. Phase 15 owns only the deposit slip and the operational deposit-state; the two phases must not both claim "deposit reports."

- **Phase 29 (Files & Storage)** — FORWARD; **reserved seam, not built v1.** The scanned-check / RDC path and general document attachment defer to this seam (row-grain reference only); the same-day scanner workflow is manual in v1.

- **Phase 39 (Money Never Offline-Writable)** — the invariant Phase 15 operationalizes: the batch commit service is the **sole** writer of offline money; the retired standalone dialog and the deleted 501 bridge leave no other write path.

---

## Non-Goals / Out of Scope (Headline)

Phase 15 is deliberately bounded by the **don't-over-engineer rider** — v1 ships the leanest compliant shape of every decision, and the per-decision cut lists in the ratified record are **binding "do not build"** instructions, not suggestions. The full, itemized out-of-scope list lives in **S10**; the headline exclusions are:

- **No general ledger, undeposited-funds accounting, deposit clearing, or bank-statement reconciliation** — that is **Phase 20**. Phase 15 stops at the deposit slip and the operational deposit-state.
- **No file or image storage** — scanned checks, deposit-slip images, and gift document attachments defer to the **Phase 29** files seam (row-grain reference only in v1). The same-day check-scanner / RDC path is a reserved integration seam, not a v1 build.
- **No spreadsheet import with column-mapping or bulk donor-resolution** — that is **Phase 30**. The main grid keeps the seed grid's in-cell TSV clipboard paste and fill-down as D3 ergonomics; a formal multi-row import is out of scope and shares Phase 30's never-auto-send posture.
- **No commitment/pledge model or fulfillment engine** — that is **Phase 16**. Phase 15 reserves the match-at-entry inspector seam and defers the affordance until an open-commitment model exists to read.
- **No native non-cash valuation engines** — one generic `noncash_gift_details` extension covers securities, in-kind, and the reserved crypto/vehicle/real-estate methods; **describe-never-value** is a schema invariant (the org never attests value).
- **No in-app card or bank-account field Asym can read** — the phone lane uses only Stripe-owned surfaces; Asym never stores, logs, or processes raw card or bank details.
- **The ratified cut lists bind:** no per-tenant "deposit mode" config, no N:M deposit junction table, no deposit-approval SoD, no `batch_template_versions` history table, no conditional-logic DSL or per-template custom fields, no heavy escape-valve provenance engine, no per-row acknowledgment review or bulk re-blast, no dedicated two-person cash-count surface in v1 (deferred to fast-follow), plus every other item enumerated in S10.

---

## Repo Anchors (evidence as of authoring)

These paths prove the seams, precedents, and infrastructure Phase 15 builds against **exist today**. They are evidence, never build instructions — normative requirements elsewhere in this PRD name capabilities and contracts, not files, because files rot.

**REAL — exists on disk (verified at authoring):**

- **Editable-grid seed (D3):** `packages/ui/components/shadcn/data-grid/` (`data-grid.tsx`, `data-grid-cell.tsx`, `types.ts`) — TanStack Table v8 + Virtual, typed editable cells, TSV clipboard, 20-deep undo/redo, `role="grid"`. **Zero production usages; no arrow-key cell navigation; no roving tabindex.** A seed to harden, not a product.
- **Read-only table workhorse (D3 contrast + list views):** `packages/ui/components/shadcn/data-table/` — `DataTableResponsive` plus `useDataTableKeyboard` (row-oriented roving focus) and `useDataTableVirtualization` (TanStack Virtual v3) under `data-table/hooks/`. Display-only; the batch **list** reuses it, the entry **grid** does not.
- **Contributions hub + precedents:** `apps/admin/app/contributions/` — `main-body.tsx`, `operation-shell.tsx` (the `OPERATION_DEFINITIONS` runner), `correction-approval-panel.tsx`, and the single-gift precedent `offline-gift/offline-gift-entry-dialog.tsx` whose write path D1 retires.
- **Track-B offline slice (parts inventory, D1.b):** `packages/api/src/admin/contributions/` (`offline-entry.ts`, `offline-logic.ts`, `offline-route.ts`, and `offline-dependencies.ts` — the 501 "Unbound" bridge to delete) plus the salvageable Zod schema `packages/api/src/schemas/contributions-offline.ts` (already carries `batchId` + `referenceNumber`); the `resolveOfflineReceiptStatus` logic lives in `offline-logic.ts`, not the schema file.
- **Durable Stripe / donation infrastructure (D4 phone lane, D5 outbox):** `packages/api/src/donate/saga.ts` (atomic donations+outbox), `packages/api/src/donate/guest/donor-matching.ts` (`resolveDonorMatch`) and `packages/api/src/public-giving/donor-match.ts`, and the `stripe_raw_events` ledger (migration `20260512190000_phase_03_giving_pipeline.sql`).
- **Consent gate (P6):** `packages/api/src/email/consent.ts` — the fail-closed, message-type-aware outbound-email gate.
- **Operations domain to split from (D1.a):** migration `20260526202500_contribution_operation_batches.sql` (bulk ops over _existing_ gifts — reusable chunked-claim/stale-running infra, never the same domain records).
- **Correction / approval spine (D5 MOD3, D2):** the `contribution_adjustments`, `contribution_correction_requests`, and approval-policy migrations (AL-261 separation of duties).
- **Personal column preferences (D7 overlay):** `crm_table_preferences` (routed via `packages/api/src/admin/crm/table-preferences/route.ts`, composite `(tenant_id, ...)` scoping) — the personal per-user layer over the shared template.
- **Design system:** `packages/ui/components.json` (`base-maia`, zinc, Tailwind v4 oklch tokens) — **Base UI 1.5 primitives, not Radix**; TanStack Table v8 / Query v5 / Virtual v3 / Form. **No `warning`/`success` semantic tokens exist** (raw emerald/amber ad hoc today) — D5 adds them.

**FORWARD — groomed-not-built (cite the owning phase, never a path):**

- **The Phase 13 ledger** — `contribution_headers` / `contribution_designation_lines` / `contribution_postings` and the `gift_method` vocabulary, dating resolver, and deposit lifecycle. **Zero SQL today** (Phase 13 PRD; epic #690, blocked). Phase 15's **first build ticket** lands the minimal substrate.
- **The Phase 14 credit machinery** — `contribution_credits`, the DAF/tribute/soft-credit/matching objects, and the acknowledgment hold-and-send pipeline (Phase 14 PRD; epic #719, blocked). NF3 flips the batch-origin `held` state through this pipeline.
- **The Phase 15 tables** — `gift_entry_batches`, `batch_templates`, `deposit_groups`, `deposit_assignment_events`, `noncash_gift_details` are all net-new to this phase.

> For the full data model, invariants, build order, complete out-of-scope list, and the congruence package (17 committed-doc edits + 5 candidate ADRs), see S9–S10.

## User Stories

Each story is tagged with the ratified decision(s) it descends from (`[D1]`–`[D7]`, `[NF3]`, or a predecessor-phase contract). Decisions are recorded in the Phase 15 grill decision log; the tags let an implementer trace any story back to its governing ruling. Stories describe intent, not implementation — the data model, invariants, and build order live in later sections. Actors: **batch-entry operator** (the staffer keying gifts), **reviewer/approver**, **finance lead**, **donor-care staffer**, **missionary**, **org admin** (tenant admin), **developer**, **auditor**, and the **donor** (served indirectly). Vocabulary follows the domain glossary: gift-entry batch, quick entry, validate=post, control total + governed override, high-risk auto-route, new-operator guard, escape valve, deposit group, undeposited-funds, settlement_rail, settles-via-payout, batch template, config-frozen/safety-live, Send-acknowledgments gate, native embedded Stripe phone lane.

### One front door — batch identity, quick entry, and templates

1. As a **batch-entry operator**, I want every offline gift I record — whether I open a full workbench or type one gift fast — to travel through the same gift-entry-batch pipeline (one staging model, one validation engine, one atomic commit, one audit spine), so that there is no second, weaker path that skips a control. `[D1]`
2. As a **batch-entry operator** recording a single walk-in check, I want a **quick-entry** experience that auto-creates a one-row batch with defaults prefilled and the word "batch" kept out of my way, so that a single gift costs one motion and never feels like ceremony. `[D1, D5]`
3. As a **finance lead**, I want the gift-entry-batch domain kept strictly distinct from the existing contribution-operation-batches domain (which acts on _existing_ gifts), even though both may reuse generic infrastructure, so that "create new money" and "operate on already-recorded money" never share a state machine. `[D1.a]`
4. As a **batch-entry operator** opening a **New batch**, I want to name it, see a per-tenant-unique batch identifier assigned, and pick a **batch template** (or accept the tenant default), so that the batch is identifiable in lists and pre-shaped to the work I am about to do. `[D1, D7, B]`
5. As a **batch-entry operator**, I want to choose a batch template that sets my column set/order, default designation, source code, site, tender, gift-date rule, receipt disposition, deposit behavior, and which optional validation/approval policy applies, so that a recurring job (Sunday cash, mailed checks, a church remittance) starts correct instead of blank. `[D7]`
6. As a **finance lead** on a brand-new tenant, I want three system-seeded starter templates — **Mail/Check**, **Sunday Cash**, **Church Remittance** — plus one non-deletable **System Default**, all copied in as editable/renamable/deletable tenant-owned rows, so that we are never staring at an empty configuration on day one. `[D7 CB-3b]`
7. As an **org admin**, I want a template edit to take effect only on _future_ batches — an in-progress or already-posted batch keeps the frozen snapshot it was created with — so that changing a default never silently rewrites gifts already keyed. `[D7]`
8. As a **finance lead**, I want a batch template to be **config-frozen but safety-live**: its presentation, defaults, and column layout are frozen by value onto the batch, but every money-integrity control (control-total gate, high-risk routing, receipt eligibility, settlement-rail rules, deposit eligibility, approval policy) is re-evaluated **live at commit** against current tenant config, so that a template can set defaults but can never become a back door around a control. `[D7 H1/CB-1]`
9. As an **org admin**, I want a template to be able only to _add_ strictness (require a normally-optional field, select a tighter approval policy), never to _subtract_ a control (it can never make an ineligible gift receiptable, disable the control-total gate, change a tender's settlement rail, or bypass high-risk routing), so that configuration cannot weaken integrity. `[D7]`
10. As a **finance lead**, I want a **"Save this batch as a template"** action gated to a manager capability, with non-managers instead offered **"Save as my personal layout"**, so that shared configuration is deliberate while individuals can still tune their own view. `[D7 CB-3a]`
11. As a **batch-entry operator**, I want **personal per-user column preferences** that layer on top of the shared template without touching it, so that my column widths and visibility are mine and don't reshape the batch for teammates. `[D7 H6]`
12. As a **batch-entry operator**, I want a template that flips a normally-optional field (like postmark) to required to warn me plainly when it does so, and I want the year-boundary postmark nudge to persist regardless, so that added strictness is visible and the tax-year guard is never lost. `[D7 CB-4]`
13. As a **batch-entry operator** using quick entry, I want the System Default template to always resolve a usable configuration (never null) and never confront me with a template picker, so that the fast path stays fast. `[D7 H9/H12]`

### Workbench, keyboard grid, and data entry

14. As a **batch-entry operator**, I want a three-layer workbench — an always-visible reconciliation rail (expected vs entered count and amount, open issues, save state), an editable grid holding only the common-path fields (donor, amount, designation, gift date, check/reference), and a non-modal row inspector for the exception fields — so that ordinary keying stays dense and exceptions never hijack the whole screen. `[D3]`
15. As a **batch-entry operator**, I want the editable grid to obey the WAI-ARIA APG grid keyboard contract — a single tab stop with roving focus, arrow keys to move between cells, Enter or F2 to edit, Escape to cancel and restore navigation, Home/End and Ctrl+Home/End and PageUp/Down — so that I can key an entire batch without ever reaching for the mouse. `[D3, R4]`
16. As a **batch-entry operator**, I want a spike-validated **Enter** behavior — the working default is commit-and-move-down with Excel-style snap-back — treated as a testable contract that operator testing may refine before the grid freezes, so that the single most-used keystroke is chosen from evidence, not guessed. `[D3]`
17. As a **batch-entry operator**, I want the row I am editing to stay mounted and my focus to stay put even as autosave fires and the grid virtualizes rows off-screen, so that a long batch never loses my place or drops my keystroke. `[D3, R4]`
18. As a **batch-entry operator** entering many similar gifts, I want in-cell fill-down and copy-previous ergonomics plus TSV clipboard paste within the grid, so that repetitive columns (same designation, same date) are one motion rather than retyped per row. `[D3, H, G]`
19. As a **batch-entry operator**, I want a formal multi-row spreadsheet _import_ with column mapping and bulk donor resolution to be explicitly out of scope for v1 (that is the Phase 30 (Imports) surface), so that the grid stays a keying tool and I know where large imports will live. `[G, D30 seam]`
20. As a **batch-entry operator** hitting an exception (a split, a DAF, a tribute, a new donor, a remittance attribution), I want the non-modal inspector to open beside the row, keep the row visible, and return focus to the originating cell when I close it, so that handling an exception never makes me lose the batch context — the top complaint about legacy tools. `[D3, R3]`
21. As a **batch-entry operator** entering a split gift, I want to designate one gift across multiple funds or missionaries in the inspector, with the split total reconciled against the gift amount before the row can validate, so that multi-designation gifts are ordinary entry, not a workaround. `[D3, L, P13]`
22. As a **batch-entry operator**, I want a designation to re-resolve live against the current campaign/designation catalog at commit (a dead or renamed designation is rejected at commit, not silently posted), so that ledger truth always reflects the real designation. `[D7 H1, P13]`
23. As a **batch-entry operator** on a tablet in landscape, I want the workbench to be desktop/tablet-first, and I want the phone experience deliberately scoped to batch list, status, review, and approve — not the entry grid — so that I'm never asked to key a dense grid on a phone. `[D3]`

### Party lookup, create, and immediate matchability

24. As a **batch-entry operator**, I want search-as-you-type donor lookup returning a short, quiet list (`Name — City · last gift $X`) with inline **create new**, so that finding or minting the right party is one motion inside the row. `[I, P4, P14]`
25. As a **batch-entry operator** who just created a new donor inside the batch, I want that donor to be **immediately matchable within the same batch** — no 5–10 minute cache lag — so that the second gift from the same new donor links correctly right away. `[I, R3 differentiator]`
26. As a **batch-entry operator**, I want donor matching to reuse the existing resolver (email exact → attach; name+address → possible match held for my decision; never silent auto-merge), so that offline entry inherits the same identity discipline as online checkout. `[I, P4]`
27. As a **batch-entry operator**, I want a duplicate-donor alert at create time with the candidate shown, so that I don't mint a second record for a donor who already exists. `[I, J, P4]`
28. As a **batch-entry operator** recording loose-plate or unattributed cash, I want a per-tenant house **"Anonymous"/unattributed** donor pattern (nullable legal-donor snapshot + anonymous flag, no receipt, still counted toward the control total), so that a Sunday-cash batch can be recorded without inventing fake donors. `[Y anonymous-cash, P7]`

### Control totals, validate=post, and the safety nets

29. As a **finance lead**, I want a **control total** (expected count and amount) with a live running-vs-expected tally on the rail, so that I can see a batch converge on its expected figure as I key. `[M, D2, R3]`
30. As a **batch-entry operator**, I want a control-total mismatch to **block commit by default**, so that an unbalanced batch cannot post by accident. `[D2, M]`
31. As a **reviewer/approver** with the override capability, I want a **governed override** of a control-total mismatch that requires a reason, freezes the _original_ expected totals forever, and stamps my identity and reason on the batch record and the deposit report, so that a mismatch is never silently erased (the CiviCRM audit-erasure trap is closed). `[D2, M]`
32. As an **org admin**, I want a per-tenant option to require a **second person** on a control-total override, so that a small org can stay lean while a larger org can demand a second set of eyes on the one place money can go unbalanced. `[D2]`
33. As a **batch-entry operator**, I want every gate to explain itself in plain language — what is wrong, why it matters, how to fix it, and what it blocks — so that a control never reads as an opaque wall. `[D2 founder rider]`
34. As a **batch-entry operator**, I want **validate = post** by default: once I complete and validate a clean, balanced batch, it posts immediately and the separate approve step collapses into validate, so that ordinary batches don't wait on ceremony. `[D5 Mod1]`
35. As a **batch-entry operator**, I want validation to be **always non-mutating and revision-bound** — any material edit invalidates the prior validation (and any approval), and commit accepts only the exact approved revision — so that what posts is exactly what was validated. `[D2, N]`
36. As an **org admin**, I want the second-approver / quorum step to be **opt-in per tenant** (added validators or extra checks), not the default, so that low friction is the norm and extra control is a deliberate choice. `[D5 Mod1, P]`
37. As a **reviewer/approver**, I want ordinary gifts to post instantly but **high-risk gifts** — large amount above a tenant threshold, brand-new donor, cash, or backdated — to **auto-route to a brief review even in default mode**, so that the riskiest gifts get eyes without slowing the routine ones. `[D5 micro-choice 1]`
38. As an **org admin**, I want a **new-operator soft-guard** that routes a user's first ~3 batches (or first few days) to review and then graduates them automatically with no admin action, so that new staff are caught early while established staff keep full low friction. `[D5 micro-choice 4]`
39. As a **finance lead**, I want the removed second-approver replaced by an always-on **detective floor** — actor stamps, a "recently posted" feed, and anomaly signals — plus the one surviving preventive separation of duties: money-OUT actions (refund/void-receipt above a tenant threshold) are never self-approvable by the poster, so that single-actor entry stays fast while the dangerous reversals still need a second person. `[D5]`
40. As a **batch-entry operator**, I want exactly **one per-batch confirmation** — a single plain-language "Post N gifts ($X) and email M receipts now?" restating the counts and the tender-conditional receipt reality — shown once per batch or per quick-entry gift and **never per row**, so that there is one clear safety moment for the irreversible money-and-receipt action and no confirmation fatigue. `[D5 micro-choice 3]`

### The escape valve (stuck rows)

41. As a **batch-entry operator** with a mostly-clean batch and a few unresolvable rows, I want a capability-gated, audited **escape valve** — "commit the clean rows now, carry the unresolved rows into a linked follow-on draft batch" — shown loudly, so that one stuck gift doesn't hold an entire deposit hostage. `[D5 Path C]`
42. As a **finance lead**, I want the escape valve to preserve a frozen conservation invariant (committed actual + pending async + carried expected = the frozen original expected), with each committed subset atomic and idempotent, so that carrying rows forward can never lose or double-count money. `[D5]`
43. As a **batch-entry operator**, I want a clean async-ACH gift to stay with its origin batch as `partially_posted` (never carried), while a genuine error is the only thing carried to the linked follow-on draft, so that "not settled yet" and "actually broken" are handled differently. `[D5]`
44. As an **auditor**, I want the carried follow-on batch bidirectionally linked to its origin with the split of expected totals recorded, so that I can reconstruct exactly which gifts moved and why. `[D5, AS]`

### Check gifts

45. As a **batch-entry operator** entering a check, I want `check_number` as a first-class field plus optional postmark and received dates, so that the check's identity and timing are captured the way finance actually files them. `[X, P13 D8]`
46. As a **batch-entry operator**, I want **postmark to be optional**; when I skip it the dating resolver falls back to the received date and stamps the delivery basis it used, so that I'm not forced to type a postmark I don't have. `[D5 Mod4, X]`
47. As a **batch-entry operator** entering checks in late December or early January, I want a non-blocking **year-boundary nudge** (config window ~Dec 26–Jan 15) asking for the postmark because it changes the tax year, so that a Dec-30-postmarked / Jan-3-received check lands in the correct tax year and on the correct receipt. `[D5 Mod4]`
48. As a **batch-entry operator**, I want a check to **post immediately** and, when the governing Phase 7 plan or ordinary policy admits an individual receipt, issue that receipt without waiting for clearance, so that the donor gets contemporaneous substantiation without violating an annual-cumulative plan. `[D5 Mod2, D6 CB-B, P7/P19 D4]`
49. As an **org admin**, I want an **opt-in per-tenant toggle to hold a check's tax receipt until it clears**, off by default, running over the same receipt-timing rail, so that a cautious tenant can defer receipts without a separate code path. `[D6 CB-B]`
50. As a **finance lead** handling a bounced check, I want an **NSF clawback** that runs the append-only compensating reversal and issues a void/corrected receipt, so that a returned check is fully unwound without ever mutating the original posting. `[D6 CB-B, P13 NSF]`
51. As a **batch-entry operator**, I want a non-blocking **duplicate warning** on a re-entered `check_number` (within the batch and a bounded recent cross-batch lookback) and on a donor+amount+date match, plus a flag if the gift appears already-posted, so that likely double-entry surfaces without ever auto-blocking a legitimate repeat. `[J]`

### Cash gifts

52. As a **batch-entry operator**, I want cash recorded with received date, receiving staff, and an optional deposit reference, so that loose cash has an accountable trail from the moment it's keyed. `[Y, P13 D8]`
53. As a **reviewer/approver**, I want every **cash** batch/gift to auto-route to the high-risk review path by default, so that the tender most prone to skim gets a second look as the primary internal control. `[D5 micro-choice 1]`
54. As an **org admin**, I want a **cash-undeposited-aging** signal that is built and defaults on but is fully tunable, snooze-able, and disable-able like every other deposit signal, so that a tenant can lean on the automated skim-detection prompt or deliberately turn it off (accepting the trade-off). `[D6 CB-D/HD-14]`
55. As a **finance lead**, I want a dedicated two-person cash-count attestation surface explicitly **deferred to fast-follow** in v1 (relying on the mandatory cash→review route), so that we ship a real cash control now and reserve the heavier dual-count capture for later. `[Y dual-count, founder-confirm]`

### Offline ACH/wire and church remittances

56. As a **batch-entry operator** entering a bank-direct ACH or wire, I want it recorded as an offline tender whose **settlement_rail** is bank-direct, so that it is eligible for a manual deposit group and never confused with a Stripe-settled payment. `[Z, D4 A1, D6 CB-A]`
57. As a **finance lead**, I want a wire / direct-credit to carry a `direct_credit`/`no_slip` deposit-state (bank-reconciled by Phase 20, no Phase 15 slip), so that money that arrives already in the bank isn't forced onto a deposit slip it doesn't belong on. `[D6 CB-A]`
58. As a **batch-entry operator** entering a **church remittance** (one payment covering many attributed lines), I want a remittance attribution sub-grid in the inspector — a picker with copy-last-remittance prefill, CSV-paste staged preview, and per-row ambiguity holds — where each line captures attribution as input, so that a bulk remittance is keyed once and correctly. `[AA, P14 contract]`
59. As a **developer**, I want the remittance sub-grid to treat attributions as capture _input_ that generates donor-credit rows downstream — the grid itself **never writes credit rows** — so that the grid stays a capture surface and credits are minted by the credit engine, not the UI. `[AA, P14 contract]`

### Securities, in-kind, and other noncash

60. As a **batch-entry operator** recording a securities (stock) gift, I want it modeled as **one gift with a lifecycle** — the gift itself plus liquidation/proceeds captured as non-contribution facts that Phase 20 reads — so that donated stock and the cash it later becomes are one honest record, not two counted gifts. `[AG, D4]`
61. As a **finance lead**, I want **describe-never-value** enforced as a schema invariant across every noncash channel — the org records what was given, never attests a dollar valuation — so that we never take on the donor's Form 8283 valuation duty. `[AH, D4]`
62. As a **batch-entry operator** recording an in-kind gift, I want a $0 recognized amount plus a walled place to note description and any appraisal/evidence the donor supplied, so that the gift is honored and documented without the org putting a price on it. `[AH, D4]`
63. As a **finance lead**, I want an **8282 disposition clock** to ship alongside proceeds tracking, so that if we later sell a donated noncash asset within the reporting window the disposition duty is surfaced. `[AG, D4]`
64. As a **batch-entry operator** recording a vehicle, real-estate, or crypto gift, I want **one generic noncash shape** with a reserved gift_method and duty flags (no bespoke per-asset engine in v1), so that unusual noncash gifts can be recorded correctly without over-building five specialized lanes. `[AI, D4]`

### Phone gifts — the native embedded Stripe lane

65. As a **batch-entry operator** on a live call, I want to start a **phone gift** from the donor or batch workbench with donor, amount, designation, campaign, and details pre-populated, so that I'm oriented and fast the moment the donor is ready to pay. `[AJ, D4 founder ruling]`
66. As a **batch-entry operator**, I want to choose **card or ACH** and then have a secure Stripe-controlled payment surface appear inside the natural Asym flow — an embedded Payment Element where Stripe owns the sensitive fields but the experience feels native — so that I take the payment without a confusing handoff, copied charge IDs, or a manual record-link afterward. `[AJ, D4 founder ruling, Stripe deep dive]`
67. As a **developer**, I want the phone **card** gift to be a fully-native same-call flow: staff key into the Stripe iframe and the server confirms the PaymentIntent with the MOTO flag, reusing the existing PaymentIntent + saga + webhook + staged-gift seam and auto-linking via PI metadata, so that a phone card gift is an online gift written by the webhook — never an offline batch money row (no double-count). `[AJ A7/A18, D4]`
68. As a **finance lead**, I want raw card and bank-account details to be a permanent hard line: **Asym never stores, logs, or directly processes them** — they go browser→Stripe inside Stripe's iframe and never touch our systems, so that our PCI posture stays SAQ-A. `[AJ, D4 safety principle]`
69. As a **batch-entry operator** taking a phone **ACH** gift, I want the honest primary flow: a mid-call Financial Connections link the donor taps once on their own device (a WEB mandate, principle-safe, instant validation), after which the call ends with "submitted / pending settlement" and the receipt fires on later settlement, so that I stay native for the whole call even though ACH physically can't clear on the call. `[AJ ACH primary, Stripe deep dive]`
70. As an **org admin** who has met the guardrails, I want a **secondary staff-keyed TEL ACH lane** behind its own capability, Stripe-beta-enabled, with call recording/retention and two-party-consent legal review in place and single-use-only, so that a fully-staff-completed phone ACH is possible where the tenant has done the compliance work — never as the default. `[AJ TEL lane, D4 founder ruling]`
71. As a **developer**, I want the phone-gift webhook lifecycle to handle `pending_ach → completed → reversed` plus dispute and charge.failed events with 3-key idempotency, the receipt gated on `succeeded` (never `processing`), and an Events-API sweep backstop, so that async phone payments never double-post, double-receipt, or silently drop. `[AJ A18]`
72. As an **org admin**, I want the workbench to **auto-gate** card and ACH availability by reading the connected account's Stripe capabilities (with MOTO detected-and-degraded because it stays Stripe-support-gated), so that staff only ever see payment options the account can actually run. `[AJ A16, Connect switch]`
73. As a **reviewer/approver**, I want a distinct `take_phone_payment` capability plus retained authorization/consent/mandate evidence and suppression of Stripe's own receipt email (Asym owns the receipt), so that phone payments are permissioned, evidenced, and never double-receipted. `[AJ A17]`
74. As a **batch-entry operator**, I want clear in-flow handling of declines, timeouts, abandoned payments, and disconnects — with status, errors, confirmation, gift creation, and receipt eligibility all updating automatically — so that a failed or interrupted call resolves cleanly without me hunting for the payment. `[AJ, D4 founder ruling]`

### Receipts, acknowledgments, and amend-a-gift

75. As a **donor**, when the governing Phase 7 plan or ordinary policy admits an individual receipt for my settled-on-entry gift, I want a contemporaneous **tax receipt** at post, while an annual-cumulative gift is truthfully shown as ready for year-end coverage, so that substantiation follows the issuer's governing policy. `[D5 Mod2, AK, P7/P19 D4]`
76. As a **batch-entry operator**, I want plan-admitted tax receipts to flow through the existing donation-saga **outbox** in the post transaction (never an inline send), while annual-cumulative occurrences create no per-gift receipt/outbox row, so that issuance is durable, consent-respecting, observable, and nonduplicative. `[D5, AK, P7/P19 D4]`
77. As a **batch-entry operator**, I want a **short, donor-invisible receipt catch-window** (a few minutes, tenant-lowerable to 0) giving me a one-click recall for a fat-finger or wrong-donor before the email leaves, while the donor still sees a contemporaneous receipt with an unchanged gift date, so that a mistake is recoverable without deferring the receipt. `[D5 micro-choice 2]`
78. As a **finance lead**, I want "receipts immediately" to mean only a **P7 plan-admitted individual tax receipt** — never an annual-cumulative receipt or a Phase 14 acknowledgment stream — so that the receipt plan and the three-document wall (receipt / acknowledgment / notification) both hold. `[D5, P7, P14, P19 D4]`
79. As a **batch-entry operator** who mis-keyed a gift inside a posted batch, I want to **amend that single donation** without redoing the whole batch, delivered as an append-only compensating correction (via the correction spine) rather than an in-place edit, so that a posted gift stays immutable while my fix still lands. `[D5 Mod3, P13]`
80. As a **batch-entry operator** editing a **draft** (pre-commit) row, I want free row edits, so that fixing a typo before posting is instant — the compensating-correction path only applies after commit. `[D5 Mod3]`
81. As a **donor**, I want a correction that changed a gift I was already receipted for to trigger a versioned **corrected/void receipt**, so that my records and the org's stay consistent after a fix. `[D5 Mod3, P7]`

### Per-row credit capture (DAF, soft credit, tribute, matching)

82. As a **batch-entry operator** entering a DAF grant in a batch, I want a per-row DAF attribution cell (progressive disclosure — DAF fields appear only for a DAF tender) that captures attribution as input, so that a DAF gift is recorded with its advisor without cluttering ordinary rows. `[AB, P14]`
83. As a **batch-entry operator**, I want a per-row **soft-credit** capture cell that feeds the donor-credit engine (the grid never writes credit rows), so that influence credit is captured at entry and minted downstream. `[AC, P14]`
84. As a **batch-entry operator** entering a memorial or honor gift, I want a per-row **tribute** capture cell (inline tribute link/create that never gates posting), so that money capture is never blocked by tribute ceremony. `[AD, P14]`
85. As a **batch-entry operator**, I want a per-row **matching-gift** cell with the employer prefilled from the Phase 9 employment relationship, so that capturing an employer-match expectancy is one motion. `[AE, P14, P9]`
86. As a **donor-care staffer**, I want batch-entered tribute _notifications_ and DAF/soft-credit _acknowledgments_ to land held (not auto-sent) at commit, released only by the deliberate Send-acknowledgments gate, so that a batch of memorial gifts never blasts a family with letters before anyone decides to send. `[AD/AB/AC, P14, NF3]`

### The Send-acknowledgments gate (NF3)

87. As a **batch-entry operator**, I want a single deliberate per-batch **"Send acknowledgments"** action, available _after_ validation on the posted-batch summary and the workbench rail card (never in the hot-path grid), that flips this batch's ready held acknowledgments into the existing Phase 14 send pipeline, so that there is one clear human moment that confirms intent to thank this batch's parties. `[NF3]`
88. As a **batch-entry operator**, I want a pre-send **manifest** before I confirm — a by-stream breakdown, always-visible held / won't-send / scheduled reasons, one rendered sample, and template-variable health (a broken required variable holds that row rather than sending it blank) — so that I know exactly what will go out before I send. `[NF3]`
89. As a **batch-entry operator**, I want one confident button ("Send 44 acknowledgments") and a "Not yet", with per-stream sending existing only because async readiness splits streams (send what's ready, sweep the rest idempotently, never freeze the batch on one stalled generator), so that the action is simple but resilient. `[NF3]`
90. As a **batch-entry operator**, I want a batch-grain **recall window** on the acknowledgment send (the batch-level expression of Phase 14's ~10-minute hold, tenant-lowerable to 0), so that undo — not an interrogating dialog — is the real safety beat. `[NF3]`
91. As a **donor-care staffer**, I want a live results view after sending (per-recipient outcomes with Retry / Retry-all-failed), so that a blocked or failed thank-you is a visible, actionable fact, never silence. `[NF3, P14]`
92. As a **batch-entry operator** using quick entry for a single deliberate tribute or DAF gift, I want a visible, checked-by-default, one-tap-reversible line inside the single post-commit confirm ("☑ Also send the thank-you to Jane Advisor") — not a silent auto-send and not a separate manifest — so that a one-off deliberate acknowledgment goes out without ceremony while staying my choice. `[NF3, D1 batch-of-one]`
93. As a **donor-care staffer** with restricted-party visibility, I want the manifest projected per-viewer — restricted rows absent, the button count reflecting only the visible set, and restricted acknowledgments gated to a cleared actor — so that the send surface never leaks a party I'm not allowed to see. `[NF3, P10/P11/P3]`
94. As a **developer**, I want the Send-acknowledgments gate to reuse the donation-saga outbox (idempotency key `(tenant, header/settlement, notify_party, stream)`, per-tenant throttle, 5-attempt dead-letter), the Phase 6 fail-closed consent gate, and Phase 14's ack columns and guardrails — one trigger edge, no second send path — so that the gate is a new _button_, not a new pipeline. `[NF3]`
95. As a **donor-care staffer**, I want a posted batch that later gains an acknowledgment (a late-generated credit or a Mod3 correction ack) to re-arm the panel with a delta ("3 more ready — Send 3"), with idempotency preventing any double-thank, so that late additions are thanked exactly once. `[NF3]`
96. As a **developer**, I want the acknowledgment send to **never** write a tax-receipt record (an explicit three-document-wall test), so that thanking a batch can never accidentally issue a receipt. `[NF3, P7]`

### Deposit grouping and slips

97. As a **finance lead**, I want **deposit groups** to be a first-class concept separate from entry batches — a gift carries a deposit-state (undeposited → assigned-to-deposit → deposited/cleared) decoupled from both the batch lifecycle and the posting lifecycle — so that how money physically reaches the bank is modeled independently of how it was keyed. `[D6, V]`
98. As a **finance lead** with a same-day check scanner (RDC) at the desk (**V1**), I want a batch that is effectively its own deposit, near-instant, so that the desk-scan workflow is supported (the scanner integration itself is a reserved seam, the same-day path is manual in v1). `[D6, AL]`
99. As a **finance lead** who **deposits first and enters after the checks clear** (**V2**), I want a deposit group that can exist _before_ its gifts, so that a gift entered later attaches to the already-made physical deposit. `[D6]`
100.  As a **finance lead** who **enters in a batch and deposits days later** (**V3**), I want to attach the batch's gifts to a deposit group after posting, so that entry-precedes-deposit-by-days is a normal path. `[D6]`
101.  As a **finance lead** making **large weekly multi-batch deposits** (**V4**), I want many batches' gifts to attach to one deposit group (N→1), so that a weekly bank run is one deposit. `[D6]`
102.  As a **finance lead** wanting the simple case (**V5**), I want a one-click **"deposit this batch"** that creates a 1:1 deposit group, so that the common path is a single action. `[D6]`
103.  As a **finance lead** whose workflow is **inconsistent week to week** (**V6**), I want none of these choices to lock me in — no rigid batch=deposit binding, deposit assignment optional and changeable — so that the same tenant can mix 1:1, N:1, deposit-first, and enter-first freely. `[D6]`
104.  As a **developer**, I want the gift↔deposit link on the mutable header (never on the immutable postings), with an append-only `deposit_assignment_events` trail, so that membership stays changeable after posting while the ledger stays append-only (grouping moves no money, so it needs no compensating posting). `[D6]`
105.  As a **finance lead**, I want **Stripe-settled** card/ACH gifts (settlement_rail = Stripe) **rejected from any manual deposit group** by a hard DB rule — they reconcile via Stripe payouts (`settles_via_payout`) — so that a Stripe gift can never be double-counted against both a payout and a manual deposit. `[D6 HD-5/CB-A]`
106.  As a **finance lead**, I want deposit-group membership **freely editable up until Phase 20 exports it** (add/remove/reassign, audit-stamped), and **compensating-correction-only** after export (Phase 15 cannot mutate an exported deposit), so that flexibility is maximal until the accounting boundary makes it immutable. `[D6 CB-C/HD-8]`
107.  As a **finance lead**, I want a **printed deposit slip** retained as an immutable snapshot (it went to the bank), so that post-print membership edits are allowed and audit-stamped and a new slip can be reprinted, but the prior snapshot persists and can diverge honestly from the live record. `[D6 CB-C]`
108.  As a **finance lead**, I want a bounced check (NSF) to **stay shown in its historical deposit** with its state moved to `returned` (never vanishing — it really was on that physical slip), while the money reversal is append-only, so that history matches the physical deposit. `[D6 CB-E]`
109.  As a **finance lead**, I want a **soft** deposit-level total — a live selected-vs-expected tally with a non-blocking mismatch warning (audit-preserved if a slip prints on mismatch) — that is never a second hard gate and is independent of the entry-batch control total, so that the deposit total is a reconciliation aid, not another wall. `[D6 CB-F]`
110.  As a **finance lead**, I want deposit management to live in **both** the workbench rail and a first-class **Deposits** area over one service, so that I can group as I enter or manage deposits on their own screen without two divergent implementations. `[D6]`
111.  As a **finance lead**, I want the Phase 15 / Phase 20 boundary clear — Phase 15 owns the grouping workflow, the slip, and the operational deposit-state; **Phase 20 owns the GL undeposited-funds account and bank-statement tie-out** — so that we don't build GL or bank reconciliation in Phase 15. `[D6, AT]`

### Permissions, audit, and observability

112. As an **org admin**, I want distinct capabilities for the money surfaces — record a contribution, manage batches, manage batch templates, take a phone payment, manage deposits (`finance:manage_deposits`), and override a control total — so that the sensitive actions are separately grantable. `[AR, P12]`
113. As an **org admin**, I want restricted party data projected per-viewer through the existing projection chokepoint everywhere in the workbench, manifest, and lists, so that a staffer never sees a party or field they aren't cleared for. `[AR, P10/P11/P3]`
114. As an **auditor**, I want an append-only audit spine with specific stamps — the override's frozen original totals + reason + actor, the detective-floor actor stamps, deposit assignment events, phone-payment mandate evidence, template config changes, and the revision counter — so that every sensitive action reconstructs from the record. `[AS]`
115. As a **finance lead**, I want one owned, aged **post-hoc worklist** collecting corrections, void receipts, failed receipts, and open follow-on batches, plus Phase 8 data-health signals, so that the loose ends of automation are a finite, owned pile rather than scattered surprises. `[AU, D5, P8]`
116. As a **donor-care staffer**, I want a **7th data-health signal** — acknowledgments held (`batch_gate_pending`), failed, or dead-lettered older than a tenant window (default ~7 days, default-on, disable-able) — so that a batch whose Send-acknowledgments gate was never pressed doesn't strand grateful donors unthanked. `[NF3, P8]`
117. As a **finance lead**, I want live batch and deposit telemetry (counts, totals, aging, anomaly signals) that respect the same per-viewer projection, so that oversight dashboards never become a data-leak. `[AU]`

### Recovery, concurrency, and session safety

118. As a **batch-entry operator**, I want a **single-active-editor lease** on a batch plus a revision backstop, so that two people can't silently clobber each other's edits and commit still accepts only the approved revision. `[AO, D3]`
119. As a **batch-entry operator** whose browser crashed or connection dropped mid-batch, I want a defined autosave cadence and a crash/disconnect recovery that restores my in-progress rows, reacquires my editor lease, and reconciles the revision counter, so that a long batch survives a laptop lid or a flaky network. `[AP]`
120. As a **developer**, I want the large-batch commit to be **chunked-but-atomic-per-commit** with a documented batch-size ceiling and posting-sequence contention mitigation, validated by an early **commit spike** ticket, so that a 500-row batch posts safely and the design is proven before dependent work starts. `[S, T]`
121. As a **batch-entry operator** who commits and then loses connection, I want the commit to be idempotent so a retry never double-posts the same subset, so that recovery is safe. `[T, R1 saga]`
122. As a **batch-entry operator** abandoning a draft, I want draft deletion to be **warn → archive-to-audit, never silent delete**, so that an abandoned batch leaves a trail instead of vanishing. `[AN, D3]`

### Accessibility

123. As a **keyboard-only operator**, I want the whole entry flow — grid, inspector, lookup combobox, gates, and the Send-acknowledgments manifest — to complete without a mouse, so that keyboard users are first-class, not accommodated. `[AV, D3]`
124. As a **screen-reader user**, I want the grid to expose aria-rowcount/-rowindex totals for virtualized rows and default values announced as real committed values (never placeholder text) with a non-color "from template" cue, so that assistive tech reports the batch accurately. `[AV, D7 H12]`
125. As an **operator with low vision or a motor impairment**, I want ≥24px target sizes, focus never obscured by the sticky rail or pinned footer, and a visible focus appearance, so that the workbench meets WCAG 2.2 (2.5.8, 2.4.11) and stays usable under real conditions. `[AV, R4]`
126. As a **donor** receiving any letter or receipt from a batch, I want the document to be accessible (WCAG 2.2 AA email and tagged-PDF print), so that the output is readable regardless of ability. `[AV, P7]`

### Org admin, developer, auditor, missionary, and compliance

127. As an **org admin** on a small org, I want a lean default policy set — approval rules keyed only on cash batches, control-total overrides, large totals, and backdated gifts, not on everything — so that friction is spent only where money-integrity buys it back. `[D2 rider]`
128. As a **developer**, I want the first build ticket to land the minimal Phase 13 posting substrate (headers / designation_lines / postings + effective_seq + immutability trigger + credit_recheck outbox), because the append-only ledger it depends on is groomed-not-built, so that amend-a-gift and validate=post have real ledger truth to write to. `[D5 Amd6, P13 epic #690]`
129. As a **developer**, I want the retired Track-B 501 bridge deleted while salvaging only its zod schema and receipt-status logic as precedent, so that the unwired offline slice doesn't survive as a shadow write path. `[D1.b/D1.c]`
130. As a **developer**, I want the two gating keyboard spikes (Enter semantics + donor typeahead) and the autosave/recovery spike to run as early build tickets whose reports may amend the keyboard/recovery contracts before dependent slices start, so that the riskiest interaction assumptions are validated before they're built on. `[D3, AP]`
131. As a **finance lead**, I want a required **counsel/finance sign-off gate** on receipt language, tax-year treatment, noncash 8283/8282 duty wording, and NACHA/MOTO mandate/consent language before the relevant ship boundary (mirroring the decided TEL two-party-consent review), so that the compliance-sensitive surfaces are reviewed by the right people before they go live. `[AW, founder-confirm]`
132. As a **missionary**, I want an offline gift designated to my ministry (fund or missionary designation) to appear in my giving records once its batch posts, exactly as an online gift would, so that offline and online support are one consistent picture. `[L, P13, P16 seam]`
133. As a **finance lead**, I want the commitment-fulfillment match-at-entry affordance **deferred** in v1 (the Phase 16 commitment model is groomed-not-built) with the inspector seam reserved, so that we don't build against a model that doesn't exist yet. `[AF]`
134. As a **batch-entry operator**, I want per-gift and per-batch **free-text notes** (audited), with document attachment deferred to the reserved Phase 29 files seam, so that context and evidence can be captured cheaply now and richer attachment lands later. `[AM, P29 seam]`
135. As an **auditor**, I want the terminal batch state to be simply **posted/committed** (there is no separate posting `finalize` under validate=post; "export" is reserved for the Phase 20 accounting-export axis and the deposit-`exported` regime), so that state names don't collide across phases. `[U]`
136. As a **donor**, I want a batch/import-origin gift to never trigger an unexpected acknowledgment blast, so that being entered in a batch never means a surprise flurry of letters — the deliberate gate decides. `[NF3, P14]`
137. As a **finance lead**, I want non-cash rows ($0 in-kind, described noncash) to count as items toward the batch's item/count tally, never into the cash dollar control total, so that a mixed batch of cash and in-kind still balances honestly. `[NF7, M]`
138. As a **reviewer/approver**, I want a review node to never be self-satisfying — an actor cannot approve their own high-risk gift where the surviving money-OUT separation applies — so that the one preventive control that remains can't be trivially bypassed. `[NF1, D5]`
139. As an **org admin**, I want the approval policy to **fail closed to the tenant default** (never fail open to no-validation) whenever a template's selected policy is missing or stale, so that a misconfiguration can never remove a control. `[D7 H9]`
140. As an **auditor**, I want the batch to stamp its `template_id` + revision and the frozen original expected totals, so that I can reconstruct which configuration and which control-total baseline governed any given batch. `[D7 H13, D2]`

## Implementation Decisions — Lifecycle & Commit Spine (D1 · D2 · D5)

This section defines the backbone every other Phase 15 (Offline Gift & Batch Entry) surface hangs from: the single domain that owns staff-entered offline money, the one lifecycle it moves through, and the one atomic commit service that turns entered rows into posted ledger truth. It is normative. Where a rule here conflicts with a downstream section (workbench UX, tenders, deposits, templates, acknowledgments), this spine wins on lifecycle, validation, and commit semantics; downstream sections layer defaults and presentation on top of it.

Glossary anchors used below: _gift-entry batch_, _quick entry_, _validate=post_, _control total_, _governed override_, _high-risk auto-route_, _new-operator guard_, _escape valve_, _frozen conservation invariant_, _Send-acknowledgments gate_.

### D1. One front door for offline money

**Normative rule (D1, non-negotiable).** Every staff-entered offline gift is created inside a **gift-entry batch**. A single gift entered on its own is a _batch of one_ — the same staging model, the same validation engine, the same atomic commit service, the same audit spine. Nothing in the system writes offline contribution money except the batch commit path. There is no second write door, no direct-insert dialog, no bypass endpoint.

The product surfaces this one domain as **two experiences over one pipeline**:

- **New batch** — the multi-row workbench (specified in the workbench section) for a stack of physical gifts (a mail run, a Sunday cash count, a church remittance).
- **Quick entry** — auto-creates a one-row gift-entry batch with template defaults prefilled and the word "batch" hidden from casual staff. Quick entry is a _skin over the batch pipeline_, not a separate code path. Its expected totals are auto-derived (1 item; the entered gift amount). Tenant policy decides whether a quick-entry gift posts immediately or routes to review, exactly as for a multi-row batch.

**D1.a — Domain split (binding).** `gift_entry_batches` (a NEW domain, created by this phase — FORWARD, no SQL exists today) **creates new contributions**. It is a distinct domain from the REAL `contribution_operation_batches` (which runs bulk operations — resend receipt, refund, corrections, replay — over _existing_ gifts and has NO create action). The two domains never share records or state machines. Generic infrastructure MAY be reused across them: the chunked-claim worker pattern, stale-running recovery, the follow-up Mission Control task seam, and audit helpers. The lifecycle records, the state machine, and the commit semantics are Phase-15-owned and are never merged into the operations domain.

**D1.b — Track-B slice classification (binding).** The repo's unwired offline-entry slice is _parts inventory_, not a foundation:

- **Salvage (feeds the row editor):** the zod schema for offline gifts (known vs unknown-offline donor; tender method enum with `batchId` + `referenceNumber` fields already present) and the offline receipt-status resolver (`resolveOfflineReceiptStatus`). These are useful precedent for the row editor and the receipt-eligibility seam.
- **Delete (temporary bridge, never wired):** the legacy-`donations` persistence plan and the 501 binding stub (`OfflineEntryUnboundError`). Under the fresh-build posture (no users, replace outright) Phase 15 posts through the Phase 13 (Contribution Ledger) posting contract, NOT the flat `donations` table. The 501 bridge is removed in **slice one** of the phase; a grep gate asserts `OfflineEntryUnboundError` does not survive the phase.

**D1.c — Consequence.** The standalone "Enter Offline Gift" dialog's _write path_ is retired from the plan. Its UI affordance may be reskinned as the quick-entry entry point, but its persistence route is gone. All offline money — quick entry included — flows through the one commit service.

### D2 + D5. One lifecycle, policy-scaled strictness

There is **one state machine** and **one commit service** for the whole domain. Strictness is scaled by tenant policy and by per-gift risk — never by forking the code. The founder rider binds the _presentation and defaults_ (clarity, amazing UX, lean default gates, plain-language explanations, no ceremony on ordinary actions) but may NOT be read as "make controls optional": validation, evidence preservation, frozen-total audit, and the control-total gate are structural and always present.

#### The state machine (binding)

```
draft ──(material edit bumps revision; autosave)──► draft
draft ──validate (non-mutating, revision-bound; full validation
                  + control-total balance predicate, run server-side)──► validated(revision_token)
validated ──[approval gate: evaluateApprovalGate(batch, tenantPolicy, riskSignals)]
        ├─ auto_satisfied (DEFAULT — ordinary rows, established operator) ────────► posted
        └─ pending(approvers)  (OPT-IN tenant validators/quorum, OR the
                                default-on high-risk / new-operator slice) ──────► awaiting_approval ──quorum──► posted
posted  = per-ROW terminal posting status; BATCH status = a DERIVED rollup
          (posted = all rows terminal | partially_posted = some rows awaiting async settlement)
posted ──[correction]──► compensating correction (append-only; NEVER an in-place mutation of a posted row)
```

**Non-negotiable properties of this machine:**

1. **Validation is always non-mutating and revision-bound.** `validate` computes issues and the control-total balance predicate against a specific batch **revision**; it writes nothing to money tables. Any material edit to any row bumps the batch `revision` and invalidates a prior `validated` token and any approval already granted. The commit accepts **only the approved/validated revision** — a batch edited after validation must be re-validated before it can post. This closes the read-then-write (TOCTOU) window.

2. **The `approve` node is never deleted from the model.** In the default (low-friction) case the approval gate returns `auto_satisfied` and the batch posts without a human approver — this is _validate = post_. But the node stays in the state machine forever for forward-compatibility, so that opt-in validators, quorum, high-risk routing, and the new-operator guard are policy configurations of one machine, not a second machine. Migrations must never fossilize "post immediately" as a code branch that removes the gate.

3. **Posting status is per-row; batch status is a derived rollup.** A batch is `posted` when all its rows reach a terminal posting status, and `partially_posted` when some rows are still awaiting asynchronous settlement (e.g. phone-ACH gated on the settlement webhook). "Posted" stops being a single boolean the moment an async-settling tender is in the batch; the rollup is the truth. Control totals reconcile against _expected vs entered_, never against _posted_ (async rows cannot settle by close of entry).

#### D2. Control totals — hard block, governed override, frozen originals

**Control totals gate the commit by default (D2, non-negotiable core).** A staffer may enter an expected count and expected amount for the batch (a _control total_). If the entered rows do not reconcile to the expected totals, the batch **cannot post**. The balance check is a **validation predicate evaluated inside `validate`** (non-mutating, revision-bound), so collapsing the approve step into validate can never silently drop it. A test asserts no path reaches `posted` with an unresolved mismatch and no override record.

The one sanctioned way past a mismatch is a **governed override**:

- Requires a **distinct capability** (not the ordinary record-contribution capability).
- Requires a **reason** (free text, stored).
- **Freezes the ORIGINAL expected totals forever** — the override records the discrepancy; it never rewrites expected to actual. This is the deliberate fix for the industry anti-pattern (CiviCRM's "ignore mismatch & process" silently rewrites expected totals to actuals = audit erasure). Here the original expected count/amount, the actual entered count/amount, the overriding actor, the timestamp, and the reason are all stamped on the batch record and carried onto the deposit report.
- **Per-tenant policy MAY require a second person** on the override (a targeted, opt-in second-approver on this one high-consequence action) — but that is a tenant dial, not the default.

Control totals are optional to _enter_ (a tenant that keys blind is allowed), but once entered they are a hard gate. A mismatch is never silently erased; the audit trail is always preserved.

#### D5. Validate = post, and the guarded post transaction

**Default behavior (D5 Mod 1, ratified).** Once staff complete and validate a batch, it **posts immediately** — the separate approve step _collapses into validate_ for the default case. Low friction is the point. The D2 second-approver / quorum machinery becomes **opt-in per tenant** ("tenants can add additional validators or extra checks"), not the default.

But "validate = post" is implemented as a **single guarded, revision-pinned, idempotent server transaction** — the client's "Validate" click is an advisory preview only; it never posts. The authoritative post transaction (the _one commit service_) does, in order, inside one database transaction:

1. **Take a per-batch advisory lock** (cooperative; serializes concurrent commit attempts on the same batch).
2. **Assert the pinned revision is still HEAD** — `revision == validated_token`. If a material edit landed since validation, reject with "re-validate" (stale revision). Quiesce/flush any in-flight autosave first; reject if there are unsaved edits.
3. **Re-run validation server-side inside the transaction** — including the **control-total balance predicate**. Client-side validation is never trusted as the gate.
4. **Re-evaluate authorization against LIVE capability state, fail-closed** — a capability revoked between validation and commit must block the post. There is no cached authorization decision.
5. **Evaluate the approval gate** (`evaluateApprovalGate`) — `auto_satisfied` for the default/ordinary case, or route to `awaiting_approval` for opt-in validators / the high-risk slice / the new-operator slice.
6. **Write money rows + Phase 13 postings + the receipt/acknowledgment outbox rows + the batch-status flip — atomically.** A per-batch-revision **idempotency key** makes replay and double-click a no-op.

**One commit service — no fork (D5, binding).** There is exactly ONE code path that writes `contribution_postings`. There is NO `validateAndPost()` fast lane that bypasses the sole money-writer. "Validate = post" is the approval-gate predicate returning `auto_satisfied` and running the _same_ commit the strict path runs. A test asserts **exactly one call-site writes contribution_postings**. Opt-in validators and extra checks are `contribution_approval_policies` rows (the REAL AL-261 pattern: requester ≠ approver, quorum-aware per Phase 12) scoped to gift-entry batches plus Phase 12 capabilities (`finance:record_contribution`, `finance:approve_contributions`) — never a bespoke `batch_validators` table.

**Build-order dependency (binding).** The commit service writes Phase 13 (Contribution Ledger) postings, which are FORWARD — groomed-not-built (owning epic: Phase 13 ledger #690, zero SQL today; children #691–#713 blocked). Phase 15 therefore lands the **minimal posting substrate as its first build ticket**: `contribution_headers` / `contribution_designation_lines` / `contribution_postings` + monotonic `effective_seq` under `FOR UPDATE` + the BEFORE-UPDATE immutability trigger + the `credit_recheck` outbox event. A flat-`donations` in-place-edit interim is **forbidden**. Draft-stage editing (below) needs no ledger and can ship in parallel.

#### D5. Risk-scaled routing — the safety net that replaces the second approver

Removing the mandatory second approver does not remove safety; it _relocates_ it from a blanket pre-post gate to two narrow, risk-scaled routes plus always-on detective controls.

**High-risk auto-route (D5 micro-choice 1, ON).** Ordinary gifts post instantly. Gifts flagged **high-risk** route to a _brief review_ even in default mode. The v1 high-risk set (reuses D2's blessed risk list — lean, not everything):

- **Large amount** — over a per-tenant threshold.
- **Brand-new donor** — first gift for a newly created party.
- **Cash** — the tender with the weakest paper trail.
- **Backdated** — gift date materially earlier than entry date.

High-risk routing is a risk-scored predicate on the ONE state machine (it makes `evaluateApprovalGate` return `pending` for those rows/batches), reusing `contribution_approval_policies` + Phase 12 capabilities. It is the primary safety net standing in for the removed default second approver.

**New-operator soft-guard (D5 micro-choice 4, ON + auto-graduating).** A user's first ~3 batches (or first few days) route to review-before-post; the user then **graduates automatically** with no admin action. Established staff keep full low friction. Tenant-disableable. Like high-risk routing, this is a routing predicate on the one machine, not new machinery.

**Approval = a policy object.** All routing (opt-in validators, quorum, high-risk, new-operator) resolves through `contribution_approval_policies` rows evaluated at commit. Small-org fallback = self-approval only under an explicit tenant policy + reason + loud audit. The policy config is tenant-scoped with RLS and a cross-tenant negative test — no global fallback that could bleed one tenant's rules into another.

**Always-on detective floor (compensating controls, structural).** Independent of routing, every post carries: an immutable **actor stamp** (actor, timestamp, batch id, revision, session/IP); a read-only **"recently posted" review feed**; **money-out separation** (a refund of a posted gift, or a void of its receipt, above a tenant threshold is NOT self-approvable by the poster — the one surviving _preventive_ SoD, because money-out is the embezzlement step, not entry); and async anomaly signals (duplicate-gift, actor velocity, post-then-refund-to-same-destination). Entry itself stays single-actor.

#### D5. The escape valve — three-state carry with a frozen conservation invariant

The default commit is **atomic all-or-nothing**: either the whole batch posts or none of it does. To stop one stuck row from blocking a whole clean batch, a **capability-gated, audited escape valve** commits the clean subset and carries the rest — but it never re-derives totals (that would reintroduce audit erasure). The valve classifies every row into **three** states, not two:

- **Category 1 — clean-terminal.** The row validates and its tender settled on entry (check / cash / settled card). → **Posts in this batch.**
- **Category 2 — clean-async-pending.** The row validates but its tender settles asynchronously (phone-ACH gated on the settlement webhook). It is _not_ an error — it **stays with the origin batch**, which becomes `partially_posted`; it settles later on its webhook. It is **never carried** (carrying it would orphan a live PaymentIntent).
- **Category 3 — genuine error.** The row cannot validate. → **Carried into a linked follow-on DRAFT batch.**

The clean-subset commit and the follow-on-draft creation happen in **the same transaction**; each committed subset is atomic and idempotent over its own rows. The follow-on is a **linked draft** (bidirectionally linked to the origin), inherits identical RLS + capability + tenant gates, and lists its carried rows for confirmation.

**The frozen conservation invariant (SQL-enforced, non-negotiable):**

```
committed_actual  +  Σ pending_async  +  carried_expected  =  frozen original_expected
```

The follow-on inherits only the **frozen carried remainder** — its expected totals are the origin's frozen originals minus what committed and what is pending, never re-derived from the carried rows' entered amounts. The valve is the **cheap v1**: frozen remainder + bidirectional link + aging via the existing Mission Control follow-up-task seam. The heavy provenance/aging engine is CUT from v1 (a capability-gated fast-follow only if a tenant needs day-one audit-grade provenance).

#### D5. Atomic commit at scale — chunked-but-atomic, with a spike

A large batch (hundreds of rows) must post atomically without holding one giant transaction so long it contends the ledger's monotonic posting sequence to a standstill. The v1 posture (PRD-author pin S):

- **Chunked-but-atomic per commit** — the commit may internally chunk its writes, but the _committing subset_ posts all-or-nothing; a partial commit is never observable.
- **A documented per-batch row ceiling** — above the ceiling, the operator splits the batch (or uses the escape valve). The ceiling is a stated number, not an unbounded promise.
- **Posting-sequence contention mitigation** — because `effective_seq` is allocated under `FOR UPDATE`, a very large commit can serialize against every other commit in the tenant. The mitigation strategy (batched sequence allocation, ordering, or a reserved range) is **validated by a COMMIT SPIKE** that is one of the phase's first build tickets — the spike report may amend the ceiling and the chunking strategy before dependent slices freeze.

#### D5. Commit recovery — the webhook/outbox is the truth

If a commit is interrupted (process crash, connection drop) after the transaction commits but before the client sees success, recovery is deterministic because **the durable outbox and the settlement webhook are the source of truth**, not the client's view:

- Receipt and acknowledgment _eligibility facts_ are written to the donation-saga outbox **inside the post transaction** — never as an inline email send. A worker drains them asynchronously (idempotency key, per-tenant throttle, 5-attempt dead-letter). A crashed client never double-sends and never loses a receipt.
- Async-settling tenders reconcile on their settlement webhook; the batch rollup flips `partially_posted → posted` when the last async row settles. A missed webhook is swept by the existing replay/events backstop.
- The per-batch-revision idempotency key means a retried commit call after an ambiguous failure is a safe no-op if the original transaction actually committed.

This reuses the REAL durable saga/outbox + `stripe_raw_events` replay infrastructure; Phase 15 adds no new delivery machinery.

### Module interface — the commit/post service contract

The one commit service exposes a single narrow contract. Names are illustrative of shape, not a mandated symbol table; the _shape_ is binding.

**`validateBatch(batchId, revisionToken) → ValidationResult`** — non-mutating. Runs all row validations and the control-total balance predicate against the pinned revision. Writes nothing to money tables. Returns:

```
ValidationResult {
  revisionToken:      string            // the revision this result is bound to
  controlTotal:       { expectedCount, expectedAmount, enteredCount, enteredAmount,
                        balanced: boolean, overridePresent: boolean }
  approvalPreview:    { willAutoSatisfy: boolean, routedRows: RowRef[], reasons: string[] }
  issues:             ValidationIssue[]
  postable:           boolean           // true only if balanced (or governed override) AND no blocking issues
}
```

**`ValidationIssue` — the canonical issue shape (binding).** Every validation surface (grid, rail, inspector, deposit report) consumes this exact shape:

```
ValidationIssue {
  draftRowId:  string | null   // the row the issue attaches to; null = batch-level issue
  field:       string | null   // the field the issue attaches to; null = row/batch-level
  code:        string          // stable machine code, e.g. "CONTROL_TOTAL_MISMATCH",
                               //   "MISSING_DESIGNATION", "AMBIGUOUS_DONOR", "STALE_REVISION"
  message:     string          // plain-language: what's wrong, why it matters, how to fix
  severity:    "error" | "warning" | "info"
}
```

`error` blocks the post (unless cleared by a governed override for the control-total case). `warning` is non-blocking (e.g. duplicate-`check_number` nudge, year-boundary postmark nudge). `info` is advisory. Plain-language `message` is a PRD acceptance contract — every gate explains what is wrong, why it matters, how to fix it, and what it blocks.

**`commitBatch(batchId, revisionToken, options) → CommitResult`** — the authoritative, guarded, idempotent post transaction described above. `options` carries the optional governed-override record (capability-checked, reason, freezing originals) and the escape-valve flag. It is idempotent on `(batchId, revisionToken)`. It returns the posted header ids, the derived batch status (`posted` | `partially_posted` | `awaiting_approval`), the enqueued receipt/acknowledgment outbox references, and — for an escape-valve commit — the linked follow-on draft id plus the frozen conservation ledger `{committed, pending_async, carried, frozen_expected}`.

**Contract invariants (test-enforced):**

- Exactly one call-site in the codebase writes `contribution_postings` (the commit service).
- No `sendEmail` originates in the batch/commit module — receipts and acknowledgments leave only via the outbox worker.
- `commitBatch` never mutates a posted row in place — post-commit change is a compensating correction through the AL-261 spine (specified in the corrections section).
- A stale `revisionToken` yields a `STALE_REVISION` error and no write.
- The conservation invariant holds after every escape-valve commit.

### Repo anchors (for the implementing agent — evidence, not build instructions)

**REAL (exists today):**

- `packages/api/src/donate/saga.ts` — the durable outbox + saga the commit service reuses for receipt/acknowledgment eligibility facts; `stripe_raw_events` replay is the settlement-webhook backstop.
- `packages/api/src/schemas/contributions-offline.ts` — the salvageable offline-gift zod schema (tender methods + `batchId` + `referenceNumber`) feeding the row editor.
- `packages/api/src/admin/contributions/offline-dependencies.ts` — the `OfflineEntryUnboundError` 501 bridge to DELETE in slice one.
- `apps/admin/app/contributions/operation-shell.tsx` and `correction-approval-panel.tsx` — the REAL operation runner + AL-261 correction/approval UI reused for opt-in validators and post-commit amends.
- `supabase/migrations/20260611120000_contribution_correction_requests.sql` — the REAL `contribution_correction_requests` + `contribution_approval_policies` (AL-261 requester≠approver, quorum-aware) that the approval gate and governed override build on.
- `contribution_operation_batches` — the REAL sibling domain whose _generic_ infra (chunked claim, stale-running recovery, follow-up task) is reused; its records/state machine are NOT.

**FORWARD (groomed-not-built — cite owning phase/epic):**

- The Phase 13 (Contribution Ledger) `contribution_headers` / `contribution_designation_lines` / `contribution_postings` substrate + `effective_seq` + immutability trigger + `credit_recheck` outbox — owning epic Phase 13 #690 (children #691–#713 blocked); Phase 15's first build ticket lands the minimal shape.
- The `gift_entry_batches` domain, the commit service, the escape-valve/conservation tables, and the risk-routing policy rows — all NEW in Phase 15 (this PRD).

## Implementation Decisions — The Workbench & Keyboard [D3]

This section specifies the interaction architecture for entering offline gifts: the three-layer workbench, the purpose-built editable grid, the autosave write protocol that keeps client and server agreeing about money, the keyboard contract, the donor search, the reconciliation rail, and the conformance/perf/observability envelope. It is the operational heart of the **gift-entry batch** experience defined in [D1] and lifecycle-governed by [D2]/[D5]. Everything here was ratified as **hardened** — the three-layer architecture survived a 17-category adversarial fleet unanimously, and the 16 amendments plus the two gating spikes below are binding, not advisory. The founder's **don't-over-engineer** rider governs: the Cut List at the end is a binding "do not build," and the workbench ships the leanest shape that satisfies money-integrity and accessibility.

Two framing facts a builder must hold. First, **program posture is groomed-not-built**: the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) header/lines/postings ledger this workbench commits into does not exist in SQL yet, so the first implementation slices land the minimal posting substrate before the grid is useful (see Build Order). Second, **the keyboard contract and the latency budgets in this section are spike-validated-before-freeze hypotheses**: two gating spikes (and a candidate third) run as the phase's first build tickets, and their reports may amend the contract before any dependent slice starts. Where a number below is a hypothesis the spike settles, it is marked _[spike-gated]_.

### C.1 — Three layers, one draft: rail, grid, inspector

The workbench is three coordinated surfaces over **one draft store** (§C.3), never three independent widgets:

- **The reconciliation rail** — an always-visible horizontal top strip stating, variance-first, whether the batch balances: a state word plus a delta ("$5.00 under · 1 to go" / "Balanced ✓"), with expected-vs-entered count and amount as secondary detail, the navigable list of validation issues, and the save state. The rail is the **sole truthful surface** for validation and save errors (§C.7).
- **The editable grid (`GiftBatchGrid`)** — holds ONLY the common-path fields every ordinary gift needs: donor, amount, designation, gift date, and check/reference number. It is the keyboard-native hot path (§C.2, §C.5). Exception-only fields never live in the grid.
- **The non-modal row inspector** — a right-hand overlay for the exception fields that would bloat the grid: DAF attribution, tribute, matching capture, the Phase 14 (Donor Credit Operations) remittance attribution sub-grid, gift splits, and new-donor creation. It **keeps the originating row visible** (never covers the focused row) and, on close, **returns focus to the exact cell that opened it** (by row id). The inspector is also promotable to a full **row-editor mode** (all fields + Previous/Next) — this mode is the guaranteed WCAG-conformant entry path (§C.10).

This split is the answer to the market's recurring failures (documented in grooming research R3): a single monster grid that scrolls horizontally past the checks in front of the operator, versus a modal that hides the batch every time an exception appears. The rail makes the control-total reality ambient; the grid keeps the 95%-case loop tight; the inspector handles the long tail without losing the operator's place.

**Desktop / tablet-landscape first.** The entry grid is designed and acceptance-tested at 1280×720 with all five common-path columns visible and no horizontal scroll. Phones are scoped to the batch **list, status, review, and approve** surfaces — deliberately NOT the entry grid. **Quick entry** (the [D1] batch-of-one experience) is a form and may incidentally work on a phone, but the v1 acceptance matrix does not test-gate phone entry.

### C.2 — `GiftBatchGrid`: purpose-built, seeded not extended

The grid is a first-party component, `GiftBatchGrid`, **seeded from the dormant editable-grid component but re-founded, not extended**. The seed contributes _parts_ — its cell-type registry, its TSV-clipboard paste UX, and its visual chrome — and nothing more. Its state model, cell-edit model, and ARIA markup are specified fresh below because the seed's are load-bearing-wrong for a money grid. The grid is explicitly **NOT** the read-only responsive data-table used elsewhere in the admin app; that component is display-only and cannot carry the APG editable-grid contract.

The seed's three fatal properties and their replacements — each is a binding invariant:

- **Row-UUID keyed state, never array index.** Every anchor — focus, selection, undo, validation annotation, autosave identity — is keyed by a **client-generated per-row UUID** (`client_row_id`), never by array position. The seed keys selection and undo by index with sort/filter enabled by default, so sorting then deleting "row 3" destroys a _different_ gift than the operator sees. Sort, filter, and global-search are therefore **removed** from the grid on promotion (a gift-entry batch is a stack of physical checks in hand order, not a queryable dataset). The `file` cell type and all dead configuration are deleted.
- **Draft-buffer editing with real Escape.** A cell edit buffers locally and commits on Enter / Tab / blur; **Escape restores the pre-edit value** (APG-required). The seed commits on every keystroke, which makes Escape unable to cancel and pushes undo depth to ~20 keystrokes for one field. Undo/redo units are whole committed cell edits or whole pastes.
- **Command-based undo replayed through autosave.** Undo/redo are inverse patches `{rowId, field, before, after}` replayed _through_ the autosave pipeline as material edits — so an undo invalidates validation per [D2] and is never a silent local rewind past a server-confirmed save. Undo is session-scoped.
- **Integer-cents money parser — reject, never coerce.** Money fields are integer minor units. The parser accepts `1,234.56`, `$50`, and bare numbers; a value it cannot parse goes to a **visible per-cell error state**. `parseFloat(x) || 0` is banned: it silently turns `$1,234.56` into `1` and typos into `$0.00`, corrupting the control total before any gate runs. The rail sums cents; the server-side schema gate re-validates every autosaved money value.

**Layering:** the shared UI package owns keyboard/focus/edit _mechanics_; the admin app owns the _domain_ editors, the rail, and the inspector. Date cells are timezone-safe (no `new Date(string)` parsing that shifts a gift across a day boundary). The component is declared first-party owned — the Phase 14 remittance sub-grid ships _inside this component family_, not as a separately extracted library (see Cut List).

### C.3 — One DraftStore + the autosave write protocol

D3's original text promised "focus stable under autosave" but ratified no autosave _protocol_ — the single largest threat the fleet found, because without one the client and server silently disagree about a money batch and [D2]'s revision-bound validation then approves content the operator never saw. The ratified protocol:

- **One DraftStore owns rows plus a monotonic revision token.** Grid, rail, and inspector are _views_ of this store; there is no second source of truth. Any material edit bumps the revision, which invalidates a prior validation/approval per [D2] (validation accepts only its bound revision; commit accepts only the approved revision).
- **Autosave is row-commit-granular and idempotent.** Each save is an UPSERT keyed by `UNIQUE(tenant_id, batch_id, client_row_id)` carrying a per-row edit sequence. There is **at most one in-flight save per row**; a stale retry (lower sequence than the server has seen) is **rejected**, not applied — so an out-of-order retry can never mint a duplicate row or resurrect an overwritten value. Server responses **merge by row id and never wholesale-replace** the grid; whole-batch-blob saves are prohibited.
- **The [D2] revision bump happens inside the same write** that persists the edit — validation state and persisted content can never diverge.
- **Validation issues cross the API as revision-stamped structured records** `{draftRowId, field, code, message, severity}`; a stale annotation (older revision than the row's current one) is dropped rather than shown against edited content.
- **The audit grain is the saved revision**: each stamps actor plus a changed-field diff. There is **no keystroke logging**.
- **Receipts are NEVER written in the commit transaction.** Per [D5], receipt sending rides the existing donation-saga outbox in the post transaction and drains asynchronously; the workbench never calls a send-email path inline. This is repeated here because the autosave/commit path is where an implementer would be tempted to inline it.

The autosave cadence, crash/disconnect recovery, lease reacquisition, and revision reconciliation are the subject of a **candidate third gating spike** (§C.13) — the protocol above is the contract the spike hardens, not softens.

### C.4 — Single-active-editor lease + revision backstop

Concurrency is handled by a **batch-level short-TTL heartbeat lease** (`claimed_by`) with a loud, audited takeover — not a presence/CRDT/realtime system (explicitly cut). A second person opening the batch gets **read-only + "Take over"**; a stale-revision write is rejected with a plain-language conflict banner and the affected rows flip read-only until refresh. The lease _prevents_ the clobber class; the revision-rejection backstop _catches_ anything the lease misses. Batches are **tenant-visible** to finance managers (status, age, creator) with an **audited reassign** action, so a stuck draft always has an owner and can be recovered. The realistic tenant has 1–3 entry operators; this is one column plus a heartbeat, not infrastructure.

### C.5 — The keyboard contract as a versioned, executable artifact

The keyboard behavior is the difference between "amazing UX" and staff retreating to spreadsheets, so it is specified as a **versioned contract document plus a parameterized Playwright/axe suite** that is the compliance oracle — not prose. The same contract governs three surfaces (this grid, the Phase 14 remittance sub-grid, and the future Phase 30 (Imports & Migration Tools) paste surface), so it is versioned and its suite asserts preconditions rather than silently skipping (jsdom cannot exercise real focus/roving-tabindex, so the oracle is a real-browser suite).

The contract (ARIA APG grid pattern):

- **Single tab stop / roving tabindex.** The grid is one tab stop; arrow keys move cell focus; Home/End, Ctrl+Home/End, PageUp/PageDown navigate. The **focused row stays mounted** under virtualization (§C.11), and navigation state is id-keyed so a virtualized-out node never strands focus on `document.body`.
- **Edit entry/exit.** Typing a character starts edit; **F2** starts edit; **Escape** reverts to the pre-edit value and returns to navigation; **Tab** commits and moves to the next editable cell.
- **Enter = commit + move down, with Excel-style column snap-back** _[spike-gated]_. Enter on the last row appends a new row (the serial-entry loop). This is the tested default hypothesis — every dedicated serial-entry product (Excel, Handsontable default, Virtuous Quick Key) moves down, and the core loop is keying a physical check stack — but the keyboard-contract spike (§C.13) may falsify it before freeze. There is **no preferences toggle** at v1: one default, no split muscle-memory across an org's staff.
- **Fill-down (Ctrl+D)** copies the cell above; a **"?" overlay** lists shortcuts; the F-key opens the inspector and returns focus to the originating cell by row id.
- **IME-safe.** Every keydown action ignores composition (`isComposing` / keyCode 229) so a CJK donor name entered via an IME is not truncated or mis-committed. A single delegated keydown listener owns navigation; per-cell listeners are avoided.
- **Two-mode focus modality.** In _navigation_ mode the grid owns keys; in _edit_ mode the active Base UI / Command (cmdk) editor owns keys, with a defined Escape ladder and **mandatory focus return** to the anchoring cell via an imperative `focusCell(rowId, columnId)`. Base UI is pinned to an exact version; upgrades are gated by the contract suite. (The repo's primitive layer is Base UI with a `render` prop, NOT Radix — the modality rule is written against Base UI's focus manager.)
- **Keystroke budget: an ordinary check row is completable in ≤20 keystrokes end-to-end, zero mouse** _[spike-gated]_.

### C.6 — One resolver-backed donor search + DB-settled dedupe

The donor picker is the product's **first staff party-search** and must not become either a Phase 10 (Sensitive Data Safety) invisibility breach or a duplicate-donor factory (the market's #1 batch complaint). One shared search endpoint serves the picker, the CSV-paste matcher, and the new-donor duplicate check, and it runs **through the Phase 3 (Minimum Permission & Role-Scoped Projection) / Phase 10 subtract-only resolver chokepoint** — restricted parties never appear and **never change the response shape** (no timing or count tell). Deliverables:

- A tenant-scoped **pg_trgm / FTS index** (none exists today), sized against realistic party volumes.
- **≤300 ms** end-to-end keystroke→suggestions _[spike-gated]_ (the donor-typeahead spike, §C.13, proves this through the resolver path — a bespoke "fast query" that bypasses the resolver is forbidden).
- **Read-your-writes inline create**: a donor created inline is matchable in the very next row with no cache layer (the RE NXT "5–10 minute lag before new constituents matchable" pain, made impossible by construction).
- Option rows show name / locality / email / last-gift / id / person-org badge, with **"Create new '⟨name⟩'" always last**.
- **DB-settled dedupe**: a partial unique index `(tenant_id, normalized_email)` plus insert-on-conflict-return-existing; one in-batch pending-new-donor entity may be referenced by many rows; an email-less create is flagged dupe-suspect at validate (never auto-merged).

### C.7 — The reconciliation rail contract

- **Variance-first primary element**: state word + delta ("$5.00 under · 1 to go" / "Balanced ✓"); expected and entered totals are secondary.
- **Save state is exactly three states** — Saved / Saving… / "N rows not saved" — quiet in the happy path, loud on failure. **Commit is blocked while any unsaved or save-failed row exists.** Session expiry re-authenticates in place without discarding entry state.
- **The rail is the sole surface for validation and save errors.** Each validation issue is a navigable GOV.UK-style error-summary entry — row number + field + plain-language message + fix hint — that focuses the offending cell. This is the sole error surface; Sonner toasts are restricted to action-free confirmations so they can never silently contradict the rail.
- Client-derived tallies and server-derived statuses are **labeled distinctly** (the operator always knows which number the server has blessed). Amounts render with `tabular-nums`. The theme gains `success` / `warning` semantic tokens (the repo has none today — contribution UI uses ad-hoc emerald/amber).

### C.8 — Paste hygiene, PAN gate, hardened export

Paste carries money, card numbers, and spreadsheet formulas, and is the single worst footgun found:

- **All grid paste is a staged preview** (the Phase 14 posture): CRLF-normalized, quoted-TSV-parsed, **reject-don't-coerce** on amounts, overflow rows appended with an explicit count confirmation, the whole paste one undoable command. No silent amount mangling, no silently dropped overflow rows.
- **Server-side, fail-closed PAN gate**: any free-text field is scanned for Luhn-valid 13–19-digit runs and **rejected** (never silently redacted) with plain-language guidance toward the **native embedded Stripe phone lane** [D4] — a card number keyed into a check-reference cell would otherwise drag the database into PCI scope.
- **One hardened export serializer**: all contribution CSV/TSV exports flow through a single serializer that neutralizes formula-leading characters per OWASP, so an `=`-prefixed cell cannot detonate in an approver's spreadsheet. **Stored data is never mangled** — neutralization happens only at export.

### C.9 — Lifecycle-gated mutations, provenance, honest quick entry

- **No bare-Delete row destroy.** Row delete is permitted only on an _uncommitted_ revision, is enumerated as a material edit (bumps revision, invalidates validation/approval), is soft-marked in the rail, and is recoverable via draft revisions. Post-commit removal is a Phase 13 **compensating correction** (the append-only ledger + the AL-261 correction path), never an in-place delete — consistent with the **escape valve** [D5] and the immutability of posted rows.
- **Defaults stamp at row creation** (NPSP semantics: "applies to new rows only"); a later bulk re-apply is explicit and revision-invalidating. Typed vs default-supplied vs copied values are **visually and programmatically distinct** (this is the [D7] `batch template` **config-frozen / safety-live** surface expressed in the grid — a template supplies defaults, never overrides an invariant).
- **Expected totals are enterable any time before commit** (a calm nudge, not a creation gate). "New batch" opens with one empty row, focus in the donor cell.
- **Honest quick entry**: the batch-of-one path shows a one-sentence outcome — "Recorded — awaiting review" or "Recorded and posted" — and, per the **Send-acknowledgments gate** [NF3], surfaces a checked-by-default, one-tap-reversible "Also send the thank-you to ⟨advisor⟩" line inside [D5]'s single post-commit confirm rather than silently auto-sending or silently suppressing a deliberate single tribute/DAF acknowledgment.
- **Approval-policy reachability lint**: a policy write is validated for satisfiability (≥1 eligible approver per rule, quorum achievable, requester-exclusion survivable) at save time and re-checked at batch submission, with plain-language "who is missing" messaging; an unsatisfiable policy cannot be saved, so a batch can never dead-end against an approval rule no one can satisfy.

### C.10 — Layout and conformance; the row-editor is the guaranteed path

- Rail = horizontal top strip; inspector = right overlay that **never covers the focused row**.
- Acceptance: all five common-path columns visible, no horizontal scroll, fully operable at **1280×720**; the focused cell is **never obscured by sticky chrome** (scroll-margin under sticky headers — WCAG 2.4.11 Focus Not Obscured); **24 px** targets (44 px touch); operable at **200% zoom**; rail and inspector reflow at 400%; reduced motion honored; **one** polite live region.
- **The inspector's row-editor mode is the guaranteed-conformant entry path.** Betting sole WCAG conformance on a first-party virtualized editable grid is a low-probability plan (even mature commercial grids tell customers to disable virtualization for screen readers). The row-editor mode — all fields, Previous/Next — is the tested path for screen-reader, 400%-zoom, and touch-only-tablet users, with **"a full batch is completable in row-editor mode under NVDA and VoiceOver" as an acceptance gate**. Tablet + hardware keyboard gets the full grid contract; phone review/approve shows variance, a navigable issue list, override reason + identity, and read-only row drill-in sufficient to approve without a laptop.

### C.11 — Perf envelope + threshold-gated virtualization

Real batches are **15–250 rows** (a gift-entry batch is roughly one deposit's worth of checks), so the design points and budgets are pinned and CI-measured, not assumed:

- Design points: p50 15–40 rows, p95 ~250, ceiling 500, plus a 1,000-row graceful-degradation fixture.
- Budgets _[spike-gated / fixture-measured]_: nav keystroke→focus-paint ≤50 ms p95; cell commit ≤100 ms; client validate ≤500 ms @500 rows; server validate ≤2 s; commit ≤5 s. Measured by a CI harness on 25 / 100 / 500-row fixtures under CPU throttle.
- **Virtualization is threshold-gated at ~200 rows** _[fixture-tunable]_ — disabled below it, so **quick entry and typical batches run as plain DOM**, deleting the riskiest a11y bug class (virtualized focus loss) from the daily path. Keep-focused-row-mounted is required and tested only above the threshold.
- Server validation is **one set-based pass** (constant query count, never N+1); commit is **one server-side transaction** with an explicit timeout. A chunked-but-atomic-per-commit fallback is built only if the **commit spike** (a PRD-author-pinned early ticket) proves the 500-row transaction exceeds 5 s, and it must mitigate posting-sequence contention against the Phase 13 monotonic posting seq.
- The underlying table library is either dropped from the entry grid or **quarantined to one directory with no type re-exports** (the spike decides drop-vs-keep; the quarantine binds either way, making a future major-version bump a non-event).

### C.12 — Observability + failure posture + retention

A silently-failed autosave is one lost batch, and one lost batch per tenant is how the **one front door** [D1] dies in practice.

- **PII-free telemetry** (per the Phase 8 observability posture): autosave outcome / latency / failure-class; a **focus-loss-to-body counter** (the canary for the keyboard contract regressing); a validation-failure taxonomy by rule id (makes [D2]'s "too frustrating" rider _falsifiable_); an entry-pace histogram; inspector-open rate by exception type; override rate; paste/undo usage; workbench-tagged INP. No keystroke logging, no bespoke analytics vendor.
- **Four Phase 8 data-health signals** registered: stale draft, validated-never-approved, approved-never-committed, open control-total mismatch. (The **Send-acknowledgments gate** [NF3] adds the 7th program-wide Phase 8 data-health signal (the fifth surfaced from Phase 15 surfaces), the "acknowledgments pending" signal owned by that section.)
- **Error boundaries**: a route-segment boundary + a grid-scoped boundary (the admin app has none today) whose fallback **preserves batch identity, last-save time, and unsaved-row count** — a crash never silently discards entered checks.
- **Draft retention**: a stale nudge + audited abandon/archive; a TTL purge (default ~90 days) fires **only after a surfaced warning** and **archives to the audit trail** (PII pruned, lifecycle facts kept) — **never a silent hard delete** (a draft can be the only record of a physical check). Draft tables are named in the Phase 10 export-governance inventory.

### C.13 — Gating spikes: the first build tickets

Two spikes **gate the PRD freeze**; a third is a strong candidate. They are the phase's **first build tickets**, not a research aside — the keyboard contract is the artifact three surfaces depend on, and freezing budgets nobody measured would fossilize guesses.

1. **Keyboard-contract spike** (1–2 weeks, throwaway-allowed): a skeletal grid — row-UUID state, draft-buffer cells, roving tabindex, delegated keydown, plain DOM, a donor-picker stub, one Base UI popup editor — driven by **real operators keying a 25-check fixture stack**. It settles, with data: (a) the Enter default (move-down-with-snap-back vs commit-stay), (b) the ≤20-keystroke budget's attainability, (c) the two-mode focus-modality rule against a real Base UI / cmdk editor, (d) IME entry of a CJK donor name. **The contract and the keystroke/latency budgets freeze only after this reports.** The Playwright/axe contract suite _is_ this spike's harness — never written after the fact.
2. **Donor-typeahead spike** (parallel, days): the pg_trgm/FTS index against realistic party volumes **through the Phase 10 resolver path**, proving ≤300 ms e2e and read-your-writes for inline creates. If the resolver-mediated path can't hit budget, that must be known **before** the PRD promises it — the tempting bespoke-fast-query fallback is exactly the Phase 10 breach §C.6 forbids.
3. **Autosave/recovery spike** (candidate third): the §C.3 protocol's cadence + crash/disconnect recovery + lease reacquisition + revision reconciliation, proven against tab-close, network-drop, and session-expiry.

### Build Order (workbench slices)

The two spikes run first. Then, in order: **(a)** the Phase 13 minimal posting substrate (headers / designation_lines / postings + effective_seq + immutability trigger + `credit_recheck` outbox) — the [D5] build-order blocker, since a post-commit amend rides the append-only ledger; **(b)** the schema/tenant invariants (§C.9 note below) and door-deletion (§ Cut List item 8) — cheap, and everything downstream assumes them; **(c)** the DraftStore + autosave protocol (§C.3, §C.4); **(d)** the grid re-founding on the spike-validated contract (§C.2, §C.5); **(e)** paste / PAN / export hardening (§C.8); **(f)** rail + inspector/row-editor (§C.7, §C.10); **(g)** lifecycle / provenance / policy lint (§C.9); **(h)** the perf harness + telemetry wired **as the acceptance gate** (§C.11, §C.12).

**Tenant & capability invariants (build slice b), stated once:** the draft-side tables (`gift_entry_batches`, `gift_entry_batch_rows`, and every draft table) inherit the Phase 13 posture — `tenant_id NOT NULL` with no default, parents `UNIQUE(id, tenant_id)`, all references (donor, fund, missionary, employer, tribute, commitment) via composite `(tenant_id, ref_id)` FKs, FORCE RLS, and a cross-tenant poison fixture. The capability map is pinned per lifecycle verb: draft/autosave = `finance:record_contribution` (NOT the legacy blanket `manage_contributions` grant, which collapses entry/approve/override into one and guts [D2] separation of duties); approve = the AL-261 policy capability; **control-total governed override** = its own distinct capability; commit re-checks every precondition server-side. Drafts write only to staging, shaped as proto Phase 13 headers + designation lines so commit is a _promotion_, not a remap.

### Repo anchors (evidence as of authoring — not build instructions)

These are cited as evidence, never as brittle build steps. **REAL** = exists on disk today; **FORWARD** = groomed-not-built, owned by the cited phase.

- **REAL — the dormant editable-grid seed** `packages/ui/components/shadcn/data-grid/` (4 files: grid, cell, index, types): typed editable cells, row add/delete, TSV clipboard copy/paste, undo/redo, `role="grid"`. **Zero production usages; no arrow-key cell navigation; every cell `tabIndex=0` (no roving tabindex); index-keyed selection/undo; per-keystroke commit.** A parts inventory for `GiftBatchGrid` (§C.2), not an architecture.
- **REAL — the read-only responsive data-table** `packages/ui/components/shadcn/data-table/` (`DataTableResponsive` + `useDataTableKeyboard` row-oriented roving focus + `useDataTableVirtualization` on TanStack Virtual). Display-only; explicitly **not** the entry grid. `useDataTableKeyboard` is the only roving-focus prior art in the repo.
- **REAL — the contributions hub** `apps/admin/app/contributions/` (main-body + `contribution-detail-sheet.tsx` + `operation-shell.tsx` operation runner + `correction-approval-panel.tsx`), and the single-gift precedent `offline-gift/offline-gift-entry-dialog.tsx` (one-record-per-dialog "Enter another" loop — the write path this workbench **retires**, per [D1.c] and Cut List item 8).
- **REAL — the offline-entry parts** the [D1.b] parts inventory salvages: the offline-gift zod schema (`known` vs `unknown_offline`; methods; already carries `batchId` + reference fields) and its receipt-status logic. The 501 dependency stub (`OfflineEntryUnboundError`) and its legacy-`donations` persistence plan are the temporary bridge that is **never wired** — deleted in slice one.
- **REAL — the durable seams** the commit path reuses: the donation saga + outbox RPC, `stripe_raw_events`, `resolveDonorMatch` (donor-matching, the resolver §C.6 binds to), the message-type-aware fail-closed consent gate (`packages/api/src/email/consent.ts`), the `contribution_operation_batches` infra (chunked claim, stale-running recovery, follow-up task — reused as generic infra, never as the domain machine per [D1.a]), and `crm_table_preferences` (the personal column-preference layer). The primitive layer is **Base UI** (`render` prop) + Command (cmdk), NOT Radix; TanStack Table v8 / Query v5 / Virtual v3.
- **FORWARD — the Phase 13 ledger** (`contribution_headers` / `contribution_designation_lines` / `contribution_postings` + `effective_seq` + immutability trigger): **zero SQL today**, owned by Phase 13 (epic #690, not built). The workbench's first build slice lands the minimal substrate.
- **FORWARD — the Phase 14 credit machinery** (`contribution_credits`, acknowledgment streams) the inspector's DAF/tribute/matching/remittance cells capture _into_: owned by Phase 14 (epic #719). The grid captures _input_ that generates credit rows; it never writes credit rows directly.
- **FORWARD — the P15 tables themselves** (`gift_entry_batches`, `gift_entry_batch_rows`, draft/lease/deposit tables): net-new, this phase.

### Cut List — binding "do not build" (v1)

Rejected for v1 under the don't-over-engineer rider. These do **not** enter the build:

1. **Client-side draft persistence** (localStorage / IndexedDB). Server-side drafts + the money-never-offline-writable posture make it dead machinery.
2. **Realtime presence, CRDTs, co-editing, per-row locks, websocket/queue autosave infrastructure.** The lease + revision checks (§C.4) cover the whole class for a 1–3-operator tenant. Cut with prejudice.
3. **A keyboard-preferences surface / "spreadsheet mode" toggle.** One default validated by the spike; a toggle splits muscle memory across an org's staff.
4. **A resizable inspector panel.** Fixed-width open/close only.
5. **A speculative chunked-claim commit state machine.** One Postgres transaction handles the ceiling; the chunked fallback is built only if the commit spike proves >5 s.
6. **A generic shared editable-grid library.** `GiftBatchGrid` is purpose-specific; the Phase 14 remittance sub-grid ships inside this component family; generalize only when a second real consumer exists.
7. **Always-on virtualization** (and keep-focused-row-mounted machinery for every batch). Threshold-gated at ~200 rows.
8. **Kill door #2 (no runtime flag).** Delete the legacy offline route, dialog write path, and 501 stubs in slice one (fresh-build posture, no deprecation ceremony); add a guard test that **no API path other than the batch commit service writes offline money**; `contribution-batches/[batchId]/process` never grows a create action. The workbench route ships only when draft→commit passes the E2E gate — absence of the old door is the flag, not a feature-flag system.
9. **A bespoke metrics pipeline / product-analytics vendor.** Sentry + the Phase 8 data-health catalog + the existing web-vitals beacon (extended with a surface dimension) cover the entire telemetry contract.
10. **Phone quick-entry as a gated v1 surface.** Phone scope is list/status/review/approve; quick entry is a form that may incidentally work on a phone but is not test-gated there.

## S5. Implementation Decisions — Tenders & Phone Payments (D4)

Decision D4 ratified **Path C**: every tender the mission-CRM sees gets a _first-class home_ in v1 — the core four money tenders (check, cash, offline ACH, wire), church remittance, securities with a full liquidation lifecycle, in-kind, phone card/ACH gifts, and the long-tail noncash types (crypto, vehicle, real estate). A 17-category adversarial fleet hardened this into amendments **A1–A18**: first-class means _correct fact capture with a compliant home_, not a bespoke engine per asset. Exactly one thing the founder may have pictured is forbidden — a card field Asym's own code can read — replaced by a Stripe-hosted iframe delivering the same operator experience.

Four laws bind this section and cannot be softened by any requirement below:

1. **PCI hard stop.** Asym never renders a raw PAN/CVC/bank-account `<input>` its own JavaScript can read, and never stores, logs, proxies, or processes raw card or bank-account numbers. A **Stripe-hosted iframe keyed by staff** (Payment Element / embedded Checkout / Financial Connections) is explicitly permitted — the value goes browser→Stripe, never touches Asym, merchant stays at **SAQ A**. (This reverses the tender-fleet over-rotation "even an embedded Element is forbidden," which conflated an Asym-readable input (SAQ D, prohibited) with a Stripe iframe (SAQ A, allowed).)
2. **Stripe webhook = sole money-final writer for online gifts.** A phone card/ACH gift is an _online_ gift the webhook writes; it is never also posted as an offline batch money row (no double-count).
3. **P13 `gift_method` is the single tender vocabulary.** P15 never posts a method the P13 ledger does not define.
4. **Describe-never-value.** No receipt, acknowledgment, export, or posting path may ever emit an org-attested dollar value for donated property. Valuation is the donor's duty (Form 8283); the org never attests.

The don't-over-engineer rider governs throughout: v1 captures facts, reconciles nothing, stores no files, builds no per-asset engine. The cut list in S5.11 is binding.

### 5.1 Tender vocabulary — one closed set, a discriminated union, a conformance descriptor [A1]

P15's tender set is a **subset/exact-match** of P13's `gift_method` enum (TEXT + CHECK). Before P15 posts anything, a **ratified P13 amendment** reconciles the drift that already exists in committed offline-schema code and adds the missing member:

- rename **`stock` → `securities`** and **`manual_ach` → `ach`** (the committed offline zod enum still says `stock`/`manual_ach`);
- add **`wire`** (a named core-four money tender, absent from the current offline enum);
- reserve **`crypto`**, **`vehicle`**, **`real_estate`** as additive-only, **row-creation-gated** values (present in the enum so a posting can carry them, but a workbench row of that type is gated behind the generic noncash shape — never silently written as `in_kind`).

The v1 tender roster and its rail:

| `gift_method`                        | class             | `settlement_rail` (5.2)        | control total (5.7)        | notes                                                               |
| ------------------------------------ | ----------------- | ------------------------------ | -------------------------- | ------------------------------------------------------------------- |
| `check`                              | money             | bank-direct                    | cash deposit total         | check_number first-class; postmark optional (D5 Mod4)               |
| `cash`                               | money             | bank-direct                    | cash deposit total         | received = today default; cash → high-risk review (D5)              |
| `ach`                                | money             | bank-direct **or** stripe-rail | rail-dependent             | rail decides deposit-eligibility, not the method                    |
| `wire`                               | money             | bank-direct (`direct_credit`)  | cash deposit total         | `no_slip` — P20 bank-reconciled, no P15 deposit slip                |
| `church_remittance`                  | money             | bank-direct                    | cash deposit total         | P14 remittance sub-grid; NSF → credit cascade (A11)                 |
| `securities`                         | noncash-lifecycle | n/a                            | non-money tally            | FMV at gift date; proceeds are non-contribution facts (5.5)         |
| `in_kind`                            | noncash           | n/a                            | non-money tally            | `recognized_value = 0`; value walled from receipt                   |
| `card` (phone)                       | online            | stripe-rail                    | **never** in offline total | Stripe-webhook-written; `moto` is a channel attribute, not a method |
| `ach` (phone)                        | online            | stripe-rail                    | **never** in offline total | Financial Connections WEB mandate; async settlement                 |
| `crypto` / `vehicle` / `real_estate` | noncash-reserved  | n/a                            | non-money tally            | generic noncash shape + duty flag; no engine v1                     |

**`moto` is not a `gift_method`.** A phone card gift is `card`; MOTO is a _capture-channel attribute_ expressed as a server-confirm flag (5.8.3), never an enum value.

Tenders are modeled as a **discriminated union** over this closed set plus a **declarative per-tender conformance descriptor** — a static struct, not a runtime plugin/registry — that states, for each tender: its required fields, its date-resolver binding, its money-column mapping, its receipt-posture flag, its `settlement_rail`, and its follow-up-worklist owner. The D3 row editor and the D2/D5 validator both **read** the descriptor; no dynamic form-schema engine, no tender plugin abstraction (cut list).

### 5.2 The `settlement_rail` discriminator [CB-A — amends A1, unblocks D6]

Deposit-eligibility (D6) cannot key on `gift_method`, because **`ach` spans two settlement realities**: a bank-direct ACH the tenant's bank collects (depositable, appears on a bank deposit) versus a Stripe-rail ACH that settles in a Stripe **payout** (reconciled via the payout, never a manual deposit). Keying deposit-eligibility on the method would let a Stripe-settled gift into a manual deposit group and **double-count it against the payout** — a money-integrity blocker (D6 F1).

Resolution: a **`settlement_rail`** discriminator on every tender, values `bank_direct | stripe_rail`:

- **bank-direct** (`check`, `cash`, bank-direct `ach`, `wire`) → **depositable**; may attach to a D6 deposit group.
- **stripe-rail** (phone `card`, phone `ach`, and any future Stripe-settled tender) → **`settles_via_payout`**; the DB **rejects any deposit-group link** on a stripe-rail gift (D6 HD-5 hard invariant). These gifts reconcile through Stripe payouts, which P20 owns.
- **wire / direct-credit** carries a `direct_credit` / `no_slip` deposit state — it is bank-reconciled by P20 with no P15 deposit slip.

The rail is captured at entry from the tender descriptor and is **frozen with the posting**; it is the single predicate D6's deposit-eligibility check and D7's "cannot make a Stripe gift depositable" template guardrail both read.

### 5.3 Money columns, ONE noncash extension, and append-only facts [A2]

**Never a single polymorphic `amount` column.** The posting money is a distinct, purpose-named column **`recognized_value`** (= FMV for securities, **= $0 for in-kind**, = the tendered amount for money tenders). A separate internal-only management-valuation field (the donor's stated value or the org's book estimate) exists for operations but is **structurally unreachable** by any receipt, acknowledgment, export, or posting path.

All noncash tenders share **ONE** generic extension — `noncash_gift_details` — not five lanes, not seven tables. It carries: asset type, description, units/quantity, transfer/received date, `recognized_value` with provenance `{value_source, entered_by, as_of_date}` and a `value_basis` label, the internal management valuation, a nullable `document_ref` (P29 resolves the bytes; P15 stores no files), and per-asset compliance/duty flags. Securities, in-kind, crypto, vehicle, and real estate are **instances of this one shape distinguished by tender type + flags.**

Liquidation/disposition outcomes live in an **append-only `gift_disposition_facts`** table (mirrors P13 posting immutability / ADR-CD-004): each row is typed `non_contribution` and is **CI-gated out of every money aggregate**, exactly as Phase 14 (Donor Credit Operations) gates soft credits — a test asserts no disposition row can ever emit a posting. P20 reads these facts; P15 migrates nothing.

Every new P15 table is **tenant-scoped with deny-by-default RLS from migration one** — an acceptance test fails on any table lacking `tenant_id` or a policy. Composite `(tenant_id, …)` FKs throughout.

### 5.4 Describe-never-value is a schema invariant enforced across every write channel [A3]

In-kind posts `recognized_value = 0`. The internal valuation field is labeled non-org-attested and is **unreachable by the receipt/acknowledgment/export/posting paths** (extends the P7 value-wall to in-kind and to every appraised/proceeds/FMV field). The receipt describes the property and states **no dollar value.**

Enforcement is **not a warning** — it is a validation invariant the D2 non-mutating engine applies identically across **grid entry, CSV paste, API, and import**: a non-null value in a receiptable or posting column on a noncash row **blocks commit regardless of channel.** CSV paste maps a spreadsheet "amount" column to the internal field, never to `recognized_value`. A value ≥ $5k surfaces an **informational** appraisal/8283 hint (the donor's duty) — never a block.

### 5.5 Securities = ONE gift with a lifecycle; proceeds are non-contribution facts [A4] + disposition-duty clock [A10]

A securities gift is **one contribution with a lifecycle**, never two gifts:

- **Contribution / recognized value = FMV at the gift (transfer/received) date**, provenance-stamped from the broker statement into a single `recognized_value` field plus a `value_basis` label. **No per-method valuation calculator** (no high/low-mean, NAV, or bid-ask engine — cut list); the operator enters the broker-stated FMV.
- **`gift_date` and `sale_date` are structurally distinct columns.** The gift is dated by transfer/receipt; liquidation happens later.
- **Liquidation proceeds** (`sale_date`, gross, fees, net) are append-only `gift_disposition_facts` rows, `non_contribution`, CI-gated out of every money aggregate. The "record liquidation" surface is reachable **only from an existing securities gift**, never from "new gift"; the workbench soft-blocks a cash row that duplicates an open securities gift's expected proceeds.
- P15 does **no** gain/loss math, deposit matching, or GL posting — P20 reads the facts.

A securities gift finalizes on its receipt facts and carries `liquidation_status ∈ {not_applicable, pending, partial, settled}` plus an aging model (`open → resolved / abandoned / written_off`), updatable after batch-finalize **without reopening the batch** (A5). Proceeds/transfer-confirmation/valuation-true-up/evidence are worked in **one detached follow-up worklist that reuses the Mission Control follow-up-task infra** (D1.a-permitted) — not a reopened batch, not a new system; each item has an explicit finance owner-role + SLA.

**Form 8282 disposition-duty clock [A10] ships WITH proceeds, as one unit.** From `received_date` + `sale/disposition_date`, derive an append-only "disposed within 3 years" flag for >$5k non-publicly-traded property (in-kind, crypto, vehicle, RE) and raise an MC follow-up task ("may require Form 8282 within 125 days; notify donor"); publicly-traded securities are excluded by rule. v1 **flags** the duty (does not generate the form). Proceeds-tracking without its disposition clock is a blocker, not a follow-up.

### 5.6 Long-tail noncash: crypto, vehicle, real estate — one shape, reserved types, duty flags, no engines [A9]

Crypto, vehicles, and real estate are enterable in v1 **through the single `noncash_gift_details` shape**, recorded under their own reserved `gift_method` (never silently `in_kind`), each carrying a per-asset duty flag that raises a signal:

- **vehicle** → Form 1098-C duty (>$500);
- **crypto** → property (not publicly-traded, not 8282-exempt), qualified-appraisal >$5k, **never reclassified as cash** even if a processor auto-liquidated;
- **real estate** → qualified-appraisal, routed to manual/major-gift handling (existence + description + appraisal-reference only).

v1 builds **no** 1098-C generation, **no** crypto custody/liquidation/processor integration, **no** AML/OFAC pipeline, **no** real-estate close modeling, **no** broker/DTC feed — all manual capture of externally-sourced facts. Named fast-follows only on real demand.

### 5.7 The control-total rail separates money vs non-money tenders [A6]

Only **money tenders** (check, cash, bank-direct ACH, wire, and settled cards — via their own reconciliation) contribute to the **cash deposit control total** the D2 tie-out balances. In-kind, un-liquidated securities, and the other noncash types appear as a **separate item/count tally with no dollar reconciliation.** A mixed batch (three checks + one stock gift + one in-kind box of goods) stays balanceable: the cash total reconciles the checks; the noncash items are tallied, not summed into the deposit. Phone card/ACH gifts (stripe-rail) **never enter the offline control total** at all (5.8.8).

### 5.8 Native phone payments — the Stripe deep dive

The founder's binding acceptance standard: staff take a full card **or** ACH donation over the phone through an experience that feels **native to Asym** — start from the donor/batch workbench, donor/amount/designation pre-populated, pick card or ACH, a secure Stripe-controlled surface appears in the natural flow, staff complete it while staying oriented in Asym, and status/confirmation/gift-creation/receipt-eligibility/audit update automatically with **zero duplicate entry, no copied charge id, no after-the-fact search, no manual record-linking.** "Out to Stripe" (new tab / Dashboard / generic link) is acceptable only as a designed **fallback**, never primary.

The permitted surface is a **Stripe-hosted iframe keyed by staff**: the PAN/bank number the donor reads aloud is typed into Stripe's iframe, Asym JS provably cannot read it, the number goes browser→Stripe and never transits Asym servers (**SAQ A**). The prohibited surface is a raw `<input>` Asym's code can read (SAQ D). _Who types the digits_ does not change the data path — only the transaction **category** (to MOTO).

#### 5.8.1 The full Stripe Connect substrate [P13 D1/D23 — re-affirmed, not new]

The phone lane targets the **Phase 13 (Campaign, Designation & Contribution Ledger) Stripe Connect connected-account substrate from day one.** The full switch to Stripe Connect is **already ratified in Phase 13** (D1/D1b/D23): tenant-owned **connected accounts** via Stripe-hosted onboarding (not a manual key-paste); Payment Element with `{ stripeAccount: 'acct_…' }` = SAQ A (the exact native-iframe pattern the deep dive landed on); saved Customers/PaymentMethods on the connected account (the repeat-donor seam); refunds via the `Stripe-Account` header; **0% / no `application_fee` ever** (direct charges, tenant = merchant of record); and the standing commitment to **delete the plaintext tenant Stripe key.** The specs already say Connect; the **code is the laggard** (plaintext `stripe_secret_key` / `stripe_publishable_key` columns + a `createStripeClient` with no `stripeAccount` = the groomed-not-built Phase 13 D23 gap; plaintext secret storage is also a standing security defect).

Consequence for P15, and the reason the BYO-keys caveats in the deep-dive artifacts **dissolve**: under Connect, capability detection is **programmatic** via `account.capabilities` (the workbench auto-gates card/ACH instead of probing a config flag), revocation arrives as an **`account.application.deauthorized`** webhook, and Virtual Terminal availability is queryable. (Unchanged: **MOTO enablement stays Stripe-support-gated per connected account** even under Connect — not programmable; gate + detect + degrade stands.) A **congruence edit** corrects the one stale contradicting spec — Phase 02 (Site, Locale & Currency Foundation) §A2 currently asserts "one standalone Stripe account per tenant… no Stripe Connect," now false — plus the two log-missed stale phone-posture lines in roadmap and phase-map; these fold into the P15 /to-spec congruence package (no standalone commit).

#### 5.8.2 Primary card lane — embedded Payment Element + server-confirm `moto` [A7 / A8]

**PRIMARY surface: an embedded Stripe Payment Element (card-first), mounted in the workbench, keyed by staff, initialized for the connected account.** The one deviation from the existing client-confirm donor checkout: the Asym **server confirms** the PaymentIntent carrying **`payment_method_options[card][moto] = true`**.

Flow:

1. Staff prefill donor/amount/designation and pick **Card**.
2. A Stripe-hosted Payment Element iframe paints in the workbench (preconnected `js.stripe.com`, warm `loadStripe`, deferred-intent mount for a <1–2s live-call feel). Staff key the card into Stripe's iframe. **CVC required; AVS/postal on.**
3. Client tokenizes (ConfirmationToken / `pm_…`) and hands the token id to the Asym server.
4. Server **confirms** the PI with `payment_method` + `moto = true`, one idempotency key (`${sagaKey}:payment_intent`), metadata `{ donation_id/gift_intent_id, batch_id, batch_row_id, tenant_id, user_id, gift_source: "phone" }`, reusing the existing PaymentIntent + donation-saga + `stripe_raw_events` webhook → staged-gift seam.
5. Success is gated on the **`payment_intent.succeeded` webhook** (never the confirm response), which stages the gift, fires P7 receipt eligibility, writes audit, and **auto-links via PI metadata.**

**Why `moto = true`:** it is confirmation-only and server-side; it declares the charge a telephone order and **claims the SCA/3DS exemption** — _mandatory_ to complete EEA-issued cards (the phone donor cannot do a 3DS challenge) and the correct interchange/Radar treatment for US cards. It is Stripe-**support-gated per account** (not self-serve, not a Connect capability, not programmable). **Graceful degradation:** if MOTO is not enabled, the same Element runs an ordinary card-not-present confirm — US cards generally succeed; some may hit a 3DS challenge the phone donor cannot complete (a visible, recoverable stall); EEA cards may soft-decline. MOTO is an **enhancement the design gates and detects, never a dead-end.**

**Repeat-donor fast path** (the cleanest surface, no iframe): the workbench lists saved methods ("Visa …4242"); staff pick one, confirm amount/designation, capture verbal consent, and the server creates+confirms **one** PI with `customer` + `payment_method` + `off_session: true` + `confirm: true` + `moto: true` + one idempotency key. Falls back to keying a fresh card in the Element (or emailing a secure completion link) if the issuer forces `authentication_required`.

The `card.moto` online-API flag is present in Stripe SDKs + staff guidance but **absent from the public REST reference** — a build-time Stripe-support / test-mode probe confirms it (and its pricing); the design degrades to an ordinary CNP confirm if unavailable.

#### 5.8.3 Primary ACH lane — mid-call Financial Connections (WEB mandate); staff-keyed TEL secondary

**A fully-native, staff-only, same-call ACH capture is not possible** — three independent, individually-fatal blockers: (i) Financial Connections is a **client-side Stripe modal the account holder completes on their own device** (staff cannot run it server-side); (ii) ACH is **async — `processing → succeeded` over T+2/T+4 business days**, so there is no "approved on the call" moment; (iii) the only end-to-end staff-keyed path is **TEL**, which is Stripe private beta + requires raw account entry + a recorded oral authorization.

**PRIMARY: mid-call Financial Connections link to the donor (WEB mandate).**

1. Staff pick **ACH**; the workbench pre-flights the connected account's `us_bank_account_ach_payments` capability and hides ACH with a plain message if inactive.
2. Server creates a `us_bank_account` PI + bank-collection session (reusing the existing intent + saga) and **sends the donor a secure Stripe-hosted link (SMS/email) while on the call.**
3. Donor opens it on their phone → taps their bank → logs in (Financial Connections, **instant validation** satisfying NACHA's account-validation rule) → **taps Accept on the WEB mandate.** Asym never sees the account/routing number.
4. Staff **watch status flip live in Asym** (sent → viewed → `processing`). The call ends **"submitted / pending settlement,"** not "complete," and **no receipt yet.**
5. Days later `payment_intent.succeeded` → existing staged-gift path → P7 eligibility. ACH returns → the reversal path (5.8.7).

This is **native for the STAFF** (never leave Asym, never copy data, linking automatic via PI metadata) while honest that **the donor taps once on their own device and settlement is async** — the unavoidable ACH compromises the card lane does not have.

**Repeat-donor ACH fast path** — the one fully staff-completed ACH on the call: a donor with a **saved bank + valid reusable mandate** → server creates+confirms an `off_session` PI, no donor device; money still settles async.

**SECONDARY: the fully staff-keyed TEL lane (bounded principle carve-out).** The founder chose to pursue TEL as an opt-in secondary lane behind **explicit, documented, bounded guardrails** — it is not the default and is never excluded from v1, but the carve-out is bounded, not open:

- **Principle posture** pending a Stripe-support confirmation: **if** a Stripe-hosted bank field can carry a TEL (recorded-oral) mandate, the bank number stays in Stripe's iframe and the safety principle is **intact** (only the mandate type changes); **if** the TEL beta strictly requires raw account entry via the raw-data API, that specific variant rides an **explicit, documented, bounded carve-out** to "never process raw bank details" — approved in principle by the founder, but must still **never STORE or LOG the raw number** (transit-to-Stripe-only, never persisted, redaction-guarded).
- **TEL requires:** Stripe beta enablement (per-account, support-gated); a **call-recording + retention program**; **two-party-consent legal review**; **single-use only** (no recurring via TEL).
- TEL is a **secondary/opt-in lane behind its own capability gate, never the default.**

Other ACH fallback: a device-less donor → staff key routing/account into a Stripe-hosted bank field on the call → microdeposits (1–2 days) + donor confirms via the emailed verification URL (a staff click is **not** a valid WEB acceptance, so the mandate must be handled as TEL-offline to be defensible; slow, two-touch).

#### 5.8.4 Capability gating, degradation & the fallback hierarchy [A16]

The workbench **pre-flights the connected account's Stripe config before offering a method** — card requires `card_payments` active (+ MOTO enablement to set the flag); ACH requires `us_bank_account_ach_payments`. Under Connect this is a **programmatic `account.capabilities` query**; the method is hidden/disabled with plain-language copy when unavailable.

Encoded fallback hierarchies (best → last resort):

- **Card:** (1) embedded Payment Element, staff-keyed, server-confirm `moto=true` — PRIMARY; (2) same Element **without** the `moto` flag when MOTO isn't enabled (ordinary CNP confirm, accept occasional 3DS stalls); (3) saved-method `off_session` charge for repeat donors; (4) embedded Checkout (`ui_mode:'embedded'`) — still native/SAQ A, heavier, parallel linking path; (5) hosted Checkout / Payment Link sent to the donor (redirect, donor self-completes — not staff-keyed); (6) Dashboard Virtual Terminal — leaves Asym, raises SAQ to C-VT, manual link — **true last resort.**
- **ACH:** (1) mid-call Financial Connections donor-device link (WEB mandate) — PRIMARY; (2) saved-bank `off_session` charge (repeat donor, valid stored mandate); (3) staff-keyed Stripe-hosted bank field + microdeposits (device-less donor, slow, TEL-offline mandate); (4) staff-keyed **TEL private beta** — secondary/opt-in, behind the 5.8.4 guardrails.
- **Never:** a raw PAN/bank `<input>` + raw-card/direct API (SAQ D / principle violation).

#### 5.8.5 Authorization, consent & mandate-evidence retention [A17]

Asym persists its **own** records Stripe does not keep, for dispute defense and NACHA proof:

- **Card MOTO authorization record** per gift: staff user, timestamp, donor, amount, designation, verbal-authorization attestation, PI/charge id. (MOTO/CNP carries **no liability shift** — the tenant owns 100% of chargeback risk; Stripe stores no "donor said yes on the phone" artifact.)
- **ACH mandate-evidence record**: SEC code, acceptance type (WEB vs TEL), `accepted_at`, staff user, Stripe Mandate id + PI id; for TEL, a pointer to the recording / pre-debit notice. (Stripe stores the Mandate object and auto-emails the NACHA confirmation, but Asym must retain its own reconstructable record, provable to Stripe on request.)
- **Saved-method off-session consent record**: scope, terms-version, staff attestation; sets `setup_future_usage = off_session`; MIT re-consent required on card-brand change. **Default: save OFF** — save a method only on explicit verbal consent (revisit as a build-time micro-decision).

Gate the entire phone lane behind a **distinct P12 (Full Role & Permission Configuration) capability — `take_phone_payment`** — separate from view/receipt/admin, recording **initiator** (opened/prefilled) and **completer** (confirmed the Stripe surface) as distinct audit events. **Suppress Stripe's automatic payment receipt** (do not set `receipt_email`; ensure the tenant's Stripe "successful payment" email is off) so the **only** donor-facing acknowledgment is Asym's consent-gated P7 tax receipt.

#### 5.8.6 Webhook lifecycle, idempotency & recovery [A18]

Route phone gifts through the **existing `stripe_raw_events` ledger + the durable Stripe-event workflow** — no parallel webhook path. Confirm card **server-side** (the MOTO flag is confirmation-only/server-side) — the one deviation from the client-confirm donor checkout.

- **New event types to add** to the durable-dispatch allowlist (today ignored): **`charge.dispute.created` / `.closed` / `.updated`** and **`charge.failed`** (for the ACH post-success reversal + mandate-block paths). `processing` is already handled.
- **Thin gift-status projection** `pending_ach → completed → reversed` over Stripe's PI/charge status. **P7 receipt eligibility is gated on `completed`/`succeeded` only — never `processing`** (ACH receipt is settlement-gated, same as card).
- **ACH receipt = on settlement (`succeeded`)**, same rule as card. A **post-settlement ACH return** (`charge.dispute.created`) claws funds + creates a dispute + charges a failure fee (ACH disputes are final, no appeal): mark the gift `reversed`, run the existing **corrected/void-receipt** flow, and — if the gift funded remittance attributions — emit the P14 **`credit_recheck`** event in the same transaction (analogous to the A11 NSF path; credits reverse by compensating entries, never deletion). A second dispute blocks the bank account → "collect a new authorization."
- **Three independent idempotency keys:** create-side `Idempotency-Key` per attempt (regenerated only on a deliberate new attempt); ingest-side `event.id` dedupe (the `stripe_raw_events` unique constraint); effect-side staged-gift/donation uniqueness. Assume **at-least-once + out-of-order** delivery; re-fetch the live object when an event references something unseen.
- **Backstop:** the Events API (`/v1/events`) sweep for gap recovery (endpoint down >3 days), extending the existing replay plumbing.

**Structural recovery guarantee:** the webhook/`stripe_raw_events` ledger is the source of truth; the client confirm result is only a UX accelerator — **no client crash, refresh, or dropped call can lose a gift.** Declines surface synchronously with mapped human copy (safe to re-confirm the same PI with a new card); a `requires_action`/3DS stall is visible and never auto-completed; a pre-confirm timeout leaves the PI in `requires_payment_method` with no money moved.

#### 5.8.7 No double-count — phone gifts are online gifts, never offline money rows [A7 call-back 2]

A phone card/ACH gift is written by the Stripe webhook (law 2). The workbench **dispatches, tracks, and links** it — it does **not** write a money row. The gift is shown on its batch/donor row as a **tender badge + a live status chip** (`link sent / viewed / pending settlement / recorded / reversed`); it **never adds grid columns and never enters the cash control total.** Unpaid/expired/declined attempts create no posted gift and never inflate the offline batch expected/entered totals. D1 one-front-door holds (the _record_ lands in the workbench); the _authorization and the money write_ never do.

### 5.9 Presentation: frozen grid, tender facts in the inspector, a11y, copy [A12–A14]

- **[A12]** `gift_method` is a single compact grid cell (default `check`); **all** tender-specific facts live in the non-modal row inspector or the follow-up worklist. Grid columns are **frozen at the D3 core set** and never grow for a rare tender — the row shows only a tender badge + a "needs facts" chip. Date-sensitive tenders (check, securities, in-kind) have **no global today-default** (resolver-suggested-but-empty, required); only cash defaults `received = today`; a cross-year date opens the Phase 7/19 staff-attestation control and any tenant- or jurisdiction-required strengthening. Acceptance test: a **500-row all-check batch renders exactly the core column set.**
- **[A13]** No `role="grid"` nested inside `role="grid"` — the P14 remittance attribution sub-grid renders as a full-context surface or an add/edit list. Button-first uploads with a keyboard alternative to any drag zone. Live link/MOTO/ACH status via `aria-live="polite"` **without stealing focus** + `prefers-reduced-motion`. ≥24px targets; focus-not-obscured under the sticky rail. Asym a11y-tests **its own** labels/focus-order into and out of the Stripe iframe (it cannot attest to Stripe's iframe internals). Fold the nested-grid ruling into the D3 keyboard spike.
- **[A14]** A GOV.UK-plain **compliance copy deck** for every compliance-sensitive label/hint/gate (describe-never-value copy, "postmark date = the date stamped on the envelope," MOTO higher-pricing/no-liability-shift disclosure, "gift submitted, will settle in a few business days," ACH pending/returned states, mapped human decline copy, WEB/TEL mandate + saved-method consent language), following the D2 four-part gate pattern (what's wrong, why it matters, how to fix, what it blocks). Add **contrast-verified semantic `warning`/`info` tokens (light + dark)** before any compliance hint ships — none exist today; forbid ad-hoc emerald/amber.

### 5.10 Definition-of-done per tender [A15]

No tender ships without: (a) golden + failure-path fixtures asserting **describe-never-value**, **no-double-count** (online-gift-not-offline-row), **receipt-gated-on-`succeeded`**, and correct dating; (b) an explicit finance owner-role for every worklist it generates; (c) its A1 conformance descriptor. The P8 (Data-Health) signal set is delivered by **ONE aging engine** (config, not features) as acceptance criteria: proceeds-missing > N days; 8282 disposition-window; stock-pending-transfer > N days; phone-link expiring/unpaid; MOTO-enabled-but-unused; in-kind evidence-missing-before-receipt; `ach-pending-beyond-N-days`; `ach-returned-after-settlement`. The **legacy `donations` write path stays dead** (the 501 `OfflineEntryUnboundError`) with a failing-by-design test — no dual-write ever, and the legacy-column migration is deleted from the plan; only the offline zod schema + `resolveOfflineReceiptStatus` logic are salvaged as precedent. Unresolved-payer gifts (garbled wires) post to a **suspense/holding attribution** — flagged for later resolution, never hard-blocked or lost. A **counsel/finance sign-off gate** covers receipt language / tax-year treatment / noncash 8283-8282 duty wording / NACHA-MOTO mandate + consent language before the relevant ship boundary (mirrors the TEL two-party-consent gate).

### 5.11 Cut list — binding "do not build" in v1

- Per-method securities **valuation calculators** (mean/NAV/bid-ask/weighted-average) — keep a `value_basis` label + one operator-entered FMV.
- A tender-type **plugin/registry** abstraction — discriminated union + conformance descriptor instead.
- Native **crypto** custody / liquidation / processor integration / AML-OFAC screening.
- Native **vehicle** Form 1098-C generation engine.
- **Real-estate** escrow/title/close/board-approval modeling.
- **Any Asym-rendered card field / a raw PAN or bank `<input>`** — forbidden (PCI hard stop). (A Stripe-hosted iframe keyed by staff is the _permitted_ surface, not a cut.)
- **Broker/DTC feed** integration — manual capture only.
- **P15-local file/blob storage** for appraisals/evidence — P29 seam, `document_ref` only.
- **Any P15-built P20 reconciliation** — gain/loss math, deposit matching, GL posting, reconciled-status.
- Five bespoke per-tender lanes / seven per-tender tables — one generic noncash extension.
- A new bespoke worklist system — reuse the Mission Control follow-up-task infra.
- A bespoke FX-reconciliation engine.
- Confirmation ceremony / mandatory second person on ordinary MOTO or routine actions — friction only where money-integrity buys it back.

### 5.12 Repo anchors (context, not build instructions — verify before citing)

**REAL (exists today):**

- `packages/api/src/schemas/contributions-offline.ts` — the offline zod schema; line 82 methods `check/cash/manual_ach/wire/stock/other` (the drift A1 reconciles: `stock→securities`, `manual_ach→ach`, add `wire`) plus `batchId`/`referenceNumber`; salvage this zod shape (and `resolveOfflineReceiptStatus` from the sibling `admin/contributions/offline-logic.ts`), discard the 501 bridge.
- `packages/api/src/donate/payment-intent.ts` (`createDonationPaymentIntent`), `saga.ts` (atomic donation+outbox), `outbox.ts`, `guest/donor-matching.ts` (`resolveDonorMatch`) — the PI + saga + staged-gift seam the phone lane reuses.
- `packages/api/src/donate/index.ts` + `admin/contributions/replay.ts` — `createStripeClient` (no `stripeAccount` today = the Connect gap), `stripe_raw_events` replay.
- `supabase/schema.sql:19-20` — plaintext `stripe_secret_key` / `stripe_publishable_key` (the Phase 13 D23 delete target; standing security defect).
- `supabase/migrations/20260512190000_phase_03_giving_pipeline.sql` — `stripe_raw_events` ledger.
- `packages/api/src/email/consent.ts` — the message-type-aware fail-closed consent gate (P6) the receipt path traverses.
- `packages/api/src/giving/staged-gifts.ts` — `stageGiftFromStripeDonation` staging.

**FORWARD (groomed-not-built — cite owning phase/PRD):**

- The P13 `contribution_headers` / `contribution_designation_lines` / `contribution_postings` ledger + `gift_method` enum + dating resolver — zero SQL today; P13 ledger epic **#690** (blocked). P15's first build slice lands the minimal posting substrate before any tender lane.
- The full **Stripe Connect** connected-account substrate + `{ stripeAccount }` + `account.capabilities` + `account.application.deauthorized` — ratified in P13 D1/D23, unbuilt.
- P14 `contribution_credits` + `credit_recheck` + the remittance sub-grid + acknowledgment machinery — P14 epic **#719**; the A11/A18 credit-cascade depends on it.
- The P15 tables (`gift_entry_batches`, `noncash_gift_details`, `gift_disposition_facts`, `deposit_groups`, phone authorization/mandate-evidence records) are **new** in this phase.

**Could not verify:** the online-path `payment_method_options[card][moto]` REST flag (absent from the public REST reference per the deep dive — SDK-present, staff-confirmed; needs a Stripe-support / test-mode probe at build) and the TEL-mandate-via-hosted-field question are flagged build-time confirmations, not disk-verifiable anchors.

## Receipts, Amendments & Gift Dating (D5 Mod2 / Mod3 / Mod4)

The founder ratified three modifications to the commit contract that each touch a donor-facing tax fact: **Mod 2** — a Phase 7 plan-admitted individual receipt goes out immediately on post; **Mod 3** — a single donation inside a posted batch can be amended without redoing the batch; **Mod 4** — postmark is an optional field on check entry. All three collide with a ratified predecessor law (Phase 6 (Shared Communication Event Model) consent, Phase 7 (Receipt & Statement Compliance) document rules, Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) append-only immutability, Phase 14 (Donor Credit Operations) acknowledgment suppression, D4 A18 ACH-on-succeeded, the D2 control-total gate). The D5 adversarial fleet (17/17 CONCERN, all convergent) proved the compliant reading of each is **forced, not softened**: the three mods are policy defaults and gate predicates over the ONE commit machine, receipt rail, and correction spine — never a second bespoke code path. This section specifies the three donor-fact behaviors; the commit state machine itself, the escape valve, the high-risk auto-route, and the compensating-control floor live in the commit-contract section (D5 Amd 1–3, 9, 11).

The governing principle across all three: **a tax fact is never written or reversed inline, never re-derived, and never mutated in place.** Every plan-admitted individual receipt leaves through the durable outbox; an annual-cumulative occurrence never enters that send path; every amend to a posted gift is an append-only compensating correction; every skipped postmark yields a captured, stamped `delivery_basis` — never a silent recomputation.

### Mod 2 — Plan-gated immediate tax receipt on post

#### The scope of "immediately" — one document, settled tenders only [D5 Mod2, Call-back A]

"Receipts go out immediately on post" resolves to exactly one meaning, because it is the only reading consistent with the ratified predecessor contracts: **when Phase 7's source-frozen prospective plan admits an individual receipt**, Phase 15 releases that receipt at the earliest defensible money-final point. It never means “mint a per-gift receipt regardless of the receipt plan.”

- **The P7 TAX RECEIPT only, and only under `individual_cash` or the applicable ordinary non-Canadian policy.** It is a distinct document from the Phase 14 donor-credit **acknowledgment** streams (DAF-advisor thank-you, tribute notifications, soft-credit acknowledgments). Those keep their batch-origin posture and are released by the explicit per-batch **"Send acknowledgments"** gate (NF3) — never by post. This is the three-document wall of P7 (receipt / acknowledgment / notification) expressed as a send-time invariant, and it is a named test: **an acknowledgment send must never write `gift_receipt_records`, and a receipt send must never touch the P14 acknowledgment columns.**
- **`annual_cumulative_cash` defers official coverage, not the posted gift.** Phase 15 records the gift and its frozen plan normally, shows **Ready for year-end receipt**, and emits no per-gift receipt record or receipt-send outbox row. Phase 7 alone later owns the compatible, nonoverlapping cumulative coverage set; Phase 19 coordinates the run but does not reinterpret the plan.
- **Settled-on-entry tenders only** — check, cash, and settled card (a card gift whose money is real when the row is entered). For these, the money exists at post, so the receipt is defensible immediately.
- **Async tenders wait for money-final.** The ACH phone lane's receipt is gated on the `succeeded` webhook (T+2/T+4), never on post, per D4 A18 — it enqueues _nothing_ at post. A check that later bounces runs the NSF compensating reversal + void/corrected receipt (CB-B); a per-tenant opt-in "hold check tax-receipt until cleared" toggle rides the same receipt-timing rail (off by default).

The send seam therefore decides by **document-type × origin × tender**, never "send everything on post." This tri-axis rule is the single most important coupling to name: "immediately" must never degrade into an inline `sendEmail` that fires for every document on every posted row.

#### The durable outbox in the post transaction — never inline send [D5 Amd 4]

On a successful post, the commit transaction emits receipt-**eligibility facts** into the durable donation-saga **outbox in the same transaction that writes the money rows** only when Phase 7's frozen plan admits a per-gift receipt — it does not call the email service. `annual_cumulative_cash` records source-owned year-end readiness without entering this send outbox. This is non-negotiable for two independently sufficient reasons the fleet surfaced:

1. **Atomicity.** An inline send that fires and then hits a transaction rollback mints a real IRS tax receipt for a gift that does not exist. Emitting an outbox row inside the txn means the receipt-eligibility fact commits (or rolls back) atomically with the money.
2. **Scale.** A 500-row batch fired as synchronous `await sendEmail` per gift blocks the Post click for minutes against a single per-tenant email key and fails non-atomically partway. Enqueue-then-drain-async is strictly better and reuses infrastructure that already exists.

A background worker drains the outbox asynchronously through the existing receipt path: **`sendStagedGiftReceipt` → the P7 receipt-eligibility evaluator → the P6 fail-closed consent gate → `sendEmail` → immutable `gift_receipt_records`.** The drain carries a **per-`tenant_id` throttle/concurrency cap** (protects the tenant's sender reputation and key), the existing receipt **idempotency key** (exactly-once), and a **5-attempt dead-letter** with a data-health surface. **No `sendEmail` originates in the batch or commit module** — a grep-gated architectural test asserts this.

The P7 evaluator is consumed **unchanged** — receipt eligibility is P7's pure rules evaluator (in-kind described-never-valued, DAF sponsor suppression, etc.); _timing_ is P15's concern, eligibility is not. The P6 consent gate is the shipped, message-type-aware, fail-closed gate: a tax receipt is `transactional` and bypasses marketing opt-outs, but a global `do_not_contact`, a hard bounce, or a spam complaint always suppresses it — a suppressed receipt is a visible event, never silence.

#### The receipt outbox row shape [D5 Amd 4]

Each enqueued receipt-eligibility fact is a row carrying, at minimum:

- `eligible_at` — the release time. **Immediate is a default _value_, not the only representable state** — this is the migration-safety insurance that "send now" never fossilizes as a synchronous code branch.
- `gated_on ∈ { none, settlement }` (TEXT + CHECK) — `settlement` for the ACH lane (drains only on the `succeeded` webhook); `none` for settled-on-entry tenders.
- The idempotency key, attempt count, and dead-letter status.
- The document-type / origin / tender discriminants the send seam evaluated.

The row is append-only from the commit's perspective; the worker updates only its own delivery status columns.

#### The donor-invisible release-delay catch-window [D5 micro-choice 2]

The `eligible_at` release time defaults to a **short, non-zero, donor-invisible hold** on the send queue (a few minutes), **tenant-lowerable to 0**. It is the leanest mis-key net: a one-click **recall / hold** window for a fat-finger, a wrong-donor pick, or a systematic error caught in-window — before the email leaves the building. It is **a cancellation window on the queue, not an approval step**: no mandatory pre-post ceremony, no per-row gate. The donor never perceives the delay — they still receive a contemporaneous receipt within seconds/minutes, and **`gift_date` is unchanged** by the hold. A tenant that wants literal-instant sets the delay to 0 and accepts void/corrected receipt as the sole remedy. The delay is **not** a mandatory, non-disable-able hold (that was explicitly cut).

The recall window is what makes the auto-send default safe: paired with the corrected/void-receipt op and the batch-scoped reverse op (Mod 3), a systematic error caught in-window reverses _before_ receipts leave.

#### The per-batch receipt-status rollup [D5 Amd 4]

A **per-batch receipt-status rollup** is a required surface: `queued / sending / sent / failed / skipped-consent / ready-for-year-end` counts, live-updating from `sending → sent`. It replaces a blocking spinner: "posted now, receipts sending now (async, tracked)" is the staffer-facing meaning of "immediately," while **Ready for year-end receipt** truthfully explains annual-cumulative occurrences without implying an error. A read model over source plan facts and outbox delivery status; no new mutable status authority. The dead-letter tail and consent-skipped counts feed the P8 data-health worklist (D5 Amd 10).

#### The one per-batch commit confirm [D5 micro-choice 3, Amd 12]

The single, least-reversible click in the product — post money + email real tax receipts — gets exactly **ONE plain-language confirm per batch (or per quick-entry gift), never per row**:

> **Post 18 gifts ($12,480) and email 16 receipts now?**

It restates the counts, the dollar total, and the **plan- and tender-conditional receipt reality** — which receipts send now, which wait for ACH settlement, and which are ready for year-end cumulative coverage (for example, "14 send now, 2 wait for the bank, 2 are included at year end"). Action-verb buttons, never "OK"; the confirm is a Base UI **AlertDialog** with **default focus on the safe action**. This is the correct home for the friction budget — NN/g explicitly permits a confirm for an irreversible money action, and it is _not_ the banned per-row ceremony. The don't-over-engineer rider forbids per-row confirmation dialogs and any confirmation ceremony on ordinary actions; this one moment is the exception money-integrity buys.

#### Invariants (Mod 2)

- No path writes `gift_receipt_records` except the async outbox worker via the P7 → P6 → `sendEmail` chain. No `sendEmail` call originates in the commit/batch module (grep-gated test).
- A receipt-eligibility outbox row is written only inside the successful post transaction; a rolled-back post emits none.
- An occurrence frozen as `annual_cumulative_cash` emits neither a per-gift receipt record nor a receipt-send outbox row; a caller-supplied or tenant-inferred plan cannot change that result.
- Receipt sends are exactly-once under the idempotency key (double-click / replay / dead-letter retry never double-mails).
- ACH-lane receipts drain only on `succeeded`; `gated_on = settlement` rows are invisible to the post-time drain.
- P14 acknowledgment streams are never sent by the post path; they land `held (batch_gate_pending)` and release only through the NF3 gate (a cross-tenant + cross-document negative test).
- Receipts are content-minimized to IRS-required fields (blast-radius reduction on cross-donor misdelivery).

### Mod 3 — Amend a posted gift = compensating correction

#### Pre-commit is a free edit; post-commit is a correction only [D5 Mod3, Call-back B, Amd 7]

The founder's intent — "amend a single donation in a posted batch if necessary, without redoing the whole batch" — is delivered through a **defensible asymmetry**:

- **Pre-commit (draft stage):** a batch row is a working record with no ledger truth behind it yet. Editing it is a **free, un-gated row edit** in the D3 grid — low friction, no correction machinery, no ledger.
- **Post-commit:** a posted contribution is **immutable** under the P13 append-only ledger. "Amending" it is an append-only **compensating correction**, never an in-place `UPDATE`. A flat-`donations` in-place edit is **FORBIDDEN** (the fresh-build posture retires that path entirely).

The affordance _feels_ like an edit — it renders in the D3 non-modal row inspector, the gift stays visible, the user thinks "amend this gift" — but the engine writes a compensating correction through the existing AL-261 spine: `contribution_adjustments` (append-only) + `contribution_correction_requests` + the tenant approval policy, reusing the shipped `correction-approval-panel` and `operation-shell` surfaces. The P13 BEFORE-UPDATE immutability trigger enforces this at the database floor: a raw mutation of a posted money row **fails loud in tests**, and the trigger is never disabled.

The asymmetry is the only way Mod 3 coexists with IRS Pub 1771 and P13 without either blocking ordinary entry (kills low friction) or allowing raw edits of already-issued tax facts (corrupts the ledger). Ordinary _entry_ stays un-gated; **amending an already-issued tax fact is capability-gated** (AL-261 requester ≠ approver) — that is the one place the friction is warranted.

#### Receipt-affecting versus non-affecting amends [D5 Amd 7]

The inspector classifies the amend _before_ the user commits it and says so plainly:

- **Receipt-affecting amend** (amount, legal donor, designation that changes deductibility, tax year) → produces a **versioned corrected/void receipt** through the same Mod 2 receipt rail, records the original and corrected values per IRS practice, and carries the same single confirm. A receipt-impact preview is shown before the amend commits.
- **Non-affecting amend** (e.g. an internal fund reclassification with no donor-facing change) → contacts no donor, and the UI states this explicitly before the click.

The versioned corrected/void receipt is issued via the shipped receipt-delivery reissue path; the void records original + corrected as a new immutable `gift_receipt_records` version, never an edit of the prior snapshot.

#### The void/correct + batch-reverse ops ship WITH the default [D5 Amd 5]

Because Mod 1's auto-post removes the pre-post second approver by default, the _undo_ must ship in the same phase as the auto-send default — never as a follow-on. Two named D5 acceptance criteria:

1. **Corrected/void-receipt op** — one-click from any posted gift, records original + corrected, versioned P7 fact.
2. **Batch-scoped reverse** — compensating postings + bulk corrected/void receipts across a whole posted batch, driven by the existing `contribution_operation_batches` bulk-ops infrastructure (chunked claim, stale-running recovery, follow-up task). This is the systematic-error remedy: a whole mis-posted batch reverses through append-only compensation.

The safety of Mod 2's immediate send is entirely a function of how cheap this undo is; that is why it is co-scheduled, not deferred.

#### Build-order dependency gate [D5 Amd 6, build-order BLOCKER]

Mod 3's compensating-correction spine rides the **P13 append-only posting ledger, which is groomed-not-built** (`contribution_headers` / `contribution_designation_lines` / `contribution_postings` = zero SQL today; P13 epic #690 and children blocked). Mod 3 as specified cannot ship without that substrate. Resolution, binding on this phase's build order:

- **P15's first build ticket lands the minimal posting substrate** it needs — headers / designation_lines / postings + monotonic `effective_seq` under `FOR UPDATE` + the BEFORE-UPDATE immutability trigger + the `credit_recheck` outbox event — **or** the P13 tickets land first.
- **Draft-stage amend ships first** (it needs no ledger — it is a free row edit).
- **A flat-`donations` in-place-edit interim is forbidden** — no bridge, no temporary mutation path.

#### Invariants (Mod 3)

- Zero `UPDATE` statements ever touch a posted money row; every post-commit change is an append-only compensating correction (enforced by the P13 immutability trigger + a property test that a raw mutation fails).
- A post-commit amend is capability-gated (requester ≠ approver, AL-261); a draft-stage amend is not.
- A receipt-affecting amend always yields a versioned corrected/void receipt through the Mod 2 rail; a non-affecting amend contacts no donor.
- The corrected/void-receipt op and the batch-scoped reverse op exist and are tested in the same phase as the auto-post default.

### Mod 4 — Optional postmark, the dating resolver & the year-boundary guard

#### Postmark stays optional everywhere — a pure resolver with a stamped fallback [D5 Mod4, Call-back C, Amd 8]

Postmark is **not a required field on check entry** and stays optional on every surface. The gift-dating logic is a **pure resolver** — capture-not-recompute — that always yields a defensible triple:

```
resolveDating({ postmark?, received_date, gift_method }) →
    { gift_date, delivery_basis ∈ { postmark, received, settlement }, tax_year }
```

Rules the resolver applies (inherited from the P13 dating contract, D8):

- **Check** dated by **postmark** when present (the USPS mailbox rule); when postmark is absent, the resolver **falls back to `received_date` and stamps `delivery_basis = received`** — the fallback is **captured and stamped, never silently recomputed later**. A private-carrier delivery (FedEx/UPS) dates by received, not postmark.
- **Cash** dates by `received` (receiving staff + deposit reference captured).
- **Settled card / ACH** date by `settlement`.

`delivery_basis` is a first-class stamped fact on the gift, so an auditor can always see _why_ a gift landed in the tax year it did.

#### The three-state required-field enum [D7 H3 / CB-4]

Postmark's optionality is formalized in a three-state required-field enum that every field carries (TEXT + CHECK, never a native enum):

- **`invariant_required`** — structurally required, a batch template can never relax it (e.g. amount, legal donor).
- **`template_requirable`** — optional by default, but a tenant batch template may flip it to required.
- **`optional_by_design`** — deliberately optional; **postmark is `optional_by_design`.**

A template MAY re-require postmark, but only **with a loud warning** in the template editor, and the D5 year-boundary nudge (below) persists regardless of the template setting. This is the config-frozen-safety-live boundary: presentation/required-layout freezes by value on the batch header at creation; the postmark nudge is a live safety behavior that a frozen template can never suppress.

#### The Dec/Jan year-boundary nudge — non-blocking, data-driven [D5 Amd 8, Call-back C]

The one place a skipped postmark is dangerous is the tax-year boundary: a check **postmarked Dec 30 / received Jan 3** belongs to the **prior** tax year. Under an individual-receipt plan, a received-date fallback could mail a **wrong-year** receipt immediately; under an annual-cumulative plan, it could place the gift in the wrong coverage year. The compliant, low-friction guard is a **single, non-blocking, dismissible inline nudge** that fires _only_ when **all** of:

- `gift_method = check`, **and**
- `postmark` is empty, **and**
- `received_date` sits in a **config window** (default **Dec 26 – Jan 15**, config-driven, never hardcoded) **or** the candidate dates straddle a year line.

Copy: _"The postmark decides this gift's tax year and its receipt — add it if the envelope has it."_ One click to add the postmark; one click to **"use received date (records the basis)."** It is **never a required field, never a modal, never a nag** — harmless 364 days a year, present only in the ~3-week window where it changes a tax year. The nudge is `aria-live`-announced and reduced-motion-safe.

The 2025 USPS rule (postmark = first automated scan, not the mailing date) makes postmark and mailing date legitimately diverge by days, which is exactly why the guard is advisory, not mechanical — the system cannot infer the true mailing date.

#### Staff-attested prior-year date, strengthened only by tenant or jurisdiction policy [Phase 19 D5]

At the boundary, authorized staff may record a **prior-year date attestation** that states the asserted mail/delivery date, basis, reason, actor, and time. Staff judgment is sufficient under the default tenant policy; a visible postmark, donor note, or other proof may be retained when available but is not a universal prerequisite. A tenant or jurisdiction contract may strengthen the policy with a cutoff, evidence, or independent review. The action is append-only and audited, never inferred and never an in-place rewrite. Before a Phase 19 primary release it invalidates the affected preflight; afterward it enters the contract-owned late-fact lane.

#### Invariants (Mod 4)

- The resolver is pure and total: every gift yields a defensible `{gift_date, delivery_basis, tax_year}`; the received fallback is stamped `delivery_basis = received`, never silently recomputed.
- Postmark is `optional_by_design`; only a tenant template may require it, and only with a loud warning; the year-boundary nudge fires regardless of the template setting.
- The boundary nudge is non-blocking and window-scoped (config, default Dec 26 – Jan 15, or straddling dates); it never blocks post.
- A prior-year date records a staff attestation by default; evidence and independent review apply only when the tenant or jurisdiction policy requires them.
- A "quiet 364 days / wrong 1 day" seasonal regression is covered by a named property test spanning the boundary window.

### Repo anchors (evidence, not build instructions)

REAL (exists today; consumed or extended by this section):

- Consent gate: `packages/api/src/email/consent.ts` — message-type-aware, fail-closed; `transactional` bypasses marketing opt-outs but never `do_not_contact` / bounce / complaint.
- Receipt records + delivery: `packages/api/src/giving/receipt-record.ts`, `packages/api/src/giving/receipts.ts` (immutable `gift_receipt_records`); corrected/void reissue at `packages/api/src/admin/contribution-operations/receipt-delivery.ts`.
- Offline receipt-status logic salvaged (not the 501 bridge): `resolveOfflineReceiptStatus` in `packages/api/src/admin/contributions/offline-logic.ts`; zod schema `packages/api/src/schemas/contributions-offline.ts`.
- AL-261 correction spine: `supabase/migrations/20260611100000_contribution_adjustments.sql`, `..._120000_contribution_correction_requests.sql`, `..._140000_contribution_receipt_delivery.sql`; UI `apps/admin/app/contributions/correction-approval-panel.tsx` + `operation-shell.tsx`.
- Durable outbox + bulk-ops infra: the donation saga/outbox and `contribution_operation_batches` (chunked claim, stale-running recovery, follow-up task) for the batch-scoped reverse op.

FORWARD (groomed-not-built; a dependency this section gates on):

- P13 posting ledger — `contribution_headers` / `contribution_designation_lines` / `contribution_postings` + `effective_seq` + immutability trigger + `credit_recheck` outbox: zero SQL today (P13 epic #690, children blocked). Mod 3 gates on it (build-order BLOCKER).
- P14 acknowledgment machinery — `contribution_credits` + acknowledgment-state columns + the NF3 "Send acknowledgments" gate (P14 epic #719): the receipt/acknowledgment wall is enforced against it.
- The P15 receipt-eligibility outbox rows (`eligible_at`, `gated_on`) and the three-state required-field enum are new in this phase.

### Build-order note (local to this section)

1. Land the minimal P13 posting substrate **first** (or the P13 tickets) — prerequisite for Mod 3, per-row posting status, and atomic commit. Draft-stage amend can land here (needs no ledger).
2. The receipt rail — async outbox, tender-conditional, `eligible_at` release-delay, per-batch rollup — ships **with** the corrected/void + batch-reverse ops (Mod 3 undo). The safety of Mod 2 is a function of how cheap this undo is; never build the auto-send before the undo.
3. Post-commit amend = correction (Mod 3), once the ledger + receipt rail exist.
4. Optional-postmark resolver + boundary guard (Mod 4) — self-contained; can parallelize with step 2.

### Acceptance-criteria slice (feeds the D5 required test grid)

The phase's required **policy × tender × receipt-timing × control-total × escape-valve** matrix includes, for this section:

- Settled tender (check/cash/settled card) + auto-post → tax receipt enqueued in-txn, drained async, exactly-once — the golden happy path.
- ACH lane → nothing enqueued at post; receipt drains only on `succeeded`; a post-settlement return runs NSF reversal + void receipt.
- Rolled-back post → zero receipt-eligibility rows.
- Post-commit amend → append-only correction only; raw `UPDATE` of a posted row fails (property test); receipt-affecting amend → versioned corrected/void receipt.
- Year-boundary property test: a Dec-30-postmark / Jan-3-received check lands in the prior tax year when postmark present; skipped postmark stamps `delivery_basis = received` and fires the nudge inside the window only.
- Three-document-wall test: a receipt send never writes P14 acknowledgment columns; an acknowledgment send never writes `gift_receipt_records`.

## Deposit Grouping & Undeposited Funds (D6)

Deposit grouping is Phase 15's answer to a physical-world fact the online rails never had: staff carry stacks of checks and envelopes of cash to a bank, and the bank posts them as _deposits_ — batches of money that are legally and operationally distinct from the _gift-entry batches_ the money was keyed in. Phase 15 owns the operational deposit-grouping workflow, the deposit-state of each gift, and the printable deposit slip. Phase 20 (Accounting Export) owns the general ledger (the undeposited-funds clearing account, deposit-clearing journal entries) and the bank-statement tie-out. This section builds the former and cleanly feeds the latter; it builds none of the latter.

The model is the **undeposited-funds spine** (the QuickBooks / Aplos / MinistryPlatform / Virtuous canonical): a first-class `deposit_groups` entity, a nullable, changeable, **gift-grain** scalar link from each contribution to at most one deposit group, and a **derived** deposit-state that is decoupled from both the gift-entry-batch lifecycle (D2/D5) and the posting lifecycle (P13). One simple shape, exercised three ways, covers all six founder-named workflow variants (V1–V6) with no configuration switch and no special cases. This is the leanest compliant shape; the cut list at the end is binding "do not build."

### D6.0 — Six workflow variants, one model (V1–V6)

The batch↔deposit relationship is fully flexible, opt-out, and changeable after posting, because real tenants run all of these — often inconsistently, week to week:

- **V1 — RDC / desk scanner, deposited same-day.** Batch ≈ deposit, near-instant. Remote-deposit-capture is a real workflow; Phase 15 does not build the scanner (reserved seam, HD-15) but the same-day _manual_ path exists: enter, group, mark deposited, capture ref/date.
- **V2 — Deposit FIRST, enter AFTER the checks clear.** The physical deposit happens before any gift exists in-system. A `deposit_group` can exist with zero members; gifts entered later join an already-banked group.
- **V3 — Enter in a batch, deposit three business days later.** Entry precedes deposit by days; the gifts sit `undeposited` until grouped.
- **V4 — Large multi-batch weekly check deposit.** N gift-entry batches → 1 deposit. Cross-batch gift selection builds one deposit.
- **V5 — One deposit per batch (1:1).** The 90% convenience case: one click on the batch.
- **V6 — Inconsistent.** The same tenant mixes V1–V5 arbitrarily. This is why per-tenant "deposit mode" configuration is **cut** — it would re-weld the rigidity D6 forbids.

Temporal ordering of entry-vs-deposit is UNFIXED (before, after, simultaneous all valid). Cardinality is UNFIXED (1:1, N:1, and the founder's "1:N" — one entry batch's gifts pointing at different deposits, expressible because the link is _per gift_). The scalar gift-grain link is what makes every variant fall out of one shape.

### D6.1 — The deposit-state axis (the sixth orthogonal axis) [HD-2, HD-3]

Deposit-state is a **new, sixth orthogonal operational axis** on the contribution, alongside P13's five (payment, posting, receipt, accounting-export, review). It **formalizes** P13's narrative `recorded → deposited → cleared` waypoints into first-class state and **retires** P13's flat `deposit_reference` TEXT field, which was never modeled as states and does not exist in the codebase today (greenfield — verified: no `deposit_reference` column anywhere on disk). There is ONE clearance truth: the deposit-state axis drives P13's payment-axis clearance and P20's bank tie-out; it does not duplicate them.

Deposit-state is **derived, not stored** as a redundant enum (a stored enum would desync from link presence + group status). Compute it:

- `settles_via_payout` — terminal, tender-derived: any Stripe-rail tender (card, Stripe-ACH). NEVER groupable (D6.3).
- `no_deposit` — terminal, tender-derived: securities, in-kind.
- `direct_credit` / `no_slip` — tender-derived: wire / direct bank credit (money lands in the bank with no physical deposit slip; P20 reconciles it against the statement, no P15 slip).
- `undeposited` — bank-settled tender (check, cash, bank-direct ACH), link is NULL.
- `in_open_deposit` — link is set, the group's regime is `open`.
- `deposited` — link is set, the group has been physically banked (slip printed / marked deposited).
- `cleared` — **RESERVED, P20-driven.** Never independently stored, aged, or operator-maintained in Phase 15. Phase 15 tops out at `deposited`.

The only independently-stored per-gift datum in this axis is a `returned` / `nsf` flag (D6.6). Everything else derives from `deposit_group_id` presence + the group's regime + the tender's settlement rail.

Deposit-state is **NON-GATING** on posting and on any Phase 7 plan-admitted individual receipt [HD-9]. A settled-on-entry gift posts while still `undeposited`; an individual receipt follows D5, while `annual_cumulative_cash` remains ready for year-end coverage. Deposit timing is free before OR after posting (V1–V6). This resolves the D5 × P13 collision (CB-B): P13's original "posting/receipt deferred to cleared" narrative is **reworded** — the `cleared` waypoint is separate from posting, and clearance risk on offline checks is handled by the NSF compensating-reversal path (D6.6), never by changing the frozen prospective receipt plan. An opt-in per-tenant "hold check individual tax-receipt until cleared" toggle rides the same D5 receipt-timing rail but is OFF by default.

Because a gift can be Posted (D5) yet Not-deposited, every gift/batch view renders posting-state and deposit-state as **two separate facts** ("Posted to the ledger · not yet deposited"), never collapsed into one status.

### D6.2 — The gift-grain scalar link [HD-1]

A single nullable `deposit_group_id` on the **contribution header** (P13's mutable status-carrier), never on a batch, never in a junction table. Constraints made structural:

- **≤ 1 deposit per gift, many gifts per deposit.** A scalar nullable FK structurally forbids double-deposit — a physical gift lands in exactly one bank deposit. No N:M junction table (cut).
- **NEVER batch-grain.** Forbid any `gift_entry_batches.deposit_group_id` or batch↔deposit FK. A schema test asserts that no deposit FK exists on the batch table. "Deposit this batch" (V5) is a _loop_ that links each gift individually — reversible and opt-out per gift.
- **On the mutable header, NOT on immutable `contribution_postings`.** The P13 BEFORE-UPDATE immutability trigger protects the _postings_ (money truth); the header already carries mutable operational axes (posting/receipt/review), and the deposit link is one more. A regrouping mutates no money truth and therefore requires no compensating posting — this is what lets the link be "changeable after posting" while P13 stays append-only.

Every assignment, reassignment, and detachment is written to an append-only `deposit_assignment_events` log (actor, reason, from_group → to_group, timestamp). Full history is preserved append-only; the header column is the current pointer.

### D6.3 — Settlement-rail eligibility (the F1 double-count blocker) [HD-5, CB-A]

**The money-integrity floor of the whole model.** Bank-settled tenders reach the bank via a physical deposit and must be groupable; Stripe-settled tenders reach the bank via a **Stripe payout** and are reconciled by P20 against payout reports. Putting a Stripe-settled gift into a manual deposit double-counts it (once in the manual slip, once in the payout) and corrupts both the slip and the P20 tie-out. This is the **F1 BLOCKER** and it is made **impossible at the database**, not discouraged in the UI.

Eligibility keys on a **settlement rail** discriminator on the tender, NOT on the `gift_method` label — because D4 reconciled offline `manual_ach` and Stripe phone-lane ACH both into `gift_method = 'ach'`, so `ach` now spans both rails. CB-A reinstated a `settlement_rail` marker (bank-direct vs stripe-rail) precisely so this predicate can be written correctly. The founder ratified this (CB-A, 2026-07-11) and it amends D4's gift_method reconciliation (a congruence note, D6.10).

Attach eligibility (DB CHECK / trigger at attach time):

- **Bank-direct** {check, cash, bank-direct ACH, wire} → eligible to acquire a `deposit_group_id`. (Wire/direct-credit is eligible in principle but normally carries `direct_credit`/`no_slip` — money already in the bank, no physical slip; P20 statement-reconciles it. It does not require a P15 slip.)
- **Stripe-rail** {card, Stripe-ACH} → forced to `settles_via_payout`; the DB **REJECTS** any `deposit_group_id` write.
- **securities / in-kind** → `no_deposit`; DB rejects any link.

A group is additionally **homogeneous** (DB CHECK/trigger, not UI): single currency and single bank account; every member shares the group's currency. Cross-currency and cross-account attach are hard rejects (edge-case coverage, D6.11).

### D6.4 — Data model

All tables are tenant-scoped with composite `(tenant_id, id)` primary/unique keys, composite foreign keys, and RLS `tenant_id = current_tenant()` — the repo's existing isolation idiom. This closes the cross-tenant leak on the high-frequency attach/reassign verb [HD-4]: a single-column FK with app-only tenant checks would be a structural leak, worse under V2/V4/V6.

**`deposit_groups`** (new, Phase 15-owned):

- `tenant_id`, `id` — `PRIMARY KEY (tenant_id, id)`; `UNIQUE (tenant_id, id)` for the inbound composite FK.
- `bank_account_id` — composite FK to `tenant_bank_accounts(tenant_id, id)`; declares the single-account invariant. Reserved-nullable at first if `tenant_bank_accounts` lands in the same slice.
- `currency` — TEXT; the group's single currency; members must match.
- `deposit_date` — DATE; the physical banking date (inline-editable; defaults today on the one-click gesture). NEVER drives any gift's `gift_date` or `tax_year` (D6.11).
- `reference` — TEXT; slip/deposit reference number (auto-suggested, editable).
- `expected_total` — BIGINT integer minor units; the operator-entered bank figure, FROZEN once set (D6.5).
- `regime` — TEXT + CHECK ∈ {`open`, `exported`}; the two-regime lock ladder (D6.7). (`deposited` is a derived/stamped property of members + slip, not a third regime under the ratified CB-C answer.)
- `status` / `voided_at` / `voided_reason` — void-not-delete metadata (D6.7).
- `external_deposit_id` — reserved-nullable for RDC/bank integration (HD-15).
- audit columns (created_by, created_at).

**`tenant_bank_accounts`** (new; may be shared with P20's needs but Phase 15 owns the operational minimum): `(tenant_id, id)`, `label`, `last4`, `currency`. **NEVER** store full routing + account numbers on the group or here — label + last4 only [HD-12].

**`deposit_assignment_events`** (new, append-only): `(tenant_id, id)`, `header_id` (composite FK to the contribution), `from_group_id` (nullable), `to_group_id` (nullable), `action` ∈ {assign, reassign, detach, returned}, `actor`, `reason`, `created_at`. RLS-scoped. This is the audit spine; no row is ever updated or deleted.

**Contribution header extension** (P13 `contribution_headers`, groomed-not-built — Phase 15 adds these columns when it lands the minimal posting substrate, per the D5 build-order blocker):

- `deposit_group_id` — nullable; composite FK `FOREIGN KEY (tenant_id, deposit_group_id) REFERENCES deposit_groups(tenant_id, id)`. No CASCADE, no SET NULL (D6.7).
- `settlement_rail` — TEXT + CHECK ∈ {`bank_direct`, `stripe_rail`}; the CB-A discriminator the eligibility predicate reads.
- `returned` — BOOLEAN default false; the one independently-stored deposit-state datum (NSF/returned).
- `cleared_date` — reserved-nullable (three-dates model: gift_date, deposit_date, cleared_date); P20/NSF-driven, never operator-hand-filled in v1.

**Index plan:** a PARTIAL index on the transient, self-pruning undeposited slice — `ON contribution_headers (tenant_id, gift_method, gift_date) WHERE deposit_state = 'undeposited'` (or the equivalent derivation predicate on `deposit_group_id IS NULL AND settlement_rail = 'bank_direct'`). **Forbid** a full-table `(tenant_id, deposit_state)` low-cardinality btree [HD-7, HD-14].

### D6.5 — Soft conservation (never hard equality, never silent rewrite) [HD-6, CB-F]

Deposit totals reconcile **softly**. `expected_total` is the operator-entered bank figure, frozen once set. A live-computed `actual_total` = Σ face amounts of current members; a persisted `variance` = expected − actual. Empty, partial, and orphan groups are **legal open states** (V2 = deposit created before any member; V3 = members awaiting a later banking). A force-close on a mismatch preserves the original `expected_total` forever plus overrider identity and reason — inheriting D2's audit-erasure ban (the CiviCRM "rewrite expected to actual" trap is forbidden).

The deposit `expected_total` is **INDEPENDENT** of the D2 batch control-total and legitimately unequal under N:1 / 1:N. The two mismatch signals are never conflated. The deposit total is a **soft reconciliation aid** — a live selected-vs-expected tally and a **non-blocking** mismatch warning — NEVER a second commit/post gate. Deposit grouping is a post-commit operational activity; D2's blocking control-total already lives on the entry batch (CB-F confirmed).

### D6.6 — One-deposit-only, atomic reassignment, NSF-retains-membership [HD-7, HD-8, CB-E]

**One deposit only** is structural (the scalar link). **Reassignment** is a compare-and-set on the current `deposit_group_id` under the repo's cooperative advisory-lock idiom (one locked DB function; `FOR UPDATE SKIP LOCKED` on claim), so two staff cannot race a gift into two deposits; every move is audit-stamped into `deposit_assignment_events`. **Bulk assignment** (the weekly V4 N:1 build — hundreds of gifts) is a **synchronous bounded** `UPDATE ... WHERE id = ANY(:ids)` in one transaction plus one audit row per link — sub-second, NEVER routed through the `contribution_operation_batches` async saga machinery (that is for money operations over existing gifts; grouping moves no money).

**NSF-retains-membership** (CB-E, blessed): a bounced / returned check **STAYS shown in its historical deposit** with `returned = true` (state → `returned`), never removed — it really was on that physical slip and the bank really accepted it before the return. The **money reversal** is ALWAYS append-only via P13's NSF compensating-reversal path (story 106) plus a void/corrected receipt — regardless of any live grouping edit. This reverses the naive "delete the bad check from the deposit" expectation; blessing it now prevents a later audit-corrupting "just remove it" support change.

### D6.7 — The freeze ladder: FREE UNTIL P20 EXPORT [HD-8 as revised by CB-C]

The founder chose **maximum flexibility** over a freeze-at-`deposited` boundary (CB-C, 2026-07-11). The ladder is **two regimes**:

- **`open` / editable** — free add / remove / reassign, each audit-stamped, right up until P20 export. Posting NEVER locks the link. Physical banking does NOT freeze membership; a `deposited` deposit is still editable.
- **`exported`** — P20-consumed → compensating-correction-only; **Phase 15 cannot mutate** the group or its membership. This keeps the **F2 BLOCKER** (P15 silently corrupting a P20-exported/bank-reconciled deposit) hard.

The safety that keeps this flexibility honest: a **printed deposit slip is a retained IMMUTABLE SNAPSHOT** — it physically went to the bank and cannot be retroactively changed. Post-print membership edits ARE allowed and audit-stamped, and a new slip can be reprinted, but the prior snapshot persists. Honest consequence (recorded to the founder): a printed slip and the live deposit record can diverge if edited after printing; mitigated by retained snapshots + audit stamps; the tenant re-prints if they change a banked deposit.

**Void, don't delete:** a group that has ever had members or passed beyond empty-`open` is voided (actor + reason; each detachment audit-stamped), never hard-deleted. Only an empty `open` group hard-deletes. No CASCADE / SET NULL on the link.

### D6.8 — Two homes, one service, three gestures [HD-10, HD-11, HD-13]

Deposit management lives in **BOTH** the workbench reconciliation rail AND a first-class **Deposits area**, over ONE create/attach/detach service. Workbench-only would kill V2/V4/V6; a Deposits-area-only design would make the V5 90%-case a chore.

- **(i) Workbench rail** — a batch-level "Deposit…" action in the D3 reconciliation rail: V5 one-click, V1 mark-deposited-now.
- **(ii) Deposits area** — list + build-from-gifts + reassign/split; serves V2/V4/V6 and all post-posting reassignment.

Three gestures over one link:

1. **One-click "deposit this batch"** (1:1) — `deposit_date = today` inline-editable, reference auto-suggested, `expected_total` = the batch's actual, **ZERO required modal fields**, inline toast. This is the V5 path and it is one real click.
2. **Create-empty-deposit-first, then backfill** (V2) — joining an already-banked group sets state straight to `deposited`, skipping `undeposited`, so the copy stays truthful.
3. **Build-deposit-from-cross-batch-selected-gifts** (V4) — an accessible multi-select of undeposited bank-bound gifts, **cross-batch by default**, filterable by tender/date/batch/donor, with a live "N gifts · $X selected" tally, virtualized, no batch-count cap.

**Copy** [HD-11]: internal enum stays internal; labels are plain — "Not deposited" / "In an open deposit" / "Deposited" / "Cleared" (reserved, P20-driven, not a live P15 affordance). A Stripe-settled gift renders a distinct **non-actionable "Settles via Stripe" chip with NO deposit CTA** (prevents the payout double-count from ever being offered). Securities/in-kind → "No deposit needed." Reassignment copy states it is a _grouping change, not a money or receipt change_.

Deposit stays **OUT of the D3 hot-path grid** — rail + inspector only; at most an off-by-default read-only chip for power users (protects the ratified-as-hardened D3 frozen grid).

**Accessibility** [HD-13]: the build-list is a NEW selection surface, distinct from the D3 grid — reuse `DataTableResponsive` selection + the virtualization hook, NOT a new grid. Row checkbox `aria-label` names the gift ("Select $250 check from Jane Doe, batch GFT-2026-14"); tri-state select-all; selected count + running total via `aria-live`; 24px targets (WCAG 2.2 §2.5.8); deterministic focus after Create.

### D6.9 — The deposit slip and the P15/P20 seam [HD-12]

A printable **tagged-PDF + accessible-HTML** deposit slip:

- Header — tenant, bank account (label + last4), deposit date, reference / slip #.
- **CASH block** — denomination breakdown + subtotal.
- **CHECKS block** — itemized (check# · donor · amount), subtotaled.
- Grand total; prepared-by + timestamp.
- **Cash and checks are subtotaled SEPARATELY** (banks require this split).

The slip is aggregated donor-PII egress, so slip view / generate / export is gated on a distinct capability (`finance:manage_deposits`) and audited (reuse the P29 download-audit + signed-expiring-URL seam). Default to a **PII-minimized** variant (tender list + amounts; donor identity opt-in). No deposit refs, donor data, or check numbers in URLs.

**The seam is explicit:** Phase 15 owns the operational grouping workflow + the deposit-state axis + the SLIP artifact. **Phase 20 owns the GL** (undeposited-funds account, deposit-clearing journal entries) + the **bank-statement tie-out**. Phase 15 emits `deposit_groups` in a stable P20-consumable shape (`deposit_date`, `expected_total`, member ids + sum, status, reference) on the accounting-export boundary — it builds **zero** journal entries, GL, or bank-rec. This resolves the double-claimed "deposit reports" line (P15 vs P20).

### D6.10 — Observability [HD-14 as revised by CB-D]

Deposit signals fold into D5's ONE owned aged worklist / P8 data-health — no new surface. Three distinct signals, ALL **default-on and FULLY disable-able** (the founder chose max flexibility over a non-silenceable cash floor, CB-D; the always-on floor is dropped):

1. **Gift-side undeposited-aging** — "N gifts / $X undeposited > threshold" (threshold = tenant deposit cadence + a Reg CC grace; ~30-day backstop). Cash-undeposited aging is the strongest internal-control signal but, per CB-D, is disable-able like the rest — honest consequence recorded: a tenant that disables it loses its one automated skim-detection signal.
2. **Deposit-side orphan/underfill** — "group open / under `expected_total` after N days."
3. **Deposit expected-vs-assigned mismatch** — surfaced and preserved, never rewritten.

Each signal is tunable / snooze-able / disable-able. Phase 15 ships **NO** `cleared`-aging monitor (unresolvable without a bank feed → an always-red, unactionable dashboard; `cleared` + its aging = P20).

### D6.11 — Edge-case rules (pin each; one test-grid row each) [HD-2, HD-5, HD-6, HD-8, HD-16]

- **Attach-to-already-cleared/banked group** → the gift inherits the group's state (→ `deposited`); do not re-open the group.
- **Cross-tax-year deposit** → the deposit NEVER drives `gift_date` or `tax_year`; a check dated December can sit in a January deposit with its tax year unchanged (P13 dating resolver owns tax year).
- **Cross-currency / cross-account attach** → HARD reject (group homogeneity, D6.3).
- **Partial deposit** → legal open state; conservation stays soft (D6.5).
- **NSF after banking** → member stays, `returned = true`, money reverses append-only (D6.6).
- **Two-staff reassignment race** → single-claim compare-and-set (D6.6); property test required.

### D6.12 — Reserved seams (nullable columns, no engines) [HD-15]

- **RDC / check-scanner** — reserved integration seam, NOT a v1 build. The same-day path (V1) is **fully manual** with no scanner precondition. `external_deposit_id` reserved on `deposit_groups`; when RDC is built (later phase / P29 file seam), it only auto-fills ref/date/total.
- **Check / deposit images** — OPTIONAL attachments via the P29 ROW-grain file seam; deposit-state never requires an image; Phase 15 stores no binary.
- **`cleared_date`** — reserved-nullable (three-dates model); P20/NSF-driven, never hand-filled in v1. No EAV.

### D6.13 — Required tests + PRD congruence [HD-16]

**Test grid:** {V1–V6} × {check, cash, bank-direct ACH/wire, Stripe-card [assert excluded], Stripe-ACH [assert excluded], securities [`no_deposit`], in-kind [`no_deposit`]} × {deposit-before-entry, entry-before-deposit, same-day} × {1:1, N:1, 1:N reassignment}, plus: a two-staff reassignment race property test; reassignment-after-`deposited` and after-`exported` audit assertions; a schema test asserting **no** deposit FK on the batch table; a year-boundary `gift_date ≠ deposit_date` case; and an F1 assertion that a Stripe-rail tender's `deposit_group_id` write is DB-rejected.

**Congruence package** (fold into /to-spec — greenfield, not a data migration): retire P13's flat `deposit_reference` TEXT into `deposit_group` + `reference` (keep at most a free-text note fallback); reword P13's `recorded → deposited → cleared` narrative (story 106 / lines 762, 1270) so `recorded` = entry/posting (D5) and `deposited`/`cleared` = this D6 axis (one clearance truth, driven not duplicated); add the D4 `gift_method` **settlement_rail** discriminator (CB-A) so `ach` spans both rails but deposit-eligibility keys on rail, not method.

### D6.14 — Build order

D6 is a **post-commit operational layer**. It lands AFTER: (a) Phase 15's first build ticket — the minimal P13 posting substrate (headers / designation_lines / postings + effective_seq + immutability trigger + credit_recheck outbox, per the D5 build-order blocker), and (b) D5's posting-status / commit / one-owned-worklist machinery. The link lives on the header (needs the header to exist); deposit-state derives partly from posting + group status; the observability signals plug into D5's already-committed worklist. D6 is NOT on the critical path for the D3 grid or the D5 commit service — it can land as its own slice once the substrate + posting-status are green.

Within D6, build in amendment order: **schema + hard invariants first (HD-1 → HD-8)** → two-homes workflow + gestures + copy (HD-10, HD-11) → slip + a11y + security (HD-12, HD-13) → observability (HD-14) → reserved seams (HD-15), with the test grid + congruence (HD-16) spanning. The one sequencing gate — CB-A's `settlement_rail` discriminator — is already answered (reinstate it), so HD-5's DB eligibility predicate is unblocked.

### D6.15 — Cut list (binding "do not build")

Per the don't-over-engineer rider, the recon proved the OPPOSITE of "max flexibility = max configurability": ONE shape exercised three ways covers V1–V6. Cut, in v1:

- **N:M gift↔deposit junction table** — a scalar nullable FK is leaner and structurally forbids double-deposit.
- **Per-tenant "deposit mode" config** (per-batch / weekly / manual) — breaks V6 and re-welds the forbidden rigidity; only cosmetic tenant defaults survive (default bank account, reference-required flag).
- **Deposit-approval SoD engine** (requester ≠ approver on deposit ops) — grouping moves no money; reassignment is a low-ceremony audit-stamped action, NOT the AL-261 money-correction path.
- **Deposit templates + per-tenant deposit-numbering config.**
- **Bank-statement reconciliation / GL / undeposited-funds ACCOUNT / cleared-reconciliation engine** — P20 owns it; P15 emits the P20-consumable shape and stops.
- **`cleared`-aging monitor in P15** — always-red without a bank feed.
- **Operator-maintained `cleared` / `cleared_date` as a hand-filled field** — reserve, NSF/P20-driven.
- **Redundantly-stored `deposit_state` enum** — derive it; store only the `returned`/NSF flag.
- **Async ops-batch machinery for bulk assignment** — synchronous bounded UPDATE.
- **Full-table `(tenant_id, deposit_state)` btree** — partial index on the undeposited slice.
- **Deposit column in the D3 hot-path grid** — rail + inspector; optional off-by-default read-only chip only.
- **Scanner/RDC UI + P29 image storage inside P15** — row-grain P29 file seam only; same-day path fully manual.

### Repo anchors (context, not build instructions)

REAL (exists today): the composite `(tenant_id, id)` FK + RLS isolation idiom and the cooperative advisory-lock-in-one-DB-function pattern used across contribution tables; `DataTableResponsive` + `useDataTableVirtualization` + row-selection in the shadcn data-table library (reuse for the build-list surface); the AL-261 correction spine (`contribution_correction_requests` + `contribution_approval_policies`) that D6 explicitly does NOT route grouping through; the `contribution_operation_batches` async saga (the machinery D6 explicitly does NOT use for bulk assign); the donation saga/outbox (the pattern D5 receipts drain through); `crm_table_preferences` (personal column prefs, D7 neighbor); base-maia + Base UI + TanStack table v8 / query v5 / virtual v3.

FORWARD (groomed-not-built — cite owning phase): the P13 `contribution_headers` / `contribution_designation_lines` / `contribution_postings` ledger (zero SQL today; Phase 15's first ticket lands the minimal substrate; P13 ledger epic #690) — the deposit link column and `settlement_rail`/`returned`/`cleared_date` columns are added here; P13's flat `deposit_reference` (PRD narrative only, retired by D6); the P20 GL (undeposited-funds account) + bank-statement tie-out; P29 file/image storage + download-audit + signed-URL seam; RDC/scanner integration (reserved). The P15 tables — `deposit_groups`, `tenant_bank_accounts`, `deposit_assignment_events` — are new in this phase.

## S8 — Batch Templates (D7) and the Send-Acknowledgments Gate (NF3)

This section specifies two config-and-delivery layers riding on the batch workbench (S3), the commit contract (S5), and the deposit model (S6): **batch templates** (D7 — the tenant's saved column set, defaults, required-field policy, and which optional strictness policy applies) and the **Send-acknowledgments gate** (NF3 — the explicit per-batch human release that turns batch-origin donor-credit acknowledgments from "suppressed forever" into a deliberate, recallable send). Both are thin: D7 introduces no new runtime (its enforcement _is_ the commit chokepoint); NF3 adds exactly one trigger edge onto the existing acknowledgment pipeline. Neither touches the Phase 7 (Receipt & Statement Compliance) tax receipt.

Repo-anchor posture (evidence at authoring, never build instructions): the Phase 6 (Consent & Communication Preferences) email consent gate, the read-only table surface + dormant editable-grid seed, and the `contribution_operation_batches` migration are all **REAL** on disk (the last a different domain — operations over existing gifts). The Phase 13 (Contribution Ledger) header/lines/postings substrate and the Phase 14 (Donor Credit Operations) `contribution_credits` + acknowledgment columns + tribute/soft-credit/DAF generators are **FORWARD** (Phase 13 ledger epic; Phase 14 epic #719 — groomed-not-built). Every table this section introduces (`gift_entry_batches`, `batch_templates`) is **new to Phase 15**.

---

### S8.1 — D7 batch templates: the governing invariant (config frozen, safety live)

A `batch_templates` row is a tenant-owned, capability-managed record that controls, for a gift-entry batch created from it: **(1) the column set and order** shown in the entry grid (bounded — S8.4); **(2) default field values** — designation, source code, site, tender/`gift_method`, the gift-date resolver _mode_, receipt-disposition default, deposit behavior; **(3) the required-field policy** — a per-field three-state classification (S8.5); **(4) which optional strictness policy applies** — a _selection_ (not a definition) of the tenant's D2/D5 validation/approval policy objects.

The single design ruling that governs everything else — ratified as **D7 CB-1, "config frozen, safety live" (safety-forward)** — resolves the one omission the adversarial fleet named (D7 said "frozen snapshot" but never said frozen _by what_, nor where the boundary sits between presentation config and money-integrity policy):

- **FROZEN, by value, on the batch header at creation:** presentation + default values + required-field layout + column layout. A later template edit **never** mutates an existing in-progress or posted batch (the NPSP rule "changes don't affect records already saved"). Makes data entry predictable and kills dangling references.
- **LIVE, re-derived at commit against current tenant config, never frozen and never selectable:** the always-on money-integrity floor — D1–D6 invariants, the D2 control-total gate, the D5 high-risk auto-route + new-operator soft-guard, the Phase 7 receipt-eligibility evaluator, the tender's `settlement_rail`, the D6 deposit-eligibility predicate, and any _tightened_ approval policy. A tenant who tightens a control **protects even in-flight drafts** — the batch commits under the new live policy, not the stale frozen one.

Two invariants fall out and bind every implementer: **(1) a template can never subtract a control** — no template slot exists whose value can disable a structural predicate; a template SELECTS only _additional_ strictness on top of the floor (never makes an ineligible gift receiptable, disables the control-total gate, changes a `settlement_rail`, makes a Stripe-rail gift depositable, or bypasses the auto-post / high-risk model). **(2) Ledger truth always re-resolves live** — the designation default is frozen as a snapshot value for prefill, but Phase 13's gift-level `contribution_designation_lines` remain the sole money truth; a frozen designation ID since deactivated is **rejected at commit**. Reject both over-build alternatives: (a) freezing policy _contents_ by value / an immutable policy-version-row engine (forks evaluation, lets a stale draft dodge a tightened control); (b) resolving _defaults_ live (breaks NPSP predictability). A monotonic `revision` integer is kept as data (provenance/concurrency), **not** the safety-evaluation authority.

---

### S8.2 — The snapshot: by value, typed, self-contained, schema-versioned

At batch creation the template resolves into a **typed config struct copied onto the batch header** — never per gift row, no dedup or content-hashing (the snapshot is human-inspectable and is itself the point-in-time audit record that lets the versioning-UI cut stand). Rules:

- Each reference-typed default (designation, source code, site, tender) freezes as a **`{id, denormalized value/label}` struct**, not a bare FK — a later rename/deactivate of the referent cannot dangle or silently blank the snapshot.
- The snapshot carries a **`snapshot_schema_version`** integer + a forward-compatible reader (tolerate unknown fields, default missing). A CI test asserts every historical version still parses; enum-rename migrations sweep the snapshots.
- The template row carries a monotonic **`revision`** integer; the snapshot stamps **`template_revision`** (concurrency, provenance, snapshot-race determinism). Do **not** build a `batch_template_versions` history table — the per-batch snapshot _is_ the lean point-in-time record (reserve the table as a seam).
- The gift-date default is a **pointer to a Phase 13 resolver mode**, never a raw date — the resolver still runs per gift, preserving the D5 optional-postmark year-boundary nudge + `delivery_basis` stamping.
- The receipt-disposition default is **advisory only** — the Phase 7 evaluator always runs at post and wins; a template default may only be _more_ restrictive, never less.

---

### S8.3 — The HARD RULE as ONE invariant validator (save-time fail-closed + commit re-derivation)

The D7 hard rule is enforced in the service/DB layer, not the UI ("controls that are UI-only are not controls"). There is **one named invariant validator** running at two moments: **(1) template SAVE — fail-closed**, checking every default is legal for Phase 2 site↔source-code↔designation coherence, the required-field policy is a valid selection among governed options, tender ↔ deposit-behavior ↔ `settlement_rail` coherence (D6/CB-A), and the selected D2/D5 policy resolves (any failure blocks the save with a plain reason); **(2) batch COMMIT — re-derivation**, where the commit service (S5) **re-derives** receipt eligibility (Phase 7 evaluator wins), `settlement_rail`, deposit-eligibility, the control-total gate, and high-risk routing _from the actual gift facts_ (the snapshot supplies defaults/layout only, never an enforcement decision). The validator is not a new D7 build — the always-on floor + commit re-derivation **are the D5 commit-service chokepoint**; D7 adds only the template-SAVE half. "Required-field policy" is a **selection among governed options**, never a per-template rules DSL.

---

### S8.4 — Column set bounded by the D3 grid allowlist + restricted fields through projection

Taken literally, "template controls the column set" collides with the ratified-hardened D3 workbench (S3): the editable grid holds **only** common-path fields (donor, amount, designation, gift date, check/ref); exception fields (DAF, tribute, matching, splits, remittance sub-grid, new-donor) live in the non-modal row inspector under a spike-validated keystroke/latency budget. Resolution (**D7 CB-2, carried as confirmed**): the template controls **order + optional visibility WITHIN the D3 grid-eligible common-path allowlist only** — inspector-bound exception fields are **never** template-promotable to the hot-path grid, and column count is capped at the D3-frozen set. Column resolution runs **live per viewer** through the Phase 11 (field classification) + Phase 12 / Phase 10 projection chokepoint (effective columns = `template.columns ∩ viewer-visible fields`); a restricted field named in a template is **filtered** for a viewer lacking the permission — the template _requests_ exposure, never forces it. Ledger-truth and receipt-truth columns come from the **system field set only**.

---

### S8.5 — Required-field policy: the three-state enum, tender-qualified

Required-field policy is a per-field three-state classification, evaluated as `MAX(structural floor, template additions)`:

| State                 | Meaning                                                                                              | Template may require it? |
| --------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------ |
| `invariant_required`  | Structural floor — always required regardless of template (e.g. amount, designation).                | No — already required.   |
| `template_requirable` | A tenant template may promote it to required.                                                        | Yes.                     |
| `optional_by_design`  | A ratified design default made it optional; a template _may_ re-require it, **with a loud warning**. | Yes, with warning.       |

Two rulings bind: **(1) tender-qualification (D7 H3)** — a requirement is tender-scoped so a check-only required field (`check_number`) **never blocks cash rows**; the validator applies it per row against the row's tender (the invariant engine refusing an illegal write, **not** the cut "conditional-logic" feature). **(2) Postmark re-require (D7 CB-4, ALLOW-with-loud-warning)** — `postmark` is `optional_by_design` (D5 Mod4 made it optional + handles the tax-year boundary via the Dec/Jan nudge); a template MAY flip it to required, but the editor shows a loud plain-language warning and the year-boundary nudge persists regardless.

---

### S8.6 — Personal preferences: presentation-only overlay, never in the snapshot

Personal column preferences (reorder / hide / resize) layer on the shared template without touching it. Constraints (**D7 H6** — closes an un-escapable-dead-end BLOCKER): prefs touch **optional** columns only (template-required, `invariant_required`, and template-defaulted columns are **force-visible / un-hideable**, auto-revealed on promotion); **pref-hide is refused** for any required-without-valid-default column (otherwise a clerk can hide a column they must fill and dead-end the row); the D3 row inspector **always** exposes every field regardless of grid visibility, with one-click "Reset to template layout"; prefs are a **live view transform, never persisted into the frozen snapshot**. Prefs reuse the tenant's saved-table-preference precedent, keyed `UNIQUE(tenant_id, profile_id, template_id)`.

---

### S8.7 — Capability, seeded starters, soft-archive, never-null default

**Distinct capability (D7 H7).** Managing templates is a distinct capability, **`finance:manage_batch_templates`**, separate from `finance:record_contribution` — otherwise every entry clerk could rewrite the required-field policy and approval routing, defeating the D2/D5 separation-of-duties spine at the config layer. Editing the required-field or selected policy is an **audited config change** (actor + before/after diff). Non-managers get "Save as my personal layout" (prefs), not tenant-wide template creation.

**Seeded starters (D7 CB-3b / H8).** Three named starters ship — **Mail/Check**, **Sunday Cash**, **Church Remittance** (renamable, each with a "use this when…" line) — as **copy-on-provision, tenant-owned, editable/renamable/deletable** rows, plus exactly **ONE non-deletable "System Default"** so quick entry always resolves a config. Provisioning is idempotent **INSERT-ONLY-IF-MISSING** keyed `(tenant_id, seeded_from_starter_key)` and never updates/deletes a tenant row, so an Asym starter edit touches only future provisioning and never clobbers a customization. A `starter_version` stamp powers an opt-in "newer version" note (no merge/diff UI). Starters are authored against the Phase 13 `gift_method` / `settlement_rail` vocabulary with a CI seed test. Result: **no forced per-tenant migration.**

**Soft-archive + never-null default + policy fails closed (D7 H9).** Templates soft-archive, never hard-delete. An archived template cannot start new batches; archiving the current quick-entry default requires choosing a successor; **every tenant always has exactly one resolvable quick-entry default** (the seeded System Default is the fallback). If a selected policy is unresolvable at batch creation, the batch **fails closed to the tenant-default (strictest) policy + loud audit** — never fail-open to no validation.

**Stale-default detection (D7 H10, reuse not build).** A template default resolving to a deactivated reference drops to **empty with a plain-language note** at batch-create, warn-not-block, never prefilling invalid. A scheduled resolve-and-flag over active templates (reusing the D2/D5 evaluator + Phase 11 catalog lookups) feeds dead references into the D5-owned aged worklist / Phase 8 (Ops Observability) signal. No new drift engine.

---

### S8.8 — Authoring shape + a11y contract

**Authoring (D7 CB-3a / H11): "Save this batch as a template" + a thin list — NOT a builder studio.** Authoring is a single manager-gated "Save as template" action from a configured batch (captures column set + defaults + required policy + a name), plus a thin capability-gated list for rename / edit / archive. No abstract CRUD "studio," no wizard, no per-column permission matrix. Templates **select** D2/D5 policies; save-as-template never invents a new policy.

**Accessibility (D7 H12 — APG + WCAG 2.2, per D3's ratified bar):** **placeholder-as-default is FORBIDDEN** (WCAG 1.4.3 / 4.1.2 + money-misread hazard) — inherited defaults render as **real committed values** with a non-color "from template" cue + AT description, and typing flips to an AT-announced typed state with one-key revert-to-default. Required cells expose `aria-required` + a non-color marker from the frozen snapshot; empty-required errors name the field in plain language and scroll it into view (2.4.11). The picker is a proper combobox/listbox, **skipped when only one non-archived template exists** (else pre-select default/last-used, "Blank" one action away); **quick entry NEVER shows a picker**. Column reorder provides a **keyboard alternative to drag** + `aria-live` position (2.1.1 / 2.5.7); targets ≥24px (2.5.8). One inline note on in-progress/posted batches ("uses template settings from [date]; later edits won't change it") — **not** a versioning UI; on template save, offer an opt-in "re-apply latest defaults" for **still-draft batches only**.

---

### S8.9 — D7 tenant isolation, data model sketch, cut list, tests

**Tenant isolation as DB invariants (D7 H4).** Every reference-typed default column and the single policy-selector column on `batch_templates` use **composite `(tenant_id, target_id)` FKs** to parents carrying `UNIQUE(tenant_id, id)`; `batch_templates` is RLS-scoped (personal prefs reuse the already-RLS-scoped `crm_table_preferences`). Cross-tenant default becomes **DB-impossible**, not service-policed.

**Data model (new to Phase 15 — shapes, not final DDL; integer minor units, TEXT+CHECK enums):**

- **`batch_templates`** — `(tenant_id, id)` PK; `name`; `is_system_default BOOLEAN` (exactly one non-archivable per tenant); `seeded_from_starter_key TEXT NULL` + `starter_version INT NULL`; `snapshot_schema_version INT` (the template's own forward-compatible-reader column); `revision INT`; `column_config JSONB` (ordered allowlist-bounded keys + visibility); `default_values JSONB` (`{field → {id, value, label}}` + resolver-mode pointers); `required_field_policy JSONB` (per-field three-state enum, tender-qualified); `selected_validation_policy_id` composite FK (the ONE opt-in D2/D5 strictness/approval-policy selector — the AL-261-pattern policy object; the always-on invariant validator is never template-selectable; the batch header carries the effective `approval_policy_id` per S9, the template only supplies the default selection); `archived_at TIMESTAMPTZ NULL`; audit columns; RLS by tenant.
- **Personal column preferences** — REUSE the existing `crm_table_preferences` (REAL) verbatim, keyed per user+template (`UNIQUE(tenant_id, profile_id, template_id)`); presentation-only overlay JSONB; never in any batch snapshot — **no new prefs table** (ratified D7 H6).
- **`gift_entry_batches`** (owned by S3/S5; D7-relevant columns) — `template_snapshot JSONB` (carries `snapshot_schema_version` INSIDE the struct — never a separate top-level column here), `template_id` + `template_revision INT` (telemetry), `acknowledgments_sent_at TIMESTAMPTZ NULL` (NF3 display/audit stamp — S8.15).

**Cut list for D7 v1 (BINDING "do not build" — all six reviewers affirm):** conditional-logic DSL / show-field-if rules; per-template custom-field creation (the NPSP fragility — a template only _references_ the Phase 11 governed catalog); template-versioning UI; per-template numbering (batch numbers stay a tenant-level `GFT-YYYY-N` audit sequence). Also guard against: a policy-versioning / effective-dating engine; the `batch_template_versions` history table; a full builder "studio"; a starter merge/diff UI; snapshot dedup / content-hashing; a per-column-per-template permission matrix; a template "preview/simulate" sandbox; a required-field DSL.

**Test grid (D7 H13 — PRD acceptance, O4a–O4g):** (a) snapshot immutability under template edit/archive/delete across every batch lifecycle state; (b) **invariant-cannot-be-overridden fuzz** — no template config produces a committed gift violating any D1–D6 invariant; (c) render invariant — no prefs + required-field combo hides a required-without-default column; (d) **high-risk floor independence** of template policy selection; (e) snapshot-race determinism; (f) starter provisioning idempotency; (g) tender × `settlement_rail` × depositable matrix as a template default. Tests (b) and (d) gate the freeze-boundary + invariant validator — **red-before-green**.

**Build order (D7 has almost no standalone runtime).** Phase 13 posting substrate → D2/D5 policy objects + seeded defaults (the policy pointer needs valid targets) → the D3 grid contract spike-frozen (H5's allowlist is bounded by it) → schema-first D7 pieces land with `gift_entry_batches` (snapshot column, composite-FK isolation, the capability, soft-archive + never-null default, starter provisioning) → personal prefs after the grid → observability + the O4 grid span the phase.

---

### S8.10 — NF3 the Send-acknowledgments gate: the one governing sentence

The founder designed a third path (neither auto-suppress-by-size nor auto-send): **an explicit per-batch "Send acknowledgments" action, available after validation, that deliberately confirms intent to send acknowledgments for that batch** — the batch-level analog of Phase 14's entry-gated "the person entering decides." The governing sentence a builder must internalize:

> Batch-origin acknowledgment rows land in Phase 14's `held` state (reason `batch_gate_pending`) at commit; the explicit per-batch **"Send acknowledgments"** action is the human edge that flips this batch's `held` rows into Phase 14's _existing_ `pending_send → hold → consent-gate → sent/suppressed/failed` pipeline. NF3 adds **one trigger edge**, never a second send path, never a new state machine, and **never touches the Phase 7 tax receipt** (D5 Mod2 — unchanged).

"Acknowledgments" means the three Phase 14 donor-credit streams — **DAF advisor thank-you** ($0, not a tax receipt), **tribute notification**, and **soft-credit / matched-gift thank-you** (amount omitted) — never the Phase 7 tax **receipt**, a different document on a different rail whose individual occurrence may fire immediately only when Phase 7's frozen plan admits it (see S8.15).

---

### S8.11 — Where it lives: three mounts, one service, never the grid

Acknowledgment is a **post-commit, batch-grain** concern with **zero** presence in the D3 entry grid (protects the keyboard hot-path allowlist). Three surfaces, one `sendBatchAcknowledgments` service (mirrors D6's "both-homes over one service"): **(1)** the **posted-batch summary "Acknowledgments" panel** — the primary decision surface under D5 validate=post (manifest + action + live status + Results); **(2)** the **reconciliation-rail status card** — one glanceable card, **hidden during draft/validation**, appearing the moment the batch reaches `posted`, carrying the three-document-wall reminder (rail order: Posted → Receipts (Phase 7) → Deposit (D6) → Acknowledgments (NF3)); **(3)** the **Phase 8 "Unacknowledged" work view, batch-scoped** (anti-stranding) — a batch filter over Phase 14's existing partial-index query, **no new worklist**.

---

### S8.12 — The manifest (the pre-send confirm surface) and the one button

Clicking **Review →** (or the button's first press) opens a **non-modal side sheet** (keeps the batch visible, the D3 inspector idiom) titled "Send acknowledgments for this batch." The manifest _is_ the confirm surface (check-before-send). Four blocks:

- **Block A — headline sentence**, restate-with-specifics: "Send 44 thank-you acknowledgments now. 3 are held and will send when ready. 2 won't send. These are thank-you messages, not tax receipts — receipts already went out."
- **Block B — what's going out, by stream** (three streams max; zero-count streams hidden). Each row is a **disclosure** collapsed by default, expandable to the recipient list (name · email · the one gift · template · status chip), **projected per viewer** (S8.14). Columns: Ready now / Preparing / Scheduled.
- **Block C — held & won't-send, each with a plain reason — ALWAYS VISIBLE, never collapsed**: _Held (sends automatically when ready)_ — waiting on credit generation, or ambiguous attribution (deep-link to the Phase 14 Attribution Inbox); _Scheduled (not sent from here)_ — tribute notify-parties on a monthly/decay cadence (the gate un-gates only the immediate first notice, never overrides donor-set cadence); _Won't send_ — `do_not_contact` / tribute `never` / no email on file.
- **Block D — one rendered sample per stream + template-variable health** (ADJ-8): a **broken required variable** moves that row to **held** — **never a blank thank-you**, and **never blocks the rest of the batch**; a **maybe-intentional blank** shows a loud warning but is sendable.

**The confirm — ONE confident action** (D5's ratified "one per-batch confirm, never per-row"): the single button **names the action + count**, never "OK" / "Are you sure?": **"Send 44 acknowledgments"** — the count is **live** (excluding a recipient or a not-yet-ready stream updates it); Send lives at the bottom of the sheet (one surface, one button, no second dialog); the dismiss control is **"Not yet"**, spatially separated, leaving the batch in `held`. **Per-stream send is a consequence of readiness, not a mandatory toggle** (ADJ-1 + ADJ-7): a ready stream (DAF) carries its own "Send these now" so a staffer needn't wait on a preparing stream; pressing the one button (sends everything ready) is the blessed default. **Per-recipient control is opt-in only:** expanding a Block B stream gives each recipient an **Exclude** affordance writing `do_not_acknowledge` _for this gift_, audited and persistent (reviewing zero recipients is first-class). **Friction budget:** exactly **one deliberate acknowledgment decision per batch** (or per quick-entry gift), never per row, never per type; the one hard safety beat is the recall window (S8.13), not the dialog.

---

### S8.13 — Per-stream readiness, send execution, and the recall window

**Per-stream ack-readiness (the one genuinely new dependency).** Which acks even _exist_ depends on the stream, because the grid never writes credit rows — attributions are capture-input that _generate_ `contribution_credits` asynchronously. The **DAF advisor thank-you** credit is minted **synchronously in the posting transaction** (ready the instant the batch posts); **tribute notifications** and **soft-credit / matched-gift** depend on **async** generators that may not exist at post time → "Preparing" until they drain. Derive a per-stream, per-batch readiness state (`Preparing / Ready / Scheduled`) from credit-generation completeness, **reusing the Phase 8 credit-generation-drift signal** — a derived check, no new table. **Never hold the whole batch hostage to one stalled generator:** the button enables ready streams and leaves not-yet-ready streams "Preparing"; they resurface and re-arm when they drain. The idempotent enqueue keyed `(header, notify_party, stream)` guarantees "send what's ready + sweep late rows later" can never double-send or strand.

**Send execution — enqueue, recall, drain (undo > interrogation).** Pressing **Send** enqueues this batch's ready `held` acks onto the existing durable outbox — no new pipeline.

- **Enqueue (sync, fast, idempotent):** in one transaction, flip eligible `held` rows to `pending_send` and write **one outbox event per `(tenant, header_or_settlement, notify_party, stream)`** — the exactly-once anchor (mirrors Phase 14's tribute `UNIQUE(tenant, tribute, notify_party, period_key)`). Events carry `eligible_at = now + recall_delay` (tenant-lowerable to 0); the action returns "queued" immediately.
- **Recall window (the safety spine — the batch-grain expression of Phase 14's ~10-min hold, same mechanism as D5 Mod2's donor-invisible receipt catch-window):** the card shows "Sending 44 in 4:58 · [ Recall ]"; one click flips not-yet-drained events back to `held` (idempotent; already-`sent` rows can't be recalled) — the fat-finger / wrong-batch rescue **without a scarier dialog** and **without touching gift dates or the tax receipt**. Per-recipient Phase 14 holds still apply underneath.
- **Drain (async, throttled, dead-lettered — the shipped D5 outbox pattern):** the existing per-tenant drainer claims ack events exactly as receipt events. Each runs: **readiness check → Phase 6 consent gate (fail-closed) → render → `sendEmail` (sole email seam) → write the Phase 6 `acknowledgment` event + audit tuple → settle `sent`.** Consent-blocked → `suppressed` (visible); transient throw → retry; **5 attempts → `dead_letter`** (surfaced in Results + the Phase 8 signal). The **tribute** stream keeps its own Phase 14 exactly-once fan-out — the gate _un-gates_ the immediate first notice rather than re-implementing delivery.

**Live status → Results view.** The card shows live progress ("Sending… 12 of 44 sent" → "✓ 42 sent · 2 couldn't send"), then a **Results** view on the read-only table surface with per-recipient outcomes — sent (timestamp + template), held, suppressed (reason), failed (reason + one-click **Retry** / **Retry all failed**). Partial failures are never silently stranded; dead-letters appear here and in the Phase 8 worklist.

---

### S8.14 — Quick-entry, restricted parties, consent classification, re-send

**Quick-entry (batch of one) — the inline line (ADJ-4, resolves the NF3 loose-thread).** D1 hides "batch" from casual staff; a one-gift send needs no manifest. For quick entry there is **no sheet and no rail card**; the acknowledgment rides **inside D5's single post-commit confirm** as **one conditional line, shown only when the gift actually generates an acknowledgment**: "☑ Also send the thank-you to _Jane Advisor_ (DAF advisor acknowledgment)." Checked by default when identity confidence is high (Phase 14's "the person entering decides"); uncheckable in the same breath; absent if the gift generates no ack; the recall window still applies underneath. A single deliberate quick-entry tribute/DAF gift is thus **not silently suppressed** — the entry _is_ the decision, made explicit.

**Restricted parties (Phase 10, ADJ-3 — the safer resolution).** The manifest is projected per-viewer through the same Phase 11/Phase 10 chokepoint as the D3 grid. Hard rule: **absence must not leak existence, and counts must reconcile.** A restricted recipient's row is **absent** from a non-cleared viewer's manifest and counts reflect only that viewer's visible set (they see "Send 44," never "47 with 3 hidden"). **Restricted acks are gated to a cleared actor:** if the acting staffer lacks clearance, those acks **remain `held`**, are not sent, and surface only in a cleared viewer's manifest + the Phase 8 work view — the actor who sends must be one who could see them.

**Consent classification (Phase 6 — the one decision NF3 must state).** All three ack streams classify as **`transactional`-grade relational, NOT marketing** — each is a relationship-bound response to a specific gift. Via the shipped consent matrix they **bypass marketing opt-out** (`do_not_email` / `unsubscribe`) but **always respect** `do_not_contact` + hard suppressions (`bounce` / `spam` / `manual`) and tribute `never` (independently). The gate stays **fail-closed**: undeterminable consent → the row stays `held` / retryable, **never sent on a guess**; every suppression is a visible "won't send" line. The gate is unchanged — NF3 only supplies the classification.

**Re-send (escape valve, not a re-blast).** A `sent` ack can be re-sent to **one** recipient from Results via Phase 14's correction-notice idiom with a fresh idempotency salt, audited — distinct from the idempotent batch action so a bulk re-press can never double-thank. **No bulk "re-send whole batch."**

---

### S8.15 — NF3 state model, the P14 amendment, the 7th P8 signal

**State model — reuse Phase 14, derive the rollup, no new tables.** Per-gift / per-recipient state is Phase 14's verbatim: `acknowledgment_status ∈ {not_applicable, held, pending_send, sent, suppressed, failed}` + `acknowledgment_hold_until`. NF3 adds **no** per-recipient state; it changes exactly one thing — **batch-origin rows land in `held` (reason `batch_gate_pending`) at commit**, not `suppressed`-forever. Ack state is always the audit tuple _acknowledged-with-template-X-on-date-Y_, never a bare boolean. The **batch-level rollup is a DERIVED enum** (`preparing / ready / partially_sent / sent / none_applicable`) via `GROUP BY acknowledgment_status` over the batch's headers on the Phase 8 partial-index work view — **no stored batch enum to drift.** One optional `acknowledgments_sent_at` stamp is display/audit only.

**Late-arriving delta (ADJ-6).** A posted batch is immutable (D5) — new gifts go to a new batch or the D5 follow-on (its own ack gate). What re-arms the panel is **late-generated credits** (async soft-credit/tribute rows) and **Mod3-correction acks** (a compensating correction changing the attributed party generates a Phase 14 correction-notice ack). These land `held`; the panel shows the delta only ("3 more ready — Send 3"); already-`sent` rows are untouched (idempotency). **Invariant:** the button is a pure function of _"how many held+ready acks haven't been sent?"_ — always safe to press, always sends only what hasn't been sent.

**The Phase 14 amendment (a congruence-package reword, not a P15 build).** Phase 14 currently reads that batch/import-origin rows _"suppress auto-send."_ NF3 rewords: at commit they land `held` (`batch_gate_pending`) and the explicit per-batch gate releases them (imports stay `held` for a Phase 30-surfaced gate; **nothing auto-sends** — suppression of _auto_-send is preserved, a deliberate human release added). Touches: the Phase 14 "Phase 15 named contracts" clause + D2 guardrail 8; the Phase 14 Data Model note (record `batch_gate_pending` — **no new column**, reuses `acknowledgment_status` + `acknowledgment_hold_until`); a D5 log annotation (tax-receipt half unchanged).

**The 7th Phase 8 data-health signal — `acknowledgments-pending-past-N-days`** — derived over the existing Phase 8 "Unacknowledged" partial index: counts acks in `held` (esp. `batch_gate_pending`) or `failed` / `dead_letter` older than a tenant-configurable N (default ~7 days), so a dead generator or an abandoned batch **self-reports.** Defaults on, tunable / snooze-able / disable-able like every Phase 8 signal.

**Tax-receipt path UNTOUCHED (confirm).** NF3 never touches, re-fires, conflates, or delays the Phase 7 tax-receipt decision (D5 Mod2: frozen plan first, then post for settled tenders or `succeeded` for ACH), and the acknowledgment send **never writes receipt records** (an explicit three-document-wall test assertion).

---

### S8.16 — NF3 cut list and buildability checklist

**What NF3 deliberately does NOT build (anti-over-engineering rider — BINDING):** no new send pipeline/queue/state machine (reuse the D5 outbox + Phase 6 gate + email seam + Phase 14 columns + tribute Inngest anchor + Phase 8 work view); no mandatory per-type send toggles; no mandatory per-recipient review; no bulk "re-send whole batch"; no approval workflow / second-approver on the ack send (acknowledgments are relational thank-yous, not money movement — the button + recall window is the whole control; money-OUT keeps its D5 SoD); no unsend/void machine (a wrong thank-you is a low-stakes email — remedy is a manual note; formal void is a tax-receipt concept); no template authoring in the gate (Phase 17 / D7); no scheduler / drip / journey (send-now + recall covers it; tribute cadence rides the Phase 14 decay scheduler); no import-origin ack UI (reserve the Phase 30 seam; import rows stay `held`); no ack analytics / open-tracking (Phase 33); no printable/CSV manifest report in v1 (fast-follow); no cross-batch "send all pending everywhere" super-action.

**Buildability checklist (the distinct new builds a ticket-writer inherits):** (1) one `AcknowledgmentsPanel` / `Card` component with three mounts (summary panel, D3 rail card, quick-entry inline line); (2) the pre-send manifest Sheet (Blocks A–D, per-viewer projection, template-variable validation); (3) the derived batch-rollup query (partial index over Phase 14 `acknowledgment_status` by `batch_id`; optional `acknowledgments_sent_at` stamp; no stored enum); (4) the `sendBatchAcknowledgments` service (flip ready `held`→`pending_send` + enqueue outbox events keyed `(tenant, header/settlement, notify_party, stream)` with `eligible_at = now + recall_delay`; idempotent; capability-gated via a Phase 12 finance capability; restricted acks gated to a cleared actor; **Recall** = flip not-yet-drained events back to `held`); (5) the ack-readiness derivation off the Phase 8 credit-generation-drift signal; (6) the drainer ack-event handler on the reused D5 outbox; (7) the Results view on the read-only table surface (Retry / Retry-all-failed); (8) the Phase 8 signal `acknowledgments-pending-past-N-days` + batch-scoped filter; (9) the Phase 14 amendment (S8.15) + the warning/success semantic tokens D5 mandates (none exist today — raw emerald/amber ad hoc).

**Test grid:** idempotent double-press; recall-then-resend; late-credit delta send-once; consent-suppressed visibility; tribute `never` + cadence "Scheduled"; restricted-projection manifest correctness + count reconciliation + cleared-actor gating; readiness-partial send-and-sweep; dead-letter surfacing; quick-entry inline line present/absent; the **three-document-wall assertion (the ack send never writes the tax-receipt records).**

**Counsel gate (mirrors the decided TEL gate):** the copy this gate releases is relationship-bound and, for DAF advisor letters, tax-adjacent ($0, "not a tax receipt" language); the Phase 15 finance/tax counsel review covers DAF advisor letter language and tribute/notification wording before the relevant ship boundary.

## Data Model, Module Interfaces & Ownership-Matrix Extension

Phase 15 (Offline Gift & Batch Entry) adds the **gift-entry staging substrate** (the batch header, its staged rows, per-tender detail extensions, the validation-run objects, the deposit-grouping layer, and the phone-gift authorization records) that transforms into the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) ledger at commit. Nothing in this phase is a parallel money store: staged rows are **pre-commit inputs**; the single atomic commit service is the only thing that ever writes offline money, and it writes it as Phase 13 `contribution_headers` / `contribution_designation_lines` / `contribution_postings`. This section enumerates every new table with key columns and constraints, states the ~25 Postgres-enforced invariants, defines the five module interfaces, and extends the Phase 1 (Source-of-Truth Ownership Matrix) with a system-of-record / write-path / conflict-winner / repair-path row per new record type.

### House rules (restated once, bind everywhere below)

Plural snake_case names; `tenant_id UUID NOT NULL` with **no default**; parent `UNIQUE (id, tenant_id)`; children reference parents by **composite same-tenant FK** `(tenant_id, parent_id)`; **FORCE ROW LEVEL SECURITY** on every new table; closed sets are **TEXT + CHECK, never native Postgres enums**; money is **integer minor units** (`_minor BIGINT`); every new table registers a fail-closed Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census row and is named in the Phase 10 (Sensitive Data Safety) export-governance inventory. Per the fresh-build posture (no users, correct-from-start), **every identity / uniqueness / exclusivity / tenant-FK constraint ships in the first migration**, before any commit path runs. Spec rows read `column — type — constraint — [provenance]`.

### Repo anchors — REAL vs FORWARD (context only; not build instructions)

**REAL today** (cite as precedent / reuse seam): the dormant editable-grid seed `packages/ui/components/shadcn/data-grid/` (TSV clipboard + undo/redo, no arrow-nav/roving-tabindex — parts, not architecture); the read-only `packages/ui/components/shadcn/data-table/` (`DataTableResponsive`, `useDataTableKeyboard`, `useDataTableVirtualization`); the Contributions hub `apps/admin/app/contributions/` (`main-body.tsx`, `operation-shell.tsx`, `correction-approval-panel.tsx`, the single-gift offline-gift dialog under `offline-gift/`); the offline zod schema `packages/api/src/schemas/contributions-offline.ts` (salvage field shapes) + the receipt-status resolver `resolveOfflineReceiptStatus` in `packages/api/src/admin/contributions/offline-logic.ts`, and its 501 bridge `packages/api/src/admin/contributions/offline-dependencies.ts` (`OfflineEntryUnboundError` — **deleted slice one**); the donation saga/outbox `packages/api/src/donate/` (`saga.ts`, `outbox.ts`, `payment-intent.ts`, `idempotency.ts`); the fail-closed consent gate `packages/api/src/email/consent.ts`; `contribution_approval_policies` + `contribution_correction_requests` (migration `20260611120000`); `contribution_operation_batches` (migration `20260526202500` — bulk ops over EXISTING gifts, a distinct domain, generic infra reusable, state machine NOT shared); `crm_table_preferences` (migration `20260611160000` — the personal-column-prefs precedent); the durable `stripe_raw_events` ledger + replay; the party resolver `resolveDonorMatch`.

**FORWARD (groomed-not-built, named owner)** — the first P15 build ticket lands the substrate these depend on: the Phase 13 `contribution_headers` / `contribution_designation_lines` / `contribution_postings` ledger, `effective_seq` cursor, the BEFORE-UPDATE posting-immutability trigger, and the `credit_recheck` outbox event (**zero SQL today; Phase 13 epic #690 blocked**); the Phase 14 (Donor Credit Operations) `contribution_credits` + acknowledgment machinery (`acknowledgment_status` / `acknowledgment_hold_until` on the header, tribute / matching / DAF objects — **epic #719, unbuilt**); `tenant_bank_accounts` and every P15 table below (net-new).

---

### `gift_entry_batches` — the batch header & lifecycle spine [D1, D2, D5]

One row = one gift-entry batch (a single gift = a batch of one under D1's one-front-door; quick entry auto-creates a one-row batch and hides the word "batch"). The batch is a **draft container** until commit; it holds control totals, the frozen template snapshot, the lease, the actor stamps, and the escape-valve linkage — it never holds money postings.

```
gift_entry_batches
- id — uuid PK — default gen_random_uuid(); UNIQUE (id, tenant_id) — [D1]
- tenant_id — uuid NOT NULL — no default; FORCE RLS — [house]
- batch_number — text NOT NULL — per-tenant audit sequence (GFT-YYYY-N); UNIQUE (tenant_id,
  batch_number); tenant-level, never per-template (D7 cut) — [D7]
- status — text NOT NULL — CHECK ∈ {draft, validated, awaiting_approval, posted, partially_posted,
  voided}; the ONE state machine (D5). No separate 'finalize'; terminal = posted/committed; 'export'
  is reserved to Phase 20 (Accounting Export) + the D6 deposit-'exported' regime — [D2, D5]
- is_quick_entry — boolean NOT NULL DEFAULT FALSE — batch-of-one skin; expected totals auto-derived — [D1]
- revision — integer NOT NULL DEFAULT 0 — monotonic; any material row/header edit bumps it and
  invalidates validation + approval — [D2]
- expected_count — integer NULL — operator-entered control total (count); enterable any time before
  commit — [D2]
- expected_total_minor — bigint NULL — operator-entered control total (money); the CASH-tender subset
  only (non-cash tenders tally separately, A6) — [D2, D4]
- validated_revision — integer NULL — the revision the current validation pass certified; commit
  accepts ONLY this token as HEAD — [D2]
- approval_policy_id — uuid NULL — composite FK (tenant_id, approval_policy_id) →
  contribution_approval_policies (REAL); NULL = tenant-default auto-satisfied (validate=post) — [D5]
- approved_revision — integer NULL — set when the approval gate is satisfied; commit re-checks — [D2]
- control_total_override — jsonb NULL — a governed override record: {overrider_id, reason,
  frozen_expected_count, frozen_expected_total_minor, at}; the ORIGINAL expected totals are frozen
  FOREVER (fixes CiviCRM audit-erasure); presence requires the distinct override capability — [D2]
- routing_outcome — text NULL — CHECK ∈ {auto_posted, high_risk_review, new_operator_review}; the
  risk-scored pre-post routing result (D5 high-risk auto-route + new-operator soft-guard) — [D5]
- template_id — uuid NULL — composite FK (tenant_id, template_id) → batch_templates; provenance — [D7]
- template_revision — integer NULL — the template revision snapshotted (H2 provenance/race) — [D7]
- template_snapshot — jsonb NULL — the CONFIG-FROZEN typed struct (columns/defaults/required layout),
  {id, denorm value, label} per reference; snapshot_schema_version inside; SAFETY is NEVER here — [D7]
- claimed_by — uuid NULL — the single-active-editor lease holder; short-TTL heartbeat; loud audited
  takeover; a second opener is read-only + "Take over" — [D3]
- claimed_heartbeat_at — timestamptz NULL — lease liveness — [D3]
- carried_from_batch_id — uuid NULL — composite self-FK; the escape-valve linked-follow-on parent — [D5]
- frozen_carried_expected_minor — bigint NULL — the conservation remainder carried into this
  follow-on draft (never re-derived from carried rows) — [D5]
- acknowledgments_sent_at — timestamptz NULL — a display/audit STAMP only (NF3); NOT the ack source
  of truth (that is derived from P14 per-row state) — [NF3]
- created_by / created_at / posted_by / posted_at — uuid / timestamptz — the immutable actor stamps
  (detective-control floor; posted_by ≠ approver where SoD applies) — [D5]
```

Batch numbering, lifecycle, control-total posture, and the escape-valve state machine are S-section prose; the SQL floor is above.

### `gift_entry_batch_rows` — the staged-row model [D1, D3, K]

One row = one pending gift, edited in the D3 workbench grid + inspector. This is the **pre-commit input** the commit service transforms into a Phase 13 header + designation line(s) + posting(s). Shaped as proto-P13 so commit is a **promotion, not a remap**. Rows carry a client-generated UUID so autosave is an idempotent UPSERT and undo/focus never key on array index (the seed's load-bearing defect).

```
gift_entry_batch_rows
- id — uuid PK — default gen_random_uuid(); UNIQUE (id, tenant_id) — [house]
- tenant_id — uuid NOT NULL — FORCE RLS — [house]
- batch_id — uuid NOT NULL — composite FK (tenant_id, batch_id) → gift_entry_batches — [D1]
- client_row_id — uuid NOT NULL — UNIQUE (tenant_id, batch_id, client_row_id); the autosave
  idempotency anchor (at most one in-flight save/row; stale retries rejected) — [D3]
- row_seq — integer NOT NULL — per-row edit sequence; monotonic; stale writes rejected — [D3]
- donor_party_id — uuid NULL — composite FK (tenant_id, donor_party_id) → party spine; resolved via
  the ONE resolver-backed search (never a bespoke query) — [D3, I]
- pending_new_donor_id — uuid NULL — composite FK → a per-batch pending-new-donor entity; an
  inline-created donor is immediately matchable in the next row (read-your-writes) — [D3, I]
- is_anonymous — boolean NOT NULL DEFAULT FALSE — loose-plate / house-Anonymous cash pattern
  (nullable donor snapshot + flag; no receipt; counts to control total) — [Y]
- amount_minor — bigint NULL — integer cents; strict parser (reject-never-coerce; parseFloat||0
  BANNED); NULL only while draft-incomplete — [D3]
- gift_method — text NOT NULL DEFAULT 'check' — CHECK ∈ the P13 gift_method SUBSET {card, ach, check,
  cash, wire, securities, in_kind, church_remittance, crypto, vehicle, real_estate}; P13 is the single
  vocab source; 'moto' is NOT a method (a phone card gift is 'card') — [D4]
- settlement_rail — text NOT NULL — CHECK ∈ {bank_direct, stripe_rail}; the deposit-eligibility
  discriminator (CB-A); ach spans BOTH rails, eligibility keys on rail not method — [D4, D6]
- designation_intent — jsonb NOT NULL — the pre-commit designation(s): each {fund_id XOR
  missionary_id, amount_minor, frozen label}; re-resolved LIVE at commit (a dead frozen id is
  rejected) → becomes contribution_designation_lines — [D7, L]
- gift_date — date NULL — resolver-suggested, never a raw template default; no global today-default
  for date-sensitive tenders (cash defaults received=today only) — [D4, D5]
- delivery_basis — text NULL — CHECK ∈ {postmark, received, settlement}; STAMPED by the dating
  resolver, never silently recomputed (optional-postmark fallback) — [D5, X]
- tax_year — integer NULL — resolver output; the Dec/Jan boundary nudge governs it — [D5, X]
- tender_details_id — uuid NULL — composite FK → offline_tender_details / noncash_gift_details /
  phone_gift_links (discriminated by gift_method) — [D4]
- row_validation_status — text NOT NULL DEFAULT 'unvalidated' — CHECK ∈ {unvalidated, clean,
  clean_async_pending, error}; per-row rollup feeding the escape-valve three-state carry — [D5]
- deposit_group_intent — uuid NULL — an OPTIONAL pre-assignment hint; the authoritative link lands on
  the P13 header post-commit (D6), never here as truth — [D6]
- committed_header_id — uuid NULL — composite FK → the P13 header this row promoted into; set once,
  in the commit txn; the row is thereafter historical — [R]
- created_by / created_at / updated_at — uuid / timestamptz — each saved revision stamps actor +
  changed-field diff as the audit grain (no keystroke logging) — [D3]
```

### `offline_tender_details` — check / cash / bank-direct tender facts [D4, X]

The tender extension for settled-on-entry money tenders. Check is first-class: `check_number` + optional postmark/received dating; cash carries received-staff + deposit reference.

```
offline_tender_details
- id / tenant_id — uuid — house; FORCE RLS
- batch_row_id — uuid NOT NULL — composite FK (tenant_id, batch_row_id) → gift_entry_batch_rows — [D4]
- check_number — text NULL — first-class; a duplicate check_number raises a NON-blocking warning
  (within-batch + bounded cross-batch lookback), never auto-blocks — [J]
- postmark_date — date NULL — OPTIONAL (D5 Mod4); drives delivery_basis=postmark when present — [D5]
- received_date — date NULL — the defensible fallback basis — [X]
- receiving_staff_id — uuid NULL — cash accountability — [X]
- deposit_reference — text NULL — free-text capture at entry (superseded as truth by deposit_groups) — [D6]
```

### `noncash_gift_details` — ONE generic noncash extension [D4 A2/A9]

One shape serves securities, in-kind, crypto, vehicle, real-estate (instances distinguished by `gift_method` + duty flags) — **not five lanes, not seven tables**. Financial facts are append-only; Phase 20 reads, never migrates.

```
noncash_gift_details
- id / tenant_id — uuid — house; FORCE RLS
- batch_row_id — uuid NOT NULL — composite FK → gift_entry_batch_rows — [D4]
- asset_type — text NOT NULL — CHECK ∈ {securities, in_kind, crypto, vehicle, real_estate} — [D4]
- description — text NOT NULL — the described-never-valued narrative — [D4]
- quantity — numeric NULL — units/shares (fractional allowed) — [D4]
- recognized_value_minor — bigint NULL — the POSTING money = FMV at gift date for securities, and
  HARD 0 for in_kind (describe-never-value schema invariant) — [D4]
- value_basis — text NULL — a provenance LABEL (e.g. broker-stated), no per-method calculator — [D4]
- internal_valuation_minor — bigint NULL — donor-stated/book estimate; STRUCTURALLY unreachable by
  receipt / acknowledgment / export / posting paths (P7 value-wall extended) — [D4]
- transfer_or_received_date — date NOT NULL — the gift date, distinct from any sale date — [D4]
- document_ref — uuid NULL — a nullable pointer the Phase 29 (Files) seam later resolves; P15 stores
  NO binary — [D4]
- disposition_duty — text NULL — CHECK ∈ {form_1098c, qualified_appraisal, form_8283, none}; the
  per-asset duty flag raising a Phase 8 signal (vehicle→1098-C; crypto/RE→appraisal >$5k) — [D4]
- liquidation_status — text NOT NULL DEFAULT 'not_applicable' — CHECK ∈ {not_applicable, pending,
  partial, settled}; batch-finalize is decoupled from money-settlement — [D4]
```

### `gift_disposition_facts` — proceeds, non-contribution [D4 A4]

Append-only liquidation facts for securities/noncash. **CI-gated out of every money aggregate** exactly as Phase 14 gates credits — a disposition row can never emit a posting.

```
gift_disposition_facts
- id / tenant_id — uuid — house; FORCE RLS
- header_id — uuid NOT NULL — composite FK → the committed P13 header (reachable only FROM an existing
  securities/noncash gift, never from "new gift") — [D4]
- fact_kind — text NOT NULL — CHECK = 'non_contribution' — the CI tripwire; a schema lint asserts it — [D4]
- sale_date — date NULL — structurally distinct from gift_date — [D4]
- gross_proceeds_minor / fees_minor / net_proceeds_minor — bigint — append-only; Phase 20 reads — [D4]
- created_by / created_at — uuid / timestamptz — append-only; no UPDATE/DELETE path — [D4]
```

### `deposit_groups` + gift-grain link + `deposit_assignment_events` + `tenant_bank_accounts` [D6]

The undeposited-funds spine. Deposit-state is the **sixth orthogonal operational axis** formalizing Phase 13's narrative recorded→deposited→cleared and RETIRING P13's flat `deposit_reference`. The link is a **gift-grain scalar nullable column on the mutable P13 header** (never batch-grain, never a junction table, never on immutable postings); reassignment is an append-only event log. Deposit-state is **derived**, not stored (only the returned/NSF flag is stored).

```
tenant_bank_accounts (FORWARD, net-new)
- id / tenant_id — uuid — house; FORCE RLS
- label — text NOT NULL — the human name — [D6]
- last4 — text NULL — bank identity is (label,last4,currency) ONLY; NEVER full routing+account — [D6]
- currency — text NOT NULL — single-currency homogeneity source — [D6]

deposit_groups (FORWARD, net-new)
- id — uuid PK — UNIQUE (id, tenant_id) — [D6]
- tenant_id — uuid NOT NULL — FORCE RLS — [house]
- bank_account_id — uuid NULL — composite FK (tenant_id, bank_account_id) → tenant_bank_accounts;
  single-account + single-currency invariant per group — [D6 HD-5]
- deposit_date — date NULL — inline-editable; may PRECEDE its gifts' entry (V2 deposit-first) — [D6]
- reference — text NULL — slip/deposit reference — [D6]
- expected_total_minor — bigint NULL — operator-entered bank figure, FROZEN once set; SOFT
  reconciliation aid + live actual + persisted variance, NEVER a hard gate (independent of the D2
  entry control total) — [D6 HD-6, CB-F]
- regime — text NOT NULL DEFAULT 'open' — CHECK ∈ {open, exported}; the TWO-regime ladder (CB-C) —
  open=free add/remove/reassign, each audit-stamped, right up until P20 export (an open group whose
  slip was printed or that was physically banked STAYS membership-editable — physical banking never
  freezes it); exported=Phase 20-consumed, compensating-correction-only (P15 cannot mutate). NOTE:
  'deposited' is a DERIVED/stamped property of the group's members + whether a slip was printed, NOT a
  stored regime value; a printed deposit slip is a separate RETAINED IMMUTABLE SNAPSHOT artifact, not a
  regime — [D6 HD-8, CB-C]
- status — text NOT NULL DEFAULT 'active' — CHECK ∈ {active, voided}; void-not-delete for non-empty
  groups (actor+reason) — [D6]
- created_by / created_at — uuid / timestamptz

deposit_assignment_events (FORWARD, net-new; APPEND-ONLY)
- id / tenant_id — uuid — house; FORCE RLS
- header_id — uuid NOT NULL — composite FK → the P13 header (the gift being assigned) — [D6]
- from_deposit_group_id — uuid NULL — composite FK → deposit_groups — [D6]
- to_deposit_group_id — uuid NULL — composite FK → deposit_groups — [D6]
- actor_id — uuid NOT NULL / reason — text NULL / at — timestamptz — full from→to history — [D6 HD-2]

contribution_headers — Phase 15 extension columns (on the P13 header)
- deposit_group_id — uuid NULL — composite FK (tenant_id, deposit_group_id) → deposit_groups; ≤1
  deposit per gift (scalar forbids double-deposit); on the MUTABLE header, not postings — [D6 HD-1]
- deposit_returned — boolean NOT NULL DEFAULT FALSE — the ONLY independently-stored deposit datum
  (NSF/returned); a bounced check STAYS a member (state→returned) — [D6 HD-3]
- settlement_rail — text NOT NULL — CHECK ∈ {bank_direct, stripe_rail}; DB REJECTS any deposit_group_id
  write when settlement_rail='stripe_rail' (fixes the F1 payout double-count) — [D6 HD-5]
```

Derived deposit-state (a computed view, NOT a stored enum): `undeposited` / `in_open_deposit` / `deposited` from link + group `regime`; `settles_via_payout` and `no_deposit` are tender-derived terminals; `cleared` is RESERVED, Phase 20-driven, never stored/aged in P15.

### `phone_gift_links` + `phone_payment_authorizations` — the native embedded Stripe lane [D4 A7/A8/A16-A18]

A phone card/ACH gift is an **online gift the Stripe webhook writes** (never an offline money row; never inflates the control total). The workbench dispatches + tracks + links; Asym renders/stores/logs **zero raw card or bank data** (the PAN/account number transits browser→Stripe iframe only). Asym persists only the records Stripe does not keep.

```
phone_gift_links (FORWARD, net-new)
- id / tenant_id — uuid — house; FORCE RLS
- batch_row_id — uuid NULL — composite FK → gift_entry_batch_rows (dispatch origin) — [D4]
- payment_intent_id — text NULL — the Stripe PI reference (auto-link key via PI metadata:
  {gift_intent_id, batch_id, batch_row_id, tenant_id, user_id, gift_source:"phone"}) — [D4 A7]
- lane — text NOT NULL — CHECK ∈ {card_element, saved_method, ach_financial_connections,
  ach_saved_bank, ach_tel, hosted_link_fallback, virtual_terminal_fallback} — [D4 A16]
- status — text NOT NULL — CHECK ∈ {pending, link_sent, viewed, pending_ach, completed, reversed,
  expired, declined}; the thin projection over Stripe PI/charge status; receipt gated on
  completed/succeeded, NEVER processing — [D4 A18]
- committed_header_id — uuid NULL — set by the webhook on settlement (the online gift) — [D4 A7]

phone_payment_authorizations (FORWARD, net-new — Asym's own evidence; NEVER raw PAN/account)
- id / tenant_id — uuid — house; FORCE RLS
- phone_gift_link_id — uuid NOT NULL — composite FK → phone_gift_links — [D4 A17]
- evidence_kind — text NOT NULL — CHECK ∈ {card_moto_authorization, ach_mandate, saved_method_consent} — [D4 A17]
- staff_user_id — uuid NOT NULL — initiator/completer recorded as distinct audit events — [D4 A17]
- sec_code — text NULL — CHECK ∈ {WEB, TEL, null}; ACH mandate SEC code — [D4 A17]
- acceptance_type — text NULL — CHECK ∈ {online, offline, null}; WEB=donor tap, TEL=recorded oral — [D4]
- stripe_mandate_id / stripe_charge_id — text NULL — the Stripe reference ids — [D4 A17]
- terms_version — text NULL — saved-method off_session consent scope/version (MIT re-consent) — [D4]
- captured_at — timestamptz NOT NULL — [D4 A17]
```

A per-tenant versioned `moto_opt_in` acknowledgment (actor, timestamp, higher-pricing / no-SCA-shift disclosure) is the dual gate alongside the account's actual Stripe MOTO capability; store it as a tenant-config row, not on the gift.

### `batch_templates` + personal prefs [D7]

Tenant-level template controlling column order/visibility (bounded by the D3 grid-eligible allowlist), default field VALUES, the three-state required-field policy, and WHICH opt-in D2/D5 policy applies — **config frozen, safety live**. Freeze is BY VALUE onto the batch header snapshot; a template can never subtract a control.

```
batch_templates (FORWARD, net-new)
- id — uuid PK — UNIQUE (id, tenant_id) — [D7]
- tenant_id — uuid NOT NULL — FORCE RLS — [house]
- name — text NOT NULL — [D7]
- column_layout — jsonb NOT NULL — order + optional visibility WITHIN the D3 common-path allowlist
  ONLY; inspector-bound fields are NEVER template-promotable to the hot-path grid — [D7 H5, CB-2]
- default_values — jsonb NOT NULL — designation/source/site/tender/gift-date-MODE (a resolver-mode
  pointer, never a raw date)/receipt-disposition (advisory only; P7 evaluator wins) — [D7 H3]
- required_field_policy — jsonb NOT NULL — three-state per field {invariant_required,
  template_requirable, optional_by_design}; postmark = optional_by_design, template-requirable-with-
  loud-warning (CB-4); tender-qualified so a check requirement never blocks cash — [D7 H3]
- selected_validation_policy_id — uuid NULL — composite FK → contribution_approval_policies; SELECTS
  additional strictness, never DEFINES policy; fails CLOSED to tenant-default, never fail-open — [D7 H9]
- snapshot_schema_version — integer NOT NULL — forward-compatible reader; a CI test parses every
  historical version — [D7 H2]
- revision — integer NOT NULL DEFAULT 0 — monotonic DATA (concurrency/provenance/snapshot-race); NOT
  the safety-evaluation authority; NO batch_template_versions history table (cut) — [D7 H2]
- seeded_from_starter_key — text NULL — provenance for the 3 copy-on-provision starters (Mail/Check,
  Sunday Cash, Church Remittance); INSERT-ONLY-IF-MISSING; Asym edits never clobber a tenant copy — [D7 H8]
- is_system_default — boolean NOT NULL DEFAULT FALSE — exactly ONE non-deletable per tenant so
  quick-entry always resolves a config — [D7 H8, H9]
- archived_at — timestamptz NULL — soft-archive only; archived cannot start new batches — [D7 H9]
```

**Personal per-user column preferences reuse `crm_table_preferences` (REAL) verbatim** — keyed `UNIQUE(tenant_id, profile_id, template_id)`, a presentation-only overlay of order/hide on OPTIONAL columns; NEVER entered into the frozen snapshot; pref-hide REFUSED for any required-without-valid-default column (the un-escapable-dead-end fix). No new prefs table.

### `batch_validation_runs` + `batch_validation_issues` — non-mutating, revision-bound [D2, N]

Validation is always non-mutating and pinned to a revision; any material edit invalidates it; commit accepts only the approved revision. Issues carry a stable shape the rail renders as GOV.UK-style navigable entries.

```
batch_validation_runs (FORWARD, net-new)
- id / tenant_id — uuid — house; FORCE RLS
- batch_id — uuid NOT NULL — composite FK → gift_entry_batches — [D2]
- revision — integer NOT NULL — the revision this run certifies; UNIQUE (tenant_id, batch_id,
  revision) — [D2]
- outcome — text NOT NULL — CHECK ∈ {clean, has_errors}; control-total balance is a predicate INSIDE
  this run (unbalanced blocks post absent a governed override) — [D2, D5]
- ran_at — timestamptz NOT NULL

batch_validation_issues (FORWARD, net-new)
- id / tenant_id — uuid — house; FORCE RLS
- run_id — uuid NOT NULL — composite FK → batch_validation_runs — [D2]
- batch_row_id — uuid NULL — the offending row (NULL = batch-level, e.g. control total) — [D2]
- field — text NULL / code — text NOT NULL / message — text NOT NULL — the plain-language contract — [O]
- severity — text NOT NULL — CHECK ∈ {error, warning}; issues are revision-stamped, stale dropped — [O]
```

### Phase 14 acknowledgment reuse — NO new column [NF3]

Batch-origin acknowledgments (DAF advisor thank-you, tribute notifications, soft-credit acks) reuse Phase 14's `acknowledgment_status` / `acknowledgment_hold_until` on the header **verbatim**. NF3 changes exactly one thing: at commit these rows land in `held` with **origin reason `batch_gate_pending`** (recorded on the existing status, no new column), instead of suppressed-forever. The explicit per-batch "Send acknowledgments" gate flips READY held rows into P14's existing `pending_send → hold → consent-gate → sent/suppressed/failed` pipeline. The batch-level rollup is DERIVED (a `GROUP BY acknowledgment_status` over the batch's headers, `preparing/ready/partially_sent/sent/none_applicable`) — no stored batch enum. The ack send NEVER writes `gift_receipt_records` (three-document-wall test).

---

### Key invariants (Postgres-enforced floor; ~25)

1. **One commit service / one money-writer.** Exactly one call-site writes `contribution_postings`; validate=post is the approval-gate predicate returning `auto_satisfied`, not a `validateAndPost` fork; the `approve` node is never deleted from the model. [D5 Amd1]
2. **Config-frozen, safety-live.** No template slot exists whose value can disable a structural predicate; presentation/defaults are frozen by value onto the batch snapshot, ALL money-integrity re-derived live at commit against current tenant config. [D7 H1]
3. **Stripe-not-depositable.** `settlement_rail='stripe_rail'` ⇒ DB rejects any `deposit_group_id` write (payout-reconciled, not slip-deposited) — the F1 double-count is structurally impossible. [D6 HD-5]
4. **One-deposit-only + conservation.** The scalar `deposit_group_id` forbids one gift in two deposits; deposit `expected_total` is a SOFT surfaced aid (frozen expected + live actual + persisted variance), never a hard gate, never silently rewritten. [D6 HD-6/HD-7]
5. **Append-only postings.** A posted `contribution_postings` row is immutable (P13 BEFORE-UPDATE trigger); corrections are compensating postings, never in-place mutation. [P13]
6. **Deposit link on the mutable header, reassignment append-only.** The link lives on the header's mutable status-axis, never on immutable postings; every move writes a `deposit_assignment_events` row (grouping moves no money → no compensating posting). [D6 HD-2]
7. **Deposit-state derived, not stored.** Only `deposit_returned` is stored; every other state derives from link + group regime + tender rail; `cleared` is reserved to Phase 20. [D6 HD-3]
8. **Describe-never-value.** `in_kind` posts `recognized_value_minor = 0`; `internal_valuation_minor` is structurally unreachable by receipt/acknowledgment/export/posting across grid, paste, API, and import. [D4 A3]
9. **No-double-count phone gifts.** A phone card/ACH gift is an online gift the Stripe webhook writes; it never becomes an offline money row and never inflates the batch expected/entered totals. [D4 A7]
10. **Receipt gated on plan and settlement.** Phase 7's frozen plan first admits or defers official coverage. Only an admitted individual receipt may fire: ACH (and any async tender) waits for `succeeded`/`completed`, never `processing`; a settled-on-entry tender may receipt at post. `annual_cumulative_cash` creates no per-gift receipt or send-outbox row. [D4 A18, D5 Amd4, P7/P19 D4]
11. **Tenant composite FK + FORCE RLS on every new table**, `tenant_id = current_tenant()`; a cross-tenant reference is DB-impossible (poison fixture). [D3 Amd6, D6 HD-4, D7 H4]
12. **Validation non-mutating + revision-bound.** Any material edit bumps `revision` and invalidates validation + approval; commit accepts only `validated_revision == HEAD` re-checked inside the post txn under the per-batch advisory lock. [D2, D5 Amd2]
13. **Control-total balance precedes post.** Balance is a predicate inside validate; unbalanced blocks post absent a governed override (distinct capability + reason + FROZEN original totals). [D2, D5]
14. **Amend-posted = compensating correction.** Post-commit single-gift amend routes through the AL-261 correction spine (append-only), never a raw `UPDATE`; pre-commit draft = free edit; receipt-affecting amend → versioned corrected/void receipt. [D5 Amd7]
15. **gift_method = P13 single vocab source; P15 is a subset**; `moto` is a capture-channel attribute, not a method; new values are additive-only and row-creation-gated. [D4 A1]
16. **Money = integer minor units; closed sets = TEXT+CHECK, never native enums.** [house]
17. **Idempotent autosave.** Row-commit-granular UPSERT keyed `UNIQUE(tenant_id, batch_id, client_row_id)` with a per-row `row_seq`; stale retries rejected; server responses merge by row id, never wholesale-replace. [D3 Amd4]
18. **Single-active-editor lease + revision-rejection backstop.** One `claimed_by` heartbeat lease; a stale-revision write is rejected with a conflict banner; explicitly no CRDT/presence machinery. [D3 Amd5]
19. **Batch-origin acks land `held` (`batch_gate_pending`), released only by the explicit gate; ack send never writes `gift_receipt_records`.** [NF3]
20. **No card field ever; raw card/bank never stored or logged.** A CI/redaction guard asserts no card-shaped data enters payment requests or logs; the raw-card-data-API bundle is never requested. [D4 A8]
21. **Non-cash tenders excluded from the cash control total** (separate item/count tally; mixed batches stay balanceable). [D4 A6]
22. **`gift_disposition_facts` CI-gated out of every money aggregate** (`fact_kind='non_contribution'`; a schema lint asserts no disposition row can emit a posting). [D4 A4]
23. **Deposit export-immutable ladder.** `open → exported` (TWO regimes, CB-C); an `open` group stays membership-editable until P20 export even after its slip is printed or it is physically banked (`deposited` is a derived/stamped property, never a stored regime; the printed slip is a separate retained immutable snapshot); a Phase-20-exported deposit is compensating-correction-only; NSF retains membership (state→returned), never a silent delete. [D6 HD-8]
24. **Escape-valve conservation.** SQL-enforced `committed_actual + Σ pending_async + carried_expected = frozen original_expected`, forever; the follow-on draft inherits only the frozen carried remainder, never re-derived from carried rows. [D5 Amd9]
25. **Every offline money write is the commit path.** No API route other than the commit service writes offline money; the Track-B 501 bridge is deleted slice one and a guard test forbids its return. [D3 Amd16, D5 Amd13]

---

### Module interfaces

**1. `commitGiftEntryBatch` — the one commit/post service (the sole offline-money writer).** Signature intent: `(tenantId, batchId, validatedRevision, actorId, { subset? }) → { headerIds, postingSeqs, receiptOutboxIds, ackHeld }`. Inside one guarded transaction under the per-batch advisory lock it: asserts `validatedRevision == HEAD`, quiesces autosave, re-runs validation + the control-total predicate server-side, re-evaluates authorization fail-closed, applies the high-risk / new-operator routing predicate, promotes each staged row into a Phase 13 header + designation line(s) + posting(s) (monotonic `effective_seq` under `FOR UPDATE`), consumes the Phase 7-frozen prospective receipt plan, emits `credit_recheck` and only plan-admitted receipt-eligibility outbox rows in the SAME txn, lands batch-origin acks in `held (batch_gate_pending)`, and flips batch status atomically. Idempotent per batch-revision. The escape valve is one atomic op: clean-terminal→post, clean-async-ACH→stays with origin (`partially_posted`), genuine-error→carried follow-on DRAFT with the frozen conservation split.

**2. Deposit service (create / attach / detach / slip) — one service, two homes.** `createDepositGroup`, `attachGift`/`detachGift`/`reassignGift` (compare-and-set on the current `deposit_group_id` under the cooperative advisory lock, one `deposit_assignment_events` row per move; bulk assign = a synchronous bounded `UPDATE ... WHERE id = ANY(...)`, never the `contribution_operation_batches` async saga), and `renderDepositSlip` (tagged-PDF/accessible-HTML, cash + checks subtotaled separately, capability-gated + audited, PII-minimized default). Enforces the settlement-rail eligibility predicate and the two-regime lock ladder in the DB, not the UI.

**3. `sendBatchAcknowledgments` service (NF3).** `(tenantId, batchId, actorId, { excludedGiftIds?, streams? }) → { queued, held, wontSend }`. Flips READY `held` rows to `pending_send` and enqueues one outbox event per `(tenant, header/settlement, notify_party, stream)` with `eligible_at = now + recall_delay`; idempotent (already-`sent` never re-enqueued); restricted-party acks gated to a cleared actor (stay `held` for non-cleared); `recallBatchAcknowledgments` flips not-yet-drained events back to `held`. One trigger edge, never a second send path.

**4. Resolver-backed donor search.** ONE shared endpoint the picker, CSV-paste matcher, and new-donor dedupe all call, routed through the Phase 3/10 subtract-only resolver (`resolveDonorMatch`): a minimal projection, restricted parties never appear and never change the response shape, tenant-scoped pg_trgm/FTS index, ≤300 ms e2e, read-your-writes for inline creates (a partial unique index `(tenant_id, normalized_email)` + insert-on-conflict-return-existing; email-less creates flagged dupe-suspect at validate, never auto-merged).

**5. Receipt / ack outbox contract.** Both ride the existing donation-saga outbox — never an inline `sendEmail`. The commit transaction emits receipt-**eligibility** facts only for Phase 7 plan-admitted individual receipts; `annual_cumulative_cash` emits no per-gift receipt/outbox occurrence. The worker drains asynchronously via `sendStagedGiftReceipt` → P7 evaluator → the fail-closed consent gate → `sendEmail` → immutable `gift_receipt_records`, per-tenant throttle, existing idempotency key, 5-attempt dead-letter. The outbox row carries `eligible_at` (release time) + `gated_on` (settlement | none): "immediately" is the default VALUE with a short tenant-tunable recall delay. Ack events reuse the same drainer + dead-letter; the three ack streams classify as **transactional-relational** `EmailMessageType` (bypass marketing opt-out, always respect `do_not_contact`/bounce/complaint + tribute `never`).

---

### Ownership-Matrix extension (per Phase 1 (Source-of-Truth Ownership Matrix))

| Record type                                                                      | System of record                                            | Write path                                                               | Conflict winner                                                                    | Repair path                                                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `gift_entry_batches` / `_batch_rows` (draft)                                     | Phase 15 staging                                            | Idempotent autosave UPSERT (client_row_id) under the single-editor lease | Higher `row_seq` / lease holder; stale write rejected                              | Draft revision restore; archive-to-audit (never silent delete)                           |
| Committed gift (P13 `contribution_headers` / `_designation_lines` / `_postings`) | Phase 13 ledger (FORWARD)                                   | `commitGiftEntryBatch` ONLY (offline); Stripe webhook (online)           | Append-only postings; `effective_seq` monotonic                                    | Compensating correction via AL-261 spine; batch-scoped reverse op                        |
| `offline_tender_details` / `noncash_gift_details`                                | Phase 15                                                    | Row editor → commit-time freeze                                          | Immutable post-commit (facts append-only)                                          | Amend = compensating correction; noncash enrichment via follow-up worklist               |
| `gift_disposition_facts` (proceeds)                                              | Phase 15 capture; Phase 20 reads                            | Append-only insert from an existing gift                                 | Append-only; never an aggregate                                                    | New compensating fact row; never delete                                                  |
| `deposit_groups` / `deposit_assignment_events` / header `deposit_group_id`       | Phase 15 (operational); Phase 20 owns GL + bank tie-out     | Deposit service; append-only event log                                   | `open`=last write (editable until export); `exported`=compensating-correction-only | Reassign (audit-stamped) while open; compensating-only after export                      |
| `settlement_rail` (tender)                                                       | Phase 13 vocab / Phase 15 stamp                             | Set at entry; drives deposit-eligibility                                 | Immutable per gift                                                                 | Correction re-stamp via the correction spine                                             |
| Phone gift (P13 header + `phone_gift_links`)                                     | Stripe webhook (money-final); Phase 15 dispatch/link        | Webhook writes money; workbench writes link/status                       | Webhook is sole money writer (no-double-count)                                     | `pending_ach→completed→reversed`; NSF/return → corrected/void receipt + `credit_recheck` |
| `phone_payment_authorizations`                                                   | Phase 15 (Asym's own evidence)                              | Captured at authorization; append-only                                   | Immutable                                                                          | New evidence row on re-auth (MIT re-consent)                                             |
| `batch_templates` + snapshot                                                     | Phase 15 config; batch snapshot is the point-in-time record | `finance:manage_batch_templates`, audited                                | Template `revision` (concurrency); snapshot frozen once per batch                  | Soft-archive + new template; re-apply latest defaults to STILL-DRAFT only                |
| Personal column prefs (`crm_table_preferences`, REAL)                            | Phase 15 overlay (reused table)                             | Per-user pref write                                                      | Presentation-only; last write per user                                             | Reset-to-template-layout                                                                 |
| `batch_validation_runs` / `_issues`                                              | Phase 15                                                    | Non-mutating validation pass                                             | Revision-bound; stale runs dropped                                                 | Re-validate at current revision                                                          |
| Acknowledgment state (P14 `acknowledgment_status`, reused)                       | Phase 14 (per-recipient); Phase 15 derives the batch rollup | `sendBatchAcknowledgments` gate → P14 pipeline                           | Idempotency key `(tenant, header/settlement, notify_party, stream)`                | Recall window; per-recipient deliberate re-send; P8 anti-stranding view                  |

### Build-order note (where the substrate lands)

The **first P15 build ticket lands the minimal Phase 13 posting substrate** (headers / designation_lines / postings + `effective_seq` + the BEFORE-UPDATE immutability trigger + the `credit_recheck` outbox) — it is FORWARD (Phase 13 epic #690, zero SQL today) and every money-final invariant above rides on it; draft-stage editing ships first (needs no ledger), and a flat-`donations` in-place-edit interim is FORBIDDEN. The D6 deposit layer and the D7 template layer are post-commit / config layers that land AFTER the substrate + the D5 commit service; the settlement_rail discriminator (CB-A) must be resolved before the HD-5 deposit-eligibility predicate is written. All P15 tables ship their tenant-FK + RLS + uniqueness constraints in the first migration (fresh-build, no users).

## Testing Decisions

_This section binds the phase's test strategy, then the build order, then the exclusions and cross-PRD obligations. The governing property mirrors Phase 14 (Donor Credit Operations): **partial delivery never mis-posts money and never mis-mails a document** — every build slice is safe to stop after, and every test below asserts that safety at the seam that guarantees it._

### What makes a good test here

- **Assert external behavior, not implementation.** A test names the money outcome, the document outcome, or the audit fact — never a private function's call shape. The oracle for "did the batch commit correctly" is the state of the Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) postings + the receipt/acknowledgment records + the frozen control-total stamp, not the internal control flow of the commit service.
- **Drive the REAL commit service.** Tests exercise the actual batch validate/post path and the actual posting substrate through local dependency injection at the seams — a **fake clock** (so receipt catch-window, deposit-aging, and Dec/Jan postmark-boundary behavior are deterministic), a **synchronous outbox drainer** (so the post-transaction receipt/acknowledgment outbox can be drained and asserted in-test without a live worker), and a **send seam stub** (so the P6 (Shared Communication Event Model) `sendEmail`/`mail`-print boundary records what _would_ send instead of sending). The money logic, the control-total predicate, the revision-invalidation rule, the conservation invariant, and the state machine are the code under test — never faked.
- **NEVER `vi.mock` a `packages/*` internal by relative path.** Under the full CI suite the Bun symlink-realpath resolution makes such mocks silently no-op, so the test passes while asserting nothing (a known repo trap; see the Vitest module-mock note in program memory). Drive the real code with locally-constructed inputs and injected seams instead. This is a hard rule, red-on-regression via the CI lint list.
- **Fail-closed by default.** Where a projection, a consent gate, a capability check, or a restricted-party filter governs an outcome, the test asserts the _closed_ branch (hidden / blocked / held) as the default and the open branch only under an explicit cleared actor. A missing capability, a non-cleared viewer, or an unresolved donor never widens access.

### The seams (where each behavior is proven)

The phase has four distinct test surfaces; each behavior is proven at exactly one primary seam, not smeared across all four.

1. **Primary money seam — the batch commit/post service.** This is the one money chokepoint (D1 one front door; D5 validate=post). Unit + integration tests here are the compliance oracle for: the revision-bound validation gate (any material edit invalidates validation and approval; commit accepts only the approved revision — D2), the control-total balance predicate and its governed override (frozen original expected totals, distinct capability, required reason — D2), atomic all-or-nothing commit and the audited escape valve (D5 Path C), the high-risk auto-route and new-operator soft-guard routing predicates (D5), idempotent commit over a subset, and the conservation invariant of the carry-forward follow-on batch. These tests run the real service against a real Postgres so the posting `seq`, the advisory lock, and the immutability trigger are exercised, not simulated.
2. **DB-invariants seam — pgTAP against real Postgres.** Structural money-integrity that must hold regardless of application code lives in database tests: the append-only postings immutability trigger (a posted row cannot be UPDATEd), the composite `(tenant_id, …)` FK + FORCE RLS cross-tenant impossibility, the `settlement_rail` deposit-eligibility CHECK (a Stripe-rail gift can never carry a manual deposit link — the double-count invariant, D6/CB-A), the frozen-conservation invariant on carried batches (committed_actual + Σ pending_async + carried_expected = frozen original_expected — D5), the describe-never-value non-cash invariant (D4), and the template config-frozen/safety-live boundary (a template row can never encode a value that subtracts a control — D7). pgTAP is the floor because these must fail even if the service layer has a bug.
3. **UX seam — Playwright.** Keyboard, focus, and accessibility behavior cannot be proven in jsdom (it has no real focus model or layout), so the D3 workbench contract is a Playwright + axe suite driving a real browser. This is the compliance oracle for the ARIA APG grid keyboard contract.
4. **Webhook / phone-lane seam — the `stripe_raw_events` ledger.** The native embedded phone-gift lane (D4) is an online gift written by the Stripe webhook, not an offline batch row. Its tests assert the durable-event lifecycle (`pending_ach → completed → reversed`, dispute + `charge.failed` events, 3-key idempotency, receipt gated on `succeeded`, Events-API sweep backstop — D4 A18) against the existing raw-events + saga/outbox pattern (REAL: `packages/api/src/donate/`), replaying events to prove exactly-once linking and no double-count against any batch money row.

### The test grids (the ratified acceptance oracles)

Each core decision carries a required combinatorial grid; these are PRD acceptance criteria, red-before-green where noted.

- **D3 keyboard-contract suite (the compliance oracle) + the 2 gating spikes.** A Playwright/axe suite asserts the APG grid contract verbatim: single tab stop + roving tabindex, arrow cell navigation, Enter/F2 enters edit, Escape cancels and restores navigation, focus stable under autosave and under virtualization (keep-focused-row-mounted), WCAG 2.2 target size ≥24px (2.5.8) and focus-not-obscured under sticky headers/pinned rail (2.4.11), and `aria-rowcount`/`aria-rowindex` totals across the virtual window. Two **gating spikes are the FIRST build tickets** and can amend the keyboard contract before any dependent slice freezes: the **keyboard/Enter-semantics spike** (Enter = commit-and-move-down with Excel snap-back is the hypothesis; the spike may falsify it and the TanStack Table drop-vs-quarantine decision binds either way, quarantine as the floor) and the **donor-typeahead spike** (inline donor create must be immediately matchable within the same batch — the R3 field differentiator). A candidate **third spike** covers the autosave/session-recovery protocol (pin AP below).
- **D5 commit grid — policy × tender × receipt-plan × receipt-timing × control-total × escape-valve.** The full cross-product: {self-approve / opt-in second approver / quorum} × {check, cash, securities, in_kind, church_remittance, phone-card, phone-ACH} × {ordinary/non-Canadian policy / `individual_cash` / `annual_cumulative_cash`} × {immediate settled-tender receipt / async ACH-gated-on-succeeded / opt-in hold-until-cleared / ready-for-year-end with no per-gift outbox} × {balanced / mismatch-blocked / governed-override} × {atomic-all / clean-subset-carry / async-stays-with-origin}. It includes the named invariant `{annual_cumulative_cash, settled check or cash, commit} → posted money + ready-for-year-end, zero per-gift receipt record, zero receipt-send outbox`. Plus two **property tests**: the **conservation** property (no carry path ever creates or destroys expected total — the frozen invariant holds under any partition) and the **revision-race** property (a concurrent edit during validate/approve/commit can never let an unapproved revision post).
- **D6 deposit grid — V1–V6 × tenders × timing × cardinality.** Every founder-named workflow variant (V1 same-day RDC, V2 deposit-before-entry, V3 entry-then-deposit-days-later, V4 N batches → 1 deposit, V5 1:1, V6 inconsistent week-to-week) × {check, cash, bank-direct ACH/wire, Stripe-rail (must reject the link), securities/in-kind (no-deposit state)} × {deposit-before-entry / after / simultaneous} × {1:1, N:1, 1:N}. Asserts the derived deposit-state axis, the append-only `deposit_assignment_events`, free-until-P20-export mutability, the printed-slip immutable snapshot, and NSF-retained membership.
- **D7 template grid — the O4a–O4g invariant-cannot-be-overridden fuzz.** Property/fuzz tests prove a batch template can NEVER subtract a control: it cannot make an ineligible gift receiptable, cannot disable the control-total gate, cannot change a tender's `settlement_rail` or make a Stripe gift depositable, cannot bypass the auto-post/high-risk route, and a dead frozen designation ID is rejected at commit (money-integrity re-resolves live). O4b/O4d run **red-before-green** with the D5 commit chokepoint.
- **NF3 acknowledgment-gate grid.** Asserts: **idempotent double-press** (pressing "Send acknowledgments" twice never double-thanks — the `(tenant, header/settlement, notify_party, stream)` idempotency key holds), the **recall window** (a batch-grain undo before the send actually leaves), **late-delta re-arm** (a Mod3 correction or a late-generated credit re-arms the panel with "Send 3 more," never re-blasting the already-sent set), **restricted-projection** (the manifest is projected per-viewer; restricted rows are ABSENT and the button count reflects only the visible set — never "47 with 3 hidden"; restricted acks stay `held` for a non-cleared actor), and the **three-document-wall** test (the acknowledgment send NEVER writes `gift_receipt_records`; any plan-admitted individual tax receipt is a different document, while annual-cumulative mode creates no per-gift receipt).

### Prior-art test files (REAL — verified on disk, the patterns to mirror)

- `tests/unit/packages/api/admin/contribution-effective-values.test.ts` — the effective-value / append-only-fold assertion pattern the posting + correction tests extend.
- `tests/unit/packages/api/admin/contribution-operations-permissions.test.ts` — the capability-gating + SoD assertion pattern for the D5 money-OUT surviving-SoD and the D7 `finance:manage_batch_templates` gate.
- `tests/unit/packages/api/admin/support-hub/tenant-isolation.test.ts` — the cross-tenant negative pattern; every new P15 table gets an isolation test in this shape (composite-FK + RLS).

---

## Build Order

_Dependency-ordered slices. Nothing in a later slice ships until the earlier slice's CI gates are green. Fresh-build posture (product has no users): no migration ceremony, schema correct-from-start, all constraints in the first migration. The two D3 gating spikes precede any slice that consumes the keyboard contract; the commit spike (pin S) precedes the large-batch commit path._

**SPIKE-FIRST — the contracts a wrong guess makes unrecoverable (these are the phase's first tickets):**

0. **Spikes.** (a) The D3 **keyboard/Enter-semantics spike** — validate the APG contract + Enter default + keystroke/latency budgets in a real browser; its report may amend the keyboard contract before any grid slice freezes. (b) The **donor-typeahead spike** — prove inline donor create is immediately matchable within the same batch against the Phase 4 (Identity & Account-Claiming Foundation) `resolveDonorMatch` path. (c) The **autosave/session-recovery + commit-atomicity spike** — pin autosave cadence, crash/disconnect recovery, single-active-editor lease reacquisition, revision-counter reconciliation, AND the large-batch commit design (chunked-but-atomic-per-commit, documented batch-size ceiling, posting-`seq` contention mitigation) against the existing chunk-at-25 operation infra. _Kill/rollback:_ inert — spikes produce a validated contract + throwaway probe code, nothing ships to money.

**SHIP-FIRST — the substrate:**

1. **The minimal Phase 13 posting substrate FIRST + retire the Track-B 501 bridge.** The Phase 13 ledger is groomed-not-built (zero SQL today; its epic #690 children are blocked), so P15's first non-spike ticket lands the minimal `contribution_headers` / `contribution_designation_lines` / `contribution_postings` shape it posts through: frozen legal-donor + designation snapshots, signed-delta postings with a monotonic `seq` under `FOR UPDATE`, the BEFORE-UPDATE immutability trigger, the `effective_seq` cursor, the `credit_recheck` outbox event in-transaction, and the one locked SECURITY DEFINER contribution-mutation function on the per-contribution advisory lock. **Delete the Track-B offline bridge** (the `OfflineEntryUnboundError` 501 path): salvage only the zod schema (`contributions-offline.ts`) and `resolveOfflineReceiptStatus` as precedent; the legacy-`donations` persistence plan is never wired (D1.b/D1.c). All P15 tables (`gift_entry_batches`, staged-row model, `batch_templates` + per-batch frozen snapshot struct, `deposit_groups`, `deposit_assignment_events`) with every identity/scope/bound constraint, composite `(tenant_id, …)` FKs, and FORCE RLS in this first migration. _Blocked by:_ Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) census + projection; Phase 12 (Full Role & Permission Configuration) capability registry. _Kill/rollback:_ inert — nothing commits money yet.

2. **The commit service + guarded post transaction + control-total-in-validate.** The one atomic commit/post service (D5): the revision-bound non-mutating validation gate, the control-total balance predicate INSIDE validate with the governed override (frozen original totals, distinct capability, reason), atomic all-or-nothing post through the locked function, the high-risk auto-route + new-operator soft-guard routing predicates (reusing `contribution_approval_policies` + P12 caps — not new machinery), and the one per-batch commit confirm. The D7 **invariant validator ships WITH this chokepoint** (template config-frozen/safety-live re-derivation at commit). _Kill/rollback:_ capability-gated; draft-stage free edit ships before any ledger write, so stopping here still posts nothing.

3. **The receipt rail + corrected/void receipt + batch-reverse.** Consume Phase 7's frozen prospective receipt plan; admit an individual tax receipt only when the plan permits it, then release at post for settled tenders or source-confirmed success for async tenders through the post-transaction donation-saga OUTBOX (never inline send) → `sendStagedGiftReceipt` → P7 evaluator → P6 consent gate → immutable `gift_receipt_records`. `annual_cumulative_cash` records ready-for-year-end and creates no per-gift receipt/outbox occurrence. Include the short donor-invisible receipt catch-window (`eligible_at`, one-click recall, tenant-lowerable to 0); Mod3 post-commit single-gift correction as a compensating correction on the AL-261 spine (append-only, never in-place edit); corrected/void receipt versioning; and the batch-reverse operation. _Kill/rollback:_ the catch-window recalls in-flight individual receipts; corrections are append-only so nothing is destructively edited.

4. **The grid — on the spike-validated keyboard contract.** The purpose-built accessible editable grid (seeded from the dormant `data-grid/` component — has TSV clipboard + undo/redo; needs arrow nav + roving tabindex), the always-visible reconciliation rail, and the non-modal row inspector (DAF, tribute, matching, remittance sub-grid, splits, new donor — each keeping the row visible and returning focus to the originating cell). Desktop/tablet-landscape only; phones scoped to list/status/review/approve. _Kill/rollback:_ read-only fallback loses entry ergonomics, not money.

5. **Paste / PAN.** In-cell TSV clipboard paste + fill-down (the seed-grid capability; formal spreadsheet import is Phase 30 (Imports & Migration Tools), deferred — pin G); then the native embedded phone-gift lane — Stripe Payment Element keyed by staff (SAQ-A), server-confirm MOTO (gate+detect+degrade), the mid-call Financial-Connections ACH lane and the bounded secondary TEL lane, all as online gifts written by the webhook and auto-linked, never offline batch rows. _Kill/rollback:_ phone lane is capability-gated (`take_phone_payment`) and degrades to fallback; Asym never stores/logs/processes raw card or bank details.

6. **Deposits.** The undeposited-funds operational layer (D6): first-class `deposit_groups` + the nullable, changeable, gift-grain link + the derived deposit-state axis; the one-click "deposit this batch" 1:1 default; free add/remove/reassign until Phase 20 (Accounting Exports & Reconciliation) export; the deposit slip artifact as a retained immutable snapshot; NSF-retained membership; the `settlement_rail` eligibility rejection of Stripe-rail tenders. In both the workbench rail AND a first-class Deposits area over ONE service. _Kill/rollback:_ deposit grouping moves no money (no compensating posting); disabling it loses only the slip convenience.

7. **Templates + acknowledgments.** The D7 tenant `batch_template` (column set/order within the D3 allowlist, defaults, required-field policy, which opt-in validation/approval policy applies), the per-batch frozen snapshot, the 3 seeded starters + one non-deletable System Default, personal per-user column prefs, "save this batch as a template" + thin list. Then the NF3 explicit per-batch **"Send acknowledgments"** gate: at commit, batch-origin acknowledgments land in P14 `held` (`batch_gate_pending`); the one human action flips READY held acks into P14's existing `pending_send → hold → consent-gate → sent/suppressed/failed` pipeline (one trigger edge, no second send path); the pre-send manifest, recall window, results view, and the quick-entry checked-by-default one-tap line. _Kill/rollback:_ acks default to `held` (nothing sends without the human edge); templates set defaults only (never subtract a control — enforced at the commit chokepoint).

8. **Perf harness + telemetry.** The keystroke/latency budget harness (the AV acceptance metrics), the P8 (CRM Operating Foundation) telemetry + the one owned aged post-hoc worklist (corrections / void-receipts / failed-receipts / open follow-ons / undeposited-cash-aging / acknowledgments-pending-past-N-days), and the deposit-aging signals (default-on, fully disable-able). _Kill/rollback:_ observability-only — removing it loses signal, not money.

---

## Out of Scope

_Reserved as seams (plumbed, not built), owned by a named later phase, or deliberately killed. These are the BINDING "do not build" lists from every decision's cut list — an implementer facing a build-out-vs-defer call inside a ratified decision takes the leanest compliant reading._

- **GL, bank-statement reconciliation, and the undeposited-funds accounting entry** — Phase 20 (Accounting Exports & Reconciliation). P15 owns the deposit-grouping workflow + the slip/report artifact + the operational deposit-state; P20 owns the GL undeposited-funds account, deposit clearing, and bank-statement tie-out. No GL, no bank-rec, no cleared-aging _accounting_ engine in P15 (D6).
- **File / image storage** — Phase 29 (Files). Scanned checks and any document attachment are a reserved row-grain seam only; the RDC/check-scanner same-day path is fully manual in v1 (capture a deposit ref/date, store no image). General per-gift/per-batch notes ship as audited free text; attachment defers to P29 (pins AL, AM).
- **Spreadsheet / multi-row import with column mapping and bulk donor resolution** — Phase 30 (Imports & Migration Tools). v1 keeps only in-cell TSV paste + fill-down; import-origin rows share P30's never-auto-send posture (pin G).
- **The commitment / pledge model** — Phase 16 (Recurring Giving & Commitments). P15 does not own the model; the match-at-entry affordance is deferred because P16 is unbuilt, and only the inspector seam is reserved (pin AF).
- **Per-tenant "deposit mode" configuration** — CUT (it breaks V6 inconsistent-week-to-week); the deposit-state is derived, not a stored mode.
- **N:M batch↔deposit junction table** — CUT; the model is a nullable gift-grain scalar link, never a rigid batch=deposit FK and never a junction.
- **Deposit-approval separation of duties, deposit templates / numbering config** — CUT (D6). Deposit membership is free-until-export, audit-stamped, single-actor.
- **The template builder "studio," conditional-logic DSL, per-template custom-field creation, template versioning UI, per-template numbering, policy-versioning/effective-dating engine, a `batch_template_versions` history table, snapshot dedup/hashing, per-column permission matrix, preview/simulate sandbox, starter merge/diff UI** — all CUT (D7). v1 is a thin list + save-as-template + a `revision` integer.
- **Two-person cash-count (dual-count) attestation surface** — deferred to fast-follow; v1 relies on D5's mandatory cash → high-risk-review route as the control (founder-confirmed defer; pin Y).
- **Acknowledgment analytics, a bulk re-blast, an ack approval workflow, an unsend/void machine, a scheduler/drip, a printable manifest, a cross-batch super-action, mandatory per-type or per-recipient review toggles** — CUT (NF3). Ack analytics belong to Phase 33 (Reporting).
- **Native non-cash valuation engines (vehicle / real-estate / crypto)** — CUT; one generic `noncash_gift_details` extension + reserved `gift_method` values + duty flags, describe-never-value; no native engines v1 (D4).
- **An in-app raw card/bank field of any kind** — the one permanent hard stop (D4). Sensitive fields live only in Stripe-owned surfaces; MOTO is Stripe-support-gated per connected account, not programmable.
- **The heavy escape-valve provenance engine** — CUT to fast-follow; v1 is the cheap frozen-remainder + bidirectional link reusing the MC-follow-up-task aging (D5).
- **A separate posting `finalize` state** — there is none under validate=post; the terminal is posted/committed and "export" is reserved for P20 + the D6 deposit-`exported` regime (pin U).

---

## Further Notes

- **The don't-over-engineer rider is BINDING.** The founder's rider governs presentation and defaults, never control existence (D2): validation, evidence preservation, and audit are structural and may not be read as optional. Every gate explains itself in plain language (what is wrong, why it matters, how to fix, what it blocks); default approval rules stay lean; no confirmation ceremony on ordinary actions; friction is spent only where money-integrity buys it back. When an implementer faces a build-out-vs-defer call inside a ratified decision, the leanest compliant reading wins and the cut lists above are the binding "do not build."
- **The 8 PRD-author pins (resolved at authoring with recommended defaults; no founder call):**
  - **G — paste boundary.** v1 keeps the seed-grid in-cell TSV paste + fill-down; formal spreadsheet import with column mapping is Phase 30, deferred.
  - **J — gift/row duplicate.** A non-blocking warning (into the error/warning taxonomy) on a duplicate `check_number` (within-batch + a bounded recent cross-batch lookback), on donor+amount+date, and a flag if the gift appears already-posted; never auto-blocks.
  - **S — commit atomicity.** Chunked-but-atomic-per-commit with a documented batch-size ceiling and a posting-`seq` contention mitigation, validated by the commit spike (slice 0c) and reconciled against the existing chunk-at-25 operation infra.
  - **U — finalize/export naming.** No separate posting `finalize` under validate=post; the terminal is posted/committed; "export" is reserved for P20 and the D6 deposit-`exported` regime.
  - **Y — anonymous cash.** A per-tenant house "Anonymous"/unattributed-donor pattern (nullable legal-donor snapshot + anonymous flag; no receipt per P7; counts toward the control total) so a Sunday-cash batch functions.
  - **AF — match-at-entry defer.** Reserve the P16 model (don't build); ship only the inspector seam because P16 is groomed-not-built.
  - **AM — notes + P29.** A per-gift + per-batch audited free-text notes field; document attachment defers to the reserved Phase 29 files seam.
  - **AP — autosave/recovery.** Explicitly pinned: autosave cadence + crash/disconnect recovery + single-active-editor lease reacquisition + revision-counter reconciliation, treated as the candidate third early spike alongside the two D3 gating spikes.
- **Counsel / finance sign-off gate (AW — founder-confirmed).** The phase carries a required counsel/finance review of receipt language, tax-year treatment, non-cash 8283/8282 duty wording, and NACHA/MOTO mandate + consent language before the relevant ship boundary — mirroring the decided TEL two-party-consent legal review gate. This is a named phase deliverable, an evidence artifact alongside the Phase 7 checklist; parity is measured by the compliant outcome, and this document is not legal or tax advice.
- **Dual-count fast-follow.** An optional per-tenant two-person cash-count attestation surface is reserved as the named fast-follow to Y; v1's control is D5's mandatory cash → high-risk-review route.

---

## Congruence Package

_The proven Phase 14 in-commit pattern: dated `_(Amended YYYY-MM-DD, Phase 15 (Offline Gift & Batch Entry) Dn: …)_` notes on edits, append-only additions for new glossary terms / OpenSpec requirements / ADRs — all landed as ONE congruence commit alongside this PRD. Every anchor below was verified against the worktree during the loose-threads sweep. **17 required edits (13 EDIT + 4 APPEND) across 9 files.**_

1. **`phase-02-site-locale-currency-foundation.md` §A2 (lines 216–221) — EDIT.** THE one stale contradicting spec: it asserts "one standalone Stripe account per tenant … no Stripe Connect," now false. Replace with tenant owns the money via a Stripe Connect connected account (Phase 13 D1) accessed with `{stripeAccount:'acct_…'}`; strike "no Stripe Connect"; cross-reference Phase 13 §A topology; KEEP the real Phase-2 point (presentment currency must equal settlement currency; the reserved nullable per-site payment-account override stays). Founder-confirmed 2026-07-11: fold into this package, no standalone commit.
   2–6. **`phase-13-…ledger-giving-cart.md` — 5 EDITs at distinct anchors.** (2) §E.1 tender table lines 762/763/766: retire the flat `deposit_reference` TEXT → D6 `deposit_groups` + gift-grain link; add the CB-A `settlement_rail` discriminator (`ach` spans both rails; deposit-eligibility keys on rail, not method); reword the check/church payment cells per CB-B (post immediately at recorded; issue an individual receipt only when the Phase 7-frozen plan admits it; NSF compensating clawback; hold-until-cleared opt-in). (3) line 1042 tender summary bullet: the same three-part reconciliation, kept in sync with the table. (4) story 106 (line 269): recorded = entry/posting (D5); deposited/cleared = the D6 6th orthogonal deposit-state axis, not sequential posting gates; retain the NSF clause. (5) story 194 (line 402): the check clause superseded by CB-B (posts immediately; a plan-admitted individual receipt follows the normal timing rail; gate-on-money-final becomes the opt-in hold-until-cleared case); ACH clause unchanged. (6) reserved-seam note (line 1270): clarify P15 formalizes deposit-state as the 6th axis and recorded = posting.
2. **`CONTEXT.md` `## Language` — APPEND** ~18–20 `(Phase 15)` glossary terms: gift-entry batch, quick entry, validation, control total + governed override, validate=post, high-risk auto-route, new-operator guard, escape valve / carry-forward follow-on, deposit group, undeposited-funds, deposit-state, deposit assignment event, settlement_rail, settles-via-payout, batch template, config-frozen / safety-live, phone-gift lane, MOTO (server-confirm flag), TEL / Financial-Connections ACH lane, `take_phone_payment`.
3. **`roadmap.md` line 139 (Phase 15 row) — EDIT.** Status → `PRD exists (epic #… + children …)`. **Executes after /to-tickets, not at /to-spec authoring.**
4. **`roadmap.md` lines 913–916 (phone-gift posture) — EDIT.** STALE per D4 (a log-missed loose thread): native embedded SAQ-A Payment Element + server-confirm MOTO is primary; hosted secure-link demoted to fallback; restate the guardrail as "Asym never stores/logs/processes raw card or bank details" (staff DO key into a Stripe-owned iframe the platform embeds but cannot read).
5. **`roadmap.md` line 1145 (deposit-reports ownership) — EDIT (light).** Resolve the double-claim: P15 owns the deposit slip/report + operational state; P20 owns the GL undeposited-funds account + bank-statement tie-out.
6. **`roadmap.md` lines 898–900 (lifecycle wording) — EDIT (light).** validate=post default; second approver/quorum opt-in; high-risk auto-route.
7. **`phase-map.md` line 149 (Phase 15 row) — EDIT.** Status → `PRD exists (epic #…)`. **Executes after /to-tickets.**
8. **`phase-map.md` lines 335–343 (phone-gift posture) — EDIT.** The same D4 staleness as #9 — the second instance of the log-missed phone-lane thread.
9. **`README.md` "Files in this program" (after the Phase 14 bullet, 204–216) — APPEND** a `phase-15-offline-gift-batch-entry.md` bullet + epic/children reference. The README status grid is area-based (area 6) and does NOT flip on PRD authoring.
10. **`parity-matrix.md` line 149, area 6 — EDIT.** Append "**Resolved by the Phase 15 PRD.**" (mirrors area 5 line 137).
11. **`openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md` (after the Phase 14 requirement, 64–87) — APPEND** the 4th `## ADDED Requirement` (see OpenSpec section below).
12. **`phase-14-donor-credit-operations.md` — EDIT (NF3).** Phase 14 PRD line 1745 + D2 guardrail 8 (PRD line 517): reword "batch/import-origin rows suppress acknowledgment auto-send" → "batch/import-origin rows land in `held` (origin reason `batch_gate_pending`); the explicit per-batch Send-acknowledgments gate is the human edge that releases them into P14's existing pipeline; imports stay `held`." + Phase 14 Data Model (PRD 1342–1362): record the `batch_gate_pending` origin reason on the `held` status (NO new column).

**By file:** phase-02 (1) · phase-13 (5) · phase-14 (1) · CONTEXT.md (1) · roadmap.md (4) · phase-map.md (2) · README.md (1) · parity-matrix.md (1) · OpenSpec (1). **Pure APPENDs:** CONTEXT glossary (#7), README bullet (#14), OpenSpec 4th requirement (#16). **3 OPTIONAL-DEFERRED** (precedent = deferred; P13/P14 did not execute theirs — program-wide gaps, not P15 must-dos): O-A phase-01 ownership matrix (new P15 tables fold under the category-grained "Money" row), O-B phase-08 data-health catalog (the open `crm_escalations.source` enum absorbs P15 signals), O-C phase-07 receipt evaluator (consumed unchanged — note "evaluated, no P7 edit required" to close the thread visibly). X-1: Phase 14 requires the NF3-driven reword (#17 above) AND already forward-declares the three P15 contracts (lines 1741–1745) this PRD honors verbatim.

---

## ADRs

_The ADR bar (repo convention): hard-to-reverse / surprising-without-context / real-trade-off decisions. Format `docs/adr/000N-slug.md`, `Status: Accepted (founder ruling, Phase 15 grill)`, pointer to the PRD section. Next number is 0007 (Phase 14 minted 0002–0006)._

- **ADR-0007 — Undeposited-funds deposit model (D6).** First-class `deposit_groups` + a nullable gift-grain link + a derived deposit-state as a 6th orthogonal axis, decoupled from entry AND posting; `settlement_rail` eligibility (Stripe-rail rejected from manual deposits — the double-count invariant); free-until-P20-export lock ladder; printed-slip immutable snapshot. Carries two hard money-integrity DB invariants.
- **ADR-0008 — Config-frozen, safety-live batch templates (D7).** Freeze presentation + defaults BY VALUE on the batch header (`snapshot_schema_version`, no versions table); re-resolve ALL money-integrity LIVE at commit against current tenant config; a template can never subtract a control.
- **ADR-0009 — Validate=post + high-risk auto-route + new-operator guard (D5).** Approve collapses into validate by default (opt-in second approver); risk-scaled pre-post routing (large-$, new donor, cash, backdated) + an auto-graduating new-operator floor as the primary safety net replacing the removed second approver; a short donor-invisible receipt catch-window. Reverses the conventional entry → approve → post separation.
- **ADR-0010 — One front door for offline money (D1).** All staff-entered offline money flows through gift-entry batches; quick-entry is a batch-of-one; one staging model / one validation engine / one atomic commit / one audit spine; nothing else writes offline money (Phase 39). Retires the standalone offline-gift dialog write path; establishes the `gift_entry_batches` vs `contribution_operation_batches` domain split.
- **ADR-0011 — Native embedded Stripe phone-payment lane (D4).** SAQ-A embedded Payment Element keyed by staff + server-confirm MOTO (dual-gated, support-gated, gate+detect+degrade); mid-call Financial-Connections + secondary bounded-carve-out TEL ACH lanes; Asym never stores/logs/processes raw card or bank details. **Carries a note:** overlaps Phase 13's already-ratified-but-UNWRITTEN Connect topology — Phase 13's own planned Connect/ledger ADRs (its line 1299) were never authored (`docs/adr` holds only 0001–0006). Decide at authoring whether ADR-0011 references a still-unwritten Phase-13 Connect ADR or folds the phone lane into a broader Connect ADR; either way this surfaces a program-level Phase-13 ADR gap (the Connect PCI/SAQ platform-vs-connected split).

---

## OpenSpec

The phase adds a **4th durable requirement** to `openspec/changes/sitestacker-parity/specs/platform-product-intent/spec.md`, appended after the Phase 14 requirement (lines 64–87), mirroring the Phase 14 requirement shape (WHEN/THEN scenario):

**## ADDED Requirement — Offline Money Enters Only Through the Governed Batch-Commit Path.** All staff-entered offline money MUST flow through the single gift-entry-batch commit service (D1 one front door + Phase 39 no-offline-money-writes); nothing else writes offline money. A control-total mismatch MUST NOT be silently erased — the original expected totals are frozen forever and any override is capability-gated, reason-stamped, and audited (D2). Validation is non-mutating and revision-bound; commit accepts only the approved revision and posts atomically, with an audited escape valve for the clean subset (D5 validate=post). WHEN a staffer commits a validated batch, THEN every gift posts through the Phase 13 append-only ledger under the per-contribution advisory lock, the frozen control-total stamp is written, Phase 7's frozen prospective receipt plan is consumed, only plan-admitted individual receipts enter the post-transaction outbox, and batch-origin acknowledgments land `held` pending the explicit per-batch human send gate (NF3). An `annual_cumulative_cash` occurrence posts normally but creates no per-gift official receipt, coverage, or receipt-send outbox row. The requirement carries a detailed-behavior pointer to this PRD.

---

## Evidence & Stop Conditions

- **Program posture: groomed-not-built.** This is a repo PRD file committed to PR #465 — not a tracker issue, no `ready-for-agent` label; issues follow at /to-tickets (Phase 14 precedent: epic #719 + children #720–#741). The Phase 13 ledger it posts through is itself groomed-not-built (zero SQL; epic #690 children blocked), which is why the first non-spike build ticket lands the minimal posting substrate.
- **Spike stop conditions.** The three spikes (keyboard/Enter semantics, donor-typeahead, autosave-recovery + commit-atomicity) gate their dependents: no grid slice freezes before the keyboard spike reports; no immediately-matchable-donor acceptance criterion is asserted before the typeahead spike; no large-batch commit path ships before the commit-atomicity spike pins the ceiling + `seq` contention mitigation. A spike report MAY amend the keyboard contract before any dependent slice starts (the defined amendment path).
- **Compliance review gates (hard stops before the relevant ship boundary).** The counsel/finance sign-off gate (AW) on receipt language, tax-year treatment, and non-cash 8283/8282 duty wording; the TEL two-party-consent legal review + call-recording/retention program before the secondary ACH TEL lane ships; the PCI posture confirmation (the embedded-Element SAQ-A landing + the platform-vs-connected split under Connect) and the MOTO per-connected-account support enablement + pricing/liability confirmation, both run during build against live Stripe docs/support, not re-litigated here; the NACHA mandate/consent language for the ACH lanes. Each is a named deliverable with an evidence artifact; parity is measured by the compliant outcome. This document is not legal or tax advice.
- **Sources.** D1–D7 + NF3 + all amendments in the ratified decision log; the loose-threads readiness report (49 scope areas: 23 DECIDED · 17 CARRYABLE · 9 DANGLING, verdict GREEN) and its congruence inventory (16 verified edits + 5 ADRs). Prior-art test files, the `data-grid/` seed, the `donate/` saga + `stripe_raw_events` ledger, and the contributions hub surfaces are REAL (verified on disk); the Phase 13 ledger and the P15 tables are FORWARD (owned by this PRD + Phase 13 epic #690).
