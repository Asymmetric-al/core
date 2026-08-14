<!-- phase22-to-spec:public-ministry-pages:v1 -->

# Phase 22 — Public Missionary & Project Page Workflow

**Status:** Implementation-ready specification; not implemented
**Decision authority:** Phase 22 D1–D27, ratified and scope-frozen 2026-08-14
**Confirmed public testing seam:** `PublicMinistryPagesService`
**OpenSpec change:** `add-public-ministry-pages`
**Parent specification issue:** [#1281](https://github.com/Asymmetric-al/core/issues/1281)

This specification publishes the complete Phase 22 product contract for
implementation planning. The approved implementation graph is published as 41
native child issues, [#1282](https://github.com/Asymmetric-al/core/issues/1282)
through [#1322](https://github.com/Asymmetric-al/core/issues/1322), beneath
parent specification issue [#1281](https://github.com/Asymmetric-al/core/issues/1281).
That issue posture does not claim that any FORWARD capability described below
exists, is implemented, or is authorized for production.

## Problem Statement

Asym's `/workers` experience uses mock data, while CMS content, checkout,
operational parties, Designations, safety policy, and the public-content reader
each own only part of the intended workflow. Mistaking any one for complete
authority would copy identity, publish stale financial claims, expose restricted
workers, orphan giving routes, and make public changes hard to explain or contain.

Contributors need one dashboard for assigned Missionary and Project pages. Staff
need a quiet review and exception flow, not a website builder or task engine.
Tenants need coherent family-wide presentation plus clear choices for reach,
review, progress, responses, measurement, and optional writing help. Donors need
fast, accessible, searchable pages whose Give action preserves exact context.
Phase 10 safety must govern every egress: routes, directories, metadata, media,
previews, Updates, responses, analytics, caches, and lifecycle behavior.

Phase 22 must therefore establish one auditable publication contract over typed
subjects, immutable revisions and locale releases, source-qualified progress and
Giving, sanitized media, discovery, collaboration, caching, retirement, and
legacy cutover—without becoming identity, finance, supporter authorization, or
a second source of record.

## Solution

Build one release-based capability with Missionary Ministry and Project/Campaign
families. A Site-scoped Page references one qualified subject; every released
MVP Page binds one Phase 13 Designation. It copies no source truth. Locale editorial lineages release
independently, but every Page in a Site and family uses one current presentation
profile, with no locale fallback or Page-specific layout exception.

Assigned contributors edit in one dashboard. Immutable candidates pass safety
checks and a calm sharing attestation, then either publish after checks or enter
one simple staff lane under the tenant's versioned profile. Staff changes are
attributed successors, never overwrite. Reach, progress, responses, measurement,
assistance, directory topology, and presentation are bounded tenant choices,
always capped by Phase 10.

Phase 5 resolves an exact release only after current-source admission. The
release binds content, safe media, route, profile, reach, progress, Giving, and
search/share presentation. Adverse changes deny before stale caches; Giving is
re-proved when selected. Production adoption shadows a complete Tenant × Legal
Entity × environment × Site × verified-host-set × locale cohort, then performs
one CAS reader cutover with no legacy fallback. Healthy workspaces stay quiet;
exceptions expose one cause-owned, re-proved action.

## User Stories

### D1 — Typed page families and contributor editing

1. **US22-001** — As a donor, I want Missionary and Project pages to have family-appropriate structure, so that I can understand whom or what I am supporting.
2. **US22-002** — As a missionary, I want every page I am explicitly assigned to in my dashboard, so that I can maintain my ministry and project content in one place.
3. **US22-003** — As a spouse or teammate, I want my own login and explicit editing assignment, so that shared ministry never depends on shared credentials.
4. **US22-004** — As a tenant administrator, I want presentation records to reference operational subjects, so that public editing cannot fork identity truth.
5. **US22-005** — As staff, I want Missionary and Project pages governed by one publication contract, so that safety and release behavior stay consistent.
6. **US22-006** — As a security reviewer, I want unassigned users denied even when they know a Page identifier, so that dashboard discovery cannot grant authority.

### D2 — Publication Reach

7. **US22-007** — As an administrator, I want a tenant-default reach for each family, so that setup is fast and intentional.
8. **US22-008** — As staff, I want to choose Not public, Shared by link — public, or Listed publicly, so that reach is understandable without pretending a link is private.
9. **US22-009** — As a restricted worker, I want Phase 10 to cap every requested reach, so that a tenant setting cannot expose me.
10. **US22-010** — As an editor, I want requested, release-time, and currently effective reach shown separately, so that I know what is configured and what is live.
11. **US22-011** — As a donor, I want Shared-by-link pages excluded from directories and indexing, so that discovery matches the stated reach.
12. **US22-012** — As staff, I want reach changes to take effect through a release or adverse containment, so that public state is attributable.

### D3 — Presentation profiles

13. **US22-013** — As an administrator, I want one versioned presentation profile per Site and Page family, so that all pages share a coherent design.
14. **US22-014** — As a donor, I want Missionary and Project layouts tailored to their different purposes, so that each page is clear.
15. **US22-015** — As an administrator, I want bounded typed blocks and semantic choices, so that flexibility does not become an unsafe page builder.
16. **US22-016** — As an editor, I want a preview of family-wide presentation changes, so that I can see consequences before activation.
17. **US22-017** — As an accessibility user, I want every supported layout to retain semantic order and keyboard usability, so that tenant styling cannot break access.
18. **US22-018** — As operations staff, I want profiles immutable and version-addressed, so that a release always explains how it rendered.

### D4 — Review & Release Profiles

19. **US22-019** — As an administrator, I want to choose staff review or publish after checks, so that workflow matches tenant practice.
20. **US22-020** — As a missionary, I want the editor to state whether my change will publish or await review, so that submission has no surprise.
21. **US22-021** — As a reviewer, I want the exact immutable candidate and current release compared, so that I judge the real proposed change.
22. **US22-022** — As staff, I want profile changes prospective, so that work already submitted retains its recorded rules.
23. **US22-023** — As a safety officer, I want mandatory checks to remain regardless of review posture, so that automatic publication cannot bypass Phase 10.
24. **US22-024** — As an auditor, I want release provenance to include the governing profile version, so that publication is reproducible.

### D5 — Simple review lane

25. **US22-025** — As a reviewer, I want one queue containing only candidates that need judgment, so that review stays quiet.
26. **US22-026** — As a reviewer, I want Approve & publish, Request changes, and terminal Reject, so that decisions are clear and bounded.
27. **US22-027** — As a contributor, I want requested changes attached to the exact candidate, so that I know what to revise.
28. **US22-028** — As staff, I want stale review actions rejected after a newer candidate or policy change, so that I cannot publish obsolete work.
29. **US22-029** — As an administrator, I want healthy automatic releases omitted from the queue, so that staff are not asked to rubber-stamp them.
30. **US22-030** — As an auditor, I want every decision append-only with actor and time, so that review history cannot be rewritten.

### D6 — Public Support Progress

31. **US22-031** — As staff, I want progress Hidden or configured with one compatible source-qualified metric per Page, so that each page reflects tenant intent.
32. **US22-032** — As a missionary, I want sustained monthly support represented differently from a one-time project goal, so that donors are not misled.
33. **US22-033** — As finance staff, I want public progress derived from authoritative ledger and commitment projections, so that editors cannot type financial claims.
34. **US22-034** — As a donor, I want exact currency and a clear as-of state, so that the progress display is honest.
35. **US22-035** — As a safety reviewer, I want missing, incompatible, or stale progress omitted, so that absence never appears as zero.
36. **US22-036** — As a missionary, I want Field Account balances excluded from public progress, so that internal availability is not implied.

### D7 — One Designation and giving handoff

37. **US22-037** — As staff, I want exactly one eligible Phase 13 Designation bound to each Page, so that every Give action has one meaning.
38. **US22-038** — As a donor, I want every CTA on a Page to select that same Designation, so that placement cannot change intent.
39. **US22-039** — As a donor, I want site, source code, locale, currency, Page, and Designation preserved into checkout, so that attribution survives the handoff.
40. **US22-040** — As a security reviewer, I want eligibility and context re-proved when Give is selected, so that a stale page cannot authorize giving.
41. **US22-041** — As a visitor, I want a calm Giving unavailable state while the Page remains readable, so that presentation and transaction status are not conflated.
42. **US22-042** — As product staff, I want no fallback Designation, so that a broken binding cannot redirect money silently.

### D8 — Routes and lifecycle dispositions

43. **US22-043** — As a visitor, I want stable canonical routes, so that saved and shared links remain understandable.
44. **US22-044** — As staff, I want every retired route assigned keep, transition notice, eligible one-hop 308, or privacy-safe 404, so that no page is orphaned.
45. **US22-045** — As a restricted worker, I want former identity-bearing routes to return a privacy-safe 404 without redirects, so that retirement does not disclose linkage.
46. **US22-046** — As a donor, I want only same-Page listed successors eligible for permanent redirects, so that a URL never changes the intended beneficiary.
47. **US22-047** — As finance staff, I want Page retirement independent from Designation disposition, so that public lifecycle does not move money authority.
48. **US22-048** — As operations staff, I want append-only route generations, so that collisions and prior public behavior remain explainable.

### D9 — Public Ministry Media Assets

49. **US22-049** — As an editor, I want private upload, validation, crop, and preview, so that unsafe source media never goes public directly.
50. **US22-050** — As a restricted worker, I want metadata and original filenames removed from every public derivative and response, so that files do not leak identity or location.
51. **US22-051** — As a visitor, I want responsive, accessible image derivatives, so that pages are fast and usable on varied devices.
52. **US22-052** — As a reviewer, I want alt text and intended placement reviewed with the candidate, so that media meaning is release-bound.
53. **US22-053** — As operations staff, I want opaque immutable asset addresses bound to releases, so that replacement cannot mutate old evidence.
54. **US22-054** — As a safety officer, I want withdrawal to contain the smallest affected public scope first, so that unsafe media stops serving promptly.

### D10 — Authenticated preview

55. **US22-055** — As an authorized editor, I want to preview an exact candidate version, so that I can check the real proposed page.
56. **US22-056** — As a reviewer, I want preview access re-proved against current assignment, so that revoked users cannot retain access.
57. **US22-057** — As a security reviewer, I want previews authenticated rather than bearer-link accessible, so that forwarded URLs confer no authority.
58. **US22-058** — As a visitor, I want preview responses marked no-store and noindex with safe referrer behavior, so that drafts do not escape through infrastructure.
59. **US22-059** — As an editor, I want preview interactions inert, so that Give, responses, analytics, and sharing cannot create live effects.
60. **US22-060** — As an auditor, I want preview events scoped to actor, candidate, tenant, and Page, so that access can be investigated.

### D11 — Ministry Updates

61. **US22-061** — As a missionary, I want to write one canonical Ministry Update, so that I do not maintain separate public and supporter posts.
62. **US22-062** — As a safety-conscious author, I want to deliberately author a public-safe variant when needed, so that protected detail is never mechanically weakened.
63. **US22-063** — As a supporter, I want updates integrated into the ministry experience, so that relationship and giving context stay connected.
64. **US22-064** — As a reviewer, I want immutable revisions and an exact audience release manifest, so that each audience sees only its approved projection.
65. **US22-065** — As an author, I want public and supporter releases to evolve independently, so that changing one audience does not silently change another.
66. **US22-066** — As operations staff, I want notification delivery recorded separately from release, so that publish never falsely means delivered.

### D12 — Responses

67. **US22-067** — As an administrator, I want Responses off, Like + I prayed, or Like + I prayed + comments, so that engagement matches tenant practice.
68. **US22-068** — As a supporter, I want to respond only after authenticating and retaining exact audience access, so that protected updates remain protected.
69. **US22-069** — As a supporter, I want Like and I prayed to be idempotent, so that retries cannot inflate activity.
70. **US22-070** — As an author, I want bounded comments and one reply level, so that encouragement stays easy to follow.
71. **US22-071** — As a moderator, I want append-only hide, restore, and restriction actions, so that moderation is accountable.
72. **US22-072** — As a restricted worker, I want protected counts and responder identity absent from public projections, so that engagement cannot leak relationships.

### D13 — Public Ministry Directory

73. **US22-073** — As an administrator, I want one directory contract displayed Together or as separate family directories, so that navigation matches the Site.
74. **US22-074** — As a visitor, I want only Listed pages in directory results, so that Shared-by-link pages remain undiscoverable there.
75. **US22-075** — As a visitor, I want bounded search and safe tenant-approved filters, so that I can find a ministry without exposing sensitive facets.
76. **US22-076** — As a restricted worker, I want aliases and generalized regions honored in all cards and suggestions, so that search cannot reconstruct identity.
77. **US22-077** — As a donor, I want stable keyset pagination and deterministic ordering, so that results do not jump or repeat.
78. **US22-078** — As an administrator, I want no popularity, financial, map, or hidden-count ranking, so that discovery does not become surveillance or a fundraising leaderboard.

### D14 — Search and social sharing

79. **US22-079** — As a tenant, I want Listed pages indexable by major search engines, so that public ministries can be discovered.
80. **US22-080** — As a tenant, I want Shared-by-link pages shareable but explicitly noindex, so that sharing does not imply directory or search discovery.
81. **US22-081** — As a restricted worker, I want stricter Phase 10 reach to remove search and share artifacts, so that metadata cannot outlive safety.
82. **US22-082** — As a visitor, I want accurate canonical, locale, social-card, and structured metadata from the exact release, so that previews describe the page I shared.
83. **US22-083** — As a reader, I want a stable permalink for each released public Update, so that a shared post opens to the intended content.
84. **US22-084** — As a privacy reviewer, I want native share and first-party copy controls without passive social SDKs, so that viewing a page does not notify third parties.

### D15 — Public Ministry Measurement

85. **US22-085** — As an administrator, I want measurement Off by default and enabled with one simple profile, so that unused analytics add no noise.
86. **US22-086** — As staff, I want only qualified Page load, full Update open, share menu open, and Give CTA selection measured, so that reports remain understandable.
87. **US22-087** — As a visitor, I want no identity, fingerprint, GET-side effect, or prefetch-side effect collected, so that measurement is privacy-preserving.
88. **US22-088** — As a contributor, I want visibility only when the tenant chooses Staff + assigned contributors, so that reports follow authority.
89. **US22-089** — As an analyst, I want short-lived occurrences and sealed daily aggregates with completeness labels, so that trends are useful without pretending perfect telemetry.
90. **US22-090** — As operations staff, I want measurement failure never to block the Page or Give action, so that optional analytics cannot become availability-critical.

### D16 — Public Page Writing Assistant

91. **US22-091** — As an administrator, I want the writing assistant off until an exact Phase 21 BYOK purpose binding is configured, so that AI use is deliberate.
92. **US22-092** — As an editor, I want spelling and grammar, clarity, shorten, add detail, and ministry-appropriate tone suggestions, so that help stays practical and unobtrusive.
93. **US22-093** — As an editor, I want only the selected text and minimum needed context sent, so that unrelated ministry data is not disclosed.
94. **US22-094** — As an editor, I want compare, dismiss, and explicit Use actions, so that a model can suggest but never silently author or publish.
95. **US22-095** — As a multilingual editor, I want a supported source-language-to-exact-English-locale suggestion with the full “Check this translation” warning and `Use English draft` action, so that I receive help without mistaking the output for a certified translation.
96. **US22-096** — As a contributor, I want a full manual path whenever the provider is absent or fails, so that page editing never depends on AI.

### D17 — Typed Page subjects

97. **US22-097** — As staff, I want a Missionary Page subject to be one exact Phase-9-owned Ministry Assignment, so that teams and spouses are represented explicitly.
98. **US22-098** — As staff, I want a Project Page subject to be one eligible CRM Ministry Project, Phase 13 Giving Campaign, or Designation, so that the displayed subject has a real source.
99. **US22-099** — As an editor, I want the subject label and source type shown plainly, so that I know what operational record the Page represents.
100.  **US22-100** — As a data steward, I want ambiguous or missing subjects rejected, so that a Page cannot be attached by fuzzy identity.
101.  **US22-101** — As operations staff, I want subject eligibility re-proved at release and public read, so that source retirement contains the Page.
102.  **US22-102** — As an auditor, I want a post-release subject change to create a new Page with a D8 succession disposition, so that public history is not rewritten.

### D18 — Runtime admission and cache convergence

103. **US22-103** — As a visitor, I want the exact released locale rendered through the Phase 5 runtime, so that there is one public execution path.
104. **US22-104** — As a safety officer, I want current subject, reach, media, route, and policy sources admitted before any cached body is served, so that stale safety decisions fail closed.
105. **US22-105** — As a donor, I want financial and Giving facts refreshed according to their own freshness class, so that a cached story cannot imply current transaction eligibility.
106. **US22-106** — As operations staff, I want adverse changes to deny first and invalidate outward, so that containment does not wait for normal regeneration.
107. **US22-107** — As a visitor, I want safe prior positive presentation served only when its freshness contract permits it, so that outages degrade honestly.
108. **US22-108** — As an operator, I want provider state, cache convergence, and public release health observed separately, so that one green signal cannot mask another failure.

### D19 — Ministry Assignments

109. **US22-109** — As an administrator, I want organization-owned Ministry Assignments with explicit participant membership, so that a ministry may represent one person, spouses, or a team.
110. **US22-110** — As a participant, I want my display, editing, support visibility, and notification grants represented separately, so that one role does not imply every permission.
111. **US22-111** — As a spouse or teammate, I want authorized support activity visible under my own login, so that shared ministry does not require account sharing.
112. **US22-112** — As an administrator, I want optional Phase 21 Support Assignment linkage and explicit Phase 12 grants, so that public authorship and financial access remain distinct.
113. **US22-113** — As a tenant-security reviewer, I want coarse database isolation plus command-time policy decisions, so that RLS remains understandable without weakening authorization.
114. **US22-114** — As a departing participant, I want revocation to remove future access and trigger affected projections without erasing history, so that offboarding is safe.

### D20 — Semantic section catalogs

115. **US22-115** — As an administrator, I want one small code-owned section catalog for each Page family, so that flexibility stays supportable.
116. **US22-116** — As an editor, I want optional sections shown as Off, Available, or Expected, so that expectations are clear without a matrix of knobs.
117. **US22-117** — As a donor, I want consistent labels and semantic order across a tenant's pages, so that pages are easy to scan.
118. **US22-118** — As a source owner, I want managed fields visibly locked to their source, so that editors do not mistake derived facts for page copy.
119. **US22-119** — As a security reviewer, I want arbitrary HTML, scripts, embeds, forms, maps, testimonials, and unsupported statistics excluded, so that the public surface stays bounded.
120. **US22-120** — As product staff, I want catalog additions versioned in code and compatibility-certified, so that old releases remain renderable.

### D21 — Surface-authority cutover

121. **US22-121** — As an operator, I want a complete activation cohort scoped by Tenant, Legal Entity, environment, Site, verified hosts, and locale, so that no public route is missed.
122. **US22-122** — As migration staff, I want every legacy page and route assigned an exact disposition before cutover, so that unknowns cannot silently disappear.
123. **US22-123** — As an operator, I want a private resumable production-shaped shadow with no public, financial, notification, or measurement side effects, so that I can prove behavior safely.
124. **US22-124** — As an approver, I want one exception-first consequence review and literal activation action, so that cutover is understandable.
125. **US22-125** — As a platform owner, I want one generation-fenced compare-and-swap reader cutover with no legacy fallback, so that split authority is impossible.
126. **US22-126** — As a performance owner, I want a minimum 5,000-Page production-shaped fixture, so that cohort proof covers realistic scale.

### D22 — Derived Public Pages workspace

127. **US22-127** — As staff, I want To review, Needs attention, and All pages views, so that normal work has three clear places.
128. **US22-128** — As staff, I want healthy pages quiet and exceptions ordered by consequence, so that noise does not hide urgent work.
129. **US22-129** — As a contributor, I want only Pages and actions I am currently authorized to see, so that workspace summaries cannot leak other ministries.
130. **US22-130** — As an operator, I want each exception to state root cause, affected scope, public consequence, and owner, so that recovery is direct.
131. **US22-131** — As staff, I want workspace status derived from source truth rather than manually closed tasks, so that green cannot be manufactured.
132. **US22-132** — As a user, I want every action re-proved when selected, so that a stale list cannot grant authority.

### D23 — Setup and settings workspace

133. **US22-133** — As a new administrator, I want first setup to ask only Missionary reach, Project reach, and review posture, so that onboarding is fast.
134. **US22-134** — As an administrator, I want ongoing settings grouped into Visibility and publishing, Page appearance and discovery, Optional features, and Chosen on each page, so that configuration is findable.
135. **US22-135** — As an administrator, I want current effective values and consequences in plain language, so that changing a setting requires no guesswork.
136. **US22-136** — As an administrator, I want one owner-specific form and action per change, so that a global Save cannot mix unrelated authorities.
137. **US22-137** — As an administrator, I want compare-and-swap conflict feedback and authoritative readback, so that concurrent edits do not overwrite one another.
138. **US22-138** — As operations staff, I want setup state derived from source-owned profile versions, so that there is no duplicate settings database.

### D24 — Staff Page revisions

139. **US22-139** — As staff, I want to edit through the same immutable candidate workflow as contributors, so that there is one editorial model.
140. **US22-140** — As a contributor, I want staff-authored changes clearly attributed, so that I can understand what changed and by whom.
141. **US22-141** — As staff, I want editing authority independent from approval authority, so that making a revision does not authorize its release.
142. **US22-142** — As staff, I want a short, notification-safe, contributor-visible reason only when superseding contributor work, so that meaningful intervention is explained without routine bureaucracy.
143. **US22-143** — As an auditor, I want staff revisions to preserve the prior candidate and release, so that history remains exact.
144. **US22-144** — As product staff, I want no editorial branches, merges, or privileged override mode, so that the experience stays simple.

### D25 — Recoverable editorial work

145. **US22-145** — As an editor, I want recent work recovered after a refresh or transient failure, so that normal drafting is resilient.
146. **US22-146** — As an editor, I want recovery scoped to the exact Page and locale and kept below the immutable head, so that another language or Page is never overwritten.
147. **US22-147** — As a database owner, I want at most one coalesced recovery buffer per Page and locale rather than keystroke rows, so that resilience does not become database load.
148. **US22-148** — As an editor, I want recovery to create an ordinary successor before submit or publish, so that temporary state never becomes authority.
149. **US22-149** — As an editor, I want a conflict-safe choice when the released or candidate head changed, so that recovered text cannot silently replace newer work.
150. **US22-150** — As operations staff, I want reference-safe cleanup after recovery or expiry, so that temporary buffers remain bounded.

### D26 — Sharing attestation

151. **US22-151** — As an editor, I want one calm disclosure at Submit or Publish that I may share the text and media, so that responsibility is clear without legalistic friction.
152. **US22-152** — As a contributor, I want the attestation integrated into the action rather than a separate checkbox workflow, so that publication stays simple.
153. **US22-153** — As an auditor, I want actor, candidate digest, scope, and action recorded, so that the exact attested content is provable.
154. **US22-154** — As an editor, I want a material successor to require a new attestation, so that prior consent is not stretched to different content.
155. **US22-155** — As a safety officer, I want Phase 10 objections and safety controls to override attestation, so that permission does not equal safe publication.
156. **US22-156** — As migration staff, I want legacy content labeled permission not captured rather than fabricated, so that historical uncertainty is honest.

### D27 — Site-scoped Pages and locale consistency

157. **US22-157** — As an administrator, I want one Page identity per Site, family, and exact subject, with locale excluded from identity, so that translations do not become duplicate pages.
158. **US22-158** — As a translator, I want independent immutable editorial lineages per locale, so that language content can be released at its own pace.
159. **US22-159** — As a visitor, I want exact-locale resolution with no silent fallback, so that a URL never serves the wrong language.
160. **US22-160** — As an administrator, I want one current presentation profile per Tenant, Legal Entity, environment, Site, and family, so that all locales and pages remain visually consistent.
161. **US22-161** — As an administrator, I want `Page design — all languages` separate from `Content — this language`, so that family presentation and translation work are not confused.
162. **US22-162** — As an operator, I want compatible profile activation proved against the full Page-and-locale cohort and switched atomically, so that partial layout rollout cannot break a Site.

### Cross-cutting outcomes

163. **US22-163** — As a donor, I want pages usable by keyboard, screen reader, zoom, reduced motion, and mobile touch, so that public ministry is accessible.
164. **US22-164** — As a tenant, I want strict tenant, legal-entity, environment, Site, subject, Page, locale, and release isolation, so that another organization can never affect my surface.
165. **US22-165** — As an operator, I want idempotent commands and compare-and-swap conflicts instead of blind retries, so that concurrency cannot duplicate release effects.
166. **US22-166** — As a privacy officer, I want all public egress generated from allowlisted projections, so that raw operational or supporter records never escape.
167. **US22-167** — As an administrator, I want an exportable audit of Pages, releases, routes, assignments, profiles, and dispositions, so that platform change is possible.
168. **US22-168** — As support staff, I want correlation-safe diagnostics and public-safe error responses, so that failures are diagnosable without leaking data.
169. **US22-169** — As a platform owner, I want bounded work, keyset traversal, and tenant-fair background processing, so that a large tenant cannot starve others.
170. **US22-170** — As a product owner, I want every public claim to preserve its source and freshness class, so that presentation never masquerades as identity, finance, delivery, or payment truth.

## Implementation Decisions

### Public boundary and authority

- `PublicMinistryPagesService` is the sole Phase 22 behavior boundary. It owns
  authenticated author, reviewer, and administrator commands; exact public
  resolution; and adoption or recovery commands. Routes, dashboard screens,
  jobs, the CMS, and Phase 5 public readers are adapters, never alternate
  business APIs.
- Public Pages are immutable presentation projections. Phase 9 remains
  authoritative for parties and CRM Ministry Project identity and lifecycle,
  Phase 10 for publication safety, Phase 12 for authenticated supporter access,
  Phase 13 for Giving Campaigns, Designations, contribution truth, and checkout,
  Phase 15 for offline evidence, Phase 16 for commitment truth, Phase 21 for
  Support Assignments and AI purpose bindings, and Phase 29 for media capability.
  Phase 22 may reference and project those facts; it may not recreate, weaken,
  or infer them.
- Every command and read is scoped by the complete applicable key rather than a
  tenant identifier alone. Public resolution begins with the verified host and
  environment, resolves the exact tenant, legal entity, Site, route generation,
  Page, requested locale, and immutable release, and then performs current-source
  admission. Unknown, ambiguous, mismatched, or unauthorized scope fails closed.
- “Draft,” “candidate,” “approved,” “released,” “reachable,” “listed,” “indexed,”
  “cached,” “Give available,” “checkout created,” and “gift completed” are
  separate facts. No status word or successful step implies the next one.

### D1–D5 page families, reach, presentation, and release

- **D1:** There are exactly two launch families: Missionary Ministry Page and
  Project/Campaign Page. Both use the shared publication contract but have
  distinct typed presentation catalogs. Editing authority comes only from an
  active, explicit contributor assignment for the exact Page; being a spouse,
  team member, subject participant, supporter, or financial viewer grants
  nothing by inference.
- **D2:** A versioned tenant Publication Reach profile supplies family defaults.
  A Page requests one of `Not public`, `Shared by link — public`, or `Listed
publicly`; Phase 10 computes the release-time and live ceilings. Shared by
  link is an unlisted public URL, not authentication or secrecy. Every egress
  uses effective live reach, including routing, directory, sitemap, metadata,
  media, Updates, measurement, and cache admission.
- Reach defaults seed new work and never silently widen existing releases.
  Listed-to-link-only transition rotates to a new opaque, non-name-derived route
  and tombstones the old route without redirect. A represented person has a
  no-hoops `Stop showing me publicly` action that contains exposure immediately;
  restoration requires a new admitted release and cannot promise recall of
  third-party copies.
- **D3, as narrowed by D27:** Presentation profiles are immutable, versioned,
  and typed. Exactly one profile is current for each Tenant × Legal Entity ×
  environment × Site × Page Family. Pages and locales cannot override the
  layout. Missionary and Project families may differ. The renderer accepts only
  code-owned blocks and options certified for that family and profile version.
- **D4:** One prospective versioned Review & Release Profile chooses `Review
before publishing` or `Publish after checks`. Setup starts with one disclosed
  organization fallback of review-before-publishing until the tenant makes a
  deliberate choice; progressive customization exposes only the Missionary Page,
  Project/Campaign Page, and Ministry Update publication paths the tenant uses.
  The selected exact-scope version is pinned when a candidate is submitted;
  later profile changes are prospective. Mandatory eligibility, safety,
  attestation, source, subject, route, media, and release checks apply in either
  posture. Automatic release is a policy outcome, not a bypass.
- **D5:** Staff review has one lane and three outcomes: `Approve & publish`,
  `Request changes`, or terminal `Reject`. Each action targets the exact
  candidate digest and expected heads and is compare-and-swap guarded. Requesting
  changes or rejection never mutates the candidate. There is no configurable
  approval graph, quorum, delegation chain, parallel branch, or generic task
  state in Phase 22.
- Editorial state is append-only: mutable local or recovery text can become an
  immutable revision; a submitted revision becomes a candidate; a successful
  release creates a release manifest and advances one locale head atomically.
  A released body is never edited in place, and “unpublish” is a new lifecycle
  or reach disposition rather than deletion.
- One coherent working revision per Page and locale uses presence, bounded edit
  locks, an exact base head, and conflict-safe compare-and-swap. Editing after
  submit creates new work rather than changing the candidate. Revocation removes
  draft, preview, upload, notification, and background authority immediately
  while retaining authorship evidence and quarantining affected pending work.
- Every candidate pins its normalized digest, base and live heads, actor and
  assignment, profile and catalog, renderer, media and Update bindings, locale,
  reach, safety, and dependency generations, plus a complete semantic and public-
  egress diff. Manual, automatic, scheduled, and restore paths invoke the same
  idempotent release kernel; unknown egress cannot be staff-overridden.

### D6–D10 progress, giving, routes, media, and preview

- **D6:** Each Page independently chooses `Hidden` or exactly one compatible
  Public Support Progress Profile. Allowed metric types distinguish sustained
  monthly support from bounded one-time goals and bind to an exact source,
  currency, formula version, coverage, and freshness contract. Public numbers
  come from source-owned projections that include eligible offline facts. Field
  Account balances, converted totals, manually typed values, negative goals,
  stale results, and missing-as-zero are forbidden. If proof fails, omit the
  module and expose a staff-owned exception.
- **D7:** Each Page has exactly one Phase 13 Designation binding in the MVP.
  Draft setup may remain incomplete, but no Page releases without the binding.
  Every Page Give CTA is a presentation of that binding. A tenant may also show
  one separately labelled general-giving link, but it carries no inherited
  Page destination, amount, cadence, or attribution and is never a fallback or
  substitution. The server re-proves
  Page release, effective reach, Site, locale, source code, requested exact
  currency, Designation eligibility, and checkout context at action time. It
  creates one Phase 5-to-Phase 13 handoff or returns `Giving unavailable`; it
  never substitutes an organization fund or adjacent designation.
- **D8:** Routes are append-only generations with one current disposition.
  Supported outcomes are keep the canonical Page, show a bounded transition
  notice, issue one hop of permanent redirect only to the same Page's currently
  Listed successor, or return a privacy-safe 404. Redirect chains, ambiguous
  slug reuse, cross-subject redirects, and restricted-identity redirects are
  invalid. Page retirement does not decide whether a Designation can accept,
  redirect, refund, or reallocate gifts.
- **D9:** Media follows private intake, validation and threat scanning,
  orientation-aware decode, still-raster normalization, metadata stripping,
  safe master creation, responsive derivative generation, accessible placement,
  review, and release binding. Public object keys, URLs, headers, downloads,
  manifests, and social cards expose neither the uploader's filename nor source
  metadata. Public delivery is opaque, allowlisted, release-bound, and incapable
  of reading private originals. Raw intake expires on a bounded schedule, and
  the original filename is discarded from operational/public records once a
  safe internal job identity exists. A withdrawal creates an adverse disposition
  and contains every affected derivative and release at the smallest safe scope.
- Launch accepts JPEG, PNG, and still WebP only; optional formats require an
  explicit decoder corpus certification. SVG, animation, multiple-image files,
  documents, and video are rejected. Byte, pixel, dimension, channel, frame,
  decode-time, memory, and output ceilings are enforced before a controlled sRGB
  re-encode and independent metadata-free reparse. Intake is short-lived and
  private; public derivatives are eager, immutable, and never provider on-demand
  transforms or overwritten objects.
- **D10:** Preview is available only to authenticated users who are currently
  authorized for the exact Page and candidate. Preview URLs are not bearer
  capabilities. Responses are no-store, noindex, protected from unsafe referrer
  propagation, and denied to anonymous crawlers. Giving, responses, analytics,
  notifications, webhooks, and other effects are inert in preview.

### D11–D16 Updates, engagement, discovery, measurement, and assistance

- **D11:** A Ministry Update has one canonical identity and immutable revisions,
  plus explicit audience-specific release projections. Public and authenticated
  supporter projections are independently admitted and advanced. Protected
  material is never automatically redacted into a public post; an author must
  deliberately supply a public-safe variant. A release fact is distinct from
  email, notification, or feed delivery outcome.
- A Page pins an exact Feed Binding that selects the source and purpose set it
  may present; display membership never supplies that binding. Public Update
  ordering uses released time plus opaque identifier, and an empty or
  unprovable Updates section collapses quietly.
- Prior Asym wording `My Feed` survives only as a migration, search, and help
  alias for Ministry Updates. It never names a second feed, copied post model,
  route authority, or independently releasable content source.
- **D12:** One prospective tenant Response Profile starts at `Responses off`
  and chooses `Responses off`, `Like + I prayed`, or `Like + I prayed +
comments`; guided setup recommends acknowledgement-only. It is a ceiling over
  exact supporter-release Engagement Spaces: an Update may narrow or close its
  space, and reopening preserves evidence and uses D4/D5 release authority.
  Responses require authentication and current access to the exact supporter
  release. Idempotency is scoped to the full Engagement Space: Tenant, Legal
  Entity, environment, purpose, Update and revision, Supporter Release
  Projection/version, audience, safety/auth epochs, Response Profile, and
  operation generation.
  Comments are bounded plain text with safe links and one reply level; enabling
  them also chooses one `Right away, with reporting` or `After review` posture
  and one existing authorized moderation group. Moderation is append-only and
  current-source authorized. Anonymous public projections disclose no protected
  counts, identities, or response corpus.
- **D13:** The Public Ministry Directory is one release-derived contract whose
  presentation topology is either combined family sections or separate
  Missionary and Project surfaces. Only currently Listed releases participate.
  Search uses bounded tenant-approved public fields, deterministic ordering,
  keyset pagination, minimum-input and rate controls, and Phase 10-safe aliases
  and generalized geography. It offers no financial, popularity, engagement,
  supporter-count, hidden-count, distance, or map ranking.
- **D14:** Each release has one immutable Search & Share manifest. Listed pages
  may enter canonical locale metadata, sitemaps, safe structured data, and
  social cards. Shared-by-link pages remain noindex and absent from discovery
  while retaining deliberate sharing. Stricter reach produces no public
  artifact. Each canonical Update has one opaque permalink per Site and locale;
  complete current safe placement coverage makes it Listed when any admitted
  placement is Listed, public but noindex when every admitted placement is
  Shared by link, and absent when no admitted public placement remains. Share
  controls use first-party copy and platform-native invocation; passive
  third-party social SDKs and public share counters are excluded.
- **D15:** Measurement is tenant-off-by-default and has only `Staff only` or
  `Staff + assigned contributors` visibility when enabled. The accepted events
  are qualified Page load, full Update open, share menu open, and Give CTA
  selection. Only explicit POST admission records an occurrence; reads,
  prefetches, bots, health checks, previews, and retries create none.
  Occurrences contain no supporter identity or fingerprint, expire within 24
  hours, and feed idempotently sealed daily aggregates retained for 24 months
  with freshness and completeness labels. Measurement is never on the public
  serving or checkout critical path.
- **D16:** The writing assistant is optional, suggestion-only, and available
  only through an eligible exact-purpose provider binding authorized by Phase
  21 D10. It sends selected source text and the minimum policy context needed
  for one action. The closed launch catalog is `Start from guided answers`,
  `Fix spelling & grammar`, `Improve clarity`, `Shorten`, `Add detail` only from
  selected or newly supplied facts, exactly `Warm and personal`, `Clear and
direct`, or `Professional`, one length-bounded Page-Family-specific same-source
  action under `More`, and `Translate to English` for a certified
  source-language → exact
  Phase-24 English BCP 47 locale pair. Suggestions are quarantined from
  authoritative content, retained no longer than 24 hours, and require explicit
  comparison and `Replace selected text`, `Insert draft`, or, for translation,
  `Use English draft` to create a compare-and-swap successor. Translation always
  displays: “Check this translation. AI translation can make mistakes or miss
  context. Review this English draft carefully before using it.” Its expandable
  check list covers names, dates, numbers, quotations, Scripture, ministry terms,
  relationships, cultural meaning, fluent review for important content, and the
  fact that this is not a certified translation. Provider failure leaves manual
  editing fully functional, and no model may release, attest, moderate, classify
  safety, or invent operational or financial facts.

### D17–D20 subjects, runtime, assignments, and catalogs

- **D17:** A Page binds one exact source-qualified typed subject. Missionary
  Pages bind one Phase-9-owned Ministry Assignment. Project Pages bind one eligible CRM
  Ministry Project, Phase 13 Giving Campaign, or Designation, preserving the
  source type and opaque identifier. Subject eligibility is re-proved; fuzzy
  matching and copied subject data are invalid. After first release, replacing
  the subject creates a new Page and uses D8 to disposition the prior route.
- **D18:** Phase 5 is the sole public runtime execution boundary. It resolves an immutable
  release and separately current source facts, classifies each dependency by
  freshness, and completes admission before cache lookup or body streaming.
  Safety, reach, route, subject, assignment, media withdrawal, and lifecycle are
  adverse-first dependencies: a newly adverse fact denies immediately and may
  not use stale-if-error. Positive editorial presentation may use bounded stale
  delivery only when its recorded class permits it. Giving receives an
  independent action-time proof. Release health, provider health, cache purge,
  regeneration, and edge convergence remain separately observable facts.
- **D19:** A Ministry Assignment is organization-owned and explicitly records
  participants, while public display roles, D1 Page contributor grants, an
  optional Phase 21 exact same-scope zero-or-one current one-to-one/non-
  overlapping Support Assignment binding, Phase 12 support-visibility grants,
  and notification grants remain distinct prospective concerns. Marriage,
  household, team,
  leadership, subject display, editing, or fund association does not imply
  another grant. Database policies provide coarse tenant and membership
  isolation; a server-side policy decision point evaluates current fine-grained
  action authority. Service-role access never substitutes for actor proof.
- **D20:** Two small, closed semantic catalogs—one per family—define supported
  sections, cardinality, data ownership, accessibility semantics, and compatible
  profile versions. Optional sections use `Off`, `Available`, or `Expected`.
  Source-managed facts remain locked and labeled. Arbitrary blocks, code, raw
  HTML, third-party embeds, forms, maps, testimonials, donor lists, live feeds,
  and unsourced statistics are outside the launch catalog.
  - The Missionary catalog ships managed public identity; optional Introduction,
    Our ministry story, Ministry focus, and How you can pray; approved D9
    photos/media; optional D6 Support progress; the required D7-managed Give
    role; one bounded D11 Ministry Updates feed; and locked organization
    stewardship, disclosure, and help.
  - The Project/Campaign catalog ships managed project identity; optional
    Project summary, The need, What this project will do, and prospective
    Expected impact; approved D9 photos/media; optional D6 Project progress; the
    required D7-managed Give role; one exactly bound D11 Project Updates feed;
    and locked organization stewardship, disclosure, and help.
    Every certified Give placement on a Page uses its one D7 binding; managed
    values never become contributor-entered substitutes, and empty optional
    sections collapse without filler.

### D21–D27 adoption, workspaces, recovery, and locale consistency

- **D21:** Production adoption uses a complete Tenant × Legal Entity ×
  environment × Site × verified-host-set × locale cohort and an immutable census
  of every legacy route; Page, draft/autosave/version, template/global, subject,
  former-editor assignment, media, Update/preview, Giving binding; directory,
  search, sitemap, canonical/robots/social artifact; cache namespace/variant;
  API, reader, serializer, fixture, test, import path; and one non-overlapping
  disposition. Preparation is private, chunked, idempotent, resumable,
  production-shaped, and structurally side-effect-dark. Activation re-proves
  the complete manifest and advances one reader-authority generation by
  compare-and-swap. After that boundary, no request falls back to mock, legacy,
  or direct-CMS authority. Page-by-page content adoption may continue inside
  Phase 22 only through explicit safe dispositions. Production proof includes a
  minimum 5,000-Page, multi-locale, skewed-tenant fixture.
- **D22:** The Public Pages workspace is a disposable, permission-filtered
  projection with `To review`, `Needs attention`, and `All pages`. It derives
  state from release and source facts, coalesces duplicate symptoms under one
  root cause, explains consequence and owner, and stays quiet when healthy.
  There is no mutable task status, health toggle, close button, or shadow
  authority. Every action leaves the projection and enters its cause-owning
  command with current reproof.
- **D23:** Setup and settings store no duplicate settings object. First setup
  asks only `Who can find new Missionary pages?`, `Who can find new Project
pages?`, and `Should staff review contributor changes?`, while clearly
  distinguishing safe fallback from a tenant choice. Ongoing settings use the
  exact four groups `Visibility and publishing`, `Page appearance and
discovery`, `Optional features`, and `Chosen on each page`, as calm derived
  summaries of current source-owned profile versions. D7, D8, D9, D14, D17,
  D18, D19, D21, and D22 remain per-item, automatic, or separately owned rather
  than becoming D23 settings. Each edit uses one owner-specific consequence
  form, command, compare-and-swap, and authoritative readback. There is no
  universal Save, arbitrary flag matrix, or raw database editor.
- **D24:** A staff edit is an ordinary attributed immutable successor under D1.
  Staff authoring, reviewing, and releasing are independent grants. A short
  notification-safe, contributor-visible reason is required only when a staff
  revision supersedes unsuperseded contributor work. If the coherent head advanced, the exceptional recovery
  choice is exactly `Continue from latest draft` (recommended) or `Start from
submitted version`; either appends from and CAS-advances the current head while
  preserving the selected source. Existing candidates and releases remain
  intact. There is no silent takeover, privileged mutable override, branching,
  merge UI, or separate staff content channel.
- **D25:** Cause-gated actionability and tiered recovery introduce no durable
  task or health model. The editor may maintain one coalesced recovery buffer per
  exact Page and locale below the authoritative head, using a code-owned
  two-second debounce and fifteen-second maximum flush interval. Recovery is
  current-user authorized, encrypted and bounded, never indexed or publicly
  readable, and can only create an ordinary successor after conflict proof.
  A dependency may block approval or release without disabling independently
  authorized View submission, Request changes, terminal Reject, Withdraw, or
  D24 Edit actions; the candidate never gains a generic `stale` status. Age
  alone grants no authority. Cleanup is reference-safe and does not delete
  immutable editorial evidence.
- **D26:** The actual actor's existing Submit or Publish action records one calm
  Public Content Sharing Attestation for the exact immutable Page or independently
  released Ministry Update candidate. It confirms permission to share the
  included words and images publicly; it is not a checkbox, contract repository,
  rights-management workflow, verified ownership, or legal guarantee. The owning
  D2 Page Release Manifest or D11 Audience Release Manifest/Projection only pins
  the exact statement version, actor, tenant, legal entity, environment, Site,
  family or Update identity, locale, candidate and normalized digest, action,
  and server time—it cannot manufacture missing evidence. An unchanged reviewer
  approval retains the submitter's evidence; a clone, import, translation,
  different scope, material edit, or new candidate requires the current actor's
  new confirmation. Phase 10, current authorization, objections, takedowns, and
  safety rules always prevail. Historical content without evidence is labeled
  `not captured`; evidence is never fabricated.
  The action-adjacent copy is exactly `By submitting, you confirm you’re allowed
to share the words and images on this page publicly.` or `By publishing, you
confirm you’re allowed to share the words and images on this page publicly.`
- **D27:** Page identity is Site-scoped and excludes locale: one exact subject
  may have one Page per family on a Site, with independently released locale
  lineages beneath it. An exact locale request never falls back or synthesizes
  content. One presentation profile head governs the full Site-and-family
  cohort. A compatible profile version is shadow-rendered for every affected
  current and candidate locale release; activation is all-or-nothing and binds
  an epoch plus complete release-head-set digest. Incompatible or migration-
  requiring changes create ordinary successor revisions and releases instead
  of mutating content. The UI separates family-wide `Page design — all
languages` from per-locale `Content — this language`.

### Product surfaces and interaction contract

- `Your public pages` shows only currently actionable assignments, live public
  consequence, locale state, and the next owned action. The family editor keeps
  managed fields clear and combines bounded recovery, exact preview, concise
  checks, attestation, and one Submit or Publish action.
- Staff share that editor and receive the three D22 views. Review provides one
  accessible before/after diff, hard exceptions, consequence, attestation, and
  D5 actions; healthy work and unused options stay quiet.
- Setup progressively discloses plain-language consequences, family preview,
  and cohort proof. Public pages keep a clear primary Give action when eligible,
  optional progress and Updates, and first-class mobile and accessible behavior.

### Security, privacy, durability, and operations

- Anonymous output is allowlisted across every egress. It excludes raw CMS or
  operational rows, private media, supporter data, internal identifiers,
  filenames, notes, and diagnostics; logs use opaque correlations and redaction.
- Composite constraints, indexes, and restrictive/forced RLS enforce scope and
  monotonic heads. Every exposed relation is tested across actor and tenant
  matrices. Security-definer routines fix `search_path`, revoke public execution,
  and never trust caller-supplied tenant authority.
- Commands are digest-bound, idempotent, and CAS-guarded. Background or provider
  work uses bounded tenant-fair retries, inspect-before-retry after ambiguity,
  dead-letter visibility, and kill switches; blind retry cannot duplicate effects.
- Telemetry keeps reach, release, cache convergence, Giving eligibility, Update
  delivery, and measurement completeness distinct. Durable evidence is
  exportable with opaque IDs and provenance; assistant output, raw measurement,
  previews, and recovery buffers expire on their bounded schedules.

## Testing Decisions

### What makes a good test

Test the public contract through `PublicMinistryPagesService`, not through table
shape, Payload internals, route implementation, or mocked UI state. A useful test
starts with an actor and authoritative source facts, invokes one command or exact
public read, and proves the externally observable release, denial, handoff,
projection, or recovery result. Time, identifiers, provider responses, and
failure points must be controllable. Negative assertions cover every egress—not
only HTML—including data payloads, media, metadata, sitemaps, feeds, caches,
logs, analytics, errors, notifications, and timing-sensitive discovery.

The five mandatory end-to-end journeys are:

1. **Editorial release:** an assigned contributor edits an exact Page locale,
   recovers interrupted work, uses or declines an assistant suggestion, attaches
   sanitized media, attests, submits, follows the tenant's automatic or staff
   lane, resolves a concurrent-head conflict, and advances exactly one immutable
   release. Revocation and Phase 10 hard denial must fail closed without losing
   prior-good content or private work.
2. **Anonymous presentation:** an exact host and locale resolves the admitted
   release, family profile, public-safe subject, optional progress and Updates,
   media, route, directory, SEO/share, and cache behavior. Listed, link-only,
   not-public, restricted, withdrawn, retired, missing-locale, stale-positive,
   and newly adverse cases prove the full public egress matrix.
3. **Giving checkout handoff:** every CTA carries the same Page binding; action-
   time and pre-provider reproof preserve Site, locale, source, currency, Page,
   and exact Designation. Revocation, incompatibility, ambiguity, retry, and
   stale presentation yield `Giving unavailable` without substitution or a
   duplicate cart/provider effect.
4. **Ministry Updates and responses:** one canonical Update independently
   releases public and supporter projections, optionally records notification
   outcomes, and enforces current audience access for idempotent reactions,
   bounded comments, replies, and moderation. Mixed failures retain success and
   retry only residual work without leaking identity or counts publicly.
5. **Authority cutover:** a complete multi-tenant, multi-entity, multi-host,
   multi-locale census shadows at least 5,000 production-shaped Pages with no
   side effects, rejects gaps and drift, atomically advances one fenced reader
   generation, refuses legacy fallback, and proves smallest-scope containment,
   resumability, idempotency, and family-profile all-or-nothing activation.

### Required proof layers

- Fast service scenarios cover every US22 story and each D1–D27 invariant,
  including state-machine transitions, digests, compare-and-swap conflicts,
  idempotency, freshness classes, and failure injection.
- Focused tests against real PostgreSQL/Supabase—not an in-memory substitute—
  prove composite same-scope constraints, restrictive and forced RLS, anonymous
  denial, contributor/reviewer/admin matrices, cross-tenant and cross-entity
  isolation, security-definer safety, revocation, concurrent spouses, TOCTOU,
  monotonic release heads, and explain plans on production-shaped distributions.
- Contract suites prove the Phase 5 reader, Phase 10 safety ceiling, Phase 13
  cart revalidation, source projections, Payload access with actor context and
  access override disabled, media sanitization corpus, storage/CDN behavior,
  search metadata, and optional AI/provider degradation.
- Playwright journeys prove keyboard and screen-reader semantics, focus and live
  status, errors, 320-pixel layouts, zoom, touch targets, reduced motion,
  locale direction, preview inertness, review clarity, no-guesswork settings,
  public performance budgets, and route outcomes 200/308/404/503.
- Chaos, load, migration, and deployment-skew suites prove tenant fairness,
  bounded queues, worker crash recovery, ambiguous-outcome inspection, targeted
  adverse convergence, renderer compatibility, cohort completeness, rollback by
  forward disposition, and diagnostic usefulness without sensitive logging.

### Decision traceability

D1–D5 map to US22-001–030; D6–D10 to US22-031–060; D11–D16 to
US22-061–096; D17–D20 to US22-097–120; D21–D27 to US22-121–162; and
cross-cutting accessibility, isolation, concurrency, privacy, export,
observability, scale, and source honesty to US22-163–170. A release candidate is
not Phase 22-complete unless every range has both a positive journey and the
corresponding denial, stale-source, concurrency, and recovery proofs.

## Out of Scope

- A general website builder, arbitrary tenant code/CSS, raw HTML, plugins,
  embeds, forms, maps, testimonials, donor walls, or page-specific and locale-
  specific layout overrides.
- More than one Designation per Page, split-gift routing, fallback destinations,
  gift processing, recurring-plan ownership, accounting, Field Account balance
  publication, payroll, reimbursement, or any claim of payment completion.
- Anonymous or bearer-link previews; public comments or protected engagement
  counts; multi-level discussions; social-network SDK tracking; supporter
  identity analytics; fingerprinting; popularity or financial rankings.
- Automatic public redaction, autonomous writing or translation publication,
  AI safety approval, AI-created facts, Phase 22-managed model keys, or any AI
  dependency on the manual editorial path.
- Video, audio, documents, SVG, animated media, arbitrary on-demand transforms,
  a new media custody system, or a promise to recall already copied public data.
- Dual-read or dual-write migration, per-Page authority flags, legacy fallback,
  destructive rollback, mutable published documents, configurable approval
  graphs, a generic task engine, or a duplicate settings/health database.

## Further Notes

### Canonical repository sources

The normative grooming record is
`docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md`,
supported by
`docs/prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md`,
the Phase 22 block in root `CONTEXT.md`, ADR-0118 through ADR-0144, and the
active `openspec/changes/add-public-ministry-pages` change. This PRD resolves
preliminary alternatives by ratified order:
D4's tenant automatic lane, simplified D5, D7's one-Designation MVP, D8's final
route dispositions, and D27's removal of Page/locale presentation exceptions
govern wherever earlier research explored broader choices.

### Live implementation graph

The approved Phase 22 delivery graph contains 41 behavior-led tracer bullets,
P22-01 through P22-41, represented by native child issues
[#1282](https://github.com/Asymmetric-al/core/issues/1282) through
[#1322](https://github.com/Asymmetric-al/core/issues/1322), with 116 native
blocking relationships. [P22-01](https://github.com/Asymmetric-al/core/issues/1282)
is the sole current `ready-for-agent` frontier; every later ticket remains
governed by its live native blockers. The issue bodies point back to this PRD,
the active OpenSpec change, D1–D27, and the accepted ADRs. The complete issue
index and the distinction between delivery slices and OpenSpec proof checkpoints
are recorded in the
[`tasks.md`](../../../openspec/changes/add-public-ministry-pages/tasks.md)
implementation plan. Published labels and relationships are planning metadata,
not implementation, merge, deployment, production, or automatic-dispatch proof.

Phase 5's server public-content choke point and typed found/not-found/unavailable
result, Payload drafts and versions as an authoring substrate, Phase 13 cart
revalidation utilities, existing tenant/auth helpers, and current dashboard
navigation are useful integration seams. Payload access remains actor-scoped;
local or service APIs, admin operations, bulk actions, restore, scheduling,
draft status, and CMS access rules cannot manufacture a Phase 22 release.

### Existing versus FORWARD

**Existing:** the donor `/workers` experience reads mock data; CMS collections
and Web Studio surfaces prototype missionary, project, profile, template, media,
and Ministry Update editing; a Phase 5 published-content reader and checkout
helpers exist. These are precedents or migration inputs, not proof of this PRD.

**FORWARD:** `PublicMinistryPagesService`; the D1–D27 identity, assignment,
revision, attestation, review, release, reach, profile, progress, Giving, route,
media, preview, Update, response, directory, search/share, measurement,
assistant, runtime-admission, recovery, workspace, locale, and cutover contracts;
their database/RLS enforcement; and all required production certification.
Mock worker identifiers, mutable progress columns, direct query-string routing,
raw anonymous/Realtime reads, latest-draft previews, public filenames/provider
URLs, tenant-wide public update readers, and coarse cache invalidation are
conflicts to retire, never compatibility contracts.
