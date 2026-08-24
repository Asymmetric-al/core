# ADR-0179: Census-gated clean target and one-authority pre-production replacement

**Status:** Accepted (founder-ratified Phase 23 D35 C-prime-R, 2026-08-24)

## Context

Core has a material Payload/Web Studio prototype with collections, migrations,
fixtures, media integration, public readers, and tests, but its current shapes
do not implement the ratified Phase 23 D1–D34 model. Preserving broad mutable
Pages, literal navigation paths, duplicate identity/role concepts, incomplete
Site and locale scope, provider fallbacks, mutable public reads, or prototype
fixture contracts would make temporary implementation choices permanent.

Core is not in production at this decision point. Building a live migration
control plane—dual writes, CDC, public shadow traffic, final-delta processing,
active-editor draining, maintenance UI, or long-lived compatibility—would add
technical debt for users and continuity obligations that do not exist. At the
same time, “non-production” does not prove that every shared database row or
object is disposable, nor does it justify an unguarded reset.

## Decision

Phase 23 replaces the current CMS with the clean D1–D34 target through one
**census-gated pre-production replacement**:

1. Revalidate that each named target is non-production and identify its exact
   project, environment, database, owned schema, and object store before any
   destructive action.
2. Census repository artifacts and named non-production state in dry-run mode.
   Confirmed fixtures are discarded and regenerated; derived state is rebuilt;
   only deliberately retained development content is transformed; unresolved
   state blocks its affected environment.
3. Build one reviewed clean Payload v4 `cms` baseline against the exact cohort
   admitted under D34. An environment-wide reset is permitted only when the
   whole database is proven disposable; otherwise replacement is confined to
   the CMS-owned namespace and leaves unrelated Supabase migrations intact.
4. When a non-empty retain manifest proves the need, use one temporary,
   deterministic, idempotent semantic exporter/importer through supported
   Payload, application, and storage APIs. Preserve only ratified semantic
   identities and external route obligations; rebuild projections and verify
   both media metadata and bytes under D27.
5. Preserve each entity's ratified ownership and scope. Supabase Auth and Asym
   authorization remain staff authority; source domains retain operational
   truth; D1 remains public authority; Tenant-wide Media remains Tenant-owned
   with Site use represented as a relationship.
6. Permit independently verified target-only preparation, followed by one
   bounded final authority sequence that moves every writer, reader, Preview
   path, compiler input, script, and test to the target. UI flags never select
   authority.
7. Remove every legacy schema, collection, route, reader, writer, stock-Admin
   fallback, feature flag, literal-path authority, fixture contract, adapter,
   and temporary transform before D35 closes. Provider preferences survive only
   through an exact target semantic identity; fuzzy remapping is prohibited.
8. Keep D35's internal replacement invisible to ordinary staff. D29 retains
   staff-facing portability, D30 privileged diagnostics, and D31 contextual
   Content Health/recovery. Staff receive only the final provider-free Web
   Studio with truthful status, equivalent desktop/mobile navigation, and
   complete accessibility behavior.

The complete exact 36-clause authority is preserved in
[Phase 23 D35](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d35--census-gated-clean-target-and-one-authority-pre-production-replacement)
and its
[decision brief](../prds/sitestacker-parity/research/phase-23-d35-current-implementation-replacement-decision-brief.md).

## Consequences

- The current implementation is evidence to classify, not architecture to
  protect.
- A fixture-only environment takes the clean reset/reseed path without a
  compatibility converter or per-record receipts.
- Deliberately retained development content receives a narrow, encrypted,
  git-ignored, short-lived manifest and one temporary semantic transform; real
  personal, authentication, secret, or source-owned operational data never
  becomes repository fixture truth.
- Shared-environment schema push is disabled, one serialized actor mutates the
  target, and output is access-bounded and redacted.
- Failure before target acceptance leaves the environment explicitly unusable
  until a clean reset, deterministic rerun, and complete re-verification pass.
- D35 creates no migration dashboard, general ETL framework, CDC pipeline,
  runtime version selector, second CMS, or staff migration product.
- Completion requires fresh-clone/empty-database reproducibility, exact Tenant
  and permission isolation, draft exclusion, route/locale integrity,
  relationship closure, media row-and-byte proof, clean generated artifacts,
  D1 output, final Web Studio journeys, accessibility, and D33 capacity and
  recovery evidence.
- If Core or any target becomes production or customer-relied-upon before this
  replacement executes, destructive work stops and the live-cutover posture
  must be decided again. This ADR does not silently authorize production use of
  the pre-production fast path.
