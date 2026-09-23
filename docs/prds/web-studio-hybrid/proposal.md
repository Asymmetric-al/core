Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-proposal"></a>

# Proposal — Hybrid visual and code-based Web Studio

**Change ID:** `add-web-studio-hybrid-contracts`

**Status:** September 22 roadmap planning contract; runtime remains unimplemented and qualification-gated. Exact predecessor amendments are recorded in [the adoption map](adoption-map.md).

**Basis:** R01 user-confirmed direction; R02–R17 repository evidence; E01–E33 official sources in [the evidence register](evidence.md#web-evidence).

<a id="web-h-why"></a>

## Why

Staff need to create and maintain websites without a developer for ordinary work. Developers need real source control, custom presentation freedom, predictable component contracts, reliable preview and a supported delivery path. These requirements are compatible only when source, content, design settings and public release state have explicit ownership.

The current admin editor still consumes Payload's form/publication components (R04). The Phase 23 plan already describes stronger product-owned editing and publication contracts (R05–R09). This change implements the connective hybrid-authoring layer on those owners rather than another CMS.

<a id="web-h-confirmed-versus-proposed"></a>

## Confirmed versus proposed

Confirmed by the user: one custom Asym interface; Payload private; visual-first, code-first and mixed workflows; ministry-controlled custom source; no help-desk modeling; preferred developer tools supported.

The September 22 roadmap supplies the planning profile for bounded containers, Git source binding, isolated composition, the developer project, native automation and qualification limits. HA-A1–HA-A4 are reconciled in the owning Phase 23/24 clauses and [decision register](decisions.md). Exact capability keys, software cohort and provider/deployment profiles still require implementation qualification; neither this planning adoption nor the original research claims runtime admission.

<a id="web-h-goals-and-product-outcomes"></a>

## Goals and product outcomes

1. A visual-first user can produce the agreed Page classes without first creating a repository or hiring a developer for each layout.
2. A professional developer can work from normal source files with a fresh clone, reproducible dependencies, typechecking, tests, responsive preview and Git review.
3. Moving between these modes preserves canonical content, supported settings and editor independence.
4. Every consequential effect has one source owner, exact inputs, current authorization and a truthful result.
5. Ordinary edits remain possible during GitHub/build-service outages against retained compatible qualified packages.
6. The product makes room for future richer design without corrupting v1 data or promising arbitrary-code round-tripping.

<a id="web-h-people-and-authority"></a>

## People and authority

**Content editor:** edits authorized values and approved composition; no source or publishing permission inferred.

**Site designer:** configures supported layouts, variants and proposed appearance; cannot change canonical routes, giving truth or schemas.

**Developer/maintainer:** controls authorized source in the ministry repository; may inspect approved package fixtures and development evidence.

**Reviewer/publisher:** reviews exact authorized candidates and invokes the applicable existing release operation.

**Platform qualifier:** controls trusted package/cohort admission. It is not an automatic extension of Tenant administration.

These are workflow personas, not hardcoded role names. Phase 12 capability decisions are authoritative. Small teams may hold several capabilities when policy permits; do not impose two-person review on every content edit.

<a id="web-h-in-scope"></a>

## In scope

Asym-native content editing, click-to-edit, Page composition, qualified layout containers, bounded appearance settings, root-only reuse, exact-locale work, media/reference selection, developer contract/SDK, GitHub connection and delivery, real preview, independent qualification, publication handoff, schedule integration, compatibility migrations, dependency impact, meaningful history, safe retries, incident-free ordinary recovery, handoff documentation and an external-agent development guide.

Public forms, media, navigation, topics, search and specialized ministry pages are integrated through their existing Phase 23/22 owners. The hybrid surface does not introduce another form schema, media database, redirect engine or operational query language.

<a id="web-h-explicit-non-goals"></a>

## Explicit non-goals

A Webflow feature-complete clone; arbitrary DOM/CSS coordinates in content; unrestricted server actions; tenant-defined operational schemas; a plugin marketplace; customer Core forks; runtime source evaluation; direct Payload API product access; public personalized CMS audiences; two authoritative content copies; multiwriter CRDT collaboration; offline publication; hosted IDE/agent/BYOK as a prerequisite; a separate help desk; Git issue automation; independently hosted frontends in the initial profile.

<a id="web-h-amendment-register"></a>

## Amendment register

<a id="web-h-ha-a1-d7-bounded-composition-successor"></a>

### HA-A1 — D7 bounded composition successor

Add `asym.page-composition/2` for ordinary Pages only. Preserve v1 and its identity/reuse rules. Admit Stack, Split and Grid with exact slot, depth, node, variant and a11y constraints defined in [UX/composition](ux-and-composition.md#web-visual-composition). A Page author explicitly chooses this profile; imports/migrations do not silently wrap or reorder old content. Article remains the existing bounded prose-first family. Specialized Phase 22 resources retain their owner-defined grammar. Theme-wide settings remain Phase 24-owned. D7 renderer/schema migration and D32 advisory-versus-invariant boundaries remain binding.

<a id="web-h-ha-a2-d9-source-author-extension"></a>

### HA-A2 — D9 source-author extension

An authorized ministry may retain its repository and appoint qualified maintainers. This authoring channel submits exact source, not tenant-uploaded executable production bundles. Every package still passes existing independent admission and uses the serialized public view model/capability boundary. Source ownership is distinct from source licensing and runtime/publication authority. No required Asym IDE and no second Git-generated CMS.

<a id="web-h-ha-a3-product-owned-composer"></a>

### HA-A3 — product-owned composer

Use one replaceable visual adapter over Asym documents and typed operations. Puck core is the leading adapter candidate; 0.23.0 was the source package’s dated September 12 evaluation version, not a dependency pin approved by this document. Rediscover and qualify the actual coherent cohort. The core UI remains Base Maia/Base UI/Zinc. Custom rendering is separated from privileged admin origin; all writes cross the existing actor-bound operation layer. Required package facts and controls are declarative; no package-supplied form renderer or script is dynamically evaluated in the trusted shell.

<a id="web-h-ha-a4-repository-to-admission-delivery"></a>

### HA-A4 — repository-to-admission delivery

Use the qualified Phase 31 GitHub connection minimum and existing execution/artifact owners to prepare code candidates. Preserve D1 release, D9 admission, D10 cohort activation, D12 editing, D13 appointments, D25 review and D30 authority. A merge or green check cannot publish. The initial public runtime integrates admitted source/artifacts through a controlled normal application build; no URL module loader is introduced.

<a id="web-h-minimum-external-owner-contracts"></a>

## Minimum external owner contracts

| Contract                                                          | Owner                         | Needed for                                 |
| ----------------------------------------------------------------- | ----------------------------- | ------------------------------------------ |
| Exact Site/locale/public context and public reader                | Phases 2/5/24                 | Draft scope, preview, public rendering     |
| Current eligibility and adverse suppression                       | Phase 10                      | Data and media before preview/publication  |
| Actor/service capability decisions                                | Phases 3/4/12                 | Every entry point and consequential commit |
| Working revisions, leases, semantic catalog and content operators | Phase 23                      | Visual editor, migrations, saves           |
| Presentation admission, fixed candidate and activation            | Phase 23 with Phase 5         | Custom source and safe design rollout      |
| Immutable media/artifact custody                                  | Phase 29 plus D27             | Renditions, manifests and retention        |
| Source connection/revocation/credential custody                   | Phase 31 minimum              | GitHub integration only                    |
| Existing dispatch ledger and execution                            | Merged workflow orchestration | Durable post-commit work                   |

Whole future phases are not speculative blockers; the exact required owner contract and its real proof are blockers. An owner absent at implementation keeps its dependent action unavailable; it is never fabricated locally.

<a id="web-h-success-measures"></a>

## Success measures

The normative runtime matrix and initial quantitative qualification profile are in [acceptance](acceptance-and-qualification.md#web-acceptance). Editorial handoff must be observed with representative staff, not only the developer demonstrating the interface. Numeric limits here are proposed engineering acceptance targets, not measured performance, vendor promises or customer SLAs.

<a id="web-h-release-and-rollback"></a>

## Release and rollback

Enable capabilities by exact Tenant/Site/profile after proof. Deploy readers before enabling v2 writers. Retain old readers until all referenced history and artifacts have compatible service. Disable new authoring/submission independently from serving safe qualified generations. Restore creates a compatible successor; safety withdrawal takes precedence over availability. Do not roll back by exposing stock Payload Admin or overwriting current content.

---
