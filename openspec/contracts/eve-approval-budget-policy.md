# eve-approval-budget-policy normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-02fc9f28920de90f0239"></a>

## Approval Policy Is Separated By Trust Zone

<!-- BEGIN CONTRACT {"id":"02fc9f28920de90f0239","name":"Approval Policy Is Separated By Trust Zone"} -->

Eve MUST evaluate approval policy by **trust zone**, with separate rules for at least three zones:
**engineering** actions, **product/admin** actions, and **memory** actions. A policy decision made for one
zone MUST NOT apply another zone's rules, and MUST NOT let a looser zone's allowance authorize an action that
belongs to a stricter zone. Each zone's rule set MUST be persisted app-owned policy, not derived at runtime
from a prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-56468369d5e5524835d2"></a>

## Hard Budgets And Rate Limits Are Enforced With An Audited Emergency Override

<!-- BEGIN CONTRACT {"id":"56468369d5e5524835d2","name":"Hard Budgets And Rate Limits Are Enforced With An Audited Emergency Override"} -->

Eve MUST enforce **hard budgets and rate limits** across at least model roles, subagents, dynamic workflows,
evals, judge models, and expensive features, so that autonomous runs cannot burn unbounded spend. When a
budget or rate limit is exceeded, the action MUST be **paused or denied** rather than allowed to overrun.
Budget and limit state MUST be persisted app-owned state consumed by the policy check. An **emergency
override** MUST be possible, but MUST require a dedicated permission and MUST create a #419 audit record;
overriding MUST NOT be selectable by a prompt, model output, or tool input.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-31f1d111f9189e6ce177"></a>

## Policy Decisions Are App-Owned, Audited, And Grant No New Authority

<!-- BEGIN CONTRACT {"id":"31f1d111f9189e6ce177","name":"Policy Decisions Are App-Owned, Audited, And Grant No New Authority"} -->

Every approval and budget decision MUST be consumed by the #418 single consult gate, MUST read only persisted
app-owned policy/budget/limit state, and MUST emit a #419 audit record identifying the actor/initiator, the
trust zone, the write class or budget, the decision (allow, deny, pause, or override), and the reason. This
change MUST only add gates and restrictions; it MUST NOT widen autonomy, MUST NOT bypass #417
protected-area/approval limits or #418 emergency-off precedence, and MUST remain a policy/control contract
with no live autonomous behavior. Where kill-switch state and budget/approval policy disagree, the more
restrictive result MUST win. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-057353bcbc1139e44481"></a>

## Operational Production Writes Are Allowed Under Policy

<!-- BEGIN CONTRACT {"id":"057353bcbc1139e44481","name":"Operational Production Writes Are Allowed Under Policy"} -->

Eve MUST be able to perform **operational production writes** under policy — at least tasks, notes, labels,
internal statuses, workflow metadata, memory, model settings, and review artifacts — so that it can do
operational work without a human approval for every routine write. These writes MUST still pass the
applicable trust-zone policy, the #418 consult gate, and #420 kill-switch state (for example the
production-writes switch), and MUST emit a #419 audit record.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-1b83a11d67bf2b511307"></a>

## Sensitive And Business-Data Writes Are Blocked Without Stricter Approval

<!-- BEGIN CONTRACT {"id":"1b83a11d67bf2b511307","name":"Sensitive And Business-Data Writes Are Blocked Without Stricter Approval"} -->

Eve MUST be blocked from broad **customer, donor, payment, identity, tenant-ownership, auth, secret,
migration, and destructive production writes** without **stricter approval**. These writes are a distinct,
higher-trust class from operational production writes and MUST NOT be authorized by an operational-write
allowance. The policy MUST require the stricter zone's explicit approval before any such write, and MUST
default to deny when the write class is uncertain.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
