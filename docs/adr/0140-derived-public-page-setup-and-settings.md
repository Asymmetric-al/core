# ADR-0140: Derived Public Page setup and settings over source-owned configuration versions

**Status:** Accepted (founder-ratified Phase 22 D23 C-prime-R, 2026-08-14)

## Context

After D21 establishes one Public Ministry surface authority and D22 provides a
quiet operational workspace, an authorized tenant administrator still needs a
clear place to understand and change Public Page defaults. Those defaults do
not share one scope, lifecycle, or owner. D2 owns Publication Reach, D3/D20 own
family presentation, D4/D5 own review/release behavior, and other settled
owners independently govern progress seeds, Ministry Update audience seeds,
responses, discovery, measurement, and optional writing assistance.

A universal settings table or global form would duplicate those owners and
misstate missing fallbacks, Off choices, built-in defaults, creation seeds, and
unavailable capabilities as interchangeable. The current repository's hard-
coded `org-settings` route, untyped `tenants.org_settings` JSON, coarse role
checks, and simulated settings success are concrete anti-patterns rather than a
base to extend.

## Decision

Adopt the exact founder-ratified Phase 22 D23 C-prime-R formulation:

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, scope-first,
> permission-filtered, disposable Public Page Setup & Settings Projection in
> Mission Control over—and never instead of—the exact current source-owned
> immutable configuration versions established by D2–D20 and Phase 21 D10. A
> finite code-owned adapter catalog may summarize D2 Publication Reach;
> D3/D20 Missionary and Project/Campaign Presentation Profiles; D4/D5 Review &
> Release; D6 creation-only progress seeds; D11 Ministry Update audience
> seeds; D12 Supporter Responses; D13 Discovery; D15 Measurement; and D16's
> independently owned `public-profile drafting` AI capability availability,
> without storing or exposing a provider key. D7 Giving, D8 lifecycle, D9
> media safety, D14 search and sharing, D17 subject, D19 people and access,
> D18 runtime delivery, D21 surface adoption, and D22 operations remain
> per-item, automatic, or separately owned workflows rather than D23 settings.**
>
> **D23 owns only its finite presentation-and-routing descriptor catalog,
> permission-safe derived summary, setup guidance, navigation, and UI
> composition. Every descriptor identifies one exact owner and compatible
> adapter generation; source version and current head; internally complete
> Tenant, Legal Entity, environment, Site, and only applicable Page Family,
> locale, or publication-path dimensions; read and change capabilities;
> owner-supplied consequences and effective/through-time; and one literal
> owner action. The projection distinguishes `Organization choice`, `Built-in
default`, `Safe fallback — not yet chosen`, `Default for new items`, `Off`,
> `Unavailable`, `Partial`, `Unknown`, and `Not applicable` rather than
> collapsing them into a value. It cannot define or inherit a policy, infer a
> tenant choice from absence, copy a profile, reinterpret an owner default, or
> store mutable configuration, readiness, completion, health, or activation
> truth.**
>
> **First setup keeps the exact authorized organization, Legal Entity,
> environment, Site, and locale context visible and URL-addressable and
> foregrounds only the deliberate
> choices needed to begin safely: `Who can find new Missionary pages?`, `Who
can find new Project pages?`, and `Should staff review contributor changes?`.
> Missing D2 choices say that new release requests remain Not public; missing
> D4 choice says staff review remains required. Neither fallback is presented
> as an organization choice. One collapsed `Safe defaults already in use`
> summary explains built-in, Off, unavailable, and still-unset behavior without
> a completion percentage, success wall, or forced tour. Ongoing use keeps the
> same scope-first surface and four calm groups: `Visibility and publishing`,
> `Page appearance and discovery`, `Optional features`, and `Chosen on each
page`. Each row states `Current choice`, `Source`, `Applies to`, `What this
changes`, `What this does not change`, `Existing content`, and authorized
> last-change evidence, followed by one uniquely named action such as `Change
Project page reach`. D6 and D11 seeds are labelled for new items only; final
> D6 progress, D7 Giving, D11 audience where deliberately changed per Update,
> D17 subject, and D19 people and access remain explicitly page- or
> Update-owned.**
>
> **Each `Change` action opens one prepopulated, single-column,
> owner-specific form using plain-language choices, contextual help, and one
> exact `What will change / What will not change / Who and when` consequence
> review with descriptive commit copy. Saving invokes only the owning domain's
> current command after server-side reproof of actor, capability, complete
> scope, source head, prerequisites, and consequence evidence; validates one
> typed request; creates one prospective immutable successor; compare-and-swap
> advances the complete-scope owner head; and records owner audit and
> transactional occurrence evidence atomically under a content-bound
> idempotency key. Authoritative readback, not an optimistic toast, confirms
> the exact new choice and effect. Stale or concurrent work shows the current
> value beside the attempted value and never overwrites it; a timeout or
> ambiguous result says `We couldn't confirm whether this changed` and
> inspects owner truth before retry. `Use this choice again` creates a new
> successor instead of rolling history backward. Separate changes have
> separate outcomes—there is no fictional cross-owner atomic save or rollback.**
>
> **The authenticated summary is server-composed and private/no-store by
> default. Authorization and exact scope resolution occur before rows, labels,
> options, counts, history, previews, deep links, timing differences, or caches
> are composed. Exposed Supabase objects use explicit least-privilege grants,
> indexed default-deny RLS, complete same-scope constraints, and
> security-invoker views; any privileged helper remains server-confined in an
> unexposed schema with pinned `search_path` and public execution revoked. A
> browser service role, user-editable or stale JWT metadata, Payload
> preference, raw `tenants.org_settings`, prior URL, or last-viewed scope is
> never authority. If measured scale later requires materialization, that
> projection remains disposable and is partitioned by complete scope,
> authorization epoch, adapter generation, and owner-head digest; commands
> still re-read current owner truth. One unavailable source degrades only its
> row, shows last-confirmed coverage where safe, and never becomes blank,
> zero, Off, default, or success. D23 failure never blocks public serving or a
> direct owner workflow.**
>
> **Configuration remains separate from consequence: D2/D4 and each owner
> alone determine prospective effects; D21 alone prepares and starts the
> complete public surface; D22 alone presents operational work; D2's sole
> release command executes only D4/D5's settled release outcome; and Phase 10
> remains the non-waivable live safety ceiling. D23 may
> offer `Continue preparing pages` only as a clearly separate D21 link and may
> offer production-equivalent presentation preview only where its owner permits
> it; neither is proof of publication. Healthy optional settings stay collapsed
> and readable-but-not-changeable settings explain the responsible owner
> without a disabled fake control. The localized experience uses native
> controls, visible labels, fieldsets and legends, error summary plus inline
> errors, unsaved-change protection, stable deep links and return context,
> keyboard and screen-reader operation, restrained status announcements,
> non-color meaning, mobile/320-CSS-pixel reflow, 200% text, 400% zoom,
> unobscured focus, touch targets, forced colors, reduced motion, RTL, and long
> locale proof—without a universal settings blob, generic mutation endpoint,
> inheritance maze, arbitrary settings or workflow DSL, global `Save all`,
> tenant-wide enable switch, instant consequential toggle, implicit default,
> bulk apply/reset, retroactive propagation, mutable restore, destructive undo,
> blind retry, stale overwrite, cross-scope cache, raw-table or CMS authority,
> duplicated AI/provider configuration, persistent setup checklist, second
> review/release/activation/operations authority, or any claim that configured,
> selected, saved, profile-active, page-prepared, approved, released, publicly
> reachable, indexed, Giving-ready, operationally healthy, cut over, converged,
> donated, settled, or paid are the same fact.**

The projection has no authoritative configuration relation. It composes finite
versioned owner descriptors and supplies presentation, scope navigation, and
safe owner-command routing only. Canonical versions, heads, histories,
consequences, and commands stay with their owners.

## Later Phase 22 D27 qualification

D27 makes D3 presentation a Site × Page Family setting rather than a Page- or
locale-scoped setting. D23 SHALL summarize exactly one current Missionary
Ministry profile head and one current Project/Campaign profile head for the Site
when those families apply. It MUST NOT offer or imply a per-Page profile,
per-locale design, copied layout, inheritance choice, synchronization control,
bulk locale action, or exception override.

The D23 presentation row and owner form SHALL use the literal label **Page
design — all languages**, show the exact affected Page and language counts,
preview representative responsive, long-text, RTL, empty, unavailable, media,
and safety cases, and explain **What will change / What will not change** before
the one D3 action. A compatible successor states that Page wording, media
meaning, reach, review status, attestation, Giving destinations, and locale
release heads will not change. The ordinary Page editor separately labels
locale work **Content — this language**; that editor remains outside D23's
configuration authority.

The D3 owner command may activate a compatible family successor only after its
complete current cohort has been shadow-compiled and its immutable activation
manifest pins the Site × family coordination epoch and exact D2
release-head-set digest. Final reproof and one short idempotent compare-and-swap
advance the family head all at once. D23 displays the owner-supplied consequence
and authoritative readback but owns neither compatibility, cohort coverage,
activation, artifacts, nor retry. A concurrent D2 locale release invalidates
stale proof; D23 MUST show the owner conflict rather than optimistic success.

A migration-required change leaves the prior family generation current and D23
routes only exact cause-owned exceptions to their existing D1/D2/D4/D5/D9/D20
workflows. D23 does not create a mass-republish tool, Page task, locale fallback,
translation, release, second activation state, or cross-owner transaction.
Single-locale Sites hide locale machinery, and the built-in accessible family
defaults require no forced design step.

## Consequences

### Positive

- Staff see one plain-language, scope-explicit setup and amendment experience
  without learning Phase codes or finding settings in many modules.
- Safe fallbacks, built-in defaults, explicit choices, creation seeds, Off, and
  unavailable capabilities remain truthfully distinct.
- One owner action at a time makes immutable successor versioning easy without
  introducing global last-write-wins mutation.
- Exact changed/unchanged consequences prevent setup from being mistaken for
  publication, activation, Giving, or retroactive Page mutation.
- Server-first authorization and private composition protect Tenant, Legal
  Entity, Site, locale, and restricted-worker boundaries.
- D23 can be rebuilt or unavailable without changing source settings, public
  serving, or direct owner workflows.

### Costs and constraints

- Every participating owner needs a stable semantic read descriptor,
  consequence preflight, immutable version/head contract, idempotent CAS
  command, and audit/transactional occurrence evidence.
- Phase 2 exact Site/Legal Entity scope and Phase 12 fine-grained capabilities
  are genuine runtime prerequisites; coarse Tenant roles are insufficient.
- Owner adapters, state meanings, scope handling, and consequence copy require
  exhaustive compatibility and negative-authority tests.
- Legacy settings rows and UI need a complete census, explicit disposition,
  shadow comparison, and one reader cutover without dual write.
- Representative accessibility, localization, comprehension, concurrency,
  isolation, and production-shaped query-plan proof is required before use.

## Rejected alternatives

### Universal settings table or JSON blob

Rejected because owner scopes, defaults, versions, effects, and permissions are
not interchangeable. A generic blob would lose structural integrity and become
a second policy authority.

### One giant wizard or global Save all

Rejected because cross-owner changes cannot honestly be one transaction or one
rollback. It also exposes optional complexity and makes partial success unsafe.

### Mutable switches and reset-to-default

Rejected because consequential changes need exact scope/effect review, CAS,
authoritative readback, and immutable successor history. “Default” has several
different meanings and cannot be a generic reset target.

### Per-Page settings matrix

Rejected because Giving, subject, access, final progress, and Update audience
belong to exact Page/Update workflows. D23 may link to them but cannot create a
global impersonation or bulk mutation surface.

### Setup as activation/readiness

Rejected because D21 alone owns complete-surface adoption and cutover. D23 can
link to preparation but cannot compute readiness, release content, or start the
public reader.

### Reusing D22 operations or generic tasks

Rejected because configuration summaries and source-owned profile changes are
not operational causes or task-resolution truth. D22 remains the separate
ongoing work projection.

## Runtime certification

Before runtime certification, an implementation must pass all
owner/non-authority, state-semantic, complete-scope RLS/grant/cache,
current-capability, concurrency/idempotency/ambiguous-outcome, prospective-
effect, dependency-failure, migration, query-plan/load, observability,
accessibility/localization, and staff teach-back gates recorded in D23.

Ratification of this planning decision authorizes no implementation,
migration, notification, issue publication, or production activation.

## References

- [Phase 22 ratified D23 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d23--how-does-an-authorized-tenant-admin-set-up-and-later-change-public-page-defaults-without-guesswork-or-a-second-source-of-truth)
- [Phase 22 ratified D23 research evidence](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#46-ratified-d23-research--derived-public-page-setup-and-settings)
- [ADR-0138 — Complete Public Ministry Surface authority cutover](./0138-complete-public-ministry-surface-authority-cutover.md)
- [ADR-0139 — Derived Public Page operations with cause-owned actions](./0139-derived-public-page-operations-with-cause-owned-actions.md)
