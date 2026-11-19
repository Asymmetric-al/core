# ADR-0234: Stripe Connect direct charges on tenant-owned connected accounts, one binding per Legal Entity

**Status:** Accepted. This writes down the topology that the founder ratified in
Phase 13 D1 on 2026-07-09
([Phase 13 PRD, section A](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md#a-money-movement-topology-d1--stripe-connect-direct-charges-tenant-owned-accounts)).
[ADR-0011](0011-native-embedded-stripe-phone-payment-lane.md) records that
topology as "ratified-but-unwritten — a program-level ADR gap to close". This
record closes the gap under the owner's instruction of 2026-11-17 to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).
It makes no new topology decision.

This records target intent. Core still stores a tenant's own Stripe secret key
today; nothing here says Connect is built. What exists is in the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Today Core stores each tenant's Stripe secret key in plaintext
(`tenants.stripe_secret_key`) and acts as that tenant, and the webhook verifies
with the platform secret only. The founder's constraint is that no money ever
flows through Asym. The Phase 13 research compared destination and direct
charges and reversed to direct charges, because the constraint is the defining
property of direct charges.

## Decision

1. **Stripe Connect with direct charges** on a controller-properties connected
   account with full-dashboard behaviour (`controller.stripe_dashboard.type =
full`, `controller.losses.payments = stripe`, `controller.fees.payer =
account`, `controller.requirement_collection = stripe`), onboarded through
   Stripe-hosted Account Links. No OAuth and no legacy account-type labels. The
   tenant bears disputes, losses and Stripe's fees; Asym holds no balance and is
   never in the flow of funds.
2. **Asym takes 0% of donations:** no application fee anywhere in the charge or
   subscription path (Phase 13 D1b).
3. **Access is the exact binding, never a stored tenant key.** The platform calls
   each connected account with its own platform secret and the
   `Stripe-Account: acct_…` header. It stores only the non-secret account
   reference, on an effective-dated binding of one Legal Entity to one account,
   mode and purpose. `tenants.stripe_*` secret columns are dropped once the tenant
   Stripe client is replaced (WP8).
4. **One binding per Legal Entity, frozen on the gift.** A gift takes its Legal
   Entity from the giving targets its lines name and the binding from that
   entity's active binding, and freezes the binding version it used. A Site never
   selects a payment account.
5. **SAQ-A posture.** The browser renders Stripe's Payment Element with the
   platform's publishable key, `{ stripeAccount: 'acct_…' }` and the payment
   intent's client secret. The card number never touches platform servers.
   Customers and payment methods live on the connected account.
6. **One Connect webhook endpoint,** of the connected-accounts kind with its own
   secret. Tenant and binding are resolved from the event's signed account and
   mode, never from metadata. An event from an unknown account is stored and
   ignored; an event whose live or test mode differs from the binding's is
   acknowledged, stored and ignored.

## Consequences

- Every provider call, and the browser's payment library, names the bound
  account. The identity-and-access contract is amended so the connected account's
  ID may reach the payment library at checkout and in the donor portal's
  payment-method change, and nowhere else (amendment of 2026-11-17).
- A tenant's disconnection is permanent loss of API access for that binding.
  Onboarding, the binding lifecycle and disputes are ADR-0235.
- Stripe Connect eligibility for the tenants' regions and charity status is
  unverified. Provider qualification per region runs before WP8a is groomed, and
  a tenant whose region fails is not onboarded; there is no platform-account
  fallback (plan section 15.2).
- Production use still requires the payments and finance counsel review and the
  Stripe implementation review that the Phase 13 PRD names.

## Source

- [Phase 13 PRD, sections A and B](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md#a-money-movement-topology-d1--stripe-connect-direct-charges-tenant-owned-accounts)
- [Plan, section 5.4](../audits/core-crm-cms-database-target-architecture.md#54-policies-and-commands),
  [section 8.2](../audits/core-crm-cms-database-target-architecture.md#82-mechanisms-and-the-requirement-behind-each)
  and [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  ("Stripe Connect topology")
- Work packages WP3 (legal entities) and WP8a
- Related: [ADR-0011](0011-native-embedded-stripe-phone-payment-lane.md),
  [ADR-0207](0207-site-before-ledger-with-locale-and-currency-facets.md),
  [ADR-0235](0235-payment-account-onboarding-binding-lifecycle-and-disputes.md)
