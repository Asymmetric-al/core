# ADR-0207: Site before ledger with locale and currency facets

**Status:** Accepted (Phase 2 A1–A4, with explicit later owner amendments).

This records the settled target contract requested by [AL-481](https://github.com/Asymmetric-al/core/issues/481), not implementation, provider qualification, or activation evidence.

## Context

The earlier model treated Tenant as the canonical product boundary and assumed a
single public website, language, and currency beneath it. Tenant isolation remains
correct, but the singular website assumption cannot express regional or separately
branded public presences. Building the giving ledger and public content first would
embed that assumption in durable records; later Site attribution could not be
honestly reconstructed from missing history.

SiteStacker separates a `site` from its website-level `site channel`. Phase 2
settled a smaller model: one public-presence level beneath Tenant, with locale and
currency facets, analogous to Shopify Markets and Contentful rather than another
Site/channel hierarchy.

## Decision

Introduce Site **before the giving ledger**. Every Tenant has one or more Sites
and exactly one Default Site; optional additional Sites supply independently
branded public content and giving entry points. Site owns presentation and entry
attribution. Tenant remains the outer isolation and permission boundary. Mission
Control, Donor Portal, and Missionary Workspace are not Sites; donor accounts and
authorized history remain Tenant-wide.

Locale and currency remain Site facets, not additional Site identities. Reserved
scalar settings use typed operational columns rather than generic settings tables.
This is not a universal prohibition on child tables: Phase 24 D66 normalizes
stable `site_locales` as a bounded repeated facet because immutable locale identity
and public history no longer fit scalar/array fields. D64 similarly owns bounded,
versioned Site Suggested Amount Sets. Neither exception introduces EAV/JSON
settings, arbitrary `site_*_settings` tables, or a second Site level. Later owners
retain their exact lifecycle and public-release rules.

Use one Postgres database with disjoint ownership: `public.sites` owns operational
identity, Tenant scope, default designation, and currency facets; Payload
`cms.sites` owns authored presentation and content scoping. Both representations
share the **same UUID**, with disjoint fields. CMS does not become operational or
money authority, and no cross-database sync engine is introduced.

Retrofit public content around trusted **host → Site → Tenant** resolution in
`packages/api`, without importing Payload into giving. Add Site to CMS request
context and relationships for Pages, Navigation, MissionaryGivingPages, and
ProjectPages; public reads filter by Site as well as Tenant, and page slug
uniqueness becomes per-Site. Template creation accepts `siteId`; new content may
preselect the Tenant's Default Site. Idempotent provisioning creates that Default
Site and aligns the CMS identity. Existing mock CMS content may be assigned to it
in an approved pre-production reset. The Default Site never resolves an unknown
public host; current operational Domain authority supplies exact host roles under
Phase 24 D72.

Downstream owners freeze Site, Entry Method, Source Code, and Designation as
independent attribution axes: where, how, what drove giving, and what it funds.
Phase 13 owns committed contribution truth; Phase 15 batch capture and Phase 16
recurring terms hand off to that owner without becoming competing gift stores.
Later Site/domain/locale changes cannot rewrite accepted attribution. No production
gift history is fabricated or inferred from current defaults; retained fixture
conversion preserves only proven source evidence and leaves unknown Source Code
absent.

Site never owns or selects merchant, processor account, settlement, bank,
accounting, or receipt-issuer identity. Phase 7/20 Legal Entity and Settlement
Account Binding contracts govern financial roots: each resolves and freezes its
exact Legal Entity and applicable binding. A seeded Tenant default may prefill
setup but never substitutes for persisted money ownership. There is no Site
`payment_account_ref`; Site count does not determine payment-account count.

## Trade-offs and alternatives

A Site/channel hierarchy would resemble the vendor model more literally, but adds
nested identities and scope joins without a separate accepted product boundary.
The single-level model preserves website outcomes while keeping attribution
orthogonal; future imports map a SiteStacker site channel approximately to Site.

Deferring Site until multi-site management would reduce initial provisioning and
CMS retrofit work, but require later changes to content scope and ledger consumers
and risk invented historical attribution. Introducing the primitive now pays that
cost before durable money records, while deferring the full management product.
Typed facets keep ownership visible; bounded repeated aggregates cost additional
relations when their owning phase proves those relations necessary.

## Consequences

Content, host resolution, provisioning, and downstream attribution must use the
same exact Site identity within Tenant scope. Funds/designations, CRM, shared
Media, and authenticated accounts retain their owning Tenant-wide boundaries;
adding a Site grants no authorization or financial authority.

This foundation does not launch multi-site management, translation, domain
verification, additional donor currencies, or FX. Phase 24's explicit amendments
own later domain, exact-locale, brand, and presentment behavior; their publication
alone does not prove runtime activation.

## Related contracts

- [Phase 2 PRD](../prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md)
- [Shared glossary](../../CONTEXT.md)
- [Platform boundaries](../../openspec/specs/platform-boundaries/spec.md#requirement-site-is-a-tenant-owned-presentation-and-attribution-entity)
- [Platform surfaces](../../openspec/specs/platform-surfaces/spec.md#requirement-public-tenant-website-as-the-public-ministry-surface)
- [Multi-Site foundation documentation change](../../openspec/changes/document-multi-site-foundation/design.md)
- [Reference-not-copy CMS/operational ownership](0029-reference-not-copy-cms-operational.md)
