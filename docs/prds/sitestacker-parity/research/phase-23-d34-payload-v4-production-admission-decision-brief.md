# Phase 23 D34 — Payload v4 Production-Admission Decision Brief

**Status:** Founder-ratified as the exact 36-clause Phase 23 D34 B-prime-R on
2026-08-24.  
**Date:** 2026-08-24  
**Decision owner:** Founder  
**Scope:** Payload v4 major-line commitment, live candidate discovery, exact
engine-cohort qualification, and production admission. Current-state migration
and authority cutover remain D35.

## Selected direction and necessary correction

The founder selected Option B: proceed toward Payload v4 now rather than wait
for stable before designing and planning the work. The founder also correctly
observed that stable v4 may exist by the time an implementation agent opens the
specification or tickets.

Taken literally, “commit now to a prerelease” would become stale and could
force a future agent to retain an obsolete prerelease after stable v4 ships.
The intent-preserving formulation therefore commits Phase 23 to the **Payload
v4 major line**, permits work against one exact prerelease while stable is
unavailable, and requires the production candidate to be rediscovered and
qualified from live official evidence at implementation time and release
freeze.

This is not a retreat from Option B. It is what makes Option B survive time.

## Current evidence that shaped the hardening

On 2026-08-24:

- npm reports Payload `3.88.0` as `latest`, `4.0.0-canary.29` as `canary`, and
  `4.0.0-internal.af6aad0` as `internal`;
- Core pins the older exact `4.0.0-internal.1f9ae9a` package cohort;
- official GitHub Releases contain stable v3 releases and no v4 release;
- GitHub has a `v4.0.0-beta.0` tag, but npm has no installable
  `payload@4.0.0-beta.0`; and
- Payload calls v4 an early look under active development while its v4
  migration guide already documents material query, version, Admin, framework,
  type, Lexical, plugin, Jobs, adapter, and generated-artifact changes.

Sources:
[Payload npm versions](https://www.npmjs.com/package/payload?activeTab=versions),
[Payload GitHub releases](https://github.com/payloadcms/payload/releases),
[Payload GitHub tags](https://github.com/payloadcms/payload/tags),
[Payload v4 early look](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more),
[official v4 migration guide](https://github.com/payloadcms/payload/blob/main/docs/migration-guide/v4.mdx),
and
[official package-version guidance](https://github.com/payloadcms/payload/blob/main/docs/getting-started/concepts.mdx).

The GitHub-tag/npm-package mismatch proves why future agents must inspect npm,
GitHub releases/tags/source, published bytes, and exact-version documentation
together. No single mutable label is release truth.

## Exact ratified decision

### B-prime-R — Payload v4 major-line commitment with live release discovery,

exact-cohort qualification, and release-bound production admission

1. **Payload v4 major line.** Phase 23 commits the Web Studio content-engine
   boundary to Payload major version 4.
2. **Bounded major.** D34 authorizes neither a temporary Payload v3 production
   detour nor an unreviewed jump to v5.
3. **No timeless numeric pin.** D34 does not permanently select a numeric
   Payload version on the ratification date.
4. **Current pin is evidence only.** Core's current
   `4.0.0-internal.1f9ae9a` cohort remains development-spike evidence, not an
   automatically admissible production baseline.
5. **Work may proceed.** Implementation may continue against one exact pinned
   v4 prerelease while its production qualification remains pending.
6. **Two live discoveries.** Every implementing agent must rediscover Payload's
   current v4 release state when the task starts and again immediately before
   dependency lock or production promotion.
7. **Official-source research.** Discovery must use live official npm registry
   metadata; Payload GitHub releases, tags, source, security information,
   applicable issues and pull requests; the exact candidate's source identity;
   and current official v4 release and migration documentation. Model memory,
   old ticket text, this dated snapshot, and the existing lockfile are not
   current-release evidence.
8. **Labels are hints.** `latest`, `canary`, `beta`, `next`, `internal`, GitHub
   tag names, and documentation branch names are discovery inputs, never
   dependency specifications or approval.
9. **Stable definition.** A stable v4 candidate is an installable npm `4.x`
   artifact with no SemVer prerelease component, reviewable source provenance,
   and the complete required first-party package family.
10. **Stable supersedes prerelease.** If any supported stable v4 exists, the
    prerelease lane closes and the newest eligible stable v4 becomes the first
    candidate. If that patch has a demonstrated applicable blocker, the next
    supported stable may be selected with the reason recorded.
11. **Prerelease order.** Only when stable v4 does not exist may the newest
    coherent, officially published and documented public v4 release candidate,
    beta, or canary be considered, in that maturity order.
12. **Internal-build exception.** An `internal`, debug, commit-preview, or
    unadvertised build is never preferred because Core already uses it. It
    requires a named upstream defect it uniquely fixes, reproducible source
    identity, complete closure, explicit release-owner exception, full
    qualification, and automatic expiry when an official public candidate
    contains the fix.
13. **Tag is not artifact.** A GitHub tag without an installable matching npm
    artifact and complete cohort is not a production candidate.
14. **Artifact is not enough.** An npm artifact without reviewable source
    identity and coherent official release evidence is not a production
    candidate.
15. **Exact immutable selection.** Manifests, lockfiles, builds, deployments,
    and runtimes use exact versions. Floating tags, ranges, forced peers, mixed
    channels, and inferred commit mappings are prohibited.
16. **Lockstep first-party cohort.** `payload` and every required first-party
    package—including Postgres, Next, UI, Lexical, email, storage, and their
    Payload peers—must form one complete matching version/channel tuple.
17. **Artifact identity record.** The qualification record captures exact
    versions, publication time, deprecation/support state, tarball and integrity,
    signatures/provenance when available, source ref, release/migration notes,
    license/advisory disposition, engines, peers, dependencies, and lockfile
    digest.
18. **Release-time concern.** Candidate discovery is a release process, not a
    runtime version selector, automatic upgrade service, Tenant choice, or
    ordinary staff setting.
19. **Freeze during proof.** Qualification freezes one exact candidate so new
    upstream publishing cannot mutate an in-progress proof.
20. **Promotion recheck.** Immediately before promotion, the release owner
    rechecks stable availability, artifact availability, deprecation/withdrawal,
    advisories, source provenance, and material official guidance. A new release
    never causes automatic deployment.
21. **Stable still qualifies.** Stable status reduces upstream churn but waives
    none of Core's qualification gates.
22. **Prerelease admission.** If no stable candidate exists at promotion, one
    exact public prerelease may be promoted only after the same complete
    qualification and with residual support/churn risk, owner, approver, expiry,
    review date, security path, stable-upgrade trigger, and retirement plan
    recorded.
23. **Fail closed.** A failed candidate blocks promotion. It never silently
    falls back to Payload v3, the old internal spike, stock Payload Admin, mixed
    packages, or dual authority.
24. **Whole runtime qualifies.** The exact Node, Bun/package-manager, React,
    Next, TypeScript, GraphQL, Postgres/Drizzle, Supabase, Vercel, Lexical,
    email, storage, and plugin closure is part of qualification.
25. **Generated artifacts qualify.** Payload types, import map, resolved config,
    database schema, migration files, and their reproducible digests are
    qualification artifacts.
26. **Gap-led plugins.** Every plugin or adapter must close a proven product
    gap and undergo the same schema, security, migration, performance, UX, and
    removal qualification. Version alignment alone does not admit it.
27. **Payload remains machinery.** Asym domain terms, identifiers, permissions,
    workflow state, public contracts, and audit meaning never become Payload-
    specific authority.
28. **D1 remains public authority.** D1's immutable Site generation remains
    the only public-content authority; no version upgrade restores mutable
    Payload reads to the public request path.
29. **Supabase/Asym remain staff authority.** Supabase Auth and Asym
    authorization remain authoritative; Payload roles, sessions, access
    defaults, and raw Admin never become staff authority.
30. **Explicit user-context operations.** User-context Local API and equivalent
    operations explicitly state access, lock, Tenant, locale, draft, fallback,
    `select`, `depth`, sort, limit, and pagination behavior rather than inheriting
    provider defaults.
31. **Negative tenant and privacy proof.** Qualification includes fail-closed
    cross-Tenant, draft/version, Preview, restricted-media, raw-endpoint,
    diagnostic, REST/GraphQL, hook, job, plugin, and Local API negative tests.
32. **Data and restore proof.** Clean installation and every retained
    predecessor upgrade must pass on production-shaped data with control totals,
    relationship closure, Tenant ownership, locale/version lineage, rich-text/
    media reconciliation, and complete row-plus-byte backup restoration.
33. **Serialized safe migrations.** Production migrations use one authority,
    Postgres advisory locking, immutable applied files, content hashes,
    execution receipts, and expand/migrate/verify/activate/contract stages.
    Destructive `down`, `refresh`, `reset`, and `fresh` are not ordinary
    recovery.
34. **Product-shaped qualification.** The candidate passes D33 capacity, cost,
    failure, and recovery cohorts plus real Web Studio journeys: autosave,
    conflict/reconnect recovery, history, Preview, release, localization,
    schedules, media, forms, search, Trash, keyboard/screen-reader use,
    accessibility, reflow, mobile, and restoration of prior context.
35. **Quiet ordinary UX.** Ordinary staff receive no Payload version setting,
    channel badge, migration dashboard, provider log, compatibility matrix, or
    upgrade ceremony. Healthy engine qualification is invisible.
36. **Calm affected UX.** If authoring is actually affected, staff receive one
    calm Site-scoped notice with the exact local maintenance state,
    confirmation that the public Site remains live on its last safe D1
    generation and acknowledged work is protected, no guessed progress or
    provider jargon, one cause-owned recovery path, and automatic return to the
    same Web Studio context after success. Privileged evidence remains in D30;
    only actionable product health appears through D31.

## What this means for future specifications and tickets

Every D34 implementation ticket must explicitly instruct the fresh agent to:

1. treat the approved Phase 23 specification and ratified decisions as product
   authority, but treat all recorded package versions as dated evidence;
2. run the complete live discovery protocol at task start and release freeze;
3. inspect Payload's official npm artifacts and the official Payload v4 GitHub
   repository, releases, tags, source, migration guide, security evidence,
   applicable issues, and release documentation carefully;
4. prefer and qualify stable v4 if it then exists rather than mechanically
   implementing the old prerelease wording;
5. create one immutable Payload Engine Qualification Record;
6. pin and verify the full exact cohort, generated artifacts, migration chain,
   and product/tenant/public semantics; and
7. stop on ambiguous or incomplete official evidence rather than guessing.

The complete executable handoff is in the
[future-agent discovery and qualification contract](./phase-23-d34-payload-v4-future-agent-discovery-and-qualification-contract.md).

## Ruthless adversarial result

Every requested category has a material concern under literal Option B:

| Category                         | Concern | Severity | Likelihood without hardening |
| -------------------------------- | ------- | -------- | ---------------------------- |
| Brittleness                      | Yes     | High     | High                         |
| Technical debt                   | Yes     | High     | High                         |
| Edge cases                       | Yes     | High     | Medium-high                  |
| Footguns                         | Yes     | Critical | High                         |
| Tenant safety                    | Yes     | Critical | Medium                       |
| Overengineering                  | Yes     | Medium   | Medium                       |
| UX/UI and user friction          | Yes     | High     | Medium-high                  |
| Hidden coupling                  | Yes     | High     | High                         |
| Failure modes                    | Yes     | Critical | Medium-high                  |
| Data integrity                   | Yes     | Critical | Medium-high                  |
| Security and privacy             | Yes     | Critical | Medium                       |
| Scalability and performance      | Yes     | High     | Medium                       |
| Operational burden               | Yes     | High     | High                         |
| Observability                    | Yes     | High     | Medium-high                  |
| Dependency and integration risks | Yes     | Critical | High                         |
| Migration and upgrade risks      | Yes     | Critical | High                         |
| Other development hazards        | Yes     | High     | High                         |

The full what/why/severity/likelihood/evidence/permanent-fix review is recorded
in the
[D34 adversarial review](./phase-23-d34-payload-v4-production-admission-adversarial-review.md).

## Ruthless synthesis

The permanent path is:

1. ratify the major-line commitment and deterministic discovery/admission
   policy, not today's artifact;
2. preserve today's registry and repository facts only as dated evidence;
3. require future agents to re-run official discovery and create one immutable
   qualification record;
4. prefer and qualify stable v4 whenever it exists, otherwise qualify one exact
   public prerelease without moving tags;
5. keep Payload behind Asym authority, Supabase authorization, and D1 compiler
   boundaries;
6. prove migration, data integrity, Tenant isolation, recovery, Web Studio UX,
   accessibility, capacity, and cost on the whole exact tuple;
7. keep failures private to qualification while preserving the last safe D1
   generation; and
8. retire prerelease compatibility after stable qualification instead of
   maintaining parallel Payload lines.

This is disciplined, not alarmist. It introduces one release-time discovery
protocol, one qualification record, and one small verification seam—not a
runtime upgrade platform.

## What D34 deliberately does not decide

- the exact numeric production candidate before live qualification;
- whether hosted content exists or may be discarded;
- record-by-record migrate/transform/archive/discard/replace classifications;
- D35 shadowing, write pause, authority cutover, rollback retention, or
  compatibility retirement;
- implementation tickets, dependency changes, schema, migrations, deployment,
  or production access; or
- a launch date that overrides a failed qualification gate.

## Ratification record

The founder ratified the exact 36-clause **B-prime-R — Payload v4 major-line
commitment with live release discovery, exact-cohort qualification, and
release-bound production admission** formulation above as **Phase 23 D34** on
2026-08-24.
