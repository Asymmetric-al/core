Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-architecture"></a>

# Design — One content system, two authoring paths

<a id="web-h-architecture-selected-for-this-proposal"></a>

## Architecture selected for this proposal

The application owns product truth. Payload supplies private editorial storage and qualified field/rich-text machinery. Puck supplies a replaceable composition interaction layer. GitHub hosts ministry source. A trusted ingestion/qualification service turns exact source into immutable admitted presentation. Existing D1/D10 activation controls public use. Existing shared Inngest execution runs durable jobs without owning their outcomes. (R06–R11; E01–E25.)

```text
Staff / designer                         Ministry developer
      |                                        |
Asym Web Studio                         Any local/cloud IDE
      |                                        |
Actor-bound content operations           Ministry repository
      |                                        |
Private Payload adapter                  Verified GitHub binding
      |                                        |
Acknowledged content/composition          Exact source capture
      |                                        |
      |                              Isolated clean qualification
      |                                        |
      +-------- fixed compatible candidate ----+
                         |
                Existing release owner
                         |
       Active generation / PublishedContentReader
                         |
                  Public website
```

This is a responsibility diagram, not permission to collapse all boxes into one process.

<a id="web-h-logical-records-and-their-one-owner"></a>

## Logical records and their one owner

| Fact                                                      | Authority                           | Storage arrangement                                              |
| --------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Page/Article identity, editorial revision and composition | Phase 23                            | Qualified Payload-backed private data through Asym operations    |
| Page placement and path                                   | D1/D2                               | Existing separate revision axis                                  |
| Navigation                                                | D4/D5                               | Existing separate semantic revision                              |
| Reusable Section content                                  | D8                                  | Existing same-scope resource, not copied into each Page          |
| Site brand and package settings                           | Phase 24/D9/D10                     | Exact versioned appearance input, separate from Page content     |
| Public safety/eligibility                                 | Phase 10                            | Existing authoritative current projection/control                |
| Source commits/contributor access                         | Ministry repository                 | Git; no editorial content database mirror                        |
| Repository binding and authorization epoch                | Integration owner                   | Asym Postgres typed records                                      |
| Source capture, build attempt, evidence and admission     | Presentation owner                  | Typed product receipts plus immutable qualified bytes            |
| Working lease and operation receipts                      | Existing editorial/operation owners | Exact scoped Postgres transaction state; no second content store |
| Public generation and active heads                        | D1/D10                              | Existing immutable manifest/artifact and atomic head operations  |
| Media bytes/rights/rendition proof                        | Phase 29/D27                        | Existing immutable custody and current Site qualification        |
| Execution status                                          | Product owner                       | Source record/receipt; Inngest run IDs are diagnostics           |

Content and composition are one semantic document at an Editorial revision, not independent autosave streams. Theme-wide appearance is a separate revision axis; a Page autosave does not switch a theme. Package-specific per-instance settings are bounded payloads identified by a settings-schema version and read through an admitted decoder.

<a id="web-h-core-placement"></a>

## Core placement

> **Integration note:** Paths described as proposed remain proposals. Preserve packages/api business ownership, the explicit admin-local Payload adapter exception, and injected dependency direction. A separate composer origin does not automatically require a fourth product app. See [IG-11](../program-roadmap/integration-guide.md#ig-11).

Proposed modules must be reconciled with actual paths at implementation:

- `packages/api/src/cms/` holds provider-neutral commands, catalogs, compiler contracts, authorization composition, integration state and workflow orchestration. Extend existing owners rather than introduce a `web-studio-god-service`.
- `apps/admin/src/cms/` remains the private Payload adapter under the current data-boundary exception. Dependency direction is adapter -> provider-neutral ports, never packages/api -> admin imports. Inject adapter implementations at the application composition root.
- `apps/admin/src/cms-ui/web-studio/` owns product orchestration and route composition; shared UI primitives and reusable editor controls remain `packages/ui`.
- Proposed public SDK package `packages/presentation-sdk` exports only public contract types, deterministic pure rendering helpers and capability adapters. It has no transitive database/env/auth/Payload import.
- A separate composer/preview origin is a deployment boundary, not automatically a fourth product-facing Next app. Select the smallest deployable arrangement that proves origin isolation; update deployment/route contracts explicitly if a new target is necessary.
- The public owner integrates admitted packages into the qualified public runtime through its normal application build and registry; do not assume a new `apps/public` exists. Phase 5 and the current public routes determine the integration path.
- Browser data uses existing collections/hooks where applicable. Authoritative multi-table writes use server commands, never TanStack DB mutation hooks against raw provider tables.

These preserve the current explicit admin-local Payload exception (R11). There is no need to move Payload into donor or missionary bundles.

<a id="web-h-client-state-ownership"></a>

## Client state ownership

TanStack Query owns authorized server projections, receipt status and invalidation. TanStack Table/Virtual support existing list surfaces. TanStack Store may own ephemeral selection/viewport/dialog state. TanStack Form is appropriate for Asym-owned inspectors where it has one authoritative form session; do not wrap a Payload-controlled form in a competing state engine. The compositor produces edit intents over a single working document. No client cache is authority. Clear old-scope caches before showing a newly selected Tenant/Site.

Reuse the qualified Lexical/D11 adapter for prose. Do not introduce Puck's alternative rich-text storage merely to reduce integration effort. Puck field adapters can host the approved prose editor; this exact integration needs qualification.

<a id="web-h-technology-choices-and-evidence"></a>

## Technology choices and evidence

| Component                | Choice                                                                          | What it supplies                                    | What Asym must supply                                                                |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Payload                  | Retain private; exact v4 cohort gate                                            | Content persistence, versions, draft primitives     | Authority, exact transaction and lifecycle wrappers, own UX                          |
| Puck                     | Qualify the current coherent core cohort; 0.23.0 was the dated source candidate | Component composition, slots, outline, visual state | Canonical adapter, permissions, origin isolation, Maia controls, semantic validation |
| Base Maia/Base UI        | Preserve current platform                                                       | Familiar product controls                           | Accessible complete editorial workflow                                               |
| GitHub App               | Initial source integration                                                      | Repository access, revisions and events             | Two-domain binding authorization, capture, reconciliation, safe status               |
| Inngest                  | Reuse existing runtime                                                          | Durable steps and flow control                      | Effect identity, claims, transaction receipts, schedule truth                        |
| Build isolation          | Existing qualified execution provider                                           | Process/container/microVM execution                 | No-production-secret image, egress, limits, source intake, independent checks        |
| TanStack Highlight       | Optional only                                                                   | Read-only excerpts                                  | Redaction, copy/scroll/accessibility; no code editing engine                         |
| Hosted IDE/OpenCode/BYOK | Deferred optional                                                               | Not required for this delivery                      | Separate authorization and product decision if later introduced                      |

MIT core status is not a blanket license declaration for cloud services, transitive packages or ministry assets. Puck's MIT source is verified (E08). Payload's repository advertises MIT, but all exact-cohort license notices must be captured during D34 qualification. Do not require paid enterprise visual editing.

<a id="web-h-alternatives-rejected-with-reasons"></a>

## Alternatives rejected with reasons

**Payload default editor as final product:** useful prototype/reuse, but does not itself satisfy Asym's single authority and independent visual UX.

**Puck Data as an independent canonical document:** violates ownership when stored next to editable Payload data. A deliberate future canonical format adoption could be considered, but this change instead uses a small adapter and provider-neutral schema.

**Freeform CSS/HTML document:** breaks the content/presentation boundary and substantially expands accessibility, migration and security scope.

**Arbitrary customer renderer loaded in admin:** gives presentation code administrative browser context.

**Separate CMS draft per Git branch:** confuses source experiments with editorial truth. Use snapshot fixtures and fixed candidates.

**Source stored in a Payload code field:** loses normal project semantics and invites an executable-data path.

**Provider build success as publication:** cannot prove exact content, current authority, media safety or complete locale coverage.

**Full local IDE hosted by Asym:** unnecessary to prove custom website development.

<a id="web-h-current-versus-target-migration"></a>

## Current-versus-target migration

Current editor imports Payload controls (R04). Replace that path resource-by-resource with an explicit activation switch only after equivalent save, version, validation, localization, references, media and recovery behavior is proved. A resource has one writer at a time. Prior qualified Asym UI or truthful unavailable state is the recovery path; raw Payload Admin is not.

The repo's internal Payload v4 and Next preview pins are evidence, not a production baseline. The dated September 12 source inspection reported public Payload 3.89.0 (E06); rediscover current release evidence during Q01. This package retains D34's v4 direction and refuses to claim that public v3 docs validate internal v4. Qualification gate Q01 specifies the evidence required before using any chosen cohort.

---
