# SiteStacker Parity — Program Charter

This folder governs the long-term SiteStacker parity effort for
`Asymmetric-al/core`. It is the program-level home: the rules, the inventory,
and how each area is tracked. Detailed per-feature plans are written later, when
each area is actually built — not here.

## What "SiteStacker parity" means (outcome parity)

Parity means **matching what SiteStacker/WMTek lets a Christian missions
organization accomplish — built our way**, not cloning its screens.
SiteStacker is the **benchmark of operational capability**, not a UI blueprint.

For every area, the question is: _"Can a missions organization get the same
real-world job done here as they can in SiteStacker?"_ — not _"Did we replicate
SiteStacker's exact screens?"_

This is a durable product term; see the `SiteStacker parity` entry in the
root `CONTEXT.md` glossary.

## Benchmark source (what we measure against)

Parity is measured against **official SiteStacker/WMTek public documentation**:

- `https://sitestacker.training` and
  `https://forms.sitestacker.training/full-training-documentation`
- product framing at `https://sitestacker.com`

Rule: every benchmark entry in the parity matrix **cites a specific doc page**
or is marked **"not yet sourced."** No benchmark claim rests on memory.

**Known limitation:** public docs describe _features_, not always _operational
depth_ (real behavior under failure/edge cases). Deep behavioral documentation
of an area happens when that area is built, not in Phase 0.

## Scope

- **In scope:** the 25 parity areas listed in [`parity-matrix.md`](./parity-matrix.md).
- **Out of scope:** **child sponsorship** (declared out now). Other exclusions
  are recorded in the matrix with an "out of scope / not pursuing" status as
  they surface — we do not guess the full exclusion list up front.

## Guardrails (inherited, not restated)

The parity effort inherits the platform's existing, binding boundaries. It does
**not** restate them — one source of truth. The binding rules live in OpenSpec:

- `openspec/specs/platform-boundaries/spec.md` — server-side boundary for
  sensitive operations; CRM = operational truth, CMS = authored editorial
  content and presentation truth; role-scoped surface boundaries; tenant
  isolation; shared-logic convergence. More-specific domain contracts retain
  operational release, safety, financial, and runtime authority.
- `openspec/specs/platform-surfaces/spec.md` — Mission Control owns staff
  depth; donor portal = donor self-service; missionary workspace =
  support-raising/communication; public website = public content + giving.
- `openspec/specs/platform-product-intent/spec.md` and
  `openspec/specs/platform-principles/spec.md` — product intent and the
  decision ladder.

Source-of-truth ownership is additionally ruled by
[ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) and
the [Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md):
Asym Postgres owns all CRM truth; Twenty CRM is retired as a product
dependency.

**Parity-specific reminder:** a new SiteStacker-style capability must fit an
existing surface and use the shared `packages/api` layer — it must not become a
bolted-on module or push admin depth into donor/missionary surfaces.

## How work is sequenced

- The current build order is **[`roadmap.md`](./roadmap.md) (Roadmap v2,
  adopted 2026-07-07)** — 41 phases (0–40) in seven dependency lanes, with
  the v1→v2 renumbering map. [`phase-map.md`](./phase-map.md) is the short
  orientation mirror of it. The original post-Phase-0 order in
  [`phase-00-baseline.md`](./phase-00-baseline.md) was **provisional** and is
  superseded; phase-00 remains the origin of the firm, locked "B needs A
  first" dependencies. Any pre-2026-07-07 document citing a phase number
  above 9 uses v1 numbering — decode via the roadmap's map.
- Each area graduates to its own detailed PRD + OpenSpec change **when it is
  actually being built**, not before.
- **Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit
  Model)** is the final Lane-1 foundation phase (groomed 2026-07-05; Phases
  2–6 precede it in dependency order — see [`phase-map.md`](./phase-map.md)).
  It **fulfills the identity/party and receipt-facts seams reserved in Phase
  4**—the persons/Party spine, frozen legal-donor Statement Subject, and
  immutable receipt/statement facts. Phase 14 owns the
  `contribution_credits`, tribute, matching, and DAF operational models; Phase
  7 consumes their typed read models without rebuilding them. Phase 7
  **hard-depends on the Phase 4 isolation-hardening foundation, the Phase 6
  communication-event spine + `sendEmail` seam, and the Phase 3 consent gate
  (PR #502) shipping first** (the PRD's hard prerequisites C1–C3).
- **Phase 8 (CRM Operating Foundation)** was **re-groomed 2026-07-07 (#603
  complete)** under
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
  With Twenty retired and Asym Postgres owning all CRM truth, the Twenty
  write-enable spine is **withdrawn** (dormant code → #602) and the phase is
  reframed to the **CRM Operations Observability & Data-Health Foundation**: a
  read-only `/crm/operations` windowpane, escalation over the shipped Inngest
  recovery machinery (no second healer), alert routing (Sentry + the Phase-6
  seam), and the CRM data-health catalog Phase 40 later builds on. Its
  **build-now core has no hard prerequisite** (it observes Asym's shipped
  runtime + the Phase-4 merge count); Phase 6 gates the emailed-alert path and
  Phase 9 gates the reserved party-graph-health sockets. Issues re-scoped
  2026-07-07 (epic #587; #590/#591/#594/#598 closed). **Supersedes** the
  earlier `phase-01-crm-operating-foundation.md`.

## Files in this program

- [`README.md`](./README.md) — this charter.
- [`roadmap.md`](./roadmap.md) — **Roadmap v2 (source of truth for phase
  architecture):** the full 41-phase table with slugs and dependencies, the
  v1→v2 renumbering map, dependency lanes/parallelism, and per-phase scope
  sections. **Read this (plus `phase-map.md`) before writing a PRD, issues,
  tickets, or a new implementation PR** so the work fits the whole program.
- [`parity-matrix.md`](./parity-matrix.md) — the 25-area inventory (the tracking
  source of truth).
- [`phase-map.md`](./phase-map.md) — short orientation guide mirroring the
  roadmap: phase order, dependency lanes, owner surfaces, and
  ticket-generation guardrails.
- [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  — the Phase 1 deliverable (ruled 2026-07-06): the per-record-type
  source-of-truth ownership ruling and the record that Twenty CRM is retired
  as a product dependency
  ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)).
  Not the same file as the tombstoned `phase-01-crm-operating-foundation.md`.
- [`phase-00-baseline.md`](./phase-00-baseline.md) — the Phase 0 plan: what
  Phase 0 does, its done-definition, and the provisional order.
- [`phase-01-crm-operating-foundation.md`](./phase-01-crm-operating-foundation.md)
  — tombstoned; superseded by Phase 8; retained for history (issues #466–#476
  closed as superseded, 2026-07-06).
- Phase PRDs (groomed, each tracked by an epic + children):
  [`phase-02-site-locale-currency-foundation.md`](./phase-02-site-locale-currency-foundation.md)
  (epic #477),
  [`phase-03-minimum-permission-role-scoped-projection-foundation.md`](./phase-03-minimum-permission-role-scoped-projection-foundation.md)
  (epic #489),
  [`phase-04-identity-account-claiming-foundation.md`](./phase-04-identity-account-claiming-foundation.md)
  (epic #503),
  [`phase-05-public-website-runtime-contract.md`](./phase-05-public-website-runtime-contract.md)
  (epic #520), and
  [`phase-06-shared-communication-event-model.md`](./phase-06-shared-communication-event-model.md)
  (epic #550).
- [`phase-07-receipt-statement-compliance-and-donor-credit.md`](./phase-07-receipt-statement-compliance-and-donor-credit.md)
  — the Phase 7 plan (Receipt & Statement Compliance Rules + Donor
  Identity/Credit Model): a rules-first receipt/statement engine + the full
  donor credit model. Groomed and committed; tracked by epic #566 + children
  #567–#586.
- [`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md)
  — the Phase 8 plan, **re-groomed 2026-07-07 (#603 complete,
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md))**
  into the **CRM Operations Observability & Data-Health Foundation**: a
  read-only `/crm/operations` windowpane, escalation over the shipped Inngest
  recovery (no second healer), alert routing (Sentry + Phase-6 seam), and the
  CRM data-health catalog Phase 40 builds on. The Twenty write-enable spine is
  withdrawn (→ #602). The build-now core has no hard prerequisite; Phase 6/9
  gate the reserved sockets. Tracked by epic #587 (children #588–#601;
  #590/#591/#594/#598 closed at the re-groom). Supersedes
  `phase-01-crm-operating-foundation.md`.
- [`phase-09-full-crm-depth-relationship-graph.md`](./phase-09-full-crm-depth-relationship-graph.md)
  — the Phase 9 plan (Full CRM Depth & Relationship Graph): the People &
  Churches backbone — parties supertype + relationship graph (stored +
  derived edges), the record-detail shell (8 live tabs + 8 reserved
  sockets + the header contract), one list engine with kind-scoped routes,
  party-keyed notes/activity, Cmd-K search, and governed CSV export.
  Groomed 2026-07-06; hard-depends on Phase 4 + Phase 7 (party spine);
  Phase 8 is a soft dependency (ADR-0001). Tracked by epic #604 + children
  #605–#627.
- [`phase-10-sensitive-data-safety.md`](./phase-10-sensitive-data-safety.md)
  — the Phase 10 plan (Sensitive-Data Classification & Restricted-Ministry
  Safety Foundation), **groomed + founder-grilled 2026-07-07 (G1–G7 + a
  four-lens adversarial pass; epic #628 + #629–#641)**: the safety rails a
  missions CRM needs — a person-level `security_level` (**tenant-sovereign**
  country-risk-defaulted; opt-in World Watch List seed; person always
  overrides), dual identity (legal name vs public alias, **alias enforced at
  the data layer**), the publication firewall as a **sole-entry** architectural
  invariant, restricted data in a separate RLS table, ABAC through the Phase-3
  resolver, read-audit, **one identity-access-grant object** (standing /
  requested / break-glass) with **"Security Clearance" a role-toggled
  capability**, consent/publishing preferences, and telemetry redaction —
  landed **before** custom fields (Phase 11) and public missionary
  pages (Phase 22) can create unclassifiable data. **Extends** the Phase-3
  `field_policies` floor; the member-care case product stays Phase 38.
  Groomed 2026-07-07; hard-depends on Phase 3 + Phase 9. Tracked by epic
  #628 + children #629–#640.
- [`phase-11-custom-fields-custom-collections.md`](./phase-11-custom-fields-custom-collections.md)
  — the Phase 11 plan (Custom Fields & Custom Collections): a governed field
  catalog + policy-at-birth model on Asym Postgres, obeying the Phase-10
  classification from field creation. Groomed 2026-07-08 (decisions D1–D13).
  Tracked by epic #645 + children #646–#664.
- [`phase-12-full-role-permission-configuration.md`](./phase-12-full-role-permission-configuration.md)
  — the Phase 12 plan (Full Role & Permission Configuration): one server-side
  PDP producing a runtime-verifiable branded `EffectiveAccess`; capabilities the
  sole enforcement unit (names never authorize); additive grants above a
  subtract-only floor; tenant branded into the token; instant causal revocation.
  Groomed 2026-07-08 (26 decisions + 7 rulings + five adversarial passes).
  Tracked by epic #665 + children #666–#687.
- [`phase-13-campaign-designation-contribution-ledger-giving-cart.md`](./phase-13-campaign-designation-contribution-ledger-giving-cart.md)
  — the Phase 13 plan (Campaign, Designation, Contribution Ledger & Giving
  Cart): the money backbone — Stripe Connect **direct charges on each tenant's
  own connected account** (Asym never in the flow of funds, 0% cut), an
  **append-only header + designation-lines + postings** ledger that replaces the
  single donation row, the multi-designation **giving cart**, first-class
  **source codes**, **giving campaigns** with a bounded parent/child hierarchy,
  and the **recurring-commitment** object with dunning + a self-serve portal.
  Groomed 2026-07-09 (decisions D1–D25 + five ruthless adversarial reviews).
  Tracked by epic #690 + children #691–#713.
- [`phase-14-donor-credit-operations.md`](./phase-14-donor-credit-operations.md)
  — the Phase 14 plan (Donor Credit Operations: Soft Credits, DAFs, Tributes &
  Matching Gifts): the operational credit layer on the Phase 13 ledger — one
  `contribution_credits` spine (typed roles, three amount classes, recognition
  as a derivation), DAF sponsor/advisor operations with an entry-gated
  automatic thank-you stream, tribute/memorial gifts with an amount-suppressed
  second letter stream, the matching-gift expectancy lifecycle with the
  employer's separate legal gift, church remittance attribution feeding the
  missionary supporter roster, household recognition derived at read, and
  capped standing rules — all behind the Phase 7 document walls. Groomed and
  committed 2026-07-10 (decision families D1–D5 + five close-outs; three
  ruthless adversarial fleets + two focused design passes).
  Tracked by epic #719 + children #720–#741.
- [`phase-15-offline-gift-batch-entry.md`](./phase-15-offline-gift-batch-entry.md)
  — the Phase 15 plan (Offline Gift & Batch Entry): the professional offline
  batch-entry workbench — **one front door** (all staff-entered offline money
  flows through a single gift-entry-batch commit service), **validate = post**
  with a frozen-original control total and high-risk auto-route, **native phone
  card (embedded SAQ-A Payment Element + server-confirm MOTO) and ACH** payments,
  **deposit grouping** as the operational deposit-state axis, reusable batch
  **templates**, and the per-batch **Send-acknowledgments gate** that releases
  held batch-origin rows into the existing acknowledgment pipeline. Groomed
  2026-07-11. Tracked by epic #758 + children #759–#786.
- [`phase-16-pledges-recurring-commitments.md`](./phase-16-pledges-recurring-commitments.md)
  — the Phase 16 plan (Pledges & Recurring Commitments): automatic card/ACH
  recurring giving is the flagship, with donor-anchored civil-date schedules,
  grouped independently manageable lines, compatible provider cohorts,
  rail-specific recovery, proof-gated provider-control quarantine, and clean
  donor/staff/missionary management. A separate, deliberately quiet fixed-total
  pledge domain supplies optional plans, conserved fulfillment, four truthful
  change operations, and opt-in tenant-controlled gentle reminders without
  turning the legacy workflow into the primary product. Groomed 2026-07-13
  (ratified D1–D19; official-source research, six ADRs, dated cross-PRD
  congruence, and OpenSpec reconciliation). Tracked by epic #793 + children
  #794–#837. Planning only; groomed-not-dispatched.
- [`phase-17-system-messages-template-management.md`](./phase-17-system-messages-template-management.md)
  — the Phase 17 plan (System Messages & Template Management): one complete
  code-governed System message catalog and contract-owned safety kernel;
  immutable structured publications with typed source-owned facts, tenant-open
  locales, bounded whole-message fallback, Brand Kits and Layout Roles;
  contract-bounded Delivery Plans and proportional in-product notifications;
  transport-dark SMS governance; universal tenant-owned Resend with one Default
  plus bounded Sender Profiles and governed Reply-To purposes; evidence-first
  body-free history with an expiring support-safe Recent sent copy; deterministic
  recovery; versioned tenant portability; and a structurally separate fixed
  platform-email seam for Eve/operator mail while Discord remains Eve-owned
  operational delivery. Groomed 2026-07-19 (ratified
  D1–D20, executable 18-key manifest, dated producer/obligation census,
  decision-to-test traceability, primary-source research, dated cross-PRD
  congruence, focused ADRs, and an `outbound-communications` OpenSpec delta).
  Tracked by epic #873 + children #874–#905. Planning only; every child remains
  `status:blocked`; groomed-not-dispatched and not built.
- [`phase-18-receipt-pdf-template-system.md`](./phase-18-receipt-pdf-template-system.md)
  — the Phase 18 plan (Receipt & PDF Template System): one clean canonical
  Generated Document service and structured Document Studio over source-owned
  immutable facts; one pre-registered renderer contest with at most one exact
  production winner; one current canonical accessible PDF; exact-byte private
  custody and scanner-resistant access; complete everyday U.S. acknowledgments;
  a proof-gated exact-issuer Canadian registered-charity pack; governed
  specialist obligations; item-authoritative batches; purpose-owned records,
  holds and verified disposal; and an environment-gated destructive
  pre-production cut that leaves zero legacy runtime. Groomed 2026-07-21
  (ratified D1–D17; executable purpose/authority manifest, renderer qualification
  protocol, 204-row decision-to-test traceability, primary-source research,
  dated cross-PRD congruence, ADRs 0033–0039, and a rewritten Document Production
  OpenSpec contract). Epic #907 and children #908–#961 are published:
  #908–#910 are open with `status:todo` + `ready-for-agent`, while #911–#961
  remain open with `status:blocked`. This approved frontier does not prove the
  phase is built or authorize further dispatch.
- [`phase-19-year-end-statement-operations.md`](./phase-19-year-end-statement-operations.md)
  — the Phase 19 plan (Year-End Statement Operations): one source-authoritative
  population, immutable Run Preflight, atomic release barrier, canonical
  purpose-pinned Statement Run and Run Item system, separately authoritative
  document/portal/communication/paper outcomes, self-print-first physical
  fulfillment, cooperative containment, tenant-controlled truthful completion,
  exact-current donor access, and one PII-minimized Run Evidence Record.
  Groomed 2026-07-24 (ratified D1–D18; PRD authority map,
  decision-to-test traceability, primary-source research, dated cross-PRD
  congruence, focused ADRs, and a Statement Operations OpenSpec delta).
  Planning only; epic #977 and children #978–#1031 are published and blocked.
  No implementation dispatch is authorized, and the phase is not built.
- [`phase-20-accounting-exports-reconciliation.md`](./phase-20-accounting-exports-reconciliation.md)
  — the implementation-ready Phase 20 specification (Accounting Exports &
  Reconciliation): one accounting doorway over immutable balanced Accounting
  Releases, exact source coverage, mutually exclusive direct-QBO/direct-Xero or
  evidence-always artifact delivery, bounded Bank Match, append-only
  corrections, and a PII-minimized Phase 21 expense handoff. Groomed
  2026-07-26 through ratified D1–D20 and specified 2026-07-27. Planning only;
  epic #1040 and children #1041–#1105 are published, dependency-governed, and
  not implemented. See the
  [`decision log`](./phase-20-accounting-exports-reconciliation-decision-log.md),
  [`OpenSpec change`](../../../openspec/changes/add-accounting-exports-reconciliation/proposal.md),
  and
  [`cross-phase congruency audit`](./phase-20-cross-phase-congruency-audit.md).
- [`phase-21-field-accounts.md`](./phase-21-field-accounts.md)
  — the implementation-ready Phase 21 specification, published as
  [#1108](https://github.com/Asymmetric-al/core/issues/1108). Its
  [`decision log`](./phase-21-field-accounts-decision-log.md) preserves the
  `/grill-with-docs` authority. D1-D28 were ratified through
  2026-08-02:
  tenant-scheduled, finance-closed support cycles with independently
  authoritative Field Account, accounting, payroll/AP, reimbursement
  obligation, External Payment Occurrence, and dashboard truth; plus
  rail-qualified positive-support admission, mandatory adverse corrections,
  atomic paired movements, tenant-owned organizational-use decisions, and a quiet
  privacy-filtered missionary Support Activity projection whose plain-language
  gift status is disclosed only when useful or requested. Phase 14 owns its
  bounded supporter roster and Phase 28 owns contact and relationship workflow;
  Phase 21 creates neither a donor CRM nor an availability claim. D3 adds an
  explicit zero-assessment default, bounded prospective Administrative
  Assessment Profiles with exactly one deterministic winner, monthly
  period-correct minimum/cap/flat/service effects, component-correct
  append-only correction, preview-first activation, and bounded transparent
  tenant presentation. D4 adds tenant-owned, contract-referenced compensation
  funding through a source-pinned Engagement Authority Reference, three bounded
  prospective plan methods, exact Compensation Funding Periods, an immutable
  finance decision, and non-reusable coverage that reserves without debiting
  or paying. It requires one artifact-always handoff, permits exactly one
  executable artifact-fulfillment, capability-certified provider-draft, or
  Phase 20 source-handoff lane, and keeps
  finalized compensation results, Field Account effects, external payment,
  and single-owner QBO/Xero accounting independent. Underfunding becomes an
  exception rather than an automatic wage reduction, negative balance, debt,
  or backpay; Asym does not classify workers, calculate or submit payroll, move
  compensation money, or call an export, posted pay run, accounting entry, or
  payslip `Paid`. D5 adds one bounded, organization-authorized,
  purpose-compatible Support Reallocation Case with a staff-only safe default
  and optional nonbinding missionary requests. It requires exact Phase 13
  accepted-source purpose authority, deterministic capacity that never adds
  provisional positive support, conflict-aware approval, atomic
  same-Tenant/Legal-Entity/currency internal pairs, and one conserving exit
  manifest activated only by exact lifecycle authority. External charitable
  succession remains covered until a jurisdiction-appropriate handoff and
  matching authoritative result are proved; payment evidence alone is
  insufficient. Source domains own future-writer succession, late facts append
  recovery, and only a separately certified close-covered occurrence may enter
  Phase 20—never direct QBO/Xero Accounting. See
  [ADR-0094](../../adr/0094-organization-authorized-support-reallocation-and-exit-disposition.md).
  D6 adds one explicit quiet Legal-Entity default plus tenant-authorized,
  prospective, source-family-specific proof-gated parallel currency-scoped
  Field Accounts. Every account and financial effect remains single-currency;
  a converted source requires one immutable Support Currency Allocation
  Manifest over the complete effective Phase 13 hard-tender line set, while
  only eligible non-fee-cover target portions create support allocations.
  Source readiness, Field Account close, Phase 20 accounting, and external
  payment remain independent. When the current D9 Support Workspace Publication
  Profile authorizes missionary balance publication, the missionary sees every
  exact balance in that publication family ISO-labelled and through-dated in one
  quiet Support balances projection, with no converted total or Phase 21 FX
  engine. When balance publication is off, no balance or balance-derived
  placeholder appears while finance truth and closes remain live. See
  [ADR-0095](../../adr/0095-proof-gated-parallel-currency-field-accounts.md).
  D7 fixes a capability-honest launch portfolio: direct draft/input adapters
  for exact provider- and region-pinned Gusto Employee Payroll Draft, ADP
  Workforce Now Pay Data Input, and separately certified Xero Payroll AU and
  NZ; complete QuickBooks Workforce and Xero Payroll UK readback-and-artifact
  adapters where no equivalent per-run write is proved. The Phase 21
  multi-provider launch is incomplete until at least two distinct direct-write
  adapters hold current production authorization and pass a production-shaped
  canary and certification. One
  prospective Compensation Draft Delivery Profile Version pins the exact
  Tenant, Legal Entity, provider organization, product, country, environment,
  participant, currency, pay cycle, component, and operation. Every explicit
  attempt becomes an immutable Provider Draft Operation with concurrency
  protection, exact readback where available, drift evidence, and per-unit
  `confirmed_updated`, `proven_not_updated`, or `outcome_unknown` recovery.
  Only proved non-updates may enter a residual successor; unknown work is
  quarantined, never blindly retried or switched to a second lane. Tenant
  external HR/legal and configured provider authority retains classification
  and entitlement; payroll/AP providers retain calculation, approval,
  submission, posting, completion, and payment authority. Phase 20 remains the
  only accounting doorway. See
  [ADR-0096](../../adr/0096-capability-honest-multi-provider-compensation-handoffs.md).
  D8 fixes one disposable, rebuildable, recipient- and purpose-scoped
  Missionary Support Feed Projection composed exactly once from the existing
  Phase 21 activity and per-currency balance projections. Phase 31 alone owns
  prospective subscriptions, authorization, provider mappings, no-gap
  snapshot/page/change delivery, cursor reset, backpressure, and connection
  health. Completeness is bounded by one immutable Coverage Manifest and
  atomic snapshot-through cut; delivery is at-least-once, cursor possession is
  never authority, private gifts receive no stable hidden Party identity, and
  privacy applies before enumeration or arithmetic. TntConnect is available
  only through an exact vendor-authorized, production-certified DonorHub
  pathway; MPDX is installed-base-only. Stop sharing denies future egress but
  never falsely promises deletion of provider, local, exported, or backed-up
  copies. Phase 28 may later add separately ratified
  relationship/contactability resources but owns no supporter, contribution,
  commitment, or Field Account truth. See
  [ADR-0097](../../adr/0097-source-authoritative-missionary-support-feed.md).
  D9 defaults support planning to not managed in Asym and lets an authorized
  tenant prospectively activate one immutable Approved Support Plan Version
  plus one bounded Support Workspace Publication Profile Version. The profile
  selects only independently authorized, source-backed modules; it is not a
  dashboard builder or financial authority. Plans, Phase 28 goals, Phase 16
  commitments, D1 Finance-confirmed balances, D4 compensation funding, and
  activity remain distinct. Balance Coverage uses a conservative same-currency
  Planning Coverage Base that subtracts qualified negative open-cycle effects
  and active non-reusable coverage exactly once and never adds provisional
  positive support. Missing, hidden, stale, unauthorized, or incompatible facts
  produce no derived value—not zero or infinity. A Phase 28 goal may be created
  from a Plan only by explicit copy with provenance; neither source
  live-synchronizes, and D9 does not expand D8 or Phase 31. See
  [ADR-0098](../../adr/0098-optional-approved-support-plans-and-bounded-workspace-publication.md).
  D10 makes the immutable Expense Claim Version the smallest claimant-authored
  expense fact inside one adaptive report-first experience. Clean claims may
  advance while selected claims use exact needs-information, rejection,
  exclusion, successor, supplement, or append-only correction paths. Private
  Receipt Evidence uses explicit many-to-many coverage and cannot use the
  public `document-uploads` bucket. D10 also pulls forward one shared
  tenant-owned AI execution foundation with write-only Credential Revisions,
  prospective purpose-specific capability-certified Binding Versions,
  classification-gated minimum-data egress, immutable invocation evidence,
  suggestion-only OCR/matching, explicit human confirmation, and complete
  manual continuity. Report, policy, obligation, Field Account funding,
  external payment, Phase 20 accounting, and QBO/Xero truth remain independent.
  See
  [ADR-0099](../../adr/0099-claim-level-expense-truth-and-purpose-routed-tenant-ai.md).
  D11 makes Field Account integrity a layered product-owned guarantee: exact
  Tenant × Legal Entity × ISO-currency occurrences balance atomically against
  independently persisted bounded control-side entries, conserve unique source
  coverage, and use checked minor-unit arithmetic, semantic idempotency, and
  account-version fences. Every close publishes one fresh immutable Support
  Cycle Integrity Manifest over its exact business-date and captured monotonic
  Phase 21 ingestion boundaries. Workload-shaped verification opens one typed
  cause-owned Field Account Integrity Case at the smallest proved containment
  scope and clears it only after an authorized repair plus fresh proof.
  Mission Control owns follow-up only. A clean cycle needs one staff review and
  one close action; tenants may configure cadence, closers, routing, reminders,
  optional proportional review, and stricter advisories but cannot waive the
  invariants or use force, tolerance, plug, suspense, direct edit, or generic
  mark-fixed repair. Phase 20 and QBO/Xero remain independently authoritative
  for accounting delivery and final reconciliation. See
  [ADR-0100](../../adr/0100-layered-field-account-integrity-and-cause-owned-repair.md).
  D12 keeps D11's Support Cycle Integrity Manifest as the sole statement-facts
  authority. One post-close source occurrence and deterministic Phase 21
  Approved Data View supply the exact immutable Phase 18 Facts Package for
  `field_account.support_statement@1`; no second facts store or statement run
  exists. The existing D9 profile prospectively controls automatic missionary
  publication, with compatible balance-profile defaults, no hidden-balance
  existence signal, no per-cycle finance work, and optional ready notices Off
  by default. Missionaries receive one quiet HTML-first statement history and
  one currently authorized PDF action per exact Field Account, Support Cycle,
  and ISO currency. Rendering, access, communication, Phase 20 accounting,
  payroll, reimbursement payment, and provider outcomes remain separate from
  close truth; financial corrections append through later cycles and
  same-facts document repairs create immutable artifact successors. See
  [ADR-0101](../../adr/0101-immutable-support-cycle-statements-with-automatic-tenant-publication.md).
  D13 enables expense operations only through one quiet, immutable prospective
  Expense Program Activation Version. Bounded Expense Governance Profile
  Versions resolve exactly one non-stacking incurred-date winner per exact
  Expense Claim Version item or split; finite Expense Approval Route Versions
  resolve at submission into immutable Approval Assignment Snapshots while
  every decision rechecks current authority and conflicts. The ordinary path
  remains one independent human reviewer, with conditional project, finance,
  specialist, or named independent small-tenant review only where required.
  Clean-only consequence-previewed bulk approval records one Expense Review
  Action per covered decision; self-, AI-, timeout-, and automatic approval are
  forbidden. Typed Reviewer Exceptions preserve the violated clauses, reason,
  authority, and independent review without mutating policy. Phase 20 receives
  only PII-minimized frozen approved-snapshot lineage—never Profiles, Routes,
  Assignments, Receipt Evidence, reviewer identity, or internal review
  workflow. See
  [ADR-0102](../../adr/0102-bounded-prospective-expense-governance-profiles.md).
  D14 adds one optional tenant-off-by-default, file-first organization-card
  transaction-evidence product over the complete manual Expense Claim path.
  One source- and profile-scoped staged CSV produces immutable, atomic manifests
  with exact repeat handling, overlap-to-review, effective-dated assignments,
  same-currency business/nonbusiness/unresolved coverage, append-only source
  adjustments, private Phase 29-backed files, and quiet claimant and
  exception-first finance UX. Imported evidence never becomes a Claim,
  approval, Field Account effect, payment, Accounting Release, issuer
  settlement, card-liability payment, or reconciliation; only the existing
  approved-snapshot handoff may enter Phase 20. See
  [ADR-0103](../../adr/0103-file-first-organization-card-transaction-evidence.md).
  D15 adds one immutable, content-addressed, PII-minimized Reimbursement
  Handoff Package with non-executing access, one explicit coverage-scoped
  Execution Claim at release, and a complete quiet **Handle outside Asym**
  default. Connected payroll/AP choices appear only for exact certified
  pre-execution draft/input operations that cannot approve, calculate, submit,
  schedule, fund, or send money. D7's operation kernel may be reused without
  reusing compensation truth. Unknown outcomes stay quarantined; only proved
  non-handoff residual may enter a successor. Handoff, provider readback,
  External Payment Occurrence evidence strength, Phase 20 posting ownership,
  QBO/Xero Accounting, and final reconciliation remain independent. Staff
  evidence says **Payment recorded by finance** and is never silently upgraded.
  See
  [ADR-0104](../../adr/0104-artifact-always-reimbursement-handoff.md).
  D16 adds independently activatable, prospective Expense Advance and Claimant
  Repayment policies over exact purpose-separated occurrences. Authorization,
  issuance, Advance Application Readiness, atomic Expense Advance Application,
  Reimbursement Obligation, Repayment Subject Determination, operational
  Claimant Repayment Requirement, externally handled Claimant Repayment
  Occurrence, and evidence strength remain distinct. A reviewed advance funding
  component may create exact `expense_advance` Field Account Funding Coverage,
  but only a separately qualified Field Account Effect fulfills it; an
  application alone does not. Cross-currency applications require exact
  externally owned source and settlement evidence, while Phase 20 admits only
  separately certified economic occurrences. Policies, observations, tasks,
  disputes, reservations, and Requirements remain accounting-dark unless an
  accountant-certified contract separately recognizes a receivable. See
  [ADR-0105](../../adr/0105-purpose-separated-advances-and-claimant-repayments.md).
  D17 adds one finance-authorized, per-Field-Account and per-currency
  reconciled immutable Opening Position over a complete Tenant × Legal Entity ×
  ISO-currency cohort. One precedence-explicit Opening Source Package and
  exhaustive Opening Coverage Manifest partition every pre-cutover fact exactly
  once into certified exact history, opening residual, structurally inert
  reference history, proved non-balance-bearing exclusion, or unresolved
  coverage; unresolved coverage blocks activation. Private, chunked, resumable
  staging leads to one short CAS-guarded Asym-side Operational Cutover after
  final reproof. It pins the first-close cursor, preserves independently live
  obligations/reservations and other capacity effects, never replays downstream
  effects, and recovers late facts append-only. Phase 30 owns transport, Phase
  21 owns opening authority, Phase 20 alone owns separately proved accounting
  gaps, and D9 still governs whether missionaries may see the resulting calm,
  exact, through-dated balance. Every Phase 21 decision other than D17 follows
  its own dependency path; D17 activation remains feature-gated until certified
  Phase 29 private-byte/access and Phase 30 import-session transport/staging
  seams exist or are pulled forward under their owning phases. See
  [ADR-0106](../../adr/0106-reconciled-field-account-opening-position-and-operational-cutover.md).
  D18 adds one optional, policy-pinned Travel Allowance Calculation inside the
  single winning D13 Expense Governance Profile, with an Actual-expenses-only
  default, bounded certified or tenant-owned schedules, exact source and
  calculation evidence, serialized cumulative bands, duplicate-coverage
  protection, prospective previewed activation, optional privacy-minimized
  route assistance, permanent actual/external fallback, and no second travel
  policy engine, live approval-time lookup, implicit FX, tax/legal inference,
  or payment/accounting authority. See
  [ADR-0107](../../adr/0107-certified-policy-pinned-travel-allowance-calculations.md).
  D19 makes one organization-controlled, Tenant- and Legal-Entity-scoped
  Support Assignment the canonical Field Account subject, with exactly one
  Field Account per Support Assignment and ISO currency and zero-to-many
  prospective Support Assignment Participant Memberships. Participation,
  request-time Phase
  12 Support Workspace authorization, source-owned operational responsibility,
  and recipient-scoped notification preference remain four independent truths.
  D10/D13 own expense claimant, submitter, reviewer, and approval-route facts;
  D4 plus the external Engagement Authority own compensation and payee facts;
  Phase 28 owns support-raising coaching and task assignment; and Phase 12 owns
  capabilities. One quiet **People & access**
  surface may orchestrate explicitly selected commands with tenant-safe presets
  and a literal consequence review, but every person keeps separate Party,
  principal, invitation, access, claimant, responsibility, and preference
  identity. D19 supports couples, teams, participant-free projects, several
  assignments per person, scoped leadership, deny-first revocation, and life-
  event succession without shared credentials, person/household ownership,
  implicit relationship access, a Phase 21 ACL, assignment-aware RLS, raw
  financial Realtime, destructive merge, or participation-driven money
  movement. See
  [ADR-0108](../../adr/0108-organization-controlled-support-assignments-and-separated-access.md).
  D20 adds one absent-unless-enabled, source-authoritative residual
  Organization Support Cost Application lane. Canonical semantic ownership
  prevents D3 assessments, D4 compensation costs, D10/D13 expenses, and Phase
  20 D19 processor-cost effects from falling through or being applied twice.
  Exact source-final occurrences use one economic root, prospective source
  admission and bearing policy, an organization-absorbed default, per-currency
  conserving manifest, nonnegative capacity, optional bounded carryforward,
  append-only correction, and D1/D11 close recognition. Every candidate handoff
  remains Phase 20 accounting-dark until a separate source contract is
  certified; disabled, zero-work, unauthorized, and unaffected scopes remain
  structurally absent. See
  [ADR-0109](../../adr/0109-source-authoritative-organization-support-cost-applications.md).
  D21 adds one immutable, source-mode-honest Noncash Support Realization bridge.
  Phase 13 retains the original noncash Contribution, donor, purpose, gift-date,
  valuation, receipt, supporter, and fundraising truth; Phase 15 retains exact
  asset-lot, disposition, proceeds, finality, evidence, and correction truth.
  Original noncash value can never become monetary support. Only an exact
  source-final Realized Support Basis with non-overlapping quantity and
  per-currency minor-unit coverage may enter D2/D11 close. Exact net proceeds are
  the no-setup default; prospective organization-absorbed exact costs require
  full proof. D3 assesses only the realized basis, D6 owns external conversion,
  D17 owns pre-cutover coverage, D19 owns access, and Phase 20 alone may later
  certify one nonduplicate accounting source. Staff see a conditional,
  exception-first lifecycle and missionaries at most one quiet grouped story—
  never a second gift, valuation-as-cash, availability, payment, or accounting
  claim. See
  [ADR-0110](../../adr/0110-source-mode-honest-noncash-support-realization.md).
  D22 adds one independently optional, Tenant- and Legal-Entity-off-by-default
  Prospective Expense Authorization inside the existing D13 Expense Program.
  Tenants may make the short four-question `Plan an expense` flow available
  when helpful or require it only for exact selected scopes. Immutable request,
  governance, assignment, human review, decision, later-claim coverage, and
  residual facts remain separate; `Approve with changes` can narrow only. The
  guided consequence is approval-only, while a separately certified advanced
  scope may atomically reserve exact same-purpose, same-currency D1 capacity.
  Expiry never releases capacity by itself, actual D10 claims remain capturable
  when authorization is missing, and Phase 20 rejects every prospective object.
  Disabled tenants receive no navigation, queue, report, notification, setup,
  or API noise. See
  [ADR-0111](../../adr/0111-optional-exact-prospective-expense-authorization.md).
  D23 adds one immutable prospective, certified-source-family-specific Expense
  Field Account Effect Recognition Profile. The obligation-qualified claimant
  reimbursement path is the guided default; an exact-payment-qualified path is
  a bounded prospective alternative, while source-final organization card,
  direct organization payment, and separately certified organization payable
  sources retain their exact owners. Claimant-paid sources bind the D16
  settlement partition; organization-paid sources bind the exact D10/D13
  Approved Expense Snapshot economic-payer slice directly. One common Effect
  Basis, non-overlapping per-currency Effect Coverage, and append-only Funding
  Coverage Disposition conserve each slice so a reservation and debit never
  both consume capacity. D4, D16, D20, and D21 remain exclusive effect owners;
  D1/D11 owns close; and Phase 20/QBO/Xero accounting remains independent and
  cannot qualify or rewrite D23. Clean work needs no staff action, while the UI
  separates approval, support-balance inclusion, reimbursement/payment, and
  accounting and makes no availability, payment, or GAAP claim. See
  [ADR-0112](../../adr/0112-source-family-expense-field-account-effect-recognition.md).
  D24 adds one tenant-controlled, exact-claim-bounded Expense Collaboration
  Assignment Version for a verified helper using their own login. It is absent
  unless enabled, defaults to prepare-only, and may expose only exact assigned
  claim/item/split/evidence scope through current Phase 12 authorization and a
  purpose-specific Evidence Access Projection Version. A separately enabled
  mechanical submit action requires an unchanged complete Claim Version plus
  immutable authenticated Claimant Confirmation or an admitted claimant-
  authored external attestation. Invitation is authority-free until accepted;
  revocation is immediate for future access but cannot pretend to recall bytes
  already delivered. Assignment, relationship, invitation, OCR, match, or AI
  never implies authorization, approval, payment, Field Account effect, or
  accounting truth. See
  [ADR-0113](../../adr/0113-own-identity-claim-bounded-expense-collaboration.md).
  D25 adds one exceptional-only immutable Expense Claim Resolution Case over
  exact cause and item/split/purpose/ISO-currency coverage. Seven code-owned
  causes produce one literal source-owned next action; same-cause repeats
  converge, clean separable siblings continue, and a complete Downstream
  Impact Manifest makes later consequences inspectable. Claimants see one
  quiet contextual update and finance reuses **Expenses → Needs attention**;
  no case-management module or workflow builder is created. Completion derives
  only from root-source proof plus an explicit disposition for every affected
  owner family. Phase 12 remains the sole PDP, each financial/source domain
  appends its own correction, and case or task **Complete** never proves
  approval, obligation, payment, Field Account inclusion, statement correction,
  accounting delivery, posting, or reconciliation. See
  [ADR-0114](../../adr/0114-cause-owned-expense-claim-resolution.md).
  D26 adds one owner-qualified Phase 21 records-policy catalog and exact
  tenant-custody export contract. Immutable schedule contracts, bounded
  prospective bindings, per-record resolutions, and successor-impact coverage
  preserve purpose and trigger truth; one source-watermarked, open-format,
  manifest-complete Records Export Package is sealed per Legal Entity, with a
  tenant-wide request fanning out under one index. Download, print, external-
  copy assertion, verified destination transfer, retention, hold, termination,
  and copy-specific disposition stay independently authoritative. Phase 21
  owns schedule and package meaning; Phase 29 owns the physical lifecycle of
  Phase-21-owned evidence and D26 package bytes; Phase 18 retains its generated-
  document artifact bytes and lifecycle; Phases 3/10/12 own egress; Phase 30
  remains inbound-only; and Phase 31 owns any later certified destination
  adapter. The tenant controls copies in its custody while Asym
  retains its actual duties for copies in Asym custody. See
  [ADR-0115](../../adr/0115-purpose-owned-phase21-records-schedules-and-exact-custody-exports.md).
  D27 adds one quiet, evidence-gated Core Field Accounts Production Activation
  Contract composed through D17's sole Operational Cutover. One immutable
  Release Generation, one prospective Adoption Plan Version, and one content-
  addressed Go-Live Readiness Manifest bind the exact complete financial
  cohort, authority boundary, environment, and code/schema generation while
  referencing every applicable D1-D26 and owning-phase proof. Synthetic,
  sandbox, and D17 production-shaped opening-shadow evidence stay explicitly
  distinct. D27 invokes that existing D17 shadow rather than owning a second
  financial calculation or reconciliation; it remains non-authoritative and
  side-effect-dark.
  Final reproof occurs inside D17's idempotent CAS cutover after one quiet
  consequence review and literal start action. Optional capabilities remain
  independently proof-gated, a named missionary pilot narrows publication only,
  and live drift uses a disposable readiness projection, cause-owned exceptions,
  smallest-scope containment, and append-only recovery rather than a second
  activation state or destructive rollback. See
  [ADR-0116](../../adr/0116-evidence-gated-core-field-accounts-production-activation.md).
  The
  [`research evidence`](./phase-21-mission-dashboard-product-research-evidence.md)
  records mission-agency dashboard, compensation, expense-product, receipt,
  tenant-owned AI, assessment, policy-UX, Field Account integrity, cursor-fenced
  close proof, exception-first repair, immutable Support-statement publication,
  organization-card CSV/file security, exact overlap/idempotency,
  claimant/finance UX, reimbursement handoff and payment-evidence boundaries,
  purpose-separated advance and repayment controls, finance-control UX, and
  exact Gusto, ADP, QuickBooks Workforce, and regional Xero Payroll capability
  patterns; plus reconciled opening positions, exact/reference-history
  partitioning, source-family operational cutover, first-close continuity, and
  no-side-effect migration; and official/tenant travel-rate authority,
  cumulative mileage, per-diem, source certification, optional GPS/manual
  continuity, and exact calculation-explanation patterns; plus canonical Field
  Account subject identity, spouse/team/project collaboration, independently
  authoritative participation/access/responsibility/notification truth,
  Supabase/PostgreSQL forced-coarse-RLS and sole-PDP boundaries, invitation and
  revocation recovery, assignment-scoped navigation, and accessible
  progressive **People & access** UX; plus source-final residual support-cost
  ownership, provider drift, per-currency conservation, carryforward,
  accounting-dark candidate handoff, and absent-unless-relevant D20 UX; plus
  noncash legal-recipient/source-mode classification, exact lot/proceeds
  coverage, partial and terminal dispositions, realized-basis cost treatment,
  and one grouped D21 lifecycle; plus optional pre-spend request patterns,
  current-authority human review, exact partial/multi-claim authorization
  coverage, capacity-reservation conservation, privacy-minimized notifications,
  mobile/offline draft continuity, and absent-unless-enabled D22 UX; plus
  obligation-, payment-, organization-card-, direct-payment-, and payable-
  qualified D23 source families, exact effect/funding coverage conservation,
  append-only qualification and correction, no-gap adoption, accounting-dark
  Phase 20 boundaries, serializable concurrency, and quiet independently
  labelled missionary/finance truth; plus own-identity, exact-claim-bounded
  helper collaboration, claimant-confirmed optional mechanical submission,
  purpose-scoped evidence access, current-authority revocation, immutable actor
  provenance, and strict Phase 12/20/29 authority separation for D24; plus
  exceptional-only exact D25 cause contracts, actor-attributed resolution
  occurrences, proportional downstream-impact coverage, source-owned
  correction, derived completion, quiet claimant/finance recovery UX, and
  strict Phase 6/12/17/20/29/34 authority separation; plus purpose-owned D26
  record families, qualified schedule/binding/resolution history, exact open-
  format package conservation, restricted and owner-reference dispositions,
  independent custody/disposal truths, offboarding snapshot-plus-delta,
  responsibility boundaries, and Phase 3/10/12/29/30/31/38 separation; plus
  D27 evidence-class separation, complete-cohort production-shadow proof,
  content-addressed readiness evidence, generation-pinned final reproof, quiet
  activation UX, independently gated optional capabilities, and cause-owned
  smallest-scope live containment; plus D28 source-defined opening cumulative
  state, stable capacity-pool identity, independently proved prospective
  completeness, group-atomic first use, append-only affected-suffix correction,
  and fully usable external-calculation continuity.
  Grilling is product-complete at D1-D28 and `/to-spec` is complete. The PRD and
  [`add-field-account-operations`](../../../openspec/changes/add-field-account-operations/proposal.md)
  OpenSpec change are implementation-ready planning. The approved execution
  graph is epic [#1109](https://github.com/Asymmetric-al/core/issues/1109), lane
  epics [#1110](https://github.com/Asymmetric-al/core/issues/1110) through
  [#1120](https://github.com/Asymmetric-al/core/issues/1120), and P21-01 through
  P21-101. Those tickets are published and dependency-governed; no Phase 21
  runtime or production authorization is claimed.
  Reproducible contract checks are
  `bunx @fission-ai/openspec@1.7.0 validate add-field-account-operations --strict`,
  `bunx @fission-ai/openspec@1.7.0 validate --all --strict`,
  `bun run format:check`, and `bun run skills:verify`. Publication and
  traceability are proved from the live native sub-issue/blocking graph under
  #1109, not from prose status. PR
  [#1235 Files changed](https://github.com/Asymmetric-al/core/pull/1235/files) is
  the exact changed-path inventory. Its
  [required checks](https://github.com/Asymmetric-al/core/pull/1235/checks) and
  persistent Shadscan report are the final machine-check evidence once CI is
  green. The assessed pre-commit `packages/ui` baseline is 29/100 against the
  enforced floor of 29, using
  `bunx @shadscan/cli@0.1.1 ./packages/ui --json --no-interactive`; because no UI
  path is changed by this planning publication, final CI must prove the same
  floor without remediation. The blast radius is planning-only: the Phase 21
  PRD, decision evidence, ADRs, OpenSpec change, and named cross-phase contract
  amendments; it grants no runtime authority.
- [`phase-22-public-ministry-pages.md`](./phase-22-public-ministry-pages.md)
  — the canonical implementation-ready Phase 22 PRD. Its active OpenSpec
  contract is
  [`add-public-ministry-pages`](../../../openspec/changes/add-public-ministry-pages/proposal.md).
  These artifacts specify the approved behavior but do not claim that Phase 22
  is implemented, deployed, or live. Parent specification issue
  [#1281](https://github.com/Asymmetric-al/core/issues/1281) has 41 approved
  native child issues, [#1282](https://github.com/Asymmetric-al/core/issues/1282)
  through [#1322](https://github.com/Asymmetric-al/core/issues/1322), connected
  by 116 native blocking relationships. Only P22-01/#1282 is the current
  `ready-for-agent` frontier; issue posture is planning metadata, not build or
  production proof.
- [`phase-22-public-ministry-pages-decision-log.md`](./phase-22-public-ministry-pages-decision-log.md)
  — the scope-frozen supporting Phase 22 grooming authority. The founder closed the
  `/grill-with-docs` session at D1–D27 on 2026-08-14:
  two typed page families with explicit contributors; Phase-10-ceiling-resolved
  reach; family-certified presentation; tenant-chosen review or
  publish-after-checks; simple staff judgment; optional source-authoritative
  progress; one exact Designation per page for the MVP; source-qualified route
  dispositions; and release-bound, Phase-29-compatible Public Ministry Media
  Assets. D9 makes public media private-origin and opaque, discards source
  filenames from durable/public surfaces, requires bounded full decode,
  reconstruction, re-encode, independent output proof, contextual placement
  semantics, immutable derivative and release pins, current D2/Phase 10 reproof,
  and honest smallest-scope withdrawal. D10 closes Phase 5's old shareable-
  preview-token reservation: Public Ministry Preview is authenticated,
  currently page-authorized, exact-version, production-equivalent, private,
  non-cacheable/non-indexable, and side-effect-dark. A copied URL or Draft Mode
  cookie grants nothing; a named recipient uses one existing Phase 12
  page-scoped `Preview only` grant, never a bearer or guest-preview system.
  D11 establishes one canonical immutable Ministry Update Revision and exact
  Audience Release Manifest with independently authoritative Public Page and
  purpose-authorized Supporter projections. **My Feed** survives only as a
  legacy alias. Publication, current supporter access, notification intent,
  recipient/consent/suppression/cadence, provider delivery, engagement, and
  Giving remain separate facts; `Publish & notify supporters` is one quiet UX
  consequence review, not one collapsed authority or hidden email side effect.
  D12 adds one prospective immutable tenant Supporter Response Profile Version:
  **Responses off**, **Like + I prayed**, or **Like + I prayed + comments**,
  initially off with acknowledgement-only recommended. Every response remains
  inside one exact authenticated purpose-authorized Supporter Release
  Projection-bound Engagement Space; current authority and safety are re-proved
  on every operation, comments and moderation preserve append-only evidence,
  public releases expose no protected response facts, and counts remain
  rebuildable audience-local projections rather than Update truth.
  D13 adds one exact-scope Public Ministry Discovery Profile with **Together**
  by quiet default or tenant-selected **Separate by Page Family** presentation
  over one complete D2/Phase-10-admitted Directory Projection, bounded server
  query, and family-typed card contract. Separate Missionary and Project routes
  never create separate membership, visibility, index, search, cache, or
  inclusion authority; search exposes only admitted public fields and uses
  locale-pinned deterministic ordering, bounded filters, generation-bound
  keyset cursors/caches, complete shadow rebuilds, atomic activation, and
  affected-positive-first removal.
  D14 adds one immutable release-bound Public Search & Sharing Presentation
  Manifest with distinct Search and Share results, stable opaque Site/locale
  Ministry Update permalinks, code-owned coherent canonical/alternate/sitemap/
  JSON-LD/social-card output, exact D9-certified card media, generated safe
  defaults with bounded editorial input, native Share plus Copy-link fallbacks,
  and honest separation of local search readiness from external crawl, index,
  rank, cache, share, refresh, removal, and forgetting outcomes. Listed-public
  is search eligible and shareable; Shared-by-link is shareable but `noindex`;
  stricter truth emits no content-specific anonymous presentation.
  D15 adds one prospective Site-scoped Public Ministry Measurement Profile,
  persisted Off by default, with guided **Staff only** or **Staff + assigned
  page contributors** visibility. It measures only four fixed first-party,
  release-bound interactions through non-blocking post-render or explicit-action
  intake; retains no durable visitor, session, request, replay, or financial
  identity; expires private occurrences within 24 hours; keeps sealed daily
  aggregates for one code-owned 24-month period with append-only corrections;
  re-proves current Phase 12/D1 authority at every report read/export; and
  exposes one suppression-safe, through-dated **Public page activity** report.
  D15 never claims people, reach, completed shares, conversions, gifts,
  attribution, settlement, or payment and cannot affect public or Giving
  behavior.
  D16 adds one tenant-off-by-default, source-bounded, suggestion-only Public
  Page Writing Assistant through Phase 21 D10's existing purpose-routed AI
  control plane. It works on one exact contributor-editable semantic draft
  target, shows its sources, preserves the original, requires accessible review
  and explicit CAS-guarded Use, and never submits, approves, releases, publishes,
  or acquires Page, safety, locale, Giving, progress, or Ministry Update truth.
  Its **Translate to English** action requires one certified source-language →
  exact existing Phase 24 English BCP 47 locale pair, confirmation of ambiguous
  detection, honest mixed-language handling, an original/English comparison,
  and the always-visible **Check this translation** warning. Translation never
  combines with rewriting or localization and never means fluent, verified,
  bilingual-reviewed, official, or certified.
  D17 makes every Project/Campaign Page subject one exact immutable-versioned
  reference to an owner-certified CRM Ministry Project, Phase 13 Giving
  Campaign, or separately public-subject-eligible Phase 13 Designation. The CRM
  operational layer owns the minimal Ministry Project identity/lifecycle;
  Phase 13 owns Campaign and Designation truth; Phase 22 owns only the Page
  Subject Binding and release-pinned safe snapshot. Subject, Giving, progress,
  contributors, reach/release, Page lifecycle, media, Updates, discovery, and
  search/share remain separate. A different subject after first release means
  a new Page identity and D8 succession, never an in-place history rewrite.
  D18 adds one release-bound Public Ministry Runtime Composition Contract.
  Phase 5 executes the runtime and cache mechanics; Phase 22 owns Public
  Ministry semantics, current-serving admission, and adverse-first controlled-
  surface convergence. No Asym-controlled response may bypass the current-
  serving evaluation, and no cache, CMS publish state, provider result, or
  deployment becomes a second public authority.
  D19 makes one organization-owned, Tenant- and Legal-Entity-scoped Ministry
  Assignment the Missionary Ministry Page's exact operational subject. Spouses,
  teammates, leaders, and contributors retain separate Party, login,
  participant-membership, display, contributor, Support Assignment, Phase 12
  Support Workspace authorization, responsibility, and notification identities.
  One optional prospective Phase-21-owned Support Binding may connect the
  Ministry Assignment to an independently authoritative Support Assignment,
  but membership, marriage, display, editing, notification, Designation, or the
  binding itself grants no financial access or mutation. The quiet **People &
  access** experience previews the exact D9-permitted support modules, fields,
  currencies, and history before applying explicit local facts; every raw table
  remains browser-inaccessible and all support reads pass through Phase 12's
  current server-side policy decision point.
  D20 concretizes D3 as two non-interchangeable immutable code-owned Page Family
  Semantic Catalog Generations: one Missionary Ministry catalog and one
  Project/Campaign catalog. A prospective D3 profile may offer an optional
  editorial role as **Off**, **Available**, or **Expected**, set its bounded
  certified-zone order, and make it staff-only or contributor-editable;
  Expected is private completeness guidance, never public filler. Contributors
  use one quiet **Basics**, **Story**, **Media**, **Support & giving**, and
  **Updates** editor while managed identity, progress, Giving, media, and Update
  facts remain source-labelled and independently authoritative. Every D2 release
  pins the exact family catalog, renderer, profile, content, locale, brand, and
  managed-reference generations. Unknown, wrong-family, unauthorized, stale,
  or over-budget input blocks only the new candidate and preserves the last
  certified release. D20 does not create a generic cross-family builder, tenant
  schema, arbitrary layout/nesting, free CTA URL, custom code, or second
  permission, workflow, release, or source-truth system.
  D21 replaces the current mock, static, generic, and copied Public Ministry
  surface through one complete-surface authority adoption for each exact Tenant
  × Legal Entity × environment × Site × verified-host set × locale. Pages may
  be prepared privately in additive, chunked, resumable batches, but public
  authority changes once through one content-addressed complete Adoption
  Coverage Manifest and one short current-reproved, idempotent CAS cutover.
  Every discovered legacy item receives exactly one proved disposition; a
  narrowly certified compatible-legacy D2 release may preserve safe editorial
  presentation only and never raw Payload publication or managed identity,
  Giving, progress, media, Update, route, discovery, or measurement truth. Staff
  use one exception-first **Prepare public pages** flow and one literal **Start
  using these prepared pages** action; missionaries continue ordinary Public
  Pages work; donors see one coherent surface. After cutover the Phase 5/D18
  gateway is the only reader and never falls back to mock data, the legacy
  reader, an old cache namespace, or destructive rollback.
  D22 adds one quiet, disposable, permission-filtered Public Page Operations
  Projection with exactly **To review**, **Needs attention**, and **All pages**.
  It derives versioned root causes and exact impacts from source-owned D1–D21
  truth, groups one cause across affected Pages, and routes finite literal
  actions back to the owning workflow for current reproof. The views are
  navigation, not Page states; only owner proof removes current work. D22 adds
  no Page-health score, mutable close state, second repair workflow, broad
  relationship-derived access, or donor-facing diagnostic surface.
  These decisions create no second review queue and grant no runtime or
  production authorization. See the
  [`research evidence`](./phase-22-public-ministry-pages-research-evidence.md),
  [D9 ADR-0126](../../adr/0126-release-bound-public-ministry-media-assets.md),
  [D10 ADR-0127](../../adr/0127-authenticated-exact-version-public-ministry-preview.md),
  [D11 ADR-0128](../../adr/0128-canonical-ministry-update-audience-release-projections.md),
  and
  [D12 ADR-0129](../../adr/0129-bounded-supporter-response-profiles.md),
  [D13 ADR-0130](../../adr/0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md),
  and
  [D14 ADR-0131](../../adr/0131-release-bound-public-search-and-sharing-presentation.md).
  See also
  [D15 ADR-0132](../../adr/0132-bounded-public-ministry-measurement-and-contributor-visibility.md).
  See also
  [D16 ADR-0133](../../adr/0133-source-bounded-public-page-writing-assistance.md).
  See also
  [D17 ADR-0134](../../adr/0134-exact-typed-public-page-subject-bindings.md).
  See also
  [D18 ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).
  See also
  [D19 ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).
  See also
  [D20 ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).
  See also
  [D21 research evidence §44](./phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover)
  and
  [D21 ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).
  See also
  [D22 research evidence §45](./phase-22-public-ministry-pages-research-evidence.md#45-ratified-d22-research--quiet-derived-public-page-operations)
  and
  [D22 ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).
  D23 Public Pages setup/settings is ratified as the exact C-prime-R: one
  scope-first disposable summary over source-owned versions, with one
  owner-specific amendment at a time. See
  [D23 research evidence §46](./phase-22-public-ministry-pages-research-evidence.md#46-ratified-d23-research--derived-public-page-setup-and-settings)
  and [accepted ADR-0140](../../adr/0140-derived-public-page-setup-and-settings.md).
  D24 adds one attribution-preserving Staff-authored Page Revision path inside
  D1's sole working head and the unchanged D4/D5/D2 review-and-release lane.
  Staff use the ordinary quiet editor under independent exact-scope authority;
  active or submitted contributor work remains immutable and attributed; only
  deliberate supersession requires a safe reason; and current-reproved CAS,
  authoritative readback, and successor-only recovery prevent Payload-native
  override, restore, merge, or last-write-wins behavior. See
  [D24 research evidence §47](./phase-22-public-ministry-pages-research-evidence.md#47-ratified-d24-research--attribution-preserving-staff-authored-page-revisions)
  and
  [accepted ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).
  D25 is ratified as the exact database-minimal hardened C-prime-R. It derives
  each permitted action from
  current D1–D24 owner truth, keeps one coalesced Payload recovery buffer beneath
  the sole Page-and-locale head, protects immutable deliberate sources, and
  creates no D25 table, status, queue, timer, or per-autosave event stream. See
  [D25 research evidence §48](./phase-22-public-ministry-pages-research-evidence.md#48-ratified-d25-research--cause-gated-actionability-with-bounded-recoverable-editorial-work)
  and
  [accepted ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).
  D26 is ratified as the exact hardened A-prime-R. The actual currently
  authorized submitter confirms one exact immutable candidate through the
  existing **Submit for review** or **Publish changes** action; the candidate
  stores one compact immutable Public Content Sharing Attestation and D2 or D11
  pins it without another table or permission workflow. Missing granular Phase
  10 affirmative records alone create no Phase 22 checklist, while direct
  objections, `do_not_publish`, restricted-person rules, and stricter current
  safety outcomes remain non-overridable. See
  [D26 research evidence §49](./phase-22-public-ministry-pages-research-evidence.md#49-ratified-d26-research--one-calm-page-content-sharing-attestation)
  and
  [accepted ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).
  D27 ratifies one Site-scoped Page, exactly one
  Missionary and one Project/Campaign presentation profile per Site, no Page or
  locale layout exceptions, independently released Page × locale editorial
  lineages, complete-cohort compatible family activation fenced against
  concurrent D2 releases, and public exact-locale reads with fallback disabled.
  D27 explicitly amends the current multi-decision presentation composition
  rather than silently reinterpreting D3. See
  [D27 research evidence §50](./phase-22-public-ministry-pages-research-evidence.md#50-ratified-d27-research--one-family-pattern-with-independent-locale-content)
  and
  [ADR-0144](../../adr/0144-site-family-presentation-with-independent-locale-releases.md).
  D27 creates no runtime, schema, migration, issue, or production authority.
  The completed
  [formal closure audit §51](./phase-22-public-ministry-pages-research-evidence.md#51-formal-phase-22-closure-audit--d1d27-are-product-decision-complete)
  found no unresolved Phase-22-owned founder choice, and Option A scope-freezes
  D1–D27 without opening D28. The founder subsequently invoked `/to-spec`; the
  canonical PRD and active OpenSpec change now carry implementation-ready
  planning. The ratified decisions and specification grant no
  migration, reader cutover, publication, production activation, issue
  dispatch, or runtime authority.
- Evidence: `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`
  (the 0A truth-finding output).
- OpenSpec: `openspec/changes/sitestacker-parity/` (the durable record that this
  program exists and is governed as outcome parity).

## Related in-flight work

PR [#872](https://github.com/Asymmetric-al/core/pull/872) merged the Phase
17–20 PRDs, ADRs, and OpenSpec packages into `develop` on 2026-07-27. Their live
issue sets are Phase 17 epic `#873` + `#874–#905`, Phase 18 epic `#907` +
`#908–#961`, Phase 19 epic `#977` + `#978–#1031`, and Phase 20 specification issue
[#1036](https://github.com/Asymmetric-al/core/issues/1036) plus epic
[#1040](https://github.com/Asymmetric-al/core/issues/1040) and children
`#1041–#1105`. Publishing planning issues does not prove implementation; current
labels and dependency relationships still control readiness.

OpenSpec PR #462 refines the platform specs and adds capability specs
(donation-lifecycle, crm-core, contribution-operations, identity-and-access,
workflow-orchestration) plus donor-money-path changes (guest giving, donor
self-service, recurring giving, staff refunds). These overlap several parity
areas and are not yet merged. The parity program **reconciles with #462 rather
than duplicating it** — where #462 already governs an area, the matrix points to
it.
