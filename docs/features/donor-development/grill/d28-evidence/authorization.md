# D28 — implementation, data and authorization evidence

2026-10-11 UTC. Focused read-only review of current source, committed migrations,
tests and primary database documentation for tenant-optional giving bands. This
appendix proposes requirements; it does not assert that a D28 schema, permission,
calculator or worker exists. No live database, migration, runtime probe or product
edit was performed. Existing tests were inspected, not rerun. Governing sources
take precedence over vendor patterns and over current implementation shortcuts.

## What the repository actually establishes

1. **The legacy score cannot become the new authority.** The
   [initial donor schema](../../../../../supabase/migrations/20250101000000_init_schema.sql:62)
   contains `score NUMERIC DEFAULT 0`, alongside denormalized giving totals. It
   provides no financial lens, window, currency, completeness, algorithm or policy
   version for that number. The
   [missionary roster mapper](../../../../../packages/api/src/missionary-portal/donors.ts:364)
   emits `donor.score ?? 0`; its
   [query](../../../../../packages/api/src/missionary-portal/donors.ts:436) selects
   score, and its [GET path](../../../../../packages/api/src/missionary-portal/donors.ts:581)
   returns the result using a service client and server-derived tenant/profile.
   The [browser-side mapper](../../../../../packages/database/hooks/missionary-donors-model.ts:338)
   repeats the null-to-zero transformation. These are source facts, not proof of
   observed production exposure or an accepted scoring algorithm.

2. **Field-policy metadata is not end-to-end enforcement.** The
   [field-policy foundation](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:1)
   explicitly describes static ceilings, dormant tenant overrides and no resolver
   activation by that migration. Its
   [score rows](../../../../../supabase/migrations/20261005050728_field_policy_foundation.sql:445)
   exclude missionary, donor, public and export surfaces. Thus the broader roster
   path must be reconciled before a real D28 result reaches it. The separate
   [portal snapshot test](../../../../../tests/unit/packages/api/missionary-portal/model.test.ts:129)
   checks a narrower shape; it neither tests the roster endpoint nor proves every
   egress respects that ceiling. The new
   [projection resolver](../../../../../packages/api/src/projection/resolver.ts:7)
   is a pure intersection, explicitly acquiring no authority. Its existence does
   not establish source integration or fresh P12 evidence.

3. **Row access does not imply column or purpose access.** The
   [browser-read migration](../../../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql:157)
   grants authenticated donor SELECT and permits super-admin, same-tenant staff
   membership or the linked profile. This is a row predicate, not the D28
   capability/field/source-purpose contract. The
   [collection registry](../../../../../packages/database/collections/registry.ts:85)
   itself marks donor production RLS/redaction as needing review. This migration
   adds SELECT, not a D28 mutation policy; there is no basis to claim D28 UPDATE
   `USING`/`WITH CHECK` are already implemented. Complete migration/live-state
   qualification remains required at implementation.

4. **Presentation preferences are not a giving-policy engine.** Existing
   [tenant preference routes](../../../../../packages/api/src/admin/crm/table-preferences/route.ts:243)
   derive actor/tenant from authenticated context, validate input and check an
   exact view-default capability. Their
   [service RPC](../../../../../packages/api/src/admin/crm/table-preferences/service.ts:170)
   receives server-supplied actor and capability information. The
   [SQL grants](../../../../../supabase/migrations/20260611160000_crm_table_preferences.sql:311)
   revoke PUBLIC function execution and allow service role. Useful boundaries
   may be reused; mutable display JSON, delegated display managers and fall-through
   defaults must not silently become authority to enable financial analysis,
   change its population or create review work.

5. **Loaded history is deliberately incomplete.** The
   [CRM detail reader](../../../../../packages/api/src/admin/crm/detail/service.ts:244)
   fetches 101 gifts, returns 100 and exposes truncation, with a
   [corresponding test](../../../../../tests/unit/packages/api/admin-crm-detail-report.test.ts:394).
   The [missionary reader](../../../../../packages/api/src/missionary-portal/donors.ts:450)
   separately caps donor pages and related rows. Neither result array supports
   complete-window frequency, totals or population percentiles. Also,
   [last-touch sorting](../../../../../packages/database/hooks/admin-crm-infinite.ts:49)
   uses record-update time, not D27 exchange or financial recency.

6. **Export is an independent boundary.** The
   [CRM report export](../../../../../packages/api/src/admin/crm/reports/export.ts:9)
   checks an export action, takes tenant from the actor, records an audit and
   serializes a report. That is not permission to append a new financial rating
   to its rows. Derived reasons, sorting and counts must receive the same source
   and field qualification as the visible value.

The [identity/access specification](../../../../../openspec/specs/identity-and-access/spec.md:14)
requires server-resolved identity and layered tenant enforcement. P12's
[owner prerequisites](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:11)
require current capabilities, record checks and projection policy. A tenant's
choice to enable bands grants none of those powers to staff, missionaries,
coaches, workers or exports.

## Material concerns and exact prevention language

**Legacy repurposing and disclosure — High severity; plausible during reuse.**
Writing real bands into `donors.score` would attach fresh sensitive meaning to
legacy surfaces that already emit the value. Zero defaults also turn unknown
coverage into apparently poor giving. This narrows implementation, not optional
product scope. **Required:** “D28 SHALL use a typed, source-qualified derived
projection; it SHALL NOT reinterpret or backfill legacy score values as valid
giving bands. All reached egress SHALL be qualified before activation. Unknown,
disabled, unavailable and nonapplicable SHALL remain distinct from a computed
zero or lowest band.” Preserve legacy evidence during migration without exposing
it as newly valid analysis.

**Tenant and authority transformation — Critical impact; plausible without a
single boundary.** A policy editor could attach another tenant's entity/window,
change a row's purpose, impersonate an approver or enable task creation via a
generic update. **Required:** “Configuration and calculation writes SHALL execute
through an authenticated source command. Tenant, actor, execution purpose and
audit attribution SHALL come from trusted server/current P12 context. Submitted
reference choices SHALL be validated for exact current scope and eligibility.
An allowed update SHALL NOT move identity, tenant, financial lens, source purpose
or accepted history into a forbidden state.” Separate capability to configure
bands from capability to view protected underlying facts or manage work. A
machine run records its machine identity and authorizing policy; it does not
invent a human actor.

**Data-model drift — High; plausible if represented as arbitrary JSON.** An
editable single rating can hide what was measured and rewrite historical
interpretation. **Required:** “Every result SHALL bind the exact tenant, subject
grain, source financial lens, relevant Legal Entity/currency scope, observation
window, immutable definition revision, source coverage/as-of evidence and
calculation generation.” Use composite tenant-aware references and uniqueness
for one result per exact admitted scope/generation; an ID-only FK is insufficient
for tenant integrity. Require non-null identities/version references; use typed
absence reasons rather than zero defaults. Prevent deletion of a referenced
definition from cascading through retained business/audit evidence. Retire or
supersede configuration; retention/privacy owners still govern lawful erasure.
Do not add a Legal Entity field to Party merely to simplify this result.

**Shadow finance and arbitrary customization — High; likely if legacy totals
are reused.** An editable calculator can redefine posted/received, double-count
recognition, mix currencies or turn a commitment into money. **Required:** “D28
SHALL consume qualified finance-owned measures, never reconstruct a ledger from
browser rows. Tenant choices SHALL be limited to supported, versioned policy
parameters; no arbitrary SQL, executable expressions, unconstrained cross-domain
formulas or caller-supplied financial totals.” Validate window ordering, units,
inclusive/exclusive boundaries and band consistency centrally. Monetary
comparisons preserve source exact precision and currency, using source-qualified
integer units or exact decimals; do not convert through JavaScript floating-point
arithmetic. No silent currency conversion, legal/recognition conflation or
organization-to-ministry attribution. A separate financial report may aggregate
only under its own admitted owner contract.

**Stale publication and duplicates — High; plausible with scheduled jobs.** A
slow computation may publish after disable/reconfiguration, overwrite a corrected
generation or create repeated review work. **Required:** “Publishing a generation
SHALL atomically verify the current enabled policy revision, source coverage and
expected generation. Stale, canceled or duplicate results SHALL not become
current. Retries SHALL resolve to the same accepted business effect.” Keep
transactions short; calculate bounded inputs outside publication locks where
their immutable evidence permits. An incomplete computation cannot publish a
partly refreshed cohort as one consistent result. Policy changes and source
corrections are distinguishable from changed giving. Historical comparisons use
compatible definitions or explicitly explain the break. Initial activation,
re-enable and backfill establish an evaluated baseline; they are not an excuse
for a task storm. Any permitted task uses its separately qualified review
occurrence and ADR0183 lifecycle, not one task per job attempt.

**Hidden data inference — High; plausible through derived output.** A staff
member may see a band whose value, order or denominator reveals financial facts
they cannot access. **Required:** “Authority SHALL be evaluated for the derived
measure and its explanation, reference population, filters, counts, rankings,
exports and cache reads. Source visibility does not automatically authorize a
broader aggregate; hidden population changes SHALL not create observable changes
outside an explicitly qualified aggregate disclosure.” Prefer a finite
well-explained band policy over adding percentile machinery without a validated
need. If a population-relative policy is admitted, name and qualify its reference
population; the current filtered page is not a reference population. Cache keys
and invalidation include tenant, exact scope, policy/result generation and
current authorization context. Revocation stops disclosure, including signed
downloads and retained previews, under their owner contracts.

## Database and runtime enforcement requirements

For every proposed relation, document primary/composite foreign keys, nullability,
uniqueness, immutable fields, delete behavior and indexes. Validate stable
row-local conditions with constraints. Active configuration and latest-generation
decisions require transactionally coordinated source commands; a `CHECK` that
queries another table cannot enforce a lasting cross-row invariant. A minimal
current-head plus immutable policy revision is sufficient; a new universal event
store or copied gift ledger is unnecessary.

Enable RLS for exposed tables and grant only the operations actually needed.
Ordinary clients must not write generated bands, generation heads or audit
attribution. For permitted mutations, test old-row `USING` and proposed-row
`WITH CHECK`, including upserts and tenant/purpose changes. Importantly, PostgreSQL
uses `USING` as the implicit check for UPDATE/ALL when `WITH CHECK` is omitted;
omission alone is not proof of a bypass. Review the effective combined policies
and grants. RLS does not enforce field immutability by itself.

Review views, RPCs and security-definer functions alongside tables. Where a view
is intended to honor caller policies, use supported invoker semantics; otherwise
keep it inaccessible and expose a qualified server projection. Revoke unintended
PUBLIC function execution, pin safe search paths and restrict elevated routines.
Service role/owners/BYPASSRLS require explicit source validation; neither RLS
enablement nor FORCE RLS makes a superuser safe. No session role or user-editable
JWT metadata substitutes for current P12 authority.

Index tenant/scope/current-generation lookups and referenced keys based on actual
query plans. Avoid one unbounded gift-history scan per visible row. Apply bounded
batch recomputation, per-tenant fair work and resumable source checkpoints. No
numerical latency/capacity guarantee is established by this review.

## Primary documentation and proof needed

Retrieved 2026-10-11 UTC:

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
  via its documentation MCP: grants versus row predicates, proposed-row checks,
  view behavior, service-role bypass and stale JWT caveats. These support layered
  boundaries, not a new permission model.
- [PostgreSQL CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html):
  existing/proposed row semantics and implicit `WITH CHECK`; current page resolves
  to PostgreSQL 18. Version-specific implementation must use Core's actual target.
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
  and [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html):
  cross-row checks, constraints, bypass roles and policy/grant composition.
- [Supabase changelog](https://supabase.com/changelog.md), fetched directly after
  the web reader rejected its Markdown content type; the relevant
  [15.19/17.11 advisory](https://supabase.com/changelog/postgres-15-19-17-11-breaking-changes)
  was opened. Verify the deployed patch level and affected extensions during
  implementation; this is not a claim that the project has upgraded.

The [projection context tests](../../../../../tests/unit/packages/api/projection/context-scope.test.ts:13)
cover wrong tenants/entities, stale context and substituted purpose/source.
They are useful seams, not real D28 integration proof. Required new outcome tests
must prove: same IDs across tenants stay isolated; denied fields do not affect
sort/count/export; forged actor/tenant/policy inputs fail; duplicate and reordered
jobs publish once; disable/reconfigure races cannot publish old work; null or
incomplete finance never yields a low band; exact currency and threshold boundaries
survive; correction/backfill does not fabricate deterioration; and normal API,
browser, direct Data API, RPC, privileged worker and export paths agree.

Use real database roles and effective grants/RLS for database tests, actual
source services for finance/current authority and production-shaped workloads
for plans. A mocked mapper or successful toy RLS fixture cannot qualify those
boundaries. Rollout begins disabled until qualified, keeps compatible readers
ahead of new writers, and fences old workers. Rollback disables generation and
exposure safely while preserving accepted history; it never restores obsolete
authority or reclassifies prior facts through the current formula.
