# Data Model

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

## Canonical Persistence (Phase 0 Decision)

**Phase 0 (#312) selects one canonical Postgres migration base before SS-01+
ships schema.** The repo already has native PDF Studio tables from
`supabase/migrations/20260515140948_native_pdf_studio_foundation.sql`:

- `pdf_templates`, `pdf_template_versions`, `pdf_template_renders`,
  `pdf_template_artifacts` (and related native PDF Studio tables).

**Decision:** extend these existing `pdf_*` tables rather than introducing a
parallel `document_*` template/version/render/artifact/audit store. Rename an
existing table only through an explicit migration/cutover. The missing product
concepts below do not prescribe SQL identifiers; implementation must map each to
an existing table/column, an intentional extension, or an explicitly justified
net-new `pdf_*` table without duplicating truth.

**Single store module:** `packages/api` exposes
one persistence seam; feature slices must not write parallel table families.

## Core Persistence Concepts

Phase 0 ratifies these existing table names and roles:

| Product concept                | Canonical persistence direction                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| Tenant template aggregate      | `pdf_templates`                                                                     |
| Template working/version state | Mutable drafts and immutable published/archive snapshots in `pdf_template_versions` |
| Render attempts                | `pdf_template_renders`                                                              |
| Generated artifact metadata    | `pdf_template_artifacts`                                                            |
| Lifecycle/access/purge audit   | `pdf_template_audit_events`                                                         |
| Batch orchestration            | `pdf_template_batches` and `pdf_template_batch_jobs`                                |

The remaining product concepts are requirements, not approved table names:

- system document-job catalog;
- system starter-template ownership;
- tenant job settings and scoped assignments;
- variable catalog and tenant overrides;
- retention and storage-threshold policy.

The foundation change must map each missing concept to an extension of the
existing `pdf_*` family, a column/view, or an explicitly justified net-new
`pdf_*` table. It must not turn conceptual `document_*` labels into a parallel
template, version, render, artifact, or audit store. User-facing product
language remains Statement Studio.

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
