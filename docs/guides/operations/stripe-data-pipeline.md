# Stripe Data Pipeline: development ingestion

Use Stripe's managed **real-time Postgres Data Pipeline** to copy sandbox data
into Core's existing development Supabase project. This is an operational copy
of provider data, with no application consumer or financial side effects.

## Current record — 2026-10-21

Repository inspection started from clean commit `3d85897ebf1515008ef5c676b1c58a15422fb9ab`.
[Environment inventory](../../ops/environments.md) identifies development as
`pnmlrbgjiqzzsthsoikm`; Supabase `get_project` independently confirmed that project
healthy, named `development`, in organization `nxfglfxzhgxoziuenwgn`.
Hosted SQL recheck at `04:17:49Z` found no Stripe candidate schema, table, or role;
`supabase_realtime.puballtables` was false. This does **not** exclude a pending
external pipeline. At `04:23:39Z`, the Supabase Management API returned hosted
PostgREST `db_schema=public,graphql_public`, extra search path `public, extensions`,
and `max_rows=1000`. Recheck exposure and permissions after native setup.

| Operation field                                 | Observed state                                                                                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe source account / sandbox identity        | `acct_1T4GXjCKW1xvz62w`, **Asymmetric.al sandbox**, independently returned by Stripe `/v1/account`; general-vs-test-mode classification awaits Dashboard confirmation |
| Tenant / test organization association          | Unestablished; do not infer one                                                                                                                                       |
| Destination                                     | Supabase `pnmlrbgjiqzzsthsoikm` (`development`)                                                                                                                       |
| Actual schema / provider owner / pipeline ID    | Unknown; discover after authorization                                                                                                                                 |
| Initial tables                                  | `customers`, `payment_intents`; charges/refunds deferred                                                                                                              |
| Provider authorization / pipeline configuration | Pending / not configured by this work                                                                                                                                 |
| Backfill / ongoing sync                         | Not observed / not observed                                                                                                                                           |
| Second independent source                       | Pending; none verified                                                                                                                                                |
| Hosted privacy / effective privileges           | Hosted API exposes only `public,graphql_public`; managed-schema privileges remain pending because no schema exists                                                    |
| Dashboard cost estimate                         | Unavailable                                                                                                                                                           |

No native pipeline or database configuration was changed. The user selected this
source; an already authorized API credential independently verified the account
and its business/dashboard display name. The failed ChatGPT Stripe connector was
not retried, the supplied publishable key was not stored, and Core's keys were
not changed. `SUPABASE_DB_URL` remains unavailable; workspace public URL/anon
configuration points to a different project and must not be used for this pipe.
Repository preparation is separate from each provider and data-movement status.
Update this record with non-secret facts and observation timestamps after setup;
give each additional source its own record. Never commit keys, URLs containing
credentials, customer details, or raw Stripe objects.

Source inventory found existing canceled sandbox PaymentIntents, including
`pi_3ULekzCKW1xvz62w1fyZLjw8`: amount `2500`, currency `usd`, status `canceled`,
`livemode=false`, created `1790841022`, `latest_charge=null`. Customers, charges,
and refunds were initially empty. One metadata-only synthetic customer,
`cus_VToinGqK4jef94`, was then prepared at `04:24:38Z` (`created=1792556677`,
`livemode=false`), with no name, email, or payment. Its marker value is not
recorded here. This is source-fixture preparation, not pipeline or sync proof.

## Setup and final authorization handoff

The product is in [public preview](https://docs.stripe.com/data/data-pipeline/real-time-sync-to-postgres).
Use **Asymmetric.al sandbox**, account `acct_1T4GXjCKW1xvz62w`, and confirm that
identity in the account picker/settings before consent. Confirm whether it is a
[general sandbox](https://docs.stripe.com/sandboxes), which isolates settings and
data from live mode; do not assume its type from its name. Do not change Core's Stripe
keys or create a Connect platform to obtain a source.

1. An independently authorized source operator opens Stripe **Reporting → Data
   management → Data Pipeline** ([Pipelines](https://dashboard.stripe.com/data-management/pipelines))
   in that sandbox. The [Data Engineer role](https://docs.stripe.com/get-started/account/teams/roles#data-engineer)
   can manage pipelines. Inspect existing pipelines, source identity, destination,
   selected tables, status, and estimate **before creating another connection**.
2. Follow [native Supabase configuration](https://docs.stripe.com/data/data-pipeline/real-time-sync-to-postgres/configure):
   select **Supabase → Connect your Supabase account**, complete provider OAuth,
   and choose the **existing** project `pnmlrbgjiqzzsthsoikm`. Do not provision a
   project, enable a live source, select a paid subscription, or upgrade resources.
3. Select only `customers` and `payment_intents`: the prepared synthetic customer
   supports a harmless ongoing-change probe, and existing intents provide integer
   amount, currency, and status evidence. Charges and refunds have no fixtures;
   defer them until a concrete need and existing synthetic fixture can be verified.
   Do not execute payments or refunds just to populate the mirror.
4. Before **Create pipeline**, record a known existing synthetic object and its
   source-observation time, required safe fields, account, and sandbox mode.
   Record any displayed 30-day per-table estimate. Create only the sandbox
   pipeline, then record activation time and the actual pipeline ID if shown.
5. Discover the actual destination schema/owner, complete the record, and run
   verification below. If consent is unavailable, stop at this precise handoff;
   do not claim the pipeline, backfill, or ongoing sync is active.

Native OAuth is authorization between Stripe and Supabase, separate from Stripe
Connect merchant onboarding. The [Supabase announcement](https://supabase.com/blog/stripe-data-pipeline-now-syncs-real-time-data-to-supabase)
describes a `stripe_sdp`-prefixed schema, a dedicated scoped role, SSL, and
short-lived JWT database credentials. Discover the actual names; do not add a
password-based connection alongside native setup.

## Read-only verification

The local helper needs repository dependencies and a PostgreSQL `psql` client on
`PATH`, plus existing approved SQL access to the destination. These operational
credentials are separate from the pipeline's native OAuth connection.

Use approved SQL access to the named project. For initial catalog discovery in
its Supabase SQL editor, run this bounded transaction; it returns names only:

```sql
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
SELECT n.nspname AS schema_name, pg_get_userbyid(n.nspowner) AS owner
FROM pg_namespace AS n
WHERE n.nspname !~ '^(pg_|information_schema)'
  AND (n.nspname ILIKE '%stripe%' OR EXISTS (
    SELECT 1 FROM pg_class AS c
    JOIN pg_attribute AS a ON a.attrelid = c.oid
    WHERE c.relnamespace = n.oid AND c.relkind IN ('r', 'p')
      AND a.attname = '_account_id' AND NOT a.attisdropped
  ))
ORDER BY n.nspname LIMIT 50;
COMMIT;
```

Inspect actual selected table columns/owners before querying rows. The current
[schema reference](https://docs.stripe.com/data/data-pipeline/real-time-sync-to-postgres/schema)
includes `_account_id`, `_updated_at`, and `_raw_data`; never select `_raw_data`,
client secrets, customer details, or `SELECT *`. Customers, PaymentIntents, and charges have
`livemode`; refunds do **not** have that documented column. An account column
does not prove tenant ownership or coverage of connected accounts.

Store existing `SUPABASE_DB_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in
approved local secret storage loaded by the workspace environment loader. Never put the
database URL in command arguments. The verifier requires the intended project
and source/schema expectations explicitly; it cannot fall back to the CMS DB.
It independently pins `projectRef` to `pnmlrbgjiqzzsthsoikm`; matching expectations
and credentials for another project are rejected before connecting.

Accepted URLs use `postgresql://` or `postgres://`, explicit user/password, and
the `/postgres` database path. Use `db.pnmlrbgjiqzzsthsoikm.supabase.co`, or a
`<pooler>.pooler.supabase.com` host with a username ending in
`.pnmlrbgjiqzzsthsoikm`. Include one explicit `sslmode`: `require`, `verify-ca`,
or `verify-full`; the legacy `no-verify` alias is normalized to `require`.
The only other accepted query options are `sslrootcert`, `sslcert`, `sslkey`,
`sslcrl`, and `sslcrldir`. Duplicate options and routing overrides such as
`host`, `hostaddr`, `service`, `user`, `dbname`, or `options` are rejected.

Create a local, uncommitted JSON expectations file using actual observed values:

```json
{
  "projectRef": "pnmlrbgjiqzzsthsoikm",
  "accountId": "acct_1T4GXjCKW1xvz62w",
  "sandboxId": "acct_1T4GXjCKW1xvz62w",
  "schema": "ACTUAL_MANAGED_SCHEMA",
  "owner": "ACTUAL_PROVIDER_OWNER",
  "tables": ["customers", "payment_intents"],
  "activatedAt": "RECORD_ACTUAL_ACTIVATION_ISO_TIME",
  "indirectExposureReviewedAt": "RECORD_ACTUAL_MANUAL_REVIEW_ISO_AFTER_ACTIVATION",
  "fixtures": [
    {
      "phase": "backfill",
      "table": "payment_intents",
      "id": "pi_3ULekzCKW1xvz62w1fyZLjw8",
      "sourceObservedAt": "RECORD_SOURCE_OBSERVATION_ISO_BEFORE_ACTIVATION",
      "expected": { "amount": "2500", "currency": "usd", "status": "canceled" }
    },
    {
      "phase": "ongoing",
      "table": "customers",
      "id": "cus_VToinGqK4jef94",
      "sourceChangedAt": "RECORD_CUSTOMER_CHANGE_ISO_AFTER_ACTIVATION",
      "metadata": {
        "key": "core_pipeline_probe",
        "value": "UNIQUE_NONSECRET_MARKER"
      }
    }
  ]
}
```

```bash
node scripts/verify/stripe-data-pipeline.mjs --expect /path/to/local-expectations.json
```

Confirm `sandboxId` using the actual account and Dashboard identity; no separate
sandbox ID is invented here. Replace unknown schema/owner, timestamps, and marker
with actual observations. `owner` must match the schema and selected
table owners; only ordinary or partitioned tables qualify. Use decimal strings for integer minor-unit
amounts. For structure-only inspection, use `"fixtures": []`; this deliberately
leaves ingestion unproven. With financial tables selected, include at least one
financial backfill fixture; a customer alone is insufficient. Optional expected
linkage IDs are `payment_intents.latest_charge`, `charges.payment_intent`, and
`refunds.charge`/`refunds.payment_intent`, checked against discovered columns.
The helper makes one read-only observation per run,
uses bounded timeouts, and reports separate structure, privacy, backfill, and
ongoing results. Exit `0` requires all four checks for this one source, including
the recorded manual privacy review; `1` means a failed check; `2` means missing
configuration or incomplete proof. Output is explicitly scoped to a
`single-source-observation`: `operationalEvidence` leaves provider authorization,
pipeline configuration, and second-source proof `not-verified-by-helper` even on
exit `0`. Complete those phases independently in the source record. A second
account is optional for this observation; pending second-account proof must stay
visible in the record. A mock test is not provider proof.

For movement evidence, first observe the known preactivation object's ID,
account/mode, status, integer amount, currency, and relevant linkage IDs matching
the source. Then record the synthetic customer's prior `_updated_at` and absence
of a new unique probe marker. An operator with existing customer-edit authority
updates the prepared customer's metadata after activation; record its
time, and verify the marker and subsequent copied
state. Do not print the marker or unrelated metadata. Manually rerun observations
within a bounded ten-minute window; do not install polling or scheduled jobs.
PaymentIntent updates can take ten minutes during preview; most other changes
sync within seconds. An idle source's old timestamp is not an outage, and an
empty table alone proves neither success nor failure.

Privacy requires hosted evidence: managed schemas must be absent from the live
[PostgREST exposed-schema configuration](https://supabase.com/docs/guides/api/using-custom-schemas)
and Realtime publications, and effective
`anon`/`authenticated` privileges must not permit reads. Supply the helper's public
Supabase URL/key configuration for its hosted exposure check; local
`supabase/config.toml` alone is insufficient. Missing evidence stays incomplete.
Inspect public RPC/view dependencies and run a static application scan for actual
schema references. `supabase-env-smoke.mjs` tests PostgREST, not private ingestion.
Before recording `indirectExposureReviewedAt`, inspect all readable views and
callable functions in the **actual hosted exposed schemas**, including transitive
view/function dependencies, `SECURITY DEFINER`, and dynamic SQL. This names-only
inventory helps locate candidates; substitute the live exposed-schema list and
inspect definitions privately in the SQL editor:

```sql
BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
SELECT n.nspname AS schema_name, c.relname AS view_name
FROM pg_class AS c JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'graphql_public') AND c.relkind IN ('v', 'm')
  AND EXISTS (SELECT FROM pg_roles AS r WHERE r.rolname IN ('anon', 'authenticated')
    AND has_schema_privilege(r.oid, n.oid, 'USAGE')
    AND (has_table_privilege(r.oid, c.oid, 'SELECT')
      OR has_any_column_privilege(r.oid, c.oid, 'SELECT')))
ORDER BY 1, 2;
SELECT n.nspname AS schema_name, p.oid::regprocedure::text AS callable_function
FROM pg_proc AS p JOIN pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'graphql_public') AND p.prokind = 'f'
  AND EXISTS (SELECT FROM pg_roles AS r WHERE r.rolname IN ('anon', 'authenticated')
    AND has_schema_privilege(r.oid, n.oid, 'USAGE')
    AND has_function_privilege(r.oid, p.oid, 'EXECUTE'))
ORDER BY 1, 2;
ROLLBACK;
```

Do not attest while any candidate or application consumer remains unreviewed.
The timestamp is an operator attestation, not automated dependency analysis, and
must be after activation. The helper rejects future review times, allowing at most
one minute of clock skew. Repeat the review after API exposure, grants,
views/functions, or application consumers change; update its timestamp only
after completing that review. Missing or preactivation review evidence leaves
privacy incomplete even when the direct schema probe and grants pass.
Do not add grants or expose schemas to make either verifier succeed. If a narrow
access correction is needed, preserve provider ownership and reverify.

## Additional independent sources

Authorize each source separately and record source account, sandbox/environment,
independently established tenant association (or `unestablished`), destination,
actual schema/owner, tables, pipeline ID, estimate, and verification status.
Metadata, customer email, schema names, and Core's platform-key fallback are not
account bindings. A platform pipeline does not establish direct-charge coverage
for connected accounts.

Stripe documents a separate schema per pipeline and **Advanced setup** for
multiple accounts in one database. Confirm the native OAuth UI's actual options;
do not assume it offers the same schema controls. If Advanced is required, its
documented requirements are PostgreSQL 13+, a dedicated password-authenticated
login (never administrator credentials), database `CONNECT` and `CREATE`, and
host/port/database/schema. Database `CREATE` is broader than schema-only access;
do not silently grant it to the native role. Use authorized secret storage,
the current Stripe network allowlist where restrictions apply, and **Verify
certificate and server name** with the database CA. Do not provision this in advance.

With two authorized sources, verify known A/B objects in their own schemas and
their absence from the other schema. Record any shared IDs explicitly. This
proves only tested source separation, not future Connect coverage or application
tenant authorization. Otherwise mark second-source behavior pending.

## Costs, stopping, and application boundaries

[Current US pricing](https://stripe.com/data-pipeline/pricing): sandbox sync is
free. Live Postgres pay-as-you-go includes 5,000 synced rows/month, then $0.0025
per row; creates, updates, and deletes count, while initial table backfill is free.
Do not assume allowances multiply per tenant/account; pooling is not established
by the public page. Destination storage/compute usage can still increase Supabase
costs. Record the Dashboard estimate; preproduction status does not make live
sources free. Do not select subscriptions, enable autoscaling, or upgrade infrastructure here.
The Supabase organization already has a Pro plan; this work did not upgrade it.

To stop this connection, select the recorded account/sandbox and pipeline in
Stripe, then disable its selected tables or use that pipeline's supported
offboarding control after checking the confirmation's exact scope. Do not cancel
a global Data Pipeline plan, revoke a shared Supabase OAuth grant, rotate shared
credentials, or drop schemas as default rollback. Public real-time docs do not
specify copied-data retention on offboarding: inspect the actual confirmation or
ask Stripe support, inspect what remains afterward, keep it private, and record
retention separately. [Service terms](https://stripe.com/legal/ssa-service-terms)
describe stopped transmission and removal of supplied credentials on termination;
they do not promise deletion of database copies. Check other pipelines remain active.

Asym Postgres continues owning [business/CRM truth](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
Current tenant-key resolution and webhook donation/gift/refund/workflow effects
remain unchanged; Phase 13's direct-charge Settlement Account Binding is future
architecture, not a prerequisite or an implemented binding to reuse here.
Do not write or alter provider tables, add migrations/seeds/generated app types,
indexes/triggers/RLS policies, browser collections, RPCs, or runtime consumers.
Copied rows must never create gifts, mark donations paid, issue receipts, execute
refunds, grant access, or repair the ledger. Core must continue operating when
this pipeline is absent, disconnected, or delayed.
