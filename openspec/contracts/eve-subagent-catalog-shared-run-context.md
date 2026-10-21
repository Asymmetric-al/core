# eve-subagent-catalog-shared-run-context normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-8ef4a98c4ece9f636ff0"></a>

## Every Shared-Context Write Carries Provenance, Confidence, Risk, And Evidence

<!-- BEGIN CONTRACT {"id":"8ef4a98c4ece9f636ff0","name":"Every Shared-Context Write Carries Provenance, Confidence, Risk, And Evidence"} -->

Any subagent MAY write to any schema-permitted shared-context field, but every write MUST pass schema validation
and record the writer, accountable run identity, provenance, confidence, risk classification, source evidence,
timestamps, and relationship to earlier values. Malformed or insufficiently attributed writes MUST be rejected.
Governance metadata MUST remain app-owned while Eve session and workflow durability remain owned by #425.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:241]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-146bef365929889a3d03"></a>

## Shared Run Context Is Structured, Safe, And Run-Scoped

<!-- BEGIN CONTRACT {"id":"146bef365929889a3d03","name":"Shared Run Context Is Structured, Safe, And Run-Scoped"} -->

Subagents MUST collaborate through a versioned, structured, run-scoped context. Allowed content MAY include
safe PR metadata, issue scope, decisions, eval status, findings, and explicitly safe page context. Shared run
context MUST NOT store secrets, credentials, payment data, donor/customer PII, private keys, one-time codes,
sensitive tenant facts, raw production records, or unredacted logs. It MUST NOT replace long-term memory,
authoritative product data, GitHub/CI reality, OpenSpec, or repo instructions. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:237]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-b5fbd5054f2fb1325d78"></a>

## Initial Specialists Are Real Eve Subagents

<!-- BEGIN CONTRACT {"id":"b5fbd5054f2fb1325d78","name":"Initial Specialists Are Real Eve Subagents"} -->

Eve MUST implement the initial specialist catalog as real Eve subagents, not prompt labels or undocumented
roles. The initial catalog MUST cover code review, CI triage, security review, test planning, OpenSpec guarding,
data-boundary review, dependency review, documentation synchronization, product strategy, UX review, migration
planning, release coordination, and memory curation. Each specialist MUST have dedicated instructions, an
explicit tool surface, routing metadata, and eval coverage. [VERIFIED-REPO:
docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:216]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-8d72c12db267f42edf95"></a>

## Subagents And Shared Context Grant No New Authority

<!-- BEGIN CONTRACT {"id":"8d72c12db267f42edf95","name":"Subagents And Shared Context Grant No New Authority"} -->

Delegation and shared-context access MUST NOT widen Eve's authority. Every delegated action MUST remain subject
to #417 source-of-truth and protected-area rules, #418 release/emergency state, #420 kill switches, #419 audit,
#421 model policy, #423 approvals/budgets, and #426 verified identity/session ownership. The acting user and
tenant MUST come only from verified current-admin or service-initiator context; a prompt, model, tool, subagent,
or shared-context value MUST NOT choose or change that scope. The implementation MUST keep its production
model path inactive while the master release switch is off. [VERIFIED-REPO: AGENTS.md]
[VERIFIED-REPO: openspec/project.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-70fe0ecf9bb0fa32faf8"></a>

## Conflicts Are Preserved Until Governed Resolution

<!-- BEGIN CONTRACT {"id":"70fe0ecf9bb0fa32faf8","name":"Conflicts Are Preserved Until Governed Resolution"} -->

Conflicting valid writes MUST be preserved as explicit disagreements and MUST NOT use last-write-wins behavior.
A resolution MUST record the resolver, governing policy, evidence considered, selected outcome, and relationship
to every competing claim without deleting the original claims. An unresolved high-risk or protected-area
conflict MUST block dependent autonomous action and follow the applicable human/policy escalation path.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:248]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
