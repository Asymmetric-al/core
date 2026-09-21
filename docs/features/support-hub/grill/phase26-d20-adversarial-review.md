# Personal and curated shared Support views

**D20 and every adopted amendment are fully founder-ratified, 12 September 2026. Historical disposition: Accept with required amendments.** D1–D19 remain fully ratified. The complete accepted package and explicit Email Studio seam are recorded below as grooming authority; no implementation or formal specification is claimed.

Staff can save their current conversation filters as a personal view and return through an always-discoverable Views picker. Qualified maintainers provide Shared views for an explicit authorized audience. Personal pins stay separate from the shared definition. Opening a view shows current authorized matches; it does not move conversations, assign work, change CRM records, follow anything or send messages.

**The essential architectural amendment is to extend Core's shared named-view/list capability**, registering Support's subject, criteria and permissions. The roadmap explicitly requires reuse across CRM, contributions, reporting and Support, and Phase9 A14/B11 already governs nested typed definitions and complete parameterized queries. Hardening `support_saved_views` as a second permanent engine would violate that direction. The existing personal gift-history store is useful foundation, not an already qualified implementation of Support sharing.

The strongest alternative remains Shared-only reusable views: simpler when duties are uniform, at the cost of personal repeated filtering or maintainer requests. Built-ins plus temporary filters are a credible smaller alternative. A is justified by the selected need for individual reuse and coherent team organization, not by a vendor feature checklist or an invented ministry study.

The [complete UX](phase26-d20-views-ux.md), [data/query/lifecycle contract](phase26-d20-data-contract.md), [evidence and conflict register](phase26-d20-evidence.md), independent reviews and [documentation validation](phase26-d20-validation.json) accompany the exact clauses below.

## Corrected decision clauses

### D20-R01 — One shared capability with Support-owned meaning

Generalize and qualify the existing platform named-view, preference and list machinery required by Phase9 A14/B11 and the roadmap's cross-cutting saved-view requirement. Support supplies a closed conversation subject, field/operator catalog, source authorization, lifecycle projection and allowed actions. Preserve other registered subjects and their policies. Support users require the actual Support capabilities, not unrelated CRM read/write permission inherited from the current implementation directory. Do not build a second Support query/persistence engine, copy CRM identities or import Email Studio's publication engine. Retire the conflicting Support saved-view path through an explicit migration, not permanent synchronization between stores. Existing components/RPCs are reused only where they satisfy the contract.

### D20-R02 — Definition, working query and personal preference are distinct

A saved view is a durable identity with a versioned definition over current conversations, never a membership container or static snapshot. Its scope is My or Shared. The platform owns the definition/settings record and revisions; Support owns the permitted subject/predicates; CRM and other domains own referenced facts. Keep saved definition, current unsaved query, active view ID/revision, personal pins/order and current result page distinct. Bind deltas-from-defaults to an immutable/versioned subject-default baseline, or preserve an equivalent exact effective definition under the shared contract. A default change cannot silently change a saved view without its revision changing; missing old baseline proof is Needs attention. Names, slugs, equal filters and first-match lookup are not identity. No copied result IDs, body snippets, cursor, selected rows, active conversation or message draft belongs in a saved definition.

### D20-R03 — Find views without configuring the product first

Keep the ratified standard queues and recovery/attention entry points available. Place an always-visible **Views** control in the Support conversation list header, with a searchable picker organized as **Pinned**, **My views** and **Shared**. Pinning is optional; first-time users can work with standard queues immediately. Provide **Save view** from ordinary filtering and **Manage views** for existing saved definitions. Do not render every shared definition as a permanent chip, push all team views into every sidebar or hide the only discovery path behind a missing pin. My means personal configuration within the current tenant, not private conversations.

### D20-R04 — Opening uses explicit scope and preserves context

Open by stable view ID and current eligible revision. In the full Support workspace, the saved view supplies its complete displayed query scope; do not silently AND it with the previously open inbox, record, selected row or old search text. Show the active name, My/Shared audience cue and current filters. An intentional override marks **Modified** without changing the saved definition. **Reset to saved view** restores current eligible saved settings, not cached forbidden values. Preserve list/scroll/return context through conversation and authorized CRM navigation, but reauthorize on return. A direct unavailable link shows a safe unavailable state and a path to standard work; it must not silently execute a broader fallback query under the unavailable name.

### D20-R05 — Save the criteria the person actually reviewed

Save view opens a compact dialog with name, optional description, visible complete criteria summary and My as the default. It captures inbox scope, supported active filters, explicit sort and allowed default columns from the current query, not hidden ambient state. When search text exists, **Include search text** is checked and the exact text is shown as stored content; unchecking updates the reviewed definition/preview. No automatic title/description copied from a person or message. Save may proceed with zero valid results; a failed preview is not zero. Show confirmed save only after durable success, preserve edits on failure and reconcile a lost response under the same command identity. Creating a view pins it for its creator only, subject to the personal preference command; a pin failure does not negate a successful save. Show “View saved. Couldn’t pin it.” with a preference-only Pin view retry; retain the saved active ID, never create another definition.

### D20-R06 — Bounded typed criteria, one consistent meaning

Use the shared versioned nested AND/OR predicate shape required by Phase9 B11; never freeze Support's old flat JSON as the platform contract. The normal UI exposes familiar facets and one level of grouping, not a workflow canvas. Support's launch catalog covers explicit inbox scope, D3 work status/reason, responsible worker, existing labels, D15 Following, D14 overdue/timing facts and the qualified conversation search/sort fields. The search UI states the qualified searched fields; saving filters does not itself add full-text, attachment, arbitrary CRM or AI search. No arbitrary SQL, regex, executable expression, hidden CRM property or tenant-defined trigger/action language. Unsupported fields/operators/versions fail clearly rather than being ignored.

Across distinct facets require all chosen conditions. Within a multi-choice facet match any selected value unless the control explicitly declares otherwise. Labels offer **Any selected** (new-view default) or **All selected**, visible when relevant; No labels is an explicit separate condition. An unset value does not silently satisfy a negation; use explicit Unassigned/No labels where supported. The same compiled operator semantics serve all endpoints. Result preview, rows, matching counts and page continuation share the exact effective predicate. Facet options are an independently declared authorized catalog or contextual option query, not the result population; selecting label A cannot make label B impossible to add under Any. Omit per-option counts by default. Legacy ANY-versus-ALL ambiguity requires reviewed migration, not silent selection of one implementation.

### D20-R07 — Source-owned status, target and Following semantics

Use the exact ratified D3 Open, both Waiting meanings and Resolved behavior, not old seeded ticket states. Default standard queues remain as ratified. Following initially includes All statuses and uses **Latest followed update**; unrelated activity on merged originals cannot reorder that personal view. A saved view may deliberately add status filters to Following, with those filters visible. D14 **Overdue replies** matches any permitted underlying qualifying overdue obligation, not only whichever single cue is displayed. Preserve timing-unknown facts and **Reply timing needs confirmation**; no new Due soon threshold, SLA policy, resolution clock or implicit satisfaction. Reply due sorting consumes the D14 primary cue: confirmed-overdue precedence within a row, otherwise the earliest applicable known/candidate instant, with the stable continuing ID as tie-breaker. Uncomputable and untargeted sort last with distinct labels, never a fabricated now/zero. Overdue/timing predicates still inspect all qualified underlying periods. This defines the Support catalog key without a new target calculation or Due soon policy.

### D20-R08 — Me, explicit people and references

Store **Me** as an explicit current-viewer predicate resolved from trusted tenant membership and the qualified worker mapping. It is not the creator's ID, email matching, CRM record owner, requester or authenticated-user ID guessed to equal a profile ID. Specific people are stable qualified references with clear labels; Unassigned means an actual source-owned absence of assignee, not a failed lookup. **All accessible inboxes** is an explicit dynamic scope; selected inbox IDs are explicit scope. Shared current-viewer criteria naturally yield different results for different users, and the description explains that. Renaming an inbox/label/person does not change predicate identity. Current permissions still govern options, labels and results.

### D20-R09 — Shared audience is not access to records

My definitions are readable/editable by their current tenant-member custodian under the shared capability's policy. Ordinary shared maintainers do not gain access to everyone's My definitions. Shared views have an explicit audience, using qualified existing teams or all eligible Support staff, and separately qualified maintainers; the relevant scope can be narrower than the tenant. Audience membership grants visibility only to a definition whose fields/values may be disclosed to that audience, never access to its conversation/CRM results. Current field-use permissions apply to predicates, sort, facets, counts and previews as well as rows. Do not leak restricted facts through a boolean membership test. Configuration/oversight roles retain actual narrow authority, not implicit universal body/configuration access.

### D20-R10 — Shared maintenance is a direct qualified command

Authorized maintainers can **Save shared view** or **Save changes** after reviewing criteria, audience and the impact on current users. Curated means accountable maintenance, not a new approval queue or per-change two-person review. Existing applicable policy floors remain honored. Keep ordinary staff free to adjust temporary filters and save a My copy without rewriting Shared. New shared definitions are discoverable to their eligible audience; only their creator receives the R05 creation pin. They are not automatically pinned for the audience or made a homepage. Maintainers can be appropriately delegated without giving inbox deletion, financial, CRM or Email Studio publishing powers.

### D20-R11 — Personal copy and deliberate sharing

**Save as My view** copies the currently reviewed eligible definition into a separate My identity. Subsequent Shared edits do not modify that copy; make this clear before copying. A qualified maintainer may deliberately create a Shared copy of a My definition only after reviewing the exact name, description, search literals, referenced filter values and destination audience. It shares that definition only, not all My data or the inspiring conversation. Do not silently promote a personal row to Shared through a generic scope field update. Personal and Shared identities/custody stay independent. No contribution workflow or notification is necessary merely to request a useful shared list; existing staff collaboration suffices.

### D20-R12 — Personal pins, layout and route defaults

Pins and their order belong to the current tenant member in the shared preference capability and survive normal device changes. Removing a pin does not archive/delete or change a shared definition. Pinning/reordering/sharing does not change Support's startup route or the team's defaults. Phase9's first-pinned route-default wording governs its CRM kind-route contract; Support's explicit adaptation keeps its already ratified entry behavior. This does not change CRM defaults or add a new homepage setting. Persist personal display preferences separately from Shared default columns/sort; distinguish an intentional temporary sort override. No new board/kanban mode is activated by copying a legacy `layout` field.

### D20-R13 — Complete authorized querying before pagination

Evaluate the complete current authorized query before limit, sort, count, facet membership and cursor construction. Remove the existing cap-before-text/label-filter behavior. Use the shared parameterized predicate/list engine, stable source IDs and keyset cursor envelope with tie-breakers; never concatenate raw query strings, change punctuation to escape filters or scan a capped browser cache. Support names/search containing commas, percent signs, parentheses, apostrophes, international scripts and literal wildcard characters through the qualified search contract. Facet options come from their declared authorized bounded catalog/contextual query, not loaded rows or an accidental restriction to current matches. Count scope/freshness/estimate/cap is explicit; an unavailable or incomplete computation is never zero. Omit optional per-custom-view badges by default rather than executing a live count for every saved definition.

### D20-R14 — Honest live results without moving the action target

Views evaluate current work; they are not reproducible historical reports. Bind each cursor/read to exact tenant, principal/scope, subject, normalized effective query, sort and definition revision. Reuse the qualified cursor envelope and reject stale/mismatched context; reset paging visibly on relevant changes. Time-dependent rows and their accompanying matching count use one trusted server-sampled evaluation instant; client clocks never determine overdue authority. Ordinary data changes may alter current results, while source permissions/restrictions are enforced immediately. Keep the selected conversation and row action bound to its stable ID. Show a quiet **Results changed · Refresh** when needed rather than moving rows under an action or stealing focus. Never apply a bulk effect to “all current matches” based on a shifting view; existing selected-item actions reauthorize exact IDs. No new bulk action is created by D20.

### D20-R15 — Save, rename and concurrent editing

Separate **Rename** (metadata only) from explicit criteria/audience changes. Editing view B while view A or temporary filters are active must load B's own definition/revision; rename cannot write A's current route filters into B. Store exact current revision and guarded expected-version commands. A concurrent edit returns a useful conflict with current saved state and retained unsaved work; never last-write-wins another maintainer silently. Update/rename/archive cannot create a missing definition. A changed semantic payload under the same command identity conflicts. Exact retry returns the original durable receipt and current state separately; an old receipt cannot revive a later archive. A new deliberate action has a new command identity. Definition, custody/audience references and required audit commit atomically. Personal pin persistence can be separately reconciled and must report partial success honestly. Identical My/Shared criteria remain separate identities; active-view status cannot be inferred by first matching filters.

### D20-R16 — Archive, restore and safe correction

Provide **Archive view** for My owners and qualified Shared maintainers. It removes the definition from ordinary picker use and active pins without deleting conversations, altering work or moving it to another inbox. Shared archive reviews that audience impact. **Archived views** in Manage views provides persistent **Restore** while the definition still exists under its actual retention policy; a toast is not the only recovery route. Restore revalidates current criteria/audience/authority and returns the definition to its catalog unpinned, including for its creator. Archive ends all prior pin applicability; a delayed Pin, reorder or create-auto-Pin cannot revive after Archive→Restore. Bind positive preference intent to a lifecycle generation or equivalent owner receipt; a genuinely new deliberate Pin after restore is allowed. No synchronous fanout rewrite of every preference is required. An open authorized conversation and safe message draft remain available independently of the archived list context. Historical revisions may support **Restore previous settings** through a current qualified successor save with a difference preview; no blind rewind to forbidden references or prior access. Physical retirement follows the actual configuration owner policy, not an undisclosed trash timer or automatic low-use deletion.

### D20-R17 — Staff departure and shared continuity

Shared definitions have tenant-scoped stewardship independent of one author's employment or support-agent row. Offboarding or deleting that author cannot cascade away a team's views or transfer maintenance automatically to a same-email replacement. My access stops with the relevant membership; no automatic publication, personal-content handoff or email-based identity inheritance. Existing owner-governed retention/retirement handles remaining configuration. Loss of the last qualified Shared maintainer creates a narrow owned maintenance exception without broadening access; reading a still-valid view does not require its author online. Team deletion and membership changes re-evaluate audience/maintenance under current rules and never silently broaden to Everyone.

### D20-R18 — Invalid is not empty

Unknown schema/operator, deleted/unusable required reference, forbidden predicate or unavailable current definition yields **View needs attention** or a permission-safe unavailable result. Do not silently drop the failing condition, swap a similarly named inbox/label, treat an invalid operator as match-all or present no matches as healthy. A retired resource may remain a qualified historical predicate if its owner preserves its exact meaning and disclosure; show an appropriate label. Access lost to an explicit selected inbox cannot be approximated by silently querying a smaller subset under the same stated scope. Dynamic All accessible inboxes is different and intentionally follows the viewer's permitted scope. Return to standard work or a deliberate corrected My query is explicit, not automatic fallback under the old title.

### D20-R19 — Definition privacy and lifecycle

Names, descriptions, search literals, resource references, revisions and personal preferences are tenant-governed configuration and may be sensitive. Do not auto-harvest conversation text, saved results, recipient lists or CRM snapshots into them. Show stored search text and Shared audience before save, use neutral suggested names, and avoid sensitive text in telemetry, notification bodies or unrestricted URLs. Known source-derived content/references retain applicable source restrictions and D16/D17 correction/expiry requirements; a saved query must not preserve an expired body or infer its former presence. General independently authored criteria have their own configuration purpose, not the D17 conversation clock. Qualify finite retention, offboarding, audit, backup and restore behavior through the shared owner before activation; no forever assumption or new per-view retention knob. No claim of perfect PII detection for manually authored text.

### D20-R20 — Coherent CRM navigation, no second catalog

CRM records retain D9's authorized source-backed Support history. Keep their record anchor visible and fixed in that surface; do not silently overlay a saved Support view that drops the record context. **Open in Support Hub** preserves an authorized return reference and clearly enters the full conversation workspace; opening a selected saved view there applies its displayed scope. Do not put another My/Shared view store in each CRM record. D20 introduces no arbitrary related-record/financial/care segmentation catalog. Any existing CRM field consumed by an approved Support predicate requires owning-domain field-use and disclosure authority, not merely row-read permission. View activity creates no Party, related-record link, communication, last-contact update, refund, receipt or completed business action.

### D20-R21 — Conversation topology and other source lifecycles

One conversation result is one currently continuing work row under D10, with current work-home/assignee/status facts, subject to actual source access. Evaluate permitted original-content matches and relevant D9/D15 relationships using their exact owners before root deduplication, count and pagination; a merge never grants new sources to a follower or viewer. Undo repartitions under current truth. D12 related conversations remain independent; they are not one view-owned case. D16 redaction and D17 expiry remove unauthorized content/matches immediately, while permitted structural history may remain. D19 held intake and processing issues keep their separately authorized surfaces and mandatory attention; an ordinary conversation view cannot admit or expose held input. No saved view reopens/resolves, changes targets, enrolls follows or prolongs retention.

### D20-R22 — Trusted database mutations and authorization parity

Use the shared owner through packages/api with trusted tenant/auth-user/actual-profile/membership attribution. Do not accept owner/tenant/approval/system scope from caller-controlled saved-view payloads. Enforce tenant-aware view/subject/audience/team/member/preference references; distinguish global identity from tenant membership. My binds a qualified stable tenant/principal/profile custodian with current staff eligibility, not an arbitrary first role-membership row; Shared requires explicit qualified audience/stewardship and no personal cascade authority. Stable IDs, schema version, positive revision, allowed status/subject, unique command/business identities and reference integrity are constrained. Duplicate names are human disambiguation, not identity or silent replacement. Qualify Support-specific name uniqueness/display behavior against the existing private named-view constraint without relaxing CRM namespaces globally or leaking another private name through collision errors. Shared/current fields cannot be transformed through generic mass assignment.

Retain server-only raw stores where appropriate. If an approved projection/direct mutation exists, grants and RLS must enforce old-row USING and resulting-row WITH CHECK semantics, immutable scope/actor fields and column minimization. PostgreSQL can use USING as the applicable default check; omission alone is not a vulnerability claim. Service-role/BYPASSRLS, SECURITY DEFINER RPCs, views, storage/export/restore and audit paths need the same tenant/action/source guard. Current broad staff Support policies and personal-only shared RPCs are not proof of the new contract. Protect required audit from forged insert/update/delete; lawful source retirement remains separately authorized.

### D20-R23 — URLs, caches and untrusted query input

Preserve the shared URL-as-state contract with explicit active view/revision and deltas for query/sort/cursor; route state is not authorization. Sharing a stable view link grants no access. A link to a modified query must explicitly carry that reviewed state rather than misleadingly linking only to the unchanged view. Use a qualified canonical serializer/parser; sensitive free text and private literals require authenticated, bounded owner-held query-state references under the qualified shared state capability, never raw URL/referrer/analytics/log values. References grant no bearer access and default to the authorized temporary-state owner; deliberate Shared creation remains the route for broader definition disclosure. Do not build a standalone query-state platform. Non-sensitive enum/ID deltas use the catalog-qualified route policy; missing/expired/forbidden state is unavailable, never match-all. Qualify exact access/retention/restore behavior before activation; this Support adaptation does not rewrite CRM route requirements. Never lower validation for pasted URLs, accept raw SQL/HTML/template syntax as executable input or place source bodies in URL state. Protect sensitive query values from third-party referrers/analytics/logging and limit cache persistence.

Cache identity and delayed responses bind tenant, current principal/membership, source/definition permission context, subject, revision and effective query. Clear or reject old in-flight data on same-user tenant switch or permission change, not only sign-out. Current source denial is enforced before render/count/preview even when caches lag. An archived/revoked/expired definition cannot be resurrected by local storage, server fallback, a stale preference or backup restore. A saved definition and a fixture collection must not share an ambiguous production cache authority.

### D20-R24 — Email Studio and side-effect boundaries

Saved views consume the shared named-view/list capability, not Email Studio Saved Sections, templates, publishing or preparation. No P6 communication event, Resend send, subscription, reminder or donor contact is produced by Save, Open, Pin, Share, Rename, Archive or Restore. D18's familiar My/Shared wording can guide labels but does not make these the same entity or approval engine. Existing conversation Send/Add note/business commands remain separately authorized and retain D4/D18/P17/P6 semantics. Optional view-definition exports/imports or scheduled digests are not added by D20; existing governed result export cannot treat a view as a recipient list or durable snapshot. Required maintenance exceptions reuse qualified staff work/attention only for a real failed source obligation, not every edit.

### D20-R25 — Failure, audit and maintainable operations

Keep definition changes, audience/stewardship changes, archival/restoration and consequential migrations attributable through minimized durable owner history. Record stable IDs, revisions, operation and outcomes without duplicating query text or private labels in general logs. Healthy reads, searches, pins and routine saves do not notify the team. Show saved-but-not-pinned, pending reconciliation, conflict, invalid definition and query failure accurately. A view-service outage does not remove the standard authorized Support work path; offer it explicitly while preserving the unsaved query where safe. Provide scoped repair/retire controls and schema diagnostics instead of routine direct database edits. Operational signals and responses are O01–O07 below.

### D20-R26 — Bounded performance with published proof

Reuse the shared cursor/facet/query budgets and max-page eviction; qualify a Support subject profile with finite maximum definition bytes, predicate nodes/depth, selected values, search/name lengths, page sizes, query duration and result-cache retention before activation. These bounds are enforced server-side, exposed as useful validation errors and tested at/below/above their exact values. This decision does not invent a vendor-derived total view quota or promise infinite real-time counts. Personal pin retrieval/catalog pagination must not fetch every definition/body or execute every saved query. Use indexed tenant/subject/visibility/custody references and suitable current conversation predicates; isolate expensive queries by tenant under measured capacity. Actual deployment values, units, supported population/skew and latency/error evidence are release artifacts, not guesses presented as benchmarks.

### D20-R27 — Versioned migration and scoped activation

Register Support in the qualified shared capability additively, with its own schema/permission contract. Phase9 private-now/team/everyone-reserved describes its CRM scope; D20 explicitly qualifies Shared for Support and does not turn on CRM sharing. Keep other registered subjects, RPC shapes and existing preferences compatible. Inventory legacy Support definitions: null/ambiguous personal owner, owner-cascading Shared rows, missing inbox scope, ANY/ALL disagreement, unknown filters, flat payload, old layout and identity-by-name require explicit reconciliation. Do not guess a missing owner, assign all legacy My content to an admin, auto-publish private rows, silently drop criteria or make the latest loaded inbox the historic scope.

Use idempotent import/alias mapping into one authoritative definition and preserve allowed source evidence. Default-baseline/schema migration either proves equivalent effective meaning or requires an explicit reviewed successor; it never silently substitutes current defaults. Separate unchanged valid definitions from bounded owned exceptions. Fence old writes before activation; avoid permanent dual-write/sync. Shared creation/maintenance and destructive legacy retirement remain disabled for unqualified scope. A feature stop may disable new saved-view work while preserving standard Support access and current restrictions. Rollback cannot restore old writers that ignore new privacy, revisions or negative controls; preserve aliases/tombstones and prefer forward repair after accepted changes. No unrelated CRM redesign is required.

### D20-R28 — Complete proof, traceability and scope discipline

Record this exact corrected decision, full UX/data/evidence, all 23 categories, independent corrections, proposed feature ADR and glossary, P01–P44 and O01–O07. Later explicitly authorized specification/design/tasks/tickets must trace each accepted clause to user-visible, authorization, concurrency, migration, accessibility and production-shaped evidence. Documentation checks and source pointer/hash observations are not runtime proof. No new formal OpenSpec/PRD, tickets or implementation is authorized in this grill.

This completes the saved-view journey without adding a second CRM, shared-result snapshot, general workflow engine, BI report builder, scheduled export, marketing audience, AI query agent, mandatory review bureaucracy, template studio or a new product navigation system. Positive user outcomes must be observed through the required usability tests; no source establishes measured ministry productivity gains or a universal optimal number of views.

## Full adversarial category review

Severity is the plausible impact without the amendment. Likelihood is qualitative engineering judgment, not measured ministry prevalence. Each category was examined independently. Exact requirement references below incorporate the linked data/UX contracts; they are not optional suggestions.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes. Severity: Medium; likelihood: Medium.** Personal reuse can save repeated work, but a new stand-alone view engine or complex builder would solve the problem at the wrong level. Shared-only is the strongest simpler alternative. Core explicitly mandates a shared capability; individual ministry frequency is unmeasured. **Effect:** changes A's architecture and narrows scope. **Permanent fix/exact language:** R01–R03/R28; qualified platform reuse and optional personal organization. **Proof:** P01/P02/P41/P44.

### 2. Brittleness

**Material concern: Yes. Severity: High; likelihood: High.** A stored slug, email-derived Me, hidden ambient inbox or deleted filter target changes meaning as people and data change. Current flat filters omit inbox scope. **Effect:** requires explicit stable references and scope. **Permanent fix/exact language:** R04/R06/R08/R18; invalid means unavailable, never silently broader. **Proof:** P04/P08/P09/P23/P24.

### 3. Technical debt

**Material concern: Yes. Severity: High; likelihood: High.** Preserving the independent Support store and browser/server filter implementations would duplicate a platform capability and perpetuate inconsistent behavior. The roadmap/P9 and actual ANY/EVERY code conflict are direct evidence. **Effect:** changes the permanent path. **Permanent fix/exact language:** R01/R06/R13/R27; one qualified subject/compiler/store with old-writer retirement. **Proof:** P01/P10/P11/P35/P36.

### 4. Edge cases

**Material concern: Yes. Severity: High; likelihood: High.** Identical view names/criteria, zero valid matches, inactive staff, changed labels, merged conversations, missing targets, international punctuation and ambiguous legacy owners can select wrong work or silently lose filters. **Effect:** adds explicit handling. **Permanent fix/exact language:** R02/R05/R08/R15/R18/R21/R27. **Proof:** P03/P06/P08–P12/P23/P30/P36.

### 5. Footguns

**Material concern: Yes. Severity: High; likelihood: High.** Current Rename can overwrite a view with active route filters; pin/delete/share can be confused; a moving result could target a different conversation. These are source-supported risks, not hypothetical button styling. **Effect:** separates commands and stable targets. **Permanent fix/exact language:** R11/R12/R14–R16/R24. **Proof:** P05/P13/P16/P17/P19/P31.

### 6. Tenant safety

**Material concern: Yes. Severity: Critical; likelihood: Medium.** Tenant-wide My listings, stale same-user tenant caches or unrestricted shared metadata can reveal another scope's filters/results. Current Support policy and cache keys require qualification. **Effect:** requires independent tenant/member/definition/source scope. **Permanent fix/exact language:** R09/R22/R23. **Proof:** P18/P20/P21/P22/P29.

### 7. Database, RLS, and authorization safety

**Material concern: Yes. Severity: Critical; likelihood: High.** Caller-controlled owner/scope/id, broad staff CRUD and personal-only RPC assumptions could permit unauthorized transformation or attribution. The platform server-only store is a sound pattern, not a public leak. **Effect:** hardens the shared extension and retires weak paths. **Permanent fix/exact language:** R15/R22/R27; trusted identity, tenant relations, immutable audit and old/new policy checks. **Proof:** P18–P22/P35/P36.

### 8. Overengineering

**Material concern: Yes. Severity: Medium; likelihood: High.** A separate publishing system, nested visual canvas, automatic suggestions or catalog of every vendor field would obscure routine filtering. **Effect:** narrows UI and ownership. **Permanent fix/exact language:** R01/R06/R10/R24/R28; shared stored shape with bounded familiar controls and direct qualified maintenance. **Proof:** P01/P02/P33/P44.

### 9. UX/UI and user friction

**Material concern: Yes. Severity: High; likelihood: High.** A hidden picker, every-view chip bar, silent shared edit, unannounced changed results and hover-only controls create missed work/confusion. Front/Intercom document relevant navigation limits; current scaffold shows the chip/rename hazards. **Effect:** requires the full linked journey. **Permanent fix/exact language:** R03–R05/R10–R16/R18 and UX contract. **Proof:** P02–P07/P13/P16/P37–P41.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes. Severity: High; likelihood: High.** A saved list can be mistaken for a snapshot, team ownership, source truth or notification subscription. Two stores and ambiguous active identity make drift likely. **Effect:** clarifies authority. **Permanent fix/exact language:** R01/R02/R14/R20/R21/R24. **Proof:** P01/P03/P10/P26/P30/P33.

### 11. Support Hub–CRM integration and cross-surface continuity

**Material concern: Yes. Severity: Critical; likelihood: Medium.** Filtering by a hidden CRM fact can leak through result membership/count, or a saved view can silently remove the current CRM record anchor. Sharing must not create related records/contact events. **Effect:** constrains cross-surface use. **Permanent fix/exact language:** R09/R20/R21/R24; fixed CRM scope, explicit full-workspace navigation and independent field authority. **Proof:** P20/P25/P26/P29/P33.

### 12. Hidden coupling

**Material concern: Yes. Severity: High; likelihood: High.** Reusing CRM default-order behavior, Email Studio publishing or current route-state as saved identity can change another surface unexpectedly. **Effect:** requires explicit subject-specific contracts. **Permanent fix/exact language:** R04/R12/R15/R24/R27; Support adaptation without rewriting CRM rules. **Proof:** P04/P13/P14/P16/P33/P35.

### 13. Failure modes

**Material concern: Yes. Severity: High; likelihood: High.** A save timeout, preference failure, partial query or stale cache can claim success/empty work incorrectly. Kustomer documents a historical saved-filter persistence defect. **Effect:** adds reconciliation and honest states. **Permanent fix/exact language:** R05/R13–R15/R18/R25. **Proof:** P06/P11/P12/P15/P17/P32.

### 14. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes. Severity: High; likelihood: High.** Two maintainers may overwrite each other; delayed updates can repin archived definitions; changing target clocks or current-viewer context can change membership mid-page. **Effect:** requires stable identity/revisions/current guards. **Permanent fix/exact language:** R07/R12/R14–R18/R23. **Proof:** P13–P17/P23/P27/P28/P30.

### 15. Data integrity risks

**Material concern: Yes. Severity: High; likelihood: High.** Missing owner/inbox, ANY/ALL mismatch, cascading author deletion, name-based replacement or capped filtering can corrupt definitions or omit work. Source facts demonstrate these seams. **Effect:** changes storage/query/migration safeguards. **Permanent fix/exact language:** R06/R08/R13/R15/R17/R22/R27. **Proof:** P08–P11/P16/P21/P24/P35/P36.

### 16. Security and privacy risks

**Material concern: Yes. Severity: Critical; likelihood: Medium.** A personal query may contain a sensitive name/address; sharing literals, leaking facets, retaining expired matches, URL analytics or executable query input can disclose protected context. **Effect:** narrows metadata and execution authority. **Permanent fix/exact language:** R09/R11/R19/R22/R23; current definition/field/source gates and parameterized parsing. **Proof:** P07/P18–P22/P25/P29/P42.

### 17. Scalability and performance risks

**Material concern: Yes. Severity: High; likelihood: High.** Per-view badge queries, client full scans and limit-before-filter yield poor performance and incomplete results; complex vendor views can time out. No Core D20 benchmark proves capacity. **Effect:** requires bounded shared queries and measured profiles. **Permanent fix/exact language:** R13/R14/R26. **Proof:** P10–P12/P28/P34/P43.

### 18. Operational burden

**Material concern: Yes. Severity: Medium; likelihood: High.** Shared views can become orphaned, duplicate or invalid; automatic unused-view deletion can break seasonal work. The last-maintainer case needs a real recovery path, not SQL repair. **Effect:** adds accountable maintenance without bureaucracy. **Permanent fix/exact language:** R10/R16–R18/R25. **Proof:** P19/P23/P24/P32/P41.

### 19. Observability and auditability gaps

**Material concern: Yes. Severity: High; likelihood: Medium.** Healthy-looking saved labels do not prove persisted criteria; logs may leak query text while lacking revision/actor/outcome evidence. **Effect:** requires minimized durable history and operational signals. **Permanent fix/exact language:** R15/R19/R25/R26 and O01–O07. **Proof:** P15/P16/P22/P32/P42/P43.

### 20. Dependency and integration risks

**Material concern: Yes. Severity: High; likelihood: Medium.** Generalizing current gift-history RPCs can break CRM preferences or couple views to provider/template availability. Unsupported parser/schema upgrades can broaden old definitions. **Effect:** requires qualified shared-subject compatibility. **Permanent fix/exact language:** R01/R06/R23/R24/R27. **Proof:** P01/P21/P33/P35/P36. No new Resend, CRM vendor or package dependency is required by this decision.

### 21. Migration, rollout, and upgrade risks

**Material concern: Yes. Severity: High; likelihood: High.** Guessing legacy ownership or label logic exposes private configuration or changes query meaning; mixed writers resurrect old semantics. **Effect:** requires staged convergence. **Permanent fix/exact language:** R22/R23/R27; explicit mapping/exceptions, versioned compatibility and fenced old writers. **Proof:** P21/P24/P35/P36/P42.

### 22. Testability, traceability, and proof

**Material concern: Yes. Severity: High; likelihood: High.** A screenshot, fixture cache or successful save toast can be misrepresented as complete privacy/persistence/cross-surface proof. **Effect:** requires exact release evidence. **Permanent fix/exact language:** R28 and P01–P44; source observations and document checks remain separate. **Proof:** P35–P44 and documentation validation.

### 23. Other development hazards

**Material concern: Yes. Severity: Medium; likelihood: Medium.** “Private” can be read as private conversations, “Shared” as all staff, or an empty view as no outstanding work. Hidden request scopes can revive these ambiguities. **Effect:** sharpens terminology and copy. **Permanent fix/exact language:** R02–R04/R09/R18/R28 and proposed glossary. **Proof:** P02/P04/P18/P37/P41/P44. No new money precision, financial schema, requester portal or legal retention mandate is introduced; existing owner boundaries were checked and preserved.

## Required proof groups

These **44 groups are required and unexecuted**. Each must assert domain/user outcomes, including negative and relevant boundary cases, against actual owning seams. Source/Markdown validation does not satisfy them.

| Proof | Required outcome                                                                                                                                                                                 | Clauses         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| P01   | Support uses qualified shared named-view/list machinery; other registered subjects and existing CRM private/default behavior remain correct.                                                     | R01/R12/R27     |
| P02   | First-time staff reach required queues and discover Views without pins or admin setup; My is understood as configuration.                                                                        | R03             |
| P03   | Identical names/criteria retain distinct stable IDs; active status follows selected ID/revision, never first filter match.                                                                       | R02/R15         |
| P04   | In full Support, opening a view replaces its complete visible query scope; CRM record history stays fixed until explicit full-workspace navigation.                                              | R04/R20         |
| P05   | Temporary modification marks Modified and Reset uses current eligible saved settings; no silent Shared write.                                                                                    | R04/R10         |
| P06   | Save captures reviewed inbox/filter/sort/columns; valid zero result succeeds, failed preview is not zero, lost response reconciles.                                                              | R05/R15         |
| P07   | Current search literal is visible/included by deliberate review; opt-out updates scope; Shared copy rechecks audience without body harvesting.                                                   | R05/R11/R19     |
| P08   | Me resolves actual current viewer membership; named people and Unassigned differ; re-invited same email inherits no identity.                                                                    | R08/R17         |
| P09   | New label Any/All and No labels semantics are explicit; unset/unknown/empty choices do not silently broaden.                                                                                     | R06/R08         |
| P10   | Result preview/rows/matching counts/pages agree beyond the old 2,000 cap; independently authorized facet options still allow adding alternatives under Any.                                      | R06/R13         |
| P11   | Commas, percent signs, parentheses, quotes, Unicode and literal wildcards round-trip through filters and page boundaries without SQL/string mutation.                                            | R13/R23         |
| P12   | Facets use complete authorized server scope; stale/capped/estimated/failed counts are truthful and never expose hidden members.                                                                  | R09/R13         |
| P13   | Rename B while A/modified filters are active changes only B metadata; criteria change requires B revision and explicit intent.                                                                   | R15             |
| P14   | Personal pin/unpin/reorder and layout persist cross-device without changing Shared definition or Support/CRM defaults.                                                                           | R12             |
| P15   | Definition save succeeds but pin save fails: show exact saved state and recover preference without duplicate definition.                                                                         | R05/R15/R25     |
| P16   | Concurrent saves/retries preserve one accepted revision and explicit conflict; changed-payload reuse conflicts, updates cannot create missing IDs, and old receipts cannot revive later archive. | R15/R22         |
| P17   | Out-of-order save/auto-pin/archive/restore cannot revive stale settings/pins across lifecycle generations; restore returns unpinned, and current actions stay on exact IDs.                      | R14–R16/R23     |
| P18   | Another tenant/member/ordinary curator cannot read/change My metadata, criteria, revisions, pins or counts via any path.                                                                         | R09/R22/R23     |
| P19   | Shared audience and maintenance are separate; ordinary personal-copy edits cannot affect Shared; archive/restore affects navigation honestly.                                                    | R09–R11/R16     |
| P20   | Hidden CRM predicate/sort/facet/count cannot infer protected facts; definition audience never grants source access.                                                                              | R09/R20         |
| P21   | Tenant/owner/subject/audience mass assignment, cross-tenant references, invalid states and privileged RPC misuse are denied.                                                                     | R22/R27         |
| P22   | USING/WITH CHECK semantics, grants, definer functions, service bypass and immutable actor/audit reject forbidden transformations.                                                                | R22             |
| P23   | Missing/deleted/forbidden targets produce safe Needs attention; no filter drop, same-name substitution or false zero.                                                                            | R18             |
| P24   | Offboarding, deleted teams/inboxes/labels and author removal preserve qualified Shared custody and never promote My definitions.                                                                 | R17/R18/R27     |
| P25   | URL/query/revision search literals cannot leak through logs/referrers/unauthorized history or be executed as SQL/HTML/template instructions.                                                     | R19/R23         |
| P26   | CRM record history retains D9 anchor; explicit Open in Support preserves return context and creates no CRM/contact/giving event.                                                                 | R20/R24         |
| P27   | D3 status and D14 any-underlying-overdue/uncertainty meaning hold through targets, waits, moves and current queries; no new Due soon.                                                            | R07/R21         |
| P28   | D15 Following initially All statuses; unrelated originals never enroll or alter Latest followed update. Explicit other current-root filters may legitimately change matches/order.               | R07/R21         |
| P29   | Revocation/redaction/expiry immediately removes forbidden matches, snippets, facets and caches even before physical cleanup.                                                                     | R19/R21/R23     |
| P30   | Merge/Undo roots dedupe once after current authorized source matches; related conversations stay independent.                                                                                    | R21             |
| P31   | Live updates cannot retarget selection/bulk commands; exact IDs are reauthorized and a view never supplies an implicit mass-action audience.                                                     | R14/R24         |
| P32   | Conflict, invalid, service failure and ownerless Shared exceptions have honest statuses and normal scoped repair; logs contain no raw criteria.                                                  | R18/R25         |
| P33   | Save/Open/Pin/Share/Archive/Restore produces no P17 publication, P6 send, Resend call, follow, notification subscription or business mutation.                                                   | R24             |
| P34   | At/below/above exact Support profile budgets, production-shaped tenant skew/query depth/rows/catalog size preserve bounded complete queries.                                                     | R13/R26         |
| P35   | Additive shared-subject rollout preserves gift-history/CRM callers; old Support writes cannot bypass ownership, schema or revisions.                                                             | R01/R27         |
| P36   | Legacy owner/inbox/ANY-ALL/flat/layout/default-baseline ambiguity is reconciled; changed system defaults preserve saved meaning, and migration replay creates one mapped definition.             | R27             |
| P37   | Keyboard/screen reader/semantic table/aria-sort/focus-return and non-color states complete discovery, save, modify and repair.                                                                   | R03–R05/R14     |
| P38   | Mobile/44px touch/reflow/zoom/long translated labels/IME/RTL support all normal actions without hover dependence.                                                                                | R03/R05/R28     |
| P39   | Back/forward/reload and cross-device preferences preserve exact view identity/query without private state leakage or draft loss.                                                                 | R04/R12/R23     |
| P40   | Low bandwidth/outage/in-flight scope change preserves safe edits and truthful pending state; no stale disclosure on reconnect.                                                                   | R15/R23/R25     |
| P41   | Representative staff/maintainers can explain My vs Shared, pin vs definition, temporary vs saved changes, scope and no data-access grant; correct observed errors.                               | R03–R12         |
| P42   | Config/previous revision retention, required audit and backup restore obey actual owner restrictions; no resurrection via defaults/local storage.                                                | R16/R19/R23/R27 |
| P43   | Query latency/error/count budgets, missing scheduling/capacity evidence and repair controls are measured with explicit units and owner response.                                                 | R25/R26         |
| P44   | Selection→clauses→ADR/glossary→later authorized spec/tasks/tickets→tests/release trace is complete with no implementation proof fabricated.                                                      | R28             |

## Operational controls

Safety and query correctness are activation gates, not monitor-only risks. Controls below apply after those gates; they carry bounded explicit thresholds without inventing a universal workload benchmark.

| Control | Signal and threshold                                                                                                                | Accountable owner                                                             | Response                                                                                                                                                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O01     | Any confirmed cross-tenant/personal-definition/predicate disclosure or unauthorized shared mutation.                                | Platform security plus named-view owner.                                      | Stop affected positive/read paths, enforce current source restrictions, preserve minimized evidence and require corrected proof before reactivation.                      |
| O02     | Any confirmed complete-query mismatch, silently dropped predicate or missing result due to pre-pagination cap.                      | Shared list/query owner with Support owner.                                   | Disable affected unsafe query shape, display unavailable rather than wrong results, repair/reconcile and rerun P09–P13.                                                   |
| O03     | An active Shared view has no currently eligible maintainer.                                                                         | Tenant Support configuration owner.                                           | One source-owned maintenance exception; appoint an independently qualified maintainer or archive, without granting new record access or auto-publishing personal content. |
| O04     | Any persisted definition differs from the acknowledged normalized revision after save/reopen, or a rename changes criteria.         | Named-view owner.                                                             | Reconcile command/revision evidence, prevent affected writes and restore through current qualified correction; do not overwrite another user's work.                      |
| O05     | Query/payload/catalog request exceeds the exact registered Support profile budget, or required capacity/budget evidence is missing. | Shared query operations owner.                                                | Cancel/limit through qualified controls, show explicit failure, investigate plans/tenant load; block activation without published values/units/profile proof.             |
| O06     | Any failed config/audit disposal or restore barrier; an obligation passes its actual owner deadline.                                | Configuration/records owner plus platform operations.                         | Keep restricted content unavailable, retry scoped cleanup/reconciliation, record actual residual custody and stop restoration paths that ignore negative controls.        |
| O07     | Same saved definition has two confirmed same-cause usability/invalid-reference repair incidents within 7 elapsed days.              | Shared maintainer or My owner, with Support product owner for systemic cause. | Review the definition/control copy or underlying schema issue; correct or deliberately retire it. No automatic unused-view deletion or user leaderboard.                  |

## Ruthless synthesis and dependency order

**Resolved before recording:** A uses the platform capability; Shared activation is Support-specific; stored typed nesting and complete queries remain governing. The UI exposes explicit saved identity, temporary criteria, audience and personal preferences. Rename cannot write route filters. ANY/ALL is deliberate. CRM/Email Studio/source boundaries and no-data-access-grant remain precise. These are decisions here, not vague future design tasks.

**Capture in later authorized specification/design:** R01–R28, full UX/data grammar and ownership, shared-subject contracts, current predicate catalog, registry budgets, legacy reconciliation and all acceptance cases. The raw older Support scaffold and P9 CRM-specific private/default rules must not silently override the explicit Support adaptation. Keep platform reuse and exact subject scope traceable without rewriting unrelated CRM work.

**Require before activation:** shared named-view subject/storage/query qualification and trusted privacy first; then guarded persistence, pins/definitions/correction, full source projections and UX; then legacy migration/cutover, actual SQL/RLS/RPC/cache/concurrency/restore and production-shaped/accessibility/user proof. P01–P44 are release gates. The numeric profile must be concrete and tested in that implementation, not deferred as an undefined performance promise.

**Monitor after proof:** O01–O07 with their actual named ownership roles/thresholds/responses. No evidence of a universal ministry staffing pattern, optimum total view count or measured productivity gain is asserted. No new provider or workflow platform is necessary.

**Final disposition: Accept with required amendments.** Record this complete corrected package pending ratification, preserve D1–D19 and remain on D20. No Q21 is advanced in this review.

## Founder ratification — 12 September 2026

> Yes, I ratify this, including all the amendments, additions, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session. Make sure the seam and role of the email studio is well documented.

The founder fully ratifies **A — My views plus curated shared views** and every adopted amendment, addition, adjustment, change and update in the complete D20 package. Acceptance includes the exact corrected decision, **D20-R01–R28**, all **23 individual category findings** and their impact/severity/likelihood/evidence/decision effects/permanent fixes, the complete UX and data/query/lifecycle/CRM contracts, all primary-source qualifications and adopted independent corrections, **four glossary definitions**, **P01–P44**, and **O01–O07** with their source signals, thresholds, accountable owners and responses. The original substantive record is preserved in full above and in its linked companion artifacts; this ratification does not replace it with a summary.

### Shared capability and scope

Support registers its conversation subject, permitted predicates and actual Support capabilities in Core's qualified shared named-view/list/preference machinery, as required by Phase9 A14/B11 and the roadmap. Retire the conflicting standalone Support saved-view writer/store through qualified migration. No permanent dual ownership, synchronization engine, second CRM or generic workflow platform is accepted. Existing personal gift-history infrastructure is a foundation to qualify, not proof that Shared Support views are already implemented or authorized. Directory placement cannot make Support require unrelated CRM read/write permission.

Preserve the platform's nested typed stored definition while keeping the ordinary Support filter UI shallow and understandable. Saved deltas bind an immutable/versioned default baseline or preserve an equivalent exact effective definition. A later default change cannot silently rewrite saved meaning. Phase9's private-now/reserved-sharing and first-pin-default constraints are reconciled by subject: qualified Shared activation is Support-specific, and Support pins remain shortcuts without changing startup behavior. Existing CRM kind-route/default behavior is preserved.

### Full discovery and editing journey

The always-discoverable Views picker exposes Pinned, My and authorized Shared entries while required queues remain available. No permanent wall of every shared chip or audience-wide automatic pinning. Save uses the reviewed current visible criteria; My is the default destination. Current search text is explicitly shown and included by default when present, with a visible opt-out and updated preview. No hidden ambient inbox/state is saved. Creator-only initial pinning is a separate preference effect: save success survives a pin failure, and recovery retries only the failed preference.

Saved definition, current Modified query, selected identity/revision and personal pins/order are distinct. Temporary filtering never edits a Shared definition. Reset restores the current eligible saved definition; Save My copy creates an independent identity; qualified Shared maintenance saves deliberately without an Email Studio publication workflow. Rename changes metadata only. Editing view B loads B's definition instead of accidentally saving current view A's route filters. Stable identity, not name or equal predicates, identifies the active view. Human-name collision handling does not leak another person's private configuration.

### Query meaning and truthful results

Across facets use AND, within selected values use OR unless an explicit operator says otherwise. Labels expose Any selected, All selected and No labels; Any selected is the new default, while contradictory legacy ANY/EVERY meaning requires reviewed reconciliation. Me resolves through trusted current tenant/principal/profile context, not creator, email or arbitrary membership. Named people use stable identity. All accessible inboxes is explicitly dynamic; selected inboxes preserve selected IDs.

Renames preserve reference identity. Missing, deleted or forbidden required references become truthful unavailable/needs-attention states instead of dropping predicates, broadening results or displaying false zero. A retired reference remains usable only if its owner preserves its meaning. Apply the complete authorized parameterized query before limits, counts and keyset pagination, with a stable identity tie-break; remove the current pre-filter 2,000-row cap behavior. Rows, preview and associated matching count use the same effective predicate. Facet options use their separately qualified catalog/contextual population, not only the loaded page or current matches. Avoid per-option and every-custom-view count badges by default.

Time-dependent rows and associated counts share one trusted server-sampled evaluation instant. D14 owns target truth; the client clock does not. Reply due ordering uses the accepted primary cue, confirmed-overdue priority within a row, otherwise earliest known/candidate obligation, then stable continuing identity. Unknown/uncomputable/untargeted values remain distinct and last; never substitute zero or now. Overdue predicates evaluate all applicable periods, not only the displayed cue. No new Due soon semantic is implied.

D15 Following keeps its initial All statuses/Latest followed update semantics and original source scope. Unrelated sources do not enroll a person or change Latest followed update, although another explicit current-root filter can legitimately change results. D10 continuing-conversation deduplication precedes count/page; D12 related conversations remain independent. D16/D17 removed/expired content and D19-held intake remain restricted. Saved queries are current authorized views, not historical reporting cohorts or retained result snapshots.

### Authority, lifecycle and correction

Definition audience, maintainer capability, disclosure of predicate/field context and current record authorization are separate. My remains private to its qualified owner; ordinary curators cannot inspect other personal definitions. Shared does not default to everybody in a tenant. Tenant, actual actor/profile, current membership and trusted attribution derive from server context. Tenant-aware relationships and all relevant grants, RLS USING/WITH CHECK, RPC/view/service/storage/cache/export/audit/restore paths must enforce the same boundaries; broad existing Support RLS is not sufficient proof.

Mutations guard exact identity/revision and durable idempotency. Update is not create; changed payload with the same command identity conflicts. A retried command returns its original receipt and current state separately, so an old success cannot resurrect an archived view. Archive ends active availability and old pin applicability. Restore returns to the eligible catalog unpinned, including for its creator. Lifecycle generations/receipt guards prevent late old Pin or creator-auto-pin commands from surviving Archive→Restore. Persistent Archived views and qualified previous-settings correction are available while policy permits; correction creates a current eligible successor, not an unqualified rewind. Shared custody survives creator departure. My never auto-publishes or transfers through email reuse. Missing the last eligible maintainer produces the accepted O03 repair/retire obligation.

Current queries do not silently retarget an opened conversation, draft or explicit selected action IDs. Quiet Results changed/Refresh behavior preserves place while current authorization remains authoritative. Cache/query state is qualified by tenant, principal, acting scope, subject, definition revision, lifecycle and effective query. Logout behavior alone does not prove same-user tenant switches, revocation or late in-flight safety. Sensitive free-text/private URL literals use bounded authenticated shared query-state references with owner-private default; they are not bearer grants, a separate state platform or permission to disclose a private definition. Invalid, expired or forbidden references become unavailable rather than All conversations. Support route/query/sort/cursor serialization preserves other subjects.

### CRM, retention and performance

D9's CRM record anchor stays fixed until deliberate Open in Support Hub with preserved return context. Reuse the same view capability without a duplicate My/Shared catalog per CRM record. No arbitrary financial/care segmentation, CRM identity creation, copied authoritative facts, contact history, recipient changes, follows, assignment or domain mutation follows from view activity. Each business owner authorizes and records its own action; resolving Support does not complete that action.

Configuration names, criteria, revisions, personal preferences and query state can themselves be sensitive. Known source-derived fragments keep D16/D17 restrictions; independently authored criteria have their own bounded configuration purpose. Owners qualify finite retention, audit, cache/query-state and restore behavior before activation. No per-view duration setting, speculative unused-view deletion, unlimited retention assumption or PII-scanner guarantee is accepted.

Publish and verify a finite Support subject budget profile for supported fields, nodes/depth, selected values, text/name sizes, page size, query duration and related cache/execution limits before activation. Do not invent a universal numeric saved-view quota, vendor-derived performance guarantee or measured usability improvement. Additive migration preserves owner, scope, baseline and exact criteria meaning or routes ambiguity to bounded owned reconciliation. Fence old writers, prevent automatic personal-to-shared publication, use idempotent mapping and preserve roll-forward/restore barriers. No new code is claimed by these accepted requirements.

### Explicit Email Studio role

The [Email Studio integration addendum](phase26-d20-email-studio-integration.md) and [independent seam review](phase26-d20-email-studio-seam-review.md) fully document the accepted ownership boundary. Ordinary Save/Open/Pin/Share/Rename/Archive/Restore operations have no communication or publication effect. View definition audiences never become recipients or mass-mail lists. My/Shared views are configuration, not D18 Email Studio My/Shared wording. Their maintainer and publisher permissions remain distinct.

When a person opens a conversation through a view, actual external replies retain D4/D18/P17 ready preparation, Support's atomic source admission, and Phase6 delivery/evidence using the tenant's qualified Resend connection. Internal notes remain non-deliverable. View archive/revision changes do not themselves cancel a valid draft or admitted intent; actual source/message guards still apply. Views cannot restart D13 confirmations or release D19-held intake. No unused email template, direct sender, provider template mirror or global fallback is introduced.

The separate O03 failed-maintenance obligation can, when qualified, use source-owned role-safe P17 presentation and P6 local in-product available attention with prepared.none@1, without provider artifacts or Resend. This clarifies the existing exception without adding routine edit notifications or a new decision. Source repair/retirement ends the obligation; reading attention is not repair. Each configuration/source/draft/preparation/delivery/audit lifetime remains independently governed.

### Status, evidence and next step

**Accept with required amendments** remains the historical adversarial disposition; all adopted amendments are now fully accepted. Historical proposed/pending/no-Q21 wording in preserved substantive blocks describes the earlier stage and is superseded as to acceptance and advancement only. D1–D19 remain fully ratified and unchanged. Do not request repeat D20 approval. Continue with the next single researched question, genuine options and one recommendation.

The [ratification and Q21 validation](d20-ratification-q21-validation.json) records current acceptance separately from the unchanged historical D20 validation and 16 source pointer/hash observations. All 44 required runtime/database/query/concurrency/migration/restore/capacity/browser/accessibility/staff proof groups remain required and unexecuted. Ratification authorizes grooming direction and continued interview, not formal specification, implementation, tickets, GitHub/provider/DNS/credential changes or real messages.
