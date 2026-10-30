# Email normalization: CI migrate step

Owner: #2254. The full contract (function, parity fixture, locale limits, keys
and the read-only preflight query) is in
[`docs/security/identity-email-normalization.md`](../security/identity-email-normalization.md).

## The `migrate` step

The `migrate` job in `.github/workflows/ci-integration.yml` ends with this step,
after the document-cutover reader-role check:

- **Name:** `Verify identity email normalizer and donor keys (real stack)`
- **Runs:** `bun x vitest run tests/unit/acceptance/issue-2254/identity.realstack.acceptance.test.ts`
  with the job's `DATABASE_URL` (no step `env`).

## What it checks

On the migrated and seeded database it checks the `public.normalize_email`
parity fixture, the generated `donors.email_normalized` column, the two donor
keys and the 10 new field-policy rows.

It also checks the migration's duplicate pre-check. On a disposable database
with the chain applied up to the prior migration, it inserts two same-tenant
donors that collide on one of the keys the migration adds:

- `(tenant_id, profile_id)`, the same profile twice in one tenant
- `(tenant_id, email_normalized)`, emails that differ only in case or
  whitespace, so they collide once normalized

The step then applies the migration and drops the disposable database
afterwards.

## How it fails

The migration must fail before any DDL. Its single exception reports ids only:
the group count, then `(key_kind, tenant_id, donor_ids)` per group. It contains
no email addresses or other PII. The step asserts that the report lists both
donor ids and the tenant id, contains no email text, and leaves the schema and
rows unchanged. If any of that does not hold, the step fails, and so does the
`migrate` job.
