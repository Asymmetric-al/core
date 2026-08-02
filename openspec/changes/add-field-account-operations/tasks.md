# Tasks

## Live Implementation Graph

The approved tracer-bullet execution graph is
[#1109](https://github.com/Asymmetric-al/core/issues/1109), organized under
lane epics [#1110](https://github.com/Asymmetric-al/core/issues/1110) through
[#1120](https://github.com/Asymmetric-al/core/issues/1120) as P21-01 through
P21-101. These checkboxes describe the complete OpenSpec work contract; tickets
may combine adjacent checkboxes into one independently verifiable vertical
slice. `ready-for-agent` is not an override: agents must honor every live
blocked-by relationship and all requirements in this change. Specification
issue [#1108](https://github.com/Asymmetric-al/core/issues/1108) remains
unchanged and outside the implementation hierarchy.

## 1. Contract And Dependency Foundation

- [ ] 1.1 Add the `field-account-operations` capability contract and preserve
      D1–D28 terminology, authority, and negative boundaries.
- [ ] 1.2 Add the sole `FieldAccountOperationsService` with trusted
      server-resolved context, typed commands, permission-safe queries,
      discriminated outcomes, and explicit dependency ports.
- [ ] 1.3 Define closed command/query catalogs, semantic identities, expected
      versions, error/outcome vocabulary, and exact retry/conflict behavior.
- [ ] 1.4 Define source-owner ports for contributions, offline/noncash facts,
      identity/access, commitments, goals/relationships, accounting, documents,
      private bytes, inbound transport, feed transport, notifications, and
      Mission Control follow-up.
- [ ] 1.5 Define capability-specific provider ports without a universal payroll,
      reimbursement, accounting, or AI payload.
- [ ] 1.6 Add architecture guards proving routes, jobs, batch processors,
      importers, projections, and adapters delegate through the service.
- [ ] 1.7 Add closure guards preventing mutable `current_funding`, donation sums,
      `funds.current_amount`, Available Funds, Withdraw, fabricated analytics,
      or direct-to-worker gift copy from becoming Phase 21 truth.
- [ ] 1.8 Add the first-class authenticated Mission Control and missionary test
      projects required by the PRD.
- [ ] 1.9 Keep D17/D27 production activation structurally unavailable until the
      certified Phase 29 opening-source private-byte and Phase 30 import-session
      seams exist. Gate D28 on those seams only when its private-byte/bulk
      preparation lane is selected; preserve clean-boundary and native exact-
      baseline paths. Prove neither phase can define, reconcile, admit, or
      activate Phase 21 meaning.

## 2. Scope Access And Canonical Persistence

- [ ] 2.1 Add Tenant/Legal-Entity-scoped Support Assignments with immutable
      identities, lifecycle, approved-purpose references, and no person-owned
      financial root.
- [ ] 2.2 Add effective-dated append-only Participant Membership, separate
      workspace access intent, responsibility, claimant/payee/provider mapping,
      and notification preference records.
- [ ] 2.3 Add immutable-currency Field Accounts keyed by exact Tenant, Legal
      Entity, Support Assignment, and ISO currency.
- [ ] 2.4 Add Field Account Occurrences, signed integer-minor-unit entries,
      bounded control entries, correction lineage, semantic idempotency, and
      account-version fences.
- [ ] 2.5 Add exact non-overlapping amount/source coverage, reservation,
      obligation, effect, and disposition primitives.
- [ ] 2.6 Enforce same-scope composite references, currency consistency,
      balanced groups, capacity that never authorizes discretionary overdraft,
      mandatory adverse-correction continuity, checked arithmetic, interval
      exclusion, immutability, and one command-only writer.
- [ ] 2.7 Add deny-by-default forced RLS, public/authenticated revocation, narrow
      security-definer functions, explicit search paths, and service-role scope
      validation.
- [ ] 2.8 Integrate Phase 12 policy decisions, governance epochs, pre-enumeration
      filtering, current commit-time reauthorization, and privacy-safe not-found
      behavior.
- [ ] 2.9 Add disposable finance, missionary, operations, and access projections
      with fully scoped cache keys and rebuild contracts.
- [ ] 2.10 Add real disposable-Postgres tests for every structural, RLS,
      conservation, concurrency, and bypass-role invariant.

## 3. Support Admission Assessment Close And Statements

- [ ] 3.1 Add monthly-default and certified-biweekly Support Cycle definitions
      with exact tenant-timezone half-open boundaries.
- [ ] 3.2 Add source-family Support Allocation Readiness Policy versions,
      source-evidence contracts, candidates, and quiet readiness projections.
- [ ] 3.3 Add exact Phase 13 monetary support admission and D21 realized-support
      admission while excluding valuation, estimates, commitments, and pending
      or ineligible source facts.
- [ ] 3.4 Add atomic redesignation/transfer pairs and append-only positive,
      adverse, late, refund, reversal, and correction handling.
- [ ] 3.5 Add explicit No administrative assessment policy and finite bounded
      Assessment Profile methods with deterministic one-winner resolution.
- [ ] 3.6 Add source and period assessment determinations, entries, coverage,
      rounding, minimum/flat/cap/service components, and component-correct
      reversals.
- [ ] 3.7 Add incremental and bounded historical integrity verification,
      immutable Integrity Manifests, exact ingestion cursors, and workload
      checkpoints.
- [ ] 3.8 Add one short CAS/serializable close transaction with fresh authority,
      coverage, group, policy, reservation, account-fence, and cursor reproof.
- [ ] 3.9 Add smallest-scope cause-owned Integrity Cases, containment, guided
      source-owned repair, correction continuity, and fresh-proof clearing.
- [ ] 3.10 Add Finance-confirmed Field Account Balance and Missionary Support
      Activity/Support Balances projections with exact currency and through-date.
- [ ] 3.11 Add the deterministic post-close Approved Data View and Phase 18 facts
      package for `field_account.support_statement@1`.
- [ ] 3.12 Add prospective publication profiles, automatic idempotent statement
      generation, HTML history, authorized PDF access, privacy containment,
      same-facts artifact successors, and optional notices.

## 4. Planning Currency Reallocation And Support Sources

- [ ] 4.1 Add explicit default Field Account currency versions and prospective
      source-family parallel-currency activation proof.
- [ ] 4.2 Add exact per-currency entries, capacity, assessment, close,
      correction, statement, retirement, and separate-balance projections.
- [ ] 4.3 Add Support Currency Allocation Manifests with exact external
      conversion evidence, per-designation conservation, and no Asym FX engine.
- [ ] 4.4 Add optional Approved Support Plan posture, versions, needs, reserve
      target, projection bases, and bounded publication modules.
- [ ] 4.5 Add purpose-separated Balance Coverage, Reserve Position, Commitment
      Forecast, recorded activity, and Phase 28 goal composition without false
      zero or cross-authority synchronization.
- [ ] 4.6 Add Support Reallocation policies, cases, exact eligibility/capacity,
      coverage manifests, conflict-aware organization decisions, and atomic
      same-currency internal pairs.
- [ ] 4.7 Add exit disposition manifests, worker-lifecycle references,
      proof-gated charitable succession, separately authoritative external
      results, and append-only recovery.
- [ ] 4.8 Add source-authoritative Organization Support Cost contracts,
      semantic owner selection, economic roots/observations, bearing policies,
      conserving manifests, capacity, carryforward tranches, and corrections.
- [ ] 4.9 Add Noncash Support Realization contracts for source-final asset-lot
      proceeds, exact cost treatment, purpose/currency coverage, Realized
      Support Basis, D2 admission, D3 assessment, and correction.
- [ ] 4.10 Prove exclusive coverage across assessment, compensation, expense,
      processor cost, organization support cost, noncash, AP/accounting, and
      source families.

## 5. Compensation Funding And Provider Handoffs

- [ ] 5.1 Add Engagement Authority References, Compensation Funding Periods,
      prospective Funding Plans, bounded methods, organization supplement, and
      simple optional support-balance floor.
- [ ] 5.2 Add immutable proposals/decisions, non-reusable Funding Coverage,
      reservations, underfunding exceptions, and no automatic wage/backpay
      behavior.
- [ ] 5.3 Add evidence-qualified compensation effect recognition, External
      Compensation Results, External Payment Occurrences, mixed/partial payment
      coverage, reversals, and corrections.
- [ ] 5.4 Add immutable artifact-always Compensation Handoff Packages,
      one-lane execution claims, Delivery Profile versions, preflight, preview,
      and external participant/payee bindings.
- [ ] 5.5 Implement and certify the exact Gusto Employee Payroll Draft adapter.
- [ ] 5.6 Implement and certify ADP Workforce Now Pay Data Input.
- [ ] 5.7 Implement and separately certify Xero Payroll AU and Xero Payroll NZ
      draft-input adapters.
- [ ] 5.8 Implement capability-complete QuickBooks Workforce and Xero Payroll UK
      readback-and-artifact adapters without claiming direct-write parity.
- [ ] 5.9 Add Provider Draft Operations, concurrency claims, exact readback,
      drift, ambiguity-safe inspection, residual-only recovery, kill switches,
      and tenant-fair backpressure.
- [ ] 5.10 Prove at least two distinct direct-write adapters have current
      production authorization and production-shaped certification before the
      multi-provider launch claim.
- [ ] 5.11 Prove external classification, calculation, approval, submission,
      completion, payment, and Phase 20 accounting remain outside adapter
      authority.

## 6. Expense Claims Governance And Evidence

- [ ] 6.1 Add stable Expense Claims and immutable Claim Versions with exact
      claimant, relationship, economic payer, source currency, items, splits,
      purpose, and provenance conservation.
- [ ] 6.2 Add adaptive report drafts and immutable submissions without
      report-level approval, obligation, payment, funding, or accounting state.
- [ ] 6.3 Add private Receipt Evidence Assets, immutable many-to-many links,
      evidence-access projections, extraction/match suggestions, and human
      confirmation.
- [ ] 6.4 Add the shared tenant AI control plane with encrypted write-only
      credential revisions and purpose-specific capability bindings for
      provider/connection/model/region/budget/classification/evaluation/manual
      fallback.
- [ ] 6.5 Add quiet off-by-default Expense Program activation with complete
      cohort, schema, policy, route, currency, source, claimant, and preview
      proof.
- [ ] 6.6 Add bounded Expense Governance Profile versions, assignments,
      incurred-date one-winner resolution, and exact item/split decisions.
- [ ] 6.7 Add finite Approval Route versions, submission-time Assignment
      Snapshots, conflict/recusal checks, delegation/reassignment, small-tenant
      oversight, and human-only review actions.
- [ ] 6.8 Add missing-information and policy-exception handling, clean-only bulk
      approval, consequence previews, immutable Approved Expense Snapshots, and
      supplements.
- [ ] 6.9 Add optional organization-card source/profile/assignment models,
      private staged CSV manifests, exact file/source idempotency, overlap
      classification, safe-row acceptance, and no-silent-drop outcomes.
- [ ] 6.10 Add immutable posted card evidence, business/personal/unresolved
      conservation, source adjustments, claim matching, PAN minimization, and
      manual-path continuity.
- [ ] 6.11 Add authenticated mobile claim capture, camera/file upload, offline
      drafts, idempotent resume, and online-only authoritative actions.

## 7. Expense Authorization Effects Collaboration And Resolution

- [ ] 7.1 Add independently optional Prospective Expense Authorization posture,
      request versions, evidence, governance, finite approval assignments,
      human decisions, amount/currency/purpose/window/condition bounds, and
      absence semantics.
- [ ] 7.2 Add optional separately certified same-purpose/currency capacity
      reservations atomically with decisions.
- [ ] 7.3 Add exact non-overlapping claim authorization coverage, partial use,
      narrowing, successor amendment, withdrawal, expiry, proved-unused release,
      and in-flight quarantine.
- [ ] 7.4 Add source-family-specific Expense Field Account Effect Recognition
      Profiles and source qualification for reimbursement, card, direct
      organization payment, and certified organization-payable facts.
- [ ] 7.5 Add Approved-Snapshot-rooted serializable Settlement Determination,
      immutable Effect Basis, non-reusable Effect Coverage, exact dispositions,
      effects, dates, and append-only corrections.
- [ ] 7.6 Add independently optional Advance and Claimant Repayment policy,
      authorization, issuance, readiness, application, residual, repayment
      decision/requirement/occurrence/evidence/coverage, and restitution review.
- [ ] 7.7 Add Travel Allowance typed calculations, certified source packages or
      bounded tenant schedules, exact inputs, deterministic rounding,
      cumulative capacity, privacy-minimized route evidence, and external/manual
      fallback.
- [ ] 7.8 Add own-identity exact-claim Expense Collaboration assignments,
      invitations, evidence projections, claimant confirmation, prepare-only
      default, optional confirmed submission, revocation, and provenance.
- [ ] 7.9 Add exceptional Expense Claim Resolution causes, exact cases,
      downstream impact manifests, idempotent convergence, root-owner proof,
      per-family disposition, and source-owned correction coordination.
- [ ] 7.10 Prove expense authorization, approval, obligation, funding, effect,
      handoff, external payment, accounting, and reconciliation never collapse
      into one state.

## 8. Reimbursement Handoff Records And Feed Projections

- [ ] 8.1 Add immutable content-addressed schema-versioned Reimbursement Handoff
      Packages for exact obligations with protected reference retrieval.
- [ ] 8.2 Add Reimbursement Delivery Profiles and one Execution Claim assigning
      every exact obligation unit to one qualified external owner/lane while
      pinning Phase 20 posting owner separately.
- [ ] 8.3 Add the complete `Handle outside Asym` lane, Handoff Attestation,
      explicit release distinct from download, and qualified payroll/AP
      pre-execution draft/input lanes.
- [ ] 8.4 Add provider-operation lifecycle reuse without compensation or payment
      conflation, including readback, ambiguity, residual succession, and drift.
- [ ] 8.5 Add exact partial/grouped/many-to-many/mixed/FX/residual/failure/return/
      reversal/correction/reissue payment coverage and evidence-strength labels.
- [ ] 8.6 Add source projections and closed privacy-safe field floors required
      for the Missionary Support Feed without implementing Phase 31 transport.
- [ ] 8.7 Add recipient/purpose/subject-scoped projection versions, opaque
      identifiers, version/provenance/watermark/tombstone behavior, and privacy
      filtering before enumeration.
- [ ] 8.8 Add negative contracts proving Phase 21 performs no bidirectional
      contact/gift writes, duplicate source reads, feed subscriptions/cursors,
      provider activation, destructive merge, or downstream deletion claim.

## 9. Opening Activation Cumulative Admission And Records

- [ ] 9.1 Add Opening Source Packages, complete activation cohorts, precedence,
      the exact `exact_history | opening_residual | reference_only |
intentional_exclusion | unresolved` disposition catalog, atomic-group and
      nonnegative exact-history-prefix proof, negative-legacy blockers, residual
      positions, inert reference history, and control totals.
- [ ] 9.2 Add private chunked resumable staging, production-shaped side-effect-
      dark shadow reconciliation, row/cohort validation, and final reproof.
- [ ] 9.3 Add one short idempotent CAS-guarded Operational Cutover at exact
      source-family half-open boundaries with opening occurrences, coverage,
      outbox, and authority intervals.
- [ ] 9.4 Add append-only Opening Position Corrections, manifest successors,
      overlap/gap monitoring, and smallest-scope containment.
- [ ] 9.5 Add Phase 21 Release Generations, Adoption Plans, content-addressed
      Go-Live Readiness Manifests, optional capability bindings, readiness
      projections, D17-composed final activation, and the D27 reference-only
      boundary for optional D28 proof.
- [ ] 9.6 Add production-authorized complete-cohort activation review, literal
      start action, pilot publication scoping, post-cutover close proof, and no
      second activation state.
- [ ] 9.7 Add Travel Allowance Capacity Key Contracts, immutable Travel Allowance
      Cumulative Admissions, Opening Cumulative State,
      exact `clean_boundary_zero | opening_cumulative_state |
external_at_boundary` and `asym_source_complete |
authoritative_feed_complete | external_calculation` dispositions,
      complete group census, Admission Manifests, and atomic first allocation.
- [ ] 9.8 Add late/predecessor fact correction, affected-suffix review,
      continuing-source monitoring, source-group containment, and external
      calculation continuity.
- [ ] 9.9 Add purpose-owned Records Schedule Contracts/bindings/resolutions,
      trigger/floor/ceiling/hold/copy/use semantics, successor impact, and Phase
      29 execution handoff.
- [ ] 9.10 Add exact per-record and Legal-Entity custody exports with canonical
      JSONL, safe CSV, accessible HTML/PDF, authorized originals, ordered
      manifests, hashes, omissions, owner references, residual recovery, repeat
      window, offboarding snapshot/delta, and records-only retrieval.
- [ ] 9.11 Prove download, print, external-copy assertion, custody transfer,
      retention, hold, termination, disposal, and restore remain separate facts.

## 10. Product Experience Operations And Release Verification

- [ ] 10.1 Build the quiet Mission Control Field Accounts workspace with guided
      setup, close/readiness, source-labelled projections, exception-first
      review, consequence previews, and bounded advanced settings.
- [ ] 10.2 Build the focused missionary Support balances/activity experience
      with tenant-controlled modules, exact ISO currencies, through-dates,
      progressive status/detail, statements, planning, expenses, and no
      availability/withdrawal claims.
- [ ] 10.3 Build People & access for separate identities, memberships, access,
      responsibilities, invitations, preferences, revocation, and life-event
      succession.
- [ ] 10.4 Build claimant/helper/reviewer expense flows with camera-first mobile
      capture, offline drafts, own-identity context, assignment-safe evidence,
      and clear independent statuses.
- [ ] 10.5 Add purpose-routed AI settings with write-only credential replacement,
      model/region/budget/evaluation controls, test connection, preview, manual
      fallback, and no secret readback.
- [ ] 10.6 Add source-to-occurrence-to-close-to-projection/package/provider/
      correction correlation, redacted audit, metrics, actionable alerts,
      runbooks, and cause-owned Mission Control follow-up.
- [ ] 10.7 Add tenant-fair workload limits, protected correction/readback/
      privacy/export capacity, backpressure, kill switches, bounded recovery,
      and chaos behavior.
- [ ] 10.8 Prove WCAG 2.2 AA, keyboard/focus/error behavior, screen-reader state,
      320px/400% reflow, touch targets, forced colors, reduced motion, long
      locales, RTL, responsive tables, and financial-language comprehension.
- [ ] 10.9 Prove migration and restore on fresh and production-shaped databases,
      no disposed-byte resurrection, no duplicated outbox/provider operation,
      and no ownership-boundary overlap.
- [ ] 10.10 Run service, property, real-Postgres, durable-workflow, provider,
      artifact/export, security, authenticated Playwright, accessibility,
      performance, chaos, and architecture-closure suites.
- [ ] 10.11 Complete the D27 release gate and at least two direct-write provider
      certifications before claiming the full Phase 21 launch, while proving
      the disposable readiness projection recomputes current owner/revocation/
      freshness facts and has no activation, financial, or command-input
      authority.
- [ ] 10.12 Update canonical glossary, roadmap, architecture, runbook, provider
      certification, security/privacy, migration, support, and user guidance
      without creating alternate authority.
