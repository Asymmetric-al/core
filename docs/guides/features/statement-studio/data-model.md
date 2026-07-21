# Data Model

> **Superseded implementation authority (Phase 18, 2026-07-21).** This file
> preserves pre-Phase-18 design evidence only. Do not dispatch it or use it as
> target architecture. The Phase 18 PRD, authority manifest, renderer
> qualification protocol, ADRs 0033-0039, and OpenSpec change are controlling.
> Phase 18 D17 requires a clean pre-production cutover with no legacy runtime,
> import, backfill, or dual compatibility; D13 forbids raw provider or signed
> object URLs as access authority.

The data model must be tenant-safe, Supabase-current, and flexible enough for standard platform jobs plus tenant-created custom assignments.

## Triggers

Use this doc when planning or changing Statement Studio tables, migrations, RLS, grants, Storage, artifacts, defaults, retention, or purge behavior.

## Workflow Steps

1. Load `docs/ai/skills/supabase/SKILL.md`.
2. Load `docs/ai/rules/backend.md`.
3. Load `supabase/AGENTS.md`.
4. For schema, RLS, indexes, or query performance, load `docs/ai/skills/supabase-postgres-best-practices/SKILL.md`.
5. Verify current Supabase docs/changelog before implementation.
6. Add explicit grants and RLS together in migrations.
7. Run focused SQL/type/route verification.

## Historical persistence evidence and current boundary

Phase 0 previously selected the existing native PDF Studio tables from
`supabase/migrations/20260515140948_native_pdf_studio_foundation.sql` as a
migration base. Phase 18 D17 supersedes that decision. Those tables and their
callers are prototype/removal evidence, not a schema that implementation should
extend or preserve for compatibility.

After the required pre-production environment assertion passes, implementation
deletes or replaces the prototype schema and establishes one clean canonical
`pdf_*` bounded context that satisfies the Phase 18 authority manifest. It does
not import, backfill, alias, dual-write, shadow-read, or preserve legacy rows.
If the assertion discovers real production reliance or irreplaceable data, work
stops before mutation and returns to grooming; the implementation must not
invent a migration path.

**Single store module:** `packages/api` exposes one persistence seam. Feature
slices must not write parallel table families or treat a prototype table as an
independent source of document truth.

## Core Persistence Concepts

The following Phase 0 mapping is retained only as removal and concept evidence:

| Product concept                | Prototype evidence                                   |
| ------------------------------ | ---------------------------------------------------- |
| Tenant template aggregate      | `pdf_templates`                                      |
| Template working/version state | `pdf_template_versions`                              |
| Render attempts                | `pdf_template_renders`                               |
| Generated artifact metadata    | `pdf_template_artifacts`                             |
| Lifecycle/access/purge audit   | `pdf_template_audit_events`                          |
| Batch orchestration            | `pdf_template_batches` and `pdf_template_batch_jobs` |

The remaining product concepts are requirements, not approved table names:

- system document-job catalog;
- system starter-template ownership;
- tenant job settings and scoped assignments;
- variable catalog and tenant overrides;
- retention and storage-threshold policy.

The Phase 18 foundation maps every approved concept to the one final `pdf_*`
schema. SQL names are subordinate to the authority manifest and must preserve
separate source issuance, publication, request, artifact, current-head, access,
delivery, and records axes. User-facing product language remains Statement
Studio.

## Defaults

Default assignment resolution order:

1. Authorized one-off render override.
2. Exact scoped default.
3. Parent scoped default (for example event-scoped default when rendering a
   session-scoped job: walk `scope_kind` hierarchy defined in Phase 0).
4. Tenant-wide default for the standard job key.
5. System starter template only for preview/setup unless tenant explicitly activates it.

Each tenant can have only one active default for the same
`tenant_id + job_key + scope_kind + coalesce(scope_id, '')`. Treat NULL
`scope_id` as tenant-wide scope in uniqueness checks. Enforce with partial
unique indexes plus app validation and audit logs.

## Supabase Best Practices

- Make Data API exposure and grants explicit.
- Enable RLS on exposed tenant-owned tables.
- Use `TO authenticated` policies with real authorization predicates.
- Use `USING` and `WITH CHECK` for insert and update mutation policies.
- Index tenant, scope, policy, and foreign-key columns.
- Avoid `auth.role()` authorization.
- Do not authorize from `user_metadata`.
- Keep service-role access server-only.
- Use `security_invoker=true` for RLS-dependent views.
- Keep generated PDFs in private Supabase Storage.
- Delete/purge files through the Storage API, not SQL-only deletes.

## Checklist

- [ ] Every tenant-owned table has `tenant_id` or an equivalent tenant-safe scope.
- [ ] Grants and RLS are deliberate and reviewed together.
- [ ] Policy columns and foreign keys are indexed.
- [ ] Generated artifacts keep template version, job key, scope, recipient/reference, render time, checksum/storage pointer, and retention state.
- [ ] Historical artifacts never change when defaults change.
- [ ] Storage paths and downloads are tenant-aware.
