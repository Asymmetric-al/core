# ADR-0165: Asym-owned, reference-aware recoverable Trash with private restoration and proof-gated purge

**Status:** Accepted (founder-ratified Phase 23 D21 C-prime-R, 2026-08-23)

## Context

Phase 23 needs a forgiving removal lifecycle for ordinary Pages and Articles.
Ministry staff may work intermittently, yet removal can affect every locale,
public route, Navigation target, schedule, public list, search projection,
sitemap, cache, and social preview. A provider-level `deletedAt` flag cannot
prove that those independently owned projections have safely converged.

Core's exact Payload 4 pin provides useful Trash persistence, read-only
provider views, restore, permanent deletion, bulk actions, and Empty Trash.
The same stock surface exposes a permanent-delete bypass, restore-as-published
paths, raw endpoints, and one coarse delete access decision. Current Core Page
deletion is Tenant-scoped rather than the exact Site, environment, lifecycle,
capability, reference, and public-safety boundary D21 requires.

D21 therefore establishes one small Asym-owned source lifecycle over
replaceable provider machinery: a 90-day minimum recovery window, adverse-
first withdrawal, no cascade, private-only restoration, proof-gated purge,
truthful health, and calm ministry-staff UX.

## Decision

> **C-prime-R — Asym-owned, reference-aware recoverable Trash with private
> restoration and proof-gated purge.** Phase 23 shall provide one recoverable
> Trash lifecycle for each stable ordinary `Page` or `Article` identity in one
> exact Tenant × environment × Site. Trash applies to the whole identity and
> every locale variant together. Locale-specific withdrawal remains a release
> or publication action, not a second Trash model. Phase 22 specialized public
> ministry pages and Phase 29 media-binary disposal remain outside D21.
>
> Trash, unpublish, archive, and permanent purge shall remain visibly and
> semantically distinct. **Unpublish** removes a release from public service
> while leaving the identity in ordinary editorial work. **Archive** is a
> recoverable editorial classification when an owning decision defines it.
> **Move to Trash** removes the identity from ordinary work and starts its
> recovery lifecycle. **Permanently delete** irreversibly removes eligible
> content bodies and versions while preserving only the minimal non-content
> tombstone, route disposition, and audit evidence required by their owners.
> Trash shall never be presented as a synonym for unpublish or archive.
>
> A successful **Move to Trash** command shall atomically establish the source
> fact that the identity is trashed and therefore immediately ineligible for
> favorable public service. Existing D1 owners shall then remove or suppress
> every affected public release, locale, route, public Navigation target, Dynamic
> Content List result, public search document, sitemap entry, cached
> projection, social preview, and scheduled publication adverse-first. A
> downstream failure shall leave the source safely trashed, expose cause-coded
> **Removal needs attention** health, and remain retryable. It shall never keep
> serving content, resurrect it, or report full completion merely because the
> provider row acquired `deletedAt`.
> Adverse suppression shall not rewrite a D4 authored or released Navigation
> Revision. It preserves the stable target reference and creates cause-owned
> repair debt; the next favorable Site Plan release must resolve or deliberately
> remove that reference before activation.
>
> Moving content to Trash shall not cascade into referenced or child Pages,
> Articles, folders, Topics, navigation definitions, schedules, media records, or media
> binaries. Before the command, Asym shall derive a bounded impact preview from
> current source owners. For an unpublished and unreferenced draft, the action
> may complete directly with a persistent **Moved to Trash — Undo** status. For
> anything public, scheduled, linked, or otherwise consequential, one calm
> confirmation shall name the content, say **This takes every language version
> offline**, and summarize current routes, navigation, schedules, and other
> affected surfaces. Its actions shall be **Cancel** and **Take offline and move
> to Trash**. Unknown or truncated impact blocks the command; it is not treated
> as no impact. A required Site root/home replacement or D2 hierarchy repair
> also blocks ordinary Trash and names the existing cause-owned next action;
> D21 never fabricates a replacement, reparents child Pages, or leaves an
> invalid Site generation. At launch, each command handles one identity; there is no bulk
> move, bulk restore, bulk purge, select-all-across-results, or **Empty Trash**.
> The command shall also respect D12's active-editor fence: it requires a clean,
> saved expected revision and cannot remove an identity held by another valid
> editor lease. The actor is directed to coordinate or use the separately
> authorized unpublish path for urgent public withdrawal; Trash never discards
> unsaved work or overrides an active editor by guessing that a lease is stale.
>
> Trash shall be a quiet staff-only Content Library destination, not another
> permanent navigation hierarchy. Ordinary lists, D20 Saved Library Views,
> public queries, and favorable release builders exclude trashed identities by
> construction. The dedicated Trash list shall show only identities the current
> actor may currently inspect in the exact Site and shall provide search plus
> bounded family/status filters. Each row shall show title, Page or Article,
> who moved it, when, a plain recovery message, and one derived status:
> **Recoverable**, **Removal needs attention**, **Review required**, or
> **Eligible for permanent deletion**. A simple draft shall say **Protected from
> permanent deletion until <date>**, never falsely promise deletion on that
> date. Ever-released, referenced, held, or unresolved content shall instead say
> **No automatic deletion — review required**. A detail
> view shall be read-only but retain authorized versions, locale coverage,
> references, public-removal health, route disposition, and audit history.
> **Undo** appears only for the direct move of a never-released private draft and
> means restoring that draft privately. An ever-released identity never offers a
> generic Undo that could imply republication; its action is always **Restore as
> draft**.
>
> Every identity shall have one code-owned minimum recovery window of 90 complete
> days from the authoritative server timestamp. Tenant administrators cannot
> shorten it, and daylight-saving or browser clocks cannot change it. After the
> window, automatic purge may process only a never-released, currently
> unreferenced, unheld draft whose exact scope, identity revision, access-neutral
> purge policy, references, route state, schedules, and deletion convergence are
> all re-proven at execution. A failed or uncertain proof leaves it in Trash as
> **Review required**. Ever-released, referenced, held, or deletion-debt-bearing
> content is never automatically purged. D21 creates no tenant retention matrix,
> general legal-hold product, or promise that backups are synchronously erased;
> policy-specific retention or erasure remains with its source owner.
>
> **Restore as draft** shall preserve the stable content identity, attribution,
> versions, locale content, folder and Topic assignments, and surviving
> references, but shall create or select a private working revision. Restore
> shall never republish, reschedule, recache, reindex, recreate a social preview,
> or reinsert navigation. It shall not imply that previous public-removal debt is
> repaired. The former path remains governed by D2/D3 route authority. D3
> historical path reservation normally prevents a collision. If legacy or
> corrupt data, or an explicitly authorized route transfer, nevertheless creates
> one, restore blocks as an exceptional repair with **Choose a new path** or the
> authorized route-resolution flow; the system never steals a path, silently
> changes a slug, or restores under an invented URL.
> Restoring while another actor changed, purged, or restored the identity fails
> safely and offers **Refresh status**.
> The minimal route claim/disposition survives permanent content purge and the
> stable identity is never recycled, so a later Page cannot silently inherit the
> old URL or history.
>
> **Permanently delete** shall be a separate Phase 12 semantic capability and
> an Asym-owned command, not Payload's ordinary delete checkbox. It shall appear
> only after the minimum window and current eligibility proof, and only to a
> capability holder. One irreversible confirmation shall state exactly what
> content and version history will be removed, what minimal evidence remains,
> and that restoration will no longer be possible. Focus starts on **Cancel**;
> the destructive action is labeled **Permanently delete**. D21 shall not require
> typing a title or `DELETE` at launch: authorization, eligibility proof, clear
> consequences, separated action placement, and confirmation provide protection
> without ritual friction. Purge shall never reuse the stable identity, infer a
> redirect, delete shared media, or erase required audit and route evidence.
> Current stable references, a required Site root/home role, unresolved hierarchy,
> or any adverse-convergence debt shall block purge until its owning workflow
> resolves the cause.
> Permanent purge also blocks until every current source reference—including
> authored Navigation repair debt—is resolved by its owner; purge cannot make a
> dangling reference disappear by deleting its evidence.
>
> Every Trash command shall derive Tenant, environment, Site, actor, capability,
> identity, expected revision, and authoritative time on the server; use
> idempotency and compare-and-set; recheck current authorization and lifecycle;
> and append immutable cause attribution. Provider Local API calls acting for a
> user shall preserve that user context and shall not use privileged access as
> product authorization. A wrong-Site, wrong-Tenant, wrong-environment, missing,
> or unauthorized identity returns one non-enumerating unavailable result. Trash
> visibility, counts, references, audit projections, job payloads, logs, traces,
> and alerts shall not expose content or cross-scope existence.
>
> Payload 4 Trash may supply `deletedAt`, trashed-document querying, read-only
> provider views, and provider persistence only behind this replaceable product
> boundary. The stock permanent-delete bypass, **Empty Trash**, bulk permanent
> deletion, one coarse `delete` access decision, raw Trash endpoints, and stock
> UI shall not become Asym authority. Repository and provider upgrades must pass
> contract tests proving non-trash queries exclude trashed identities, all
> locale data survives move and private restore, versions cannot be restored
> while trashed, provider access cannot bypass Asym commands, and provider
> errors never become false success.
>
> The staff experience shall use plain ministry language, progressive
> disclosure, Core semantic colors and components, comfortable touch targets,
> and no legalistic or frightening copy. Established shared Base UI primitives
> shall own dialog, menu, focus, and keyboard behavior; D21 shall not invent ARIA
> replicas or an app-local component system. Reversible move/restore results shall
> be persistent and programmatically announced without stealing focus.
> Consequential and irreversible dialogs shall follow the modal-dialog pattern:
> keyboard focus contained inside, Escape and visible Cancel available before
> commitment, initial focus on the least destructive action, and logical focus
> restoration after completion. Loading, impact unavailable, permission denial,
> conflict, path collision, downstream-removal debt, restore success, purge
> eligibility, purge failure, and purge success shall each be visually and
> programmatically distinct and never toast-only. The complete flow shall work
> with keyboard, screen reader, touch, 200% zoom, 320-CSS-pixel reflow, reduced
> motion, slow networks, and session expiry.
>
> D21 shall not add a generic lifecycle engine, customizable Trash stages,
> tenant-set retention rules, recycle-bin folders, approval workflow, restore
> wizard, Trash-aware Saved Views, content-body tombstone archive, or media
> garbage collector. It authorizes no implementation. Activation requires the
> proof matrix below and production-shaped usability testing with both frequent
> communications staff and occasional ministry administrators.

## Binding interpretation

1. **Trash is a whole-identity lifecycle.** One ordinary Page or Article and
   all of its locale variants move together inside one exact Tenant ×
   environment × Site. Locale-only withdrawal remains publication work.
2. **The source fact fails safe.** Once moved, the identity is immediately
   ineligible for favorable service; every public projection converges
   adverse-first and exposes retryable debt instead of false completion.
3. **Trash never cascades.** Child and referencing content, Navigation
   history, schedules, folders, Topics, media records, and media binaries keep
   their own authority and lifecycle.
4. **Four verbs remain distinct.** Unpublish, archive, Move to Trash, and
   permanently delete have separate meaning, copy, authorization, and audit
   causes.
5. **Recovery is protected for 90 days.** Only a re-proven never-released,
   unreferenced, unheld private draft may purge automatically afterward.
   Consequential or uncertain content requires explicit review and authority.
6. **Restore is private.** Restore as draft preserves identity and history but
   never republishes, reschedules, reindexes, recaches, or repairs references
   by implication.
7. **Purge is exceptional.** It requires a distinct Phase 12 capability,
   current proof, one irreversible confirmation, resolved references, and a
   minimal non-content tombstone and route disposition.
8. **Scope and authorization are server-derived.** Every view, count, impact
   preview, command, job, audit projection, and result rechecks current exact
   scope without privileged Local API becoming product authority.
9. **Payload remains replaceable machinery.** Its `deletedAt` persistence may
   be used behind an Asym adapter; its stock bypass, Empty Trash, bulk
   permanent deletion, raw endpoints, coarse delete access, and UI are not
   product authority.
10. **Launch remains intentionally bounded.** One-item commands, one quiet
    Trash surface, four derived statuses, no tenant retention matrix, no
    generic lifecycle engine, no restore wizard, and no media garbage
    collector.

## Source-of-truth boundaries

| Fact                                                                                                                    | Authority after D21               | D21 rule                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Ordinary Page or Article Trash source state, recovery timing, private restore, purge eligibility, and minimal tombstone | D21                               | Stable exact-scope lifecycle; no provider or projection may invent it.                                                         |
| Public Site Generation and favorable/adverse service                                                                    | D1 and Phase 10                   | D21 makes content ineligible; existing owners withdraw adverse-first and prove convergence.                                    |
| Hierarchy, current and historical paths, replacements, redirects, and 404/410 disposition                               | D2 and D3                         | Trash cannot reparent, steal, recycle, silently mutate, or invent a path.                                                      |
| Authored and released Navigation revisions                                                                              | D4                                | Public targets suppress adverse-first; authored history remains and unresolved repair debt blocks favorable release and purge. |
| Working revision, autosave, active editor, and conflict fencing                                                         | D12                               | Trash requires a clean expected revision and respects the active-editor lease.                                                 |
| Scheduled publication appointments                                                                                      | D13                               | Trash invalidates favorable execution; schedules cannot resurrect the identity.                                                |
| Dynamic Content List and public-search membership                                                                       | D14 and D17                       | Trashed identities are absent; deletion lag is visible and reconciled.                                                         |
| Content Library folders, Topics, and Saved Library Views                                                                | D18, D19, and D20                 | They organize, classify, or filter; none owns or expands Trash lifecycle.                                                      |
| Media records and binaries                                                                                              | Existing media owner and Phase 29 | D21 never cascades into or garbage-collects media.                                                                             |
| Capabilities and current access                                                                                         | Phase 12 and Phase 10             | Move, restore, and purge remain distinct and visibility ceilings continue to apply.                                            |
| Payload `deletedAt`, queries, versions, and provider views                                                              | Payload adapter                   | Replaceable persistence detail after exact-pin conformance only.                                                               |

## Consequences

- Occasional ministry staff receive the familiar everyday sequence **Move to
  Trash → inspect → Restore as draft**, while irreversible deletion remains
  rare, separate, and capability-gated.
- A simple private draft can be recovered immediately with private Undo;
  public, scheduled, or referenced content receives a calm current-impact
  review without exposing a dependency graph.
- Staff never receive a green success state while a public projection is still
  silently favorable; unresolved removal appears as a truthful, cause-owned
  status with a recovery path.
- All locale variants move together, preventing partially deleted identities
  and eliminating a second locale-level Trash model.
- Ninety protected days fit intermittent nonprofit staffing without creating a
  tenant-configurable retention product. The date is a minimum protection
  boundary, not a promise of deletion.
- Restore cannot surprise staff or donors by republishing, rescheduling,
  indexing, caching, or reinserting Navigation.
- Stable references, routes, and minimal evidence survive purge, preventing
  identity reuse, dangling-reference erasure, and invented redirects.
- The operational cost is concentrated in bounded reconciliation and proof;
  routine staff do not maintain jobs, repair database rows, or interpret
  provider internals.
- Exact-scope, concurrency, accessibility, migration, provider-drift, and
  production-capacity proof become activation prerequisites.

## Adversarial disposition

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                                                              | Severity | Likelihood without hardening | Evidence or reasoning                                                                                                                                           | Permanent prevention                                                                                                                                                                                                              |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | A single `deletedAt` flag can appear safe while navigation, schedules, caches, search, or a locale still serves the identity. Restore can also fail after a path transfer or schema change.                                                                         | Critical | High                         | Payload models provider Trash, while D1/D2/D3/D13/D17 own separate serving facts and adverse convergence.                                                       | Treat Trash as a source lifecycle command with adverse-first projections, explicit route ownership, retryable health, stable identity, and contract tests across every consumer.                                                  |
| Technical debt                    | **Yes**           | Enabling stock Trash would spread provider verbs, one coarse delete permission, raw endpoints, and cleanup assumptions through product code. A custom general workflow engine would create the opposite debt.                                                       | High     | High                         | Current Pages use broad `tenantScopedDeleteAccess`; pinned Payload exposes stock bypass and Empty Trash.                                                        | Keep one small Asym command/DTO/capability boundary over Payload primitives; prohibit raw provider product surfaces; add no generic lifecycle engine or tenant rule builder.                                                      |
| Edge cases                        | **Yes**           | Staff can trash the last homepage, a multi-locale identity, a page under active edit, a scheduled revision, a referenced Page, an item already trashed/restored, an item whose route was transferred, or an item during Site activation.                            | Critical | High                         | These are ordinary consequences of D1 Site Plan releases, D2/D3 routes, D12 active editor, D13 schedules, D14 lists, D17 search, and D18/D19 relationships.     | Explicit lifecycle matrix, current preflight, CAS, idempotency, whole-identity semantics, schedule invalidation, route conflict handling, and race/failpoint tests.                                                               |
| Footguns                          | **Yes**           | Ambiguous Delete copy, a nearby permanent checkbox, bulk Empty Trash, browser-clock countdowns, or silent cascade can destroy content or mislead staff.                                                                                                             | Critical | High                         | Payload's stock UI exposes the checkbox and Empty Trash; W3C treats irreversible deletion as confirmation-worthy.                                               | Exact verbs, private restore, server time, no launch bulk/Empty Trash, no cascade, least-destructive initial focus, one explicit purge confirmation, and no false completion.                                                     |
| Tenant safety                     | **Yes**           | A privileged Local API call, caller-supplied Site ID, related-record filter, count, reference preview, or audit detail could expose another Tenant/Site or authorize a cross-scope action.                                                                          | Critical | Medium–High                  | Current Payload connection is privileged and current Page access is Tenant-only, not exact Site/environment capability authority.                               | Server-derived exact scope, structural constraints, capability checks, `overrideAccess: false` for user-bound Local API, non-enumerating errors, and negative cross-scope tests for every read/count/action.                      |
| Overengineering                   | **Yes**           | Custom retention matrices, recycle-bin folders, approval stages, legal-hold UI, restore wizards, granular locale Trash, and Trash-aware Saved Views would burden staff and database before evidence exists.                                                         | High     | Medium–High                  | The founder asked for safety without needless complexity; current comparable CMSs use simple dedicated recovery surfaces.                                       | One code-owned 90-day window, four derived statuses, one detail view, one capability for purge, and explicit launch exclusions. Add only measured needs later.                                                                    |
| UX/UI and user friction           | **Yes**           | Occasional staff may confuse unpublish, archive, Trash, and purge; dense dependency graphs, confirmation on every draft, toast-only results, hidden Trash, or ritual title typing can cause mistakes and abandonment.                                               | High     | High                         | CMS comparables use dedicated Trash; W3C distinguishes reversible recovery from irreversible confirmation and requires accessible focus/status behavior.        | Four fixed verbs, progressive preflight, direct reversible draft move with Undo, consequence-based public-content dialog, plain statuses, quiet Trash entry, persistent recovery, and ministry-staff usability tests.             |
| Hidden coupling                   | **Yes**           | Trash logic embedded separately in navigation, schedules, search, sitemap, cache, media, and route handlers will drift; a provider upgrade can change query inclusion.                                                                                              | Critical | High                         | D1 already centralizes release authority and the pinned provider implements non-Trash filtering internally.                                                     | One lifecycle event/source fact and registered consumer contracts; owners derive projections; adapter conformance tests; no consumer writes lifecycle state back.                                                                 |
| Failure modes                     | **Yes**           | Database commit may succeed while withdrawal, audit, or job dispatch fails; a lost response may cause retry; purge may partially remove versions; restore may return success while remaining invisible or conflicted.                                               | Critical | Medium–High                  | Distributed projections are not transactionally identical to the source write; pinned stock count handling can hide errors.                                     | Source-first safe state, outbox/idempotency, CAS, state-specific receipts, no false success, retry/reconciliation, purge transaction or compensating quarantine, and staff-visible health.                                        |
| Data integrity risks              | **Yes**           | Identity reuse, orphan versions, duplicate restore, stale references, slug theft, partial locale survival, or recursive deletion can corrupt meaning and reporting.                                                                                                 | Critical | Medium–High                  | Payload retains versions/locales but route/reference semantics belong to Asym; Contentstack documents dependency-sensitive restore scenarios.                   | Never-reused identity, route ledger, whole-identity move, non-cascade, reference proof, exact-revision commands, private working restore, tombstone, and integrity constraints/tests.                                             |
| Security and privacy risks        | **Yes**           | Trash can become a covert archive of sensitive ministry content; unauthorized staff may discover titles, routes, history, references, thumbnails, or actor identities after losing access. Logs may retain content.                                                 | Critical | Medium                       | Payload can include Trash through `trash: true`; history/detail remain accessible subject to provider access; restricted ministry content needs current policy. | Reapply current Phase 10 and Phase 12 access to every projection, omit thumbnails/snippets unless authorized, non-enumerating failures, privacy-safe telemetry, audit projection rules, and prompt revocation effects.            |
| Scalability and performance risks | **Yes**           | Preflight can fan out across locales, references, schedules, indexes, and cached surfaces; indefinite complex Trash and unindexed `deletedAt` queries can slow lists and jobs.                                                                                      | High     | Medium                       | D21 crosses several bounded owners; provider stock count queries all Trash; public consequential content may remain indefinitely.                               | Bounded summary queries, indexed scope/lifecycle/time keys, count ceilings, stable pagination, batched reconciliation, no N+1 references, purge backpressure, and production-shaped plans.                                        |
| Operational burden                | **Yes**           | Staff or developers could manually reconcile stuck removals, explain opaque purge blockers, clean abandoned drafts, or restore from backups. A noisy Trash badge can create unnecessary work.                                                                       | High     | Medium–High                  | Downstream convergence and reference changes are expected; backups are not an editor recovery UX.                                                               | Automatic retry/reconciliation, derived blocker text with one owner/action, safe automatic purge only for simple drafts, quiet attention badge, runbook, and no routine developer database edits.                                 |
| Observability gaps                | **Yes**           | Teams may not know content is still cached/indexed, purge is blocked, a job stalled, or cross-scope probes are occurring. A zero count could mean provider failure.                                                                                                 | Critical | High                         | D17 already identifies deletion health as operationally important; pinned Empty Trash converts fetch failure to zero.                                           | Cause-coded metrics and traces for source age, projection lag, retries, blockers, scope denials, and purge outcomes; staff-facing status separated from operator detail; no content in telemetry.                                 |
| Dependency and integration risks  | **Yes**           | Payload may change Trash access arguments, query defaults, UI routes, version behavior, or Local API semantics; search/CDN integrations may acknowledge before actual removal.                                                                                      | High     | Medium                       | Core runs an internal Payload v4 pin; current behavior differs from a complete Asym lifecycle.                                                                  | Exact-pin tests plus upgrade conformance, adapter boundary, no stock UI authority, consumer acknowledgements with reconciliation, and neutral lifecycle export.                                                                   |
| Migration and upgrade risks       | **Yes**           | Adding `deletedAt` can change default queries and indexes; existing hard-deleted records have no recovery history; rollback can accidentally expose trashed rows; future CMS migration can lose tombstones.                                                         | Critical | Medium                       | Payload appends non-Trash filters when enabled; this is a material query semantic change.                                                                       | Expand/backfill/verify/activate migration, dual-read darkness tests, explicit rollback behavior that keeps Trash ineligible, neutral export/import of lifecycle/tombstones, and no inferred recovery for historical hard deletes. |
| Other development hazards         | **Yes**           | Double clicks, two actors, auto-purge racing restore, stale eligibility, session expiry, job replay, clock skew, partial deploy, or weak tests can delete or resurrect the wrong identity. Ownership between product, search, route, and operations may be unclear. | Critical | Medium–High                  | Every destructive asynchronous lifecycle has ordinary concurrency and rollout races.                                                                            | Server time, idempotency keys, expected revision, transactional lock/lease for purge, deployment kill switch, explicit owner matrix, race/failpoint/property tests, and reversible activation.                                    |

Every category has a material concern because D21 coordinates a destructive source
state with several independently owned public projections. The result is not a
reason to add more workflow. It is a reason to keep the product contract narrow
and make its few boundaries exact.

## Ratified synthesis

### Must be fixed before activation

1. **Establish exact scope and source authority.** Ordinary Page and Article
   identities must carry exact Tenant × environment × Site ownership, stable
   identity, revision, Trash lifecycle, and server timestamps before any UI is
   enabled.
2. **Separate the four lifecycle verbs.** Define source-owned unpublish, archive,
   Move to Trash, and permanent purge semantics and enforce their labels across
   list, editor, commands, audit, API, and support tooling.
3. **Build the Asym command boundary.** Separate move, restore-as-draft, and purge
   capabilities; add server-derived scope, current access, CAS, idempotency,
   cause attribution, non-enumerating errors, and no Local API bypass.
4. **Wire adverse-first consequences through existing owners.** D1/D2/D3/D13/
   D14/D17/navigation/cache/sitemap/social consumers must suppress safely,
   acknowledge, retry, and expose unresolved debt without being allowed to
   resurrect the identity.
5. **Prove non-cascade and reference safety.** Trash cannot delete folders,
   Topics, references, schedules, or media. Preflight must be bounded, current,
   and blocking when unknown. Route collision and replacement behavior must use
   existing route authority.
6. **Deliver the calm Core-owned UX.** Direct reversible draft move, impact-aware
   consequential confirmation, quiet Trash list, read-only detail, Restore as
   draft, rare separated purge, persistent statuses, responsive accessibility,
   and no stock checkbox/Empty Trash.
7. **Implement the bounded retention policy.** Use the authoritative 90-day window;
   auto-purge only re-proven never-released simple drafts; keep consequential or
   uncertain content for explicit review; preserve tombstones.
8. **Qualify the exact Payload pin and migration.** Prove query exclusion,
   locales, versions, access, restore, failure, schema/index plans, rollback
   darkness, and upgrade conformance at `4.0.0-internal.1f9ae9a`.
9. **Test the dangerous races before release.** Purge-versus-restore,
   trash-versus-publish, schedule-versus-trash, Site activation, path transfer,
   lost response, job replay, partial projection failure, cross-scope probes,
   and staged-deploy rollback must all fail safe.

### Address soon after activation

- Conduct moderated task tests with frequent communications staff, occasional
  ministry administrators, and a restricted-ministry reviewer. Measure whether
  they choose unpublish versus Trash correctly, understand private restoration,
  locate a removed item, interpret removal debt, and stop an accidental purge.
- Review blocked-purge age and causes, route conflicts, restore completion,
  accidental-move Undo use, and support contacts before changing retention or
  enabling any bulk action.
- Add an operator runbook for stuck adverse convergence and eligibility repair;
  staff UX should expose only the consequence and next action.

### Monitor without adding launch complexity

- move/restore/purge command latency, conflict, retry, and idempotent replay;
- age from source Trash to removal acknowledgement by projection owner;
- counts and oldest age for **Removal needs attention** and **Review required**;
- automatic-purge candidates, successes, proof failures, and queue backpressure;
- path collisions, schedule invalidations, and unexpected reference growth;
- cross-scope and unauthorized attempts without content or existence details;
- Trash volume, list/query plans, retention storage, and provider drift; and
- accessibility/usability regressions, Undo rate, and wrong-action support cases.

## Rejected alternatives

- direct permanent deletion with no recovery;
- exposing Payload Trash, its stock permanent-delete bypass, Empty Trash, bulk
  permanent deletion, raw endpoints, or one coarse delete capability as the
  Asym product;
- treating `deletedAt` as proof that routes, Navigation, schedules, search,
  sitemap, caches, social previews, and every locale have converged;
- using one ambiguous Delete action for unpublish, archive, Trash, and purge;
- restoring to the previously published state, schedule, cache, search index,
  Navigation placement, or social preview;
- cascading Trash or purge into child/referencing content, folders, Topics,
  schedules, Navigation history, media records, or binaries;
- locale-only Trash, homepage or child reparenting by implication, path theft,
  automatic homepage redirects, identity recycling, or silent slug mutation;
- browser-clock retention, timer-only purge, blanket age-based purge, or
  claiming that backup erasure is synchronous;
- tenant-defined retention matrices, recycle-bin folders, approval stages,
  legal-hold UI, restore wizards, Trash-aware Saved Views, or a generic
  lifecycle engine at launch;
- bulk move, bulk restore, bulk purge, select-all-across-results, or Empty
  Trash at launch;
- toast-only success, false zero counts, destructive initial focus, ritual
  title typing, graph-first impact UI, or mouse-only actions; and
- privileged Local API, client-supplied scope, related-record filtering, or
  logs containing content as authorization or isolation.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must satisfy every gate below.

| Gate                       | Required evidence                                                                                                                                                                                                                | Rejects                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Semantic darkness          | Unpublish, archive, Trash, restore, and purge produce distinct source states, copy, commands, audit causes, and UI; no alias or fallback conflates them.                                                                         | One overloaded Delete/Status field or provider semantics as product truth.           |
| Exact isolation            | Wrong Tenant, environment, Site, actor, role/capability, and revoked-access tests cannot view Trash existence, counts, title, references, history, previews, audit, or act.                                                      | Client scope, Tenant-only filter, related-record inference, or privileged Local API. |
| Adverse-first service      | On move, every locale becomes immediately ineligible; route, navigation, dynamic list, search, sitemap, cache, social, and scheduled-release tests converge or show retryable debt.                                              | `deletedAt` success while public content remains silently favorable.                 |
| Active-editor safety       | Own dirty state, autosave in flight, another valid editor lease, expired lease, session loss, and urgent-unpublish tests prove Trash never discards unsaved work or overrides D12.                                               | Stale browser action trashing another editor's work.                                 |
| Navigation history         | A trashed target disappears from public Navigation adverse-first while the D4 authored/released revision and stable reference remain; the next favorable release blocks until repair, and purge blocks on unresolved references. | Silent mutation of authored history or purge erasing repair debt.                    |
| Non-cascade                | Moving, restoring, and purging cannot delete or mutate child/referencing Pages, folders, Topics, navigation, references, schedules, media records, or binaries outside their owner's explicit command.                           | Database cascade or hook side effects as lifecycle policy.                           |
| Impact preflight           | Simple draft bypass, consequential summary, unknown/truncated block, changing references, and permission-redacted detail behave as specified under bounds.                                                                       | Empty impact inferred from timeout, truncation, or denied reads.                     |
| Restore privacy            | Restore preserves identity/locales/history/assignments but yields private working state; it does not publish, schedule, index, cache, navigate, or clear unrelated debt.                                                         | “Return to original state” causing surprise republication.                           |
| Route safety               | Trashed path claim/disposition, legitimate replacement, 301, 404/410, transfer, collision, and restore conflict obey D2/D3 without homepage redirect, theft, or silent slug mutation.                                            | Trash inventing route authority.                                                     |
| Retention and purge        | Server-time 90-day boundary, DST/clock skew, simple-draft proof, ever-released block, reference/hold/debt block, lost response, retry, concurrent restore, partial failure, and tombstone pass.                                  | Timer-only hard delete, blanket purge, or false completion.                          |
| Payload exact pin          | `trash: true`, default exclusion, query opt-in, localized drafts, read-only detail, versions, differentiated provider access, schema/indexes, stock UI bypass suppression, and Local/REST behavior pass at the exact pin.        | Documentation alone or stock UI treated as sufficient.                               |
| Migration and rollback     | Existing rows remain active, Trash queries/indexes are production-safe, activation is reversible, rollback cannot re-expose Trash, and neutral export/import preserves stable lifecycle/tombstones.                              | One-step schema/UI enablement.                                                       |
| Accessibility              | Keyboard, screen reader, touch, 200% zoom, 320px reflow, reduced motion, slow connection, and session-expiry tests pass; dialog focus and persistent live status behave as specified.                                            | Mouse-only rows, toast-only outcome, destructive initial focus, inaccessible modal.  |
| Ministry usability         | Representative staff correctly choose unpublish vs Trash, understand every-language withdrawal and private restore, locate and recover an item, read blockers, and safely complete/abort purge without coaching.                 | Expert-only provider vocabulary or graph-first impact UI.                            |
| Failure containment        | Database, audit, outbox, worker, search, CDN, and provider failpoints preserve safe source state, local context, retryability, and truthful receipts; no duplicate or resurrected identity.                                      | Partial success hidden behind one green toast.                                       |
| Performance and capacity   | Production-shaped indexes, bounded preflight, stable pagination, non-Trash query regression, queue backpressure, purge batch, and no-N+1 reference proof pass at forecast scale.                                                 | Full-graph scans, unbounded counts, or synchronous fan-out on button press.          |
| Observability and recovery | Cause-coded staff health, operator metrics/traces, oldest-age alerts, reconciliation, and runbook recover each simulated fault without logging content.                                                                          | Generic CMS error, count-zero-on-failure, or manual database repair as routine.      |

## References

- [Phase 23 D21 research, exact-provider audit, nonprofit UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d21-trash-restore-retention-research.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0147 — Generation-bound automatic ordinary Page route continuity](./0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [ADR-0148 — Curated Navigation Revisions under coherent Site Generations](./0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [ADR-0156 — Bounded editorial working revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0157 — Exact-revision scheduled publication appointments through D1](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0161 — Derived Public Site Search Projection and adverse-first convergence](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0162 — Purpose-bounded, authority-free Content Library folders](./0162-purpose-bounded-authority-free-content-library-folders.md)
- [ADR-0164 — Bounded personal and Site-shared Saved Library Views](./0164-bounded-personal-and-site-shared-saved-library-views.md)
- [Payload Trash](https://payloadcms.com/docs/trash/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Pinned Payload Trash tests](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/trash/e2e.spec.ts)
- [Contentstack Trash](https://www.contentstack.com/docs/headless-cms/about-trash)
- [HubSpot deleted-record recovery](https://knowledge.hubspot.com/records/restore-deleted-records)
- [Google removed-page guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [W3C confirmation technique G168](https://www.w3.org/WAI/WCAG22/Techniques/general/G168)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
