## Purpose

Provide visual, conventional source and mixed website authoring through one canonical CMS and its existing publication, identity and safety owners.

<!-- Generated from docs/prds/web-studio-hybrid/contracts/requirements.json. Keep IDs and all paired scenarios. -->

## ADDED Requirements

### Requirement: HW-001 Hybrid scope and editorial independence

Web Studio SHALL support visual-first, code-first and mixed authoring over one canonical content and publication system. A standard site and ordinary supported CMS edits SHALL require neither a custom repository nor developer involvement. An embedded IDE, hosted AI and arbitrary customer server execution are not prerequisites.

#### Scenario: HW-001-A — Expected journey

- **GIVEN** a standard qualified presentation
- **WHEN** a permitted editor creates a Page
- **THEN** creation, preview and publication are possible without GitHub

#### Scenario: HW-001-B — Adverse or boundary journey

- **GIVEN** GitHub is unavailable
- **WHEN** an editor saves supported content against an admitted presentation
- **THEN** the content path does not call GitHub or fail solely because of that outage

### Requirement: HW-002 Explicit amendments and evidence status

This capability SHALL preserve existing owners and distinguish verified code from unmerged intent. HA-A1 through HA-A4 SHALL be recorded as explicit later-phase planning amendments before incompatible behavior is implemented. Document completion SHALL NOT claim Built, Live, Confirmed or a passed runtime qualification.

#### Scenario: HW-002-A — Expected journey

- **GIVEN** an approved hybrid direction and unmerged Phase 23 contracts
- **WHEN** the change is adopted
- **THEN** affected owner decisions and scenarios are reconciled with exact source versions

#### Scenario: HW-002-B — Adverse or boundary journey

- **GIVEN** a prototype conflicts with a frozen requirement
- **WHEN** an implementer considers the prototype convenient
- **THEN** the conflict is resolved explicitly, not silently copied into production

### Requirement: HW-003 Coherent software qualification

Production admission SHALL use one exact coherent qualified Payload/Next/React/toolchain cohort consistent with the governing major-line decision. Puck SHALL be pinned only after integration qualification. An internal pin, current stable v3, or vendor feature page SHALL NOT substitute for required v4 evidence or authorize an implicit downgrade.

#### Scenario: HW-003-A — Expected journey

- **GIVEN** a candidate supported cohort
- **WHEN** qualification exercises editor, transactions and public behavior
- **THEN** exact versions, source and outcomes are retained

#### Scenario: HW-003-B — Adverse or boundary journey

- **GIVEN** the candidate cannot satisfy required engine semantics
- **WHEN** release is requested
- **THEN** the dependent capability stays unavailable without raw-admin or alternate-major fallback

### Requirement: HW-004 One physical write transaction

Acknowledged editorial save SHALL atomically commit its content, source revision, current lease/authority proof, receipt and any required dispatch intent in one qualified physical database transaction. Separate provider/API requests SHALL NOT be represented as atomic merely because they share an identifier.

#### Scenario: HW-004-A — Expected journey

- **GIVEN** an authorized save with valid revision
- **WHEN** content and receipt writes complete
- **THEN** one transaction acknowledges the exact new revision

#### Scenario: HW-004-B — Adverse or boundary journey

- **GIVEN** the receipt write fails after a content write in the transaction
- **WHEN** the transaction finishes
- **THEN** all required writes roll back and Saved is not displayed

### Requirement: HW-005 Stable semantic catalog identity

Every node SHALL use stable identity, exact semantic type and schema version. A single canonical versioned catalog SHALL supply compatible editor fields, public decoders, standard rendering and migration meaning. Unsupported fields and types SHALL not be silently dropped or inferred from filenames.

#### Scenario: HW-005-A — Expected journey

- **GIVEN** a known component file is renamed
- **WHEN** its stable registered identity is unchanged
- **THEN** existing Pages keep their editable bindings

#### Scenario: HW-005-B — Adverse or boundary journey

- **GIVEN** unknown semantic content arrives
- **WHEN** a decoder processes the Page
- **THEN** it returns a repairable incompatibility without silently omitting the node

### Requirement: HW-006 Bounded composition successor

Ordinary Page composition v2 SHALL follow the exact Stack/Split/Grid grammar and finite settings in ux-and-composition.md, with two container levels, stable reading order and explicit admission limits. Articles and v1 Pages SHALL retain their qualified grammar. No arbitrary CSS, coordinates, script, viewport property bag or recursive layout is accepted.

#### Scenario: HW-006-A — Expected journey

- **GIVEN** a v2 Page and permitted split layout
- **WHEN** an editor composes valid slots
- **THEN** the server accepts it and the standard renderer preserves reading order

#### Scenario: HW-006-B — Adverse or boundary journey

- **GIVEN** a third container level or Article layout is submitted
- **WHEN** save validation runs
- **THEN** the command is rejected with the responsible node path and no data loss

### Requirement: HW-007 One visual data adapter

The visual editor SHALL project from and translate back to the canonical Asym document. Its internal data/state SHALL NOT be a second persistent document authority. Equivalent untouched content SHALL round-trip with stable identity and no field loss under a pinned adapter.

#### Scenario: HW-007-A — Expected journey

- **GIVEN** a canonical fixture with all supported node kinds
- **WHEN** the real pinned visual adapter loads and saves without edits
- **THEN** canonical equivalence and stable IDs are preserved

#### Scenario: HW-007-B — Adverse or boundary journey

- **GIVEN** an adapter omits a supported field
- **WHEN** round-trip conformance runs
- **THEN** qualification fails rather than migrating the loss into user documents

### Requirement: HW-008 Explicit source-to-content bindings

Presentation manifests SHALL declare stable renderer keys, semantic versions, finite setting schemas and binding metadata. Developers SHALL preserve CMS-controlled values or declare an explicit compatibility change. Structural prop acceptance alone SHALL NOT be treated as proof of visible content control.

#### Scenario: HW-008-A — Expected journey

- **GIVEN** a custom hero consumes its declared headline
- **WHEN** staff change that field after a design update
- **THEN** the actual rendered headline changes

#### Scenario: HW-008-B — Adverse or boundary journey

- **GIVEN** a developer hardcodes that value
- **WHEN** binding conformance and review run
- **THEN** the broken control is diagnosed and the package cannot be admitted as compatible

### Requirement: HW-009 Standard fallback and historical portability

Every admitted semantic/layout version SHALL have a qualified standard rendering path. Missing custom implementation SHALL follow explicit owner-qualified fallback or narrow unavailability, never silently lose content. Historical schema transformation SHALL not mutate stored history on read.

#### Scenario: HW-009-A — Expected journey

- **GIVEN** a current document has a standard compatible renderer
- **WHEN** a custom candidate is unavailable
- **THEN** content remains inspectable through its qualified standard path

#### Scenario: HW-009-B — Adverse or boundary journey

- **GIVEN** no renderer supports the document version
- **WHEN** publication is attempted
- **THEN** activation is blocked with compatibility repair rather than stripping content

### Requirement: HW-010 Acknowledged saves and bounded recovery

The editor SHALL expose Unsaved, Saving, Saved and owner-caused failure truthfully. Save now and keyboard save SHALL flush without publication. Lost acknowledgement SHALL reuse the original idempotency identity or read its receipt before any successor write.

#### Scenario: HW-010-A — Expected journey

- **GIVEN** a valid local edit
- **WHEN** the exact save receipt returns
- **THEN** Saved identifies the acknowledged revision

#### Scenario: HW-010-B — Adverse or boundary journey

- **GIVEN** the response is lost after commit
- **WHEN** the client reconnects
- **THEN** receipt/replay resolves the original effect once before another save

### Requirement: HW-011 Session-owned lease and compare-and-swap

Every D12 mutation SHALL prove the exact resource scope, editing session, current lease generation and expected revision. Same-user tabs are separate sessions. Takeover SHALL checkpoint and fence the displaced editor atomically; coordination SHALL NOT replace permission or CAS.

#### Scenario: HW-011-A — Expected journey

- **GIVEN** a second authorized session
- **WHEN** it opens an actively edited resource
- **THEN** it is read-only with permitted takeover guidance

#### Scenario: HW-011-B — Adverse or boundary journey

- **GIVEN** a displaced tab submits an old lease token
- **WHEN** the server processes it
- **THEN** the stale write is denied and unsent work remains available for comparison

### Requirement: HW-012 Draft validation distinct from publication readiness

Structurally safe incomplete content SHALL be retainable as a private draft with actionable diagnostics. Authorization, schema-boundary, executable-payload or scope violations SHALL be rejected. Readiness failures SHALL block the relevant release rather than make all intermediate editing impossible.

#### Scenario: HW-012-A — Expected journey

- **GIVEN** a valid empty layout or required text not yet entered
- **WHEN** the editor saves a work in progress
- **THEN** a private revision persists with completeness diagnostics

#### Scenario: HW-012-B — Adverse or boundary journey

- **GIVEN** a caller inserts arbitrary executable settings
- **WHEN** save is requested
- **THEN** the server rejects the unsafe structure rather than retaining it as an executable draft

### Requirement: HW-013 Usable visual composer with a non-drag path

The Asym composer SHALL provide outline, insertion, selection, movement, duplication, deletion, field inspection and finite layout controls. Every drag operation SHALL have keyboard and non-drag pointer equivalents with meaningful focus and announcements. Source identity SHALL survive reordering.

#### Scenario: HW-013-A — Expected journey

- **GIVEN** a keyboard or touch user
- **WHEN** they move a section using explicit controls
- **THEN** the same canonical order changes and focus remains on the moved item

#### Scenario: HW-013-B — Adverse or boundary journey

- **GIVEN** drag-and-drop is unavailable
- **WHEN** the user attempts page composition
- **THEN** all required insert/move/remove tasks remain possible

### Requirement: HW-014 Isolated composer and minimal bridge

The complete composer context SHALL run on the qualified isolated origin, receiving only admitted renderer code and the minimal authorized editorial projection. The trusted shell SHALL validate bridge source/origin/schema/nonce/scope and retain save/publication authority. Puck viewport isolation SHALL NOT be misrepresented as a security sandbox.

#### Scenario: HW-014-A — Expected journey

- **GIVEN** an authorized isolated composer
- **WHEN** it submits a valid bounded edit intent
- **THEN** the shell validates and sends the ordinary owner command

#### Scenario: HW-014-B — Adverse or boundary journey

- **GIVEN** an unknown origin or stale channel requests publication or broad data
- **WHEN** the bridge receives it
- **THEN** no privileged operation or disclosure occurs

### Requirement: HW-015 Safe click-to-edit metadata

Editor source mappings SHALL identify authorized document/node/field references, not privileged tokens or mutable filenames as identity. Mapping SHALL be absent from public responses when it would disclose private editing information. Unknown or stale mappings SHALL fail safely.

#### Scenario: HW-015-A — Expected journey

- **GIVEN** an admitted component has current field metadata
- **WHEN** an editor selects its text
- **THEN** the matching allowed field opens without navigation loss

#### Scenario: HW-015-B — Adverse or boundary journey

- **GIVEN** public output or a stale renderer references private editor context
- **WHEN** render/mapping checks run
- **THEN** private metadata is excluded and stale selection cannot target another resource

### Requirement: HW-016 Qualified media and links

Media and link controls SHALL use existing scoped identity/qualification services. Placements SHALL pin appropriate versions/renditions and preserve usage-local alt/crop/locale meaning. A caller-entered URL or cached selector result SHALL NOT bypass current rights, safety or destination authority.

#### Scenario: HW-016-A — Expected journey

- **GIVEN** qualified media for the selected Site
- **WHEN** an editor places it with usage metadata
- **THEN** preview and release bind the exact approved reference

#### Scenario: HW-016-B — Adverse or boundary journey

- **GIVEN** rights are withdrawn during review
- **WHEN** activation rechecks dependencies
- **THEN** the unsafe placement cannot become public even if the picker cache showed it

### Requirement: HW-017 Bounded reusable sections

Reusable content SHALL remain explicit, exact Site/locale/family-qualified and nonrecursive under the approved reuse contract. The hybrid grammar SHALL allow reusable references only at its defined root positions. Impact views SHALL state completeness and never authorize deletion from a stale count.

#### Scenario: HW-017-A — Expected journey

- **GIVEN** a compatible root reusable section
- **WHEN** an editor selects its acknowledged revision
- **THEN** the Page records an explicit reuse reference

#### Scenario: HW-017-B — Adverse or boundary journey

- **GIVEN** a cross-Site or nested recursive reference is attempted
- **WHEN** validation executes
- **THEN** it is denied and no silent copy or wider grant is created

### Requirement: HW-018 Exact independent locale lineages

Locale creation SHALL use the existing blank/copy-from exact revision operation with provenance and no ongoing synchronization. Public composition, source references and reviews SHALL request one exact locale without implicit language fallback. Source changes SHALL not overwrite translated work.

#### Scenario: HW-018-A — Expected journey

- **GIVEN** a translator starts from an exact source revision
- **WHEN** they edit the new private locale
- **THEN** its later saves and publication are independent

#### Scenario: HW-018-B — Adverse or boundary journey

- **GIVEN** the original locale changes or a translation is missing
- **WHEN** the target locale is rendered
- **THEN** no field fallback or automatic overwrite is introduced

### Requirement: HW-019 Separate appearance and content axes

Per-instance settings SHALL be finite compatible fields on their owning editorial axis. Site-wide appearance SHALL use its existing separate owner and cohort semantics. Editing one SHALL NOT implicitly change the other, routes, navigation, money or operational facts.

#### Scenario: HW-019-A — Expected journey

- **GIVEN** an editor changes a local variant
- **WHEN** they save the Page
- **THEN** only that declared Page setting changes

#### Scenario: HW-019-B — Adverse or boundary journey

- **GIVEN** a Site-wide brand draft changes
- **WHEN** a Page autosaves
- **THEN** the brand draft is not implicitly activated or overwritten

### Requirement: HW-020 Ministry-controlled source without supplier lock-in

Custom source SHALL be kept in a ministry-controlled conventional repository, with a supported project and maintainership/rights record. No Core fork, source-string CMS field or proprietary IDE state is required. Source control SHALL NOT imply ownership of dependencies or a standalone Asym platform.

#### Scenario: HW-020-A — Expected journey

- **GIVEN** a new qualified agency is appointed
- **WHEN** it uses the ministry project and documented SDK
- **THEN** it can develop without the previous supplier controlling the repository

#### Scenario: HW-020-B — Adverse or boundary journey

- **GIVEN** source export is requested
- **WHEN** the handoff is explained
- **THEN** actual source/assets/config rights and platform dependencies are distinguished

### Requirement: HW-021 Dual-domain verified repository connection

Repository binding SHALL require current Asym integration authority and verified GitHub installation/repository authorization. Posted installation IDs, matching email, GitHub membership or repository URL alone SHALL NOT grant Asym access. Provider authentication SHALL not create a second Asym human permission system.

#### Scenario: HW-021-A — Expected journey

- **GIVEN** an authorized ministry integration manager
- **WHEN** they complete verified selected-repository consent
- **THEN** only the intended scoped binding activates

#### Scenario: HW-021-B — Adverse or boundary journey

- **GIVEN** an attacker substitutes an installation ID or callback state
- **WHEN** connection completion runs
- **THEN** the binding is denied without repository disclosure

### Requirement: HW-022 Minimal provider permissions and stable binding

A binding SHALL record stable provider repository identity, exact Tenant/environment/project/package location, state and epoch. Provider tokens SHALL be narrowly scoped and kept outside untrusted build execution. Initial source integration SHALL not request source-write, secrets, issue-creation or repository-administration access.

#### Scenario: HW-022-A — Expected journey

- **GIVEN** a repository is renamed without ownership change
- **WHEN** reconciliation verifies identity
- **THEN** display metadata changes without creating a new project

#### Scenario: HW-022-B — Adverse or boundary journey

- **GIVEN** the App can see an unbound repository
- **WHEN** a request selects it without authorization
- **THEN** it remains unavailable to that Asym project

### Requirement: HW-023 Authenticated durable Git events

Git events SHALL validate raw-body signatures and schema, resolve known scoped bindings and persist accepted delivery identity/dispatch before acknowledgment. Delivery and business-effect deduplication SHALL be distinct; missed deliveries SHALL have bounded reconciliation.

#### Scenario: HW-023-A — Expected journey

- **GIVEN** a verified event for an active binding
- **WHEN** dispatch is temporarily down
- **THEN** the stored event is acknowledged and recovered later

#### Scenario: HW-023-B — Adverse or boundary journey

- **GIVEN** a duplicate or out-of-order event arrives after revocation
- **WHEN** the handler and worker process it
- **THEN** no duplicate effect or resurrected binding occurs

### Requirement: HW-024 Exact bounded source intake

Source selection SHALL resolve once to immutable commit/tree and byte digests under an approved root. Intake SHALL reject traversal/expansion hazards and unsupported external source dependencies. Credentials and credential-bearing Git metadata SHALL be removed before untrusted execution.

#### Scenario: HW-024-A — Expected journey

- **GIVEN** a verified exact source revision
- **WHEN** intake completes
- **THEN** the build receives bounded credential-free bytes with provenance

#### Scenario: HW-024-B — Adverse or boundary journey

- **GIVEN** source contains an escaping symlink or unsupported external submodule
- **WHEN** intake validates it
- **THEN** capture fails explicitly rather than fetching arbitrary bytes or silently omitting files

### Requirement: HW-025 First-class local and Git development

The developer project SHALL offer documented install/dev/test/build commands, exact SDK/toolchain requirements, synthetic fixtures and ordinary source history. The complete custom-source journey SHALL be possible using a supported external IDE and normal Git without Asym-hosted inference or IDE.

#### Scenario: HW-025-A — Expected journey

- **GIVEN** a developer has the supported toolchain
- **WHEN** they clone and follow documented commands
- **THEN** they can run, test and submit a compatible package

#### Scenario: HW-025-B — Adverse or boundary journey

- **GIVEN** no Asym browser IDE or AI credential exists
- **WHEN** they complete development
- **THEN** no mandatory feature blocks the Git delivery path

### Requirement: HW-026 Independent isolated clean builds

Qualification SHALL build exact captured source under an admitted frozen toolchain/dependency profile in isolated nonproduction execution. No production data, permanent provider token or serving-head authority is exposed. Mutable workspace output and customer-controlled CI SHALL not constitute independent approval.

#### Scenario: HW-026-A — Expected journey

- **GIVEN** source passes its own tests
- **WHEN** the platform builds and checks the exact capture
- **THEN** independent evidence binds the resulting artifact

#### Scenario: HW-026-B — Adverse or boundary journey

- **GIVEN** source modifies its tests to pass or runs a hostile install script
- **WHEN** the trusted pipeline qualifies it
- **THEN** independent checks and isolation remain effective

### Requirement: HW-027 Immutable admission and explicit first-party trust

An admitted package SHALL bind artifact/source digests, compatibility, settings/renderer manifest, dependencies/licenses, maintainer and qualified evidence. Admission SHALL be a distinct platform-owned decision. Signature, language types or test success alone SHALL not establish arbitrary-code safety.

#### Scenario: HW-027-A — Expected journey

- **GIVEN** complete evidence passes under a known policy
- **WHEN** the admission owner approves
- **THEN** an immutable verdict identifies exactly the admitted bytes

#### Scenario: HW-027-B — Adverse or boundary journey

- **GIVEN** repository administrators forge a passing status
- **WHEN** a Site attempts activation
- **THEN** the missing independent admission blocks it

### Requirement: HW-028 Separate server and editor builds

Public presentation SHALL preserve server-rendered essential content and the existing public view model; client editor configuration SHALL contain no server-only imports or authority. Editor and public builds SHALL prove compatible rendering/field bindings without forcing all public content into client rendering.

#### Scenario: HW-028-A — Expected journey

- **GIVEN** an admitted component has public and editor entrypoints
- **WHEN** both render the same contract fixture
- **THEN** content meaning and binding behavior agree

#### Scenario: HW-028-B — Adverse or boundary journey

- **GIVEN** client config imports a database or server secret module
- **WHEN** qualification examines the graph
- **THEN** the package fails admission

### Requirement: HW-029 Fixed complete authorized preview

An exact candidate SHALL seal complete deliberately selected inputs and reauthorize every preview request. It SHALL be private/no-store/noindex, side-effect-dark, candidate-local and complete-or-unavailable. Its identifier SHALL not grant access.

#### Scenario: HW-029-A — Expected journey

- **GIVEN** an authorized user reviews a sealed candidate
- **WHEN** they navigate its Pages and links
- **THEN** all output comes from the exact candidate closure

#### Scenario: HW-029-B — Adverse or boundary journey

- **GIVEN** a target is missing or access expires
- **WHEN** the request is made
- **THEN** it fails privately rather than falling through to Live or causing real side effects

### Requirement: HW-030 Newer work does not rewrite reviewed work

Later drafts or source commits SHALL not change an existing selected candidate. The UI SHALL identify excluded newer work and offer explicit successor preparation. Current safety/authority/cohort and required compatibility changes SHALL still be enforced before use and activation.

#### Scenario: HW-030-A — Expected journey

- **GIVEN** a candidate pins revision A
- **WHEN** an editor later saves revision B
- **THEN** review remains A with B visibly excluded

#### Scenario: HW-030-B — Adverse or boundary journey

- **GIVEN** candidate A loses required eligibility
- **WHEN** a publisher attempts release
- **THEN** the safety/authority failure blocks A notwithstanding its earlier approval

### Requirement: HW-031 Package availability distinct from activation

New executable presentation SHALL become available through the controlled managed runtime build/registry before dependent activation. Availability SHALL not make it public by itself. Required older renderers/assets SHALL remain available for active and retained generations.

#### Scenario: HW-031-A — Expected journey

- **GIVEN** a new admitted package is deployed into the registry
- **WHEN** no design activation occurs
- **THEN** current Sites retain their existing presentation

#### Scenario: HW-031-B — Adverse or boundary journey

- **GIVEN** a runtime lacks the selected required version
- **WHEN** activation is requested
- **THEN** readiness fails without substituting a different renderer

### Requirement: HW-032 Single ordinary public publication owner

Content/composition release SHALL use D1 with exact compatible selections, current authority/safety, expected-head compare-and-swap and a durable receipt. Normal content edits SHALL not require a new Core code build. Tenant editorial policies SHALL not be replaced by a new blanket manual approval.

#### Scenario: HW-032-A — Expected journey

- **GIVEN** an authorized compatible content edit
- **WHEN** the existing editorial policy permits publication
- **THEN** D1 activates one coherent successor without rebuilding application code

#### Scenario: HW-032-B — Adverse or boundary journey

- **GIVEN** two publishers race on the same expected head
- **WHEN** both attempt commit
- **THEN** only a valid winning transition commits; no mixed generation appears

### Requirement: HW-033 Complete-cohort design activation

Site presentation activation SHALL use D10 over every current public locale and qualified dispositions for enabled nonpublic locales. It SHALL reprove the exact cohort and expected heads and atomically change all required heads or none, without changing unrelated content or operational meaning.

#### Scenario: HW-033-A — Expected journey

- **GIVEN** all locale candidates are ready and current
- **WHEN** the design is activated
- **THEN** the exact complete cohort advances together

#### Scenario: HW-033-B — Adverse or boundary journey

- **GIVEN** a locale is enabled or a head changes during review
- **WHEN** activation runs
- **THEN** the stale cohort cannot partially activate

### Requirement: HW-034 Restore creates a new valid successor

Editorial restore SHALL create a private draft successor; design restore SHALL use the existing new-successor process over current compatible content and current safety. Neither SHALL rewind history, reset content to a development snapshot or automatically reinstate an unsafe artifact.

#### Scenario: HW-034-A — Expected journey

- **GIVEN** a prior compatible design is requested
- **WHEN** restore proof passes
- **THEN** a new current-content successor is activated with retained history

#### Scenario: HW-034-B — Adverse or boundary journey

- **GIVEN** the previous design is now safety-ineligible
- **WHEN** restore is attempted
- **THEN** it is refused without weakening the adverse rule

### Requirement: HW-035 Exact-revision scheduled operations

D13 appointments SHALL retain exact reviewed semantic intent, organization-owned authorization, civil/zone/offset/UTC data and generation-fenced lifecycle. Later autosaves SHALL remain excluded. Routine initiator offboarding SHALL not alone cancel organization intent; explicit invalidation SHALL prevent execution.

#### Scenario: HW-035-A — Expected journey

- **GIVEN** an appointment selects revision A
- **WHEN** revision B is saved and the initiator later leaves routinely
- **THEN** only authorized A may execute under current organization rules

#### Scenario: HW-035-B — Adverse or boundary journey

- **GIVEN** an appointment is canceled or its safety authority invalidated
- **WHEN** an old delayed event arrives
- **THEN** it has no favorable public effect

### Requirement: HW-036 One durable execution and scheduling substrate

Background work SHALL reuse shared product dispatch, claims and registered purpose-scoped workers. Identifier-only events SHALL not contain source/content/secrets. D13 SHALL retain the six-day handoff horizon and shared overdue recovery; Payload Jobs or per-Tenant schedulers SHALL not become publication authorities.

#### Scenario: HW-036-A — Expected journey

- **GIVEN** committed work awaits executor delivery
- **WHEN** the shared executor retries after its dedupe window
- **THEN** product receipt/claim still prevents duplicate effects

#### Scenario: HW-036-B — Adverse or boundary journey

- **GIVEN** a job requests full content or a secret in its envelope
- **WHEN** validation runs
- **THEN** dispatch is rejected before external transmission

### Requirement: HW-037 Versioned convergence and adverse priority

Derived cache/search/delivery state SHALL follow committed public generation receipts and current adverse rules. A delayed older event SHALL not restore withdrawn information. Convergence failure SHALL not undo an unrelated valid source write or imply source publication failed.

#### Scenario: HW-037-A — Expected journey

- **GIVEN** D1 commits but a derived projection lags
- **WHEN** staff inspect status
- **THEN** Published and convergence lag are distinct

#### Scenario: HW-037-B — Adverse or boundary journey

- **GIVEN** an old favorable update follows a current withdrawal
- **WHEN** a projection processes it
- **THEN** the adverse filter wins and forbidden content is not re-exposed

### Requirement: HW-038 Receipt-based retry and cancellation

Retryable effects SHALL have durable semantic identity and truthful accepted/running/succeeded/failed/canceled/unknown states where appropriate. Client or provider cancellation SHALL not be represented as undoing a committed effect. Unknown outcomes SHALL be reconciled before successor requests.

#### Scenario: HW-038-A — Expected journey

- **GIVEN** a worker response is lost after a durable effect
- **WHEN** recovery runs
- **THEN** the original receipt is resolved without duplication

#### Scenario: HW-038-B — Adverse or boundary journey

- **GIVEN** a user cancels after activation already committed
- **WHEN** the UI receives the authoritative outcome
- **THEN** it reports the completed effect and offers its actual owner recovery, not false cancellation

### Requirement: HW-039 Exact tenant and per-operation capabilities

Every product route, operation, bridge and worker SHALL derive current actor and scope from verified server context and enforce the owning capabilities. Role labels, GitHub membership and resource identifiers SHALL not widen access. Scope switches SHALL clear old-scope client state before rendering new data.

#### Scenario: HW-039-A — Expected journey

- **GIVEN** a permitted user has two Tenant assignments
- **WHEN** they deliberately select a scope
- **THEN** each tab/request binds its selected authorized scope

#### Scenario: HW-039-B — Adverse or boundary journey

- **GIVEN** caller input supplies another actor or Tenant grant
- **WHEN** the operation validates
- **THEN** it rejects the forged authority and leaks no existence

### Requirement: HW-040 Private Payload actor and service adapters

Human Payload operations SHALL pass the required exact actor/request/access/transaction context through the safe port, with access and editorial-lock bypass disabled. Registered service commands SHALL be narrower and independent. UI failure SHALL never reveal raw Payload Admin, accounts or APIs.

#### Scenario: HW-040-A — Expected journey

- **GIVEN** an authorized human content command
- **WHEN** the adapter invokes Payload
- **THEN** scoped access and lock/revision rules remain enforced

#### Scenario: HW-040-B — Adverse or boundary journey

- **GIVEN** the custom editor crashes or a direct provider URL is guessed
- **WHEN** the request is handled
- **THEN** only a safe product state appears; no provider fallback grants access

### Requirement: HW-041 Structural database integrity

Operational integration records SHALL use immutable trusted scope/attribution, same-scope keys, explicit legal states, appropriate uniqueness and noncascading retention. Exposed tables SHALL enforce both USING and WITH CHECK through tested grants/RLS. Private adapters SHALL not create parallel permission semantics.

#### Scenario: HW-041-A — Expected journey

- **GIVEN** a legitimate scoped relationship is written
- **WHEN** database and owner checks run
- **THEN** only the valid same-scope relationship commits

#### Scenario: HW-041-B — Adverse or boundary journey

- **GIVEN** an allowed row is updated into another Tenant or with forged ownership
- **WHEN** restricted-role SQL/API executes
- **THEN** constraints/policy deny the transformation

### Requirement: HW-042 Controlled integration disconnection and replacement

Disconnection/repository control changes SHALL fence new dependent source work and require re-verification to reconnect. Routine provider outage SHALL not be treated as deletion. Retained licensed compatible safe artifacts SHALL continue ordinary CMS operation under existing owner policies.

#### Scenario: HW-042-A — Expected journey

- **GIVEN** the ministry replaces its developer or source binding
- **WHEN** new verified binding is prepared before switch
- **THEN** source history and ongoing editorial content are preserved

#### Scenario: HW-042-B — Adverse or boundary journey

- **GIVEN** a stale event arrives after disconnection
- **WHEN** it requests build or activation
- **THEN** the old binding cannot regain authority

### Requirement: HW-043 Explicit safe migrations

Catalog/schema/settings changes SHALL use an owner-approved no-write plan and fresh authorized commit to private successors where needed. Current content SHALL not be replaced by development snapshots. Mixed-version readers/writers, partial backfills and rollback/roll-forward SHALL have tested outcomes.

#### Scenario: HW-043-A — Expected journey

- **GIVEN** a reviewed property migration is required
- **WHEN** the approved plan commits against expected revisions
- **THEN** private compatible successors preserve original history

#### Scenario: HW-043-B — Adverse or boundary journey

- **GIVEN** an editor changes a row after migration planning
- **WHEN** commit rechecks inputs
- **THEN** that conflict is surfaced rather than overwriting the edit

### Requirement: HW-044 Bounded resources and privacy-safe evidence

Intake, build, preview, editing and public rendering SHALL use a qualified numeric profile with fairness, backpressure and hard resource limits. Observability SHALL record safe identity/cause/outcome/timing without source, content, secrets or restricted facts in generic telemetry.

#### Scenario: HW-044-A — Expected journey

- **GIVEN** several tenants submit valid bounded builds
- **WHEN** capacity is exercised
- **THEN** fair queues and limits preserve unrelated safe service

#### Scenario: HW-044-B — Adverse or boundary journey

- **GIVEN** an oversized source or runaway script appears
- **WHEN** limits are reached
- **THEN** it is contained and diagnosed without leaking content or starving other tenants

### Requirement: HW-045 Retained artifacts and preview expiry

Expiry SHALL revoke preview access and disposable compute without deleting acknowledged source/content or required receipts. Artifact/media removal SHALL require complete current use, rights and retention evidence; age alone SHALL not authorize purge of admitted versions.

#### Scenario: HW-045-A — Expected journey

- **GIVEN** a preview expires
- **WHEN** cleanup executes
- **THEN** private access stops while required editorial/release state survives

#### Scenario: HW-045-B — Adverse or boundary journey

- **GIVEN** a supposedly unused artifact has incomplete use evidence
- **WHEN** cleanup considers removal
- **THEN** purge is blocked rather than trusting a stale zero count

### Requirement: HW-046 External coding-agent optionality

External agents MAY assist within the developer’s permitted project and provider arrangements. Their instructions SHALL not grant Asym authority, disclose restricted context or bypass independent admission. No hosted model account or agent session is required for this release.

#### Scenario: HW-046-A — Expected journey

- **GIVEN** a developer uses an external agent on synthetic fixtures
- **WHEN** it submits source through Git
- **THEN** the normal tests and admission apply

#### Scenario: HW-046-B — Adverse or boundary journey

- **GIVEN** generated code requests publication or operational secrets
- **WHEN** the product boundary evaluates it
- **THEN** the request is denied regardless of agent instructions

### Requirement: HW-047 Proven staff and developer handoff

Release acceptance SHALL demonstrate that staff can perform the agreed visual/content tasks after custom source changes and that a replacement developer can operate the supported project. Instructions SHALL identify maintenance, rights, safe previews, compatibility and source/config/content export limits.

#### Scenario: HW-047-A — Expected journey

- **GIVEN** a nontechnical staff participant receives the site
- **WHEN** they create a Page and update content after a custom redesign
- **THEN** the declared tasks succeed without code or developer intervention

#### Scenario: HW-047-B — Adverse or boundary journey

- **GIVEN** a new developer has only the authorized project and docs
- **WHEN** they set it up
- **THEN** no internal Core source or hidden privileged credential is required

### Requirement: HW-048 Independent complete release evidence

Acceptance SHALL include owner-level contract tests, real database/authorization/concurrency, actual pinned editor adapter, real browser/SSR/preview, source/build security, migration, accessibility and production-shaped capacity tests. Structural document tests SHALL not be reported as implementation or provider proof.

#### Scenario: HW-048-A — Expected journey

- **GIVEN** all required implementation proofs pass with exact versions
- **WHEN** release review evaluates evidence
- **THEN** only the proven profile is activated

#### Scenario: HW-048-B — Adverse or boundary journey

- **GIVEN** a mandatory provider, migration or real-browser test is skipped
- **WHEN** release is evaluated
- **THEN** the dependent capability remains unqualified and the omission is not renamed a pass
