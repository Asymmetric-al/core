# ADR-0025: Eve retention and replay lifecycle

- Status: Accepted
- Date: 2026-07-18
- Issue: #424

## Context

Eve needs redacted replay/debug packages that remain useful for investigations
without turning Postgres into a file store or retaining operational records
forever. The accepted product contract requires category retention with a
180-day default, a short metadata-only model-gateway category, incident/legal
holds, and tenant/owner-scoped access.

## Decision

Use `eve_retention_categories` as the app-owned lifecycle catalog. Audit records,
run summaries, and ordinary replay artifacts default to 180 days. Gateway
telemetry is a dedicated 30-day metadata-only category; prompts and responses
are not schema fields.

Store large bodies in the private `eve-replay-artifacts` Supabase Storage bucket.
The app constructs each object path from verified tenant ID, verified profile ID,
and a server-generated artifact ID. Postgres stores only queryable redacted
metadata: kind, category, summary, content type, byte count, SHA-256, lifecycle
state, and expiry. Artifact bodies are parsed/redacted and hashed by the
authenticated server before upload. Short-lived download URLs are issued only
after both tenant and owner predicates pass.

Incident and legal holds are human-set, human-cleared, tenant-bound records with
immutable lifecycle events. They override expiry but do not pause automation,
grant authority, or alter governance policy.

Artifact expiry is two-phase. A security-definer claim function locks eligible
rows with `FOR UPDATE SKIP LOCKED`, excludes active artifact/category holds, and
moves possible Storage objects to `delete_pending`. The server deletes Storage
objects, then finalizes only the successful deletions. Upload-pending metadata
uses the same deletion path because an interrupted post-upload completion may
have left an object behind. Record expiry is separately bounded and hold-aware.

## Consequences

- Postgres stays queryable without storing artifact bodies.
- A transient Storage failure leaves a retryable `delete_pending` row rather
  than falsely claiming deletion.
- Browser roles have no direct table or RPC authority; access cannot depend on
  UI hiding.
- Memory retention remains a separate capability.
