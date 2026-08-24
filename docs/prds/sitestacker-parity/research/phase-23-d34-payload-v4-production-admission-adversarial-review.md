# Phase 23 D34 — Payload v4 Production-Admission Adversarial Review

**Status:** Complete review supporting the founder-ratified exact 36-clause
Phase 23 D34 B-prime-R.  
**Review date:** 2026-08-24  
**Reviewed proposal:** Commit Phase 23 to Payload v4 now while ensuring a future
implementation agent researches and selects the then-current v4 release.

## Bottom line

The founder's direction is architecturally sound after one essential
correction: the durable decision commits to the **Payload v4 major line**, not
to the exact prerelease available today. The production candidate must be
rediscovered twice from official sources, pinned exactly, and qualified as one
complete runtime/package/plugin cohort. If stable v4 exists at implementation
or release freeze, stable supersedes the prerelease lane.

A literal “commit now to a prerelease” is too brittle for tickets implemented
weeks or months later. A vague “use latest” instruction is worse: npm `latest`
currently points to Payload v3 and could eventually point to v5. The hardened
contract makes release discovery deterministic without building an automatic
upgrade system or permanent multi-version framework.

## Current evidence snapshot

As of 2026-08-24:

- npm reports `latest=3.88.0`, `canary=4.0.0-canary.29`, and
  `internal=4.0.0-internal.af6aad0`;
- Core pins the older exact `4.0.0-internal.1f9ae9a` cohort;
- official GitHub Releases list stable v3 releases and no v4 release;
- GitHub contains a `v4.0.0-beta.0` tag at commit `b3b8198`, but
  `npm view payload@4.0.0-beta.0` returns `E404`; and
- Payload describes v4 as an early look under active development and says its
  administration, hierarchy, DAM, MCP, and framework work is still being
  shaped.

That npm/GitHub discrepancy is a useful real-world edge case: neither a GitHub
tag, npm dist-tag, nor documentation branch is sufficient by itself. Sources:
[npm versions](https://www.npmjs.com/package/payload?activeTab=versions),
[GitHub releases](https://github.com/payloadcms/payload/releases),
[GitHub tags](https://github.com/payloadcms/payload/tags), and
[Payload's v4 early look](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).

## Category-by-category review

### 1. Brittleness — Material concern: **Yes**

- **What could go wrong:** “Latest v4” changes over time and may disagree among
  npm, GitHub, `main` documentation, and the repo lockfile. Stable v4 may appear
  during implementation. An agent may apply current `main` guidance to an older
  exact artifact.
- **Why it matters:** Builds, migrations, generated artifacts, and public
  meaning become nondeterministic.
- **Severity:** High.
- **Likelihood:** High without hardening.
- **Evidence/reasoning:** Today's GitHub beta tag has no matching npm artifact,
  while the current v4 migration guide is still changing.
- **Permanent prevention:** Discover from official sources at task start and
  release freeze; reconcile artifact and source identity; freeze one exact
  candidate; cite the exact candidate's documentation/source.

### 2. Technical debt — Material concern: **Yes**

- **What could go wrong:** Current internal APIs leak into Asym contracts,
  prerelease compatibility branches remain indefinitely, or the spike becomes
  permanent by inertia.
- **Why it matters:** Stable adoption becomes another expensive product
  migration rather than a bounded provider upgrade.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Core already identifies `4.0.0-internal.1f9ae9a` as a
  spike, and Payload v4 is changing query, types, UI, plugin, job, and adapter
  behavior.
- **Permanent prevention:** Commit only to the v4 major line; preserve Asym
  domain/compiler boundaries; maintain one production cohort and one candidate;
  delete obsolete compatibility after the selected stable cohort qualifies.

### 3. Edge cases — Material concern: **Yes**

- **What could go wrong:** Stable v4 exists while `latest` still points to v3;
  a tag lacks a package; one required adapter is missing; stable appears
  mid-qualification; the newest patch is deprecated, yanked, vulnerable, or
  regressive; or a plugin lags core.
- **Why it matters:** A naive “install latest” rule can select a nonexistent,
  incomplete, or unsafe tuple.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** The current `v4.0.0-beta.0` tag/npm `E404` split is
  precisely this failure class.
- **Permanent prevention:** Parse all installable npm `4.x` versions with
  SemVer; require complete package closure and source evidence; prefer the
  newest supported stable; document any older-patch choice; fail closed on
  disagreement.

### 4. Footguns — Material concern: **Yes**

- **What could go wrong:** `payload@latest` installs v3 today; `@canary` moves
  without review; ranges or forced peers mix first-party versions; a developer
  runs destructive migration `down`, `reset`, or `fresh`; user-context Local
  API calls inherit unsafe access or lock defaults.
- **Why it matters:** One ordinary developer command can cause data loss,
  nondeterminism, or Tenant exposure.
- **Severity:** Critical.
- **Likelihood:** High.
- **Evidence/reasoning:** Payload requires matching official package versions,
  and its migration CLI exposes destructive commands. Sources:
  [package concepts](https://github.com/payloadcms/payload/blob/main/docs/getting-started/concepts.mdx)
  and [migration commands](https://payloadcms.com/docs/database/migrations).
- **Permanent prevention:** Exact pins, frozen lockfile, package-family CI
  invariant, no forced peers, explicit query/access/lock behavior, reviewed
  migrations, and production command guards.

### 5. Tenant safety — Material concern: **Yes**

- **What could go wrong:** Access callbacks, Local API behavior, versions,
  Preview, REST/GraphQL endpoints, hooks, jobs, plugins, or media queries expose
  one Tenant's content to another.
- **Why it matters:** This is a direct confidentiality and authorization breach.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Payload is a direct database/API engine, while D30
  intentionally keeps Supabase Auth and Asym authorization authoritative.
- **Permanent prevention:** Preserve the Asym authorization boundary; explicitly
  set user-context access/Tenant options; require negative cross-Tenant tests
  across current, draft, version, Preview, media, search, import/export, raw
  endpoints, and Local API surfaces for every candidate.

### 6. Overengineering — Material concern: **Yes**

- **What could go wrong:** The team builds a runtime version selector,
  automatic upgrade service, generic multi-version abstraction, parallel v3/v4
  engines, or another health dashboard.
- **Why it matters:** It increases complexity and operating cost while making
  upgrades less predictable.
- **Severity:** Medium.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Version choice is a release-time concern, not a
  Tenant or runtime concern.
- **Permanent prevention:** Use one small discovery protocol, one immutable
  qualification record, one production cohort, and one candidate. Reuse D30
  diagnostics and D31 health. Do not build runtime version choice.

### 7. UX/UI and user friction — Material concern: **Yes**

- **What could go wrong:** Staff see provider channels, migration jargon,
  changed raw Admin controls, surprise read-only states, lost autosaves, fake
  progress, or fallback into stock Payload Admin.
- **Why it matters:** Editors lose trust, duplicate work, or avoid publishing.
- **Severity:** High.
- **Likelihood:** Medium-high because Payload v4 redesigns the Admin UI.
- **Evidence/reasoning:** Payload's own v4 preview names substantial changes to
  list/edit views, tables, bulk actions, uploads, modals, drawers, Lexical,
  focus, and contrast.
- **Permanent prevention:** Make engine qualification invisible; test Asym Web
  Studio's real journeys and accessibility; if authoring is affected, show one
  calm Site-scoped notice, protect acknowledged saves and the last safe D1
  generation, restore prior editor context, and avoid provider jargon or guessed
  timing.

### 8. Hidden coupling — Material concern: **Yes**

- **What could go wrong:** Product behavior silently depends on Payload IDs,
  tables, versions, default query depth, UI slots, generated types, import maps,
  plugin order, or provider-specific workflow state.
- **Why it matters:** A provider upgrade changes Asym semantics without an
  intentional product decision.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** The v4 guide changes default depth, default versions,
  list Select behavior, admin component contracts, types, and adapters. Source:
  [v4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx).
- **Permanent prevention:** Keep Payload behind Asym semantic boundaries and
  D1; specify queries explicitly; digest config/schema/types/import maps; test
  product and public semantics rather than raw provider shapes.

### 9. Failure modes — Material concern: **Yes**

- **What could go wrong:** Code builds while migration fails; two Vercel
  deployments race migrations; old code cannot read the new schema; a lock is
  stranded; or a candidate fails after partial activation.
- **Why it matters:** Editing/publishing can become unavailable and naive
  rollback can worsen the incident.
- **Severity:** Critical.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Payload documents relational production migrations,
  while Core's present generated `down` drops CMS tables with `CASCADE`.
- **Permanent prevention:** One advisory-locked migration authority;
  expand/migrate/verify/activate/contract stages; production-shaped rehearsal;
  compatible binary/D1 rollback or forward repair; keep candidate failure
  private and the last safe D1 generation live.

### 10. Data integrity — Material concern: **Yes**

- **What could go wrong:** Locale lineages, drafts, versions, relationships,
  block order, Lexical nodes, media references, routes, schedules, or forms are
  duplicated, dropped, or semantically altered.
- **Why it matters:** The system can look healthy while publishing wrong or
  incomplete ministry content.
- **Severity:** Critical.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** v4 changes defaults and several schema/API surfaces;
  database-only recovery also cannot restore D27 media bytes.
- **Permanent prevention:** Control totals, relationship closure, deterministic
  identity, source/target readback, semantic render diffs, locale/version
  lineage tests, object reconciliation, and rehearsed row-plus-byte restore.

### 11. Security and privacy — Material concern: **Yes**

- **What could go wrong:** A prerelease contains unresolved vulnerabilities;
  provenance is unclear; endpoints/plugins become reachable; or access bypasses
  leak drafts, Preview content, restricted media, job data, applicants, or staff
  information.
- **Why it matters:** Sensitive nonprofit and ministry data can be exposed.
- **Severity:** Critical.
- **Likelihood:** Medium.
- **Evidence/reasoning:** Prerelease churn increases unknowns, and the candidate
  spans APIs, storage, email, rich text, database, and UI packages.
- **Permanent prevention:** Record artifact integrity/provenance, source ref,
  advisories, license, and support state; fail closed on ambiguity; negative-
  test every endpoint and access seam; admit optional plugins/tools only for a
  proven need.

### 12. Scalability and performance — Material concern: **Yes**

- **What could go wrong:** Default versions inflate storage; migrations lock
  large tables; relationship population multiplies queries; Admin bundles grow;
  or plugins increase database connections and Vercel cost.
- **Why it matters:** A tuple that passes fixture tests can fail at ministry
  scale or become financially unstable.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence/reasoning:** v4 enables versions by default and reduces default
  query depth partly to reduce database work and response size.
- **Permanent prevention:** Explicit versions/query configuration, reviewed
  indexes/plans, restartable bounded backfills, connection limits, and D33
  minimum/typical/maximum/burst/noisy-neighbor/cost testing on the target
  Vercel/Supabase topology.

### 13. Operational burden — Material concern: **Yes**

- **What could go wrong:** Every agent interprets “latest” differently,
  prerelease operation becomes permanent, or every Vercel build tries to
  migrate.
- **Why it matters:** Releases depend on tribal knowledge and recurring manual
  cleanup.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Mutable prerelease channels publish frequently and
  Core already has separate Payload manifests, generated artifacts, and
  migration commands.
- **Permanent prevention:** One reproducible discovery procedure, one
  qualification record, one migration owner, one production cohort, a stable-
  supersession trigger, and explicit compatibility retirement.

### 14. Observability gaps — Material concern: **Yes**

- **What could go wrong:** Operators cannot prove the active tuple, config,
  schema, migration batch, or D1 generation; staff receive generic errors.
- **Why it matters:** Diagnosis and safe recovery are delayed.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Evidence/reasoning:** Package and schema drift can exist even when a single
  version string looks correct.
- **Permanent prevention:** D30 privileged evidence exposes exact version and
  artifact/config/schema/migration digests, authority state, last successful
  generation, and cause IDs. D31 exposes only actionable product health to
  ordinary staff.

### 15. Dependency and integration risks — Material concern: **Yes**

- **What could go wrong:** Payload core, UI, Postgres, Next, Lexical, Resend,
  Vercel Blob, React, Node, TypeScript, GraphQL, Drizzle, `pg`, `sharp`, Supabase,
  Vercel, or plugins become incompatible.
- **Why it matters:** A coherent `payload` package alone can still fail Core's
  actual topology.
- **Severity:** Critical.
- **Likelihood:** High during v4 prerelease evolution.
- **Evidence/reasoning:** Payload says official packages publish in sync, and
  the v4 guide raises runtime floors and changes adapters, Jobs, types, Lexical,
  plugins, and framework integration.
- **Permanent prevention:** Qualify the complete exact package/runtime/plugin
  closure; reject mixed versions or forced peers; prove it on the intended
  Vercel/Supabase topology.

### 16. Migration and upgrade risks — Material concern: **Yes**

- **What could go wrong:** Internal-to-stable migration is unsupported;
  retained data cannot be read; environment-specific config creates divergent
  SQL; or destructive `down` is mistaken for recovery.
- **Why it matters:** This is the highest-risk path to irreversible content
  loss.
- **Severity:** Critical.
- **Likelihood:** High.
- **Evidence/reasoning:** Payload requires relational schema to match config
  and warns configuration differences can create migration discrepancies.
- **Permanent prevention:** Keep D34 engine admission separate from D35
  retained-state/cutover; prove clean install and every retained predecessor;
  serialize migrations; use expand/contract and forward repair; prohibit
  reset/fresh/destructive down as ordinary rollback.

### 17. Other development hazards — Material concern: **Yes**

- **What could go wrong:** Registry state changes between research and merge;
  stale caches retain old bytes; generated files drift; `main` docs mismatch the
  candidate; two agents choose different versions; or nobody owns incomplete
  evidence.
- **Why it matters:** The deployed artifact can differ from the reviewed
  candidate.
- **Severity:** High.
- **Likelihood:** High.
- **Evidence/reasoning:** Candidate selection spans mutable external state and
  multiple generated/repository artifacts.
- **Permanent prevention:** Timestamp discovery; freeze one candidate; capture
  commands/output; verify lockfile, integrity, and generated artifacts in CI;
  rerun discovery at release freeze; assign one upgrade owner; treat missing
  evidence as a failed gate.

## Ruthless synthesis

### Hardening applied in D34 before ratification

1. Replace the literal prerelease promise with a Payload v4 major-line
   commitment and implementation-time selection rule.
2. Require official-source discovery twice and make stable v4 supersede the
   prerelease lane whenever it exists.
3. Require exact package/source identity, lockstep first-party closure, frozen
   manifests/lockfile, and one immutable qualification record.
4. Preserve Asym/Supabase/D1 authority boundaries and explicitly reject v3,
   floating tags, stock Admin fallback, mixed packages, and dual authority.
5. Make migration, Tenant isolation, data reconciliation, row-plus-byte
   recovery, Web Studio UX/accessibility, and D33 capacity/cost proof hard gates.

### Must be implemented with the future engine-qualification ticket

1. Add the smallest offline `verify:payload-engine-qualification` seam.
2. Produce the dated networked discovery evidence and exact candidate record.
3. Review exact-source differences and generated artifacts.
4. Rehearse clean and predecessor upgrades with one serialized migration
   authority and non-destructive recovery.
5. Run strict no-skip product, Tenant, D1, accessibility, capacity, and restore
   gates on the intended topology.

### Must be rechecked at release freeze

1. Stable-v4 availability and support state.
2. Artifact availability, deprecation, integrity, provenance, and advisories.
3. Exact source, release notes, and migration-guide deltas.
4. Target-branch, lockfile, runtime, config, schema, migration, plugin, provider,
   generated-artifact, and security-relevant changes.

### Monitor without adding product complexity

- subsequent stable patch releases and applicable advisories;
- Payload's v4 support posture and migration-guide corrections;
- real production D33 budgets and incident evidence; and
- compatibility code that should be deleted after stable qualification.

Do not create an ordinary staff engine dashboard, runtime version selector,
automatic upgrade service, permanent multi-version adapter, or generic plugin
marketplace. Healthy engine operation is invisible. An actual bounded authoring
interruption receives one calm Site-scoped notice and restores the editor's
prior context when complete.
