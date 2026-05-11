# Mission Control Payouts Living Spec

Last updated: 2026-05-02

Status: Phase 0 documentation foundation. This document is the local source of truth for the Mission Control Payouts v7 product direction supplied in the Phase 0 task prompt and links to the provider documentation registers that future implementation phases must follow.

## Phase 0 Scope

Phase 0 is documentation-only work. It creates the local source of truth for future payout implementation and must not add provider integration code, database tables, credentials, migrations, feature flags, routes, or UI.

Related Phase 0 documents:

- [Provider documentation register](../development/payout-provider-docs.md)
- [Provider capability matrix](../development/payout-provider-capability-matrix.md)
- [Provider field mapping](../development/payout-provider-field-mapping.md)
- [Provider webhooks](../development/payout-provider-webhooks.md)
- [Provider sandbox runbook](../development/payout-provider-sandbox-runbook.md)
- [Provider launch checklist](../development/payout-provider-launch-checklist.md)

## Phase 1 Architecture Foundation

Phase 1 adds only the safe feature-flag and planning scaffolding needed by later implementation phases. It does not add database schema, product routes, provider account settings, beneficiary workflows, quote comparison, payout execution, provider HTTP clients, or money movement behavior.

Patterns used:

- `AGENTS.md` and [Data Access Boundary](data-access-boundary.md): future business logic belongs in `packages/api/src/*`, and app API routes must remain thin re-exports.
- [Runtime Map](runtime-map.md): no App Router route segment config exports are allowed while Cache Components are enabled.
- `packages/env/src/schema.ts`: server/client env values are explicitly separated and boolean flags use the existing `optionalBoolean` parser.
- `packages/config/navigation.ts` and `packages/config/tiles.ts`: navigation and tiles are static shared config today, so payout nav is documented but not enabled until a later UI phase can gate it safely.

### Server-only feature flags

All Phase 1 payout flags are server-only. No `NEXT_PUBLIC_PAYOUTS_*` values are introduced.

```text
PAYOUTS_ENABLED=false
PAYOUTS_MANUAL_PROVIDER_ENABLED=false
PAYOUTS_WISE_ENABLED=false
PAYOUTS_AIRWALLEX_ENABLED=false
PAYOUTS_CURRENCYCLOUD_ENABLED=false
PAYOUTS_CORPAY_ENABLED=false
PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED=false
PAYOUTS_EXECUTION_ENABLED=false
PAYOUTS_SANDBOX_ONLY=true
```

Flag semantics:

- `PAYOUTS_ENABLED`: master server-side gate. When false or unset, every provider quote and execution flag resolves to disabled.
- `PAYOUTS_MANUAL_PROVIDER_ENABLED`: enables future manual/simulator planning paths without enabling real provider execution.
- Provider flags (`PAYOUTS_WISE_ENABLED`, `PAYOUTS_AIRWALLEX_ENABLED`, `PAYOUTS_CURRENCYCLOUD_ENABLED`, `PAYOUTS_CORPAY_ENABLED`, `PAYOUTS_STRIPE_GLOBAL_PAYOUTS_ENABLED`): enable provider quote/readiness planning independently.
- `PAYOUTS_EXECUTION_ENABLED`: global execution lockout. When false, provider execution resolves to disabled even if provider-specific flags are true.
- `PAYOUTS_SANDBOX_ONLY`: server-detectable signal that later provider code must use sandbox/test behavior only.

The resolver lives in `packages/config/payouts.ts` and exposes server-callable functions:

- `resolvePayoutFeatureConfig(env?)`
- `getClientSafePayoutFeatureConfig(env?)`

Do not export a module-level resolved payout config or call the resolver at module import time. Future server code should call `resolvePayoutFeatureConfig(env)` from server/config code when it needs the current environment. The shared `@asym/config` root barrel exports payout types only; executable resolver functions must be imported from `@asym/config/payouts` at explicit server call sites.

`getClientSafePayoutFeatureConfig` returns only booleans and provider availability for server-prepared UI payloads. It must never include provider credentials, tokens, webhook secrets, base URLs, account identifiers, or raw provider payloads.

### Planned admin routes

These routes are reserved for later phases and must not be user-facing until the feature is enabled and the corresponding UI exists:

```text
/payouts
/payouts/new
/payouts/[id]
/payouts/beneficiaries
/payouts/provider-accounts
```

Later batch/reconciliation/report routes remain planned but not enabled:

```text
/payouts/batches/new
/payouts/reconciliation
/payouts/reports
```

### Planned Missionary routes

Missionary payout visibility is planned for a later read-only phase:

```text
/payouts
/payouts/[id]
```

The Missionary routes must show only tenant-approved, missionary-safe payout fields and documents.

### Planned API route map

Future app API route handlers must re-export from `@asym/api/*` and must not import Supabase directly.

Admin API plan:

```text
/api/admin/payouts
/api/admin/payouts/[id]
/api/admin/payouts/[id]/submit
/api/admin/payouts/[id]/approve
/api/admin/payouts/[id]/reject
/api/admin/payouts/[id]/quotes
/api/admin/payouts/[id]/select-quote
/api/admin/payouts/[id]/send
/api/admin/payouts/[id]/cancel
/api/admin/payouts/[id]/timeline
/api/admin/payouts/[id]/documents
/api/admin/payouts/beneficiaries
/api/admin/payouts/beneficiaries/[id]
/api/admin/payouts/beneficiaries/[id]/onboarding-link
/api/admin/payouts/provider-accounts
/api/admin/payouts/provider-accounts/[id]
/api/admin/payouts/provider-accounts/[id]/health-check
/api/admin/payouts/webhooks/stripe
/api/admin/payouts/webhooks/wise
/api/admin/payouts/webhooks/airwallex
/api/admin/payouts/webhooks/currencycloud
/api/admin/payouts/webhooks/corpay
```

Missionary API plan:

```text
/api/payouts
/api/payouts/[id]
```

### Planned package export map

Future API exports:

```text
@asym/api/admin/payouts
@asym/api/admin/payouts/approve
@asym/api/admin/payouts/beneficiaries
@asym/api/admin/payouts/documents
@asym/api/admin/payouts/provider-accounts
@asym/api/admin/payouts/quotes
@asym/api/admin/payouts/send
@asym/api/admin/payouts/webhooks/airwallex
@asym/api/admin/payouts/webhooks/corpay
@asym/api/admin/payouts/webhooks/currencycloud
@asym/api/admin/payouts/webhooks/stripe
@asym/api/admin/payouts/webhooks/wise
@asym/api/missionary/payouts
```

Current Phase 1 config export:

```text
@asym/config/payouts
```

### Navigation and tile plan

Do not add enabled navigation or tiles in Phase 1. `packages/config/navigation.ts` and `packages/config/tiles.ts` are shared static config surfaces and can be consumed by client code, so they must not import server-only payout env flags.

Future UI phase options:

1. Add a server-filtered navigation/tile adapter that reads tenant settings and server-only payout flags before sending nav data to clients.
2. Add static nav/tile entries only after the route exists and a safe server-side feature gate prevents unavailable workflows.

Planned admin navigation entry:

```ts
{
  id: "payouts",
  title: "Payouts",
  href: "/payouts",
  roles: ["finance", "admin"],
  section: "main",
}
```

Planned Contributions tile quick actions:

```text
New payout
New payout batch
Review payout approvals
Reconcile provider payouts
```

### Future issue breakdown

1. Phase 2: database schema, RLS posture, generated types, and non-secret demo fixtures.
2. Phase 3: API foundation, Zod schemas, provider adapter contracts, and manual adapter.
3. Phase 4: provider account settings, encrypted credentials, and provider health checks.
4. Phase 5: universal beneficiary intake and provider readiness grid.
5. Phase 6: admin Payouts dashboard shell and disabled-by-default navigation.
6. Phase 7: quote comparison engine with simulators only.
7. Phase 8: approval policy, step-up session, and notifications.
8. Phase 9: payout saga/outbox, documents, proof packet, and manual path.
9. Phase 10: Missionary read-only payout visibility.
10. Phases 11-15: provider adapters one at a time behind sandbox and launch gates.
11. Phases 16-18: batch payouts, reconciliation/reporting, accessibility/security/E2E launch hardening.

## Locked Product Decisions

These decisions are inherited from the Mission Control Payouts v7 spec and should not be changed unless the product owner explicitly updates the direction.

### Local v7 decision summary

Use this section as the local authority for the relevant v7 direction. External or prompt-supplied source material is supporting context only; later implementation work should update this file when product direction changes instead of relying on a private or stale external spec.

- Mission Control is a workflow and recordkeeping layer for tenant-owned payout providers. It must not hold, pool, originate, or move money from an Asymmetrical-owned account.
- Finance staff compare provider readiness, quote cost, FX, fees, proof support, funding source, warnings, and caveats before selecting a provider.
- Provider execution is separate from internal approval. Provider MFA, SCA, dashboard approval, risk review, funding confirmation, webhooks, polling, or audited manual confirmation remain authoritative.
- Internal accounting balances are context only. The executable funding truth is the tenant provider account, balance, wallet, settlement account, storage balance, Treasury balance, or linked funding source.
- Universal beneficiary intake stores canonical recipient data once, then maps to provider-specific requirements by provider, country, currency, route, entity type, and rail.
- Missionary payout visibility is read-only and filtered. It may expose practical status, references, and safe proof details, but never provider credentials, balances, raw payloads, internal risk notes, or private finance details.

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
