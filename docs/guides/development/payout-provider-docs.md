# Payout Provider Documentation Register

Last verified: 2026-05-02

This register records the official provider documentation used for Mission Control Payouts Phase 0. It is factual planning documentation only. Do not store provider credentials, API keys, webhook secrets, or tenant account identifiers here.

Nia documentation indexing was started for the official provider roots on 2026-05-02, but the sources were still processing during this Phase 0 pass. The notes below are based on direct reads of official provider documentation and provider search results.

## Wise

Official docs read:

- [Wise API docs home](https://docs.wise.com/api-docs/)
- [Getting started: API access, environments, and security](https://docs.wise.com/api-docs/getting-started)
- [Partner account guide: authentication, environments, and setup](https://docs.wise.com/api-docs/guides/partner-account)
- [User access tokens](https://docs.wise.com/guides/developer/auth-and-security/user-access-token)
- [API environments](https://docs.wise.com/guides/developer/environments)
- [OAuth token API](https://docs.wise.com/api-reference/oauth-token)
- [Quotes API](https://docs.wise.com/api-docs/api-reference/quote)
- [Recipient accounts API](https://docs.wise.com/api-reference/recipient)
- [Transfers API](https://docs.wise.com/api-docs/api-reference/transfer)
- [Transfer tracking guide](https://docs.wise.com/guides/product/send-money/tracking-transfers)
- [Webhook event types](https://docs.wise.com/api-docs/webhooks-notifications/event-types)
- [Transfer webhook guide](https://docs.wise.com/guides/product/send-money/use-cases/correspondent/webhooks.md)
- [Webhook subscriptions API](https://docs.wise.com/api-docs/api-reference/webhook)
- [Transfer receipt API](https://docs.wise.com/api-reference/transfer/transferreceiptget)
- [Transfer payout information API](https://docs.wise.com/api-reference/transfer/transferpayoutinfoget.md)
- [Balances API](https://docs.wise.com/api-docs/api-reference/balance)

Stale or moved URLs from the v7 source spec:

- `https://docs.wise.com/api-docs/guides/authentication` returned 404 during Phase 0.
- `https://docs.wise.com/api-docs/features/webhooks-notifications` returned 404 during Phase 0.
- `https://docs.wise.com/api-docs/guides/sandbox` returned 404 during Phase 0.

Capability notes:

- Wise supports quotes, recipient accounts, transfers, balances, transfer status tracking, webhook subscriptions, transfer receipt PDFs, and payout banking information where available.
- A quote is required to create a transfer. The quote response locks the mid-market exchange rate for 30 minutes according to the quote API docs.
- Wise transfer status uses API states such as `incoming_payment_waiting`, `incoming_payment_initiated`, `processing`, `funds_converted`, `outgoing_payment_sent`, `cancelled`, `funds_refunded`, `bounced_back`, `charged_back`, and `unknown`.
- Receipt PDFs are available for transfers in `outgoing_payment_sent` status through `GET /v1/transfers/{transferId}/receipt.pdf`.
- Banking partner payout information can include delivery mode, banking partner reference, banking partner name, and `mt103` if available.

Authentication model:

- Wise supports personal API tokens for small business automation of a single Wise account and OAuth 2.0 for partners and enterprises.
- OAuth token flows include `client_credentials`, `authorization_code`, `registration_code`, and `refresh_token`, depending on integration model.
- User access tokens are used for profile-level requests and expire after 12 hours.
- Mission Control must keep all Wise API tokens server-side and tenant-owned.

Sandbox model:

- Sandbox and production are separate environments.
- Sandbox base URL: `https://api.wise-sandbox.com`.
- Production base URL: `https://api.wise.com`.
- mTLS endpoints also exist and should be considered during partner onboarding.
- Wise states that sandbox does not support real money transfers, actual financial controls, all currency routes, or production-like latency/coverage.
- Simulation APIs exist for money movement flows and webhook testing.

Beneficiary requirements:

- Recipient account requirements are route-specific and vary by country, currency, source, target, amount, and transfer route.
- Recipient IDs are cross-compatible across Wise v1 and v2 recipient endpoints.
- Mission Control must fetch requirements from Wise and must not hardcode route-specific fields.

Quote flow:

- Create a quote with source/target currencies, amount side, amount, and sending profile.
- Use the quote when creating a transfer.
- The quote API docs state the rate is locked for 30 minutes, but implementation should use provider response fields rather than hardcoded timers.

Conversion flow:

- Wise quotes combine FX and transfer context for send-money flows. Mission Control should treat Wise as a quote-plus-transfer flow, not as a separate independent conversion resource unless later Wise docs require it for a tenant integration model.

Payout flow:

- Create recipient account.
- Create quote.
- Create transfer from quote and target account.
- Fund the transfer from Wise balance or another Wise-supported funding path.
- Track transfer state via API and webhooks.

Proof and receipt support:

- Transfer receipt PDF endpoint is available for `outgoing_payment_sent`.
- Payout information endpoint can expose banking partner reference and MT103 when available.

Webhooks:

- Transfer events include `transfers#state-change`, `transfers#payout-failure`, and `transfers#refund`.
- Balance events include `balances#update`.
- Events can be profile-level and/or application-level depending on event type.
- Wise warns events may arrive out of order; use `data.occurred_at` when reconciling order.

SCA, MFA, or provider approval:

- Wise partner onboarding and some funding flows can involve additional security, verification, or SCA/funding steps.
- Exact SCA behavior for tenant-owned Wise Business accounts is `needs provider confirmation`.

Known shortcomings:

- Sandbox coverage differs from production.
- Some routes require extra fields or may be unsupported.
- Funding Wise may add time/cost that is not captured by the Wise quote itself.
- Current tenant auth model, personal token vs OAuth, is `needs provider confirmation`.

## Airwallex

Official docs read:

- [Airwallex docs home](https://www.airwallex.com/docs)
- [API introduction](https://www.airwallex.com/docs/api)
- [API access](https://www.airwallex.com/docs/api/authentication/api_access)
- [Sandbox environment overview](https://www.airwallex.com/docs/developer-tools/sandbox-environment/sandbox-environment-overview.md)
- [Payout network](https://www.airwallex.com/docs/payouts/payout-network)
- [Create beneficiaries](https://www.airwallex.com/docs/payouts__create-beneficiaries)
- [Create a transfer](https://www.airwallex.com/docs/payouts__create-a-transfer)
- [Global Treasury create a transfer](https://www.airwallex.com/docs/global-treasury__create-a-transfer)
- [Create a conversion](https://www.airwallex.com/docs/transactional-fx__create-a-conversion)
- [Transfer statuses](https://www.airwallex.com/docs/payouts__create-a-transfer__transfer-statuses)
- [Generate a confirmation letter](https://www.airwallex.com/docs/payouts__create-a-transfer__generate-a-confirmation-letter)
- [Transfer webhook event types](https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events/event-types/transfers)
- [Transfer webhook payload examples](https://www.airwallex.com/docs/developer-tools/webhooks/listen-for-webhook-events/payload-examples/transfers)
- [Payout integration checklist](https://www.airwallex.com/docs/payouts/test-and-go-live/integration-checklist)

Stale or moved URLs from the v7 source spec:

- `https://www.airwallex.com/docs/transactional-fx` returned 404 during Phase 0. The current navigable overview is linked from Airwallex docs as `/docs/transactional-fx/overview`, and the conversion guide was accessible at `https://www.airwallex.com/docs/transactional-fx__create-a-conversion`.

Capability notes:

- Airwallex supports local and SWIFT payouts to bank accounts in over 200 countries/regions and over 90 currencies, plus some digital wallet payouts.
- Airwallex transfer creation supports saved `beneficiary_id` or direct beneficiary details.
- Airwallex supports dynamic API schema and form schema for route-specific beneficiary and transfer fields.
- Airwallex transfer responses include `amount_beneficiary_receives`, `amount_payer_pays`, fee fields, funding status, transfer method, references, source currency, transfer currency, and conversion data when applicable.
- Confirmation letters can be generated as PDFs in `STANDARD` or `NO_FEE_DISPLAY` formats.

Authentication model:

- API key and Client ID are managed in the Airwallex web app.
- Obtain an access token with `POST /api/v1/authentication/login` using `x-client-id` and `x-api-key`.
- Subsequent API calls use `Authorization: Bearer {{ACCESS_TOKEN}}`.
- Platform accounts can call on behalf of connected accounts using `x-on-behalf-of`, but tenant-owned account setup must be confirmed before implementation.

Sandbox model:

- Sandbox host: `https://api-demo.airwallex.com/api/v1/`.
- Production host: `https://api.airwallex.com/api/v1/`.
- Sandbox is separate from production and provides test API keys, simulated transactions, and webhook configuration.
- Standard sandbox access excludes Connected Account APIs; connected-account testing requires contacting Airwallex Sales.

Beneficiary requirements:

- Required beneficiary fields vary by country, currency, transfer method, local clearing system, and beneficiary type.
- Use dynamic schema APIs, API schema, and form schema. Do not hardcode country bank details.
- Beneficiary type can be `BANK_ACCOUNT` or `DIGITAL_WALLET`; entity type can be `PERSONAL` or `COMPANY`.
- Address fields vary by address country and P.O. boxes may be disallowed.

Quote flow:

- Transactional FX supports current rates and guaranteed quotes.
- Quote validity options include 1 minute, 15 minutes, 30 minutes, 1 hour, 4 hours, 8 hours, and 24 hours.
- Quote responses include `quote_id`, `valid_from_at`, `valid_to_at`, currencies, amounts, rates, and validity.
- Transfer creation can use `quote_id` to fix the conversion rate, but Airwallex docs state quotes cannot be applied when creating and submitting a transfer for approval.

Conversion flow:

- Create a quote or use current rates.
- Create a conversion with buy/sell currencies, one amount side, `request_id`, and optionally `quote_id`.
- If no `quote_id` is supplied, Airwallex executes at current market rate.
- Wallet is the default funding source, with linked-account funding support in documented cases.

Payout flow:

- Prepare beneficiary data from dynamic schema.
- Create saved beneficiary or pass beneficiary directly.
- Create transfer with `transfer_amount` or `source_amount`, transfer currency, source currency, transfer method, reason, reference, request ID, quote ID or `lock_rate_on_create` where applicable.
- Retrieve transfer by ID and use webhooks for status transitions.

Proof and receipt support:

- Create confirmation letter API returns a PDF stream.
- `NO_FEE_DISPLAY` can support missionary-safe proof without fee disclosure.
- Transfer retrieval exposes references such as `short_reference_id` and dispatch details when available.

Webhooks:

- Transfer events include `payout.transfer.in_approval`, `approval_recalled`, `approval_rejected`, `approval_blocked`, `scheduled`, `overdue`, `processing`, `sent`, `paid`, `failed`, and `cancelled`.
- Funding events include `payout.transfer.funding.requires_funding_confirmation`, `scheduled`, `processing`, `funded`, `failed`, `cancelled`, and `reversed`.

SCA, MFA, or provider approval:

- Airwallex transfer approval workflows can put transfers in `IN_APPROVAL`.
- Funding may require confirmation, and risk/RFI review can require additional information.
- Tenant account capabilities, approval configuration, and API permissions are `needs provider confirmation`.

Known shortcomings:

- Not every account has every payout, FX, Global Treasury, wallet, or connected-account capability.
- Some corridors support SWIFT only.
- Some proof details depend on transfer state and route.
- Connected-account testing requires provider confirmation.

## Currencycloud

Official docs read:

- [Developer portal](https://developer.currencycloud.com/)
- [API reference](https://developer.currencycloud.com/api-reference/)
- [Authentication guide](https://developer.currencycloud.com/guides/integration-guides/authentication/)
- [Making simple payments](https://developer.currencycloud.com/guides/integration-guides/make-simple-payments/)
- [Pay beneficiary using funds in a different currency](https://developer.currencycloud.com/guides/integration-guides/pay-beneficiary-funds-different-currency/)
- [Confirmation of Payee / beneficiary verification guide](https://developer.currencycloud.com/guides/integration-guides/verifying-beneficiary-account)
- [SCA for API payments](https://developer.currencycloud.com/guides/integration-guides/sca_sponsored_api_payments)
- [Push notifications / webhooks](https://developer.currencycloud.com/guides/platform-specifics/push-notifications)

Capability notes:

- Currencycloud exposes balances, detailed rates, conversions, beneficiary requirements, beneficiary creation, beneficiary validation, account verification, payment validation, payment creation, payment authorisation, payment confirmation, payment submission information, payment tracking, and push notifications.
- Payments cannot be made in one currency and received in another. Convert funds first, then create a payment in the payment currency.
- Payment creation may queue a payment; it does not prove funds have left.
- `unique_request_id` is available to prevent duplicate payments.

Authentication model:

- Login ID and API key are exchanged for a temporary `auth_token`.
- API calls use the `X-Auth-Token` header.
- Auth tokens expire after 30 minutes of inactivity.
- Logout endpoint can close sessions early.

Sandbox model:

- Demo base URL: `devapi.currencycloud.com`.
- Production base URL: `api.currencycloud.com`.
- The different-currency payment guide states that the conversion-plus-payment functionality described is available only via live API, not demo API. Sandbox proof of this exact flow is `needs provider confirmation`.

Beneficiary requirements:

- Use `GET /v2/reference/beneficiary_required_details` for route-specific beneficiary requirements.
- Requirements vary by currency, bank account country, payment type, and entity type.
- In-scope Sponsored or Treasury clients contracted with The Currency Cloud Limited may need beneficiary account verification before creating or updating a beneficiary.

Quote flow:

- Detailed rates can be fetched before creating a conversion.
- API reference also exposes Create Held Rate Quote.
- Quote/held-rate usage for Mission Control quote comparison is `needs provider confirmation` for the tenant account model.

Conversion flow:

- Check balances.
- Fetch detailed rates.
- Create a conversion with buy currency, sell currency, amount, fixed side, reason, and term agreement.
- A conversion can be linked to a payment by passing `conversion_id`; the payment waits until conversion settlement.

Payout flow:

- Check balance in payment currency.
- Fetch beneficiary requirements.
- Create or find beneficiary.
- Fetch payer requirements.
- Validate payment where needed.
- Create payment with currency, beneficiary ID, amount, reason, payment type, reference, `unique_request_id`, and optional `conversion_id`.
- Authorise payment where SCA applies.

Proof and receipt support:

- API reference includes payment confirmation, payment submission information, and payment tracking.
- Payment submission information can return MT103 or pacs.008 for SWIFT payments.

Webhooks:

- Push notifications/webhooks are configured by contacting a Solutions Manager.
- Payment notification types include ready-to-send, payment released, and payment failed.
- Notifications include a header/body payload and HMAC digest header.

SCA, MFA, or provider approval:

- In-scope API payment clients must apply SCA.
- Flow: validate payment, receive SCA headers, collect OTP, then create payment with `x-sca-id` and `x-sca-token`.
- OTP/SCA validity and who receives OTP depend on account configuration.

Known shortcomings:

- Demo API may not support the full conversion-plus-payment flow.
- CoP/VoP and account verification access is restricted to in-scope UK/EU clients and requires provider confirmation.
- Purpose code requirements are route-specific and must be fetched, not hardcoded.

## Corpay Cross-Border

Official docs read:

- [Corpay Cross-Border product](https://www.corpay.com/cross-border)
- [Corpay technology overview](https://www.corpay.com/cross-border/technology)
- [Corpay Cross-Border API page](https://www.corpay.com/cross-border/technology/cross-border-api)
- [Corpay NGOs page](https://www.corpay.com/industries/ngos)
- [Corpay developer docs: 2-token auth](https://developer.crossborder.corpay.com/apidocscrossborder/2-token-auth/webhooks)
- [Corpay developer docs: API introduction / payment tracking section](https://developer.crossborder.corpay.com/apidocscrossborder/payment-tracking-1)
- [Corpay developer docs: book deal](https://developer.crossborder.corpay.com/apidocscrossborder/spot-workflow-1/post-2-book-deal)
- [Corpay developer docs: webhooks](https://developer.crossborder.corpay.com/apidocscrossborder/webhooks)
- [Corpay developer docs: payment channel information](https://app.theneo.io/corpay/apidocscrossborder/payment-tracking/get-payment-channel-information)

Capability notes:

- Public Corpay pages confirm cross-border payment technology, quotes, liquidity purchase, payee preparation, payment sending, bulk upload, mass payments, payment validation, payment tracking, webhooks, SWIFT gpi, real-time MT103s, multi-currency stored value, tiered permissions, and API integration.
- Public developer docs found during Phase 0 identify Cross-Border API v1.8, HATEOAS responses, 2-token auth, beneficiary workflow, spot workflow, payment tracking, webhooks, and payment channel information.
- Corpay spot quote booking uses a 10-second validity window for `POST Spot Rate` quotes before `POST Book Deal`.

Authentication model:

- Corpay Cross-Border API uses OAuth 2.0 style two-token auth with HS256-signed JWT exchanged for a `CMG-AccessToken`.
- Partner-level and client-level token flows exist.
- JWT `aud` must be `cambridgefx`; recommended JWT expiry is approximately current time plus 20 minutes.
- Exact issuer, signing key, partner/client hierarchy, and tenant credential model are `needs provider confirmation`.

Sandbox model:

- Corpay public API page states production preparation happens via sandbox for development, QA, and integration testing.
- Fetched developer introduction page displayed empty production/sandbox base URL fields.
- Sandbox enrollment, base URLs, credentials, Postman collection access, payment file specs, and support contacts are `needs provider confirmation`.

Beneficiary requirements:

- Developer navigation includes search beneficiary, delete beneficiary, view beneficiary, create/edit beneficiary, beneficiary rules, regions, beneficiary validation, purpose of payment, IBAN validation, and bank search.
- Exact request/response schemas and tenant route-specific validation rules are `needs provider confirmation`.

Quote flow:

- Spot workflow includes spot rate, book deal, and instruct deal.
- Book Deal uses `quoteId` from Spot Rate.
- Quote expires after 10 seconds; late booking returns quote-expired status and requires a new quote.
- Indicative rate, quotes, and rate resource endpoints appear in developer navigation.

Conversion flow:

- Corpay spot workflow books a deal before instructing payment.
- Exact relationship between deal booking, settlement account, MCA balance, and payment instruction is `needs provider confirmation`.

Payout flow:

- Full API mode should validate/create beneficiary, fetch purpose values, fetch spot or mass payment quote, book deal, instruct deal, then track payment.
- Manual/export mode must remain available until full API access is confirmed.

Proof and receipt support:

- Payment Channel Information can return MT103 or pacs.008 messages when payment method is wire and the payment has exited Corpay bank account en route to the beneficiary.
- MCA balance and EFT methods may return blank channel information.
- Payment instruction ID is required to retrieve channel information.

Webhooks:

- Public developer docs state webhooks can notify events such as payment processed, funds received, or client onboarded.
- Sample payload includes `EventType`, `CreatedDate`, `ClientCode`, `Id`, and `MessageId`.
- `Corpay-Signature` header uses timestamp plus SHA1 HMAC style signature; exact validation method/key is shared during implementation.

SCA, MFA, or provider approval:

- Public technology page references multi-factor authentication, tiered permission, and approval models.
- Exact provider-side approval or MFA behavior for API payments is `needs provider confirmation`.

Known shortcomings:

- Corpay API access appears account-managed.
- Public docs are incomplete for implementation without provider-provided credentials, schemas, base URLs, and support guidance.
- Short quote expiry requires tight UI and API safety windows.
- Full API mode must be capability-gated; manual/export mode is required fallback.

## Stripe Global Payouts / Treasury

Official docs read:

- [Global Payouts overview](https://docs.stripe.com/global-payouts)
- [Recipient creation options](https://docs.stripe.com/global-payouts/recipient-creation-options)
- [Stripe-hosted recipient creation](https://docs.stripe.com/global-payouts/stripe-hosted-recipient-creation)
- [API recipient creation](https://docs.stripe.com/global-payouts/api-recipient-creation)
- [Send money](https://docs.stripe.com/global-payouts/send-money)
- [Manage payouts](https://docs.stripe.com/global-payouts/manage-payouts)
- [Pricing](https://docs.stripe.com/global-payouts/pricing)
- [Fund your storage balance](https://docs.stripe.com/global-payouts/fund-balance)
- [Compare Global Payouts with Connect](https://docs.stripe.com/global-payouts/compare-with-connect)
- [Treasury overview](https://docs.stripe.com/treasury)
- [Webhooks](https://docs.stripe.com/webhooks)

Capability notes:

- Global Payouts is available in US and GB according to overview docs.
- Global Payouts can send money directly to third parties in local currency and can be funded from external funds or Stripe payments balance.
- Current docs use API v2 preview surfaces such as Accounts v2, Account Links v2, Outbound Setup Intents, Payout Methods, Financial Accounts, and Outbound Payments.
- Cross-border payouts for US senders are public preview.
- Treasury is limited public preview and only available for some Stripe users.
- Stripe docs contain both "more than 50 countries" and "more than 90 countries" wording. Mission Control must use the current supported recipient table and tenant capability checks rather than broad marketing counts.

Authentication model:

- Uses tenant-owned Stripe secret key and Stripe API version/preview headers.
- Current Global Payouts examples use `Stripe-Version: 2026-04-22.preview`.
- Some API v2 requests require `Stripe-Context` with the recipient Account ID.
- This adapter must remain isolated from the existing donation Stripe integration.

Sandbox model:

- Stripe test mode can exercise API flows, but account capability access for Global Payouts and Treasury must be enabled.
- Global Payouts/Treasury tenant access is `needs provider confirmation`.

Beneficiary requirements:

- Recipients are Accounts v2 with `identity.country`, `identity.entity_type`, `contact_email`, `display_name`, and requested `configuration.recipient.capabilities`.
- Payout methods include local bank, bank wire, and cards where supported.
- Requirements vary by sender country, recipient country, business type, and payout method.
- Hosted forms can collect recipient information and payout method credentials directly with Stripe.

Quote flow:

- Dashboard cross-border review can show updated rate, estimated payout amount, and fees; the review page rate is finalized.
- Public API docs read during Phase 0 did not expose a standalone firm FX quote endpoint for all Global Payouts API flows.
- Treat API quote support as estimate/formula-based unless a tenant-enabled Stripe endpoint confirms firm quotes. This is `needs provider confirmation`.

Conversion flow:

- Global Payouts send-money flow handles local-currency recipient payouts and pricing includes FX fees for cross-border conversions.
- Treasury supports instant currency conversion in limited contexts, but use with Global Payouts for tenant routes is `needs provider confirmation`.

Payout flow:

- Fund storage balance or financial account.
- Create or identify recipient Account v2.
- Ensure recipient capability status is `active`.
- Create/list payout methods.
- Create OutboundPayment with financial account, recipient, optional payout method, amount minor units, and currency.
- Inspect OutboundPayment status by API and webhooks.

Proof and receipt support:

- Manage payouts docs state an itemized receipt can be viewed and retrieved through `receipt_url`.
- Trace ID may be available for posted payouts and can be shared with recipient banks.
- Proof format is more limited than MT103/pacs.008 provider flows and may require generated Mission Control proof packets.

Webhooks:

- Global Payouts events include `outbound_payment.created` and `outbound_payment.{{new_status}}`, including `outbound_payment.posted`, `outbound_payment.failed`, `outbound_payment.canceled`, and `outbound_payment.returned`.
- Hosted recipient forms trigger `v2.core.account_link.returned` when an AccountLink process completes.
- Stripe webhooks require raw body signature verification with endpoint secret.

SCA, MFA, or provider approval:

- Funding storage balance requires administrator access and Stripe requires two-factor authentication to add money for payouts.
- Tenant access, nonprofit/restricted-business review, Global Payouts approval, Treasury approval, and preview enrollment are `needs provider confirmation`.

Known shortcomings:

- Preview API version and capability access must be isolated.
- Global Payouts availability is limited by sender country, recipient country, route, capability, and account enablement.
- Firm quote availability is uncertain in public API docs.
- Cross-border reversals are not supported according to manage-payouts docs.
- Scheduled payouts and custom statement descriptors are private preview.
