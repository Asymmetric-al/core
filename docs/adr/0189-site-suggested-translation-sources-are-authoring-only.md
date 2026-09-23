# ADR-0189: Site suggested translation sources are authoring-only

**Status:** Accepted (founder ruling after required amendments, Phase 24 D68,
2026-08-30)

## Context

Phase 24 originally promised “fallback-chain configuration.” D15, D16,
ADR-0187, and ADR-0188 now prohibit Site-wide cross-language substitution and
require every actual Translated revision to pin an explicit Translation Basis.
The remaining legitimate need is smaller: staff who repeatedly start or compare
translations should see likely source languages first without making that order
public truth, authorization, or provenance.

Current Core has no Payload localization configuration, stable Site Locale
runtime, translation-source chooser, Translation Basis, or Site authoring
preference. Phase 23 PR #1340 remains open and blocked. This ADR therefore
records intended Phase 24 behavior and authorizes no implementation.

## Decision

Core replaces **fallback chain** with **Suggested translation sources**: one
optional, Site-owned, ordered subset of zero or more unique stable Site Locale
identities from that same Site. Empty is valid. The subset ranks staff choices
only when an authorized editor deliberately opens **Copy from…** or **Compare
with…**.

A nonempty subset requires at least two Site-Locale-owner-projected authoring-
eligible Site Locales. With fewer, only the empty value is valid. D68 consumes
that projection and defines no locale lifecycle state.

It is not a chain, default, allowlist, equivalence claim, Translation Basis,
public-alternative order, or resolver. Unlisted eligible sources remain
available under **Other available sources**. Core never initializes the order
from English, Default Site Locale, legacy `allowed_locales[]`, BCP-47 similarity,
existing Translation Bases, content frequency, browser language, provider
fallback, or another Site.

At point of use, Core intersects the stored order with a source-owner-supplied
eligible set for the exact resource and viewer. A candidate must be in the same
Tenant and Site, differ from the target locale, have an exact eligible saved
source revision for the requested action, and pass current source-read plus
action-appropriate target authorization. Copy requires current target create/
write authority; Compare requires the permitted target read/review authority
defined by D67. Configured eligible sources appear first in stored order; all
remaining eligible sources follow in stable localized order with canonical
locale code as a tie-breaker. Hidden or unauthorized candidates are absent and
non-enumerating.

Nothing is preselected. The actor must choose one complete exact source locale
and revision. The future owning editor command—the accepted successor to
proposed Phase 23 D22, composed with D67—reauthorizes source and target,
pins the selected revision, and creates only the authorized target effect. A
preference read is never proof. For any authorized new target, **Start blank**
remains a separate, always-available action and creates an Independently authored
draft, whether or not eligible Copy sources exist. **Copy from…** creates a
private working draft from only the source-owner localization manifest. An
existing target is never overwritten by Copy; **Compare with…** is on-demand
and read-only.

ADR-0190 defines the bounded revision choice after the source locale is chosen.
Each eligible source locale contributes at most two distinct logical heads: its
exact current server-acknowledged Working Revision as **Latest saved draft** and
its exact current authoritative public source revision as **Current published
version**, each subject to ADR-0191 qualification. They are unselected choices,
not additional Site preference members; D68 still ranks locales only. D69
qualifies each exact head before deduplicating enabled equal compatible copy input
and prefers the public row only when it qualifies,
never reads provider “latest” or history as authority, and creates no third
scheduled candidate. Selecting a private head requires immutable checkpointing
and remains subject to D67's public-source publication boundary.

An existing Translated target continues to compare against its pinned D67
Translation Basis regardless of later preference edits. A preference change
never rebases a target, changes provenance or freshness, creates a source
relationship, or turns independently authored or legacy content into Translated
content. Cross-Site copy remains the proposed Phase 23 D23/ADR-0167 independent-
copy workflow and cannot enter this same-Site preference.

The setting has no public effect. Public routes, responses, redirects,
Navigation, search, sitemap, canonical, `hreflang`, metadata, language controls,
explicit resource-owned public alternatives, Public Site Generation, cache
identity/invalidation, Vercel state, Giving, currency, messages, receipts, and
payments never read it. Payload `fallbackLocale` remains disabled on exact-locale
reads. Phase 17 message fallback remains a separate whole-message contract.

## Staff experience

The setting lives in **Site → Languages → Authoring preferences**.

A Site with fewer than two authoring-eligible locales shows no translation-source
configuration. When a second locale becomes authoring-eligible, the section
appears in its empty state and nothing is added automatically.

- Heading: **Suggested translation sources**
- Helper: **Choose which Site languages editors see first when they copy or
  compare translations. This does not publish, replace, or show another language
  to visitors.**
- Empty: **No sources suggested. Editors can still choose any available
  source.**
- One item has **Remove** but no meaningless reorder controls.
- Multiple items form a semantic ordered list with visible position, **Move
  up**, **Move down**, and **Remove**. Drag may supplement these controls but can
  never be the only operation.
- **Add source** remains available in empty, one-item, and many-item states while
  an unlisted authoring-eligible locale remains. It opens the same unselected
  accessible chooser and appends the choice to the unsaved order; it never moves
  a new source silently to first place.
- **Save changes** is explicit; **Cancel** preserves the current value. Success
  says **Suggested translation sources updated.**

Adding sources uses an unselected, permission-appropriate chooser over
same-Site authoring locales not already listed. Locale identity uses its full
autonym, staff-UI display name, and canonical code—for example **français
(France)** and **French (France) · fr-FR**—with no flags or collapsed base-
language label. `lang`, `dir`, and bidirectional isolation remain truthful.

For a new French (Canada) target, the editor says **Copy into French (Canada)**
and **Choose the version to copy. This creates a new French (Canada) draft. It
does not publish or create a visitor-facing language link.** Unselected sources
appear under **Suggested for this Site** and **Other available sources**. The
final action is **Create French (Canada) draft**. Success says **French (Canada)
draft created from French (France). Review it before publishing.** Before this
Copy chooser, every authorized missing target offers one quiet **Start French
(Canada)** sheet. When Copy is available, neither **Start blank — Create an
empty private French (Canada) draft** nor **Copy from… — Choose an existing
language/version to create a private draft** is preselected. When no Copy source
is authoritatively eligible, Start blank remains and Copy explains that no source
is available. An unknown/failed candidate query never claims empty; it says **We
couldn't load translation sources. Try again.** Blank success says **French
(Canada) draft started. It is not public.** If a target already exists, Copy is
absent and the existing editor offers read-only comparison instead.

Repeated controls have locale-qualified accessible names such as **Move French
(France) up** and **Remove French (France)**. Add returns focus to the appended
row and announces it. Remove moves focus to the next row, otherwise the previous
row, otherwise **Add source**, and politely announces removal. Move retains focus
on the moved row, synchronizes DOM and visual order, and announces the new
position.

## Authority and data invariants

Operational Postgres owns the current Site authoring preference. Payload user
preferences, Payload localization/fallback fields, caches, and projections are
not authority. The physical parent/child representation may reuse an accepted
Site-policy aggregate, but design must preserve these invariants:

- at most one stored current positive-revision preference per exact Tenant and
  Site; absence is the canonical empty value at logical revision zero only before
  the first committed mutation;
- after the first mutation, explicit clear or owner-driven canonicalization to
  empty commits the next positive parent revision with zero members and audit;
  it never deletes the parent or collapses history back to revision zero;
- an optional partial order of stable Site Locale IDs, never locale strings or
  copied labels;
- non-null same-Tenant/same-Site structural relationships, unique member
  identity, and unique positive canonical position;
- deterministic dense order produced by the command;
- restrictive Site Locale deletion and no orphaned member;
- one durable actor-attributed audit containing the prior and resulting order;
- no source content, hidden title, diff, money, asset, or generated-document
  payload in preference/audit rows; and
- indexes shaped for one bounded Site preference read and membership checks.

An unchecked JSON/text/UUID array, EAV settings table, target-by-source matrix,
graph, fractional-rank scheme, CRDT, second serving head, or per-user shadow
authority is not acceptable. This low-risk mutable preference does not require
immutable publication history; optimistic concurrency plus durable business
audit is sufficient.

Existing `sites.manage_locales` authorizes **Set suggested translation sources**.
It grants no source-content read, target create/edit/review, Translation Basis,
public-alternative, or publication authority; `sites.publish_locales` is not
involved. The caller supplies the complete ordered stable-ID subset, expected
preference revision, and semantic idempotency key. Tenant, Site, environment
context, actor, capability, locale membership, time, and audit attribution derive
from trusted server context.

Editors who can open an owning Copy/Compare flow may read only the effective
permission-filtered ranking for that exact action. They gain neither raw
preference-management authority nor visibility into filtered source content.

The server reauthorizes EffectiveAccess, re-resolves every Site Locale, validates
scope/uniqueness/lifecycle, and commits the complete order, incremented revision,
audit, and idempotent result atomically—or commits nothing. Matching key and
meaning returns the prior result; changed meaning conflicts. Concurrent saves
produce one winner and one recoverable conflict, never a merged or partial list.
No provider/network call occurs while locks are held.

Applicable relations use minimum grants and ENABLE/FORCE RLS, operation-correct
`USING` and `WITH CHECK`, security-invoker views, and security-definer functions
with empty `search_path`, schema-qualified objects, and minimum execute grants,
plus indexed predicates and direct-DML poison tests. Browser, `anon`, service/secret-role
application, Payload-bypass, generic-worker, caller, and AI paths cannot write
the preference outside the command. The preference manager may order Site
Locale identities but gains no source-content visibility.

Current environment isolation remains one Supabase project/database. D68 adds
no partial environment column; any future shared-environment database must first
add environment to Site and every dependent key/FK atomically.

## Lifecycle, failure, and performance

Adding a Site Locale never adds it to the preference; it remains available under
ordinary sources until deliberately suggested. A public withdrawal that leaves
private authoring eligible does not remove it. If the Site Locale owner commits
a terminal authoring-ineligible transition, that owning command previews impact
and canonicalizes the complete current preference in the same authoritative
transaction: it removes affected membership and clears the order if fewer than
two authoring-eligible Site Locales remain, while every historical Translation
Basis and revision survives. Re-creation or reactivation never silently re-adds
it. D68 does not define a new locale lifecycle state or retirement command.
Resource absence, temporary lifecycle ineligibility, or viewer permission loss
filters the effective picker without rewriting the stored Site preference.

A locale/source/permission change after the picker opens causes the owning
Copy/Compare command to fail safely, preserve input/work, and say that the source
is no longer available. A preference read failure suppresses only prioritization:
the normal permission-filtered **Other available sources** chooser remains
usable and no locale is guessed. A failed save preserves the submitted order.
An unknown candidate query keeps Start blank available but says **We couldn't
load translation sources. Try again.** A selected source/body fetch failure keeps
the selection and says **We couldn't load [locale]. Try again or choose another
source.** A preference-save network failure keeps the unsaved order and says
**Couldn't save suggested sources. Your changes are still here. Try again.**
On an expected-revision conflict, Core keeps the user's unsaved order, fetches
and displays the latest saved order separately, never auto-merges, and says
**Suggested sources changed while you were editing. Your changes were not
saved.** Staff explicitly review and retry or reset to the saved order.

The chooser resolves on demand, not on every editor render or keystroke. It uses
one bounded preference read plus one batched eligibility query, keyset/search
behavior only when the eligible catalog warrants it, and loads a source body or
diff only after selection. V1 never shares an effective chooser result across
viewers. An optional private cache of the base, ID-only Site order must bind the
exact Tenant, Site, and preference revision; current per-viewer/resource/action
eligibility is recomputed on every open. Site × target × source × resource
projections, N+1 reads, eager all-locale/version downloads, and public caches
are prohibited.

Site cloning or cross-Site copy never copies raw Site Locale IDs. A future
explicit clone command must map exact target Site Locales deliberately or leave
the preference empty.

## Consequences

- Frequent editors can prioritize likely sources without losing access to any
  other eligible language.
- Empty/unavailable configuration behaves exactly like the no-build alternative.
- Every actual source remains an explicit, authorized, revision-pinned choice.
- Donors and public visitors can never observe this setting.
- Staff configuration adds one small ordered Site preference and no workflow,
  resolver, fallback graph, or translation-management platform.
- Release remains blocked on accepted Phase 23 lineage/editor contracts, D66/
  D67 foundations, Phase 12 authorization, and a consolidated Phase 24 OpenSpec
  delta.

## Rejected alternatives

- **No stored preference:** safest and simplest, and remains the exact empty-
  preference behavior; rejected as the only behavior because it repeats a common
  source choice when one Site has several locales.
- **One mandatory primary source:** simpler than an order but falsely implies one
  authoritative language across regional/script variants and independently
  authored content.
- **Per-target/source matrix or graph:** expressive but creates noisy setup,
  cycles, migration, and policy complexity before evidence of need.
- **Runtime fallback or visitor-alternative order:** conflicts with exact-locale
  identity and resource-owned public alternatives.
- **Payload fallback configuration:** provider substitution is runtime behavior,
  not Core authoring preference or provenance.

## Activation boundary

This decision authorizes no implementation, schema, migration, Payload setting,
OpenSpec delta, ticket, deployment, or production change. Before implementation,
the consolidated Phase 24 OpenSpec must state the observable contract and an
accepted design must prove exact-scope storage, authorization, concurrency,
provider-neutral editor integration, public no-effect, migration, accessibility,
production-shaped performance, usability, and rollback.

## References

- [ADR-0187 — Proof-gated independent Site Locale publication](./0187-proof-gated-independent-site-locale-publication.md)
- [ADR-0188 — Retain reviewed translations across ordinary source drift](./0188-retain-reviewed-translations-across-source-drift.md)
- [Phase 24 D68 adversarial review](../prds/sitestacker-parity/phase-24-d68-suggested-translation-sources-adversarial-review.md)
- [Drupal explicit translation source selection](https://www.drupal.org/docs/8/core/modules/content-translation/overview)
- [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)
- [Payload localization](https://payloadcms.com/docs/configuration/localization)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Blackbaud multilingual event pages](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/luminate-online/EMC_CCC/Content/Tasks/EMC_TranslateWebPages.html)
- [WCAG 2.2 dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- [WAI rearrangeable-list example](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
