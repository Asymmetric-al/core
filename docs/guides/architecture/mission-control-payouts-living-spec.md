# Mission Control Payouts Living Spec

Last updated: 2026-05-02

Status: Phase 0 documentation foundation. This document summarizes the Mission Control Payouts v7 product specification supplied in the Phase 0 task prompt and links to the provider documentation registers that future implementation phases must follow.

## Phase 0 Scope

Phase 0 is documentation-only work. It creates the local source of truth for future payout implementation and must not add provider integration code, database tables, credentials, migrations, feature flags, routes, or UI.

Related Phase 0 documents:

- [Provider documentation register](../development/payout-provider-docs.md)
- [Provider capability matrix](../development/payout-provider-capability-matrix.md)
- [Provider field mapping](../development/payout-provider-field-mapping.md)
- [Provider webhooks](../development/payout-provider-webhooks.md)
- [Provider sandbox runbook](../development/payout-provider-sandbox-runbook.md)
- [Provider launch checklist](../development/payout-provider-launch-checklist.md)

## Locked Product Decisions

These decisions are inherited from the Mission Control Payouts v7 spec and should not be changed unless the product owner explicitly updates the direction.

### Tenant-owned money movement

Each nonprofit tenant is the legal sender and account holder. The tenant brings its own Wise, Airwallex, Currencycloud, Corpay, or Stripe Global Payouts / Treasury account. Asymmetrical is the workflow and recordkeeping layer and must never hold, commingle, originate, or move funds from an Asymmetrical-owned provider account.

Implementation consequence for later phases:

- A provider must not appear as executable unless the authenticated tenant owns and has connected that provider account.
- Provider account ownership checks must run in both UI and API layers before quote, beneficiary sync, conversion, or payout execution.
- Provider credentials must remain server-only and encrypted or delegated to an approved secret store.

### Provider funding source is executable truth

Mission Control internal fund balances are accounting context, not proof that money can move. The executable source of truth is the tenant-owned provider account, provider balance, wallet, settlement account, Treasury account, storage balance, or connected bank funding source.

Implementation consequence for later phases:

- Quote and send flows must show internal accounting context separately from provider funding context.
- Provider-reported funding state must be checked when a provider exposes it.
- If provider balance or funding state cannot be retrieved, the UI must label the limitation and require finance confirmation.

### Universal beneficiary intake

The admin experience must gather beneficiary data once, store canonical fields once, and map that data into provider-specific beneficiary records or hosted provider forms.

Implementation consequence for later phases:

- Mission Control should store canonical beneficiary fields separately from provider requirement answers.
- Provider readiness is per provider, route, currency, country, entity type, and rail.
- A rejection or missing field from one provider must not block ready providers.
- Provider enum values, purpose codes, and dynamic field requirements must come from provider docs or APIs and must not be invented.

### Quote comparison must be honest

Finance staff must see provider eligibility, rate, fees, transfer cost, proof support, funding source, quote expiry, warnings, and provider-specific caveats before selecting a provider.

Implementation consequence for later phases:

- Same-currency payouts must be supported and must display "No currency exchange will be performed."
- FX flows must clearly say what currency is being sold and what currency is being bought.
- Estimate-only providers must be labeled as estimates.
- Expired quotes must not be selectable.
- Provider shortcomings must be visible, not hidden behind recommendation labels.

### Internal approval is separate from provider approval

Mission Control approval does not replace provider-side MFA, SCA, dashboard approval, risk review, funding confirmation, or account-managed authorization.

Implementation consequence for later phases:

- Internal states must distinguish `awaiting_approval`, `awaiting_provider_auth`, and `awaiting_provider_approval`.
- Provider execution must wait for provider confirmation, webhook, polling result, or an explicit audited manual confirmation when no API status exists.

### Missionary visibility is practical and filtered

Missionaries should see payouts linked to them, including pending and completed states when tenant settings allow. They should see practical bank-support information, not private finance details.

Missionary-visible by default:

- Status, dates, provider, provider reference, payment reference, amount sent, currency sold, amount intended or paid to recipient, currency received, exchange rate when FX occurred, same-currency indicator, safe finance notes, proof documents marked visible, and SWIFT/UETR/MT103/pacs.008/tracking details when available and safe.

Hidden by default:

- Provider credentials, provider balances, raw provider payloads, internal risk notes, approval IP/user-agent details, private donor restriction notes, and provider fees or spreads.

## Future Repo Architecture Constraints

The current repo rules shape future implementation:

- `packages/api/src/*` owns future business and database logic.
- `apps/*/app/api/*` route handlers must remain thin re-exports.
- Do not add App Router route segment config exports such as `runtime`, `dynamic`, or `revalidate` while `cacheComponents: true` is enabled.
- Shared UI must come from `@asym/ui`; do not create app-local shadcn primitives.
- Use TanStack Query for server state, TanStack Table for payout lists, and Zod for mutation inputs.
- Use Bun and existing Turbo scripts for validation.

## Provider Documentation Verification

Provider docs were verified on 2026-05-02 from public official sources. Nia documentation indexing was started for the official provider roots, but the sources were still in `processing` state during Phase 0, so direct official fetches and provider search results were used as the immediate evidence source.

Documentation gaps must be carried forward as launch blockers:

- Corpay API access is account-managed. Public docs confirm API, sandbox, webhook, authentication, spot booking, tracking, and channel information concepts, but tenant-specific API enablement, credentials, base URLs, account permissions, payment file specs, and production support details need provider confirmation.
- Stripe Global Payouts and Treasury use preview API surfaces for the current Global Payouts API flow. Tenant access, API version, preview header, and nonprofit/restricted-business approval must be confirmed per tenant.
- Currencycloud notes that the "pay beneficiary using funds in a different currency" guide is available only via live API, not demo API. Sandbox proof for conversion plus payment requires provider confirmation.
- Airwallex Connected Account API sandbox access is excluded from standard sandbox access and requires contacting Airwallex Sales if platform/connected-account flows are needed.
- Wise sandbox differs from production and does not support real money transfers, all routes, or production-like controls.

## Phase 0 Acceptance Checklist

- [x] Local docs exist for provider sources, capabilities, fields, webhooks, sandbox, and launch gates.
- [x] Every provider has a capability row and provider-specific notes.
- [x] Every provider has webhook/status mapping notes, including placeholders where provider confirmation is required.
- [x] Corpay account-managed uncertainty is documented.
- [x] Stripe preview limitations are documented.
- [x] No product code, database tables, migrations, credentials, or secrets were added.
