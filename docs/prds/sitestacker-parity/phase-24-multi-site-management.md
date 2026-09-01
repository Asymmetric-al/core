<!-- phase24-to-spec:multi-site-management:v1 -->

# Phase 24 — Full Multi-Site, Language & Currency Management

> SiteStacker Parity Program · Phase 24. This is the implementation-ready
> synthesis of founder decisions D1–D18 and D57–D84. Decisions D19–D55 are
> preserved cross-phase evidence, not Phase 24 launch gates. The deferred D56
> question remains outside this phase.

**Status:** Specified; implementation pending.
**Tracker:** [GitHub issue #1431](https://github.com/Asymmetric-al/core/issues/1431).

**Normative companions:** the repo-root glossary, accepted Phase 24 ADRs, the
Phase 24 grooming decision log, and OpenSpec change
`add-multi-site-management`, with
`docs/prds/sitestacker-parity/phase-24-multi-site-management-traceability.md`.
Where current code differs, this document states the intended behavior; current
code is migration evidence, not authority.

## Problem Statement

Asym currently has Site, locale, and currency-shaped seams, but it does not yet
have a safe staff product for operating several public ministry websites. A
Tenant cannot reliably create and retire a second Site, prove and move custom
domains, publish exact-locale experiences, manage donor presentment currencies,
or understand how these actions affect public routes and giving. Existing
runtime assumptions—one public host, host-blind or null-Site reads, mutable CMS
heads, USD/two-decimal formatting, and provider-shaped status—are not adequate
authority for public identity or money.

The result is risk on both sides of the product. Staff can be asked to reason
about DNS, Vercel, Stripe, locale fallback, and route collisions without one
clear workflow. Donors can encounter the wrong brand, language, currency, or
gift meaning if the platform guesses. A domain move or Page edit can also
silently change an old public address unless identity and purpose continuity
are explicit. Those failures are especially costly for missions organizations:
public trust, donor intent, historical attribution, merchant identity, and
restricted ministry information must remain correct even when setup is partial
or an external provider is uncertain.

## Solution

Build one self-service multi-Site management product across Mission Control and
Web Studio while preserving strict domain ownership:

1. Give each Tenant one behavior-neutral Site model with private setup,
   explicit activation, independent website and public-Giving controls, and
   permanent retirement.
2. Give every public Site exactly one Primary Site Domain and optional
   redirect-only Site domains. Use fresh proof for claims, owner-cleared
   disconnection, and a prepared same-Tenant Site-to-Site cutover.
3. Make locale-bearing public routes explicit under the permanent
   `/lang/{exact-locale}` base. Publish each Site Locale deliberately through a
   small, code-owned critical-path contract; never substitute another locale
   at runtime.
4. Give each Site complete immutable Brand Versions, while keeping one stable
   Tenant Donor Account Brand and, for each activated environment, exactly one
   verified Tenant Donor Portal host.
5. Let staff enable only proof-qualified presentment currencies and reviewed
   native suggested amounts. Let donors retain explicit currency control; a
   currency change preserves a target-valid schedule while clearing affected
   money/payment state; a frequency change preserves currency while clearing
   affected schedule and dependent money/payment state. Either requires
   confirmation once meaningful input exists.
6. Treat translation source preferences as authoring convenience only. Copy
   from an exact qualified saved or published revision, show source issues
   honestly, and keep public freshness and safety decisions source-owned.
7. Preserve old-address meaning through explicit, Page-owner-qualified
   continuity. A material Page-purpose change creates a new Page identity and
   route through one atomic private handoff; it never mutates public truth by
   implication.
8. Keep Supabase/Postgres as operational authority and use Payload, Vercel,
   Stripe, DNS, caches, and UI projections only through bounded adapters and
   evidence contracts. Every authoritative mutation is scoped, atomic,
   idempotent, auditable, and safe under retries and unknown external outcomes.

## User Stories

1. As a Tenant administrator, I want to create a new Site as private setup, so that no host, publication, provider, cache, or money effect occurs before I am ready.
2. As a Tenant administrator, I want Site purpose to explain why the Site exists without changing behavior, so that ordinary labels never become hidden authorization or routing rules.
3. As a Tenant administrator, I want setup guidance to distinguish a Site from a domain alias, locale, campaign, specialized Page, and donor portal, so that I do not create unnecessary Sites.
4. As a Tenant administrator, I want exactly one Default Site selected for staff convenience, so that new private work starts in a predictable workspace.
5. As a visitor, I want unknown or malformed hosts to fail closed instead of opening the Default Site, so that one Tenant or Site never leaks into another address.
6. As a content editor, I want to copy one exact Page or Article revision into a new Site as an independent private draft, so that reuse does not create synchronization or inherited authority.
7. As a Tenant administrator, I want a production-faithful preview and one explicit Go live review, so that the first public activation is deliberate and understandable.
8. As a Tenant administrator, I want the core website to launch without requiring Giving, messaging, redirect domains, or every extra locale, so that unrelated optional capabilities do not block a safe website.
9. As a Tenant administrator, I want to take a website offline independently from pausing Site-public gifts, so that I can contain the smallest affected capability.
10. As a Tenant administrator, I want to pause new public-checkout gifts from one Site without stopping sibling Sites, portal gifts, staff entry, imports, or existing recurring commitments, so that containment is precise.
11. As a donor with a pre-admitted checkout, I want a later Site pause not to duplicate or silently discard my in-flight operation, so that the platform resolves the already-admitted gift truthfully.
12. As a Tenant administrator, I want a required reason and exact consequence confirmation for suspension actions, so that a high-impact click is not mistaken for a harmless toggle.
13. As a Tenant administrator, I want to retire a Site only after it is offline, Site-public giving is paused or unused, and another Default Site exists, so that retirement cannot strand public behavior.
14. As a future auditor, I want Site retirement to be terminal while historical attribution and source-owned records survive, so that identity is never reused and history stays interpretable.
15. As a staff member discarding a never-public Site, I want the action labelled Discard setup while using the same terminal safety contract, so that the UX is plain without adding a second deletion seam.
16. As a donor or visitor, I want an old retired-Site address to return a neutral real 404 unless an exact owner-qualified ordinary-content successor exists, so that the response reveals no private history and never guesses.
17. As a Domain Manager, I want every public nonretired Site to have exactly one Primary Site Domain, so that canonical public origin is unambiguous.
18. As a Domain Manager, I want optional Redirect Site Domains to redirect only owner-qualified website navigation, so that they never become duplicate serving origins.
19. As a donor, I want Giving, checkout, callback, authentication, API, and protected routes to retain their own behavior on a redirect domain, so that a whole-domain redirect cannot corrupt intent or security.
20. As a Domain Manager, I want apex and `www` treated as explicit domains rather than implicit aliases, so that DNS conventions never bypass ownership review.
21. As a Domain Manager changing the Primary Site Domain, I want to choose either Redirect eligible website visits or Stop website use on the old domain, so that the former address has explicit meaning.
22. As a Domain Manager, I want a focused before-and-after review of the new and former domains, so that I understand website effects and the incompleteness of known external placements.
23. As a visitor following an eligible former-domain website link, I want at most one clean server redirect to the exact final Primary destination, so that there are no chains, loops, inherited fragments, cookies, or unsafe query carry.
24. As a Domain Manager, I want to disconnect a custom domain only after every registered owner proves it has no positive Core hosting dependency, so that another route is not accidentally broken.
25. As a Domain Manager, I want domain disconnection to explain that registration, DNS, renewal, email, and history remain unchanged, so that Core does not imply ownership it does not have.
26. As a Domain Manager, I want an uncertain Vercel disconnection to remain fenced and visibly Needs attention, so that ambiguity is not rounded into a successful release.
27. As a Domain Manager, I want to add a previously disconnected hostname through fresh DNS proof, so that a former binding or prior Site meaning never carries forward.
28. As a Domain Manager, I want a resumable exact-host TXT challenge with copy actions, expiry, last checked time, and Check again, so that verification is straightforward on desktop or mobile.
29. As a Tenant, I want simultaneous valid claims for one hostname to have one constraint-enforced winner without disclosing another Tenant, so that global uniqueness and privacy both hold.
30. As a Domain Manager, I want Domain verified and Not public shown as separate states, so that proof, Vercel assignment, TLS, DNS routing, and public activation are never conflated.
31. As a Domain Manager, I want to prepare a still-connected hostname move between two Sites in my Tenant, so that I do not have to disconnect and race to reclaim it.
32. As a Domain Manager, I want the destination role initially unselected and a replacement required for a source Primary, so that a cutover cannot create zero or two valid Primary domains.
33. As a visitor, I want a prepared domain move to allow a bounded neutral gap but never two favorable Sites, so that cutover truth remains safe even under failure.
34. As a Domain Manager, I want existing web-address blockers shown exception-first before a Site-to-Site move, so that ordinary qualified or not-found routes do not create busywork.
35. As a route owner, I want complete deterministic source/destination manifest comparison, so that a domain move never depends on crawling, heuristics, or incomplete UI state.
36. As a future maintainer, I want Core to maintain separate small, well-defined, versioned locale-publication and Domain owner-family manifests, so that each critical path stays explicit without sharing membership or creating an adapter framework.
37. As a visitor, I want source-only ordinary addresses on the destination host to be durable real not-found outcomes, so that later Pages cannot silently reuse prior meanings.
38. As a Site administrator, I want one stable Site Locale identity per exact BCP 47 meaning, so that language, script, and region distinctions are not guessed or merged.
39. As a visitor, I want every favorable locale-bearing public URL under `/lang/{exact-locale}`, so that an explicit address always has one language meaning.
40. As a visitor, I want direct locale URLs never to negotiate or fall back based on browser, cookie, IP, profile, currency, or default locale, so that the content I requested is predictable.
41. As a visitor, I want the locale-neutral Site root to issue one 307 to the current ready Default Site Locale homepage, so that the bare domain remains useful without becoming a language resolver.
42. As an API or form client, I want unsafe or unsupported methods at the Site root not to redirect, so that request bodies and side effects cannot cross into a public Page.
43. As a Tenant administrator, I want changing the Default Site Locale to leave explicit Page, Giving, QR, document, and message addresses unchanged, so that one convenience choice does not rewrite history.
44. As a Tenant administrator, I want to save one private Default Site Locale Plan for an unready future default, so that my intent survives while the current website remains unchanged.
45. As a Tenant administrator, I want Plan blockers to link to their source-owned actions without choosing arbitrary assignees, so that ownership and access remain honest.
46. As a Tenant administrator, I want clearing all Plan blockers to mean Ready to review rather than automatic activation, so that a fresh human preview and activation remain mandatory.
47. As a Tenant administrator, I want a Default Site Locale Plan with no deadline, launch date, countdown, overdue state, timer, or automatic switch, so that coordination does not become a false public promise.
48. As a locale manager, I want to prepare and production-preview a Site Locale privately, so that incomplete work has no public or cache effect.
49. As a locale manager, I want the first locale to participate in Site Go live and every later locale to have its own explicit Publish action, so that activation remains clear without duplicating workflows.
50. As a locale manager, I want the publication review to show only critical blockers and a safe unavailable-content aggregate, so that I can act without reviewing every ordinary Page.
51. As a visitor, I want untranslated ordinary content omitted rather than replaced by another language, so that an exact-locale Site never misrepresents fallback content as translated.
52. As a visitor, I want an explicit authorized Read this story in English link only when a same-resource relation exists, so that alternatives are deliberate navigation rather than substitution.
53. As a Tenant administrator, I want each Site to have complete immutable Brand Versions, so that a public release cannot mix a current logo with stale colors or typography.
54. As a Site editor, I want a bounded Website appearance workspace with identity, semantic colors, compatible type, and finite style choices, so that I can create a strong brand without code or unrestricted CSS.
55. As a Site editor, I want to copy compatible account-brand inputs into a Site draft once without live inheritance, so that starting quickly does not couple future brands.
56. As a visitor or donor, I want optional image failure to fall back to trusted Site text and required brand corruption to block release, so that the platform never leaks another brand or a platform placeholder.
57. As a donor, I want one current verified Tenant-owned portal host in each activated environment and one stable Tenant Donor Account Brand across sign-in, recovery, history, documents, and recurring controls, so that entering from different Sites never fragments my account.
58. As a donor, I want the entry Site shown only as validated secondary context or a safe return action, so that Site branding never becomes account authorization.
59. As Site staff, I want one compact read-only Messages readiness summary derived from the message owner, so that I can see exact exceptions without duplicating message configuration.
60. As Site staff, I want message status to distinguish Ready, Uses compatible fallback, Needs attention, Checking, and Status unavailable, so that provider uncertainty is not presented as tenant misconfiguration.
61. As a donor, I want a currently qualified local presentment currency suggested only for an empty gift intent, so that the form is convenient without taking away my choice.
62. As a donor, I want my explicit currency choice to win for that gift intent and one cart to remain one currency, so that locale or location never changes money behind my back.
63. As a donor, I want the ISO code and localized currency name visible before amount and repeated through authorization, confirmation, receipt, and history, so that the charge meaning stays clear.
64. As Site staff, I want to add a presentment currency through one inline read-only qualification check, so that I do not need a Stripe console checklist or synthetic charge.
65. As Site staff, I want qualification results separated by supported giving mode, so that one-time readiness does not imply recurring readiness.
66. As Site staff, I want one explicit save to update Site currency intent only while current qualification and policy revisions still match, so that stale evidence cannot enable a donor option.
67. As a donor, I want checkout to re-prove my exact currency, amount, cadence, payment method, connected account, and limits immediately before the first provider effect, so that setup proof is never treated as payment acceptance.
68. As a donor, I want a pristine currency change to happen immediately, so that an empty form stays fast.
69. As a donor with entered money or payment state, I want a consequence-specific Change currency confirmation that starts on Keep current currency, so that I cannot erase financial input accidentally.
70. As a donor changing currency, I want purpose and other revalidated nonmoney intent preserved while all amounts, allocations, fee meaning, totals, payment authorization, client secrets, and provider attempt meaning clear, so that no FX or stale state is implied.
71. As a donor, I want the target currency's suggested amounts shown unselected and focus returned to the first amount after a successful change, so that recovery is immediate and accessible.
72. As a donor, I want a currency-change failure or stale proof to leave my complete source cart untouched, so that a failed transition loses nothing.
73. As Site staff, I want zero to six reviewed native suggested amounts per currency and exact cadence, so that donor choices feel local without building an FX engine.
74. As Site staff, I want an intentionally empty amount set to produce a clean custom-only flow, so that every qualified currency remains usable.
75. As a donor, I want currency and frequency selected before an unselected amount choice plus Other amount, so that the value I enter has clear units and schedule.
76. As a donor, I want a pristine frequency change to happen immediately and a material change to explain exactly which amount, dates, fee, payment, and authorization state will clear, so that schedule changes are understandable.
77. As a donor with several gift lines, I want a frequency change to preserve the affected purpose and unrelated lines while rebuilding only the smallest required grouping closure, so that editing one line does not erase my cart.
78. As a donor, I want an accepted gift or recurring agreement never to change currency or schedule through this editing flow, so that historical and provider truth remain immutable.
79. As a translator, I want each target revision labelled Translated, Independently authored, or legacy unclassified, so that freshness is based on explicit provenance rather than inference.
80. As a translator, I want an authoritative source change to mark a translated target Out of date without automatically withdrawing ordinary reviewed public content, so that editorial drift remains visible but proportionate.
81. As a source owner, I want a safety-governed source successor to decide whether affected translated public use may continue, so that safety containment stays with the authoritative source.
82. As a visitor, I want source-owned withdrawal to remove only the smallest complete affected closure and never substitute another language, so that adverse behavior is safe and honest.
83. As a locale manager, I want an optional ordered list of Suggested translation sources for Copy and Compare, so that frequent authoring choices appear first without becoming a runtime fallback chain.
84. As a translator, I want every omitted but authorized source locale still available and no source preselected, so that staff preference cannot hide or choose provenance.
85. As a translator, I want to copy either the exact Latest saved draft or exact Current published version when qualified, so that I can work from the intended source head.
86. As a translator, I want an exact private source checkpoint retained when needed, so that later source edits cannot rewrite what my target came from.
87. As a translator, I want a private-based target blocked from first publication until its basis matches or is reviewed against an authoritative current source publication, so that private work cannot masquerade as published provenance.
88. As a translator, I want Copy Qualification to prove every source input has a lossless treatment before the choice is enabled, so that unknown or silently omitted blocks never enter a translated target.
89. As a translator, I want non-gating Details to finish, Suggestions, and source issues visible beside an otherwise qualified source, so that I can make an informed choice without confusing publication readiness with copy safety.
90. As a translator, I want only qualified heads in the Source version RadioGroup and one visible Unavailable source versions list immediately after it, so that choices remain clean and problems remain discoverable.
91. As a translator with no qualified source head, I want Start blank draft as the direct primary action, so that I never face a disabled Create button or dead end.
92. As an ordinary Page owner resolving a domain-move collision, I want to compare one fixed source and target pair and explicitly decide whether the target preserves subject, substantive purpose, and visitor task, so that old-address continuity is human-qualified.
93. As a visitor, I want an ordinary Page successor relation to be directional, path-specific, nontransitive, and exact-evidence-bound, so that similarity cannot spread address authority.
94. As a Page editor, I want routine meaning-bearing updates to preserve a sparse current purpose-continuity version only after I explicitly confirm the Page still serves the same purpose, so that later edits remain safe without per-release requalification.
95. As a Page editor, I want unchanged effective meaning dependencies to publish without a continuity prompt, so that delivery-only rebuilds and autosaves create no friction.
96. As a Page editor making a material purpose change, I want the candidate blocked from publishing through the existing identity and offered Move saved changes to new Page draft, so that the old address never silently changes meaning.
97. As a Page editor, I want the handoff review to show old and new title, Parent Page or Top level, full address, copied content, repairs, exclusions, and source cleanup, so that the one action has understandable consequences.
98. As a Page editor, I want one atomic handoff to create exactly one private target, preserve protected source History, clean only changed Page-owned draft axes, and fence stale leases, so that retries or failures cannot split the move.
99. As a Page editor, I want an exact never-public draft path adopted by the target only when the source is the sole proved private claimant and no equivalent was ever public or protected, so that a safe draft address does not require an arbitrary suffix.
100. As a Page editor, I want descendant private paths re-derived as one complete qualified closure when source cleanup changes them, so that child identity, content, order, Navigation, schedules, references, and public facts stay intact.
101. As a Page editor, I want an always-visible permission-safe count and proportional descendant address examples before handoff, so that a large source tree is not a surprise.
102. As a Page editor, I want the target to preserve a positively proved explicit sibling position or otherwise use a positively recorded append-last default, so that placement reflects intent without adding a new question to the common path.
103. As a Page editor, I want unknown or stale placement provenance to return to ordinary placement review instead of silently appending, so that legacy uncertainty never fabricates intent.
104. As a Tenant user, I want every list, count, status, and action permission-filtered without exposing hidden resources or foreign Tenant existence, so that self-service does not become an enumeration channel.
105. As a keyboard or screen-reader user, I want every setup, review, confirmation, status, and recovery journey to meet WCAG 2.2 AA with logical focus and announcements, so that high-impact work is independently operable.
106. As a mobile staff user, I want the same actions and consequence detail at 320 CSS pixels and 400% zoom, so that field work does not require a desktop.
107. As an international user, I want native language labels, RTL and bidi isolation, CJK-safe layouts, IDN-safe domain display, local dates, and explicit time zones, so that identity and meaning remain clear.
108. As a low-bandwidth user, I want saved work, resumable provider checks, durable progress, and honest unknown outcomes, so that a dropped response does not cause duplicate or hidden effects.
109. As a security administrator, I want actor, Tenant, Site, owner, role, capability, and audit identity derived from trusted server context, so that caller-controlled IDs cannot cross an authorization boundary.
110. As a database administrator, I want tenant-aware structural keys, restrictive deletion, explicit grants, RLS read and mutation checks, and equivalent privileged-path enforcement, so that permitted updates cannot move rows into forbidden scope.
111. As an operator, I want every authoritative command to use expected revisions, semantic idempotency, deterministic lock order, durable receipts, and a same-transaction outbox only when secondary work exists, so that concurrency and retries conserve one business effect without placeholder jobs.
112. As an operator, I want provider work outside database transactions and an adverse fence before destructive external changes, so that Vercel, DNS, or Stripe uncertainty cannot restore favorable product state.
113. As an auditor, I want technical attempts, durable business history, security audit, and user-visible operation outcomes to remain distinct, so that staff can understand and safely repair what happened.
114. As a developer, I want public readers to consume one immutable current generation and never provider status or mutable CMS latest state, so that rendering cannot mix versions.
115. As a developer, I want all money parsed, stored, compared, and formatted as checked integer minor units plus ISO currency metadata, so that JPY, BHD, ISK, HUF, and TWD cannot be processed with a blind factor of 100.
116. As a developer, I want Site, locale, currency, domain, and Page management implemented through owner-specific contracts rather than generic settings or workflow engines, so that Phase 24 remains maintainable.
117. As a release manager, I want readers, constraints, and adverse fences deployed before writers and favorable activation, so that mixed-version rollout fails safely.
118. As a release manager, I want rollback to disable new commands while retaining immutable history, claims, receipts, and compatible readers, so that already-written truth is never undone.
119. As a product owner, I want every user-visible requirement traced to a decision, OpenSpec scenario, test seam, and release proof, so that implementation completion is independently verifiable.
120. As a support operator, I want one owner-specific next action and a durable operation receipt for every Needs attention state, so that repair never requires direct database editing or tribal knowledge.

## Implementation Decisions

### 1. Authority and current-state posture

- Founder decisions D1–D18 and D57–D84 are normative for Phase 24. D19–D55
  remain useful review/access-governance evidence but are not launch gates.
- The current one-host, null-Site, mutable-latest CMS and USD-shaped runtime is
  replacement/migration evidence. It does not weaken this specification.
- Phase 24 consumes an accepted equivalent of Phase 23's immutable public
  generation, Working Revision, placement, finite transfer, and source-owner
  contracts. The open Phase 23 proposal is not treated as merged authority;
  implementation must reconcile or supersede it before dependent writers ship.

### 2. Bounded ownership

- Site owns stable public presentation and attribution context. Site purpose is
  descriptive. Capabilities and versioned owner policies—not Site type—change
  behavior.
- Operational Domain authority owns normalized host identity, platform-wide
  occupancy, Site binding intervals, public roles, barriers, operation receipts,
  and provider-evidence references.
- Site Locale owns stable exact-locale identity and default-locale policy.
  Public Site Generation owns immutable favorable serving. Page and specialized
  source owners own content, placement, route, and continuity.
- Giving owns public-entry meaning, issued Giving-address allocation,
  Site-public admission, and accepted gift intent. Payments owns qualification
  and provider execution. Contribution, recurring, receipt, ledger, settlement,
  and accounting owners keep their existing facts.
- Payload is the content-authoring engine behind Web Studio; Vercel is hosting
  transport/evidence; Stripe is payment evidence/execution. None may write back
  product lifecycle, authorization, public-head, route, currency-policy, or
  money truth.

### 3. Lifecycle and state models

- Site lifecycle is private setup → publicly active or suspended → retired.
  Website suspension and Site-public Giving pause are independent append-only
  policy lineages; retirement is terminal and cannot reactivate.
- A Default Site Locale Plan has Active, Cancelled, Superseded, Activated,
  Satisfied elsewhere, and No longer applicable durable outcomes. Ready,
  Waiting, Changed, Checking, and Needs attention are derived projections. The
  Plan deliberately has no date, priority, timer, scheduler, or auto-activation.
- Domain operations use prepared, adverse-fenced, provider-processing,
  reconciling, completed, and needs-attention outcomes beneath durable current
  binding/role heads. An operation result never becomes a second host lifecycle.
- Editable donor gift intent remains distinct from provider attempt and
  accepted gift/recurring truth. Currency and schedule transition commands are
  forbidden after acceptance or while an external outcome is unresolved.

### 4. Structural invariants and data model

- Every durable child relation carries structural Tenant scope and its required
  Site, locale, and owner scope. Current environment isolation is structural at
  the Supabase project/database boundary and remains trusted command/cache/audit
  context rather than a partially persisted child key. Before any shared multi-
  environment database is introduced, Site and every dependent unique key and
  foreign key MUST gain one non-null environment discriminator in a single
  governed migration. Composite same-scope foreign keys prevent cross-Tenant/
  Site/locale relationships; deletion is restrictive where retained history or
  external meaning exists.
- Exactly one Default Site exists per Tenant/environment. Every public
  nonretired Site has exactly one Primary Site Domain; zero or more Redirect
  Site Domains are allowed. A normalized custom hostname has at most one current
  platform occupancy and one favorable Site.
- Stable Site identity, Site Locale identity, public handles, issued Giving
  addresses, public locale segments, and terminal address allocations are never
  reused. Current heads are unique; revisions, claims, receipts, and historical
  intervals are immutable.
- Money is a checked integer minor-unit amount plus validated ISO currency code
  and versioned exponent metadata. Site currency policy, qualification evidence,
  suggested amounts, editable cart money, accepted contribution, provider
  balance evidence, settlement, and accounting projection are separate facts.
- Suggested amount sets are immutable versions keyed by exact Site, ISO
  presentment currency, and one-time or exact enabled recurring cadence. Each
  contains zero to six unique positive ascending amounts and never preselects
  donor money.
- A Page successor relation, Page Purpose Continuity Version, material-purpose
  handoff, Draft-only Path Claim disposition, descendant closure, and sibling
  position are separate facts. Runtime routing never infers one from another.

### 5. Command and consistency boundary

- Browser clients receive read projections and invoke narrow server commands;
  they never submit authoritative Tenant, actor, owner, role, approval, audit,
  provider account, current head, or financial owner fields.
- Every command derives scope and authority from the authenticated server
  context, rechecks current source heads at commit, uses an expected revision,
  a durable semantic idempotency identity, deterministic lock order, one result
  receipt, and one security-audit reference. Exact replay returns the original
  outcome; reuse with changed meaning conflicts. When a committed business
  effect requires asynchronous cache, generation, provider, or other secondary
  work, the same transaction records one deduplicated outbox item. A command
  with no secondary effect creates no placeholder outbox work.
- Multi-owner preparation is itemized and resumable. One database-owned
  authoritative transition is atomic; external work is dispatched afterward
  through an outbox. No Vercel, DNS, Stripe, Payload, cache, or other network
  call occurs while authoritative locks are held.
- Unknown external success is reconciled against durable local intent and
  authenticated provider state before another effect. Destructive or
  subtractive changes establish and acknowledge the adverse serving/admission
  fence first. No provider rollback may restore favorable public state.

### 6. Staff product and interaction design

- Site management uses the existing Base Maia information architecture with
  persistent Tenant/Site context. The Site workspace contains Overview,
  Domains, Languages, Currencies, Website appearance, and Availability; compact
  cross-owner readiness summaries remain read-only and link to their owner.
- Common healthy states are quiet. Exception-first lists expand only blockers,
  safely aggregate hidden detail, name the responsible owner, and expose at
  most one currently authorized next action. Provider jargon and raw errors are
  excluded from primary copy.
- High-impact actions are verbs, not toggles: Go live, Take website offline,
  Pause new gifts from this Site, Retire Site permanently, Make primary,
  Disconnect domain, Publish French (Canada), Change currency, and Move saved
  changes to new Page draft. Confirmations state exact changed and unchanged
  consequences; cancel/keep-safe receives initial focus.
- Operation pages retain Applying/Publishing/Disconnecting/Moving/Confirming
  outcome until authoritative readback, survive reload and weak networks, and
  show the durable receipt or owner-specific recovery. A toast alone is never
  the only completion evidence.
- Copy source selection is one qualified RadioGroup followed immediately by
  one semantic Unavailable source versions list. With no qualified source, the
  direct primary action is Start blank draft. Unavailable choices are not
  disabled radios and nondisclosable heads vanish.

### 7. Donor and public experience

- Public exact-locale content never substitutes another language. The
  locale-neutral root uses one trusted 307 to the current ready default locale;
  explicit locale links go directly to final pages.
- Every issued Giving address retains one immutable Site/locale/entry meaning.
  A replacement becomes Preferred for sharing while eligible older addresses
  continue directly. Stop this address is a distinct terminal command; no old
  Giving address redirects or changes purpose.
- Currency is visible before amount. One qualified currency renders as static
  text; several render as a labelled explicit selector. Location may suggest
  only for an empty intent, and missing/ambiguous location uses the qualified
  Site default or an explicit choice—never arbitrary USD.
- Currency/frequency transition confirmation appears only after material
  state exists. It preserves purpose, clears the smallest complete dependent
  money/schedule/payment closure, loads target-native suggestions unselected,
  returns focus to amount, and announces the result.
- A currency transition preserves the exact target-valid schedule identity; a
  schedule transition preserves the exact cart currency. If that unaffected
  axis is incompatible with the target, the command writes nothing and explains
  the incompatibility rather than clearing or substituting it.
- Each Tenant has one complete Tenant Donor Account Brand. Authenticated account
  experiences for a Tenant/environment remain unavailable until exactly one
  verified Tenant-controlled portal host is active there; host replacement is
  successor-first and host loss never redirects credentials or donors to a Site,
  provider, Asym, or another Tenant. Neither host nor brand is required for
  unrelated Site work. Site brand and entry Site may orient but never authorize
  or fragment account history.

### 8. Public routing, generations, and caches

- Locale-bearing routes use the trusted origin, optional permanent shared-host
  handle, fixed `/lang/`, lowercase exact canonical locale segment, and
  owner-controlled relative path. Giving then uses fixed `/give/{slug}`.
- A finite typed route registry classifies website, Giving, authenticated,
  callback, protected, API/control, preview, infrastructure, and specialized
  routes before favorable handling. Generic catch-alls cannot claim reserved
  namespaces or infer route kind.
- One complete immutable public generation pins the exact host/base, locale,
  Brand Version, shell, Navigation, content/route references, metadata, search
  inputs, cache identity, renderer, and required dependency generations. Public
  rendering never reads mutable latest state.
- Cache keys include Tenant, environment, Site, trusted host, stable locale,
  public-base and public-generation identities, owner/resource, audience, and
  renderer. Tags invalidate but never isolate. Unknown, private, preview,
  withdrawn, adverse, and authorization-sensitive responses are no-store.
- Core must maintain a small, well-defined, code-owned, versioned **Site Locale
  Publication Contract**. Version 1 covers routing identity; exact-locale
  homepage/frame/brand/navigation and invoked legal/support links; known-Site
  adverse pages; exact-locale direction/font/bidi/responsive/accessibility
  completeness; and canonical/alternate/sitemap/robots/serializer/generation/
  cache closure. A new universal locale dependency must classify itself in the
  same change or CI fails. This contract is distinct from the Domain Critical
  Owner-Family Registry and shares neither membership nor authority with it.

### 9. Domain and Vercel adapter boundary

- Core separately maintains one small, versioned, code-owned **Domain Critical
  Owner-Family Registry** for domain cutover. A family is critical when wrong
  routing could accept/reinterpret money or another durable protected effect;
  authenticate, authorize, establish trusted origin, or complete a callback;
  invoke an API, form, provider control/result, or protected action; choose
  Domain/root/locale-root/canonical-origin/public admission authority; or bypass
  safety, privacy, cache/admission, or route reservation. Each entry pins a
  stable family key, contract version, route precedence, evidence-head reader,
  finite result vocabulary, privacy projection, and required tests. It may
  share typed adapter infrastructure with the Site Locale Publication Contract,
  but it does not share membership or authority.

- Domain verification uses a server-generated 256-bit, exact-host, one-use TXT
  challenge with seven-day expiry. A challenge is private, nonexclusive,
  provider-dark, and consumes no hostname claim until trusted DNS observation
  and the authoritative claim transaction succeed.
- Vercel operations are typed, idempotent owner-adapter effects keyed to one
  durable Core operation. Adapters normalize provider states into proved
  present, proved absent, pending, rate-limited, contradictory, and unknown;
  provider `_status`, deployment aliases, or verification Booleans are never
  product truth.
- Provider limits and retry timing come from current documented/provider
  headers and contract evidence, not hard-coded roadmap constants. Checks are
  coalesced, bounded, back off on `429`, and never run in public request or
  database-lock paths.
- A same-Tenant Site-to-Site move retains the existing global hostname claim
  and shared project association. It changes no DNS, TLS, registrar, email,
  Stripe, content, or provider project. D74 disconnection and D75 fresh claim
  remain separate operations.

### 10. Locale, translation, and copy boundary

- Site Locale Publication uses one explicit command and one immutable current
  generation; ordinary untranslated resources do not block. Withdrawal is
  adverse-fence-first and cannot redirect to another locale or release route
  history.
- Translation provenance is exactly Translated with an exact compatible Basis,
  Independently authored without a Basis, or Legacy source unclassified.
  Ordinary source drift derives staff-only Out of date; only a registered
  source-safety disposition can withdraw prior translated public use.
- Suggested translation sources are an optional partial same-Site ordering for
  authoring only. It grants no access, preselects nothing, omits no otherwise
  eligible source, and has zero public, cache, SEO, Giving, money, or message
  effect.
- Copy offers at most exact Latest saved draft and Current published version
  heads. Exact-revision Copy Qualification proves finite lossless treatment;
  selection creates or reuses an immutable checkpoint and creates one new
  private target atomically. It never overwrites an existing target.

### 11. Payments and Stripe boundary

- Site policy is only the requested currency ceiling. Effective donor choices
  are the intersection with current Payments-owned qualification for the exact
  Tenant, Site, Legal Entity, Settlement Account Binding, connected account,
  environment, route/cart, cadence, amount envelope, and payment-method context.
- Setup qualification is read-only and side-effect-free. It creates no Stripe
  customer, intent, setup intent, subscription, charge, mandate, synthetic test
  payment, or provider setting. Checkout independently re-proves the exact
  actual request before the first provider effect.
- Phase 24 launches with exactly one active Giving Legal Entity and one current
  Tenant-owned Stripe connected-account binding per Tenant/environment. Sites
  cannot select it, a second active entity/account is unavailable, and there is
  no fallback to Asym's platform account.
- Presentment currency does not imply settlement currency, FX authority,
  retained foreign balance, payout destination, receipt issuer, or accounting
  configuration. Those remain source-owned and historically frozen.

### 12. Supabase, RLS, and privileged-path safety

- Operational tables use full structural scope keys and same-scope foreign
  keys, `NOT NULL` where identity is required, unique/check constraints for
  cardinality and valid states, append-only immutable history, and restrictive
  delete behavior. Money uses checked integer ranges and valid currency/profile
  references.
- Browser-facing roles receive no direct authoritative DML. RLS policies define
  matching structural `USING` and `WITH CHECK` rules for every permitted
  mutation; an update cannot change Tenant/Site/owner scope. Views run with
  invoker-safe semantics, and security-definer functions pin `search_path`,
  derive actor/scope, expose narrow typed inputs, and recheck business authority.
- Because privileged/service/Payload/worker paths may bypass RLS, they are not
  considered safe merely by using a server key. They invoke the same command
  boundary and are covered by cross-Tenant poison tests. Service credentials
  never appear in browser, repository config, logs, receipts, or provider
  evidence.
- Current deployment isolates environments by Supabase project/database. A
  future shared database must add environment to Site and every dependent
  structural key in one governed migration; application convention is not an
  acceptable substitute.

### 13. Accessibility, privacy, and performance

- All staff/donor/public flows meet WCAG 2.2 AA, work by keyboard and screen
  reader, preserve focus/announcements across async outcomes, support reduced
  motion and forced colors, and remain usable at 320 CSS pixels and 400% zoom.
- Native language names, explicit script/region where needed, correct `lang`
  and `dir`, bidi isolation, CJK wrapping, IDN U-label/A-label safety, and
  locale/time-zone explicit dates are mandatory. Flags never identify language.
- Negative responses, source status, counts, cache keys, logs, support views,
  exports, and provider errors reveal no foreign Tenant, unpublished locale,
  restricted ministry/location, donor, owner, financial, or lifecycle fact.
- Public host admission stays inside the Phase 5 p99 15 ms launch budget after
  production-shaped capacity proof. The Copy source projection meets p95
  300 ms at the maximum supported status-heavy locale catalog. Root navigation
  preserves p75 mobile/desktop LCP at or below 2.5 seconds under the defined
  production profile.

### 14. Migration, rollout, and rollback

- Inventory and classify Sites, hosts, routes, CMS records, locale fields,
  money fields/readers, public/canonical metadata, caches, PWA/service workers,
  callbacks, provider bindings, and current claims before enabling writers.
  Unknown or ambiguous historical facts quarantine; they are never inferred
  from current default, title, URL text, traffic, country, currency, provider,
  or majority use.
- Deploy additive readers, constraints, negative occupancy, command receipts,
  and adverse fences before new writers. Fence legacy array/null-Site/
  host-blind/USD/two-decimal/mutable-latest writers before cohort activation.
- Activate by explicit Tenant/Site/domain/locale/currency cohort behind a kill
  switch for new commands. Mixed versions must retain compatible readers and
  reject unsupported writes. Once public or provider facts exist, rollback is
  forward-only: disable new commands, retain history/claims, keep adverse
  fences, and reconcile.

### 15. Observability and durable audit

- Each command has a correlation identity linking business receipt, security
  audit, any required outbox effect, provider attempt, generation
  acknowledgement, and user-visible operation—without storing secrets or
  sensitive body content.
- Named release/production signals are:
  - **Site serving fence:** p99 public-suspension acknowledgement at or below
    five seconds and zero inventoried required route still favorable after
    thirty seconds. Owner: Site Platform. Response: retain/restore the adverse
    fence, stop activation, and reconcile the failing cohort.
  - **Host admission:** p99 lookup at or below 15 ms at qualified launch load,
    with zero cross-scope or unknown-host favorable result. Owner: Public
    Runtime. Response: fail closed, disable the cohort, and repair capacity or
    keying before reactivation.
  - **Generation coherence:** zero response whose host, locale, Brand Version,
    route, or dependency pins disagree with the current admitted generation.
    Owner: Web Studio/Public Runtime. Response: deny the generation, invalidate
    affected cache scope, and roll forward.
  - **Money correctness:** zero accepted provider request or durable money row
    with currency/exponent/account mismatch. Owner: Payments. Response: halt
    the affected currency/mode, preserve accepted history, and reconcile before
    offering it again.
  - **Domain operations:** zero second favorable Site or released hostname
    claim while a move/disconnect outcome is unknown. Owner: Domain Operations.
    Response: keep the adverse barrier and claim, suspend new operations on the
    host, and reconcile authenticated provider state.
  - **Copy-source latency/privacy:** p95 at or below 300 ms at the supported
    maximum catalog and zero nondisclosable source/count leak. Owner: Web
    Studio. Response: disable Copy choices, preserve Start blank, and repair the
    projection without weakening authorization.
  - **Tenant/RLS isolation:** zero cross-Tenant read, mutation, cache hit,
    provider effect, or audit attribution mismatch. Owner: Security/Data.
    Response: disable affected writers/read projections, retain evidence, and
    execute incident response.

## Testing Decisions

- Tests prove observable user and domain outcomes, not React component
  structure, SQL text, Payload internals, Vercel response shapes, or Stripe
  implementation details. Every positive test has relevant negative,
  authorization, boundary, concurrency, retry, failure, and mixed-version
  counterparts.
- The confirmed primary seam is one shared production-shaped vertical tracer,
  extending the existing strict local CMS E2E runner rather than creating a
  second browser harness. It uses real local Payload and Postgres, the actual
  staff/donor/public applications, and real authorization. Actual local HTTP
  runtimes are the oracle for host resolution, methods, status, headers,
  redirects, cookies/auth origin, cache/admission, donor UI, and reload
  behavior. The transport-agnostic published-content reader is the oracle only
  for exact generation/content selection; injected owner adapters and durable
  database receipts prove Vercel, DNS, Stripe, and no-effect outcomes. It proves
  at least: private Site setup;
  exact host and locale activation; Site brand publication; domain verification
  and one prepared move; currency setup and donor selection/transition; one
  translation copy; one Page-purpose handoff; suspension/retirement; and
  permission-safe recovery.
- Lower proof seam one is the pure command/domain/provider-contract layer with
  injected owner adapters and discriminated outcomes. It covers Site/domain/
  locale/readiness policies, canonical route/manifest comparison, Money and
  exponent rules, donor preserve/clear/confirm state transitions, Page
  continuity/handoff algebra, Payload source-head qualification, Vercel
  normalization, and side-effect-free Stripe currency qualification.
- Lower proof seam two is a real disposable-Postgres matrix. It applies actual
  migrations and proves composite keys/foreign keys, one-current constraints,
  grants, RLS `USING` and `WITH CHECK`, security-definer hardening, privileged-
  path parity, compare-and-set races, semantic idempotency, receipts/outbox,
  failpoints, unknown-result readback, restrictive deletion, and cross-Tenant
  denial. SQL-regex tests alone are insufficient.
- Existing prior art is retained: the strict local CMS E2E runner and its
  admin/donor tracer; the transport-agnostic published-content reader; checkout
  client and donation/payment-intent tests; optional real Stripe test-mode
  qualification; injected Vercel script tests; and CI disposable-Postgres
  migration setup. Existing USD mocks, smoke-only payment-step coverage,
  provider `_status`, null-Site context, and mutable latest-published reads are
  not accepted oracles.
- Accessibility, mobile, RTL/CJK, forced-colors, reduced-motion, 400%-zoom,
  no-JS public navigation, low-bandwidth/reload recovery, and focus management
  attach to the primary tracer. They do not create another architectural seam.
- Provider conformance uses injected contract suites plus qualified test
  environments. Real-provider tests never run inside authoritative database
  transactions and never substitute for local deterministic proof. Production
  activation requires current Stripe/Vercel/DNS evidence for the exact deployed
  versions and account topology.
- Required matrices include JPY/BHD and provider-special currency boundaries;
  all directed supported cadence transitions and no-ops; exact-locale/BCP 47/
  RTL/CJK cases; IDN/canonical-host equivalents; GET/HEAD/OPTIONS/unsafe method
  routing; source/public/private Copy heads; D77 comparison outcomes; D78 fixed-
  pair qualification; D80–D84 failpoints; cross-Tenant/hidden-resource poison;
  two-tab concurrency; response loss; rate limiting; provider contradiction;
  migration quarantine; rollback after durable writes; and production-shaped
  load at declared maximums.
- Release evidence maps every numbered story to one or more OpenSpec scenarios,
  executable tests, the relevant ADR/decision, and a deployment or manual proof
  where automation cannot establish human comprehension or qualified provider/
  legal facts.
- The committed Phase 24 traceability matrix maps every founder decision and
  numbered story to its ADR/review, exact OpenSpec requirement/scenario, design
  section, implementation task, proof IDs, and release evidence. CI must reject
  duplicate IDs, invalid targets, or uncovered normative entries.

## Out of Scope

- Multiple simultaneously active Giving Legal Entities or Stripe connected
  accounts per Tenant/environment; Site-selected merchants; platform-account
  fallback; merchant-of-record, legal, tax, charitable-registration, or
  accounting policy invention.
- FX conversion, rate service, amount conversion, retained foreign balances,
  foreign payout/bank setup, accounting multi-currency activation, Stripe
  Adaptive Pricing authority, or a tenant-configurable provider matrix.
- Site types, arbitrary settings blobs, behavior-changing purpose text, bulk
  Site clone, live preset/brand inheritance, generic theme engines, arbitrary
  CSS/HTML/JavaScript, tenant plugins, or another renderer/serving head.
- Automatic translation, visitor runtime fallback, browser-language routing,
  translation quality scoring, generic validation/issue ledgers, translation
  workflows, bulk or scheduled locale publication, or a locale readiness
  percentage.
- Wildcard custom domains, cross-Tenant live transfer, registrar/DNS/email
  management, provider-project-per-Site launch topology, universal URL crawler,
  complete external-placement graph, arbitrary redirect console, wildcard/
  regex routing, or Vercel whole-domain redirect authority.
- Generic Page duplicate/merge, Page-purpose taxonomy or editable prose,
  AI/similarity successor inference, runtime purpose resolver, bulk Page
  transfer, subtree move, Navigation coupling, or automatic publication.
- Changing accepted gifts or recurring agreements, provider proration,
  subscription editing, currency URLs/profiles, automatic preset selection,
  digit carryover between currencies/frequencies, or a generic cart-transition
  engine.
- A second task, approval, notification, audit, cache, workflow, routing,
  readiness, provider, or permission system. Existing owners are extended only
  through narrow typed contracts.
- Phase 12/17 access-profile withdrawal authority formerly drafted as D56 and
  all D19–D55 cross-phase review/access-governance activation work.

## Further Notes

### Dependency order

1. Reconcile accepted Phase 23-equivalent public generation, Working Revision,
   Page placement, transfer, lease, and source-owner contracts; land canonical
   Site/locale/Money/EffectiveAccess foundations.
2. Land immutable operational records, structural constraints, command-only
   writes, expected-head CAS, semantic receipts, outbox, adverse fences, and
   safe public readers before UI writers.
3. Land Site setup/lifecycle, exact-locale publication, Site Brand, Tenant
   portal/account brand, and read-only message projection.
4. Land Domain authority and D72–D77 in order: primary/redirect roles, former-
   primary choice, disconnect/claim, prepared move, deterministic route review.
5. Land D78–D84 in order: ordinary Page qualification, stable purpose
   continuity, then one material-purpose handoff transaction with draft-path,
   descendant, and sibling-position dispositions.
6. Land currency qualification and Money correctness before any non-USD
   offering; then donor currency/frequency transitions and suggested amounts.
7. Complete production-shaped tracer, real-database matrix, provider
   qualification, accessibility, load, mixed-version, and cohort rollout proof.

### Decision traceability

- D1–D8: Site identity, setup, activation, suspension, and retirement.
- D9–D18: address permanence, Giving placement convergence, exact-locale URL
  grammar, deterministic root/default behavior, and undated private planning.
- D57–D60: Tenant Donor Portal host/account brand, Site Brand, and read-only
  Messages status.
- D61–D65: donor presentment currency, qualification, currency/frequency
  transitions, and suggested amounts.
- D66–D71: critical-path locale publication, translation freshness/safety,
  authoring-source preferences, exact source heads, Copy Qualification, and
  visible unavailable heads.
- D72–D84: domain roles/lifecycle/move review and exact ordinary-Page
  continuity/material-purpose handoff.

### Assumptions and qualified evidence

- The ordinary ministry launch profile is one active Giving Legal Entity and
  one Tenant-owned connected account per environment. A broader profile
  requires a separate certified change; the normalized model must not prevent
  it.
- Exact provider limits, supported presentment currencies/payment methods,
  account capabilities, DNS behavior, and Vercel domain semantics are
  current-evidence questions at activation time. The product stores bounded
  source-labelled evidence and fails closed; it does not freeze vendor claims
  into domain invariants.
- Representative staff/donor usability validation is required for Site/domain
  setup, destructive confirmations, currency/frequency transitions, source
  selection, and Page handoff. This specification does not invent ministry
  staffing structures or assume one universal approval role.
- This document and the active OpenSpec change authorize implementation
  planning only. They do not themselves migrate data, configure Stripe or
  Vercel, publish a Site/locale, or change production behavior.
