# Phase 23 D34 — Payload v4 Production-Admission Primary-Source Research

**Status:** Current evidence supporting the founder-ratified exact 36-clause
Phase 23 D34 B-prime-R.  
**Research date:** 2026-08-24  
**Scope:** Whether and under what evidence one exact Payload v4 engine tuple may
be admitted to production for Phase 23. Current-implementation replacement and
authority cutover remain the separate next migration decision.

## Executive conclusion

Payload v4 remains the correct target direction for Phase 23, but **Payload v4
is not a stable release as of this research date**. The npm `latest` tag is
`3.88.0`; the current v4 channels are `4.0.0-canary.29` and
`4.0.0-internal.af6aad0`. Core is pinned to the older exact internal tuple
`4.0.0-internal.1f9ae9a`.

The repository already describes that tuple correctly: it is a spike and an
active direction, not a production-qualified baseline. Payload's current v4
migration guide is still accumulating material breaking changes across query
depth, versions, the admin UI, types, plugins, jobs, rich text, database
adapters, and framework integration. A package being tagged `stable` later will
reduce upstream-change risk, but it will not prove Core's tenant isolation,
migrations, custom Web Studio, public compilation, backup/restore, performance,
or rollback.

The founder selected proceeding toward v4 now while requiring a future
implementation agent to research the current v4 release. The evidence supports
hardening that direction into a **Payload v4 major-line commitment with live
release discovery, exact-cohort qualification, and release-bound production
admission**. It does not support automatic approval of the current internal pin,
a moving prerelease channel, or even a future stable tag. If stable v4 exists at
implementation or release freeze, stable supersedes the prerelease lane. The
exact numeric tuple belongs in a dated qualification record; the durable product
decision owns the discovery and admission rules.

## Verified release-channel facts

The npm registry returned this exact state on 2026-08-24:

| Channel    | Version                  |
| ---------- | ------------------------ |
| `latest`   | `3.88.0`                 |
| `canary`   | `4.0.0-canary.29`        |
| `internal` | `4.0.0-internal.af6aad0` |

The public npm version history also lists Core's current
`4.0.0-internal.1f9ae9a` artifact and the subsequent v4 canaries. Source:
[Payload package version history](https://www.npmjs.com/package/payload?activeTab=versions).

Payload's own June 2026 article calls v4 an **early look**, says the relevant
features are still in active development, and targets a beta before stable.
The article previews a redesigned admin UI, core hierarchies, richer digital
asset management, and framework-adapter work. These are relevant directions,
not production guarantees. Source:
[Payload 4.0 early look](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).

The official GitHub tags page also contains a `v4.0.0-beta.0` tag at commit
`b3b8198`, while official GitHub Releases contains no v4 release and
`npm view payload@4.0.0-beta.0` returns `E404`. This proves that a GitHub tag is
not by itself an installable package candidate, just as a registry artifact is
not by itself proof of reviewable source identity. Sources:
[Payload releases](https://github.com/payloadcms/payload/releases) and
[Payload tags](https://github.com/payloadcms/payload/tags).

## Current Core evidence

### One exact older internal tuple

`apps/admin/package.json` and the root package catalog pin Payload core,
Postgres, Next, UI, Lexical, Resend email, and Vercel Blob storage to
`4.0.0-internal.1f9ae9a`. Matching official package versions are important:
Payload itself says its official packages are published in sync and should use
matching versions. Source:
[Payload package concepts](https://github.com/payloadcms/payload/blob/main/docs/getting-started/concepts.mdx).

Core's living Web Studio specification and vendor note explicitly classify the
pin as a spike that must graduate to a supported stable channel or an
explicitly approved exact internal release:

- `docs/guides/architecture/web-studio-living-spec.md:37-55`
- `docs/vendor/payload.md:18-27`

That classification remains correct. The current pin predates the first
published v4 canary and much of the current migration guide; age alone does not
make it safer.

### Current physical and runtime shape

The current Payload instance lives in `apps/admin`, uses the Postgres adapter
with the separate `cms` schema, and registers ten collections with no Payload
globals (`apps/admin/payload.config.ts:100-118`). Its single generated initial
migration creates a large Payload-owned relational shape. The migration's
`down` function drops the CMS tables with `CASCADE`
(`apps/admin/src/migrations/20260515_173042_init_payload_cms.ts:1633-1728`).
That is a local reset mechanism, not a safe production rollback plan.

The current public reader queries mutable Payload collections directly and
omits an explicit `depth` on its `payload.find` calls
(`apps/admin/src/cms/public/published-content-reader.ts:143-188`). Phase 23 D1
already replaces that destination with one immutable, compiled public
generation. A v4 upgrade must still make every compiler query's `select`,
`depth`, pagination, locale, draft, and access behavior explicit so provider
defaults cannot change public meaning.

The repo contains deterministic local/demo content and a second isolation-test
Tenant. That proves disposable fixtures exist; it does **not** prove that every
hosted environment is empty or disposable. Hosted database, object-storage,
deployment, and customer-state census remains a fail-closed prerequisite for
the later replacement decision.

## What the current v4 guide changes

Payload's living
[3.0-to-4.0 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx)
currently documents, among other items:

- default query depth changing from two to one;
- versions becoming enabled by default for ordinary collections and globals;
- list views always using the Select API;
- admin component slots and framework adapters changing;
- removed or relocated exports across Payload UI, Next, and database adapters;
- Node.js `24.15.0`, Next.js `16.2.6`, and TypeScript `6.0.3` minimums;
- Lexical becoming the sole supported built-in rich-text editor;
- import/export plugin hook changes;
- database-adapter type-path changes;
- multiple Jobs collection, access, schema, concurrency, claim, and processing-
  lease changes; and
- plugin API and generated-type changes.

The guide itself asks users to contribute breaking changes that are missing.
That is appropriate for an active prerelease guide, but it means the guide is
not a frozen compatibility contract.

Core already explicitly configures `versions` on its current collections,
which reduces one default-change risk. Core's Next and TypeScript direction
also meets the current documented floors. Those local facts do not prove the
remaining runtime, schema, custom-admin, plugin, migration, and data behavior.

## Database and migration implications

Payload documents that Postgres projects require migrations when collection
shape changes, that each migration is run in its own transaction, and that
environment-specific configuration can produce migration discrepancies.
Source: [Payload migrations](https://payloadcms.com/docs/database/migrations).

For Core, production qualification must add stricter evidence than the generic
workflow:

1. **One migration authority.** Only one deployment job may apply a migration
   batch. A database advisory lock and immutable execution receipt must prevent
   concurrent Vercel builds or operators from racing.
2. **Immutable applied migrations.** Never edit an applied migration. The
   migration ledger identifies names/batches rather than proving a source-file
   checksum, so Core must record the artifact digest separately.
3. **Clean-install and upgrade proof.** Generate and verify both a new empty
   installation and representative upgrades from every supported predecessor.
4. **Expand before contract.** Add compatible structures first; migrate and
   verify data separately; remove old structures only after zero-read and
   zero-write proof. Large restartable backfills do not belong inside one long
   schema transaction.
5. **No destructive ordinary rollback.** Application/content rollback and
   database disaster recovery remain distinct. The generated `down` that drops
   the CMS schema cannot be the production recovery path.
6. **Environment parity.** Generate and run migrations against the same
   configuration shape, direct plugin set, transitive schema-mutating plugin
   set, locale set, database schema, and generated artifacts that are promoted.

## Required exact qualification record

One production candidate should have one immutable **Payload Engine
Qualification Record** containing at least:

### Artifact and support identity

- exact versions and integrity hashes for `payload`, every first-party Payload
  package, direct plugin, and schema/runtime-mutating transitive plugin;
- exact source commit, package channel, publication date, license evidence,
  security-advisory state, and support posture;
- exact Node, React, Next, TypeScript, package-manager, Postgres adapter,
  Supabase connectivity, Vercel runtime, and build-tool versions; and
- generated Payload types, database schema, import map, and configuration
  digests produced from that tuple.

No runtime or build uses a floating `latest`, `canary`, or `internal` tag.

### Schema and migration proof

- deterministic schema diff and reviewed generated SQL;
- empty-install, current-shape upgrade, representative retained-data upgrade,
  abort, retry, restart, advisory-lock, and concurrent-deployment tests;
- exact migration order, immutable migration digests, record/control totals,
  relationship closure, version/draft lineage, and storage-object reconciliation;
- backup and full restore rehearsals that include database and object-storage
  custody; and
- compatible application rollback or forward-repair proof without destructive
  schema reversal.

### Product-semantics proof

- Asym-owned Tenant, environment, Site, locale, Page, path, navigation,
  release, Preview, schedule, search, media, form, Trash, authorization,
  accessibility, and health contracts remain authoritative;
- explicit Local API access posture, including `overrideAccess: false` whenever
  a request acts for a user;
- negative tenant-isolation, draft/version leakage, restricted-media, Preview,
  diagnostics, and raw-admin tests;
- explicit compiler query `select`, `depth`, sort, limit, pagination, locale,
  draft, and access settings;
- exact D1 generation equivalence for content, hierarchy, routes, redirects,
  navigation, metadata, dynamic lists, media, search, localization, and
  withdrawal; and
- no Payload table, ID, role, preference, plugin route, job, version flag, or
  admin screen becomes product authority.

### Staff-product proof

- Web Studio's Asym-owned list, tree, edit, Preview, release, media, form,
  search, Trash, Content Health, and access-denied journeys;
- keyboard, screen-reader, touch, reflow, contrast, zoom, reduced-motion, and
  error-recovery behavior;
- autosave, stale editor, conflict, reconnect, version history, restore, and
  exact-revision scheduling behavior; and
- ordinary staff remain insulated from Payload channels, migration IDs,
  provider logs, SQL, plugin names, and qualification controls.

### Operational and capacity proof

- D33 minimum, typical, and measured-maximum cohorts;
- database query plans, connections, lock time, storage growth, versions,
  public compilation, media, schedule, search, and import/export load;
- Vercel cold/warm execution, build, memory, CPU, transfer, cache, and cost
  evidence;
- failure injection for Payload initialization, migration, Postgres, storage,
  cache, compiler, plugin, and deployment seams; and
- cause-owned observability and recovery evidence without a second health or
  workflow platform.

## Plugin posture

Payload plugins are configuration transformations. They can add or alter
collections, fields, hooks, routes, jobs, generated types, database schema, and
admin UI. Installing or upgrading one is therefore a schema/runtime change,
not harmless decoration. Source:
[Payload plugin API](https://payloadcms.com/docs/plugins/plugin-api).

Core currently does not directly configure search, nested-docs, import/export,
or other feature plugins. The Vercel Blob adapter brings storage behavior that
must be qualified as part of the exact tuple. Phase 23 should add no plugin
merely because Payload offers it; each plugin must own a required gap, preserve
Asym authority boundaries, and pass the same migration, security, UI,
performance, and removal tests.

## Implementation-time discovery and admission policy

Every future implementation agent must treat the versions in this research as
dated evidence and rediscover the official state twice: at task start and at
release freeze. The agent must inspect official npm metadata and published
bytes; Payload GitHub releases, tags, exact source, security information,
applicable issues and pull requests; and the exact candidate's release and v4
migration documentation.

Candidate selection is deterministic:

1. enumerate installable npm versions whose semantic major is `4`;
2. if any supported stable v4 exists, close the prerelease lane and evaluate the
   newest eligible stable first;
3. if the newest stable has a demonstrated applicable blocker, record it and
   evaluate the next supported stable;
4. only if no stable exists, consider the newest coherent official public
   release candidate, beta, or canary in that maturity order; and
5. reject GitHub-only tags, npm artifacts without reviewable source identity,
   partial first-party publication, mixed package channels, floating tags,
   version ranges, and unexplained integrity differences.

The executable instructions and stop conditions are maintained in the
[future-agent discovery and qualification contract](./phase-23-d34-payload-v4-future-agent-discovery-and-qualification-contract.md).

## Upgrade and requalification policy

- Keep exactly one production-active Payload tuple per compatible authority
  cohort.
- Evaluate upgrades in an isolated target with production-shaped data; never
  auto-adopt a dist-tag change.
- Requalify when Payload core, a first-party adapter, a schema-mutating plugin,
  Node, Next, React, TypeScript, Postgres/Supabase behavior, Vercel topology, or
  a generated schema/import-map/type digest changes materially.
- Security-only upgrades may use an expedited lane, but never bypass tenant-
  isolation, migration, backup/restore, public-generation, and rollback proof.
- If a candidate fails, keep the last qualified candidate or remain
  qualification-only. Do not silently fall back to Payload 3, the current
  internal spike, stock Payload Admin, or two CMS authorities.

## Staff and ministry UX consequence

D34 is intentionally invisible to ordinary ministry staff. A content editor
should never choose a Payload channel, inspect a compatibility matrix, or
understand a migration batch. Engine qualification is an Asym engineering and
release responsibility.

If a later D35 replacement affects authoring availability, staff receive one
calm, Site-scoped Web Studio notice, a truthful bounded editing pause, protection
of the last server-acknowledged revision, continued public service from the
last safe D1 generation, and one cause-owned recovery path. That cutover UX is
not permission to expose engine jargon or make staff validate every Page.

## Facts that do not require a founder answer

- current npm dist-tags and the exact Core package tuple;
- the exact v4 breaking-change guide at qualification time;
- package and plugin dependency closure;
- whether a candidate passes migration, security, tenant, UX, performance,
  backup/restore, and rollback proof;
- whether hosted environments contain retained production content;
- whether a record is provably a demo fixture; and
- whether an optional plugin is technically necessary.

## Founder decision state

The founder selected the v4-forward direction, explicitly required future
agents to research the then-current Payload v4 release rather than blindly
follow today's prerelease, and ratified the exact 36-clause B-prime-R in the
[D34 decision brief](./phase-23-d34-payload-v4-production-admission-decision-brief.md).

The later D35 decision remains separate and will govern current-state
classification, data transformation, shadow proof, authority cutover, rollback
retention, and compatibility retirement.
