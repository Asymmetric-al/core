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

## Canonical Persistence (Phase 0 proposal pending HITL merge)

**Phase 0 (#312) proposes one canonical Postgres migration base before SS-01+
ships schema.** The repo already has native PDF Studio tables from
`supabase/migrations/20260515140948_native_pdf_studio_foundation.sql`:

- `pdf_templates`, `pdf_template_versions`, `pdf_template_renders`,
  `pdf_template_artifacts` (and related native PDF Studio tables).

**Proposal:** extend these `pdf_*` tables rather than introducing parallel
`document_*` tables. Rename an existing table only through an explicit
migration/cutover. The `document_*` names below are **conceptual** labels for
product language and gap analysis only. Each concept must map to an existing
table/column, an intentional extension, or an explicitly justified net-new
table without duplicating template, version, render, or artifact truth.

**Single store module:** `packages/api` exposes
one persistence seam; feature slices must not write parallel table families.

## Core Tables

Recommended model shape (conceptual - map existing concepts to `pdf_*` and add
only missing catalog/assignment/variable/retention concepts):

- `document_job_catalog`: system-owned standard document jobs.
- `document_template_library`: system-owned starter templates and starter versions.
- `tenant_document_job_settings`: tenant activation, labels, visibility, and capability overrides.
- `tenant_document_template_assignments`: tenant default mapping for job plus optional scope.
- `pdf_templates` or future renamed tenant template table: tenant-owned template records.
- `pdf_template_versions` or future renamed version table: immutable draft/published/archive versions.
- `document_artifacts` (conceptual alias for **`pdf_template_artifacts`** /
  **`pdf_template_renders`** — do not create a second artifact table family):
  generated PDF artifact records shared safely across app surfaces.
- `pdf_template_audit_events`: canonical audit history for render, download,
  purge, retention, rollback, and assignment changes; do not add a parallel
  `document_artifact_events` table.
- `document_variable_catalog`: platform variable definitions.
- `tenant_document_variables`: tenant labels, grouping, fallbacks, visibility, custom variables, and mappings.

Phase 0 proposes retaining the existing `pdf_*` names as the canonical
migration base.
Foundation work may choose `pdf_*` names for the missing concepts, but it must
not introduce a second template/version/render/artifact vocabulary or store.
User-facing product language remains Statement Studio.

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
