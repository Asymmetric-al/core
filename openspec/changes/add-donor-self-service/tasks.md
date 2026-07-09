# Tasks

## 1. Recurring self-service

- [ ] 1.1 Server actions in `packages/api/src/donor-portal` for pause, resume,
      cancel, and amount change; each mutates the Stripe subscription and lets
      webhook-confirmed state update the pledge.
- [ ] 1.2 Donor dashboard UI for recurring management with honest pending
      states while provider confirmation is in flight.

## 2. Payment methods

- [ ] 2.1 Stripe-managed payment-method add/update/remove (SetupIntent or
      customer portal session); wallet page stub replaced.
- [ ] 2.2 Recurring gifts show and can switch their payment method safely.

## 3. Annual statements

- [ ] 3.1 Statement generation for receiptable gifts by year per tenant policy
      (finance/legal review of statement language before production).
- [ ] 3.2 Donor download from the portal; delivery recorded.

## 4. Verification

- [ ] 4.1 Integration tests: self-service mutations are tenant-scoped,
      donor-owned only, idempotent, and reflected in Mission Control from the
      same records.
- [ ] 4.2 E2E: donor pauses and cancels a recurring gift; updates a payment
      method; downloads a statement.
- [ ] 4.3 Archive this change after deployment verification.
