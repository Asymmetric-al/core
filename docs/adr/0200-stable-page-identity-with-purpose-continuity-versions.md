# ADR-0200: Stable Page identity with owner-attested purpose-continuity versions

**Status:** Accepted with required amendments (Phase 24 D79 — 2026-08-31;
amended by D80)

## Context

Phase 24 D78 allows one different ordinary General Page to continue one exact
historical public address only after the Page owner compares exact public
releases and confirms the same public subject, substantive purpose, and intended
visitor task. D78 deliberately capped that qualification at the reviewed target
release until a later decision established what happens when the stable target
Page changes.

Stable document identity, separation of draft and published content, revision
history, and staff-managed redirects are documented across current CMS products.
Persistent Web identifiers are expected to keep identifying a sufficiently
consistent resource even while its representations evolve. Normal wording,
contact, design, image, accessibility, and canonical-path improvements therefore
must not turn every old link into a migration project. Conversely, neither
stable identity nor a body hash can prove that an About Page still means the
same thing after it is repurposed as a volunteer application Page.

Google and W3C support accurate long-lived mappings and owner-governed URI
consistency. Current Payload, Contentful, Sanity, HubSpot, WordPress, Webflow,
Shopify, and Neon One documentation supports stable identifiers, separate
draft/published state, revision histories, and staff-managed redirects;
Blackbaud is archival corroboration only. Exact immutable Core receipts and the
D79 per-effective-release choice are repository-specific safeguards, not an
external product claim. The sources do not establish an automatic material-
change classifier or mandatory Page-purpose schema. GOV.UK supports recording
and maintaining user need as content governance; the reviewed guidance does not
establish user-need prose or taxonomy as redirect runtime authority.

Core has an additional repository-specific constraint: D78's different-Page
mapping is not an ordinary same-Page slug redirect. It is a trusted historical
address whose public meaning was explicitly qualified. Simply following common
CMS behavior would silently weaken that accepted owner proof. Requiring full
D78 after every release would preserve proof but create repeated work and
approval fatigue. A Page-purpose profile, AI classifier, content diff, or second
workflow would be more complex and less truthful.

Current `develop` still has Tenant-only mutable Payload Page slugs, mutable
`pageType`, drafts/autosave, and latest-published reads. It has no Phase 23
stable Site-owned Page identity, exact locale publication lineage, immutable
Public Site Generation, D76 cutover, D78 relation, or D79 continuity state.
Proposed Phase 23 ADRs remain blocked in PR #1340 and must be reconciled before
implementation. D79 is documentation authority, not current runtime behavior.

## Decision

### Stable Page identity plus one small continuity version

After D76 activates a D78 relation, that relation SHALL pin one current **Page
Purpose Continuity Version** for the target Page and exact locale. The version
is an immutable Page-owner assertion that, for every currently favorable D78
relation pinned to it, a person using that historical address would still find
the same public subject, substantive purpose, and intended visitor task in the
candidate effective Page public release.

The continuity version is intentionally opaque. It stores no tenant-authored
subject, task, purpose statement, category, tag, taxonomy, free-text reason,
body, rendered snapshot, hash, similarity score, materiality threshold,
embedding, or AI result. Its meaning comes from the code-owned D78 criteria and
the exact Page-owner publication receipt. It is not a new Page family, content
model, editorial document, status, workflow, or runtime resolver.

The scope is exact Tenant, environment, Site-owned Page identity, and BCP-47
locale. Page family and Site membership remain governed by the accepted Phase
23 Page model. Audience, Publication Reach, safety, route, binding, canonical
path, publication, and eligibility remain separately owned current facts and
are rechecked independently; D79 does not copy them into continuity state or
make a read model their write authority.

A prepared, not-yet-activated D78 relation may add read-only workspace context,
but it has no favorable continuity head: D78's exact reviewed release remains
the sole ceiling. The first continuity version is created atomically only when
D76 activates that exact relation. A Page that never had such a relation has no
continuity version, field, panel, prompt, query, migration obligation, or changed
publication path. If the last relation later becomes adverse or retired, its
versions/head remain inert immutable history rather than being deleted or
reused; no favorable publication choice is required until a relation is active
again. The sparse model exists only where different-Page historical addresses
create the proven need.

### One explicit choice in the existing Publish review

When an authorized publisher publishes a candidate **effective Page public
release** for a target Page/locale with one or more active D78 predecessors, the
existing D1 Publish consequence review SHALL require one initially unselected
RadioGroup. The effective release identity includes the Page Editorial Revision
and every exact localized, Reusable Section, shared/global, reference, or other
meaning-bearing content dependency selected by D1; placement-only, renderer,
delivery, and presentation-package facts stay with their existing owners.

- **This update keeps what this Page is for** — the public subject,
  substantive purpose, and intended visitor task remain the same; the candidate
  release reuses the current Page Purpose Continuity Version; or
- **This update changes what this Page is for** — the candidate cannot publish
  through this Page identity. D80 continues the exact saved work as a fresh
  independent private Page; it creates or advances no continuity version on
  this Page.

The choice is one semantic input to the existing Page publication command. It
is not a second confirmation dialog, checkbox attestation, task, assignment,
approval, comment, or separate save. Merely selecting it does not publish,
navigate, move focus, or mutate continuity. Draft save, autosave, preview,
version comparison, and abandoned publication have no effect.

WCAG does not require confirmation for each simple document save/edit. D79 does
not claim otherwise: this is one deliberate semantic input only for the sparse
different-Page D78 public-release consequence, never a draft confirmation or
general CMS pattern. Representative ministry usability evidence is required
before activation; mechanical preserve behavior blocks rollout rather than
justifying a preselection or AI substitute.

The choice is required only when the effective meaning-bearing content-
dependency identity/digest changes. A deterministic delivery-only D1 rebuild in
which that exact digest and the continuity head are unchanged may reuse the
pinned version without human input. A changed shared/global/localized/Reusable
Section dependency cannot bypass D79 merely because the Page row is unchanged:
its existing D1 consequence review must obtain the Page-owner result or keep the
affected route adverse pending review. If Phase 23 cannot pin the complete
effective dependency closure, a D78 target may not depend on mutable indirect
content. This is objective dependency-version comparison, not a field-level
semantic classifier; the authorized human judges meaning when the effective
release changes.

The publication receipt records the exact candidate effective-release digest,
expected Page/dependency/public/continuity heads, choice, current continuity
version or required successor, criteria-contract version, actor/capability
epoch, complete affected-relation set digest, public generation, command/
idempotency identity, and time. The actor and scope are derived from trusted
server context rather than caller claims.

### Focused, Core-consistent staff experience

An affected Page shows one compact **Historical addresses** panel in the main
document column immediately after the existing document-state strip. It is not
placed only in the desktop Inspector. Copy reflects one permission-safe state;
it never calls a prepared, stale, adverse, or unknown relation active. The
normal authorized active state is calm information, not an alert:

> **Historical addresses · 3**
>
> Three older web addresses currently lead to this Page. When publishing,
> choose whether the update keeps what this Page is for.
>
> **Review historical addresses**

Other states use **Prepared for domain move**, **Some need review**, **Will show
Page not found**, or **Status unavailable** without claiming current delivery.
The panel appears only when current server evidence says at least one relation
is prepared, active, adverse, needs fresh review, or has unknown status. It
never relies on a caller-maintained `has_historical_addresses` flag. Exact
counts, paths, Page titles, Sites, receipts, and source previews are shown only
where the viewer has the existing aggregate/detail read authority. Otherwise it
says **Historical addresses connected** and **Some details require another
owner** without a hidden count. The complete set/digest remains authoritative
and private for publication even when the UI cannot enumerate it. Restricted
cached detail never flashes before authorization resolves.

The existing Publish review places **Historical addresses** after the Page
release summary and before the final action. Summary-first content shows the
current published Page and exact candidate release, with production-faithful
previews available on demand. It links to the last D78 criteria/basis receipt
and the authorized predecessor list so “what this Page is for” has a legible
baseline without a purpose field or diff engine. It explains the consequence in
plain language, shows an exact count only with aggregate-count authority, and
gives examples:

> Wording, design, contact, staff-name, image, and accessibility improvements
> can keep the same purpose. Changing an About Page into a volunteer signup is
> a different purpose.

When several currently favorable predecessors pin the current version, helper
text states: **Your choice applies to all currently active historical addresses
in this review. Choose “keeps” only if this Page still serves the same public
subject, purpose, and visitor task for all of them.** Prepared, stale, adverse,
unknown, or older-version relations are itemized separately and never carried by
that choice.

The RadioGroup labels above remain visible; neither option is preselected. A
short secondary line explains that the first keeps eligible historical
addresses and the second requires a new Page. The first retains the one
contextual Page Publish action. The second reveals D80's inline **Create new
Page draft** continuation; it cannot publish this Page. Routine continuity-
preserving publication may proceed only after all predecessor and Page heads
pass.

There is no public-purpose field for staff to maintain, no hidden contract
identifier in the form, no per-address repeat question, no **Approve all**, and
no donor-facing migration notice. The one Page-level choice carries currently
favorable relations pinned to that exact version only when the publisher can
review the complete current relation set and universally asserts the D78 test
remains true for every relation. If any one fails or required detail is not
available to the actor, **keeps** is unavailable for the whole cohort under D79.
D80 does not add per-relation retarget/retire preparation: it creates a new
private Page and leaves this Page and every relation unchanged. Fresh favorable
qualification remains one source address at a time under D78; D79 never bulk-
qualifies a relation.

The surface follows Core's PageShell/Base UI/base-maia/Zinc patterns: semantic
heading and RadioGroup, visible focus, minimum 44-pixel targets, textual status,
complete copyable bidi-isolated URLs, 320-CSS-pixel and 400-percent reflow,
forced colors, reduced motion, keyboard and screen-reader operation, long
localization and RTL, weak-network summary-first rendering, durable refresh/
back/resume behavior, duplicate-submit protection, error focus, and one polite
meaningful status announcement. A lost acknowledgement resolves the durable
receipt rather than asking the user to guess or submit again.

### Pre-cutover, post-cutover, and material-change rules

Before D76 activation, D78 remains bound to the exact target public release and
generation that staff compared. Any target release drift makes the prepared
cutover stale and requires the full fixed-pair D78 review again, even if the
target publisher selected **keeps what this Page is for**. D79 cannot weaken
the evidence used to authorize a not-yet-activated Domain move.

After activation:

1. a release choosing **keeps** and pinning the current continuity version may
   continue every otherwise-current D78 relation bound to that version;
2. a candidate selecting **changes** never publishes through this Page and
   never advances its continuity head. D80 may create a fresh independent
   private Page from the exact acknowledged candidate while leaving this Page,
   its current head, and every relation unchanged; the target inherits none;
3. changing back to prior content or restoring an older Page revision does not
   rewind the continuity head or resurrect relations; fresh D78 proof is
   required;
4. another Page identity, Site copy/clone, or locale never inherits the version
   or predecessor authority;
5. unpublish, Trash, deletion, public-audience or Reach incompatibility, safety
   withdrawal, locale disablement, route-owner conflict, or other adverse
   current truth prevents a favorable fresh response regardless of the
   continuity choice; and
6. a later favorable renewal reopens the same fixed source-address/target-Page
   D78 review with current exact evidence and both-Page authority. It adds no
   target search, URL field, general redirect screen, or new workflow.

Scheduled Page publication pins the exact candidate effective meaning-bearing
dependency digest, continuity choice, expected continuity head, affected-
relation digest, and governing policy versions at scheduling. Execution
reauthorizes and revalidates all heads. A scheduled candidate whose current
choice is **changes** cannot publish this Page and becomes **New Page required -
Review again**. D80 never copies or implicitly cancels the appointment; staff
use D13's explicit cancellation before creating the new Page. A stale or unknown
result has no partial public effect.

### Source of truth, data, authorization, and concurrency

The Page owner owns the Page Purpose Continuity Version and the release-level
preserve/change decision. D78 owns each directional historical-address
qualification. Each content owner owns its exact revision; D1 owns the effective
meaning-bearing dependency manifest/digest, immutable Page/public generation
receipt, and compiled route effects. Phase 5 owns public request resolution. Phase 12 owns
capabilities. Payload drafts, UI form state, Content Health, search, analytics,
caches, Vercel, imported redirects, and AI are not write authorities.

The logical model is append-only versions plus one current or inert terminal
head per exact Tenant/environment/Site/Page/locale that has activated D78
history. An active D78 relation references a non-null current target continuity
version. A terminal/inert head and all prior versions remain retained when no
relation is favorable; they are never destructively deleted, reused, or treated
as current authority. Same-scope composite relationships,
restrictive delete behavior, one current head, monotonic predecessor linkage,
unique semantic command identity, and equality-leading indexes make ambiguous
or cross-scope state structurally invalid. Cross-store Page/release evidence is
carried by typed immutable owner references and digests, not a fake foreign key
or copied mutable JSON.

The common Page publish transaction uses expected heads and deterministic lock
order. A preserving release appends its publication receipt with the same
continuity version. There is no purpose-changing publication transaction for
this Page: D80 creates an independent private target through ADR-0201 and leaves
this Page's continuity and complete relation set unchanged. Selection, draft,
or target creation cannot advance the source head or make any old route
favorable to the new meaning. Each authoritative transaction remains short,
set-based, and contains no provider, network, preview, rendering, cache, search,
analytics, or notification call.

Same semantic replay returns the original receipt. Reusing an idempotency key
with a changed release, head, choice, relation-set digest, actor effect, or
policy conflicts. Preserving publication, D80 private handoff, D78 renewal,
scheduled execution, D76 cutover, capability revocation, lease/save, or route
change use exact expected heads and have one winner; losers receive a specific
recoverable conflict. Failure before commit changes nothing. Failure after a
publication commit resumes outbox/projection/cache effects; failure after D80
reconciles its private handoff receipt. Corrections append forward; history is
never rewritten.

Browser/Data API roles cannot directly mutate continuity versions, heads,
publication decisions, D78 relations, route effects, receipts, audit, or outbox.
Applicable tables use least grants and ENABLE plus FORCE RLS where required.
`SELECT` and any admitted `DELETE` use `USING`; `INSERT` uses `WITH CHECK`; any
admitted `UPDATE` uses both, while append-only records expose no direct update or
delete path. Table owners, views, RPCs, `SECURITY DEFINER`, `BYPASSRLS`/
service roles, Payload Local API, workers, imports, schedules, support, repair,
and AI repeat exact Tenant/environment/Site/Page/locale, authority, expected-
head, criteria, and affected-set validation. Privileged functions have least-
privileged owners, schema-qualified names, and an empty pinned `search_path`.

### Public runtime, donor experience, and provider boundary

The public runtime never reads Page Purpose Continuity rows, Page bodies, diffs,
or CMS versions per request. D1 compiles one current owner-qualified direct Page,
direct permanent redirect, or neutral not-found effect into the immutable Public
Site Generation. Phase 5 performs the indexed adverse-first lookup before
content/cache. Clean `GET`/`HEAD` only may use the existing direct final `308`
contract; unsafe methods, query/fragment/source context, Giving, authentication,
forms, APIs, callbacks, files, protected owners, and Phase 22 routes never do.

Visitors and donors see only the tenant-native current Page or D9's platform-
neutral, non-enumerating, no-brand/no-store `404`. There is no Asym/Vercel/provider or
Tenant/Site branding in that adverse envelope, no interstitial, purpose warning,
choice, or extra hop. Current canonical paths are resolved from the stable
target identity, so an eligible same-Page placement change remains direct to the
final destination.

D79 writes no Vercel project, Domain, DNS, TLS, redirect, rewrite, middleware,
deployment, cache-rule, Stripe, bank, currency, gift, ledger, message, or email
state. Vercel remains hosting evidence/execution, never Page-purpose or route
authority. An already cached permanent response outside Core cannot be recalled;
staff copy and operations must not promise otherwise.

### Rollout

D79 cannot activate until accepted Phase 23 stable Site-owned Page identities,
exact locale releases, D1 publication receipts/generations, one adverse-first
Phase 5 reader, D76/D78 relations, and Phase 12 owner ports exist. Roll out
reader and adverse behavior first, then sparse continuity heads, shadow publish
decisions, private UI, and one Tenant cohort. Old writers are fenced from
publishing an affected Page without the new decision; `NULL`, absent input, or
unknown policy never means preserve.

There is no inferred or bulk backfill. The initial continuity version is created
only from a current D78 qualification. Existing unrelated CMS redirects or
same-Page slug history remain outside D79. Mixed-version rollback disables new
purpose-changing publications and returns to the prior safe public generation;
it never rewrites continuity history or re-enables a stale favorable relation.

## Consequences

- Stable Page identity and long-lived visitor continuity remain the default.
- Routine target Page releases require one narrow semantic choice only for the
  rare Pages that carry different-identity predecessor addresses; ordinary
  Pages and drafts remain untouched.
- Material repurposing cannot silently inherit historical trust, and no machine
  pretends to understand prose. D80 continues that work as a fresh private Page
  and never advances this Page's continuity head.
- The model adds one sparse immutable continuity head and one field in existing
  publication receipts, not a Page-purpose CMS, taxonomy, classifier, approval
  workflow, redirect engine, or runtime dependency.
- Human judgment remains fallible and the per-release choice can create fatigue.
  Visible context, plain examples, exact receipts, usability proof, and named
  monitoring are required; AI or hidden inference is not the remedy.
- Several predecessor relations can continue through one Page-level version,
  but each remains an independent D78 fact and any favorable renewal is still
  address-specific.
- Public routing remains deterministic, cached, direct, owner-aware, and
  provider-independent.

## Rejected alternatives and unsafe interpretations

- full D78 requalification after every target release;
- perpetual different-Page continuity based only on stable identity or an
  editable “continuity enabled” flag;
- a mandatory Page-local public-purpose/user-need text field, three separate
  subject/purpose/task fields, purpose taxonomy, Page family per purpose,
  tenant-authored schema, tags, categories, notes, or controlled vocabulary;
- body hashes, changed-field allowlists, word/diff percentages, keyword rules,
  render comparisons, personalization snapshots, analytics, traffic, AI,
  embeddings, LLMs, or similarity scores as semantic authority;
- preselected preserve, implicit preserve from missing/`NULL` input, checkbox
  ceremony, a modal after Publish, per-address repeated radios, bulk fresh
  qualification, or a second approval/workflow/capability;
- coupling runtime validity to retention of Payload/Contentful/Sanity version
  rows or performing Page/body/continuity joins on public requests;
- copying audience, Reach, safety, route, locale, family, or eligibility into
  the continuity contract as mutable shadow truth;
- Page copy/clone inheritance, cross-locale carry, transitive mapping,
  automatic resurrection after restore, or mixed old/new writer fallback;
- Vercel/project redirects, middleware rewrites, arbitrary URLs, external
  targets, chains, wildcard rules, query carry, unsafe-method redirects, or
  protected-owner use; and
- claims that Core can recall external/browser/CDN cached permanent responses.

## References

- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [Phase 24 D80 adversarial review](../prds/sitestacker-parity/phase-24-d80-material-purpose-new-page-adversarial-review.md)
- [Phase 24 D79 adversarial review](../prds/sitestacker-parity/phase-24-d79-stable-page-purpose-continuity-adversarial-review.md)
- [ADR-0199 - Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [Google - Site moves and URL mapping](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [W3C - Architecture of the World Wide Web: URI persistence](https://www.w3.org/TR/webarch/#URI-persistence)
- [Payload - Versions](https://payloadcms.com/docs/versions/overview)
- [Payload - Redirects](https://payloadcms.com/docs/plugins/redirects)
- [Contentful - Versions](https://www.contentful.com/help/content-and-entries/versions/)
- [Contentful - Versioning FAQ](https://www.contentful.com/help/faq/versioning/)
- [Sanity - IDs and paths](https://www.sanity.io/docs/content-lake/ids)
- [HubSpot - Create and manage URL redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects)
- [WordPress.com - Page and post links](https://wordpress.com/support/permalinks-and-slugs/)
- [Webflow - Set up redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow)
- [Shopify - URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- [Neon One - URL Redirects](https://support.neonone.com/hc/en-us/articles/9811436298637-URL-Redirects)
- [Blackbaud - URL Redirects (archival corroboration)](https://webfiles-sc1.blackbaud.com/files/support/netcommunity/q12012/us/spark/Content/BBNCURLRedirects.html)
- [GOV.UK - Understand content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- [GOV.UK - Identify user needs](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/identify-user-needs/)
- [WCAG 2.2 - On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG 2.2 - Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [Supabase - Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL - CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
