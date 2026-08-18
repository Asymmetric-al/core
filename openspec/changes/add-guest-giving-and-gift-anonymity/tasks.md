# Tasks

## 1. Contract and schema alignment

- [ ] 1.1 Delete the legacy flat-gift extension and standalone offline-writer
      plan from this change; record those repository observations as
      superseded evidence only.
- [ ] 1.2 Extend the Phase 13 contribution-header contract with the minimal
      source facts defined in `design.md` §8: donor identity status, nullable
      legal-donor Party reference, exact accepted identity/contact evidence,
      and per-gift missionary/public visibility preferences.
- [ ] 1.3 Add database constraints and composite tenant-scoped references that
      make a known legal donor require a same-tenant Party and make only the
      intentional `unknown_offline` state eligible for a null legal-donor Party.
- [ ] 1.4 Keep receipt facts, document state, message content, and delivery
      outcomes in their Phase 7, 18, 17, and 6 owner models; add no mutable
      receipt or send status to the contribution header.

## 2. Payment collection and accepted online contribution

- [ ] 2.1 Replace raw PAN/CVC/bank fields and simulated success with the
      supported Stripe-hosted collection surface.
- [ ] 2.2 Implement one server-authoritative, idempotent guest-acceptance
      service that validates tenant, site, Legal Entity, Settlement Account
      Binding, currency, gross amount, and allocation conservation before
      provider creation.
- [ ] 2.3 At the accepted-contribution boundary, resolve or create the
      tenant-scoped Party through Phase 4, freeze the exact
      `legal_donor_party_id` and source identity/contact evidence, and commit
      Phase 13 header, allocation, and posting truth without accepting a
      client-selected Party identifier.
- [ ] 2.4 Return a constant-shape response containing only contribution and
      payment-lifecycle information; do not reveal whether an email matched an
      existing Party.
- [ ] 2.5 Drive donor-facing success and delayed-payment copy from
      server-confirmed provider and contribution lifecycle projections.

## 3. Optional account claiming

- [ ] 3.1 Reuse the Phase 4 verified-possession claim boundary; never bind a
      login or reveal giving history merely because checkout supplied an email.
- [ ] 3.2 Offer a quiet, tenant-branded post-gift magic-link invitation that is
      optional, rate-limited, enumeration-safe, and independently retryable.
- [ ] 3.3 Verify that an abandoned or rejected checkout creates no Party,
      claim, membership, contribution, or official-document fact.

## 4. Per-gift anonymity

- [ ] 4.1 Add the clear checkout visibility choice and seed it from any
      donor-level preference without treating that preference as historical
      gift truth.
- [ ] 4.2 Centralize role-scoped identity projection so missionary/public
      reads, notifications, exports, search indexes, analytics payloads, and
      hydration data receive no hidden identity or stable identifier.
- [ ] 4.3 Keep full legal-donor evidence visible only to authorized finance and
      administrative roles and to the donor viewing their own gift.
- [ ] 4.4 Require the appropriate capability and reason for a post-acceptance
      visibility correction; write actor, before/after, reason, source surface,
      and timestamp to the shared contribution-operation audit trail.

## 5. Staff-entered offline gifts

- [ ] 5.1 Add known-donor and intentional unknown-donor row modes to the Phase
      15 staging/validation contract. Both modes use `gift_entry_batches`;
      quick entry creates and commits a one-row batch behind simplified copy.
- [ ] 5.2 Resolve known-donor rows through the Phase 4-backed staff Party
      picker/create flow and freeze the accepted source identity/contact
      evidence when the Phase 15 commit service writes Phase 13 truth.
- [ ] 5.3 Persist intentional unknown rows as
      `donor_identity_status = unknown_offline` with
      `legal_donor_party_id = null`; reject fabricated placeholder identity and
      keep the row in the same validation, conservation, review, audit, and
      atomic commit path as every other offline gift.
- [ ] 5.4 Emit the Phase 7 receipt-evaluation occurrence after successful
      posting. An unknown row receives the owner-derived not-receiptable reason
      until a governed source correction supplies sufficient donor evidence.
- [ ] 5.5 Prove structurally and with tests that no route or service can bypass
      the Phase 15 commit gateway to write staff-entered offline money.

## 6. Official-document and communication handoff

- [ ] 6.1 Emit only versioned source occurrences/references from the accepted
      contribution; do not render, send, or infer receipt issuance in the money
      transaction.
- [ ] 6.2 Integrate the complete owner chain: Phase 7 official facts → Phase 18
      canonical artifact → Phase 17 governed content → Phase 6 recipient,
      consent, dispatch, and communication history. Portal access and delivery
      use the stored exact artifact bytes and never rerender a live gift, Party
      profile, or receipt snapshot.
- [ ] 6.3 Make each handoff idempotent and independently recoverable so a
      render or delivery failure never changes accepted money or identity
      truth and a retry never duplicates an artifact or message.

## 7. Verification

- [ ] 7.1 Unit-test request validation, allocation conservation, identity-state
      constraints, visibility projection, permission checks, and
      constant-shape account-match behavior.
- [ ] 7.2 Integration-test tenant isolation, idempotent online acceptance,
      Phase 4 Party resolution, Phase 13 persistence, one-row and multi-row
      Phase 15 commit, unknown-offline handling, correction audit, and each
      document/communication handoff.
- [ ] 7.3 E2E-test guest giving without sign-in, delayed payment, optional
      claim, anonymous-to-missionary display with finance visibility, known
      offline quick entry, and unknown offering-box cash without fabricated
      identity.
- [ ] 7.4 Add negative tests proving raw payment credentials, hidden donor
      identifiers, cross-tenant Party references, synthetic anonymous Parties,
      legacy flat-gift writes, direct offline writes, and feature-local receipt
      sends are rejected.
- [ ] 7.5 Run targeted formatting and tests, then run
      `bun run openspec -- validate add-guest-giving-and-gift-anonymity --strict`;
      archive only after deployment evidence proves the canonical paths.
