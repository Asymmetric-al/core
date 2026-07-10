# Tasks

## 1. Phase 0 proposal package

- [x] 1.1 Audit current PDF Studio, native builder, receipts, statements,
      domain owners, migrations, Storage, and tests against fetched source.
- [x] 1.2 Record reuse/replace/retire/delete decisions and first-slice gates in
      the Statement Studio audit brief.
- [x] 1.3 Add the Statement Studio OpenSpec proposal, design, and capability /
      intent deltas required by the PRD.
- [x] 1.4 Validate this change with strict OpenSpec validation and complete
      documentation checks.

## 2. Human approval and downstream grooming

- [ ] 2.1 Qualify DocRaptor with representative tables/repeaters, pagination,
      headers/footers, fonts/private assets, fidelity/accessibility, fail-closed
      production mode, limits, latency, and cost fixtures; HITL approves it
      behind the renderer port as the sole first-slice provider or selects an
      explicit alternative.
- [ ] 2.2 Finance/legal approve annual statement inclusion, correction,
      refund, currency, identity, and official-language policy.
- [ ] 2.3 Inspect hosted migration/template state and approve each legacy
      template's migrate/archive/delete disposition.
- [ ] 2.4 Re-groom issue #322 so canonical statement context, artifact access,
      and finance/legal approval are explicit blockers.

## 3. Tenant-safe foundation

- [ ] 3.1 Extend the `pdf_*` family with job catalog/settings, scoped immutable
      version assignments, variables, recipient/source, retention, and logical
      render idempotency/canonical-artifact concepts.
- [ ] 3.2 Backfill/require tenant identity, add same-tenant composite foreign
      keys, and make published version content immutable. Coordinate with the
      approved #505/#516 isolation foundation and reuse its tenant guard,
      `FORCE RLS`, and permanent cross-tenant negative-test tier.
- [ ] 3.3 Align grants/RLS with server capabilities and add a private generated
      document bucket with tenant-aware paths and object policies.
- [ ] 3.4 Add one `packages/api` persistence/orchestration seam and generated DB
      types; app routes remain thin.
- [ ] 3.5 Prove cross-tenant rejection, immutable versions, capability
      differences, private paths, portal denial, concurrent-render convergence,
      lease-safe retry, canonical-artifact reuse, and purge tombstones with real
      SQL/integration tests.
- [ ] 3.6 Add DB-enforced logical render keys, bounded lease/attempt recovery,
      monotonically increasing fencing tokens, token-owned private staging
      paths, current-token compare-and-set canonical-artifact promotion, and
      durable token-scoped cleanup; cover concurrency, timeout, stale-writer,
      and cleanup-retry behavior while keeping issuance under #580 and outbound
      delivery under #581.

## 4. Safe vertical tracer

- [ ] 4.1 Ship the Statement Studio shell and starter catalog using synthetic
      sample data only; sample outputs are purpose-tagged, visibly non-official,
      admin-only, non-assignable, and non-deliverable.
- [ ] 4.2 Prove immutable version, preview-only template selection, server
      render, retry convergence, private upload, canonical artifact metadata,
      admin download, and audit with `letterhead.simple` or the annual starter
      in non-official sample mode.
- [ ] 4.3 Keep production endpoints from accepting browser-supplied official
      domain contexts.

## 5. First donor-facing production job

- [ ] 5.1 Coordinate #322 with the newer proposed #579/#580/#583/#584 work and
      consume the approved canonical statement snapshot/version contract; do
      not introduce a parallel annual-context, run, or formatting model.
- [ ] 5.2 Verify that the contract covers eligibility, corrections/refunds,
      currency, identity, totals, raw values, frozen display strings and locale,
      source IDs, policy version, and context hash.
- [ ] 5.3 Publish and assign the annual statement template against that
      contract; official money/date fields bind frozen display strings.
- [ ] 5.4 Render/store an immutable private artifact and expose it through the
      donor-owned BFF route with authenticated self-download audit.
- [ ] 5.5 When a source correction/refund/relink changes official output, mark
      the old artifact superseded/void per policy, link replacement lineage,
      preserve retained history, and keep stale output out of current portal
      views.
- [ ] 5.6 Replace the current live `.txt` response only after parity, finance /
      legal approval, tenant isolation, supersession, and correction fixtures
      pass.
- [ ] 5.7 Route outbound statement delivery through #552-#554 and #581 with
      version-scoped communication audit/idempotency; do not create a parallel
      Statement Studio send/log path.

## 6. Follow-on and legacy retirement

- [ ] 6.1 Reconcile original, staged-gift, corrected, and scaffold receipt paths
      before making `donor.receipt.single` an official Statement Studio job.
- [ ] 6.2 Add missionary/report/event/care/task/legal/CMS jobs only through
      owner-provided contexts with the sensitivity gates in the design.
- [ ] 6.3 Retire Unlayer only after native authoring, production jobs, tenant
      template disposition, and rollback verification are complete.
- [ ] 6.4 Archive this OpenSpec change only after deployed behavior and merged
      specs match the contract.
