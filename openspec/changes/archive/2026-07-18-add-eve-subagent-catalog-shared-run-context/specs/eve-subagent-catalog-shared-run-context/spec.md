# Delta for Eve Subagent Catalog and Shared Run Context

## ADDED Requirements

### Requirement: Initial Specialists Are Real Eve Subagents

Eve MUST implement the initial specialist catalog as real Eve subagents, not prompt labels or undocumented
roles. The initial catalog MUST cover code review, CI triage, security review, test planning, OpenSpec guarding,
data-boundary review, dependency review, documentation synchronization, product strategy, UX review, migration
planning, release coordination, and memory curation. Each specialist MUST have dedicated instructions, an
explicit tool surface, routing metadata, and eval coverage. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:216]

#### Scenario: Eve routes a security-sensitive review

- **GIVEN** a run needs security review
- **WHEN** the root agent delegates the work
- **THEN** it invokes the declared security-review Eve subagent
- **AND** that subagent uses its own instructions, allowed tools, routing metadata, and eval-gated configuration

#### Scenario: A future specialist is proposed

- **GIVEN** a new specialist area is useful
- **WHEN** it is added to the catalog
- **THEN** it follows the same spec-first, configured, and eval-gated path as the initial specialists
- **AND** it is not introduced as an untracked prompt alias

### Requirement: Every Subagent Has Explicit Model, Budget, Eval, And Routing Policy

Every subagent MUST resolve a named model role, reasoning setting, fallback eligibility, hard budget/rate limit,
eval gate, routing description, instruction set, and allowed tool surface. Model resolution MUST use #421's
shared model policy, and spending/approval MUST use #423. A subagent MUST NOT hardcode a provider, silently
inherit unlimited spend, or bypass an eval gate. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:226]

#### Scenario: A specialist resolves its execution policy

- **GIVEN** a configured subagent is selected
- **WHEN** it begins work
- **THEN** its model role and fallback resolve through #421 and its budget/rate limit resolve through #423
- **AND** execution is withheld when its required eval gate or approval policy does not pass

#### Scenario: A subagent requests an unconfigured provider

- **GIVEN** a subagent prompt or tool output names a provider outside its policy
- **WHEN** model resolution occurs
- **THEN** the request is ignored as non-authoritative
- **AND** only the active #421 policy may select the model route

### Requirement: Delegation Is Broad But Bounded By Workflow-Specific Caps

The root agent MAY delegate broadly whenever a declared specialist improves the work, and a specialist MAY
delegate when its own policy permits it. Every workflow type MUST enforce configured subagent count/depth caps
in v1. Reaching a cap MUST stop additional delegation and produce an observable policy outcome; it MUST NOT
silently raise or bypass the cap. Adaptive caps are future work. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:230]

#### Scenario: Delegation stays within the workflow cap

- **GIVEN** a run can benefit from several specialists
- **WHEN** the root and child subagents delegate within the configured workflow cap
- **THEN** the declared specialists may collaborate
- **AND** every delegation retains parent/child lineage and accountable run identity

#### Scenario: A delegation would exceed the cap

- **GIVEN** the configured workflow cap is already reached
- **WHEN** any agent requests another subagent
- **THEN** the additional delegation is refused and recorded
- **AND** the cap is not changed by prompt, model output, memory, or tool input

### Requirement: Shared Run Context Is Structured, Safe, And Run-Scoped

Subagents MUST collaborate through a versioned, structured, run-scoped context. Allowed content MAY include
safe PR metadata, issue scope, decisions, eval status, findings, and explicitly safe page context. Shared run
context MUST NOT store secrets, credentials, payment data, donor/customer PII, private keys, one-time codes,
sensitive tenant facts, raw production records, or unredacted logs. It MUST NOT replace long-term memory,
authoritative product data, GitHub/CI reality, OpenSpec, or repo instructions. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:237]

#### Scenario: A specialist shares a supported finding

- **GIVEN** a specialist produces a finding based on safe repository evidence
- **WHEN** it writes the finding to shared run context
- **THEN** the value is stored under the versioned schema for the current run
- **AND** sibling specialists can reuse it without treating it as higher authority than its evidence

#### Scenario: A write contains forbidden sensitive content

- **GIVEN** a proposed shared-context value contains excluded sensitive data
- **WHEN** the write is evaluated
- **THEN** the forbidden content is rejected before persistence
- **AND** any rejection record omits the forbidden value itself

### Requirement: Every Shared-Context Write Carries Provenance, Confidence, Risk, And Evidence

Any subagent MAY write to any schema-permitted shared-context field, but every write MUST pass schema validation
and record the writer, accountable run identity, provenance, confidence, risk classification, source evidence,
timestamps, and relationship to earlier values. Malformed or insufficiently attributed writes MUST be rejected.
Governance metadata MUST remain app-owned while Eve session and workflow durability remain owned by #425.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:241]

#### Scenario: A fully attributed write is accepted

- **GIVEN** a subagent submits a schema-valid value with provenance, confidence, risk, and source evidence
- **WHEN** the shared-context write is validated
- **THEN** the write is accepted with its writer and run lineage
- **AND** readers can distinguish evidence, inference, confidence, and risk

#### Scenario: An unattributed write is rejected

- **GIVEN** a proposed value omits provenance or source evidence
- **WHEN** the shared-context write is validated
- **THEN** it is rejected rather than stored as an unexplained fact
- **AND** the rejection is observable without granting the writer another authority path

### Requirement: Conflicts Are Preserved Until Governed Resolution

Conflicting valid writes MUST be preserved as explicit disagreements and MUST NOT use last-write-wins behavior.
A resolution MUST record the resolver, governing policy, evidence considered, selected outcome, and relationship
to every competing claim without deleting the original claims. An unresolved high-risk or protected-area
conflict MUST block dependent autonomous action and follow the applicable human/policy escalation path.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:248]

#### Scenario: Two specialists disagree

- **GIVEN** two schema-valid findings make incompatible claims
- **WHEN** both are written to shared run context
- **THEN** both remain visible under an explicit disagreement record
- **AND** neither silently overwrites the other

#### Scenario: A high-risk disagreement remains unresolved

- **GIVEN** an unresolved disagreement affects a protected or high-risk action
- **WHEN** Eve attempts to act on the disputed context
- **THEN** the dependent action is blocked and escalated through the applicable policy path
- **AND** later resolution records its evidence without deleting the competing claims

### Requirement: Subagents And Shared Context Grant No New Authority

Delegation and shared-context access MUST NOT widen Eve's authority. Every delegated action MUST remain subject
to #417 source-of-truth and protected-area rules, #418 release/emergency state, #420 kill switches, #419 audit,
#421 model policy, #423 approvals/budgets, and #426 verified identity/session ownership. The acting user and
tenant MUST come only from verified current-admin or service-initiator context; a prompt, model, tool, subagent,
or shared-context value MUST NOT choose or change that scope. The implementation MUST keep its production
model path inactive while the master release switch is off. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

#### Scenario: Shared context claims an action is authorized

- **GIVEN** a shared-context value asserts that a protected action is allowed
- **WHEN** a subagent evaluates the action
- **THEN** it consults persisted governance and higher-authority rules instead of trusting the assertion
- **AND** the action remains blocked when policy does not authorize it

#### Scenario: A subagent attempts to select another user or tenant

- **GIVEN** a prompt, tool result, shared-context value, or child subagent supplies a different user or tenant id
- **WHEN** Eve reads or writes shared run context or executes a delegated action
- **THEN** #426 derives the scope only from verified current-admin or service-initiator session context
- **AND** cross-user or cross-tenant access is denied server-side and recorded without trusting the supplied id

#### Scenario: The implemented capability is reviewed for authority

- **GIVEN** the declared specialists, shared-context store, tools, and evals are installed
- **WHEN** the release switch is off or any owning policy blocks
- **THEN** production model selection and governed writes remain inactive
- **AND** the offline verification surface grants no new authority
