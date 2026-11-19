# ADR-0235: Payment-account onboarding, the binding lifecycle, and dispute handling

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
The first admitted scope (one legal issuer per tenant, one country and currency,
cards only) is the plan section 15.1 proposal taken under the implementation
record (D-07), not a fresh owner ruling; the plan asks for it to be decided before
WP8a is groomed.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

ADR-0234 fixes the topology: direct charges on a tenant-owned connected account
for each Legal Entity. Onboarding is manual key-paste today, nothing tracks
whether an account can still take charges, and a disconnected account is
permanent loss of API access (Phase 13 PRD, D1). Disputes and returns move money
out of the tenant's balance on the provider's schedule.

## Decision

1. **Onboarding is a command.** A tenant administrator with
   `payments.manage_account` starts it, with a reason. Core records the binding
   as pending, creates the connected account for the Legal Entity outside the
   database, and sends the administrator to the provider's hosted onboarding. A
   re-run returns the same binding with a fresh onboarding link, because the
   provider's link expires.
2. **The binding lifecycle follows the provider's account events:** pending, then
   active; active to restricted when the account can no longer take charges and
   back when charges are enabled again; either to disconnected when the account
   leaves the platform. Reconnecting is onboarding again and opens a new binding
   version; a gift keeps the version it froze.
3. **A disconnected binding stops Core acting on that account.** New intake is
   refused, queued provider operations for the binding park, a task is raised and
   Core makes no further call on the account. Its live monthly commitments are
   marked as outside Core's control, because the provider goes on charging them;
   a donor's stop is still recorded and stays pending. Reconnecting restores
   access, not the right to act (ADR-0015): cohorts stay quarantined until
   reconciliation releases them, and nothing moves to a different account without
   the donor's fresh authorization.
4. **A refund is refused when the gift's binding is disconnected,** because Core
   can no longer call that account.
5. **Disputes and returns are reduced from the provider's observations.** An open
   dispute holds a reservation that blocks competing refunds and raises a staff
   task. A lost dispute appends a reversal, spread across the gift's lines as a
   refund is, with a receipt consequence; a won one releases the reservation; one
   won after it was lost appends a reinstatement. An inquiry (a status beginning
   `warning_`) is recorded and raises a task, reserves nothing and ends when the
   provider closes it. Each status has one effect.
6. **Money that goes back before posting** is recorded on the gift's payment
   observation, because there is no posted row yet. A gift whose whole amount has
   gone back is closed as refunded and gets no receipt facts; an open reservation
   or dispute keeps a gift out of posting.

## Consequences

- Each provider event is matched to a gift's frozen binding by account and mode,
  whichever binding version it froze (ADR-0233, ADR-0234).
- Who may refund, approve and resolve parked provider work follows the capability
  table in the plan's section 5.4; by default only the tenant administrator holds
  the finance-approver bundle (implementation record, D-06).
- Dispute-fee allocation policy and deauthorization UX polish stay parked, as the
  Phase 13 PRD parks them.

## Source

- [Plan, section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands),
  [section 8.1](../audits/core-crm-cms-database-target-architecture.md#81-which-operations-are-atomic-and-where-the-transaction-lives)
  and [section 8.2](../audits/core-crm-cms-database-target-architecture.md#82-mechanisms-and-the-requirement-behind-each)
- Work packages WP8a and WP8c, and WP12 for monthly commitments
- Related: [ADR-0015](0015-provider-control-loss-quarantine-and-proof-gated-recovery.md),
  [ADR-0233](0233-money-effect-identities-lease-and-provider-retry-window.md),
  [ADR-0234](0234-stripe-connect-direct-charges-on-tenant-owned-accounts.md)
