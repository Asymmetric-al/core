<a id="web-test-matrix"></a>

# Acceptance scenarios

Generated from [requirements.json](contracts/requirements.json). Implementation evidence remains open. Each requirement retains its A and B scenarios; checkpoint closure additionally obeys [the implementation plan](implementation-plan.md).

## HW-001 — Hybrid scope and editorial independence

### HW-001-A — Expected journey

- **Given:** a standard qualified presentation
- **When:** a permitted editor creates a Page
- **Then:** creation, preview and publication are possible without GitHub

### HW-001-B — Adverse or boundary journey

- **Given:** GitHub is unavailable
- **When:** an editor saves supported content against an admitted presentation
- **Then:** the content path does not call GitHub or fail solely because of that outage

## HW-002 — Explicit amendments and evidence status

### HW-002-A — Expected journey

- **Given:** an approved hybrid direction and unmerged Phase 23 contracts
- **When:** the change is adopted
- **Then:** affected owner decisions and scenarios are reconciled with exact source versions

### HW-002-B — Adverse or boundary journey

- **Given:** a prototype conflicts with a frozen requirement
- **When:** an implementer considers the prototype convenient
- **Then:** the conflict is resolved explicitly, not silently copied into production

## HW-003 — Coherent software qualification

### HW-003-A — Expected journey

- **Given:** a candidate supported cohort
- **When:** qualification exercises editor, transactions and public behavior
- **Then:** exact versions, source and outcomes are retained

### HW-003-B — Adverse or boundary journey

- **Given:** the candidate cannot satisfy required engine semantics
- **When:** release is requested
- **Then:** the dependent capability stays unavailable without raw-admin or alternate-major fallback

## HW-004 — One physical write transaction

### HW-004-A — Expected journey

- **Given:** an authorized save with valid revision
- **When:** content and receipt writes complete
- **Then:** one transaction acknowledges the exact new revision

### HW-004-B — Adverse or boundary journey

- **Given:** the receipt write fails after a content write in the transaction
- **When:** the transaction finishes
- **Then:** all required writes roll back and Saved is not displayed

## HW-005 — Stable semantic catalog identity

### HW-005-A — Expected journey

- **Given:** a known component file is renamed
- **When:** its stable registered identity is unchanged
- **Then:** existing Pages keep their editable bindings

### HW-005-B — Adverse or boundary journey

- **Given:** unknown semantic content arrives
- **When:** a decoder processes the Page
- **Then:** it returns a repairable incompatibility without silently omitting the node

## HW-006 — Bounded composition successor

### HW-006-A — Expected journey

- **Given:** a v2 Page and permitted split layout
- **When:** an editor composes valid slots
- **Then:** the server accepts it and the standard renderer preserves reading order

### HW-006-B — Adverse or boundary journey

- **Given:** a third container level or Article layout is submitted
- **When:** save validation runs
- **Then:** the command is rejected with the responsible node path and no data loss

## HW-007 — One visual data adapter

### HW-007-A — Expected journey

- **Given:** a canonical fixture with all supported node kinds
- **When:** the real pinned visual adapter loads and saves without edits
- **Then:** canonical equivalence and stable IDs are preserved

### HW-007-B — Adverse or boundary journey

- **Given:** an adapter omits a supported field
- **When:** round-trip conformance runs
- **Then:** qualification fails rather than migrating the loss into user documents

## HW-008 — Explicit source-to-content bindings

### HW-008-A — Expected journey

- **Given:** a custom hero consumes its declared headline
- **When:** staff change that field after a design update
- **Then:** the actual rendered headline changes

### HW-008-B — Adverse or boundary journey

- **Given:** a developer hardcodes that value
- **When:** binding conformance and review run
- **Then:** the broken control is diagnosed and the package cannot be admitted as compatible

## HW-009 — Standard fallback and historical portability

### HW-009-A — Expected journey

- **Given:** a current document has a standard compatible renderer
- **When:** a custom candidate is unavailable
- **Then:** content remains inspectable through its qualified standard path

### HW-009-B — Adverse or boundary journey

- **Given:** no renderer supports the document version
- **When:** publication is attempted
- **Then:** activation is blocked with compatibility repair rather than stripping content

## HW-010 — Acknowledged saves and bounded recovery

### HW-010-A — Expected journey

- **Given:** a valid local edit
- **When:** the exact save receipt returns
- **Then:** Saved identifies the acknowledged revision

### HW-010-B — Adverse or boundary journey

- **Given:** the response is lost after commit
- **When:** the client reconnects
- **Then:** receipt/replay resolves the original effect once before another save

## HW-011 — Session-owned lease and compare-and-swap

### HW-011-A — Expected journey

- **Given:** a second authorized session
- **When:** it opens an actively edited resource
- **Then:** it is read-only with permitted takeover guidance

### HW-011-B — Adverse or boundary journey

- **Given:** a displaced tab submits an old lease token
- **When:** the server processes it
- **Then:** the stale write is denied and unsent work remains available for comparison

## HW-012 — Draft validation distinct from publication readiness

### HW-012-A — Expected journey

- **Given:** a valid empty layout or required text not yet entered
- **When:** the editor saves a work in progress
- **Then:** a private revision persists with completeness diagnostics

### HW-012-B — Adverse or boundary journey

- **Given:** a caller inserts arbitrary executable settings
- **When:** save is requested
- **Then:** the server rejects the unsafe structure rather than retaining it as an executable draft

## HW-013 — Usable visual composer with a non-drag path

### HW-013-A — Expected journey

- **Given:** a keyboard or touch user
- **When:** they move a section using explicit controls
- **Then:** the same canonical order changes and focus remains on the moved item

### HW-013-B — Adverse or boundary journey

- **Given:** drag-and-drop is unavailable
- **When:** the user attempts page composition
- **Then:** all required insert/move/remove tasks remain possible

## HW-014 — Isolated composer and minimal bridge

### HW-014-A — Expected journey

- **Given:** an authorized isolated composer
- **When:** it submits a valid bounded edit intent
- **Then:** the shell validates and sends the ordinary owner command

### HW-014-B — Adverse or boundary journey

- **Given:** an unknown origin or stale channel requests publication or broad data
- **When:** the bridge receives it
- **Then:** no privileged operation or disclosure occurs

## HW-015 — Safe click-to-edit metadata

### HW-015-A — Expected journey

- **Given:** an admitted component has current field metadata
- **When:** an editor selects its text
- **Then:** the matching allowed field opens without navigation loss

### HW-015-B — Adverse or boundary journey

- **Given:** public output or a stale renderer references private editor context
- **When:** render/mapping checks run
- **Then:** private metadata is excluded and stale selection cannot target another resource

## HW-016 — Qualified media and links

### HW-016-A — Expected journey

- **Given:** qualified media for the selected Site
- **When:** an editor places it with usage metadata
- **Then:** preview and release bind the exact approved reference

### HW-016-B — Adverse or boundary journey

- **Given:** rights are withdrawn during review
- **When:** activation rechecks dependencies
- **Then:** the unsafe placement cannot become public even if the picker cache showed it

## HW-017 — Bounded reusable sections

### HW-017-A — Expected journey

- **Given:** a compatible root reusable section
- **When:** an editor selects its acknowledged revision
- **Then:** the Page records an explicit reuse reference

### HW-017-B — Adverse or boundary journey

- **Given:** a cross-Site or nested recursive reference is attempted
- **When:** validation executes
- **Then:** it is denied and no silent copy or wider grant is created

## HW-018 — Exact independent locale lineages

### HW-018-A — Expected journey

- **Given:** a translator starts from an exact source revision
- **When:** they edit the new private locale
- **Then:** its later saves and publication are independent

### HW-018-B — Adverse or boundary journey

- **Given:** the original locale changes or a translation is missing
- **When:** the target locale is rendered
- **Then:** no field fallback or automatic overwrite is introduced

## HW-019 — Separate appearance and content axes

### HW-019-A — Expected journey

- **Given:** an editor changes a local variant
- **When:** they save the Page
- **Then:** only that declared Page setting changes

### HW-019-B — Adverse or boundary journey

- **Given:** a Site-wide brand draft changes
- **When:** a Page autosaves
- **Then:** the brand draft is not implicitly activated or overwritten

## HW-020 — Ministry-controlled source without supplier lock-in

### HW-020-A — Expected journey

- **Given:** a new qualified agency is appointed
- **When:** it uses the ministry project and documented SDK
- **Then:** it can develop without the previous supplier controlling the repository

### HW-020-B — Adverse or boundary journey

- **Given:** source export is requested
- **When:** the handoff is explained
- **Then:** actual source/assets/config rights and platform dependencies are distinguished

## HW-021 — Dual-domain verified repository connection

### HW-021-A — Expected journey

- **Given:** an authorized ministry integration manager
- **When:** they complete verified selected-repository consent
- **Then:** only the intended scoped binding activates

### HW-021-B — Adverse or boundary journey

- **Given:** an attacker substitutes an installation ID or callback state
- **When:** connection completion runs
- **Then:** the binding is denied without repository disclosure

## HW-022 — Minimal provider permissions and stable binding

### HW-022-A — Expected journey

- **Given:** a repository is renamed without ownership change
- **When:** reconciliation verifies identity
- **Then:** display metadata changes without creating a new project

### HW-022-B — Adverse or boundary journey

- **Given:** the App can see an unbound repository
- **When:** a request selects it without authorization
- **Then:** it remains unavailable to that Asym project

## HW-023 — Authenticated durable Git events

### HW-023-A — Expected journey

- **Given:** a verified event for an active binding
- **When:** dispatch is temporarily down
- **Then:** the stored event is acknowledged and recovered later

### HW-023-B — Adverse or boundary journey

- **Given:** a duplicate or out-of-order event arrives after revocation
- **When:** the handler and worker process it
- **Then:** no duplicate effect or resurrected binding occurs

## HW-024 — Exact bounded source intake

### HW-024-A — Expected journey

- **Given:** a verified exact source revision
- **When:** intake completes
- **Then:** the build receives bounded credential-free bytes with provenance

### HW-024-B — Adverse or boundary journey

- **Given:** source contains an escaping symlink or unsupported external submodule
- **When:** intake validates it
- **Then:** capture fails explicitly rather than fetching arbitrary bytes or silently omitting files

## HW-025 — First-class local and Git development

### HW-025-A — Expected journey

- **Given:** a developer has the supported toolchain
- **When:** they clone and follow documented commands
- **Then:** they can run, test and submit a compatible package

### HW-025-B — Adverse or boundary journey

- **Given:** no Asym browser IDE or AI credential exists
- **When:** they complete development
- **Then:** no mandatory feature blocks the Git delivery path

## HW-026 — Independent isolated clean builds

### HW-026-A — Expected journey

- **Given:** source passes its own tests
- **When:** the platform builds and checks the exact capture
- **Then:** independent evidence binds the resulting artifact

### HW-026-B — Adverse or boundary journey

- **Given:** source modifies its tests to pass or runs a hostile install script
- **When:** the trusted pipeline qualifies it
- **Then:** independent checks and isolation remain effective

## HW-027 — Immutable admission and explicit first-party trust

### HW-027-A — Expected journey

- **Given:** complete evidence passes under a known policy
- **When:** the admission owner approves
- **Then:** an immutable verdict identifies exactly the admitted bytes

### HW-027-B — Adverse or boundary journey

- **Given:** repository administrators forge a passing status
- **When:** a Site attempts activation
- **Then:** the missing independent admission blocks it

## HW-028 — Separate server and editor builds

### HW-028-A — Expected journey

- **Given:** an admitted component has public and editor entrypoints
- **When:** both render the same contract fixture
- **Then:** content meaning and binding behavior agree

### HW-028-B — Adverse or boundary journey

- **Given:** client config imports a database or server secret module
- **When:** qualification examines the graph
- **Then:** the package fails admission

## HW-029 — Fixed complete authorized preview

### HW-029-A — Expected journey

- **Given:** an authorized user reviews a sealed candidate
- **When:** they navigate its Pages and links
- **Then:** all output comes from the exact candidate closure

### HW-029-B — Adverse or boundary journey

- **Given:** a target is missing or access expires
- **When:** the request is made
- **Then:** it fails privately rather than falling through to Live or causing real side effects

## HW-030 — Newer work does not rewrite reviewed work

### HW-030-A — Expected journey

- **Given:** a candidate pins revision A
- **When:** an editor later saves revision B
- **Then:** review remains A with B visibly excluded

### HW-030-B — Adverse or boundary journey

- **Given:** candidate A loses required eligibility
- **When:** a publisher attempts release
- **Then:** the safety/authority failure blocks A notwithstanding its earlier approval

## HW-031 — Package availability distinct from activation

### HW-031-A — Expected journey

- **Given:** a new admitted package is deployed into the registry
- **When:** no design activation occurs
- **Then:** current Sites retain their existing presentation

### HW-031-B — Adverse or boundary journey

- **Given:** a runtime lacks the selected required version
- **When:** activation is requested
- **Then:** readiness fails without substituting a different renderer

## HW-032 — Single ordinary public publication owner

### HW-032-A — Expected journey

- **Given:** an authorized compatible content edit
- **When:** the existing editorial policy permits publication
- **Then:** D1 activates one coherent successor without rebuilding application code

### HW-032-B — Adverse or boundary journey

- **Given:** two publishers race on the same expected head
- **When:** both attempt commit
- **Then:** only a valid winning transition commits; no mixed generation appears

## HW-033 — Complete-cohort design activation

### HW-033-A — Expected journey

- **Given:** all locale candidates are ready and current
- **When:** the design is activated
- **Then:** the exact complete cohort advances together

### HW-033-B — Adverse or boundary journey

- **Given:** a locale is enabled or a head changes during review
- **When:** activation runs
- **Then:** the stale cohort cannot partially activate

## HW-034 — Restore creates a new valid successor

### HW-034-A — Expected journey

- **Given:** a prior compatible design is requested
- **When:** restore proof passes
- **Then:** a new current-content successor is activated with retained history

### HW-034-B — Adverse or boundary journey

- **Given:** the previous design is now safety-ineligible
- **When:** restore is attempted
- **Then:** it is refused without weakening the adverse rule

## HW-035 — Exact-revision scheduled operations

### HW-035-A — Expected journey

- **Given:** an appointment selects revision A
- **When:** revision B is saved and the initiator later leaves routinely
- **Then:** only authorized A may execute under current organization rules

### HW-035-B — Adverse or boundary journey

- **Given:** an appointment is canceled or its safety authority invalidated
- **When:** an old delayed event arrives
- **Then:** it has no favorable public effect

## HW-036 — One durable execution and scheduling substrate

### HW-036-A — Expected journey

- **Given:** committed work awaits executor delivery
- **When:** the shared executor retries after its dedupe window
- **Then:** product receipt/claim still prevents duplicate effects

### HW-036-B — Adverse or boundary journey

- **Given:** a job requests full content or a secret in its envelope
- **When:** validation runs
- **Then:** dispatch is rejected before external transmission

## HW-037 — Versioned convergence and adverse priority

### HW-037-A — Expected journey

- **Given:** D1 commits but a derived projection lags
- **When:** staff inspect status
- **Then:** Published and convergence lag are distinct

### HW-037-B — Adverse or boundary journey

- **Given:** an old favorable update follows a current withdrawal
- **When:** a projection processes it
- **Then:** the adverse filter wins and forbidden content is not re-exposed

## HW-038 — Receipt-based retry and cancellation

### HW-038-A — Expected journey

- **Given:** a worker response is lost after a durable effect
- **When:** recovery runs
- **Then:** the original receipt is resolved without duplication

### HW-038-B — Adverse or boundary journey

- **Given:** a user cancels after activation already committed
- **When:** the UI receives the authoritative outcome
- **Then:** it reports the completed effect and offers its actual owner recovery, not false cancellation

## HW-039 — Exact tenant and per-operation capabilities

### HW-039-A — Expected journey

- **Given:** a permitted user has two Tenant assignments
- **When:** they deliberately select a scope
- **Then:** each tab/request binds its selected authorized scope

### HW-039-B — Adverse or boundary journey

- **Given:** caller input supplies another actor or Tenant grant
- **When:** the operation validates
- **Then:** it rejects the forged authority and leaks no existence

## HW-040 — Private Payload actor and service adapters

### HW-040-A — Expected journey

- **Given:** an authorized human content command
- **When:** the adapter invokes Payload
- **Then:** scoped access and lock/revision rules remain enforced

### HW-040-B — Adverse or boundary journey

- **Given:** the custom editor crashes or a direct provider URL is guessed
- **When:** the request is handled
- **Then:** only a safe product state appears; no provider fallback grants access

## HW-041 — Structural database integrity

### HW-041-A — Expected journey

- **Given:** a legitimate scoped relationship is written
- **When:** database and owner checks run
- **Then:** only the valid same-scope relationship commits

### HW-041-B — Adverse or boundary journey

- **Given:** an allowed row is updated into another Tenant or with forged ownership
- **When:** restricted-role SQL/API executes
- **Then:** constraints/policy deny the transformation

## HW-042 — Controlled integration disconnection and replacement

### HW-042-A — Expected journey

- **Given:** the ministry replaces its developer or source binding
- **When:** new verified binding is prepared before switch
- **Then:** source history and ongoing editorial content are preserved

### HW-042-B — Adverse or boundary journey

- **Given:** a stale event arrives after disconnection
- **When:** it requests build or activation
- **Then:** the old binding cannot regain authority

## HW-043 — Explicit safe migrations

### HW-043-A — Expected journey

- **Given:** a reviewed property migration is required
- **When:** the approved plan commits against expected revisions
- **Then:** private compatible successors preserve original history

### HW-043-B — Adverse or boundary journey

- **Given:** an editor changes a row after migration planning
- **When:** commit rechecks inputs
- **Then:** that conflict is surfaced rather than overwriting the edit

## HW-044 — Bounded resources and privacy-safe evidence

### HW-044-A — Expected journey

- **Given:** several tenants submit valid bounded builds
- **When:** capacity is exercised
- **Then:** fair queues and limits preserve unrelated safe service

### HW-044-B — Adverse or boundary journey

- **Given:** an oversized source or runaway script appears
- **When:** limits are reached
- **Then:** it is contained and diagnosed without leaking content or starving other tenants

## HW-045 — Retained artifacts and preview expiry

### HW-045-A — Expected journey

- **Given:** a preview expires
- **When:** cleanup executes
- **Then:** private access stops while required editorial/release state survives

### HW-045-B — Adverse or boundary journey

- **Given:** a supposedly unused artifact has incomplete use evidence
- **When:** cleanup considers removal
- **Then:** purge is blocked rather than trusting a stale zero count

## HW-046 — External coding-agent optionality

### HW-046-A — Expected journey

- **Given:** a developer uses an external agent on synthetic fixtures
- **When:** it submits source through Git
- **Then:** the normal tests and admission apply

### HW-046-B — Adverse or boundary journey

- **Given:** generated code requests publication or operational secrets
- **When:** the product boundary evaluates it
- **Then:** the request is denied regardless of agent instructions

## HW-047 — Proven staff and developer handoff

### HW-047-A — Expected journey

- **Given:** a nontechnical staff participant receives the site
- **When:** they create a Page and update content after a custom redesign
- **Then:** the declared tasks succeed without code or developer intervention

### HW-047-B — Adverse or boundary journey

- **Given:** a new developer has only the authorized project and docs
- **When:** they set it up
- **Then:** no internal Core source or hidden privileged credential is required

## HW-048 — Independent complete release evidence

### HW-048-A — Expected journey

- **Given:** all required implementation proofs pass with exact versions
- **When:** release review evaluates evidence
- **Then:** only the proven profile is activated

### HW-048-B — Adverse or boundary journey

- **Given:** a mandatory provider, migration or real-browser test is skipped
- **When:** release is evaluated
- **Then:** the dependent capability remains unqualified and the omission is not renamed a pass
