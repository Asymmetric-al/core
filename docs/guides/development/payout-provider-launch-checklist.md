# Payout Provider Launch Checklist

Last verified: 2026-05-02

This checklist defines the minimum gates before any Mission Control Payouts provider can move from documentation or sandbox mode to production execution. It is intentionally stricter than quote-only support because this feature moves tenant money.

## Global Launch Gates

No provider execution may be enabled until all global gates pass:

- [ ] Phase 1 server-only flags exist and default to safe/off values.
- [ ] `PAYOUTS_ENABLED` is true for the target environment and tenant before any payout route or UI is exposed.
- [ ] `PAYOUTS_EXECUTION_ENABLED` remains false until provider-specific sandbox and production launch gates pass.
- [ ] `PAYOUTS_SANDBOX_ONLY` remains true until production execution is explicitly approved.
- [ ] Provider quote visibility is gated separately from provider execution.
- [ ] Navigation and tile entries are either server-filtered or kept disabled until payout routes exist.
- [ ] Product owner confirms Phase 0 docs are current enough for implementation.
- [ ] Tenant legal sender model is confirmed in UI, API, audit logs, and provider account settings.
- [ ] Provider account belongs to the authenticated tenant.
- [ ] Provider credentials are stored server-side only and encrypted or delegated to approved secret storage.
- [ ] No provider credentials, ciphertext, full bank details, raw provider payloads, or provider balances are returned to client code except safe summaries.
- [ ] Feature flags or tenant settings can disable the provider globally and per tenant.
- [ ] Sandbox or fixture mode covers quote, beneficiary, execution, status, proof, failure, return, and duplicate-event cases.
- [ ] Webhook signature verification is implemented with raw request body.
- [ ] Webhook replay and duplicate event handling are tested.
- [ ] Provider status mapping handles unknown statuses as manual review.
- [ ] Provider funding source check is implemented or clearly labeled unavailable with finance confirmation.
- [ ] Internal approval and provider-side approval/auth are separate states.
- [ ] Idempotency keys are used for money movement where provider supports them.
- [ ] Manual rollback/disable procedure is documented.
- [ ] Missionary-visible data is filtered and proof visibility is explicit.

## Wise Launch Gates

- [ ] `PAYOUTS_WISE_ENABLED` is true only for environments where Wise quote/readiness work is intended.
- [ ] Wise execution remains blocked unless both `PAYOUTS_EXECUTION_ENABLED` and Wise-specific launch gates pass.
- [ ] Tenant auth model confirmed: personal API token or OAuth partner/enterprise.
- [ ] Tenant Wise profile selection is confirmed.
- [ ] Sandbox credentials and production credentials are separate.
- [ ] Recipient requirements are fetched dynamically for each route.
- [ ] Quote creation supports exact send and exact receive.
- [ ] Quote expiry uses provider response or current docs, not stale constants.
- [ ] Transfer creation includes required reference, purpose, source-of-funds, and legal entity fields when required.
- [ ] Funding method and funding status are represented clearly.
- [ ] Transfer statuses map to internal status model.
- [ ] Transfer webhooks are subscribed and verified.
- [ ] Payout failure and refund events are handled separately from state-change events.
- [ ] Receipt PDF retrieval works after `outgoing_payment_sent`.
- [ ] Banking partner payout info and MT103 availability are tested.
- [ ] SCA or external funding requirements are documented for this tenant.

Production blockers:

- [ ] Wise API production access and tenant business profile are approved.
- [ ] Required production routes and currencies are tested with provider-approved low-risk scenario.
- [ ] Any Wise account verification or deactivation webhook handling is documented.

## Airwallex Launch Gates

- [ ] `PAYOUTS_AIRWALLEX_ENABLED` is true only for environments where Airwallex quote/readiness work is intended.
- [ ] Airwallex execution remains blocked unless both `PAYOUTS_EXECUTION_ENABLED` and Airwallex-specific launch gates pass.
- [ ] Tenant Airwallex account capabilities are confirmed for Payouts, Wallet, Transactional FX, and Global Treasury if used.
- [ ] API key and Client ID are generated for sandbox and production separately.
- [ ] Access token lifecycle is implemented.
- [ ] Current balances can be read or funding limitation is displayed.
- [ ] Dynamic API schema and form schema drive beneficiary fields.
- [ ] Saved beneficiary creation is tested.
- [ ] Local and SWIFT route behavior is tested.
- [ ] Quote/current-rate/conversion flow is tested.
- [ ] Transfer creation supports saved `beneficiary_id`, `request_id`, `quote_id`, and `lock_rate_on_create` where eligible.
- [ ] Transfer approval states map to provider approval states.
- [ ] Funding states map to provider auth/funding states.
- [ ] Webhook event verification and dedupe are tested.
- [ ] Confirmation letter generation works in `STANDARD` and `NO_FEE_DISPLAY` formats.

Production blockers:

- [ ] Connected-account or platform use is confirmed by Airwallex if needed.
- [ ] Account Manager confirms allowed value dates, POBO, transfer methods, and reference display behavior for intended routes.
- [ ] RFI/risk review operational process is documented.

## Currencycloud Launch Gates

- [ ] `PAYOUTS_CURRENCYCLOUD_ENABLED` is true only for environments where Currencycloud quote/readiness work is intended.
- [ ] Currencycloud execution remains blocked unless both `PAYOUTS_EXECUTION_ENABLED` and Currencycloud-specific launch gates pass.
- [ ] Tenant Currencycloud account model is confirmed: house account, sub-account, Sponsored, Treasury, or other.
- [ ] Login ID/API key auth token lifecycle is implemented.
- [ ] Balance checks are available per payment currency.
- [ ] Beneficiary requirements are fetched per currency, bank country, payment type, and entity type.
- [ ] Beneficiary verification obligations are confirmed for UK GBP and EUR SEPA routes.
- [ ] Detailed rates and conversion creation are tested.
- [ ] Same-currency payment path does not create a conversion.
- [ ] Different-currency payout path creates conversion first, then payment in bought currency.
- [ ] Payment validation is called before create where required.
- [ ] SCA flow is implemented for in-scope accounts, including OTP collection and expiry handling.
- [ ] Payment creation uses `unique_request_id`.
- [ ] Payment confirmation, submission info, and tracking retrieval are tested.
- [ ] MT103 or pacs.008 storage is tested for SWIFT routes.
- [ ] Push notification HMAC verification and event setup are confirmed with Currencycloud.

Production blockers:

- [ ] Conversion plus payment behavior is verified with Currencycloud because docs state the different-currency guide is live API only.
- [ ] Solutions Manager configures push notifications for demo and production.
- [ ] Purpose code requirements and payer requirements are confirmed for target routes.

## Corpay Launch Gates

Manual/export mode gates:

- [ ] `PAYOUTS_CORPAY_ENABLED` is true only for environments where Corpay quote/readiness or manual/export planning is intended.
- [ ] Corpay execution remains blocked unless both `PAYOUTS_EXECUTION_ENABLED` and Corpay-specific launch gates pass.
- [ ] Manual quote entry records quote source, quote timestamp, expiry, finance user, and provider reference.
- [ ] Corpay-ready export file format is provider-confirmed.
- [ ] Manual status updates require audit reason.
- [ ] Manual proof upload is available and visibility-controlled.
- [ ] Manual mode is clearly labeled and cannot be mistaken for API execution.

Assisted/full API gates:

- [ ] Corpay confirms tenant/account API access, sandbox access, and production access.
- [ ] Corpay provides current docs, Postman collection, base URLs, support contacts, and file specs.
- [ ] Two-token auth is implemented with provider-confirmed issuer/signing key process.
- [ ] Beneficiary rules, regions, purpose of payment values, and validation are fetched from Corpay.
- [ ] Settlement accounts, MCA balances, and funding methods are confirmed.
- [ ] Spot Rate, Book Deal, and Instruct Deal flow is tested.
- [ ] 10-second quote expiry safety window is implemented.
- [ ] Payment tracking and lookup orders are tested.
- [ ] Payment Channel Information retrieval returns MT103/pacs.008 when eligible.
- [ ] Webhook events and `Corpay-Signature` validation are implemented from Corpay instructions.
- [ ] Provider-side MFA, approval, and permission workflow is documented.

Production blockers:

- [ ] Full API mode remains disabled until Corpay confirms tenant account type supports API send.
- [ ] Manual/export fallback remains available even after full API mode is enabled.

## Stripe Global Payouts / Treasury Launch Gates

- [ ] `PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED` is true only for environments where Stripe Global Payouts / Treasury quote/readiness work is intended.
- [ ] Stripe Global Payouts execution remains blocked unless both `PAYOUTS_EXECUTION_ENABLED` and Stripe-specific launch gates pass.
- [ ] Tenant Stripe account has Global Payouts access.
- [ ] Tenant Stripe account has Treasury access if Treasury funding is used.
- [ ] Required API version and preview headers are confirmed.
- [ ] Payout adapter is isolated from existing donation Stripe client.
- [ ] Recipient Accounts v2 creation is tested.
- [ ] Hosted AccountLink flow is tested, including 10-minute expiration and refresh URL.
- [ ] API recipient requirements are mapped from `requirements.entries`.
- [ ] Payout method creation/listing works with `Stripe-Context`.
- [ ] Storage balance, financial account, or payments balance funding path is confirmed.
- [ ] Funding status and receipt URLs are retrieved.
- [ ] OutboundPayment creation is tested in test mode or provider-approved environment.
- [ ] Payout statuses map to internal states: scheduled, processing, failed, canceled, posted, returned.
- [ ] Webhooks are verified with raw-body `Stripe-Signature`.
- [ ] Trace ID and `receipt_url` handling are tested.
- [ ] Stripe quote behavior is labeled estimate-only unless a firm quote API is confirmed.

Production blockers:

- [ ] Cross-border payouts public preview access is confirmed for tenant sender country.
- [ ] Nonprofit/restricted-business review is complete.
- [ ] Treasury limited-preview eligibility is confirmed if used.
- [ ] Cross-border reversal limitation is accepted by product and finance.

## Rollback and Disable Checklist

Before any provider launch, document how to:

- [ ] Set `PAYOUTS_ENABLED=false` to hide payout workflows.
- [ ] Set `PAYOUTS_EXECUTION_ENABLED=false` to preserve quote/readiness planning while blocking execution.
- [ ] Set provider-specific flags false to remove provider quote/readiness availability.
- [ ] Disable provider execution globally.
- [ ] Disable provider execution for a tenant.
- [ ] Keep provider quote-only mode while disabling send.
- [ ] Stop webhook processing without losing events.
- [ ] Reconcile in-flight payouts after disabling execution.
- [ ] Surface provider outage or degraded state to finance.
- [ ] Generate manual proof packets when provider proof retrieval fails.
- [ ] Export all affected payout records for provider support.
