# Phase 24 D68 — Suggested translation sources adversarial review

**Date:** 2026-08-30  
**Founder answer:** Option 1 — turn runtime fallback into staff-only suggested
translation sources.  
**Final disposition:** **Accept with required amendments.**  
**Decision authority:** [ADR-0189](../../adr/0189-site-suggested-translation-sources-are-authoring-only.md)

## Decision under review

The original Option 1 proposed one Site-level order used for staff **Copy from…**
and comparison while public alternatives stayed explicitly resource-owned. The
direction is right, but “order enabled locales” remained dangerously broad. It
did not say whether the list was mandatory or partial, whether the first item
was selected automatically, how source eligibility and permissions worked,
whether existing Translation Bases changed, what happened to omitted languages,
or whether the value could leak into Payload fallback or public runtime.

The corrected decision is an optional ordered subset named **Suggested
translation sources**. It ranks eligible staff choices only. Empty/unavailable
configuration degrades exactly to the no-build alternative: an ordinary
permission-filtered chooser with no source selected.

## Current behavior, intended behavior, and permanent path

| Layer                 | Verified current `develop` behavior                                                                              | Intended D68 behavior                                                                                           | Best permanent path                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Site/locale substrate | No implemented Site or Site Locale runtime; Phase 2/D66 describe future normalized identity.                     | One optional Site-owned order references stable same-Site Site Locale identities.                               | Consume accepted D66 Site Locale identity; never create a D68 locale catalog.                                                               |
| Payload localization  | `apps/admin/payload.config.ts` configures no localization; Page fields are scalar and Navigation is versionless. | Payload may supply qualified exact-locale editor mechanics later.                                               | Keep `fallbackLocale:false`, authenticated context, and `overrideAccess:false`; do not store D68 in Payload fallback or user preferences.   |
| Translation start     | No current Copy-from/Compare translation UI or Translation Basis exists.                                         | D68 ranks the explicit source chooser described by proposed Phase 23 D22.                                       | Its accepted future editor command composed with D67 owns exact selection, copy manifest, target draft, and basis; D68 supplies order only. |
| Public runtime        | Current public context has no locale source preference; D15/D66 prohibit cross-language fallback.                | D68 produces zero public behavior.                                                                              | Public reader/generation/cache never accepts the preference as input.                                                                       |
| Authorization         | No D68 capability or command exists.                                                                             | `sites.manage_locales` manages the preference; source read and target work require their separate capabilities. | One server command plus point-of-use reauthorization; no new capability.                                                                    |
| Database              | No preference relation exists; current deployment isolates environment per Supabase project/database.            | One current revisioned Site authoring preference with structurally scoped ordered members and audit.            | Specify invariants now; choose an accepted relational Site-policy representation in design, not a JSON/EAV shortcut.                        |
| Formal status         | D68 is grooming. Phase 23 PR #1340 is open and blocked, and merged OpenSpec has no D66–D68 contract.             | One consolidated Phase 24 OpenSpec delta becomes implementation authority.                                      | Do not ticket or implement from the decision log/ADR alone.                                                                                 |

## Evidence classification

### Verified repository facts

- `apps/admin/payload.config.ts:52-128` has no `localization` configuration.
- `apps/admin/src/cms/collections/pages.ts` stores scalar fields and uses drafts/
  autosave; `navigation.ts` has `versions: false`.
- `packages/api/src/cms/public/context.ts` has no locale-source preference, and
  `apps/admin/src/cms/public/resolve-tenant.ts` still resolves `siteId: null`.
- ADR-0187 forbids exact-locale field/resource fallback and keeps public
  alternatives resource/placement-owned.
- ADR-0188 requires explicit immutable Translation Basis and forbids inference
  from English, Default Site Locale, timestamps, authoring order, or provider
  fallback.
- Phase 12 already assigns private locale management to `sites.manage_locales`
  and publication to the separate `sites.publish_locales` capability.
- Phase 17 owns its whole-message fallback; it does not own public Site/CMS
  localization.
- Live GitHub evidence on 2026-08-30 shows Phase 23 PR #1340 remains **OPEN** and
  **BLOCKED**. Its proposed D22 requires explicit blank/copy starts and an exact
  pinned source revision; it is not merged current truth.

### Verified primary external evidence

| Source                                                                                                                                                                                                       | Verified practice                                                                                                                                           | D68 use                                                                             | Boundary retained                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [Drupal Content Translation](https://www.drupal.org/docs/8/core/modules/content-translation/overview)                                                                                                        | A user explicitly chooses the source language when several translations exist, and the chosen source is later visible.                                      | Supports an explicit, unselected source chooser and durable actual-source evidence. | Core does not import Drupal's mutable entity status or make a Site preference the source.      |
| [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)                                                                                             | Locale governance, asynchronous publishing, editing experience, and runtime fallback are distinct concerns; regional locales can diverge structurally.      | Supports separate authoring convenience and exact locale governance.                | Contentful fallback is public substitution and is expressly rejected for Core Sites.           |
| [Payload localization](https://payloadcms.com/docs/configuration/localization) and [Local API](https://payloadcms.com/docs/local-api/overview)                                                               | Payload fallback can substitute localized fields; available locales can be server-filtered; Local API access can be elevated unless explicitly constrained. | Use exact locale/adaptor filtering only after qualification.                        | `fallbackLocale:false`, `overrideAccess:false`, and Core authorization remain mandatory.       |
| [Sanity localization](https://www.sanity.io/docs/studio/localization)                                                                                                                                        | Separate localized documents and explicit duplication/translation actions are normal; copying whole documents can be schema-insensitive.                    | Supports a deliberate source action and Core's finite localization manifest.        | Core never copies unclassified fields or treats provider duplicate as product authority.       |
| [Blackbaud multilingual event pages](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/luminate-online/EMC_CCC/Content/Tasks/EMC_TranslateWebPages.html)                                            | A nonprofit website editor explicitly selects locale-specific tabs/dropdowns; available languages depend on Site configuration.                             | Confirms staff need clear exact-locale selection in comparable nonprofit tooling.   | It does not prove a Site-wide source order, so repeated-choice value remains an assumption.    |
| [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements) and [WAI rearrangeable list](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/) | Dragging requires a single-pointer alternative; rearrangement requires deliberate keyboard/focus/status behavior.                                           | Always provide native Move up/Move down controls; drag is optional enhancement.     | Core uses its existing semantic/Base UI patterns rather than blindly copying an APG prototype. |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                             | Grants and policies are separate; update needs old/new-row protection; structural relationships and indexes matter.                                         | Minimum grants, operation-specific RLS, scoped relationships, and poison tests.     | RLS remains defense in depth; Phase 12/server command owns capability authorization.           |

### Reasonable inferences

- A Site with several languages may repeat the same source choice often enough
  for a short ordered subset to reduce friction.
- Most ministries will have a small Site Locale catalog, so a compact list and
  on-demand chooser are proportionate; no quantitative maximum is asserted.
- Staff may legitimately prefer different sources for different resources, so
  the Site order must remain a suggestion rather than a target-specific policy.

### Product judgments

- “Fallback chain” is the wrong term because modern CMS products use fallback
  for runtime substitution, exactly what Core prohibits.
- Optional partial ordering is stronger than a mandatory total order: it gives
  frequent-choice convenience while keeping all other eligible sources visible.
- Explicit source choice is worth one deliberate click because it creates
  provenance and may copy substantial authored content.
- A low-risk mutable preference needs optimistic concurrency and durable audit,
  not an append-only publication product or generic workflow.

### Assumptions and release evidence still required

- No representative Core tenant editor has yet demonstrated that repeated source
  selection is frequent or that a Site-wide order improves completion. Release
  research must test this; empty/no-preference behavior ensures the assumption
  never forces setup or changes correctness.
- The accepted Phase 23 editor/source-revision contract and physical D66 Site
  Locale schema do not yet exist on `develop`. D68 cannot freeze provider or table
  details ahead of those accepted designs.
- Current maximum Site Locale catalogs and production latency are unmeasured.
  Performance budgets below are product release budgets, not vendor claims, and
  must be qualified against the actual release stack.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** Core could build a settings
surface nobody uses, when an ordinary chooser or recent-choice behavior would be
enough. **Why it matters:** speculative configuration creates setup burden and a
permanent concept staff must understand. **Severity: Medium. Likelihood:
Medium.** Drupal and Blackbaud prove explicit locale/source selection, but not a
Site-wide order; the strongest alternative is Option 3, no stored preference.
**Decision effect:** narrows rather than invalidates Option 1. **Permanent fix:**
make the order optional and partial, with empty identical to Option 3; require
task-based evidence before activation. **Exact spec language:** D68-R1–R2,
D68-R16, AC1, AC24–AC25.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** treating the first item as a
default or inferring it from English/default locale will fail for regional,
script, independently authored, or changing content. **Why it matters:** the
wrong prose can be copied and later mistaken for intentional provenance.
**Severity: High. Likelihood: High** without explicit boundaries; ADR-0188
already forbids such inference. **Decision effect:** changes Option 1 into a
ranking-only ordered subset with no preselection. **Permanent fix:** explicit
candidate selection and exact revision pin; no inferred initialization. **Exact
spec language:** D68-R1–R5, AC2–AC9.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** an unchecked locale-string/
UUID array, generic settings JSON, per-target matrix, or Payload fallback field
will evade scoped FKs and couple future editor behavior to provider storage.
**Why it matters:** cleanup becomes migrations, repair scripts, and dual truth.
**Severity: High. Likelihood: Medium-high.** Phase 2/D66 already reject arrays as
stable Site Locale authority. **Decision effect:** preserves the logical ordered
value but defers the exact accepted relational representation to design.
**Permanent fix:** one revisioned Site preference with structurally scoped unique
members and no generic configuration engine. **Exact spec language:** D68-R9–R10,
R16, AC10–AC12, AC22.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** empty/one/many sources, the
target locale in the list, source absence, an existing target draft, independent
content, locale retirement, renamed locale labels, source revision races, or
hidden candidates can produce misleading or destructive behavior. **Why it
matters:** staff may duplicate work, overwrite a target, or infer an unavailable
source. **Severity: High. Likelihood: High** in multilingual authoring.
**Decision effect:** adds ordered first-match behavior and explicit empty/
existing-target states. **Permanent fix:** use stable identities, compute
eligibility at use, exclude target, never overwrite, and preserve blank draft.
**Exact spec language:** D68-R2–R5, R7–R8, R12, AC1–AC9, AC18.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** preselecting the first source,
copying immediately on row click, allowing Copy over an existing draft, drag-only
reorder, or calling the order “primary/default” makes accidental effects easy.
**Why it matters:** copied content and false provenance are costly to notice.
**Severity: High. Likelihood: High** with a convenience-first UI. **Decision
effect:** requires explicit unselected choice, action-specific final button, and
Compare-only for existing targets. **Permanent fix:** no automatic selection or
copy; semantic list with native move controls. **Exact spec language:** D68-R4–R8,
R15, AC3–AC8, AC19–AC21.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** a cross-Tenant/Site locale ID,
cache collision, or broad candidate query could reveal or copy another
ministry's content. **Why it matters:** this is direct tenant data exposure.
**Severity: Critical. Likelihood: Medium** unless scope is structural and checked
again at effect time. **Decision effect:** adds complete scope relations and
non-enumerating display/submit checks. **Permanent fix:** same-Tenant/Site stable
IDs, viewer-filtered candidate query, and command reauthorization. **Exact spec
language:** D68-R3, R9–R12, AC10–AC15.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** nullable scope, duplicate
positions, orphaned locales, cascade delete, broad grants, missing `WITH CHECK`,
or service/Payload bypass can move or write preference rows outside authority.
**Why it matters:** an allowed write could transform a valid Site order into a
forbidden one, and relational errors may enumerate hidden IDs. **Severity:
Critical. Likelihood: Medium.** Supabase documents that grants and RLS are
separate and that update needs both old/new-row protection. **Decision effect:**
adds structural and privileged-path safeguards without making RLS the capability
PDP. **Permanent fix:** non-null scoped IDs/revision/position, composite FKs,
uniqueness, restrictive deletion, indexed predicates, minimum grants, ENABLE/
FORCE RLS, operation-specific `USING`/`WITH CHECK`, security-invoker views,
hardened functions, command-only writes, trusted actor/time, and poison tests.
No money, asset, object-storage, or generated-document field/policy is
introduced; amount precision and storage-policy concerns are therefore
inapplicable rather than silently delegated.
**Exact spec language:** D68-R9–R11, AC10–AC16.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** a target-by-source matrix,
language-equivalence graph, cycle engine, rules DSL, per-user order, AI chooser,
translation memory, or workflow turns a small ranking preference into a
localization platform. **Why it matters:** complexity obscures the one safe
benefit and duplicates Phase 23/34/provider owners. **Severity: High.
Likelihood: High** given the former “chain” wording. **Decision effect:**
substantially narrows Option 1. **Permanent fix:** one optional flat same-Site
subset; no graph or executable policy. **Exact spec language:** D68-R1–R2,
R6, R16, AC1, AC17, AC22.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** a settings matrix, flags,
base-language labels, hidden public implications, eager diffs, inaccessible
dragging, or copy in a wizard creates confusion and mobile friction. **Why it
matters:** occasional ministry editors must understand source, target, draft, and
public effect without training. **Severity: High. Likelihood: High.** W3C
requires a non-drag alternative, and regional locale identity matters in
Contentful/Blackbaud examples. **Decision effect:** keeps one compact Authoring
preferences section and one unselected chooser. **Permanent fix:** exact copy,
full autonym/staff label/code, semantic ordered list, native move buttons,
explicit Save/Cancel, no eager comparison, and truthful success/conflict states.
**Exact spec language:** D68-R7–R8, R15, AC1–AC9, AC19–AC21, AC24.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** Suggested sources,
Translation Basis, Payload fallback, public alternatives, and message fallback
could all claim “source order.” **Why it matters:** changing a Site preference
could silently rewrite editorial/public meaning. **Severity: Critical.
Likelihood: High** if terminology remains vague. **Decision effect:** creates a
strict ownership map and canonical term. **Permanent fix:** Postgres owns ranking;
source owner owns eligible revision; D67 owns actual Basis; resource owner owns
public alternative; generation owns serving; Phase 17 owns messages. **Exact
spec language:** D68-R1, R5–R6, R9, R16, AC6–AC10, AC17.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** reusing Payload
`fallbackLocale`, Default Site Locale, Phase 17 fallback, `allowed_locales[]`,
per-user Payload preferences, or Phase 23 copy internals makes unrelated changes
alter D68. **Why it matters:** provider upgrades or locale defaults become
authoring-policy changes. **Severity: High. Likelihood: Medium-high.** Current
Payload explicitly uses “fallback” for field substitution. **Decision effect:**
requires provider-neutral ports and negative dependencies. **Permanent fix:**
stable Site Locale IDs, D68-owned ranking read, and the future accepted Phase
23/D67-owned effects.
**Exact spec language:** D68-R1, R5–R6, R9, R13, R16, AC9, AC17, AC22.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** preference read/write fails,
response is lost, source disappears after display, or only part of a reorder
commits. **Why it matters:** staff may retry into duplicates, lose input, or copy
stale content. **Severity: High. Likelihood: Medium.** Multi-row order saves and
editor races are ordinary distributed-system failures. **Decision effect:** adds
safe degradation, atomic save, idempotency, and effect-time revalidation.
**Permanent fix:** preference failure falls back to ordinary chooser; save is
all-or-nothing; source race produces no target; same meaning returns the same
result. **Exact spec language:** D68-R11–R13, AC12–AC18.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two reorders, locale
retirement during save, permission loss after picker load, source/target edits,
late responses, re-enable, or Site clone can jointly violate order or provenance.
**Why it matters:** a individually valid choice may be stale at commit.
**Severity: High. Likelihood: High** in collaborative Web Studio. **Decision
effect:** makes the order prospective and separately revisioned from source/
target heads. **Permanent fix:** preference CAS; canonical meaning idempotency;
stable lock order; lifecycle removal in its owning transaction; Copy/review CAS;
no raw-ID clone. **Exact spec language:** D68-R5, R10–R14, AC11–AC18, AC22.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** duplicate locales/positions,
gapped or nondeterministic order, copied labels, stale foreign IDs, partial save,
or mutable audit attribution corrupts the preference and reports. **Why it
matters:** different readers can rank differently or expose invalid choices.
**Severity: High. Likelihood: Medium.** PostgreSQL does not infer ordered-set
invariants from an array or automatically index FKs. **Decision effect:** adds
canonical normalization and structural constraints. **Permanent fix:** stable
IDs, unique membership/position, dense deterministic command output, indexed
FKs, restrictive deletion, positive revision, atomic audit. **Exact spec
language:** D68-R10–R12, AC10–AC14, AC22–AC23.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** picker labels, counts,
disabled rows, errors, caches, audit bodies, or metrics can reveal a restricted
locale/resource or staff draft. **Why it matters:** ministry content and worker/
location details can be sensitive even before publication. **Severity: Critical.
Likelihood: Medium.** Payload filtering and Core platform boundaries require
role-safe visibility. **Decision effect:** removes placeholders for hidden
candidates and minimizes telemetry. **Permanent fix:** non-enumerating filtering
at display and submit, scope-safe audit references, low-cardinality metrics, and
no source body/diff until authorized selection. Store/export only stable locale
IDs, order, revision, and authorized audit attribution—never source text, hidden
titles, or generated documents; ordinary tenant backup/audit retention applies.
**Exact spec language:** D68-R3,
R8–R10, R13, AC4–AC5, AC13–AC16, AC21.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** Site × target × source ×
resource projections, N+1 revision checks, eager body/diff downloads, or
public-cache participation will degrade with Sites and locales. **Why it
matters:** the editor becomes slow and database load grows quadratically.
**Severity: High. Likelihood: Medium.** Current catalogs are unmeasured, so no
vendor capacity claim is safe. **Decision effect:** requires an on-demand bounded
query, not precomputation. **Permanent fix:** one preference read, one batched
eligibility query, stable pagination/search only when needed, fetch exact source/
diff after selection, and no public cache. **Exact spec language:** D68-R13,
R16, AC20–AC23.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** mandatory ordering, stale
inert entries, manual cleanup, or direct DB repair can turn every locale addition
into administrator work. **Why it matters:** small ministry teams need defaults
that work without configuration. **Severity: Medium. Likelihood: Medium-high.**
The no-preference chooser already works conceptually. **Decision effect:** empty
is valid, new locales are not auto-added, and a future Site Locale owner-defined
terminal authoring-ineligible transition cleans the current preference through
its own command. **Permanent fix:** optional setup, clear empty state, ordinary
chooser fallback, owner-integrated cleanup, and reconciliation diagnostics—not
manual SQL. **Exact spec language:**
D68-R2, R7, R12–R14, AC1–AC3, AC18, AC22.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** technical logs cannot show
who changed the Site order or prove that a preference did not create a copy/
Basis/public effect. **Why it matters:** staff need correction evidence, and
security needs to diagnose boundary violations. **Severity: Medium-high.
Likelihood: Medium.** Current CMS audit is technical logging, not D68 business
history. **Decision effect:** adds one durable before/after audit and invariant
monitors without retaining source content. **Permanent fix:** actor-attributed
audit, request correlation, canonical order digest/revision, and named monitors.
**Exact spec language:** D68-R10–R13 plus Required monitors and AC11–AC17, AC23.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Payload fallback/defaults,
provider upgrades, Phase 23 schema changes, Realtime lag, or Phase 17 rules may
silently reinterpret the setting. **Why it matters:** a replaceable provider can
become product authority. **Severity: High. Likelihood: Medium.** Payload's Local
API defaults and localization semantics differ from Core's intended model.
**Decision effect:** D68 depends only on accepted provider-neutral Site Locale,
editor, Basis, and IAM ports. **Permanent fix:** exact adapter qualification,
fallback disabled, current actor context, no Vercel/domain/message dependency,
and no provider-native preference storage. **Exact spec language:** D68-R5–R6,
R9, R13–R16, AC15–AC17, AC22.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** backfilling from default
locale, legacy array order, existing Bases, or provider fallback fabricates
tenant intent; old writers may overwrite new state; rollback may discard audit.
**Why it matters:** a suggestion can become false policy before staff ever save
it. **Severity: High. Likelihood: Medium** if migration tries to be helpful.
**Decision effect:** requires an empty proof-only rollout. **Permanent fix:**
readers/degradation/constraints first, empty backfill, one writer cutover,
feature flag by cohort, preserve values/audit on rollback, and map-or-empty Site
clones. **Exact spec language:** D68-R14, AC18, AC22–AC23.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** “show preferred languages
first” can be implemented with hidden preselection, incomplete authorization,
or public cache effects while superficial UI tests pass. **Why it matters:** the
decision could drift across ADR, PRD, OpenSpec, tickets, code, and release.
**Severity: High. Likelihood: High** without observable outcomes. **Decision
effect:** adds D68-R1–R16, AC1–AC25, ADR-0189, and trace requirements.
**Permanent fix:** test public no-effect, source/basis nonauthority, authorization,
concurrency, migration, accessibility, usability, and production-shaped query
behavior. **Exact spec language:** D68-R1–R16, AC1–AC25; implementation remains
blocked until the consolidated Phase 24 OpenSpec delta is accepted.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** ADR numbering collision,
copying cross-Site raw IDs, treating a preference error as an authoring outage,
or using an APG prototype as a production component creates avoidable hazards.
**Why it matters:** these bypass established Phase 23/24 boundaries or create
maintenance traps. **Severity: High. Likelihood: Medium-high.** Phase 24 already
had to move its ADR range to 0181–0188, and PR #1340 owns 0145–0180. **Decision
effect:** D68 uses ADR-0189, safe ordinary-chooser degradation, explicit clone
mapping, and Core Base Maia/native semantics. **Permanent fix:** verify reserved
numbers, never raw-copy preference IDs, and qualify interactions in Core rather
than cargo-culting provider/APG examples. **Exact spec language:** D68-R7,
R13–R16, AC18–AC25.

## Exact normative requirements

**D68-R1 — canonical meaning and name.** Replace **fallback chain** with
**Suggested translation sources**: staff-only ranking convenience, never public
fallback, default, allowlist, equivalence, provenance, or authority.

**D68-R2 — optional partial Site order.** One Site may store zero or more unique
same-Site stable Site Locale identities in deliberate order. Empty is valid;
unlisted eligible sources remain available. There is no automatic initialization
or complete-order requirement. A nonempty order requires at least two Site-
Locale-owner-projected authoring-eligible Site Locales; otherwise the command
accepts only empty.

**D68-R3 — current point-of-use eligibility.** The effective set is derived when
the chooser opens from exact Tenant/Site/resource/action/viewer context. Exclude
the target locale and every inaccessible, ineligible, absent-revision, foreign,
or hidden source. Copy requires current source read plus target create/write;
Compare requires source read plus the target read/review authority defined by
D67. A Site manager's ability to order locale identities does not grant content
read.

**D68-R4 — deterministic chooser order without selection.** Eligible configured
sources appear under **Suggested for this Site** in stored order. Every remaining
eligible source appears under **Other available sources** in stable localized
label order with canonical code tie-breaker. Nothing is preselected or copied.

**D68-R5 — explicit source effect and D67 authority.** The actor explicitly
selects one exact source locale/revision. A future accepted editor command owned
by the resource domain and composed with D67 reauthorizes and pins it. Copy
creates only a new private target draft from the finite source-owned localization
manifest; Start blank creates Independently authored provenance; Compare is read-
only; an existing target is never overwritten.

**D68-R6 — complete nonauthority/public isolation.** Preference edits never
change an existing draft/revision/Basis/provenance/freshness, source relation,
public alternative, locale/default, publication, route, response, Navigation,
search, sitemap, canonical, `hreflang`, metadata, language menu, generation,
cache/Vercel, Giving, currency, message, receipt, or payment behavior. Phase 17
fallback and cross-Site copy remain separate owners.

**D68-R7 — compact Site settings UX.** Use **Site → Languages → Authoring
preferences**, the exact helper/empty/success copy in ADR-0189, explicit Save/
Cancel, and one compact ordered subset. **Add source** remains available in
empty/one/many states while an unlisted authoring-eligible locale remains and
appends to the unsaved order. One item has no move controls; multiple items have
locale-qualified Move up/down/remove controls; drag is optional only. Fewer than
two authoring-eligible locales show no source-order control; the second locale
reveals an empty section without adding a source. Add/remove restores focus and
announces the change.

**D68-R8 — calm editor UX.** Every authorized missing target first offers a
quiet, unselected choice between **Start blank** and **Copy from…** when a Copy
source is eligible; when none is eligible, Start blank remains available and
Copy explains its unavailability only from an authoritative empty eligible set.
An unknown candidate query says sources could not load, never that none exist.
New-target Copy names target and selected source, states that it creates a
private draft and no visitor link, starts unselected, loads source/diff only on
demand, and preserves state on failure. Existing target uses Compare. Full exact
locale labels/codes, `lang`/`dir`, and bidi isolation are mandatory.

**D68-R9 — owner and capability boundaries.** Operational Postgres owns the Site
preference; Site Locale owner owns identity/lifecycle; source owner owns exact
eligible revisions; D67 owns actual Basis; resource/placement owns public
alternative; generation owns serving; Phase 17 owns messages. Existing
`sites.manage_locales` may save; no new capability and no
`sites.publish_locales` gate.

**D68-R10 — structural data safety.** At most one stored current positive-
revision preference per Tenant/Site contains stable ID members with complete
non-null same-scope relationships, unique locale and positive position,
command-canonical dense order, restrictive deletion, source-shaped indexes, and
durable before/after audit. Absence is the canonical empty value at logical
revision zero only before the first mutation. Every later explicit or owner-
canonicalized clear commits a positive successor parent revision with zero
members and never collapses to absence/revision zero. No unchecked array, copied
label, generic settings/EAV, matrix, graph, fractional rank, CRDT, or per-user
authority. Preference/audit data is minimized to stable locale IDs, order/
revision, trusted actor/time, and request correlation; source content, hidden
titles, diffs, money, assets, and generated documents are absent.

**D68-R11 — command, RLS, and trusted attribution.** One server command takes
only complete ordered IDs, expected revision, and semantic idempotency key;
trusted context derives scope/actor/time/capability/audit. Use minimum grants,
ENABLE/FORCE RLS where applicable, operation-specific `USING`/`WITH CHECK`,
security-invoker views, security-definer functions with empty `search_path`,
schema-qualified objects and minimum execute grants, indexed predicates,
command-only privileged writes, and browser/service/Payload/worker/AI poison tests.
Editors may consume only the permission-filtered effective ranking through the
owning Copy/Compare read model without gaining preference-management authority
or filtered source visibility.

**D68-R12 — concurrency and lifecycle.** Preference CAS yields one complete
winner; matching replay returns the committed result and changed meaning
conflicts. Point-of-use effects separately recheck source/target heads and
permissions. New locales are not auto-added; public-only withdrawal does not
remove an authoring-eligible source. If the Site Locale owner commits a terminal
authoring-ineligible transition, that owning command previews and canonicalizes
the complete preference atomically, removing affected membership and clearing
it when fewer than two authoring-eligible locales remain, while history/Bases
survive; recreation never re-adds implicitly. D68 defines no new lifecycle state
or retirement command.

**D68-R13 — safe failure and bounded performance.** Missing/corrupt/unavailable
preference suppresses ranking and leaves the ordinary authorized chooser usable.
Failed/conflicting save preserves input; stale source creates no target. Resolve
on demand with one bounded preference read and one batched eligibility query;
no N+1, eager all-locale/diff load, public cache, or external I/O under lock. V1
does not share effective chooser results across viewers. An optional private
base-order cache contains IDs only and binds exact Tenant, Site, and preference
revision; current viewer/resource/action eligibility is recomputed on every
open. Ranking failure falls back to the ordinary unranked authorized chooser;
authoritative empty, candidate-query unknown, source-fetch failure, and
preference-save failure have distinct truthful states that preserve work.

**D68-R14 — proof-only migration and rollout.** Start absent/empty. Never infer
from any locale default/order/similarity, existing content/Bases, provider data,
or public alternative. Land readers/degradation/constraints before the writer;
cut over one writer by cohort; rollback stops writes but preserves value/audit;
Site clone maps exact target identities or stays empty.

**D68-R15 — accessible international UX.** Use semantic ordered-list/native
button behavior, visible positions/focus, focus retention, polite move/save
status, no color/flag/hover-only meaning, WCAG 2.2 24×24 minimum or spacing and
Core-preferred 44×44 primary/touch targets, keyboard/screen-reader/single-pointer/
forced-colors/reduced-motion parity, 320px/400% reflow, long/CJK/RTL labels, and
truthful weak-network/JavaScript failure.

**D68-R16 — bounded non-goals and activation.** No runtime fallback, visitor
preference, locale equivalence, automatic source, per-target graph, translation
workflow/vendor/memory/AI, public resolver, new task/notification, provider-
native authority, or OpenSpec/ticket/runtime implementation from grooming alone.
Representative editor usability and accepted Phase 23/D66/D67/Phase 12 plus a
consolidated Phase 24 OpenSpec delta gate activation.

## Falsifiable acceptance criteria

1. **AC1:** With fewer than two authoring-eligible locales, settings omit the
   source-order section. With two or more, absent/empty preference shows **No
   sources suggested** and the ordinary explicit source chooser at use, with no
   default/preselection.
2. **AC2:** A valid partial order saves and reads back in canonical order;
   unlisted eligible sources remain under **Other available sources**.
3. **AC3:** Fewer than two authoring-eligible locales show no source-order
   control; adding the second reveals an empty section without inferred
   membership. The target locale is absent from candidates; zero/one/many
   configured and eligible-source combinations render their exact specified
   states.
4. **AC4:** Unauthorized, hidden, foreign, ineligible, or absent-revision sources
   are non-enumerating at list, search, compare, preflight, submit, error, audit,
   and cache seams.
5. **AC5:** No source is selected or copied when the chooser opens, preference
   saves, an item moves, or a configured source becomes first/only.
6. **AC6:** Copy into a missing target creates one private target draft from the
   explicitly selected exact source revision and finite manifest, with no public
   effect or claim of completion.
7. **AC7:** Every authorized missing target offers Start blank independently of
   Copy-source availability and creates an Independently authored private draft;
   its success says **[locale] draft started. It is not public.** Preference
   order creates no hidden Basis or Translated provenance.
8. **AC8:** An existing target cannot be overwritten through Copy; Compare is
   read-only and changes no revision, Basis, provenance, freshness, review, or
   publication.
9. **AC9:** Existing Translated targets continue to use their pinned D67 Basis
   after preference reorder/removal; Independent and Legacy targets never gain a
   source implicitly.
10. **AC10:** Every stored member is a unique stable same-Tenant/same-Site Site
    Locale ID with a unique canonical position; duplicate, lifecycle-ineligible-
    at-save, unknown, copied-label, foreign, and malformed inputs commit nothing.
11. **AC11:** One current revision wins concurrent reorders; loser preserves
    submitted input, displays latest saved order separately, and receives
    **Suggested sources changed while you were editing. Your changes were not
    saved.** It never auto-merges and requires explicit review before retry or
    reset. After any positive revision is cleared to zero members, the next
    revision remains positive and a stale expected-revision-zero request
    conflicts rather than recreating first-write semantics.
12. **AC12:** Same key/canonical meaning returns the original committed result;
    same key/different meaning conflicts; lost response cannot create a second
    audit/effect.
13. **AC13:** Source revision, target head, locale lifecycle, and permission
    changes after display are rechecked by the owning command; failure preserves
    work and creates no partial target or disclosure.
14. **AC14:** `sites.manage_locales` may save the preference but cannot read
    source content, create/edit/review target, create a Translation Basis or
    public alternative, or publish without separate current authority;
    `sites.publish_locales` is not required.
15. **AC15:** Per-operation grant/RLS/function/view tests cover select/insert/
    update/delete, old/new scope transformation, `anon`, authenticated, table
    owner, service/secret application, Payload bypass, generic worker, AI, and
    authorized command success with trusted attribution.
16. **AC16:** Cross-Tenant/Site/environment/resource/locale browser and
    privileged poison probes reveal no existence and cause no preference,
    content, Basis, or public effect.
17. **AC17:** Preference changes produce byte-identical public pages/responses,
    Navigation, search, sitemap, canonical/`hreflang`, language menu, generation,
    cache keys/tags, and Vercel state; Phase 17 fallback and explicit public
    alternatives remain unchanged.
18. **AC18:** Adding a locale does not auto-add; temporary resource/permission
    ineligibility filters without rewrite. If the Site Locale owner commits a
    terminal authoring-ineligible transition, its owning command canonicalizes
    the complete preference atomically, including clearing a nonempty order at
    the two-to-one authoring-eligible-locale boundary, and preserves all
    historical revisions/Bases; recreation does not re-add. D68 itself creates
    no lifecycle state or retirement command.
19. **AC19:** Reorder works through keyboard and single-pointer Move up/down
    controls without drag, uses locale-qualified accessible control names, keeps
    focus on the moved row, updates DOM/visual order, and announces **[locale]
    moved to position X of Y** politely. Add appends and focuses/announces the new
    row; Remove focuses next, previous, or Add source in that order and announces
    removal.
20. **AC20:** Empty, one, many, add, remove, save, cancel, conflict, and failure
    flows pass keyboard/screen-reader/touch/forced-colors/reduced-motion proof at
    320 CSS px, 400% zoom, long labels, CJK, RTL, and mixed-direction strings.
21. **AC21:** Source chooser is compact/server-safe on weak networks, loads no
    source body/diff until selection, preserves input on JavaScript/network/
    permission loss, and gives a usable blank/ordinary alternative. Ranking
    failure shows the ordinary unranked authorized chooser; authoritative empty
    alone says no source is available; unknown candidate query says **We couldn't
    load translation sources. Try again.**; selected-source fetch failure keeps
    selection and says **We couldn't load [locale]. Try again or choose another
    source.**; save-network failure keeps the unsaved order and says **Couldn't
    save suggested sources. Your changes are still here. Try again.**
22. **AC22:** Migration starts every Site empty and proves no inference from
    default/allowed locale fields/order, existing Bases/content, provider
    fallback, public links, timestamps, frequency, browser language, or another
    Site; old readers ignore the value safely.
23. **AC23:** Maximum qualified Site Locale catalogs use one bounded preference
    read and one batched eligibility query with no N+1 or Site × locale × resource
    matrix; release evidence records measured p95 and query plan/index proof.
24. **AC24:** Representative occasional and frequent ministry editors complete
    setting order, Copy, Start blank, Compare, conflict recovery, and source-loss
    tasks without coaching. Zero critical misunderstandings are allowed about
    visitor effect, automatic selection, actual Translation Basis, or whether
    copying means translated/published.
25. **AC25:** D68 traces consistently from founder answer to glossary, ADR-0189,
    D68-R1–R16, consolidated OpenSpec scenarios, design, tasks/tickets,
    implementation, AC1–AC24 tests, and release evidence, with no contradictory
    name, owner, state, capability, count, or scope.

## Required monitors

| Signal                                                      |                                                                                            Threshold | Owner                            | Required response                                                                                                        |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------: | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `suggested_translation_source_cross_scope_accept_total`     |                                                                                                  Any | Security + CMS Localization      | P0 stop writer/projection, contain and assess exposure, repair structural/authorization boundary, rerun poison suite.    |
| `suggested_translation_source_unauthorized_render_total`    |                                                                                                  Any | Security + Web Studio            | P0 suppress projection/cache, assess disclosure, repair filter/submit authorization, re-prove.                           |
| `suggested_translation_source_public_runtime_consume_total` |                                                                                                  Any | Public Runtime + Security        | P0 remove consumption, purge affected public caches, verify generation/alternatives remain owner-derived.                |
| `suggested_translation_source_implicit_effect_total`        | Any automatic selection, copy, comparison authority, Basis, public alternative, or generation effect | CMS Localization + Site Platform | Stop rollout, contain effect through its owner, preserve history, repair boundary and tests.                             |
| `suggested_translation_source_invalid_projection_total`     |                         Any corrupt, stale, foreign, or ineligible member applied instead of omitted | CMS Localization                 | Suppress prioritization, use ordinary chooser, reconcile preference/lifecycle evidence, investigate.                     |
| `suggested_translation_source_save_conflict_ratio`          |                                                        >5% for 30 min with at least 20 save attempts | Web Studio + Site Platform       | Preserve submitted orders, investigate contention/stale clients, tune interaction or command; never merge automatically. |
| `suggested_translation_source_picker_p95_ms`                |                                         >300 ms server resolution for 30 min with at least 100 opens | Web Studio + Database            | Inspect batched query/index/RLS plan, disable prioritization if needed, retain ordinary chooser, fix before re-enable.   |

The two percentage/latency thresholds are D68 product alert budgets, not
Supabase/Payload limits. Production-shaped qualification must validate them; an
accepted OpenSpec/design amendment must change them before rollout rather than
silently relaxing monitoring.

## Ruthless synthesis and execution order

### Must be resolved before recording

Resolved in this documentation set:

1. Replace the misleading fallback-chain term.
2. Make the order optional/partial and preserve the no-build empty behavior.
3. Separate ranking, candidate eligibility, explicit selection, Translation
   Basis, public alternatives, and runtime.
4. Specify no-preselection/no-overwrite UX and accessible reorder controls.
5. Keep `sites.manage_locales` and avoid a new capability/workflow.

### Must enter consolidated Phase 24 OpenSpec/design before ticketing

1. D68-R1–R16 and AC1–AC25.
2. The accepted D66 Site Locale and Phase 23 editor/source-revision seams.
3. Logical preference grain, structural relationships, current revision/CAS,
   command, audit, grants/RLS, indexes, and migration.
4. Exact source eligibility and owner contracts for Copy versus Compare.
5. Exact Base Maia UI copy/states, locale labels, responsive/a11y behavior, and
   no-public-effect negative contract.
6. Feature flag/cohort rollout, kill switch, rollback, all seven monitors, and
   production-shaped query/usability evidence.

### Required implementation safeguards

1. Land read/degradation and exact authorization before any writer.
2. Keep D68 in `packages/api`/Site policy, not Payload user preferences or public
   CMS documents.
3. Prove one end-to-end ordinary resource with a real exact source revision,
   private target draft, D67 Basis, and byte-identical public output.
4. Reuse existing Site Locale, EffectiveAccess, editor, audit, and Base Maia
   seams; reject new resolver/workflow/task systems.
5. Pass security, concurrency, migration, provider-conformance, accessibility,
   usability, and measured maximum-catalog query proof before activation.

### Monitor after release

Only the seven signals above are assigned to monitoring. Each has an exact
threshold, owner, and response. No unnamed “watch later” item remains.

## Final disposition

**Accept with required amendments.** Option 1 is the best permanent direction
only as the optional, partial, staff-only ranking in ADR-0189 and D68-R1–R16. It
must collapse to the ordinary explicit chooser when empty or unavailable and can
never become provenance, authorization, public fallback, or a localization
workflow.
