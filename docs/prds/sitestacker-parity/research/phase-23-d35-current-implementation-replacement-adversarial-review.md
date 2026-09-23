# Phase 23 D35 — Current Implementation Replacement Adversarial Review

**Status:** Complete review supporting the founder-ratified exact 36-clause
Phase 23 D35 C-prime-R.  
**Review date:** 2026-08-24  
**Reviewed proposal:** C-prime — census-gated clean target with selective
retained-state transformation and one-authority cutover.  
**Decision brief:**
[D35 replacement decision brief](./phase-23-d35-current-implementation-replacement-decision-brief.md).

## Bottom line

The selected direction is correct after a major simplification: Core is not in
production, so D35 should build a production-worthy **target** without building
a production migration **product**.

The clean D1–D34 model is the only future authority. Confirmed fixtures and
derived state are reset and regenerated. Deliberately retained development
content receives one typed, temporary, offline transformation. Unknown state
blocks destructive action in its environment. Then every writer, reader,
compiler input, fixture, and test moves to the target once, and the prototype
and transformer are deleted.

The previous live-cutover concepts—parallel databases, continuous backfill,
final deltas, active-editor draining, public continuity, maintenance UI, CAS
authority pointers, and forward-repair-only operations—would be technical debt
for a live system that does not exist. They are excluded unless Core becomes a
production system before D35 executes, in which case replacement must stop and
the cutover posture must be decided again.

## Current evidence snapshot

As of 2026-08-24:

- Core pins a matching Payload `4.0.0-internal.1f9ae9a` cohort;
- npm reports Payload `latest=3.88.0` and `canary=4.0.0-canary.29`, so stable v4
  must not be assumed;
- the current v4 guide changes relationship depth, default versions, generated
  types and schema, storage, Admin, auth, plugin, and job contracts;
- Payload treats Postgres schema push as a development sandbox workflow and
  requires migrations outside development;
- Supabase treats linked reset as destructive, branches are data-less by
  default, and database backups do not include Storage bytes; and
- the repository has no authoritative census proving whether shared
  non-production rows and objects are all fixtures.

Primary sources:
[Payload v4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx),
[Payload migrations](https://payloadcms.com/docs/database/migrations),
[Payload Postgres adapter](https://payloadcms.com/docs/database/postgres),
[Supabase local workflow](https://supabase.com/docs/guides/local-development/cli-workflows),
[Supabase branching](https://supabase.com/docs/guides/deployment/branching), and
[Supabase backups](https://supabase.com/docs/guides/platform/backups).

## Category-by-category review

### 1. Brittleness — Material concern: **Yes**

- **What could go wrong:** “Not production” may become stale before
  implementation; a converter tied to present Payload table names, version
  tables, broad Page fields, or current provider defaults may break when the
  D1–D34 model or admitted v4 cohort changes.
- **Why it matters:** Destructive work could run under a false safety premise,
  or legacy storage shapes could dictate the permanent model.
- **Severity:** Critical for a stale environment classification; high for
  schema coupling.
- **Likelihood:** Medium for status drift and high for physical-schema coupling
  without hardening.
- **Evidence/reasoning:** The present model contains literal paths,
  `legacyContentFallback`, duplicate identity concepts, and inconsistent
  version posture. Payload v4 changes default relationship depth and versions.
- **Permanent prevention:** Re-prove environment class at implementation start
  and release freeze; refuse unknown or production-classified targets; freeze
  one D34-admitted exact cohort and target schema; emit stable domain DTOs from
  a disposable source adapter; delete the adapter after use.

### 2. Technical debt — Material concern: **Yes**

- **What could go wrong:** Compatibility collections, legacy fields, fallback
  readers, feature flags, migration tables, and shape-locking tests may remain
  indefinitely.
- **Why it matters:** Every future Page, locale, navigation, media, Preview, and
  release change would need to understand two models and two authorities.
- **Severity:** High.
- **Likelihood:** High without a hard deletion gate.
- **Evidence/reasoning:** Current source already has
  `legacyContentFallback`, `CMS_WEB_STUDIO_NATIVE_*` fallbacks, direct public
  readers, and tests that freeze prototype shapes.
- **Permanent prevention:** Make zero legacy reads, writes, routes, schemas,
  flags, fixtures, adapters, transforms, and runtime imports a D35 acceptance
  criterion. Preserve history in Git and documentation, not compatibility code.

### 3. Edge cases — Material concern: **Yes**

- **What could go wrong:** Shared development state may mix deterministic
  fixtures with deliberate staff work; paths may collide by case or locale;
  relationships may be orphaned or cross-scoped; drafts may be mistaken for
  published content; versions or Lexical nodes may be unsupported; media rows
  may lack bytes; and recent-document links may encode obsolete IDs.
- **Why it matters:** A superficially successful rebuild could lose useful work,
  expose a draft, create broken URLs, or cross Tenant boundaries.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Current navigation stores literal `href` values,
  collection version settings differ, media metadata and bytes have separate
  custody, and provider preferences can retain current record IDs.
- **Permanent prevention:** Dry-run must reject unresolved ownership, missing
  relationships or bytes, path collisions, unknown block/node kinds,
  incomplete locale lineages, and draft/public ambiguity. Reset provider-only
  preferences. Never select a “best match” or silent fallback.

### 4. Footguns — Material concern: **Yes**

- **What could go wrong:** A developer may reset the wrong linked Supabase
  project, run Payload `migrate:fresh` against a database containing unrelated
  application state, leave schema push enabled in a shared environment, mutate
  `storage.objects` directly, or assume Payload Local API access is enforced by
  default.
- **Why it matters:** One ordinary command can destroy shared work, orphan
  billable bytes, or bypass authorization.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Supabase documents linked reset as destructive;
  Payload `fresh` drops entities; Payload Local API bypasses access by default;
  Supabase documents Storage metadata as read-only application state. Sources:
  [Payload Local API access](https://payloadcms.com/docs/local-api/access-control)
  and [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design).
- **Permanent prevention:** Default to dry-run; require a non-secret target
  fingerprint and explicit environment class; refuse unknown/protected targets;
  limit schema push to proven disposable local sandboxes; use supported storage
  APIs; isolate elevated system operations; serialize shared-environment writes.

### 5. Tenant safety — Material concern: **Yes**

- **What could go wrong:** Legacy Payload Tenant IDs may be cross-walked to the
  wrong canonical Tenant, or retained relationships may cross Tenant, Site, or
  locale boundaries. UI filtering may be mistaken for authorization.
- **Why it matters:** Cross-Tenant content or permission exposure is a
  launch-blocking confidentiality failure even before production.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Current source holds Payload Tenant relationships and
  Supabase identifiers separately, while D1 adds exact Site and locale scope.
  Payload's multi-tenant plugin does not replace explicit query/access checks.
- **Permanent prevention:** Resolve every retained record through canonical
  Tenant × Site × locale keys, validate every relationship server-side, enforce
  target constraints, inspect grants/RLS independently, and run positive and
  negative isolation tests across at least two Tenants and every draft,
  version, Preview, media, import, and raw API seam.

### 6. Overengineering — Material concern: **Yes**

- **What could go wrong:** D35 could become a production migration control
  plane with CDC, replication, live shadowing, final deltas, CAS activation,
  active-editor draining, staff countdowns, a dashboard, or a generic ETL job
  fleet.
- **Why it matters:** These add product tables, services, UI, dependencies,
  tests, costs, and tribal knowledge while solving no current user problem.
- **Severity:** High.
- **Likelihood:** High under the earlier production-shaped proposal.
- **Evidence/reasoning:** The founder's non-production fact removes the live
  writers, readers, and continuity obligations those controls address.
- **Permanent prevention:** Use one guarded offline reset/rebuild command and
  add one temporary converter only when a non-empty retain manifest proves the
  need. Add batching only after measuring actual retained volume. D29 owns
  staff-facing external-CMS imports; D30/D31 own diagnostics and health.

### 7. UX/UI and user friction — Material concern: **Yes**

- **What could go wrong:** Staff may see migration steppers, provider jargon,
  stock Payload fallbacks, raw IDs/API links, competing status badges, hidden
  mobile navigation, unexplained empty screens, or warnings that imply live
  customer impact.
- **Why it matters:** It creates anxiety and mystery, splits the information
  architecture, and spends UX attention on a one-time engineering operation
  instead of the lasting editorial product.
- **Severity:** High.
- **Likelihood:** High unless the replacement intentionally removes current UX
  debt.
- **Evidence/reasoning:** Current Web Studio surfaces can expose Payload
  language and stock-list fallback, the edit workspace exposes provider detail,
  the desktop navigation lacks an equivalent narrow-screen entry, and existing
  E2E coverage is mostly shell/heading validation.
- **Permanent prevention:** Build no ordinary-staff migration UI. Deliver one
  provider-free Mission Control Web Studio with template-led starts, equivalent
  desktop/mobile navigation, D12's single truthful editorial status, D30-only
  diagnostics, D31 contextual recovery, clear public meaning, and complete
  keyboard, focus, screen-reader, reflow, touch, reduced-motion, and mobile
  journey tests. Shared test environments use one quiet persistent label.

### 8. Hidden coupling — Material concern: **Yes**

- **What could go wrong:** Product meaning may remain tied to Payload physical
  IDs/tables, generated types, import maps, default depth, Vercel Blob metadata,
  old routes, stock Admin subviews, provider preferences, or current collection
  names.
- **Why it matters:** A provider upgrade or schema cleanup could silently alter
  product behavior and staff navigation.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Payload v4 changes generated and Admin contracts, and
  the current app links product UI directly to several provider surfaces.
- **Permanent prevention:** Keep source physical knowledge in the disposable
  exporter; make the target importer/domain/compiler provider-independent;
  define routes and semantic identities at the product boundary; regenerate
  artifacts; clear provider-only preferences; remove stock fallbacks and raw
  provider links.

### 9. Failure modes — Material concern: **Yes**

- **What could go wrong:** Reset may succeed before schema/fixtures complete;
  retained import or media copy may partially fail; generated artifacts may not
  match runtime config; external hooks may send email or revalidate during
  import; or a target may be mistaken for usable after a failed stage.
- **Why it matters:** Developers or testers could act on corrupt or incomplete
  state, and unintended external effects may escape the disposable database.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Database and object storage do not share one
  transaction; Payload requires request context for nested transactional writes.
- **Permanent prevention:** Export retained state first; run only against a
  disposable or prepared target; make target import idempotent; suppress
  external side effects narrowly; report exact stages; withhold Ready status
  until all invariants pass; recover by clean reset and deterministic rerun.

### 10. Data integrity — Material concern: **Yes**

- **What could go wrong:** Records may duplicate, relationships may orphan,
  route or locale lineages may change, drafts may leak, source-owned facts may
  be copied, derived projections may become stale, or media metadata may point
  to absent bytes.
- **Why it matters:** The product can look healthy while serving incorrect,
  incomplete, or private ministry content.
- **Severity:** Critical.
- **Likelihood:** Medium when retained state exists.
- **Evidence/reasoning:** Current and target models differ semantically, and
  Supabase backups exclude Storage bytes.
- **Permanent prevention:** Use target constraints and an ephemeral identity
  map; reconcile counts, relationships, routes, locales, and checksums; preserve
  only explicitly selected drafts/versions; transfer and verify bytes; rebuild
  every derived projection; compile exact D1 generations; prove draft exclusion.

### 11. Security and privacy — Material concern: **Yes**

- **What could go wrong:** Census reports or exports may contain real donor,
  missionary, applicant, or staff information, credentials, signed URLs,
  tokens, sessions, or secrets; elevated imports or raw Payload endpoints may
  bypass access; CMS tables may have unexpected Supabase Data API grants.
- **Why it matters:** “Non-production” does not make sensitive ministry data
  harmless.
- **Severity:** Critical.
- **Likelihood:** Low to medium for real data, medium for unsafe default
  assumptions.
- **Evidence/reasoning:** Payload Local API bypasses access by default, while
  Supabase grants and RLS are separate reachability/row-authorization controls.
- **Permanent prevention:** Enforce a synthetic-data baseline; never retain
  passwords, sessions, tokens, roles, donor records, or secrets; keep any
  approved export encrypted, git-ignored, least-privileged, redacted in logs,
  and short-lived; explicitly inspect/revoke grants and test RLS/access;
  eliminate raw provider authority from public paths.

### 12. Scalability and performance — Material concern: **No for the one-time replacement mechanism after hardening**

- **What was checked:** A pre-production rebuild does not need horizontal
  workers, queues, CDC, or a resumable migration service.
- **Residual concern:** A deliberately retained media set could exceed memory
  or request limits, while the permanent target runtime still needs D33 proof.
- **Why it matters:** Overbuilding the converter would waste cost; under-testing
  the target would conflate migration speed with public performance.
- **Severity:** Low for the converter; high for target-runtime regressions, which
  D33 owns.
- **Likelihood:** Low for converter scale given current evidence.
- **Evidence/reasoning:** No measured retained volume justifies distributed
  flow control. D33 already defines production capacity and cost gates.
- **Permanent prevention:** Run conversion outside request handlers, stream
  media, use a modest fixed batch size, and add flow control only after census
  measurements. Independently load-test Web Studio and D1 public serving under
  D33; never use migration throughput as its proxy.

### 13. Operational burden — Material concern: **Yes**

- **What could go wrong:** Multiple cutover runbooks, dashboards, flags,
  compatibility readers, schemas, and cleanup rituals may become permanent
  tribal knowledge.
- **Why it matters:** Future engineers would support machinery used once while
  debugging two possible sources of truth.
- **Severity:** High.
- **Likelihood:** High if the earlier live design survives.
- **Evidence/reasoning:** The prior proposal required a multi-stage operational
  system; this repo already has a simpler local reset/migrate/seed/verify
  pattern.
- **Permanent prevention:** Provide one guarded dry-run/rebuild command, one
  short runbook, and one CI artifact. After all named environments pass, delete
  the exporter/importer, legacy flags, and obsolete docs; retain only compact
  rationale and evidence.

### 14. Observability gaps — Material concern: **Yes**

- **What could go wrong:** Silent skips, inferred fallbacks, incomplete media,
  or a failed stage could still produce a green-looking environment or vague
  “migration failed” message.
- **Why it matters:** Testers may validate corrupt state and developers may not
  know whether any destructive change occurred.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** A database, generated artifacts, derived projections,
  and bytes complete independently.
- **Permanent prevention:** Emit a redacted machine-readable report with target
  fingerprint, plan digest, source/disposition/target counts, relationship and
  byte checksums, exact current stage, exceptions, generated-artifact result,
  and test references. Human output uses the same facts and returns only Ready
  or a precise stopped/failed state—no permanent dashboard.

### 15. Dependency and integration risks — Material concern: **Yes**

- **What could go wrong:** Payload v4's admitted artifact, migration guide,
  generated types/import map, Lexical structure, Sharp behavior, Postgres
  adapter, multi-tenant plugin, or storage adapter may change before D35 is
  implemented.
- **Why it matters:** A converter or clean baseline proven against today's
  internal build may be invalid for the actual release cohort.
- **Severity:** High.
- **Likelihood:** High while v4 is prerelease.
- **Evidence/reasoning:** npm still marks v3 as latest and v4 as canary; Core
  pins an older internal cohort; the v4 guide contains broad breaking changes.
- **Permanent prevention:** Apply D34's live discovery at task start and freeze;
  pin one complete first-party cohort; use official adapters/APIs; regenerate
  all artifacts; test editor state, storage, access, clean database, and public
  semantics against that exact cohort.

### 16. Migration and upgrade risks — Material concern: **Yes**

- **What could go wrong:** The internal-v4 prototype migration may become the
  permanent foundation, a development-push schema may diverge from migrations,
  or a clean baseline may accidentally rewrite unrelated Supabase application
  history.
- **Why it matters:** Fresh environments would not reproduce deployed shape,
  and later upgrades would inherit obsolete tables or ambiguous defaults.
- **Severity:** High.
- **Likelihood:** High without deliberate baseline ownership.
- **Evidence/reasoning:** Payload warns not to mix push and migrations; v4's
  version default can create new tables; the current CMS baseline is explicitly
  pre-production and isolated under `cms`.
- **Permanent prevention:** Replace the obsolete CMS baseline before launch,
  prove it from an empty database, leave unrelated Supabase migrations intact,
  configure defaults explicitly, and append immutable reviewed migrations only
  after the production baseline is established.

### 17. Other development hazards — Material concern: **Yes**

- **What could go wrong:** Concurrent branches may generate conflicting
  migrations; a partial merge may expose target UI over legacy authority;
  generated artifacts may be stale; concurrent resets may race; or demo seed
  data may enter the first real environment.
- **Why it matters:** The repository can look migrated while still containing
  a split authority or unsafe seed path.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** D35 spans schema, generated files, UI, public readers,
  scripts, fixtures, and tests, all of which can merge independently.
- **Permanent prevention:** Assign one migration owner and bounded merge window;
  serialize shared-environment mutation; gate generated-file cleanliness;
  switch target readers/writers and remove legacy paths in one integration
  sequence; prohibit demo seeding in production-classified targets; reject D35
  completion while any temporary flag or old runtime import remains.

## Ruthless synthesis

### Must be fixed in the decision now

1. Bind the non-production fact and require revalidation before destructive
   execution.
2. Define the current implementation as disposable evidence, not target
   authority.
3. Make retention explicit and opt-in; unknown state blocks its environment.
4. Replace the production-shaped cutover plane with one guarded offline
   rebuild and an optional temporary converter.
5. Protect Tenant scope, identity authority, sensitive data, routes, locales,
   drafts, and media bytes even in non-production.
6. Make final staff UX—not migration UI—the product deliverable.
7. Require complete legacy and converter deletion plus fresh-clone proof.

### Implementation order after ratification and specification

1. **Revalidate status and freeze target contracts.** Confirm no target is
   production/customer-relied-upon; apply D34 to select the exact Payload v4
   cohort; freeze D1–D34 semantic input.
2. **Run the read-only census.** Inventory repository artifacts and each named
   non-production database/object store; classify Regenerate, Retain, or Needs
   a decision; resolve every unknown.
3. **Build the clean baseline.** Replace prototype collections and the isolated
   CMS migration baseline; configure Payload defaults explicitly; regenerate
   types/import maps; write deterministic target fixtures and final behavior
   tests.
4. **Handle the exceptional retained lane.** If and only if the retain manifest
   is non-empty, export it securely and run the smallest domain-shaped,
   idempotent converter through supported APIs. Verify mappings,
   relationships, paths, locales, drafts, and bytes.
5. **Rebuild derived authority.** Generate search, renditions, Used-in, health,
   sitemap, cache, and exact D1 public generations from the target.
6. **Switch once.** Move every Web Studio writer, public reader, Preview route,
   compiler input, script, and test to the target in one bounded integration
   sequence.
7. **Delete.** Remove legacy tables, collections, routes, readers, writers,
   stock-Admin fallbacks, flags, fixtures, adapters, tests, and the temporary
   converter.
8. **Prove the finish line.** Bootstrap from a fresh clone and empty database;
   run Tenant/access, draft/public, route/locale, media, D1 generation,
   accessibility, responsive UX, D33 performance/recovery, and zero-legacy-use
   gates.

### Must pass before external beta

- a clean-clone/empty-database rehearsal in CI;
- no real or demo customer data in the production seed path;
- exact Supabase grants/RLS and Payload access tests;
- verified media row-and-byte custody;
- no stock Payload fallback or provider jargon in ordinary staff journeys;
- equivalent mobile and desktop Web Studio navigation;
- D12 truthful status, D30 diagnostics boundaries, and D31 contextual recovery;
  and
- zero legacy import, route, environment variable, table, flag, or runtime
  dependency.

### Monitor only

- whether Core enters production before D35 executes—if yes, stop and make a
  new live-cutover decision;
- the then-current Payload v4 cohort under D34;
- measured retained content/media volume before adding batching or flow
  control; and
- Supabase project grants and platform-default changes, which must be verified
  in the actual target rather than assumed.

## Final verdict

**Proceed with C-prime-R exactly as hardened in the decision brief.** It keeps
the safe parts of modern CMS migration practice—inventory, dry-run, isolation,
one authority, evidence, and verification—while refusing to turn a
pre-production rebuild into a permanent migration product. The result is the
cleanest route to an excellent staff and public experience: build the final
system once, preserve only intentional value, and remove every trace of the
prototype from runtime authority.
