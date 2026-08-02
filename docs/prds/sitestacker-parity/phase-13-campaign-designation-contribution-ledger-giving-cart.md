# Phase 13 — Campaign, Designation, Contribution Ledger & Giving Cart

## Status

Groomed via `grill-with-docs` (2026-07-09). All decisions **D1–D25** ratified and adversarially hardened (five ruthless 16/17-category reviews across D2/D3/D5/D7/D8/D12/D13/D14/D15/D16). PRD authored from the decision log. Program posture: **groomed-not-built** — this is a design against not-yet-built Phase 3/4/5/7/9/10/11/12 contracts; no live/shipped claims. The phase is tracked by live epic **#690** and children **#691–#713**; every child is currently `status:blocked`. Those issue bodies are historical planning surfaces that predate the current congruency corrections and must not be dispatched unchanged. Issues **#706–#710** additionally remain subject to the binding Phase 16 recurring-domain supersession below. Repo anchors throughout are **evidence as of authoring**, never brittle build instructions.

**Slug:** `contribution-ledger` · **Roadmap position:** Phase 13 of 41 (roadmap v2) · **Status:** PRD (design ratified 2026-07-09 via grill-with-docs — decisions D1–D25 + two governing principles R-JW and R-UX, each big money decision deep-researched against Stripe/IRS/NPSP/Blackbaud/CiviCRM/Baymard/FTC-ROSCA best practice and then pressure-tested by a 16/17-category ruthless adversarial review with a verify pass. Notable reversals — D1 named-destination → actually-direct charges; D2 compat-view → delete-and-replace; D8.c free-choice → guided-override-bounded-by-method; D14.2 first-touch → last-touch; D16.5 guarded → full self-serve — are the highest-signal parts of the record. READY).

> **Program:** SiteStacker Parity · **Base:** `develop` · **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`, `roadmap.md`
> **Production gate:** the receipt/tax and money-movement surfaces this phase feeds require review by qualified finance/tax counsel before production use (this document is not legal or tax advice). The one hard operational rule below (do **not** enable ACH until the dispute/return handlers ship) is a build gate, not counsel advice.

> **Binding recurring-domain supersession (2026-07-13).** Phase 16
> (Pledges & Recurring Commitments), decisions D1–D19, supersedes every Phase
> 13 instruction about recurring aggregate shape, provider topology, lifecycle,
> retries, pause/cancel/self-service behavior, completion/continuation,
> adoption/cutover, and recurring projections. Phase 13 remains authoritative
> for the append-only contribution ledger, Connect execution boundary, signed
> provider-event ingestion, designation eligibility, and money corrections.
> Historical recurring prose retained for decision provenance must never be
> implemented where it conflicts with the Phase 16 PRD, dated congruence
> package, ADRs 0012–0017, or OpenSpec delta. Issues #706–#710 are not safe to
> dispatch unchanged.

> **Binding generated-document ownership amendment (2026-07-21).** Phase 13
> remains the sole authority for posted ledger and line-level money truth. Phase
> 7 owns receipt/statement eligibility, legal-donor facts, and correction or
> issuance authority. Phase 18 alone owns generated-document definitions,
> publications, requests, artifacts, current heads, access, and document records
> evidence. The current `gift_receipt_records`,
> `contribution_receipt_snapshots`, staged receipt-status carrier, live download,
> and direct render paths are Phase 18 D17 prototype-removal targets; none is a
> document or receipt authority and none receives a compatibility runtime. Phase
> 13 emits exact immutable source facts and never computes, stores, or advances a
> generated-document artifact.

This is the **money backbone** of the platform: the append-only contribution ledger every gift is written to, the Stripe Connect posture that moves the money, the giving cart the donor uses, the recurring commitments that are a missionary's paycheck, the source codes and campaigns that explain what drove a gift, and the corrections/refunds finance performs on all of it. Today the platform records a gift as **one flat `donations` row** — one designation, one amount, an in-place status that mutates as Stripe events arrive, and a plaintext tenant Stripe key on the side. That single row cannot represent a split gift, cannot carry an immutable correction history, cannot separate the four things a nonprofit must keep separate (gross, designation, fees, deductible), and treats the payment processor's mutable state as the system of record. Phase 13 replaces the row with a **header + designation-lines + append-only postings** ledger where Asym Postgres is the source of record and Stripe is only the executor — so that a donor can give to five missionaries and a fund in one cart, finance can refund and re-designate without ever editing history, a returned ACH gift automatically reverses itself, and the money truth is one coherent, auditable, tenant-isolated record instead of a processor side effect.

---

## Problem Statement

The platform can take a donation. It cannot keep a defensible financial record of one. The whole money surface rests on a single flat gift row (`donations`), and every downstream need a real ministry has — split gifts, corrections, refunds that don't lose the fee, recurring gifts that survive a reissued card, campaigns that roll up honestly, a receipt that matches what the donor actually gave — has nowhere to stand. The failure is structural, and it hurts a different person at each layer:

1. **The donor cannot give the way they want to, and the record silently lies when they try.** A gift is `POST /api/donations` with `fund_id: null` and a single `missionaryId` — one target, one amount. There is no cart, so a donor who supports several missionaries makes several separate transactions. And where a split _is_ attempted, the reporting read (`fetchDonations` in `reports/service.ts`) attributes 100% of the gift to a single `donations.fund_id` — a split gift is misattributed today, and any "compatibility" layer that flattens header+lines back to one row would freeze that bug in as if it were correct. The donor also has no giving cart, no cross-device continuity, and no honest, method-aware way to cover processing fees.

2. **Finance cannot correct anything without destroying the audit trail.** Stripe outcomes mutate the `donations` row _in place_ as the record of truth — `donations.status` is free-text (`TEXT DEFAULT 'pending'`, no CHECK) with at least four drifting vocabularies across readers (`completed`/`succeeded`/`success`/display-`Succeeded`), a refund overwrites `refund_amount` on the paid row (losing the prior state), and `status='reversed'` is a flag that _hides_ a row from a total rather than a real reversing entry. There is no posting/ledger axis at all — the single biggest gap. Finance cannot answer "what changed, who changed it, and why," cannot re-designate a gift from one missionary to another without a manual patch, and `refundContribution` currently throws `501` because it was never wired. Worse, there is **no `charge.dispute.*` handler**: an ACH return or a card chargeback arriving weeks later is silently ignored — the money leaves, but the gift stays "completed" and its receipt stands.

3. **The missionary's income is fragile in exactly the way that matters most.** Recurring gifts are a missionary's paycheck, yet nothing in the codebase ever calls `stripe.subscriptions.create` — the platform only _consumes_ subscription webhooks and encodes recurrence three contradictory ways (`donation_type` + `is_recurring` + `pledge_id`). The webhook mapper collapses provider states into one mutable label and the data model cannot separate donor intent, schedule, occurrence, collection attempt, payment finality, provider control, or derived support health. Phase 13 therefore supplies the append-only money and signed-event substrate only; Phase 16 owns the current recurring topology, lifecycle, recovery, portal, and migration contracts. When a ministry is _adopted_ from another CRM, its existing recurring donor book still needs an import-aware home, but no Phase 13 legacy row or provider status may become that authority.

4. **The tenant does not truly own its money, and the platform holds a key it should never hold.** The repo stores **each tenant's own Stripe secret key in plaintext** (`tenants.stripe_secret_key TEXT`) and acts as that tenant — god-access, manual key-paste onboarding, and a master-key liability, all while the comparable `resend_api_key_encrypted` column proves the team knows better. The tenant's ownership of its funds is real but implemented as the most dangerous possible mechanism.

5. **Campaigns and attribution are a conflated mess, so nobody can say what a gift was _for_ or what _drove_ it.** The `campaigns` table forces _every_ row to be both an email blast **and** a donor-created missionary fundraiser (NOT NULL on both `creator_donor_id` and `missionary_id`) — two unrelated concepts welded together. Source is an unused free-text `donations.source DEFAULT 'direct'` — the exact CiviCRM free-text mistake that makes reporting a `LIKE '%yearend%'` guess. There is no first-class campaign, no source-code vocabulary, no UTM capture, and no way to roll a gift up to the effort that produced it.

6. **Money is formatted and stored in ways that will produce a wrong number.** `funds.current_amount` is a writable `NUMERIC` counter that drifts from reality; `receipt-record.ts` divides by 100 in a way that breaks zero-decimal currencies; and `donations.tenant_id` carries a hardcoded `…0001` default that quietly defeats tenant isolation. Each is a silent-money-error waiting to fire.

If a campaign product, an accounting export, offline gift entry, or a public progress bar ships on top of this flat row, each one will invent its own version of the money truth — the precise fragmentation this program exists to prevent. The current-code recon confirmed the platform has genuinely durable money primitives to build _on_ (an immutable per-attempt charge log, an append-only adjustment ledger with an effective-fold, a transactional-outbox donation saga that never touches Stripe inside the DB transaction, a signed Stripe-event ingestion ledger, three-layer idempotency, and a shared read model for display parity). What is missing is the **ledger they should all write to and read from**: one append-only header+lines+postings record, tenant-branded, correction-by-reversing-entry, with the money truth derivable only through one governed fold.

## Solution

A **server-authoritative, append-only contribution ledger** for donor intent,
legal donor, designation, Legal Entity, and posting meaning, wrapped in the
donor-facing giving cart, source-code attribution, and campaign model that a
modern ministry runs on. Stripe remains authoritative for the exact provider
execution, Balance Transaction, settlement, and payout evidence it emits;
Phase 20 normalizes and links that evidence without letting it rewrite the
source-domain contribution meaning. It is governed end-to-end by two founder
principles: **R-JW ("just works" — seamless and invisible to the donor,
effortless for the tenant, no hacky workarounds, modern best practice only)**
and **R-UX (best-in-class staff/admin UX — easy by default, powerful on demand
via progressive disclosure)**. The finished shape, in plain terms:

- **A header + designation-lines + postings ledger, append-only by construction.** One contribution = a **header** (the hard-tender total + a frozen legal-donor snapshot), **designation lines** (one target each — a missionary _or_ a fund — the money source of truth), and **postings** (the append-only entries that fold to the current value). A `BEFORE UPDATE OR DELETE` trigger makes a posted row immutable (RLS and REVOKE cannot — `service_role` holds `BYPASSRLS`); `sum(lines) = header` is enforced by a deferred constraint at commit; a per-header monotonic `seq` (never `created_at`) orders the fold; every row is tenant-branded with composite same-tenant foreign keys so a cross-tenant reference cannot resolve. The effective value is readable _only_ through the DB fold, guarded by a CI grep gate. This **replaces the flat `donations` table outright** (delete-and-replace, reusing the existing UUIDs so every `/contributions/{id}` URL and foreign key stays valid), with **no compatibility view, ever**.

- **Stripe Connect direct charges through the exact Legal Entity binding —
  Asym never in the flow of funds.** One hundred percent of donation money
  flows through the controller-properties connected account named by the
  effective-dated Settlement Account Binding for the contribution's Legal
  Entity/environment. The platform stores only the non-secret `acct_` reference
  in that binding, calls with `Stripe-Account`, and takes 0% of donations—no
  application fee. Tenant remains the isolation boundary; the Legal Entity is
  the merchant/settlement owner. Asym observes provider evidence and performs
  authorized operations without holding donor money. PCI remains SAQ-A.

- **One giving cart — mixed, invisible, cross-device.** A donor adds any
  number of designation lines, one-time or recurring, in a single cart with an
  above-the-fold Express Checkout (wallets/Link), a method-aware fee-cover
  toggle, and one confirmation. The one-time lines map to one PaymentIntent;
  recurring lines hand off to the Phase 16 recurring group and compatible
  cohort planner. Each compatible cohort has explicit provider execution legs:
  ordinary cadences normally use one subscription while twice-monthly uses
  separate 1st/15th legs. Every Asym line has one exact-bound item in every
  applicable leg—never one subscription per line by default and never
  `items[0]`. The webhook remains the sole money-
  final ledger writer. Guest carts are client-only (enumeration-safe);
  logged-in carts are owner-scoped and sync across devices with a guest→login
  merge. Every line is re-validated server-side against live tenant state
  (Phase 5 handoff), so a stale, restricted, or cross-tenant designation fails
  safe and never charges or leaks. _(Amended 2026-07-13 by Phase 16 D2–D4.)_

- **Recurring money remains ledger truth; recurring intent moves to Phase 16.**
  Phase 13 supplies the append-only contribution and provider-event substrate
  that each successful, processing, failed, returned, or reversed occurrence
  references. Phase 16 owns recurring groups, cohorts, independently
  manageable lines, donor-anchored civil-date schedules, commands, recovery,
  provider-control evidence, and derived health. Its separate state axes
  supersede this PRD's former six-state authority; its product-owned,
  rail-specific retry policy supersedes Stripe Smart-Retry scheduling; and
  control-loss quarantine supersedes any assumption that reconnecting or
  importing a provider object proves control. _(Dated amendment 2026-07-13.)_

- **Source codes and campaigns that answer "what drove this, and what was it for."** A first-class per-tenant **source-code** registry (channel × segment × message) captured per line at cart-add and frozen (copied immutably onto every recurring installment), with UTM capture (match-or-triage, never auto-mint), a `?sc=` query-string convention plus a short-link/QR layer, and raw UTMs kept off the immutable ledger (religious-affiliation privacy). A first-class **giving-campaign** — a time-bounded fundraising effort with typed goals and a bounded adjacency-list hierarchy — that rolls up gifts _through_ the source-code FK (one source of truth, no double-count), replacing the conflated email-blast/fundraiser `campaigns` table.

- **Corrections and refunds that never destroy history.** Staff work in plain language (effective values, intent verbs, before→after previews, mandatory reasons on risky actions); underneath, every correction is an append-only reversing/delta posting at the next `seq`. Refunds are recorded as intent and written to the ledger _only_ by the durable `charge.refunded` webhook; disputes/ACH returns are event-sourced through **new `charge.dispute.*` handling**; money-out actions are role-gated with an active audit feed and optional per-tenant separation-of-duties — not blocked behind mandatory second-approver workflows (right for a one-finance-person ministry).

- **Correct money and tender facts.** Integer minor units with explicit currency on every row (one currency per header, DB-enforced); seven first-class tenders (`card, ach, check, cash, stock→securities, in_kind, church_remittance`) plus a shared non-cash asset substrate for vehicle / securities / crypto / real-estate / DAF; exact-issuer jurisdiction-owned date-of-delivery dating resolved into immutable source facts; a **derived** fund progress (the writable `current_amount` counter is deleted).

The result: a donor gives once and to many, seamlessly; a missionary's recurring support is durable and recoverable; finance can correct, refund, and explain any gift without ever editing a record; the tenant owns 100% of its money on its own Stripe account with no key in Asym's hands; and every gift is one append-only, tenant-isolated, defensible financial fact that receipts (Phase 7), the CRM (Phase 9), reporting (Phase 33), and accounting export (Phase 20) all read from and none can contradict.

---

## Goals / Non-Goals

### Goals

- **Replace the flat `donations` row with the append-only header + designation-lines + postings ledger** as the single money source of record — delete-and-replace, UUID-reuse, no compatibility view (D2, D3).
- **Stand up Stripe Connect direct charges through exact, effective-dated
  Legal-Entity Settlement Account Bindings**, Asym never in the flow of funds,
  0% of donations, only the non-secret `acct_` reference stored in the binding
  (D1, D1b, Phase 20 D3)—and delete the plaintext tenant Stripe key (D1, D23).
- **Ship the giving cart** — mixed one-time/recurring, one confirmation, cross-device for logged-in donors, enumeration-safe for guests, server-revalidated per line (D15), with **method-aware, tenant-configurable, per-payment-type fee-cover** (D12).
- **Provide the ledger, Connect, signed-event, idempotency, designation-
  eligibility, and correction seams Phase 16 consumes**; do not build the
  superseded Phase 13 recurring object, six-state authority, per-line
  subscription topology, Smart-Retry policy, or `items[0]` mutation path.
  _(Amended 2026-07-13 by Phase 16 D1–D16.)_
- **Make source codes first-class** (registry + UTM capture + `?sc=`/short-link/QR + per-line frozen attribution) (D14, D14b), and **build the giving-campaign model** with typed goals and a bounded hierarchy, rolling up through the source-code FK (D13).
- **Model corrections/refunds/re-designations as append-only entries**, wire the refund path, and add the missing `charge.dispute.*` handling (D5, D7).
- **Establish the five orthogonal contribution status axes** (payment / ledger / receipt / accounting-export / review), each a DB-enforced state machine, replacing free-text `donations.status` (D7).
- **Capture correct money and tender facts** — integer minor units + per-currency, seven tenders + the non-cash asset substrate, and exact-issuer jurisdiction-owned date-of-delivery (D8, D10, D11).
- **Lay only the Phase 13 import-aware money seams** (tenant/account/mode-scoped
  external provider references and the `already_receipted` boundary). Phase 16
  owns recurring classification, civil-date scheduling, authorization and mandate
  provenance, control/adoption state, and any proof-gated cutover (D24, D25;
  superseded 2026-07-13 by Phase 16 D2/D4/D14/D16).
- **Mint the money capabilities and declare the SoD pairs** the Phase 12 PDP enforces (D20), and govern every ledger read/export through the Phase 3 projection chokepoint (D21) and the Phase 10 restricted-worker firewall (D22).

### Non-Goals (reserved seams, not builds)

- **Cross-processor PAN/ACH migration, donor re-authorization, recurring-object
  adoption, and bulk cutover tooling** — a separate dedicated migration
  workstream governed by Phase 16's proof-gated control and authorization
  contracts. Phase 13 owns only imported contribution/provider-reference
  evidence, including an explicit `already_receipted` source hint; Phase 7
  alone decides and versions receipt facts (D24, D25; superseded 2026-07-13).
- **Full CRM data migration at scale** (people/relationships/notes/tags/consent/historical giving) — the migration workstream (deps Phases 4/9/11); Phase 13 owns the payment/ledger seam and linkage model (D25).
- **Recurring intent, fixed-total pledges, fulfillment, donor/staff management,
  recovery policy, support health, and provider-control recovery** — Phase 16
  (`pledges-commitments`). Phase 13 ships the money ledger and provider-event
  substrate only. A fixed-total pledge and an automatic recurring commitment
  are distinct aggregates and are **never** auto-converted.
- **Donor-portal depth** (designation-edit polish beyond the eligibility guard, statements, preference center, magic-link, wallet) — Phase 25 (D16).
- **Public campaign pages, P2P/peer-to-peer fundraisers, and appeals** — Phases 22/36/27; Phase 13 reserves the `parent_campaign_id` self-FK and the by-id page reference, and moves all email/presentation fields _out_ of the campaign into their domains (D13).
- **Accounting/GL export execution and reconciliation** — Phase 20; Phase 13
  exposes exact source-occurrence identity and eligibility but reserves no
  writable export-status axis (D7, D9).
- **Reporting/BI dashboards and progress-chart UI** — Phase 33; Phase 13 ships the derived, per-currency, P10-safe progress _projection_ and names the v1 observability metrics (D13, D17).
- **Recurring and fixed-pledge communication-candidate policy** — Phase 16;
  consent, delivery, outcome history, and suppression — Phase 6; editable
  content — Phase 17. Phase 13 must not hardcode a delivery vendor or preserve
  stale continuation fields as a universal commitment mechanism.
- **Rendering tax documents** — Phase 7 owns immutable receipt/statement facts
  and correction authority; Phase 18 alone renders the canonical receipt,
  year-end statement, Form 1098-C / 8283, and quid-pro-quo artifacts. Phase 13
  captures and exposes source facts and never issues, re-issues, renders, or
  values a receipt itself (D8).
- **Custom fields on money-transaction records** — explicitly excluded in v1; funds may carry custom fields but they are default-closed and receipt-excluded (P11).

---

## Binding Predecessor Decisions

Phase 13 sits at the top of the parity stack: it **consumes** hard constraints ratified in Phases 1–12 and may not re-litigate them. These are the load-bearing contracts the money backbone is built on; violating any one of them is a defect, not a design choice. (Each is stated verbatim-in-spirit from the ratified predecessor PRDs and the Phase 13 Binding-Predecessor-Constraints record.)

- **Phase 1 (Source-of-Truth Ownership Matrix) — authority is source-specific.** Asym owns donor, designation, Legal Entity, contribution intent, and append-only posting truth. Stripe owns the exact provider execution, balance-transaction, settlement, and payout evidence it emits. A provider identifier (`pi_`, `ch_`, `sub_`, `cus_`, `acct_`) is a **source link, never the contribution's business identity**. Corrections happen **only via source- and cause-linked adjustment/posting occurrences** — never an in-place edit of a settled contribution. Phase 20 normalizes and links provider settlement evidence without letting that evidence redefine legal donor, designation, or Legal Entity.

- **Phase 2 (Site, Locale & Currency Foundation) — integer minor units and four orthogonal attribution axes.** Money is **integer minor units + validated ISO-4217 + per-currency exponent** (never a hardcoded ÷100); presentment currency **must equal** settlement currency in-phase (`assertTransactable`); reserved FX columns stay nullable. Phase 24 alone may later widen the source transaction allowlist; Phase 20 D20 only consumes exact downstream settlement and provider-conversion evidence and cannot make a foreign-currency checkout valid. Every ledger row carries the four orthogonal, indexed attribution axes — **`site_id` (NOT NULL), `entry_method` (enum), `source_code` (allowlisted, CSV-safe), `designation` (tenant-wide)** — and a recurring gift **copies attribution to each installment**.

  _(Downstream clarification, 2026-07-30, Phase 21 D6: Phase 13 remains the
  authority for the immutable contribution header/revision, source currency,
  and complete effective hard-tender line set—including fee-cover and other
  non-support lines. When a later Field Account admission uses a different
  currency, Phase 21 may reference but never rewrite those facts through one
  immutable Support Currency Allocation Manifest. That manifest allocates one
  exact typed organization-controlled target allocation basis across the
  complete frozen line set with the established deterministic
  largest-remainder minor-unit seam; only eligible non-fee-cover Designation
  target portions may create Gross Support Allocations. Each later
  cross-currency adverse occurrence uses its own successor/correction manifest.
  No manifest changes Phase 13 contribution, Designation, fee-cover, correction,
  or Phase 7 receipt truth.)_

  _(Downstream clarification, 2026-08-01, Phase 21 D21: Phase 13 remains
  authoritative for the original noncash Contribution, legal donor, accepted
  purpose, gift date, asset identity/description, valuation, receipt,
  supporter, and fundraising truth. Its noncash posting amount, recognized
  value, FMV, appraisal, and provider estimate are structurally ineligible for
  a monetary Phase 21 Support Allocation Candidate. Phase 15 owns the canonical
  append-only asset-lot/disposition/proceeds/finality/evidence/correction
  projection. Only one exact source-final D21 Realized Support Basis derived
  from that projection may later enter D2/D11 close; it never rewrites or
  duplicates the original gift.)_

- **Phase 3 (Minimum Permission & Role-Scoped Projection Foundation) — every sensitive read/write goes through the one projection chokepoint, fail-closed.** All sensitive ledger access flows through `resolveProjection`; **processor identifiers are hard-locked non-visible and non-exportable**; row scope is **subtract-only per viewer**; exports are **column-driven via `csvSafeCell`**; audit logs record **field keys, never dollar amounts**. Phase 13 adds no read or export path that bypasses this.

- **Phase 4 (Identity & Account-Claiming Foundation) — four distinct identities, and a frozen legal donor.** **Auth user ≠ donor ≠ Stripe customer ≠ legal donor.** The legal/hard-credit donor on a contribution is frozen as exact source evidence at acceptance; only intentional `unknown_offline` may be null. A proved same-person merge may repair the mutable canonical Party reference, but it never rewrites the frozen identity evidence or any derived official-facts version. Corrections never silently change the legal donor.

- **Phase 5 (Public Website Runtime Contract) — the server re-validates every reference before charge; the client amount is a suggestion.** On checkout the server **re-validates every designation reference against the resolved tenant** before any charge; the client-supplied amount and label are suggestions; an **invalid or cross-tenant designation fails safe** (dropped/flagged, never errored, never leaked, never mis-charged). The cart handoff is **enumeration-safe**.

- **Phase 6 (Shared Communication Event Model) — every donor-facing message
  goes through the event model.** Phase 13 records correction/void domain
  meaning, and Phase 16 records recurring/fixed-pledge domain meaning and
  candidates. Eligible current communications submit immutable
  `communication_intents` through the Phase 6 seam—never a hardcoded or ad hoc
  sender. Phase 6 owns consent, suppression, dispatch, delivery outcomes, and
  history, and creates `communication_events` only at actual dispatch or
  in-product publication; Phase 17 owns editable content. _(Amended
  2026-07-14.)_

- **Phase 7 (Receipt & Statement Compliance + Donor Credit) — Phase 13 FEEDS the receipt engine; it never forks it.** Phase 13 emits **append-only, monotonically-sequenced money postings**; Phase 7 reads the closed effective money shape via `deriveEffectiveContribution` and owns the immutable linear `contribution_dating_facts` authority. `sum(lines) = header` is **DB-enforced**. **Gross / designation / fees / deductible / benefit are kept as separate facts**; fee-cover remains its own ledger fact and, under the current counsel-gated D12 design, is included in the one deductible gift total for one-time and recurring occurrences alike. Phase 7 authorizes an official receipt only when its closed reason-aware exact-issuer resolver selects an admitting frozen plan or ordinary policy and the tender-specific source-finality rule also admits the occurrence; ACH `processing` never does. A later return, refund, or lost dispute appends source-owned inverse and correction effects. A prior issued receipt is never deleted or rewritten; it is retained and voided, corrected, or superseded through a successor version.

- **Phase 9 (Full CRM Depth & Relationship Graph) — contribution facts attach to the Party spine as party-keyed facts, not edges.** Gifts attach to the Party spine as **party-keyed facts behind `supports_policy_v1`** (settled, adjustment-folded) — **never as `crm_relationships` edges** — and a **giving-derived role never authorizes** anything.

- **Phase 10 (Sensitive-Data Classification & Restricted-Ministry Safety) — restricted-worker identity is structurally unreachable, and Phase 13 owns the fund-name rule.** A restricted worker's real identity is structurally unreachable via `toPublicProjection`. **Fund/designation names, slugs, Stripe descriptors, source codes, and search are all safety surfaces.** Phase 10 explicitly **deferred the fund-name rule to Phase 13**, which owns and enforces it here: **the restricted-fund public descriptor is an alias / fund-code, never the worker's real legal name** — validated at creation and re-checked on every egress door (checkout label, receipt, 1098-C/8283, progress bar, source code). An issued receipt is **never retracted on reclassification**.

- **Phase 11 (Custom Fields & Custom Collections) — money records get no custom fields in v1.** Money-transaction records carry **no custom fields**; funds _may_, but fund custom fields are **default-closed and receipt-excluded**. The `extensible_targets.campaign` row is **seeded DISABLED**, and **Phase 13 owns enabling it** when it defines the real campaign record.

- **Phase 12 (Full Role & Permission Configuration) — money reads/writes verify a signed EffectiveAccess; Phase 13 mints the money capabilities.** Every money read/write **verifies an HMAC-signed `EffectiveAccess`** (tenant branded, subtract-only floor always wins, revocation ≤60s); **capabilities are the only enforcement unit** (names never authorize). **Phase 13 mints the money capabilities** (refund, apply/approve corrections, re-designate, write-off, manage campaigns/source-codes, connect the Stripe account) and **declares the separation-of-duties pairs**; **Phase 12's PDP enforces** them. Per D5, money ops are role-gated + active-audit by default, with SoD as an **optional per-tenant policy configured in Phase 12**, never hardcoded mandatory here.

---

_Section anchors verified real-vs-forward as of authoring:_ `tenants.stripe_secret_key TEXT` (init_schema.sql:20), `funds.current_amount NUMERIC DEFAULT 0` (init_schema.sql:108), `donations.status TEXT DEFAULT 'pending'` (init_schema.sql:183), and the conflated `campaigns` table (init_schema.sql:261) are the present-state facts Phase 13 replaces; every "replace / delete / derive" statement above is a forward target, not an instruction to preserve current behavior.

## User Stories

Stories are grouped by actor and numbered continuously. Every story is grounded in a ratified Phase 13 decision (cited as `[Dn]`). Cross-phase touchpoints cite the phase by name, e.g. Phase 7 (Receipt, Statement, Compliance & Donor Credit). The governing bars behind every story are **R-JW** ("just works" — seamless/invisible to donors, effortless to tenants, no hacky workarounds) and **R-UX** (easy by default, powerful on demand).

### Public donor — the giving cart & checkout

1. As a **donor**, I want to add several designations to one giving cart (multiple missionaries, a project fund, the general fund) and give to all of them in a single checkout, so that I support everyone I care about without paying five separate times. `[D15]`
2. As a **donor**, I want to mix one-time and recurring gifts in the same cart (a one-time gift to a building project alongside a monthly gift to a missionary), so that I set up all my giving in one flow. `[D15, D15.1]`
3. As a **donor**, I want the split between my one-time and recurring gifts to be invisible at submit — one confirmation screen, one flow — so that I never have to think about how the payments are structured under the hood. `[D15.1]`
4. As a **donor**, I want to add another designation inline with a quiet "add another designation" action, so that expanding my gift is obvious but never clutters the page. `[D15, D15/D12 review]`
5. As a **donor**, I want to set each line to one-time or monthly with an inline per-line toggle, so that I control the cadence of each gift independently. `[D15]`
6. As a **donor**, I want a sticky running total that never scrolls away and a clear tax note, so that I always know exactly what I'm giving before I confirm. `[D15/D12 review]`
7. As a **donor** on my phone, I want a thumb-reachable checkout CTA and a total that stays visible, so that giving on mobile is effortless. `[D15/D12 review]`
8. As a **donor**, I want the whole checkout on a single page with the fewest possible fields (6–8, autofilled where possible), so that I can finish in seconds. `[D15/D12 review]`
9. As a **donor**, I want an amount minimum of $1 per line and a friendly cap of up to 50 lines, so that the cart stays sane without getting in my way. `[D15.3, D15.4]`
10. As a **donor** who accidentally added the same designation twice, I want the cart to dedupe identical designation+frequency lines, so that I don't double-give by mistake. `[D15]`

### Public donor — wallets, guest checkout & payment

11. As a **donor**, I want Apple Pay, Google Pay, and Link offered prominently above the fold, so that I can pay with a saved wallet in one tap. `[D15/D12 review]`
12. As a **donor**, I want to give as a guest without being forced to create an account, so that a required signup never stops me from completing my gift. `[D15/D12 review]`
13. As a **donor**, I want to be offered an account only after I've given, on the confirmation screen, so that account creation is a convenience, not a gate. `[D15/D12 review]`
14. As a **donor**, I want to enter my card once and have that same method confirm my one-time gift and set up every recurring gift in the cart, so that I never re-enter payment details per line. `[D15/D12 review]`
15. As a **donor**, I want my card details to live entirely inside Stripe's secure fields and never touch the ministry's or Asym's servers, so that my payment data stays safe (SAQ-A). `[D1]`
16. As a **donor** setting up multiple monthly gifts, I want a clear disclosure like "you'll see N separate monthly charges from [Ministry], one per designation," so that my bank statement never surprises me. `[D15.2, D15/D12 review]`
17. As a **donor**, I want each monthly charge to show a recognizable ministry-branded descriptor with the designation, so that I recognize the charge and never dispute it by accident. `[D15/D12 review]`
18. As a **donor** whose payment is declined, I want the cart to re-render intact so I can fix my method and retry, so that a decline doesn't lose my whole cart. `[D15/D12 review]`
19. As a **donor** who hit a "confirm your card" (SCA) step on a recurring gift, I want that to be handled gracefully so my sustaining gift actually gets set up, so that a common authentication step never silently drops my monthly commitment. `[D15/D12 review]`

### Public donor — cross-device & saved cart

20. As a **logged-in donor**, I want items I add to my cart to follow me across devices (add on my phone, finish on my laptop), so that I can give whenever it's convenient. `[D15 cross-device]`
21. As a **guest donor**, I want my cart to survive in my browser for up to 90 days if I step away, so that I can come back and finish without rebuilding it. `[D15.3]`
22. As a **donor** who built a cart as a guest and then logged in, I want my guest cart merged into my account cart sensibly (no silent doubling of amounts), so that logging in never corrupts what I intended to give. `[D15/D12 review]`
23. As a **donor** who returns to an old cart, I want every line re-checked against what's currently available before I pay, so that I never get charged for a designation that's closed or changed. `[D15]`
24. As a **donor**, I want a resumed cart to re-price and re-mint its payment intent on load, so that a stale saved cart can never charge an old or wrong amount. `[D15/D12 review]`

### Public donor — designation safety & honesty at checkout

25. As a **donor**, I want a designation that became inactive or met its goal while it sat in my cart to be quietly dropped or flagged "no longer available," with the rest of my gift proceeding, so that my whole checkout never fails over one stale line. `[D15]`
26. As a **donor**, I want the server to re-validate every line against live ministry state at submit, so that my money always goes exactly where the site currently says it can. `[D15, P5]`
27. As a **donor**, I want an invalid or cross-tenant designation to fail safe (never charged, never mis-routed, never leaking another org's data), so that a bad link can't send my gift to the wrong place. `[D15, P5]`
28. As a **donor** giving to a missionary in a sensitive context, I want the public label to always resolve to the current safe display name (never a stale or restricted real name), so that convenience features never expose someone. `[D15/D12 review, D22]`
29. As a **donor**, I want one cart to stay a single currency (no silent currency mixing), so that I always know exactly what currency I'm being charged in. `[D15]`

### Public donor — covering fees

30. As a **donor**, I want the option to cover the processing fees so that as close to 100% of my gift reaches the field, so that my chosen amount actually lands with the ministry. `[D12]`
31. As a **donor**, I want fee-cover ON by default with one clear toggle to decline, so that helping is the easy path but I'm never trapped into it. `[D12.1]`
32. As a **donor**, I want the fee-cover amount shown as an honest **estimate** ("cover estimated processing fees"), never as a false-precise exact fee, so that I'm told the truth. `[D12]`
33. As a **donor**, I want the fee-cover recomputed for my actual payment method (card vs bank/ACH), so that I'm not over-charged an ACH gift at card rates. `[D12]`
34. As a **donor**, I want the checkout to itemize my gift clearly — "Your gift: $100 / Cover processing fees: +$3 / Total: $103" — so that I see exactly what I'm paying and why. `[D12 amendment, R-UX]`
35. As a **donor**, I want the fee-cover math kept simple on my side (clean dollar amounts, no exposed formulas), so that covering fees never feels complicated. `[D12 amendment]`
36. As a **donor**, I want my covered fees to be part of my one deductible receipt total, so that I get full credit for what I actually gave. `[D12]`
37. As a **donor** at a ministry that applies a mandatory processing contribution to card gifts, I want it framed as part of my charitable gift total (not a "card fee/surcharge") and disclosed before I confirm, so that I know my exact total up front and it's a real gift, not a hidden add-on. `[D12 amendment]`
38. As a **donor** paying with a debit or prepaid card at such a ministry, I want any mandatory card uplift automatically downgraded to optional for me, so that the rules that protect debit users are honored. `[D12 amendment]`
39. As a **donor** on a recurring gift, I want my fee-cover recomputed each installment (never frozen to a stale figure) and never silently increased, so that my monthly total stays honest and predictable. `[D12, D12 amendment]`

### Public donor — receipts & attribution at gift time

40. As a **donor**, I want one consolidated receipt for my whole multi-designation cart, so that I get a single clean record instead of a pile of emails. `[D15.1]`
41. As a **donor**, I want my gift to carry where it came from (the newsletter link, the banquet QR, the year-end appeal) automatically, so that the ministry knows what moved me without me doing anything. `[D14]`
42. As a **donor**, I want a scanned QR or short link to send me to the right giving page with attribution already applied, so that I never see or have to type a tracking code. `[D14b]`

### Phase 16-owned recurring donor and fixed-pledge contract

> **Supersession (2026-07-13):** historical Phase 13 recurring portal,
> cancellation, recovery, and fixed-term stories 43–70 are removed as build
> authority. Phase 13 supplies the ledger, Connect, provider-event, designation,
> and correction seams only. The Phase 16 PRD owns the complete donor and staff
> behavior.

- One explicit recurring-giving group contains stable, independently manageable
  destination lines and only compatible billing cohorts. Provider execution uses
  exact execution-leg and item bindings; no array ordinal or per-line-
  subscription assumption is authoritative.
- Donors can preview and manage next date, amount, cadence, destination, payment
  method, optional end date, skip, bounded/indefinite pause, resume, cancel, and
  restart through idempotent, revision-fenced Phase 16 commands. No change
  silently prorates, catches up, back-charges, or mutates a sibling line.
- Card and ACH recovery, failure episodes, meaningful-transition communication
  candidates, provider-control quarantine, and derived support health follow
  Phase 16 D6–D16. A mutable `lapsed` row state, generic provider retry policy,
  or cancellation inferred from a failure is forbidden.
- A fixed-total campaign pledge is a separate, usually offline promise with an
  optional expectation plan. It never becomes a recurring payment or owns an
  executor; posted gifts fulfill it only through conserved Phase 16 fulfillment
  applications.

### Donor — receipts, statements & corrections (self-service)

71. As a **donor**, I want a correct receipt for every gift including the fees I chose to cover, so that my record matches what I actually paid. `[D12, P7]`
72. As a **donor** whose ACH gift was returned weeks later, I want my receipt automatically voided or reduced and to be notified, so that a good-faith early receipt never becomes a wrong tax document. `[D7, D8]`
73. As a **donor** whose gift was corrected or partially refunded, I want a new receipt version with a "corrected" badge (the prior retained), so that my paperwork stays honest and legible. `[D5, P7]`
74. As a **donor**, I want a prior-year receipt to never be silently retracted — only superseded with an explanation — so that my past filings aren't undermined. `[D5, P10]`

### Finance staff — recording & correcting gifts

75. As **finance staff**, I want to open a gift and see plain-language effective values and a readable change history ("$75→$50; Fund A→Fund B, by Jane, reason: donor request") — never raw debits, credits, or sequence numbers — so that I understand a gift at a glance. `[D5, R-JW]`
76. As **finance staff**, I want to act via clear intent verbs (Refund, Change amount, Move/re-split designation, Add/remove line, Void, Write off, Undo correction), so that I never touch a raw status dropdown that could corrupt the record. `[D5]`
77. As **finance staff**, I want a before→after dollar preview before I commit any correction, so that I see exactly what will change. `[D5, R-UX]`
78. As **finance staff**, I want a mandatory reason on every risky money action, recorded immutably, so that every correction is defensible. `[D5]`
79. As **finance staff**, I want corrections to append immutable reversing entries (never edit or delete the original), so that the audit trail is tamper-evident by construction. `[D3, D5]`
80. As **finance staff**, I want to undo a correction by appending a new negating entry (not by editing history), so that even my fixes are auditable. `[D5]`
81. As **finance staff**, I want to change a gift's amount and have the line and header adjust in balance, so that the ledger always stays internally consistent. `[D3, D5]`

### Finance staff — refunds, voids & write-offs

82. As **finance staff**, I want to issue a full refund from the CRM that debits the ministry's own Stripe balance, so that I never leave the system to return a donor's money. `[D1, D5]`
83. As **finance staff**, I want the refund's ledger entry written only when Stripe's `charge.refunded` webhook confirms it (never posted optimistically inline), so that our books only ever reflect money that actually moved. `[D5, D7]`
84. As **finance staff**, I want a refund to automatically include any fees the donor covered, so that the donor is made whole. `[D12, D5]`
85. As **finance staff**, I want to issue a partial refund across a split gift with the amount auto-prorated across designations by default, and an advanced per-line override when I need it, so that the common case is one action and the edge case is still possible. `[D5.b, R-UX]`
86. As **finance staff**, I want to void a gift that returned no money (kind = void, no tender return), so that a cancelled-before-settlement gift is handled distinctly from a refund. `[D5]`
87. As **finance staff**, I want to write off an uncollectible gift (kind = write_off), reported separately, so that write-offs don't distort real giving totals. `[D5.c]`
88. As **finance staff** at a small org, I want refunds, write-offs, and re-designations gated by my finance/admin role plus a mandatory reason and full audit — not blocked behind a forced second approver — so that a one-person finance team can actually operate. `[D5.a, D5.c, founder governance]`
89. As **finance staff**, I want an ACH return, check NSF/bounce, or card chargeback to automatically post a compensating reversal and cascade the receipt void — never an in-place edit — so that failed money is handled correctly and consistently. `[D5, D7, D8]`

### Finance staff — re-designation

90. As **finance staff**, I want to move or re-split a gift's designation (including across missionaries) immediately, role-restricted with a full audit trail and no forced second approver, so that I can honor a donor's redirect request without stalling. `[D5.a]`
91. As **finance staff**, I want a cross-missionary re-designation to be sum-preserving (money moves, header total unchanged), so that re-designating never accidentally changes the gift amount. `[D3, D5]`
92. As **finance staff**, I want both affected missionaries' support progress to recompute from effective lines after a re-designation, so that neither is double-counted and both totals are true. `[D5]`
93. As **finance staff**, I want a re-designation that doesn't change the tax year or total to correctly produce no new receipt (a no-op on the receipt), so that I don't generate needless documents. `[D5, P7]`

### Finance staff — offline & special tenders

94. As **finance staff**, I want to record an offline card gift with its PI, brand, last4, and settlement timestamp, so that offline card gifts carry the same facts as online ones. `[D8]`
95. As **finance staff**, I want to record an ACH/bank gift with its mandate and bank last4, treated as provisional until settled, so that we never receipt bank money that might still bounce. `[D8, D7]`
96. As **finance staff**, I want to record a check with its check number (distinct from the deposit reference), postmark or other contract-permitted mailing evidence, and received date, so that the exact issuer's jurisdiction contract places it in the right tax year. `[D8]`
97. As **finance staff**, I want to record cash with the received date, receiving-staff id, and deposit reference, dated as received and final on record, so that cash gifts are captured cleanly and attributably. `[D8]`
98. As **finance staff**, I want to record a securities gift (publicly-traded stock, non-public stock, or crypto) with its identifier, share/coin quantity, delivery date/time, and FMV method appropriate to its asset class, so that each security is valued by the right rule. `[D8, D8.a]`
99. As **finance staff** recording crypto, I want the system to treat it as property (appraisal required over $5k, exchange price insufficient, intraday delivery timestamp), so that we never mis-derive that no appraisal is needed. `[D8.a]`
100.  As **finance staff**, I want a vehicle gift captured with VIN, year/make/model, odometer, and condition, auto-posting the gift while the disposition/proceeds are tracked separately, so that accepting a car is simple and the deduction facts follow. `[D8.a]`
101.  As **finance staff**, I want to record a vehicle's disposition (sold arm's-length, significant use, material improvement, given to the needy below FMV, or retained) with date and gross proceeds, so that the donor's deductible value is grounded in what actually happened. `[D8.a]` _(Amended 2026-08-01 by Phase 21 D21: the command appends Phase 15-owned source evidence and Phase 13 reads its contribution-linked compliance projection. A staff selection cannot establish source finality, create cash, or create a Field Account effect.)_
102.  As **finance staff**, I want a real-estate gift captured as a guided, stepped intake that always routes to committee review and never auto-posts, so that title/environmental/lien risk is a human decision, never a silent placeholder on a receipt. `[D8.a]`
103.  As **finance staff**, I want a general in-kind gift described (not valued) on the receipt, with an optional internal value that is clearly marked as never appearing on the receipt, so that we meet IRS rules and never mislead a donor about deductibility. `[D8.b, R-UX]`
104.  As **finance staff**, I want a Donor-Advised Fund (DAF) grant to credit the sponsoring organization as the legal donor (advisor as soft credit only, no benefit/quid-pro-quo), so that we never tell a DAF advisor their grant is deductible to them. `[D8.a]`
105.  As **finance staff**, I want a church bulk remittance recorded as one header crediting the church, with individual givers recognized via a soft-credit overlay on the lines (not extra headers or lines), so that the church gets the receipt and individuals still get recognition without double-counting. `[D8]`
106.  As **finance staff**, I want offline gifts to move through recorded → deposited → cleared, with check NSF handled just like an ACH return (a compensating reversal, never an edit), so that offline lifecycles are as correct as online ones. `[D8, D7]` _(Amended 2026-07-11, Phase 15 (Offline Gift & Batch Entry) D6/D5: `recorded` = entry/posting (D5 validate = post — not a gate before posting), and `deposited`/`cleared` are the Phase 15 **6th orthogonal deposit-state axis** formalizing this narrated lifecycle, **not** sequential posting gates on the money; the NSF compensating-reversal clause is unchanged.)_

### Finance staff — gift dating & tax year

107. As **finance staff**, I want each tender to pre-select the dating basis permitted by the exact issuer's jurisdiction contract—with a live tax-year preview before I save—so that gifts land in the right year without inheriting another jurisdiction's rules. `[D8, D8.c]`
108. As **finance staff**, I want to choose only among the bases permitted by the exact issuer's jurisdiction contract—with postmark, staff-attested mailing, and received shown as distinct U.S. check facts—so that I have flexibility without falsifying evidence or creating a wrong-tax-year receipt. `[D8.c]`
109. As **finance staff**, I want a delivery-basis override that crosses into an already-issued statement year to require auditable staff attestation by default, with independent review only when tenant or jurisdiction policy strengthens it, so that changing a closed year is controlled without a universal approval ceremony. `[D8.c]`
110. As **finance staff**, I want to backdate a legitimate prior-year gift via a staff-attested, append-only adjustment by default, with cutoff or approval gates only when tenant or jurisdiction policy requires them, so that our records are correct but not abusable. `[D8]`
111. As **finance staff**, I want gift dates resolved once at capture in the exact legal issuer's verified tax timezone—with the policy and timezone used frozen on the occurrence—so that a midnight-December-31 gift remains reproducible and correct after later configuration changes. `[D8]`

### Finance staff — fee-cover configuration & visibility

112. As **finance staff**, I want the fee-cover mechanics shown clearly (intended amount · fee-cover estimate · gross charged) on each gift, so that I can always explain what a donor paid. `[D12.1, R-UX]`
113. As **finance staff**, I want to see the fee-cover as its own dedicated ledger line (not silently blended into ministry designations), so that net-to-missionary is never misstated. `[D12]`

### Finance staff — review queue & exceptions

114. As **finance staff**, I want gifts that reach their tender-specific
     posting milestone to auto-post with no artificial delay, and only genuine
     exceptions to land in my review queue, so that giving is
     invisible/effortless to donors and I only touch what needs a human. A
     provisional posting remains visibly provisional and is not final settlement.
     `[D7.a]`
115. As **finance staff**, I want the review queue to fail closed on risky cases (large gifts, restricted-ministry gifts, imported gifts, ambiguous donor matches), especially for a brand-new tenant with no config yet, so that nothing risky auto-posts by default. `[D7 review]`
116. As **finance staff**, I want a simplified, money-oriented gift view with raw provider detail available on drill-down, so that the everyday view is clean and the deep detail is one click away. `[D7.b, R-UX]`
117. As **finance staff**, I want a provisional ACH gift to show a "return-exposed until [date]" badge, so that I know at a glance which money isn't final yet. `[D7.b, D7 review]`
118. As **finance staff**, I want a payment's Stripe state to never overwrite the receipt or accounting truth (each is its own append-only axis), so that a refund can't erase the fact that money was once received. `[D7]`

### Finance staff — active audit & anomaly alerting

119. As **finance staff**, I want a live correction/refund activity feed and real-time notifications to other finance/admins on every money-out action, so that no refund or write-off is ever invisible. `[D5 reconciliation]`
120. As **finance staff**, I want an optional per-tenant dollar-threshold anomaly alert (default ~$1,000), so that unusually large actions get a second set of eyes without blocking normal work. `[D5 reconciliation]`
121. As **finance staff** at a larger org, I want the option to turn on a required second approver for refunds, write-offs, or cross-missionary re-designations (off by default, configured in Phase 12), so that we can add a preventive control when we have the staff for it. `[D5 reconciliation, P12]`

### Finance staff — source codes & attribution

122. As **finance staff**, I want source codes to be a governed, first-class list (channel × segment × message) rather than free text, so that reporting groups by a real key instead of guessing at typo'd strings. `[D14]`
123. As **finance staff**, I want to retire a source code without deleting it (historical gifts keep pointing at it), so that I can clean up the active list without rewriting history. `[D14]`
124. As **finance staff**, I want a tagged-link builder that emits both a canonical `?sc=` link and a short link plus a downloadable QR for each source code, so that print, QR, email, and SMS all track correctly with no manual URL work. `[D14b]`
125. As **finance staff**, I want unmatched inbound UTMs held for triage (never auto-minted into codes), with a reusable alias rule when I resolve them, so that I clean up attribution once per distinct string, not once per gift. `[D14.1, D14 review]`
126. As **finance staff**, I want to hand-assign or override a gift's source code with an audit trail (raw UTM preserved), so that I can correct attribution without losing the original signal. `[D14.4]`
127. As **finance staff**, I want reporting to default to last-touch attribution (the gift-driving ask) with first-touch one click away, and the touch model labeled on every report, so that no number is ambiguous. `[D14.2, D14 review]`
128. As **finance staff**, I want a gift with no matchable source to report honestly as "Unknown / Direct" (never a fabricated appeal), so that attribution is truthful. `[D14]`
129. As **finance staff**, I want a recurring gift's attribution frozen at creation and copied unchanged onto every installment, so that a year-1 gift still reports under its original code in year 3 even after the code is retired. `[D14.5]`

### Finance staff — campaign management

130. As **finance staff**, I want to create a time-bounded giving campaign with a name, dates, and one or more typed goals (monetary, donor count, recurring supporters, gift count) or none, so that I can track a fundraising effort exactly how I need to. `[D13, D13.2]`
131. As **finance staff**, I want a campaign to span many designations (several missionaries plus the general fund) with no fund "owned" by the campaign, so that a real-world campaign isn't forced into a single beneficiary. `[D13]`
132. As **finance staff**, I want campaign progress derived from posted effective lines (never a stored counter that can drift), grouped by currency, excluding refunded/failed gifts, so that the number I show is always true. `[D13, D17]`
133. As **finance staff**, I want a campaign-generation wizard that produces one source code per intended fund/channel with consistent naming, so that spinning up a campaign across many funds is effortless. `[D13.1]`
134. As **finance staff**, I want a coverage panel showing intended vs received designations ("intended 6 funds, received on 5, 1 at $0"), so that I can see gaps in a campaign at a glance. `[D13 review]`

### Finance staff — campaign hierarchy

135. As **finance staff**, I want to nest campaigns in a parent/child hierarchy (bounded to 5 levels), so that I can model an umbrella effort with sub-campaigns and teams. `[D13.4, D13 review]`
136. As **finance staff**, I want each gift to attribute to exactly one campaign node, with a node's total and a whole-subtree total shown as two clearly distinct measures (never parent-own-plus-child-sum), so that the classic double-count bug can't happen. `[D13 review]`
137. As **finance staff**, I want a progress display with an explicit scope toggle ("This campaign only" vs "Including N sub-campaigns"), so that I never accidentally hand-add parent and child totals. `[D13 review]`
138. As **finance staff**, I want the system to refuse to reparent a campaign into a cycle or beyond the depth cap, and to block reparenting a closed/archived campaign, so that closed-period totals are never retroactively rewritten. `[D13 review]`
139. As **finance staff**, I want a campaign total and a fund total understood as two different lenses on the same dollars (never summed as if disjoint), so that reports don't overstate giving. `[D13, D13 review]`

### Finance staff — reports & exports

140. As **finance staff**, I want to export contribution data with every cell CSV-injection-safe (formula-prefixed cells neutralized), so that opening an export in a spreadsheet can never execute a malicious payload. `[D14 review, P3]`
141. As **finance staff**, I want report totals grouped by currency (never a cross-currency scalar), so that a multi-currency ministry's numbers are always meaningful. `[D3, D11]`
142. As **finance staff**, I want reports to read the frozen source-code snapshot on the posting (label/channel/segment as-of the gift), so that relabeling a code later never rewrites historical reports. `[D14 review]`
143. As **finance staff**, I want campaign rollups to read the live campaign linkage as-of report time (the one deliberate exception to the freeze rule), so that re-parenting a source code into a campaign is reflected without a ledger retrofit. `[D14 review, D13]`
144. As **finance staff**, I want exports to never include processor identifiers or a donor's raw internal fields (column-driven, projection-governed), so that an export can't leak what a screen wouldn't show. `[D21, P3]`

### Recurring donor's supporting cast — missionary

145. As a **missionary**, I want cash received this month shown before every
     expectation or forecast, so I never mistake scheduled support for money
     the ministry actually received. `[Amended 2026-07-13, P16 D13]`
146. As a **missionary**, I want automatic recurring outcomes and my permitted
     recurring-support list through the redacted projection, with donor
     anonymity enforced before rows and totals, so I receive useful insight
     without seeing restricted information. `[Amended 2026-07-13, P16 D9/D13]`
147. As a **missionary**, I want an affected line to say **Paused — resumes on
     [date]** or **Paused indefinitely**, and to remain visible, so I never
     infer a pause from missing transactions. `[Amended 2026-07-13, P16 D5]`
148. As a **missionary** to whom an exact next or resume date could identify a
     donor, I want the date coarsened or suppressed by the privacy projection,
     so small-number reporting cannot defeat anonymity. `[Preserved, P10/P16]`
149. As a **missionary**, I want fixed-total pledges hidden from the primary
     recurring experience unless one actually applies to me, so a rare legacy
     workflow does not create noise. `[Amended 2026-07-13, P16 D13/D17]`
150. As a **missionary**, I want an in-product notice on meaningful recurring
     changes such as a terminal missed occurrence, pause, recovery, or loss of
     automatic collection, with confirmation that donor outreach occurred only
     when delivery outcome supports that claim. `[Amended 2026-07-13, P16 D9]`

### Development / fundraising staff

151. As **development staff**, I want a prioritized recurring-attention queue
     derived from named facts and reasons, so I can distinguish donor action,
     provider-control loss, reconciliation staleness, repeated ordinary misses,
     and a voluntary pause without decoding provider statuses. `[Amended
2026-07-13, P16 D12/D16]`
152. As **development staff**, I want shared provider-control failures collapsed
     into one tenant incident with an affected count and drill-down, so one
     account problem never creates a task storm. `[Amended 2026-07-13, P16 D16]`
153. As **development staff**, I want stale or unknown recurring truth excluded
     from healthy forecasts and routed for bounded review, so an unreachable
     donor or unproven executor never becomes a silent write-off or a false
     promise. `[Amended 2026-07-13, P16 D12/D16]`

### Donor care

154. As **donor-care staff**, I want to explain to a donor why they were charged $103 instead of $100 (their $100 gift plus $3 covered fees), reading it straight off the itemized ledger, so that I can answer a "what is this charge?" call in seconds. `[D12 amendment, D5]`
155. As **donor-care staff**, I want to see a gift's plain-language history and effective values (not raw postings), so that I can explain any change to a donor without decoding the ledger. `[D5, R-JW]`
156. As **donor-care staff**, I want one clear summary plus separate donor-
     intent, schedule, collection, payment, provider-control, and health facts,
     so a convenient label never hides what is actually happening. `[Amended
2026-07-13, P16 D12/D15/D16]`
157. As **donor-care staff**, I want recurring lines grouped for the donor and
     split into clearly explained compatible collection cohorts only when
     execution requires it, so I can explain one or several charges without
     implying every destination always creates its own debit. `[Amended
2026-07-13, P16 D2]`

### Organization admin — Stripe onboarding & configuration

158. As an **org admin**, I want to connect my ministry's own Stripe account through Stripe-hosted onboarding (a redirect, then done), so that setup is a guided flow, not a manual key-paste. `[D1]`
159. As an **org admin**, I want 100% of donations to flow through my ministry's own Stripe account with Asym never in the flow of funds, so that we retain full ownership of our money and payouts. `[D1]`
160. As an **org admin**, I want Asym to take 0% of donations (no application fee ever), so that donors know Asym never reduces their gift through a platform cut. `[D1b]`
161. As an **org admin**, I want Asym to observe our gifts, refunds, disputes, and payouts into the CRM and let us issue refunds from the CRM, without ever touching or holding our funds, so that we get full CRM control without handing over custody. `[D1]`
162. As an **org admin**, I want the platform to store only my Stripe account id (never a secret key), so that there's no plaintext master key to leak. `[D1, D23]`
163. As an **org admin**, I want to configure fee-cover per payment method (card vs ACH) with a simple rate and mode (optional opt-out, optional opt-in, or mandatory), so that I can set a card rate and a bank rate that each reflect their true cost. `[D12 amendment]`
164. As an **org admin**, I want a clean two-row config matrix (Card / ACH → enabled · rate · mode) with inline warnings, so that fee-cover setup is obvious and I can't misconfigure it silently. `[D12 amendment]`
165. As an **org admin** enabling mandatory card fee-cover, I want a warning banner about card-network and state-law rules and a rate clamp (≤3%, default off), so that I'm protected from accidentally creating an unlawful surcharge. `[D12 amendment]`
166. As an **org admin**, I want fee-cover config to fail closed (default optional opt-out, mandatory off, never a garbage rate), so that a misconfiguration can never default to the riskiest behavior. `[D12 amendment]`
167. As an **org admin**, I want to set and verify each legal issuer's tax timezone (IANA) and applicable prior-year policy, so that year-end dating is correct for the issuer without an invisible U.S. default. `[D8]`
168. As an **org admin** of a non-US tenant, I want the system to refuse to silently default my tax config to US rules (fail closed with an onboarding gate), so that year-end gifts are never mis-filed. `[D8 review]`

### Organization admin — onboarding an existing ministry (migration seam)

> **Phase 16 supersession (2026-07-13).** Phase 13 owns only imported money,
> exact tenant/account/livemode-scoped external references, and the
> `already_receipted` boundary. Phase 16 owns recurring classification,
> Commitment Party and authorization identity, civil-date schedules, mandate
> provenance, control-loss quarantine, adoption, and proof-gated cutover.

169. As an **org admin**, I want imported provider and ledger references bound to
     the exact tenant, connected account, mode, Party, and source object, so that
     an import can never guess across customers, accounts, or organizations.
     `[D24, D25; amended by Phase 16 D14/D16]`
170. As an **org admin**, I want imported historical gifts flagged as
     `already_receipted`, so Asym never re-issues a receipt the old system already
     sent. `[D24, D25]`
171. As an **org admin**, I want unmatched or ambiguous external records
     quarantined for review rather than linked by email, name, phone, or payment
     fingerprint, so migration cannot silently attach money or authority to the
     wrong Party. `[D25; amended by Phase 16 D14/D16]`
172. As an **org admin**, I want the platform never to handle raw card or bank
     credentials during migration, so a cutover cannot expand PCI or bank-data
     exposure. `[D24, D25]`
173. As an **org admin** whose donors can't be migrated without action, I want a hosted "confirm your recurring gift" re-authorization flow, so that we have a clean fallback path even when zero-gap isn't possible. `[D24]`

### Organization / the ministry

177. As the **organization**, I want our own bank, descriptor, liability, and payouts on every gift (Asym as control plane only), so that our donors see our brand and our money is ours. `[D1]`
178. As the **organization**, I want provisional ACH gifts counted toward private finance totals immediately but kept out of public progress bars until settled (unless we opt in), so that public numbers reflect money that's actually landed. `[D7 review]`
179. As the **organization**, I want restricted-worker real identities structurally unreachable on every money surface (names, slugs, Stripe descriptors, source codes, receipts, 1098-C/8283 egress), so that a gift flow can never expose someone in a sensitive context. `[D22, P10]`
180. As the **organization**, I want a restricted fund's public descriptor to be an alias or fund-code, never the worker's real name, so that public campaign and progress displays are safe. `[D13 review, D22]`
181. As the **organization**, I want raw UTM data (which in a missions context can reveal religious-affiliation) kept off the immutable ledger in a separate erasable log with a redaction path, so that we can honor an erasure request without breaking the append-only ledger. `[D14 review, P10]`
182. As the **organization**, I want money reads and writes to verify HMAC-signed effective access (tenant-branded, subtract-only floor wins, revocation within 60s), so that permission is enforced by construction on every financial operation. `[D20, P12]`
183. As the **organization**, I want the ledger to be topology-agnostic (Stripe ids are links, tenant branded on every row), so that our financial truth lives in our own database, not in the processor. `[D1, P1]`
184. As the **organization**, I want a funnel/abandonment/failed-sub/fee-reconciliation instrumentation surface for giving, so that we can actually measure completion, recovery, and whether our fee estimate matches reality. `[D15/D12 review, D16 buildout]`

### Developer / platform

185. As a **developer**, I want the contribution ledger to be a header + designation lines + append-only postings, with the DB enforcing `sum(lines) = header` at commit, so that a split gift always balances and can never be silently misattributed. `[D3]`
186. As a **developer**, I want posted rows made immutable by a BEFORE UPDATE/DELETE trigger that RAISEs (not RLS, which service_role bypasses), so that "append-only" is true even under the service role. `[D3]`
187. As a **developer**, I want corrections modeled as new negating entries with `reversed` as a derived read flag (never a status flip that hides a row), so that the fold always sees the full provenance. `[D3, D5]`
188. As a **developer**, I want the effective value folded by a monotonic per-header sequence (never `created_at`, which ties non-deterministically in one transaction), so that the folded result is always deterministic. `[D3]`
189. As a **developer**, I want effective values readable only through the derivation (base money columns writer-role-only, enforced by a CI grep gate), so that no reader can accidentally show pre-correction amounts. `[D3]`
190. As a **developer**, I want `funds.current_amount` deleted as a writable counter and fund progress derived from the fold with a drift alarm, so that a denormalized total can never silently disagree with the ledger. `[D3, D17]`
191. As a **developer**, I want a contribution to have five orthogonal state axes (payment, ledger/posting, receipt, accounting-export, review), each a closed state machine, never collapsed into one enum, so that a refund never overwrites receipt truth and each lifecycle evolves independently. `[D7]`
192. As a **developer**, I want every axis transition enforced in a locked DB function plus a trigger (unknown transitions escalate, never silently ignored), so that a raw `.update({status})` can't bypass validation. `[D7 review]`
193. As a **developer**, I want the Stripe webhook to be the sole ledger writer (payment axis driven by webhooks only), so that money-final rows are never written optimistically in the request path. `[D1, D7]`
194. As a **developer**, I want one-time and recurring ACH processing to remain provider evidence until source-confirmed success creates the contribution/posting once, while checks post at recorded and remain provisional until cleared, so that every posted occurrence has a complete settlement-based dating fact and later returns still reverse append-only. Check individual receipts follow the ordinary Phase 7 timing rail by default, with hold-until-cleared only as a tenant opt-in. `[D7 review, D8]` _(Amended 2026-07-11 by Phase 15 D5 and 2026-07-24 by Phase 19 D4: any individual receipt admitted by Phase 7 follows the ordinary timing rail, with an NSF/ACH-return compensating reversal + void/corrected receipt if money later returns. The exact-issuer, effective-interval Phase 7 resolver selects the governing frozen Canadian plan or ordinary policy; `annual_cumulative_cash` creates no per-gift receipt, and a Canadian legal lock/end never falls through to ordinary policy.)_
195. As a **developer**, I want `charge.dispute.*` and ACH-return handlers built and required before ACH is enabled, so that returned money can't be silently ignored while the gift stays "paid" forever. `[D7 review]`
196. As a **developer**, I want receipts grained `(donation_id, version)` before any receipt is written, so that a later void or correction is a new version, never a mutation of frozen truth. `[D7 review, P7]`
197. As a **developer**, I want the canonical gift identity to be fresh header/line/posting tables that reuse the existing `donations.id` UUIDs, with the old `donations` table dropped as the migration's final statement (no compatibility view, ever), so that every FK and `/contributions/{id}` URL stays valid while the legacy flat row is fully retired. `[D2]`
198. As a **developer**, I want the units seam (NUMERIC dollars → integer minor units) proven by a before/after reconciliation (`sum(minor)/100` = pre-migration dollar total per tenant), so that a single unconverted read can't cause a silent 100× money error. `[D2, D10]`
199. As a **developer**, I want integer minor units with explicit currency on every row, one currency per header (DB-enforced), branded into the TS money type so USD+JPY fails typecheck, so that currency bugs are caught at compile time. `[D3, D10, D11]`
200. As a **developer**, I want the existing `receipt-record.ts` ÷100 defect retained only as removal evidence and one canonical currency-exponent-aware minor-unit format/parse helper used by every final money/document seam, so that JPY (and every non-100 exponent currency) is never off by 100× and the deleted prototype cannot remain reachable. `[D10, Phase 18 D17]`
201. As a **developer**, I want largest-remainder (Hamilton) proration in one shared DB function used by both the UI preview and the ledger, so that a fee-cover or partial-refund split always sums exactly and the preview never disagrees with reality. `[D3, D12]`
202. As a **developer**, I want four attribution axes (site_id, entry_method, source_code_id, designation) as first-class indexed columns on the ledger line and cart line, frozen per line at capture and copied onto every recurring installment, so that attribution is queryable, honest, and stable over time. `[D14]`
203. As a **developer**, I want one PaymentIntent for compatible one-time
     lines and Phase 16's exact cohort/execution-leg plan for recurring lines,
     so ordinary cadences normally use one provider subscription,
     twice-monthly uses explicit 1st/15th legs, and every provider item is bound
     to exactly one Asym line. `[Amended 2026-07-13, P16 D2/D3]`
204. As a **developer**, I want the cart handoff recorded in a durable outbox
     with stable idempotency and independent compensation for the one-time and
     recurring branches, so that partial provider success is visible and
     recoverable without duplicate charges. `[Amended 2026-07-13, P16 D2]`
205. As a **developer**, I want explicit group, cohort, and independently
     manageable line records, with consolidated upcoming charges computed from
     occurrence truth, so that grouped UX never requires a torn writable group
     total. `[Amended 2026-07-13, P16 D2]`
206. As a **developer**, I want Phase 16 Asym intent to remain authoritative
     while Stripe objects remain exact-bound executor references, so that
     provider state cannot silently rewrite donor intent. `[Amended
2026-07-13, P16 D1/D2/D16]`
207. As a **developer**, I want separate donor-intent, schedule, collection,
     payment, provider-control, reconciliation, and support-health facts, so
     that useful display labels never become a collapsed writable lifecycle.
     `[Amended 2026-07-13, P16 D2/D12/D16]`
208. As a **developer**, I want Phase 16 to emit meaningful-transition
     communication candidates through Phase 6's consent, delivery, suppression,
     and history seam, so no recovery or reminder hardcodes a delivery vendor
     or sends on every attempt. `[Amended 2026-07-13, P16 D9/D19]`
209. As a **developer**, I want the server-side designation-eligibility
     resolver re-run for checkout and every recurring edit, never trusting
     client visibility, so a restricted target is unselectable by construction.
     `[Preserved, P10/P16]`
210. As a **developer**, I want each recurring provider item addressed by its
     durable stored item identifier and verified against the expected line and
     cohort before mutation, so array order or `items[0]` can never double-bill
     or change the wrong destination. `[Amended 2026-07-13, P16 D2/D15]`
211. As a **developer**, I want occurrences and attempts created idempotently
     from stable semantic keys and money linked only through posted Phase 13
     contribution lines, so replay cannot increment a counter, duplicate a
     gift, or misstate fulfillment. `[Amended 2026-07-13, P16 D2/D11]`
212. As a **developer**, I want skip, pause, resume, cancel, restart, and date
     changes represented by append-only commands and effective-dated schedule
     epochs, with CAS/lease guards and provider confirmation where execution is
     required, so races cannot resurrect stale intent. `[Amended 2026-07-13,
P16 D4/D5/D16]`
213. As a **developer**, I want fixed-total pledge completion and optional
     reminders to use the separate Phase 16 pledge domain and D19 explicit
     enrollment, so stale recurring continuation fields cannot become an
     all-purpose commitment workflow. `[Amended 2026-07-13, P16 D17–D19]`
214. As a **developer**, I want source_code promoted to a first-class per-tenant entity with a restricted charset (structurally CSV-inert), a shared `normalizeSourceCode` used by both mint and resolve, and `ON DELETE RESTRICT`, so that attribution is governed, injection-safe, and never orphaned. `[D14, D14 review]`
215. As a **developer**, I want raw UTM stored in a separate erasable capture-log (only the resolved source_code_id + label/channel/segment on the immutable posting), so that Article-9-sensitive data has an erasure path that doesn't fight the append-only ledger. `[D14 review]`
216. As a **developer**, I want a data-driven short-link route handler `/s/[token]` (not static Next.js redirects, since codes are per-tenant and mutable) that resolves to `{designation_slug, source_code_id}` and 302s with `?sc=` applied, so that print/QR links are dynamic and fixable without reprinting. `[D14b]`
217. As a **developer**, I want the campaign hierarchy modeled as a bounded adjacency list (maintained `depth`, cap 5) with cycle prevention as a three-layer DB constraint inside one locked reparent function, so that a cycle or runaway depth is structurally impossible. `[D13 review]`
218. As a **developer**, I want composite `(tenant_id, id)` uniqueness and composite tenant FKs on lines, source codes, campaign parents, and goals, so that a cross-tenant reference cannot resolve by construction. `[D3, D13 review]`
219. As a **developer**, I want money capabilities minted by Phase 13 and separation-of-duties pairs declared here (enforced by Phase 12's PDP), so that financial authorization has one enforcement unit and no broad `finance:manage_contributions` grant. `[D20, P12]`
220. As a **developer**, I want money-transaction records to carry no custom fields in v1 (funds may, default-closed and receipt-excluded), and `extensible_targets.campaign` enabled by Phase 13 when it defines the real campaign record, so that the custom-field surface stays safe on the money path. `[P11, D13]`
221. As a **developer**, I want a permanent negative/safety test tier plus structural CI gates (pgTAP for deferred-sum-at-commit, append-only immutability, per-line deltas, integer minor units; grep gates banning `.from('donations')` and direct base-money reads; type regeneration so `donations` no longer typechecks), so that the ledger's core invariants fail the build if broken. `[D2, D3]`
222. As a **developer**, I want out-of-order events (a refund arriving before its charge) quarantined with backoff (never dropped or fabricated), so that webhook ordering can't corrupt the ledger. `[D3]`
223. As a **developer**, I want imported/adopted gifts to enter the same four
     source-owned axes pre-advanced (no special "imported" enum), with an exact
     pre-Asym provenance boundary and Phase 20 D17 previous-owner evidence, so that
     migration reuses the source lifecycle without a parallel path or falsely
     claiming accounting delivery. `[D7, D24; amended 2026-07-27]`

---

**Provenance note:** every story above traces to a ratified decision in the Phase 13 grill log (D1/D1b, D2, D3, D5, D7, D8, D12 + amendment, D13, D14/D14b, D15, D16, D17 references, D20–D23, D24/D25) under the governing bars R-JW and R-UX. Cross-phase citations (P1, P3, P5, P7, P10, P11, P12) reference binding predecessor constraints Phase 13 consumes. Repo anchors named in the log (e.g. `receipt-record.ts` ÷100, `funds.current_amount`, `donor_pledges`, `recurring.ts` mapper, `service.ts:361` CSV cell) are cited as **real-vs-forward evidence (as of authoring)** — the durable rule is the story, not the line number.

## Implementation Decisions

Decisions are labeled `D#` to trace to the Phase 13 grill-with-docs decision log. This first block covers the **money-movement plane** (how funds actually flow, and how a tenant is adopted onto it) and the **ledger core** (the append-only contribution record that is the system of record for every gift). Two governing founder rulings bind everything below:

- **R-JW — "Just works."** Seamless and invisible to donors; as easy and invisible as possible to the tenant; no hacky workarounds; modern best practice only. A choice that creates a visible seam, a two-class experience, a manual step a donor or tenant must think about, or a "temporary" hack fails the bar and must be reworked onto the native path.
- **R-UX — Best staff/admin UX.** Effortless by default (the common path is one obvious action with sane defaults), powerful on demand (per-line refund override, optional second approver, threshold alerts, provider detail available but never in the way).

Everything in this block honors the binding predecessor constraints Phase 13 must consume and never re-litigate — in particular **P1** (Asym owns contribution-business truth; Stripe owns the exact provider execution and settlement evidence it emits; a provider id is a source link, never the contribution's business identity; corrections use source- and cause-linked adjustment occurrences), **P2** (integer minor units, validated ISO-4217, one currency per record), **P4** (auth user ≠ donor ≠ Stripe customer ≠ legal donor; the legal/hard-credit donor is a frozen snapshot at gift time), and **P12** (money reads/writes verify an HMAC-signed `EffectiveAccess`; capabilities are the only enforcement unit; Phase 13 _mints_ the money capabilities and declares its SoD pairs, Phase 12 (Full Role & Permission Configuration) _enforces_ them).

> **Production gate.** The Stripe Connect topology, PCI posture, ACH/NACHA handling, and receipt boundaries below encode best-effort readings of Stripe's official docs and IRS/NACHA guidance; **production use requires review by qualified payments/finance counsel and a Stripe implementation review.** This document is not legal, tax, or PCI-compliance advice.

---

### A. Money-movement topology (D1) — Stripe Connect, direct charges, tenant-owned accounts

**Founder ruling (locked):** 100% of the money flows through the **tenant's own Stripe account**; Asym is **never in the flow of funds**; the tenant holds ownership of the funds and of their Stripe account. Asym is maximally plugged in to **observe** (read gifts, refunds, disputes, payouts into the CRM) and **control** (issue refunds and stage dispute evidence from the CRM) without ever touching the money. Doc-grounded via the `phase13-d1-stripe-connect-research` workflow (six official Stripe-docs dives + synthesis).

**Architecture (RATIFIED — PRD-binding):**

- **Stripe Connect + DIRECT charges** on a **controller-properties connected account with full-dashboard ("Standard") behavior**, onboarded through **Stripe-hosted Connect Onboarding (Account Links)**. Do **not** use OAuth (Stripe no longer recommends it for new platforms) and do **not** use the legacy `type: 'standard' | 'express' | 'custom'` labels. Use controller properties: `controller.stripe_dashboard.type = full`, `controller.losses.payments = stripe`, `controller.fees.payer = account`, `controller.requirement_collection = stripe`. The consequence of `controller.losses.payments = stripe` and `controller.fees.payer = account` is that the **tenant bears disputes/losses and Stripe's processing fees** — Asym never absorbs either.
- **Access model — the exact binding, never a stored tenant key.** The platform
  calls each connected account with its platform secret plus
  `Stripe-Account: acct_…`. It stores only the non-secret account reference on
  an effective-dated `(Tenant, Legal Entity, environment, purpose)` Settlement
  Account Binding—never a tenant secret key and never one mutable tenant-level
  account field. This deletes plaintext `tenants.stripe_secret_key` without
  creating a later multi-entity migration trap.
- **PCI posture = SAQ-A** via the Stripe **Payment Element** rendered in Stripe-hosted iframes. The platform renders the checkout UI with its own **publishable** key + `{ stripeAccount: 'acct_…' }` + the PaymentIntent `client_secret`; the **PAN never touches platform servers**. Saved Customers and PaymentMethods live **on the connected account** (this is the seam recurring giving depends on — see D16 elsewhere in this PRD, and D24/D25 below).
- **Refunds and disputes — control without custody.** The platform issues refunds via `POST /v1/refunds` with the `Stripe-Account` header (this debits the **tenant's** balance, not Asym's); it can stage and submit dispute evidence via `POST /v1/disputes/:id` on the tenant's behalf; the tenant can also self-serve through the embedded `dispute_management` surface. Because Asym holds no balance, a refund is always a debit against the tenant.
- **Observability — one Connect webhook, fail-closed binding resolution.** A
  **single platform Connect webhook endpoint** (`connect = true`) receives all
  tenants' events. Verify its platform Connect-endpoint `whsec_`, then resolve
  the signed top-level `account` (`acct_…`) **together with the event's live/test
  mode and environment** through exactly one effective-dated tenant/account
  binding. Missing, duplicate, inactive, or contradictory bindings quarantine
  the event; provider metadata never selects a tenant. The key events to handle:
  `payment_intent.succeeded`, `charge.succeeded`, `charge.refunded`,
  `charge.dispute.*`, `charge.dispute.funds_withdrawn` /
  `funds_reinstated`, `payout.paid` / `payout.failed`, `account.updated`, and
  `account.application.deauthorized`.

**Honest limits (the platform CANNOT):** hold or route donor funds; prevent a tenant from disconnecting; change the tenant's payout bank; read or write tenant KYC after the Account Link is created; or recover the account unilaterally after the tenant revokes access. **Deauthorization is permanent loss of API access** — on `account.application.deauthorized`, the platform must mark the tenant's money plane disconnected and stop attempting account-scoped calls; the platform's own view resets and must be re-established on reconnect. Do **not** assert Stripe guarantees _same-day_ dispute-debit timing in code or tenant-facing copy — disputes debit the tenant balance (amount + dispute fee) with timing Stripe leaves unstated.

**Ledger stays topology-agnostic.** Regardless of topology, Stripe ids are stored as _links_ (P1), and every ledger row is branded with its `tenant_id` (D3). Swapping or extending the topology later must not touch the ledger contract.

**Optional platform controls (parked, not v1):** Asym _may_ later enable Stripe **Platform controls** to drive payout schedule/initiation and consolidated Sigma reporting (more "controllable through Asym"); this can never change the payout bank and resets on reconnect.

**Real-vs-forward evidence (as of authoring).** The current repo is _not_ a single pooled platform account and is _not_ a naive per-tenant integration either — it stores **each tenant's own Stripe secret key** (`tenants.stripe_secret_key`, plaintext) and acts _as_ that tenant. So the tenant already gets their own descriptor, liability, and payouts today — but via **plaintext master-key storage, effective god-access, no platform-fee mechanism, and manual key-paste onboarding**. D1 keeps the correct instinct (tenant owns the money) and replaces the unsafe mechanism (stored secret key) with Connect + the `Stripe-Account` header. The `stripe_raw_events` signed-ingestion ledger (the claim/complete/failure trio) is DURABLE and is _extended_, not replaced: it gains signed top-level **`account` (`acct_`) plus live/test mode and environment**, resolved through one effective-dated tenant/account binding after Connect-endpoint signature verification. On-demand reads and refunds require the same exact binding. New surfaces to build: the hosted-onboarding flow (create controller account → Account Link → redirect → persist the `acct_` only) and the `account.application.deauthorized` + `account.updated` handlers. Treat all of this as forward design — make no "already live" claim about Connect; the shipped path is the plaintext-key path this decision retires.

---

### B. Platform economics (D1b) — 0% of donations, software billed separately

**Founder ruling (RATIFIED):** **Asym takes 0% of donations. No application fee, ever.** The software is monetized through a **separate subscription billed out-of-band** (not on the donation rails). Donor money never touches Asym in _any_ form — not even an earned platform fee.

**Binding consequences:**

- **No `application_fee_amount` / `application_fee_percent` anywhere** in the charge path or the subscription path. (The downstream migration edge-case sweep in D25 hardens this into an assertion: `application_fee = 0` on every direct charge, including replayed/backfilled historical webhooks.)
- Asym holds **no Stripe balance** derived from donations.
- This preserves the strongest truthful donor-trust posture: Asym takes 0% and
  the complete gross supported gift remains credited to its original
  Designations. Processor costs remain a separate economic fact. Their
  accounting attribution follows the frozen Phase 20 D19 policy, so neither
  checkout nor product copy may promise that 100% is always available to the
  field.
- It **kills the `refund_application_fee` rider entirely** — there is no platform fee to refund.

**Parked riders (revisit later, not v1):** dispute-fee allocation policy, deauthorization UX polish, and the exact scope of optional Platform controls.

---

### C. Tenant adoption & migration seam (D24 / D25) — Phase 16 supersession

> **SUPERSEDED FOR IMPLEMENTATION (2026-07-13).** The former Phase 13
> recurring-adoption recipe in §C.1–C.4 is not implementation authority. In
> particular, do not infer or adopt a commitment from `sub_`/`cus_`/`pm_`
> objects; do not match authorization by email, name, phone, or fingerprint; do
> not reuse a payment method or cancel/recreate a subscription without current
> proof; and do not treat provider anchors, backdating, `managed_by`, or a
> mutable lifecycle field as recurring intent or control truth.

Phase 13 owns only these migration-safe money seams:

- imported contribution and posting facts, with immutable legacy external
  references scoped to the exact tenant, connected account, livemode, source
  object, and known Party where one is proved;
- the `already_receipted` pre-Asym boundary, so imports cannot duplicate a prior
  receipt or statement; and
- signed provider-event, ledger-correction, idempotency, and reconciliation
  inputs that Phase 16 may consume without converting them into authorization.

Phase 16 owns the complete recurring migration contract: classification as a
recurring group/cohort/leg/line, Commitment Party and legal payer roles,
authorization and mandate provenance, donor-anchored civil-date schedules,
provider-control state, control-loss quarantine, adoption, and proof-gated
cutover. An existing provider object may keep operating while it is observed,
but observation is not control and continuity is never promised by guesswork.
Any adoption or replacement must independently prove the exact tenant, account,
mode, Customer, Party, authorization, mandate, schedule, last/next execution,
and safe old-executor stop. If any proof is absent or contradictory, quarantine
the object and block mutation or replacement; do not silently create a gap,
overlap, duplicate charge, or fresh mandate.

The separate migration workstream owns processor coordination, credential-vault
transfer, reauthorization campaigns, cutover freezes, and bulk reconciliation.
Asym never handles raw PAN, CVV/CVC, or full bank credentials. Historical gifts
remain importable behind `already_receipted`; GDPR-erased donors remain
pseudonymized and must not be re-identified from provider metadata.

---

### D. Canonical gift identity (D2) — fresh headers/lines/postings _replace_ `donations`, one atomic cutover

**Verdict (RATIFIED):** build the fresh contribution ledger (D3) as the **canonical system of record** and **delete-and-replace** the legacy `donations` table in **one atomic cutover** — **no compatibility view, ever.** The founder initially chose a temporary compatibility view, then commissioned a ruthless 16-category adversarial review (`phase13-d2-option3-adversarial-review`); the view was **rejected** as throwaway work that is _also_ latent debt and does not even compile against the existing schema.

**Why the compatibility view is dead (killer facts):**

1. **A Postgres view cannot be a foreign-key target** — yet ≥10 tables hold hard FKs to `donations(id)` (`staged_gifts`, `contribution_adjustments`/corrections/audit/receipt, `donation_crm_links`, `stripe_raw_events`, `pledge_charge_attempts`, the saga). Those FKs must move to `contribution_headers(id)` regardless, so a view saves none of the re-point.
2. **A read-only view cannot absorb the writes** (`webhooks.ts:136` `.update`, the event store) — writers re-point anyway (which _is_ the replace path) or require hand-built `INSTEAD OF` triggers (pure throwaway on the money path).
3. **Lossy by construction:** flattening header + N lines into one `fund_id`/`amount` row silently collapses split gifts (contradicting the no-primary-designation rule) and _launders an existing bug_ — `fetchDonations` (`reports/service.ts:84-95`) already misattributes 100% of a split gift to `donations.fund_id`; a view would freeze that in as if correct, producing wrong receipts and exports.
4. It contradicts the ratified fresh-build/zero-tech-debt/replace-outright posture ([[no-users-fresh-build-posture]]) and the contribution-detail design's explicit "no transition compat shims."
5. It is un-idiomatic: CiviCRM (contribution + line*item), NPSP (Opportunity + GAU Allocations), and Blackbaud (gift + splits) all anchor a real append-only header+line ledger with \_forward* rollups; none serves canonical truth through a backward flat-row view.

**The cutover (RATIFIED):**

- Build the D3 tables as canonical, with **`contribution_headers.id` reusing the existing `donations.id` UUIDs** — this keeps every FK and every `/contributions/{id}` URL valid.
- **One atomic migration** creates + backfills; re-targets all `donation_id` FKs to the header (as composite same-tenant FKs — D3.12); reconciles `staged_gift_allocations` **into** `contribution_designation_lines` (not duplicated); folds the `contribution_adjustments` JSONB **into** append-only postings; re-points all readers (~26 readers across ~15 files) + the two writers + the public GraphQL surface; collapses to **one** effective-value derivation (the DB fold — delete the TypeScript flat `deriveEffectiveContribution` and `funds.current_amount`); reseeds demo/mock/seed data **natively** in header+lines+postings; and issues **`DROP TABLE donations` as the migration's final statement.**
- **Enforcement (layered):** regenerate `packages/database/types/database.ts` so `donations` no longer typechecks (**primary** — every missed reader becomes a compile error); a **CI grep gate** banning `.from('donations')`; a check that **`public.donations` (table or view) does not exist** post-cutover; and **pgTAP** proving deferred-sum-at-commit, append-only immutability, per-line-delta corrections, and integer-minor-units.
- **The one sanctioned view:** a **forward, read-only, designation-line-preserving** contribution read-model / rollup keyed on a version cursor (the shared read model — D3.8). It is what new readers migrate _toward_; it is **never a write target and never squashes lines.**

**Two blocker-class things to get exactly right:**

- **(a) The units seam.** `donations.amount` is NUMERIC dollars; the new ledger is integer minor units (D3.9). One unconverted read is a silent 100× money error. Gate it with pgTAP at the projection boundary _and_ a backfill assertion that `sum(minor)/100` equals the pre-migration dollar total **per tenant**.
- **(b) Exact UUID reuse.** If any `contribution_headers.id` ≠ its `donations.id`, all `donation_id` FKs orphan or misjoin. Verify FK row counts **before and after inside the same transaction.**

**Completeness adds (from the verifier):** the `contribution_adjustments` JSONB overlay is _also_ legacy under D3 — fold it into postings in the **same** cutover or "one canonical truth" is only half-delivered. `staged_gift_allocations` is a second pre-existing line source — **reconcile, do not duplicate.** Seed authored native-in-new-shape is a **hard gate, not a follow-up.** Type-regeneration is the primary enforcement; the grep gate is the backstop.

**Done-bar:** this meets the completeness bar only if executed as a **single atomic cutover PR** (not a phased shim), with the units conversion and the UUID reuse proven by before/after reconciliation. This D2 ruling **supersedes** the earlier compatibility-view selection.

---

### E. Ledger shape (D3) — header + designation lines + postings, append-only, DB-enforced

The founder chose the model and then commissioned a brittleness/footgun/edge-case red-team (`phase13-d3-ledger-model-redteam`, five dives, grounded in Postgres docs + the repo's `effective-values.ts`, `contribution_adjustments.sql`, and the support-hub composite-FK pattern). The hardened rules below are **PRD-binding.**

**The three layers.** (1) A **header** = one contribution: the hard-tender total + the frozen legal-donor snapshot (P4). (2) **Designation lines** = one target each (`fund_id` **XOR** `missionary_id`); **the lines are the money source-of-truth** and the header carries a _declared_ total the DB validates against `SUM(lines)`. (3) **Posting / adjustment entries** = the append-only history of everything that ever happened to the gift.

**The fourteen hardened rules:**

1. **Three layers as above** — header (declared total, validated), lines (money truth, one target each), postings/adjustments (append-only entries).
2. **Strictly append-only.** `status = 'posted'` ⇒ immutable, enforced by a **`BEFORE UPDATE OR DELETE` trigger that `RAISE`s** — **not** RLS (`service_role` has `BYPASSRLS`), **not** `REVOKE` (migrations run as owner). The whole row is frozen (new columns are frozen by default). The only permitted transition is a one-time `draft → posted`.
3. **Corrections/reversals are new negating entries, never status flips.** `reversed` is a **derived read flag only**; a reversal carries `reverses_adjustment_id` + inverse deltas; the pair nets to zero and **both rows survive as provenance**.
4. **Per-line-id deltas** (`{ target_line_id, amount_delta_minor, fund_id?, missionary_id? }`), **not** whole-array replacement; explicit `add_line` / `void_line`; a delta on a voided line is rejected; a re-designation is **one transaction of paired deltas summing to zero**.
5. **The fold orders by a monotonic per-header `seq`, not `created_at`** (`NOW()` ties within one transaction are non-deterministic). The fold and the revision token share the `seq` key; per-header monotonicity is guaranteed by `SELECT … FOR UPDATE` on the header when allocating the next `seq`. Index `(tenant_id, donation_id, seq)`.
6. **Designation identity and accepted source-purpose authority are snapshotted
   onto the line at post.** The identity snapshot contains `fund_code`,
   `fund_name`, `missionary_display_name`, and `external_ref`, while the
   accepted-purpose snapshot freezes exact Designation identity,
   restriction-or-preference classification, purpose and excess-use policy
   version, source-posting coverage, and one closed provenance variant. When
   governed content was presented or captured, the variant freezes its exact
   source-owned publication kind, reference, and digest. Otherwise it records
   typed `not_applicable` or `not_captured` plus the exact source-purpose
   evidence reference and digest, such as a Designation, remittance, memo, or
   acceptance-authority record. Phase 22 owns a public giving-page publication
   only when that page was the accepted source, over Phase 23's CMS substrate;
   Phase 17 owns a message publication only when a governed communication was
   the accepted source. Every money producer supplies owner-labelled evidence
   for this closed union; the Phase 13 resolver, not a caller-selected legal
   classification, freezes the result. Missing or ambiguous purpose authority
   blocks the affected line rather than fabricating a publication or blocking
   unrelated lines. The live FK is retained: receipts read immutable accepted
   facts and ops rollups read the FK. A fund merge sets `merged_into` and
   resolves **at intake only**, never repointing historical identity or purpose
   authority. A later purpose-authority successor is append-only and requires
   exact jurisdiction-permitted donor, legal, court, or regulator authority; it
   is not an ordinary correction. _(Amended 2026-07-30 by Phase 21 D5.)_
7. **Effective value is readable only through the derivation** (a `SECURITY INVOKER` projection that folds in SQL); base money columns are writer-role-only; a **CI grep gate** forbids direct base-money reads anywhere else.
8. **The cached effective read model is keyed on a version cursor** (`effective_seq = max folded seq`) and **cursor-invalidated, not TTL'd**, so a stale read is structurally detectable. Fund progress derives from _this_ — **delete the writable `funds.current_amount` counter** — and a periodic re-derivation raises a drift alarm.
9. **Integer minor units + explicit currency on every row; one currency per header** (line and adjustment currency = header currency, DB-enforced). Currency is **branded into the TS money type** (USD + JPY fails typecheck). Report totals `GROUP BY` currency — **never a cross-currency scalar.**
10. **`sum(lines) = header`** via a **`DEFERRABLE INITIALLY DEFERRED` constraint trigger that fires at COMMIT**, keyed off the header id, folding in `COALESCE(SUM, 0)` + a `≥ 1 line` check + a same-currency check. The header + all lines + all per-line outbox rows are written in **one transaction**; Stripe and other side effects run **outside** the transaction from the committed outbox via `FOR UPDATE SKIP LOCKED`.
11. **Idempotency at every level** — ingest (`UNIQUE event_id`), donation (saga key), header (`UNIQUE (tenant_id, header_id)`), line (`UNIQUE (header_id, line_ordinal)`), posting (`INSERT … ON CONFLICT DO NOTHING`); the same advisory-lock key derivation is reused throughout. _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.9: the designation-lines table additionally carries `UNIQUE (tenant_id, header_id, id)` — the composite-FK target Phase 14's line-scoped credits and matching-gift settlements reference, so a cross-tenant line reference cannot resolve.)_ Out-of-order events (a refund arriving before its charge) are **quarantined with backoff — never dropped or fabricated.**
12. **Tenant branded.** `tenant_id` is `NOT NULL` with **no default**; parents carry `UNIQUE (id, tenant_id)`; lines use **composite FKs** `(tenant_id, header_id)` + `(tenant_id, fund_id)` so a cross-tenant reference cannot resolve; RLS is belt-and-suspenders. **Kill the `…0001` bridge default.**
13. **The header total is hard tender only.** Soft credits live in a **separate table keyed to the header** — never a line, never in the sum (a Phase 14 seam; no double-count). _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1: the seam is built as `contribution_credits`, **header-keyed WITH optional line scope** — the narrow line-scope exception exists for allocation-style attribution (the `church_remittance` per-line attributions, whose captured array is capture-INPUT only; the credit table is the sole stored truth, role `church_member`, `allocation` class). "Never in the sum" is unchanged — credit rows never enter any money total.)_ Funds and missionaries are **lifecycle-only** (`retired_at` / `merged_into` / `is_active`), **never hard-deleted**; posted-line FKs are `ON DELETE RESTRICT`. An unspecified designation resolves to the **tenant's General Fund at write** (the one-target `CHECK` is the backstop).
14. **Largest-remainder (Hamilton) proration in one shared DB function** — floor each share, then distribute the leftover minor units by descending fractional remainder, tie-breaking on line ordinal. The **UI preview and the ledger use the same function** so a previewed split always equals the posted split.

**Blocker footguns caught (each would have bitten):** (1) RLS/`REVOKE` cannot make posted rows immutable because `service_role` has `BYPASSRLS` → the trigger `RAISE`; (2) folding by `created_at` is non-deterministic on same-transaction ties → the monotonic `seq`; (3) base-table money reads report pre-correction values → derivation-only + the CI gate; (4) `funds.current_amount` silently drifts → derive + reconcile; plus split-transaction atomicity, whole-array corrections, hard-deleted funds, cross-tenant single-column FKs, and unfiltered/mixed-currency progress sums.

**Real-vs-forward evidence (as of authoring).** Several pieces of this are _already right_ in the repo and are kept/generalized: the BIGINT-cents money type, the `pledge_charge_attempts` immutable per-attempt log, the append-only `contribution_adjustments` + effective-fold (ADR-CD-004), `base_revision` optimistic concurrency + a partial-unique idempotency key, the donation saga over a transactional outbox (Stripe is never touched _inside_ the DB transaction), the `processor_lock_id` claim + `FOR UPDATE SKIP LOCKED` + Inngest recovery, and the `stripe_raw_events` signed-ingestion ledger. D3 _refines_ the precedents that are close but wrong: `effective_values.designationLines` whole-array replacement → per-line-id deltas (rule 4); `donations.refund_amount`/`refunded_at` inline → signed compensating entries (rule 3). And it makes a **fresh decision** on the accident-tier debt: free-text `donations.status`/`source`, the triple `funds.target_amount`/`goal_amount`/`current_amount`, and adjustments keyed only on `donation_id`. Treat all of this as the forward target — the shipped `donations`-centric path is what D2 deletes.

**Open micro-decisions (do NOT block ratification):** validated-but-stored vs generated header total; a global `IDENTITY` vs a per-header ordinal for `seq`; the proration tie-break column; reconciliation cadence/thresholds; the effective read-model storage shape + covering index; and the exact CI grep-gate pattern + writer allowlist.

---

### F. Staff corrections, refunds & re-designations (D5) — append-only reversing entries, role-gated, actively audited

Doc-grounded via `phase13-d5-corrections-staff-ux` (repo inventory + best-practice UX + mechanics/edge-cases + receipt/attribution interplay). **Build ON the existing contribution-operations spine — do not reinvent it.**

**Staff interaction pattern (R-JW / R-UX).** Staff **never** see debits, credits, `seq`, or cursors. They open a gift → see **effective values** + a plain-language change history ("$75 → $50; Fund A → Fund B, by Jane, reason: donor request") → pick an **intent verb** (Refund / Change amount / Move-or-re-split designation / Add-or-remove line / Void / Write off / Undo correction) → edit toward the **target end-state** in a normal form → the system previews **before → after in dollars** → a **reason is required on risky actions** → it applies immediately (low/medium risk) or opens a pending approval request (high risk, when the tenant has enabled SoD). Under the hood the service computes the delta, appends an **immutable posting** (or a sum-preserving delta pair) at the next monotonic `header_seq`; an **undo is a new negating entry** referencing the same `line_id`s (never an edit or a status flip); and the effective value re-derives via the DB fold. This mirrors NPSP/Blackbaud/CiviCRM.

**Operation set → ledger entries (all append-only):**

- **amend amount** — a balanced line + header delta.
- **re-designate A → B** (including cross-missionary) — a sum-preserving −Y/+Y pair, header delta 0.
- **add / void line** — explicit entries; a delta on a voided line rejects.
- **full refund** — record the intent → call `refunds.create` on the tenant's connected account via the `Stripe-Account` header → **the durable `charge.refunded` webhook is the SOLE ledger writer** (idempotent on the refund id). A refund is **never posted inline.**
- **partial refund across a split** — largest-remainder proration across the N effective lines (D3.14), clamped per line, rejected if the refund amount exceeds the header's effective total.
- **void / cancel** — no tender return, `kind = void`.
- **write-off** — `kind = write_off`, reported separately.
- **reverse-a-correction** — an exact negating entry that **inherits the reversed op's risk tier.**
- **NSF / ACH-return / chargeback** — **event-sourced via new `charge.dispute.*` handling** (which does not exist today): `kind = ach_return` / `chargeback`; hold-on-`created`, void-on-lost, reversal-on-reinstated.

_(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.6: every correction transaction above additionally stamps affected line-scoped credits and emits a `credit_recheck` outbox event — same advisory lock, same transaction — consumed by Phase 14 (Donor Credit Operations): generated credits re-derive (supersede-and-diff), manual credits are never auto-deleted and instead route a staff review task, and matching-gift expectancies re-derive their received/reversed state from the settled folds. The emission is cheap to add now; the seam costs nothing until Phase 14's consumer exists.)_

**Approval & separation-of-duties (reuse the shipped `policy.ts` + `approval-policy.ts`).** Risk tiers:

- **HIGH** (refund, amount correction, designation/fund correction, void, write-off, reversal-of-a-high-risk op) — a **non-suppressible reason** + the `finance:manage_contributions` capability + (when SoD is enabled) routing to a `contribution_correction_request` (pending → approved) with **server-enforced requester ≠ approver.**
- **MEDIUM** (same-scope re-split, add/void a line that does not change the total, receipt supersede) — a reason + immediate + audited.
- **LOW** (memo) — an optional reason.

Every operation writes one audit-event row. **Never a raw status dropdown** (the CiviCRM accounting-validation warning) — payment-state changes happen only via intent-actions that know their postings.

**Founder governance philosophy (RATIFIED across D5.a and D5.c).** Money ops are gated by **ROLE (the finance/admin capability) + a mandatory non-suppressible reason + an immutable audit trail** — **not** blocked behind a separation-of-duties second-approver workflow **by default.** Rationale: missions orgs often have **one** finance person; forced SoD either stalls or gets rubber-stamped (it fails R-JW). So Phase 13 does **not** hardcode approval-request/SoD routing as mandatory for these verbs.

**Founder sub-decisions — ANSWERED:**

- **D5.a — cross-missionary re-designation = immediate, no second-approver workflow, but role-restricted to finance/admin + a full audit trail.**
- **D5.b — partial refund across a split = auto-prorate by default + an optional advanced per-line override** (the R-UX reference pattern: sane default, power on demand).
- **D5.c — write-off = restricted to finance/admin + a full audit trail; no mandatory second approver and no amount tier.**

**Reconciliation (CONFIRMED — active audit + notification + optional SoD + threshold alert all approved):**

- **Always-on, on every high-risk op:** the finance/admin capability gate + a mandatory reason + an immutable `contribution_operation_audit_events` row (actor / reason / before-after / provider outcome). Crucially, the audit is **active, not passive** — a **visible correction/refund activity feed** + a **real-time notification to other finance/admins** (so no money-out action is invisible; this is a detective control with teeth) + an **optional dollar-threshold anomaly alert** (tenant-configurable, default e.g. $1,000).
- **Optional, per-tenant policy, OFF by default** (configured in Phase 12 (Full Role & Permission Configuration)'s permission/approval-config, **not hardcoded here**): require a **second approver (SoD)** for refund / write-off / cross-missionary re-designation, and/or auto-require SoD above a dollar threshold. Orgs with the staff can enable it; single-finance orgs never see it.
- Rationale: role + audit is a **detective** control (it catches after the money moved); refunds especially are **irreversible money-out**. Always-on active-audit + optional-SoD delivers the founder's light default while leaving the best-practice **preventive** layer available — congruent with Phase 12 owning the configurable approval policy. With D5.c role-restricted (no mandatory tier), the write-off dollar threshold becomes an **alert / optional-SoD trigger** only, tenant-configurable — not a hard block.

**Receipt / progress / safety ripple (corrections emit typed facts, ids only —
see the D7/D8 blocks elsewhere in this PRD):** a
`contribution.corrected` / `refund.posted` occurrence exposes the exact new
source revision. Phase 7 independently and idempotently re-evaluates receipt
facts from the canonical effective fold (supersede-reduced / void / hold /
no-op); Phase 18 owns the replacement artifact, Phase 17 owns governed
content/sender/reply resolution, and Phase 6 owns version-scoped dispatch and
communication history. A `designation.reallocated` occurrence
recomputes both missionaries' support progress from effective lines (a
required fix—`current_funding` must derive from effective lines, not a
denormalized column, or it double-counts). A fund label is resolved through the
Phase 10 safety firewall (alias / fund-code, never a legal name) before it
reaches Phase 7 facts. Corrections never change the legal/hard-credit donor.

**Real-vs-forward evidence (as of authoring).** **Build on:** the `CONTRIBUTION_ACTION_TYPES` catalog, `policy.ts` risk tiers, `approval-policy.ts` SoD, `correctionEffectiveValues` + the `base_revision` 409 + idempotency, the effective-values fold, and the append-only adjustments/audit/receipt migrations. **Refine:** `created_at` ordering → the monotonic `header_seq`; whole-field replacement → per-line-id deltas + `DEFERRABLE sum = header`; `adjustment_type` TEXT → an enum; the `status = 'reversed'` flip → a new negating entry. **Replace:** the `stripe/webhooks.ts` inline `UPDATE donations.refund_amount` → webhook-written compensating postings + a **new `charge.dispute.*` handler**; wire `refundContribution` into its dependencies (it currently throws 501); recompute missionary `current_funding` from effective lines; and retire the buggy donor-portal live path (which buckets by UTC year and _drops_ refunded gifts instead of net-reducing them). Treat these as the forward target, not a description of shipped behavior.

---

_(This block covers the money-movement plane and ledger core: D1, D1b, D24/D25, D2, D3, and D5. The donor-facing checkout plane — D15 giving cart, D12 fee-cover — the attribution axes (D14), status/lifecycle (D7), tender & dating (D8), recurring commitments (D16), and campaign/appeal (D13) are specified in the subsequent Implementation Decisions blocks of this PRD.)_

### G. Contribution lifecycle — three header axes plus related receipt and accounting truth (D7)

**Core ruling: a contribution has no single `status`.** Its header has **three
separate, Phase-13-owned orthogonal state axes**, each a closed
`CHECK`-constrained, DB-function-enforced state machine that moves independently
and is never collapsed into one enum. Phase 7 receipt eligibility/facts
versions; Phase 20 Accounting Release coverage, provider
delivery/readback/drift, settlement evidence, and bounded Bank Match; and
QBO/Xero final books/reconciliation are separately authoritative related
records. They may be summarized through read-only projections, but no
`receipt_status` or `accounting_export_status` header column is authoritative.
This retires the free-text `donations.status`
(`supabase/migrations/…init_schema.sql:183` — `TEXT DEFAULT 'pending'`, no
`CHECK`) and its drifting reader vocabularies, while promoting the useful
multi-axis discipline already demonstrated by `staged_gifts`.

> **Real-vs-forward (as of authoring).** `staged_gifts` today carries several
> parallel status columns and a transition matrix. That is evidence that
> independent lifecycle concerns are native to this domain, not authority to
> place every downstream subsystem on the contribution row. Phase 13 moves only
> payment, posting, and review onto the header and into the DB. Phase 7 keeps
> receipt authority, and Phase 20 keeps accounting authority, in related
> records.

The three Phase-13-owned header axes:

1. **PAYMENT** — the money-rail truth (Stripe or offline capture). States: `requires_action / processing / succeeded / failed / canceled / refunded / disputed`, plus ACH `provisionally_settled`, plus the dispute and refund sub-lifecycles. **Driven by Stripe webhooks only** (never by staff edits or derivation). Per-rail finality is explicit: **card `succeeded` = final; ACH `succeeded` = PROVISIONAL** (an unauthorized-consumer return can arrive up to ~60 calendar days later as `charge.dispute.created`). Terminal vs in-flight is an explicit property of each state, not a convention.

2. **LEDGER / POSTING** — the append-only DB fold. States: `unposted / posted / reversed`. **This axis does not exist today — it is Phase 13's core gap.** A header posts when its tender-specific §E.1 rule admits posting (processor-confirmed online success; recorded for CB-B offline checks/church remittances); corrections and refunds **append a reversing posting** (never mutate the posted row). `posted` means "a ledger entry exists," never "immutable-final money" (ACH and checks can remain provisional; see below).

3. **REVIEW / workflow** — the finance queue. States: `received / needs_review / ready_to_post / …`, with **donor-match and allocation as review-_reason inputs_ into this single axis, not standalone axes.** This is a **durable precedent** (`staged_gifts` `ALLOWED_TRANSITIONS`, `staged-gifts.ts:118-129`). Keep it as the human-workflow axis, but **stop overloading its `posted` value** to also mean ledger-posted _and_ CRM-posted — re-anchor those meanings to the first-class POSTING axis.

**Receipt truth (related, not a header axis).** Phase 7 evaluates the
version-cursored Phase 13 source projection and records reason-carrying
eligibility plus immutable receipt/statement-facts versions. Current-repo
receipt-status carriers are prototype evidence only. Phase 13 exposes exact
source ids/revisions and may show a read-only receipt summary, but never owns or
gates posting on receipt state.

**Accounting coverage (derived, not an axis).** Phase 13 exposes exact
source-occurrence identity and accounting eligibility. Phase 20 returns a
source-labelled, one-to-many coverage summary over immutable Source Coverage
Manifests, Accounting Releases, delivery operations, packages, provider
readback, and compensating releases. A contribution may therefore be uncovered,
partly covered, covered by more than one release, or later affected by a
compensation without any Phase 13 status mutation.

**Right-sized, not over-built.** Three small header state machines preserve
Phase 13's payment, posting, and review truth. Phase 7 receipt facts and Phase 20
accounting records remain independently authoritative and join by exact source
identity. A single free-text `status`, a reserved receipt stub, and a reserved
accounting stub are all rejected.

#### D.1 — The composition chain (one-directional preconditions, never merged)

The axes compose as a **one-directional precondition chain**, never as one enum:

> tender-specific posting milestone → any required review → `posted` → exact
> source revision independently consumed by Phase 7 receipt evaluation and
> Phase 20 source coverage.

- **REVIEW sits upstream of POSTING** as an optional human gate.
- **Reversals flow the same append-only direction**: a refund or ACH return
  appends the Phase 13 reversal and a durable, idempotent source occurrence.
  Phase 7 consumes that cause to issue governed void/superseding facts. Phase 20
  consumes it only through a new source-covered Accounting Release. The
  payment row and original posting remain intact.
- Each transition table is enforced inside a **locked DB function** (the locked-function pattern from `[[fractional-index-collation-trap]]`), so **no free-text write can bypass validation or skip a precondition.** Unknown/illegal transition pairs raise an escalation row — **never a silent ignore.**

> **Real-vs-forward (as of authoring).** The state machine is enforced in TypeScript today, so a raw `.update({status})` already bypasses it (`markStagedGiftRefunded`, `sendStagedGiftReceipt`). The forward design moves enforcement into a `SECURITY DEFINER` locked function + a `BEFORE UPDATE` trigger that rejects out-of-table and stale-ordered transitions. Use `CHECK`-constrained `TEXT` columns, **not** a native Postgres `ENUM` — the vocabulary must evolve without a type migration. All co-moving axes for a single event are composed into **one RPC / one transaction under a per-contribution advisory lock** (avoids torn writes; single-row locked functions are deadlock-safe).

#### D.2 — Auto-post money-final gifts; fail-closed exception routing (D7.a)

**Ruling (D7.a):** auto-post money-final gifts; run an **exception-only** finance queue. Founder emphasis: _"invisible and effortless to the donor; no reasons for delay in auto-posting."_ A gift is not parked in review just because it exists — it posts unless a **fail-closed** predicate flags it.

> **Real-vs-forward (as of authoring).** Today `determineInitialReview` routes to review only on a missing donor or missing allocation — it is **fail-open**: large gifts, restricted-ministry gifts, imported gifts, and donor-match _ambiguity_ (≥2 candidates or low-confidence, not just NULL) all auto-post silently. This is a blocker in shipped code, not the design.

The forward exception predicate is **composable, tenant-configurable, and FAIL-CLOSED**, evaluated inside the locked posting function. It routes to review (does _not_ auto-post) when any predicate matches, at minimum:

- donor-match **ambiguity** (≥2 candidate parties, or a single low-confidence match — not merely a null donor);
- a **restricted-ministry** designation (a Phase 10 physical-safety surface);
- a large-gift dollar threshold (tenant-configurable);
- an **import**-sourced gift whose donor-match or allocation is ambiguous;
- any real-estate line (`requires_gift_acceptance_review = TRUE`, always — see D8 below).

**When tenant configuration is absent, the predicate defaults to safe-conservative-review** — new-tenant onboarding must fail **closed**, never open. "Fail-closed" here means: silence about a predicate resolves toward _hold-for-review_, not _auto-post_.

#### D.3 — ACH source-confirmed posting + the return-exposed window

ACH processing and ACH return exposure are separate truths. The clean source-owned rule is identical for one-time and recurring ACH:

- **PROCESSING EVIDENCE.** `payment_intent.processing` persists only provider attempt/payment evidence and a truthful processing projection. It creates no contribution header, posting, received-money total, dating fact, receipt-plan fact, receipt authorization, or official receipt.
- **POSTING.** Processor-confirmed `succeeded` creates the contribution header and append-only posting exactly once and freezes the settlement/debit date through Phase 7's exact-issuer dating resolver. The posted ACH remains return-exposed with `settlement = provisional` and `return_exposed_until` (the debit date + the applicable source-owned return window). Card `succeeded` posts final immediately.
- **RECEIPT.** Phase 7 may authorize issuance only after that confirmed success and only when the frozen plan/applicable policy admits an individual receipt; Phase 18 then generates the exact artifact. A later return appends the source-owned inverse and correction/void/replacement effect. Phase 13 stores no receipt status or document identity and exposes only a constrained projection for finance operations.
- **PROGRESS / SUPPORT.** A processing ACH enters no received total. A succeeded-but-return-exposed ACH counts toward **private finance totals**; it counts toward **public progress bars / missionary support** only under a per-tenant `expose_provisional_ach_to_public` flag (**default: settled-only**). See D17.
- **POST-SUCCESS RETURN** (`charge.dispute.created` after success): in **one Phase 13 transactional DB function under a per-contribution advisory lock**, append the reversing money entry, move the payment axis to terminal `returned` (**distinct from `refunded`**), net-reduce derived progress, and emit one idempotent Phase 7 correction pointer. Phase 7 source correction/coverage, Phase 18 artifact/currentness, Phase 19 statement coordination, and Phase 17 communication advance independently through their own durable seams.

**Plain terms:** while the bank debit is processing, the donor sees **Processing**, not **Received**. Confirmed success records the gift once; a later return reverses it without deleting history. _Fast feedback never means inventing received money before source confirmation._

> **Unified amendment — Phase 16 recurring ACH and Phase 19 immutable dating (2026-07-24).** The rule above supersedes the former one-time-ACH processing-post option. One-time and recurring ACH now share one finality boundary: processing is evidence-only; confirmed success creates/posts once with a complete immutable settlement-based dating fact; a later return appends the exact Phase 13 inverse and Phase 7 correction pointer, after which Phase 18/19/17 resolve their own artifact, statement, and delivery truth without deleting history.

#### D.4 — The missing `charge.dispute.*` handlers (the offline/ACH return + chargeback path)

> **Real-vs-forward (as of authoring).** No `charge.dispute.*` handler exists in the shipped webhook (`stripe/webhooks.ts` handles `payment_intent.*`, `charge.refunded`, but the dispute case falls through to `default → ignored`). Consequently ACH returns and card chargebacks are **silently ignored**: the money leaves, the gift stays "completed/paid" forever, and the receipt is never voided.

Phase 13 builds new dispute/return handlers in the durable Inngest processor (never at the HTTP boundary), idempotent on the dispute id:

- Map NACHA return codes (`R05` / `R07` / `R10` / `R11`) and chargebacks onto compensating reversal postings (`kind = ach_return` / `chargeback`) plus the idempotent Phase 7 source-correction pointer of D.3 — **hold on `charge.dispute.created`** (contestable), append the final correction effect on lost, and append reinstatement evidence on won.
- Pin the Stripe API version, and gate an API-version bump behind a **CI allowlist review** so a silent SDK bump cannot change dispute semantics.

**Duplicate/out-of-order events** (a return before a charge, a duplicate dispute) are **quarantined with backoff — never dropped or fabricated.**

#### D.5 — The simplified staff payment view (D7.b)

**Ruling (D7.b):** a **simplified, money-oriented staff view** with raw detail available on drill-down, and an ACH **"return-exposed until <date>"** badge. Founder emphasis: _"amazing and delightful UX/UI for the admin"_ (per R-UX: effortless by default, powerful on demand). Staff never see debits/credits/`seq`/cursors; they see effective money-state first.

> **Real-vs-forward (as of authoring).** The current viewer projection leaks raw payloads. The forward rule **inverts the projection to an allowlist**: the simplified view draws the line at **IDs and raw Stripe payloads (hidden until drill-down), never at money-state** (money-state is always first-class). Money is currency-aware minor units end-to-end — kill the hardcoded `÷100` / `en-US` assumptions (JPY is off by 100×). Add a **`provisional_ach_past_expected_settlement`** watch and a **`payment_axis_disagrees_with_latest_receipt_version`** observability check, each backed by a partial index.

#### D.6 — Import / adopt (from D24)

Imported and adopted gifts enter the same three Phase 13 header axes,
pre-advanced—there is **no special `imported` status enum**:

- **PAYMENT** = already-succeeded (an externally-sourced marker; no Stripe reconciliation attempted);
- **POSTING** = eligible immediately, stamped with a pre-Asym provenance boundary;
- **RECEIPT BOUNDARY** = a separate Phase 7 import fact records that a
  pre-Asym receipt exists or that no Asym receipt is permitted. Phase 13 stores
  exact provenance and `already_receipted` evidence, but no receipt status and
  never re-issues or voids a historical receipt the previous system sent;
- **ACCOUNTING OWNERSHIP** = exact pre-Asym provenance and, where available,
  previous-owner provider evidence supplied to the Phase 20 D17 cutover. An
  import never asserts `exported` from a legacy flag alone and never replays
  work without gap-only proof;
- **REVIEW** = bypassed unless donor-match or allocation is ambiguous.

#### D.7 — THE ONE HARD RULE

> **Do NOT enable ACH until all three ship: (1) the `charge.dispute.*` / return handlers, (2) the fail-closed exception-review predicate, and (3) the Phase 13-local one-transaction reversal + durable Phase 7 correction-pointer cascade.**

ACH is a single Stripe-dashboard toggle away from live. Without dispute ingestion, an ACH return silently leaves the gift "paid" and the receipt un-voided — a money-out-with-standing-receipt hazard. This rule is a precondition on the _feature flag_, not a design open question.

---

### H. Tender types + gift dating (D8)

**Ruling (D8):** seven first-class tenders + a shared non-cash asset substrate for the rare high-consequence gift types. D8 **confirms the Phase 7 (Receipt & Statement Compliance) delivery-dating model verbatim** — it does not re-litigate it — and adds per-tender required inputs.

> **Production gate.** This section is not legal or tax advice. The IRS
> statutory constants and form seams below (Form 8283, Form 8282, Form 1098-C,
> quid-pro-quo, DAF §4967) require review by qualified finance/tax counsel
> before production use. Phase 13 captures source facts only; Phase 7 owns
> immutable receipt facts and Phase 18 renders every canonical receipt/form
> artifact.

#### E.1 — The tender enum (`gift_method`)

A normalized `TEXT` + `CHECK` column `gift_method` (refining the free-text `payment_method`; display strings are derived, never stored):

`card, ach, check, cash, securities, in_kind, church_remittance`

> **Naming note.** `stock` is **renamed `securities` from the first migration** (greenfield — no enum exists yet; the rejected `stock` name is recorded in the decision log). See E.4.

Per-tender required metadata, tax-dating basis, and payment-axis finality:

The dating-basis cells below describe the verified U.S. issuer contract, not global defaults. Every resolution receives an exact issuer and versioned Phase 7 jurisdiction-policy identity; another or missing jurisdiction contract cannot inherit these rules.

Receipt admission is orthogonal to tender. Phase 7 resolves the governing
receipt authority by exact issuer and effective interval; callers never branch
on an `active` Boolean. A never-activated or non-Canadian issuer uses the
applicable ordinary Phase 7 policy. An active or repairably paused Canadian
epoch retains its frozen prospective plan, while the pause holds generation and
issuance. A Canadian legal lock or ended epoch creates no new issuable plan
facts and never falls through to ordinary policy for that issuer and interval.
Historical artifacts, access, and records remain visible under pause, lock, or
end. “Plan/policy-admitted” below always means this closed reason-aware rule.

| Tender                | Required metadata                                                                                                                                                                                                              | Dating basis                                                                       | Payment axis                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **card**              | PaymentIntent id · brand · last4 · settlement ts                                                                                                                                                                               | **settlement** (charge date, IRS Pub 526)                                          | online; **final** at `succeeded`; auto-post + immediate plan/policy-admitted individual receipt                                                      |
| **ach**               | PaymentIntent id · mandate · bank last4                                                                                                                                                                                        | **settlement**                                                                     | online; `processing` is evidence-only; after confirmed success, post and admit only a plan/policy-authorized individual receipt; late-return capable |
| **check**             | **`check_number` (first-class, distinct from `deposit_reference`)** · distinct `postmark_date` / staff-attested `mailing_date` · `received_date` · `deposit_reference`                                                         | **postmark** or **mailing_attestation** under the U.S. policy; otherwise received  | offline; post at recorded; **provisional** until cleared (NSF path); plan/policy-admitted individual receipt at recorded by default, hold opt-in     |
| **cash**              | `received_date` · receiving-staff id · `deposit_reference`                                                                                                                                                                     | **received**                                                                       | offline; **final** at recorded; plan/policy-admitted individual receipt at recorded                                                                  |
| **securities**        | identifier (CUSIP/ticker \| coin + on-chain ref) · share/unit qty · delivery/transfer datetime · computed FMV                                                                                                                  | **settlement/received by transfer mode** (DTC = credited; mailed cert = postmark)  | offline; **final** at recorded; _describe-not-value_                                                                                                 |
| **in_kind**           | `in_kind_description` · `received_date` · `is_non_cash` · optional appraisal flag · optional **internal** value                                                                                                                | **received**                                                                       | offline; **final** at recorded; **no dollar figure on the receipt**                                                                                  |
| **church_remittance** | remitting-church party id (payer) · `check_number` · distinct optional `postmark_date`, staff-attested `mailing_date`, and `received_date` · capture-only per-line soft-credit attributions `[{party_id, soft_credit_amount}]` | exact-issuer policy selects **postmark**, **mailing_attestation**, or **received** | offline; post at recorded; **provisional** until cleared; receipt follows exact legal donor and governing Phase 7 plan/policy                        |

**Church remittance** hard-credits the _church_ (the receipt goes to the church as legal donor); individual givers get **soft-credit recognition** — a reporting overlay on the lines, **not** extra headers/lines/postings — so `sum(lines) = header` stays intact. _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1: the per-line attribution array captured on the remittance is **capture-INPUT only** — the sole stored truth for the attribution is Phase 14's `contribution_credits` (role `church_member`, line-scoped, `allocation` amount class); nothing about credits is duplicated into tender metadata. This resolves the tension with ledger rule 13's header-keying: the credit table is header-keyed **with optional line scope**.)_

_(Amended 2026-07-11 by Phase 15 D6/D4/D5 and 2026-07-24 by Phase 19 D4 — three offline-money reconciliations that this table's cells feed forward into; the original cells above are **annotated, not deleted** (they stay the capture-metadata record). **(1) Deposit-state is the 6th orthogonal axis (D6).** The flat `deposit_reference` TEXT required-metadata on check/cash/church cells is **superseded** by Phase 15's `deposit_groups` + a **nullable gift-grain link** to the group + the captured deposit ref/date — deposited/undeposited is its own state machine, not a metadata string on the gift. **(2) `ach` spans BOTH settlement rails (amends D4 A1).** Deposit-eligibility is keyed on a `settlement_rail` discriminator (bank-direct vs Stripe-rail), **not** on `gift_method`: a bank-direct ACH is deposit-grouped like a check, a Stripe-rail ACH settles via payout. **(3) CB-B receipt timing (D5 default).** Offline `check` + `church_remittance` post immediately at recorded (validate = post). A Phase 7-admitted individual receipt follows the ordinary timing rail under the closed reason-aware exact-issuer resolver above; no caller substitutes an active-pack check or falls through a locked/ended Canadian interval to ordinary policy. `annual_cumulative_cash` creates no per-gift receipt. A later bounce runs the **NSF compensating reversal + void/corrected receipt** for an issued receipt. "Hold individual tax receipt until cleared" is an **opt-in per-tenant toggle**, not the default — the "posting/receipt deferred to cleared" wording in the cells above now describes only that opt-in case.)_

#### E.2 — The delivery-dating model (confirmed from Phase 7; D8 adds only the tender→basis mapping)

- `gift_date` = the **resolved** date-of-delivery. `delivery_basis ∈ {postmark, mailing_attestation, received, settlement}`; staff-attested actual mailing and a captured postmark are never conflated.
- A **pure resolver** `{legal_issuer_id, jurisdiction_policy_identity/version/digest, method, permitted delivery evidence, issuer_timezone} → {status: resolved, gift_date, delivery_basis, tax_year, source_pins} | {status: blocked, reason_code}`. It fails closed when issuer binding, policy, required evidence, or timezone is absent; there is no U.S. fallback.
- Exact issuer `tax_timezone` is a required verified input from the issuer compliance profile, with no database or runtime default. Missing configuration blocks resolution; it never assumes a U.S. timezone.
- **CAPTURE-NOT-RECOMPUTE**: the date is resolved **once at capture** and stored, **never recomputed on read.**
- Year-boundary corrections and backdating append a complete Phase 7 `contribution_dating_facts` successor under expected-revision compare-and-set, with stronger approval/cutoff gates only when tenant or jurisdiction policy requires them. They never silently update a header, earlier dating fact, or money posting.

> **Fail-closed issuer tax config (real-vs-forward).** Today a missing tax timezone can silently default to U.S. behavior and mis-file a non-U.S. issuer's year-end. The forward rule stores a verified IANA timezone and jurisdiction-policy identity on the exact issuer compliance profile through an **onboarding or pack-activation gate**. Silence blocks date resolution; it never means U.S.

#### E.3 — The guided-override delivery-basis UI, bounded by method (D8.c — reversed to guided override)

> **Reversal (D8.c).** The founder's initial "free staff choice of `delivery_basis`" was **reversed**: unbounded free choice regresses Phase 7's ratified method-governed dating and is a wrong-tax-**year**-onto-an-immutable-receipt hazard.

The ratified model is **guided override bounded by method** (preserving the founder's beautiful/clear-UX intent, only bounding the choice to defensible options and adding a live preview):

- `delivery_basis` stays the **derived smart default**, pre-selected per tender.
- Staff may choose **only within the exact jurisdiction contract's legally defensible set**. Under the verified U.S. check policy, `postmark`, `mailing_attestation`, and `received` remain distinct; a check can never use `settlement`.
- The **tax-year preview is the same resolver** used at save (not a parallel UI estimate that can drift), shown _before_ save.
- A **boundary-crossing override** (across an _issued statement_ year) inherits Phase 7 A15's staff-attestation default + append-only audit, with stronger review only when tenant or jurisdiction policy requires it.
- A standing **anomaly report** (e.g. `received` on a mailed check straddling year-end) + a reconciliation sweep back this up.

#### E.4 — The non-cash asset substrate (vehicle · securities · real estate · in-kind)

All four rare high-consequence types collapse onto **one `non_cash_asset` substrate** — right-sized, not over-built (NPSP / Blackbaud / CiviCRM converge on subtype-under-non-cash). The discriminator is a **`subtype` on the LINE (never a tender)** — the tender is _how_ it arrived (a check, a transfer); the asset is _what_ was given. Shared fact sets are grouped **by concern** in **dedicated append-only tables** — **not** on the closed `effective_values` fold (a fold would silently lose later proceeds/appraisal appends):

- `asset_valuation` — `{fmv_minor, fmv_method, fmv_datetime, appraisal_required (derived), appraisal_ref}`;
- `asset_disposition` — the contribution-linked, read-only compliance/clock
  projection over Phase 15's canonical append-only asset-lot, disposition,
  proceeds, finality, evidence, and correction facts. It may expose
  `{status, date_of_sale, gross_proceeds}` only where the exact source proves
  them, preserves the source mode and legal-recipient role, and has no
  independent Phase 13 write path;
- `asset_identity` (subtype-keyed) — `vin | cusip | parcel`, gated by a **per-subtype `CHECK` so illegal combinations (a vehicle with a CUSIP) are unrepresentable.**

Derived flags (1098-C-required, appraisal-required, 8283-section) are computed **once in the DB from IRS-constant lookup data** (not hard-coded — a threshold change must not be a code change) and **re-derived on any append-only value correction** (unlike the frozen `gift_date`); the reconciliation sweep is the backstop. UX is **progressive disclosure** — a normal card gift sees none of it.

**VEHICLE** (car/boat/etc. — Form 1098-C rules).

- A non-cash _subtype_, not a tender (the tender is the check/transfer; the car is _what_ was given).
- Facts: `vin / year / make / model / odometer / condition` plus the read-only
  `asset_disposition` projection (`sold_arms_length | significant_use |
material_improvement | needy_below_fmv | retained`; `date_of_sale`;
  `gross_proceeds`). The staff workflow appends the underlying Phase 15 source
  fact; Phase 13 never keeps a second mutable sale row.
- Derived `form_1098c_required = claimed_value > $500`.
- **Auto-posts the gift** (a car is accepted); only the disposition/proceeds + the deduction-relevant acknowledgment wait. UX: a guided disposition radio with inline consequence ("Sold → the donor's deduction = what we received"); a 1098-C badge + a 30-day countdown when > $500. **Do not over-gate vehicles to a committee.**

**SECURITIES** (renamed from `stock`; publicly-traded / non-publicly-traded / crypto).

- `asset_class ∈ {publicly_traded, non_publicly_traded, crypto}` drives valuation.
- Facts: identifier (CUSIP/ticker | coin + on-chain ref); qty; **`delivery_datetime` (TIMESTAMP — intraday crypto volatility)**; `fmv` + `fmv_method ∈ {mean_high_low, exchange_spot, appraisal}` **constrained by `asset_class`** (crypto _cannot_ pick `mean_high_low` → it cannot wrongly derive `appraisal_required = false`); derived `appraisal_required` + 8283 section + the 8282 3-year disposition clock.
- Valuation rules: **publicly-traded** = mean of high/low on delivery date, **no appraisal ever**; **non-public stock** = appraisal required > $10k; **crypto = property**, appraisal required for > $5k with **no public-market exception** (CCA 202302012 — an exchange price is _insufficient_), and the donee files Form 8282 if it disposes within 3 years.

**REAL_ESTATE** (house/land).

- A non-cash subtype, **capture-only** (property description, address/parcel, deed/transfer date = `gift_date`, disposition).
- **`requires_gift_acceptance_review = TRUE` always** → ANDs into the D.2 auto-post predicate → routes to the **fail-closed review queue** → **never auto-posts** (title / environmental / UBIT / lien is a committee decision; a permanent negative test enforces this).
- The appraisal is the donor's burden (8283 Section B; the donee signs Part V in Phase 18). A `pending_valuation` line state holds in review — it **never posts a zero and never puts a placeholder on a receipt.**
- UX: a distinct guided stepped intake with a "needs committee approval before it counts" banner + a deed-date picker.

**DAF (Donor-Advised Fund)** — a **payer + soft-credit + suppression _shape_, NOT a tender or subtype** (miscategorizing it as a subtype is the over-engineering trap).

- `is_daf_grant = true` makes the **hard-credit donor = the sponsor party** (Fidelity Charitable / Schwab Charitable / NCF); the advisor attaches as **soft-credit only** (`is_receiptable = FALSE`, via the existing A8 DB `CHECK` + the service layer).
- **Suppression _becomes_ the hard-credit-donor identity — NOT a parallel `tax_receipt_suppressed` boolean** (a second, weaker gate that can disagree with the A8/A10 receipt wall).
- `no_quid_pro_quo = true` → Phase 18 refuses any benefit/FMV (§4967 125% excise). Carry `daf_pledge_no_sponsor_reference` (IRS Notice 2017-73).
- **Enumerate every Phase-14 hand-off fact in this PRD now** (capture-in-13, operate-in-14). An unmatched sponsor alias → **fail-closed to review.**

#### E.4.1 — Downstream noncash-realization boundary (Phase 21 D21)

The original noncash Contribution remains one gift. Phase 13 owns its immutable
legal donor, Legal Entity, accepted-purpose line, gift date, asset identity and
description, valuation and receipt facts, and supporter/fundraising meaning.
Phase 15 alone owns the canonical append-only operational projection of exact
source lots, disposition tranches, proceeds, source-specific finality, private
evidence, and corrections. Phase 13 may read that projection for a compliance
clock or acknowledgment, but may not write a competing disposition/proceeds
record.

The projection preserves whether the tenant was the legal recipient and held
the asset, an exact provider acted as the tenant's agent, an intermediary or DAF
sponsor was the legal donee and later sent an ordinary cash grant, or the asset
was retained, used, donated onward, abandoned, or became worthless. Only the
first two source modes can feed a Phase 21 D21 Noncash Support Realization, and
only after the versioned source-specific finality rule proves exact proceeds.
An intermediary/DAF cash grant follows its ordinary cash/grant source contract;
a terminal nonmonetary outcome creates no monetary support.

No original FMV, appraisal, claimed value, provider estimate, or Phase 13
noncash posting amount is a Phase 21 D2 Support Allocation Candidate. D21 may
derive one exact Realized Support Basis from non-overlapping Phase 15 source
coverage; D2/D11 alone may later admit the resulting Field Account occurrence.
That downstream occurrence never creates a second Contribution, receipt,
campaign increment, donor/supporter credit, or fundraising event.

#### E.5 — The internal-value-never-on-receipt structural wall (D8.b — BLOCKER-class)

**Ruling (D8.b):** an optional **internal, receipt-invisible** value on non-cash gifts; the UX must make it _crystal-clear to staff that it will not show on the receipt._

> **Real-vs-forward (as of authoring) — this must be STRUCTURAL, not a code-review catch.** Today `receipts.ts:114` has one unconditional `formatMoney(input.amount)`, so a value would leak onto a non-cash receipt.

The forward design makes the leak a **compile error**, not a review catch:

- The internal FMV **is the non-cash line's ledger amount** (so
  `sum(lines) = header` holds and totals are real), stored in a separate
  `contribution_internal_valuation` table that the Phase 7 receipt-facts
  builder physically never joins.
- That amount is Phase 13 contribution/recognition truth only. Phase 21 D21
  makes it structurally unreachable from monetary Field Account candidate and
  close paths; only exact source-final realized proceeds may later create a
  Realized Support Basis.
- The Phase 18 renderer consumes a **discriminated-union
  `ReceiptRenderInput`** whose non-cash arm has no `amount` field at the type
  level → putting a value on a non-cash receipt is a `tsc` error, backed by a
  taint test + a negative test.

This is cheap now (pre-schema) and near-impossible to retrofit once receipts freeze.

#### E.6 — The 1098-C / 8283 / 8282 capture seams (reserved for Phase 18)

Phase 13 captures the source facts and durable clock anchors. Phase 18 renders
the exact form artifacts; it does not own or advance compliance clocks.
Purpose-owned compliance workflow consumes those anchors and requests the
artifact when due:

- **Form 8283** — capture a `> $500` flag + a `> $5,000` qualified-appraisal / charity-Section-B-Part-V acknowledgment fact (Phase 18 renders; Phase 13 does not compute the appraisal).
- **Form 1098-C** — reserve the 30-day-acknowledgment clock seam (vehicles).
- **Form 8282** — reserve the 3-year disposition-clock seam (securities/non-cash disposed within 3 years).
- **Quid-pro-quo** — store a good-faith benefit estimate + benefit description
  as frozen per-gift / per-line source facts (Phase 7 derives the
  net-deductible receipt facts; Phase 18 renders).
- **IRS statutory constants** ($500 / $5k / $10k / 3yr) are **DB lookup data, not hard-coded** — a threshold change is a data change, not a code change.

> **Restricted-worker safety on the new egress doors.** The 1098-C and 8283 documents are new egress doors. A restricted-worker legal name reaching them must read **through the Phase 10 public projection** (Phase 10 deferred the fund-name rule to Phase 13 — enforce it here with a structural test). See D17 and the P10 rollup rule.

---

### I. Progress bars + public totals — derived, per-currency, P10-safe, small-cell-suppressed (D17)

**Ruling (D17):** **there is no stored progress counter.** All progress and public totals are **derived from posted effective ledger lines**, per-currency, computed under the viewer's access, with small-cell suppression on mixed public/restricted nodes.

> **Real-vs-forward (as of authoring).** `funds` today carries a writable `current_amount` counter (alongside redundant `target_amount` _and_ `goal_amount` — the "accident" of three columns). A writable counter silently drifts from the ledger truth. Phase 13 **deletes the writable `funds.current_amount` counter**; progress is a derivation, and a periodic re-derivation drift alarm catches any divergence. (Fund goals collapse to a single goal source; campaign goals live in the D13 `campaign_goals` child table.)

#### F.1 — Derived from the posted effective fold, keyed on a version cursor

- Progress is aggregated from **posted effective lines only** — folded through the D3 derivation (append-only compensating entries net out refunds / NSF / chargebacks; there is no "reversed" flag that hides a row).
- The read model is a **cached effective read model keyed on a version cursor** (`effective_seq = max folded seq`), **cursor-invalidated (not TTL)** so a stale read is _structurally detectable._ Fund progress, campaign progress, and missionary support all derive from this one model.
- **One canonical rollup view/function feeds every surface** (public / staff / Phase-33 reporting). Ad-hoc `SUM`s over base money columns are forbidden (the same one-authority discipline as Phase 12's single PDP), backed by a CI grep gate on direct base-money reads.

#### F.2 — Per-currency; never a cross-currency scalar

Every progress measure is **grouped by currency** — a campaign or fund with gifts in multiple currencies yields **one progress row per currency**, never a summed cross-FX scalar. Goals are declared per-currency (one goal row per currency). Currency is branded into the money type (USD + JPY fails typecheck).

#### F.3 — The provisional-ACH exposure rule

Consistent with D.3 for one-time and recurring ACH, `processing` remains an evidence-only projection and enters no received total. Processor-confirmed success posts once and may count toward private finance totals while return-exposed; it counts toward public progress bars or missionary support only under the per-tenant `expose_provisional_ach_to_public` flag (**default: settled-only**). A later return applies the one-transaction inverse/supersession cascade. No tenant flag may expose a processing debit as received.

#### F.4 — P10-safe: restricted lines excluded per-node before aggregation

> **Ratified here — a Phase-13 decision Phase 10 explicitly deferred to us.** The **restricted-fund public descriptor = the alias / fund-code, never the worker's real name.**

- Public and progress display **routes through the Phase 10 sole-entry publication projection** — never a raw ledger `SUM`.
- Rollups are computed **under the viewer's effective access**; **restricted lines are excluded PER-NODE _before_ aggregation at every level** (a restricted line never enters a parent total).
- For the campaign hierarchy (D13), a node's total is a **set-union over `{self} ∪ descendants`** on the distinct line set — **never `parent.own + Σ(child)`** (the classic NPSP double-count bug). The campaign-axis total is a **distinct lens from the fund-axis total** on the same lines — the two are never summed as if disjoint.

#### F.5 — Small-cell suppression on mixed nodes

A **small-N inference guard** applies to public totals on nodes that mix restricted and open lines: a public figure that would let a viewer infer a restricted worker's presence or amount (e.g. a single-supporter node, or a node where subtracting the public sum from a parent reveals a restricted residual) is **suppressed / coarsened** before display. This is the aggregate analogue of Phase 10's "a blocked record and a nonexistent one look identical" rule — applied to _derived totals_, not just row reads.

### J. Giving cart — one cart, mixed one-time + recurring, cross-device (D15)

The donor-facing anchor of SiteStacker parity: a single **giving cart** that lets a donor support several designations at once, each on its own schedule, in one checkout, and pick up that cart on any device they log in from. It extends the D3 ledger shape and the Phase 5 (Public Website Runtime Contract) enumeration-safe checkout — it does not invent a parallel money path. Governed by **R-JW** (seamless/invisible to the donor) and the conversion-optimal flow below.

- **The cart is an ordered list of designation lines.** Each line carries:
  `designation_ref` (`missionary_id` XOR `fund_id`; general → null),
  `amount_minor` (min $1/line, D2 integer minor units), `gift_mode`
  (`one_time|recurring`), and—only for recurring mode—the Phase 16 cadence,
  continuing anchor, giving-zone context, and optional final eligible date. It
  also carries the Phase 5 attribution axes (`site_id`, `source_code_id`,
  `currency`, `locale`, `entry_method='public_checkout'`) and a stable opaque
  `line_id` that survives guest→login merge. Monthly is featured when enabled;
  every submitted cadence is server-validated against the closed, versioned
  tenant allowlist. The cart header carries `cover_fees`, the server-recomputed
  fee amount (§M), and one `cartKey` idempotency key. Mixed one-time + recurring
  lines live in one cart and one review, but the review truthfully discloses
  initial and continuing charge count, amount, and dates. Caps: 50 lines,
  min $1/line; only lines with the same destination and identical complete
  intent fingerprint dedupe.
- **Real-vs-forward (as of authoring):** the current public donate path is a single-charge `PaymentIntent` with no cart. `donatePostSchema` omits the attribution axes and drops `coverFees` before the POST (the server never learns the donor opted in). The proven substrate to build on: the donate saga over the transactional outbox, three-layer idempotency, and the connected-account Customer save at `packages/api/.../saga.ts` (repo already attaches the PM to a Customer). This is **mostly extension, not rebuild** — the cart fans the proven single-line path out to N lines.
- **Server re-validates every line (Phase 5 handoff HONORED).** Client amounts and labels are **suggestions**; the server re-validates **every** line against the resolved tenant (exists + `is_active` + public-eligibility), extending `begin_donation_saga`'s per-reference check to per-line. Public labels are re-fetched server-side, so a stale or restricted name never renders or charges. Invalid / cross-tenant / inactive lines **fail safe** — dropped or flagged "no longer available," never an error, never a leak, never a mis-designation.
- **Persistence is HYBRID, and the RLS scope is OWNER-only — not owner+tenant.** This is a **decisive correction**: a donor gives across multiple orgs and has **no single `tenant_id` JWT claim** (`authz.current_tenant_id()` is a _staff_ membership claim). Copying the staff RLS clause onto the cart is wrong.
  - **Guest cart = client-only `localStorage`, zero pre-identity PII on the server** (strongest enumeration-safe posture; consistent with Phase 5 §A8). It stores only opaque designation IDs, amounts, one-time/recurring intent terms, and the attribution axes — never a name, email, or card pre-identity. Namespaced by tenant context. Soft **90-day TTL** (D15.3), client-side.
  - **Authenticated cart = server-side, owner-scoped, cross-device.** Schema: `carts(id, owner_user_id NOT NULL FK, status, …)` with a **partial-unique index `WHERE status='active'`** (exactly ONE active cart per owner); `tenant_id` lives on each `cart_lines` row (opaque designation ref, suggested amount, gift mode plus versioned recurring intent terms, `is_fee_cover`, attribution incl. `tenant_id`, stable opaque `line_id`). RLS: `USING/WITH CHECK (owner_user_id = (SELECT auth.uid()))`. Opaque UUID PK. The API is **`GET /cart`** (owner implicit from the session), never `/cart/:id`. Any admin / service-role read **MUST re-assert `owner_user_id`** (a unit test proves a cross-owner read returns empty). The cart stores **intent only** — no card, no PII beyond the owner FK, no denormalized labels.
- **Guest → login merge = ONE idempotent RPC under a per-owner advisory lock** (the repo's custom-collection-reorder locked-function pattern), idempotency-keyed on `cartKey`. Union by complete intent fingerprint: a new fingerprint stays; the same destination plus identical gift mode/cadence/anchor/end terms keeps the incoming amount and never sums; materially different terms remain separate lines. If the login tenant ≠ the guest-cart tenant, **discard/re-scope the guest lines that do not belong to the login tenant** (never dump Tenant A's lines into Tenant B). The 50-line cap and min-$1 are enforced **inside the lock**. Garbage collection is convert-driven + lazy-TTL and **never deletes a cart with an in-flight accepted-agreement saga**.
- **Cart → Phase 13 money branch + Phase 16 recurring branch.** The mixed cart is **not** forced into one Stripe object. The server creates one accepted checkout command, then a durable saga hands stable line intent to the appropriate owner. `add_invoice_items` is rejected because provider objects never become donor intent.
  - **N one-time lines → 1 PaymentIntent (PI-on-cart)** on the connected account → **1 D3 header + N designation lines** (largest-remainder proration, §M).
  - **M recurring lines → Phase 16 group/line/cohort/leg planner.** One explicit accepted action creates the minimum groups and compatible cohorts. Ordinary cadences normally use one subscription leg; twice-monthly uses separate 1st/15th legs. Every line has one exact item binding in every applicable leg.
  - **ONE donor interaction does not imply unlimited authorization.** A provider-managed payment flow may collect one method, but the server binds it only to groups/cohorts whose exact Party, payer, account/mode, currency, schedule, merchant, amount, future-use, retry, and cancellation terms the accepted authorization covers.
  - **The signed provider-event path is the sole writer of
    provider-originated payment and posting transitions** (D1/D7).
    Request-time code may persist accepted intent, command, occurrence, and
    processing evidence, but never successful/provisionally posted money or an
    official ACH receipt. Partial provider success is a visible, reconcilable
    saga state.
  - **Idempotency keys extend `${cartKey}:<suffix>`** with stable opaque group, line, cohort, leg, initial-occurrence, and provider-operation identities. A PaymentIntent or subscription is execution evidence, never cart-owned truth; browser replay retrieves the existing command rather than provisioning again.
- **Conversion-optimal donor flow (proven best practice — Baymard/NN-G/Stripe/giving-platform grounded):** a single page, **guest-by-default**, mobile-first, with a load-bearing stacking order:
  1. **Express Checkout Element (Apple Pay / Google Pay / Link) pinned FIRST, above the fold** (auto-hides unavailable wallets). Levers: Link +14% and 3× returning; Google Pay +2.6%; Apple Pay +2%.
  2. The designation cart — one row per line (label resolved live via the Phase-10-aware read model, amount, an inline one-time/recurring choice with monthly featured and other enabled cadences progressively disclosed); **"add another designation" is a QUIET inline secondary action.**
  3. The **fee-cover toggle ON above the total** (method-aware estimate, live-recomputes on method change — §M).
  4. A sticky running total + tax note + a plain-language **initial/continuing charge count, amount, and date** disclosure when the cart has recurring lines.
  5. The Payment Element + Address in `billing` mode, **no shipping, 6–8 fields max**, autofill on (NN/G: 11→4 fields = +120% completion).
  6. **An account is offered only AFTER, on confirmation — never forced** (Baymard: a forced account = 26% abandonment).
  - A11y: labeled line groups, labeled wallet and fee-cover controls, coherent focus order, reduced-motion honored; 50-line carts virtualize on mobile; the sticky total + thumb CTA never scroll away.
- **Edge-case rulings:** designation inactive / goal-met mid-cart → the server drops/flags the line, the rest proceeds, never a silent redesignation. Restricted-worker label change → re-fetched server-side; the opaque ID still charges; the stale name never renders. Abandoned + resumed → the client cart survives to TTL and is re-validated on resume. **Mixed-currency → REJECT** (one cart = one currency, no silent FX). Fee-cover after a partial refund → a source-covered reversal of both the affected Designation and fee-cover facts; any resulting uncovered processor cost is handled append-only against the original frozen Phase 20 D19 policy and manifest, never current mappings.
- **⛔ #1 SEQUENCING BLOCKER — the D1 Stripe Connect connected-account foundation is UNBUILT** and the entire cart assumes it. **Real-vs-forward (grep-confirmed as of authoring):** ZERO `on_behalf_of` / `transfer_data` / `stripeAccount` usage in `packages/api/src`; the webhook verifies with the _platform_ secret only. **Build the D1 Connect vertical slice FIRST**, behind **one Connect wrapper that REQUIRES the exact account and mode**. Every PI/cohort/leg operation is a chance to default to the platform account, and money on the wrong account is a compliance incident.
- **Center-of-gravity risk — the mixed accepted-agreement saga has no provider-atomic boundary.** SCA/ACH processing and partial cohort/leg provisioning are normal outcomes. The durable server-side saga therefore gives every branch, group, line, cohort, leg, initial occurrence, and provider mutation a permanent idempotency identity; it distinguishes indeterminate from failed and reconciles before compensating. One provider payment can enter the Phase 13 money writer exactly once.
- **Observability is in-phase, not deferred.** The cart's thesis is unfalsifiable without funnel stages, abandonment, accepted-command and partial-provisioning outcomes, grouped cohort/occurrence failure visibility, and the collected-vs-actual fee delta (§M). Phase 13 owns cart/ledger signals; Phase 16 owns recurring lifecycle/recovery signals.

### K. Fee-cover — per-tenant, per-method, %+flat behind a simple-% display (D12)

Fee-cover lets a donor add an estimated-offset contribution so more of the
gross supported gift remains available after processing costs. It never
promises an exact fee or complete recovery. The founder governing bar
(**R-JW / R-UX**): the donor sees clean dollar amounts and honest estimate
copy; staff configure it in an "amazing UX" two-row matrix; nothing hacky.

- **Config is per-tenant, PER-PAYMENT-METHOD (card vs ACH), because the fees differ ~4×** (card ≈ 2.2% + $0.15–$0.30 nonprofit; ACH ≈ 0.5–1%, ~$5 cap; ACH is not a card and is not subject to surcharge law at all). Each method stores `{ enabled, rate_bps (integer basis points), mode }`. Modes: **`optional_opt_out` (default, pre-checked toggle)** | `optional_opt_in` (unchecked) | `mandatory`. **Do NOT build adaptive / AI / hidden modes** (over-engineering). Staff UI = a clean **two-row matrix** (Card / ACH → enabled · rate · mode) + inline hard warnings.
- **HARD CHANGE 1 — pure-% is the DISPLAY, `%+flat` is the ENGINE.** A pure percentage **structurally under-recovers by exactly the flat fee** on every gift, worst on small ones (a $10 gift costs the org ~5.2%; a 2.2% cover under-recovers ~$0.30). The engine therefore improves the estimate without claiming exact recovery: `charge = round((net + flat_cents) / (1 − bps/10000))`, where `flat` is a per-method **system constant** and `rate` is stored per-method in basis points; it applies on the gross/charged total, and the D3 **largest-remainder** algorithm allocates the resulting `is_fee_cover` line. **The tenant still sets a simple %, the donor still sees one clean dollar amount — only the internal estimate accounts for the flat fee.** This is the universal platform pattern (Fundraise Up / Donorbox / Classy / Givebutter — none use pure-%).
- **HARD CHANGE 2 — mandatory CARD is BOUNDED; mandatory ACH is unrestricted.** A mandatory card uplift is the textbook shape of a **credit-card surcharge** (Visa's 3% cap + cost-of-acceptance clamp, ≥30-day acquirer registration, POS/receipt disclosure, and the **debit/prepaid surcharge PROHIBITION**; CT/MA/ME still restrict). Five guardrails MUST hold for mandatory card to be safe:
  1. **Framed and recorded as a charitable GIFT-TOTAL COMPONENT, never a "card fee"/surcharge** — "your donation total includes X% to cover processing"; one deductible receipt total (base + cover) + "no goods or services"; the computation is not shaped like a Visa surcharge (the Givebutter posture that keeps out of the surcharge regime entirely).
  2. **Debit/prepaid HARD CARVE-OUT** — read Stripe `card.funding`; if `!== 'credit'` (treat `unknown` as non-credit, fail-safe), **auto-downgrade mandatory → optional** for that tender; server-authoritative, re-checked on a live method switch; wallets resolve underlying funding first.
  3. **Pre-authorization disclosure** — the donor sees the exact added amount and the new total **before** confirm (a transparent total line, no hidden add-on).
  4. **Rate clamped to cost-of-acceptance / ≤3%** at config time; the engine grosses up with %+flat.
  5. **Per-installment persistence + NO silent recurring increases** — persist `applied_rate`, `fee_cover_mode`, `payment_method_class`, `fee_cover_amount`, `base_amount`, `charged_total` per installment; a rate hike on an existing recurring commitment is **grandfathered or re-consented**, never silently applied.
     Plus a tenant **warning banner** (network + CT/MA/ME notice) when enabling mandatory card.
- **Config fail-CLOSED.** Default = `optional_opt_out`, a sane per-method rate, **mandatory OFF**; never fail open to mandatory or a garbage rate; validate the rate at config time (reject blank / 0-if-enabled; warn if card < ~2.4% under-recovers; clamp an implausibly high rate). Optional opt-out alone captures ~53–95% coverage with none of the legal/conversion downside — **mandatory is a bounded tenant-owned choice, not the recommended path.**
- **Server recomputes — never trusts the client figure.** **Real-vs-forward (as of authoring):** today the UI computes card-only `(amount + 0.30)/(1 − 0.029)` and drops `coverFees` before the POST, so the server never learns the intent and over-charges ACH ~3.6×. The fix carries `cover_fees` + amount in the schema, server-authoritative; on a card↔ACH switch the server recomputes **rate + mode + amount in one round-trip** (the _mode itself_ can change) and renders the delta legibly. Never a client-only authorization estimate. Copy = "Help cover **estimated** processing costs," never "the exact fee is $X" or "100% will reach the field."
- **Allocation = a dedicated fee-cover ledger line** (`is_fee_cover=true`, a reserved system fund), **NOT silently pro-rated into the ministry designations**. Phase 20 D19 may attribute only the separate, exact uncovered processor expense across the frozen original non-fee-cover Designation weights; it never reallocates the fee-cover gift or reduces gross Designation principal. **Fully deductible in BOTH modes** (the org receives it under D1 direct charges; the donor gets nothing back; mandatory framed as a gift-total component avoids quid-pro-quo). The receipt shows **one deductible total** (gross supported gift + fee-cover), optionally itemized.
- **Founder UX requirement — itemized on the checkout screen.** Show three distinct labeled lines: **`Your gift: $X` / `Cover processing fees: +$Y` / `Total: $Z`** (transparency is best practice and legally required for mandatory mode) — but **do not expose the raw `% + $0.30` formula mechanics**; the donor sees clean dollar amounts.
- **Recurring recompute.** Store the `cover_fees` intent on the commitment; **recompute per installment via Stripe Billing on each subscription's invoice** — never freeze a dollar figure. The checkout fee-cover line attaches to the **one-time PI header ONLY** and must never bleed into a recurring first invoice; each recurring installment's fee-cover lands on **that installment's header**. Persist the per-line allocation so a single-line partial refund returns `line_amount + line_fee_cover_share` cleanly.
- **Refund INCLUDES the fee-cover** — the donor is made whole through source-covered reversing postings for both the Designation and fee-cover lines. Whether the provider retains, returns, or later adjusts its fee is separate processor truth. Any remaining exact cost follows the original frozen Phase 20 D19 policy and manifest through append-only correction; it is **never a donor clawback**.
- **Staff config/visibility UX:** on/off + default state (ON/opt-out, ~75–85% coverage) + a **server-enforced added-% CAP** bounding the blast radius of a formula bug + editable donor copy; the per-gift default view shows the three labeled numbers (intended · fee-cover estimate · gross charged) + the method + an "estimate" note.

### L. Source codes + attribution + UTM + URL structure (D14 / D14b)

Source code is the tag that answers **"what prompted this gift?"** (the July newsletter, the QR at the banquet, the prayer letter, the year-end appeal, an FB campaign, email segment A). Phase 2 defined four orthogonal attribution axes — **site (where) / entry_method (how) / source_code (what drove it) / designation (what for)** — and the roadmap makes source codes first-class here.

- **Source code is a first-class per-tenant reference entity** — promoted from the Phase 2 sanitized free-text placeholder. `source_codes(id, tenant_id, code, label, channel, segment, message, campaign_id NULL, status ∈ {active, retired}, created_by, created_at)`. `code` is UNIQUE per tenant, restricted to charset `[a-z0-9._:-]`, capped ~64 (structurally CSV-inert). The three facets are **channel × segment × message** (e.g. `em-lapsed-ye2026`: channel=email, segment=lapsed, message=year-end-2026). **`channel` is constrained to a tenant-config enum** (it is the rollup axis; free-text drift `email`/`e-mail`/`newsletter` corrupts rollups); `segment` and `message` are free filter tags. This is the Phase 2 third axis, now a **FK not a string** on the ledger line (`source_code_id`, nullable). First-class beats free text: reporting is `GROUP BY` a FK, not `LIKE '%yearend%'`; no typo drift; governed vocabulary; CSV-safe by charset.
- **Real-vs-forward (as of authoring):** the unused `donations.source DEFAULT 'direct'` free-text column is exactly the CiviCRM free-text-`source` mistake — **REPLACE** it (kill it once the Phase 13 header exists). `entry_method` (the HOW axis) repurposes the `donations.source` enum onto the header/posting. The repo also has a **CSV-injection gap** at the export cell helper (`service.ts` `csvCell`) — fix it with an OWASP prefix-guard + an injection test (below).
- **Retire-never-delete.** Historical gifts keep pointing at retired codes; retired codes cannot be selected on new links. **Soft-retire only + `ON DELETE RESTRICT`** (never hard-delete a referenced code). A **pg_trgm near-duplicate warning at create** (`spring-appeal` vs `springappeal` pass UNIQUE + charset but fragment reporting) + merge-via-correction.
- **UTM model — capture BOTH raw allowlisted UTM AND a resolved `source_code_id`; resolve by MATCH-OR-NULL + staff triage (never auto-create).** Extend the ratified `buildAttribution({host, params, authContext, entrySurface})` at the public entry; allowlist `t, c, utm_source, utm_medium, utm_campaign, utm_content, utm_term` (+ ad click-IDs `gclid`/`fbclid`/`msclkid` captured to a jsonb overflow, resolve-ignored in v1); url-decode / trim / cap / charset / formula-neutralize. Match captured params against the per-tenant registry → set the FK; **no match → keep the raw UTM + `source_code_id = null` + a triage flag** (the NPSP/Blackbaud governed-list posture; prevents appeal-sprawl; the raw UTM preserves the signal). Never auto-mint a live code from arbitrary UTM. Capture is **total / non-throwing** — malformed UTM → NULL, the gift proceeds, the giving path never aborts.
- **Store BOTH first-touch (landing) and last-touch (checkout); the reporting DEFAULT is LAST-touch.** **D14.2 was REVERSED** from the founder's initial first-touch pick: for a _contribution ledger_ the gift-driving ask is last-touch — what NPSP Primary Campaign Source, Blackbaud Appeal, and CiviCRM Source all attribute (first-touch is the acquisition/marketing lens). Because store-both is ratified, this is a **per-tenant report-time toggle initialized to LAST-touch** (first-touch is one click away), not a migration. **Label the touch model on every report** so no number is ambiguous. Recurring reporting defaults to the commitment's origin source.
- **Stamping — PER-LINE at capture (cart-add), FROZEN.** The `source_code` + UTM ambient in the session when a line is **added** freezes onto that line; a later link click updates the session's ambient (last-touch-within-session), which affects the **next** line added, never rewrites lines already in the cart. This is honest across edited carts, multi-link sessions, and cross-device resume (the frozen attribution travels **with the line**; another device's ambient never overwrites it). The per-line freeze **is** the last-touch conversion-moment semantic.
- **Recurring copy-forward = an IMMUTABLE snapshot.** `{ site_id, entry_method, source_code, attribution (label+channel+segment) }` is copied onto the commitment at creation and onto **every installment as PLAIN COLUMNS on the posting** — **never re-read the live `source_codes` row** (it may be retired). A year-1 gift still reports under its original code in year 3. Satisfies D15 (per-line) + D24/D25 (immutable recurring).
- **PRIVACY FIX — raw UTM must NOT live on the immutable ledger.** In a missions CRM `utm_campaign=iran-house-church` is GDPR **Article 9 religious-affiliation data**; storing raw UTM on an append-only, per-installment-replicated posting = sensitive data with no erasure path. The posting snapshot stores **ONLY the resolved `source_code_id` + label + channel + segment** (the staff-vetted code) — **NOT the raw UTM.** Raw UTM lives in a **separate, mutable/erasable capture-log keyed to the entry event, OFF the ledger**, with retention + redaction/tombstone (DSAR-compatible). A light capture-time PII heuristic rejects `@`, long digit runs, `%40` → NULL + flag. The raw-UTM store is classified under Phase 10, and the source-code label/campaign + raw UTM route through the P10 egress firewall. (UTMs are non-personal by default → no donor-facing consent prompt is added to the giving path. The founder noted staff govern the codes, so the ledger risk is low — true, and it _supports_ this design: the permanent ledger holds only the staff-vetted resolved code; the separate erasable log exists for tags arriving from outside staff control and for the legal erasure duty.)
- **Snapshot vs FK — single source of truth (ratified R4).** **POSTINGS are reporting truth** — the frozen snapshot stores the display fields (label+channel+segment) as-of-freeze plus `source_code_id`; historical/financial and recurring reports read the **snapshot ONLY, never join the live registry for labels** (a relabel/retire never rewrites history). The live FK is the editable operational pointer (pre-posting, triage, current grouping). **id-is-truth, label-is-display everywhere.** **ONE deliberate exception, which MUST be documented or it gets built backwards:** the **campaign rollup reads LIVE** via `source_code_id → campaign_id` as-of-report-time (opposite of the snapshot rule).
- **Post-posting override = an append-only D5 correction** `{ previous_source_code_id, new_source_code_id, actor, reason, timestamp }`; the original snapshot is untouched; reporting reads the latest non-superseded ∨ the original. An in-place UPDATE of the line FK or the frozen snapshot is a **BLOCKER** (breaks the D3/D5 spine). Pre-posting (still in cart/triage) may update the mutable line FK in place. Compensating / re-designation entries **INHERIT** the original line's frozen attribution. Staff may hand-assign/override, **audited** (`created_by`/`overridden_by`), with the raw UTM preserved (D14.4).
- **Triage is RULE-GENERATING, not per-gift.** Resolving an unmatched value creates a reusable **alias rule** (raw string → code) → labor is O(distinct-strings), not O(gifts); bulk-resolve identical tuples; a normalized/fuzzy pre-match layer; **auto-decay unresolved → an honest "Unknown / Direct" after N days** (a worklist, not an infinite inbox); every resolution is an append-only correction. **Prerequisite: a seed/bulk-import path in the FIRST migration** (else an empty registry routes the whole ledger to triage on day one). **Never seed a catch-all `direct` code** (that launders "we don't know" into a fabricated attribution). Where there is no UTM and no match, `source_code_id` is NULL, `entry_method` is still set (HOW is always known even when WHAT-drove-it isn't), and it reports as **"Unknown / Direct," never a fabricated appeal.**
- **Campaign seam (→ §O).** MANY source codes per campaign; ONE campaign per source code (the nullable `source_codes.campaign_id` FK). Ship the FK NULLABLE in the first ledger migration; D13 later populates it with **NO ledger retrofit** (the line references only `source_code_id`; linking a code → a campaign is a single-row update; campaign rollups join through the FK).
- **CSV formula-injection defense at TWO boundaries:** capture (the restricted charset makes codes inert; sanitize UTM) + export (neutralize any cell starting `= + - @` / Tab / CR / LF per OWASP). A single shared `normalizeSourceCode` is used by both mint AND resolve (a round-trip test).
- **URL structure (D14b — RESOLVED): the source code rides in the QUERY string, never the path.** Path = designation (WHAT the gift is for): `/missionary/the-smiths`. Query = attribution (HOW the donor arrived): `?sc=<code>`. The canonical trackable link is `tenant.org/missionary/the-smiths?sc=em-lapsed-ye2026`. Ship **`?sc=`** (a compact per-tenant token) as canonical — the shortest QR payload and a first-class attribution key — and synthesize the five UTMs from it server-side for GA4; full raw `?utm_*` is also accepted for partner-built links (logged separately + erasable). **Why not a path segment** (`/the-smiths/em-ye2026`): route collisions with real sub-pages (`/the-smiths/story`), conflation of two orthogonal axes, SEO/canonical duplication, and link explosion. Every major platform does this (Classy `c_src=`, Fundraise Up, Givebutter).
  - **Short-link / QR layer for print / QR / SMS:** a dynamic vanity redirect `give.tenant.org/s/<token>` — a route handler resolves `<token>` in the DB to `{ designation_slug, source_code_id }` and 302s to the canonical page with `?sc=` applied. It binds at redirect time (the donor never sees or edits the code; attribution survives a retyped link) and is dynamic (a changed slug is fixed without reprinting). The QR encodes ONLY the short link (low-version ~v3–4, error-correction M default / Q for glare).
  - **The tagged-link builder** (the one friction-critical UI — the match rate is a direct function of it) emits **BOTH per source code: the canonical `?sc=` link (analytics/debug) AND the short link + a downloadable dynamic QR** (PNG/SVG/PDF). **Real-vs-forward (as of authoring, `apps/donor`):** designation pages live at `app/(public)/workers/[id]/page.tsx` + a CMS catch-all; `/give`, `/donate`, `/missionaries` already 301 → `/workers`; the query-param checkout handoff exists at `packages/lib/payments/checkout-designations.ts` (`buildWorkerCheckoutHref`, with the Phase 5 reserved `source_code`/`entry_method` slot). MUST ADD: (a) `buildAttribution` query capture on `/workers/[id]` + the CMS route (no `utm_*`/`source_code` read today); (b) the presentation-slug route `/missionary/[slug]` (designation is `[id]` today); (c) a **data-driven** short-link route handler `/s/[token]` (NOT `next.config.ts` static redirects — codes are per-tenant/mutable); (d) the tagged-link builder.
- **v1 SHIPS (first migration):** the `source_codes` table + FORCE RLS + Data-API-revoke + composite `(tenant_id, source_code_id)` FK + composite uniqueness + `ON DELETE RESTRICT`; the **seed/bulk-import path** (cannot trail); the shared `normalizeSourceCode`; UTM capture (discrete allowlisted columns + a small jsonb overflow); per-line write-once freeze + `attribution_captured_at`; the immutable recurring snapshot (label+channel+segment+id, **not** raw UTM); the separate erasable raw-UTM capture-log + redaction path; the `csvCell` fix + injection test; store-both + the per-tenant report-time toggle; and **the tagged-link builder** (code + resolvable link born together). Observability metrics named as v1 (match rate, unattributed rate, triage-backlog age, top-unresolved, first/last divergence, recurring-snapshot integrity) even if the charts trail. **TRAILS:** admin CRUD polish, pg_trgm merge UX, the triage-dashboard polish, and D13's `campaign_id` population. ("Management UI trails" does **not** mean "no way to create codes" — the seed/bulk-import path + the link builder guarantee a non-empty registry on day one.)

### M. Giving campaigns + bounded parent/child hierarchy (D13)

A **giving campaign** is a **staff-defined, time-bounded fundraising EFFORT** with goal(s) and reporting rollups. It is **NOT** an email blast, a public page, a P2P fundraiser, an appeal, a source code, or a designation/fund.

- **Clean `giving_campaigns`:** `id, tenant_id, name, slug, description, status ∈ {draft, active, closed, archived}, currency (REQUIRED when a monetary goal exists — the current table has none), start_date, end_date (nullable), parent_campaign_id (nullable), depth SMALLINT (maintained), created_by/at`. **NO `current_amount`** (derived — §Q), **NO email fields**, **NO story/CMS/share fields**, **NO `creator_donor_id`.** Per-tenant RLS.
- **Real-vs-forward (as of authoring):** the current `public.campaigns` (`schema.sql`) is REPLACED. Its core defect is `NOT NULL` on **both** `creator_donor_id` AND `missionary_id`, which forces every email blast to also be a donor-created single-missionary fundraiser (the email-blast/donor-fundraiser conflation). This is a **fresh-build replacement, no migration ceremony** (no users — [[no-users-fresh-build-posture]]): move email fields → the comms domain; move `creator_donor_id`/`share_url` → the P2P / Phase-22 domain; drop the single-beneficiary `missionary_id NOT NULL` (designation flows via lines); replace `current_amount` (derive) and `donations.campaign_id` (→ the source-code rollup); add `currency`; reseed demo correct-from-start. Also retire `notification_queue` and `donations.campaign_id` (superseded by the source-code rollup).
- **Attribution rollup — canonical = source_code (D13.1, Option 1).** A posted line carries `source_code_id` (D14, capture-time per-line) + `designation_id` (D9). The line rolls up to its campaign **VIA `source_codes.campaign_id`** — ONE FK hop, ONE source of truth (the Blackbaud Package → Appeal → Campaign chain). **Do NOT also expose a mutable `campaign_id` on the line** (a second editable path lets the line say A while the source code says B). If a denormalized line `campaign_id` is ever needed for query speed, **derive-and-FREEZE it at post time** (an immutable snapshot from `source_code.campaign_id`, never independently editable).
- **Goals — ZERO-OR-MORE typed goals via a child `campaign_goals` table (D13.2, Option 1):** `campaign_id, goal_type ∈ {monetary, donor_count, recurring_supporters, gift_count}, target_value, currency (nullable), sort_order, scope ∈ {own, rolled_up}`. Supports multiple or none. Per-currency (one goal row per currency; **never sum across FX**). Goals are authored independently and are **NEVER auto-summed**; "parent = sum of children" exists only as an explicit, recomputable staff convenience, never a hidden default.
- **Multi-designation is orthogonal (D9).** One campaign spans N designations (several missionaries + the general fund); each line carries **BOTH** its `designation_id` AND its source_code (→ campaign). This is the NPSP Campaign-Member pattern; **no designation is "owned" by the campaign** (many-to-many through lines). **Double-count guard:** a campaign goal and a fund goal are OVERLAPPING views of the **same** lines — reporting must **NEVER** add a campaign total to a fund total as if they were disjoint. **The campaign-axis total ⊥ the fund-axis total** (disjoint lenses of the same lines, never summed).
- **Hierarchy — build it NOW, as a BOUNDED adjacency-list tree (D13.4, founder OVERRODE flat-v1).** The review upheld the override but bounded it: an **adjacency list** (`parent_campaign_id` nullable + a maintained `depth SMALLINT`) is the **SOLE source of truth**; rollups run via a **recursive CTE bounded by a depth cap = 5** (the NPSP/Salesforce-proven ceiling; it provisions the Phase-36 P2P chain org → campaign → sub → team → individual). **NO closure table / NO ltree in v1** (net-new machinery, zero repo precedent, over the over-engineering bar) — escalate to a trigger-maintained closure table **ONLY on measured read-perf failure**, and then as a **rebuildable CACHE, never a second source of truth.**
  - **Cycle prevention = a hard DB constraint in 3 layers:** `CHECK(parent_campaign_id <> id)` + the depth cap (a reparent re-derives the whole-subtree depth → a cycle exceeds 5 → rejected) + a `BEFORE UPDATE` trigger rejecting a parent already in the node's descendant set — **all inside ONE locked reparent function under a per-root advisory lock** (cycle-check + depth-rewrite atomic → kills the TOCTOU race). This is the repo's custom-collection-reorder locked-function pattern.
  - **Tenant-safe structurally:** `UNIQUE(tenant_id, id)` + a composite `FK(tenant_id, parent_campaign_id)` (also on `source_codes.campaign_id` and `campaign_goals.campaign_id`), copying the `support_bulk_move_operations.sql` composite-FK pattern — a cross-tenant parent is structurally impossible, no app check.
  - **Reparent / delete / archive:** reparent is governed / audited / effective-dated via the locked function and is **BLOCKED on closed/archived nodes** (closed-period totals are never retroactively rewritten — the most under-surfaced hazard); delete is `ON DELETE RESTRICT` (attributed or parent nodes are **archive-only**; an empty draft node is deleted only by walking the **full** subtree, not the repo's one-level-only footgun); archive is a per-node status + a view filter, **does not cascade**, a parent cannot archive while a child is non-terminal, and it never touches `source_codes.campaign_id` or posted lines.
- **Rollup semantics — double-count-free (§Q owns the projection).** Each posted line attributes to **EXACTLY ONE** node (the frozen `source_code.campaign_id`). Two distinctly-named derived measures per node: **`amount_own`** (lines whose node = this node) and **`amount_in_hierarchy`** (the SUM over the **DISTINCT line set** where node ∈ {self} ∪ descendants — **a set-union filter, NEVER `parent.own + Σ(child)`**, which is the classic NPSP double-count bug this platform closes). No down-rollup (children never inherit ancestor gifts). Compensating entries attribute to the same node, so the subtree set-union nets partial refunds naturally. **ONE canonical rollup view/function feeds ALL surfaces** (public / staff / Phase-33) — ad-hoc SUMs are forbidden (mirrors the Phase-12 one-authority discipline). Single-currency-per-hierarchy (a child's currency = the parent's) OR per-currency buckets — never a mixed-currency scalar. **Reconciliation invariants** via `giving_reconciliation_runs`: `Σ(amount_own over tree) == root.amount_in_hierarchy`; `Σ(all posted lines) == campaign-total-over-all == fund-total-over-all`; plus an attribution match-rate. Drift fails loudly; the derived value wins over any snapshot.
- **⚑ Restricted-fund PUBLIC DESCRIPTOR = alias / fund-code, NEVER the worker's real name (a Phase-13-owned ruling P10 explicitly deferred to us).** Rollups are computed **UNDER the viewer's effective access** via the P10 sole-entry publication projection; restricted lines are excluded **PER-NODE, BEFORE aggregation, at every level** (they never enter a parent total) + a **small-N inference guard** on public totals for mixed restricted+open nodes. Progress/public display routes through the P10 public projection — never a raw ledger sum.
- **Many-funds staff UX (D13.1).** The campaign tree and the fund set are **TWO separate pickers** (staff never navigate funds _through_ the tree). A soft **"expected designations" intent list** (labeled _intent, NOT attribution_ — never a second source of truth) drives: the **source-code generation wizard** (one code per intended fund/channel, with consistent naming), a **coverage/reconciliation panel** ("intended 6 funds, received on 5, 1 at $0"), and the eventual Phase-22 donor fund picker. A per-campaign source-code inventory (live gift count/$ per code, prune zero-activity, deprecate-never-delete, `campaign_id` immutable once gifts exist) contains combinatorial sprawl. The **progress display is an explicit scope toggle** ("This campaign only" vs "Including N sub-campaigns") — **NEVER raw parent + child side-by-side** (the NPSP hand-addition footgun). New campaigns default **FLAT** (a parent is opt-in).
- **Phase seams (BUILD vs RESERVE).** BUILD = the `giving_campaigns` object + `campaign_goals` + the campaign↔source_code link (consuming D14's reserved FK) + the derived progress projection + reporting facts (feeding Phase 33). RESERVE = the **Phase 22 public page** (a page record references a campaign **by id** — never presentation fields on the campaign; note for future callback: Phase 22 attaches the public page); **Phase 36 P2P/PCP** (a supporter fundraiser links via `parent_campaign_id` + a future `personal_campaign` flag — the self-FK is reserved; `creator_donor_id` retired); **Phase 27 appeal** (the appeal owns the linkage; the campaign carries no appeal fields); **Phase 17/32 email** (a comms send references a campaign ONLY via a source_code; all email fields — channel/audience_filter/scheduled_for/sent_at — LEAVE the campaign table into the comms domain); **Phase 33 reporting** (read-only over ledger truth, per-currency, P10-safe).
- **Six hard invariants (tested):** (1) the composite tenant-FK; (2) the depth cap 5; (3) the one locked reparent function with the cycle + depth guard; (4) the single-attribution set-union rollup via one canonical function; (5) `RESTRICT` deletes / archive-only for attributed nodes; (6) closed-node reparent immutability.

### N. Historical recurring design — superseded by Phase 16

> **SUPERSEDED FOR IMPLEMENTATION — 2026-07-13, Phase 16 D1–D19.** The
> historical Phase 13 design below explains the older tickets but is not a
> build contract. Keep Phase 13's append-only contribution ledger, Connect
> direct-charge topology, signed provider-event ingestion, designation
> eligibility, idempotent saga, and refund/return correction paths. Replace
> every recurring-intent, executor-mapping, lifecycle, retry, portal,
> continuation, adoption, and cutover instruction in this section with
> [`phase-16-pledges-recurring-commitments.md`](./phase-16-pledges-recurring-commitments.md),
> its [dated congruence package](./phase-16-cross-prd-congruence-2026-07-13.md),
> and ADRs 0012–0017. In particular:
>
> - one explicit recurring group contains independently manageable lines;
>   compatible lines share a collection cohort with explicit execution legs;
>   ordinary cadences normally use one provider subscription while
>   twice-monthly uses separate 1st/15th legs, and every line has one durable
>   exact-bound provider item in every applicable leg;
> - no code identifies a recurring line through `items[0]`, array order, amount,
>   destination label, or heuristic matching;
> - donor intent, schedule, collection, payment, provider control,
>   reconciliation, and support health are separate facts; the six historical
>   status words may be derived display labels only;
> - Asym owns bounded rail-specific retry eligibility and candidate dates;
>   provider Smart Retries do not own policy, ACH is not silently represented,
>   and a missed occurrence never becomes collectible debt;
> - skip, bounded pause, indefinite pause, cancel, restart, and schedule edits
>   operate on append-only Asym commands and schedule epochs, preserve the
>   normal occurrence grid, show projected dates, and quarantine unsafe
>   mutations when provider control is unknown;
> - an automatic recurring line's final eligible date is not a fixed-total
>   pledge; fixed pledges have a separate total, plan, fulfillment, release,
>   correction, and opt-in reminder model; and
> - reconnecting, importing, or seeing a provider object does not prove Asym
>   controls it or that an older executor stopped. Formal cutover requires
>   current authority plus provider evidence.
>
> Existing Phase 13 issues #706–#710 remain historical planning artifacts and
> must not be dispatched unchanged. The prose below is retained only for
> provenance; where it conflicts, Phase 16 wins without exception.

The obsolete Phase 13 implementation sketch has been removed from the live
document so an agent or ticket generator cannot mistake it for current
requirements. Git history preserves that provenance. Phase 16 owns the complete
recurring and fixed-pledge design; Phase 13 owns only the money-ledger,
Connect-account-scoping, signed-provider-event, designation-eligibility,
idempotent-saga, and correction seams named above.

---

## Data Model & Ownership-Matrix Extension

Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) replaces the current single-table money store with a canonical **append-only header + designation-lines + postings ledger** and its supporting attribution, campaign, cart, and recurring-handoff seams. Phase 16 owns the recurring and fixed-pledge target records. Everything below is tenant-scoped, uses **composite keys + FORCE RLS + service-role writes**, and encodes financial states as **TEXT + CHECK** (never native Postgres enums — the state sets must evolve without a type migration). All money is **integer minor units + explicit ISO-4217 currency on every row** (per Phase 2 (Site/Locale/Currency Foundation); never `NUMERIC` dollars, never `÷100`). Per D2, the new tables are built as a **delete-and-replace** cutover: `contribution_headers.id` **reuses the existing `donations.id` UUIDs** so every inbound FK and every `/contributions/{id}` URL stays valid, all `donation_id` FKs re-target the header, and the migration's final statement is `DROP TABLE donations` — **no compatibility view, ever**.

> **Evidence framing (real-vs-forward, as of authoring).** Anchors below cite what exists on `develop` today so an implementing agent can locate the seam, then state the forward target. They are evidence, not brittle instructions — verify the path before relying on it. Key real-world facts: money truth lives in a flat `public.donations` table (`init_schema.sql:183`, `status TEXT DEFAULT 'pending'` with no CHECK; `amount` NUMERIC dollars; scalar `fund_id`/`missionary_id` with no home for a split gift); corrections already ride an append-only `contribution_adjustments` overlay with an effective-fold (ADR-CD-004) and a whole-array `effective_values.designationLines` replace; `funds.current_amount`/`target_amount`/`goal_amount` are drifting writable counters; `stripe_raw_events` is a signed ingestion ledger verified with the platform secret only (grep-confirmed **zero** `on_behalf_of`/`transfer_data`/`stripeAccount` in `packages/api/src`); `tenants.stripe_secret_key`/`stripe_webhook_secret` are stored **plaintext**; the `campaigns` table (`schema.sql:235-260`) conflates email-blast with donor-fundraiser via a NOT NULL on **both** `creator_donor_id` and `missionary_id`; nothing calls `stripe.subscriptions.create` (the donate path is single-charge PaymentIntents only). Phase 13 supersedes all of these.

### Canonical names, keys, and cross-cutting rules

Every new table below carries: `tenant_id UUID NOT NULL` with **no default** (the `…0001` bridge default is killed); a parent `UNIQUE (id, tenant_id)`; child rows referencing parents by **composite same-tenant FK** `(tenant_id, parent_id)` so a cross-tenant reference cannot resolve; FORCE RLS as belt-and-suspenders on top of the structural composite-FK guard (mirrors the shipped `support_bulk_move_operations.sql:26-27` pattern); Data-API `REVOKE` so money base tables are unreachable from PostgREST; and creation/audit stamps. **Provider IDs are links, never identity** (Phase 1): a `pi_`, `sub_`, `cus_`, `pm_`, `ch_`, or `acct_` is stored as a link column and losing/re-pointing it never changes who a record is or what money happened.

### New/changed tables — the ledger core (D2, D3)

- **`contribution_headers`** — one contribution (one hard-tender payment). Purpose: the gift's canonical identity and declared total. Key columns: `id` (**reuses the `donations.id` UUID**), `tenant_id`, immutable `legal_issuer_id` (server-resolved from the verified legal-issuer authority, never caller input), immutable `gift_method`, `total_minor BIGINT`, currency (ISO-4217), the **frozen legal-donor snapshot** (`donor_id` frozen at gift time per Phase 4; explicit `is_anonymous`/NULL-donor flag; survives merge re-point), the five orthogonal **status axes**, `entry_method`, and Stripe link columns (`stripe_payment_intent_id`, `stripe_charge_id`, `stripe_account_id`). Invariants: `UNIQUE (tenant_id, id, legal_issuer_id)` supports exact-issuer dependent facts; header total = hard tender only; `total_minor = SUM(lines)` at COMMIT; issuer and tender are immutable once posted. The locked commit seam creates the required initial Phase 7 `contribution_dating_facts` revision in the same transaction; the header carries no competing dating values.
- **`contribution_designation_lines`** — one designation target per line; N
  lines per header (split gifts). Purpose: the **money source-of-truth** (the
  header's declared total is validated against these). Key columns: `id`,
  `tenant_id`, composite FK `(tenant_id, header_id)`, `line_ordinal` (stable,
  unique per header), `amount_minor`, `currency` (= header currency,
  DB-enforced), **`fund_id` XOR `missionary_id`** (one target; a one-target
  CHECK is the backstop; unspecified → tenant General Fund resolved **at
  write**), `source_code_id` (nullable FK, D14) plus the frozen attribution
  snapshot, `designation_id` (D9), a boolean `is_fee_cover` (D12), a
  boolean-free snapshot of Designation identity (`fund_code`, `fund_name`,
  `missionary_display_name`, `external_ref`) alongside the live FK, and one
  immutable **Accepted Source Purpose Authority Snapshot** containing exact
  Designation identity, restriction-or-preference class, purpose and excess-use
  policy version, source-posting coverage, and one closed provenance variant:
  either the exact source-owned publication kind/reference/digest when
  presented or captured, or typed `not_applicable`/`not_captured` with the exact
  source-purpose evidence reference/digest. Phase 22 owns a public giving-page
  publication only when that page was the accepted source, over Phase 23's CMS
  substrate; Phase 17 owns a message publication only when a governed
  communication was the accepted source. Invariants: exactly one designation
  target per line (CHECK); every producer supplies owner-labelled provenance to
  the Phase 13 resolver; missing or ambiguous accepted-purpose authority blocks
  the affected line, not unrelated work; no caller may select the legal
  classification or fabricate a publication; any authorized purpose successor
  preserves the original; a delta against a voided line rejects; and the P10
  firewall resolves the label to an alias/fund-code (never a restricted
  worker's legal name) **before** it freezes into the snapshot. _(Amended
  2026-07-30 by Phase 21 D5.)_
- **`contribution_postings`** — append-only entries that fold to the effective money value. Purpose: the money ledger's event stream (initial allocation + every correction/refund/reversal). Key columns: `id`, `tenant_id`, `header_id`, `target_line_id`, `seq` (monotonic per-header), `amount_delta_minor` (signed), `kind` (TEXT+CHECK: `initial`, `refund`, `void`, `write_off`, `ach_return`, `chargeback`, `source_code_correction`, …), `reverses_posting_id` (nullable), `is_initial` replay-guard, actor/reason/provider-outcome facts, plus the **immutable D14 attribution columns copied as plain columns** (never re-read from the live registry). Invariants: **no UPDATE/DELETE once written** (BEFORE UPDATE OR DELETE trigger that RAISEs — not RLS, not REVOKE, because `service_role` has BYPASSRLS and migrations run as owner); `seq` allocated under `SELECT … FOR UPDATE` on the header so ties are impossible; a reversal carries inverse deltas and both rows survive as provenance (never a status flip). Date corrections carry no money delta and therefore never enter this stream; they append through Phase 7's `contribution_dating_facts` authority.
- **`contribution_adjustments` (generalized)** — the current JSONB adjustment overlay is **folded into `contribution_postings` in the same cutover** (per D2 completeness: leaving it as a parallel overlay delivers "one canonical truth" only half-way). Purpose after Phase 13: retired as a truth store; the append-only posting stream is the sole correction record. The shipped effective-fold discipline (ADR-CD-004) and `base_revision` optimistic-concurrency + partial-unique idempotency key are **kept and generalized** onto postings; the whole-array `effective_values.designationLines` replace is **replaced by per-line-id deltas** `{target_line_id, amount_delta_minor, fund_id?, missionary_id?}` with explicit `add_line` / `void_line`.

### New/changed tables — separated lifecycle ownership (D7)

A contribution has **no single status**. Phase 13's owned payment, posting, and
review axes are closed CHECK-constrained state machines enforced in a **locked
SECURITY DEFINER DB function + BEFORE UPDATE trigger** (the locked-function
pattern from the custom-collections reorder work), composing co-moving Phase 13
facts for one event into one RPC under a **per-contribution advisory lock**.
Receipt/document status remains separately owned rather than a column on
`contribution_headers`; Phase 20 accounting coverage is also a derived
cross-domain projection, not a header stub:

1. **PAYMENT** (Stripe/rail truth, driven by webhooks ONLY): `requires_action / processing / succeeded / failed / canceled / refunded / disputed / returned`, plus ACH `provisionally_settled`. Card `succeeded` = final; **ACH `succeeded` = PROVISIONAL** (returns arrive up to ~60 days later).
2. **LEDGER/POSTING** (append-only fold — **the core gap that does not exist today**): `unposted / posted / reversed`. "Posted" = "a ledger entry exists," never immutable-final money.
3. **RECEIPT / DOCUMENT** (Phase 7 source truth + Phase 18 generated-document truth): constrained derived projection only; no Phase 13 column or transition machine.
4. **REVIEW/workflow** (finance queue): `received / needs_review / ready_to_post / …` + review-reason inputs (`donor_match`, `allocation`). This is the human gate; it must **stop overloading `posted`** to also mean ledger-posted.

Composition is a one-directional precondition chain whose first step is tender-specific (processor-confirmed online success, adopted gifts, or recorded CB-B offline tenders → eligible to post; posted → Phase 7 plan/policy receipt eligibility; posted+settled/cleared where required → exportable); reversals flow the **same append-only direction**. Free-text drift is deleted (`succeeded`/`success`/`Succeeded`, the duplicate `SETTLED_DONATION_STATUSES` constant); `donations.status` becomes a projection over the PAYMENT axis. **Hard rule: ACH is not enabled until the `charge.dispute.*` / return handlers + fail-closed review + Phase 13-local one-transaction money reversal and durable Phase 7 correction pointer ship.**

### New/changed tables — tender + dating + non-cash (D8)

- **Tender enum** (normalized `gift_method` TEXT+CHECK on the header; display strings derived): `card, ach, check, cash, securities, in_kind, church_remittance`. (`stock` was **renamed to `securities`** from the first migration — greenfield, no enum exists; the rejected `stock` name is recorded.) Per-tender required metadata and payment-axis finality are as ratified: card/ACH online (ACH provisional-until-settled); check offline provisional-until-cleared (**`check_number` is first-class, distinct from `deposit_reference`**; NSF path identical to ACH-return); cash/in-kind final-at-recorded; church*remittance offline provisional-until-cleared with **per-line soft-credit attributions** (`[{party_id, soft_credit_amount}]`) as a reporting overlay — hard-credit receipt to the church, `sum(lines)=header` intact. *(Phase 15 D6/D4/D5 and Phase 19 D4, in sync with the §E.1 table amendment: deposit-state is a 6th orthogonal axis (`deposit_groups` + nullable gift-grain link), not the flat `deposit_reference`; `ach` deposit-eligibility keys on `settlement_rail` (bank-direct vs Stripe-rail), not `gift_method`; and per CB-B offline check/church post immediately at recorded. A Phase 7-admitted individual receipt follows the immediate timing rail under the closed reason-aware exact-issuer resolver; a repairable pause retains the frozen plan while holding generation/issuance, and a legal lock/end cannot fall through to ordinary policy. `annual_cumulative_cash` creates no per-gift receipt. Hold-until-cleared remains an opt-in per-tenant toggle.)\_
- **Dating (confirms Phase 7 verbatim; D8 adds only the tender→basis map):** `delivery_basis ∈ {postmark, mailing_attestation, received, settlement}` and a pure resolver returns either a complete resolved fact or a typed blocked reason from `{legal_issuer_id, jurisdiction policy identity/version/digest, method, permitted delivery evidence, issuer timezone}`. Captured postmark and staff-attested actual mailing date remain separate evidence and basis codes. Exact issuer `tax_timezone` is a required verified input with no database/runtime default. On success, the header freezes only issuer/tender and the same transaction creates the required initial Phase 7 `contribution_dating_facts` revision carrying policy/digest, resolved timezone, evidence identity, `gift_date`, `tax_year`, and resolution time; later profile changes cannot rewrite or reinterpret it. Missing inputs block resolution, never assume U.S. **Capture-not-recompute** applies once resolution succeeds, and a correction appends a CAS-guarded successor fact. D8.c is a **guided override bounded by the exact jurisdiction contract**, with preview produced by the same resolver.
- **Non-cash subtype substrate (one substrate, four rare types + DAF; append-only, NOT on the closed effective-values fold):**
  - **`non_cash_asset`** — the discriminator: a `subtype ∈ {vehicle, securities, real_estate}` on the **line** (not a tender — the tender is the check/transfer; the asset is _what_ was given). Per-subtype CHECK makes illegal combos (a vehicle with a CUSIP) **unrepresentable**.
  - **`asset_valuation`** — `{fmv_minor, fmv_method, fmv_datetime, appraisal_required (derived), appraisal_ref}`. `fmv_method` is **constrained by `asset_class`** so crypto cannot pick `mean_high_low` and wrongly derive `appraisal_required=false`.
  - **`asset_disposition`** — a read-only projection and compliance-clock anchor over Phase 15's sole canonical append-only asset-lot/disposition/proceeds/finality source projection. It carries the exact source mode, legal-recipient role, source version and evidence reference behind any proved `{status, date_of_sale, gross_proceeds}`; Phase 13 has no second proceeds writer, and a raw disposition row is never a Contribution, Field Account occurrence, or accounting posting.
  - **`asset_identity`** — subtype-keyed `{vin | cusip/ticker/coin+on-chain-ref | parcel}` gated by per-subtype CHECK.
  - Subtype rules: **vehicle** auto-posts the gift (a car is accepted; only disposition/proceeds/ack wait), derived `form_1098c_required = claimed_value > $500`; **securities** carry `asset_class ∈ {publicly_traded, non_publicly_traded, crypto}` (`delivery_datetime` is a TIMESTAMP for intraday crypto), publicly-traded = mean high/low never appraisal, non-public > $10k appraisal, crypto = property, appraisal > $5k with no public-price exception (CCA 202302012), donee 8282 on disposition < 3yr; **real_estate** carries `requires_gift_acceptance_review = TRUE` **always** (ANDs into the auto-post predicate → D7 fail-closed review queue; **never auto-posts**; a `pending_valuation` line state holds in review — never a zero, never a placeholder on a receipt). IRS statutory constants ($500/$5k/$10k/3yr) live as **DB lookup data**, not hard-coded.
  - **DAF is a shape, not a subtype/tender:** `is_daf_grant = true` makes the **hard-credit donor = the sponsor party** (Fidelity/Schwab/NCF); the advisor attaches as **soft credit only** (`is_receiptable = FALSE`, reusing the Phase 7 A8 DB CHECK). Suppression **becomes** the hard-credit-donor identity — **not** a parallel `tax_receipt_suppressed` boolean that could disagree with the wall. `no_quid_pro_quo = true` refuses any benefit/FMV downstream (§4967). An unmatched sponsor alias **fails closed to review**.
- **`contribution_internal_valuation`** (D8.b, BLOCKER-class structural wall) — the optional, **receipt-invisible** internal FMV of a non-cash line. Purpose: the internal FMV **IS the non-cash line's `amount_minor`** (so `sum(lines)=header` holds and totals are real), stored in a table the Phase 7 inclusion-snapshot builder **physically never joins**. The render type is a **discriminated-union `ReceiptRenderInput` whose non-cash arm has no `amount` field at the type level** → a value on a non-cash receipt is a **compile error, not a code-review catch** (plus a taint/negative test). Staff UX must make it crystal-clear this value will not appear on the receipt.
  Phase 21 D21 extends the same structural wall to Field Accounts: this value,
  any appraisal, and any estimated proceeds cannot create a D2 candidate or
  monetary support. Only the exact source-final Realized Support Basis from a
  non-overlapping D21 manifest may do so.

### New/changed tables — attribution + source codes (D14, D14b)

- **`source_codes`** — first-class per-tenant reference entity answering "what prompted this gift?" (replacing the free-text `donations.source DEFAULT 'direct'`). Key columns: `id`, `tenant_id`, `code` (UNIQUE per tenant, restricted charset `[a-z0-9._:-]`, ≤64 — structurally CSV-inert), `label`, `channel` (constrained to a **tenant-config enum** — it is the rollup axis; free-text drift corrupts rollups), `segment` + `message` (free filter tags), `campaign_id` (**nullable FK, reserved for D13** — ship it nullable in the first ledger migration; D13 populates it with no ledger retrofit), `status active|retired`, `created_by`, `created_at`. Invariants: **retire-never-delete** (`ON DELETE RESTRICT`; historical gifts keep pointing at retired codes; retired codes are unselectable on new links); composite `(tenant_id, source_code_id)` FK on lines + FORCE RLS; a single shared `normalizeSourceCode` used by mint AND resolve (round-trip tested); a `pg_trgm` near-duplicate warning at create.
- **Attribution stamping** — captured UTM (allowlist `t, c, utm_source, utm_medium, utm_campaign, utm_content, utm_term` + jsonb overflow for `gclid`/`fbclid`/`msclkid`) resolves **match-or-null + staff triage** (never auto-create). Attribution is **frozen per-line at cart-add** (last-touch within session for later lines; store **both** first- and last-touch, **default LAST-touch** via a per-tenant report-time toggle). Recurring copy-forward is an **immutable snapshot** `{site_id, entry_method, source_code, label+channel+segment}` written as **plain columns on the posting** — never re-read from the live `source_codes` row.
- **Erasable raw-UTM capture-log (privacy, high)** — raw UTM must **NOT** live on the immutable ledger (in a missions context `utm_campaign=iran-house-church` is GDPR Article-9 religious-affiliation data with no erasure path). Purpose: a **separate, mutable/erasable capture-log keyed to the entry event, off the ledger**, with retention + redaction/tombstone (DSAR-compatible), classified under Phase 10 (Sensitive-Data Safety) and routed through the P10 egress firewall; the immutable posting snapshot stores only the resolved `source_code_id` + display fields. A capture-time PII heuristic (reject `@`, long digit runs, `%40` → NULL + flag) runs at capture.
- **URL structure (D14b):** designation rides in the **path** (`/missionary/the-smiths`), source code in the **query** (`?sc=<code>`), never a path segment. A data-driven short-link/QR route `/s/<token>` resolves server-side to `{designation_slug, source_code_id}` and 302s with `?sc=` applied. (Reporting reads the **posting snapshot** for labels — `id`-is-truth, label-is-display; the ONE deliberate exception is the campaign rollup, which reads **live** `source_code_id → campaign_id` as-of-report-time.)

### New/changed tables — campaign + goals (D13)

- **`giving_campaigns`** — a staff-defined, time-bounded fundraising **effort** with goals + reporting rollups (NOT an email blast, page, P2P fundraiser, appeal, source code, or fund; the conflated `campaigns` table is replaced, its email fields moved to the comms domain, `creator_donor_id`/`share_url` moved to the P2P/public-page seams). Key columns: `id`, `tenant_id`, `name`, `slug`, `description`, `status draft|active|closed|archived`, `currency` (**REQUIRED when a monetary goal exists**), `start_date`, `end_date` (nullable), **`parent_campaign_id`** (nullable; the hierarchy is **built now** per the founder override) + a maintained `depth SMALLINT`, `created_by`/`_at`. No `current_amount` (derived, D17), no email/story/CMS/share fields. The line rolls up to its campaign **via `source_codes.campaign_id`** (one FK hop, one source of truth) — **no** mutable `campaign_id` on the line.
- **`campaign_goals`** — zero-or-more typed goals per campaign. Key columns: `campaign_id`, `goal_type ∈ {monetary, donor_count, recurring_supporters, gift_count}`, `target_value`, `currency` (nullable; one goal row per currency, never summed across FX), `sort_order`, `scope own|rolled_up`. Goals are authored independently and **never auto-summed** (parent = sum of children only as an explicit, recomputable staff convenience).
- **Hierarchy invariants (adjacency-list, bounded):** adjacency-list is the sole source of truth; rollups via a recursive CTE bounded by **depth cap = 5** (no closure table / no ltree in v1). Two distinctly-named derived measures per node — `amount_own` (lines whose node = this node) and `amount_in_hierarchy` (**set-union over `{self}∪descendants` on the DISTINCT line set — never `parent.own + Σ(child)`**, which is the classic NPSP double-count bug). One canonical rollup function feeds all surfaces. **Campaign-axis total ⊥ fund-axis total** (disjoint lenses of the same lines — never summed).

### New/changed tables — giving cart, cross-device (D15)

- **`carts`** — the authenticated, **owner-scoped** cart (a donor gives _across_ tenants and has no single tenant JWT claim — so **owner-only, NOT owner+tenant** RLS). Key columns: `id` (opaque UUID PK), `owner_user_id NOT NULL FK`, `status`, timestamps; **partial-unique `WHERE status='active'`** (one active cart per owner). RLS `USING/WITH CHECK (owner_user_id = (SELECT auth.uid()))`; the API is `GET /cart` (implicit owner), never `/cart/:id`; admin/service-role reads must re-assert `owner_user_id`. **Guest cart = client-only localStorage** (90-day TTL, 50-line max), zero server state (enumeration-safe). Merge (guest→login) is **one idempotent RPC under a per-owner advisory lock**: union by ref (new→keep, same ref+freq→**keep incoming amount, never SUM**, same ref+diff freq→keep both), discard/re-scope guest lines not belonging to the login tenant.
- **`cart_lines`** — one designation line. Key columns: `cart_id`,
  `tenant_id` (lives on the line, not the cart), stable opaque `line_id`,
  `designation_ref` (missionary_id XOR fund_id; general→null), `amount_minor`
  (min $1), **one-time or a Phase 16 recurring cadence intent**,
  `is_fee_cover`, and the frozen attribution axes (`site_id`, `source_code_id`,
  `currency`, `locale`, `entry_method='public_checkout'`). Monthly is featured
  when enabled; the server validates any recurring cadence against the
  tenant's versioned Phase 16 allowlist. Invariants: intent only (no card, no
  PII beyond the owner FK, no denormalized labels—the label/state resolves at
  render through the Phase-10-aware read model); one cart = one currency
  (mixed-currency **rejected**); server re-validates every line against live
  tenant state on load AND submit; invalid/cross-tenant/inactive lines **fail
  safe** (dropped/flagged, never leak or mis-designate). \*(Amended 2026-07-13.)\_

### New/changed tables — fee-cover config (D12)

- **`tenant_fee_cover_config`** (per-tenant, **per-payment-method**) — a clean two-row matrix (card / ACH), each `{enabled, rate_bps INTEGER, mode}` where `mode ∈ {optional_opt_out (default), optional_opt_in, mandatory}`. The **engine is `% + fixed-flat` gross-up** — `charge = round((net + flat_cents) / (1 − bps/10000))`, flat = a per-method system constant — so a pure % does not silently under-recover the flat fee; **the tenant sets a simple %, the donor sees clean dollar amounts**. Fail-CLOSED: default optional-opt-out, mandatory OFF, never fail-open to mandatory or a garbage rate. **Mandatory card is bounded** (surcharge law): gift-total framing never "card fee," debit/prepaid hard carve-out via `card.funding` (`unknown` treated as non-credit, auto-downgrade to optional), pre-auth disclosure of the exact added amount + new total, rate clamped ≤3%, per-installment persistence with **no silent recurring increases** (a rate hike is grandfathered or re-consented), plus a tenant warning banner. Fee-cover is its **own ledger line** (`is_fee_cover=true`, reserved system fund), **fully deductible**, and **refund includes the cover**.

### New/changed tables — recurring commitments (D16, D24, D25)

**Superseded 2026-07-13. Do not implement the four historical bullets this
section replaced.** Phase 16 owns the canonical recurring-group, cohort, line,
schedule-epoch, occurrence, attempt, command, provider-binding, control-
incident, and derived-health records. The target is explicit provider execution
legs under each compatible cohort, with ordinary cadences normally using one
subscription and twice-monthly using separate 1st/15th legs, exact item-to-line
binding in every applicable leg, separate state axes, civil-
date schedule truth, product-owned rail-specific recovery, and proof-gated
control recovery. The Phase 13 ledger continues to own posted contribution
headers, designation lines, and correcting postings for money that actually
occurred. The full schema, invariants, transition tables, indexes, RLS, command
contracts, and migration dispositions are in the Phase 16 PRD.

### Changed columns on existing tables (topology + drift fixes)

- **`tenants`** — **DROP the plaintext `stripe_secret_key` and `stripe_webhook_secret`**; **ADD `stripe_account_id` (`acct_`)** only (D1/D23). The platform calls each connected account with its **own** secret key + the `Stripe-Account: acct_…` header; it stores no tenant secret key. (This resolves the D23 CONFLICT — plaintext keys vs the encrypted-at-rest precedent set by `resend_api_key_encrypted` — by removing the secret entirely rather than encrypting it.) The exact issuer compliance profile, not a tenant-wide fallback, stores verified `tax_timezone` (IANA), jurisdiction-policy identity, and optional prior-year policy (D8).
- **`stripe_raw_events`** — add signed top-level `account` (`acct_`), live/test
  mode, and environment dimensions. After platform Connect-endpoint `whsec_`
  verification, resolve that tuple through exactly one effective-dated
  tenant/account binding; missing, duplicate, or contradictory matches quarantine
  the event, and metadata never chooses a tenant. Keep the shipped signed-ingestion
  claim/complete/failure trio. Add handlers for `account.updated` and
  `account.application.deauthorized`.
- **`funds` / `missionaries`** — lifecycle-only (`retired_at` / `merged_into` / `is_active`), never hard-deleted; posted-line FKs `ON DELETE RESTRICT`. **DELETE the writable `funds.current_amount` counter** (D3/D17): progress is **derived** from posted effective lines via the version-cursor read model, with a periodic re-derivation drift alarm. Fund merge sets `merged_into` and resolves at intake only — it never repoints a historical FK.
- **`party` spine (Phase 7/9)** — the DAF sponsor is a **per-tenant party** (org-kind, `org_type=daf_sponsor`), not a hardcoded global; a `party_restricted` marker (Phase 10) governs money-surface egress. Phase 13 does not fork the party spine — it references it.

### Ownership-Matrix extension (per Phase 1)

Phase 13 adds these record types to the Phase 1 ownership matrix. In every row **Asym Postgres is the system of record; Stripe executes and is linked by ID; a provider ID is a link, never an identity.**

| Record type                                                | System of record                                                                                                      | Write path                                                                                                                     | Conflict winner                                                                                         | Repair path                                                                                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contribution header / designation lines                    | Asym Postgres (`contribution_headers`, `contribution_designation_lines`)                                              | Donate/cart saga + contribution operations; signed provider events alone write provider-originated payment/posting transitions | Asym for source-domain meaning                                                                          | Append-only `contribution_postings` (reversing entries); never in-place edits                                                                                                            |
| Contribution postings (correction/refund/reversal stream)  | Asym Postgres (`contribution_postings`)                                                                               | Contribution-operations intent verbs; Stripe webhook for provider-originated postings                                          | Asym                                                                                                    | New negating posting referencing the same `line_id`s; rows never mutated/deleted                                                                                                         |
| Payment execution (charge, refund, dispute)                | Stripe owns exact processor execution and provider state; Asym owns donor intent and source-domain contribution facts | Platform calls with the exact Settlement Account Binding; signed events enter the provider-observation ledger                  | Stripe for what the processor executed; Asym for legal donor, designation, gift, and correction meaning | Re-ingest exact signed provider observations by account/mode/environment/binding, then append the appropriate source-domain effect; never let provider state silently rewrite gift truth |
| Processor balance movements and payout state               | Stripe owns exact balance-transaction and payout observations; Phase 20 owns normalized coverage and transfer linkage | Phase 20 webhook-hinted plus fully paginated synchronization                                                                   | Exact Stripe observation for provider occurrence; Asym for normalized linkage/coverage                  | Re-fetch/reconcile exact account/mode/object evidence; unsupported payout composition remains explicitly unknown rather than inferred                                                    |
| Settlement Account Binding                                 | Asym Postgres (Tenant + Legal Entity + environment + purpose + effective range + non-secret `acct_`)                  | Hosted Connect onboarding and proof-gated binding activation                                                                   | Asym owns binding/coverage; Stripe owns KYC/account capability evidence                                 | `account.updated` / `account.application.deauthorized`; quarantine/reconnect or prospective replacement, never a mutable tenant-account swap                                             |
| Recurring group / cohort / line / schedule epoch / command | Asym Postgres (Phase 16 canonical recurring domain)                                                                   | Phase 16 command services; provider adapter executes exact cohort/item effects                                                 | Asym intent and append-only epochs/commands                                                             | Exact-binding reconciliation; quarantine unknown/control-loss state; formal proof-gated cutover                                                                                          |
| Recurring occurrence / attempt / payment linkage           | Asym Postgres (Phase 16 occurrence and attempt truth; Phase 13 money links)                                           | Phase 16 scheduler + durable provider-event processor                                                                          | Asym schedule/attempt facts; provider proves execution                                                  | Idempotent replay from `stripe_raw_events`; never fabricate money, debt, or a backcharge                                                                                                 |
| Source codes + resolved attribution                        | Asym Postgres (`source_codes`; frozen posting snapshot)                                                               | Staff CRUD + seed/bulk-import + capture-time resolver + append-only override                                                   | Asym                                                                                                    | Append-only D5 source-code correction; alias rules; drift never rewrites the snapshot                                                                                                    |
| Raw-UTM capture log                                        | Asym Postgres (erasable, off-ledger, Phase-10-classified)                                                             | Public entry capture (total/non-throwing)                                                                                      | Asym                                                                                                    | Redaction/tombstone (DSAR); no erasure path exists on the ledger by design                                                                                                               |
| Giving campaigns + goals                                   | Asym Postgres (`giving_campaigns`, `campaign_goals`)                                                                  | Staff campaign admin (`packages/api`)                                                                                          | Asym                                                                                                    | Governed/audited locked reparent fn; archive-not-delete; derived rollups win over any snapshot                                                                                           |
| Cart (authenticated) / cart lines                          | Asym Postgres (`carts`, `cart_lines`; owner-scoped)                                                                   | `GET /cart` owner-implicit; merge RPC on login                                                                                 | Asym (owner)                                                                                            | Re-validate on load/submit; GC convert-driven + lazy TTL (never delete a cart with an in-flight PI)                                                                                      |
| Guest cart                                                 | **Client browser (localStorage)** — zero server state                                                                 | Client only                                                                                                                    | Client until merge, then Asym                                                                           | Discarded on TTL (90d); reconciled to live tenant state on load/merge                                                                                                                    |
| Fee-cover config                                           | Asym Postgres (`tenant_fee_cover_config`, per-method)                                                                 | Tenant admin config                                                                                                            | Asym                                                                                                    | Config validation at write; per-installment persisted `applied_rate` is the historical truth                                                                                             |
| Fund progress / campaign progress / public totals          | Asym Postgres **derived** (version-cursor read model)                                                                 | No direct writer — folded from postings                                                                                        | Asym derivation                                                                                         | Re-derive from postings; drift alarm; `funds.current_amount` counter deleted                                                                                                             |

**Provider rule reaffirmed (D1):** Stripe may charge a card, issue a refund, run a subscription, or store a saved PaymentMethod on the connected account — Asym links each by ID (`pi_`/`ch_`/`sub_`/`cus_`/`pm_`/`acct_`). Losing or re-pointing any of them never changes who a donor is or what money happened. The **ledger stays topology-agnostic**.

### Postgres-enforced invariants (the DB is the enforcement floor)

These are structural — enforced by constraint, trigger, or locked function, not by application code alone. Each is a pgTAP target.

1. **`sum(lines) = header`, deferred to COMMIT.** A `DEFERRABLE INITIALLY DEFERRED` constraint trigger keyed off the header validates `COALESCE(SUM(amount_minor),0) = header.total_minor` AND `≥1 line` AND same-currency — so the header + all lines + all per-line outbox rows commit in ONE transaction (Stripe/side-effects run OUTSIDE the txn from the committed outbox via `FOR UPDATE SKIP LOCKED`).
2. **No UPDATE/DELETE on a posted row.** A BEFORE UPDATE OR DELETE trigger RAISEs on `contribution_headers`/`_designation_lines`/`_postings` once `posting`-axis = `posted` (whole row frozen; new columns frozen by default). The only permitted transition is the one-time `draft → posted`. (Trigger, **not** RLS — `service_role` has BYPASSRLS — and **not** REVOKE — migrations run as owner.)
3. **Monotonic per-header `seq`.** `seq` is allocated under `SELECT … FOR UPDATE` on the header so `NOW()` ties are impossible; the fold orders by `seq`, never `created_at`; index `(tenant_id, donation_id, seq)`. The fold and the revision token share the `seq` key.
4. **Exactly one designation target per line.** `fund_id` XOR `missionary_id` CHECK; a delta against a voided line rejects; general → tenant General Fund resolved at write.
5. **No final unassigned designation.** A posted line always resolves to a concrete target (General Fund is the backstop, never a NULL designation on a posted line).
6. **Refund ≤ unrefunded.** A refund/void/write-off posting's magnitude is clamped to the line's remaining unrefunded effective amount (largest-remainder proration across N effective lines, reject if the requested reversal exceeds the header's effective total).
7. **Provider-event uniqueness (idempotency at every level).** UNIQUE on the ingest `event_id`; the saga key; `(tenant_id, header_id)`; `(header_id, line_ordinal)`; posting `INSERT … ON CONFLICT DO NOTHING`; UNIQUE `stripe_subscription_id`; the `${cartKey}:<suffix>` derivation; `recovery/{tenantId}/{invoiceId}/{family}/{attemptN}`. Out-of-order or duplicate provider events are quarantined with backoff, never dropped or fabricated.
8. **Tenant on every row + composite same-tenant FKs.** `tenant_id NOT NULL` with no default on every table; parents `UNIQUE (id, tenant_id)`; children reference by `(tenant_id, parent_id)` so a cross-tenant reference cannot resolve; FORCE RLS as belt-and-suspenders. The `…0001` bridge default is killed.
9. **Campaign hierarchy depth ≤ 5 + no cycle.** `CHECK (parent_campaign_id <> id)` + a maintained `depth SMALLINT` re-derived across the whole subtree on reparent (a cycle exceeds 5 → rejected) + a BEFORE UPDATE trigger rejecting a parent already in the node's descendant set — all inside one locked reparent function under a per-root advisory lock (cycle-check + depth-rewrite atomic → no TOCTOU). Composite `(tenant_id, parent_campaign_id)` FK. Reparent is blocked on closed/archived nodes.
10. **Single currency per header and per hierarchy.** Line/adjustment/posting currency = header currency (DB-enforced); currency is branded into the TS money type (USD+JPY fails typecheck); campaign child currency = parent's (or per-currency buckets); report totals `GROUP BY currency`, never a cross-currency scalar.
11. **Effective value readable only through the derivation.** Base money columns are writer-role-only; the effective value is read through a SECURITY INVOKER projection that folds postings in SQL; a **CI grep gate** forbids direct base-money reads elsewhere (and bans `.from('donations')`); a post-cutover check asserts `public.donations` (table or view) does not exist; type-regen so `donations` no longer typechecks is the **primary** enforcement (every missed reader is a compile error), grep is the backstop.
12. **Units-seam correctness.** A backfill assertion proves `sum(minor)/100 = pre-migration dollar total per tenant`; a before/after FK-row-count check inside the same transaction proves the `contribution_headers.id = donations.id` UUID reuse orphaned nothing.

---

## Permissions & Separation of Duties (Phase 12)

Per Phase 12 (Full Role & Permission Configuration), **capabilities are the only enforcement unit**: every money read/write verifies the HMAC-signed, tenant-branded `EffectiveAccess` (subtract-only floor always wins; revocation ≤ 60s). **Phase 13 MINTS the money capabilities and DECLARES the SoD pairs; Phase 12 enforces them.** The current broad `finance:manage_contributions` is decomposed, and the branch-code that directly patches `donations.fund_id` is removed (a designation change is a capability-gated intent verb that appends a posting, never a column patch).

### Money capabilities Phase 13 mints

- `finance:view_contributions` — read the ledger through the projection floor (never raw base-money columns).
- `finance:record_contribution` — create a header + lines (staff-entered offline gifts; online gifts are webhook-written).
- `finance:issue_refund` — record refund intent (executes on the connected account via `Stripe-Account`; the `charge.refunded` webhook is the sole ledger writer). Money-OUT, irreversible.
- `finance:correct_amount` — amend a gift amount (balanced line+header delta posting).
- `finance:redesignate` — move/re-split a designation, **including cross-missionary** (sum-preserving −Y/+Y pair; role-restricted to finance/admin per D5.a; header delta 0).
- `finance:void_contribution` — void/cancel (`kind=void`, no tender return).
- `finance:write_off` — write-off (`kind=write_off`, reported separately; finance/admin only per D5.c).
- `finance:reverse_correction` — append an exact negating entry (inherits the reversed op's risk tier).
- `finance:manage_source_codes` — mint/retire source codes, hand-assign attribution (audited `created_by`/`overridden_by`).
- `finance:manage_campaigns` — create/reparent/archive campaigns (the locked reparent fn is capability-gated).
- `finance:configure_fee_cover` — set the per-method fee-cover config (server-enforced ≤3% clamp; mandatory-card warning banner).
- `finance:manage_gift_acceptance` — approve real-estate / non-cash gift-acceptance-review items (the fail-closed queue).

### Founder governance posture (D5) — role + active audit, optional SoD

Money ops are gated by **ROLE (a finance/admin capability) + a mandatory non-suppressible reason + an immutable audit trail** — **NOT** blocked behind a mandatory second-approver workflow by default. Rationale: missions orgs often have one finance person; forced SoD stalls or gets rubber-stamped (fails R-JW, the "just works" governing principle). So Phase 13 does **not** hardcode approval-request/SoD routing as mandatory for any verb. The always-on control is a **DETECTIVE** one with teeth: every high-risk op writes a `contribution_operation_audit_events` row (actor / reason / before-after / provider-outcome), surfaces in a **visible correction/refund activity feed** with a real-time notification to other finance/admins, and can raise a tenant-configurable dollar-threshold anomaly alert (default ≈ $1,000).

### SoD pairs Phase 13 declares (Phase 12 enforces, OFF by default)

These requester ≠ approver pairs are **optional per-tenant policy, OFF by default, configured in the Phase 12 permission/approval-config** (never hardcoded here). Orgs with the staff can enable a preventive second-approver layer (and/or auto-require it above a dollar threshold); single-finance orgs never see it. When enabled, the op routes to a `contribution_correction_request` (pending → approved) with a **server-enforced requester ≠ approver** check:

- `finance:issue_refund` → second approver (money-OUT, irreversible — the strongest candidate).
- `finance:write_off` → second approver (with an optional dollar threshold; per D5.c the threshold is an alert/optional-SoD trigger, not a hard block).
- `finance:redesignate` (cross-missionary) → second approver.
- A **cross-issued-year `delivery_basis` / gift-date override** inherits Phase 7 A15's staff-attestation default, with independent approval only when tenant or jurisdiction policy strengthens it (a wrong tax year onto an immutable receipt).

Risk tiers reuse the shipped `policy.ts` / `approval-policy.ts` spine: **HIGH** (refund, amount correction, designation/fund correction, void, write-off, reversal-of-high-risk) = non-suppressible reason + capability + audited (+ optional SoD); **MEDIUM** (same-scope re-split, add/void line not changing total, receipt supersede) = reason + immediate + audited; **LOW** (memo) = optional reason. There is **never a raw status dropdown** — payment state changes only via intent verbs that know their postings.

---

## Cross-domain blockers

Both are gating preconditions: no donor-facing communication or restricted-
designation write path may ship while either canonical safeguard is absent.
Phase 13 and Phase 16 consume these seams; neither may fork a second authority.

### Blocker 1 — the canonical fail-closed communication-consent seam

**Real-vs-forward at Phase 13 authoring:** the canonical consent seam was not
yet on that branch. Re-verify current code before implementation; do not infer
current absence from this historical anchor.

**Binding forward contract (amended 2026-07-13):** Phase 6 and its Phase 3
prerequisite own the one message-purpose-aware consent, suppression, dispatch,
delivery-outcome, and history seam. Phase 16 owns recurring/fixed-pledge
candidate policy and Phase 17 owns editable content. Every eligible, blocked,
suppressed, attempted, and failed outcome is recorded. Errors fail closed for
dispatch; mandatory rail/network/legal notices follow their separately proven
route. No recovery or reminder may bypass `do_not_contact`, applicable
suppression, tenant isolation, purpose policy, or permanent semantic dedupe.

### Blocker 2 — a server-side designation-eligibility resolver

**Real-vs-forward (as of authoring):** `deriveFundType` (`designation-set.ts:61`) is a **display classifier with no filter** — the "safe by construction, the picker hides restricted workers" assumption is **FALSE** (never trust client visibility). A donor could POST a `fund_id` for a restricted worker on checkout or on a recurring designation change, routing money to a target that should be structurally unreachable (Phase 10 physical-safety surface).

**Forward:** build `assertDesignationSelectable(tenantId, donorId, fundId)` that re-runs the **same P10/public picker predicate server-side** against the submitted `fund_id`, rejecting an ineligible target **before any Stripe call**. One shared `listEligibleDesignations()` is used by BOTH the picker AND the edit/self-serve path, so a restricted worker is genuinely un-targetable — invisible in the picker and rejected on submit. This backs D15 (server re-validates every cart line), D16.5 (full donor self-serve on designation is safe because the eligibility check, not a staff gate, is the guard — and a self-serve designation change opens a new attribution epoch, never rewriting frozen D14 history), and the D22 restricted-worker safety posture on money surfaces (fund/designation names, slugs, Stripe descriptors, and source codes resolve through the P10 firewall to an alias/fund-code, never a worker's legal name — enforced with a structural test, since Phase 10 explicitly deferred the fund-name rule to Phase 13).

---

_Section source: the ratified Phase 13 grill decision log (D1, D1b, D2, D3, D5, D7, D8, D12, D13, D14, D14b, D15, D16, D17, D24, D25, plus the woven D9/D19/D20/D21/D22/D23 topics and governing principles R-JW / R-UX). Predecessor bindings P1–P12 consumed, not re-litigated._

## Testing Decisions

Good tests here assert **external, money- and tax-observable behavior** — "a header whose lines don't sum is rejected at commit," "a posted row cannot be mutated," and "a refund posted by webhook appends the exact money inverse plus one durable Phase 7 source-correction pointer without mutating downstream artifacts" — not internal shape. The safety tier is **permanent** because this is money and tax documents; a failure fails the build. Modules are each tested behind their stable interface, and the deepest coverage goes to the pure resolvers (the largest-remainder proration function, the date-of-delivery `delivery_basis` resolver, the `%+flat` fee-cover gross-up, the effective-value fold, the campaign set-union rollup) which are exhaustively table-driven.

**What makes a good test here (house discipline):**

- **Behavior over implementation.** Assert the observable contract at the boundary (the rejected commit, the append-only row that survives, the derived total that changes), never the private column layout or the intermediate posting shape. A correction is verified by the _effective value after the fold_, not by how many rows the fold walked.
- **pgTAP for DB invariants.** The append-only immutability trigger, the `DEFERRABLE INITIALLY DEFERRED` `sum(lines)=header` constraint, the monotonic per-header `seq`, the composite `(tenant_id, header_id)` FKs, the reparent cycle/depth guard, and the `ON DELETE RESTRICT` posture are **enforced in Postgres**, so they are proven in Postgres (pgTAP), not mocked in TypeScript. This mirrors D2/D3's ratified enforcement posture (the trigger RAISEs because RLS can't stop `service_role`, which has `BYPASSRLS`).
- **Drive money-path tests through real code + local DI — never `vi.mock` of package internals.** Per the repo Bun-realpath trap ([[vitest-module-mock-realpath]]), a `vi.mock` of `packages/*` internals by relative path silently no-ops in the full CI suite (Bun symlink realpath), so a money test that mocks the saga or the poster can pass while testing nothing. Exercise the **real** saga/poster/fold and inject the _boundary_ dependencies (a fake Stripe client, a fake clock, a fake outbox drainer) via DI or a local test double the code actually calls. Every money-path assertion must be reachable from the real code path.
- **Real-vs-forward (as of authoring):** prior art the agent builds on — `tests/unit/packages/api/admin/contribution-operations-permissions.test.ts` (capability-array behavior), the contribution-operations idempotency/approval tests, the advisory-lock reorder tests ([[fractional-index-collation-trap]]), the Phase 7 permanent negative/safety tier, the Phase 10 egress meta-test, and the `verify:data-boundary` golden-snapshot CI pattern. These are patterns to extend, not brittle files to depend on.

**P0 permanent negative/safety gates (each red-on-regression, each with a committed _failing_ poison-fixture proving the gate bites):**

1. **Deferred-sum rejects at commit.** A header whose designation lines do not sum to the declared total (including the fee-cover line) is rejected **at COMMIT** by the deferrable constraint trigger — not at statement time — with `COALESCE(SUM,0)`, the `>=1 line` rule, and same-currency all folded in (D3.10). Poison fixture: a two-line header off by one minor unit.
2. **Posted-row immutability.** Any `UPDATE`/`DELETE` on a `status='posted'` header, line, or posting RAISEs (D3.2); the only permitted transition is one-time `draft→posted`. New columns are frozen by default. Poison fixture: a direct `.update()` against a posted row, and a raw SQL `UPDATE` as owner.
3. **Per-line-delta corrections, never whole-array replace.** A correction appends `{target_line_id, amount_delta_minor, …}` deltas at the next `seq`; a delta on a voided line rejects; a re-designation is one txn of paired deltas summing to zero; `reversed` is a _derived_ read flag, never a stored status flip (D3.3/D3.4, D5). Poison fixture: a whole-`designationLines`-array overwrite attempt.
4. **Integer minor units + no ÷100.** Every money value is integer minor units with explicit branded currency; the shared format/parse helper is the _only_ converter; a hardcoded `/100` or `en-US` assumption fails typecheck or a lint/grep gate (P2, D10). Regression fixture: JPY (zero-exponent) round-trips with **no** division, and USD+JPY on one header fails to type-check. This is the D2 "units seam" blocker — one unconverted read is a silent 100× money error; a backfill assertion proves `sum(minor)/100 == pre-migration dollar total per tenant`.
5. **Auto-post exception routing fails CLOSED.** The exception predicate set (large-gift, restricted-ministry, import-source, donor-match _ambiguity_ ≥2 candidates, real-estate `requires_gift_acceptance_review`) routes to the finance review queue; **absent tenant config defaults to conservative review**, never silent auto-post (D7 blocker #2). Poison fixture: a new tenant with no config + a restricted-ministry gift must land in review, not post.
6. **DAF zero-advisor-receipt.** An `is_daf_grant` gift makes the _sponsor_ the hard-credit donor; the advisor attaches as soft credit only (`is_receiptable=FALSE`), and suppression _is_ the hard-credit-donor identity — not a parallel `tax_receipt_suppressed` boolean that can disagree (D8 DAF ruling). Poison fixture: a DAF advisor can never mint a receipt or enter a deductible total.
7. **Internal-value-unreachable taint test.** The optional internal FMV of a non-cash gift _is_ that line's ledger amount (so `sum(lines)=header` holds) but lives in a separate `contribution_internal_valuation` table the Phase-7 inclusion-snapshot builder **physically never joins**; the `ReceiptRenderInput` non-cash arm has **no `amount` field at the type level**, so a value on a non-cash receipt is a **compile error** (D8 blocker #1). Test: a taint/negative test asserting the non-cash render arm cannot carry a dollar figure, plus the compile-fail fixture.
8. **Cross-tenant isolation.** No header/line/posting/commitment/campaign/source-code row ever resolves across a tenant; lines use composite `(tenant_id, header_id)`/`(tenant_id, fund_id)` FKs so a cross-tenant reference cannot resolve, with RLS as belt-and-suspenders (D3.12). The `…0001` default is gone. Poison fixture: a line pointing at another tenant's fund fails the composite FK, not just RLS.
9. **ACH return reversal.** A `charge.dispute.created` on a one-time or recurring succeeded-but-return-exposed ACH gift appends the money _reversal_ (never mutates), moves the payment axis to terminal `returned` (distinct from `refunded`), net-reduces progress, and emits one idempotent pointer to Phase 7's source correction authority — **all Phase 13 effects in one transactional DB function under a per-contribution advisory lock**. Phase 7 independently derives the correction/coverage effect; Phase 18 independently creates any jurisdiction-correct successor/current artifact; Phase 19 coordinates any affected statement late-fact/correction lane; Phase 17 independently communicates. Poison fixture: an out-of-order return-before-success event is quarantined, never dropped or fabricated.
10. **Dispute-after-receipt.** A dispute/return arriving after issuance retains every prior artifact and appends the owner-separated correction chain. Phase 7 owns source correction/coverage, Phase 18 applies the purpose/jurisdiction identity rule (for example, a U.S. acknowledgment reference may retain its stable reference with a new version, while a Canadian replacement receives a new serial citing the predecessor), Phase 19 coordinates any affected statement successor, and Phase 17 delivers any required notice. No universal “base number retained” rule and no cross-domain atomic artifact mutation are permitted.
11. **Hierarchy cycle / double-count / reparent-closed-node.** (a) A reparent that would create a cycle or exceed depth-5 is rejected by the three-layer DB constraint inside the one locked reparent function (D13 K-invariants); (b) `amount_in_hierarchy` is a **set-union** over `{self}∪descendants`, never `parent.own + Σ(child)` (the classic NPSP double-count); (c) reparenting a closed/archived node is blocked so closed-period totals never retroactively rewrite. Plus: a campaign-axis total is never summed with a fund-axis total (disjoint lenses of the same lines).
12. **Phase 16 boundary regression.** A structural contract test fails if
    Phase 13 code creates one subscription per recurring line, looks up a line
    through `items[0]`, writes a universal recurring status, owns retry timing,
    or mutates a Phase 16 intent table directly. This prevents the superseded
    design from returning through an older ticket.
13. **Provider evidence without fabricated control.** Replaying a raw provider
    event is idempotent, but seeing or reconnecting a subscription/customer does
    not mark it managed, authorize collection, or prove the prior executor
    stopped. Phase 16's proof-gated adoption/cutover contract is the only path
    that may establish those facts.
14. **Unified one-time and recurring ACH finality.** `processing` persists only
    agreement/attempt/provider evidence and a processing projection: no
    contribution posting, received total, Phase 7 receipt authorization, Phase
    18 generated-document request, or Phase 17 delivery. One provider-confirmed
    success creates/posts the source occurrence exactly once and emits zero or
    one idempotent Phase 7 authorization pointer according to the frozen
    plan/ordinary policy; `annual_cumulative_cash` emits none and records
    year-end readiness. A later return appends the exact
    money inverse and one source-correction pointer; each owning phase advances
    its own monotonic outcome independently. Replay and out-of-order fixtures
    prove that processing→success→late-return cannot duplicate or skip a source
    fold transition or downstream semantic occurrence.
15. **Noncash value cannot become monetary support.** A structural contract test
    proves that the original noncash line amount, recognized value, FMV,
    appraisal, claimed value, and provider estimate are absent from the Phase 21
    D2 candidate input type and query. A pending, partial, ambiguous, or merely
    staff-marked Phase 15 disposition produces no candidate. Only one exact,
    source-final, non-overlapping D21 Realized Support Basis can cross that seam;
    replay cannot create a second Contribution, receipt, campaign increment,
    supporter credit, Field Account occurrence, or accounting posting.

**Additional required coverage (non-P0 but tested in-phase):** the cart outbox
hands recurring intent to Phase 16 exactly once per stable opaque line; a
subscription-origin payment cannot also enter the one-time writer; raw provider
event replay cannot duplicate a contribution header or designation line; a
resumed cross-device cart re-prices/re-mints stale one-time provider intent; a
guest→login merge keeps the incoming amount on a same-ref/same-cadence
collision and never sums it; the fee-cover mandatory-card debit carve-out
treats unknown funding as non-credit; CSV formula injection is neutralized at
capture and export; restricted-worker names never egress through new document
doors; and a golden snapshot proves the D2 migration's UUID and per-tenant
money reconciliation; and the receipt contract proves that the current
counsel-gated fee-cover classification and one deductible receipt total are
identical for a one-time gift and every recurring occurrence, with no duplicate
fee-cover receipt line. The complete recurring cohort, schedule, retry,
self-service, provider-control, and fixed-pledge matrix belongs to the Phase 16
PRD and runs as an integration prerequisite before recurring launch.

---

## Build Order

_What the PRD tells the agent to build, and in what order. Nothing in a later group ships until the earlier group's CI gates are green. This is a fresh-build (no users) — the D2 cutover is one atomic delete-and-replace, not a phased shim._

**SHIP-FIRST — blockers; a wrong choice here is unrecoverable or unsafe to run without:**

1. **The Stripe Connect vertical slice + the one account-scoping wrapper (D1 — the #1 sequencing blocker).** The entire cart/recurring/refund surface assumes a controller-properties connected account; today there is **zero** `on_behalf_of`/`transfer_data`/`stripeAccount` in `packages/api/src` and the webhook verifies with the platform secret only (as of authoring). Build: hosted Connect onboarding (create controller account → Account Link → persist **only** `acct_`), the single Connect wrapper that **requires** exact account and livemode for every payment/cohort/leg operation, and the platform Connect webhook endpoint that verifies the signed top-level account plus live/test mode and environment against exactly one effective-dated tenant/account binding. Metadata never selects a tenant; ambiguous or missing bindings quarantine. Add the `account.updated`/`account.application.deauthorized` handlers. Delete the plaintext `tenants.stripe_secret_key` → `stripe_account_id` (D1/D23). No `application_fee` anywhere (D1b: 0% of donations).
2. **The fail-closed consent and communication seam.** Phase 6/its Phase 3
   prerequisite owns eligibility, suppression, delivery, and history. Phase 13
   must not create a second gate. No Phase 16 recovery or fixed-pledge reminder
   candidate may dispatch until that canonical seam exists and records both
   blocked and attempted outcomes. _(Amended 2026-07-13.)_
3. **The server-side designation-eligibility resolver (D16 blocker #2).** `deriveFundType` (`designation-set.ts:61`, as of authoring) is a _display_ classifier with no filter — "picker hides restricted" is false (never trust client visibility). Build `assertDesignationSelectable(tenantId,donorId,fundId)` re-running the P10/public picker predicate server-side, and one shared `listEligibleDesignations()` used by picker _and_ edit, so a restricted worker is genuinely un-targetable at checkout and at recurring-designation-change.
4. **The atomic D2 cutover migration.** Create the D3 header+lines+postings tables as canonical, **reusing the existing `donations.id` UUIDs** (keeps every FK + `/contributions/{id}` URL valid); re-target all `donation_id` FKs to the header via composite same-tenant FKs; reconcile `staged_gift_allocations` **into** designation lines (not duplicated); fold `contribution_adjustments` JSONB into append-only postings; convert `NUMERIC` dollars → integer minor units (the units-seam blocker); re-point all readers/writers + the public GraphQL surface; reseed demo/seed native-in-new-shape; `DROP TABLE donations` as the final statement — **no view, ever**. Enforcement: regenerate `packages/database/types/database.ts` so `donations` no longer type-checks (primary — every missed reader is a compile error) + a CI grep gate banning `.from('donations')` + a post-cutover check that `public.donations` (table or view) does not exist + the pgTAP gates.

**BUILD-V1 — the enforced product (each behind a named gate, dependency-ordered):**

5. The **D3 ledger core**: header + designation lines + append-only postings; monotonic `seq` via `FOR UPDATE` on the header; the immutability trigger; the deferrable `sum(lines)=header` constraint; the derivation-only effective-value fold + CI grep gate on base-money reads; the version-cursored read model; **delete `funds.current_amount`** (derive + reconcile); the shared largest-remainder (Hamilton) proration function used by both the UI preview and the ledger.
6. The **D7 separated lifecycle**: CHECK-TEXT columns for Phase 13-owned payment, posting, and review truth; the locked transition RPC + `BEFORE UPDATE` trigger (unknown pairs → escalation row, never silent-ignore); route existing webhooks through it; replace the free-text `donations.status`; and ship the fail-closed exception predicate set + queue. Receipt/document and accounting coverage remain constrained cross-domain projections with no Phase 13 stub columns.
7. The **NEW `charge.dispute.*` + refund/return handlers** in the Inngest processor (idempotent; Nacha R05/R07/R10/R11 → return/correction effect; pin the Stripe API version + a CI allowlist-review-on-bump) and the Phase 13-local one-transaction reversal cascade (payment state → money inverse → derived progress → durable Phase 7 correction pointer under a per-contribution advisory lock). Phase 7/18/19/17 then advance independently. **HARD GATE — the ACH no-go:** _do not enable ACH until these dispute/return handlers + the fail-closed review + the local reversal/outbox cascade ship._ ACH is one Stripe dashboard toggle from live; enabling it earlier means money leaves and the gift stays "paid" forever (D7 blocker #1 / the one hard rule).
8. **D8 tender + dating + non-cash subtypes**: the `gift_method` enum + per-tender metadata; the capture-not-recompute date-of-delivery resolver with `delivery_basis` **guided override bounded by method** + live tax-year preview + A15 staff attestation on issued-year crossing (tenant/jurisdiction strengthening optional); fail-closed tenant tax config; the `non_cash_asset` substrate (vehicle/securities incl. crypto/real-estate) with subtype-keyed CHECK constraints making illegal combos unrepresentable, dedicated append-only fact tables (not the closed fold), derived 1098-C/8283/appraisal flags from DB lookup constants; the structural internal-value wall; real-estate always `requires_gift_acceptance_review` (never auto-posts). Publish the immutable original asset/purpose references Phase 15's source projection must bind, expose disposition only through the read-only Phase 15 projection, and make every original valuation field structurally absent from the Phase 21 D2 monetary-candidate seam.
9. **D14 source codes + attribution**: the `source_codes` registry (FORCE RLS, Data-API-revoke, composite uniqueness, `ON DELETE RESTRICT`, `campaign_id` nullable-reserved); the **seed/bulk-import path** (cannot trail — an empty registry routes the whole ledger to triage on day one); the shared `normalizeSourceCode`; UTM capture (discrete allowlisted columns + jsonb overflow); per-line write-once freeze; the immutable recurring attribution snapshot (label+channel+segment+id, **not** raw UTM); the **separate erasable raw-UTM capture-log** off the ledger (Article-9 religious-affiliation risk) + redaction path; store-both + per-tenant report-time toggle initialized to **last-touch**; the CSV-injection fix; **the tagged-link builder** (canonical `?sc=` link + short link + dynamic QR) and the `/s/[token]` data-driven redirect (the one friction-critical UI — match rate is a direct function of it).
10. **D13 campaign model + bounded hierarchy**: `giving_campaigns` (currency required when a monetary goal exists) + child `campaign_goals` (zero-or-more typed) + adjacency-list tree with maintained `depth` (cap 5) + the one locked reparent function (cycle+depth guard) + composite tenant FKs; the single canonical set-union rollup view (`amount_own` / `amount_in_hierarchy`); consume D14's reserved `source_codes.campaign_id` FK (no ledger retrofit); the "expected designations" intent list + coverage panel + per-campaign source-code inventory; flip `extensible_targets.campaign` on (P11).
11. **D15/D12 giving cart + fee-cover**: the cart model (ordered
    designation lines, one-time or validated Phase 16 cadence intent, reserved
    attribution axes); hybrid persistence (guest = client-only localStorage
    90-day TTL; authenticated = **owner-only** server cart, RLS
    `owner_user_id = auth.uid()`, guest→login merge via one advisory-locked
    idempotent RPC); server re-validation of every line; a durable outbox handoff
    to one one-time PaymentIntent branch plus the Phase 16 compatible-cohort
    planner; the Express Checkout Element wallets-first flow; the `%+flat`
    gross-up engine behind a simple-% display; per-tenant per-method card/ACH
    config with the ratified guardrails; fee-cover as its own deductible ledger
    line; refund-includes-cover.
12. **Phase 16 recurring boundary—do not build the superseded Phase 13
    design.** Supply the Connect-scoped executor wrapper, signed raw-event
    ledger, idempotent event claim/dispatch/recovery substrate, exact
    designation-line money links, and correction/reversal paths. Phase 16 owns
    the recurring group/cohort/line schema, exact item binding, schedule engine,
    occurrences, attempts, commands, retry policy, self-service, staff service,
    provider-control quarantine, fixed pledges, fulfillment, and projections.

**SEAM-V1 — schema/hook now, integration deferred (each with a named later
consumer):** stable connected-account and provider-object links; raw signed
event retention; the reusable event claim/complete/failure and workflow
dispatch ledgers; source/designation snapshots copied onto later occurrences;
the **Phase 15 → Phase 21 D21 noncash-realization seam** (exact original
Contribution/accepted-purpose/asset references plus a read-only Phase 15 source
projection; no Phase 13 proceeds writer and no original valuation in the D2
candidate contract);
the **Phase 20 accounting-eligibility and source-identity seam** (with
downstream coverage read only from Phase 20 records); the **campaign public-page
reference-by-id** seam (Phase 22); the **soft-credit table** keyed to the header
(Phase 14); the **DAF hand-off facts** enumerated now (capture-in-13,
operate-in-14); and the D14 `parent_campaign_id`/`personal_campaign` P2P
reserve (Phase 36). Phase 16 owns all import/adoption control posture,
authorization provenance, mandate provenance, schedule anchor, and formal
executor-cutover contracts; no Phase 13 column may pre-judge them.

**DEFER — named later phases:** recurring commitments, fixed-total pledges,
provider adoption/cutover, recovery, reminders, fulfillment, and support-health
(Phase 16); editable message content (Phase 17); public campaign pages (Phase
22); appeals (Phase 27); the full accounting/GL export product (Phase 20);
non-recurring donor-portal depth (Phase 25); soft-credit/DAF _operations_
(Phase 14); and offline batch-entry surfaces (Phase 15).

---

## Observability

The model's theses—"maximize completion," "honest fee estimate," and
"campaign totals reconcile"—are **unfalsifiable without instrumentation**, so
observability ships **in-phase**, not as a follow-up. Everything below is
derived from the ledger's own truth; no observability surface introduces a
second writable counter. Phase 16 owns recurring-recovery and support-health
metrics over its separate occurrence/attempt/control facts.

- **Recurring integration health (amended 2026-07-13).** Phase 13 exposes
  provider-event lag, duplicate/replay suppression, unknown money linkage,
  reversal failures, and contribution-fold drift. Phase 16 owns recovery
  episodes, retry slots, occurrence outcomes, control posture, schedule drift,
  meaningful-transition communication outcomes, and support-health aging. A
  shared provider/control failure becomes one tenant incident with affected
  counts, never one alert per line. PII stays out of logs.
- **Checkout / cart funnel (D15/D12).** Instrument the abandonment funnel by stage (express-checkout shown → cart built → fee-cover state → method entered → reviewed → accepted → one-time/recurring branches reconciled) and grouped cohort/occurrence outcomes. Phase 20 D19 observability adds exact eligible processor cost, associated fee-cover, covered and uncovered cost, organization and Designation shares, exceptions, and a zero-difference conservation check. Aggregate fee-cover-versus-actual-cost drift remains a checkout-estimate signal, never proof that 100% reaches a supported purpose.
- **Attribution health (D14).** Named v1 metrics (charts may trail): **match rate**, **unattributed rate**, **triage backlog age**, **top-unresolved tuples**, **first/last-touch divergence**, **recurring-snapshot integrity** (a year-1 gift still reports under its origin code in year 3).
- **Source-ledger reconciliation invariants (D3/D13 — fail loudly; derived
  wins over any cache).** A `giving_reconciliation_runs` job asserts:
  `Σ(amount_own over the tree) == root.amount_in_hierarchy`;
  `Σ(all posted lines) == campaign-total-over-all == fund-total-over-all`
  (disjoint lenses); and `sum(lines) == header` across the ledger. Phase 13
  may flag missing or contradictory provider-source evidence but does not
  claim bank/deposit/settlement reconciliation. Phase 15 owns operational
  deposit grouping, Phase 20 owns bounded Bank Match and settlement coverage,
  and QBO/Xero owns final reconciliation.
- **Progress drift (D3.8/D13).** Because `funds.current_amount` is deleted and fund/campaign progress is _derived_ from the version-cursored effective read model, a **periodic re-derivation drift alarm** compares the cached read model against a from-scratch fold; a mismatch means the cursor invalidation missed an append and is a release-quality bug, not a cosmetic one. The effective read model is cursor-invalidated (not TTL) so a stale read is structurally detectable.
- **Money-out active audit (D5).** Every high-risk correction/refund/write-off writes an immutable `contribution_operation_audit_events` row (actor / reason / before-after / provider-outcome) **and** surfaces on a visible correction/refund activity feed with real-time notification to other finance/admins (detective control with teeth — no money-out action is invisible), plus an optional tenant-configurable dollar-threshold anomaly alert (default ~$1,000). A `payment_axis_disagrees_with_latest_receipt_version` watch (partial index) catches a receipt that drifted from its payment state.

---

## Out of Scope

Reserved as seams (plumbed, not built) or owned by a named later phase — Phase 13 builds the durable data model + contracts + correctness rules for each, and the later phase attaches with no rework:

- **The cross-processor migration workstream** — full CRM data ETL at scale,
  provider-coordinated token-vault transfer, card/ACH reauthorization, cutover
  freeze and reconciliation, connected-account readiness, and recurring-executor
  replacement at scale. Phase 13 supplies only exact external money references
  and the `already_receipted` boundary. Phase 16 supplies classification,
  civil-date schedule, authorization/mandate, control-quarantine, and proof-gated
  adoption/cutover contracts. Asym never handles raw PAN, CVV/CVC, or full bank
  credentials (deps Phases 4/9/11/16).
- **Recurring recovery and communication-candidate policy** — Phase 16 owns
  product retry incidents, ACH recovery, derived health/attention reasons, and
  meaningful-transition candidate generation. Phase 13 records provider and
  ledger facts only; it does not mint a mutable `lapsed` state or a sequence.
- **Public campaign pages** — Phase 22 (a page record references a campaign by id; no presentation fields on the campaign).
- **Peer-to-peer / personal-campaign fundraising** — Phase 36 (the `parent_campaign_id` self-FK + `personal_campaign` flag are reserved).
- **Appeals** — Phase 27 (the appeal owns the linkage; the campaign carries no appeal fields).
- **Full accounting / GL delivery** — Phase 20. Phase 13 supplies exact
  eligible source occurrences and reads a derived coverage summary; it ships
  no accounting-export status machine. Phase 20 owns immutable releases,
  provider delivery/readback, bounded Bank Match, and append-only compensation;
  QBO/Xero owns the final books and final bank reconciliation.
- **Donor-portal depth** — Phase 25 owns statements, preference center, wallet,
  magic-link, and broader portal depth. Phase 16 owns recurring-management
  behavior; Phase 13 ships no separate retention portal.
- **Soft-credit / DAF operations** — Phase 14 (Phase 13 captures the DAF payer/soft-credit/suppression _shape_ and enumerates the hand-off facts; the operations run in Phase 14).
- **Offline batch-entry surfaces** — Phase 15 (Phase 13 models the offline tenders and their `recorded→deposited→cleared` lifecycle + NSF path; the batch-entry UI product is Phase 15). _(Amended 2026-07-11, Phase 15 (Offline Gift & Batch Entry) D6/D5: Phase 15 formalizes deposit-state as the **6th orthogonal axis** (D6) and `recorded` = posting (D5 validate = post); the `recorded→deposited→cleared` narration is that axis, not a chain of posting gates on the money.)_

---

## Counsel-Review Gate

**Not legal or tax advice.** Phase 13 encodes best-effort rules from primary sources (IRS Pub 526 date-of-delivery, Pub 1771 substantiation, Pub 526/561 non-cash, Form 1098-C vehicle rules, Form 8283/8282 non-cash appraisal + disposition, CCA 202302012 crypto-as-property, §4967 DAF excise, Notice 2017-73 DAF-pledge, Nacha return-code windows, Stripe refunds/disputes/Connect docs, Visa/Mastercard surcharge rules + the CT/MA/ME state patchwork, FTC ROSCA / Negative-Option Rule). Consistent with Phase 7 (Receipt, Statement Compliance & Donor Credit), **every money- and tax-affecting behavior in this phase must be reviewed by qualified finance/tax counsel before production use.** The specific behaviors gated on counsel review:

- **Date-of-delivery / tax-year resolution** and the guided `delivery_basis` choice bounded by exact issuer policy (`postmark` / `mailing_attestation` / `received` / `settlement` where permitted), including the issued-year-crossing action.
- **Fee-cover as a deductible gift-total component**, and specifically **mandatory-card fee-cover** — the surcharge-law posture (gift-total framing, the debit/prepaid carve-out, the ≤3% clamp, the disclosure, the tenant warning banner). Counsel confirms the gift-total framing keeps the org out of the surcharge regime and that mandatory ACH (not a card) is unaffected.
- **Non-cash handling** — vehicle (1098-C disposition-drives-deduction), securities/crypto (appraisal thresholds, crypto-as-property with no public-price exception, the 8282 3-year disposition clock), real-estate (donee-signs-8283-Part-V), and the **describe-not-value / internal-value-never-on-a-receipt** wall.
- **DAF** — sponsor-as-legal-donor, $0 advisor acknowledgment, no quid-pro-quo benefit, the `daf_pledge_no_sponsor_reference` rule.
- **The pre-Asym receipt boundary** for imported gifts (Asym never re-issues or retracts a receipt a legacy system sent; prior receipts carried immutable; YTD preserved) and the **never-retract-a-prior-year-issued-receipt** rule on reclassification.
- **Never auto-convert an ended recurring arrangement or fulfilled fixed-total
  pledge into new recurring collection** without fresh, separately accepted
  authorization, and preserve the applicable cancellation-ease invariants.

A **counsel-review checklist** ships as a PRD appendix / evidence artifact, compiled from the cited sources; the statutory constants ($500 / $5k / $10k / 3-year) live as DB lookup data so a threshold change is a data change, not a code change. Parity is measured by the compliant outcome, not a SiteStacker screen clone.

---

## OpenSpec & Docs Updates

Congruence work owed at authoring (Phase 13 introduces the contribution ledger, so it touches the shared program docs and the ownership matrix):

- **`docs/prds/sitestacker-parity/roadmap.md`** — flip Phase 13's status from `future (needs PRD)` to the PRD-authored state; confirm the deps row (`1, 2, 3, 4, 5, 7`) and the "what later phases take from it" note (every contribution stamped with site / `entry_method` / `source_code` / designation; the alias-vs-fund-code publication decision made **with** Phase 13); reflect the D1 topology + D2 delete-and-replace as the ledger's canonical shape.
- **`docs/prds/sitestacker-parity/phase-map.md`** — confirm Phase 13 precedes offline batch (15), pledges (16), and the cultivation/ask records that tie to Phase 13 campaigns/designations.
- **`docs/prds/sitestacker-parity/README.md`** — add Phase 13 to the phase index / status table.
- **`docs/prds/sitestacker-parity/parity-matrix.md`** — populate the contributions/giving, public-checkout, and MC-finance rows with Phase 13 ownership (and the touched rows for Phases 2, 5, 7, 10).
- **`docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md`** — add the Phase 13 source-domain records with owner / write path / conflict winner / repair: `contribution_headers` · `contribution_designation_lines` · `contribution_postings` · `contribution_internal_valuation` · `non_cash_asset` (+ valuation/disposition/identity) · operation audit events · source codes/raw-UTM capture log · campaigns/goals · carts/lines · `SettlementAccountBinding` · reserved soft-credit seam. State the boundary honestly: Asym owns gift intent/facts and binding coverage; Stripe owns exact processor execution, balance transactions, payout state, connected-account identity, and capabilities; Phase 20 owns normalized payout/accounting coverage; QBO/Xero owns accepted provider records and the books. Phase 16 registers recurring/fixed-pledge roots separately and pins the same Legal Entity/binding.
- **Root `CONTEXT.md` glossary** — add the Phase 13 ledger/attribution terms. Phase 16 owns the current recurring group/line/cohort/executor, collection-lapse, fixed-total pledge, fulfillment, and support-health language; do not retain the historical six-state/per-line-executor vocabulary.
- **OpenSpec change + ADRs** — author the OpenSpec change for the contribution-ledger capability, and the ADRs for the Phase 13 hard-to-reverse decisions: the D1 Connect-direct topology + 0% economics; the D2 delete-and-replace (fresh tables reusing UUIDs, no view); the D3 append-only header+lines+postings + derivation-only truth; and the D7 money-ledger axes + ACH no-go rule. Phase 16 ADRs 0012–0017 supersede the former per-line-subscription/combined-pledge design.

---

## Further Notes

- **Roadmap position:** Phase 13 of 41 (roadmap v2, adopted 2026-07-07). Depends on Phases 1, 2, 3, 4, 5, 7 (roadmap deps) and _consumes_ the binding constraints of Phases 9, 10, 11, 12 (CRM party spine, restricted-worker safety, custom-fields posture, the capability PDP). Consumers: Phases 14 (soft-credit/DAF ops), 15 (offline batch), 16 (recurring commitments, fixed-total pledges, fulfillment, recovery, and support projection), 17/35 (automation), 20 (accounting export), 22 (public campaign pages), 25 (portal depth), 27 (appeals), 33 (reporting), 36 (P2P).
- **Fresh-build, no-migration-ceremony posture ([[no-users-fresh-build-posture]]):** the product has no users, so the D2 cutover is one **atomic delete-and-replace** — no compat view, no coexistence shims, no two-class experience, `DROP TABLE donations` as the migration's final statement. This is _distinct_ from the D24/D25 migration seams: Asym has no legacy, but an **incoming tenant arrives with an existing recurring donor book**, so the ledger must be import-aware from day one even though Asym itself carries nothing forward. Schema/CI migration hygiene still applies; demo/seed data is reseeded correct-from-start in the new shape.
- **Notable reversals from the provenance (the highest-signal parts of "how we got here"):**
  - **D1 topology: named-Option-2 (destination) → actually-Option-3 (direct charges).** The founder's constraint ("no money ever flows through Asym") _is_ the defining property of direct charges; the Stripe-docs pass confirmed controller-properties accounts + the `Stripe-Account` header let Asym observe/refund without holding funds or keys, and de-risks money-transmitter classification.
  - **D2 canonical identity: Option 3 (temporary compat view) → Option 2 (delete-and-replace).** The founder initially chose the compat view; the ruthless review reversed it — a Postgres view can't be an FK target, can't absorb the writes, and is lossy on split gifts (it would _launder_ the existing `fetchDonations` split-gift misattribution bug into "correct"), violating the founder's own zero-tech-debt rule.
  - **D8.c dating: "free choice" of `delivery_basis` → "guided override bounded by method."** Free choice regresses the ratified IRS method-governed dating and is a wrong-tax-year-onto-an-immutable-receipt hazard; the reconciliation preserves the founder's beautiful-UX intent (smart pre-selected default + live tax-year preview via the _same_ resolver + approval on issued-year crossing) while bounding the override to legally-defensible options.
  - **D14.2 attribution default: first-touch → last-touch (per-tenant toggle, store-both).** Contribution-ledger best practice (NPSP Primary Campaign Source, Blackbaud Appeal, CiviCRM Source) is last-touch — the gift-driving ask — which the per-line freeze-at-cart-add already captures; store-both makes the toggle a free cosmetic, not a migration.
  - **D16.5 recurring self-serve: "guarded (staff-gated)" → full donor self-serve.** Safety is preserved not by a staff gate but by an invisible server-side eligibility check (the same P10/public predicate that governs what's selectable anywhere) plus a new attribution epoch on designation change (never rewrites frozen D14 history) — so full self-serve and safety are compatible; the earlier "guarded = staff gate" framing was wrong.
  - **D15.2 recurring mapping (superseded 2026-07-13):
    grouped-per-frequency → one subscription per line → Phase 16 compatible
    cohorts.** The Phase 13 founder override is historical. Phase 16 D2 keeps
    independently manageable Asym lines while grouping compatible collection
    behavior into one cohort with explicit execution legs and one exact-bound
    item per line in every applicable leg.
    This preserves donor control without forcing a debit per destination.
- **Governing principles that bound every decision:** [[R-JW]] "just works" (seamless/invisible to donors, effortless for the tenant, no hacky workarounds), R-UX (effortless by default, powerful on demand), [[founder-completeness-bar]] (ship the finished thing — tests + docs are part of "done"), and [[design-from-first-principles-not-current-impl]] (current code is evidence, not a template). All repo anchors above are framed real-vs-forward _as of authoring_ — evidence of the starting point, never brittle build instructions.
- **Verification provenance:** design ratified 2026-07-09 via `grill-with-docs` (decisions D1–D25 + governing rulings R-JW / R-UX), grounded by the `phase13-grill-prep` research workflow (15 agents: predecessor PRDs + current money-code evidence-classified + Stripe/CiviCRM/IRS/Baymard/FTC-ROSCA best practice), then a ruthless 16/17-category adversarial review + verify pass on each major decision (D2, D3, D5, D7, D8, D12, D13, D14, D15, D16). Two live code hazards owned as ship-first blockers: the missing fail-closed consent gate (`packages/api/src/email/consent.ts` absent on this branch) and the display-only designation classifier (`designation-set.ts`). **No "live/shipped" claims** — this is a design, groomed against not-yet-built Phase 3/4/5/7/9/10/11/12 contracts.

## Dated Phase 17 message-ownership clarification (2026-07-19)

**Old statement.** Phase 13 owns append-only money truth, contribution state,
payment finality, campaign/source attribution, and communication eligibility;
it already reserves authored content to Phase 17.

**New winner.** Phase 17 renders only the typed, recipient-projected facts and
protected actions that Phase 13 (or the current superseding Phase 16 recurring
domain) supplies through a System message contract. The contract-owned minimum
truth core preserves exact amount/currency, actual payment/finality state,
legal donor, designation, correction/refund/return meaning, masked payment
description, and source occurrence.

**Compatibility boundary.** Phase 17 creates no contribution, ledger posting,
receipt, refund, campaign attribution, recurring schedule, recipient, or
communication candidate. Tenant prose cannot relabel Processing as Received,
promise settlement, change money, or invent an event. The Phase 16 recurring
supersession remains binding; this note changes no Phase 13 ledger authority.

## Dated Phase 21 D11 Field Account integrity clarification (2026-07-30)

Phase 13 remains authoritative for immutable contribution occurrence
identities and revisions, the complete effective header/line/posting set, exact
source currency, Designation and legal-donor meaning, and append-only
contribution correction lineage. Phase 21 consumes those facts only by exact
source identity, version, and non-overlapping coverage.

Phase 21's monotonic ingestion cursor proves only which committed Phase 21
processing facts its Support Cycle Integrity Manifest examined. It neither
certifies Phase 13 source completeness nor authorizes contribution repair. A
missing, duplicate, contradictory, or otherwise incorrect contribution fact is
corrected through the Phase 13 append-only command and evidence contract; Phase
21 may then append or replay only the exact resulting source-linked Field
Account Occurrence under its remaining-coverage and idempotency rules.

Neither a Field Account Integrity Case nor a Field-Account-side/
organization-control-side variance may edit, blindly replay, invent,
force-offset, or move Phase 13
contribution truth. Mission Control follow-up and QBO/Xero state confer no
Phase 13 or Phase 21 correction authority.

## Dated Phase 21 D19 Support Assignment purpose boundary (2026-08-01)

Phase 13 remains authoritative for the Designation, accepted source purpose,
contribution header/lines, legal donor, and append-only corrections. A Phase 21
Support Assignment may receive Field Account effects only through an exact,
versioned, same-scope mapping to the admitted Phase 13 purpose and the existing
source-coverage contracts. The Support Assignment is not the Designation, donor,
worker owner, or public giving-page subject by implication.

Adding, ending, correcting, merging, or changing a Support Assignment
Participant Membership or workspace grant never creates, retargets,
redesignates, merges, reverses, or corrects a contribution. Party, spouse,
household, teammate, leader, login, notification, or page state cannot select a
financial target. Purpose succession remains Phase 13/D5 source-owned and
append-only.
