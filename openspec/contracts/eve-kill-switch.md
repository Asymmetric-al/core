# eve-kill-switch normative contract clauses

A section is binding only when the matching requirement unconditionally references
it. A proposed or historical section does not become accepted by residing here.
The reference, requirement identity, scenarios, and normal source-authority rules
form one contract. Preserve all clauses; see openspec/contracts/README.md.

<!-- prettier-ignore-start -->

<a id="contract-c292212c8a9e0b323d0a"></a>

## Kill Switches Are Externally And Admin Actuatable Before Runtime Integrations Exist

<!-- BEGIN CONTRACT {"id":"c292212c8a9e0b323d0a","name":"Kill Switches Are Externally And Admin Actuatable Before Runtime Integrations Exist"} -->

Each kill switch MUST be actuatable from the admin workspace by an authorized human, and this control path
MUST exist and be provable **before** Eve's runtime integrations exist, so that platform owners can stop Eve
automation ahead of any live surface. Actuation MUST be a deliberate human action performed as the current
authorized admin (or an authenticated external control caller), never selectable or triggerable by prompt,
model output, or tool input. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-90e97e4a31c05db8496d"></a>

## The Control Path Drives #418 State, Is Subordinate To #417, And Grants No New Authority

<!-- BEGIN CONTRACT {"id":"90e97e4a31c05db8496d","name":"The Control Path Drives #418 State, Is Subordinate To #417, And Grants No New Authority"} -->

The kill-switch control path MUST drive the emergency/kill-switch **state** that the #418 governance kernel
persists — #418 owns the state and the single consult gate, #420 owns the controls that set it. This change
MUST only restrict autonomy; it MUST NOT widen it, and clearing a switch MUST NOT bypass the #417
protected-area blocks, production-write limits, human-approval requirements, or the #418 release switch and
emergency-off precedence. The change itself MUST remain a spec/ADR + control-path contract and MUST NOT
introduce live autonomous behavior. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: openspec/project.md] [VERIFIED-REPO: AGENTS.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-d06cd73fb783cfaafd46"></a>

## Every Kill-Switch Change Creates An Audit Record

<!-- BEGIN CONTRACT {"id":"d06cd73fb783cfaafd46","name":"Every Kill-Switch Change Creates An Audit Record"} -->

Every kill-switch actuation — setting, clearing, or force-approval toggling, for any domain — MUST create an
audit record. The record MUST use the audit contract defined by #419 (actor, initiator, identity mode,
action, target switch/domain, result, and evidence summary) so that who changed which switch, when, and why
is reconstructable. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-a7291e04855fb8991e8f"></a>

## The Kill-Switch Suite Covers Every Autonomous Domain

<!-- BEGIN CONTRACT {"id":"a7291e04855fb8991e8f","name":"The Kill-Switch Suite Covers Every Autonomous Domain"} -->

Eve MUST provide a kill-switch suite whose switches cover, at least: **all automation** (a master pause),
**active runs** (stop in-flight work), **GitHub actions**, **production writes**, **sandbox networking**,
**dynamic workflows**, **model-policy changes**, and a **force-approval mode** that requires human approval
for every action. Each switch MUST be independently actuatable so that a narrow domain can be disabled
without disabling the whole system, and the master pause MUST be able to halt all domains at once.
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/01-eve-autonomous-operations-platform.md]
[VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->

<!-- prettier-ignore-start -->

<a id="contract-aba15acec1cbca6088e6"></a>

## Policy Checks Consume Kill-Switch State And Cannot Be Bypassed

<!-- BEGIN CONTRACT {"id":"aba15acec1cbca6088e6","name":"Policy Checks Consume Kill-Switch State And Cannot Be Bypassed"} -->

Every policy check that gates an autonomous action MUST consume the current kill-switch state and MUST block
the action when the relevant domain switch (or the master pause, or force-approval) forbids it. Policy checks
MUST read only the persisted app-owned switch state and MUST NOT be satisfiable by a prompt, model output,
tool input, or memory claim that a switch is off. When a switch blocks an action, the action MUST abort and
the block MUST be recorded. [VERIFIED-REPO: docs/prds/eve-autonomous-operations/02-implementation-plan.md]
[VERIFIED-REPO: openspec/specs/platform-boundaries/spec.md]

<!-- END CONTRACT -->

<!-- prettier-ignore-end -->
