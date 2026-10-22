---
name: stripe-best-practices
description: >-
  Guides Stripe integration decisions across development and test environment
  planning (separate sandboxes vs the shared test mode sandbox), API selection
  (Checkout Sessions vs PaymentIntents), Connect platform setup (Accounts v2,
  controller properties), billing/subscriptions, tax and registrations (Stripe
  Tax, automatic_tax, product tax codes), Treasury financial accounts,
  integration options (Checkout, Payment Element), migrating from deprecated
  Stripe APIs, and security best practices (API key management, API key
  permissions, webhooks, OAuth). Use when planning, building, modifying,
  testing, or reviewing any Stripe integration, including choosing a development
  environment, accepting payments, building marketplaces, integrating Stripe,
  processing payments, setting up subscriptions, collecting sales tax, VAT, or
  GST, creating connected accounts, or implementing secure key handling.

---

<!-- CORE-OVERLAY-START -->
## Core contracts

In Core, read `packages/api/src/stripe/api-version.ts` and `packages/api/package.json` for the approved API version and SDK. Reuse the existing Stripe client. Preserve those pins unless the requested work explicitly includes a reviewed version upgrade; choose and verify that upgrade target before changing code. The upstream versions and examples below are reference snapshots, not Core upgrade instructions.

Reuse existing authentication as opaque secure input. Never print, copy, commit or rotate credentials during skill maintenance. Product provisioning, CLI/plugin installs, terms acceptance, new credential creation and additional skill installation require the corresponding explicit task scope; they are never side effects of installing or refreshing this guidance. Follow current repository authority and the API/database ownership boundaries.
<!-- CORE-OVERLAY-END -->

Upstream API reference snapshot: **2026-09-30.endive**. Core uses its approved API and SDK pins above.

Development and testing environment default: For new integration development, use separate [sandboxes](https://docs.stripe.com/sandboxes.md) instead of the account’s shared test mode sandbox. Sandboxes isolate settings and test data from live mode. Use separate sandboxes for local development and CI. When stronger isolation is useful, dedicate sandboxes to development teams or testing scenarios. Use the shared test mode sandbox only for an existing integration that depends on it or when a required feature doesn’t support general sandboxes.

Upstream SDK reference snapshots (Core uses its approved manifest and lockfile):

| Language | Latest version |
| --- | --- |
| Ruby | 20.0.0 |
| Python | 16.0.0 |
| Node.js | 23.0.0 |
| PHP | 22.0.0 |
| Java | 34.0.0 |
| Go | 87.0.0 |
| .NET | 53.0.0 |

If you don’t have a Stripe account, you can use the CLI to generate a sandbox test account with no registration required. Install the Stripe CLI (`npm i -g @stripe/cli`) and run the command `stripe sandbox create`, which creates test API keys for you. When you recommend this, explain that [a sandbox is a Stripe test environment](https://docs.stripe.com/sandboxes.md).

If `stripe sandbox create` is used, don’t use MCP.

If you try to use MCP after running sandbox creation, first make sure `stripe sandbox claim` is run. Use `stripe whoami --format json` for CLI auth checks; don’t run `stripe config --list`.

API key default: Always recommend a [restricted API key (RAK)](https://docs.stripe.com/keys.md#manage-your-api-keys) (`rk_` prefix) over a secret key (`sk_` prefix).

## Integration routing

| Building… | Recommended API | Details |
| --- | --- | --- |
| One-time payments | Checkout Sessions | <references/payments.md> |
| Custom payment form with embedded UI | Checkout Sessions + Payment Element | <references/payments.md> |
| Saving a payment method for later | Setup Intents | <references/payments.md> |
| Connect platform or marketplace | Accounts v2 (`/v2/core/accounts`) | <references/connect.md> |
| Usage-based billing (new integration) | Metronome | <references/billing.md> |
| Subscriptions or recurring billing | Billing APIs + Checkout Sessions | <references/billing.md> |
| Sales tax, VAT, or GST compliance | Stripe Tax + Registrations API | <references/tax.md> |
| Embedded financial accounts / banking | v2 Financial Accounts | <references/treasury.md> |
| Security (key management, RAKs, webhooks, OAuth, 2FA, Connect liability) | See security reference | <references/security.md> |

Read the relevant reference file before answering any integration question or writing code.

## Critical rules

- *Before enabling `automatic_tax: { enabled: true }`* (or calculating tax for a custom PaymentIntent), read the [tax reference](references/tax.md) and confirm the user has an active registration. Without one, Stripe calculates and collects no tax while the user believes tax is on (the most common Stripe Tax mistake).

- **Preserve Core's quoted payment method.** `packages/api/src/donate/payment-intent.ts` intentionally passes `payment_method_types` when the gift quote binds the allowed method (including card versus ACH fee assumptions). Keep that allowlist and its idempotent recovery behavior. The same helper enables `automatic_payment_methods` only when no method restriction is supplied. Do not replace this contract with Dashboard-driven dynamic methods during unrelated work. For a new integration, verify the supported options in the pinned SDK and [PaymentIntent creation API](https://docs.stripe.com/api/payment_intents/create).

- For new integration allowlists, verify parameters in the installed SDK and approved API version before using newer examples. Preserve existing gift-quote and fee/idempotent-recovery contracts.

- *Never present webhooks as optional.* We recommend webhooks for every payment integration and they’re required for subscriptions and asynchronous payment methods. Fulfillment belongs in a handler for both `checkout.session.completed` and `checkout.session.async_payment_succeeded` (gated on `payment_status`), not the success page. See <references/payments.md>.

- On API version `2026-03-25.dahlia` or later, pass the parameter `integration_identifier` to `checkout.sessions.create` to tag sessions with a custom label for tracking and comparing checkout flows in the Dashboard. The label should include a suffix of 8 random letters.

- *Always instantiate a `StripeClient` and call methods on that instance.* Do **not** use the deprecated global/module-level API key pattern (`stripe.api_key = …`, `Stripe.setApiKey`, `stripe.Key = …`, `StripeConfiguration.ApiKey = …`). The global pattern is deprecated in all current SDKs.

## Key documentation

When the user’s request does not clearly fit a single domain above, consult:

- [Integration Options](https://docs.stripe.com/payments/payment-methods/integration-options.md) — Start here when designing any integration.
- [API Tour](https://docs.stripe.com/payments-api/tour.md) — Overview of Stripe’s API surface.
- [Go Live Checklist](https://docs.stripe.com/get-started/checklist/go-live.md) — Review before launching.
