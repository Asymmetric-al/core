# Phase 23 D35 — Current Implementation Census and Replacement Research

**Status:** Current-state and primary-source evidence supporting the
founder-ratified exact 36-clause Phase 23 D35 C-prime-R.  
**Date:** 2026-08-24  
**Scope:** Current Payload/Web Studio source, non-production state handling,
clean target construction, optional retained-state transformation, authority
replacement, UX, verification, and legacy retirement.  
**Decision boundary:** D34 qualifies the exact Payload v4 engine cohort. D35
decides how the current implementation reaches the D1–D34 product model.

## Executive conclusion

Core has a material CMS prototype, not an empty placeholder: ten registered
Payload collections, a committed Postgres migration, local fixtures, media
storage integration, native Web Studio screens, public APIs, and tests. It is
valuable implementation evidence.

It is not the Phase 23 target. Current code still exposes broad mutable Page
shapes, literal navigation paths, duplicate CMS user/role concepts, incomplete
Site and locale scope, collection-specific native/fallback flags, direct
mutable public Payload readers, and no D1 immutable Public Site Generation
authority. Preserving those shapes by default would preserve the exact coupling
that D1–D34 resolved.

The founder confirmed that Core is not in production. The proportionate
permanent path is therefore:

1. census repository and explicitly named non-production state;
2. build the D1–D34 target cleanly from an empty database;
3. reset and regenerate confirmed fixtures and derived state;
4. transform only deliberately retained development content through one
   temporary semantic converter; and
5. switch all runtime authority once, delete the prototype and converter, and
   prove a fresh clone can recreate the complete target.

Production architecture quality is still mandatory. Production migration
ceremony is not. Dual writes, CDC, public shadow traffic, live-editor draining,
maintenance UI, permanent migration tables, and long-lived compatibility would
be needless complexity unless the product's production status changes before
execution.

## Evidence boundary and freshness

This review used current local source, current `origin/develop`, committed
migrations and scripts, tests, the ratified D1–D34 documentation, npm registry
metadata, and live official Payload, Supabase, PostgreSQL, Sanity, Contentful,
and W3C documentation.

It did **not** connect to or mutate a hosted Supabase project, Storage bucket,
Vercel Blob store, or Payload database. No checked-in evidence proves whether
any shared non-production environment contains deliberate work. That fact must
come from the read-only D35 census at implementation time.

The required repo-scoped external index returned an obsolete claim that Payload
was absent. Direct current source disproved it. D35 therefore records the index
as stale and uses local source and live primary documentation rather than
blending incompatible snapshots.

## Current implementation census

### Engine, schema, and generated state

- `apps/admin/payload.config.ts` mounts Payload in `apps/admin`, registers ten
  collections, uses the Postgres adapter with schema `cms`, and mounts the
  Admin route at `/web-studio`.
- The config leaves development `push` enabled unless
  `PAYLOAD_DISABLE_SCHEMA_PUSH=1`; `scripts/cms/run-payload-command.mjs`
  disables it for migration commands. D35 must make shared-environment safety
  explicit rather than infer it from `NODE_ENV`.
- One generated migration,
  `apps/admin/src/migrations/20260515_173042_init_payload_cms.ts`, creates the
  prototype schema. Its `down` path drops CMS tables with `CASCADE`; it is not
  a safe general rollback contract.
- `apps/admin/package.json`, root `package.json`, and `bun.lock` pin a matching
  `4.0.0-internal.1f9ae9a` Payload cohort. D34 treats that as a spike, not the
  production-admitted cohort.
- Payload types and Admin import maps are generated artifacts and can drift
  from config if not regenerated and checked.

### Collections and current semantics

The registered collection files are:

- `cms-users.ts`;
- `media.ts`;
- `ministry-updates.ts`;
- `missionary-giving-pages.ts`;
- `missionary-profiles.ts`;
- `navigation.ts`;
- `page-templates.ts`;
- `pages.ts`;
- `project-pages.ts`; and
- `tenants.ts`.

`page-builders.ts` is a shared builder rather than a registered collection.
The present shapes are prototype-specific:

- broad Page fields mix composition and presentation concerns;
- `legacyContentFallback` keeps an old content interpretation alive;
- `templateKey` and literal navigation `href` values encode weakly typed
  relationships;
- collection version/draft posture is inconsistent;
- current records do not implement D1's exact Page, placement, locale lineage,
  and immutable generation semantics; and
- missionary/project/update collections risk copying facts owned by their
  established product domains instead of consuming bounded projections.

These are candidates for clean replacement, not migration constraints.

### Identity, authorization, and tenant scope

- Supabase Auth and Asym authorization are the product's existing identity and
  permission authority.
- Payload currently has its own user projection, provider roles, Tenant
  relationships, and Supabase identifiers. A blind row copy could create two
  permission authorities or an incorrect Tenant crosswalk.
- Payload access control and the multi-tenant plugin remain provider controls,
  not proof that every system operation, relationship, raw endpoint, draft,
  version, Preview, media, or public query is Tenant-safe.
- If any CMS table is reachable through Supabase's Data API, Postgres grants
  and RLS govern that path independently of Payload access callbacks. Actual
  grants and project exposure must be inspected rather than inferred from the
  schema name.

### Web Studio and editorial state

- `apps/admin/src/cms-ui/web-studio/feature-flags.ts` contains
  `CMS_WEB_STUDIO_NATIVE_*` flags that can split staff journeys between native
  Mission Control surfaces and provider fallbacks.
- Current editor-state copy exposes Payload terminology; the native list offers
  an ordinary “Open stock list view” escape; and the edit workspace can expose
  API links, raw IDs, Tenant IDs, permission details, and provider framing that
  belong behind D30 diagnostics rather than in ordinary editorial work.
- `studio-nav-rail.tsx` hides the desktop rail below the `md` breakpoint without
  proving an equivalent Web Studio mobile entry. The clean target must provide
  equivalent navigation and task completion rather than merely hiding desktop
  controls.
- Current screens, Preview, autosave, tests, and fixture journeys are valuable
  UX and integration evidence, but several tests freeze prototype collection
  shapes rather than the D1–D34 public behavior. Current native E2E coverage is
  primarily shell and route-heading proof, and the general accessibility suite
  does not establish the complete Web Studio journeys.
- D35 should not expose migration concepts to ordinary staff. The replacement
  is pre-production; engineering effort belongs in the final Web Studio
  information architecture, empty states, clear saved/draft/public status,
  equivalent mobile/desktop navigation, accessibility, and removal of stock-
  Admin fallback paths. D12 owns one truthful editorial status, D30 owns
  privileged provider diagnostics, and D31 owns contextual Content Health and
  recovery; D35 must not duplicate any of them.

### Public reads and publication

- Five public API route families exist under
  `apps/admin/app/api/cms/public`.
- `published-content-reader.ts` explicitly filters by Tenant and published
  status and uses `overrideAccess: false`, which is a good access-control seam.
  It still reads mutable Payload documents directly rather than an immutable D1
  Public Site Generation.
- `resolve-tenant.ts` currently returns `siteId: null`, which cannot represent
  D1's exact Tenant × environment × Site × locale public scope.
- The current public routes, Preview inputs, and tests must move to D1 output in
  one authority replacement. A compatibility reader must not survive “just in
  case.”

### Media and stored bytes

- `media.ts` supports local `staticDir: "media"`; runtime integration can use
  the Vercel Blob storage adapter under one fixed `web-studio/media` prefix.
  Current object keys do not encode Tenant ownership; that ownership remains in
  CMS metadata and access controls.
- Database metadata and object bytes are separate custody facts. A retained
  media item needs a source identity, destination key, byte count, MIME type,
  checksum, and verified completion through supported provider APIs.
- A database-only reset, backup, or clone cannot prove or restore external
  object bytes. D35 must follow D27 rather than copy media rows and assume
  success.

### Fixtures and tests

- `scripts/cms/seed-local.mjs` creates deterministic local Pages, draft
  content, navigation, media, profiles, updates, missionary/project records,
  and a second-Tenant route-collision scenario.
- `tests/e2e/cms-local-happy-path.spec.ts` verifies the seeded local Admin and
  public journey.
- `tests/unit/cms/collection-contracts.test.ts` locks several current prototype
  shapes.

The test harness and deterministic-scenario pattern should remain. The current
fixture meanings and shape-locking assertions should be rewritten from the
target contracts rather than imported through compatibility code.

## Current upstream facts

### Payload v4 status

On 2026-08-24, npm reports:

| Package cohort                                                 | `latest` | `canary`          |
| -------------------------------------------------------------- | -------- | ----------------- |
| `payload` and the checked first-party `@payloadcms/*` packages | `3.88.0` | `4.0.0-canary.29` |

The checked first-party cohort includes `@payloadcms/next`,
`@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`,
`@payloadcms/plugin-multi-tenant`, and
`@payloadcms/storage-vercel-blob`. Stable v4 therefore cannot be assumed today.
D34's live discovery and exact-cohort qualification remain mandatory.

The current [Payload 3→4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx)
is prerelease source, not a frozen specification. Relevant changes include:

- default relationship query depth becomes `1`;
- versions become enabled by default for most collections and globals;
- generated Lexical types become strict discriminated unions;
- generated JSON Schema uses `$defs`;
- storage adapter configuration and direct-upload contracts change; and
- Admin, auth-user, plugin, job, and generated-type APIs change.

D35 must configure schema-affecting defaults explicitly, regenerate artifacts
from the admitted exact cohort, and test product semantics rather than depend on
current provider defaults.

### Payload database and access behavior

- Payload describes Postgres `push` as a development sandbox workflow and
  requires migrations outside development. It warns not to mix the two:
  [Postgres adapter](https://payloadcms.com/docs/database/postgres) and
  [migrations](https://payloadcms.com/docs/database/migrations).
- Each migration runs in its own transaction. Nested Local API or database
  operations participate when the migration request is passed through:
  [transactions](https://payloadcms.com/docs/database/transactions).
- Payload Local API calls bypass access control by default. User-originated
  operations require the authenticated user and `overrideAccess: false`:
  [Local API access control](https://payloadcms.com/docs/local-api/access-control).

Consequences for D35:

- a destructive fresh migration is allowed only for a database proven wholly
  disposable, not merely because one schema is pre-production;
- large optional content conversion should not be hidden inside one giant
  schema transaction;
- elevated seed/import operations need an explicit system context;
- ordinary access invariants remain active; and
- external side effects are suppressed narrowly during import and rebuilt
  afterward.

### Supabase migrations, branches, grants, and storage

- Supabase migrations are source-controlled and applied in timestamp order;
  it recommends coordinating one remote migration actor:
  [database migrations](https://supabase.com/docs/guides/deployment/database-migrations).
- Seeds run after migrations and initialize reproducible local/test state:
  [database seeding](https://supabase.com/docs/guides/local-development/seeding-your-database).
- Supabase branches are isolated and data-less by default; production data is
  not cloned automatically:
  [branching](https://supabase.com/docs/guides/deployment/branching).
- `db reset --linked` is destructive. Even here it requires proof that the
  linked project is disposable:
  [local workflow](https://supabase.com/docs/guides/local-development/cli-workflows).
- Grants determine whether a role can reach a table; RLS separately limits
  reachable rows. New projects now default to explicit grants; all existing
  projects are scheduled to adopt that default on 2026-10-30, while existing
  tables retain their current grants:
  [Data API grants change](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
  and [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
- Database backups do not include stored object bytes, and direct SQL changes
  to the `storage` schema can orphan objects:
  [backups](https://supabase.com/docs/guides/platform/backups) and
  [Storage schema](https://supabase.com/docs/guides/storage/schema/design).

These facts support a clean local/branch target, explicit environment identity,
one shared-environment migration actor, deliberate grants/RLS, and a separate
media byte manifest. They do not justify a new migration service.

### Comparable CMS practice

- [Sanity content migrations](https://www.sanity.io/docs/content-lake/schema-and-content-migrations)
  default to dry-run, report affected document IDs and patches, recommend an
  export/copy before execution, and bound concurrency.
- [Contentful environment aliases](https://www.contentful.com/developers/docs/tutorials/general/deploying-changes-with-environment-aliases/)
  support isolated release environments, one editorial authority, test-before-
  promotion, one alias switch, and rollback for live systems.

The proven principles are dry-run, visible evidence, isolation, one authority,
and verification before promotion. Contentful's live-environment machinery is
not evidence that a pre-production product should build an equivalent platform.

### UX and accessibility evidence

W3C's current [status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
requires important dynamic status to be programmatically available without
unnecessarily moving focus. Its
[Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) and
[Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) guidance also
requires meaningful navigation order and narrow/zoomed content without
two-dimensional scrolling for ordinary content. Applied here:

- operator progress should report real named stages, not guessed percentages;
- failures should name the affected scope and next action;
- ordinary staff should never be forced through an engineering migration UI;
- shared test environments should identify their disposable nature quietly and
  persistently; and
- the final Web Studio must preserve context, ordering, status, and actions for
  keyboard, focus, screen-reader, reduced-motion, zoom/reflow, touch, and mobile
  users across its real task journeys.

## Disposition model

The census needs four states, not a database-backed migration taxonomy:

| Disposition          | Meaning                                                                                     | Permanent handling                                         |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Discard fixture/demo | Confirmed synthetic or obsolete prototype state                                             | Reset and recreate from target fixtures                    |
| Transform retained   | Deliberately valuable non-production content with an owner and target meaning               | Export, transform once, verify, then delete converter      |
| Regenerate derived   | Search, cache, renditions, Used-in, health, sitemap, public generation, generated artifacts | Rebuild from target authority                              |
| Unresolved           | Ownership, sensitivity, semantics, relationship, route, or byte custody is unknown          | Block that environment's destructive action until resolved |

No state is retained merely because it exists. No unresolved item is silently
discarded. No unresolved item causes a permanent quarantine product.

## Permanent architecture versus temporary mechanism

### Permanent

- D1–D34 domain model and one D1 public authority;
- D34-qualified exact Payload v4 cohort behind Asym boundaries;
- clean `cms` baseline migrations with explicit defaults;
- Supabase Auth/Asym authorization authority;
- deterministic target fixtures;
- D27 media custody;
- target Web Studio and public tests; and
- fresh-clone/empty-database reproducibility.

### Temporary, only if evidence requires it

- read-only census output;
- encrypted git-ignored retain manifest;
- legacy source adapter;
- domain-shaped DTO;
- idempotent target importer;
- ephemeral old-to-new identity map; and
- machine-readable verification report.

The exporter may know old physical tables. The importer may not. After every
named environment is rebuilt and verified, temporary code and files are deleted.

### Explicitly not built

- application dual writes or two editable authorities;
- CDC or logical replication;
- public shadow traffic;
- final-delta processing or per-Tenant CAS pointers;
- live-editor/autosave draining or maintenance countdowns;
- permanent migration tables, dashboards, job fleets, or ETL registries;
- long-lived compatibility collections, readers, fallbacks, or flags; or
- a staff-facing migration center.

## Target user journeys

### Operator journey

1. **Identify.** The command names the exact environment, database, schema, and
   storage target and says whether destructive work is permitted.
2. **Inventory.** Dry-run groups state as Regenerate, Retain, or Needs a
   decision, with exact counts.
3. **Decide.** Retention is a deliberate manifest review, not an automatic
   checkbox sweep. Unresolved data has a plain reason and owner.
4. **Rebuild.** The command reports Export, Schema, Fixtures, Retained content,
   Derived projections, and Verify as real stages.
5. **Resolve.** An error names Tenant, Site, locale, record, relationship, path,
   or object and explains the required correction. Nothing is silently skipped.
6. **Finish.** One result says Ready for testing or identifies the failed stage,
   with counts, checksums, and test references.

This is CLI/report UX for the very small operator audience, not a product
workspace.

### Staff journey

- Staff enter only the final Mission Control Web Studio.
- A fresh Tenant receives a purposeful, template-led start rather than a blank
  provider collection or migration notice.
- Deliberately retained content appears in the same final information
  architecture without “legacy” badges or duplicate screens.
- Save, draft, Preview, schedule, and Publish states use the ratified language
  and make public status unmistakable.
- Shared test environments have one quiet, persistent, accessible label that
  content may be reset.

### Public journey

There is no public cutover journey because no production public audience is
being migrated. Donors, missionaries, and visitors receive only fully verified
D1 public generations after launch gates. Partially rebuilt and prototype
content never becomes a fallback.

## Verification matrix

| Proof                 | Required result                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Environment safety    | Exact target identity; unknown or production-classified target refused                                                               |
| Empty bootstrap       | Fresh clone plus empty database builds the complete target                                                                           |
| Fixture determinism   | Stable Tenant/Site/locale/source/path relationships; declared rerun behavior                                                         |
| Retained transform    | If used, source/target counts, mappings, relationship closure, and digests reconcile                                                 |
| Tenant safety         | Positive and negative access tests across two or more Tenants, including drafts, versions, Preview, media, and raw/provider surfaces |
| Routes and locales    | No collisions, silent fallback, orphan placement, or ambiguous canonical path                                                        |
| Media                 | Metadata and verified bytes reconcile; missing bytes fail closed                                                                     |
| Public authority      | All serving reads come from exact D1 generations; drafts never leak                                                                  |
| Generated state       | Types, JSON Schema, import maps, migrations, search, renditions, health, and other projections rebuild cleanly                       |
| UX and accessibility  | Final staff journeys pass keyboard, focus, screen-reader, mobile, reduced-motion, and clear-status checks                            |
| Capacity and recovery | D33 budgets pass; a failed pre-acceptance rebuild is resettable and rerunnable                                                       |
| Legacy deletion       | Zero reads, writes, routes, flags, fallbacks, old fixtures, transforms, and runtime imports remain                                   |

## Hard stops

Replacement must not proceed when:

- Core or the target environment has become production or customer-relied-upon
  without a renewed production cutover decision;
- the exact target project/environment/database/schema/storage identity is
  unknown;
- the D34 Payload cohort has not been admitted and pinned;
- a shared environment has unresolved state;
- retained personal, authentication, secret, or source-owned operational data
  lacks a lawful and secure handling decision;
- a route, locale, relationship, or media-byte ambiguity would require a silent
  guess;
- schema push and committed migrations could both mutate the same shared
  environment;
- more than one actor can apply the authority-changing sequence;
- a partially rebuilt environment could be mistaken for usable; or
- completion would leave any second runtime authority or compatibility path.

## Decision implication

D35 should adopt the exact C-prime-R in the companion decision brief. It is the
only option that uses the repo's pre-production status responsibly without
confusing “easy to reset” with “safe to guess.” It spends rigor on the permanent
CMS—clean model, exact authority, deterministic setup, Tenant isolation, media
custody, final UX, accessibility, and launch proof—while deleting migration
machinery that would otherwise become the first new layer of technical debt.
