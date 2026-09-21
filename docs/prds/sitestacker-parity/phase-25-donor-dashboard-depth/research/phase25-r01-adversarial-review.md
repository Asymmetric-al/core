> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R01 — Self-service home, Ministry Updates and direct access

Founder-grooming review, 6 September 2026. Audience: Conrad. This records a decision, research findings and unresolved design details. It is not a PRD, formal specification or implementation authorization.

**Verdict:** retain self-service first. Preserve Ministry Updates as a clearly named destination with a useful home preview and an ordinary shareable portal link. The decision fits the governing architecture. Current implementation cannot yet deliver the promised journey. The review identifies required corrections and evidence without changing application code, GitHub state or live providers.

## Decision and review scope

Conrad chose self-service first and required easy, clear, intuitive, beautiful UX; prominent Ministry Updates; an organization-shareable link directly to the donor Updates page; and exact shadcn/Maia/Base UI compliance. These are confirmed requirements. Final component arrangement, navigation grouping, feed entry layout, typography sizes and breakpoint behavior are not yet ratified.

This pass tests that decision and its consequences across navigation, content, identity, financial truth, communication, UI, data loading, failure, access, privacy, migration and proof. It does not claim to resolve every remaining Phase 25 journey. The broader coverage checklist remains open in the grooming notebook.

Live remote source heads were rechecked and unchanged: develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; Phase 22 `70c50e8c97556c43be5543332fb0993b468b90ab`; Phase 24 `ab1a1703a725be454376990a7fe68aef2e048026`. The latter two remain founder-ratified active specification sources, not merged implementation. The earlier PR/issue status inventory remains dated evidence; this pass did not re-run every GitHub status query.

## Permanent direction supported by the review

The home should answer three ordinary questions: what is happening with my giving, whether I need to do anything, and where I can complete my task. A short Ministry Updates section keeps the relationship visible. The page should stay useful when the donor has no recurring gifts, no current document, no updates, or one unavailable service.

Use stable, plainly named navigation and recognizable actions. Keep the donor's current organization and, where applicable, represented Party clear. Use restrained grouping, readable type, Maia spacing and radii, genuine authorized ministry imagery, and short consequence-focused copy. Cards are useful for meaningful groups, not mandatory containers around every fact. Avoid a huge decorative hero, unexplained cumulative totals, routine red badges, an engagement score, or a checklist that makes donors feel permanently unfinished.

Ministry Updates should have a visible text destination on mobile as well as desktop. It should not depend on an RSS icon, hover, a hidden overflow affordance, the existence of an unread badge, or scrolling through the whole home. A home preview and the full destination consume the same released content and current authorization. A title promising one specific story should open that actual authorized story once its exact-content route exists; the generic Updates link should be labeled as a general destination.

This is a composition of existing owners. It does not require a new dashboard builder, donor task engine, attention database, theme system, content store, permission engine, URL-shortening service or financial read model with independent meaning. Exact home composition remains a design proposal to validate, not an additional founder decision hidden inside hardening.

## Adversarial check

### What could go wrong with this answer?

Self-service first could become a cold financial console, an intimidating alert wall, or a home that hides Updates. Attractive cards can still contain false money or fake successful actions. A generic link can also fail the donor if sign-in discards the destination or if a forwarded link exposes private content.

The corrections are bounded: stable navigation, concise source-owned attention, ordinary service actions, a visible real Updates section, destination-preserving authentication, and current authorization. Opening a page must not create a payment, subscription, consent choice, audience grant, or human-engagement claim. A failed payment must not block unrelated authorized statements or Updates.

### What hidden assumptions are we making?

We assume donors benefit from an overview and can recognize its labels. Competitor documentation supports the pattern but does not prove the optimal layout or labels for Asym. We have not measured donor device mix, literacy, language, accessibility needs, frequency of visits, support-contact reasons or preference for browsing by ministry.

We also cannot assume every donor has a linked record, receives every ministry's updates, has one currency, is a personal donor, or can complete a magic-link flow on the same device. Safe empty states, explicit subject context, unchanged source eligibility and cross-device recovery must be designed and tested. Do not infer permission from having donated, followed, married, or received an email.

### How does this affect the whole product?

The portal reads financial and recurring state from Phases 13/16, official documents from 7/18/19, audience-safe Updates from Phase 22 with 9/28 purpose authority, and current access from 3/10/12. Phase 24 supplies the account brand and verified host. Phase 17/6 owns message preparation, consent and delivery.

Staff retain operations and cause-owned repair; missionaries retain authorized authoring/support work; public visitors retain the public ministry experience. The donor home creates no second source of truth. A future Support Hub can receive contextual help requests without making it a prerequisite for every routine action. Imports, reporting and campaigns remain their own later products.

### How does this affect the end-user experience?

Routine tasks become visible and predictable. The same words and relative navigation order should work across devices. Consequential edits explain the exact affected gifts, amount, currency and timing; ordinary harmless navigation needs no confirmation. Important outcomes remain visible in the relevant record after any toast disappears.

The organization can share its normal Updates page address. A signed-in donor arrives there directly; a signed-out donor signs in and continues there. Each opener sees their own permitted content. Missing or unavailable material gets a truthful, privacy-safe explanation and useful allowed navigation, rather than an empty-looking failure, leaked title, or unexpected redirect to a public page.

### Does this follow modern best practices?

The direction agrees with documented donor-account redesigns, predictable navigation, accessible status feedback and proportional error prevention. It is not justified by retention percentages or an assumption that famous subscription products are correct in every detail. A modern pattern must fit the user's actual task and authority.

Planning Center and Fundraise Up offer useful examples of grouped service controls. Apple demonstrates selected-subscription management, but a missing Cancel button is a poor substitute for explicit state. Netflix explains timing, but its immediate/prorated upgrades conflict with Asym's ordinary-save contract. GOV.UK cautions against unnecessary task lists and overused banners. These are precedents and counterexamples, not copied product rules. Sources and limits are recorded below.

### Does this fit Asym’s existing repo and product direction?

Yes at the level of intended architecture. Exact `base-maia`, Zinc-derived semantic variables, Base UI, shared `@asym/ui` components, the existing route shell, thin app APIs and owner services fit the outcome. Phase 24 expressly keeps account customization inside shared code-owned structure; it does not authorize a tenant layout builder.

Current source has concrete gaps: hidden mobile labels, invented loading zeros, a hardcoded story, generic rather than exact story links, a fabricated share URL, insufficient feed audience/cache scope, and an auth callback that can lose the intended destination. These require future correction. Existing code and mock-based tests do not overrule accepted contracts.

### Should we adjust the recommendation?

Keep the selected direction. Strengthen it with explicit discoverability, truthful data states, proportional attention, same-owner content, safe navigation links, authenticated return, and current access checks. These safeguards preserve Conrad's intent and introduce no new authority or product scope.

Do not freeze the final layout yet or claim it is proven beautiful, intuitive or accessible. Next resolve the Updates entry experience; later validate actual Maia compositions with representative donors, including mobile and assistive-technology users. No material amendment to the self-service-first decision was found necessary.

## Direct-link behavior: simple for donors, precise underneath

The requested link is a normal navigation URL on the current verified Tenant portal host. The existing route is `/donor-dashboard/feed`; changing the visible label to Ministry Updates does not require renaming that route. The final route policy must preserve any established links through the owning router and host lifecycle.

<!-- prettier-ignore -->
| Situation | Intended outcome | Authority or limitation |
| --- | --- | --- |
| Organization shares “Open Ministry Updates” | One ordinary URL can serve all recipients. It carries no donor email/ID, session, private filter or access credential. | Portal navigation consumes Phase 24 host context. Sending a message remains independently governed. |
| Signed-in donor opens it | Open the Updates destination after resolving the current authorized subject and audience. | Authentication plus current resource access; URL is not a grant. |
| Signed-out donor opens it | Tenant-branded sign-in, then the validated original destination. | Existing Phase 4/Auth owners; no arbitrary external return URL. |
| Link is forwarded | The recipient sees their own allowed content or safe sign-in/no-access state. | Never the sender's personalized content or cached audience. |
| Wrong organization or account | Explain the access problem without revealing protected identities; offer the existing safe sign-in/account-switch route. | Same-Tenant current host/session/relationship checks. No cross-Tenant linking. |
| Email scanner or link preview opens it | Neutral approved portal branding only; no protected titles, photos, counts or bodies. No meaningful action or human-read claim. | Navigation GET/HEAD is inert with respect to grants, subscriptions and financial actions. |
| Authentication email is scanned | The separate producer-owned scanner-resistant auth protocol applies. | Do not put an authentication credential in the broadly shared navigation link. Supabase documents prefetching/tracking hazards. |
| Auth expires or link opens on another device | Re-establish session and restore the permitted destination with useful recovery. | Cross-device behavior is not currently verified. No unsafe token relay or identity inference. |
| Audience membership is withdrawn | Reauthorize content, media, pagination, engagement and subsequent requests; remove newly forbidden material. | Phase 22 D11 plus 3/10/12; delivered bytes cannot be recalled. |
| Host becomes unverified/unavailable | Honest unavailability and the owning recovery path. | No fallback to Give Hope, Asym, a public Site or another Tenant. |
| Exact update becomes unavailable | A neutral unavailable result; offer permitted Updates navigation. | Do not reveal the old title/author/restriction reason or substitute a different audience. |

Three link purposes stay distinct: the generic personal Updates destination; an optional authorized ministry-filtered destination; and an exact update destination. Public update promotion uses Phase 22's separately admitted public permalink. The current request confirms the first purpose, not a new public-sharing or bearer-grant feature.

## Concrete source findings

All develop source links below pin `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. They are code observations, not tested production incidents.

<!-- prettier-ignore -->
| Finding | Evidence | Classification and consequence |
| --- | --- | --- |
| Mobile Updates label disappears | [DonorSubNav](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx#L18): destination exists at 25; labels hidden at 68; no replacement name/current-page semantics. | Implementation accident / conflict with accessibility. Keep real links and visible names; test current-page and focus semantics. |
| Auth return loses task | [Auth callback](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/auth/callback.ts#L17): sanitized next at 17; role home wins at 35–37. | Temporary bridge that fails the requested journey. Existing password login preserves next; converge shared auth behavior without weakening target validation. |
| Missing data appears as money zero | [Home body](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/donor-dashboard-main-body.tsx#L35): missing-data defaults at 39–45; synthetic bootstrap is unrelated to real data readiness. | Conflict with financial truth. Pending, empty, error, stale and confirmed zero are different states. |
| Hero invents impact; story links are generic | [Home body](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/donor-dashboard-main-body.tsx#L107): fabricated story at 107–132; recent rows use general feed at 179. | Implementation accident. Use released source content and accurate link labels/destinations. |
| Sharing invents a destination | [Feed client](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/feed/page-client.tsx#L112): hardcoded givehope.app/posts URL; no matching page found. | Conflict with host/content ownership. Copy only an owner-issued valid destination and report clipboard success truthfully. |
| Published feed lacks supporter safety | [Posts reader](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/posts/index.ts#L50): service-role posts/author read; draft check exists, current published audience/safety check does not. | Conflict with first principles. Current request must not expose every tenant-published post as a donor feed. |
| Cache scope omits audience/current safety | Same reader 19–45 and donor-feed-posts hook 90–103. | Temporary bridge. Existing logout cache clearing is useful but does not prove membership revocation or same-user subject-switch isolation. |
| Shared UI infrastructure exists | [UI configuration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/ui/components.json#L3), shared UI AGENTS and globals. | Durable pattern. Preserve exact Maia/Base UI and shared primitives; no app-local fork. |
| Shared components need correct composition | ItemGroup has list role while Item does not supply listitem; CardTitle renders a div; Alert defaults to assertive alert; AlertDialogAction uses Close. | Useful precedent, not automatic conformance. Supply semantic headings/list items, proportional announcements and outcome-controlled dialogs. |
| Motion and touch foundations exist | globals has coarse-pointer 44px height and focus rules; shared MotionProvider honors reduced motion. | Durable pattern. Do not falsely claim absent touch/reduced-motion support. Local long feed animations still need proportionate review. |
| Existing a11y proof does not cover this journey | accessibility.spec.ts 37–155 covers public home/login/register/public mobile navigation. | Evidence gap. It does not certify authenticated Home, Updates or auth-return behavior. |

## Scope-preserving UX safeguards and proof

<!-- prettier-ignore -->
| Area challenged | Proportional permanent path | Evidence needed before claiming completion |
| --- | --- | --- |
| Hierarchy and beauty | Stable navigation, short sections, readable amounts, restrained real imagery, consistent action language; no invented impact/retention metric. | Actual Maia designs reviewed at representative widths, languages and states; unassisted donor tasks. |
| Mobile and accessibility | Visible names, logical DOM/focus order, contrast, non-color status, 44px Core touch convention, 320 CSS-pixel reflow, zoom, virtual keyboard and reduced motion. | Keyboard/screen-reader/manual focus/contrast review plus automated checks of complete authenticated journeys. |
| Data readiness | Independent section loading/error boundaries; no synthetic readiness or zero fallback; preserve safe task context. | Slow/failing owner tests and actual rendered pending/empty/stale/error states. Protected stale content never survives authority loss. |
| Money correctness | Home displays source-approved original-currency amounts/coverage, not sums from a truncated client slice. | Source projections, currency/exponent cases, pagination/coverage and correction examples. |
| Consequential changes | Exact affected gifts, amount/currency, effective timing and in-flight consequences; durable result; no blind repeat after timeout. | Provider-contract and real database concurrency/idempotency proof from owning services, then accessible end-to-end actions. |
| Attention | Current actionable source facts; a pause is not failure; routine updates do not create permanent urgency; no new attention ledger. | Source state transitions, grouping, permission loss and unavailable-source tests. No misleading global “all clear.” |
| Content and privacy | One owner-authorized projection for home preview and full Updates; no gift/follow-derived access or public fallback. | Real PostgreSQL role/subject denial, current release/epoch checks, metadata/media/pagination/engagement/cache cases. |
| Links and authentication | Ordinary non-credential URL; validated current Tenant destination; preserve intent through sign-in/verification/recovery. | Logged-in/out, wrong account/Tenant, forwarded links, scanner/preview, expired/cross-device sessions and return-target poisoning. |
| Communication | Link navigation is not consent, subscription, read proof or sending authority. | Phase 17/6 contract tests; exact protected-action transport remains distinct from ordinary navigation. |
| Scale | Bounded source queries, source-owned order/cursors, independent sections, no per-card provider fan-out or permanent raw feed copy. | Query/load/large-history evidence and small-scope failure recovery, without premature infrastructure. |
| Migration | Inventory old links and prototypes; replace through owner contracts; avoid gratuitous route renames and unsafe legacy fallback. | Old-entry-point closure, link continuity, deployment-skew and source-qualified rollback/containment proof. |
| Staff/missionary burden | Donor-safe next action and cause-owned help; no manufactured staff task for every visit or update. | Representative task/support testing and documented handoff when a genuine owner action is required. |

These are completion evidence requirements, not claims that the tests ran. No payment action, auth email, provider setting, database migration, or donor runtime test was performed in this pass.

## Claim-to-source ledger and external-pattern assessment

All pages accessed/rechecked 6 September 2026 unless noted as preceding-session official-doc evidence. Undated help pages are labeled undated. Sources support their described behavior; recommendations about Asym are inferences.

<!-- prettier-ignore -->
| Source, publisher and visible date | Supported claim | Classification / applicability limit |
| --- | --- | --- |
| [Refreshed My Giving](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center), Planning Center, 3 Nov 2025; [current guide](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), 3 Sep 2026 | Overview groups giving, arrangements, attention and payment access; detailed areas support history/documents. | Useful precedent for task-oriented account home. No measured Asym usability or retention proof. |
| [Donor Portal redesigned](https://fundraiseup.com/docs/changelog/donor-portal-redesigned/), Fundraise Up, 3 Jun 2025 | Desktop sidebar, collapsible mobile menu, related action grouping, clearer payment recovery. | Useful precedent. Do not copy a hero that displaces tasks or assume mobile menu is best for every destination. |
| [Schedule guide](https://help.pushpay.com/s/knowledge/How-to-Manage-My-Payment-Schedules), Pushpay, 1 Jun 2026; [method guide](https://help.pushpay.com/s/knowledge/How-to-Manage-My-Payment-Methods), 6 May 2026 | Arrangement-specific edits/review; adding methods does not retarget existing arrangements. | Useful precedent for contextual controls and “where used.” Previously rendered official guides, not live account testing. |
| [Recurring donor guide](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation), Givebutter, 11 Jun 2026; [profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile), date not established | Direct management links; profile history has explicit limits. | Useful precedent for task entry and coverage honesty. Do not copy incomplete history or disguise date change as pause. |
| [Recurring management](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-au/content/ptl-feature-recurring-gifts.html), Blackbaud, undated; [method confusion and later correction](https://community.blackbaud.com/discussion/64784/donor-portal-updating-recurring-gifts), historical product-manager thread | Distinct recurring intentions; donor confusion when wallet changes do not affect existing arrangements. | Useful precedent. Historical thread is explicitly not a present-runtime bug claim. |
| [Cancel subscriptions](https://support.apple.com/en-us/118428), Apple, 21 Aug 2026 | Account → selected subscription; ownership-based help. Cancel may require scrolling and absence can signal cancellation. | Useful precedent for object detail; poor state/affordance behavior to improve, not clone. |
| [Change plan](https://help.netflix.com/en/node/22), Netflix, undated current help | Review/confirmation distinguishes immediate/prorated upgrades from next-cycle downgrades. | Useful timing disclosure. Immediate/prorated ordinary changes conflict with Phase 16. |
| [Cancellation/pause](https://help.netflix.com/en/node/407), [payment methods](https://help.netflix.com/en/node/134233), Netflix, undated current help | Pausing/resuming and preferred/backup methods have specific payment effects. | Counterexamples: no automatic backup-charge or immediate unpause semantics imported into Asym. Documentation reviewed by the research lane. |
| [Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars), Apple HIG, updated 8 Jun 2026 | Stable top-level destinations and visible labels support orientation. | Useful navigation precedent only; no native Apple styling or Liquid Glass introduced. |
| [Task list](https://design-system.service.gov.uk/components/task-list/), GOV.UK, undated current guidance | Task lists need evidence of complex multi-session work; simplify first. | Useful counterexample to turning every donor visit into an incomplete checklist. |
| [Notification banner](https://design-system.service.gov.uk/components/notification-banner/), GOV.UK, undated current guidance | Use banners sparingly; put directly relevant information in page content. | Useful precedent for proportional attention; GOV.UK component styling is not imported. |
| [Consistent navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html), [accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), W3C WAI, current WCAG 2.2 guidance | Predictable relative navigation; support authentication assistance such as password managers/paste. | Durable accessibility principles. A theme or automated pass alone cannot prove complete conformance. |
| [Financial error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), W3C WAI | Proportional review/correction/reversibility and programmatically available status feedback. | Durable principles. No claim that every trivial save requires a confirmation modal. |
| [Dialog](https://base-ui.com/react/components/dialog), Base UI, current docs; [theming](https://ui.shadcn.com/docs/theming), shadcn, current docs | Controlled state/focus composition and semantic theming. | Useful implementation reference subordinate to Core's exact installed Base UI 1.5.0 and Maia wrappers. Current upstream docs showed 1.8.0; no upgrade or newly documented component API is assumed. |
| [Auth email templates](https://supabase.com/docs/guides/auth/auth-email-templates), Supabase, current docs | Link prefetch can consume verification links; documented OTP/deliberate-confirm alternatives; tracking can rewrite auth links. | Relevant auth-provider evidence. Preserve Core's producer-owned protocol, no blind template copying or live reconfiguration. Changelog scanned for relevant changes. |
| [Redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html), OWASP, current guidance | Validate allowed destinations and destination authorization. | Durable security pattern. Does not require introducing a generic redirect service for one normal route. |

## Governing records and conflicts

- [Phase 22 ADR-0128](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/adr/0128-canonical-ministry-update-audience-release-projections.md): one canonical Update, separate public/supporter projections, current access on every egress; gift/follow/relationship never infers audience. D11 owns ordering; 9/28 owns purpose/history rights. Phase 25 does not become a follower or tenant-wide feed product.
- [Phase 24 ADR-0185](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/adr/0185-tenant-owned-donor-portal-host.md): one verified Tenant portal host and stable brand; bounded semantic customization inside shared code structure; no layout/auth override or fallback identity. This also disconfirms a tenant-configurable dashboard builder.
- [ADR-0025](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0025-producer-owned-protected-actions.md) and [ADR-0037](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0037-scanner-safe-exact-artifact-access.md): producer-owned protected actions and scanner-safe exact access. A navigation link is not a grant or proof of human action.
- The platform surface, ownership, privacy and recurring/document contracts remain as inventoried in the initial research record. No new table or permission model is justified by R01. Legacy UI contradictions are correction requirements, not amendments to ratified intent.

## Remaining evidence gaps and next decision

<!-- prettier-ignore -->
| Gap | Confidence now | Resolution |
| --- | --- | --- |
| R01 fits accepted architecture | High, based on current source and exact active owner records. | No founder amendment needed. Preserve safeguards. |
| Final navigation/layout is optimal for donors | Unproven; supported design direction only. | Test actual Maia compositions with representative donors and real tasks. |
| Updates opens correctly after all auth paths | Known source gap; not runtime tested. | Existing Auth/host owner implementation and end-to-end proof. |
| Current feed protects every audience/media/cache path | Known source gap; not a live exploit claim. | Owner-qualified projection plus real authorization/revocation proof. |
| Direct stream versus ministry-first entry | Product choice remains open. | R02, one founder question. Preserve Phase 22 ordering and current permitted-source filter. |
| Task-oriented home reduces support contacts | Unmeasured hypothesis. | Establish a baseline and compare genuine task completion/help needs; no invented percentage. |

**R02 recommendation:** open Ministry Updates directly to the reader's already-authorized stream, with an optional ministry filter. A ministry-directory-first approach helps deliberate browsing but adds a step before reading. Neither option changes who may read what, public promotion, source ordering, or the existing self-service-first home.

## Research and verification record

Three bounded research lanes covered donor/subscription journeys, link/auth/content ownership, and the Maia/accessibility source. The coordinator independently inspected the high-impact callback/navigation defects, active audience/host ADRs, current Fundraise Up/Apple/Netflix documentation, W3C/OWASP/Supabase guidance and shared UI rules. Searches stopped once the chosen direction, contradictions and material limitations were supported; further broad product lists would not settle Asym's untested design details.

The planning tool was unavailable; scope, source classes, discovery, follow-up and synthesis were tracked locally. No donor runtime, provider mutation, browser usability, screenshot/contrast, real PostgreSQL or financial test was performed. This Markdown research artifact received structural/citation/decision-status checks; it is not a rendered UI or visual-conformance assessment. No application source changed; the earlier five-file Supabase setup patch remains intact. The full Phase 25 grooming is not complete.
