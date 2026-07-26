# Tasks

## 1. Contract And Dependency Foundation

- [ ] 1.1 Land the Phase 20 PRD, D1-D20 traceability, ADR-0043 through
      ADR-0061, research evidence, congruency audit, and this complete OpenSpec
      change.
- [ ] 1.2 Gate each source family independently on its exact predecessor-owned
      occurrence/version contract: Phase 13 posted contribution/ledger,
      Phase 14 admitted credit adjustment, Phase 15 frozen Deposit Group, and
      Phase 21 approved expense/payment. Keep only the dependent family dark
      when proof is missing; add no direct-table compatibility shim.
- [ ] 1.3 Inventory every existing accounting export, settlement, deposit,
      provider-credential, and expense-handoff writer. Record one source-family
      posting owner and keep Phase 20 dark until cutover proof exists.

## 2. Public Service And Canonical Persistence

- [ ] 2.1 Add the tenant/actor-scoped `AccountingOperationsService` with typed
      setup, evidence, mapping, release, delivery, recovery, and query commands.
- [ ] 2.2 Add Legal-Entity-scoped persistence with same-scope foreign keys,
      FORCE RLS, globally unique provider/environment/organization
      destinations, no cross-entity direct destination sharing, capability-
      complete multi-entity proof, append-only evidence, semantic uniqueness,
      compare-and-set, private artifact custody, durable
      manifests/digests/tombstones, retention/hold/disposal-governed payload
      bytes, and no mutable provider truth.
- [ ] 2.3 Add transactional outbox, fenced claims, leases, permanent semantic
      operation identities, recovery scans, and PII-safe telemetry.
- [ ] 2.4 Register purpose-scoped non-human principals for jobs, callbacks,
      schedules, synchronization, and recovery; reauthorize their current human
      owner, tenant, Legal Entity, destination, and capabilities at execution.

## 3. Accounting Release Policy And Mapping Foundation

- [ ] 3.1 Add fully pinned immutable Accounting Posting Intents,
      deterministic single-currency Canonical Accounting Effects with stable
      line IDs/ordinals and positive one-sided debit/credit lines, exact source
      coverage, byte-equivalent serialization/digests, nonprofit semantic
      distinctions, and one short atomic Accounting Release fence with no
      network I/O, artifact-byte generation, or queue call.
- [ ] 3.2 Add prospective accountant-confirmed accounting-policy versions and
      one active goal-based Posting Profile bundle per Legal Entity and
      Accounting Destination, with one certified recipe and permitted grain per
      supported source-purpose family; guided online fund-summary, offline
      gift-detail, and approved-expense approved-line-detail defaults; envelope-
      gated alternate grains; original-recipe-derived corrections/reversals;
      and JournalEntry/ManualJournal limited to explicit exceptional accountant
      adjustments with no fallback use.
- [ ] 3.3 Add Accounting Reporting Targets, Designation Mapping Versions,
      exact-once resolution, grouped-coverage proof, Mapping Coverage
      Manifests, and drift detection.

## 4. QBO And Xero Destination Plans

- [ ] 4.1 Add destination capability discovery and immutable Capability
      Certificates without assuming provider plan, region, object, or reporting
      support.
- [ ] 4.2 Add tenant-owned QBO Carrier Plans, native plan compilation, exact
      preview/readback, reporting-coverage disclosure, and provider drift.
- [ ] 4.3 Add tenant-owned Xero Carrier Plans, native plan compilation, exact
      preview/readback, reporting-visibility disclosure, and provider drift.
- [ ] 4.4 Prove each frozen Provider Delivery Plan is balanced and effect-
      equivalent to its Canonical Accounting Effect.

## 5. Processor Settlement And Bank Evidence

- [ ] 5.1 Persist idempotent, paginated Stripe balance-transaction, transfer,
      refund, dispute, fee, currency, and payout evidence through webhook and
      scheduled repair; preserve amount/fee/net, treat payout debit separately,
      prevent fee double counting, and quarantine unknown/repeated categories.
- [ ] 5.2 Build payout-attributed Settlement Evidence Snapshots only with exact
      provider-complete membership; use bounded balance-window evidence
      otherwise.
- [ ] 5.3 Add immutable Expected Bank Arrivals and Bank Evidence Observations
      through statement import and explicit staff evidence.
- [ ] 5.4 Add optional certified read-only bank evidence behind the same
      provider-neutral contract.
- [ ] 5.5 Add allocation-safe Bank Match, deterministic exact automation,
      ambiguity review, append-only supersession, and no final-reconciliation
      claim.

## 6. Corrections Cadence And Exceptions

- [ ] 6.1 Add the closed six-cause Correction Cause catalog, prospective
      Correction Posting Policy Versions, one/many/none bounded staff choices,
      accountant-owned prior-period-error handling, Posting Period Readiness,
      distinct dates, and source/cause-linked Compensating Accounting Releases.
- [ ] 6.2 Add three cadence modes, bounded IANA-timezone presets with DST and
      missed-occurrence semantics, review-first direct defaults, separate
      cadence/release permissions, the four-group Release Horizon, durable
      cadence evidence, derived Release Candidates, atomic revalidation, Pause
      upcoming releases, Release now, and exact mixed bulk results.
- [ ] 6.3 Add cause-owned Accounting Exception Cases, bounded blocking radius,
      proof-gated clearing, typed Handled outside Asym/QBO/Xero evidence with no
      delivery relabelling, recurrence, homogeneous bulk handling, and
      append-only evidence.
- [ ] 6.4 Integrate idempotent Mission Control follow-up without allowing task
      state to create or clear accounting truth.

## 7. Authorization Capacity Packages And Cutover

- [ ] 7.1 Add encrypted Provider Authorization Grants, exact QBO/Xero
      Accounting Destination Connections, secure callbacks, serialized
      rotation, same-organization reconnect, prospective replacement, and safe
      disconnect.
- [ ] 7.2 Add Certified Execution Envelopes, provider-native tenant-fair
      scheduling, recovery reserve, adaptive backpressure, truthful estimates,
      and operation-granular ambiguity recovery.
- [ ] 7.3 Add immutable Accounting Delivery Packages, Import Surface
      Conformance Records, exact bytes and control totals while retained,
      exact-destination current/unquarantined readiness, historical
      availability distinct from readiness, disposal tombstones, honest staff
      evidence, proved-gap recovery, and separately identified same- or cross-
      lane recovery successors limited to exact positively undelivered and
      unimported units with complete lineage and duplicate-prevention proof.
- [ ] 7.4 Add source-family Posting Ownership Cutovers, half-open ownership
      intervals, Cutover Coverage Manifests, final pre-activation and
      post-activation provider-visible inspection, explicit unobservable-writer
      limits, overlap quarantine, and gap-only backfill.

## 8. Expense Cost And Currency Handoffs

- [ ] 8.1 Keep expense accounting dark until Phase 21 supplies one immutable,
      PII-minimized, discriminated Accounting-Ready Expense Handoff with either
      one exact Approved Expense Snapshot or one payment source plus complete
      obligation/snapshot coverage and no invented primary snapshot.
- [ ] 8.2 Support the closed launch expense occurrence catalog and exact
      homogeneous Reimbursement Payment Coverage without creating outbound Bank
      Match, an AP subledger, or a payment system.
- [ ] 8.3 Add organization-absorbed processor costs by default and the optional
      fee-cover-first designation-borne uncovered-cost mode with immutable
      same-currency largest-remainder allocation evidence, central expense
      fallback, and missing-mapping readiness block.
- [ ] 8.4 Add quiet local/home-currency settlement by default, exact provider
      conversion evidence, ordinary Stripe/payout-bank/provider currency
      equality, one-currency effect/release/plan/package/arrival/match/
      allocation invariants, and proof-gated retained foreign-settlement lanes.

## 9. Finance Workspace And Operations

- [ ] 9.1 Build the Core-native Ready for Accounting overview, setup, mapping,
      release, provider-operation, Bank Match, package, cutover, and exception
      surfaces with progressive disclosure and quiet healthy states.
- [ ] 9.2 Prove WCAG 2.2 AA across critical finance journeys: permissions,
      keyboard and screen-reader operation, meaningful names/state, associated
      errors, visible unobscured focus, text-and-icon non-color status,
      200% zoom and 400% reflow without two-dimensional scrolling, forced
      colors, reduced motion, long locales, and right-to-left layouts.
- [ ] 9.3 Prove the clean one-person-team path defaults a single Legal Entity
      and local currency, keeps advanced controls progressively disclosed,
      presents one exception-owned next action, and adds no needless
      confirmation to reversible or non-destructive work.
- [ ] 9.4 Add tenant-safe metrics, exception-based alerts, audit evidence,
      operator runbooks, retention, legal/privacy holds, and backup/restore
      verification.

## 10. Release Verification

- [ ] 10.1 Prove D1-D20 happy paths, edge cases, failures, replay, races,
      ambiguous provider outcomes, tenant isolation, exact balance and
      allocation conservation, source coverage, and append-only recovery at the
      accepted public seam.
- [ ] 10.2 Run QBO and Xero provider-contract, sandbox or production-shaped,
      package-conformance, performance, tenant-fairness, outage, reconnect, and
      drift certification for every enabled destination profile.
- [ ] 10.3 Disable every alternate accounting writer at its proved source-
      family cutover. Verify no dual write, date-only ownership, fuzzy
      adoption, silent lane switching, or whole-history replay remains.
- [ ] 10.4 Targeted and full strict OpenSpec validation pass:
      `bunx @fission-ai/openspec@latest validate add-accounting-exports-reconciliation --strict`
      and `bunx @fission-ai/openspec@latest validate --all --strict`.
- [ ] 10.5 Archive only after deployed behavior is verified and the merged
      `accounting-operations` and `platform-boundaries` specs match production.
