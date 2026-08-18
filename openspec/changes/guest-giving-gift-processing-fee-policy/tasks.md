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
- [x] 4.2 `bunx @fission-ai/openspec@latest validate
  guest-giving-gift-processing-fee-policy --type change --strict` passes.
      `--all --strict` currently fails on unrelated pre-existing
      `add-guest-giving-and-gift-anonymity` (receipts MODIFIED omits scenarios);
      that change is out of scope. Archive this change after deployment
      verification.
- [x] 4.3 Gift intake POST test asserts `begin_donation_saga` `p_amount`
      equals `resolveGiftIntakeCharge().chargedAmountCents`.
- [x] 4.4 ADR-0118, runbook Guest Giving charged-amount section, and
      `docs/guides/features/guest-giving-cover-fees.md` document recovery
      extras and the staff-path exclusion.
