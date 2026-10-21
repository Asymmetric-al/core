# eve-dynamic-workflow-orchestration normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-633ed3e05aa32f483e7e"></a>

## Workflow Failures Escalate By App-Owned Risk

<!-- BEGIN CONTRACT {"id":"633ed3e05aa32f483e7e","name":"Workflow Failures Escalate By App-Owned Risk"} -->

Every workflow failure MUST be assigned an app-owned risk classification. Low-risk failures MAY stop only the
affected branch or use a declared bounded retry. Failures that invalidate dependent work MUST stop the
workflow for review. Suspicious behavior, protected-area contact, policy-bypass evidence, cross-scope access,
secret exposure, or unsafe tool behavior MUST pause the entire run before further action. Critical/systemic
failures MAY request the authorized #420 switch path; this capability MUST NOT create or bypass that path.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-bbad2272d1df15fc0fb7"></a>

## Dynamic Orchestration Preserves Delegation Caps And Shared-Context Safety

<!-- BEGIN CONTRACT {"id":"bbad2272d1df15fc0fb7","name":"Dynamic Orchestration Preserves Delegation Caps And Shared-Context Safety"} -->

Dynamic workflows MUST use only the real specialists and structured shared run context defined by #433. The
configured workflow-specific subagent count and depth caps MUST include root and nested delegation and MUST be
hard limits. Workflow steps MUST preserve schema validation, provenance, confidence, risk, evidence, and
unresolved disagreements; orchestration MUST NOT create an alternate ungoverned context channel.
[VERIFIED-REPO: openspec/changes/add-eve-subagent-catalog-shared-run-context/specs/eve-subagent-catalog-shared-run-context/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-aa7a5532629d42eddf95"></a>

## Dynamic Workflows Use Validated Typed Plans

<!-- BEGIN CONTRACT {"id":"aa7a5532629d42eddf95","name":"Dynamic Workflows Use Validated Typed Plans"} -->

Eve MUST represent every dynamic workflow as a versioned, typed plan that declares its run/workflow identity,
goal, authorized scope, step graph, registered specialist assignments, inputs, outputs, dependencies, retry
limits, failure policy, budget envelope, and #433 delegation cap. Deterministic validation MUST reject cycles,
missing dependencies, unknown specialists, schema violations, unbounded retries, cap violations, and work
outside the authorized scope before execution. Generated prose or code MUST NOT execute merely because a model
included it in the plan. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-ccea5a04b3fed3b61c78"></a>

## Every Workflow And Consequential Step Passes Current Governance

<!-- BEGIN CONTRACT {"id":"ccea5a04b3fed3b61c78","name":"Every Workflow And Consequential Step Passes Current Governance"} -->

The runtime MUST evaluate #418 release/emergency state and #420 relevant kill-switch state before every step,
retry, delegation, and resume, regardless of whether the operation is classified as consequential. The #418
consult gate MUST evaluate the workflow before start and MUST evaluate the full applicable action policy
immediately before each consequential effect using current #417 protected-area/source-of-truth policy, #421
model policy, #423 approval/budget/rate-limit state, and #426 verified identity/session ownership. Workflow
generation MUST NOT grant authority unavailable to the underlying action, and the most restrictive applicable
result MUST win. [VERIFIED-REPO: openspec/changes/add-eve-approval-budget-policy/specs/eve-approval-budget-policy/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-4254d29dc37e531e2335"></a>

## Dynamic Workflow Activity Is Auditable And Budget-Bounded

<!-- BEGIN CONTRACT {"id":"4254d29dc37e531e2335","name":"Dynamic Workflow Activity Is Auditable And Budget-Bounded"} -->

Eve MUST emit #419 audit records sufficient to reconstruct plan creation, deterministic validation, policy
decisions, step lifecycle, delegation, retries, budget consumption, failure classification, pause,
cancellation, and authorized resume. Every generation, step, retry, subagent, eval, and judge call MUST consume
the applicable #423 budget and rate limit. Exhaustion MUST stop or pause work; a workflow MUST NOT self-grant
an override. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-f09821f9feefb8b4d77e"></a>

## This Change Grants No New Product Or Production Authority

<!-- BEGIN CONTRACT {"id":"f09821f9feefb8b4d77e","name":"This Change Grants No New Product Or Production Authority"} -->

Issue #425 MUST continue to own sessions, workflow durability, and the workflow host; #424 MUST own retention and
redacted replay for persisted workflow audit artifacts; app-owned systems MUST continue to own governance
state; and #426 MUST continue to derive user/tenant scope from verified initiator context. The implementation
MAY add release-gated runtime code, governance metadata, and specialist-coordination tools required by this
capability, but MUST NOT modify canonical product/Inngest `workflow-orchestration`, deploy or activate Eve,
enable a provider, perform a production write, or grant authority beyond the underlying action.
[VERIFIED-REPO: openspec/project.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
