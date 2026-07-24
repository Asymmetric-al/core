# Tasks

## 1. Contract And Dependency Foundation

- [ ] 1.1 Land the Phase 19 PRD and its authority map, D1-D18 traceability,
      research evidence, congruence package, ADRs, and this OpenSpec change.
- [ ] 1.2 Prove or explicitly supersede the Phase 7, Phase 14, Phase 18,
      Phase 17/6, Phase 12, and Phase 15 dependency seams before runtime work.
- [ ] 1.3 Remove `issued-on-accept`, joint-household official-statement,
      mixed-recognition official-statement, and Phase 19-owned eligibility
      wording from active contracts.

## 2. Public Service And Canonical Persistence

- [ ] 2.1 Add the tenant/actor-scoped `StatementOperationsService` with explicit
      typed preflight, start, participation, run-control, fulfillment,
      completion, help, portal-copy, and evidence commands and queries.
- [ ] 2.2 Add canonical Phase 19 persistence with composite tenant/environment
      ownership, same-scope foreign keys, FORCE RLS, append-only evidence,
      semantic uniqueness, compare-and-set revisions, and no cross-domain
      mutable snapshots.
- [ ] 2.3 Add transactional outbox, recipient-grained tenant-fair claims,
      leases, fencing, recovery scans, reconciliation, and PII-safe telemetry.

## 3. Preflight Population And Release

- [ ] 3.1 Build immutable Run Preflight manifests from source-authoritative
      Statement Subjects, purpose and policy pins, exact source closure,
      included/excluded/blocked/already-current reasons, and downstream
      resolution pins.
- [ ] 3.2 Add contract-bounded pre-start participation with automatic result as
      the default, exact whole-subject include, purpose-owned handle-separately
      outcomes, non-enumerating add, and exact bulk reconciliation.
- [ ] 3.3 Add standard same-person and protected different-human release floors
      without an ordinary approval workflow.
- [ ] 3.4 Implement one idempotent atomic Start transaction and unclaimable
      release barrier with no external I/O.

## 4. Recipient And Fulfillment Operations

- [ ] 4.1 Add immutable Statement Delivery Profiles and deterministic
      compilation into frozen Fulfillment Plans and mutually exclusive lanes.
- [ ] 4.2 Add exact recipient-delivery snapshots, live safety reproof, governed
      destination succession, and indeterminate-handoff reconciliation.
- [ ] 4.3 Add self-print-first physical fulfillment, exact-artifact packages,
      fast staff print/postal evidence, one mail-house package profile, and one
      proof-gated direct-mail adapter boundary with execution-time bound
      reproof and exception-only exact-piece reauthorization.
- [ ] 4.4 Add finite contract-owned statement communications through Phase
      17/6 with grouped staff attention and no duplicate donor notice.

## 5. Run Control Recovery And Completion

- [ ] 5.1 Add atomic Pause new work, proof-gated Resume remaining work, and
      permanent Stop remaining work over one monotonic control fence.
- [ ] 5.2 Add staff-attested year-boundary check intake consumption, immutable
      source cutoffs, and purpose-owned late-fact/supplemental recovery.
- [ ] 5.3 Add the contextual Help with this statement projection and command
      router without a second case, document, contact, or delivery system.
- [ ] 5.4 Add tenant-authorized Mark run complete, derived clean/exception
      result, automatic carry-forward, and append-only Return to active review.

## 6. Portal Evidence And Optional Purposes

- [ ] 6.1 Add unmetered current-artifact donor view/download/local print and
      repeatable bounded exact-current outbound copy fulfillment.
- [ ] 6.2 Add the optional, default-Off Support overview purpose for the closed
      household-support and disclosed-DAF recognition set, fully independent
      from official documents.
- [ ] 6.3 Add one PII-minimized Run Evidence Record plus a fixed,
      permissioned, expiring audit package derivative.

## 7. Seasonal Capacity And Operations UI

- [ ] 7.1 Certify workload-shaped tenant-fair capacity, protected critical
      message service, provider-adaptive backpressure, poison containment, and
      truthful stage-specific progress.
- [ ] 7.2 Add the bounded Target ready for review by control without tenant
      priority, weight, concurrency, rate, chunk, or batch knobs.
- [ ] 7.3 Build the Core-native Year-End Operations, run, exception, recipient,
      delivery-profile, participation, help, completion, and evidence surfaces
      with permission-safe responsive behavior.

## 8. Cutover And Release Verification

- [ ] 8.1 Remove the live annual-statement text route and every alternate
      population, render, portal, delivery, or completion path; ship no legacy
      adapter or fabricated history. Complete the route/client cutover,
      prototype-inventory closure, and closure-test updates atomically before
      any Phase 19 donor artifact path becomes available.
- [ ] 8.2 Prove D1-D18 happy paths, edge cases, failures, replay, races,
      provider ambiguity, tenant isolation, exact counts, records behavior,
      accessibility, and production-shaped seasonal load at the accepted public
      seam.
- [ ] 8.3 Keep implementation blocked until the dependency and release gates in
      `design.md` are satisfied; archive this change only after deployed
      behavior is verified.
