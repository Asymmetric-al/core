# Rendering, Artifacts, And Retention

> **Superseded implementation authority (Phase 18, 2026-07-21).** This file is
> retained as historical evidence only. Use Phase 18 for current artifact,
> current-head access, record, retention, and disposal contracts. D13 requires an
> authenticated Asym route that authorizes every request and returns the exact
> frozen artifact; raw provider, bucket, or signed object URLs are never access
> authority.

Generated PDFs must be tenant-safe, auditable, downloadable through authorized boundaries, and manageable under tenant retention settings.

## Triggers

Use the Phase 18 PRD and authority manifest when implementing render jobs,
artifact records, downloads, custody, retention, disposal, or generated-document
evidence. Use this file only to locate older assumptions that must be removed.

## Workflow Steps

1. Accept an idempotent generation request that pins one immutable source-owned
   Facts Package and one complete published Phase 18 publication graph.
2. Authorize the request, purpose, recipient, tenant/issuer, jurisdiction pack,
   and restricted-person policy at the server boundary.
3. Render through the single D3-qualified renderer; fail closed if no winner is
   active or any proof/contract is invalid.
4. Validate the PDF profile, accessibility, bytes, checksum, page/output limits,
   and purpose-specific legal content before promotion.
5. Atomically freeze one exact artifact and advance the logical-document current
   head with compare-and-set protection.
6. Expose the current or explicitly authorized historical version only through
   the authenticated Asym access route; authorize every request and byte range.
7. Apply the purpose-owned, hold-aware records schedule and verified disposal.
8. Preserve body-safe evidence and tombstones without preserving a second
   accessible file copy.

## Render Rules

- Production defaults point to immutable published versions.
- Drafts are for edit/preview only.
- Production values come only from the request-pinned immutable Facts Package;
  the renderer never rereads mutable source rows.
- Generated artifacts store exact template version and render metadata.
- Historical artifacts are not rewritten when defaults change.
- Rollback changes future defaults only.

## Storage And Downloads

- Keep custody private and provider-neutral behind the Phase 18 artifact port.
- Keep the Phase 18 logical document, version, artifact, and current-head records
  as authority; a bucket/provider pointer is custody metadata only.
- Use tenant-aware object paths.
- Store file size, checksum/hash, storage pointer, retention status, and audit metadata.
- Stream exact bytes through the authenticated Asym route after server-side
  tenant, subject, recipient, purpose, version, currentness, and revocation
  checks. Never expose raw provider, bucket, or signed object URLs.
- Keep public buckets out of generated PDF delivery.
- Use Supabase Storage APIs for delete/purge.

## Retention

Default posture:

- Tax receipts, annual statements, audit certificates, signed/legal documents: long retention.
- Event badges, tickets, rosters, exports, temporary packets: configurable shorter retention.
- Care/private packets: strict access, configurable retention, audit reason.
- Draft preview renders: short-lived.

Tenant admins can configure only the bounded choices permitted by each
code-owned purpose schedule:

- Retention windows.
- Protected categories and longer allowed retention where applicable.
- Manual disposal eligibility after minimums and holds are satisfied.
- Role/capability requirements.
- Audit reasons.
- Storage thresholds.
- Eligible oldest-first cleanup within the purpose schedule.

## Checklist

- [ ] Required evidence remains after verified physical disposal without
      retaining another accessible artifact copy.
- [ ] Disposal removes every custody copy and leaves only the permitted
      privacy-safe tombstone/evidence.
- [ ] Automatic cleanup deletes only eligible files.
- [ ] Legal/tax/sensitive minimums and active holds cannot be shortened by tenant
      settings.
- [ ] Downloads are tenant and subject scoped.
- [ ] Service role is never exposed to browsers.
