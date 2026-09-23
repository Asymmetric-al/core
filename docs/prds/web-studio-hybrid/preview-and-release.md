Planning contract reconciled on 2026-09-22. Read [package authority and checkpoints](README.md) and [owner amendments](adoption-map.md). Source-era evidence is dated; runtime qualification remains open.

<a id="web-preview-release"></a>

# Preview, publication and change lifecycles

<a id="web-h-preserve-the-existing-release-owners"></a>

## Preserve the existing release owners

D1 owns ordinary public generations, D9 owns presentation admission, D10 owns complete-cohort design activation, D12 owns editorial revisions/leases, D13 owns publication appointments, D25 owns exact private preview, Phase 24 owns Site/locale/brand lifecycle, and Phase 10 owns adverse safety. This package adds consumers and adapters, not another publication authority. These are intended Phase 23 contracts, not claims that every owner is implemented (R05–R09, R15–R17).

<a id="web-h-three-clearly-different-previews"></a>

## Three clearly different previews

| Mode                    | Inputs and purpose                                                                                               | Durability and authority                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Local developer preview | Exact SDK and synthetic/explicitly approved safe fixtures; fast refresh                                          | Disposable. No publication credential or approval claim                                                            |
| Visual working preview  | Current tab's candidate for rapid feedback, clearly labelled unsaved until acknowledged; admitted renderer only  | A visual approximation of work in progress, not review truth. The saved server preview follows D12 acknowledgement |
| Exact review candidate  | Deliberately selected acknowledged revisions, artifact digest, settings, media, routes, locale and compatibility | Immutable, private, complete-or-unavailable D25 candidate. Request-level authorization; never a bearer-ID grant    |

The working canvas may display in-memory edits immediately so typing and arranging remain responsive. **Prepare preview**, intentional navigation requiring a save, scheduling and publication await the exact acknowledged revision or explain why they cannot proceed. A canvas rendering success is not a save receipt.

A candidate does not query `latest`. Later private drafts or source commits do not mutate or automatically invalidate an already selected exact candidate: the interface identifies them as **Not included** and offers an explicit successor preview. Revoked rights/safety, incompatible required contracts, changed selected references, changed required locale cohort or a lost expected-head race invalidate the corresponding readiness. A UI may invite refreshing to newer work but may not silently substitute it.

<a id="web-h-preview-transport-and-isolation"></a>

## Preview transport and isolation

Use a server-authenticated preview gateway and a purpose-scoped composer bridge. The trusted shell retains sign-in, current Asym scope and publish/connection controls. The composer sends bounded edit/selection intents, never receives broad credentials and never independently calls publication. The host validates message origin, window source, channel nonce, sequence, payload size/schema, node membership and current scope. Send with exact `targetOrigin`; never `*` for content-bearing communication (E31).

The composer is a whole client context on an isolated origin. Puck's own same-origin viewport can operate inside it; do not claim its iframe isolates code from the composer (E09, E15). Only independently admitted first-party renderers can receive an authorized editorial projection. Unreviewed source uses separate synthetic development previews. Provider/CMS SDKs, arbitrary URL fetchers and auth state cannot be smuggled into renderer config.

Review candidates are no-store, noindex, authenticated on each request, expiry/revocation-aware, candidate-local for routes and 404s, and side-effect-dark. Forms, Give, messages, subscriptions, analytics, tracking, embeds and consequential downloads are mocked or rendered inert through code-owned preview capabilities. Never execute a real donation to demonstrate visual behavior. Missing candidate targets must not fall through to Live. Scope expiry does not redirect to a potentially different public page.

A general Next Draft Mode cookie, a hard-to-guess URL or `robots` directive alone is not this boundary. Query strings, logs, link previews and referrers must not expose bearer grants. Use the platform-approved preview authentication ceremony and reprove access, not long-lived secret-bearing URLs. HTTP caching and CDN policy are independently tested. No service worker may cache private preview content or intercept privileged application routes.

<a id="web-h-change-class-matrix"></a>

## Change-class matrix

| Change                                 | Draft and review                                                        | Compilation/build                                                                       | Activation                                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Content-only                           | D12 acknowledged exact revision; applicable existing editorial policy   | D1 content/generation compilation; no source build                                      | D1 locale-scoped compatible successor                                                       |
| Visual composition or instance setting | Same D12 axis; grammar and settings validation; exact preview           | D1 compilation using already-admitted implementation                                    | D1; not a hidden Site design switch                                                         |
| Site-wide appearance/theme setting     | Own Phase 24/D9 appearance axis; affected-locale review                 | Validate finite settings and prepare cohort generations; no source build when supported | Existing design/brand owner and D10 where presentation-wide; no implicit content mutation   |
| Executable component/package           | Normal Git review, immutable source capture, independent admission      | Isolated clean build; controlled public-runtime package deployment                      | D10 exact complete locale cohort; deployment alone not activation                           |
| New semantic/catalog/schema meaning    | Owner-approved version and migration plan; fixed compatibility evidence | New shared contract/renderer release and necessary explicit database migration          | Compatible staged owner changes; no runtime tenant DDL or automatic current-content rewrite |

No content path inherits a new universal two-person or manual approval merely because executable code needs independent qualification. Preserve the existing tenant-chosen policy, with current safety and permission floors. Conversely, a tenant's automatic content-publication setting cannot approve previously unqualified executable source.

<a id="web-h-candidate-manifest-conceptual-fields"></a>

## Candidate manifest (conceptual fields)

The existing D25/D1 owner record must bind: Tenant/environment/Site; exact locale(s); source resource/revision selections by their separate axes; semantic/composition profile; admitted presentation artifact and settings digests; current qualification reference; qualified media revisions/renditions; route/navigation/reuse/dynamic intent closure; source-owned safety qualification; compiler/runtime version; current expected serving heads; bounded validation/evidence references; authorizing policy identity; expiry and candidate digest.

Use complete deterministic manifests, not a dependency graph inferred from rendered HTML. Sort/map deterministically and use canonical serialization rules agreed in the owner contract. A hash proves identity/integrity, not correctness or permission. Do not include volatile timestamps in content identity unless semantically required; attributable creation time remains metadata.

<a id="web-h-code-to-public-lifecycle"></a>

## Code-to-public lifecycle

1. **Capture:** resolve the authorized repository selector to exact bytes and immutable identity; store a product receipt.
2. **Build:** execute bounded untrusted build in an isolated environment; no production data or credential.
3. **Qualify:** independent checks bind the exact result to the policy, SDK, catalog, maintainership, safety and quality evidence.
4. **Admit:** existing package owner records an immutable admission. Source authors cannot change this verdict by rewriting their repository checks.
5. **Make available:** controlled public-runtime deployment contains the exact admitted renderer/assets, retaining required old versions. This is code readiness, not a Site release.
6. **Prepare design review:** seal actual-content candidates for every currently public locale and dispositions for enabled nonpublic locales. Reprove all required compatibility and safety.
7. **Authorize:** apply the existing human/design policy to the exact manifest. New public effect cannot be inferred from a Git merge or build status.
8. **Activate:** D10 rechecks scope, policy, cohort, exact heads and evidence, then atomically advances all required heads plus its receipt and convergence intent, or none.
9. **Converge:** cache/search/delivery updates are separately observable. They cannot report an activation that did not commit or overwrite source truth.

Public responses never compile uploaded source, traverse mutable Payload drafts or select a remote `latest` module. Runtime-version skew prevents dependent activation rather than selecting a different renderer.

<a id="web-h-editorial-and-reusable-content-release"></a>

## Editorial and reusable-content release

Page content edits prepare from current public state while selecting only the explicitly reviewed source revisions. D1 preserves unrelated work. If a required expected head changes, abort or use only the exact bounded owner-approved reprepare; no silent semantic rebase. Reusable changes disclose exact affected Page/locale scope before release. Incomplete usage projections cannot authorize purge or claim no impact; authoritative release manifests decide dependency closure.

Navigation, placement, page prose, reuse and appearance retain separate operations. Saving prose never moves a route or edits navigation. Copy to another Site creates an independent private draft and requalifies media/links; it does not carry grants, publication state or ongoing synchronization.

<a id="web-h-scheduling-and-clocks"></a>

## Scheduling and clocks

Retain D13's exact-revision one-time publish/unpublish appointments, at most one unresolved kind per Page/locale and publish-before-unpublish order. Record civil date/time, IANA zone, chosen UTC offset for ambiguous time, resolved not-before instant and timezone-data generation. Reject nonexistent civil times with a corrective choice; do not guess during DST folds.

The appointment is an organization-owned completed authorization, not a perpetually live human login. Routine initiator offboarding does not erase it. Explicit policy/safety/appointment/Site/locale/source invalidation stops execution. Cancel/replace creates immutable successor lifecycle facts and increments a fence. A timer or provider cancellation cannot undo an already committed publication. Keep the six-day delayed-executor horizon and one shared overdue reconciler from D13; do not add a Payload Jobs publishing schedule (R08).

<a id="web-h-restore-withdrawal-and-retention"></a>

## Restore, withdrawal and retention

**Restore as draft** checkpoints current private work and appends a new private revision. **Restore previous design** produces a newly qualified successor over current compatible content and current safety. Neither rewinds content, money, history or source commits. A previous unsafe artifact is not eligible merely because it once worked.

Disconnecting GitHub stops new source captures but does not invalidate already retained safe/licensed/compatible artifact use. Safety withdrawal, expired rights, unsupported required dependencies and Site retirement are distinct owner actions. Immediate adverse suppression wins over availability. A fallback may be used only through the existing qualified policy; do not silently change design or disclose a replacement identity.

Retain every artifact/media/code version referenced by active, candidate, scheduled, required recovery or retention-held generations. Purge requires complete use proof and owner policy. Expiring disposable preview compute does not delete source, editorial data or a release receipt. No launch age-only automatic purge of admitted artifacts.

---
