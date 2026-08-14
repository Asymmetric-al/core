# ADR-0120: Family-certified Public Page Presentation Profile Versions

**Status:** Accepted (founder ruling, Phase 22 grill session — D3)

## Context

Missionary Ministry Pages and Project/Campaign Pages need meaningful tenant
branding and composition flexibility without becoming unrelated miniature
websites. The existing generic Payload block list and mutable page templates do
not preserve family semantics, exact release dependencies, contributor edit
boundaries, or prospective immutable rollout. Ministry Updates also already
exist as one independently governed cross-surface concept, so embedding or
copying them into page revisions would create a conflicting update domain.

## Decision

Phase 22 defines two non-interchangeable families of immutable, code-certified
Public Page Presentation Profile Versions: Missionary Ministry Page and
Project/Campaign Page. Each family owns a certified shell, zones, required
managed blocks, bounded optional blocks, contributor-editable semantic slots,
cardinalities, and accessibility, performance, locale, and failure contracts.
They share governed rendering primitives and one Publication contract rather
than one universal polymorphic page schema.

For each Tenant × Legal Entity × Site × Page Family, the product supplies one
built-in accessible default and permits one prospective tenant-selected complete
profile version. An exact page exception may select another complete certified
profile of the same family; profiles never deep-merge, cascade, mutate after
activation, or cross families. Every D2 Page Release Manifest pins the exact
compatible profile, block-catalog and renderer generation, locale policy,
referenced brand version, resolved layout digest, and content revision. A new
default cannot silently change an existing release.

Every Presentation Block Contract declares whether it contains release-frozen
editorial content, an independently authoritative managed projection, or an
independently released feed, together with its source and edit authority,
safety ceiling, allowed placement/cardinality, and deterministic failure
behavior. Identity, safety, Designation, progress, Giving, and organization
language remain references to their owning domains rather than copied page
facts.

The Ministry Updates section is a bounded managed feed over canonical Ministry
Updates. One exact Ministry Update Feed Binding selects the eligible source
stream or explicit source set; relationship inference is prohibited. Each
update retains independent revisions, moderation, Phase 10 proof, visibility,
locale, release, withdrawal, and communication outcomes. The page release pins
the feed contract, not a copied or permanently frozen result set, and every
served item must remain eligible under both page and update authority.

Payload remains the bounded authoring and editor substrate. Exact profile
activation, page bindings, compatibility and impact evidence, actor authority,
D2 release pins, and serving selection remain operational Asym facts protected
by structural scope, explicit authorization, indexed RLS, and server-owned
compare-and-swap operations.

## Consequences

- Tenants receive two clear visual family setup surfaces and strong defaults
  rather than a general-purpose layout or workflow designer.
- Contributors edit only plain-language semantic slots and author Ministry
  Updates through a connected but separate workflow; they cannot alter managed
  identity, safety, Giving, reach, route, or lifecycle truth.
- Existing releases remain stable while profile changes are production-previewed
  and prepared as explicit draft cohorts with impact evidence.
- Unknown or incompatible schemas block new release and preserve the last
  certified output; smallest-scope optional projection failures do not falsely
  become whole-page or notification outcomes.
- Legacy generic layouts, copied profiles, arbitrary CTA URLs, and incomplete
  update stores require manifest-driven classification and shadow compilation
  before any new D2 release.

## Later Phase 22 D27 qualification

D27 deliberately removes D3's earlier exact-Page profile exception. For each
exact Tenant × Legal Entity × environment × Site × Page Family, exactly one
current D3 profile head selects one immutable Missionary Ministry or
Project/Campaign family design for every Page and locale in that family. Phase
22 ships no Page- or locale-specific profile, layout fork, copied profile,
layered override, deep merge, cascade, or schema variant. A Page or locale may
leave an offered optional D20 role empty or unavailable without becoming a
structural exception.

Page identity is Site-scoped and excludes locale. Each Page has subordinate
Page × Phase-24 locale editorial lineages whose content, review, attestation,
and D2 releases remain independent. The family profile governs structure only:
neither a profile selection nor activation translates, overwrites, submits,
approves, attests, releases, widens, or silently falls back into another
locale.

Every D2 release still pins its exact release-time D3 profile, catalog,
renderer, locale policy, brand, content, and other owner generations as
immutable baseline and historical evidence. Separately, one immutable D3
Public Page Family Presentation Activation Manifest becomes the current family
selector. D18 must resolve both the exact D2 Page × locale release and the
current D3 activation; an unknown, incompatible, or mixed pair fails closed.

A mechanically certified compatible successor may update current presentation
without mass D2 republication only after shadow-compiling the complete current
cohort: every non-retired Page × Phase-24-enabled locale with a current D2
release head in the Site and family, regardless of reach. One Site × family
coordination head fences D2 release and D3 activation races. The activation
manifest pins and rechecks its monotonic epoch and exact release-head-set digest
before one short idempotent compare-and-swap advances the family head; partial
activation is impossible. A semantic-exposure, removed-role, cardinality,
locale-behavior, media-contract, catalog, renderer, or otherwise incompatible
successor leaves the prior generation current until every affected release has
an explicit safe disposition through its existing owner workflow.

This later qualification preserves the original reasons for two certified,
non-interchangeable families and immutable versions while making tenant
operation simpler: **Page design — all languages** is one D3 Site × family
action, whereas **Content — this language** remains the ordinary locale-specific
D1/D4/D5/D26/D2 path.

## Related decisions

- [ADR-0029 — Reference-not-copy CMS↔operational](./0029-reference-not-copy-cms-operational.md)
- [ADR-0118 — Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 — Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0137 — Two Bounded Page Family Semantic Catalogs](./0137-two-bounded-page-family-semantic-catalogs.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 13 campaign, Designation, contribution ledger, and giving cart](../prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md)
