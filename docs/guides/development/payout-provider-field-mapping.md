# Payout Provider Field Mapping

Last verified: 2026-05-02

This document defines the Phase 0 field vocabulary for future Mission Control Payouts implementation. It does not define database tables or provider payload code. Provider enum values and route-specific values must be fetched from provider APIs or current docs during implementation.

## Canonical Field Groups

### Tenant provider account

| Canonical field            | Purpose                                                                           | Provider notes                                                                   |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `tenant_id`                | Tenant ownership boundary                                                         | Required for every future provider account and payout operation.                 |
| `provider`                 | Wise, Airwallex, Currencycloud, Corpay, Stripe, or manual                         | Use stable internal enum values; do not expose provider credentials client-side. |
| `display_name`             | Human-readable account label                                                      | Safe for UI.                                                                     |
| `legal_sender_name`        | Tenant legal sender label                                                         | Must match tenant-owned provider account where required.                         |
| `mode`                     | `sandbox`, `production`, or `manual`                                              | Provider-specific base URLs and behavior vary.                                   |
| `capabilities`             | Safe capability summary                                                           | Derived from provider docs/API checks.                                           |
| `funding_sources`          | Provider balances, wallet, settlement account, storage balance, bank funding path | Must not include full bank account numbers or secrets.                           |
| `last_balance_snapshot_at` | Funding freshness                                                                 | Required because provider funding is executable source of truth.                 |

### Canonical beneficiary

| Canonical field            | Purpose                                                                | Provider notes                                                               |
| -------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `legal_name`               | Beneficiary legal name                                                 | Split into first/last/company where provider requires it.                    |
| `display_name`             | Mission Control label                                                  | Safe UI label.                                                               |
| `email`                    | Contact and recipient requirements                                     | Required for Stripe recipients; optional or notification-related for others. |
| `phone`                    | Contact and route requirements                                         | Required for some Stripe recipient countries and provider routes.            |
| `beneficiary_type`         | `individual`, `church`, `nonprofit`, `business`, `other`               | Map to provider entity types; provider values differ.                        |
| `country`                  | Beneficiary country                                                    | Usually ISO country; provider route support depends on country.              |
| `address`                  | Street, city, region, postal code, country                             | Required varies by provider and route; P.O. boxes may be disallowed.         |
| `default_receive_currency` | Beneficiary default currency                                           | Must be route-validated.                                                     |
| `default_payment_purpose`  | Mission Control purpose category                                       | Map to provider-specific purpose/reason only after fetching provider values. |
| `linked_record`            | Missionary, fund, CRM, campaign, donor restriction, or external record | Internal linkage only; provider metadata only where safe.                    |

### Canonical bank and payout method

| Canonical field         | Purpose                                    | Provider notes                                                                     |
| ----------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `bank_country`          | Bank location                              | Required by Wise, Airwallex, Currencycloud, Stripe, Corpay route logic.            |
| `account_holder_name`   | Bank account name                          | Used by all bank-account providers.                                                |
| `account_number`        | Local account number                       | Store only where legally approved; prefer provider tokenization.                   |
| `iban`                  | IBAN routes                                | Required for many EUR/SEPA and international routes.                               |
| `bic_swift`             | SWIFT/BIC                                  | Required for many priority/wire routes.                                            |
| `routing_number`        | US routing/ABA                             | Provider-specific field names differ.                                              |
| `sort_code`             | UK local bank                              | Stripe Confirmation of Payee and Currencycloud UK flows may use it.                |
| `local_clearing_system` | Local rail marker                          | Airwallex uses values such as ACH in examples; exact values must come from schema. |
| `rail`                  | `local`, `swift`, `wire`, `card`, `wallet` | Provider mapping differs and must be route-validated.                              |
| `masked_account_label`  | Safe UI display                            | Never show full details to missionaries.                                           |

### Canonical payment context

| Canonical field            | Purpose                                            | Provider notes                                                                                 |
| -------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `reference`                | Recipient/bank statement reference where supported | Some rails may not display it; Airwallex says support depends on clearing system and partners. |
| `internal_memo`            | Internal Mission Control note                      | Do not send to provider unless explicitly mapped.                                              |
| `payment_purpose_category` | Internal purpose category                          | Map to provider `reason`, `purpose_code`, `transferPurpose`, or Corpay purpose values.         |
| `provider_purpose_code`    | Provider-specific required code                    | Must come from provider API/docs for route.                                                    |
| `source_of_funds`          | Route/compliance requirement                       | Wise and other providers may require it.                                                       |
| `payer_legal_entity_type`  | Sender legal entity type                           | Wise originator/legal entity and provider POBO flows may require this.                         |
| `payment_type`             | Regular/priority/local/SWIFT provider field        | Currencycloud distinguishes regular and priority payments.                                     |
| `charge_type`              | Fee responsibility                                 | Airwallex `fee_paid_by`/`swift_charge_option`, Corpay/SWIFT charge fields.                     |
| `invoice_number`           | Optional provider/compliance context               | Provider-specific.                                                                             |
| `supporting_document_ids`  | Internal document linkage                          | Provider upload requirements are `needs provider confirmation`.                                |

## Provider Mapping Notes

### Wise

| Canonical field            | Wise mapping                                    | Notes                                                                       |
| -------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| Tenant account             | Profile and token/OAuth context                 | Business profile ID selection required.                                     |
| Beneficiary                | Recipient account                               | Recipient requirement fields vary by route.                                 |
| Bank fields                | Recipient account details                       | Use Wise account requirements and recipient API.                            |
| Quote                      | Quote                                           | Quote is required to create transfer; docs state rate lock is 30 minutes.   |
| Transfer                   | Transfer                                        | Transfer is based on quote and target account.                              |
| `reference`                | Transfer details reference                      | Required support varies by route.                                           |
| `payment_purpose_category` | `transferPurpose` or sub-purpose where required | Exact values must be fetched from requirements.                             |
| `source_of_funds`          | Wise source of funds where required             | Route-specific.                                                             |
| `payer_legal_entity_type`  | Originator legal entity type where required     | Treat as first-class canonical field but provider values need confirmation. |
| Proof                      | Receipt PDF and payout information              | MT103 may be available in banking partner payout info.                      |

### Airwallex

| Canonical field    | Airwallex mapping                       | Notes                                                                                                                                      |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant account     | Account/client ID plus token            | Platform use can use `x-on-behalf-of`; tenant model needs confirmation.                                                                    |
| Beneficiary        | `beneficiary` or saved `beneficiary_id` | Saved beneficiary is preferred for reuse.                                                                                                  |
| Beneficiary type   | `BANK_ACCOUNT` or `DIGITAL_WALLET`      | Exact routes from dynamic schema.                                                                                                          |
| Entity type        | `PERSONAL` or `COMPANY`                 | Map canonical types carefully.                                                                                                             |
| Bank fields        | `beneficiary.bank_details`              | Required keys vary by country/currency/method/schema.                                                                                      |
| Address            | `beneficiary.address`                   | Required fields vary by address country.                                                                                                   |
| Quote              | FX quote/current rate                   | `quote_id` can fix conversion rate in eligible transfer creation.                                                                          |
| Conversion         | Conversion API                          | Can use `request_id` and optional `quote_id`.                                                                                              |
| Transfer           | Transfer API                            | Uses `transfer_amount` or `source_amount`, `transfer_currency`, `source_currency`, `transfer_method`, `reason`, `reference`, `request_id`. |
| Rail               | `transfer_method`                       | `LOCAL` or `SWIFT`; digital wallets also exist.                                                                                            |
| Purpose            | `reason`                                | Airwallex publishes accepted values, but implementation should fetch/verify for tenant route.                                              |
| Fee responsibility | `fee_paid_by`, `swift_charge_option`    | Provider-specific.                                                                                                                         |
| Proof              | Confirmation letter                     | `STANDARD` includes fees, `NO_FEE_DISPLAY` hides fees.                                                                                     |

### Currencycloud

| Canonical field          | Currencycloud mapping                           | Notes                                                                                                                        |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tenant account           | Login ID/API key auth token                     | Token expires after 30 minutes inactivity.                                                                                   |
| Balance                  | Balance endpoints                               | Payment currency balance must be checked.                                                                                    |
| Beneficiary requirements | `beneficiary_required_details`                  | Varies by currency, bank country, payment type, and entity type.                                                             |
| Beneficiary              | Beneficiary API                                 | May require account verification for in-scope UK/EU clients.                                                                 |
| Quote/rate               | Detailed Rates or Held Rate Quote               | Exact held quote use needs account confirmation.                                                                             |
| Conversion               | Conversion API                                  | Required before payment when sell currency differs from payment currency.                                                    |
| Payment                  | Payment API                                     | Fields include currency, amount, beneficiary ID, reason, payment type, reference, unique request ID, optional conversion ID. |
| `unique_request_id`      | Idempotency                                     | Required for duplicate protection.                                                                                           |
| Payment type             | `regular` or `priority`                         | Do not invent values beyond docs/API.                                                                                        |
| Purpose code             | Payment purpose codes endpoint                  | Send only when required.                                                                                                     |
| SCA                      | Validate Payment plus SCA headers               | Use `x-sca-id` and `x-sca-token` when required.                                                                              |
| Proof                    | Payment confirmation, submission info, tracking | Submission info may include MT103 or pacs.008.                                                                               |

### Corpay

| Canonical field | Corpay mapping                      | Notes                                                             |
| --------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Tenant account  | Partner/client token model          | Exact credential model is account-managed.                        |
| Beneficiary     | Bene template/workflow              | Public nav includes search, view, create/edit, rules, validation. |
| Region          | Regions endpoint                    | Required values need provider confirmation.                       |
| Purpose         | Purpose of Payment endpoint         | Must come from Corpay values.                                     |
| Quote           | Spot Rate, Quotes, Rate Resource    | Spot quote expires in 10 seconds before Book Deal.                |
| Conversion/deal | Book Deal                           | Deal number/order number terminology overlaps.                    |
| Payout          | Instruct Deal / payment instruction | Full flow needs provider confirmation.                            |
| Settlement      | Settlement accounts, MCA, wire/EFT  | Exact fields need provider confirmation.                          |
| Proof           | Payment Channel Information         | MT103/pacs.008 for wire after funds leave Corpay bank.            |
| Webhook ID      | `MessageId` in sample payload       | Use for idempotency if confirmed.                                 |

Manual/export fallback fields:

- Manual quote amount, rate, expiry, provider reference, export file, finance-entered status, proof upload, and audit reason.

### Stripe Global Payouts / Treasury

| Canonical field | Stripe mapping                                        | Notes                                                                                       |
| --------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Tenant account  | Stripe account and preview API version                | Keep isolated from donation Stripe client.                                                  |
| Funding source  | Storage balance, payment balance, financial account   | Funding requires 2FA/admin access in Dashboard docs.                                        |
| Recipient       | Accounts v2                                           | Requires country, entity type, email, display name, requested recipient capabilities.       |
| Requirements    | `requirements.entries`                                | Inspect entries that restrict capabilities.                                                 |
| Hosted form     | Account Links API                                     | AccountLink expires after 10 minutes and is single-use.                                     |
| Payout method   | Outbound Setup Intent / Payout Methods                | Use PayoutMethod ID for OutboundPayment.                                                    |
| Rail/capability | `bank_accounts.local`, `bank_accounts.wire`, `cards`  | Availability varies by recipient country.                                                   |
| Payout          | Outbound Payments API v2                              | Fields include financial account, recipient, optional payout method, amount value/currency. |
| Quote           | Estimate/pricing formula unless firm API confirmed    | Public docs do not prove a universal firm quote API.                                        |
| Proof           | `receipt_url`, trace ID                               | Trace ID can help recipient bank investigation.                                             |
| Webhook         | `outbound_payment.*`, `v2.core.account_link.returned` | Requires raw-body Stripe signature verification.                                            |

## Provider-specific Values Must Not Be Invented

Future implementation must fetch or verify these values instead of hardcoding:

- Wise transfer purposes, source-of-funds values, and originator legal entity values.
- Airwallex `reason`, transfer method availability, local clearing systems, dynamic bank fields, and form schema fields.
- Currencycloud purpose codes, payment types, payer requirements, verification outcomes, and SCA headers.
- Corpay purpose of payment, regions, settlement account types, method codes, quote/deal/payment instruction fields, and webhook signature rules.
- Stripe recipient capability requirements, payout method availability, preview API version, and Global Payouts/Treasury access flags.
