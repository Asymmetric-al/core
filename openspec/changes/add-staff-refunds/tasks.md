# Tasks

## 1. Refund execution

- [ ] 1.1 Wire a Stripe refund provider behind `refundContribution` in the
      Contribution Operations Core; the route no longer returns 501.
- [ ] 1.2 Record the provider outcome truthfully (pending/final), never
      overstating finality before webhook-confirmed truth.

## 2. Gating and bulk

- [ ] 2.1 Enforce `finance:manage_contributions` + reason + server-side
      confirmation on refund execution.
- [ ] 2.2 Bulk refunds run per-record through the single-action contract with
      preview and confirmation, as a background batch.

## 3. UI honesty

- [ ] 3.1 Stop advertising refund as available while unwired; show it only when
      the execution path is live and the user is authorized.

## 4. Verification

- [ ] 4.1 Integration + E2E: authorized staff refund executes and reflects
      across surfaces; unauthorized staff are rejected server-side.
- [ ] 4.2 `bunx @fission-ai/openspec@latest validate --all --strict` passes;
      archive after deployment verification.
