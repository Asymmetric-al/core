# ADR-0178: Payload v4 major-line commitment and release-bound production admission

**Status:** Accepted (founder-ratified Phase 23 D34 B-prime-R, 2026-08-24; qualification suite contents added 2026-11-17 for AL-2688)

## Context

Phase 23 is being designed against Payload v4 while stable v4 is not yet an
official installable release. Core currently pins an older internal v4 cohort,
but implementation tickets may be opened weeks or months after this decision,
when the official release state, migration guide, package closure, runtime
requirements, and security posture may be materially different. Freezing
today's prerelease would become stale; using a mutable “latest” or prerelease
tag would be nondeterministic; waiting to design until stable would create a
temporary architectural detour without proving production safety.

## Decision

Phase 23 commits to the **Payload v4 major line** while deferring the exact
numeric production candidate to live, official-source discovery and complete
qualification. Discovery occurs when implementation starts and again at release
freeze. If a supported stable v4 exists, it supersedes the prerelease lane. If
no stable exists, only one exact coherent public v4 prerelease may be considered
and it receives the same full qualification plus explicit residual-risk,
ownership, expiry, security, stable-upgrade, and retirement evidence.

One immutable Payload Engine Qualification Record binds the exact npm artifacts
and source provenance; lockstep first-party/runtime/plugin cohort; manifests and
lockfile; generated types, import map, config, schema, and migrations; Tenant,
privacy, editor, public D1, accessibility, capacity/cost, backup/restore, and
recovery evidence; and requalification triggers. Floating tags, ranges, mixed
channels, forced peers, v3 fallback, stock Payload Admin fallback, mutable public
Payload reads, and dual authority are prohibited.

Payload remains replaceable editorial machinery. D1 remains public-content
authority; Supabase Auth and Asym authorization remain staff authority; source
domains retain product truth and recovery. D34 qualifies the engine only. D35
separately governs current-state classification, transformation, shadow proof,
write pause, authority cutover, rollback retention, and compatibility
retirement.

The complete exact 36-clause authority is preserved in
[Phase 23 D34](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d34--payload-v4-major-line-commitment-and-production-admission)
and its
[decision brief](../prds/sitestacker-parity/research/phase-23-d34-payload-v4-production-admission-decision-brief.md).

## Consequences

- Future agents must treat recorded version strings as dated evidence and
  inspect current official npm artifacts plus Payload GitHub releases, tags,
  source, security evidence, applicable issues and pull requests, and the exact
  candidate's release and v4 migration documentation.
- Stable status never waives Core qualification. A failed or ambiguous candidate
  blocks promotion rather than triggering a silent fallback.
- Migration, retained-data replacement, and public cutover cannot be collapsed
  into one irreversible deployment.
- Healthy engine operation remains invisible to staff. A real bounded authoring
  interruption receives one calm Site-scoped notice, preserves acknowledged
  work and the last safe D1 generation, and returns the editor to the same
  context.
- Core adds only the smallest deterministic release-time discovery and offline
  verification seams; it does not build a runtime upgrade service, permanent
  multi-version abstraction, or second health dashboard.

## Amendments

### 2026-11-17: The qualification suite's contents (AL-2688)

- **Authority.** The owner's instruction of 17 November 2026 to implement the
  CRM, CMS and database plan ratifies the disposition its
  [section 14](../audits/core-crm-cms-database-target-architecture.md#14-required-future-documentation-decisions)
  lists for this record: keep it, and record what follows. This records intent,
  not implementation; the
  [implementation record](../audits/core-crm-cms-database-implementation-record.md)
  says what exists.
- **Next pin.** The plan stays on the Payload v4 line and moves in WP1 to a
  patched pre-release, 4.0.0-beta.9 or newer, with the Node floor raised to
  match, because three published advisories apply to the current pin (audit
  C01). It moves to stable v4 when stable ships and qualifies.
- **The suite every version bump runs, as one script:** Local API access
  defaults; version-read access; migrations up from an empty database; no
  same-named tables or enums across schemas; hand-written constraints surviving
  the next generated migration; UUID and supplied-ID behaviour; start-up as
  `cms_runtime` with no schema-changing statement; the REST mount under
  `/web-studio/api`; a media record created with a supplied ID and no upload; a
  REST write to a document's status that makes nothing public; pooling mode;
  and, if JSON blocks are adopted, JSON block round-trips with a media reference
  and one block schema change (plan section 6.7).
- **JSON blocks are conditional.** `blocksAsJSON` is adopted only if the suite
  passes; otherwise blocks stay relational.
- **Production admission.** WP11 requires the suite to have passed on the
  Payload version pinned for the production database, which is the release
  freeze this record names. Whether a real organization may start on a
  pre-release remains the owner's call (council record C.8, reservation 8).
