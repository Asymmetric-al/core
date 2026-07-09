# Tasks

## 1. Contract and checkout

- [ ] 1.1 Extend the donate contract to accept a recurring frequency
      (validated server-side; single-designation rules preserved).
- [ ] 1.2 Donor checkout offers recurring giving with honest first-charge and
      schedule messaging.

## 2. Subscription + pledge creation

- [ ] 2.1 Server creates a Stripe subscription and a linked donor pledge
      one-to-one, server-authoritative, idempotent by key; the client never
      chooses pledge or subscription IDs.
- [ ] 2.2 New recurring gifts flow into the existing invoice/subscription
      reflection path without duplicating charges.

## 3. Verification

- [ ] 3.1 Integration + E2E: a donor starts a recurring gift; the pledge and
      subscription are created once; webhook reflection updates progress.
- [ ] 3.2 `bunx @fission-ai/openspec@latest validate --all --strict` passes;
      archive after deployment verification.
