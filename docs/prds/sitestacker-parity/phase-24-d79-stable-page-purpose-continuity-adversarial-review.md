# Phase 24 D79 — Stable Page purpose continuity adversarial review

**Decision date:** 2026-08-31

**Founder answer reviewed:** Option 2 — stable Page identity plus a small
versioned public-purpose contract; routine edits continue and material purpose
changes require fresh qualification.

**Repository status:** planning authority only; no runtime, schema, migration,
Supabase policy, Vercel configuration, OpenSpec, ticket, deployment, or
production state changed.

## Final disposition

**Accept with required amendments.** Stable Page identity plus explicit,
versioned continuity is the strongest Core answer, but the raw wording could
create a tenant-authored purpose profile, duplicated owner facts, a semantic
classifier, or a recurring approval workflow. None is proven necessary or safe.

The corrected model is one sparse, opaque **Page Purpose Continuity Version**
for the exact target Page and locale, created atomically only when D76 first
activates an exact D78 predecessor; preparation alone creates no favorable head.
Each changed effective Page public release—Page editorial content plus its exact
meaning-bearing dependency closure—uses one initially unselected choice in the
existing D1 Publish review: it either keeps what the Page is for and reuses the
version, or declares that the candidate must continue as a fresh Page under D80.
D80 creates or advances no continuity version on the source, and the new Page
inherits no D78 relation or D79 state.

This exact composition is a Core-specific safety policy, not a falsely claimed
universal CMS feature. Current primary evidence supports its ingredients:
stable document identity, separate draft/published state, revision history,
staff-managed corresponding URLs, owner-governed URI consistency, user-need-
oriented content design, and server-enforced authorization. Exact immutable
receipts and one continuity input per changed effective release are Core-
specific additions. Core deliberately adds them because D78 lets a _different_
Page inherit a trusted historical address. That repository decision is stricter
than ordinary same-Page CMS redirects.

## Exact corrected decision to record

> After D76 activates a D78 relation, that relation pins one target Page-locale
> **Page Purpose Continuity Version**. The version is an opaque Page-owner
> assertion that a person using every currently favorable historical address
> pinned to it would still find that address's same public subject, substantive
> purpose, and intended visitor task in the candidate effective release; it
> stores no tenant-authored purpose text, taxonomy, tags, score, body, diff,
> hash, or inferred meaning. Audience,
> Publication Reach, safety, locale, family, route, binding, and eligibility
> remain independently owned and independently rechecked.
>
> A candidate effective Page public release whose exact meaning-bearing content-
> dependency digest changed for a target with active predecessors may not
> favorably activate until its existing D1 Publish review records one
> explicit, initially unselected choice: **This update keeps what this Page is
> for**, which reuses the current continuity version, or **This update changes
> what this Page is for**, which cannot publish through that Page identity and
> must continue as D80's fresh independent private Page. D80 leaves the source
> head and every D78 relation unchanged, and the target inherits neither.
> Drafts, autosaves, previews, and deterministic
> delivery rebuilds with the exact meaning-bearing dependency digest unchanged
> do not ask or mutate continuity.
>
> Before D76 activation, any target release drift still requires full D78 review.
> After activation, favorable renewal reuses the same fixed source-address/
> target-Page D78 review and both-Page authority; it adds no target search,
> purpose editor, taxonomy, workflow, permission, runtime resolver, provider
> rule, or donor-facing interstitial. D80's accepted new-Page continuation is
> the only material-change outcome; it publishes nothing in that transaction.

## Fact classification

- **Verified repository facts:** current Pages are Tenant-scoped Payload records
  with mutable slug/title/summary/page type, drafts/autosave, and no accepted
  Site/locale/Purpose Continuity model; current public reads select mutable
  latest-published content. Proposed Phase 23 stable Page/public-generation
  work remains blocked and is not current runtime.
- **Verified external facts:** current CMS products document stable identifiers,
  draft/published separation, revision histories, and staff-managed redirects;
  their redirect and revision capabilities remain distinct. Google requires
  accurate corresponding targets and warns against irrelevant redirects. W3C
  makes URI consistency an owner policy judged against user expectations. No
  reviewed official product promises a reliable automatic semantic materiality
  decision, immutable Core release receipt, or D79 per-release attestation.
- **Repository requirement:** D78's different-Page successor was accepted only
  after an exact human same-subject/purpose/task judgment. D79 may refine its
  temporal scope but must not silently replace that owner proof with ordinary
  redirect convention.
- **Product judgment:** one explicit semantic choice on the uncommon affected
  Page publication is proportionate to the inherited public-address consequence.
  It is less work than full D78 and more honest than an ignored metadata field.
- **Assumption requiring usability proof:** representative ministry publishers
  understand “what this Page is for,” distinguish the examples, and do not
  mechanically preserve it. This affects release admission, not the invariant.
- **Unresolved by D79:** whether a material-purpose publication should atomically
  make unrequalified old addresses unavailable, block until all are decided, or
  become a new Page identity. D80 decides that transaction; blocking is the safe
  interim ceiling.

## Current repository and intended-model reconciliation

| Concern            | Current `develop`                                                       | Proposed predecessor model                                                                                                             | Permanent D79 path                                                                                 |
| ------------------ | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Page identity      | Tenant relationship plus mutable slug; no accepted Site/locale identity | Proposed ADR-0145 separates stable Site Page identity, Editorial Revision, Placement Revision, and immutable D1 Public Site Generation | D79 depends on that accepted substrate; no temporary Payload-only continuity ID                    |
| Page families      | Mutable current `pageType`; no accepted immutable family                | Proposed ADR-0150 permits only `general_page` and `article` and rejects family-per-purpose/open schemas                                | Continuity is not a family, taxonomy, content type, or tenant schema                               |
| Draft/public state | Payload drafts autosave every 300ms                                     | Proposed ADR-0156 separates Working Revision from exact publication                                                                    | Draft/autosave never changes continuity; only D1 Publish records the choice                        |
| Audience and Reach | No complete accepted Phase 23 public contract                           | Proposed ADR-0168 makes audience code-owned and Reach a separate disposition                                                           | Recheck them independently; do not duplicate them in continuity state                              |
| Copy               | Current template/layout copies have no governed identity contract       | Proposed ADR-0167 gives a copied Page fresh independent identity                                                                       | Copy transfers no continuity version or D78 relation                                               |
| Authorization      | Current Payload access is broad Tenant scope                            | Proposed ADR-0174 and Phase 12 own exact actor/service effects                                                                         | Existing target Page publish effect chooses keep/change; fresh D78 still needs both-Page authority |
| Public runtime     | Mutable latest-published catch-all; no D1 manifest                      | Proposed D1 compiles immutable owner-aware route effects                                                                               | Runtime reads one compiled route effect, never purpose/body/version rows                           |
| D78                | Exact reviewed target release is the interim ceiling                    | ADR-0199 relation is directional, path-specific, non-transitive                                                                        | Pre-cutover remains exact; post-cutover relation pins one continuity version                       |
| Database/RLS       | No continuity table, relation, policy, function, or test exists         | D78 requires append-only same-scope heads and privileged parity                                                                        | Add only sparse logical versions/head plus D1 receipt references when substrate exists             |
| Hosting/provider   | Vercel executes shared-project deployment/domain behavior               | Phase 5/Core own host and route authority                                                                                              | D79 performs no Vercel/DNS/TLS/redirect/rewrite/deployment write                                   |

## Current primary evidence and bounded interpretation

| Primary source                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Verified finding                                                                                                                                                                                                                                                 | D79 use                                                                                                                         | Rejected overreach                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [Google Site Moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) (updated 2026-08-20)                                                                                                                                                                                                                                                                                                                               | Map each old URL accurately to a corresponding final URL; consolidated content may receive several old URLs; irrelevant homepage redirects confuse people and may be soft 404s; avoid chains; keep redirects at least a year and consider indefinitely for users | Preserve useful continuity through routine releases and direct to the current final Page path                                   | Google does not authorize ministry meaning or prove that a repurposed different Page remains corresponding |
| [W3C Web Architecture](https://www.w3.org/TR/webarch/#URI-persistence)                                                                                                                                                                                                                                                                                                                                                                                         | Representations evolve; URI persistence depends on sufficiently consistent, predictable representation as judged by the owner with user expectations in mind                                                                                                     | Stable Page identity is the resource; an authorized owner makes the semantic judgment                                           | Neither byte identity nor stable ID alone proves arbitrary repurposing                                     |
| [Payload versions](https://payloadcms.com/docs/versions/overview), [autosave](https://payloadcms.com/docs/versions/autosave), and [redirects](https://payloadcms.com/docs/plugins/redirects)                                                                                                                                                                                                                                                                   | Draft/autosave stays separate from published content; versions retain history; redirects can reference internal documents                                                                                                                                        | Preserve current draft UX and stable internal targets                                                                           | Retained CMS version rows are not runtime authority or permanent audit storage                             |
| [Contentful versions](https://www.contentful.com/help/content-and-entries/versions/) and [versioning FAQ](https://www.contentful.com/help/faq/versioning/)                                                                                                                                                                                                                                                                                                     | After initial publication, subsequent changed-and-published entry versions are saved as snapshots on the master environment; linked entities are not snapshotted                                                                                                 | Require exact effective dependency closure and restoration tests                                                                | A Page-row diff or entry snapshot does not determine semantic continuity                                   |
| [Sanity IDs](https://www.sanity.io/docs/content-lake/ids) and [Content Releases](https://www.sanity.io/docs/content-lake/content-release-document-flow)                                                                                                                                                                                                                                                                                                        | Stable document IDs track history/relations; release versions support explicit state transitions                                                                                                                                                                 | Stable identity plus exact release evidence, expected heads, and scheduled revalidation                                         | Sanity's schema or client validation is not Core server authorization or semantic proof                    |
| [Sanity validation](https://www.sanity.io/docs/studio/validation)                                                                                                                                                                                                                                                                                                                                                                                              | Studio schema validation is client-side and API writes can bypass it                                                                                                                                                                                             | Continuity must be enforced by the server publication boundary and database invariants                                          | A required UI field alone is not a safety boundary                                                         |
| [HubSpot](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects), [WordPress.com](https://wordpress.com/support/permalinks-and-slugs/), [Webflow](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow), [Shopify](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect), and [Neon One](https://support.neonone.com/hc/en-us/articles/9811436298637-URL-Redirects) | Current products document automatic same-item slug continuity and/or explicit staff-managed redirect mappings separately from revision history                                                                                                                   | Supports stable-ID default and explicit different-item ownership                                                                | Their broad/manual redirect features do not supply Core's different-Page semantic proof                    |
| [GOV.UK content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/) and [identify user needs](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/identify-user-needs/)                                                                                                                                                                      | Public content starts with a user need/task; the primary publishing organization maintains a user-need record and evidence                                                                                                                                       | Supports plain task-oriented decision copy and accountable governance                                                           | Does not establish user-need prose/taxonomy as redirect runtime authority                                  |
| [WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) and [Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)                                                                                                                                                                                                                                                                      | Selecting a control must not unexpectedly change context; confirmation is not intended for each simple document save/edit                                                                                                                                        | No draft confirmation; Core deliberately adds one input only to sparse D78-affected public releases, subject to usability proof | WCAG does not require or generally recommend this semantic choice                                          |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                                                                                                                                                                                                                                                                                                          | Grants and policies are both required; views and service roles need explicit care; updates require old/new-row protection                                                                                                                                        | Least grants, operation-specific policies/tests, privileged parity, and no browser mutation                                     | RLS is defense in depth, not the purpose decision engine                                                   |

The exact D79 composite is not a market-standard feature. It is justified only
as the smallest honest continuation of Core's accepted D78 proof. If D78 were a
generic same-Page redirect, stable identity plus a passive notice would be the
stronger simpler answer. D78 is instead different-Page authority; removing
active owner judgment would conflict with ADR-0199 and must be an explicit
replacement decision, not an imported CMS default.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — High severity / High likelihood without
amendment.** **What could go wrong:** Core could build a Page-purpose product
because it sounds rigorous even though mainstream redirect/version products do
not require one, or could weaken D78 into perpetual stable-ID authority. **Why
it matters:** the first adds permanent ceremony and schema; the second lets a
trusted old address drift to a different task. **Evidence/reasoning:** external
evidence supports stable IDs and owner-governed consistency, while ADR-0199
requires an exact different-Page semantic decision. The strongest alternative
is stable Page identity plus a passive legacy-link notice; it is simpler but
cannot preserve D78's active semantic proof. **Decision effect:** narrows Option
2 rather than invalidating it. **Permanent fix:** one sparse opaque continuity
version and one choice only when an affected effective Page meaning-bearing
dependency digest changes. **Exact spec
language:** D79-R1–R8, R24; AC1–AC12, AC39–AC42.

### 2. Brittleness

**Material concern exists — Critical / High.** **What could go wrong:** a body
hash, changed-field list, purpose prose, taxonomy, linked-entry snapshot, or AI
classifier can misclassify a tiny material change and a large harmless edit;
shared/global content and personalization can change rendered meaning without a
Page-row diff. **Why it matters:** false preserve serves wrong meaning, while
false change destroys useful links. **Evidence:** no reviewed CMS claims
semantic diff authority; Contentful linked state and Sanity/Payload drafts are
separate; current Core Pages contain layout plus legacy rich text. **Decision
effect:** removes every machine/materiality representation from the contract.
**Permanent fix:** opaque owner choice on the exact candidate effective release
and its pinned meaning-bearing dependency closure, with current owner facts
rechecked independently. **Exact language:** D79-R3–R8, R14–R15, R19;
AC7–AC12, AC17–AC20, AC31–AC33.

### 3. Technical debt

**Material concern exists — High / High.** **What could go wrong:** teams could
introduce three purpose fields, tenant vocabularies, Page-family variants,
separate approval state, diff service, redirect editor, or duplicated audience/
Reach/safety facts. **Why it matters:** every addition needs migrations, access,
localization, APIs, backfills, UI, tests, operations, and future compatibility.
**Evidence:** proposed ADR-0150 explicitly limits Page families; D1/D78 already
own publication and route evidence. **Decision effect:** materially narrows the
raw option. **Permanent fix:** reuse D1 receipt and D78 relation, add only an
append-only sparse version/head. **Exact language:** D79-R1–R4, R6–R8, R16,
R19, R24; AC1–AC4, AC24–AC30, AC40.

### 4. Edge cases

**Material concern exists — Critical / High.** **What could go wrong:** target
changes before cutover; several old addresses converge; a scheduled release
runs after another publish; content is restored; Page is copied; locale is
disabled; audience/reach/safety changes; Page is unpublished/trashed; route
moves; source detail is restricted; or a D1 dependency rebuild occurs without a
Page edit. **Why it matters:** each is realistic in multi-Site publishing and can
either leak meaning or break continuity. **Evidence:** D76–D78 pin exact heads;
Phase 23 separates Page/editorial/placement/public generations and copies fresh
identity. **Decision effect:** adds explicit pre/post-activation, restore, copy,
schedule, multiple-relation, and no-Page-change rules. **Permanent fix:** exact
state machine with adverse-current-truth precedence and no automatic revival.
**Exact language:** D79-R5–R15, R18–R22; AC4–AC21, AC29–AC36.

### 5. Footguns

**Material concern exists — High / High.** **What could go wrong:** a
preselected “keep,” missing input treated as preserve, a tiny Inspector badge,
ambiguous “no changes” label, checkbox, toast-only result, or bulk approval can
cause mechanical continuation. Staff may assume draft save changed links or
purpose selection already published. **Why it matters:** the action carries a
trusted public address and can be cached. **Evidence:** WCAG requires predictable
input; Core's Inspector disappears below `lg`; D78 rejects bulk/global
equivalence. **Decision effect:** changes the UX and safe default. **Permanent
fix:** main-column context, initially unselected plain choices, one existing
Publish action, persistent result, no implicit/default/bulk behavior. **Exact
language:** D79-R6–R11, R23; AC5–AC16, AC35–AC38.

### 6. Tenant safety

**Material concern exists — Critical / Medium.** **What could go wrong:** a
Page, locale, relation count, path, preview, purpose choice, receipt, cache tag,
or current head can cross Tenant, environment, Site, or permission scope. A
publisher may see historical paths owned by another restricted Site. **Why it
matters:** public-route mutation and private operational metadata can leak or
mix between ministries. **Evidence:** current Payload access is only Tenant-
scoped; D78 requires exact same-scope relations; Supabase warns that grants,
views, and bypass roles can defeat RLS. **Decision effect:** requires composite
scope and permission-safe aggregation. **Permanent fix:** server-derived scope,
same-scope keys, exact capability effects, restricted-detail placeholders,
exact authoritative cache identity plus bounded non-authoritative owner tags.
**Exact
language:** D79-R2, R9–R11, R16–R20; AC3, AC6, AC13, AC22–AC30, AC34.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical / High if implemented conventionally.**
**What could go wrong:** nullable purpose heads silently mean preserve; mutable
rows move scope; caller supplies actor/Tenant/Page; orphaned relations survive
delete; browser writes bypass D1; `USING` admits an update whose result violates
scope; owner/view/RPC/service role bypasses policy; fan-in relations lack an
index; or a fake cross-store foreign key creates drift. **Why it matters:** an
invalid favorable route becomes durable public truth. **Evidence:** PostgreSQL
and Supabase require grants plus policy, `WITH CHECK` on new row state, safe
views/functions, and indexed relationship access. **Decision effect:** makes
append-only same-scope expected-head command mandatory. **Permanent fix:** one
current head per Page/locale, non-null relation reference, restrictive deletes,
composite integrity, equality-leading indexes, no direct DML, FORCE RLS where
applicable, privileged parity, short set-based transaction. **Exact language:**
D79-R16–R18, R20–R22; AC22–AC30, AC32–AC34.

### 8. Overengineering

**Material concern exists in the unamended option — High / High; no material
concern remains in the corrected scope.** **What could go wrong:** “public-
purpose contract” could become a universal content-governance ontology or
semantic service. **Why it matters:** Phase 24 needs safe different-Page URL
continuity, not speculative CMS governance. **Evidence:** no current Page
purpose model or proven tenant workflow exists; external products separate
redirects and versions. **Decision effect:** eliminates all purpose fields,
taxonomies, classifiers, notes, new roles, and workflows. **Permanent fix:** one
opaque integer/identity lineage only for affected Page/locale plus D1 receipt
choice. **Exact language:** D79-R1–R4, R8, R24; AC1–AC3, AC40–AC42.

### 9. UX/UI and user friction

**Material concern exists — High / High.** **What could go wrong:** full D78 on
every typo causes fatigue; a repeated modal or per-address question blocks normal
editing; a passive hidden notice is missed; poor mobile/reflow/RTL/weak-network
behavior hides consequences; donor interstitials reduce trust. **Why it matters:**
ministry staff must update Pages quickly in field conditions and visitors need a
seamless tenant-native result. **Evidence:** current Web Studio has one normal
Publish action and a desktop-only Inspector; WCAG discourages unexpected context
changes and explicitly does not require confirmation for every simple document
edit. D79's choice is therefore a deliberate Core exception only for the sparse
D78 different-Page cohort, not a general accessibility pattern. **Decision
effect:** retains one Page-level choice in the existing review only when the
effective meaning-bearing release changes, with calm persistent context and no
donor UI; representative usability evidence remains an activation gate.
**Permanent fix:** exact copy/panel/order/states,
summary-first rendering, accessible list on demand, one submit, persistent
receipt, comprehensive usability/a11y proof. **Exact language:** D79-R6–R12,
R23; AC5–AC16, AC35–AC38, AC43.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical / High.** **What could go wrong:** Payload
form state, purpose metadata, a badge, Content Health, Vercel, cache, or D77
projection becomes authority; audience/reach/safety are copied and diverge; a
read model writes back. **Why it matters:** two owners can disagree about which
old address is safe. **Evidence:** Phase 5/D1/Page/D78/Phase 12 already divide
responsibility. **Decision effect:** defines one owner per fact and a small set
of invariants. **Permanent fix:** Page owner owns continuity choice/version;
D78 owns relation; content owners own their exact revisions; D1 owns the
effective meaning-bearing dependency manifest/digest and public generation;
Phase 5 owns resolution; every other surface projects. **Exact language:** D79-R2–R4, R16–R20, invariants I1–
I16; AC2–AC4, AC22–AC31.

### 11. Hidden coupling

**Material concern exists — High / High.** **What could go wrong:** continuity
depends on Payload's version-retention limit, a specific field layout, Vercel
redirect config, preview availability, shared component revision, or D78-only
adapters. **Why it matters:** CMS/provider upgrades or pruning can break public
routes. **Evidence:** Payload and other CMS version history has retention/product
semantics; D1 is the intended immutable public boundary. **Decision effect:**
forbids runtime/history coupling and reuses owner ports. **Permanent fix:** typed
immutable evidence/digests and receipts, compiled route effects, no public
version lookup, no provider write, no new adapter framework. **Exact language:**
D79-R3–R4, R8, R16, R19–R22, R24; AC25–AC33, AC40.

### 12. Failure modes

**Material concern exists — Critical / High.** **What could go wrong:** Page
publishes but old routes stay favorable; routes become not-found while Page
publish fails; a lost response causes duplicate publication; cache/outbox lags;
authorization disappears after load; provider/preview fails; or unknown status
is interpreted as preserve. **Why it matters:** mixed public meaning is harder to
see and repair than a clean failed publish. **Evidence:** D1/D78 require exact
generation-bound effects; permanent redirects may be cached. **Decision effect:**
requires atomic local authority, safe prior generation, durable receipt, outbox
replay, and unknown-fails-safe behavior. **Permanent fix:** expected-head one-
winner transaction, no network under lock, adverse reader, cause-owned status,
forward correction. **Exact language:** D79-R5–R7, R12–R13, R15, R18–R23;
AC8–AC12, AC18–AC21, AC26–AC34, AC44.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical / High.** **What could go wrong:** draft
advances public head; scheduled release uses old choice; restore rewinds purpose;
two publishers choose opposite outcomes; D78 renews while purpose changes; D76
activates a stale release; copy inherits; or replay creates a second effect.
**Why it matters:** individually valid operations can jointly violate meaning.
**Evidence:** current Payload autosave is frequent; proposed D1 and D76 pin exact
heads. **Decision effect:** adds explicit states/transitions and monotonicity.
**Permanent fix:** publish-only head, expected Page/continuity/relation-set heads,
deterministic lock order, semantic idempotency, no resurrection, schedule-time
pin plus execution revalidation. **Exact language:** D79-R5–R8, R12–R18;
AC4, AC8–AC21, AC26–AC29, AC33.

### 14. Data integrity risks

**Material concern exists — Critical / Medium.** **What could go wrong:** two
current continuity heads, missing version on a favorable relation, relation
pinned to another Page/locale, stale affected count, partial fan-in update,
duplicate receipt, history deletion, or mutable denormalized `has_predecessors`
causes inconsistent UI/runtime/reporting. **Why it matters:** staff cannot know
the real consequence and runtime can serve stale meaning. **Evidence:** D78
allows several separately qualified sources to one target; cross-table
invariants cannot rely on UI convention. **Decision effect:** requires complete
set digest and structural cardinality. **Permanent fix:** composite uniqueness,
append-only lineage, indexed set-based closure, server-derived count, atomic
receipt/audit/outbox, reconciliation tests. **Exact language:** D79-R11,
R16–R18, R21–R23; AC13–AC16, AC22–AC30, AC32–AC34.

### 15. Security and privacy risks

**Material concern exists — Critical / Medium.** **What could go wrong:** a
publisher sees restricted source Site details; route history exposes sensitive
mission locations; caller forges actor/decision; service role bypasses scope;
logs export Page bodies or purpose content; open redirect/phishing is introduced.
**Why it matters:** ministry location/member-care data and tenant trust are
sensitive even when the final Page is public. **Evidence:** D78 excludes
protected owners and arbitrary URLs; Supabase warns service roles bypass RLS.
**Decision effect:** no purpose/body storage, no arbitrary target, minimal audit,
permission-safe detail, privileged parity. **Permanent fix:** stable internal
Page ID, exact public-route-only scope, data minimization, retention controls,
redacted logs/exports, server actor, no context carry, protected-owner exclusion.
**Exact language:** D79-R3–R4, R9–R11, R16–R20, R23–R24; AC6, AC13, AC22–AC31,
AC34–AC38.

### 16. Scalability and performance risks

**Material concern exists — High / Medium.** **What could go wrong:** a target
with many predecessor addresses causes N+1 checks/radios, lock amplification,
large receipts, slow publish, or per-request continuity joins. **Why it matters:**
large tenants and domain consolidations are production-shaped even if most Pages
have zero relations. **Evidence:** Google explicitly permits consolidated
targets; D78 permits separate qualifications to one Page. **Decision effect:**
one Page-level choice, server-paginated detail, compact complete-set digest,
set-based indexed transaction, zero runtime purpose lookup. **Permanent fix:**
sparse lookup keyed by scope/target/locale/head; bounded transaction/query plans;
load tests at ratified maximums; no arbitrary limit frozen in grooming. **Exact
language:** D79-R1, R9–R11, R16, R18–R21; AC1, AC13–AC16, AC25, AC32–AC33,
AC41–AC43.

### 17. Operational burden

**Material concern exists — High / High in the raw option.** **What could go
wrong:** staff maintain a purpose catalog, support resolves every typo, direct
SQL repairs heads, or each predecessor requires recurring separate review.
**Why it matters:** small nonprofit teams cannot carry specialist CMS governance.
**Evidence:** routine Page maintenance is frequent; D78 full review is
intentionally focused and address-specific. **Decision effect:** removes purpose
authoring and per-address routine review. **Permanent fix:** one Page-level
choice, automatic safe D1 compilation, owner-native recovery, append-only repair,
no provider/manual cleanup. **Exact language:** D79-R1–R3, R6–R13, R18–R24;
AC1, AC5–AC21, AC28–AC44.

### 18. Observability and auditability gaps

**Material concern exists — Critical / High.** **What could go wrong:** technical
logs say Publish succeeded but cannot prove which meaning choice, affected
relations, actor, heads, public generation, or correction was used. Staff cannot
explain why an old link works or stopped. **Why it matters:** semantic route
effects require durable business evidence separate from traces. **Evidence:**
current audit hook is log-oriented; D78 requires immutable receipts. **Decision
effect:** adds exact D1 receipt fields, route/relation business history, and named
signals. **Permanent fix:** durable append-only receipt/audit/outbox, correlated
technical trace, permission-safe staff timeline, cause/status/repair evidence,
monitors below. **Exact language:** D79-R6, R11–R13, R16–R18, R21–R23; AC8–AC16,
AC18–AC34, AC39, AC44.

### 19. Dependency and integration risks

**Material concern exists — High / Medium.** **What could go wrong:** Payload
API validation is trusted server-side, CMS version pruning breaks relations,
Vercel project redirects become a second authority, caches retain obsolete
responses, or third-party preview/media outage blocks the safe choice. **Why it
matters:** provider behavior and shared-project scope can cross tenants or outlive
Core decisions. **Evidence:** Sanity documents client-only validation; Payload
version storage is product-configured; Google/RFC redirects may be cached; D78
already forbids Vercel route mutation. **Decision effect:** eliminates external
runtime/mutation dependency. **Permanent fix:** Core owner command and immutable
public generation, inert optional previews, no network in transaction, provider-
no-op, cache versioning/purge/reconciliation with honest limits. **Exact language:**
D79-R3–R4, R7–R8, R16–R22, R24; AC9–AC12, AC25–AC33, AC40, AC44.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — Critical / High.** **What could go wrong:** D79 is
implemented on current mutable Pages, legacy redirects are guessed into versions,
old writers publish without a choice, nullable state means preserve, new writers
call old readers, or rollback revives stale relations. **Why it matters:** mixed
versions can violate the core invariant before monitoring notices. **Evidence:**
current `develop` lacks every required owner/publication substrate and predecessor
PRs are blocked. **Decision effect:** forbids implementation now and defines
reader-first staged rollout. **Permanent fix:** reconcile Phase 23; additive
sparse schema; no backfill; old-writer fence; shadow compile; one cohort; kill
switch; roll forward business history; safe prior generation on rollback.
**Exact language:** D79-R5, R16–R22, R24; AC2–AC4, AC22–AC34, AC39–AC42, AC44.

### 21. Testability, traceability, and proof

**Material concern exists — High / High.** **What could go wrong:** “routine”
and “material” remain vague; tests assert a row or radio instead of the public
result; OpenSpec/ADRs use conflicting terms; concurrency/RLS/a11y/migration
negatives are omitted. **Why it matters:** implementation can satisfy UI mocks
while serving wrong meaning. **Evidence:** D79 introduces a human semantic
decision, not a machine predicate; current OpenSpec has no D79 contract.
**Decision effect:** makes the decision falsifiable through explicit inputs,
states, outcomes, requirements, ACs, and release evidence. **Permanent fix:**
carry one term and IDs through ADR, glossary, PRD, OpenSpec, design, tasks,
tickets, code, tests, and release receipt; prove visible outcomes and invariants.
**Exact language:** D79-R1–R24; AC1–AC44 and proof suite below.

### 22. Other development hazards

**Material concern exists — High / Medium.** **What could go wrong:** staff
interpret “keep purpose” as legal/content approval; cached `308`s remain after a
material change; a broad Page purpose masks loss of one consolidated source's
specific usefulness; or instrumentation pressures the team into AI review.
**Why it matters:** the UI can imply guarantees Core cannot make or recall.
**Evidence:** permanent redirects are cacheable; several sources may consolidate;
human semantics are fallible. **Decision effect:** narrows labels and preserves
residual-risk honesty. **Permanent fix:** copy says only what is decided, no legal/
accuracy promise, advise new Page identity for truly new task, expose authorized
source list, monitor corrections/friction, never auto-approve. **Exact language:**
D79-R3, R6, R9–R14, R19–R24; AC5–AC21, AC31–AC44.

## Required specification language

### D79-R1 — Narrow need and sparse scope

D79 SHALL apply only to a `general_page` target Page/locale with at least one
prepared or active D78 different-identity predecessor. A prepared relation MAY
show read-only context but has no favorable continuity head; the first version
is created atomically only when D76 activates its exact reviewed release. Pages
that never had such a relation SHALL have no continuity state, field, prompt,
query, or changed publication flow. When the last relation becomes adverse or
retired, immutable versions/head remain inert history rather than being deleted
or reused; no favorable choice is required until a relation is active again.

### D79-R2 — Stable identity and exact relation pin

After D76 activation, every favorable D78 relation SHALL reference one stable
target Page identity, exact locale, and non-null Page Purpose Continuity Version.
The relation remains directional, address-specific, non-symmetric, and non-
transitive.

### D79-R3 — Opaque Page Purpose Continuity Version

The continuity version SHALL mean only that the authorized Page owner asserts,
for every currently favorable D78 relation pinned to it, that a person using
that historical address would still find its same public subject, substantive
purpose, and intended visitor task in the candidate effective release. It SHALL
NOT store or infer tenant-authored purpose text, subject/task fields, taxonomy,
tags, notes, body, snapshot, hash, diff, score, threshold, analytics, embedding,
or AI output.

### D79-R4 — Independent structural owner facts

Tenant, environment, Site, Page, locale, family, audience, Publication Reach,
safety, publication, route, binding, canonicalization, and eligibility SHALL
remain owned by their existing domains and rechecked at publication/runtime.
D79 SHALL NOT copy them into writable continuity shadow state.

### D79-R5 — Exact pre-cutover ceiling

Before D76 activates the relation, any target public release/generation drift
SHALL stale the prepared D78 proof and require the full fixed-pair review again,
regardless of a target continuity choice.

### D79-R6 — One publish-time semantic choice

Every candidate effective Page public release whose exact meaning-bearing
content-dependency digest changed for an affected target SHALL include one
initially unselected choice in the existing D1 Publish review: **This update
keeps what this Page is for** or **This update changes what this Page is for**.
The digest includes Page Editorial Revision plus exact localized, Reusable
Section, shared/global, referenced, and other meaning-bearing dependencies;
placement-only/delivery/presentation facts remain their owners' concerns.
Missing, `NULL`, stale, unavailable, or ambiguous input SHALL NOT mean preserve.

### D79-R7 — Draft and input safety

Draft save, autosave, preview, version compare, choice selection, abandoned
review, and validation failure SHALL have no public or continuity effect.
Selection SHALL not auto-submit, navigate, open another dialog, or move focus.

### D79-R8 — No prompt for unchanged effective release

A deterministic delivery-only D1 rebuild that changes neither the exact
meaning-bearing content-dependency digest nor continuity head MAY reuse the
pinned version without human input. Any meaning-bearing shared/global/localized/
Reusable Section dependency change SHALL obtain the Page-owner result through
its existing D1 consequence review or keep affected D78 routes adverse. If D1
cannot pin the complete effective dependency closure, the D78 target SHALL NOT
use mutable indirect content. This is exact dependency-version comparison, not
a semantic changed-field classifier or new owner-adapter framework.

### D79-R9 — Main-column Historical addresses context

An affected Page SHALL show one compact **Historical addresses** panel directly
after the current document-state strip in the main workspace column, not solely
in the desktop Inspector. It SHALL distinguish active, prepared, needs-review,
adverse, and unavailable states without calling them all active. Exact counts
and detail require their existing aggregate/detail read authority; otherwise
copy discloses neither the hidden count nor source facts. It SHALL link to owner-
native review without an alert tone in the normal active state.

### D79-R10 — Clear, accessible Publish review

The existing Publish review SHALL explain the same-subject/purpose/task test,
routine/material examples, permission-safe affected consequence, and final
action. It SHALL identify the current published effective Page release and exact
candidate effective release and provide production-faithful previews, the last
D78 criteria/basis receipt, and the authorized predecessor list on demand; no
purpose field or diff is required. Both RadioGroup options SHALL remain visible
and unselected. The result SHALL be persistent and not toast/color/icon/motion
only. For several predecessors, helper text SHALL say that **keeps** universally
asserts the D78 test for every currently favorable relation pinned to this
version.

### D79-R11 — Multiple predecessors and permission-safe detail

One Page-level continuity choice MAY carry all independently qualified D78
relations currently favorable and pinned to the same version. Prepared, stale,
adverse, unknown, and older-version relations SHALL be itemized separately and
never carried. The complete private relation set/digest SHALL be server-derived
and included in the receipt. Exact count/source detail SHALL be shown only with
existing authority. If any current relation fails the D78 test or the actor
cannot review required detail, **keeps** SHALL be unavailable for the whole
cohort under D79. D79 SHALL NOT bulk-create or renew D78 relations.

### D79-R12 — Material change never carries old authority

Selecting **changes what this Page is for** SHALL only declare candidate intent;
it SHALL NOT advance continuity or publish through the source Page. D80 SHALL
create a fresh independent private Page and leave the source head/relations
unchanged; the target inherits none. The candidate SHALL remain unpublished
until the new Page later passes ordinary D1.

### D79-R13 — Fixed-pair post-cutover requalification

An existing relation needing fresh proof SHALL reopen D78 only for its immutable
source address and current target Page. It SHALL reuse D78 criteria, preview,
both-Page authority, receipt, and per-address decision with current public
evidence or one exact D1-admitted publication-ready effective-release digest. A
candidate receipt remains prepared-only and activates only in the same ordinary
preserving D1 transaction. D80 neither consumes nor activates it. No target
search, URL input, general redirect lane, workflow, or bulk approval is added.

### D79-R14 — Monotonic lifecycle and copy isolation

Restore, revert, republish, path return, or text reuse SHALL NOT rewind the
continuity head or resurrect a relation after a material gap. Copy/clone creates
a fresh Page identity and transfers no continuity version or route authority.
Unpublish, Trash, delete, adverse safety, incompatible audience/Reach, locale
disablement, or route conflict SHALL override favorable continuity. When the
last relation becomes adverse/retired, the head becomes inert retained history;
it is never deleted, reused, or treated as favorable authority.

### D79-R15 — Scheduled publication

A scheduled affected publication SHALL pin the candidate effective-release
dependency digest, continuity choice/head, complete relation-set digest, actor
effect, and policy versions. Execution SHALL reauthorize/revalidate; stale or
unknown evidence requires review and creates no partial public effect. A current
**changes** choice cannot execute as source publication; it requires D80, and an
existing source appointment must be cancelled explicitly rather than copied.

### D79-R16 — Structural storage and indexing

Logical storage SHALL use immutable versions and one current or inert terminal
head per exact Tenant/environment/Site/Page/locale with activated D78 history,
non-null favorable-relation version references, same-scope composite integrity,
restrictive delete, monotonic predecessors, unique semantic command identity,
and equality-leading indexes for target fan-in/current-head lookups. Inert
history SHALL not authorize delivery. Cross-store refs SHALL be typed immutable
evidence and digests, not caller JSON or fake cross-store FKs.

### D79-R17 — Grants, RLS, and privileged parity

Browser/Data API roles SHALL have no direct continuity/relation/head/receipt/
route/audit/outbox DML. Least grants, ENABLE/FORCE RLS where applicable,
operation-specific `USING`/`WITH CHECK`, append-only history, safe views/RPCs/
definers, pinned empty `search_path`, and equivalent owner/service/Payload/
worker/import/schedule/support/repair checks are required.

### D79-R18 — Atomicity, concurrency, and idempotency

The preserving Page publication command SHALL derive actor/scope, use expected
heads and deterministic locking, and append the decision/receipt/audit/outbox
with the unchanged continuity version and complete route-effect closure.
Material change has no source Page publication/continuity-advance command; D80
creates a private independent target under ADR-0201. One winner, semantic replay,
changed-input conflict, lost-response receipt resolution, and forward-only
correction are required. No network call occurs under locks.

### D79-R19 — Compiled owner-aware public runtime

Phase 5 SHALL consume only the current D1 compiled direct Page, direct final
permanent redirect, or neutral not-found route effect. Public requests SHALL NOT
query continuity versions, D78 history, Page bodies, CMS versions, or providers.
Only clean `GET`/`HEAD` may use the existing redirect contract; protected owners
and source context remain excluded.

### D79-R20 — Tenant, privacy, and cache safety

Authoritative cache identity/lookups, route-effect generations, and receipts
SHALL include exact scope/version. Invalidation tags remain bounded owner-
derived handles and never isolation or authority. Restricted source detail and
sensitive ministry data SHALL not enter public responses, logs, analytics,
exports, or unauthorized UI. Unknown/current adverse truth fails safely.
External cached permanent responses are explicitly not recallable.

### D79-R21 — Bounded performance and operations

Affected Page publication SHALL use one sparse head lookup, one indexed set-
based affected-relation closure, compact digest, and server-paginated optional
detail rather than N+1 checks or per-address routine radios. Public request cost
SHALL not grow with relation count. Maximum production shapes and query plans
must pass the ratified release budget before activation.

### D79-R22 — Migration and rollout

D79 SHALL wait for the accepted Phase 23/D1/D76/D78/Phase 12 substrate. Rollout
is reader/adverse-first, additive, no-inference/no-backfill, old-writer-fenced,
shadow-compiled, one-cohort, monitored, and roll-forward. Rollback preserves the
safe prior public generation and immutable history; it never treats missing
state as preserve.

### D79-R23 — Durable business history and observability

Every affected publish SHALL durably record exact Page/continuity/relations/
actor/policy/generation inputs and public result. Technical traces correlate to
but do not replace the business receipt, security audit, owner timeline,
exception, repair, and named monitors.

### D79-R24 — Traceability and non-goals

The term, requirements, invariants, states, ACs, monitors, and rejected scope
SHALL reconcile ADR-0199/0200, D78/D79, glossary, Phase 5, Phase 12, proposed
Phase 23 ADR/OpenSpec/PRD/design, roadmap, implementation tasks/tickets, tests,
and release evidence. D79 creates no public-purpose CMS, taxonomy, classifier,
workflow, new capability, redirect engine, provider mutation, or money effect.

## Domain invariants

1. **I1:** one target Page/locale has at most one current or inert terminal
   continuity head for its activated lineage.
2. **I2:** an active D78 predecessor requires a head; a prepared predecessor may
   show read-only context but has no favorable head before atomic D76 activation.
3. **I3:** every favorable D78 relation pins one non-null current target
   continuity version after activation.
4. **I4:** one relation remains one source address to one target Page and is
   never symmetric or transitive.
5. **I5:** stable Page identity survives ordinary releases; identity change
   always requires D78.
6. **I6:** preserving publication universally asserts the D78 test for every
   currently favorable relation in the complete reviewed cohort, keeps the same
   continuity version, and records the exact effective-release choice in D1.
7. **I7:** D80 never publishes the source or advances its continuity head;
   selection/candidate state cannot. Its fresh target receives no relation or
   continuity inheritance.
8. **I8:** before cutover, exact target release drift always stales D78.
9. **I9:** draft/autosave/preview/selection cannot affect public truth.
10. **I10:** audience, Reach, safety, route, binding, family, locale, and
    eligibility remain independently owned current facts.
11. **I11:** every Page copy/clone has fresh identity and no continuity or
    predecessor inheritance.
12. **I12:** one authoritative preserving Page publication transaction produces
    one Page release, unchanged continuity-version result, complete route-effect
    closure, receipt, audit, and outbox or none; D80 is a separate private
    all-or-none target-creation transaction.
13. **I13:** same semantic replay has one durable business effect; changed input
    conflicts.
14. **I14:** unknown or contradictory truth never becomes preserve/favorable.
15. **I15:** public runtime uses one compiled current route effect and never a
    mutable Page/purpose/provider lookup.
16. **I16:** no D79 operation changes provider, DNS/TLS, Stripe/money, message,
    auth, form, API, protected-route, or donor-facing brand truth.

## Lifecycle and valid transitions

| Current state                  | Command/event                                            | Valid next state                                             | Public consequence                                            |
| ------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------- |
| No predecessor                 | ordinary draft/publish                                   | No predecessor                                               | Existing Page behavior; no D79 UI or state                    |
| D78 prepared, not cut over     | target release changes                                   | D78 stale                                                    | Prior public state remains; fixed-pair D78 required           |
| D78 active, continuity current | draft/autosave/preview                                   | Same                                                         | None                                                          |
| D78 active, continuity current | publish + **keeps** with current heads                   | Same continuity version, new Page/public release             | Eligible historical addresses continue                        |
| D78 active, continuity current | select/save candidate + **changes**                      | Same current head; material-change candidate remains private | No public effect; fresh Page required                         |
| D78 active, continuity current | successful D80 private handoff                           | Same source head/relations; fresh independent target draft   | None; target requires later ordinary D1                       |
| Relation adverse/needs renewal | fresh address-specific D78 qualifies                     | New favorable relation version bound to current continuity   | May continue after owner/public-generation activation         |
| Relation adverse/needs renewal | keep unavailable                                         | Durable not-found disposition                                | D9 platform-neutral, non-enumerating, no-brand/no-store `404` |
| Any favorable state            | target unpublish/Trash/safety/Reach/locale/route adverse | Temporarily or durably adverse owner state                   | No favorable fresh response                                   |
| Older content restored         | publish + current choice                                 | Current monotonic lineage only                               | Never revives old relation automatically                      |
| Scheduled candidate            | head/policy drift before execution                       | Needs review                                                 | Safe prior generation remains                                 |
| Any command                    | exact replay                                             | Same receipt/state                                           | No duplicate effect                                           |
| Any command                    | same key, changed input                                  | Conflict                                                     | No mutation                                                   |

Forbidden transitions include missing choice to preserve, changing scope in
place, deleting/reusing a version, automatic resurrection, copy inheritance,
transitive succession, partial material-change closure, provider fallback, or
unknown-to-favorable conversion.

## Acceptance criteria

1. **AC1:** a Page/locale that never had D78 predecessors has no D79 panel,
   choice, head lookup, or changed draft/publication outcome; a formerly active
   lineage retains inert immutable history without favorable authority.
2. **AC2:** D78 preparation creates no favorable continuity head; D76 activation
   of the exact reviewed relation atomically creates or pins exactly one sparse
   current version, and no inferred backfill exists.
3. **AC3:** every activated favorable relation references the exact target
   Tenant/environment/Site/Page/locale/version and cross-scope poison fails.
4. **AC4:** a prepared-only relation shows passive exact-release consequence and
   no D79 radio; any pre-cutover target release drift makes D78/D76 stale.
5. **AC5:** an affected Page shows the main-column **Historical addresses**
   panel immediately after the state strip on desktop and mobile, with truthful
   active/prepared/review/adverse/unavailable copy.
6. **AC6:** the panel/state are server-derived; exact count/detail appears only
   with existing aggregate/detail authority; unauthorized counts/source facts
   never render or flash; mutation controls match existing authority.
7. **AC7:** the Publish review gives the exact semantic criterion and routine/
   material examples, identifies current published and candidate releases, and
   provides the last D78 basis/receipt plus authorized predecessor detail on
   demand without claiming machine analysis or legal/content approval; for
   several predecessors it states that **keeps** asserts the criterion only for
   every currently favorable relation pinned to this version.
8. **AC8:** the RadioGroup is initially unselected and Publish cannot favorably
   commit with absent, `NULL`, stale, or unknown choice.
9. **AC9:** selection alone does not submit, save, navigate, open a modal, move
   focus, or change public/continuity state.
10. **AC10:** draft, autosave, preview, back, refresh, abandonment, and
    validation errors do not change public continuity; no autosave interval is
    frozen by D79.
11. **AC11:** publishing a phone, staff-name, design, image, heading, or
    accessibility update with **keeps** reuses the exact continuity version and
    records the exact effective meaning-bearing dependency digest in one receipt.
12. **AC12:** a changed Page, localized/shared/global/Reusable Section, or other
    meaning-bearing dependency cannot silently infer preserve from an unchanged
    Page row, UI fields, body similarity, hashes, AI, or old-client behavior.
13. **AC13:** one Page with several predecessor relations receives one routine
    universal choice for the complete currently favorable/current-version
    cohort, one private digest, an exact count only with authority, and no per-
    address routine radios; one failed/unreviewable relation disables **keeps**.
14. **AC14:** each predecessor remains a separate directional D78 relation and
    no routine Page-level choice creates or renews another relation.
15. **AC15:** authorized **Review historical addresses** detail is paginated,
    stable, status-separated, complete, and resumes position; hidden items still
    participate in the private authoritative publication closure without count
    disclosure.
16. **AC16:** selecting **changes** states the exact affected count only with
    aggregate authority, otherwise a permission-safe consequence, changes no
    head, and cannot publish the source; it reveals D80's fresh-Page
    continuation.
17. **AC17:** a successfully committed D80 handoff leaves every source relation
    and its current continuity version unchanged, creates one private target,
    and transfers no relation/version to that target.
18. **AC18:** restoring/reverting prior content does not rewind the head or
    revive relations; fresh D78 is required.
19. **AC19:** D80 same-Site handoff and D23 cross-Site copy each create fresh
    identity with no continuity version or route authority; their commands and
    source-private effects remain distinct.
20. **AC20:** unpublish, Trash/delete, adverse safety, incompatible audience/
    Reach, locale disablement, and route conflict prevent favorable delivery
    regardless of prior preserve decisions.
21. **AC21:** post-cutover fresh qualification opens only the exact existing
    source/target pair, uses current evidence and both-Page authority, and has no
    search, URL input, bulk approval, or new workflow.
22. **AC22:** logical storage enforces one current or inert terminal Page/locale
    head, immutable predecessor lineage, non-null favorable-relation version,
    no destructive terminal deletion/reuse, same-scope integrity, restrictive
    deletes, and unique semantic command identity.
23. **AC23:** equality-leading indexes support current target/locale head,
    active relation fan-in, command receipt, and route-effect lookups; production
    query plans pass the release budget.
24. **AC24:** no Page purpose/task/subject field, taxonomy, category, note,
    content copy, hash, diff, score, embedding, or AI output is stored as D79
    authority.
25. **AC25:** public runtime performs no continuity/D78/body/CMS-version/provider
    lookup and its request cost is independent of predecessor count.
26. **AC26:** one expected-head preserving D1 command commits effective release,
    unchanged continuity version, complete route closure, receipt/audit/outbox
    or none; D80 separately creates only a private target and never advances the
    source head; no network runs under either lock.
27. **AC27:** concurrent preserve publish, D80 handoff, D78 renewal, D76
    activation, route/save/lease changes, and capability revocation have one
    winner and specific **Page changed - Review again** recovery.
28. **AC28:** exact semantic replay returns the same receipt; changed input under
    the same key conflicts; lost acknowledgement resumes the receipt.
29. **AC29:** scheduled publication pins effective content-dependency digest,
    choice/heads/relation digest/policy and reauthorizes/revalidates at execution;
    drift leaves the prior generation.
30. **AC30:** `anon`/`authenticated`/browser roles have no direct DML; grants,
    ENABLE/FORCE RLS, per-operation policies, `USING`/`WITH CHECK`, views/RPCs/
    definers/owners/service/Payload/workers/import/schedule/support/repair all
    pass allow/deny and scope-poison tests.
31. **AC31:** clean `GET`/`HEAD` only receives one owner-qualified tenant-native
    direct/final result; protected owners, unsafe methods, source query/fragment/
    body/cookie/auth/attribution/return state never transfer.
32. **AC32:** Page publication produces no Vercel, DNS/TLS, Domain, middleware,
    redirect/rewrite, deployment, Stripe, gift, ledger, message, or notification
    mutation.
33. **AC33:** cache/outbox/search/analytics lag cannot authorize a stale result;
    safe prior/not-found behavior persists and replay is cause-owned.
34. **AC34:** exact Tenant/environment/Site/Page/locale/version appears in
    authoritative cache identity/lookups, route generations, and receipts;
    bounded tags remain non-authoritative; cross-scope reads, counts, writes,
    and responses fail.
35. **AC35:** at 320 CSS pixels and 400% zoom the panel, criterion, examples,
    options, consequence, and action have one logical reading order with no
    two-dimensional scrolling for text.
36. **AC36:** keyboard, screen reader, visible focus, forced colors, reduced
    motion, 44px targets, long localization, RTL, bidi-isolated URLs, and error
    focus pass automated and manual release tests.
37. **AC37:** weak-network rendering shows Page state and historical-address
    consequence before previews/detail; routine draft editing never waits on
    predecessor media.
38. **AC38:** only one meaningful polite save/publish status is announced;
    autosave and choice changes do not create chatty live-region output.
39. **AC39:** durable business history explains who chose what, against which
    Page/continuity/relation/policy heads, what public generation resulted, and
    every correction without depending on technical logs.
40. **AC40:** current and proposed ADR/PRD/OpenSpec/design/task/ticket/test terms
    contain no conflicting purpose field, family, classifier, perpetual stable-
    ID rule, or exact-revision-only post-activation rule.
41. **AC41:** additive migration has no guessed legacy backfill; old writers are
    fenced; missing state cannot preserve; mixed-version reader/writer matrices
    pass before cohort enablement.
42. **AC42:** reader/adverse behavior lands before writer/UI; shadow compilation
    matches expected route effects; one Tenant cohort passes the complete gate
    before expansion.
43. **AC43:** representative ministry publishers correctly classify routine and
    material examples, understand donor/visitor consequences, and complete the
    affected publish flow under the ratified usability threshold without
    mechanical preselection.
44. **AC44:** rollback/kill switch stops new affected publications, preserves the
    last safe public generation and immutable evidence, and cannot recall or
    promise recall of externally cached permanent responses.

## Required proof suite

- **Positive/domain:** initial D78 version, post-cutover phone/accessibility/
  design/contact release preserve, canonical-path move to one final result,
  several predecessors to one Page, a meaning-bearing Reusable Section change,
  a delivery-only unchanged-digest rebuild, and fresh address-specific renewal.
- **Negative/boundary:** absent choice, source Page material publication instead
  of D80's fresh private Page,
  cross-locale/Site/Tenant/environment, Article/protected owner, external URL,
  copied Page, restored old revision, stale/unknown owner fact, unsafe method,
  source-context carry.
- **Authorization/RLS:** Page publisher preserve/adverse choice, unauthorized
  source detail, both-Page fresh D78, actor/Tenant poisoning, grants, policy old/
  new row checks, view/RPC/definer/table-owner/service/Payload/worker/import/
  schedule/support/repair parity.
- **Concurrency/idempotency:** preserve versus change, two publishes, publish
  versus D78 renewal/D76/route/safety/reach/capability change, duplicate click,
  changed-key replay, lost response, outbox/cache replay.
- **Migration/upgrade:** no inferred backfill, old/new schema and writer/reader
  matrix, old-writer fence, shadow compile, rollback with new records, CMS
  version-history pruning without runtime breakage.
- **Accessibility/usability:** real PageShell/Base Maia components at 320px/400%,
  keyboard, common screen readers, focus/error/status, forced colors, reduced
  motion, long translations, RTL/bidi URLs, weak/offline/reconnect, back/refresh/
  resume/session renewal. Representative ministry staff explain the decision in
  their own words; component snapshots alone are insufficient.
- **Production shape/performance:** ratified maximum predecessor fan-in, Page/
  locale counts, concurrent publishes, cold/warm/multi-region reads, indexed
  query plans, receipt/digest size, outbox/cache backlog, and invariant public
  request cost.

## Named monitors and required responses

| Signal                                                       | Threshold                                                                                                                                                      | Owner                            | Required response                                                                                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `page_purpose_continuity_missing_decision_positive_total`    | Any favorable affected publication without one exact D79 decision                                                                                              | Page Publication + Security      | P0; fence affected Pages/routes to prior safe/not-found generation, stop writers, preserve evidence, repair only through owner command, and prove old-client fence |
| `page_purpose_continuity_incomplete_cohort_preserve_total`   | Any preserve result without the universal D78 assertion over every current-version favorable relation or while required detail was unavailable                 | Page Publication + Security      | P0; fence the complete cohort, stop preserve writers, reconcile relation-set digest/authorization, and require fresh owner review                                  |
| `page_purpose_continuity_changed_version_positive_total`     | Any predecessor pinned to an older version serves a newer-purpose release                                                                                      | Public Runtime + Page owner      | P0; fence exact route cohort, stop affected publication/cutover, reconcile heads/receipts/caches, and require fresh D78                                            |
| `page_purpose_continuity_cross_scope_total`                  | Any Tenant/environment/Site/Page/locale mismatch admitted or disclosed                                                                                         | Security/Authorization           | P0; quarantine scopes, revoke projections, stop writers, inspect grants/RLS/privileged history, and notify privacy owner                                           |
| `page_purpose_continuity_stale_head_total`                   | Any commit or favorable result with stale Page/meaning-bearing dependency/continuity/relation/policy head                                                      | Page/Public Runtime              | P0; retain safe prior generation, disable cohort, reconcile expected-head/reader skew, and re-prove concurrency                                                    |
| `page_purpose_continuity_old_writer_bypass_total`            | Any affected Page public release written without the D79 path                                                                                                  | Release Engineering + Page owner | P0; stop rollout, fence legacy writer, restore safe generation, inspect mixed-version window, and rerun compatibility matrix                                       |
| `page_purpose_continuity_provider_mutation_total`            | Any D79-triggered Vercel/DNS/TLS/redirect/rewrite/deployment or Stripe/money write                                                                             | Hosting Platform + Security      | P0; stop D79, remove via governed owner reconciliation, inspect cross-Tenant blast radius, and prove provider-no-op                                                |
| `page_purpose_continuity_runtime_lookup_total`               | Any public request reads purpose/D78/body/CMS-version rows                                                                                                     | Public Runtime                   | Block release or P1 in production; route to compiled effect, examine latency/cache leakage, and rerun constant-cost proof                                          |
| `page_purpose_continuity_restricted_detail_disclosure_total` | Any source path/title/Site/preview shown without current authority                                                                                             | Privacy + Security               | P0; remove cached projection, contain logs/exports, revoke affected sessions, inspect permission epoch and notify privacy owner                                    |
| `page_purpose_continuity_effect_backlog_age_seconds`         | p99 above 5 minutes or any item above 15 minutes                                                                                                               | Page/Public Operations           | Pause new affected publishes, retain safe prior/not-found generation, reconcile idempotently, and escalate owning outbox/cache cause                               |
| `page_purpose_continuity_preserve_correction_rate`           | Above 5% within 30 days with at least 20 affected publishes                                                                                                    | Phase 24 Product + Page owner    | Pause cohort expansion, interview publishers, inspect wording/examples and relation quality, improve UX/training; do not add AI auto-approval                      |
| `page_purpose_continuity_publish_abandonment_delta`          | Affected Page p95 abandonment exceeds unaffected comparable Page publication by 20 percentage points for 3 consecutive 7-day windows with at least 50 attempts | Web Studio Product               | Pause expansion, conduct task-based research, simplify placement/copy/recovery without weakening the unselected choice, and re-run usability gate                  |
| `page_purpose_continuity_publish_latency_ratio`              | Affected p95 server acknowledgement exceeds 2x unaffected comparable Page publication for 3 consecutive 15-minute windows                                      | Web Studio + Database            | Pause cohort expansion, inspect query plan/fan-in/lock/outbox work, restore set-based bounded transaction, and re-prove maximum shape                              |
| `page_purpose_continuity_a11y_release_failure_total`         | Any unresolved critical automated/manual blocker in affected Page journeys                                                                                     | Accessibility owner              | Block cohort/release; fix and manually reverify keyboard, screen reader, reflow, focus, status, RTL, and weak-network behavior                                     |

## Ruthless synthesis — strongest path forward

### Resolved before recording D79

1. Keep the founder's stable-identity/versioned-contract direction, but define
   the contract as an opaque continuity version rather than purpose content.
2. Explicitly resolve the external-practice conflict: common CMS redirects are
   adequate for same-Page identity, while D78's different-Page inherited meaning
   justifies one stronger owner choice.
3. Preserve exact D78 revision proof before cutover; use continuity versions only
   after activation.
4. Put one initially unselected choice in the existing D1 Publish review only
   when an affected effective Page's exact meaning-bearing dependency digest
   changes; keep drafts, ordinary Pages, and delivery-only rebuilds with that
   digest unchanged on the existing path.
5. Keep every structural fact in its owning domain, compile one runtime effect,
   and prohibit purpose schemas/classifiers/provider rules.
6. Make material change monotonic and non-resurrecting; block that path until D80
   specifies the one atomic Page/old-address outcome.

### Required in the consolidated spec/design before implementation

1. Reconcile proposed Phase 23 ADR-0145/0150/0152/0156/0157/0167/0168/0174/0175,
   US23-001/003, and D1/D3 OpenSpec with D79-R1–R24 and AC1–AC44.
2. Amend ADR-0199/D78 from exact-release post-activation validity to the D79
   version rule, while adding the fixed-pair post-cutover re-entry path.
3. Define the sparse logical storage, exact owner port, D1 receipt fields,
   constraints/indexes/RLS/privileged parity, scheduled pin, and compiled route
   effect without freezing incidental table/capability/component names.
4. Specify the main-column panel, Publish order/copy/states, permission-safe
   detail, mobile/a11y/weak-network behavior, and donor no-interstitial result.
5. Carry terms/invariants/monitors/proof through glossary, Phase 5, Phase 12,
   roadmap, Phase 24 PRD/OpenSpec/design/tasks/tickets/tests/release evidence.

### Implementation safeguards required before activation

1. Land the accepted stable Page/locale/D1/route-owner substrate and adverse-
   first reader; inventory/fence current mutable latest reads and host-blind
   redirects.
2. Add the sparse continuity reader/head and old-writer fence; shadow-evaluate
   all affected Page publications with zero public effect.
3. Add one server-owned publication command and UI; prove exact scope, RLS/
   privileged parity, concurrency/idempotency, set-based fan-in, no provider/
   money call, and constant public-read cost.
4. Pass representative ministry usability, accessibility, mobile/RTL/weak-
   network, production-shape, migration, mixed-version, failure, correction, and
   rollback evidence.
5. Enable one Tenant cohort and expand only while every zero-tolerance signal is
   zero and the quantitative friction/latency thresholds remain inside bounds.

### Monitor rather than build now

Only the named correction, abandonment, latency, backlog, and accessibility
signals may justify a later UX/performance adjustment. Their thresholds, owners,
and responses are above. They do not authorize an AI classifier, content diff,
purpose taxonomy, new workflow, bulk qualification, or provider redirect system.

## Traceability and repository status

- Decision: D79 in the Phase 24 decision log.
- Domain term: `CONTEXT.md` **Page Purpose Continuity Version**.
- Architecture: ADR-0200, with ADR-0199 precision amendment.
- Evidence: this adversarial review.
- Related authority: D9, D72–D78, ADR-0193/0197/0198/0199, Phase 5, Phase 12,
  proposed Phase 23 ADR-0145/0150/0152/0156/0157/0167/0168/0174/0175, and proposed
  Phase 22 route authority.
- Future artifacts: accepted consolidated Phase 24 PRD/OpenSpec/design/tasks/
  tickets/code/migrations/tests/release proof. None is created or authorized as
  runtime by this grooming decision.

Fresh verification found `HEAD == origin/develop ==
7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 22 PR #1323 remained
`OPEN/BLOCKED` at `70c50e8c97556c43be5543332fb0993b468b90ab`; Phase 23
PR #1340 remained `OPEN/BLOCKED` at
`9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`. Current runtime cannot implement
D79, and this decision changed no code, schema, migration, Supabase policy,
OpenSpec, ticket, provider, deployment, or production state.

## D80 resolution amendment

D80 resolved the dependency through
[ADR-0201](../../adr/0201-material-purpose-changes-create-independent-pages.md):
the candidate either preserves the source continuity version through ordinary
D1 or, after **changes**, continues as a fresh independent private Page. D80
publishes nothing, never advances the source continuity head, and transfers no
D78/D79 state. D81 now decides only the active private source Working Revision
after the exact candidate is safe in the new Page.

## References

- [ADR-0200](../../adr/0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0201](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [D80 adversarial review](./phase-24-d80-material-purpose-new-page-adversarial-review.md)
- [ADR-0199](../../adr/0199-owner-qualified-exact-ordinary-page-succession.md)
- [D78 adversarial review](./phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [Phase 24 decision log](./phase-24-multi-site-management-decision-log.md)
- [Web Studio living spec](../../guides/architecture/web-studio-living-spec.md)
- [Google Site Moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [W3C Web Architecture](https://www.w3.org/TR/webarch/#URI-persistence)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload Redirects](https://payloadcms.com/docs/plugins/redirects)
- [Contentful Versions](https://www.contentful.com/help/content-and-entries/versions/)
- [Contentful Versioning FAQ](https://www.contentful.com/help/faq/versioning/)
- [Sanity IDs](https://www.sanity.io/docs/content-lake/ids)
- [HubSpot Redirects](https://knowledge.hubspot.com/domains-and-urls/create-and-manage-url-redirects)
- [WordPress.com Page and post links](https://wordpress.com/support/permalinks-and-slugs/)
- [Webflow Redirects](https://help.webflow.com/hc/en-us/articles/33961294898835-How-do-I-set-up-redirects-in-Webflow)
- [Shopify URL redirects](https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect)
- [Neon One URL Redirects](https://support.neonone.com/hc/en-us/articles/9811436298637-URL-Redirects)
- [GOV.UK content design](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/understand-content-design/)
- [GOV.UK identify user needs](https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/plan-manage-content/identify-user-needs/)
- [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG 2.2 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
