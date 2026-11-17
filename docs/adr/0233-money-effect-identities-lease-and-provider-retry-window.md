# ADR-0233: Each money effect has its own identity, claimed work holds a lease, and provider retries stop at the provider's window

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Event-ID uniqueness does not stop two different events producing the same effect
(audit NB-02, NB-05). A worker that dies after claiming a row strands it (NB-04,
NV-01). A provider's idempotency key is guaranteed only for a window, 24 hours for
Stripe, so a lease alone cannot authorize a late retry. The accepted
donation-lifecycle contract requires that recovery never duplicates a money
effect and that work dead-letters after bounded retries.

## Decision

1. **Every money step is one SQL command in one transaction** that commits
   completely or not at all, and holds no transaction open across a provider
   call, a PDF render, a file upload or an email. Provider calls are driven by an
   outbox.
2. **Each business effect has its own idempotency key,** listed per operation in
   the plan's section 8.1. Among them: begin gift by tenant and request key;
   payment outcome by provider account, payment object and effect kind; posting by
   accepted source occurrence and posting kind; refund confirmation by provider
   account, refund ID and effect kind; dispute effects by provider account,
   dispute ID and status; corrections by gift and correction command ID.
   "Provider account" means the account in one mode, test or live. A replay
   re-runs the whole command and appends nothing twice.
3. **Claimed work holds a lease on the work row itself.** Claims carry an expiry
   and an attempt counter; a scanner reclaims expired `processing` rows and
   rescans `received` ones. Completion must present the current attempt number,
   so a resumed stale worker cannot finish. After a fixed number of attempts a row
   dead-letters and raises a Mission Control task. The lease is two columns on the
   event store, the outbox, the dispatch ledger and the import batch.
   `workflow_work_claims` stays for the work that uses it today.
4. **A provider-operation record extends the outbox.** The request, a digest of
   its parameters and its first submission time are stored before dispatch. A
   retry reuses the same key and parameters, and only inside the provider's
   guaranteed window. After the window an unknown outcome is parked for
   reconciliation and never resubmitted.
5. **Parked work is resolved by a person,** with a reason and the provider-actions
   capability, in one of three ways: retry (only inside the window), adopt (record
   the provider object reconciliation found, through the same apply command), or
   abandon (close it as never performed and release any reservation).
6. **Provider events are reduced, not trusted in order.** Each payment and refund
   is reduced from valid transitions and the provider's current object; refund
   totals are the sum of distinct confirmed refunds. A contradiction, or a
   provider payment that matches no local operation, parks one repair case
   without discarding evidence.
7. **Refund reservations hold until reconciled or abandoned,** not merely until a
   lease expires, so two refunds cannot exceed the gift while one is in doubt.
8. **One effective-amount view** answers "how much was given" for every reader.

## Consequences

- A paged reconciliation job compares the provider's records with local effects
  through each gift's frozen binding and opens a repair case on a difference;
  nothing is changed blindly.
- Posted rows stay write-once (ADR-0206 amendment of 2026-11-17); corrections,
  refunds and dispute effects append.
- Recovery after the window is a thin proof (TP4) and a 15.2 item: WP8a proves
  the parking and WP8c the resolve command.

## Source

- [Plan, section 8.1](../audits/core-crm-cms-database-target-architecture.md#81-which-operations-are-atomic-and-where-the-transaction-lives),
  [section 8.2](../audits/core-crm-cms-database-target-architecture.md#82-mechanisms-and-the-requirement-behind-each)
  and [section 8.3](../audits/core-crm-cms-database-target-architecture.md#83-event-ordering)
- Work packages WP8a, WP8b and WP8c, thin proofs TP2 and TP4
- Related: [ADR-0206](0206-immutable-posted-financial-facts-and-owner-operational-state.md),
  [ADR-0234](0234-stripe-connect-direct-charges-on-tenant-owned-accounts.md),
  [ADR-0235](0235-payment-account-onboarding-binding-lifecycle-and-disputes.md)
