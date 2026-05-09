# Payout Provider Sandbox Runbook

Last verified: 2026-05-02

This runbook defines the minimum sandbox and dry-run evidence future Mission Control Payouts phases must collect before provider execution is enabled. Do not add secrets to this file. Use tenant-owned sandbox accounts and store credentials only in approved secret storage.

## Global Rules

- Use provider-owned sandbox or test mode only until launch gates pass.
- Do not use real beneficiary bank details in sandbox.
- Use provider simulation APIs where available.
- Keep provider execution behind feature flags and tenant/provider capability gates.
- Every sandbox test must record provider account owner, environment, route, currency pair, rail, beneficiary type, quote expiry, provider reference IDs, webhook IDs, and proof artifacts.
- If a provider cannot expose sandbox behavior for a route, mark it `needs provider confirmation` and keep execution disabled.

## Wise

Docs:

- [API environments](https://docs.wise.com/guides/developer/environments)
- [Getting started](https://docs.wise.com/api-docs/getting-started)
- [Transfer tracking](https://docs.wise.com/guides/product/send-money/tracking-transfers)

Environment:

- Sandbox API: `https://api.wise-sandbox.com`
- Sandbox UI: `https://wise-sandbox.com`
- Production API: `https://api.wise.com`

Setup steps:

1. Confirm tenant-owned Wise integration model: personal API token or OAuth partner/enterprise flow.
2. Obtain sandbox credentials from Wise or create tenant sandbox account through Wise onboarding.
3. Create or identify a business profile.
4. Configure webhook subscriptions for transfer state change, payout failure, refund, and balance update.
5. Use simulation APIs to move transfer states where supported.

Minimum test scenarios:

- Fetch profiles and select business profile.
- Fetch balances or funding source status.
- Fetch recipient requirements for at least one local route and one SWIFT/wire route where available.
- Create a recipient account with test details.
- Create exact-send and exact-receive quotes.
- Create a transfer from quote.
- Move transfer through sandbox state simulation: `processing`, `funds_converted`, `outgoing_payment_sent`, `bounced_back`, `funds_refunded`.
- Receive and dedupe transfer webhooks.
- Fetch receipt PDF after `outgoing_payment_sent`.
- Fetch payout banking partner information and record if MT103 is unavailable.

Known sandbox limits:

- Sandbox does not support real money transfers, actual financial controls, all currency routes, or production-like route behavior.
- Stable sandbox routes/currencies must be confirmed from current Wise docs during implementation.

## Airwallex

Docs:

- [Sandbox environment overview](https://www.airwallex.com/docs/developer-tools/sandbox-environment/sandbox-environment-overview.md)
- [Create beneficiaries](https://www.airwallex.com/docs/payouts__create-beneficiaries)
- [Create a transfer](https://www.airwallex.com/docs/payouts__create-a-transfer)
- [Transfer statuses](https://www.airwallex.com/docs/payouts__create-a-transfer__transfer-statuses)
- [Generate a confirmation letter](https://www.airwallex.com/docs/payouts__create-a-transfer__generate-a-confirmation-letter)

Environment:

- Sandbox API: `https://api-demo.airwallex.com/api/v1/`
- Production API: `https://api.airwallex.com/api/v1/`

Setup steps:

1. Create tenant-owned Airwallex sandbox account.
2. Generate sandbox Client ID and API key in Account > Developer > API keys.
3. Obtain access token with `x-client-id` and `x-api-key`.
4. Configure sandbox webhooks in the web app.
5. Confirm whether connected-account testing is needed; standard sandbox excludes Connected Account APIs.

Minimum test scenarios:

- Get current balances.
- Fetch dynamic beneficiary API schema and form schema for one local and one SWIFT route.
- Create a saved beneficiary.
- Create a current rate and guaranteed quote.
- Create conversion with `request_id`.
- Create transfer with saved `beneficiary_id`.
- Create same-currency transfer with no conversion.
- Create FX transfer with `quote_id` or `lock_rate_on_create` where route supports it.
- Simulate or observe transfer states: in approval, scheduled, overdue, processing, sent, paid, failed, cancelled.
- Observe funding states: requires funding confirmation, scheduled, processing, funded, failed, reversed.
- Generate confirmation letter in `STANDARD` and `NO_FEE_DISPLAY` formats.

Known sandbox limits:

- Connected Account APIs require contacting Airwallex Sales.
- Some routes support SWIFT only.
- Some transfers may require RFI or account approval behavior that is hard to simulate.

## Currencycloud

Docs:

- [Authentication](https://developer.currencycloud.com/guides/integration-guides/authentication/)
- [Making simple payments](https://developer.currencycloud.com/guides/integration-guides/make-simple-payments/)
- [Pay beneficiary using funds in a different currency](https://developer.currencycloud.com/guides/integration-guides/pay-beneficiary-funds-different-currency/)
- [SCA for API payments](https://developer.currencycloud.com/guides/integration-guides/sca_sponsored_api_payments)
- [Push notifications](https://developer.currencycloud.com/guides/platform-specifics/push-notifications)

Environment:

- Demo URL: `devapi.currencycloud.com`
- Production URL: `api.currencycloud.com`

Setup steps:

1. Create or receive demo account credentials.
2. Authenticate with login ID and API key to receive `auth_token`.
3. Configure push notification endpoint with Currencycloud Solutions Manager.
4. Confirm whether tenant is in scope for SCA, CoP, VoP, Sponsored, or Treasury service requirements.

Minimum test scenarios:

- Authenticate and close session.
- Fetch balances.
- Fetch detailed rates.
- Fetch beneficiary requirements for EUR/DE and GBP/GB routes where available.
- Verify beneficiary account for UK/EU test cases if account is in scope.
- Create beneficiary.
- Validate payment.
- Create same-currency payment with `unique_request_id`.
- Create conversion and link it to a payment when sell currency differs from payment currency.
- Test SCA flow: validate payment, collect/record SCA headers, create payment with SCA headers in sandbox if supported.
- Receive payment released and payment failed notifications.
- Fetch payment confirmation, payment submission information, and payment tracking.

Known sandbox limits:

- The different-currency guide states this functionality is available only via live API, not demo API. Conversion plus payment sandbox parity is `needs provider confirmation`.
- Push notifications require provider setup.
- SCA and verification availability are account/model dependent.

## Corpay

Docs:

- [Corpay Cross-Border API](https://www.corpay.com/cross-border/technology/cross-border-api)
- [2-token auth](https://developer.crossborder.corpay.com/apidocscrossborder/2-token-auth/webhooks)
- [Book deal](https://developer.crossborder.corpay.com/apidocscrossborder/spot-workflow-1/post-2-book-deal)
- [Webhooks](https://developer.crossborder.corpay.com/apidocscrossborder/webhooks)
- [Payment channel information](https://app.theneo.io/corpay/apidocscrossborder/payment-tracking/get-payment-channel-information)

Environment:

- Sandbox base URL: needs provider confirmation.
- Production base URL: needs provider confirmation.

Setup steps:

1. Request Corpay Cross-Border API workspace access, Postman collection, sandbox credentials, and tenant account enablement.
2. Confirm partner/client token hierarchy and JWT signing requirements.
3. Confirm client code, settlement accounts, MCA balances, wire/EFT capabilities, purpose lists, regions, and approval settings.
4. Configure webhook endpoint and obtain signature validation instructions.
5. Keep manual/export mode enabled until full API tests pass.

Minimum test scenarios:

- Manual mode: enter quote, generate export, update status, upload proof, audit every action.
- Authenticate partner-level and client-level token flows.
- Fetch beneficiary rules, regions, and purpose of payment values.
- Validate and create/edit/view beneficiary.
- Fetch spot rate.
- Book deal within the 10-second quote window.
- Instruct deal.
- Lookup orders and payment instruction ID.
- Track payment status.
- Fetch payment channel information and store MT103 or pacs.008 if returned.
- Receive webhook events and verify `Corpay-Signature`.

Known sandbox limits:

- Public docs confirm sandbox exists, but access is account-managed.
- Base URLs, credentials, test routes, file specs, webhook event catalog, and signature method are `needs provider confirmation`.

## Stripe Global Payouts / Treasury

Docs:

- [Global Payouts overview](https://docs.stripe.com/global-payouts)
- [Fund your storage balance](https://docs.stripe.com/global-payouts/fund-balance)
- [Recipient creation options](https://docs.stripe.com/global-payouts/recipient-creation-options)
- [Hosted recipient creation](https://docs.stripe.com/global-payouts/stripe-hosted-recipient-creation)
- [API recipient creation](https://docs.stripe.com/global-payouts/api-recipient-creation)
- [Send money](https://docs.stripe.com/global-payouts/send-money)
- [Manage payouts](https://docs.stripe.com/global-payouts/manage-payouts)
- [Treasury](https://docs.stripe.com/treasury)
- [Webhooks](https://docs.stripe.com/webhooks)

Environment:

- Stripe test mode for API behavior.
- Global Payouts and Treasury access are account/capability gated and `needs provider confirmation`.

Setup steps:

1. Confirm tenant Stripe account has Global Payouts and/or Treasury access.
2. Confirm required API version and preview header. Phase 0 docs showed `Stripe-Version: 2026-04-22.preview` in examples.
3. Create isolated payout Stripe client separate from existing donation Stripe client in future implementation.
4. Configure webhook endpoint and endpoint secret in test mode.
5. Confirm nonprofit/restricted-business review posture for the tenant.

Minimum test scenarios:

- Retrieve financial accounts/storage balance where enabled.
- Fund storage balance using test mode paths where supported.
- Create recipient Account v2.
- Inspect `requirements.entries` and capability status.
- Create hosted AccountLink and handle expiration/refresh/return URLs.
- Create payout method via Outbound Setup Intent or hosted form.
- List payout methods with `Stripe-Context`.
- Create OutboundPayment in minor units.
- Receive `outbound_payment.created`, posted, failed, canceled, and returned events where test mode supports it.
- Retrieve payout status, `receipt_url`, trace ID, transactions, and transaction entries.

Known sandbox limits:

- Global Payouts is available in US and GB; cross-border payouts for US senders are public preview.
- Treasury is limited public preview.
- Firm API quote availability is unconfirmed. Label Stripe quotes as estimates until a tenant-enabled API proves otherwise.
- Cross-border reversals are not supported by docs.

## Dry-run Record Template

Each provider dry-run should capture:

```text
Provider:
Tenant sandbox account owner:
Environment:
Date:
Route:
Source currency:
Target currency:
Exact side:
Amount:
Rail:
Beneficiary type:
Provider beneficiary ID:
Quote/rate ID:
Quote expiry:
Conversion ID:
Transfer/payment/outbound payment ID:
Idempotency key:
Webhook event IDs:
Provider status sequence:
Proof artifact:
Provider gaps:
Result:
```
