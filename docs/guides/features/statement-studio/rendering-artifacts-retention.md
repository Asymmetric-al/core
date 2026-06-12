# Rendering, Artifacts, And Retention

Generated PDFs must be tenant-safe, auditable, downloadable through authorized boundaries, and manageable under tenant retention settings.

## Triggers

Use this doc when implementing render jobs, artifact records, downloads, Storage, retention, purge, rollback, or generated PDF audit behavior.

## Workflow Steps

1. Resolve template default and published template version.
2. Build server-side tenant-scoped DTO through the owning resolver.
3. Render through the approved Statement Studio renderer.
4. Store generated PDF in private Supabase Storage.
5. Store artifact metadata in Postgres.
6. Expose downloads through server-checked access or short-lived signed URLs.
7. Apply retention and purge policy.
8. Keep audit/tombstone metadata.

## Render Rules

- Production defaults point to immutable published versions.
- Drafts are for edit/preview only.
- Production values resolve at render time.
- Generated artifacts store exact template version and render metadata.
- Historical artifacts are not rewritten when defaults change.
- Rollback changes future defaults only.

## Storage And Downloads

- Use private Supabase Storage buckets.
- Keep Postgres artifact rows as source of truth.
- Use tenant-aware object paths.
- Store file size, checksum/hash, storage pointer, retention status, and audit metadata.
- Use signed URLs or route-handler streaming after server-side authorization.
- Keep public buckets out of generated PDF delivery.
- Use Supabase Storage APIs for delete/purge.

## Retention

Default posture:

- Tax receipts, annual statements, audit certificates, signed/legal documents: long retention.
- Event badges, tickets, rosters, exports, temporary packets: configurable shorter retention.
- Care/private packets: strict access, configurable retention, audit reason.
- Draft preview renders: short-lived.

Tenant admins can configure:

- Retention windows.
- Protected categories.
- Manual purge eligibility.
- Role/capability requirements.
- Audit reasons.
- Storage thresholds.
- Oldest-first cleanup.

## Checklist

- [ ] Artifact metadata remains after file expiry/purge.
- [ ] Purge removes files but leaves audit tombstones.
- [ ] Automatic cleanup deletes only eligible files.
- [ ] Protected legal/tax/sensitive classes require explicit tenant policy before deletion.
- [ ] Downloads are tenant and subject scoped.
- [ ] Service role is never exposed to browsers.
