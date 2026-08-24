# ADR-0159: Three bounded Content-list curation strategies

**Status:** Accepted (founder-ratified Phase 23 D15 C-prime-R, 2026-08-22)

## Context

ADR-0158 creates one source-discriminated Content list backed by a qualified,
versioned Dynamic Source Contract and explicitly reserves curation for a later
decision. Ordinary nonprofit staff need automatic lists, a small way to lead or
hide particular matching items, and exact hand-curated lists without learning a
query language or creating global source-record flags. The same design must
preserve Phase 10 safety, D8 reuse ownership, D12 recovery, D1 release, and
future deterministic pagination.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — Three bounded, list-instance-owned Content-list curation strategies, Page-local by default, under D14’s one-source contract and D1’s sole Site Plan release.** Each Content list stores exactly one versioned, source-discriminated `curation@1` branch inside D14’s canonical Selection Intent: **Updates automatically**, using the source’s bounded filters, deterministic sort and limit plus optional bounded exact exclusions applying only to this list; **Featured first**, using that same active query and exclusions plus one bounded ordered set of currently matching featured identities followed by the deterministic, deduplicated automatic tail; or **Choose every item**, using only one bounded ordered set of exact source-qualified identities with no filters, automatic sort, exclusions, substitution, or automatic tail. The Page Editorial Revision owns the intent for an ordinary list; if the list is inside a D8 Reusable Section, that exact Reusable Section revision is the sole owner and D8’s “change every use” or “make a local copy” consequences apply.
>
> One provider-neutral server resolver derives the exact Tenant, environment, Site, locale, audience, Page family, source and source-contract version from trusted context; re-proves current source-owned publication, routeability, Phase 10 safety and filter eligibility; applies exclusions; emits surviving featured identities in saved order; appends the deterministic automatic remainder; deduplicates by stable never-reused public identity; and applies the configured limit. D16 may later paginate only this final logical order and may neither reinterpret membership nor repeat featured items on every page.
>
> Staff may initially choose only items exposed through the current public-safe candidate projection. References select identity and order, never copied titles, routes, media, publication state or financial/operational facts. Save and release reject duplicates, forged, unknown, wrong-source or wrong-scope references, feature/exclusion overlap, unsupported strategy fields, excessive selections and featured counts exceeding the list limit. Malformed retained data fails safely; exclusions win defensively, while an invalid candidate release is blocked and the prior public generation remains live.
>
> A legitimately withdrawn, unpublished, untranslated or newly restricted reference remains inactive editorial intent but is suppressed immediately. Automatic and Featured-first lists refill deterministically when possible; Choose-every-item shrinks without substitution. Reappearance is allowed only for the same non-terminal source identity under current eligibility. Runtime reads never rewrite editorial history.
>
> Web Studio asks one plain-language question—**How should items be chosen?**—and then reveals only the controls relevant to that answer. Automatic is the visible recommended default. Pickers are bounded, searched, server-paged and public-safe. Preview uses the same resolver as public rendering. Reordering has Move up, Move down and Move to position controls, with drag only as an optional enhancement. Strategy changes explain the exact consequences, request confirmation only when populated settings would be discarded, preserve the prior D12 revision and undo path, and remain private until D1 publication.
>
> D15 creates no global `featured`, `sticky` or `hidden` source field; no per-item curation table or backreference; no multiple-source union, nested collection, weighting, boosting, arbitrary query language, personalization, recommendation or AI ranking; no copied source content; no private-candidate enumeration; and no pagination or SEO policy. Friendly **Latest** copy is permitted only when the exact source contract defines an authoritative public-release timestamp descending plus a stable-identity tie-breaker. Ratification records the product decision only and authorizes no implementation, schema, migration, provider adoption, issue publication, deployment or production change.

## Consequences

- Every Content list has one active, versioned strategy: Updates automatically,
  Featured first, or Choose every item. Inactive-strategy fields are not stored.
- Curation is Page-local by default. An exact D8 Reusable Section revision is
  the sole shared-ownership exception; placements cannot override it.
- The canonical resolver uses trusted scope and current source-owned public and
  safety eligibility. References express identity and order only and never copy
  source content or confer access.
- Updates automatically and Featured first refill within certified bounds;
  Choose every item shrinks without substitution. Inactive intent remains
  recoverable but cannot render.
- Featured identities must remain in the active query, count toward the one
  final limit, appear once, and never become a filter or safety bypass.
- Staff see one plain-language strategy choice, progressive controls, bounded
  public-safe pickers, the real public-safe preview, literal summaries, safe
  strategy conversion, and non-drag ordering actions.
- D12 owns private revision recovery and concurrency. D1 owns publication and
  D13 reproof. ADR-0160's Public Page Windows may slice only the resolved
  deterministic sequence.
- No global feature/hide flags, curation tables, query language, multiple-source
  composition, ranking engine, private preview, copied result set, or runtime
  history mutation is introduced.

## Rejected alternatives

- automatic-only lists, which would push one-off Page needs into fake source
  tags, dates, or global feature fields;
- a strict automatic-versus-manual split, which would force staff to freeze
  membership merely to lead or hide one item;
- a general hybrid collection builder with weights, Boolean rules, nested or
  multiple sources, personalization, recommendations, or AI ranking;
- provider-native relationships, raw source IDs, source-record flags, browser
  scope, privileged provider reads, or cache entries as product authority; and
- drag-only ordering, silent mode conversion, inactive-field residue, silent
  truncation, out-of-filter features, exact-choice substitution, or read-time
  migration.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- strict `curation@1` normalization, validation, export, successor migration,
  retained readers, and unknown-version/field rejection;
- deterministic property and conformance tests for all strategies, exclusions,
  feature order, automatic tail, exact-choice order, final limit, deduplication,
  ties, nulls, refill, shrinkage, and lifecycle changes;
- cross-Tenant/environment/Site/locale/audience/source denial and public-safe
  candidate, preview, release, runtime, cache, Payload, and Supabase behavior;
- D12 concurrent edit, reorder, strategy conversion, autosave, undo, restore and
  lost-acknowledgement behavior plus D1/D13 reproof, CAS, rollback, and retained
  generation compatibility;
- bounded server-paged search, batch resolution, source query plans, indexes,
  maximum over-fetch, Page composition and concurrent-Tenant load without N+1
  reads or unbounded work;
- keyboard, screen-reader, focus, touch, single-pointer non-drag reorder,
  320-pixel reflow, zoom, forced colors, localization, RTL/CJK, reduced-motion,
  settled-status and representative nonprofit-staff usability proof; and
- PII-free cause telemetry that distinguishes intentional empty, all-hidden,
  inactive, invalid, unavailable, incompatible, unauthorized, and failed
  outcomes.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D15 primary-source research, UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d15-content-list-curation-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0151 — Semantic Ordinary Section Catalog and additive bounded composition seam](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0152 — Family-qualified semantic Reusable Sections](./0152-family-qualified-semantic-reusable-sections.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0157 — Exact-revision Scheduled Publication Appointments through D1](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and source-discriminated Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0160 — Link-native Public Page Windows and bounded list discovery](./0160-link-native-public-page-windows-and-bounded-list-discovery.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
