# Tasks

## 1. Core policy

- [x] 1.1 Add Gift processing-fee policy in `packages/api/src/donate/fee-policy.ts`
      (integer cents, exhaustive payment-method switch, client-safe).
- [x] 1.2 Export `@asym/api/donate/fee-policy` for the checkout adapter.

## 2. Gift intake

- [x] 2.1 `donatePostSchema` accepts `cover_fees` (default false) and
      `payment_method` (default card); `amount` remains the gift in dollars.
- [x] 2.2 `POST /api/donate` recomputes charged cents and passes them as
      `begin_donation_saga` `p_amount`.
- [x] 2.3 First-shot PaymentIntent metadata carries the quote without overriding
      `donation_id`. Staff `packages/api/src/donations/index.ts` unchanged.

## 3. Checkout adapter

- [x] 3.1 `checkout-donation.ts` quotes through Core; POST body sends gift +
      flags, never a client gross-up.
- [x] 3.2 `checkout-client.tsx` drops hardcoded Stripe rates; cover-fees copy
      is estimated; ACH/wallet confirm stays blocked.

## 4. Verification

- [x] 4.1 Unit tests for Core quotes, schema defaults, saga metadata merge,
      adapter POST body, and checkout cover-fees / ACH quote without live bank
      POST.
- [x] 4.2 `bun run openspec -- validate guest-giving-gift-processing-fee-policy --type change --strict` passes.
      Full current-spec and active-change validation remains part of the
      integration gate. Archive this change only after deployment verification.
- [x] 4.3 Gift intake POST test asserts `begin_donation_saga` `p_amount`
      equals `resolveGiftIntakeCharge().chargedAmountCents`.
- [x] 4.4 ADR-0118, runbook Guest Giving charged-amount section, and
      `docs/guides/features/guest-giving-cover-fees.md` document recovery
      extras and the staff-path exclusion.
- [x] 4.5 HTTP donate replay unit tests lock matching charged cents + empty
      or legacy `{}` continues without rewriting extras or provider parameters;
      matching charged cents + a different stored full quote `409`s with no
      rewrite; malformed stored extras `500`.
- [x] 4.6 Reproduce provider success followed by a failed completion write through
      the actual handler and saga; prove retry returns the same PaymentIntent
      with identical provider parameters. Run focused tests, typechecking, and
      strict OpenSpec validation after the replay-safety correction.

- [x] 4.8 Cover matching-cents legacy card-cover and ACH-cover retries, an
      unpersisted customer, modern quoted HTTP completion recovery, and a
      late conflicting quote rejected before claim or provider calls.

- [ ] 4.7 Complete `bun run ci:preflight` and applicable current-head CI and smoke
      verification after the final integration-base update, then merge through
      ordinary repository protections.

- [ ] 4.9 Repair the verified preview install-tool mismatch by pinning Bun 1.4.0
      installation, verify the toolchain/build-control contracts, and rerun
      current-head hosted smoke.

- [x] 4.10 Validate the quote atomically before claim without consuming recovery
      attempts; freeze fee extras once processing starts. Verify the actual
      migration and rollback-only SQL proof on seeded disposable Postgres.
