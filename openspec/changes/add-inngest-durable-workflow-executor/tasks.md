## 1. Workflow Foundation

- [x] 1.1 Create this OpenSpec change and record runtime scope, environment
      names, local development expectations, and rollback boundaries (#286)
- [ ] 1.2 Add the Inngest runtime endpoint and a no-op dispatch adapter smoke
      behind the server-side boundary, with local dev server discovery proven
      and no product workflow behavior moved (#287)
- [ ] 1.3 Add the shared workflow dispatch ledger and the schema-versioned
      tenant-scoped workflow event envelope with sensitive-field rejection
      (#288)
- [ ] 1.4 Add reusable product work claims and the dispatch recovery scan
      (#289)

## 2. Donation Recovery

- [ ] 2.1 Move one-time donation saga recovery to Inngest while preserving the
      immediate donor-facing payment creation moment (#290)
- [ ] 2.2 Dispatch Stripe webhook follow-up and recurring donation lifecycle
      work after verified durable storage; store unsupported events as ignored
      with safe reasons (#291)
- [ ] 2.3 Use honest payment status and ACH language across giving surfaces;
      distinguish authorization checkpoints from payment finality (#292)

## 3. Resend Inbound Workflow

- [ ] 3.1 Dispatch verified tenant-resolved inbound email work through minimal
      placeholders with no body, HTML, attachments, signed URLs, or Support Hub
      rows before workflow processing (#293)
- [ ] 3.2 Retrieve inbound body durably before Support Hub routing; track
      attachment status as pending/retrying/failed/available without blocking
      the conversation (#294)
- [ ] 3.3 Add inbound routing review for unknown or ambiguous safe routes and
      tenant-owned saved route management (#295)

## 4. Support Hub Moves

- [ ] 4.1 Add explicit audited tenant-scoped single-message moves with required
      reason and retention rules (#296)
- [ ] 4.2 Add bulk moves with single-move safeguards, partial success,
      item-level batch audit, and Retry failed recovery (#297)

## 5. Mission Control Summaries

- [ ] 5.1 Show product-owned workflow run summaries and notification policy
      without mirroring raw Inngest step logs (#298)
