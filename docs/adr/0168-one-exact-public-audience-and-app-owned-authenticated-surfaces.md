# ADR-0168: One exact public audience with app-owned authenticated surfaces

**Status:** Accepted (founder-ratified Phase 23 D24 A-prime-R, 2026-08-23)

## Context

Phase 23 must decide whether public Web Studio output is one coherent
anonymous representation, whether CMS content also targets authenticated apps,
or whether one public URL varies by visitor identity. The choice controls tenant
isolation, authorization, cache identity, public search, metadata, social
sharing, preview, migration, and staff comprehension.

The current public bridge is safe only while published output is genuinely the
same for every visitor at one public scope. D1, D2, D5, D13, D14, D17, Phase 10,
and Phase 22 already separate public release, reach, scheduling, source safety,
search, protected supporter projections, and authenticated applications. A
visitor-conditioned public page would therefore create a new personalization
and authorization subsystem rather than a small CMS visibility option.

## Decision

> **A-prime-amended-and-hardened (A-prime-R) — one exact, code-owned `public`
> audience for every Phase 23 Web Studio public representation, with app-owned
> authenticated surfaces, auth-invariant public delivery, and quiet
> consequence-first UX.** `public` means accessible without authentication and
> identical for every visitor at the same trusted Tenant, environment, Site,
> locale, canonical resource/path, active D1 Site Plan generation, renderer and
> contract generation, and current source-qualified public state. A present or
> expired session, donor/missionary/staff role, account history, cookie,
> authorization header, query or campaign parameter, referrer, geography,
> experiment, analytics state, device, crawler, HTML/RSC/prefetch mode, or
> browser navigation history never changes the CMS-authored body, Primary or
> Footer Navigation, Dynamic Content List membership/order, public media,
> metadata, canonical, robots disposition, sitemap, social presentation, or D17
> search document/admission. Site and locale are exact scope, not audiences;
> D2 `Listed publicly` and `Shared by link — public` are reach/discovery
> dispositions inside the one public audience; D13 exact whole-Page publication
> appointments govern when that public representation is active; and current
> Phase 10/source safety may narrow or withdraw it. None becomes a request-time
> visibility condition.
>
> Web Studio stores and exposes no tenant-authored audience field, table,
> catalog, role list, conditional-region expression, visitor simulator,
> disabled future selector, or per-block/menu/list schedule. Its existing
> Page-first workspace shows the quiet read-only fact **Visibility: Public
> website** and **Anyone can view this page after it is released**. Draft and
> preview remain clearly not public. The publish or schedule consequence names
> the exact Site, locale, resolved path, immutable revision, and D2 reach: a
> Listed release says it can be viewed, shared, and may appear in search; a
> Shared-by-link release says anyone with the link can view and reshare it, while
> Asym omits it from public discovery and requests no indexing without promising
> external secrecy or erasure. Later drafts stay private until separately
> released. One durable **Released**, **Updating public site**, **Live**, or
> cause-owned **Needs attention** state remains after transient feedback. The
> same truth is available on mobile and to keyboard, screen-reader, touch,
> zoomed, forced-colors, reduced-motion, RTL, bidirectional, CJK, and long-label
> users; it is never confined to color, an icon, hover text, a toast, or a
> desktop inspector.
>
> Preview remains the exact-version, currently authorized, private editorial
> capability already bounded by Phase 22 D10 or its owning Phase 23 successor;
> it says **Preview — not public. This is what anyone will see after release**,
> is private, no-store and noindex, uses the public compiler/renderer without
> becoming a public cache variant, and never grants authority or proves release.
> Donor Portal, Missionary Workspace, and Mission Control own their private
> content, DTOs, routes, permissions, search, caching, failure handling, and
> authorization on every request. Public Sites use stable task-named actions
> such as **Donor portal** or **Missionary portal**; the destination app handles
> authentication and safe return routing. No protected content, identity,
> balance, assignment, entitlement, token, or account result enters public HTML,
> RSC/data, prefetch, media, metadata, search, sitemap, social, analytics, logs,
> errors, or shared caches. Phase 22 D11's independently authorized Supporter
> Ministry Update projection remains source- and app-owned; only its separately
> qualified public projection may enter D1 public output. D24 neither widens nor
> collapses those audiences.
>
> The server derives the public scope and exact `public` discriminant; no client
> may supply or widen either. Candidate closure and every public artifact pin the
> same D1 generation and reject missing, nullable, unknown, mixed, or unsupported
> audience/schema values while preserving the prior complete safe generation.
> Cache identity includes every trusted dimension that can change bytes—Tenant,
> environment, Site, locale, canonical resource/path, active generation,
> artifact/renderer/contract, and exact `public`—whereas cache tags are bounded
> invalidation handles only, never tenant or audience isolation. Public
> composition and every D9 certified package are structurally unable to import
> cookies, sessions, authorization, roles, CRM segments, geography,
> experimentation, personalization, or browser-supplied audience state.
> Authenticated apps deny by default and reauthorize each request; `private` or
> `no-store` delivery is defense in depth, not authorization.
>
> Auth failure never changes or takes down ordinary public content. Unknown
> public scope, incomplete closure, dependency skew, or incompatible audience
> blocks the candidate and retains the prior safe generation; Phase 10/source
> adversity suppresses positive public output first; private-app failure never
> falls back to a privileged or user-specific public variant. Privacy-safe
> observability distinguishes release authority, cache and public-runtime
> convergence, D17 search deletion/lag, suppression, resolver ambiguity, and
> output-invariance failure without recording content or user identity.
> Migration inventories every legacy condition: only independently proven
> public-safe records migrate to `public`; private, conditional, restricted,
> unknown, or unresolvable records are quarantined rather than defaulted public.
> Completion requires exact-pin Next.js/Payload/Vercel and D9 package
> conformance, hostile cross-tenant/cache tests, identical normalized public
> artifact hashes across anonymous and authenticated request classes, complete
> absence of protected data from every public byte surface, exact
> release/withdrawal/race/rollback proof, and representative mobile,
> accessibility, localization, and ministry-staff usability evidence. A second
> audience requires a new founder decision and a complete owner, route,
> authorization, release, preview, cache, search, migration, observability, and
> incident contract; Phase 23 creates no dormant personalization substrate.

## Consequences

- Every Phase 23 public artifact has one required code-owned `public` audience;
  there is no tenant audience configuration or personalization engine.
- Authentication, roles, cookies, campaigns, geography, experiments, and
  account history cannot alter CMS-authored public output.
- D2 reach, D13 scheduling, Phase 10 safety, and source-owned eligibility remain
  separate authoritative dimensions rather than audience conditions.
- Donor Portal, Missionary Workspace, Mission Control, and Phase 22's protected
  Supporter projection retain separate app-owned authorization and DTOs.
- Public Sites use stable account destinations while authenticated applications
  reauthorize every request; cache directives never substitute for permission.
- Public cache identity is low-cardinality but complete and explicit; cache
  tags remain invalidation handles only.
- Staff receive truthful, low-noise visibility, preview, reach, release, and
  convergence language without an audience builder or repetitive warning.
- Unknown audiences, mixed generations, legacy conditional content, and
  provider drift fail closed while the prior complete safe generation remains.
- Supporting this invariant requires cross-artifact, cross-auth, warm-cache,
  migration, failure, accessibility, localization, and usability proof, but it
  avoids the much larger permanent cost and risk of conditional public content.

## Rejected alternatives

- **CMS-authored public and authenticated delivery classes:** rejected for
  Phase 23 because it would pull Donor Portal and Missionary Workspace release,
  permission, preview, search, cache, support, and migration contracts into Web
  Studio before their owning phases decide them.
- **Visitor-conditioned regions on one public URL:** rejected because it creates
  a personalization platform, fragments canonical/search/social output,
  multiplies cache variants, and turns every renderer and package into an
  authorization-sensitive surface.
- **A nullable or disabled future audience field:** rejected because it creates
  ambiguous data and misleading UX without providing a safe future audience.
- **Payload roles, CSS hiding, `Vary: Cookie`, or private-cache directives as
  authorization:** rejected because presentation and caching are not permission
  checks and can still leak protected data through nonvisual public artifacts.

## Activation boundary

Ratification records architecture only. A future authorized implementation must
prove exact public scope and dependency boundaries, public output invariance,
complete private-data absence, hostile tenant/cache isolation, exact preview,
D13 and adverse-withdrawal behavior, migration quarantine, mixed-version
rejection, provider qualification, privacy-safe observability, rollback, and
representative ministry staff usability/accessibility before activation.

## References

- [Phase 23 D24 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)
- [Phase 23 D24 cache/security primary-source research](../prds/sitestacker-parity/research/phase-23-d24-public-audience-cache-security-primary-source-research.md)
- [Phase 23 D24 independent adversarial review](../prds/sitestacker-parity/research/phase-23-d24-public-audience-independent-adversarial-review.md)
- [Phase 23 D24 UX benchmark](../prds/sitestacker-parity/research/phase-23-d24-public-audience-ux-benchmark.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0149 — Bounded public Navigation grammar](./0149-bounded-public-navigation-purpose-and-item-grammar.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0157 — Exact-revision scheduled publication appointments](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0161 — Derived Public Site Search Projection](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)
- [Vercel Cache-Control](https://vercel.com/docs/caching/cache-control-headers)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
