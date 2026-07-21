# SiteStacker Parity Program

## Why

The repo is beginning a long-term effort to match SiteStacker/WMTek's
operational capability for Christian missions organizations. Without one durable
record that this program exists and how it is governed, parity work risks
fragmenting into disconnected bolt-on modules — the dominant failure mode the
platform boundaries already warn against.

## What Changes

- Add one durable requirement to `platform-product-intent` recording the
  SiteStacker parity program: it means **outcome parity** (match what an org can
  accomplish, built our way — not UI cloning), governed by the existing platform
  boundaries, benchmarked against cited official SiteStacker documentation, and
  tracked in the parity matrix. Per-area behavior is specified in its own change
  when that area is built. Child sponsorship is out of scope.
- The program's operating detail (charter, 25-area matrix, Phase 0 plan) lives
  in `docs/prds/sitestacker-parity/`; the baseline truth lives in
  `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`.
- **Amended 2026-07-07 (Roadmap v2):** add a second durable requirement
  recording that the program's phase architecture (41 phases, 0–40) is
  governed by one roadmap source of truth
  (`docs/prds/sitestacker-parity/roadmap.md`), with `phase-map.md` as its
  compact mirror, "Phase N (Name)" citation discipline, and a mandatory
  renumbering-map + congruence-sweep rule for any future re-sequencing.
  Roadmap v2 renumbered every phase above 9; pre-2026-07-07 documents citing
  higher numbers are decoded via the roadmap's v1→v2 map.
- **Amended 2026-07-10 (Phase 14 (Donor Credit Operations)):** add a third
  durable requirement recording that donor-credit operations (soft credits,
  DAF advisor recognition, tribute notifications, matching-gift expectancies,
  church-member attribution) keep recognition structurally separate from money
  truth — recognition rows never mint receipts, never enter money totals, and
  render only through the governed recognition read models — per
  `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`.
- **Amended 2026-07-13 (Phase 16 (Pledges & Recurring Commitments)):** add a
  durable truth-boundary requirement that keeps open-ended recurring
  commitments, fixed-total pledges, stable line identity, effective line terms,
  schedule epochs, occurrence execution, fulfillment, payment finality, ledger
  posting, and received money as separate facts. Pin exactly one featured
  cadence (monthly whenever enabled), donor-controlled and twice-validated
  schedule boundaries, count-once effective recurring-to-fixed linkage,
  unchanged-grid pause/manage commands, and product-owned bounded recovery.
  Reconcile the merged `donation-lifecycle` contract and the active
  `add-recurring-giving` and `add-donor-self-service` changes so none can still
  authorize the superseded one-Stripe-subscription-to-one-legacy-pledge model or
  provider-owned retry policy. Detailed behavior is governed by the Phase 16
  PRD, dated congruence package, and ADRs.
- **Amended 2026-07-19 (Phase 17 (System Messages & Template Management)):**
  add the `outbound-communications` capability contract and dated full
  amendments to the platform surface and automation boundaries. Establish one
  code-governed system-message catalog, producer-owned truth and protected
  actions, complete immutable structured publications, contract-bounded Delivery
  Plans, proportional publication review, tenant/site/locale whole-message
  resolution, one Asym notification presentation model, mutually exclusive
  tenant-owned and service-only platform Resend connections with composed
  sender/reply identities, recipient-specific
  preparation and recovery, body-free durable history with a bounded tenant
  recent support copy and no readable platform copy in this generation,
  transport-dark SMS evidence, and versioned portability. The
  proposed observable behavior is governed by this active OpenSpec delta; its
  detailed implementation interface is
  `docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md`,
  its executable-manifest specification, and `docs/adr/0025`–`0032`. The dated
  producer/obligation census, decision-to-test traceability matrix, and Phase 17
  congruence package provide derived coverage evidence; the research appendix
  is informative. This remains a
  groomed planning change; it does not dispatch or implement product work.
  Platform email uses a Phase 17 fixed contract/compiler and the Phase 6
  delivery spine through an explicit tenant/platform-exclusive owner arc. V1
  admits only the exact revisioned `eve_platform_owner` authority plus a separate
  service-only Asym connection/profile; it never uses a fake tenant or tenant
  fallback. Customer-account bootstrap/security requires a future distinct
  recipient-authority branch. The current manifest generation contains zero
  Eve email keys, so Eve email remains non-dispatchable until a later generation
  adds producer-ratified meaning-specific keys, exact source fences, the fixed
  platform profile, and complete proof packs; generic catch-all keys are
  prohibited.
- **Amended 2026-07-21 (Phase 18 (Receipt & PDF Template System)):** add a
  durable generated-document authority requirement and rewrite the active
  `add-statement-studio` change as the canonical `document-production`
  capability. Establish one Document Studio and one Generated Document service
  over five separate authorities: immutable publication, source-owned Facts
  Package, idempotent Generation Request, optional source-authorized Issuance,
  and exact private Artifact. Source domains own issuance validity and correction
  effect; Phase 18 owns D9/D11 reference/serial mechanics and artifact linkage
  after admitted freeze. Phase 17 Delivery remains external. Select at most one
  production renderer through a pre-registered no-winner-capable evidence
  contest; produce one current accessible canonical PDF per logical document;
  keep U.S. and opt-in Canadian legal behavior in code-owned packs; use the one
  corrected shared scanner-resistant protected-action protocol; and govern exact
  access, batches, records, disposal, proof-gated publication recovery, and one
  future appointment. Conrad confirmed the environment has no production users
  or irreplaceable artifacts, so a server-proved pre-production cutover removes
  every prototype receipt/statement/PDF runtime and ships no legacy adapter,
  importer, dual path, shadow migration, or fabricated history. Detailed
  behavior is governed by the Phase 18 PRD, dated congruence and traceability
  packages, purpose-authority manifest, research appendix,
  `docs/adr/0033`–`0039`, and the active `add-statement-studio` delta. This is a
  groomed planning change only; it does not dispatch implementation.

## Impact

- Affected specs: `platform-product-intent`, `donation-lifecycle`,
  `outbound-communications`, `document-production`, `platform-surfaces`,
  `platform-boundaries`
- Affected docs: `docs/prds/sitestacker-parity/**` (including `roadmap.md`,
  the source of truth for phase architecture, plus the Phase 17 and Phase 18
  manifests/census/traceability/congruence/research companions),
  `docs/adr/0025`–`0039`, the Phase 0 evidence file, and the active
  `openspec/changes/add-eve-email-discord-notifications/**` and
  `openspec/changes/add-statement-studio/**` planning packages
- Reconciled active changes: `add-recurring-giving`,
  `add-donor-self-service`, `add-eve-email-discord-notifications`,
  `add-statement-studio`
- No product code changes or issue dispatch (this change is specification and
  governance only).
