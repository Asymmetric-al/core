# eve-model-policy normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-ead64c7efa1319755b38"></a>

## Hard Budgets And Rate Limits Apply Per Role And Subagent With Audited Emergency Override

<!-- BEGIN CONTRACT {"id":"ead64c7efa1319755b38","name":"Hard Budgets And Rate Limits Apply Per Role And Subagent With Audited Emergency Override"} -->

The model policy MUST carry **hard budgets and rate limits** that apply to roles, subagents, dynamic
workflows, evals, judge models, and expensive features, so that autonomous runs, subagents, evals, and judges
cannot burn unbounded spend. An **emergency override** of a budget or rate limit MUST require the dedicated
permission and MUST be audited. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:209]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:483]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-fcb1b5e1220d48c72efc"></a>

## Model Policy Consumes Kill-Switch State, Is Subordinate To #417/#418, And Grants No New Authority

<!-- BEGIN CONTRACT {"id":"fcb1b5e1220d48c72efc","name":"Model Policy Consumes Kill-Switch State, Is Subordinate To #417/#418, And Grants No New Authority"} -->

The model-policy capability MUST **consume the #420 model-policy-changes kill-switch state** from the #418
governance kernel: when that switch (or the master pause) forbids model-policy changes, drafting, activation,
and provider changes MUST be blocked, reading only persisted app-owned state and never a prompt/model/tool
claim that a switch is off. This change MUST only add a governed policy surface; it MUST NOT widen Eve's
authority, and no model-policy state may bypass #417's protected-area blocks, production-write limits, or
human-approval requirements, nor #418's release-switch/emergency-off precedence. The implementation MUST remain
an app-owned control plane and MUST NOT introduce live provider calls or enable the Eve release gate. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:185]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-25fa52e79f797d7e1508"></a>

## The Shared Model Policy Uses Named Roles And Per-Subagent Settings

<!-- BEGIN CONTRACT {"id":"25fa52e79f797d7e1508","name":"The Shared Model Policy Uses Named Roles And Per-Subagent Settings"} -->

Eve MUST express model choice as a **shared model policy of named roles** (for example an agent role, a
review role, a judge role), not as a single hard-coded model, so that Eve, admin AI features, evals, and
external coding-agent guidance resolve models through consistent roles. The policy MUST support **per-subagent
overrides** (a subagent MAY carry its own model role, reasoning setting, fallback, budget, and eval gate). V1
MUST use **one platform-wide policy**, and the schema MUST leave room for tenant-specific overrides later
without requiring them now. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:187]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:471]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:480]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-992bd57322898ad56815"></a>

## Model-Policy Changes Are Draftable, Eval-Gated, Activatable, Rollback-Capable, And Audited

<!-- BEGIN CONTRACT {"id":"992bd57322898ad56815","name":"Model-Policy Changes Are Draftable, Eval-Gated, Activatable, Rollback-Capable, And Audited"} -->

Every model-policy change MUST move through a lifecycle: an authorized admin **drafts** it, it is **evaluated**
against an eval gate, it may be **activated** only if the eval gate passes, and any activation MUST be
**rollback-capable** to the previously active policy. Every draft, activation, rollback, and emergency
override MUST **emit a #419 audit record** (actor, identity mode, action, target, result, evidence summary) so
that model changes cannot silently weaken Eve. Activation MUST be blocked if the eval gate has not passed.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:194]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:477]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md:113]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eafb92927c042b2d0515"></a>

## Gateway Is The Primary Route And Direct Providers Are Controlled, Non-Default Fallbacks

<!-- BEGIN CONTRACT {"id":"eafb92927c042b2d0515","name":"Gateway Is The Primary Route And Direct Providers Are Controlled, Non-Default Fallbacks"} -->

The shared model policy MUST use the **Vercel AI Gateway as the primary model route**. Any **direct provider**
— including an external partner inference gateway — MUST be expressible only as a **controlled fallback**: it
MUST NOT be the default or primary route, MUST be eligible only when an authorized admin has explicitly
configured it and its eval gate has passed, and MUST be **revocable at any time** (by policy edit or by the
#420 model-policy kill switch) without touching Eve runtime code. A direct provider MUST NOT become active
implicitly, by prompt, by model output, or by tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:205]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:468]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-eaa3b6f695977ce66e4b"></a>

## Model-Policy Edits Require A Dedicated AI-Settings Permission

<!-- BEGIN CONTRACT {"id":"eaa3b6f695977ce66e4b","name":"Model-Policy Edits Require A Dedicated AI-Settings Permission"} -->

Editing the model policy MUST be guarded by a **dedicated AI-settings permission** that is distinct from
general admin access, so that ordinary admin authority does not imply model authority. Edits MUST be made from
Mission Control by a verified human holding that permission; policy edits MUST NEVER be selectable or
triggerable by prompt, model output, or tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:191]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:197]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md:474]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
