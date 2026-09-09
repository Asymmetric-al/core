> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 — Initial research record

> **Correction, 7 September 2026:** Subsequent R02 source tracing found that the comments POST reports demo-success without persistence. Any earlier description of comments as transport-backed/persisted is superseded by [the current R02 review](phase25-r02-adversarial-review.md). This remains the dated initial research record; later R01/R02 decisions are in the grooming notebook.

Research snapshot: 6 September 2026. Companion to the Phase 25 grooming notebook. This preserves source findings, their limitations, and official benchmark references. It is not a PRD or implementation authorization. No Phase 25 decision has been ratified.

## Reading order

1. Foundation and source hierarchy below.
2. Implementation audit: real screen-to-service-to-data paths and prototype inventory.
3. Recurring, document, ticket and Stripe evidence.
4. Official donor journeys and communication preferences.

All source paths in the implementation audit are relative to the immutable [Core source snapshot](https://github.com/Asymmetric-al/core/tree/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd). The active Phase 22/23/24 branch heads, states, and dependencies are recorded in the companion notebook. Evidence from source code, documentation, and read-only provider configuration is explicitly distinguished from a verified donor journey.

## Foundation and source hierarchy

- Read root AGENTS/CLAUDE, the user-invoked grill-with-docs skill and Core's canonical grilling/domain-modeling workflows, CONTEXT-MAP and relevant CONTEXT vocabulary, OpenSpec project/platform/capability intent, ADR-0001, the source-of-truth matrix, charter, roadmap, phase map and parity matrix. Predecessor PRDs and amendments through Phase 24 were inspected for the donor-related contracts rather than treated as one undifferentiated specification.
- [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) and the [ownership matrix](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md) keep CRM/source truth in Asym and exact external execution evidence with its provider.
- Phases 2/24 provide Site attribution, shared donor account brand/host, locale, currency and exact merchant scope. Phase 24's D57 host/account brand and D61-D65 currency rules do not authorize portal-specific money or identity truth.
- Phases 3/12 provide the current subject/resource/field authorization decision and export governance. Phase 9's Party relationship is not an access grant. Phase 10's current safety floor applies to names, thumbnails, slugs, history, documents, exports, email, cache and diagnostics.
- Phase 4's verified claim and immutable-facts amendments constrain guest attribution and profile changes. Its A5 no-guess rule conflicts with the older best-match wording in issue 508. This is an inherited instruction conflict to reconcile, not an invitation to silently match ambiguous donors.
- Phases 7/14 distinguish legal donor, recognition, document purpose, authorized recipient and joint-donor evidence. Phase 13/15 own received money, designation lines, corrections, offline entry and provenance. Phases 16/18/19 later amendments replace the old recurring and live-text document designs.
- Phase 21's private financial balances do not supply donor impact. Phase 22 owns Ministry Update releases and audience safety; Phase 23 keeps ordinary CMS public and authenticated portals app-owned. Future 26/28/30/32/33/36 capabilities remain explicit seams.
- Live GitHub PRs 465/872 are merged; 1323/1340/1558 are open. Issue 1339 and 1431 bodies and their governing source branches were inspected. A stale draft label in PR1340 prose was not mistaken for current API state.
- Related open implementation PR bodies/heads inspected: 1329 (fee policy, head 134310f29e68f77888e462f37aaf101d7d4c567d), 1331 (shared Gift/Update command adapters, head 76317f72e0f901894281d5fde09301f3c99ef2a0), 1336 (outbound modules, head 3b2827ffcf184bf767664018efedda317c7da03c). Their described changes and tests are unmerged branch evidence, not work run or accepted here.
- Current [WCAG 2.2](https://www.w3.org/TR/WCAG22/) includes consistent navigation/help, accessible authentication, error prevention for financial/data changes, focus visibility, target size, reflow and status messages. Future evidence must cover complete donor processes and adverse states, not a component-only scan.

## Research disposition

The first founder question is the return-home hierarchy. A stable service-first overview is recommended, while Updates-first remains a practical alternative. The user has not ratified it. Representative recurring and document authority is already settled; only presentation/discoverability and exact owner-consumption details remain to groom. No source or provider behavior was changed in response to these findings.

## Phase 25 implementation evidence and inherited-pattern assessment

Audit date: 2026-09-06. Repository: `[historical Core checkout]`. Both inspected `HEAD` and `origin/develop` resolve to `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Parent separately verified the live remote. This is a read-only source audit for founder grooming, not a PRD, implementation authorization, deployment assessment, or live security assessment. No application code, database state, provider state, GitHub state, or credentials were modified. The five prior Supabase diagnostic changes were preserved. No tests, browser sessions, or provider calls were run by this subagent.

The user-requested taxonomy is applied literally: **Durable pattern**, **Useful precedent**, **Temporary bridge**, **Implementation accident**, **Conflict with first principles**. Classifications are assessments of the inspected implementation; an implemented pattern does not gain product authority merely by existing.

### Overall finding

The donor app has authenticated, tenant-scoped server reads and a real profile-save path, but it is not an implementation-complete self-service home. The ordinary navigation leads to a mixture of real reads, provider handoffs, invented artifacts, fake security/preferences controls, and a raw financial-data prototype. The strongest reusable element is the authenticated subject-to-owned-record server boundary. The weakest elements are the assumption that a Stripe subscription/customer is the donor's product relationship, that payment success means an issued receipt, and that polished local state demonstrates a completed action.

The main financial snapshot is based on mutable `donations` and one legacy `donor_pledges` row per recurring record, not the Phase 13/16/7/18/19 ownership model. The known predecessor contracts should be carried forward as authority; the existing UI and storage model should be treated as migration evidence.

### 1. Rules and scope consumed

Read root `AGENTS.md`, donor/API/auth/database/Supabase `AGENTS.md` files, canonical `grill-with-docs`, `grilling`, `domain-modeling`, relevant backend rules, and relevant merged OpenSpec clauses. Root authority order distinguishes merged OpenSpec intent from active proposed changes and current source. Canonical `grilling/SKILL.md:6-12` requires researched facts, one recommended decision at a time, and waiting for the founder's answer. Domain modeling captures resolved terminology immediately and creates consequential ADRs sparingly.

Merged `openspec/specs/platform-surfaces/spec.md:41-62` already requires a calm donor self-service surface for giving, recurring gifts, methods, receipts, statements, and related actions without staff complexity. `openspec/specs/donation-lifecycle/spec.md:254-264` already requires canonical shared gift truth, not a separate portal money state. These are constraints to honor, not questions to ask again.

### 2. Actual screen -> API -> persistence map

<!-- prettier-ignore -->
| Surface | Actual source path | Real downstream path | Evidence and limitation | Classification |
| --- | --- | --- | --- | --- |
| Overview | `apps/donor/features/donor/components/donor-dashboard-main-body.tsx:34-45` | `useDonorPortalSnapshot` -> GET `/api/donor/portal` -> `getDonorPortalSnapshot` -> `profiles`, `donors`, `donations`, `donor_pledges`, `donor_feed_preferences` | Real server read, but summary uses capped rows and simplified financial semantics. | Useful precedent for read composition; current financial projection is Temporary bridge. |
| Overview Ministry Updates | same file `:35-37,155-205` | `useDonorFeedPosts({limit:5})` -> GET `/api/posts` -> service-role `posts` read | Real transport; published-content visibility/redaction is insufficient, detailed below. | Useful precedent for shared transport; missing audience/sensitivity enforcement is Conflict with first principles. |
| Overview featured story | same file `:107-132` | None | Hardcoded Chiang Mai location, school-year headline, and claim that 50 children received uniforms/books. | Implementation accident; must not be evidence of donor impact. |
| History | `apps/donor/app/(dashboard)/donor-dashboard/history/page-content.tsx:498-514` | `useDonorHistoryTransactions` -> route-backed TanStack collection -> GET `/api/donor/portal` -> same snapshot | Shared adapter, not the separate `reads/donor-history.ts` pagination API. Runtime mapping drops currency. | Temporary bridge, explicitly documented as such in collection `:9-11`. |
| Receipt download | history `columns.tsx:185-206` | GET `/api/donor/receipts/[donationId]` -> owned current donation -> generated plain text | Correct owned-record lookup; no issued-facts/artifact lookup. UI limits link to Succeeded but server does not. | Owned lookup is Durable pattern; invented official receipt is Conflict with first principles. |
| Statement download | history `columns.tsx:229-235` and page header | GET `/api/donor/statements/[year]` -> own `donations` by UTC gift_date -> sum -> generated text | No document issuance, version, Legal Entity grouping, or immutable statement artifact. | Conflict with first principles. |
| Recurring Giving | `.../pledges/page-client.tsx:144-159` | Snapshot -> map legacy rows -> POST `/api/donor/billing-portal` -> Stripe Billing Portal session | The displayed recurring list is real source data. No native recurring group/line edit, pause, skip, cancel, or recovery commands exist here. | Current list and handoff are Temporary bridge. |
| Wallet | `.../wallet/page-client.tsx:1254-1270` | None | `MOCK_METHODS` and `MOCK_PLEDGES`; all add/edit/default/delete/move/swap operations change React state. | Implementation accident; raw financial-data collection is Conflict with first principles. |
| Settings Profile | `.../settings/page-client.tsx:124-175` | Shared hook PATCH `/api/donor/portal` -> profiles then donors -> re-read snapshot | Real persistence with schema validation and subject scoping; non-atomic multi-table writes and no source-domain change event. | Useful precedent; current dual-write shape is Temporary bridge. |
| Settings Notifications | same file `:474-500` | None | Local initial preferences; timer marks save successful. | Implementation accident. |
| Settings Password | same file `:664-700,824-834` | None | Reads current/new/confirm password into local state; timer prints Password Updated without Auth request. | Conflict with first principles. |
| Settings 2FA / sessions | same file `:839-903` | None | Always Disabled, hardcoded Macbook Pro/San Francisco, and buttons without handlers. | Implementation accident; never claim actual security/session status from this. |
| Feed save/bookmark | `.../feed/page-client.tsx:395-440` | React overrides only | Bookmark disappears on remount. Reactions/comments use shared transport-backed ReactionBar. | Bookmark is Temporary bridge; shared reaction transport is Useful precedent. |
| Login / registration | shared `LoginScreen.tsx:140-159`, `RegisterScreen.tsx:58-95` | Supabase signInWithPassword/signUp; auth callback code exchange | Real auth calls. Registration sends names and email, not requested tenant/role authority. Does not prove donor record claim/link completion. | Durable pattern for provider-owned authentication; account-to-donor linking still needs contract coverage. |
| Forgot password | `apps/donor/app/(auth)/forgot-password/page.tsx:1-22` | None | Explicitly states password reset is not enabled and refers to support. | Honest Temporary bridge; missing recovery capability. |
| Sign out | `DonorSubNav.tsx:35-42`; `packages/auth/client-session.ts:203-238` | Server signout; browser local-session cleanup; query-cache clear; redirect | Real shared path. It is current-session logout, not the fake other-devices button. | Durable pattern. |

App API files are thin re-exports into `packages/api` (for example `apps/donor/app/api/donor/portal/route.ts`, receipt/statement routes, billing portal route). That package boundary is worth retaining.

### 3. Identity, ownership, auth, and cache boundaries

#### Existing positive boundary

- `packages/auth/context.ts:241-266` validates the Supabase user with `auth.getUser`, then loads profile by `user_id`; it does not trust browser-supplied donor IDs or email as portal authority.
- `context.ts:281-305,308-340` resolves active memberships for the profile tenant. `requireRole` at `:370-379` enforces the server-side role after authentication.
- `packages/api/src/donor-portal/index.ts:39-62` authenticates GET and requires donor role; synthetic demo snapshot fallback requires explicitly enabled E2E bypass and synthetic identity. It is not a blanket production fallback.
- `service.ts:166-191` resolves both profile by `id + tenant_id` and donor by `profile_id + tenant_id`. Donation/pledge/preferences reads at `:205-232` add tenant and donor filters. Receipt lookup at `:259-276` adds donation ID to that pair.
- This is a **Durable pattern**: derive the subject in the server, then constrain every resource to its authorized scope. It does not establish the final Party/representative/delegation model.
- `apps/donor/proxy.ts:26-40` protects donor dashboard/checkout and allows donor/super_admin; nested dashboard layout adds a role guard. API handlers independently authenticate. Layout protection is not the sole security control.

#### Limits to carry into grooming

- `resolveDonorPortalContext` uses `.single()` for one donor per profile+tenant. `getAuthContext` uses one profile selected by user ID and derives tenant from that profile. There is no inspected subject switcher or explicit delegated-Party/household claim flow. Treat this as a **Temporary bridge**, not proof that one login must equal one economic donor forever.
- Preserve the settled invariant that shared email, household membership, soft credit, provider Customer, and missionary relationship grant no automatic access. Existing guest matching modules attach contributions to the donor graph; they are not portal access-grant mechanisms. `donate/guest/donor-matching.ts:185-223` operates on normalized-email attribution candidates; no claim-authority conclusion follows from that.
- `packages/database/hooks/donor-portal.ts:109-170` has a global query key `['donor','portal']`. Current shared auth clears the query client when user changes or signs out (`packages/auth/client-session.ts:56-82,233-237`). Therefore **do not report a proven cross-user cache leak solely from the key**. Future tenant/Party switches within one user need explicit query/collection scope and isolation proof; user-change cleanup is only one seam.
- Current E2E bypass guards bind synthetic identities to an allowed datasource (`context.ts:175-205`). Synthetic data is useful for rendering tests; it is not PostgreSQL authorization evidence.

### 4. Wallet: local prototype, including raw card and bank data

`apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx` is directly linked in real donor navigation (`DonorSubNav.tsx:31`). It is not only a boneyard route.

- `:100-107` defines card number, expiry, CVC, bank routing/account, name, and address as React form state.
- `:127-179` defines two fake methods and three fake recurring pledges; `:1255-1256` mounts these for the donor.
- Ordinary app-owned Inputs read card number into `formData.number` (`:443-452`) and CVC into `formData.cvc` (`:480-485`). The bank tab similarly owns routing/account form values; they are not processor-hosted fields.
- Save at `:1340-1389` fabricates `pm_${Date.now()}`, derives the last four characters, guesses card brand, and assigns fixed expiry or bank labels. It never creates a provider token or executes a persistence command. Closing the modal does not clear `formData`, so entered full financial values remain in component state until reset/unmount.
- Default/delete/move/swap at `:1392-1437` only edit local arrays. A donor can be shown apparent payment-method reassignment while future collection remains untouched.

Classification: fake cards, defaults, balances, and local mutations are **Implementation accidents**. Accepting PAN/CVC/bank details in ordinary application state and presenting invented successful management is a **Conflict with first principles**. No network transmission, database storage, logging, or actual exfiltration was observed; do not claim those occurred. The code is still an unsafe basis for a real payment flow. Retain only bounded UX concepts that survive source-domain and provider-hosted-field review, not this data-handling implementation.

### 5. Recurring giving: legacy provider reflection, not Phase 16 control

The recurring page reads live snapshot rows and calls one general billing-portal button. It does not execute a selected recurring-line command: `pledges/page-client.tsx:144-159` calls a mutation with no resource ID; `:53-107` renders cards without line-specific controls. The empty state also offers billing portal at `:199-222`, even though a donor without `stripe_customer_id` receives 409 from `billing.ts:17-21`.

`billing.ts:24-42` resolves a tenant Stripe client and creates a session using a single `donor.stripe_customer_id`. This is a real external handoff, but no explicit Legal Entity/account binding, group/line context, return-operation proof, or scope-limited `flow_data` is supplied. Do not infer what controls the live provider configuration enables; no provider session was created during this audit.

`stripe/tenant-client.ts:42-46,64-73` reads tenant secret/publishable keys and falls back to environment keys when that tenant row lacks keys. That behavior is **Conflict with first principles** if inherited as the final Phase 13 tenant-owned Connect/Legal Entity design. It is current implementation, not evidence that fallback account selection is authorized. No key values were read.

The current recurrence reflection is explicit in `packages/api/src/stripe/recurring.ts`:

- `:28-42` collapses provider states into active/paused/cancelled; pause_collection becomes donor pledge paused.
- `:101-121` finds one pledge by subscription ID with an optional tenant predicate.
- `:153-164` prevents late provider updates from resurrecting a cancelled pledge: **Useful precedent** for terminal-state protection.
- `:166-185` patches the same row and uses maximum item period end for next charge, not independent line/cohort schedules.
- `:254-274` increments mutable payment/failure counters from a read value; a paid invoice reactivates anything except cancelled, including paused. This is source evidence of collapsed intent/collection semantics, not evidence of an actually replayed charge.

Merged `donation-lifecycle/spec.md:154-163` already labels this a legacy bridge. Phase 16 PRD `:9-27,329-379` already distinguishes group/cohort/line, authorized parties, product intent, collection authority, health, recovery, and immutable instruction. Do not re-grill whether a pause equals collection failure or whether a household implies authority; those are settled. The donor surface must consume the owner contracts and ask only its remaining UX/orchestration choices.

New recurring creation is not supplied by the existing donate endpoint: `schemas/donate.ts:9-14` accepts amount/currency/missionary/fund only; `donate/index.ts:38-70` starts the one-time saga; `donate/payment-intent.ts:62-70` creates an idempotent PaymentIntent. Provider idempotency and shared saga ownership are **Useful precedents**, not a recurring product implementation.

### 6. History and money truth

- `service.ts:205-224` caps donations at 250 and pledges at 100, then computes totals, years, and counts from that loaded slice. A high-volume donor can have YTD/history/statement-year navigation silently truncated. There is no pagination/count/freshness contract on this snapshot.
- `model.ts:302-306` maps refunded to Failed and every unknown status to Processing. This loses refund/partial-refund/correction axes and can mislabel a refund as failed collection.
- `model.ts:236-266,269-299` chooses one current fund or missionary designation. No immutable allocation-line breakdown, source correction, or frozen historical display is loaded.
- `model.ts:391-393` sums every settled amount without currency partition. `:473-478` uses legacy total_given or the same unpartitioned sum. The dashboard `donor-dashboard-main-body.tsx:40-45,80-86` formats this without a source currency.
- History collection `packages/database/collections/donor-history.ts:107-160` omits currency entirely and replaces last4 with literal Stripe. Source donation currency cannot be recovered in the history renderer. `page-content.tsx:559-584` builds trends and totals from these amounts, again without currency.
- Money projection uses cents/100 throughout (`model.ts:212-217`, receipt/statement formatters) and defaults missing currency to USD. This is not a general multi-currency minor-unit contract.
- History limits available year filters to the current and four prior years (`page-content.tsx:83-86`); the server annual endpoint separately permits 2000 through next year. The UI and artifact access windows do not share a contract.
- `history/columns.tsx:222-227` exposes View Details and Manage Recurring menu items without handlers. They are not completed tasks.

Classifications: route-backed collection is **Temporary bridge**; shared presentation code/pure mapping are **Useful precedents**; dropped currency, unqualified sums, invented status collapse, fake menu actions, and treating the loaded slice as complete are **Implementation accidents**. Promoting these into official financial or receipt truth would be **Conflict with first principles**. Phase 13 owns financial truth; Phase 20 owns accounting/settlement projections; Phase 25 must not invent replacements.

### 7. Receipt and statement artifacts are invented from mutable reads

`donor-portal/receipts.ts:45-67` proves resource ownership but does not check receipt eligibility, issuance, void/supersession, or even settled status. It maps any owned donation and produces text with Donation Receipt, Receipt ID equal to donation ID, current donor name/email, current designation, and current amount (`:15-36`). The response is a fresh `.txt` attachment (`:69-80`). The history button's Succeeded-only guard (`columns.tsx:191`) does not protect the direct endpoint.

The annual endpoint does filter settled statuses (`service.ts:279-300`) but independently invents a Giving Statement. `statements.ts:56-60` sums all currencies and labels the total with the first row's currency; `:70-90` generates current-name/current-data text. It does not retrieve an immutable issued statement or group by Legal Entity/currency. Renaming a donor alters subsequent downloads of the same nominal receipt/year.

Existing owned-record lookup is a **Durable pattern**. These generated artifacts are **Conflict with first principles** as official receipt/statement behavior. This is already resolved by merged `donation-lifecycle/spec.md:180-211`: source-owned immutable versioned facts, governed rendering, separate issuance/delivery, and corrections preserving history. Payment success alone is not receipt eligibility.

There are more suitable migration precedents elsewhere, but they are not wired into these donor routes:

- `giving/receipt-record.ts:9-20` explicitly describes frozen identity/gift facts and labels its receipt language non-production placeholder. `:225-268` persists/reuses `gift_receipt_records` with duplicate handling.
- `supabase/migrations/20260704120000_gift_receipt_records.sql:14-40` provides server-only receipt snapshots. Its unique donation index is a limitation to reconcile with versioned corrections, not a replacement for Phase 7/18 ownership.
- `20260611140000_contribution_receipt_delivery.sql:18-40` holds server-only contribution receipt snapshots.

Classification: immutable snapshot/replay ideas are **Useful precedents**. The exact legacy receipt table and renderer are **Temporary bridges**, not an excuse to create a fourth receipt subsystem. Phase 7 owns facts, Phase 18 exact protected artifacts, Phase 19 statement operations, Phase 17 messaging.

### 8. Profile, preferences, and account-security consistency

Profile settings uses a strict Zod allowlist (`settings-patch.ts:3-18`) and rejects arbitrary extra fields. Browser form sends name/phone/avatar, not email/password/role/tenant (`:96-127`). This is a **Useful precedent**. Names are reconstructed by splitting display name (`:22-30,41-55`) and requiring first plus last (`:102-109`), an **Implementation accident** if assumed globally valid for donor identity/localization.

`donor-portal/index.ts:77-130` builds separate updates for profiles and donors. `:132-161` applies them sequentially with owner predicates. If the first update succeeds and the second fails, no transaction rolls back the first. No version predicate, atomic source command, or actor-purpose change event is present in this handler. `withOperation` creates an audit logger (`shared/with-operation.ts:145-164`) but does not automatically record a business event; this handler does not call it. Existing error handling avoids a fake successful API response, but does not guarantee all-or-nothing profile changes. Classification: **Temporary bridge** requiring ownership/concurrency design, not a new Phase 25 identity source.

Notification and security tabs are fake as described in the screen map. An especially misleading interaction is Password Updated after a local timer; no Auth provider update occurs. Keep the genuine account-recovery exclusion explicit until a real shared-auth path exists.

There is also a separate legacy feed-preferences route:

- `packages/api/src/feed-preferences/index.ts:47-68` authenticates a user, then finds donor by email alone, unlike the donor-portal owner resolver.
- `:104-111,150-155` hardcodes default tenant rather than deriving it from authenticated context.
- `:189-205` attempts an upsert using a cookie server client. Current migration `20260625002117_canonical_tanstack_db_realtime_rls.sql:263` revokes all anon/authenticated access to that table. Consequently this is a demonstrated source ownership conflict/likely failing path, **not a demonstrated exploitable cross-tenant write**.
- GET ignores database read errors and can emit fallback preferences. Its fallback email flags are false (`feed-preferences/index.ts:17-23`), while portal snapshot fallback flags are true (`donor-portal/model.ts:492-501`). Missing data therefore has contradictory user-facing interpretations.

Email-as-authority and default-tenant selection are **Conflicts with first principles**. Silent defaulting and incompatible defaults are **Implementation accidents**. Presentation preferences, subscription/following, consent, required notices, and delivery preferences need source-specific contracts; a generic JSON giving_preferences record is not proof of consent.

### 9. Content feed, visibility, sensitivity, and sharing

`packages/database/hooks/donor-feed-posts.ts:24-29` describes an auth-gated, server-redacted feed. The actual route only partly supports that description:

- `packages/api/src/posts/index.ts:50-61` uses service role to select `posts.*` plus author first/last/avatar by tenant and status, with optional missionary ID.
- `:97-108` correctly gates drafts to missionary/staff and their own profile: **Durable pattern** for explicit draft authorization.
- Published results are returned to any authenticated tenant member after only interaction enrichment (`:110-137`). There is no `visibility`, approved-follower, partner relationship, or sensitivity/alias check in that path. `supabase/migrations/20250101000000_init_schema.sql:129` explicitly has public/partners_only visibility, and `posts/post.ts:89-92` can update visibility. A published partners_only row is therefore not excluded by the inspected read path. This is a concrete source-level disclosure path; no hosted record or exploit was exercised.
- Portal financial designation joins also pull missionary profile names/avatar via service role (`donor-portal/service.ts:70-71,91-92`) and pass current names into output (`model.ts:248-257,281-290`) without an inspected sensitive-display resolver. This is an explicit projection gap to reconcile with Phase 10; do not claim all missionary names are sensitive or that a particular live identity leaked.
- Feed sharing constructs `https://givehope.app/posts/${post.id}` and branded text locally (`feed/page-client.tsx:112-129`), rather than an owner-issued authorized public destination. It makes a visibility-sensitive operation look universally available.
- Feed maps every source post to Update, and Saved is local (`:373-440`). Story/Video filters have no source-backed type mapping. It fetches default ten posts without exposed paging.

Auth/server transport is a **Useful precedent**. Claims of redaction without enforcement, ignoring partner-only visibility, exposing raw author identity without the sensitive-display contract, and fabricating a share destination are **Conflicts with first principles**. Local bookmarks/type filters are **Temporary bridges**. Phase 22/23 own content, Phase 10 sensitivity, Phase 24 host/brand identity; Phase 25 owns coherent presentation of permitted content.

### 10. Database and provider evidence: do not repeat stale descriptions

The initial schema defines mutable donor totals, a single stripe_customer_id, coarse pledges, and preference booleans (`20250101000000_init_schema.sql:74-97,205-218,238-253`). Later foundation migration converts money to integer minor units and adds tenant/provider/schedule fields (`20260214090000_foundation_1_schema.sql:340-372,464-480,530-533`). These migrations exist in source; no claim is made that the hosted environment has applied them all.

The June 25 migration materially changes earlier demo posture: `20260625002117_canonical_tanstack_db_realtime_rls.sql:21-37` enables RLS on donor/profile/finance tables and removes public read, `:157-209` provides owner/staff donor/donation SELECT, `:234-259` scopes pledge SELECT, `:263-266` keeps preference/document internals server-only. Therefore the Phase 16 PRD's historical description of the legacy table as having no enforced RLS must not be repeated as current source fact. It remains a poor domain model for other independently demonstrated reasons.

No migration application, RLS execution, concurrency race, webhook replay, connected-account request, or browser collection authorization was tested in this audit. No live configurations, secrets, donor data, or financial records were examined.

### 11. What existing tests actually prove

<!-- prettier-ignore -->
| Existing file | Evidence it can provide | What it does not prove |
| --- | --- | --- |
| `tests/unit/packages/api/donor-portal/auth-ownership.test.ts:1-19,197-315` | Handler role invocation, generated tenant/donor filters, 404 handling, annual date bounds, selected error paths using mocks. | Actual PostgreSQL RLS, authenticated cross-user/tenant denial, grants, subject revocation, or concurrency. Auth and Supabase are mocked. |
| `tests/unit/packages/api/donor-portal/model.test.ts:5-147` | One synthetic snapshot mapping, status labels, receipt URL and payment-label behavior. | Correctness of official receipts, multi-currency totals, 250-row truncation, true provider inventory. Some assertions pin legacy semantics. |
| `tests/unit/packages/api/donor-portal/billing-boundary.test.ts:11-19` | Static presence of billingPortal call and absence of particular SDK calls. | Provider session account, permissions, donor scope, capability restrictions, allowed changes, webhook convergence. |
| `tests/unit/apps/donor/history-receipt-links.test.ts:15-35` | Source contains real anchor paths. | Issued artifact authority, protected access, correct document content, screen-reader usability. |
| `tests/unit/apps/donor/donor-history-tanstack.test.ts:11-12` | Shared hook/table adoption. | Runtime live query or auth. Collection query explicitly substitutes seed rows under NODE_ENV=test (`collections/donor-history.ts:170-175`). |
| `tests/unit/packages/database/donor-feed-posts.test.ts:166-231` | HTTP path/params and error handling under mocked fetch; pure view mappers. | Actual server redaction or audience permissions. |
| `tests/unit/packages/api/stripe-recurring-pledges.test.ts:59-280` | Mapping, tenant argument, terminal-cancellation behavior, invoice counter update shape under mocked DB. | Concurrent/out-of-order provider correctness, exactly-once facts, group/line ownership, live card/ACH semantics. |
| `tests/e2e/donor-giving-history.spec.ts:5-19` | A demo session and page eventually display either live or unlinked UI marker. | A passing test can accept the unlinked failure state. It does not assert donor amounts/ownership/history/artifact correctness. |

No pass/fail result for these tests is asserted here: this subagent read them only. Parent's earlier Supabase diagnostic checks are environment checks, not donor product proof.

Future Phase 25 completion needs the true owner contracts plus real PostgreSQL authz and concurrency tests; provider contract tests in authorized test mode; protected artifact tests covering stale/superseded/revoked cases; currency/date/partial-refund/correction projection tests; user/tenant/Party transition isolation; and accessible E2E of successful and denied ordinary donor actions. Polished mock screens, source-string tests, or accepting an error marker cannot be the finish line.

### 12. Founder questions worth considering after authority reconciliation

These are candidate unresolved product choices, not instructions to ask all of them. The parent should suppress any choice already answered in the complete predecessor documents. None reopens the owner boundaries, no-auto-access rules, group/line semantics, immutable artifacts, or required provider-hosted financial collection.

1. **Primary home hierarchy when ordinary work and exceptions coexist.** Should the first screen prioritize a small set of donor tasks plus explicit actionable exceptions, a chronological giving record, or the inherited six-module navigation? Recommendation: a calm task-oriented home, where a failed collection or needed authorization appears only with a source-owned next action; giving history/content remain available without dominating every visit. This is a presentation/orchestration decision, not creation of new financial status.
2. **No-linked-record experience.** When authentication succeeds but no authorized donor/Party link exists, what should the donor be able to do immediately? Recommendation: a useful neutral account home and a safe, explicit claim/help path, with no email matching that silently exposes history. Existing code mostly 404s; the access-proof standard is already settled, while support-only versus safe guided claim presentation may remain open.
3. **One place to complete a task that spans several owners.** For a method replacement affecting eligible recurring lines, does the portal present one reviewed selection/confirmation flow with source-owned outcomes, or separate wallet and recurring screens? Recommendation: one human task with explicit affected items and truthful pending/partial results, while underlying Phase 16 commands/provider proofs stay independent. Do not ask whether all lines move automatically; scope and authorization are source-owned constraints.
4. **Recovery after incomplete or delayed action.** What durable return point should donors see after provider verification, deferred collection, or document generation? Recommendation: an addressable task/result view showing the exact instruction, current source outcome, and next permitted action. It must not equate browser return, method tokenization, or a message with completed source effect. Existing code only redirects back to wallet.
5. **Current relationship versus historical truth in donor navigation.** How should a donor find past giving to an ended/renamed/sensitive designation while preserving authorized current display and immutable legal document facts? Recommendation: separate safe history context from the current discovery/continuation action, consuming the respective source labels. Do not invent redirects or rewrite the historical gift/receipt.

Highest leverage first question is likely the home/task hierarchy after the parent completes the predecessor audit. Identity scope must be established first if the documented subject model is still incomplete. The audit does not warrant asking the founder whether to keep raw-card React state, fabricated receipt text, false password saves, or email-as-authorization: those are already inconsistent with the required first principles.

#### Focused follow-up: return-visit hierarchy

The parent proposes a first decision between a stable service-first overview, a ministry-updates-first landing, and tenant-configurable home precedence. The inspected authority supports treating that as a genuine remaining presentation decision:

- `platform-surfaces/spec.md:43-49` settles self-service and clearly surfaced common tasks, but does not prescribe which component is first on a return visit or delegate that order to tenants.
- `roadmap.md:2833-2874` calls Phase 25 a complete self-service home, includes giving history with impact, and explicitly requires custom recurring UI over Phase 16 owner commands. It does not prescribe service-first versus updates-first landing precedence.
- `phase-16-pledges-recurring-commitments.md:553-562` settles recurring-line task detail and calm consequences; it does not settle the whole portal landing hierarchy.
- Current implementation starts with greeting and one Tax Receipt link (`donor-dashboard-main-body.tsx:54-76`), then three metrics (`:80-103`), then a large hardcoded story occupying eight of twelve desktop columns (`:105-132`) with the real five-item Ministry Updates widget beside it (`:140-205`). There is no ordinary-task group on this home beyond the receipt link; recurring/wallet/settings are top navigation destinations (`DonorSubNav.tsx:18-32`). Thus the existing story-heavy layout is an implementation precedent, not a founder decision that updates must dominate.
- `donor-dashboard/page-client.tsx:43-59` wraps this body in a loading skeleton driven by a 200ms artificial bootstrap (`use-donor-dashboard-bootstrap.ts:18-68`). That loading state does not wait for actual portal financial data. The main body defaults missing data to Partner/zero/General Fund (`donor-dashboard-main-body.tsx:39-45`). This reinforces the need to decide the genuine return-visit experience rather than preserve the current visual arrangement automatically.

Recommendation: a stable service-first overview with concise source-owned exceptions and common donor tasks, while retaining authorized Ministry Updates as a visible secondary section and dedicated destination. Prefer a stable layout over tenant-configurable task precedence because source-owned urgent actions and learned navigation should remain predictable; tenant branding/content can operate within their already-owned contracts. This recommendation is a product inference, not an already-ratified rule. No inspected accepted clause forces feed-first or tenant-configurable precedence. The parent should confirm against its broader predecessor research before presenting exactly one question.

### 13. Short inheritance disposition

- **Keep as durable patterns:** server-derived auth subject, explicit per-resource scope, API package ownership, real shared logout, independent API guards, private draft gating.
- **Use as precedents only:** query-backed page composition, pure display mappers, terminal-cancellation protection, namespaced provider idempotency, immutable receipt snapshot/replay ideas, shared reaction transport.
- **Replace temporary bridges deliberately:** legacy donor/pledge snapshot, billing-portal catchall, route-backed history adapter, single profile/donor context, coarse preferences, placeholder account recovery and local bookmarks.
- **Do not inherit implementation accidents:** fake wallet records, hardcoded impact, currency dropping/aggregation, source-state flattening, incomplete menu handlers, static sessions/2FA, name splitting as universal identity.
- **Reject conflicts with first principles:** raw PAN/CVC/bank collection in ordinary app state; false successful security/preferences actions; invented official receipt/statement truth; unsafe subject/tenant inference; absent partner/sensitivity enforcement; account fallback as financial-owner authority; mock-based completion claims.

## Phase 25 research: recurring, documents, and Stripe

Research only. No source, GitHub, provider, credential, or repository-setting mutation. Existing Supabase work was not touched. Provider probes were GET requests; no financial action, setup confirmation, subscription mutation, customer/portal-session creation, or account onboarding was attempted.

### Evidence scope

- Research date: 2026-09-06, with fresh GitHub and Stripe reads in this session.
- Source authority snapshot: `origin/develop` at **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**. All source line references below refer to this immutable SHA, not the older canonical checkout HEAD `ab1a1703a725be454376990a7fe68aef2e048026`.
- Instructions read: root `AGENTS.md`, `CLAUDE.md`, `openspec/project.md`, canonical `grill-with-docs`, `grilling`, and `domain-modeling` skills; installed Stripe `stripe-docs` skill. One founder decision at a time; look up facts; do not enact the plan before shared-understanding confirmation. This research adds no decision, spec, ticket, or dispatch authority.
- Memory was used only to locate the historical Statement Studio audit. Current source was then verified. In particular, the historical claim that `pdf_*` must remain canonical is superseded by ADR-0033's final-authority/cutover contract: names may be retained only when their final semantics qualify.

### Main conclusions

1. **Phase 16 already owns core donor recurring management.** Phase 25 is a consumer and portal/wallet completion phase, not a second lifecycle, retry system, or general provider administration product.
2. **Phase 19 and Phase 18 already own annual-document truth and exact-current access.** Phase 25 presents those authorities and their existing copy/help operations. It must not mint its own statements or expose obsolete PDFs as peer downloads.
3. **Representative authority is already ratified beyond document viewing.** A product question asking whether verified representatives may manage commitments risks reopening Phase 16 D14. A portal context switch/discoverability choice may remain open, subject to the Phase 3/4/9 authority audit.
4. **Current source is still materially behind this intent.** The recurring page redirects to Billing Portal, wallet operations use mock local state, and annual statements are recomputed text files.
5. **Stripe capability evidence is limited to the inspected default/test credential scope.** It has no connected accounts or portal configurations and no enabled platform payment capabilities. This is an environment readiness gap, not evidence that Stripe globally lacks the required features.
6. **Live issue graph inconsistency:** #811–#813 have body-listed blockers but empty native `blocked_by` lists. Their `status:blocked` labels and undispatched body instructions remain in force. #1017/#1023 have populated native blockers, all open.

### Ratified versus implemented

<!-- prettier-ignore -->
| Authority | Live state | Meaning |
| --- | --- | --- |
| [PR #465](https://github.com/Asymmetric-al/core/pull/465) | MERGED, 2026-07-15T23:10:31Z; merge `841934d5910ed8a3a2722742c696b1fd18a22b92`; head `9a44396d6c6b57f12ebb7144ed9c99f0fa73d85a` | Phases 0–16 planning package. Body explicitly says documentation/OpenSpec only, no runtime/schema/deploy/dispatch. Historical body says Phase16 issue set pending; newer live #793/#811–#813 prove issue publication happened later. Do not use historical PR-body tracking as current graph truth. |
| [PR #872](https://github.com/Asymmetric-al/core/pull/872) | MERGED, 2026-07-27T20:16:42Z; merge `3963361ddac763fb3dbd35bb97521a69fb74901e`; head `b886c2eb2fe4c98cc8723a232d860138c86b10c2` | Phases17–20 governed-operations specifications. Merged planning authority is not predecessor-runtime proof. |
| Phase16 PRD | Lines5–11: ratified D1–D19, groomed/not-built, undispatched | Its core contracts survive the later Phase18 document amendment at line15. ADR0012/0013/0014/0017 all have Accepted founder-ruling status at line3. |
| Phase19 PRD | Lines5–21: D1–D18 ratified, #977/#978–#1031 published, implementation not dispatched | ADR0040/0041/0042 and `add-statement-operations` govern. Phase17/18 planning acceptance does not imply those runtimes are live. |

### Recurring ownership and inherited decisions

Sources: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md` lines76–94,98–120,329,372–381,1001–1027,1954; `openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md` lines5–66,139–153; `roadmap.md` lines2850–2863.

- A recurring group has one Tenant, immutable Legal Entity, Commitment Party, legal-payer/collection-authorizer context, and currency. Incompatible values create separate groups. Independent destination lines share compatible billing cohorts; ordinary cadence has one provider execution leg, twice-monthly has two. Exact provider item mappings must preserve every line. Neither household/email/provider Customer nor a default settlement account infers business grouping.
- One initial gift per disclosed compatible cohort; never per destination line or twice-monthly leg. Dates are donor civil dates in a frozen giving timezone. Historical epochs and occurrences are immutable.
- Core actions are already mandatory: future amount/cadence/date/end/designation/payment-method changes; named-occurrence skip; bounded or indefinite pause; unchanged-grid resume; direct cancellation; stop recovery for one missed gift; fresh-authorized linked-successor restart.
- A noncalendar term change appends a term version without inventing a calendar epoch. Calendar changes append both the necessary term and epoch. A line-specific operation splits a shared cohort prospectively when needed; siblings cannot silently change.
- Saving a method or schedule is not an immediate charge, proration, catch-up, or backcharge. Explicitly making today eligible needs a separate exact charge confirmation. Already-submitted work stays visible and immutable.
- Local cancellation/stop instruction is accepted even when provider control is uncertain. Suppressing Asym work does not prove the external executor stopped; exact readback/reconciliation governs that claim and replacement.
- Card recovery is product-owned and bounded; provider retries cannot overlap it. ACH ordinary collection does not authorize silent same-occurrence retries; the narrow R01/R09 path needs exact rail/provider proof.
- Phase16 PRD line119 explicitly requires core self-service in Phase16. Phase25 may deepen preferences and portal breadth.

#### Representative authority: avoid reopening the policy

Phase16 PRD lines1003–1013 separates Commitment Party, representative, service contact, expected remitter, collection authorizer, legal donor, and recognition. Line1008 makes representation verified, effective-dated, evidence-bearing, revocable and optionally commitment/purpose/action scoped; it does not grant payment consent or staff capability. Lines1017–1027 distinguish identity repair from actual owner transfer and permit explicit household or organization ownership without inferring it from membership or shared contact. Line1954 independently requires portal/Party rules before reading or managing.

[Issue #810](https://github.com/Asymmetric-al/core/issues/810) reinforces this: a representative authority may be explicitly Party-wide (both optional commitment targets null), but role verification grants neither portal access nor collection authority. Self-giving creates no artificial representative row or extra question; organization/household/third-party cases use progressive disclosure. Recursive delegation, co-obligors, guarantors, and a general legal agreement graph are outside v1 (PRD line381).

**Potential genuinely open presentation question:** whether Phase25 launch includes a clearly scoped `My giving` / `Acting for [Party]` navigation context for already-authorized represented Parties, or initially uses exact-object authorized entry points. This must not become a new grant editor or a choice about whether inherited representative rights exist. Parent must first reconcile Phase3/4/9 and Phase24 presentation/account-brand scope. A generic question asking whether households or organizations should be supported is too broad and substantially re-asks settled policy.

### Documents: inherited owners and already-settled donor behavior

Sources: Phase19 PRD lines136–174,258–264,879–912; `add-donor-self-service` delta lines155–217; `add-statement-operations/specs/statement-operations/spec.md` lines104–133,939–1011; ADR0033 lines23–67; ADR0040 lines24–66.

<!-- prettier-ignore -->
| Concern | Owner / Phase25 consumption |
| --- | --- |
| Legal donor/Statement Subject, eligibility, official facts, corrections, coverage | Phase7; Phase25 never derives or merges it |
| Posted money/designation truth | Phase13 |
| Recognition | Phase14, purpose-separated informational support overview only |
| Definition/publication/request/logical current head/artifact bytes/access/records | Phase18 |
| Frozen run population, cutoff, item, recipient operation, release, copy fulfillment | Phase19 |
| Message content, consent, transport, delivery evidence | Phase17/6 |
| Portal layout/history/navigation | Phase25 through permission-safe projections and owner APIs |

- Household, spouse, shared mailbox/address, DAF advisory role, or staff preference never manufactures a Statement Subject or access. Legal donor, Recognition Subject, Delivery Recipient, and disposable Year Presentation Group remain distinct.
- One calm year group, official documents first, optional `Support overview — Not a tax document` second. Exact-current View/Download/Print/Send another copy/Help actions are already specified.
- Repeated authorized viewing, HEAD/range/full download and local print are unmetered. Each request reauthorizes exact object/current head/storage generation; all return the same immutable current bytes. No quota/counter, new document, issuance, delivery, fulfillment, or read claim.
- Predecessors remain governed evidence, not alternate donor downloads. Guest grant expiry ends that grant, not lawful signed-in access.
- A deliberate outbound copy is a separate bounded Phase19 operation. Equivalent unresolved artifact/recipient/route/destination-revision gestures deduplicate; another deliberate request is allowed after terminal resolution. Failed sending never removes direct access.
- The historical Statement Studio backlog is not an alternate implementation plan. Current ADR0033 permits old `pdf_*` names only if they satisfy the final canonical-authority contract, rather than requiring legacy schemas by name.

### Live issues, blockers, and duplicate boundaries

All five requested issues are OPEN with `status:blocked`; none has `ready-for-agent` in the live snapshot.

<!-- prettier-ignore -->
| Issue | Already-owned outcome | Body blockers | Native blockers observed |
| --- | --- | --- | --- |
| [#811](https://github.com/Asymmetric-al/core/issues/811) | Donor recurring detail/history/durable confirmations; no mock actions or Billing Portal bypass | #805,#806,#807,#808,#809,#810 | Empty |
| [#812](https://github.com/Asymmetric-al/core/issues/812) | Exact future-change preview/apply, topology/provider/authorization reproof | #798,#799,#809,#810,#811 | Empty |
| [#813](https://github.com/Asymmetric-al/core/issues/813) | Skip/pause/resume/cancel/fresh successor restart | #800,#809,#811 | Empty |
| [#1017](https://github.com/Asymmetric-al/core/issues/1017) | Separate official legal donor, recognition, delivery, presentation | #984,#575,#578,#579,#584,#695,#699 | Same seven; all OPEN/status:blocked |
| [#1023](https://github.com/Asymmetric-al/core/issues/1023) | Unmetered exact-current donor view/download/local print | #997,#950 | Same two; both OPEN/status:blocked |

The empty native edges for #811–#813 are a concrete graph hygiene gap, not permission to dispatch. Their bodies and blocked/undispatched instructions remain authoritative. Research did not alter graph metadata.

Additional reconciliation targets:

- [#810](https://github.com/Asymmetric-al/core/issues/810) owns independent roles and representative scope; reuse its contract.
- [#799](https://github.com/Asymmetric-al/core/issues/799) owns the exact SDK/API/account/mode/application/merchant capability matrix and evidence ingestion with an initially empty mutating command allowlist. Installed SDK capability alone is explicitly insufficient.
- [#706–#710](https://github.com/Asymmetric-al/core/issues/706) remain older Phase13 recurring work. Phase16 PRD lines2403–2407 explicitly supersede/re-scope their topology, provider-recovery, UTC/default-month pause and status assumptions. #708/#709 remain OPEN. Do not create a parallel Phase25 implementation for those outcomes.
- [#583](https://github.com/Asymmetric-al/core/issues/583) remains OPEN and still describes greyed superseded downloads, a permanent link, a live/official version-list model, and household joint view. Those parts conflict with current Phase18/19 exact-current/subject/grant contracts. Its user-access outcome overlaps #950/#1023 and needs reconciliation before implementation.
- [#580](https://github.com/Asymmetric-al/core/issues/580) remains OPEN and describes a Phase7-owned statement run/version/orchestrator. The newer Phase19 owner is controlling; do not revive a second run system.
- [#1024](https://github.com/Asymmetric-al/core/issues/1024) already owns repeatable bounded copies; [#1025](https://github.com/Asymmetric-al/core/issues/1025) owns contextual help; [#1031](https://github.com/Asymmetric-al/core/issues/1031) owns retirement of the live text statement at final release. These are inherited seams, not new Phase25 epics.
- [#1135](https://github.com/Asymmetric-al/core/issues/1135) is the Phase21 financial wallet/mutable-balance retirement; do not confuse that wallet with the donor saved-payment-method wallet.
- Parent should reconcile discovered Phase24 consumers [#1485](https://github.com/Asymmetric-al/core/issues/1485), [#1519](https://github.com/Asymmetric-al/core/issues/1519), and [#1515](https://github.com/Asymmetric-al/core/issues/1515): Account Brand through recurring controls and checked Money through recurring/document projections. All were OPEN/status:blocked in the search snapshot.

### Current source seams: observed, not inferred from PRDs

<!-- prettier-ignore -->
| Source at the pinned develop SHA | Observed behavior |
| --- | --- |
| `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx`:138–165,216–221 | Manage redirects through `useCreateDonorBillingPortalSession`; no Phase16 custom command UI |
| `packages/api/src/donor-portal/billing.ts`:17–46 | Looks up one donor Stripe customer, resolves tenant Stripe key, creates a generic hosted portal session; no exact connected-account request option or product-owned recurring preview |
| `packages/api/src/stripe/tenant-client.ts`:42–77 | Reads tenant secret/publishable key with environment fallback for an existing tenant; it is not the ratified exact Settlement Account Binding/Connect adapter |
| `apps/donor/app/(dashboard)/donor-dashboard/wallet/page-client.tsx`:1254–1256,1340–1435 | `MOCK_METHODS`/`MOCK_PLEDGES` seed component state; save/remove/swap modify local arrays. This is not live saved-method management despite Stripe-secure UI copy |
| `packages/api/src/stripe/recurring.ts`:18–42,254–274 | Legacy provider-to-`donor_pledges` status/counter bridge; cancellation is protected from late paid-event reactivation, but no final group/cohort/line command domain |
| `packages/api/src/donor-portal/statements.ts`:43–89 | Queries current donations, rebuilds totals/lines, returns `giving-statement-YEAR.txt` and `text/plain`; no canonical Phase18 PDF/current-head access |
| `packages/api/src/donor-portal/service.ts`:279–300 | Filters current donor/tenant donations in UTC year and then settled status |
| `packages/api/src/donor-portal/statements.ts`:56–60 | Sums amountCents across rows then uses the first row's currency for the overall total; inherited currency-risk evidence for the parent audit, not a new fix here |

Target final modules under `packages/api/src/commitments/recurring/` and a `StatementOperationsService` implementation were not present in the inspected file tree. Existing generated-document purpose-catalog admission is reusable evidence, not proof of a complete renderer/access/run pipeline. Current-develop source presence is not a production-deployment claim.

### Roadmap contradictions: current versus stale

- **Already fixed in current develop:** roadmap lines2850–2860 say custom UI over Phase16, bounded/indefinite pause, resume, direct cancel, fresh-authorized linked successor; not Billing Portal lifecycle authority. The old 1–12-month ceiling and resurrection of canceled authorization are not current normative scope. Do not spend the first grill question re-deciding these.
- **Residual wording:** roadmap lines2835–2842 still casually says “reactivate” and repeats approximately 8/10 retention and 26% cancellation-reduction numbers. Treat “reactivate” as shorthand constrained by the precise successor contract below it. These numeric claims were not freshly substantiated by this subtask and should not drive a product decision as established causal facts.
- **Real remaining collisions:** the stale source UI/API and older issues #580/#583/#708/#709; current PRDs/specs already supply their governing direction.
- **Not a fact:** “Stripe cannot pause subscriptions” or “Stripe cannot save/reuse methods.” Current official docs expose those capabilities; they do not provide Asym's independently managed line, civil-calendar, authorization, no-debt, and provider-control semantics automatically.

### Stripe: current official documentation and exact inspected capability evidence

#### Integration pins

- `packages/api/package.json`:192 and `bun.lock`:176,259,3801 pin **stripe 22.2.0**.
- `packages/api/src/stripe/api-version.ts`:13 pins **2026-05-27.dahlia**, passed by the sole `createStripeClient` factory at `client.ts`:5–6.
- #799 specifically requires compatibility decisions against this installed pin; newer docs do not authorize silently upgrading the adapter or adopting Accounts v2.

#### Read-only provider probe

Used the existing authenticated `stripe` wrapper, CLI 1.50.5. Requested `--stripe-version 2026-05-27.dahlia` on each GET. No `--live` request was made; this is the CLI default/test scope, not production proof. Credential material and private account fields were never emitted or persisted.

<!-- prettier-ignore -->
| GET | Sanitized result |
| --- | --- |
| `/v1/account` | Success; stable account-reference SHA256 prefix `8963d1989c04fe7f`; US, standard; `charges_enabled=false`, `payouts_enabled=false`, `details_submitted=false`, capabilities `{}`. Controller/dashboard/requirements authority fields absent/null in this response; absence is unknown, not a inferred controller type. |
| `/v1/accounts?limit=10` | Success; 0 connected accounts; `has_more=false` |
| `/v1/billing_portal/configurations?limit=10` | Success; 0 configurations; `has_more=false` |

Consequently there is no exact test connected-account object on which this credential scope can prove card/ACH enablement, application/merchant ownership, direct-charge subscription control, customer/method lineage, or production portal features. Research/grooming may continue, but these are unfulfilled #799 preflight/implementation gates. Do not infer the state of another tenant credential, another Stripe account, or live mode from these results.

#### Current official behavior

- [Customer portal limitations](https://docs.stripe.com/customer-management): multi-product subscriptions can be canceled but cannot be updated in the portal; subscriptions with a scheduled subscription-schedule update cannot be updated or canceled there. Portal UI is not iframe-embeddable. The supported-method table includes ACH but states customers cannot manually enter a new bank account in the portal. This argues for a narrow Stripe-managed collection surface plus Core-owned lifecycle/method-impact UI, not a blanket “Stripe does not support ACH” claim.
- [Subscription cancellation](https://docs.stripe.com/billing/subscriptions/cancel): a scheduled end-of-period cancellation may be withdrawn before it takes effect; an actually canceled subscription cannot be restarted, so renewed billing needs a new subscription. Core additionally requires a linked business successor and fresh authorization.
- [Pause payment collection](https://docs.stripe.com/billing/subscriptions/pause-payment): `pause_collection` may have a resume time or remain until unset; subscription status itself stays unchanged, invoice-handling behaviors differ, and preexisting invoices can still retry. A provider pause is therefore not a complete proof of no future/same-occurrence collection under Core's contract.
- [Connect subscriptions](https://docs.stripe.com/connect/subscriptions): direct-charge Customer and Price objects live in the connected account and requests are authenticated in that account scope. A platform cannot update/cancel subscriptions it did not create; disconnecting does not automatically cancel subscriptions. This supports exact binding/control quarantine, not optimistic adoption or automatic replacement.
- [Sharing saved methods for direct charges](https://docs.stripe.com/connect/direct-charges-multiple-accounts): Stripe supports cloning eligible `card` and `us_bank_account` methods from a platform to connected accounts. The clone has an independent identity and is not automatically kept in sync; setup-country/`on_behalf_of` considerations can require specific authorization. A global “set default” or “remove everywhere” action cannot pretend all merchant-scoped clones/subscription bindings changed atomically.

The Stripe sources were retrieved using the Stripe documentation tool and `stripe docs`, not third-party recollection. Documentation proves supported primitives; no financial mutations were used to claim end-to-end capability or customer authorization.

### Useful next questions, only after the parent authority audit

1. **Presentation/scope, not new delegation policy:** where to expose already-authorized represented Party work without adding ceremony to ordinary self-giving. Check whether account/Party switching is already fixed by Phases3/4/9/24 first.
2. **Wallet intent presentation:** when a donor changes a saved/default method, how prominently to distinguish “future new gifts” from explicitly selected existing recurring lines and their exact merchant-scoped bindings. This is a UX question within inherited preview/authorization/no-silent-sibling-effect rules, not permission to default-switch every commitment.
3. **Service versus impact emphasis:** Phase16 already fixes recurring detail as calm/manageable and Phase19 fixes documents current-first, but the overall Phase25 landing hierarchy may still be a product choice. This is less likely to reopen the settled financial/identity policy than a generic household-management question.

## Phase 25 benchmark and preference evidence

Research snapshot: 2026-09-06, Asia/Bangkok. Research only. All external feature statements below are **official documentation evidence**, not verified donor-account runtime. No provider login, financial action, message send, subscription change, or live test was performed. Public Pushpay help pages were read using the browser because the web text reader returned a CSS/loading error. No credentials were accessed.

Repository inspected: `[historical Core checkout]`, HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Read root AGENTS/CLAUDE, canonical grill-with-docs/grilling/domain-modeling and packages/api instructions. Root agent owns the live develop and specification-branch authority audit. Local PRD wording below is evidence of documented intent, not proof that implementation exists.

### High-leverage conclusions

1. A donor should see what a change affects and retain an easy cancellation path. Vendor retention gates are not Asym requirements. Pushpay documents direct cancellation and a fresh gift after cancellation, while Fundraise Up permits staff-required cancellation and an ordered reduction/pause retention path. Those are materially different choices, not an industry consensus.
2. Saving a payment method and selecting it for an existing arrangement are separate actions. Pushpay says adding a method does not move recurring gifts and blocks deletion while an active arrangement still uses it. Blackbaud supports applying saved methods to active recurring gifts; its historical support discussion records exactly the donor confusion caused when a wallet change affected only future gifts.
3. Joint or representative access needs a distinct, explicit grant. Church Center uses deliberate joint-donor linking and mandatory notices to both donors; household membership is merely a suggestion. Its combined-statement behavior is not authority to override Asym's legal-donor rules.
4. Representative scope is inherited, not a new yes/no decision: Phase 19 includes authorized representatives accessing exact current documents, and Phase 16 already includes their authorized future-giving management. Preserve both. Remaining research may examine identity selection, grant discoverability and explanations while consuming the existing owner contracts; do not reopen the accepted capability scope.
5. The settings screen currently simulates successful preference saves. The real feed-preference endpoint is a separate, coarse legacy path. The source-owned consent model must be extended and consumed, rather than treating either UI as the business definition.
6. Omit the roadmap's causal retention statistics. Original vendor sources exist, but do not establish that pause/skip itself retains 80% for a year or that amount modification causes a 26% reduction in cancellation risk.

### Benchmarks: journeys, limits, classifications

#### Planning Center / Church Center

- Current help page published September 3, 2026: My Giving works on web and app, gives overview/history/planned giving/notifications/statements, allows monetary versus in-kind history, year/fund filters, nondeductible filtering and CSV export. Recurring edits cover amount, fund, method, frequency/schedule/status. Statements are available only when released; an unavailable statement routes to the church's contact details. **Useful precedent:** service-first overview and truthful availability. Source: [Manage your giving information](https://help.planningcenter.com/en/140951-manage-your-giving-information.html).
- Recurring guide documents administrator and donor edits, split-fund support, indefinite or through-date hold, and that deleting a recurring donation does not stop an occurrence already in transit. **Durable pattern:** future schedule control is distinct from already-started payment execution. Its cadence menu and word “delete” are vendor choices, not Asym lifecycle authority. Source: [Recurring donations](https://help.planningcenter.com/en/138387-recurring-donations.html).
- The November 2025 redesign prioritized year/current totals, active arrangements with attention notices, pledge progress and easier payment access. The old wallet tab moved to the person's shared profile. **Useful precedent:** make routine next actions visible; a shared wallet location does not itself prove a safe cross-account boundary. Source: [Refreshed My Giving](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center).
- Staff deliberately join two donors, even across households; each gets a mandatory notice. The result shares history, statements and pledges. Disjoining removes shared-history access and restores separate attribution/statements. **Useful precedent:** explicit join/disjoin and visible notifications. **Conflict with first principles if copied wholesale:** Asym cannot create a joint legal statement merely because two profiles were joined. Source: [Joint donors](https://help.planningcenter.com/en/138371-joint-donors.html).
- Merging profiles moves active recurring/Text2Give arrangements but not saved methods; replacement methods must be assigned for processing to continue. **Useful precedent:** identity migration has payment consequences and needs explicit recovery, not a success-only merge. Source: [Merge duplicate profiles](https://help.planningcenter.com/en/138581-merge-duplicate-profiles.html).

#### Pushpay

- Public guide last updated June 1, 2026: Welcome → Active schedules → selected gift → Schedule Details → Edit allows amount, frequency, fee contribution, start/end dates and fund. The payment section separately selects an existing/new method. Actions → Pause/Resume includes review on resume. Actions → Cancel → Yes, cancel is direct; cancellation locks editing and requires a **new recurring gift** to start again. Pushpay support cannot change schedules on the donor's behalf; the organization supplies help. **Durable pattern:** canceled authorization is not resumable; **Useful precedent:** selected-arrangement scope and straightforward cancellation. Source: [Edit or cancel recurring/scheduled gift](https://help.pushpay.com/s/knowledge/How-to-Manage-My-Payment-Schedules).
- Public wallet guide last updated May 6, 2026: adding a method does **not** update recurring gifts. An active arrangement must be moved to another method before the old method can be deleted. Bank/ACH support is documented as US-only; this is a Pushpay limit, not a universal provider/Asym claim. **Durable pattern:** explicit dependency handling for method removal. Source: [Add, edit, or delete a payment method](https://help.pushpay.com/s/knowledge/How-to-Manage-My-Payment-Methods).
- February 2026 product release says recurring pause/cancel/edit changes sync to ChMS immediately; July 2026 begins phased single-Giving financial ownership. **Useful precedent:** missionary/staff views should consume the same source-owned lifecycle. This release statement is not proof all customer accounts are migrated. Source: [Pushpay releases](https://pushpay.com/product/releases/).

#### Fundraise Up

- Portal configuration permits organization-branded domain and user capability choices. Cancellation can require contact/feedback or permit donor cancellation after reduction/pause retention screens. Pauses offer 1, 3, or custom up to 12 months with automatic resumption; canceled plans can reactivate. **Useful precedent:** visible alternatives and branding. **Conflict with first principles** for obstructive contact-required cancellation; **vendor choice, not a durable constraint** for a 12-month ceiling or canceled-authorization reuse. Source: [Configure Donor Portal](https://fundraiseup.com/docs/donor-portal-configuration/).
- The supporter guide says plan edits affect only the selected recurring donation; pledge details expose next date, end date, paid progress and receipts per processed gift. **Durable pattern:** selected scope and future-effect disclosure. Source: [Supporter experience](https://fundraiseup.com/docs/donor-portal-experience/).
- Portal overview documents passwordless links expiring after 24 hours, and offline/external donations through specified CRM import integrations. **Useful precedent:** consistent branded access and history coverage; expiry and imported-record eligibility must be decided under Asym identity/import ownership. Source: [Donor Portal](https://fundraiseup.com/docs/donor-portal/).
- Recurring management preserves past installment campaign/designation/custom fields by default, while allowing optional historical reassignment; receipt-email preference does not prevent receipt generation. **Useful precedent:** future edits and delivery choices are distinct from historical documents. **Conflict with first principles if copied directly:** Asym requires source-owned correction authority for historical changes. Source: [Recurring plans](https://fundraiseup.com/docs/recurring-plans/).

#### Givebutter

- Current guide June 11, 2026: receipt management link works without creating an account; optional linking attaches a plan to a user profile. Donor can edit amount, frequency, status, next charge date, method and fee settings. Moving the monthly charge day uses a custom pause in its UI. **Useful precedent:** guest-first access and explicit plan linking. **Implementation accident if inherited:** disguise a schedule change as pause when Asym already has distinct owner semantics. Source: [Edit and manage recurring donation](https://help.givebutter.com/en/articles/4529176-how-to-edit-and-manage-your-recurring-donation).
- User profile history has notable limits: linked recurring transactions and logged-in auction purchases appear; one-time donations and guest auction purchases do not. Past receipts can be viewed/downloaded where listed. **Useful precedent:** disclose incompleteness; **Conflict with Phase 25 goal if copied:** silently equate account-linked transactions with complete giving. Source: [Personal user profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile).
- Admin/editor may cancel a donor plan, but cannot edit its payment details, amount or frequency for the donor. **Useful precedent:** donor/staff powers need explicit boundaries, not a blanket shared edit form. Source: [Enable and manage recurring plans](https://help.givebutter.com/en/articles/3216251-how-to-enable-and-manage-recurring-plans).
- Pledges are staff-managed with no donor-facing management; recurring plans have no end dates. These are limitations, not reasons to omit Asym's Phase 16 capabilities. Source: [Manage pledges](https://help.givebutter.com/en/articles/9708715-how-to-manage-pledges).

#### Blackbaud Raiser’s Edge NXT / Virtuous

- NXT official documentation distinguishes skip for a period, hold until donor resumes, and end future payments. Amount, fund, frequency, next date, end date and payment fields are editable for supported automated recurring gifts. **Useful precedent:** clear lifecycle concepts and source eligibility. Source: [Enable recurring management](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-au/content/ptl-feature-recurring-gifts.html).
- Current saved-method documentation supports future gifts and active recurring gifts. A Blackbaud product-manager thread documents the historic confusion when wallet changes only affected new gifts and a July 2024 improvement to explicitly apply methods to active arrangements. **Durable pattern:** show an explicit affected-arrangements selection, not silent migration. Sources: [Saved methods](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-au/content/ptl-feature-saved-payment-methods.html), [historical product-manager explanation and amendment](https://community.blackbaud.com/discussion/64784/donor-portal-updating-recurring-gifts).
- Giving history includes online/offline payments and distinguishes gift types; pledges themselves are excluded even though pledge payments appear. **Durable pattern:** commitments are not received giving. Source: [Giving history](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-au/content/ptl-gift-types-eh.html).
- Invitation links bind BBID to a constituent; generic signup uses name/email matching and ambiguous matches need assistance. This is not evidence of general organization-delegate access or consent grants. **Useful precedent:** supported ambiguity handling; **Conflict with Asym if blindly copied:** name/email match alone must not override Phase 4 claiming rules. Source: [Portal invitations](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-au/content/ptl-send-invite.html).
- Virtuous January 30, 2026 compares Giving versus Raise: wallet exists only in Giving, Raise shows only 25 recent offline gifts, changing email affects CRM differently, and only Raise permits staff impersonation. **Useful precedent:** document exact integration capabilities and incomplete history; do not assume one vendor brand means one capability set. Source: [Configure donor portal](https://support.virtuous.org/hc/en-us/articles/360051045552-How-Do-I-Manage-my-Donor-Portal-).

### Retention statistics disposition

- FRU's recurring use-case page currently markets approximately 80% monthly-plan survival after one year and also mentions pause/skip flexibility. It does not show a causal comparison proving pause/skip alone produces that retention. **Omit from Asym's rationale as a proven effect.** [Vendor use case](https://fundraiseup.com/use-cases/recurring-giving/).
- FRU's portal marketing page says changing amounts reduces cancellation likelihood by 26%. Its original Pulse of the Donor PDF instead reports that 26% of recurring donors who click Cancel do not complete cancellation. General methodology covers anonymized transactions from 500+ nonprofits across four countries, with at least one year on FRU; it does not isolate amount edits from pauses or establish causal treatment effects. **Do not repeat the roadmap causal claim.** [Marketing claim](https://fundraiseup.com/features/donor-portal/), [Pulse PDF, rendered spread 28–29 / PDF page index 14; methodology PDF index 2](https://engage.fundraiseup.com/hubfs/Pulse%20of%20the%20donor%20report.pdf).
- Supportable qualitative rationale: donors need flexible, understandable controls; measure actual successful task completion, support-contact reduction, recovery completion and cancellation accessibility in Asym. Do not turn retention into a reason to obstruct cancellation.

### RFC 8058, Gmail, Yahoo — refreshed 2026-09-06

- RFC 8058 requires one HTTPS List-Unsubscribe URI, List-Unsubscribe-Post with the specified single key/value, DKIM coverage of both headers, a POST without cookies or HTTP authentication, and no redirect. The URI identifies recipient and list; use a hard-to-forge opaque token. Multipart form data is recommended and URL-encoded form data permitted. Sender processing must not ask additional questions. **Durable pattern:** narrow token-authorized POST; ordinary GET remains non-mutating to avoid scanner-triggered changes. [RFC 8058 §§3–4](https://datatracker.ietf.org/doc/html/rfc8058).
- Gmail requires one-click for relevant marketing/subscribed bulk mail and a visible body unsubscribe. Subscription guidance adds address confirmation, fulfillment within 48 hours, separation of subscription from non-subscription senders, and identifiable lists (List-id or distinct From). This is a maximum compliance window, not an Asym target to delay opting out. [Sender guidelines](https://support.google.com/mail/answer/81126?hl=en), [Subscription guidelines](https://support.google.com/mail/answer/15263077?hl=en).
- Gmail FAQ explicitly says a preferences landing page or mailto alone does not satisfy its RFC 8058 requirement; unsubscribe can affect the list associated with the message rather than all mail. Inbox UI appearance depends on Google's eligibility checks and is not guaranteed by merely setting headers. [Gmail FAQ](https://support.google.com/mail/answer/14229414?hl=en).
- Yahoo requires relevant easy unsubscribe within two days and visible body control; its current best-practices wording still permits mailto but recommends POST. Asym should implement the stronger common RFC 8058 contract needed for Gmail. Transactional messages are excluded from Yahoo's one-click obligation; that does not exempt them from delivery safety. [Yahoo best practices](https://senders.yahooinc.com/best-practices/), [Yahoo FAQ](https://senders.yahooinc.com/faqs/), [Subscription Hub](https://senders.yahooinc.com/subhub/).

### Core comparison: implemented and documented intent are different

#### Current code evidence

- `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:448–499`: local notification booleans include receipts, monthly statements, updates, newsletters, appeals and SMS. Save uses timeouts and reports success without a request. **Implementation accident:** prototype state is not a contract or real consent preference.
- `packages/api/src/feed-preferences/index.ts:7,47–68,104–111,137–205`: real GET/POST persists `donor_feed_preferences`, but resolves donor by matching auth email and writes the hard-coded default tenant. **Temporary bridge at best; conflict if reused as authority:** bypasses the intended Party/tenant context. RLS exploitability was not tested; this is source-shape evidence.
- `packages/api/src/donor-portal/model.ts:492–501` defaults missing email feed flags true; the feed endpoint defaults them false. **Implementation accident:** divergent fallback meanings. Searches of packages/apps find stored/read flags but no sending consumer for these flags.
- `packages/api/src/email/consent.ts:178–234` is a real reusable read gate. It rejects do_not_contact and known hard suppressions for all mail; do_not_email/list unsubscribe block marketing; lookup failure throws. It has no topic, consent-provenance or contact-revision input. **Durable pattern:** fail closed and distinguish marketing from required service; **Temporary bridge:** donor booleans and address-level lookup.
- No `List-Unsubscribe` or `8058` implementation matches found in packages/apps/supabase/tests outside Markdown at this HEAD. This search is not proof of absent behavior in providers or unmerged branches. No execution tests were run in this research subtask.

#### Existing owner decisions to preserve

- Phase 3 PRD:294–310: self-service receipt access is not blocked by outbound consent; per-topic/channel preference center is reserved beyond the current boolean floor.
- Phase 6 PRD A8/A9:152–154: evaluate consent once at send, freeze the actual result, keep suppression source/provenance and downstream export eligibility; newsletter integration is a later seam.
- Phase 6 A17:175: final dispatch is the atomic boundary. A withdrawal/change before it stops eligible unstarted work; afterward the send is already in flight. This avoids the impossible promise that an opt-out retracts bytes already handed to a provider.
- Phase 17 PRD:1457–1471: product consent, contact ownership/validity, provider suppression and delivery outcomes are separate; profile changes never clear suppression; old failed occurrences do not replay automatically. Scoped RFC 8058 headers/POST, both encodings, inert GET, idempotent 2xx and DKIM proof are already documented.
- Phase 17:1361: SMS is planned/noninteractive, with no donor enrollment until the later channel proof gate. Current SMS toggles must not appear operational.
- Phase 19:184,273,547,881,908,1073: explicit representatives may access exact-current artifacts and permitted copies using object-scoped portal authorization; revocation fails closed. This is inherited document scope, not an automatic grant to control a payment method or recurring intent.
- Phase 16 `phase-16-pledges-recurring-commitments.md:372–381,1008–1027,1954` and implementation dependency #810 already govern explicit authorized representatives managing future giving. Root's recurring-agent audit identified this additional authority after the initial benchmark pass. Representative management scope is settled; access to documents, wallets and recurring actions must still follow their separate owning permissions.
- Phase 9:273–274,859–865: household membership grants zero portal access. Phase 7:48–55: household/shared contact/soft credit does not create official joint statements. No benchmark justifies reopening those principles.

### Candidate founder decisions and dependencies

Root-selected first question R01: **Should the donor home open with a stable service-first overview, or lead with Ministry Updates?** Recommend the service-first overview: immediately show genuinely actionable giving/payment issues and stable access to recurring giving, history and current documents, while reusing the existing Updates surface for ministry content. This is a recommendation awaiting founder ratification, not a new requirement. Planning Center's [November 3, 2025 My Giving redesign](https://www.planningcenter.com/changelog/giving/improved-refreshed-my-giving-experience-in-church-center) is a useful precedent: overview exposes active arrangements needing attention and direct wallet access on both mobile and web. Its [current donor guide](https://help.planningcenter.com/en/140951-manage-your-giving-information.html) confirms the overview with distinct history/planned-giving/notifications/statements. These document an actual described journey, not measured Asym outcomes or vendor runtime verification.

Representation navigation/grant discoverability can be explored later only where still unresolved: a church treasurer must clearly distinguish acting for the church from personal giving, and understand why a document permission does not itself authorize changing a particular arrangement or method. Preserve Phase 16/19 scope and Phase 4/9/12 ownership; do not ask whether explicit representatives should be allowed at all.

Preference question candidate for later: define what donors subscribe to as a stable product promise—organization topics and separately chosen missionary updates, with a channel-specific preference for each supported stream. Resolve what “stop updates from this missionary” affects without changing portal feed visibility, other missionaries, receipts, security notices or newsletter consent. Avoid an arbitrary tenant-created taxonomy unless actual need justifies long-term complexity.

Coverage requiring further work by the full grooming session: home hierarchy; representation navigation and grant discoverability where not already settled; donor-visible topic catalog/provenance/resubscription; contact revision changes and merges; source eligibility and provider dispatch races; governed historical/imported coverage; receipts versus statements; per-currency totals; migration and concurrency proofs; mobile/a11y and slow-network journeys. No readiness claim.
