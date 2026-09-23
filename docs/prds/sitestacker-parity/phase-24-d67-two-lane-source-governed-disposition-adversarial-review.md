# Phase 24 D67 — Two-lane source-governed translation disposition

- **Founder direction:** Option 1 — two-lane, source-governed disposition;
  preserve an excellent, simple Core-native UX and do not build a workflow
  engine
- **Final disposition:** **Accept with required amendments**
- **Reviewed:** 2026-08-30
- **Scope:** ordinary source drift, explicit translation provenance, source-
  owned public-use safety, staff/public UX, authorization/RLS, generation and
  cache behavior, migration, rollout, proof, and D66 authority correction
- **Non-scope:** no runtime, schema, migration, OpenSpec, Payload configuration,
  Vercel resource, source adapter, task, notification, timer, translation
  service, or implementation ticket is authorized by this review

## Executive adjudication

Option 1 is the strongest permanent direction, but the short label is not safe
or implementable by itself. “Source changed” could otherwise mean autosave,
timestamp, rejected draft, default-language edit, or any provider version bump;
“source-governed” could become a generic critical-content classifier or ask
every editor a disruptive safety question; and “keep public” could be mistaken
for a translator-quality attestation.

The corrected decision is [ADR-0188](../../adr/0188-retain-reviewed-translations-across-source-drift.md):

1. **Ordinary freshness lane:** compare only an explicit immutable Translation
   Basis with the current authoritative translation-input digest. A mismatch is
   staff-only **Out of date** and leaves the last reviewed exact-locale public
   version unchanged.
2. **Safety lane:** only a registered authoritative source owner can decide
   whether prior translation-dependent public use may continue or is revoked.
   A revocation reuses D66's smallest-complete-closure, adverse-fence-first
   transition. It is not inferred from freshness and cannot be waived by a
   translator or locale manager.

D67 adds no generic workflow, risk tier, mutable safety flag, tenant rule DSL,
extra ordinary publication approval, task, reminder, notification, deadline,
translation percentage, quality score, or public stale banner.

## Current behavior, intended behavior, and permanent path

| Layer            | Verified current `develop` behavior                                                              | Intended D67 behavior                                                                                                                     | Best permanent path                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| CMS localization | Payload config has no localization; Page fields are scalar and Navigation is versionless.        | Sparse exact-locale revisions with explicit source basis where the editor copied/declared a source.                                       | Consume an accepted Phase 23 exact-locale lineage contract; do not enable Payload fallback or beta localized status as authority. |
| Public reader    | Tenant plus published status; no Site Locale, generation, resource version, or source basis.     | Exact Tenant/Site/locale/generation/version read with separate freshness and safety facts.                                                | Extend the sole reader and negative-test seam; never add a parallel public reader.                                                |
| Freshness        | No D67 fact or projection exists.                                                                | D66's exhaustive `Current`, `Out of date`, `No public translation`, and `Could not be checked` reporting derives from immutable evidence. | Source-owned translation-input digest plus rebuildable exception projection; no `is_stale` truth.                                 |
| Safety           | No D67 source public-use disposition exists.                                                     | Registered source owner records continue/revoke for a safety-governed successor.                                                          | Extend finite owner adapters already needed by D66; no central generic safety engine.                                             |
| Public release   | Current runtime selects latest published Payload documents; D66 target describes one generation. | Ordinary drift preserves target output; source revocation installs a safe successor closure.                                              | One Public Site Generation head; compact adverse fence only subtracts during cutover.                                             |
| Staff UX         | Web Studio wraps Payload but has no Languages workspace or translation diff.                     | Compact exception list, existing editor, on-demand comparison, no-edit confirmation, source-owned safety consequence review.              | Base Maia/Base UI and native semantic controls; no second editor or workflow shell.                                               |
| Formal status    | D66/D67 are grooming docs. Phase 23 PR #1340 is open and blocked.                                | One consolidated Phase 24 OpenSpec delta becomes implementation authority.                                                                | Do not ticket or implement D67 until compatible lineage/generation/health contracts and the Phase 24 delta are accepted.          |

## Evidence classification

### Verified repository facts

- `apps/admin/payload.config.ts` configures no localization or localized status.
- `apps/admin/src/cms/collections/pages.ts` has scalar content and Payload
  autosave; `navigation.ts` explicitly has `versions: false`.
- `packages/api/src/cms/public/context.ts` and the current resolver have no exact
  locale/generation/source-basis context.
- `apps/admin/src/cms/public/published-content-reader.ts` is the sole Payload
  reader and currently selects by Tenant, published status, identifier, and
  current provider ordering—not a locale-exact generation.
- `packages/api/src/cms/public/cache-tags.ts` still contains a bare locale tag;
  D66 already rejects it as an isolation key.
- Merged `openspec/specs/platform-boundaries/spec.md` requires Tenant-controlled
  publication rules and forbids inventing a manual gate when a Tenant authorizes
  automatic publishing.
- Phase 23's roadmap includes scheduled publish and unpublish. Its richer D1,
  D22, and D31 contracts exist only in open, blocked PR
  [#1340](https://github.com/Asymmetric-al/core/pull/1340); they are relevant
  proposed evidence, not merged authority.
- D66's blanket fresh-human `sites.publish_locales` requirement for every new
  generation head contradicted the merged publication boundary. This review
  narrows it to initial/whole-locale operations and leaves later resource
  publication with the source owner's Tenant-controlled policy.

### Verified current primary evidence

| Source                                                                                                                                                                                                                                       | Modern practice verified                                                                                                                | D67 use                                                                                                                  | Boundary retained                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [Shopify localization](https://help.shopify.com/en/manual/international/localization-and-translation) and [Translation API](https://shopify.dev/docs/api/admin-graphql/latest/objects/Translation)                                           | Uses Translated/Outdated/Untranslated, preserves custom translations, and binds updates to a source digest.                             | Supports a digest-based staff freshness fact without automatic withdrawal.                                               | Shopify's primary-language runtime fallback is rejected by D15/D66.                   |
| [Contentful entry state](https://www.contentful.com/developers/docs/tutorials/general/determine-entry-asset-state/) and [locale publishing](https://www.contentful.com/help/localization/locale-based-publishing/)                           | A Changed entity keeps its last published delivery version; locales can publish independently and expose per-locale states.             | Supports public stability plus a separate editorial-attention state.                                                     | Provider workflow/task coupling and fallback semantics are not imported.              |
| [Drupal Content Translation](https://www.drupal.org/docs/8/core/modules/content-translation/overview)                                                                                                                                        | Records a selected source language and can flag other translations outdated.                                                            | Supports explicit source relation and visible editorial staleness.                                                       | Core does not copy Drupal's mutable entity/workflow model.                            |
| [Payload localization](https://payloadcms.com/docs/configuration/localization) and [versions](https://payloadcms.com/docs/versions/overview)                                                                                                 | Offers field localization, per-locale beta status, versions/diffs, and explicit fallback disabling.                                     | Reuse exact-locale access and version comparison behind Core's adapter.                                                  | Fallback defaults on and localized status is provider/beta state, not Core authority. |
| [Dynamics knowledge translations](https://learn.microsoft.com/en-us/dynamics365/customer-service/use/translate-ka)                                                                                                                           | Translation versions are independently edited and published.                                                                            | Confirms independent successor publication is normal CRM/CMS practice.                                                   | D67 does not import major/minor version semantics.                                    |
| [GOV.UK radios](https://design-system.service.gov.uk/components/radios/) and [W3C form feedback](https://www.w3.org/WAI/tutorials/forms/notifications/)                                                                                      | Consequential single choices should be explicit and unselected; feedback must be concise, associated, and accessible.                   | One source-owned two-radio choice only when the registered source contract requires it; polite result/conflict messages. | Routine edits receive no radios or modal.                                             |
| [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)                                                                                                                            | Alternates identify actual localized pages and should remain reciprocal.                                                                | Keep a real, still-authorized out-of-date translation in discovery; atomically remove a revoked one.                     | No English substitution at a French URL.                                              |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [API security](https://supabase.com/docs/guides/api/securing-your-api), and [PostgreSQL RLS](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | Grants and policies are separate; service/secret paths bypass RLS; updates need old/new-row protection; RI checks can reveal structure. | Command-only writes, exact-scope constraints, matching `USING`/`WITH CHECK`, non-enumerating errors.                     | RLS is defense in depth, not Phase 12 capability authority.                           |
| [PostgreSQL constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)                                                                                                                                                            | Composite FKs preserve scope; referencing columns are not indexed automatically.                                                        | Full-scope keys plus explicit purpose-shaped indexes.                                                                    | No speculative index-per-field or cross-store FK fiction.                             |
| [Next.js revalidation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) and [Vercel storage](https://vercel.com/docs/storage)                                                                                              | Ordinary tag revalidation can serve stale data; Edge Config is replicated configuration, not transactional truth.                       | Ordinary freshness performs no Vercel write; revocation relies on D66's deny-only gate and authoritative head recheck.   | Tags/Edge Config never grant serving or become a second head.                         |

### Product judgments

- Keeping the last human-reviewed exact-locale publication is more trustworthy
  than silently removing it for routine copy drift.
- A no-edit review must exist; forcing translators to alter bytes merely to
  update provenance is artificial work and corrupts audit meaning.
- Staff need one exception list and existing editor handoff, not a translation
  project-management product in Phase 24.
- Safety disposition belongs at the source publication boundary because that
  owner understands whether prior meaning may still be used; the translator
  remains responsible only for translation review.

### Assumptions and release evidence still required

- Which concrete source families are safety-governed has not been proven from
  current runtime because none exists. The consolidated OpenSpec/design must
  inventory each real owner and reject speculative adapters.
- Representative nonprofit communications staff, occasional editors, and
  translators have not yet completed task-based usability testing of this
  future UI. Release requires observed completion and comprehension; imagined
  ministry workflows are not evidence.
- Vercel/Next/Payload exact versions and measured capacity may change before
  implementation. Qualification must pin the actual release versions and
  measured limits instead of copying dated vendor defaults into domain truth.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** Automatic withdrawal solves mechanical recency but
not the root need: preserve useful reviewed ministry content while containing
authoritatively unsafe output. It would break links and campaigns for harmless
edits; a no-build “ignore source drift” alternative leaves translators blind.
**Severity: High. Likelihood: High** once multilingual content exists. Shopify,
Contentful, Drupal, and proposed Phase 23 D22 support independent public versions
plus editorial staleness. This narrows—not invalidates—Option 1: D67 must solve
only freshness and safety disposition, not translation operations. **Permanent
fix / exact requirement:** D67-R1–R3 and R15; retain ordinary output, surface
derived exceptions, and reject both auto-withdraw-all and no-status designs.

### 2. Brittleness

**Material concern: Yes.** Inferring source from English/default locale, matching
slug, `updatedAt`, provider version, or text similarity fails for independently
authored/localized structure, imports, reverts, and multiple regional sources.
Wrong freshness creates false work or false confidence. **Severity: High.
Likelihood: High.** Current Core has none of the required lineage. This changes
the option by requiring an immutable three-way Translation Provenance sum and a
Translation Basis exactly when provenance is Translated. **Permanent fix / exact
requirement:** D67-R1–R2; Independent is not compared with a source and appears
as **Current** (no translation follow-up) only when its own current public target
is proven, Legacy · source unclassified is **Could not be checked**, and neither
is guessed.

### 3. Technical debt

**Material concern: Yes.** A mutable `is_stale`, central critical-content table,
second release head, or duplicated source-field registry would drift and require
repair scripts. **Severity: High. Likelihood: Medium-high** under multiple source
families. Phase 23 proposed lineages and D31 projection already establish the
right seams. This narrows Option 1 to immutable source evidence plus a rebuildable
projection. **Permanent fix / exact requirement:** D67-R2, R6, R10, R12, R15;
co-locate translation-input manifests with source contracts and create no generic
workflow/policy engine.

### 4. Edge cases

**Material concern: Yes.** Independent localized copy, source digest reverting,
multiple intervening edits, unchanged rendered target, shared source blocks,
source deletion, source locale changes, and hidden affected resources can all
misstate status or scope. **Severity: High. Likelihood: Medium.** D22 evidence
explicitly allows locale structure to diverge. The decision is retained only
with explicit handling. **Permanent fix / exact requirement:** D67-R1–R5,
R6, R8, R10–R14 and AC1–AC25; provenance distinguishes independent from legacy,
only compatible input identity can be Current, ordinary deletion never implies a
disposition, and every registered safety-governed destructive lifecycle must
explicitly continue prior use or complete adverse fencing.

### 5. Footguns

**Material concern: Yes.** Prompting every source editor to judge languages they
cannot read creates click-through decisions; letting a translator clear a legal/
privacy revocation is worse. **Severity: Critical. Likelihood: High** without a
bounded source contract. This changes the UX materially: ordinary edits have no
prompt; only a registered safety-governed source publication asks one unselected
source-use question. **Permanent fix / exact requirement:** D67-R6–R7 and R15;
the source owner judges prior source use, never translation quality.

### 6. Tenant safety

**Material concern: Yes.** A wrong-Tenant basis, affected-set count, diff, cache
key, or revocation could leak content or disable another ministry's site.
**Severity: Critical. Likelihood: Medium** unless scope is structural; current
Payload uses a privileged database path. The answer remains viable only with
same-scope structure and least-disclosing UX. **Permanent fix / exact
requirement:** D67-R8, R10–R12; exact Tenant/environment/Site/resource/locale keys,
permission-filtered aggregates, non-enumerating errors, and poison tests.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** RLS alone cannot contain Supabase secret/service roles
or Payload's privileged connection; an allowed update could move scope or rewrite
history; missing FK indexes can make revocation scans unsafe under load.
**Severity: Critical. Likelihood: Medium.** Official Supabase/PostgreSQL guidance
and current Payload architecture directly support the concern. This adds required
implementation safeguards, not a new product layer. **Permanent fix / exact
requirement:** D67-R10–R11; command-only writes, FORCE RLS where applicable,
minimal grants, matching `USING`/`WITH CHECK`, exact-scope keys/FKs, restrictive
delete, immutable records, security-invoker views, hardened functions, indexed
references, and trusted server actor/time/scope.

### 8. Overengineering

**Material concern: Yes.** A generic revocation service, tenant risk taxonomy,
translation workflow, timer/SLA, task/email fan-out, semantic AI classifier, or
per-Page edge inventory would solve speculative needs while duplicating owners.
**Severity: High. Likelihood: High** given the apparent cross-domain reuse.
This substantially narrows Option 1. **Permanent fix / exact requirement:**
D67-R6–R8 and R15; finite typed owner adapters, one derived exception family,
existing source publication, generation, fence, and Web Studio seams only.

### 9. UX/UI and user friction

**Material concern: Yes.** Combining **Out of date**, unsafe, unpublished, and
cache-stale in one badge causes staff panic and donor-facing warning noise; an
extra approval on every correction breaks automatic/scheduled publication.
**Severity: High. Likelihood: High.** Core principles, W3C, GOV.UK, Shopify, and
Contentful support separate honest states and concise controls. The option is
accepted only with the calm UI in D67-R4–R6/R16: one exception list, existing
editor, on-demand diff, no-edit confirmation, and source-owned consequence
review only when required. Public ordinary output has no stale badge or language
substitution.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** Payload, Postgres, Public Site Generation, freshness
projection, source disposition, cache, and search could all claim “current.”
**Severity: Critical. Likelihood: High** without an owner map. D66 already
requires one serving head; merged boundaries keep domain truth separate. This
changes terminology and invariants. **Permanent fix / exact requirement:**
D67-R1–R3, R6–R10: source owner owns source input/disposition; target owner owns
review/revision; generation owns serving; projection explains freshness; fence
only denies; cache/search derive.

### 11. Hidden coupling

**Material concern: Yes.** If a Payload version bump, Content Health outage,
task completion, notification, or Edge Config state changes public content,
unrelated upgrades become publication events. **Severity: High. Likelihood:
Medium-high.** Current Navigation being versionless illustrates provider coupling.
The option is narrowed to typed ports and immutable identities. **Permanent fix /
exact requirement:** D67-R2–R3, R8, R12–R15; projection/provider mechanics never
own source, review, safety, or serving.

### 12. Failure modes

**Material concern: Yes.** Fence succeeds but database transition fails; database
success response is lost; diff/projection is down; cache purge lags; only part of
an affected closure updates. Unsafe output may persist or safe content may vanish
without truthful recovery. **Severity: Critical. Likelihood: Medium.** D66 already
selects adverse-fence-first and exact-command reconciliation. The decision is
accepted only by reusing it. **Permanent fix / exact requirement:** D67-R8,
R11–R13; unknown safety remains denied, ordinary projection failure leaves public
output unchanged, receipts support readback, and recovery moves forward from the
same command.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** Source changes during translator review, target
publishes during source revocation, duplicate dispositions, late projection
events, and old clients can produce a false **Current** or re-serve revoked
content. **Severity: Critical. Likelihood: High** in real collaborative editing.
This adds exact expected-head/set-digest semantics. **Permanent fix / exact
requirement:** D67-R5, R8, R11 and AC5–AC10; same meaning replays receipt, changed
meaning conflicts, revocation wins the next admission, and late events are
generation/revision fenced.

### 14. Data integrity risks

**Material concern: Yes.** Duplicate basis/review rows, mutable source pins,
cross-scope references, deletion cascades, digest/profile drift, or stale
projections can corrupt history and reporting. **Severity: High. Likelihood:
Medium.** PostgreSQL constraints and Phase 23 immutable revision design provide
the prevention. This strengthens but does not invalidate Option 1. **Permanent
fix / exact requirement:** D67-R1, R5, R10–R12; uniqueness at exact business
grain, append-only successors, checked digest/profile, restrictive deletion,
stable projection identity, and reconciliation against current heads.

### 15. Security and privacy risks

**Material concern: Yes.** Safety reasons, hidden titles, restricted worker
details, source diffs, or affected counts could leak through UI, logs, metrics,
errors, exports, caches, or generated documents. **Severity: Critical.
Likelihood: Medium.** Platform safety precedence and Phase 10 require adverse-
first, least-disclosing behavior. This narrows the UI and telemetry. **Permanent
fix / exact requirement:** D67-R6–R8, R10, R12, R16; typed safe reason class,
restricted evidence digest/reference, permission-safe counts, tenant-brand-native
public absence, low-cardinality metrics, no reason/body in public/log/cache.

### 16. Scalability and performance risks

**Material concern: Yes.** Request-time Site × locale × resource scans, per-edit
fan-out, or per-Page Edge Config keys will degrade with large Sites and many
Tenants. **Severity: High. Likelihood: Medium-high.** D66 prohibits the matrix and
per-Page edge inventory; PostgreSQL requires explicit referencing indexes. This
changes implementation shape. **Permanent fix / exact requirement:** D67-R8,
R10, R12–R13; event-driven indexed projection, keyset pagination, bounded
aggregates, reverse-dependency index, one successor generation, and compact
generation admission coordinates.

### 17. Operational burden

**Material concern: Yes.** Manual stale reconciliation, a safety decision on
every edit, direct DB repair, or per-locale cache operations would require tribal
knowledge. **Severity: High. Likelihood: High** without the bounded two-lane
contract. The decision remains valid because it automates classification and
projection while keeping rare safety judgment source-owned. **Permanent fix /
exact requirement:** D67-R2, R4–R6, R8, R12, R15; one exception list, normal
source actions, typed reconciliation, no manual cache/database workflow.

### 18. Observability and auditability gaps

**Material concern: Yes.** Technical logs cannot prove which source version,
actor, disposition, affected closure, fence, head, or review produced a public
outcome; a green projection can be false. **Severity: High. Likelihood: High**
because current CMS audit is logging only. This adds durable business evidence
and named monitors. **Permanent fix / exact requirement:** D67-R5–R6, R8,
R10–R12 plus the monitor table; distinguish business history, security audit,
projection telemetry, and public readback.

### 19. Dependency and integration risks

**Material concern: Yes.** Payload fallback/beta status, unmerged Phase 23
contracts, Next stale-while-revalidate, Vercel propagation, or provider schema
changes could silently reinterpret D67. **Severity: High. Likelihood: Medium.**
Current official docs and PR #1340 establish the risk. This makes accepted
compatible foundations and exact-version qualification implementation gates.
**Permanent fix / exact requirement:** D67-R1, R8, R12–R15; provider-neutral
ports, fallback off, authoritative head recheck, mixed-version decoders, no
domain/deploy dependency, and no implementation on an unaccepted proposal.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** Backfilling source from default locale/timestamps,
enabling writers before readers/fences, dual status truth, or rolling back by
ignoring a committed revocation can expose or mislabel content. **Severity:
Critical. Likelihood: Medium-high** in the current scalar model. The option is
valid only with evidence-classified migration. **Permanent fix / exact
requirement:** D67-R14; expand/readers and denial first, proof-only basis backfill,
unknown lineage as **Could not be checked**, shadow projection, one cohort at a
time, kill new writers but retain every adverse disposition/fence, recover
forward.

### 21. Testability, traceability, and proof

**Material concern: Yes.** “Mark stale and fence unsafe” is not falsifiable and
could drift between glossary, ADR, PRD, OpenSpec, tickets, code, tests, and release
evidence. **Severity: High. Likelihood: High** without exact scenarios. The
answer is amended with D67-R1–R16, AC1–AC25, a dedicated ADR, and required
OpenSpec scenarios. **Permanent fix:** automated trace IDs and release evidence
must verify outcomes, not merely flags/functions; implementation remains blocked
until the consolidated Phase 24 delta is accepted.

### 22. Other development hazards

**Material concern: Yes.** The main hazards were the D66 every-head
human-gate contradiction, incorrectly treating proposed Phase 23 architecture as
merged, Phase 24 ADR-0118–0124 colliding with Phase 22's reserved range, a
soft-200 unavailable route, and rollback that resurrects revoked
content. **Severity: Critical. Likelihood: Medium-high.** Repository audit found
each explicitly. These findings change D66/Phase 12 and D67 serving language.
**Permanent fix / exact requirement:** D67-R8–R9, R13–R15; initial versus resource
publication authority is explicit, D66's minimal generation contract stands on
its own, the Phase 24 ADR set is renumbered ADR-0181–0188 after Phase 23's
reserved ADR-0180, unavailable responses are typed 404/410/503 rather than soft
200, and adverse history survives rollback.

## Exact normative requirements

**D67-R1 — explicit provenance sum and Translation Basis.** Every target revision
owns exactly one immutable provenance disposition: **Translated** has exactly one
same-Tenant/environment/Site/stable-resource basis with a distinct exact source
locale, exact translation-input revision, versioned canonicalization profile, and
digest; **Independently authored** has no basis and is not compared with a
source; **Legacy · source unclassified** has no trusted basis and is **Could not
be checked**. A currently public Independently authored target reports in D66's
**Current** bucket as requiring no translation follow-up, while detail always
states **Independently authored** and never claims a source comparison.
Successors may classify legacy content; history never mutates. Defaults, English,
slug, equality, timestamps, authoring order, fallback, and provider status never
infer provenance or basis.

**D67-R2 — authoritative semantic input only.** Only a current authoritative
translation-input publication and source-owner-declared translatable semantics
participate. Freshness compares the complete compatible canonicalization
profile/version plus digest, never a bare digest across profile versions. Drafts,
autosaves, rejected/future candidates, audit, folders, Topics, provider keys,
cache, time, task, notification, and unrelated operational changes have no
freshness effect; an unproved profile transition is **Could not be checked**.

**D67-R3 — ordinary drift is public-inert.** A compatible translation-input
identity mismatch derives **Out of date** and leaves the last reviewed exact
target publication, route, Navigation, search, sitemap, reciprocal alternatives,
and authorized language links unchanged. It never edits, translates,
substitutes, redirects, relabels, withdraws, or adds a visitor warning.

**D67-R4 — separate honest axes.** Public availability, translation freshness,
safety, and projection availability remain independent. **Could not be checked**
never means **Current**; **Out of date** never means unsafe or unavailable. The
compact Languages label derives from those facts and is not a stored enum.
Partial safety closure takes precedence as **Published · needs attention**;
universal closure is **Needs attention**; only current-watermark ordinary drift
is **Published · changes to review**. D66's four reporting buckets form one
ordered total function for every complete permitted ordinary-resource population
at one current watermark. First, no current exact-locale public target is **No
public translation**, regardless of private-draft provenance/evidence; authorized
detail says **Draft exists** or **Not started**, while hidden detail stays generic.
Second, a current public **Independently authored** target is **Current** with
independent detail and no claimed comparison. Third, a current public legacy/
unclassified target, or one whose required basis/profile/source evidence is
missing, incompatible, or unreadable, is **Could not be checked**. Finally, a
remaining current public **Translated** target has compatible evidence and is
**Current** when input identity matches or **Out of date** when it differs. The
first match wins, so `ordinary_total` equals the sum of **Current**, **Out of
date**, **No public translation**, and **Could not be checked** without overlap.

**D67-R5 — successor-only review.** Editing or confirming unchanged target copy
creates an immutable target successor review/revision and compatible generation
pinned to the exact current source input, even when rendered bytes are unchanged.
It follows the target content owner's ordinary publication policy. Historical
bases and generations never mutate or receive sidecar current evidence. Confirm
is offered only with complete exact source-comparison read plus target-review
authority; otherwise the comparison/action is absent and an existing permission-
safe handoff appears. Source-only, target-only, and combined races receive cause-
specific copy and preserve work.

**D67-R6 — rare source-owned disposition.** Only a registered safety-governed
source successor requires one unselected source-owned choice to continue prior
translation-dependent public use or revoke the exact server-derived prior
dependency set. The choice judges source use, not translation quality, and adds
no generic reason, approval, queue, task, or policy engine. The same registered
owner may invoke its existing explicit adverse-only revocation command without a
successor or keep-public choice when containment cannot wait; it uses the same
typed reason, server-derived closure, authorization, receipt, and recovery.
Every safety-governed unpublish, retire, tombstone, or delete intent must likewise
resolve prior public use or complete adverse fencing. Referenced evidence cannot
be hard-deleted.

**D67-R7 — owner boundaries.** Source owners retain truth and revocation;
translation owners retain target review; Phase 12 retains authorization; Public
Site Generation retains serving. Giving, payment, messaging, privacy, security,
and operational owners are never mutated or overruled by a locale/freshness
command.

**D67-R8 — compiler-owned adverse closure.** An adverse source disposition uses
exact generation dependencies to derive the smallest complete resource, finite
code-owned public dependency family, or universal-locale closure. The family is
not a Phase 12 authorization capability or Tenant-configurable taxonomy. Callers
cannot submit scope/members.
Incomplete, stale, ambiguous, or cross-scope closure remains adverse at the
registered containing scope and reconciles the same command.
The receipt truthfully exposes applying, fence-before-head blocked, converged,
unknown/do-not-repeat, and proved-no-effect states; only proved no effect says
**Couldn't publish—nothing changed**. Public presentation is typed: concealed
404, gone 410, and transient/unknown `no-store` 503. A bounded `Retry-After` is
included only when the owning source/runtime proves a truthful interval;
otherwise it is omitted. Soft 200 and cross-locale recovery are forbidden.

**D67-R9 — publication authority correction.** `sites.publish_locales` governs
first locale activation, whole-locale withdrawal/restoration, and locale-wide
contract transitions. Later resource publications follow the Tenant's
source-owned manual, automatic, or scheduled policy and add no second locale
approval; every transition re-proves locale admission, source authority,
expected heads, and safety.

**D67-R10 — structural and privileged-path safety.** Current deployments isolate
environment at the Supabase project/database boundary. Within that database,
immutable bases, reviews, dispositions, dependencies, receipts, and audits use
exact Tenant/Site/resource/locale structure; trusted command, cache, and audit
context also pins the environment. A future shared multi-environment database
must first add a non-null environment discriminator to Site and every dependent
key/FK atomically. Relations use restrictive deletion, positive revisions,
checked digests, `timestamptz`, and purpose indexes. The provenance sum/
cardinality and distinct-locale constraints are database/owner-contract
enforced. Phase 12 commands own mutations. Applicable
operational relations enable/FORCE RLS; old-row `USING` and new-row `WITH CHECK`
prevent scope transformation; views are security-invoker; security-definer
functions use empty search path, qualified objects, and minimum execute grants.
Direct DML from `anon`, `authenticated`, service/secret-role application paths,
Payload bypass, generic workers, AI, and caller fields is revoked. Actor, scope,
effective time, and audit attribution derive from trusted server/database
context. Payload hooks use exact scope/`overrideAccess:false`; public reads use
`fallbackLocale:false`. Per-operation grants/policy/direct-DML poison tests are
mandatory.

**D67-R11 — concurrency and semantic idempotency.** Commands bind exact source/
target/generation heads, affected-set digest, contract versions, authorization
epoch, safety, and request meaning. Identical replay returns one receipt;
different meaning conflicts. Publication/revocation produces one complete safe
old-or-new outcome; late events cannot affect another revision/generation.

**D67-R12 — bounded derived projection.** Staff status/counts are permission-
filtered, rebuildable, indexed, keyset-paginated projections that carry evaluated
source/target-head watermarks. **Current**, zero exceptions, and complete counts
render only when the watermark covers current authoritative heads; lag moves from
temporary **Checking** to **Status unavailable**/**Could not be checked**. The
complete hidden closure remains sealed in commands/receipts, while UI labels/
counts require complete viewer authorization. Projection failure/lag never
changes ordinary public output or delays safety containment. A complete permitted
ordinary population must satisfy D67-R4's exhaustive four-bucket conservation
invariant; Independent detail remains explicit even though its no-follow-up
display bucket is **Current**.

**D67-R13 — Vercel/Next safety.** Ordinary freshness causes no Vercel write. A
revocation uses D66's compact generation-level deny gate, authoritative-head
recheck, and scoped generation/cache invalidation. Edge Config/cache/tag state
never grants serving, stores per-resource truth, calls the Domains API, or
requires deployment.

**D67-R14 — proof-only migration and forward recovery.** Migration never infers
source basis or revocation. Readers, constraints, grants, fences, decoders, and
reconciliation precede writers; shadow evidence precedes cohort activation.
Rollback stops new writers but never ignores committed adverse history or
restores an old unsafe head; recovery uses safe successors.

**D67-R15 — bounded non-goals.** D67 creates no machine translation, translation
memory/vendor, semantic AI authority, field fallback, public fallback, central
risk tier, generic workflow, timer, deadline, task, reminder, email, quality
score, percentage, locale matrix, publication-all action, or new notification.

**D67-R16 — Core-native accessible UX.** Use one compact exception list, existing
Web Studio editor/version seam, permission-gated on-demand comparison/no-edit
confirmation, and rare source-owned consequence review. The safety fieldset uses
literal prior-meaning/automatic-restoration hints and closure-specific or non-
enumerating final actions. Base Maia/Base UI, localized pluralization, exact
locale labels, semantic controls, non-color diff, 24×24 CSS-pixel minimum target
or spacing exception, 44×44 primary target, keyboard/screen reader/forced-colors/
reduced-motion, 320px/400%/RTL/CJK, weak-network, and no-JS public proof are gates.
Progress/success is polite status; blocking conflict receives focus-linked error/
one alert; badges do not repeatedly announce. Staff JavaScript/network failure is
truthful and preserves work.

## Falsifiable acceptance criteria

1. **AC1:** An authoritative translation-affecting source publication changes a
   linked target to **Out of date** while public target bytes, URL, language,
   canonical, reciprocal alternatives, Navigation, search, and sitemap remain
   unchanged and no visitor warning appears.
2. **AC2:** A source draft, autosave, rejected/future candidate, nontranslation
   metadata change, task, timer, or cache event changes no freshness.
3. **AC3:** The provenance sum enforces exactly one basis for **Translated**, no
   basis/source comparison for **Independently authored**, and no basis plus
   **Could not be checked** for **Legacy · source unclassified**; invalid
   cardinality, equal source/target locale, and cross-scope basis are rejected.
4. **AC4:** Returning the source translation-input identity under the same or an
   explicitly compatible profile/version to the reviewed digest derives
   **Current** without rewriting target history; equal bare digests across an
   unproved profile transition yield **Could not be checked**.
5. **AC5:** Confirming unchanged translation creates a new immutable target
   successor review/revision, basis, and compatible generation even when bytes
   are unchanged; if source changes during review, the command conflicts,
   preserves draft/public output, and names the next step.
6. **AC6:** Publishing an edited target without a current reviewed basis cannot
   falsely claim **Current**.
7. **AC7:** A registered safety-governed source successor cannot publish without
   one valid source-owned disposition; ordinary source publication never sees
   the question. The same source's explicit adverse-only command can contain an
   exact unsafe predecessor immediately without waiting for replacement copy;
   unpublish/retire/tombstone/delete cannot bypass disposition/fencing or hard-
   delete referenced evidence.
8. **AC8:** **Keep reviewed translations public** records source evidence but
   makes no translation-quality claim and does not clear **Out of date**.
9. **AC9:** An adverse disposition versus concurrent target review/publication
   either includes the committed target in its exact closure or prevents the
   target from using the revoked dependency; revoked favorable serving never
   wins.
10. **AC10:** Same-meaning duplicate/lost-response retry returns one receipt;
    changed source/head/set/meaning conflicts; late events cannot fence or clear
    a successor revision.
11. **AC11:** Resource revocation creates a successor generation omitting only
    the complete resource closure; universal-frame revocation may deny the
    locale. No per-Page Edge Config key becomes authority.
12. **AC12:** Cross-Tenant/Site/environment/resource/locale basis, diff,
    disposition, count, cache, and direct route probes reveal no existence and
    cause no write/public effect across browser and privileged paths; mixed
    visible/hidden closures seal every member but expose only independently
    complete authorized labels/counts and never block containment for detail
    permission.
13. **AC13:** An already-public locale's ordinary manual, automatic, and
    scheduled source publications do not require `sites.publish_locales`; first
    activation and whole-locale lifecycle still do.
14. **AC14:** Projection lag/outage whose watermark does not cover current source/
    target heads shows Checking then unknown/unavailable—never Current, zero, or
    complete—keeps ordinary public output, and never delays adverse containment.
15. **AC15:** Public adverse output is tenant-brand-native and privacy-safe:
    concealment is 404, gone is 410, and transient/unknown is `no-store` 503.
    Known truthful retry intervals include a bounded `Retry-After`; unknown
    intervals omit it. Soft 200, cross-locale substitution/link, unsafe same-
    locale home/contact action, and source-reason exposure are absent.
16. **AC16:** Complete keyboard, screen-reader, 24×24/44×44 target, forced-colors,
    reduced-motion, 320 CSS pixel, 400% zoom, RTL/CJK, long-label, weak-network,
    no-JS public, staff-JS failure, permission-loss, polite progress, and focused
    blocking-conflict journeys pass.
17. **AC17:** Diff and **Confirm translation is still current** appear only when
    the actor can read the complete exact comparison and authorize target review;
    every partial/denied case is non-enumerating and offers the existing permitted
    handoff with no task.
18. **AC18:** Source-only, target-only, and combined/indeterminate review races
    preserve work and current public output and render the matching cause-specific
    next-step copy.
19. **AC19:** The safety fieldset is initially unselected, uses the exact legend/
    hints, and derives a resource-count, public-dependency-family,
    locale-offline, or count-free
    final action from independently viewable complete closure—not hidden members.
20. **AC20:** Safety publication progresses through receipt-backed applying,
    fence-before-head blocked, converged, unknown/do-not-repeat, and proved-no-
    effect states; refresh/retry never creates a second business effect, and only
    proved no effect renders **Couldn't publish—nothing changed**.
21. **AC21:** Every projected favorable row/count proves a watermark covering the
    current source and target heads at read; late/reordered projection events
    cannot replace a newer evaluation.
22. **AC22:** Per-operation RLS/grant/function/view tests cover insert/select/
    update/delete, old/new scope transformation, table owner, `anon`,
    authenticated, service/secret path, Payload bypass, generic worker, and
    command-only success with trusted actor/time/scope.
23. **AC23:** Translation counts say **translation(s)** with locale-aware
    pluralization, every generated locale label is complete, and long/CJK/RTL
    strings preserve meaning and action hierarchy.
24. **AC24:** Task-based release evidence covers ordinary/no-edit review, three
    race forms, keep/revoke, restricted closure, mobile, and assistive technology.
    Zero critical misunderstandings are allowed about (a) whether **Out of date**
    remains public and (b) whether **Keep public** certifies translation quality;
    cohort, task, result, remediation, and retest evidence are retained.
25. **AC25:** For one complete permitted ordinary-resource population at one
    current watermark, the ordered D67-R4 function classifies every resource
    exactly once and `ordinary_total` equals the sum of **Current**, **Out of
    date**, **No public translation**, and **Could not be checked**. The proof
    includes: no target revision; a private ordinary draft; a private legacy/
    unclassified draft; a
    permission-hidden draft; a current public Independently authored target; a
    current public legacy/unclassified target; and matching, mismatching, missing,
    incompatible, and unreadable evidence for a current public Translated target.
    Authorized detail says **Not started** or **Draft exists** only where safe;
    nothing is dropped, double-counted, or disclosed through bucket membership.

## Required monitors

| Signal                                               |                                                                                                                                            Threshold | Owner                             | Required response                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------: | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `translation_basis_cross_scope_accept_total`         |                                                                                                                                                  Any | Security + CMS Localization       | P0 stop writers/reads, contain exposure, audit affected bases/generations, repair structure, rerun poison suite.               |
| `translation_freshness_false_current_total`          |                                                                                                                                                  Any | CMS Localization + Content Health | Suppress favorable freshness, show incomplete, rebuild from exact heads/bases, correct affected evidence.                      |
| `source_public_use_disposition_missing_total`        | Any registered safety-governed publish/unpublish/retire/tombstone/delete transition without required continue disposition or completed adverse fence | Source owner + Site Platform      | Block favorable/source transition or keep adverse containment; restore the source-owned review/adapter and investigate bypass. |
| `revoked_translation_dependency_served_total`        |                                                                                                                                                  Any | Security + Site Runtime           | P0 apply containing adverse fence, stop affected writers, reconcile exact closure/head/cache, preserve evidence.               |
| `translation_adverse_transition_pending_age_seconds` |                                                                                                                       >60 s warning; >300 s incident | Site Operations                   | Keep admission adverse; reconcile the same receipt/head/outbox forward; never create a replacement command.                    |
| `translation_freshness_projection_lag_seconds`       |                                                                                                       >15 min for 2 checks warning; >60 min incident | Content Health                    | Show evidence incomplete, repair/replay projector, run bounded reconciliation; public output remains unchanged.                |
| `translation_publication_extra_locale_gate_total`    |                                            Any ordinary authorized post-activation resource release blocked only for missing `sites.publish_locales` | CMS Product + IAM                 | Treat as policy regression, restore source publication boundary, audit affected scheduled/automatic releases.                  |
| `translation_revocation_per_resource_edge_key_total` |                                                                                                                                                  Any | Site Platform + SRE               | Stop rollout; remove per-resource Edge Config authority and restore generation-only adverse admission.                         |

The two elapsed thresholds are product alert budgets selected for D67 safety and
staff truth, not claimed Supabase/Vercel limits. Release evidence must prove them
under kill-point and production-shaped load tests; if measured architecture
cannot meet them, the OpenSpec must revise the budget and user-facing degraded
state explicitly before activation rather than silently weakening the alert.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved in this documentation set:

1. Name explicit Translation Basis/Freshness/Source public-use disposition.
2. Separate ordinary editorial drift from authoritative safety revocation.
3. Correct D66's every-generation human-gate conflict.
4. Clarify that D66 defines a minimal generation contract without accepting the
   broader unmerged Phase 23 proposal.
5. Specify one compact staff UX and no donor-facing stale treatment.

### Must enter the consolidated Phase 24 OpenSpec/design before ticketing

1. D67-R1–R16 and AC1–AC25, including the D66/Phase 12 authority correction.
2. Exact real source-owner inventory and typed adapter contracts; no speculative
   owner or generic source table.
3. Translation-input canonicalization/profile ownership, digest algorithm/version
   qualification, exact cross-store references, and deletion/retention rules.
4. Generation dependency/reverse-closure proof, fence/head order, business
   receipts, outbox/reconciliation, lock order, and mixed-version behavior.
5. Exact staff/public copy, visibility rules, Base Maia component contract,
   accessibility, mobile, low-bandwidth, and no-JS behavior.
6. Expand/backfill/shadow/cutover/kill/forward-recovery migration plan and every
   named monitor/runbook.

### Required implementation safeguards

1. Land readers, constraints, grants/RLS/access hooks, adverse admission, and
   compatible decoders before any D67 writer.
2. Prove one ordinary Page tracer and one real safety-governed source tracer end
   to end before adding another owner.
3. Reuse the sole public reader, source publication, Public Site Generation,
   Content Health, Phase 12, audit/outbox, and Web Studio seams; reject a second
   head/editor/workflow.
4. Shadow-reconcile exact source/target evidence and reverse closure before one
   cohort is enabled; never infer legacy lineage.
5. Pass production-shaped security, concurrency, failure, cache, accessibility,
   usability, and load proof before release.

### Monitor after release

Only the eight signals in the preceding table are assigned to monitoring. Each
has a threshold, owner, and mandatory response; no unnamed “watch this later”
risk remains.

## Final disposition

**Accept with required amendments.** The two-lane direction is correct and
modern. The accepted permanent decision is ADR-0188 plus D67-R1–R16—not a mutable
`stale` flag, central critical-content classifier, every-edit prompt, or broad
translation workflow.
