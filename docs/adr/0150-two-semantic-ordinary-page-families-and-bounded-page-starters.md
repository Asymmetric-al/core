# ADR-0150: Two semantic ordinary Page families and bounded Page Starters

**Status:** Accepted (founder-ratified Phase 23 D6 B-prime-R, 2026-08-21)

## Context

ADR-0145 makes semantic family an immutable fact on one stable Site-scoped
Page, but deliberately does not choose the Phase-23-owned family catalog. The
current CMS mixes `standard`, `missionary_giving`, and `project` through an
open mutable `pageType`, copies mutable template layouts, and exposes open
public shapes. One universal optional-field type would hide Article behavior
inside conventions; a family for every layout would multiply schemas,
authoring choices, migrations, and renderers. Modern CMS and nonprofit-product
evidence consistently supports a small Page-versus-Article distinction while
showing that the word “template” can mean incompatible one-time, live-shared,
or schema-deployment behavior.

## Decision

> **B-prime-amended-and-hardened (B-prime-R) — Two code-owned semantic
> ordinary Page families with bounded, auditable Page Starters:**
> Phase 23 owns exactly **General Page** (`general_page`, presented to staff as
> **Page**) and **Article** (`article`, presented as **Article**) under D1's one
> stable Site-scoped Page and coherent Public Site Generation contract. Family
> is selected by durable behavior rather than appearance, is immutable in
> ordinary editing, and never absorbs Phase 22-owned Missionary,
> Project/Campaign, or Ministry Update content; Phase 10 remains the
> publication-safety ceiling for every ordinary Page and Article. Page owns
> individually placed, non-stream ordinary content and may be a Site root or
> hierarchy parent; Article owns repeatable dated editorial content, is a
> hierarchy leaf, and is eligible—but not automatically entitled—for later
> chronological discovery, while its exact fields, taxonomy, listing, feed,
> scheduling, SEO, search, and public metadata remain with later bounded
> decisions. One quiet Content workspace asks **Page or Article?** only when
> context has not already established the family, uses short behavioral
> examples, follows with only a small accessible set of exact family-compatible
> Site-authorized **Page Starters**, skips redundant choices, keeps family
> visibly read-only, and exposes focused family-specific editors with clear
> saving, draft, conflict, preview, and release states. A Page Starter is an
> Asym-owned, provider-neutral, exact-version one-time seed applied atomically
> and idempotently to one independent draft after actor, Tenant, environment,
> Site, locale, family, permission, schema, D2 placement/path reservation,
> starter, and referenced-dependency reproof; its typed content receives fresh
> Page-local instance IDs; immutable starter ID plus exact version/digest
> remains inert provenance, and later starter edits or retirement never mutate
> existing Pages. D1 release proof pins the closed family contract and
> compatible compiler/renderer; unknown, stale, cross-family, cross-scope, or
> incompatible input fails the candidate with a cause-owned exception while
> the prior public generation and recoverable draft remain intact. Audit actor,
> approved public byline, editorial display date, first-live release time,
> later-live update time, and technical timestamps remain distinct; no editor
> identity is made public and no chronology is derived from `createdAt` or
> `updatedAt`. Every authoring, preview, version, restore, copy, import, export,
> conversion, migration, and public-projection operation is server-enforced for
> exact scope and current authority; Payload Local API bypass defaults are
> never treated as security, Supabase RLS is never claimed to protect Payload's
> privileged direct-Postgres connection, and D6 does not decide one versus two
> provider collections. A mistaken unreleased draft may be discarded and
> safely recreated; a released family correction requires an explicit
> permissioned, impact-proved migration or create-and-replace operation. Legacy
> Pages, templates, drafts/versions, serializers, references, and Phase
> 22-shaped rows receive one complete, non-overlapping
> adopt/transform/quarantine/retire disposition, shadow proof, and one authority
> cutover. Unknowns quarantine; no title, slug, date, layout, or starter is used
> to infer family. The design includes no open family strings, tenant-authored
> schemas, a family per layout, mutable starter inheritance, client-only
> validation, silent fallback or block dropping, destructive restart,
> ordinary-edit family conversion, editor-derived public authorship, dual Phase
> 22 authority, dual public heads, heuristic migration, or speculative
> feed/search/workflow infrastructure.

## Consequences

- `general_page` and `article` are the complete launch catalog; staff see Page
  and Article rather than provider or machine values.
- Page owns individually placed non-stream content and may be structural;
  Article owns repeatable dated editorial semantics and remains a hierarchy
  leaf. Article existence does not itself ship a feed, archive, taxonomy,
  search, SEO, scheduling, notification, or byline model.
- Family is required and immutable during ordinary editing. A real released
  correction is an explicit proof-gated migration or create-and-replace
  operation, not a dropdown.
- Page Starters are exact one-time seeds with inert provenance. They never
  become shared reuse, live inheritance, family authority, or a second public
  head.
- Phase 22 retains Missionary, Project/Campaign, and Ministry Update authority;
  Phase 10 remains the public-safety ceiling.
- Asym owns the provider-neutral family and starter contract. Payload collection
  topology and exact starter implementation remain qualified adapter choices.
- Every legacy record receives one exact disposition before one authority
  cutover; ambiguous values fail closed and quarantine.

## Rejected alternatives

- one universal optional-field Page that infers Article behavior from layout,
  starter, URL, or timestamps;
- a family for every purpose, presentation, or staff label;
- tenant-authored schemas, open family strings, mutable template inheritance,
  or an ordinary family-conversion control;
- treating Payload collection layout, Local API defaults, or an unshipped
  Templates API as product authority; and
- allowing a generic Article to recreate or bypass Phase 22 content and
  contributor contracts.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, release activation, or
production change.

## References

- [Phase 23 D6 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d6--two-semantic-ordinary-page-families-with-bounded-page-starters)
- [Phase 23 D6 adversarial evidence](../prds/sitestacker-parity/phase-23-d6-ordinary-page-family-research-evidence.md)
- [Phase 23 D6 modern CMS primary-source research](../prds/sitestacker-parity/phase-23-d6-modern-cms-primary-source-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
