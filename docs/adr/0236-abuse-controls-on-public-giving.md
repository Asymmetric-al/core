# ADR-0236: Public giving is guarded by a Postgres rate limit and a server-verified bot challenge

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
The provider choice (Cloudflare Turnstile) and the seven-day abandonment period
are plan section 15.1 defaults taken under the implementation record (D-08), not
fresh owner rulings; any provider with a server-side verification call fits.

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Gift intake is the only public write, and a guest checkout on a tenant's own
payment account invites card testing against that account. The repository has
neither a rate limit nor a bot challenge today (audit NR-08). The plan keeps the
store count down: no new service is added for either control.

## Decision

1. **A rate limit kept in Postgres.** One system-entry SQL function keeps a
   counter in a fixed window, keyed on the Site and a hash of the caller's
   address, or on the signed-in person for giving on the donor-portal host. It
   needs no new store.
2. **One bot challenge, verified on the server,** with its secret kept
   server-side and its script allowed in the donor app's content-security policy.
   The challenge is verified again on the donor-portal host for a signed-in gift
   handed over from a Site.
3. **The donor server applies both before it calls the intake command.** Intake
   accepts only the inputs the plan lists and derives the tenant, the Legal Entity
   and the binding itself (ADR-0224, ADR-0234).
4. **An unpaid checkout closes as abandoned** after a period the owner sets
   (default seven days). The scanner marks the intake abandoned and queues the
   cancellation of the provider's payment object. A payment that succeeded first
   wins.
5. **The checkout response has the same shape on every row,** so it never shows
   whether an email was already known.

## Consequences

- A begun gift that is never paid appears in no giving history or total.
- Rate-limit keys hold a hash of the address, never the raw address.

## Source

- [Plan, section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands)
  ("Gift intake is a named exception", "When a gift is held for review") and
  [section 15.1](../audits/core-crm-cms-database-target-architecture.md#151-decisions-that-belong-to-the-owner)
- Work package WP8a
- Related: [ADR-0215](0215-guest-attribution-exact-claim-proof-and-current-access.md),
  [ADR-0224](0224-caller-token-server-lanes-and-sql-commands.md)
