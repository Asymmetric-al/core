# Q13-R4 — Code and database: what today's tables would do with imported history

Read-only, develop `629cb71dc`, 2026-11-03; extends q13-r1 §8 and r06 §4/§6. Static reading only; every hosted fact is **unverified**. Keys: `M/` = `supabase/migrations/`, `A/` = `packages/api/src/`. INIT `20250101000000_init_schema`, F1 `20260214090000_foundation_1_schema`, DEMO `20260216153000_demo_readonly_rls`, RT `20260625002117_canonical_tanstack_db_realtime_rls`, CUR `20261003051630_currency_foundation`, FP `20261005050728_field_policy_foundation`, FRC `20261025070000_force_rls_tenant_tables`, CFK `20261025100000_donations_composite_donor_fk`, TRF `20261025120800_close_public_reads_tenant_scope`, MSO `20261026105000_missionaries_server_only_reads`.

## 1. Schema (latest migration state)

**donations**

- Money: `amount BIGINT` in minor units, CHECK `>= 0` (F1:460-462, :527). `refund_amount BIGINT NOT NULL DEFAULT 0` (F1:300, :528). Negative rows are impossible.
- Dates: `gift_date DATE NOT NULL DEFAULT CURRENT_DATE` (F1:290, :333-334). `created_at TIMESTAMPTZ DEFAULT now()` (INIT:190). No time-zone basis is stored.
- Defaults:
  - `currency TEXT NOT NULL DEFAULT 'usd'`, FK to `currency_metadata` (F1:335-336; CUR:219-220).
  - Nullable `tenant_id DEFAULT` the demo tenant UUID (INIT:177).
  - `status`, `donation_type` and `source` are free text with no CHECK (INIT:183-184; F1:338).
- Foreign keys:
  - Donor: `(tenant_id, donor_id)` must match a donor in the same tenant, and a donor requires a tenant (CFK:89-112).
  - `missionary_id` and `fund_id` are single-column FKs with NO ACTION and **no same-tenant check** (INIT:179-180).
  - `campaign_id` and `pledge_id` are SET NULL on delete (F1:291, :311-312).
- Uniqueness: primary key only. Nothing on `stripe_payment_intent_id`, `stripe_charge_id` or any external reference.
- Indexes (10 including the PK):
  - From F1:603-632: `(tenant_id, gift_date DESC)`, `(donor_id, gift_date DESC)`, `(missionary_id, gift_date DESC)`, `pledge_id`, partial `status='completed'`, `campaign_id`, and two `date_trunc('year')` expressions.
  - `(tenant_id, amount DESC, id DESC)` (`M/20260408224500…:24-25`).
  - **None** on `fund_id`, `source`, `(tenant_id, created_at)` or `stripe_payment_intent_id`.

**Other tables**

- **funds:** `is_active DEFAULT TRUE`, `start_date`/`end_date`, nullable `tenant_id` (INIT:101-115). Currency FK and normalize trigger (CUR:245-250).
- **missionaries** (INIT:44-59):
  - Has no name, status, `is_active` or `archived_at` column. `health_status` is member-care state (`M/20260414180338…:6`).
  - `profile_id` is ON DELETE CASCADE from `profiles`, and `profiles.id` cascades from `auth.users` (INIT:28, :47).
- **donors:**
  - Scalars `total_given`, `last_gift_*`, `first_gift_date` and `gift_count` (F1:375-382).
  - `missionary_id` references `profiles`, so each donor links to one missionary (INIT:65).
  - Unique `(tenant_id, email_normalized)` and `(tenant_id, profile_id)` (`M/20261024140000…:139-164`).
- **tenants:** no currency, legal-entity or settlement column (INIT:14-24; F1:82-86).
- **Absent:** legal-entity, site, designation, contribution header/line/posting and credit tables.

## 2. What would fire on an insert today

- **Database:** only `donations_normalize_currency`, BEFORE INSERT/UPDATE OF currency (CUR:221-222), plus FK and CHECK validation. No AFTER trigger exists on donations, donors, funds or missionaries. Migrations contain no `pg_net`, `pgmq` or `pg_cron`; `pg_notify` only reloads PostgREST.
- **Realtime:** donations is not published. The publication loop adds `funds` among others (RT:280-299), and the donations browser collection has realtime disabled (`packages/database/collections/tables/giving.ts:28-33`).
- **Inngest:** the saga scan reads only `donation_saga_outbox` (`A/workflows/adapters/donations.ts:91-97`). Reconciliation reads the outbox and `staged_gifts` (`A/giving/staged-gifts.ts:557-582`).
- **Receipts:** sending one requires a `staged_gifts` row (`A/admin/contribution-operations/dependencies.ts:27-28`).
- **Answer:** nothing fires beyond currency normalisation — no event, job, notification, webhook or total update. That silence is accidental, not designed.

## 3. Derived totals

**Stored totals are never updated.**

- `donors.total_given`, `gift_count` and the first/last-gift fields, `missionaries.current_funding` and `funds.current_amount` have no runtime writer.
- They are set only by the F1:384-399 backfill and by seed data (`supabase/seed.sql:299,421`).
- Readers: missionary "raised" `current_funding ?? sum` (`A/missionary-portal/model.ts:360-362`; default 0, so the fallback never runs); donor portal lifetime and gift count (`A/donor-portal/model.ts:473-479`); public giving page (`A/public-giving/projection.ts:63`); CRM lifetime (`A/admin/crm/service.ts:29-30`); missionary roster (`A/missionary-portal/donors.ts:368-370`).
- Imported history would not reach these numbers, which falls short of Q7 "counts in every total".

**Live sums over `donations` would include history automatically.** They filter only on settled status, and none filters on `source`.

- Admin summary RPC: one scalar summed across all currencies (`M/20260408224500…:13-21`).
- Admin dashboard "revenue this month", keyed on **`created_at`** (`A/reads/dashboard-stats.ts:74-85`). An import would land as import-month revenue.
- Missionary analytics and tiles use `useDonationMetrics`, keyed on **`created_at`** (`packages/lib/hooks/use-donation-metrics.ts:66,100,257`). It is fed by a 13-month `created_at` query (`A/missionaries/metrics.ts:250-254`).
- Missionary snapshot (`A/missionary-portal/service.ts:196-203`; `model.ts:357-359, :396`):
  - Reads the last 250 gifts by `gift_date`.
  - `giftCount = gifts.length`, so it is capped at 250.
  - The "recurring monthly" figure sums every gift typed Recurring.
- CRM reports: `completed` gifts only, date filter on `created_at`, `.limit(5000)` (`A/admin/crm/reports/service.ts:85-97`).
- Donor portal year-to-date and statement years, by `gift_date` (`A/donor-portal/model.ts:361, :391-393`).

**First-gift, new and lapsed:** nothing computes these from donations. "Lapsed" and "New" come from stored `donors.status` text (`A/missionary-portal/donors.ts:174-191`).

## 4. RLS and grants (develop)

**donations**

- RLS is enabled and forced (FRC:94-113).
- Grants:
  - `authenticated` has SELECT only (DEMO:59-60; RT:161).
  - anon keeps a SELECT grant but has no policy, so it is denied.
  - No INSERT, UPDATE or DELETE grant or policy exists for anon or authenticated.
- Policy "donations owner or staff select" allows (RT:184-208):
  - super admins;
  - active staff of the row's tenant;
  - the donor's own profile;
  - **the missionary's own row**.

**Other tables**

- **donors:** staff or own profile only (RT:165-182), so a missionary cannot read donor names through RLS.
- **funds:** tenant-scoped read for authenticated users (TRF:96-115).
- **missionaries:** column SELECT on `(id, profile_id)`, own row only (MSO:59-75).
- **tenants:** REVOKE ALL (RT:43).

**Helpers and write paths.** The helpers are `authz.has_staff_membership`, `is_super_admin` and `current_tenant_id`, the last read from the JWT (`M/20260226113000…:130-201`). `tenant_guard` holds grants only on `workflow_work_claims` (`M/20261024150000…:51-52`), so no guarded write path to donations exists.

**Column exposure.** There are no column restrictions on donations.

- Through RLS, a missionary receives every column of gifts made to them, including `donor_id`, `notes` and `source`.
- Field policies mark those three as invisible on the missionary surface (FP:62, :112, :187).
- Anonymity is enforced only in server projections (`A/missionary-portal/redaction.ts:1-13`).

**Remaining `USING (true)` policies (D24).** Develop removed them from these tables (RT:21-36; TRF). Hosted projects are recorded as still carrying them (`docs/security/tenant-read-floor.md:23,86`). **Unverified.**

## 5. Currency and money

- **Representation:** `currency_metadata` holds 165 codes with exponents 0, 2, 3 or 4 (CUR:5-12). In TypeScript, `MoneyCents = number` (`packages/database/types/database.ts:41`). `parseMoneyToMinorUnits` is exact and exponent-aware (`A/money/index.ts:32-54`).
- **`assertTransactable`:** its only caller is `A/donate/index.ts:65-75`, paired with the USD-only `resolveTenantSettlementCurrency`. An import path would only be checked against the currency FK.
- **Formatting:**
  - The exponent-aware `formatMoney` has no product caller.
  - At least 22 non-test files divide by 100 (e.g. `A/giving/receipts.ts:48-53`, `A/donor-portal/receipts.ts:8-13`, `A/missionary-portal/model.ts:227-229`). JPY or BHD history would therefore display 100× or 10× wrong.
  - The missionary roster formats `total_given`, which is in cents, as whole USD (`apps/missionary/app/donors/donors-model.tsx:23-27, :114-117`). This looks like an existing bug; runtime is unverified.

## 6. Existing import code

See r06 §1, §2, §4.6 and §6. New here: a grep for batch-origin, suppression or `isImport` returns nothing, and no writer sets `source='import'`.

## 7. Platform limits

- **PostgREST:** `max_rows = 1000` (`supabase/config.toml:18`; hosted value unverified).
  - Unbounded `.select("amount")` sums (`A/reads/dashboard-stats.ts:80-85`) truncate silently at that cap.
  - So does the CRM `.limit(5000)`.
- **Database:** the repo sets no `statement_timeout`. The local pooler is off with a pool size of 20 (`config.toml:36-46`).
- **Inngest** 4.25.0 (`packages/api/package.json:204`):
  - Repo skill docs: 1,000 steps/run, 4 MB/step, 32 MB run state (`docs/ai/skills/inngest-steps/SKILL.md:352`); 512 KB send batch (`inngest-events/SKILL.md:377`). Envelopes carry identifiers only (`A/workflows/events.ts:24-93`).
  - Five million rows in one run need ≥5,000 rows per step. The serve route sets no `maxDuration`. `node_modules` is absent here, so installed docs were not read.
- **Per-row write cost:** 10 index updates, 6 FK probes and 1 row trigger.

## 8. Missionary lifecycle

- **Departure:** no column records it. `funds.is_active` is the only lifecycle flag (INIT:111). Login access depends on `authz.memberships.is_active` (`M/20260226113000…:45-59`).
- **Names:**
  - Missionary labels come from `profiles` (`A/admin/crm/reports/service.ts:121-133`).
  - A profile requires an `auth.users` row (INIT:28).
  - So a named history-only missionary needs an auth identity; without one it appears unnamed.
- **Deletion:** deleting a departed missionary's auth user cascades through the profile to the missionary row. Once history exists, that cascade fails because `donations.missionary_id` is NO ACTION.
- **Filtering:**
  - Only the active-funds count filters on `is_active` (`A/reads/dashboard-stats.ts:86-89`).
  - These do not check it, so a closed fund stays pickable and givable:
    - the fund directory (`A/admin/fund-directory.ts:15-23`);
    - CMS giving-page validation (`apps/admin/src/cms/collections/page-builders.ts:198-205`);
    - the donate route (`A/donate/index.ts:45-46, :111-125`).

## 9. Admin contributions model

**Row derivation** (`A/admin/contributions/model.ts`):

- `entryMethod` (:83, :243-253, :363): `source='import'` maps to `import`; cash, check and bank_transfer map to `manual`; anything else maps to `api`.
- `annualStatementEligible` is hard-coded `true` (:362).
- `isAnonymous = !donor_id` (:373).
- Receipt status falls back to `pending` when there is no staged gift (`A/admin/contribution-shared/row-contract.ts:201-214, :376`), so every imported row would show "receipt pending".

**Query** (`A/admin/contributions/service.ts:412-455`):

- Tenant filter, keyset cursor, at most 100 rows (`query.ts:1-2`). Only the default `gift_date` sort and the amount sort are indexed.
- Unindexed: `created_at`/`status`/`payment_method`/`source` sorts, `fund_id`/`source`/`donation_type` filters, and search (`ilike` on Stripe ids ORed with ≤400 donor ids, :275-288). The summary RPC aggregates every tenant row per load. Expect sequential scans at millions of rows (not measured).

## 10. Donor portal and missionary app

**Donor portal**

- Shows the last 250 gifts by `gift_date` (`A/donor-portal/service.ts:206-213`).
- Builds annual statements by `gift_date` year (:279-299).
- Offers a "Donation Receipt" download for any owned row (`A/donor-portal/receipts.ts:39-80`).
- Turns each `payment_method` into a payment method flagged `stripeManaged: true` (`model.ts:431-441`).
- Does not select `source`, so it has no label for the previous system.

**Missionary portal**

- Shows gifts to the missionary's own row: last 250, settled only. `donorId` is removed when the donor is anonymous (`A/missionary-portal/model.ts:309-330`).
- Anonymity defaults to **on** unless `defaultAnonymousToRecipient === false` (`redaction.ts:38-47`), so imported donors would appear anonymous.
- The supporter list is `donors.missionary_id = profile` (`service.ts:205-211`).
- Per-supporter "Giving history" reads `donor_activities` rows of type `gift`, **not** `donations` (`apps/missionary/app/donors/donors-page-model.ts:263-266`). Imported gifts would not appear there.

**GraphQL `mySupporters`** is mounted in the donor app. It returns gifts with the donor's full profile, unredacted and ordered by `created_at` (`packages/graphql/handler.ts:372-404, :899-912`).

**No surface shows a previous-system label.**

## 11. Append-only and audit

- **No guards:** donations has no audit trigger, soft-delete column or immutability guard. `audit_logs` is written only by RPCs (INIT:325-336). `service_role` keeps its default write grants.
- **Delete cascades:** deleting a donation also deletes:
  - staged gifts;
  - corrections and adjustments;
  - correction requests;
  - receipt snapshots;
  - refund attempts;
  - **`contribution_operation_audit_events`** (`M/20260526132000…:80`).
- **Only block:** `gift_receipt_records` RESTRICT (`M/20260704120000…:17`). "Immutable" adjustments are a convention only (`M/20260611100000…:3`).
- **Stripe lookup:** webhooks find donations by `stripe_payment_intent_id` with no tenant filter and no index (`A/stripe/refunds.ts:45-58`; `A/stripe/event-store.ts:117-121`).

## Hazards if history were written to today's tables

1. **No provenance.** No batch, external id or uniqueness, so reruns duplicate silently; rollback means deletes that cascade away audit rows.
2. **Defaults supply facts.** A missing date becomes today, currency USD, tenant the demo tenant (F1:333-336; INIT:177).
3. **`created_at` charts** show all history as import-month revenue.
4. **Receipts and statements** include history; every row shows "receipt pending".
5. **Missionary view.** History shows as anonymous, unlabelled recent gifts, not in supporter giving history; RLS still exposes `donor_id` and `notes`.
6. **Cross-tenant** missionary or fund references are accepted.
7. **Currency.** Non-2 exponents display wrongly; totals add unlike currencies.
8. **Stripe.** Unindexed lookups slow every webhook; legacy ids in `stripe_*` columns could match live webhooks or refunds.
9. **Lifecycle.** Closed funds stay givable; departed missionaries need auth identities.
10. **Stale totals** ignore history, so Q7's "every total" fails silently.

## What must exist before any history write (requirements)

- **One writer:** a single typed owner command; tenant, Legal Entity and currency resolved explicitly, never from column defaults.
- **Provenance:** source system, run, external id and history-only disposition per row, with tenant-scoped uniqueness for idempotent reruns.
- **Reader rules:** every reader classified as including, excluding or labelling history; keyed on gift date, never `created_at`; summed per currency; formatted by exponent.
- **Donor-facing outputs:** receipt, statement, payment-method and recurring surfaces exclude or mark history.
- **Label and anonymity:** a field-policy-permitted previous-system label missionaries can see; a decided anonymity default for imported donors.
- **Integrity and lifecycle:** same-tenant missionary and fund FKs; a login-free lifecycle state for departed missionaries and closed funds that blocks new giving.
- **Scale:** supporting indexes and row-cap-safe query paths for history readers.
- **Corrections:** append-only history with an audited reversal path instead of deletes.
- **Proof:** real-database tests that no effects fire and totals behave as decided.

**Unverified:** hosted schema, policies, grants and data; hosted `max_rows` and timeouts; Vercel function duration; query plans at scale; runtime of the roster units bug.
