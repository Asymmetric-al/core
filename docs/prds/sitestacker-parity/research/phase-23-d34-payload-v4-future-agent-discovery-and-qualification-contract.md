# Phase 23 D34 — Payload v4 Future-Agent Discovery and Qualification Contract

**Status:** Binding normative companion to the founder-ratified exact
36-clause Phase 23 D34 B-prime-R.  
**Research date:** 2026-08-24  
**Purpose:** Prevent an implementation agent from treating a weeks- or
months-old ticket, version string, dist-tag, lockfile, or model memory as current
Payload v4 release truth.

## Required outcome

Qualify and freeze one exact Payload v4 production candidate against the target
branch that exists when implementation occurs. D34 qualifies the engine. D35
separately owns retained-state classification, migration, shadow proof,
authority cutover, rollback retention, and compatibility retirement.

The durable commitment is to **Payload major version 4**, not to the exact
prerelease visible when this document was written. If an official stable v4 is
available at implementation or release freeze, it supersedes the prerelease
lane. No agent may keep an obsolete prerelease merely because this brief or a
ticket once said “commit to a prerelease.”

## Discovery checkpoint one — task start

Before changing a manifest, lockfile, Payload config, migration, generated
artifact, or compatibility shim, the implementing agent must:

1. read the then-current root and nearest repository instructions, merged
   OpenSpec, Phase 23 specification, D1–D34 decisions, Payload vendor note,
   Web Studio living specification, runbooks, relevant ADRs, current manifests,
   lockfile, config, migrations, and tests;
2. record the UTC timestamp and exact target-branch commit;
3. query the official npm registry for all Payload `dist-tags`, all published
   versions, publication times, deprecations, engines, peers, dependencies,
   tarball identity, integrity, signatures, and available provenance for each
   exact candidate;
4. inspect official
   [Payload GitHub releases](https://github.com/payloadcms/payload/releases),
   [tags](https://github.com/payloadcms/payload/tags), exact source, release
   notes, security information, applicable issues and pull requests, and the
   v4 migration guide at the candidate's proven source ref;
5. inspect the published tarballs rather than inferring their contents from
   `main`, a nearby tag, or a version suffix;
6. enumerate the complete direct and transitive Payload/runtime cohort; and
7. emit a dated candidate comparison and one selection result, including every
   blocking discrepancy.

Suggested machine-readable discovery commands include:

```powershell
git fetch origin --prune --tags
git rev-parse HEAD

npm view payload dist-tags versions time --json
npm view payload@<exact> version deprecated engines peerDependencies dependencies optionalDependencies repository dist --json
npm view <required-package>@<exact> version deprecated engines peerDependencies dependencies optionalDependencies repository dist --json

gh api "repos/payloadcms/payload/releases?per_page=100"
gh api "repos/payloadcms/payload/git/matching-refs/tags/v<exact>"
gh api "repos/payloadcms/payload/contents/docs/migration-guide/v4.mdx?ref=<proven-ref>"
```

Use SemVer parsing, never lexical string sorting. Run npm artifact/signature
inspection in an isolated scratch directory. Bun remains Core's package manager;
do not introduce a `package-lock.json` or change package-manager ownership.

## Deterministic candidate selection

Apply this order:

1. enumerate installable, non-deprecated npm versions whose semantic major is
   `4`;
2. if one or more supported stable v4 releases exist, close the prerelease
   lane and evaluate the newest eligible stable first;
3. if the newest stable has a confirmed applicable security, data-loss,
   correctness, compatibility, or release-blocking defect, evaluate the next
   supported stable and record why it outranks the newest;
4. only when no stable v4 exists may the newest coherent official public
   release candidate, beta, or canary be considered, in that maturity order;
5. an internal, debug, commit-preview, unpublished, deprecated, withdrawn, or
   partially published build is ineligible unless the exact D34 exception
   conditions are met; and
6. a GitHub tag without an installable matching npm cohort, or an npm artifact
   without reviewable source identity, is not a production candidate.

`latest`, `canary`, `beta`, `next`, `internal`, GitHub branch names, and tags
are discovery inputs only. They are never manifest values or production
approval.

## One immutable qualification record

The selected candidate receives one versioned, machine-verifiable **Payload
Engine Qualification Record**. It is the sole evidence authority and contains:

- schema version, record ID, verdict, approvers, timestamps, target commits,
  owner, expiry, and requalification triggers;
- candidate version/channel, selection reason, publication/deprecation/support
  state, exact source ref, official source/document links, and any prerelease
  exception;
- every direct and transitive Payload package, exact version, tarball, integrity,
  signature/provenance state, license/advisory disposition, engine/peer closure,
  and final `bun.lock` digest;
- exact Node, Bun, Next, React, React DOM, TypeScript, GraphQL, Drizzle, `pg`,
  `sharp`, Supabase/Postgres, Vercel, Resend, Vercel Blob, Lexical, and plugin
  compatibility;
- normalized Payload config, generated types, import map, schema, migration,
  and artifact digests;
- exact migration-guide/release-note/source differences and their affected or
  not-affected classifications;
- clean-install and supported-predecessor upgrade evidence;
- tenant/security, editor, D1 equivalence, D33 capacity/cost, row-plus-byte
  restore, failure, and recovery results; and
- exact command, environment class, run ID, test counts, skipped-test count,
  and artifact links for every gate.

Failed candidates remain recorded as failed. Never overwrite them, place
secrets or signed URLs in the record, or include private ministry, donor,
applicant, missionary, or staff content.

## Whole-cohort and artifact gates

The direct cohort currently includes at least:

- `payload`;
- `@payloadcms/db-postgres`;
- `@payloadcms/next`;
- `@payloadcms/ui`;
- `@payloadcms/richtext-lexical`;
- `@payloadcms/email-resend`; and
- `@payloadcms/storage-vercel-blob`.

The agent must rediscover—not assume—this list. It must enumerate every
transitive `@payloadcms/*` package and relevant runtime dependency from exact
metadata and `bun.lock`. Same-release first-party packages use one exact version
and channel. Mixed stable/canary/internal packages, forced peers, ranges,
duplicate core versions, missing integrity, or unexplained lock drift fail the
gate.

One small permanent `verify:payload-engine-qualification` seam is justified. It
should compare both manifests, `bun.lock`, installed metadata, generated
artifacts, and the frozen qualification record without networking. Networked
discovery is a separate release-time capture, not ordinary CI or runtime logic.

## Exact-source change review

The qualification record must classify every applicable change in the exact
candidate's release notes, source diff, package exports, advisories, and pinned
v4 migration guide, including:

- default query depth, `select`, sort, limit, pagination, locale, draft,
  fallback, and access behavior;
- versions and draft defaults;
- admin slots, list-view Select behavior, framework adapters, and exports;
- generated types and database-adapter types;
- Lexical rich text and import/export behavior;
- Jobs schema, access, concurrency, claims, leases, and migrations;
- plugin configuration transformations and schema/runtime mutations; and
- Node, Next, React, and TypeScript requirements.

Current `main` documentation may help discovery, but the frozen evidence must
cite the candidate's proven ref and published artifact. A codemod may assist a
review; it does not replace it and never receives unreviewed write authority.

## Migration and recovery gates

Use the exact promoted config, collections, access/hooks, plugin set, locales,
schema name, and `PAYLOAD_DISABLE_SCHEMA_PUSH=1`. The candidate must prove:

- empty-database installation;
- upgrade from every retained production predecessor;
- upgrade against a sanitized production-shaped restore;
- reviewed generated SQL and schema difference;
- abort, retry, restart, concurrent-start, and idempotent-rerun behavior;
- one explicit migration authority guarded by a Postgres advisory lock;
- Supabase-owned migrations before Payload-owned migrations;
- immutable applied migration files plus content-hash and execution receipt;
- row/control totals, relationship closure, Tenant ownership, draft/version/
  locale lineage, rich-text fidelity, and media-object reconciliation; and
- database-and-object restore plus compatible application/D1 rollback or
  forward repair.

Vercel builds and request-time/serverless initialization must never race to
migrate. Destructive `down`, `refresh`, `reset`, or `fresh` operations are not
ordinary production recovery.

## Product, security, UX, and capacity gates

Qualification must prove, without skipped or allowed-to-fail checks:

- Supabase-authenticated identity propagation and Asym authorization;
- fail-closed Tenant, draft/version, Preview, restricted-media, raw-endpoint,
  diagnostic, plugin, hook, job, REST, GraphQL, and Local API isolation;
- explicit access, lock, Tenant, locale, draft, fallback, `select`, `depth`,
  sort, limit, and pagination behavior for user-context operations;
- drafts, versions, autosave, recovery, history, localization, scheduling,
  Trash, Preview, publication, Lexical, navigation, dynamic sources, forms,
  imports/exports, media, search, and D1–D33 invariants;
- D1 shadow compilation and semantic comparison of paths, redirects,
  navigation, locale behavior, metadata, forms, dynamic content, search,
  qualified media, and public bytes;
- Web Studio keyboard, screen-reader, touch, zoom, contrast, reflow, mobile,
  reduced-motion, failure, and return-to-context journeys; and
- D33 database, Vercel, storage, connection, query, latency, throughput, burst,
  noisy-neighbor, failure, recovery, and cost cohorts.

Payload remains replaceable machinery. Payload IDs, tables, roles, sessions,
versions, jobs, preferences, plugin routes, and Admin surfaces never become
Asym domain or public authority.

## Discovery checkpoint two — release freeze

Immediately before dependency lock or production promotion, repeat the complete
official-source discovery and compare it with the frozen record.

- If stable v4 appeared, close the prerelease lane and qualify stable.
- A newer prerelease or stable patch never auto-upgrades an already qualified
  candidate.
- Change candidates only for an applicable security, data-loss, correctness,
  compatibility, or release-blocking reason; otherwise preserve the frozen
  candidate and record bounded follow-up.
- Any selected-version, artifact-integrity, source, advisory, deprecation,
  runtime, config, schema, migration, plugin, provider-topology, or material
  target-branch change reopens the affected gates.

## Mandatory stop conditions

Stop qualification or promotion when any of these is true:

- D34 is not ratified;
- official discovery cannot run or the evidence is ambiguous;
- stable v4 exists but the candidate remains a prerelease;
- the artifact floats, is unavailable, is deprecated without accepted
  remediation, lacks provenance, or disagrees with official source evidence;
- a required first-party package, peer, runtime, or compatible plugin is missing;
- manifests, installed packages, lockfile, integrity, or generated artifacts
  disagree;
- exact-source behavioral differences remain unclassified;
- the candidate conflicts with Core's Node/Next/React/TypeScript/Bun or
  Vercel/Supabase topology;
- migration authority, advisory lock, immutable receipt, predecessor upgrade,
  row-plus-byte restore, or non-destructive recovery proof is absent;
- any Tenant, privacy, draft, Preview, media, raw-endpoint, Local API, editor,
  D1 equivalence, accessibility, or D33 qualification fails;
- a required test is skipped, allowed to fail, or uses placeholder data;
- release-freeze evidence materially differs from the qualification record; or
- D35's retained-state census and cutover decision are being bypassed.

Failure preserves the last qualified state and the last safe D1 public
generation. It never authorizes silent fallback to Payload v3, today's internal
spike, stock Payload Admin, mixed versions, or dual authority.

## Existing Core seams to reuse

Future implementation should begin with the existing exact pins and verification
seams rather than inventing a parallel CMS harness:

- `package.json` and `apps/admin/package.json` exact Payload pins;
- `bun.lock` integrity and transitive closure;
- `scripts/cms/lib/payload-runtime.mjs` runtime/version parsing;
- `scripts/cms/run-payload-command.mjs` deterministic CLI environment and
  disabled schema push;
- `scripts/cms/generate-importmap.mjs` and `scripts/cms/verify-local.mjs`;
- `scripts/verify/bun-lock-drift.mjs` and
  `scripts/verify/cms-public-sole-entry.mjs`;
- the local CMS reset, migration, verification, and Playwright harnesses; and
- focused unit seams for runtime integration, import maps, local CMS scripts,
  and the public-reader boundary.

These are inputs, not proof that the current internal cohort is production-
qualified. The future ticket must add the smallest missing qualification
verifier and strict no-skip gate; it must not build a runtime version chooser,
automatic upgrade service, permanent dual-version adapter, or second health
dashboard.
