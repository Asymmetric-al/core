# Phase 23 D10 Site Presentation Activation Cohort — Decision Brief and Research Evidence

- **Status:** Founder-ratified C-prime-amended-and-hardened (C-prime-R) for
  Phase 23 D10 on 2026-08-21.
- **Date:** 2026-08-21
- **Authority:** Research and decision support only. This document does not
  authorize implementation, schema work, migration, provider adoption, issue
  publication, deployment, release activation, or a production change.

## Decision seam

Phase 23 D9 ratifies one Site-scoped Presentation Profile Version and certified
custom Presentation Packages, while D1 currently gives each exact Tenant ×
environment × Site × BCP-47 locale its own immutable Public Site Generation and
one small serving head. The next founder decision is therefore:

> When one Site has several public languages, how does one approved website
> design change become public everywhere coherently without publishing
> unrelated locale drafts or creating a second public-serving authority?

This is a narrow activation-coherence decision. It does not reopen D9's
creative freedom, package certification, semantic-content boundaries, or
tenant authoring controls.

## Boundaries already settled

D10 must preserve all of the following:

- D1 is the sole ordinary public-serving authority. Each locale head selects
  one complete immutable Public Site Generation; the public runtime does not
  compose mutable `latest` records.
- D1 ordinary Page publication is locale-local and explicitly excludes a
  tenant-global lock, a giant Site rewrite, and a distributed cache/search
  transaction.
- D9's Site Presentation Profile Version is Site-scoped, not independently
  customized per Page or locale. D9 permits no mutable package pointer, second
  public truth, tenant-uploaded runtime code, or package-owned content silo.
- Phase 22's specialized Missionary Ministry and Project/Campaign Page family
  profiles remain consistent across every Page and locale in their family.
- Phase 24 owns Site and locale enablement, fallback, domain, and complete
  appearance-management truth. D10 cannot make an unpublished locale public.
- Appearance activation must select each locale's currently public content.
  It must not publish, reject, overwrite, translate, or otherwise mutate an
  unrelated Page, Navigation, or translation draft.
- Cache, CDN, search, sitemap, crawler, and in-flight-request convergence remain
  observable downstream facts. A database commit cannot honestly claim that
  every edge and browser changed at the same instant.
- Current Phase 10 safety withdrawal and adverse containment remain
  independently authoritative and are never delayed by an ordinary positive
  design release.

## Canonical vocabulary proposed for this question

| Term                                      | Meaning                                                                                                                                                                | Not the same as                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Public locale cohort**                  | Every locale that currently has a D1 serving head for one exact Tenant × environment × Site.                                                                           | All platform locales, a hand-maintained checklist, or a translation draft list.                       |
| **Enabled non-public locale disposition** | A complete proof-only disposition for a Phase-24-enabled locale that has no public D1 head yet.                                                                        | Publishing that locale or inventing empty content.                                                    |
| **Site Presentation Activation Manifest** | One immutable, content-addressed preparation record binding the expected head vector, candidate successor generations, exact D9 package/profile/artifacts, and proofs. | A serving head, mutable readiness flag, workflow engine, or distributed transaction.                  |
| **Head-vector CAS**                       | One short database transaction that conditionally advances every exact public-locale head only if every expected current head still matches.                           | A tenant-global lock, row-by-row eventual rollout, public theme pointer, or Page-content transaction. |

The staff UI should normally say **Website design**, **Preview all languages**,
and **Publish website design**. It should not expose vector, CAS, manifest, or
transaction terminology.

## Concrete staff scenario

Hope Harbor Missions publicly serves `en-US`, `es-MX`, and `ar`. Nina approves
a new brand-specific Presentation Package and Site Presentation Profile.

- English and Spanish pass the actual-content preview.
- Arabic exposes a missing font glyph and an RTL navigation defect.
- Spanish also has an unrelated unpublished About-page translation draft.
- While Nina reviews the repaired candidate, another staff member publishes a
  French Page on a newly public `fr-CA` locale.

The intended product behavior should be unambiguous:

1. Nina sees one **Website design** review, with locale tabs and one exception
   for Arabic—not three separate publish chores.
2. The Spanish draft remains private and is neither published nor treated as a
   blocker; the candidate uses the current Spanish public generation.
3. The Arabic defect blocks the design release from every public locale. The
   existing Site remains public unchanged.
4. After Arabic is repaired, the new `fr-CA` head makes the old preparation
   stale. Activation advances nothing, explains that the Site changed during
   review, and refreshes the exact cohort.
5. A successful retry advances every currently public locale to a successor
   generation pinned to the same exact Site Presentation Profile Version.
6. Enabled locales with no public content prove renderer, font, direction, and
   package compatibility but do not acquire a serving head or become public.

## Current repository and predecessor evidence

- ADR-0145 and D1 define one immutable Public Site Generation and one CAS head
  per exact locale. They correctly reject a cross-locale transaction for an
  ordinary Page publish, but did not yet decide the inherently Site-scoped D9
  appearance seam.
- ADR-0153 and D9 make the Presentation Profile Site-scoped, require the exact
  package/profile/artifact/code generation to be pinned by D1, and explicitly
  reject a second release authority.
- D9's remaining-grooming section names this exact question rather than hiding
  it behind implementation.
- The current codebase has no accepted Site Presentation Profile or coherent
  locale activation mechanism. Payload draft, localization, and version
  primitives therefore cannot be mistaken for the answer.

## Current official external evidence

### Mature commerce products use one public appearance with private preview

Shopify permits several draft themes but only one published theme at a time.
Its preview can be switched by country or language, and switching themes does
not change products, collections, menus, Pages, or blog posts because those
records are managed separately. Its market customization model also keeps
global colors, typography, and templates common rather than treating each
locale or market as a different global theme.

- [Shopify publishing themes](https://help.shopify.com/en/manual/online-store/themes/managing-themes/publishing-themes)
- [Shopify adding and previewing themes](https://help.shopify.com/en/manual/online-store/themes/adding-themes)
- [Shopify market theme customizations](https://help.shopify.com/en/manual/markets/customizations/online-store)

This supports one staff-visible Site design action, locale-selectable preview,
and strict separation between design activation and content publication. It
does not by itself provide Asym's exact multi-locale authority contract.

### CMS release tools support complete preparation and validation

Contentful Releases validate a bounded set before publication; if any included
entity has an error, the whole release is not published. Sanity Content
Releases similarly group versions for preview, validation, and coordinated
publication. These products support the prepare-review-validate-release shape,
but Asym should not inherit their provider-specific entity semantics or claim
their operational timing.

- [Contentful Releases API](https://www.contentful.com/developers/docs/references/content-management-api/releases/)
- [Contentful release validation](https://www.contentful.com/help/launch/create-manage-release/setting-up-a-release/)
- [Sanity Content Releases](https://www.sanity.io/docs/studio/content-releases)

### Payload separates authoring primitives but does not solve this release

Payload Versions and Drafts preserve history, preview, and unpublished work.
Payload Localization is field-level and can independently localize draft
status. Those are useful authoring mechanisms. They do not define a
Tenant-and-Site-exact public cohort, an all-or-none locale-head activation, or
Asym's compiled serving authority.

- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Localization](https://payloadcms.com/docs/configuration/localization)

Payload's Local API also defaults to privileged server behavior. Any call made
on behalf of a user must deliberately set `overrideAccess: false`; Payload
document access, locks, drafts, and hooks remain adapter mechanisms rather than
the authority to advance D1 serving heads.

- [Payload Local API](https://payloadcms.com/docs/local-api/overview)

### PostgreSQL can make the bounded authority change genuinely all-or-none

PostgreSQL transactions make several steps one all-or-nothing operation and
hide intermediate states from concurrent transactions. Conditional `UPDATE`
and `RETURNING` allow the implementation to prove exactly which expected head
rows were advanced. This is suitable only because the transaction touches the
small public-locale head cohort after every expensive generation and artifact
has already been prepared.

PostgreSQL also warns that multi-row locking can deadlock and recommends a
consistent acquisition order. Serializable transactions can abort on a
serialization failure and must be retried from the beginning. D10 therefore
requires deterministic row order, short lock and statement budgets, and fresh
reproof before any bounded retry—not a long transaction or blind loop.

- [PostgreSQL transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL `UPDATE`](https://www.postgresql.org/docs/current/sql-update.html)
- [PostgreSQL explicit locking and deadlocks](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

### Supabase security must protect the authority path independently

Supabase's current guidance requires RLS on exposed-schema tables, explicit
grants, operation-specific policies, and tests. It recommends `security
invoker` functions; a necessary `security definer` function needs an empty
`search_path`, fully qualified relations, and revoked default execution. D10's
head mutation must therefore be a server-owned command against private or
strictly protected relations. A browser must never be able to invoke the raw
head update, and a zero-row RLS result must never be mistaken for success.

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions and privileges](https://supabase.com/docs/guides/database/functions)

### Deployment safety is related but separately authoritative

Vercel Skew Protection keeps framework-managed client, asset, navigation, and
server requests on a compatible deployment version. It does not replace D1's
database authority. Vercel Rolling Releases intentionally split visitors
between old and new deployments, so they are not the presentation-coherence
mechanism for this decision. Vercel also warns that deployment rollback does
not reverse external database or CMS state.

- [Vercel Skew Protection](https://vercel.com/docs/skew-protection)
- [Vercel Rolling Releases](https://vercel.com/docs/rolling-releases)
- [Vercel Instant Rollback](https://vercel.com/docs/instant-rollback)

Skew Protection pins framework-managed assets, navigation, and actions to a
deployment but does not automatically pin custom client `fetch()` calls.
Rolling Releases deliberately serve old and new deployments at once. D10 must
therefore prove that every deployment still able to receive production traffic
can render both the current and candidate generations; it must not coordinate
Vercel aliasing, rollout stages, or rollback inside the database transaction.

### Current CMS UX favors Site-wide preview without content side effects

WordPress Global Styles apply across the Site and provide live preview and
revisions; Shopify keeps one published theme while retaining drafts. These
patterns support one consequence-led **Publish website design** action. They do
not justify hidden Page-specific presentation overrides or coupling the action
to content publication.

- [WordPress Styles overview](https://wordpress.org/documentation/article/styles-overview/)
- [WordPress Site Editor](https://wordpress.org/documentation/article/site-editor/)
- [Shopify publishing themes](https://help.shopify.com/en/manual/online-store/themes/managing-themes/publishing-themes)

## Options

### Option A — Locale-by-locale appearance adoption

Each locale receives a normal independent D1 successor and staff may publish
the new design one locale at a time.

**Benefits**

- Requires no precision amendment to D1's current single-locale activation.
- One locale defect does not delay an appearance change elsewhere.
- Smallest individual database transaction.

**Costs and risks**

- One Site can remain on different brand presentations by language for hours,
  days, or indefinitely.
- Staff must repeat a Site-wide design action and can forget a low-traffic
  locale.
- A visitor switching language can encounter a deliberately mixed Site, not
  merely normal cache convergence.
- It contradicts D9's Site-scoped profile and Phase 22's cross-locale family
  consistency unless the product weakens those promises.

**Assessment:** technically simple but product-incoherent. Not recommended.

### Option B — One runtime Site Presentation head

Create one Site-wide public pointer to the active Presentation Profile or
package. Locale generations continue selecting content while runtime rendering
combines each locale head with the global presentation head.

**Benefits**

- One small pointer switch changes the default design for every locale.
- A locale defect can be evaluated without preparing successor content
  generations.
- The staff mental model appears simple at first.

**Costs and risks**

- It creates the second public truth and runtime indirection that D9 explicitly
  rejected.
- A retained immutable locale generation can render differently later because
  its presentation is no longer fully pinned.
- Cache identity, preview identity, rollback, history, and incident diagnosis
  become combinations of two advancing heads.
- It reopens D1 and D9 immediately and creates lasting hidden coupling.

**Assessment:** operationally tempting but architecturally unsound under the
ratified contract. Not recommended.

### Option C-prime — Complete-cohort, all-or-none D1 Site Presentation activation — Recommended

Prepare one immutable successor D1 Public Site Generation for every currently
serving locale using that locale's current public content and the same exact D9
Presentation Package, Site Presentation Profile Version, artifact digest, and
code/schema generation. Prove compatibility for the complete enabled-locale
census. Then use one short database transaction to conditionally advance the
exact vector of existing locale serving-head rows. If any expected head is
missing, stale, incompatible, or fails to advance, the transaction commits
nothing.

This option requires one explicit narrow precision amendment to D1: an
inherently Site-scoped appearance activation may coordinate only the already
prepared serving-head rows for the exact Site's currently public locales.
Ordinary Page and locale content publication remains single-locale and no
cross-locale editing, giant release document, tenant-global lock, second public
head, or distributed transaction is introduced.

**Benefits**

- Staff receive one truthful **Publish website design** action.
- All authoritative locale heads select the same presentation version after
  one atomic commit.
- Unrelated drafts remain private because each candidate structurally reuses
  the current public locale generation rather than Payload `latest`.
- D1 generations remain complete, historically reproducible serving closures.
- A stale concurrent locale publish fails the whole small activation visibly
  and safely instead of producing a partial rollout.

**Costs and controls**

- One broken supported locale blocks an ordinary positive appearance release.
  The UI must identify the exact cause and owner, while Phase 10 adverse safety
  actions retain their independent immediate path.
- The short transaction locks several head rows. Preparation must happen
  beforehand, cohort size must be bounded, rows must be updated in deterministic
  order, and serialization/CAS losers must reprepare rather than blind-retry.
- CDN and browser caches can temporarily serve complete old responses after the
  authoritative commit. Generation-specific immutable asset URLs, one-time
  request pinning, Skew Protection where applicable, and downstream convergence
  telemetry prevent mixed responses without claiming instantaneous global
  visibility.

## Recommended staff UX

For a single-locale Site, show no locale machinery. For a multilingual Site:

1. **Website design** opens one actual-Site preview, not a database workflow.
2. A locale selector shows each currently public language plus enabled
   non-public languages. Desktop, mobile, and reduced-motion views use the same
   candidate renderer as production.
3. The consequence statement says: **This design will apply to all 4 published
   languages. Page content, translations, and URLs will not change.**
4. Healthy languages stay quiet. One exception panel lists only actionable
   blockers such as **Arabic — navigation does not fit at 200% zoom** with a
   cause owner and direct repair route.
5. The sole activation action is **Publish website design**. There is no
   per-locale checklist or partial-apply escape hatch.
6. A stale cohort says: **Nothing changed publicly. French was published while
   you were reviewing. Refresh the preview.**
7. Recovery says **Restore previous website design**, but creates and proves a
   new complete successor rather than rewinding mutable history.

## Selected-option hardening contract

### The smallest durable authority model

D10 adds no Site-global presentation head and no second public truth. It needs
only:

1. the existing immutable D1 Public Site Generations and locale serving heads;
2. one immutable, content-addressed **Site Presentation Activation Manifest**
   with normalized, uniquely constrained locale membership and containing
   references and digests rather than Page bodies;
3. one small Site-scoped, source-owned **public-locale census fence** whose
   monotonic revision changes whenever a locale head is first created, retired,
   or its serving membership changes; and
4. one immutable activation receipt plus downstream-convergence intent written
   with the head change.

The fence is coordination, not a serving pointer, workflow state, or mutable
readiness truth. Phase 24 remains authoritative for enabled locales; D1 heads
remain authoritative for what is public. A successful Site with public locales
derives its active presentation from the exact profile common to those heads.
If there are no public locales, approving a profile remains inert authoring
truth: D10 cannot launch a Site or create a serving head.

Every authoritative locale head for the Site must live on one PostgreSQL
primary. If future database sharding breaks that precondition, this contract
must be redesigned; D10 does not introduce two-phase commit.

### Private preparation before the lock boundary

Preparation is resumable, bounded-concurrency, and non-authoritative. It:

- freezes the exact Tenant × environment × Site, Phase-24 enabled-locale census
  revision, ordered public-locale head vector, and proof-only disposition for
  every enabled locale without a public head;
- builds exactly one immutable successor generation per public locale from that
  locale's exact current-serving generation, never Payload `latest`, a draft,
  or locale fallback masquerading as translated content;
- structurally reuses unchanged Page, Navigation, route, SEO, designation,
  source-attribution, Phase-22 specialized Page, and source-owned dynamic
  revisions while changing only the pinned D9 Presentation Package, Site
  Presentation Profile, qualified artifacts, and compatible renderer closure;
- proves all Page families and enabled locales, including RTL, CJK, long text,
  missing optional media, font coverage, responsive/reflow, reduced motion,
  no-JavaScript meaning, accessibility, give handoff, restricted-publication,
  and failure/degraded behavior; and
- seals the exact expected and successor head sets, package/profile/artifact
  digests, deployment and code/schema compatibility range, permissions and
  revocation inputs, idempotency fingerprint, and proof results in the
  manifest.

An enabled but non-public locale is checked but not published. An unsupported
enabled locale is a cause-owned blocker rather than an invented empty locale or
silent future incompatibility. A Site with one public locale uses the same
contract, but staff see no unnecessary locale UI.

### One short final PostgreSQL transaction

Final activation performs no compiling, rendering, Payload read, HTTP call,
deployment promotion, cache purge, search update, or user wait. One server-owned
command:

1. re-proves current actor, canonical permission, Phase-10 ceiling, D9 package
   admission/revocation, artifact availability, deployment compatibility,
   manifest digest, and idempotency fingerprint;
2. locks the exact Site census fence and mutable proof rows, then the locale
   heads in one documented deterministic order;
3. re-proves exact two-way set equality between the current public cohort and
   the manifest's expected heads;
4. conditionally advances every exact head from its expected generation to its
   sealed successor and verifies the exact `RETURNING` locale/head set—not only
   a row count; and
5. inserts the activation receipt and deduplicated downstream-convergence
   intent before commit.

Any missing, additional, stale, wrong-scope, revoked, incompatible, or failed
row raises an error and rolls back the complete transaction. A deliberately
short lock and statement budget, composite indexes, and canonical lock order
bound contention. `40001` serialization failures and `40P01` deadlocks may
retry the entire transaction with bounded jitter only after fresh reproof. A
changed head/census, permission, package, or manifest is a semantic conflict
that requires re-preparation, not blind retry. On a lost acknowledgement, the
system reads the immutable receipt and active vector before enabling another
attempt; reusing an idempotency key with different inputs is rejected.

This is D10's sole narrow precision amendment to D1's cross-locale prohibition:
only an already-prepared Site-wide presentation change may coordinate the
exact existing locale heads. Ordinary Page, route, Navigation, locale, and
content publication remain single-locale and independently authoritative.

### Tenant and security boundary

Every head, generation, manifest member, profile, package admission, receipt,
and outbox reference carries the complete Tenant × environment × Site scope and
BCP-47 locale where applicable. Composite unique keys and foreign keys prevent
a valid identifier from another scope from satisfying the relationship.
Browser roles receive no direct head DML.

Internal authority relations belong in a non-exposed schema where practical,
with explicit grants, RLS defense-in-depth, and cross-tenant negative tests. A
database function is `security invoker` by default. If a narrowly privileged
executor genuinely requires `security definer`, it lives outside exposed
schemas, has `search_path = ''`, fully qualified relations, a minimal no-login
owner, no dynamic SQL, revoked `PUBLIC`/`anon`/`authenticated` execution, and
an exact trusted caller grant. A service role or caller-supplied actor ID never
substitutes for current canonical authorization. Payload user-scoped operations
use `overrideAccess: false`; Payload is not allowed to advance serving heads.

### Runtime compatibility and honest convergence

Before activation, every deployment capable of receiving production traffic
must prove it can render both the old and candidate generations. An active
Vercel rolling release is allowed only when both base and canary meet that
contract; a forceable 0% canary is not a private proof environment. Skew
Protection remains defense-in-depth and custom fetches require explicit
version handling. The release sequence is expand-compatible runtime first,
D1 activation second, and retirement of old support only after no active
generation or retained client depends on it.

One request pins one locale generation once. HTML/RSC/data and immutable,
content-addressed assets use Tenant-, Site-, locale-, generation-, profile-,
package-, artifact-, and runtime-qualified identity so a response cannot mix
old and new generations. Complete old cached responses may remain visible for
a bounded period after the atomic database commit; cache/CDN/ISR, image, domain,
search, sitemap, crawler, and client observation are separately measured facts.
Vercel deployment rollback does not rewind D1 database authority.

### Staff experience

Staff see a quiet **Website design** workflow, never a manifest, head vector,
CAS, package console, or deployment dashboard:

1. One exact current-public-content preview compares **Current** and **New** and
   offers locale, representative Page-family, desktop/mobile, and reduced-motion
   views. Locale controls navigate proof; they never select a partial rollout.
2. One consequence card names the Site/domain, public-language and public-Page
   counts, what presentation changes, and what cannot change:
   **Page text, translations, drafts, visibility, URLs, navigation destinations,
   SEO copy, designations, giving destinations, and publication dates will not
   change.**
3. Automatic proof covers the complete cohort. Healthy results stay collapsed;
   every hard blocker has a plain cause, exact locale/Page family, accessible
   preview link, owner, and repair action. There is no **Publish anyway** path.
4. One confirmation and one **Publish website design** action replaces locale
   checklists and repeated approvals.
5. Persistent, programmatically announced status distinguishes **Published**
   from **Finishing public delivery checks**. The completed healthy state becomes
   quiet again.

The workflow reflows at 320 CSS pixels/400% zoom, is fully keyboard operable,
uses labeled controls and logical focus, announces status without toast-only or
color-only meaning, supports target sizing and reduced motion, and gives preview
frames/windows accessible names without trapping focus.

- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG 2.2 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI-ARIA Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

### Failure, containment, and recovery

- A stale candidate says: **Nothing changed publicly. A Page or language was
  published while you were reviewing. Refresh the preview.**
- An unknown response says: **We're confirming whether the design published.
  Please don't try again yet.** The system inspects authority before retry.
- A post-commit cache or probe problem says the design is published while
  delivery remains under verification; it does not rewrite heads from a job.
- **Restore previous design** prepares a new complete successor using today's
  public content and translations. It never resurrects old drafts, routes,
  source facts, or permissions and never rewinds history.
- D9 package revocation and Phase-10 safety retain an adverse-first path that
  cannot wait behind ordinary positive-cohort readiness. A pre-qualified safe
  standard/degraded presentation is retained for a new smallest-scope successor
  or deny state; no system claims it can recall already delivered browser code.

## Ruthless adversarial review

Every category has a concern because D10 coordinates a public concurrency
boundary. A concern means the permanent control belongs in the contract, not
that D10 needs a generic enterprise release platform.

| Category                              | Concern? | What could go wrong and why it matters                                                                                                                                                                                                                         | Severity | Likelihood without controls | Permanent fix or prevention                                                                                                                                                                                                                                                               |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Brittleness**                       | **Yes**  | A manual locale list, stale deployment inventory, or assumption that all locales share the same direction, font, or content shape can let an unproved surface break after activation.                                                                          | High     | High                        | Derive and version the source-owned enabled/public census; seal exact expected heads and deployments; use current public content plus minimum/representative/maximum fixtures; reprove the complete scope at cutover.                                                                     |
| **Technical debt**                    | **Yes**  | A Site-global theme pointer, per-locale loop, duplicate app/database CAS logic, or generic release engine would create competing authority and several subtly different release paths.                                                                         | High     | High                        | Keep D1 heads as sole authority; add one manifest, one purpose-specific command, one receipt/outbox seam, and one shared lock/retry protocol. Do not create a second head, super-generation, flag matrix, or provider-specific release model.                                             |
| **Edge cases**                        | **Yes**  | Zero or one public locale, a locale becoming public/retired mid-review, concurrent Page publication, RTL/CJK/font failure, missing media, active canary, revoked package, lost response, or an already-active target can make naive behavior false or partial. | Critical | Medium–high                 | Define typed outcomes for each; zero-public Sites remain inert; single-locale UI stays simple; use census fencing, exact vectors, explicit non-public dispositions, compatibility proof, receipts, and multi-connection race/fault tests.                                                 |
| **Footguns**                          | **Yes**  | Staff could publish drafts or only selected languages; a developer could loop over RPC calls, mutate heads with a service role, compile while locks are held, blindly retry, or assume a Vercel rollback rewinds the database.                                 | Critical | High                        | One design-only consequence/action; current-serving basis; no partial escape hatch or direct client DML; one short database call; no external work in the transaction; inspect-before-retry; forward successor recovery.                                                                  |
| **Tenant safety**                     | **Yes**  | A valid generation/package UUID from another Tenant, environment, Site, or locale—or an incomplete cache key—could cross-bind content or presentation.                                                                                                         | Critical | Medium                      | Full-scope `NOT NULL` composite keys, unique constraints and FKs; exact qualified predicates and returned-set proof; private server command, RLS/grant negatives, tenant-qualified cache/artifact identity, and forged-reference tests.                                                   |
| **Over-engineering**                  | **Yes**  | Two-phase commit, a distributed lock service, tenant-global lock, arbitrary workflow DSL, Site-wide mutable release document, or unlimited cohort would cost more and fail in more ways than this bounded need.                                                | High     | Medium                      | Require one PostgreSQL-primary precondition, one small Site fence, one immutable manifest, and a capacity-tested head-only transaction. Preparation may be chunked; no 2PC, generalized workflow, or external participant enters authority.                                               |
| **UX/UI and user friction**           | **Yes**  | CAS/package terminology, check walls, repeated locale approvals, inaccurate previews, unexplained blockers, indefinite spinners, or a false “live everywhere” message can confuse staff and cause abandonment.                                                 | High     | High                        | Present one actual-content compare preview, plain consequence card, exception-first blocker list, one confirmation/action, persistent accessible status, calm stale/unknown copy, and a quiet healthy state. Automation proves closure; humans approve design intent.                     |
| **Hidden coupling**                   | **Yes**  | Phase-24 locale configuration, D9 packages, D1 heads, Phase-22 Page families, Phase-29 assets, Payload drafts, Vercel deployments, and caches can be accidentally treated as one mutable fact.                                                                 | High     | High                        | Manifest-reference each source owner and exact compatibility generation without copying truth. Explicitly prove every Site-chrome consumer. Keep authoring, package admission, serving authority, deployment availability, and downstream convergence distinct.                           |
| **Failure modes**                     | **Yes**  | Crash before/during/after commit, deadlock, timeout, one stale row, missing artifact, cache-job loss, or delivery-probe failure can otherwise leave a partial or unknowable result.                                                                            | Critical | Medium–high                 | Database rollback for all head changes; receipt read-back for unknown outcomes; transactional downstream intent; safe retained serving generation; bounded transient retry; cause-owned delivery recovery; new immutable successor rather than mutation.                                  |
| **Data integrity risks**              | **Yes**  | Equal row counts can hide duplicate/missing locales; private `latest` content can leak into successors; mixed profile heads or mutable assets make history irreproducible.                                                                                     | Critical | Medium–high                 | Normalized unique candidate membership, two-way set equality, exact expected-head CAS and `RETURNING` set verification, current-serving-only basis, content-addressed immutable inputs, composite FKs, and an immediate post-commit common-profile invariant.                             |
| **Security and privacy risks**        | **Yes**  | A public preview, exposed definer function, permissive grants, stale JWT role, service-role caller assertion, or revoked executable package could bypass Tenant or Phase-10/D9 controls and expose people or code.                                             | Critical | Medium                      | Authenticated non-indexed preview; current actor/capability/safety/revocation reproof; private authority schema; explicit grants/RLS; hardened minimal definer only if necessary; no raw client writes; pre-qualified adverse containment.                                                |
| **Scalability and performance risks** | **Yes**  | Rebuilding every Page synchronously, storing Page bodies in a manifest, opening thousands of previews, or holding locks during rendering will produce queueing, deadlocks, timeouts, and poor admin UX as Sites/locales grow.                                  | High     | Medium                      | Structural reuse; private chunked/resumable preparation with bounded concurrency; digest/reference manifests; lazy representative preview; composite indexes; measured maximum cohort; p95/p99 lock budgets; head-only final transaction.                                                 |
| **Operational burden**                | **Yes**  | Engineers could become necessary for every release if qualification is manual, causes are opaque, or operators must repair SQL and caches by hand.                                                                                                             | High     | Medium–high                 | Reusable automated certification, finite typed causes, exact owner and repair route, automatic inspection/replay, exception-only staff review, one support-visible evidence panel, and no routine per-locale sign-off.                                                                    |
| **Observability gaps**                | **Yes**  | Atomic heads can still coexist with one stale domain/deployment/cache or failing locale renderer; a generic “failed” event cannot show whether authority committed.                                                                                            | High     | High                        | Correlate opaque manifest/activation/generation/deployment IDs; record actor and exact old/new vector; measure lock wait, CAS cause, outbox lag and render failure; probe every public locale/domain/deployment; alert on mixed-profile invariant; log no content or restricted identity. |
| **Dependency and integration risks**  | **Yes**  | Payload publish status, Supabase client defaults, Vercel Skew Protection/Rolling Releases, CDN invalidation, or a CMS hook may be mistaken for D1 authority or an atomic participant.                                                                          | High     | High                        | Keep providers behind adapters and pinned compatibility proof; use one database transaction for authority; enforce Payload access explicitly; treat Vercel/cache/search as delivery facts; qualify every traffic-serving deployment; maintain platform-neutral tests.                     |
| **Migration and upgrade risks**       | **Yes**  | Legacy heads may lack complete scope keys, a retained profile may not render under N-1 code, a later locale may be unsupported, or an old package may disappear before recovery.                                                                               | High     | Medium                      | Audit/backfill duplicates and orphans before validated composite constraints; use expand-contract runtime/schema changes; retain immutable artifacts and compatible readers through skew/retention windows; require first-publication proof for later locales; rehearse forward recovery. |
| **Other development hazards**         | **Yes**  | Two D10 releases, D10 versus ordinary publish/locale change/revocation, nondeterministic lock order, sequence-as-commit proof, clock races, destructive rollback, or weak test seams can fail only under production concurrency.                               | Critical | Medium–high                 | One shared Site-fence and lock-order protocol; expected-head CAS; never infer commit from sequence/time; bounded whole-transaction retry by typed cause; successor-only correction; pgTAP plus genuine multi-connection, disconnect, failover, fault-injection, cache and browser tests.  |

## Required verification matrix

The eventual implementation is not shippable until it proves:

1. zero-, one-, normal-, and measured-maximum-locale cohorts;
2. every candidate set defect: missing, duplicate, extra, wrong-scope, stale,
   incompatible, revoked, or private-source member;
3. two concurrent D10 candidates; D10 racing ordinary locale publication,
   first publication/retirement, Phase-24 locale change, permission revocation,
   package revocation, and Phase-10 containment;
4. an injected exception after the first, middle, and last head update produces
   the complete old vector, never a partial vector;
5. deadlock, serialization failure, lock timeout, disconnect before commit,
   disconnect after commit, and lost response follow the typed retry/read-back
   policy;
6. anonymous, cross-Tenant, unrelated, insufficient, stale, and revoked actors
   cannot read private candidates or mutate authority, while the exact permitted
   actor can;
7. every database snapshot sees the complete old vector or complete new vector;
8. every served response uses one generation closure even while complete old
   cache entries and new entries coexist;
9. base/canary/N-1 deployments, custom fetches, immutable assets, cache replay,
   search/sitemap convergence, missing artifacts, and forward recovery;
10. RTL, CJK, long strings, 320 CSS-pixel/400% reflow, keyboard/focus/status,
    target size, reduced motion, no JavaScript, slow/failed assets, restricted
    public projections, and the exact designation/source/locale/currency give
    handoff; and
11. unrelated Page, Navigation, route, SEO, translation, Phase-22, and source
    drafts remain byte-for-byte/pointer-for-pointer unadvanced by D10.

## Ruthless synthesis and permanent implementation order

1. **Precision-amend D1 before schema design.** State that D10 is the only
   bounded cross-locale exception and that it changes atomic database authority,
   not instantaneous global visibility. Without this, the option contradicts
   D1.
2. **Freeze the minimal relational invariants.** Define the source-owned Site
   census fence, complete composite scope, normalized candidate membership,
   exact set equality, serving-head CAS, immutable receipt, and idempotency
   fingerprint. Do not add a global presentation head.
3. **Secure one command boundary.** Use a user-scoped server command, private
   relations, explicit grants/RLS, final canonical authorization and revocation
   proof, and one database executor. Close every raw Payload/Supabase bypass.
4. **Build preparation as a private compiler.** Start from current-serving
   generations, structurally reuse unchanged content, prove all enabled locales
   and Page families, bind exact artifacts/deployments, and keep work resumable
   and outside locks.
5. **Implement the tiny cutover last.** Lock the census fence and proof rows,
   lock heads in canonical order, update the exact set, write receipt/outbox,
   and commit. Establish measured timeout/cohort budgets from load tests.
6. **Make runtime compatibility and cache coherence explicit.** Ship
   expand-compatible readers first; pin one generation per request; use
   immutable identities; observe old-complete/new-complete convergence without
   mixing or claiming simultaneity.
7. **Give staff one design workflow.** Exact preview, consequence summary,
   exception-only blockers, one action, accessible truthful status, and
   presentation-only forward recovery keep the technical machinery quiet.
8. **Attack the seams before first production activation.** Multi-connection
   races, failover/unknown commits, cross-Tenant attempts, Page-draft
   non-interference, deployment skew, cache failures, accessibility, giving,
   and package revocation must all pass with production-shaped evidence.

This is the clearest permanent path because it makes one Site-wide design
promise true while keeping the implementation finite. The hard part is not a
large workflow engine; it is exact relational proof around a very small
transaction.

## Founder-ratified C-prime-amended-and-hardened formulation

**C-prime-amended-and-hardened (C-prime-R) — one complete-cohort, all-or-none
D1 Site Presentation Activation:** for one exact Tenant × environment × Site,
prepare from the exact current-serving D1 Public Site Generation of every
locale in one source-owned, revision-pinned public-locale census exactly one
immutable successor generation that structurally preserves every current
public Page, translation, Page Placement, route, Navigation membership and
destination, editorial SEO, designation and giving handoff, Phase-22
specialized Page release, and source-owned dynamic fact while selecting the
same exact D9 Presentation Package, Site Presentation Profile Version,
content-addressed assets/artifacts, and compatible code/schema generation.
Bind the ordered expected and successor head sets, complete Tenant/Site/locale
scope, Phase-24 enabled-locale census, proof-only disposition for each enabled
locale without a public head, package/profile/artifact and deployment digests,
actor and capability inputs, revocation and Phase-10 ceiling inputs,
idempotency fingerprint, and production-shaped locale, Page-family,
accessibility, reduced-motion, no-JavaScript, performance, restricted-safety,
and exact give-handoff evidence in one immutable content-addressed Site
Presentation Activation Manifest. Preparation is private, chunked, resumable,
bounded-concurrency, structurally reused, and non-authoritative; an enabled
non-public locale is proved but never published, and a Site with no public
locale gains no public state.

D10 is the sole narrow precision exception to D1's exclusion of cross-locale
transactions: after every traffic-serving runtime proves it can render both
the current and candidate closures, one short idempotent transaction on the
single PostgreSQL primary re-proves and locks the exact Site census fence,
current actor/capability, Phase-10 safety, D9 admission/revocation, artifact and
deployment compatibility, manifest, and expected heads in documented stable
order; proves two-way cohort set equality; CAS-advances every exact existing
locale head to its sealed successor and verifies the exact returned set; and
writes one immutable activation receipt plus deduplicated downstream-
convergence intent—or rolls back all of them. Expensive compilation, Payload
resolution, user interaction, HTTP/provider calls, deployment promotion,
cache/search work, and other external effects never occur while locks are held.
Transient database aborts retry the whole transaction only after bounded fresh
reproof; semantic staleness requires a new manifest; and a timeout or lost
acknowledgement is resolved by receipt/vector read-back before retry.

Staff receive one quiet, accessible **Website design** compare-and-review flow
over exact current public content, with locale/Page-family/device/reduced-motion
preview, one plain consequence card, cause-owned hard blockers, one
confirmation, and one **Publish website design** action. Locale controls inspect
the complete proof but never select a partial rollout; design publication
cannot copy, publish, reset, discard, or otherwise advance any content or
translation draft, route, Page visibility, Navigation destination, SEO copy,
designation, giving destination, locale enablement, or source-owned release.
The interface distinguishes authoritative **Published** from **Finishing public
delivery checks**, handles unknown outcomes by inspection, returns healthy
Sites to a quiet state, and restores an earlier presentation only by preparing
a newly proved complete successor over today's public content.

The PostgreSQL commit makes D1 authority coherent, not every cache or visitor
simultaneously current: one request pins one complete generation closure;
content-addressed assets never mutate; complete old cached responses may remain
briefly while domain, deployment, CDN/ISR/data/image cache, search, sitemap,
crawler, and client convergence are separately observed and repaired. Vercel
Rolling Releases, Skew Protection, deployment rollback, Payload draft/localized
status, cache invalidation, and provider hooks remain subordinate delivery,
authoring, or code facts—never participants in or substitutes for D1 authority.
D9 package revocation and Phase-10 adverse safety remain independently
immediate and may invoke the pre-qualified safe/degraded presentation and a new
smallest-scope successor without waiting for an ordinary positive cohort. This
provides a truthful Site-wide design release without a Site-global presentation
pointer, second serving head, super-generation, distributed transaction,
tenant-global lock, per-locale partial apply, manual locale certification,
mutable readiness flag, runtime `latest`, force-publish path, blind retry,
destructive rollback, mutable asset replacement, hidden draft side effect, or
claim that prepared, activated, deployed, cached, searchable, publicly
verified, and seen by every visitor are the same fact.

## Deliberate non-decisions

D10 does not yet choose the SQL function name, exact table/column names,
specific isolation level beyond the proved locking/CAS semantics, measured
maximum locale count, cache vendor, probe provider, retry timings, or final
visual layout. Those are specification details to be measured and verified;
they cannot weaken the authority, security, UX, recovery, or proof contract
above.

## Internal references

- [D10 decision log](./phase-23-web-studio-cms-decision-log.md#d10--complete-cohort-all-or-none-site-presentation-activation)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [D1 decision log](./phase-23-web-studio-cms-decision-log.md#d1--page-local-composition-bounded-reuse-and-coherent-serving-generations)
- [ADR-0145 — D1 Public Site Generations](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D9 decision log](./phase-23-web-studio-cms-decision-log.md#d9--certified-site-bound-custom-presentation-packages)
- [ADR-0153 — certified custom Presentation Packages](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D9 research and adversarial evidence](./phase-23-d9-site-presentation-profile-and-section-variants-research-evidence.md)

## Ratification

The founder ratified the exact **C-prime-R** formulation above as **Phase 23
D10** on 2026-08-21. The Phase 23 decision log and ADR-0154 carry the binding
authority; this document preserves the supporting research, adversarial review,
and proof requirements. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.
