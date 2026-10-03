# AL-480 currency foundation evidence

Implementation assignment B-480-implement; independent acceptance E-480-r1.1
(initial E-480-479-r1). Base: `209a0797f887f2e93c78d552fc1fc543d2e9ed9f`.
Evidence dated 2026-10-02 (America/Los_Angeles). This document covers issue #480 only.

## Authority and supersession

[Issue #480](https://github.com/Asymmetric-al/core/issues/480) was read with
`gh issue view 480 --repo Asymmetric-al/core --json title,body`. Its historical
request for generic giving FX columns is superseded by the current
[Phase 2 PRD Data Model](../../prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md#data-model):
“Phase 2 does not add generic nullable FX columns to every giving record” and
legacy `donations`, `staged_gifts`, `donor_pledges`, `pledge_charge_attempts`
“receive no new normative columns or runtime ownership from this phase”
(source lines 678–704). Existing columns receive ISO validation only.
[Testing Decisions](../../prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md#testing-decisions)
explicitly excludes greenfield gift backfill and legacy entry-method runtime
contracts (lines 813–818). No runtime backfill is introduced.

[ADR-0208](../../adr/0208-currency-aware-minor-units.md#decision) separates
canonical amounts from provider restrictions and requires explicit presentation
locale and independently resolved settlement context. It also identifies the
future snapshot as a reference/projection of immutable Phase 20 evidence.
[ADR-0207](../../adr/0207-site-before-ledger-with-locale-and-currency-facets.md)
and the [multi-site OpenSpec boundary delta](../../../openspec/changes/document-multi-site-foundation/specs/platform-boundaries/spec.md)
prohibit Site selection of financial identity. Phase 24 D61/D62 qualification
and activation remain deferred. The foundation does not implement #479.

## Implemented contract

`@asym/api/money` exports the five canonical helpers and `CURRENCY_METADATA`.
The TS authority contains all 165 current SIX List One monetary codes from the
[2026-09-17 publication](https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml),
including XCG, ZWG, XAD, and four-decimal fund units CLF/UYW. Codes with `N.A.`
monetary units (metals, testing, no-currency identifiers) are deliberately
excluded. Current monetary codes, rather than a three-letter regex, determine
membership. Code lookup trims and normalizes case; SQL stores lowercase.

Exact plain decimal parsing uses integer arithmetic and rejects lost precision
and unsafe units. Formatting uses an explicit locale and ECMA-402's exact
decimal-string representation, including safe-integer extreme fractions.

`toStripeMinorUnits(units, code, operation)` and
`fromStripeMinorUnits(units, code, operation)` take explicit `charge | payout`.
Metadata contains canonical exponent plus charge/payout exponent/multiple
fields. ISK/UGX use canonical whole units and provider hundredths constrained
to multiples of 100. HUF/TWD charge hundredths but payout whole currency units
(multiple 100). Three-decimal amounts retain canonical precision while provider
representations require last digit zero. MGA ISO hundredths are separately
adapted to provider whole units. These are lossless representation helpers,
not global provider-support or payment-route qualification claims.

Donate preserves string input until canonical parsing, preventing precision
loss through number coercion. USD fee qualification and fee calculations remain
narrow. A separate server-admin tenant identity query verifies the exact
authenticated tenant before assigning the existing qualified USD-only lane:
`public.tenants` has no settlement-currency field. Unknown/error/mismatched
identity fails closed; caller/Site/CMS/defaults cannot select the settlement
currency or merchant. Financial-owner/binding qualification must replace this
compatibility resolver before later currency expansion. Existing replay,
idempotency and provider behavior remain exercised by the donate regressions.

Migration `20261003051630_currency_foundation.sql` mirrors metadata, adds
`campaigns.currency text NOT NULL DEFAULT 'usd'`, and adds normalization triggers
and metadata FKs on campaigns and the five requested existing currency columns.
Existing column nullability is preserved. Metadata has SELECT-only access for
anon/authenticated/service_role with RLS. No existing tenant-data policy changes.

`currency_rate_snapshots` reserves a generated UUID `id` and nullable
`tenant_id`, `provider_evidence_id`, `provider_balance_transaction_id`,
`presentment_currency`, `settlement_currency`, `presentment_amount_minor`,
`settled_amount_minor`, `fee_minor`, `net_minor`, `exchange_rate`, `observed_at`.
Currencies reference metadata; tenant references tenants. The future evidence
UUID has no invented FK before Phase 20 defines its physical identity. The
numeric rate reserves a provider fact, not a calculated or editable rate.
All context is deferred and the table is empty: RLS has no policies and all
privileges, including service_role, are revoked. No giving record references
are added. Future activation requires owner-defined immutability, complete
financial scope, relational identity and permissions; this reservation proves
none of that later behavior.

The scoped generated tables mirror (campaigns and the two new tables) is
extracted from actual Supabase CLI schema output. Core's existing application
interfaces remain intact; Campaign currency references the generated row type.

## Executed verification

Commands below ran from `/workspace/core` with
`PATH=/workspace/.onboarding-tools/node_modules/.bin:$PATH`. CLI commands also
prefixed `/workspace/phase2-tools` (the pinned 2.76.12 binary, outside checkout).
The repository runner's initial npx fallback failed during package postinstall;
a downloaded binary of the same pinned version allowed the runner to work.
Its incidental `supabase/.temp/cli-latest` modification was restored.

- Initial independent RED: `bunx vitest run tests/unit/packages/api/money-foundation.test.ts tests/unit/packages/api/money-donate-precision.test.ts --reporter=verbose`.
  Missing public export failed collection; USD 1.001 and 0.299 silently rounded.
- New provider/settlement RED: `bunx vitest run packages/api/tests/unit/money-provider.test.ts packages/api/tests/unit/money-settlement.test.ts`.
  MGA conversion failed and settlement module was missing. Route RED additionally
  reproduced `"1.00000000000000001"` coercion into a successful charge flow.
- Final focused run: `bunx vitest run tests/unit/packages/api/money-foundation.test.ts tests/unit/packages/api/money-donate-precision.test.ts packages/api/tests/unit/money-provider.test.ts packages/api/tests/unit/money-settlement.test.ts packages/api/tests/unit/donate-schema.test.ts packages/api/tests/unit/donate-fee-policy.test.ts packages/api/tests/unit/donate-post-charge.test.ts packages/api/tests/unit/donate-payment-intent.test.ts`.
  **8 files / 131 tests passed**, Vitest 4.1.4. Independent tests were unchanged.
- `bunx turbo run typecheck --filter=@asym/api --filter=@asym/database`:
  **7 successful tasks**, including package dependencies.
- Scoped `bunx eslint` over changed TS source/tests/types: passed without warnings
  after import-order repair. `node --check scripts/generate-currency-foundation-types.mjs`
  passed (maintenance MJS is ignored by repo ESLint).
- Scoped `bunx prettier --check` over changed TS/MJS/manifests: passed.

The actual local server reported PostgreSQL **17.11**, with all 79 baseline
migrations and seed already replayed by the coordinator. No hosted writes or
live provider calls occurred. Executed commands:

```sh
PATH=/workspace/phase2-tools:/workspace/.onboarding-tools/node_modules/.bin:$PATH bun run supabase -- migration new --help
PATH=/workspace/phase2-tools:/workspace/.onboarding-tools/node_modules/.bin:$PATH bun run supabase -- migration new currency_foundation
/workspace/phase2-tools/psql -U postgres -d phase2_480 -X -v ON_ERROR_STOP=1 -f /workspace/core/supabase/migrations/20261003051630_currency_foundation.sql
/workspace/phase2-tools/psql -U postgres -d phase2_480 -X -v ON_ERROR_STOP=1 -f /workspace/core/supabase/tests/currency-foundation.sql
PATH=/workspace/phase2-tools:/workspace/.onboarding-tools/node_modules/.bin:$PATH DOCKER_HOST=unix:///var/run/docker.sock bun run supabase -- gen types --db-url postgresql://postgres@172.17.0.2:5432/phase2_480 --schema public > /workspace/phase2-480-generated.ts
bun scripts/generate-currency-foundation-types.mjs /workspace/phase2-480-generated.ts
bunx prettier --write packages/database/types/currency-foundation.generated.ts
bun /workspace/verify480-mirror.ts
```

SQL probes perform actual normalized JPY writes and rejected unknown-code
writes on all six tables, campaign default/type/NOT NULL checks, role-based
metadata write denial and snapshot read denial, and 165-row visibility for
anon/authenticated. A temporary staged-gift fixture is necessary because the
baseline seed has none. All probe writes roll back. An initial probe stopped
honestly on that missing fixture; the durable test adds one within its rolled-
back transaction. A quoting mistake in the new default probe was corrected
before the final passing SQL run. The separate mirror command compares every
real SQL row and all six physical fields against TS: **165 exact matches**.

Candidate diff inspection used `git diff 209a0797f887f2e93c78d552fc1fc543d2e9ed9f`
for tracked changes and `git diff --no-index /dev/null <new-file>` for new
source/migration/tests/types/docs. Thus evidence concerns an actual working
candidate, not an empty post-commit worktree.

## Limits and deferred checks

The coordinator owns clean baseline+candidate+seed replay, final independent
acceptance and the normal full pre-push preflight. These are not claimed here.
SQL proves PostgreSQL behavior, not PostgREST, browser UX or Stripe execution.
Existing demo table visibility policies are unchanged; the new evidence shape
is inaccessible to every application role rather than exposing tenant rows.
Tests prove tenant resolver mismatch denial and existing money regression
behavior, not future financial-binding or multi-currency activation. No new
application dependencies, provider calls, Payload imports, commits, pushes,
merges or deployments were made by this implementation assignment.
