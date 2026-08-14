# ADR-0137: Two Bounded Page Family Semantic Catalogs

**Status:** Accepted (founder ruling, Phase 22 D20, 2026-08-13)

## Context

Missionary Ministry Pages and Project/Campaign Pages need enough tenant control
to reflect different ministries without turning contributors into web designers
or allowing presentation to redefine identity, safety, progress, Giving, media,
Updates, search, or runtime truth. D3 already establishes two
non-interchangeable, immutable Public Page Presentation Profile families, but it
does not enumerate the concrete semantic sections that ship at launch.

The existing implementation is not that contract. Both page families currently
share one generic freely sortable Payload block list containing author-controlled
CTA URLs, FAQ, impact-stat, and testimonial blocks. Its mutable templates,
duplicated serializers, divergent preview/public renderers, and UI-only
`readOnly` hints cannot establish family semantics, source ownership,
contributor authority, or immutable release compatibility. Reusing that generic
list would make “flexibility” a public-safety, migration, and maintenance hazard.

## Decision

Adopt the complete Phase 22 D20 C-prime-R ruling:

> **C-prime-amended-and-hardened (C-prime-R) — two small,
> non-interchangeable, immutable, code-owned Page Family Semantic Catalog
> Generations under D3: one for Missionary Ministry Pages and one for
> Project/Campaign Pages, each declaring stable semantic section and slot
> identities, exact source and edit authority, required or bounded-optional
> cardinality, certified placement zone, locale behavior, accessibility and
> performance limits, and deterministic empty, unavailable, invalid, and
> withdrawn outcomes. The Missionary catalog contains managed public identity;
> optional introduction, ministry story, ministry focus, and prayer focus; D9
> media; optional D6 support progress; one required D7-managed Give semantic
> role whose certified placements share the one Page Giving Binding;
> one bounded D11 Ministry Updates feed; and locked organization stewardship
> disclosure and help. The Project/Campaign catalog contains managed project
> identity; optional project summary, need, planned work, and editorial
> expected-impact statements; D9 media; optional D6 project progress; one
> required D7-managed Give semantic role whose certified placements share the
> one Page Giving Binding; one exactly bound D11 project update feed;
> and locked organization stewardship disclosure and help. D3's prospective
> Tenant × Legal Entity × Site × Page Family Presentation Profile Version alone
> chooses whether each optional editorial section is Off, Available, or Expected,
> its bounded order within certified zones, and whether it is contributor-editable
> or staff-only; Expected is private completeness guidance and never fabricates a
> public placeholder. A page may add or remove only offered optional sections,
> while a distinct shell remains a complete certified same-family D3 profile
> selection rather than an override. Contributors use a quiet five-group Basics,
> Story, Media, Support & giving, and Updates form with managed facts plainly
> read-only, exact responsive preview, recoverable autosave, semantic review
> feedback, and one D4-correct Submit for review or Publish changes action; staff
> use two compact family setup surfaces with safe defaults, consequence preview,
> and prospective activation. Every D2 release pins the exact catalog, renderer,
> profile, content, locale, brand, and managed-reference generations; unknown,
> incompatible, unauthorized, stale, or over-budget input blocks the new
> candidate and preserves the last certified release. D20 owns only catalog and
> editorial-slot semantics: D6 progress, D7 Giving, D9 media, D11 Updates, D14
> search/share, D16 assistance, D18 freshness/cache, D19 subject/participants,
> Phase 10 safety, and D1/D2/D4/D5 authority remain independently
> authoritative—without a generic cross-family builder, tenant schema or
> workflow DSL, arbitrary layout or nesting, raw HTML/CSS/JavaScript,
> iframe/embed, form, query, free CTA URL, testimonial, free-form statistic
> counter, exact-location map, page-derived managed truth, UI-only authorization,
> silent forbidden-field discard, destructive removal or rollback, implicit
> locale fallback, or any claim that editing, saving, previewing, approving,
> releasing, reaching the public, Giving readiness, source freshness, or cache
> propagation are the same fact.**

The founder-ratified quote's environment-less D3 tuple and its `managed project
identity` and `project update feed` phrases are historical family shorthand.
D27 makes the current activation scope Tenant × Legal Entity × environment ×
Site × Page Family. The current Project/Campaign contract uses D17's kind-
qualified subject identity for a CRM Ministry Project, Giving Campaign, or
eligible Designation and one explicit Page-scoped D3 Feed Binding. A source-
kind-incompatible identity field or feed is unavailable; the renderer never
fabricates project semantics, infers an Update subject, or relabels a Campaign
or Designation as a CRM Project.

The Missionary Ministry Page launch catalog contains these semantic roles:

1. one required, managed public identity and hero;
2. optional Introduction;
3. optional Ministry story;
4. optional Ministry focus;
5. optional Prayer focus;
6. bounded D9-approved media;
7. optional D6 Support progress;
8. one required D7-managed Give role;
9. one optional bounded D11 Ministry Updates feed; and
10. required organization stewardship, disclosure, and help.

The Project/Campaign Page launch catalog contains these semantic roles:

1. one required, managed D17 kind-qualified public subject identity and hero;
2. optional Project summary;
3. optional The need;
4. optional What this project will do;
5. optional bounded prospective Expected-impact statements;
6. bounded D9-approved media;
7. optional D6 Project progress;
8. one required D7-managed Give role;
9. one optional D11 Updates feed selected by D3's Page-scoped Feed Binding and
   exact subject/purpose scope; and
10. required organization stewardship, disclosure, and help.

Every top-level semantic role is required or zero-to-one. Focus, impact, and
media roles may contain small code-bounded internal lists. An optional editorial
role is `Off`, `Available`, or `Expected` in one immutable D3 profile version;
`Expected` means private authoring and review guidance, never a public placeholder
or fabricated content. The same profile may make an eligible editorial role
staff-only or editable by exact D1-assigned contributors. Managed roles remain
read-only references to their owning domains.

The contributor experience is content-only and task-oriented: **Basics**,
**Story**, **Media**, **Support & giving**, and **Updates**. Managed values appear
as source-labelled summaries rather than disabled inputs. Autosave, preview,
review feedback, conflict recovery, and the final D4 action remain explicit and
accessible. The staff experience starts with one accessible built-in default per
family and exposes only bounded optionality, edit ownership, certified treatments,
and non-drag-only ordering inside certified zones. Draft profile or catalog
changes never alter the live presentation. A fully proved D27-compatible D3
successor may recompose the complete current cohort without content
republication; any catalog, semantic, locale, media, renderer, or otherwise
incompatible change remains on the D2 migration/release path.

No launch catalog includes generic FAQ, testimonial, arbitrary statistic or
counter, map or exact location, form, carousel, arbitrary video or iframe,
custom HTML/CSS/JavaScript, free CTA URL, alternate Designation, manually entered
progress, tenant query or condition, free nesting, or custom responsive design.
A demonstrated future need requires a new code-certified catalog generation,
compatibility behavior, migration proof, and production certification.

## Consequences

- Tenants can choose which relevant story sections to offer and who may edit
  them without creating per-page schemas or forcing ordinary tenants through
  setup.
- Contributors edit ministry content in plain language while source-owned facts
  remain visibly and structurally separate.
- Preview, release, and public serving must consume one family-qualified semantic
  contract and renderer generation. Unknown, wrong-family, duplicate,
  over-cardinality, stale, unauthorized, or invalid input blocks the candidate
  and preserves the last certified release.
- Existing generic Payload pages, templates, blocks, version tables, fixtures,
  and routes require explicit `adopt`, `transform`, `quarantine`, compatible
  legacy-renderer, or `retire` dispositions. A legacy heading, CTA URL, statistic,
  profile ID, or fund ID never establishes a D20 role or managed authority.
- Accessibility applies to both the authoring tool and its public output:
  keyboard and non-drag operation, status/error announcements, focus recovery,
  accessible preview, alt/decorative decisions, caption/transcript gates,
  semantic headings, zoom/reflow, touch targets, RTL, and long locales require
  production proof.
- Payload and Lexical remain implementation substrates behind Asym's semantic
  command, catalog, compiler, and renderer boundaries; their Admin UI, locks,
  Local API defaults, or service-role possession are never product authority.
- D21's readers-before-writers adoption ordering is private preparation only;
  it never creates page-by-page public rollout or dual readers. A compatible
  legacy disposition means one frozen D2 release whose proved-safe editorial
  payload has been normalized into a family-qualified public DTO and pins the
  exact D20 catalog, profile, compatibility renderer, content, locale, brand,
  and managed-reference generations. It is served only by the sole Phase 5/D18
  gateway, performs no request-time raw Payload read, and cannot accept a new
  compatible-legacy release after cohort cutover. The next edit creates an
  ordinary current-catalog successor.

## Later Phase 22 D27 qualification

D27 narrows D3/D20 presentation variability to one current Missionary Ministry
profile and one current Project/Campaign profile per exact Tenant × Legal Entity
× environment × Site. The applicable family profile and code-owned catalog
generation govern every Page and locale in that family. D20 cannot recreate the
removed D3 exact-Page exception through optional sections, copied shell data,
locale schemas, role order, empty-state choices, or another catalog head.

`Off`, `Available`, and `Expected`, certified-zone order, and staff-only versus
exact-contributor editability remain D3 family-profile choices shared across
the Site. A particular Page or locale may leave an offered optional editorial
role empty, and D6/D7/D9/D11 may independently be unavailable, without changing
the shared structure or fabricating content. Author-written title, narrative,
semantic slot content, caption, and alternative text remain independently
versioned and released per Page × locale.

Every D2 release keeps its exact release-time catalog/profile/renderer pins as
immutable baseline and historical evidence. The separately current D3 family
activation selects current presentation, and D18 resolves both. A compatible
profile successor may recompose the complete current Page × locale cohort
without content republication only after the Site × family coordination epoch,
exact D2 release-head-set digest, catalog/renderer compatibility, and coherent
artifacts are proved and rechecked at one all-or-nothing D3 compare-and-swap.
Any catalog change, semantic exposure, removed role, cardinality change,
locale-behavior change, media-contract change, or incompatible renderer remains
migration-required and preserves the prior generation until exact locale
release dispositions are complete.

The UX boundary is therefore literal: staff use **Page design — all
languages** for the one D3 family choice, while contributors and staff use
**Content — this language** for locale editorial work. Neither action grants
the authority of the other, and exact-locale public reads never use implicit
provider fallback.

## Considered options

### One generic cross-family page builder

Rejected. It exposes irrelevant choices, creates condition-heavy schemas,
permits unsafe combinations, and makes certification and migration combinatorial.

### Tenant-authored schemas, custom blocks, or workflow DSLs

Rejected. They create a second CMS product, permission system, and public attack
surface while allowing presentation configuration to drift from owning-domain
truth.

### Two small code-owned semantic catalogs with bounded profile choices

Accepted. This supplies meaningful organizational flexibility and a calm
contributor experience while keeping family meaning, source ownership, release
compatibility, public safety, and accessibility certifiable.

## Related decisions

- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
  — typed Page families and explicit contributor authority
- [ADR-0120](./0120-family-certified-public-page-presentation-profiles.md) —
  immutable family-certified presentation profiles and catalog generations
- [ADR-0123](./0123-page-resolved-source-authoritative-public-support-progress.md)
  — independently authoritative public progress
- [ADR-0124](./0124-one-exact-page-giving-binding-for-phase22-mvp.md) — one
  exact Page Giving Binding
- [ADR-0126](./0126-release-bound-public-ministry-media-assets.md) — D9 public
  media authority
- [ADR-0128](./0128-canonical-ministry-update-audience-release-projections.md)
  — canonical Ministry Updates and exact feed bindings
- [ADR-0134](./0134-exact-typed-public-page-subject-bindings.md) — exact typed
  Project/Campaign subjects
- [ADR-0135](./0135-release-bound-public-ministry-runtime-composition.md) —
  release-bound runtime composition
- [ADR-0136](./0136-organization-owned-ministry-assignments-and-separated-support-access.md)
  — organization-owned Missionary Ministry subjects
- [ADR-0138](./0138-complete-public-ministry-surface-authority-cutover.md) —
  complete-surface adoption and sole reader cutover
- [Phase 22 D20 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d20--which-semantic-sections-ship-in-each-public-ministry-page-family)
- [Phase 22 D20 research](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#43-ratified-d20-research--two-small-code-owned-page-family-semantic-catalogs-under-d3)
