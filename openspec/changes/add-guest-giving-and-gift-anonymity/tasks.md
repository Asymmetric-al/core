# Tasks

## 1. Payment collection hardening

- [ ] 1.1 Replace raw card/PAN/CVC inputs with Stripe-hosted Payment Element in
      donor checkout.
- [ ] 1.2 Remove simulated client success; success view renders only from
      server-confirmed donation/payment state.

## 2. Guest checkout server path

- [ ] 2.1 Add guest donation flow in `packages/api/src/donate` (thin app route
      re-export preserved): validate amount/currency/tenant/designation, create
      or match donor by tenant + normalized email, resolve `donor_id`
      server-side before the saga.
- [ ] 2.2 Provision claimable donor portal access (Supabase magic-link), no
      forced password, no account-existence leak in responses.
- [ ] 2.3 Freeze receipt-eligible donor identity (name, email, address) and gift
      facts in the Phase 7 source authority; hand one immutable Facts Package to
      Phase 18. Do not add contribution-owned render/artifact/delivery state.
- [ ] 2.4 Keep idempotency-key contract across the guest path.

## 3. Gift anonymity

- [ ] 3.1 Add per-gift anonymity fields and donor-identity status to donations
      (additive migration; see design.md §8).
- [ ] 3.2 Add checkout anonymity checkbox with approved copy (design.md §13).
- [ ] 3.3 Enforce redaction server-side in missionary/public projections,
      exports, emails, and hydration payloads; "Anonymous donor" display.
- [ ] 3.4 Audit anonymity changes (actor, before/after, reason, timestamp)
      with finance/admin-only edit permission.

## 4. Offline contributions (Mission Control)

- [ ] 4.1 Add known-donor offline entry: donor search/create, gift details,
      designation, anonymity flags, receipt eligibility, entry audit.
- [ ] 4.2 Add unknown-offline entry mode: `donor_id` null,
      `donor_identity_status = unknown_offline`, the source facts Phase 7 uses
      to derive reason-carrying `not_receiptable` eligibility, and
      batch/deposit reference support; create no fake donor rows or duplicate
      contribution-owned receipt/send status.
- [ ] 4.3 Route through Contribution Operations Core contracts (permissions,
      audit, corrections).

## 5. Verification

- [ ] 5.1 Unit/integration tests per design.md §17 (schema validation,
      redaction, receipt eligibility, account-existence non-leak).
- [ ] 5.2 E2E: guest gives without signing in; anonymous gift shows
      "Anonymous donor" to missionary while finance sees identity; unknown
      offline cash entry without fake data.
- [ ] 5.3 Resolve design.md §19 open questions with leadership before the
      affected sub-features ship.
- [ ] 5.4 `bunx @fission-ai/openspec@latest validate --all --strict` passes;
      archive this change after deployment verification.
